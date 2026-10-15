import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { formKeys, LEAD_SUBMISSION_SCHEMA_VERSION, locales } from "@ola/shared";

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: number[];
  parameters: Record<string, unknown>;
  [key: string]: unknown;
}
export type WorkflowConnections = Record<
  string,
  { main: { node: string; type: "main"; index: number }[][] }
>;
export interface PreparedWorkflow {
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  settings: Record<string, unknown>;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function webhookNode(value: unknown): value is WorkflowNode {
  return (
    record(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    value.type === "n8n-nodes-base.webhook" &&
    typeof value.typeVersion === "number" &&
    Array.isArray(value.position) &&
    value.position.every((v) => typeof v === "number") &&
    record(value.parameters) &&
    value.parameters.httpMethod === "POST" &&
    typeof value.parameters.path === "string"
  );
}
export type DeploymentPolicy =
  { kind: "production" } | { kind: "staging"; localOrigins: readonly string[] };

function localOrigin(value: string): URL {
  const url = new URL(value);
  if (
    url.protocol !== "http:" ||
    !["localhost", "127.0.0.1"].includes(url.hostname) ||
    !/^http:\/\/(?:localhost|127\.0\.0\.1):[1-9][0-9]*$/.test(value) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "Lokalny staging wymaga dokładnego origin http://localhost:PORT lub http://127.0.0.1:PORT.",
    );
  }
  return url;
}

export function prepareTurnstileWorkflow(input: {
  deployment: DeploymentPolicy;
  snapshot: unknown;
  allowedHostnames: string[];
  credential: { id: string; name: string };
  replayCredential: { id: string; name: string };
}): PreparedWorkflow {
  const {
    snapshot,
    allowedHostnames,
    credential,
    replayCredential,
    deployment,
  } = input;
  if (
    !record(snapshot) ||
    typeof snapshot.name !== "string" ||
    !Array.isArray(snapshot.nodes) ||
    snapshot.nodes.length !== 1 ||
    !webhookNode(snapshot.nodes[0]) ||
    !record(snapshot.connections) ||
    Object.keys(snapshot.connections).length !== 0 ||
    !record(snapshot.settings)
  ) {
    throw new Error(
      "Oczekiwano niezmienionego workflow z jednym webhookiem POST.",
    );
  }
  if (
    !allowedHostnames.length ||
    allowedHostnames.some(
      (host) =>
        !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host) ||
        host.endsWith(".localhost") ||
        host.endsWith(".local"),
    ) ||
    !credential.id.trim() ||
    !credential.name.trim() ||
    !record(replayCredential) ||
    typeof replayCredential.id !== "string" ||
    typeof replayCredential.name !== "string" ||
    !replayCredential.id.trim() ||
    !replayCredential.name.trim() ||
    replayCredential.id.trim() === credential.id.trim()
  ) {
    throw new Error(
      "Wymagane jawne publiczne hostnames i identyfikator credential; bez sekretu.",
    );
  }
  if (LEAD_SUBMISSION_SCHEMA_VERSION !== 3) {
    throw new Error("Generator wymaga kontraktu zgłoszenia w wersji 3.");
  }
  const localUrls =
    deployment.kind === "staging"
      ? deployment.localOrigins.map(localOrigin)
      : [];
  const sourceOrigins = [
    ...new Set([
      ...allowedHostnames.map((host) => `https://${host}`),
      ...localUrls.map((url) => url.origin),
    ]),
  ];
  const verificationHostnames = [
    ...new Set([...allowedHostnames, ...localUrls.map((url) => url.hostname)]),
  ];
  const sourceCheck = localUrls.length
    ? `${JSON.stringify(sourceOrigins)}.some(origin => body.source.startsWith(origin + '/'))`
    : `${JSON.stringify(allowedHostnames)}.some(host => body.source.startsWith('https://' + host + '/'))`;
  const webhook = snapshot.nodes[0];
  const options = record(webhook.parameters.options)
    ? webhook.parameters.options
    : {};
  const node = (
    name: string,
    type: string,
    typeVersion: number,
    parameters: Record<string, unknown>,
    x: number,
  ): WorkflowNode => ({
    id: `ola-turnstile-${name.toLowerCase().replaceAll(" ", "-")}`,
    name,
    type: `n8n-nodes-base.${type}`,
    typeVersion,
    position: [x, 0],
    parameters,
  });
  const validation = `
const body = $input.first().json.body;
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;
const date = (v) => text(v, 64) && Number.isFinite(Date.parse(v));
const fail = () => [{ json: { valid: false, statusCode: 400, response: { error: 'invalid_submission' } } }];
if (!object(body) || body.schemaVersion !== ${LEAD_SUBMISSION_SCHEMA_VERSION} ||
 !${JSON.stringify(formKeys)}.includes(body.formKey) ||
 !${JSON.stringify(locales)}.includes(body.language) ||
 !text(body.submissionId, 128) || !text(body.formVersion, 64) ||
 !text(body.source, 2048) || !date(body.submittedAt) ||
 !text(body.turnstileToken, 2048) || !object(body.fields) ||
 Object.keys(body.fields).length > 32 || Object.entries(body.fields).some(([k,v]) =>
 !text(k,64) || typeof v !== 'string' || v.length > 10000) ||
 !Array.isArray(body.consents) || body.consents.length > 16 ||
 body.consents.some(c => !object(c) || !text(c.id,128) || !text(c.version,64) || !date(c.acceptedAt))) return fail();
if (!${sourceCheck}) return fail();
return [{ json: { valid: true, formKey: body.formKey, turnstileToken: body.turnstileToken } }];`;
  const verdict = `
const result = $input.first().json;
const lead = $('Validate lead').first().json;
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
let statusCode = 503;
let response = { error: 'verification_unavailable' };
if (object(result) && result.statusCode === 200 && object(result.body) && typeof result.body.success === 'boolean') {
 const verified = result.body;
 if (verified.success === true && verified.action === lead.formKey &&
 ${JSON.stringify(verificationHostnames)}.includes(verified.hostname)) {
  const timestamp = verified.challenge_ts;
  const parsed = typeof timestamp === 'string' && /^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d{1,3})?Z$/.test(timestamp) ? Date.parse(timestamp) : NaN;
  const normalized = Number.isFinite(parsed) ? new Date(parsed).toISOString() : '';
  const expected = typeof timestamp === 'string' ? timestamp.replace(/(?:\\.(\\d{1,3}))?Z$/, (_, fraction = '') => '.' + fraction.padEnd(3, '0') + 'Z') : '';
  if (normalized && normalized === expected) {
   const age = Date.now() - parsed;
   if (age >= -30000 && age <= 300000) return [{ json: { verified: true } }];
   statusCode = 403; response = { error: 'verification_failed' };
  }
 } else { statusCode = 403; response = { error: 'verification_failed' }; }
}
return [{ json: { statusCode, response } }];`;
  const replaySchema = `ola_replay_${deployment.kind}`;
  const claimQuery = `WITH claimed AS (
  INSERT INTO ${replaySchema}.used_tokens (token_digest)
  VALUES ($1::text)
  ON CONFLICT (token_digest) DO NOTHING
  RETURNING 1
)
SELECT EXISTS (SELECT 1 FROM claimed) AS claimed;`;
  const claimVerdict = `
const rows = $input.all();
let statusCode = 503;
let response = { error: 'verification_unavailable' };
if (rows.length === 1 && rows[0].json !== null && typeof rows[0].json === 'object' &&
 !Array.isArray(rows[0].json) && Object.keys(rows[0].json).length === 1 && typeof rows[0].json.claimed === 'boolean') {
 statusCode = rows[0].json.claimed === true ? 200 : 403;
 response = statusCode === 200 ? { message: 'Workflow was started' } : { error: 'verification_failed' };
}
return [{ json: { statusCode, response } }];`;
  const nodes = [
    {
      ...webhook,
      parameters: {
        ...webhook.parameters,
        responseMode: "responseNode",
        options: {
          ...options,
          allowedOrigins: sourceOrigins.join(","),
        },
      },
    },
    node(
      "Validate lead",
      "code",
      2,
      { mode: "runOnceForAllItems", jsCode: validation },
      260,
    ),
    node(
      "Valid lead",
      "if",
      2.2,
      {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict",
            version: 2,
          },
          conditions: [
            {
              id: "ola-valid",
              leftValue: "={{ $json.valid }}",
              rightValue: true,
              operator: {
                type: "boolean",
                operation: "true",
                singleValue: true,
              },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      520,
    ),
    {
      ...node(
        "Verify Turnstile",
        "httpRequest",
        4.2,
        {
          method: "POST",
          url: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
          authentication: "genericCredentialType",
          genericAuthType: "httpCustomAuth",
          sendBody: true,
          specifyBody: "json",
          jsonBody: "={{ { response: $json.turnstileToken } }}",
          options: {
            timeout: 10000,
            redirect: { redirect: { followRedirects: false } },
            response: {
              response: { responseFormat: "json", fullResponse: true },
            },
          },
        },
        780,
      ),
      credentials: { httpCustomAuth: credential },
      onError: "continueRegularOutput",
    },
    node(
      "Check verification",
      "code",
      2,
      { mode: "runOnceForAllItems", jsCode: verdict },
      1040,
    ),
    node(
      "Verified token",
      "if",
      2.2,
      {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict",
            version: 2,
          },
          conditions: [
            {
              id: "ola-verified",
              leftValue: "={{ $json.verified === true }}",
              rightValue: true,
              operator: {
                type: "boolean",
                operation: "true",
                singleValue: true,
              },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
      1300,
    ),
    node(
      "Hash verified token",
      "crypto",
      1,
      {
        action: "hash",
        type: "SHA256",
        binaryData: false,
        value: "={{ $('Validate lead').first().json.turnstileToken }}",
        dataPropertyName: "tokenDigest",
        encoding: "hex",
      },
      1560,
    ),
    node(
      "Keep ledger input",
      "set",
      3.4,
      {
        assignments: {
          assignments: [
            {
              id: "ola-token-digest",
              name: "tokenDigest",
              value: "={{ $json.tokenDigest }}",
              type: "string",
            },
          ],
        },
        includeOtherFields: false,
        options: {},
      },
      1690,
    ),
    {
      ...node(
        "Claim verified token",
        "postgres",
        2.6,
        {
          operation: "executeQuery",
          query: claimQuery,
          options: {
            queryReplacement: "={{ [$json.tokenDigest] }}",
            queryBatching: "independently",
            connectionTimeout: 10,
          },
        },
        1820,
      ),
      credentials: { postgres: replayCredential },
      onError: "continueRegularOutput",
      retryOnFail: false,
    },
    node(
      "Decide claim",
      "code",
      2,
      { mode: "runOnceForAllItems", jsCode: claimVerdict },
      2080,
    ),
    node(
      "Respond",
      "respondToWebhook",
      1.4,
      {
        respondWith: "json",
        responseBody: "={{ $json.response }}",
        options: { responseCode: "={{ $json.statusCode }}" },
      },
      2340,
    ),
  ];
  const link = (name: string) => [
    { node: name, type: "main" as const, index: 0 },
  ];
  return {
    name: snapshot.name,
    nodes,
    connections: {
      [webhook.name]: { main: [link("Validate lead")] },
      "Validate lead": { main: [link("Valid lead")] },
      "Valid lead": { main: [link("Verify Turnstile"), link("Respond")] },
      "Verify Turnstile": { main: [link("Check verification")] },
      "Check verification": { main: [link("Verified token")] },
      "Verified token": {
        main: [link("Hash verified token"), link("Respond")],
      },
      "Hash verified token": { main: [link("Keep ledger input")] },
      "Keep ledger input": { main: [link("Claim verified token")] },
      "Claim verified token": { main: [link("Decide claim")] },
      "Decide claim": { main: [link("Respond")] },
    },
    settings: {
      ...snapshot.settings,
      saveDataSuccessExecution: "none",
      saveDataErrorExecution: "none",
      saveExecutionProgress: false,
      saveManualExecutions: false,
    },
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const [
    snapshotPath,
    outputPath,
    environment,
    hostnames,
    credentialId,
    credentialName,
    replayCredentialId,
    replayCredentialName,
    ...flags
  ] = process.argv.slice(2);
  if (
    !snapshotPath ||
    !outputPath ||
    (environment !== "production" && environment !== "staging") ||
    !hostnames ||
    !credentialId ||
    !credentialName ||
    !replayCredentialId ||
    !replayCredentialName ||
    (environment === "production" && flags.length > 0) ||
    flags.length % 2 !== 0 ||
    flags.some((value, index) => index % 2 === 0 && value !== "--local-origin")
  ) {
    throw new Error(
      "Użycie: tsx scripts/turnstile-workflow.ts SNAPSHOT OUTPUT ENVIRONMENT(production|staging) HOST[,HOST] CREDENTIAL_ID CREDENTIAL_NAME REPLAY_CREDENTIAL_ID REPLAY_CREDENTIAL_NAME [--local-origin http://127.0.0.1:PORT]. Generuje plik; nie zapisuje do n8n.",
    );
  }
  const snapshot: unknown = JSON.parse(await readFile(snapshotPath, "utf8"));
  const prepared = prepareTurnstileWorkflow({
    snapshot,
    deployment:
      environment === "staging"
        ? {
            kind: "staging",
            localOrigins: flags.filter((_, index) => index % 2 === 1),
          }
        : { kind: "production" },
    allowedHostnames: hostnames.split(","),
    credential: { id: credentialId, name: credentialName },
    replayCredential: { id: replayCredentialId, name: replayCredentialName },
  });
  await writeFile(outputPath, `${JSON.stringify(prepared, null, 2)}\n`, {
    flag: "wx",
  });
}

import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LEAD_SUBMISSION_SCHEMA_VERSION } from "@ola/shared";
import {
  prepareTurnstileWorkflow,
  type WorkflowNode,
  type PreparedWorkflow,
  type DeploymentPolicy,
} from "../../scripts/turnstile-workflow";

const host = "aleksandraolesiewicz.com";
const snapshot = {
  name: "formularz Ola",
  active: true,
  pinData: { private: "discard" },
  staticData: { private: "discard" },
  nodes: [
    {
      id: "existing-webhook",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2.1,
      position: [0, 0],
      webhookId: "keep-path",
      parameters: {
        httpMethod: "POST",
        path: "keep-path",
        options: { rawBody: false },
      },
    },
  ],
  connections: {},
  settings: {
    executionOrder: "v1",
    callerPolicy: "workflowsFromSameOwner",
    saveDataSuccessExecution: "all",
  },
};
const prepared = (deployment: DeploymentPolicy = { kind: "production" }) =>
  prepareTurnstileWorkflow({
    deployment,
    snapshot,
    allowedHostnames: [host],
    credential: { id: "INVALID_NOT_CONFIGURED", name: "Ola Turnstile" },
    replayCredential: { id: "test-postgres", name: "Ola replay" },
  });
const submission = () => ({
  schemaVersion: LEAD_SUBMISSION_SCHEMA_VERSION,
  submissionId: "test-local-only",
  formKey: "contact",
  formVersion: "1",
  language: "pl",
  source: `https://${host}/kontakt/`,
  submittedAt: "2026-10-14T10:00:00Z",
  fields: { email: "local@example.invalid", message: "Test lokalny" },
  consents: [
    { id: "contact_notice", version: "1", acceptedAt: "2026-10-14T10:00:00Z" },
  ],
  turnstileToken: "local-stub-token",
});
const approved = () => ({
  statusCode: 200,
  body: {
    success: true,
    hostname: host,
    action: "contact",
    challenge_ts: new Date().toISOString(),
  },
});
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function expression(
  value: unknown,
  json: Record<string, unknown>,
  saved = new Map<string, Record<string, unknown>>(),
): unknown {
  if (
    typeof value !== "string" ||
    !value.startsWith("={{ ") ||
    !value.endsWith(" }}")
  )
    throw new Error("Expected expression");
  return new Function("$json", "$", `return (${value.slice(4, -3)});`)(
    json,
    (name: string) => ({ first: () => ({ json: saved.get(name) }) }),
  );
}
async function runGraph(
  body: unknown,
  siteverify: () => unknown | Promise<unknown>,
  workflow: PreparedWorkflow = prepared(),
  claim: (digest: string) => unknown | Promise<unknown> = () => ({
    claimed: true,
  }),
) {
  const saved = new Map<string, Record<string, unknown>>();
  let name = "Webhook";
  let json: Record<string, unknown> = { body };
  let requests = 0;
  for (let step = 0; step < 20; step++) {
    const node: WorkflowNode | undefined = workflow.nodes.find(
      (n) => n.name === name,
    );
    if (!node) throw new Error("Missing node");
    let outputIndex = 0;
    if (node.type === "n8n-nodes-base.code") {
      if (typeof node.parameters.jsCode !== "string")
        throw new Error("Missing code");
      const result: unknown = await new Function(
        "$input",
        "$",
        `return (async () => { ${node.parameters.jsCode} })();`,
      )(
        { first: () => ({ json }), all: () => json.__rows ?? [{ json }] },
        (nodeName: string) => ({
          first: () => ({ json: saved.get(nodeName) }),
        }),
      );
      if (
        !Array.isArray(result) ||
        !object(result[0]) ||
        !object(result[0].json)
      )
        throw new Error("Invalid code result");
      json = result[0].json;
    } else if (node.type === "n8n-nodes-base.if") {
      const conditions = node.parameters.conditions;
      if (
        !object(conditions) ||
        !Array.isArray(conditions.conditions) ||
        !object(conditions.conditions[0])
      )
        throw new Error("Missing conditions");
      outputIndex =
        expression(conditions.conditions[0].leftValue, json) === true ? 0 : 1;
    } else if (node.type === "n8n-nodes-base.httpRequest") {
      requests++;
      expect(node.parameters.url).toBe(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      );
      expect(expression(node.parameters.jsonBody, json)).toEqual({
        response: object(body) ? body.turnstileToken : undefined,
      });
      expect(node.parameters.genericAuthType).toBe("httpCustomAuth");
      try {
        const result: unknown = await siteverify();
        json = object(result) ? result : { invalidResult: result };
      } catch {
        json = { error: "local-stub-timeout" };
      }
    } else if (node.type === "n8n-nodes-base.crypto") {
      expect(node.parameters).toMatchObject({
        action: "hash",
        type: "SHA256",
        encoding: "hex",
        binaryData: false,
      });
      const token = expression(node.parameters.value, json, saved);
      if (typeof token !== "string") throw new Error("Missing token");
      json = {
        ...json,
        tokenDigest: createHash("sha256").update(token).digest("hex"),
      };
    } else if (node.type === "n8n-nodes-base.set") {
      expect(node.parameters.includeOtherFields).toBe(false);
      const assignments = node.parameters.assignments;
      if (!object(assignments) || !Array.isArray(assignments.assignments))
        throw new Error("Missing ledger fields");
      const selected: Record<string, unknown> = {};
      for (const assignment of assignments.assignments) {
        if (!object(assignment) || typeof assignment.name !== "string")
          throw new Error("Invalid ledger field");
        selected[assignment.name] = expression(assignment.value, json, saved);
      }
      json = selected;
    } else if (node.type === "n8n-nodes-base.postgres") {
      expect(Object.keys(json)).toEqual(["tokenDigest"]);
      const options = node.parameters.options;
      if (!object(options)) throw new Error("Missing PostgreSQL options");
      expect(expression(options.queryReplacement, json)).toEqual([
        json.tokenDigest,
      ]);
      if (typeof json.tokenDigest !== "string")
        throw new Error("Missing digest");
      try {
        const result = await claim(json.tokenDigest);
        json = Array.isArray(result)
          ? { __rows: result.map((row) => ({ json: row })) }
          : object(result)
            ? result
            : { invalidResult: result };
      } catch {
        json = { error: "store_unavailable" };
      }
    } else if (node.type === "n8n-nodes-base.respondToWebhook") {
      const options = node.parameters.options;
      if (!object(options)) throw new Error("Missing response options");
      return {
        status: expression(options.responseCode, json),
        body: expression(node.parameters.responseBody, json),
        requests,
      };
    }
    saved.set(name, json);
    const next = workflow.connections[name]?.main[outputIndex]?.[0]?.node;
    if (!next) throw new Error("Missing graph edge");
    name = next;
  }
  throw new Error("Unterminated graph");
}

describe("n8n Turnstile workflow generated code and response graph", () => {
  it("accepts verified valid submissions only after Siteverify", async () => {
    expect(await runGraph(submission(), approved)).toEqual({
      status: 200,
      body: { message: "Workflow was started" },
      requests: 1,
    });
  });
  it.each([
    undefined,
    null,
    [],
    "raw",
    {},
    { ...submission(), schemaVersion: 2 },
    { ...submission(), turnstileToken: "" },
    { ...submission(), turnstileToken: "x".repeat(2049) },
    { ...submission(), formKey: "unknown" },
    { ...submission(), fields: { message: "x".repeat(10001) } },
    { ...submission(), consents: [{}] },
    { ...submission(), source: "https://evil.example/" },
    { ...submission(), source: `http://${host}/` },
    { ...submission(), submittedAt: "nonsense" },
    { ...submission(), language: "xx" },
  ])(
    "rejects malformed input without requesting verification (%#)",
    async (body) => {
      const result = await runGraph(body, () => {
        throw new Error("Must never verify invalid input");
      });
      expect(result).toEqual({
        status: 400,
        body: { error: "invalid_submission" },
        requests: 0,
      });
    },
  );
  it.each([
    {
      statusCode: 200,
      body: { success: false, "error-codes": ["timeout-or-duplicate"] },
    },
    {
      statusCode: 200,
      body: { success: true, hostname: "evil.example", action: "contact" },
    },
    {
      statusCode: 200,
      body: { success: true, hostname: host, action: "newsletter" },
    },
    { statusCode: 200, body: { success: true } },
  ])(
    "rejects expired/replayed or mismatched verification (%#)",
    async (result) => {
      expect(await runGraph(submission(), () => result)).toEqual({
        status: 403,
        body: { error: "verification_failed" },
        requests: 1,
      });
    },
  );
  it.each([
    null,
    [],
    {},
    { error: "network error" },
    { statusCode: 503, body: { success: true } },
    { statusCode: 200, body: "non-JSON" },
    { statusCode: 200, body: { success: "true" } },
    { success: true, hostname: host, action: "contact" },
  ])(
    "fails closed on malformed responses or transport errors (%#)",
    async (result) => {
      expect(await runGraph(submission(), () => result)).toEqual({
        status: 503,
        body: { error: "verification_unavailable" },
        requests: 1,
      });
    },
  );
  it("fails closed on Siteverify timeout", async () => {
    expect(
      await runGraph(submission(), () => {
        throw new Error("timeout");
      }),
    ).toEqual({
      status: 503,
      body: { error: "verification_unavailable" },
      requests: 1,
    });
  });
  it.each(["localhost", "127.0.0.1"])(
    "allows only the configured local staging origin and derived token hostname (%s)",
    async (hostname) => {
      const origin = `http://${hostname}:4340`;
      const workflow = prepared({ kind: "staging", localOrigins: [origin] });
      const body = { ...submission(), source: `${origin}/kontakt/` };
      const verified = () => ({
        statusCode: 200,
        body: {
          success: true,
          hostname,
          action: "contact",
          challenge_ts: new Date().toISOString(),
        },
      });
      expect(workflow.nodes[0]?.parameters.options).toMatchObject({
        allowedOrigins: `https://${host},${origin}`,
      });
      expect(await runGraph(body, verified, workflow)).toEqual({
        status: 200,
        body: { message: "Workflow was started" },
        requests: 1,
      });
      expect(await runGraph(submission(), approved, workflow)).toMatchObject({
        status: 200,
      });
      for (const source of [
        `http://${hostname}:4341/kontakt/`,
        `http://${hostname}:4340.evil.example/kontakt/`,
        `http://${hostname}:4340@evil.example/kontakt/`,
        `https://${hostname}:4340/kontakt/`,
        "https://evil.example/kontakt/",
      ]) {
        expect(await runGraph({ ...body, source }, verified, workflow)).toEqual(
          {
            status: 400,
            body: { error: "invalid_submission" },
            requests: 0,
          },
        );
      }
      for (const response of [
        { success: true, hostname: "evil.example", action: "contact" },
        { success: true, hostname, action: "newsletter" },
        { success: false, "error-codes": ["timeout-or-duplicate"] },
        { success: true },
      ]) {
        expect(
          await runGraph(
            body,
            () => ({ statusCode: 200, body: response }),
            workflow,
          ),
        ).toEqual({
          status: 403,
          body: { error: "verification_failed" },
          requests: 1,
        });
      }
      expect(
        await runGraph({ ...body, turnstileToken: "" }, verified, workflow),
      ).toEqual({
        status: 400,
        body: { error: "invalid_submission" },
        requests: 0,
      });
    },
  );
  it.each(["localhost", "127.0.0.1"])(
    "rejects local sources and local Siteverify hostnames in production (%s)",
    async (hostname) => {
      expect(
        await runGraph(
          { ...submission(), source: `http://${hostname}:4340/` },
          approved,
        ),
      ).toEqual({
        status: 400,
        body: { error: "invalid_submission" },
        requests: 0,
      });
      expect(
        await runGraph(submission(), () => ({
          statusCode: 200,
          body: {
            success: true,
            hostname,
            action: "contact",
            challenge_ts: new Date().toISOString(),
          },
        })),
      ).toEqual({
        status: 403,
        body: { error: "verification_failed" },
        requests: 1,
      });
    },
  );
  it.each([
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:0",
    "http://localhost:65536",
    "https://localhost:4340",
    "http://example.com:4340",
    "http://[::1]:4340",
    "http://stage.localhost:4340",
    "http://127.1:4340",
    "http://user@localhost:4340",
    "http://localhost:4340/",
    "http://localhost:4340/path",
    "http://localhost:4340?query=1",
    "http://localhost:4340#hash",
    "http://localhost:4340.evil.example",
  ])("refuses invalid staging local origins (%s)", (origin) => {
    expect(() =>
      prepared({ kind: "staging", localOrigins: [origin] }),
    ).toThrow();
  });
  it("normalizes an explicit default HTTP port without allowing an implicit port", () => {
    const workflow = prepared({
      kind: "staging",
      localOrigins: ["http://localhost:80"],
    });
    expect(workflow.nodes[0]?.parameters.options).toMatchObject({
      allowedOrigins: `https://${host},http://localhost`,
    });
  });
  it("derives local CORS and token hostnames from deduplicated explicit staging origins", () => {
    const workflow = prepared({
      kind: "staging",
      localOrigins: [
        "http://localhost:4340",
        "http://127.0.0.1:4340",
        "http://localhost:4340",
      ],
    });
    expect(workflow.nodes[0]?.parameters.options).toMatchObject({
      allowedOrigins: `https://${host},http://localhost:4340,http://127.0.0.1:4340`,
    });
  });
  it("preserves webhook identity and metadata; keeps secret in credential only and disables payload storage", () => {
    const workflow = prepared();
    expect(workflow.nodes[0]).toMatchObject({
      id: "existing-webhook",
      webhookId: "keep-path",
      parameters: {
        path: "keep-path",
        responseMode: "responseNode",
        options: { rawBody: false, allowedOrigins: `https://${host}` },
      },
    });
    expect(workflow.settings).toEqual({
      executionOrder: "v1",
      callerPolicy: "workflowsFromSameOwner",
      saveDataSuccessExecution: "none",
      saveDataErrorExecution: "none",
      saveExecutionProgress: false,
      saveManualExecutions: false,
    });
    expect(workflow).not.toHaveProperty("pinData");
    expect(workflow).not.toHaveProperty("staticData");
    const http = workflow.nodes.find((n) => n.name === "Verify Turnstile");
    expect(http).toMatchObject({
      onError: "continueRegularOutput",
      credentials: {
        httpCustomAuth: { id: "INVALID_NOT_CONFIGURED", name: "Ola Turnstile" },
      },
      parameters: {
        options: {
          timeout: 10000,
          redirect: { redirect: { followRedirects: false } },
          response: {
            response: { responseFormat: "json", fullResponse: true },
          },
        },
      },
    });
    expect(JSON.stringify(workflow)).not.toMatch(/"secret"\s*:/);
  });
  it("refuses snapshots with existing processing rather than discarding it", () => {
    expect(() =>
      prepareTurnstileWorkflow({
        deployment: { kind: "production" },
        snapshot: { ...snapshot, connections: { Webhook: {} } },
        allowedHostnames: [host],
        credential: { id: "test", name: "test" },
        replayCredential: { id: "test-postgres", name: "Ola replay" },
      }),
    ).toThrow(/jednym webhookiem/);
  });
  it.each(
    [
      [],
      ["localhost"],
      ["127.0.0.1"],
      ["stage.localhost"],
      ["stage.local"],
      ["https://example.com"],
      ["EXAMPLE.COM"],
    ].map((allowedHostnames) => ({ allowedHostnames })),
  )(
    "refuses missing or nonpublic production hostnames (%#)",
    ({ allowedHostnames }) => {
      expect(() =>
        prepareTurnstileWorkflow({
          deployment: { kind: "production" },
          snapshot,
          allowedHostnames,
          credential: { id: "test", name: "test" },
          replayCredential: { id: "test-postgres", name: "Ola replay" },
        }),
      ).toThrow(/publiczne/);
    },
  );
});

describe("durable replay claim at the generated workflow boundary", () => {
  const ledger = () => {
    const digests = new Set<string>();
    return (digest: string) => {
      const claimed = !digests.has(digest);
      if (claimed) digests.add(digest);
      return { claimed };
    };
  };
  it("rejects replay even when Siteverify succeeds again and submission identity changes", async () => {
    const claim = ledger();
    expect(
      await runGraph(submission(), approved, prepared(), claim),
    ).toMatchObject({ status: 200 });
    expect(
      await runGraph(
        {
          ...submission(),
          submissionId: "different",
          submittedAt: new Date().toISOString(),
        },
        approved,
        prepared(),
        claim,
      ),
    ).toMatchObject({ status: 403, body: { error: "verification_failed" } });
  });
  it("allows at most one response across concurrent claims of the same token", async () => {
    const claim = ledger();
    const results = await Promise.all(
      Array.from({ length: 32 }, () =>
        runGraph(submission(), approved, prepared(), claim),
      ),
    );
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.filter((r) => r.status === 403)).toHaveLength(31);
  });
  it("hashes the entire token and accepts distinct tokens independently", async () => {
    const digests: string[] = [];
    const claim = ledger();
    for (const token of ["token-a", "token-b", "token-a" + "x".repeat(2041)]) {
      expect(
        await runGraph(
          { ...submission(), turnstileToken: token },
          approved,
          prepared(),
          (digest) => {
            digests.push(digest);
            return claim(digest);
          },
        ),
      ).toMatchObject({ status: 200 });
    }
    expect(digests).toEqual([
      "a70bf50e531ce1a817561f2f5d5b6645d4e806becf58ccc5e8cf6b8045a090a8",
      "49e2bb7eab54cf09b409ffafd3fa8a8a955a60eb972faacaefbed3dbd3207132",
      "89ef4581e1df164d918a8ded4e31a6f317f45c839097a7c90a3ea07fe2f41bb4",
    ]);
  });
  it.each([
    undefined,
    null,
    {},
    [],
    [{ claimed: true }, { claimed: true }],
    { claimed: "true" },
    { claimed: 1 },
    { claimed: true, error: "unexpected" },
  ])("fails closed on malformed ledger responses (%#)", async (result) => {
    expect(
      await runGraph(submission(), approved, prepared(), () => result),
    ).toMatchObject({
      status: 503,
      body: { error: "verification_unavailable" },
    });
  });
  it("fails closed without retry when the claim transport fails", async () => {
    let attempts = 0;
    expect(
      await runGraph(submission(), approved, prepared(), () => {
        attempts++;
        throw new Error("database timeout");
      }),
    ).toMatchObject({ status: 503 });
    expect(attempts).toBe(1);
  });
  it.each([
    () => null,
    () => ({ statusCode: 200, body: { success: false } }),
    () => ({
      ...approved(),
      body: { ...approved().body, hostname: "evil.example" },
    }),
  ])(
    "never accesses the ledger before strict Siteverify (%#)",
    async (verification) => {
      let attempts = 0;
      const result = await runGraph(
        submission(),
        verification,
        prepared(),
        () => {
          attempts++;
          return { claimed: true };
        },
      );
      expect([403, 503]).toContain(result.status);
      expect(attempts).toBe(0);
    },
  );
  it.each([
    undefined,
    null,
    "",
    "2026-02-30T00:00:00Z",
    "2026-10-14",
    "2026-10-14T00:00:00+00:00",
    123,
  ])(
    "rejects missing or malformed challenge timestamps without claiming (%#)",
    async (challenge_ts) => {
      let claims = 0;
      expect(
        await runGraph(
          submission(),
          () => ({ ...approved(), body: { ...approved().body, challenge_ts } }),
          prepared(),
          () => {
            claims++;
            return { claimed: true };
          },
        ),
      ).toMatchObject({ status: 503 });
      expect(claims).toBe(0);
    },
  );
  it.each([-300001, -300000, 30000, 30001])(
    "checks challenge freshness at the boundary (%i ms)",
    async (delta) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-14T12:00:00Z"));
      try {
        const challenge_ts = new Date(Date.now() + delta).toISOString();
        let claims = 0;
        const accepted = delta >= -300000 && delta <= 30000;
        expect(
          await runGraph(
            submission(),
            () => ({
              ...approved(),
              body: { ...approved().body, challenge_ts },
            }),
            prepared(),
            () => {
              claims++;
              return { claimed: true };
            },
          ),
        ).toMatchObject({ status: accepted ? 200 : 403 });
        expect(claims).toBe(accepted ? 1 : 0);
      } finally {
        vi.useRealTimers();
      }
    },
  );
  it("uses isolated literal schemas and a parameterized one-row claim", () => {
    const query = (deployment: DeploymentPolicy) =>
      prepared(deployment).nodes.find((n) => n.name === "Claim verified token")
        ?.parameters.query;
    expect(query({ kind: "production" })).toBe(`WITH claimed AS (
  INSERT INTO ola_replay_production.used_tokens (token_digest)
  VALUES ($1::text)
  ON CONFLICT (token_digest) DO NOTHING
  RETURNING 1
)
SELECT EXISTS (SELECT 1 FROM claimed) AS claimed;`);
    expect(query({ kind: "staging", localOrigins: [] })).toBe(
      String(query({ kind: "production" })).replace(
        "ola_replay_production",
        "ola_replay_staging",
      ),
    );
    expect(
      prepared().nodes.find((n) => n.name === "Claim verified token"),
    ).toMatchObject({
      retryOnFail: false,
      onError: "continueRegularOutput",
      credentials: { postgres: { id: "test-postgres", name: "Ola replay" } },
    });
  });
  it.each([
    undefined,
    { id: "", name: "x" },
    { id: "x", name: " " },
    { id: "same", name: "same" },
  ])("requires a separate replay credential (%#)", (replayCredential) => {
    expect(() =>
      Reflect.apply(prepareTurnstileWorkflow, undefined, [
        {
          deployment: { kind: "production" },
          snapshot,
          allowedHostnames: [host],
          credential: { id: "same", name: "CF" },
          replayCredential,
        },
      ]),
    ).toThrow();
  });
});

describe("workflow generator CLI environment boundary", () => {
  it.each(
    [
      ["automatic", "example.com", "cf", "CF", "pg", "PG"],
      [
        "production",
        "example.com",
        "cf",
        "CF",
        "pg",
        "PG",
        "--local-origin",
        "http://127.0.0.1:4340",
      ],
      ["example.com", "cf", "CF"],
    ].map((args) => ({ args })),
  )(
    "refuses implicit or invalid environment before reading files (%#)",
    ({ args }) => {
      const result = spawnSync(
        process.execPath,
        [
          "--import",
          "tsx",
          "scripts/turnstile-workflow.ts",
          "nonexistent-snapshot",
          "nonexistent-output",
          ...args,
        ],
        { encoding: "utf8" },
      );
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("ENVIRONMENT(production|staging)");
      expect(result.stderr).not.toContain("ENOENT");
    },
  );
  it("generates public staging with no localhost flags into the staging schema", () => {
    const directory = mkdtempSync(join(tmpdir(), "ola-replay-cli-"));
    try {
      const input = join(directory, "snapshot.json");
      const output = join(directory, "workflow.json");
      writeFileSync(input, JSON.stringify(snapshot));
      const result = spawnSync(
        process.execPath,
        [
          "--import",
          "tsx",
          "scripts/turnstile-workflow.ts",
          input,
          output,
          "staging",
          host,
          "cf",
          "CF",
          "pg",
          "PG",
        ],
        { encoding: "utf8" },
      );
      expect(result.status, result.stderr).toBe(0);
      expect(readFileSync(output, "utf8")).toContain(
        "ola_replay_staging.used_tokens",
      );
      expect(readFileSync(output, "utf8")).not.toContain(
        "ola_replay_production.used_tokens",
      );
    } finally {
      rmSync(directory, { recursive: true });
    }
  });
});

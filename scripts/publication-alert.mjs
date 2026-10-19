// Alerty o treści z Sanity, która nie trafiła na produkcję.
// Skrypt nie ma zależności npm, bo krok awaryjny działa także po nieudanym `npm ci`.
// Polecenia: `monitor`, `failure`, `send`.
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const SITE_ORIGIN = "https://aleksandraolesiewicz.com";
export const PUBLISH_WORKFLOW_FILE = "publish-content.yml";
export const DEFAULT_GRACE_MINUTES = 20;
const FORM_WEBHOOK = new URL(
  "https://flows.zawlodzki.com/webhook/2fba1cf1-729f-4e79-8ebf-869f9277284e",
);
const MAX_LISTED_ITEMS = 10;

const TYPE_LABELS = {
  page: "strona",
  article: "artykuł",
  legalPage: "dokument prawny",
  ebook: "e-book",
  category: "kategoria",
  author: "autor",
  service: "usługa",
  testimonial: "opinia",
  form: "formularz",
  siteSettings: "ustawienia strony",
  redirect: "przekierowanie",
};

const STEP_LABELS = {
  config: "sprawdzanie konfiguracji",
  install: "instalacja zależności",
  build: "budowanie i testy strony",
  deploy: "wdrożenie na Cloudflare",
};

/**
 * Rozstrzyga, czy najnowsza publikacja w Sanity ma pokrycie w udanym wdrożeniu.
 * `deployments` to wyłącznie wdrożenia produkcji z workflow `Publish content`.
 * Wdrożenie utworzone po publikacji pobiera już tę treść podczas builda.
 */
export function evaluatePublication({
  latestPublication,
  deployments,
  now,
  graceMinutes = DEFAULT_GRACE_MINUTES,
}) {
  if (!latestPublication) return { status: "ok", reason: "no-content" };
  const publishedAt = Date.parse(latestPublication.updatedAt);
  if (Number.isNaN(publishedAt)) {
    throw new Error(`Invalid _updatedAt: ${latestPublication.updatedAt}`);
  }
  const after = deployments.filter(
    (deployment) => Date.parse(deployment.createdAt) >= publishedAt,
  );
  const lastSuccess = latestSuccessfulDeployment(deployments);
  if (after.some((deployment) => deployment.state === "success")) {
    return { status: "ok", reason: "deployed", lastSuccess };
  }
  const ageMinutes = Math.floor((now.getTime() - publishedAt) / 60_000);
  if (ageMinutes < graceMinutes) {
    return { status: "pending", reason: "grace-period", ageMinutes };
  }
  if (after.some((deployment) => isRunning(deployment.state))) {
    return { status: "pending", reason: "deployment-running", ageMinutes };
  }
  if (after.some((deployment) => isFailed(deployment.state))) {
    // Krok awaryjny w `Publish content` zgłasza już przyczynę.
    return { status: "reported", reason: "deployment-failed", ageMinutes };
  }
  return {
    status: "alert",
    reason: "no-deployment",
    ageMinutes,
    lastSuccess,
    alertKey: alertKeyFor(latestPublication),
  };
}

function isRunning(state) {
  return ["queued", "pending", "in_progress"].includes(state);
}

function isFailed(state) {
  return ["failure", "error"].includes(state);
}

function latestSuccessfulDeployment(deployments) {
  return deployments
    .filter((deployment) => deployment.state === "success")
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

export function alertKeyFor(publication) {
  return `${publication.updatedAt}-${publication.id}`.replace(
    /[^A-Za-z0-9._-]/g,
    "_",
  );
}

/** Wyciąga zepsute linki z wyjścia `scripts/check-seo.mjs`. */
export function parseBrokenLinks(log) {
  const links = new Set();
  for (const match of log.matchAll(/(\/[^\s'"`]*) ← ([^'"`\n]+)/g)) {
    links.add(`${match[1]} ← ${match[2].trim().replace(/,$/, "")}`);
  }
  return [...links];
}

/** Pierwszy nieudany krok wdrożenia na podstawie `steps.<id>.outcome`. */
export function firstFailedStep(outcomes) {
  for (const step of Object.keys(STEP_LABELS)) {
    if (outcomes[step] === "failure") return step;
  }
  return "unknown";
}

export function formatWarsawTime(iso) {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}

function describeDocument(document) {
  const label = TYPE_LABELS[document.type] ?? document.type;
  return document.title ? `„${document.title}” (${label})` : label;
}

function bulletList(items) {
  const shown = items.slice(0, MAX_LISTED_ITEMS).map((item) => `• ${item}`);
  if (items.length > MAX_LISTED_ITEMS) {
    shown.push(`• …i więcej (lista skrócona do ${MAX_LISTED_ITEMS})`);
  }
  return shown.join("\n");
}

/** Komunikat, gdy publikacja nie uruchomiła wdrożenia (webhook, Worker, dispatch). */
export function buildMonitorAlert({ evaluation, pending, latest, runUrl }) {
  const documents = pending.length > 0 ? pending : [latest];
  const lastSuccess = evaluation.lastSuccess;
  const text = [
    "⚠️ Zmiany z Sanity nie pojawiły się na aleksandraolesiewicz.com",
    "",
    `Od ostatniej publikacji minęło ${evaluation.ageMinutes} min, a strona nie została zaktualizowana. Treść jest bezpiecznie zapisana w Sanity, ale odwiedzający nadal widzą poprzednią wersję.`,
    "",
    "Czeka na publikację:",
    bulletList(
      documents.map(
        (document) =>
          `${describeDocument(document)}, opublikowano ${formatWarsawTime(document.updatedAt)}`,
      ),
    ),
    "",
    "Co zrobić: nic nie musisz poprawiać ani publikować ponownie. Grzegorz sprawdzi połączenie Sanity → strona.",
    "",
    "Dla Grzegorza: brak udanego przebiegu Publish content (production) po publikacji. Sprawdź webhook Sanity, Workera ola-website-integrations-production i Repository Dispatch.",
    lastSuccess
      ? `Ostatnie udane wdrożenie: ${formatWarsawTime(lastSuccess.createdAt)}${lastSuccess.runUrl ? ` (${lastSuccess.runUrl})` : ""}`
      : "Nie znaleziono udanego wdrożenia produkcji w ostatnich przebiegach.",
    `Kontrola: ${runUrl}`,
  ].join("\n");
  return {
    source: "ola-website",
    kind: "publication-not-deployed",
    site: SITE_ORIGIN,
    text,
    publishedAt: latest.updatedAt,
    runUrl,
  };
}

/** Komunikat po nieudanym przebiegu `Publish content` dla produkcji. */
export function buildFailureAlert({ failedStep, brokenLinks, runUrl }) {
  const lines = [
    "⚠️ Ostatnie zmiany z Sanity nie zostały opublikowane na aleksandraolesiewicz.com",
    "",
    "Strona nadal pokazuje poprzednią wersję. Nic nie zostało usunięte.",
    "",
  ];
  if (brokenLinks.length > 0) {
    lines.push(
      "Dlaczego: na stronie są linki do stron, które nie istnieją albo nie są jeszcze opublikowane (adres ← strony, na których jest link):",
      bulletList(brokenLinks),
      "",
      "Co zrobić: opublikuj brakującą stronę albo usuń lub popraw link i opublikuj zmianę ponownie. Nowa publikacja sama uruchomi kolejną próbę.",
    );
  } else {
    lines.push(
      `Dlaczego: błąd techniczny na etapie „${STEP_LABELS[failedStep] ?? "nieznany krok"}”.`,
      "",
      "Co zrobić: nic nie musisz poprawiać. Grzegorz sprawdzi przebieg.",
    );
  }
  lines.push("", `Szczegóły dla Grzegorza: ${runUrl}`);
  return {
    source: "ola-website",
    kind: "publish-failed",
    site: SITE_ORIGIN,
    text: lines.join("\n"),
    failedStep,
    brokenLinks: brokenLinks.slice(0, MAX_LISTED_ITEMS),
    runUrl,
  };
}

/** Odrzuca adresy, które nie są osobnym webhookiem HTTPS alertów. */
export function assertAlertEndpoint(value) {
  if (!value) throw new Error("PUBLICATION_ALERT_WEBHOOK_URL is not set");
  const endpoint = new URL(value);
  if (endpoint.protocol !== "https:") {
    throw new Error("Alert webhook must use HTTPS");
  }
  if (
    endpoint.origin === FORM_WEBHOOK.origin &&
    endpoint.pathname === FORM_WEBHOOK.pathname
  ) {
    throw new Error("Alert webhook must not be the form webhook");
  }
  return endpoint;
}

export async function sendAlert({ payload, endpoint, fetchImpl = fetch }) {
  const response = await fetchImpl(assertAlertEndpoint(endpoint), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Alert webhook responded with ${response.status}`);
  }
}

export function publicationQuery(filter) {
  const projection = `{"id": _id, "type": _type, "updatedAt": _updatedAt, "title": coalesce(title, name, seo.title)}`;
  return `{
  "latest": *[${filter}] | order(_updatedAt desc)[0]${projection},
  "pending": *[(${filter}) && _updatedAt > $since] | order(_updatedAt desc)[0...${MAX_LISTED_ITEMS + 1}]${projection}
}`;
}

async function fetchJson(url, init, fetchImpl) {
  const response = await fetchImpl(url, init);
  if (!response.ok) {
    throw new Error(`${url} responded with ${response.status}`);
  }
  return response.json();
}

/**
 * Pobiera wdrożenia produkcji powiązane z przebiegami `Publish content`.
 * Środowiska `production` używa też `Deploy Studio`, więc filtr po przebiegu
 * jest konieczny. Kończy na pierwszym udanym wdrożeniu.
 */
export async function fetchProductionDeployments({
  repository,
  token,
  apiUrl = "https://api.github.com",
  fetchImpl = fetch,
}) {
  const init = {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
    },
  };
  const runs = await fetchJson(
    `${apiUrl}/repos/${repository}/actions/workflows/${PUBLISH_WORKFLOW_FILE}/runs?event=repository_dispatch&per_page=100`,
    init,
    fetchImpl,
  );
  const runUrls = new Map(
    runs.workflow_runs.map((run) => [String(run.id), run.html_url]),
  );
  const deployments = await fetchJson(
    `${apiUrl}/repos/${repository}/deployments?environment=production&per_page=50`,
    init,
    fetchImpl,
  );
  const result = [];
  for (const deployment of deployments) {
    const statuses = await fetchJson(
      `${deployment.statuses_url}?per_page=1`,
      init,
      fetchImpl,
    );
    const status = statuses[0];
    const runId = status?.log_url?.match(/\/actions\/runs\/(\d+)/)?.[1];
    if (!runId || !runUrls.has(runId)) continue;
    result.push({
      createdAt: deployment.created_at,
      state: status.state,
      runUrl: runUrls.get(runId),
    });
    if (status.state === "success") break;
  }
  return result;
}

export async function fetchPublications({
  projectId,
  dataset,
  filter,
  since,
  fetchImpl = fetch,
}) {
  const url = new URL(
    `https://${projectId}.api.sanity.io/v2026-09-01/data/query/${dataset}`,
  );
  url.searchParams.set("query", publicationQuery(filter));
  url.searchParams.set("$since", JSON.stringify(since));
  url.searchParams.set("perspective", "published");
  const body = await fetchJson(url, {}, fetchImpl);
  return body.result;
}

function writeOutputs(outputs) {
  const file = process.env.GITHUB_OUTPUT;
  const lines = Object.entries(outputs).map(
    ([key, value]) => `${key}=${value}`,
  );
  if (file) appendFileSync(file, `${lines.join("\n")}\n`);
  else console.log(lines.join("\n"));
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function currentRunUrl() {
  const server = process.env.GITHUB_SERVER_URL ?? "https://github.com";
  return `${server}/${requireEnv("GITHUB_REPOSITORY")}/actions/runs/${requireEnv("GITHUB_RUN_ID")}`;
}

async function runMonitor(payloadFile) {
  const contract = JSON.parse(
    readFileSync("docs/sanity-publication-webhook.json", "utf8"),
  );
  const deployments = await fetchProductionDeployments({
    repository: requireEnv("GITHUB_REPOSITORY"),
    token: requireEnv("GITHUB_TOKEN"),
    apiUrl: process.env.GITHUB_API_URL,
  });
  const lastSuccess = latestSuccessfulDeployment(deployments);
  const { latest, pending } = await fetchPublications({
    projectId: requireEnv("SANITY_PROJECT_ID"),
    dataset: requireEnv("SANITY_DATASET"),
    filter: contract.filter,
    since: lastSuccess?.createdAt ?? "1970-01-01T00:00:00Z",
  });
  const evaluation = evaluatePublication({
    latestPublication: latest,
    deployments,
    now: new Date(),
    graceMinutes: Number(
      process.env.PUBLICATION_GRACE_MINUTES || DEFAULT_GRACE_MINUTES,
    ),
  });
  console.log(
    `Publication check: ${evaluation.status} (${evaluation.reason}); latest ${latest?.updatedAt ?? "none"}; last deployment ${lastSuccess?.createdAt ?? "none"}`,
  );
  if (evaluation.status === "alert") {
    const payload = buildMonitorAlert({
      evaluation,
      pending,
      latest,
      runUrl: currentRunUrl(),
    });
    writeFileSync(payloadFile, JSON.stringify(payload, null, 2));
  }
  writeOutputs({
    status: evaluation.status,
    alert_key: evaluation.alertKey ?? "",
  });
}

function runFailure(logFile, payloadFile) {
  let log = "";
  try {
    log = readFileSync(logFile, "utf8");
  } catch {
    // Brak logu oznacza awarię przed buildem.
  }
  const payload = buildFailureAlert({
    failedStep: firstFailedStep(JSON.parse(process.env.STEP_OUTCOMES || "{}")),
    brokenLinks: parseBrokenLinks(log),
    runUrl: requireEnv("FAILED_RUN_URL"),
  });
  writeFileSync(payloadFile, JSON.stringify(payload, null, 2));
}

async function runSend(payloadFile) {
  const payload = JSON.parse(readFileSync(payloadFile, "utf8"));
  if (process.env.ALERT_DRY_RUN === "true") {
    console.log("Dry run, alert not sent:");
    console.log(payload.text);
    return;
  }
  await sendAlert({
    payload,
    endpoint: process.env.PUBLICATION_ALERT_WEBHOOK_URL,
  });
  console.log(`Alert ${payload.kind} sent.`);
}

async function main([command, ...files]) {
  if (files.length === 0) {
    throw new Error("Usage: publication-alert.mjs <command> <file...>");
  }
  if (command === "monitor") return runMonitor(files[0]);
  if (command === "failure") return runFailure(files[0], files[1]);
  if (command === "send") return runSend(files[0]);
  throw new Error(`Unknown command: ${command}`);
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

import { isIndexingEnabled, SITE_ORIGIN } from "./site";
import { buildRobotsTxt } from "./robots";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_URL_LIMIT = 10_000;

export type IndexNowConfiguration =
  | { kind: "disabled"; reason: "non-production" | "noindex" | "missing-key" }
  | { kind: "enabled"; key: string; keyPath: string; keyLocation: string };

export function indexNowConfiguration(env: {
  DEPLOYMENT_TARGET?: string;
  SITE_INDEXING?: string;
  INDEXNOW_KEY?: string;
}): IndexNowConfiguration {
  if (env.DEPLOYMENT_TARGET !== "production")
    return { kind: "disabled", reason: "non-production" };
  if (!isIndexingEnabled(env.SITE_INDEXING))
    return { kind: "disabled", reason: "noindex" };
  if (!env.INDEXNOW_KEY) return { kind: "disabled", reason: "missing-key" };
  if (!/^[A-Za-z0-9-]{8,128}$/.test(env.INDEXNOW_KEY))
    throw new Error("IndexNow: niepoprawny format klucza.");
  if (env.INDEXNOW_KEY === "llms-full")
    throw new Error("IndexNow: ścieżka klucza koliduje z eksportem treści.");
  const keyPath = `/${env.INDEXNOW_KEY}.txt`;
  return {
    kind: "enabled",
    key: env.INDEXNOW_KEY,
    keyPath,
    keyLocation: `${SITE_ORIGIN}${keyPath}`,
  };
}

export function sitemapUrls(xml: string): string[] {
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<urlset\b[^>]*>[\s\S]*<\/urlset>\s*$/.test(xml))
    throw new Error("IndexNow: oczekiwano sitemap urlset.");
  const content = xml
    .replace(/^\s*(?:<\?xml[^>]*>\s*)?<urlset\b[^>]*>/, "")
    .replace(/<\/urlset>\s*$/, "");
  const remaining = content.replace(
    /<url>\s*<loc>[^<]*<\/loc>\s*(?:<lastmod>[^<]*<\/lastmod>\s*)?<\/url>/g,
    "",
  );
  if (remaining.trim())
    throw new Error("IndexNow: niepoprawna struktura sitemap.");
  const matches = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)];
  if ((xml.match(/<loc\b/g) ?? []).length !== matches.length)
    throw new Error("IndexNow: niepoprawne elementy sitemap.");
  const urls = matches.map((match) => {
    const value = (match[1] ?? "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new Error("IndexNow: niepoprawny URL sitemap.");
    }
    if (
      url.origin !== SITE_ORIGIN ||
      url.username ||
      url.password ||
      url.hash ||
      url.search ||
      url.href !== value
    )
      throw new Error("IndexNow: URL poza kanoniczną domeną produkcji.");
    return value;
  });
  return [...new Set(urls)].sort();
}

export function indexNowUrls(current: string[], previous: string[]): string[] {
  const urls = [...new Set([...current, ...previous])].sort();
  if (urls.length > INDEXNOW_URL_LIMIT)
    throw new Error("IndexNow: przekroczono limit 10000 URL, bez wysyłki.");
  return urls;
}

export function validateIndexNowArtifacts({
  robots,
  headers,
  keyContent,
  key,
}: {
  robots: string;
  headers: string;
  keyContent: string;
  key: string;
}): void {
  if (robots !== buildRobotsTxt({ indexing: true }))
    throw new Error(
      "IndexNow: robots.txt nie odpowiada indeksowalnej produkcji.",
    );
  const globalNoindex = headers
    .replace(/\r\n/g, "\n")
    .split(/\n(?=\/)/)
    .some(
      (rule) =>
        rule.startsWith("/*\n") && /X-Robots-Tag\s*:[^\n]*noindex/i.test(rule),
    );
  if (globalNoindex)
    throw new Error("IndexNow: globalny noindex w artefakcie.");
  if (keyContent !== key)
    throw new Error("IndexNow: plik klucza nie odpowiada konfiguracji.");
}

export type IndexNowMode = "dry-run" | "capture-previous" | "send";
export type IndexNowResult =
  | { kind: "skipped"; reason: string; count: 0 }
  | { kind: "captured"; count: number }
  | { kind: "dry-run"; count: number; current: number; removed: number }
  | { kind: "submitted" | "key-validation-pending"; count: number };

export interface IndexNowIO {
  readArtifact: (path: string) => Promise<string>;
  readPrevious: () => Promise<string | undefined>;
  writePrevious: (xml: string) => Promise<void>;
  fetch: typeof fetch;
}

const EMPTY_SITEMAP =
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

async function fetchPublic(io: IndexNowIO, url: string): Promise<Response> {
  const response = await io.fetch(url, {
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (response.redirected || (response.url && response.url !== url))
    throw new Error("IndexNow: przekierowanie zasobu publicznego.");
  return response;
}

async function publicText(io: IndexNowIO, url: string): Promise<string> {
  const response = await fetchPublic(io, url);
  if (response.status !== 200)
    throw new Error("IndexNow: zasób publiczny nie jest dostępny z HTTP 200.");
  if (/noindex/i.test(response.headers.get("X-Robots-Tag") ?? ""))
    throw new Error("IndexNow: publiczny zasób ma noindex.");
  return response.text();
}

export async function runIndexNow({
  configuration,
  mode,
  io,
}: {
  configuration: IndexNowConfiguration;
  mode: IndexNowMode;
  io: IndexNowIO;
}): Promise<IndexNowResult> {
  if (configuration.kind === "disabled")
    return { kind: "skipped", reason: configuration.reason, count: 0 };
  if (mode === "capture-previous") {
    const previousXml = await io.readPrevious();
    if (previousXml !== undefined)
      return { kind: "captured", count: sitemapUrls(previousXml).length };
    const response = await fetchPublic(io, `${SITE_ORIGIN}/sitemap.xml`);
    if (response.status !== 200 && response.status !== 404)
      throw new Error("IndexNow: nie udało się pobrać poprzedniego sitemap.");
    const xml = response.status === 404 ? EMPTY_SITEMAP : await response.text();
    const urls = sitemapUrls(xml);
    await io.writePrevious(xml);
    return { kind: "captured", count: urls.length };
  }
  const current = sitemapUrls(await io.readArtifact("sitemap.xml"));
  const previousXml = await io.readPrevious();
  if (mode === "send" && previousXml === undefined)
    throw new Error("IndexNow: brak migawki sprzed wdrożenia, bez wysyłki.");
  const previous = sitemapUrls(previousXml ?? EMPTY_SITEMAP);
  const urls = indexNowUrls(current, previous);
  validateIndexNowArtifacts({
    robots: await io.readArtifact("robots.txt"),
    headers: await io.readArtifact("_headers"),
    keyContent: await io.readArtifact(configuration.keyPath.slice(1)),
    key: configuration.key,
  });
  if (!urls.length) return { kind: "skipped", reason: "no-urls", count: 0 };
  if (mode === "dry-run")
    return {
      kind: "dry-run",
      count: urls.length,
      current: current.length,
      removed: previous.filter((url) => !current.includes(url)).length,
    };
  const publishedKey = await fetchPublic(io, configuration.keyLocation);
  if (
    publishedKey.status !== 200 ||
    (await publishedKey.text()) !== configuration.key
  )
    throw new Error(
      "IndexNow: opublikowany plik klucza nie odpowiada artefaktowi.",
    );
  const publicRobots = await publicText(io, `${SITE_ORIGIN}/robots.txt`);
  if (publicRobots !== (await io.readArtifact("robots.txt")))
    throw new Error(
      "IndexNow: opublikowany robots.txt nie odpowiada artefaktowi.",
    );
  const publishedUrls = sitemapUrls(
    await publicText(io, `${SITE_ORIGIN}/sitemap.xml`),
  );
  if (JSON.stringify(publishedUrls) !== JSON.stringify(current))
    throw new Error(
      "IndexNow: opublikowany sitemap nie odpowiada artefaktowi.",
    );
  const response = await io.fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_ORIGIN).host,
      key: configuration.key,
      keyLocation: configuration.keyLocation,
      urlList: urls,
    }),
  });
  if (response.redirected)
    throw new Error("IndexNow: przekierowanie odpowiedzi zgłoszenia.");
  if (response.status === 200) return { kind: "submitted", count: urls.length };
  if (response.status === 202)
    return { kind: "key-validation-pending", count: urls.length };
  throw new Error(`IndexNow: zgłoszenie zakończone HTTP ${response.status}.`);
}

export function parseIndexNowMode(args: string[]): IndexNowMode {
  if (!args.length) return "dry-run";
  if (args.length !== 1)
    throw new Error("IndexNow: oczekiwano jednego trybu CLI.");
  switch (args[0]) {
    case "--dry-run":
      return "dry-run";
    case "--capture-previous":
      return "capture-previous";
    case "--send":
      return "send";
    default:
      throw new Error("IndexNow: nieznana flaga CLI.");
  }
}

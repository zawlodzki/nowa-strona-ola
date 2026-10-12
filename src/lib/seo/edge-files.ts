import { SITE_ORIGIN } from "@/lib/seo/site";

/**
 * `_headers` for Workers Static Assets (max 100 rules). Markdown alternates
 * stay out of the index and point to their HTML canonical (`:splat`).
 */
export function buildHeadersFile({ indexing }: { indexing: boolean }): string {
  const rules: string[][] = [];
  if (!indexing) rules.push(["/*", "X-Robots-Tag: noindex"]);
  rules.push(
    [
      "/*.md",
      "Content-Type: text/markdown; charset=utf-8",
      "X-Robots-Tag: noindex",
      `Link: <${SITE_ORIGIN}/:splat/>; rel="canonical"`,
    ],
    ["/index.md", "! Link", `Link: <${SITE_ORIGIN}/>; rel="canonical"`],
    ["/llms.txt", "X-Robots-Tag: noindex"],
    [
      "/llms-full.txt",
      "Content-Type: text/plain; charset=utf-8",
      "X-Robots-Tag: noindex",
    ],
    ["/blog/rss.xml", "Content-Type: application/rss+xml; charset=utf-8"],
    ["/_astro/*", "Cache-Control: public, max-age=31536000, immutable"],
  );
  return `${rules
    .map(([path, ...headers]) =>
      [path, ...headers.map((header) => `  ${header}`)].join("\n"),
    )
    .join("\n")}\n`;
}

export interface RedirectInput {
  from: string;
  to: string;
  status: "301" | "302";
}

/** Same path with and without the trailing slash (extension-less paths only). */
function slashVariants(path: string): string[] {
  if (/\.[a-z0-9]+$/i.test(path)) return [path];
  const bare = path === "/" ? "/" : path.replace(/\/$/, "");
  return bare === "/" ? ["/"] : [bare, `${bare}/`];
}

function normalizeTarget(to: string): string {
  if (to.startsWith(SITE_ORIGIN)) return to.slice(SITE_ORIGIN.length) || "/";
  return to;
}

/**
 * `_redirects` from Sanity `redirect` documents. Throws (stops the build) on
 * loops, chains, duplicates, sources that shadow a live page and internal
 * targets missing from the build.
 */
export function buildRedirectsFile(
  redirects: RedirectInput[],
  livePaths: string[],
): string {
  const live = new Set(livePaths.flatMap(slashVariants));
  const sources = new Map<string, RedirectInput>();
  for (const redirect of redirects) {
    const from = redirect.from.trim();
    if (!from.startsWith("/") || from.startsWith("//")) {
      throw new Error(`Przekierowanie: niepoprawna ścieżka źródłowa ${from}.`);
    }
    for (const variant of slashVariants(from)) {
      if (sources.has(variant)) {
        throw new Error(`Przekierowanie: zduplikowane źródło ${variant}.`);
      }
      if (live.has(variant)) {
        throw new Error(
          `Przekierowanie z ${variant} zasłania opublikowaną stronę.`,
        );
      }
      sources.set(variant, { ...redirect, from: variant });
    }
  }
  const lines: string[] = [];
  for (const redirect of sources.values()) {
    const to = normalizeTarget(redirect.to.trim());
    if (slashVariants(redirect.from).includes(to)) {
      throw new Error(`Przekierowanie ${redirect.from} wskazuje na siebie.`);
    }
    if (to.startsWith("/") && sources.has(to)) {
      throw new Error(
        `Łańcuch przekierowań: ${redirect.from} → ${to} → ${sources.get(to)?.to}. Wskaż adres docelowy bezpośrednio.`,
      );
    }
    const targetPath = to.split(/[?#]/)[0] ?? to;
    if (to.startsWith("/") && !live.has(targetPath)) {
      throw new Error(
        `Przekierowanie ${redirect.from} prowadzi do ${to}, której nie ma w buildzie.`,
      );
    }
    lines.push(`${redirect.from} ${to} ${redirect.status}`);
  }
  if (lines.length > 2000) {
    throw new Error(`Przekierowań jest ${lines.length}; limit to 2000.`);
  }
  return lines.length ? `${lines.join("\n")}\n` : "";
}

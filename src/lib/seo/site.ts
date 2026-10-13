import type { Locale } from "@ola/shared";

export { SITE_NAME } from "@ola/shared";

/** Production origin. Must equal `site` in astro.config.mjs (unit test). */
export const SITE_ORIGIN = "https://aleksandraolesiewicz.com";

export const htmlLang: Record<Locale, string> = { pl: "pl-PL", en: "en-GB" };
export const ogLocale: Record<Locale, string> = { pl: "pl_PL", en: "en_GB" };

/** Absolute URL for a site path; absolute inputs are returned unchanged. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, SITE_ORIGIN).href;
}

/** Stable JSON-LD identifier of a node that belongs to one page. */
export function pageEntityId(path: string, fragment: string): string {
  return `${absoluteUrl(path).split("#")[0]}#${fragment}`;
}

/** Shared entities. Identifiers do not depend on the language. */
export const entityId = {
  person: `${SITE_ORIGIN}/#person`,
  website: `${SITE_ORIGIN}/#website`,
  blog: `${SITE_ORIGIN}/blog/#blog`,
  /** Legal seller of consultations and e-books (decision D2, 11.10.2026). */
  seller: `${SITE_ORIGIN}/#seller`,
} as const;

/**
 * Indexing is opt-in per build: only `SITE_INDEXING=production` removes noindex.
 * Staging, preview and local builds stay noindex (docs/SEO-GEO-AEO-PLAN.md, SEO-1).
 */
export function isIndexingEnabled(
  value: string | undefined = readIndexingEnv(),
): boolean {
  return value === "production";
}

function readIndexingEnv(): string | undefined {
  return typeof process === "undefined" ? undefined : process.env.SITE_INDEXING;
}

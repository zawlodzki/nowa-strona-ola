/**
 * Public path of a document, mirroring src/lib/paths.ts for Polish routes.
 * English routes are disabled (decision 10.10.2026), so they return null.
 */
export function publicPath(
  documentType: string | undefined,
  slug: string | undefined,
  language: string | undefined,
): string | null {
  if (!slug || language !== "pl") return null;
  switch (documentType) {
    case "page":
      return slug === "home" ? "/" : `/${slug}/`;
    case "legalPage":
      return `/${slug}/`;
    case "article":
      return `/blog/${slug}/`;
    case "category":
      return `/blog/kategoria/${slug}/`;
    case "ebook":
      return `/ebooki/${slug}/`;
    default:
      return null;
  }
}

export const siteOrigin = "https://aleksandraolesiewicz.com";

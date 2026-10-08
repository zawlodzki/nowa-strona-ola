import type { Locale } from "@ola/shared";

export type SiteSection = "home" | "catalog" | "blog" | "page";

export const HOME_SLUG = "home";
export const ARTICLES_PER_PAGE = 6;
export const reservedPageSlugs = [
  "blog",
  "en",
  "ui",
  "static",
  "api",
  "ebooki",
  "ebooks",
  "o-mnie",
  "about",
  "konsultacje",
  "consultations",
] as const;
export const reservedArticleSlugs = [
  "strona",
  "kategoria",
  "page",
  "category",
] as const;

export function homePath(language: Locale): string {
  return language === "pl" ? "/" : "/en/";
}

export function aboutPath(language: Locale): string {
  return language === "pl" ? "/o-mnie/" : "/en/about/";
}

export function consultationPath(language: Locale): string {
  return language === "pl" ? "/konsultacje/" : "/en/consultations/";
}

export const EBOOK_TOPICS = ["pcos", "perimenopause"] as const;
export type EbookTopicFilter = (typeof EBOOK_TOPICS)[number];
export type EbookCollectionFilter = "all" | EbookTopicFilter;

export function parseEbookCollectionFilter(
  value: string | null | undefined,
): EbookCollectionFilter {
  if (value === "pcos" || value === "perimenopause") return value;
  return "all";
}

export function ebookCollectionFilterParam(
  language: Locale,
): "kategoria" | "category" {
  return language === "pl" ? "kategoria" : "category";
}

export function ebookCollectionPath(
  language: Locale,
  filter: EbookCollectionFilter = "all",
): string {
  const base = language === "pl" ? "/ebooki/" : "/en/ebooks/";
  if (filter === "all") return base;
  const segment = language === "pl" ? "kategoria" : "category";
  return `${base}${segment}/${filter}/`;
}

export function ebookCollectionQueryPath(
  language: Locale,
  filter: EbookCollectionFilter,
): string {
  if (filter === "all") return ebookCollectionPath(language);
  return `${ebookCollectionPath(language)}?${ebookCollectionFilterParam(language)}=${filter}`;
}

export function ebookPath(language: Locale, slug: string): string {
  return language === "pl" ? `/ebooki/${slug}/` : `/en/ebooks/${slug}/`;
}

export function homeAnchor(language: Locale, id: string): string {
  return `${homePath(language)}#${id}`;
}

export function catalogPath(language: Locale): string {
  return language === "pl" ? "/ui/" : "/en/ui/";
}

export function pagePath(language: Locale, slug: string): string {
  if (slug === HOME_SLUG) return homePath(language);
  return language === "pl" ? `/${slug}/` : `/en/${slug}/`;
}

export function blogPath(language: Locale, page = 1): string {
  if (page <= 1) return language === "pl" ? "/blog/" : "/en/blog/";
  return language === "pl" ? `/blog/strona/${page}/` : `/en/blog/page/${page}/`;
}

export function blogCategoryPath(
  language: Locale,
  slug: string,
  page = 1,
): string {
  const base =
    language === "pl"
      ? `/blog/kategoria/${slug}/`
      : `/en/blog/category/${slug}/`;
  if (page <= 1) return base;
  return language === "pl"
    ? `/blog/kategoria/${slug}/strona/${page}/`
    : `/en/blog/category/${slug}/page/${page}/`;
}

export function articlePath(language: Locale, slug: string): string {
  return language === "pl" ? `/blog/${slug}/` : `/en/blog/${slug}/`;
}

export function alternatePath(language: Locale, section: SiteSection): string {
  const nextLanguage: Locale = language === "pl" ? "en" : "pl";
  if (section === "catalog") return catalogPath(nextLanguage);
  if (section === "blog") return blogPath(nextLanguage);
  return homePath(nextLanguage);
}

export function translationHref(
  language: Locale,
  kind: "page" | "article",
  slug: string | null | undefined,
): string | null {
  if (!slug) return null;
  const nextLanguage: Locale = language === "pl" ? "en" : "pl";
  return kind === "article"
    ? articlePath(nextLanguage, slug)
    : pagePath(nextLanguage, slug);
}

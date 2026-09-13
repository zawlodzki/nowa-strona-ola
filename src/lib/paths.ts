import type { Locale } from "@ola/shared";

export type SiteSection = "home" | "catalog";

export function homePath(language: Locale): string {
  return language === "pl" ? "/" : "/en/";
}

export function catalogPath(language: Locale): string {
  return language === "pl" ? "/ui/" : "/en/ui/";
}

export function alternatePath(language: Locale, section: SiteSection): string {
  const nextLanguage: Locale = language === "pl" ? "en" : "pl";
  return section === "catalog"
    ? catalogPath(nextLanguage)
    : homePath(nextLanguage);
}

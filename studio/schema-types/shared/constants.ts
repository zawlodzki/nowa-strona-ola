export const languageOptions = [
  { title: "Polski", value: "pl" },
  { title: "English", value: "en" },
] as const;

export const reservedPageSlugs = ["blog", "en", "ui", "static", "api"] as const;

export const reservedArticleSlugs = [
  "strona",
  "kategoria",
  "page",
  "category",
] as const;

export const homeSlug = "home";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

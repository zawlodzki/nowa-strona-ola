export const languageOptions = [
  { title: "Polski", value: "pl" },
  { title: "English", value: "en" },
] as const;

export const reservedLegalSlugs = [
  "polityka-prywatnosci",
  "regulamin",
  "lista-cookies-i-identyfikatorow",
  "regulamin-newslettera",
  "privacy",
  "terms",
] as const;

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
  ...reservedLegalSlugs,
] as const;

export const reservedArticleSlugs = [
  "strona",
  "kategoria",
  "page",
  "category",
] as const;

export const homeSlug = "home";

export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

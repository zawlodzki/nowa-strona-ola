export const sectionCatalog = [
  ["heroSection", "hero"],
  ["textSection", "text"],
  ["textImageSection", "text-image"],
  ["logosSection", "logos"],
  ["cardsSection", "cards"],
  ["listSection", "list"],
  ["processSection", "process"],
  ["metricsSection", "metrics"],
  ["pricingSection", "pricing"],
  ["testimonialsSection", "testimonials"],
  ["expertSection", "expert"],
  ["faqSection", "faq"],
  ["comparisonSection", "comparison"],
  ["quoteSection", "quote"],
  ["ctaSection", "cta"],
  ["formSection", "form"],
  ["mediaSection", "media"],
  ["relatedSection", "related"],
] as const;

export type KnownSectionType = (typeof sectionCatalog)[number][0];
export type CatalogSectionId = (typeof sectionCatalog)[number][1];

export const knownSectionTypes: readonly KnownSectionType[] =
  sectionCatalog.map(([type]) => type);

export const catalogSectionIds: readonly CatalogSectionId[] =
  sectionCatalog.map(([, id]) => id);

export function isKnownSectionType(value: string): value is KnownSectionType {
  return (knownSectionTypes as readonly string[]).includes(value);
}

export function assertKnownSections<
  T extends { _type?: string | null; _key?: string | null },
>(
  sections: readonly T[] | null,
): asserts sections is Array<T & { _type: KnownSectionType; _key: string }> {
  if (!sections || sections.length === 0) {
    throw new Error("Strona nie ma sekcji. Zatrzymuję build.");
  }

  for (const section of sections) {
    if (!section._key) {
      throw new Error("Sekcja bez klucza. Zatrzymuję build.");
    }
    if (!section._type || !isKnownSectionType(section._type)) {
      throw new Error(
        `Nieznany typ sekcji: ${section._type ?? "brak"}. Zatrzymuję build.`,
      );
    }
  }
}

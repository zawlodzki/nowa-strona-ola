export const knownSectionTypes = [
  "heroSection",
  "textSection",
  "textImageSection",
  "logosSection",
  "cardsSection",
  "listSection",
  "processSection",
  "metricsSection",
  "pricingSection",
  "testimonialsSection",
  "expertSection",
  "faqSection",
  "comparisonSection",
  "quoteSection",
  "ctaSection",
  "formSection",
  "mediaSection",
  "relatedSection",
  "ebooksSection",
  "serviceOfferSection",
  "credentialsSection",
  "ebookCollectionSection",
] as const;

export type KnownSectionType = (typeof knownSectionTypes)[number];

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

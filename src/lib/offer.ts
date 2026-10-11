import type { Locale } from "@ola/shared";

export function formatPriceGross(
  amount: number,
  currency: string,
  language: Locale,
): string {
  if (currency !== "PLN") {
    throw new Error(`Nieobsługiwana waluta: ${currency}.`);
  }
  return language === "pl" ? `${amount} zł brutto` : `${amount} PLN gross`;
}

export function currencyLabel(currency: string, language: Locale): string {
  if (currency !== "PLN") {
    throw new Error(`Nieobsługiwana waluta: ${currency}.`);
  }
  return language === "pl" ? "zł" : "PLN";
}

export function formatLowestPriceNote(
  priceGross: number,
  lowestPrice30Days: number,
  currency: string,
  language: Locale,
): string {
  const unit = currencyLabel(currency, language);
  return language === "pl"
    ? `${priceGross} ${unit} · najniższa cena z 30 dni przed obniżką: ${lowestPrice30Days} ${unit}`
    : `${priceGross} ${unit} · lowest price in the 30 days before the discount: ${lowestPrice30Days} ${unit}`;
}

export function durationLabel(minutes: number, language: Locale): string {
  return language === "pl" ? `${minutes} minut` : `${minutes} min`;
}

export function formatServicePrice(
  amount: number,
  currency: string,
  minutes: number,
  language: Locale,
): string {
  return `${amount} ${currencyLabel(currency, language)} / ${durationLabel(minutes, language)}`;
}

export function topicLabel(
  topic: "pcos" | "perimenopause",
  language: Locale,
): string {
  if (topic === "pcos") return "PMOS (PCOS)";
  return language === "pl" ? "Perimenopauza" : "Perimenopause";
}

type Availability = "planned" | "presale" | "available" | "paused";

const availabilityLabels: Record<Locale, Record<Availability, string>> = {
  pl: {
    planned: "Wkrótce dostępny",
    presale: "Przedsprzedaż",
    available: "Dostępny",
    paused: "Sprzedaż wstrzymana",
  },
  en: {
    planned: "Coming soon",
    presale: "Pre-sale",
    available: "Available",
    paused: "Sales paused",
  },
};

export function availabilityLabel(
  availability: Availability,
  language: Locale,
): string {
  return availabilityLabels[language][availability];
}

/** Badge karty e-booka: tylko „Wkrótce dostępny”. */
export function availabilityBadge(
  availability: Availability,
  language: Locale,
): string | undefined {
  return availability === "planned"
    ? availabilityLabel(availability, language)
    : undefined;
}

export function schemaOfferAvailability(
  availability: "planned" | "presale" | "available" | "paused",
): string {
  if (availability === "available") return "https://schema.org/InStock";
  if (availability === "presale") return "https://schema.org/PreOrder";
  return "https://schema.org/OutOfStock";
}

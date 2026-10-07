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
  if (topic === "pcos") return "PCOS";
  return language === "pl" ? "Perimenopauza" : "Perimenopause";
}

export function schemaOfferAvailability(
  availability: "planned" | "presale" | "available" | "paused",
): string {
  if (availability === "available") return "https://schema.org/InStock";
  if (availability === "presale") return "https://schema.org/PreOrder";
  return "https://schema.org/OutOfStock";
}

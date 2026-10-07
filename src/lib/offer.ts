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

export function formatServicePrice(
  amount: number,
  currency: string,
  minutes: number,
  language: Locale,
): string {
  if (currency !== "PLN") {
    throw new Error(`Nieobsługiwana waluta: ${currency}.`);
  }
  return language === "pl"
    ? `${amount} zł / ${minutes} minut`
    : `${amount} PLN / ${minutes} min`;
}

export function topicLabel(
  topic: "pcos" | "perimenopause",
  language: Locale,
): string {
  if (topic === "pcos") return "PCOS";
  return language === "pl" ? "Perimenopauza" : "Perimenopause";
}

import { checkoutCopy } from "@/content/checkout-copy";
import type { PCOS_CHECKOUT_SETTINGS_QUERY_RESULT } from "@/sanity.types";

export const pcosCheckoutSettingsFixture = {
  salesState: "paused",
  singlePriceGross: 97,
  pairPriceGross: 97,
  crossSellKicker: checkoutCopy.crosssellKicker,
  bundleReference: checkoutCopy.bundleReference,
  crossSellTitle: checkoutCopy.crosssellTitle,
  crossSellLead: checkoutCopy.crosssellLead,
  bundleOnlyNotice: checkoutCopy.bundleTerms,
  continueLabel: checkoutCopy.submit,
  skipLabel: "Nie, dziękuję",
  educationNote:
    "E-booki mają charakter edukacyjny. Nie zastępują indywidualnej konsultacji ani leczenia.",
  legalConsentVersion: "pcos-d27-2026-10-18",
} as const;

export function mapPcosCheckoutSettings(
  raw: PCOS_CHECKOUT_SETTINGS_QUERY_RESULT,
) {
  if (!raw) throw new Error("Brak konfiguracji zamówień serii e-booków.");
  if (raw.salesState !== "paused" && raw.salesState !== "ready") {
    throw new Error("Nieznany stan zamówień serii e-booków.");
  }
  if (raw.singlePriceGross !== 97 || raw.pairPriceGross !== 97) {
    throw new Error(
      "Ceny serii e-booków muszą wynosić 97 zł za e-book i 97 zł za parę.",
    );
  }
  if (raw.legalConsentVersion !== "pcos-d27-2026-10-18") {
    throw new Error(
      "Wersja oświadczenia zamówienia serii e-booków wymaga aktualizacji procesu.",
    );
  }
  if (raw.continueLabel !== "Zamawiam z obowiązkiem zapłaty") {
    throw new Error("Przycisk zamówienia musi wskazywać obowiązek zapłaty.");
  }
  function required(value: string | null, field: string) {
    if (!value?.trim())
      throw new Error(`Brak treści zamówienia serii e-booków: ${field}.`);
    return value;
  }
  return {
    salesState: raw.salesState,
    singlePriceGross: raw.singlePriceGross,
    pairPriceGross: raw.pairPriceGross,
    crossSellKicker: required(raw.crossSellKicker, "etykieta oferty"),
    bundleReference: required(raw.bundleReference, "wyjaśnienie cen"),
    crossSellTitle: required(raw.crossSellTitle, "nagłówek"),
    crossSellLead: required(raw.crossSellLead, "wprowadzenie"),
    bundleOnlyNotice: required(raw.bundleOnlyNotice, "warunek zakupu pary"),
    continueLabel: required(raw.continueLabel, "przycisk zamówienia"),
    skipLabel: required(raw.skipLabel, "pominięcie oferty"),
    educationNote: required(raw.educationNote, "informacja edukacyjna"),
    legalConsentVersion: raw.legalConsentVersion,
  };
}

export type PcosCheckoutSettings = ReturnType<typeof mapPcosCheckoutSettings>;

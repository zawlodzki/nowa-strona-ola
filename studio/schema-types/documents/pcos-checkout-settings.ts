import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";

export const pcosCheckoutSettingsType = defineType({
  name: "pcosCheckoutSettings",
  title: "Zamówienia serii PCOS",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({
      name: "salesState",
      title: "Gotowość procesu zamówienia",
      description:
        "Przygotowany proces nadal wymaga konfiguracji Workera i dostawy. Nie zmienia dostępności e-booków.",
      type: "string",
      options: {
        list: [
          { title: "Wstrzymany", value: "paused" },
          { title: "Przygotowany do odbioru", value: "ready" },
        ],
        layout: "radio",
      },
      initialValue: "paused",
      validation: (rule) => rule.required(),
    }),
    ...["singlePriceGross", "pairPriceGross"].map((name) =>
      defineField({
        name,
        title:
          name === "singlePriceGross"
            ? "Cena pojedynczego e-booka brutto (zł)"
            : "Cena dwóch pozostałych e-booków razem brutto (zł)",
        description:
          "Kwota 97 zł zatwierdzona 18.10.2026. Cena płatności jest kontrolowana po stronie serwera.",
        type: "number",
        initialValue: 97,
        readOnly: true,
        validation: (rule) => rule.required().min(97).max(97),
      }),
    ),
    ...[
      { name: "crossSellKicker", title: "Etykieta oferty", max: 100 },
      { name: "empathy", title: "Kontekst i potrzeba klientki", max: 500 },
      { name: "mechanism", title: "Jak korzystać z serii", max: 500 },
      {
        name: "bundleReference",
        title: "Wyjaśnienie porównania cen",
        max: 400,
      },
      {
        name: "crossSellTitle",
        title: "Nagłówek oferty uzupełnienia serii",
        max: 150,
      },
      { name: "crossSellLead", title: "Wprowadzenie do oferty", max: 500 },
      {
        name: "bundleOnlyNotice",
        title: "Warunek zakupu obu e-booków",
        max: 400,
      },
      {
        name: "continueLabel",
        title: "Przycisk złożenia zamówienia",
        max: 80,
      },
      { name: "skipLabel", title: "Przycisk pominięcia oferty", max: 80 },
      {
        name: "educationNote",
        title: "Informacja o edukacyjnym charakterze e-booków",
        max: 400,
      },
    ].map(({ name, title, max }) =>
      defineField({
        name,
        title,
        readOnly: name === "continueLabel",
        description:
          name === "bundleOnlyNotice"
            ? "Oferta wymaga zakupu obu brakujących e-booków razem. Zakup jednego w tej cenie nie jest dostępny."
            : undefined,
        type: "text",
        rows: 2,
        validation: (rule) =>
          rule
            .required()
            .max(max)
            .custom(
              (value) =>
                name !== "continueLabel" ||
                value === "Zamawiam z obowiązkiem zapłaty" ||
                "Wymagana etykieta Zamawiam z obowiązkiem zapłaty.",
            ),
      }),
    ),
    defineField({
      name: "legalConsentVersion",
      title: "Wersja oświadczenia zamówienia",
      description:
        "D27, dokument Zgody i formularze 2.5. Zmiana tekstu wymaga aktualizacji procesu i wersji po stronie serwera.",
      type: "string",
      initialValue: "pcos-d27-2026-10-18",
      readOnly: true,
      validation: (rule) =>
        rule
          .required()
          .custom(
            (value) =>
              value === "pcos-d27-2026-10-18" ||
              "Wymagana wersja pcos-d27-2026-10-18.",
          ),
    }),
  ],
  preview: {
    prepare: () => ({
      title: "Zamówienia serii PCOS",
      subtitle: "Pojedynczy e-book i para uzupełniająca",
    }),
  },
});

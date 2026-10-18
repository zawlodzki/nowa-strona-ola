import { BookIcon } from "@sanity/icons/Book";
import { defineArrayMember, defineField, defineType } from "sanity";

import {
  languageField,
  sameLanguageFilter,
  slugField,
  translationField,
} from "../shared/fields";

export const ebookType = defineType({
  name: "ebook",
  title: "E-book",
  type: "document",
  icon: BookIcon,
  groups: [
    { name: "product", title: "Produkt", default: true },
    { name: "offer", title: "Oferta" },
    { name: "landing", title: "Landing" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    { ...languageField, group: "product" },
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      group: "product",
      validation: (rule) => rule.required().max(100),
    }),
    slugField({
      documentType: "ebook",
      reserved: ["kategoria", "category"],
      description:
        "Adres strony produktu, unikalny w obrębie języka. Nie używać kategoria/category — to filtry kolekcji.",
    }),
    translationField("ebook"),
    defineField({
      name: "productCode",
      title: "Kod produktu płatności",
      description:
        "Stały, unikalny kod używany przez proces zamówienia. Nie zmienia dostępności produktu.",
      type: "string",
      group: "offer",
      validation: (rule) =>
        rule
          .regex(/^[a-z0-9][a-z0-9-]{1,63}$/)
          .custom(async (value, context) => {
            if (!value) return true;
            const id = context.document?._id.replace(/^drafts\./, "");
            const duplicate = await context
              .getClient({ apiVersion: "2026-09-01" })
              .fetch<string | null>(
                '*[_type == "ebook" && productCode == $code && !(_id in [$id, $draftId])][0]._id',
                { code: value, id: id ?? "", draftId: `drafts.${id}` },
              );
            return !duplicate || "Kod produktu musi być unikalny.";
          }),
    }),
    defineField({
      name: "stripePriceId",
      title: "Identyfikator ceny Stripe",
      description:
        "Identyfikator price_ dla ceny 97 zł brutto. Brak pola wyłącza produkt z katalogu płatności.",
      type: "string",
      group: "offer",
      validation: (rule) => rule.regex(/^price_[A-Za-z0-9]+$/),
    }),
    defineField({
      name: "crossSell",
      title: "Oferta po zakupie tego e-booka",
      type: "object",
      group: "offer",
      fields: [
        defineField({
          name: "complementaryEbooks",
          title: "Dwa e-booki w pakiecie uzupełniającym",
          description:
            "Wybierz dokładnie dwa inne e-booki. Kolejność odpowiada kolejności okładek w ofercie.",
          type: "array",
          of: [
            defineArrayMember({
              type: "reference",
              to: [{ type: "ebook" }],
              options: {
                disableNew: true,
                filter: ({ document }) => ({
                  filter:
                    'language == $language && !(_id in [$id, $draftId]) && !(_id in path("drafts.**"))',
                  params: {
                    language:
                      typeof document.language === "string"
                        ? document.language
                        : "",
                    id: document._id.replace(/^drafts\./, ""),
                    draftId: document._id,
                  },
                }),
              },
            }),
          ],
          validation: (rule) =>
            rule
              .required()
              .length(2)
              .unique()
              .custom(async (value, context) => {
                if (!value) return true;
                const ids = value.flatMap((item) =>
                  typeof item === "object" &&
                  item !== null &&
                  "_ref" in item &&
                  typeof item._ref === "string"
                    ? [item._ref]
                    : [],
                );
                const id = context.document?._id.replace(/^drafts\./, "");
                if (ids.includes(id ?? "") || ids.includes(`drafts.${id}`))
                  return "Pakiet nie może zawierać kupowanego e-booka.";
                const count = await context
                  .getClient({ apiVersion: "2026-09-01" })
                  .fetch<number>(
                    'count(*[_type == "ebook" && _id in $ids && !(_id in path("drafts.**")) && language == $language])',
                    { ids, language: context.document?.language ?? "" },
                  );
                return (
                  count === 2 ||
                  "Wybierz dwa opublikowane e-booki w tym samym języku."
                );
              }),
        }),
        ...[
          { name: "kicker", title: "Krótka etykieta nad nagłówkiem", max: 100 },
          { name: "title", title: "Nagłówek oferty", max: 150 },
          { name: "lead", title: "Krótkie wprowadzenie", max: 300 },
        ].map(({ name, title, max }) =>
          defineField({
            name,
            title,
            type: "string",
            validation: (rule) => rule.required().max(max),
          }),
        ),
        defineField({
          name: "stripeCouponId",
          title: "Identyfikator kuponu Stripe dla pakietu",
          type: "string",
          description:
            "Kupon 50% obejmujący wybrane produkty. Wymagany przed uruchomieniem płatności.",
          validation: (rule) =>
            rule.custom(
              (value, context) =>
                !context.document?.stripePriceId ||
                !!value?.trim() ||
                "Gotowa oferta wymaga kuponu Stripe.",
            ),
        }),
      ],
    }),
    defineField({
      name: "subtitle",
      title: "Podtytuł",
      type: "string",
      group: "product",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: "topic",
      title: "Temat",
      type: "string",
      group: "product",
      options: {
        layout: "radio",
        list: [
          { title: "PCOS", value: "pcos" },
          { title: "Perimenopauza", value: "perimenopause" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cardDescription",
      title: "Opis karty",
      type: "text",
      rows: 3,
      group: "product",
      validation: (rule) => rule.required().max(250),
    }),
    defineField({
      name: "cover",
      title: "Okładka",
      type: "mediaObject",
      group: "product",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverTone",
      title: "Ton okładki",
      type: "string",
      group: "product",
      options: {
        layout: "radio",
        list: [
          { title: "Jasny", value: "light" },
          { title: "Wiśniowy", value: "cherry" },
        ],
      },
      initialValue: "light",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Autorka",
      type: "reference",
      group: "product",
      to: [{ type: "author" }],
      options: sameLanguageFilter("author"),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "availability",
      title: "Dostępność",
      description:
        "„Wkrótce dostępny” pokazuje badge na kartach i zamienia przycisk zakupu na zapis na listę oczekujących. „Dostępny” i „Przedsprzedaż” prowadzą do płatności Stripe.",
      type: "string",
      group: "offer",
      options: {
        layout: "radio",
        list: [
          { title: "Wkrótce dostępny (lista oczekujących)", value: "planned" },
          { title: "Przedsprzedaż", value: "presale" },
          { title: "Dostępny", value: "available" },
          { title: "Wstrzymany", value: "paused" },
        ],
      },
      initialValue: "planned",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priceGross",
      title: "Cena brutto",
      type: "number",
      group: "offer",
      validation: (rule) =>
        rule
          .required()
          .min(0)
          .precision(2)
          .custom((value) => {
            if (typeof value !== "number" || !Number.isFinite(value)) {
              return "Podaj skończoną liczbę.";
            }
            return true;
          }),
    }),
    defineField({
      name: "lowestPrice30Days",
      title: "Najniższa cena z 30 dni przed obniżką (brutto, zł)",
      description:
        "Wypełnij tylko na czas ogłoszonej obniżki ceny. Poza obniżką zostaw puste. Wypełnione pole oznacza aktywną obniżkę: strona pokaże tę cenę obok ceny brutto (art. 4 ust. 2 ustawy o informowaniu o cenach).",
      type: "number",
      group: "offer",
      validation: (rule) => [
        rule.positive().precision(2),
        rule
          .custom((value, context) => {
            const price = (
              context.document as { priceGross?: unknown } | undefined
            )?.priceGross;
            if (
              typeof value === "number" &&
              typeof price === "number" &&
              value < price
            ) {
              return "Najniższa cena z 30 dni jest niższa od obecnej ceny brutto. Sprawdź, czy to na pewno obniżka.";
            }
            return true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "currency",
      title: "Waluta",
      type: "string",
      group: "offer",
      options: {
        list: [{ title: "PLN", value: "PLN" }],
      },
      initialValue: "PLN",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      group: "offer",
      options: {
        list: [
          { title: "PDF", value: "pdf" },
          { title: "PDF + EPUB", value: "pdf-epub" },
        ],
      },
      initialValue: "pdf",
    }),
    defineField({
      name: "numberOfPages",
      title: "Liczba stron",
      type: "number",
      group: "product",
      validation: (rule) => rule.integer().min(1).max(2000),
    }),
    defineField({
      name: "publishedAt",
      title: "Data udostępnienia",
      description: "Dzień rozpoczęcia sprzedaży. Trafia do datePublished.",
      type: "date",
      group: "product",
    }),
    defineField({
      name: "chapters",
      title: "Rozdziały",
      type: "array",
      group: "product",
      of: [{ type: "ebookChapter" }],
      validation: (rule) =>
        rule.max(20).custom((chapters, context) => {
          const landing = (
            context.document as { landing?: unknown } | undefined
          )?.landing;
          if (landing && (!chapters || chapters.length < 1)) {
            return "Landing wymaga od 1 do 20 rozdziałów.";
          }
          return true;
        }),
    }),
    defineField({
      name: "includedMaterials",
      title: "Materiały w pakiecie",
      type: "array",
      group: "product",
      of: [{ type: "ebookMaterial" }],
      validation: (rule) =>
        rule.max(10).custom((materials, context) => {
          const landing = (
            context.document as { landing?: unknown } | undefined
          )?.landing;
          if (landing && (!materials || materials.length < 1)) {
            return "Landing wymaga od 1 do 10 materiałów.";
          }
          return true;
        }),
    }),
    defineField({
      name: "delivery",
      title: "Dostarczenie",
      type: "ebookDelivery",
      group: "offer",
      validation: (rule) =>
        rule.custom((value, context) => {
          const availability = (
            context.document as { availability?: string } | undefined
          )?.availability;
          if (
            (availability === "presale" || availability === "available") &&
            !value
          ) {
            return "Aktywna sprzedaż wymaga opisu dostarczenia.";
          }
          return true;
        }),
    }),
    defineField({
      name: "checkoutUrl",
      title: "Adres zakupu",
      description:
        "Dla produktów bez kodu płatności. E-book z productCode korzysta z formularza zamówienia na stronie. Nie wklejać kotwicy mockupu.",
      type: "url",
      group: "offer",
      validation: (rule) =>
        rule.uri({ scheme: ["https"] }).custom((value, context) => {
          const document = context.document;
          const availability = document?.availability;
          const productCode = document?.productCode;
          if (
            (availability === "presale" || availability === "available") &&
            !productCode &&
            !value
          ) {
            return "Aktywna sprzedaż wymaga kodu produktu lub adresu checkout HTTPS.";
          }
          return true;
        }),
    }),
    defineField({
      name: "waitlist",
      title: "Lista oczekujących",
      description:
        "Okno zapisu otwierane przyciskiem oferty, gdy e-book jest „Wkrótce dostępny”. Przy sprzedaży pomijane.",
      type: "object",
      group: "offer",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "buttonLabel",
          title: "Etykieta przycisku",
          description: "Bez ceny, np. „Zapisz się na listę oczekujących”.",
          type: "string",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "title",
          title: "Tytuł okna",
          type: "string",
          validation: (rule) => rule.required().max(100),
        }),
        defineField({
          name: "lead",
          title: "Lead okna",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().max(280),
        }),
        defineField({
          name: "form",
          title: "Formularz",
          description: "Formularz rodzaju „Lista oczekujących na e-book”.",
          type: "reference",
          to: [{ type: "form" }],
          options: {
            disableNew: true,
            filter: ({ document }) => ({
              filter: `_type == "form" && formKey == "waitlist" && language == $language`,
              params: {
                language:
                  typeof document.language === "string"
                    ? document.language
                    : "",
              },
            }),
          },
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) =>
        rule
          .custom((value, context) => {
            const availability = (
              context.document as { availability?: string } | undefined
            )?.availability;
            if (availability === "planned" && !value) {
              return "Bez listy oczekujących landing pokaże tylko informację, że sprzedaż nie jest uruchomiona.";
            }
            return true;
          })
          .warning(),
    }),
    defineField({
      name: "reviewedAt",
      title: "Data przeglądu merytorycznego",
      type: "date",
      group: "product",
    }),
    defineField({
      name: "sources",
      title: "Źródła",
      type: "array",
      group: "product",
      of: [{ type: "ebookSource" }],
    }),
    defineField({
      name: "sortOrder",
      title: "Kolejność",
      type: "number",
      group: "product",
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "landing",
      title: "Landing",
      type: "ebookLanding",
      group: "landing",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  orderings: [
    {
      title: "Kolejność",
      name: "sortOrderAsc",
      by: [
        { field: "sortOrder", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
    {
      title: "Tytuł",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
      topic: "topic",
      availability: "availability",
      media: "cover.image",
    },
    prepare: ({ title, language, topic, availability, media }) => ({
      title,
      media,
      subtitle: [language?.toUpperCase(), topic, availability]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});

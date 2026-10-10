import { BookIcon } from "@sanity/icons/Book";
import { defineField, defineType } from "sanity";

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
      type: "string",
      group: "offer",
      options: {
        layout: "radio",
        list: [
          { title: "Zapowiedź", value: "planned" },
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
        list: [{ title: "PDF", value: "pdf" }],
      },
      initialValue: "pdf",
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
        "Wyłącznie HTTPS zatwierdzonego operatora. Wymagany przy przedsprzedaży i sprzedaży. Nie wklejać kotwicy mockupu.",
      type: "url",
      group: "offer",
      validation: (rule) =>
        rule.uri({ scheme: ["https"] }).custom((value, context) => {
          const availability = (
            context.document as { availability?: string } | undefined
          )?.availability;
          if (
            (availability === "presale" || availability === "available") &&
            !value
          ) {
            return "Aktywna sprzedaż wymaga adresu checkout HTTPS.";
          }
          return true;
        }),
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

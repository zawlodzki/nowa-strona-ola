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
      description: "Adres strony produktu, unikalny w obrębie języka.",
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
      name: "sortOrder",
      title: "Kolejność",
      type: "number",
      group: "product",
      validation: (rule) => rule.integer().min(0),
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

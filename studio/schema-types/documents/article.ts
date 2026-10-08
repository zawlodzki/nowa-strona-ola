import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";

import { reservedArticleSlugs } from "../shared/constants";
import {
  languageField,
  relatedArticleFilter,
  sameLanguageFilter,
  slugField,
  translationField,
} from "../shared/fields";

export const articleType = defineType({
  name: "article",
  title: "Artykuł",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Treść", default: true },
    { name: "meta", title: "Metadane" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    { ...languageField, group: "meta" },
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    {
      ...slugField({
        documentType: "article",
        reserved: reservedArticleSlugs,
      }),
      group: "meta",
    },
    { ...translationField("article"), group: "meta" },
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 4,
      group: "content",
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "breadcrumbTitle",
      title: "Krótki tytuł w ścieżce",
      description:
        "Opcjonalny podpis okruszka. Puste pole używa pełnego tytułu.",
      type: "string",
      group: "content",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "proposalNote",
      title: "Nota przykładowa",
      description:
        "Widoczna nad pierwszym akapitem, gdy wpis jest propozycją redakcyjną. Puste pole ukrywa notę.",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "publishedAt",
      title: "Data publikacji",
      type: "datetime",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "updatedAt",
      title: "Data aktualizacji",
      type: "datetime",
      group: "meta",
      validation: (rule) =>
        rule.custom((value, context) => {
          const publishedAt = (
            context.document as { publishedAt?: string } | undefined
          )?.publishedAt;
          if (!value || !publishedAt) return true;
          return value >= publishedAt
            ? true
            : "Aktualizacja nie może być wcześniejsza niż publikacja.";
        }),
    }),
    defineField({
      name: "featured",
      title: "Wyróżnienie na indeksie",
      type: "string",
      group: "meta",
      options: {
        layout: "radio",
        list: [
          { title: "Zwykły", value: "standard" },
          { title: "Wyróżniony", value: "featured" },
        ],
      },
      initialValue: "standard",
    }),
    defineField({
      name: "authors",
      title: "Autorzy",
      type: "array",
      group: "meta",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "author" }],
          options: sameLanguageFilter("author"),
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "categories",
      title: "Kategorie",
      type: "array",
      group: "meta",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "category" }],
          options: sameLanguageFilter("category"),
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "image",
      title: "Obraz wyróżniający",
      type: "mediaObject",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Treść",
      type: "articleBody",
      group: "content",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "sources",
      title: "Źródła",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Tytuł",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: "href",
              title: "Adres",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "title", subtitle: "href" } },
        }),
      ],
    }),
    defineField({
      name: "related",
      title: "Powiązane wpisy",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "article" }],
          options: relatedArticleFilter(),
        }),
      ],
      validation: (rule) => rule.max(4).unique(),
    }),
    defineField({
      name: "relatedEbooks",
      title: "Powiązane e-booki",
      description:
        "Puste pole ukrywa sekcję. Wypełnione musi mieć dokładnie 3 unikalne e-booki w tym samym języku.",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "ebook" }],
          options: sameLanguageFilter("ebook"),
        }),
      ],
      validation: (rule) =>
        rule
          .max(3)
          .unique()
          .custom((value) => {
            if (!Array.isArray(value) || value.length === 0) return true;
            return value.length === 3
              ? true
              : "Wybierz dokładnie 3 e-booki albo zostaw pole puste.";
          }),
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "faqSection",
      group: "content",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "title", language: "language", slug: "slug.current" },
    prepare: ({ title, language, slug }) => ({
      title,
      subtitle: [language?.toUpperCase(), slug].filter(Boolean).join(" · "),
    }),
  },
  orderings: [
    {
      title: "Data publikacji, najnowsze",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});

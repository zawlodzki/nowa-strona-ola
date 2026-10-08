import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";

import { languageField, translationField } from "../shared/fields";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Ustawienia witryny",
  type: "document",
  icon: CogIcon,
  fields: [
    languageField,
    translationField("siteSettings"),
    defineField({
      name: "siteTitle",
      title: "Nazwa witryny",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "contactEmail",
      title: "E-mail kontaktowy",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "footerNote",
      title: "Nota w stopce",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "defaultSeo",
      title: "Domyślne SEO",
      type: "seo",
    }),
    defineField({
      name: "navigation",
      title: "Nawigacja",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "href",
              title: "Adres",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: "headerCta",
      title: "CTA w nagłówku",
      type: "actionLink",
    }),
    defineField({
      name: "legalLinks",
      title: "Linki prawne",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "href",
              title: "Adres",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "blogIndex",
      title: "Indeks bloga",
      description:
        "Tytuł, lead i etykiety listy. Najnowszy wpis i paginacja wynikają z opublikowanych artykułów, bez flagi featured.",
      type: "blogIndexSettings",
    }),
    defineField({
      name: "blogNewsletter",
      title: "Newsletter bloga",
      description:
        "Pełny formularz pod listą wpisów. Ta sama referencja formularza co homepage. Pola sidebaru są na artykuł (pakiet 7).",
      type: "blogNewsletterSettings",
    }),
    defineField({
      name: "socialLinks",
      title: "Profile",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Nazwa",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "href",
              title: "Adres",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "siteTitle", language: "language" },
    prepare: ({ title, language }) => ({
      title: title || "Ustawienia",
      subtitle: language?.toUpperCase(),
    }),
  },
});

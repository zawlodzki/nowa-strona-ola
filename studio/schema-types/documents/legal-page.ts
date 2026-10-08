import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { defineField, defineType } from "sanity";

import { reservedLegalSlugs, reservedPageSlugs } from "../shared/constants";
import { languageField, slugField, translationField } from "../shared/fields";

export const legalPageType = defineType({
  name: "legalPage",
  title: "Strona prawna",
  type: "document",
  icon: BlockContentIcon,
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
        documentType: "legalPage",
        reserved: reservedPageSlugs,
        allowedReserved: reservedLegalSlugs,
        description:
          "Adres publiczny. PL: polityka-prywatnosci, regulamin, lista-cookies-i-identyfikatorow, regulamin-newslettera. EN: privacy, terms.",
      }),
      group: "meta",
    },
    { ...translationField("legalPage"), group: "meta" },
    defineField({
      name: "effectiveFrom",
      title: "Obowiązuje od",
      type: "date",
      group: "meta",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Treść",
      type: "legalBody",
      group: "content",
      validation: (rule) => rule.required().min(1),
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
      title: "Adres",
      name: "slugAsc",
      by: [{ field: "slug.current", direction: "asc" }],
    },
  ],
});

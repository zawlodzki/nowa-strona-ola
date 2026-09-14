import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

import { languageField, slugField, translationField } from "../shared/fields";

export const categoryType = defineType({
  name: "category",
  title: "Kategoria",
  type: "document",
  icon: TagIcon,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Nazwa",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    slugField({ documentType: "category" }),
    translationField("category"),
    defineField({
      name: "description",
      title: "Opis",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
  ],
  preview: {
    select: { title: "title", language: "language", slug: "slug.current" },
    prepare: ({ title, language, slug }) => ({
      title,
      subtitle: [language?.toUpperCase(), slug].filter(Boolean).join(" · "),
    }),
  },
});

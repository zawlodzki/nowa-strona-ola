import { CommentIcon } from "@sanity/icons/Comment";
import { defineField, defineType } from "sanity";

import { languageField, translationField } from "../shared/fields";

export const testimonialType = defineType({
  name: "testimonial",
  title: "Opinia",
  type: "document",
  icon: CommentIcon,
  fields: [
    languageField,
    translationField("testimonial"),
    defineField({
      name: "quote",
      title: "Cytat",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "name",
      title: "Imię i nazwisko",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "role",
      title: "Rola",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "quote", language: "language" },
    prepare: ({ title, subtitle, language }) => ({
      title,
      subtitle: [language?.toUpperCase(), subtitle].filter(Boolean).join(" · "),
    }),
  },
});

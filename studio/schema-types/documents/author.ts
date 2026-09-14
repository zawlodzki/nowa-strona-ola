import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";

import { languageField, slugField, translationField } from "../shared/fields";

export const authorType = defineType({
  name: "author",
  title: "Autor",
  type: "document",
  icon: UserIcon,
  fields: [
    languageField,
    defineField({
      name: "name",
      title: "Imię i nazwisko",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    slugField({
      documentType: "author",
      description: "Używany w podpisach i odnośnikach autora.",
    }),
    translationField("author"),
    defineField({
      name: "role",
      title: "Rola",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "bio",
      title: "Biogram",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "photo",
      title: "Portret",
      type: "mediaObject",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", language: "language" },
    prepare: ({ title, subtitle, language }) => ({
      title,
      subtitle: [language?.toUpperCase(), subtitle].filter(Boolean).join(" · "),
    }),
  },
});

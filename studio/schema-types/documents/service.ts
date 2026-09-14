import { CaseIcon } from "@sanity/icons/Case";
import { defineField, defineType } from "sanity";

import { languageField, slugField, translationField } from "../shared/fields";

export const serviceType = defineType({
  name: "service",
  title: "Usługa",
  type: "document",
  icon: CaseIcon,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Nazwa",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    slugField({ documentType: "service" }),
    translationField("service"),
    defineField({
      name: "summary",
      title: "Streszczenie",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
  ],
  preview: {
    select: { title: "title", language: "language" },
    prepare: ({ title, language }) => ({
      title,
      subtitle: language?.toUpperCase(),
    }),
  },
});

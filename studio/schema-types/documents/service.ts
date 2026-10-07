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
    defineField({
      name: "price",
      title: "Cena",
      description:
        "Kwota w wybranej walucie. Homepage i landing biorą ją stąd.",
      type: "number",
      validation: (rule) => rule.min(0).precision(2),
    }),
    defineField({
      name: "currency",
      title: "Waluta",
      type: "string",
      options: {
        list: [{ title: "PLN", value: "PLN" }],
      },
      initialValue: "PLN",
    }),
    defineField({
      name: "durationMinutes",
      title: "Czas trwania (minuty)",
      type: "number",
      validation: (rule) => rule.integer().min(1).max(480),
    }),
    defineField({
      name: "bookingUrl",
      title: "Adres rezerwacji",
      description:
        "HTTPS do kalendarza płatnej rezerwacji. Tymczasowy placeholder jest dozwolony do czasu właściwego wydarzenia.",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "bookingStatus",
      title: "Status rezerwacji",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Placeholder", value: "placeholder" },
          { title: "Aktywna", value: "live" },
        ],
      },
      initialValue: "placeholder",
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

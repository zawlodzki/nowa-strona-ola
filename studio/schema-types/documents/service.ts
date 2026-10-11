import { CaseIcon } from "@sanity/icons/Case";
import { defineArrayMember, defineField, defineType } from "sanity";

import { languageField, slugField, translationField } from "../shared/fields";

export const serviceType = defineType({
  name: "service",
  title: "Oferta konsultacji",
  description:
    "Wspólne dane oferty używane na stronie głównej, O mnie i stronie konsultacji. Układ i tekst podstrony edytuj w Strony → Konsultacje.",
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
      name: "serviceType",
      title: "Rodzaj usługi",
      description:
        "Krótka nazwa kategorii usługi, np. „Konsultacja dietetyczna”.",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "channel",
      title: "Forma",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Online", value: "online" },
          { title: "Stacjonarnie", value: "inPerson" },
        ],
      },
      initialValue: "online",
    }),
    defineField({
      name: "audience",
      title: "Dla kogo",
      description: "Jedno zdanie zgodne z sekcją „Dla kogo” na stronie usługi.",
      type: "string",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "deliverables",
      title: "Co klientka dostaje",
      description: "Krótkie punkty widoczne na stronie usługi.",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "terms",
      title: "Regulamin",
      type: "reference",
      to: [{ type: "legalPage" }],
      options: { disableNew: true },
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

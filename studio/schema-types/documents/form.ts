import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineArrayMember, defineField, defineType } from "sanity";

import { languageField, translationField } from "../shared/fields";

export const formKeyOptions = [
  { title: "Newsletter", value: "newsletter" },
  { title: "Kontakt", value: "contact" },
  { title: "Odstąpienie od umowy", value: "withdrawal" },
] as const;

function isFormKeyOption(value: string): boolean {
  return formKeyOptions.some((option) => option.value === value);
}

export const formType = defineType({
  name: "form",
  title: "Formularz",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    languageField,
    defineField({
      name: "title",
      title: "Nazwa wewnętrzna",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    translationField("form"),
    defineField({
      name: "formKey",
      title: "Rodzaj formularza",
      type: "string",
      description:
        "Stały klucz przekazywany do n8n. Decyduje o obsłudze zgłoszenia.",
      options: { layout: "radio", list: [...formKeyOptions] },
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            typeof value === "string" && isFormKeyOption(value)
              ? true
              : "Wybierz newsletter, kontakt albo odstąpienie.",
          ),
    }),
    defineField({
      name: "version",
      title: "Wersja treści",
      type: "string",
      description:
        "Wersja dokumentu prawnego „Zgody i formularze”, z którego pochodzi copy, np. 2.3.",
      validation: (rule) =>
        rule.required().regex(/^\d+\.\d+$/, { name: "wersja, np. 2.3" }),
    }),
    defineField({
      name: "submitLabel",
      title: "Etykieta wysyłki",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "notice",
      title: "Informacja pod przyciskiem",
      type: "text",
      rows: 4,
      description:
        "Odnośniki: [tekst](/adres/). Pogrubienie: **tekst**. Zapisz brzmienie zgodne z dokumentem prawnym.",
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: "noticeConsentId",
      title: "Zgoda wyrażana wysłaniem",
      type: "string",
      description:
        "Identyfikator zgody z mapy zgód (np. Z6), gdy samo wysłanie formularza oznacza zgodę opisaną w informacji.",
      hidden: ({ document }) => !document?.notice,
      validation: (rule) =>
        rule.regex(/^Z\d+$/, { name: "identyfikator zgody, np. Z6" }),
    }),
    defineField({
      name: "successMessage",
      title: "Komunikat sukcesu",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "errorMessage",
      title: "Komunikat błędu wysyłki",
      type: "string",
      description:
        "Pokazywany, gdy wysłanie się nie uda. Wpisane dane zostają w formularzu.",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "noscriptMessage",
      title: "Komunikat bez JavaScript",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "fields",
      title: "Pola",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Identyfikator",
              type: "string",
              validation: (rule) =>
                rule.required().regex(/^[a-z][a-z0-9]*$/i, {
                  name: "identyfikator",
                }),
            }),
            defineField({
              name: "input",
              title: "Typ",
              type: "string",
              options: {
                list: [
                  { title: "Tekst", value: "text" },
                  { title: "E-mail", value: "email" },
                  { title: "Telefon", value: "tel" },
                  { title: "Dłuższy tekst", value: "textarea" },
                  { title: "Lista", value: "select" },
                  { title: "Zgoda", value: "checkbox" },
                  { title: "Data", value: "date" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              description:
                "Przy zgodzie można wstawić odnośniki w postaci [tekst](/adres/). Identyfikator zgody (np. Z1) trafia do listy zgód zgłoszenia.",
              validation: (rule) => rule.required().max(400),
            }),
            defineField({
              name: "errorMessage",
              title: "Komunikat błędu",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: "required",
              title: "Wymagane",
              type: "string",
              options: {
                layout: "radio",
                list: [
                  { title: "Tak", value: "required" },
                  { title: "Nie", value: "optional" },
                ],
              },
              initialValue: "required",
            }),
            defineField({
              name: "defaultValue",
              title: "Tekst początkowy",
              type: "text",
              rows: 3,
              description: "Edytowalny tekst wstawiony do pola na start.",
              hidden: ({ parent }) => parent?.input !== "textarea",
              validation: (rule) => rule.max(2000),
            }),
            defineField({
              name: "options",
              title: "Opcje listy",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              hidden: ({ parent }) => parent?.input !== "select",
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "input" },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "title", language: "language", formKey: "formKey" },
    prepare: ({ title, language, formKey }) => ({
      title,
      subtitle: [language?.toUpperCase(), formKey].filter(Boolean).join(" · "),
    }),
  },
});

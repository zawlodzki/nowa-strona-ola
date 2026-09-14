import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineArrayMember, defineField, defineType } from "sanity";

import { languageField, translationField } from "../shared/fields";

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
      name: "submitLabel",
      title: "Etykieta wysyłki",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "successMessage",
      title: "Komunikat sukcesu",
      type: "string",
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
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              validation: (rule) => rule.required().max(80),
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
    select: { title: "title", language: "language" },
    prepare: ({ title, language }) => ({
      title,
      subtitle: language?.toUpperCase(),
    }),
  },
});

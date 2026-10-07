import { CommentIcon } from "@sanity/icons/Comment";
import { defineField, defineType } from "sanity";

import {
  languageField,
  sameLanguageFilter,
  translationField,
} from "../shared/fields";

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
      name: "anonymous",
      title: "Anonimowa",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "displayLabel",
      title: "Podpis widoczny",
      description:
        "Np. „Opinia o dotychczasowej współpracy”. Wymagany przy opinii anonimowej.",
      type: "string",
      validation: (rule) =>
        rule.max(120).custom((value, context) => {
          const parent = context.parent as { anonymous?: boolean } | undefined;
          if (parent?.anonymous && !value) {
            return "Anonimowa opinia wymaga podpisu widocznego.";
          }
          return true;
        }),
    }),
    defineField({
      name: "name",
      title: "Imię i nazwisko",
      type: "string",
      hidden: ({ parent }) => parent?.anonymous === true,
      validation: (rule) =>
        rule.max(80).custom((value, context) => {
          const parent = context.parent as { anonymous?: boolean } | undefined;
          if (!parent?.anonymous && !value) {
            return "Podaj imię albo oznacz opinię jako anonimową.";
          }
          return true;
        }),
    }),
    defineField({
      name: "role",
      title: "Rola",
      type: "string",
      hidden: ({ parent }) => parent?.anonymous === true,
      validation: (rule) =>
        rule.max(120).custom((value, context) => {
          const parent = context.parent as { anonymous?: boolean } | undefined;
          if (!parent?.anonymous && !value) {
            return "Podaj rolę albo oznacz opinię jako anonimową.";
          }
          return true;
        }),
    }),
    defineField({
      name: "scope",
      title: "Zakres",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Dotychczasowa współpraca", value: "cooperation" },
          { title: "Produkt", value: "product" },
        ],
      },
      initialValue: "cooperation",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "product",
      title: "Produkt",
      type: "reference",
      to: [{ type: "ebook" }],
      options: sameLanguageFilter("ebook"),
      hidden: ({ parent }) => parent?.scope !== "product",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { scope?: string } | undefined;
          if (parent?.scope === "product" && !value) {
            return "Opinia o produkcie wymaga referencji e-booka.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "name",
      displayLabel: "displayLabel",
      anonymous: "anonymous",
      subtitle: "quote",
      language: "language",
    },
    prepare: ({ title, displayLabel, anonymous, subtitle, language }) => ({
      title: anonymous ? displayLabel || "Anonimowa opinia" : title,
      subtitle: [language?.toUpperCase(), subtitle].filter(Boolean).join(" · "),
    }),
  },
});

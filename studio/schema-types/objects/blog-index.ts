import { BookIcon } from "@sanity/icons/Book";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineField, defineType } from "sanity";

export const blogIndexSettingsType = defineType({
  name: "blogIndexSettings",
  title: "Indeks bloga",
  type: "object",
  icon: BookIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "note",
      title: "Nota demonstracyjna",
      description:
        "Opcjonalna. Pokazuje, że copy i daty są przykładowe. Puste pole pomija notę.",
      type: "string",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "latestTitle",
      title: "Nagłówek najnowszego wpisu",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "collectionTitle",
      title: "Nagłówek listy",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "readActionLabel",
      title: "Etykieta odnośnika karty",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "allCategoriesLabel",
      title: "Etykieta wszystkich kategorii",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "emptyMessage",
      title: "Komunikat pustej listy",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "emptyCategoryMessage",
      title: "Komunikat pustej kategorii",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "previousLabel",
      title: "Etykieta poprzedniej strony",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "nextLabel",
      title: "Etykieta następnej strony",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "paginationLabel",
      title: "Etykieta nawigacji stron",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "seoTitle",
      title: "Tytuł SEO indeksu",
      type: "string",
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "Opis SEO indeksu",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(180),
    }),
  ],
});

export const blogNewsletterSettingsType = defineType({
  name: "blogNewsletterSettings",
  title: "Newsletter bloga",
  type: "object",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "enabled",
      title: "Widoczny",
      type: "boolean",
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "form",
      title: "Formularz",
      type: "reference",
      to: [{ type: "form" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sidebarTitle",
      title: "Tytuł CTA w kolumnie artykułu",
      description:
        "Używane w pakiecie Article3a. Na indeksie kolekcji pomijane.",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "sidebarLead",
      title: "Lead CTA w kolumnie artykułu",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "sidebarActionLabel",
      title: "Etykieta CTA w kolumnie artykułu",
      type: "string",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "sidebarNote",
      title: "Nota pod CTA w kolumnie artykułu",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
  ],
});

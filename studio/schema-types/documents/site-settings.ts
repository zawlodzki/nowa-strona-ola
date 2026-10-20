import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";

import {
  languageField,
  sameLanguageFilter,
  translationField,
} from "../shared/fields";
import { validateHref } from "../objects/action-link";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Ustawienia witryny",
  type: "document",
  icon: CogIcon,
  fields: [
    {
      ...languageField,
      readOnly: ({ document }) => Boolean(document?._id),
      validation: (rule) =>
        rule.required().custom((value, context) => {
          const id = context.document?._id?.replace(/^drafts\./, "");
          return (
            id === `siteSettings-${value}` ||
            "Ustawienia mają stały dokument PL/EN. Otwórz go przez Ustawienia witryny."
          );
        }),
    },
    translationField("siteSettings"),
    defineField({
      name: "siteTitle",
      title: "Nazwa witryny",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "contactEmail",
      title: "E-mail kontaktowy",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "footerNote",
      title: "Nota w stopce",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "defaultSeo",
      title: "Domyślne SEO",
      type: "seo",
    }),
    defineField({
      name: "siteOwner",
      title: "Właścicielka serwisu",
      description:
        "Autorka, której dane (imię, rola, profile, tematy, kwalifikacje) opisują osobę w danych strukturalnych każdej strony.",
      type: "reference",
      to: [{ type: "author" }],
      options: sameLanguageFilter("author"),
    }),
    defineField({
      name: "seller",
      title: "Sprzedawca",
      description:
        "Dane firmy sprzedającej konsultacje i e-booki. Muszą być takie same jak w regulaminie i stopce (decyzja 11.10.2026).",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "legalName",
          title: "Nazwa firmy",
          type: "string",
          validation: (rule) => rule.required().max(160),
        }),
        defineField({
          name: "street",
          title: "Ulica i numer",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "postalCode",
          title: "Kod pocztowy",
          type: "string",
          validation: (rule) =>
            rule.required().regex(/^\d{2}-\d{3}$/, { name: "kod pocztowy" }),
        }),
        defineField({
          name: "city",
          title: "Miejscowość",
          type: "string",
          validation: (rule) => rule.required().max(80),
        }),
        defineField({
          name: "nip",
          title: "NIP",
          type: "string",
          validation: (rule) =>
            rule.required().regex(/^\d{10}$/, { name: "10 cyfr" }),
        }),
        defineField({
          name: "krs",
          title: "KRS",
          type: "string",
          validation: (rule) => rule.regex(/^\d{10}$/, { name: "10 cyfr" }),
        }),
        defineField({
          name: "regon",
          title: "REGON",
          type: "string",
          validation: (rule) =>
            rule.regex(/^(\d{9}|\d{14})$/, { name: "9 lub 14 cyfr" }),
        }),
        defineField({
          name: "email",
          title: "E-mail",
          type: "string",
          validation: (rule) => rule.email(),
        }),
      ],
    }),
    defineField({
      name: "defaultOgImage",
      title: "Domyślny obraz udostępniania",
      description:
        "Używany, gdy strona nie ma własnego obrazu. Prawdziwe zdjęcie, nie grafika generowana jako portret.",
      type: "mediaObject",
    }),
    defineField({
      name: "navigation",
      title: "Nawigacja",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "href",
              title: "Adres",
              type: "string",
              validation: (rule) => rule.required().custom(validateHref),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(8),
    }),
    defineField({
      name: "headerCta",
      title: "CTA w nagłówku",
      type: "actionLink",
    }),
    defineField({
      name: "legalLinks",
      title: "Linki prawne",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "href",
              title: "Adres",
              type: "string",
              validation: (rule) => rule.required().custom(validateHref),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "copyright",
      title: "Prawa autorskie w stopce",
      type: "string",
      description: "Np. © 2026 Wellbiz sp. z o.o. · Treści: …",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "testimonialsDisclosure",
      title: "Informacja pod opiniami",
      description:
        "Wyświetlana pod każdą sekcją opinii: jak weryfikujemy opinie i że efekty nie są gwarantowane.",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(400),
    }),
    defineField({
      name: "blogIndex",
      title: "Indeks bloga — poprzednia konfiguracja",
      deprecated: {
        reason:
          "Edytuj Strony → Blog. Pole pozostaje jako źródło migracji istniejącej treści.",
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      description:
        "Tytuł, lead i etykiety listy. Najnowszy wpis i paginacja wynikają z opublikowanych artykułów, bez flagi featured.",
      type: "blogIndexSettings",
    }),
    defineField({
      name: "blogNewsletter",
      title: "Newsletter w artykułach",
      description:
        "Wspólna sekcja i kolumna newslettera w artykułach. Newsletter listy wpisów edytuj w Strony → Blog → Formularz.",
      type: "blogNewsletterSettings",
    }),
    defineField({
      name: "socialLinks",
      title: "Profile",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Nazwa",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "href",
              title: "Adres",
              type: "url",
              validation: (rule) => rule.required().uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "siteTitle", language: "language" },
    prepare: ({ title, language }) => ({
      title: title || "Ustawienia",
      subtitle: language?.toUpperCase(),
    }),
  },
});

import { BookIcon } from "@sanity/icons/Book";
import { TagIcon } from "@sanity/icons/Tag";
import { TiersIcon } from "@sanity/icons/Tiers";
import {
  defineArrayMember,
  defineField,
  defineType,
  type StringRule,
} from "sanity";

import { sameLanguageFilter } from "../shared/fields";

const requiredHeading = (rule: StringRule) => rule.required().max(120);

function uniqueKeys(items: unknown, label: string) {
  if (!Array.isArray(items)) return true;
  const keys = items
    .map((item) => {
      if (!item || typeof item !== "object" || !("_key" in item)) return "";
      const key = (item as { _key?: unknown })._key;
      return typeof key === "string" ? key : "";
    })
    .filter(Boolean);
  if (new Set(keys).size !== keys.length) {
    return `Klucze w ${label} muszą być unikalne.`;
  }
  return true;
}

export const ebookChapterType = defineType({
  name: "ebookChapter",
  title: "Rozdział",
  type: "object",
  icon: TiersIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "summary",
      title: "Streszczenie",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "summary" },
  },
});

export const ebookMaterialType = defineType({
  name: "ebookMaterial",
  title: "Materiał w pakiecie",
  type: "object",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Nazwa",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "description",
      title: "Opis",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});

export const ebookSourceType = defineType({
  name: "ebookSource",
  title: "Źródło",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "href",
      title: "Adres",
      type: "url",
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ["https"] })
          .error("Podaj adres HTTPS."),
    }),
    defineField({
      name: "scope",
      title: "Zakres informacji",
      type: "string",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "href" },
  },
});

export const ebookDeliveryType = defineType({
  name: "ebookDelivery",
  title: "Dostarczenie",
  type: "object",
  fields: [
    defineField({
      name: "description",
      title: "Opis",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "timeline",
      title: "Termin",
      description: "Wymagany przy przedsprzedaży.",
      type: "string",
      validation: (rule) => rule.max(160),
    }),
  ],
});

export const ebookLandingType = defineType({
  name: "ebookLanding",
  title: "Landing e-booka",
  type: "object",
  icon: BookIcon,
  fields: [
    defineField({
      name: "variant",
      title: "Wariant",
      type: "string",
      options: {
        layout: "radio",
        list: [{ title: "Cherry 3a", value: "cherry3a" }],
      },
      initialValue: "cherry3a",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroTitle",
      title: "Tytuł hero",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "heroLead",
      title: "Lead hero",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "primaryLabel",
      title: "Główne CTA",
      description: "Prowadzi do sekcji ceny. Nie wklejać checkoutu.",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "secondaryLabel",
      title: "Drugie CTA",
      description: "Prowadzi do podglądu próbki.",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "facts",
      title: "Pasek faktów",
      description:
        "Trzy krótkie fakty pod hero. Liczba rozdziałów i materiały pochodzą z produktu; tutaj tylko etykiety z mockupu.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Nagłówek",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: "detail",
              title: "Dopisek",
              type: "string",
              validation: (rule) => rule.required().max(120),
            }),
          ],
          preview: { select: { title: "title", subtitle: "detail" } },
        }),
      ],
      validation: (rule) =>
        rule.length(3).custom((items) => uniqueKeys(items, "faktach")),
    }),
    defineField({
      name: "problemTitle",
      title: "Nagłówek problemu",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "problemParagraphs",
      title: "Akapity problemu",
      type: "array",
      of: [{ type: "text" }],
      validation: (rule) => rule.required().min(1).max(4),
    }),
    defineField({
      name: "problemQuestions",
      title: "Pytania przy półce",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().length(3),
    }),
    defineField({
      name: "problemMedia",
      title: "Ilustracja problemu",
      description:
        "Opcjonalna. Bez pliku renderer pokazuje statyczną półkę z mockupu.",
      type: "mediaObject",
    }),
    defineField({
      name: "audienceTitle",
      title: "Nagłówek odbiorczyń",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "audienceLead",
      title: "Lead odbiorczyń",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "audienceItems",
      title: "Sytuacje",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Tytuł",
              type: "string",
              validation: requiredHeading,
            }),
            defineField({
              name: "body",
              title: "Opis",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(280),
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(6)
          .custom((items) => uniqueKeys(items, "sytuacjach")),
    }),
    defineField({
      name: "educationNote",
      title: "Nota edukacyjna",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: "contentsTitle",
      title: "Nagłówek zawartości",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "contentsLead",
      title: "Lead zawartości",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "ingredients",
      title: "Omawiane składniki",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1).max(12),
    }),
    defineField({
      name: "sampleTitle",
      title: "Nagłówek próbki",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "sampleLead",
      title: "Lead próbki",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "sampleMedia",
      title: "Obraz próbki",
      description:
        "Opcjonalny. Bez pliku renderer pokazuje kontrolowaną kartę pracy.",
      type: "mediaObject",
    }),
    defineField({
      name: "sampleFields",
      title: "Pola karty pracy",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Etykieta",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
          ],
          preview: { select: { title: "label" } },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .max(8)
          .custom((items) => uniqueKeys(items, "polach próbki")),
    }),
    defineField({
      name: "sampleCaption",
      title: "Podpis próbki",
      type: "string",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "outcomesTitle",
      title: "Nagłówek efektów",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "outcomesLead",
      title: "Lead efektów",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "comparisonItems",
      title: "Przed / po",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "before",
              title: "Przed",
              type: "string",
              validation: (rule) => rule.required().max(120),
            }),
            defineField({
              name: "after",
              title: "Po",
              type: "string",
              validation: (rule) => rule.required().max(120),
            }),
          ],
          preview: { select: { title: "before", subtitle: "after" } },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .max(6)
          .custom((items) => uniqueKeys(items, "porównaniu")),
    }),
    defineField({
      name: "outcomesNote",
      title: "Nota efektów",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: "authorTitle",
      title: "Nagłówek autorki",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "authorParagraphs",
      title: "Akapity autorki",
      type: "array",
      of: [{ type: "text" }],
      validation: (rule) => rule.required().min(1).max(4),
    }),
    defineField({
      name: "offerTitle",
      title: "Nagłówek oferty",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "offerLead",
      title: "Lead oferty",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "purchaseLabel",
      title: "Etykieta zakupu",
      description:
        "Bez ceny. Renderer dokleja kwotę z produktu. Przy statusie zapowiedzi nie jest to checkout.",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "offerNote",
      title: "Nota oferty",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: "testimonialsTitle",
      title: "Nagłówek opinii",
      type: "string",
      validation: requiredHeading,
    }),
    defineField({
      name: "testimonialsContext",
      title: "Kontekst opinii",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: "testimonialsScope",
      title: "Zakres opinii",
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
      name: "testimonials",
      title: "Opinie",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "testimonial" }],
          options: sameLanguageFilter("testimonial"),
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(4)
          .unique()
          .error("Wybierz unikalne opinie."),
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "faqSection",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "heroTitle", variant: "variant" },
    prepare: ({ title, variant }) => ({
      title: title || "Landing e-booka",
      subtitle: variant,
    }),
  },
});

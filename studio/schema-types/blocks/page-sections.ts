import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { BillIcon } from "@sanity/icons/Bill";
import { BookIcon } from "@sanity/icons/Book";
import { CaseIcon } from "@sanity/icons/Case";
import { ClockIcon } from "@sanity/icons/Clock";
import { CommentIcon } from "@sanity/icons/Comment";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { HashIcon } from "@sanity/icons/Hash";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { ImageIcon } from "@sanity/icons/Image";
import { LaunchIcon } from "@sanity/icons/Launch";
import { LinkIcon } from "@sanity/icons/Link";
import { MarkerIcon } from "@sanity/icons/Marker";
import { StarIcon } from "@sanity/icons/Star";
import { TiersIcon } from "@sanity/icons/Tiers";
import { UserIcon } from "@sanity/icons/User";
import { UsersIcon } from "@sanity/icons/Users";
import { UlistIcon } from "@sanity/icons/Ulist";
import {
  defineArrayMember,
  defineField,
  defineType,
  type StringRule,
} from "sanity";

import { sameLanguageFilter, themeField } from "../shared/fields";

import { blogIndexSettingsType } from "../objects/blog-index";

const requiredString = (rule: StringRule) => rule.required().max(120);

function sectionPreview(subtitle: string) {
  return {
    select: { title: "title" },
    prepare: ({ title }: { title?: string }) => ({
      title: title || "Bez tytułu",
      subtitle,
    }),
  };
}

export const heroSectionType = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  icon: LaunchIcon,
  fields: [
    defineField({
      name: "variant",
      title: "Wariant",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Editorial", value: "editorial" },
          { title: "Cinematic", value: "cinematic" },
          { title: "Split", value: "split" },
        ],
      },
      initialValue: "editorial",
      validation: (rule) => rule.required(),
    }),
    themeField,
    defineField({
      name: "eyebrow",
      title: "Nadtytuł",
      description: "Opcjonalny. Wariant homepage 3a nie używa nadtytułu.",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "primary",
      title: "Główna akcja",
      type: "actionLink",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondary",
      title: "Druga akcja",
      type: "actionLink",
    }),
    defineField({
      name: "media",
      title: "Medium",
      type: "mediaObject",
      hidden: ({ parent }) => parent?.variant !== "split",
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { variant?: string } | undefined;
          if (parent?.variant === "split" && !value) {
            return "Wariant split wymaga medium.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: "title", variant: "variant" },
    prepare: ({ title, variant }) => ({
      title: title || "Hero",
      subtitle: `Hero · ${variant ?? "editorial"}`,
    }),
  },
});

export const textSectionType = defineType({
  name: "textSection",
  title: "Tekst",
  type: "object",
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Nadtytuł",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "body",
      title: "Akapity",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: sectionPreview("Tekst"),
});

function isQuestionsVariant(parent: unknown) {
  return (parent as { variant?: string } | undefined)?.variant === "questions";
}

export const textImageSectionType = defineType({
  name: "textImageSection",
  title: "Tekst i obraz",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "variant",
      title: "Wariant",
      description:
        "Mapa pytań to diagram z HTML na landingu konsultacji; nie wymaga fotografii.",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Tekst z fotografią", value: "photo" },
          { title: "Mapa pytań", value: "questions" },
        ],
      },
      initialValue: "photo",
    }),
    defineField({
      name: "eyebrow",
      title: "Nadtytuł",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Wyróżniony lead",
      type: "text",
      rows: 2,
      hidden: ({ parent }) => isQuestionsVariant(parent),
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "body",
      title: "Akapity",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "action",
      title: "Akcja",
      type: "actionLink",
      hidden: ({ parent }) => isQuestionsVariant(parent),
    }),
    defineField({
      name: "mediaPosition",
      title: "Położenie medium",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Przy końcu (treść pierwsza)", value: "end" },
          { title: "Na początku", value: "start" },
        ],
      },
      initialValue: "end",
      hidden: ({ parent }) => isQuestionsVariant(parent),
      validation: (rule) =>
        rule.custom((value, context) =>
          value || isQuestionsVariant(context.parent)
            ? true
            : "Wybierz położenie medium.",
        ),
    }),
    defineField({
      name: "media",
      title: "Medium",
      type: "mediaObject",
      hidden: ({ parent }) => isQuestionsVariant(parent),
      validation: (rule) =>
        rule.custom((value, context) =>
          value || isQuestionsVariant(context.parent)
            ? true
            : "Wariant z fotografią wymaga medium.",
        ),
    }),
    defineField({
      name: "secondaryMedia",
      title: "Drugie medium",
      description: "Opcjonalny kadr nakładany, np. posiłek w sekcji O mnie.",
      type: "mediaObject",
      hidden: ({ parent }) => isQuestionsVariant(parent),
    }),
    defineField({
      name: "prompts",
      title: "Pytania na mapie",
      description: "Krótkie pytania odbiorczyni, od 3 do 8.",
      type: "array",
      of: [
        defineArrayMember({
          type: "string",
          validation: (rule) => rule.max(60),
        }),
      ],
      hidden: ({ parent }) => !isQuestionsVariant(parent),
      validation: (rule) =>
        rule.custom((prompts, context) => {
          if (!isQuestionsVariant(context.parent)) return true;
          const count = Array.isArray(prompts) ? prompts.length : 0;
          return count >= 3 && count <= 8
            ? true
            : "Mapa pytań wymaga od 3 do 8 pytań.";
        }),
    }),
    defineField({
      name: "resolutionEyebrow",
      title: "Nadtytuł odpowiedzi",
      type: "string",
      hidden: ({ parent }) => !isQuestionsVariant(parent),
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "resolutionTitle",
      title: "Odpowiedź na mapie",
      type: "string",
      hidden: ({ parent }) => !isQuestionsVariant(parent),
      validation: (rule) =>
        rule
          .max(80)
          .custom((value, context) =>
            value || !isQuestionsVariant(context.parent)
              ? true
              : "Mapa pytań wymaga odpowiedzi.",
          ),
    }),
    defineField({
      name: "caption",
      title: "Podpis mapy",
      type: "string",
      hidden: ({ parent }) => !isQuestionsVariant(parent),
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: sectionPreview("Tekst i obraz"),
});

export const audienceIconOptions = [
  { title: "Strzałka", value: "arrow" },
  { title: "Znacznik", value: "check" },
] as const;

export const audienceSectionType = defineType({
  name: "audienceSection",
  title: "Z kim pracuję",
  type: "object",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "title",
      title: "Nagłówek",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "items",
      title: "Karty",
      description: "Od 4 do 6 kart: dla kogo jest współpraca.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Tytuł",
              type: "string",
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: "body",
              title: "Krótki opis",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(200),
            }),
            defineField({
              name: "icon",
              title: "Ikona",
              description: "Opcjonalny znak SVG z zestawu serwisu.",
              type: "string",
              options: {
                list: [...audienceIconOptions],
                layout: "radio",
                direction: "horizontal",
              },
            }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        }),
      ],
      validation: (rule) => rule.required().min(4).max(6),
    }),
  ],
  preview: sectionPreview("Z kim pracuję"),
});

export const cardsSectionType = defineType({
  name: "cardsSection",
  title: "Karty",
  type: "object",
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: "variant",
      title: "Wariant",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Karty z medium", value: "media" },
          { title: "Lista odnośników", value: "links" },
          { title: "Sytuacje odbiorczyni (bez linków)", value: "situations" },
          { title: "Cele rozmowy (bez linków)", value: "goals" },
        ],
      },
      initialValue: "media",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Nadtytuł",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "items",
      title: "Karty",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Tytuł",
              type: "string",
              validation: requiredString,
            }),
            defineField({
              name: "body",
              title: "Opis",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(240),
            }),
            defineField({
              name: "href",
              title: "Adres",
              description:
                "Wymagany dla kart z medium i listy odnośników. Sytuacje i cele są bez linków.",
              type: "string",
            }),
            defineField({
              name: "status",
              title: "Status",
              description:
                "Opcjonalny, np. „W przygotowaniu”. Renderer listy odnośników go pokazuje.",
              type: "string",
              validation: (rule) => rule.max(80),
            }),
            defineField({
              name: "media",
              title: "Medium",
              type: "mediaObject",
            }),
          ],
          preview: { select: { title: "title", subtitle: "href" } },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .max(6)
          .custom((items, context) => {
            const parent = context.parent as { variant?: string } | undefined;
            const variant = parent?.variant ?? "media";
            const cards = (items ?? []).filter(
              (item): item is Record<string, unknown> =>
                Boolean(item) && typeof item === "object",
            );
            if (
              (variant === "media" || variant === "links") &&
              cards.some((item) => !item.href)
            ) {
              return "Karty z medium i lista odnośników wymagają adresu na każdej karcie.";
            }
            if (variant === "media" && cards.some((item) => !item.media)) {
              return "Wariant z medium wymaga obrazu na każdej karcie.";
            }
            return true;
          }),
    }),
    defineField({
      name: "closing",
      title: "Akapit zamykający",
      description: "Opcjonalne zdanie po kartach, np. przy celach rozmowy.",
      type: "text",
      rows: 2,
      hidden: ({ parent }) =>
        parent?.variant !== "situations" && parent?.variant !== "goals",
      validation: (rule) => rule.max(240),
    }),
  ],
  preview: sectionPreview("Karty"),
});

export const listSectionType = defineType({
  name: "listSection",
  title: "Lista",
  type: "object",
  icon: UlistIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      description:
        "Na landingu konsultacji jest etykietą ścieżki dla czytnika, nie widocznym nagłówkiem.",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "items",
      title: "Punkty",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(2),
    }),
  ],
  preview: sectionPreview("Lista"),
});

export const processSectionType = defineType({
  name: "processSection",
  title: "Proces",
  type: "object",
  icon: ClockIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "steps",
      title: "Kroki",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Nazwa",
              type: "string",
              validation: requiredString,
            }),
            defineField({
              name: "body",
              title: "Opis",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(240),
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
      validation: (rule) => rule.required().min(3).max(6),
    }),
    defineField({
      name: "note",
      title: "Uwaga",
      description:
        "Opcjonalna granica zakresu albo przygotowanie do spotkania („Co przygotować?”).",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "media",
      title: "Medium",
      description: "Opcjonalna fotografia obok kroków.",
      type: "mediaObject",
    }),
  ],
  preview: sectionPreview("Proces"),
});

export const metricsSectionType = defineType({
  name: "metricsSection",
  title: "Liczby",
  type: "object",
  icon: HashIcon,
  fields: [
    defineField({
      name: "variant",
      title: "Wariant",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Siatka liczb", value: "grid" },
          { title: "Podejście z jedną liczbą", value: "approach" },
        ],
      },
      initialValue: "grid",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "items",
      title: "Wskaźniki",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Wartość",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: "suffix",
              title: "Przyrostek",
              type: "string",
              validation: (rule) => rule.max(24),
            }),
            defineField({
              name: "label",
              title: "Opis",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .max(4)
          .custom((items, context) => {
            const parent = context.parent as { variant?: string } | undefined;
            const count = Array.isArray(items) ? items.length : 0;
            if ((parent?.variant ?? "grid") === "grid" && count < 2) {
              return "Siatka liczb wymaga co najmniej dwóch wskaźników.";
            }
            if (parent?.variant === "approach" && count !== 1) {
              return "Wariant podejścia ma dokładnie jeden wskaźnik.";
            }
            return true;
          }),
    }),
    defineField({
      name: "highlights",
      title: "Wyróżnienia",
      description: "Trzy opisy podejścia przy wariancie z jedną liczbą.",
      type: "array",
      hidden: ({ parent }) => parent?.variant !== "approach",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Nagłówek",
              type: "string",
              validation: requiredString,
            }),
            defineField({
              name: "body",
              title: "Opis",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(240),
            }),
          ],
          preview: { select: { title: "title" } },
        }),
      ],
      validation: (rule) =>
        rule.custom((highlights, context) => {
          const parent = context.parent as { variant?: string } | undefined;
          if (parent?.variant !== "approach") return true;
          const count = Array.isArray(highlights) ? highlights.length : 0;
          if (count !== 0 && count !== 3) {
            return "Wariant podejścia wymaga trzech wyróżnień albo żadnego.";
          }
          return true;
        }),
    }),
  ],
  preview: sectionPreview("Liczby"),
});

export const pricingSectionType = defineType({
  name: "pricingSection",
  title: "Pakiety",
  type: "object",
  icon: TiersIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "plans",
      title: "Pakiety",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Nazwa",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: "price",
              title: "Cena albo ramy",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "summary",
              title: "Streszczenie",
              type: "text",
              rows: 2,
              validation: (rule) => rule.required().max(200),
            }),
            defineField({
              name: "emphasis",
              title: "Wyróżnienie",
              type: "string",
              options: {
                layout: "radio",
                list: [
                  { title: "Standardowy", value: "standard" },
                  { title: "Wyróżniony", value: "featured" },
                ],
              },
              initialValue: "standard",
            }),
            defineField({
              name: "features",
              title: "Składowe",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              validation: (rule) => rule.required().min(2),
            }),
            defineField({
              name: "action",
              title: "Akcja",
              type: "actionLink",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "name", subtitle: "price" } },
        }),
      ],
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
  preview: sectionPreview("Pakiety"),
});

export const testimonialsSectionType = defineType({
  name: "testimonialsSection",
  title: "Opinie",
  type: "object",
  icon: StarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "items",
      title: "Opinie",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "testimonial" }],
          options: sameLanguageFilter("testimonial"),
        }),
      ],
      validation: (rule) => rule.required().min(2).max(6),
    }),
  ],
  preview: sectionPreview("Opinie"),
});

export const expertSectionType = defineType({
  name: "expertSection",
  title: "Ekspert",
  type: "object",
  icon: UserIcon,
  fields: [
    defineField({
      name: "title",
      title: "Nadtytuł sekcji",
      description: "W szablonach 3a jest nagłówkiem sekcji.",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "person",
      title: "Osoba",
      description:
        "Wspólny profil autora. Imię, rola i wykształcenie pochodzą stąd.",
      type: "reference",
      to: [{ type: "author" }],
      options: sameLanguageFilter("author"),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Wprowadzenie",
      description: "Opcjonalne wyróżnione zdanie przed opisem.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "body",
      title: "Opis",
      description: "Akapity oddziel pustą linią.",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "metric",
      title: "Wskaźnik",
      description:
        "Opcjonalny. Użyj tej samej potwierdzonej liczby co na homepage, bez nowych danych.",
      type: "object",
      fields: [
        defineField({
          name: "value",
          title: "Wartość",
          type: "number",
          validation: (rule) => rule.required().min(0),
        }),
        defineField({
          name: "suffix",
          title: "Przyrostek",
          type: "string",
          validation: (rule) => rule.max(24),
        }),
        defineField({
          name: "label",
          title: "Opis",
          type: "string",
          validation: (rule) => rule.required().max(80),
        }),
      ],
    }),
    defineField({
      name: "action",
      title: "Akcja",
      description: "Opcjonalna.",
      type: "actionLink",
    }),
    defineField({
      name: "media",
      title: "Portret",
      type: "mediaObject",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: sectionPreview("Ekspert"),
});

export const faqSectionType = defineType({
  name: "faqSection",
  title: "FAQ",
  type: "object",
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "items",
      title: "Pytania",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Pytanie",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: "answer",
              title: "Odpowiedź",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required().max(600),
            }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
      validation: (rule) => rule.required().min(2),
    }),
  ],
  preview: sectionPreview("FAQ"),
});

export const comparisonSectionType = defineType({
  name: "comparisonSection",
  title: "Porównanie",
  type: "object",
  icon: BillIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "caption",
      title: "Podpis tabeli",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "rowHeading",
      title: "Nagłówek wierszy",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "columns",
      title: "Kolumny",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(2).max(4),
    }),
    defineField({
      name: "rows",
      title: "Wiersze",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "feature",
              title: "Cecha",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: "values",
              title: "Wartości (kolejność jak kolumny)",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              validation: (rule) => rule.required().min(2).max(4),
            }),
          ],
          preview: { select: { title: "feature" } },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(2)
          .custom((rows, context) => {
            const parent = context.parent as { columns?: string[] } | undefined;
            const columns = parent?.columns ?? [];
            if (!Array.isArray(rows) || columns.length === 0) return true;
            const mismatch = rows.some(
              (row) =>
                row &&
                typeof row === "object" &&
                "values" in row &&
                Array.isArray(row.values) &&
                row.values.length !== columns.length,
            );
            return mismatch
              ? "Każdy wiersz musi mieć tyle wartości, ile jest kolumn."
              : true;
          }),
    }),
  ],
  preview: sectionPreview("Porównanie"),
});

export const quoteSectionType = defineType({
  name: "quoteSection",
  title: "Cytat",
  type: "object",
  icon: CommentIcon,
  fields: [
    themeField,
    defineField({
      name: "heading",
      title: "Nagłówek ukryty",
      description: "Dla czytnika i spisu. Nie jest widocznym cytatem.",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "quote",
      title: "Cytat",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: "attribution",
      title: "Przypisanie",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
  ],
  preview: {
    select: { title: "quote", subtitle: "attribution" },
  },
});

export const ctaSectionType = defineType({
  name: "ctaSection",
  title: "Wezwanie",
  type: "object",
  icon: LinkIcon,
  fields: [
    themeField,
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "action",
      title: "Akcja",
      type: "actionLink",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: sectionPreview("Wezwanie"),
});

export const formSectionType = defineType({
  name: "formSection",
  title: "Formularz",
  type: "object",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Nadtytuł",
      description: "Opcjonalny. Newsletter 3a nie używa nadtytułu.",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "form",
      title: "Konfiguracja pól",
      to: [{ type: "form" }],
      type: "reference",
      options: sameLanguageFilter("form"),
      validation: (rule) => rule.required(),
    }),
  ],
  preview: sectionPreview("Formularz"),
});

export const mediaSectionType = defineType({
  name: "mediaSection",
  title: "Media",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "image",
      title: "Obraz",
      type: "mediaObject",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "videoTitle",
      title: "Tytuł filmu",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "videoUrl",
      title: "Adres filmu",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "videoPlatform",
      title: "Platforma",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
  ],
  preview: sectionPreview("Media"),
});

export const relatedSectionType = defineType({
  name: "relatedSection",
  title: "Powiązane artykuły",
  type: "object",
  icon: MarkerIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "items",
      title: "Artykuły",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "article" }],
          options: sameLanguageFilter("article"),
        }),
      ],
      validation: (rule) => rule.required().min(2).max(4),
    }),
  ],
  preview: sectionPreview("Powiązane artykuły"),
});

export const ebooksSectionType = defineType({
  name: "ebooksSection",
  title: "E-booki",
  type: "object",
  icon: BookIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "items",
      title: "Produkty",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "ebook" }],
          options: sameLanguageFilter("ebook"),
        }),
      ],
      validation: (rule) => rule.required().min(1).max(12),
    }),
    defineField({
      name: "cardActionLabel",
      title: "Etykieta karty",
      type: "string",
      initialValue: "Poznaj temat",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "collection",
      title: "Link do kolekcji",
      type: "actionLink",
    }),
    defineField({
      name: "note",
      title: "Nota o statusie",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
  ],
  preview: sectionPreview("E-booki"),
});

export const serviceOfferSectionType = defineType({
  name: "serviceOfferSection",
  title: "Oferta usługi",
  type: "object",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "body",
      title: "Akapity",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "facts",
      title: "Fakty",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.min(1).max(6),
    }),
    defineField({
      name: "service",
      title: "Usługa",
      type: "reference",
      to: [{ type: "service" }],
      options: sameLanguageFilter("service"),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "action",
      title: "Akcja",
      description:
        "Jeśli puste, renderer używa bookingUrl i tytułu z dokumentu usługi.",
      type: "actionLink",
    }),
    defineField({
      name: "secondary",
      title: "Druga akcja",
      description: "Opcjonalny odnośnik, np. do kontaktu.",
      type: "actionLink",
    }),
    defineField({
      name: "note",
      title: "Uwaga przy cenie",
      description:
        "Opcjonalna, np. brak zobowiązania do dalszej współpracy. Nie wpisuj tu ceny.",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "media",
      title: "Medium",
      description:
        "Fotografia przy ofercie na homepage i O mnie. Karta ceny konsultacji jest bez zdjęcia.",
      type: "mediaObject",
    }),
  ],
  preview: sectionPreview("Oferta usługi"),
});

export const credentialsSectionType = defineType({
  name: "credentialsSection",
  title: "Kwalifikacje",
  type: "object",
  icon: UserIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "body",
      title: "Akapity",
      type: "array",
      of: [defineArrayMember({ type: "text" })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "person",
      title: "Osoba",
      description:
        "Wspólny profil autora. Uczelnia, kierunek i skan dyplomu pochodzą stąd.",
      type: "reference",
      to: [{ type: "author" }],
      options: sameLanguageFilter("author"),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "diplomaCaption",
      title: "Podpis ramki dyplomu",
      type: "string",
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: sectionPreview("Kwalifikacje"),
});

export const ebookCollectionSectionType = defineType({
  name: "ebookCollectionSection",
  title: "Kolekcja e-booków",
  type: "object",
  icon: DocumentsIcon,
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
      name: "title",
      title: "Tytuł",
      description:
        "Nagłówek kolekcji. Copy kolekcji jest propozycją do zatwierdzenia.",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "catalogTitle",
      title: "Tytuł katalogu",
      type: "string",
      validation: requiredString,
    }),
    defineField({
      name: "catalogLead",
      title: "Lead katalogu",
      type: "string",
      validation: (rule) => rule.required().max(180),
    }),
    defineField({
      name: "findTopicLabel",
      title: "Odnośnik do katalogu",
      type: "string",
      initialValue: "Znajdź swój temat",
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: "cardActionLabel",
      title: "Etykieta karty",
      type: "string",
      initialValue: "Poznaj temat",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "note",
      title: "Nota o statusie",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(240),
    }),
    defineField({
      name: "emptyMessage",
      title: "Komunikat pustej kolekcji",
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
  ],
  preview: sectionPreview("Kolekcja e-booków"),
});

export const blogCollectionSectionType = defineType({
  name: "blogCollectionSection",
  title: "Kolekcja bloga",
  type: "object",
  icon: BookIcon,
  description:
    "Lista korzysta z artykułów i kategorii w języku strony. Najnowszy wpis oraz paginacja powstają automatycznie.",
  fields: [
    defineField({
      name: "variant",
      title: "Wariant",
      type: "string",
      options: { list: [{ title: "Cherry 3a", value: "cherry3a" }] },
      initialValue: "cherry3a",
      validation: (rule) => rule.required(),
    }),
    ...blogIndexSettingsType.fields.filter(
      (field) => !["seoTitle", "seoDescription"].includes(field.name),
    ),
  ],
  preview: sectionPreview("Kolekcja bloga"),
});

export const pageSectionTypes = [
  heroSectionType,
  textSectionType,
  textImageSectionType,
  audienceSectionType,
  cardsSectionType,
  listSectionType,
  processSectionType,
  metricsSectionType,
  pricingSectionType,
  testimonialsSectionType,
  expertSectionType,
  faqSectionType,
  comparisonSectionType,
  quoteSectionType,
  ctaSectionType,
  formSectionType,
  mediaSectionType,
  relatedSectionType,
  ebooksSectionType,
  serviceOfferSectionType,
  credentialsSectionType,
  ebookCollectionSectionType,
  blogCollectionSectionType,
];

export const pageSectionsField = defineField({
  name: "sections",
  title: "Sekcje",
  type: "array",
  of: pageSectionTypes.map((type) => defineArrayMember({ type: type.name })),
  options: {
    insertMenu: {
      views: [{ name: "grid" }, { name: "list" }],
    },
  },
  validation: (rule) => rule.required().min(1),
});

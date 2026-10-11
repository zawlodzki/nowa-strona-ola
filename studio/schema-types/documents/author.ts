import { UserIcon } from "@sanity/icons/User";
import { defineArrayMember, defineField, defineType } from "sanity";

import {
  languageField,
  sameLanguageFilter,
  slugField,
  translationField,
} from "../shared/fields";

export const authorType = defineType({
  name: "author",
  title: "Autor",
  type: "document",
  icon: UserIcon,
  fields: [
    languageField,
    defineField({
      name: "name",
      title: "Imię i nazwisko",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    slugField({
      documentType: "author",
      description: "Używany w podpisach i odnośnikach autora.",
    }),
    translationField("author"),
    defineField({
      name: "role",
      title: "Rola",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "bio",
      title: "Biogram",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "photo",
      title: "Portret",
      type: "mediaObject",
    }),
    defineField({
      name: "educationInstitution",
      title: "Uczelnia",
      type: "string",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "educationProgram",
      title: "Kierunek",
      type: "string",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "occupationCode",
      title: "Zawód (klasyfikacja ISCO-08)",
      description: "Kod zawodu w danych strukturalnych.",
      type: "string",
      options: {
        list: [{ title: "2265 — dietetycy i żywieniowcy", value: "2265" }],
      },
    }),
    defineField({
      name: "sameAs",
      title: "Profile w innych serwisach",
      description:
        "Tylko profile prowadzone przez tę osobę (decyzja 11.10.2026: Instagram, Facebook, TikTok). Trafiają do danych strukturalnych jako sameAs.",
      type: "array",
      of: [
        defineArrayMember({
          type: "url",
          validation: (rule) => rule.uri({ scheme: ["https"] }),
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "knowsAbout",
      title: "Specjalizacje",
      description:
        "Tematy, którymi osoba zajmuje się na stronie. Wybierz kategorie bloga.",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "category" }],
          options: sameLanguageFilter("category"),
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "credentials",
      title: "Kwalifikacje",
      description:
        "Dyplomy, certyfikaty i szkolenia. Publiczne pozycje są pokazane na stronie „O mnie” i trafiają do danych strukturalnych (zgoda na publikację 11.10.2026).",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "credential",
          fields: [
            defineField({
              name: "category",
              title: "Rodzaj",
              type: "string",
              options: {
                layout: "radio",
                list: [
                  { title: "Dyplom", value: "degree" },
                  { title: "Certyfikat", value: "certificate" },
                  { title: "Szkolenie", value: "course" },
                  { title: "Uprawnienie", value: "license" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "name",
              title: "Nazwa",
              description:
                "Dyplom: kierunek, np. „Dietetyka”. Szkolenie: tytuł jak na zaświadczeniu.",
              type: "string",
              validation: (rule) => rule.required().max(200),
            }),
            defineField({
              name: "level",
              title: "Stopień",
              type: "string",
              options: {
                layout: "radio",
                list: [
                  { title: "Licencjat", value: "bachelor" },
                  { title: "Magister", value: "master" },
                ],
              },
              hidden: ({ parent }) => parent?.category !== "degree",
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as
                    { category?: string } | undefined;
                  return parent?.category === "degree" && !value
                    ? "Wybierz stopień dyplomu."
                    : true;
                }),
            }),
            defineField({
              name: "specialization",
              title: "Specjalność",
              type: "string",
              hidden: ({ parent }) => parent?.category !== "degree",
              validation: (rule) => rule.max(120),
            }),
            defineField({
              name: "issuerKind",
              title: "Wystawca to",
              type: "string",
              options: {
                layout: "radio",
                list: [
                  { title: "Instytucja", value: "organization" },
                  { title: "Osoba prowadząca", value: "person" },
                ],
              },
              initialValue: "organization",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "institution",
              title: "Wystawca",
              description:
                "Uczelnia, firma szkoleniowa albo osoba prowadząca, np. „mgr Emilia Cesarek”.",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: "department",
              title: "Wydział",
              type: "string",
              hidden: ({ parent }) => parent?.category !== "degree",
              validation: (rule) => rule.max(160),
            }),
            defineField({
              name: "institutionUrl",
              title: "Strona wystawcy",
              type: "url",
              validation: (rule) => rule.uri({ scheme: ["https"] }),
            }),
            defineField({
              name: "year",
              title: "Rok ukończenia",
              type: "number",
              validation: (rule) => rule.integer().min(1950).max(2100),
            }),
            defineField({
              name: "isPublic",
              title: "Publiczne",
              description:
                "Zaznacz tylko, gdy kwalifikacja jest pokazana na stronie.",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "institution",
              year: "year",
              isPublic: "isPublic",
            },
            prepare: ({ title, subtitle, year, isPublic }) => ({
              title,
              subtitle: [
                subtitle,
                year,
                isPublic ? "publiczne" : "niepubliczne",
              ]
                .filter(Boolean)
                .join(" · "),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "practiceSince",
      title: "Praktyka dietetyczna od roku",
      description: "Pokazywane na stronie „O mnie”, np. 2022.",
      type: "number",
      validation: (rule) => rule.integer().min(1950).max(2100),
    }),
    defineField({
      name: "experience",
      title: "Wcześniejsze miejsca pracy",
      description:
        "Placówki pokazane na stronie „O mnie”. Trafiają do danych strukturalnych jako organizacje, z którymi osoba była związana.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "workExperience",
          fields: [
            defineField({
              name: "organization",
              title: "Placówka",
              type: "string",
              validation: (rule) => rule.required().max(160),
            }),
            defineField({
              name: "role",
              title: "Stanowisko",
              type: "string",
              validation: (rule) => rule.max(120),
            }),
            defineField({
              name: "url",
              title: "Strona placówki",
              type: "url",
              validation: (rule) => rule.uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "organization", subtitle: "role" } },
        }),
      ],
    }),
    defineField({
      name: "diplomaScan",
      title: "Skan dyplomu",
      description:
        "Zdjęcie ukończenia studiów. Puste pole zostawia ramkę „Miejsce na skan dyplomu”. Nie wgrywać fikcyjnego dokumentu.",
      type: "mediaObject",
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", language: "language" },
    prepare: ({ title, subtitle, language }) => ({
      title,
      subtitle: [language?.toUpperCase(), subtitle].filter(Boolean).join(" · "),
    }),
  },
});

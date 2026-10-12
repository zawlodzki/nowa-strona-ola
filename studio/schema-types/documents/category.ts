import { TagIcon } from "@sanity/icons/Tag";
import { defineArrayMember, defineField, defineType } from "sanity";

import { languageField, slugField, translationField } from "../shared/fields";

export const categoryType = defineType({
  name: "category",
  title: "Kategoria",
  type: "document",
  icon: TagIcon,
  fields: [
    languageField,
    defineField({
      name: "excludeFromMeasurement",
      title: "Bez pomiaru",
      description:
        "Wyłącza Google Analytics, Microsoft Clarity i piksel Meta na stronie tej kategorii, niezależnie od zgody odwiedzającego. Nie zmienia ustawienia poszczególnych artykułów.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "title",
      title: "Nazwa",
      type: "string",
      validation: (rule) => rule.required().max(60),
    }),
    slugField({ documentType: "category" }),
    translationField("category"),
    defineField({
      name: "description",
      title: "Opis",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "sameAs",
      title: "Ten sam temat w bazach wiedzy",
      description:
        "Adres hasła w Wikidata albo Wikipedii, np. https://www.wikidata.org/wiki/Q… Łączy temat z encją znaną wyszukiwarkom i modelom AI. Wklejaj tylko sprawdzone hasło dokładnie tego tematu.",
      type: "array",
      of: [
        defineArrayMember({
          type: "url",
          validation: (rule) =>
            rule.uri({ scheme: ["https"] }).custom((value) => {
              if (!value) return true;
              return /^https:\/\/(www\.wikidata\.org\/wiki\/Q\d+|[a-z]{2}\.wikipedia\.org\/wiki\/.+)$/.test(
                value,
              )
                ? true
                : "Użyj adresu hasła Wikidata (…/wiki/Q123) albo Wikipedii.";
            }),
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: { title: "title", language: "language", slug: "slug.current" },
    prepare: ({ title, language, slug }) => ({
      title,
      subtitle: [language?.toUpperCase(), slug].filter(Boolean).join(" · "),
    }),
  },
});

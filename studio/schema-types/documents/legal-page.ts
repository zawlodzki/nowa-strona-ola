import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { defineField, defineType } from "sanity";

import { reservedLegalSlugs, reservedPageSlugs } from "../shared/constants";
import { languageField, slugField, translationField } from "../shared/fields";
import { unpublishableLegalText } from "../shared/legal-publication";

export const legalPageType = defineType({
  name: "legalPage",
  title: "Strona prawna",
  type: "document",
  icon: BlockContentIcon,
  groups: [
    { name: "content", title: "Treść", default: true },
    { name: "meta", title: "Metadane" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    { ...languageField, group: "meta" },
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    {
      ...slugField({
        documentType: "legalPage",
        reserved: reservedPageSlugs,
        allowedReserved: reservedLegalSlugs,
        description:
          "Adres publiczny. PL: polityka-prywatnosci, regulamin, lista-cookies-i-identyfikatorow, regulamin-newslettera. EN: privacy, terms.",
      }),
      group: "meta",
    },
    { ...translationField("legalPage"), group: "meta" },
    defineField({
      name: "version",
      title: "Wersja",
      type: "string",
      group: "meta",
      description: "Numer wersji z metryki dokumentu, np. 2.2.",
      validation: (rule) => rule.required().max(20),
    }),
    defineField({
      name: "effectiveFrom",
      title: "Obowiązuje od",
      type: "date",
      group: "meta",
      description:
        "Szkic można zapisać bez daty. Publikacja wymaga daty wejścia w życie.",
      validation: (rule) =>
        rule.custom(
          (value) =>
            Boolean(value) ||
            "Uzupełnij datę wejścia w życie przed publikacją.",
        ),
    }),
    defineField({
      name: "body",
      title: "Treść",
      type: "legalBody",
      group: "content",
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((value) => {
            const found = unpublishableLegalText(value);
            return (
              found.length === 0 ||
              `Treść zawiera placeholdery lub uwagi do sprawdzenia (${found.length}), np. „${found[0]}”. Usuń je przed publikacją.`
            );
          }),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: {
      title: "title",
      language: "language",
      slug: "slug.current",
      version: "version",
    },
    prepare: ({ title, language, slug, version }) => ({
      title,
      subtitle: [language?.toUpperCase(), slug, version && `v${version}`]
        .filter(Boolean)
        .join(" · "),
    }),
  },
  orderings: [
    {
      title: "Adres",
      name: "slugAsc",
      by: [{ field: "slug.current", direction: "asc" }],
    },
  ],
});

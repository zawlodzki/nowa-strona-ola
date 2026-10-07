import { DocumentIcon } from "@sanity/icons/Document";
import { defineField, defineType } from "sanity";

import { pageSectionsField } from "../blocks/page-sections";
import { homeSlug, reservedPageSlugs } from "../shared/constants";
import { languageField, slugField, translationField } from "../shared/fields";

export const pageType = defineType({
  name: "page",
  title: "Strona",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "content", title: "Treść", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    { ...languageField, group: "content" },
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(120),
    }),
    {
      ...slugField({
        documentType: "page",
        reserved: reservedPageSlugs,
        allowHome: true,
        allowedReserved: ["o-mnie", "about", "konsultacje", "consultations"],
        description: `Strona główna używa adresu „${homeSlug}”. Profil „O mnie” używa o-mnie (PL) i about (EN), landing konsultacji konsultacje (PL) i consultations (EN).`,
      }),
      group: "content",
    },
    { ...translationField("page"), group: "content" },
    { ...pageSectionsField, group: "content" },
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "title", language: "language", slug: "slug.current" },
    prepare: ({ title, language, slug }) => ({
      title,
      subtitle: [language?.toUpperCase(), slug].filter(Boolean).join(" · "),
    }),
  },
});

import { DocumentIcon } from "@sanity/icons/Document";
import { defineField, defineType, type SlugIsUniqueValidator } from "sanity";

const apiVersion = "2026-09-01";

const isUniqueSlugPerLanguage: SlugIsUniqueValidator = async (
  slug,
  context,
) => {
  const { document, getClient } = context;
  const language = document?.language;

  if (!slug || !document || typeof language !== "string") return true;

  const publishedId = document._id.replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;
  const matchingId = await getClient({ apiVersion }).fetch<string | null>(
    /* groq */ `*[
      _type == "page" &&
      language == $language &&
      slug.current == $slug &&
      !(_id in [$draftId, $publishedId])
    ][0]._id`,
    { draftId, language, publishedId, slug },
  );

  return matchingId === null;
};

export const pageType = defineType({
  name: "page",
  title: "Strona",
  type: "document",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "language",
      title: "Język",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Polski", value: "pl" },
          { title: "English", value: "en" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "Adres",
      description: "Dla strony głównej użyj wartości „home”.",
      type: "slug",
      options: { source: "title", isUnique: isUniqueSlugPerLanguage },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "eyebrow",
      title: "Nadtytuł",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(320),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", language: "language", slug: "slug.current" },
    prepare: ({ title, language, slug }) => ({
      title,
      subtitle: [language?.toUpperCase(), slug].filter(Boolean).join(" · "),
    }),
  },
});

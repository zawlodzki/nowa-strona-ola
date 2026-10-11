import { defineField, type ReferenceOptions } from "sanity";

import { homeSlug, languageOptions, slugPattern } from "./constants";
import { publicPath } from "./public-path";
import { isUniqueSlugPerLanguage } from "./uniqueness";

const apiVersion = "2026-09-01";

export const languageField = defineField({
  name: "language",
  title: "Język",
  type: "string",
  options: { layout: "radio", list: [...languageOptions] },
  validation: (rule) => rule.required(),
});

export function translationField(documentType: string) {
  return defineField({
    name: "translation",
    title: "Tłumaczenie",
    description:
      "Dokument w drugim języku. Brak powiązania oznacza brak przełącznika i strony w drugim języku.",
    type: "reference",
    to: [{ type: documentType }],
    options: {
      disableNew: true,
      filter: ({ document }) => ({
        filter: `_type == $documentType && defined(language) && language != $language`,
        params: {
          documentType,
          language:
            typeof document.language === "string" ? document.language : "",
        },
      }),
    },
  });
}

export function sameLanguageFilter(documentType: string): ReferenceOptions {
  return {
    disableNew: true,
    filter: ({ document }) => ({
      filter: `_type == $documentType && language == $language`,
      params: {
        documentType,
        language:
          typeof document.language === "string" ? document.language : "",
      },
    }),
  };
}

export function relatedArticleFilter(): ReferenceOptions {
  return {
    disableNew: true,
    filter: ({ document }) => {
      const publishedId = document._id.replace(/^drafts\./, "");
      return {
        filter: `_type == "article" && language == $language && !(_id in [$publishedId, $draftId])`,
        params: {
          language:
            typeof document.language === "string" ? document.language : "",
          publishedId,
          draftId: `drafts.${publishedId}`,
        },
      };
    },
  };
}

export const themeField = defineField({
  name: "theme",
  title: "Tło",
  type: "string",
  options: {
    layout: "radio",
    list: [
      { title: "Jasne", value: "light" },
      { title: "Ciemne", value: "dark" },
    ],
  },
  initialValue: "light",
});

export function slugField(options: {
  documentType: string;
  reserved?: readonly string[];
  description?: string;
  allowHome?: boolean;
  allowedReserved?: readonly string[];
}) {
  return defineField({
    name: "slug",
    title: "Adres",
    description: options.description,
    type: "slug",
    options: {
      source: "title",
      isUnique: isUniqueSlugPerLanguage(options.documentType),
    },
    validation: (rule) => [
      rule.required().custom((value) => {
        const current = value?.current?.trim();
        if (!current) return "Podaj adres.";
        if (!slugPattern.test(current)) {
          return "Użyj małych liter, cyfr i myślników.";
        }
        if (options.allowHome && current === homeSlug) return true;
        if (options.allowedReserved?.includes(current)) return true;
        if (options.reserved?.includes(current)) {
          return "Ten adres jest zarezerwowany.";
        }
        return true;
      }),
      rule
        .custom(async (value, context) => {
          // A changed address of a published page needs a redirect (SEO-4).
          const document = context.document;
          const current = value?.current?.trim();
          if (!document || !current) return true;
          const publishedId = document._id.replace(/^drafts\./, "");
          const language =
            typeof document.language === "string" ? document.language : "";
          const result = await context
            .getClient({ apiVersion })
            .fetch<{ slug: string | null; redirects: string[] } | null>(
              /* groq */ `{
                "slug": *[_id == $publishedId][0].slug.current,
                "redirects": *[_type == "redirect" && !(_id in path("drafts.**"))].from
              }`,
              { publishedId },
            );
          const previous = result?.slug;
          if (!previous || previous === current) return true;
          const oldPath = publicPath(options.documentType, previous, language);
          if (!oldPath) return true;
          const covered = (result?.redirects ?? []).some(
            (from) => from.replace(/\/$/, "") === oldPath.replace(/\/$/, ""),
          );
          return covered
            ? true
            : `Opublikowana strona ma adres ${oldPath}. Po zmianie dodaj przekierowanie 301 z ${oldPath} na nowy adres (Przekierowania), żeby nie stracić linków i pozycji w wyszukiwarce.`;
        })
        .warning(),
    ],
  });
}

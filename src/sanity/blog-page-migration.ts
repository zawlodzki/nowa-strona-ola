import { randomUUID } from "node:crypto";

import type { SanityDocument } from "./content-lake-plan";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Brak obiektu ustawień bloga do migracji.");
  }
  return value as Record<string, unknown>;
}

const requiredCollectionFields = [
  "title",
  "lead",
  "latestTitle",
  "collectionTitle",
  "readActionLabel",
  "allCategoriesLabel",
  "emptyMessage",
  "emptyCategoryMessage",
  "previousLabel",
  "nextLabel",
  "paginationLabel",
] as const;

/** Copy only collection settings into new drafts. Never replace existing pages. */
export function buildBlogPageMigration(
  source: readonly SanityDocument[],
  newId: () => string = randomUUID,
) {
  const targets = new Map<string, string>();
  const pending: { language: string; settings: SanityDocument; id: string }[] =
    [];
  const skipped: string[] = [];

  for (const language of ["pl", "en"] as const) {
    const pages = source.filter(
      (document) =>
        document._type === "page" &&
        document.language === language &&
        record(document.slug).current === "blog",
    );
    const ids = new Set(
      pages.map((document) => document._id.replace(/^drafts\./, "")),
    );
    if (ids.size > 1) throw new Error(`Zduplikowana strona bloga ${language}.`);
    const existingId = [...ids][0];
    if (existingId) {
      targets.set(language, existingId);
      skipped.push(language);
      continue;
    }
    const settings =
      source.find(
        (document) => document._id === `drafts.siteSettings-${language}`,
      ) ??
      source.find((document) => document._id === `siteSettings-${language}`);
    if (
      !settings ||
      settings._type !== "siteSettings" ||
      settings.language !== language
    ) {
      throw new Error(`Brak ustawień bloga ${language}.`);
    }
    const id = newId();
    if (
      !id ||
      id.startsWith("drafts.") ||
      [...targets.values()].includes(id) ||
      source.some((doc) => doc._id === id || doc._id === `drafts.${id}`)
    ) {
      throw new Error("Nieprawidłowy lub powtórzony identyfikator migracji.");
    }
    targets.set(language, id);
    pending.push({ language, settings, id });
  }

  const documents: SanityDocument[] = pending.map(
    ({ language, settings, id }) => {
      const index = record(settings.blogIndex);
      for (const name of requiredCollectionFields) {
        if (
          typeof index[name] !== "string" ||
          !(index[name] as string).trim()
        ) {
          throw new Error(`Brak ${name} w indeksie bloga ${language}.`);
        }
      }
      const {
        _type: _oldType,
        seoTitle,
        seoDescription,
        ...collection
      } = index;
      void _oldType;
      const newsletter = settings.blogNewsletter
        ? record(settings.blogNewsletter)
        : null;
      const sections: Record<string, unknown>[] = [
        {
          ...collection,
          _type: "blogCollectionSection",
          _key: "blog-collection",
          variant: "cherry3a",
        },
      ];
      if (newsletter?.enabled !== false) {
        if (
          !newsletter ||
          typeof newsletter.title !== "string" ||
          !newsletter.title.trim() ||
          typeof newsletter.lead !== "string" ||
          !newsletter.lead.trim()
        ) {
          throw new Error(`Brak newslettera bloga ${language}.`);
        }
        const form = record(newsletter.form);
        const target = source.find(
          (document) =>
            document._id === form._ref ||
            document._id === `drafts.${form._ref}`,
        );
        if (
          form._type !== "reference" ||
          !target ||
          target._type !== "form" ||
          target.language !== language
        ) {
          throw new Error(
            `Brak formularza bloga ${language} lub nieprawidłowy język.`,
          );
        }
        sections.push({
          _type: "formSection",
          _key: "blog-newsletter",
          title: newsletter.title,
          lead: newsletter.lead,
          form: newsletter.form,
        });
      }
      const opposite = language === "pl" ? "en" : "pl";
      const translation = settings.translation
        ? record(settings.translation)
        : null;
      const hasTranslation = translation?._ref === `siteSettings-${opposite}`;
      return {
        _id: `drafts.${id}`,
        _type: "page",
        language,
        title:
          typeof seoTitle === "string" && seoTitle.trim()
            ? seoTitle
            : String(index.title),
        slug: { _type: "slug", current: "blog" },
        seo: { _type: "seo", title: seoTitle, description: seoDescription },
        sections,
        ...(hasTranslation
          ? {
              translation: {
                _type: "reference",
                _ref: targets.get(opposite),
                _weak: true,
              },
            }
          : {}),
      };
    },
  );
  return {
    documents,
    skipped,
    sources: pending.map(({ settings }) => ({
      id: settings._id,
      revision: settings._rev,
    })),
  };
}

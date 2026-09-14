import type { SlugIsUniqueValidator } from "sanity";

const apiVersion = "2026-09-01";

export function isUniqueSlugPerLanguage(
  documentType: string,
): SlugIsUniqueValidator {
  return async (slug, context) => {
    const { document, getClient } = context;
    const language = document?.language;

    if (!slug || !document || typeof language !== "string") return true;

    const publishedId = document._id.replace(/^drafts\./, "");
    const draftId = `drafts.${publishedId}`;
    const matchingId = await getClient({ apiVersion }).fetch<string | null>(
      /* groq */ `*[
        _type == $documentType &&
        language == $language &&
        slug.current == $slug &&
        !(_id in [$draftId, $publishedId])
      ][0]._id`,
      { documentType, draftId, language, publishedId, slug },
    );

    return matchingId === null;
  };
}

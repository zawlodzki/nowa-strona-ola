import { defineQuery } from "groq";

export const PREVIEW_PAGE_QUERY = defineQuery(/* groq */ `
  *[
    _type == "page" &&
    language == $language &&
    slug.current == $slug
  ][0]{
    "id": _id,
    language,
    "slug": slug.current,
    title,
    eyebrow,
    lead,
    seo{title, description}
  }
`);

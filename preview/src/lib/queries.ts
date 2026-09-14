import { defineQuery } from "groq";

import {
  articleBodyProjection,
  articleCardProjection,
  PAGE_SECTION_PROJECTION,
  siteSettingsProjection,
} from "../../../src/sanity/queries";

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
    seo{title, description},
    "translation": translation->{ language, "slug": slug.current },
    sections[]{ ${PAGE_SECTION_PROJECTION} }
  }
`);

export const PREVIEW_ARTICLE_QUERY = defineQuery(/* groq */ `
  *[
    _type == "article" &&
    language == $language &&
    slug.current == $slug
  ][0]{
    ${articleCardProjection},
    updatedAt,
    seo{title, description},
    authors[]->{ name, role, "slug": slug.current },
    body[]{ ${articleBodyProjection} },
    sources[]{ _key, title, href },
    related[]->{ ${articleCardProjection} }
  }
`);

export const PREVIEW_SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "siteSettings" &&
    language == $language
  ][0]{ ${siteSettingsProjection} }
`);

export const PREVIEW_ARTICLES_QUERY = defineQuery(/* groq */ `
  *[
    _type == "article" &&
    language == $language
  ] | order(publishedAt desc){ ${articleCardProjection} }
`);

export const PREVIEW_CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[
    _type == "category" &&
    language == $language
  ] | order(title asc){
    title,
    "slug": slug.current,
    language
  }
`);

export const PREVIEW_CATEGORY_QUERY = defineQuery(/* groq */ `
  *[
    _type == "category" &&
    language == $language &&
    slug.current == $slug
  ][0]{
    "id": _id,
    language,
    title,
    description,
    "slug": slug.current,
    "translation": translation->{ language, "slug": slug.current }
  }
`);

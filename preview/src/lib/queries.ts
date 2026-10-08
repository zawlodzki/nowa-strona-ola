import { defineQuery } from "groq";

import {
  articleCardProjection,
  articleDetailProjection,
  ebookCardProjection,
  ebookProjection,
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
    ${articleDetailProjection}
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
  ] | order(publishedAt desc, _id asc){ ${articleCardProjection} }
`);

export const PREVIEW_CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[
    _type == "category" &&
    language == $language
  ] | order(title asc){
    "id": _id,
    title,
    description,
    "slug": slug.current,
    language,
    "translation": translation->{ language, "slug": slug.current }
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

export const PREVIEW_EBOOK_QUERY = defineQuery(/* groq */ `
  *[
    _type == "ebook" &&
    language == $language &&
    slug.current == $slug
  ][0]{ ${ebookProjection} }
`);

export const PREVIEW_EBOOKS_QUERY = defineQuery(/* groq */ `
  *[
    _type == "ebook" &&
    language == $language
  ] | order(coalesce(sortOrder, 9999) asc, title asc) {
    ${ebookCardProjection}
  }
`);

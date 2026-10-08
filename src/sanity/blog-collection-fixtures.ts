import type { Locale } from "@ola/shared";

import {
  BLOG_ARTICLE_SEED,
  BLOG_CATEGORY_SEED,
  type BlogCategoryKey,
} from "@/content/blog-collection-seed";
import { sortByPublishedAt } from "@/lib/pagination";
import { authorFixture } from "@/sanity/homepage-fixtures";

function block(
  key: string,
  text: string,
  style: "normal" | "h2" | "h3" = "normal",
) {
  return {
    _type: "block" as const,
    _key: key,
    style,
    children: [{ _type: "span", text, marks: [] }],
    markDefs: [],
  };
}

function articleBody(language: Locale, slug: string) {
  const pl = language === "pl";
  return [
    block(`${slug}-h2a`, pl ? "Od czego zacząć" : "Where to start", "h2"),
    block(
      `${slug}-p1`,
      pl
        ? "Ten wpis jest demonstracyjny. Ma pomóc ocenić układ kolekcji i nadal mieć spis treści na stronie artykułu."
        : "This post is demonstrative. It helps review the collection layout and still has a table of contents on the article page.",
    ),
    {
      _type: "articleHighlight",
      _key: `${slug}-hi`,
      title: pl ? "Na skróty" : "In short",
      body: pl
        ? "Copy, daty i kadry pochodzą z makiety 3a. To propozycja, nie publikacja."
        : "Copy, dates and crops come from the 3a mockup. This is a proposal, not a publication.",
    },
    block(
      `${slug}-h2b`,
      pl ? "Co warto zapisać" : "What is worth writing down",
      "h2",
    ),
    block(
      `${slug}-p2`,
      pl
        ? "Na stronie artykułu zostaje dotychczasowy szablon do pakietu 7. Kolekcja 3a nie zastępuje treści Portable Text."
        : "The article page keeps the existing template until package 7. The 3a collection does not replace Portable Text.",
    ),
  ];
}

function categoryRecords(language: Locale) {
  return (
    Object.entries(BLOG_CATEGORY_SEED) as [
      BlogCategoryKey,
      (typeof BLOG_CATEGORY_SEED)[BlogCategoryKey],
    ][]
  )
    .map(([key, seed]) => ({
      id: `cat-${key}-${language}`,
      language,
      title: seed.titles[language],
      description: seed.descriptions[language],
      slug: seed.slugs[language],
      translation: {
        language: language === "pl" ? ("en" as const) : ("pl" as const),
        slug: seed.slugs[language === "pl" ? "en" : "pl"],
      },
    }))
    .sort((left, right) => left.title.localeCompare(right.title, language));
}

export const demonstrationCategories = {
  pl: categoryRecords("pl"),
  en: categoryRecords("en"),
};

function categoryFor(language: Locale, key: BlogCategoryKey) {
  const slug = BLOG_CATEGORY_SEED[key].slugs[language];
  const match = demonstrationCategories[language].find(
    (category) => category.slug === slug,
  );
  if (!match) {
    throw new Error(`Brak fixture kategorii ${language}/${slug}.`);
  }
  return match;
}

function articleMedia(
  seed: (typeof BLOG_ARTICLE_SEED)[number],
  locale: Locale,
) {
  const copy = seed[locale];
  return {
    alt: copy.alt,
    label: copy.alt,
    tone: (seed.imageKey === "food" ? "photo" : "portrait") as
      "photo" | "portrait",
    caption: null,
    src: seed.imageKey,
    hotspot: seed.hotspot
      ? { x: seed.hotspot.x, y: seed.hotspot.y, height: 1, width: 1 }
      : null,
  };
}

function articleRecord(
  seed: (typeof BLOG_ARTICLE_SEED)[number],
  language: Locale,
) {
  const copy = seed[language];
  const translation = seed[language === "pl" ? "en" : "pl"];
  const author = authorFixture(language);
  return {
    id: `article-blog-${seed.key}-${language}`,
    language,
    slug: copy.slug,
    title: copy.title,
    lead: copy.lead,
    publishedAt: seed.publishedAt,
    updatedAt: seed.publishedAt,
    featured: "standard" as const,
    seo: { title: copy.title, description: copy.lead },
    media: articleMedia(seed, language),
    authors: [
      {
        name: author.name,
        role: author.role,
        slug: author.slug,
      },
    ],
    categories: [categoryFor(language, seed.category)],
    body: articleBody(language, copy.slug),
    sources: [],
    translation: {
      language: language === "pl" ? ("en" as const) : ("pl" as const),
      slug: translation.slug,
    },
    related: [] as unknown[],
  };
}

type BlogArticleFixture = ReturnType<typeof articleRecord> & {
  related: BlogArticleFixture[];
};

export const demonstrationArticles = Object.fromEntries(
  BLOG_ARTICLE_SEED.flatMap((seed) => [
    [`pl/${seed.pl.slug}`, articleRecord(seed, "pl")],
    [`en/${seed.en.slug}`, articleRecord(seed, "en")],
  ]),
) as Record<string, BlogArticleFixture>;

function withRelated(articles: Record<string, BlogArticleFixture>) {
  const list = Object.values(articles);
  for (const article of list) {
    article.related = list
      .filter(
        (item) =>
          item.language === article.language && item.slug !== article.slug,
      )
      .slice(0, 2);
  }
  return articles;
}

withRelated(demonstrationArticles);

export function fixtureArticle(language: Locale, slug: string) {
  return demonstrationArticles[`${language}/${slug}`];
}

export function fixtureArticlesForLanguage(language: Locale) {
  return sortByPublishedAt(
    Object.values(demonstrationArticles).filter(
      (article) => article.language === language,
    ),
  );
}

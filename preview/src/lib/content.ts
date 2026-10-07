import { createClient } from "@sanity/client";
import type { Locale } from "@ola/shared";

import { assertKnownSections } from "../../../src/content/sections";
import { ARTICLES_PER_PAGE } from "../../../src/lib/paths";
import { paginate } from "../../../src/lib/pagination";
import type {
  ArticleCard,
  ArticleContent,
  CategoryContent,
  EbookCard,
  EbookContent,
  PageContent,
  SiteSettings,
} from "../../../src/sanity/repository";
import { sanityApiVersion } from "../../../src/sanity/config";
import type { PUBLISHED_CATEGORIES_QUERY_RESULT } from "../../../src/sanity.types";
import {
  PREVIEW_ARTICLE_QUERY,
  PREVIEW_ARTICLES_QUERY,
  PREVIEW_CATEGORIES_QUERY,
  PREVIEW_CATEGORY_QUERY,
  PREVIEW_EBOOK_QUERY,
  PREVIEW_EBOOKS_QUERY,
  PREVIEW_PAGE_QUERY,
  PREVIEW_SITE_SETTINGS_QUERY,
} from "./queries";

export interface PreviewEnvironment {
  SANITY_PROJECT_ID: string;
  SANITY_DATASET: string;
  SANITY_STUDIO_URL: string;
  SANITY_API_READ_TOKEN: string;
}

interface PreviewFetcher {
  fetch: <T>(query: string, parameters?: Record<string, unknown>) => Promise<T>;
}

export function createPreviewContentClient(
  environment: PreviewEnvironment,
): PreviewFetcher {
  if (!environment.SANITY_API_READ_TOKEN) {
    throw new Error("Brak serwerowego SANITY_API_READ_TOKEN.");
  }

  return createClient({
    projectId: environment.SANITY_PROJECT_ID,
    dataset: environment.SANITY_DATASET,
    apiVersion: sanityApiVersion,
    perspective: "drafts",
    stega: {
      enabled: true,
      studioUrl: environment.SANITY_STUDIO_URL,
    },
    token: environment.SANITY_API_READ_TOKEN,
    useCdn: false,
  });
}

export async function getPreviewPage(
  language: Locale,
  slug: string,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<PageContent> {
  const page = await client.fetch<PageContent | null>(PREVIEW_PAGE_QUERY, {
    language,
    slug,
  });
  if (!page) throw new Error(`Brak strony podglądu ${language}/${slug}.`);
  assertKnownSections(page.sections);
  return page;
}

export async function getPreviewArticle(
  language: Locale,
  slug: string,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<ArticleContent> {
  const article = await client.fetch<ArticleContent | null>(
    PREVIEW_ARTICLE_QUERY,
    { language, slug },
  );
  if (!article) {
    throw new Error(`Brak artykułu podglądu ${language}/${slug}.`);
  }
  return article;
}

export async function getPreviewEbook(
  language: Locale,
  slug: string,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<EbookContent> {
  const ebook = await client.fetch<EbookContent | null>(PREVIEW_EBOOK_QUERY, {
    language,
    slug,
  });
  if (!ebook) {
    throw new Error(`Brak e-booka podglądu ${language}/${slug}.`);
  }
  return ebook;
}

export async function getPreviewEbooks(
  language: Locale,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<EbookCard[]> {
  return client.fetch<EbookCard[]>(PREVIEW_EBOOKS_QUERY, { language });
}

export async function getPreviewSiteSettings(
  language: Locale,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<SiteSettings> {
  const settings = await client.fetch<SiteSettings | null>(
    PREVIEW_SITE_SETTINGS_QUERY,
    { language },
  );
  if (!settings) {
    throw new Error(`Brak ustawień podglądu ${language}.`);
  }
  return settings;
}

export async function getPreviewArticleIndex(
  language: Locale,
  page: number,
  environment: PreviewEnvironment,
  options: { categorySlug?: string; pageSize?: number } = {},
  client = createPreviewContentClient(environment),
) {
  const articles = await client.fetch<ArticleCard[]>(PREVIEW_ARTICLES_QUERY, {
    language,
  });
  const filtered = options.categorySlug
    ? articles.filter((article) =>
        article.categories?.some(
          (category) => category?.slug === options.categorySlug,
        ),
      )
    : articles;
  const result = paginate(
    filtered,
    page,
    options.pageSize ?? ARTICLES_PER_PAGE,
  );
  if (!result) {
    throw new Error(`Brak strony ${page} indeksu podglądu ${language}.`);
  }
  return {
    ...result,
    featured: filtered.filter((article) => article.featured === "featured"),
  };
}

export async function getPreviewCategories(
  language: Locale,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<PUBLISHED_CATEGORIES_QUERY_RESULT> {
  return client.fetch(PREVIEW_CATEGORIES_QUERY, { language });
}

export async function getPreviewCategory(
  language: Locale,
  slug: string,
  environment: PreviewEnvironment,
  client = createPreviewContentClient(environment),
): Promise<CategoryContent> {
  const category = await client.fetch<CategoryContent | null>(
    PREVIEW_CATEGORY_QUERY,
    { language, slug },
  );
  if (!category) {
    throw new Error(`Brak kategorii podglądu ${language}/${slug}.`);
  }
  return category;
}

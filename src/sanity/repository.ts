import { createClient } from "@sanity/client";
import type { Locale } from "@ola/shared";

import { ARTICLES_PER_PAGE } from "@/lib/paths";
import { paginate } from "@/lib/pagination";
import { assertKnownSections } from "@/content/sections";
import { sanityApiVersion, readSanityPublicConfig } from "./config";
import {
  demonstrationSettings,
  fixtureArticle,
  fixtureArticlesForLanguage,
  fixturePage,
  fixturePagesForLanguage,
  demonstrationCategories,
} from "./fixtures";
import { fixtureEbook, fixtureEbooksWithLanding } from "./ebook-fixtures";
import {
  PUBLISHED_ARTICLE_PATHS_QUERY,
  PUBLISHED_ARTICLE_QUERY,
  PUBLISHED_ARTICLES_QUERY,
  PUBLISHED_CATEGORIES_QUERY,
  PUBLISHED_CATEGORY_QUERY,
  PUBLISHED_EBOOK_PATHS_QUERY,
  PUBLISHED_EBOOK_QUERY,
  PUBLISHED_PAGE_PATHS_QUERY,
  PUBLISHED_PAGE_QUERY,
  SITE_SETTINGS_QUERY,
} from "./queries";
import type {
  PUBLISHED_ARTICLE_PATHS_QUERY_RESULT,
  PUBLISHED_ARTICLE_QUERY_RESULT,
  PUBLISHED_ARTICLES_QUERY_RESULT,
  PUBLISHED_CATEGORIES_QUERY_RESULT,
  PUBLISHED_CATEGORY_QUERY_RESULT,
  PUBLISHED_EBOOK_PATHS_QUERY_RESULT,
  PUBLISHED_EBOOK_QUERY_RESULT,
  PUBLISHED_PAGE_PATHS_QUERY_RESULT,
  PUBLISHED_PAGE_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from "../sanity.types";

export type PageContent = NonNullable<PUBLISHED_PAGE_QUERY_RESULT>;
export type ArticleContent = NonNullable<PUBLISHED_ARTICLE_QUERY_RESULT>;
export type ArticleCard = PUBLISHED_ARTICLES_QUERY_RESULT[number];
export type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;
export type CategoryContent = NonNullable<PUBLISHED_CATEGORY_QUERY_RESULT>;
export type EbookContent = NonNullable<PUBLISHED_EBOOK_QUERY_RESULT>;

interface QueryClient {
  fetch: <T>(query: string, parameters?: Record<string, unknown>) => Promise<T>;
}

export function createPublishedContentClient(config: {
  projectId: string;
  dataset: string;
}): QueryClient {
  return createClient({
    ...config,
    apiVersion: sanityApiVersion,
    perspective: "published",
    useCdn: false,
  });
}

function resolveClient(
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): QueryClient | null {
  const environment = options.environment ?? import.meta.env;
  const config = readSanityPublicConfig(environment);
  if (!config && !options.client) return null;
  return options.client ?? createPublishedContentClient(config!);
}

export async function getPage(
  language: Locale,
  slug: string,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<PageContent> {
  const client = resolveClient(options);
  if (!client) {
    const fixture = fixturePage(language, slug);
    if (!fixture) {
      throw new Error(`Brak demonstracyjnej strony ${language}/${slug}.`);
    }
    assertKnownSections(
      fixture.sections as readonly {
        _type?: string | null;
        _key?: string | null;
      }[],
    );
    return fixture as unknown as PageContent;
  }

  const page = await client.fetch<PageContent | null>(PUBLISHED_PAGE_QUERY, {
    language,
    slug,
  });

  if (!page) throw new Error(`Brak opublikowanej strony ${language}/${slug}.`);
  if (page.language !== language || page.slug !== slug) {
    throw new Error(
      `Sanity zwróciło stronę niezgodną z żądaniem ${language}/${slug}.`,
    );
  }
  assertKnownSections(page.sections);
  return page;
}

export async function getPagePaths(
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<PUBLISHED_PAGE_PATHS_QUERY_RESULT> {
  const client = resolveClient(options);
  if (!client) {
    return [
      ...fixturePagesForLanguage("pl"),
      ...fixturePagesForLanguage("en"),
    ].map((page) => ({ language: page.language, slug: page.slug }));
  }
  return client.fetch(PUBLISHED_PAGE_PATHS_QUERY);
}

export async function getSiteSettings(
  language: Locale,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<SiteSettings> {
  const client = resolveClient(options);
  if (!client) return demonstrationSettings[language] as SiteSettings;
  const settings = await client.fetch<SiteSettings | null>(
    SITE_SETTINGS_QUERY,
    { language },
  );
  if (!settings) {
    throw new Error(`Brak opublikowanych ustawień ${language}.`);
  }
  return settings;
}

export async function getArticle(
  language: Locale,
  slug: string,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<ArticleContent> {
  const client = resolveClient(options);
  if (!client) {
    const fixture = fixtureArticle(language, slug);
    if (!fixture) {
      throw new Error(`Brak demonstracyjnego artykułu ${language}/${slug}.`);
    }
    return fixture as unknown as ArticleContent;
  }
  const article = await client.fetch<ArticleContent | null>(
    PUBLISHED_ARTICLE_QUERY,
    { language, slug },
  );
  if (!article) {
    throw new Error(`Brak opublikowanego artykułu ${language}/${slug}.`);
  }
  if (article.language !== language || article.slug !== slug) {
    throw new Error(
      `Sanity zwróciło artykuł niezgodny z żądaniem ${language}/${slug}.`,
    );
  }
  return article;
}

export async function getArticlePaths(
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<PUBLISHED_ARTICLE_PATHS_QUERY_RESULT> {
  const client = resolveClient(options);
  if (!client) {
    return fixtureArticlesForLanguage("pl")
      .concat(fixtureArticlesForLanguage("en"))
      .map((article) => ({ language: article.language, slug: article.slug }));
  }
  return client.fetch(PUBLISHED_ARTICLE_PATHS_QUERY);
}

export async function listArticles(
  language: Locale,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
    categorySlug?: string;
  } = {},
): Promise<ArticleCard[]> {
  const client = resolveClient(options);
  const articles = client
    ? await client.fetch<ArticleCard[]>(PUBLISHED_ARTICLES_QUERY, { language })
    : (fixtureArticlesForLanguage(language) as unknown as ArticleCard[]);
  if (!options.categorySlug) return articles;
  return articles.filter((article) =>
    article.categories?.some(
      (category) => category?.slug === options.categorySlug,
    ),
  );
}

export async function getArticleIndex(
  language: Locale,
  page: number,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
    categorySlug?: string;
    pageSize?: number;
  } = {},
) {
  const articles = await listArticles(language, options);
  const result = paginate(
    articles,
    page,
    options.pageSize ?? ARTICLES_PER_PAGE,
  );
  if (!result) {
    throw new Error(`Brak strony ${page} indeksu bloga ${language}.`);
  }
  return {
    ...result,
    featured: articles.filter((article) => article.featured === "featured"),
  };
}

export async function listCategoryPageParams(
  language: Locale,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
) {
  const categories = await listCategories(language, options);
  const params: { slug: string; page: string }[] = [];
  for (const category of categories) {
    if (!category.slug) continue;
    const articles = await listArticles(language, {
      ...options,
      categorySlug: category.slug,
    });
    const totalPages = Math.max(
      1,
      Math.ceil(articles.length / ARTICLES_PER_PAGE),
    );
    for (let page = 2; page <= totalPages; page += 1) {
      params.push({ slug: category.slug, page: String(page) });
    }
  }
  return params;
}

export async function getCategory(
  language: Locale,
  slug: string,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<CategoryContent> {
  const client = resolveClient(options);
  if (!client) {
    const fixture = demonstrationCategories[language].find(
      (category) => category.slug === slug,
    );
    if (!fixture) {
      throw new Error(`Brak demonstracyjnej kategorii ${language}/${slug}.`);
    }
    return fixture as CategoryContent;
  }
  const category = await client.fetch<CategoryContent | null>(
    PUBLISHED_CATEGORY_QUERY,
    { language, slug },
  );
  if (!category) {
    throw new Error(`Brak opublikowanej kategorii ${language}/${slug}.`);
  }
  return category;
}

export async function listCategories(
  language: Locale,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<PUBLISHED_CATEGORIES_QUERY_RESULT> {
  const client = resolveClient(options);
  if (!client) return demonstrationCategories[language];
  return client.fetch(PUBLISHED_CATEGORIES_QUERY, { language });
}

export async function getEbook(
  language: Locale,
  slug: string,
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<EbookContent> {
  const client = resolveClient(options);
  if (!client) {
    const fixture = fixtureEbook(language, slug);
    if (!fixture) {
      throw new Error(`Brak demonstracyjnego e-booka ${language}/${slug}.`);
    }
    return fixture as unknown as EbookContent;
  }

  const ebook = await client.fetch<EbookContent | null>(PUBLISHED_EBOOK_QUERY, {
    language,
    slug,
  });
  if (!ebook) {
    throw new Error(`Brak opublikowanego e-booka ${language}/${slug}.`);
  }
  if (ebook.language !== language || ebook.slug !== slug) {
    throw new Error(
      `Sanity zwróciło e-book niezgodny z żądaniem ${language}/${slug}.`,
    );
  }
  if (!ebook.landing) {
    throw new Error(
      `E-book ${language}/${slug} nie ma landingu. Zatrzymuję build.`,
    );
  }
  return ebook;
}

export async function getEbookPaths(
  options: {
    environment?: Record<string, string | undefined>;
    client?: QueryClient;
  } = {},
): Promise<PUBLISHED_EBOOK_PATHS_QUERY_RESULT> {
  const client = resolveClient(options);
  if (!client) {
    return fixtureEbooksWithLanding().map((ebook) => ({
      language: ebook.language,
      slug: ebook.slug,
    }));
  }
  return client.fetch(PUBLISHED_EBOOK_PATHS_QUERY);
}

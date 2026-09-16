import { locales, type Locale } from "@ola/shared";

import {
  hrefToContentPathParam,
  isExcludedCatchAllPath,
} from "@/lib/content-path";
import {
  ARTICLES_PER_PAGE,
  HOME_SLUG,
  articlePath,
  blogCategoryPath,
  blogPath,
  homePath,
  pagePath,
  reservedPageSlugs,
} from "@/lib/paths";
import {
  getArticle,
  getArticleIndex,
  getCategory,
  getPage,
  getPagePaths,
  getSiteSettings,
  listArticles,
  listCategories,
  listCategoryPageParams,
} from "./repository";

type PageLoadOptions = Parameters<typeof getPage>[2];
type ArticleIndexOptions = Parameters<typeof getArticleIndex>[2];

export async function loadHome(language: Locale, options?: PageLoadOptions) {
  const [page, settings] = await Promise.all([
    getPage(language, HOME_SLUG, options),
    getSiteSettings(language, options),
  ]);
  return { page, settings };
}

export async function loadPage(
  language: Locale,
  slug: string,
  options?: PageLoadOptions,
) {
  const [page, settings] = await Promise.all([
    getPage(language, slug, options),
    getSiteSettings(language, options),
  ]);
  return { page, settings };
}

export async function loadArticle(
  language: Locale,
  slug: string,
  options?: PageLoadOptions,
) {
  const [article, settings] = await Promise.all([
    getArticle(language, slug, options),
    getSiteSettings(language, options),
  ]);
  return { article, settings };
}

export async function loadBlogIndex(
  language: Locale,
  page: number,
  options?: ArticleIndexOptions,
) {
  const [index, settings, categories, category] = await Promise.all([
    getArticleIndex(language, page, options),
    getSiteSettings(language, options),
    listCategories(language, options),
    options?.categorySlug
      ? getCategory(language, options.categorySlug, options)
      : Promise.resolve(null),
  ]);
  return { index, settings, categories, category };
}

export async function listPublishedContentParams(
  options?: PageLoadOptions,
): Promise<(string | undefined)[]> {
  const params = new Set<string | undefined>();
  const addHref = (href: string) => {
    const param = hrefToContentPathParam(href);
    if (isExcludedCatchAllPath(param)) return;
    params.add(param);
  };

  addHref(homePath("pl"));
  addHref(homePath("en"));

  for (const entry of await getPagePaths(options)) {
    if (!entry.slug || entry.slug === HOME_SLUG) continue;
    if ((reservedPageSlugs as readonly string[]).includes(entry.slug)) continue;
    addHref(pagePath(entry.language, entry.slug));
  }

  for (const language of locales) {
    addHref(blogPath(language));
    const articles = await listArticles(language, options);
    for (const article of articles) {
      if (!article.slug) continue;
      addHref(articlePath(language, article.slug));
    }
    const totalPages = Math.max(
      1,
      Math.ceil(articles.length / ARTICLES_PER_PAGE),
    );
    for (let page = 2; page <= totalPages; page += 1) {
      addHref(blogPath(language, page));
    }
    for (const category of await listCategories(language, options)) {
      if (!category.slug) continue;
      addHref(blogCategoryPath(language, category.slug));
    }
    for (const entry of await listCategoryPageParams(language, options)) {
      addHref(blogCategoryPath(language, entry.slug, Number(entry.page)));
    }
  }

  return [...params];
}

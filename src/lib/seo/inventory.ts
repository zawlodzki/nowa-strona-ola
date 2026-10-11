/**
 * Indexable public pages of one build (SEO-3). Sitemap, Markdown alternates,
 * llms.txt and RSS read this list, so all formats come from the same data.
 */
import type { Locale } from "@ola/shared";

import { mapArticle } from "@/content/map-article";
import { mapEbookCollection } from "@/content/map-ebook-collection";
import { mapLegalPage } from "@/content/map-legal";
import { serializeArticle } from "@/content/serialize-article";
import { serializeBlogCollection } from "@/content/serialize-blog-collection";
import { serializeEbook } from "@/content/serialize-ebook";
import { serializeEbookCollectionView } from "@/content/serialize-ebook-collection";
import { serializeLegalPage } from "@/content/serialize-legal";
import { serializePage } from "@/content/serialize-sections";
import {
  aboutPath,
  articlePath,
  blogCategoryPath,
  blogPath,
  consultationPath,
  EBOOK_TOPICS,
  ebookCollectionPath,
  ebookPath,
  homePath,
  pagePath,
  type EbookCollectionFilter,
} from "@/lib/paths";
import { formatPriceGross } from "@/lib/offer";
import { absoluteUrl } from "@/lib/seo/site";
import {
  getArticle,
  getArticleIndex,
  getBlogPage,
  getCategory,
  getEbook,
  getEbookPaths,
  getLegalPage,
  getLegalPagePaths,
  getPage,
  getSiteSettings,
  listArticles,
  listCategories,
  listEbooks,
  type ArticleCard,
  type EbookCard,
} from "@/sanity/repository";
import { WITHDRAWAL_SLUG } from "@/sanity/withdrawal-fixtures";

export type InventoryKind =
  | "home"
  | "about"
  | "consultation"
  | "contact"
  | "page"
  | "legal"
  | "blog"
  | "category"
  | "article"
  | "ebooks"
  | "ebookTopic"
  | "ebook";

export interface InventoryEntry {
  kind: InventoryKind;
  /** Canonical HTML path. */
  path: string;
  title: string;
  description?: string;
  /** YYYY-MM-DD from editorial dates only (never `_updatedAt`). */
  lastmod?: string;
  /** Extra data used by llms.txt and RSS. */
  meta?: {
    publishedAt?: string;
    categories?: string[];
    status?: string;
    price?: string;
  };
  /** Heading on the generated share card; defaults to `title` without brand. */
  cardTitle?: string;
  markdown: () => Promise<string>;
}

/** Generated share card of an inventory page: `/` → `/og/index.png`. */
export function ogCardPath(path: string): string {
  return `/og${markdownPath(path).replace(/\.md$/, ".png")}`;
}

const kickers: Record<InventoryKind, Record<Locale, string>> = {
  home: { pl: "Dietetyczka kliniczna", en: "Clinical dietitian" },
  about: { pl: "O mnie", en: "About" },
  consultation: { pl: "Konsultacja", en: "Consultation" },
  contact: { pl: "Kontakt", en: "Contact" },
  page: { pl: "Aleksandra Olesiewicz", en: "Aleksandra Olesiewicz" },
  legal: { pl: "Dokumenty", en: "Documents" },
  blog: { pl: "Blog", en: "Blog" },
  category: { pl: "Blog · kategoria", en: "Blog · category" },
  article: { pl: "Blog", en: "Blog" },
  ebooks: { pl: "E-booki", en: "E-books" },
  ebookTopic: { pl: "E-booki", en: "E-books" },
  ebook: { pl: "E-book", en: "E-book" },
};

/** Title without the brand suffix used in `<title>`. */
export function stripBrand(title: string): string {
  return title
    .replace(/\s*[|—–-]\s*(e-book\s+)?aleksandr\w*\s+olesiewicz.*$/i, "")
    .replace(/^aleksandra olesiewicz\s*[|—–-]\s*/i, "")
    .replace(/\s*[|—–-]?\s*aleksandraolesiewicz\.com$/i, "")
    .trim();
}

export function ogCard(entry: InventoryEntry, language: Locale = "pl") {
  return {
    kicker: kickers[entry.kind][language],
    title: entry.cardTitle ?? (stripBrand(entry.title) || entry.title),
  };
}

/** `/` → `/index.md`, `/blog/a/` → `/blog/a.md`. */
export function markdownPath(path: string): string {
  if (path === "/") return "/index.md";
  return `${path.replace(/\/$/, "")}.md`;
}

/**
 * Root-relative links and in-page anchors become absolute, because the
 * Markdown is read outside the HTML page it mirrors.
 */
export function absolutizeMarkdownLinks(
  markdown: string,
  pagePath: string,
): string {
  return markdown
    .replace(
      /\]\((\/(?!\/)[^)\s]*)\)/g,
      (_match, path: string) => `](${absoluteUrl(path)})`,
    )
    .replace(
      /\]\((#[^)\s]+)\)/g,
      (_match, hash: string) => `](${absoluteUrl(pagePath)}${hash})`,
    );
}

function day(value: string | null | undefined): string | undefined {
  return value ? value.slice(0, 10) : undefined;
}

function newest(values: (string | undefined)[]): string | undefined {
  return values.filter(Boolean).sort().at(-1);
}

function articleLastmod(article: ArticleCard): string | undefined {
  return day(article.updatedAt ?? article.publishedAt);
}

const oneLine = (value: string) => value.replace(/\s*\n\s*/g, " ").trim();

const cache = new Map<Locale, Promise<InventoryEntry[]>>();

export function getInventory(language: Locale = "pl") {
  let entries = cache.get(language);
  if (!entries) {
    entries = buildInventory(language);
    cache.set(language, entries);
  }
  return entries;
}

async function buildInventory(language: Locale): Promise<InventoryEntry[]> {
  const [settings, articles, categories, ebooks, ebookPaths, legal] =
    await Promise.all([
      getSiteSettings(language),
      listArticles(language),
      listCategories(language),
      listEbooks(language),
      getEbookPaths(),
      getLegalPagePaths(),
    ]);
  const ebookLandings = new Set(
    ebookPaths
      .filter((entry) => entry.language === language && entry.slug)
      .map((entry) => entry.slug),
  );
  const entries: InventoryEntry[] = [];

  const sectionPages: [InventoryKind, string, string][] = [
    ["home", "home", homePath(language)],
    ["about", "o-mnie", aboutPath(language)],
    ["consultation", "konsultacje", consultationPath(language)],
    ["contact", "kontakt", pagePath(language, "kontakt")],
    ["page", WITHDRAWAL_SLUG, pagePath(language, WITHDRAWAL_SLUG)],
  ];
  for (const [kind, slug, path] of sectionPages) {
    const page = await getPage(language, slug);
    if (page.seo?.noindex) continue;
    const hero = page.sections?.find(
      (section) => section?._type === "heroSection",
    ) as { title?: string | null } | undefined;
    entries.push({
      kind,
      path,
      cardTitle: hero?.title?.trim() || undefined,
      title: oneLine(page.seo?.title ?? page.title),
      description: page.seo?.description ?? undefined,
      markdown: async () => serializePage(page, language),
    });
  }

  const blogPage = await getBlogPage(language);
  // Hidden pages (`seo.noindex`) stay out of sitemap, Markdown, llms.txt, RSS.
  const visibleArticles = articles.filter((article) => !article.noindex);
  if (!blogPage.seo?.noindex)
    entries.push({
      kind: "blog",
      path: blogPath(language),
      title: oneLine(blogPage.seo?.title ?? blogPage.title),
      description: blogPage.seo?.description ?? undefined,
      lastmod: newest(visibleArticles.map(articleLastmod)),
      markdown: async () =>
        serializeBlogCollection(
          blogPage,
          await getArticleIndex(language, 1),
          categories,
          language,
          { pageHref: (page) => blogPath(language, page) },
        ),
    });

  for (const category of categories) {
    if (!category.slug || !category.title) continue;
    const slug = category.slug;
    const inCategory = visibleArticles.filter((article) =>
      article.categories?.some((item) => item?.slug === slug),
    );
    // Empty categories are thin pages: noindex and outside the inventory.
    if (!inCategory.length) continue;
    entries.push({
      kind: "category",
      path: blogCategoryPath(language, slug),
      title: category.title,
      cardTitle: category.title,
      lastmod: newest(inCategory.map(articleLastmod)),
      markdown: async () =>
        serializeBlogCollection(
          blogPage,
          await getArticleIndex(language, 1, { categorySlug: slug }),
          categories,
          language,
          {
            category: await getCategory(language, slug),
            pageHref: (page) => blogCategoryPath(language, slug, page),
          },
        ),
    });
  }

  for (const article of visibleArticles) {
    if (!article.slug) continue;
    const slug = article.slug;
    entries.push({
      kind: "article",
      path: articlePath(language, slug),
      title: article.title,
      cardTitle: article.title,
      description: article.lead ?? undefined,
      lastmod: articleLastmod(article),
      meta: {
        publishedAt: article.publishedAt ?? undefined,
        categories: (article.categories ?? []).flatMap((item) =>
          item?.title ? [item.title] : [],
        ),
      },
      markdown: async () =>
        serializeArticle(
          mapArticle(await getArticle(language, slug), settings),
        ),
    });
  }

  const ebooksPage = await getPage(language, "ebooki");
  const ebookCards = ebooks as EbookCard[];
  if (!ebooksPage.seo?.noindex)
    entries.push({
      kind: "ebooks",
      path: ebookCollectionPath(language),
      title: oneLine(ebooksPage.seo?.title ?? ebooksPage.title),
      description: ebooksPage.seo?.description ?? undefined,
      markdown: async () =>
        serializeEbookCollectionView(
          mapEbookCollection(ebooksPage, ebookCards, language),
          language,
        ),
    });
  for (const topic of EBOOK_TOPICS as readonly EbookCollectionFilter[]) {
    const view = mapEbookCollection(ebooksPage, ebookCards, language, topic);
    if (view.isCategoryEmpty) continue;
    entries.push({
      kind: "ebookTopic",
      path: ebookCollectionPath(language, topic),
      title: view.seoTitle,
      description: view.seoDescription,
      markdown: async () => serializeEbookCollectionView(view, language),
    });
  }
  for (const ebook of ebookCards) {
    // Only e-books with a published landing page (same source as the route).
    if (!ebook.slug || !ebookLandings.has(ebook.slug) || ebook.noindex) {
      continue;
    }
    const slug = ebook.slug;
    entries.push({
      kind: "ebook",
      path: ebookPath(language, slug),
      title: ebook.title ?? slug,
      cardTitle: ebook.title ?? slug,
      description: ebook.cardDescription ?? undefined,
      meta: {
        status: ebook.availability ?? undefined,
        price:
          ebook.priceGross != null && ebook.currency
            ? formatPriceGross(ebook.priceGross, ebook.currency, language)
            : undefined,
      },
      markdown: async () =>
        serializeEbook(await getEbook(language, slug), language),
    });
  }

  for (const entry of legal) {
    if (entry.language !== language || !entry.slug) continue;
    const page = await getLegalPage(language, entry.slug);
    if (page.seo?.noindex) continue;
    const view = mapLegalPage(page, settings);
    entries.push({
      kind: "legal",
      path: view.href,
      title: view.title,
      cardTitle: stripBrand(view.title),
      description: view.seoDescription,
      lastmod: day(page.effectiveFrom),
      markdown: async () => serializeLegalPage(view),
    });
  }

  return entries;
}

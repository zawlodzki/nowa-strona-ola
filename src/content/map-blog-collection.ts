import type { Locale } from "@ola/shared";

import {
  blogCardArt,
  blogIndexCopy,
  blogPageStatus,
  blogRangeLabel,
  objectPositionFromMedia,
  type BlogCardFrame,
} from "@/content/blog-collection-seed";
import { toFormCopy } from "@/content/map-sections";
import { formatDate } from "@/lib/dates";
import { articlePath, blogCategoryPath, blogPath, homePath } from "@/lib/paths";
import { isRemoteImageSrc, isSiteRasterKey } from "@/lib/site-images";
import type {
  ArticleCard,
  CategoryContent,
  SiteSettings,
} from "@/sanity/repository";
import type { FormCopy } from "@/sections/types";

export interface BlogPostCard {
  id: string;
  slug: string;
  href: string;
  title: string;
  lead: string;
  publishedAt: string;
  dateLabel: string;
  categoryLabel: string;
  categoryHref: string | null;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  objectPosition?: string;
  frame: BlogCardFrame;
  readLabel: string;
}

export interface BlogCollectionView {
  language: Locale;
  href: string;
  alternateHref: string | null;
  seoTitle: string;
  seoDescription: string;
  title: string;
  lead: string;
  note?: string;
  latestTitle: string;
  collectionTitle: string;
  emptyMessage: string;
  emptyCategoryMessage: string;
  rangeLabel: string | null;
  pageStatus: string;
  previousLabel: string;
  nextLabel: string;
  paginationLabel: string;
  pageLabel: string;
  readActionLabel: string;
  latest: BlogPostCard | null;
  items: BlogPostCard[];
  categories: {
    title: string;
    href: string;
    current: boolean;
    slug: string;
  }[];
  breadcrumbs: { href: string; label: string; current?: boolean }[];
  pagination: {
    page: number;
    totalPages: number;
    prevHref: string | null;
    nextHref: string | null;
    pages: { href: string; page: number; current: boolean }[];
  } | null;
  newsletter: FormCopy | null;
  isEmpty: boolean;
  isCategoryEmpty: boolean;
  category: { title: string; slug: string } | null;
}

type BlogIndexFields = {
  title?: string | null;
  lead?: string | null;
  note?: string | null;
  latestTitle?: string | null;
  collectionTitle?: string | null;
  readActionLabel?: string | null;
  allCategoriesLabel?: string | null;
  emptyMessage?: string | null;
  emptyCategoryMessage?: string | null;
  previousLabel?: string | null;
  nextLabel?: string | null;
  paginationLabel?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

type BlogNewsletterFields = {
  enabled?: boolean | null;
  title?: string | null;
  lead?: string | null;
  form?: Parameters<typeof toFormCopy>[0]["form"];
};

function required(value: string | null | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Brak ${name} w ustawieniach indeksu bloga.`);
  }
  return trimmed;
}

function pageHash(href: string) {
  return `${href}#wpisy`;
}

function resolveArticleImage(article: ArticleCard): {
  src: string;
  alt: string;
  width: number;
  height: number;
  objectPosition?: string;
  frame: BlogCardFrame;
} {
  const slug = article.slug?.trim();
  if (!slug) {
    throw new Error("Artykuł kolekcji nie ma sluga.");
  }
  const src = article.media?.src?.trim();
  const alt = article.media?.alt?.trim();
  const hotspot = article.media
    ? objectPositionFromMedia(
        (
          article.media as {
            hotspot?: { x?: number | null; y?: number | null } | null;
          }
        ).hotspot,
      )
    : undefined;
  if (src && (isSiteRasterKey(src) || isRemoteImageSrc(src))) {
    const mapped = blogCardArtBySlugOrNull(slug);
    return {
      src,
      alt: alt || mapped?.alt || article.title,
      width: mapped?.width ?? 1536,
      height: mapped?.height ?? 1024,
      objectPosition: hotspot ?? mapped?.objectPosition,
      frame: mapped?.frame ?? "food",
    };
  }
  if (src) {
    throw new Error(`Nieobsługiwany obraz artykułu ${slug}: ${src}`);
  }
  return blogCardArt(slug);
}

function blogCardArtBySlugOrNull(slug: string) {
  try {
    return blogCardArt(slug);
  } catch {
    return null;
  }
}

export function toBlogPostCard(
  article: ArticleCard,
  language: Locale,
  readLabel: string,
): BlogPostCard {
  if (article.language && article.language !== language) {
    throw new Error(
      `Artykuł ${article.slug ?? article.id} ma język ${article.language}, oczekiwano ${language}.`,
    );
  }
  const slug = required(article.slug, "slug artykułu");
  const title = required(article.title, "tytuł artykułu");
  const lead = required(article.lead, "lead artykułu");
  const publishedAt = required(article.publishedAt, "datę publikacji");
  const image = resolveArticleImage(article);
  const category = article.categories?.find((item) => item?.title && item.slug);
  return {
    id: required(article.id, "identyfikator artykułu"),
    slug,
    href: articlePath(language, slug),
    title,
    lead,
    publishedAt,
    dateLabel: formatDate(publishedAt, language),
    categoryLabel: category?.title ?? "",
    categoryHref: category?.slug
      ? blogCategoryPath(language, category.slug)
      : null,
    imageSrc: image.src,
    imageAlt: image.alt,
    imageWidth: image.width,
    imageHeight: image.height,
    objectPosition: image.objectPosition,
    frame: image.frame,
    readLabel,
  };
}

export function mapBlogCollection(
  settings: SiteSettings,
  index: {
    latest: ArticleCard | null;
    items: ArticleCard[];
    page: number;
    totalPages: number;
    total: number;
    rangeStart: number;
    rangeEnd: number;
    isEmpty: boolean;
  },
  categories: readonly {
    title?: string | null;
    slug?: string | null;
    translation?: { language?: string | null; slug?: string | null } | null;
  }[],
  language: Locale,
  options: {
    category?: Pick<CategoryContent, "title" | "slug" | "translation"> | null;
    pageHref: (page: number) => string;
  },
): BlogCollectionView {
  if (settings.language && settings.language !== language) {
    throw new Error(
      `Ustawienia ${settings.language} nie pasują do indeksu bloga ${language}.`,
    );
  }
  const indexFields = (settings as { blogIndex?: BlogIndexFields | null })
    .blogIndex;
  const newsletterFields = (
    settings as { blogNewsletter?: BlogNewsletterFields | null }
  ).blogNewsletter;
  const title = required(indexFields?.title, "tytuł indeksu");
  const lead = required(indexFields?.lead, "lead indeksu");
  const readActionLabel = required(
    indexFields?.readActionLabel,
    "etykietę odnośnika karty",
  );
  const copy = blogIndexCopy[language];
  const category = options.category?.slug
    ? {
        title: required(options.category.title, "nazwę kategorii"),
        slug: options.category.slug,
      }
    : null;
  const href = category
    ? options.pageHref(index.page)
    : blogPath(language, index.page);
  const latest = index.latest
    ? toBlogPostCard(index.latest, language, readActionLabel)
    : null;
  const items = index.items.map((article) =>
    toBlogPostCard(article, language, readActionLabel),
  );
  const visible = [...(latest ? [latest] : []), ...items];
  const slugs = visible.map((item) => item.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Najnowszy wpis powtórzył się na liście kolekcji.");
  }
  const isCategoryEmpty = Boolean(category) && index.total === 0;
  const alternateHref = category
    ? options.category?.translation?.slug
      ? blogCategoryPath(
          language === "pl" ? "en" : "pl",
          options.category.translation.slug,
          index.page,
        )
      : null
    : blogPath(language === "pl" ? "en" : "pl", index.page);
  const pagination =
    index.totalPages > 1
      ? {
          page: index.page,
          totalPages: index.totalPages,
          prevHref:
            index.page > 1 ? pageHash(options.pageHref(index.page - 1)) : null,
          nextHref:
            index.page < index.totalPages
              ? pageHash(options.pageHref(index.page + 1))
              : null,
          pages: Array.from({ length: index.totalPages }, (_, offset) => {
            const page = offset + 1;
            return {
              href: pageHash(options.pageHref(page)),
              page,
              current: page === index.page,
            };
          }),
        }
      : null;
  const breadcrumbs = [
    { href: homePath(language), label: copy.breadcrumbHome },
    {
      href: blogPath(language),
      label: copy.breadcrumbBlog,
      current: !category,
    },
  ];
  if (category) {
    breadcrumbs.push({
      href: options.pageHref(1),
      label: category.title,
      current: true,
    });
  }
  return {
    language,
    href,
    alternateHref,
    seoTitle: indexFields?.seoTitle?.trim() || copy.seoTitle,
    seoDescription: indexFields?.seoDescription?.trim() || copy.seoDescription,
    title,
    lead,
    note: indexFields?.note?.trim() || undefined,
    latestTitle: required(
      indexFields?.latestTitle,
      "nagłówek najnowszego wpisu",
    ),
    collectionTitle: category
      ? category.title
      : required(indexFields?.collectionTitle, "nagłówek listy wpisów"),
    emptyMessage: required(indexFields?.emptyMessage, "komunikat pustej listy"),
    emptyCategoryMessage: required(
      indexFields?.emptyCategoryMessage,
      "komunikat pustej kategorii",
    ),
    rangeLabel: blogRangeLabel(
      language,
      index.rangeStart,
      index.rangeEnd,
      index.total,
    ),
    pageStatus: blogPageStatus(language, index.page, index.totalPages),
    previousLabel: required(
      indexFields?.previousLabel,
      "etykietę poprzedniej strony",
    ),
    nextLabel: required(indexFields?.nextLabel, "etykietę następnej strony"),
    paginationLabel: required(
      indexFields?.paginationLabel,
      "etykietę paginacji",
    ),
    pageLabel: copy.pageLabel,
    readActionLabel,
    latest,
    items,
    categories: [
      {
        title: required(
          indexFields?.allCategoriesLabel,
          "etykietę wszystkich kategorii",
        ),
        href: blogPath(language),
        current: !category,
        slug: "",
      },
      ...categories.flatMap((item) =>
        item.title && item.slug
          ? [
              {
                title: item.title,
                href: blogCategoryPath(language, item.slug),
                current: category?.slug === item.slug,
                slug: item.slug,
              },
            ]
          : [],
      ),
    ],
    breadcrumbs,
    pagination,
    newsletter:
      newsletterFields?.enabled === false
        ? null
        : toFormCopy({
            title: required(newsletterFields?.title, "tytuł newslettera bloga"),
            lead: required(newsletterFields?.lead, "lead newslettera bloga"),
            form: newsletterFields?.form,
          }),
    isEmpty: index.isEmpty && !category,
    isCategoryEmpty,
    category,
  };
}

import type { Locale } from "@ola/shared";

import {
  mapBlogCollection,
  type BlogCollectionView,
} from "@/content/map-blog-collection";
import type { CategoryContent, SiteSettings } from "@/sanity/repository";

function heading(level: 1 | 2 | 3, value: string) {
  return `${"#".repeat(level)} ${value.replaceAll("\n", " ").trim()}`;
}

function postLines(item: BlogCollectionView["items"][number]) {
  return [
    heading(3, item.title),
    item.categoryLabel
      ? `${item.categoryLabel}, ${item.dateLabel}`
      : item.dateLabel,
    item.lead,
    `[${item.title}](${item.href})`,
  ];
}

export function serializeBlogCollectionView(view: BlogCollectionView): string {
  const latest = view.latest
    ? [heading(2, view.latestTitle), ...postLines(view.latest)]
    : [];
  const posts = view.items.flatMap((item) => postLines(item));
  const categories = view.categories.map(
    (category) => `- [${category.title}](${category.href})`,
  );
  const pages = view.pagination
    ? view.pagination.pages.map((page) =>
        page.current
          ? `${page.page}`
          : `[${page.page}](${page.href.replace(/#wpisy$/, "")})`,
      )
    : [];
  return [
    heading(1, view.title),
    view.lead,
    view.note,
    heading(2, view.collectionTitle),
    view.rangeLabel,
    view.isEmpty ? view.emptyMessage : "",
    view.isCategoryEmpty ? view.emptyCategoryMessage : "",
    categories.join("\n"),
    ...latest,
    ...posts,
    pages.length ? pages.join(" · ") : "",
    view.newsletter ? heading(2, view.newsletter.title) : "",
    view.newsletter?.lead,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function serializeBlogCollection(
  settings: SiteSettings,
  index: Parameters<typeof mapBlogCollection>[1],
  categories: Parameters<typeof mapBlogCollection>[2],
  language: Locale,
  options: {
    category?: Pick<CategoryContent, "title" | "slug" | "translation"> | null;
    pageHref: (page: number) => string;
  },
): string {
  return serializeBlogCollectionView(
    mapBlogCollection(settings, index, categories, language, options),
  );
}

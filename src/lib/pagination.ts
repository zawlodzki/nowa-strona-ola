import { ARTICLES_PER_PAGE } from "./paths";

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
} | null {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return null;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages,
    total,
  };
}

export function paginateArticles<T extends { featured?: string | null }>(
  articles: readonly T[],
  page: number,
  opts: { pageSize?: number } = {},
) {
  const result = paginate(articles, page, opts.pageSize ?? ARTICLES_PER_PAGE);
  if (!result) {
    throw new Error(`Brak strony ${page} indeksu bloga.`);
  }
  return {
    ...result,
    featured: articles.filter((article) => article.featured === "featured"),
  };
}

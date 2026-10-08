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

export function sortByPublishedAt<
  T extends { id?: string | null; publishedAt?: string | null },
>(items: readonly T[]): T[] {
  return [...items].sort((left, right) => {
    const byDate = (right.publishedAt ?? "").localeCompare(
      left.publishedAt ?? "",
    );
    if (byDate !== 0) return byDate;
    return (left.id ?? "").localeCompare(right.id ?? "");
  });
}

export function blogCollectionPageCount(total: number, pageSize = 6): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil((total - 1) / pageSize));
}

export function paginateBlogCollection<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): {
  latest: T | null;
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  isEmpty: boolean;
} | null {
  const total = items.length;
  if (total === 0) {
    if (!Number.isInteger(page) || page !== 1) return null;
    return {
      latest: null,
      items: [],
      page: 1,
      totalPages: 1,
      total: 0,
      rangeStart: 0,
      rangeEnd: 0,
      isEmpty: true,
    };
  }
  const [latest, ...rest] = items;
  const totalPages = blogCollectionPageCount(total, pageSize);
  if (!Number.isInteger(page) || page < 1 || page > totalPages) return null;
  const start = (page - 1) * pageSize;
  const slice = rest.slice(start, start + pageSize);
  return {
    latest: page === 1 ? (latest ?? null) : null,
    items: slice,
    page,
    totalPages,
    total,
    rangeStart: slice.length ? start + 2 : 0,
    rangeEnd: slice.length ? start + 1 + slice.length : 0,
    isEmpty: false,
  };
}

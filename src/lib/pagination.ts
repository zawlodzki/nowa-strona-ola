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

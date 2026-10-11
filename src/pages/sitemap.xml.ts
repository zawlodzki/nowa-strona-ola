import type { APIRoute } from "astro";

import { getInventory } from "@/lib/seo/inventory";
import { absoluteUrl } from "@/lib/seo/site";

/** HTML pages of the inventory only: no demo, empty, paginated or `.md` URLs. */
export const GET: APIRoute = async () => {
  const entries = [...(await getInventory("pl"))].sort((a, b) =>
    a.path.localeCompare(b.path),
  );
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((entry) => {
    const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
    return `  <url><loc>${absoluteUrl(entry.path)}</loc>${lastmod}</url>`;
  })
  .join("\n")}
</urlset>
`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

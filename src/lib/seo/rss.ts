import { catalogText } from "@/lib/catalog-text";
import type { InventoryEntry } from "@/lib/seo/inventory";
import { absoluteUrl, htmlLang } from "@/lib/seo/site";

function escapeXml(value: string): string {
  return catalogText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(value: string): string {
  return new Date(value).toUTCString();
}

/** RSS 2.0 of blog articles with their lead (decision D8 pending: lead only). */
export function buildRss(
  blog: InventoryEntry,
  articles: InventoryEntry[],
): string {
  const items = [...articles]
    .filter((entry) => entry.meta?.publishedAt)
    .sort((a, b) =>
      (b.meta?.publishedAt ?? "").localeCompare(a.meta?.publishedAt ?? ""),
    );
  const self = absoluteUrl("/blog/rss.xml");
  const newest = items[0]?.meta?.publishedAt;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(blog.title)}</title>
    <link>${absoluteUrl(blog.path)}</link>
    <description>${escapeXml(blog.description ?? blog.title)}</description>
    <language>${htmlLang.pl}</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml"/>
${newest ? `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>\n` : ""}${items
    .map((entry) => {
      const url = absoluteUrl(entry.path);
      const categories = (entry.meta?.categories ?? [])
        .map((name) => `      <category>${escapeXml(name)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(entry.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(entry.meta?.publishedAt as string)}</pubDate>`,
        entry.description
          ? `      <description>${escapeXml(entry.description)}</description>`
          : "",
        categories,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n")}
  </channel>
</rss>
`;
}

import { createSatteriMarkdownProcessor } from "@astrojs/markdown-satteri";

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

async function articleHtml(entry: InventoryEntry): Promise<string> {
  const base = absoluteUrl(entry.path);
  const processor = await createSatteriMarkdownProcessor({
    syntaxHighlight: false,
    features: { smartPunctuation: false, rawHtml: false },
    hastPlugins: [
      {
        name: "rss-safe-content",
        raw(node) {
          return { type: "text", value: node.value };
        },
        element: {
          filter: ["a", "img"],
          visit(node, ctx) {
            const property = node.tagName === "a" ? "href" : "src";
            const value = node.properties[property];
            if (typeof value !== "string") return;
            const url = new URL(value, base);
            const allowed = ["https:", "http:"];
            if (node.tagName === "a") allowed.push("mailto:", "tel:");
            ctx.setProperty(
              node,
              property,
              allowed.includes(url.protocol) ? url.href : undefined,
            );
          },
        },
      },
    ],
  });
  return (await processor.render(await entry.markdown())).code;
}

export async function buildRss(
  blog: InventoryEntry,
  articles: InventoryEntry[],
): Promise<string> {
  const items = [...articles]
    .filter((entry) => entry.meta?.publishedAt)
    .sort((a, b) =>
      (b.meta?.publishedAt ?? "").localeCompare(a.meta?.publishedAt ?? ""),
    );
  const self = absoluteUrl("/blog/rss.xml");
  const newest = items[0]?.meta?.publishedAt;
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(blog.title)}</title>
    <link>${absoluteUrl(blog.path)}</link>
    <description>${escapeXml(blog.description ?? blog.title)}</description>
    <language>${htmlLang.pl}</language>
    <atom:link href="${self}" rel="self" type="application/rss+xml"/>
${newest ? `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>\n` : ""}${(
    await Promise.all(
      items.map(async (entry) => {
        const url = absoluteUrl(entry.path);
        const categories = (entry.meta?.categories ?? [])
          .map((name) => `      <category>${escapeXml(name)}</category>`)
          .join("\n");
        return [
          "    <item>",
          `      <title>${escapeXml(entry.title)}</title>`,
          `      <link>${url}</link>`,
          `      <guid isPermaLink="true">${url}</guid>`,
          `      <pubDate>${rfc822(entry.meta?.publishedAt ?? "")}</pubDate>`,
          entry.description
            ? `      <description>${escapeXml(entry.description)}</description>`
            : "",
          categories,
          `      <content:encoded>${escapeXml(await articleHtml(entry))}</content:encoded>`,
          "    </item>",
        ]
          .filter(Boolean)
          .join("\n");
      }),
    )
  ).join("\n")}
  </channel>
</rss>
`;
}

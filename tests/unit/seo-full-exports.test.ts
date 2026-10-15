import { describe, expect, it } from "vitest";

import type {
  InventoryEntry,
  InventoryKind,
} from "../../src/lib/seo/inventory";
import { buildHeadersFile } from "../../src/lib/seo/edge-files";
import { headerValue } from "../../scripts/static-asset-headers.mjs";
import { buildLlmsFullTxt } from "../../src/lib/seo/llms";
import { buildRss } from "../../src/lib/seo/rss";

function entry(
  kind: InventoryKind,
  path: string,
  markdown: string,
): InventoryEntry {
  return {
    kind,
    path,
    title: "Tytuł & temat",
    description: "Lead < 100 słów",
    meta: { publishedAt: "2026-10-12T08:00:00Z" },
    markdown: async () => markdown,
  };
}

describe("full RSS content", () => {
  const blog = entry("blog", "/blog/", "");

  it("includes the body, tables, sources and FAQ with absolute links", async () => {
    const article = entry(
      "article",
      "/blog/temat/",
      [
        "# Temat",
        "",
        "Pełny akapit poza leadem.",
        "",
        "| Badanie | Wynik |",
        "| --- | --- |",
        "| TSH | 2 |",
        "",
        "## Źródła",
        "",
        "- [Źródło](https://example.com/badanie)",
        "",
        "## FAQ",
        "",
        "### Co dalej?",
        "",
        "[Konsultacja](/konsultacje/) i [sekcja](#faq).",
        "",
        "![Wykres](/images/wykres.png)",
      ].join("\n"),
    );
    const rss = await buildRss(blog, [article]);
    expect(rss).toContain(
      'xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    );
    expect(rss).toContain("<description>Lead &lt; 100 słów</description>");
    expect(rss).toContain("<title>Tytuł &amp; temat</title>");
    expect(rss).toContain("&lt;p&gt;Pełny akapit poza leadem.&lt;/p&gt;");
    expect(rss).toContain("&lt;table&gt;");
    expect(rss).toContain("&lt;td&gt;TSH&lt;/td&gt;");
    expect(rss).toContain("Źródła&lt;/h2&gt;");
    expect(rss).toContain("Co dalej?&lt;/h3&gt;");
    expect(rss).toContain(
      "href=&quot;https://aleksandraolesiewicz.com/konsultacje/&quot;",
    );
    expect(rss).toContain(
      "href=&quot;https://aleksandraolesiewicz.com/blog/temat/#faq&quot;",
    );
    expect(rss).toContain(
      "src=&quot;https://aleksandraolesiewicz.com/images/wykres.png&quot;",
    );
  });

  it("keeps raw HTML inert and removes unsafe link and image protocols", async () => {
    const rss = await buildRss(blog, [
      entry(
        "article",
        "/blog/test/",
        [
          '<script>alert("x")</script>',
          '<img src="https://example.com/x" onerror="alert(1)">',
          "[Niebezpieczny](javascript:alert%281%29)",
          "![Niebezpieczny](data:image/svg+xml;base64,AA)",
          "[Mail](mailto:ola@example.com)",
          "[Zewnętrzny](//example.com/tekst)",
          "Koniec ]]> & tekst.",
        ].join("\n\n"),
      ),
    ]);
    expect(rss).not.toContain("&lt;script&gt;");
    expect(rss).toContain("&amp;lt;script&amp;gt;");
    expect(rss).not.toMatch(/(?:href|src)=&quot;(?:javascript|data):/);
    expect(rss).toContain("href=&quot;mailto:ola@example.com&quot;");
    expect(rss).toContain("href=&quot;https://example.com/tekst&quot;");
    expect(rss).not.toContain("]]>");
  });

  it("sorts published entries and skips undated entries without serializing them", async () => {
    const missing: InventoryEntry = {
      ...entry("article", "/blog/missing/", ""),
      meta: {},
      markdown: async () => {
        throw new Error("undated article rendered");
      },
    };
    const older = entry("article", "/blog/older/", "Starszy");
    older.meta = { publishedAt: "2026-10-11T08:00:00Z" };
    const rss = await buildRss(blog, [
      older,
      missing,
      entry("article", "/blog/newer/", "Nowszy"),
    ]);
    expect(rss).not.toContain("/blog/missing/");
    expect(rss.indexOf("/blog/newer/")).toBeLessThan(
      rss.indexOf("/blog/older/"),
    );
    const empty = await buildRss(blog, []);
    expect(empty).toContain("<channel>");
    expect(empty).not.toContain("<item>");
  });
});

describe("llms-full.txt", () => {
  it("sets plain text and noindex in production static asset headers", () => {
    const headers = buildHeadersFile({ indexing: true });
    expect(headerValue(headers, "/llms-full.txt", "Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(headerValue(headers, "/llms-full.txt", "X-Robots-Tag")).toBe(
      "noindex",
    );
  });
  it("includes only key pages in fixed order and resolves links per page", async () => {
    const output = await buildLlmsFullTxt([
      entry("ebook", "/ebooki/produkt/", "# Produkt\n\n[FAQ](#faq)"),
      entry("article", "/blog/test/", "Nie eksportować artykułu"),
      entry("contact", "/kontakt/", "Nie eksportować kontaktu"),
      entry("legal", "/regulamin/", "Nie eksportować prawa"),
      entry("category", "/blog/kategoria/test/", "Nie eksportować kategorii"),
      entry("ebookTopic", "/ebooki/pcos/", "Nie eksportować filtra"),
      entry("ebooks", "/ebooki/", "# E-booki"),
      entry("home", "/", "# Główna\n\n[Produkty](/ebooki/)"),
      entry("consultation", "/konsultacje/", "# Konsultacje"),
      entry("about", "/o-mnie/", "# O mnie"),
    ]);
    expect(output).toBe(
      [
        "Źródło: https://aleksandraolesiewicz.com/\n\n# Główna\n\n[Produkty](https://aleksandraolesiewicz.com/ebooki/)",
        "Źródło: https://aleksandraolesiewicz.com/o-mnie/\n\n# O mnie",
        "Źródło: https://aleksandraolesiewicz.com/konsultacje/\n\n# Konsultacje",
        "Źródło: https://aleksandraolesiewicz.com/ebooki/\n\n# E-booki",
        "Źródło: https://aleksandraolesiewicz.com/ebooki/produkt/\n\n# Produkt\n\n[FAQ](https://aleksandraolesiewicz.com/ebooki/produkt/#faq)",
      ].join("\n\n---\n\n") + "\n",
    );
  });

  it("has no fallback content when the inventory has no key pages", async () => {
    expect(await buildLlmsFullTxt([entry("article", "/blog/a/", "A")])).toBe(
      "",
    );
  });
});

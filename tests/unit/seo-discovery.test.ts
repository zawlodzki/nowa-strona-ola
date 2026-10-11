import { describe, expect, it } from "vitest";

import {
  buildHeadersFile,
  buildRedirectsFile,
} from "../../src/lib/seo/edge-files";
import {
  absolutizeMarkdownLinks,
  getInventory,
  markdownPath,
  ogCardPath,
  stripBrand,
} from "../../src/lib/seo/inventory";
import { titleSize } from "../../src/lib/seo/og-card";
import { buildRobotsTxt } from "../../src/lib/seo/robots";

describe("Markdown alternates", () => {
  it("maps HTML paths to .md files", () => {
    expect(markdownPath("/")).toBe("/index.md");
    expect(markdownPath("/o-mnie/")).toBe("/o-mnie.md");
    expect(markdownPath("/blog/kategoria/pcos/")).toBe(
      "/blog/kategoria/pcos.md",
    );
  });

  it("makes root-relative links and anchors absolute", () => {
    expect(
      absolutizeMarkdownLinks(
        "[A](/blog/) [B](#faq) [C](https://x.pl/) [D](//cdn)",
        "/konsultacje/",
      ),
    ).toBe(
      "[A](https://aleksandraolesiewicz.com/blog/) [B](https://aleksandraolesiewicz.com/konsultacje/#faq) [C](https://x.pl/) [D](//cdn)",
    );
  });
});

describe("site inventory", () => {
  it("lists only routes that exist, without demo pages", async () => {
    const entries = await getInventory("pl");
    const paths = entries.map((entry) => entry.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/konsultacje/");
    expect(paths).toContain("/ebooki/suplementy-w-pcos/");
    for (const demo of ["/tylko-pl/", "/warsztat/", "/wdrozenie/", "/ui/"]) {
      expect(paths).not.toContain(demo);
    }
    expect(new Set(paths).size).toBe(paths.length);
    const article = entries.find((entry) => entry.kind === "article");
    expect(article?.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("robots.txt (decision D1)", () => {
  it("blocks everything outside production", () => {
    expect(buildRobotsTxt({ indexing: false })).toContain(
      "User-agent: *\nDisallow: /",
    );
  });

  it("allows search and answers, disallows training crawlers", () => {
    const robots = buildRobotsTxt({ indexing: true });
    expect(robots).toContain(
      "Content-Signal: search=yes, ai-input=yes, ai-train=no",
    );
    expect(robots).toMatch(/User-agent: GPTBot[\s\S]*Disallow: \//);
    expect(robots).not.toContain("OAI-SearchBot");
    expect(robots).toContain(
      "Sitemap: https://aleksandraolesiewicz.com/sitemap.xml",
    );
  });
});

describe("_headers", () => {
  it("adds site-wide noindex only outside production", () => {
    expect(buildHeadersFile({ indexing: false })).toMatch(
      /^\/\*\n {2}X-Robots-Tag: noindex/,
    );
    expect(buildHeadersFile({ indexing: true })).not.toMatch(/^\/\*\n/);
  });

  it("points Markdown to the HTML canonical", () => {
    const headers = buildHeadersFile({ indexing: true });
    expect(headers).toContain(
      'Link: <https://aleksandraolesiewicz.com/:splat/>; rel="canonical"',
    );
    expect(headers).toContain("/index.md\n  ! Link");
  });
});

describe("_redirects", () => {
  const live = ["/", "/blog/", "/o-mnie/"];

  it("writes both slash variants of a source", () => {
    expect(
      buildRedirectsFile(
        [{ from: "/stara", to: "/o-mnie/", status: "301" }],
        live,
      ),
    ).toBe("/stara /o-mnie/ 301\n/stara/ /o-mnie/ 301\n");
  });

  it("accepts external targets and strips the own origin", () => {
    expect(
      buildRedirectsFile(
        [
          {
            from: "/a/",
            to: "https://aleksandraolesiewicz.com/blog/",
            status: "302",
          },
        ],
        live,
      ),
    ).toContain("/a/ /blog/ 302");
  });

  it("rejects chains, loops, shadowed pages and missing targets", () => {
    expect(() =>
      buildRedirectsFile(
        [
          { from: "/a/", to: "/b/", status: "301" },
          { from: "/b/", to: "/blog/", status: "301" },
        ],
        live,
      ),
    ).toThrow(/Łańcuch/);
    expect(() =>
      buildRedirectsFile([{ from: "/a/", to: "/a", status: "301" }], live),
    ).toThrow(/na siebie/);
    expect(() =>
      buildRedirectsFile(
        [{ from: "/blog", to: "/o-mnie/", status: "301" }],
        live,
      ),
    ).toThrow(/zasłania/);
    expect(() =>
      buildRedirectsFile(
        [{ from: "/x/", to: "/nie-ma/", status: "301" }],
        live,
      ),
    ).toThrow(/nie ma w buildzie/);
    expect(() =>
      buildRedirectsFile(
        [
          { from: "/x/", to: "/blog/", status: "301" },
          { from: "/x", to: "/o-mnie/", status: "301" },
        ],
        live,
      ),
    ).toThrow(/zduplikowane/);
  });
});

describe("share cards", () => {
  it("maps pages to /og/*.png and strips the brand from titles", () => {
    expect(ogCardPath("/")).toBe("/og/index.png");
    expect(ogCardPath("/blog/a/")).toBe("/og/blog/a.png");
    expect(stripBrand("Kontakt — Aleksandra Olesiewicz")).toBe("Kontakt");
    expect(stripBrand("Suplementy w PMOS (PCOS) | E-book Aleksandry Olesiewicz")).toBe(
      "Suplementy w PMOS (PCOS)",
    );
    expect(stripBrand("Regulamin newslettera — aleksandraolesiewicz.com")).toBe(
      "Regulamin newslettera",
    );
    expect(stripBrand("Polityka prywatności aleksandraolesiewicz.com")).toBe(
      "Polityka prywatności",
    );
  });

  it("sizes long titles down", () => {
    expect(titleSize("Krótki tytuł")).toBe(84);
    expect(titleSize("x".repeat(120))).toBe(48);
  });
});

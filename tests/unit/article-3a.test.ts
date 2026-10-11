import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { siteSeoData } from "../../src/lib/seo/site-data";

import {
  countWords,
  mapArticle,
  readingMinutes,
} from "../../src/content/map-article";
import { serializeArticle } from "../../src/content/serialize-article";
import { articlePath } from "../../src/lib/paths";
import { articleGraph } from "../../src/lib/seo/page-graphs";
import { getArticle, getSiteSettings } from "../../src/sanity/repository";

describe("Article3a mapper", () => {
  it("maps the featured PL article from the 3a mockup", async () => {
    const [article, settings] = await Promise.all([
      getArticle("pl", "przygotowanie-do-konsultacji-pcos", {
        environment: {},
      }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    const view = mapArticle(article, settings);
    expect(view.href).toBe("/blog/przygotowanie-do-konsultacji-pcos/");
    expect(view.alternateHref).toBe(
      "/en/blog/preparing-for-a-pcos-nutrition-consultation/",
    );
    expect(view.toc).toHaveLength(5);
    expect(view.toc.map((entry) => entry.id)).toEqual([
      "punkt-wyjscia",
      "codziennosc",
      "notatki",
      "pytania",
      "po-rozmowie",
    ]);
    expect(view.authors[0]?.bio).toContain(
      "Znam PMOS (PCOS) także z własnego doświadczenia.",
    );
    expect(view.ebooks?.items).toHaveLength(3);
    expect(view.ebooks?.items.map((item) => item.slug)).toEqual([
      "suplementy-w-pcos",
      "badania-ktore-maja-sens",
      "szczupla-a-jednak-pcos",
    ]);
    expect(view.recommendations).toHaveLength(2);
    expect(view.recommendations?.[0]?.kicker).toBe("PMOS (PCOS) · Odżywianie");
    expect(view.recommendations?.[1]?.kicker).toBe("PMOS (PCOS) · Konsultacje");
    expect(view.faq?.items).toHaveLength(4);
    expect(
      view.newsletter?.fields.some((field) => field.input === "email"),
    ).toBe(true);
    expect(view.newsletter?.formKey).toBe("newsletter");
    expect(view.sidebar?.title).toBe("Zostańmy w kontakcie.");
    expect(view.sources).toEqual([]);
    expect(view.hero.objectPosition).toBe("50% 55%");
    expect(view.byline.photo.objectPosition).toBe("50% 25%");
    expect(view.byline.photo).toMatchObject({ width: 96, height: 120 });
    expect(view.authors[0]?.photo.objectPosition).toBe("50% 50%");
    const graph = articleGraph(view)({
      lang: "pl",
      path: view.href,
      title: view.seoTitle,
      site: siteSeoData(null),
    });
    expect(graph.some((node) => node["@type"] === "FAQPage")).toBe(true);
    const posting = graph.find((node) => node["@type"] === "BlogPosting");
    expect(posting).toMatchObject({
      "@id":
        "https://aleksandraolesiewicz.com/blog/przygotowanie-do-konsultacji-pcos/#article",
      author: { "@id": "https://aleksandraolesiewicz.com/#person" },
      isPartOf: { "@id": "https://aleksandraolesiewicz.com/blog/#blog" },
    });
    expect(view.review).toBeNull();
    expect(posting?.about).toEqual(
      view.topics.map((topic) => ({ "@type": "Thing", name: topic.title })),
    );
    const webPage = graph.find((node) => node["@type"] === "WebPage");
    expect(webPage).not.toHaveProperty("reviewedBy");
  });

  it("maps the English featured article to /en/blog/", async () => {
    const [article, settings] = await Promise.all([
      getArticle("en", "preparing-for-a-pcos-nutrition-consultation", {
        environment: {},
      }),
      getSiteSettings("en", { environment: {} }),
    ]);
    const view = mapArticle(article, settings);
    expect(view.href).toBe(
      articlePath("en", "preparing-for-a-pcos-nutrition-consultation"),
    );
    expect(view.toc).toHaveLength(5);
    expect(view.ebooks?.items).toHaveLength(3);
    expect(view.faq?.items).toHaveLength(4);
    expect(view.recommendations?.[0]?.kicker).toBe("PMOS (PCOS) · Nutrition");
  });

  it("keeps the markdown example for the featured article", async () => {
    const example = readFileSync("src/content/examples/article.md", "utf8");
    const [article, settings] = await Promise.all([
      getArticle("pl", "przygotowanie-do-konsultacji-pcos", {
        environment: {},
      }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    expect(serializeArticle(mapArticle(article, settings))).toBe(example);
  });
});

describe("Article3a AEO elements (SEO-5)", () => {
  it("counts words without Markdown syntax and rounds reading time up", () => {
    expect(countWords("## Tytuł\n\n- jeden [dwa](/x/) **trzy** | 4 |")).toBe(5);
    expect(readingMinutes(0)).toBe(1);
    expect(readingMinutes(201)).toBe(2);
  });

  it("shows takeaways, reading time and disclaimer; review only when set", async () => {
    const [article, settings] = await Promise.all([
      getArticle("pl", "przygotowanie-do-konsultacji-pcos", {
        environment: {},
      }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    const view = mapArticle(article, settings);
    expect(view.keyTakeaways?.items).toHaveLength(4);
    expect(view.readingLabel).toMatch(/^\d+ min czytania$/);
    expect(view.wordCount).toBeGreaterThan(300);
    expect(view.review).toBeNull();
    const reviewed = mapArticle(
      {
        ...article,
        reviewedBy: { name: "Aleksandra Olesiewicz", role: "Dietetyczka" },
        lastReviewedAt: "2026-10-11",
      },
      settings,
    );
    expect(reviewed.review).toMatchObject({
      label: "Sprawdziła merytorycznie",
      dateLabel: "11 października 2026",
    });
    expect(serializeArticle(reviewed)).toContain(
      "Sprawdziła merytorycznie: Aleksandra Olesiewicz, 11 października 2026",
    );
  });
});

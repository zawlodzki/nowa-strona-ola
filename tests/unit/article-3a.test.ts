import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { mapArticle } from "../../src/content/map-article";
import { serializeArticle } from "../../src/content/serialize-article";
import { articlePath } from "../../src/lib/paths";
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
      "Znam PCOS także z własnego doświadczenia.",
    );
    expect(view.ebooks?.items).toHaveLength(3);
    expect(view.ebooks?.items.map((item) => item.slug)).toEqual([
      "suplementy-w-pcos",
      "badania-ktore-maja-sens",
      "szczupla-a-jednak-pcos",
    ]);
    expect(view.recommendations).toHaveLength(2);
    expect(view.recommendations?.[0]?.kicker).toBe("PCOS · Odżywianie");
    expect(view.recommendations?.[1]?.kicker).toBe("PCOS · Konsultacje");
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
    expect(
      view.jsonLd["@graph"].some((node) => node["@type"] === "FAQPage"),
    ).toBe(true);
    const posting = view.jsonLd["@graph"].find(
      (node) => node["@type"] === "BlogPosting",
    ) as { author?: { sameAs?: string[] } } | undefined;
    expect(posting?.author?.sameAs).toEqual([
      "https://www.instagram.com/aleksandra_olesiewicz",
      "https://www.facebook.com/dietetykolesiewicz/",
      "https://www.tiktok.com/@aleksandra_olesiewicz",
    ]);
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
    expect(view.recommendations?.[0]?.kicker).toBe("PCOS · Nutrition");
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

import { describe, expect, it, vi } from "vitest";

import { assertKnownSections } from "../../src/content/sections";
import {
  hrefToContentPathParam,
  isExcludedCatchAllPath,
  parseContentPath,
} from "../../src/lib/content-path";
import { blogIndexLead } from "../../src/lib/copy";
import { paginate, paginateArticles } from "../../src/lib/pagination";
import { blogPath, pagePath, translationHref } from "../../src/lib/paths";
import { listPublishedContentParams } from "../../src/sanity/loaders";
import { PUBLISHED_PAGE_QUERY } from "../../src/sanity/queries";
import {
  getArticle,
  getArticleIndex,
  getPage,
  type PageContent,
} from "../../src/sanity/repository";

const page = {
  id: "page-en",
  language: "en",
  slug: "home",
  title: "Title",
  seo: null,
  translation: { language: "pl", slug: "home" },
  sections: [
    {
      _key: "hero",
      _type: "heroSection",
      variant: "editorial",
      theme: "light",
      eyebrow: "Eyebrow",
      title: "Title",
      lead: "Lead",
      primary: { label: "Talk", href: "#contact", emphasis: "default" },
      secondary: null,
      media: null,
    },
  ],
} as unknown as PageContent;

describe("published page repository", () => {
  it("uses the matching demonstration page without Sanity configuration", async () => {
    await expect(
      getPage("pl", "home", { environment: {} }),
    ).resolves.toMatchObject({
      language: "pl",
      slug: "home",
    });
  });

  it("queries by language and slug and returns the published result", async () => {
    const fetch = vi.fn().mockResolvedValue(page);

    await expect(
      getPage("en", "home", {
        environment: {},
        client: { fetch },
      }),
    ).resolves.toEqual(page);
    expect(fetch).toHaveBeenCalledWith(PUBLISHED_PAGE_QUERY, {
      language: "en",
      slug: "home",
    });
    expect(PUBLISHED_PAGE_QUERY).toContain('path("drafts.**")');
  });

  it("fails the build when the published page is missing", async () => {
    const fetch = vi.fn().mockResolvedValue(null);

    await expect(
      getPage("en", "missing", { environment: {}, client: { fetch } }),
    ).rejects.toThrow("Brak opublikowanej strony en/missing.");
  });

  it("rejects a mismatched response", async () => {
    const fetch = vi.fn().mockResolvedValue({ ...page, language: "pl" });

    await expect(
      getPage("en", "home", { environment: {}, client: { fetch } }),
    ).rejects.toThrow("Sanity zwróciło stronę niezgodną");
  });

  it("fails when a section type is unknown", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ...page,
      sections: [{ _key: "x", _type: "unknownSection" }],
    });

    await expect(
      getPage("en", "home", { environment: {}, client: { fetch } }),
    ).rejects.toThrow("Nieznany typ sekcji: unknownSection");
  });
});

describe("section guard", () => {
  it("rejects an empty page builder", () => {
    expect(() => assertKnownSections([])).toThrow("nie ma sekcji");
  });
});

describe("pagination", () => {
  it("returns the requested slice and rejects out of range pages", () => {
    const result = paginate(["a", "b", "c"], 2, 2);
    expect(result).toEqual({
      items: ["c"],
      page: 2,
      totalPages: 2,
      total: 3,
    });
    expect(paginate(["a"], 2, 2)).toBeNull();
  });

  it("shares article index paging and featured selection", () => {
    const articles = Array.from({ length: 7 }, (_, index) => ({
      slug: `post-${index + 1}`,
      featured: index === 0 ? ("featured" as const) : ("standard" as const),
    }));
    const result = paginateArticles(articles, 2, { pageSize: 6 });
    expect(result.page).toBe(2);
    expect(result.items).toEqual([articles[6]]);
    expect(result.featured).toEqual([articles[0]]);
    expect(paginateArticles(articles, 1, { pageSize: 6 }).totalPages).toBe(2);
    expect(() => paginateArticles(articles, 3, { pageSize: 6 })).toThrow(
      "Brak strony 3",
    );
  });
});

describe("localized paths", () => {
  it("does not fall back to Polish under English URLs", () => {
    expect(pagePath("en", "workshop")).toBe("/en/workshop/");
    expect(pagePath("pl", "warsztat")).toBe("/warsztat/");
    expect(translationHref("pl", "page", undefined)).toBeNull();
    expect(parseContentPath("en/tylko-pl")).toEqual({
      kind: "page",
      language: "en",
      slug: "tylko-pl",
    });
    expect(parseContentPath("blog/najpierw-proces")).toEqual({
      kind: "article",
      language: "pl",
      slug: "najpierw-proces",
    });
    expect(parseContentPath("en/blog/category/process")).toEqual({
      kind: "blogCategory",
      language: "en",
      slug: "process",
      page: 1,
    });
    expect(parseContentPath("blog/strona/2")).toEqual({
      kind: "blogIndex",
      language: "pl",
      page: 2,
    });
    expect(parseContentPath("en/blog/page/2")).toEqual({
      kind: "blogIndex",
      language: "en",
      page: 2,
    });
    expect(parseContentPath("blog/kategoria/proces/strona/2")).toEqual({
      kind: "blogCategory",
      language: "pl",
      slug: "proces",
      page: 2,
    });
    expect(hrefToContentPathParam("/")).toBeUndefined();
    expect(hrefToContentPathParam("/en/blog/page/2/")).toBe("en/blog/page/2");
    expect(isExcludedCatchAllPath("ui")).toBe(true);
    expect(isExcludedCatchAllPath("en/ui")).toBe(true);
    expect(isExcludedCatchAllPath("static")).toBe(true);
    expect(isExcludedCatchAllPath("en/blog")).toBe(false);
    expect(blogPath("pl", 2)).toBe("/blog/strona/2/");
    expect(blogPath("en", 2)).toBe("/en/blog/page/2/");
  });

  it("lists published catch-all params for both languages and skips catalog routes", async () => {
    const params = await listPublishedContentParams({ environment: {} });
    expect(params).toEqual(
      expect.arrayContaining([
        undefined,
        "en",
        "warsztat",
        "en/workshop",
        "blog",
        "en/blog",
        "blog/najpierw-proces",
        "en/blog/process-before-crm",
        "blog/kategoria/proces",
        "en/blog/category/process",
      ]),
    );
    expect(params).not.toContain("ui");
    expect(params).not.toContain("en/ui");
    expect(params).not.toContain("static");
    expect(params).not.toContain("blog/strona/2");
    expect(params).not.toContain("en/blog/page/2");
    for (const param of params) {
      expect(parseContentPath(param).kind).not.toBe("unknown");
      expect(isExcludedCatchAllPath(param)).toBe(false);
    }
    expect(blogIndexLead.pl).toContain("Wpisy demonstracyjne");
    expect(blogIndexLead.en).toContain("Demonstration posts");
  });
});

describe("demonstration templates", () => {
  it("exposes a home page, two landings and a Polish-only page", async () => {
    const home = await getPage("pl", "home", { environment: {} });
    const workshop = await getPage("pl", "warsztat", { environment: {} });
    const implementation = await getPage("en", "implementation", {
      environment: {},
    });
    const polishOnly = await getPage("pl", "tylko-pl", { environment: {} });

    expect(home.sections?.map((section) => section?._type)).toEqual([
      "heroSection",
      "formSection",
      "ctaSection",
    ]);
    expect(workshop.translation?.slug).toBe("workshop");
    expect(implementation.translation?.slug).toBe("wdrozenie");
    expect(polishOnly.translation).toBeNull();
    await expect(
      getPage("en", "tylko-pl", { environment: {} }),
    ).rejects.toThrow("Brak demonstracyjnej strony en/tylko-pl");
  });

  it("builds a paginated blog index with a table of contents in articles", async () => {
    const index = await getArticleIndex("pl", 1, {
      environment: {},
      pageSize: 2,
    });
    const article = await getArticle("pl", "najpierw-proces", {
      environment: {},
    });

    expect(index.totalPages).toBe(2);
    expect(index.featured.map((item) => item.slug)).toContain(
      "najpierw-proces",
    );
    expect(article.title).toBe("Najpierw proces, potem CRM");
    expect(article.related?.length).toBeGreaterThan(0);
    await expect(
      getArticleIndex("pl", 9, { environment: {}, pageSize: 2 }),
    ).rejects.toThrow("Brak strony 9");
  });
});

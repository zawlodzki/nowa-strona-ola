import { describe, expect, it, vi } from "vitest";

import { assertKnownSections } from "../../src/content/sections";
import { paginate } from "../../src/lib/pagination";
import { parseContentPath } from "../../src/lib/content-path";
import { pagePath } from "../../src/lib/paths";
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
});

describe("localized paths", () => {
  it("does not fall back to Polish under English URLs", () => {
    expect(pagePath("en", "workshop")).toBe("/en/workshop/");
    expect(pagePath("pl", "warsztat")).toBe("/warsztat/");
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

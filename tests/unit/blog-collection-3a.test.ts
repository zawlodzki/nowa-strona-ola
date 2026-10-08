import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { mapBlogCollection } from "../../src/content/map-blog-collection";
import { serializeBlogCollection } from "../../src/content/serialize-blog-collection";
import { blogCardArt } from "../../src/content/blog-collection-seed";
import { parseContentPath } from "../../src/lib/content-path";
import {
  blogCollectionPageCount,
  paginateBlogCollection,
  sortByPublishedAt,
} from "../../src/lib/pagination";
import { articlePath, blogCategoryPath, blogPath } from "../../src/lib/paths";
import {
  getArticle,
  getArticleIndex,
  getSiteSettings,
  listArticles,
  listCategories,
} from "../../src/sanity/repository";

describe("blog collection pagination", () => {
  it("takes the newest post out of the grid and does not duplicate it", () => {
    const items = Array.from({ length: 11 }, (_, index) => ({
      id: `id-${String(11 - index).padStart(2, "0")}`,
      publishedAt: `2026-09-${String(28 - index).padStart(2, "0")}`,
    }));
    const page1 = paginateBlogCollection(items, 1, 6);
    expect(page1?.latest?.id).toBe("id-11");
    expect(page1?.items.map((item) => item.id)).toEqual([
      "id-10",
      "id-09",
      "id-08",
      "id-07",
      "id-06",
      "id-05",
    ]);
    expect(page1?.totalPages).toBe(2);
    expect(page1?.rangeStart).toBe(2);
    expect(page1?.rangeEnd).toBe(7);
    const page2 = paginateBlogCollection(items, 2, 6);
    expect(page2?.latest).toBeNull();
    expect(page2?.items.map((item) => item.id)).toEqual([
      "id-04",
      "id-03",
      "id-02",
      "id-01",
    ]);
    expect(page2?.rangeStart).toBe(8);
    expect(page2?.rangeEnd).toBe(11);
    expect(paginateBlogCollection(items, 3, 6)).toBeNull();
  });

  it("handles 0, 1, 7 and 8 posts without empty page numbers", () => {
    expect(paginateBlogCollection([], 1, 6)?.isEmpty).toBe(true);
    expect(paginateBlogCollection([], 2, 6)).toBeNull();
    const one = paginateBlogCollection([{ id: "a" }], 1, 6);
    expect(one?.latest).toEqual({ id: "a" });
    expect(one?.items).toEqual([]);
    expect(one?.totalPages).toBe(1);
    expect(blogCollectionPageCount(0)).toBe(1);
    expect(blogCollectionPageCount(1)).toBe(1);
    expect(blogCollectionPageCount(7)).toBe(1);
    expect(blogCollectionPageCount(8)).toBe(2);
    expect(blogCollectionPageCount(13)).toBe(2);
    expect(blogCollectionPageCount(14)).toBe(3);
  });

  it("breaks publishedAt ties with _id ascending", () => {
    const sorted = sortByPublishedAt([
      { id: "b", publishedAt: "2026-09-01T08:00:00.000Z" },
      { id: "a", publishedAt: "2026-09-01T08:00:00.000Z" },
      { id: "c", publishedAt: "2026-09-02T08:00:00.000Z" },
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["c", "a", "b"]);
  });
});

describe("blog collection 3a fixtures", () => {
  it("maps eleven mockup posts with the newest only on page 1", async () => {
    const [index, settings, categories] = await Promise.all([
      getArticleIndex("pl", 1, { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
      listCategories("pl", { environment: {} }),
    ]);
    const view = mapBlogCollection(settings, index, categories, "pl", {
      pageHref: (page) => blogPath("pl", page),
    });
    expect(view.title).toBe("Blog. Po Twojemu.");
    expect(view.latest?.slug).toBe("przygotowanie-do-konsultacji-pcos");
    expect(view.items).toHaveLength(6);
    expect(view.items.map((item) => item.slug)).not.toContain(
      view.latest?.slug,
    );
    expect(view.rangeLabel).toBe("Wpisy 2–7 z 11");
    expect(view.pagination?.totalPages).toBe(2);
    expect(view.pagination?.prevHref).toBeNull();
    expect(view.pagination?.nextHref).toBe("/blog/strona/2/#wpisy");
    expect(view.latest?.href).toBe(
      articlePath("pl", "przygotowanie-do-konsultacji-pcos"),
    );
    expect(view.newsletter?.title).toContain("Mniej sprzecznych rad");
    expect(view.isEmpty).toBe(false);
  });

  it("keeps page 2 without the latest post and with four older cards", async () => {
    const [index, settings, categories] = await Promise.all([
      getArticleIndex("pl", 2, { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
      listCategories("pl", { environment: {} }),
    ]);
    const view = mapBlogCollection(settings, index, categories, "pl", {
      pageHref: (page) => blogPath("pl", page),
    });
    expect(view.latest).toBeNull();
    expect(view.items).toHaveLength(4);
    expect(view.rangeLabel).toBe("Wpisy 8–11 z 11");
    expect(view.items[0]?.slug).toBe("dzienniczek-posilkow");
    expect(view.pagination?.prevHref).toBe("/blog/#wpisy");
    expect(view.pagination?.nextHref).toBeNull();
  });

  it("does not use Polish copy under the English collection", async () => {
    const [index, settings, categories] = await Promise.all([
      getArticleIndex("en", 1, { environment: {} }),
      getSiteSettings("en", { environment: {} }),
      listCategories("en", { environment: {} }),
    ]);
    const view = mapBlogCollection(settings, index, categories, "en", {
      pageHref: (page) => blogPath("en", page),
    });
    expect(view.href).toBe("/en/blog/");
    expect(view.title).toContain("On your terms");
    expect(view.lead).not.toMatch(/Po Twojemu|odżywianiu/);
    expect(view.latest?.href).toBe(
      "/en/blog/preparing-for-a-pcos-nutrition-consultation/",
    );
    expect(view.pagination?.nextHref).toBe("/en/blog/page/2/#wpisy");
  });

  it("shows empty collection and empty category states", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const categories = await listCategories("pl", { environment: {} });
    const empty = mapBlogCollection(
      settings,
      {
        latest: null,
        items: [],
        page: 1,
        totalPages: 1,
        total: 0,
        rangeStart: 0,
        rangeEnd: 0,
        isEmpty: true,
      },
      categories,
      "pl",
      { pageHref: (page) => blogPath("pl", page) },
    );
    expect(empty.isEmpty).toBe(true);
    expect(empty.emptyMessage).toMatch(/nie ma opublikowanych wpisów/);
    const category = await getArticleIndex("pl", 1, {
      environment: {},
      categorySlug: "perimenopauza",
    });
    const emptyCategory = mapBlogCollection(
      settings,
      category,
      categories,
      "pl",
      {
        category: {
          title: "Perimenopauza",
          slug: "perimenopauza",
          translation: { language: "en", slug: "perimenopause" },
        },
        pageHref: (page) => blogCategoryPath("pl", "perimenopauza", page),
      },
    );
    expect(emptyCategory.isCategoryEmpty).toBe(true);
    expect(emptyCategory.emptyCategoryMessage).toMatch(/tej kategorii/);
    expect(emptyCategory.collectionTitle).toBe("Perimenopauza");
  });

  it("keeps article routes working for the latest fixture post", async () => {
    const article = await getArticle(
      "pl",
      "przygotowanie-do-konsultacji-pcos",
      {
        environment: {},
      },
    );
    expect(article.title).toMatch(/konsultacji dietetycznej/);
    expect(article.body?.length).toBeGreaterThan(0);
    expect(article.translation?.slug).toBe(
      "preparing-for-a-pcos-nutrition-consultation",
    );
  });
});

describe("blog collection serializers", () => {
  it("serializes the first page with latest post, range and newsletter", async () => {
    const [index, settings, categories] = await Promise.all([
      getArticleIndex("pl", 1, { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
      listCategories("pl", { environment: {} }),
    ]);
    const markdown = serializeBlogCollection(
      settings,
      index,
      categories,
      "pl",
      { pageHref: (page) => blogPath("pl", page) },
    );
    expect(markdown).toContain("# Blog. Po Twojemu.");
    expect(markdown).toContain("Najnowszy wpis");
    expect(markdown).toContain("Wpisy 2–7 z 11");
    expect(markdown).toContain("/blog/przygotowanie-do-konsultacji-pcos/");
    expect(markdown).not.toMatch(
      /\/blog\/przygotowanie-do-konsultacji-pcos\/[\s\S]*\/blog\/przygotowanie-do-konsultacji-pcos\//,
    );
  });

  it("keeps the markdown example for the collection", async () => {
    const example = readFileSync(
      "src/content/examples/blog-collection.md",
      "utf8",
    ).trim();
    const [index, settings, categories] = await Promise.all([
      getArticleIndex("pl", 1, { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
      listCategories("pl", { environment: {} }),
    ]);
    expect(
      serializeBlogCollection(settings, index, categories, "pl", {
        pageHref: (page) => blogPath("pl", page),
      }),
    ).toBe(example);
  });
});

describe("blog collection routes", () => {
  it("parses PL/EN index, pagination and category paths", () => {
    expect(parseContentPath("blog")).toEqual({
      kind: "blogIndex",
      language: "pl",
      page: 1,
    });
    expect(parseContentPath("blog/strona/2")).toEqual({
      kind: "blogIndex",
      language: "pl",
      page: 2,
    });
    expect(parseContentPath("en/blog/category/pcos")).toEqual({
      kind: "blogCategory",
      language: "en",
      slug: "pcos",
      page: 1,
    });
    expect(blogPath("pl", 2)).toBe("/blog/strona/2/");
    expect(blogPath("en", 2)).toBe("/en/blog/page/2/");
  });
});

describe("blog collection images", () => {
  it("maps mockup slugs to SiteImage keys and crops and refuses silent substitutes", () => {
    expect(blogCardArt("przygotowanie-do-konsultacji-pcos").src).toBe("food");
    expect(blogCardArt("regularne-posilki").frame).toBe("food-close");
    expect(blogCardArt("pytania-o-pcos-przed-wizyta").src).toBe("contact");
    expect(blogCardArt("wyniki-badan-na-konsultacje").src).toBe("about");
    expect(() => blogCardArt("unknown-slug")).toThrow(
      "Brak mapowania obrazu artykułu",
    );
  });
});

describe("published article list", () => {
  it("returns eleven sorted Polish fixtures without using featured as latest", async () => {
    const articles = await listArticles("pl", { environment: {} });
    expect(articles).toHaveLength(11);
    expect(articles[0]?.slug).toBe("przygotowanie-do-konsultacji-pcos");
    expect(articles.every((article) => article.featured !== "featured")).toBe(
      true,
    );
  });
});

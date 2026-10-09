import { describe, expect, it, vi } from "vitest";
import { evaluate, parse } from "groq-js";

import { getPreviewBlogPage } from "../../preview/src/lib/content";
import { PREVIEW_PAGE_QUERY } from "../../preview/src/lib/queries";
import { mapBlogCollection } from "../../src/content/map-blog-collection";
import { blogPath } from "../../src/lib/paths";
import { blogCollectionPageFixture } from "../../src/sanity/blog-page";
import { buildContentLakePlan } from "../../src/sanity/content-lake-plan";
import { homepageSettingsFixture } from "../../src/sanity/homepage-fixtures";
import {
  getArticle,
  getArticleIndex,
  getArticlePaths,
  getBlogPage,
  getSiteSettings,
} from "../../src/sanity/repository";
import {
  PUBLISHED_PAGE_QUERY,
  SITE_SETTINGS_QUERY,
} from "../../src/sanity/queries";

const environment = {
  SANITY_PROJECT_ID: "project123",
  SANITY_DATASET: "production",
  SANITY_STUDIO_URL: "https://studio.example.com",
  SANITY_API_READ_TOKEN: "test",
};

describe("blog page repository", () => {
  it("uses the page and its SEO, does not read old settings and does not invent a translation", async () => {
    const page = {
      ...blogCollectionPageFixture("pl"),
      seo: { title: "Własne SEO", description: "Opis" },
      translation: null,
    };
    const fetch = vi.fn().mockResolvedValue(page);
    const result = await getBlogPage("pl", {
      environment: {},
      client: { fetch },
    });
    expect(fetch).toHaveBeenCalledExactlyOnceWith(PUBLISHED_PAGE_QUERY, {
      language: "pl",
      slug: "blog",
    });
    const index = await getArticleIndex("pl", 1, { environment: {} });
    const view = mapBlogCollection(result, index, [], "pl", {
      pageHref: (number) => blogPath("pl", number),
    });
    expect(view.seoTitle).toBe("Własne SEO");
    expect(view.alternateHref).toBeNull();
  });

  it("preserves published legacy copy until the page is published", async () => {
    const settings = homepageSettingsFixture("en");
    settings.blogIndex.title = "Existing English heading";
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(settings);
    const page = await getBlogPage("en", {
      environment: {},
      client: { fetch },
    });
    expect(fetch).toHaveBeenLastCalledWith(SITE_SETTINGS_QUERY, {
      language: "en",
      id: "siteSettings-en",
    });
    expect(page.sections?.[0]).toMatchObject({
      title: "Existing English heading",
    });
  });

  it("previews the draft page and fails on malformed sections instead of showing fixture copy", async () => {
    const page = blogCollectionPageFixture("en");
    const fetch = vi.fn().mockResolvedValue({ ...page, title: "Draft title" });
    const result = await getPreviewBlogPage("en", environment, { fetch });
    expect(result.title).toBe("Draft title");
    expect(fetch).toHaveBeenCalledExactlyOnceWith(PREVIEW_PAGE_QUERY, {
      language: "en",
      slug: "blog",
    });
    fetch.mockResolvedValue({
      ...page,
      sections: [{ _key: "bad", _type: "unknown" }],
    });
    await expect(
      getPreviewBlogPage("en", environment, { fetch }),
    ).rejects.toThrow(/Nieznany typ sekcji/);
  });

  it("rejects unsupported page content and a newsletter in a different language", async () => {
    const page = blogCollectionPageFixture("pl");
    const index = await getArticleIndex("pl", 1, { environment: {} });
    const options = { pageHref: (number: number) => blogPath("pl", number) };
    const newsletter = page.sections?.[1];
    if (newsletter?._type !== "formSection" || !newsletter.form)
      throw new Error("Missing fixture form");
    newsletter.form.language = "en";
    expect(() => mapBlogCollection(page, index, [], "pl", options)).toThrow(
      /nieprawidłowy język/,
    );
  });
});

describe("new article publication", () => {
  it("reads the fixed settings document even when a duplicate exists", async () => {
    const { documents } = buildContentLakePlan({
      formLabelMax: 400,
      keepPlaceholder: true,
      legalPages: null,
    });
    const original = documents.find((doc) => doc._id === "siteSettings-pl")!;
    const dataset = [
      { ...original, _id: "duplicate-settings", siteTitle: "Duplicate" },
      ...documents,
    ];
    const client = {
      fetch: async <T>(query: string, params?: Record<string, unknown>) =>
        (await (await evaluate(parse(query), { dataset, params })).get()) as T,
    };
    expect(
      await getSiteSettings("pl", { environment: {}, client }),
    ).toMatchObject({
      id: "siteSettings-pl",
      siteTitle: "Aleksandra Olesiewicz",
    });
  });

  it("publishing one article exposes both its route and its blog card without creating a page", async () => {
    const { documents } = buildContentLakePlan({
      formLabelMax: 400,
      keepPlaceholder: true,
      legalPages: null,
    });
    const source = documents.find((doc) => doc._id === "article-blog-01-pl")!;
    const article = {
      ...source,
      _id: "new-editorial-article",
      title: "Nowy artykuł",
      slug: { _type: "slug", current: "nowy-artykul" },
      publishedAt: "2026-10-08T08:00:00Z",
    };
    const dataset = [
      ...documents,
      { ...article, _id: `drafts.${article._id}` },
    ];
    const client = {
      fetch: async <T>(query: string, params?: Record<string, unknown>) =>
        (await (await evaluate(parse(query), { dataset, params })).get()) as T,
    };
    expect(
      await getArticlePaths({ environment: {}, client }),
    ).not.toContainEqual({ language: "pl", slug: "nowy-artykul" });
    dataset.push(article);
    expect(await getArticlePaths({ environment: {}, client })).toContainEqual({
      language: "pl",
      slug: "nowy-artykul",
    });
    expect(
      (await getArticleIndex("pl", 1, { environment: {}, client })).latest,
    ).toMatchObject({ slug: "nowy-artykul" });
    expect(
      await getArticle("pl", "nowy-artykul", { environment: {}, client }),
    ).toMatchObject({ title: "Nowy artykuł", slug: "nowy-artykul" });
    expect(
      dataset.some(
        (doc) =>
          doc._type === "page" &&
          (doc.slug as { current?: string })?.current === "nowy-artykul",
      ),
    ).toBe(false);
  });
});

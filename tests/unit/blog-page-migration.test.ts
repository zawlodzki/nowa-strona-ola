import { describe, expect, it } from "vitest";

import { buildBlogPageMigration } from "../../src/sanity/blog-page-migration";
import { buildContentLakePlan } from "../../src/sanity/content-lake-plan";
import { homepageSettingsFixture } from "../../src/sanity/homepage-fixtures";

function legacyDataset() {
  const plan = buildContentLakePlan({
    formLabelMax: 400,
    keepPlaceholder: true,
    legalPages: null,
  });
  const dataset = plan.documents.filter(
    (doc) =>
      !(
        doc._type === "page" &&
        (doc.slug as { current?: string })?.current === "blog"
      ),
  );
  for (const language of ["pl", "en"] as const) {
    const settings = dataset.find(
      (doc) => doc._id === `siteSettings-${language}`,
    )!;
    settings.blogIndex = {
      _type: "blogIndexSettings",
      ...homepageSettingsFixture(language).blogIndex,
    };
    settings._rev = `rev-${language}`;
  }
  return dataset;
}

function ids() {
  let index = 0;
  return () => `new-blog-${++index}`;
}

describe("blog page migration", () => {
  it("copies editorial changes, SEO and references into drafts without changing the source", () => {
    const source = legacyDataset();
    const settings = source.find((doc) => doc._id === "siteSettings-pl")!;
    (settings.blogIndex as Record<string, unknown>).title =
      "Własny tytuł redaktora";
    (settings.blogIndex as Record<string, unknown>).seoTitle = "Własne SEO";
    const before = JSON.stringify(source);
    const plan = buildBlogPageMigration(source, ids());
    expect(JSON.stringify(source)).toBe(before);
    expect(plan.documents).toHaveLength(2);
    expect(plan.documents[0]).toMatchObject({
      _id: "drafts.new-blog-1",
      _type: "page",
      language: "pl",
      title: "Własne SEO",
      slug: { current: "blog" },
      seo: { title: "Własne SEO" },
      translation: { _ref: "new-blog-2", _weak: true },
      sections: [
        { _type: "blogCollectionSection", title: "Własny tytuł redaktora" },
        { _type: "formSection", form: { _ref: "newsletter-form-pl" } },
      ],
    });
    expect(plan.sources).toContainEqual({
      id: "siteSettings-pl",
      revision: "rev-pl",
    });
  });

  it("preserves existing pages and is idempotent after draft creation", () => {
    const source = legacyDataset();
    const first = buildBlogPageMigration(source, ids());
    const second = buildBlogPageMigration(
      [...source, ...first.documents],
      ids(),
    );
    expect(second.documents).toEqual([]);
    expect(second.skipped).toEqual(["pl", "en"]);
    const partial = buildBlogPageMigration(
      [...source, first.documents[0]!],
      () => "new-en",
    );
    expect(partial.documents).toHaveLength(1);
    expect(partial.documents[0]).toMatchObject({
      language: "en",
      translation: { _ref: "new-blog-1" },
    });
  });

  it("keeps draft edits and the disabled newsletter state", () => {
    const source = legacyDataset();
    const settings = structuredClone(
      source.find((doc) => doc._id === "siteSettings-en")!,
    );
    settings._id = "drafts.siteSettings-en";
    (settings.blogIndex as Record<string, unknown>).lead =
      "Pending English edit";
    (settings.blogNewsletter as Record<string, unknown>).enabled = false;
    delete settings.translation;
    const result = buildBlogPageMigration([...source, settings], ids())
      .documents[1]!;
    expect(result.sections).toHaveLength(1);
    expect((result.sections as Record<string, unknown>[])[0]?.lead).toBe(
      "Pending English edit",
    );
    expect(result.translation).toBeUndefined();
  });

  it("rejects duplicate pages, broken references and incomplete settings", () => {
    const source = legacyDataset();
    const first = buildBlogPageMigration(source, ids()).documents[0]!;
    expect(() =>
      buildBlogPageMigration(
        [...source, first, { ...first, _id: "drafts.other-page" }],
        ids(),
      ),
    ).toThrow(/Zduplikowana/);
    expect(() =>
      buildBlogPageMigration(
        source.filter((doc) => doc._id !== "newsletter-form-pl"),
        ids(),
      ),
    ).toThrow(/formularza/);
    const settings = source.find((doc) => doc._id === "siteSettings-pl")!;
    delete (settings.blogIndex as Record<string, unknown>).lead;
    expect(() => buildBlogPageMigration(source, ids())).toThrow(/Brak lead/);
  });
});

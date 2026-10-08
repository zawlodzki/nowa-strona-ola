import { describe, expect, it } from "vitest";

import { homepageCopy } from "../../src/content/homepage-seed";
import { BLOG_ARTICLE_SEED } from "../../src/content/blog-collection-seed";
import {
  buildContentLakePlan,
  buildDataset,
  buildMutations,
  mergeWithExport,
  missingDeletionIds,
  OBSOLETE_DOCUMENT_IDS,
  obsoleteDocumentType,
  placeholderArticles,
  seoTitleWithinLimit,
  type SanityDocument,
} from "../../src/sanity/content-lake-plan";

const plan = buildContentLakePlan({
  formLabelMax: 80,
  keepPlaceholder: false,
  legalPages: null,
});

function byId(id: string): SanityDocument {
  const document = [...plan.documents, ...buildDataset(plan)].find(
    (item) => item._id === id,
  );
  if (!document) throw new Error(`Brak ${id}.`);
  return document;
}

function sectionTitle(document: SanityDocument, key: string): string {
  const sections = document.sections;
  if (!Array.isArray(sections)) throw new Error("Brak sekcji.");
  const section = sections.find(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "_key" in item &&
      item._key === key,
  );
  if (!section || typeof section !== "object" || !("title" in section)) {
    throw new Error(`Brak sekcji ${key}.`);
  }
  if (typeof section.title !== "string")
    throw new Error(`Sekcja ${key} bez tytułu.`);
  return section.title;
}

describe("content lake plan", () => {
  it("deletes exactly the obsolete prototype ids", () => {
    expect(plan.deletions).toEqual([...OBSOLETE_DOCUMENT_IDS]);
    expect(new Set(plan.deletions).size).toBe(35);
    const mutationIds = buildMutations(plan).flatMap((mutation) =>
      mutation.delete ? [mutation.delete.id] : [],
    );
    expect(mutationIds).toEqual([...OBSOLETE_DOCUMENT_IDS]);
    expect(missingDeletionIds([...OBSOLETE_DOCUMENT_IDS])).toEqual([]);
    expect(missingDeletionIds([])).toHaveLength(35);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "article"),
    ).toHaveLength(6);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "page"),
    ).toHaveLength(9);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "author"),
    ).toHaveLength(2);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "category"),
    ).toHaveLength(4);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "form"),
    ).toHaveLength(2);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "service"),
    ).toHaveLength(4);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "testimonial"),
    ).toHaveLength(4);
    expect(
      plan.deletions.filter((id) => obsoleteDocumentType(id) === "redirect"),
    ).toHaveLength(1);
    expect(
      plan.deletions.filter(
        (id) => obsoleteDocumentType(id) === "sanity.imageAsset",
      ),
    ).toHaveLength(3);
  });

  it("merges navigation and the blog index into one settings document", () => {
    const settings = byId("siteSettings-pl");
    expect(Array.isArray(settings.navigation)).toBe(true);
    expect(settings.navigation).toHaveLength(4);
    expect(settings.headerCta).toMatchObject({ label: "Newsletter" });
    expect(settings.blogIndex).toMatchObject({
      _type: "blogIndexSettings",
      title: "Blog. Po Twojemu.",
    });
    expect(settings.blogNewsletter).toMatchObject({
      sidebarNote: "Możesz wypisać się w każdej chwili.",
      form: { _type: "reference", _ref: "newsletter-form-pl" },
    });
    expect(byId("siteSettings-en").blogIndex).toMatchObject({
      title: "Blog. On your terms.",
    });
  });

  it("keeps homepage copy and raster keys from the fixtures", () => {
    const home = byId("page-home-pl");
    expect(sectionTitle(home, "home-hero")).toBe(homepageCopy.pl.heroTitle);
    const sections = home.sections as {
      _key: string;
      media?: { rasterKey?: string };
    }[];
    expect(
      sections.find((section) => section._key === "home-hero")?.media
        ?.rasterKey,
    ).toBe("hero");
  });

  it("fills the PCOS ebook cover and the English slug", () => {
    const ebook = byId("ebook-suplementy-w-pcos-en");
    expect(ebook.slug).toEqual({
      _type: "slug",
      current: "supplements-in-pcos",
    });
    expect(ebook.cover).toMatchObject({
      alt: "Controlled cover: Supplements in PCOS",
      tone: "diagram",
      rasterKey: "cover-suplementy-w-pcos",
    });
    expect(ebook.coverTone).toBe("light");
    expect(ebook.landing).toMatchObject({ variant: "cherry3a" });
    expect(byId("ebook-suplementy-w-pcos-pl").slug).toEqual({
      _type: "slug",
      current: "suplementy-w-pcos",
    });
  });

  it("uses the featured body for article 01 and marks the other ten pairs", () => {
    const featured = byId("article-blog-01-pl");
    expect(JSON.stringify(featured.body)).toContain(
      "Pierwsza konsultacja nie musi zaczynać się od idealnego jadłospisu",
    );
    expect(featured.placeholderBody).toBe(false);
    const placeholders = placeholderArticles(plan);
    expect(placeholders).toHaveLength(20);
    for (const article of placeholders) {
      expect(JSON.stringify(article.body)).toContain("3a");
      expect(article.placeholderBody).toBe(true);
    }
    for (const seed of BLOG_ARTICLE_SEED) {
      const english = byId(`article-blog-${seed.key}-en`);
      expect(english.title).toBe(seed.en.title);
      const seo = english.seo as { title: string };
      expect(seo.title.length).toBeLessThanOrEqual(60);
      expect(seed.en.title.startsWith(seo.title)).toBe(true);
    }
  });

  it("holds newsletter forms until the consent label fits", () => {
    expect(plan.documents.some((document) => document._type === "form")).toBe(
      false,
    );
    expect(plan.pending).toContainEqual({ kind: "legalPage" });
    const form = plan.pending.find((item) => item.kind === "form");
    if (!form || form.kind !== "form") throw new Error("Brak formularza.");
    expect(JSON.stringify(form.document)).toContain(
      homepageCopy.pl.consentLabel,
    );
    expect(
      buildDataset(plan).some((document) => document._type === "form"),
    ).toBe(true);

    const open = buildContentLakePlan({
      formLabelMax: 400,
      keepPlaceholder: false,
      legalPages: [
        {
          id: "legal-privacy-pl",
          language: "pl",
          slug: "polityka-prywatnosci",
          title: "Polityka",
          effectiveFrom: "2026-01-01",
          seo: { title: "Polityka", description: "Opis" },
          body: [
            {
              _type: "block",
              _key: "b1",
              style: "normal",
              children: [
                { _type: "span", _key: "s1", text: "Treść", marks: [] },
              ],
              markDefs: [],
            },
          ],
        },
      ],
    });
    expect(open.pending).toEqual([]);
    expect(
      open.documents.some((document) => document._id === "legal-privacy-pl"),
    ).toBe(true);
    expect(
      open.documents.find((document) => document._id === "newsletter-form-pl"),
    ).toBeTruthy();
  });

  it("keeps export documents that the transaction does not replace", () => {
    const exported: SanityDocument[] = [
      { _id: "system.group.editor", _type: "system.group" },
      { _id: "siteSettings-pl", _type: "siteSettings", siteTitle: "stare" },
      {
        _id: OBSOLETE_DOCUMENT_IDS[0],
        _type: "article",
      },
    ];
    const merged = mergeWithExport(
      buildDataset(plan),
      exported,
      plan.deletions,
    );
    expect(
      merged.some((document) => document._id === "system.group.editor"),
    ).toBe(true);
    expect(
      merged.find((document) => document._id === "siteSettings-pl")?.siteTitle,
    ).not.toBe("stare");
    expect(
      merged.some((document) => document._id === OBSOLETE_DOCUMENT_IDS[0]),
    ).toBe(false);
  });

  it("shortens an English seo title without writing a new sentence", () => {
    const source =
      "Insulin resistance: where to start the nutrition conversation?";
    const seo = seoTitleWithinLimit(source);
    expect(seo.length).toBeLessThanOrEqual(60);
    expect(source.startsWith(seo)).toBe(true);
    expect(seo).not.toBe(source);
  });
});

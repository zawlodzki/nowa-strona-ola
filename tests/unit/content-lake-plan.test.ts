import { evaluate, parse } from "groq-js";
import {
  CHECKOUT_CATALOG_QUERY,
  CHECKOUT_SALES_STATE_QUERY,
  PCOS_CHECKOUT_SETTINGS_QUERY,
} from "../../src/sanity/queries";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { homepageCopy } from "../../src/content/homepage-seed";
import { BLOG_ARTICLE_SEED } from "../../src/content/blog-collection-seed";
import {
  assertWritable,
  buildContentLakePlan,
  buildDataset,
  buildMutations,
  formFieldLabelMax,
  formSchemaKeepsPlaceholder,
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

describe("import-3a client", () => {
  it("looks up draft deletions with the raw perspective", () => {
    const source = readFileSync("scripts/import-3a.ts", "utf8");
    const start = source.indexOf("async function fetchIds");
    const lookup = source.slice(start, source.indexOf("client.fetch", start));
    expect(lookup).toContain('perspective: "raw"');
  });
});

describe("content lake plan", () => {
  it("makes the paused checkout singleton available to the real public query", async () => {
    const dataset = buildDataset(plan);
    const settings = dataset.filter(
      (document) => document._type === "pcosCheckoutSettings",
    );
    expect(settings).toHaveLength(1);
    expect(settings[0]).toMatchObject({
      _id: "pcosCheckoutSettings-pl",
      salesState: "paused",
      singlePriceGross: 97,
      pairPriceGross: 97,
      continueLabel: "Zamawiam z obowiązkiem zapłaty",
      legalConsentVersion: "pcos-d27-2026-10-18",
    });
    const result = await evaluate(parse(PCOS_CHECKOUT_SETTINGS_QUERY), {
      dataset,
    });
    expect(await result.get()).toMatchObject({
      salesState: "paused",
      singlePriceGross: 97,
      pairPriceGross: 97,
      bundleOnlyNotice:
        "Pakiet obejmuje oba pozostałe e-booki. To osobne zamówienie.",
      continueLabel: "Zamawiam z obowiązkiem zapłaty",
    });
  });
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

  it("stores the blog collection in a page and keeps shared article newsletter settings", () => {
    const settings = byId("siteSettings-pl");
    expect(Array.isArray(settings.navigation)).toBe(true);
    expect(settings.navigation).toHaveLength(5);
    expect(settings.headerCta).toMatchObject({ label: "Newsletter" });
    expect(settings.blogIndex).toBeUndefined();
    expect(
      sectionTitle(byId("page-blog-collection-pl"), "blog-collection"),
    ).toBe("Blog. Po Twojemu.");
    expect(settings.blogNewsletter).toMatchObject({
      sidebarNote: "Możesz wypisać się w każdej chwili.",
      form: { _type: "reference", _ref: "newsletter-form-pl" },
    });
    expect(
      sectionTitle(byId("page-blog-collection-en"), "blog-collection"),
    ).toBe("Blog. On your terms.");
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

  it("fills the PMOS\u00A0(PCOS) ebook cover and the English slug", () => {
    const ebook = byId("ebook-suplementy-w-pcos-en");
    expect(ebook.slug).toEqual({
      _type: "slug",
      current: "supplements-in-pcos",
    });
    expect(ebook.cover).toMatchObject({
      alt: "Controlled cover: Supplements in PMOS\u00A0(PCOS)",
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
      for (const locale of ["pl", "en"] as const) {
        const article = byId(`article-blog-${seed.key}-${locale}`);
        expect(article.title).toBe(seed[locale].title);
        const seo = article.seo as { title: string };
        expect(seo.title).toBe(
          (seed[locale].seoTitle ?? seed[locale].title).replaceAll(
            "\u00A0",
            " ",
          ),
        );
        expect(seo.title.length).toBeLessThanOrEqual(60);
      }
    }
  });

  it("holds newsletter forms until every field label fits", () => {
    const narrow = buildContentLakePlan({
      formLabelMax: 10,
      keepPlaceholder: false,
      legalPages: null,
    });
    expect(
      narrow.documents.some((document) =>
        document._id.startsWith("newsletter-form-"),
      ),
    ).toBe(false);
    expect(narrow.pending).toContainEqual({ kind: "legalPage" });
    const form = narrow.pending.find((item) => item.kind === "form");
    if (!form || form.kind !== "form") throw new Error("Brak formularza.");
    expect(form.document).toMatchObject({
      _id: "newsletter-form-pl",
      formKey: "newsletter",
      version: "2.3",
      noticeConsentId: "Z6",
      submitLabel: "Zapisuję się",
    });
    expect(
      buildDataset(narrow).some((document) => document._type === "form"),
    ).toBe(true);
    expect(
      plan.documents.some((document) => document._id === "newsletter-form-pl"),
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
          version: "1.0",
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

  it("puts the live newsletter forms in the transaction and publishes the dated legal pages", async () => {
    const root = new URL("../..", import.meta.url);
    const formSource = readFileSync(
      new URL("studio/schema-types/documents/form.ts", root),
      "utf8",
    );
    const legal = (await import("../../src/sanity/legal-fixtures.ts"))
      .demonstrationLegalPages;
    const live = buildContentLakePlan({
      formLabelMax: formFieldLabelMax(formSource),
      keepPlaceholder: formSchemaKeepsPlaceholder(formSource),
      legalPages: Object.values(legal) as never,
    });
    expect(formFieldLabelMax(formSource)).toBe(400);
    expect(
      live.documents.filter((document) =>
        document._id.startsWith("newsletter-form-"),
      ),
    ).toHaveLength(2);
    expect(
      live.documents
        .filter((document) => document._type === "legalPage")
        .map((document) => document._id)
        .sort(),
    ).toEqual([
      "legal-cookies-pl",
      "legal-newsletter-pl",
      "legal-privacy-en",
      "legal-privacy-pl",
      "legal-terms-en",
      "legal-terms-pl",
    ]);
    expect(live.pending).toEqual([]);
    expect(() => assertWritable(live)).not.toThrow();
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

it("resolves complementary ebook references through the real checkout GROQ query", async () => {
  const result = await evaluate(parse(CHECKOUT_CATALOG_QUERY), {
    dataset: buildDataset(plan),
  });
  const catalog = await result.get();
  expect(catalog).toHaveLength(6);
  const first = catalog.find(
    (item: { productCode: string }) => item.productCode === "ebook-01",
  );
  expect(
    first.crossSell.products.map(
      (item: { productCode: string }) => item.productCode,
    ),
  ).toEqual(["ebook-02", "ebook-03"]);
  expect(first.stripePriceId).toBe("price_1URqR0Q8cdQEDgtW9swOgW4n");
  expect(first.availability).toBe("planned");
  const perimenopause = catalog.find(
    (item: { productCode: string }) => item.productCode === "ebook-04",
  );
  expect(
    perimenopause.crossSell.products.map(
      (item: { productCode: string }) => item.productCode,
    ),
  ).toEqual(["ebook-05", "ebook-06"]);
  expect(perimenopause.stripePriceId).toBeNull();
  expect(perimenopause.crossSell.lead).toContain("perimenopauzy");
});

it("reads the paused CMS sales gate independently from catalog configuration", async () => {
  const result = await evaluate(parse(CHECKOUT_SALES_STATE_QUERY), {
    dataset: buildDataset(plan),
  });
  expect(await result.get()).toBe("paused");
});

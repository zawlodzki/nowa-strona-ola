import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildContentLakePlan,
  formFieldLabelMax,
  formSchemaKeepsPlaceholder,
  type SanityDocument,
} from "../../src/sanity/content-lake-plan";
import {
  HOME_SECTION_ORDER,
  applyMutations,
  buildAudienceItems,
  buildMutations,
  buildSectionPatch,
  findLogoSections,
  findProblems,
  planDeletions,
} from "../../src/sanity/audience-import";

const formSource = readFileSync(
  "studio/schema-types/documents/form.ts",
  "utf8",
);
const lakePlan = buildContentLakePlan({
  formLabelMax: formFieldLabelMax(formSource),
  keepPlaceholder: formSchemaKeepsPlaceholder(formSource),
  legalPages: null,
});
const items = buildAudienceItems(lakePlan);

const keys = [
  ["home-hero", "heroSection"],
  ["home-logos", "logosSection"],
  ["home-approach", "metricsSection"],
  ["home-about", "textImageSection"],
  ["home-ebooks", "ebooksSection"],
  ["home-consultation", "serviceOfferSection"],
  ["home-testimonials", "testimonialsSection"],
  ["home-newsletter", "formSection"],
] as const;

function home(language: "pl" | "en", logoAsset?: string): SanityDocument {
  return {
    _id: `page-home-${language}`,
    _type: "page",
    _rev: `rev-${language}`,
    title: "Edytowane w Studio",
    sections: keys.map(([_key, _type]) =>
      _type === "logosSection"
        ? {
            _key,
            _type,
            title: "Marki",
            items: [
              {
                _key: "alab",
                name: "ALAB",
                media: logoAsset
                  ? { image: { asset: { _ref: logoAsset } } }
                  : { rasterKey: "alab" },
              },
            ],
          }
        : { _key, _type, title: `Ola: ${_key}` },
    ),
  };
}

function patchesFor(dataset: SanityDocument[]) {
  const byId = new Map(dataset.map((doc) => [doc._id, doc]));
  return (["pl", "en"] as const).map((language) =>
    buildSectionPatch(byId.get(`page-home-${language}`), items[language]),
  );
}

describe("audience import", () => {
  it("takes the PL and EN audience sections from the fixture plan", () => {
    expect(items.pl.title).toBe("Z kim pracuję");
    expect(items.en.title).toBe("Who I work with");
    expect(items.pl._key).toBe("home-audience");
    expect((items.pl.items as unknown[]).length).toBe(4);
  });

  it("replaces the logo strip in place with revision guards only", () => {
    const dataset = [home("pl"), home("en")];
    const patches = patchesFor(dataset);
    const mutations = buildMutations(patches, planDeletions(dataset, patches));
    expect(mutations).toEqual([
      {
        patch: {
          id: "page-home-pl",
          ifRevisionID: "rev-pl",
          insert: {
            replace: 'sections[_key=="home-logos"]',
            items: [items.pl],
          },
        },
      },
      {
        patch: {
          id: "page-home-en",
          ifRevisionID: "rev-en",
          insert: {
            replace: 'sections[_key=="home-logos"]',
            items: [items.en],
          },
        },
      },
    ]);
    const after = applyMutations(dataset, mutations);
    const pl = after.find((doc) => doc._id === "page-home-pl")!;
    expect(
      (pl.sections as { _type: string }[]).map((section) => section._type),
    ).toEqual([...HOME_SECTION_ORDER]);
    // Studio edits in other sections stay untouched.
    expect(pl.title).toBe("Edytowane w Studio");
    expect((pl.sections as { title: string }[])[0]?.title).toBe(
      "Ola: home-hero",
    );
    expect(findLogoSections(after)).toEqual([]);
    expect(findProblems(after)).toEqual([]);
  });

  it("is idempotent once the audience section is in place", () => {
    const dataset = [home("pl"), home("en")];
    const after = applyMutations(
      dataset,
      buildMutations(patchesFor(dataset), []),
    );
    const again = patchesFor(after);
    expect(again.every((patch) => patch.action === "skip")).toBe(true);
    expect(buildMutations(again, [])).toEqual([]);
  });

  it("deletes logo assets and partner documents only when unreferenced", () => {
    const dataset: SanityDocument[] = [
      home("pl", "image-logo-alab"),
      home("en", "image-logo-shared"),
      { _id: "image-logo-alab", _type: "sanity.imageAsset" },
      { _id: "image-logo-shared", _type: "sanity.imageAsset" },
      {
        _id: "article-x",
        _type: "article",
        cover: { asset: { _ref: "image-logo-shared" } },
      },
      { _id: "partner-alab", _type: "partner" },
      { _id: "image-hero", _type: "sanity.imageAsset" },
    ];
    const deletions = planDeletions(dataset, patchesFor(dataset));
    expect(deletions.map((entry) => entry.id)).toEqual([
      "image-logo-alab",
      "partner-alab",
    ]);
    const mutations = buildMutations(patchesFor(dataset), deletions);
    expect(mutations.slice(2)).toEqual([
      { delete: { id: "image-logo-alab" } },
      { delete: { id: "partner-alab" } },
    ]);
  });

  it("refuses a stale revision", () => {
    const dataset = [home("pl"), home("en")];
    const mutations = buildMutations(patchesFor(dataset), []);
    const edited = dataset.map((doc) => ({ ...doc, _rev: "newer" }));
    expect(() => applyMutations(edited, mutations)).toThrow("rewizja");
  });

  it("stops when a page has both sections", () => {
    const doc = home("pl");
    (doc.sections as unknown[]).splice(2, 0, items.pl);
    expect(() => buildSectionPatch(doc, items.pl)).toThrow("ręcznej decyzji");
  });
});

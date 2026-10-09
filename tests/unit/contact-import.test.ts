import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  buildContentLakePlan,
  formFieldLabelMax,
  formSchemaKeepsPlaceholder,
  type SanityDocument,
} from "../../src/sanity/content-lake-plan";
import {
  applyMutations,
  buildContactImportPlan,
  buildMutations,
  buildNavPatch,
  findReferenceProblems,
  missingArrayKeys,
  planDocumentActions,
  resolvesInternalPath,
  type NavItem,
} from "../../src/sanity/contact-import";

const formSource = readFileSync(
  "studio/schema-types/documents/form.ts",
  "utf8",
);
const lakePlan = buildContentLakePlan({
  formLabelMax: formFieldLabelMax(formSource),
  keepPlaceholder: formSchemaKeepsPlaceholder(formSource),
  legalPages: null,
});
const plan = buildContactImportPlan(lakePlan);

const nav = (language: "pl" | "en"): NavItem[] =>
  language === "pl"
    ? [
        { _key: "nav-ebooks", label: "E-booki", href: "/ebooki/" },
        {
          _key: "nav-consultations",
          label: "Konsultacje",
          href: "/konsultacje/",
        },
        { _key: "nav-about", label: "O mnie", href: "/o-mnie/" },
        { _key: "nav-blog", label: "Blog", href: "/blog/" },
      ]
    : [
        { _key: "nav-ebooks", label: "E-books", href: "/en/ebooks/" },
        { _key: "nav-blog", label: "Blog", href: "/en/blog/" },
      ];

function liveDataset(): SanityDocument[] {
  const settings = (language: "pl" | "en"): SanityDocument => ({
    _id: `siteSettings-${language}`,
    _type: "siteSettings",
    _rev: `rev-${language}`,
    language,
    siteTitle: "Edytowane w Studio",
    footerNote: "Zmiana redakcji, której import nie może ruszyć",
    navigation: nav(language),
  });
  const keep = new Set(["newsletter-form-pl", "newsletter-form-en"]);
  const legal = (id: string, language: "pl" | "en", slug: string) => ({
    _id: id,
    _type: "legalPage",
    language,
    slug: { _type: "slug", current: slug },
  });
  return [
    settings("pl"),
    settings("en"),
    ...lakePlan.documents.filter((doc) => keep.has(doc._id)),
    legal("legal-privacy-pl", "pl", "polityka-prywatnosci"),
    legal("legal-newsletter-pl", "pl", "regulamin-newslettera"),
    legal("legal-privacy-en", "en", "privacy"),
    legal("legal-terms-en", "en", "terms"),
    legal("legal-terms-pl", "pl", "regulamin"),
  ];
}

describe("contact import plan", () => {
  it("contains exactly the four contact documents with types, ids, slugs and keys", () => {
    expect(plan.documents.map((doc) => [doc._id, doc._type])).toEqual([
      ["page-contact-pl", "page"],
      ["page-contact-en", "page"],
      ["form-contact-pl", "form"],
      ["form-contact-en", "form"],
    ]);
    expect(plan.documents[0]!.slug).toEqual({
      _type: "slug",
      current: "kontakt",
    });
    expect(plan.documents[1]!.slug).toEqual({
      _type: "slug",
      current: "contact",
    });
    for (const doc of plan.documents) expect(missingArrayKeys(doc)).toEqual([]);
    expect(plan.nav.pl).toEqual({
      item: { _key: "nav-contact", label: "Kontakt", href: "/kontakt/" },
      afterKey: "nav-blog",
    });
    expect(plan.nav.en.item.href).toBe("/en/contact/");
  });

  it("detects array items without _key", () => {
    expect(
      missingArrayKeys({ a: [{ _key: "x", b: [{ c: 1 }] }, "text"] }),
    ).toEqual(["a[0].b[0]"]);
  });

  it("creates missing documents, skips identical ones and reports conflicts unless forced", () => {
    const [page, , form] = plan.documents;
    const existing = new Map<string, SanityDocument>([
      [page!._id, { ...structuredClone(page!), _rev: "r1", _updatedAt: "x" }],
      [form!._id, { ...structuredClone(form!), title: "Zmienione w Studio" }],
    ]);
    const actions = planDocumentActions(plan.documents, existing, false);
    expect(actions.map((action) => action.action)).toEqual([
      "unchanged",
      "create",
      "conflict",
      "create",
    ]);
    expect(actions[2]).toMatchObject({ fields: ["title"] });
    expect(() => buildMutations(plan, actions, [])).toThrow(/--force/);
    const forced = planDocumentActions(plan.documents, existing, true);
    const mutations = buildMutations(plan, forced, []);
    expect(mutations.map((mutation) => Object.keys(mutation)[0])).toEqual([
      "createIfNotExists",
      "createOrReplace",
      "createIfNotExists",
    ]);
  });
});

describe("navigation patch", () => {
  const settings = liveDataset()[0]!;

  it("inserts only the nav item after the fixture neighbour, guarded by revision", () => {
    const patch = buildNavPatch(
      "siteSettings-pl",
      settings,
      plan.nav.pl.item,
      "nav-blog",
    );
    expect(patch).toMatchObject({
      action: "insert",
      afterKey: "nav-blog",
      ifRevisionID: "rev-pl",
    });
    if (patch.action !== "insert") throw new Error("expected insert");
    expect(patch.after.map((item) => item._key)).toEqual([
      "nav-ebooks",
      "nav-consultations",
      "nav-about",
      "nav-blog",
      "nav-contact",
    ]);
    const [mutation] = buildMutations(plan, [], [patch]);
    expect(mutation).toEqual({
      patch: {
        id: "siteSettings-pl",
        ifRevisionID: "rev-pl",
        setIfMissing: { navigation: [] },
        insert: {
          after: 'navigation[_key=="nav-blog"]',
          items: [{ _key: "nav-contact", label: "Kontakt", href: "/kontakt/" }],
        },
      },
    });
  });

  it("is idempotent by key or href", () => {
    const withItem = {
      ...settings,
      navigation: [...nav("pl"), plan.nav.pl.item],
    };
    expect(
      buildNavPatch("siteSettings-pl", withItem, plan.nav.pl.item, "nav-blog")
        .action,
    ).toBe("skip");
    const sameHref = {
      ...settings,
      navigation: [
        ...nav("pl"),
        { _key: "custom", label: "Napisz", href: "/kontakt/" },
      ],
    };
    expect(
      buildNavPatch("siteSettings-pl", sameHref, plan.nav.pl.item, "nav-blog")
        .action,
    ).toBe("skip");
  });

  it("appends when the neighbour was removed in Studio and refuses a missing document", () => {
    const edited = {
      ...settings,
      navigation: nav("pl").filter((item) => item._key !== "nav-blog"),
    };
    const patch = buildNavPatch(
      "siteSettings-pl",
      edited,
      plan.nav.pl.item,
      "nav-blog",
    );
    expect(patch).toMatchObject({ action: "insert", afterKey: null });
    expect(buildMutations(plan, [], [patch])[0]).toMatchObject({
      patch: { insert: { after: "navigation[-1]" } },
    });
    expect(() =>
      buildNavPatch("siteSettings-pl", undefined, plan.nav.pl.item, "nav-blog"),
    ).toThrow();
  });
});

describe("applied plan", () => {
  it("leaves every other siteSettings field untouched and resolves all references", () => {
    const before = liveDataset();
    const byId = new Map(before.map((doc) => [doc._id, doc]));
    const actions = planDocumentActions(plan.documents, byId, false);
    const patches = (["pl", "en"] as const).map((language) =>
      buildNavPatch(
        `siteSettings-${language}`,
        byId.get(`siteSettings-${language}`),
        plan.nav[language].item,
        plan.nav[language].afterKey,
      ),
    );
    const mutations = buildMutations(plan, actions, patches);
    expect(mutations).toHaveLength(6);
    const after = applyMutations(before, mutations);
    const settingsAfter = after.find((doc) => doc._id === "siteSettings-pl")!;
    const { navigation: navAfter, ...restAfter } = settingsAfter;
    const { navigation: navBefore, ...restBefore } =
      byId.get("siteSettings-pl")!;
    expect(restAfter).toEqual(restBefore);
    expect((navAfter as NavItem[]).slice(0, 4)).toEqual(navBefore);
    expect(
      after.find((doc) => doc._id === "siteSettings-en")!.navigation,
    ).toEqual([...nav("en"), plan.nav.en.item]);
    expect(findReferenceProblems(plan, after)).toEqual([]);
    // Re-running on the result is a no-op.
    const again = new Map(after.map((doc) => [doc._id, doc]));
    expect(
      planDocumentActions(plan.documents, again, false).every(
        (a) => a.action === "unchanged",
      ),
    ).toBe(true);
    expect(
      buildNavPatch(
        "siteSettings-pl",
        again.get("siteSettings-pl"),
        plan.nav.pl.item,
        "nav-blog",
      ).action,
    ).toBe("skip");
  });

  it("reports missing forms, consent pages and stale revisions", () => {
    const before = liveDataset().filter(
      (doc) =>
        doc._id !== "newsletter-form-en" && doc._id !== "legal-newsletter-pl",
    );
    const after = applyMutations(
      before,
      plan.documents.map((doc) => ({ createIfNotExists: doc })),
    );
    const problems = findReferenceProblems(plan, after);
    expect(problems).toContain(
      "page-contact-en: referencja newsletter-form-en nie istnieje",
    );
    expect(
      problems.some((problem) => problem.includes("/regulamin-newslettera/")),
    ).toBe(true);
    expect(() =>
      applyMutations(before, [
        {
          patch: {
            id: "siteSettings-pl",
            ifRevisionID: "old",
            setIfMissing: { navigation: [] },
            insert: { after: "navigation[-1]", items: [plan.nav.pl.item] },
          },
        },
      ]),
    ).toThrow(/rewizja/);
  });

  it("resolves internal paths against published pages only", () => {
    const dataset = liveDataset();
    expect(resolvesInternalPath("/polityka-prywatnosci/", dataset)).toBe(true);
    expect(resolvesInternalPath("/en/privacy/#cookies", dataset)).toBe(true);
    expect(resolvesInternalPath("/en/blog/", dataset)).toBe(true);
    expect(resolvesInternalPath("/kontakt/", dataset)).toBe(false);
    expect(resolvesInternalPath("/blog/nie-ma/", dataset)).toBe(false);
  });
});

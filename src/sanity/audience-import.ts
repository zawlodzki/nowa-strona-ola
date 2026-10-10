import type { ContentLakePlan, SanityDocument } from "./content-lake-plan";

/**
 * Targeted swap on the homepage: the retired logo strip (`logosSection`,
 * `_key` "home-logos") is replaced in place by the "Z kim pracuję" /
 * "Who I work with" section (`audienceSection`, `_key` "home-audience") in
 * page-home-pl and page-home-en. Logo/partner documents and image assets that
 * only the logo strip used are deleted. Pure functions only;
 * scripts/import-audience.ts does the I/O.
 */

export type AudienceLanguage = "pl" | "en";

export const HOME_IDS: Record<AudienceLanguage, string> = {
  pl: "page-home-pl",
  en: "page-home-en",
};
export const RETIRED_TYPE = "logosSection";
export const RETIRED_KEY = "home-logos";
export const AUDIENCE_TYPE = "audienceSection";
export const AUDIENCE_KEY = "home-audience";

/** Section order the homepage renderer requires after the swap. */
export const HOME_SECTION_ORDER = [
  "heroSection",
  "audienceSection",
  "metricsSection",
  "textImageSection",
  "ebooksSection",
  "serviceOfferSection",
  "testimonialsSection",
  "formSection",
] as const;

/** Document types that can only belong to a logo/partner strip. */
const LOGO_DOCUMENT_TYPE = /(^|[^a-z])(logo|partner|brand)s?($|[^a-z])/i;

export interface Section {
  _key: string;
  _type: string;
  [key: string]: unknown;
}

export type SectionPatchPlan =
  | { id: string; action: "skip"; reason: string; before: Section[] }
  | {
      id: string;
      action: "replace" | "insert";
      ifRevisionID: string | null;
      selector: string;
      item: Section;
      before: Section[];
      after: Section[];
    };

export type Mutation =
  | {
      patch: {
        id: string;
        ifRevisionID?: string;
        insert:
          | { replace: string; items: Section[] }
          | { after: string; items: Section[] };
      };
    }
  | { delete: { id: string } };

export interface DeletionPlan {
  id: string;
  type: string;
  reason: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sectionsOf(doc: SanityDocument | undefined): Section[] {
  return Array.isArray(doc?.sections) ? (doc.sections as Section[]) : [];
}

/** The audience section from the fixture plan, per language. */
export function buildAudienceItems(
  plan: ContentLakePlan,
): Record<AudienceLanguage, Section> {
  const items = {} as Record<AudienceLanguage, Section>;
  for (const language of ["pl", "en"] as const) {
    const page = plan.documents.find((doc) => doc._id === HOME_IDS[language]);
    const sections = sectionsOf(page);
    const item = sections.find((section) => section._key === AUDIENCE_KEY);
    if (!item || item._type !== AUDIENCE_TYPE) {
      throw new Error(`Fixture ${HOME_IDS[language]} nie ma ${AUDIENCE_KEY}.`);
    }
    if (sections.indexOf(item) !== 1) {
      throw new Error(
        `Fixture ${HOME_IDS[language]}: ${AUDIENCE_KEY} nie jest drugą sekcją.`,
      );
    }
    const cards = Array.isArray(item.items) ? item.items : [];
    if (cards.length < 4 || cards.length > 6) {
      throw new Error(`Fixture ${HOME_IDS[language]}: wymaga 4–6 kart.`);
    }
    items[language] = structuredClone(item);
  }
  return items;
}

/**
 * Patch for one home document (published or draft). Replaces the logo strip
 * in place; when it is already gone and no audience section exists, inserts
 * after the hero; when the audience section is present, skips.
 */
export function buildSectionPatch(
  doc: SanityDocument | undefined,
  item: Section,
): SectionPatchPlan {
  if (!doc) throw new Error("Brak dokumentu strony głównej.");
  const before = sectionsOf(doc);
  const ifRevisionID = typeof doc._rev === "string" ? doc._rev : null;
  const retired = before.filter((section) => section._type === RETIRED_TYPE);
  const present = before.find((section) => section._type === AUDIENCE_TYPE);
  if (retired.length > 1) {
    throw new Error(`${doc._id}: więcej niż jeden pas logotypów; zatrzymuję.`);
  }
  if (present && retired.length === 0) {
    return {
      id: doc._id,
      action: "skip",
      reason: `sekcja ${present._key} już jest, logotypów brak`,
      before,
    };
  }
  if (present) {
    throw new Error(
      `${doc._id}: ma już ${present._key} i nadal ${retired[0]!._key}; wymaga ręcznej decyzji.`,
    );
  }
  if (before.some((section) => section._key === item._key)) {
    throw new Error(`${doc._id}: _key ${item._key} jest zajęty.`);
  }
  if (retired.length === 1) {
    const index = before.indexOf(retired[0]!);
    return {
      id: doc._id,
      action: "replace",
      ifRevisionID,
      selector: `sections[_key=="${retired[0]!._key}"]`,
      item,
      before,
      after: [...before.slice(0, index), item, ...before.slice(index + 1)],
    };
  }
  const hero = before.find((section) => section._type === "heroSection");
  if (!hero) throw new Error(`${doc._id}: brak hero, nie wiem gdzie wstawić.`);
  const index = before.indexOf(hero) + 1;
  return {
    id: doc._id,
    action: "insert",
    ifRevisionID,
    selector: `sections[_key=="${hero._key}"]`,
    item,
    before,
    after: [...before.slice(0, index), item, ...before.slice(index)],
  };
}

function collectRefs(value: unknown, into: Set<string>): Set<string> {
  if (Array.isArray(value)) value.forEach((item) => collectRefs(item, into));
  else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (key === "_ref" && typeof child === "string") into.add(child);
      else collectRefs(child, into);
    }
  }
  return into;
}

/** Every logo strip anywhere in the dataset, with its owner. */
export function findLogoSections(
  dataset: SanityDocument[],
): { id: string; key: string }[] {
  return dataset.flatMap((doc) =>
    sectionsOf(doc)
      .filter((section) => section._type === RETIRED_TYPE)
      .map((section) => ({ id: doc._id, key: section._key })),
  );
}

/**
 * Documents to delete: logo/partner documents and assets that the removed
 * strips referenced, as long as nothing else references them after the patch.
 */
export function planDeletions(
  dataset: SanityDocument[],
  patches: SectionPatchPlan[],
): DeletionPlan[] {
  const removedRefs = new Set<string>();
  for (const patch of patches) {
    if (patch.action !== "replace") continue;
    for (const section of patch.before) {
      if (section._type === RETIRED_TYPE) collectRefs(section, removedRefs);
    }
  }
  const after = applyPatches(dataset, patches);
  const stillReferenced = new Set<string>();
  for (const doc of after) collectRefs(doc, stillReferenced);
  const byId = new Map(dataset.map((doc) => [doc._id, doc]));
  const deletions: DeletionPlan[] = [];
  for (const id of [...removedRefs].sort()) {
    const doc = byId.get(id);
    if (!doc || stillReferenced.has(id)) continue;
    deletions.push({
      id,
      type: doc._type,
      reason: "używany tylko przez pas logotypów",
    });
  }
  for (const doc of dataset) {
    if (deletions.some((entry) => entry.id === doc._id)) continue;
    if (doc._type.startsWith("sanity.")) continue;
    if (!LOGO_DOCUMENT_TYPE.test(doc._type)) continue;
    if (
      stillReferenced.has(doc._id) ||
      stillReferenced.has(doc._id.replace(/^drafts\./, ""))
    ) {
      continue;
    }
    deletions.push({
      id: doc._id,
      type: doc._type,
      reason: "dokument logotypu/partnera bez referencji",
    });
  }
  return deletions;
}

export function buildMutations(
  patches: SectionPatchPlan[],
  deletions: DeletionPlan[],
): Mutation[] {
  const mutations: Mutation[] = [];
  for (const patch of patches) {
    if (patch.action === "skip") continue;
    mutations.push({
      patch: {
        id: patch.id,
        ...(patch.ifRevisionID ? { ifRevisionID: patch.ifRevisionID } : {}),
        insert:
          patch.action === "replace"
            ? { replace: patch.selector, items: [patch.item] }
            : { after: patch.selector, items: [patch.item] },
      },
    });
  }
  for (const deletion of deletions)
    mutations.push({ delete: { id: deletion.id } });
  return mutations;
}

function applyPatches(
  dataset: SanityDocument[],
  patches: SectionPatchPlan[],
): SanityDocument[] {
  return applyMutations(dataset, buildMutations(patches, []));
}

/** Local emulation of the mutation subset above, for simulation and tests. */
export function applyMutations(
  dataset: SanityDocument[],
  mutations: Mutation[],
): SanityDocument[] {
  const byId = new Map(dataset.map((doc) => [doc._id, structuredClone(doc)]));
  for (const mutation of mutations) {
    if ("delete" in mutation) {
      byId.delete(mutation.delete.id);
      continue;
    }
    const { id, ifRevisionID, insert } = mutation.patch;
    const doc = byId.get(id);
    if (!doc) throw new Error(`patch: brak dokumentu ${id}.`);
    if (ifRevisionID && doc._rev !== ifRevisionID) {
      throw new Error(`patch: ${id} zmienił się (rewizja).`);
    }
    const sections = sectionsOf(doc);
    const selector = "replace" in insert ? insert.replace : insert.after;
    const match = /^sections\[_key=="(.+)"\]$/.exec(selector);
    if (!match) throw new Error(`patch: nieobsługiwany selektor ${selector}.`);
    const index = sections.findIndex((section) => section._key === match[1]);
    if (index === -1) throw new Error(`patch: brak ${selector}.`);
    const items = structuredClone(insert.items);
    if ("replace" in insert) sections.splice(index, 1, ...items);
    else sections.splice(index + 1, 0, ...items);
    doc.sections = sections;
  }
  return [...byId.values()];
}

/** Post-conditions on the dataset after the mutations. */
export function findProblems(datasetAfter: SanityDocument[]): string[] {
  const problems: string[] = [];
  for (const strip of findLogoSections(datasetAfter)) {
    problems.push(`${strip.id}: nadal ma ${RETIRED_TYPE} (${strip.key})`);
  }
  const ids = new Set(datasetAfter.map((doc) => doc._id));
  for (const language of ["pl", "en"] as const) {
    const page = datasetAfter.find((doc) => doc._id === HOME_IDS[language]);
    const order = sectionsOf(page).map((section) => section._type);
    if (order.join(",") !== HOME_SECTION_ORDER.join(",")) {
      problems.push(
        `${HOME_IDS[language]}: kolejność sekcji ${order.join(", ")}`,
      );
    }
    for (const ref of collectRefs(page, new Set())) {
      if (!ids.has(ref))
        problems.push(`${HOME_IDS[language]}: brak referencji ${ref}`);
    }
  }
  return problems;
}

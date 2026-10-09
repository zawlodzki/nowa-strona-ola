import { isSiteRasterKey } from "@/lib/site-images";
import type { ContentLakePlan, SanityDocument } from "./content-lake-plan";

/**
 * Targeted import of the contact page: two `page` documents, two `form`
 * documents and one navigation item per language in `siteSettings-pl/en`.
 * Pure functions only; scripts/import-contact.ts does the I/O.
 */

export type ContactLanguage = "pl" | "en";

export const CONTACT_DOCUMENTS = [
  { _id: "page-contact-pl", _type: "page", language: "pl", slug: "kontakt" },
  { _id: "page-contact-en", _type: "page", language: "en", slug: "contact" },
  { _id: "form-contact-pl", _type: "form", language: "pl", slug: null },
  { _id: "form-contact-en", _type: "form", language: "en", slug: null },
] as const;

export const CONTACT_NAV_KEY = "nav-contact";
export const SETTINGS_IDS: Record<ContactLanguage, string> = {
  pl: "siteSettings-pl",
  en: "siteSettings-en",
};

const SYSTEM_FIELDS = new Set(["_rev", "_createdAt", "_updatedAt", "_system"]);

export interface NavItem {
  _key: string;
  label: string;
  href: string;
  [key: string]: unknown;
}

export interface ContactImportPlan {
  documents: SanityDocument[];
  nav: Record<ContactLanguage, { item: NavItem; afterKey: string | null }>;
}

export type DocumentAction =
  | { id: string; type: string; action: "create" }
  | { id: string; type: string; action: "unchanged" }
  | { id: string; type: string; action: "conflict"; fields: string[] }
  | { id: string; type: string; action: "replace"; fields: string[] };

export type NavPatchPlan =
  | {
      id: string;
      action: "skip";
      reason: string;
      before: NavItem[];
    }
  | {
      id: string;
      action: "insert";
      ifRevisionID: string | null;
      item: NavItem;
      afterKey: string | null;
      before: NavItem[];
      after: NavItem[];
    };

export type Mutation =
  | { createIfNotExists: SanityDocument }
  | { createOrReplace: SanityDocument }
  | {
      patch: {
        id: string;
        ifRevisionID?: string;
        setIfMissing: { navigation: [] };
        insert: { after: string; items: NavItem[] };
      };
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Every object inside an array needs a `_key` (Sanity requirement). */
export function missingArrayKeys(value: unknown, where = ""): string[] {
  const problems: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const path = `${where}[${index}]`;
      if (isRecord(item) && typeof item._key !== "string") {
        problems.push(path);
      }
      problems.push(...missingArrayKeys(item, path));
    });
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      problems.push(
        ...missingArrayKeys(child, where ? `${where}.${key}` : key),
      );
    }
  }
  return problems;
}

export function buildContactImportPlan(
  lakePlan: ContentLakePlan,
): ContactImportPlan {
  const byId = new Map(lakePlan.documents.map((doc) => [doc._id, doc]));
  const documents = CONTACT_DOCUMENTS.map((spec) => {
    const doc = byId.get(spec._id);
    if (!doc) throw new Error(`Plan 3a nie zawiera ${spec._id}.`);
    if (doc._type !== spec._type) {
      throw new Error(`${spec._id}: typ ${doc._type} zamiast ${spec._type}.`);
    }
    if (doc.language !== spec.language) {
      throw new Error(`${spec._id}: język ${String(doc.language)}.`);
    }
    if (spec.slug && (!isRecord(doc.slug) || doc.slug.current !== spec.slug)) {
      throw new Error(`${spec._id}: slug inny niż ${spec.slug}.`);
    }
    const missing = missingArrayKeys(doc);
    if (missing.length > 0) {
      throw new Error(`${spec._id}: brak _key w ${missing.join(", ")}.`);
    }
    return structuredClone(doc);
  });

  const nav = {} as ContactImportPlan["nav"];
  for (const language of ["pl", "en"] as const) {
    const settings = byId.get(SETTINGS_IDS[language]);
    const items = Array.isArray(settings?.navigation)
      ? (settings.navigation as NavItem[])
      : [];
    const index = items.findIndex((item) => item._key === CONTACT_NAV_KEY);
    if (index === -1) {
      throw new Error(
        `Fixture ${SETTINGS_IDS[language]} nie ma ${CONTACT_NAV_KEY}.`,
      );
    }
    const item = structuredClone(items[index]!);
    const expectedHref = language === "pl" ? "/kontakt/" : "/en/contact/";
    if (item.href !== expectedHref || !item.label) {
      throw new Error(
        `${CONTACT_NAV_KEY} ${language}: zły adres lub etykieta.`,
      );
    }
    nav[language] = {
      item,
      afterKey: index > 0 ? (items[index - 1]!._key ?? null) : null,
    };
  }
  return { documents, nav };
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .filter((key) => !SYSTEM_FIELDS.has(key) && value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function changedFields(
  planned: SanityDocument,
  existing: SanityDocument,
): string[] {
  const left = planned as Record<string, unknown>;
  const right = existing as Record<string, unknown>;
  return [...new Set([...Object.keys(left), ...Object.keys(right)])]
    .filter((key) => !SYSTEM_FIELDS.has(key))
    .filter((key) => stableJson(left[key]) !== stableJson(right[key]))
    .sort();
}

export function planDocumentActions(
  documents: SanityDocument[],
  existing: ReadonlyMap<string, SanityDocument>,
  force: boolean,
): DocumentAction[] {
  return documents.map((doc) => {
    const current = existing.get(doc._id);
    if (!current) return { id: doc._id, type: doc._type, action: "create" };
    const fields = changedFields(doc, current);
    if (fields.length === 0) {
      return { id: doc._id, type: doc._type, action: "unchanged" };
    }
    return {
      id: doc._id,
      type: doc._type,
      action: force ? "replace" : "conflict",
      fields,
    };
  });
}

export function buildNavPatch(
  id: string,
  settings: SanityDocument | undefined,
  item: NavItem,
  afterKey: string | null,
): NavPatchPlan {
  if (!settings) {
    throw new Error(`Brak dokumentu ${id}; nawigacji nie da się uzupełnić.`);
  }
  const before = Array.isArray(settings.navigation)
    ? (settings.navigation as NavItem[])
    : [];
  const present = before.find(
    (entry) => entry._key === item._key || entry.href === item.href,
  );
  if (present) {
    return {
      id,
      action: "skip",
      reason: `pozycja już jest (_key ${present._key}, ${present.href})`,
      before,
    };
  }
  const anchor =
    afterKey && before.some((entry) => entry._key === afterKey)
      ? afterKey
      : null;
  const index = anchor
    ? before.findIndex((entry) => entry._key === anchor) + 1
    : before.length;
  const after = [...before.slice(0, index), item, ...before.slice(index)];
  return {
    id,
    action: "insert",
    ifRevisionID: typeof settings._rev === "string" ? settings._rev : null,
    item,
    afterKey: anchor,
    before,
    after,
  };
}

function insertSelector(afterKey: string | null): string {
  return afterKey ? `navigation[_key=="${afterKey}"]` : "navigation[-1]";
}

export function buildMutations(
  plan: ContactImportPlan,
  actions: DocumentAction[],
  navPatches: NavPatchPlan[],
): Mutation[] {
  const docs = new Map(plan.documents.map((doc) => [doc._id, doc]));
  const mutations: Mutation[] = [];
  for (const action of actions) {
    const doc = docs.get(action.id)!;
    if (action.action === "create") mutations.push({ createIfNotExists: doc });
    if (action.action === "replace") mutations.push({ createOrReplace: doc });
    if (action.action === "conflict") {
      throw new Error(
        `${action.id} ma inną treść; użyj --force, aby nadpisać.`,
      );
    }
  }
  for (const patch of navPatches) {
    if (patch.action !== "insert") continue;
    mutations.push({
      patch: {
        id: patch.id,
        ...(patch.ifRevisionID ? { ifRevisionID: patch.ifRevisionID } : {}),
        setIfMissing: { navigation: [] },
        insert: { after: insertSelector(patch.afterKey), items: [patch.item] },
      },
    });
  }
  return mutations;
}

/** Local emulation of the mutation subset above, for simulation and tests. */
export function applyMutations(
  dataset: SanityDocument[],
  mutations: Mutation[],
): SanityDocument[] {
  const byId = new Map(dataset.map((doc) => [doc._id, structuredClone(doc)]));
  for (const mutation of mutations) {
    if ("createIfNotExists" in mutation) {
      const doc = mutation.createIfNotExists;
      if (!byId.has(doc._id)) byId.set(doc._id, structuredClone(doc));
    } else if ("createOrReplace" in mutation) {
      const doc = mutation.createOrReplace;
      byId.set(doc._id, structuredClone(doc));
    } else {
      const { id, ifRevisionID, setIfMissing, insert } = mutation.patch;
      const doc = byId.get(id);
      if (!doc) throw new Error(`patch: brak dokumentu ${id}.`);
      if (ifRevisionID && doc._rev !== ifRevisionID) {
        throw new Error(`patch: ${id} zmienił się (rewizja).`);
      }
      const record = doc as Record<string, unknown>;
      if (!Array.isArray(record.navigation)) {
        record.navigation = [...setIfMissing.navigation];
      }
      const navigation = record.navigation as NavItem[];
      const match = /^navigation\[_key=="(.+)"\]$/.exec(insert.after);
      let index: number;
      if (insert.after === "navigation[-1]") index = navigation.length;
      else if (match) {
        index = navigation.findIndex((entry) => entry._key === match[1]) + 1;
        if (index === 0) throw new Error(`patch: brak ${insert.after}.`);
      } else throw new Error(`patch: nieobsługiwany selektor ${insert.after}.`);
      navigation.splice(index, 0, ...structuredClone(insert.items));
    }
  }
  return [...byId.values()];
}

function collect(
  value: unknown,
  visit: (key: string, value: unknown, parent: Record<string, unknown>) => void,
): void {
  if (Array.isArray(value)) value.forEach((item) => collect(item, visit));
  else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      visit(key, child, value);
      collect(child, visit);
    }
  }
}

const COLLECTION_ROOTS: Record<ContactLanguage, string[]> = {
  pl: ["blog", "ebooki"],
  en: ["blog", "ebooks"],
};

function isPublished(doc: SanityDocument): boolean {
  return !doc._id.startsWith("drafts.") && !doc._id.startsWith("versions.");
}

/** True when an internal path maps to a published route in the dataset. */
export function resolvesInternalPath(
  href: string,
  dataset: SanityDocument[],
): boolean {
  const clean = href.split(/[?#]/)[0]!;
  if (!clean.startsWith("/")) return false;
  const segments = clean.split("/").filter(Boolean);
  const language: ContactLanguage = segments[0] === "en" ? "en" : "pl";
  const rest = language === "en" ? segments.slice(1) : segments;
  if (rest.length === 0) return true;
  if (rest.length === 1 && COLLECTION_ROOTS[language].includes(rest[0]!)) {
    return true;
  }
  if (rest.length !== 1) {
    const type = rest[0] === "blog" ? "article" : "ebook";
    return dataset.some(
      (doc) =>
        isPublished(doc) &&
        doc._type === type &&
        doc.language === language &&
        isRecord(doc.slug) &&
        doc.slug.current === rest[rest.length - 1],
    );
  }
  return dataset.some(
    (doc) =>
      isPublished(doc) &&
      (doc._type === "page" || doc._type === "legalPage") &&
      doc.language === language &&
      isRecord(doc.slug) &&
      doc.slug.current === rest[0],
  );
}

/**
 * Checks the planned documents and nav items against the dataset after the
 * mutations: references, referenced forms' links, raster keys and hrefs.
 */
export function findReferenceProblems(
  plan: ContactImportPlan,
  datasetAfter: SanityDocument[],
): string[] {
  const problems: string[] = [];
  const published = new Map(
    datasetAfter.filter(isPublished).map((doc) => [doc._id, doc]),
  );
  const checked = new Set<string>();
  const checkLinks = (owner: string, value: unknown) => {
    collect(value, (key, child) => {
      if (typeof child !== "string") return;
      const hrefs: string[] = [];
      if (key === "href") hrefs.push(child);
      for (const match of child.matchAll(/\]\((\/[^)\s]*)\)/g)) {
        hrefs.push(match[1]!);
      }
      for (const href of hrefs) {
        if (href.startsWith("/")) {
          if (!resolvesInternalPath(href, datasetAfter)) {
            problems.push(`${owner}: link ${href} nie prowadzi do strony`);
          }
        } else if (href.startsWith("mailto:")) {
          if (!/^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(href)) {
            problems.push(`${owner}: niepoprawny ${href}`);
          }
        } else if (!/^https?:\/\//.test(href) && !href.startsWith("#")) {
          problems.push(`${owner}: nieobsługiwany adres ${href}`);
        }
      }
    });
  };
  const checkDocument = (owner: string, value: unknown, depth: number) => {
    collect(value, (key, child, parent) => {
      if (key === "_ref" && typeof child === "string") {
        const target = published.get(child);
        if (!target) {
          problems.push(`${owner}: referencja ${child} nie istnieje`);
        } else if (depth < 1 && !checked.has(child)) {
          checked.add(child);
          checkDocument(child, target, depth + 1);
        }
      }
      if (key === "rasterKey" && typeof child === "string") {
        if (!isSiteRasterKey(child)) {
          problems.push(`${owner}: nieznane zdjęcie ${child}`);
        }
      }
      if (parent._type === "mediaObject" && key === "alt" && !child) {
        problems.push(`${owner}: zdjęcie bez alt`);
      }
    });
    checkLinks(owner, value);
  };
  for (const doc of plan.documents) checkDocument(doc._id, doc, 0);
  for (const language of ["pl", "en"] as const) {
    checkLinks(`${SETTINGS_IDS[language]}.navigation`, [
      plan.nav[language].item,
    ]);
  }
  return [...new Set(problems)];
}

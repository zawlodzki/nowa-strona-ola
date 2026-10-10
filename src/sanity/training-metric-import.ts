/**
 * Pure logic for `npm run import:training-metric`: the 450+ metric now counts
 * hours of training instead of women helped per year. Sets only the label
 * strings (and the About metric section title) by field path, guarded by
 * ifRevisionID, in one transaction. No I/O here.
 */
import { aboutCopy } from "../content/about-seed";
import { homepageCopy } from "../content/homepage-seed";
import type { SanityDocument } from "./content-lake-plan";

type Language = "pl" | "en";

export const PREVIOUS_COPY = {
  pl: {
    label: "kobiet rocznie, którym pomagają moje konsultacje",
    aboutTitle: "Doświadczenie konsultacji",
  },
  en: {
    label: "women a year helped by my consultations",
    aboutTitle: "Consultation experience",
  },
} as const;

export interface FieldTarget {
  /** Published document id; drafts are matched as `drafts.<id>`. */
  id: string;
  language: Language;
  path: string;
  /** Path of the numeric value next to the label, checked to stay 450. */
  valuePath?: string;
  before: string;
  after: string;
}

export function trainingMetricTargets(): FieldTarget[] {
  return (["pl", "en"] as const).flatMap((language) => {
    const label = {
      before: PREVIOUS_COPY[language].label,
      after: homepageCopy[language].metricLabel,
    };
    return [
      {
        id: `page-home-${language}`,
        language,
        path: 'sections[_key=="home-approach"].items[_key=="metric-450"].label',
        valuePath:
          'sections[_key=="home-approach"].items[_key=="metric-450"].value',
        ...label,
      },
      {
        id: `page-about-${language}`,
        language,
        path: 'sections[_key=="about-metric"].title',
        before: PREVIOUS_COPY[language].aboutTitle,
        after: aboutCopy[language].metricTitle,
      },
      {
        id: `page-about-${language}`,
        language,
        path: 'sections[_key=="about-metric"].items[_key=="about-metric-450"].label',
        valuePath:
          'sections[_key=="about-metric"].items[_key=="about-metric-450"].value',
        before: PREVIOUS_COPY[language].label,
        after: aboutCopy[language].metricLabel,
      },
      {
        id: `page-consultation-${language}`,
        language,
        path: 'sections[_key=="consultation-expert"].metric.label',
        valuePath: 'sections[_key=="consultation-expert"].metric.value',
        ...label,
      },
    ];
  });
}

type Segment = { field: string; key?: string };

function parsePath(path: string): Segment[] {
  return path.split(".").map((part) => {
    const match = /^(\w+)\[_key=="([^"]+)"\]$/.exec(part);
    if (match) return { field: match[1]!, key: match[2]! };
    if (!/^\w+$/.test(part)) throw new Error(`Nieobsługiwana ścieżka ${path}.`);
    return { field: part };
  });
}

function step(container: unknown, segment: Segment): unknown {
  if (!container || typeof container !== "object") return undefined;
  const value = (container as Record<string, unknown>)[segment.field];
  if (segment.key === undefined) return value;
  if (!Array.isArray(value)) return undefined;
  return value.find(
    (entry) => (entry as { _key?: string } | null)?._key === segment.key,
  );
}

export function getAtPath(doc: unknown, path: string): unknown {
  return parsePath(path).reduce<unknown>(step, doc);
}

function setAtPath(doc: SanityDocument, path: string, value: string): void {
  const segments = parsePath(path);
  const last = segments.pop()!;
  if (last.key !== undefined)
    throw new Error(`Nieobsługiwana ścieżka ${path}.`);
  const parent = segments.reduce<unknown>(step, doc);
  if (!parent || typeof parent !== "object") {
    throw new Error(`patch: brak ${path} w ${doc._id}.`);
  }
  (parent as Record<string, unknown>)[last.field] = value;
}

export interface FieldChange {
  path: string;
  from: string;
  to: string;
}

export interface DocumentPatchPlan {
  id: string;
  ifRevisionID: string | null;
  changes: FieldChange[];
}

export interface TrainingMetricPlan {
  patches: DocumentPatchPlan[];
  unchanged: string[];
  conflicts: string[];
}

/**
 * Plans the field sets. A field already at the new copy is skipped; a field
 * holding anything other than the old or new copy is a conflict (an editor
 * changed it), and so is a metric value other than 450 or a missing field.
 */
export function planTrainingMetric(
  dataset: SanityDocument[],
  targets: FieldTarget[] = trainingMetricTargets(),
): TrainingMetricPlan {
  const byId = new Map(dataset.map((doc) => [doc._id, doc]));
  const patches = new Map<string, DocumentPatchPlan>();
  const unchanged: string[] = [];
  const conflicts: string[] = [];
  for (const target of targets) {
    for (const id of [target.id, `drafts.${target.id}`]) {
      const doc = byId.get(id);
      if (!doc) {
        if (id === target.id) conflicts.push(`${id}: brak dokumentu`);
        continue;
      }
      const current = getAtPath(doc, target.path);
      const where = `${id} ${target.path}`;
      if (target.valuePath && getAtPath(doc, target.valuePath) !== 450) {
        conflicts.push(`${id} ${target.valuePath}: wartość inna niż 450`);
        continue;
      }
      if (current === target.after) {
        unchanged.push(where);
        continue;
      }
      if (current !== target.before) {
        conflicts.push(
          `${where}: nieoczekiwana treść ${JSON.stringify(current)}`,
        );
        continue;
      }
      const plan = patches.get(id) ?? {
        id,
        ifRevisionID: typeof doc._rev === "string" ? doc._rev : null,
        changes: [],
      };
      plan.changes.push({ path: target.path, from: current, to: target.after });
      patches.set(id, plan);
    }
  }
  return { patches: [...patches.values()], unchanged, conflicts };
}

export type Mutation = {
  patch: { id: string; ifRevisionID?: string; set: Record<string, string> };
};

export function buildMutations(patches: DocumentPatchPlan[]): Mutation[] {
  return patches.map((patch) => ({
    patch: {
      id: patch.id,
      ...(patch.ifRevisionID ? { ifRevisionID: patch.ifRevisionID } : {}),
      set: Object.fromEntries(
        patch.changes.map((change) => [change.path, change.to]),
      ),
    },
  }));
}

/** Local emulation of the mutations above, for simulation and tests. */
export function applyMutations(
  dataset: SanityDocument[],
  mutations: Mutation[],
): SanityDocument[] {
  const byId = new Map(dataset.map((doc) => [doc._id, structuredClone(doc)]));
  for (const { patch } of mutations) {
    const doc = byId.get(patch.id);
    if (!doc) throw new Error(`patch: brak dokumentu ${patch.id}.`);
    if (patch.ifRevisionID && doc._rev !== patch.ifRevisionID) {
      throw new Error(`patch: ${patch.id} zmienił się (rewizja).`);
    }
    for (const [path, value] of Object.entries(patch.set)) {
      if (getAtPath(doc, path) === undefined) {
        throw new Error(`patch: brak ${path} w ${patch.id}.`);
      }
      setAtPath(doc, path, value);
    }
  }
  return [...byId.values()];
}

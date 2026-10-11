import { aboutCopy } from "@/content/about-seed";

import type { SanityDocument } from "./content-lake-plan";

const FACULTY: readonly (readonly [string, string])[] = [
  ["Wydziałem Nauk o Zdrowiu", "Wydziałem Zdrowia Publicznego"],
  ["Wydziału Nauk o Zdrowiu", "Wydziału Zdrowia Publicznego"],
  ["Wydziale Nauk o Zdrowiu", "Wydziale Zdrowia Publicznego"],
  ["Wydział Nauk o Zdrowiu", "Wydział Zdrowia Publicznego"],
  ["Faculty of Health Sciences", "Faculty of Public Health"],
];

const SKIP_KEY =
  /^(?:_id|_key|_type|_rev|_ref|slug|current|href|url|src|asset|topic|icon|formKey|rasterKey)$|Url$|Href$/;

const ABOUT_PAGE = { pl: "page-about-pl", en: "page-about-en" } as const;
const ABOUT_AUTHOR = { pl: "author-ola-pl", en: "author-ola-en" } as const;

export type PatchValue = string | string[];

export interface FieldChange {
  id: string;
  path: string;
  before: PatchValue | null;
  after: PatchValue;
}

export interface PmosMutation {
  patch: {
    id: string;
    ifRevisionID: string;
    set: Record<string, PatchValue>;
  };
}

export interface DraftReport {
  id: string;
  changed: boolean;
}

export interface PmosRenamePlan {
  changes: FieldChange[];
  mutations: PmosMutation[];
  problems: string[];
  notes: string[];
  drafts: DraftReport[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function publishedId(id: string): string {
  return id.startsWith("drafts.") ? id.slice("drafts.".length) : id;
}

function languageOf(id: string): "pl" | "en" | null {
  const bare = publishedId(id);
  if (bare.endsWith("-pl")) return "pl";
  if (bare.endsWith("-en")) return "en";
  return null;
}

function isFrozenString(value: string): boolean {
  if (/^(https?:\/\/|\/)/.test(value)) return true;
  return /^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(value) && /pcos/i.test(value);
}

type CopySpan = { kind: "text" | "url" | "wrapped"; text: string };

const PROTECTED = /https?:\/\/[^\s)]+|PMOS \(PCOS\)/g;

function spansOf(text: string): CopySpan[] {
  const spans: CopySpan[] = [];
  let cursor = 0;
  for (const match of text.matchAll(PROTECTED)) {
    const start = match.index;
    if (start === undefined) continue;
    if (start > cursor)
      spans.push({ kind: "text", text: text.slice(cursor, start) });
    const raw = match[0];
    spans.push({ kind: raw.startsWith("http") ? "url" : "wrapped", text: raw });
    cursor = start + raw.length;
  }
  if (cursor < text.length || spans.length === 0) {
    spans.push({ kind: "text", text: text.slice(cursor) });
  }
  return spans;
}

function rewriteSentence(text: string): string {
  let seen = false;
  return spansOf(text)
    .map((span) => {
      if (span.kind === "url") return span.text;
      if (span.kind === "wrapped") {
        seen = true;
        return span.text;
      }
      return span.text.replace(/\bPCOS\b/g, () => {
        if (seen) return "PMOS";
        seen = true;
        return "PMOS (PCOS)";
      });
    })
    .join("");
}

function sentencesOf(text: string): { sentence: string; delimiter: string }[] {
  const parts = text.split(/([.!?]\s+)/);
  const sentences: { sentence: string; delimiter: string }[] = [];
  for (let index = 0; index < parts.length; index += 2) {
    sentences.push({
      sentence: parts[index] ?? "",
      delimiter: parts[index + 1] ?? "",
    });
  }
  return sentences;
}

export function rewriteCopy(value: string): string {
  if (!/PCOS|Nauk o Zdrowiu|Faculty of Health Sciences/.test(value))
    return value;
  let next = value;
  for (const [from, to] of FACULTY) next = next.replaceAll(from, to);
  return sentencesOf(next)
    .map(({ sentence, delimiter }) => rewriteSentence(sentence) + delimiter)
    .join("");
}

function walk(
  value: unknown,
  path: string,
  into: { path: string; before: string; after: string }[],
): void {
  if (typeof value === "string") {
    if (isFrozenString(value)) return;
    const after = rewriteCopy(value);
    if (after !== value) into.push({ path, before: value, after });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (isRecord(item) && typeof item._key === "string") {
        walk(item, `${path}[_key=="${item._key}"]`, into);
      } else {
        walk(item, `${path}[${index}]`, into);
      }
    });
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    if (SKIP_KEY.test(key)) continue;
    walk(child, path ? `${path}.${key}` : key, into);
  }
}

function isUnder(path: string, root: string): boolean {
  return (
    path === root || path.startsWith(`${root}.`) || path.startsWith(`${root}[`)
  );
}

function section(
  doc: SanityDocument,
  key: string,
  type: string,
  problems: string[],
): Record<string, unknown> | null {
  if (!Array.isArray(doc.sections)) {
    problems.push(`${doc._id}: brak sections`);
    return null;
  }
  const found = doc.sections.find(
    (item) => isRecord(item) && item._key === key && item._type === type,
  );
  if (!isRecord(found)) {
    problems.push(`${doc._id}: brak ${key} (${type})`);
    return null;
  }
  return found;
}

function aboutOverrides(
  doc: SanityDocument,
  problems: string[],
): FieldChange[] {
  const bare = publishedId(doc._id);
  const language = languageOf(doc._id);
  if (!language) return [];
  const copy = aboutCopy[language];
  const changes: FieldChange[] = [];
  if (bare === ABOUT_PAGE[language]) {
    const story = section(doc, "about-story", "textSection", problems);
    if (story) {
      const after = [...copy.storyBody];
      const body = story.body;
      const bodyIsStrings =
        Array.isArray(body) && body.every((item) => typeof item === "string");
      if (!bodyIsStrings || JSON.stringify(body) !== JSON.stringify(after)) {
        changes.push({
          id: doc._id,
          path: 'sections[_key=="about-story"].body',
          before: bodyIsStrings ? [...(body as string[])] : null,
          after,
        });
      }
    }
    const credentials = section(
      doc,
      "about-credentials",
      "credentialsSection",
      problems,
    );
    if (credentials && credentials.diplomaCaption !== copy.diplomaCaption) {
      changes.push({
        id: doc._id,
        path: 'sections[_key=="about-credentials"].diplomaCaption',
        before:
          typeof credentials.diplomaCaption === "string"
            ? credentials.diplomaCaption
            : null,
        after: copy.diplomaCaption,
      });
    }
  }
  if (bare === ABOUT_AUTHOR[language]) {
    if (!isRecord(doc.diplomaScan)) {
      problems.push(`${doc._id}: brak diplomaScan`);
    } else {
      const scan = doc.diplomaScan;
      if (scan.alt !== copy.diplomaAlt) {
        changes.push({
          id: doc._id,
          path: "diplomaScan.alt",
          before: typeof scan.alt === "string" ? scan.alt : null,
          after: copy.diplomaAlt,
        });
      }
      if (typeof scan.label === "string" && scan.label !== copy.diplomaAlt) {
        changes.push({
          id: doc._id,
          path: "diplomaScan.label",
          before: scan.label,
          after: copy.diplomaAlt,
        });
      }
    }
  }
  return changes;
}

function compareChange(a: FieldChange, b: FieldChange): number {
  return a.id.localeCompare(b.id) || a.path.localeCompare(b.path);
}

export function planPmosRename(documents: SanityDocument[]): PmosRenamePlan {
  const problems: string[] = [];
  const notes: string[] = [];
  const ids = new Set(documents.map((doc) => doc._id));
  if (!ids.has(ABOUT_PAGE.pl)) problems.push(`brak ${ABOUT_PAGE.pl}`);
  if (!ids.has(ABOUT_AUTHOR.pl)) problems.push(`brak ${ABOUT_AUTHOR.pl}`);
  if (!ids.has(ABOUT_PAGE.en)) notes.push(`brak ${ABOUT_PAGE.en}; pomijam`);
  if (!ids.has(ABOUT_AUTHOR.en)) notes.push(`brak ${ABOUT_AUTHOR.en}; pomijam`);

  const changes: FieldChange[] = [];
  for (const doc of documents) {
    if (doc._id.startsWith("versions.")) continue;
    const walked = [] as { path: string; before: string; after: string }[];
    walk(doc, "", walked);
    const override = aboutOverrides(doc, problems);
    const kept = walked.filter(
      (change) => !override.some((item) => isUnder(change.path, item.path)),
    );
    for (const change of kept) {
      changes.push({ id: doc._id, ...change });
    }
    changes.push(...override);
  }
  changes.sort(compareChange);

  const seen = new Set<string>();
  for (const change of changes) {
    const key = `${change.id}\0${change.path}`;
    if (seen.has(key))
      problems.push(`${change.id}: podwójna ścieżka ${change.path}`);
    seen.add(key);
  }

  const byId = new Map(documents.map((doc) => [doc._id, doc]));
  const grouped = new Map<string, FieldChange[]>();
  for (const change of changes) {
    const list = grouped.get(change.id) ?? [];
    list.push(change);
    grouped.set(change.id, list);
  }
  const mutations: PmosMutation[] = [];
  for (const [id, fields] of [...grouped].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const rev = byId.get(id)?._rev;
    if (typeof rev !== "string" || rev.length === 0) {
      problems.push(`${id}: brak _rev, pomijam mutację`);
      continue;
    }
    mutations.push({
      patch: {
        id,
        ifRevisionID: rev,
        set: Object.fromEntries(
          fields.map((field) => [field.path, field.after]),
        ),
      },
    });
  }

  const changedIds = new Set(changes.map((change) => change.id));
  const publishedChanged = new Set([...changedIds].map(publishedId));
  const aboutIds = new Set<string>([
    ABOUT_PAGE.pl,
    ABOUT_PAGE.en,
    ABOUT_AUTHOR.pl,
    ABOUT_AUTHOR.en,
  ]);
  const drafts: DraftReport[] = documents
    .filter((doc) => doc._id.startsWith("drafts."))
    .filter((doc) => {
      const bare = publishedId(doc._id);
      return (
        changedIds.has(doc._id) ||
        publishedChanged.has(bare) ||
        aboutIds.has(bare)
      );
    })
    .map((doc) => ({ id: doc._id, changed: changedIds.has(doc._id) }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return { changes, mutations, problems, notes, drafts };
}

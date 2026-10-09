import { blogCollectionPageFixture } from "./blog-page";
import {
  contactPageFixture,
  contactFormFixture,
} from "@/sanity/contact-fixtures";
import { homepageCopy } from "@/content/homepage-seed";
import { BLOG_ARTICLE_SEED } from "@/content/blog-collection-seed";
import {
  demonstrationCategories,
  fixtureArticlesForLanguage,
} from "@/sanity/blog-collection-fixtures";
import { pcosEbookFixture } from "@/sanity/ebook-fixtures";
import { ebookCollectionPageFixture } from "@/sanity/ebook-collection-fixtures";
import { aboutAuthorFixture, aboutPageFixture } from "@/sanity/about-fixtures";
import { consultationPageFixture } from "@/sanity/consultation-fixtures";
import {
  ebookFixtures,
  homepagePageFixture,
  homepageSettingsFixture,
  newsletterFormFixture,
  serviceFixture,
  testimonialFixtures,
} from "@/sanity/homepage-fixtures";

type JsonRecord = Record<string, unknown>;

export interface SanityDocument {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

export type PendingItem =
  { kind: "form"; document: SanityDocument } | { kind: "legalPage" };

export interface ContentLakeGate {
  formLabelMax: number;
  keepPlaceholder: boolean;
  legalPages: JsonRecord[] | null;
}

export interface ContentLakePlan {
  deletions: readonly string[];
  documents: SanityDocument[];
  pending: PendingItem[];
}

export interface ContentLakeMutation {
  delete?: { id: string };
  createOrReplace?: SanityDocument;
}

/** Old prototype documents. The transaction deletes these ids and no others. */
export const OBSOLETE_DOCUMENTS = [
  { _id: "drafts.2fcf97fc-fca3-4494-92bb-acad265e9928", _type: "article" },
  { _id: "drafts.60a439d4-a7fd-4b99-91a4-0eeb7541be74", _type: "article" },
  { _id: "drafts.761e9e2e-5be5-4c92-8ec7-9dc3508ecc52", _type: "article" },
  { _id: "drafts.9bc8e498-57b5-45a7-8230-a01cb331f2f1", _type: "article" },
  { _id: "drafts.a805d55e-3bf2-4b0d-8157-507a59e24a55", _type: "article" },
  { _id: "drafts.b1f098b0-c3f8-45c3-a35c-5c808064624e", _type: "article" },
  { _id: "drafts.0c6afc1f-95c4-49d3-9794-c3bae855876e", _type: "page" },
  { _id: "drafts.105e5e26-e50d-40e1-82bb-bf04465b90a3", _type: "page" },
  { _id: "drafts.3324654d-9272-4ab8-a2e4-147386de3ab2", _type: "page" },
  { _id: "drafts.352caa76-bbe8-4d45-bfd5-df2540ac33dc", _type: "page" },
  { _id: "drafts.354b6329-ff44-481b-b08e-0c2357788ae6", _type: "page" },
  { _id: "drafts.ace1d142-3e7f-44a4-92d3-129f77061026", _type: "page" },
  { _id: "drafts.f5693c8f-1cfb-4362-88fd-99d5e99e87d5", _type: "page" },
  { _id: "0c6afc1f-95c4-49d3-9794-c3bae855876e", _type: "page" },
  { _id: "354b6329-ff44-481b-b08e-0c2357788ae6", _type: "page" },
  { _id: "4163bf55-a4d4-4069-b39f-76bcbcfc32b8", _type: "author" },
  { _id: "c0cd4073-3e75-4d9f-a2b5-64764b8c55b1", _type: "author" },
  { _id: "2f119004-23ed-4936-bb1b-a7b0ddfcc8cd", _type: "category" },
  { _id: "a73f5d86-2bba-43f7-b91d-5e7655f78cb1", _type: "category" },
  { _id: "ac4d144b-7b6c-4f3e-8559-b8d157f69254", _type: "category" },
  { _id: "db01b17b-1ab5-4546-a272-07a3170882a5", _type: "category" },
  { _id: "8f26e078-7191-44ab-b33f-54d74479a5c2", _type: "form" },
  { _id: "c9587cdb-47a6-4daa-94e4-8cf79a8a2985", _type: "form" },
  { _id: "00e5b77f-1455-4666-a632-c942cecd69c0", _type: "service" },
  { _id: "3c3bf3ea-35ef-439e-807b-0f2fc71f97f0", _type: "service" },
  { _id: "3e5017ad-6529-4b9e-8c26-2eb78776dfe4", _type: "service" },
  { _id: "716f52ad-e604-4cb8-9286-563e978cc1b8", _type: "service" },
  { _id: "4926502b-e68e-432f-a120-0f5dc466f686", _type: "testimonial" },
  { _id: "81435ddc-0355-4ef5-ad21-c119ba609e0d", _type: "testimonial" },
  { _id: "f1ba9f1d-d1c6-4bf3-a64d-2b439052df87", _type: "testimonial" },
  { _id: "f7ca9f12-98eb-4e9a-8aea-dbd56a747045", _type: "testimonial" },
  { _id: "96daa5fc-79a0-401a-9de3-6073f711613d", _type: "redirect" },
  {
    _id: "image-5ed1d35296dd94e5c196920b1fc3b99013f834d9-1280x720-jpg",
    _type: "sanity.imageAsset",
  },
  {
    _id: "image-a6d524ff81683971bdf20ec97725ffc549d66b8b-1280x720-jpg",
    _type: "sanity.imageAsset",
  },
  {
    _id: "image-d7fe3736a72151440c24f5aebd627540f57a6c19-1280x720-jpg",
    _type: "sanity.imageAsset",
  },
] as const;

export const OBSOLETE_DOCUMENT_IDS = OBSOLETE_DOCUMENTS.map(
  (document) => document._id,
);

export function obsoleteDocumentType(id: string): string {
  const found = OBSOLETE_DOCUMENTS.find((document) => document._id === id);
  if (!found) {
    throw new Error(`Identyfikator spoza listy usunięć: ${id}.`);
  }
  return found._type;
}

const OBJECT_TYPES: Record<string, string> = {
  faq: "faqSection",
  landing: "ebookLanding",
  seo: "seo",
  defaultSeo: "seo",
  blogIndex: "blogIndexSettings",
  blogNewsletter: "blogNewsletterSettings",
  headerCta: "actionLink",
};

interface RewriteContext {
  type: string;
  language: string;
  keepPlaceholder: boolean;
}

export function formFieldLabelMax(source: string): number {
  const marker = source.indexOf('name: "label"');
  if (marker < 0) {
    throw new Error("Schemat formularza nie ma pola label.");
  }
  const match = /max\((\d+)\)/.exec(source.slice(marker, marker + 600));
  if (!match?.[1]) {
    throw new Error("Schemat formularza nie ogranicza pola label.");
  }
  return Number(match[1]);
}

export function formSchemaKeepsPlaceholder(source: string): boolean {
  return source.includes('name: "placeholder"');
}

export function pairedDocumentId(id: string): string {
  if (id.endsWith("-pl")) return `${id.slice(0, -3)}-en`;
  if (id.endsWith("-en")) return `${id.slice(0, -3)}-pl`;
  const polish = id.indexOf("-pl-");
  if (polish !== -1) return `${id.slice(0, polish)}-en-${id.slice(polish + 4)}`;
  const english = id.indexOf("-en-");
  if (english !== -1) {
    return `${id.slice(0, english)}-pl-${id.slice(english + 4)}`;
  }
  throw new Error(`Brak pary językowej dla ${id}.`);
}

export function seoTitleWithinLimit(title: string, limit = 60): string {
  const trimmed = title.trim();
  if (trimmed.length <= limit) return trimmed;
  const cut = trimmed.slice(0, limit);
  const space = cut.lastIndexOf(" ");
  const prefix = (space > 40 ? cut.slice(0, space) : cut).replace(
    /[\s:.,;!?-]+$/u,
    "",
  );
  return prefix.length > 0 ? prefix : cut.trimEnd();
}

export function assertExactDeletions(ids: readonly string[]): void {
  const expected = new Set<string>(OBSOLETE_DOCUMENT_IDS);
  if (ids.length !== expected.size) {
    throw new Error(
      `Lista usunięć ma ${ids.length} identyfikatorów, oczekiwano ${expected.size}.`,
    );
  }
  const seen = new Set<string>();
  for (const id of ids) {
    if (id.startsWith("system.")) {
      throw new Error(
        `Usunięcie dokumentu systemowego jest zabronione: ${id}.`,
      );
    }
    if (!expected.has(id)) {
      throw new Error(`Transakcja usuwa dokument spoza listy: ${id}.`);
    }
    if (seen.has(id)) {
      throw new Error(`Identyfikator usunięcia powtórzył się: ${id}.`);
    }
    seen.add(id);
  }
}

export function missingDeletionIds(presentIds: readonly string[]): string[] {
  const present = new Set(presentIds);
  return OBSOLETE_DOCUMENT_IDS.filter((id) => !present.has(id));
}

export function buildDataset(plan: ContentLakePlan): SanityDocument[] {
  const pending = plan.pending.flatMap((item) =>
    item.kind === "form" ? [item.document] : [],
  );
  return [...plan.documents, ...pending];
}

export function mergeWithExport(
  generated: readonly SanityDocument[],
  exported: readonly SanityDocument[],
  deletions: readonly string[],
): SanityDocument[] {
  assertExactDeletions(deletions);
  const replaced = new Set(generated.map((document) => document._id));
  const removed = new Set<string>(deletions);
  const kept = exported.filter(
    (document) => !replaced.has(document._id) && !removed.has(document._id),
  );
  return [...kept, ...generated];
}

export function buildMutations(plan: ContentLakePlan): ContentLakeMutation[] {
  assertExactDeletions(plan.deletions);
  for (const document of plan.documents) {
    if (
      document._id.startsWith("system.") ||
      document._type === "sanity.previewUrlSecret" ||
      document._type.startsWith("system.")
    ) {
      throw new Error(`Transakcja rusza dokument systemowy ${document._id}.`);
    }
  }
  return [
    ...plan.deletions.map((id) => ({ delete: { id } })),
    ...plan.documents.map((document) => ({ createOrReplace: document })),
  ];
}

export function formsFitLabelMax(formLabelMax: number): boolean {
  return (["pl", "en"] as const).every(
    (language) => homepageCopy[language].consentLabel.length <= formLabelMax,
  );
}

export function assertWritable(plan: ContentLakePlan): void {
  const forms = plan.pending.filter((item) => item.kind === "form");
  if (forms.length > 0) {
    throw new Error(
      "Formularze newslettera nie mieszczą się w limicie etykiety zgody. --write nic nie wysyła.",
    );
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMedia(value: JsonRecord): boolean {
  if (typeof value.alt !== "string" || typeof value.src !== "string") {
    return false;
  }
  return (
    value.tone === "photo" ||
    value.tone === "diagram" ||
    value.tone === "portrait"
  );
}

function isEntity(value: JsonRecord): boolean {
  return (
    typeof value.id === "string" &&
    typeof value.language === "string" &&
    typeof value._type !== "string"
  );
}

function isAction(value: JsonRecord): boolean {
  if (typeof value.label !== "string" || typeof value.href !== "string") {
    return false;
  }
  if (typeof value.emphasis !== "string") return false;
  return Object.keys(value).every((key) =>
    ["label", "href", "emphasis", "_key", "_type"].includes(key),
  );
}

function toMedia(value: JsonRecord): JsonRecord {
  const media: JsonRecord = {
    _type: "mediaObject",
    alt: value.alt,
    tone: value.tone,
    rasterKey: value.src,
  };
  if (typeof value.caption === "string" && value.caption.trim()) {
    media.caption = value.caption;
  }
  if (isRecord(value.hotspot)) {
    const hotspot = value.hotspot;
    media.image = {
      _type: "image",
      hotspot: {
        _type: "sanity.imageHotspot",
        x: hotspot.x,
        y: hotspot.y,
        height: hotspot.height ?? 1,
        width: hotspot.width ?? 1,
      },
    };
  }
  return media;
}

function toReference(id: string, keyed: boolean): JsonRecord {
  const reference: JsonRecord = { _type: "reference", _ref: id };
  if (keyed) reference._key = id;
  return reference;
}

function memberType(key: string, type: string): string | undefined {
  if (key === "chapters") return "ebookChapter";
  if (key === "includedMaterials") return "ebookMaterial";
  if (key === "sources" && type === "ebook") return "ebookSource";
  return undefined;
}

function rewriteArray(
  items: unknown[],
  context: RewriteContext,
  key: string,
): unknown[] {
  const typed = memberType(key, context.type);
  const rewritten: unknown[] = [];
  items.forEach((item, index) => {
    const value = rewriteValue(item, context, true);
    if (value === undefined) return;
    if (!isRecord(value)) {
      rewritten.push(value);
      return;
    }
    if (typeof value._key !== "string") value._key = `k${index}`;
    if (typed && typeof value._type !== "string") value._type = typed;
    rewritten.push(value);
  });
  return rewritten;
}

function rewriteValue(
  value: unknown,
  context: RewriteContext,
  keyed: boolean,
): unknown {
  if (value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return rewriteArray(value, context, "");
  if (!isRecord(value)) return value;
  if (isEntity(value)) return toReference(value.id as string, keyed);
  if (isMedia(value)) return toMedia(value);
  if (isAction(value)) {
    return {
      _type: "actionLink",
      label: value.label,
      href: value.href,
      emphasis: value.emphasis,
    };
  }
  return rewriteFields(value, context);
}

function rewriteFields(value: JsonRecord, context: RewriteContext): JsonRecord {
  const output: JsonRecord = {};
  for (const [key, nested] of Object.entries(value)) {
    if (key === "id" || key === "authorName" || key === "translation") continue;
    if (key === "placeholder" && !context.keepPlaceholder) continue;
    if (key === "authors" && Array.isArray(nested)) {
      const authorId = `author-ola-${context.language}`;
      output.authors = nested.map((_, index) => ({
        _key: index === 0 ? authorId : `${authorId}-${index}`,
        _type: "reference",
        _ref: authorId,
      }));
      continue;
    }
    const rewritten = Array.isArray(nested)
      ? rewriteArray(nested, context, key)
      : rewriteValue(nested, context, false);
    if (rewritten === undefined) continue;
    if (isRecord(rewritten) && OBJECT_TYPES[key]) {
      rewritten._type = OBJECT_TYPES[key];
    }
    output[key] = rewritten;
  }
  return output;
}

function toDocument(
  type: string,
  fixture: JsonRecord,
  keepPlaceholder: boolean,
): SanityDocument {
  if (typeof fixture.id !== "string" || typeof fixture.language !== "string") {
    throw new Error(`Fixture ${type} nie ma id albo języka.`);
  }
  const fields = rewriteFields(fixture, {
    type,
    language: fixture.language,
    keepPlaceholder,
  });
  const document: SanityDocument = {
    ...fields,
    _id: fixture.id,
    _type: type,
  };
  if (type === "article" && isRecord(document.media)) {
    document.image = document.media;
    delete document.media;
  }
  if (type === "article") {
    const placeholder = !/^article-blog-01-/.test(document._id);
    document.placeholderBody = placeholder;
    if (isRecord(document.seo) && typeof document.seo.title === "string") {
      document.seo.title = seoTitleWithinLimit(document.seo.title);
    }
    if (
      isRecord(document.seo) &&
      typeof document.seo.description === "string" &&
      document.seo.description.length > 160
    ) {
      document.seo.description = seoTitleWithinLimit(
        document.seo.description,
        160,
      );
    }
  }
  if (typeof document.slug === "string") {
    document.slug = { _type: "slug", current: document.slug };
  }
  return document;
}

function ebookFixturesForDocuments(language: "pl" | "en"): JsonRecord[] {
  const landing = pcosEbookFixture(language);
  return ebookFixtures(language).map((card) => {
    const author = { id: `author-ola-${language}`, language };
    if (card.id !== landing.id) return { ...card, author };
    return { ...card, ...landing, author: landing.author };
  });
}

function linkTranslations(documents: SanityDocument[]): void {
  const ids = new Set(documents.map((document) => document._id));
  for (const document of documents) {
    const pair = pairedDocumentId(document._id);
    if (ids.has(pair)) {
      document.translation = { _type: "reference", _ref: pair };
    } else {
      delete document.translation;
    }
  }
}

export function buildContentLakePlan(gate: ContentLakeGate): ContentLakePlan {
  const languages = ["pl", "en"] as const;
  const keepPlaceholder = gate.keepPlaceholder;
  const documents: SanityDocument[] = [];

  for (const language of languages) {
    documents.push(
      toDocument("author", aboutAuthorFixture(language), keepPlaceholder),
      toDocument("service", serviceFixture(language), keepPlaceholder),
      toDocument(
        "siteSettings",
        { ...homepageSettingsFixture(language), blogIndex: undefined },
        keepPlaceholder,
      ),
      toDocument("page", homepagePageFixture(language), keepPlaceholder),
      toDocument("page", aboutPageFixture(language), keepPlaceholder),
      toDocument("page", contactPageFixture(language), keepPlaceholder),
      toDocument("form", contactFormFixture(language), keepPlaceholder),
      toDocument("page", consultationPageFixture(language), keepPlaceholder),
      toDocument("page", ebookCollectionPageFixture(language), keepPlaceholder),
      toDocument("page", blogCollectionPageFixture(language), keepPlaceholder),
    );
    for (const category of demonstrationCategories[language]) {
      documents.push(toDocument("category", category, keepPlaceholder));
    }
    for (const testimonial of testimonialFixtures(language)) {
      documents.push(toDocument("testimonial", testimonial, keepPlaceholder));
    }
    for (const ebook of ebookFixturesForDocuments(language)) {
      documents.push(toDocument("ebook", ebook, keepPlaceholder));
    }
    for (const article of fixtureArticlesForLanguage(language)) {
      documents.push(toDocument("article", article, keepPlaceholder));
    }
  }

  const pending: PendingItem[] = [];
  const formDocuments = languages.map((language) =>
    toDocument("form", newsletterFormFixture(language), keepPlaceholder),
  );
  if (formsFitLabelMax(gate.formLabelMax)) {
    documents.push(...formDocuments);
  } else {
    for (const document of formDocuments) {
      pending.push({ kind: "form", document });
    }
  }

  if (gate.legalPages) {
    for (const page of gate.legalPages) {
      documents.push(toDocument("legalPage", page, keepPlaceholder));
    }
  } else {
    pending.push({ kind: "legalPage" });
  }

  linkTranslations([
    ...documents,
    ...pending.flatMap((item) => (item.kind === "form" ? [item.document] : [])),
  ]);

  const obsolete = new Set<string>(OBSOLETE_DOCUMENT_IDS);
  const ids = new Set<string>();
  for (const document of documents) {
    if (ids.has(document._id)) {
      throw new Error(`Powtórzony identyfikator ${document._id}.`);
    }
    ids.add(document._id);
    if (obsolete.has(document._id)) {
      throw new Error(
        `Nowy dokument używa identyfikatora do usunięcia ${document._id}.`,
      );
    }
  }

  const deletions = [...OBSOLETE_DOCUMENT_IDS];
  assertExactDeletions(deletions);
  return { deletions, documents, pending };
}

export function placeholderArticles(plan: ContentLakePlan): SanityDocument[] {
  return plan.documents.filter(
    (document) =>
      document._type === "article" && document.placeholderBody === true,
  );
}

export const PLACEHOLDER_ARTICLE_SLUGS = BLOG_ARTICLE_SEED.filter(
  (seed) => seed.key !== "01",
).map((seed) => ({
  key: seed.key,
  pl: seed.pl.slug,
  en: seed.en.slug,
  plTitle: seed.pl.title,
  enTitle: seed.en.title,
}));

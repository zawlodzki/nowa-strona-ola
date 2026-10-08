#!/usr/bin/env node
/**
 * Dry-run import of the featured Article3a fields.
 * Usage: node scripts/import-article.mjs
 * --write exits 2. This script does not publish to Content Lake.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");

const faq = {
  pl: {
    title: "Pytania przed pierwszą konsultacją.",
    lead: "Krótko o tym, jak przygotować się do rozmowy.",
    items: [
      "Czy przed konsultacją muszę przygotować idealny jadłospis?",
      "Jakie informacje warto zebrać przed rozmową?",
      "Co zrobić, jeśli nie mam wszystkich dokumentów?",
      "Jak przygotować listę pytań na konsultację?",
    ],
  },
  en: {
    title: "Questions before the first consultation.",
    lead: "A short note on how to prepare for the conversation.",
    items: [
      "Do I need a perfect meal plan before the consultation?",
      "What information is worth gathering before the conversation?",
      "What if I do not have every document?",
      "How do I prepare a list of questions for the consultation?",
    ],
  },
};

const ebooks = {
  pl: [
    "ebook-suplementy-w-pcos-pl",
    "ebook-badania-ktore-maja-sens-pl",
    "ebook-szczupla-a-jednak-pcos-pl",
  ],
  en: [
    "ebook-suplementy-w-pcos-en",
    "ebook-badania-ktore-maja-sens-en",
    "ebook-szczupla-a-jednak-pcos-en",
  ],
};

function patch(language) {
  const pl = language === "pl";
  return {
    _id: pl ? "article-blog-01-pl" : "article-blog-01-en",
    _type: "article",
    language,
    slug: pl
      ? "przygotowanie-do-konsultacji-pcos"
      : "preparing-for-a-pcos-nutrition-consultation",
    breadcrumbTitle: pl
      ? "Przygotowanie do konsultacji"
      : "Preparing for a consultation",
    proposalNote: pl
      ? "Przykładowy artykuł i daty do oceny makiety. Treść wymaga akceptacji redakcyjnej."
      : "Sample article and dates for reviewing the layout. The copy needs editorial approval.",
    publishedAt: "2026-09-28T08:00:00.000Z",
    updatedAt: "2026-10-06T08:00:00.000Z",
    related: pl
      ? ["article-blog-02-pl", "article-blog-03-pl"]
      : ["article-blog-02-en", "article-blog-03-en"],
    relatedEbooks: ebooks[language].map((id) => ({
      _type: "reference",
      _ref: id,
    })),
    faq: {
      _type: "faqSection",
      title: faq[language].title,
      lead: faq[language].lead,
      items: faq[language].items.map((question, index) => ({
        _key: `faq-${index + 1}`,
        question,
      })),
    },
    bodySource: "src/content/article-featured.ts",
  };
}

const docs = [patch("pl"), patch("en")];

if (write) {
  console.error(
    "Zapis do Content Lake jest zablokowany w tym skrypcie bez osobnego zlecenia publikacji. Uruchom bez --write.",
  );
  process.exit(2);
}

const report = {
  mode: "dry-run",
  documentCount: docs.length,
  stableIds: docs.map((doc) => ({ id: doc._id, type: doc._type })),
  ebookRefs: docs.map((doc) => ({
    id: doc._id,
    relatedEbooks: doc.relatedEbooks.map((item) => item._ref),
  })),
  gaps: [
    "Treść Portable Text jest w fixture src/content/article-featured.ts. Ten skrypt nie wysyła bloków do Content Lake.",
    "Biogram autorki zostaje przy wspólnym dokumencie author. Ramka artykułu w makiecie jest dłuższa.",
  ],
  note: "Paczka Article3a. Trzy e-booki albo puste pole. FAQ opcjonalne. Źródła puste.",
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "article-3a-import.ndjson");
const reportPath = join(outDir, "article-3a-import-dry-run.json");
await writeFile(
  ndjsonPath,
  docs.map((doc) => JSON.stringify(doc)).join("\n") + "\n",
);
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify({ ok: true, ndjson: ndjsonPath, report: reportPath }, null, 2),
);

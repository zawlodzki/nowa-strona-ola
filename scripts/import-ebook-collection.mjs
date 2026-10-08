#!/usr/bin/env node
/**
 * Dry-run import kolekcji e-booków 3a.
 * Nie duplikuje dokumentów ebook — tylko strona kolekcji z referencją formularza.
 * Użycie: node scripts/import-ebook-collection.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
const compare = !process.argv.includes("--skip-compare");

const EBOOK_IDS = [
  "ebook-suplementy-w-pcos-pl",
  "ebook-badania-ktore-maja-sens-pl",
  "ebook-szczupla-a-jednak-pcos-pl",
  "ebook-waga-cie-oklamuje-pl",
  "ebook-czy-to-juz-pl",
  "ebook-noc-zaczyna-sie-o-osiemnastej-pl",
  "ebook-suplementy-w-pcos-en",
  "ebook-badania-ktore-maja-sens-en",
  "ebook-szczupla-a-jednak-pcos-en",
  "ebook-waga-cie-oklamuje-en",
  "ebook-czy-to-juz-en",
  "ebook-noc-zaczyna-sie-o-osiemnastej-en",
];

const GAPS = [
  {
    id: "collection-copy",
    status: "provisional",
    detail:
      "Copy i UX kolekcji (tytuł, lead, filtry, pusty stan) są propozycją z mockupu ebooks-3a.html, nie zatwierdzoną treścią publikacji.",
  },
  {
    id: "product-reuse",
    status: "open",
    detail:
      "Kolekcja nie kopiuje produktów. Karty biorą te same dokumenty ebook co homepage i landing. Ten skrypt nie tworzy drugiego zestawu e-booków.",
  },
  {
    id: "en-copy",
    status: "provisional",
    detail:
      "Tłumaczenie EN kolekcji jest robocze. Slug EN to ebooks; brak polskiego fallbacku pod /en/ebooks/.",
  },
  {
    id: "content-lake-write",
    status: "open",
    detail:
      "Dokumenty page-ebook-collection-pl/en nie są zapisane w Content Lake. Ten skrypt tworzy wyłącznie raport dry-run.",
  },
];

function now() {
  return new Date().toISOString();
}

function reference(id) {
  return { _type: "reference", _ref: id };
}

function collectionPage(language) {
  const pl = language === "pl";
  return {
    _id: `page-ebook-collection-${language}`,
    _type: "page",
    language,
    title: pl
      ? "E-booki | Aleksandra Olesiewicz"
      : "E-books | Aleksandra Olesiewicz",
    slug: { _type: "slug", current: pl ? "ebooki" : "ebooks" },
    translation: reference(`page-ebook-collection-${pl ? "en" : "pl"}`),
    seo: {
      _type: "seo",
      title: pl
        ? "E-booki | Aleksandra Olesiewicz"
        : "E-books | Aleksandra Olesiewicz",
      description: pl
        ? "Kolekcja e-booków o PCOS i perimenopauzie. Copy jest propozycją do zatwierdzenia."
        : "E-book collection on PCOS and perimenopause. Copy is a proposal pending approval.",
    },
    sections: [
      {
        _key: "collection-intro",
        _type: "ebookCollectionSection",
        variant: "cherry3a",
        title: pl
          ? "Więcej jasności.\nW Twoim tempie."
          : "More clarity.\nAt your pace.",
        lead: pl
          ? "PCOS, perimenopauza i codzienne wybory. E-booki, do których możesz wracać, kiedy potrzebujesz uporządkować pytania i znaleźć swój następny krok."
          : "PCOS, perimenopause and everyday choices. E-books you can return to when you need to sort your questions and find your next step.",
        catalogTitle: pl ? "Wszystkie e-booki" : "All e-books",
        catalogLead: pl
          ? "Wybierz to, co jest Ci teraz bliskie."
          : "Choose what feels close right now.",
        findTopicLabel: pl ? "Znajdź swój temat" : "Find your topic",
        cardActionLabel: pl ? "Poznaj temat" : "Explore the topic",
        note: pl
          ? "Zapowiedzi e-booków. Tytuły i okładki są propozycją; materiały są w przygotowaniu."
          : "E-book announcements. Titles and covers are a proposal; the materials are being prepared.",
        emptyMessage: pl
          ? "W tej chwili nie ma opublikowanych e-booków. Gdy pojawią się materiały, zobaczysz je w tej kolekcji."
          : "There are no published e-books yet. When materials are ready, they will appear in this collection.",
        emptyCategoryMessage: pl
          ? "W tej kategorii nie ma jeszcze e-booków. Wybierz inną kategorię albo wróć do pełnej kolekcji."
          : "There are no e-books in this category yet. Choose another category or return to the full collection.",
      },
      {
        _key: "collection-newsletter",
        _type: "formSection",
        title: pl
          ? "Mniej sprzecznych rad.\nWięcej konkretów."
          : "Fewer conflicting tips.\nMore specifics.",
        lead: pl
          ? "Piszę o PCOS, insulinooporności i codziennym odżywianiu. Dzielę się wskazówkami do wykorzystania przy zwykłym posiłku i informuję o nowych materiałach, także o perimenopauzie."
          : "I write about PCOS, insulin resistance and everyday nutrition. I share notes you can use at an ordinary meal and I send updates about new materials, including perimenopause.",
        form: reference(pl ? "form-newsletter-pl" : "form-newsletter-en"),
      },
    ],
  };
}

function documents() {
  return [collectionPage("pl"), collectionPage("en")];
}

async function compareExisting(docs) {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  const projectId =
    process.env.SANITY_PROJECT_ID ?? process.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset =
    process.env.SANITY_DATASET ??
    process.env.PUBLIC_SANITY_DATASET ??
    "production";
  if (!token || !projectId) {
    return {
      compared: false,
      reason: "Brak tokenu lub projectId — porównanie Content Lake pominięte.",
      existing: [],
    };
  }
  try {
    const { createClient } = await import("@sanity/client");
    const client = createClient({
      projectId,
      dataset,
      token,
      apiVersion: "2026-09-13",
      useCdn: false,
    });
    const ids = docs.map((doc) => doc._id);
    const existing = await client.fetch(
      "*[_id in $ids]{_id, _updatedAt, _type}",
      {
        ids,
      },
    );
    return { compared: true, existing };
  } catch (error) {
    return {
      compared: false,
      reason: `Porównanie nieudane: ${error instanceof Error ? error.message : String(error)}`,
      existing: [],
    };
  }
}

const docs = documents();
if (write) {
  console.error(
    "Zapis do Content Lake jest zablokowany w tym skrypcie bez osobnego zlecenia publikacji. Uruchom bez --write.",
  );
  process.exit(2);
}

const comparison = compare
  ? await compareExisting(docs)
  : { compared: false, existing: [], reason: "pominięte" };
const report = {
  mode: "dry-run",
  generatedAt: now(),
  documentCount: docs.length,
  stableIds: docs.map((doc) => ({ id: doc._id, type: doc._type })),
  references: ["form-newsletter-pl", "form-newsletter-en", ...EBOOK_IDS],
  reusedEbookDocuments: EBOOK_IDS,
  duplicatedProducts: false,
  gaps: GAPS,
  comparison,
  note: "Strona kolekcji nie zawiera tablicy produktów. Renderer pobiera wszystkie opublikowane dokumenty ebook w języku strony. Copy kolekcji jest propozycją.",
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "ebook-collection-3a-import.ndjson");
const reportPath = join(outDir, "ebook-collection-3a-import-dry-run.json");
await writeFile(
  ndjsonPath,
  docs.map((doc) => JSON.stringify(doc)).join("\n") + "\n",
);
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    {
      ok: true,
      ndjson: ndjsonPath,
      report: reportPath,
      documents: docs.length,
      write: false,
      compared: comparison.compared,
    },
    null,
    2,
  ),
);

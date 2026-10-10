#!/usr/bin/env node
/**
 * Dry-run import szkiców landingu konsultacji 3a.
 * Domyślnie nic nie zapisuje do Content Lake.
 * Użycie: node scripts/import-consultation-content.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
const compare = !process.argv.includes("--skip-compare");

const GAPS = [
  {
    id: "written-summary",
    status: "open",
    detail:
      "Nie wiadomo, czy po spotkaniu jest pisemne podsumowanie. Copy nie obiecuje PDF, listy badań ani dodatkowej opieki.",
  },
  {
    id: "service-scope",
    status: "provisional",
    detail:
      "Przebieg, FAQ i zakres usługi są propozycją copy, nie potwierdzonym regulaminem. Nagłówek „60 minut” w przebiegu powtarza durationMinutes jako tekst.",
  },
  {
    id: "contact-page",
    status: "open",
    detail:
      "Brak osobnej strony kontaktu. Landing nie linkuje do kontaktu; pytania kieruje do FAQ i rezerwacji.",
  },
  {
    id: "en-copy",
    status: "provisional",
    detail:
      "Tłumaczenie EN landingu konsultacji jest robocze, nie zaakceptowane do publikacji.",
  },
  {
    id: "content-lake-write",
    status: "open",
    detail:
      "Dokumenty page-consultation-pl/en nie są zapisane w Content Lake. Ten skrypt tworzy wyłącznie raport dry-run; zapis i publikacja wymagają osobnego zlecenia.",
  },
];

function now() {
  return new Date().toISOString();
}

function reference(id) {
  return { _type: "reference", _ref: id };
}

function consultationPage(language, created) {
  const pl = language === "pl";
  return {
    _id: `page-consultation-${language}`,
    _type: "page",
    language,
    title: pl
      ? "Konsultacje — Aleksandra Olesiewicz"
      : "Consultations — Aleksandra Olesiewicz",
    slug: { _type: "slug", current: pl ? "konsultacje" : "consultations" },
    seo: {
      title: pl
        ? "Konsultacja dietetyczna 1:1 | Aleksandra Olesiewicz"
        : "1:1 dietetic consultation | Aleksandra Olesiewicz",
      description: pl
        ? "Pojedyncza konsultacja dietetyczna online z Aleksandrą Olesiewicz. PCOS, insulinooporność i odżywianie dopasowane do Ciebie."
        : "A single online dietetic consultation with Aleksandra Olesiewicz. PCOS, insulin resistance and nutrition fitted to you.",
    },
    translation: reference(
      pl ? "page-consultation-en" : "page-consultation-pl",
    ),
    _createdNote: created,
    sections: [
      {
        _key: "consultation-hero",
        _type: "heroSection",
        variant: "split",
      },
      { _key: "consultation-path", _type: "listSection" },
      {
        _key: "consultation-problem",
        _type: "textImageSection",
        variant: "questions",
      },
      {
        _key: "consultation-audience",
        _type: "cardsSection",
        variant: "situations",
      },
      { _key: "consultation-process", _type: "processSection" },
      {
        _key: "consultation-outcomes",
        _type: "cardsSection",
        variant: "goals",
      },
      {
        _key: "consultation-expert",
        _type: "expertSection",
        metric: { value: 450, suffix: "+" },
        person: reference(`author-ola-${language}`),
      },
      {
        _key: "consultation-offer",
        _type: "serviceOfferSection",
        service: reference(`service-consultation-${language}`),
      },
      {
        _key: "consultation-testimonials",
        _type: "testimonialsSection",
        items: [
          reference(`testimonial-${language}-4`),
          reference(`testimonial-${language}-6`),
        ],
      },
      { _key: "consultation-faq", _type: "faqSection" },
    ],
  };
}

function documents() {
  const created = now();
  return [consultationPage("pl", created), consultationPage("en", created)];
}

async function compareExisting(docs) {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!projectId || !dataset || !token) {
    return {
      compared: false,
      reason:
        "Brak PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_DATASET / SANITY_API_READ_TOKEN. Nie odczytano Content Lake.",
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
    const ids = [
      ...docs.map((doc) => doc._id),
      "service-consultation-pl",
      "service-consultation-en",
    ];
    const existing = await client.fetch(
      "*[_id in $ids]{_id, _updatedAt, _type}",
      { ids },
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
  references: [
    "service-consultation-pl",
    "service-consultation-en",
    "author-ola-pl",
    "author-ola-en",
    "testimonial-pl-4",
    "testimonial-pl-6",
    "testimonial-en-4",
    "testimonial-en-6",
  ],
  gaps: GAPS,
  comparison,
  note: "Fixture konsultacji nie jest dowodem zapisu do CMS. Cena 450 PLN i 60 minut pozostają wyłącznie w dokumencie service-consultation-*, który tworzy import:homepage; ten skrypt go nie duplikuje.",
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "consultation-3a-import.ndjson");
const reportPath = join(outDir, "consultation-3a-import-dry-run.json");
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

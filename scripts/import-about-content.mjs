#!/usr/bin/env node
/**
 * Dry-run import szkiców strony O mnie 3a.
 * Domyślnie nic nie zapisuje do Content Lake.
 * Użycie: node scripts/import-about-content.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
const compare = !process.argv.includes("--skip-compare");

const GAPS = [
  {
    id: "diploma-scan",
    status: "open",
    detail:
      "Brak skanu dyplomu. author.diplomaScan jest puste; renderer pokazuje miejsce do uzupełnienia, bez fikcyjnego pliku.",
  },
  {
    id: "booking-url",
    status: "open",
    detail:
      "Właściwy URL płatnej rezerwacji nieustalony; fixture używa tymczasowego https://cal.com i bookingStatus=placeholder.",
  },
  {
    id: "contact-page",
    status: "open",
    detail:
      "Odnośnik „Masz pytanie? Przejdź do kontaktu” prowadzi tymczasowo do homepage #konsultacje. Brak osobnej strony kontaktu.",
  },
  {
    id: "en-copy",
    status: "provisional",
    detail:
      "Tłumaczenie EN strony O mnie jest robocze, nie zaakceptowane do publikacji.",
  },
  {
    id: "ebook-collection-route",
    status: "deferred",
    detail:
      "Materiały e-booków prowadzą do kolekcji /ebooki/ (pakiet 5).",
  },
];

function now() {
  return new Date().toISOString();
}

function documents() {
  const created = now();
  const authorPl = {
    _id: "author-ola-pl",
    _type: "author",
    language: "pl",
    name: "Aleksandra Olesiewicz",
    slug: { _type: "slug", current: "aleksandra-olesiewicz" },
    role: "Dietetyczka kliniczna",
    bio: "Dietetyczka kliniczna. Specjalizuje się w PCOS i insulinooporności.",
    educationInstitution: "Śląski Uniwersytet Medyczny",
    educationProgram: "Dietetyka kliniczna",
    translation: { _type: "reference", _ref: "author-ola-en" },
  };
  const authorEn = {
    ...authorPl,
    _id: "author-ola-en",
    language: "en",
    role: "Clinical dietitian",
    bio: "Clinical dietitian. Specialises in PCOS and insulin resistance.",
    educationProgram: "Clinical dietetics",
    translation: { _type: "reference", _ref: authorPl._id },
  };

  function aboutPage(language) {
    const pl = language === "pl";
    return {
      _id: `page-about-${language}`,
      _type: "page",
      language,
      title: pl
        ? "O mnie — Aleksandra Olesiewicz"
        : "About — Aleksandra Olesiewicz",
      slug: { _type: "slug", current: pl ? "o-mnie" : "about" },
      seo: {
        title: pl
          ? "O mnie — Aleksandra Olesiewicz | dietetyczka kliniczna"
          : "About — Aleksandra Olesiewicz | clinical dietitian",
        description: pl
          ? "Poznaj Aleksandrę Olesiewicz — dietetyczkę kliniczną, absolwentkę Śląskiego Uniwersytetu Medycznego."
          : "Meet Aleksandra Olesiewicz, a clinical dietitian and graduate of the Medical University of Silesia.",
      },
      translation: {
        _type: "reference",
        _ref: pl ? "page-about-en" : "page-about-pl",
      },
      _createdNote: created,
      sections: [
        { _key: "about-hero", _type: "heroSection", variant: "split" },
        { _key: "about-story", _type: "textSection" },
        {
          _key: "about-metric",
          _type: "metricsSection",
          variant: "approach",
        },
        {
          _key: "about-credentials",
          _type: "credentialsSection",
          person: {
            _type: "reference",
            _ref: pl ? authorPl._id : authorEn._id,
          },
        },
        { _key: "about-approach", _type: "processSection" },
        {
          _key: "about-testimonials",
          _type: "testimonialsSection",
          items: [
            {
              _type: "reference",
              _ref: `testimonial-${language}-4`,
            },
            {
              _type: "reference",
              _ref: `testimonial-${language}-6`,
            },
          ],
        },
        { _key: "about-materials", _type: "cardsSection", variant: "links" },
        {
          _key: "about-consultation",
          _type: "serviceOfferSection",
          service: {
            _type: "reference",
            _ref: pl ? "service-consultation-pl" : "service-consultation-en",
          },
        },
        {
          _key: "about-newsletter",
          _type: "formSection",
          form: {
            _type: "reference",
            _ref: pl ? "form-newsletter-pl" : "form-newsletter-en",
          },
        },
      ],
    };
  }

  return [authorPl, authorEn, aboutPage("pl"), aboutPage("en")];
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
    const ids = docs.map((doc) => doc._id);
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
  gaps: GAPS,
  comparison,
  note: "Fixture About nie jest dowodem zapisu do CMS. Skan dyplomu i URL rezerwacji pozostają lukami. Istniejące dokumenty autora trzeba zachować przed ewentualnym createOrReplace.",
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "about-3a-import.ndjson");
const reportPath = join(outDir, "about-3a-import-dry-run.json");
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

#!/usr/bin/env node
/**
 * Dry-run import of legalPage documents from converted HTML fixtures.
 * Usage: node scripts/import-legal.mjs
 * --write exits 2. This script does not publish to Content Lake.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");

async function loadBody(slug) {
  return JSON.parse(
    await readFile(
      join(root, "src/content/legal-bodies", `${slug}.json`),
      "utf8",
    ),
  );
}

function noticeBody(href, linkLabel) {
  return [
    {
      _type: "block",
      _key: "en-notice",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "This page does not include an English translation of the legal document. The binding version is the Polish text.",
          marks: [],
        },
      ],
      markDefs: [],
    },
    {
      _type: "block",
      _key: "en-notice-link",
      style: "normal",
      children: [{ _type: "span", text: linkLabel, marks: ["to-pl"] }],
      markDefs: [{ _type: "link", _key: "to-pl", href }],
    },
  ];
}

const [privacy, cookies, terms, newsletter] = await Promise.all([
  loadBody("polityka-prywatnosci"),
  loadBody("lista-cookies-i-identyfikatorow"),
  loadBody("regulamin"),
  loadBody("regulamin-newslettera"),
]);

const docs = [
  {
    _id: "legal-privacy-pl",
    _type: "legalPage",
    language: "pl",
    title: privacy.title,
    slug: { _type: "slug", current: "polityka-prywatnosci" },
    effectiveFrom: privacy.effectiveFrom,
    seo: {
      _type: "seo",
      title: "Polityka prywatności",
      description: privacy.seoDescription,
    },
    translation: { _type: "reference", _ref: "legal-privacy-en" },
    body: privacy.body,
  },
  {
    _id: "legal-privacy-en",
    _type: "legalPage",
    language: "en",
    title: "Privacy policy",
    slug: { _type: "slug", current: "privacy" },
    effectiveFrom: privacy.effectiveFrom,
    seo: {
      _type: "seo",
      title: "Privacy policy",
      description:
        "The binding version of this document is the Polish privacy policy.",
    },
    translation: { _type: "reference", _ref: "legal-privacy-pl" },
    body: noticeBody(
      "/polityka-prywatnosci/",
      "Read the Polish privacy policy",
    ),
  },
  {
    _id: "legal-terms-pl",
    _type: "legalPage",
    language: "pl",
    title: terms.title,
    slug: { _type: "slug", current: "regulamin" },
    effectiveFrom: terms.effectiveFrom,
    seo: {
      _type: "seo",
      title: "Regulamin",
      description: terms.seoDescription,
    },
    translation: { _type: "reference", _ref: "legal-terms-en" },
    body: terms.body,
  },
  {
    _id: "legal-terms-en",
    _type: "legalPage",
    language: "en",
    title: "Terms",
    slug: { _type: "slug", current: "terms" },
    effectiveFrom: terms.effectiveFrom,
    seo: {
      _type: "seo",
      title: "Terms",
      description: "The binding version of this document is the Polish terms.",
    },
    translation: { _type: "reference", _ref: "legal-terms-pl" },
    body: noticeBody("/regulamin/", "Read the Polish terms"),
  },
  {
    _id: "legal-cookies-pl",
    _type: "legalPage",
    language: "pl",
    title: cookies.title,
    slug: { _type: "slug", current: "lista-cookies-i-identyfikatorow" },
    effectiveFrom: cookies.effectiveFrom,
    seo: {
      _type: "seo",
      title: "Lista cookies i identyfikatorów",
      description: cookies.seoDescription,
    },
    body: cookies.body,
  },
  {
    _id: "legal-newsletter-pl",
    _type: "legalPage",
    language: "pl",
    title: newsletter.title,
    slug: { _type: "slug", current: "regulamin-newslettera" },
    effectiveFrom: newsletter.effectiveFrom,
    seo: {
      _type: "seo",
      title: "Regulamin newslettera",
      description: newsletter.seoDescription,
    },
    body: newsletter.body,
  },
];

if (write) {
  console.error(
    "Zapis do Content Lake jest zablokowany w tym skrypcie bez osobnego zlecenia publikacji. Uruchom bez --write.",
  );
  process.exit(2);
}

const report = {
  mode: "dry-run",
  documentCount: docs.length,
  stableIds: docs.map((doc) => ({
    id: doc._id,
    type: doc._type,
    slug: doc.slug.current,
  })),
  sources: {
    polityka: "https://www.zawlodzki.pl/polityka-prywatnosci",
    cookies: "https://www.zawlodzki.pl/lista-cookies-i-identyfikatorow",
    regulamin: "https://www.zawlodzki.pl/regulamin",
    newsletter: "https://www.zawlodzki.pl/regulamin-newslettera",
  },
  gaps: [
    "EN nie ma źródła prawnego — dokumenty privacy/terms mają tylko informację, że wiążąca jest wersja PL.",
    "Treść PL pochodzi ze spółki Wellbiz / zawlodzki.pl (B2B) i wymaga redakcji B2C przed produkcją.",
    "Ten skrypt nie wysyła dokumentów do Content Lake.",
  ],
};

const outDir = join(root, "reports");
await mkdir(outDir, { recursive: true });
const ndjsonPath = join(outDir, "legal-import.ndjson");
const reportPath = join(outDir, "legal-import-dry-run.json");
await writeFile(
  ndjsonPath,
  docs.map((doc) => JSON.stringify(doc)).join("\n") + "\n",
);
await writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify({ ok: true, ndjson: ndjsonPath, report: reportPath }, null, 2),
);

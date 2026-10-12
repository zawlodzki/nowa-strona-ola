import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  buildContentLakePlan,
  formFieldLabelMax,
  formSchemaKeepsPlaceholder,
} from "../src/sanity/content-lake-plan";
import { additionalEbookLandings } from "../src/sanity/ebook-fixtures";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "output/ebook-landings-3a-2026-10-11");
const formSchema = readFileSync(
  path.join(root, "studio/schema-types/documents/form.ts"),
  "utf8",
);
const plan = buildContentLakePlan({
  formLabelMax: formFieldLabelMax(formSchema),
  keepPlaceholder: formSchemaKeepsPlaceholder(formSchema),
  legalPages: null,
});
const fields = [
  "chapters",
  "includedMaterials",
  "sources",
  "seo",
  "landing",
  "format",
];
const ids = [...additionalEbookLandings.keys()].map(
  (slug) => `ebook-${slug}-pl`,
);
const selected = plan.documents.filter((doc) => ids.includes(doc._id));
if (selected.length !== 5) throw new Error("Plan wymaga pięciu landingów PL.");
const patches = selected.map((document) => ({
  id: document._id,
  set: Object.fromEntries(fields.map((field) => [field, document[field]])),
}));
mkdirSync(output, { recursive: true });
writeFileSync(
  path.join(output, "patches.json"),
  `${JSON.stringify(patches, null, 2)}\n`,
);
writeFileSync(
  path.join(output, "proposed.ndjson"),
  `${selected.map((document) => JSON.stringify(document)).join("\n")}\n`,
);
console.log(
  JSON.stringify({
    mode: "dry-run",
    ids,
    fields,
    output,
    writesToSanity: false,
  }),
);

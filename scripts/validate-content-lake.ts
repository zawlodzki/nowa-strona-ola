import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { evaluate, parse } from "groq-js";
import { createSchema, validateDocument } from "sanity";

import { schemaTypes } from "../studio/schema-types/index.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const transactionFile = path.join(
  root,
  "reports",
  "content-lake-3a-validate.ndjson",
);
const datasetFile = path.join(root, "reports", "content-lake-3a.ndjson");

function readDocuments(file: string) {
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line) as { _id: string; _type: string });
}

const documents = readDocuments(transactionFile);
const dataset = readDocuments(datasetFile);
const ids = new Set(dataset.map((document) => document._id));
const schema = createSchema({ name: "default", types: schemaTypes });

const client = {
  fetch(query: string, params?: Record<string, unknown>) {
    return evaluate(parse(query), { dataset: documents, params }).then(
      (value) => value.get(),
    );
  },
  withConfig() {
    return client;
  },
};

const markers = [];
for (const document of documents) {
  const result = await validateDocument({
    document,
    workspace: { name: "default", schema },
    getDocumentExists: async ({ id }) =>
      ids.has(id.replace(/^drafts\./, "")) || ids.has(id),
    getClient: () => client,
    environment: "cli",
  });
  for (const marker of result) {
    if (marker.level === "error") {
      markers.push({
        id: document._id,
        level: marker.level,
        path: marker.path,
        message: marker.message,
      });
    }
  }
}

if (markers.length > 0) {
  console.error(JSON.stringify(markers.slice(0, 40), null, 2));
  console.error(`errors: ${markers.length}`);
  process.exit(1);
}
console.log(`validated ${documents.length} documents, errors: 0`);

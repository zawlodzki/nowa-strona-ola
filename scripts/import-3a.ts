import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { createClient } from "@sanity/client";

import {
  assertExactDeletions,
  assertWritable,
  buildContentLakePlan,
  buildDataset,
  buildMutations,
  formFieldLabelMax,
  formSchemaKeepsPlaceholder,
  mergeWithExport,
  missingDeletionIds,
  obsoleteDocumentType,
  type ContentLakePlan,
  type SanityDocument,
} from "../src/sanity/content-lake-plan.ts";

const root = path.resolve(import.meta.dirname, "..");
const projectId = "dyuqkn8c";

function flagValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function readToken(): string | undefined {
  const token =
    process.env.SANITY_API_WRITE_TOKEN?.trim() ||
    process.env.SANITY_API_READ_TOKEN?.trim();
  return token || undefined;
}

function countByType(documents: SanityDocument[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const document of documents) {
    counts.set(document._type, (counts.get(document._type) ?? 0) + 1);
  }
  return counts;
}

function printCounts(label: string, documents: SanityDocument[]): void {
  const counts = [...countByType(documents).entries()].sort((left, right) =>
    left[0].localeCompare(right[0]),
  );
  for (const [type, count] of counts) {
    console.log(`${label} ${type} ${count}`);
  }
}

function summarize(
  plan: ContentLakePlan,
  existingIds: ReadonlySet<string> | null,
): void {
  if (existingIds) {
    printCounts(
      "create",
      plan.documents.filter((document) => !existingIds.has(document._id)),
    );
    printCounts(
      "replace",
      plan.documents.filter((document) => existingIds.has(document._id)),
    );
  } else {
    printCounts("createOrReplace", plan.documents);
  }
  const forms = plan.pending.filter((item) => item.kind === "form");
  if (forms.length > 0) {
    console.log(
      `pending form ${forms.length} (etykieta zgody jest dłuższa niż limit schematu)`,
    );
  }
  if (plan.pending.some((item) => item.kind === "legalPage")) {
    console.log("pending legalPage (brak schematu legalPage albo fixture’ów)");
  }
}

function parseExported(line: string): SanityDocument {
  const value: unknown = JSON.parse(line);
  if (
    typeof value !== "object" ||
    value === null ||
    !("_id" in value) ||
    !("_type" in value) ||
    typeof value._id !== "string" ||
    typeof value._type !== "string"
  ) {
    throw new Error("Eksport NDJSON ma wiersz bez _id albo _type.");
  }
  return value as SanityDocument;
}

async function fetchIds(
  token: string,
  dataset: string,
  ids: string[],
): Promise<string[]> {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-09-01",
    token,
    useCdn: false,
  });
  const found = await client.fetch<string[] | null>("*[_id in $ids]._id", {
    ids,
  });
  return found ?? [];
}

async function loadLegalPages(): Promise<Record<string, unknown>[] | null> {
  const schemaIndex = readFileSync(
    path.join(root, "studio/schema-types/index.ts"),
    "utf8",
  );
  const legalPath = path.join(root, "src/sanity/legal-fixtures.ts");
  if (!schemaIndex.includes("legalPageType")) return null;
  try {
    readFileSync(legalPath, "utf8");
  } catch {
    return null;
  }
  const loaded = (await import(pathToFileURL(legalPath).href)) as {
    demonstrationLegalPages?: Record<string, Record<string, unknown>>;
  };
  if (!loaded.demonstrationLegalPages) {
    throw new Error(
      "legal-fixtures.ts nie eksportuje demonstrationLegalPages.",
    );
  }
  return Object.values(loaded.demonstrationLegalPages);
}

async function main() {
  const write = process.argv.includes("--write");
  const dataset = flagValue("--dataset");
  const formSource = readFileSync(
    path.join(root, "studio/schema-types/documents/form.ts"),
    "utf8",
  );
  const plan = buildContentLakePlan({
    formLabelMax: formFieldLabelMax(formSource),
    keepPlaceholder: formSchemaKeepsPlaceholder(formSource),
    legalPages: await loadLegalPages(),
  });
  assertExactDeletions(plan.deletions);

  const exportPath = process.env.SANITY_EXPORT_NDJSON;
  const directory = path.join(root, "reports");
  mkdirSync(directory, { recursive: true });
  const datasetFile = path.join(directory, "content-lake-3a.ndjson");
  const datasetDocuments = exportPath
    ? mergeWithExport(
        buildDataset(plan),
        readFileSync(exportPath, "utf8")
          .split("\n")
          .filter((line) => line.trim())
          .map(parseExported),
        plan.deletions,
      )
    : buildDataset(plan);
  writeFileSync(
    datasetFile,
    `${datasetDocuments.map((document) => JSON.stringify(document)).join("\n")}\n`,
  );
  writeFileSync(
    path.join(directory, "content-lake-3a-validate.ndjson"),
    `${plan.documents.map((document) => JSON.stringify(document)).join("\n")}\n`,
  );

  const token = readToken();
  let known: ReadonlySet<string> | null = null;
  if (token) {
    if (dataset !== "production") {
      throw new Error("Odczyt datasetu wymaga --dataset production.");
    }
    const present = await fetchIds(token, dataset, [...plan.deletions]);
    const missing = missingDeletionIds(present);
    if (missing.length > 0) {
      throw new Error(
        `Brakuje ${missing.length} dokumentów z listy usunięć. Pierwszy: ${missing[0]}.`,
      );
    }
    const ours = await fetchIds(
      token,
      dataset,
      plan.documents.map((document) => document._id),
    );
    known = new Set(ours);
    console.log(`compare: ${known.size} istniejących`);
  } else {
    console.log("compare: pominięte (brak tokenu)");
  }

  console.log(
    `${write ? "write" : "dry-run"} project=${projectId} dataset=${dataset ?? "(niepodany)"}`,
  );
  printCounts(
    "delete",
    plan.deletions.map((id) => ({ _id: id, _type: obsoleteDocumentType(id) })),
  );
  summarize(plan, known);
  const transactionFile = path.join(
    directory,
    "content-lake-3a-transaction.json",
  );
  writeFileSync(
    transactionFile,
    `${JSON.stringify(
      {
        projectId,
        dataset: dataset ?? null,
        dryRun: !write,
        mutations: buildMutations(plan),
      },
      null,
      2,
    )}\n`,
  );
  console.log(`transaction: ${path.relative(root, transactionFile)}`);
  console.log(`documents: ${plan.documents.length}`);
  console.log(`buildDataset: ${buildDataset(plan).length}`);

  if (!write) return;
  if (dataset !== "production") {
    throw new Error("--write wymaga --dataset production.");
  }
  const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (!writeToken) {
    throw new Error("--write wymaga SANITY_API_WRITE_TOKEN.");
  }
  assertWritable(plan);

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-09-01",
    token: writeToken,
    useCdn: false,
  });
  let transaction = client.transaction();
  for (const id of plan.deletions) transaction = transaction.delete(id);
  for (const document of plan.documents) {
    transaction = transaction.createOrReplace(document);
  }
  const result = await transaction.commit();
  console.log(`transactionId: ${result.transactionId}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Nieznany błąd.";
  console.error(message);
  process.exit(1);
});

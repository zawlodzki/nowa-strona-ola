/**
 * Targeted copy change of the 450+ metric: "women a year helped" becomes
 * "hours of training". Sets only these fields, by path:
 *   - page-home-pl/en          sections[home-approach].items[metric-450].label
 *   - page-about-pl/en         sections[about-metric].title and .items[about-metric-450].label
 *   - page-consultation-pl/en  sections[consultation-expert].metric.label
 * plus the same fields in drafts of these pages, if any. The number stays 450.
 *
 * Usage:
 *   npm run import:training-metric -- --dataset production          # dry run
 *   npm run import:training-metric -- --dataset production --simulate reports/training-metric-lake.ndjson
 *   SANITY_API_WRITE_TOKEN=… npm run import:training-metric -- --write --dataset production
 *
 * Dry run by default. Every patch carries ifRevisionID; everything is sent as
 * one transaction. A field holding unexpected copy stops the run. Before a
 * write the affected documents are backed up to --backup-dir (default
 * reports/sanity-backup). The token is never printed.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@sanity/client";

import type { SanityDocument } from "../src/sanity/content-lake-plan.ts";
import {
  applyMutations,
  buildMutations,
  planTrainingMetric,
  trainingMetricTargets,
} from "../src/sanity/training-metric-import.ts";

const root = path.resolve(import.meta.dirname, "..");
const projectId = "dyuqkn8c";
const apiVersion = "2026-09-01";

function flagValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function main() {
  const write = process.argv.includes("--write");
  const dataset = flagValue("--dataset");
  const simulateOut = flagValue("--simulate");
  const backupDir = path.resolve(
    flagValue("--backup-dir") ?? path.join(root, "reports", "sanity-backup"),
  );
  const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim() || undefined;
  const readToken =
    writeToken || process.env.SANITY_API_READ_TOKEN?.trim() || undefined;

  if (write && !dataset)
    throw new Error("--write wymaga jawnego --dataset <nazwa>.");
  if (write && !writeToken)
    throw new Error("--write wymaga SANITY_API_WRITE_TOKEN.");

  const targets = trainingMetricTargets();
  console.log(
    `${write ? "write" : "dry-run"} project=${projectId} dataset=${dataset ?? "(niepodany: tylko plan offline)"}`,
  );
  if (!dataset) {
    for (const target of targets)
      console.log(
        `plan ${target.id} ${target.path}: ${JSON.stringify(target.before)} → ${JSON.stringify(target.after)}`,
      );
    return;
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    ...(readToken
      ? { token: readToken, perspective: "raw" as const }
      : { perspective: "published" as const }),
  });
  console.log(
    `odczyt: ${readToken ? "raw (token, widać szkice)" : "published (bez tokenu, szkice niewidoczne)"}`,
  );
  const allDocuments = await client.fetch<SanityDocument[]>(
    `*[!(_id in path("versions.**"))]`,
  );
  const byId = new Map(allDocuments.map((doc) => [doc._id, doc]));

  const plan = planTrainingMetric(allDocuments, targets);
  const mutations = buildMutations(plan.patches);
  const datasetAfter = applyMutations(allDocuments, mutations);
  const after = planTrainingMetric(datasetAfter, targets);
  const problems = [
    ...plan.conflicts,
    ...after.patches.map((patch) => `${patch.id}: po zmianie nadal różni się`),
  ];

  for (const patch of plan.patches) {
    console.log(
      `patch ${patch.id}: set ifRevisionID=${patch.ifRevisionID ?? "-"}`,
    );
    for (const change of patch.changes)
      console.log(
        `  ${change.path}: ${JSON.stringify(change.from)} → ${JSON.stringify(change.to)}`,
      );
  }
  for (const where of plan.unchanged)
    console.log(`bez zmian (już nowe): ${where}`);
  if (!readToken) console.log("UWAGA: bez tokenu szkice są niewidoczne.");
  console.log(
    problems.length ? `PROBLEMY: ${problems.join("; ")}` : "kontrola: OK",
  );
  console.log(`mutacje w jednej transakcji: ${mutations.length}`);

  const reports = path.join(root, "reports");
  mkdirSync(reports, { recursive: true });
  const transactionFile = path.join(
    reports,
    "training-metric-transaction.json",
  );
  writeFileSync(
    transactionFile,
    `${JSON.stringify({ projectId, dataset, dryRun: !write, plan, problems, mutations }, null, 2)}\n`,
  );
  console.log(`transakcja: ${path.relative(root, transactionFile)}`);
  if (simulateOut) {
    const target = path.resolve(simulateOut);
    writeFileSync(
      target,
      `${datasetAfter
        .filter((doc) => !doc._id.startsWith("drafts."))
        .map((doc) => JSON.stringify(doc))
        .join("\n")}\n`,
    );
    console.log(`symulacja Content Lake: ${path.relative(root, target)}`);
  }

  if (!write) return;
  if (problems.length)
    throw new Error("Kontrola nie przeszła; zapis przerwany.");
  if (!mutations.length) {
    console.log("Nic do zapisania.");
    return;
  }
  mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(
    backupDir,
    `training-metric-${dataset}-${new Date().toISOString().replaceAll(":", "-")}.ndjson`,
  );
  writeFileSync(
    backupFile,
    `${plan.patches.map((patch) => JSON.stringify(byId.get(patch.id))).join("\n")}\n`,
  );
  console.log(`kopia zapasowa (${plan.patches.length} dok.): ${backupFile}`);

  const writer = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  });
  const result = await writer.mutate(mutations as never, {
    visibility: "sync",
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "write",
        dataset,
        transactionId: result.transactionId,
        mutations: mutations.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Nieznany błąd.");
  process.exit(1);
});

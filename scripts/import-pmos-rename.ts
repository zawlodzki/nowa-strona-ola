/**
 * Usage:
 *   npm run import:pmos-rename
 *   SANITY_API_READ_TOKEN=… npm run import:pmos-rename -- --dataset production
 *   SANITY_API_WRITE_TOKEN=… npm run import:pmos-rename -- --write --dataset production --backup-dir reports/sanity-backup
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@sanity/client";

import type { SanityDocument } from "../src/sanity/content-lake-plan.ts";
import { planPmosRename, type PatchValue } from "../src/sanity/pmos-rename.ts";

const root = path.resolve(import.meta.dirname, "..");
const projectId = "dyuqkn8c";
const apiVersion = "2026-09-01";

function flagValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function formatValue(value: PatchValue | null): string {
  if (value === null) return "(brak)";
  return typeof value === "string" ? value : JSON.stringify(value);
}

async function main() {
  const write = process.argv.includes("--write");
  const dataset = flagValue("--dataset");
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
  if (dataset && !readToken) {
    throw new Error(
      "--dataset wymaga SANITY_API_READ_TOKEN albo SANITY_API_WRITE_TOKEN (perspective raw).",
    );
  }

  console.log(
    `${write ? "write" : "dry-run"} project=${projectId} dataset=${dataset ?? "(niepodany)"}`,
  );
  if (!dataset) {
    console.log(
      "Odczyt Content Lake wymaga --dataset i tokenu (SANITY_API_READ_TOKEN albo SANITY_API_WRITE_TOKEN), perspective raw.",
    );
    console.log(
      "Bez tokenu nie ma podglądu szkiców. Zapis jest wyłączony. Nie wysyłam zapytania.",
    );
    return;
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token: readToken,
    useCdn: false,
    perspective: "raw",
  });
  console.log("odczyt: raw (token, widać szkice)");
  const fetched = await client.fetch<SanityDocument[] | null>(
    `*[!(_id in path("versions.**"))]`,
  );
  if (!Array.isArray(fetched)) {
    throw new Error("Odczyt datasetu nie zwrócił listy dokumentów.");
  }

  const plan = planPmosRename(fetched);
  for (const note of plan.notes) console.log(`uwaga: ${note}`);
  if (!plan.changes.length) console.log("brak zmian");
  for (const change of plan.changes) {
    console.log(`${change.id} ${change.path}`);
    console.log(`  przed: ${formatValue(change.before)}`);
    console.log(`  po:    ${formatValue(change.after)}`);
  }
  console.log(
    plan.drafts.length
      ? `szkice: ${plan.drafts.map((draft) => `${draft.id} (${draft.changed ? "zmiana" : "bez zmian"})`).join(", ")}`
      : "szkice: brak",
  );
  console.log(
    plan.problems.length
      ? `PROBLEMY: ${plan.problems.join("; ")}`
      : "kontrola: OK",
  );
  console.log(`mutacje w jednej transakcji: ${plan.mutations.length}`);

  if (!write) return;
  if (plan.problems.length) {
    throw new Error("Kontrola nie przeszła; zapis przerwany.");
  }
  if (!plan.mutations.length) {
    console.log("Nic do zapisania.");
    return;
  }

  const byId = new Map(fetched.map((doc) => [doc._id, doc]));
  const affected = plan.mutations.map((mutation) => mutation.patch.id);
  mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(
    backupDir,
    `pmos-${dataset}-${new Date().toISOString().replaceAll(":", "-")}.ndjson`,
  );
  writeFileSync(
    backupFile,
    `${affected.map((id) => JSON.stringify(byId.get(id))).join("\n")}\n`,
  );
  console.log(`kopia zapasowa (${affected.length} dok.): ${backupFile}`);

  const writer = createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  });
  const result = await writer.mutate(plan.mutations, {
    visibility: "sync",
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: "write",
        dataset,
        transactionId: result.transactionId,
        mutations: plan.mutations.length,
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

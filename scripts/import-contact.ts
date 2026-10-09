/**
 * Targeted import of the contact page (PR #53): writes ONLY
 *   - page-contact-pl / page-contact-en   (createIfNotExists)
 *   - form-contact-pl / form-contact-en   (createIfNotExists)
 *   - the "Kontakt"/"Contact" item in siteSettings-pl/en navigation (patch insert)
 *
 * Usage:
 *   npm run import:contact                                   # offline plan only
 *   npm run import:contact -- --dataset production           # dry run against the dataset
 *   npm run import:contact -- --dataset production --simulate reports/contact-lake.ndjson
 *   SANITY_API_WRITE_TOKEN=… npm run import:contact -- --write --dataset production
 *
 * Existing documents with different content are reported as conflicts and are
 * only replaced with --force. The nav patch is idempotent and guarded by the
 * document revision. Everything is sent as one transaction. The token is never
 * printed.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@sanity/client";

import {
  buildContentLakePlan,
  formFieldLabelMax,
  formSchemaKeepsPlaceholder,
  type SanityDocument,
} from "../src/sanity/content-lake-plan.ts";
import {
  CONTACT_DOCUMENTS,
  SETTINGS_IDS,
  applyMutations,
  buildContactImportPlan,
  buildMutations,
  buildNavPatch,
  findReferenceProblems,
  planDocumentActions,
  type NavPatchPlan,
} from "../src/sanity/contact-import.ts";

const root = path.resolve(import.meta.dirname, "..");
const projectId = "dyuqkn8c";
const apiVersion = "2026-09-01";

function flagValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function navLine(items: { label: string; href: string }[]): string {
  return items.map((item) => `${item.label} (${item.href})`).join(" · ");
}

async function main() {
  const write = process.argv.includes("--write");
  const force = process.argv.includes("--force");
  const dataset = flagValue("--dataset");
  const simulateOut = flagValue("--simulate");
  const writeToken = process.env.SANITY_API_WRITE_TOKEN?.trim() || undefined;
  const readToken =
    writeToken || process.env.SANITY_API_READ_TOKEN?.trim() || undefined;

  if (write && !dataset)
    throw new Error("--write wymaga jawnego --dataset <nazwa>.");
  if (write && !writeToken)
    throw new Error("--write wymaga SANITY_API_WRITE_TOKEN.");
  if (simulateOut && !dataset)
    throw new Error("--simulate wymaga --dataset <nazwa>.");

  const formSource = readFileSync(
    path.join(root, "studio/schema-types/documents/form.ts"),
    "utf8",
  );
  const plan = buildContactImportPlan(
    buildContentLakePlan({
      formLabelMax: formFieldLabelMax(formSource),
      keepPlaceholder: formSchemaKeepsPlaceholder(formSource),
      legalPages: null,
    }),
  );

  console.log(
    `${write ? "write" : "dry-run"} project=${projectId} dataset=${dataset ?? "(niepodany: tylko plan offline)"}`,
  );
  if (!dataset) {
    for (const doc of plan.documents)
      console.log(`plan ${doc._type} ${doc._id}`);
    for (const language of ["pl", "en"] as const) {
      const { item, afterKey } = plan.nav[language];
      console.log(
        `plan patch siteSettings ${SETTINGS_IDS[language]}: wstaw ${item._key} "${item.label}" ${item.href} po ${afterKey ?? "(koniec)"}`,
      );
    }
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
  const readMode = readToken
    ? "raw (token, widać szkice)"
    : "published (bez tokenu, szkice niewidoczne)";
  console.log(`odczyt: ${readMode}`);

  const allDocuments = await client.fetch<SanityDocument[]>(
    `*[!(_id in path("versions.**"))]`,
  );
  const published = allDocuments.filter(
    (doc) => !doc._id.startsWith("drafts."),
  );
  const byId = new Map(published.map((doc) => [doc._id, doc]));
  const watched = [
    ...CONTACT_DOCUMENTS.map((doc) => doc._id),
    ...Object.values(SETTINGS_IDS),
  ];
  const drafts = allDocuments
    .map((doc) => doc._id)
    .filter((id) => watched.some((watchedId) => id === `drafts.${watchedId}`));

  const actions = planDocumentActions(plan.documents, byId, force);
  const navPatches: NavPatchPlan[] = (["pl", "en"] as const).map((language) =>
    buildNavPatch(
      SETTINGS_IDS[language],
      byId.get(SETTINGS_IDS[language]),
      plan.nav[language].item,
      plan.nav[language].afterKey,
    ),
  );
  const conflicts = actions.filter((action) => action.action === "conflict");
  const mutations = conflicts.length
    ? null
    : buildMutations(plan, actions, navPatches);
  const datasetAfter = mutations
    ? applyMutations(published, mutations)
    : published;
  const problems = findReferenceProblems(plan, datasetAfter);

  for (const action of actions) {
    const verb =
      action.action === "create"
        ? "createIfNotExists"
        : action.action === "replace"
          ? "createOrReplace (--force)"
          : action.action;
    const fields = "fields" in action ? ` [${action.fields.join(", ")}]` : "";
    console.log(`${verb} ${action.type} ${action.id}${fields}`);
  }
  for (const patch of navPatches) {
    if (patch.action === "skip") {
      console.log(`skip patch siteSettings ${patch.id}: ${patch.reason}`);
      continue;
    }
    console.log(
      `patch siteSettings ${patch.id}: insert ${patch.item._key} po ${patch.afterKey ?? "(koniec)"} ifRevisionID=${patch.ifRevisionID ?? "-"}`,
    );
    console.log(`  przed: ${navLine(patch.before)}`);
    console.log(`  po:    ${navLine(patch.after)}`);
  }
  if (drafts.length)
    console.log(`UWAGA szkice (nie są zmieniane): ${drafts.join(", ")}`);
  else if (readToken) console.log("szkice: brak");
  if (conflicts.length) {
    console.log(
      `KONFLIKT: ${conflicts.length} dokument(y) mają inną treść. Bez --force nic nie zostanie zapisane.`,
    );
  }
  console.log(
    problems.length
      ? `REFERENCJE: ${problems.join("; ")}`
      : "referencje: OK (formularze, tłumaczenia, zdjęcie, linki zgód, menu)",
  );
  console.log(`mutacje w jednej transakcji: ${mutations?.length ?? 0}`);

  const reports = path.join(root, "reports");
  mkdirSync(reports, { recursive: true });
  const transactionFile = path.join(reports, "contact-import-transaction.json");
  writeFileSync(
    transactionFile,
    `${JSON.stringify({ projectId, dataset, dryRun: !write, readMode, drafts, actions, navPatches, problems, mutations }, null, 2)}\n`,
  );
  console.log(`transakcja: ${path.relative(root, transactionFile)}`);
  if (simulateOut) {
    const target = path.resolve(simulateOut);
    writeFileSync(
      target,
      `${datasetAfter.map((doc) => JSON.stringify(doc)).join("\n")}\n`,
    );
    console.log(
      `symulacja Content Lake: ${path.relative(root, target)} (${datasetAfter.length} dokumentów)`,
    );
  }

  if (!write) return;
  if (conflicts.length)
    throw new Error("Konflikty treści; uruchom z --force albo usuń różnice.");
  if (problems.length)
    throw new Error("Nierozwiązane referencje; zapis przerwany.");
  if (!mutations?.length) {
    console.log("Nic do zapisania.");
    return;
  }
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

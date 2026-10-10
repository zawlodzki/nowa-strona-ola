/**
 * Targeted swap on the homepage: replaces the logo strip ("home-logos",
 * logosSection) with the "Z kim pracuję" / "Who I work with" section
 * ("home-audience", audienceSection) in page-home-pl and page-home-en, at the
 * same position. Deletes logo/partner documents and image assets used only by
 * the logo strip (none expected: the logos were local files, not assets).
 *
 * Usage:
 *   npm run import:audience                                  # offline plan only
 *   npm run import:audience -- --dataset production          # dry run against the dataset
 *   npm run import:audience -- --dataset production --simulate reports/audience-lake.ndjson
 *   SANITY_API_WRITE_TOKEN=… npm run import:audience -- --write --dataset production
 *
 * Dry run by default. Every patch carries ifRevisionID; everything is sent as
 * one transaction. Before a write the affected documents are backed up to
 * --backup-dir (default reports/sanity-backup). Drafts of the home pages that
 * still contain the logo strip are patched too. The token is never printed.
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
  HOME_IDS,
  applyMutations,
  buildAudienceItems,
  buildMutations,
  buildSectionPatch,
  findLogoSections,
  findProblems,
  planDeletions,
  type SectionPatchPlan,
} from "../src/sanity/audience-import.ts";

const root = path.resolve(import.meta.dirname, "..");
const projectId = "dyuqkn8c";
const apiVersion = "2026-09-01";

function flagValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function sectionLine(sections: { _key: string; _type: string }[]): string {
  return sections.map((section) => section._key).join(" · ");
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
  if (simulateOut && !dataset)
    throw new Error("--simulate wymaga --dataset <nazwa>.");

  const formSource = readFileSync(
    path.join(root, "studio/schema-types/documents/form.ts"),
    "utf8",
  );
  const items = buildAudienceItems(
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
    for (const language of ["pl", "en"] as const) {
      const item = items[language];
      console.log(
        `plan patch page ${HOME_IDS[language]}: zamień home-logos na ${item._key} "${String(item.title)}" (${(item.items as unknown[]).length} karty)`,
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
  const byId = new Map(allDocuments.map((doc) => [doc._id, doc]));
  const targets: string[] = [];
  for (const language of ["pl", "en"] as const) {
    targets.push(HOME_IDS[language]);
    const draft = byId.get(`drafts.${HOME_IDS[language]}`);
    if (draft) targets.push(draft._id);
  }
  const strips = findLogoSections(allDocuments);
  const foreign = strips.filter((strip) => !targets.includes(strip.id));
  if (foreign.length) {
    throw new Error(
      `Pas logotypów poza stroną główną: ${foreign.map((strip) => `${strip.id}/${strip.key}`).join(", ")}. Zatrzymuję.`,
    );
  }

  const patches: SectionPatchPlan[] = targets.map((id) => {
    const language = id.endsWith("-en") ? "en" : "pl";
    return buildSectionPatch(byId.get(id), items[language]);
  });
  const deletions = planDeletions(allDocuments, patches);
  const mutations = buildMutations(patches, deletions);
  const datasetAfter = applyMutations(allDocuments, mutations);
  const problems = findProblems(
    datasetAfter.filter((doc) => !doc._id.startsWith("drafts.")),
  );

  for (const patch of patches) {
    if (patch.action === "skip") {
      console.log(`skip patch page ${patch.id}: ${patch.reason}`);
      continue;
    }
    console.log(
      `patch page ${patch.id}: ${patch.action} ${patch.selector} → ${patch.item._key} (${patch.item._type}) ifRevisionID=${patch.ifRevisionID ?? "-"}`,
    );
    console.log(`  przed: ${sectionLine(patch.before)}`);
    console.log(`  po:    ${sectionLine(patch.after)}`);
  }
  if (deletions.length) {
    for (const deletion of deletions)
      console.log(`delete ${deletion.type} ${deletion.id}: ${deletion.reason}`);
  } else {
    console.log(
      "delete: brak (logotypy były lokalnymi plikami, bez dokumentów i assetów w Content Lake)",
    );
  }
  if (!readToken)
    console.log(
      "UWAGA: bez tokenu szkice są niewidoczne; zapis z tokenem obejmie też szkice stron głównych.",
    );
  console.log(
    problems.length
      ? `PROBLEMY: ${problems.join("; ")}`
      : "kontrola po zmianie: OK (brak logosSection, kolejność 3a, referencje)",
  );
  console.log(`mutacje w jednej transakcji: ${mutations.length}`);

  const reports = path.join(root, "reports");
  mkdirSync(reports, { recursive: true });
  const transactionFile = path.join(
    reports,
    "audience-import-transaction.json",
  );
  writeFileSync(
    transactionFile,
    `${JSON.stringify({ projectId, dataset, dryRun: !write, readMode, patches, deletions, problems, mutations }, null, 2)}\n`,
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
    throw new Error("Kontrola po zmianie nie przeszła; zapis przerwany.");
  if (!mutations.length) {
    console.log("Nic do zapisania.");
    return;
  }
  const affected = [
    ...patches
      .filter((patch) => patch.action !== "skip")
      .map((patch) => patch.id),
    ...deletions.map((deletion) => deletion.id),
  ];
  mkdirSync(backupDir, { recursive: true });
  const backupFile = path.join(
    backupDir,
    `audience-${dataset}-${new Date().toISOString().replaceAll(":", "-")}.ndjson`,
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

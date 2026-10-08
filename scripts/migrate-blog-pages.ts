import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@sanity/client";

import { buildBlogPageMigration } from "../src/sanity/blog-page-migration";
import { sanityApiVersion } from "../src/sanity/config";
import type { SanityDocument } from "../src/sanity/content-lake-plan";

const value = (flag: string) => {
  const index = process.argv.indexOf(flag);
  return index < 0 ? undefined : process.argv[index + 1];
};
const write = process.argv.includes("--write");
const input = value("--input");
const dataset =
  value("--dataset") ?? process.env.SANITY_DATASET ?? "production";
const projectId = process.env.SANITY_PROJECT_ID ?? "dyuqkn8c";
const token =
  process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_API_READ_TOKEN;
const query = `*[_type == "siteSettings" || _type == "form" || (_type == "page" && slug.current == "blog")]`;
const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: sanityApiVersion,
  perspective: "raw",
  useCdn: false,
});

if (
  write &&
  (input || !value("--dataset") || !process.env.SANITY_API_WRITE_TOKEN)
) {
  throw new Error(
    "--write wymaga jawnego --dataset i SANITY_API_WRITE_TOKEN; plik --input służy wyłącznie dry-run.",
  );
}
const source: SanityDocument[] = input
  ? readFileSync(resolve(input), "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  : await client.fetch<SanityDocument[]>(query);
const plan = buildBlogPageMigration(source);
mkdirSync("reports", { recursive: true });
writeFileSync(
  "reports/blog-pages-migration.ndjson",
  plan.documents.map((doc) => JSON.stringify(doc)).join("\n") + "\n",
);
writeFileSync(
  "reports/blog-pages-migration.json",
  JSON.stringify({ projectId, dataset, ...plan }, null, 2),
);

if (write && plan.documents.length) {
  const current = await client.fetch<SanityDocument[]>(query);
  for (const sourceDocument of plan.sources) {
    if (
      !current.some(
        (doc) =>
          doc._id === sourceDocument.id && doc._rev === sourceDocument.revision,
      )
    ) {
      throw new Error(
        "Ustawienia zmieniły się po odczycie. Ponów dry-run migracji.",
      );
    }
  }
  if (
    current.some(
      (doc) =>
        doc._type === "page" &&
        plan.documents.some((draft) => draft.language === doc.language),
    )
  ) {
    throw new Error(
      "Strona bloga została już utworzona. Ponów dry-run migracji.",
    );
  }
  let transaction = client.transaction();
  for (const draft of plan.documents)
    transaction = transaction.createIfNotExists(draft);
  await transaction.commit();
}
console.log(
  JSON.stringify(
    {
      mode: write ? "drafts-only" : "dry-run",
      projectId,
      dataset,
      drafts: plan.documents.length,
      skipped: plan.skipped,
      published: false,
    },
    null,
    2,
  ),
);

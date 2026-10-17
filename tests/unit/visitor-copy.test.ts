import { spawnSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { scanVisitorCopy } from "../../scripts/check-visitor-copy.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const script = path.join(root, "scripts/check-visitor-copy.mjs");

function run(args: string[]) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

describe("check-visitor-copy", () => {
  it("allows a citation line with Wytyczne PCOS", () => {
    const report = scanVisitorCopy(
      'sourceScope: "Wytyczne PCOS 2023, sekcje 1.1–1.5",\n',
      "fixture.ts",
    );

    expect(report.violations).toEqual([]);
    expect(report.allowed).toHaveLength(1);
    expect(report.allowed[0]?.excerpt).toContain("Wytyczne PCOS");
  });

  it("fails a bare PCOS that is not on the allowlist", () => {
    const report = scanVisitorCopy(
      'const note = "PCOS bez etykiety";\n',
      "fixture.ts",
    );

    expect(report.violations).toHaveLength(1);
    expect(report.violations[0]?.excerpt).toContain("PCOS bez etykiety");
    expect(report.allowed).toEqual([]);
  });

  it("does not flag an article title or SEO field", () => {
    const source = `
      export const article = {
        _type: "article",
        title: "PCOS w tytule artykułu",
        seoTitle: "PCOS w polu SEO",
        seo: { title: "PCOS w tytule SEO", description: "Opis SEO z PCOS." },
        body: "Akapit artykułu o PCOS.",
      };
      export const BLOG_ARTICLE_SEED: readonly Item[] = [
        {
          pl: {
            slug: "suplementy-w-pcos",
            title: "PCOS w tytule seeda",
            seoTitle: "PCOS SEO seeda",
            lead: "Wstęp bez skrótu.",
          },
        },
      ];
      const pageTitle = "PCOS bez etykiety";
    `;
    const report = scanVisitorCopy(source, "fixture.ts");

    expect(report.allowed).toEqual([]);
    expect(report.violations).toHaveLength(1);
    expect(report.violations[0]?.excerpt).toContain("PCOS bez etykiety");
    expect(report.violations[0]?.excerpt).not.toContain("tytule");
  });

  it("skips the PMOS label, slugs, hrefs, topic and _id", () => {
    const source = [
      'const label = "PMOS\\u00A0(PCOS)";',
      `const character = "PMOS\u00A0(PCOS)";`,
      'const slug = "suplementy-w-pcos";',
      'const topic = { topic: "pcos" };',
      'const id = { _id: "PCOS" };',
      'const href = { href: "/ebooki/PCOS/" };',
      'const link = "https://example.com/PCOS";',
    ].join("\n");
    const report = scanVisitorCopy(source, "fixture.ts");

    expect(report.violations).toEqual([]);
    expect(report.allowed).toEqual([]);
  });

  it("allows the legal newsletter example and exits 0 on src/content", async () => {
    const newsletter = scanVisitorCopy(
      "w szczególności przy PCOS, insulinooporności\n",
      "src/content/examples/legal-newsletter.md",
    );
    expect(newsletter.violations).toEqual([]);
    expect(newsletter.allowed).toHaveLength(1);

    const dir = await mkdtemp(path.join(tmpdir(), "visitor-copy-"));
    const bare = path.join(dir, "seed.ts");
    await writeFile(bare, 'export const note = "PCOS bez etykiety";\n', "utf8");
    const failed = run([bare]);
    expect(failed.status).toBe(1);
    expect(failed.stderr).toContain("PCOS bez etykiety");

    const content = run(["src/content"]);
    expect(content.status).toBe(0);
    expect(content.stdout.startsWith("allowed 14\n")).toBe(true);
    expect(content.stdout).toContain("src/content/homepage-seed.ts:");
    expect(content.stdout).toContain("walki z PCOS");
    expect(content.stdout).toContain("fighting PCOS");
    expect(content.stdout).toContain(
      "src/content/examples/legal-newsletter.md:",
    );
    expect(content.stdout).not.toContain("regulamin-newslettera.json");
    expect(content.stderr).toBe("");
  });
});

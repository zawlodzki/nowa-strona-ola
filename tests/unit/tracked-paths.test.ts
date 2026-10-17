import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { forbiddenTrackedPaths } from "../../scripts/check-tracked-paths.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const script = path.join(root, "scripts/check-tracked-paths.mjs");

function run(args: string[] = [], input?: string) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
    input,
  });
}

describe("check-tracked-paths", () => {
  it("fails a file list that includes output/design-consistency-3a/checks.json", () => {
    const paths = [
      "src/assets/portrait.png",
      "mockups/homepage/shot.png",
      "design-system/mark.png",
      "archive/wonderful-design-system/evidence/about-desktop.png",
      "output/design-consistency-3a/checks.json",
    ];

    expect(forbiddenTrackedPaths(paths)).toEqual([
      "output/design-consistency-3a/checks.json",
    ]);

    const result = run(["--stdin"], `${paths.join("\n")}\n`);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("output/design-consistency-3a/checks.json");
    expect(result.stderr).not.toContain(
      "archive/wonderful-design-system/evidence/about-desktop.png",
    );
  });

  it("allows archived wonderful evidence and png files outside the review prefixes", () => {
    const result = run(
      ["--stdin"],
      [
        "archive/wonderful-design-system/evidence/about-desktop.png",
        "src/assets/portrait.png",
        "mockups/homepage/shot.png",
        "design-system/mark.png",
        ".audit-notes.txt",
      ].join("\n"),
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toBe("ok\n");
  });

  it("names .audit and docs/evidence paths", () => {
    expect(
      forbiddenTrackedPaths([
        ".audit/ola-turnstile-live-proof.json",
        "docs/evidence/bejamas-desktop.png",
      ]),
    ).toEqual([
      ".audit/ola-turnstile-live-proof.json",
      "docs/evidence/bejamas-desktop.png",
    ]);
  });

  it("prints ok for the repository index", () => {
    const result = run();

    expect(result.status).toBe(0);
    expect(result.stdout).toBe("ok\n");
  });
});

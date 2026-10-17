import { spawnSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { scanPseudoShapes } from "../../scripts/check-pseudo-shapes.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const script = path.join(root, "scripts/check-pseudo-shapes.mjs");

function run(args: string[]) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

describe("check-pseudo-shapes", () => {
  it("allows a breadcrumb separator", () => {
    const source = `
      .ao-breadcrumbs li + li::before {
        content: "/";
        background: transparent;
      }
      .article3a :global(.ao-breadcrumbs) li + li::before {
        content: "/";
        border-inline-end: 1px solid currentColor;
      }
    `;

    expect(scanPseudoShapes(source, "breadcrumbs.css")).toEqual([]);
  });

  it("fails a circle ::before", () => {
    const source = `
      /* .fake::before { background: red; } */
      .panel {
        background: white;
        border-radius: 24px;
      }
      .blob::before {
        content: "";
        inline-size: 12px;
        block-size: 12px;
        border-radius: 50%;
        background: var(--ao-accent);
      }
      *::before,
      *::after {
        box-sizing: border-box;
      }
    `;

    const violations = scanPseudoShapes(source, "view.css");

    expect(violations).toHaveLength(1);
    expect(violations[0]?.selector).toBe(".blob::before");
    expect(violations[0]?.properties).toEqual(["border-radius", "background"]);
  });

  it("allows the audience counter and rejects a new background", () => {
    const counter = `
      .home3a-audience__list li::after {
        content: counter(audience, decimal-leading-zero);
        box-shadow: none;
      }
    `;
    expect(scanPseudoShapes(counter, "home.css")).toEqual([]);
    expect(
      scanPseudoShapes(".tick::before { background: red; }\n", "fresh.css"),
    ).toHaveLength(1);
  });

  it("exits 1 for a painted pseudo in a view and 0 on src", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "pseudo-shapes-"));
    const view = path.join(dir, "Circle.astro");
    await writeFile(
      view,
      `<style>
        .blob::before {
          border-radius: 50%;
          background: red;
        }
      </style>
`,
      "utf8",
    );

    const failed = run([view]);
    expect(failed.status).toBe(1);
    expect(failed.stderr).toContain(".blob::before");
    expect(failed.stderr).toContain("border-radius");
    expect(failed.stderr).toContain("background");

    const home = run(["src/views/Homepage3a.astro"]);
    expect(home.status).toBe(0);
    expect(home.stdout).toBe("ok\n");

    const crumbs = run(["src/design-system/components/Breadcrumbs.astro"]);
    expect(crumbs.status).toBe(0);

    const marks = run(["src/design-system/decorations"]);
    expect(marks.status).toBe(0);
    expect(marks.stdout).toBe("ok\n");

    const src = run(["src"]);
    expect(src.status).toBe(0);
    expect(src.stdout).toBe("ok\n");
    expect(src.stderr).toBe("");
  });
});

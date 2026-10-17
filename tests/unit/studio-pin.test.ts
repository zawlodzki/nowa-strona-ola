import { spawnSync } from "node:child_process";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const script = path.join(root, "scripts/check-studio-pin.mjs");

function run(args: string[] = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

describe("check-studio-pin", () => {
  it("fails when a fixture cli sets autoUpdates: true", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "studio-pin-"));
    const cli = path.join(dir, "sanity.cli.ts");
    await writeFile(
      cli,
      "export default { deployment: { autoUpdates: true } };\n",
      "utf8",
    );

    const result = run(["--cli", cli]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/autoUpdates/);
  });

  it("fails when the declared sanity version is not the locked version", () => {
    const result = run(["--sanity", "^6.20.0"]);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/node_modules\/sanity/);
    expect(result.stderr).toMatch(/\^6\.20\.0/);
  });

  it("prints ok for the repository pin", () => {
    const result = run();

    expect(result.status).toBe(0);
    expect(result.stdout).toBe("ok\n");
  });
});

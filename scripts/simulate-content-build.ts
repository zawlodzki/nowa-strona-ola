import { spawnSync } from "node:child_process";
import path from "node:path";

const root = import.meta.dirname
  ? path.resolve(import.meta.dirname, "..")
  : process.cwd();
const ndjson = path.join(root, "reports", "content-lake-3a.ndjson");

function run(command: string, args: string[], env: NodeJS.ProcessEnv): void {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npx", ["astro", "build", "--config", "astro.fixture-dist.config.mjs"], {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: "1",
});
run("npx", ["tsx", "scripts/import-3a.ts"], process.env);
run("npx", ["astro", "build", "--config", "astro.sim.config.mjs"], {
  ...process.env,
  PUBLIC_SANITY_PROJECT_ID: "dyuqkn8c",
  PUBLIC_SANITY_DATASET: "production",
  CONTENT_LAKE_NDJSON: ndjson,
  ASTRO_TELEMETRY_DISABLED: "1",
});
run("node", ["scripts/check-content-lake-build.mjs"], process.env);
run("node", ["scripts/compare-fixture-lake.mjs"], process.env);

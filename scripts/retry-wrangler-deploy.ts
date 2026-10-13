import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  parseRetryArgs,
  runWranglerDeployWithRetry,
  spawnDeployProcess,
} from "../src/lib/deploy/retry-wrangler";

export function isRetryCliEntry(
  argv1: string | undefined,
  moduleUrl: string,
): boolean {
  if (!argv1) return false;
  return pathToFileURL(path.resolve(argv1)).href === moduleUrl;
}

async function main(): Promise<void> {
  try {
    const plan = parseRetryArgs(process.argv.slice(2));
    const result = await runWranglerDeployWithRetry({
      command: plan.command,
      attempts: plan.attempts,
      backoffSeconds: plan.backoffSeconds,
      env: process.env,
      spawnProcess: spawnDeployProcess,
      sleep: (milliseconds) =>
        new Promise((resolve) => {
          setTimeout(resolve, milliseconds);
        }),
      writeLine: (line) => {
        process.stderr.write(`${line}\n`);
      },
    });
    process.exit(result.exitCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}

if (isRetryCliEntry(process.argv[1], import.meta.url)) {
  void main();
}

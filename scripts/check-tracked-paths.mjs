import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const forbiddenPrefixes = ["output/", ".audit/", "docs/evidence/"];

export function forbiddenTrackedPaths(paths) {
  const violations = [];
  for (const raw of paths) {
    const file = String(raw).replaceAll("\\", "/").replace(/^\.\//, "").trim();
    if (file.length === 0) continue;
    const forbidden = forbiddenPrefixes.some(
      (prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix),
    );
    if (forbidden) violations.push(file);
  }
  return violations;
}

function trackedPathsFromGit() {
  const output = execFileSync("git", ["ls-files", "-z", "--full-name"], {
    encoding: "utf8",
  });
  return output.split("\0").filter((file) => file.length > 0);
}

function readPaths(argv) {
  if (argv.includes("--stdin")) {
    return readFileSync(0, "utf8").split(/\r?\n/);
  }
  const listIndex = argv.indexOf("--list");
  if (listIndex !== -1) {
    const file = argv[listIndex + 1];
    if (!file || file.startsWith("--")) {
      throw new Error("Brak ścieżki dla --list.");
    }
    return readFileSync(file, "utf8").split(/\r?\n/);
  }
  const unexpected = argv.find((arg) => arg.length > 0);
  if (unexpected) {
    throw new Error(`Nieznany argument: ${unexpected}.`);
  }
  return trackedPathsFromGit();
}

function main() {
  try {
    const violations = forbiddenTrackedPaths(readPaths(process.argv.slice(2)));
    if (violations.length > 0) {
      console.error("Śledzone artefakty recenzji:");
      for (const file of violations) console.error(file);
      process.exit(1);
    }
    console.log("ok");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const invoked = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invoked) {
  main();
}

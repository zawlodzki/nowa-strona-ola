import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const defaults = {
  cliPath: "studio/sanity.cli.ts",
  packagePath: "studio/package.json",
  lockPath: "package-lock.json",
};

export function codeWithoutComments(source) {
  let out = "";
  let i = 0;
  let quote = "";
  while (i < source.length) {
    const current = source[i];
    const next = source[i + 1];
    if (quote) {
      if (current === "\\") {
        i += 2;
        continue;
      }
      if (current === quote) quote = "";
      i += 1;
      continue;
    }
    if (current === '"' || current === "'" || current === "`") {
      quote = current;
      i += 1;
      continue;
    }
    if (current === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }
    if (current === "/" && next === "*") {
      i += 2;
      while (
        i < source.length &&
        !(source[i] === "*" && source[i + 1] === "/")
      ) {
        i += 1;
      }
      i += 2;
      continue;
    }
    out += current;
    i += 1;
  }
  return out;
}

export function autoUpdateValues(source) {
  const code = codeWithoutComments(source);
  return [...code.matchAll(/autoUpdates\s*:\s*([A-Za-z_$][\w$]*)/g)].map(
    (match) => match[1],
  );
}

export function checkStudioPin({
  cliSource,
  declaredVersion,
  lockedVersion,
  cliLabel = defaults.cliPath,
}) {
  const values = autoUpdateValues(cliSource);
  if (values.length === 0 || values.some((value) => value !== "false")) {
    const found = values.length === 0 ? "brak" : values.join(", ");
    throw new Error(
      `${cliLabel}: wymagane autoUpdates: false (jest: ${found}).`,
    );
  }
  if (typeof lockedVersion !== "string" || lockedVersion.length === 0) {
    throw new Error(
      "package-lock.json nie zawiera wersji node_modules/sanity.",
    );
  }
  if (
    typeof declaredVersion !== "string" ||
    declaredVersion !== lockedVersion
  ) {
    throw new Error(
      `studio/package.json sanity (${String(declaredVersion)}) nie jest dokładną wersją node_modules/sanity z package-lock.json (${lockedVersion}).`,
    );
  }
}

function parseArgs(argv) {
  const options = { ...defaults, declaredVersion: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    if (value === undefined) {
      throw new Error(`Brak wartości dla ${arg}.`);
    }
    if (arg === "--cli") options.cliPath = value;
    else if (arg === "--package") options.packagePath = value;
    else if (arg === "--lock") options.lockPath = value;
    else if (arg === "--sanity") options.declaredVersion = value;
    else throw new Error(`Nieznany argument: ${arg}.`);
    i += 1;
  }
  return options;
}

async function lockedSanityVersion(lockPath) {
  const lock = JSON.parse(await readFile(lockPath, "utf8"));
  return lock.packages?.["node_modules/sanity"]?.version;
}

async function declaredSanityVersion(packagePath, override) {
  if (override !== undefined) return override;
  const manifest = JSON.parse(await readFile(packagePath, "utf8"));
  return manifest.dependencies?.sanity ?? manifest.devDependencies?.sanity;
}

export async function loadStudioPin(options) {
  const [cliSource, lockedVersion, declaredVersion] = await Promise.all([
    readFile(options.cliPath, "utf8"),
    lockedSanityVersion(options.lockPath),
    declaredSanityVersion(options.packagePath, options.declaredVersion),
  ]);
  return {
    cliSource,
    declaredVersion,
    lockedVersion,
    cliLabel: options.cliPath,
  };
}

async function main() {
  try {
    const pin = await loadStudioPin(parseArgs(process.argv.slice(2)));
    checkStudioPin(pin);
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
  await main();
}

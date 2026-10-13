import path from "node:path";

const PROJECT_ID = "dyuqkn8c" as const;
const DATASET = "production" as const;

const backupDestinationBrand = Symbol("BackupDestination");

export type BackupDestination = {
  readonly directory: string;
  readonly archivePath: string;
  readonly checksumPath: string;
  readonly [backupDestinationBrand]: "BackupDestination";
};

export type DestinationDecision =
  { ok: true; destination: BackupDestination } | { ok: false; message: string };

export type DocumentKind = "published" | "draft" | "version";

export type TypeCount = {
  readonly type: string;
  readonly published: number;
  readonly drafts: number;
  readonly versions: number;
};

const DATA_NDJSON_ENTRY = /^[^/]+\/data\.ndjson$/;
const IMAGE_ENTRY = /^[^/]+\/images\/.+/;
const FILE_ENTRY = /^[^/]+\/files\/.+/;

export function resolveBackupDestination(input: {
  readonly requestedDir: string | undefined;
  readonly homeDir: string;
  readonly repoRoot: string;
  readonly now: Date;
  readonly realpath: (absolutePath: string) => string | null;
  readonly exists: (absolutePath: string) => boolean;
}): DestinationDecision {
  const raw = input.requestedDir?.trim() ?? "";
  const expanded =
    raw === ""
      ? path.join(input.homeDir, "sanity-backups")
      : expandHome(raw, input.homeDir);
  if (!path.isAbsolute(expanded)) {
    return {
      ok: false,
      message: `SANITY_BACKUP_DIR musi być ścieżką bezwzględną albo zaczynać się od ~/ (otrzymano: ${raw}).`,
    };
  }

  const resolved = path.resolve(expanded);
  const realDirectory = resolveRealDirectory(resolved, input.realpath);
  if (realDirectory === null) {
    return {
      ok: false,
      message: `Nie można ustalić rzeczywistej ścieżki katalogu kopii: ${resolved}.`,
    };
  }

  const realRepo = input.realpath(input.repoRoot);
  if (realRepo === null) {
    return {
      ok: false,
      message: `Katalog repozytorium nie istnieje: ${input.repoRoot}`,
    };
  }

  const refusal = insideRepoRefusal(realDirectory, input.repoRoot, realRepo);
  if (refusal) return { ok: false, message: refusal };

  const fileName = archiveFileName(input.now);
  if (fileName === null) {
    return { ok: false, message: "Niepoprawny czas kopii." };
  }

  const archivePath = path.join(realDirectory, fileName);
  const checksumPath = `${archivePath}.sha256`;
  if (input.exists(archivePath)) {
    return { ok: false, message: `Plik kopii już istnieje: ${archivePath}` };
  }
  if (input.exists(checksumPath)) {
    return { ok: false, message: `Plik sumy już istnieje: ${checksumPath}` };
  }

  return {
    ok: true,
    destination: {
      directory: realDirectory,
      archivePath,
      checksumPath,
      [backupDestinationBrand]: "BackupDestination",
    },
  };
}

export function sanityExportArgv(
  archivePath: string,
): readonly [
  "npx",
  "sanity",
  "datasets",
  "export",
  "production",
  string,
  "--project-id",
  "dyuqkn8c",
] {
  return [
    "npx",
    "sanity",
    "datasets",
    "export",
    DATASET,
    archivePath,
    "--project-id",
    PROJECT_ID,
  ];
}

export function countDocumentTypes(
  ndjsonLines: Iterable<string>,
): readonly TypeCount[] {
  const totals = new Map<
    string,
    { published: number; drafts: number; versions: number }
  >();
  let lineNumber = 0;
  for (const line of ndjsonLines) {
    lineNumber += 1;
    if (line.trim() === "") continue;
    const document = parseDocumentLine(line, lineNumber);
    const kind = classifyDocumentId(document._id);
    const current = totals.get(document._type) ?? {
      published: 0,
      drafts: 0,
      versions: 0,
    };
    if (kind === "published") current.published += 1;
    else if (kind === "draft") current.drafts += 1;
    else current.versions += 1;
    totals.set(document._type, current);
  }

  return [...totals.entries()]
    .map(([type, counts]) => ({ type, ...counts }))
    .sort((left, right) => {
      const byCount = typeTotal(right) - typeTotal(left);
      if (byCount !== 0) return byCount;
      return left.type.localeCompare(right.type, "en");
    });
}

export function findDataNdjsonEntry(paths: readonly string[]): string {
  const matches = paths.filter((entry) => DATA_NDJSON_ENTRY.test(entry));
  const [match, extra] = matches;
  if (match === undefined) {
    throw new Error("Archiwum nie zawiera data.ndjson.");
  }
  if (extra !== undefined) {
    throw new Error("Archiwum zawiera więcej niż jeden data.ndjson.");
  }
  return match;
}

export function countAssetEntries(paths: readonly string[]): {
  readonly images: number;
  readonly files: number;
} {
  let images = 0;
  let files = 0;
  for (const entry of paths) {
    if (IMAGE_ENTRY.test(entry)) images += 1;
    if (FILE_ENTRY.test(entry)) files += 1;
  }
  return { images, files };
}

export async function runSanityBackup(input: {
  readonly argv: readonly string[];
  readonly env: Readonly<Record<string, string | undefined>>;
  readonly repoRoot: string;
  readonly homeDir: string;
  readonly now: Date;
  readonly writeLine: (line: string) => void;
  readonly spawnExport: (
    argv: readonly [string, ...string[]],
    env: NodeJS.ProcessEnv,
  ) => Promise<number>;
  readonly realpath: (absolutePath: string) => string | null;
  readonly exists: (absolutePath: string) => boolean;
  readonly mkdir: (directory: string) => void;
  readonly hashFile: (filePath: string) => Promise<string>;
  readonly listArchive: (archivePath: string) => Promise<readonly string[]>;
  readonly readArchiveText: (
    archivePath: string,
    entryName: string,
  ) => Promise<string>;
  readonly removeFile: (filePath: string) => void;
  readonly restrictFile: (filePath: string) => void;
  readonly writeChecksum: (
    checksumPath: string,
    archiveBasename: string,
    hex: string,
  ) => void;
}): Promise<number> {
  if (input.argv.length > 0) {
    input.writeLine("backup:sanity nie przyjmuje argumentów.");
    return 1;
  }

  const token = input.env.SANITY_AUTH_TOKEN;
  if (token === undefined || token.trim() === "") {
    input.writeLine(
      "Brak SANITY_AUTH_TOKEN. Ustaw zmienną środowiska i uruchom ponownie.",
    );
    return 1;
  }

  const decision = resolveBackupDestination({
    requestedDir: input.env.SANITY_BACKUP_DIR,
    homeDir: input.homeDir,
    repoRoot: input.repoRoot,
    now: input.now,
    realpath: input.realpath,
    exists: input.exists,
  });
  if (!decision.ok) {
    input.writeLine(decision.message);
    return 1;
  }

  const { destination } = decision;
  input.mkdir(destination.directory);
  const created = input.realpath(destination.directory);
  const repoReal = input.realpath(input.repoRoot);
  if (created === null || created !== destination.directory) {
    input.writeLine("Odmowa: katalog kopii zmienił położenie po utworzeniu.");
    return 1;
  }
  if (
    isInsideRoot(input.repoRoot, created) ||
    (repoReal !== null && isInsideRoot(repoReal, created))
  ) {
    input.writeLine("Odmowa: katalog kopii zmienił położenie po utworzeniu.");
    return 1;
  }

  const code = await input.spawnExport(
    sanityExportArgv(destination.archivePath),
    input.env as NodeJS.ProcessEnv,
  );
  if (code !== 0) {
    if (input.exists(destination.archivePath)) {
      input.removeFile(destination.archivePath);
    }
    input.writeLine(`Eksport Sanity zakończył się kodem ${code}.`);
    return code;
  }

  input.restrictFile(destination.archivePath);
  const hex = await input.hashFile(destination.archivePath);
  input.writeChecksum(
    destination.checksumPath,
    path.basename(destination.archivePath),
    hex,
  );
  input.restrictFile(destination.checksumPath);

  try {
    const paths = await input.listArchive(destination.archivePath);
    const entryName = findDataNdjsonEntry(paths);
    const ndjson = await input.readArchiveText(
      destination.archivePath,
      entryName,
    );
    const counts = countDocumentTypes(ndjson.split("\n"));
    const assets = countAssetEntries(paths);
    writeBackupReport(
      input.writeLine,
      destination.archivePath,
      hex,
      counts,
      assets,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    input.writeLine(message);
    return 1;
  }

  return 0;
}

function expandHome(value: string, homeDir: string): string {
  if (value === "~") return homeDir;
  if (value.length > 1 && value.charAt(0) === "~" && value.charAt(1) === "/") {
    return path.join(homeDir, value.slice(2));
  }
  return value;
}

function resolveRealDirectory(
  directory: string,
  realpath: (absolutePath: string) => string | null,
): string | null {
  const missing: string[] = [];
  let current = directory;
  for (;;) {
    const found = realpath(current);
    if (found !== null) return path.resolve(found, ...missing.reverse());
    const parent = path.dirname(current);
    if (parent === current) return null;
    missing.push(path.basename(current));
    current = parent;
  }
}

function insideRepoRefusal(
  realDirectory: string,
  repoRoot: string,
  realRepo: string,
): string | null {
  const insideReal = isInsideRoot(realRepo, realDirectory);
  const insideLexical = isInsideRoot(repoRoot, realDirectory);
  if (!insideReal && !insideLexical) return null;
  const realRepoDisplayed = insideReal ? realRepo : repoRoot;
  return `Odmowa: katalog kopii ${realDirectory} leży w repozytorium ${realRepoDisplayed}. Kopia zawiera sekrety podglądu; wybierz katalog poza repozytorium, np. ~/sanity-backups.`;
}

function isInsideRoot(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  if (relative === "") return true;
  if (path.isAbsolute(relative)) return false;
  return !climbsOut(relative);
}

function climbsOut(relativePath: string): boolean {
  return relativePath === ".." || relativePath.startsWith(`..${path.sep}`);
}

function archiveFileName(now: Date): string | null {
  if (Number.isNaN(now.getTime())) return null;
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  return `sanity-${PROJECT_ID}-${DATASET}-${stamp}.tar.gz`;
}

function classifyDocumentId(id: string): DocumentKind {
  if (hasPrefix(id, "drafts.")) return "draft";
  if (hasPrefix(id, "versions.")) return "version";
  return "published";
}

function hasPrefix(value: string, prefix: string): boolean {
  return value.slice(0, prefix.length) === prefix;
}

function parseDocumentLine(
  line: string,
  lineNumber: number,
): { readonly _id: string; readonly _type: string } {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw unreadableDocument(lineNumber);
  }
  if (!isDocument(value)) throw unreadableDocument(lineNumber);
  return value;
}

function isDocument(
  value: unknown,
): value is { readonly _id: string; readonly _type: string } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record._id === "string" && typeof record._type === "string";
}

function unreadableDocument(lineNumber: number): Error {
  return new Error(
    `Archiwum zawiera nieczytelną linię dokumentu ${lineNumber}.`,
  );
}

function typeTotal(row: TypeCount): number {
  return row.published + row.drafts + row.versions;
}

function writeBackupReport(
  writeLine: (line: string) => void,
  archivePath: string,
  hex: string,
  counts: readonly TypeCount[],
  assets: { readonly images: number; readonly files: number },
): void {
  const published = counts.reduce((sum, row) => sum + row.published, 0);
  const drafts = counts.reduce((sum, row) => sum + row.drafts, 0);
  const versions = counts.reduce((sum, row) => sum + row.versions, 0);
  writeLine(`Eksport: ${sanityExportArgv(archivePath).join(" ")}`);
  writeLine(`Kopia: ${archivePath}`);
  writeLine(`SHA-256: ${hex}`);
  writeLine(
    `Dokumenty: ${published + drafts + versions} (opublikowane ${published}, szkice ${drafts}, wersje ${versions})`,
  );
  for (const row of counts) {
    writeLine(`  ${row.type} ${row.published} ${row.drafts} ${row.versions}`);
  }
  writeLine(
    `Pliki zasobów w archiwum: obrazy ${assets.images}, pliki ${assets.files}`,
  );
  const secrets = counts.find((row) => row.type === "sanity.previewUrlSecret");
  if (
    secrets !== undefined &&
    secrets.published + secrets.drafts + secrets.versions > 0
  ) {
    writeLine(
      "Uwaga: kopia zawiera dokumenty sanity.previewUrlSecret. Trzymaj ją poza repozytorium.",
    );
  }
}

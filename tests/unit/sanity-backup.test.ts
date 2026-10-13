import {
  createWriteStream,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { finished } from "node:stream/promises";
import { fileURLToPath } from "node:url";

import { list, Pack } from "tar";
import { describe, expect, it } from "vitest";

import {
  countAssetEntries,
  countDocumentTypes,
  findDataNdjsonEntry,
  resolveBackupDestination,
  runSanityBackup,
  sanityExportArgv,
  type DestinationDecision,
} from "@/lib/sanity-backup";

const NOW = new Date("2026-10-13T07:10:00.000Z");
const ARCHIVE_NAME = "sanity-dyuqkn8c-production-20261013T071000Z.tar.gz";

const INSIDE_REPO =
  "Odmowa: katalog kopii /repo/output leży w repozytorium /repo. Kopia zawiera sekrety podglądu; wybierz katalog poza repozytorium, np. ~/sanity-backups.";

function identityRealpath(
  overrides: Readonly<Record<string, string | null>> = {},
): (absolutePath: string) => string | null {
  return (absolutePath) => {
    if (Object.prototype.hasOwnProperty.call(overrides, absolutePath)) {
      return overrides[absolutePath] ?? null;
    }
    return absolutePath;
  };
}

function decide(input: {
  readonly requestedDir?: string;
  readonly realpath?: (absolutePath: string) => string | null;
  readonly exists?: (absolutePath: string) => boolean;
  readonly repoRoot?: string;
}): DestinationDecision {
  return resolveBackupDestination({
    requestedDir: input.requestedDir,
    homeDir: "/home/ola",
    repoRoot: input.repoRoot ?? "/repo",
    now: NOW,
    realpath: input.realpath ?? identityRealpath(),
    exists: input.exists ?? (() => false),
  });
}

function expectArchive(decision: DestinationDecision, archivePath: string) {
  expect(decision).toEqual({
    ok: true,
    destination: expect.objectContaining({
      directory: path.dirname(archivePath),
      archivePath,
      checksumPath: `${archivePath}.sha256`,
    }),
  });
}

describe("resolveBackupDestination", () => {
  it("uses ~/sanity-backups when the directory is unset", () => {
    expectArchive(decide({}), `/home/ola/sanity-backups/${ARCHIVE_NAME}`);
  });

  it("expands a ~/ directory", () => {
    expectArchive(
      decide({ requestedDir: "~/kopie" }),
      `/home/ola/kopie/${ARCHIVE_NAME}`,
    );
  });

  it("refuses a relative directory", () => {
    expect(decide({ requestedDir: "./reports" })).toEqual({
      ok: false,
      message:
        "SANITY_BACKUP_DIR musi być ścieżką bezwzględną albo zaczynać się od ~/ (otrzymano: ./reports).",
    });
  });

  it("refuses a directory inside the repo", () => {
    expect(decide({ requestedDir: "/repo/output" })).toEqual({
      ok: false,
      message: INSIDE_REPO,
    });
    expect(decide({ requestedDir: "/repo/reports" })).toEqual({
      ok: false,
      message:
        "Odmowa: katalog kopii /repo/reports leży w repozytorium /repo. Kopia zawiera sekrety podglądu; wybierz katalog poza repozytorium, np. ~/sanity-backups.",
    });
  });

  it("resolves .. before the inside-repo check", () => {
    expect(decide({ requestedDir: "/home/ola/../../repo/output" })).toEqual({
      ok: false,
      message: INSIDE_REPO,
    });
  });

  it("names the real directory when a symlink points into the repo", () => {
    const decision = decide({
      requestedDir: "/home/ola/link-to-output",
      realpath: identityRealpath({
        "/home/ola/link-to-output": "/repo/output",
      }),
    });
    expect(decision).toEqual({ ok: false, message: INSIDE_REPO });
    if (!decision.ok) {
      expect(decision.message).not.toContain("link-to-output");
    }
  });

  it("accepts a sibling of the repo", () => {
    expectArchive(
      decide({ requestedDir: "/repo-backups" }),
      `/repo-backups/${ARCHIVE_NAME}`,
    );
  });

  it("refuses an archive that already exists", () => {
    const archivePath = `/home/ola/sanity-backups/${ARCHIVE_NAME}`;
    expect(
      decide({
        exists: (absolutePath) => absolutePath === archivePath,
      }),
    ).toEqual({
      ok: false,
      message: `Plik kopii już istnieje: ${archivePath}`,
    });
  });

  it("keeps a missing directory when its parent exists", () => {
    const decision = decide({
      realpath: identityRealpath({ "/home/ola/sanity-backups": null }),
    });
    expect(decision.ok).toBe(true);
    if (decision.ok) {
      expect(decision.destination.directory).toBe("/home/ola/sanity-backups");
    }
  });

  it("follows a real symlink into the repo and accepts the temp parent", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "sanity-backup-"));
    const realpath = (absolutePath: string): string | null => {
      try {
        return realpathSync(absolutePath);
      } catch (error) {
        if (isEnoent(error)) return null;
        throw error;
      }
    };
    const exists = (absolutePath: string): boolean => {
      try {
        lstatSync(absolutePath);
        return true;
      } catch (error) {
        if (isEnoent(error)) return false;
        throw error;
      }
    };
    try {
      const repo = path.join(root, "repo");
      const reports = path.join(repo, "reports");
      mkdirSync(reports, { recursive: true });
      const link = path.join(root, "link");
      symlinkSync(reports, link);

      const linked = resolveBackupDestination({
        requestedDir: link,
        homeDir: root,
        repoRoot: repo,
        now: NOW,
        realpath,
        exists,
      });
      const realReports = realpathSync(reports);
      const realRepo = realpathSync(repo);
      expect(linked.ok).toBe(false);
      if (!linked.ok) {
        expect(linked.message).toBe(
          `Odmowa: katalog kopii ${realReports} leży w repozytorium ${realRepo}. Kopia zawiera sekrety podglądu; wybierz katalog poza repozytorium, np. ~/sanity-backups.`,
        );
      }

      const outside = resolveBackupDestination({
        requestedDir: root,
        homeDir: root,
        repoRoot: repo,
        now: NOW,
        realpath,
        exists,
      });
      expect(outside.ok).toBe(true);
      if (outside.ok) {
        expect(path.basename(outside.destination.archivePath)).toBe(
          ARCHIVE_NAME,
        );
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("countDocumentTypes", () => {
  it("counts published, draft, and version ids per type", () => {
    expect(
      countDocumentTypes([
        '{"_id":"page-1","_type":"page"}',
        "",
        '{"_id":"drafts.page-1","_type":"page"}',
        '{"_id":"versions.summer.page-1","_type":"page"}',
        '{"_id":"ebook-1","_type":"ebook"}',
      ]),
    ).toEqual([
      { type: "page", published: 1, drafts: 1, versions: 1 },
      { type: "ebook", published: 1, drafts: 0, versions: 0 },
    ]);
  });
});

describe("archive members", () => {
  const exportPaths = [
    "dyuqkn8c-export-2026-10-13/data.ndjson",
    "dyuqkn8c-export-2026-10-13/images/a.jpg",
  ] as const;

  it("finds the single prefixed data.ndjson", () => {
    expect(findDataNdjsonEntry(exportPaths)).toBe(
      "dyuqkn8c-export-2026-10-13/data.ndjson",
    );
    expect(() => findDataNdjsonEntry(["data.ndjson"])).toThrow(
      "Archiwum nie zawiera data.ndjson.",
    );
  });

  it("counts image and file members, not directory entries", () => {
    expect(
      countAssetEntries([
        ...exportPaths,
        "dyuqkn8c-export-2026-10-13/images",
        "dyuqkn8c-export-2026-10-13/files/b.pdf",
      ]),
    ).toEqual({ images: 1, files: 1 });
  });

  it("reads the prefixed member names that tar packs", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "sanity-backup-tar-"));
    try {
      const work = path.join(root, "work");
      await mkdir(path.join(work, "images"), { recursive: true });
      await mkdir(path.join(work, "files"), { recursive: true });
      writeFileSync(
        path.join(work, "data.ndjson"),
        '{"_id":"page-1","_type":"page"}\n',
      );
      writeFileSync(path.join(work, "images", "a.jpg"), "jpeg");
      const prefix = "dyuqkn8c-export-20261013T071000Z";
      const archive = path.join(root, "out.tar.gz");
      const pack = new Pack({ gzip: true, cwd: work, prefix, portable: true });
      pack.add("data.ndjson");
      pack.add("images");
      pack.add("files");
      pack.end();
      await finished(pack.pipe(createWriteStream(archive)));

      const paths: string[] = [];
      await list({
        file: archive,
        onReadEntry(entry) {
          paths.push(entry.path);
        },
      });

      expect(findDataNdjsonEntry(paths)).toBe(`${prefix}/data.ndjson`);
      expect(countAssetEntries(paths)).toEqual({ images: 1, files: 0 });
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe("sanityExportArgv", () => {
  it("exports production for the fixed project", () => {
    expect(sanityExportArgv("/tmp/x.tar.gz")).toEqual([
      "npx",
      "sanity",
      "datasets",
      "export",
      "production",
      "/tmp/x.tar.gz",
      "--project-id",
      "dyuqkn8c",
    ]);
  });
});

describe("runSanityBackup", () => {
  const lines: string[] = [];

  async function run(
    env: Readonly<Record<string, string | undefined>>,
  ): Promise<number> {
    lines.length = 0;
    return runSanityBackup({
      argv: [],
      env,
      repoRoot: "/repo",
      homeDir: "/home/ola",
      now: NOW,
      writeLine: (line) => {
        lines.push(line);
      },
      spawnExport: () => {
        throw new Error("spawnExport");
      },
      realpath: identityRealpath(),
      exists: () => false,
      mkdir: () => undefined,
      hashFile: () => Promise.resolve("abc"),
      listArchive: () => Promise.resolve([]),
      readArchiveText: () => Promise.resolve(""),
      removeFile: () => undefined,
      restrictFile: () => undefined,
      writeChecksum: () => undefined,
    });
  }

  it("restricts the archive and checksum to the owner", async () => {
    lines.length = 0;
    const calls: string[] = [];
    const code = await runSanityBackup({
      argv: [],
      env: { SANITY_AUTH_TOKEN: "t", SANITY_BACKUP_DIR: "/backups" },
      repoRoot: "/repo",
      homeDir: "/home/ola",
      now: NOW,
      writeLine: (line) => {
        lines.push(line);
      },
      spawnExport: () => Promise.resolve(0),
      realpath: identityRealpath(),
      exists: () => false,
      mkdir: () => undefined,
      hashFile: (file) => {
        calls.push(`hash ${path.basename(file)}`);
        return Promise.resolve("abc");
      },
      listArchive: () => Promise.resolve(["x/data.ndjson"]),
      readArchiveText: () => Promise.resolve(""),
      removeFile: () => undefined,
      restrictFile: (file) => {
        calls.push(`restrict ${path.basename(file)}`);
      },
      writeChecksum: (file) => {
        calls.push(`checksum ${path.basename(file)}`);
      },
    });
    expect(code).toBe(0);
    const archive = "sanity-dyuqkn8c-production-20261013T051000Z.tar.gz";
    expect(
      calls.map((c) => c.replace(/\d{8}T\d{6}Z/, "20261013T051000Z")),
    ).toEqual([
      `restrict ${archive}`,
      `hash ${archive}`,
      `checksum ${archive}.sha256`,
      `restrict ${archive}.sha256`,
    ]);
  });

  it("stops when the token is blank and does not export", async () => {
    const code = await run({ SANITY_AUTH_TOKEN: "  " });
    expect(code).toBe(1);
    expect(lines).toEqual([
      "Brak SANITY_AUTH_TOKEN. Ustaw zmienną środowiska i uruchom ponownie.",
    ]);
  });

  it("refuses a backup directory inside the repo without printing the token", async () => {
    const code = await run({
      SANITY_AUTH_TOKEN: "sekret-testowy",
      SANITY_BACKUP_DIR: "/repo/output",
    });
    expect(code).toBe(1);
    expect(lines).toEqual([INSIDE_REPO]);
  });
});

describe("runbook", () => {
  it("documents the export command and the npm script", () => {
    const doc = readFileSync(
      fileURLToPath(
        new URL("../../docs/SANITY-BACKUP-RESTORE.md", import.meta.url),
      ),
      "utf8",
    );
    expect(doc).toContain(
      sanityExportArgv(
        "~/sanity-backups/sanity-dyuqkn8c-production-<UTC>.tar.gz",
      ).join(" "),
    );
    expect(doc).toContain("npm run backup:sanity");
  });
});

function isEnoent(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

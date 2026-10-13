import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  createReadStream,
  lstatSync,
  mkdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

import { list } from "tar";

import { runSanityBackup } from "../src/lib/sanity-backup";

export function isBackupCliEntry(
  argv1: string | undefined,
  moduleUrl: string,
): boolean {
  if (!argv1) return false;
  return pathToFileURL(path.resolve(argv1)).href === moduleUrl;
}

async function main(): Promise<void> {
  try {
    const code = await runSanityBackup({
      argv: process.argv.slice(2),
      env: process.env,
      repoRoot: path.resolve(fileURLToPath(new URL("..", import.meta.url))),
      homeDir: homedir(),
      now: new Date(),
      writeLine: (line) => {
        process.stdout.write(`${line}\n`);
      },
      spawnExport,
      realpath,
      exists,
      mkdir,
      hashFile,
      listArchive,
      readArchiveText,
      removeFile,
      writeChecksum,
    });
    if (code !== 0) process.exit(code);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  }
}

function realpath(absolutePath: string): string | null {
  try {
    return realpathSync(absolutePath);
  } catch (error) {
    if (isEnoent(error)) return null;
    throw error;
  }
}

function exists(absolutePath: string): boolean {
  try {
    lstatSync(absolutePath);
    return true;
  } catch (error) {
    if (isEnoent(error)) return false;
    throw error;
  }
}

function mkdir(directory: string): void {
  mkdirSync(directory, { recursive: true });
}

function removeFile(filePath: string): void {
  rmSync(filePath);
}

async function hashFile(filePath: string): Promise<string> {
  const hash = createHash("sha256");
  await pipeline(createReadStream(filePath), hash);
  return hash.digest("hex");
}

function writeChecksum(
  checksumPath: string,
  archiveBasename: string,
  hex: string,
): void {
  writeFileSync(checksumPath, `${hex}  ${archiveBasename}\n`, { flag: "wx" });
}

async function listArchive(archivePath: string): Promise<readonly string[]> {
  const paths: string[] = [];
  await list({
    file: archivePath,
    onReadEntry(entry) {
      paths.push(entry.path);
    },
  });
  return paths;
}

async function readArchiveText(
  archivePath: string,
  entryName: string,
): Promise<string> {
  let captured: Promise<string> | undefined;
  await list(
    {
      file: archivePath,
      filter: (entryPath) => entryPath === entryName,
      onReadEntry(entry) {
        captured = new Promise((resolve, reject) => {
          const chunks: Buffer[] = [];
          entry.on("data", (chunk: Buffer | string) => {
            chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          });
          entry.on("end", () => {
            resolve(Buffer.concat(chunks).toString("utf8"));
          });
          entry.on("error", reject);
        });
      },
    },
    [entryName],
  );
  if (captured === undefined) {
    throw new Error("Archiwum nie zawiera data.ndjson.");
  }
  return captured;
}

function spawnExport(
  argv: readonly [string, ...string[]],
  env: NodeJS.ProcessEnv,
): Promise<number> {
  const [command, ...args] = argv;
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: path.resolve(fileURLToPath(new URL("..", import.meta.url))),
      env,
      shell: false,
      stdio: "inherit",
    });
    let settled = false;
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    });
    child.once("close", (code) => {
      if (settled) return;
      settled = true;
      resolve(code ?? 1);
    });
  });
}

function isEnoent(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

if (isBackupCliEntry(process.argv[1], import.meta.url)) {
  void main();
}

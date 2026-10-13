import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, readlinkSync } from "node:fs";
import { createServer } from "node:net";
import path from "node:path";

function listeningInodes(port) {
  const inodes = new Set();
  for (const file of ["/proc/net/tcp", "/proc/net/tcp6"]) {
    if (!existsSync(file)) continue;
    const lines = readFileSync(file, "utf8").trim().split("\n").slice(1);
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const local = parts[1];
      const state = parts[3];
      const inode = parts[9];
      const hexPort = local?.split(":")[1];
      if (state === "0A" && Number.parseInt(hexPort, 16) === port) {
        inodes.add(inode);
      }
    }
  }
  return inodes;
}

export function portOwnedBy(port, pid) {
  if (process.platform === "darwin") {
    const result = spawnSync(
      "/usr/sbin/lsof",
      ["-nP", "-a", "-p", String(pid), `-iTCP:${port}`, "-sTCP:LISTEN", "-Fp"],
      { encoding: "utf8" },
    );
    if (result.error || (result.status !== 0 && result.status !== 1)) {
      throw new Error("Cannot inspect listener ownership with /usr/sbin/lsof.");
    }
    return result.stdout.split("\n").includes(`p${pid}`);
  }
  if (process.platform !== "linux") {
    throw new Error(
      `Listener ownership is unsupported on ${process.platform}.`,
    );
  }
  const inodes = listeningInodes(port);
  const fdDir = `/proc/${pid}/fd`;
  if (inodes.size === 0 || !existsSync(fdDir)) return false;
  for (const fd of readdirSync(fdDir)) {
    try {
      const target = readlinkSync(path.join(fdDir, fd));
      const match = /^socket:\[(\d+)\]$/.exec(target);
      if (match && inodes.has(match[1])) return true;
    } catch {
      // The fd can disappear while we read the process.
    }
  }
  return false;
}

export function portFree(port) {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    probe.listen({ host: "127.0.0.1", port, exclusive: true }, () => {
      probe.close((error) => {
        if (error) reject(error);
        else resolve(true);
      });
    });
  });
}

export function homeIdentity(html) {
  const head = /<head\b[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1];
  const title = /<title>([^<]+)<\/title>/i.exec(head ?? "")?.[1];
  const canonical = /<link\b[^>]*\brel="canonical"[^>]*>/i.exec(
    head ?? "",
  )?.[0];
  if (!title || !canonical) {
    throw new Error("Home HTML is missing its title or canonical link.");
  }
  return { title, canonical };
}

export function assertHomeIdentity(html, builtHtml) {
  const expected = homeIdentity(builtHtml);
  const actual = homeIdentity(html);
  if (
    actual.title !== expected.title ||
    actual.canonical !== expected.canonical
  ) {
    throw new Error(
      "Home title or canonical link differs from dist/index.html.",
    );
  }
  return expected.title;
}

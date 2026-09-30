#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function runId() {
  const id = process.env.VERIFY_RUN_ID;
  if (!id || !/^[A-Za-z0-9._-]+$/.test(id)) {
    fail("Set VERIFY_RUN_ID to a token of letters, numbers, dots, underscores, or hyphens.");
  }
  return id;
}

function stateDir(id) {
  return path.join("/tmp/ola-verify", id);
}

function evidenceDir(id) {
  return path.join("/tmp/ola-verify-evidence", id);
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function flags(argv) {
  const named = {};
  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) named[key] = true;
    else {
      named[key] = next;
      index += 1;
    }
  }
  return { named, positional };
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function stopPid(pid) {
  if (!alive(pid)) return;
  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      return;
    }
  }
  const started = Date.now();
  while (alive(pid) && Date.now() - started < 5000) {
    spawnSync("sleep", ["0.1"]);
  }
  if (!alive(pid)) return;
  try {
    process.kill(-pid, "SIGKILL");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      return;
    }
  }
}

function portOwner(port) {
  const probe = spawnSync("ss", ["-ltnp", `sport = :${port}`], {
    encoding: "utf8",
  });
  if (probe.status !== 0) return "";
  return probe.stdout;
}

function portFree(port) {
  return !portOwner(port).includes("pid=");
}

async function waitForHttp(url) {
  const started = Date.now();
  let last = "no response";
  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      last = `HTTP ${response.status}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await sleep(200);
  }
  throw new Error(`Timed out waiting for ${url}: ${last}`);
}

function transcript(id, line) {
  const file = path.join(evidenceDir(id), "transcript.jsonl");
  mkdirSync(evidenceDir(id), { recursive: true });
  appendFileSync(file, `${JSON.stringify({ at: new Date().toISOString(), ...line })}\n`);
}

function requireNode24() {
  const major = Number(process.versions.node.split(".")[0]);
  if (major < 24) {
    fail(
      `Node ${process.version} is below 24. Use the version in .node-version before launching.`,
    );
  }
}

async function launch() {
  requireNode24();
  const id = runId();
  const dir = stateDir(id);
  if (existsSync(path.join(dir, "server.json"))) {
    const existing = readJson(path.join(dir, "server.json"));
    if (alive(existing.pid)) {
      fail(
        `Run ${id} already has preview pid ${existing.pid} on port ${existing.port}.`,
      );
    }
  }
  if (!existsSync(path.join(repoRoot, "dist/index.html"))) {
    fail("dist/index.html is missing. From the repo root run: npm run build");
  }
  mkdirSync(dir, { recursive: true });
  mkdirSync(evidenceDir(id), { recursive: true });
  let port = 0;
  for (let candidate = 4340; candidate <= 4390; candidate += 1) {
    if (portFree(candidate)) {
      port = candidate;
      break;
    }
  }
  if (port === 0) fail("No free verification port in 4340-4390.");
  const log = openSync(path.join(dir, "preview.log"), "a");
  const child = spawn(
    process.execPath,
    [path.join(scriptDir, "preview-server.mjs"), String(port)],
    {
      cwd: repoRoot,
      detached: true,
      stdio: ["ignore", log, log],
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" },
    },
  );
  child.unref();
  const state = {
    pid: child.pid,
    port,
    runId: id,
    node: process.version,
    startedAt: new Date().toISOString(),
  };
  writeFileSync(path.join(dir, "server.json"), `${JSON.stringify(state, null, 2)}\n`);
  try {
    await waitForHttp(`http://127.0.0.1:${port}/`);
  } catch (error) {
    stopPid(child.pid);
    fail(error instanceof Error ? error.message : String(error));
  }
  process.stdout.write(
    `VERIFY_RUN_ID=${id}\nbase=http://127.0.0.1:${port}\npid=${child.pid}\nevidence=${evidenceDir(id)}\n`,
  );
}

async function doctor() {
  const id = runId();
  const file = path.join(stateDir(id), "server.json");
  if (!existsSync(file)) fail(`No server state for ${id}. Launch first.`);
  const state = readJson(file);
  if (!alive(state.pid)) fail(`Preview pid ${state.pid} is not running.`);
  const owners = portOwner(state.port);
  if (!owners.includes(`pid=${state.pid},`)) {
    fail(`Port ${state.port} is not owned by pid ${state.pid}.\n${owners}`);
  }
  const response = await fetch(`http://127.0.0.1:${state.port}/`);
  const body = await response.text();
  if (!response.ok) fail(`Home returned HTTP ${response.status}.`);
  const marker = "Aleksandra Olesiewicz — strona główna";
  if (!body.includes(marker)) fail(`Home HTML is missing ${marker}.`);
  const browserFile = path.join(stateDir(id), "browser.json");
  let browserLine = "browser=not-started";
  if (existsSync(browserFile)) {
    const browser = readJson(browserFile);
    if (!alive(browser.pid)) fail(`Browser pid ${browser.pid} is not running.`);
    const health = await fetch(`http://127.0.0.1:${browser.controlPort}/`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-verify-token": browser.token,
      },
      body: JSON.stringify({ cmd: "health" }),
    });
    const healthBody = await health.json();
    if (!healthBody.ok) fail("Browser control port failed health.");
    browserLine = `browser=pid ${browser.pid} control ${browser.controlPort}`;
  }
  process.stdout.write(
    `run=${id}\nbase=http://127.0.0.1:${state.port}\npid=${state.pid}\nnode=${state.node}\nmarker=${marker}\n${browserLine}\nevidence=${evidenceDir(id)}\n`,
  );
}

async function browserStart() {
  requireNode24();
  const id = runId();
  const serverFile = path.join(stateDir(id), "server.json");
  if (!existsSync(serverFile)) fail("Launch the preview before the browser.");
  const server = readJson(serverFile);
  if (!alive(server.pid)) fail("Preview is not running.");
  const browserFile = path.join(stateDir(id), "browser.json");
  if (existsSync(browserFile) && alive(readJson(browserFile).pid)) {
    fail("Browser session is already running for this VERIFY_RUN_ID.");
  }
  const token = randomBytes(16).toString("hex");
  const log = openSync(path.join(stateDir(id), "browser.log"), "a");
  const child = spawn(process.execPath, [path.join(scriptDir, "browser-session.mjs")], {
    cwd: repoRoot,
    detached: true,
    stdio: ["ignore", "pipe", log],
    env: {
      ...process.env,
      VERIFY_BASE_URL: `http://127.0.0.1:${server.port}`,
      VERIFY_BROWSER_TOKEN: token,
      VERIFY_EVIDENCE_ROOT: evidenceDir(id),
    },
  });
  let announced = "";
  child.stdout.on("data", (chunk) => {
    announced += chunk.toString("utf8");
  });
  const started = Date.now();
  while (!announced.includes("control ") && Date.now() - started < 30000) {
    if (child.exitCode !== null) {
      fail(`Browser session exited ${child.exitCode}. See ${stateDir(id)}/browser.log`);
    }
    await sleep(100);
  }
  const match = announced.match(/control (\d+)/);
  if (!match) fail("Browser session did not announce a control port.");
  child.unref();
  const state = {
    pid: child.pid,
    controlPort: Number(match[1]),
    token,
  };
  writeFileSync(browserFile, `${JSON.stringify(state, null, 2)}\n`);
  process.stdout.write(`browser-pid=${child.pid}\ncontrol=${state.controlPort}\n`);
}

async function browserCommand(argv) {
  const id = runId();
  const { named, positional } = flags(argv);
  const command = positional[0];
  if (!command) fail("Missing browser command.");
  if (command === "start") {
    await browserStart();
    return;
  }
  const browserFile = path.join(stateDir(id), "browser.json");
  if (!existsSync(browserFile)) fail("Start the browser session first.");
  const browser = readJson(browserFile);
  const body = { cmd: command };
  if (named.path) body.path = named.path;
  if (named.role) body.role = named.role;
  if (named.name) body.name = named.name;
  if (named.exact === true) body.exact = true;
  if (named.value !== undefined) body.value = named.value;
  if (named.key) body.key = named.key;
  if (named.state) body.state = named.state;
  if (named.text !== undefined) body.text = named.text;
  if (named.attribute) body.attribute = named.attribute;
  if (named.count !== undefined) body.count = Number(named.count);
  if (named.javascript === "false") body.javascript = false;
  if (command === "context" && named.javascript === undefined) {
    body.javascript = true;
  }
  if (command === "snapshot" && named.aria !== true) {
    fail("snapshot requires --aria");
  }
  const response = await fetch(`http://127.0.0.1:${browser.controlPort}/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-verify-token": browser.token,
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  transcript(id, { command, named, ok: result.ok, detail: result.detail });
  if (!result.ok) fail(result.detail);
  process.stdout.write(`${result.detail}\n`);
}

function cleanup() {
  const id = runId();
  const dir = stateDir(id);
  const browserFile = path.join(dir, "browser.json");
  if (existsSync(browserFile)) stopPid(readJson(browserFile).pid);
  const serverFile = path.join(dir, "server.json");
  if (existsSync(serverFile)) stopPid(readJson(serverFile).pid);
  rmSync(dir, { recursive: true, force: true });
  const evidence = evidenceDir(id);
  process.stdout.write(`cleaned ${id}\nevidence=${evidence}\n`);
  if (!existsSync(evidence)) fail(`Evidence directory is missing: ${evidence}`);
}

const [action, ...rest] = process.argv.slice(2);
if (action === "launch") await launch();
else if (action === "doctor") await doctor();
else if (action === "cleanup") cleanup();
else if (action === "browser") await browserCommand(rest);
else {
  fail("Usage: verify.mjs launch|doctor|cleanup|browser");
}

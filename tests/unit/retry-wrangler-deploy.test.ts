import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  classifyDeployFailure,
  parseRetryArgs,
  runWranglerDeployWithRetry,
  type DeployProcessResult,
  type DeploySpawn,
} from "@/lib/deploy/retry-wrangler";

const previewCommand = [
  "npx",
  "wrangler",
  "deploy",
  "--config",
  "preview/dist/server/wrangler.json",
] as const;

const malformed504 = [
  "✘ [ERROR] Received a malformed response from the API",
  "",
  "  upstream request timeout",
  "  GET /accounts/abc/workers/scripts -> 504 Gateway Timeout",
].join("\n");

const html504 = [
  "✘ [ERROR] Received a malformed response from the API",
  "",
  "  <!DOCTYPE html>",
  "  <title>api.cloudflare.com | 504: Gateway time-out</title>",
  "  Error 504",
  "  POST /accounts/abc/workers/scripts/ola-website-preview-production/assets-upload-session -> 504",
].join("\n");

function failure(output: string, exitCode = 1): DeployProcessResult {
  return { exitCode, signal: null, output };
}

function scripted(results: DeployProcessResult[]) {
  const calls: Array<{
    command: readonly string[];
    env: NodeJS.ProcessEnv;
  }> = [];
  const spawnProcess: DeploySpawn = (command, env) => {
    calls.push({ command, env });
    const next = results.shift();
    if (!next) throw new Error("Nieoczekiwana próba.");
    return Promise.resolve(next);
  };
  return { calls, spawnProcess };
}

describe("classifyDeployFailure", () => {
  it.each([
    ["malformed 504", malformed504, "transient"],
    ["html 504", html504, "transient"],
    [
      "asset upload 524",
      "APIError: Received a malformed response from the API\nPOST /accounts/abc/workers/assets/upload?base64=true -> 524",
      "transient",
    ],
    [
      "fetch timeout",
      "TypeError: fetch failed\nError: connect ETIMEDOUT 1.2.3.4:443",
      "transient",
    ],
    [
      "request timeout status",
      "A request to the Cloudflare API (/accounts/abc/workers/scripts) failed.\nGET /accounts/abc/workers/scripts -> 408",
      "transient",
    ],
    [
      "reset connection",
      "TypeError: fetch failed\nError: socket hang up\ncode: ECONNRESET",
      "transient",
    ],
    [
      "missing entry",
      "✘ [ERROR] Missing entry-point: The entry-point should be specified via the command line",
      "permanent",
    ],
    [
      "auth 401",
      "Authentication error [code: 10000]\nInvalid access token [code: 9109]\nGET /accounts/abc/workers/scripts -> 401",
      "permanent",
    ],
    [
      "missing environment",
      '✘ [ERROR] No environment found in configuration with name "staging"',
      "permanent",
    ],
    [
      "missing npm script",
      'npm ERR! Missing script: "deploy:studio"',
      "permanent",
    ],
    [
      "missing config file",
      "Error: ENOENT: no such file or directory, open 'preview/dist/server/wrangler.json'",
      "permanent",
    ],
    [
      "worker name mismatch",
      "✘ [ERROR] The name in your Wrangler configuration file (ola-website-preview) must match the name of your Worker.",
      "permanent",
    ],
    ["unknown failure", "✘ [ERROR] Something unexpected happened", "permanent"],
    [
      "rate limit",
      "A request to the Cloudflare API (/accounts/abc/workers/scripts) failed.\nPOST /accounts/abc/workers/scripts -> 429",
      "permanent",
    ],
    [
      "config wins over a malformed phrase",
      "Missing entry-point: The entry-point should be specified\nReceived a malformed response from the API",
      "permanent",
    ],
  ] as const)("%s", (_name, output, expected) => {
    expect(classifyDeployFailure(output)).toBe(expected);
  });
});

describe("runWranglerDeployWithRetry", () => {
  it("runs the exact command once when deploy succeeds", async () => {
    const waits: number[] = [];
    const lines: string[] = [];
    const env = {
      CLOUDFLARE_ENV: "production",
      CLOUDFLARE_API_TOKEN: "token",
    };
    const { calls, spawnProcess } = scripted([
      { exitCode: 0, signal: null, output: "Uploaded" },
    ]);

    const result = await runWranglerDeployWithRetry({
      command: previewCommand,
      env,
      spawnProcess,
      sleep: async (milliseconds) => {
        waits.push(milliseconds);
      },
      writeLine: (line) => lines.push(line),
    });

    expect(result).toEqual({ exitCode: 0, attemptsUsed: 1 });
    expect(waits).toEqual([]);
    expect(lines).toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.command).toEqual([...previewCommand]);
    expect(calls[0]?.env.CLOUDFLARE_API_TOKEN).toBe("token");
    expect(calls[0]?.env.CLOUDFLARE_ENV).toBeUndefined();
    expect(env.CLOUDFLARE_ENV).toBe("production");
  });

  it("retries a transient failure with 20s then 60s and keeps the same command", async () => {
    const waits: number[] = [];
    const lines: string[] = [];
    const { calls, spawnProcess } = scripted([
      failure(malformed504),
      failure(html504),
      { exitCode: 0, signal: null, output: "Success" },
    ]);

    const result = await runWranglerDeployWithRetry({
      command: ["npm", "run", "deploy:studio"],
      env: { CLOUDFLARE_ENV: "production", PATH: "/usr/bin" },
      spawnProcess,
      sleep: async (milliseconds) => {
        waits.push(milliseconds);
      },
      writeLine: (line) => lines.push(line),
    });

    expect(result).toEqual({ exitCode: 0, attemptsUsed: 3 });
    expect(waits).toEqual([20_000, 60_000]);
    expect(lines).toEqual([
      "Przejściowy błąd API Cloudflare. Ponowienie 2 z 3 za 20 s.",
      "Przejściowy błąd API Cloudflare. Ponowienie 3 z 3 za 60 s.",
    ]);
    expect(calls.map((call) => call.command)).toEqual([
      ["npm", "run", "deploy:studio"],
      ["npm", "run", "deploy:studio"],
      ["npm", "run", "deploy:studio"],
    ]);
    expect(calls.every((call) => call.env.CLOUDFLARE_ENV === undefined)).toBe(
      true,
    );
    expect(calls.every((call) => call.env.PATH === "/usr/bin")).toBe(true);
  });

  it("stops on a config error without sleeping", async () => {
    const waits: number[] = [];
    const { calls, spawnProcess } = scripted([
      failure(
        "✘ [ERROR] Missing entry-point: The entry-point should be specified",
        1,
      ),
      { exitCode: 0, signal: null, output: "should not run" },
    ]);

    const result = await runWranglerDeployWithRetry({
      command: [
        "npx",
        "wrangler",
        "deploy",
        "--config",
        "wrangler.jsonc",
        "--env",
        "production",
      ],
      env: {},
      spawnProcess,
      sleep: async (milliseconds) => {
        waits.push(milliseconds);
      },
    });

    expect(result).toEqual({ exitCode: 1, attemptsUsed: 1 });
    expect(waits).toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.command).toEqual([
      "npx",
      "wrangler",
      "deploy",
      "--config",
      "wrangler.jsonc",
      "--env",
      "production",
    ]);
  });

  it("returns the last exit code after three transient failures", async () => {
    const waits: number[] = [];
    const { calls, spawnProcess } = scripted([
      failure(malformed504, 1),
      failure("TypeError: fetch failed\nETIMEDOUT", 2),
      failure(html504, 3),
    ]);

    const result = await runWranglerDeployWithRetry({
      command: previewCommand,
      env: {},
      spawnProcess,
      sleep: async (milliseconds) => {
        waits.push(milliseconds);
      },
    });

    expect(result).toEqual({ exitCode: 3, attemptsUsed: 3 });
    expect(waits).toEqual([20_000, 60_000]);
    expect(calls).toHaveLength(3);
  });

  it("does not retry an empty failure", async () => {
    const { calls, spawnProcess } = scripted([failure("")]);
    const result = await runWranglerDeployWithRetry({
      command: previewCommand,
      env: {},
      spawnProcess,
      sleep: async () => {
        throw new Error("sleep");
      },
    });
    expect(result).toEqual({ exitCode: 1, attemptsUsed: 1 });
    expect(calls).toHaveLength(1);
  });
});

describe("parseRetryArgs", () => {
  it("defaults to 3 attempts and 20s then 60s", () => {
    expect(parseRetryArgs(["--", ...previewCommand])).toEqual({
      command: [...previewCommand],
      attempts: 3,
      backoffSeconds: [20, 60],
    });
  });

  it("keeps --env after the separator", () => {
    expect(
      parseRetryArgs([
        "--attempts",
        "3",
        "--backoff",
        "0,0",
        "--",
        "npx",
        "wrangler",
        "deploy",
        "--config",
        "wrangler.jsonc",
        "--env",
        "staging",
      ]),
    ).toEqual({
      command: [
        "npx",
        "wrangler",
        "deploy",
        "--config",
        "wrangler.jsonc",
        "--env",
        "staging",
      ],
      attempts: 3,
      backoffSeconds: [0, 0],
    });
  });

  it("rejects a missing command and a bad attempt count", () => {
    expect(() => parseRetryArgs(["--attempts", "3"])).toThrow(
      "Użycie: retry-wrangler-deploy -- [--attempts N] [--backoff 20,60] -- <polecenie>",
    );
    expect(() => parseRetryArgs(["--attempts", "0", "--", "npx"])).toThrow(
      "Liczba prób musi być dodatnią liczbą całkowitą.",
    );
    expect(() => parseRetryArgs(["--backoff", "20,-1", "--", "npx"])).toThrow(
      "Odstępy muszą być nieujemnymi liczbami całkowitymi.",
    );
  });
});

describe("retry-wrangler-deploy CLI", () => {
  async function runCli(
    mode: string,
    args: readonly string[],
    extraEnv: NodeJS.ProcessEnv = {},
  ) {
    const directory = await mkdtemp(path.join(tmpdir(), "wrangler-retry-"));
    const counter = path.join(directory, "count");
    const fake = path.join(directory, "fake.mjs");
    await writeFile(counter, "0", "utf8");
    await writeFile(
      fake,
      [
        "import { readFileSync, writeFileSync } from 'node:fs';",
        "const counter = process.env.FAKE_COUNTER;",
        "const count = Number(readFileSync(counter, 'utf8')) + 1;",
        "writeFileSync(counter, String(count));",
        "if (process.env.CLOUDFLARE_ENV) process.exit(9);",
        "process.stdout.write(process.argv.slice(2).join(' ') + '\\n');",
        "const mode = process.env.FAKE_MODE;",
        "if (mode === 'transient-once' && count === 1) {",
        "  process.stderr.write('Received a malformed response from the API\\n');",
        "  process.stderr.write('GET /accounts/abc/workers/scripts -> 504 Gateway Timeout\\n');",
        "  process.exit(1);",
        "}",
        "if (mode === 'always-transient') {",
        "  process.stderr.write('TypeError: fetch failed\\nETIMEDOUT\\n');",
        "  process.exit(1);",
        "}",
        "if (mode === 'config') {",
        "  process.stderr.write('Missing entry-point: The entry-point should be specified\\n');",
        "  process.exit(1);",
        "}",
        "process.exit(0);",
        "",
      ].join("\n"),
      "utf8",
    );
    const child = spawn(
      "node",
      [
        "--import",
        "tsx",
        "scripts/retry-wrangler-deploy.ts",
        "--backoff",
        "0,0",
        "--",
        "node",
        fake,
        ...args,
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          CLOUDFLARE_ENV: "production",
          FAKE_COUNTER: counter,
          FAKE_MODE: mode,
          ...extraEnv,
        },
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    const exitCode = await new Promise<number>((resolve, reject) => {
      child.on("error", reject);
      child.on("close", (code) => resolve(code ?? 1));
    });
    const attempts = Number(await readFile(counter, "utf8"));
    await rm(directory, { recursive: true, force: true });
    return { exitCode, attempts, stdout, stderr };
  }

  it("retries one malformed response and then succeeds without CLOUDFLARE_ENV", async () => {
    const result = await runCli("transient-once", [
      "--config",
      "preview/dist/server/wrangler.json",
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.attempts).toBe(2);
    expect(result.stdout).toBe(
      "--config preview/dist/server/wrangler.json\n--config preview/dist/server/wrangler.json\n",
    );
    expect(result.stderr).toContain(
      "Przejściowy błąd API Cloudflare. Ponowienie 2 z 3 za 0 s.",
    );
    expect(result.stderr).not.toContain("CLOUDFLARE_API_TOKEN");
  });

  it("does not retry a config error", async () => {
    const result = await runCli("config", ["--env", "production"]);
    expect(result.exitCode).toBe(1);
    expect(result.attempts).toBe(1);
    expect(result.stdout).toBe("--env production\n");
  });

  it("stops after three transient failures", async () => {
    const result = await runCli("always-transient", []);
    expect(result.exitCode).toBe(1);
    expect(result.attempts).toBe(3);
    expect(result.stderr).toContain("Ponowienie 3 z 3 za 0 s.");
    expect(result.stderr).not.toContain("Ponowienie 4 z 3");
  });
});

function workflow(name: string): string {
  return readFileSync(`.github/workflows/${name}`, "utf8");
}

function step(yaml: string, name: string): string {
  const marker = `      - name: ${name}\n`;
  const start = yaml.indexOf(marker);
  if (start < 0) throw new Error(`Brak kroku ${name}`);
  const rest = yaml.slice(start + marker.length);
  const next = rest.indexOf("\n      - ");
  return next < 0 ? rest : rest.slice(0, next);
}

describe("deploy workflows", () => {
  it("keeps the preview worker name and the main skip", () => {
    const yaml = workflow("deploy-preview.yml");
    const build = step(yaml, "Build production preview");
    const deploy = step(yaml, "Deploy preview with existing server secrets");
    const skip = step(yaml, "Skip an outdated Quality run");
    expect(yaml).toContain("timeout-minutes: 25");
    expect(build).toContain("CLOUDFLARE_ENV: production");
    expect(build).toContain("npm run build --workspace @ola/preview");
    expect(deploy).not.toContain("CLOUDFLARE_ENV");
    expect(deploy).toContain("if: steps.current.outputs.deploy == 'true'");
    expect(deploy).toContain(
      "node --import tsx scripts/retry-wrangler-deploy.ts -- npx wrangler deploy --config preview/dist/server/wrangler.json",
    );
    expect(deploy).not.toContain("--env");
    expect(skip).toContain(
      "current_main=$(git ls-remote origin refs/heads/main | cut -f1)",
    );
    expect(skip).toContain('echo "deploy=false" >> "$GITHUB_OUTPUT"');
  });

  it("retries Studio deploy and leaves schema registration after it", () => {
    const yaml = workflow("deploy-studio.yml");
    const deploy = step(yaml, "Deploy Studio to Cloudflare");
    const register = step(yaml, "Register external Studio and deploy schemas");
    const skip = step(yaml, "Skip an outdated Quality run");
    expect(yaml).toContain("timeout-minutes: 25");
    expect(deploy).not.toContain("CLOUDFLARE_ENV");
    expect(deploy).toContain("if: steps.current.outputs.deploy == 'true'");
    expect(deploy).toContain(
      "node --import tsx scripts/retry-wrangler-deploy.ts -- npm run deploy:studio",
    );
    expect(register).not.toContain("retry-wrangler-deploy");
    expect(register).toContain("npx sanity deploy --external");
    expect(yaml.indexOf("Deploy Studio to Cloudflare")).toBeLessThan(
      yaml.indexOf("Register external Studio and deploy schemas"),
    );
    expect(skip).toContain(
      "current_main=$(git ls-remote origin refs/heads/main | cut -f1)",
    );
    expect(skip).toContain(
      "Main changed after Quality; waiting for its successful run.",
    );
  });

  it("runs IndexNow only after a successful production deploy", () => {
    const yaml = workflow("publish-content.yml");
    const deploy = step(yaml, "Deploy immutable successful build");
    const notify = step(yaml, "Notify IndexNow after successful deployment");
    expect(yaml).toContain("timeout-minutes: 25");
    expect(deploy).toContain("id: deploy");
    expect(deploy).not.toContain("CLOUDFLARE_ENV");
    expect(deploy).not.toContain("continue-on-error");
    expect(deploy).toContain(
      'node --import tsx scripts/retry-wrangler-deploy.ts -- npx wrangler deploy --config wrangler.jsonc --env "$DEPLOYMENT_TARGET"',
    );
    expect(notify).toBe(
      [
        "        if: success() && steps.deploy.outcome == 'success' && env.DEPLOYMENT_TARGET == 'production' && env.SITE_INDEXING == 'production' && env.INDEXNOW_KEY != ''",
        "        env:",
        "          CAPTURE_OUTCOME: ${{ steps.indexnow_capture.outcome }}",
        "          RESTORE_OUTCOME: ${{ steps.indexnow_restore.outcome }}",
        "          UPLOAD_OUTCOME: ${{ steps.indexnow_upload.outcome }}",
        "        run: |",
        '          if [ "$CAPTURE_OUTCOME" != "success" ]; then',
        '            echo "::error::Wdrożenie zakończyło się sukcesem. IndexNow nie został zgłoszony, ponieważ pobranie poprzedniego sitemap nie powiodło się."',
        "            exit 1",
        "          fi",
        '          if [ "$RESTORE_OUTCOME" != "success" ] && [ "$UPLOAD_OUTCOME" != "success" ]; then',
        '            echo "::error::Wdrożenie zakończyło się sukcesem. IndexNow nie został zgłoszony, ponieważ migawka sprzed wdrożenia nie jest zachowana do ponowienia."',
        "            exit 1",
        "          fi",
        "          if ! npm run indexnow -- --send; then",
        '            echo "::error::Wdrożenie zakończyło się sukcesem. Zgłoszenie IndexNow nie zostało potwierdzone."',
        "            exit 1",
        "          fi",
      ].join("\n"),
    );
    expect(yaml.indexOf("Capture sitemap before deployment")).toBeLessThan(
      yaml.indexOf("Deploy immutable successful build"),
    );
    expect(yaml.indexOf("Deploy immutable successful build")).toBeLessThan(
      yaml.indexOf("Notify IndexNow after successful deployment"),
    );
  });

  it("alerts only about production publications that were not deployed", () => {
    const yaml = workflow("publish-content.yml");
    const alert = step(yaml, "Alert about failed production publication");
    expect(alert).toContain(
      "if: failure() && env.DEPLOYMENT_TARGET == 'production' && steps.deploy.outcome != 'success'",
    );
    expect(alert).toContain(
      "PUBLICATION_ALERT_WEBHOOK_URL: ${{ secrets.PUBLICATION_ALERT_WEBHOOK_URL }}",
    );
    expect(alert).toContain(
      'publication-alert.mjs failure "$RUNNER_TEMP/build.log"',
    );
    expect(step(yaml, "Validate and build public site")).toContain(
      '} 2>&1 | tee "$RUNNER_TEMP/build.log"',
    );
    expect(
      yaml.indexOf("Notify IndexNow after successful deployment"),
    ).toBeLessThan(yaml.indexOf("Alert about failed production publication"));
  });
});

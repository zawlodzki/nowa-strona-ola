import { spawn } from "node:child_process";

export const DEFAULT_DEPLOY_ATTEMPTS = 3;
export const DEFAULT_DEPLOY_BACKOFF_SECONDS = [20, 60] as const;

export type DeployFailureClass = "transient" | "permanent";

export type RetryPlan = {
  command: readonly string[];
  attempts: number;
  backoffSeconds: readonly number[];
};

export type DeployProcessResult = {
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  output: string;
};

export type DeploySpawn = (
  command: readonly string[],
  env: NodeJS.ProcessEnv,
) => Promise<DeployProcessResult>;

const PERMANENT_FAILURE = [
  /authentication error/i,
  /invalid access token/i,
  /not authenticated/i,
  /Missing entry-point/,
  /No environment found in configuration/,
  /error: unknown option/i,
  /Unknown argument:/,
  /Missing script:/,
  /ENOENT:/,
  /Wrangler configuration file/,
  /->\s*4(?!08\b|29\b)\d\d\b/,
] as const;

const TRANSIENT_FAILURE = [
  /Received a malformed response from the API/i,
  /->\s*5\d\d\b/,
  /->\s*408\b/,
  /Gateway time-?out/i,
  /Bad Gateway/i,
  /Service Unavailable/i,
  /\bError\s+5\d\d\b/,
  /error code:\s*5\d\d/i,
  /upstream request timeout/i,
  /ETIMEDOUT/,
  /ESOCKETTIMEDOUT/,
  /ECONNRESET/,
  /EAI_AGAIN/,
  /UND_ERR_(?:CONNECT|HEADERS|BODY)_TIMEOUT/,
  /fetch failed/,
  /socket hang up/i,
  /context deadline exceeded/i,
] as const;

export function deployEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const next = { ...env };
  delete next.CLOUDFLARE_ENV;
  return next;
}

export function classifyDeployFailure(output: string): DeployFailureClass {
  if (PERMANENT_FAILURE.some((pattern) => pattern.test(output)))
    return "permanent";
  if (TRANSIENT_FAILURE.some((pattern) => pattern.test(output)))
    return "transient";
  return "permanent";
}

function requireInteger(value: string | undefined, label: string): number {
  if (value === undefined || !/^\d+$/.test(value)) {
    throw new Error(`${label} musi być nieujemną liczbą całkowitą.`);
  }
  return Number(value);
}

export function parseRetryArgs(argv: readonly string[]): RetryPlan {
  const separator = argv.indexOf("--");
  if (separator < 0 || separator === argv.length - 1) {
    throw new Error(
      "Użycie: retry-wrangler-deploy -- [--attempts N] [--backoff 20,60] -- <polecenie>",
    );
  }
  let attempts: number = DEFAULT_DEPLOY_ATTEMPTS;
  let backoffSeconds: readonly number[] = DEFAULT_DEPLOY_BACKOFF_SECONDS;
  const flags = argv.slice(0, separator);
  for (let index = 0; index < flags.length; index += 1) {
    const flag = flags[index];
    if (flag === "--attempts") {
      const attemptsValue = requireInteger(flags[index + 1], "Liczba prób");
      if (attemptsValue < 1) {
        throw new Error("Liczba prób musi być dodatnią liczbą całkowitą.");
      }
      attempts = attemptsValue;
      index += 1;
      continue;
    }
    if (flag === "--backoff") {
      const raw = flags[index + 1];
      if (raw === undefined || raw === "") {
        throw new Error("Odstępy muszą być nieujemnymi liczbami całkowitymi.");
      }
      const parts = raw.split(",");
      if (parts.length === 0 || parts.some((part) => !/^\d+$/.test(part))) {
        throw new Error("Odstępy muszą być nieujemnymi liczbami całkowitymi.");
      }
      backoffSeconds = parts.map((part) => Number(part));
      index += 1;
      continue;
    }
    throw new Error(`Nieznana flaga: ${flag ?? ""}`);
  }
  return {
    command: argv.slice(separator + 1),
    attempts,
    backoffSeconds,
  };
}

function waitMilliseconds(
  backoffSeconds: readonly number[],
  failureIndex: number,
): number {
  const seconds =
    backoffSeconds[failureIndex] ??
    backoffSeconds[backoffSeconds.length - 1] ??
    0;
  return seconds * 1000;
}

export async function runWranglerDeployWithRetry(options: {
  command: readonly string[];
  env: NodeJS.ProcessEnv;
  spawnProcess: DeploySpawn;
  sleep: (milliseconds: number) => Promise<void>;
  attempts?: number;
  backoffSeconds?: readonly number[];
  writeLine?: (line: string) => void;
}): Promise<{ exitCode: number; attemptsUsed: number }> {
  const attempts = options.attempts ?? DEFAULT_DEPLOY_ATTEMPTS;
  const backoffSeconds =
    options.backoffSeconds ?? DEFAULT_DEPLOY_BACKOFF_SECONDS;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new Error("Liczba prób musi być dodatnią liczbą całkowitą.");
  }
  if (options.command.length === 0) {
    throw new Error("Brak polecenia wrangler deploy.");
  }
  const env = deployEnvironment(options.env);
  let exitCode = 1;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await options.spawnProcess(options.command, env);
    const failed = result.exitCode !== 0 || result.signal !== null;
    if (!failed) return { exitCode: 0, attemptsUsed: attempt };
    exitCode = result.exitCode ?? 1;
    const failureClass = classifyDeployFailure(result.output);
    if (failureClass !== "transient" || attempt === attempts) {
      return { exitCode, attemptsUsed: attempt };
    }
    const wait = waitMilliseconds(backoffSeconds, attempt - 1);
    options.writeLine?.(
      `Przejściowy błąd API Cloudflare. Ponowienie ${attempt + 1} z ${attempts} za ${wait / 1000} s.`,
    );
    if (wait > 0) await options.sleep(wait);
  }
  return { exitCode, attemptsUsed: attempts };
}

export function spawnDeployProcess(
  command: readonly string[],
  env: NodeJS.ProcessEnv,
): Promise<DeployProcessResult> {
  const [executable, ...args] = command;
  if (!executable)
    return Promise.reject(new Error("Brak polecenia wrangler deploy."));
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      env,
      stdio: ["inherit", "pipe", "pipe"],
    });
    const chunks: Buffer[] = [];
    const collect = (chunk: Buffer, stream: NodeJS.WriteStream) => {
      chunks.push(chunk);
      stream.write(chunk);
    };
    child.stdout?.on("data", (chunk: Buffer) => collect(chunk, process.stdout));
    child.stderr?.on("data", (chunk: Buffer) => collect(chunk, process.stderr));
    child.on("error", reject);
    child.on("close", (code, signal) => {
      resolve({
        exitCode: code,
        signal,
        output: Buffer.concat(chunks).toString("utf8"),
      });
    });
  });
}

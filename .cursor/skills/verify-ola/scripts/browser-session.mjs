// Long-lived Chromium for sequential verification commands.
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.VERIFY_BASE_URL;
const token = process.env.VERIFY_BROWSER_TOKEN;
const evidenceRoot = process.env.VERIFY_EVIDENCE_ROOT;
const portFile = process.argv[2];
if (!baseUrl || !token || !evidenceRoot || !portFile) {
  process.stderr.write("browser-session: missing VERIFY_* environment or port file\n");
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
let context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
context.setDefaultTimeout(15000);
context.setDefaultNavigationTimeout(15000);
let page = await context.newPage();
const posts = [];

function track(nextPage) {
  nextPage.on("request", (request) => {
    if (request.method() === "POST") posts.push(request.url());
  });
}
track(page);

function locatorFor(body) {
  const options = {};
  if (body.name !== undefined) options.name = body.name;
  if (body.exact === true) options.exact = true;
  return page.getByRole(body.role, options);
}

function evidenceFile(relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0) {
    throw new Error("path is required");
  }
  const root = path.resolve(evidenceRoot);
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error("path must stay inside the evidence directory");
  }
  return target;
}

async function run(body) {
  switch (body.cmd) {
    case "health":
      return "ok";
    case "goto": {
      const target = new URL(body.path, baseUrl);
      if (target.origin !== new URL(baseUrl).origin) {
        throw new Error("path must stay on the verification origin");
      }
      const response = await page.goto(target.href, {
        waitUntil: "domcontentloaded",
      });
      return `status ${response?.status() ?? "none"} ${target.pathname}`;
    }
    case "click":
      await locatorFor(body).click();
      return `clicked ${body.role} ${body.name ?? ""}`.trim();
    case "fill":
      await locatorFor(body).fill(body.value ?? "");
      return `filled ${body.role} ${body.name ?? ""}`.trim();
    case "press":
      await page.keyboard.press(body.key);
      return `pressed ${body.key}`;
    case "context": {
      await context.close();
      context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        javaScriptEnabled: body.javascript !== false,
      });
      context.setDefaultTimeout(15000);
      context.setDefaultNavigationTimeout(15000);
      page = await context.newPage();
      track(page);
      return `javascript ${body.javascript !== false}`;
    }
    case "expect": {
      if (!body.role && body.text !== undefined) {
        const target = page.getByText(body.text, { exact: true });
        await target.first().waitFor({ state: body.state ?? "visible" });
        return body.text;
      }
      const target = locatorFor(body);
      if (body.state === "hidden") {
        await target.waitFor({ state: "hidden" });
        return "hidden";
      }
      if (body.state === "visible") {
        await target.waitFor({ state: "visible" });
      }
      if (body.state === "disabled") {
        if (!(await target.isDisabled())) throw new Error("expected disabled");
        return "disabled";
      }
      if (body.state === "enabled") {
        if (!(await target.isEnabled())) throw new Error("expected enabled");
        return "enabled";
      }
      if (body.text !== undefined) {
        const actual = (await target.innerText()).trim();
        if (actual !== body.text) {
          throw new Error(`text ${JSON.stringify(actual)}`);
        }
        return actual;
      }
      if (body.attribute && body.value !== undefined) {
        const actual = await target.getAttribute(body.attribute);
        if (actual !== body.value) {
          throw new Error(
            `${body.attribute} ${JSON.stringify(actual ?? null)}`,
          );
        }
        return `${body.attribute}=${actual}`;
      }
      if (body.count !== undefined) {
        const actual = await target.count();
        if (actual !== body.count) {
          throw new Error(`count ${actual}`);
        }
        return `count ${actual}`;
      }
      return "matched";
    }
    case "script-count": {
      const count = await page.locator("script").count();
      return `scripts ${count}`;
    }
    case "posts":
      return JSON.stringify(posts);
    case "snapshot": {
      const file = evidenceFile(body.path);
      await mkdir(path.dirname(file), { recursive: true });
      const snapshot = await page.locator("body").ariaSnapshot();
      await writeFile(file, snapshot);
      return file;
    }
    case "screenshot": {
      const file = evidenceFile(body.path);
      await mkdir(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file, fullPage: true });
      return file;
    }
    default:
      throw new Error(`unknown command ${body.cmd}`);
  }
}

const server = createServer(async (request, response) => {
  if (request.headers["x-verify-token"] !== token) {
    response.writeHead(403);
    response.end("forbidden");
    return;
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    const detail = await run(body);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, detail }));
  } catch (error) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      }),
    );
  }
});

await new Promise((resolve) => {
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
if (address === null || typeof address === "string") {
  process.stderr.write("browser-session: no control port\n");
  process.exit(1);
}
writeFileSync(portFile, `${address.port}\n`);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    server.close();
    await browser.close();
    process.exit(0);
  });
}

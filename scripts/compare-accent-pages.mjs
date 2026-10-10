import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { chromium } from "@playwright/test";

const PAGES = [
  { id: "home", path: "/" },
  { id: "about", path: "/o-mnie/" },
  { id: "consultation", path: "/konsultacje/" },
  { id: "ebook", path: "/ebooki/suplementy-w-pcos/" },
  { id: "ebooks", path: "/ebooki/" },
  { id: "ebooks-pcos", path: "/ebooki/kategoria/pcos/" },
  { id: "blog", path: "/blog/" },
  { id: "blog-p2", path: "/blog/strona/2/" },
  { id: "blog-pcos", path: "/blog/kategoria/pcos/" },
  { id: "article", path: "/blog/przygotowanie-do-konsultacji-pcos/" },
  { id: "catalog", path: "/design-system/" },
];

const VIEWPORTS = [
  { id: "desktop", width: 1280, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

const mode = process.argv[2] ?? "after";
const base = process.argv[3] ?? "http://127.0.0.1:4340";
const outDir = process.argv[4] ?? "/opt/cursor/artifacts/screenshots";

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const results = [];

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const entry of PAGES) {
    const url = `${base.replace(/\/$/, "")}${entry.path}`;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => globalThis.document.fonts.ready);
    const file = join(outDir, `${mode}-${entry.id}-${viewport.id}.png`);
    await mkdir(dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: true });
    results.push({
      id: entry.id,
      viewport: viewport.id,
      status: response?.status() ?? 0,
      file,
    });
    console.log(`${response?.status()} ${url} -> ${file}`);
  }
  await context.close();
}

await browser.close();
await writeFile(
  join(outDir, `${mode}-manifest.json`),
  `${JSON.stringify({ mode, base, results }, null, 2)}\n`,
);

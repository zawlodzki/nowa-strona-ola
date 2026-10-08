import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const dir = process.argv[2] ?? "/opt/cursor/artifacts/screenshots";
const pages = JSON.parse(
  await readFile(join(dir, "after-manifest.json"), "utf8"),
).results;

const pairs = pages.map((entry) => ({
  id: entry.id,
  viewport: entry.viewport,
  before: `before-${entry.id}-${entry.viewport}.png`,
  after: `after-${entry.id}-${entry.viewport}.png`,
  out: `compare-accent-${entry.id}-${entry.viewport}.png`,
}));

async function dataUri(file) {
  const bytes = await readFile(file);
  return `data:image/png;base64,${bytes.toString("base64")}`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });

for (const pair of pairs) {
  const before = await dataUri(join(dir, pair.before));
  const after = await dataUri(join(dir, pair.after));
  const html = `<!doctype html>
<html><head><style>
body{margin:0;background:#111;color:#fff;font:14px sans-serif}
.row{display:flex;gap:8px;align-items:flex-start}
figure{margin:0;flex:1;min-width:0}
img{width:100%;height:auto;display:block;background:#fff}
figcaption{padding:8px 12px}
</style></head><body>
<div class="row">
<figure><img src="${before}"><figcaption>main · ${pair.id} · ${pair.viewport}</figcaption></figure>
<figure><img src="${after}"><figcaption>branch · ${pair.id} · ${pair.viewport}</figcaption></figure>
</div>
</body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForSelector("img");
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((img) => img.decode()));
  });
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewportSize({
    width: 1600,
    height: Math.min(Math.max(height, 400), 20000),
  });
  const out = join(dir, pair.out);
  await page.screenshot({ path: out, fullPage: true });
  console.log(out);
}

await browser.close();
await writeFile(
  join(dir, "compare-manifest.json"),
  `${JSON.stringify(pairs, null, 2)}\n`,
);

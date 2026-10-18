import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

const font = await readFile("src/assets/fonts/switzer/Switzer-Variable.woff2");
const css = await readFile("src/design-system/global.css", "utf8");
const rules = [
  ...css.matchAll(/\.ao-wordmark(?: > span(?: \+ span)?)? \{[^}]+\}/g),
]
  .slice(0, 3)
  .map((match) => match[0])
  .join("\n");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 900, height: 400 },
    deviceScaleFactor: 4,
  });
  await page.setContent(`<style>
@font-face{font-family:Switzer;src:url(data:font/woff2;base64,${font.toString("base64")});font-weight:100 900}
html{--ao-tracking-wordmark:-0.065em}
body{margin:0;font-family:Switzer;color:#70283f;-webkit-font-smoothing:antialiased}
${rules}
.export{display:inline-block;padding:10px}
</style><div class="export"><div class="ao-wordmark"><span>aleksandra</span><span>olesiewicz</span></div></div>`);
  await page.evaluate(() => document.fonts.ready);
  const source = await page
    .locator(".export")
    .screenshot({ omitBackground: true });
  const output = fileURLToPath(new URL("logo-stripe.png", import.meta.url));
  await sharp(source)
    .trim()
    .resize({ width: 1200 })
    .extend({
      top: 64,
      bottom: 64,
      left: 64,
      right: 64,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(output);
  const { width, height, size, hasAlpha } = await sharp(output).metadata();
  console.log({ width, height, size, hasAlpha });
} finally {
  await browser.close();
}

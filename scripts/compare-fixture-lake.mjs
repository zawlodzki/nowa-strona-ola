import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

/* global document, getComputedStyle */

const root = path.resolve(import.meta.dirname, "..");
const fixtureRoot = path.join(root, ".cache/dist-fixture");
const lakeRoot = path.join(root, "dist");

const pages = [
  ["/", "strona główna"],
  ["/o-mnie/", "o mnie"],
  ["/konsultacje/", "konsultacje"],
  ["/ebooki/suplementy-w-pcos/", "ebook"],
  ["/ebooki/", "katalog e-booków"],
  ["/blog/", "blog"],
  ["/blog/codzienne-posilki-przy-pcos/", "artykuł"],
  ["/polityka-prywatnosci/", "polityka prywatności"],
  ["/lista-cookies-i-identyfikatorow/", "lista cookies"],
  ["/regulamin/", "regulamin"],
  ["/regulamin-newslettera/", "regulamin newslettera"],
  ["/en/privacy/", "privacy"],
  ["/en/terms/", "terms"],
];

function serve(directory) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    let file = path.join(directory, decodeURIComponent(url.pathname));
    if (file.endsWith("/")) file = path.join(file, "index.html");
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".woff2": "font/woff2",
    };
    try {
      const body = await readFile(file);
      const type = types[path.extname(file)] ?? "application/octet-stream";
      response.writeHead(200, { "content-type": type });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("missing");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({
        server,
        base: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function inventory(page) {
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.loading = "eager";
      try {
        await image.decode();
      } catch {
        // Broken images stay in the inventory with naturalWidth 0.
      }
    }
  });
  return page.evaluate(() => {
    function keyOf(src) {
      const name = src.split("?")[0].split("/").pop() ?? src;
      return name.replace(/\.[A-Za-z0-9_-]{8,}(?=\.[a-z0-9]+$)/i, "");
    }
    function walk(element) {
      const tag = element.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "link") return "";
      const classes = [...element.classList].sort().join(".");
      const bits = [tag];
      if (classes) bits.push(classes);
      if (tag === "img") {
        const style = getComputedStyle(element);
        bits.push(
          `src=${keyOf(element.currentSrc || element.getAttribute("src") || "")}`,
        );
        bits.push(`fit=${style.objectFit}`);
        bits.push(`nw=${element.naturalWidth}`);
      }
      if (tag === "a") bits.push(`href=${element.getAttribute("href") ?? ""}`);
      const style = getComputedStyle(element);
      const background = [
        ...style.backgroundImage.matchAll(/url\("([^"]+)"\)/g),
      ]
        .map((match) => keyOf(match[1]))
        .filter((item) => !item.startsWith("data:"));
      if (background.length) bits.push(`bg=${background.join(",")}`);
      const children = [...element.children].map(walk).filter(Boolean);
      return `${bits.join(".")}(${children.join("|")})`;
    }
    const sections = [...document.querySelectorAll("main section")].map(
      (section) => ({
        id: section.id || section.getAttribute("aria-labelledby") || "section",
        skeleton: walk(section),
        images: [...section.querySelectorAll("img")].map((image) => ({
          src: keyOf(image.currentSrc || image.getAttribute("src") || ""),
          fit: getComputedStyle(image).objectFit,
          width: image.naturalWidth,
        })),
      }),
    );
    return { sections };
  });
}

const fixture = await serve(fixtureRoot);
const lake = await serve(lakeRoot);
const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  for (const [pathname, label] of pages) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const left = await context.newPage();
    const right = await context.newPage();
    await left.goto(fixture.base + pathname, { waitUntil: "load" });
    await right.goto(lake.base + pathname, { waitUntil: "load" });
    const fixturePage = await inventory(left);
    const lakePage = await inventory(right);
    await context.close();

    const fixtureIds = fixturePage.sections.map((section) => section.id);
    const lakeIds = lakePage.sections.map((section) => section.id);
    if (fixtureIds.join("|") !== lakeIds.join("|")) {
      failures.push(
        `${label}: sekcje fixture [${fixtureIds.join(", ")}] / lake [${lakeIds.join(", ")}]`,
      );
      continue;
    }
    for (const fixtureSection of fixturePage.sections) {
      const lakeSection = lakePage.sections.find(
        (section) => section.id === fixtureSection.id,
      );
      const fixtureImages = fixtureSection.images
        .map((image) => `${image.src} ${image.fit} ${image.width}`)
        .join("\n");
      const lakeImages = lakeSection.images
        .map((image) => `${image.src} ${image.fit} ${image.width}`)
        .join("\n");
      if (fixtureImages !== lakeImages) {
        failures.push(
          `${label} #${fixtureSection.id} zdjęcia\nfixture:\n${fixtureImages || "(brak)"}\nlake:\n${lakeImages || "(brak)"}`,
        );
      }
      if (fixtureSection.skeleton !== lakeSection.skeleton) {
        failures.push(
          `${label} #${fixtureSection.id} DOM\nfixture: ${fixtureSection.skeleton.slice(0, 500)}\nlake: ${lakeSection.skeleton.slice(0, 500)}`,
        );
      }
    }
  }
} finally {
  await browser.close();
  fixture.server.close();
  lake.server.close();
}

if (failures.length) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}
console.log(
  `fixture i content-lake: ${pages.length} stron, te same sekcje, zdjęcia i DOM`,
);

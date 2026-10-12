import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
import { checkCssBudgets } from "./check-css-budgets.mjs";
import { assertEnglishDisabled } from "./check-disabled-locales.mjs";
const assets = await readdir("dist/_astro");
const sizes = { js: 0, css: 0 };
for (const name of assets) {
  const type = name.endsWith(".js")
    ? "js"
    : name.endsWith(".css")
      ? "css"
      : undefined;
  if (type)
    sizes[type] += gzipSync(await readFile(`dist/_astro/${name}`)).length;
}
assert(sizes.js <= 25 * 1024, `JS budget exceeded: ${sizes.js} B gzip`);
// Tymczasowy limit etapu 4a (pakiety 5–7). Optymalizacja CSS przyjdzie później;
// 32 KiB nie jest docelowym budżetem strony.
assert(sizes.css <= 32 * 1024, `CSS budget exceeded: ${sizes.css} B gzip`);
const woff2 = assets.filter((name) => name.endsWith(".woff2"));
assert.equal(woff2.length, 1, `expected one woff2, got ${woff2.join(", ")}`);
assert.equal(
  (await readFile(`dist/_astro/${woff2[0]}`)).length,
  43220,
  "Switzer variable woff2 must stay the unmodified Fontshare file",
);
for (const path of [
  "index.html",
  "o-mnie/index.html",
  "konsultacje/index.html",
  "ebooki/index.html",
  "ebooki/kategoria/pcos/index.html",
  "ebooki/suplementy-w-pcos/index.html",
  "ui/index.html",
  "static/index.html",
  "blog/index.html",
  "blog/kategoria/pcos/index.html",
  "blog/kategoria/perimenopauza/index.html",
  "odstapienie/index.html",
]) {
  const html = await readFile(`dist/${path}`, "utf8");
  assert.match(
    html,
    /noindex,nofollow/,
    `${path}: prototype must remain noindex`,
  );
  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${path}: exactly one h1`,
  );
  if (path === "static/index.html")
    assert(!html.includes("<script"), "static primitives emit JS");
}
const filesWithoutEnglish = await assertEnglishDisabled();
const collectionHtml = await readFile("dist/ebooki/index.html", "utf8");
assert.match(collectionHtml, /Więcej jasności/);
assert.match(collectionHtml, /97/);
assert.match(collectionHtml, /materiały są w przygotowaniu/);
assert.match(collectionHtml, /\/ebooki\/suplementy-w-pcos\//);
assert.match(collectionHtml, /\/ebooki\/badania-ktore-maja-sens\//);
assert.doesNotMatch(collectionHtml, /potwierdzenie zakupu|płatność przyjęta/i);
const collectionPcosHtml = await readFile(
  "dist/ebooki/kategoria/pcos/index.html",
  "utf8",
);
assert.match(collectionPcosHtml, /value="pcos"/);
assert.match(collectionPcosHtml, /checked/);
const ebookHtml = await readFile(
  "dist/ebooki/suplementy-w-pcos/index.html",
  "utf8",
);
assert.match(ebookHtml, /97/);
assert.match(ebookHtml, /Zapowiedź oferty|Sprzedaż nie jest uruchomiona/);
assert.doesNotMatch(ebookHtml, /potwierdzenie zakupu|płatność przyjęta/i);
const blogHtml = await readFile("dist/blog/index.html", "utf8");
assert.match(blogHtml, /Blog\. Po Twojemu\./);
assert.match(blogHtml, /Najnowszy wpis/);
// Posts are published by hand in Sanity, so a live build has no fixed count.
// Pagination must match the article pages that were actually built.
const liveContent = Boolean(process.env.PUBLIC_SANITY_PROJECT_ID);
const blogEntries = await readdir("dist/blog", { withFileTypes: true });
const articleSlugs = [];
for (const entry of blogEntries) {
  if (!entry.isDirectory() || ["strona", "kategoria"].includes(entry.name))
    continue;
  const html = await readFile(
    `dist/blog/${entry.name}/index.html`,
    "utf8",
  ).catch(() => "");
  if (/article3a/.test(html)) articleSlugs.push(entry.name);
}
const postCount = articleSlugs.length;
assert(postCount >= 1, "blog: expected at least one article page");
const rangeOf = (html, label) => {
  const match = html.match(/Wpisy (\d+)–(\d+) z (\d+)/);
  if (!match) return null;
  const [start, end, total] = match.slice(1).map(Number);
  assert.equal(total, postCount, `${label}: total matches built articles`);
  assert(start <= end, `${label}: range ${start}–${end}`);
  return { start, end };
};
let previousEnd = 1; // the latest post is featured above the list
let page = 1;
let html = blogHtml;
for (;;) {
  const label = page === 1 ? "blog" : `blog/strona/${page}`;
  if (page > 1) assert.doesNotMatch(html, /Najnowszy wpis/, label);
  const range = rangeOf(html, label);
  if (range) {
    assert.equal(range.start, previousEnd + 1, `${label}: range continues`);
    previousEnd = range.end;
  }
  const next = await readFile(
    `dist/blog/strona/${page + 1}/index.html`,
    "utf8",
  ).catch(() => null);
  if (!next) break;
  assert(range, `${label}: a next page needs a range label`);
  assert.match(html, new RegExp(`/blog/strona/${page + 1}/`), label);
  html = next;
  page += 1;
}
assert.equal(previousEnd, postCount, "blog: pages cover every built article");
for (const slug of articleSlugs) {
  const articlePage = await readFile(`dist/blog/${slug}/index.html`, "utf8");
  assert.match(articlePage, /noindex,nofollow/, `blog/${slug}: noindex`);
  assert.equal(
    (articlePage.match(/<h1[\s>]/g) ?? []).length,
    1,
    `blog/${slug}: exactly one h1`,
  );
}
if (!liveContent) {
  // Fixtures are fixed: 11 posts, 6 per list page after the featured one.
  assert.equal(postCount, 11, "fixture: 11 articles");
  assert.match(blogHtml, /Wpisy 2–7 z 11/);
  const blogPage2 = await readFile("dist/blog/strona/2/index.html", "utf8");
  assert.match(blogPage2, /Wpisy 8–11 z 11/);
  assert.match(blogHtml, /przygotowanie-do-konsultacji-pcos/);
  assert.match(blogHtml, /\/blog\/strona\/2\//);
  assert.doesNotMatch(
    blogHtml.split('id="wpisy"')[1] ?? "",
    /przygotowanie-do-konsultacji-pcos/,
  );
  const articleHtml = await readFile(
    "dist/blog/przygotowanie-do-konsultacji-pcos/index.html",
    "utf8",
  );
  assert.match(articleHtml, /article3a/);
  assert.match(
    articleHtml,
    /Jak przygotować się do konsultacji dietetycznej przy PMOS \(PCOS\)\?/,
  );
  assert.match(articleHtml, /W tym artykule/);
  assert.match(articleHtml, /"@type":"FAQPage"/);
  const blogEmpty = await readFile(
    "dist/blog/kategoria/perimenopauza/index.html",
    "utf8",
  );
  assert.match(blogEmpty, /tej kategorii nie ma jeszcze wpisów/i);
}
const homePl = await readFile("dist/index.html", "utf8");
for (const [label, html] of [["/", homePl]]) {
  assert.match(
    html,
    /href="https:\/\/www\.instagram\.com\/aleksandra_olesiewicz"/,
    `${label}: Instagram profile`,
  );
  assert.match(
    html,
    /href="https:\/\/www\.facebook\.com\/dietetykolesiewicz\/"/,
    `${label}: Facebook profile`,
  );
  assert.match(
    html,
    /href="https:\/\/www\.tiktok\.com\/@aleksandra_olesiewicz"/,
    `${label}: TikTok profile`,
  );
  assert.doesNotMatch(
    html,
    /href="https:\/\/www\.instagram\.com\/"/,
    `${label}: placeholder Instagram homepage`,
  );
}
assert.match(homePl, /Zrozum swoje ciało/);
const aboutHtml = await readFile("dist/o-mnie/index.html", "utf8");
assert.match(aboutHtml, /Jestem Ola/);
assert.match(aboutHtml, /diploma/);
const consultationHtml = await readFile("dist/konsultacje/index.html", "utf8");
assert.match(consultationHtml, /Konsultacje dietetyczne|60 minut/i);

for (const path of [
  "polityka-prywatnosci/index.html",
  "lista-cookies-i-identyfikatorow/index.html",
  "regulamin/index.html",
  "regulamin-newslettera/index.html",
]) {
  const html = await readFile(`dist/${path}`, "utf8");
  assert.match(
    html,
    /noindex,nofollow/,
    `${path}: prototype must remain noindex`,
  );
  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${path}: exactly one h1`,
  );
  assert.match(html, /legal3a/);
}
const privacyHtml = await readFile(
  "dist/polityka-prywatnosci/index.html",
  "utf8",
);
assert.match(privacyHtml, /Polityka prywatności aleksandraolesiewicz\.com/);
assert.match(
  privacyHtml,
  /Wersja 2\.2 · obowiązuje od <time datetime="2026-10-11"/,
);
assert.match(privacyHtml, /1\. Kto jest administratorem Twoich danych/);
assert.match(privacyHtml, /\/lista-cookies-i-identyfikatorow\//);
const termsHtml = await readFile("dist/regulamin/index.html", "utf8");
assert.match(termsHtml, /<h2 id="pouczenie"/);
assert.match(termsHtml, /<h2 id="formularz-odstapienia"/);
assert.match(termsHtml, /href="\/regulamin\/#pouczenie"/);
const cookiesHtml = await readFile(
  "dist/lista-cookies-i-identyfikatorow/index.html",
  "utf8",
);
assert.match(cookiesHtml, /Przed dokonaniem wyboru/);
assert.match(cookiesHtml, /\/polityka-prywatnosci\//);
const sitemap = await readFile("dist/sitemap.xml", "utf8");
for (const loc of [
  "https://aleksandraolesiewicz.com/polityka-prywatnosci/",
  "https://aleksandraolesiewicz.com/lista-cookies-i-identyfikatorow/",
  "https://aleksandraolesiewicz.com/regulamin/",
  "https://aleksandraolesiewicz.com/regulamin-newslettera/",
]) {
  assert.match(sitemap, new RegExp(loc.replaceAll("/", "\\/")));
}
console.log(
  JSON.stringify(
    {
      gzipBytes: sizes,
      cssByTemplate: await checkCssBudgets(),
      staticPrimitivesScripts: 0,
      filesWithoutEnglish,
    },
    null,
    2,
  ),
);

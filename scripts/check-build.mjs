import { access, readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
import { checkCssBudgets } from "./check-css-budgets.mjs";
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
  "en/index.html",
  "o-mnie/index.html",
  "en/about/index.html",
  "konsultacje/index.html",
  "en/consultations/index.html",
  "ebooki/index.html",
  "ebooki/kategoria/pcos/index.html",
  "ebooki/suplementy-w-pcos/index.html",
  "en/ebooks/index.html",
  "en/ebooks/category/pcos/index.html",
  "en/ebooks/supplements-in-pcos/index.html",
  "ui/index.html",
  "en/ui/index.html",
  "static/index.html",
  "blog/index.html",
  "blog/strona/2/index.html",
  "blog/kategoria/pcos/index.html",
  "blog/kategoria/perimenopauza/index.html",
  "en/blog/index.html",
  "en/blog/page/2/index.html",
  "blog/przygotowanie-do-konsultacji-pcos/index.html",
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
await assert.rejects(access("dist/en/tylko-pl/index.html"), /ENOENT/);
await assert.rejects(access("dist/en/konsultacje/index.html"), /ENOENT/);
await assert.rejects(
  access("dist/en/ebooki/suplementy-w-pcos/index.html"),
  /ENOENT/,
);
await assert.rejects(access("dist/en/ebooki/index.html"), /ENOENT/);
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
assert.match(blogHtml, /Wpisy 2–7 z 11/);
assert.match(blogHtml, /przygotowanie-do-konsultacji-pcos/);
assert.match(blogHtml, /\/blog\/strona\/2\//);
assert.doesNotMatch(
  blogHtml.split('id="wpisy"')[1] ?? "",
  /przygotowanie-do-konsultacji-pcos/,
);
const blogPage2 = await readFile("dist/blog/strona/2/index.html", "utf8");
assert.match(blogPage2, /Wpisy 8–11 z 11/);
assert.doesNotMatch(blogPage2, /Najnowszy wpis/);
const blogEmpty = await readFile(
  "dist/blog/kategoria/perimenopauza/index.html",
  "utf8",
);
assert.match(blogEmpty, /tej kategorii nie ma jeszcze wpisów/i);
const blogEn = await readFile("dist/en/blog/index.html", "utf8");
assert.match(blogEn, /Blog\. On your terms\./);
assert.doesNotMatch(blogEn, /Po Twojemu/);
const articleHtml = await readFile(
  "dist/blog/przygotowanie-do-konsultacji-pcos/index.html",
  "utf8",
);
assert.match(articleHtml, /article3a/);
assert.match(
  articleHtml,
  /Jak przygotować się do konsultacji dietetycznej przy PCOS\?/,
);
assert.match(articleHtml, /W tym artykule/);
assert.match(articleHtml, /article-faq-schema/);
const homePl = await readFile("dist/index.html", "utf8");
const homeEn = await readFile("dist/en/index.html", "utf8");
for (const [label, html] of [
  ["/", homePl],
  ["/en/", homeEn],
]) {
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
assert.match(homeEn, /Understand your body/);
const aboutHtml = await readFile("dist/o-mnie/index.html", "utf8");
assert.match(aboutHtml, /Jestem Ola/);
assert.match(aboutHtml, /diploma/);
const consultationHtml = await readFile("dist/konsultacje/index.html", "utf8");
assert.match(consultationHtml, /Konsultacje dietetyczne|60 minut/i);

const articleEn = await readFile(
  "dist/en/blog/preparing-for-a-pcos-nutrition-consultation/index.html",
  "utf8",
);
assert.match(articleEn, /article3a/);
assert.match(
  articleEn,
  /How to prepare for a nutrition consultation with PCOS\?/,
);
assert.match(articleEn, /In this article/);
assert.doesNotMatch(articleEn, /W tym artykule/);
for (const path of [
  "polityka-prywatnosci/index.html",
  "lista-cookies-i-identyfikatorow/index.html",
  "regulamin/index.html",
  "regulamin-newslettera/index.html",
  "en/privacy/index.html",
  "en/terms/index.html",
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
assert.match(privacyHtml, /Polityka prywatności www\.zawlodzki\.pl/);
assert.match(privacyHtml, /obowiązuje od/);
assert.match(privacyHtml, /24\.08\.2026/);
assert.match(privacyHtml, /1\. Administrator danych/);
assert.match(privacyHtml, /\/lista-cookies-i-identyfikatorow\//);
const cookiesHtml = await readFile(
  "dist/lista-cookies-i-identyfikatorow/index.html",
  "utf8",
);
assert.match(cookiesHtml, /Przed dokonaniem wyboru/);
assert.match(cookiesHtml, /\/polityka-prywatnosci\//);
const privacyEn = await readFile("dist/en/privacy/index.html", "utf8");
assert.match(privacyEn, /The binding version is the Polish text/);
assert.match(privacyEn, /\/polityka-prywatnosci\//);
assert.doesNotMatch(privacyEn, /Administratorem danych osobowych/);
const sitemap = await readFile("dist/sitemap.xml", "utf8");
for (const loc of [
  "https://aleksandraolesiewicz.com/polityka-prywatnosci/",
  "https://aleksandraolesiewicz.com/lista-cookies-i-identyfikatorow/",
  "https://aleksandraolesiewicz.com/regulamin/",
  "https://aleksandraolesiewicz.com/regulamin-newslettera/",
  "https://aleksandraolesiewicz.com/en/privacy/",
  "https://aleksandraolesiewicz.com/en/terms/",
]) {
  assert.match(sitemap, new RegExp(loc.replaceAll("/", "\\/")));
}
console.log(
  JSON.stringify(
    {
      gzipBytes: sizes,
      cssByTemplate: await checkCssBudgets(),
      staticPrimitivesScripts: 0,
    },
    null,
    2,
  ),
);

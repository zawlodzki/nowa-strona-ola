import { access, readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";

const assets = await readdir("dist/_astro");
const sizes = { js: 0, css: 0 };
for (const name of assets) {
  const type = name.endsWith(".js")
    ? "js"
    : name.endsWith(".css")
      ? "css"
      : undefined;
  if (type) {
    sizes[type] += gzipSync(await readFile(`dist/_astro/${name}`)).length;
  }
}
assert(sizes.js <= 25 * 1024, `JS budget exceeded: ${sizes.js} B gzip`);
assert(sizes.css <= 32 * 1024, `CSS budget exceeded: ${sizes.css} B gzip`);

const pages = [
  "index.html",
  "en/index.html",
  "o-mnie/index.html",
  "en/about/index.html",
  "konsultacje/index.html",
  "en/consultations/index.html",
  "ebooki/index.html",
  "ebooki/suplementy-w-pcos/index.html",
  "en/ebooks/index.html",
  "en/ebooks/supplements-in-pcos/index.html",
  "blog/index.html",
  "blog/strona/2/index.html",
  "en/blog/index.html",
  "blog/przygotowanie-do-konsultacji-pcos/index.html",
  "blog/codzienne-posilki-przy-pcos/index.html",
  "en/blog/everyday-meals-with-pcos/index.html",
];
for (const page of pages) {
  const html = await readFile(`dist/${page}`, "utf8");
  assert.match(
    html,
    /noindex,nofollow/,
    `${page}: prototype must remain noindex`,
  );
  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${page}: exactly one h1`,
  );
}

await assert.rejects(access("dist/warsztat/index.html"), /ENOENT/);
await assert.rejects(access("dist/en/workshop/index.html"), /ENOENT/);
await assert.rejects(access("dist/tylko-pl/index.html"), /ENOENT/);
await assert.rejects(
  access("dist/en/ebooks/suplementy-w-pcos/index.html"),
  /ENOENT/,
);

const home = await readFile("dist/index.html", "utf8");
assert.match(
  home,
  /href="https:\/\/www\.instagram\.com\/aleksandra_olesiewicz"/,
);
const blog = await readFile("dist/blog/index.html", "utf8");
assert.match(blog, /Blog\. Po Twojemu\./);
const ebook = await readFile(
  "dist/ebooki/suplementy-w-pcos/index.html",
  "utf8",
);
assert.match(ebook, /97/);
const englishEbook = await readFile(
  "dist/en/ebooks/supplements-in-pcos/index.html",
  "utf8",
);
assert.match(englishEbook, /Supplements in PCOS/);
const featured = await readFile(
  "dist/blog/przygotowanie-do-konsultacji-pcos/index.html",
  "utf8",
);
assert.match(
  featured,
  /Pierwsza konsultacja nie musi zaczynać się od idealnego jadłospisu/,
);
const placeholder = await readFile(
  "dist/blog/codzienne-posilki-przy-pcos/index.html",
  "utf8",
);
assert.match(placeholder, /Copy, daty i kadry pochodzą z makiety 3a/);
const about = await readFile("dist/o-mnie/index.html", "utf8");
assert.match(about, /diploma/);

console.log(JSON.stringify({ gzipBytes: sizes }, null, 2));

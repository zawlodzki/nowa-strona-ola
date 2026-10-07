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
  if (type)
    sizes[type] += gzipSync(await readFile(`dist/_astro/${name}`)).length;
}
assert(sizes.js <= 25 * 1024, `JS budget exceeded: ${sizes.js} B gzip`);
assert(sizes.css <= 22 * 1024, `CSS budget exceeded: ${sizes.css} B gzip`);
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
  "ebooki/suplementy-w-pcos/index.html",
  "en/ebooks/supplements-in-pcos/index.html",
  "ui/index.html",
  "en/ui/index.html",
  "static/index.html",
  "warsztat/index.html",
  "en/workshop/index.html",
  "tylko-pl/index.html",
  "blog/index.html",
  "blog/najpierw-proces/index.html",
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
const ebookHtml = await readFile(
  "dist/ebooki/suplementy-w-pcos/index.html",
  "utf8",
);
assert.match(ebookHtml, /97/);
assert.match(ebookHtml, /Zapowiedź oferty|Sprzedaż nie jest uruchomiona/);
assert.doesNotMatch(ebookHtml, /potwierdzenie zakupu|płatność przyjęta/i);
console.log(
  JSON.stringify({ gzipBytes: sizes, staticPrimitivesScripts: 0 }, null, 2),
);

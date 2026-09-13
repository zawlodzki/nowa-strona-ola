import { readFile, readdir } from "node:fs/promises";
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
assert(sizes.css <= 20 * 1024, `CSS budget exceeded: ${sizes.css} B gzip`);
for (const path of [
  "index.html",
  "en/index.html",
  "ui/index.html",
  "en/ui/index.html",
  "static/index.html",
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
console.log(
  JSON.stringify({ gzipBytes: sizes, staticPrimitivesScripts: 0 }, null, 2),
);

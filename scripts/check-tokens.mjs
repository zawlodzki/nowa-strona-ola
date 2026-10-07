import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { generateTokensCss } from "./tokens.mjs";
const tokens = JSON.parse(await readFile("design-system/tokens.json", "utf8"));
const css = await readFile("design-system/tokens.css", "utf8");
assert.equal(
  css,
  generateTokensCss(tokens),
  "Uruchom npm run tokens:generate: CSS odbiega od tokens.json.",
);
assert.equal(tokens.meta.direction, "3a");
assert.match(tokens.tokens.font.value, /Switzer/);
assert.equal(tokens.tokens.background.value, "#ffffff");
assert.equal(tokens.tokens.primary.value, "#882f48");
console.log("Aktywne tokeny 3a są zgodne z tokens.json.");

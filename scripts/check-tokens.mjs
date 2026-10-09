import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  contrastRatio,
  generateTokensCss,
  generateLegacyAliasesCss,
} from "./tokens.mjs";
const tokens = JSON.parse(await readFile("design-system/tokens.json", "utf8"));
const css = await readFile("design-system/tokens.css", "utf8");
assert.equal(
  css,
  generateTokensCss(tokens),
  "Uruchom npm run tokens:generate: CSS odbiega od tokens.json.",
);
assert.equal(
  await readFile("design-system/legacy-tokens.css", "utf8"),
  generateLegacyAliasesCss(tokens),
);
assert.equal(tokens.meta.direction, "3a");
assert.match(tokens.tokens.font.value, /Switzer/);
assert.equal(tokens.tokens.background.value, "#ffffff");
assert.equal(tokens.tokens.primary.value, "#882f48");
assert.equal(tokens.tokens.accent.value, "#53671B");
assert.equal(tokens.tokens["accent-on-primary"].value, "#D8E78A");
assert.equal(tokens.tokens["accent-on-light"].value, "#53671B");
assert.equal(tokens.dark.accent, "#D8E78A");
assert.equal("accent-on-light" in tokens.dark, false);
assert.equal("accent-on-primary" in tokens.dark, false);
assert(
  contrastRatio(tokens.tokens.accent.value, tokens.tokens.background.value) >=
    4.5,
  "Light accent on white must meet WCAG AA for text.",
);
assert(
  contrastRatio(tokens.dark.accent, tokens.dark.background) >= 4.5,
  "Dark accent on dark background must meet WCAG AA for text.",
);
console.log("Aktywne tokeny 3a są zgodne z tokens.json.");

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { generateTokensCss } from "./tokens.mjs";

const tokensPath = "wonderful-design-system/tokens.json";
const cssPath = "wonderful-design-system/tokens.css";
const tokens = JSON.parse(await readFile(tokensPath, "utf8"));
const css = await readFile(cssPath, "utf8");
const expected = generateTokensCss(tokens);

assert.equal(
  css,
  expected,
  `${cssPath} odbiega od ${tokensPath}. Uruchom generator tokenów i zapisz wynik.`,
);

const display = tokens.font?.display?.value ?? "";
const body = tokens.font?.body?.value ?? "";
assert.match(
  display,
  /Arial/,
  "tokens.json font.display must include the documented Arial fallback",
);
assert.match(
  body,
  /Arial/,
  "tokens.json font.body must include the documented Arial fallback",
);

console.log("tokens.css matches tokens.json");

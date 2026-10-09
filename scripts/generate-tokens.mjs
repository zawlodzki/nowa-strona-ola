import { readFile, writeFile } from "node:fs/promises";
import { generateTokensCss, generateLegacyAliasesCss } from "./tokens.mjs";
const source = JSON.parse(await readFile("design-system/tokens.json", "utf8"));
await writeFile("design-system/tokens.css", generateTokensCss(source));
await writeFile(
  "design-system/legacy-tokens.css",
  generateLegacyAliasesCss(source),
);
console.log("Generated design-system/tokens.css");

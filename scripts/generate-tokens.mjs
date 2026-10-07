import { readFile, writeFile } from "node:fs/promises";
import { generateTokensCss } from "./tokens.mjs";
const source = JSON.parse(await readFile("design-system/tokens.json", "utf8"));
await writeFile("design-system/tokens.css", generateTokensCss(source));
console.log("Generated design-system/tokens.css");

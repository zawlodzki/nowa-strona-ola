import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";

// Wersja EN wyłączona 10.10.2026 (docs/IMPLEMENTATION-PLAN.md, sekcja PL/EN).
// Tekst „/en/tylko-pl” na stronie fixture’u to zwykłe zdanie, nie odnośnik.
const forbidden = [
  /href="[^"]*\/en\//,
  /hreflang=/,
  /"(?:item|url|@id)":"[^"]*\/en\//,
  /<loc>[^<]*\/en\//,
];

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(full);
    else if (/\.(html|xml|js|json|txt|md)$/.test(entry.name)) yield full;
  }
}

export async function assertEnglishDisabled(dist = "dist") {
  await assert.rejects(access(path.join(dist, "en")), /ENOENT/);
  let checked = 0;
  for await (const file of files(dist)) {
    const text = await readFile(file, "utf8");
    for (const pattern of forbidden)
      assert.doesNotMatch(text, pattern, `${file}: reference to /en/`);
    checked += 1;
  }
  assert(checked > 0, `${dist}: no files checked`);
  return checked;
}

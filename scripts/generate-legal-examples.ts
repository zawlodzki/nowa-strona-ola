/**
 * Writes src/content/examples/legal-*.md from the legal fixtures with the
 * production serializer (serializeLegalPage), so the examples are the
 * Markdown twin of the rendered HTML.
 *
 * Usage: npx tsx scripts/generate-legal-examples.ts
 */
import { writeFile } from "node:fs/promises";

import { mapLegalPage } from "@/content/map-legal";
import { serializeLegalPage } from "@/content/serialize-legal";
import { getLegalPage, getSiteSettings } from "@/sanity/repository";

const examples = [
  ["pl", "polityka-prywatnosci", "legal-privacy.md"],
  ["pl", "regulamin", "legal-terms.md"],
  ["pl", "lista-cookies-i-identyfikatorow", "legal-cookies.md"],
  ["pl", "regulamin-newslettera", "legal-newsletter.md"],
  ["en", "privacy", "legal-privacy-en.md"],
  ["en", "terms", "legal-terms-en.md"],
] as const;

const fixtures = { environment: {} };
for (const [language, slug, file] of examples) {
  const [page, settings] = await Promise.all([
    getLegalPage(language, slug, fixtures),
    getSiteSettings(language, fixtures),
  ]);
  await writeFile(
    `src/content/examples/${file}`,
    serializeLegalPage(mapLegalPage(page, settings)),
  );
  console.log(`src/content/examples/${file}`);
}

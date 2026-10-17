import assert from "node:assert/strict";
import { tsImport } from "tsx/esm/api";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function htmlHasClass(html, className) {
  const token = escapeRegExp(className);
  return new RegExp(`class="(?:[^"\\s]+\\s)*${token}(?:\\s[^"]*)?"`).test(html);
}

export function assertTemplateRegion({
  html,
  classes,
  label,
  seed,
  assertCopy,
}) {
  assert.equal(typeof html, "string", `${label}: missing HTML`);
  for (const className of classes) {
    assert.ok(
      htmlHasClass(html, className),
      `${label}: missing class ${className}`,
    );
  }
  if (!assertCopy) return;
  assert.equal(typeof seed, "string", `${label}: missing seed field`);
  assert.ok(seed.length > 0, `${label}: missing seed field`);
  assertCopy(html, seed, `${label} seed`);
}

export async function checkBuiltRegions({
  regions,
  readHtml,
  resolvePath,
  seeds,
  assertCopy,
}) {
  const list =
    regions ??
    (await tsImport("../src/content/template-regions.ts", import.meta.url))
      .templateRegions;
  for (const region of list) {
    const filePath = resolvePath(region);
    const html = await readHtml(filePath);
    assertTemplateRegion({
      html,
      classes: region.classes,
      label: `${region.id} (${filePath})`,
      seed: seeds ? seeds[region.seedField] : undefined,
      assertCopy: seeds ? assertCopy : undefined,
    });
  }
}

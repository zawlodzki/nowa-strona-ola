const TOKEN_CSS_HEADER =
  "/* O=odczyt, R=adaptacja. Szczegóły pochodzenia w tokens.json. Font files not bundled. */";

const SEMANTIC_CUSTOM_PROPERTIES = [
  "  --wf-bg: var(--wf-color-white);",
  "  --wf-fg: var(--wf-color-ink);",
  "  --wf-gutter: 24px;",
  "  --wf-section: 64px;",
  "  --wf-display-size: 42px;",
  "  --wf-heading-size: 34px;",
  "  --wf-card-size: 24px;",
];

const TOKEN_CSS_FOOTER = [
  '[data-theme="dark"] { --wf-bg: var(--wf-color-black); --wf-fg: var(--wf-color-paper); }',
  "@media(min-width:880px) { :root { --wf-gutter:40px; --wf-section:96px; --wf-display-size:64px; --wf-heading-size:42px; --wf-card-size:22px; } }",
  "@media(min-width:1200px) { :root { --wf-section:120px; --wf-display-size:82px; --wf-heading-size:48px; } }",
  "@media(min-width:1440px) { :root { --wf-gutter:60px; --wf-card-size:32px; } }",
];

export function generateTokensCss(tokens) {
  const lines = [TOKEN_CSS_HEADER, ":root {"];

  for (const [group, items] of Object.entries(tokens)) {
    if (typeof items !== "object" || items === null || Array.isArray(items)) {
      continue;
    }

    for (const [name, token] of Object.entries(items)) {
      if (
        typeof token === "object" &&
        token !== null &&
        "value" in token &&
        typeof token.value === "string"
      ) {
        lines.push(`  --wf-${group}-${name}: ${token.value};`);
      }
    }
  }

  lines.push(...SEMANTIC_CUSTOM_PROPERTIES, "}", ...TOKEN_CSS_FOOTER, "");
  return lines.join("\n");
}

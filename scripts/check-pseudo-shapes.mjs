import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const STYLE_EXT = new Set([
  ".astro",
  ".css",
  ".html",
  ".pcss",
  ".scss",
  ".svelte",
  ".vue",
]);

const STYLE_TAG_EXT = new Set([".astro", ".html", ".svelte", ".vue"]);

const existingCatalogBullets = new Set([
  ".eyebrow::before",
  ".plain-list li::before",
]);

function lineOf(text, index) {
  let line = 1;
  const end = Math.min(Math.max(index, 0), text.length);
  for (let i = 0; i < end; i += 1) {
    if (text[i] === "\n") line += 1;
  }
  return line;
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replace(/[^\n]/g, " "),
  );
}

function endOfString(text, index) {
  const quote = text[index];
  let cursor = index + 1;
  while (cursor < text.length) {
    if (text[cursor] === "\\") {
      cursor += 2;
      continue;
    }
    if (text[cursor] === quote) return cursor + 1;
    if (text[cursor] === "\n") return cursor;
    cursor += 1;
  }
  return cursor;
}

function extractsStyleTags(file) {
  return STYLE_TAG_EXT.has(path.extname(file).toLowerCase());
}

function styleSegments(source, file) {
  if (!extractsStyleTags(file)) return [{ css: source, line: 1 }];
  const segments = [];
  const open = /<style\b[^>]*>/gi;
  let match = open.exec(source);
  while (match) {
    const start = match.index + match[0].length;
    const close = source.toLowerCase().indexOf("</style>", start);
    if (close === -1) break;
    segments.push({
      css: source.slice(start, close),
      line: lineOf(source, start),
    });
    open.lastIndex = close + "</style>".length;
    match = open.exec(source);
  }
  return segments;
}

function rulesIn(css) {
  const rules = [];
  const stack = [];
  let cursor = 0;
  let i = 0;
  while (i < css.length) {
    const current = css[i];
    if (current === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }
    if (current === '"' || current === "'") {
      i = endOfString(css, i);
      continue;
    }
    if (current === "{") {
      stack.push({
        selectorStart: cursor,
        selector: css.slice(cursor, i),
        bodyStart: i + 1,
      });
      cursor = i + 1;
      i += 1;
      continue;
    }
    if (current === "}") {
      const frame = stack.pop();
      if (frame) {
        rules.push({
          selector: frame.selector,
          selectorStart: frame.selectorStart,
          body: css.slice(frame.bodyStart, i),
        });
      }
      cursor = i + 1;
      i += 1;
      continue;
    }
    if (current === ";") cursor = i + 1;
    i += 1;
  }
  return rules;
}

function splitSelectors(selector) {
  const parts = [];
  let start = 0;
  let quote = "";
  let parens = 0;
  for (let i = 0; i < selector.length; i += 1) {
    const current = selector[i];
    if (quote) {
      if (current === "\\") {
        i += 1;
        continue;
      }
      if (current === quote) quote = "";
      continue;
    }
    if (current === '"' || current === "'") {
      quote = current;
      continue;
    }
    if (current === "(") parens += 1;
    else if (current === ")") parens = Math.max(0, parens - 1);
    else if (current === "," && parens === 0) {
      parts.push(selector.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts;
}

function withoutNestedBlocks(body) {
  let out = "";
  let depth = 0;
  let quote = "";
  for (let i = 0; i < body.length; i += 1) {
    const current = body[i];
    if (quote) {
      if (depth === 0) out += current;
      if (current === "\\") {
        i += 1;
        if (depth === 0 && i < body.length) out += body[i];
        continue;
      }
      if (current === quote) quote = "";
      continue;
    }
    if (current === '"' || current === "'") {
      quote = current;
      if (depth === 0) out += current;
      continue;
    }
    if (current === "{") {
      depth += 1;
      continue;
    }
    if (current === "}") {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth === 0) out += current;
  }
  return out;
}

function declarations(body) {
  const flat = withoutNestedBlocks(stripComments(body));
  const parts = [];
  let start = 0;
  let quote = "";
  let parens = 0;
  for (let i = 0; i < flat.length; i += 1) {
    const current = flat[i];
    if (quote) {
      if (current === "\\") {
        i += 1;
        continue;
      }
      if (current === quote) quote = "";
      continue;
    }
    if (current === '"' || current === "'") {
      quote = current;
      continue;
    }
    if (current === "(") parens += 1;
    else if (current === ")") parens = Math.max(0, parens - 1);
    else if (current === ";" && parens === 0) {
      parts.push(flat.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(flat.slice(start));
  return parts;
}

function propertyName(declaration) {
  const match = declaration.match(/^\s*(-{0,2}[A-Za-z_][\w-]*)\s*:/);
  return match ? match[1] : "";
}

function canonicalProperty(name) {
  return name.toLowerCase().replace(/^-(?:webkit|moz|ms)-/, "");
}

function isPaintProperty(name) {
  if (name.startsWith("--")) return false;
  const property = canonicalProperty(name);
  if (property === "background" || property.startsWith("background-"))
    return true;
  if (property === "box-shadow") return true;
  if (property === "border" || property.startsWith("border-")) return true;
  return false;
}

function paintProperties(body) {
  const seen = new Set();
  const found = [];
  for (const declaration of declarations(body)) {
    const name = propertyName(declaration);
    if (!name || !isPaintProperty(name)) continue;
    const property = canonicalProperty(name);
    if (seen.has(property)) continue;
    seen.add(property);
    found.push(property);
  }
  return found;
}

function normalizedSelector(selector) {
  return selector.replace(/\s+/g, " ").trim();
}

function isBreadcrumbSeparator(selector) {
  return (
    /(^|[^\w-])ao-breadcrumbs(?![\w-])/.test(selector) &&
    /::before\b/.test(selector)
  );
}

function isAudienceCounter(selector) {
  return (
    /(^|[^\w-])home3a-audience(?=__|[^\w-]|$)/.test(selector) &&
    /::after\b/.test(selector)
  );
}

function isExistingCatalogBullet(selector, properties) {
  if (!existingCatalogBullets.has(normalizedSelector(selector))) return false;
  return properties.every(
    (property) =>
      property === "background" || property.startsWith("background-"),
  );
}

function isAllowed(selector, properties) {
  const text = normalizedSelector(selector);
  if (isBreadcrumbSeparator(text)) return true;
  if (isAudienceCounter(text)) return true;
  if (isExistingCatalogBullet(text, properties)) return true;
  return false;
}

function pseudoParts(selector) {
  return splitSelectors(stripComments(selector)).filter((part) =>
    /::(?:before|after)\b/.test(part),
  );
}

export function scanPseudoShapes(source, file = "fixture.css") {
  const violations = [];
  for (const segment of styleSegments(source, file)) {
    for (const rule of rulesIn(segment.css)) {
      const properties = paintProperties(rule.body);
      if (properties.length === 0) continue;
      const visible = stripComments(rule.selector);
      for (const part of pseudoParts(rule.selector)) {
        if (isAllowed(part, properties)) continue;
        const needle = part.trim();
        const at = visible.indexOf(needle);
        const index = rule.selectorStart + (at < 0 ? 0 : at);
        violations.push({
          file,
          line: segment.line + lineOf(segment.css, index) - 1,
          selector: normalizedSelector(stripComments(part)),
          properties,
        });
      }
    }
  }
  return violations;
}

function displayPath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  const shown = relative.startsWith("..") ? filePath : relative;
  return shown.replaceAll("\\", "/");
}

function collect(target, into, explicit) {
  const stats = statSync(target);
  if (stats.isDirectory()) {
    for (const name of readdirSync(target).sort((a, b) => a.localeCompare(b))) {
      if (
        name === "node_modules" ||
        name === "dist" ||
        name === ".git" ||
        name === ".astro"
      ) {
        continue;
      }
      collect(path.join(target, name), into, false);
    }
    return;
  }
  if (!stats.isFile()) return;
  if (!explicit && !STYLE_EXT.has(path.extname(target).toLowerCase())) return;
  into.push(target);
}

export function scanPseudoShapePaths(targets) {
  const files = [];
  for (const target of targets) collect(target, files, true);
  files.sort((a, b) => a.localeCompare(b));
  const violations = [];
  for (const file of files) {
    violations.push(
      ...scanPseudoShapes(readFileSync(file, "utf8"), displayPath(file)),
    );
  }
  return violations;
}

function main() {
  try {
    const targets = process.argv.slice(2).filter((arg) => arg.length > 0);
    const violations = scanPseudoShapePaths(
      targets.length > 0 ? targets : ["src"],
    );
    if (violations.length > 0) {
      console.error("Pseudoelement maluje kształt:");
      for (const hit of violations) {
        console.error(
          `${hit.file}:${hit.line}: ${hit.selector} ustawia ${hit.properties.join(", ")}`,
        );
      }
      process.exit(1);
    }
    console.log("ok");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const invoked = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invoked) main();

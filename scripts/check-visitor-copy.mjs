import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SOURCE_EXT = new Set([
  ".astro",
  ".cjs",
  ".html",
  ".js",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

const CODE_EXT = new Set([".astro", ".cjs", ".js", ".mjs", ".ts", ".tsx"]);

const BARE_PCOS = /\bPCOS\b/g;
const LABEL_CHAR = /PMOS\u00A0\(PCOS\)/g;
const LABEL_SOURCE = /PMOS\\u00A0\(PCOS\)/g;
const SLUG = /[A-Za-z0-9]+(?:-[A-Za-z0-9]+)+/g;
const URL_TOKEN = /https?:\/\/[^\s"'`<>)]+/g;
const TOPIC_QUERY = /[?&](?:topic|_id)=[^\s&"'`#]*/g;
const FIELD_VALUE =
  /(?:\b_id|\btopic|\bslug|\bhref|\burl|\bcurrent)\s*(?::|===?)\s*\{?\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g;
const ALLOW_LINE =
  /wytyczne\s+PCOS|PCOS\s+guideline|walki\s+z\s+PCOS|fighting\s+PCOS/i;
const ARTICLE_KEYS = new Set([
  "body",
  "seo",
  "seoDescription",
  "seoTitle",
  "title",
]);

function normalized(filePath) {
  return filePath.replaceAll("\\", "/");
}

function isAllowlistedFile(filePath) {
  return normalized(filePath).endsWith(
    "src/content/examples/legal-newsletter.md",
  );
}

function isArticleFixture(filePath) {
  const file = normalized(filePath);
  return (
    file.endsWith("/examples/article.md") ||
    file.endsWith("/article-featured.ts") ||
    file.includes("/articles/") ||
    /(?:^|\/)[^/]*article-seed[^/]*$/.test(file) ||
    /(?:^|\/)[^/]*article-fixture[^/]*$/.test(file)
  );
}

function pushMatch(ranges, start, end) {
  if (end > start) ranges.push([start, end]);
}

function pushPattern(ranges, text, pattern) {
  for (const match of text.matchAll(pattern)) {
    pushMatch(ranges, match.index, match.index + match[0].length);
  }
}

function maskMarkdownTargets(text, ranges) {
  const pattern = /\[[^\]]*\]\(([^)\s]+)\)/g;
  for (const match of text.matchAll(pattern)) {
    const open = match[0].lastIndexOf("(");
    pushMatch(
      ranges,
      match.index + open + 1,
      match.index + match[0].length - 1,
    );
  }
}

function endOfString(text, start) {
  const quote = text[start];
  let index = start + 1;
  if (quote === "`") {
    let depth = 0;
    while (index < text.length) {
      if (text[index] === "\\") {
        index += 2;
        continue;
      }
      if (depth === 0 && text[index] === "`") return index + 1;
      if (text[index] === "$" && text[index + 1] === "{") {
        depth += 1;
        index += 2;
        continue;
      }
      if (depth > 0 && text[index] === "{") depth += 1;
      else if (depth > 0 && text[index] === "}") depth -= 1;
      index += 1;
    }
    return index;
  }
  while (index < text.length) {
    if (text[index] === "\\") {
      index += 2;
      continue;
    }
    if (text[index] === quote) return index + 1;
    if (text[index] === "\n") break;
    index += 1;
  }
  return index;
}

function skipSpaceAndComments(text, index, ranges) {
  let cursor = index;
  while (cursor < text.length) {
    const current = text[cursor];
    if (
      current === " " ||
      current === "\t" ||
      current === "\n" ||
      current === "\r"
    ) {
      cursor += 1;
      continue;
    }
    if (current === "/" && text[cursor + 1] === "/") {
      const start = cursor;
      while (cursor < text.length && text[cursor] !== "\n") cursor += 1;
      pushMatch(ranges, start, cursor);
      continue;
    }
    if (current === "/" && text[cursor + 1] === "*") {
      const start = cursor;
      cursor += 2;
      while (
        cursor < text.length &&
        !(text[cursor] === "*" && text[cursor + 1] === "/")
      ) {
        cursor += 1;
      }
      cursor = Math.min(text.length, cursor + 2);
      pushMatch(ranges, start, cursor);
      continue;
    }
    break;
  }
  return cursor;
}

function skipTypeAnnotation(text, index) {
  let cursor = index + 1;
  let brace = 0;
  let bracket = 0;
  let angle = 0;
  while (cursor < text.length) {
    const current = text[cursor];
    if (current === '"' || current === "'" || current === "`") {
      cursor = endOfString(text, cursor);
      continue;
    }
    if (current === "/" && text[cursor + 1] === "/") {
      while (cursor < text.length && text[cursor] !== "\n") cursor += 1;
      continue;
    }
    if (current === "/" && text[cursor + 1] === "*") {
      cursor += 2;
      while (
        cursor < text.length &&
        !(text[cursor] === "*" && text[cursor + 1] === "/")
      ) {
        cursor += 1;
      }
      cursor = Math.min(text.length, cursor + 2);
      continue;
    }
    if (current === "=" && brace === 0 && bracket === 0 && angle === 0) {
      return cursor;
    }
    if (current === "{") brace += 1;
    else if (current === "}") brace -= 1;
    else if (current === "[") bracket += 1;
    else if (current === "]") bracket -= 1;
    else if (current === "<") angle += 1;
    else if (current === ">") angle = Math.max(0, angle - 1);
    cursor += 1;
  }
  return cursor;
}

function consumeValue(text, index, ranges) {
  let cursor = skipSpaceAndComments(text, index, ranges);
  if (cursor >= text.length) return cursor;
  const current = text[cursor];
  if (current === '"' || current === "'" || current === "`") {
    const end = endOfString(text, cursor);
    pushMatch(ranges, cursor, end);
    return end;
  }
  if (current === "{" || current === "[") {
    const start = cursor;
    const open = current;
    const close = current === "{" ? "}" : "]";
    let depth = 0;
    while (cursor < text.length) {
      const char = text[cursor];
      if (char === '"' || char === "'" || char === "`") {
        cursor = endOfString(text, cursor);
        continue;
      }
      if (char === "/" && text[cursor + 1] === "/") {
        while (cursor < text.length && text[cursor] !== "\n") cursor += 1;
        continue;
      }
      if (char === "/" && text[cursor + 1] === "*") {
        cursor += 2;
        while (
          cursor < text.length &&
          !(text[cursor] === "*" && text[cursor + 1] === "/")
        ) {
          cursor += 1;
        }
        cursor = Math.min(text.length, cursor + 2);
        continue;
      }
      if (char === open) depth += 1;
      else if (char === close) {
        depth -= 1;
        cursor += 1;
        if (depth === 0) break;
        continue;
      }
      cursor += 1;
    }
    pushMatch(ranges, start, cursor);
    return cursor;
  }
  const start = cursor;
  while (
    cursor < text.length &&
    text[cursor] !== "\n" &&
    text[cursor] !== ","
  ) {
    cursor += 1;
  }
  pushMatch(ranges, start, cursor);
  return cursor;
}

function codeMaskRanges(text) {
  const ranges = [];
  const articleObjects = [];
  let articleArrayDepth = null;
  let brace = 0;
  let bracket = 0;
  let index = 0;

  const inArticle = () =>
    articleArrayDepth !== null || articleObjects.length > 0;

  while (index < text.length) {
    const current = text[index];
    if (current === '"' || current === "'" || current === "`") {
      index = endOfString(text, index);
      continue;
    }
    if (current === "/" && text[index + 1] === "/") {
      const start = index;
      while (index < text.length && text[index] !== "\n") index += 1;
      pushMatch(ranges, start, index);
      continue;
    }
    if (current === "/" && text[index + 1] === "*") {
      const start = index;
      index += 2;
      while (
        index < text.length &&
        !(text[index] === "*" && text[index + 1] === "/")
      ) {
        index += 1;
      }
      index = Math.min(text.length, index + 2);
      pushMatch(ranges, start, index);
      continue;
    }
    if (current === "{") {
      brace += 1;
      index += 1;
      continue;
    }
    if (current === "}") {
      brace -= 1;
      while (
        articleObjects.length > 0 &&
        articleObjects[articleObjects.length - 1] > brace
      ) {
        articleObjects.pop();
      }
      index += 1;
      continue;
    }
    if (current === "[") {
      bracket += 1;
      index += 1;
      continue;
    }
    if (current === "]") {
      bracket -= 1;
      if (articleArrayDepth !== null && bracket < articleArrayDepth) {
        articleArrayDepth = null;
      }
      index += 1;
      continue;
    }
    if (!/[A-Za-z_$]/.test(current)) {
      index += 1;
      continue;
    }
    const start = index;
    index += 1;
    while (index < text.length && /[\w$]/.test(text[index])) index += 1;
    const word = text.slice(start, index);
    if (word === "BLOG_ARTICLE_SEED") {
      let cursor = skipSpaceAndComments(text, index, ranges);
      if (text[cursor] === ":") cursor = skipTypeAnnotation(text, cursor);
      cursor = skipSpaceAndComments(text, cursor, ranges);
      if (text[cursor] === "=") {
        cursor = skipSpaceAndComments(text, cursor + 1, ranges);
        if (text[cursor] === "[") {
          bracket += 1;
          articleArrayDepth = bracket;
          index = cursor + 1;
          continue;
        }
      }
      continue;
    }
    let cursor = skipSpaceAndComments(text, index, ranges);
    if (text[cursor] !== ":") continue;
    cursor = skipSpaceAndComments(text, cursor + 1, ranges);
    if (word === "_type") {
      if (text[cursor] === '"' || text[cursor] === "'") {
        const end = endOfString(text, cursor);
        if (text.slice(cursor + 1, end - 1) === "article") {
          articleObjects.push(brace);
        }
        index = end;
        continue;
      }
    }
    if (inArticle() && ARTICLE_KEYS.has(word)) {
      index = consumeValue(text, cursor, ranges);
      continue;
    }
  }
  return ranges;
}

function maskRanges(text, filePath) {
  const ranges = [];
  pushPattern(ranges, text, LABEL_CHAR);
  pushPattern(ranges, text, LABEL_SOURCE);
  pushPattern(ranges, text, SLUG);
  pushPattern(ranges, text, URL_TOKEN);
  pushPattern(ranges, text, TOPIC_QUERY);
  pushPattern(ranges, text, FIELD_VALUE);
  maskMarkdownTargets(text, ranges);
  if (CODE_EXT.has(path.extname(filePath))) {
    for (const range of codeMaskRanges(text)) ranges.push(range);
  }
  return ranges;
}

function covered(ranges, index) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

function lineAndExcerpt(text, index) {
  let line = 1;
  let start = 0;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (text.charCodeAt(cursor) === 10) {
      line += 1;
      start = cursor + 1;
    }
  }
  let end = text.indexOf("\n", start);
  if (end === -1) end = text.length;
  const raw = text.slice(start, end).replace(/\r$/, "");
  const excerpt = raw.replace(/\s+/g, " ").trim().slice(0, 180);
  return { line, raw, excerpt };
}

export function scanVisitorCopy(text, filePath = "fixture") {
  if (isArticleFixture(filePath)) return { allowed: [], violations: [] };
  const ranges = maskRanges(text, filePath);
  const allowed = [];
  const violations = [];
  const seen = new Set();
  for (const match of text.matchAll(BARE_PCOS)) {
    if (covered(ranges, match.index)) continue;
    const { line, raw, excerpt } = lineAndExcerpt(text, match.index);
    const key = `${line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const hit = { file: normalized(filePath), line, excerpt };
    if (isAllowlistedFile(filePath) || ALLOW_LINE.test(raw)) {
      allowed.push(hit);
    } else {
      violations.push(hit);
    }
  }
  return { allowed, violations };
}

function displayPath(filePath) {
  const relative = path.relative(process.cwd(), filePath);
  const shown = relative.startsWith("..") ? filePath : relative;
  return normalized(shown);
}

function collect(target, into, explicit) {
  const stats = statSync(target);
  if (stats.isDirectory()) {
    for (const name of readdirSync(target).sort((a, b) => a.localeCompare(b))) {
      if (name === "node_modules" || name === "dist" || name === ".git")
        continue;
      collect(path.join(target, name), into, false);
    }
    return;
  }
  if (!stats.isFile()) return;
  if (!explicit && !SOURCE_EXT.has(path.extname(target))) return;
  into.push(target);
}

export function scanVisitorCopyPaths(targets) {
  const files = [];
  for (const target of targets) collect(target, files, true);
  files.sort((a, b) => a.localeCompare(b));
  const allowed = [];
  const violations = [];
  for (const file of files) {
    const report = scanVisitorCopy(
      readFileSync(file, "utf8"),
      displayPath(file),
    );
    allowed.push(...report.allowed);
    violations.push(...report.violations);
  }
  return { allowed, violations };
}

function printReport(report) {
  console.log(`allowed ${report.allowed.length}`);
  for (const hit of report.allowed) {
    console.log(`${hit.file}:${hit.line}: ${hit.excerpt}`);
  }
  if (report.violations.length > 0) {
    console.error("Gołe PCOS w copy dla gościa:");
    for (const hit of report.violations) {
      console.error(`${hit.file}:${hit.line}: ${hit.excerpt}`);
    }
    process.exitCode = 1;
  }
}

function main() {
  try {
    const targets = process.argv.slice(2).filter((arg) => arg.length > 0);
    printReport(
      scanVisitorCopyPaths(targets.length > 0 ? targets : ["src/content"]),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

const invoked = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";
if (import.meta.url === invoked) main();

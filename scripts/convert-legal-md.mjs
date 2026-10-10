#!/usr/bin/env node
/**
 * Converts the B2C legal Markdown drafts (www-prawne/) into legalBody
 * Portable Text fixtures in src/content/legal-bodies/<slug>.json.
 *
 * Usage:
 *   node scripts/convert-legal-md.mjs <source-dir>
 *   node scripts/convert-legal-md.mjs <source-dir> --check   # fail if fixtures differ
 *
 * The report lists dropped internal links (e.g. ../rodo/…) and the parsed
 * metadata. Only the subset of Markdown used by the drafts is supported; an
 * unsupported construct stops the conversion instead of leaking raw syntax.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { format } from "prettier";

export const LEGAL_DOCUMENTS = [
  {
    slug: "regulamin",
    source: "regulamin.md",
    appendices: [
      { source: "pouczenie-o-odstapieniu.md", anchor: "pouczenie" },
      { source: "formularz-odstapienia.md", anchor: "formularz-odstapienia" },
    ],
    seoDescription:
      "Regulamin sprzedaży e-booków i konsultacji dietetycznych online, z pouczeniem i wzorem formularza odstąpienia od umowy.",
  },
  {
    slug: "polityka-prywatnosci",
    source: "polityka-prywatnosci.md",
    appendices: [],
    seoDescription:
      "Jak Wellbiz sp. z o.o. przetwarza dane osobowe, w tym dane o zdrowiu, przy konsultacjach dietetycznych, e-bookach i newsletterze.",
  },
  {
    slug: "lista-cookies-i-identyfikatorow",
    source: "lista-cookies-i-identyfikatorow.md",
    appendices: [],
    seoDescription:
      "Pliki cookies i identyfikatory na aleksandraolesiewicz.com: niezbędne, analityczne i marketingowe, z dostawcą i okresem działania.",
  },
  {
    slug: "regulamin-newslettera",
    source: "regulamin-newslettera.md",
    appendices: [],
    seoDescription:
      "Zasady newslettera i materiałów bezpłatnych: zapis, rezygnacja, odstąpienie od umowy i reklamacje.",
  },
];

const DOCUMENT_ROUTES = {
  "regulamin.md": "/regulamin/",
  "polityka-prywatnosci.md": "/polityka-prywatnosci/",
  "lista-cookies-i-identyfikatorow.md": "/lista-cookies-i-identyfikatorow/",
  "regulamin-newslettera.md": "/regulamin-newslettera/",
  "pouczenie-o-odstapieniu.md": "/regulamin/#pouczenie",
  "formularz-odstapienia.md": "/regulamin/#formularz-odstapienia",
};

/** Site route for a Markdown href, or null when the target is not public. */
export function mapLegalHref(href) {
  const value = href.trim();
  if (/^(https?:|mailto:|tel:)/i.test(value) || value.startsWith("#")) {
    return value;
  }
  const [path, hash] = value.split("#");
  if (path.startsWith("/")) {
    const route = path.endsWith("/") ? path : `${path}/`;
    return hash ? `${route}#${hash}` : route;
  }
  const route = DOCUMENT_ROUTES[path.replace(/^\.\//, "")];
  if (!route) return null;
  return hash && !route.includes("#") ? `${route}#${hash}` : route;
}

export function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ESCAPABLE = /[\\`*_{}[\]()#+\-.!|>~]/;

function findClosing(text, delimiter, from) {
  for (let index = from; index < text.length; index += 1) {
    const char = text[index];
    if (char === "\\") {
      index += 1;
    } else if (char === "`") {
      const end = text.indexOf("`", index + 1);
      if (end !== -1) index = end;
    } else if (text.startsWith(delimiter, index)) {
      if (delimiter === "*" && text[index + 1] === "*") {
        index += 1;
        continue;
      }
      return index;
    }
  }
  return -1;
}

/** Inline Markdown -> Portable Text spans + link markDefs. */
export function parseInline(text, context) {
  const spans = [];
  const markDefs = [];

  const push = (value, marks) => {
    if (!value) return;
    const last = spans[spans.length - 1];
    if (last && last.marks.join() === marks.join()) last.text += value;
    else spans.push({ text: value, marks });
  };

  const walk = (value, marks) => {
    let buffer = "";
    const flush = () => {
      push(buffer, marks);
      buffer = "";
    };
    for (let index = 0; index < value.length; index += 1) {
      const char = value[index];
      const next = value[index + 1];
      if (char === "\\" && next && ESCAPABLE.test(next)) {
        buffer += next;
        index += 1;
        continue;
      }
      if (char === "`") {
        const end = value.indexOf("`", index + 1);
        if (end !== -1) {
          flush();
          push(value.slice(index + 1, end), [...marks, "code"]);
          index = end;
          continue;
        }
      }
      if (value.startsWith("**", index)) {
        const end = findClosing(value, "**", index + 2);
        if (end !== -1) {
          flush();
          walk(value.slice(index + 2, end), [...marks, "strong"]);
          index = end + 1;
          continue;
        }
      }
      if (char === "*" && next && next !== " ") {
        const end = findClosing(value, "*", index + 1);
        if (end !== -1) {
          flush();
          walk(value.slice(index + 1, end), [...marks, "em"]);
          index = end;
          continue;
        }
      }
      if (char === "[") {
        const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(value.slice(index));
        if (link) {
          flush();
          const href = mapLegalHref(link[2]);
          if (href) {
            const key = `l${markDefs.length}`;
            markDefs.push({ _type: "link", _key: key, href });
            walk(link[1], [...marks, key]);
          } else {
            context.droppedLinks.push({ text: link[1], href: link[2] });
            walk(link[1], marks);
          }
          index += link[0].length - 1;
          continue;
        }
      }
      buffer += char;
    }
    flush();
  };

  walk(text, []);
  for (const span of spans) {
    if (/\*\*|\]\(|`/.test(span.text)) {
      throw new Error(`Nieobsłużona składnia Markdown: ${span.text}`);
    }
  }
  return {
    children: spans.map((span, index) => ({
      _type: "span",
      _key: `s${index}`,
      text: span.text,
      marks: span.marks,
    })),
    markDefs,
  };
}

function splitRow(line) {
  const cells = [];
  let cell = "";
  let inCode = false;
  const body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  for (let index = 0; index < body.length; index += 1) {
    const char = body[index];
    if (char === "\\" && body[index + 1] === "|") {
      cell += "|";
      index += 1;
    } else if (char === "`") {
      inCode = !inCode;
      cell += char;
    } else if (char === "|" && !inCode) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

/** Table cells stay inline Markdown (rendered by renderInlineMarkup). */
function tableCell(value, context) {
  if (/(^|[^*])\*[^*\s][^*]*\*(?!\*)/.test(value)) {
    throw new Error(`Kursywa w komórce tabeli nie jest obsługiwana: ${value}`);
  }
  return value.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
    const mapped = mapLegalHref(href);
    if (mapped) return `[${text}](${mapped})`;
    context.droppedLinks.push({ text, href });
    return text;
  });
}

function parseMetadata(rows) {
  const fields = new Map(
    rows.map(([key, value]) => [key.replaceAll("*", "").trim(), value.trim()]),
  );
  const version = fields.get("Wersja");
  if (!version) throw new Error("Metryka dokumentu nie ma pola „Wersja”.");
  const effective = fields.get("Data wejścia w życie") ?? "";
  const date = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(effective);
  return {
    version,
    effectiveFrom: date ? `${date[3]}-${date[2]}-${date[1]}` : null,
  };
}

const LIST_MARKER = /^(\s*)(\d+\.|[-*])\s+(.*)$/;

/**
 * One Markdown document -> { title, version, effectiveFrom, body }.
 * `anchor` turns the H1 into an H2 with that id and demotes the rest by one
 * level (used for appendices printed on the same page).
 */
export function convertLegalMarkdown(markdown, options = {}) {
  const { anchor = null, keyPrefix = "", droppedLinks = [] } = options;
  const context = { droppedLinks };
  const lines = markdown
    .replace(/^\uFEFF?\s*<!--[\s\S]*?-->\s*/, "")
    .split(/\r?\n/);
  const body = [];
  const usedKeys = options.usedKeys ?? new Set();
  let title = null;
  let metadata = null;
  let blockCount = 0;

  const key = (preferred) => {
    let value = preferred || `${keyPrefix}b${blockCount}`;
    if (usedKeys.has(value)) {
      const root = value;
      let suffix = 2;
      while (usedKeys.has(`${root}-${suffix}`)) suffix += 1;
      value = `${root}-${suffix}`;
    }
    usedKeys.add(value);
    blockCount += 1;
    return value;
  };

  const textBlock = (text, extra) => ({
    _type: "block",
    _key: extra.key ?? key(),
    style: extra.style ?? "normal",
    ...(extra.listItem
      ? {
          listItem: extra.listItem,
          level: extra.level,
          ...(extra.listStart ? { listStart: extra.listStart } : {}),
        }
      : {}),
    ...parseInline(text, context),
  });

  const startsBlock = (line) =>
    /^#{1,6}\s/.test(line) ||
    /^\|/.test(line) ||
    /^>/.test(line) ||
    /^-{3,}\s*$/.test(line) ||
    LIST_MARKER.test(line);

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim() || /^-{3,}\s*$/.test(line)) {
      index += 1;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      const text = heading[2];
      const level = heading[1].length + (anchor ? 1 : 0);
      index += 1;
      if (heading[1].length === 2 && text === "Historia wersji") {
        while (index < lines.length && !/^#{1,2}\s/.test(lines[index])) {
          index += 1;
        }
        continue;
      }
      if (heading[1].length === 1) {
        if (title) throw new Error(`Drugi nagłówek H1: ${text}`);
        title = text;
        continue;
      }
      if (level === 2 && title && !anchor && !metadata && body.length === 0) {
        title = `${title} ${text}`;
        continue;
      }
      if (level > 3) throw new Error(`Nagłówek poziomu ${level}: ${text}`);
      body.push(
        textBlock(text, {
          style: `h${level}`,
          key: level === 2 ? key(slugify(text)) : undefined,
        }),
      );
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (index < lines.length && /^\|/.test(lines[index])) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      const [headers, separator, ...cells] = rows;
      if (!separator?.every((cell) => /^:?-{3,}:?$/.test(cell))) {
        throw new Error(`Tabela bez wiersza separatora: ${line}`);
      }
      if (headers[0] === "Metryka dokumentu") {
        metadata = parseMetadata(cells);
        continue;
      }
      body.push({
        _type: "articleTable",
        _key: key(),
        headers: headers.map((cell) => tableCell(cell, context)),
        rows: cells.map((row, rowIndex) => ({
          _key: `r${rowIndex}`,
          cells: row.map((cell) => tableCell(cell, context)),
        })),
      });
      continue;
    }

    if (/^>/.test(line)) {
      const paragraphs = [[]];
      while (index < lines.length && /^>/.test(lines[index])) {
        const content = lines[index].replace(/^>\s?/, "");
        if (content.trim()) paragraphs[paragraphs.length - 1].push(content);
        else paragraphs.push([]);
        index += 1;
      }
      for (const paragraph of paragraphs) {
        if (paragraph.length === 0) continue;
        body.push(
          textBlock(paragraph.map((part) => part.trim()).join(" "), {
            style: "blockquote",
          }),
        );
      }
      continue;
    }

    if (LIST_MARKER.test(line)) {
      const stack = [];
      const items = [];
      while (index < lines.length) {
        const current = lines[index];
        const marker = LIST_MARKER.exec(current);
        if (marker) {
          const indent = marker[1].length;
          while (stack.length > 0 && stack.at(-1) > indent) stack.pop();
          const fresh = stack.at(-1) !== indent;
          if (fresh) stack.push(indent);
          const ordered = marker[2] !== "-" && marker[2] !== "*";
          const number = ordered ? Number.parseInt(marker[2], 10) : 1;
          items.push({
            listItem: ordered ? "number" : "bullet",
            level: stack.length,
            listStart: fresh && number > 1 ? number : undefined,
            text: marker[3].trim(),
          });
          index += 1;
          continue;
        }
        if (current.trim() && /^\s+/.test(current)) {
          items[items.length - 1].text += ` ${current.trim()}`;
          index += 1;
          continue;
        }
        if (!current.trim()) {
          const following = lines[index + 1] ?? "";
          if (LIST_MARKER.test(following) && /^\s+/.test(following)) {
            index += 1;
            continue;
          }
        }
        break;
      }
      for (const item of items) body.push(textBlock(item.text, item));
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      (paragraph.length === 0 || !startsBlock(lines[index]))
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    const text = paragraph.join(" ");
    if (body.length === 0 && /^obowiązuje od \S+$/.test(text)) continue;
    body.push(textBlock(text, {}));
  }

  if (!title) throw new Error("Dokument nie ma nagłówka H1.");
  if (!metadata) throw new Error(`${title}: brak tabeli „Metryka dokumentu”.`);
  if (anchor) {
    body.unshift({
      _type: "block",
      _key: key(anchor),
      style: "h2",
      ...parseInline(title, context),
    });
    if (body[0]._key !== anchor) {
      throw new Error(`Kotwica #${anchor} jest już zajęta.`);
    }
  }
  return { title, ...metadata, body, droppedLinks };
}

/** Main document plus its appendices -> one legalBody fixture. */
export function buildLegalDocument(document, readSource) {
  const droppedLinks = [];
  const usedKeys = new Set();
  const main = convertLegalMarkdown(readSource(document.source), {
    droppedLinks,
    usedKeys,
  });
  const appendices = document.appendices.map((appendix) => ({
    source: appendix.source,
    ...convertLegalMarkdown(readSource(appendix.source), {
      anchor: appendix.anchor,
      keyPrefix: `${appendix.anchor}-`,
      droppedLinks,
      usedKeys,
    }),
  }));
  return {
    fixture: {
      title: main.title,
      version: main.version,
      effectiveFrom: main.effectiveFrom,
      seoDescription: document.seoDescription,
      body: [...main.body, ...appendices.flatMap((item) => item.body)],
    },
    report: {
      slug: document.slug,
      version: main.version,
      effectiveFrom: main.effectiveFrom,
      appendices: appendices.map((item) => ({
        source: item.source,
        version: item.version,
        effectiveFrom: item.effectiveFrom,
      })),
      droppedLinks,
    },
  };
}

async function main() {
  const [sourceDir] = process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith("--"));
  const check = process.argv.includes("--check");
  if (!sourceDir) {
    console.error(
      "Użycie: node scripts/convert-legal-md.mjs <katalog-źródłowy> [--check]",
    );
    process.exit(2);
  }
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const sources = new Map();
  for (const document of LEGAL_DOCUMENTS) {
    for (const file of [
      document.source,
      ...document.appendices.map((item) => item.source),
    ]) {
      sources.set(file, await readFile(join(sourceDir, file), "utf8"));
    }
  }
  const reports = [];
  const stale = [];
  for (const document of LEGAL_DOCUMENTS) {
    const { fixture, report } = buildLegalDocument(document, (file) =>
      sources.get(file),
    );
    const target = join(
      root,
      "src/content/legal-bodies",
      `${document.slug}.json`,
    );
    const json = await format(JSON.stringify(fixture, null, 2), {
      parser: "json",
    });
    if (check) {
      const current = await readFile(target, "utf8").catch(() => "");
      if (current !== json) stale.push(target);
    } else {
      await writeFile(target, json);
    }
    reports.push(report);
  }
  console.log(
    JSON.stringify(
      { mode: check ? "check" : "write", documents: reports },
      null,
      2,
    ),
  );
  if (stale.length > 0) {
    console.error(`Nieaktualne fixture’y: ${stale.join(", ")}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}

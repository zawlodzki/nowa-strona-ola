export interface TocEntry {
  id: string;
  text: string;
}

interface PortableSpan {
  _type?: string;
  text?: string;
  marks?: string[];
}

interface PortableMark {
  _type?: string;
  _key?: string;
  href?: string;
}

export interface PortableTextBlock {
  _type: "block";
  _key?: string;
  style?: string;
  listItem?: string;
  level?: number;
  listStart?: number;
  children?: PortableSpan[];
  markDefs?: PortableMark[];
}

export interface ArticleImageBlock {
  _type: "articleImage";
  _key?: string;
  alt?: string | null;
  caption?: string | null;
  src?: string | null;
}

export interface ArticleHighlightBlock {
  _type: "articleHighlight";
  _key?: string;
  title?: string | null;
  body?: string | null;
}

export interface ArticleCtaBlock {
  _type: "articleCta";
  _key?: string;
  title?: string | null;
  lead?: string | null;
  action?: { href?: string | null; label?: string | null } | null;
}

export interface ArticleTableBlock {
  _type: "articleTable";
  _key?: string;
  caption?: string | null;
  headers?: (string | null)[] | null;
  rows?: { cells?: (string | null)[] | null }[] | null;
}

export type PortableBlock =
  | PortableTextBlock
  | ArticleImageBlock
  | ArticleHighlightBlock
  | ArticleCtaBlock
  | ArticleTableBlock;

const blockTypes = new Set([
  "block",
  "articleImage",
  "articleHighlight",
  "articleCta",
  "articleTable",
]);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function plainText(children: PortableSpan[] | undefined): string {
  return (children ?? []).map((span) => span.text ?? "").join("");
}

function renderChildren(
  children: PortableSpan[] | undefined,
  marks: PortableMark[] | undefined,
): string {
  return (children ?? [])
    .map((span) => {
      let html = escapeHtml(span.text ?? "");
      for (const mark of span.marks ?? []) {
        if (mark === "strong") html = `<strong>${html}</strong>`;
        else if (mark === "em") html = `<em>${html}</em>`;
        else if (mark === "code") html = `<code>${html}</code>`;
        else {
          const def = marks?.find((item) => item._key === mark);
          if (def?.href) {
            html = `<a href="${escapeHtml(def.href)}">${html}</a>`;
          }
        }
      }
      return html;
    })
    .join("");
}

function markdownInline(
  children: PortableSpan[] | undefined,
  marks: PortableMark[] | undefined,
): string {
  return (children ?? [])
    .map((span) => {
      let text = span.text ?? "";
      for (const mark of span.marks ?? []) {
        if (mark === "strong") text = `**${text}**`;
        else if (mark === "em") text = `*${text}*`;
        else if (mark === "code") text = `\`${text}\``;
        else {
          const def = marks?.find((item) => item._key === mark);
          if (def?.href) text = `[${text}](${def.href})`;
        }
      }
      return text;
    })
    .join("");
}

function asRecord(value: unknown, index: number): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      `Blok artykułu ${index + 1} nie jest obiektem. Zatrzymuję build.`,
    );
  }
  return value as Record<string, unknown>;
}

export function parsePortableBlocks(value: unknown): PortableBlock[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Artykuł nie ma treści. Zatrzymuję build.");
  }
  return value.map((item, index) => {
    const block = asRecord(item, index);
    const type = typeof block._type === "string" ? block._type : "";
    if (!blockTypes.has(type)) {
      throw new Error(
        `Nieznany blok artykułu: ${type || "brak"}. Zatrzymuję build.`,
      );
    }
    return block as unknown as PortableBlock;
  });
}

const PAGE_HEADING_IDS = new Set([
  "main",
  "start",
  "autor",
  "ebooki",
  "faq",
  "newsletter",
  "recommended-articles",
  "toc-title",
  "books-title",
  "faq-title",
  "sidebar-title",
  "author-title",
]);

function isDomId(value: string): boolean {
  return /^[\w:-]+$/.test(value);
}

export function renderInlineMarkup(value: string): string {
  const tokens = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts: string[] = [];
  let cursor = 0;
  for (const match of value.matchAll(tokens)) {
    const index = match.index ?? 0;
    parts.push(escapeHtml(value.slice(cursor, index)));
    const token = match[0];
    if (token.startsWith("`")) {
      parts.push(`<code>${escapeHtml(token.slice(1, -1))}</code>`);
    } else if (token.startsWith("**")) {
      parts.push(`<strong>${escapeHtml(token.slice(2, -2))}</strong>`);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        parts.push(
          `<a href="${escapeHtml(link[2])}">${escapeHtml(link[1])}</a>`,
        );
      } else {
        parts.push(escapeHtml(token));
      }
    }
    cursor = index + token.length;
  }
  parts.push(escapeHtml(value.slice(cursor)));
  return parts.join("");
}

function headingId(
  block: PortableTextBlock,
  plain: string,
  usedIds: Set<string>,
): string {
  const key = block._key?.trim() ?? "";
  const slug = slugify(plain);
  const fromKey = key && isDomId(key) ? key : "";
  const preferred = fromKey || slug || "section";
  const fallback = fromKey && fromKey !== preferred ? fromKey : slug;
  let id = preferred;
  if (
    usedIds.has(id) &&
    fallback &&
    fallback !== id &&
    !usedIds.has(fallback)
  ) {
    id = fallback;
  }
  const root = id;
  let suffix = 1;
  while (usedIds.has(id)) {
    suffix += 1;
    id = `${root}-${suffix}`;
  }
  usedIds.add(id);
  return id;
}

export function articleBodyToHtml(blocks: unknown): {
  html: string;
  toc: TocEntry[];
} {
  const parsed = parsePortableBlocks(blocks);
  const toc: TocEntry[] = [];
  const usedIds = new Set(PAGE_HEADING_IDS);
  const html: string[] = [];
  // A nested list (level + 1) is rendered inside the still-open parent <li>,
  // so items stay valid HTML (<li>parent<ol>…</ol></li>), not <ol><ol>.
  const listStack: { type: string; level: number; itemOpen: boolean }[] = [];

  // Close the open item on the same output line ("<li>text</li>"), so flat
  // lists render exactly as before.
  const closeItem = () => {
    html[html.length - 1] += "</li>";
  };

  const closeTop = () => {
    const frame = listStack.pop()!;
    if (frame.itemOpen) closeItem();
    html.push(frame.type === "number" ? "</ol>" : "</ul>");
  };

  const closeListsTo = (level: number) => {
    while (
      listStack.length > 0 &&
      listStack[listStack.length - 1]!.level > level
    ) {
      closeTop();
    }
  };

  const closeAllLists = () => closeListsTo(0);

  const openList = (type: string, level: number, start?: number) => {
    const startAttr =
      type === "number" && start && start > 1 ? ` start="${start}"` : "";
    html.push(type === "number" ? `<ol${startAttr}>` : "<ul>");
    listStack.push({ type, level, itemOpen: false });
  };

  for (const block of parsed) {
    if (block._type === "block") {
      if (block.listItem) {
        const level = block.level && block.level > 0 ? block.level : 1;
        closeListsTo(level);
        const top = listStack[listStack.length - 1];
        if (!top || top.level < level) {
          openList(block.listItem, level, block.listStart);
        } else if (
          top.type !== block.listItem ||
          (block.listStart && block.listStart > 1)
        ) {
          closeTop();
          openList(block.listItem, level, block.listStart);
        } else if (top.itemOpen) {
          closeItem();
          top.itemOpen = false;
        }
        html.push(`<li>${renderChildren(block.children, block.markDefs)}`);
        listStack[listStack.length - 1]!.itemOpen = true;
        continue;
      }
      closeAllLists();
      const text = renderChildren(block.children, block.markDefs);
      if (block.style === "h2") {
        const plain = plainText(block.children);
        const id = headingId(block, plain, usedIds);
        toc.push({ id, text: plain });
        html.push(`<h2 id="${id}" tabindex="-1">${text}</h2>`);
        continue;
      }
      if (block.style === "h3") {
        html.push(`<h3>${text}</h3>`);
        continue;
      }
      if (block.style === "blockquote") {
        html.push(`<blockquote><p>${text}</p></blockquote>`);
        continue;
      }
      html.push(`<p>${text}</p>`);
      continue;
    }

    closeAllLists();

    if (block._type === "articleImage") {
      const alt = escapeHtml(block.alt ?? "");
      if (block.src) {
        html.push(
          `<figure><img src="${escapeHtml(block.src)}" alt="${alt}" />${
            block.caption
              ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
              : ""
          }</figure>`,
        );
      } else {
        html.push(
          `<figure><div class="media-frame media-frame--photo" role="img" aria-label="${alt}"></div>${
            block.caption
              ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
              : ""
          }</figure>`,
        );
      }
      continue;
    }

    if (block._type === "articleHighlight") {
      html.push(
        `<aside class="article-highlight">${
          block.title ? `<strong>${escapeHtml(block.title)}</strong>` : ""
        }<p>${escapeHtml(block.body ?? "")}</p></aside>`,
      );
      continue;
    }

    if (block._type === "articleCta") {
      const href = escapeHtml(block.action?.href ?? "#");
      const label = escapeHtml(block.action?.label ?? "");
      html.push(
        `<aside class="article-cta"><h2>${escapeHtml(block.title ?? "")}</h2><p>${escapeHtml(
          block.lead ?? "",
        )}</p><p><a class="text-link" href="${href}">${label}</a></p></aside>`,
      );
      continue;
    }

    if (block._type === "articleTable") {
      const headers = block.headers ?? [];
      const headerRow = headers
        .map((header) => `<th scope="col">${escapeHtml(header ?? "")}</th>`)
        .join("");
      const body = (block.rows ?? [])
        .map((row) => {
          const cells = (row.cells ?? [])
            .map((cell, index) =>
              index === 0
                ? `<th scope="row">${renderInlineMarkup(cell ?? "")}</th>`
                : `<td>${renderInlineMarkup(cell ?? "")}</td>`,
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      const caption = block.caption?.trim() ?? "";
      html.push(
        `<div class="article-table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(
          caption || "Tabela",
        )}"><table>${
          caption ? `<caption>${escapeHtml(caption)}</caption>` : ""
        }<thead><tr>${headerRow}</tr></thead><tbody>${body}</tbody></table></div>`,
      );
      continue;
    }

    const unknown: never = block;
    throw new Error(
      `Nieznany blok artykułu: ${(unknown as { _type?: string })._type ?? "brak"}. Zatrzymuję build.`,
    );
  }

  closeAllLists();
  return { html: html.join("\n"), toc };
}

export function markArticleIntro(html: string): string {
  return html.replace(/^<p>/, '<p class="article-intro">');
}

export function articleBodyToMarkdown(blocks: unknown): string {
  const parsed = parsePortableBlocks(blocks);
  const lines: string[] = [];
  // One frame per list level; nested items are indented under the parent's
  // text and numbered on their own (flat lists render exactly as before).
  let listStack: {
    type: string;
    index: number;
    indent: number;
    width: number;
  }[] = [];

  const closeList = () => {
    if (listStack.length > 0) {
      lines.push("");
      listStack = [];
    }
  };

  for (const block of parsed) {
    if (block._type === "block") {
      if (block.listItem) {
        const level = block.level && block.level > 0 ? block.level : 1;
        if (listStack.length > level) listStack = listStack.slice(0, level);
        if (
          listStack.length === level &&
          listStack[level - 1]!.type !== block.listItem
        ) {
          if (level === 1) closeList();
          else listStack = listStack.slice(0, level - 1);
        }
        while (listStack.length < level) {
          const parent = listStack[listStack.length - 1];
          listStack.push({
            type: block.listItem,
            index: 0,
            indent: parent ? parent.indent + parent.width : 0,
            width: 0,
          });
        }
        const frame = listStack[level - 1]!;
        frame.index += 1;
        const marker = block.listItem === "number" ? `${frame.index}.` : "-";
        frame.width = marker.length + 1;
        lines.push(
          `${" ".repeat(frame.indent)}${marker} ${markdownInline(block.children, block.markDefs)}`,
        );
        continue;
      }
      closeList();
      const text = markdownInline(block.children, block.markDefs);
      if (block.style === "h2") lines.push(`## ${text}`, "");
      else if (block.style === "h3") lines.push(`### ${text}`, "");
      else if (block.style === "blockquote") lines.push(`> ${text}`, "");
      else lines.push(text, "");
      continue;
    }
    closeList();
    if (block._type === "articleImage") {
      lines.push(`![${block.alt ?? ""}](${block.src ?? ""})`, "");
      if (block.caption) lines.push(block.caption, "");
      continue;
    }
    if (block._type === "articleHighlight") {
      if (block.title) lines.push(`**${block.title}**`, "");
      lines.push(block.body ?? "", "");
      continue;
    }
    if (block._type === "articleCta") {
      lines.push(`## ${block.title ?? ""}`, "", block.lead ?? "", "");
      if (block.action?.href && block.action.label) {
        lines.push(`[${block.action.label}](${block.action.href})`, "");
      }
      continue;
    }
    if (block._type === "articleTable") {
      const headers = (block.headers ?? []).map((header) => header ?? "");
      const rows = (block.rows ?? []).map((row) =>
        (row.cells ?? []).map((cell) => cell ?? ""),
      );
      const widths = headers.map((header, index) =>
        Math.max(
          header.length,
          ...rows.map((row) => (row[index] ?? "").length),
        ),
      );
      const format = (cells: string[]) =>
        `| ${cells
          .map((cell, index) => (cell ?? "").padEnd(widths[index] ?? 0))
          .join(" | ")} |`;
      lines.push(format(headers));
      lines.push(`| ${widths.map((width) => "-".repeat(width)).join(" | ")} |`);
      for (const row of rows) lines.push(format(row));
      if (block.caption) lines.push("", block.caption);
      lines.push("");
      continue;
    }
    const unknown: never = block;
    throw new Error(
      `Nieznany blok artykułu: ${(unknown as { _type?: string })._type ?? "brak"}. Zatrzymuję build.`,
    );
  }

  closeList();
  return lines.join("\n").trim();
}

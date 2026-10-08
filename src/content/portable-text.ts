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

function headingId(
  block: PortableTextBlock,
  plain: string,
  usedIds: Set<string>,
): string {
  const base = block._key
    ? `section-${block._key}`
    : slugify(plain) || "section";
  let id = base;
  let suffix = 1;
  while (usedIds.has(id)) {
    suffix += 1;
    id = `${base}-${suffix}`;
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
  const usedIds = new Set<string>();
  const html: string[] = [];
  let listType: string | null = null;

  const closeList = () => {
    if (listType) {
      html.push(listType === "number" ? "</ol>" : "</ul>");
      listType = null;
    }
  };

  for (const block of parsed) {
    if (block._type === "block") {
      if (block.listItem) {
        if (listType !== block.listItem) {
          closeList();
          html.push(block.listItem === "number" ? "<ol>" : "<ul>");
          listType = block.listItem;
        }
        html.push(`<li>${renderChildren(block.children, block.markDefs)}</li>`);
        continue;
      }
      closeList();
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

    closeList();

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
                ? `<th scope="row">${escapeHtml(cell ?? "")}</th>`
                : `<td>${escapeHtml(cell ?? "")}</td>`,
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      html.push(
        `<div class="article-table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(
          block.caption ?? "Tabela",
        )}"><table><caption>${escapeHtml(
          block.caption ?? "",
        )}</caption><thead><tr>${headerRow}</tr></thead><tbody>${body}</tbody></table></div>`,
      );
      continue;
    }

    const unknown: never = block;
    throw new Error(
      `Nieznany blok artykułu: ${(unknown as { _type?: string })._type ?? "brak"}. Zatrzymuję build.`,
    );
  }

  closeList();
  return { html: html.join("\n"), toc };
}

export function markArticleIntro(html: string): string {
  return html.replace(/^<p>/, '<p class="article-intro">');
}

export function articleBodyToMarkdown(blocks: unknown): string {
  const parsed = parsePortableBlocks(blocks);
  const lines: string[] = [];
  let listType: string | null = null;
  let listIndex = 0;

  const closeList = () => {
    if (listType) {
      lines.push("");
      listType = null;
      listIndex = 0;
    }
  };

  for (const block of parsed) {
    if (block._type === "block") {
      if (block.listItem) {
        if (listType !== block.listItem) {
          closeList();
          listType = block.listItem;
        }
        listIndex += 1;
        const marker = block.listItem === "number" ? `${listIndex}.` : "-";
        lines.push(
          `${marker} ${markdownInline(block.children, block.markDefs)}`,
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

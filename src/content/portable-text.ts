export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
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

interface PortableBlock {
  _type?: string;
  _key?: string;
  style?: string;
  listItem?: string;
  children?: PortableSpan[];
  markDefs?: PortableMark[];
  alt?: string | null;
  caption?: string | null;
  src?: string | null;
  title?: string | null;
  body?: string | null;
  lead?: string | null;
  action?: { href?: string | null; label?: string | null } | null;
  headers?: (string | null)[] | null;
  rows?: { cells?: (string | null)[] | null }[] | null;
}

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

export function articleBodyToHtml(blocks: PortableBlock[] | null | undefined): {
  html: string;
  toc: TocEntry[];
} {
  if (!blocks?.length) {
    throw new Error("Artykuł nie ma treści. Zatrzymuję build.");
  }

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

  for (const block of blocks) {
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
      if (block.style === "h2" || block.style === "h3") {
        const level = block.style === "h2" ? 2 : 3;
        const plain = (block.children ?? [])
          .map((span) => span.text ?? "")
          .join("");
        let id = slugify(plain) || "section";
        let suffix = 1;
        while (usedIds.has(id)) {
          suffix += 1;
          id = `${slugify(plain)}-${suffix}`;
        }
        usedIds.add(id);
        toc.push({ id, text: plain, level });
        html.push(`<h${level} id="${id}">${text}</h${level}>`);
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
          block.title ? `<p class="muted">${escapeHtml(block.title)}</p>` : ""
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
            .map((cell) => `<td>${escapeHtml(cell ?? "")}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      html.push(
        `<div class="table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(
          block.caption ?? "Tabela",
        )}"><table><caption>${escapeHtml(
          block.caption ?? "",
        )}</caption><thead><tr>${headerRow}</tr></thead><tbody>${body}</tbody></table></div>`,
      );
      continue;
    }

    throw new Error(
      `Nieznany blok artykułu: ${block._type ?? "brak"}. Zatrzymuję build.`,
    );
  }

  closeList();
  return { html: html.join("\n"), toc };
}

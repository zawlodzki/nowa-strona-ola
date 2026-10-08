import {
  articleBodyToMarkdown,
  type PortableBlock,
} from "@/content/portable-text";
import type { Article3aView } from "@/content/map-article";

function heading(level: 1 | 2, value: string) {
  return `${"#".repeat(level)} ${value.replaceAll("\n", " ").trim()}`;
}

export function serializeArticle(view: Article3aView): string {
  const parts = [
    heading(1, view.title),
    "",
    view.lead,
    "",
    articleBodyToMarkdown(view.body as PortableBlock[]),
  ];
  if (view.sources.length) {
    parts.push("", heading(2, view.sourcesLabel));
    for (const source of view.sources) {
      parts.push(`- [${source.title}](${source.href})`);
    }
  }
  if (view.faq) {
    parts.push("", heading(2, view.faq.title), "", view.faq.lead);
    for (const item of view.faq.items) {
      parts.push("", `### ${item.question}`, "", item.answer);
    }
  }
  if (view.ebooks) {
    parts.push("", heading(2, view.ebooks.title), "", view.ebooks.lead, "");
    for (const ebook of view.ebooks.items) {
      parts.push(`- [${ebook.title}](${ebook.href})`);
    }
  }
  return `${parts.join("\n").trim()}\n`;
}

import {
  articleBodyToMarkdown,
  type PortableBlock,
} from "@/content/portable-text";
import type { LegalPageView } from "@/content/map-legal";

export function serializeLegalPage(view: LegalPageView): string {
  const parts = [
    `# ${view.title.replaceAll("\n", " ").trim()}`,
    "",
    view.versionLine,
    "",
    articleBodyToMarkdown(view.body as PortableBlock[]),
  ];
  return `${parts.join("\n").trim()}\n`;
}

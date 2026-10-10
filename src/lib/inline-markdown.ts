function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const inlineToken = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;

/** Form labels, notices and intro lines: `[text](/path/)` links and `**bold**`, everything else escaped. */
export function inlineMarkdownHtml(source: string): string {
  const parts: string[] = [];
  let cursor = 0;
  for (const match of source.matchAll(inlineToken)) {
    const index = match.index ?? 0;
    parts.push(escapeHtml(source.slice(cursor, index)));
    const [whole, text = "", href = "", bold] = match;
    if (bold !== undefined) {
      parts.push(`<strong>${escapeHtml(bold)}</strong>`);
    } else if (/^(\/|https:\/\/|mailto:)/.test(href)) {
      parts.push(`<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`);
    } else {
      parts.push(escapeHtml(whole));
    }
    cursor = index + whole.length;
  }
  parts.push(escapeHtml(source.slice(cursor)));
  return parts.join("");
}

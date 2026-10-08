function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const markdownLink = /\[([^\]]+)\]\(([^)]+)\)/g;

export function checkboxLabelHtml(label: string): string {
  const parts: string[] = [];
  let cursor = 0;
  for (const match of label.matchAll(markdownLink)) {
    const index = match.index ?? 0;
    parts.push(escapeHtml(label.slice(cursor, index)));
    const href = match[2] ?? "";
    if (href.startsWith("/") || href.startsWith("https://")) {
      parts.push(
        `<a href="${escapeHtml(href)}">${escapeHtml(match[1] ?? "")}</a>`,
      );
    } else {
      parts.push(escapeHtml(match[0]));
    }
    cursor = index + match[0].length;
  }
  parts.push(escapeHtml(label.slice(cursor)));
  return parts.join("");
}

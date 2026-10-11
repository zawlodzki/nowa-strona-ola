import { absoluteUrl } from "@/lib/seo/site";

/**
 * Decision D1 (11.10.2026): search and AI answers yes, model training no.
 * Training-only crawlers are disallowed; Google-Extended also covers Gemini
 * app grounding, while Search, AI Overviews and AI Mode use Googlebot.
 */
export const trainingCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Meta-ExternalAgent",
] as const;

export function buildRobotsTxt({ indexing }: { indexing: boolean }): string {
  if (!indexing) {
    return "# Staging/preview build: not for indexing.\nUser-agent: *\nDisallow: /\n";
  }
  return [
    "# Search and AI answers allowed; use for model training is not.",
    "User-agent: *",
    "Content-Signal: search=yes, ai-input=yes, ai-train=no",
    "Allow: /",
    "",
    ...trainingCrawlers.map((agent) => `User-agent: ${agent}`),
    "Disallow: /",
    "",
    `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
}

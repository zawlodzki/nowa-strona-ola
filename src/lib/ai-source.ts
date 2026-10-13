const aiSourceByHostname = {
  "chatgpt.com": "chatgpt",
  "chat.openai.com": "chatgpt",
  "perplexity.ai": "perplexity",
  "www.perplexity.ai": "perplexity",
  "claude.ai": "claude",
  "gemini.google.com": "gemini",
  "copilot.microsoft.com": "copilot",
} as const;

export type AiSource =
  (typeof aiSourceByHostname)[keyof typeof aiSourceByHostname] | null;

export function recognizeAiSource(referrer: string): AiSource {
  try {
    const url = new URL(referrer);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return null;
    return (
      Object.entries(aiSourceByHostname).find(
        ([hostname]) => hostname === url.hostname,
      )?.[1] ?? null
    );
  } catch {
    return null;
  }
}

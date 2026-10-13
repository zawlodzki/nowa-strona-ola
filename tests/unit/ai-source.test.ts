import { describe, expect, it } from "vitest";
import { recognizeAiSource } from "../../src/lib/ai-source";

describe("closed AI source recognition", () => {
  it.each([
    ["chatgpt.com", "chatgpt"],
    ["chat.openai.com", "chatgpt"],
    ["perplexity.ai", "perplexity"],
    ["www.perplexity.ai", "perplexity"],
    ["claude.ai", "claude"],
    ["gemini.google.com", "gemini"],
    ["copilot.microsoft.com", "copilot"],
  ])("reduces %s to %s without private path or query", (host, code) => {
    expect(
      recognizeAiSource(
        `https://${host}/private/email@example.com?utm_source=secret#private`,
      ),
    ).toBe(code);
  });
  it.each([
    "",
    "/chatgpt.com",
    "not a URL",
    "http://chatgpt.com/",
    "ftp://chatgpt.com/",
    "https://user@chatgpt.com/",
    "https://user:password@chatgpt.com/",
    "https://chatgpt.com:444/",
    "https://chatgpt.com.evil.example/",
    "https://evil.example/?utm_source=chatgpt",
    "https://www.chatgpt.com/",
    "https://chatgpt.com./",
    "https://chаtgpt.com/",
    "https://toString/",
  ])("rejects unapproved input %s", (input) => {
    expect(recognizeAiSource(input)).toBeNull();
  });
  it("accepts the standard HTTPS port and hostname case", () => {
    expect(recognizeAiSource("https://CHATGPT.COM:443/private")).toBe(
      "chatgpt",
    );
  });
});

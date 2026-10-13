import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";

const read = (file: string) =>
  JSON.parse(
    readFileSync(new URL(`../../ops/gtm/${file}`, import.meta.url), "utf8"),
  ).containerVersion;
const release = read("releases/2026-10-13-v4.json");

for (const file of ["ola-container.json", "ai-source-container.json"]) {
  describe(file, () => {
    const container = read(file);
    const script = (name: string) =>
      container.variable.find((v: { name: string }) => v.name === name)
        .parameter[0].value;
    const source = (input: unknown) =>
      runInNewContext(
        `(${script("AO AI source").replace("{{AO AI source input}}", "input")})()`,
        { input },
      );
    const medium = (input: unknown) =>
      runInNewContext(
        `(${script("AO AI medium").replace("{{AO AI source}}", "source")})()`,
        { source: source(input) },
      );
    it.each(["chatgpt", "perplexity", "claude", "gemini", "copilot"])(
      "configures only the approved campaign %s",
      (code) => {
        expect(source(code)).toBe(code);
        expect(medium(code)).toBe("referral");
      },
    );
    it.each([
      undefined,
      null,
      "",
      "unknown",
      "https://chatgpt.com/private?email=secret",
      "chatgpt\n",
      "CHATGPT",
      { code: "chatgpt" },
    ])("rejects raw or arbitrary data layer input %s", (input) => {
      expect(source(input)).toBeUndefined();
      expect(medium(input)).toBeUndefined();
    });
    it("adds campaign settings only to config and preserves the existing page-view setup and Meta", () => {
      const config = container.tag.find(
        (t: { tagId: string }) => t.tagId === "51",
      );
      const settings = config.parameter.find(
        (p: { key: string }) => p.key === "configSettingsTable",
      ).list;
      expect(settings.slice(-2)).toEqual([
        {
          type: "MAP",
          map: [
            { type: "TEMPLATE", key: "parameter", value: "campaign_source" },
            {
              type: "TEMPLATE",
              key: "parameterValue",
              value: "{{AO AI source}}",
            },
          ],
        },
        {
          type: "MAP",
          map: [
            { type: "TEMPLATE", key: "parameter", value: "campaign_medium" },
            {
              type: "TEMPLATE",
              key: "parameterValue",
              value: "{{AO AI medium}}",
            },
          ],
        },
      ]);
      expect(settings.slice(0, -2)).toEqual(
        release.tag
          .find((t: { tagId: string }) => t.tagId === "51")
          .parameter.find(
            (p: { key: string }) => p.key === "configSettingsTable",
          ).list,
      );
      for (const id of ["53", "56"])
        expect(
          container.tag.find((t: { tagId: string }) => t.tagId === id),
        ).toEqual(release.tag.find((t: { tagId: string }) => t.tagId === id));
      expect(
        container.variable.find(
          (v: { name: string }) => v.name === "AO rollout approved",
        ).parameter,
      ).toEqual([
        {
          type: "TEMPLATE",
          key: "value",
          value: file === "ola-container.json" ? "false" : "true",
        },
      ]);
      expect(container.trigger).toEqual(release.trigger);
      expect(
        new Set(
          container.variable.map((v: { variableId: string }) => v.variableId),
        ).size,
      ).toBe(container.variable.length);
    });
  });
}

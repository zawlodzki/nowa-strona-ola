import { readFileSync } from "node:fs";
import { evaluate, parse } from "groq-js";
import { describe, expect, it } from "vitest";

const contract = JSON.parse(
  readFileSync("docs/sanity-publication-webhook.json", "utf8"),
) as { filter: string };

describe("publication webhook filter", () => {
  it("includes public article and dependency changes and excludes drafts, releases and internal documents", async () => {
    const dataset = [
      { _id: "new-article", _type: "article" },
      { _id: "settings-pl", _type: "siteSettings" },
      { _id: "author-pl", _type: "author" },
      { _id: "blog-pl", _type: "page" },
      { _id: "ebook-pl", _type: "ebook" },
      { _id: "drafts.new-article", _type: "article" },
      { _id: "versions.release.new-article", _type: "article" },
      { _id: "schema", _type: "system.schema" },
      { _id: "asset", _type: "sanity.imageAsset" },
    ];
    const result = await evaluate(parse(`*[${contract.filter}]._id`), {
      dataset,
    });
    expect(await result.get()).toEqual([
      "new-article",
      "settings-pl",
      "author-pl",
      "blog-pl",
      "ebook-pl",
    ]);
  });
});

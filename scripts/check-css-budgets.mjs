import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const templates = [
  {
    paths: ["odstapienie/index.html"],
    view: ".withdrawal3a",
    external: 8 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: ["kontakt/index.html", "en/contact/index.html"],
    view: ".contact3a",
    external: 8 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: ["index.html", "en/index.html"],
    view: ".home3a",
    external: 8 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: ["o-mnie/index.html", "en/about/index.html"],
    view: ".about3a",
    external: 8 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: ["konsultacje/index.html", "en/consultations/index.html"],
    view: ".consult3a",
    external: 9 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: ["ebooki/index.html", "en/ebooks/index.html"],
    view: ".ebooks3a",
    external: 8 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: [
      "ebooki/suplementy-w-pcos/index.html",
      "en/ebooks/supplements-in-pcos/index.html",
    ],
    view: ".ebook3a",
    external: 10 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: ["blog/index.html", "en/blog/index.html"],
    view: ".blog3a",
    external: 8 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: [
      "blog/przygotowanie-do-konsultacji-pcos/index.html",
      "en/blog/preparing-for-a-pcos-nutrition-consultation/index.html",
    ],
    view: ".article3a",
    external: 10 * 1024,
    inline: 4 * 1024,
  },
  {
    paths: ["polityka-prywatnosci/index.html", "en/privacy/index.html"],
    view: ".legal3a",
    external: 6 * 1024,
    inline: 6 * 1024,
  },
];

export async function checkCssBudgets(directory = "dist") {
  const report = {};
  for (const template of templates) {
    for (const path of template.paths) {
      const html = await readFile(`${directory}/${path}`, "utf8");
      const hrefs = new Set(
        [
          ...html.matchAll(
            /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
          ),
        ].map((match) => match[1]),
      );
      const sources = [];
      let externalGzipBytes = 0;
      for (const href of hrefs) {
        assert(
          href.startsWith("/_astro/") && !href.includes(".."),
          `${path}: unexpected stylesheet ${href}`,
        );
        const content = await readFile(`${directory}${href}`, "utf8");
        sources.push(content);
        externalGzipBytes += gzipSync(content).length;
      }
      const inline = [
        ...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g),
      ].map((match) => match[1]);
      const inlineBytes = inline.reduce(
        (sum, value) => sum + Buffer.byteLength(value),
        0,
      );
      const css = [...sources, ...inline].join("\n");
      assert(hrefs.size > 0, `${path}: CSS assets missing`);
      assert(
        externalGzipBytes <= template.external,
        `${path}: external CSS exceeds ${template.external} B gzip (${externalGzipBytes})`,
      );
      assert(
        inlineBytes <= template.inline,
        `${path}: inline CSS exceeds ${template.inline} B (${inlineBytes})`,
      );
      assert(
        !css.includes("--wf-"),
        `${path}: legacy CSS leaked into a 3a page`,
      );
      for (const other of templates) {
        if (other.view !== template.view)
          assert(
            !css.includes(other.view),
            `${path}: unrelated ${other.view} CSS leaked into this template`,
          );
      }
      report[path] = { externalGzipBytes, inlineBytes };
    }
  }
  return report;
}

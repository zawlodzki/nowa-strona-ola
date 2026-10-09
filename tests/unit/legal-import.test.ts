import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { articleBodyToHtml } from "../../src/content/portable-text";
import newsletterSource from "../../src/content/legal-bodies/regulamin-newslettera.json";
import termsSource from "../../src/content/legal-bodies/regulamin.json";

interface Block {
  _type: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: { text?: string; marks?: string[] }[];
}

const root = path.resolve(import.meta.dirname, "../..");
const termsHtml = readFileSync(
  path.join(root, "scripts/legal-sources/regulamin.html"),
  "utf8",
);

/** The verbatim <li>…<ol>…</ol></li> from the zawlodzki.pl source. */
function sourceItem(startsWith: string): string {
  const start = termsHtml.indexOf(`<li>${startsWith}`);
  expect(start).toBeGreaterThan(-1);
  const end = termsHtml.indexOf("</ol></li>", start) + "</ol></li>".length;
  return termsHtml.slice(start, end);
}

function convert(fragment: string): Block[] {
  const output = execFileSync(
    "python3",
    [path.join(root, "scripts/convert-legal-html.py"), "--fragment"],
    { input: `<ol>${fragment}</ol>`, encoding: "utf8" },
  );
  return JSON.parse(output) as Block[];
}

const text = (block: Block) =>
  (block.children ?? []).map((child) => child.text ?? "").join("");

describe("convert-legal-html nested lists", () => {
  it("§ 7: nested items are level-2 blocks, not glued into the parent", () => {
    const blocks = convert(sourceItem("Z chwilą dostarczenia Kursu"));
    expect(blocks.map((b) => [b.listItem, b.level])).toEqual([
      ["number", 1],
      ["number", 2],
      ["number", 2],
      ["number", 2],
    ]);
    expect(text(blocks[0]!)).toMatch(/na następujących polach eksploatacji:$/);
    expect(text(blocks[0]!)).not.toContain("wyświetlanie");
    expect(blocks.slice(1).map(text)).toEqual([
      "wyświetlanie i odtwarzanie Materiałów na Platformie w Okresie Dostępu,",
      "utrwalanie i zwielokrotnianie techniką cyfrową oraz wprowadzanie do pamięci komputera Materiałów oznaczonych jako przeznaczone do pobrania,",
      "w przypadku przedsiębiorców – udostępnienie Materiałów pobranych zgodnie z pkt 2 użytkownikowi Konta, o którym mowa w § 6 ust. 9.",
    ]);
  });

  it("forum: alpha list becomes a)–d) level-2 items, each text once", () => {
    const blocks = convert(sourceItem("Na Forum <strong>nie wolno"));
    expect(text(blocks[0]!)).toBe("Na Forum nie wolno publikować:");
    expect(blocks[0]!.children?.[1]).toMatchObject({
      text: "nie wolno publikować",
      marks: ["strong"],
    });
    const nested = blocks.slice(1);
    expect(nested.map((b) => [b.listItem, b.level])).toEqual(
      Array(4).fill(["bullet", 2]),
    );
    expect(nested.map((b) => text(b).slice(0, 3))).toEqual([
      "a) ",
      "b) ",
      "c) ",
      "d) ",
    ]);
    const all = blocks.map(text).join("\n");
    for (const item of nested) {
      const body = text(item).slice(3);
      expect(all.split(body).length - 1).toBe(1);
    }
  });
});

describe("generated legal bodies", () => {
  const bodies = [
    termsSource.body as Block[],
    newsletterSource.body as Block[],
  ];

  it("no parent list item repeats the text of its nested items", () => {
    let nestedSeen = 0;
    for (const body of bodies) {
      body.forEach((block, index) => {
        if (block.level !== 2) return;
        nestedSeen += 1;
        let parent = index - 1;
        while (parent >= 0 && body[parent]!.level === 2) parent -= 1;
        const own = text(block).replace(/^[a-z]\) /, "");
        expect(text(body[parent]!)).not.toContain(own);
      });
    }
    expect(nestedSeen).toBe(21);
  });

  it("renders nested lists inside the parent <li>", () => {
    const { html } = articleBodyToHtml(termsSource.body);
    expect(html).toContain("polach eksploatacji:\n<ol>\n<li>wyświetlanie");
    expect(html).not.toMatch(/<\/li>\n<(ol|ul)>/);
  });
});

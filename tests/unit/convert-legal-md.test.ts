import { describe, expect, it } from "vitest";

import {
  buildLegalDocument,
  convertLegalMarkdown,
  mapLegalHref,
} from "../../scripts/convert-legal-md.mjs";

const source = `<!--
Notatka wewnętrzna: ../rodo/rejestr.md
-->

# Regulamin

## sprzedaży e-booków

obowiązuje od {{DATA_WEJSCIA_W_ZYCIE}}

| Metryka dokumentu | |
|---|---|
| **Wersja** | 2.2 |
| **Data wejścia w życie** | 01.11.2026 |

## § 1. Postanowienia ogólne

1. Sprzedawcą jest **Wellbiz sp. z o.o.**, zob. [pouczenie](pouczenie-o-odstapieniu.md)
   i *formularz* (\\*).
2. Lista:
   1. pierwszy \`{{MAKS_POBRAŃ}}\`,
   2. drugi [rejestr](../rodo/rejestr.md).
3. Polityka: [tutaj](/polityka-prywatnosci).

| Cel | Link |
|---|---|
| **Kontakt** | [lista](lista-cookies-i-identyfikatorow.md) |

> **Adresat:** Wellbiz
> ul. Lipowa 3D
>
> Data: ……

## Historia wersji

| Wersja | Zmiana |
|---|---|
| 2.1 | notatka wewnętrzna |
`;

interface Block {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: { text: string; marks: string[] }[];
}

const blocks = (result: { body: unknown }) => result.body as Block[];

const text = (block: Block) =>
  (block.children ?? []).map((child) => child.text).join("");

describe("convert-legal-md", () => {
  it("maps document links to site routes and drops internal ones", () => {
    expect(mapLegalHref("regulamin.md")).toBe("/regulamin/");
    expect(mapLegalHref("pouczenie-o-odstapieniu.md")).toBe(
      "/regulamin/#pouczenie",
    );
    expect(mapLegalHref("formularz-odstapienia.md")).toBe(
      "/regulamin/#formularz-odstapienia",
    );
    expect(mapLegalHref("/odstapienie")).toBe("/odstapienie/");
    expect(mapLegalHref("/regulamin#zalaczniki")).toBe(
      "/regulamin/#zalaczniki",
    );
    expect(mapLegalHref("mailto:ola@aleksandraolesiewicz.com")).toBe(
      "mailto:ola@aleksandraolesiewicz.com",
    );
    expect(mapLegalHref("../compliance/memo.md")).toBeNull();
    expect(mapLegalHref("zgody-i-formularze.md")).toBeNull();
  });

  it("converts headings, metadata, lists, tables and quotes", () => {
    const result = convertLegalMarkdown(source);
    expect(result.title).toBe("Regulamin sprzedaży e-booków");
    expect(result.version).toBe("2.2");
    expect(result.effectiveFrom).toBe("2026-11-01");
    expect(result.droppedLinks).toEqual([
      { text: "rejestr", href: "../rodo/rejestr.md" },
    ]);
    expect(
      blocks(result).map((block) =>
        block._type === "articleTable"
          ? ["table"]
          : [
              block._key,
              block.style,
              block.listItem ?? null,
              block.level ?? null,
              text(block),
            ],
      ),
    ).toEqual([
      ["1-postanowienia-ogolne", "h2", null, null, "§ 1. Postanowienia ogólne"],
      [
        "b1",
        "normal",
        "number",
        1,
        "Sprzedawcą jest Wellbiz sp. z o.o., zob. pouczenie i formularz (*).",
      ],
      ["b2", "normal", "number", 1, "Lista:"],
      ["b3", "normal", "number", 2, "pierwszy {{MAKS_POBRAŃ}},"],
      ["b4", "normal", "number", 2, "drugi rejestr."],
      ["b5", "normal", "number", 1, "Polityka: tutaj."],
      ["table"],
      ["b7", "blockquote", null, null, "Adresat: Wellbiz ul. Lipowa 3D"],
      ["b8", "blockquote", null, null, "Data: ……"],
    ]);
    expect(result.body[1]).toEqual({
      _type: "block",
      _key: "b1",
      style: "normal",
      listItem: "number",
      level: 1,
      children: [
        { _type: "span", _key: "s0", text: "Sprzedawcą jest ", marks: [] },
        {
          _type: "span",
          _key: "s1",
          text: "Wellbiz sp. z o.o.",
          marks: ["strong"],
        },
        { _type: "span", _key: "s2", text: ", zob. ", marks: [] },
        { _type: "span", _key: "s3", text: "pouczenie", marks: ["l0"] },
        { _type: "span", _key: "s4", text: " i ", marks: [] },
        { _type: "span", _key: "s5", text: "formularz", marks: ["em"] },
        { _type: "span", _key: "s6", text: " (*).", marks: [] },
      ],
      markDefs: [{ _type: "link", _key: "l0", href: "/regulamin/#pouczenie" }],
    });
    expect(blocks(result)[3]?.children?.[1]).toMatchObject({
      text: "{{MAKS_POBRAŃ}}",
      marks: ["code"],
    });
    expect(result.body[6]).toEqual({
      _type: "articleTable",
      _key: "b6",
      headers: ["Cel", "Link"],
      rows: [
        {
          _key: "r0",
          cells: ["**Kontakt**", "[lista](/lista-cookies-i-identyfikatorow/)"],
        },
      ],
    });
  });

  it("leaves the effective date unset for a placeholder", () => {
    const result = convertLegalMarkdown(
      "# Polityka\n\n| Metryka dokumentu | |\n|---|---|\n| **Wersja** | 2.1 |\n| **Data wejścia w życie** | {{DATA_WEJSCIA_W_ZYCIE}} |\n\nTreść.\n",
    );
    expect(result.effectiveFrom).toBeNull();
    expect(blocks(result).map(text)).toEqual(["Treść."]);
  });

  it("appends appendices under fixed anchors with demoted headings", () => {
    const files: Record<string, string> = {
      "main.md":
        "# Regulamin\n\n| Metryka dokumentu | |\n|---|---|\n| **Wersja** | 2.2 |\n\n## Załączniki\n\n1. [Pouczenie](pouczenie-o-odstapieniu.md)\n",
      "appendix.md":
        "# Pouczenie o prawie odstąpienia od umowy\n\n| Metryka dokumentu | |\n|---|---|\n| **Wersja** | 2.0 |\n\n## Prawo odstąpienia\n\nTreść.\n",
    };
    const { fixture, report } = buildLegalDocument(
      {
        slug: "regulamin",
        source: "main.md",
        appendices: [{ source: "appendix.md", anchor: "pouczenie" }],
        seoDescription: "Opis",
      },
      (file: string) => files[file]!,
    );
    expect(fixture.version).toBe("2.2");
    expect(
      blocks(fixture).map((block) => [block._key, block.style, text(block)]),
    ).toEqual([
      ["zalaczniki", "h2", "Załączniki"],
      ["b1", "normal", "Pouczenie"],
      ["pouczenie", "h2", "Pouczenie o prawie odstąpienia od umowy"],
      ["pouczenie-b0", "h3", "Prawo odstąpienia"],
      ["pouczenie-b1", "normal", "Treść."],
    ]);
    expect(report.appendices).toEqual([
      { source: "appendix.md", version: "2.0", effectiveFrom: null },
    ]);
  });

  it("stops on Markdown it cannot represent", () => {
    expect(() =>
      convertLegalMarkdown(
        "# T\n\n| Metryka dokumentu | |\n|---|---|\n| **Wersja** | 1 |\n\n#### Za głęboko\n",
      ),
    ).toThrow("Nagłówek poziomu 4: Za głęboko");
  });
});

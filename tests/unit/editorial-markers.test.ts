import { describe, expect, it } from "vitest";

import {
  editorialMarkerMessage,
  scanEditorialMarkers,
} from "../../studio/schema-types/shared/editorial-markers";

describe("scanEditorialMarkers", () => {
  it("reads a canonical marker in a paragraph and a legacy marker in a table cell", () => {
    const body = [
      {
        _key: "p1",
        _type: "block",
        style: "h2",
        markDefs: [
          { _key: "l1", _type: "link", href: "https://example.com/pcos" },
        ],
        children: [
          {
            _type: "span",
            _key: "s1",
            text: "Dawka [[TODO: podać zakres z wytycznych]] na dobę.",
            marks: ["strong"],
          },
        ],
      },
      {
        _key: "t1",
        _type: "articleTable",
        caption: "Zwykły podpis",
        headers: ["Nazwa", "[PCOS]"],
        rows: [
          {
            _key: "r1",
            cells: ["[TWÓJ KONKRET: nazwa preparatu]", "bez znacznika"],
          },
        ],
      },
    ];

    expect(scanEditorialMarkers(body, ["body"])).toEqual([
      {
        kind: "canonical",
        label: "TODO",
        text: "podać zakres z wytycznych",
        path: ["body", { _key: "p1" }],
      },
      {
        kind: "legacy",
        label: "TWÓJ KONKRET",
        text: "nazwa preparatu",
        path: ["body", { _key: "t1" }],
      },
    ]);
  });

  it("reads markers in an image alt, a highlight, and a call to action", () => {
    const body = [
      {
        _key: "img",
        _type: "articleImage",
        alt: "[DO UZUPEŁNIENIA opis badania]",
        caption: "Podpis bez luki",
        image: { asset: { _ref: "image-1" } },
      },
      {
        _key: "box",
        _type: "articleHighlight",
        title: "Wyróżnienie",
        body: "Kontekst [[TODO: dopisać źródło]] i nic więcej.",
      },
      {
        _key: "cta",
        _type: "articleCta",
        title: "Zapisz się",
        lead: "[UWAGA: brak adresu formularza]",
        action: { label: "Wyślij", href: "/kontakt/" },
      },
    ];

    expect(scanEditorialMarkers(body, ["body"])).toEqual([
      {
        kind: "legacy",
        label: "DO UZUPEŁNIENIA",
        text: "opis badania",
        path: ["body", { _key: "img" }],
      },
      {
        kind: "canonical",
        label: "TODO",
        text: "dopisać źródło",
        path: ["body", { _key: "box" }],
      },
      {
        kind: "legacy",
        label: "UWAGA",
        text: "brak adresu formularza",
        path: ["body", { _key: "cta" }],
      },
    ]);
  });

  it("keeps two markers in one span in reading order and counts a canonical marker once", () => {
    const body = [
      {
        _key: "p",
        _type: "block",
        children: [
          {
            _type: "span",
            text: "[[TODO: pierwsza]] potem [DO UZUPEŁNIENIA: druga].",
          },
        ],
      },
    ];

    expect(scanEditorialMarkers(body, ["body"])).toEqual([
      {
        kind: "canonical",
        label: "TODO",
        text: "pierwsza",
        path: ["body", { _key: "p" }],
      },
      {
        kind: "legacy",
        label: "DO UZUPEŁNIENIA",
        text: "druga",
        path: ["body", { _key: "p" }],
      },
    ]);
  });

  it("ignores abbreviations, legal notes, markdown links, and an unclosed marker", () => {
    const body = [
      {
        _key: "p",
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text: "Skrót [PCOS] i [TSH]. Uwaga [do sprawdzenia: GA4]. Link [źródło](https://example.com). Placeholder {{DATA}}. Otwarte [[TODO: brak zamknięcia",
          },
        ],
      },
    ];

    expect(scanEditorialMarkers(body, ["body"])).toEqual([]);
  });

  it("reads a label with no note and a single-bracket TODO as legacy", () => {
    const body = [
      {
        _key: "a",
        _type: "block",
        children: [{ _type: "span", text: "[DO UZUPEŁNIENIA]" }],
      },
      {
        _key: "b",
        _type: "block",
        children: [{ _type: "span", text: "[TODO: stary zapis]" }],
      },
    ];

    expect(scanEditorialMarkers(body, ["body"])).toEqual([
      {
        kind: "legacy",
        label: "DO UZUPEŁNIENIA",
        text: "",
        path: ["body", { _key: "a" }],
      },
      {
        kind: "legacy",
        label: "TODO",
        text: "stary zapis",
        path: ["body", { _key: "b" }],
      },
    ]);
  });

  it("returns no markers for an empty body and for a value that is not an array", () => {
    expect(scanEditorialMarkers(undefined, ["body"])).toEqual([]);
    expect(scanEditorialMarkers([], ["body"])).toEqual([]);
    expect(scanEditorialMarkers("[[TODO: poza treścią]]", ["body"])).toEqual(
      [],
    );
  });
});

describe("editorialMarkerMessage", () => {
  it("returns a publish warning that names the count and the first marker", () => {
    const body = [
      {
        _key: "p",
        _type: "block",
        children: [
          { _type: "span", text: "[[TODO: dawka]] i [UWAGA: jednostka]" },
        ],
      },
    ];

    expect(editorialMarkerMessage(body)).toBe(
      "Treść zawiera znaczniki do uzupełnienia (2), np. „TODO: dawka”.",
    );
  });

  it("returns true when the body has no marker", () => {
    expect(
      editorialMarkerMessage([
        {
          _key: "p",
          _type: "block",
          children: [{ _type: "span", text: "Zdanie bez luki." }],
        },
      ]),
    ).toBe(true);
  });

  it("shortens a long example in the warning", () => {
    const note = "a".repeat(90);
    const body = [
      {
        _key: "p",
        _type: "block",
        children: [{ _type: "span", text: `[[TODO: ${note}]]` }],
      },
    ];
    const message = editorialMarkerMessage(body);
    expect(message).toBe(
      `Treść zawiera znaczniki do uzupełnienia (1), np. „TODO: ${"a".repeat(73)}…”.`,
    );
  });
});

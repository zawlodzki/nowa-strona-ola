import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { siteSeoData } from "../../src/lib/seo/site-data";

import { mapLegalPage } from "../../src/content/map-legal";
import { serializeLegalPage } from "../../src/content/serialize-legal";
import { legalGraph } from "../../src/lib/seo/page-graphs";
import {
  articleBodyToHtml,
  articleBodyToMarkdown,
} from "../../src/content/portable-text";
import { unpublishableLegalText } from "../../studio/schema-types/shared/legal-publication";
import {
  getLegalPage,
  getLegalPagePaths,
  getSiteSettings,
} from "../../src/sanity/repository";

function fixtureDate(effectiveFrom: string) {
  const [year, month, day] = effectiveFrom.split("-");
  return `${day}.${month}.${year}`;
}

function fixtureVersionLine(
  version: string,
  effectiveFrom: string | null,
  language: "pl" | "en" = "pl",
) {
  const versionLabel = `${language === "pl" ? "Wersja" : "Version"} ${version}`;
  if (!effectiveFrom) {
    return `${versionLabel} · ${
      language === "pl"
        ? "data wejścia w życie do ustalenia"
        : "effective date to be confirmed"
    }`;
  }
  const date = fixtureDate(effectiveFrom);
  return language === "pl"
    ? `${versionLabel} · obowiązuje od ${date}`
    : `${versionLabel} · effective from ${date}`;
}

describe("legal page mapper", () => {
  it("maps the Polish privacy policy with its effective date", async () => {
    const [page, settings] = await Promise.all([
      getLegalPage("pl", "polityka-prywatnosci", { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    const view = mapLegalPage(page, settings);
    expect(view.href).toBe("/polityka-prywatnosci/");
    expect(view.title).toBe("Polityka prywatności aleksandraolesiewicz.com");
    expect(view.version).toBe(page.version);
    expect(view.versionLabel).toBe(`Wersja ${page.version}`);
    expect(page.effectiveFrom).toEqual(expect.any(String));
    const effectiveFrom = page.effectiveFrom ?? "";
    expect(view.effective).toEqual({
      datetime: effectiveFrom,
      label: fixtureDate(effectiveFrom),
    });
    expect(view.versionLine).toBe(
      fixtureVersionLine(page.version, page.effectiveFrom),
    );
    expect(view.toc[0]?.text).toBe("1. Kto jest administratorem Twoich danych");
    expect(view.html).toContain('href="/lista-cookies-i-identyfikatorow/"');
    expect(view.html).toContain("<table>");
    expect(view.html).not.toContain("Metryka dokumentu");
    expect(view.html).not.toContain("Historia wersji");
    expect(
      legalGraph(view)({
        lang: "pl",
        path: view.href,
        title: view.title,
        site: siteSeoData(null),
      })[0],
    ).toMatchObject({
      version: page.version,
      datePublished: page.effectiveFrom,
    });
    expect(serializeLegalPage(view)).toBe(
      readFileSync("src/content/examples/legal-privacy.md", "utf8"),
    );
  });

  it("shows a pending effective date when the date is missing", async () => {
    const [page, settings] = await Promise.all([
      getLegalPage("pl", "regulamin", { environment: {} }),
      getSiteSettings("pl", { environment: {} }),
    ]);
    const view = mapLegalPage({ ...page, effectiveFrom: null }, settings);
    expect(view.effective).toBeNull();
    expect(view.version).toBe(page.version);
    expect(view.versionLine).toBe(fixtureVersionLine(page.version, null));
    expect(serializeLegalPage(view).split("\n")[2]).toBe(
      fixtureVersionLine(page.version, null),
    );
    expect(
      legalGraph(view)({
        lang: "pl",
        path: view.href,
        title: view.title,
        site: siteSeoData(null),
      })[0],
    ).toMatchObject({ version: page.version });
    expect(
      legalGraph(view)({
        lang: "pl",
        path: view.href,
        title: view.title,
        site: siteSeoData(null),
      })[0],
    ).not.toHaveProperty("datePublished");
  });

  it("puts the withdrawal notice and form on the terms page under stable anchors", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const terms = mapLegalPage(
      await getLegalPage("pl", "regulamin", { environment: {} }),
      settings,
    );
    expect(terms.title).toBe(
      "Regulamin sprzedaży e-booków i świadczenia konsultacji dietetycznych online — aleksandraolesiewicz.com",
    );
    expect(terms.toc[0]).toEqual({
      id: "1-postanowienia-ogolne",
      text: "§ 1. Postanowienia ogólne",
    });
    expect(terms.toc.slice(-3)).toEqual([
      { id: "zalaczniki", text: "Załączniki" },
      { id: "pouczenie", text: "Pouczenie o prawie odstąpienia od umowy" },
      {
        id: "formularz-odstapienia",
        text: "Wzór formularza odstąpienia od umowy",
      },
    ]);
    expect(terms.html).toContain(
      '<a href="/regulamin/#pouczenie">Pouczenie o prawie odstąpienia od umowy</a>',
    );
    expect(terms.html).toContain(
      '<a href="/regulamin/#formularz-odstapienia">wzoru formularza</a>',
    );
    expect(terms.html).toContain("<h3>Skutki odstąpienia od umowy</h3>");
    expect(terms.html).toContain(
      "<p>Data zawarcia umowy: ………………………………</p>\n<p>Imię i nazwisko konsumenta(-ów): ………………………………</p>",
    );
    expect(serializeLegalPage(terms)).toBe(
      readFileSync("src/content/examples/legal-terms.md", "utf8"),
    );
  });

  it("maps cookies and newsletter terms with links between documents", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const cookiesPage = await getLegalPage(
      "pl",
      "lista-cookies-i-identyfikatorow",
      { environment: {} },
    );
    const cookies = mapLegalPage(cookiesPage, settings);
    expect(cookies.href).toBe("/lista-cookies-i-identyfikatorow/");
    expect(cookies.alternateHref).toBeNull();
    expect(cookies.html).toContain(
      '<a href="/polityka-prywatnosci/">Politykę prywatności</a>',
    );
    expect(cookies.toc[0]?.text).toBe("Aktualny stan narzędzi");
    expect(cookies.version).toBe(cookiesPage.version);
    expect(cookies.versionLabel).toBe(`Wersja ${cookiesPage.version}`);
    expect(cookies.html).toContain("ao-theme");
    expect(cookies.html).toContain("Clarity jest wyłączony");
    expect(serializeLegalPage(cookies)).toBe(
      readFileSync("src/content/examples/legal-cookies.md", "utf8"),
    );

    const newsletterPage = await getLegalPage("pl", "regulamin-newslettera", {
      environment: {},
    });
    const newsletter = mapLegalPage(newsletterPage, settings);
    expect(newsletter.toc[0]?.text).toBe("§ 1. Kto wysyła newsletter");
    expect(newsletter.version).toBe(newsletterPage.version);
    expect(newsletter.versionLabel).toBe(`Wersja ${newsletterPage.version}`);
    expect(serializeLegalPage(newsletter)).toBe(
      readFileSync("src/content/examples/legal-newsletter.md", "utf8"),
    );
  });

  it("keeps English pages as a Polish-binding notice", async () => {
    const [page, settings] = await Promise.all([
      getLegalPage("en", "privacy", { environment: {} }),
      getSiteSettings("en", { environment: {} }),
    ]);
    const view = mapLegalPage(page, settings);
    expect(view.href).toBe("/en/privacy/");
    expect(view.bindingHref).toBe("/polityka-prywatnosci/");
    expect(view.html).toContain("binding version is the Polish text");
    expect(view.html).toContain('href="/polityka-prywatnosci/"');
    expect(view.html).not.toContain("Administratorem danych osobowych");
    expect(view.version).toBe(page.version);
    expect(view.versionLine).toBe(
      fixtureVersionLine(page.version, page.effectiveFrom, "en"),
    );
    expect(serializeLegalPage(view)).toBe(
      readFileSync("src/content/examples/legal-privacy-en.md", "utf8"),
    );
  });

  it("lists fixture legal paths for the static build", async () => {
    const paths = await getLegalPagePaths({ environment: {} });
    expect(paths).toEqual(
      expect.arrayContaining([
        { language: "pl", slug: "polityka-prywatnosci" },
        { language: "pl", slug: "regulamin" },
        { language: "pl", slug: "lista-cookies-i-identyfikatorow" },
        { language: "pl", slug: "regulamin-newslettera" },
        { language: "en", slug: "privacy" },
        { language: "en", slug: "terms" },
      ]),
    );
  });

  it("fails when a legal-pages skill file copies a version sentence that is not the fixture", async () => {
    const settings = await getSiteSettings("pl", { environment: {} });
    const slugs = [
      "polityka-prywatnosci",
      "lista-cookies-i-identyfikatorow",
      "regulamin",
      "regulamin-newslettera",
    ];
    const views = await Promise.all(
      slugs.map(async (slug) =>
        mapLegalPage(
          await getLegalPage("pl", slug, { environment: {} }),
          settings,
        ),
      ),
    );
    const lines = new Set(views.map((view) => view.versionLine));
    const sentence = /Wersja \d+\.\d+ · obowiązuje od \d{2}\.\d{2}\.\d{4}/g;
    const proseDate = /(\d+\.\d+)\s+z\s+(\d{2}\.\d{2}\.\d{4})/g;
    for (const path of [
      ".cursor/skills/verify-ola/features/legal-pages.md",
      ".agents/skills/verify-ola/features/legal-pages.md",
    ]) {
      const text = readFileSync(path, "utf8");
      const sentences = [...text.matchAll(sentence)].map((match) => match[0]);
      expect(sentences.length, path).toBeGreaterThan(0);
      for (const found of sentences) {
        expect(lines.has(found), `${path}: ${found}`).toBe(true);
      }
      for (const line of lines) {
        expect(text, path).toContain(line);
      }
      for (const match of text.matchAll(proseDate)) {
        const version = match[1] ?? "";
        const date = match[2] ?? "";
        expect(
          views.some(
            (view) =>
              view.version === version && view.effective?.label === date,
          ),
          `${path}: ${match[0]}`,
        ).toBe(true);
      }
    }
  });
});

describe("legal portable text", () => {
  it("continues a numbered list after an interrupting table", () => {
    const { html } = articleBodyToHtml([
      {
        _type: "block",
        listItem: "number",
        level: 1,
        children: [{ _type: "span", text: "One", marks: [] }],
      },
      {
        _type: "articleTable",
        headers: ["A"],
        rows: [{ cells: ["`x`"] }],
      },
      {
        _type: "block",
        listItem: "number",
        level: 1,
        listStart: 2,
        children: [{ _type: "span", text: "Two", marks: [] }],
      },
    ]);
    expect(html).toContain("<ol>");
    expect(html).toContain('<ol start="2">');
    expect(html).toContain("<code>x</code>");
  });
});

describe("legal blockquotes", () => {
  it("joins consecutive quote paragraphs into one quotation", () => {
    const quote = (text: string) => ({
      _type: "block",
      style: "blockquote",
      children: [{ _type: "span", text, marks: [] }],
    });
    const blocks = [
      quote("Adresat: Wellbiz"),
      quote("(*) Niepotrzebne skreślić."),
      {
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: "Po", marks: [] }],
      },
    ];
    expect(articleBodyToHtml(blocks).html).toBe(
      "<blockquote>\n<p>Adresat: Wellbiz</p>\n<p>(*) Niepotrzebne skreślić.</p>\n</blockquote>\n<p>Po</p>",
    );
    expect(articleBodyToMarkdown(blocks)).toBe(
      "> Adresat: Wellbiz\n>\n> (\\*) Niepotrzebne skreślić.\n\nPo",
    );
  });
});

describe("legal publication guard", () => {
  it("lists placeholders and review notes anywhere in the body", () => {
    expect(
      unpublishableLegalText([
        {
          _type: "block",
          _key: "a",
          children: [
            { _type: "span", _key: "s", text: "Wchodzi w życie {{DATA}}." },
          ],
          markDefs: [{ _type: "link", _key: "l", href: "/{{x}}" }],
        },
        {
          _type: "articleTable",
          _key: "t",
          headers: ["Cel"],
          rows: [{ _key: "r", cells: ["okres [do sprawdzenia: GA4]"] }],
        },
      ]),
    ).toEqual(["{{DATA}}.", "{{x}}", "[do sprawdzenia: GA4]"]);
  });

  it("accepts a body without placeholders", () => {
    expect(
      unpublishableLegalText([
        {
          _type: "block",
          _key: "a",
          children: [{ _type: "span", _key: "s", text: "Gotowy tekst." }],
        },
      ]),
    ).toEqual([]);
  });
});

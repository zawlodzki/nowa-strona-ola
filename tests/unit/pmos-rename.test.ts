import { describe, expect, it } from "vitest";

import type { SanityDocument } from "../../src/sanity/content-lake-plan";
import {
  planPmosRename,
  rewriteCopy,
  type PmosMutation,
} from "../../src/sanity/pmos-rename";

const STORY = [
  "Znam PMOS (PCOS) także z własnego doświadczenia. Jak wiele dietetyczek, zaczęłam od szukania rozwiązań dla własnych problemów hormonalnych.",
  "Najpierw uczyłam się sama i to w odżywianiu znalazłam wiele odpowiedzi, których szukałam. Tę wiedzę uporządkowałam i poszerzyłam na studiach dietetycznych na Śląskim Uniwersytecie Medycznym. Dziś pracuję z kobietami, które mierzą się z podobnymi trudnościami jak ja.",
  "Dlatego tak ważne jest dla mnie, żebyś mogła spokojnie opowiedzieć o swojej sytuacji i zadać pytania, z którymi przychodzisz.",
  "Jeśli gubisz się w sprzecznych poradach o diecie, badaniach i suplementach, możemy zacząć od ich uporządkowania. Przyjrzeć się temu, co już robisz, i ustalić, czemu warto poświęcić uwagę w pierwszej kolejności.",
  "Zależy mi, żebyś po rozmowie rozumiała kolejne kroki i wiedziała, jak odnieść je do swoich posiłków, pracy i codziennych obowiązków.",
];

const CAPTION =
  "Z pracą dyplomową przed Wydziałem Zdrowia Publicznego w Bytomiu, Śląski Uniwersytet Medyczny";
const ALT =
  "Aleksandra Olesiewicz z pracą dyplomową przed budynkiem Wydziału Zdrowia Publicznego w Bytomiu";

function page(body: string[], caption: string): SanityDocument {
  return {
    _id: "page-about-pl",
    _type: "page",
    _rev: "rev-page",
    sections: [
      {
        _key: "about-story",
        _type: "textSection",
        body,
      },
      {
        _key: "about-credentials",
        _type: "credentialsSection",
        diplomaCaption: caption,
      },
    ],
  };
}

function author(alt: string, label: string): SanityDocument {
  return {
    _id: "author-ola-pl",
    _type: "author",
    _rev: "rev-author",
    diplomaScan: { alt, label, src: "diploma" },
  };
}

function quiet(): SanityDocument[] {
  return [page(STORY, CAPTION), author(ALT, ALT)];
}

describe("rewriteCopy", () => {
  it("wraps the first PCOS in a sentence and shortens the next one", () => {
    expect(rewriteCopy("PCOS i PCOS.")).toBe("PMOS (PCOS) i PMOS.");
    expect(rewriteCopy("PMOS (PCOS) i PCOS.")).toBe("PMOS (PCOS) i PMOS.");
    expect(rewriteCopy("PCOS. PCOS.")).toBe("PMOS (PCOS). PMOS (PCOS).");
  });

  it("renames every faculty inflection and leaves a URL alone", () => {
    expect(
      rewriteCopy(
        "Wydział Nauk o Zdrowiu, Wydziałem Nauk o Zdrowiu, Wydziału Nauk o Zdrowiu, Wydziale Nauk o Zdrowiu",
      ),
    ).toBe(
      "Wydział Zdrowia Publicznego, Wydziałem Zdrowia Publicznego, Wydziału Zdrowia Publicznego, Wydziale Zdrowia Publicznego",
    );
    expect(rewriteCopy("Faculty of Health Sciences in Bytom")).toBe(
      "Faculty of Public Health in Bytom",
    );
    expect(rewriteCopy("Czytaj https://example.com/PCOS i PCOS.")).toBe(
      "Czytaj https://example.com/PCOS i PMOS (PCOS).",
    );
  });
});

describe("planPmosRename", () => {
  it("skips slugs, topic, and href, and guards the mutation with ifRevisionID", () => {
    const ebook: SanityDocument = {
      _id: "ebook-pcos",
      _type: "ebook",
      _rev: "rev-ebook",
      title: "Suplementy w PCOS.",
      topic: "pcos",
      slug: { _type: "slug", current: "suplementy-w-pcos" },
      href: "/ebooki/suplementy-w-pcos/",
    };
    const plan = planPmosRename([...quiet(), ebook]);
    expect(plan.problems).toEqual([]);
    expect(plan.changes).toEqual([
      {
        id: "ebook-pcos",
        path: "title",
        before: "Suplementy w PCOS.",
        after: "Suplementy w PMOS (PCOS).",
      },
    ]);
    expect(plan.mutations).toEqual([
      {
        patch: {
          id: "ebook-pcos",
          ifRevisionID: "rev-ebook",
          set: { title: "Suplementy w PMOS (PCOS)." },
        },
      },
    ]);
    expect(ebook.title).toBe("Suplementy w PCOS.");
  });

  it("replaces the about story and diploma fields, and drops the walker path under that body", () => {
    const oldBody = [
      "Znam PCOS także z własnego doświadczenia.",
      "Dlatego tak ważne jest dla mnie, żebyś mogła spokojnie opowiedzieć o swojej sytuacji i zadać pytania, z którymi przychodzisz.",
      "Jeśli gubisz się w sprzecznych poradach o diecie, badaniach i suplementach, możemy zacząć od ich uporządkowania. Przyjrzeć się temu, co już robisz, i ustalić, czemu warto poświęcić uwagę w pierwszej kolejności.",
      "Zależy mi, żebyś po rozmowie rozumiała kolejne kroki i wiedziała, jak odnieść je do swoich posiłków, pracy i codziennych obowiązków.",
    ];
    const docs = [
      page(
        oldBody,
        "Ze skanem dyplomu przed Wydziałem Nauk o Zdrowiu w Bytomiu",
      ),
      author("Stary alt dyplomu", "Stary alt dyplomu"),
    ];
    const plan = planPmosRename(docs);
    expect(plan.problems).toEqual([]);
    expect(plan.notes).toEqual([
      "brak page-about-en; pomijam",
      "brak author-ola-en; pomijam",
    ]);
    expect(
      plan.changes.filter((change) => change.path.includes("body")),
    ).toEqual([
      {
        id: "page-about-pl",
        path: 'sections[_key=="about-story"].body',
        before: oldBody,
        after: STORY,
      },
    ]);
    expect(
      plan.changes.find((change) => change.path.endsWith("diplomaCaption")),
    ).toEqual({
      id: "page-about-pl",
      path: 'sections[_key=="about-credentials"].diplomaCaption',
      before: "Ze skanem dyplomu przed Wydziałem Nauk o Zdrowiu w Bytomiu",
      after: CAPTION,
    });
    expect(
      plan.changes.find((change) => change.path === "diplomaScan.alt"),
    ).toMatchObject({ before: "Stary alt dyplomu", after: ALT });
    expect(
      plan.changes.find((change) => change.path === "diplomaScan.label"),
    ).toMatchObject({ before: "Stary alt dyplomu", after: ALT });
    expect(
      plan.mutations.map((mutation) => mutation.patch.ifRevisionID),
    ).toEqual(["rev-author", "rev-page"]);
  });

  it("patches an existing draft, reports an unchanged twin, and does not create a draft", () => {
    const published = page(
      ["Znam PCOS także z własnego doświadczenia."],
      CAPTION,
    );
    const draft: SanityDocument = {
      ...page(STORY, CAPTION),
      _id: "drafts.page-about-pl",
      _rev: "rev-draft",
    };
    const plan = planPmosRename([published, author(ALT, ALT), draft]);
    expect(plan.drafts).toEqual([
      { id: "drafts.page-about-pl", changed: false },
    ]);
    expect(plan.mutations.map((mutation) => mutation.patch.id)).toEqual([
      "page-about-pl",
    ]);
    expect(JSON.stringify(plan.mutations)).not.toContain('"create"');
  });

  it("refuses a missing Polish document and a change without _rev", () => {
    const plan = planPmosRename([
      {
        _id: "ebook-pcos",
        _type: "ebook",
        title: "PCOS.",
      },
    ]);
    expect(plan.problems).toEqual([
      "brak page-about-pl",
      "brak author-ola-pl",
      "ebook-pcos: brak _rev, pomijam mutację",
    ]);
    expect(plan.mutations).toEqual([]);
    expect(plan.changes).toEqual([
      {
        id: "ebook-pcos",
        path: "title",
        before: "PCOS.",
        after: "PMOS (PCOS).",
      },
    ]);
  });

  it("leaves system documents, client quotes, legal text, and citation titles untouched, and keeps SEO titles within 60 characters", () => {
    const quote = "Po latach walki z PCOS w końcu znalazłam kogoś.";
    const citation = "Wytyczne PCOS 2023, sekcja 4.7";
    const seeSource = "Zobacz źródło: wytyczne PCOS 2023, sekcja 4.7";
    const docs: SanityDocument[] = [
      ...quiet(),
      {
        _id: "_.schemas.default",
        _type: "system.schema",
        _rev: "rev-schema",
        schema: "PCOS i Wydział Nauk o Zdrowiu",
      },
      {
        _id: "drafts._.schemas.default",
        _type: "system.schema",
        _rev: "rev-schema-draft",
        schema: "PCOS",
      },
      {
        _id: "image-pcos",
        _type: "sanity.imageAsset",
        _rev: "rev-image",
        originalFilename: "PCOS.png",
        title: "Wydział Nauk o Zdrowiu",
      },
      {
        _id: "translation.metadata.pl",
        _type: "translation.metadata",
        _rev: "rev-meta",
        title: "PCOS",
      },
      {
        _id: "testimonial-pl-4",
        _type: "testimonial",
        _rev: "rev-quote",
        quote,
      },
      {
        _id: "legal-newsletter-pl",
        _type: "legalPage",
        _rev: "rev-legal",
        version: "2.1",
        body: "w szczególności przy PCOS, insulinooporności",
      },
      {
        _id: "ebook-szczupla-a-jednak-pcos-pl",
        _type: "ebook",
        _rev: "rev-szczupla",
        title: "Szczupła, a jednak PCOS",
        seo: {
          title: "Szczupła, a jednak PCOS | E-book Aleksandry Olesiewicz",
        },
        sources: [
          {
            _key: "source-pcos-2023",
            title: seeSource,
            scope: citation,
            href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/",
          },
        ],
      },
      {
        _id: "article-blog-01-pl",
        _type: "article",
        _rev: "rev-01",
        title: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
        seo: {
          title: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
        },
      },
      {
        _id: "drafts.article-blog-01-pl",
        _type: "article",
        _rev: "rev-01-draft",
        title: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
        seo: {
          title: "Jak przygotować się do konsultacji dietetycznej przy PCOS?",
        },
      },
      {
        _id: "article-blog-11-en",
        _type: "article",
        _rev: "rev-11",
        title:
          "Conflicting advice on PCOS: write down what you want to clarify",
        seo: {
          title:
            "Conflicting advice on PCOS: write down what you want to clarify",
        },
      },
    ];
    const plan = planPmosRename(docs);
    expect(plan.problems).toEqual([]);
    const ids = new Set(plan.changes.map((change) => change.id));
    expect(ids.has("_.schemas.default")).toBe(false);
    expect(ids.has("drafts._.schemas.default")).toBe(false);
    expect(ids.has("image-pcos")).toBe(false);
    expect(ids.has("translation.metadata.pl")).toBe(false);
    expect(ids.has("testimonial-pl-4")).toBe(false);
    expect(ids.has("legal-newsletter-pl")).toBe(false);
    expect(plan.changes.some((change) => change.path.includes("sources"))).toBe(
      false,
    );
    const szczupla = plan.changes.filter(
      (change) => change.id === "ebook-szczupla-a-jednak-pcos-pl",
    );
    expect(szczupla).toEqual([
      {
        id: "ebook-szczupla-a-jednak-pcos-pl",
        path: "seo.title",
        before: "Szczupła, a jednak PCOS | E-book Aleksandry Olesiewicz",
        after: "Szczupła, a jednak PMOS | E-book Aleksandry Olesiewicz",
      },
      {
        id: "ebook-szczupla-a-jednak-pcos-pl",
        path: "title",
        before: "Szczupła, a jednak PCOS",
        after: "Szczupła, a jednak PMOS (PCOS)",
      },
    ]);
    expect(
      plan.changes.find(
        (change) =>
          change.id === "article-blog-01-pl" && change.path === "seo.title",
      )?.after,
    ).toBe("Jak przygotować się do konsultacji dietetycznej przy PMOS?");
    expect(
      plan.changes.find(
        (change) =>
          change.id === "drafts.article-blog-01-pl" &&
          change.path === "seo.title",
      )?.after,
    ).toBe("Jak przygotować się do konsultacji dietetycznej przy PMOS?");
    const english = plan.changes.find(
      (change) =>
        change.id === "article-blog-11-en" && change.path === "seo.title",
    );
    expect(english?.after).toBe(
      "Conflicting advice on PMOS: write down what to clarify",
    );
    expect(
      plan.changes
        .filter((change) => change.path === "seo.title")
        .every(
          (change) =>
            typeof change.after === "string" && change.after.length <= 60,
        ),
    ).toBe(true);
    const ebook = docs.find(
      (doc) => doc._id === "ebook-szczupla-a-jednak-pcos-pl",
    );
    const sources = ebook?.sources as { title: string; scope: string }[];
    expect(sources[0]?.title).toBe(seeSource);
    expect(sources[0]?.scope).toBe(citation);
    expect(docs.find((doc) => doc._id === "testimonial-pl-4")?.quote).toBe(
      quote,
    );
    expect(planPmosRename(applyPlan(docs, plan.mutations)).changes).toEqual([]);
  });

  it("is empty on the second plan, and a stale revision does not apply", () => {
    const docs = [
      page(
        ["Znam PCOS także z własnego doświadczenia."],
        "Ze skanem dyplomu przed Wydziałem Nauk o Zdrowiu w Bytomiu",
      ),
      author("Stary alt", "Stary alt"),
      {
        _id: "page-about-en",
        _type: "page",
        _rev: "rev-en-page",
        sections: [
          {
            _key: "about-story",
            _type: "textSection",
            body: ["Old EN story."],
          },
          {
            _key: "about-credentials",
            _type: "credentialsSection",
            diplomaCaption: "Old caption",
          },
        ],
      },
      {
        _id: "author-ola-en",
        _type: "author",
        _rev: "rev-en-author",
        diplomaScan: { alt: "Old alt", label: "Old alt", src: "diploma" },
      },
    ];
    const plan = planPmosRename(docs);
    expect(plan.notes).toEqual([]);
    expect(plan.problems).toEqual([]);
    const enBody = plan.changes.find(
      (change) => change.id === "page-about-en" && change.path.includes("body"),
    );
    expect(
      plan.changes.find(
        (change) =>
          change.id === "page-about-en" &&
          change.path.endsWith("diplomaCaption"),
      )?.after,
    ).toBe(
      "With her thesis outside the Faculty of Public Health in Bytom, Medical University of Silesia",
    );
    expect(
      plan.changes.find(
        (change) =>
          change.id === "author-ola-en" && change.path === "diplomaScan.alt",
      )?.after,
    ).toBe(
      "Aleksandra Olesiewicz with her thesis outside the Faculty of Public Health building in Bytom",
    );
    expect(enBody?.after).toEqual([
      "I also know PMOS (PCOS) from my own experience. Like many dietitians, I started by looking for answers to my own hormonal problems.",
      "I studied on my own first, and it was in nutrition that I found many of the answers I was looking for. I organised that knowledge and broadened it while studying dietetics at the Medical University of Silesia. Today I work with women who face difficulties similar to mine.",
      "That is why it matters to me that you can talk through your situation and ask the questions you arrived with.",
      "If conflicting advice about diet, tests and supplements leaves you lost, we can start by putting it in order. Look at what you already do, and decide what deserves attention first.",
      "I want you to leave the conversation knowing the next steps and how they fit your meals, work and daily duties.",
    ]);
    const applied = applyPlan(docs, plan.mutations);
    expect(planPmosRename(applied)).toMatchObject({
      changes: [],
      mutations: [],
      problems: [],
    });
    const stale = structuredClone(docs);
    stale[0]!._rev = "ktoś-edytował";
    expect(() => applyPlan(stale, plan.mutations)).toThrow(
      /zmienił się \(rewizja\)/,
    );
  });
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type PathToken =
  | { kind: "prop"; name: string }
  | { kind: "key"; key: string }
  | { kind: "index"; index: number };

function tokenize(path: string): PathToken[] {
  const tokens: PathToken[] = [];
  let index = 0;
  while (index < path.length) {
    if (path[index] === ".") {
      index += 1;
      continue;
    }
    if (path.startsWith('[_key=="', index)) {
      const end = path.indexOf('"]', index);
      if (end === -1) throw new Error(`zła ścieżka ${path}`);
      tokens.push({
        kind: "key",
        key: path.slice(index + '[_key=="'.length, end),
      });
      index = end + 2;
      continue;
    }
    if (path[index] === "[") {
      const end = path.indexOf("]", index);
      const raw = path.slice(index + 1, end);
      if (!/^\d+$/.test(raw)) throw new Error(`zła ścieżka ${path}`);
      tokens.push({ kind: "index", index: Number(raw) });
      index = end + 1;
      continue;
    }
    const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(path.slice(index));
    if (!match) throw new Error(`zła ścieżka ${path}`);
    tokens.push({ kind: "prop", name: match[0] });
    index += match[0].length;
  }
  if (!tokens.length) throw new Error(`zła ścieżka ${path}`);
  return tokens;
}

function step(current: unknown, token: PathToken, path: string): unknown {
  if (token.kind === "prop") {
    if (!isRecord(current) || !(token.name in current)) {
      throw new Error(`patch: brak ${path}`);
    }
    return current[token.name];
  }
  if (token.kind === "index") {
    if (!Array.isArray(current)) throw new Error(`patch: ${path}`);
    return current[token.index];
  }
  if (!Array.isArray(current)) throw new Error(`patch: ${path}`);
  const found = current.find(
    (item) => isRecord(item) && item._key === token.key,
  );
  if (!found) throw new Error(`patch: brak _key ${token.key} w ${path}`);
  return found;
}

function setPath(root: SanityDocument, path: string, value: unknown): void {
  const tokens = tokenize(path);
  let current: unknown = root;
  for (let index = 0; index < tokens.length - 1; index += 1) {
    current = step(current, tokens[index]!, path);
  }
  const last = tokens[tokens.length - 1]!;
  if (last.kind === "prop") {
    if (!isRecord(current)) throw new Error(`patch: ${path}`);
    current[last.name] = value;
    return;
  }
  if (last.kind === "index") {
    if (!Array.isArray(current)) throw new Error(`patch: ${path}`);
    current[last.index] = value;
    return;
  }
  throw new Error(`patch: ${path} kończy się kluczem`);
}

function applyPlan(
  documents: SanityDocument[],
  mutations: PmosMutation[],
): SanityDocument[] {
  const byId = new Map(documents.map((doc) => [doc._id, structuredClone(doc)]));
  for (const mutation of mutations) {
    const doc = byId.get(mutation.patch.id);
    if (!doc) throw new Error(`patch: brak dokumentu ${mutation.patch.id}.`);
    if (doc._rev !== mutation.patch.ifRevisionID) {
      throw new Error(`patch: ${mutation.patch.id} zmienił się (rewizja).`);
    }
    for (const [path, value] of Object.entries(mutation.patch.set)) {
      setPath(doc, path, structuredClone(value));
    }
  }
  return [...byId.values()];
}

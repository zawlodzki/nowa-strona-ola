import { describe, expect, it } from "vitest";

import type { SanityDocument } from "../../src/sanity/content-lake-plan";
import {
  PREVIOUS_COPY,
  applyMutations,
  buildMutations,
  getAtPath,
  planTrainingMetric,
} from "../../src/sanity/training-metric-import";

function metric(key: string, label: string) {
  return { _key: key, label, suffix: "+", value: 450 };
}

function lake(language: "pl" | "en"): SanityDocument[] {
  const old = PREVIOUS_COPY[language];
  return [
    {
      _id: `page-home-${language}`,
      _type: "page",
      _rev: `rev-home-${language}`,
      sections: [
        { _key: "home-hero", _type: "heroSection", title: "Hero" },
        {
          _key: "home-approach",
          _type: "metricsSection",
          lead: "Bez zmian",
          items: [metric("metric-450", old.label)],
        },
      ],
    },
    {
      _id: `page-about-${language}`,
      _type: "page",
      _rev: `rev-about-${language}`,
      sections: [
        {
          _key: "about-metric",
          _type: "metricsSection",
          title: old.aboutTitle,
          items: [metric("about-metric-450", old.label)],
        },
      ],
    },
    {
      _id: `page-consultation-${language}`,
      _type: "page",
      _rev: `rev-consultation-${language}`,
      sections: [
        {
          _key: "consultation-expert",
          _type: "expertSection",
          body: "Bez zmian",
          metric: { label: old.label, suffix: "+", value: 450 },
        },
      ],
    },
  ];
}

const dataset = [...lake("pl"), ...lake("en")];

describe("import:training-metric", () => {
  it("sets only the label and About title strings, guarded by revision", () => {
    const plan = planTrainingMetric(dataset);
    expect(plan.conflicts).toEqual([]);
    expect(plan.patches.map((patch) => patch.id)).toEqual([
      "page-home-pl",
      "page-about-pl",
      "page-consultation-pl",
      "page-home-en",
      "page-about-en",
      "page-consultation-en",
    ]);
    const mutations = buildMutations(plan.patches);
    expect(mutations[0]).toEqual({
      patch: {
        id: "page-home-pl",
        ifRevisionID: "rev-home-pl",
        set: {
          'sections[_key=="home-approach"].items[_key=="metric-450"].label':
            "godzin szkoleń",
        },
      },
    });
    const after = applyMutations(dataset, mutations);
    const about = after.find((doc) => doc._id === "page-about-en")!;
    expect(getAtPath(about, 'sections[_key=="about-metric"].title')).toBe(
      "Knowledge and training",
    );
    expect(
      getAtPath(
        after.find((doc) => doc._id === "page-consultation-en"),
        'sections[_key=="consultation-expert"].metric',
      ),
    ).toEqual({ label: "hours of training", suffix: "+", value: 450 });
    // Untouched fields stay identical.
    const strip = (docs: SanityDocument[]) =>
      JSON.stringify(docs).replaceAll(/"(label|title)":"[^"]*"/g, "");
    expect(strip(after)).toBe(strip(dataset));
    expect(planTrainingMetric(after).patches).toEqual([]);
  });

  it("stops on copy changed by an editor or a different number", () => {
    const edited = structuredClone(dataset);
    const home = edited[0]!.sections as {
      items?: { label: string; value: number }[];
    }[];
    home[1]!.items![0]!.label = "Inny opis";
    const consultation = edited[2]!.sections as { metric: { value: number } }[];
    consultation[0]!.metric.value = 500;
    const plan = planTrainingMetric(edited);
    expect(plan.conflicts).toHaveLength(2);
    expect(plan.conflicts.join(" ")).toContain("nieoczekiwana treść");
    expect(plan.conflicts.join(" ")).toContain("wartość inna niż 450");
  });

  it("patches drafts too and refuses a stale revision", () => {
    const withDraft = [
      ...dataset,
      {
        ...structuredClone(dataset[0]!),
        _id: "drafts.page-home-pl",
        _rev: "d1",
      },
    ];
    const plan = planTrainingMetric(withDraft);
    expect(plan.patches.map((patch) => patch.id)).toContain(
      "drafts.page-home-pl",
    );
    const mutations = buildMutations(plan.patches);
    const stale = withDraft.map((doc) =>
      doc._id === "page-about-pl" ? { ...doc, _rev: "newer" } : doc,
    );
    expect(() => applyMutations(stale, mutations)).toThrow(/rewizja/);
  });
});

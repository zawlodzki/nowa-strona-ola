import { describe, expect, it } from "vitest";

import { mapConsultation } from "../../src/content/map-consultation";
import {
  serializePage,
  serializeSection,
} from "../../src/content/serialize-sections";
import { getPage } from "../../src/sanity/repository";

describe("consultation 3a fixtures", () => {
  it("maps the Polish consultation page in the 3a section order", async () => {
    const page = await getPage("pl", "konsultacje", { environment: {} });
    expect(page.sections?.map((section) => section?._type)).toEqual([
      "heroSection",
      "listSection",
      "textImageSection",
      "cardsSection",
      "processSection",
      "cardsSection",
      "expertSection",
      "serviceOfferSection",
      "testimonialsSection",
      "faqSection",
    ]);
    const view = mapConsultation(page, "pl");
    expect(view.hero.title).toBe("Wiesz już dużo.\nUstal, co dalej.");
    expect(view.hero.primary.href).toBe("https://cal.com");
    expect(view.offer.action.href).toBe("https://cal.com");
    expect(view.offer.bookingStatus).toBe("placeholder");
    expect(view.offer.priceLabel).toBe("450 zł / 60 minut");
    expect(view.price).toEqual({
      name: "Konsultacja dietetyczna online",
      price: 450,
      currency: "PLN",
      durationMinutes: 60,
      currencyLabel: "zł",
      durationLabel: "60 minut",
    });
    expect(view.path.items).toEqual([
      "Twoja sytuacja",
      "Twoje priorytety",
      "Twój pierwszy krok",
    ]);
    expect(view.problem.prompts).toHaveLength(5);
    expect(view.problem.resolution.title).toBe("Co jest ważne teraz?");
    expect(view.audience.items).toHaveLength(4);
    expect(view.outcomes.items.map((item) => item.title)).toEqual([
      "Rozumiem",
      "Wybieram",
      "Zaczynam",
    ]);
    expect(view.expert.metric).toEqual({
      value: 450,
      suffix: "+",
      label: "kobiet rocznie, którym pomagają moje konsultacje",
    });
    expect(view.expert.education?.institution).toBe(
      "Śląski Uniwersytet Medyczny",
    );
    expect(view.testimonials.items).toHaveLength(2);
    expect(view.faq.items).toHaveLength(6);
  });

  it("does not use Polish copy under the English consultation page", async () => {
    const page = await getPage("en", "consultations", { environment: {} });
    const view = mapConsultation(page, "en");
    expect(view.hero.title).toBe(
      "You already know a lot.\nDecide what comes next.",
    );
    expect(view.hero.lead).not.toMatch(/Konsultacja|Przyjrzyjmy/);
    expect(view.offer.priceLabel).toBe("450 PLN / 60 min");
    expect(view.faq.items).toHaveLength(6);
  });

  it("rejects a hero booking link that drifts from the offer", async () => {
    const page = structuredClone(
      await getPage("pl", "konsultacje", { environment: {} }),
    );
    const hero = page.sections[0] as { primary: { href: string } };
    hero.primary.href = "https://cal.com/inny-termin";
    expect(() => mapConsultation(page, "pl")).toThrow(
      "Hero konsultacji musi prowadzić do tego samego adresu rezerwacji co oferta.",
    );
  });

  it("rejects a problem section without the question map", async () => {
    const page = structuredClone(
      await getPage("pl", "konsultacje", { environment: {} }),
    );
    const hero = page.sections[0] as { media: unknown };
    Object.assign(page.sections[2], {
      variant: "photo",
      media: hero.media,
      mediaPosition: "end",
    });
    expect(() => mapConsultation(page, "pl")).toThrow(
      "Konsultacje 3a wymagają mapy pytań w sekcji problemu.",
    );
  });
});

describe("consultation serializers", () => {
  it("serializes price, question map and FAQ from the same data", async () => {
    const page = await getPage("pl", "konsultacje", { environment: {} });
    const markdown = serializePage(page, "pl");
    expect(markdown).toContain("450 zł / 60 minut");
    expect(markdown).toContain("- Co jeść przy PCOS?");
    expect(markdown).toContain("Co jest ważne teraz?");
    expect(markdown).toContain("Czy to jest pojedyncze spotkanie?");
    expect(markdown).toContain("https://cal.com");
  });

  it("fails on an unknown section type", () => {
    expect(() =>
      serializeSection({ _key: "x", _type: "pricingTable" } as never, "pl"),
    ).toThrow("Nieznany typ sekcji");
  });
});

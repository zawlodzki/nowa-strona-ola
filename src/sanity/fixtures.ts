import type { PageContent } from "./repository";

export const demonstrationPages = {
  pl: {
    id: "demo-home-pl",
    language: "pl",
    slug: "home",
    title: "Dobry pomysł. Przemyślana realizacja.",
    eyebrow: "Strategia · technologia · ludzie",
    lead: "Spójne doświadczenie zaczyna się od detali. Sprawdź przykładowy formularz i poznaj sposób naszej pracy.",
    seo: {
      title: "Próba komponentów — Wonderful",
      description: null,
    },
  },
  en: {
    id: "demo-home-en",
    language: "en",
    slug: "home",
    title: "A clear idea. Thoughtful execution.",
    eyebrow: "Strategy · technology · people",
    lead: "A consistent experience starts with the details. Explore the example form and discover how we work.",
    seo: {
      title: "Component trial — Wonderful",
      description: null,
    },
  },
} satisfies Record<"pl" | "en", PageContent>;

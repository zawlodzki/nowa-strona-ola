import type { Locale } from "@ola/shared";

export const blogIndexLead = {
  pl: "Wpisy demonstracyjne. Każdy język ma osobne dokumenty.",
  en: "Demonstration posts. Each language has its own documents.",
} as const satisfies Record<Locale, string>;

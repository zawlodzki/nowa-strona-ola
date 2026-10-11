import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";

import { SeoPreviewInput } from "../../components/SeoPreviewInput";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  components: { input: SeoPreviewInput },
  fields: [
    defineField({
      name: "title",
      title: "Tytuł SEO",
      description:
        "Tytuł w wynikach wyszukiwania i przy udostępnianiu. Puste pole: tytuł dokumentu.",
      type: "string",
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: "description",
      title: "Opis SEO",
      description:
        "Jedno–dwa zdania o tym, co jest na stronie. Puste pole: lead lub opis dokumentu.",
      type: "text",
      rows: 3,
      validation: (rule) => [
        rule.max(160),
        rule
          .min(70)
          .warning("Opis krótszy niż 70 znaków zwykle słabo opisuje stronę."),
      ],
    }),
    defineField({
      name: "ogImage",
      title: "Obraz udostępniania",
      description:
        "Obraz 1200×630 przy udostępnianiu (Facebook, LinkedIn, komunikatory). Puste pole: obraz strony albo domyślny z Ustawień.",
      type: "mediaObject",
    }),
    defineField({
      name: "noindex",
      title: "Ukryj przed wyszukiwarkami",
      description:
        "Strona zostaje dostępna pod adresem, ale dostaje noindex i znika z mapy strony, wersji Markdown, llms.txt i RSS. Używaj tylko dla stron bez wartości w wynikach wyszukiwania.",
      type: "boolean",
      initialValue: false,
    }),
  ],
});

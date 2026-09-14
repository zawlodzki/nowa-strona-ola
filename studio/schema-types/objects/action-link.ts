import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";

export const actionLinkType = defineType({
  name: "actionLink",
  title: "Odnośnik",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Etykieta",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "href",
      title: "Adres",
      description: "Ścieżka wewnętrzna (/kontakt/) albo pełny adres https://.",
      type: "string",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return "Podaj adres.";
          if (
            value.startsWith("/") ||
            value.startsWith("#") ||
            value.startsWith("https://") ||
            value.startsWith("http://")
          ) {
            return true;
          }
          return "Użyj ścieżki zaczynającej się od / albo adresu http(s).";
        }),
    }),
    defineField({
      name: "emphasis",
      title: "Wariant",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Wypełniony", value: "default" },
          { title: "Kontur", value: "outline" },
        ],
      },
      initialValue: "default",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});

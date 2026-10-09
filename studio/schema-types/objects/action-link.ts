import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";

export function isValidActionHref(value: string): boolean {
  return (
    value.startsWith("/") ||
    value.startsWith("#") ||
    value.startsWith("https://") ||
    value.startsWith("http://") ||
    /^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(value)
  );
}

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
      description:
        "Ścieżka wewnętrzna (/kontakt/), adres https:// albo mailto:adres@domena.pl.",
      type: "string",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return "Podaj adres.";
          if (isValidActionHref(value)) return true;
          return "Użyj ścieżki /, adresu http(s) albo mailto z poprawnym adresem e-mail.";
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

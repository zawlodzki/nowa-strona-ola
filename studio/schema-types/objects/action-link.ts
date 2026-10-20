import { LinkIcon } from "@sanity/icons/Link";
import { isSafeHref } from "@ola/shared";
import { defineField, defineType } from "sanity";

export const isValidActionHref = isSafeHref;

/** Studio rule for every CMS link; the site renderer enforces the same check. */
export function validateHref(value: string | undefined): true | string {
  if (!value || isValidActionHref(value)) return true;
  return "Użyj ścieżki /, kotwicy #, adresu http(s) albo mailto z poprawnym adresem e-mail.";
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
          return validateHref(value);
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

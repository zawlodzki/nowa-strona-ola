import { UndoIcon } from "@sanity/icons/Undo";
import { defineField, defineType } from "sanity";

export const redirectType = defineType({
  name: "redirect",
  title: "Przekierowanie",
  type: "document",
  icon: UndoIcon,
  fields: [
    defineField({
      name: "from",
      title: "Z adresu",
      description: "Ścieżka źródłowa, na przykład /stara-strona/.",
      type: "string",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value?.startsWith("/")) return "Ścieżka musi zaczynać się od /.";
          return true;
        }),
    }),
    defineField({
      name: "to",
      title: "Na adres",
      type: "string",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (
            !value ||
            !(
              value.startsWith("/") ||
              value.startsWith("https://") ||
              value.startsWith("http://")
            )
          ) {
            return "Użyj ścieżki / albo adresu http(s).";
          }
          return true;
        }),
    }),
    defineField({
      name: "status",
      title: "Kod",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "301 — trwałe", value: "301" },
          { title: "302 — tymczasowe", value: "302" },
        ],
      },
      initialValue: "301",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "from", subtitle: "to", status: "status" },
    prepare: ({ title, subtitle, status }) => ({
      title,
      subtitle: `${status ?? "301"} → ${subtitle ?? ""}`,
    }),
  },
});

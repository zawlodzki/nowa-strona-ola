import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { ImageIcon } from "@sanity/icons/Image";
import { LinkIcon } from "@sanity/icons/Link";
import { WarningOutlineIcon } from "@sanity/icons/WarningOutline";
import { defineArrayMember, defineField, defineType } from "sanity";

const portableTextBlock = defineArrayMember({
  type: "block",
  styles: [
    { title: "Normalny", value: "normal" },
    { title: "Nagłówek 2", value: "h2" },
    { title: "Nagłówek 3", value: "h3" },
    { title: "Cytat", value: "blockquote" },
  ],
  lists: [
    { title: "Lista", value: "bullet" },
    { title: "Lista numerowana", value: "number" },
  ],
  marks: {
    decorators: [
      { title: "Pogrubienie", value: "strong" },
      { title: "Kursywa", value: "em" },
    ],
    annotations: [
      {
        name: "link",
        type: "object",
        title: "Odnośnik",
        icon: LinkIcon,
        fields: [
          defineField({
            name: "href",
            title: "Adres",
            type: "string",
            validation: (rule) => rule.required(),
          }),
        ],
      },
    ],
  },
});

export const articleImageType = defineType({
  name: "articleImage",
  title: "Obraz",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "image",
      title: "Plik",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Tekst alternatywny",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "caption",
      title: "Podpis",
      type: "string",
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: {
    select: { title: "alt", media: "image" },
  },
});

export const articleHighlightType = defineType({
  name: "articleHighlight",
  title: "Wyróżnienie",
  type: "object",
  icon: WarningOutlineIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "body",
      title: "Treść",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "body" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Wyróżnienie",
      subtitle,
    }),
  },
});

export const articleCtaType = defineType({
  name: "articleCta",
  title: "Wezwanie",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tytuł",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "lead",
      title: "Lead",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "action",
      title: "Akcja",
      type: "actionLink",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { select: { title: "title" } },
});

export const articleTableType = defineType({
  name: "articleTable",
  title: "Tabela",
  type: "object",
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: "caption",
      title: "Podpis",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "headers",
      title: "Nagłówki kolumn",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.required().min(2).max(6),
    }),
    defineField({
      name: "rows",
      title: "Wiersze",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "cells",
              title: "Komórki",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              validation: (rule) => rule.required().min(2).max(6),
            }),
          ],
          preview: {
            select: { cells: "cells" },
            prepare: ({ cells }) => ({
              title: Array.isArray(cells) ? cells.join(" · ") : "Wiersz",
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((rows, context) => {
            const parent = context.parent as { headers?: string[] } | undefined;
            const headers = parent?.headers ?? [];
            if (!Array.isArray(rows) || headers.length === 0) return true;
            const mismatch = rows.some(
              (row) =>
                row &&
                typeof row === "object" &&
                "cells" in row &&
                Array.isArray(row.cells) &&
                row.cells.length !== headers.length,
            );
            return mismatch
              ? "Każdy wiersz musi mieć tyle komórek, ile jest nagłówków."
              : true;
          }),
    }),
  ],
  preview: { select: { title: "caption" } },
});

export const articleBodyType = defineType({
  name: "articleBody",
  title: "Treść artykułu",
  type: "array",
  of: [
    portableTextBlock,
    defineArrayMember({ type: "articleImage" }),
    defineArrayMember({ type: "articleHighlight" }),
    defineArrayMember({ type: "articleCta" }),
    defineArrayMember({ type: "articleTable" }),
  ],
});

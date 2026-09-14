import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

export const mediaObjectType = defineType({
  name: "mediaObject",
  title: "Medium",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "alt",
      title: "Tekst alternatywny",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "tone",
      title: "Rodzaj kadru",
      type: "string",
      options: {
        layout: "radio",
        list: [
          { title: "Zdjęcie", value: "photo" },
          { title: "Schemat", value: "diagram" },
          { title: "Portret", value: "portrait" },
        ],
      },
      initialValue: "photo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Podpis",
      type: "string",
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "image",
      title: "Obraz",
      description: "Bez pliku renderer zostawia kadr zastępczy z tekstem alt.",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "alt", media: "image", subtitle: "tone" },
  },
});

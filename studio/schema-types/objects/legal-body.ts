import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";

const legalPortableTextBlock = defineArrayMember({
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
      { title: "Kod", value: "code" },
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

export const legalBodyType = defineType({
  name: "legalBody",
  title: "Treść dokumentu prawnego",
  type: "array",
  of: [legalPortableTextBlock, defineArrayMember({ type: "articleTable" })],
});

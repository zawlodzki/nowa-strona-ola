import { defineConfig, type Template } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";

import { previewOrigin, sanityEnvironment } from "./sanity.env";
import { presentationResolve } from "./presentation";
import { schemaTypes } from "./schema-types";
import { SINGLETON_TYPES, structure } from "./structure";

const localizedTypes = [
  "siteSettings",
  "ebook",
  "legalPage",
  "page",
  "article",
  "author",
  "category",
  "service",
  "testimonial",
  "form",
] as const;

const languageTemplates: Template[] = localizedTypes.flatMap((schemaType) => [
  {
    id: `${schemaType}-pl`,
    title: `${schemaType} (PL)`,
    schemaType,
    value: { language: "pl" },
  },
  {
    id: `${schemaType}-en`,
    title: `${schemaType} (EN)`,
    schemaType,
    value: { language: "en" },
  },
]);

export default defineConfig({
  name: "default",
  title: "Ola — treści",
  ...sanityEnvironment,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        initial: previewOrigin,
        previewMode: { enable: "/api/draft-mode/enable" },
      },
      resolve: presentationResolve,
    }),
    visionTool(),
  ],
  document: {
    newDocumentOptions: (previous) =>
      previous.filter(
        (option) =>
          !SINGLETON_TYPES.some(
            (type) =>
              option.templateId === type ||
              option.templateId.startsWith(`${type}-`),
          ),
      ),
    actions: (previous, { schemaType }) =>
      SINGLETON_TYPES.includes(schemaType)
        ? previous.filter(
            ({ action }) => action !== "delete" && action !== "duplicate",
          )
        : previous,
  },
  schema: {
    types: schemaTypes,
    templates: (previous) => [
      ...previous.filter(
        (template) =>
          !localizedTypes.includes(
            template.schemaType as (typeof localizedTypes)[number],
          ),
      ),
      ...languageTemplates,
    ],
  },
});

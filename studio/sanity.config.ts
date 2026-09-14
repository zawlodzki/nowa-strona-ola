import { defineConfig, type Template } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";

import { previewOrigin, sanityEnvironment } from "./sanity.env";
import { presentationResolve } from "./presentation";
import { schemaTypes } from "./schema-types";
import { structure } from "./structure";

const localizedTypes = [
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

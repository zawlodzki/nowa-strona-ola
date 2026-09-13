import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";

import { previewOrigin, sanityEnvironment } from "./sanity.env";
import { schemaTypes } from "./schema-types";

export default defineConfig({
  name: "default",
  title: "Ola — treści",
  ...sanityEnvironment,
  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        initial: previewOrigin,
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});

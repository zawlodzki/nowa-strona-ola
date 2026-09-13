import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { sanityEnvironment } from "./sanity.env";
import { schemaTypes } from "./schema-types";

export default defineConfig({
  name: "default",
  title: "Ola — treści",
  ...sanityEnvironment,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});

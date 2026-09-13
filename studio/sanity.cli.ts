import { defineCliConfig } from "sanity/cli";

import { sanityEnvironment } from "./sanity.env";

export default defineCliConfig({
  api: sanityEnvironment,
  typegen: {
    enabled: true,
    path: ["../src/**/*.{ts,astro}", "./schema-types/**/*.ts"],
    schema: "schema.json",
    generates: "../src/sanity.types.ts",
    overloadClientMethods: true,
  },
});

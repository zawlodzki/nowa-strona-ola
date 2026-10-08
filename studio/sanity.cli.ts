import { defineCliConfig } from "sanity/cli";

import { sanityEnvironment } from "./sanity.env";

export default defineCliConfig({
  api: sanityEnvironment,
  deployment: {
    appId: "eotkhlsk0a6m8yibs02m17y8",
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    path: [
      "../src/**/*.{ts,astro}",
      "../preview/src/**/*.{ts,astro}",
      "./schema-types/**/*.ts",
    ],
    schema: "schema.json",
    generates: "../src/sanity.types.ts",
    overloadClientMethods: true,
  },
});

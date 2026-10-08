import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const mockClient = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "scripts/content-lake-mock-client.mjs",
);

export default defineConfig({
  output: "static",
  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@sanity/client": mockClient,
      },
    },
  },
});

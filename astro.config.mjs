import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  // Must equal SITE_ORIGIN in src/lib/seo/site.ts (unit test).
  site: "https://aleksandraolesiewicz.com",
  trailingSlash: "always",
  build: { format: "directory" },
  output: "static",
  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  vite: { plugins: [tailwindcss()] },
});

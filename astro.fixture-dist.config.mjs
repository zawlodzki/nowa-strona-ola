import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://aleksandraolesiewicz.com",
  trailingSlash: "always",
  build: { format: "directory" },
  output: "static",
  outDir: ".cache/dist-fixture",
  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  vite: { plugins: [tailwindcss()] },
});

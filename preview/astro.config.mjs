import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  adapter: cloudflare({ imageService: "compile" }),
  output: "server",
  session: false,
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
    },
  },
});

import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  adapter: cloudflare({ imageService: "compile" }),
  output: "server",
  integrations: [
    {
      name: "sanity-preview-visual-editing",
      hooks: {
        "astro:config:setup": ({ injectScript }) => {
          injectScript(
            "page",
            `import ${JSON.stringify(fileURLToPath(new URL("./src/visual-editing.ts", import.meta.url)))};`,
          );
        },
      },
    },
  ],
  image: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  session: false,
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
    },
  },
});

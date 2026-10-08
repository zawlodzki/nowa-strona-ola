import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
export default [
  {
    ignores: [
      "**/dist/**",
      "**/.cache/**",
      "**/.astro/**",
      "**/.sanity/**",
      "**/.wrangler/**",
      "node_modules/**",
      "archive/wonderful-design-system/**",
      ".agents/**",
      ".claude/**",
      ".cursor/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "**/worker-configuration.d.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        URL: "readonly",
      },
    },
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  { rules: { "@typescript-eslint/no-explicit-any": "error" } },
];

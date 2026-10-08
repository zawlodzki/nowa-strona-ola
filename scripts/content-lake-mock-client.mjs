import { readFileSync } from "node:fs";

import { evaluate, parse } from "groq-js";

const parsed = new Map();
let cachedPath = "";
let dataset = [];

function documents() {
  const file = process.env.CONTENT_LAKE_NDJSON;
  if (!file) {
    throw new Error("CONTENT_LAKE_NDJSON nie jest ustawione.");
  }
  if (file === cachedPath) return dataset;
  cachedPath = file;
  dataset = readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  return dataset;
}

export function createClient() {
  return {
    async fetch(query, params = {}) {
      const text = String(query);
      let tree = parsed.get(text);
      if (!tree) {
        tree = parse(text);
        parsed.set(text, tree);
      }
      const value = await evaluate(tree, {
        dataset: documents(),
        params,
      });
      return value.get();
    },
  };
}

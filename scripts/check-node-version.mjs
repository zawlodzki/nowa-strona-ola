// Verify must run on the Node major from .node-version, the same as CI.
import { readFileSync } from "node:fs";

const expected = readFileSync(
  new URL("../.node-version", import.meta.url),
  "utf8",
).trim();
const actual = process.versions.node;

if (actual.split(".")[0] !== expected.split(".")[0]) {
  console.error(
    [
      `Zła wersja Node: ${actual}. Projekt wymaga Node ${expected} (.node-version, CI).`,
      "Wynik verify na innej wersji nie odpowiadałby CI. Przełącz Node, np.:",
      `  nvm install ${expected} && nvm use ${expected}`,
      `  export PATH="$(brew --prefix node@${expected})/bin:$PATH"`,
    ].join("\n"),
  );
  process.exit(1);
}

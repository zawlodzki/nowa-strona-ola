import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  indexNowConfiguration,
  parseIndexNowMode,
  runIndexNow,
} from "../src/lib/seo/indexnow";

try {
  const configuration = indexNowConfiguration(process.env);
  const mode = parseIndexNowMode(process.argv.slice(2));
  const previousFile =
    process.env.INDEXNOW_PREVIOUS_FILE ??
    path.join(tmpdir(), "ola-indexnow-previous.xml");
  const result = await runIndexNow({
    configuration,
    mode,
    io: {
      readArtifact: (file) => readFile(path.join("dist", file), "utf8"),
      readPrevious: async () => {
        try {
          return await readFile(previousFile, "utf8");
        } catch (error) {
          if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
          )
            return undefined;
          throw error;
        }
      },
      writePrevious: (xml) => writeFile(previousFile, xml, "utf8"),
      fetch,
    },
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  const message =
    error instanceof Error && error.message.startsWith("IndexNow:")
      ? error.message
      : "IndexNow: błąd odczytu lub połączenia, bez potwierdzenia zgłoszenia.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

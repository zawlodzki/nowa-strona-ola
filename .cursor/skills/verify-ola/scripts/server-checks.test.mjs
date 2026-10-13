import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import test from "node:test";
import { assertHomeIdentity, portFree, portOwnedBy } from "./server-checks.mjs";

test("detects occupied ports, their owner, and a foreign listener", async () => {
  const listener = createServer();
  await new Promise((resolve, reject) => {
    listener.once("error", reject);
    listener.listen(0, "127.0.0.1", resolve);
  });
  const port = listener.address().port;
  try {
    assert.equal(await portFree(port), false);
    assert.equal(portOwnedBy(port, process.pid), true);
    assert.equal(portOwnedBy(port, process.ppid), false);
  } finally {
    await new Promise((resolve) => listener.close(resolve));
  }
  assert.equal(await portFree(port), true);
  assert.equal(portOwnedBy(port, process.pid), false);
});

test(
  "checks a listener belonging to another running process",
  { timeout: 10000 },
  async () => {
    const child = spawn(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        'import { createServer } from "node:net"; const server = createServer(); server.listen(0, "127.0.0.1", () => console.log(server.address().port));',
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    const closed = new Promise((resolve) => child.once("close", resolve));
    try {
      const port = await new Promise((resolve, reject) => {
        child.once("error", reject);
        child.once("exit", (code) =>
          reject(new Error(`Listener exited with ${code}.`)),
        );
        child.stdout.once("data", (data) =>
          resolve(Number(String(data).trim())),
        );
      });
      assert.equal(await portFree(port), false);
      assert.equal(portOwnedBy(port, child.pid), true);
      assert.equal(portOwnedBy(port, process.pid), false);
    } finally {
      child.kill();
      await closed;
    }
  },
);

const homepage =
  '<html lang="pl"><head><title>Aleksandra Olesiewicz — dietetyczka kliniczna</title><link rel="canonical" href="https://aleksandraolesiewicz.pl/"></head><body>Homepage</body></html>';

test("matches the built homepage SEO identity without a fixed title", () => {
  assert.equal(
    assertHomeIdentity(homepage, homepage),
    "Aleksandra Olesiewicz — dietetyczka kliniczna",
  );
  const updated = homepage.replace(
    "dietetyczka kliniczna",
    "Aktualny tytuł CMS",
  );
  assert.equal(
    assertHomeIdentity(updated, updated),
    "Aleksandra Olesiewicz — Aktualny tytuł CMS",
  );
  assert.throws(() => assertHomeIdentity(updated, homepage), /differs/);
  assert.throws(
    () =>
      assertHomeIdentity(
        homepage.replace(
          "https://aleksandraolesiewicz.pl/",
          "https://example.com/",
        ),
        homepage,
      ),
    /differs/,
  );
  assert.throws(
    () =>
      assertHomeIdentity(
        "<head></head><body>" + homepage + "</body>",
        homepage,
      ),
    /missing/,
  );
});

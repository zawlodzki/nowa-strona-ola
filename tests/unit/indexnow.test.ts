import { describe, expect, it, vi } from "vitest";

import {
  indexNowConfiguration,
  indexNowUrls,
  INDEXNOW_ENDPOINT,
  parseIndexNowMode,
  runIndexNow,
  sitemapUrls,
  validateIndexNowArtifacts,
  type IndexNowIO,
} from "@/lib/seo/indexnow";
import { buildHeadersFile } from "@/lib/seo/edge-files";
import { buildRobotsTxt } from "@/lib/seo/robots";
import { SITE_ORIGIN } from "@/lib/seo/site";

const key = "test-Key-1234";
const enabled = () =>
  indexNowConfiguration({
    DEPLOYMENT_TARGET: "production",
    SITE_INDEXING: "production",
    INDEXNOW_KEY: key,
  });
const sitemap = (paths: string[]) =>
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${SITE_ORIGIN}${path}</loc></url>`).join("")}</urlset>`;
const robots = buildRobotsTxt({ indexing: true });

function fixture({
  current = ["/", "/new/"],
  previous = ["/", "/removed/"],
  status = 200,
}: {
  current?: string[];
  previous?: string[];
  status?: number;
} = {}) {
  const readArtifact = vi.fn(async (file: string) => {
    switch (file) {
      case "sitemap.xml":
        return sitemap(current);
      case "robots.txt":
        return robots;
      case "_headers":
        return "/*.md\n  X-Robots-Tag: noindex\n";
      case `${key}.txt`:
        return key;
      default:
        throw new Error("unexpected artifact");
    }
  });
  const request = vi.fn<typeof fetch>(async (input, init) => {
    const url = String(input);
    if (init?.method === "POST") return new Response(null, { status });
    if (url === `${SITE_ORIGIN}/${key}.txt`)
      return new Response(key, { headers: { "X-Robots-Tag": "noindex" } });
    if (url === `${SITE_ORIGIN}/robots.txt`) return new Response(robots);
    if (url === `${SITE_ORIGIN}/sitemap.xml`)
      return new Response(sitemap(current));
    throw new Error("unexpected request");
  });
  const io = {
    readArtifact,
    readPrevious: vi.fn(async (): Promise<string | undefined> =>
      sitemap(previous),
    ),
    writePrevious: vi.fn<IndexNowIO["writePrevious"]>(async () => {}),
    fetch: request,
  } satisfies IndexNowIO;
  return { io, request, readArtifact };
}

const run = (
  io: IndexNowIO,
  mode: "dry-run" | "send" | "capture-previous" = "send",
) => runIndexNow({ configuration: enabled(), mode, io });

describe("IndexNow configuration and CLI", () => {
  it.each([
    [{}, "non-production"],
    [
      {
        DEPLOYMENT_TARGET: "staging",
        SITE_INDEXING: "production",
        INDEXNOW_KEY: "bad",
      },
      "non-production",
    ],
    [
      {
        DEPLOYMENT_TARGET: "production",
        SITE_INDEXING: "noindex",
        INDEXNOW_KEY: "bad",
      },
      "noindex",
    ],
    [
      { DEPLOYMENT_TARGET: "production", SITE_INDEXING: "production" },
      "missing-key",
    ],
  ])(
    "skips disabled configuration without reading or requesting",
    async (env, reason) => {
      const { io } = fixture();
      for (const mode of ["dry-run", "capture-previous", "send"] satisfies (
        "dry-run" | "capture-previous" | "send"
      )[]) {
        expect(
          await runIndexNow({
            configuration: indexNowConfiguration(env),
            mode,
            io,
          }),
        ).toEqual({ kind: "skipped", reason, count: 0 });
      }
      expect(io.readArtifact).not.toHaveBeenCalled();
      expect(io.readPrevious).not.toHaveBeenCalled();
      expect(io.writePrevious).not.toHaveBeenCalled();
      expect(io.fetch).not.toHaveBeenCalled();
    },
  );
  it.each([
    "short",
    "a".repeat(129),
    "test_key123",
    "key/../123",
    "abcdefgh\n",
  ])("rejects invalid active key", (value) => {
    expect(() =>
      indexNowConfiguration({
        DEPLOYMENT_TARGET: "production",
        SITE_INDEXING: "production",
        INDEXNOW_KEY: value,
      }),
    ).toThrow("format klucza");
  });
  it.each(["a".repeat(8), "Z".repeat(128), "abcDEF12-34"])(
    "accepts protocol key boundaries",
    (value) => {
      expect(
        indexNowConfiguration({
          DEPLOYMENT_TARGET: "production",
          SITE_INDEXING: "production",
          INDEXNOW_KEY: value,
        }),
      ).toEqual({
        kind: "enabled",
        key: value,
        keyPath: `/${value}.txt`,
        keyLocation: `${SITE_ORIGIN}/${value}.txt`,
      });
    },
  );

  it("rejects a key that shadows the full content export", () => {
    expect(() =>
      indexNowConfiguration({
        DEPLOYMENT_TARGET: "production",
        SITE_INDEXING: "production",
        INDEXNOW_KEY: "llms-full",
      }),
    ).toThrow("koliduje");
  });
  it("requires explicit action and rejects extra flags", () => {
    expect(parseIndexNowMode([])).toBe("dry-run");
    expect(parseIndexNowMode(["--dry-run"])).toBe("dry-run");
    expect(parseIndexNowMode(["--send"])).toBe("send");
    expect(parseIndexNowMode(["--capture-previous"])).toBe("capture-previous");
    expect(() => parseIndexNowMode(["--force"])).toThrow("nieznana flaga");
    expect(() => parseIndexNowMode(["--send", "--dry-run"])).toThrow(
      "jednego trybu",
    );
  });
});

describe("IndexNow sitemap and artifact boundaries", () => {
  it("adds key headers only to an explicitly enabled indexable build", () => {
    expect(buildHeadersFile({ indexing: true, indexNow: enabled() })).toContain(
      `/${key}.txt\n  Content-Type: text/plain; charset=utf-8\n  X-Robots-Tag: noindex`,
    );
    expect(
      buildHeadersFile({ indexing: false, indexNow: enabled() }),
    ).not.toContain(`/${key}.txt`);
    expect(buildHeadersFile({ indexing: true })).not.toContain(`/${key}.txt`);
    expect(
      buildHeadersFile({
        indexing: true,
        indexNow: { kind: "disabled", reason: "missing-key" },
      }),
    ).not.toContain(`/${key}.txt`);
  });
  it("deduplicates URLs and retains removals", () => {
    expect(sitemapUrls(sitemap(["/b/", "/", "/b/"]))).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/b/`,
    ]);
    expect(
      indexNowUrls(
        [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/new/`],
        [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/removed/`],
      ),
    ).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/new/`,
      `${SITE_ORIGIN}/removed/`,
    ]);
  });
  it.each([
    "https://evil.example/",
    `${SITE_ORIGIN}.evil.example/`,
    "http://aleksandraolesiewicz.com/",
    `${SITE_ORIGIN}/#a`,
    `${SITE_ORIGIN}/?a=b`,
    "https://a:b@aleksandraolesiewicz.com/",
  ])("rejects noncanonical or foreign URL", (url) => {
    expect(() =>
      sitemapUrls(`<urlset><url><loc>${url}</loc></url></urlset>`),
    ).toThrow("kanoniczną domeną");
  });
  it.each([
    "not XML",
    "<sitemapindex></sitemapindex>",
    "<urlset><loc>missing-end</urlset>",
    `<urlset><url><loc>${SITE_ORIGIN}/</loc></urlset>`,
  ])("rejects invalid sitemap", (xml) => {
    expect(() => sitemapUrls(xml)).toThrow("IndexNow:");
  });
  it("rejects oversized union instead of truncating", () => {
    expect(() =>
      indexNowUrls(
        Array.from({ length: 10000 }, (_, index) => `${SITE_ORIGIN}/${index}/`),
        [`${SITE_ORIGIN}/removed/`],
      ),
    ).toThrow("limit 10000");
    expect(
      indexNowUrls(
        Array.from({ length: 10000 }, (_, index) => `${SITE_ORIGIN}/${index}/`),
        [],
      ).length,
    ).toBe(10000);
  });
  it("accepts search robots despite training restrictions and rejects global noindex", () => {
    expect(() =>
      validateIndexNowArtifacts({
        robots,
        headers: "/*.md\n  X-Robots-Tag: noindex\n",
        keyContent: key,
        key,
      }),
    ).not.toThrow();
    expect(() =>
      validateIndexNowArtifacts({
        robots,
        headers: "/*\n  X-Robots-Tag: noindex\n",
        keyContent: key,
        key,
      }),
    ).toThrow("globalny noindex");
    expect(() =>
      validateIndexNowArtifacts({
        robots: buildRobotsTxt({ indexing: false }),
        headers: "",
        keyContent: key,
        key,
      }),
    ).toThrow("robots.txt");
    expect(() =>
      validateIndexNowArtifacts({
        robots,
        headers: "",
        keyContent: "other",
        key,
      }),
    ).toThrow("plik klucza");
  });
});

describe("IndexNow pre-deploy capture", () => {
  it("reuses the original snapshot after deploy and retains removed URLs on retry", async () => {
    const { io } = fixture({ status: 500 });
    await expect(run(io)).rejects.toThrow("HTTP 500");
    io.fetch = fixture().request;
    expect(await run(io, "capture-previous")).toEqual({
      kind: "captured",
      count: 2,
    });
    expect(io.fetch).not.toHaveBeenCalled();
    expect(io.writePrevious).not.toHaveBeenCalled();
    expect(await run(io, "dry-run")).toEqual({
      kind: "dry-run",
      count: 3,
      current: 2,
      removed: 1,
    });
    expect(await run(io)).toEqual({ kind: "submitted", count: 3 });
    const submission = io.fetch.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(String(submission?.[1]?.body)).urlList).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/new/`,
      `${SITE_ORIGIN}/removed/`,
    ]);
  });
  it("rejects an invalid restored snapshot without replacing it", async () => {
    const { io } = fixture();
    io.readPrevious.mockResolvedValue("invalid XML");
    await expect(run(io, "capture-previous")).rejects.toThrow("urlset");
    expect(io.fetch).not.toHaveBeenCalled();
    expect(io.writePrevious).not.toHaveBeenCalled();
  });
  it("captures published sitemap before deployment", async () => {
    const { io } = fixture({ current: ["/old/"] });
    io.readPrevious.mockResolvedValue(undefined);
    expect(await run(io, "capture-previous")).toEqual({
      kind: "captured",
      count: 1,
    });
    expect(io.writePrevious).toHaveBeenCalledWith(sitemap(["/old/"]));
    expect(io.readArtifact).not.toHaveBeenCalled();
  });
  it("treats first deploy 404 as an empty sitemap", async () => {
    const { io } = fixture();
    io.readPrevious.mockResolvedValue(undefined);
    io.fetch = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 404 }),
    );
    expect(await run(io, "capture-previous")).toEqual({
      kind: "captured",
      count: 0,
    });
    const xml = io.writePrevious.mock.calls[0]?.[0];
    expect(typeof xml).toBe("string");
    if (typeof xml === "string") expect(sitemapUrls(xml)).toEqual([]);
  });
  it.each([403, 429, 500])("fails capture on HTTP %i", async (status) => {
    const { io } = fixture();
    io.readPrevious.mockResolvedValue(undefined);
    io.fetch = vi.fn<typeof fetch>(async () => new Response(null, { status }));
    await expect(run(io, "capture-previous")).rejects.toThrow(
      "poprzedniego sitemap",
    );
    expect(io.writePrevious).not.toHaveBeenCalled();
  });
});

describe("IndexNow dry-run and post-deploy submission", () => {
  it("dry-run reports counts only and makes no network requests", async () => {
    const { io } = fixture();
    const result = await run(io, "dry-run");
    expect(result).toEqual({
      kind: "dry-run",
      count: 3,
      current: 2,
      removed: 1,
    });
    expect(JSON.stringify(result)).not.toContain(key);
    expect(JSON.stringify(result)).not.toContain(SITE_ORIGIN);
    expect(io.fetch).not.toHaveBeenCalled();
  });
  it("allows dry-run without snapshot but send requires capture", async () => {
    const { io } = fixture();
    io.readPrevious.mockResolvedValue(undefined);
    expect(await run(io, "dry-run")).toEqual({
      kind: "dry-run",
      count: 2,
      current: 2,
      removed: 0,
    });
    await expect(run(io)).rejects.toThrow("brak migawki");
    expect(io.fetch).not.toHaveBeenCalled();
  });
  it.each([
    [200, "submitted"],
    [202, "key-validation-pending"],
  ])("reports HTTP %i accurately", async (status, kind) => {
    const { io, request } = fixture({ status });
    expect(await run(io)).toEqual({ kind, count: 3 });
    expect(request).toHaveBeenCalledTimes(4);
    const submission = request.mock.calls[3];
    expect(submission?.[0]).toBe(INDEXNOW_ENDPOINT);
    expect(submission?.[1]?.redirect).toBe("error");
    expect(submission?.[1]?.signal).toBeInstanceOf(AbortSignal);
    expect(submission?.[1]?.method).toBe("POST");
    expect(submission?.[1]?.body).toBe(
      JSON.stringify({
        host: "aleksandraolesiewicz.com",
        key,
        keyLocation: `${SITE_ORIGIN}/${key}.txt`,
        urlList: [
          `${SITE_ORIGIN}/`,
          `${SITE_ORIGIN}/new/`,
          `${SITE_ORIGIN}/removed/`,
        ],
      }),
    );
  });
  it.each([400, 403, 422, 429, 500])(
    "fails rejected HTTP %i",
    async (status) => {
      const { io } = fixture({ status });
      await expect(run(io)).rejects.toThrow(`HTTP ${status}`);
    },
  );
  it("skips empty snapshots with no POST", async () => {
    const { io } = fixture({ current: [], previous: [] });
    expect(await run(io)).toEqual({
      kind: "skipped",
      reason: "no-urls",
      count: 0,
    });
    expect(io.fetch).not.toHaveBeenCalled();
  });
  it.each([
    [`${SITE_ORIGIN}/${key}.txt`, "wrong-key", 200, {}],
    [`${SITE_ORIGIN}/${key}.txt`, key, 404, {}],
    [`${SITE_ORIGIN}/robots.txt`, buildRobotsTxt({ indexing: false }), 200, {}],
    [`${SITE_ORIGIN}/robots.txt`, robots, 200, { "X-Robots-Tag": "noindex" }],
    [`${SITE_ORIGIN}/sitemap.xml`, sitemap(["/stale/"]), 200, {}],
    [`${SITE_ORIGIN}/sitemap.xml`, sitemap(["/", "/new/"]), 503, {}],
  ])(
    "blocks POST when published resource disagrees",
    async (target, text, status, headers) => {
      const { io, request } = fixture();
      io.fetch = vi.fn<typeof fetch>(async (input, init) =>
        String(input) === target
          ? new Response(text, { status, headers })
          : request(input, init),
      );
      await expect(run(io)).rejects.toThrow("IndexNow:");
      expect(
        request.mock.calls.some(([, init]) => init?.method === "POST"),
      ).toBe(false);
    },
  );
  it("blocks redirects before POST", async () => {
    const { io } = fixture();
    io.fetch = vi.fn<typeof fetch>(async () => {
      const response = new Response(key);
      Object.defineProperty(response, "redirected", { value: true });
      return response;
    });
    await expect(run(io)).rejects.toThrow("przekierowanie");
    expect(io.fetch).toHaveBeenCalledTimes(1);
  });
  it("propagates network failure without submitting", async () => {
    const { io } = fixture();
    io.fetch = vi.fn<typeof fetch>(async () => {
      throw new Error("timeout");
    });
    await expect(run(io)).rejects.toThrow("timeout");
    expect(io.fetch).toHaveBeenCalledTimes(1);
  });
});

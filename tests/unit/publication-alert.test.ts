import { readFileSync } from "node:fs";
import { evaluate, parse } from "groq-js";
import { describe, expect, it, vi } from "vitest";

import {
  assertAlertEndpoint,
  buildFailureAlert,
  buildMonitorAlert,
  evaluatePublication,
  fetchProductionDeployments,
  firstFailedStep,
  parseBrokenLinks,
  publicationQuery,
  sendAlert,
} from "../../scripts/publication-alert.mjs";

const publication = {
  id: "article-hirsutyzm-pl",
  type: "article",
  title: "Hirsutyzm",
  updatedAt: "2026-10-18T12:00:00Z",
};
const minutesAfter = (minutes: number) =>
  new Date(Date.parse(publication.updatedAt) + minutes * 60_000);
const iso = (minutes: number) => minutesAfter(minutes).toISOString();

describe("evaluatePublication", () => {
  it("is ok when a successful deployment started after the publication", () => {
    const result = evaluatePublication({
      latestPublication: publication,
      deployments: [{ createdAt: iso(1), state: "success" }],
      now: minutesAfter(60),
    });
    expect(result.status).toBe("ok");
  });

  it("waits during the grace period", () => {
    const result = evaluatePublication({
      latestPublication: publication,
      deployments: [{ createdAt: iso(-90), state: "success" }],
      now: minutesAfter(19),
    });
    expect(result).toMatchObject({ status: "pending", reason: "grace-period" });
  });

  it("waits while a later deployment is running", () => {
    const result = evaluatePublication({
      latestPublication: publication,
      deployments: [
        { createdAt: iso(2), state: "in_progress" },
        { createdAt: iso(-90), state: "success" },
      ],
      now: minutesAfter(30),
    });
    expect(result).toMatchObject({ reason: "deployment-running" });
  });

  it("leaves failed deployments to the Publish content failure alert", () => {
    const result = evaluatePublication({
      latestPublication: publication,
      deployments: [
        { createdAt: iso(2), state: "failure" },
        { createdAt: iso(-90), state: "success" },
      ],
      now: minutesAfter(30),
    });
    expect(result.status).toBe("reported");
  });

  it("alerts when no deployment followed the publication", () => {
    const result = evaluatePublication({
      latestPublication: publication,
      deployments: [{ createdAt: iso(-90), state: "success" }],
      now: minutesAfter(45),
    });
    expect(result).toMatchObject({
      status: "alert",
      ageMinutes: 45,
      alertKey: "2026-10-18T12_00_00Z-article-hirsutyzm-pl",
      lastSuccess: { createdAt: iso(-90) },
    });
  });

  it("treats a deployment that started before the publication as stale", () => {
    const result = evaluatePublication({
      latestPublication: publication,
      deployments: [{ createdAt: iso(-1), state: "success" }],
      now: minutesAfter(21),
    });
    expect(result.status).toBe("alert");
  });

  it("is ok without published content", () => {
    expect(
      evaluatePublication({
        latestPublication: null,
        deployments: [],
        now: new Date(),
      }).status,
    ).toBe("ok");
  });
});

describe("failure details", () => {
  it("extracts broken links from the check-seo assertion output", () => {
    const log = [
      "AssertionError [ERR_ASSERTION]: Broken internal links:",
      "/blog/szkic/ ← /blog/hirsutyzm/, /blog/",
      "+ actual - expected",
      "+ [",
      "+   '/blog/szkic/ ← /blog/hirsutyzm/, /blog/'",
      "+ ]",
    ].join("\n");
    expect(parseBrokenLinks(log)).toEqual([
      "/blog/szkic/ ← /blog/hirsutyzm/, /blog/",
    ]);
  });

  it("names the first failed step", () => {
    expect(firstFailedStep({ config: "success", build: "failure" })).toBe(
      "build",
    );
    expect(firstFailedStep({})).toBe("unknown");
  });

  it("explains broken links in plain language with the run link", () => {
    const payload = buildFailureAlert({
      failedStep: "build",
      brokenLinks: ["/blog/szkic/ ← /blog/hirsutyzm/"],
      runUrl: "https://github.com/o/r/actions/runs/1",
    });
    expect(payload.kind).toBe("publish-failed");
    expect(payload.text).toContain("• /blog/szkic/ ← /blog/hirsutyzm/");
    expect(payload.text).toContain("opublikuj brakującą stronę");
    expect(payload.text).toContain("https://github.com/o/r/actions/runs/1");
  });

  it("names the technical step when no link is broken", () => {
    const payload = buildFailureAlert({
      failedStep: "deploy",
      brokenLinks: [],
      runUrl: "https://github.com/o/r/actions/runs/1",
    });
    expect(payload.text).toContain("„wdrożenie na Cloudflare”");
  });

  it("lists pending documents in the monitor alert", () => {
    const payload = buildMonitorAlert({
      evaluation: { status: "alert", ageMinutes: 45 },
      pending: [publication],
      latest: publication,
      runUrl: "https://github.com/o/r/actions/runs/2",
    });
    expect(payload.kind).toBe("publication-not-deployed");
    expect(payload.text).toContain("„Hirsutyzm” (artykuł)");
    expect(payload.text).toContain("18 października 2026");
  });
});

describe("publication query", () => {
  it("returns the newest published public document and pending changes", async () => {
    const contract = JSON.parse(
      readFileSync("docs/sanity-publication-webhook.json", "utf8"),
    ) as { filter: string };
    const dataset = [
      { _id: "old", _type: "page", _updatedAt: "2026-10-01T00:00:00Z" },
      {
        _id: "new",
        _type: "article",
        title: "Nowy",
        _updatedAt: "2026-10-18T00:00:00Z",
      },
      {
        _id: "drafts.newer",
        _type: "article",
        _updatedAt: "2026-10-19T00:00:00Z",
      },
      {
        _id: "asset",
        _type: "sanity.imageAsset",
        _updatedAt: "2026-10-19T00:00:00Z",
      },
    ];
    const result = await evaluate(parse(publicationQuery(contract.filter)), {
      dataset,
      params: { since: "2026-10-10T00:00:00Z" },
    });
    expect(await result.get()).toEqual({
      latest: {
        id: "new",
        type: "article",
        title: "Nowy",
        updatedAt: "2026-10-18T00:00:00Z",
      },
      pending: [
        {
          id: "new",
          type: "article",
          title: "Nowy",
          updatedAt: "2026-10-18T00:00:00Z",
        },
      ],
    });
  });
});

describe("GitHub deployments", () => {
  it("keeps only Publish content deployments and stops at the first success", async () => {
    const responses: Record<string, unknown> = {
      "https://api.test/repos/o/r/actions/workflows/publish-content.yml/runs?event=repository_dispatch&per_page=100":
        {
          workflow_runs: [
            { id: 10, html_url: "https://github.com/o/r/actions/runs/10" },
            { id: 11, html_url: "https://github.com/o/r/actions/runs/11" },
          ],
        },
      "https://api.test/repos/o/r/deployments?environment=production&per_page=50":
        [
          { created_at: "2026-10-19T10:00:00Z", statuses_url: "s/studio" },
          { created_at: "2026-10-19T09:00:00Z", statuses_url: "s/failed" },
          { created_at: "2026-10-19T08:00:00Z", statuses_url: "s/ok" },
          { created_at: "2026-10-19T07:00:00Z", statuses_url: "s/older" },
        ],
      "s/studio?per_page=1": [
        { state: "success", log_url: "https://github.com/o/r/actions/runs/99" },
      ],
      "s/failed?per_page=1": [
        { state: "failure", log_url: "https://github.com/o/r/actions/runs/11" },
      ],
      "s/ok?per_page=1": [
        { state: "success", log_url: "https://github.com/o/r/actions/runs/10" },
      ],
    };
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (!(url in responses)) throw new Error(`Unexpected ${url}`);
      return new Response(JSON.stringify(responses[url]));
    });
    const deployments = await fetchProductionDeployments({
      repository: "o/r",
      token: "test",
      apiUrl: "https://api.test",
      fetchImpl,
    });
    expect(deployments).toEqual([
      {
        createdAt: "2026-10-19T09:00:00Z",
        state: "failure",
        runUrl: "https://github.com/o/r/actions/runs/11",
      },
      {
        createdAt: "2026-10-19T08:00:00Z",
        state: "success",
        runUrl: "https://github.com/o/r/actions/runs/10",
      },
    ]);
    expect(fetchImpl).not.toHaveBeenCalledWith(
      "s/older?per_page=1",
      expect.anything(),
    );
  });
});

describe("alert endpoint", () => {
  it("rejects missing, insecure and form webhooks", () => {
    expect(() => assertAlertEndpoint(undefined)).toThrow("not set");
    expect(() => assertAlertEndpoint("http://alerts.test/hook")).toThrow(
      "HTTPS",
    );
    expect(() =>
      assertAlertEndpoint(
        "https://flows.zawlodzki.com/webhook/2fba1cf1-729f-4e79-8ebf-869f9277284e",
      ),
    ).toThrow("form webhook");
  });

  it("posts JSON to the injected fetch only", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }));
    await sendAlert({
      payload: { kind: "publish-failed", text: "x" },
      endpoint: "https://alerts.test/hook",
      fetchImpl,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      new URL("https://alerts.test/hook"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("fails when the webhook rejects the alert", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 500 }));
    await expect(
      sendAlert({
        payload: {},
        endpoint: "https://alerts.test/hook",
        fetchImpl,
      }),
    ).rejects.toThrow("500");
  });
});

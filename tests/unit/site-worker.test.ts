import { describe, expect, it } from "vitest";

import {
  handleSiteRequest,
  markdownAlternatePath,
  prefersMarkdown,
  type SiteWorkerEnv,
} from "@/edge/site-worker";

const ORIGIN = "https://aleksandraolesiewicz.com";

/** Fake Static Assets: `_headers` behaviour of the `/*.md` rule included. */
function fakeAssets(files: Record<string, string>): SiteWorkerEnv {
  return {
    ASSETS: {
      async fetch(request: Request) {
        const { pathname } = new URL(request.url);
        const markdownHeaders: Record<string, string> = pathname.endsWith(".md")
          ? {
              "Content-Type": "text/markdown; charset=utf-8",
              Link: `<${ORIGIN}${pathname.slice(0, -3)}/>; rel="canonical"`,
            }
          : {};
        const body = files[pathname];
        if (body === undefined) {
          return new Response("<!DOCTYPE html>404", {
            status: 404,
            headers: { "Content-Type": "text/html", ...markdownHeaders },
          });
        }
        return new Response(request.method === "HEAD" ? null : body, {
          headers: pathname.endsWith(".md")
            ? markdownHeaders
            : { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  };
}

const env = fakeAssets({
  "/": "<!DOCTYPE html>home",
  "/index.md": "# Home",
  "/o-mnie/": "<!DOCTYPE html>about",
  "/o-mnie.md": "# O mnie",
  "/zamowienie/": "<!DOCTYPE html>order",
  "/robots.txt": "User-agent: *",
});

function get(path: string, accept?: string) {
  return handleSiteRequest(
    new Request(`${ORIGIN}${path}`, {
      headers: accept ? { Accept: accept } : {},
    }),
    env,
  );
}

describe("markdownAlternatePath", () => {
  it("maps directory pages like markdownPath", () => {
    expect(markdownAlternatePath("/")).toBe("/index.md");
    expect(markdownAlternatePath("/o-mnie/")).toBe("/o-mnie.md");
    expect(markdownAlternatePath("/blog/wpis/")).toBe("/blog/wpis.md");
    expect(markdownAlternatePath("/robots.txt")).toBeNull();
    expect(markdownAlternatePath("/o-mnie")).toBeNull();
  });
});

describe("prefersMarkdown", () => {
  it("keeps browsers on HTML", () => {
    expect(prefersMarkdown(null)).toBe(false);
    expect(prefersMarkdown("text/html,application/xhtml+xml,*/*;q=0.8")).toBe(
      false,
    );
    expect(prefersMarkdown("text/html, text/markdown;q=0.5")).toBe(false);
  });

  it("serves agents that ask for Markdown", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown, text/html;q=0.9")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=0")).toBe(false);
  });
});

describe("handleSiteRequest", () => {
  it("returns the Markdown alternate for Accept: text/markdown", async () => {
    const response = await get("/o-mnie/", "text/markdown");
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("Vary")).toBe("Accept");
    expect(await response.text()).toBe("# O mnie");
  });

  it("links HTML pages to their Markdown alternate", async () => {
    const response = await get("/", "text/html");
    expect(await response.text()).toBe("<!DOCTYPE html>home");
    expect(response.headers.get("Link")).toBe(
      `<${ORIGIN}/index.md>; rel="alternate"; type="text/markdown"`,
    );
    expect(response.headers.get("Vary")).toBe("Accept");
  });

  it("keeps HTML without a Link when the page has no alternate", async () => {
    const response = await get("/zamowienie/", "text/markdown");
    expect(response.headers.get("Content-Type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("Link")).toBeNull();
  });

  it("serves a missing .md as an HTML 404 without a canonical", async () => {
    const response = await get("/nie-istnieje.md");
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe(
      "text/html; charset=utf-8",
    );
    expect(response.headers.get("Link")).toBeNull();
  });

  it("passes existing Markdown and other assets through", async () => {
    const markdown = await get("/o-mnie.md");
    expect(markdown.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(markdown.headers.get("Link")).toBe(
      `<${ORIGIN}/o-mnie/>; rel="canonical"`,
    );
    const robots = await get("/robots.txt", "text/markdown");
    expect(await robots.text()).toBe("User-agent: *");
  });
});

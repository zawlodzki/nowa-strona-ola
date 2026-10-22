import { SITE_ORIGIN } from "../lib/seo/site";

/** The Workers Static Assets binding; only `fetch` is used. */
export interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface SiteWorkerEnv {
  ASSETS: AssetsBinding;
}

const MARKDOWN_TYPE = "text/markdown; charset=utf-8";

/**
 * Markdown alternate of an HTML page path, mirroring `markdownPath` in
 * `src/lib/seo/inventory.ts`. Only directory-style paths have one.
 */
export function markdownAlternatePath(pathname: string): string | null {
  if (pathname === "/") return "/index.md";
  if (!pathname.endsWith("/") || pathname.startsWith("//")) return null;
  return `${pathname.slice(0, -1)}.md`;
}

function mediaQuality(accept: string, type: string): number {
  let quality = 0;
  for (const part of accept.split(",")) {
    const [media = "", ...params] = part.trim().toLowerCase().split(";");
    if (media.trim() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const value = q ? Number(q.slice(2)) : 1;
    quality = Math.max(quality, Number.isFinite(value) ? value : 0);
  }
  return quality;
}

/**
 * True when the client asks for `text/markdown` explicitly and does not
 * prefer `text/html`. Browsers never list Markdown, so they keep HTML.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const markdown = mediaQuality(accept, "text/markdown");
  return markdown > 0 && markdown >= mediaQuality(accept, "text/html");
}

function appendVary(headers: Headers, value: string): void {
  const current = headers.get("Vary");
  const values = current?.split(",").map((v) => v.trim().toLowerCase()) ?? [];
  if (!values.includes(value.toLowerCase())) {
    headers.set("Vary", current ? `${current}, ${value}` : value);
  }
}

function withHeaders(
  response: Response,
  update: (headers: Headers) => void,
): Response {
  const headers = new Headers(response.headers);
  update(headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function assetRequest(request: Request, pathname: string): Request {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return new Request(url, { method: request.method, headers: request.headers });
}

async function hasAsset(env: SiteWorkerEnv, request: Request, path: string) {
  const url = new URL(request.url);
  url.pathname = path;
  url.search = "";
  const response = await env.ASSETS.fetch(new Request(url, { method: "HEAD" }));
  return response.ok;
}

/**
 * `_headers` sets Markdown headers on `/*.md`, which also matches the 404
 * page served for a missing `.md` URL. That page is HTML and has no
 * canonical, so the Markdown headers are replaced.
 */
async function serveMarkdownFile(
  request: Request,
  env: SiteWorkerEnv,
): Promise<Response> {
  const response = await env.ASSETS.fetch(request);
  if (response.status !== 404) return response;
  return withHeaders(response, (headers) => {
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.delete("Link");
  });
}

/**
 * HTML pages: `Accept: text/markdown` gets the Markdown alternate from the
 * same build, every other client gets HTML with a `Link` to that alternate.
 */
async function servePage(
  request: Request,
  env: SiteWorkerEnv,
  markdownPath: string,
): Promise<Response> {
  if (prefersMarkdown(request.headers.get("Accept"))) {
    const markdown = await env.ASSETS.fetch(
      assetRequest(request, markdownPath),
    );
    if (markdown.ok) {
      return withHeaders(markdown, (headers) => {
        headers.set("Content-Type", MARKDOWN_TYPE);
        appendVary(headers, "Accept");
      });
    }
  }
  const response = await env.ASSETS.fetch(request);
  const isHtml = response.headers
    .get("Content-Type")
    ?.toLowerCase()
    .startsWith("text/html");
  if (!response.ok || !isHtml) return response;
  const alternate = (await hasAsset(env, request, markdownPath))
    ? `<${SITE_ORIGIN}${markdownPath}>; rel="alternate"; type="text/markdown"`
    : null;
  return withHeaders(response, (headers) => {
    if (alternate) headers.append("Link", alternate);
    appendVary(headers, "Accept");
  });
}

export async function handleSiteRequest(
  request: Request,
  env: SiteWorkerEnv,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return env.ASSETS.fetch(request);
  }
  const { pathname } = new URL(request.url);
  if (pathname.endsWith(".md")) return serveMarkdownFile(request, env);
  const markdownPath = markdownAlternatePath(pathname);
  if (!markdownPath) return env.ASSETS.fetch(request);
  return servePage(request, env, markdownPath);
}

export default {
  fetch: (request: Request, env: SiteWorkerEnv) =>
    handleSiteRequest(request, env),
};

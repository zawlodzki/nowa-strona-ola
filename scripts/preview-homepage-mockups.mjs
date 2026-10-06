import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";
import { resolve, extname } from "node:path";

// Lokalny podgląd dopuszcza tylko mockupy i ich publiczne zasoby.
// .env, .dev.vars, źródła aplikacji i katalogi repo nie są udostępniane.
const root = fileURLToPath(new URL("../", import.meta.url));
const port = 8766;
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  const path = new URL(request.url, `http://127.0.0.1:${port}`).pathname;
  if (path === "/") {
    response.writeHead(302, { Location: "/mockups/homepage/index.html" });
    response.end();
    return;
  }
  const allowed =
    path.startsWith("/mockups/homepage/") ||
    path.startsWith("/src/assets/portraits/") ||
    path.startsWith("/src/assets/brand/") ||
    path.startsWith("/src/assets/fonts/switzer/") ||
    path === "/wonderful-design-system/tokens.css";
  if (
    !allowed ||
    !mime[extname(path)] ||
    !["GET", "HEAD"].includes(request.method)
  ) {
    response.writeHead(404);
    response.end("Nie znaleziono.");
    return;
  }
  try {
    const data = await readFile(resolve(root, `.${path}`));
    response.writeHead(200, {
      "Content-Type": mime[extname(path)],
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(request.method === "HEAD" ? undefined : data);
  } catch {
    response.writeHead(404);
    response.end("Nie znaleziono.");
  }
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Mockupy: http://127.0.0.1:${port}/mockups/homepage/index.html`);
});

// SEO-1/SEO-2 build gate (docs/SEO-GEO-AEO-PLAN.md): canonical, Open Graph,
// robots per environment and one consistent JSON-LD graph per page.
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://aleksandraolesiewicz.com";
const distDir = process.argv[2] ?? "dist";
const indexing = process.env.SITE_INDEXING === "production";

/** Pages without SEO head by design: 404 and internal demo/legacy routes. */
const withoutSeo = new Set([
  "/404.html",
  "/ui/",
  "/design-system/",
  "/static/",
  "/tylko-pl/",
  "/warsztat/",
  "/wdrozenie/",
]);

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(full);
      return entry.name.endsWith(".html") ? [full] : [];
    }),
  );
  return nested.flat();
}

function routeOf(file) {
  const relative = path.relative(distDir, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"index.html".length)}`;
  }
  return `/${relative}`;
}

const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

function attr(html, pattern) {
  const match = html.match(pattern);
  return match ? decode(match[1]) : null;
}

function visibleText(html) {
  return decode(
    html
      .replace(/<head[\s\S]*?<\/head>/, " ")
      .replace(/<script[\s\S]*?<\/script>/g, " ")
      .replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

const normalize = (value) => String(value).replace(/\s+/g, " ").trim();

function walk(value, visit, key = null) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, visit, key);
    return;
  }
  if (value && typeof value === "object") {
    visit(value, key);
    for (const [childKey, child] of Object.entries(value)) {
      walk(child, visit, childKey);
    }
  }
}

function checkGraph(route, html, canonical) {
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ];
  assert.equal(blocks.length, 1, `${route}: expected one JSON-LD block`);
  const document = JSON.parse(blocks[0][1]);
  assert.equal(
    document["@context"],
    "https://schema.org",
    `${route}: @context`,
  );
  const graph = document["@graph"];
  assert.ok(Array.isArray(graph) && graph.length, `${route}: empty @graph`);

  const ids = new Set();
  for (const node of graph) {
    assert.ok(node["@type"], `${route}: node without @type`);
    if (!node["@id"]) continue;
    assert.ok(!ids.has(node["@id"]), `${route}: duplicate ${node["@id"]}`);
    ids.add(node["@id"]);
  }
  walk(graph, (node) => {
    if (node["@id"] && Object.keys(node).length > 1) ids.add(node["@id"]);
  });
  for (const id of ids) {
    assert.ok(id.startsWith(`${ORIGIN}/`), `${route}: relative @id ${id}`);
  }
  walk(graph, (node, key) => {
    const keys = Object.keys(node);
    if (keys.length === 1 && keys[0] === "@id") {
      assert.ok(
        ids.has(node["@id"]),
        `${route}: unresolved ${key} → ${node["@id"]}`,
      );
    }
    for (const field of ["url", "item"]) {
      if (typeof node[field] === "string") {
        assert.match(node[field], /^https:\/\//, `${route}: relative ${field}`);
      }
    }
  });

  for (const id of [
    `${ORIGIN}/#person`,
    `${ORIGIN}/#website`,
    `${ORIGIN}/#seller`,
  ]) {
    assert.ok(ids.has(id), `${route}: missing shared entity ${id}`);
  }
  const page = graph.find((node) => node["@id"] === `${canonical}#webpage`);
  assert.ok(page, `${route}: missing ${canonical}#webpage`);
  assert.equal(page.url, canonical, `${route}: WebPage.url ≠ canonical`);

  const text = normalize(visibleText(html));
  for (const node of graph) {
    const types = [node["@type"]].flat();
    if (types.includes("FAQPage")) {
      for (const question of node.mainEntity) {
        assert.ok(
          text.includes(normalize(question.name)),
          `${route}: FAQ question not visible: ${question.name}`,
        );
        assert.ok(
          text.includes(normalize(question.acceptedAnswer.text)),
          `${route}: FAQ answer not visible: ${question.name}`,
        );
      }
    }
    for (const offer of [node.offers ?? []].flat()) {
      assert.ok(
        text.includes(String(offer.price)),
        `${route}: Offer price ${offer.price} not visible`,
      );
      if (types.includes("Product")) {
        assert.ok(
          html.includes(`href="${offer.url}"`),
          `${route}: Product offer without a visible checkout link`,
        );
      }
    }
  }
}

const exists = (file) =>
  access(file).then(
    () => true,
    () => false,
  );

/** dist file served for a root-relative URL path (directory or file). */
function fileForPath(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (clean.endsWith("/")) return path.join(distDir, clean, "index.html");
  return path.join(distDir, clean);
}

const sitemap = await readFile(path.join(distDir, "sitemap.xml"), "utf8");
const sitemapLocs = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]),
);

const files = await htmlFiles(distDir);
const titles = new Map();
const pageRobots = new Map();
const internalLinks = new Map();
let checked = 0;
for (const file of files) {
  const route = routeOf(file);
  const html = await readFile(file, "utf8");
  const robots = attr(html, /<meta name="robots" content="([^"]+)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]+)"/);
  for (const [, href] of html.matchAll(/<a\b[^>]*\shref="(\/[^"]*)"/g)) {
    const target = decode(href);
    if (target.startsWith("//")) continue;
    internalLinks.set(target, [...(internalLinks.get(target) ?? []), route]);
  }

  if (withoutSeo.has(route) || !html.includes("ao-site")) {
    assert.ok(
      !canonical || route !== "/404.html",
      `${route}: 404 has canonical`,
    );
    if (route === "/404.html") {
      assert.equal(robots, "noindex,nofollow", "/404.html must stay noindex");
    }
    continue;
  }

  assert.ok(canonical, `${route}: missing canonical`);
  assert.equal(
    canonical,
    `${ORIGIN}${route}`,
    `${route}: canonical ≠ page URL`,
  );
  const inSitemap = sitemapLocs.has(canonical);
  if (!indexing || !inSitemap) {
    // Staging: everything noindex. Production: pages outside the sitemap may
    // be noindex (empty categories) or index (pagination).
    if (!indexing) assert.equal(robots, "noindex,nofollow", `${route}: robots`);
  } else {
    assert.equal(
      robots,
      "index,follow,max-image-preview:large",
      `${route}: sitemap page must be indexable`,
    );
  }
  if (indexing && robots === "noindex,nofollow") {
    assert.ok(!inSitemap, `${route}: noindex page in sitemap`);
  }
  if (
    indexing &&
    robots !== "noindex,nofollow" &&
    !/\/strona\/\d+\/$/.test(route)
  ) {
    assert.ok(inSitemap, `${route}: indexable page missing from sitemap`);
  }
  pageRobots.set(canonical, robots);

  const markdown = attr(
    html,
    /<link rel="alternate" type="text\/markdown" href="([^"]+)"/,
  );
  assert.equal(
    Boolean(markdown),
    inSitemap,
    `${route}: Markdown alternate only and always for sitemap pages`,
  );
  if (markdown) {
    assert.ok(markdown.startsWith(`${ORIGIN}/`), `${route}: .md origin`);
    const body = await readFile(
      fileForPath(markdown.slice(ORIGIN.length)),
      "utf8",
    );
    assert.match(body, /^# \S/, `${route}: .md must start with a H1`);
    assert.ok(!/\]\((\/|#)/.test(body), `${route}: relative link in .md`);
  }
  assert.match(html, /<html lang="pl-PL"/, `${route}: html lang`);

  const title = attr(html, /<title>([^<]*)<\/title>/);
  assert.ok(title, `${route}: missing title`);
  titles.set(title, [...(titles.get(title) ?? []), route]);
  assert.equal(
    attr(html, /<meta property="og:url" content="([^"]+)"/),
    canonical,
  );
  assert.equal(
    attr(html, /<meta property="og:title" content="([^"]+)"/),
    title,
  );
  const image = attr(html, /<meta property="og:image" content="([^"]+)"/);
  assert.match(
    image ?? "",
    /^https:\/\//,
    `${route}: og:image must be absolute`,
  );
  if (image.startsWith(`${ORIGIN}/og/`)) {
    const png = await readFile(fileForPath(image.slice(ORIGIN.length)));
    assert.equal(
      png.subarray(1, 4).toString("ascii"),
      "PNG",
      `${route}: share card is not a PNG`,
    );
    assert.deepEqual(
      [png.readUInt32BE(16), png.readUInt32BE(20)],
      [1200, 630],
      `${route}: share card must be 1200×630`,
    );
  }
  assert.equal(
    attr(html, /<meta property="og:locale" content="([^"]+)"/),
    "pl_PL",
  );

  checkGraph(route, html, canonical);
  checked += 1;
}

for (const [title, routes] of titles) {
  assert.equal(
    routes.length,
    1,
    `Duplicate <title> "${title}": ${routes.join(", ")}`,
  );
}

for (const loc of sitemapLocs) {
  assert.ok(loc.startsWith(`${ORIGIN}/`), `sitemap: foreign origin ${loc}`);
  assert.ok(pageRobots.has(loc), `sitemap: ${loc} is not a page with SEO head`);
  assert.ok(!loc.endsWith(".md"), `sitemap: Markdown URL ${loc}`);
}

const broken = [];
for (const [href, routes] of internalLinks) {
  const target = href.split(/[?#]/)[0];
  if (!target || target.startsWith("/api/")) continue;
  if (!(await exists(fileForPath(target)))) {
    broken.push(`${href} ← ${[...new Set(routes)].join(", ")}`);
  }
}
assert.deepEqual(broken, [], `Broken internal links:\n${broken.join("\n")}`);

const robotsTxt = await readFile(path.join(distDir, "robots.txt"), "utf8");
if (indexing) {
  assert.match(
    robotsTxt,
    /Content-Signal: search=yes, ai-input=yes, ai-train=no/,
  );
  assert.match(robotsTxt, /User-agent: GPTBot[\s\S]*Disallow: \//);
  assert.match(robotsTxt, new RegExp(`Sitemap: ${ORIGIN}/sitemap.xml`));
  assert.doesNotMatch(robotsTxt, /User-agent: \*\nDisallow: \//);
} else {
  assert.match(robotsTxt, /User-agent: \*\nDisallow: \//, "robots.txt staging");
}

const headers = await readFile(path.join(distDir, "_headers"), "utf8");
assert.equal(
  /^\/\*\n {2}X-Robots-Tag: noindex/m.test(headers),
  !indexing,
  "_headers: site-wide noindex only outside production",
);
assert.match(
  headers,
  /\/\*\.md\n[\s\S]*?rel="canonical"/,
  "_headers: .md canonical",
);
assert.ok(await exists(path.join(distDir, "_redirects")), "_redirects missing");

const llms = await readFile(path.join(distDir, "llms.txt"), "utf8");
assert.match(llms, /^# \S[\s\S]*\n> \S/, "llms.txt: H1 and summary");
for (const [, url] of llms.matchAll(/\]\((https:[^)]+)\)/g)) {
  if (url === `${ORIGIN}/llms-full.txt`) continue;
  assert.ok(url.endsWith(".md"), `llms.txt: link is not Markdown ${url}`);
  assert.ok(
    await exists(fileForPath(url.slice(ORIGIN.length))),
    `llms.txt: missing ${url}`,
  );
}

assert.ok(
  llms.includes(`${ORIGIN}/llms-full.txt`),
  "llms.txt: full export link missing",
);
const llmsFull = await readFile(path.join(distDir, "llms-full.txt"), "utf8");
const fullSources = new Set();
for (const [, url, body] of llmsFull.matchAll(
  /^Źródło: (https:[^\n]+)\n\n([\s\S]*?)(?=\n\n---\n\nŹródło: |(?![\s\S]))/gm,
)) {
  assert.ok(
    sitemapLocs.has(url),
    `llms-full.txt: ${url} is not in the sitemap`,
  );
  const sourcePath = url.slice(ORIGIN.length);
  assert.ok(
    ["/", "/o-mnie/", "/konsultacje/", "/ebooki/"].includes(sourcePath) ||
      /^\/ebooki\/[^/]+\/$/.test(sourcePath),
    `llms-full.txt: unexpected page ${url}`,
  );
  const markdownFile =
    sourcePath === "/" ? "/index.md" : `${sourcePath.replace(/\/$/, "")}.md`;
  const markdown = await readFile(fileForPath(markdownFile), "utf8");
  assert.equal(
    body.trimEnd(),
    markdown.trimEnd(),
    `llms-full.txt differs from ${markdownFile}`,
  );
  assert.ok(!fullSources.has(url), `llms-full.txt: duplicate ${url}`);
  fullSources.add(url);
}
assert.ok(fullSources.size > 0, "llms-full.txt: empty export");
for (const url of sitemapLocs) {
  const sourcePath = url.slice(ORIGIN.length);
  if (
    ["/", "/o-mnie/", "/konsultacje/", "/ebooki/"].includes(sourcePath) ||
    /^\/ebooki\/[^/]+\/$/.test(sourcePath)
  ) {
    assert.ok(fullSources.has(url), `llms-full.txt: missing key page ${url}`);
  }
}
assert.match(
  headers,
  /\/llms-full\.txt\n {2}Content-Type: text\/plain; charset=utf-8\n {2}X-Robots-Tag: noindex/,
  "llms-full.txt: headers",
);

const rss = await readFile(path.join(distDir, "blog/rss.xml"), "utf8");
assert.match(
  rss,
  /xmlns:content="http:\/\/purl.org\/rss\/1.0\/modules\/content\/"/,
  "RSS: content namespace missing",
);
for (const [, item] of rss.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
  const link = item.match(/<link>([^<]+)<\/link>/)?.[1];
  assert.ok(sitemapLocs.has(link), `RSS: ${link} is not in the sitemap`);
  assert.match(
    item,
    /<content:encoded>&lt;[\s\S]+<\/content:encoded>/,
    `RSS: full HTML missing for ${link}`,
  );
}

assert.ok(checked > 0, "No pages with SEO head were checked");
console.log(
  `SEO check passed: ${checked} pages, robots=${indexing ? "index" : "noindex"}.`,
);

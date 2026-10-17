import { readFile, readdir } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import assert from "node:assert/strict";
import { tsImport } from "tsx/esm/api";
import { checkCssBudgets } from "./check-css-budgets.mjs";
import { assertEnglishDisabled } from "./check-disabled-locales.mjs";

const indexing = process.env.SITE_INDEXING === "production";
const liveContent = Boolean(process.env.PUBLIC_SANITY_PROJECT_ID);
const layoutNoindex = new Set(["ui/index.html", "static/index.html"]);
const checkoutReceipt = /potwierdzenie zakupu|płatność przyjęta/i;

function assertRobots(html, filePath) {
  if (layoutNoindex.has(filePath) || !indexing) {
    assert.match(
      html,
      /noindex,nofollow/,
      `${filePath}: prototype must remain noindex`,
    );
  }
}

function assertOneHeading(html, filePath) {
  assert.equal(
    (html.match(/<h1[\s>]/g) ?? []).length,
    1,
    `${filePath}: exactly one h1`,
  );
}

async function directoryNames(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function inputWithValue(html, value) {
  return [...html.matchAll(/<input\b[^>]*>/g)]
    .map((match) => match[0])
    .find((tag) => new RegExp(`\\bvalue="${value}"`).test(tag));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assertCopy(html, text, label) {
  const forms = [
    text,
    text.replaceAll("\u00A0", " "),
    text.replaceAll("\u00A0", "&nbsp;"),
    text.replaceAll("\u00A0", "&#160;"),
    text.replaceAll("\u00A0", "&#xa0;"),
  ];
  assert.ok(
    forms.some((form) => html.includes(form)),
    `${label}: missing fixture copy`,
  );
}

function assertLegalVersion(html, view, label) {
  assert.ok(view.effective, `${label}: fixture version has no date`);
  assert.match(
    html,
    new RegExp(
      `${escapeRegExp(view.versionLabel)}\\s*·\\s*${escapeRegExp(view.effectiveCaption)}\\s*<time datetime="${escapeRegExp(view.effective.datetime)}"`,
    ),
    label,
  );
}

async function loadFixtureOracle() {
  const load = (specifier) => tsImport(specifier, import.meta.url);
  const [
    ebookCollection,
    blogSeed,
    homepage,
    about,
    consultation,
    ebookSeed,
    social,
    mapLegal,
    legalFixtures,
    homepageFixtures,
    blogFixtures,
    ebookFixtureModule,
    mapArticleModule,
    paths,
    pagination,
  ] = await Promise.all([
    load("../src/content/ebook-collection-seed.ts"),
    load("../src/content/blog-collection-seed.ts"),
    load("../src/content/homepage-seed.ts"),
    load("../src/content/about-seed.ts"),
    load("../src/content/consultation-seed.ts"),
    load("../src/content/ebook-seed.ts"),
    load("../src/content/social-profiles.ts"),
    load("../src/content/map-legal.ts"),
    load("../src/sanity/legal-fixtures.ts"),
    load("../src/sanity/homepage-fixtures.ts"),
    load("../src/sanity/blog-collection-fixtures.ts"),
    load("../src/sanity/ebook-fixtures.ts"),
    load("../src/content/map-article.ts"),
    load("../src/lib/paths.ts"),
    load("../src/lib/pagination.ts"),
  ]);
  const settings = homepageFixtures.homepageSettingsFixture("pl");
  const articles = blogFixtures.fixtureArticlesForLanguage("pl");
  const featured = articles[0];
  assert.ok(featured, "fixture article list is empty");
  const cards = homepageFixtures.ebookFixtures("pl");
  const card = cards[0];
  assert.ok(card, "fixture ebook list is empty");
  const pcosSlug = homepage.EBOOK_SEED[0]?.slug.pl;
  assert.ok(pcosSlug, "fixture ebook seed is empty");
  const pcos = ebookFixtureModule.fixtureEbook("pl", pcosSlug);
  assert.ok(pcos, `missing ebook fixture ${pcosSlug}`);
  const pageSize = paths.ARTICLES_PER_PAGE;
  const firstPage = pagination.paginateBlogCollection(articles, 1, pageSize);
  const secondPage = pagination.paginateBlogCollection(articles, 2, pageSize);
  assert.ok(firstPage, "fixture blog page 1");
  const legal = (slug) => {
    const page = legalFixtures.fixtureLegalPage("pl", slug);
    assert.ok(page, `missing legal fixture ${slug}`);
    return mapLegal.mapLegalPage(page, settings);
  };
  const privacy = legal("polityka-prywatnosci");
  const cookies = legal("lista-cookies-i-identyfikatorow");
  assert.ok(privacy.toc[0], "privacy fixture has no heading");
  assert.ok(cookies.toc[0], "cookies fixture has no heading");
  return {
    collectionTitle:
      ebookCollection.ebookCollectionCopy.pl.title.split("\n")[0],
    collectionNote: ebookCollection.ebookCollectionCopy.pl.note,
    price: String(card.priceGross),
    ebookSlugs: homepage.EBOOK_SEED.map((item) => item.slug.pl),
    pcosSlug,
    pcosPrice: String(pcos.priceGross),
    offerNote: ebookSeed.ebookCopy.pl.offerNote,
    blogTitle: blogSeed.blogIndexCopy.pl.title,
    latestTitle: blogSeed.blogIndexCopy.pl.latestTitle,
    articleCount: articles.length,
    firstRange: blogSeed.blogRangeLabel(
      "pl",
      firstPage.rangeStart,
      firstPage.rangeEnd,
      articles.length,
    ),
    secondRange:
      secondPage &&
      blogSeed.blogRangeLabel(
        "pl",
        secondPage.rangeStart,
        secondPage.rangeEnd,
        articles.length,
      ),
    hasSecondPage: firstPage.totalPages > 1,
    featuredSlug: featured.slug,
    featuredTitle: featured.title,
    tocLabel: mapArticleModule.mapArticle(featured, settings).tocLabel,
    emptyCategorySlug: blogSeed.BLOG_CATEGORY_SEED.perimenopause.slugs.pl,
    emptyCategoryMessage: blogSeed.blogIndexCopy.pl.emptyCategoryMessage,
    socialHrefs: social.SOCIAL_PROFILES.map((item) => item.href),
    heroLine: homepage.homepageCopy.pl.heroTitle.split("\n")[0],
    aboutLine: about.aboutCopy.pl.heroTitle.split("\n")[0],
    consultationLine:
      consultation.consultationCopy.pl.processTitle.split("\n")[0],
    privacy,
    cookies,
  };
}

const assets = await readdir("dist/_astro");
const sizes = { js: 0, css: 0 };
for (const name of assets) {
  const type = name.endsWith(".js")
    ? "js"
    : name.endsWith(".css")
      ? "css"
      : undefined;
  if (type)
    sizes[type] += gzipSync(await readFile(`dist/_astro/${name}`)).length;
}
assert(sizes.js <= 25 * 1024, `JS budget exceeded: ${sizes.js} B gzip`);
// Tymczasowy limit etapu 4a (pakiety 5–7). Optymalizacja CSS przyjdzie później;
// 32 KiB nie jest docelowym budżetem strony.
assert(sizes.css <= 32 * 1024, `CSS budget exceeded: ${sizes.css} B gzip`);
const woff2 = assets.filter((name) => name.endsWith(".woff2"));
assert.equal(woff2.length, 1, `expected one woff2, got ${woff2.join(", ")}`);
assert.equal(
  (await readFile(`dist/_astro/${woff2[0]}`)).length,
  43220,
  "Switzer variable woff2 must stay the unmodified Fontshare file",
);
for (const path of [
  "index.html",
  "o-mnie/index.html",
  "konsultacje/index.html",
  "ebooki/index.html",
  "ui/index.html",
  "static/index.html",
  "blog/index.html",
  "odstapienie/index.html",
]) {
  const html = await readFile(`dist/${path}`, "utf8");
  assertRobots(html, path);
  assertOneHeading(html, path);
  if (path === "static/index.html")
    assert(!html.includes("<script"), "static primitives emit JS");
}
const filesWithoutEnglish = await assertEnglishDisabled();
const collectionHtml = await readFile("dist/ebooki/index.html", "utf8");
assert.match(collectionHtml, /class="ebooks3a"/);
assert.doesNotMatch(collectionHtml, checkoutReceipt);
const ebookSlugs = (await directoryNames("dist/ebooki")).filter(
  (name) => name !== "kategoria",
);
assert(ebookSlugs.length >= 1, "ebooks: expected at least one landing");
for (const slug of ebookSlugs) {
  const filePath = `ebooki/${slug}/index.html`;
  const html = await readFile(`dist/${filePath}`, "utf8");
  assert.match(
    collectionHtml,
    new RegExp(`/ebooki/${slug}/`),
    `${filePath}: collection must link the built landing`,
  );
  assert.match(html, /class="ebook3a"/, filePath);
  assertRobots(html, filePath);
  assertOneHeading(html, filePath);
  assert.doesNotMatch(html, checkoutReceipt, filePath);
}
for (const topic of await directoryNames("dist/ebooki/kategoria")) {
  const filePath = `ebooki/kategoria/${topic}/index.html`;
  const html = await readFile(`dist/${filePath}`, "utf8");
  const input = inputWithValue(html, topic);
  assert.ok(input, `${filePath}: missing value="${topic}"`);
  assert.match(
    input,
    /\schecked(?:\s|=|>)/,
    `${filePath}: ${topic} is not selected`,
  );
  assertRobots(html, filePath);
  assertOneHeading(html, filePath);
}
const blogHtml = await readFile("dist/blog/index.html", "utf8");
assert.match(blogHtml, /class="blog3a"/);
assert.match(blogHtml, /id="latest-title"/);
// Posts are published by hand in Sanity, so a live build has no fixed count.
// Pagination must match the article pages that were actually built.
const blogEntries = await readdir("dist/blog", { withFileTypes: true });
const articleSlugs = [];
for (const entry of blogEntries) {
  if (!entry.isDirectory() || ["strona", "kategoria"].includes(entry.name))
    continue;
  const html = await readFile(
    `dist/blog/${entry.name}/index.html`,
    "utf8",
  ).catch(() => "");
  if (/article3a/.test(html)) articleSlugs.push(entry.name);
}
const postCount = articleSlugs.length;
assert(postCount >= 1, "blog: expected at least one article page");
const rangeOf = (html, label) => {
  const match = html.match(/Wpisy (\d+)–(\d+) z (\d+)/);
  if (!match) return null;
  const [start, end, total] = match.slice(1).map(Number);
  assert.equal(total, postCount, `${label}: total matches built articles`);
  assert(start <= end, `${label}: range ${start}–${end}`);
  return { start, end };
};
let previousEnd = 1; // the latest post is featured above the list
let page = 1;
let html = blogHtml;
for (;;) {
  const label = page === 1 ? "blog" : `blog/strona/${page}`;
  if (page > 1) assert.doesNotMatch(html, /id="latest-title"/, label);
  const range = rangeOf(html, label);
  if (range) {
    assert.equal(range.start, previousEnd + 1, `${label}: range continues`);
    previousEnd = range.end;
  }
  const next = await readFile(
    `dist/blog/strona/${page + 1}/index.html`,
    "utf8",
  ).catch(() => null);
  if (!next) break;
  assert(range, `${label}: a next page needs a range label`);
  assert.match(html, new RegExp(`/blog/strona/${page + 1}/`), label);
  html = next;
  page += 1;
}
assert.equal(previousEnd, postCount, "blog: pages cover every built article");
for (const slug of articleSlugs) {
  const articlePage = await readFile(`dist/blog/${slug}/index.html`, "utf8");
  const articlePath = `blog/${slug}/index.html`;
  assertRobots(articlePage, articlePath);
  assertOneHeading(articlePage, articlePath);
  assert.match(
    articlePage,
    /"@type":"BlogPosting"/,
    `blog/${slug}: BlogPosting`,
  );
}
// Each category lists built articles or shows its empty state.
for (const category of await readdir("dist/blog/kategoria", {
  withFileTypes: true,
})) {
  if (!category.isDirectory()) continue;
  const categoryHtml = await readFile(
    `dist/blog/kategoria/${category.name}/index.html`,
    "utf8",
  );
  assert(
    articleSlugs.some((slug) => categoryHtml.includes(`/blog/${slug}/`)) ||
      /class="blog3a-empty"/.test(categoryHtml),
    `blog/kategoria/${category.name}: neither articles nor empty state`,
  );
}
const fixture = liveContent ? null : await loadFixtureOracle();
if (fixture) {
  assertCopy(collectionHtml, fixture.collectionTitle, "ebook collection title");
  assertCopy(collectionHtml, fixture.price, "ebook collection price");
  assertCopy(collectionHtml, fixture.collectionNote, "ebook collection note");
  for (const slug of fixture.ebookSlugs) {
    assert.match(
      collectionHtml,
      new RegExp(`/ebooki/${escapeRegExp(slug)}/`),
      `ebook collection links ${slug}`,
    );
  }
  const ebookHtml = await readFile(
    `dist/ebooki/${fixture.pcosSlug}/index.html`,
    "utf8",
  );
  assertCopy(ebookHtml, fixture.pcosPrice, "ebook price");
  assertCopy(ebookHtml, fixture.offerNote, "ebook offer note");
  assertCopy(blogHtml, fixture.blogTitle, "blog title");
  assertCopy(blogHtml, fixture.latestTitle, "blog latest title");
  assert.equal(postCount, fixture.articleCount);
  assert.ok(fixture.firstRange, "fixture blog range");
  assertCopy(blogHtml, fixture.firstRange, "blog range");
  assert.match(blogHtml, new RegExp(escapeRegExp(fixture.featuredSlug)));
  assert.doesNotMatch(
    blogHtml.split('id="wpisy"')[1] ?? "",
    new RegExp(escapeRegExp(fixture.featuredSlug)),
  );
  if (fixture.hasSecondPage) {
    assert.ok(fixture.secondRange, "fixture blog page 2 range");
    const blogPage2 = await readFile("dist/blog/strona/2/index.html", "utf8");
    assertCopy(blogPage2, fixture.secondRange, "blog page 2 range");
    assert.match(blogHtml, /\/blog\/strona\/2\//);
  }
  const articleHtml = await readFile(
    `dist/blog/${fixture.featuredSlug}/index.html`,
    "utf8",
  );
  assert.match(articleHtml, /article3a/);
  assertCopy(articleHtml, fixture.featuredTitle, "article title");
  assertCopy(articleHtml, fixture.tocLabel, "article toc");
  assert.match(articleHtml, /"@type":"FAQPage"/);
  const blogEmpty = await readFile(
    `dist/blog/kategoria/${fixture.emptyCategorySlug}/index.html`,
    "utf8",
  );
  assert.ok(
    blogEmpty
      .toLowerCase()
      .includes(fixture.emptyCategoryMessage.toLowerCase()),
    "empty category message",
  );
}
const homePl = await readFile("dist/index.html", "utf8");
assert.match(homePl, /class="home3a"/);
const socialNav =
  homePl.match(/class="ao-footer__social"[\s\S]*?<\/nav>/)?.[0] ?? "";
assert.match(socialNav, /href="https:\/\//, "/: social profile link");
for (const placeholder of [
  "https://www.instagram.com/",
  "https://www.facebook.com/",
  "https://www.tiktok.com/",
]) {
  assert.doesNotMatch(
    socialNav,
    new RegExp(`href="${placeholder.replaceAll("/", "\\/")}"`),
    `/: placeholder ${placeholder}`,
  );
}
const aboutHtml = await readFile("dist/o-mnie/index.html", "utf8");
assert.match(aboutHtml, /class="about3a"/);
assert.match(aboutHtml, /class="about3a-diploma"/);
const consultationHtml = await readFile("dist/konsultacje/index.html", "utf8");
assert.match(consultationHtml, /class="consult3a"/);

for (const path of [
  "polityka-prywatnosci/index.html",
  "lista-cookies-i-identyfikatorow/index.html",
  "regulamin/index.html",
  "regulamin-newslettera/index.html",
]) {
  const html = await readFile(`dist/${path}`, "utf8");
  assertRobots(html, path);
  assertOneHeading(html, path);
  assert.match(html, /legal3a/);
}
const privacyHtml = await readFile(
  "dist/polityka-prywatnosci/index.html",
  "utf8",
);
const termsHtml = await readFile("dist/regulamin/index.html", "utf8");
const cookiesHtml = await readFile(
  "dist/lista-cookies-i-identyfikatorow/index.html",
  "utf8",
);
if (fixture) {
  for (const href of fixture.socialHrefs) {
    assert.match(homePl, new RegExp(`href="${escapeRegExp(href)}"`), href);
  }
  assertCopy(homePl, fixture.heroLine, "home hero");
  assertCopy(aboutHtml, fixture.aboutLine, "about hero");
  assertCopy(consultationHtml, fixture.consultationLine, "consultation");
  assertCopy(privacyHtml, fixture.privacy.title, "privacy title");
  assertLegalVersion(privacyHtml, fixture.privacy, "privacy version");
  assertCopy(privacyHtml, fixture.privacy.toc[0].text, "privacy heading");
  assert.match(privacyHtml, /\/lista-cookies-i-identyfikatorow\//);
  assert.match(termsHtml, /<h2 id="pouczenie"/);
  assert.match(termsHtml, /<h2 id="formularz-odstapienia"/);
  assert.match(termsHtml, /href="\/regulamin\/#pouczenie"/);
  assertCopy(cookiesHtml, fixture.cookies.toc[0].text, "cookies heading");
  assert.match(cookiesHtml, /\/polityka-prywatnosci\//);
}
const sitemap = await readFile("dist/sitemap.xml", "utf8");
for (const loc of [
  "https://aleksandraolesiewicz.com/polityka-prywatnosci/",
  "https://aleksandraolesiewicz.com/lista-cookies-i-identyfikatorow/",
  "https://aleksandraolesiewicz.com/regulamin/",
  "https://aleksandraolesiewicz.com/regulamin-newslettera/",
]) {
  assert.match(sitemap, new RegExp(loc.replaceAll("/", "\\/")));
}
console.log(
  JSON.stringify(
    {
      gzipBytes: sizes,
      cssByTemplate: await checkCssBudgets(),
      staticPrimitivesScripts: 0,
      filesWithoutEnglish,
    },
    null,
    2,
  ),
);

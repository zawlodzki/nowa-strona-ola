import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

// Osobny artefakt feedbacku: tylko jawne publiczne pliki, bez builda Astro i CMS.
const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, "build/homepage-feedback");
const files = new Set();
const publicExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".svg",
  ".png",
  ".webp",
]);
for (const name of await readdir(resolve(root, "mockups/homepage"))) {
  if (publicExtensions.has(extname(name)))
    files.add(`mockups/homepage/${name}`);
}
for (const name of await readdir(resolve(root, "mockups/homepage/assets"))) {
  if ([".svg", ".png", ".webp"].includes(extname(name))) {
    files.add(`mockups/homepage/assets/${name}`);
  }
}
for (const file of [
  "src/assets/portraits/hero.webp",
  "src/assets/portraits/about.webp",
  "src/assets/portraits/contact.webp",
  "src/assets/brand/logo-wordmark.svg",
  "src/assets/brand/logo-monogram.svg",
  "src/assets/fonts/switzer/Switzer-Variable.woff2",
  "src/assets/fonts/switzer/FFL.txt",
  "archive/wonderful-design-system/tokens.css",
  "design-system/tokens.css",
])
  files.add(file);

// Nie publikuj paczki z brakującym albo niezatwierdzonym lokalnym zasobem.
for (const file of files) {
  if (![".html", ".css"].includes(extname(file))) continue;
  const source = await readFile(resolve(root, file), "utf8");
  const links =
    extname(file) === ".html"
      ? [...source.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1])
      : [...source.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(
          (match) => match[1],
        );
  for (const link of links) {
    if (/^(?:[a-z]+:|#)/i.test(link)) continue;
    const pathname = link.split(/[?#]/)[0];
    const target = relative(root, resolve(root, dirname(file), pathname));
    if (!files.has(target))
      throw new Error(`Niepubliczny lub brakujący zasób: ${file} → ${target}`);
  }
}
await rm(output, { recursive: true, force: true });
for (const file of files) {
  const target = resolve(output, file);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(root, file), target);
}
await writeFile(resolve(output, "robots.txt"), "User-agent: *\nDisallow: /\n");
await writeFile(
  resolve(output, "_redirects"),
  "/ /mockups/homepage/cherry-white.html 302\n/1a /mockups/homepage/wonderful-cherry.html 302\n",
);
await writeFile(
  resolve(output, "_headers"),
  `/*
  X-Robots-Tag: noindex, nofollow, noarchive
  X-Content-Type-Options: nosniff
  Referrer-Policy: same-origin
  Cache-Control: no-cache
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; font-src 'self'; style-src 'self'; script-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'self'; upgrade-insecure-requests
`,
);
console.log(
  `Feedback: ${files.size} publicznych plików + robots, nagłówki i przekierowania → ${relative(root, output)}`,
);

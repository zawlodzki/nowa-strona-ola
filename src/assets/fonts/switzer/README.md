# Switzer

Official, unmodified `Switzer-Variable.woff2` from Fontshare
(`https://api.fontshare.com/v2/fonts/download/switzer`, 2026-09-13).

License: [ITF Free Font License 2.0](./FFL.txt). Self-hosting with `@font-face`
is allowed. Do not subset, convert, rename metadata, or redistribute the font
files. Do not pipe this file through Astro `fontProviders` (it subsets).

Source: https://www.fontshare.com/fonts/switzer

## Obrazy OG (`og/`)

Official, unmodified static `Switzer-Regular.otf`, `Switzer-Semibold.otf`
and `Switzer-Bold.otf` from the same Fontshare package
(`Switzer_Complete/Fonts/OTF`, downloaded 2026-10-11; the package's
`Switzer-Variable.woff2` is byte-identical to the file above and its
`FFL.txt` is identical to [FFL.txt](./FFL.txt)).

Used only at build time by `src/lib/seo/og-card.ts` (satori) to render
share images, which FFL 2.0 §01 allows ("Digital Images", "Social Media").
They are read from disk, never imported into the bundle, so they do not
reach `dist/` and are not served to third parties (FFL §02). Satori does
not read WOFF2 or variable fonts, hence static OTF instead of a conversion.

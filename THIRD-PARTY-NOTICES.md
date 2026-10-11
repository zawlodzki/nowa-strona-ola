# Third-party notices

## Switzer

The site typeface is Switzer by Jérémie Hornus / Indian Type Foundry, self-hosted
from the official Fontshare package (`Switzer-Variable.woff2`, unmodified).
Source: https://www.fontshare.com/fonts/switzer
License: ITF Free Font License (FFL) Version 2.0 — 17 Aug 2026.
Full text: `src/assets/fonts/switzer/FFL.txt`.

Self-hosting with CSS `@font-face` is permitted. Subsetting, format conversion
and redistribution of the font files are not.

Share images (`/og/*.png`) are rendered at build time with the official,
unmodified static `Switzer-Regular.otf`, `Switzer-Semibold.otf` and
`Switzer-Bold.otf` from the same package (`src/assets/fonts/switzer/og/`,
2026-10-11). FFL §01 permits use in digital images and social media; the OTF
files are read from disk during the build and are not deployed or served.

## satori and resvg-js

Build-time share images use [satori](https://github.com/vercel/satori)
(Vercel) and [@resvg/resvg-js](https://github.com/yisibl/resvg-js), both under
the Mozilla Public License 2.0 (https://mozilla.org/MPL/2.0/). They are
development dependencies, unmodified, and are not shipped to visitors.

## Gambarino

Wordmarki w `src/assets/brand/` powstały z Gambarino Regular (Théo Guillard /
Indian Type Foundry) z oficjalnego pakietu Fontshare. Źródło:
https://www.fontshare.com/fonts/gambarino
Licencja: ITF Free Font License (FFL) Version 2.0 — 17 Aug 2026 (ta sama treść
co `src/assets/fonts/switzer/FFL.txt`).

Pliki fontu nie są hostowane w repo. SVG zawiera obrysy glifów, nie osadzony
font. FFL zezwala na tworzenie logo i znaków słownych.

## bejamas/ui

Button, Input, Label and Dialog in src/ui were adapted from the public registry
on 2026-09-12. Source URLs and SHA-256 hashes: docs/bejamas-sources.json.
Changes: removed documentation demos, local token mapping and styling, replaced
the dialog icon with a text glyph. Further fixes are described in docs/UI-SPIKE-RESULTS.md.

MIT License

Copyright (c) 2025 Bejamas Group sp. z o. o.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

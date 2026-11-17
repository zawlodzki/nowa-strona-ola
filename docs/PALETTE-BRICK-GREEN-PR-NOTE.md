# Notatka do PR: paleta „Cegła i zieleń · oszczędna”, 16.11.2026

Dla Grzegorza. Ola nie ma na swoim komputerze dostępu do GitHuba, więc zmiany
leżą niezacommitowane w jej folderze projektu na Dysku Google. Prośba
o wystawienie PR. Nic nie zostało zacommitowane ani wypchnięte.

## Decyzja

Ola wybrała 16.11.2026 paletę „Cegła i zieleń · oszczędna · tło #fffffc”
z przymiarki kolorów (sesje 19.10–16.11.2026). Zastępuje biel, wiśnię, róż
i matchę z 07.10.2026. Zakres: tylko kolory. Kształt i układ komponentów
zostają bez zmian.

## Uwaga przed commitem

- Folder Oli może być starszy niż `main`. Ostatni wpis w jej lokalnym
  `docs/PROGRESS.md` przed tą sesją pochodzi z 15.10.2026, a historia zawiera
  commity do #134. Zmiany przygotowano na stanie plików z folderu, więc przed PR
  trzeba je przenieść na aktualny `main` i ponowić `npm run verify`.
- `git status` w folderze pokazuje wiele plików `M` w `.agents/` i `.claude/`.
  To nie są zmiany tej sesji. Do PR należą wyłącznie pliki z listy poniżej.

## Pliki tej zmiany

- `design-system/tokens.json`, `design-system/tokens.css` (wygenerowany)
- `design-system/SPECIFICATION.md`, `design-system/COMPONENTS.md`, `DESIGN.md`
- `src/design-system/global.css`, `src/styles/global.css`
- `src/design-system/decorations/EbookProblemVisual.astro`
- `src/views/CheckoutPage.astro`, `src/views/Consultation3a.astro`,
  `src/views/Ebook3a.astro`
- `src/lib/seo/og-card.ts`, `src/pages/design-system.astro`
- `scripts/check-tokens.mjs`, `tests/unit/tokens.test.ts`
- `tests/e2e/checkout.spec.ts`, `tests/e2e/css-practices.spec.ts`,
  `tests/e2e/design-system-3a.spec.ts`, `tests/e2e/ebook-cover-polish.spec.ts`,
  `tests/e2e/matcha-accent-3a.spec.ts`, `tests/e2e/sticky-navigation-3a.spec.ts`
- `docs/HOMEPAGE-CMS-CONFIG.md`, `docs/PROGRESS.md`, ta notatka

## Co się zmieniło

Wartości light z makiety: tło #fffffc, tekst #6b2320, tekst pomocniczy #7a5a4f,
linie #f1e0d8, brzoskwinia #fcefe8, cegła #99312f, zieleń #7ec850.

- Nowe tokeny `cta` (#7ec850) i `on-cta` (#16300a). Primary button, CTA
  w nagłówku, badge i numery etapów konsultacji używają ich zamiast `primary`.
- `accent` na jasnym tle to cegła #99312f, bo zieleń ma na #fffffc kontrast
  2,0 : 1. Dotyczy secondary buttona, TextLinka i drobnych akcentów tekstowych.
- `accent-on-primary` i `accent-on-light` to zieleń #7ec850, tylko w dekoracjach.
  Znak cudzysłowu w opiniach przeszedł z `accent` na `accent-on-light`.
- Panel cross-sell w koszyku ma zielone tło, a przyciski w nim są ceglane
  (nadpisanie `--ao-cta` obok istniejącego nadpisania `--ao-primary`).
- Karta Open Graph: cegła, #fffffc i zieleń.
- Tło okna dialogowego: `rgb(40 14 10 / 0.45)`.

## Odstępstwa od makiety, do oceny

- `on-cta` to #16300a, a nie #1d3a0c z makiety. Z #1d3a0c axe zgłaszał kontrast
  4,3 : 1 na przycisku w stanie hover (opacity 0.85) w `contact-3a.spec.ts`.
  Po zmianie jest 4,9 : 1.
- Motyw dark, `stage-alt` (#f1e0d8) i `cover-spine` (#f0d3c9) nie były w makiecie.
  Wartości dobrano przy wdrożeniu w tej samej barwie. Ola ich jeszcze nie oceniła.
- Makieta miała ceglany pas z licznikiem, ceglany newsletter i ciemną stopkę.
  Na stronie te sekcje mają jasne tło i tak zostają. Decyzja Oli z 16.11.2026:
  zostawić jasne.

## Nazwy

Identyfikatory `cherry3a`, `ao-book-cover--cherry`, `CherryCoverAccent`
i plik `matcha-accent-3a.spec.ts` zostały bez zmian, żeby PR dotyczył kolorów.

## Podgląd

Zrzuty zbudowanej strony: https://claude.ai/artifact/GCHHB3VGZg73oBe6yBFPYD
(prywatny artefakt Oli; wymaga udostępnienia z menu Share).

## Kontrole

Wyniki są w `docs/PROGRESS.md`, sekcja „Paleta cegła i zieleń, 16.11.2026”.

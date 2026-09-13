# Nowa strona — Astro i Sanity

Fundament strony nowej marki: landing page’e, blog i formularze leadowe, w językach
polskim i angielskim. Publiczny serwis będzie statyczny, z HTML i Markdown,
hostingiem Cloudflare Workers Static Assets i edycją przez Sanity.

## Dokumentacja

- [Plan wdrożenia i kryteria odbioru](docs/IMPLEMENTATION-PLAN.md)
- [Aktualny postęp i następny krok](docs/PROGRESS.md)
- [Zasady weryfikacji kodu](docs/CODE-QUALITY.md)
- [Wyniki próby Bejamas](docs/UI-SPIKE-RESULTS.md)
- [Instrukcje pracy w repo](AGENTS.md)
- [Design system](wonderful-design-system/README.md)
- [Interaktywny katalog](wonderful-design-system/index.html)

## Stan projektu

Działa lokalny prototyp Astro z komponentami Bejamas dostosowanymi do Wonderful.
Strony: `/` (PL), `/en/` (EN), `/static/` (kontrola bez JavaScriptu).
Formularz nic nie wysyła. Sanity, Workery, n8n i c15t nie są jeszcze zintegrowane.
Nie publikować prototypu: noindex nie zastępuje ochrony stagingu.

## Uruchomienie i weryfikacja

Node 24 według `.node-version`, npm oraz jeden `package-lock.json`.

```sh
npm ci
npx playwright install
npm run build
npm run preview
```

Podgląd lokalny: `http://127.0.0.1:4321`. Praca nad kodem: `npm run dev`.
Astro 7 w środowisku agenta może uruchomić CLI preview w tle; testy używają
osobnego kontrolowanego procesu `scripts/preview-test.mjs`.

```sh
npm run verify
```

Verify obejmuje format, lint, typy, unit tests, build, budżety artefaktów i E2E
w trzech przeglądarkach. `npm run format` jawnie formatuje kod. Samo
`npm run test:e2e` wymaga aktualnego buildu. CI jest skonfigurowane, ale nie było
jeszcze uruchomione na GitHub (brak remote).

n8n i self-hostowane c15t będą dostarczone poza repo. Tutaj powstaną integracje,
formularze i panel zgód dopasowany do design systemu.

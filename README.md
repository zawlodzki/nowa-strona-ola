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
Repo jest workspace’em npm: frontend pozostaje w katalogu głównym, osobne aplikacje
znajdują się w `studio/`, `preview/` i `worker/`, a wspólne kontrakty w
`packages/shared/`.
Strony: `/` (PL), `/en/` (EN), `/static/` (kontrola bez JavaScriptu).
Formularz nic nie wysyła. Studio zawiera minimalny model strony, a frontend pobiera
opublikowaną treść z Sanity po ustawieniu konfiguracji. Bez niej build korzysta
z jawnych danych demonstracyjnych. Worker pozostaje szkieletem bez kolejek, n8n
i c15t. Nie publikować prototypu: noindex nie zastępuje ochrony stagingu.

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
npm run dev:studio
npm run dev:preview
npm run dev:worker
npm run types --workspace @ola/worker
npm run types --workspace @ola/preview
npm run build:workspaces
```

Studio odczytuje `SANITY_STUDIO_PROJECT_ID` i opcjonalne
`SANITY_STUDIO_DATASET` zgodnie z `studio/.env.example`. Wartość zastępcza służy
wyłącznie do lokalnej kontroli buildu. Frontend odczytuje parę
`PUBLIC_SANITY_PROJECT_ID` i `PUBLIC_SANITY_DATASET` zgodnie z `.env.example`;
ustawienie tylko jednej wartości zatrzymuje build. Klient produkcyjnego buildu
używa perspektywy `published`, bez CDN i bez tokenu. Po zmianie schematów lub GROQ
uruchomić `npm run typegen --workspace @ola/studio`. Po zmianie
`worker/wrangler.jsonc` ponownie wygenerować i zapisać typy Workera.

Podgląd działa jako osobne Astro SSR na porcie 4322 i korzysta ze wspólnego
renderera hero oraz komponentów frontendu. `preview/.dev.vars.example` wymienia
dwa sekrety wymagane lokalnie: token Sanity Viewer i losowy sekret sesji mający
co najmniej 32 znaki. Produkcyjnie oba należy dodać jako sekrety Workera, nigdy
do repozytorium. Dostęp aktywuje wyłącznie sekret wygenerowany przez Sanity
Presentation; sesja jest podpisana, wygasa po godzinie i ma cookie HttpOnly.

```sh
npm run verify
```

Verify obejmuje format, lint, typy wszystkich workspace’ów, build frontendu,
Studio i Workera, unit tests, budżety artefaktów i E2E w trzech przeglądarkach.
`npm run format` jawnie formatuje kod. Samo
`npm run test:e2e` wymaga aktualnego buildu. CI jest skonfigurowane; wynik jego
pierwszego uruchomienia na GitHub wymaga osobnego sprawdzenia.

n8n i self-hostowane c15t będą dostarczone poza repo. Tutaj powstaną integracje,
formularze i panel zgód dopasowany do design systemu.

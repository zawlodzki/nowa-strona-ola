# Nowa strona — Astro i Sanity

Fundament strony nowej marki: landing page’e, blog i formularze leadowe, w językach
polskim i angielskim. Publiczny serwis będzie statyczny, z HTML i Markdown,
hostingiem Cloudflare Workers Static Assets i edycją przez Sanity.

## Lista wszystkich wpisów bloga 3a — 2026-10-07

[Otwórz indeks bloga](mockups/homepage/blog-3a.html): najnowszy wpis nad dwoma kolumnami,
sześć kart na podstronę, działająca paginacja i newsletter. Druga podstrona
pokazuje kolejne cztery wpisy. Na mobile jedna kolumna; paginacja działa bez JS.
Jedenaście przykładowych wpisów, istniejące obrazy 3a, formularz demonstracyjny.
Bez konfiguracji CMS i wysyłania danych.

Sprawdzony lokalny podgląd: `node scripts/preview-homepage-mockups.mjs`,
[blog 3a](http://127.0.0.1:8766/mockups/homepage/blog-3a.html).

## Dokumentacja

- [Plan wdrożenia i kryteria odbioru](docs/IMPLEMENTATION-PLAN.md)
- [Aktualny postęp i następny krok](docs/PROGRESS.md)
- [Treści i decyzje do konfiguracji homepage w CMS](docs/HOMEPAGE-CMS-CONFIG.md)
- [Zasady weryfikacji kodu](docs/CODE-QUALITY.md)
- [Konfiguracja wdrożeń Cloudflare](docs/CLOUDFLARE-DEPLOYMENT.md)
- [Wyniki próby Bejamas](docs/UI-SPIKE-RESULTS.md)
- [Instrukcje pracy w repo](AGENTS.md)
- [Docelowy design system 3a](design-system/README.md)
- [Katalog komponentów 3a](src/pages/design-system.astro) — `/design-system/`

## Stan projektu

Działa lokalny prototyp Astro z komponentami Bejamas dostosowanymi do Wonderful.
Repo jest workspace’em npm: frontend pozostaje w katalogu głównym, osobne aplikacje
znajdują się w `studio/`, `preview/` i `worker/`, a wspólne kontrakty w
`packages/shared/`.
Strony: `/` (PL), `/en/` (EN), `/ui/` i `/en/ui/` (katalog komponentów),
`/static/` (kontrola bez JavaScriptu).
Formularz nic nie wysyła. Studio zawiera minimalny model strony, a frontend pobiera
opublikowaną treść z Sanity po ustawieniu konfiguracji. Bez niej build korzysta
z jawnych danych demonstracyjnych. Lokalny projekt Sanity `dyuqkn8c` (dataset
`production`) jest utworzony; sekrety pozostają w ignorowanych plikach środowiska.
Worker pozostaje szkieletem bez kolejek, n8n
i c15t. Nie publikować prototypu: noindex nie zastępuje ochrony stagingu.

## Mockupy docelowej strony głównej

Trzy kierunki estetyki dla Aleksandry Olesiewicz: Wonderful, botaniczny magazyn
oraz wiśniowa energia, a także warianty 2a i 3a z białym tłem
oraz 1a łączący Wonderful z paletą 3a.
Wersje 2/2a i 3/3a mają wordmarki dopasowane do ich typografii.
[Opis i pliki HTML](mockups/homepage/README.md).
Lokalny podgląd (sprawdzone na Node 24):

```sh
node scripts/preview-homepage-mockups.mjs
```

[Porównanie kierunków lokalnie](http://127.0.0.1:8766/mockups/homepage/index.html).
Publiczny feedback: [wszystkie makiety](https://design.aleksandraolesiewicz.com/)
i [wersja 1a](https://design.aleksandraolesiewicz.com/1a).
Publikacja jest odseparowana od strony i CMS; [opis i komendy](mockups/homepage/README.md#publiczny-feedback).
Mockupy są osobne od aplikacji i CMS; formularz nic nie wysyła.
Opublikowane warianty zawierają poprawki po Impeccable: SVG strzałek,
wybór grup PCOS / Perimenopauza i rozróżnione tematycznie okładki.

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
npm run deploy:studio
```

Hostowane Studio: `https://studio.aleksandraolesiewicz.com`. Build hostowany
wymaga `SANITY_STUDIO_PREVIEW_ORIGIN=https://preview.aleksandraolesiewicz.com`.
Studio odczytuje `SANITY_STUDIO_PROJECT_ID` i opcjonalne
`SANITY_STUDIO_DATASET` zgodnie z `studio/.env.example`. Wartość zastępcza służy
wyłącznie do lokalnej kontroli buildu. Frontend odczytuje parę
`PUBLIC_SANITY_PROJECT_ID` i `PUBLIC_SANITY_DATASET` zgodnie z `.env.example`;
ustawienie tylko jednej wartości zatrzymuje build. Klient produkcyjnego buildu
używa perspektywy `published`, bez CDN i bez tokenu. Po zmianie schematów lub GROQ
uruchomić `npm run typegen --workspace @ola/studio`. Po zmianie
`worker/wrangler.jsonc` ponownie wygenerować i zapisać typy Workera.
Worker przyjmuje podpisane zdarzenia publikacji Sanity pod `/webhooks/sanity`,
grupuje je w Cloudflare Queue i wyzwala jeden chroniony endpoint builda na batch.
Lokalne nazwy sekretów znajdują się w `worker/.dev.vars.example`; szczegóły
payloadu i konfiguracji opisuje instrukcja Cloudflare.

Podgląd działa jako osobne Astro SSR na porcie 4322 i korzysta ze wspólnego
renderera hero oraz komponentów frontendu. `preview/.dev.vars.example` wymienia
konfigurację i dwa sekrety wymagane lokalnie: token Sanity Viewer i losowy sekret
sesji mający co najmniej 32 znaki. Produkcyjnie wartości należy dodać jako sekrety
Workera, nigdy do repozytorium. Dostęp aktywuje wyłącznie sekret wygenerowany przez
Sanity Presentation; sesja jest podpisana, wygasa po godzinie i ma cookie HttpOnly.
Deklaratywne konfiguracje `staging` i `production` opisuje
[instrukcja Cloudflare](docs/CLOUDFLARE-DEPLOYMENT.md).

```sh
npm run verify
npm run import:homepage
npm run import:consultation
npm run import:ebook
npm run import:blog-collection
npm run import:legal
```

Verify obejmuje format, zgodność tokenów, lint, typy wszystkich workspace’ów, build frontendu,
Studio i Workera, unit tests, budżety artefaktów i E2E w trzech przeglądarkach.
`npm run import:homepage` robi dry-run szkiców homepage 3a do `reports/` i nic
nie zapisuje do Content Lake. `npm run import:consultation` robi to samo dla
landingu konsultacji (`page-consultation-pl/en`); `npm run import:ebook` dla
dokumentu `ebook-suplementy-w-pcos-*`. `npm run import:blog-collection` robi
dry-run 34 dokumentów (`article`, `category`, `siteSettings.blogIndex` /
`blogNewsletter`) do `reports/`; nic nie zapisuje.
`npm run import:legal` robi dry-run sześciu dokumentów `legalPage` (cztery PL
ze źródła zawlodzki.pl i dwa EN z informacją o wiążącej wersji polskiej) do
`reports/`; nic nie zapisuje. Flaga `--write` kończy się kodem 2.
`npm run format` jawnie formatuje kod. Samo
`npm run test:e2e` wymaga aktualnego buildu. CI jest skonfigurowane; wynik jego
pierwszego uruchomienia na GitHub wymaga osobnego sprawdzenia.

n8n i self-hostowane c15t będą dostarczone poza repo. Tutaj powstaną integracje,
formularze i panel zgód dopasowany do design systemu.

Mockup artykułu 3a: `node scripts/preview-homepage-mockups.mjs`, następnie
`http://127.0.0.1:8766/mockups/homepage/article-3a.html`.
[Instrukcja konfiguracji bloga w CMS](docs/BLOG-CMS-CONFIG-3A.md).

Mockup landingu e-booka 3a: `node scripts/preview-homepage-mockups.mjs`, następnie
`http://127.0.0.1:8766/mockups/homepage/ebook-3a.html`.
[Instrukcja osobnej kolekcji e-booków w CMS](docs/EBOOK-CMS-CONFIG-3A.md).

Mockup strony „O mnie” 3a: `node scripts/preview-homepage-mockups.mjs`, następnie
`http://127.0.0.1:8766/mockups/homepage/about-3a.html`.
[Opis układu i copy](docs/ABOUT-MOCKUP-PLAN-3A.md),
[ocena E-E-A-T](docs/ABOUT-EEAT-3A.md).

Mockup pojedynczej konsultacji 3a: `node scripts/preview-homepage-mockups.mjs`, następnie
`http://127.0.0.1:8766/mockups/homepage/consultation-3a.html`.
[Copy, zakres i mapowanie CMS](docs/CONSULTATION-CMS-CONFIG-3A.md).

Mockup kolekcji e-booków 3a z wyborem kategorii:
`node scripts/preview-homepage-mockups.mjs`, następnie
[otwórz kolekcję lokalnie](http://127.0.0.1:8766/mockups/homepage/ebooks-3a.html).
Sześć zapowiedzi, Wszystkie / PCOS / Perimenopauza; ręczne filtrowanie działa
również bez JS. [Opis](mockups/homepage/README.md#kolekcja-wszystkich-e-booków-3a--2026-10-07).

## Ujednolicenie serii 3a — 2026-10-07

Osiem lokalnych widoków współdzieli `mockups/homepage/3a-shared.css`:
responsywny header, newsletter, stopkę i reguły reflow. Jasna okładka produktu
jest używana także na jego landingu. Globalne menu i stopki prowadzą do pełnych
podstron. Landingi zachowują menu sekcji oraz własne CTA.

Sprawdzony podgląd z katalogu repo: `node scripts/preview-homepage-mockups.mjs`,
adres `http://127.0.0.1:8766/mockups/homepage/cherry-white.html`.
To aktualizacja lokalnych mockupów; publikacja i migracja Astro/Sanity są osobne.

## Docelowy kierunek — 3a (07.10.2026)

Zatwierdzono realizację 3a; pozostałe warianty są porzucone. Wonderful zachowano
w [archiwum](archive/wonderful-design-system/README.md), nie będzie implementowany.
Aktywne tokeny: `design-system/tokens.json`; `npm run tokens:generate` aktualizuje
CSS, `npm run tokens:check` sprawdza zgodność. Komponenty i Layout3a są w
`src/design-system`. Instrukcja migracji w [systemie](design-system/README.md).

`npm run dev` lub po buildzie `npm run preview` udostępnia katalog pod
`http://127.0.0.1:4321/design-system/`. Dotychczasowe `/ui/` i szablony aplikacji
są przejściowe; sama biblioteka nie oznacza migracji wszystkich stron i Sanity.

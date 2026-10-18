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
- [Integracja Turnstile i kolejność uruchomienia](docs/TURNSTILE-ROLLOUT.md)
- [Konfiguracja wdrożeń Cloudflare](docs/CLOUDFLARE-DEPLOYMENT.md)
- [Kopia i odtworzenie Sanity](docs/SANITY-BACKUP-RESTORE.md)
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
wybór grup PMOS (PCOS) / Perimenopauza i rozróżnione tematycznie okładki.

## Uruchomienie i weryfikacja

Ocena [zgodności Turnstile i n8n](docs/TURNSTILE-ASSESSMENT-2026-10-14.md),
14.10.2026. Sprawdzone na Node 26.11.0, bez wysyłki zgłoszeń:

```sh
npm run build
export VERIFY_RUN_ID="ola-turnstile-20261014"
node .cursor/skills/verify-ola/scripts/verify.mjs launch
node .cursor/skills/verify-ola/scripts/verify.mjs browser start
node .cursor/skills/verify-ola/scripts/verify.mjs doctor
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /kontakt/
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Wyślij wiadomość" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs cleanup
```

Odbiór okładek e-booków sprawdzony 17.10.2026 na Node 24.21.0.
Po uruchomieniu własnej sesji powyższym helperem:

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Zobacz wszystkie e-booki"
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Suplementy w PMOS (PCOS)" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
```

Oczekiwane POST to `[]`. Przy budowaniu z rzeczywistym Content Lake wymagany
jest także publiczny `PUBLIC_TURNSTILE_SITEKEY`; podgląd z fixture’ów
nie wymaga tego klucza. Wyniki odbioru okładek są w
[postępie](docs/PROGRESS.md).

Regresja warstw badge matcha i cienia okładek, sprawdzona 17.10.2026
na aktualnym buildzie fixture, Node 24.21.0:

```sh
npx playwright test tests/e2e/ebook-cover-polish.spec.ts --project chromium
```

POST `[]` po wysłaniu pustego formularza. To wynik oceny z 14.10; Turnstile
opublikowano 15.10.2026, zgodnie z [protokołem](docs/TURNSTILE-ROLLOUT.md).

Node 24 według `.node-version`, npm oraz jeden `package-lock.json`.

```sh
npm ci
npx playwright install
npm run build
npm run preview
```

Podgląd lokalny: `http://127.0.0.1:4321`. Praca nad kodem: `npm run dev`.

Podgląd szkiców SSR, sprawdzony 12.10.2026 na Node 24.19.0 i Workerd.
`preview/.dev.vars` zawiera istniejący token odczytu Sanity i sekret sesji.
Domena Studio jest jawnym `STUDIO_ORIGIN` w konfiguracji Wranglera,
osobno dla pracy lokalnej i produkcji. Stary sekret `SANITY_STUDIO_URL`
nie jest już używany przez aplikację.

```sh
CLOUDFLARE_ENV=production npm run build --workspace @ola/preview
cp preview/.dev.vars preview/dist/server/.dev.vars
chmod 600 preview/dist/server/.dev.vars
npx wrangler dev --config preview/dist/server/wrangler.json --port 4432 --inspector-port 9432
```

W osobnym terminalu, z katalogu repo:

```sh
npx tsx scripts/check-preview-runtime.ts
npx wrangler deploy --config preview/dist/server/wrangler.json --dry-run
```

Skrypt sprawdza lokalny SSR z Content Lake, odmowę dostępu bez sesji,
odrzucenie aktywacji bez sekretu oraz prywatne nagłówki i osadzanie.
Nie zapisuje danych ani nie wysyła formularzy. Integracja Visual Editing
jest ładowana tylko przez aplikację `preview/`. Workflow
`.github/workflows/deploy-preview.yml` aktualizuje produkcyjny podgląd
po udanym Quality dla bieżącego `main`. `CLOUDFLARE_ENV` zostaw tylko
przy buildzie podglądu.

IndexNow jest przygotowany do uruchomienia dopiero dla gotowej, indeksowalnej
produkcji. Domyślny `npm run indexnow` wykonuje dry-run; bez konfiguracji
kończy się `skipped`, bez połączeń. Wyłączone warianty sprawdzono również
przez `npm run indexnow -- --send` i `--capture-previous`. Instrukcja
konfiguracji, zgłoszenia usunięć i ponowień: [IndexNow](docs/INDEXNOW-DEPLOYMENT.md).
W tej sesji nie uruchamiano prawdziwej wysyłki ani deployu.

Eksporty pełnej treści: `/blog/rss.xml` zawiera lead i pełny HTML artykułów,
a `/llms-full.txt` łączy Markdown głównej, O mnie, konsultacji, kolekcji
i landingów e-booków. Oba pliki korzystają z tego samego spisu co `.md`
i sitemap. `npm run test:build` sprawdza zgodność eksportu, a E2E parsuje XML RSS.

Odczyt i build opublikowanych danych Sanity bez zapisu, sprawdzony 12.10.2026:

```sh
PUBLIC_SANITY_PROJECT_ID=dyuqkn8c PUBLIC_SANITY_DATASET=production npx astro build --outDir /tmp/ola-exports-live-dist
node scripts/check-seo.mjs /tmp/ola-exports-live-dist
```

SEO (plan: [SEO-GEO-AEO-PLAN.md](docs/SEO-GEO-AEO-PLAN.md)): każdy build jest
`noindex`, dopóki nie ustawi się `SITE_INDEXING=production`. Zmienną ustawia
się wyłącznie w buildzie gotowej produkcji. `npm run test:build` uruchamia
`scripts/check-seo.mjs` (canonical, Open Graph, robots, graf JSON-LD). Kontrola
trybu produkcyjnego bez nadpisywania `dist/`:

```sh
SITE_INDEXING=production npx astro build --outDir /tmp/dist-indexing
SITE_INDEXING=production node scripts/check-seo.mjs /tmp/dist-indexing
```

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
cd studio
npx sanity deploy --external --url https://studio.aleksandraolesiewicz.com --yes --schema-required
```

Konfiguracja Studio zawiera `sanity-plugin-table-of-contents` 2.0.0 i
`sanity-plugin-media` 6.3.5. Spis treści obejmuje dokumenty `article`, `page`
i `legalPage`, pola `body` i `sections`. Inspektor ma nazwę **Table of Contents**.
Panel **Do uzupełnienia** obejmuje `article` i `legalPage`.
Zbiera znaczniki `[[TODO: czego brakuje]]` z pola `body` i pokazuje ostrzeżenie przy publikacji.
Biblioteka **Media** dodaje narzędzie Studio oraz źródło wyboru obrazów i plików.
Techniczne typy `media.tag` i `media.folder` nie pojawiają się na liście Treści.

Lokalny panel uruchamia sprawdzone `npm run dev:studio` pod
`http://localhost:3333`. Lokalna instalacja pluginów nie aktualizuje hostowanego
Studio. Scalenie do `main` wdraża panel automatycznie przez
`deploy-studio.yml` po zielonym Quality.

Hostowane Studio: `https://studio.aleksandraolesiewicz.com`. Build hostowany
wymaga `SANITY_STUDIO_PREVIEW_ORIGIN=https://preview.aleksandraolesiewicz.com`.
Studio odczytuje `SANITY_STUDIO_PROJECT_ID` i opcjonalne
`SANITY_STUDIO_DATASET` zgodnie z `studio/.env.example`. Wartość zastępcza służy
wyłącznie do lokalnej kontroli buildu. Frontend odczytuje parę
`PUBLIC_SANITY_PROJECT_ID` i `PUBLIC_SANITY_DATASET` zgodnie z `.env.example`;
ustawienie tylko jednej wartości zatrzymuje build. Formularze wysyłają POST JSON
na produkcyjny webhook n8n; opcjonalne `PUBLIC_LEAD_WEBHOOK_URL` (https) zmienia
go podczas builda. Lokalnie nie wysyłaj poprawnych danych bez osobnego webhooka
testowego. Klient produkcyjnego buildu
używa perspektywy `published`, bez CDN i bez tokenu. Po zmianie schematów lub GROQ
uruchomić `npm run typegen --workspace @ola/studio`. Po zmianie
`worker/wrangler.jsonc` ponownie wygenerować i zapisać typy Workera.

Sanity Studio i Vision: 6.18.0; klient: 8.9.0; GROQ: 6.18.0.
Wyniki aktualizacji, ograniczenia E2E i uzasadnienie pozostałych zgłoszeń audytu:
[postęp z 08.10.2026](docs/PROGRESS.md#aktualizacja-sanity--08102026).

Automatyczne aktualizacje Sanity są włączone w konfiguracji CLI. Workflow
`Deploy Studio` wdraża sprawdzony commit po udanym `Quality` na `main`, następnie
rejestruje zewnętrzny panel i schematy w Sanity. Pierwszy deploy wymaga scalenia
workflow i kompletu sekretów środowiska `production`, w tym `SANITY_AUTH_TOKEN`.
[Konfiguracja i ponawianie wdrożenia](docs/CLOUDFLARE-DEPLOYMENT.md#automatyczne-aktualizacje-i-wdrożenia-studio).

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

Jeśli środowisko ma systemowe Chromium, można użyć go bez pobierania nowego:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --project=chromium --workers=2
```

Sprawdzone w audycie CSS 08.10.2026. To kontrola Chromium; pełne `verify`
nadal wymaga Firefox i WebKit. `PLAYWRIGHT_WORKERS=2` ogranicza równoległość
Playwright również przy uruchomieniu verify. Porównanie fixture/Content Lake
honoruje ten sam wybór Chromium. Serwery developerskie działają dla
oddzielnych tras legal i legacy: `npm run dev:web -- --port 4330`.

Sprawdzona 11.10.2026 pełna kontrola na Node 24.19.0:

```sh
PLAYWRIGHT_WORKERS=2 npm run verify
```

Końcowa kontrola integracji c15t 11.10.2026 przeszła 280 testów jednostkowych
i 393 E2E w trzech przeglądarkach.
`tests/e2e/theme-preference.spec.ts` sprawdza zapis motywu, przejście
linkiem, reload, inicjalizację przed body i blokadę storage. Preferencja
`ao-theme` jest lokalna dla originu. [Plan GTM i c15t](docs/GTM-C15T-DEPLOYMENT-PLAN.md)
opisuje zakres i bramki pomiaru. Produkcyjny c15t i GTM są wdrożone
od 13.10.2026; GTM 5 rozpoznaje pięć kodów źródła AI. Odbiór oraz dowody są w
[postępie](docs/PROGRESS.md).

Kontrola GTM z 12.10.2026 na Node 24.19.0: `npm run verify` przeszło
383 unit, 456 E2E i 88 dokumentów CMS. Dziewięć scenariuszy wymagających
włączonego loadera przeszło osobno w trzech silnikach, z atrapami c15t/GTM
oraz blokadą produkcyjnej telemetrii i webhooka. Sprawdzone polecenia:

```sh
PUBLIC_GTM_ENABLED=true npm run build
E2E_GTM_ENABLED=true npx playwright test tests/e2e/consent.spec.ts --grep 'GTM rollout'
```

Po tej kontroli przywróć domyślny artefakt przez `npm run build`. Eksport
workspace i stan aktywacji opisuje [instrukcja GTM](ops/gtm/README.md).

Kontrola źródeł AI z 13.10.2026: `npm run verify` przeszło 518 unit
i 468 E2E; z włączonym GTM osobno 39 E2E w trzech silnikach. Rzeczywisty
SDK GA4 sprawdzono dla pięciu kodów i braku źródła, z lokalnym przechwyceniem
collect. Sprawdzone polecenie:

```sh
node scripts/check-ai-source-sdk.mjs
```

[Kontrakt źródła AI](docs/AI-SOURCE-CONTRACT.md) opisuje zakres danych
i wynik publikacji. Skrypt nie wysyła zdarzeń do GA4.

CLI `verify-ola` sprawdza właściciela portu przez `/proc` na Linuksie
oraz `/usr/sbin/lsof` na macOS. `doctor` wymaga odpowiedzi homepage z tytułem
i canonical zgodnymi z aktualnym `dist/index.html`. Brak dostępu do listenera
lub inny system kończy kontrolę błędem. Launch wykrywa zajęte porty przez
próbę nasłuchu na `127.0.0.1` i potwierdza właściciela po starcie.
Test tych kontroli bez budowania aplikacji:

```sh
node --test .cursor/skills/verify-ola/scripts/server-checks.test.mjs
```

`npm run import:3a` buduje pełne dokumenty 3a z fixture’ów i zapisuje transakcję
do `reports/content-lake-3a-transaction.json`. Domyślnie nic nie wysyła.
`npm run import:3a -- --write --dataset production` wymaga
`SANITY_API_WRITE_TOKEN`. `npm run test:content-lake` buduje serwis z tych
dokumentów przez lokalny klient GROQ i sprawdza budżet CSS.
Verify obejmuje format, zgodność tokenów, lint, typy wszystkich workspace’ów, build frontendu,
Studio i Workera, unit tests, budżety artefaktów, E2E w trzech przeglądarkach
i budowę z wygenerowanych dokumentów.
`npm run import:homepage` robi dry-run szkiców homepage 3a do `reports/` i nic
nie zapisuje do Content Lake. `npm run import:consultation` robi to samo dla
landingu konsultacji (`page-consultation-pl/en`); `npm run import:ebook` dla
dokumentu `ebook-suplementy-w-pcos-*`. `npm run import:blog-collection` robi
dry-run 34 dokumentów (`article`, `category`, strony Blog `page`) do
`reports/`; nic nie zapisuje.
Sprawdzona komenda `node --import tsx scripts/prepare-ebook-landings.ts`
zapisuje lokalnie pięć pozostałych landingów PL do
`output/ebook-landings-3a-2026-10-11/`: pełne propozycje NDJSON oraz patche
ograniczone do treści landingu, SEO, rozdziałów, materiałów, źródeł i formatu.
Nie wysyła danych do Sanity. Tego katalogu nie commitujemy.
Istniejące ceny, dostępność i referencje należy zachować. Zapis do Sanity
wymaga kopii danych i kontroli rewizji.
Migracja istniejących ustawień bloga ma osobny skrypt. Sprawdzona komenda
`npm run migrate:blog-pages -- --input /tmp/ola-blog-migration-source.ndjson`
przyjmuje eksport NDJSON i generuje raport oraz nowe szkice bez zapisu.
Źródło należy wyeksportować z własnego datasetu; szczegóły migracji, sluga
i publikacji artykułu: [BLOG-PUBLISHING.md](docs/BLOG-PUBLISHING.md).
`npm run import:legal` robi dry-run sześciu dokumentów `legalPage` (cztery PL
ze szkiców B2C `projekt prawny ola/www-prawne` i dwa EN z informacją o wiążącej
wersji polskiej) do `reports/`; nic nie zapisuje. `--write` jest zablokowany
(kod 2), dopóki dokument nie ma daty wejścia w życie albo ma placeholdery.
Fixture’y regeneruje `node scripts/convert-legal-md.mjs <katalog www-prawne>`
(`--check` tylko porównuje), a przykłady Markdown
`npx tsx scripts/generate-legal-examples.ts`.
`npm run format` jawnie formatuje kod. Samo
`npm run test:e2e` wymaga aktualnego buildu. CI jest skonfigurowane; wynik jego
pierwszego uruchomienia na GitHub wymaga osobnego sprawdzenia.

Weryfikacja bloga w Chromium przez [verify-ola](.cursor/skills/verify-ola/SKILL.md)
(sprawdzone komendy, świeży build fixture’ów):

```sh
npm run build
export VERIFY_RUN_ID="ola-blog-check"
node .cursor/skills/verify-ola/scripts/verify.mjs launch
node .cursor/skills/verify-ola/scripts/verify.mjs browser start
node .cursor/skills/verify-ola/scripts/verify.mjs doctor
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/
node .cursor/skills/verify-ola/scripts/verify.mjs cleanup
```

n8n i self-hostowane c15t działają poza repo. Panel zgód 3a i klient c15t
są wdrożone na stagingu; backend ma wspólne utrzymanie z zawlodzki.pl
i osobne profile Oli. Nakładka serwera i eksport GTM są w `ops/`.

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
Sześć zapowiedzi, Wszystkie / PMOS (PCOS) / Perimenopauza; ręczne filtrowanie działa
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

Podstrona kontaktu 3a: `/kontakt/` i `/en/contact/`. Plan i stan integracji:
[Kontakt CMS](docs/CONTACT-CMS-CONFIG-3A.md). Po zbudowaniu fixture lokalny
podgląd i kontrola użytkowa: `node .cursor/skills/verify-ola/scripts/verify.mjs launch`
(z ustawionym `VERIFY_RUN_ID`), następnie `browser start` i `doctor`.

Sprawdzone wdrożenie wyłącznie stagingu 11.10.2026, po buildzie z
`PUBLIC_SANITY_PROJECT_ID=dyuqkn8c`, `PUBLIC_SANITY_DATASET=production`,
`PUBLIC_GTM_ENABLED=false` i `SITE_INDEXING=staging`:

```sh
npm run test:build
npx wrangler deploy --config wrangler.jsonc --env staging --dry-run
npx wrangler deploy --config wrangler.jsonc --env staging
```

Plik `public/.assetsignore` wyklucza metadane lokalne z zasobów zgodnie z
[dokumentacją Cloudflare](https://developers.cloudflare.com/workers/static-assets/binding/#ignoring-assets).

Próba rejestru jednorazowych tokenów Turnstile: runner PostgreSQL, jego wymagania
izolacji i sprawdzone polecenie w [ops/n8n/turnstile](ops/n8n/turnstile/README.md).
Produkcja opublikowana 15.10.2026; bieżący stan w
[postępie](docs/PROGRESS.md).

## Zamówienia e-booków, 18.10.2026

Przygotowany proces obejmuje jeden e-book za 97 zł brutto i osobny zakup obu
brakujących za kolejne 97 zł brutto. Sprzedaż pozostaje wyłączona. Produkty
w Sanity mają `planned`, ustawienia serii `paused`, a Worker
`CHECKOUT_ENABLED = false`. Dostawę użytkownik odłożył na później.
[Plan i warunki uruchomienia](docs/STRIPE-EBOOK-IMPLEMENTATION-PLAN-2026-10-18.md),
[konfiguracja CMS](docs/CHECKOUT-CMS-MIGRATION.md),
[model backendu](worker/CHECKOUT-DESIGN.md).

Sprawdzone komendy na Node 24, z katalogu repo.

```sh
npm run build
npm run test:build
npm run test -- tests/unit/checkout-worker.test.ts
npm run test -- tests/unit/content-lake-plan.test.ts tests/unit/pcos-checkout-cms.test.ts
npm run test:e2e -- --project=chromium tests/e2e/checkout.spec.ts
npm run preview
```

Podgląd statycznych stron jest pod `http://127.0.0.1:4321/zamowienie/`,
`http://127.0.0.1:4321/po-zakupie/` oraz
`http://127.0.0.1:4321/zamowienie/potwierdzenie/`. Sam podgląd Astro nie obsługuje
API Workera. E2E zamówień używa kontrolowanych odpowiedzi API i Stripe.
Nie potwierdza rzeczywistej płatności ani dostawy.

Pełne `npm run verify` zakończyło się kodem 0. Przeszło 690 testów jednostkowych
i 549 E2E, z 12 celowymi pominięciami. Porównanie 20 stron fixture i Content Lake
oraz SEO 39 stron przeszło. Otwarte kontrole pozostają
w [postępie](docs/PROGRESS.md). Do uruchomienia realnych płatności
brakuje sekretu runtime Stripe, webhooka, odbioru sandbox i dostawy.

### Doraźny podgląd oferty, 18.10.2026

W tej sesji sprawdzono `node /tmp/ola-checkout-review-server.mjs` na Node 24.
Podgląd pod `http://127.0.0.1:4349/po-zakupie/?session_id=preview_ebook-01`
używa przykładowego statusu zakupu i blokuje płatności. Skrypt jest tymczasowy,
poza repozytorium. Nie jest wdrożeniem stagingu ani podglądem szkiców Sanity.

### Doraźny podgląd pierwszego zakupu, 18.10.2026

Sprawdzona komenda na Node 24: `node /tmp/ola-first-order-review-server.mjs`.
Karta zakupu: `http://127.0.0.1:4350/ebooki/suplementy-w-pcos/#cena`.
Formularz: `http://127.0.0.1:4350/zamowienie/?produkt=ebook-01`.
Serwer i build w `/tmp/ola-first-order-preview-build` są tymczasowe; symulują
aktywną kartę bez zmiany CMS, odrzucają POST i blokują połączenia do innych
hostów. To podgląd wyglądu, nie aktywacja płatności ani wdrożenie stagingu.

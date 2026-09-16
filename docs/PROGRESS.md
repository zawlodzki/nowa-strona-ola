# Postęp wdrożenia

Aktualizacja: 2026-09-16. Specyfikacja: [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md).

## Aktualny etap

Etap 1 — przygotowanie repozytorium i dokumentacji — zakończony.
Etap 2 — aplikacje i infrastruktura — zakończony.
Etap 3 — design system i komponenty — zakończony.
Etap 4 — Sanity i szablony PL/EN — kod, fixture’e i trasy zweryfikowane lokalnie.
Dataset `production` nadal ma stare dokumenty `page` (tytuł/lead, bez sekcji).
Etapy 5–7 pozostają otwarte.

## Wykonane

- Zapisano pełną specyfikację i checklisty siedmiu etapów z kryteriami odbioru.
- Utworzono README i instrukcję kontynuacji pracy pomiędzy sesjami.
- Uproszczono AGENTS.md do reguł tego projektu.
- Dodano .gitignore dla plików lokalnych, sekretów i generowanych zasobów.
- Zainicjowano Git na main, utworzono prywatne repozytorium GitHub
  `zawlodzki/nowa-strona-ola` i wysłano gałąź `main`.
- Zachowano istniejący design system i lokalne umiejętności bez zmian.
- Utworzono workspace’y `studio/`, `worker/` i `packages/shared/` bez przenoszenia
  działającego frontendu Astro; repo nadal ma jeden główny `package-lock.json`.
- Studio ma osobną konfigurację i przygotowany TypeGen. Worker ma konfigurację
  JSONC, wygenerowane typy runtime i minimalne odpowiedzi
  `/health`, `/api/leads` (501) oraz 404. Kontrakt leada współdzieli z pakietem typów.
- Dodano minimalny dokument `page` z walidacją PL/EN, slugiem unikalnym w obrębie
  języka, tytułem, leadem i osadzonym SEO. TypeGen generuje typy schematu i GROQ.
- Frontend pobiera stronę po języku i slugu przez klienta bez CDN, w perspektywie
  `published`; kwerenda dodatkowo wyklucza `drafts.**`. Brak wyniku lub niezgodna
  odpowiedź zatrzymują build. Bez konfiguracji używany jest jawny fixture PL/EN.
- Utworzono projekt Sanity `dyuqkn8c` (organizacja konta, dataset `production`),
  CORS dla lokalnego Studio i podglądu oraz opublikowane demonstracyjne strony
  `home` PL/EN. Sekrety zapisano tylko w ignorowanych plikach lokalnych. CI i
  publiczny build bez `PUBLIC_SANITY_*` nadal używają fixture’ów.
- Dodano osobne Astro SSR `preview/` z adapterem Cloudflare. Sanity Presentation
  aktywuje je przez oficjalny, wygasający sekret; dodatkowa podpisana sesja HttpOnly
  ogranicza dostęp do całej aplikacji. Szkice są pobierane serwerowo z tokenem Viewer.
- Rozszerzono model treści o page builder 18 sekcji, artykuły, blog, ustawienia
  i powiązania tłumaczeń. Lokalny build bez `PUBLIC_SANITY_*` używa fixture’ów.

## Decyzje obowiązujące

- Nowa marka, fundament z treściami demonstracyjnymi, bez migracji; PL/EN.
- Astro SSG, Sanity, Cloudflare Workers Static Assets; osobny chroniony podgląd.
- Wygląd z wonderful-design-system; bez konkurencyjnej palety/tokenów.
- Sekcje z wariantami w CMS; każda ma HTML, Markdown i przykład.
- Worker → Queues → n8n; n8n deduplikuje i obsługuje dalsze automatyzacje.
- Zewnętrzne self-hostowane c15t; tutaj tylko integracja i panel.
- Basic Consent Mode v2; skrypty Google dopiero po właściwej zgodzie.
- Sanity Free i Workers Paid (ok. 5 USD/mies. przy tej skali); Access Zero Trust
  Free dla jednego e-maila. Sprawdzone w dokumentacji Cloudflare 2026-09-13.

## Weryfikacja etapu 1 — 2026-09-12

- Przeczytano aktualny AGENTS.md i sprawdzono stan katalogu przed zmianami.
- Skrypt Python sprawdził 4 dokumenty: 17 lokalnych odnośników prowadzi do istniejących
  plików; brak końcowych białych znaków.
- git check-ignore: 10 przypadków ignorowanych i 8 zachowanych przeszło kontrolę
  (m.in. zagnieżdżone .env, przykłady środowiska, tokeny i generator design systemu).
- git symbolic-ref --short HEAD: main. git remote: brak remote.
- git status --short: wyłącznie pliki nieśledzone nowego repo; nic nie dodano do indeksu.
- Na koniec etapu 1 aplikacja jeszcze nie istniała; aktualne wyniki poniżej.

## Blokady i zależności

Lokalny szkielet i projekt Sanity `dyuqkn8c` nie blokują dalszej pracy nad UI.
Access preview staging i produkcji, 301 `www`, przepływ publikacji na stagingu
i produkcji oraz publiczny apex działają. Pozostaje handshake Presentation
szkicu w podglądzie. ABC Favorit nie jest licencjonowany. Główny krój to
Switzer (Fontshare FFL).

Pierwsza instalacja Sanity 5.31.2 zgłaszała 8 podatności przejściowych w łańcuchu
CLI. Po aktualizacji lockfile przy dodaniu `@sanity/webhook` npm zgłasza 0
podatności, bez `--force`, downgrade’u i overrides; bezpośrednia wersja Sanity
pozostała 5.31.2. Stan nadal sprawdzać przed wdrożeniem Studio.

## Analiza bibliotek UI — 2026-09-12

- Porównano dokumentację i repozytoria Lumos oraz bejamas/ui z planem strony.
- [Wyniki i propozycja próby](UI-FRAMEWORKS.md): selektywnie rozważyć Bejamas,
  Lumos traktować jako inspirację. Nie instalowano zależności i nie zmieniono stosu.
- To ocena dokumentacji, bez testu aplikacji i pomiaru wydajności. W etapie 3
  sprawdzić przycisk, pola formularza i dialog przed przyjęciem biblioteki.

## Próba UI i bramka jakości — 2026-09-13

- Działają prototypy PL/EN: przycisk, pola formularza, dialog i sekcja ciemna.
- Astro 7.3.2, Tailwind 4.3.3 i @data-slot/dialog 0.2.166; npm i jeden lockfile.
- Bejamas przyjmować selektywnie; mapowanie na Wonderful i lokalne poprawki
  wyzwalacza ARIA oraz powrotu fokusu Safari są częścią implementacji.
- [Raport próby](UI-SPIKE-RESULTS.md) i [zasady jakości](CODE-QUALITY.md).
- `npm run verify`: PASS. Format, ESLint 10, Astro check bez błędów/ostrzeżeń/hints;
  10 unit tests, 27 E2E w Chromium/Firefox/WebKit, axe i build 3 stron.
- `npm run test:build`: JS 4684 B gzip, CSS 7344 B gzip; /static/ bez script.
  To zewnętrzne pliki prototypu, bez inline JS i mediów; nie wynik Lighthouse/CWV.
- Przegląd screenshotów desktop/mobile; 320/390/1440 px, reduced motion i CSS zoom
  200% sprawdzone. Ręczny czytnik, natywny zoom i urządzenie fizyczne niesprawdzone.
- Workflow GitHub przygotowany; pierwsze uruchomienie na GitHub nastąpiło po
  wysłaniu repozytorium i wymaga osobnego sprawdzenia wyniku.
- Node lokalnie 26.8.2; CI ustawione na 24. Pierwsze CI ma potwierdzić zgodność.
- Formularz jest demonstracyjny, nic nie wysyła. Brak Sanity, n8n, c15t,
  ochrony stagingu, serializerów Markdown i docelowego SEO.
- Materiały Wonderful i lokalne skills zachowano w pierwszym commicie.

## Repozytorium GitHub — 2026-09-13

- Utworzono prywatne repozytorium `zawlodzki/nowa-strona-ola`, dodano `origin`
  i ustawiono śledzenie `origin/main`.
- Pierwszy commit aplikacji: `bd002fa` (`Initial project setup`).
- Przed wysłaniem `npm run verify`: PASS; 10 testów unit i 27 E2E.
- Usunięto obniżanie przezroczystości nieaktywnego przycisku, które powodowało
  naruszenie kontrastu WCAG w WebKit przy szerokości 320 px.

## Workspace aplikacji — 2026-09-13

- Frontend pozostał w katalogu głównym, Studio i Worker są osobnymi workspace’ami,
  a `packages/shared` przechowuje wspólne typy PL/EN i kontrakt zgłoszenia.
- Zgodnie z aktualną dokumentacją Sanity TypeGen skonfigurowano w
  `studio/sanity.cli.ts`; Wrangler korzysta z rekomendowanego `wrangler.jsonc`
  i typów runtime wygenerowanych dla daty kompatybilności 2026-09-13.
- `npm run verify`: PASS. Format i lint bez błędów; Astro check: 26 plików,
  0 błędów/ostrzeżeń/hints; TypeScript Studio/Worker/shared: PASS; 10 unit tests;
  build Astro (3 strony), build Studio i dry-run Workera; budżet JS 4684 B gzip,
  CSS 7344 B gzip; 27 E2E w Chromium/Firefox/WebKit.
- Build Studio sprawdzono bez rzeczywistego projektu Sanity, na wartości zastępczej.
  Nie uruchamiano Studio ani Workera interaktywnie i nie testowano zewnętrznych usług.

## Opublikowana treść Sanity — 2026-09-13

- Dodano `page` i `seo`, walidacje wymaganych pól, długości oraz unikalność sluga
  per język. To minimalny model etapu 2, nie pełny model i page builder etapu 4.
- `sanity schema extract --enforce-required-fields` i `sanity typegen generate`:
  PASS; 13 typów schematu i typ jednej kwerendy zapisano w `src/sanity.types.ts`.
  Usunięto nieobsługiwaną w bieżącym CLI flagę `--force` ze skryptu TypeGen.
- Repozytorium treści ma testy trybu fixture, kompletnej i częściowej konfiguracji,
  parametrów kwerendy, wykluczenia ścieżki szkiców, braku publikacji i niezgodnej
  odpowiedzi. Nie wykonano zapytania do rzeczywistego Content Lake — brak projektu.
- `npm run verify`: PASS. Astro check: 33 pliki bez diagnostyki; TypeScript wszystkich
  workspace’ów: PASS; 17 unit tests; build Astro (3 strony), Studio i dry-run Workera;
  27 E2E w Chromium/Firefox/WebKit; budżety bez zmiany (JS 4684 B, CSS 7344 B gzip).

## Chroniony podgląd SSR — 2026-09-13

- Dodano workspace `preview/`: Astro SSR 7.3.2 z adapterem Cloudflare 14.3.1,
  osobnym buildem i konfiguracją Wrangler. Publiczny frontend pozostał statyczny.
- Studio ma Presentation Tool kierujący do `/api/draft-mode/enable`. Endpoint
  korzysta z `@sanity/preview-url-secret`, a dopiero po poprawnej walidacji ustawia
  godzinną perspektywę szkiców i dodatkową sesję HMAC w cookie HttpOnly/Secure.
- Middleware odrzuca wszystkie pozostałe żądania bez poprawnej sesji. Każda odpowiedź
  ma `private, no-store`, `noindex, nofollow, noarchive` i `no-referrer`.
- Token Viewer jest odczytywany wyłącznie z runtime `cloudflare:workers`. Nie trafia
  do kodu klienta ani konfiguracji repo. Podgląd używa `perspective: drafts`,
  `useCdn: false`, Stega i wspólnego `PageHero.astro` oraz komponentów frontendu.
- Testy jednostkowe obejmują ważny podpis, manipulację, wygaśnięcie, maksymalny TTL,
  minimalną długość sekretu, parametry kwerendy szkicu i brak cichego fallbacku.
- Lokalny Astro preview/workerd: wejście bez sesji zwróciło 401 z wymaganymi
  nagłówkami; endpoint aktywacji bez skonfigurowanych sekretów zwrócił 503.
- `npm run verify`: PASS. Astro/TypeScript bez diagnostyki; 22 unit tests; build
  publicznego Astro, Studio, Preview SSR i dry-run Workera; 27 E2E bez regresji.
- Nie sprawdzono udanego handshake ani treści szkicu z rzeczywistym Sanity, CORS,
  iframe Presentation i overlayów click-to-edit — brak projektu, tokenu i hostingu.

## Konfiguracja Cursor — 2026-09-13

- Codex w tym repo korzystał z MCP: `astro-docs`, `Sanity`, `context7`,
  `chrome-devtools`; plugin `cloudflare@openai-curated` (MCP Cloudflare API).
  W globalnym Codexie włączone były też narzędzia niezwiązane ze stosem
  (Make, Readwise, DataForSEO, dokumenty). Sanity i Jina były w konfiguracji
  Codex wyłączone, a skille Sanity trzymane w repo (`.agents/skills`).
- Cursor: Sanity, Context7, Jina, Chrome DevTools i Exa są już na koncie użytkownika.
  Plugin Cloudflare z marketplace jest zainstalowany. Plugin Sanity z marketplace
  nie został dodany (odrzucony w tej sesji) — zostaje MCP Sanity z ustawień użytkownika.
- W projekcie: `.cursor/mcp.json` (Astro Docs + Cloudflare API, bez sekretów),
  reguła `.cursor/rules/stack-astro-sanity-cloudflare.mdc` oraz dowiązania skilli
  stosu w `.cursor/skills` do tych samych katalogów co Codex (`.agents/skills`).
- Pierwsze użycie MCP Cloudflare wymaga OAuth w Cursorze. MCP Astro startuje przez
  `npx mcp-remote`. Nie weryfikowano połączeń OAuth w tej sesji.

## Środowiska Cloudflare — 2026-09-13

- Dodano konfiguracje `staging` i `production` dla publicznego Static Assets,
  podglądu Astro SSR i Workera integracyjnego, z jednoznacznymi nazwami sześciu
  docelowych Workerów. Nie utworzono ich na koncie Cloudflare.
- Publiczny Worker serwuje `dist/`, używa stron 404 Astro i automatycznego
  trailing slash. Preview oraz Worker integracyjny mają włączone logi i traces
  z próbkowaniem; invocation logs pozostają wyłączone.
- Podgląd deklaruje pięć wymaganych sekretów osobno dla obu środowisk. Usunięto
  wdrażalne placeholdery z `vars`; lokalny przykład zawiera pełny zestaw nazw.
- Wyłączono nieużywane sesje Astro KV i wybrano kompilacyjną optymalizację obrazów,
  aby adapter nie automatycznie provisionował KV ani bindingu Cloudflare Images.
- Dodano `CLOUDFLARE-DEPLOYMENT.md`: granice sekretów, komendy build/deploy,
  spłaszczanie `CLOUDFLARE_ENV`, ochronę Access i checklistę pierwszego wdrożenia.
- Wrangler 4.131.1 wygenerował typy preview i Workera. Dry-run przeszedł dla
  publicznego serwisu, preview i integracji w obu środowiskach. Preview zgłaszał
  oczekiwane ostrzeżenie o braku pięciu rzeczywistych sekretów; artefakt nie miał
  automatycznych bindingów KV/Images. Dry-run nie sprawdza konta, domen ani Access.
- `npm run verify`: PASS. Format, lint i typy bez diagnostyki; 22 testy unit;
  build publicznego Astro, Studio, Preview SSR i dry-run Workera; 27 E2E bez
  regresji. Build preview zgłasza oczekiwane ostrzeżenie o brakujących sekretach.
- Checklisty „Cloudflare, sekrety, GitHub i Builds” nie zamknięto: repo nie jest
  jeszcze połączone z Cloudflare Builds, a brak identyfikacji konta, subdomen
  pomocniczych i wartości Sanity uniemożliwia bezpieczne utworzenie zasobów
  i sekretów.
- Użytkownik potwierdził domenę produkcyjną `aleksandraolesiewicz.com` podpiętą
  do Cloudflare. Publiczne środowisko `production` deklaruje ją jako custom domain
  i wyłącza `workers.dev`; wariant `www` oraz subdomeny stagingu i preview nie są
  jeszcze ustalone. Dry-run Wranglera dla produkcji przeszedł, a powtórzone
  `npm run verify` zakończyło się PASS (22 unit, 27 E2E). Nie zmieniano zdalnego
  DNS ani routingu.

## Webhook publikacji i kolejka buildów — 2026-09-13

- Dodano `/webhooks/sanity`, który weryfikuje podpis surowego body oficjalnym
  formatem `@sanity/webhook` 4.0.4, porównuje skróty w stałym czasie i odrzuca
  podpisy starsze niż pięć minut. Limit body wynosi 64 KiB.
- Minimalny payload zawiera wyłącznie identyfikator i typ dokumentu oraz operację
  `create`, `update` albo `delete`. Drafty i niepoprawne dane są odrzucane; treść
  dokumentu nie trafia do wiadomości ani logów.
- Poprawne zdarzenie otrzymuje deterministyczny identyfikator SHA-256 i trafia do
  `BUILD_QUEUE`. Konsument scala batch do jednego wywołania chronionego endpointu
  builda. Błąd HTTP rzuca wyjątek, aby Queue ponowiła wiadomości i ostatecznie
  skierowała je do DLQ; maksymalna współbieżność konsumenta wynosi 1.
- Konfiguracja deklaruje oddzielne kolejki i DLQ dla stagingu i produkcji oraz
  wymagane sekrety `SANITY_WEBHOOK_SECRET`, `BUILD_TRIGGER_URL` i
  `BUILD_TRIGGER_TOKEN`. Nie utworzono zdalnych kolejek ani sekretów.
- 10 testów jednostkowych obejmuje create/publish, update, delete/unpublish,
  niepoprawny i przedawniony podpis, draft, limit body, grupowanie oraz błąd
  endpointu builda. Dry-run Wranglera przeszedł dla obu środowisk z właściwymi
  bindingami Queue. To test lokalny z atrapą endpointu, nie pełny przepływ Sanity.
- `npm run verify`: PASS. Format, lint i typy bez diagnostyki; 32 testy unit;
  publiczny build, Studio, Preview SSR i Worker przeszły; 27 E2E bez regresji.
- `npm install` po dodaniu oficjalnego pakietu zgłosił 0 podatności w aktualnym
  drzewie zależności. Nie zmieniono bezpośredniej wersji Sanity 5.31.2.
- Otrzymany produkcyjny URL webhooka n8n do formularzy zapisano wyłącznie jako
  `N8N_LEAD_WEBHOOK_URL` w ignorowanym `worker/.dev.vars`. Repo zawiera tylko nazwę
  sekretu i bezpieczny placeholder. `git check-ignore` potwierdził regułę, typy
  Workera i produkcyjny dry-run przeszły. Nie wysyłano żądania testowego ani danych.
- Oficjalna dokumentacja Workers Builds potwierdza wyzwalanie przez push do
  podłączonego repozytorium; nie znaleziono udokumentowanego bezpośredniego hooka
  builda. `BUILD_TRIGGER_URL` pozostaje kontraktem przyszłego orkiestratora, a jego
  implementacja wymaga decyzji między push/dispatch w GitHub a rezygnacją z
  Cloudflare Builds na rzecz kontrolowanego workflow wdrożeniowego.
- Po deklaracji sekretu n8n `npm run verify`: PASS (32 unit, 27 E2E, wszystkie
  buildy i kontrole typów). Oczekiwane ostrzeżenie preview dotyczy brakujących
  lokalnych sekretów Sanity.

## Kontrolowane wdrożenie publikacji — 2026-09-13

- Wybrano GitHub Repository Dispatch i jawny deploy przez Wrangler zamiast
  Cloudflare Builds. Pozwala to przebudować treść bez sztucznego commita i zatrzymać
  wdrożenie przed zmianą produkcji, gdy walidacja, test albo build zakończy się błędem.
- Worker wysyła zgodny payload `repository_dispatch` z typem
  `sanity-content-change`, docelowym środowiskiem, liczbą scalonych zdarzeń i tylko
  metadanymi ostatniego zdarzenia. Używa wymaganych nagłówków GitHub API.
- `BUILD_TARGET_ENV` jest jawną zmienną konfiguracji Workera: `staging` dla lokalnego
  i stagingowego środowiska, `production` dla produkcji. Wygenerowane typy ograniczają
  wartość do tych dwóch wariantów.
- Workflow `Publish content` akceptuje tylko te dwa cele, korzysta z osobnych
  środowisk GitHub, sprawdza obecność konfiguracji Sanity i sekretów Cloudflare,
  uruchamia format, lint, typy, 32 testy jednostkowe, build i kontrolę budżetów,
  a następnie wdraża publiczny Worker. Kolejność per środowisko jest serializowana.
- Plik przykładowy wskazuje endpoint Repository Dispatch prywatnego repo. Rzeczywisty
  token GitHub nie został zapisany ani użyty.
- Test jednostkowy payloadu Workera: PASS (10 przypadków). TypeScript Workera i
  generowanie typów: PASS. Publiczne dry-runy Wranglera dla stagingu i produkcji:
  PASS. Zdalnego dispatchu ani deployu nie wykonano, bo brak tokenów, projektu Sanity
  i skonfigurowanych środowisk GitHub/Cloudflare.
- `npm run verify`: PASS. Format, lint i typy bez diagnostyki; 32 testy jednostkowe;
  build publiczny, Studio, Preview SSR i Worker; kontrola budżetów oraz 27 E2E
  w Chromium, Firefox i WebKit. Ostrzeżenie preview o brakujących lokalnych sekretach
  Sanity jest oczekiwane.

## Projekt Sanity — 2026-09-13

- Konto MCP: Grzesiek Zawłodzki, `grzesiek@zawlodzki.pl`, Google. Organizacja
  `orZ7lye6w`. Utworzono projekt `dyuqkn8c`, dataset `production`.
- CORS z poświadczeniami: `http://localhost:3333` (przy tworzeniu),
  `http://127.0.0.1:3333`, `http://127.0.0.1:4322`, `http://localhost:4322`.
- Opublikowano dwa dokumenty `page` ze slugiem `home` (PL i EN), zgodne z fixture.
- `studio/.env` i `preview/.dev.vars` są ignorowane. Publiczny frontend nie dostał
  `PUBLIC_SANITY_*`, więc verify pozostaje deterministyczne na fixture’ach.
- Schema Studio nadal pochodzi z kodu lokalnego; nie używano MCP `deploy_schema`.
- Nie uruchamiano Studio interaktywnie. Handshake Presentation z rzeczywistym
  iframe nadal nie sprawdzony.

## Tokeny, fallback fontów i katalog — 2026-09-13

- `tokens.json` jest źródłem; `tokens.css` jest z niego generowany. Generator
  Pythona nie nadpisuje już JSON wartościami zakodowanymi w skrypcie.
  `npm run tokens:check` porównuje CSS z JSON i wymaga Arial w stosach display/body
  referencji Wonderful (to nie jest krój aplikacji).
- Wyodrębniono kontener, nagłówek, nadtytuł, link tekstowy, nagłówek strony i stopkę.
  Katalog: `/ui/` i `/en/ui/`. Przełącznik języka katalogu idzie na odpowiednik,
  bez polskiego fallbacku pod `/en/`.

## Switzer jako główny krój — 2026-09-13

- Decyzja: bez licencji ABC Favorit. Switzer z Fontshare (ITF FFL 2.0) jest
  krojem display i body, nie fallbackiem. Oficjalny `Switzer-Variable.woff2`
  (43 220 B), bez subsetowania i bez Astro `fontProviders`.
- Aplikacja nadpisuje `--wf-font-display` i `--wf-font-body` po imporcie tokenów.
  Zapas systemowy: `ui-sans-serif, system-ui, sans-serif`. `font-synthesis: none`.
- `tokens.json` Wonderful nadal mierzy Favorit/Arial — kontrola `tokens:check`
  tego nie zmienia.
- Kontrole: format, tokeny, lint i typy bez diagnostyki; 37 unit tests (w tym
  niezmieniony rozmiar 43 220 B pliku woff2); 5 stron publicznego Astro, Studio,
  Preview SSR i dry-run Workera; budżety JS 4684 B gzip, CSS 7534 B gzip.
  Test katalogu (pangram + `document.fonts.check("16px Switzer")`) przeszedł
  w Chromium, Firefox i WebKit. Pełne `npm run test:e2e` przy 5 workerach raz
  zacięło się na dialogu w Firefox (timeout 30 s); te same scenariusze seryjnie
  przeszły. Axe 320 px na katalogu bez naruszeń.
- W przeglądarce: `/`, `/ui/` (1440 i 390 px) oraz `/en/ui/`. Computed
  `font-family` body i h1: `Switzer, ui-sans-serif, system-ui, sans-serif`;
  h1 waga 300, body 400, przycisk 500; pangram `Zażółć gęślą jaźń ąćęłńóśźż`.
  Preload i `@font-face` wskazują ten sam `Switzer-Variable.7Oa6q7Y4.woff2`.
- Nie zbudowano jeszcze wszystkich sekcji etapu 3 (hero warianty, tekst–obraz,
  logotypy, karty, proces, liczby, cennik, opinie, FAQ itd.).

## Hosty, koszt i OAuth Cloudflare — 2026-09-13

- Użytkownik ustalił: podgląd `preview.aleksandraolesiewicz.com`; `www` → 301 na
  apex; Access `grzesiek@zawlodzki.pl`; osobnej nazwy publicznego stagingu nie ma.
- Dokumentacja Cloudflare (2026-09-13): Workers Free nie wystarcza na podgląd SSR
  (limit 10 ms CPU; SSR typowo 10–20 ms). Workers Paid: **5 USD/mies.** minimum.
  Przy skali planu żądania Static Assets, Queues i logi powinny zmieścić się w
  limitach wliczonych — bez dopłat. Access Zero Trust Free (do 50 osób): 0 USD.
- OAuth MCP w Cursorze: bindings, docs, observability i builds — zalogowane.
  Konto ma trzy stare Workery zgód, bez Workerów tej strony. Wrangler CLI:
  `You are not authenticated`. `gh` ma nieważny token w pęku kluczy.
- `preview/wrangler.jsonc` production ma custom domain preview. Zasobów (kolejki,
  sześć Workerów, Access, DNS `www`) nie utworzono: brak CLI, brak włączonego
  Workers Paid z dashboardu, brak tokenu GitHub.

## Weryfikacja Wrangler CLI i dwóch Workerów — 2026-09-13

- `npx wrangler whoami`: zalogowany OAuth, `grzesiek@zawlodzki.pl`, konto
  `a9280171eee8bfa22ea23290a7ab72c5`, zakres m.in. `workers (write)` i
  `queues (write)`.
- Na koncie są dwa nowe skrypty z 2026-09-13: `ola-website-integrations-staging`
  i `ola-website-integrations-production`. Każdy ma upload, potem Secret Change
  (~1 s później). Kod obu: `export default { fetch() {} }` — placeholder dashboardu,
  nie kod z `worker/`.
- `npx wrangler queues list`: pusta lista. Brak `ola-website-staging`,
  `ola-website-production`, `ola-website-preview-staging`,
  `ola-website-preview-production`.
- `https://aleksandraolesiewicz.com/` i `www` zwracają 404 istniejącej strefy;
  `www` nie przekierowuje na apex. Plan Workers Paid nie został odczytany z API
  billing — utworzenie pustych Workerów nie potwierdza subskrypcji.

## Kolejki i token GitHub — 2026-09-13

- Użytkownik wstawił `BUILD_TRIGGER_TOKEN` przez `wrangler secret put` na staging
  i production. Agent ustawił `BUILD_TRIGGER_URL` na staging
  (`https://api.github.com/repos/zawlodzki/nowa-strona-ola/dispatches`).
- Utworzono kolejki: `ola-site-builds-staging`, `ola-site-builds-staging-dlq`,
  `ola-site-builds-production`, `ola-site-builds-production-dlq`. Queues działają
  na koncie (plan Workers Paid albo Free z limitowanym Queues).
- Dry-run `wrangler deploy --config worker/wrangler.jsonc --env staging`: PASS
  (8.76 KiB, binding `BUILD_QUEUE` → `ola-site-builds-staging`).
- Zdalny deploy kodu z `worker/`: FAIL, brak `SANITY_WEBHOOK_SECRET`.
  `N8N_LEAD_WEBHOOK_URL` wyłączono z `secrets.required`, bo `/api/leads` zwraca
  501 i nie wolno podłączać produkcyjnego n8n do stagingu.
- Placeholder `export default { fetch() {} }` na stagingu został nadpisany przez
  `secret put` (nowa wersja pustego skryptu z sekretami), nie przez kod aplikacji.

## Worker integracji staging — 2026-09-13

- Użytkownik ustawił `SANITY_WEBHOOK_SECRET` na staging. Wdrożono kod:
  `npx wrangler deploy --config worker/wrangler.jsonc --env staging`.
  Version `e4709cf8-b561-44f2-b2be-8b367f2fa922`. Startup 4 ms.
- Adres: `https://ola-website-integrations-staging.zawlodzki.workers.dev`.
  Producer i consumer `ola-site-builds-staging` (1/1). Produkcyjne kolejki bez
  konsumenta.
- Kontrola HTTP: `GET /health` → 200 `{"status":"ok"}`; `POST /api/leads` → 501;
  nieznana ścieżka → 404; `POST /webhooks/sanity` bez podpisu → 401
  `invalid_signature`. Nie wysyłano poprawnie podpisanego webhooka ani dispatchu
  GitHub.

## Publiczny i preview staging — 2026-09-13

- Publiczny Worker: `npx wrangler deploy --config wrangler.jsonc --env staging`.
  Version `8e53935d-6bc0-42d6-a9be-964b46771dd0`.
  `https://ola-website-staging.zawlodzki.workers.dev` — `/` 200 PL, `/en/` 200 EN,
  `/ui/` i `/en/ui/` 200, nieistniejąca ścieżka 404. W przeglądarce: tytuł PL,
  potem `/en/` z tytułem EN i nawigacją po angielsku. Treść z fixture (bez
  `PUBLIC_SANITY_*`).
- Preview: `CLOUDFLARE_ENV=staging` build, deploy
  `preview/dist/server/wrangler.json` z `--secrets-file preview/.dev.vars`.
  Version `3151fd83-bd03-41ac-a926-d9d0935729eb`. Startup 27 ms.
  `https://ola-website-preview-staging.zawlodzki.workers.dev` — `GET /` 401
  „Brak dostępu do podglądu.” Access na brzegu jeszcze nie włączony.
- CORS Sanity `dyuqkn8c`: dodano
  `https://ola-website-preview-staging.zawlodzki.workers.dev` z credentials.
- Środowiska GitHub: 0. Token `gh` działa. Nie tworzyłem env/zmiennych bez
  osobnego potwierdzenia. Webhook Sanity i 301 `www` nie skonfigurowane.

## Access preview staging i GitHub — 2026-09-13

- Access na `ola-website-preview-staging` zweryfikowany: `GET /` → 302
  `https://zawlodzki.cloudflareaccess.com/cdn-cgi/access/login/...`. Publiczny
  staging nadal 200, bez Access. Sesja aplikacji (401) jest za Access.
- GitHub Environment `staging`: zmienne `PUBLIC_SANITY_PROJECT_ID=dyuqkn8c`
  i `PUBLIC_SANITY_DATASET=production`. Listowanie sekretów: Forbidden
  (token `gh` nie ma `secrets`). Środowiska `production` nie utworzono.
- `npx sanity hooks list -p dyuqkn8c`: pusta lista. `www` nadal 404 strefy
  (nagłówki Webflow), bez 301 na apex.

## Przygotowanie produkcji i paneli — 2026-09-13

- W zalogowanym panelu GitHub utworzono Environment `production` i zweryfikowano
  zmienne `PUBLIC_SANITY_PROJECT_ID=dyuqkn8c` oraz
  `PUBLIC_SANITY_DATASET=production`. `staging` nadal ma te same dwie zmienne.
  W obu środowiskach zapisano sekrety `CLOUDFLARE_ACCOUNT_ID` i
  `CLOUDFLARE_API_TOKEN`; panel potwierdza cztery nazwy, bez ujawniania wartości.
- Lokalny token `gh` stracił ważność; dalszy odczyt przez CLI kończy się
  komunikatem o nieważnym tokenie. Panel GitHub pozostaje zalogowany.
- `wrangler 4.131.1 whoami` potwierdził konto
  `a9280171eee8bfa22ea23290a7ab72c5` i OAuth z prawem zapisu Workerów.
  `wrangler secret list --env staging` potwierdził nazwy
  `BUILD_TRIGGER_TOKEN`, `BUILD_TRIGGER_URL` i `SANITY_WEBHOOK_SECRET`; Cloudflare
  nie ujawnia ich wartości. Lokalny `worker/.dev.vars` nie zawiera sekretu Sanity.
- `npx sanity hook list --project-id dyuqkn8c` nadal zwraca pustą listę.
  Bez odzyskania tej samej wartości `SANITY_WEBHOOK_SECRET` webhooka nie da się
  podpisać bez rotacji sekretu Workera.
- DNS `www` zweryfikowany w panelu: CNAME do `cdn.webflow.com`, status Proxied.
  Wdrożono aktywny Single Redirect jako wildcard
  `https://www.aleksandraolesiewicz.com/*` →
  `https://aleksandraolesiewicz.com/${1}`, 301, z zachowaniem query. Test
  `/test/sciezka?utm_source=verify` zwrócił 301 i identyczną ścieżkę oraz query
  na apex. Apex nadal zwraca 404 Webflow, zgodnie z oczekiwaniem przed produkcją.
- Utworzono User API Token z szablonu `Edit Cloudflare Workers`, ograniczony do
  konta projektu oraz Workers Routes w strefie `aleksandraolesiewicz.com`.
  Wartość zapisano bezpośrednio w GitHub i nie zapisano jej w repo ani dokumentacji.
- Ponowna kontrola HTTP: preview staging 302 do Cloudflare Access, publiczny staging 200. Nie uruchamiano workflow publikacji ani testu leada.

## Webhook Sanity — 2026-09-13

- Z lokalnego, ignorowanego `studio/.env` pobrano `SANITY_WEBHOOK_SECRET` i użyto
  go bezpośrednio w panelu Sanity; wartości nie zapisano w dokumentacji ani
  śledzonych plikach. Tymczasowy schowek systemowy został wyczyszczony.
- Utworzono aktywny webhook `publish-pages-staging`: dataset `production`, metoda
  POST, zdarzenia create/update/delete, filtr `_type == "page"`, drafts i versions
  wyłączone, API `v2025-02-19`, projekcja tylko `documentId`, `documentType` i
  `delta::operation()`.
- Pierwsza próba panelowa utworzyła dodatkowy webhook na wszystkich datasetach.
  Po wykryciu w `sanity hook list` usunięto wyłącznie ten błędny duplikat. Końcowa
  lista zawiera dokładnie jeden webhook: `publish-pages-staging` dla `production`
  i właściwego adresu Workera.
- Kontrola endpointu po konfiguracji: `/health` → 200, niepodpisany POST na
  `/webhooks/sanity` → 401. Nie wysłano poprawnie podpisanego zdarzenia, więc
  workflow publikacji nie został uruchomiony.

## Przepływ publikacji i Worker produkcji — 2026-09-13

- Kontrolowana zmiana opublikowanej strony PL (`page` `home`): do leada dodano
  marker `[pubflow-20260913]`, potem przywrócono oryginalny tekst.
- Webhook `publish-pages-staging`: `POST /webhooks/sanity` → **202**, operacja
  `update`, dokument `354b6329-ff44-481b-b08e-0c2357788ae6`. Po ~30 s (batch
  timeout kolejki) Worker wysłał `repository_dispatch`.
- GitHub Actions `Publish content`:
  [34769002456](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/34769002456)
  success w 1 m 12 s (`ola-website-staging` version `23af064b-6831-414b-9692-4c730ae252f9`).
  Staging serwował marker z Sanity, nie fixture.
  [34769198624](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/34769198624)
  success w 53 s po przywróceniu leada; marker zniknął ze stagingu.
- Nie sprawdzono unpublish/delete ani zachowania poprzedniej wersji przy błędzie
  builda. Nie testowano leada.
- Publiczny Worker produkcji: `npx wrangler deploy --config wrangler.jsonc --env production`
  po `PUBLIC_SANITY_*` build. Skrypt `ola-website-production` wgrany
  (version `bf49c64b-4cee-4fab-b3cc-481b1eab43e2`). Custom domain
  `aleksandraolesiewicz.com` **FAIL** Cloudflare API 100117: hostname ma obce
  rekordy DNS (A/CNAME Webflow). Apex nadal 404 Webflow. `workers.dev` produkcji
  jest wyłączony zgodnie z konfiguracją. 301 `www` nadal działa.
- Ze strefy DNS usunięto rekord `A` apex `198.202.211.1` oraz weryfikacyjny TXT
  `_webflow`. Rekordów pocztowych MX, SPF, DKIM i DMARC nie zmieniano. Proxied
  `www → cdn.webflow.com` pozostaje tymczasowo, ponieważ utrzymuje działanie reguły
  301; po odbiorze apex można zmienić jego cel na apex.
- Ponowny deploy po czyszczeniu DNS: version `f81b06e5-879d-4927-995f-46874faefc45`
  (2026-09-13T16:51Z). Kontrola HTTP: apex `/` 200, tytuł i h1 PL z Sanity, bez
  `x-wf-region`; `/en/` 200 `lang="en"`; `/ui/` 200; nieistniejąca ścieżka 404;
  `www` 301 z zachowaniem ścieżki i query. Staging nadal 200.

## Wordmark Gambarino — 2026-09-13

- Utworzono trzy warianty logo (tylko tekst, minuskuła): jedna linia, słowo pod
  słowem, inicjały `ao`. Pliki: `src/assets/brand/logo-{wordmark,stacked,monogram}.{svg,png}`.
- Krój: oficjalny Gambarino Regular z Fontshare (OTF). SVG to obrysy glifów z
  kerningiem GPOS (HarfBuzz), bez plików fontu w repo. Kolor `ink` `#171719`,
  tło przezroczyste. PNG: wordmark 3200 px, stacked 2000 px, monogram 1600 px.
- Nie dodano Gambarino jako kroju strony; Switzer pozostaje głównym krojem.
- Weryfikacja: oględziny na tle `paper`; piksele nieprzezroczyste wordmarku to
  RGB (23, 23, 25); SVG otwiera się niezależnie od fontu.
- Logo wpięte w nagłówek (wordmark / stack na wąskim ekranie), stopkę, favicon
  (`ao`) i katalog `/ui/`. Źródło kroju: `src/assets/brand/logo.ts` oraz komentarz
  w SVG (Gambarino Regular, Fontshare). W UI `fill="currentColor"`. PNG bez zmian.
- Kontrola: `vitest` (w tym `tests/unit/logo.test.ts`), `astro check`, `build`,
  `test:build` (gzip CSS 7699 B), Playwright layout 320/390/1440 (jeden widoczny
  znak w headerze) oraz katalog (Gambarino + link Fontshare). Oględziny `/` i
  `/ui/` w przeglądarce: wordmark w headerze i stopce, trzy okazy w katalogu.
- Nie dodano Gambarino jako kroju strony; Switzer pozostaje głównym krojem.

## Wycofanie, usunięcie i błąd builda — 2026-09-13

- Utworzono tymczasową stronę `unpublish-test-20260913` (PL), opublikowano i
  wycofano. Webhook `publish-pages-staging`: oba zdarzenia **202**. Staging:
  `b92543b7-e13a-45f3-b018-49c200438222` (17:21Z po publikacji) oraz
  `e2132606-6719-4a17-a32d-11e828ec2c2f` (17:33Z po wycofaniu). Strona główna
  PL/EN na stagingu bez zmiany. Szkic testowy usunięty.
- Błąd builda: wycofano opublikowaną stronę EN `home`. Webhook **202**
  (17:35:53Z). Po ~2,5 min wersja stagingu nadal `e2132606` — deploy nie
  nadpisał poprzedniej. `/en/` nadal serwował „A clear idea. Thoughtful
  execution.” Przywrócono publikację EN `home` (202 o 17:38:55Z); nowa wersja
  `009d1564-4d0e-4233-9b6f-ce31add23ee7` (17:40Z). Oba `home` PL/EN są znowu
  opublikowane. Apex nie brał udziału (brak webhooka produkcji).
- Lokalny `gh` ma nieważny token; numeru runu GitHub Actions przy błędzie
  nie odczytano. Dowód to webhook 202 bez nowej wersji Workera, potem udany
  deploy po przywróceniu.

## Preview i integracje produkcji — 2026-09-13

- Preview: `CLOUDFLARE_ENV=production` build, deploy
  `preview/dist/server/wrangler.json` z `--secrets-file preview/.dev.vars`.
  Version `01de6645-cdea-411c-b878-c899fc62396e`. Startup 19 ms. Custom domain
  `preview.aleksandraolesiewicz.com` — `GET /` **401** „Brak dostępu do
  podglądu.”, `private, no-store`, `noindex, nofollow, noarchive`.
  `workers.dev` tego Workera zwraca Cloudflare 1042 (oczekiwane przy custom
  domain). Access na brzegu jeszcze nie: dashboard wymaga logowania, OAuth
  Wranglera nie ma uprawnień Zero Trust.
- CORS Sanity `dyuqkn8c`: dodano `https://preview.aleksandraolesiewicz.com`
  z credentials.
- Worker integracji produkcji: brakowało `BUILD_TRIGGER_URL` i
  `SANITY_WEBHOOK_SECRET`. Wdrożono kod z ignorowanego
  `worker/.dev.vars.production` (gitignored). Version
  `1c863a8d-f26b-4ead-b86e-7ce3a7cb8129`. Startup 5 ms. Producer i consumer
  `ola-site-builds-production`. Kontrola:
  `https://ola-website-integrations-production.zawlodzki.workers.dev`
  — `GET /health` 200, niepodpisany POST `/webhooks/sanity` 401
  `invalid_signature`, `POST /api/leads` 501. Webhooka Sanity produkcji nie
  utworzono, żeby zmiana treści nie wdrażała apexu.
- Podsumowanie deployu pokazało nowe sekrety URL i webhook; `BUILD_TRIGGER_TOKEN`
  nie pojawił się w tej liście bindingów. Przed podłączeniem webhooka produkcji
  sprawdzić, czy token dispatch nadal jest na Workerze. n8n nie testowano.
  Apex i staging nadal 200.

## Access preview produkcji — 2026-09-13

- W panelu Workera `ola-website-preview-production` włączono Worker Access dla
  `All traffic`. Przypięta wielokrotnego użytku polityka
  `Allow administrator with MFA` dopuszcza `grzesiek@zawlodzki.pl`; czas sesji
  wynosi 7 dni.
- Panel po zapisie pokazuje `Worker Access All traffic`, wymaganie logowania dla
  produkcji i preview oraz przypiętą politykę z akcją Allow.
- Niezależny `GET https://preview.aleksandraolesiewicz.com/` bez sesji zwrócił
  **302** do `zawlodzki.cloudflareaccess.com/cdn-cgi/access/login/...`, z
  `cache-control: private, no-store`. Ochrona na brzegu jest aktywna.

## Produkcyjny webhook Sanity — 2026-09-13

- `npx wrangler secret list --config worker/wrangler.jsonc --env production`
  potwierdził obecność `BUILD_TRIGGER_TOKEN`, `BUILD_TRIGGER_URL` i
  `SANITY_WEBHOOK_SECRET`; wartości nie zostały odczytane.
- Z powodu przypadkowego ujawnienia starej wartości podczas lokalnej kontroli
  zrotowano `SANITY_WEBHOOK_SECRET` na Workerze
  `ola-website-integrations-production` (`wrangler secret put` zakończone
  powodzeniem). Nowa wartość nie jest zapisywana w repozytorium ani w logach.
- W panelu Sanity jest aktywny webhook `publish-pages-production` dla datasetu
  `production`: POST na
  `https://ola-website-integrations-production.zawlodzki.workers.dev/webhooks/sanity`.
  Lista `sanity hook list` pokazuje go obok `publish-pages-staging`.
- Test podpisanego przepływu (2026-09-13): do leada PL `home` dodano marker
  `[pubflow-prod-20260913]`. Staging `publish-pages-staging` → **202** i deploy
  `71866d99` (19:53Z). Produkcja `publish-pages-production` → **401** (niezgodny
  podpis). Apex pozostał na wersji `f81b06e5` (16:51Z) i nie pokazał markera.
  Lead przywrócono; staging `bd7c3fcf` (20:03Z) znowu serwuje oryginalny tekst.
  Ponowny test po dodaniu sekretu (20:48Z, marker `[pubflow-prod-20260913b]`):
  staging znowu **202**, produkcja znowu **401**. Na `ola-website-production`
  (publiczny serwis) jest Secret Change 20:44Z; Worker integracji produkcji
  ostatni Secret Change ma o 19:31Z.
- Po Secret Change na `ola-website-integrations-production` (21:00Z, version
  `ac941bc8`) test markera `[pubflow-prod-20260913c]`: oba webhooki **202**
  (21:04:37Z). Apex version `eb240623` (21:06Z) serwował marker; staging
  `7d5f99fd`. Po przywróceniu leada oba webhooki **202** (21:11:31Z); apex
  `d62164ef` i staging `132cc4d6` (21:13Z) bez markera. n8n nie testowano.

## Biblioteka sekcji w katalogu — 2026-09-13

- 18 typów z planu ma renderer HTML i przykład PL/EN w `/ui/` oraz `/en/ui/`:
  hero (editorial, cinematic, split), tekst, tekst–obraz, logotypy, karty,
  lista, proces, liczby, pakiety, opinie, ekspert, FAQ, porównanie, cytat,
  wezwanie, formularz, media, powiązane artykuły. Media to kadry CSS, bez
  kopiowania zdjęć Wonderful. Film jest odnośnikiem, nie osadzonym odtwarzaczem.
- Fundamenty katalogu: stany przycisku (w tym disabled bez obniżania kontrastu),
  pole poprawne i pole z błędem. FAQ to natywne `details`/`summary`.
- Ruch: wejście sekcji po IntersectionObserver (treść w HTML bez JS), licznik
  jednorazowy, hover karty i strzałki. Reduced motion zostawia stan statyczny.
  Formularz, FAQ, tabela i karuzela nie startują z opacity 0.
- `npm run verify`: PASS. 45 testów unit; 30 E2E w Chromium/Firefox/WebKit;
  budżety JS 4684 B gzip, CSS 9361 B gzip; `/static/` bez skryptów.
- W przeglądarce: `/ui/` 1440 px (spis, hero, pakiety, FAQ otwarte, formularz
  „Dane poprawne. Nic nie wysłano.”) oraz szerokość mobilna (stacked logo,
  bez poziomego overflow). `/en/ui/` ma H1 „Component catalog” i link do `/ui/`.
- Nie sprawdzono czytnika ekranu, natywnego zoomu 200% ani urządzenia fizycznego.
  Schematów Sanity, serializerów Markdown i składania stron w CMS nie dodawano
  — to etap 4 i 5.

## Modele Sanity i szablony PL/EN — 2026-09-14

- Studio: dokumenty `page`, `article`, `author`, `category`, `service`,
  `testimonial`, `form`, `redirect`, `siteSettings`; 18 obiektów sekcji z
  walidacją i podglądem; referencje ograniczone do tego samego języka.
  Szablony tworzenia PL/EN i desk z listami per język. Singleton ustawień
  `siteSettings-pl` / `siteSettings-en`.
- Frontend składa strony z sekcji. Fixture’e bez `PUBLIC_SANITY_*`: home,
  `warsztat`/`workshop`, `wdrozenie`/`implementation`, `tylko-pl` (bez EN),
  blog z trzema wpisami na język, kategoriami, spisem treści i powiązanymi.
- TypeGen: `sanity schema extract --enforce-required-fields` i
  `sanity typegen generate` — 14 kwerend, 55 typów schematu.
- Kontrole: format, tokeny, lint i typy bez diagnostyki (Astro 110 plików,
  Studio/Preview/Worker/shared). 53 testy unit. Build publiczny, Studio,
  Preview SSR i dry-run Workera. Budżety JS 4684 B gzip, CSS 9423 B gzip.
  `check-build` obejmuje landingi, blog i brak `dist/en/tylko-pl/`.
  33 E2E w Chromium/Firefox/WebKit, w tym landingi, artykuł ze spisem
  treści i 404 `/en/tylko-pl/`.
- Nie publikowano nowej treści do datasetu `production` (stare `page` home
  PL/EN bez sekcji nadal tam są). Handshake Presentation szkicu nadal
  nie sprawdzony. Serializerów Markdown nie dodawano — etap 5.
- Nie testowano n8n. Proxied `www → cdn.webflow.com` bez zmian.

## Cleanup martwej powierzchni — 2026-09-16

Tylko ten obszar: baryłki, martwe eksporty, nieużywane pola GROQ i PNG znaku.
Bez zmian w wonderful-design-system, Bejamas, złączaniu tras PL/EN, skillach,
przepisywaniu dokumentacji i CI.

- Usunięto nieużywane `index.ts` w `src/ui/{container,eyebrow,heading,logo,media-frame,section,site-footer,site-header,text-link}/`. Zostawiono baryłki `button`, `input`, `label`, `dialog`.
- `HeroSection`: bez `titleAs="specimen"` i gałęzi `<p>`.
- Usunięto `ContentIdentity`, alias `LeadSubmissionContract`, `alternatePath`, `translationHref`.
- `demonstrationPages` / `demonstrationArticles`, `createPublishedContentClient` i `isKnownSectionType` bez eksportu.
- `BlogIndex` wymaga `featured` z trasy; bez fallbacku `articles.filter`.
- GROQ (frontend + preview): ustawienia tylko `footerNote` + `navigation` (+ id/język/tłumaczenie); artykuł bez `updatedAt` i `seo.description`; strona `seo{title}`. Pola zostają w schemacie Studio. TypeGen: 14 kwerend, 55 typów schematu.
- Usunięto PNG wordmarków; runtime i favicon zostają na SVG.

Weryfikacja: `npm run verify` PASS.
Format, tokeny, ESLint 0, Astro check 101 plików / Studio / Preview / Worker / shared bez diagnostyki.
52 testy unit (ubył test tylko pod `alternatePath`). Build publiczny, Studio, Preview SSR i dry-run Workera.
Budżety JS 4694 B gzip, CSS 9431 B gzip. 33 E2E Chromium/Firefox/WebKit.

## Następny krok

1. Wgrać demonstracyjne strony, ustawienia, artykuły i powiązania do Sanity
   najpierw jako szkice, żeby nie odpalać webhooków produkcji. Potem
   sprawdzić handshake Presentation.
2. Etap 5: serializacja Markdown, canonical, hreflang, sitemap i JSON-LD.
3. Nie testować n8n. Nie dodawać `www` jako custom domain Workera.

Nie wklejać sekretów do czatu.

## Zasada aktualizacji

Po sesji uaktualniać ten plik i checklisty: oznaczać tylko wykonane i zweryfikowane
zadania, podawać rzeczywiste wyniki i niewykonane kontrole. Istotne zmiany decyzji
odnotować z datą i powodem. Nie przechowywać sekretów.

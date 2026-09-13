# Postęp wdrożenia

Aktualizacja: 2026-09-13. Specyfikacja: [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md).

## Aktualny etap

Etap 1 — przygotowanie repozytorium i dokumentacji — zakończony.
Etap 2 trwa: lokalny frontend Astro, Sanity Studio, pobieranie opublikowanej
treści, chroniony podgląd SSR, szkielet Workera, wspólne typy i bramka jakości
działają w jednym workspace npm. Wykonano próbę trzech komponentów z etapu 3.
Deklaratywne środowiska Cloudflare są przygotowane, ale integracje Workera,
połączenie GitHub Builds i hosting nie są jeszcze wdrożone;
etapy 4–7 pozostają otwarte.

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
- Dodano osobne Astro SSR `preview/` z adapterem Cloudflare. Sanity Presentation
  aktywuje je przez oficjalny, wygasający sekret; dodatkowa podpisana sesja HttpOnly
  ogranicza dostęp do całej aplikacji. Szkice są pobierane serwerowo z tokenem Viewer.

## Decyzje obowiązujące

- Nowa marka, fundament z treściami demonstracyjnymi, bez migracji; PL/EN.
- Astro SSG, Sanity, Cloudflare Workers Static Assets; osobny chroniony podgląd.
- Wygląd z wonderful-design-system; bez konkurencyjnej palety/tokenów.
- Sekcje z wariantami w CMS; każda ma HTML, Markdown i przykład.
- Worker → Queues → n8n; n8n deduplikuje i obsługuje dalsze automatyzacje.
- Zewnętrzne self-hostowane c15t; tutaj tylko integracja i panel.
- Basic Consent Mode v2; skrypty Google dopiero po właściwej zgodzie.
- Sanity Free i Workers Paid jako założenie; limity do sprawdzenia przed wdrożeniem.

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

Brak blokad dla przygotowania repo i lokalnego szkieletu. Nie potwierdzono kont,
projektów ani poświadczeń usług. Lista przedprodukcyjna w sekcji 11 planu.
ABC Favorit nie jest dołączony — używać fallbacku.

`npm audit` po dodaniu Sanity 5.31.2 i Wranglera 4.131.1 zgłasza 8 podatności
przejściowych (4 moderate, 4 high) w łańcuchu CLI Sanity, m.in. `adm-zip`,
`js-yaml` i `uuid`. `npm audit fix` bez `--force` ich nie usuwa, a proponowany
automatyczny downgrade nadal pozostawiał podatności. Nie użyto `--force` ani
niesprawdzonych overrides. Przed wdrożeniem Studio trzeba przejść na wydanie
Sanity z poprawionym łańcuchem zależności lub udokumentować brak ekspozycji.

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

## Następny krok

Kontynuować etap 2: zaimplementować podpisany webhook Sanity i bezpieczną
koordynację buildów z testami publikacji, wycofania, usunięcia, grupowania zdarzeń
i błędu builda — nadal bez zdalnego wdrożenia. Po otrzymaniu konta, domen i danych
Sanity połączyć GitHub Builds, ustawić sekrety, Access i CORS, a następnie wykonać
odbiór na stagingu. Przed dalszym rozwojem Studio ponownie sprawdzić wydania Sanity
pod kątem opisanych podatności CLI. Nie odtwarzać próby ani nie inicjować projektu
od nowa.

## Zasada aktualizacji

Po sesji uaktualniać ten plik i checklisty: oznaczać tylko wykonane i zweryfikowane
zadania, podawać rzeczywiste wyniki i niewykonane kontrole. Istotne zmiany decyzji
odnotować z datą i powodem. Nie przechowywać sekretów.

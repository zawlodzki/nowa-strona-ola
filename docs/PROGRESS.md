# Postęp wdrożenia

Aktualizacja: 2026-10-12 (okładki e-booków bez drugiego ogłoszenia linku; pomiar Lighthouse i WCAG przed GTM; publish-content nie startuje przez runner.temp w env joba; workflow podglądu doklejał drugi sufiks nazwy Workera; suchy odczyt PMOS, ręczny tytuł SEO artykułu 11 i twarda spacja; właściciel wybrał hero V1 na „O mnie”; przegląd PR 73: lista treści w skrypcie PMOS, tytuły SEO do 60 znaków); 2026-10-11 (PMOS (PCOS), wydział w Bytomiu i historia na „O mnie”; plan GTM/c15t i trwały wybór motywu; e-booki „Wkrótce dostępny”: badge i lista oczekujących; wskaźnik 9000+ Instagram zamiast 450+); 2026-10-10 (wskaźnik 450+ jako godziny szkoleń; formularze wysyłają do n8n, `/odstapienie/`; dokumenty prawne B2C i stopka; ikony tematów w „Z kim pracuję”); 2026-10-09 („Z kim pracuję” zamiast logotypów; sticky navbar, linki i akcenty matcha; kontakt 3a; PR poprawek Sanity i bloga); 2026-10-08 (audyt CSS i aktualizacja Sanity).
Specyfikacja: [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md).
CMS: [LEGAL-CMS-CONFIG.md](LEGAL-CMS-CONFIG.md).

## Aktualny etap

### Meta jako stacked PR na GTM, 12.10.2026

- Gałąź `codex/gtm-meta` powstała na dokładnym tipie rodzica #86 `a64c8a2`.
  Rodzic zawiera main `33f3326` i zachowany pomiar Lighthouse z #84.
  Podpis 1Password przeszedł po odblokowaniu i autoryzacji. Aktualizację rodzica
  wysłano; nie wyłączano podpisów.
- Podpisany commit `9bc4c35` wysłano i otwarto
  [PR #88](https://github.com/zawlodzki/nowa-strona-ola/pull/88) do gałęzi
  `codex/gtm-rollout`. Kolejność odbioru to #86, następnie #88.
- W trakcie odbioru doszedł main `bc61a7e` z poprawką dostępności #85.
  Włączono go do rodzica `5aa44e0`, a jego dokładny tip do dziecka,
  bez force-pusha i z zachowaniem wpisów postępu obu zakresów.
- Właściciel zatwierdził PageView Meta z samymi domenami adresu i odsyłacza
  po zgodzie marketingowej. W GA4 zapisano dwa miesiące retencji użytkownika
  bez resetu. Oba automatyczne mechanizmy Meta są wyłączone; Core włączone.
- `aoTrackingState` jest wspólnym zamkniętym stanem runtime. Astro ustawia go
  przed kolejką GTM. HTML sprawdza zgodę przed pobraniem SDK i po jego
  załadowaniu. Cofnięcie ustawia `revoked` przed teardown i wykonuje
  `fbq('consent', 'revoke')`. Spóźniony grant GTM nie przywraca piksela.
- Import scalający do workspace 5 dodał tag Meta, trigger i zmienną zgody.
  Zero modyfikacji i usunięć. Ponowny eksport z 20:48 UTC odpowiada
  przygotowanej konfiguracji; zawiera trzy tagi, trzy reguły i cztery zmienne
  własne. Meta wymaga `ad_storage`, hosta produkcyjnego i rollout true.
  Rollout nadal false; nie opublikowano wersji ani nie włączono produkcji.
- Dokładny HTML ponownego eksportu z prawdziwym SDK 2.9.419 i Core dał jeden
  PageView z domenami, bez custom data ani user data. Formularz i cofnięcie
  nie dodały zdarzeń. Opóźniona konfiguracja po cofnięciu oraz awaria
  konfiguracji dały zero zdarzeń. Każde żądanie pomiarowe zablokowano przed
  siecią. SDK nadal dodaje własne identyfikatory i dane urządzenia.
  [Dowód](../output/gtm-2026-10-12/meta-sdk.json).
- Niezależny przegląd i no-comments PASS. `npm run verify` na Node 24.19.0
  PASS, 391 unit w 44 plikach, 456 E2E i dziewięć celowo pominiętych testów
  włączonego loadera. Osobny build z PUBLIC_GTM_ENABLED=true i te dziewięć
  testów PASS we wszystkich trzech silnikach. Obejmują zatrzymanie Meta,
  oczekiwanie na receipt i błąd storage. Domyślny build przywrócono.
  Kontrola CMS obejmuje 88 dokumentów bez błędów i 17 zgodnych stron.
- Core musi pozostać włączone. Zmiana SDK lub konfiguracji konta wymaga
  ponownego odbioru. Składany kontener GTM i Tag Assistant pozostają
  niesprawdzone. Kontrole natywnego zoomu, czytnika i urządzenia fizycznego
  nie były wykonane. Clarity pozostaje osobnym zakresem.
- Następny krok: odbiór stosu PR, spójne treści prawne oraz test skompilowanego
  kontenera z blokadą telemetrii. Publikacja kontenera i aktywacja pomiaru
  wymagają osobnego zatwierdzenia przygotowanej konfiguracji.

### GTM jako następny stacked PR, 12.10.2026

- Gałąź `codex/gtm-rollout` powstała na tipie #82 `d8bc1b8`. Zakres
  obejmuje bramkę GTM/GA4, wspólne wykluczenia, pole CMS i cofnięcie zgody.
  W trakcie pracy scalono #81, #82 i poprawkę CI #83. Przeniesiono zmiany
  na `origin/main` `b8e7c85`. Następnie włączono main `33f3326` z #84,
  zachowując poprawkę runner.temp i pomiar Lighthouse.
- Właściciel potwierdził wykluczenie kontaktu, konsultacji i odstąpienia.
  Newsletter nie wyklucza strony. Zapisano decyzję w konfiguracji CMS.
  Dokumenty prawne i preview zawsze pozostają bez pomiaru.
- Serwer przekazuje sześć kodów rodzaju strony, bez slugów, nazw chorób,
  tytułów i identyfikatorów dokumentu. Flaga `seo.excludeFromMeasurement`
  i `category.excludeFromMeasurement` działa w schemacie, GROQ i widokach.
  Brak pola w istniejących dokumentach oznacza niewykluczenie. Content Lake
  nie modyfikowano; schema Studio wymaga wdrożenia po scaleniu PR.
- Przegląd odtworzył przywrócenie starych zgód przy reload przed POST c15t
  i utratę częściowego wyboru. GA4 zatrzymuje się natychmiast przez
  `ga-disable`, a reload czeka na zweryfikowany trwały receipt. Błąd storage
  nie przeładowuje strony. Cleanup usuwa znane identyfikatory opcjonalne,
  zachowując wybór zgód i motyw. Testy potwierdziły obie naprawy.
- Pobrano kopię workspace 5 i opublikowanej wersji 3. Import scalający
  zmienił tylko dwa tagi, bez nowych elementów i usuwania. Ponowny eksport
  potwierdza `ONCE_PER_LOAD`, konfigurację przed ręcznym page_view,
  jeden syntetyczny adres `/m/<kod>`, pusty referrer i dodatkową zgodę.
  Rollout pozostaje false. Wersji kontenera nie opublikowano.
- GA4 konto `332767742`, usługa `462835494`, strumień `9802578320`,
  `G-9QW05JYZTL`. Wyłączono pomiar zaawansowany oraz personalizację reklam
  w 307 regionach. Google Signals było wyłączone. Retencja zdarzeń wynosi
  dwa miesiące. Po zatwierdzeniu właściciela zapisano także dwa miesiące
  dla danych użytkownika, bez resetu. Odczyt po reload potwierdził zapis.
- Potwierdzono piksel Meta `2915257895296567`, właściciel Longevity Goddess.
  Po zgodzie właściciela wyłączono automatyczne dopasowywanie danych klientów
  i automatyczne zdarzenia bez kodu. Przegląd automatyczny początkowo odrzucił
  zmianę zdarzeń bez tej konkretnej zgody. Po odpowiedzi wykonano ją i
  odczytano oba przełączniki jako „Wył.”. Nie tworzono tokenów ani kampanii.
- Rzeczywisty gtag.js w izolowanym Chromium: dwa żądania przechwycone przed
  siecią, page_view i ręczny user_engagement. Syntetyczny adres, tytuł-kod,
  pusty referrer, zero przecieków siedmiu znaczników URL/tytułu/formularza.
  Po ga-disable zero kolejnych żądań. SDK dodaje własne identyfikatory cid/sid
  i dane urządzenia. [Dowód](../output/gtm-2026-10-12/ga4-sdk.json).
  To odbiór SDK, bez skompilowanego kontenera i Tag Assistant.
- SDK Meta 2.9.419 z obecną konfiguracją Core redukuje adres i odsyłacz do
  domen. HTTP Referer nadal zawiera domenę. Bez Core samo autoConfig=false
  ujawnia pełny URL. Cofnięcie zgody zatrzymało kolejne PageView, formularz
  nie wygenerował automatycznego zdarzenia. Wszystkie wysyłki zablokowane
  przed siecią. Właściciel zatwierdził kontrakt samych domen po zgodzie marketingowej.
- Pełne `PLAYWRIGHT_WORKERS=2 npm run verify` PASS na Node 24.19.0:
  383 unit w 43 plikach, 456 E2E w trzech silnikach, 9 celowo pominiętych
  testów włączonego loadera. Osobny build PUBLIC_GTM_ENABLED=true i 9/9 tych
  E2E PASS w Chromium/Firefox/WebKit. 88 dokumentów bez błędów, 17 stron
  fixture/Content Lake zgodnych. JS 9591 B, CSS 30873 B gzip.
- Nie wysyłano telemetrii testowej, leadów, nie włączono zmiennej GitHub ani
  pomiaru produkcyjnego. Dotychczasowe copy prawne Content Lake wymaga
  uaktualnienia przed aktywacją. Meta i Clarity nie mają nowych tagów w tym PR.
- Podpis op-ssh-sign ponownie nie przeszedł po dwóch próbach. Jednorazowy
  ssh-keygen z poprawnym socketem 1Password także zwrócił błąd komunikacji
  z agentem. Po odblokowaniu przez właściciela podpis commita `61bc39f`
  przeszedł. Nie wyłączono podpisów. Kopia zakresu sprzed przeniesienia na main
  jest w stash `gtm-verified-before-main-83`.
- Otworzono [PR #86](https://github.com/zawlodzki/nowa-strona-ola/pull/86)
  do main. Kolejny podpis dokumentacji zatrzymał się na autoryzacji Touch ID;
  po ponownym odblokowaniu przeszedł w commicie `a64c8a2`.
- Następny krok: kolejny PR Meta wskazuje gałąź GTM. Następnie publikacja
  spójnego copy i kontenera oraz odbiór compiled GTM
  z blokadą telemetrii przed aktywacją. Nie wykonano natywnego zoomu 200%,
  czytnika i fizycznego urządzenia w tej sesji.

### Nazwy linków okładek, 12.10.2026

- Sześć okładek na `/ebooki/` i trzy w artykule fixture są drugim linkiem
  obok tytułu w `h3`. Dostały `aria-hidden` i `tabindex="-1"`. Czytnik
  ogłasza tytuł z nagłówka, z twardą spacją w „PMOS (PCOS)”. Klik myszą
  na okładkę zostaje. CSS bez zmian.

### Pomiar Lighthouse i WCAG przed GTM, 12.10.2026

- Zapis liczb jest w
  [LIGHTHOUSE-A11Y-BASELINE-2026-10-12.md](LIGHTHOUSE-A11Y-BASELINE-2026-10-12.md).
  Build lokalny to fixture z `9a37ca8`, `SITE_INDEXING=production`, HTTP/2 i
  brotli. W HTML nie ma GTM. Staging odpowiedział i ma `noindex`.
- Cel ≥95 na lokalnym mobile pada na blogu fixture 78, artykule fixture 88,
  O mnie 91 i stronie głównej 94. LCP strony głównej to 3152 ms, mediana
  trzech przebiegów, rozrzut 2 ms. Pozostałe lokalne szablony mobile są od 99
  wzwyż. Desktop lokalny jest 99 albo 100. Blog na stagingu jest lżejszą
  stroną i ma wydajność 100.
- Jedyny błąd axe przy tagach WCAG 2.2 AA to link bez nazwy.
  `a.ebooks3a-cover-link` na `/ebooki/` i `a.cover-link` w artykule fixture.
- Nie mierzono natywnego zoomu 200%, czytnika ekranu, urządzenia fizycznego
  ani polowego INP. Kod strony nie był zmieniany.
- Następny krok należy do pomiaru po tagach GTM, tym samym zestawem szablonów.
  Ten zapis niczego nie wdraża i nie scala.

### publish-content nie startuje, 12.10.2026

- Po scaleniu #82 (`9a37ca8`) workflow `.github/workflows/publish-content.yml`
  nie tworzy jobów. Run
  [38279694507](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38279694507)
  kończy się błędem pliku, z pustą listą jobów.
- Przyczyna. `jobs.deploy.env` ustawia `INDEXNOW_PREVIOUS_FILE` wyrażeniem
  `${{ runner.temp }}`. W `jobs.<job_id>.env` GitHub dopuszcza konteksty
  `github`, `needs`, `strategy`, `matrix`, `vars`, `secrets` i `inputs`.
  Kontekstu `runner` tam nie ma. Ten sam `runner.temp` w `steps.with` jest
  dozwolony i zostaje.
- Poprawka. Usunięto tę linię z env joba. Pierwszy krok zapisuje
  `INDEXNOW_PREVIOUS_FILE=$RUNNER_TEMP/indexnow-previous.xml` do `$GITHUB_ENV`.
  Późniejsze kroki, w tym `scripts/indexnow.ts` i `upload-artifact`, czytają
  tę samą zmienną.
- `actionlint` 1.7.7 z shellcheck 0.10.0 na wszystkich workflow kończy się
  kodem 0. Przed poprawką zgłaszał jeden błąd na linii 26.
- Nie scalano i nie wdrażano. Następny krok to odbiór tej poprawki CI.
  Konfiguracja `SITE_INDEXING` i `INDEXNOW_KEY` oraz rzeczywiste zgłoszenie
  IndexNow pozostają otwarte.

### IndexNow jako stacked PR, 12.10.2026

- Na zlecenie „push pr i idź dalej, kolejny PR jako stacked PR” wysłano
  podpisany commit `53d9928` i otwarto [PR #81](https://github.com/zawlodzki/nowa-strona-ola/pull/81)
  do main. Bazę wcześniej odświeżono do `f28988e` z #80.
  Nowa gałąź `codex/seo-indexnow` powstała na dokładnym tipie #81.
- Pierwsze podpisy op-ssh-sign oraz próba ssh-keygen przez agenta
  1Password nie przeszły. Po naprawie 1Password przez użytkownika
  podpis SSH jest poprawny, `git log %G?` zwrócił `G`. Nie wyłączono podpisów.
- Kolejny zakres SEO‑6 obejmuje model IndexNow, domyślny dry-run CLI,
  produkcyjny plik potwierdzenia i wywołanie po udanym deployu.
  Suma poprzedniej i bieżącej sitemap obejmuje usunięte URL. Wyłączony
  wariant kończy pracę przed siecią i odczytem plików.
- Niezależny przegląd wykrył logowanie klucza przez asercje błędów oraz
  utratę usuniętych URL przy Re-run jobs. Asercje używają warunków boolean
  i komunikatów bez wartości. Capture adoptuje istniejącą migawkę; workflow
  zachowuje i odtwarza artefakt danego run_id przez 7 dni. Zapis migawki
  nie zatrzymuje deployu, ale jego błąd blokuje powiadomienie.
- Odczyt GitHub potwierdził brak `SITE_INDEXING` i nazwy sekretu
  `INDEXNOW_KEY` zarówno na poziomie repo, jak i środowiska production.
  Nie odczytywano wartości sekretów; PR sam nie uruchomi zgłoszeń.
- Plik potwierdzenia powstaje wyłącznie dla produkcji, włączonej indeksacji
  i poprawnego klucza. Publiczny klucz, robots i sitemap muszą odpowiadać
  artefaktowi przed POST. HTTP 202 oznacza oczekiwanie na walidację klucza.
- Konfiguracji GitHub, CMS, indeksacji i pomiaru nie zmieniono. Nie wysyłano
  prawdziwego zgłoszenia IndexNow ani leadów. [Instrukcja](INDEXNOW-DEPLOYMENT.md).
- Kontrole właściciela: 53 testy IndexNow po poprawce ponowień PASS,
  scoped lint, format i typy PASS na Node 24.19.0.
- Końcowe `PLAYWRIGHT_WORKERS=2 npm run verify` PASS na Node 24.19.0:
  **363 unit w 41 plikach**, **429 E2E** w Chromium/Firefox/WebKit,
  **88 dokumentów bez błędów**, **17 zgodnych stron** fixture/Content Lake.
  Build publiczny, Studio, preview, Worker dry-run, budżety i SEO PASS.
  UI i budżety nie zmieniły się: JS 9214 B, CSS 30873 B gzip.
- Osobny indeksowalny build w `/tmp/ola-indexnow-production-dist` z
  syntetycznym kluczem PASS, kontrola SEO **36 stron PASS**. Plik klucza
  istnieje, ma poprawną treść i noindex w `_headers`; brak go w
  domyślnym artefakcie. Dry-run na rzeczywistych plikach: **34 URL**,
  **0 połączeń**. Klucz nie został skonfigurowany ani wdrożony.
- Cztery próby awarii kontroli artefaktu (zła treść, brak pliku,
  niepoprawny klucz, staging ze starym plikiem) zwróciły błąd bez klucza
  lub jego treści w logu.
- YAML i **8 rzeczywistych przypadków shell** z workflow PASS, polecenie
  npm zastąpiono lokalnym stubem. Ponowienie bez oryginalnej migawki
  blokuje capture i zgłoszenie; failed snapshot nie zatrzymuje deployu.
  Całego workflow
  na żywym koncie nie uruchamiano. GitHub retencja i odtworzenie artefaktu
  wymagają odbioru po osobnym uruchomieniu gotowej produkcji.
- Po końcowej poprawce guardu ponowień sprawdzono format, lint i diff;
  kod aplikacji nie zmienił się po pełnym verify. Przegląd niezależnych
  agentów zakończył się poprawą trzech ustaleń, bez pominięcia zgłoszonych
  ryzyk. Nie wykonywano natywnego zoomu, czytnika ani fizycznego urządzenia.
- Wysłano podpisany commit `f6d427e` i otwarto
  [PR #82](https://github.com/zawlodzki/nowa-strona-ola/pull/82)
  z bazą `codex/seo-full-content-exports`, dokładny tip #81 `53d9928`.
  Oba PR są otwarte do przeglądu. Nie scalano zmian. Wyniku GitHub Quality
  nie odbierano; lokalne verify nie zastępuje CI.
- Następny krok: odbiór stosu #81 → #82. Najpierw scalić #81, potem
  przestawić bazę #82 na main i odebrać końcowe CI. Zewnętrzne SEO, konfiguracja
  gotowej produkcji, rzeczywisty IndexNow i pomiar nadal pozostają otwarte.
  Nie zmieniano dopisku demonstracyjnego w CMS bloga.

### Deploy preview, podwójna nazwa Workera, 12.10.2026

- Run [38250764226](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38250764226)
  padł dwa razy na `wrangler deploy` (próba 1 o 14:44, próba 2 o 14:46 czasu
  warszawskiego). `npm ci` i build przeszły. Wrangler 4.148.0.
- Obie próby dostały HTML 504 z brzegu Cloudflare i komunikat
  `Received a malformed response from the API`. Próba 1:
  `GET .../workers/scripts/ola-website-preview-production-production/secrets`.
  Próba 2:
  `POST .../workers/scripts/ola-website-preview-production-production/assets-upload-session`.
  Ray ID próby 2: `a4963479680268e6-LAX`. Moduły miały 1723.13 KiB. Sekretów
  konta nie brakowało. To nie jest odmowa uprawnień tokenu.
- Job ustawiał `CLOUDFLARE_ENV=production` także przy deployu. Build już
  spłaszcza nazwę do `ola-website-preview-production`. Wrangler czyta zmienną
  jak `--env` i dokleja drugi sufiks, bo wygenerowany plik nie ma sekcji
  `env.production`. Lokalny odczyt na atrapie API, bez tokenu Cloudflare,
  potwierdził obie nazwy. Równoległy Deploy Studio na właściwą nazwę
  `ola-website-studio-production` zakończył się sukcesem.
- Poprawka zostawia `CLOUDFLARE_ENV` tylko na kroku buildu. Żywego
  `wrangler deploy` na konto Cloudflare nie powtarzano. Następny krok to
  scalenie poprawki i odbiór kolejnego Deploy preview z `main`.

### Pełne eksporty treści D8, 12.10.2026

- Na zlecenie „push pr i idź dalej” przygotowano wysłanie pierwszego
  zakresu i kolejny stacked PR. Bazę uaktualniono do `f28988e`,
  uwzględniając wyłącznie poprawkę workflow preview z #80 oraz dokumentację.
  Konflikt postępu rozwiązano, zachowując oba wpisy. Przegląd
  `no-comments` nowych linii nie znalazł flag ani komentarzy do usunięcia.
  Kod eksportów jest identyczny z pełnym zweryfikowanym przebiegiem.

- Main przewinięto z `657a220` do `94d8204`. Prace na lokalnej gałęzi
  `codex/seo-full-content-exports`. Lokalne dopiski do planu i postępu
  zachowano w stashu `local-docs-before-main-refresh-2026-10-12`; ich wpisy
  o Studio i Presentation są także w scalonym main. Nieśledzone materiały
  poprzednich sesji pozostały w katalogu.
- Odczyt opublikowanego Sanity `dyuqkn8c/production` potwierdził trzy
  artykuły PL: `hirsutyzm`, `pcos-co-to-za-choroba`,
  `wysoki-testosteron-u-kobiet`. Sześć e-booków ma status `planned`.
  Nie zmieniano danych, nie odtwarzano usuniętych testowych wpisów.
- Rozpoczęto otwarty zakres etapu 5 zgodnie z decyzją D8. RSS ma
  zawierać pełną treść; `llms-full.txt` ma łączyć kluczowe strony z
  istniejących serializerów Markdown. Bez archiwum bloga, kontaktu
  i dokumentów prawnych w tym drugim eksporcie.
- RSS `/blog/rss.xml` zachowuje lead w `description` i dodaje pełny HTML
  w `content:encoded`. Źródłem jest obecny serializer Markdown artykułu,
  renderowany przez ten sam pakiet co Astro. Tabele, źródła i FAQ są w
  eksporcie. Surowy HTML pozostaje tekstem; schematy adresów są ograniczone,
  linki i obrazy mają adresy absolutne. XML jest escapowany, bez CDATA.
- `/llms-full.txt` łączy Markdown kluczowych stron w stałej kolejności.
  `llms.txt` zawiera link do pełnego eksportu; `_headers` ustawia text/plain
  i noindex. Kontrola buildu porównuje pełne dokumenty z ich plikami `.md`.
- Node 24.19.0 z runtime Codex. `npm ci` PASS. Dodano bezpośrednią zależność
  `@astrojs/markdown-satteri` 0.4.1, wcześniej obecnego przez Astro. Żadna
  wersja ani wpis zainstalowanego pakietu w lockfile nie zmieniły się.
- Końcowe `PLAYWRIGHT_WORKERS=2 npm run verify` PASS na Node 24.19.0.
  Format, tokeny, lint, typy, **310 unit w 40 plikach**, build publiczny,
  Studio, preview i Worker dry-run, budżety i SEO, **429 E2E w trzech
  silnikach**, **88 dokumentów bez błędów**, **17 zgodnych stron**
  fixture/Content Lake. JS 9214 B gzip, CSS 30873 B gzip.
- Pierwsze próby zatrzymały format, brak sieci do CDN Sanity oraz błąd
  nowego porównania eksportu, które czytało tylko pierwszą linię. Kontrolę
  poprawiono, bez zmiany treści eksportu; potem ponowiono całe verify.
  Nieśledzony `output/cookie-docs-2026-10-11/before.json` sformatowano bez
  zmiany danych. Oryginalne bajty zachowano w `/tmp/ola-cookie-before-original.json`.
- Osobny build rzeczywistego, opublikowanego `dyuqkn8c/production` w
  `/tmp/ola-exports-live-dist` PASS. Kontrola SEO: **27 stron PASS**,
  noindex. RSS ma dokładnie trzy nowe wpisy, pełny HTML i poprawny XML;
  llms-full ma **10 dokumentów**. Nie przywracano usuniętych treści.
- Chromium na rzeczywistym buildzie: blog, trzy artykuły i sześć landingów
  przy **1440/390/320 px**, **30 kontroli PASS**, jeden H1 i brak overflow.
  Treść bez JS, reduced motion, **0 POST**. Przejrzano zrzut bloga desktop
  i landingu Badania przy 320 px. E2E obejmuje klawiaturę, obie palety,
  axe i CSS zoom. Nie wykonano natywnego zoomu, czytnika ani urządzenia fizycznego.
- verify-ola `ola-exports-20261012`: blog, ARIA, screenshot i `posts []`.
  `doctor` nie obsługuje macOS, bo wymaga `/proc`; jego wynik jest FAIL.
  Zamiast deklarować sukces, potwierdzono ten sam PID/port przez `lsof`
  i HTTP 200. Własne procesy sprzątnięto, dowody w `/tmp/ola-verify-evidence/`.
- Audit produkcyjnych zależności: 9 moderate i 12 high, bez critical.
  Wszystkie węzły high były już w lockfile main. Dotyczą narzędzi Sanity
  CLI/codegen i Wrangler/Miniflare, nie nowego renderera. Renderer nie ma
  zgłoszenia; zmiana nie aktualizuje tych pakietów ani nie wdraża aplikacji.
  Istniejące zależności wymagają osobnego przeglądu przed wydaniem.
- Subagent przygotował szkielet kodu, lecz zatrzymał go limit usługi.
  Główny agent dokończył implementację, przegląd, testy i odbiór. Niezależny
  przegląd drugiego agenta nie został wykonany z tego samego powodu.
- Plan i konfiguracja CMS zaktualizowane. Końcowy format i 181 lokalnych
  odnośników do plików PASS, diff-check PASS. Bez zapisu do CMS, commita, pusha
  i publikacji. Gałąź gotowa do przeglądu lokalnych zmian.
- Następny krok: uporządkować dopisek demonstracyjny w
  `page` bloga `22b9ceed-e5fb-40ae-aa08-97ae79cfed22`,
  `sections[blogCollectionSection].note`, który nadal mówi o testowych
  tytułach i datach, mimo trzech rzeczywistych artykułów. Potwierdzono pole
  odczytem CMS i screenshotem, nie zmieniono go. Potem zewnętrzny odbiór
  SEO oraz SEO‑6. Konfiguracja CMS i publikacja wymagają osobnego zlecenia.

### Naprawa Presentation Sanity, 12.10.2026

- Naprawę przygotowano w osobnym worktree `sanity-presentation-fix`.
  Bazę zaktualizowano do `2f47b8655609fb295230b688a0af9166c8d0adb5`.
  Dwa ostatnie commity zmieniały wyłącznie kontrole buildu; nowsze
  `test:build` i SEO PASS. Pierwotny katalog oraz wcześniejsze zmiany
  dokumentacji i nieśledzone pliki użytkownika zachowano.
- Logi starego Workera `ca730a63-bc13-4e51-9688-add70d299705` potwierdziły
  przerwanie SSR przez `audienceSection`. Nowy podgląd korzysta z bieżących
  rendererów. Test rzeczywistych danych ujawnił też kodowanie Stega w `tone`.
  Filtr pomija techniczne wartości, klucze obrazów i formatowanie Portable
  Text; tekst zachowuje metadane edycji. Test używa rzeczywistego encodera.
- Domena Studio jest teraz jawnym `STUDIO_ORIGIN` w konfiguracji Wranglera.
  Stary sekret `SANITY_STUDIO_URL` pozostaje niewykorzystywany. CSP dopuszcza
  produkcyjne Studio i nadrzędne `https://www.sanity.io`. Ciasteczka aktywacji
  cross-site iframe mają `Partitioned`; podpis, TTL, HttpOnly i Secure
  pozostają egzekwowane. Nie zmieniano polityk Cloudflare Access.
- W `preview/` dodano `@sanity/visual-editing-standalone` 2.0.2 i klienta
  historii. Integracja Astro wstrzykuje go wyłącznie w podglądzie. Metadane
  HTML oczyszczono ze Stega i ujednolicono białe znaki tytułów z Open Graph.
  Alias klienta w symulacji Content Lake dopasowuje teraz dokładny moduł,
  umożliwiając import czystego helpera `@sanity/client/stega`.
- Przygotowano workflow `deploy-preview.yml`, zależny od udanego Quality
  dla bieżącego `main`. Workflow uruchomi się po scaleniu PR i udanym Quality.
  README i instrukcja Cloudflare zawierają sprawdzone komendy oraz nową
  konfigurację; nie deklarują automatycznego wdrożenia.
- Weryfikacja na Node 24.19.0: format, tokeny, lint, typy, **304 unit**,
  buildy wszystkich workspace'ów, budżety i SEO PASS. Końcowe E2E w trybie
  CI: **422 passed, 1 flaky, 0 failed**; WebKit, wycofanie zgody offline,
  przeszedł dopiero przy retry. Nie ustalono przyczyny tej niestabilności.
  Ostatni pełny `verify` zatrzymał się potem na zbyt szerokim aliasie mocka.
  Po jego poprawce ponowiono cały `test:content-lake`: **88 dokumentów bez
  błędów, 17 zgodnych stron fixture/Content Lake**, SEO i budżety PASS.
  Nie deklarujemy sukcesu pojedynczego pełnego polecenia po tej poprawce.
- Wcześniejsze przebiegi E2E miały timeouty Firefox i wyścigi banera.
  Pięć scenariuszy dostało istniejącą fixture polityki c15t oraz jawne
  zamknięcie banera przed interakcją, również po nawigacji. Bez usuwania DOM,
  wymuszania kliknięć, zmiany zgód lub osłabienia asercji. **21 powtórzeń**
  zmienionych scenariuszy w trzech silnikach PASS. Trzy timeouty nie odtworzyły
  się w osobnym przebiegu; pięć izolowanych przypadków Firefox PASS.
- Lokalny Workerd z produkcyjnym artefaktem i rzeczywistym Content Lake:
  **7 stron SSR PASS** (home, O mnie, blog, e-booki, konsultacje, kontakt,
  Badania, które mają sens). Brak sesji i brak sekretu aktywacji: **401**.
  Prywatny cache, noindex i CSP sprawdzone. Bez wysyłki leadów do produkcji.
- Audit zależności produkcyjnych preview zgłasza cztery high w łańcuchu
  Wrangler / Vite plugin / Miniflare / Sharp. Dotyczą lokalnego narzędzia
  i librsvg w zagnieżdżonym Sharp 0.35.4. Ten pakiet nie jest w bundlu
  Workera; preview ma `imageService: compile`, a build przetwarza zaufane
  zasoby repo. Nowy standalone nie dodaje zależności runtime. Brak ekspozycji
  tego łańcucha w wdrożonym SSR; nie wykonywano `audit fix --force`.
- Produkcyjny build i dry-run PASS. W ramach zleconej naprawy wdrożono
  wyłącznie `ola-website-preview-production`, wersję
  `bd29bfe8-6c3d-444b-952d-cb2147a7d40d`. Publicznej strony i treści Sanity
  nie publikowano. Niezalogowany odczyt domeny nadal zwraca **302 do Access**.
- Zalogowany odbiór potwierdził handshake w panelu Sanity i bezpośrednim
  Studio: strona widoczna, `Edit` aktywny, dokument `page-home-pl` rozpoznany.
  Mobilny viewport Presentation działa; przywrócono desktop. Bezpośrednie
  Studio: zero błędów konsoli. Nie zapisywano treści pól CMS. Natywny zoom
  200% w Studio, czytnik i urządzenie fizyczne pozostają niewykonane.
- Na zlecenie „push pr” wypchnięto podpisany commit `39b1643` na gałąź
  `codex/sanity-presentation-fix` i otwarto
  [PR #79](https://github.com/zawlodzki/nowa-strona-ola/pull/79).
  Quality uruchomiło się na GitHub; wynik pozostaje oczekiwany.
  Następny krok: odebrać Quality na PR, scalić po akceptacji i potwierdzić
  automatyczne wdrożenie preview z main. Workflow nie był uruchomiony.

### Naprawa blokady Studio Sanity, 12.10.2026

- Zlecenie „napraw” realizowano w izolowanym worktree
  `sanity-studio-fix`, na aktualnym main
  `7d8bf85172d7c134cf878d29c64ad8567a5c7f9f`. Zachowano lokalną gałąź,
  dokumentację diagnozy oraz nieśledzone pliki użytkownika.
- Testy udostępniania artykułu, kolekcji e-booków i formularza kontaktu
  używają teraz istniejącej fixture polityki c15t i zamykają baner przyciskiem
  „Zamknij bez zmiany zgód” przed dalszą interakcją. Helper oczekuje widocznego
  banera, klika i potwierdza jego ukrycie. Nie usuwa DOM, nie wymusza kliknięć,
  nie zmienia stanu zgód ani asercji testowanych funkcji. Kod aplikacji i schemat
  nie wymagały zmian; brakujące pola są już na main.
- Pierwotny test udostępniania przeszedł lokalnie sześć prób Firefox, także
  z kontrolowaną awarią c15t. Nie odtworzono jego timeoutu z Ubuntu CI.
  Poprawka usuwa asynchroniczne pojawienie się banera z tego scenariusza.
  Po zmianie 18 powtórzeń artykułu/kolekcji w trzech silnikach PASS.
- Pierwsze pełne verify: 300 unit PASS, 422 E2E PASS i 1 błąd Firefox
  w kontroli fokusu newslettera na kontakcie. Test kontaktu otrzymał ten sam
  kontrolowany stan początkowy, po czym 9 powtórzeń w trzech silnikach PASS.
  Nie ustalono osobno przyczyny utraty fokusu z pierwszego przebiegu.
- Końcowe `PLAYWRIGHT_WORKERS=2 npm run verify` na Node 24.21.0 PASS:
  format, tokeny, lint, typy, 300 unit w 37 plikach, buildy wszystkich
  workspace’ów, budżety i SEO, 423 E2E, 88 dokumentów bez błędów,
  zgodny DOM 17 stron fixture/Content Lake. Bez wysyłki leadów na produkcję.
- Osobny produkcyjny build Studio dla `dyuqkn8c/production` i originu
  `https://preview.aleksandraolesiewicz.com` PASS. Bundle
  `/static/sanity-BugRvHgS.js` zawiera wszystkie 11 pól. Dry-run Wranglera
  4.148.0 dla `ola-website-studio-production` PASS, 32 pliki zasobów.
- Zalogowana sesja Studio potwierdziła ostrzeżenie o 11 polach przed naprawą.
  Publikacja dokumentu była nieaktywna; nie edytowano ani nie usuwano danych.
- Pierwszy deploy został odrzucony przez automatyczną kontrolę uprawnień.
  Po wyraźnej zgodzie użytkownika na wdrożenie i push/PR wykonano
  `npm run deploy:studio` PASS. Wersja Cloudflare
  `4ffa4951-2ce0-444c-8a50-354a27552705`; odczyt hostowanego HTML i bundla
  jest identyczny z przygotowanym artefaktem.
- `sanity deploy --external --url https://studio.aleksandraolesiewicz.com
--yes --schema-required` PASS, wdrożono 1/1 schematów i zarejestrowano
  istniejący panel. MCP wskazuje schemat
  `uEiC9KTI3ZMUpceRzuybhUYV6tV1-WdK1S1u5Lk3PeJ2A4g`, z 11 polami.
  Wcześniejsza próba z `--no-build` została zatrzymana przez CLI, ponieważ
  nie można łączyć tej flagi z `--external`; standardowe polecenie przeszło.
- Zalogowany odbiór pięciu landingów PL: wszystkie 11 pól jest dostępnych
  w formularzu, zero „Unknown fields found”.
  Pięć rewizji `_rev` przed i po wdrożeniu jest identycznych. Nie edytowano
  ani nie publikowano treści; karta artykułu użytkownika pozostała zachowana.
- Zatwierdzony push `codex/sanity-studio-consent-tests` wykonano; otwarto
  [PR #76](https://github.com/zawlodzki/nowa-strona-ola/pull/76). Podpisany
  commit poprawki: `a36c901`. Quality na GitHub jest w toku, nie deklarowano
  sukcesu CI ani nie scalano PR. Format i 135 lokalnych odnośników PASS.
- Następny krok: potwierdzić Quality i po odbiorze PR/scaleniu sprawdzić
  automatyczne wdrożenie z main. Ręczna naprawa Studio już działa.

### Nazwa PMOS (PCOS) i usunięcie plików recenzji, 12.10.2026

- Z repozytorium usunięto osiem plików `output/ebook-landings-3a-2026-10-11/`.
  Skrypt `scripts/prepare-ebook-landings.ts` nadal może je zapisać lokalnie
  i nie wysyła danych do Sanity. Nie uruchamiano go.
- W `badania-ktore-maja-sens.ts` i `szczupla-a-jednak-pcos.ts` samodzielne
  „PCOS” w copy dla odwiedzających jest „PMOS” plus twarda spacja U+00A0 plus
  „(PCOS)”. Dzięki temu nagłówek nie łamie „(PCOS)” do osobnej linii.
  Tytuł SEO szczupłego e-booka napisano ręcznie:
  „Szczupła, a jednak PMOS | E-book Aleksandry Olesiewicz” (54 znaki).
  Pełna forma ma 61 znaków. Zostały „Wytyczne PCOS 2023” i zdania, które
  cytują te wytyczne. Slugi bez zmian. Oferta suplementów bez zmian.
- Sanity nie było zapisywane. Opublikowane dokumenty PL nadal mają poprzednie
  zdania. Lista zamian jest w konfiguracji CMS.
- Etykiety „E-book · Szczupła, a jednak PCOS” nie ruszano. Bierze się z tytułu
  produktu w `homepage-seed.ts`, który zmienia PR #73.
- Kontrola 12.10.2026 na Node 24.21.0. `npm run verify` doszedł do e2e.
  Format, tokeny, lint, check, 290 unit, build, build workspace’ów i test
  buildu PASS. Przy dwóch workerach WebKit raz nie zdążył przejść z polityki
  prywatności na listę cookies. Ten sam test w izolacji PASS. Pełne e2e
  przy jednym workerze: 423 PASS w Chromium, Firefox i WebKit.
  `npm run test:content-lake` PASS, 17 stron o tym samym DOM.
- verify-ola na `http://127.0.0.1:4340`, run `ola-1791780614`. Oba landingi
  zwracają 200. Snapshot ARIA pokazuje nowe zdania. `browser posts` dało `[]`.
  Przy 320, 390 i 1440 „(PCOS)” nie zostaje samo w linii, a strona nie
  wychodzi poza szerokość okna. Na wąskim hero „Masz” jest nad
  „PMOS” z twardą spacją i „(PCOS).”.

### Suchy odczyt PMOS, tytuł SEO i twarda spacja, 12.10.2026

- Żywy tytuł SEO `article-blog-11-en` ma 62 znaki.
  `Conflicting advice on PMOS (PCOS): write down what you want to`.
  Notatka z 08.10.2026 podała ten sam napis jako 55 znaków. To była zła
  liczba. Plan na `952d5e1` zamieniał go na ucięte
  `Conflicting advice on PMOS: write down what you want to` (55).
- Po poprawce ten dokument i szkic `drafts.article-blog-11-en` dostają
  ręczne `Conflicting advice on PMOS: write down what to clarify` (54).
  Innych ręcznych tytułów nie ma. Artykuły 06 i 09 zostają, bo żywy tytuł
  ma już mniej niż 60 znaków i nie zawiera PMOS (PCOS). Tytuł, który po
  samym skrócie PMOS nadal ma ponad 60 znaków, zostaje bez zmian i trafia
  do raportu. Skrypt nie ucina znaków.
- Tekst dla gościa ma U+00A0 między PMOS a (PCOS). Tytuł strony, opis
  meta, RSS i JSON-LD mają zwykłą spację. Na zbudowanej stronie e-booka
  ciało ma 9 par z twardą spacją i zero ze zwykłą. JSON-LD ma 5 par ze
  zwykłą spacją i zero twardych. `<title>` nie ma twardej spacji.
- `npm run verify` na Node 24.21.0 skończył się kodem 1 przez jeden test
  WebKit. Format, tokeny, lint, `astro check`, 291 testów unit, build,
  build workspace, `test:build` i 392 testy E2E przeszły. Odpadł
  `consultation page without an English version` w WebKit. Odpowiedź FAQ
  została ukryta po kliknięciu. Pytanie nie zawiera PMOS. Osobne
  powtórzenie tego testu przeszło w 2,9 s. `test:content-lake` przeszedł
  osobno, 12 stron. CSS gzip 30867 B. Strona główna 8192 B. „O mnie”
  8161 B. SEO 36 stron.
- verify-ola `ola-1791781512` na `http://127.0.0.1:4340`. Nagłówek
  „Masz PMOS (PCOS) i pełną półkę.” jest widoczny. H1 „O mnie” to
  „Jestem Ola. Znam PMOS od środka.” Lead ma PMOS (PCOS). `browser posts`
  zwrócił `[]`. Sanity nie było zapisywane. Nic nie zostało scalone
  ani wdrożone.
- Następny krok. Właściciel powtarza suchy odczyt z tokenem. `--write`,
  scalenie i wdrożenie zostają po jego stronie.

### Hero „O mnie”, wariant V1, 12.10.2026

- Właściciel wybrał „Jestem Ola. / Znam PMOS / od środka.” Lead zostaje
  z pierwszym „PMOS (PCOS)”. Angielski tytuł to „I am Ola. / I know PMOS /
  from the inside.”, bo reszta strony mówi „I am”, nie „I'm”.
- Źródło to `aboutCopy.heroTitle`. Fixture czyta to pole. Plan
  `import:pmos-rename` ustawia `sections[_key=="about-hero"].title`
  i nie rusza leadu.
- Zmierzone linie na zbudowanej stronie, przy 320, 390 i 1440, to trzy.
  „Jestem Ola.”, „Znam PMOS”, „od środka.” Lead zawiera „PMOS (PCOS)”.
  CSS bez zmian. „O mnie” ma 8161 B przy limicie 8192 B.
- `npm run verify` na Node 24.21.0 zakończył się kodem 0. Format, tokeny,
  lint, `astro check`, 289 testów unit, build, build workspace,
  `test:build`, 393 testy E2E w Chromium, Firefox i WebKit oraz
  `test:content-lake` (12 stron) przeszły. CSS gzip 30867 B. Strona główna
  8192 B. SEO 36 stron.
- verify-ola `ola-1791779534` na `http://127.0.0.1:4340/o-mnie/`. H1 to
  „Jestem Ola. Znam PMOS od środka.” Lead ma „PMOS (PCOS)”. Pusty
  newsletter dał `browser posts` `[]`. Sanity nie było zapisywane.
  Nic nie zostało scalone ani wdrożone.
- Następny krok. Właściciel uruchamia suchy odczyt z tokenem. `--write`,
  scalenie i wdrożenie zostają po jego stronie.

### Przegląd PR 73, 12.10.2026

- `planPmosRename` pomija dokumenty spoza listy treści. Lista to `article`,
  `author`, `category`, `ebook`, `form`, `page`, `service`, `siteSettings`.
  Poza nią zostają opinie, strony prawne i przekierowania. Identyfikator
  zaczynający się od `_.` albo `sanity.` oraz typ `sanity.*` i `system.*`
  też odpadają. Tytuł i zakres w `sources` zostają, bo to opublikowana
  nazwa wytycznych.
- Opinie klientki, „Wytyczne PCOS 2023” i regulamin newslettera 2.1 są
  w fixture i w seedach takie jak przed podmianą. Słowa „przy PCOS”
  w regulaminie zostają.
- Tytuł SEO skraca się dopiero, gdy po podmianie ma więcej niż 60 znaków.
  Tytuł, który już się mieści, zostaje z „PMOS (PCOS)”. Widoczny H1 artykułu
  zostaje dłuższy niż tytuł w `<title>`.
- Do wyboru właściciela tytuł w kodzie był „Jestem Ola. / Znam PMOS (PCOS) /
  od środka.”. CSS nie ruszane. „O mnie” ma 8161 B przy limicie 8192 B.
  V4 nie mieści się w trzech liniach przy 320 i 1440. Przy 320 i 1440
  trzecia linia to „(PCOS) od”, a czwarta „środka.”. Przy 390 są trzy
  linie, a trzecia zaczyna się od „(PCOS) od środka.”. Wybrany V1 jest
  w sekcji powyżej.
- Suchy odczyt datasetu nie wystartował. Brak tokenu. Skrypt wypisał, że
  nie wysyła zapytania. Na 88 dokumentach lokalnego planu content-lake
  plan PMOS ma 0 zmian i 0 problemów. Nie ma w nim dokumentów `_.`, opinii,
  stron prawnych ani ścieżek `sources`. To nie jest liczba łatek na żywym
  datasetcie.
- Kontrole na Node 24.21.0, commit przed notatką `2264ea2`. Format, tokeny,
  lint, `astro check`, 289 testów unit, build, build workspace i
  `test:build` przeszły w `npm run verify`. CSS gzip 30867 B. Strona główna
  8192 B. SEO 36 stron. E2E to 393 testy w Chromium, Firefox i WebKit.
  Pierwszy przebieg miał 391 zaliczeń i 2 odpadki Firefox (hover
  „Udostępnij” zasłonięty banerem zgód, pusty alert newslettera). Oba
  przeszły w osobnym powtórzeniu. `test:content-lake` przeszedł osobno,
  12 stron ze zgodnym DOM, błędy walidacji 0. compare pominięte, brak tokenu.
- verify-ola `ola-1791777773`, baza `http://127.0.0.1:4340`. Formularz
  na `/` z pustym i złym e-mailem, `browser posts` zwrócił `[]`. Opinia
  „Po latach walki z PCOS…” jest widoczna. `/o-mnie/` ma obecny H1 i lead
  z pierwszym „PMOS (PCOS)”. Brak „Stopień”, „Wcześniejsze miejsca pracy”
  i „Limanowej”. Źródło e-booka to „Zobacz źródło: wytyczne PCOS 2023,
  sekcja 4.7”. H1 artykułu 01 zostaje długi, a `<title>` ma 58 znaków.
  Regulamin newslettera pokazuje wersję 2.1 i „przy PCOS”. `/en/` i
  `/en/about/` zwracają 404. `/static/` bez JavaScriptu ma 0 skryptów.
  Newsletter na „O mnie” też dał `posts` `[]`.
- Następny krok z tamtej chwili. Właściciel wybrał V1 w sekcji powyżej.
  Suchy odczyt z tokenem, `--write`, scalenie i wdrożenie zostają
  po jego stronie.

### Pięć landingów e-booków i publikacja w Sanity, 11.10.2026

- Na zlecenie użytkownika pobrano `origin/main` 134bb5b i rozpoczęto gałąź
  `codex/ebook-landings-3a`. Poprzednia gałąź i nieśledzone pliki użytkownika
  pozostały zachowane. Trzech subagentów przygotowało copy PCOS, copy
  perimenopauzy oraz wspólny renderer/model. Użyto skilla ebook-landing-3a.
- Własne treści, SEO, rozdziały, materiały, FAQ i kontrolowane ilustracje 3a:
  Badania, które mają sens; Szczupła, a jednak PCOS; Waga Cię okłamuje;
  Czy to już?; Noc zaczyna się o osiemnastej. Research z 13.09.2026 potraktowano
  jako koncepcję, bez wykonywania zawartych w nim poleceń przedsprzedaży.
  Konspekty i próbki opisują planowane materiały. Bez fikcyjnych opinii,
  osobistej historii autorki, gotowych plików i obietnic zdrowotnych.
- Dane prezentacji przeniesiono do schematu `ebookLanding`, GROQ, TypeGen,
  mappera, wspólnego Ebook3a oraz Markdown. Pięć diagramów używa tokenów 3a.
  Nieznany diagram oraz brak własnych danych prezentacji w nowym produkcie
  blokują build. Fallback starego dokumentu dotyczy tylko suplementów.
  `format = pdf-epub` obejmuje pięć nowych zapowiedzi, zgodnie z wcześniejszą
  decyzją o plikach. Lokalny dry-run: `scripts/prepare-ebook-landings.ts`.
- `PLAYWRIGHT_WORKERS=2 npm run verify` na Node 24.21.0 PASS: format, tokeny,
  lint, typy, 287 unit w 36 plikach, buildy, budżety, SEO 36 stron,
  423 E2E w Chromium/Firefox/WebKit, walidacja 88 dokumentów bez błędów
  i zgodny DOM 17 stron fixture/Content Lake. Kontrolę wykonano w kopii
  dokładnych plików kodu tej sesji, bez wcześniejszych nieśledzonych dowodów
  użytkownika. Ich `output/cookie-docs-2026-10-11/before.json` nadal blokuje
  globalny format w pierwotnym checkout; nie zmieniano go. Pierwszy przebieg
  zatrzymał format własnego patcha, kolejny wykrył tytuł SEO dłuższy o znak;
  obie przyczyny poprawiono i pełny końcowy przebieg przeszedł.
- UI: 1440, 390 i 320 px bez poziomego przepełnienia; klawiatura, akordeony,
  dialog listy oczekujących i powrót fokusu, oba motywy, axe, CSS zoom 200%,
  reduced motion i treść bez JS PASS. Obejrzano okładki, diagramy i karty
  na zrzutach. Nie sprawdzono fizycznego Safari/iOS, czytnika ekranu,
  natywnego zoomu 200% ani nowego UI hostowanego serwisu. Zewnętrzne żądania
  były blokowane podczas kontroli wizualnej; zero wysłanych formularzy.
  Pliki dowodów z `output/ebook-landings-3a-2026-10-11/` usunięto z repozytorium 12.10.2026.
- W Sanity zachowano pełną kopię pięciu dokumentów, zapisano zakres patcha
  z blokadą rewizji, porównano szkice i opublikowano dokładnie pięć dokumentów
  PL w `dyuqkn8c/production`. Odczyt opublikowanych danych MATCH; zachowane
  pozostałe pola, cena 97 PLN, `availability = planned`, referencje okładek,
  autorki i listy oczekujących. Pierwszego ebooka i dokumentów EN nie zmieniano.
  Pliki JSON tej publikacji usunięto z repozytorium 12.10.2026. Opis zapisu zostaje w tym akapicie.
- `sanity schema deploy` PASS. Sam legacy schema nie aktualizował schematu
  istniejącego Studio wybieranego przez MCP. Automatyczna kontrola odrzuciła
  rejestrację Studio jako wymagającą osobnej zgody. Po jawnej zgodzie
  użytkownika `sanity deploy --external --url https://studio.aleksandraolesiewicz.com
--yes --schema-required` PASS; odczyt schematu MCP potwierdził nowe pola.
  To aktualizacja rejestracji i schematu, bez wdrożenia plików panelu na Cloudflare.
- Build z `PUBLIC_SANITY_PROJECT_ID=dyuqkn8c PUBLIC_SANITY_DATASET=production`
  po publikacji PASS, 40 stron. Użył rzeczywistych opublikowanych danych,
  bez klienta symulacji Content Lake. Budżety i SEO PASS, dodatkowy odbiór
  pięciu landingów na tym buildzie: 30/30 E2E w trzech przeglądarkach.
  Końcowe kontrole dokumentacji: format PASS, 189 lokalnych odnośników
  bez braków. Porównanie 20 plików kodu z kopią weryfikacji: identyczne;
  `git diff --check` PASS.
- Następny krok: scalić kod do main, potwierdzić wdrożenie frontendu oraz
  plików Studio i odebrać pięć stron na hostowanym serwisie. W pierwszej części
  pracy nie wykonywano push.

### Push i PR pięciu landingów

- Na dodatkowe polecenie użytkownika „pr push” utworzono podpisany commit
  `d2c3216` i wypchnięto `codex/ebook-landings-3a` do origin. Otwarto
  [PR #74](https://github.com/zawlodzki/nowa-strona-ola/pull/74) do main.
- Zakres: 34 pliki kodu, treści, schematu, testów, dokumentacji i dowodów tej
  sesji. Dołączono zbiorczy podgląd hero. Pełne zrzuty pozostają lokalnie;
  wcześniejsze nieśledzone pliki użytkownika nie trafiły do commita.
- Format własnych plików i `git diff --check` PASS. Ponowne porównanie
  20 plików kodu z kopią, która przeszła pełne verify: brak różnic. Nie
  powtarzano testów aplikacji bez zmiany kodu. Pierwszy podpis przerwał
  błąd 1Password; ponowienie w interaktywnym terminalu zakończyło się
  poprawnym podpisem. Ustawienia podpisywania pozostały zachowane.
- Następny krok: odbiór PR i CI, scalenie, potwierdzenie wdrożeń frontendu
  oraz Studio i pięciu landingów na hostowanym serwisie.

### PMOS (PCOS), wydział i historia na „O mnie”, 11.10.2026

- Gość widzi PMOS (PCOS). Pierwsze wystąpienie w zdaniu ma skrót w nawiasie.
  Kolejne w tym samym zdaniu jest samym PMOS. Slugi, identyfikatory i
  `topic: "pcos"` zostają. Mockup kolekcji e-booków nadal mówi PCOS.
- Wydział w treści i w JSON-LD to Wydział Zdrowia Publicznego w Bytomiu.
- Strona „O mnie” i Markdown nie pokazują wiersza stopnia ani wcześniejszych
  miejsc pracy. JSON-LD zostawia `educationalLevel` „Licencjat” oraz `alumniOf`
  ze szpitalem w Limanowej i SPZOZ w Myślenicach.
- Historia ma dwa nowe akapity o własnym doświadczeniu i studiach. Podpis
  i alt zdjęcia opisują pracę dyplomową.
- Kategorie bloga sortują się po tytule, więc Perimenopauza stoi przed
  PMOS (PCOS).
- `npm run import:pmos-rename` planuje jedną transakcję i domyślnie nic nie
  zapisuje. W tym środowisku nie ma tokenu Sanity, więc suchy odczyt datasetu
  nie wystartował. `--write` nie był uruchomiony. Sanity nie było zapisywane
  i nic nie zostało wdrożone.
- Kontrole na Node 24.21. Format, tokeny, lint i `astro check` przeszły.
  Testy unit to 288 zaliczeń. Build, build workspace i `test:content-lake`
  przeszły. CSS gzip ma 30867 B. Strona główna ma 8192 B przy limicie 8192 B.
  „O mnie” ma 8161 B, czyli 31 B zapasu. SEO to 36 stron. E2E to 392 zaliczenia
  w Chromium, Firefox i WebKit. Jeden test WebKit newslettera (fokus pustego
  pola) odpadł za pierwszym razem i przeszedł przy powtórzeniu. verify-ola
  na `/`, landingu suplementów i `/o-mnie/`. Widoczny tekst nie ma „Stopień”,
  „Wcześniejsze miejsca pracy” ani „Limanowej”. `browser posts` po pustym
  newsletterze zwrócił `[]`. Przy 390 px i 1440 px przepełnienie poziome
  ma 0 px. W `dist` jest 678 wystąpień wewnątrz „PMOS (PCOS)” i zero samotnych
  PCOS.
- Następny krok. Właściciel uruchamia suchy odczyt z tokenem. Zapis do
  datasetu jest osobnym `--write`. Scalenie i wdrożenie zostają po jego stronie.

### Kwalifikacje Oli na „O mnie” i w JSON-LD, 11.10.2026

- Dane od użytkownika, ze zgodą na publikację: licencjat, kierunek Dietetyka,
  specjalność dietetyka kliniczna, ŚUM w Katowicach, Wydział Zdrowia Publicznego
  w Bytomiu, 2025. Praktyka od 2022. Dwa wcześniejsze miejsca pracy
  i sześć szkoleń. Wartości i mapowanie: [konfiguracja CMS](HOMEPAGE-CMS-CONFIG.md).
- Schemat `author`: `credentials[]` z nowymi polami `level`, `specialization`,
  `department`, `issuerKind` i rodzajem „Szkolenie”, do tego `practiceSince`
  i `experience[]`. GROQ (siteOwner i credentialsSection), TypeGen, mapper,
  wspólne `src/content/credentials.ts`, renderer About3a, serializer Markdown
  z przykładem i fixture z jednego źródła `site-identity.ts`.
- JSON-LD: `hasCredential` z `educationalLevel` i `recognizedBy` z wydziałem.
  Szkolenia prowadzone przez osoby nie mają `recognizedBy`, bo przyjmuje
  ono tylko organizacje. Miejsca pracy trafiają do `alumniOf`.
- Copy poprawione dla zgodności z dyplomem („dietetykę ze specjalnością
  dietetyka kliniczna”) na „O mnie” i w konsultacjach, wraz z podpisem dyplomu.
  Tytuły szkoleń NucleoCare zapisane w zdaniowej pisowni, bez cudzysłowu.
- Kontrole: format plików repo PASS. Lokalne dowody
  `output/cookie-docs-2026-10-11/before.json` są niesformatowane
  i nieśledzone, dlatego ich nie zmieniano. Tokeny, lint i `astro check`
  PASS, 281 testów unit PASS, build i build workspace PASS.
  `check-build` na Node 26.11 jest czerwony: CSS strony głównej ma 8215 B
  przy limicie 8192. Ten sam wynik daje main bez zmian, a CI na Node 24 przeszedł.
  Na Node 24.21 (`npx -p node@24`) `check-build` i `check-seo` (36 stron) PASS.
  E2E: 391/393, dwa błędy Firefox (udostępnianie artykułu, dialog zgód)
  przeszły 4/4 przy powtórzeniu. `test:content-lake` PASS, 12 stron ze zgodnym DOM.
  Obejrzano sekcję przy 1440 px i 320 px, bez poziomego przepełnienia.
  Nie sprawdzono ciemnego motywu, zoomu 200% ani czytnika ekranu.
- Na polecenie użytkownika wdrożono schemat z lokalnego Studio
  (`sanity schema deploy`, 1/1). Hostowane Studio wdroży workflow
  `Deploy Studio` dopiero po scaleniu do main. W `author-ola-pl` podmieniono
  `credentials` (7 pozycji, `isPublic: true`), `practiceSince` i `experience`.
  Zmianę zapisano z blokadą rewizji `BgWLAXsKsMgTSzpAsHKkan`, a szkic
  porównano z `site-identity.ts` (MATCH) przed publikacją. Poprzednie
  wartości są w `output/author-credentials-2026-10-11/before.json`.
  Na dodatkowe polecenie opublikowano też zdanie o studiach i podpis dyplomu
  w `page-about-pl/en` oraz `page-consultation-pl/en` (sekcja ekspertki).
  Przed publikacją sprawdzono, że szkice są zgodne z tekstem z kodu.
  Zmiana była zabezpieczona blokadą rewizji. Poprzednie wartości są
  w `output/author-credentials-2026-10-11/pages-before.json`.
- Publikacja uruchamia webhook stagingu, który buduje kod z main. Do scalenia
  PR staging ma kwalifikacje w JSON-LD, ale nie pokazuje ich na stronie,
  a trenerzy są tam opisani jako organizacje. Webhook produkcji był wyłączony.
- Następny krok: scalić PR, potwierdzić `Deploy Studio` i staging, ręcznie
  zwalidować JSON-LD w Rich Results Test.

### Checklista etapu 5 po scaleniu #69 i #70, 11.10.2026

- Lokalny main przewinięto do `origin/main` (657a220). Starszą lokalną
  kopię zmian z PR #69/#70 odłożono do stasha, skąd można ją odzyskać.
- W planie zaznaczono serializery Markdown, canonical/.md/sitemap/robots/
  RSS/llms.txt, JSON-LD z kontrolą buildu i kontrole adresów oraz linków.
  Na podstawie wcześniejszych wpisów (check-seo 36 stron PASS, verify PASS).
  Bez nowego uruchomienia testów w tej sesji.
- Otwarte: hreflang (po włączeniu EN), ręczna walidacja Rich Results,
  dane SEO w Sanity i deploy Studio, D3, SEO‑6.
- Sesja pytań o otwarte decyzje: odpowiedzi zapisano w
  [konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md) (sekcja na górze) i w planie SEO
  (D3, D5, D6, D8). Najważniejsze zmiany kierunku: RSS z pełną treścią,
  własny checkout e-booków (PDF + EPUB), pomiar GA4/Meta/Clarity domyślnie
  wszędzie z listą wykluczeń (prawne, formularze, konsultacje, pole w Sanity),
  bez radcy prawnego, start produkcji jak najszybciej. Nic nie wdrożono.
- Konflikt do rozwiązania przed publikacją tagów: polityka prywatności 2.2,
  lista cookies i plan GTM zakładają blokadę pomiaru na treściach zdrowotnych.
- „O mnie”: układ i copy zaakceptowane; rozwinięcie historii czeka na
  potwierdzenie Oli. Odhaczono nieaktualne punkty tej sekcji w planie
  (mockup na main, About3a w kodzie, link Cal.com ustalony).
- Następny krok: plan minimalnego zakresu do startu produkcji, potem
  przeniesienie treści do szkiców Content Lake (etap 4a).

### Baner zgód na telefonie, 11.10.2026

- Z gałęzi usunięto pliki recenzji dodane tylko w tym PR. `git diff origin/feat/seo-geo-aeo --stat -- output .audit` jest pusty. Zostały `output/design-consistency-3a/`, `output/design-system-3a/` i `.audit/matcha-accent-3a.tsv`.
- Na 390×844 baner ma 278,5 px, czyli 33,0% wysokości, w Chromium, Firefox i WebKit. Pomiar jest przy pustej linii statusu, po udanym odczycie fixture `/init`. Trzy przyciski mają po 111×50 px i stoją w jednym rzędzie. Na 320×640 baner ma 409 px (63,9%) i nie przewija się. Trzeci przycisk schodzi do drugiego rzędu, bo trzy kolumny nie mieszczą słowa „opcjonalne”. Na 1440×900 baner ma 268 px (29,7%), mniej niż wcześniejsze 38%.
- Kropka między linkami zniknęła z banera i z dialogu ustawień. Treść prawna PL i EN jest bez zmian.
- CSS strony głównej ma 8192 B gzip, przy limicie 8192. Łącznie CSS ma 30850 B gzip, przy limicie 32768.
- Przeszły format, tokeny, lint, typy i 280 testów jednostkowych, a także build, build workspace i `test:build`. Consent e2e dał 42/42 w Chromium, Firefox i WebKit. Pełne e2e dało 393/393 w drugim przebiegu. Pierwszy przebieg miał jeden błąd WebKit w teście ebooka bez wersji angielskiej. Ten sam test przeszedł dwukrotnie osobno. `verify-ola` na porcie 4340 przeszedł doctor, otworzył baner i dialog, zamknął go Escape i odczytał POST `[]`.
- Nie zmieniano Sanity. Nie wdrażano stagingu, Studia ani produkcji.
- Następny krok to odbiór PR #70. Najpierw scalić SEO #69.

### Przygotowanie PR i push, 11.10.2026

- Polecenie użytkownika obejmuje push i otwarcie PR dla zmian strony.
  Wydzielono worktree i gałąź `codex/ola-consent-cookies-theme` z bazy
  PR #69 `feat/seo-geo-aeo`. Porównanie zawartości potwierdziło wyłącznie
  zakres c15t, motywu, cookies i powiązanych testów oraz dokumentacji.
  Pierwotny checkout ze zmianami SEO pozostał zachowany.
- Dokładna gałąź PR przeszła `PLAYWRIGHT_WORKERS=2 npm run verify`
  na Node 24.19.0: 280 unit, 393 E2E, buildy i 12 zgodnych stron Content Lake.
  Pierwszy przebieg zatrzymał format nowego proof.json; poprawiono go,
  a pełna ponowna kontrola przeszła. Dowód `pr-verification.json` w
  `output/consent-2026-10-11/`.
- Niezależny przegląd zakresu i komentarzy nie znalazł blokera implementacji.
  Poprawiono dwie nieaktualne deklaracje stanu; z PR wyłączono zrzut GTM
  z danymi konta operatora. Lokalny zrzut pozostaje zachowany.
- Repo prawne nie ma remote. Użytkownik potwierdził, że ma być zapisywane
  lokalnie. Sześć dokumentów ma commit `481f81b` na osobnej gałęzi;
  nie dołączono `.DS_Store` ani katalogu incydentów.
- Następny krok: odbiór PR. Najpierw scalić SEO #69, potem przestawić bazę
  tej gałęzi na main. Aktywacja pomiaru i produkcji wymaga osobnego odbioru.

### Dokumenty cookies, 11.10.2026

- Na zlecenie użytkownika zaktualizowano repo `projekt prawny ola` i fixture’y
  listy identyfikatorów oraz polityki prywatności do wersji 2.2 z datą 11.10.2026.
  Sekcję cookies zsynchronizowano z rejestrem czynności, macierzą retencji
  i wykazem procesorów. Pozostały przegląd prawny pakietu pozostaje otwarty.
- W Sanity opublikowano wyłącznie `legal-cookies-pl` i `legal-privacy-pl`.
  Zastosowano kontrolę rewizji, zachowano kopię obu poprzednich dokumentów
  i porównano dokładną treść nowych szkiców z fixture’ami przed publikacją.
  Nie wykonano pełnego importu dokumentów prawnych ani zmian pozostałych stron.
- Lista rozróżnia cookie ważne 365 dni, fizyczną trwałość localStorage,
  pending wycofania, lokalny `ao-theme` oraz historię backendu 36 miesięcy.
  Ujawnia zamaskowany IP, User-Agent i język w dowodzie serwera.
  Narzędzia GTM/GA4/Meta/Clarity są opisane jako wyłączone, także po zgodzie.
  Przyszłe narzędzia wymagają kontroli kont i osobnego dopuszczenia treści.
- Niezależne sprawdzenie względem kodu nie znalazło blokerów. Doprecyzowano
  wyjątek usunięcia cookie przy oczekującym wycofaniu w localStorage.
  Konwerter źródła `--check` PASS. Końcowe `PLAYWRIGHT_WORKERS=2 npm run verify`
  PASS: 280 unit, 393 E2E, 88 dokumentów Sanity bez błędów, 12 stron z tym samym
  DOM fixture/Content Lake. Pierwsze przebiegi ujawniły stare asercje wersji 2.1;
  zaktualizowano literalną wersję i datę w unit, E2E i kontroli builda.
- Workflow Sanity `38155002467` zakończył się błędem starej asercji 2.1 w main,
  bez deploy. Poprawka jest w bieżącym kodzie. Po zakończeniu tego pipeline
  zbudowano aktualne treści opublikowane i wdrożono staging jako
  `e2f08fed-3779-4b72-9617-f3a05a031bfa`, zachowując wspólny kod c15t i SEO.
- Odbiór live obu stron i ich Markdown PASS (HTTP 200, wersja 2.2).
  HTML czytelny bez JavaScriptu; przy 320 px brak poziomego przepełnienia strony,
  tabela ma własne przewijanie. Obejrzano desktop i mobile. Nie wysłano POST,
  formularza ani zapytania do usług pomiarowych. Dowody w
  `output/cookie-docs-2026-10-11/`. Nie wykonano nowego osobnego odbioru tych tabel
  w ciemnym motywie, natywnym zoomie 200% ani czytniku ekranu.
- Następny krok: uwzględnić poprawione asercje cookies w przyszłym PR razem
  z aktualnymi treściami; odebrać konta pomiarowe i neutralne strony przed aktywacją.
  Produkcja pozostaje niewdrożona i wymaga skanu identyfikatorów przed uruchomieniem.

### c15t na stagingu i workspace GTM, 11.10.2026

- Wdrożono backend we wspólnej instancji VPS jako
  `zawlodzki/c15t:2.2.1-ola-20261011-2`. Produkcja Oli i staging mają
  osobne tenanty, audience snapshotów i originy. Legacy zawlodzki.pl
  zachowuje profil `tenantId IS NULL`. Nie uruchamiano migracji istniejącej bazy.
- Przed zmianą zachowano chronioną kopię bazy, źródeł i konfiguracji obrazu.
  Na rzeczywistych handlerach przeszło 16 testów SQLite i polityki oraz
  1 test PostgreSQL 17.10 w osobnej bazie. Audyt zależności runtime
  obrazu wykazał zero podatności. Suma SHA-256 starego widgetu `cmp-v1.js`
  jest identyczna przed i po zmianie.
- Próba live zapisała syntetyczny dowód wyłącznie niezbędnych preferencji
  dla stagingu. Ten sam subject był niedostępny z originów produkcji Oli
  i zawlodzki.pl, oba odczyty dały 404. Snapshot stagingu odrzucono przy
  zapisie produkcyjnym kodem 409. Nie użyto danych klientek ani analityki.
- W kodzie strony dodano klienta potwierdzającego zgodę dopiero po zapisie
  c15t, panel PL/EN z tokenami 3a, stopkę „Ustawienia cookies” i Basic
  Consent Mode v2. Wycofanie zapisuje ograniczający stan pending przed
  zatrzymaniem dokumentu. Po przerwaniu transportu kolejny dokument
  synchronizuje pełną odmowę. Przerwane częściowe wycofanie może więc
  wyłączyć także drugą opcjonalną kategorię do ponownego wyboru.
- Niezależny przegląd wykrył i po poprawkach zweryfikował trzy problemy.
  Dotyczyły przerwanego zapisu wycofania, reloadu przy focus z ważną zgodą
  i dowolnego `uiSource` w dowodzie. Testy kontrolera i bramki dały 31 PASS.
  Przegląd nie zastępuje pełnego odbioru strony lub usług pomiarowych.
- W GTM utworzono osobny workspace 5
  `Nowa strona Ola • c15t 2026-10-11`. Zapisano i wyeksportowano dwa
  natywne tagi `googtag` i `gaawe`, oba wstrzymane. Stała rollout ma
  `false`. Domyślny workspace 4 i opublikowana wersja 3 nie zmieniły się.
  Stan konfiguracji opisuje [README GTM](../ops/gtm/README.md).
- Pusta allowlista i `PUBLIC_GTM_ENABLED=false` blokują pomiar wszystkich
  obecnych treści. Nadal wymagane są zatwierdzone neutralne strony,
  kontrola GA4 oraz odbiór konfiguracji Meta i Clarity. W nowym workspace
  nie ma tagów Meta ani Clarity. Nie opublikowano GTM.
- Końcowy `PLAYWRIGHT_WORKERS=2 npm run verify` na Node 24.19.0 PASS.
  Przeszło 280 testów jednostkowych i 393 E2E w Chromium, Firefox i WebKit.
  Buildy, format, lint, typy, budżety CSS/JS i SEO również PASS.
  Porównanie fixture/Content Lake potwierdziło 12 stron i zgodny DOM.
  Pierwsze czerwone przebiegi oraz poprawki są zapisane w śladzie decyzji.
- Odbiór live wykrył wyścig panelu otwartego przed zakończeniem GET.
  Backend prawidłowo zapisywał obie zgody, ale checkboxy pokazywały stan
  początkowy. Stopka teraz czeka na odczyt. Dodany test celowo opóźnionego
  API przeszedł w trzech silnikach. Niezależny przegląd bez nowego blokera.
- Test UI na stagingu i rzeczywistym c15t PASS. Jeden syntetyczny subject
  w końcowym przebiegu dostał trzy decyzje: odmowę, akceptację i wycofanie.
  Odtworzenie po reloadzie i przejściu na podstronę było zgodne z backendem.
  Motyw ciemny przetrwał nawigację. Nie wysłano formularzy ani żadnego
  żądania GTM, GA4, Meta lub Clarity, także po akceptacji wszystkich zgód.
  Wcześniejsze próby również utworzyły wyłącznie syntetyczne subjecty.
- Obejrzano panel na desktopie, w ciemnym motywie i przy 320 px, z reduced
  motion i zoomem CSS 200%. Brak poziomego przepełnienia, Escape oddaje
  fokus stopce. Dowody w `output/consent-2026-10-11/`.
  Natywnego zoomu 200%, czytnika ekranu i osobnego scenariusza zamknięcia
  dialogu podczas rewalidacji nie sprawdzono. Testy dostępności panelu
  i klawiatury w pełnym E2E PASS.
- `verify-ola` uruchomiono na własnym porcie 4340. Doctor na macOS nadal
  nie obsługuje odczytu portu przez Linux `/proc`. Właściciela PID 59301
  potwierdzono `lsof`, GET strony zwrócił 200. CLI otworzyło panel,
  zapisało ARIA i screenshot, zamknęło go Escape oraz odczytało POST `[]`.
  Cleanup usunął własne procesy i zachował dowody.
- CSS panelu przeniesiono do wspólnego arkusza. Budżet strony głównej
  i łączny budżet 32 KiB zachowano. Budżet zewnętrznego CSS dokumentów
  prawnych zwiększono z 6 do 7 KiB dla współdzielonego panelu.
  Wynik końcowego builda dla tych dokumentów wyniósł 6442 B gzip.
  Globalnie JS 9214 B gzip i CSS 30845 B gzip. Strona główna CSS 8187 B
  przy limicie 8192 B ma mały zapas; następne zmiany muszą przejść budżet.
- Zachowano równoległe zmiany SEO. W bieżącym checkout nie ma konfliktów
  Git, ale kod SEO i panel współdzielą shell i build. Dokumentacja SEO
  poniżej opisuje wcześniejsze przebiegi, także poprzedni błąd budżetu CSS.
- Staging wdrożono z opublikowanego datasetu Sanity `production`,
  z aktualnym kodem wspólnego checkoutu, również zmianami SEO.
  Wersja Worker `960b9749-6cb0-4bb4-bc40-bdd2e56fc636`. Produkcja Oli pozostaje niewdrożona.
  Nie wykonano commitu, push ani publikacji GTM. Kolejny build z aktualnego
  main może zastąpić staging starszym kodem, dopóki zmiany nie zostaną scalone.
- W uploadzie znaleziono metadane Findera. `public/.assetsignore` wyklucza
  `.DS_Store`, `.git` i `node_modules`; `/blog/.DS_Store` daje 404 po poprawce.
- Aktualizacja listy cookies w CMS nadal jest propozycją z
  [konfiguracji prawnej](LEGAL-CMS-CONFIG.md). Nie publikowano dokumentów
  prawnych. Następny etap pomiaru wymaga zatwierdzonych neutralnych treści,
  rzeczywistego odcisku treści w runtime oraz odbioru GA4, Meta i Clarity.
  Ślad decyzji i niezależne raporty zachowują
  korekty oraz różnicę między działającym panelem a wstrzymanym pomiarem.
  Pliki tego śladu usunięto z gałęzi 11.10.2026.

### Obrazy OG generowane w buildzie, 11.10.2026

- Decyzja użytkownika (D7): obrazy udostępniania generowane. Na polecenie
  pobrano oficjalną paczkę Switzer z Fontshare
  (`api.fontshare.com/v2/fonts/download/switzer`, 2,47 MB) do scratchpadu;
  `Switzer-Variable.woff2` z paczki jest identyczny z plikiem w repo,
  `FFL.txt` identyczny. Do `src/assets/fonts/switzer/og/` skopiowano bez
  zmian `Switzer-Regular/Semibold/Bold.otf` (sumy SHA-1 zgodne z paczką).
- Wdrożono `og-card.ts`, `og-size.ts` (wymiary bez importu satori w head,
  żeby podgląd SSR nie dostał natywnego resvg), endpoint
  `/og/[...ogPath].png`, tytuły kart (`cardTitle`, `stripBrand`), nową
  kolejność `og:image` (`shareImage` z `seo.ogImage`). Zależności
  `satori@^0.33.5` (wersja z 22.09.2026, nie najnowsza 0.47.1 sprzed dwóch
  dni) i `@resvg/resvg-js@^2.6.2` (MPL-2.0) w devDependencies; lockfile
  zawiera binarkę linux-x64. Wpis w `THIRD-PARTY-NOTICES.md` i README fontu.
- Kontrole (Node 26.11.0): obejrzane karty strony głównej, artykułu
  i regulaminu (najdłuższy tytuł mieści się, polskie znaki poprawne);
  34 karty, łącznie 1,2 MB; brak `.otf` w `dist/`; `check-seo` 36 stron
  PASS z kontrolą PNG 1200×630; 279 testów unit; `npm run check`
  bez diagnostyki; lint, format, build:workspaces, `test:content-lake` PASS.
  `test:build` nadal czerwone tylko przez budżet CSS panelu zgód.
- Bez commitu, push i zmian w Sanity.

### SEO‑5: elementy AEO artykułu, 11.10.2026

- Na polecenie użytkownika: w artykule 3a panel „W skrócie”
  (`article.keyTakeaways`), czas czytania (200 słów/min) przy datach,
  linia przeglądu merytorycznego tylko przy wypełnionym `reviewedBy`
  i `lastReviewedAt`, zastrzeżenie edukacyjne pod treścią (propozycja copy:
  [konfiguracja bloga](BLOG-CMS-CONFIG-3A.md)). Markdown i przykład
  `article.md` z tymi samymi elementami; `wordCount` i `timeRequired`
  w JSON-LD. Fixture wyróżnionego artykułu ma 4 przykładowe zdania
  „W skrócie”. Wytyczne redakcyjne w [BLOG-PUBLISHING.md](BLOG-PUBLISHING.md).
- Bez nowych tokenów: panel używa `--ao-surface`, `--ao-line`,
  `--ao-radius-panel`, odstępów `--ao-space-*`.
- Kontrole (Node 26.11.0): 277 testów unit (nowe przypadki w
  `article-3a.test.ts`), `astro check` bez diagnostyki, build,
  `check-seo` 36 stron PASS, E2E `article-3a` + `blog-3a` 15/15.
  Ręcznie w przeglądarce: 1440 px, 320 px w trybie ciemnym, zoom 200%
  (CSS) bez przepełnienia; tekst listy 16 px, zastrzeżenie 14 px.
  Zewnętrzny CSS artykułu 9598 B gzip (budżet 10240 B). Inline CSS
  artykułu 4782 B > 4096 B to w całości blok `ConsentPanel` (równoległa
  praca c15t), jak na `/odstapienie/`.
- Nie wykonano: obrazów OG (D7 otwarte, brak plików OTF/TTF), natywnego
  zoomu, czytnika ekranu, zapisu w Sanity, commitu, push.

### Dane SEO i landingi e-booków w Sanity, 11.10.2026

- Na polecenie użytkownika wpisano i opublikowano w Content Lake
  (dataset `production`) wartości SEO z
  [konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md): właścicielka i sprzedawca
  w `siteSettings-pl`, `sameAs`/`occupationCode`/`knowsAbout`/
  niepubliczny dyplom w `author-ola-pl`, pola usługi, `sameAs` kategorii
  PMOS (PCOS) i insulinooporności (Wikidata sprawdzona przez API).
- Pięć polskich e-booków dostało landing skopiowany z „Suplementów
  w PMOS (PCOS)” jako treść zastępczą ([konfiguracja e-booka](EBOOK-CMS-CONFIG-3A.md)).
  Zgodność kopii sprawdzona GROQ (7 rozdziałów, 5 materiałów, 6 FAQ,
  2 opinie, źródło). Najpierw szkice, publikacja 10 dokumentów po
  potwierdzeniu użytkownika. Trzech istniejących, cudzych szkiców
  (`article-blog-01-pl` i dwa UUID) nie ruszano.
- Fixture’y (`ebook-fixtures.ts`) i plan Content Lake odwzorowują nowe
  landingi; dzięki temu kontrola linków jest zielona.
- Kontrole: build lokalnego kodu na danych z Sanity → `check-seo`
  36 stron PASS (bez niedziałających linków; Person z `knowsAbout`
  i `sameAs`, sprzedawca, pola usługi, bez `hasCredential`); build
  z fixture’ów → `check-seo` 36 stron PASS; `test:content-lake` PASS;
  275 testów unit; `astro check` bez diagnostyki; E2E e-booków
  i `english-disabled` 48/48. `test:build` nadal czerwone wyłącznie przez
  budżet CSS panelu zgód.
- Publikacja nie uruchomiła żadnego builda. Diagnoza (API zarządzania
  Sanity, `sanity hook logs`): `publish-pages-production` jest wyłączony
  przez użytkownika (celowo, do wdrożenia c15t). `publish-pages-staging`
  był włączony, ale oba webhooki miały filtr `_type == "page"` (stan
  z 13.09.2026), więc zmiany `ebook`, `author`, `service`, `category`,
  `siteSettings` (a wcześniej także artykułów i opinii) nie wywoływały
  dostaw — ostatnia dostawa 07:05 UTC. Filtr z
  [konfiguracji webhooka](sanity-publication-webhook.json) nie został
  wcześniej wdrożony.
- Na polecenie użytkownika: filtr obu webhooków zmieniono na wersję
  z repo (wszystkie typy treści, bez szkiców i wersji); produkcja nadal
  `isDisabledByUser: true`. Ręcznie wysłano `repository_dispatch`
  (`staging`): przebieg `Publish content` 38134677319 zakończony sukcesem;
  staging zwraca 200 dla `/ebooki/czy-to-juz/` i `/ebooki/waga-cie-oklamuje/`.
  Staging działa na kodzie `main` (stary JSON-LD, bez SEO‑1…4).
- Nie wykonano: rejestracji schematu, deployu Studio, commitu, push.

### SEO‑4: pola SEO w Sanity i ich użycie we frontendzie, 11.10.2026

- Na polecenie użytkownika wdrożono SEO‑4 w kodzie (szczegóły i odstępstwa:
  [plan SEO](SEO-GEO-AEO-PLAN.md), wartości do wpisania:
  [konfiguracja CMS](HOMEPAGE-CMS-CONFIG.md)). Schemat: `seo`
  (`ogImage`, `noindex`, ostrzeżenie < 70 znaków), `siteSettings`
  (`siteOwner`, `seller`, `defaultOgImage`), `author` (`occupationCode`,
  `sameAs`, `knowsAbout`, `credentials` z `isPublic`), `category.sameAs`,
  `article` (`keyTakeaways`, `reviewedBy`, `lastReviewedAt`),
  `service` (`serviceType`, `channel`, `audience`, `deliverables`,
  `terms`), `ebook` (`numberOfPages`, `publishedAt`).
- Studio: `SeoPreviewInput` (podgląd wyniku wyszukiwania z licznikami)
  i ostrzeżenie przy zmianie adresu opublikowanego dokumentu bez
  przekierowania. `@sanity/ui` importowane z instancji Sanity 4.4.0 — próba
  dopisania zależności tworzyła drugą kopię w `studio/node_modules`, więc
  `package.json` i lockfile przywrócono do wersji z repo.
- Frontend: osoba i sprzedawca z `siteSettings` z fallbackiem do stałych,
  `seo.noindex`/`seo.ogImage` we wszystkich wrapperach i spisie stron,
  pola usługi w `Service`, tematy artykułu (`about` z `sameAs`),
  `DefinedTerm` kategorii, przegląd tylko gdy wypełniony, dane e-booka.
  TypeGen uruchomiony z `schema extract --force` (plik ignorowany);
  ta ścieżka generuje poprawny blok `declare global`.
- Kontrole (Node 26.11.0): `sanity schema validate` 0/0, format, lint,
  `npm run check` (311 + 11 plików) bez diagnostyki, 275 testów unit
  (nowe przypadki w `seo.test.ts` i `article-3a.test.ts`), build,
  build:workspaces (w tym Studio). `check-seo` przechodzi poza znanymi
  5 linkami e-booków (kopia bez tej asercji). `test:content-lake` i
  `test:build` czerwone z tych samych powodów co wcześniej (linki
  e-booków, budżet CSS panelu zgód). Podglądu SEO w uruchomionym Studio
  nie oglądano (wymaga logowania do Sanity).
- Nie wykonano: zapisu danych w Sanity, rejestracji schematu, deployu
  Studio, commitu ani push. Uwaga: workflow `Deploy Studio` wdroży nowy
  schemat automatycznie po scaleniu do `main`.
- Następny krok: na polecenie — uzupełnienie pól w Sanity według tabeli
  w konfiguracji CMS; landingi e-booków; poprawka panelu zgód; potem
  SEO‑5 (wyświetlanie „W skrócie”, biogram, daty, obrazy OG).

### SEO‑3: Markdown, sitemap, robots.txt, RSS, llms.txt, \_headers, \_redirects, 11.10.2026

- Decyzje: zdjęcie z dyplomem na „O mnie” zostaje (D5 dotyczy tylko
  schema); karty e-booków bez landingu bez zmian w kodzie — landingi
  powstaną w Sanity ([konfiguracja e-booka](EBOOK-CMS-CONFIG-3A.md)).
  Pytanie o przegląd treści wyjaśnione, deklaracja nadal wyłączona.
- Wdrożono: `src/lib/seo/inventory.ts` (spis stron), `[...mdPath].md.ts`
  (29 plików `.md` = 29 adresów w sitemap), sitemap z `lastmod` bez stron
  demo (`/tylko-pl/`, `/warsztat/`, `/wdrozenie/` usunięte z sitemap),
  `robots.txt` (staging `Disallow: /`; produkcja: `Content-Signal:
search=yes, ai-input=yes, ai-train=no`, blokada GPTBot, ClaudeBot,
  Google-Extended, Applebot-Extended, CCBot, Meta-ExternalAgent),
  `blog/rss.xml`, `llms.txt`, `_headers`, `_redirects`
  (`PUBLISHED_REDIRECTS_QUERY`, `listRedirects`, TypeGen; nagłówek
  deklaracji w `sanity.types.ts` przywrócony do wersji z repo), linki
  `alternate` w head, `noindex` pustych kategorii. `updatedAt` dodane do
  projekcji kart artykułów.
- Uwaga D1: `Google-Extended` obejmuje też grounding w aplikacji Gemini;
  wyszukiwarka, AI Overviews i AI Mode działają przez Googlebot.
- Kontrole (Node 26.11.0): format, lint, `astro check` 309 plików bez
  diagnostyki, 271 testów unit (nowy `seo-discovery.test.ts`), build,
  build:workspaces. `check-seo` w trybie noindex i produkcyjnym przechodzi
  wszystkie kontrole poza linkami wewnętrznymi (kopia skryptu bez tej
  asercji w scratchpadzie): **czerwone — 5 linków do e-booków bez
  landingu**, ten sam wynik w `test:content-lake`. `wrangler dev` (lokalny
  runtime) potwierdził `text/markdown`, `Link: rel=canonical` przez
  `:splat`, `! Link` dla `/index.md` i `X-Robots-Tag`. E2E
  `english-disabled` + `article-3a` 57/57. Pełnego `npm run verify` nie
  uruchamiano ponownie (znane czerwone: budżet CSS panelu zgód, sticky
  navigation, teraz także linki e-booków).
- Zauważone w treści: opis SEO kolekcji e-booków (fixture) zawiera
  roboczy dopisek „Copy i UX kolekcji są propozycją do zatwierdzenia”,
  który trafia do meta, `.md` i llms.txt.
- Bez commitu, push, zapisu w Sanity i zmian w Cloudflare.
- Następny krok: landingi e-booków (Sanity i fixture’y) albo zmiana
  decyzji o kartach; poprawka panelu zgód; ręczna walidacja schema;
  potem SEO‑4 (pola Sanity) lub SEO‑5.

### Decyzje SEO D1, D2, D4, D5 i licencja Switzer, 11.10.2026

- Decyzje użytkownika zapisane w [planie SEO](SEO-GEO-AEO-PLAN.md#decyzje-użytkownika-11102026)
  i [konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md): trening AI nie,
  wyszukiwanie/odpowiedzi tak; sprzedawca w schema; `sameAs` IG/FB/TikTok;
  dyplom na razie niepokazywany.
- Wdrożono D2: `/#seller` (Wellbiz sp. z o.o.) na każdej stronie,
  `Offer.seller` → `#seller`; `check-seo.mjs` wymaga węzła. Kontrole:
  `tests/unit/seo.test.ts` 9/9, build, `check-seo` 31 stron PASS.
- Licencja ITF FFL 2.0 sprawdzona na pliku w repo: obrazy OG dozwolone,
  ale tylko z oficjalnych statycznych OTF/TTF (bez konwersji WOFF2),
  używanych wyłącznie w buildzie. Plików fontu nie pobierano.
- Otwarte: czy usunąć zdjęcie z dyplomem z „O mnie” (obecnie widoczne);
  D3, D6, D8.
- Następny krok bez zmian: budżet CSS i nakładka panelu zgód, ręczna
  walidacja schema, SEO‑3 (z robots.txt według D1).

### SEO‑1 i SEO‑2: adresy, head i graf JSON-LD, 11.10.2026

- Na polecenie użytkownika wdrożono etapy SEO‑1 i SEO‑2
  [planu SEO/GEO/AEO](SEO-GEO-AEO-PLAN.md). Odstępstwa opisane w planie.
- Adresy i indeksacja: `site`, `trailingSlash: "always"`,
  `build.format: "directory"` we wszystkich konfiguracjach Astro;
  `src/lib/seo/site.ts` (origin, `absoluteUrl`, `@id`). Indeksacja tylko
  przy `SITE_INDEXING=production`; domyślnie noindex. Workflow tej zmiennej
  jeszcze nie ustawia (start produkcji, SEO‑6). `html lang="pl-PL"`
  (także stary `Layout.astro`).
- Head: `src/views/SeoHead.astro` przez slot `head` w `Layout3a`:
  canonical, robots (`max-image-preview:large`), Open Graph 1200×630,
  `article:*`, Twitter. Domyślny obraz OG i obraz osoby to prawdziwe
  zdjęcie z „O mnie” (`about`), nie portrety image_gen. W podglądzie
  szkicu SeoHead się nie renderuje. Nowe `src/pages/404.astro` (Hero 3a,
  zawsze noindex, bez canonical).
- Graf: `src/lib/seo/graph.ts` i `page-graphs.ts`. Jeden `@graph` w head
  (`#structured-data`) z `/#person` i `/#website` na każdej stronie;
  JSON-LD inline usunięty z 7 widoków i mapperów `map-article`/`map-legal`.
  Usunięto błąd `Offer`/`OutOfStock` dla „Wkrótce dostępny”: `Offer` tylko
  dla `available`/`presale` z `checkoutUrl`. Osoba tymczasowo z
  `src/content/site-identity.ts` (SEO‑4 przeniesie do Sanity).
- Kontrola wykryła i poprawiono zduplikowane `<title>` kategorii
  i paginacji bloga oraz kategorii e-booków.
- `scripts/check-seo.mjs` w `test:build` i `test:content-lake`: canonical =
  adres strony, robots zgodne z trybem, OG, unikalne tytuły, jeden graf,
  absolutne `@id`/`url`, rozwiązywalne referencje, FAQ i ceny `Offer`
  widoczne w treści, link płatności przy `Product`.
  `rasters` wydzielone do `src/assets/site-rasters.ts` (SiteImage i OG).
- Kontrole (Node **26.11.0** — Node 24 nie jest zainstalowany lokalnie):
  format, lint, `astro check` 298 plików bez diagnostyki, 261 testów unit
  (nowy `tests/unit/seo.test.ts`), build, build:workspaces,
  `check-seo` 31 stron w trybie noindex oraz osobny build
  `SITE_INDEXING=production` → 31 stron index, 404 i demo noindex.
  test:content-lake PASS. E2E: 375 passed / 15 failed; 6 błędów
  `lang` w `english-disabled` poprawiono (powtórka: 57/57 z
  `article-3a`). Pozostałe 9 to `sticky-navigation-3a`, w którym panel
  cookies przechwytuje kliknięcia.
- **Czerwone i niezależne od SEO:** `check-css-budgets` —
  `/odstapienie/` inline CSS 4099 B > 4096 B. Cały blok to CSS
  `ConsentPanel` (plik zmieniony 11:13 w równoległej pracy nad c15t);
  tak samo testy sticky navigation. Plików zgód nie zmieniano.
  `npm run verify` nie jest więc w całości zielone.
- Ręcznie: 404 przy 320 px bez poziomego przewijania; panel cookies
  zasłania przy 320 px cały ekran — ryzyko interstitial dla SEO do
  uwzględnienia w pracy nad c15t. Nie wykonano: Rich Results Test,
  Schema Markup Validator, zoom 200%, czytnik ekranu.
- Bez commitu, push, zapisu w Sanity i zmian w Cloudflare.
- Następny krok: naprawa budżetu CSS i nakładki panelu zgód (praca c15t),
  ręczna walidacja schema, potem SEO‑3 (`.md`, sitemap z `lastmod`
  i wykluczeniami, robots.txt, RSS, llms.txt, `_headers`, `_redirects`).

### Plan infrastruktury SEO, GEO i AEO, 11.10.2026

- Na polecenie użytkownika przygotowano
  [plan SEO/GEO/AEO](SEO-GEO-AEO-PLAN.md): schemat `@id` i grafy
  wszystkich typów stron (konsultacja `Service`+`Offer`, e-book
  `Product`+`Book` bez `Offer` dla „Wkrótce dostępny”, blog `Blog`/
  `BlogPosting`/`DefinedTerm`), zmiany modelu Sanity, implementacja
  Astro/Cloudflare, kontrole w buildzie, styk z GTM, etapy SEO‑1…SEO‑6
  i decyzje D1–D8.
- Wejście: inwentaryzacja repo (stan: JSON-LD per widok z adresami
  względnymi i bez `#person`/`#website`; brak canonical, OG, robots.txt,
  RSS, llms.txt, tras `.md`, 404, `site` w Astro; `noindex` na sztywno;
  `redirect` bez konsumenta; sitemap bez `lastmod` i z demo), analiza
  publicznego HTML zawlodzki.pl (Webflow MCP nieautoryzowany — bez
  ustawień projektu), research Astro 7 / Sanity / Cloudflare / Google.
- Wykryty błąd do SEO‑2: landing e-booka „Wkrótce dostępny” emituje
  `Offer` z `OutOfStock`.
- Propozycje i brakujące pola zapisano w
  [konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md); decyzje D1–D8 otwarte.
- Kontrole: tylko dokumentacja (format i odnośniki). Kod, Sanity
  i Cloudflare bez zmian; brak commitu i publikacji.
- Następny krok: decyzje D1–D8 od użytkownika, potem SEO‑1 (`site`,
  `urls.ts`, przełącznik indeksacji, `SeoHead`, 404) i SEO‑2 (graf).

### Plan GTM/c15t i trwały wybór motywu, 11.10.2026

- `main` zaktualizowany fast-forward z `743b012` do `51e1e08`.
  Wcześniejsze zmiany zabezpieczono w stashu
  `pre-main sync 2026-10-11 GTM c15t theme` oraz kopii
  `/private/tmp/ola-pre-main-2026-10-11`. Kod odpowiadał nowym commitom;
  trzy odmienne pliki były starszymi opisami postępu/CMS i generowanymi
  typami. Zachowano bieżące wersje upstream oraz ich pełne kopie lokalne.
  Pozostałe nieśledzone pliki użytkownika pozostawiono w checkoutcie.
- [Plan GTM i c15t](GTM-C15T-DEPLOYMENT-PLAN.md) obejmuje wspólną instancję,
  odrębne zgody, panel 3a, Basic Consent Mode, migrację starego GTM Oli
  i macierz odbioru. Zalogowana przeglądarka potwierdziła kontenery
  `GTM-PWBRPZ29` i `GTM-P5V3CJ5`, GA4 `G-9QW05JYZTL`, Clarity
  `ohzq3djq4y`. Nie zmieniono workspace ani opublikowanych tagów.
- Źródła VPS opisują backend c15t 2.2.1, profil B2B i cztery originy
  zawlodzki.pl/com. Aktualnego procesu/DB nie sprawdzono.
  Publiczny `/init` zablokowała przeglądarka `ERR_BLOCKED_BY_CLIENT`.
  GET przez curl następnie potwierdził HTTP 200, politykę B2B dla trzech
  Originów i CORS wyłącznie dla zawlodzki.pl. Subjectów nie odczytywano.
  Separacja profili i odczytów musi przejść próbę przed integracją.
  Repo nie potwierdza dashboardu c15t; wspólna administracja oznacza
  obecnie wspólnego operatora, serwis, bazę i backup.
- Copy prawne ma rozbieżność zakresu GA4. Plan proponuje blokadę wszystkich
  opcjonalnych tagów na wrażliwych trasach. Obecny homepage ma treści
  zdrowotne, dlatego nie kwalifikuje się automatycznie do allowlisty Meta.
  Ustalenia użytkownika i propozycje zapisano oddzielnie w
  [konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md).
- Błąd motywu odtworzono w Chromium na buildzie `main`.
  Wynik `after toggle: dark`, `after navigation: light`.
  `ThemeToggle` ustawiał `manual=false` i motyw systemowy dla każdego
  dokumentu. Nowy `ThemePreference.astro` w head jest jednym właścicielem
  `light | dark | null`, odtwarza `ao-theme` przed body i zapisuje wybór
  po kliknięciu. Storage zablokowany nie psuje przycisku. Bez JS pozostaje
  motyw systemowy. Tokeny i wygląd nie zmieniły się.
- Nowy test przed przebudową poprawki czerwony na braku `ao-theme`
  (`Expected: "dark"`, `Received: null`). Dowód
  `/private/tmp/ola-theme-baseline-test.log`. Po poprawce pełne
  `PLAYWRIGHT_WORKERS=2 npm run verify` na Node **24.19.0** PASS.
  Format, tokeny, lint, Astro/TS 280 + 11 plików bez diagnostyki,
  221 unit, buildy wszystkich workspace’ów, budżety, **351 E2E PASS**
  w Chromium/Firefox/WebKit i test:content-lake PASS. Nowy plik motywu
  obejmuje 24 przypadki. Log `/private/tmp/ola-theme-verify.log`.
  Artefakty JS 4694 B gzip i CSS 30366 B gzip; inline JS osobno w HTML.
- `verify-ola` uruchomił własny podgląd na 4340. Doctor jest zależny od
  Linux `/proc` i na macOS błędnie zgłosił brak właściciela portu.
  `lsof` potwierdził ten sam PID 58756 i HTTP działało. Repro wykonano
  Playwrightem bez formularzy, proces zamknięto przez cleanup skilla.
  Po poprawce sesja `ola-theme-fixed-20261011`, Node 24, PID 65426:
  `lsof` potwierdził port, CLI click/goto/expect zwrócił
  `aria-pressed=true` na O mnie i `posts []`. Snapshoty i zrzuty w
  `/tmp/ola-verify-evidence/ola-theme-fixed-20261011/`.
  Osobny Playwright na tym samym buildzie sprawdził 320/390/1440 px,
  wybór przez kliknięcie, przejście linkiem i reload, reduced motion,
  brak overflow także przy CSS zoom 200%. Wynik `responsive.json`,
  dark `rgb(41, 26, 33)` jak tokeny; zrzuty desktop i mobile obejrzane.
  Cleanup zachował dowody. Natywny zoom, czytnik i urządzenie fizyczne
  niesprawdzone. Doctor na macOS nadal niewspierany; skilla nie zmieniono.
- Dokumentacja sformatowana, 166 odnośników do lokalnych plików bez braków.
  Przegląd niezależny kodu nie znalazł błędów funkcjonalnych. Przegląd
  planu uzupełnił ryzyko odczytów po subjectId oraz różnicę retencji
  `givenAt` względem ostatniej zmiany. Nie wykonano publikacji, push
  ani zapisu CMS. Lista cookies nadal wymaga wpisu `ao-theme`.
- Następny krok integracji: próba rozdzielenia domen/polityk i zabezpieczenia
  odczytów w istniejącym c15t, następnie klient i panel 3a. Poprawka motywu
  gotowa lokalnie; commit, push i wdrożenie nie były częścią zlecenia.

### E-booki „Wkrótce dostępny” i lista oczekujących, 11.10.2026

- Decyzja użytkownika: e-book można oznaczyć jako „wkrótce dostępny”;
  karta pokazuje badge, a landing zamiast linku płatności ma przycisk
  otwierający okno zapisu na listę oczekujących. Aktywny e-book prowadzi
  do płatności Stripe (`checkoutUrl`). Zapis w
  [konfiguracji CMS e-booka](EBOOK-CMS-CONFIG-3A.md).
- Status `planned` = „Wkrótce dostępny”. Badge (`AvailabilityBadge`) na
  kartach homepage, kolekcji i artykułu oraz nad ofertą landingu.
  `WaitlistDialog`: natywny `<dialog>` z Invoker Commands, fallback JS,
  fokus Safari, `closedby="any"`, LeadForm z `formKey: "waitlist"`.
- Schemat: `formKey` `waitlist` (shared + Studio), pole `ebook.waitlist`
  (etykieta, tytuł, lead, referencja do formularza waitlist), opisy Stripe.
  GROQ, TypeGen, mapper, serializery Markdown (etykiety statusu), przykłady,
  fixture’y, plan Content Lake (dokumenty `waitlist-form-pl/en`).
- Kontrole: format, tokeny, lint, check, 221 testów unit, build,
  build:workspaces, test:build, test:content-lake OK (88 dokumentów, bez
  błędów). E2E 324 passed / 3 failed: 2× znany WebKit `sticky-navigation-3a`
  (failuje też na `main`), 1× WebKit `article-mockup` — przy powtórce zielony.
  Nowy E2E listy oczekujących (badge, dialog, Escape i fokus, axe, payload
  na zmockowany webhook) zielony w Chromium/Firefox/WebKit. Zrzuty
  1440/320/390-dark sprawdzone wizualnie. Node 26 zamiast 24.
- Sanity: na polecenie użytkownika utworzono `waitlist-form-pl` i
  `waitlist-form-en` (dataset `production`) oraz ustawiono pole `waitlist`
  w 12 e-bookach w odpowiednim języku (zweryfikowane GROQ).
- Na polecenie użytkownika: ręczny deploy Studio (Cloudflare, wersja
  `79b56901`; produkcyjny bundle zawiera nowy schemat), rejestracja schematu
  w Sanity, publikacja formularzy waitlist i 12 e-booków (silne referencje,
  0 szkiców). Kod w PR `feat/ebook-waitlist`; do merge automatyczny deploy
  z `main` cofnąłby schemat Studio.
- Nie wykonano:
  obsługi `formKey: "waitlist"` w n8n, przeglądu prawnego copy (wersja
  formularza `0.1`), linku Stripe. Natywny zoom, czytnik — niesprawdzone.
- Następny krok: zatwierdzić copy zapisu i politykę prywatności, dodać
  obsługę `waitlist` w n8n, potem import formularzy do Sanity.

### Wskaźnik 9000+ Instagram zamiast 450+, 11.10.2026

- Decyzja użytkownika: zamiast „450+ godzin szkoleń” wszędzie „9000+ kobiet codziennie śledzi moje materiały edukacyjne na Instagramie”
  (EN „women follow my educational content on Instagram every day”). Tytuł
  sekcji O mnie: „Materiały edukacyjne na Instagramie”. Zapis w
  [konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md).
- Zmienione: seedy homepage i About, fixture’y homepage/About/konsultacji
  (wartość 9000), `import-consultation-content.mjs`, przykład Markdown,
  komunikat walidacji About, testy unit/e2e, makiety 3a.
- Makieta About przy 320 px i zoomie 200% wychodziła 9 px poza ekran przez
  szerszą liczbę; w kontenerze ≤374 px liczba ma 44 px.
- Content Lake `production`: opublikowano 6 dokumentów `page-home-*`,
  `page-about-*`, `page-consultation-*` (PL/EN), wartość 9000 i nowe opisy.
  Usunięto jednorazowy `import:training-metric` z PR #66 — po tej zmianie
  nieaktualny.
- Kontrole: `npm run verify` PASS (216 unit, e2e 324/324, content-lake OK).
  Następny krok: potwierdzić źródło liczby 9000+
  i przebudować produkcję.

### Wskaźnik 450+: godziny szkoleń, 10.10.2026

- Opis wskaźnika 450+ na stronie głównej, w O mnie i w konsultacjach:
  „kobiet rocznie, którym pomagają moje konsultacje” → „godzin szkoleń”
  (EN „women a year helped by my consultations” → „hours of training”).
- Tytuł sekcji wskaźnika O mnie: „Doświadczenie konsultacji” → „Wiedza
  i szkolenia” (EN „Consultation experience” → „Knowledge and training”).
- `npm run import:training-metric` przygotowuje celowany patch Content Lake
  (kopia, ifRevisionID, jedna transakcja, domyślnie dry run).

### Test sticky header w WebKit, 10.10.2026

- `sticky-navigation-3a.spec.ts` „tabbing through the sticky header…” failował
  w WebKit od PR #56 (też na `8d39131`): po Tab fokus nie trafiał na
  `.ao-skip`. Sonda Playwright: w WebKit Tab przechodzi tylko po polach
  formularza i elementach z `tabindex` (karuzela, pole e-mail), jak domyślnie
  Safari; Alt+Tab (Option+Tab) przechodzi po linkach `.ao-skip → wordmark → …`.
  Strona działa poprawnie, błędne było założenie testu.
- Poprawka: w WebKit test używa Alt+Tab; kontrola pozycji scrolla bez zmian.
  Wynik: spec 24/24 (Chromium, Firefox, WebKit), WebKit `--repeat-each=5` 10/10,
  lint i `npm run check` PASS.

### Merge PR #63 i zapis do Content Lake, 10.10.2026

- PR [#63](https://github.com/zawlodzki/nowa-strona-ola/pull/63) scalony
  (squash `743b012`) po zielonym CI (dwie kontrole Quality).
- Zapis do Content Lake (projekt `dyuqkn8c`, `production`) jedną transakcją
  `sanity documents create --replace` z konta właściciela, tylko dokumenty z PR:
  5 formularzy (`formKey`, `version` 2.3), `form-withdrawal-pl`,
  `page-withdrawal-pl`, 6 dokumentów prawnych z datą 10.10.2026 (regulamin 2.3),
  w `siteSettings-pl` linki prawne, copyright i informacja pod opiniami (reszta
  bez zmian), usługi konsultacji z `https://cal.com/dietetyk/konsultacja`.
  Pełnego `import:3a` nie uruchamiano. Kopia poprzednich wersji:
  `/private/tmp/claude-501/lake-write/backup-before.json`.
- Pierwszy build z webhooka (staging) padł: strony główna, O mnie i konsultacje
  w Lake miały przyciski do `https://cal.com`, a mapper wymaga zgodności z
  `service.bookingUrl`. Przyczyna: przed zapisem nie zbudowano strony na danych
  z Lake, tylko na fixture’ach. Poprawka łatkami MCP: 8 linków i odpowiedź FAQ
  „Jak zarezerwować termin?” (PL/EN), opublikowane na polecenie właściciela.
  Lokalny build `main` na danych z Lake: PASS (34 strony, brak śladów B2B,
  `/odstapienie/`, regulamin 2.3, newsletter bez checkboxa, link Cal.com).
- Wniosek: przed każdym zapisem do Lake budować `main` z
  `PUBLIC_SANITY_PROJECT_ID`/`PUBLIC_SANITY_DATASET` na danych po zmianie.

### Krok 1 dokumentacji prawnej — integracja, 10.10.2026

- `main` zsynchronizowany z `origin/main` `8d39131` (fast-forward o 38 commitów).
  Lokalne zmiany z checkoutu użytkownika miały nowsze odpowiedniki upstream;
  przyjęto wersje upstream. Kopia: ref `refs/backup/pre-sync-2026-10-10`, stash
  „local changes pre-sync 2026-10-10” i pliki w `/private/tmp/claude-501/sync-backup/`.
- Decyzje właściciela i zakres: [LEGAL-IMPLEMENTATION-PLAN.md](LEGAL-IMPLEMENTATION-PLAN.md)
  (W1–W13: bez `/wspolprace` i logotypów, newsletter bez checkboxa, formularze na
  webhook n8n, zgody zakupowe w Stripe/Cal.com, Omnibus na stronie e-booka,
  Cal.com `live`, EN wyłączone; GTM i c15t wdraża właściciel).
- Gałąź `feat/legal-step-1` scala trzy podpisane gałęzie: dokumenty B2C i stopka,
  formularze i `/odstapienie/`, wyłączenie EN + `lowestPrice30Days` + Cal.com.
  Poprawki po scaleniu: tryb demo `LeadForm` w `/ui/` i `/design-system/` (brak
  wysyłki z katalogu), nagłówek polityki w `check-content-lake-build.mjs`.
  AGENTS.md: nowa ścieżka formularzy i wyłączone EN.
- Kontrole na gałęzi integracyjnej (Node 26.11, brak Node 24 lokalnie): format,
  tokeny, lint, check, vitest 216/216, build, build:workspaces, test:build — PASS;
  Playwright 322/324; test:content-lake PASS (uruchomiony osobno, bo verify
  zatrzymuje się na e2e). Grep `dist`: brak `/en/`, hreflang i śladów B2B;
  `/odstapienie/` jest; kotwice `#pouczenie`, `#formularz-odstapienia`; 25 formularzy
  newslettera bez checkboxa; link Cal.com na `/konsultacje/`.
- Znany błąd do rozwiązania po tej sesji: WebKit, `tests/e2e/sticky-navigation-3a.spec.ts`
  „tabbing through the sticky header keeps the scroll position” (1440 i 390 px) —
  failuje też na czystym `8d39131`.
- Bramki przed merge do `main`: zapis do Content Lake (`form` z `formKey`, `version`,
  `errorMessage`; strona `page-withdrawal-pl`; dokumenty prawne) razem z merge,
  bo build z Sanity wymaga nowych pól. Publikacja dokumentów prawnych po akceptacji
  radcy (walidacja blokuje placeholdery). Workflow n8n: walidacja, deduplikacja po
  `submissionId`, honeypot `hp_website`, e-mail E7, double opt-in.
- Korekta 10.10.2026: dane spółki usunięte ze stopki (`siteSettings.company`
  usunięte); pełne dane zostają na `/kontakt/` i w dokumentach prawnych.
- PR [#63](https://github.com/zawlodzki/nowa-strona-ola/pull/63). Decyzja 10.10.2026:
  dokumenty B2C wchodzą w życie 10.10.2026, przed opinią radcy. Placeholdery
  uzupełnione w `projekt prawny ola` (commit `0b626ff`: regulamin 2.3 — 3 pobrania,
  ciąża po konsultacji z lekarzem, Pakiet współpracy, wizyta 30 min, kontakt 30 dni,
  jadłospis 7 dni; lista cookies 2.1 — `olesiewicz-consent` 365 dni, Cal.com bez
  cookies, Clarity 30 dni). Fixture’y przegenerowane konwerterem.
- Zapis Content Lake: tylko dokumenty z PR (formularze, `page-withdrawal-pl`,
  `siteSettings-pl`, usługa, dokumenty prawne), bez pełnego `import:3a`.
- Następny krok: przegląd gałęzi przez właściciela, push/PR na zlecenie, potem
  c15t i GTM (właściciel) oraz decyzje R1–R11 z przeglądu komunikacji.

### Formularze wysyłają do webhooka n8n, 10.10.2026

Decyzja właściciela: formularze wysyłają z przeglądarki POST JSON bezpośrednio
na webhook n8n; ścieżka Worker → Queues → n8n i Turnstile odłożone.

- Kontrakt `LeadSubmission` v2 w `packages/shared` (schemaVersion 2, formKey,
  submittedAt, consents z wersją). Adres w `src/lib/lead-endpoint.ts`,
  nadpisanie `PUBLIC_LEAD_WEBHOOK_URL`.
- Schemat `form`: `formKey` (newsletter/contact/withdrawal), `version`,
  `notice`, `noticeConsentId`, `errorMessage`, pole `date`, `defaultValue`.
  GROQ (wspólna projekcja) i TypeGen zaktualizowane.
- `LeadForm` zastąpił `DemoForm` i demonstracyjny `FormSection`: walidacja
  i fokus jak dotąd, honeypot, blokada przycisku, sukces po 2xx, błąd
  zachowuje dane i ten sam `submissionId`, bez JS brak wysyłki.
- Newsletter: „Zapisuję się”, bez checkboxa, informacja Z6 (zgody 2.3 §7).
  Kontakt: informacja §6. Nowa strona `/odstapienie/` (PL) z potwierdzeniem
  na ekranie.
- Testy: unit `lead-form`, `withdrawal`; Playwright `lead-forms.spec.ts`
  z fixture blokującym prawdziwe żądania do `flows.zawlodzki.com`.
- Kontrole 10.10.2026: format, tokeny, lint, check, test (207), build (68
  stron), build workspace’ów, test:build, test:content-lake — zielone.
  Playwright pełny: 280/282; 2 czerwone to WebKit
  `sticky-navigation-3a` „tabbing…”, które failują identycznie na main
  8d39131. Jednorazowo flaky kontakt w Firefox pod obciążeniem (60/60
  w powtórkach).
- Niewykonane: zapis do Content Lake (newsletter, kontakt, odstąpienie),
  workflow n8n (walidacja, deduplikacja, honeypot, e-mail E7, double opt-in),
  ręczny przegląd czytnikiem ekranu i zoom 200% formularza odstąpienia.
- Kolejność wdrożenia: build z Sanity wymaga w Content Lake nowych pól
  `form` (`formKey`, `version`, `errorMessage`) i strony `page-withdrawal-pl`,
  a obecny main wymaga checkboxa newslettera. Zapis i merge muszą iść razem
  (`import:3a` z `--write` dopiero na zlecenie).
- Następny krok: przygotować testowy workflow n8n i zapis Content Lake
  zsynchronizowany z merge.

### Dokumenty prawne B2C, wersjonowanie i stopka, 10.10.2026

- Treści B2B z zawlodzki.pl usunięte (HTML, konwerter Python, fixture’y).
  Nowe źródło: szkice `projekt prawny ola/www-prawne/*.md`; konwerter
  `scripts/convert-legal-md.mjs` (z `--check`), przykłady Markdown
  `scripts/generate-legal-examples.ts`. Pouczenie i formularz odstąpienia są
  załącznikami `/regulamin/#pouczenie` i `#formularz-odstapienia`.
- `legalPage`: `version` (wymagane), `effectiveFrom` opcjonalne; publikację
  blokuje brak daty albo `{{`/`[do sprawdzenia` w treści. Ta sama reguła
  blokuje `import:legal --write` i legal w `import:3a`. Pod H1: „Wersja X ·
  obowiązuje od …” albo „… · data wejścia w życie do ustalenia”.
- `siteSettings`: `company`, `copyright`, `testimonialsDisclosure`; pięć linków
  prawnych PL w stopce, linia danych sprzedawcy, informacja pod opiniami (Home,
  O mnie, Konsultacje, E-book). Szczegóły: [LEGAL-CMS-CONFIG.md](LEGAL-CMS-CONFIG.md).
- Kontrole: format, lint, check, `npm test` (201), build, `test:build`,
  Playwright `legal-pages` (45/45) oraz consistency, contact, carousel
  (łącznie 63/63) — na osobnym porcie 4391, bo 4321 zajmował inny worktree.
  `ui.spec` i `sticky-navigation` mają adresy `127.0.0.1:4321` na sztywno
  (nie dało się ich uruchomić izolowanie); dwa testy tabulacji WebKit padają
  też na main 8d39131 w tym środowisku.
- Nie zrobione: migracja bloku „Dane firmy” kontaktu do `siteSettings.company`
  (zmiana kontraktu sekcji i eksportu Markdown); fixture czyta już
  `site-legal.ts`. Zapis do Content Lake: brak. Następny krok: przegląd
  radcy prawnego, daty wejścia w życie i usunięcie placeholderów w źródle,
  potem `convert-legal-md.mjs` i import.

### Ikony tematów w „Z kim pracuję”, 10.10.2026

- Każda karta ma własną ikonę liniową (24 × 24, kreska 1,6, `currentColor`):
  PMOS (PCOS) — `flower`, insulinooporność — `drop-wave`, starania o ciążę —
  `sprout`, perimenopauza — `sun-horizon`. Oryginalne ścieżki projektu
  (`src/design-system/decorations/topic-icons.ts`), bez zewnętrznego zestawu.
- Studio: nowe opcje ikon z polskimi etykietami; `arrow` i `check` zostają.
- `npm run import:audience` ustawia tylko pole `icon` kart po `_key`
  (ifRevisionID, jedna transakcja); tytuły i opisy nie są ruszane.
- Kolejność wdrożenia: najpierw merge kodu, potem zapis w Sanity. Stary build
  odrzuca nieznane klucze ikon (`Nieznana ikona karty`), więc zapis przed
  mergem zatrzymałby publikację.

### „Z kim pracuję” zamiast pasa logotypów, 09.10.2026

Na polecenie użytkownika („Opcja 4”) usunięto pas logotypów marek ze strony
głównej PL/EN, ze schematu Sanity (`logosSection`), katalogu sekcji, fixture,
planu Content Lake, mockupu 3a i testów. Usunięto pliki `src/assets/partners/*`
(do odzyskania z historii git). W tym samym miejscu, po hero, jest nowa sekcja
`audienceSection` edytowalna w Studio: nagłówek, opcjonalny lead, 4–6 kart
z opcjonalną ikoną SVG (`arrow`/`check`). Copy PL/EN to szkic do akceptacji Oli
([copy](HOMEPAGE-COPY-3A.md)).

Zmiana w Content Lake jest celowanym skryptem `npm run import:audience`
(domyślnie dry run): podmiana `home-logos` → `home-audience` w
`page-home-pl/en` w jednej transakcji z `ifRevisionID`, kopia zapasowa przed
zapisem. Dokumentów i assetów logotypów do usunięcia nie ma (logotypy były
lokalnymi plikami). Zapis i merge muszą iść razem: kod bez `logosSection`
zatrzyma build na dzisiejszym Content Lake, a obecny main na danych po zapisie.

### Zmiana zdjęcia „O mnie”, 09.10.2026

Na polecenie użytkownika zastąpiono portret „O mnie C” rzeczywistym
[zdjęciem z Instagrama](https://www.instagram.com/p/CvUc_R0o9Kn/). Zmiana
wspólnego `about.webp` obejmuje 13 obrazów w 12 lokalnych mockupach, w tym
homepage, profil, konsultacje, e-book, indeks bloga i oba biogramy artykułu.
Źródłowy JPEG ma 1440 × 1800 px; w repo jest tylko WebP wyeksportowany z jakością 90. Nie upscalowano ani nie retuszowano zdjęcia.
W profilu, sekcji „O mnie” i przy e-booku przesunięto punkt kadru CSS na
`center 15%`, aby zachować górę włosów w szerokich ramkach. Zaktualizowano
wymiary dużych obrazów; małe awatary zachowują swój rozmiar wyświetlania.
Usunięto nieaktualny podpis o AI i jego nieużywany styl.

Zapisano źródło, opis PL/EN i decyzję do przyszłej konfiguracji CMS. Mapowanie
zweryfikowano w aktualnych schematach: `textImageSection.media`,
`heroSection.media`, `author.photo`. Hero i Kontakt zachowują wcześniejszy
wybór. Dotychczasowe lokalne zmiany użytkownika zachowano. Na zlecenie „pr push”
przygotowano osobny checkout z aktualnego main i gałąź `codex/about-instagram-photo`.

Bramka początkowego checkoutu `npm run verify` PASS na Node 24.21.0: format, tokeny, lint, typy,
57 testów jednostkowych, buildy wszystkich workspace’ów, kontrola artefaktów
i 81 E2E. Dodatkowo 63 kontrole zdjęcia przy 320/390/1440 px w Chromium,
Firefox i WebKit PASS: obraz 1440 × 1800 px załadowany, bez overflow.
Profil przeszedł klawiaturę, CSS zoom 200%, reduced motion i brak JS w trzech
silnikach. Obejrzano kadry na desktopie i mobile. Zrzuty z przeglądu
i źródłowy PNG nie trafiły do repo (tylko WebP).
Format, lokalne odnośniki i `git diff --check` PASS. Natywny zoom 200%,
czytnik ekranu i urządzenie fizyczne pozostają niesprawdzone.
PR na aktualnym main obejmuje również wspólny import `SiteImage`, nowe kadry
w About3a/Homepage3a/Ebook3a i usunięcie podpisu AI z fixture PL/EN. Wspólny
plik podmienia także portrety konsultacji, autorów i indeksu bloga w Astro.
Import nowego pliku do Sanity i publikacja nie były częścią sesji.
Końcowe verify wydzielonej gałęzi na main `d3ae6e2` PASS: 181 unit w 29 plikach,
201 E2E, buildy wszystkich workspace’ów, budżety i symulacja Content Lake.
Walidacja offline: 84 dokumenty, 0 błędów; 62 strony; porównanie sekcji, zdjęć
i DOM na 15 stronach zgodne. Obejrzenie świeżego builda Astro przy 1440/390 px
potwierdziło nowe zdjęcie i brak podpisu o AI. Log lokalny:
`/private/tmp/ola-photo-pr-verify.log`.

Następny krok: review PR; przed publikacją z CMS przesłać nowy plik
do Content Lake i przypisać do sekcji oraz wspólnego autora.

### PR navbaru i akcentów matcha, 09.10.2026

Na zlecenie „pr push” przygotowano gałąź `codex/sticky-navbar-matcha`.
Rebase na main `d3ae6e2` zachowuje kontakt 3a, poprawki dokumentów prawnych,
nawigacji stopki oraz sticky kolumny artykułu. Konflikty dokumentacji
rozwiązano z zachowaniem wpisów obu sesji.

Test kolumny artykułu z main oczekiwał 32 px od górnej krawędzi ekranu.
Po dodaniu navbaru sprawdza odstęp od nagłówka, rzeczywiste kolejne przewinięcie
i stałą pozycję kolumny. Zachowano sprawdzenie widoczności polecanych wpisów.
Pierwszy przebieg po rebase: 213 E2E PASS, sześć nieaktualnych oczekiwań
pozycji FAIL. Po korekcie: sześć regresji PL/EN w trzech silnikach PASS.

Końcowe pełne `npm run verify` **PASS**: **181 unit / 29 plików**,
**219 E2E** w Chromium/Firefox/WebKit, wszystkie buildy i kontrola artefaktów,
symulacja Content Lake oraz zgodność sekcji, zdjęć i DOM **15 stron**.
Log: `/tmp/ola-visual-pr-final-verify.log`; środowisko przeglądarek
jak w przebiegu wizualnym poniżej. Przegląd diff i komentarzy bez uwag.
Nie scalano ani nie publikowano strony. Następny krok: review PR i wynik CI.

### Stały navbar, linki i akcenty matcha, 09.10.2026

Na podstawie bieżącego polecenia użytkownika przygotowano poprawki wyglądu
w kodzie, korzystając ze skilli `poteto-mode` i `verify-ola`.
[Mapa ośmiu podstron i decyzje](VISUAL-REFINEMENTS-2026-10-09.md).

- Navbar 3a jest natywnie sticky z nieprzezroczystym tłem motywu.
  `overflow-x: clip` nie blokuje sticky. Menu mobilne ma własny scroll.
  Kotwice i sticky spisy treści/sidebar uwzględniają nagłówek.
- TextLink używa istniejącej matcha dla tekstu, strzałki i podkreślenia.
  Hero zachowuje primary cherry, secondary z obwódką matcha i pille.
  Dodano matcha w sufiksach wskaźników, drobnych oznaczeniach procesu
  oraz checkmarkach oferty. Bez zmian treści, cen, tokenów i schematów CMS.
- Odtworzono znikający header: y=0 przed, y=-900 po scrollu 900 px.
  Nowe regresje wykryły również problemy Firefox z breakpointami `px`
  przy zoom CSS 200% i WebKit z root `rem` po zwiększeniu fontu.
  Nagłówek ma własny kontener i progi `rem`; root scroll-padding używa `em`.
- Pełne `npm run verify` **PASS**: format, tokeny, lint, typy, **146 unit**
  w 26 plikach, wszystkie buildy, **204 E2E** w Chromium/Firefox/WebKit
  oraz symulacja Content Lake i porównanie 13 stron. Osobne regresje
  sticky/matcha: **39/39 PASS** w tych samych trzech przeglądarkach.
  Logi: `/tmp/ola-visual-verify.log`, `/tmp/ola-visual-tests.log`.
- Przeglądarki pobrano do `/tmp/ola-playwright`, biblioteki Debiana lokalnie
  do `/tmp/ola-browser-deps/root`; biblioteki WebKit również do jego `sys/lib`.
  Weryfikacja wymagała `LD_LIBRARY_PATH` do lokalnych bibliotek,
  `PLAYWRIGHT_BROWSERS_PATH=/tmp/ola-playwright`, 3 workers oraz jednorazowego
  `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`. To obejście preflight
  systemowego ldconfig; rzeczywiste testy wszystkich silników wykonano.
- `verify-ola`, przebieg `ola-visual-20261009`, Node 24.19.0, port 4340,
  doctor PASS, świeży build fixture’ów. Otworzono osiem szablonów PL i home EN,
  zapisano screenshoty/ARIA; kliknięto „Poznaj moją historię” z homepage
  do O mnie z JS i bez JS. Odczyty POST: `[]`. Dowody i transcript:
  `/tmp/ola-verify-evidence/ola-visual-20261009/`.
  Obejrzano końcowe zrzuty zielonego plusa, linku i menu podczas przewijania.

Staging nie był dostępny: proxy odrzuciło połączenie z domeną workers.dev
(CONNECT 403). Wyniki dotyczą lokalnego kodu i fixture’ów, nie opublikowanego
stagingu ani zdalnego Content Lake. Nie wykonano commitów, push ani publikacji.
Natywny zoom, czytnik i fizyczne urządzenie pozostają niesprawdzone.
Następny krok: odbiór zmian wyglądu i publikacja poprzez istniejący proces
wdrożeniowy po uzyskaniu dostępu do stagingu.

### PR podstrony kontaktu 3a — 09.10.2026

Na zlecenie „pr push” wypchnięto gałąź `codex/contact-page-3a`
i utworzono [PR #53](https://github.com/zawlodzki/nowa-strona-ola/pull/53).
Rebase na main `9a6c80e` zachowuje aktualizacje Sanity, bloga, dokumentów
prawnych oraz izolację CSS. Kontakt ma osobny `ContactPage.astro`, jawne trasy
PL/EN i dynamiczny import w preview; slugi kontaktu są zarezerwowane.
TypeGen: **73 typy, 22 zapytania**, bez zmian wygenerowanego pliku.

Pełny `npm run verify` po rebase **PASS**: **168 unit / 27 plików**,
**195 E2E** w Chromium/Firefox/WebKit, wszystkie buildy i kontrola artefaktów.
Symulacja CMS: **84 dokumenty, 0 błędów**, **62 strony**, zgodność sekcji,
zdjęć i DOM **15 stron**. JS gzip **5811 B**, CSS gzip **29314 B**.
Kontakt: zewnętrzny CSS **5491 B**, inline **3374 B**, poniżej budżetów 8/4 KiB.
Log: `/tmp/ola-contact-pr-verify-final.log`.

Pierwszy przebieg z czterema workerami miał dwa timeouty istniejących testów
WebKit. Całą bramkę powtórzono z `PLAYWRIGHT_WORKERS=1`: bez błędów i retries,
bez zmian limitów czasu ani testów. Opcje bibliotek i przeglądarek jak poniżej.
Po bramce `/verify-ola`: `ola-contact-pr`, port 4340, doctor PASS, cleanup;
obejrzano desktop 1440 i mobile 390 na świeżym buildzie symulacji CMS.
Zrzuty: `/tmp/ola-contact-pr-desktop.png`, `/tmp/ola-contact-pr-mobile.png`.

Następny krok: review PR i wynik GitHub Quality; obsługa wysyłki w etapie 6.
Bez zapisu do Sanity, scalenia i publikacji.

### Podstrona kontaktu 3a — 09.10.2026

Zlecenie użytkownika: zaplanować i utworzyć kontakt z trzema polami, zdjęciem
z logami social mediów pod nim, bezpośrednim e-mailem, danymi firmy i newsletterem.
[Plan i konfiguracja CMS](CONTACT-CMS-CONFIG-3A.md) zapisują dokładne wartości,
źródła i mapowanie; decyzja jest też w HOMEPAGE-CMS-CONFIG.md.

- Utworzono `/kontakt/` i `/en/contact/` w powłoce 3a, z tym samym rendererem
  dla produkcji i preview. Formularz: e-mail, telefon opcjonalny, temat rozmowy.
  E-mail `ola@aleksandraolesiewicz.com`, Wellbiz sp. z o.o., ul. Lipowa 3d,
  30-702 Kraków, NIP 6793323800. Wybrany portret `contact`; loga i odnośniki
  Instagram/Facebook/TikTok z istniejących profili. Newsletter ze wspólną zgodą.
- Istniejące sekcje Sanity, mapper kontrolujący kontrakt strony, wspólny
  DemoForm z układem pionowym i natywnym `type=tel`, walidacja telefonu.
  Oddzielne ID i statusy kontaktu/newslettera. Nawigacja fixture PL/EN,
  istniejący eksport Markdown oraz plan importu stron i formularzy.
- Offline walidacja wykryła brak obsługi mailto w `actionLink.href`.
  Dodano walidację poprawnego adresu e-mail oraz testy odrzucenia błędnych
  adresów i niedozwolonych schematów. **82 dokumenty, 0 błędów**.
  Walidacja dokumentów jest teraz częścią `test:content-lake` i pełnego verify.
  TypeGen: **72 schematy, 22 zapytania**, bez zmiany wygenerowanych typów.
- Formularze są demonstracyjne: walidacja lokalna, bez zapisu i wysyłki.
  Bez JS przyciski wyłączone, bezpośredni e-mail dostępny. Nie dodano pola
  wiadomości ani zgody marketingowej do kontaktu.
- `/verify-ola`: `ola-contact-20261009`, port 4340, doctor PASS; błędny
  i poprawny formularz, status, EN bez JS, ARIA i pełny screenshot.
  `browser posts` = `[]` z JS i bez JS. Dowody zachowane po cleanup:
  `/tmp/ola-verify-evidence/ola-contact-20261009/`.
- Obejrzano desktop 1280, mobile 390 i dark 1440. Dodatkowe zrzuty:
  `/tmp/ola-contact-mobile.png`, `/tmp/ola-contact-dark.png`.
  E2E nowego widoku: PL/EN, fokus i Tab, błędy i opcjonalny telefon,
  niezależność formularzy, axe light/dark, 320 px, CSS zoom 200%, reduced motion
  i brak JS w Chromium/Firefox/WebKit — **9/9 PASS**.
- `npm run verify` na Node 24.19.0 / npm 11.9.0: **PASS**, **156 unit / 24 pliki**,
  **180 E2E**, buildy wszystkich workspace’ów i kontrola artefaktów.
  Symulacja CMS: **82 dokumenty**, **62 strony**, zgodność sekcji, zdjęć i DOM
  **15 stron**, w tym kontakt PL/EN. JS gzip **5811 B**, CSS gzip **30132 B**.
  Log: `/tmp/ola-contact-verify-final.log`. Format i diff check PASS;
  kontrola **141 lokalnych odnośników** dokumentacji i stron: **0 braków**.
- Środowisko odtworzono: npm cache i przeglądarki w `/workspace/.cache`, brakujące
  biblioteki Debian rozpakowane lokalnie. Firefox wymagał uruchomienia poza
  sandboxem (wewnątrz nie widział profilu). Wszystkie trzy silniki rzeczywiście
  uruchomiono przed testami. Jednorazowe `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`
  pomija detekcję systemowego cache bibliotek, nie testy; jak w poprzedniej sesji.
  `LD_LIBRARY_PATH` wskazywał lokalne biblioteki, XDG_CACHE_HOME i XDG_CONFIG_HOME
  katalogi `/workspace`. Bez zmian skryptów bramki, profilu systemowego i lockfile.

Otwarte: natywny zoom przeglądarki, czytnik ekranu i fizyczne urządzenie dotykowe.
Następny krok: podłączyć docelową obsługę kontaktu i newslettera w etapie 6
(Worker → Queues → n8n, Turnstile, limity i finalna informacja o danych).
Na etapie tworzenia widoku nie zapisywano do Sanity, nie wykonywano push,
nie tworzono PR ani nie publikowano strony.

### PR poprawek Sanity i bloga, 09.10.2026

Na zlecenie użytkownika wypchnięto gałąź `codex/sanity-blog-consistency`
i utworzono [PR #50](https://github.com/zawlodzki/nowa-strona-ola/pull/50).
Baza zaktualizowana do main `7ceab3e`; zachowano aktualizację Sanity 6.18.0
oraz automatyczne wdrożenia Studio. Konflikty dziennika rozwiązane z zachowaniem
obu wpisów, typy ponownie wygenerowane (73 typy/22 zapytania).

Pełny `npm run verify` po rebase **PASS**: 145 unit/26 plików, 171 E2E
Chromium/Firefox/WebKit, wszystkie buildy (Studio z autoUpdates), Content Lake
oraz porównanie 13 stron. JS 5760 B gzip, CSS 29804 B gzip.
Log: `/tmp/ola-pr-verify.log`; opcje środowiska przeglądarek jak w poprzednim
przebiegu. Lokalna kontrola formatu i diff-check również PASS.

GitHub Quality dla pierwszego commita zakończył się błędem przed pierwszym
krokiem: brak runnera i pusty wykaz kroków. Pobranie logu zwróciło 404;
adnotacje nie są dostępne przez używane narzędzia. Przyczyna niepotwierdzona.
[Przebieg CI](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/37851199076).
Nie scalano PR, nie wdrażano i nie zapisywano migracji do Sanity.
Następny krok: wyjaśnić start Quality, następnie review/scalenie na zlecenie
oraz wdrożenie i odbiór migracji/webhooka.

### Verify-ola po poprawkach bloga, 08.10.2026

Skill [verify-ola](../.cursor/skills/verify-ola/SKILL.md), przebieg
`ola-blog-audit-20261008`, Node 24.19.0, własny port 4340, doctor PASS.
Świeży build fixture’ów, bez konfiguracji Sanity. Sprawdzono:

- Blog PL/EN, stronę 2 („Wpisy 8–11 z 11”), kategorię PMOS (PCOS) i pustą
  perimenopauzę: HTTP 200 i oczekiwane nagłówki/komunikaty.
- Kliknięcie artykułu z listy PL, H1 i spis treści, bezpośredni adres EN.
  Historyczny przepis przełącznika „English” zatrzymał się na braku linku.
  Nagłówek 3a celowo go nie renderuje; poprawiono przepis skilla.
  Bezpośredni adres EN nie jest dowodem przełączania języka.
- Newsletter bloga: błędny pusty e-mail, brak zgody, poprawne dane
  i status „Dane poprawne. Nic nie wysłano.”; odczyty `browser posts`: `[]`.
- Bez JS: blog PL i kliknięcie „Strona 2” działają.
- Dowody ARIA, screenshoty i transcript:
  `/tmp/ola-verify-evidence/ola-blog-audit-20261008/`.
  Obejrzano pełny screenshot bloga PL (desktop 1280×900).

Przebieg nie obejmuje Studio, preview, danych zdalnego Sanity ani publikacji.
Mobile/axe/zoom/reduced motion mają wcześniejszy wynik E2E; nie powtarzano
ich w tym przebiegu. Natywny zoom, czytnik i fizyczne urządzenie niesprawdzone.
Następny krok pozostaje taki sam: wdrożenie, migracja szkiców i odbiór webhooka.

### Poprawki po audycie Sanity, 08.10.2026

Na zlecenie użytkownika przygotowano kod, bez zdalnych zapisów i publikacji.

- Blog PL/EN ma model `page` (`slug: blog`) z `blogCollectionSection`,
  opcjonalnym newsletterem `formSection`, SEO i powiązaniem tłumaczeń.
  Renderer publiczny, preview, Presentation, Markdown, fixture i TypeGen
  korzystają z tego modelu. Do publikacji nowej strony pozostaje odczyt
  starszych ustawień; migracja nie nadpisuje istniejących danych.
- Studio: „Oferta konsultacji” i „Kategorie bloga”, właściwe szablony
  językowe również dla e-booków i stron prawnych, blokada tworzenia,
  duplikowania i usuwania singletonów oraz odczyt ustawień po stałym ID.
  Pole sluga artykułu przeniesione z Metadane do Treść; doprecyzowano
  etykietę, generowanie adresu i wymaganie rzeczywistego obrazu.
- Migracja bieżących ustawień z eksportu produkcyjnego: dry-run **2 szkice**
  (PL/EN), bez zapisów. Zachowane teksty, SEO, formularze, widoczność
  newslettera i tłumaczenia. Ponowne uruchomienie pomija istniejące strony.
- [Instrukcja publikacji](BLOG-PUBLISHING.md) wyjaśnia slug, listę i osobną
  trasę artykułu, datę sortowania oraz przebudowę po webhooku.
  Kontrakt webhooka obejmuje `article` i publiczne dokumenty zależne;
  test GROQ potwierdza pomijanie szkiców i wersji wydań. Dostępne CLI
  potwierdza istnienie dwóch webhooków, lecz nie pokazuje ich filtrów.
- Kontrole: TypeGen 73 typy/22 zapytania, 145 testów jednostkowych PASS.
  Porównanie fixture i Content Lake: 13 stron, te same sekcje, zdjęcia i DOM.
  Pełne `npm run verify` **PASS**: format, tokeny, lint, typy, build strony/
  Studio/preview/Workera, 145 unit i **171 E2E** w Chromium/Firefox/WebKit,
  build z 80 dokumentów Content Lake i porównanie 13 stron. Budżety:
  JS **5770 B gzip**, CSS **29804 B gzip**.
- Środowisko E2E wymagało bibliotek przeglądarek rozpakowanych pod `/tmp`
  i uruchomienia poza ograniczeniem filesystemu dla sandboxa Firefox.
  `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1` omija wyłącznie preflight
  instalacji systemowej; testy wszystkich trzech przeglądarek pozostają aktywne.

Następny krok: wdrożyć Studio, stronę i preview, zapisać/przejrzeć szkice
migracji oraz opublikować je na osobne zlecenie. Porównać rzeczywiste filtry
webhooków z kontraktem i odebrać przepływ publikacji testowego artykułu.
Zdalnego webhook → GitHub Actions → Cloudflare nie sprawdzano.
Natywny zoom, czytnik i urządzenie fizyczne pozostają niesprawdzone.

### Audyt konfiguracji Sanity, 08.10.2026

Odczyt przez konektor Sanity, bez zmian danych, schematu i publikacji.
Projekt `dyuqkn8c`, dataset `production`, workspace `default`.
Sprawdzono kod Studio, schemat wdrożony z aplikacji Studio oraz dane
w perspektywach `raw` i `published`.

- Brak dokumentu Blog w „Strony” jest zamierzony: `/blog/` i `/en/blog/`
  składają listę z `article`, `category` oraz `siteSettings.blogIndex`
  i `blogNewsletter`. Slug `blog` jest zarezerwowany dla tej trasy.
  Edycja: Ustawienia witryny → Polski/English → Indeks bloga / Newsletter bloga.
- Opublikowane ustawienia istnieją dokładnie raz dla każdego języka.
  Nawigacja prowadzi do właściwych indeksów. Istnieje po 11 opublikowanych
  artykułów PL/EN. Kontrola tytułu, sluga, daty, niepustej treści, autorów
  i referencji kategorii nie wykazała braków w sprawdzonym zbiorze.
  Po 10 artykułów w każdym języku ma `placeholderBody: true`; poprawność
  konfiguracji nie oznacza gotowości tych tekstów do publikacji docelowej.
- „Usługi” to współdzielone dane oferty, nie kategorie blogowe ani strony.
  `service-consultation-pl/en` mają 450 PLN, 60 minut oraz
  `bookingStatus: placeholder`. W każdym języku referencja rozwiązuje się
  na homepage, O mnie i konsultacjach. Strony mają niepuste sekcje.
- Wdrożone schematy `page`, `service`, `siteSettings` zawierają pola
  wymagane przez sprawdzony przepływ. Ustawienia bloga nie zniknęły ze schematu.
  Dataset jest publiczny; CORS zawiera domeny Studio i produkcyjnego preview.
  Repo pobiera publiczne dane z `perspective: published`, `useCdn: false`.
- Luka redakcyjna: menu nie ma osobnej pozycji Blog, a nazwa Usługi
  nie wyjaśnia współdzielenia oferty. Zalecenie: dodać wejście Blog do
  istniejących ustawień, wpisów i kategorii oraz doprecyzować nazwę oferty.
- Luka Presentation w kodzie: brak `mainDocuments` dla `/blog/`
  i `/en/blog/`, a lokalizacje `siteSettings` opisują tylko nawigację/stopkę.
  Zalecenie: jawnie powiązać indeks z ustawieniami danego języka.
- Dalsze zabezpieczenie: `siteSettings` pozostaje w ogólnych szablonach
  tworzenia dokumentów; brak blokady duplikowania singletonów. Duplikatów
  obecnie nie ma, lecz zapytanie ustawień wybiera pierwszy dokument języka.
  Szablony językowe nie obejmują `ebook` i `legalPage`; przy tworzeniu
  dokumentu język trzeba wybrać ręcznie, niezależnie od otwartej listy.

Weryfikacja: odczyty Sanity i przegląd kodu. Nie uruchamiano builda ani
testów aplikacji (audyt bez zmian kodu, brak zainstalowanych zależności).
Nie sprawdzono ręcznej edycji Studio, handshake Presentation/Access,
sekretów GitHub ani przebudowy strony po publikacji. Odczyt schematu nie
potwierdza wersji bundla pod własną domeną Studio.

Następny krok: uporządkować wejście Blog i etykietę oferty w Studio,
uzupełnić mapowanie Presentation i zabezpieczenia singletonów; następnie
odebrać edycję oraz chroniony podgląd. Ten audyt nie wdraża tych zmian.

### Sesja odtworzenia Playwright w środowisku chmurowym, 08.10.2026

Środowisko startowało bez `node_modules`, pobranych przeglądarek oraz
`/workspace/playwright-env.sh` z poprzedniej sesji. `storage.googleapis.com`
jest już dozwolone w polityce sieci; pobranie Chromium przez proxy przeszło.
Odtworzono zależności przez `npm ci` (Node 24.19.0, npm 11.9.0),
Playwright 1.63.0 oraz Chromium, Firefox i WebKit.

Przeglądarki są w `/workspace/.cache/ms-playwright`. Brakujące biblioteki
Debiana pobrano jako pakiety i rozpakowano lokalnie do
`/workspace/.cache/playwright-deps/root`; biblioteki WebKit trafiły też do
jego katalogów `sys/lib`, ponieważ launcher nadpisuje `LD_LIBRARY_PATH`.
Plik `/workspace/playwright-env.sh` ustawia katalog przeglądarek, cache npm
i ścieżkę lokalnych bibliotek. Nie zawiera opcji pomijania kontroli bibliotek.
Profil powłoki pozostaje bez zmian.

Firefox w ograniczonej powłoce zgłaszał brak folderu profilu; uruchomienie
z rozszerzonymi uprawnieniami działa. WebKit szuka `libGLESv2.so.2` przez
systemowy `ldconfig -p`, który nie uwzględnia lokalnych bibliotek.
Brak uprawnień root uniemożliwia instalację systemową. Sprawdzono rzeczywiste
uruchomienie i odczyt strony we wszystkich trzech przeglądarkach.

Pełna bramka zakończyła się kodem 0 z jednorazową opcją w poleceniu,
bez trwałego wyłączania kontroli w profilu ani skrypcie środowiska:

```sh
. /workspace/playwright-env.sh
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npm run verify
```

Wynik: format, tokeny, lint, kontrola typów, **134** testy jednostkowe
(23 pliki), buildy workspace’ów, kontrola artefaktów, **171** E2E
Chromium/Firefox/WebKit bez retry i powtórek pojedynczo, budowa **60** stron
z wygenerowanych dokumentów. Porównanie fixture z Content Lake:
**13** stron, te same sekcje, zdjęcia i DOM. CSS gzip **29 804 B**,
JS gzip **5 770 B**. Log: `/tmp/ola-verify-final.log`.

Następny krok środowiskowy: instalacja bibliotek systemowo przez administratora,
aby zwykłe `npm run verify` działało bez jednorazowej opcji. Pliki instalacji
poza repo mogą wymagać odtworzenia po kolejnym starcie środowiska.
Bez zmiany kodu aplikacji, zapisu do Sanity, push ani publikacji.

### Automatyczne aktualizacje i wdrożenia Studio — 08.10.2026

- Potwierdzono merge PR #45 do `main` jako `82a66a3`; Studio w repo ma 6.18.0.
  Wpis 5.31.2 w panelu Sanity był informacją o wcześniej zarejestrowanym
  zewnętrznym Studio, nie o stanie gałęzi. Sam merge nie wdrażał panelu.
- Na zlecenie użytkownika dodano `deployment.autoUpdates: true` przy istniejącym
  `appId`, bez zmiany hostingu Cloudflare. Funkcja wymaga jednego nowego buildu
  i wdrożenia, zanim zacznie działać dla redaktorów.
- `Deploy Studio` (`.github/workflows/deploy-studio.yml`) reaguje na udany
  `Quality` ze zdarzenia push na main w tym repo. Checkout dokładnego `head_sha`,
  kontrola środowiska production, npm ci, build Studio, porównanie z aktualnym
  main, upload Cloudflare i rejestracja zewnętrznego Studio/schematów w Sanity.
  Starsze wyniki są pomijane, przebiegi serializowane. Sekrety są dostępne tylko
  w krokach, które ich potrzebują; token Sanity nie trafia do buildu panelu.
- Workflow wymaga `SANITY_AUTH_TOKEN` w GitHub environment production,
  poza dotychczasowymi sekretami Cloudflare i zmiennymi projektu/datasetu.
  Nie potwierdzono obecności sekretu: odczyt nazw przez GitHub CLI został
  zablokowany przez API (403). Nie odczytywano wartości sekretów.
  Instrukcja konfiguracji i ponawiania: [Cloudflare](CLOUDFLARE-DEPLOYMENT.md#automatyczne-aktualizacje-i-wdrożenia-studio).
- `actionlint` **1.7.12**: wszystkie workflow PASS. Rzeczywisty skrypt kontroli
  commita uruchomiony z atrapą git: bieżący commit → deploy; starszy i pusty
  wynik → pominięcie; błąd git → zatrzymanie. **4 przypadki PASS**.
  CLI `sanity deploy --help` potwierdza obsługę flag external/url/yes/schema-required.
  Usunięto stare `--no-build` z instrukcji rejestracji: CLI 8 wyklucza tę flagę
  w połączeniu z `--external`, a rejestracja zewnętrzna i tak nie buduje panelu.
- `npm run verify` na Node 24.19.0/npm 11.9.0: format, tokeny, lint,
  typy wszystkich workspace’ów, **134 unit / 23 pliki**, publiczny build
  **65 stron**, build SSR preview i dry-run Workera PASS. Cała bramka kończy
  się kodem 1 na workspace build: nowe autoUpdates potrzebuje
  `https://sanity-cdn.com/v1/modules/by-app/...`, a środowisko odpowiada
  **403**. Osobny build Studio z rzeczywistymi niesekretnymi wartościami
  projektu, datasetu i preview zatrzymuje się na tej samej blokadzie.
  E2E i test Content Lake nie zostały osiągnięte w tym przebiegu.
- Nie wykonano uploadu Studio, rejestracji w Sanity, merge ani zapisu treści.
  Zmiany przygotowane do push/PR na `codex/auto-deploy-studio`. Następny krok:
  potwierdzić sekret, zielone Quality w CI, scalić PR i sprawdzić pierwszy
  `Deploy Studio` oraz wersję/kanał aktualizacji w Sanity. Zabezpieczenia
  środowiska production mogą wymagać akceptacji, jeśli tak je skonfigurowano.

### Wdrożenie zaleceń CSS według good-css, 08.10.2026

Na zlecenie użytkownika wdrożono zalecenia [raportu CSS](CSS-REVIEW-2026-10-08.md):
oddzielne zależności szablonów i legacy, budżety per szablon z inline CSS,
typografię `rem`/płynne tokeny, hover tylko dla myszy i feedback na dotyku,
outline w forced colors, ruch opt-in, właściwości logiczne, overflow oraz
usunięcie martwych reguł Article3a. Generator emituje OKLCH/`light-dark()`
z fallbackiem HEX i oddzielnym arkuszem aliasów legacy. Tailwind skanuje `src`.
Makiety 3a podłączają arkusz aliasów, aby zachować poprawne odstępy w podglądzie.

Homepage: **7 383 B gzip zewnętrznego CSS**, wcześniej 21 055 B (**−64,9%**).
About 7 468 B, konsultacja 7 685 B, polityka prywatności 5 797 B.
Cała pula CSS: **30 103 B gzip** / limit 32 KiB; JS 5 770 B.
Pełna tabela i zakres w raporcie. Nowe regresje pilnują skalowania tekstu
20/32 px na ośmiu szablonach przy 320/1440 px oraz interakcji i dostępności.

Node 24.19.0: format, tokens:check, lint, typy, **135 unit**, build **65 stron**,
Studio/preview/Worker dry-run, test:build i **61 E2E Chromium: PASS**.
Po poprawce importów aliasów makiet ich **8 E2E ponownie PASS**;
końcowe lint, format i `git diff --check`: PASS.
`test:content-lake`: PASS, zgodność sekcji/zdjęć/DOM na 13 stronach.
Ogląd zrzutów Home/About/Consultation/e-booka przy 390/1440 px wykonany;
porównano z makietami 3a, dowody `/tmp/ola-css-evidence/`.

Pełne `npm run verify` uruchomiono, ale nie uzyskało PASS: **122 przypadki
Firefox/WebKit nie wystartowały**, ponieważ środowisko nie zawiera tych
przeglądarek, a pobranie blokuje HTTP 403 z polityki sieciowej.
Systemowy Chromium działa przez opcjonalne `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
Worker dry-run używał zapisywalnego `XDG_CONFIG_HOME=/tmp/ola-css-config`;
nie wykonano deployu ani zapisu CMS. Test Content Lake uruchomiono osobno,
ponieważ verify zakończyło się na E2E.

Następny krok: pełne verify z Firefox/WebKit i ręczny odbiór wszystkich sekcji,
natywnego zoomu oraz czytnika/urządzenia. Coverage i Lighthouse niewykonane.

### Audyt CSS według good-css, 08.10.2026

Wykonano [audyt CSS](CSS-REVIEW-2026-10-08.md) na `3143c24`, bez zmian
aplikacji. Potwierdzono pobieranie CSS Home/About/Consultation i legacy przez
te same trasy: 21 055 B gzip zewnętrznego CSS dla homepage i stron prawnych.
Wszystkie zewnętrzne pliki CSS razem: 29 804 B gzip; budżet pomija CSS inline.
Raport opisuje skalowanie fontów, hover/active, forced colors starszych kontrolek,
martwe selektory, właściwości logiczne, overflow i tokeny motywu.

Kontrole na Node 24.19.0: tokens:check PASS, 9 unit w 3 plikach PASS,
build 65 stron PASS, test:build PASS (CSS 29 804 B, JS 5 770 B gzip).
E2E, coverage i Lighthouse niewykonane: pobranie Chromium blokuje polityka
sieciowa (HTTP 403 dla cdn.playwright.dev). Brak nowych kontroli wizualnych,
dotyku, zoomu, font size i forced colors. Pełnego verify nie uruchamiano.
Format trzech zmienionych dokumentów i lokalne odnośniki raportu: PASS.

Następny krok: izolacja zależności CSS szablonów i pomiar per strona,
następnie poprawki typografii i interakcji z pełnym verify/odbiorem 3a.
Audyt nie zmienia stanu wdrożenia CMS ani publikacji.

### Aktualizacja Sanity — 08.10.2026

- Sanity i Vision 5.31.2 → **6.18.0** (stabilny tag `latest` w npm),
  GROQ 6.13.2 → **6.18.0**, klient 8.6.1 → **8.9.0** w stronie i preview,
  ikony 5.2.2 → **5.2.3**. Preview URL Secret 4.1.5 i Webhook 4.0.4
  już były aktualne. React 19.3.0 i Node 24 spełniają wymagania.
- Przejrzano changelog v6: projekt nie używa usuniętych `auth.mode`
  ani `enableLegacySearch`; Vite 8 i React Strict Mode nie wymagają zmian
  w obecnej konfiguracji. Nie zmieniono wersji API Content Lake.
- Jawne dev dependencies w root: `sanity` dla walidatora dokumentów,
  `@sanity/webhook` dla testów podpisu. Wcześniej importy zależały od hoistingu.
  TypeGen: **72 schematy, 22 zapytania**; nowy rejestr globalny typów oraz
  interfejs zgodności klienta. ESLint dopuszcza pojedyncze dziedziczenie
  interfejsu wyłącznie w wygenerowanym `src/sanity.types.ts`.
- Jeden lockfile npm. Poprawki zgodne z zakresami wersji: m.in. Wrangler
  4.131.1 → **4.148.0**, Vite 8.3.0 → **8.3.4**, devalue 5.9.4,
  DOMPurify 3.4.16, brace-expansion 5.0.12, fast-uri 3.1.8,
  http-cache-semantics 4.3.0. Jawny Sharp **0.35.5** zabezpiecza build
  obrazów Astro. Override `@vercel/frameworks` → `smol-toml` **1.9.0**
  usuwa podatny parser TOML z CLI Sanity. Nie użyto `audit fix --force`.
- Czyste `npm ci` **PASS** (1294 pakiety); `npm ls` potwierdza nowe wersje
  Sanity/Vision/klienta i Sharp po odtworzeniu instalacji z lockfile.
- Node **24.19.0**, npm **11.9.0**: format, tokeny, lint, typy
  (233 + 11 plików Astro, Studio/Worker/shared), **134 unit / 23 pliki**,
  build Astro (**65 stron**), Studio, SSR preview, dry-run Workera i kontrola
  artefaktów **PASS**. JS **5760 B**, CSS **29804 B gzip**.
- `npm run verify` nie jest zielone: E2E nie uruchamiają przeglądarek,
  bo `npx playwright install chromium firefox webkit` kończy się
  `403 Domain forbidden` dla `cdn.playwright.dev`. To blokada środowiska;
  testów nie wyłączono. `npm run test:content-lake` osobno: generacja
  78 dokumentów, fixture build, build Content Lake (**60 stron**) i budżety
  PASS; porównanie DOM/zdjęć blokuje ten sam brak Chromium.
  Walidacja offline `npx tsx scripts/validate-content-lake.ts`:
  **78 dokumentów, 0 błędów**.
- `npm audit`: **22 zgłoszenia (13 high, 9 moderate), 0 critical** po
  poprawkach (początkowo 28). Pozostałe źródła i granice ekspozycji:
  `braces` 3.0.3 (brak nowszej stabilnej wersji; wzorce lokalnych plików
  w CLI/codegen/linterze), `js-yaml` 3.13.1 i `sprintf-js` w detekcji
  frameworków/argumentach CLI (zaufane pliki repo i argumenty), `uuid` 10
  w `typeid-js` (używa v7; zgłoszenie dotyczy v3/v5/v6 z buforem),
  Sharp 0.35.4 przypięty przez Miniflare (lokalny emulator; preview używa
  `imageService: "compile"`, brak przetwarzania obrazów Miniflare na produkcji).
  Sanity/Vision/Wrangler są też raportowane jako zależności tych pakietów.
  Uzasadnienie braku ekspozycji dotyczy obecnej architektury i zaufanych
  wejść narzędzi lokalnych, nie publicznego przetwarzania dowolnych plików.
  Nie wymuszono niezgodnych majorów parserów ani proponowanego przez audyt
  downgrade’u Sanity. Przy zmianie sposobu użycia narzędzi ponowić ocenę.
- Na zlecenie użytkownika zmiany przygotowano do push i PR na gałęzi
  `codex/update-sanity-6.18.0`. Bez zapisu do datasetu i merge. Następny krok tej
  aktualizacji: pełne verify w CI/środowisku z dostępem do przeglądarek oraz
  kontrola Studio/Presentation z rzeczywistym logowaniem; potem wrócić do
  prac etapu 4a opisanych niżej.

### Sesja importu 3a, 08.10.2026

Jeden skrypt `npm run import:3a` składa dokumenty 3a z fixture’ów i seedów.
Domyślnie jest suchy przebieg. Zapis do Sanity wymaga
`SANITY_API_WRITE_TOKEN` i `--dataset production`. W tej sesji tokenu nie było
i nic nie zostało wysłane.

Suchy przebieg, projekt `dyuqkn8c`, dataset niepodany, porównanie z datasetem
pominięte:

- delete: article 6, page 9, author 2, category 4, form 2, service 4,
  testimonial 4, redirect 1, sanity.imageAsset 3 (razem 35)
- createOrReplace: article 22, author 2, category 10, ebook 12, form 2,
  legalPage 6, page 8, service 2, siteSettings 2, testimonial 12 (razem 78)
- pending: brak. Po scaleniu `main` (`d7ba6a1`, PR #39) limit etykiety zgody
  to 400, a schemat `legalPage` i fixture’y są na tej gałęzi. Dwa formularze
  newslettera i sześć stron prawnych są w transakcji. `--write` nie jest
  już blokowany przez stan pending.

`siteSettings` bierze nawigację i indeks bloga z jednego fixture’a.
Angielski slug ebooka PMOS (PCOS) to `supplements-in-pcos`.
`cover.alt` i `cover.tone` pochodzą z fixture’ów.
Klucz rastra zostaje w `rasterKey`, a zapytanie GROQ czyta
`coalesce(image.asset->url, rasterKey)`.

Artykuł 01 (`article-blog-01-pl/en`) ma treść z
`src/content/article-featured.ts`. Pozostałe 10 par ma treść zastępczą z
`articleBody` w `src/sanity/blog-collection-fixtures.ts` i pole
`placeholderBody: true` (etykieta w Studio: „Treść zastępcza”).

| klucz | PL                                    | EN                                                     |
| ----- | ------------------------------------- | ------------------------------------------------------ |
| 02    | codziennie-posilki-przy-pcos          | everyday-meals-with-pcos                               |
| 03    | pytania-o-pcos-przed-wizyta           | sorting-pcos-questions-before-an-appointment           |
| 04    | wyniki-badan-na-konsultacje           | lab-results-what-to-bring-to-a-consultation            |
| 05    | regularne-posilki                     | regular-meals-when-every-day-looks-different           |
| 06    | insulinoopornosc-rozmowa-o-odzywianiu | insulin-resistance-starting-the-nutrition-conversation |
| 07    | suplementy-w-pcos-pytania             | pcos-supplements-sort-questions-before-you-buy         |
| 08    | dzienniczek-posilkow                  | a-food-diary-without-the-pressure-of-perfection        |
| 09    | cel-konsultacji                       | naming-the-goal-of-a-consultation                      |
| 10    | zakupy-spozywcze                      | grocery-shopping-that-fits-your-week                   |
| 11    | sprzeczne-rady-o-pcos                 | conflicting-advice-on-pcos                             |

Angielskie tytuły SEO skrócone do prefiksu istniejącego tytułu, bo przekraczały
60 znaków. Widoczny tytuł zostaje pełny.

- 06: `Insulin resistance: where to start the nutrition` (48)
- 09: `What do you want to change? How to name the goal of a` (53)
- 11: `Conflicting advice on PMOS (PCOS): write down what you want to` (55)

PR #39 jest na `main` jako `d7ba6a1`. Ta gałąź wciąga go zwykłym merge.
Walidacja offline obejmuje 78 dokumentów, w tym `form` i `legalPage`.

Walidacja offline `scripts/validate-content-lake.ts` (schemat repo, bez tokenu):
78 dokumentów, 0 błędów. `sanity documents validate` nie było uruchomione,
bo CLI wymaga logowania. Wariant liczb na O mnie może mieć 0 albo 3 wyróżnień,
bo fixture ma pustą listę.

`npm run test:content-lake` zbudował 54 strony z wygenerowanego NDJSON.
Po korekcie kadrów CSS gzip to 29 797 B, JS gzip 5 770 B.

Korekta widoku po przeglądzie zrzutów. Style `img` w widokach 3a nie
schodziły do `SiteImage`, więc portret wychodził z różowej karty, a loga
zostawały w kolorze i w obciętym kadrze. Selektory są teraz `:global(img)`.
Loga partnerów biorą wymiary pliku i `fit="contain"`. Lead strony głównej
na wąskim kontenerze ma 16 px i interlinie 1,5, jak w makiecie.
Podpis hero konsultacji to „Ola Olesiewicz”. Zdanie o Cal.com zostało pod
ofertą, bez dopisku „To nie jest potwierdzenie wizyty.” Ten dopisek jest
tylko w `bookingEditorNote`. Nagłówek 3a nie dokłada „English” ani „Polski”.
Lista bloga nie ma rzędu filtrów kategorii. Adresy `/en/` i stron kategorii
zostają.

Pełne strony, nie sam pierwszy ekran. Zdjęcia niżej (nakładka jedzenia,
portret przy konsultacji na stronie głównej i na O mnie, zdjęcie przebiegu
konsultacji) są w HTML-u. Poprzedni zrzut `fullPage` robił je, zanim
`loading="lazy"` zdążyło je zdekodować, więc karta wyglądała na pustą.
Nowy przebieg przewija każde `img` i czeka na `decode`.

„450+” łamało się w „45” i „0+”, bo `overflow-wrap: anywhere` obejmowało
`strong`. Selektor jest jak w makiecie, bez `strong`, a liczba ma
`white-space: nowrap`. Sekcja „Zaczynam od Ciebie” używa tej samej siatki
kart co `.cherry .results` (pierwsza karta na dwie kolumny, dwie kolejne
obok siebie). Kadry strony głównej biorą wysokości z makiety cherry.
Portret „Jestem Ola.” ma 540 px, nakładka jedzenia 220×150, zdjęcie
konsultacji 520 px (na 390 px jest 280 px). Dyplom na O mnie zostaje.

`npm run test:content-lake` buduje fixture do `.cache/dist-fixture`, potem
content-lake do `dist`, i uruchamia `scripts/compare-fixture-lake.mjs`.
Skrypt pada, gdy sekcja fixture ma inne zdjęcia (liczba, plik, `object-fit`,
`naturalWidth`) albo inny szkielet DOM niż content-lake. Obejmuje 7 stron
makiety i 6 stron prawnych. Ostatni wynik to 13 stron bez różnic.

Inwentarz zdjęć z tego samego przebiegu leży w
`/opt/cursor/artifacts/screenshots/photo-inventory.json`.
Portret hero, loga, portret O mnie, nakładka jedzenia i zdjęcia konsultacji
mają ten sam `object-fit`, pozycję i rozmiar co makieta (różnica boku do 12 px).

`npm run verify` po scaleniu stron prawnych zakończone kodem 0 na Node 24.21.0.
Format, tokeny, lint, `astro check` (0 błędów), **133** testy jednostkowe
(23 pliki), build, workspace’y, `check-build`, **171** E2E
Chromium/Firefox/WebKit i budowa z wygenerowanych dokumentów. Porównanie
fixture z content-lake: 13 stron, te same sekcje, zdjęcia i DOM. CSS gzip
w tamtym przebiegu to 29 823 B, JS gzip 5 770 B.

Potem „450+” na 390 px dostało 78 px, jak w makiecie cherry, i zostaje w
jednej linii obok podpisu. Pomiar obu stron: wysokość 78 px, `sameRow`.
Testy layoutu 320/390/1440 na Chromium, Firefox i WebKit przeszły.
CSS gzip po tej korekcie to 29 804 B.

verify-ola `ola-1791460363` na `http://127.0.0.1:4340`, doctor zielony
(treść z wygenerowanego NDJSON, bez przebudowy w trakcie sesji).
Zestawienia mają makietę po lewej i build po prawej, desktop 1440 i mobile 390:

- `/opt/cursor/artifacts/screenshots/homepage-desktop.png`
- `/opt/cursor/artifacts/screenshots/homepage-mobile.png`
- `/opt/cursor/artifacts/screenshots/about-desktop.png`
- `/opt/cursor/artifacts/screenshots/about-mobile.png`
- `/opt/cursor/artifacts/screenshots/consultation-desktop.png`
- `/opt/cursor/artifacts/screenshots/consultation-mobile.png`
- `/opt/cursor/artifacts/screenshots/ebook-desktop.png`
- `/opt/cursor/artifacts/screenshots/ebook-mobile.png`
- `/opt/cursor/artifacts/screenshots/ebooks-desktop.png`
- `/opt/cursor/artifacts/screenshots/ebooks-mobile.png`
- `/opt/cursor/artifacts/screenshots/blog-desktop.png`
- `/opt/cursor/artifacts/screenshots/blog-mobile.png`
- `/opt/cursor/artifacts/screenshots/article-placeholder-desktop.png`
- `/opt/cursor/artifacts/screenshots/article-placeholder-mobile.png`

Pełne strony z przeglądarki verify-ola (desktop 1280) leżą w
`/tmp/ola-verify-evidence/ola-1791457722/`.

Następny krok: odbiór PR, potem `--write` u koordynatora. Przed zapisem
wyłączyć webhook produkcji. Drugi `--write` padnie, jeśli 35 identyfikatorów
z listy już nie istnieje. Nie dotykać `system.*` ani szkicu
`sanity.previewUrlSecret`.

### Sesja scalenia main w PR #39, 08.10.2026

Scalenie `origin/main` (`ce5b675`: dyplom #40, social #37 `8bc80da`,
matcha #36) w gałąź stron prawnych. Commit merge, bez rebase i bez force-push.
Jedyny konflikt to `docs/PROGRESS.md`: zachowane sesje stron prawnych i sesje
z main. Auto-merge `scripts/check-build.mjs` zostawił asercje stron prawnych i
profili social. Auto-merge `scripts/import-homepage-content.mjs` i
`src/content/homepage-seed.ts` zostawił linki zgody newslettera oraz
`footerSocialLinks()` z `social-profiles.ts`. Auto-merge `tests/e2e/ui.spec.ts`
zostawił regex zgody newslettera i testy dyplomu oraz stopki.

Kontrole na Node 24.21.0: format, tokeny, lint, `astro check`, **124** testy
jednostkowe (22 pliki), build, workspace’y, `check-build`, **171** E2E
Chromium/Firefox/WebKit. CSS gzip `dist/_astro` **29 778 B** (limit 32 768 B).
JS gzip **5 770 B**.

### Sesja — strony prawne CMS — 08.10.2026

Zakres: dokumenty `legalPage` edytowalne w Sanity, trasy 3a, treść PL 1:1 ze
źródła zawlodzki.pl (ta sama spółka Wellbiz), bez redakcji B2C.

Zrobione w kodzie: schemat `legalPage` / `legalBody` (H2/H3, listy, linki, kod,
tabele `articleTable`), Studio (Strony prawne, Presentation), GROQ + TypeGen,
mapper `mapLegalPage`, serializer Markdown, fixture’y, `import:legal` dry-run,
`LegalPage` + `Legal3a` (SiteShell3a, typografia jak Article3a, TOC przy wielu
H2). Trasy: `/polityka-prywatnosci/`, `/regulamin/`, `/lista-cookies-i-identyfikatorow/`,
`/regulamin-newslettera/`, `/en/privacy/`, `/en/terms/` (przepięte z `page` na
CMS). Stopka bez zmian (polityka + regulamin). Zgoda `DemoForm`: markdown-link
do polityki i regulaminu newslettera. Sitemap `sitemap.xml` uwzględnia te URL.
EN: krótka informacja, że wiążąca jest wersja PL, z linkiem — bez tłumaczenia
maszynowego.

Źródła HTML: `scripts/legal-sources/`. Konwersja: `scripts/convert-legal-html.py`.
Przykłady MD: `src/content/examples/legal-*.md`.

Kontrole (Node 24.21.0), draft PR **#39**, rebase na `main` po #36 i #38:

- `npm run verify` **PASS**: format, tokeny, lint, `astro check`, **121** unit,
  build, workspaces, `check-build`, **165** E2E Chromium/Firefox/WebKit
  (w tym 8 przypadków `legal-pages.spec.ts` × 3 przeglądarki).
- CSS gzip `dist/_astro`: **29 778 B** / 32 KiB; JS gzip **5 770 B**.
- Dry-run `import:legal` kod 0; `--write` kod 2, bez zapisu Content Lake.
- verify-ola: `ola-legal-1791451328`, baza `http://127.0.0.1:4340`.
- Studio bez `SANITY_STUDIO_PROJECT_ID` (wartość `replace-me`) — zrzut
  dokumentu w Studio niemożliwy lokalnie bez sekretów. `sanity build`
  workspace przechodzi; `sanity dev` wymaga prawdziwego projectId.

Otwarte decyzje:

- EN dokumentów prawnych (brak źródła; fixture to notice + link do PL).
- Redakcja B2C treści przeniesionej 1:1 z B2B zawlodzki.pl.
- Zapis do Content Lake — dopiero na osobne zlecenie.

Artefakty:

- `/opt/cursor/artifacts/screenshots/privacy-desktop.png`
- `/opt/cursor/artifacts/screenshots/privacy-mobile.png`
- `/opt/cursor/artifacts/screenshots/cookies-desktop.png`
- `/opt/cursor/artifacts/screenshots/cookies-mobile.png`
- `/opt/cursor/artifacts/screenshots/terms-desktop.png`
- `/opt/cursor/artifacts/screenshots/terms-mobile.png`
- `/opt/cursor/artifacts/screenshots/newsletter-desktop.png`
- `/opt/cursor/artifacts/screenshots/newsletter-mobile.png`
- `/opt/cursor/artifacts/screenshots/privacy-en-desktop.png`
- `/opt/cursor/artifacts/screenshots/privacy-en-mobile.png`
- `/opt/cursor/artifacts/screenshots/newsletter-form-closeup.png`
- Dowody verify-ola: `/tmp/ola-verify-evidence/ola-legal-1791451328/`.

Niewykonane: natywny zoom, czytnik, urządzenie fizyczne. 320 px / 200% zoom
stron prawnych — niewykonane jako osobne zrzuty 1:1. Studio bez sekretów.

Następny krok: odbiór PR #39; redakcja B2C i zapis do Content Lake na zlecenie.
Nie mergować bez zgody.

### Sesja scalenia social #37 w PR #40, 08.10.2026

Drugie scalenie `origin/main` (`8bc80da`, squash PR #37 — kanoniczne URL
profili) w gałąź zdjęcia dyplomu. Commit merge, bez rebase i bez force-push.
Konflikty: `docs/PROGRESS.md`, `docs/HOMEPAGE-CMS-CONFIG.md`,
`src/views/About3a.astro`. Zostawione obie strony: zdjęcie dyplomu
(`pickSiteImage`, kadr 1440×1609) oraz `sameAs: socialProfileSameAs()`.
W tabeli CMS wiersz dyplomu z tej gałęzi i kanoniczne URL z #37.
Auto-merge `scripts/import-homepage-content.mjs` zostawił lukę dyplomu
(fixture ma klucz, Content Lake bez pliku) i `social-urls: resolved`.
Auto-merge `tests/e2e/ui.spec.ts` zostawił `naturalWidth` dyplomu i testy
stopki `/` + `/en/`.

Kontrole na `529ee61`, Node 24.21.0. `npm run verify` zakończone kodem 0.
Format, tokeny, lint, `astro check`, **118** testów jednostkowych (21 plików),
build, workspace’y, `check-build`, **147** E2E Chromium/Firefox/WebKit
(w tym 7×3 `matcha-accent-3a.spec.ts`, dyplom `naturalWidth > 0` i stopka
`/` + `/en/`). CSS gzip `dist/_astro` **29 778 B** (limit 32 768 B).
JS gzip **5 770 B**.

verify-ola `ola-1791451993` na `http://127.0.0.1:4340`. `browser posts`
zwraca `[]` po newsletterze PL i na EN. Dowody leżą w
`/tmp/ola-verify-evidence/ola-1791451993/`. Na `/o-mnie/` obraz dyplomu
ma `naturalWidth` 1440, `naturalHeight` 1609, `complete`, promień 12 px
i `object-fit: fill`. Na 1280 px pudełko 340×379,89 px; na 390 px 294×328,5 px.
Porównanie pikseli z `diploma-production-desktop.png` i
`diploma-production-mobile.png` daje MAD 0. Zrzuty bez odświeżenia.

Następny krok: PR **#40** ready for review. Nie mergować. Wgranie pliku
do Content Lake i adres płatnej rezerwacji zostają otwarte.

### Sesja scalenia main, 08.10.2026

Scalenie `origin/main` (`e016b9b`, squash PR #36 matcha i PR #38 good-css)
z gałęzią zdjęcia dyplomu. Commit merge, bez rebase. Jedyny konflikt to
`docs/PROGRESS.md`. Sesja dyplomu i sesje matcha oraz cherry zostały poniżej.
Auto-merge `docs/IMPLEMENTATION-PLAN.md` zostawił checkbox dyplomu i checkboxy
matcha. Auto-merge `docs/HOMEPAGE-CMS-CONFIG.md` zostawił decyzję zdjęcia
dyplomu i zapis wykonania tokenów matcha. PR #37 (profile social) był otwarty
i nie wchodził w to scalenie.

Kontrole na Node 24.21.0. `npm run verify` zakończone kodem 0.
Format, tokeny, lint, `astro check`, **116** testów jednostkowych (20 plików),
build, workspace’y, `check-build`, **141** E2E Chromium/Firefox/WebKit.
CSS gzip `dist/_astro` **29 778 B** (limit 32 768 B). JS gzip **5 770 B**.
Suma CSS jest taka sama jak po sesji cherry na main. `scripts/check-build.mjs`
liczy gzip plików CSS w `dist/_astro`. Osobny gzip Workera (2,94 KiB) to inny
artefakt.

verify-ola `ola-1791451319` na `http://127.0.0.1:4340`. `browser posts`
zwraca `[]` po newsletterze PL i na EN. Dowody leżą w
`/tmp/ola-verify-evidence/ola-1791451319/`. Na `/o-mnie/` i `/en/about/`
obraz dyplomu ma `naturalWidth` 1440 i `naturalHeight` 1609, jest `complete`,
ma promień 12 px i `object-fit: fill`. Na 1280 px obraz ma 340×380 px.
Na 390 px ma 294×329 px.

Porównanie pikseli z istniejącymi zrzutami
`diploma-production-desktop.png` i `diploma-production-mobile.png`
daje różnicę 0. Zrzuty w `/opt/cursor/artifacts/screenshots/` bez odświeżenia.
Makieta w tym scaleniu nie była ruszana.

Następny krok to odbiór PR #40. PR zostaje draftem. Wgranie pliku do
Content Lake, adres płatnej rezerwacji i linki social z PR #37 zostają otwarte.

### Sesja zdjęcia dyplomu, 08.10.2026

Na About3a (`/o-mnie/` i `/en/about/`) slot dyplomu pokazuje zdjęcie
ukończenia Aleksandry. Pozycja, szerokość do 340 px, podpis i ramka 12 px
zostają jak w makiecie. Puste `diplomaScan` nadal rysuje ramkę ze SVG.

Źródło to JPEG 1440×1920 z drugiego kadru karuzeli
[Instagram](https://www.instagram.com/p/DOMPRWmjXWX/), plik
`src/assets/portraits/diploma.jpg`. `SiteImage` kroi go przy budowaniu do
1440×1609 (`diplomaSlotSize`, proporcja slotu 340/380). Grawitacja Sharp to
`top`, z `diplomaCropPosition` `50% 0%`. Dół kadru (buty i kostka) schodzi,
tabliczki wydziału, twarz, różowa teczka i róże zostają. CSS `object-fit`
zostaje `fill`.

Polski alt to „Aleksandra Olesiewicz z dyplomem przed Wydziałem Zdrowia
Publicznego ŚUM w Bytomiu”. Angielski alt to „Aleksandra Olesiewicz with her
diploma outside the Faculty of Public Health, Medical University of Silesia
in Bytom”.

`aboutCopy.diplomaAlt` trafia do `aboutAuthorFixture`, potem do `diplomaScan`
i istniejącego `toCredentials`. Klucz lokalny to `diploma`. Asset w Content
Lake jest niewgrany.

Kontrole na `3b4905e`, Node 24.21.0. `npm run verify` zakończone kodem 0.
Format, tokeny, lint, `astro check`, **115** testów jednostkowych (20 plików),
build, workspace’y, `check-build`, **120** E2E Chromium/Firefox/WebKit.
E2E na `/o-mnie/` i `/en/about/` czyta `naturalWidth` 1440 i `naturalHeight` 1609. CSS gzip `dist/_astro` **29 635 B** (limit 32 KiB). JS gzip **5 770 B**.
Suma gzip plików CSS w `dist/_astro` jest identyczna jak w pakiecie 7, bo
zmiana selektora nie powiększyła skompresowanego arkusza.

`:global(img)` w `.about3a-diploma` sprawia, że `border-radius: 12px` dochodzi
do img z `SiteImage`. Chromium na 1280 px i 390 px podaje promień 12 px i
`object-fit: fill`. Na desktopie obraz ma 340×380 px.

verify-ola `ola-1791450522` działa na `http://127.0.0.1:4340`. `browser posts`
zwraca `[]` po newsletterze PL i na EN. Dowody leżą w
`/tmp/ola-verify-evidence/ola-1791450522/`.

Artefakty:

- `/opt/cursor/artifacts/screenshots/compare-diploma-desktop.png` (makieta | produkcja)
- `/opt/cursor/artifacts/screenshots/compare-diploma-mobile.png` (makieta | produkcja)
- `/opt/cursor/artifacts/screenshots/diploma-mockup-desktop.png`
- `/opt/cursor/artifacts/screenshots/diploma-production-desktop.png`
- `/opt/cursor/artifacts/screenshots/diploma-mockup-mobile.png`
- `/opt/cursor/artifacts/screenshots/diploma-production-mobile.png`
- `/opt/cursor/artifacts/screenshots/about-pl-desktop-full.png`

Nie sprawdzono natywnego zoomu przeglądarki, czytnika ani urządzenia
fizycznego. Nie ma osobnych zrzutów sekcji przy 320 px i zoomie 200%.

Następny krok to odbiór PR. Wgranie pliku do Content Lake i adres płatnej
rezerwacji zostają otwarte.

### Sesja — merge origin/main w PR #37 — 08.10.2026

`origin/main` (squash #36 `aab7928` + chore skills #38) wlany merge-committem
w `cursor/social-profile-links-1a17`. Bez rebase i bez force-push.

Konflikt tylko w `docs/PROGRESS.md`: zachowane obie historie (sesja social
#37 oraz sesje cherry/matcha #36). Auto-merge `docs/HOMEPAGE-CMS-CONFIG.md`
i `src/pages/design-system.astro` zostawił URL profili i tokeny/swatche
akcentu. Kod #36 (CherryCoverAccent, secondary button, tokeny) i kod #37
(`social-profiles.ts`, SiteFooter, JSON-LD `sameAs`) bez skrótów.

Kontrole (Node 24.21.0), PR **#37** (nie-draft), head po verify `3243de5`:

- `npm run verify` **PASS**: format, tokeny, lint, `astro check`, **117** unit,
  build, workspaces, `check-build`, **147** E2E Chromium/Firefox/WebKit
  (w tym 7×3 `matcha-accent-3a.spec.ts` i stopka `/` + `/en/`).
- CSS gzip **29 778 B** / 32 KiB; JS gzip **5 770 B**.
- verify-ola `ola-1791451021`, baza `http://127.0.0.1:4340`. Stopka PL/EN
  desktop+mobile bez zmiany układu (Instagram / Facebook / TikTok). Cherry
  okładka: strzałka i iskierka `rgb(216, 231, 138)` (#D8E78A), sparkle ≥ 14 px.

Nie mergować.

### Sesja — kanoniczne URL profili social — 08.10.2026

Zakres: zastępcze strony główne Instagram / Facebook / TikTok w stopce 3a
zamienione na prawdziwe profile Aleksandry Olesiewicz. Jedno źródło:
`src/content/social-profiles.ts`. Wygląd stopki bez zmiany (widoczne etykiety
zostają Instagram / Facebook / TikTok). Gałąź PR #36 (akcent matcha) nietknięta.

Gdzie były linki i co czyta źródło:

- fixture i fallback: `homepageSettingsFixture`, `shellLinks` → `footerSocialLinks()`
- katalog 3a: `src/pages/design-system.astro`
- seed/import: `scripts/import-homepage-content.mjs` (PL i EN przez spread PL)
- JSON-LD `Person.sameAs`: About3a, Consultation3a, Ebook3a, `map-article`
- Sanity: schemat `siteSettings.socialLinks` bez zmiany; Content Lake bez zapisu
- mockupy HTML `podglad.html?strona=…` nietknięte (nie są serwisem)

Stopka: `rel="noopener noreferrer"`, `target="_blank"`, `aria-label`
„Instagram Aleksandry Olesiewicz” / EN „Instagram of Aleksandra Olesiewicz”.

Kontrole (Node 24.21.0), draft PR **#37**, head `a652b6f`:

- `npm run verify` **PASS**: format, tokeny, lint, `astro check`, **116** unit,
  build, workspaces, `check-build`, **126** E2E Chromium/Firefox/WebKit.
  CSS gzip `dist/_astro`: **29 635 B** / 32 KiB; JS gzip **5 770 B**.
- verify-ola: `ola-1791449846`, baza `http://127.0.0.1:4340`. Stopka `/` i
  `/en/` ma trzy kanoniczne href. `browser posts` nie dotyczy (brak formularza).

Artefakty:

- `/opt/cursor/artifacts/screenshots/footer-pl-desktop.png`
- `/opt/cursor/artifacts/screenshots/footer-pl-mobile.png`
- `/opt/cursor/artifacts/screenshots/footer-en-desktop.png`
- `/opt/cursor/artifacts/screenshots/footer-en-mobile.png`
- Dowody verify-ola: `/tmp/ola-verify-evidence/ola-1791449846/`.

Nietknięte: wygląd stopki, mockupy `podglad.html`, gałąź PR #36, Content Lake.

Następny krok: odbiór draft PR **#37**; nie mergować. Content Lake poza zakresem.

### Sesja wzmocnienia cherry — 08.10.2026

Odbiór PR #36: iskierka na wiśniowych okładkach była za mała; brakowało
poziomej strzałki z kafelka 3 planszy 05. SVG `CherryCoverAccent` w
`src/design-system/decorations/`: cienka strzałka i czteroramienna
iskierka w `accent-on-primary` (#D8E78A). Render tylko przy
`tone="cherry"`. Temat okładki ma `max-width`, żeby nie nachodzić na
znak. Zdjęcia, układ kart i pozostałe akcenty bez zmian.

Draft PR **#36**, head po `npm run verify`: dopisany w commicie dokumentacji.
Kontrole (Node 24.21.0):

- `npm run verify` **PASS**: **115** unit, **141** E2E Chromium/Firefox/WebKit
  (7 przypadków `matcha-accent-3a.spec.ts` × 3, w tym brak kolizji z tekstem
  na homepage, kolekcji, kategorii PMOS (PCOS), artykule, katalogu, EN, 1280 i 390).
- CSS gzip **29 778 B** / 32 768 B; JS gzip **5 770 B**.
- Kontrast `#D8E78A` na `cover-primary` **6,17** (≥ 3 dla grafiki).
- verify-ola `ola-cherry-accent`, `browser posts` = `[]`.

Artefakty: `closeup-ebooks-cherry-cover.png` (przed/po),
`compare-board-05-secondary-decorations.png`,
`compare-accent-ebooks-desktop-v2.png`,
`compare-accent-home-desktop-v2.png`,
`compare-accent-article-desktop-v2.png`,
`compare-accent-ebooks-mobile-v2.png`.

Następny krok: odbiór wzmocnionej cherry. Nie mergować bez zgody.

### Sesja akcentu matcha 3a — 08.10.2026

Zakres: wyrównanie produkcyjnych podstron 3a do decyzji z PR #31
(matcha z 1a: #53671B / #D8E78A). Pakiety 1–7 etapu 4a są w main.

Tokeny `accent`, `accent-on-primary` i `accent-on-light` w
`design-system/tokens.json`. Secondary button: białe wnętrze
(`--ao-background`), obwódka i etykieta matcha. Primary CTA, wordmark,
hero i tło portretu bez zmian. Dekoracje zostają SVG.

Detale grafik: punkt na orbicie produktu, punkt na półce butelek,
jedna linia/kreska na jasnych okładkach, iskierka na okładkach cherry.
Checkmarki, glify share/mail, TextLink i tła paneli bez matchy.

Draft PR **#36**, head po weryfikacji `01faf31`, dokumentacja wyników w
kolejnym commicie. Kontrole (Node 24.21.0):

- `npm run verify` **PASS**: format, tokeny, lint, `astro check`, **115**
  unit, build, workspaces, `check-build`, **138** E2E Chromium/Firefox/WebKit
  (w tym 6 przypadków `matcha-accent-3a.spec.ts` × 3 przeglądarki).
- CSS gzip `dist/_astro`: **29 758 B** / 32 768 B; JS gzip **5 770 B**.
- Kontrast WCAG AA (obliczony z `tokens.mjs`): accent na bieli **6,32**;
  accent dark na `#291a21` **12,43**; `#D8E78A` na wiśni primary **6,17**;
  accent-on-light na okładce **5,87**.
- Playwright computed style secondary: tło `rgb(255, 255, 255)`, tekst i
  obwódka `rgb(83, 103, 27)` (#53671B). Dark: tło `rgb(41, 26, 33)`,
  tekst i obwódka `rgb(216, 231, 138)` (#D8E78A). Primary i
  `StageBackdrop` bez zmian (`#882F48` / `#F2DCE3`).
- verify-ola: `ola-1791446513`, baza `http://127.0.0.1:4340`.
  `browser posts` = `[]` z JS, bez JS i po udanym newsletterze
  demonstracyjnym. Drugi start `ola-matcha-closeups` (bez przebudowy
  `dist/`) do zbliżeń i dociągnięcia leniwych zdjęć.

Zbliżenia vs plansza 05: secondary ma białe wnętrze i obwódkę matcha;
orbita ma jeden punkt; jasna okładka — kreskę „Dawka”; cherry — iskierkę;
półka butelek — punkt na linii. Pierwszy full-page konsultacji EN uciął
portret w „60 minutes” (lazy `img`); recapture ze scrollem
(`after-consultation-en-desktop-loaded.png`) pokazuje oba portrety.
Kod `Consultation3a` nie był ruszany.

Strony bez Button secondary (About, konsultacje, landing ebooka, blog)
nie dostały zielonych CTA. Drugie CTA zostają TextLink w ink, zgodnie z
makietami. Katalog dostał dwa swatche tokenów — jedyna zmiana układu
(rząd palety). Zdjęcia i kadry bez zmian.

Niewykonane: natywny zoom, czytnik, urządzenie fizyczne, 320 px i 200%
jako osobne zrzuty 1:1 tej sesji (są w E2E katalogu). Dark orbit/butelki
zostają na `#53671B` (okładki nie inwertują; otwarte pytanie).

Następny krok: odbiór wizualny PR #36. Nie mergować bez zgody.

### Sesja pakietu 7 — Article3a — 08.10.2026

Zakres: produkcyjna strona artykułu w designie 3a według
`mockups/homepage/article-3a.html`. Trasy `/blog/[slug]/` i
`/en/blog/[slug]/` oraz preview używają `ArticlePage` → `SiteShell3a` +
`Article3a`. Linki z `BlogCollection3a` prowadzą na ten szablon.

Zrobione w kodzie: `relatedEbooks` (0 albo 3), `faq`, `breadcrumbTitle`,
`proposalNote`, GROQ `articleDetailProjection`, mapper `Article3aView`,
Portable Text z TOC H2 (`#punkt-wyjscia`, fallback na slug/`_key`), tabela
`th scope=row`, fixture wyróżnionego wpisu, trzy e-booki, FAQ, rekomendacje
02/03, wspólny `DemoForm`, stopka 3a. Korekta dolnej połowy 08.10.2026:
pre-crop okładki nutrition 1536×620 (`left bottom`, eager), `ao-section` i
separatory jak w `article-3a.css`, meta kart `space-between`, FAQ
`line-height: 1.12`, pełny biogram makiety w `author.bio`, byline 96×120
żeby CSS `50% 25%` kroiło koło. Źródła: pusta tablica ukrywa sekcję.

Kontrole (Node 24.21.0), draft PR **#34**, head `333af77`:

- `npm run verify` **PASS** na `59d80c0`: format, tokeny, lint, `astro check`,
  **114** unit, build, workspaces, `check-build`, **120** E2E Chromium/Firefox/WebKit.
  Każdy `img` w `main` artykułu ma `naturalWidth > 0` **bez** `scrollIntoView`
  (okładka nutrition włącznie).
- CSS gzip `dist/_astro`: **29 635 B** / 32 KiB; JS gzip **5 770 B**.
- Dry-run `import:article` kod 0; `--write` kod 2, bez zapisu Content Lake.
- verify-ola: `ola-1791443677`. `browser posts` = `[]` z JS i bez. Baza
  `http://127.0.0.1:4340`. Zdjęcie trzeciej okładki: `naturalWidth=1536`,
  `naturalHeight=620`, `complete=true`, `loading=eager` na pełnej stronie
  desktop i mobile **bez** dociągnięcia scrolla. Obejrzane full-page: pasek
  sałatki jest namalowany.

Inwentaryzacja zdjęć (makieta → produkcja, desktop 1280):

| Miejsce   | Makieta                                                            | Produkcja                                                               |
| --------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Byline    | `about.webp` 1122×1402 → CSS 48×48, `center 25%`, radius 50%       | SiteImage 96×120 (portret), CSS 48×48 `50% 25%` — bez square-crop Sharp |
| Hero      | `food-editorial.webp` 1536×1024 → 1200×435, `50% 55%`, radius 24px | to samo                                                                 |
| Autor     | `about.webp` → 96×120, `50% 50%`, radius 16px                      | SiteImage 96×120, eager                                                 |
| Powiązane | brak miniatur                                                      | bez zdjęć                                                               |
| E-booki   | nutrition jako `background-image` 84px, `left bottom`              | `BookCoverArt` pre-crop 1536×620, eager, CSS 84px, bez `object-fit`     |
| Źródła    | brak sekcji                                                        | renderer jest; pusta tablica ukrywa sekcję                              |

Artefakty:

- `/opt/cursor/artifacts/screenshots/compare-article-desktop.png`
- `/opt/cursor/artifacts/screenshots/compare-article-mobile.png`
- `/opt/cursor/artifacts/screenshots/compare-article-nojs.png`
- `/opt/cursor/artifacts/screenshots/article-en-desktop.png`
- `/opt/cursor/artifacts/screenshots/compare-close-author.png`
- `/opt/cursor/artifacts/screenshots/compare-close-toc.png`
- `/opt/cursor/artifacts/screenshots/compare-close-faq.png`
- `/opt/cursor/artifacts/screenshots/compare-close-ebook.png`
- `/opt/cursor/artifacts/screenshots/compare-close-related.png`
- `/opt/cursor/artifacts/screenshots/compare-close-hero.png`
- `/opt/cursor/artifacts/screenshots/compare-close-byline.png`
- `/opt/cursor/artifacts/screenshots/compare-close-sections-spacing.png`
- Dowody verify-ola: `/tmp/ola-verify-evidence/ola-1791443677/`.

Porównane zbliżenia z makietą. Pozostałe różnice (lista nie jest pusta):

- `English` / `Polski` w nagłówku — wspólny `SiteShell3a`.
- Księżyc motywu obok strzałki w stopce — zlecone wcześniej (motyw zostaje).
- Newsletter: zgoda demonstracyjna `DemoForm` (wspólna 3a).
- TOC i rekomendacje łamią linie ciaśniej (węższa kolumna `.ao-container`).
- Okładki e-booków idą przez wspólny `CoverStage`/`BookCover`; makieta rysuje
  je inline. Karta „Szczupła…” ma `<img>` pre-crop, makieta `background-image`.
- Źródła: brak w makiecie i w fixture; renderer czeka na dane.
- Karty i CTA prowadzą do `blog/[slug]` / `ebooki/…`, nie `podglad.html`.
- EN: brak makiety EN; ten sam układ, kadry i Shell 3a.
- Bez JS: share disabled, rekomendacje widoczne, zdjęcia eager w HTML.

Natywny zoom, czytnik i urządzenie fizyczne **nie sprawdzone**. 320 px i
200% zoom artykułu — niewykonane jako osobne zrzuty 1:1 (są w E2E `ui.spec`
dla katalogu, nie tej strony).

Następny krok: odbiór PR #34. Content Lake i zapis szkiców poza zakresem.

### Sesja poprawek wizualnych BlogCollection3a — 08.10.2026

Zasada Grzesia: nic nie wypada i nic się nie upraszcza. Odbiór
`compare-blog-p1-desktop.png` / `compare-blog-p2-desktop.png` odrzucił pustą
listę różnic. Poprawki na tym samym branchu `cursor/blog-collection-3a-1697`.

Różnica → poprawka:

1. Karta „Wyniki badań” (seed `04`, `imageKey: "about"`, `frame: "portrait"`) —
   pusty różowy prostokąt. Diagnoza zbudowanego `/blog/`: `<img>` istnieje,
   `src="/_astro/about.*.webp"`, plik w `dist/` (najpierw VP8 1122×1402). Computed
   jak u działającej „Insulinooporność” (`contact`, też portrait): `opacity: 1`,
   `visibility: visible`, `height: 322.22px`, `object-position: 50% 15%`,
   `object-fit: cover`. Różnica: `about` miał atrybuty HTML 1122×1402 (portret),
   `contact` 1536×1024 (pejzaż). Chromium nie maluje `cover` + `50% 15%` na
   intrynsecznym portrecie poza viewportem — widać tło `--ao-surface`. Sąsiedni
   `food` i CSS 1:1 z makietą tego nie naprawiają na zrzucie `fullPage`.
   Poprawka: miniatura dostaje kadr 1.8 **w pliku** (`blogCardThumbSize`, Sharp
   `fit=cover`, gravity z hotspota → `about` 1122×623, `decoding="sync"`).
   CSS ramki zostaje jak `.post-image img`. E2E: każda miniatura na `/blog/` i
   `/blog/strona/2/` ma `img`, `naturalWidth > 0`, widoczny box; karta badań ma
   pejzażowy plik i kontrast pikseli także ze zrzutu `fullPage` bez
   `scrollIntoView`. Wycinek z `compare-blog-p1-desktop.png` po poprawce pokazuje
   twarz, nie różowy prostokąt.
2. Kanciaste rogi miniatur i zdjęcia wyróżnionego wpisu. Makieta używa
   `--media-radius` = `--ao-radius-panel` (24px). Produkcja ustawiała
   nieistniejące `--ao-radius-media` (computed 0). Poprawka: `--ao-radius-panel`,
   `overflow: hidden`, `isolation: isolate`.
3. Miniatury wyższe niż w makiecie. `.ao-site img { height: auto }` plus atrybuty
   HTML portretu 1122×1402 wypierały `aspect-ratio: 1.8` na samym `img`. Poprawka:
   ten sam układ co makieta (`.post-image img`: `width: 100%`, `height: auto`,
   `aspect-ratio: 1.8`, `object-fit: cover`) oraz pejzażowe atrybuty HTML 1.8.
4. Wyróżniony wpis wyglądał na pas wychodzący do prawej, bez zaokrągleń. Układ
   siatki `1.08fr 1fr` i padding 44px już były; brakujący radius sprawiał wrażenie
   pełnej szerokości. Poprawka: karta w kontenerze, `border-radius: 24px`,
   `align-items: stretch`, lewa kolumna `display: grid` wypełnia wysokość zdjęciem.
5. Stopka, prawy dolny róg: makieta ma strzałkę up-right (klasa `theme-toggle`),
   produkcja miała tylko księżyc motywu. Przycisk motywu zostaje; dodany link
   `#main` z `ArrowIcon` (ścieżka `M7 17 17 7M7 7h10v10`) we wspólnym
   `SiteFooter` 3a — na wszystkich stronach 3a.
6. Mobile, kategoria PMOS (PCOS) i EN: te same radius, kadr 1.8 i strzałka w stopce.

Świadome różnice (nie ucięcie): filtry kategorii (zlecone, makieta ich nie ma);
`aria-label` „Przeczytaj artykuł: …”; English/Polski; zgoda newslettera; przycisk
motywu obok strzałki; karty prowadzą do `blog/[slug]`, nie `podglad.html`.

Kontrole (Node 24.21.0):

- `npm run verify` **PASS**: 110 unit, 102 E2E (Chromium/Firefox/WebKit), w tym
  `blog-collection-3a.spec.ts` (src `about.*.webp`, HTML 1122×623 pejzaż,
  `naturalWidth > naturalHeight`, opacity/visibility jak u `contact`, radius 24px,
  stosunek 1.8, ramka = box obrazka, luma `fullPage`, każda miniatura na stronie
  1 i 2, `#main` w stopce).
- CSS gzip `dist/_astro`: **26 274 B** / 32 KiB; JS gzip 5 770 B.
- verify-ola `VERIFY_RUN_ID=ola-1791429898`, baza `http://127.0.0.1:4340`,
  `browser posts` = `[]` (z JS i bez). Dist z `npm run verify`, bez przebudowy
  w trakcie sesji. Dowody: `/tmp/ola-verify-evidence/ola-1791429898/`.
- Porównania nadpisane w `/opt/cursor/artifacts/screenshots/` pod tymi samymi
  nazwami. Wycinek karty „Wyniki badań” z `compare-blog-p1-desktop.png`
  obejrzany: twarz, kadr 1.8, radius 24px, nie tło `--ao-surface`.

Zmierzony kadr desktop 1280: ramka karty 580×322,22 (1.8) makieta i produkcja;
wyróżniony 1200×~416, radius 24px, w kontenerze. Miniatura „Wyniki badań”
`naturalWidth` 1122 × `naturalHeight` 623 (`about.BuXypYA__Z7qD5w.webp`).
Mobile 390: featured 1.4, karty 1.8.

Pozostałe różnice po porównaniu pikselowym (lista nie jest pusta):

- Filtry kategorii pod leadem — zlecone w pakiecie; makieta ich nie ma. Przez to
  wyróżniony wpis jest ~1 px wyższy, a CTA „Przeczytaj artykuł” łamie się na
  dwie linie.
- `English` / `Polski` w nagłówku — wspólny `SiteShell3a`.
- Księżyc motywu obok strzałki powrotu — zlecone (motyw zostaje).
- Newsletter: zgoda demonstracyjna `DemoForm` (wspólna 3a).
- Mobile: szerokość treści 342 vs 350 px (gutter `.ao-container`, nie makietowy
  `.container`).
- Kategoria PMOS (PCOS): brak makiety kategorii; najnowszy wpis kategorii jest
  wyróżniony jak na indeksie.
- EN: brak makiety EN; ten sam układ, zaokrąglenia, kadr i strzałka.
- Bez JS: motyw ukryty, strzałka widoczna, zdjęcia eager nadal w HTML.
- `aria-label` „Przeczytaj artykuł: …”; karty prowadzą do `blog/[slug]`.

Natywny zoom, czytnik i urządzenie fizyczne **nie sprawdzone**.

Następny krok: pakiet 7 Article3a, o ile odbiór tej poprawki przejdzie.

### Sesja pakietu 6 — kolekcja bloga 3a — 08.10.2026

Zakres: `BlogCollection3a` na `/blog/` i `/en/blog/` według makiet
`blog-3a.html` i `blog-3a-page-2.html`. Istniejące `article` i `category`;
najnowszy wpis tylko na stronie 1, siatka dwóch kolumn, paginacja
`/blog/strona/2/` i `/en/blog/page/2/`, sortowanie `publishedAt desc, _id asc`.
Pełny newsletter `DemoForm` pod paginacją. Breadcrumb i filtry kategorii
(Wszystkie + 5 kategorii; pusta `perimenopauza`). Copy, 11 wpisów i daty
z makiety są **propozycją**. Trasy `blog/[slug]` zostają przy `ArticleView`.

Kod: `siteSettings.blogIndex` / `blogNewsletter`, GROQ (hotspot, kolejność,
projekcja kategorii), TypeGen, mappery, serializer Markdown z przykładem,
fixture 11×2 artykułów i 5×2 kategorii, dry-run importu
(`npm run import:blog-collection`, `--write` kończy się kodem 2). Zdjęcia
makiety przez `SiteImage` + `astro:assets` (`food`, `about`, `contact`)
z kadrami hotspot. Dekoracje paginacji to SVG `ArrowIcon` (chevron-left/right).
Akcentów matcha z PR #31 nie wdrażano.

Kontrole tej sesji (Node 24.21.0):

- `npm run verify` **PASS**: 109 unit, 96 E2E (Chromium/Firefox/WebKit).
- CSS gzip `dist/_astro`: **26 231 B** (limit tymczasowy 32 KiB); JS gzip
  5 770 B. Designu nie wycinano pod budżet.
- Dry-run importu: 34 dokumenty, `--write` kod 2, bez zapisu.
- Playwright: `npx playwright install chromium firefox webkit` oraz
  `install-deps` **nie zawisły**.
- verify-ola (`VERIFY_RUN_ID=ola-1791426038`, baza `http://127.0.0.1:4340`):
  `/blog/` 200, strona 2, kategoria PMOS (PCOS), pusta perimenopauza, `/en/blog/`
  bez polskiego H1, bez JS. `browser posts` = `[]`. Dowody:
  `/tmp/ola-verify-evidence/ola-1791426038/`.
- Porównania obok makiety: `/opt/cursor/artifacts/screenshots/`
  (`compare-blog-p1-desktop.png`, `compare-blog-p1-mobile.png`,
  `compare-blog-p2-desktop.png`, `compare-blog-p2-mobile.png`,
  `compare-blog-category-desktop.png`, `blog-en-desktop.png`,
  `blog-p1-nojs.png`, `blog-empty.png`).
- Natywny zoom przeglądarki, czytnik i urządzenie fizyczne **nie
  sprawdzone**.

Tabela zdjęć z makiety:

| Zdjęcie z makiety                         | Plik na produkcji                                       | Sekcja                                                                                            | Status                   |
| ----------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| `assets/food-editorial.webp`              | `src/assets/editorial/food-editorial.webp` klucz `food` | wyróżniony wpis; karty posiłków, suplementów, dzienniczka, zakupów                                | na miejscu, ten sam kadr |
| `../../src/assets/portraits/contact.webp` | `src/assets/portraits/contact.webp` klucz `contact`     | pytania o PMOS (PCOS), insulinooporność, sprzeczne rady (`portrait` / `portrait-close`, 15% góry) | na miejscu, ten sam kadr |
| `../../src/assets/portraits/about.webp`   | `src/assets/portraits/about.webp` klucz `about`         | wyniki badań, cel konsultacji (`portrait`, 15% góry)                                              | na miejscu, ten sam kadr |

Brakujących plików nie było; placeholderów nie podstawiano.

Świadome różnice względem makiety (nie ucięcie kolekcji):

- Filtry kategorii pod leadem — zlecone w pakiecie, makieta ich nie ma.
- `aria-label` obrazka/karty używa etykiety CMS „Przeczytaj artykuł: …”, makieta ma krótsze „Przeczytaj: …”.
- Shell: English/Polski, demonstracyjna zgoda newslettera, ikona motywu — wspólny `SiteShell3a`.
- Linki kart prowadzą do `blog/[slug]` (ArticleView), nie do `podglad.html`.

Następny krok: pakiet 7 Article3a. Dane indeksu w Content Lake i odbiór
Studio/preview pozostają otwarte. Copy indeksu do zatwierdzenia.

### Sesja poprawek makiety kolekcji — 07.10.2026

Zakres: nic nie wypada względem `ebooks-3a.html` (zasada Grzesia). Poprawki
na tym samym branchu co pakiet 5.

Wykonane:

1. Tony okładek 4–6 w `EBOOK_SEED`: „Waga Cię okłamuje” i „Noc zaczyna się o
   osiemnastej” jasne, „Czy to już?” wiśniowa. Ten sam seed zasila homepage,
   kolekcję i landing.
2. Cena kart: „97 zł” + mniejsze „brutto” w nowej linii (`PriceGross` /
   `.ao-price small { display: block }`), także na homepage.
3. Newsletter 3a (`DemoForm` wszędzie tam, gdzie 3a go używa): etykieta
   „Twój adres e-mail”, placeholder `np. ola@przyklad.pl`, zaokrąglone pole
   (`--ao-radius-panel`), rząd e-mail + przycisk ze strzałką, checkbox po
   przycisku.
4. Stopka wspólna: Instagram / Facebook / TikTok ze strzałkami oraz Polityka
   prywatności / Regulamin. Pola `siteSettings` już istniały; uzupełniono
   fixture i fallback przy pustych tablicach.
5. Nagłówek newslettera w seedzie homepage ma łamanie wiersza jak w makiecie.

Kontrole (Node 24.21.0): `npm run verify` **PASS** — 96 unit, 96 E2E
(Chromium/Firefox/WebKit). CSS gzip `dist/_astro`: **24 706 B** (limit
tymczasowy 32 KiB); JS gzip 5 770 B.

verify-ola (`VERIFY_RUN_ID=ola-1791410509`, baza `http://127.0.0.1:4340`):
`GET /` 200, `/en/ebooki/` 404, `browser posts` = `[]`. Zrzuty i porównania
obok makiety: `/opt/cursor/artifacts/screenshots/`
(`compare-collection-pl-desktop.png`, `compare-collection-pl-mobile.png`,
`compare-collection-en-desktop.png`, `compare-collection-pcos.png`,
`compare-collection-perimenopauza.png`, `collection-pl-nojs.png`,
`compare-home-desktop.png`). `collection-empty.png` zostaje z wcześniejszego
zrzutu pustej fixture; nie przebudowywano `dist/` w tej sesji.

Pozostałe różnice względem makiety (nie ucięcie kolekcji): „English” /
„Polski” w nagłówku (i18n), demonstracyjny tekst zgody zamiast copy z
linkiem do polityki w checkboxie, ikona przełącznika motywu. Copy zgody
zostaje demonstracyjne, żeby nie sugerować prawdziwej wysyłki.

Do decyzji (brak prawdziwych adresów):

- Profile: Instagram, Facebook, TikTok Oli. Fixture używa stron głównych
  platform, nie kont.
- Strony prawne: `/polityka-prywatnosci/`, `/regulamin/` (EN `/en/privacy/`,
  `/en/terms/`) — brak dokumentów i treści.

Następny krok: pakiet 6 BlogCollection3a (wykonany 08.10.2026).

### Sesja pakietu 5 — kolekcja e-booków 3a — 07.10.2026

Zakres: `EbookCollection3a` na `/ebooki/` i `/en/ebooks/` według makiety
`ebooks-3a.html`. Te same dokumenty `ebook` co homepage i landing (referencje,
bez drugiej tablicy produktów). Kategorie Wszystkie / PMOS (PCOS) / Perimenopauza
z licznikami, CSS `:has` bez JS, ścieżki `/ebooki/kategoria/{topic}/` oraz
query `?kategoria=` z JS. Pusta kolekcja ukrywa filtry; pusta kategoria ma
komunikat. Karty używają `ebookPath`; cena 97 zł brutto i status przygotowania
jak w makiecie. Newsletter to `DemoForm` bez POST. Copy i UX kolekcji są
**propozycją**.

Kod: schemat `ebookCollectionSection` (cherry3a), GROQ publiczny i preview,
TypeGen (19 kwerend, 67 typów schematu), mappery, serializer Markdown
z przykładem, fixture, dry-run importu (`npm run import:ebook-collection`,
`--write` kończy się kodem 2). Okładka „Szczupła, a jednak PMOS (PCOS)” używa
`SiteImage` + `astro:assets` (`food` → `src/assets/editorial/food-editorial.webp`);
pozostałe okładki to SVG w `src/design-system/decorations/` (`BookCoverArt`).
Wyrównanie akcentów matcha z PR #31 jest poza tym pakietem.

Kontrole tej sesji (Node 24.21.0):

- `npm run verify` PASS: 95 unit, 96 E2E (Chromium/Firefox/WebKit).
- CSS gzip `dist/_astro`: **24 636 B** (limit tymczasowy 32 KiB); JS gzip
  5 770 B. Designu nie wycinano pod budżet.
- Dry-run importu: 2 dokumenty `page`, 0 duplikatów `ebook`, bez zapisu.
- verify-ola (`VERIFY_RUN_ID=ola-1791408926`, baza `http://127.0.0.1:4340`):
  PL/EN, Wszystkie / PMOS (PCOS) / Perimenopauza, ścieżka `/ebooki/kategoria/pcos/`,
  bez JS, desktop 1280 i mobile 390. `browser posts` = `[]`. `/en/ebooki/`
  → 404. Dowody: `/tmp/ola-verify-evidence/ola-1791408926/`.
- Porównanie z makietą: siatka, filtry, okładki, ceny 97 zł brutto i nota
  przygotowania 1:1 w `<main>`. Różnice shella (Blog i English w menu,
  DemoForm newslettera, stopka bez social z makiety) pochodzą ze wspólnego
  `SiteShell3a` z pakietów 1–4, nie z ucięcia kolekcji.
- Pusty stan kolekcji/kategorii: mapper + unit; fixture ma 6 e-booków, więc
  zrzut pustej siatki nie istnieje na tym `dist/`.
- Pięć kart poza Suplementami w PMOS (PCOS) ma prawdziwy `ebookPath`; landingi
  tych slugów jeszcze nie istnieją (404 do kolejnych prac).
- Playwright Chromium/Firefox/WebKit zainstalowano; `install-deps` nie
  zawisł. Natywny zoom przeglądarki, czytnik i urządzenie fizyczne **nie
  sprawdzone**.

Tabela zdjęć z makiety:

| Zdjęcie z makiety                                                     | Plik na produkcji                                                         | Sekcja                                                                 | Status                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| `assets/food-editorial.webp` (CSS `.art-nutrition`)                   | `src/assets/editorial/food-editorial.webp` przez `SiteImage` klucz `food` | okładka „Szczupła, a jednak PMOS (PCOS)” / Slim, and still PMOS (PCOS) | na miejscu, ten sam kadr                       |
| pozostałe 5 okładek (art-decisions/route/observation/journal/evening) | SVG `BookCoverArt` w `src/design-system/decorations/`                     | karty kolekcji                                                         | SVG, bez rastrów — zgodnie z makietą           |
| brak innych `<img>` w `ebooks-3a.html`                                | —                                                                         | —                                                                      | nic nie brakuje; placeholderów nie podstawiano |

Następny krok: pakiet 6 BlogCollection3a (wykonany 08.10.2026). Dane kolekcji
e-booków w Content Lake i odbiór Studio/preview pozostają otwarte. Copy i UX
kolekcji e-booków do zatwierdzenia.

### Sesja dodatkowego akcentu — 07.10.2026

Zakres PR wydzielono do osobnego checkoutu z aktualnego origin/main:
4 dokumenty, README propozycji i 5 plansz. Pozostałe lokalne zmiany
zachowano poza zakresem. Format, lokalne odnośniki oraz diff-check sprawdzono;
bez zmiany kodu aplikacji i bez publikacji.

Na zlecenie użytkownika przygotowano trzy rastrowe edycje wizualizacji katalogu
3a: oliwka, morela i błękit. [Wyniki i prompty](../output/design-system-3a/2026-10-07/accent-proposals/README.md)
zapisano w repo. Wszystkie obejrzano: zachowują biel i wiśnię jako bazę,
pokazują dodatkowy przycisk, podkreślenie i jasne tło portretu. Są propozycjami,
z drobnymi różnicami generowania; nie zmieniają aplikacji, tokenów ani CMS.
Oliwka została następnie odrzucona przez użytkownika (07.10.2026).
Na jego zlecenie przygotowano i obejrzano [wersję matcha](../output/design-system-3a/2026-10-07/accent-proposals/04-matcha.png):
akcent #A8C686, tekst #354A2B, jasne tło #EEF4E7. To propozycja do oceny,
bez zatwierdzenia odcienia, wdrożenia tokenów ani konfiguracji Sanity.

Kontrole tej sesji: przegląd czterech obrazów, format dokumentacji i lokalne
odnośniki. Nie uruchamiano verify ani odbioru interaktywnego UI, ponieważ
zmieniono tylko materiały koncepcyjne i dokumentację. Kontrole desktop/mobile,
320 px, klawiatury, zoomu 200% i reduced motion pozostają wymagane po wdrożeniu.
Następnie użytkownik wybrał matchę z 1a (#53671B / #D8E78A) i ograniczył ją
do subtelnych detali, m.in. białego secondary buttona z zieloną obwódką oraz
elementów grafik. Wykluczył tło hero. Przygotowano i obejrzano
[poprawioną planszę](../output/design-system-3a/2026-10-07/accent-proposals/05-matcha-1a-subtle.png)
z różowym tłem portretu; zapisano reguły w specyfikacji i konfiguracji CMS.
Wcześniejsza propozycja #A8C686 jest zastąpiona tą decyzją.
Kontrole aktualizacji: przegląd obrazu, format i odnośniki dokumentacji.
Kod, tokeny oraz Sanity nadal bez zmian, verify nie uruchamiano.
Następny krok: ustalić mapę drobnych akcentów w konkretnych sekcjach,
wdrożyć tokeny/komponenty i wykonać odbiór UI; etap pozostaje 4a.

Etapy 1–2 — fundament repo i infrastruktury — mają zapisany wcześniejszy odbiór.
Etapy 3–4 opisują wcześniejszy prototyp; design system 3a jest w `src/design-system`.
Bieżący etap to **4a — docelowe strony 3a i treści z mockupów w Sanity**.
**Pakiety 1–6 (Homepage3a, About3a, Consultation3a, Ebook3a, EbookCollection3a,
BlogCollection3a, wspólny shell) są w kodzie i fixture’ach; zapis do Content
Lake i publikacja nie były zlecone.**

Publiczne `/`, `/en/`, `/o-mnie/`, `/en/about/`, `/konsultacje/`,
`/en/consultations/`, `/ebooki/`, `/en/ebooks/`, `/ebooki/<slug>/`,
`/en/ebooks/<slug>/`, `/blog/` i `/en/blog/` oraz preview tych stron
renderują `SiteShell3a` z fixture’ów. Trasy artykułu i `/ui/` czekają
na pakiet 7 albo dalsze prace. Etapy 5–7 oraz pakiet 7 etapu 4a pozostają
otwarte.

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

- Nowa marka i PL/EN; fundament demonstracyjny wykonany. Dalsze prace obejmują
  migrację treści przygotowanych mockupów do Sanity (decyzja 07.10.2026).
- Astro SSG, Sanity, Cloudflare Workers Static Assets; osobny chroniony podgląd.
- Docelowy design system 3a i opracowane mockupy; Wonderful zarchiwizowany,
  pozostałe kierunki porzucone. Jedno źródło tokenów i komponentów.
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

## Skill weryfikacji publicznego serwisu — 2026-09-30

- Dodano `.cursor/skills/verify-ola/`: osobny podgląd Astro na porcie 4340–4390,
  sesja Chromium i mapa pięciu funkcji (formularz, język, dialog katalogu,
  artykuł, `/static/`). Studio, podgląd szkiców i Worker są poza skillem.
- Doctor czyta `/proc`, więc działa na Linuksie. Node według `.node-version`.
- Przebieg `ola-proof-3`: launch, doctor, formularz na `/` (pusty błąd imienia,
  zły e-mail, status „Dane poprawne. Nic nie wysłano.”, `posts` = `[]`),
  snapshot ARIA i zrzut. Po cleanup katalog
  `/tmp/ola-verify-evidence/ola-proof-3/` nadal zawiera te pliki.
- Nie przejechano pozostałych czterech funkcji mapy. Nie uruchamiano
  `npm run verify` dla tej zmiany dokumentacji i skryptu pomocniczego.

## Demonstracyjna treść Sanity — 2026-09-14

- Dataset `production`, projekt `dyuqkn8c`. Webhooki stron nie były odpalane:
  strony i artykuły pozostają szkicami. Opublikowano wyłącznie dokumenty
  wspierające (nie `_type == "page"`): `siteSettings-pl/en`, autorzy, kategorie,
  formularze, usługi, opinie, przekierowanie `/stara-strona/` → `/warsztat/`.
- Szkice stron: `home` PL/EN (stare opublikowane `home` bez sekcji nadal żywe),
  `warsztat`/`workshop`, `wdrozenie`/`implementation`, `tylko-pl`.
- Szkice artykułów (3× PL/EN): wyróżniony `najpierw-proces` /
  `process-before-crm` ma akapity, H2/H3, cytaty blockquote, listy, tabelę,
  dwie ryciny z podpisami, wyróżnienie, CTA oraz źródła (Kotter HBR i książka,
  Edmondson 1999 DOI i _The Fearless Organization_, Payne i Frow 2005 DOI).
- Trzy assety obrazów w CDN: hero warsztatu, tablica, schemat warstw.
  Podpięte do wyróżnionych wpisów, pozostałych kart bloga i mediów wdrożenia.
- Powiązania tłumaczeń i related na szkicach są referencjami słabymi (`_weak`),
  bo strony i artykuły nie są opublikowane. Handshake Presentation nie
  sprawdzono. Apex i staging nadal serwują stare opublikowane `home`.

## Hostowane Studio — 2026-09-14

Adres: `https://studio.aleksandraolesiewicz.com` (Worker
`ola-website-studio-production`, version `539c695d-37be-49e3-859b-0cebe9f58831`).
Build z `SANITY_STUDIO_PREVIEW_ORIGIN=https://preview.aleksandraolesiewicz.com`.
CORS z poświadczeniami dodany. Sanity `deploy --external` zarejestrował studio
`eotkhlsk0a6m8yibs02m17y8`. Sekret podglądu produkcji `SANITY_STUDIO_URL`
wskazuje hostowany panel. Kontrola: `/` i `/structure` 200 HTML; w przeglądarce
ekran logowania „Ola — treści” (Google, GitHub, e-mail). Access nie obejmuje
Studio — logowanie Sanity.

## Presentation i Cloudflare Access — 2026-09-14

Hostowane Studio ładuje `https://preview.aleksandraolesiewicz.com/api/draft-mode/enable`
w iframe. Access pokazywał w ramce „Authentication failed”:
`publickey-credentials-get` nie jest dozwolone w cross-origin iframe (MFA
passkey). Sanity nie ma obejścia Access jak dla Vercel.

Zmiana Access (API, bez usuwania ochrony): obie aplikacje Worker Access preview
mają `allow_iframe: true` i `same_site_cookie_attribute: none`. Polityka
`Allow administrator with MFA` nadal wymaga `grzesiek@zawlodzki.pl`.
Kod podglądu ustawia sesję i ciasteczko perspektywy `SameSite=None; Secure`
oraz `Content-Security-Policy: frame-ancestors` dla originu Studio.

Po zalogowaniu Access strona nadal zwracała 401 „Brak dostępu do podglądu.”:
middleware wymagał ciasteczka z `/api/draft-mode/enable`, którego zwykła
wizyta po Access nie ustawia. Middleware dodatkowo wpuszcza żądanie z
podpisem JWT Access (`CF-Access-Jwt-Assertion`, aud aplikacji, ISS zespołu,
klucze z `/cdn-cgi/access/certs`) i wtedy wystawia sesję aplikacji.
`npx vitest run tests/unit/access-jwt.test.ts tests/unit/preview-session.test.ts`:
7 testów PASS. `npm run check --workspace @ola/preview`: 0 błędów.
Wdrożono `ola-website-preview-production` version
`ca730a63-bc13-4e51-9688-add70d299705` (custom domain preview). Handshake
Presentation w Studio i pełne `npm run verify` nie uruchamiano.

## Typ `kid` w teście Access JWT — 2026-10-01

`npm run verify` na `e48a04c` (merge PR #11) kończył się w `astro check`.
`tests/unit/access-jwt.test.ts` zwracał `JsonWebKey` i dopisywał `kid`.
Typ DOM `JsonWebKey` w TypeScript nie ma `kid`, więc diagnostyka to
`ts(2353)` w linii 39. Ta sama diagnostyka jest na jobie Quality
pusha do `main` (`36771450577`) i na jobie Quality pull requesta
(`36771442997`).

`publicJwk` zwraca teraz `JsonWebKey & { kid: string }`.
`npm run check` ma 0 błędów. `npx vitest run tests/unit/access-jwt.test.ts`
ma 3 testy PASS. `npm run test:e2e` ma 33 PASS (Chromium, Firefox, WebKit).
Pierwszy lokalny `npm run verify` odpadł na WebKit z braku bibliotek
systemowych. Po `npx playwright install-deps webkit` sam `test:e2e` jest zielony.
Pełnego `npm run verify` po instalacji bibliotek nie powtarzano.

Skill `verify-ola`, przebieg `ola-1790839417`, port 4340, Node 24.21.0.
Doctor przeszedł. Formularz na `/` (puste imię, zły e-mail, status
„Dane poprawne. Nic nie wysłano.”, `posts` = `[]`). Język PL/EN, warsztat,
`/tylko-pl/` i 404 `/en/tylko-pl/`. Dialog katalogu otwiera się i zamyka
Escape oraz „Zamknij”. `/static/` przy wyłączonym JavaScript ma `scripts 0`.
Wejście w artykuł z `/blog/` nie doszło do skutku. Komenda
`click --role link --name "Najpierw proces, potem CRM" --exact` nie znajduje
linku. Dostępna nazwa na liście to
„Najpierw proces, potem CRM Narzędzie nie naprawi niejasnych decyzji.”
Po cleanup katalog `/tmp/ola-verify-evidence/ola-1790839417/` nadal istnieje.

## Wybrane fotografie — 2026-10-04

- Po przeglądzie obu profili Instagram przygotowano lokalnie dwie serie po
  dziewięć propozycji. W drugiej serii użyto czterech rzeczywistych referencji,
  w tym wskazanego uśmiechu z zębami i zrzutu klatki nagrania zawodowego.
  Skorygowano szerokość ramion, zróżnicowano mimikę i przygotowano hero bez tła.
- Użytkownik wybrał Hero A, O mnie C i Kontakt C z drugiej serii oraz zlecił PR
  i merge. Do repo dodano tylko trzy wybrane fotografie: źródłowe PNG,
  bezstratne WebP i mapowanie wariantów z opisami PL/EN.
  [Materiały i pochodzenie](../src/assets/portraits/README.md).
- Eksport zachowuje wszystkie widoczne piksele, wymiary oraz kanał alfa PNG.
  Hero i O mnie: 1122 × 1402 px; Kontakt: 1536 × 1024 px.
  Hero zachowuje 562466 całkowicie przezroczystych pikseli.
- Galeria propozycji, pozostałe warianty, źródłowe prywatne zdjęcia i klatki
  nie trafiły do PR. Zastane zmiany skilli i skills-lock.json zachowano w głównym
  katalogu. Gałąź przygotowano w osobnym worktree na aktualnym origin/main.
- npm run verify na Node 24.21.0: PASS. Format, tokeny, lint i typy bez błędów;
  57 testów jednostkowych, build 22 stron, buildy workspace’ów i 33 E2E
  (Chromium, Firefox, WebKit). Budżety: JS 4694 B gzip, CSS 11290 B gzip,
  /static/ bez skryptów. Nie dodawano testów kopiowania statycznych zasobów.
- Kontrola 23 lokalnych odnośników i git diff --check: PASS. Oryginały PNG
  zgodne bitowo z wybranymi propozycjami; WebP zachowuje widoczne piksele i alfa.
  Łączny rozmiar WebP to 4034692 B zamiast 6109798 B PNG (około 34% mniej).
- npm ci nie zmieniło zależności ani lockfile. Audyt istniejącego drzewa zgłosił
  23 podatności (1 low, 8 moderate, 14 high); nie naprawiano ich w PR z materiałami.
- Nie zmieniono rendererów ani treści Sanity. Dopasowanie kadrów do docelowego
  układu, podłączenie mediów w CMS i wizualne kontrole na finalnej stronie
  (desktop/mobile, 320 px, klawiatura, zoom 200%, reduced motion) pozostają otwarte.

## Trzy kierunki homepage — 2026-10-05

- Przygotowano [ekran porównania i trzy kompletne HTML](../mockups/homepage/README.md):
  Wonderful, botaniczny magazyn i wiśniową energię. Dwie alternatywy powstały
  zgodnie z poleceniem użytkownika z użyciem `design-taste-frontend`.
- Każda propozycja ma navbar, hero ze zdjęciem i dwoma CTA, pięć logotypów,
  przykładowe efekty, O mnie, sześć e-booków, konsultacje, opinie, opt-in i stopkę.
  Biblioteka pokazuje trzy całe e-booki na desktopie; karty i opinie przewijają
  się natywnie, przez przyciski i klawiaturę. Nie ma automatycznego przewijania.
- Przeczytano dwa wskazane dokumenty researchu PMOS (PCOS)/perimenopauza, z których
  wykorzystano sześć koncepcji. Research rekomenduje po jednej koncepcji w każdej
  grupie; umieszczenie sześciu nie oznacza gotowości produktów do sprzedaży.
  Kwota około 100 zł, okładki i skróty tytułów są robocze.
- Użyto istniejących, zaakceptowanych portretów i znaku marki. Dodano fotografię
  kulinarną przez wbudowany image_gen oraz jej WebP, a pięć logotypów pobrano
  z oficjalnych stron marek. Źródła zapisano w README mockupów.
- Liczba `500+`, efekty i opinie są jawnie oznaczonymi przykładami. Współprace
  wymagają finalnego potwierdzenia; profile społecznościowe i przyszłe podstrony
  mają lokalny ekran objaśniający. Nie dodano fikcyjnych kwalifikacji ani
  klinicznych obietnic efektu. Zgoda newslettera to tekst roboczy.
- Wariant Wonderful importuje istniejące tokeny. Alternatywne palety są tylko
  w odseparowanych CSS mockupów. Switzer jest głównym krojem UI; w botanicznych
  nagłówkach użyto systemowej Georgii. Nie zmieniono aplikacji ani Sanity.
- Formularz waliduje wyłącznie lokalnie i potwierdza, że nic nie wysłano.
  Bez JS pola i przycisk są wyłączone. Brak usług newslettera, POST, zapisu
  danych i analityki. Menu używa natywnego `details` z Escape i powrotem fokusu.
- Dodano sprawdzony serwer `node scripts/preview-homepage-mockups.mjs` na
  `127.0.0.1:8766`; dopuszcza tylko makiety i potrzebne publiczne zasoby.
  Nie udostępnia sekretów ani źródeł aplikacji. Otworzono porównanie w panelu Codex.
- Pierwszy `npm run verify` wykrył brak importu `URL` w nowym skrypcie;
  poprawiono import. Kolejny przebieg przeszedł do E2E, gdzie sandbox blokował
  port 4321. Pełny przebieg poza sandboxem oraz ponowna końcowa bramka na Node 24.21.0:
  PASS, 57 unit i 33 E2E. Build nadal ma 22 strony; mockupy nie są częścią Astro.
- Kontrola makiet wykryła przesunięcie snapu o 4 px po Home; dodano
  `scroll-padding-inline`. Zarezerwowano miejsce komunikatów walidacji, aby
  pojawienie się błędu przy blur nie przesuwało checkboxa podczas kliknięcia.
  Breakpointy kontenerowe pozwalają reagować także na CSS zoom 200%.
  Poprawiono dostępne nazwy okładek i przełącznika kierunków.
  Dodano zawijanie logotypów, minimalną szerokość zero dla dzieci gridów
  i awaryjne łamanie długich tekstów przy CSS zoom w Firefox. Menu i znak marki
  mieszczą się w jednym wierszu także przy 320 px. Escape działa
  na poziomie dokumentu także wtedy, gdy WebKit pomija linki menu przy Tab.
- Lighthouse dla trzech kierunków: Accessibility 100, Best Practices 100,
  Agentic Browsing 100. SEO 63; jedyny negatywny wynik dotyczy indeksowalności,
  celowo zablokowanej przez `noindex`. Audyt nie obejmował Performance.
- Sprawdzono odpowiedzi serwera: trzy mockupy 200, `.env`, `worker/.dev.vars`
  i źródło Sanity 404. Kontrola 38 lokalnych odnośników Markdown oraz zasobów
  i odnośników HTML: PASS. `git diff --check` dla własnych dokumentów: PASS.
  Pełny diff zgłasza zastany whitespace w skillu `sandbox-stable`; nie zmieniano go.
- Końcowe QA makiet: PASS dla 9 kombinacji (3 kierunki × Chromium, Firefox,
  WebKit). Sprawdzono 1440/390/320 px bez overflow, CSS zoom 200%, menu
  Enter/Escape i powrót fokusu, przewijanie e-booków i opinii, wymagany/poprawny
  e-mail, checkbox, brak POST, przełączanie jasny/ciemny i reduced motion.
  Bez JS w 320 px treść pozostaje widoczna, sześć e-booków jest w HTML,
  a formularz nie może wysłać danych. Brak błędów JS.
- Axe (WCAG 2 A/AA, 2.1 AA, 2.2 AA) w Chromium: zero naruszeń w trzech kierunkach
  dla widoków jasnego desktop, mobile i ciemnego. Obejmuje także widoczne błędy
  newslettera. Nie jest to pełny odbiór WCAG ani kontrola czytnikiem ekranu.
- Obejrzano desktop i mobile oraz zestawiono Wonderful z lokalną specyfikacją:
  lekki Switzer, neutralna paleta, ciemne rozdziały, pomarańczowy detal,
  geometria i rytm sekcji. Screenshoty oraz `qa-results.json` i
  `lighthouse-summary.json`: `output/homepage-mockups/2026-10-05/`.
- Nie wykonano natywnego zoomu przeglądarki, testu czytnikiem ekranu ani kontroli
  na fizycznym urządzeniu. Nie mierzono Lighthouse Performance ani CWV.
- Zachowano zastane zmiany lokalnych skilli, `skills-lock.json` i `output/`.
  Nie wykonano commita, pusha, wdrożenia ani zmian w CMS.

## Białe warianty i wordmarki — 2026-10-06

- Na polecenie użytkownika dodano [2a](../mockups/homepage/botanical-white.html)
  i [3a](../mockups/homepage/cherry-white.html). Jedyna różnica wizualna względem
  wersji bazowych to białe główne tło w jasnym podglądzie. Panele, okładki,
  układ, treści i zdjęcia są wspólne. Ciemny podgląd zachowuje pierwotne palety.
- W nagłówkach i stopkach wersji 2/2a jest nowy wordmark Georgia Regular/Italic,
  a w 3/3a zwarty, dwuliniowy Switzer 750 zapisany małymi literami. Propozycje
  używają krojów obecnych na tych stronach, są tekstowe, edytowalne i widoczne
  bez JS. Nazwę marki udostępnia `role="img"` z `aria-label`.
- Wonderful zachowuje znak Gambarino. Nie zmieniono produkcyjnych zasobów marki,
  fontów, aplikacji Astro, CMS ani tokenów Wonderful.
- Ekran porównania i dolny przełącznik obejmują pięć makiet; przełącznik mieści
  się przy 320 px. Powrót z lokalnego ekranu przyszłej podstrony zachowuje 2a/3a.
- `npm run verify` na Node 24.21.0: PASS, 57 unit i 33 E2E; build 22 stron.
  Własne pliki HTML/CSS/JS i dokumenty sprawdzono Prettierem. Kontrola lokalnych
  odnośników oraz zgodności treści par 2/2a i 3/3a: PASS.
- Lokalne QA: PASS dla 12 kombinacji (4 zmienione propozycje × Chromium,
  Firefox, WebKit). Sprawdzono tło, wordmarki w nagłówku i stopce, obrazy,
  1440/390/320 px bez overflow, brak nakładania logo i menu, CSS zoom 200%,
  Enter/Escape i powrót fokusu, jasny/ciemny podgląd z reduced motion,
  powrót z przyszłej podstrony oraz wordmarki i sześć e-booków bez JS.
- Axe w Chromium: zero naruszeń WCAG 2 A/AA, 2.1 AA i 2.2 AA w czterech
  propozycjach na mobile 320 px oraz na ciemnym desktopie (8 audytów).
  Ekran porównania sprawdzono przy 1440 i 320 px, Wonderful przy 320 px.
- Obejrzano nowe hero na desktopie oraz mobile, ekran porównania i ciemny
  wordmark. Dowody: `output/homepage-mockups/2026-10-06/qa-results.json`
  oraz screenshoty w tym samym katalogu.
- W tej sesji nie powtarzano Lighthouse ani kontroli sliderów/formularza makiet,
  których kod nie uległ zmianie. Nie wykonano natywnego zoomu, kontroli czytnikiem
  ekranu, na urządzeniu fizycznym ani pomiarów CWV. Nie wykonano publikacji.

## 1a: Wonderful z paletą 3a — 2026-10-06

- Dodano [wersję 1a](../mockups/homepage/wonderful-cherry.html): układ i lekki
  Switzer z Wonderful, białe tło, wiśniowy tekst/CTA i różowe powierzchnie z 3a.
  Czarne sekcje mają wiśniowe tła, a okładki korzystają z kolorów 3a.
- Zachowano obrysy logo Gambarino; maska istniejącego SVG pozwala dopasować jego
  kolor do palety bez zmiany fontu. Nadpisania są wyłącznie w lokalnym
  `wonderful-cherry.css`; aplikacja, CMS i produkcyjne tokeny bez zmian.
- Porównanie i przełączniki obejmują sześć makiet. Dopasowano szerokość pozycji
  przełącznika do 320 px i powrót z przyszłej podstrony do wersji 1a.
- QA w Chromium, Firefox i WebKit: PASS. Potwierdzono identyczne kolory główne
  jak w 3a oraz identyczne wysokości wszystkich sekcji jak w Wonderful na
  desktopie. Sprawdzono 1440/390/320 px, CSS zoom 200%, klawiaturę Enter/Escape
  i powrót fokusu, trzy całe e-booki, przewijanie, jasny/ciemny podgląd,
  reduced motion, powrót do 1a oraz logo i sześć e-booków bez JS.
- Wszystkie sześć przełączników i ekran porównania sprawdzono przy 320 px
  bez overflow. Brak błędów JS. Axe w Chromium: zero naruszeń WCAG 2 A/AA,
  2.1 AA i 2.2 AA na desktopie, przy 320 px i w ciemnym widoku (3 audyty).
- Obejrzano hero desktop, 320 px i pełną stronę. Dowody są w
  `output/homepage-mockups/2026-10-06/qa-1a.json` i plikach `wonderful-cherry-*`.
- Pierwsza bramka zatrzymała się na formatowaniu wcześniejszego raportu
  `qa-results.json`; sformatowano własny raport. Pierwszy dodatkowy proces QA
  przestał raportować postęp w Firefox; zakończono wyłącznie własne procesy
  testowe i powtórzono z ograniczonym oczekiwaniem. Drugi przebieg przeszedł
  we wszystkich trzech przeglądarkach bez zmiany kodu makiet.
- Końcowe `npm run verify` na Node 24.21.0: PASS, 57 unit i 33 E2E,
  build 22 stron. Format, lint, typy i budżety przeszły. Kontrola lokalnych
  odnośników HTML/Markdown, własnego diffu oraz identycznej treści `main`
  wersji 1/1a: PASS. Brak zmian w źródłach aplikacji i lockfile.
- Natywny zoom, czytnik ekranu, urządzenie fizyczne i Lighthouse/CWV pozostają
  niewykonane w tej sesji. Nie wykonano publikacji ani zmian zewnętrznych.

## Kontrastowy akcent w 1a — 2026-10-06

- Na polecenie użytkownika uzupełniono 1a o akcent z innej rodziny kolorów:
  matcha `#53671b` na jasnych powierzchniach i jasna zieleń `#d8e78a` na
  wiśniowych oraz w ciemnym podglądzie. Wiśniowe CTA i różowe powierzchnie
  pozostały; pozostałe makiety nie zmieniły palety.
- Akcent wyróżnia znaczniki nad sekcjami i na okładkach, `+` przy liczbie
  pacjentek, cytaty, strzałki linków i sliderów oraz drugie CTA hero.
  Miniatura 1a w porównaniu ma próbkę zieleni i aktualny opis palety.
- QA: PASS w Chromium, Firefox i WebKit dla 1440/390/320 px bez overflow,
  CSS zoom 200%, jasnego/ciemnego widoku, reduced motion i akcentu bez JS.
  Brak błędów JS. Axe w Chromium: zero naruszeń WCAG 2 A/AA, 2.1 AA i 2.2 AA
  w czterech widokach: 1440, 390, 320 i ciemnym desktopie.
- Końcowe `npm run verify` na Node 24.21.0: PASS, 57 unit, 33 E2E i build
  22 stron. Kontrola lokalnych odnośników i własnego diffu: PASS.
- Obejrzano hero na desktopie i 320 px oraz pełną stronę. Screenshoty `wonderful-cherry-matcha-*`
  i raport `qa-matcha.json` są w `output/homepage-mockups/2026-10-06/`.
- Nie zmieniono geometrii, treści ani logiki interakcji. W tej sesji nie
  powtarzano ręcznego QA formularza i sliderów; nie wykonano natywnego zoomu,
  kontroli czytnikiem ekranu, na fizycznym urządzeniu ani Lighthouse/CWV.

## Publiczne makiety do feedbacku — 2026-10-06

- Na wyraźne polecenie użytkownika opublikowano wszystkie sześć propozycji:
  [porównanie](https://design.aleksandraolesiewicz.com/),
  [wersja 1a](https://design.aleksandraolesiewicz.com/1a).
  To publiczny adres bez logowania, z `noindex`, bez CMS i obsługi danych.
- Utworzono osobny Worker `ola-homepage-mockups-feedback`, środowisko `feedback`,
  konfiguracja `mockups/wrangler.jsonc`, domena `design.aleksandraolesiewicz.com`.
  Wersja publikacji: `2799f0ba-d574-4a01-94ea-200a63a30b8a`.
  Odczyt API po wdrożeniu potwierdził nową domenę i zachowane przypisania
  apexu, Studio i podglądu CMS do ich dotychczasowych Workerów.
- `scripts/build-homepage-feedback.mjs` tworzy `build/homepage-feedback/`:
  30 publicznych plików oraz robots, nagłówki i przekierowania. Wrangler
  przesłał 31 zasobów; `_headers` i `_redirects` są konfiguracją obsługi zasobów.
  Paczka ma wyłącznie makiety i potrzebne media/font z licencją; odnośniki
  lokalne muszą wskazywać pliki z listy publicznej. Brak dokumentacji,
  researchu, sekretów, źródeł Astro/Sanity i oryginałów portretów.
- Przeczytano aktualne oficjalne zasady Static Assets, Custom Domains,
  nagłówków, przekierowań i uprawnień. Użyto istniejącego Wrangler 4.131.1,
  Node 24.21.0 i istniejącego OAuth konta właściciela. Wartości tokenów nie
  trafiły do poleceń, paczki ani wyników. Nie zmieniano zależności/lockfile.
- `node scripts/build-homepage-feedback.mjs`, dry-run z konfiguracją makiet
  i `--env feedback`: PASS. `npm run verify`: PASS, 57 unit, 33 E2E,
  build 22 stron Astro; makiety pozostają osobnym artefaktem statycznym.
- Lokalny runtime odrzucił nową datę kompatybilności 2026-10-06; kontrolę
  lokalną uruchomiono z CLI `--compatibility-date 2026-09-18`, najnowszą
  datą obsługiwaną przez zainstalowany workerd. Konfiguracja zdalna zachowała
  datę 2026-10-06 i została poprawnie wdrożona bez aktualizacji bibliotek.
- Lokalnie i publicznie: PASS dla sześciu makiet, obrazów, fontu, 320 px,
  slidera e-booków, formularza potwierdzającego brak wysłania, powrotu do 1a
  i porównania sześciu kierunków. Brak błędów JS/CSP, uszkodzonych żądań
  zasobów i żądań innych niż GET. Root i `/1a`: 302; robots: 200.
  Potwierdzono `X-Robots-Tag` i CSP blokującą zewnętrzne połączenia i formularze.
- Publiczne `/.env`, `/worker/.dev.vars`, źródło Sanity, `logo.ts` i README
  makiet: 404. Dostęp do strony jest publiczny; noindex nie jest kontrolą dostępu.
- DNS Cloudflare i Google potwierdziły rekordy nowej subdomeny. Lokalny
  resolver systemowy nadal zwracał ENOTFOUND z wcześniejszego cache.
  Publiczny smoke użył aktualnego adresu z publicznego DNS, zachowując hostname,
  SNI i pełną weryfikację certyfikatu HTTPS. Logi kontroli są lokalnie:
  `/private/tmp/ola-feedback-local.log`, `/private/tmp/ola-feedback-public.log`.
  Zwykłe połączenie przez lokalny cache DNS wymaga odświeżenia rekordu w resolverze.
- Nie wykonano pusha, commita, publikacji treści CMS ani zmian obecnej aplikacji.
  Nie dodano zbierania feedbacku/PII przez formularz. Opinie zbiera użytkownik
  swoimi kanałami po udostępnieniu linków. Natywny zoom, czytnik ekranu,
  fizyczne urządzenie i nowe pomiary Lighthouse/CWV nie były częścią tej sesji.

## Przegląd Impeccable przed poprawkami — 2026-10-06

- Użytkownik zlecił ocenę AI slopu przed zmianami i jawnie zatwierdził dwóch
  subagentów. A wykonał niezależny przegląd wizualny, B detektor i kontrolę
  przeglądarki. Wyniki B trafiły do syntezy dopiero po ukończeniu A.
- [Raport sześciu makiet](HOMEPAGE-DESIGN-REVIEW.md): 24/32 wspólnych heurystyk,
  bez P0; jeden priorytet P1 i cztery P2. Propozycje wymagają odpowiedzi
  użytkownika, nie zostały zaimplementowane.
- Detektor uruchomiono dokładnie raz: exit 2, 196 sygnałów, z czego 190
  w sześciu makietach. Zweryfikowano fałszywe klasyfikacje okładek,
  przełącznika feedbacku i zewnętrznych sekcji z wewnętrznym kontenerem.
  Rzeczywiste małe przypisy i tracking zapisano do decyzji, bez mechanicznej
  zmiany przypiętej typografii.
- A obejrzał sześć desktopów 1440 px i sześć mobile 390 px; B sześć desktopów
  1988 px i sześć mobile 320 px. B: brak poziomego overflow dokumentu,
  uszkodzonych zakończonych obrazów i końcowych warning/error na publicznym /1a.
- Publiczne strzałki to U+2197/U+2190/U+2192 bez variation selectors. CDP
  potwierdził Hiragino Sans W3 dla CTA i ArialMT dla slidera. Apple Color Emoji
  nie odtworzono. Proponowane SVG uniezależni wygląd od fontów platformy.
- Lokalny overlay detektora wykonano na trzech rodzinach; widoczność
  potwierdzono na Wonderful/Cherry, Botanical tylko w logu. Publiczny CSP
  blokował inline preflight. Overlay usunięto nawigacją, własne serwery
  zatrzymano. A usunął tymczasowe zrzuty; dowody B pozostały poza publiczną
  paczką w `/tmp/ola-assessment-b`.
- Zapisano snapshot `.impeccable/critique/` dla `wonderful-cherry.html`;
  pierwszy wynik 24/32, bez wcześniejszego trendu. Snapshot ma fingerprint 1a,
  raport opisuje cały zakres sześciu makiet.
- Dokumentację sformatowano i sprawdzono nowe lokalne odnośniki. Nie zmieniono
  HTML/CSS/JS, nie publikowano, nie uruchamiano ponownie `npm run verify`
  (zmiany wyłącznie dokumentacyjne). Nie powtarzano pełnej klawiatury,
  natywnego zoomu, reduced motion, Safari/VoiceOver ani Lighthouse/CWV.

## Wdrożenie poprawek Impeccable — 2026-10-06

- Użytkownik zlecił wdrożenie poprawek i aktualizację subdomeny. Przyjęto cały
  pakiet oraz dwa wejścia PMOS (PCOS) / Perimenopauza, z zachowaniem trzech kart desktop.
  Zastosowano Impeccable polish i istniejącą konfigurację Wrangler feedback.
- Zastąpiono strzałki i ikonę motywu geometrycznymi SVG, zachowując kierunki,
  `currentColor` i dostępne nazwy. Dotyczy sześciu makiet, porównania i podglądu.
- Wejścia do grup biblioteki przewijają do pierwszej karty grupy, aktualizują
  `aria-current` podczas przewijania i działają jako kotwice bez JS.
- Doprecyzowano hero, nagłówki i O mnie na podstawie briefu i koncepcji e-booków.
  Nie wymyślano kwalifikacji ani wyników. Oznaczenia roboczych liczb/opinii/cen
  zachowano. Potwierdzenie faktów do produkcji nadal wymaga materiałów Oli.
- Pięć okładek otrzymało znaczące diagramy/narzędzia, fotografia posiłku pozostała
  na materiale o odżywianiu. To propozycje okładek, nie gotowe strony e-booków.
  W 03/3a otwarto sekcje marek i opinii; fonty, palety, portrety i układy rodzin
  zachowano. Przypisy powiększono do 13 px. Nadtytuły i numery efektów usunięto.
  Mobilny przełącznik wersji umieszczono po stopce, bez zasłaniania produktów.
- `npm run verify`: PASS, 57 unit, 33 E2E i build 22 stron. Pierwszy przebieg
  sandbox zatrzymał się na EPERM portu 4321; pełny przebieg poza ograniczeniem
  portów przeszedł. Nie pomijano czerwonych kontroli ani nie zmieniano zależności.
- Osobna kontrola makiet: PASS w Chromium/Firefox/WebKit dla sześciu wersji,
  320/390/768/1440 px, wybór grup klawiaturą, Home/End, Escape, reduced motion,
  brak JS i brak uszkodzonych obrazów/błędów JS. Axe w Chromium: brak naruszeń
  dla sześciu stron w jasnym i ciemnym motywie. Zrzuty przeglądu w
  `/private/tmp/ola-refinement-qa` obejrzano dla trzech rodzin.
- Zrzut pełnej strony/sekcji zmieniał pozycję karuzeli podczas wykonywania
  screenshotu; dodatkowe potwierdzenie świeżych mobile po załadowaniu fontów
  wykazało prawidłowy, stabilny stan `4 z 6` w trzech silnikach i sześciu makietach.
  Zrzut zwykłego viewportu potwierdził grupę perimenopauzy. Brak potrzeby
  korekty działającego przewijania na podstawie artefaktu screenshotu.
- Detektor uruchomiono raz po poprawkach: exit 2, 150 sygnałów zamiast 196.
  Brak tiny-text; brak nadtytułów sześciu homepage (jeden na ekranie podglądu).
  Pozostały głównie okładki, kontenery, świadomy tracking i przełącznik makiet;
  nie usuwano ich mechanicznie. Nie wyznaczano nowego wyniku heurystycznego.
  Snapshot oceny zachowano jako historyczny; potwierdzone kwalifikacje i fakty
  nie są jeszcze dostarczone, więc nie zamknięto całego backlogu treści.
- Paczka publiczna: 30 plików + robots, nagłówki i przekierowania; dry-run PASS.
  Wrangler 4.131.1 i OAuth właściciela konta, bez odczytu wartości sekretów.
  Wdrożono 11 zmienionych zasobów na `ola-homepage-mockups-feedback`,
  wersja `b16cbbc0-3ad6-4d68-b558-857ec4e75ca2`. Domena:
  `design.aleksandraolesiewicz.com`. Nie zmieniano domen aplikacji ani CMS.
- Publiczne HTTPS: PASS dla sześciu stron, nowych SVG/treści/grup, mobile grupy
  w 1a, braku overflow przy CSS zoom 200%, zasobów, nagłówków, slidera,
  demonstracji formularza i powrotu do 1a. Root i /1a: 302; prywatne ścieżki
  nadal 404. Smoke bez mapowania DNS przeszedł. Logi w
  `/private/tmp/ola-refinement-public.log` i `ola-refinement-public-new.log`.
- Dokumentację sformatowano i nowe lokalne odnośniki sprawdzono. Bez commita,
  pusha i publikacji CMS. Natywny zoom 200%, czytnik, fizyczne urządzenie
  i Lighthouse/CWV nie były wykonywane; automatyczne kontrole nie oznaczają AA.

## PR makiet homepage — 2026-10-06

- Na zlecenie użytkownika utworzono
  [PR #17](https://github.com/zawlodzki/nowa-strona-ola/pull/17), baza `main`,
  gałąź `codex/homepage-design-mockups`. Commit implementacji: `4ecaa05`.
- PR obejmuje 31 plików: sześć makiet i publiczne media, CSS/JS, skrypty
  lokalnego podglądu i paczki feedbacku, konfigurację Workera oraz dokumentację.
  Lokalne dowody `output/`, archiwum `.impeccable/`, zmiany `.agents` i
  `skills-lock.json` pozostały poza commitem. Nie modyfikowano tych zmian.
- Zachowano wyniki wcześniejszej pełnej weryfikacji i publicznego smoke;
  w tej sesji bez zmian kodu ponownie sprawdzono format zakresu PR i
  `git diff --cached --check`: PASS. Nie powtarzano testów bez potrzeby.
- Agent podpisujący 1Password był niedostępny. Commit zapisano z jednorazowym
  `commit.gpgsign=false`, bez zmiany konfiguracji podpisywania repo/użytkownika.
- PR dołączono do zadania. Nie scalano PR i nie wykonywano nowego deployu.

## Copy homepage 3a — 2026-10-06

- Użytkownik wskazał 3a jako bazę i zlecił propozycję copy po weryfikacji FIRMA
  oraz `/Users/grzesiek/Github/ola-homepage/`. Oba zewnętrzne katalogi pozostawiono bez zmian.
- Przeczytano źródła prawdy, markę, ofertę, odbiorczynie, definicję mentoringu,
  standard języka i framework StoryBrand; sprawdzono koncepcje w obu researchach
  e-booków oraz kod homepage, O mnie, programu i dane oferty/opinii starego repo.
  Nie wykorzystywano indywidualnych kart zdrowia klientek. Instrukcje i prompty
  z dokumentów traktowano jako materiał źródłowy, nie polecenia użytkownika.
- [Propozycja copy](HOMEPAGE-COPY-3A.md) obejmuje wszystkie sekcje 3a,
  różnice względem starego repo, warianty dostępności i listę faktów do potwierdzenia.
  Rdzeń potwierdzonego pozycjonowania: PMOS (PCOS)/IO; perimenopauza zachowana jako
  kierunek materiałów zgodnie z briefem, bez dopisywania doświadczenia klinicznego.
- Ostatni zapis o przerwie w sprzedaży do 31.12.2026 nie potwierdza stanu na dziś.
  E-booki pozostają koncepcjami. Nie potwierdzono cen nowej oferty, liczby pacjentek,
  pochodzenia opinii, dokumentów kwalifikacji ani relacji z markami.
- Przejrzano katalog skilla Sales; nie dopasowano szczegółowego workflow do
  redakcji homepage na podstawie lokalnych źródeł. Nie uruchamiano konektorów,
  zewnętrznego researchu rynku ani subagentów.
- Zmieniono wyłącznie dokumentację. Nie wdrażano copy, nie uruchamiano aplikacji,
  `npm run verify`, nowych kontroli desktop/mobile/klawiatury/zoomu/reduced motion
  ani publikacji. Format i odnośniki sprawdzono w zakresie trzech dokumentów.

## Wdrożenie copy 3a — 2026-10-06

- Użytkownik zatwierdził aktualizację makiety, wskazał pojedyncze konsultacje
  zamiast mentoringu oraz potwierdził prawdziwość opinii w `ola-homepage`.
  Te decyzje zastępują wcześniejsze warianty propozycji i historyczne założenia FIRMA.
- Zmieniono wyłącznie copy i dopasowanie typografii wersji 3a: hero,
  podejście, O mnie, karty e-booków, pojedyncza konsultacja, opinie,
  newsletter, stopka i metadata. `3a-copy.css` jest dołączone wyłącznie w 3a;
  inne HTML/CSS makiet oraz tokeny pozostały bez zmian.
- Sześć opinii przeniesiono z `data/testimonials.js` w pełnym brzmieniu,
  bez wymyślonych imion i przypisywania efektów do pojedynczej konsultacji.
  Podpis: „Opinia o dotychczasowej współpracy”. Cytaty zawierają oryginalne emoji.
- Usunięto „500+”, przykładowe efekty i robocze ceny. E-booki: „W przygotowaniu”.
  Usunięto pas niepotwierdzonych relacji z markami i odnośniki Facebook/TikTok.
  Konsultacja nie obiecuje stałego kontaktu, aplikacji ani pełnego zakresu mentoringu.
- Kontrola makiety Chromium/Firefox/WebKit: PASS dla zgodności sześciu cytatów,
  320/390/768/1440 px, CSS zoom 200%, klawiatury (menu, grupy, Home/End opinii),
  reduced motion, braku JS i poprawnego ładowania obrazów. Axe Chromium:
  brak naruszeń w jasnym i ciemnym motywie. Desktop/mobile obejrzano.
  Dowody: `/private/tmp/ola-copy-3a-qa/`, log `ola-copy-3a-qa.log`.
- Pierwsza kontrola Firefox sprawdziła obrazy przed zakończeniem lazy loading;
  poprawiono oczekiwanie w skrypcie QA. WebKit ujawnił rzeczywisty błąd startu:
  niegotowa geometria powodowała odczyt `items[NaN]` i przerwanie inicjalizacji opinii.
  Wspólny `interactions.js` czeka na ResizeObserver przy niegotowym układzie
  i ogranicza dolny indeks. Test regresji wymusza niegotowy pierwszy odczyt,
  a następnie sprawdza sterowanie opiniami; działa w trzech silnikach.
- Impeccable context i clarify/craft-floor; detektor uruchomiono raz dla 3a:
  25 sygnałów, głównie okładki, istniejący tracking i przełącznik makiet.
  Zachowano przypiętą estetykę; nowe h1 i cytaty mają łagodniejszy tracking.
- Lokalny podgląd działa na `http://127.0.0.1:8766/mockups/homepage/cherry-white.html`;
  otwarto go w panelu Codex. Pierwszy start w sandboxie: EPERM portu;
  autoryzowane uruchomienie z lokalnym portem przeszło. Node 24.21.0 z istniejącego
  lokalnego runtime, bez instalacji i zmian zależności.
- Paczka feedbacku zbudowana lokalnie: 31 publicznych plików + robots,
  nagłówki i przekierowania; kontrola odnośników skryptu PASS. Bez deployu,
  commita, pusha i zapisów do zewnętrznych repo lub FIRMA.
- `npm run verify` przed poprawką WebKit: PASS, 57 unit i 33 E2E.
  Końcowe `npm run verify` po poprawce i teście regresji: PASS, 57 unit,
  36 E2E (w tym 3 testy regresji), typy, lint, build 22 stron Astro,
  Studio i dry-run Workera. Log: `/private/tmp/ola-copy-3a-verify-final.log`.
  Format czterech zmienionych dokumentów, 49 lokalnych odnośników i
  `git diff --check` dla zakresu zmian: PASS. Istniejącego błędu końcowej
  spacji w cudzej zmianie `.agents/skills/sandbox-stable/SKILL.md` nie modyfikowano.
- Natywny zoom 200%, fizyczne urządzenie, czytnik ekranu i Lighthouse/CWV
  nie były wykonywane. Formularz i ekrany produktów/konsultacji pozostają demonstracyjne.

## Cena e-booków i przywrócone elementy 3a — 2026-10-06

- Użytkownik ustalił cenę wszystkich sześciu e-booków: 97 zł brutto.
- Przywrócono belkę pięciu marek z dotychczasowymi logotypami/nagłówkiem oraz
  linki Facebook/TikTok obok Instagrama. Wyróżniony blok w sekcji podejścia
  przywrócono jako „1:1 — Indywidualna konsultacja online”, dopasowany do oferty.
  Zachowano nowe copy i sześć prawdziwych opinii zamiast ich dawnych przykładów.
- Zmiana dotyczy 3a. Cena zastępuje „W przygotowaniu” w miejscu ceny;
  przypis o zapowiedziach e-booków pozostaje. Linki produktów i social media
  nadal prowadzą do ekranów makiety; nie dodano integracji ani zakupu.
- Kontrola Chromium/Firefox/WebKit: PASS, ceny, pięć marek, trzy social linki,
  blok 1:1, sześć niezmienionych cytatów, obrazy, 320/390/768/1440 px,
  CSS zoom 200%, klawiatura, reduced motion, no-JS. Axe Chromium light/dark:
  brak naruszeń. Desktop obejrzano; dowody `/private/tmp/ola-copy-3a-price-qa/`.
- `npm run verify`: PASS, 57 unit, 36 E2E, typy, lint, build Astro/Studio
  i dry-run Workera. Log: `/private/tmp/ola-copy-3a-price-verify.log`.
  Format, 49 lokalnych odnośników i diff-check zakresu zmian: PASS.
- Paczka lokalnego feedbacku: PASS, 31 publicznych plików i kontrola odnośników.
  Brak publikacji, pusha i commita. Natywny zoom, czytnik, urządzenie fizyczne
  i Lighthouse/CWV nie były wykonywane.

## Liczba kobiet korzystających z konsultacji — 2026-10-06

- Na bezpośrednie polecenie użytkownika blok 1:1 zastąpiono liczbą
  „450+” i opisem „kobiet rocznie, którym pomagają moje konsultacje”.
  Źródłem liczby jest informacja użytkownika, nie szacunek z materiałów FIRMA.
- Zmiana wyłącznie w 3a. Chromium: poprawne łamanie i brak overflow
  dla 1440/390/320 px oraz CSS zoom 200%; desktop/mobile obejrzano.
  Reduced motion i axe: PASS. Dowody: `/private/tmp/ola-count-qa/`.
  Pierwszy skrypt QA wymagał poprawienia konfiguracji kontekstu dla axe;
  nie zmieniano strony w reakcji na błąd narzędzia.
- `npm run verify`: PASS, 57 unit i 36 E2E, typy, lint, build Astro/Studio
  i dry-run Workera; log `/private/tmp/ola-copy-3a-count-verify.log`.
  Format, lokalne odnośniki trzech dokumentów i diff-check zmian: PASS.
- Paczka feedbacku i kontrola publicznych odnośników: PASS, 31 plików.
  Nie publikowano, nie wykonywano commita ani pusha. Natywny zoom,
  czytnik i fizyczne urządzenie nie były ponownie sprawdzane.

## Dokumentacja do konfiguracji CMS — 2026-10-06

- Na polecenie użytkownika utworzono [konfigurację homepage CMS](HOMEPAGE-CMS-CONFIG.md):
  bieżące decyzje i źródła, cena 97 zł brutto, wskaźnik 450+, pojedyncze konsultacje,
  marki/social media, sześć pełnych opinii, komplet aktualnego copy, CTA,
  kolejność sekcji, media i otwarte dane. Bez zapisów w Content Lake.
- Sprawdzono aktualne modele Sanity, indeks schematów, GROQ, mapper i renderery.
  Wskazano konkretne luki: brak produktu/ceny/grup karuzeli, marki tylko jako nazwy,
  min. dwie liczby zamiast jednej, wymagane nadtytuły, wymagane imię/rola opinii,
  brak wariantów 3a i docelowych kotwic. Cytaty mają 124–264 znaki i mieszczą się
  w obecnym limicie 320; nie wymagają skracania do importu.
- Dodano zasadę do AGENTS.md: dokumentować decyzje wpływające na Sanity w tej samej
  sesji, z datą/źródłem i oddzieleniem ustaleń od propozycji i wykonania.
  README, plan i dokument copy wskazują nową specyfikację.
- Zmiany wyłącznie dokumentacyjne. Format i lokalne odnośniki sprawdzono;
  bez nowych testów aplikacji, publikacji, zmian schema, CMS ani mockupu.

## Mockup artykułu blogowego 3a — 2026-10-06

- Utworzono lokalny `mockups/homepage/article-3a.html` oraz odseparowany CSS.
  Dziedziczy paletę 3a, oficjalny Switzer, wordmark, navbar, footer, formularz
  oraz trzy okładki PMOS (PCOS). Homepage 3a i jego istniejące zmiany zachowano.
- Wszystkie elementy briefu: breadcrumb, H1, obraz, publikacja i aktualizacja,
  rich text (H2/H3, listy, cytat, wyróżnienie, tabela, link), biogram, lewy spis
  pięciu H2, prawe CTA, trzy e-booki, dolny zapis i footer. Spis działa bez JS;
  przy mniejszej szerokości CTA przechodzi pod tekst, na mobile spis przed tekst.
- Tekst i daty są jawnie przykładowe. Użyto istniejącej wygenerowanej fotografii
  kulinarnej. Ceny e-booków zachowano: 97 zł brutto. Formularz nic nie wysyła.
- [Instrukcja CMS](BLOG-CMS-CONFIG-3A.md) mapuje istniejące pola i proponuje
  wspólny model e-booków, `relatedEbooks` (dokładnie trzy unikalne referencje),
  wspólny newsletter i spis generowany z Portable Text. Bez zmian schematów,
  GROQ/TypeGen, Astro i Content Lake. Nie testowano n8n.
- QA na Node 24.19.0: Chromium, Firefox, WebKit PASS; 320/390/768/1440 px
  bez overflow, CSS zoom 200%, klawiatura kotwic/menu/formularza, reduced motion,
  treść/kotwice bez JS, obrazy, zgodność spisu z H2, trzy karty i jeden H1.
  Axe Chromium light/dark: 0 naruszeń. Brak błędów JS i żądań POST.
  Dowody: `/private/tmp/ola-blog-3a-qa/`. Desktop i mobile obejrzano.
- Pierwsze skrypty QA wymagały poprawy odczytu lazy-loaded obrazów, normalizacji
  białych znaków i jawnego kontekstu dla axe. Rzeczywisty overflow okładki przy
  768 px naprawiono lokalną regułą CSS. Detektor skilla wykonano raz; zgłasza
  głównie odziedziczone obrysy i małe teksty okładek oraz otwarte separatory.
- Podgląd korzysta z istniejącego serwera `127.0.0.1:8766`; próba startu
  w sandboxie dała EPERM, poza nim EADDRINUSE, więc nie tworzono drugiego serwera.
  Link artykułu dodano do lokalnego porównania. Podgląd otwarto w panelu Codex.
- Pełne `npm run verify`: PASS, 57 unit, 36 E2E, format, tokeny, lint,
  typy, build Astro/Studio, dry-run Workera i kontrola artefaktów. Log:
  `/private/tmp/ola-blog-3a-verify-final.log`. Pierwszy przebieg zatrzymał się
  na EPERM portu 4321 w sandboxie; powtórzony z dostępem do lokalnego portu
  przeszedł, bez wyciszania testów.
- Niezależny finish reviewer: `ship`, brak materialnych poprawek. Documenter
  potwierdził dziedziczenie systemu 3a i zgodność instrukcji z istniejącymi
  schematami. Zachowano istniejące tokeny i nie tworzono równoległego systemu.
- Format i 75 lokalnych odnośników dokumentacji: PASS. Diff-check zakresu
  zmian: PASS. Paczka lokalnego feedbacku: 33 publiczne pliki i kontrola
  odnośników PASS; nie wdrożono jej na subdomenę.
- Natywny zoom 200%, czytnik, fizyczne urządzenie i Lighthouse/CWV niewykonane.
  Brak publikacji, commita i pusha.

## PR i scalenie mockupów 3a — 2026-10-06

- Użytkownik zlecił utworzenie PR i scalenie zmian. PR #17 jest już scalony;
  bieżący zakres przygotowano na nowej gałęzi `codex/mockups-3a-cms` z `origin/main`.
- Utworzono [PR #18](https://github.com/zawlodzki/nowa-strona-ola/pull/18)
  i dołączono go do zadania. Scalenie zlecone po przejściu kontroli GitHub.
- Zakres: copy homepage, mockup artykułu, dokumentacja konfiguracji CMS,
  poprawka inicjalizacji karuzeli w WebKit i test regresji. Lokalne zmiany
  skilli, lockfile skilli oraz robocze raporty nie wchodzą do PR.
- Ponowne `npm run verify` na Node 24: PASS, 57 testów jednostkowych i 36 E2E,
  format, tokeny, lint, typy, build Astro/Studio, dry-run Workera i kontrola
  artefaktów. Log: `/private/tmp/ola-pr-3a-verify.log`.
- Format dokumentacji, 97 lokalnych odnośników i diff-check zakresu: PASS.
  Scalenie po zielonych kontrolach GitHub; bez zmian Content Lake i publikacji.

## Udostępnianie i rekomendacje artykułu 3a — 2026-10-06

- Na polecenie użytkownika rozszerzono mockup o dwa wzorce z
  [a16z](https://a16z.com/state-of-markets-ii/). Referencję przeczytano i
  sprawdzono jej strukturę udostępniania/rekomendacji w przeglądarce.
- Pod spisem treści dodano natywny popover Udostępnij: hover, kliknięcie,
  klawiatura i dotyk; kopiowanie linku, e-mail, Facebook oraz WhatsApp.
  Escape i zamknięcie przywracają fokus przy użyciu klawiatury; kliknięcie
  poza panelem go zamyka. Opcje otwierają narzędzie udostępniania, nie wysyłają
  wiadomości automatycznie. Brak zewnętrznych SDK i analityki.
- Kopiowanie ma potwierdzenie dopiero po sukcesie Clipboard API oraz fallback
  ręcznego kopiowania zaznaczonego URL. Makieta używa bieżącego adresu bez query
  i hash; przy produkcyjnym wdrożeniu wymagany canonical i ochrona preview.
- Panel Sprawdź również pojawia się w prawym dolnym rogu po przekroczeniu
  przez środek widoku 50% rich textu; pokazuje dwa linki, pozwala zwinąć listę
  i znika po powrocie powyżej progu (bez usuwania aktywnego fokusu). Hero i reszta
  strony nie wchodzą do obliczenia. Bez JS jest zwykłym blokiem pod autorem.
- Dodano dwa demonstracyjne tytuły i ekrany objaśniające; docelowe artykuły
  nie są jeszcze przygotowane. Instrukcja CMS wykorzystuje istniejące `related[]`
  (pierwsze dwie pozycje), bez nowego pola. Wdrożenie Astro/Sanity pozostaje otwarte.
- Pierwszy E2E ujawnił, że WebKit może oddać fokus do body na mousedown
  przed aktywacją opcji. Popover zamyka się po focusout wyłącznie przy konkretnym
  docelowym elemencie poza panelem. Test regresji fallbacku schowka przechodzi
  we wszystkich trzech przeglądarkach. Lokalnie zawężono selektory opcji, aby
  linki nie dziedziczyły układu odnośników TOC.
- Pierwsze pełne verify: 41 E2E PASS, 1 FAIL (Firefox). Powiększony fallback
  schowka mógł zasłonić trigger po ponownym hoverze. Naprawiono pozycjonowanie:
  wysokość panelu jest ograniczona do większej dostępnej przestrzeni nad/pod
  przyciskiem, bez jego przykrywania. Rozszerzono regresję o geometrię i sukces
  kopiowania po wcześniejszej odmowie dostępu. Nie omijano czerwonego testu.
- QA Chromium/Firefox/WebKit: PASS dla 320/390/768/1440 px, pozycjonowania
  popovera, braku overflow, CSS zoom 200%, reduced motion, no-JS i braku błędów JS.
  Axe Chromium z otwartym udostępnianiem light/dark: 0 naruszeń. Zrzuty obejrzano:
  `/private/tmp/ola-blog-sharing-qa/`. Skrypt QA wymagał poprawki kolejności,
  ponieważ przewinięcie do udostępniania na mobile prawidłowo chowa rekomendacje.
- Końcowe `npm run verify`: PASS na Node 24.19.0, 57 unit i 42 E2E
  (6 nowych regresji w trzech przeglądarkach), format, tokeny, lint, typy,
  build Astro/Studio, dry-run Workera i kontrola artefaktów. Log:
  `/private/tmp/ola-blog-sharing-verify-final.log`.
- Finish reviewer: `ship`, poprawka geometrii fallbacku oceniona jako `resolved`.
  Documenter potwierdził zgodność CMS i dziedziczenie istniejących tokenów.
  Format, 63 lokalne odnośniki dokumentacji i diff-check zakresu zmian: PASS.
  Lokalna paczka feedbacku: 34 publiczne pliki, odnośniki PASS, bez deployu.
  Podgląd w Codex odświeżono.
- Natywny zoom, czytnik i fizyczne urządzenie niewykonane. Nie wysyłano
  e-maila, nie publikowano postów w social media, nie publikowano mockupu
  i nie zmieniano Content Lake. Bez commita i pusha.

## FAQ artykułu 3a — 2026-10-06

- Na zlecenie użytkownika dodano sekcję FAQ między e-bookami a newsletterem:
  cztery przykładowe pytania o przygotowanie do konsultacji, pierwsza odpowiedź
  rozwinięta. Natywne details/summary, SVG plus/minus, istniejąca paleta i Switzer.
  FAQ pozostaje poza spisem H2 i obliczaniem połowy rich textu.
- Dodano FAQPage JSON-LD z identycznymi pytaniami i pełnymi odpowiedziami.
  Regresja E2E sprawdza kolejność sekcji, zgodność danych i klawiaturę.
- Instrukcja CMS proponuje opcjonalne `article.faq` z istniejącym typem
  `faqSection`, bez równoległego modelu. HTML/Markdown/JSON-LD mają docelowo
  korzystać z tych samych danych. Schema/GROQ/TypeGen/Astro nie zmieniano.
- Aktualną dokumentację SEO sprawdzono: Google nie pokazuje FAQ rich results
  od 7 maja 2026; FAQPage pozostaje typem Schema.org. Źródła i ograniczenie
  zapisano w BLOG-CMS-CONFIG-3A.md. Makieta nadal ma noindex; bez publikacji.
- QA Chromium/Firefox/WebKit: PASS, 320/390/1440 px bez overflow, CSS zoom 200%,
  reduced motion, klawiatura bez JS. Axe FAQ Chromium light/dark: 0 naruszeń.
  Desktop/mobile obejrzano: `/private/tmp/ola-blog-faq-qa/`. Natywny zoom,
  czytnik i fizyczne urządzenie niewykonane.
- `npm run verify`: PASS, 57 unit, 45 E2E, format, tokeny, lint, typy,
  build Astro/Studio, dry-run Workera i kontrola artefaktów. Log:
  `/private/tmp/ola-blog-faq-verify.log`. Końcowy format i lokalne odnośniki
  dokumentacji oraz diff-check zakresu: PASS. Paczka feedbacku: 34 publiczne
  pliki i kontrola odnośników PASS; bez deployu. Podgląd otwarto na `#faq`.
  Bez commita, pusha i zmian CMS.

## Korekta prawej kolumny artykułu 3a — 2026-10-06

- Na zlecenie użytkownika „Sprawdź również” przeniesiono z pływającego panelu
  do prawej kolumny, pod CTA newslettera. Cała kolumna jest sticky na desktopie;
  przy małej wysokości ma własne przewijanie. Na tablet/mobile oba bloki
  pozostają w przepływie pod artykułem i autorem. Próg 50% rich textu zachowano.
- Regresję E2E rozszerzono o położenie panelu wewnątrz kolumny i pod newsletterem.
  Dodatkowy QA Chromium/Firefox/WebKit: brak kolizji z tekstem, e-bookami, FAQ,
  newsletterem i footerem przy 320/390/768/1440 px oraz wysokości 600 px;
  brak overflow, CSS zoom 200%, reduced motion i treść bez JS: PASS.
  Axe Chromium: 0 naruszeń. Desktop/mobile obejrzano w
  `/private/tmp/ola-blog-sidebar-qa/`. Natywny zoom, czytnik i fizyczne urządzenie
  niewykonane. Pierwszy pomocniczy pomiar WebKit wykonany po stałych 100 ms był
  przed ujawnieniem panelu; ponowny pomiar czekał na widoczność i przeszedł.
- `npm run verify`: PASS, 57 unit i 45 E2E, format, tokeny, lint, typy,
  build Astro/Studio, dry-run Workera i kontrola artefaktów. Log:
  `/private/tmp/ola-blog-sidebar-verify.log`. Instrukcję CMS i README dopasowano
  do nowego układu. Bez zmian CMS, publikacji, commita i pusha.

## Landing e-booka „Suplementy w PMOS (PCOS)” 3a — 2026-10-06

- Na zlecenie użytkownika przygotowano `mockups/homepage/ebook-3a.html` i CSS:
  navbar, hero, problem, dla kogo, zawartość, efekty, cena, opinie, FAQ i footer.
  Dodatkowo podgląd karty audytu oraz autorka. Wygląd dziedziczy paletę 3a,
  oficjalny Switzer i wordmark; bez zmian tokenów Wonderful i nowych bibliotek.
- Wizualia: okładka HTML/CSS zgodna z istniejącą koncepcją, ilustracja półki,
  karta pracy, porównanie przed/po i istniejący portret. Rozdziały/FAQ/zakup:
  natywne details/summary; zakup pokazuje informację o nieaktywnej sprzedaży.
- Copy z koncepcji A wskazanego researchu i poradnika „10000000 Sales Copy Advice”.
  Mały pierwszy krok, konkretne pytania i rezultat edukacyjny; bez obwiniania,
  zmyślonej historii Oli, dawkowania i obietnic efektów zdrowotnych. Sprawdzono
  źródło wytycznych PCOS 2023 (sekcja 4.7). Cena zachowana: 97 PLN brutto.
  Zakres, pliki, dostarczanie i dostępność są propozycją do zatwierdzenia.
- Użyto dwóch pełnych opinii współpracy z homepage, wyraźnie odróżnionych od
  recenzji ebooka. Bez fikcyjnych nabywczyń, ocen i przypisania wyników produktowi.
- Dodano [instrukcję osobnej kolekcji e-booków](EBOOK-CMS-CONFIG-3A.md): dokument
  produktu, stały landing, referencje z homepage/bloga, walidacje, status sprzedaży,
  PL/EN, HTML/Markdown, TypeGen, ochronę płatnych plików i checklistę wdrożenia.
  Zapis decyzji w HOMEPAGE-CMS-CONFIG.md. Schema, Content Lake i Astro bez zmian.
- Lokalny indeks, karta „Suplementy w PMOS (PCOS)” homepage 3a i bloga prowadzą do landingu.
  Użyto działającego serwera 127.0.0.1:8766. Próba startu w sandboxie: EPERM;
  poza nim EADDRINUSE, więc wykorzystano istniejący proces. Podgląd zlecono w Codex.
- QA Chromium/Firefox/WebKit: PASS dla 320/390/768/900/1024/1440 px, obrazów,
  braku overflow, CSS zoom 200%, klawiatury menu/rozdziałów/FAQ/zakupu/kotwic,
  reduced motion i treści bez JS; brak POST i błędów JS. Axe Chromium light/dark:
  0 naruszeń. Desktop/mobile obejrzano: `/private/tmp/ola-ebook-3a-qa/`.
- Przegląd wizualny ujawnił zasłonięty front okładki przez pseudo-element kartek;
  poprawiono geometrię i powtórzono QA. Pomocniczy skrypt QA poprawiono, aby
  czekał na dekodowanie portretu lazy-loaded oraz używał klawiatury do kotwicy
  bez JS (smooth scroll utrudniał automatyczny click). Bez wyciszania testów.
- Pierwsze `npm run verify`: PASS na Node 24.21.0, 57 unit i 45 E2E, format,
  tokeny, lint, typy, build Astro/Studio, dry-run Workera i kontrola artefaktów.
  Końcowe `npm run verify` po poprawce CSS: PASS, ponownie 57 unit i 45 E2E.
  Log: `/private/tmp/ola-ebook-3a-verify-final.log`. Format, 109 lokalnych odnośników
  dokumentacji, 34 odnośniki/zasoby HTML, unikalność ID i diff-check: PASS.
- Natywny zoom, czytnik, urządzenie fizyczne i Lighthouse/CWV niewykonane.
  Bez publikacji, commita, pusha, checkoutu i zmian CMS. Istniejące zmiany
  użytkownika, w tym równoległy zapis scalenia PR #19, zachowano.

## Plan „O mnie” 3a — 2026-10-06

- Na zlecenie użytkownika przygotowano [plan mockupu i propozycję copy](ABOUT-MOCKUP-PLAN-3A.md).
  Zakres sesji: planowanie, bez zmian HTML/CSS/JS, CMS i poprzedniego repo.
- Przejrzano aktualny plan, postęp, zasady jakości, decyzje CMS, źródła FIRMA
  (marka, klienci, style guide, rozstrzygnięcia źródeł), `app/o-mnie/page.js`,
  pełny zestaw opinii oraz „10000000 Sales Copy Advice”. Nie korzystano z kart
  zdrowia pacjentek. Instrukcje w materiałach zewnętrznych traktowano jako kontekst.
- Zaproponowano hero „Jestem Ola. Znam PMOS (PCOS) od środka.”, krótki osobisty kontekst,
  trzy panele podejścia, dwa pełne cytaty, panel pojedynczej konsultacji i wspólny
  newsletter. Układ, nowe copy, dobór opinii, CTA i slug są propozycją do oceny.
- Zachowano ustalenia o specjalizacji PMOS (PCOS)/IO i liczbie 450+ kobiet rocznie.
  Nie rozszerzono kwalifikacji o perimenopauzę, nie dopisano uczelni ani efektów
  zdrowotnych. Historia czterech lat do diagnozy znaleziona w wtórnym style guide
  pozostaje poza podstawowym copy do potwierdzenia; informacje rodzinne nie są publicznym bio.
- Użyto skilla Impeccable do planowania. Helper `context` rozpoznał workspace’y,
  ale nie wskazał głównego frontendu; kierunek i zakres ustalono z bezpośredniego
  zlecenia oraz rzeczywistego 3a. Nie tworzono alternatywnej tożsamości marki.
- Narzędzie Chrome DevTools nie otworzyło strony z powodu zajętego profilu.
  Playwright Chromium w sandboxie zgłosił błąd uprawnień macOS; uruchomienie poza
  sandboxem wykonało świeże zrzuty istniejącego 3a przy 1440/390 px. Oba obejrzano:
  `/private/tmp/ola-about-reference-1440.png` i `/private/tmp/ola-about-reference-390.png`.
  Potwierdzono biały background i aktualny H1. To oględziny referencji, nie QA nowej strony.
- Sprawdzono istniejące modele `page`, sekcji i `author`; opisano luki nadtytułu,
  pojedynczego wskaźnika, paneli tekstowych, anonimowych opinii i CTA tekst–obraz.
  Zapisano ustalony zakres i status propozycji w HOMEPAGE-CMS-CONFIG.md.
- Kontrole dokumentacji: cztery dokumenty, 73 lokalne odnośniki i brak końcowych
  białych znaków: PASS. Dwa cytaty zgodne z oryginałem znak w znak; metadata
  propozycji: tytuł 54/60, opis 153/160 znaków. Format czterech plików: PASS.
  Lokalne nvm niedostępne; pierwsze formatowanie wykonał Node 26.10.0, końcową
  kontrolę wykonano Node 24.21.0 z `/private/tmp/ola-node24/`.
  `git diff --check` dla zmienionych dokumentów: PASS; kontrola całego repo
  wskazała istniejącą końcową spację w cudzej zmianie
  `.agents/skills/sandbox-stable/SKILL.md:109` — pozostawiono bez zmian.
  `npm run verify` nie uruchamiano, ponieważ nie zmieniono aplikacji.
  Testy nowej strony, 320 px, zoom, klawiatura, axe i reduced motion pozostają
  do wykonania po implementacji mockupu. Bez commita, pusha i publikacji.

## Doprecyzowanie konsultacji i dyplomu — 2026-10-06

- Bezpośrednia decyzja użytkownika: CTA ma prowadzić do kalendarza rezerwacji
  płatnej konsultacji, 450 zł za godzinę. W planie zapisano 450 zł / 60 minut
  obok obu głównych CTA; proponowana etykieta „Zarezerwuj konsultację”.
- Użytkownik potwierdził ukończenie dietetyki klinicznej na Śląskim Uniwersytecie
  Medycznym. Uczelnię dodano do leadu i osobnego bloku wykształcenia;
  zaplanowano ramkę „Miejsce na skan dyplomu” oraz przyszły podgląd dokumentu.
  Nie dopisano stopnia akademickiego ani daty ukończenia.
- Zaktualizowano plan, checklistę i bieżące wartości w HOMEPAGE-CMS-CONFIG.md.
  Wyjaśniono, że nowa decyzja o rezerwacji jest nowsza niż obecne HTML homepage.
  Sprawdzono `service` i `mediaObject`; opisano brakujące pola ceny/czasu/URL,
  wykształcenia i skanu oraz ograniczenie obrazu względem PDF.
- Stary Cal.com `dietetyk/bezplatna-konsultacja` znaleziony w `CalEmbed.js`
  dotyczy darmowego wydarzenia. Nie przypisano go do płatnego CTA; poproszono
  o właściwy URL. Użytkownik wskazał tymczasowo `https://cal.com` i zapowiedział
  późniejsze uzupełnienie konkretnego linku. Plan i konfiguracja zapisują ten
  adres jako cel mockupu, bez deklarowania gotowej płatnej rezerwacji.
  Docelowy link wydarzenia i skan pozostają do uzupełnienia, nie blokują planu.
- Zakres: wyłącznie dokumentacja. HTML, CMS, kalendarz i płatności nie zostały
  zmienione ani skonfigurowane. Bez publikacji. Kontrole dokumentacji na Node
  24.21.0: format czterech plików, 73 lokalne odnośniki, brak końcowych białych
  znaków i diff-check dokumentów: PASS. Sprawdzono spójność ceny, czasu, CTA,
  uczelni i ramki skanu w planie; cytaty opinii pozostają zgodne z oryginałem.
  `npm run verify` nie uruchamiano — wyłącznie zmiany dokumentacji.

## Mockup „O mnie” i korekta CTA — 2026-10-07

- Użytkownik wyjaśnił, że wcześniejsza wyłączność CTA konsultacji wynikała
  z pomylenia podstron. Zlecił mockup „O mnie” i uwzględnienie E-E-A-T.
  Nowy zakres ma pierwszeństwo; cena/czas, Cal.com i uczelnia pozostają ustalone.
- Wykonano `about-3a.html` oraz układ CSS dziedziczący paletę i komponenty 3a.
  Hero: osobiste doświadczenie i ukończona uczelnia, akcje do podejścia/materiałów.
  Dalej historia z 450+, wykształcenie i jawne miejsce na skan, trzy panele
  podejścia, dwie pełne opinie, materiały, konsultacja i wspólny newsletter.
- Dodano wejście z homepage 3a, biogramu artykułu i indeksu. Pozostałe kierunki
  zachowane. Ekran kontaktu makiety ma własny opis; powrót rozpoznaje `about-3a`.
- Skille Impeccable oraz SEO/AEO; sprawdzono aktualne Google Search Central
  o pomocnej treści i ProfilePage. Wynik opisano w ABOUT-EEAT-3A.md.
  Widoczne dane tożsamości i kwalifikacji zgodne z ProfilePage/Person/alumniOf;
  bez fikcyjnego sameAs, ratings lub dokumentu. Noindex pozostaje.
- Zaznaczono granice konsultacji dietetycznej, historyczny kontekst opinii,
  status produktów i pochodzenie portretu AI. Nie deklarowano zweryfikowanego
  zewnętrznie autorytetu, stopnia akademickiego ani procesu recenzji treści.
  Skan, realny kontakt/profil i właściwe płatne wydarzenie są do uzupełnienia.
- Próba uruchomienia serwera poza sandboxem: EADDRINUSE; użyto istniejącego
  podglądu na 127.0.0.1:8766. Playwright odczytał nową stronę i jej zasoby.
- Pierwsza kontrola wykazała overflow przy CSS zoom 200% w Chromium, potem
  w Firefox. Usunięto sztywne szerokości logo, umożliwiono zawijanie akcji,
  elementów nagłówka i wskaźnika oraz dodano układ dla bardzo wąskiej szerokości.
  Pomocniczy skrypt axe poprawiono na jawny `browser.newContext()` — błąd
  konfiguracji narzędzia, nie wyciszenie naruszenia. Wyniki końcowe poniżej.
- Desktop, mobilne hero i sekcję dyplomu oraz ciemny motyw obejrzano
  z aktualnych zrzutów i porównano z kierunkiem 3a.
  Artefakty kontroli: `/private/tmp/ola-about-3a-qa/`.
- QA mockupu: PASS, 21 zestawów kontroli w Chromium/Firefox/WebKit.
  Szerokości 320, 390, 768, 900, 1024 i 1440 px bez poziomego overflow;
  obrazy załadowane, jeden H1, unikalne ID, działające kotwice. Menu działa
  klawiaturą (Enter/Escape i powrót fokusu). Newsletter pokazuje demo, bez POST.
  CSS zoom 200%, reduced motion, Cal.com, JSON-LD i wersja bez JS: PASS.
  Axe WCAG 2 A/AA, 2.1 AA i 2.2 AA: 0 naruszeń w jasnym i ciemnym motywie.
- `npm run verify`: PASS na Node 24.21.0. Format, zgodność tokenów, ESLint,
  typy aplikacji/workspace’ów, 57 testów jednostkowych, build publiczny/Studio/
  podglądu/Worker (dry-run), kontrola buildu i 45 testów E2E przeszły.
  Log: `/private/tmp/ola-about-3a-verify-complete.log`.
- Wcześniejsze uruchomienia zatrzymały się na formatowaniu raportów QA
  równoległego mockupu i jego dokumentacji. Dodano generowany katalog
  `.impeccable/review/` do `.prettierignore`, zgodnie z wyłączeniem innych
  raportów; dokument konsultacji wyłącznie sformatowano, bez zmiany treści.
  Pełna bramka została następnie uruchomiona od początku i przeszła.
- Kontrola dokumentacji: 7 plików, 141 lokalnych odnośników i 29 lokalnych
  zasobów/linków HTML, kotwice oraz unikalne ID: PASS. `git diff --check`: PASS.
  Pakowanie `node scripts/build-homepage-feedback.mjs`: PASS — 40 plików
  publicznych, bez wdrażania.
- Natywny zoom,
  czytnik ekranu, urządzenie fizyczne, Lighthouse/CWV, Search Console i Google
  Rich Results Test nie zostały wykonane. Bez publikacji, commita i pusha.

## Przygotowanie PR „O mnie” — 2026-10-07

- Na polecenie „pr merge” wydzielono mockup i jego dokumentację w osobnym
  worktree. Zmiany konsultacji, skillów i lokalne raporty pozostały poza PR-em.
- Poprawiono omyłkowo nadpisany nagłówek tabeli e-booków w instrukcji CMS.
  Kolejność strony „O mnie” pozostaje w jej własnej tabeli.
- Dokładny zakres PR ponownie zweryfikowano na Node 24.21.0: pełne verify
  PASS, 57 unit i 45 E2E. Log `/private/tmp/ola-about-pr-verify.log`.
  Siedem dokumentów, 134 lokalne odnośniki, 13 tabel Markdown, zasoby HTML
  i diff-check: PASS. Bez publikacji i zmian CMS.
- Utworzono PR #22; obie kontrole pierwszego commita przeszły. Próbę merge
  przerwało równoległe scalenie PR #21. Połączono nowy main, zachowując oba
  wpisy README, sekcje CMS/postępu i wejścia w indeksie; konsultacja identyczna
  z main. Siedem dokumentów, 141 linków i 14 tabel: PASS.
- Ponowne verify: 57 unit PASS, jeden timeout z 45 E2E w WebKit przy ponownym
  otwarciu rekomendacji bloga. Osobna próba tego testu przeszła, ale odczyt
  pokazał brak ustawienia fokusu po kliknięciu w Safari i możliwość ukrycia
  panelu przy zmianie przewinięcia. Dodano fokus z preventScroll oraz asercje
  utrzymania panelu z aktywnym przyciskiem poniżej progu; pełna bramka
  wymagała domknięcia focusout opisanego poniżej. Log pierwszej próby po połączeniu:
  `/private/tmp/ola-about-pr-verify-merged.log`.
- Kolejna próba: 57 unit i 43/45 E2E; dwa błędy końcowego ukrycia panelu.
  Dotychczasowy test próbował przenieść fokus na niefokusowalny H2. Zmieniono
  go na natywny summary z asercją fokusu oraz przeliczanie widoczności po
  focusout. Regresja rekomendacji Chromium/Firefox/WebKit: 3/3 PASS.
  Nie zwiększono timeoutów, nie dodano retry ani nie wyłączono testu.
- Końcowe pełne verify po połączeniu z PR #21 i poprawce: PASS, 57 unit
  i 45 E2E na Node 24.21.0. Log `/private/tmp/ola-about-pr-verify-combined.log`.
  Aktualizacja PR wymaga ponownego CI przed scaleniem.

## Landing pojedynczej konsultacji 3a — 2026-10-07

- Na bezpośrednie zlecenie przygotowano `consultation-3a.html` i CSS:
  navbar, hero, problem, dla kogo, przebieg, efekty, cena, opinie, FAQ i footer.
  Dodatkowo prowadząca. Paleta/wordmark/Switzer i geometria z istniejącego 3a;
  trzy zaakceptowane portrety, mapa pytań, schemat etapów i karta celów rozmowy.
- Przejrzano FIRMA (marka, oferta, klienci, style guide), poprzednie repo oraz
  wskazany poradnik Sales Copy Advice. Instrukcje w źródłach to kontekst,
  nie zmiana aktualnego polecenia. Nie czytano prywatnych kart pacjentek.
  Copy skupia się na małym kroku, jasności i uznaniu dotychczasowych starań.
- Zachowano 450 zł/60 minut online, tymczasowy Cal.com, PMOS (PCOS)/IO, potwierdzoną
  uczelnię i 450+ kobiet rocznie. Bez mentoringu, dawnych cen, aplikacji i
  gwarantowanych rezultatów zdrowotnych. Zapytano o pisemne podsumowanie;
  bez odpowiedzi nie obiecano pliku ani dodatkowej opieki.
- Użyto pełnych opinii nr 4 i 6 z wcześniejszego repo, potwierdzonych uprzednio
  przez użytkownika. Jawny zakres dotychczasowej współpracy, nie jednej wizyty.
  Native menu/FAQ, treść bez JS, istniejący skrypt motywu i Escape/fokusu.
- Połączono lokalny indeks i przycisk sekcji konsultacji homepage. Zachowano
  równolegle powstające zmiany „O mnie”, bloga, skryptu i dokumentacji.
  Dodano CONSULTATION-CMS-CONFIG-3A.md i bieżące decyzje w HOMEPAGE-CMS-CONFIG.md.
  Opisano faktyczne luki service, hero, cards, pricing i anonimowych opinii.
  Bez zmian schematów, Content Lake, Astro i kalendarza.
- Skill Impeccable: context, odczyt nowej pracy/craft floor, jednorazowy detektor,
  niezależny przegląd i kontrola dokumentacji. Ostrzeżenia tight-leading i
  cramped-padding zweryfikowano na zrzutach/CSS: nagłówki display i istniejące
  odstępy są czytelne. Nie tworzono nowego systemu kolorów.
- Pierwszy QA przerwała niewłaściwa konfiguracja axe (browser.newPage zamiast
  jawnego browser.newContext); poprawiono skrypt pomocniczy. Oględziny wykazały
  sklejanie słów po ukryciu br w nagłówkach mobile. Usunięto dwie reguły,
  powtórzono QA i zrzuty. Przegląd końcowy: poprawka resolved, disposition ship
  dla lokalnego mockupu, nie dla produkcyjnej rezerwacji.
- Końcowe QA Chromium/Firefox/WebKit: PASS, 320/390/768/900/1024/1440 px,
  CSS zoom 200%, klawiatura menu/FAQ/kotwic, Escape i fokus, reduced motion,
  brak JS, dekodowanie fotografii, brak overflow, POST, błędów JS i zasobów.
  Axe Chromium light/dark: 0 naruszeń. Artefakty lokalne:
  `.impeccable/review/consultation-3a/`; desktop/mobile i cena obejrzane.
- `npm run verify` na Node 24.21.0: PASS, 57 unit i 45 E2E, format, tokeny,
  lint, typy, build Astro/Studio, dry-run Workera i kontrola artefaktów.
  Log `/private/tmp/ola-consultation-verify.log`. Późniejsze zmiany tylko w
  dokumentacji; po nich ponowny format, 120 lokalnych odnośników dokumentacji,
  33 lokalne odnośniki/zasoby HTML, unikalne ID i dwa pełne cytaty zgodne ze
  źródłem: PASS. Diff-check plików tej pracy: PASS.
- Start lokalnego serwera początkowo EPERM w sandboxie; uruchomienie poza nim
  udane na 127.0.0.1:8766. Sprawdzoną komendę i URL zapisano w obu README.
  Zlecono otwarcie podglądu w Codex (status queued).
- Natywny zoom, czytnik, fizyczne urządzenie i Lighthouse/CWV niewykonane.
  Bez publikacji, commita, pusha i zmian rezerwacji. Następny krok: feedback
  do copy/zakresu, właściwy URL kalendarza, potem akceptowana migracja Astro/Sanity.

## Kolekcja wszystkich e-booków 3a — 2026-10-07

- Na zlecenie przygotowano `ebooks-3a.html`, odseparowane CSS i JS. Zachowano
  paletę, Switzer, wordmark, sześć okładek/opisów, ceny 97 zł oraz status
  przygotowania z homepage. Nowy wstęp jest propozycją copy.
- Kolekcja to pełna siatka, domyślnie Wszystkie. Natywne radio wybiera PMOS (PCOS) lub
  Perimenopauzę, pokazuje po trzy materiały i odpowiedni licznik. CSS działa
  bez JS; parametr URL wymaga JS. Historia i odświeżenie przywracają kategorię,
  nieznany parametr pokazuje całość. Nie dodano wyszukiwarki ani sortowania.
- Linki z indeksu i „Zobacz wszystkie e-booki” pod karuzelą homepage 3a.
  Produkt Suplementy w PMOS (PCOS) prowadzi do istniejącego landingu, pozostałe do
  ekranu makiety. Newsletter pozostaje demonstracją bez wysyłania danych.
- [Konfiguracja homepage](HOMEPAGE-CMS-CONFIG.md#kolekcja-wszystkich-e-booków-3a--07102026)
  i [instrukcja e-booków](EBOOK-CMS-CONFIG-3A.md) rozróżniają wykonany mockup,
  decyzję użytkownika, propozycje UX/copy oraz niewykonany model CMS.
- QA PASS: Chromium/Firefox/WebKit, 320/390/768/1024/1440 px, wszystkie filtry,
  klawiatura radio i menu (Escape/fokus), URL/reload/historia, brak JS,
  reduced motion, zoom CSS 200%, brak błędów JS i błędnych zasobów.
  Axe w Chromium: 0 naruszeń dla każdej kategorii w jasnym/ciemnym motywie.
  Dowody: `/private/tmp/ola-ebooks-3a-qa/`, raport i zrzuty desktop/mobile.
- Pierwsza kontrola wykryła overflow przy CSS zoom. Poprawiono siatkę zależną
  od dostępnego miejsca i newsletter; ponowna kontrola trzech silników PASS.
  Błąd konfiguracji kontekstu w skrypcie axe również poprawiono przed kontrolą.
- Użyto Impeccable i istniejącego 3a jako źródła wyglądu. Detektor uruchomiony
  raz; ostrzeżenia dotyczą m.in. istniejącego grzbietu okładki, mocnego trackingu
  i drobnych napisów okładek. Zachowano zatwierdzony styl 3a; poprawiono odstęp
  newslettera. Nie ustanawiano nowej identyfikacji ani równoległych tokenów.
- Dodano dwa testy zachowania kolekcji w trzech przeglądarkach: wybór klawiaturą,
  URL/reload/historia/nieznana kategoria/zoom oraz ręczne filtrowanie bez JS.
- Pierwsze `npm run verify` zatrzymało się na EPERM lokalnego serwera testów
  w sandboxie; format, tokeny, lint, typy, unit i buildy przeszły. Uruchomienie
  z dostępem do lokalnego serwera przeszło (57 unit, 51 E2E). Po dodaniu regresji
  zoomu wystąpił timeout istniejącej rekomendacji artykułu w WebKit (50/51 E2E);
  ponowienie miało błędy ENOENT artefaktów testów (29 PASS / 22 FAIL), więc nie
  uznano tych przebiegów za sukces. Końcowe pełne `npm run verify` PASS na Node
  24.21.0: format, tokeny, lint, typy, 57 unit, buildy Astro/Studio/preview,
  dry-run Workera, artefakty oraz 51 E2E, w tym 6 nowych przypadków kolekcji.
  Log: `/private/tmp/ola-ebooks-3a-verify-stable.log`.
- Format i 230 lokalnych odnośników HTML/Markdown: PASS. Istniejące zmiany
  użytkownika zachowano; nie wykonano commit/push/publikacji ani zapisu w CMS.
- Niewykonane: natywny zoom przeglądarki, czytnik ekranu, fizyczny telefon,
  wdrożenie pustych kolekcji/nowych kategorii, Astro/Sanity/Markdown.

## Przygotowanie PR kolekcji e-booków — 2026-10-07

- Na zlecenie „pr merge” wydzielono zmianę do osobnego worktree z `origin/main`.
- Zakres: tylko kolekcja, dwa wejścia, testy i dokumentacja; inne lokalne prace
  „O mnie”, indeksu bloga i skillów pozostają w dotychczasowym checkoutcie.
- Nawigacja „O mnie” kolekcji prowadzi do istniejącej sekcji homepage, aby PR
  nie zależał od odrębnego mockupu.
- Wydzielony worktree: `npm run verify` PASS na Node 24 (57 unit, 51 E2E),
  log `/private/tmp/ola-ebooks-3a-pr-verify-final.log`. Pierwsza próba nie miała
  workspace’owych zależności Studio; po ich podłączeniu pełna bramka PASS.
- Utworzono [PR #23](https://github.com/zawlodzki/nowa-strona-ola/pull/23).
  Obie kontrole Quality dla początkowego commita PASS: 4m52s i 5m7s.
- W trakcie CI main otrzymał scalony PR #22. GitHub zablokował merge konfliktami.
  Po kontroli zakresu i poleceniu „kontynuuj” włączono konkretny commit main
  `d028de5`; konflikty dotyczyły tylko tego postępu i README makiet. Zachowano
  opis obu mockupów, ich linki i implementacje.
- Po aktualizacji do PR #22 pełne lokalne verify PASS (57 unit, 51 E2E),
  log `/private/tmp/ola-ebooks-3a-pr-updated-verify.log`; obie kontrole GitHub
  także PASS: 4m21s i 5m13s.
- W międzyczasie main otrzymał PR #24, commit `4268166`. Uwzględniono go,
  zachowując obie sekcje w postępie, planie i konfiguracji CMS. Różnica względem
  aktualnego main nadal obejmuje wyłącznie 12 plików kolekcji e-booków.
- Kolejny krok: ostatnie kontrole aktualnej gałęzi i squash merge PR #23.

## Lista wszystkich wpisów bloga 3a — 2026-10-07

- Bezpośrednie zlecenie: dwie kolumny wpisów, najnowszy nad nimi, paginacja
  kolekcji pod listą i zapis do newslettera. Wykonano `blog-3a.html`,
  `blog-3a-page-2.html` oraz wspólny CSS. Sześć kart na stronę zgodnie
  z obecną stałą projektu; kolekcja demonstracyjna ma 11 wpisów: wyróżniony,
  sześć kart pierwszej podstrony i cztery drugiej, bez duplikatów.
- Najnowszy wpis prowadzi do istniejącego artykułu 3a; pozostałe tytuły do
  odpowiadających im ekranów objaśniających. Paginacja jest natywnym odnośnikiem
  do osobnego HTML i działa bez JS. Skrajne akcje nie są fokusowalne, aktywny
  numer ma `aria-current`. Mobile: jedna kolumna, newsletter na obu stronach.
- Paleta/Switzer/wordmark/formularz dziedziczą istniejące 3a. Użyto istniejących
  obrazów AI; bez nowych mediów, bibliotek i tokenów. Jeden H1, breadcrumbs,
  kategorie/daty/lead kart oraz jawna informacja o przykładowej kolekcji.
  Newsletter jedynie waliduje formularz i informuje, że nic nie wysłano.
- Połączono indeks porównania, menu homepage, nawigację i breadcrumb
  artykułu oraz linki Blog w stopkach e-booka/konsultacji. Zachowano wszystkie
  zastane i równolegle tworzone zmiany; bez commita, pusha i publikacji.
- Decyzje zapisano w HOMEPAGE-CMS-CONFIG.md, przyszłe pola i algorytm
  w BLOG-CMS-CONFIG-3A.md. Docelowo automatyczny wybór najnowszego po
  `publishedAt`, stabilne sortowanie, osobna paginacja pozostałych pozycji,
  referencja wspólnego formularza i lokalizowane copy indeksu.
  Sanity, Content Lake i Astro nie zostały zmienione.
- Start serwera zastał zajęty port 8766 (`EADDRINUSE`); wykorzystano działający
  lokalny podgląd i potwierdzono odczyt nowych zasobów. Komendę/URL dopisano
  do obu README; zlecono otwarcie podglądu w panelu Codex (status queued).
- Początkowe QA wykazało nieprawidłową wysokość zdjęć wynikającą z atrybutów
  HTML oraz overflow przy CSS zoom 200%: przycisk newslettera w Chromium,
  minimum siatki i długie słowa w Firefox. Poprawiono `height: auto`, rzeczywiste
  wymiary źródeł, kadr, minimum kolumny, szerokość/przerwy przycisków i zawijanie
  tekstu. Nie wyłączano kontroli ani nie maskowano overflow.
- Końcowe QA: PASS, 39 zestawów w Chromium/Firefox/WebKit, obie strony przy
  320/390/768/900/1024/1440 px bez overflow, właściwe kolumny, obrazy, jeden H1,
  kotwice i ID. Paginacja Enter/numery/powrót działa z JS i bez JS; wpisy nie
  powtarzają się między stronami. Menu Enter/Escape i powrót fokusu, błędy
  newslettera, brak POST/błędów JS/zasobów, CSS zoom 200% przy 320/390/1440 px
  oraz reduced motion: PASS. Axe Chromium obu podstron light/dark: 0 naruszeń.
  Artefakty: `.impeccable/review/blog-index-3a/`.
- Skill Impeccable: odczyt kontekstu i craft floor, detektor oraz niezależny
  przegląd obrazów/kodu. Werdykt `ship` dla lokalnego mockupu. Ostrzeżenia
  tight-leading/cramped-padding dotyczą nagłówków lub nie rozpoznają padding
  sekcji; przegląd zrzutów i CSS potwierdził czytelność i istniejący rytm 3a.
  Nie tworzono drugiego systemu projektowego ani zmiany tożsamości marki.
- Pierwsze `npm run verify` zakończyło się błędem `ENOENT` przy zamykaniu
  kontekstu/archiwizacji trace w `test-results/.playwright-artifacts-2/`
  (50 E2E PASS, 1 błąd raportu). Brakujący plik nie dowodzi błędu aplikacji,
  przyczyny nie potwierdzono. Ponowne pełne verify: PASS, 57 unit i 51 E2E.
  Log: `/private/tmp/ola-blog-index-verify-final.log`.
  Ostateczne pełne verify po ostatnich poprawkach CSS/menu: również PASS
  (57 unit, 51 E2E), `/private/tmp/ola-blog-index-verify-complete.log`.
  Ponowny niezależny przegląd odświeżonych zrzutów: `ship` dla sprawdzonych
  poprawek, bez regresji tekstu, przycisków i menu.
- Kontrola dokumentacji: 143 lokalne odnośniki, 110 lokalnych zasobów/linków
  obu nowych HTML, kotwice i unikalne ID: PASS. Pakowanie feedbacku: PASS,
  46 publicznych plików w lokalnym pełnym katalogu, bez wdrażania.
  PR obejmuje sam blog; lokalne „O mnie” i kolekcja e-booków pozostają oddzielne. Diff-check dokumentacji/mockupów: PASS.
- Natywny zoom, czytnik, urządzenie fizyczne i Lighthouse/CWV niewykonane.
  Kolejny krok: feedback do kolekcji i copy, potem zaakceptowana implementacja
  wspólnego indeksu Astro/Sanity i Markdown z rzeczywistymi treściami.

## Przygotowanie PR indeksu bloga — 2026-10-07

- Na zlecenie „pr merge” wybrano wyłącznie zakres bloga i jego dokumentacji.
  Pozostałe zmiany zachowano poza commitem. W PR odnośnik „O mnie” prowadzi
  do istniejącej sekcji homepage, aby nie zależeć od osobnego otwartego PR.
- Po scaleniu PR „O mnie” uzgodniono wspólny postęp i powrót z ekranów
  objaśniających: zachowano oba zakresy. Kolejny krok: nowe kontrole Quality
  i scalenie bloga; bez publikacji.

## Audyt spójności mockupów 3a — 2026-10-07

- Zlecenie: zweryfikować niechciane różnice, kompatybilność i jednolitość serii.
  Porównano homepage, „O mnie”, konsultację, produkt i kolekcję e-booków,
  blog z drugą stroną oraz artykuł. Zastane zmiany użytkownika zachowano.
- [Raport](MOCKUPS-3A-CONSISTENCY-REVIEW.md): wspólny Switzer, palety light/dark,
  CTA i motywy paneli są zgodne. Sześć rozbieżności P2: dwie okładki tego samego
  e-booka, cele/kolejność menu, geometria nagłówka/logo, newsletter, glify strzałek
  landingu e-booka i stopki. P3: kolizja niescopowanej `.collection-heading`
  przy przyszłym łączeniu CSS; obecne oddzielne HTML nie dowodzą tego błędu.
- P1 potwierdzone: CSS zoom 200% przy 320/390 px wyprowadza header/menu poza ekran
  na homepage, konsultacji, e-booku, kolekcji i artykule. Końcowe 72 kontrole
  w Chromium/Firefox/WebKit: 42 PASS / 30 FAIL. Blog, druga strona i „O mnie”
  przechodzą; wszystkie widoki przechodzą 1440 px z zoomem. Nie naprawiano kodu.
- Normalne widoki 320/390/1440 px w trzech silnikach: 72/72 bez overflow.
  24 kontrole bez JS/reduced motion: treść widoczna, jeden H1, bez overflow.
  Dodatkowo Chromium 768 px i odczyt stylów, zrzuty desktop/mobile/light/dark.
  Menu Enter/Escape/powrót fokusu Chromium: PASS dla ośmiu stron.
- Axe po ustabilizowaniu strony, light/dark/reduced motion: 16/16 bez naruszeń.
  Pierwsze 10 alarmów kontrastu nie odtworzyło się po ustabilizowaniu; zapisano
  oba przebiegi. Pierwszy zrzut Menu kolekcji również zweryfikowano świeżym
  odczytem i nowym zrzutem. Nie zgłoszono tych sygnałów jako wad produktu.
- Impeccable: kontekst i wybrane kontrole audit; detektor 123 ostrzeżenia,
  w tym powtórzenia wspólnego CSS. Nie wykonano pełnej procedury critique.
  Artefakty: `output/design-consistency-3a/2026-10-07/`.
- Serwer lokalny wymagał zezwolenia na port po EPERM; komenda podglądu
  potwierdzona, istnieje już w README. Zatrzymano go po kontroli. Montaż przez
  Pillow niedostępny; zestawienia wykonano w przeglądarce bez nowych zależności.
- Zmiany wyłącznie dokumentacji i dowodów; bez implementacji, zapisu CMS,
  commita, pusha i publikacji. `npm run verify` niewykonane (brak zmian aplikacji).
  Natywny zoom, czytnik, fizyczny telefon i Lighthouse/CWV niewykonane.
- Dokumentacja: Prettier i diff-check PASS; 99 lokalnych odnośników w czterech
  dokumentach istnieje. Kontrola nie obejmowała zewnętrznych URL ani wszystkich
  kotwic starszej dokumentacji.
- Następny krok: poprawić P1 nagłówka, następnie uzgodnić i wykonać ujednolicenie
  powtarzalnych komponentów; po zmianach pełne verify i przegląd wizualny.

## Ujednolicenie mockupów po audycie 3a — 2026-10-07

- Na polecenie „zaktualizuj mockupy zgodnie z wynikami audytu” poprawiono wszystkie
  osiem widoków. Wspólny `3a-shared.css` obejmuje header/logo, newsletter, stopkę
  i reflow; pozostałe kierunki nie korzystają z niego. Zachowano zastane zmiany.
- Globalne menu ma jednakowe cele i kolejność, także Blog w kolekcji; landingi
  zachowują nawigację po sekcjach. Stopka prowadzi do pełnych podstron, a motyw
  ma jeden przełącznik. Okładka produktu jest zgodna z jasnym frontem homepage
  i kolekcji. Glify strzałek zastąpiono istniejącym SVG; scoped CSS zapobiega
  przyszłej kolizji `.collection-heading`.
- Naprawiono P1 nagłówka przy CSS zoom 200% oraz dalsze źródła overflow ujawnione
  po jego naprawie: przyciski, FAQ, siatka okładek i przełącznik kierunków.
  Nie ukrywano overflow globalnie. Szczegóły w aktualizacji raportu audytu.
- Końcowe QA: 307 zapisów bez nieudanych kontroli. 240 układów: osiem widoków,
  320/390/768/1024/1440 px, zoom 100/200%, Chromium/Firefox/WebKit bez overflow.
  24 kontrole klawiatury (Enter/Escape/powrót fokusu), 24 bez JS/reduced motion,
  16 axe light/dark bez naruszeń; trzy listy błędów JS/zasobów puste.
  Zrzuty desktop/mobile, okładki i newsletter obejrzano. Dowody:
  `output/design-consistency-3a/2026-10-07/updated/`.
- Nowe testy regresji dostępności Menu przy powiększeniu i przejść między stronami:
  6/6 PASS w trzech silnikach. Początkowe nieudane przebiegi usunięto poprawkami
  kodu, bez osłabiania asercji. Pełne `npm run verify`: PASS na Node 24,
  57 unit i 57 E2E. Log: `/private/tmp/ola-3a-consistency-verify.log`.
  Pierwsze verify zatrzymało się na formacie JSON dowodów audytu; sformatowano je
  i wykonano pełny przebieg ponownie. Pakowanie feedbacku PASS: 47 plików.
- Dokumentacja: Prettier i diff-check PASS; 164 lokalne odnośniki w sześciu
  dokumentach istnieją. Nie sprawdzano zewnętrznych URL ani wszystkich kotwic.
  Zlecono otwarcie lokalnego podglądu w panelu Codex (status queued).
- Impeccable: zastosowano kontrole polish i craft floor, jednorazowy detektor
  oraz przegląd zrzutów. Zachowano motywy i typografię zaakceptowanego 3a;
  ostrzeżenia detektora nie są samodzielnym dowodem błędu.
- Decyzje i wykonany zakres zapisano w HOMEPAGE-CMS-CONFIG.md. Nie wykonano
  migracji Astro/Sanity/Markdown, konfiguracji Content Lake, commita, pusha
  ani publikacji. Lokalne podglądy działają pod 127.0.0.1:8766.
- Natywny zoom, czytnik ekranu, fizyczny telefon i Lighthouse/CWV niewykonane.
  Następny krok: odbiór ujednoliconej serii i treści, następnie migracja wspólnych
  komponentów do Astro i referencji Sanity zgodnie z planem.

## Design system docelowej strony 3a — 2026-10-07

- Decyzja użytkownika: realizujemy stronę zgodną z wariantem 3a i opracowanymi
  podstronami. Warianty 01, 1a, 02, 2a i 03 porzucone. Zapisano bieżące wartości
  w HOMEPAGE-CMS-CONFIG.md, DESIGN.md, planie, AGENTS.md i obu README.
- Wonderful przeniesiono w całości do `archive/wonderful-design-system`, ze źródłami,
  tokenami, katalogiem i dowodami. README oznacza go jako wycofany i nieprzeznaczony
  do implementacji. Poprawiono odnośniki. Historyczne propozycje HTML pozostają
  dostępne jako archiwum; usunięto wybór kierunku z aktywnego homepage/stopek 3a.
- [Nowy system](../design-system/README.md): jedno źródło tokens.json z pochodzeniem,
  generowany CSS, palety light/dark, Switzer, globalny CSS i Layout3a. Wykonano
  21 komponentów Astro, typowane API, stany, responsywność i lokalne skrypty
  menu/motywu/karuzeli. Żywy katalog `/design-system/` demonstruje system.
- Specyfikacja, API komponentów, ruch i mapa ośmiu mockupów → szablony Astro
  określają granice oraz kolejność migracji. Aktywna aplikacja i mockupy 3a nie
  importują archiwum Wonderful. Aliasy `--wf-*` pochodzą z nowego JSON i utrzymują
  działanie przejściowego prototypu; `/ui/` wskazuje katalog docelowy.
- Końcowa kontrola katalogu: 60 układów w Chromium/Firefox/WebKit, 320/390/768/
  1024/1440 px, light/dark, CSS zoom 100/200%, bez overflow; trzy listy błędów
  JS/zasobów puste. Zrzuty desktop/mobile, obu palet i wspólnych sekcji obejrzano.
  Artefakty: `output/design-system-3a/2026-10-07/` (QA i pierwsza runda).
- Pełne `npm run verify` na Node 24: PASS, 57 unit i 81 E2E, w tym 24 nowe
  przypadki katalogu. Axe 18 widoków katalogu bez naruszeń; menu/FAQ/karuzela/motyw,
  brak JS/reduced motion i stary katalog przechodzą. Log końcowy:
  `/private/tmp/ola-ds3a-verify-complete.log`. Budżety bez zwiększania limitów:
  JS 4694 B gzip, CSS 16925 B gzip, statyczne primitives bez script.
- Początkowe kontrole ujawniły min-content newslettera, ściskanie karuzeli,
  kontrast zagnieżdżonego dark i zawijanie tekstu w starym katalogu po migracji
  aliasów. Naprawiono kod i generator. Escape w Safari przeniesiono na document
  zgodnie ze sprawdzonym zachowaniem mockupów. Zbyt długi zbiorczy test axe Firefox
  rozdzielono na niezależne przypadki motywu/szerokości, bez zmiany timeoutów,
  retry i asercji. Nie wyłączano czerwonych testów.
- Sandbox blokował porty/przeglądarki i logi Wrangler (EPERM); końcowy pełny przebieg
  wykonano z przyznanym zezwoleniem. Początkowy format-check wykrył sześć dłuższych
  linków do przeniesionego archiwum; sformatowano pliki i powtórzono bramkę.
- Impeccable extract: odczyt kontekstu/craft floor, wyodrębnienie z kodu i mockupów,
  dwie rundy zrzutów oraz jeden detektor. Jeden sygnał side-tab dotyczy zachowanego
  grzbietu okładki produktu, nie dekoracji karty; nie zmieniono zaakceptowanego frontu.
- Dokumentacja: Prettier i diff-check PASS; 178 lokalnych odnośników w 15
  dokumentach istnieje. Nie sprawdzano zewnętrznych URL ani wszystkich kotwic.
- Pakowanie feedbacku PASS: 48 publicznych plików. Sprawdzone komendy katalogu
  i generatora w README. Lokalny dev katalogu działa na 4322; ponownie uruchomiony
  podgląd mockupów na 8766 obsługuje nowe tokeny. Zlecono otwarcie katalogu w Codex
  (queued). Zachowano pozostałe lokalne zmiany użytkownika.
- Nie przeniesiono jeszcze wszystkich docelowych stron, nie konfigurowano Sanity,
  Content Lake, backendu formularzy ani serializerów nowych szablonów.
  Bez commita, pusha i publikacji. Natywny zoom, czytnik, fizyczne urządzenie
  i Lighthouse/CWV niewykonane; nie deklarujemy pełnej zgodności WCAG.
- Następny etap: migracja homepage 3a do Layout3a/wspólnego shell i istniejących
  modeli treści, potem pozostałe szablony według ASTRO-INTEGRATION.md.

## Audyt planu migracji stron i treści — 2026-10-07

- Sprawdzono plan, postęp, design system i mapę Astro/Sanity, instrukcje CMS,
  publiczne widoki, routing preview, rejestr schematów, GROQ i mappery.
- Plan częściowo odpowiadał nowemu kierunkowi, ale nie miał bieżącego etapu
  łączącego szablony z rzeczywistym importem treści. Początek postępu nadal
  wskazywał Wonderful i zlecenie kolekcji e-booków; końcowe kroki były powielone.
- Dodano etap 4a: siedem szablonów z ośmiu mockupów, zależności modeli,
  cykl schema/GROQ/TypeGen → Astro/Markdown → szkice CMS → preview → QA.
  Rozdzielono wykonanie kodu od przeniesienia danych i publikacji.
- Doprecyzowano import z trwałymi ID, mediami, referencjami, kopią i próbą bez
  zapisu; istniejące dokumenty i zmiany redakcyjne trzeba zachować.
- W HOMEPAGE-CMS-CONFIG zapisano decyzję o przenoszeniu treści z mockupów
  i zastąpiono nieaktualną nawigację kotwicową globalnymi celami podstron.
  Uzgodniono kolejność i cykl odbioru w ASTRO-INTEGRATION.
- Zmiany tylko dokumentacji; zachowano zastane lokalne zmiany. Nie odczytywano
  CMS na żywo, nie uruchamiano aplikacji, nie zmieniano schematów ani danych.
  Bez commita, pusha i publikacji.
- Kontrole dokumentacji: Prettier czterech zmienionych dokumentów PASS;
  81 lokalnych odnośników prowadzi do istniejących plików; diff-check PASS.
  Nie sprawdzano zewnętrznych URL ani kotwic. `npm run verify` niewykonane
  zgodnie z zasadą dla zmian wyłącznie dokumentacji; wyniki wcześniejszego
  verify systemu 3a pozostają historyczne, nie są wynikiem tej sesji.

## Bezpośredni zapis aktualizacji planu na main — 2026-10-07

- Na polecenie „merguj do main bez pr” przygotowano osobny indeks Git
  z czterema dokumentami audytu planu. Repo już jest na main; PR nie jest potrzebny.
- Z zakresu commita wyłączono zastane notatki wcześniejszych scaleń i zmiany
  skillów oraz raporty. Pliki robocze pozostają zachowane.
- Kontrole dokumentacji i lokalnych odnośników przeszły; brak zmian aplikacji,
  konfiguracji Sanity i publikacji strony. Następny krok to pakiet 1 etapu 4a.

## Bezpośredni zapis aktualizacji skillów na main — 2026-10-07

- Polecenie użytkownika: scalić lokalne zmiany skillów do main; zgodnie
  z wcześniejszym ustaleniem bez PR. Zakres: 13 skillów Cloudflare,
  227 zmienionych i 15 usuniętych plików oraz skills-lock.json.
- Sprawdzono metadane SKILL.md, poprawność JSON i zgodność zestawu zmienionych
  skillów z 13 aktualizacjami computedHash. Nie weryfikowano ponownie algorytmu
  hashy instalatora ani zewnętrznych URL; 632 lokalne odnośniki poprawne.
- Diff-check zgłosił jedno zachowane z poprzedniej wersji źródła Markdown
  łamanie wiersza dwiema spacjami w sandbox-stable/SKILL.md. Nie zmieniano
  importowanych źródeł ani ustawień kontroli białych znaków. Skille i lockfile
  są wyłączone z Prettier zgodnie z .prettierignore; format tej notatki sprawdzony.
- Osobny indeks zawiera tylko skille, lockfile i ten zapis postępu.
  Zastane notatki wcześniejszych PR, raporty i materiały pozostają poza commitem.
  Nie zmieniono kodu aplikacji ani CMS, nie publikowano strony i nie uruchamiano
  npm run verify (zakres referencyjnych skillów i dokumentacji).
- Następny krok implementacji pozostaje bez zmian: pakiet 1 etapu 4a.

## Pakiet 1 etapu 4a — 2026-10-07

Kod i fixture’y, bez zapisu Content Lake i bez publikacji.

- Modele: dokument `ebook`; rozszerzenia `service` (cena/czas/booking),
  `testimonial` (anonimowość, podpis, zakres), `author` (uczelnia/kierunek),
  `siteSettings` (headerCta, legalLinks), `form` (checkbox zgody), sekcje
  `ebooksSection` i `serviceOfferSection` oraz opcjonalne pola hero/textImage/
  logos/metrics. GROQ publiczny i preview, TypeGen, mappery.
- UI: `SiteShell3a` na `Layout3a`; `Homepage3a` ze składanych komponentów 3a
  i scoped CSS. Preview `[...locale].astro` używa tego samego ComposedPage.
  Nawigacja homepage to kotwice do czasu pakietów 2–5.
- Markdown: serializery i przykłady nowych typów; nieznany blok zatrzymuje build.
- Import: `npm run import:homepage` dry-run, 34 dokumenty PL/EN, raport braków
  w `reports/` (gitignored). Porównanie Content Lake pominięte — brak tokenu
  w tej sesji. Fixture ≠ dowód zapisu CMS.
- `npm run verify`: PASS (przed rebase i po rebase na `main` / `8a989fa`).
  Format, tokeny, ESLint, Astro/TS wszystkich workspace’ów, 64 unit tests,
  build 23 stron, Studio, preview, Worker dry-run, budżety JS 5770 B /
  CSS 17875 B gzip, 81 E2E Chromium/Firefox/WebKit, axe na `/` przy
  320/390/1440, reduced motion i CSS zoom 200% (katalog), formularz
  newslettera bez POST, treść bez JS.
- Rebase PR #27 na `origin/main` (2026-10-07): mergeable było CONFLICTING.
  #25 (design-system 3a) był już w merge-base. Auto-merge #26 (verify-ola):
  README, catalog-dialog, design-system, language, static-page. Jedyny
  konflikt treści: `.cursor/skills/verify-ola/features/home-form.md`.
  Rozwiązanie: kroki newslettera pakietu 1 (przycisk, e-mail, zgoda) oraz
  gotche #26 (`browser context` nie czyści POST; katalog `/ui/` i `/en/ui/`
  mają inne copy). Zachowanie pakietu 1 bez zmian. Draft, bez scalania.
- verify-ola `ola-1791384765`: doctor PASS na porcie 4340. Formularz e-mail+zgoda,
  status „Dane poprawne. Nic nie wysłano.”, `posts []`, przełącznik PL/EN,
  przycisk disabled bez JS. Zrzuty: `/opt/cursor/artifacts/screenshots/`.
  CLI verify-ola nie ma viewportu; 320/390/1440 i axe homepage są z Playwright.
  Paleta ciemna homepage nie dotyczy cherry-white. Natywny zoom, czytnik i
  urządzenie fizyczne — niesprawdzone.

Ustalenia zachowane: 450 zł/60 min, 97 zł brutto, 450+, Cal.com jako placeholder,
formularz demonstracyjny. Copy EN i tytuły e-booków oznaczone jako robocze.

Luki (nie blokują komponentów): URL płatnej rezerwacji, skan dyplomu, prawdziwe
URL social, pliki e-booków, zaakceptowane artykuły. Nawigacja do `/o-mnie/`,
`/konsultacje/`, `/ebooki/` czeka na pakiety 2–5.

Otwarte w pakiecie 1 (dane, nie kod): import szkiców do Content Lake po
porównaniu z istniejącymi dokumentami; odbiór edycji w Studio i chronionym
preview z prawdziwym datasetem.

## Pakiet 2 etapu 4a — 2026-10-07

Kod i fixture’y, bez zapisu Content Lake i bez publikacji.

- Inwentaryzacja: `about-3a.html` + [ABOUT-MOCKUP-PLAN-3A](ABOUT-MOCKUP-PLAN-3A.md)
  / [ABOUT-EEAT-3A](ABOUT-EEAT-3A.md). Uczelnia i kierunek potwierdzone,
  450 zł/60 min oraz tymczasowy Cal.com zachowane. Copy EN robocze.
  Brak skanu dyplomu — ramka zastępcza, bez fikcyjnego pliku.
- Modele: wspólny `author` (`educationInstitution`/`educationProgram`/`diplomaScan`),
  `credentialsSection`, wariant `cards` `links`, opcjonalna `process.note`,
  `serviceOffer.secondary`. Slugi `o-mnie`/`about` w allowlist Studio.
  GROQ publiczny i preview, TypeGen, mapper `mapAbout`.
- UI: `About3a` na `Layout3a`/`SiteShell3a`; preview `page` o slugu about
  używa tego samego `ComposedPage`. Nawigacja homepage i CTA
  „Poznaj moją historię” prowadzą do `/o-mnie/` i `/en/about/`.
- Markdown: serializer i przykład `credentialsSection`; nieznany blok
  zatrzymuje build.
- Import: `npm run import:about` dry-run, 4 dokumenty (`author`/`page` PL/EN),
  `write: false`. Porównanie Content Lake pominięte — brak tokenu w tej sesji.
  Raport braków w `reports/` (gitignored). Fixture ≠ dowód zapisu CMS.
- `npm run verify` na Node 24.21.0: format, tokeny, ESLint, Astro/TS
  wszystkich workspace’ów (156 plików, 0 diagnostyki), 68 unit tests,
  build 25 stron (w tym `/o-mnie/` i `/en/about/`), Studio, preview,
  Worker dry-run, budżety JS 5770 B / CSS 18826 B gzip. Pierwszy
  `test:e2e` przerwał się na braku binariów Playwright; po
  `npx playwright install` i `install-deps`: **84 E2E PASS**
  (Chromium/Firefox/WebKit), w tym PL/EN About, 404 `/en/o-mnie/`,
  Cal.com i newsletter bez POST.
- verify-ola `ola-1791387828`: doctor PASS na porcie 4340. CTA homepage
  otwiera H1 About; ARIA nawigacji ma `/o-mnie/`; ramka dyplomu, uczelnia,
  450 zł / 60 minut, `href=https://cal.com`, `posts []` po newsletterze;
  EN H1 bez polskiego leadu; `/en/o-mnie/` status 404; treść bez JS.
  Nagłówek „O mnie” ma `aria-current="page"` (e2e + locator Playwright).
  Viewport CLI: 1280×900. Axe i overflow 320/390/1440 px w tym przebiegu
  dotyczą `/` i katalogu, nie osobno About3a. Natywny zoom, czytnik i
  urządzenie fizyczne — niesprawdzone.

Luki (nie blokują komponentów): skan dyplomu, URL płatnej rezerwacji,
strona kontaktu (tymczasowo `/#konsultacje`), copy EN do akceptacji,
trasa kolekcji e-booków (tymczasowo `/#ebooki` do pakietu 5).

Otwarte w pakiecie 2 (dane, nie kod): import szkiców do Content Lake po
porównaniu z istniejącymi dokumentami autora; odbiór edycji w Studio
i chronionym preview z prawdziwym datasetem. Bez publikacji.

## Pakiet 3 etapu 4a — 2026-10-07

Kod i fixture’y, bez zapisu Content Lake i bez publikacji. Gałąź
`cursor/consultation-3a-0940`, draft PR, bez merge.

- Inwentaryzacja: `consultation-3a.html` + [CONSULTATION-CMS-CONFIG-3A](CONSULTATION-CMS-CONFIG-3A.md).
  Cena 450 zł / 60 minut i tymczasowy `https://cal.com` z istniejącego
  dokumentu `service`; wskaźnik 450+ i opinie 4 i 6 jak na homepage/About.
  Copy EN robocze.
- Modele: bez nowego `_type`, `pricingSection` i drugiej usługi. Warianty
  `textImageSection` `questions`, `cardsSection` `situations`/`goals`
  (karty bez linków i zdjęć, `closing`), opcjonalne `media` w przebiegu,
  `expertSection` z `intro`, `metric` i referencją autora,
  `serviceOfferSection.note`. Slugi `konsultacje`/`consultations` w allowliście.
  GROQ publiczny i preview, TypeGen, typy i mappery z typowanymi wariantami.
- UI: `Consultation3a` na `SiteShell3a`; preview używa tego samego
  `ComposedPage`. Nagłówek z lokalnymi kotwicami i CTA „Konsultacja · 450 zł”
  → `#cena`; stopka z pełną nawigacją i `aria-current`. Nawigacja homepage
  i „Poznaj konsultacje” prowadzą do `/konsultacje/` i `/en/consultations/`.
  JSON-LD `WebPage`/`Service`/`Offer`/`FAQPage` z widocznych danych.
  Brak formularza i potwierdzenia rezerwacji; placeholder Cal.com opisany
  przy hero i cenie.
- Markdown: serializer mapy pytań, kart tekstowych, wskaźnika i notatki;
  nieznany blok zatrzymuje build.
- Import: `npm run import:consultation` dry-run, 2 dokumenty
  (`page-consultation-pl/en`), `write: false`, exit 0; `--write` exit 2.
  Porównanie Content Lake pominięte, brak tokenu w tej sesji.
- `npm run verify` na Node 24.21.0: PASS. Format, tokeny, ESLint, Astro/TS
  (163 + 11 plików, 0 diagnostyki), 74 unit tests w 15 plikach, build
  27 stron, Studio, Worker dry-run, budżety JS 5770 B / CSS 20155 B gzip
  (limit 20480), **87 E2E PASS** (Chromium/Firefox/WebKit), w tym PL/EN
  konsultacji, natywne FAQ, brak POST i 404 `/en/konsultacje/`.
  Firefox i WebKit doinstalowane w tej sesji przez `npx playwright install`.
- verify-ola `ola-1791391606`: doctor PASS na porcie 4340, Node 24.21.0.
  Homepage „Poznaj konsultacje” ma `href=/konsultacje/` i otwiera H1 landingu.
  Przepis [consultation.md](../.cursor/skills/verify-ola/features/consultation.md):
  dwa Cal.com, CTA „Konsultacja · 450 zł” → `#cena`, `aria-current=page` na
  „Konsultacje” w stopce, 6 FAQ `group`, `posts []`, EN H1 bez polskiego leadu,
  `/en/konsultacje/` status 404. Treść i 450 zł bez JS. About nadal rezerwuje
  przez Cal.com. Dowody: `/tmp/ola-verify-evidence/ola-1791391606/`.
  Viewport CLI: 1280×900. Axe/overflow 320/390/1440 px w tym przebiegu nie
  powtarzano (są w `npm run verify` / E2E). Natywny zoom, czytnik i urządzenie
  fizyczne — niesprawdzone.

Luki (nie blokują komponentów): URL płatnej rezerwacji, pisemne
podsumowanie po spotkaniu, potwierdzenie zakresu i FAQ, copy EN, strona
kontaktu, nagłówek „60 minut” jako tekst obok `durationMinutes`. Budżet CSS
ma około 325 B zapasu, bo CSS trzech szablonów 3a trafia do jednego pliku;
pakiet 4 musi go podzielić albo odchudzić.

Otwarte w pakiecie 3 (dane, nie kod): zapis szkiców `page-consultation-*`
do Content Lake po porównaniu, odbiór w Studio i chronionym preview
z datasetem. Bez publikacji.

## Pakiet 4 etapu 4a — 2026-10-07

Kod i fixture’y, bez zapisu Content Lake i bez publikacji. Gałąź
`cursor/ebook3a-landing-08b1`, draft PR, bez merge.

- Inwentaryzacja: `ebook-3a.html` + [EBOOK-CMS-CONFIG-3A](EBOOK-CMS-CONFIG-3A.md).
  Cena **97 PLN brutto**, temat `pcos`, status `planned`, tytuł „Suplementy
  w PMOS (PCOS)” / „Decyzje, które mają sens”. Copy rozdziałów, kart i EN jest
  **propozycją**. Opinie 4 i 6 ze współpracy, nie recenzje produktu.
- Modele: rozszerzenie istniejącego `ebook` (rozdziały, materiały, źródła,
  dostarczenie, checkoutUrl) oraz obiekt `ebookLanding` wariantu `cherry3a`.
  GROQ publiczny i preview, TypeGen, mapper `mapEbook`. Brak drugiego typu
  produktu. Checkout i płatny PDF nie wchodzą do fixture’ów.
- UI: `Ebook3a` na `SiteShell3a`/`Layout3a`; preview używa tego samego
  `EbookPage`. Trasy `/ebooki/suplementy-w-pcos/` i
  `/en/ebooks/supplements-in-pcos/`. Karty homepage używają `ebookPath`,
  nie kotwic. Status `planned`: natywne `details` bez checkoutu i bez
  potwierdzenia zakupu. JSON-LD `Product`/`Offer` z `OutOfStock`.
- Markdown: serializer landingu i przykład; nieznany wariant zatrzymuje build.
- Import: `npm run import:ebook` dry-run, 2 dokumenty
  (`ebook-suplementy-w-pcos-pl/en`), `write: false`, exit 0; `--write` exit 2.
  Porównanie Content Lake pominięte, brak tokenu w tej sesji.
- Budżet CSS, 2026-10-07 (pierwsza iteracja pakietu 4): Quality padało na
  `CSS budget exceeded: 21564 B gzip` przy limicie 20 KiB. Butelki i orbita
  wtedy nie weszły. Decyzja Grzesia z tej samej doby: nic nie może wypadać
  z designu 3a; limit podniesiony tymczasowo do **32 KiB gzip** na etap 4a
  (pakiety 5–7), bez optymalizacji teraz.
- `npm run verify` na Node 24.21.0: PASS. Format, tokeny, ESLint, Astro/TS
  (172 + 11 plików, 0 diagnostyki), 82 unit tests w 16 plikach, build
  29 stron, Studio, Worker dry-run, budżety JS 5770 B / CSS **20429 B gzip**
  (zapas 51 B). **90 E2E PASS** (Chromium/Firefox/WebKit), w tym PL/EN
  landingu, karta homepage → `/ebooki/suplementy-w-pcos/`, natywne `details`
  zakupu, brak POST i 404 `/en/ebooki/suplementy-w-pcos/`. Playwright deps
  doinstalowane w tej sesji (`npx playwright install-deps`).
- verify-ola `ola-1791399453`: doctor PASS na porcie 4340, Node 24.21.0.
  ARIA homepage: oba linki karty „Suplementy w PMOS (PCOS)” mają
  `href=/ebooki/suplementy-w-pcos/` (nie kotwica). Landing PL: H1 „Zrób
  porządek z suplementami.”, CTA nagłówka „E-book · 97 zł” → `#cena`, cena
  97 zł, `posts []`. EN H1 „Put your supplements in order.” bez polskiego
  leadu. `/en/ebooki/suplementy-w-pcos/` status 404. Treść i 97 zł bez JS
  (H1 matched, ARIA zawiera 97). `click --role button` na zakup nie trafia
  (`summary` jako `group`); otwarcie potwierdzone w E2E. Dowody:
  `/tmp/ola-verify-evidence/ola-1791399453/`. Viewport CLI: 1280×900.
  Axe/overflow 320/390/1440 px w tym przebiegu nie powtarzano (są w
  `npm run verify` / E2E). Natywny zoom, czytnik i urządzenie fizyczne —
  niesprawdzone.

Luki (nie blokują komponentów): checkout, płatny plik, finalne copy EN,
kolekcja `/ebooki/` (pakiet 5), skan dyplomu, URL rezerwacji. Zapas CSS
51 B nie mieści pakietu 5.

Otwarte w pakiecie 4 (dane, nie kod): zapis szkiców e-booka do Content Lake
po porównaniu, odbiór w Studio i chronionym preview z datasetem. Bez publikacji.

## Wyrównanie makiet 3a i SVG — 2026-10-07

Decyzja Grzesia: dekoracje 3a jako SVG (nie CSS), kompletny design Ebook3a
oraz przywrócenie pominięć pakietów 1–3. Draft PR #30, bez merge.

- Limit CSS w `scripts/check-build.mjs`: **32 KiB gzip**, komentarz że
  tymczasowy na etap 4a. `CODE-QUALITY.md` i `IMPLEMENTATION-PLAN.md`
  zaktualizowane. Optymalizacji CSS nie robiono.
- Zasada SVG: `design-system/ASTRO-INTEGRATION.md`, `COMPONENTS.md`,
  kanoniczne miejsce `src/design-system/decorations/`.
- Ebook3a 1:1 z `ebook-3a.html`: orbita i butelki SVG, scena produktu,
  rozdziały z numerami, karta z cieniem SVG, porównanie, cena 88 px,
  znaczniki, strzałki audience, zakup z `ArrowIcon`.
- Pakiety 1–3: `StageBackdrop` zamiast `::before`/div tła, motywy okładek
  SVG, `CheckMark` zamiast `::before`, ścieżka konsultacji jak w makiecie,
  zasoby O mnie ze strzałką, układ wyników homepage jak cherry-white.
- `npm run verify` Node 24.21.0: **PASS**. 180 + 11 plików Astro/TS,
  82 unit, 29 stron, JS **5770 B**, CSS **22810 B gzip** (limit 32768,
  zapas 9958 B). **90 E2E PASS**.
- verify-ola `ola-1791401668`, port 4340, doctor PASS, `posts []`.
  Screenshoty desktop 1280×900 i mobile 390×844: homepage, O mnie,
  konsultacja, landing PL/EN, każda obok makiety. Dowody:
  `/tmp/ola-verify-evidence/ola-1791401668/`. Viewport CLI verify-ola
  to 1280×900; mobile z osobnego Chromium na tym samym `base`.
  Axe/overflow 320/390/1440 px w E2E. Natywny zoom, czytnik i urządzenie
  fizyczne — niesprawdzone.

Audyt pakietów 1–3 po SVG (2026-10-07, wieczór): największe luki z raportu
(mozaika wyników, motywy okładek, scena alt, licznik 92 px, ramka partnerów,
strzałki zasobów, ścieżka konsultacji) były już w kodzie. Dociągnięte
pozostałe różnice vs `cherry-white.html` / `about-3a` / `consultation-3a`:
pille tematów z `aria-current` i zsynchronizowanym scrollem, pozycja karuzeli,
meta karty na krańcach, hover okładki, `mix-blend-mode` logotypów, rząd
kontrolek z grupami/ledem, kadr zdjęć, kąty chmury pytań, strzałka w dół
przy CTA konsultacji. FAQ zostaje przy wspólnym `FaqItem` (+/×), nie chevronie
z makiety konsultacji — to wspólny komponent 3a.

- `npm run verify` po dociągnięciu: **PASS**. CSS **23293 B gzip** / limit 32768
  (zapas 9475 B), JS 5770 B, **90 E2E PASS**.
- verify-ola `ola-1791402970`, port 4340, doctor PASS, `posts []`. ARIA homepage:
  nawigacja „Temat e-booków”, pozycja `1–3 z 6`. Screenshoty desktop 1280×900
  i mobile 390×844 obok makiet. Dowody: `/tmp/ola-verify-evidence/ola-1791402970/`.

## Zdjęcia makiet 3a na produkcji — 2026-10-07

Uwaga Grzesia po porównaniach: zdjęcia z makiet mają być na produkcji w tym
samym miejscu, z tym samym kadrem, proporcjami i wycięciem tła. Te same pliki
co makieta (hashe `src/assets` = `mockups/homepage/assets` / portrety), pipeline
Astro (`SiteImage` + `astro:assets`, `layout="none"`, WebP, `width`/`height`,
lazy poniżej folda). Fallback CMS: klucze fixture `hero|about|contact|food`
oraz logotypy, gdy `mediaObject.image` jest puste. `author.photo` w seedzie
wskazuje `about.webp`. Skan dyplomu **nie został dostarczony** — bez
placeholdera-zdjęcia.

| Zdjęcie z makiety                                            | Plik na produkcji                                                                     | Strona i sekcja                                                                                          | Status                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `hero.webp` (wycięcie tła, 1122×1402, alpha)                 | `src/assets/portraits/hero.webp` → `/_astro/hero.*.webp` (WebP VP8X z alpha, 164 KiB) | Homepage hero; konsultacja hero (desktop i mobile)                                                       | OK, `object-fit: contain` / `center bottom`                               |
| `about.webp` (portret)                                       | `src/assets/portraits/about.webp` → `/_astro/about.*.webp`                            | Homepage „O mnie”; O mnie hero; konsultacja „Po drugiej stronie jest Ola”; landing e-booka PL/EN autorka | OK; ekspert: 520 px / `center 28%` (470/400/340 w breakpointach)          |
| `contact.webp` (wnętrze, 1536×1024)                          | `src/assets/portraits/contact.webp` → `/_astro/contact.*.webp`                        | Homepage panel konsultacji; O mnie panel; konsultacja przebieg                                           | OK; przebieg `object-position: 72% center`, 460/360/320/280 px            |
| `food-editorial.webp` inset                                  | `src/assets/editorial/food-editorial.webp` (identyczny z makietą)                     | Homepage „O mnie”, kadr 220×156 / `right: -56px`                                                         | OK                                                                        |
| `food-editorial.webp` tło okładki `art-nutrition`            | ten sam plik, wariant 320×180                                                         | Homepage karta e-booka „Szczupła, a jednak PMOS (PCOS)”                                                  | OK; `.ao-card__media > img` żeby globalny kadr 1.5 nie nadpisywał okładki |
| `alab.svg`, `uns.png`, `norsan.png`, `norsa.png`, `omni.png` | `src/assets/partners/*` → `/_astro/*`                                                 | Homepage belka marek                                                                                     | OK; SVG poza rasterem, PNG przez pipeline                                 |
| Skan dyplomu                                                 | **brak pliku w repo**                                                                 | O mnie, wykształcenie                                                                                    | Placeholder SVG jak makieta; bez fikcyjnego dokumentu                     |
| Awatary opinii                                               | —                                                                                     | Homepage / O mnie / konsultacja / e-book opinie                                                          | Nie ma w makiecie; nie dodano                                             |

`npm run verify` Node 24.21.0: **PASS**. 183 + 11 plików Astro/TS, 87 unit,
29 stron, JS **5770 B**, CSS **23405 B gzip** (limit 32768, zapas 9363 B),
**90 E2E PASS**. Build wypisał 10 zoptymalizowanych obrazów.

verify-ola `ola-1791404697`, port 4340, doctor PASS, Node 24.21.0, `posts []`
na homepage, konsultacji i landingu e-booka. H1 PL/EN zgodne z fixture.
Screenshoty desktop 1280×900 (verify-ola, fullPage) i mobile 390×844 obok
makiet: homepage, O mnie, konsultacja, ebook PL/EN. Dowody:
`/tmp/ola-verify-evidence/ola-1791404697/`. Viewport CLI verify-ola to
1280×900; mobile z osobnego Chromium na tym samym `base`. Axe/overflow
320/390/1440 px w E2E. Natywny zoom, czytnik i urządzenie fizyczne —
niesprawdzone.

## Następny krok

Pakiet 7 etapu 4a: Article3a (`article-3a.html`), Portable Text, autor,
źródła, related, e-booki, FAQ i newsletter. Limit CSS jest tymczasowo 32 KiB;
optymalizacja później. Import homepage/About/konsultacji/e-booka/kolekcji
bloga do szkiców Sanity dopiero na osobne zlecenie zapisu. Publikacja
treści/strony wymaga osobnego zlecenia.

Otwarte kontrole: handshake Presentation/Access, drugi administrator Sanity,
axe/overflow About przy 320/390/1440 px, natywny zoom, czytnik i fizyczne
urządzenie. Etapy 5–7 domykają SEO/eksport, formularze/c15t i odbiór.
Nie testować n8n ani nie dodawać `www` jako domeny Workera. Nie wklejać
sekretów.

## Zasada aktualizacji

Po sesji uaktualniać ten plik i checklisty: oznaczać tylko wykonane i zweryfikowane
zadania, podawać rzeczywiste wyniki i niewykonane kontrole. Istotne zmiany decyzji
odnotować z datą i powodem. Nie przechowywać sekretów.

## Nowe skille pstack, 2026-10-08

- Zlecono PR i scalenie 52 lokalnie zainstalowanych skillów pstack.
  PR zawiera różnice względem origin/main oraz symlinki Claude/Pi.
- Kontrole: 52 pliki SKILL.md, JSON lockfile i 103 symlinków poprawne.
  Hashy instalatora i zewnętrznych odnośników nie sprawdzano.
- Zachowano pozostałe wpisy lockfile i lokalne zmiany poza zakresem PR.
- Pełna kontrola aplikacji pozostaje zadaniem CI Quality przed scaleniem.
- Następny krok: pakiet 1 etapu 4a.

- Format dokumentacji i 61 lokalnych odnośników poprawne. Diff-check wskazał
  jedną pustą linię na końcu importowanego automate-me/SKILL.md; zachowano źródło.
- Pierwsza próba podpisu 1Password nie powiodła się, commit nie powstał.

## Skill landingów e-booków 3a, 11.10.2026

- Na zlecenie użytkownika przygotowano lokalny
  [ebook-landing-3a](../.agents/skills/ebook-landing-3a/SKILL.md).
  Instrukcja obejmuje brief, copy, wizualną kompozycję, makietę lub istniejący
  szablon Astro, mapowanie CMS i kontrole. Zawiera dziesięć wymaganych sekcji
  oraz samodzielną adaptację siedmiu zasad z `10000000 Sales Copy Advice.md`.
- Format pozostaje zgodny z 3a. Układy hero, podglądu zawartości i efektów
  mogą się różnić. Audyt wymaga cytatów i rozróżnia zasady użyte, częściowe
  i pominięte. Brak osobistej historii autorki nie uzasadnia jej wymyślenia.
- Mapa projektu wskazuje istniejący model `ebook`, renderer, mapper, Markdown
  i fixture. Zwraca uwagę na teksty PMOS (PCOS) w seedzie i tymczasowe treści innych
  produktów. Samo wywołanie skilla nie zleca zapisu do CMS ani publikacji.
- Kontrole: `quick_validate.py` PASS, Prettier PASS dla czterech plików skilla,
  24 lokalne odnośniki poprawne, metadane UI poprawne. Zmiana dotyczy instrukcji
  i dokumentacji; nie uruchamiano `npm run verify` ani testów nowego landingu.
- Nie zmieniano aplikacji ani Sanity. Blokad brak. Następny krok w tym zakresie
  to użycie skilla dla kolejnego ebooka i weryfikacja rzeczywistego rezultatu.

- Na kolejne polecenie użytkownika wydzielono zakres skilla do osobnej gałęzi
  na aktualnym `origin/main`. Pozostałe lokalne zmiany dokumentacji SEO
  zachowano poza tym zakresem. Scalenie przez PR wymaga zielonej kontroli Quality.

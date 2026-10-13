# Kontener GTM Oli

Kontener `GTM-PWBRPZ29`, workspace 5
[Nowa strona Ola • c15t 2026-10-11](https://tagmanager.google.com/#/container/accounts/6057592803/containers/197326666/workspaces/5/tags).
12.10.2026 pobrano kopię workspace oraz opublikowanej wersji 3.
Konfiguracja workspace przed zmianą odpowiadała eksportowi z 11.10.2026.
Kopie są poza repo w `/private/tmp/ola-gtm-workspace5-before-2026-10-12.json`
i `/private/tmp/ola-gtm-published-v3-before-2026-10-12.json`.

`ola-container.json` zawiera dwa natywne tagi GA4 i ręczny PageView Meta.
Pierwszy import zmienił tylko dwa tagi GA4 w workspace 5. Kolejny import dodał
tag Meta, trigger i zmienną zgody, bez modyfikacji ani usuwania innych elementów.
Ponowny eksport z 12.10.2026, 20:48 UTC potwierdził zapis i `ONCE_PER_LOAD`.
Opublikowana wersja 3 pozostaje bez zmian. Flaga
`AO rollout approved` pozostaje `false`. Sam eksport nie oznacza aktywacji.

## Kontrakt tagów

Google tag ID 51 używa `G-9QW05JYZTL`. Wyłącza `send_page_view`, Google Signals
i personalizację reklam. Tag zdarzenia ID 53 wysyła ręczny `page_view`, bez
e-commerce. Oba działają raz na dokument i wymagają `analytics_storage`.
Zdarzenie ma Google tag jako zależność konfiguracji, z zatrzymaniem przy błędzie.

Oba tagi używają syntetycznego `page_location`
`https://aleksandraolesiewicz.com/m/{{AO page code}}`, kontrolowanego kodu jako
tytułu i pustego `page_referrer`. Kody `home`, `about`, `blog-index`,
`blog-article`, `ebook-index`, `ebook-detail` nie zawierają sluga, tematu choroby,
identyfikatora treści, query ani wartości formularzy.

Reguły wymagają właściwego zdarzenia, hosta `aleksandraolesiewicz.com`,
`ao_measurement=true` i `AO rollout approved=true`. Nie obejmują stagingu.
Nie ma All Pages, tagów Consent Mode, client_id formularzy, Google Ads,
Conversion Linkera ani Clarity. c15t i Astro posiadają stan zgód.

Serwer dopuszcza sześć rodzajów stron, ze wspólnymi wykluczeniami prawnymi,
kontaktu, konsultacji, odstąpienia i flagą CMS „Bez pomiaru”. Newsletter nie
wyklucza strony. Preview i widoki bez polityki pozostają wyłączone.
`PUBLIC_GTM_ENABLED` domyślnie pozostaje `false`. Workflow bierze tę zmienną
z GitHub wyłącznie dla production. Wyłączona flaga blokuje loader po każdej zgodzie.

## Odczyt GA4, 12.10.2026

Potwierdzono konto `332767742`, usługę `462835494`, strumień `9802578320`
i identyfikator `G-9QW05JYZTL`. Brak dodatkowych połączonych tagów.
Google Signals jest wyłączone. Zbieranie danych przekazywanych przez użytkowników
jest niedostępne dla tej kategorii branży.

Wyłączono pomiar zaawansowany oraz personalizację reklam we wszystkich
307 regionach. Zdarzenia mają retencję dwóch miesięcy. Użytkownicy mieli
retencję 14 miesięcy z resetem przy aktywności. Po zatwierdzeniu właściciela
zapisano dwa miesiące bez resetu; odczyt po reload potwierdził ustawienia.
Zmiana może usunąć starsze dane po upływie okresu retencji.

## Odbiór i aktywacja

Przed aktywacją wymagane są spójne opublikowane teksty prawne,
odbiór rzeczywistych żądań GA4 z blokadą wysyłki i zgoda na publikację.
Testy c15t/GTM używają atrap i blokują produkcyjne leady oraz telemetrię.
Nie uznawać bezpiecznego dataLayer za dowód payloadu zewnętrznego SDK.

Publikacja kontenera, włączenie jego rollout oraz zmiennej GitHub są oddzielnymi
czynnościami od stworzenia PR. PR GTM #86 wskazuje main. Kolejny PR Meta
wskazuje gałąź GTM. Clarity pozostaje osobnym zakresem. Syntetyczny adres GA4
nie zmienia adresów zbieranych przez inne SDK.

Podstawy techniczne: [Basic Consent Mode](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic),
[konfiguracja GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config),
[schemat tagów GTM](https://developers.google.com/tag-platform/tag-manager/api/reference/rest/v2/accounts.containers.workspaces.tags).
Pełny [plan wdrożenia](../../docs/GTM-C15T-DEPLOYMENT-PLAN.md).

## Odbiór Meta, 12.10.2026

Potwierdzono zestaw danych „aleksandraolesiewicz homepage”,
`2915257895296567`, właściciel Longevity Goddess `262228866199050`,
konto reklamowe Aleksandra Olesiewicz dietetyka `933541432132948`.
Konfiguracja Core jest włączona. Nie tworzono tokenów API, połączeń
Conversion API, nowych uprawnień ani kampanii.

Na wyraźne zatwierdzenie właściciela wyłączono automatyczne zaawansowane
dopasowywanie i automatyczne zdarzenia bez kodu. Oba przełączniki pokazują
„Wył.”. Automatyczny przegląd bezpieczeństwa początkowo odrzucił zmianę
zdarzeń bez tej konkretnej zgody; po odpowiedzi właściciela wykonano ją i
odczytano wynik.

Próba prawdziwego SDK 2.9.419 z aktualną publiczną konfiguracją Core
przechwyciła `PageView` przed wysyłką. `dl` i `rl` zawierały wyłącznie
origin, bez ścieżki, query, fragmentu, tytułu i wartości formularza.
SDK ustawia jednak HTTP Referer na origin. Sam `autoConfig=false`
nie usuwa pełnego adresu; kontrolna konfiguracja bez Core ujawniła adres.
Nie przenosić zapewnienia GA4 o pustym referrerze na Meta. Właściciel zatwierdził
same domeny po zgodzie marketingowej. SDK dodaje własny identyfikator cookie
oraz dane urządzenia. Żadne zdarzenie testowe nie wyszło do Meta.

## Ręczny PageView Meta

Tag `AO Meta • PageView` wymaga `ao_marketing=true`, hosta produkcyjnego,
`AO rollout approved=true` i dodatkowej zgody `ad_storage`. Działa raz na
dokument. Nie zawiera noscript, danych użytkownika ani parametrów formularzy.
Wyłącza automatyczną konfigurację i obsługę zmiany adresu przez pushState.

Astro zapisuje jeden stan `aoTrackingState` przed zdarzeniami GTM. Tag sprawdza
`marketing` lub `all` przed pobraniem SDK i ponownie po jego załadowaniu.
`init` i `trackSingle` następują dopiero wtedy. Cofnięcie dowolnej aktywnej
kategorii ustawia nieodwracalny stan `revoked`, wykonuje `fbq('consent', 'revoke')`
i cleanup. Reload czeka na trwały receipt c15t, żeby zachować częściową zgodę.

Test wykonuje dokładny HTML eksportu z rzeczywistym SDK 2.9.419 i aktualną
konfiguracją Core. PageView zawiera same domeny. Formularz nie dodaje zdarzeń.
Cofnięcie zgody przed opóźnioną konfiguracją i awaria konfiguracji nie wysłały
zdarzeń w obserwowanym okresie.
Test jednostkowy uruchamia dokładny HTML eksportu, również po cofnięciu zgody
w czasie pobierania SDK. Nie zastępuje odbioru skompilowanego kontenera.

Core musi pozostać włączone w koncie Meta. Samo `autoConfig=false` nie usuwa
adresów URL. Zmiana SDK lub konfiguracji konta wymaga ponownego odbioru
payloadu przed aktywacją. Oficjalny [szablon Meta dla GTM](https://github.com/facebook/GoogleTagManager-WebTemplate-For-FacebookPixel/blob/main/template.tpl)
potwierdza kolejność `set autoConfig`, `init`, `trackSingle`.

## Kontrolowane źródło AI, 13.10.2026

[Kontrakt źródła AI](../../docs/AI-SOURCE-CONTRACT.md) opisuje pięć kodów
zamiast pełnego referrera. `ai-source-container.json` rozszerza opublikowane
v4, zachowując rollout true. Bazowy `ola-container.json` zachowuje false.
Kampania jest ustawiona tylko w tagu Google 51; page_view dziedziczy ją.
Trzy nowe zmienne czytają i walidują `ao_ai_source` oraz wyprowadzają medium.
Żaden tag nie parsuje referrera. Publikacja nowego kontenera jest w toku.

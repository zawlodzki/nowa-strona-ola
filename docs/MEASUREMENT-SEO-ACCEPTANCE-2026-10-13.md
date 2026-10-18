# Odbiór pomiaru i konfiguracji wyszukiwarek

Data: 13.10.2026. Zakres zlecenia: pomiar i zgody oraz konfiguracja SEO
domeny `aleksandraolesiewicz.com`. Kontrole dotyczą rzeczywistej produkcji
i zalogowanych paneli usług. Nie wysyłano formularzy leada. Opublikowano
wyłącznie dwa dokumenty prawne Sanity 2.4 opisujące zatwierdzony pomiar AI.
Konfigurację usług zmieniano wyłącznie dla domeny Oli.

## Pomiar i zgody

| Kontrola                  | Wynik                                                                                                        | Dowód                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Trwały zapis c15t         | PASS: rzeczywisty POST `/subjects` HTTP 200                                                                  | `consent-receipt-proof.json`                                              |
| Odtworzenie odmowy        | PASS: GET decyzji HTTP 200, `isValid=true`, zgodny identyfikator decyzji i `isLatestPolicy=true`             | `consent-receipt-proof.json`, `consent-denied-restored.png`               |
| Preferencje po reload     | Niezbędne włączone; analityka i marketing wyłączone; baner nie wraca                                         | `consent-denied-restored.png`                                             |
| Tag Assistant             | PASS: połączenie z `GTM-PWBRPZ29` i `G-9QW05JYZTL`; odmowa domyślna przed aktualizacjami i kontenerem        | `tag-assistant-consent.png`                                               |
| Odsłona GA4               | PASS: przesłane `page_view`, adres `/m/home`, tytuł `home`, bez pełnego adresu strony                        | Tag Assistant i raport czasu rzeczywistego                                |
| Raport GA4                | PASS: 1 użytkownik testowy, 4 odsłony `home`, `user_engagement=1`; także `first_visit=1` i `session_start=1` | `ga4-realtime-events.png`                                                 |
| Transport Meta            | PASS: właściwy piksel `2915257895296567`, `PageView` HTTP 200, adres strony i referrer ograniczone do domen  | `meta-http-proof.json`, `meta-network.png`                                |
| Zatwierdzenie domeny Meta | Wykonane: `aleksandraolesiewicz.com` wraz z poddomenami na liście zatwierdzonych                             | Potwierdzenie panelu „Domena … jest teraz dodana do listy zatwierdzonych” |
| Raport Meta               | PASS: raport z 13.10.2026 pokazuje PageView, Aktywne, Przeglądarka, 3 zdarzenia                              | `meta-pageview-report.png`, odczyt około 20:09 CEST                       |

Liczby w GA4 opisują własne otwarcia i przeładowania podczas odbioru,
nie ruch klientek. Potwierdzono rzeczywisty zapis decyzji odmownej na
`https://aleksandraolesiewicz.com`, polityka `olesiewicz_global_opt_in_v1`.
Cookie ma `kind=receipt`, zgodny origin i preferencje. Odpowiedź backendu
potwierdza ważność i aktualną politykę. W dowodach nie zapisano surowych
subjectów, identyfikatorów decyzji, tokenów ani HAR.

Połączona przeglądarka blokowała `gtm.js` przez
`ERR_BLOCKED_BY_CONTENT_BLOCKER`. Nie zmieniano jej blokera. Odbiór tagów
i rzeczywistego odbioru GA4 wykonano w osobnym natywnym oknie Google Chrome.
Tag Assistant obserwował opublikowane tagi Google. Pełny podgląd workspace
GTM sprawdzono później w autoryzowanym podglądzie workspace 4 i po publikacji
wersji 5, przechwytując collect lokalnie.

Meta zgłaszał w diagnostyce potrzebę zatwierdzenia domeny do przetwarzania
zdarzeń. Dodano wyłącznie domenę Oli. Automatyczne zdarzenia i zaawansowane
dopasowywanie pozostają wyłączone. Nie włączano API konwersji ani integracji
serwerowej.

## Wyszukiwarki i boty

| Kontrola                                  | Wynik                                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Weryfikacja domeny                        | Istniejąca usługa domenowa Search Console i witryna Bing; bez ponownej weryfikacji DNS                            |
| Powiązanie GA4 z Search Console           | Istnieje dla właściwej domeny i strumienia                                                                        |
| Sitemap                                   | HTTP 200, `application/xml`, poprawny XML, 23 adresy apex                                                         |
| Bing sitemap                              | **Success**, 23 wykryte adresy                                                                                    |
| Google sitemap                            | PASS: szczegóły mapy potwierdzają sukces, 23 adresy, odczyt 13.10.2026                                            |
| Google live: strona główna                | **Google ma dostęp; stronę można zindeksować**, 19:42 CEST                                                        |
| Google live: sitemap.xml                  | **Google ma dostęp**, 19:56 CEST; nie jest to dowód przetworzenia sitemap                                         |
| Indeksowanie strony głównej               | Prośba przyjęta do priorytetowej kolejki; nie deklarowano zakończonej indeksacji                                  |
| IndexNow                                  | Ostatni deploy: `submitted`, 23 URL; skrypt przed wysyłką zweryfikował opublikowany plik klucza, robots i sitemap |
| Bing AI Performance                       | Raport dostępny, brak danych o cytowaniach                                                                        |
| Googlebot i BingBot w Cloudflare          | Brak blokady w AI Crawl Control                                                                                   |
| Boty odpowiedzi i wyszukiwania AI         | OAI-SearchBot, ChatGPT-User, PerplexityBot i Claude-SearchBot bez blokady                                         |
| Boty treningowe w Cloudflare              | Zapisane blokady GPTBot, ClaudeBot, CCBot i Meta-ExternalAgent                                                    |
| Robots                                    | `search=yes`, `ai-input=yes`, `ai-train=no`; trening wyłączony według D1                                          |
| Crawler Hints                             | Wyłączone; zgłoszenia IndexNow po deployu pozostają właścicielem tej czynności                                    |
| Markdown for Agents i Bot Preference Sync | Wyłączone; własne eksporty i robots pozostają źródłem konfiguracji                                                |

Google pokazywał dla strony głównej stary wynik z 11.10.2026: wykluczenie
przez `noindex`. Test aktualnej wersji potwierdził usunięcie tej blokady.
Sitemap zgłoszono ponownie po potwierdzeniu poprawnego XML, sukcesu Bing
i dostępu Google w teście live. Nie dodawano alternatywnych map ani nie
wyłączano ochrony Cloudflare na podstawie nieustalonej przyczyny błędu.

## Grupa kanałów AI

W GA4 zapisano grupę **AI assistants**, z kanałem o tej samej nazwie na
pierwszym miejscu. Pozostałe kanały mają reguły domyślne. Warunek AI:

- domyślna grupa kanałów równa `AI Assistant`, **lub**
- źródło pasuje do wyrażenia:

```text
^(chatgpt|perplexity|claude|gemini|copilot|(.*\.)?(chatgpt\.com|chat\.openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|copilot\.microsoft\.com))$
```

GA4 ma już wbudowany kanał `AI Assistant`, co potwierdzono w panelu
i [dokumentacji Google](https://support.google.com/analytics/answer/9756891?hl=en).
Nowa grupa korzysta z niego oraz z jawnej listy źródeł z planu. Nie zmieniano
głównej grupy kanałów usługi.

**Wdrożenie:** PR #103 scalono po zielonym CI Node 24; main `5ff332c`
wdrożony na staging i produkcję. Astro przekazuje tylko kod rozpoznanego
asystenta po zgodzie analitycznej. GTM 5 ustawia source i medium referral.
Nie przekazujemy pełnego referrera ani UTM, nie zapisujemy dodatkowej
pamięci źródła. Gdy asystent usuwa referrer, wejście pozostaje nierozpoznane.

Test publicznego skompilowanego GTM: pięć kodów i brak źródła, 6/6 PASS.
Odbiór rzeczywistej strony: późna zgoda, rozpoznane chatgpt i pominięte
nieznane źródło, po jednym page_view i user_engagement. c15t i collect
w tych testach przechwycono lokalnie. Potwierdzono payload, nie gotowe
raporty źródła kampanii. Dowody: `gtm-v5-published.png`,
`ga4-ai-code-channel.png`, `/private/tmp/ola-ai-live-app-proof.json`
i `/private/tmp/ola-ai-live-compiled-proof.json`.

Daty artykułów pozostają zapisane z dokładnością do dnia. Cztery opcjonalne
uwagi Google nie unieważniają BlogPosting. Nie dopisano umownych godzin.

## Dowody i następne kontrole

Katalog lokalny: `/private/tmp/ola-measurement-seo-20261013/`.
Zapis decyzji: `.audit/measurement-seo-20261013.tsv`.

Google potwierdził przetworzenie mapy w szczegółach: sukces, 23 adresy,
ostatni odczyt 13.10.2026. Dowód: `gsc-sitemap-success.png`.
Lista wcześniej pokazywała nieaktualny błąd. Nie zmieniano XML ani WAF.
Kod źródła AI wdrożono; otwarte pozostają okresowe kontrole raportów.
Raport Meta potwierdził 3 PageView z przeglądarki, status Aktywne.
Wykres i lista witryn nadal nie mają danych, dlatego dowodem odbioru
jest tabela zdarzeń, nie kompletność wszystkich raportów Meta. Po 4 i 12
tygodniach plan SEO przewiduje przegląd indeksacji, zapytań i raportów AI.
Nie utworzono automatycznych powiadomień ani nie deklarowano danych,
których usługi jeszcze nie pokazują.

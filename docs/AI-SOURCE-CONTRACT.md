# Rozpoznanie źródła AI w GA4

Decyzja właściciela z 13.10.2026 dopuszcza wyłącznie kod rozpoznanego
asystenta po zgodzie analitycznej. Kod zastępuje źródło kampanii w GA4,
żeby istniejąca grupa kanałów mogła klasyfikować wejście.

## Kontrakt danych

`recognizeAiSource` rozpoznaje dokładne hosty HTTPS:

| Host                             | Kod        |
| -------------------------------- | ---------- |
| chatgpt.com, chat.openai.com     | chatgpt    |
| perplexity.ai, www.perplexity.ai | perplexity |
| claude.ai                        | claude     |
| gemini.google.com                | gemini     |
| copilot.microsoft.com            | copilot    |

Niepoprawny URL, inny protokół, credentials, niestandardowy port i nieznany
host dają brak źródła. Nie parsujemy UTM ani historii przeglądarki.
Przy pustym referrerze wejście pozostaje nierozpoznane. Aplikacja nie tworzy
dodatkowej pamięci źródła w cookies, localStorage ani sessionStorage.

`createAnalytics` wywołuje leniwy odczyt dopiero przy pierwszym dopuszczonym
pomiarze analitycznym. Wpis `consent-update` zawiera kod przed loaderem GTM;
pojedynczy `ao_page_view` zawiera ten sam kod. Odmowa, sam marketing,
wyłączona flaga, wykluczona strona i cofnięta zgoda blokują odczyt.

Google config 51 otrzymuje `campaign_source` i stałe medium `referral`
z walidowanych zmiennych GTM. Brak rozpoznania nie ustawia kampanii.
Tag 53 dziedziczy konfigurację. `page_referrer` pozostaje pusty,
`page_location` syntetyczne `/m/<kod>`, a tytuł równy kodowi strony.
Meta i wykluczenia stron pozostają zgodne z wcześniejszym kontraktem.

## Artefakty i odbiór

`ops/gtm/ai-source-container.json` rozszerza opublikowaną wersję 4
z włączonym rollout. `ops/gtm/ola-container.json` zachowuje rollout false
dla bazowego importu. Eksport release wersji 4 jest niezmienny.
Konfiguracja GA4 została rozszerzona o dokładne kody pięciu asystentów.
Kolejność AI pozostaje pierwsza; główna grupa kanałów nie została zmieniona.

Testy jednostkowe obejmują parser, spoofowane hosty, bramkę zgód
oraz rzeczywiste skrypty zmiennych GTM. E2E używa zablokowanych vendorów
i atrap backendu c15t. Rzeczywisty SDK sprawdza polecenie:

```sh
node scripts/check-ai-source-sdk.mjs
```

Skrypt dopuszcza wyłącznie pobranie oficjalnego SDK Google. Wszystkie
żądania pomiarowe przechwytuje przed wysłaniem, także automatyczne
`user_engagement`. Nie zapisuje surowych identyfikatorów do dowodów.
Pełny adres i markery prywatnych UTM muszą być nieobecne w payloadzie.

Polityka prywatności i lista cookies w fixture’ach mają wersję 2.4.
Sama zmiana fixture’ów nie oznacza opublikowania dokumentów Sanity.
Publikacja kontenera, CMS i strony wymagają osobnego potwierdzenia wyniku.

## Decyzja projektowa

Porównano sanitizację w Astro oraz resolver w GTM. Wybrano Astro,
które już posiada zgodę i wykluczenia. GTM dostaje wyłącznie kod.
Z drugiego wariantu przyjęto alias www.perplexity.ai, medium referral
i pojedyncze ustawienie kampanii w konfiguracji Google.
Zrezygnowano z własnego wymiaru zdarzenia, ponieważ nie zasila reguł
źródła istniejącej grupy kanałów.

Źródła protokołu: [konfiguracja Google Analytics](https://developers.google.com/analytics/devguides/collection/ga4/reference/config)
i [grupy kanałów Google Analytics](https://support.google.com/analytics/answer/13051316?hl=en).

Google Search Console potwierdziło 13.10.2026 przetworzenie sitemap
z 23 adresami. Błąd na liście był nieaktualny; szczegóły mapy pokazały
sukces. Bez zmian XML i ochrony Cloudflare.

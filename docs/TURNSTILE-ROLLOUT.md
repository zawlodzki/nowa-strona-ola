# Zabezpieczenie formularzy Turnstile

Użytkownik zlecił realizację 14.10.2026 po
[ocenie zgodności](TURNSTILE-ASSESSMENT-2026-10-14.md).
Frontend i produkcyjna bramka n8n opublikowane 15.10.2026 na zlecenie użytkownika.
Protokół publikacji (lokalnie poza repozytorium: `.audit/ola-turnstile-production-proof.json`).

## Kształt integracji

Wszystkie formularze używają wspólnego `LeadForm`. Po walidacji pól kontroler
`createLeadProtection(...).submit(send)` renderuje widget Managed i pobiera
token dla konkretnej próby. Dopiero callback poprawnej weryfikacji wywołuje
istniejącą wysyłkę JSON. Demo i honeypot nadal niczego nie wysyłają.
Nowy kontrakt v3 wymaga `turnstileToken` poza `fields` i `consents`.
Token pozostaje tylko w pamięci podczas próby i nie trafia do pomiaru.

Kontroler usuwa widget po zakończeniu próby. Callback starego widgeta nie może
zakończyć nowej próby. Błąd zachowuje dane i `submissionId`, a ponowienie
otrzymuje nowy token. Zamknięcie dialogu anuluje oczekiwanie na challenge,
nie odwołuje już rozpoczętego żądania HTTP.
Wyjątek podczas usuwania widgeta nie zmienia wyniku przyjętego zgłoszenia.

Wybrano wariant pobierania tokena przy wysyłce. Alternatywny wariant leniwego
renderowania przy widoczności wymagał obserwatorów i rozdzielał reset między
kontroler i handler. Dwa szkice oraz niezależna ocena wskazały pierwszy wariant.
Zasada Model the Domain dała pojedynczy stan próby; Boundary Discipline
umieściła obowiązkową walidację w backendzie; Separate Before Serializing
Shared State rozdzieliła pliki frontendowe i generator n8n między autorów.

## Backend i dane

[Generator](../scripts/turnstile-workflow.ts) przygotowuje aktualizację
istniejącego workflow. Wymaga snapshotu z jednym węzłem Webhook i odmawia
nadpisania istniejącego przetwarzania. [Kandydat](../ops/n8n/turnstile/workflow.production.json)
nie ma sekretu i wskazuje zatwierdzony credential production.
Ten graf jest opublikowany w aktywnym workflow produkcyjnym od 15.10.2026.

Utworzono osobny workflow staging `tism0NvfJSKAU0lj`, sześć węzłów,
z własną ścieżką `ola-turnstile-staging-20261014` i wyłączonym zapisem danych.
Rzeczywisty runtime n8n zwrócił 400 przy braku tokena i nieznanym formKey
oraz 503 przy niepodłączonym credential. CORS wskazał wyłącznie staging.
Po tych trzech kontrolach workflow ponownie wyłączono. Nie pobierano danych
wykonań. Dowód w `/tmp/ola-turnstile-staging-negative-proof.json`.

Webhook odpowiada dopiero przez Respond to Webhook. Odrzuca niepoprawny
kontrakt kodem 400, niepoprawną weryfikację kodem 403, a awarię usługi kodem 503. Tylko ścisłe `success === true`, zgodny `action` i dopuszczony `hostname`
prowadzą do 200. HTTP Request wysyła do Siteverify wyłącznie token i sekret
dołączony przez credential `httpCustomAuth`. Zapis danych wykonań jest
wyłączony dla sukcesów, błędów, postępu i prób ręcznych.

Istniejący workflow jest szkieletem odbioru. Integracja nie dodaje dostarczania
newslettera, wiadomości ani obsługi odstąpień. Przygotowany rejestr odcisków zapewnia jednorazowe przyjęcie tokenu dopiero
po wdrożeniu. Nie deduplikuje zgłoszeń z różnymi tokenami i nie dodaje limitu
częstotliwości ani retencji logów infrastruktury.

## Konfiguracja zatwierdzona i utworzona

- Konto Cloudflare `a9280171eee8bfa22ea23290a7ab72c5`.
- Widget Managed `Ola formularze production`, sitekey `0x4AAAAAAFWXvoVPBs0YNBjW`, hostname
  `aleksandraolesiewicz.com`, bez pre-clearance.
- Osobny widget Managed `Ola formularze staging`, sitekey `0x4AAAAAAFWYFaFYPdFsdtYW`, hostnames
  `ola-website-staging.zawlodzki.workers.dev`, `localhost`, `127.0.0.1`.
- Actions identyczne z `formKey`: `newsletter`, `contact`, `withdrawal`, `waitlist`.
- Ustawiono 15.10 publiczny klucz w GitHub environment variable `PUBLIC_TURNSTILE_SITEKEY`,
  osobno dla staging i production. Sekret tylko w credential n8n.
- Credential n8n `Ola Turnstile production` (`eri83sBSbYEoRx7U`)
  i `Ola Turnstile staging` (`eVFPn8fCOItrG6g6`).
  Oba ograniczone do `challenges.cloudflare.com`; sekrety poza repo i czatem.
  Produkcyjny workflow `formularz Ola`, ID `8vE6DwHNx5xqGrod`.
- Staging ma osobny webhook, przekazany przez `PUBLIC_LEAD_WEBHOOK_URL`.
  Nie wolno testować poprzez aktywny produkcyjny webhook.

Bez konfiguracji Sanity i celu wdrożenia lokalny build fixture używa
oficjalnego publicznego klucza testowego. Build wdrożenia wymaga jawnego klucza
widgeta i odrzuca klucze testowe. Sekret nie jest zmienną Astro.
Lokalna symulacja Content Lake używa jawnego nieistniejącego klucza atrapy,
identycznego w obu porównywanych buildach. Nie testuje prawdziwego widgeta.

## Kolejność uruchomienia

1. Odbiór kodu i przygotowanego grafu bez połączeń z produkcyjnym webhookiem.
2. Utworzenie widgetów i zapis sekretów do docelowego magazynu credentials.
3. Izolowany workflow staging z wyłączonym zapisem danych i własną ścieżką.
4. Odbiór rzeczywistego widgeta i n8n, w tym odmowy oraz ponownego użycia tokena.
5. Skoordynowana publikacja frontendu v3 i bramki produkcyjnej.

Nie aktywować wymogu v3 w produkcji przed publikacją frontendu z tokenem.
Obecny frontend v2 zostałby odrzucony. Nie dodawać trwałego wyjątku dla v2,
bo utrzymałby możliwość pominięcia challenge.

## Odbiór

Wyniki bieżącej sesji i niewykonane kontrole są w [postępie](PROGRESS.md).
Testy lokalne zastępują Cloudflare i n8n kontrolowanymi odpowiedziami.
Nie dowodzą wykonania grafu przez zainstalowany runtime n8n.
Przed publikacją wymagane są realne testy na odseparowanym webhooku,
porównanie UI 3a, klawiatura, 320 px, zoom 200% i reduced motion.

Źródła: [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
[widget Managed](https://developers.cloudflare.com/turnstile/concepts/widget/),
[credentials HTTP Request](https://docs.n8n.io/integrations/builtin/credentials/httprequest/)
i [Respond to Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook/).

## Wynik rzeczywistego odbioru

Użytkownik zatwierdził widgety i zapis sekretów. Staging sprawdzono poprzez
rzeczywisty Managed na lokalnym buildzie z publicznym kluczem staging.
Świeży token dał 200, niepoprawny token oraz niezgodny action dały 403.
Powtórny token nadal otrzymał 200; odpowiedź Siteverify zawierała `success: true`.
Przyczyna jest niewyjaśniona. Odbiór replay jest niezaliczony i blokuje publikację.

Po testach staging wyłączono, przywrócono allowlist wyłącznie publicznego hosta
i usunięto tymczasową diagnostykę odpowiedzi. Dane wykonań pozostają wyłączone.
Produkcja nie została zmieniona. GitHub variables nie są skonfigurowane.
Następna kontrola ma wyjaśnić odpowiedź Siteverify i dowieść jednorazowości
na HTTPS staging przed skoordynowaną publikacją.

Generator obsługuje jawny profil lokalny wyłącznie dla stagingu. Przyjmuje dokładny
origin HTTP localhost lub 127.0.0.1 z portem; produkcja nie przyjmuje tej konfiguracji.
Dowody bez tokenów: `/tmp/ola-turnstile-real-staging-proof.json` oraz
`/tmp/ola-turnstile-cloudflare-widgets.jpg`.

Dodatkowy test samego oficjalnego widgeta na istniejącej domenie HTTPS staging
potwierdził ten sam wynik: pierwszy token i replay 200, Siteverify success true.
Nie publikowano frontendu; panel diagnostyczny istniał wyłącznie w karcie
przeglądarki i został usunięty. Dowód `/tmp/ola-turnstile-https-staging-proof.json`.
Blokada jednorazowości dotyczy również HTTPS, nie tylko localhost.

Bezpośrednie Siteverify poza n8n odebrane: świeży token success true,
powtórny token success false z timeout-or-duplicate. Cloudflare spełnia
jednorazowość. Wynik toru n8n nadal wymaga wyjaśnienia i blokuje publikację.
Dowód: `/tmp/ola-turnstile-direct-proof.json` oraz `.jpg`. Kolejna próba API
czeka na odblokowanie istniejącego mountu 1Password; odczyt nie otrzymał N8N_API_KEY.

Po odblokowaniu 1Password API ponownie dostępne. Test identycznego tokenu
zużytego bezpośrednio w Cloudflare nadal dał dwa przyjęcia w n8n. Ponowny zapis
credential przez API, odświeżenie workflow i jawny różny UUID nie usunęły różnicy.
Staging ponownie wyłączony i oczyszczony; produkcja bez zmian. Planowane porównanie
SHA256 jednego klucza w vaultcie zostało odrzucone przez automatyczną kontrolę
uprawnień jako nieautoryzowany odczyt odszyfrowanego credential przez CLI.
Ten odczyt nie został wykonany i wymaga jawnej zgody użytkownika.

## Korekta replay i kandydat PostgreSQL, 14.10.2026

Po osobnej zgodzie porównano SHA256 dokładnie jednego odszyfrowanego credential
staging z kluczem widgeta: identyczne. Sekret przeszedł przez anonimowy pipe
w pamięci, bez pliku, logu, repo ani czatu. Nie powtarzać tego odczytu bez zgody.

Próba tego samego tokenu poza n8n wykazała zależność wyniku od połączenia:
fetch i Axios keep-alive odrzucały drugą próbę na danym połączeniu, a nowe
połączenia Axios akceptowały wcześniej zużyty token. To obserwacja konkretnego
testu, nie potwierdzona diagnoza błędu Cloudflare. Poprzednie przypisanie różnicy
wyłącznie n8n było zbyt wąskie. Oficjalna dokumentacja wymaga globalnej
jednorazowości; odbiór nadal niezaliczony.

Wybrano trwały PostgreSQL zamiast Redis INCR/EXPIRE: istniejący Redis ma AOF
`everysec`, więc może stracić zaakceptowane zajęcie przy awarii. Nowe szkice
[production](../ops/n8n/turnstile/workflow.production.json) i
[staging](../ops/n8n/turnstile/workflow.staging.json) wymagają dwóch osobnych
credentials PostgreSQL i przechowują jedynie SHA256 w osobnych tabelach.
[Zakres uprawnień i powtarzalna próba](../ops/n8n/turnstile/README.md).
Rejestr nie ma automatycznej retencji; rośnie wraz z przyjęciami.

Syntetyczna próba rzeczywistego PostgreSQL 17.10 w kontenerze bez sieci:
32 jednakowe odciski przy równoległości 8, dokładnie 1 przyjęcie; po restarcie
powtórzenie odrzucone. Pozostaje utworzenie zatwierdzonych zasobów i credentials,
odbiór nowych węzłów na stagingu oraz skoordynowana publikacja. Bieżący staging
pozostaje wyłączonym grafem sześciu węzłów; produkcja nie została zmieniona.

Po kolejnej jawnej zgodzie utworzono oba schematy/tabele i role PostgreSQL oraz
credentials `Ola replay production` (`sn5a20V6sGsaOTnJ`) / `Ola replay staging`
(`ebygmaWZbFplBfAk`). Referencje w lokalnych kandydatach podłączone.
Nie zaktualizowano workflow staging: ponowny odczyt API zatrzymał monit Touch ID
1Password, a sesja SSH przerwała kontrolę uprawnień. Stan i następny krok w
[postępie](PROGRESS.md). Produkcja nadal bez zmian.

## Odbiór backendu 15.10.2026

Po przywróceniu dostępu potwierdzono rzeczywiste uprawnienia obu ról i
odebrano 11-węzłowy graf na odseparowanym stagingu: świeży token 200,
powtórzenia 403, osiem równoczesnych żądań 1×200 i 7×403. Brak tokenu 400,
błędny token/action 403, zasymulowany błąd zapisu rejestru 503, po naprawie 200.
Dowód i ograniczenia próby są zapisane lokalnie, poza repozytorium.
Po testach staging wyłączono i usunięto lokalny origin oraz symulację błędu.
Zapis danych wykonań wyłączony. Produkcyjny workflow i publiczny frontend bez zmian.
Następnym krokiem jest konfiguracja publicznych zmiennych wdrożeń i odbiór
frontendu v3; publikacja i aktywacja produkcyjnej bramki wymagają zlecenia.

## Publikacja produkcyjna 15.10.2026

[PR 104](https://github.com/zawlodzki/nowa-strona-ola/pull/104) scalony po obu
Quality SUCCESS i niezależnym PASS+NOTES. Produkcyjny Publish content
[38701609220](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38701609220)
SUCCESS. Frontend opublikowano przed wymuszeniem tokenu w n8n.
Cloudflare version d0f1bfaf-3c3c-45ff-8334-30357df47ac3;
aktywny graf n8n 39af53f7-1377-4f3b-8ac1-a3b8bdf80606, 11 węzłów,
bez zapisu danych wykonań. Staging wyłączony. Kontrola rzeczywistego UI
1280/320 PASS z zablokowaną siecią webhooka, bez produkcyjnego POST.

Chroniony preview ma odrębny hostname poza allowlist widgetu i backendu
produkcji. Wysyłka z niego wymaga osobnej konfiguracji lub trybu demo i nie
jest częścią odbioru domeny publicznej. [Szczegóły i ograniczenia](PROGRESS.md).

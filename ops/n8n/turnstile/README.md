# Bramka Turnstile dla webhooka Oli

`workflow.production.json` to przygotowany kandydat aktualizacji workflow
`formularz Ola`, a nie konfiguracja zapisana do n8n. Credential wskazuje zatwierdzony `Ola Turnstile production`
(`eri83sBSbYEoRx7U`). Plik nie zawiera sekretu,
przypiętych danych, historii wykonania ani danych zgłoszeń.

Generator odmawia pracy, jeśli odczytany workflow ma więcej niż jeden webhook
lub istniejące połączenia. Zachowuje identyfikator i ścieżkę webhooka, opcje
oraz ustawienia workflow; zmienia tryb odpowiedzi, ogranicza CORS do jawnych
domen HTTPS. Jawny profil staging może dodatkowo dopuścić lokalny HTTP
na wskazanym porcie. Generator wyłącza utrwalanie danych wykonań. Wysyłka zgłoszeń pozostaje
poza zakresem: po poprawnej weryfikacji odpowiada dotychczasowym komunikatem
`Workflow was started`.

## Przygotowanie

Po stronie n8n wymagany jest credential typu `httpCustomAuth`. Jego JSON ma
zawierać obiekt `body` z polem `secret`, którego wartość jest rzeczywistym
sekretem widgeta Cloudflare. Sekret wpisuje się wyłącznie w credential n8n;
nie należy umieszczać go w workflow, poleceniu, repozytorium ani logach.

Kandydat dla konkretnego identyfikatora credential powstaje poleceniem:

```sh
node --import tsx scripts/turnstile-workflow.ts \
  /tmp/ola-turnstile-workflow-before.json \
  /tmp/ola-turnstile-workflow-candidate.json \
  production aleksandraolesiewicz.com \
  eri83sBSbYEoRx7U 'Ola Turnstile production' \
  sn5a20V6sGsaOTnJ 'Ola replay production'
```

Polecenie wyłącznie zapisuje nowy plik i odmawia nadpisania istniejącego.
Nie wysyła nic do API n8n ani na webhook. Każda konfiguracja wymaga
podania jawnych domen i referencji credential.
Przed zapisem przez API trzeba ponownie porównać aktualny workflow z odczytem,
sprawdzić referencję credential, zakres CORS i wszystkie połączenia.

## Lokalny staging

Profil `production` albo `staging` jest obowiązkowym argumentem generatora.
Dodatkowy `--local-origin` jest dozwolony wyłącznie dla staging. Produkcja
odrzuca lokalne źródła i hostname tokenów.
Lokalny origin musi mieć format `http://localhost:PORT` albo
`http://127.0.0.1:PORT`, z jawnym niezerowym portem, bez końcowego ukośnika,
ścieżki, danych logowania, query i fragmentu. Z tej samej listy generator
wyprowadza CORS, dozwolone źródła zgłoszeń i lokalne hostname Siteverify.
Inny port, host lub protokół nie przechodzi walidacji źródła.

Przykład dla zatwierdzonego widgeta i credential staging:

```sh
node --import tsx scripts/turnstile-workflow.ts \
  /tmp/ola-turnstile-workflow-before.json \
  /tmp/ola-turnstile-local-staging-candidate.json \
  staging ola-website-staging.zawlodzki.workers.dev \
  eVFPn8fCOItrG6g6 'Ola Turnstile staging' \
  ebygmaWZbFplBfAk 'Ola replay staging' \
  --local-origin http://127.0.0.1:4340 \
  --local-origin http://localhost:4340
```

Generator nadal wymaga oryginalnego snapshotu z jednym webhookiem.
Nie przyjmuje istniejącego grafu przetwarzania. Przed zapisem kandydata
staging trzeba nadać mu osobną nazwę, ścieżkę i `webhookId`, zgodne z istniejącym
workflow staging, oraz porównać jego aktualną konfigurację. Credential staging
i lokalne originy nie należą do workflow produkcyjnego.

## Zachowanie i weryfikacja

Graf zawsze kończy się węzłem `Respond`: brak lub błędny kontrakt daje 400,
odrzucenie Siteverify lub inny hostname/action daje 403, niedostępność,
timeout lub niepoprawna odpowiedź daje 503. Tylko poprawna odpowiedź
Siteverify z `success === true`, dokładną domeną i action równym
zwalidowanemu `formKey` dopuszcza próbę zajęcia odcisku tokenu w bazie.
Tylko pierwsze zajęcie daje 200; powtórzenie daje 403, a awaria rejestru 503. Request do Siteverify ma timeout 10 sekund,
wyłączone przekierowania i sekret dołączany przez credential. Wynik błędu
HTTP również przechodzi do bramki odrzucającej.

```sh
node node_modules/vitest/vitest.mjs run tests/unit/turnstile-workflow.test.ts
```

Testy wykonują faktyczny kod wygenerowanych węzłów i przechodzą graf do
odpowiedzi, zastępując wyłącznie zewnętrzny request lokalnym wynikiem.
Sprawdzają też lokalny staging, dokładny port i izolację produkcji.
Nie wysyłają żądań sieciowych. Nie potwierdzają zgodności wykonania na
konkretnej instalacji n8n: odbiór na odseparowanej instancji pozostaje wymagany.
Wyłączenie zapisu nowych wykonań nie usuwa historii ani nie weryfikuje logów
infrastruktury i globalnej retencji.

Źródła konfiguracji:
[Siteverify Cloudflare](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
[HTTP Request credentials n8n](https://docs.n8n.io/integrations/builtin/credentials/httprequest/),
[HTTP Request n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/).

## Rejestr użycia tokenów — kandydat, bez wdrożenia

Graf zawiera 11 węzłów. Po Siteverify sprawdza też poprawny `challenge_ts`
i wiek od −30 do 300 sekund. Crypto wylicza SHA256, a Set pozostawia wyłącznie
odcisk przed PostgreSQL. Parametryzowany INSERT z kluczem głównym i
`ON CONFLICT DO NOTHING` atomowo dopuszcza jednego zwycięzcę.
Błąd bazy albo niepoprawna odpowiedź nigdy nie prowadzi do 200.

[SQL](replay-ledger.sql) zakłada wcześniej utworzone, osobne role LOGIN
`ola_replay_production_runtime` i `ola_replay_staging_runtime`, bez uprawnień
administracyjnych. Daje im tylko USAGE własnego schematu oraz INSERT/SELECT
kolumny odcisku. Nie tworzy ról ani haseł. Po jawnej zgodzie 14.10.2026 utworzono oba schematy, tabele i role oraz
credentials `Ola replay production` (`sn5a20V6sGsaOTnJ`) /
`Ola replay staging` (`ebygmaWZbFplBfAk`). Hasła przekazano przez anonimowe
pipe wyłącznie w pamięci do PostgreSQL i n8n. Referencje podłączono w plikach
kandydatów; nie oznacza to aktualizacji aktywnego workflow. Kontrola rzeczywistych uprawnień i odbiór n8n PASS 15.10.2026:
świeży token 200, replay 403, osiem równoczesnych prób 1×200 i 7×403,
błąd zapisu 503, po przywróceniu zapytania 200. Staging po próbach wyłączony,
bez lokalnego originu. Dowód odbioru jest zapisany lokalnie, poza repozytorium.

Tabela jest trwała, z `synchronous_commit=on`, bez automatycznego usuwania
odcisków. Nie przechowuje tokenów, kluczy ani danych zgłoszeń. Rośnie o jeden
wiersz na przyjęty token. Polityka usuwania pozostaje otwarta: diagnostyka
Siteverify pokazała ponowną akceptację zużytego tokenu po zmianie połączenia;
nie potwierdzono stabilności czasu jego ważności pomiędzy takimi odpowiedziami.
Włączenie keep-alive nie stanowi zabezpieczenia przed powtórzeniem.

Sprawdzony runner używa wyłącznie własnego kontenera PostgreSQL bez sieci,
z etykietą `com.ola.turnstile.proof` i odpowiadającym mu wolumenem:

```sh
python3 ops/n8n/turnstile/verify-ledger.py \
  ola-turnstile-replay-proof-961dd79c2f --proof /tmp/replay-proof.json
```

Próba 14.10.2026: 32 wywołania tego samego syntetycznego odcisku przy
8 równoczesnych procesach: 1 przyjęty, 31 odrzuconych; 32 różne odciski
przyjęte. Izolacja środowisk i 7 odmów niedozwolonych operacji PASS;
powtórzenie po restarcie odrzucone. Kontener wskazany w przykładzie usunięto
po próbie; kolejne uruchomienie wymaga utworzenia własnego kontenera zgodnego
z kontrolami runnera. Ta próba izolowana nie dowodzi działania węzłów n8n. Osobny rzeczywisty
odbiór Crypto/Postgres na stagingu zakończono 15.10.2026; wynik powyżej.

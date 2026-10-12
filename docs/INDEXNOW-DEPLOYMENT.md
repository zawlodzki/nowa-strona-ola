# Zgłoszenia IndexNow po wdrożeniu

Status 12.10.2026: lokalny odbiór PASS,
[PR #82](https://github.com/zawlodzki/nowa-strona-ola/pull/82) na bazie
[PR #81](https://github.com/zawlodzki/nowa-strona-ola/pull/81). Konfiguracji GitHub
ani indeksacji produkcji nie włączono. Dokument rozwija SEO‑6 z
[planu SEO](SEO-GEO-AEO-PLAN.md). Wyniki są w [postępie](PROGRESS.md).

## Kiedy zgłoszenie jest możliwe

Kod wymaga jednocześnie `DEPLOYMENT_TARGET=production`,
`SITE_INDEXING=production` i poprawnego `INDEXNOW_KEY`. Brak któregokolwiek
warunku kończy komendę wynikiem `skipped` przed odczytem plików i sieci.
Staging dostaje puste zmienne indeksacji i klucza niezależnie od zmiennych repo.

Klucz ma 8–128 znaków z zestawu `A-Z`, `a-z`, `0-9`, `-`. Build generuje
`/<klucz>.txt` tylko przy pełnej konfiguracji produkcyjnej. Plik zawiera klucz
UTF‑8 i ma `X-Robots-Tag: noindex`. Nie należy do sitemap ani do Markdown.
Podgląd SSR nie generuje tej trasy.

W środowisku GitHub `production` do przyszłego uruchomienia należą:

| Ustawienie      | Rodzaj   | Wartość i warunek                                                                         |
| --------------- | -------- | ----------------------------------------------------------------------------------------- |
| `SITE_INDEXING` | Variable | `production` dopiero po odbiorze gotowej produkcji                                        |
| `INDEXNOW_KEY`  | Secret   | Wygenerowany klucz zgodny z protokołem; plik potwierdzający stanie się publicznym zasobem |

Sam merge PR nie ustawia tych wartości. Przed zmianą `SITE_INDEXING` trzeba
odebrać treści i dokumenty prawne, metadane, schematy, sitemap oraz konfigurację
botów. Search Console, Bing i AI Crawl Control pozostają osobnymi zadaniami.

## Przepływ publikacji

Workflow `publish-content.yml` buduje i sprawdza artefakt. Następnie próbuje
odtworzyć migawkę sprzed wcześniejszej próby tego samego uruchomienia.
Przy pierwszej próbie bez artefaktu zapisuje poprzednią opublikowaną sitemap
w pliku tymczasowym joba i zachowuje ją przez 7 dni. Przy ponowieniu brak
oryginalnego artefaktu blokuje capture i powiadomienie. Deploy pozostaje
możliwy. Brak wcześniejszej sitemap z HTTP 404 przy pierwszej próbie oznacza
pierwsze wdrożenie. Pozostałe błędy pobrania zachowują informację o nieudanej
próbie, lecz nie zatrzymują samego deployu.

Po udanym deployu zgłoszenie zawiera sumę poprzedniej i bieżącej sitemap,
bez duplikatów. Obejmuje także adresy usuniętych stron. Nie ucina paczki
większej niż 10 000 URL. Każdy adres musi mieć dokładny kanoniczny origin
produkcji, bez danych logowania, query i fragmentu.

Przed POST kod porównuje publiczny plik klucza, robots.txt i sitemap z
lokalnym buildem. Zasoby muszą być dostępne bez przekierowań; odczyty mają
limit 10 sekund. Opublikowane robots.txt i sitemap nie mogą mieć globalnego
noindex. Osobny noindex pliku klucza pozostaje prawidłowy.

Nieudane zgłoszenie po udanym deployu daje czerwony krok IndexNow i komunikat,
że wdrożenie już zakończyło się sukcesem. Nie uruchamia rollbacku. Nieudany
deploy nie wywołuje powiadomienia. Ponowne `--send` z zachowaną migawką zgłasza tę samą deduplikowaną
paczkę. Re-run jobs odtwarza oryginalny artefakt danego `run_id`, dzięki
czemu zachowuje usunięte URL także po udanym deployu i nieudanym POST.
Nie tworzy dodatkowego stanu w Sanity. Po wygaśnięciu artefaktu trzeba
odzyskać pierwotną migawkę przed ponowieniem zgłoszenia usunięć.

## Tryby komendy

`npm run indexnow` domyślnie wykonuje dry-run. `--capture-previous` pobiera
migawkę sprzed wdrożenia, a `--send` jawnie uruchamia walidację publiczną
oraz POST. Wysyłka wymaga wcześniejszej migawki. Nieznane i dodatkowe flagi
są błędem. Nie należy uruchamiać `--send` w kontroli lokalnej.

Wynik zawiera status i liczby adresów. CLI i kontrola artefaktu nie wypisują klucza ani pełnego payloadu.
Klucz jest sekretem GitHub, który maskuje go także w logu trasy buildu Astro. Odpowiedź 200 oznacza przyjęcie paczki, a 202 oczekiwanie na walidację
klucza. Żaden z tych stanów nie potwierdza indeksacji.

Źródło protokołu i statusów: [dokumentacja IndexNow](https://www.indexnow.org/documentation).

## Wyniki odbioru

Pełne verify na Node 24.19.0 PASS: 363 unit, 429 E2E, 88 dokumentów
bez błędów i 17 zgodnych stron fixture/Content Lake. Syntetyczny produkcyjny
build ma poprawny plik klucza i 36 stron SEO PASS. Dry-run na jego plikach
obejmuje 34 URL i zero połączeń. Sprawdzono cztery awarie bez klucza w logu
oraz osiem przypadków guardów shell workflow. Żywego workflow wdrożenia
i rzeczywistego IndexNow nie uruchamiano.

Metadane GitHub z 12.10.2026 potwierdziły brak zmiennej SITE_INDEXING
i sekretu INDEXNOW_KEY w repo oraz w środowisku production. Konfiguracja
pozostaje wyłączona. Wartości sekretów nie odczytywano.

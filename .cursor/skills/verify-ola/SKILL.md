---
name: verify-ola
description: "Uruchamia statyczny serwis Astro (strona Oli) i prowadzi go jak użytkownik przez Chromium: strony PL, katalog, katalog 3a, blog, landingi e-booków i formularze bez wysyłki leada. Sięgnij po ten skill, gdy zmiana dotyczy publicznego UI, tras, treści fixture albo zachowania bez wysyłki leada."
---

# Weryfikacja strony Oli

Publiczna powierzchnia to statyczny serwis Astro. Użytkownik otwiera HTML w przeglądarce: strona główna `/`, katalog `/ui/`, katalog 3a `/design-system/`, blog, landingi e-booków oraz `/static/`. Publiczne EN jest wyłączone. Adresy `/en/…` zwracają 404. Studio Sanity, podgląd szkiców na porcie 4322 i Worker integracji są osobnymi procesami. Ten skill ich nie uruchamia i nie weryfikuje. Mockupy HTML w `mockups/homepage/` nie są tym serwisem.

Treść bez `PUBLIC_SANITY_*` pochodzi z fixture’ów wbudowanych w `dist/`. Dwa podglądy na różnych portach mogą czytać ten sam `dist/` równolegle. Nie przebudowuj `dist/` w trakcie sesji. Nie podłączaj się do cudzego procesu na 4321 (testy Playwright) ani 4322 (podgląd szkiców).

## Launch

Z katalogu repozytorium, Node z `.node-version` (24 lub nowszy):

```sh
npm run build
export VERIFY_RUN_ID="ola-$(date +%s)"
node .cursor/skills/verify-ola/scripts/verify.mjs launch
```

Gotowość: komenda wypisuje `base=http://127.0.0.1:<port>` i kończy się kodem 0. Port jest z zakresu 4340–4390. Brak `dist/index.html` kończy się komunikatem, żeby najpierw zbudować serwis.

Chromium Playwright musi być zainstalowany (`npx playwright install chromium`). Potem:

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser start
```

Zamknięcie tej sesji: sekcja Cleanup. Nie używaj `npm run dev` ani `npm run preview` jako instancji weryfikacji.

## Doctor

Uruchom zanim cokolwiek klikniesz, oraz gdy odpowiedź wygląda podejrzanie:

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs doctor
```

Przechodzi tylko wtedy, gdy pid z `/tmp/ola-verify/$VERIFY_RUN_ID/server.json` żyje i ten sam pid trzyma port. Linux sprawdza `/proc/net/tcp`, `/proc/net/tcp6` i `/proc/<pid>/fd`. macOS wymaga dostępnego `/usr/sbin/lsof` i odczytu listenera tego pidu. Inne systemy kończą kontrolę błędem. `GET /` musi zwrócić 200 oraz tytuł i canonical zgodne z aktualnym `dist/index.html`. Renderer SEO bierze tytuł z danych strony, więc doctor nie ma stałego tytułu fixture. Wypisuje też URL, tytuł, wersję Node zapisaną przy starcie i katalog dowodów. Jeśli sesja przeglądarki jest zapisana, doctor wymaga żywego pidu i odpowiedzi control portu.

Launch sprawdza zajętość portu przez próbę nasłuchu na `127.0.0.1`, a po starcie potwierdza właściciela. Nie uznaje odpowiedzi cudzego listenera za gotowy podgląd. Lokalny test regresji nie buduje serwisu ani nie wysyła formularzy:

```sh
node --test .cursor/skills/verify-ola/scripts/server-checks.test.mjs
```

## Drive

Wspólny punkt startu to świeży build fixture’ów i zdrowy doctor. Każda komenda `browser` idzie do jednej sesji Chromium tego `VERIFY_RUN_ID`. Role i nazwy bierz z mapy funkcji, nie z pozycji w DOM.

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zapisuję się" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "Twój adres e-mail" --exact --value "wrong"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisz poprawny adres e-mail."
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path <plik>
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path <plik>
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser script-count
node .cursor/skills/verify-ola/scripts/verify.mjs browser press --key Escape
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zapisz się na listę oczekujących" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Suplementy w PMOS (PCOS)" --exact --nth 1 --attribute href --value /ebooki/suplementy-w-pcos/
```

Formularze wysyłają poprawne dane na produkcyjny webhook n8n (`flows.zawlodzki.com`), a sesja verify-ola nie przechwytuje sieci. Wysyłaj tu tylko dane, które nie przejdą walidacji. Wysyłkę z mockiem sprawdza Playwright `tests/e2e/lead-forms.spec.ts`. `browser context` otwiera nową stronę i kasuje poprzedni stan sesji. Domyślnie JavaScript jest włączony. `expect` z rolą czeka, aż locator będzie widoczny, chyba że podasz `--state`, `--text`, `--attribute` albo `--count`. `expect --text` szuka widocznego elementu. Ukryty duplikat tego samego napisu go nie zasłania. `--nth` to indeks od zera, gdy kilka elementów ma tę samą rolę i nazwę. `click --text` klika dokładny widoczny napis, gdy kontrolka nie ma nazwy w drzewie dostępności. Ścieżki `--path` przy snapshot i screenshot są względne wobec katalogu dowodów. Mapa funkcji jest w [features/README.md](features/README.md). `browser posts` zbiera adresy POST od startu procesu przeglądarki. `browser context` tej listy nie czyści.

## Evidence

Dowody zostają w `/tmp/ola-verify-evidence/$VERIFY_RUN_ID/`. Cleanup tego katalogu nie rusza.

Każda komenda przeglądarki dopisuje linię do `transcript.jsonl` (komenda, argumenty, wynik). Do dowodu funkcji zbierz:

- snapshot ARIA po akcji użytkownika i po stanie wynikowym, nie sam ekran końcowy,
- zrzut ekranu, na którym widać tożsamość strony (nagłówek z marką albo H1),
- skutek uboczny. Przepis, który nie wysyła leada, ma dostać z `browser posts` wynik `[]`. Brak wpisu w transkrypcie nie zastępuje tego odczytu.

Nie wołaj wewnętrznych setterów ani endpointów testowych. Nie uznawaj etykiety formularza za dowód, że POST nie wyszedł.

## Cleanup

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs cleanup
```

Wysyła SIGTERM do pidu przeglądarki i pidu podglądu zapisanych dla tego `VERIFY_RUN_ID`, potem SIGKILL, jeśli proces nie zejdzie. Usuwa `/tmp/ola-verify/$VERIFY_RUN_ID/` i zostawia `/tmp/ola-verify-evidence/$VERIFY_RUN_ID/`. Po cleanup sprawdź, że plik dowodu nadal istnieje. Nie zabijaj procesów po nazwie `node` ani `astro`.

## Helpers

Wszystkie wołania idą przez `node .cursor/skills/verify-ola/scripts/verify.mjs` z katalogu repozytorium. Skrypt jest wykonywalny. Trzyma stan w `/tmp/ola-verify/$VERIFY_RUN_ID/server.json` i `browser.json`. Logi podglądu i przeglądarki są obok tych plików i znikają przy cleanup.

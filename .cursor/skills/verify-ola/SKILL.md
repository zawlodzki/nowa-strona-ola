---
name: verify-ola
description: "Uruchamia statyczny serwis Astro (strona Oli) i prowadzi go jak użytkownik przez Chromium: strony PL/EN, katalog, blog i formularz demonstracyjny. Sięgnij po ten skill, gdy zmiana dotyczy publicznego UI, tras, treści fixture albo zachowania bez wysyłki leada."
---

# Weryfikacja strony Oli

Publiczna powierzchnia to statyczny serwis Astro. Użytkownik otwiera HTML w przeglądarce: strona główna `/`, angielska `/en/`, katalog `/ui/` i `/en/ui/`, blog, landingi oraz `/static/`. Studio Sanity, podgląd szkiców na porcie 4322 i Worker integracji są osobnymi procesami. Ten skill ich nie uruchamia i nie weryfikuje.

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

Przechodzi tylko wtedy, gdy pid z `/tmp/ola-verify/$VERIFY_RUN_ID/server.json` żyje, ten sam pid trzyma port (odczyt `/proc/net/tcp` i `/proc/<pid>/fd`, więc doctor jest na Linuksa), a `GET /` zwraca 200 i zawiera `Aleksandra Olesiewicz — strona główna`. Wypisuje też URL, wersję Node zapisaną przy starcie i katalog dowodów. Jeśli sesja przeglądarki jest zapisana, doctor wymaga żywego pidu i odpowiedzi control portu.

## Drive

Wspólny punkt startu to świeży build fixture’ów i zdrowy doctor. Każda komenda `browser` idzie do jednej sesji Chromium tego `VERIFY_RUN_ID`. Role i nazwy bierz z mapy funkcji, nie z pozycji w DOM.

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Sprawdź formularz" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "Imię" --exact --value "Łucja"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role status --text "Dane poprawne. Nic nie wysłano."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisz imię (od 2 do 100 znaków)."
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path <plik>
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path <plik>
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser script-count
node .cursor/skills/verify-ola/scripts/verify.mjs browser press --key Escape
```

`browser context` otwiera nową stronę i kasuje poprzedni stan sesji. Domyślnie JavaScript jest włączony. Ścieżki `--path` przy snapshot i screenshot są względne wobec katalogu dowodów. Mapa funkcji jest w [features/README.md](features/README.md).

## Evidence

Dowody zostają w `/tmp/ola-verify-evidence/$VERIFY_RUN_ID/`. Cleanup tego katalogu nie rusza.

Każda komenda przeglądarki dopisuje linię do `transcript.jsonl` (komenda, argumenty, wynik). Do dowodu funkcji zbierz:

- snapshot ARIA po akcji użytkownika i po stanie wynikowym, nie sam ekran końcowy,
- zrzut ekranu, na którym widać tożsamość strony (nagłówek z marką albo H1),
- skutek uboczny. Formularz demonstracyjny nie wysyła leada: `browser posts` ma wypisać `[]`. Brak wpisu w transkrypcie nie zastępuje tego odczytu.

Nie wołaj wewnętrznych setterów ani endpointów testowych. Nie uznawaj nazwy „demonstracyjny” za dowód, że POST nie wyszedł.

## Cleanup

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs cleanup
```

Wysyła SIGTERM do pidu przeglądarki i pidu podglądu zapisanych dla tego `VERIFY_RUN_ID`, potem SIGKILL, jeśli proces nie zejdzie. Usuwa `/tmp/ola-verify/$VERIFY_RUN_ID/` i zostawia `/tmp/ola-verify-evidence/$VERIFY_RUN_ID/`. Po cleanup sprawdź, że plik dowodu nadal istnieje. Nie zabijaj procesów po nazwie `node` ani `astro`.

## Helpers

Wszystkie wołania idą przez `node .cursor/skills/verify-ola/scripts/verify.mjs` z katalogu repozytorium. Skrypt jest wykonywalny. Trzyma stan w `/tmp/ola-verify/$VERIFY_RUN_ID/server.json` i `browser.json`. Logi podglądu i przeglądarki są obok tych plików i znikają przy cleanup.

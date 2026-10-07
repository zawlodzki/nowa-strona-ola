# Strona bez skryptów

`/static/` pokazuje nagłówek, pole i link powrotu jako sam HTML. W dokumencie nie ma elementów `script`.

## Sub-features

- `static-heading` pokazuje „Bez skryptów”.
- `static-no-script` nie zawiera elementów `script`.
- `static-return` prowadzi linkiem „Wróć do przykładu” na `/`.

## How to get to it (user POV)

- Otwórz bezpośrednio `/static/`.
- Z tej strony wybierz „Wróć do przykładu”.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd.
- Przed tym przepisem przełącz sesję na wyłączony JavaScript. W HTML tej strony nie ma elementów `script`. Przepis i tak ma iść ścieżką bez JS.

- **Wyłącz JS.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false`. Wynik to `javascript false`.
- **Otwórz stronę.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /static/`. Wynik zaczyna się od `status 200`.
- **Treść.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Bez skryptów" --exact`.
- **Brak skryptów.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser script-count`. Wynik to `scripts 0`.
- **Link powrotu.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Wróć do przykładu" --exact --attribute href --value "/"`. Atrybut to `/`.
- **Dowód.** Na `/static/` uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path static-page/page.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path static-page/page.png`.
- **Powrót.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Wróć do przykładu" --exact`. Następny dokument to strona główna: `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Dobry pomysł. Przemyślana realizacja." --exact`.

## Gotchas

- `browser context` kasuje poprzednią stronę sesji. Nie łącz tego przepisu w tej samej sesji z niedokończonym formularzem.
- Licznik `script-count` dotyczy elementów w dokumencie, nie braku żądań sieciowych.
- Formularz na `/` przy tym kontekście zostaje disabled. To inna funkcja, opisana w formularzu demonstracyjnym.
- Link marki „Aleksandra Olesiewicz — strona główna” jest w nagłówku i w stopce. Dowodem powrotu jest nagłówek strony głównej, nie sam ten link.
- `/static/` pokazuje w nagłówku „English” do `/en/`. To fallback nagłówka, nie para tłumaczeń.

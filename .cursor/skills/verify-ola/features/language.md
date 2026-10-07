# Przełącznik języka

Z polskiej strony CMS użytkownik przechodzi na powiązaną stronę angielską i z powrotem. Strona CMS bez tłumaczenia nie oferuje linku „English”, a angielski adres tej strony zwraca 404.

## Sub-features

- `lang-home` przełącza `/` na `/en/` i z powrotem.
- `lang-workshop` przełącza `/warsztat/` na `/en/workshop/`.
- `lang-missing` na `/tylko-pl/` nie pokazuje „English”, a `/en/tylko-pl/` odpowiada 404.

## How to get to it (user POV)

- W nagłówku strony polskiej wybierz link „English”.
- W nagłówku strony angielskiej wybierz link „Polski”.
- Otwórz bezpośrednio `/warsztat/`, `/en/workshop/` albo `/tylko-pl/`.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd fixture’ów.
- Sesja przeglądarki ma włączony JavaScript. Ten przepis i tak czyta linki obecne w HTML.

- **Strona główna PL.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /`. Wynik zaczyna się od `status 200`.
- **Link angielski.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --attribute href --value "/en/"`. Atrybut to `/en/`.
- **Wejście EN.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "English" --exact`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Polski" --exact --attribute href --value "/"`.
- **Powrót PL.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Polski" --exact`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --attribute href --value "/en/"`.
- **Warsztat.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /warsztat/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Jeden dzień na wspólny porządek."`. Następnie `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --attribute href --value "/en/workshop/"`.
- **Warsztat EN.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "English" --exact`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "One day to put the work in order."` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Polski" --exact --attribute href --value "/warsztat/"`.
- **Dowód.** Na warsztacie EN uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path language/workshop.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path language/workshop.png`.
- **Brak tłumaczenia.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /tylko-pl/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Ta strona nie ma wersji angielskiej."` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --count 0`.
- **404 EN.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/tylko-pl/`. Wynik zaczyna się od `status 404`.

## Gotchas

- Link języka znika, gdy tłumaczenie CMS nie istnieje. Licznik 0 dla „English” na `/tylko-pl/` jest dowodem, a nie błędem selektora.
- `/static/` nie jest stroną CMS. Nagłówek bez `alternateHref` pokazuje „English” do `/en/`. To nie jest para tłumaczeń.
- `/wdrozenie/` i `/en/implementation/` to ta sama para co warsztat. Nie wymagają osobnego przepisu.
- Katalog używa `/ui/` i `/en/ui/`, blog innych ścieżek. Nie uznawaj przełączenia strony głównej za sprawdzenie tamtych par.
- `goto` raportuje status dokumentu. 404 jest oczekiwanym wynikiem tylko dla `/en/tylko-pl/`. Snapshot warsztatu zrób przed tym krokiem.

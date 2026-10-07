# Landing e-booka

Publiczna `/ebooki/suplementy-w-pcos/` i angielska `/en/ebooks/supplements-in-pcos/` pokazują landing Ebook3a z fixture’ów: ten sam dokument produktu co karta na homepage, cena 97 zł brutto, status zapowiedzi, siedem rozdziałów, próbkę karty, dwie opinie o współpracy i sześć pytań FAQ. Przycisk zakupu otwiera natywne `details` z informacją, że sprzedaż nie jest uruchomiona. Nic nie jest wysyłane i nie ma potwierdzenia płatności.

## Sub-features

- Osobne dokumenty PL/EN. Brak polskiego H1 pod `/en/ebooks/supplements-in-pcos/`. `/en/ebooki/suplementy-w-pcos/` zwraca 404.
- Karta „Suplementy w PCOS” na homepage ma `href=/ebooki/suplementy-w-pcos/`, nie kotwicę.
- Nagłówek ma lokalne kotwice i przycisk „E-book · 97 zł” do `#cena`.
- Status `planned`: brak checkoutu. Po otwarciu „Chcę ebook · 97 zł” widać, że przycisk nie pobiera płatności.
- Treść, cena i status są czytelne bez JavaScriptu.

## How to get to it (user POV)

Ze strony głównej wybrać kartę „Suplementy w PCOS” albo „Poznaj temat” przy tej karcie. Albo otworzyć `/ebooki/suplementy-w-pcos/`. Angielski odpowiednik jest pod `/en/ebooks/supplements-in-pcos/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Suplementy w PCOS" --attribute href --value /ebooki/suplementy-w-pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Suplementy w PCOS"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Zrób porządek z suplementami."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "E-book · 97 zł" --attribute href --value "#cena"
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Chcę ebook · 97 zł"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Sprzedaż nie jest uruchomiona"
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path ebook-pl-aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook-pl.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/ebooks/supplements-in-pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Put your supplements in order."
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path ebook-en-aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook-en.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/ebooki/suplementy-w-pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/suplementy-w-pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Zrób porządek z suplementami."
```

`browser posts` ma wypisać `[]`. `goto` na `/en/ebooki/suplementy-w-pcos/` ma zwrócić `status 404`. Po `browser context --javascript false` treść i 97 zł pozostają widoczne.

## Gotchas

H1 łamie wiersze przez `\n` w danych. Playwright i verify-ola widzą złączony tekst „Zrób porządek z suplementami.”
Karta homepage ma dwa linki o nazwie „Suplementy w PCOS” (okładka i tytuł), oba z `href=/ebooki/suplementy-w-pcos/`. `expect --attribute` pada na strict mode; ARIA snapshot pokazuje oba URL. Kliknięcie tytułu otwiera landing w E2E (`#ebook-suplementy-w-pcos` → heading → link).
Przycisk zakupu przy statusie `planned` to `summary.ao-button` w `details`, nie link checkoutu. W drzewie ARIA to `group` „Chcę ebook · 97 zł”; `click --role button` nie trafia. E2E otwiera go `getByText`. Zamknięte `details` trzyma „Sprzedaż nie jest uruchomiona” poza drzewem (hidden), bez potwierdzenia zakupu.
Kotwice landingu są polskie także w EN (`#cena`, `#podglad`, `#dla-kogo`).
Nie otwieraj Studio, podglądu 4322 ani Workera. Kolekcja `/ebooki/` to pakiet 5 i nie jest w tym przepisie.
Natywny zoom, czytnik i urządzenie fizyczne nie są w tym przepisie.

# Landing e-booka

Publiczna `/ebooki/suplementy-w-pcos/` pokazuje landing Ebook3a z fixture’ów. To ten sam produkt co karta na stronie głównej. Cena to 97 zł brutto. Status to zapowiedź „Wkrótce dostępny”. Przycisk „Zapisz się na listę oczekujących” otwiera dialog „Daj znać, że czekasz”. Przepis nie wypełnia e-maila i nic nie wysyła.

## Sub-features

- Karta „Suplementy w PMOS (PCOS)” na homepage ma `href=/ebooki/suplementy-w-pcos/`, nie kotwicę.
- Nagłówek ma lokalne kotwice i link „E-book · 97 zł” do `#cena`.
- Status `planned` renderuje listę oczekujących, nie checkout i nie „Chcę ebook · 97 zł”.
- Treść, cena, odznaka i przycisk listy są czytelne bez JavaScriptu.
- Adres `/en/ebooki/suplementy-w-pcos/` nie jest publikowany. 404 EN sprawdza `language.md`.

## How to get to it (user POV)

Ze strony głównej wybierz kartę „Suplementy w PMOS (PCOS)” albo „Poznaj temat” przy tej karcie. Albo otwórz `/ebooki/suplementy-w-pcos/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Suplementy w PMOS (PCOS)" --exact --nth 1 --attribute href --value /ebooki/suplementy-w-pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Suplementy w PMOS (PCOS)" --exact --nth 1
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Zrób porządek z suplementami."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "E-book · 97 zł" --attribute href --value "#cena"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zapisz się na listę oczekujących" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role dialog --name "Daj znać, że czekasz"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role textbox --name "Twój adres e-mail"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zapisuję się" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path ebook/open.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook/open.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/suplementy-w-pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Zrób porządek z suplementami."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zapisz się na listę oczekujących" --exact
```

`browser posts` ma wypisać `[]`. Nie wypełniaj dialogu. Poprawny adres trafiłby na webhook n8n.

## Gotchas

H1 łamie wiersze przez `\n` w danych. Playwright i verify-ola widzą złączony tekst „Zrób porządek z suplementami.”
Karta homepage ma dwa linki o nazwie „Suplementy w PMOS (PCOS)” i tym samym `href`. Okładka jest `--nth 0`. Tytuł jest `--nth 1`. Bez indeksu strict mode odrzuca parę. Spacja przed `(PCOS)` w źródle jest niełamliwa. W nazwie dostępnej Playwright przyjmuje zwykłą spację.
Pozostałe pięć landingów ma osobny przepis. Kolekcja `/ebooki/` też. Nie otwieraj Studio, podglądu 4322 ani Workera.

# Kolekcja e-booków

Publiczna `/ebooki/` pokazuje EbookCollection3a z fixture’ów. To te same dokumenty `ebook` co homepage, z `EBOOK_SEED` w `src/content/homepage-seed.ts`. Kategorie to Wszystkie, PMOS (PCOS) i Perimenopauza, każda z licznikiem wyliczonym z bieżących kart. Karty pokazują 97 zł brutto i odznakę „Wkrótce dostępny”. Każdy polski slug ma landing. Newsletter jest formularzem zapisu. Ten przepis go nie wysyła. Copy kolekcji jest propozycją.

## Sub-features

- `/en/ebooks/` nie jest publikowane. 404 EN sprawdza `language.md`.
- Filtry radio działają bez JS przez CSS `:has`. `/ebooki/kategoria/pcos/` ma wstępnie zaznaczone radio „PMOS (PCOS)”.
- `?kategoria=pcos` przy włączonym JS ustawia filtr. Canonical to pełna kolekcja `/ebooki/`.
- Pusta kolekcja (0 dokumentów) ukrywa filtry i pokazuje komunikat; pusta kategoria pokazuje komunikat kategorii.
- Karta „Suplementy w PMOS (PCOS)” ma `href=/ebooki/suplementy-w-pcos/`. Stopka „E-booki” ma `aria-current=page`.

## How to get to it (user POV)

Ze strony głównej wybierz „Zobacz wszystkie e-booki” albo „E-booki” w menu. Albo otwórz `/ebooki/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Zobacz wszystkie e-booki" --attribute href --value /ebooki/
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Zobacz wszystkie e-booki"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Więcej jasności. W Twoim tempie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path ebooks/all.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks/all.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role radio --name "PMOS (PCOS)"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks/pcos.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role radio --name "Perimenopauza"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks/peri.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/kategoria/pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role radio --name "PMOS (PCOS)"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Więcej jasności. W Twoim tempie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role radio --name "Perimenopauza"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks/nojs.png
```

`browser posts` ma wypisać `[]`. Po `browser context --javascript false` H1 zostaje, a radio nadal filtruje siatkę.

## Gotchas

H1 łamie wiersze przez `\n`. Playwright widzi „Więcej jasności. W Twoim tempie.”
Copy kolekcji jest propozycją, nie zatwierdzoną treścią.
Każdy polski slug z `EBOOK_SEED` ma landing. Suplementy sprawdza `ebook.md`, pozostałe `ebook-landings.md`.
Pusty stan (zero dokumentów) na bieżącym fixture nie występuje. Mapper i komunikat są w unit testach. Na produkcji widać go, gdy CMS nie ma opublikowanych `ebook`.
Okładka „Szczupła, a jednak PMOS (PCOS)” używa zdjęcia `food`. Pozostałe okładki to SVG w `src/design-system/decorations/`.
Radio „PMOS (PCOS)” dopisuje do nazwy dostępnej licznik kart z bieżącego seeda. Komenda bez `--exact` trafia w ten przycisk. `--exact` na samym „PMOS (PCOS)” nie trafia.
Nie otwieraj Studio, podglądu 4322 ani Workera.
Natywny zoom, czytnik i urządzenie fizyczne nie są w tym przepisie.

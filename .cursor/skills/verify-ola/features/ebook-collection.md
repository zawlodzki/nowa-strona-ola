# Kolekcja e-booków

Publiczna `/ebooki/` i angielska `/en/ebooks/` pokazują EbookCollection3a z fixture’ów: te same sześć dokumentów `ebook` co homepage, kategorie Wszystkie / PCOS / Perimenopauza z licznikami, ceny 97 zł brutto i status przygotowania. Karty prowadzą do `ebookPath` (landing PCOS istnieje; pozostałe adresy są prawdziwe, bez ekranów makiety). Newsletter nic nie wysyła. Copy kolekcji jest propozycją.

## Sub-features

- Osobne dokumenty PL/EN. Brak polskiego H1 pod `/en/ebooks/`. `/en/ebooki/` zwraca 404.
- Filtry radio działają bez JS (CSS `:has`). `/ebooki/kategoria/pcos/` i `/en/ebooks/category/pcos/` mają wstępnie zaznaczoną kategorię.
- `?kategoria=pcos` przy włączonym JS ustawia filtr. Canonical to pełna kolekcja `/ebooki/`.
- Pusta kolekcja (0 dokumentów) ukrywa filtry i pokazuje komunikat; pusta kategoria pokazuje komunikat kategorii.
- Karta „Suplementy w PCOS” ma `href=/ebooki/suplementy-w-pcos/`. Stopka „E-booki” ma `aria-current=page`.

## How to get to it (user POV)

Ze strony głównej wybrać „Zobacz wszystkie e-booki” albo „E-booki” w menu. Albo otworzyć `/ebooki/`. Angielski odpowiednik jest pod `/en/ebooks/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Zobacz wszystkie e-booki" --attribute href --value /ebooki/
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Zobacz wszystkie e-booki"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Więcej jasności. W Twoim tempie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path ebooks-pl-all-aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks-pl-all.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role radio --name "PCOS"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks-pl-pcos.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role radio --name "Perimenopauza"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks-pl-peri.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/kategoria/pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role radio --name "PCOS"
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/ebooks/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "More clarity. At your pace."
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks-en-all.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/ebooki/
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Więcej jasności. W Twoim tempie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role radio --name "Perimenopauza"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebooks-pl-nojs.png
```

`browser posts` ma wypisać `[]`. `goto` na `/en/ebooki/` ma zwrócić `status 404`. Po `browser context --javascript false` H1 i 97 zł pozostają widoczne, a radio nadal filtruje siatkę.

## Gotchas

H1 łamie wiersze przez `\n`. Playwright widzi „Więcej jasności. W Twoim tempie.”
Copy kolekcji jest propozycją, nie zatwierdzoną treścią.
Pięć kart poza Suplementami w PCOS linkuje do `ebookPath`, ale landing w pakiecie 4 ma tylko ten jeden produkt — pozostałe adresy są poprawne, strony landingu jeszcze nie istnieją.
Pusty stan (0 e-booków) nie występuje na fixture z sześcioma produktami; mapper i komunikat są w unit testach. Na produkcji widać go, gdy CMS nie ma opublikowanych `ebook`.
Okładka „Szczupła, a jednak PCOS” używa zdjęcia `food` (jak makieta `art-nutrition` / `food-editorial.webp`). Pozostałe okładki to SVG w `src/design-system/decorations/`.
Nie otwieraj Studio, podglądu 4322 ani Workera.
Natywny zoom, czytnik i urządzenie fizyczne nie są w tym przepisie.

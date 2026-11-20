# Menu mobilne

Na stronach 3a wąski nagłówek pokazuje „Menu”. Przy włączonym JavaScript i wsparciu `:popover-open` jest to przycisk, który otwiera panel `popover="auto"`. Escape zamyka panel. Kliknięcie linku w panelu też go zamyka. Bez JavaScript ta sama nazwa jest na `summary` w `details`. Przy widoku 1280×900 przycisku nie widać.

## Sub-features

- `menu-open` na `/design-system/` przy 390×844 klika „Menu”. Link „Fundamenty” ma wtedy liczbę 2, bo drugi egzemplarz jest w stopce.
- `menu-escape` zamyka panel klawiszem Escape. Liczba linków „Fundamenty” wraca do 1.
- `menu-link` klika pierwszy link „Fundamenty” i panel się zamyka.
- `menu-no-js` po `browser context --javascript false` klika widoczny napis „Menu” i znowu widzi dwa linki „Fundamenty”.

## How to get to it (user POV)

Otwórz `/design-system/`. Ustaw widok na 390×844. Na szerokim oknie przycisk jest ukryty, bo kontener nagłówka przekracza 74.9375rem.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser viewport --width 390 --height 844
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /design-system/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Menu" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Fundamenty" --exact --count 1
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Menu" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Fundamenty" --exact --count 2
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path mobile-nav/open.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path mobile-nav/open.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser press --key Escape
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Fundamenty" --exact --count 1
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Menu" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Fundamenty" --exact --nth 0
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Fundamenty" --exact --count 1
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /design-system/
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --text "Menu"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Fundamenty" --exact --count 2
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path mobile-nav/nojs.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path mobile-nav/nojs.png
```

## Gotchas

Domyślny widok 1280×900 daje `count 0` dla przycisku „Menu”. `+` i `−` mają `aria-hidden` i nie wchodzą do nazwy. Bez JavaScript `summary` nie jest przyciskiem w drzewie dostępności tej sesji. Kliknij widoczny napis „Menu”. Stopka ma własny link „Fundamenty”, więc zamknięty panel zostawia liczbę 1, a otwarty 2. `--nth 0` przy otwartym panelu trafia w link nagłówka. `browser context` zostawia ostatni viewport. Po tym przepisie wróć do 1280×900, jeśli dalsze kroki liczą na szeroki nagłówek.

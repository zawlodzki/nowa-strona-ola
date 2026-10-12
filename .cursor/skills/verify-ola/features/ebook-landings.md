# Pozostałe landingi e-booków

Pięć polskich landingów Ebook3a poza suplementami jest w tym samym builderze fixture’ów. Każdy ma odznakę „Wkrótce dostępny” i przycisk „Zapisz się na listę oczekujących”. Ten przepis nie otwiera dialogu. Dialog i brak POST sprawdza landing suplementów.

## Sub-features

- `/ebooki/badania-ktore-maja-sens/` ma H1 „Na wizytę z pytaniami. Nie z kolejną listą badań.”
- `/ebooki/szczupla-a-jednak-pcos/` ma H1 „Masz PMOS (PCOS). Nie chcesz chudnąć.”
- `/ebooki/waga-cie-oklamuje/` ma H1 „Zobacz więcej niż kilogramy.”
- `/ebooki/czy-to-juz/` ma H1 „Zapisz, co się zmienia. Porozmawiaj z lekarzem.”
- `/ebooki/noc-zaczyna-sie-o-osiemnastej/` ma H1 „Przyjrzyj się wieczorom. Zapisz swoje noce.”

## How to get to it (user POV)

Otwórz adres wprost albo kartę w kolekcji `/ebooki/`. Slug w adresie zostaje bez zmian, także gdy tytuł mówi „PMOS (PCOS)”.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/badania-ktore-maja-sens/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Na wizytę z pytaniami. Nie z kolejną listą badań."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zapisz się na listę oczekujących" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook-landings/badania.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/szczupla-a-jednak-pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Masz PMOS (PCOS). Nie chcesz chudnąć."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook-landings/szczupla.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/waga-cie-oklamuje/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Zobacz więcej niż kilogramy."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook-landings/waga.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/czy-to-juz/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Zapisz, co się zmienia. Porozmawiaj z lekarzem."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook-landings/czy-to-juz.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ebooki/noc-zaczyna-sie-o-osiemnastej/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Przyjrzyj się wieczorom. Zapisz swoje noce."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wkrótce dostępny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zapisz się na listę oczekujących" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path ebook-landings/noc.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path ebook-landings/noc.png
```

## Gotchas

H1 łamie wiersze przez `\n`. Playwright składa je w jeden napis ze spacją.
Nie klikaj „Zapisz się na listę oczekujących” w tym przepisie. Otwarcie dialogu i pusty `browser posts` są w landingu suplementów.
Angielskie fixture’e tych pięciu landingów nie są publikowane.

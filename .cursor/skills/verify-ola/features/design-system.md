# Katalog 3a

Na `/design-system/` użytkownik ogląda zatwierdzony katalog komponentów 3a. Przy włączonym JavaScript może przełączyć motyw i przesunąć karuzelę. Z `/ui/` wchodzi tym samym adresem.

## Sub-features

- `ds-heading` pokazuje H1 „Design system 3a”.
- `ds-theme` przełącza przycisk „Ciemny motyw” na `aria-pressed="true"`.
- `ds-carousel` pokazuje przycisk „Następne elementy”.
- `ds-from-ui` prowadzi z `/ui/` linkiem „Docelowy design system 3a”.

## How to get to it (user POV)

- Otwórz bezpośrednio `/design-system/`.
- Na `/ui/` wybierz „Docelowy design system 3a”.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd.
- JavaScript sesji jest włączony. Bez niego przycisk motywu i sterowanie karuzelą są ukryte.

- **Wejście z katalogu.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ui/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Docelowy design system 3a" --exact --attribute href --value "/design-system/"`. Atrybut to `/design-system/`.
- **Otwórz katalog 3a.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Docelowy design system 3a" --exact`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Design system 3a"`.
- **Motyw.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Ciemny motyw" --exact`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Ciemny motyw" --exact --attribute aria-pressed --value "true"`.
- **Karuzela.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Następne elementy" --exact`. Wynik to kliknięcie tego przycisku.
- **Otwarte FAQ.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "To katalog stanów. Wysłanie danych wymaga integracji formularza z Workerem, kolejką i n8n."`. Ten blok jest otwarty w HTML.
- **Dowód.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path design-system/page.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path design-system/page.png`. Snapshot zawiera H1 i przycisk motywu.

## Gotchas

- To nie jest `/ui/`. Dialog „Jak pracujemy” należy do tamtego przepisu.
- Przycisk motywu i sterowanie karuzelą startują z `hidden` i pokazuje je skrypt. Przy wyłączonym JavaScript te role mają `--count 0`.
- Skrypt ustawia motyw z `prefers-color-scheme`. Przepis zakłada jasny start. Przy ciemnym starcie pierwsze kliknięcie ustawia `aria-pressed` na `false`.
- Pytanie FAQ „Czy te komponenty działają bez JavaScript?” jest w `details`. Harness nie otwiera go przez `--role group`. Dowodem jest otwarty drugi blok, nie kliknięcie pierwszego pytania.
- Przycisk newslettera „Zapisz się — przykład” jest disabled z założenia. To nie jest regresja produktu.
- Link marki na tej stronie prowadzi na `/design-system/`, nie na `/`.
- Brak angielskiej pary. Nie szukaj `/en/design-system/`.

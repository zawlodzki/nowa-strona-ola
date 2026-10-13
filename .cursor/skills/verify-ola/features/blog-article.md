# Artykuł na blogu

Z listy bloga użytkownik otwiera najnowszy wpis o przygotowaniu do konsultacji i widzi spis treści Article3a. Tytuł mówi „PMOS (PCOS)”. Slug zostaje `przygotowanie-do-konsultacji-pcos`. Nagłówek 3a nie pokazuje przełącznika języka.

## Sub-features

- `blog-index` pokazuje nagłówek „Blog. Po Twojemu.” na `/blog/`.
- `blog-open` otwiera artykuł z karty wyróżnionej na liście.
- Spis treści ma nazwę „W tym artykule”.

## How to get to it (user POV)

- Otwórz `/blog/` i wybierz „Jak przygotować się do konsultacji dietetycznej przy PMOS (PCOS)?”.
- Otwórz bezpośrednio `/blog/przygotowanie-do-konsultacji-pcos/`.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd fixture’ów.
- Na liście jest link artykułu z fixture’a. To nie jest treść z datasetu Sanity.

- **Lista.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog. Po Twojemu."`.
- **Wejście z listy.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Jak przygotować się do konsultacji dietetycznej przy PMOS (PCOS)?" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Jak przygotować się do konsultacji dietetycznej przy PMOS (PCOS)?"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role navigation --name "W tym artykule"`.
- **Dowód.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path blog-article/article.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-article/article.png`.

## Gotchas

- Obrazek wyróżniony ma aria-label zaczynające się od „Przeczytaj artykuł:”. `--exact` na samym tytule trafia w link H3.
- Szablon artykułu to Article3a. Spis treści ma nazwę „W tym artykule”, nie „Spis treści”.
- W tytule fixture’a przed `(PCOS)` jest spacja niełamliwa. Nazwa dostępna pasuje do zwykłej spacji w komendzie.
- Copy i daty wpisów z makiety są propozycją.
- Okładka e-booka w artykule jest linkiem z `tabindex="-1"` i `aria-hidden="true"` (`src/views/Article3a.astro`). `BookCover` też jest ukryty przed czytnikiem (`src/design-system/components/BookCover.astro`). Snapshot ARIA artykułu nie ma osobnego linku okładki. Tytuł zostaje w linku nagłówka.

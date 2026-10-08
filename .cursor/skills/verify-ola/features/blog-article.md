# Artykuł na blogu

Z listy bloga użytkownik otwiera najnowszy wpis o przygotowaniu do konsultacji, widzi spis treści i link do angielskiej wersji tego samego artykułu.

## Sub-features

- `blog-index` pokazuje nagłówek „Blog. Po Twojemu.” na `/blog/`.
- `blog-open` otwiera artykuł z karty wyróżnionej na liście.
- `blog-en` prowadzi do `/en/blog/preparing-for-a-pcos-nutrition-consultation/`.

## How to get to it (user POV)

- Otwórz `/blog/` i wybierz „Jak przygotować się do konsultacji dietetycznej przy PCOS?”.
- Otwórz bezpośrednio `/blog/przygotowanie-do-konsultacji-pcos/`.
- Z artykułu wybierz „English”.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd fixture’ów.
- Na liście jest link artykułu z fixture’a. To nie jest treść z datasetu Sanity.

- **Lista.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog. Po Twojemu."`.
- **Wejście z listy.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Jak przygotować się do konsultacji dietetycznej przy PCOS?" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Jak przygotować się do konsultacji dietetycznej przy PCOS?"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role navigation --name "W tym artykule"`.
- **Angielski artykuł.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --attribute href --value "/en/blog/preparing-for-a-pcos-nutrition-consultation/"`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "English" --exact` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "How to prepare for a nutrition consultation with PCOS?"`.
- **Dowód.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path blog-article/english.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-article/english.png`.

## Gotchas

- Obrazek wyróżniony ma aria-label zaczynające się od „Przeczytaj artykuł:”. `--exact` na samym tytule trafia w link H3.
- Szablon artykułu to Article3a. Spis treści ma nazwę „W tym artykule”, nie „Spis treści”.
- Copy i daty wpisów z makiety są propozycją.

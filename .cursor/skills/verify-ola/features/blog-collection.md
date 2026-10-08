# Kolekcja bloga

Publiczna `/blog/` i angielska `/en/blog/` pokazują BlogCollection3a z fixture’ów: najnowszy wpis nad siatką dwóch kolumn, prawdziwa paginacja (`/blog/strona/2/`, EN `/en/blog/page/2/`), kategorie, pełny newsletter DemoForm i stany pustej listy lub pustej kategorii. Copy, tytuły i daty z makiety są propozycją.

## Sub-features

- `blog-index` pokazuje H1 „Blog. Po Twojemu.”, wyróżniony najnowszy wpis i „Wpisy 2–7 z 11”.
- `blog-page-2` otwiera `/blog/strona/2/` bez wyróżnienia, z „Wpisy 8–11 z 11”.
- `blog-category` otwiera `/blog/kategoria/pcos/` z breadcrumbem i kartami PCOS.
- `blog-empty` otwiera `/blog/kategoria/perimenopauza/` z komunikatem pustej kategorii.
- `blog-en` otwiera `/en/blog/` bez polskiego H1. Newsletter nic nie wysyła.

## How to get to it (user POV)

Z menu wybrać „Blog” albo otworzyć `/blog/`. Strona 2 jest pod paginacją. Kategorie są pod leadem. Angielski odpowiednik jest pod `/en/blog/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog. Po Twojemu."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisy 2–7 z 11"
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path blog-p1.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-p1.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/strona/2/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisy 8–11 z 11"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-p2.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/kategoria/pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role navigation --name "Ścieżka nawigacji"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-category.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/kategoria/perimenopauza/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "W tej kategorii nie ma jeszcze wpisów. Wybierz inną kategorię albo wróć do pełnej listy."
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-empty.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/blog/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog. On your terms."
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-en.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog. Po Twojemu."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Strona 2"
```

## Gotchas

- Najnowszy wpis jest tylko na stronie 1 i nie wraca w siatce. `--exact` na tytule wyróżnionego wpisu trafia w link H3, nie w obrazek (aria-label zaczyna się od „Przeczytaj artykuł:”). Numer strony ma dostępne imię „Strona 2”, nie samą cyfrę.
- Fixture ma 11 wpisów, więc `/blog/strona/2/` istnieje. Pusta kategoria to `perimenopauza`, nie brak trasy.
- Copy indeksu jest propozycją. Nie traktować tytułów i dat z makiety jako publikacji.
- Artykuł z karty otwiera Article3a pod `blog/[slug]`.
- Screenshoty kolekcji muszą poczekać na załadowanie obrazów (`verify.mjs browser screenshot` przewija stronę i czeka na `naturalWidth`). Miniatury są kadrowane do pejzażu 1.8 w pliku (`about` 1122×623), żeby Chromium malował je poza viewportem. Różowy prostokąt to tło `--ao-surface` przy wycieku portretowego pliku, nie brak `<img>`.

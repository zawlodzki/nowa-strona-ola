# Kolekcja bloga

Publiczna `/blog/` pokazuje BlogCollection3a z fixture’ów. Najnowszy wpis stoi nad siatką dwóch kolumn. Dalsze strony są pod `/blog/strona/<n>/`, gdy `blogCollectionPageCount` w `src/lib/pagination.ts` jest większe niż 1. Kategoria PMOS ma slug `pcos`. Pusta kategoria to perimenopauza. Newsletter na dole jest formularzem zapisu. Ten przepis go nie wysyła. Copy, tytuły i daty z makiety są propozycją.

## Sub-features

- `blog-index` pokazuje H1 „Blog. Po Twojemu.”, wyróżniony najnowszy wpis i etykietę z `blogRangeLabel`.
- `blog-page-2` otwiera drugą stronę tylko wtedy, gdy wyliczona liczba stron jest większa niż 1. Na niej nie ma wyróżnienia. Etykieta zakresu pochodzi z tej samej funkcji.
- `blog-category` otwiera `/blog/kategoria/pcos/` z breadcrumbem „Ścieżka nawigacji” i etykietą „PMOS (PCOS)”.
- `blog-empty` otwiera `/blog/kategoria/perimenopauza/` z komunikatem pustej kategorii.
- Wejście na listę nie wysyła POST. `/en/blog/` nie jest publikowane.

## How to get to it (user POV)

Z menu wybierz „Blog” albo otwórz `/blog/`. Dalsza strona jest pod paginacją, gdy wyliczenie daje więcej niż jedną stronę. Kategorie otwierasz adresem `/blog/kategoria/…`. Lista nie rysuje linków kategorii pod leadem.

Przed etykietą zakresu policz polskie wpisy w `BLOG_ARTICLE_SEED` (`src/content/blog-collection-seed.ts`). To T. Rozmiar strony S weź z `ARTICLES_PER_PAGE` w `src/lib/paths.ts`. Najnowszy wpis jest poza siatką. Dla strony P offset to (P−1)×S, a wycinek to co najwyżej S kolejnych wpisów z reszty. Etykieta to wynik `blogRangeLabel` dla tego wycinka. Wstaw ją w `--text`. Nie zapisuj T w tym pliku. Drugą stronę i link „Strona” plus jej numer otwieraj tylko, gdy `blogCollectionPageCount(T, S)` jest większe niż 1.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog. Po Twojemu."
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path blog/p1.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog/p1.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/kategoria/pcos/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role navigation --name "Ścieżka nawigacji"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "PMOS (PCOS)"
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog/category.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/kategoria/perimenopauza/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "W tej kategorii nie ma jeszcze wpisów. Wybierz inną kategorię albo wróć do pełnej listy."
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog/empty.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser context --javascript false
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog. Po Twojemu."
```

Po H1 na stronie 1 uruchom `browser expect --text` z etykietą wyliczoną dla strony 1. Gdy liczba stron jest większa niż 1, uruchom `browser goto --path /blog/strona/2/`, potem `browser expect --text` z etykietą strony 2, `browser screenshot --path blog/p2.png` i, przy wyłączonym JavaScript, `browser expect --role link --name` z nazwą „Strona” plus numer tej strony.

## Gotchas

- Najnowszy wpis jest tylko na stronie 1 i nie wraca w siatce. `--exact` na tytule wyróżnionego wpisu trafia w link H3, nie w obrazek (aria-label zaczyna się od „Przeczytaj artykuł:”). Nazwa linku paginacji to „Strona” plus numer, nie sama cyfra.
- Pusta kategoria to `perimenopauza`, nie brak trasy. Drugą stronę otwieraj tylko, gdy wyliczona liczba stron jest większa niż 1.
- Copy indeksu jest propozycją. Nie traktować tytułów i dat z makiety jako publikacji.
- Artykuł z karty otwiera Article3a pod `blog/[slug]`.
- Screenshoty kolekcji muszą poczekać na załadowanie obrazów (`verify.mjs browser screenshot` przewija stronę i czeka na `naturalWidth`). Ramka karty ma `aspect-ratio: 1.8` i `object-fit: cover`. Atrybuty `about` to 1122×623, ale hotspot procentowy przełącza `SiteImage` na `fit: inside`, więc plik zostaje portretem wpasowanym w ten prostokąt. Różowe tło `--ao-surface` widać, gdy obraz nie wypełni ramki. To nie jest brak `<img>`.

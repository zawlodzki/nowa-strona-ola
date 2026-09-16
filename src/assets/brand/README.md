# Logo — aleksandra olesiewicz

**Źródło edycji:** [`logo.ts`](./logo.ts) — krój, tekst, warianty i pliki.

Wordmarki tekstowe, bez dodatkowego znaku. Krój: [Gambarino Regular](https://www.fontshare.com/fonts/gambarino)
(Théo Guillard / Indian Type Foundry), z oficjalnego pakietu Fontshare.
Glify są zamienione na obrysy — pliki SVG nie wymagają zainstalowanej czcionki
i nie zawierają plików fontu. Komentarz w każdym SVG powtarza ten sam trop.

Kolor bazowy: token `ink` (`#171719`). W UI SVG używa `currentColor`.

| Wariant          | Plik                | Zastosowanie                       |
| ---------------- | ------------------- | ---------------------------------- |
| Jedna linia      | `logo-wordmark.svg` | Nagłówek (szeroki), stopka         |
| Słowo pod słowem | `logo-stacked.svg`  | Nagłówek na wąskim ekranie         |
| Inicjały `ao`    | `logo-monogram.svg` | Favicon, avatar, małe zastosowania |

Żeby zmienić znak: zaktualizuj `logo.ts`, pobierz Gambarino z `font.download`
i wygeneruj ponownie obrysy. Nie hostować Gambarino jako kroju strony —
główny krój aplikacji pozostaje Switzer.

ITF FFL 2.0 zezwala na tworzenie logo i znaków słownych z czcionki.

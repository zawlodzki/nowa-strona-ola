# Wybrane fotografie Aleksandry

Hero A i Kontakt C pochodzą z drugiej serii image_gen, zaakceptowanej 2026-10-04.
Nie dokumentują rzeczywistej sesji fotograficznej. Portret „O mnie” zastąpiono
2026-10-09 rzeczywistym [zdjęciem z Instagrama](https://www.instagram.com/p/CvUc_R0o9Kn/)
na polecenie użytkownika. Zmiana obejmuje wszystkie zastosowania `about.webp`.

| Sekcja    | Plik do strony               | Oryginał                             | Rozmiar        | Tło           |
| --------- | ---------------------------- | ------------------------------------ | -------------- | ------------- |
| Hero A    | [hero.webp](hero.webp)       | [hero.png](originals/hero.png)       | 1122 × 1402 px | Przezroczyste |
| O mnie    | [about.webp](about.webp)     | [about.png](originals/about.png)     | 1440 × 1800 px | Wnętrze       |
| Kontakt C | [contact.webp](contact.webp) | [contact.png](originals/contact.png) | 1536 × 1024 px | Jasne wnętrze |

[selection.json](selection.json) zawiera mapowanie wybranych wariantów, wymiary,
informację o przezroczystości i proponowane opisy alternatywne PL/EN.

## Eksport i użycie

Hero i Kontakt mają bezstratny WebP, bez zmiany rozdzielczości, kadrowania lub retuszu.
Porównano zdekodowane piksele PNG i WebP: wszystkie widoczne piksele i kanał alfa
są identyczne. Enkoder pomija część niewidocznych wartości RGB tam, gdzie alfa
wynosi zero; nie zmienia to wyglądu. Oryginały pozostają źródłem dalszych eksportów.

Portret „O mnie” pobrano jako JPEG 1440 × 1800 px. `originals/about.png`
zachowuje jego zdekodowane piksele, a `about.webp` jest eksportem z jakością 90.
Nie zmieniano rozdzielczości, kadru, twarzy ani tła; upscaling nie był potrzebny.
Różne kadry w sekcjach i awatarach wynikają z istniejącego `object-fit` w CSS.
Poprzedni wygenerowany portret pozostaje w historii Git.

Hero należy wyświetlać jako całą sylwetkę, z zachowaniem proporcji, np. przez
`object-fit: contain`. Kolor za postacią powinien pochodzić z sekcji strony.
Kontakt ma miejsce na tekst po lewej; przy wąskim ekranie tekst można umieścić
oddzielnie, a portret wykadrować do prawej części zdjęcia. Finalne kadry zależą
od docelowego układu sekcji. Przed publikacją sprawdzić krawędzie loków na jej tle.

Pliki są przygotowane do importu przez Astro lub przesłania do Sanity.
Podłączenie do sekcji CMS pozostaje osobnym krokiem.
Lokalna galeria z pozostałymi wariantami nie jest częścią repozytorium.

## Pochodzenie

Druga seria korzystała z czterech rzeczywistych referencji Aleksandry:

- [Portret z czerwca 2025](https://www.instagram.com/p/DK7UmotojCU/) — tożsamość, oczy i brązowe loki.
- [Portret z lipca 2023](https://www.instagram.com/p/CvUc_R0o9Kn/) — uśmiech z zębami i proporcje ramion.
- [Neutralny portret](https://www.instagram.com/p/CnKb2oWqhNr/) — spokojna mimika i ułożenie włosów.
- [Nagranie zawodowe](https://www.instagram.com/p/DO8FbZZDTee/) — wycięty zrzut pojedynczej klatki odtwarzania z twarzą i górą sylwetki.

Pozostałych źródłowych zdjęć ani klatek z Instagrama nie dodano do repo.
Wyjątkiem jest wybrany 2026-10-09 portret „O mnie”, zapisany jako PNG i WebP.

## Zdjęcie ukończenia

[diploma.jpg](diploma.jpg) to kadr 1440×1920 z karuzeli
[Instagram](https://www.instagram.com/p/DOMPRWmjXWX/), drugie zdjęcie.
Aleksandra stoi przed Wydziałem Zdrowia Publicznego ŚUM w Bytomiu, z różową
teczką dyplomu i czerwonymi różami. Plik jest pełnym kadrem. `SiteImage`
przycina go przy budowaniu do slotu 340×380, od góry, żeby zostały tabliczki
wydziału.

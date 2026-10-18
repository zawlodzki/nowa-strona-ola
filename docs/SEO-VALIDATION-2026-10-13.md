# Zewnętrzna walidacja danych strukturalnych

Data odbioru: 13.10.2026. Sprawdzano publiczną produkcję
`https://aleksandraolesiewicz.com`, przez formularze URL w
[Schema Markup Validator](https://validator.schema.org/) i
[Google Rich Results Test](https://search.google.com/test/rich-results).
Test Google używał klienta na smartfony i istniejącej zalogowanej sesji Chrome.

Schema Markup Validator zakończył dwanaście prób bez błędów i ostrzeżeń.
Google sprawdza kwalifikację do obsługiwanych wyników rozszerzonych.
Brak wykrytych elementów Google nie oznacza błędu całego grafu Schema.org.
Wyniki testu nie potwierdzają indeksacji ani faktycznego wyświetlania
elementów rozszerzonych w wyszukiwarce.

## Macierz odbioru

Każdy wiersz reprezentuje osobny typ strony z inwentarza SEO. Dokumenty
prawne mają wspólny renderer; sprawdzono politykę prywatności.
Paginacja, pozostałe produkty i pozostałe artykuły nie były osobnymi
próbami zewnętrznymi. Publiczne EN jest wyłączone. Produkcja nie zawiera
odrębnego reprezentanta dowolnej strony `page`; odstąpienie jest jej
publicznym odpowiednikiem z grafem `WebPage`.

| Typ               | Adres produkcji                | Schema.org            | Google                                                                                                                    |
| ----------------- | ------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Strona główna     | `/`                            | 0 błędów, 0 ostrzeżeń | [Brak elementów](https://search.google.com/test/rich-results/result?id=2YKIOevjGISGlFhejrtKQg)                            |
| O mnie            | `/o-mnie/`                     | 0 błędów, 0 ostrzeżeń | [1 prawidłowy ProfilePage](https://search.google.com/test/rich-results/result?id=xKlJ_LRC_ZbgaQBFd45Pgg)                  |
| Konsultacje       | `/konsultacje/`                | 0 błędów, 0 ostrzeżeń | [Brak elementów](https://search.google.com/test/rich-results/result?id=ow-3ZAubLL48aFmpOR9gng)                            |
| Kontakt           | `/kontakt/`                    | 0 błędów, 0 ostrzeżeń | [Brak elementów](https://search.google.com/test/rich-results/result?id=kZsi6tej5_n2Xx8KqBToug)                            |
| Indeks bloga      | `/blog/`                       | 0 błędów, 0 ostrzeżeń | [1 prawidłowy BreadcrumbList](https://search.google.com/test/rich-results/result?id=hh9DNGfKYBKgOAzI3rhuqw)               |
| Kategoria bloga   | `/blog/kategoria/pcos/`        | 0 błędów, 0 ostrzeżeń | [1 prawidłowy BreadcrumbList](https://search.google.com/test/rich-results/result?id=MhwIjWMZaDiO6dv6wWS6Bg)               |
| Artykuł           | `/blog/pcos-co-to-za-choroba/` | 0 błędów, 0 ostrzeżeń | [2 prawidłowe elementy, 4 uwagi opcjonalne](https://search.google.com/test/rich-results/result?id=8VRGC3ibwoADt1r0nVCDig) |
| Kolekcja e-booków | `/ebooki/`                     | 0 błędów, 0 ostrzeżeń | [1 prawidłowy BreadcrumbList](https://search.google.com/test/rich-results/result?id=VTmV2c8cw0FyQdChAVb7jg)               |
| Temat e-booków    | `/ebooki/kategoria/pcos/`      | 0 błędów, 0 ostrzeżeń | [1 prawidłowy BreadcrumbList](https://search.google.com/test/rich-results/result?id=0G0idOJRXTc-JiwqCGrW7w)               |
| Landing e-booka   | `/ebooki/suplementy-w-pcos/`   | 0 błędów, 0 ostrzeżeń | [1 nieprawidłowy Product](https://search.google.com/test/rich-results/result?id=5DkQttoZziq_PhzU9zoY4w)                   |
| Dokument prawny   | `/polityka-prywatnosci/`       | 0 błędów, 0 ostrzeżeń | [1 prawidłowy BreadcrumbList](https://search.google.com/test/rich-results/result?id=QsR4Kd0ZWdJCTqY67BPr9w)               |
| Odstąpienie       | `/odstapienie/`                | 0 błędów, 0 ostrzeżeń | [Brak elementów](https://search.google.com/test/rich-results/result?id=sVPMt7dWWkAh3NFbmwPv5g)                            |

## Daty artykułu

Google zgłasza cztery opcjonalne uwagi przy `BlogPosting`. `datePublished`
i `dateModified` mają wartość `2026-10-12`. Dla każdego pola test wskazuje
nieprawidłową wartość daty i godziny oraz brak strefy czasowej.
Artykuł pozostaje prawidłowym elementem Google.

Nie dopisano umownej godziny do danych. Do usunięcia uwag trzeba ustalić
rzeczywisty timestamp redakcyjny albo zachować dokładność do dnia i
zaakceptować ograniczenie. To nie jest powód do użycia czasu buildu czy
Sanity `_updatedAt` jako daty aktualizacji artykułu.

## FAQ w Google

Google usunął wyniki rozszerzone FAQ od 7.05.2026 i ich dokumentację w
czerwcu. Brak `FAQPage` w Rich Results Test nie oznacza błędu poprawnego
schematu FAQ. Źródło: [aktualizacje Google Search Central](https://developers.google.com/search/updates).

## Poprawka zapowiadanego e-booka

Produkcja z typem `Product` i `Book` ma jeden krytyczny problem Google.
Test wymaga `offers`, `review` lub `aggregateRating`. Żadne z tych danych
nie jest obecnie prawdziwą ofertą ani recenzją zapowiadanego materiału.
Nie dodano fikcyjnych danych. Źródło wymagań:
[Google Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

Lokalny `ebookGraph` emituje `Book`, gdy nie tworzy rzeczywistego `Offer`.
Przy zakupie lub przedsprzedaży z checkoutem emituje `Product` i `Book`.
Identyfikator `#product`, autor, format i referencje pozostają zgodne.
Nie zmienia to ceny, dostępności ani treści na stronie.

Cztery przypadki regresji nie przeszły przed poprawką. Po poprawce 20
testów SEO PASS. Testy obejmują zapowiedź i wstrzymanie nawet z checkoutem,
brak checkoutu dla sprzedaży i przedsprzedaży oraz rzeczywistą ofertę
z ceną, walutą, sprzedawcą i dostępnością. Niezależny przegląd nie znalazł
usterek. Pełne `PLAYWRIGHT_WORKERS=4 npm run verify` PASS, exit 0 na
Node 26.11.0. 444 unit, 468 E2E PASS, 9 warunkowych pominięć. Symulacja
Content Lake zwalidowała 88 dokumentów bez błędów. JS 9685 B gzip,
CSS 30645 B gzip; kontrola SEO objęła 36 stron.

Graf zbudowany przez lokalny renderer odczytano z DOM landingu i wklejono
do trybu kodu obu walidatorów. Schema.org zgłosił zero błędów i ostrzeżeń.
[Google nie wykrył już nieprawidłowego Product](https://search.google.com/test/rich-results/result?id=tSrUYfO5-NVLwCiwnKri4A).
Nie wykrył też wyniku rozszerzonego, co odpowiada Book bez oferty.
Graf ma 7336 znaków; kopia jest w `corrected-book.json` w katalogu dowodów.
SHA-256 wynosi `2680d330b5fed9f0babcf9ced23aad2f9556b4ad70ec7864cb99c9ec71819f18`.

Test trybu kodu dotyczył lokalnego artefaktu na fixture’ach. Macierz
powyżej zachowuje wyniki produkcji sprzed poprawki. Poniżej zapisano
osobny odbiór publicznego URL po wdrożeniu; wynik trybu kodu nie został
przypisany do produkcyjnego URL.

## Odbiór po publikacji PR #99

13.10.2026 opublikowano main `ba89bac86b6a9929fa1376e0efd2b17073489b28`.
[Staging](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38423517711)
i [produkcja](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38423922736)
zakończyły się SUCCESS. Oba przebiegi wykonały kontrole i build na
opublikowanych danych Sanity, z 460 testami jednostkowymi na Node 24.

Publiczny landing zwrócił HTTP 200. Odczyt HTML potwierdził `Book` bez
`offers`, nazwę „Suplementy w PMOS (PCOS)” i widoczny status „Wkrótce dostępny”.
Tytuł pozostaje „Suplementy w PMOS (PCOS) | E-book Aleksandry Olesiewicz”.
SHA-256 odczytanego HTML:
`7fec5bfb31e35f5b1f4e199892ee2a220adcc6cf7261d2a8c810158becf71881`.

[Google Rich Results Test dla produkcyjnego URL](https://search.google.com/test/rich-results/result?id=TLOElmQn9AzV39UZq5x_ww)
zakończył próbę o 17:42:33 CEST, klient na smartfony. Wynik: „Nie wykryto
żadnych elementów”. Nieprawidłowy Product nie występuje. Book bez oferty
nie kwalifikuje się tu do wyniku rozszerzonego; test nie potwierdza indeksacji.

Po zatwierdzeniu nowej CAPTCHA przez użytkownika dokończono
[test produkcyjnego URL w Schema.org](https://validator.schema.org/#url=https%3A%2F%2Faleksandraolesiewicz.com%2Febooki%2Fsuplementy-w-pcos%2F)
o 17:56 CEST. Wynik: **0 błędów i 0 ostrzeżeń**. Walidator pokazuje
dwa główne elementy: Organization oraz FAQPage; pozostałe węzły grafu
są powiązane referencjami. To osobny odbiór URL po publikacji, a nie
przypisanie poprzedniego wyniku lokalnego grafu do aktualnej produkcji.

Ponowny odczyt 12 reprezentatywnych stron zwrócił HTTP 200 i poprawny JSON-LD.
To odczyt artefaktów, nie dwanaście nowych prób zewnętrznych walidatorów.
Dowody, manifest SHA-256, HTML przed i po wdrożeniu oraz zrzuty wyników Google i Schema.org:
`/private/tmp/ola-pr99-deployment/`. Nie wysyłano formularzy leada.

## Dowody i ograniczenia

Publiczny HTML i wyodrębnione grafy JSON-LD dwunastu stron zapisano w
`/private/tmp/ola-seo-validation/`. `manifest.json` zawiera adresy, typy
i SHA-256 pobranych HTML. Skrypt `fetch-pages.py` ponawia odczyt produkcji;
nie zastępuje zewnętrznych walidatorów. Linki wyników Google mogą wygasnąć.

Próby Google w anonimowej sesji zatrzymały się komunikatem o logowaniu,
także w trybie kodu. Nie uznano ich za wyniki walidacji. Dalsze testy URL
prowadzono w istniejącej zalogowanej sesji Chrome. Schema.org zatrzymał
przebieg przez CAPTCHA; po wyraźnej zgodzie użytkownika rozwiązano ją
i dokończono cztery brakujące próby.

Nie zmieniano danych Sanity, dostępności produktów ani konfiguracji
pomiaru. Nie wysyłano formularzy leada. Lokalna poprawka grafu e-booka
i jej kontrole są opisane poniżej.

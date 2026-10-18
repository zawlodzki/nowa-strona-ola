# Logotypy metod płatności

Pobrano 18.10.2026. Pliki są lokalnymi zasobami importowanymi przez Astro.
Nie wymagają zewnętrznych żądań przeglądarki. Nie zmieniono geometrii ani kolorów.
Manifest [sources.json](./sources.json) zawiera przypięte źródła i sumy SHA-256
oryginałów oraz plików dystrybuowanych.

## Apple Pay, Google Pay, BLIK, Visa, Mastercard i Klarna

Źródłem sześciu plików jest kolekcja
[Datatrans payment-logos](https://github.com/datatrans/payment-logos/tree/b4175c79813792f1e2ab16c10cfd9f15d5af0e77).
Wersja `b4175c79813792f1e2ab16c10cfd9f15d5af0e77`.
Autor kolekcji udostępnia ją na licencji
[Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/).
Pełny tekst zachowano w [LICENSE-datatrans.txt](./LICENSE-datatrans.txt).
Do każdego z tych SVG dodano wyłącznie metadane atrybucji. Same znaki i układ
pozostają bez zmian. Licencja kolekcji nie przenosi praw do znaków towarowych.

Pliki `apple-pay.svg`, `google-pay.svg`, `blik.svg`, `visa.svg`, `mastercard.svg`
i `klarna.svg` mają `viewBox="0 0 120 80"` i własne tło karty płatności.
Należy zachować ich proporcje.

## Revolut Pay

Plik `revolut-pay.svg` pochodzi z
[oficjalnego przykładu integracji Revolut](https://github.com/revolut-engineering/revolut-checkout-example/blob/de907bdd8cbe049d521e11b977c5acdacccddd24/images/logo-revolut-pay.svg).
Wersja `de907bdd8cbe049d521e11b977c5acdacccddd24`. Zachowano oryginalny plik.
Ten znak nie jest objęty licencją kolekcji Datatrans.

Zastosowanie określają
[wytyczne marki Revolut Pay](https://developer.revolut.com/docs/resources/revolut-pay-button-guidelines).
Znak służy do prezentowania akceptowanej metody płatności obok innych metod.
Nie wolno zmieniać znaku ani jego proporcji. Wokół niego należy pozostawić
wolną przestrzeń co najmniej równą jednej ósmej jego wysokości.

Oryginał jest białym znakiem bez tła, z `viewBox="0 0 278 51"`.
Należy umieścić go na ciemnym tle zapewniającym kontrast.

## Kontrola plików

Wszystkie siedem plików przeszło parsowanie XML. Kontrola odrzucała skrypty,
obsługę zdarzeń, obce dokumenty, obrazy, animacje, odwołania do zewnętrznych
zasobów i adresy `javascript:`. Wewnętrzne odwołania SVG do gradientów i filtrów
pozostają dozwolone. Nie uruchamiano pełnego zestawu testów aplikacji.

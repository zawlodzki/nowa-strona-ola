# Mapa weryfikacji strony Oli

Ten katalog jest źródłem weryfikacji zachowania, które widzi użytkownik publicznego serwisu. Przed jazdą przeczytaj indeks, potem plik funkcji.

## Baseline preconditions

- Zbuduj serwis bez `PUBLIC_SANITY_*`, żeby strony pochodziły z fixture’ów.
- Ustaw `VERIFY_RUN_ID` i uruchom podgląd skillen `verify-ola` na porcie 4340–4390.
- `verify.mjs doctor` musi potwierdzić pid, port i znacznik `Aleksandra Olesiewicz — strona główna`.
- Nie prowadź instancji, której nie uruchomił ten przebieg. Porty 4321 i 4322 są poza tym skillen.
- Równoległe przebiegi dostają osobne `VERIFY_RUN_ID` i osobne porty. Wspólny jest tylko odczyt `dist/`.

## Driving conventions

- Zaczynaj przepis od stanu bazowego, chyba że jego warunki mówią inaczej.
- Wybieraj role ARIA i dostępne nazwy.
- Traktuj komendy jako dosłowne. Nie zmieniaj cudzysłowów ani flag.
- Akcje przeglądarki idą przez `node .cursor/skills/verify-ola/scripts/verify.mjs browser …`.
- Po mutacji formularza zostaw dowód. Cleanup nie usuwa katalogu dowodów.

## Proof and skip reporting

- Zapisuj akcję użytkownika i stan po niej, nie tylko ostatni ekran.
- Dowód UI to snapshot ARIA i zrzut z widoczną tożsamością strony.
- Skutek uboczny formularza to lista POST z sesji. Oczekiwana lista jest pusta.
- Przy każdym artefakcie zapisz identyfikator funkcji i użyte wejście.
- Niedostępną ścieżkę zgłoś z komendą i niespełnionym warunkiem.
- Nie oznaczaj pominiętego wejścia jako sprawdzonego inną ścieżką.

## Feature entry contract

Każdy plik ma H1, jeden akapit zachowania widocznego dla użytkownika i dokładnie cztery nagłówki H2 w tej kolejności: `Sub-features`, `How to get to it (user POV)`, `Driving it with verify-ola`, `Gotchas`.

## Features

- [Formularz demonstracyjny](./home-form.md) sprawdza walidację na stronie głównej i brak wysyłki.
- [Strona O mnie](./about.md) otwiera `/o-mnie/` i `/en/about/`, ramkę dyplomu i newsletter bez POST.
- [Landing konsultacji](./consultation.md) otwiera `/konsultacje/` i `/en/consultations/`, cenę z usługi, Cal.com jako placeholder i FAQ bez POST.
- [Landing e-booka](./ebook.md) otwiera `/ebooki/suplementy-w-pcos/` z karty homepage, 97 zł brutto, status zapowiedzi i brak POST.
- [Kolekcja e-booków](./ebook-collection.md) otwiera `/ebooki/` i `/en/ebooks/`, kategorie bez JS, karty z `ebookPath` i brak POST.
- [Przełącznik języka](./language.md) prowadzi z PL na EN i z powrotem, w tym stronę bez tłumaczenia.
- [Dialog katalogu](./catalog-dialog.md) otwiera i zamyka dialog „Jak pracujemy”.
- [Katalog 3a](./design-system.md) otwiera `/design-system/`, motyw i karuzelę.
- [Kolekcja bloga](./blog-collection.md) otwiera `/blog/` i `/en/blog/`, paginację, kategorię i pustą kategorię, bez POST.
- [Artykuł na blogu](./blog-article.md) wchodzi z listy bloga w artykuł i angielski odpowiednik.
- [Strona bez skryptów](./static-page.md) sprawdza `/static/` przy wyłączonym JavaScript.

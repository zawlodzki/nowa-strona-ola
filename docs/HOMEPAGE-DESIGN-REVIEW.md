# Przegląd Impeccable sześciu makiet — 2026-10-06

Raport opisuje stan przed poprawkami. Użytkownik następnie zlecił wdrożenie
pakietu i publikację; rzeczywiste zmiany i kontrole zapisano w
[postępie](PROGRESS.md#wdrożenie-poprawek-impeccable--2026-10-06).
Wynik 24/32 pozostaje oceną poprzedniego stanu, nie nowym pomiarem.

Metoda: dwie niezależne oceny — A: `/root/design_review`, B:
`/root/detector_browser`. Tryb Persuade. Użytkownik zatwierdził użycie
subagentów; zakres obejmuje ocenę i propozycje przed zmianami.

## Werdykt

Makiety mają świadomą typografię, spójne fotografie i trzy odrębne kierunki.
Nie ma podstaw do wymiany całej oprawy. Największe wrażenie zamienności tworzą
ogólne slogany oraz ten sam motyw posiłku na sześciu produktach o różnych
zadaniach. W 03/3a dochodzi powtarzalność różowych, zaokrąglonych paneli.
Przypięte fonty, palety, trzy karty e-booków i białe warianty realizują brief;
nie są automatycznie oznaką AI slopu.

| Wariant | Ocena                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 01      | Najbardziej zdyscyplinowany układ; do doprecyzowania język i tożsamość produktów.                                                     |
| 1a      | Najbardziej obiecujący balans osobowości i powściągliwości; zachować geometrię oraz wiśnię, róż i matchę.                             |
| 02 / 2a | Spokojne i konsekwentne; najbliżej typowej estetyki wellness. Biel 2a pomaga oddzielić sekcje, ale nie zmienia ogólnikowego przekazu. |
| 03 / 3a | Wyraziste; zbyt podobne panele spłaszczają rytm. Biel 3a wyraźniej eksponuje portrety i produkty.                                     |

## Ocena heurystyczna

Wynik **24/32** dotyczy wspólnej struktury i zachowania makiet, nie gotowości
produkcyjnego sklepu ani certyfikacji dostępności.

| #   | Heurystyka Nielsena              | Ocena | Uzasadnienie                                                                                           |
| --- | -------------------------------- | ----- | ------------------------------------------------------------------------------------------------------ |
| 1   | Widoczność stanu                 | 3/4   | Licznik biblioteki, krańcowe stany strzałek i jawny status demonstracji formularza.                    |
| 2   | Język odbiorczyni                | 3/4   | PCOS i perimenopauza są czytelne, lecz hasła pozostają ogólne.                                         |
| 3   | Kontrola i swoboda               | 4/4   | Natywne przewijanie, brak autoplay, statyczna treść; zachowanie klawiatury oceniono również ze źródła. |
| 4   | Spójność i standardy             | 3/4   | Wspólne wzorce CTA; etykieta kontaktu nie wskazuje jasno newslettera.                                  |
| 5   | Zapobieganie błędom              | 3/4   | Oznaczenia przykładów i walidacja; brak checkoutu jest zakresem makiety.                               |
| 6   | Rozpoznawanie zamiast pamiętania | 2/4   | Pierwsza grupa produktów pokazuje tylko PCOS.                                                          |
| 7   | Elastyczność i wydajność         | n/a   | Powierzchnia Persuade, nie narzędzie do powtarzalnej pracy.                                            |
| 8   | Estetyka i minimalizm            | 3/4   | Dobra hierarchia; powtarzalne motywy i hasła.                                                          |
| 9   | Pomoc przy błędach               | 3/4   | Czytelne komunikaty formularza w kodzie; pełnego testu formularza nie powtarzano.                      |
| 10  | Pomoc i dokumentacja             | n/a   | Strona sprzedażowa nie wymaga osobnego systemu pomocy.                                                 |

Obciążenie poznawcze: umiarkowane, 2/8 punktów checklisty wymagają uwagi:
rozpoznawanie właściwej części oferty i ujawnianie jej w odpowiednim momencie.
Hero ma dwa CTA, nawigacja trzy pozycje. Sześciopozycyjny przełącznik służy
feedbackowi, nie należy do docelowego serwisu.

Podróż emocjonalna: portrety i język bez presji budują kontakt, lecz sekcje
efektów i O mnie nie przechodzą jeszcze od troski do konkretnego dowodu
kompetencji. Produkty powinny być szczytem konkretu; wspólna fotografia osłabia
rozróżnienie tematów. Konsultacja przywraca kontakt z osobą. Newsletter powinien
jasno określać zawartość i częstotliwość po ich ustaleniu.

## Pięć priorytetów do zatwierdzenia

1. **P2 — Strzałki zależne od fontu systemowego.** Publiczne CTA używają
   U+2197, a slidery U+2190/U+2192, bez variation selectors. CDP w Chrome/macOS
   potwierdził Hiragino Sans W3 dla ukośnej strzałki i ArialMT dla bocznych.
   Nie odtworzono Apple Color Emoji. Propozycja: spójne SVG z `currentColor`
   i `aria-hidden`, zachowujące kierunki i istniejące dostępne nazwy przycisków.
   Źródło: `mockups/homepage/wonderful-cherry.html`, CTA i kontrolki karuzel;
   analogicznie pięć pozostałych. Polecenie: `$impeccable polish`.
2. **P1 — Perimenopauza ukryta za pierwszą grupą PCOS.** Obie grupy są w
   obietnicy hero, ale pierwsze trzy karty desktop dotyczą wyłącznie PCOS.
   Propozycja: dwa wejścia PCOS / Perimenopauza przesuwające bibliotekę do grupy,
   albo pierwszy widok zawierający obie grupy. Zachować trzy widoczne karty.
   Źródło: `wonderful.html:175`, pierwsza karta `:211`, perimenopauza `:299`;
   kolejność wspólna dla sześciu makiet. Polecenie: `$impeccable clarify`.
3. **P2 — Ogólne slogany i mało konkretu o kompetencjach.** „Twój rytm” oraz
   „po swojemu” nie wyróżniają metody Aleksandry. Propozycja: doprecyzować hero
   i 2–3 H2, uzupełnić O mnie o potwierdzoną kwalifikację, zakres i metodę pracy.
   Bez wymyślania faktów i wyników medycznych. Źródło: `wonderful.html:53`,
   `:107`, `:163`; `botanical.html:55`; `cherry.html:55`.
   Polecenie: `$impeccable clarify`.
4. **P2 — Jedzenie nie odróżnia sześciu różnych narzędzi.** Ta sama fotografia
   na okładkach sugeruje poradniki z przepisami również przy badaniach,
   suplementach i dzienniku. Propozycja: wspólna rodzina okładek, osobne motywy
   wynikające z zawartości: tabela decyzji, schemat, dziennik, oś obserwacji.
   Źródło: `base.css:514` i `.cover-art` sześciu produktów.
   Polecenie: `$impeccable shape`.
5. **P2 — Monotonia paneli w 03/3a.** Podobne różowe powierzchnie grupują
   marki, efekty, produkty, konsultację i opinie. Propozycja: otworzyć sekcję
   marek lub opinii, zachowując wiśnię, mocny Switzer i miękką geometrię.
   Źródło: `cherry.css`, `.partner-logos`, `.results article`, `.book-stage`,
   `.consultation-panel`, `.review-card:nth-child(even)`.
   Polecenie: `$impeccable distill`.

Nie stwierdzono P0 w zakresie makiet. P1: 1, P2: 4 priorytety.

## Detektor i weryfikacja kontekstu

Detektor uruchomiono dokładnie raz, exit 2: **196 sygnałów**, w tym **190** w
sześciu makietach. Są to powtarzane wystąpienia wzorców, nie 196 potwierdzonych
błędów. Wykrycia DOM mają numer linii 0; nie należy używać go jako lokalizacji.

| Reguła                      | Katalog | Sześć makiet |
| --------------------------- | ------: | -----------: |
| side-tab                    |      24 |           22 |
| cramped-padding             |      14 |           14 |
| extreme-negative-tracking   |      37 |           34 |
| tiny-text                   |      36 |           36 |
| undersized-ui-text          |      72 |           72 |
| gpt-thin-border-wide-shadow |       6 |            6 |
| kicker-above-heading        |       7 |            6 |

Fałszywe klasyfikacje: wszystkie 72 undersized-ui-text dotyczą napisów na
ilustracjach okładek, nie funkcjonalnych kontrolek. Side-tab dotyczy grzbietów
książek. Sześć cienkich obrysów z cieniem dotyczy przełącznika makiet. Zerowy
padding zewnętrznej sekcji nie uwzględnia wewnętrznego `.container`.

Rzeczywiste parametry wymagające decyzji: przypisy 11 px, ciasny tracking,
powtarzane nadtytuły. Małe przypisy o statusie demonstracji warto powiększyć;
nie usuwać ich. Nadtytułów i trackingu nie należy zmieniać mechanicznie tylko
dlatego, że detektor przekroczył próg.

## Persony i mocne strony

- Nowa odbiorczyni z PCOS: rozumie ofertę, ale nie widzi jeszcze wyraźnej metody
  pracy; fotografia posiłku na poradniku o badaniach może mylić.
- Kobieta w perimenopauzie: musi odkryć drugą część biblioteki, zanim zobaczy
  produkty dla siebie.
- Sceptyczna odbiorczyni konsultacji: potrzebuje potwierdzonych kwalifikacji
  i przebiegu pracy, nie kolejnego ogólnego zdania o trosce.

Zachować spójne portrety, dwa CTA, czytelną hierarchię i natywne slidery bez
autoplay. Przykładowe liczby, opinie i ceny są widocznie oznaczone, a formularz
nie udaje rzeczywistego zapisu. Nie zastępować ich fikcyjnymi dowodami.

Drobne uwagi: etykieta „Bądźmy w kontakcie” prowadzi do newslettera; nakładka
porównania może zasłaniać fragment zdjęcia/ceny na mobile; Cherry przy 320 px
łamie hero na trzy linie. To propozycje do decyzji, bez automatycznych poprawek.

## Decyzje przed implementacją

1. Zakres: same SVG / SVG i dopracowanie treści oraz okładek / pełny powyższy
   pakiet, z poprawą rytmu 03/3a i drobnej czytelności.
2. Biblioteka: przełączniki PCOS / Perimenopauza / mieszany pierwszy widok /
   zachowanie obecnej kolejności.

Zmiany UI, publikacja i przeniesienie do Astro/Sanity pozostają wstrzymane do
odpowiedzi użytkownika. Raport nie oznacza wdrożenia propozycji.

## Zakres rzeczywistych kontroli

A: publiczne HTTPS, wszystkie sześć pełnych desktopowych zrzutów 1440 px oraz
hero/biblioteka wszystkich sześciu przy 390 px. CUA timeout; osobny Playwright
Chromium z mapowaniem DNS i pełnym TLS. Przeglądarkę zamknięto, 24 własne
tymczasowe zrzuty usunięto. Bez detektora i wyników B przed ukończeniem oceny.

B: własna karta Chrome/CUA, sześć desktopów 1988 px i mobile 320 × 800. Brak
poziomego overflow i uszkodzonych zakończonych obrazów, CTA 265 × 50 px przy
320 px; końcowe logi publicznego /1a bez warning/error. Lokalnie favicon.ico 404.
CDP potwierdził rzeczywiste fonty strzałek.

Publiczny CSP blokował inline preflight. Overlay wykonano lokalnie na trzech
reprezentatywnych rodzinach: logi Wonderful 20, Botanical 29, Cherry 32.
Widoczność potwierdzona dla Wonderful/Cherry; dla Botanical tylko wykonanie
w logu. Overlay nie pozostał do oglądania; własna karta wróciła na publiczne
/1a i zresetowano viewport. Własne serwery detektora i portu 8793 zatrzymano.
Dowody B zostały w `/tmp/ola-assessment-b`, poza publiczną paczką.

Nie powtarzano pełnej klawiatury, natywnego zoomu 200%, reduced motion,
Safari/VoiceOver ani pomiarów Lighthouse/CWV. Nie deklaruje się pełnego WCAG AA.
Nie zmieniono makiet, aplikacji, zależności ani publicznego wdrożenia.

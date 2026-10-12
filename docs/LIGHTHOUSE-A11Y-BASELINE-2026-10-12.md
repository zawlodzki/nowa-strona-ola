# Pomiar bazowy Lighthouse i WCAG, 12.10.2026

Zapis liczb sprzed Google Tag Managera. Kod, style i komponenty strony nie były zmieniane. Surowe JSON, PNG i katalog dowodów nie wchodzą do repozytorium.

Cel wydajności z [planu wdrożenia](IMPLEMENTATION-PLAN.md) to co najmniej 95 przed tagami, na reprezentatywnych szablonach, i osobny pomiar po tagach. To samo mówi [CODE-QUALITY.md](CODE-QUALITY.md). [Plan SEO](SEO-GEO-AEO-PLAN.md) każe mierzyć Lighthouse przed tagami i po ich uruchomieniu. [Plan GTM i c15t](GTM-C15T-DEPLOYMENT-PLAN.md) nie nazywa Lighthouse. Jego macierz UI prosi o desktop, 390 px, 320 px, klawiaturę, natywny zoom 200%, reduced motion i axe.

## Warunki przebiegów

Punktowane tabele lokalne pochodzą z buildu fixture bez `PUBLIC_SANITY_*`, na commicie `9a37ca8`. Flaga `SITE_INDEXING=production` ustawia w HTML `index,follow,max-image-preview:large`. W `dist/index.html` nie ma ciągu `googletagmanager`. Node przy buildzie to 24.21.0.

Lighthouse 13.5.0, HeadlessChrome 154.0.0.0, pakiet Chrome 154.0.8037.92. Kategorie to performance, accessibility, best-practices i seo. Trzy przebiegi na szablon i formę. Liczba w tabeli jest medianą. Wynik kategorii to mediana trzech wyników zaokrąglonych do liczby całkowitej.

Wagi wydajności w raporcie to FCP 10, LCP 25, TBT 30, CLS 25 i Speed Index 10. Mobile używa symulacji z raportu. RTT 150 ms, przepustowość 1638,4 kb/s, opóźnienie żądania 562,5 ms, pobieranie 1474,56 kb/s, spowolnienie CPU 4. Ekran 412 na 823, skala 1,75. Desktop używa RTT 40 ms, przepustowości 10240 kb/s i spowolnienia CPU 1. Ekran 1350 na 940.

Serwer pomiaru to HTTPS i HTTP/2 na `127.0.0.1:4401`, z własnym certyfikatem. Tekst idzie brotli na poziomie 11, a przy braku obsługi gzip na poziomie 9. Pliki `/_astro/` mają cache na rok i `immutable`. HTML ma `max-age=0` i `must-revalidate`. `GET /api/c15t/init` zwraca `tests/fixtures/c15t/init.json` ze statusem 200. Bez tej odpowiedzi klient zgody na localhost woła `/api/c15t` i dostaje 404, a Best Practices spada. Fixture zwraca status 200.

Próbny przebieg strony głównej mobile po HTTP/1.1, bez tej odpowiedzi, dał wydajność 85 i LCP 4436 ms. Ten sam HTML po HTTP/1.1 z odpowiedzią fixture dał wydajność 84 i LCP 4480 ms. Próbny przebieg HTTP/2 dał wydajność 93 i LCP 3184 ms. Tabele poniżej używają HTTP/2. Próbne przebiegi nie wchodzą do mediany.

Lokalne 54 przebiegi zostały. `failures.json` ma pustą listę. Koniec partii to 2026-10-12T17:19:03Z, load 0,95 na 4 rdzeniach. Trzy przebiegi strony głównej mobile mają `benchmarkIndex` 3326,5, 3696,5 i 3833, a LCP od 3151 ms do 3153 ms. Indeks CPU zmienił się między przebiegami. LCP został w zakresie 2 ms. Ograniczeniem wyniku jest symulowany transfer obrazu. Mediana TTFB wynosi 1 ms, bo odpowiedź idzie z pętli zwrotnej. TTFB hosta wdrożenia jest w tabeli stagingu.

Staging `https://ola-website-staging.zawlodzki.workers.dev/` odpowiedział HTTP/2 200 z `x-robots-tag: noindex`. W HTML strony głównej nie ma ciągu `googletagmanager`. Treść bloga i artykułu różni się od fixture. Artykuł fixture `/blog/przygotowanie-do-konsultacji-pcos/` daje tam 404. Pomiar artykułu na stagingu używa `/blog/pcos-co-to-za-choroba/`. Zgoda na stagingu idzie do żywego hosta, nie do fixture.

Jeden przebieg desktop kolekcji e-booków na stagingu został usunięty przed tabelą, bo miał ostrzeżenie o zbyt wolnym wczytaniu. Plik tego przebiegu już nie istnieje, więc jego wynik nie da się odczytać ponownie. Zostawiony trzeci przebieg ma wydajność 100, LCP 528 ms i pustą listę ostrzeżeń. Trzy przebiegi w tabeli mają wydajność 100.

Axe w kontroli ręcznej to pakiet projektu 4.13.0, tagi `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` i `wcag22a`. Lighthouse niesie axe-core 4.14.0. Kontrole 320 px, fontu, zoomu CSS, klawiatury, reduced motion i forced colors szły na ten sam lokalny HTTPS. Natywny zoom przeglądarki zostaje poza tymi kontrolami.

Zrzuty tożsamości stron są z podglądu verify-ola na `http://127.0.0.1:4340`. Ten podgląd nie kompresuje odpowiedzi i nie podstawia fixture zgody. Nie jest warunkiem Lighthouse. Katalog dowodów to `/tmp/ola-verify-evidence/ola-baseline-20261012/`. JSON Lighthouse i raport axe zostały w `/tmp/ola-baseline/`.

## Szablony

Strona główna `/`. O mnie `/o-mnie/`. Konsultacje `/konsultacje/`. Kolekcja e-booków `/ebooki/`. Landing `/ebooki/suplementy-w-pcos/`. Blog `/blog/`. Artykuł lokalny `/blog/przygotowanie-do-konsultacji-pcos/`. Kontakt `/kontakt/`. Strona prawna `/polityka-prywatnosci/`.

## Wyniki lokalne, mobile

Gdzie tabela podaje jedną liczbę wydajności, trzy przebiegi dały ten sam wynik. LCP strony głównej mieści się w 2 ms. Najszerszy lokalny rozrzut LCP to konsultacje, od 1957 ms do 2044 ms. Mediana TBT wynosi 0 ms. Pojedyncze przebiegi sięgają 31 ms na konsultacjach, 33 ms na landingu i 29 ms na polityce. CLS wynosi 0 w 54 przebiegach lokalnych. Dobre praktyki i SEO wynoszą 100 na każdym szablonie i w obu formach.

| Strona               | Wydajność | Dostępność | LCP ms | FCP ms | TBT ms | CLS |
| -------------------- | --------: | ---------: | -----: | -----: | -----: | --: |
| Strona główna        |        94 |        100 |   3152 |    902 |      0 |   0 |
| O mnie               |        91 |        100 |   3452 |    910 |      0 |   0 |
| Konsultacje          |        99 |        100 |   1981 |    931 |      0 |   0 |
| Kolekcja e-booków    |        99 |         96 |   2251 |    929 |      0 |   0 |
| Landing e-booka      |       100 |        100 |   1088 |    938 |      0 |   0 |
| Blog                 |        78 |        100 |   6003 |    927 |      0 |   0 |
| Artykuł              |        88 |         97 |   3902 |    902 |      0 |   0 |
| Kontakt              |       100 |        100 |   1524 |    924 |      0 |   0 |
| Polityka prywatności |       100 |        100 |   1100 |    950 |      0 |   0 |

Cztery szablony mobile są poniżej celu 95. Blog 78, artykuł 88, O mnie 91 i strona główna 94. Pięć jest na celu albo wyżej.

Na stronie głównej FCP, TBT, CLS i Speed Index są w pasmie, które samo dawałoby wysoki wynik. LCP 3152 ms ściąga medianę do 94. Speed Index równa się FCP, 902 ms. Ograniczeniem jest obraz. Mediana TTFB wynosi 1 ms. Mediana TBT wynosi 0 ms.

## Wyniki lokalne, desktop

Dobre praktyki i SEO wynoszą 100. TBT i CLS wynoszą 0. Mediany FCP mieszczą się od 242 ms do 252 ms. Rozrzut LCP zostaje poniżej 16 ms. Wydajność bloga wynosi 99. Pozostałe szablony mają 100.

| Strona               | Wydajność | Dostępność | LCP ms |
| -------------------- | --------: | ---------: | -----: |
| Strona główna        |       100 |        100 |    602 |
| O mnie               |       100 |        100 |    682 |
| Konsultacje          |       100 |        100 |    446 |
| Kolekcja e-booków    |       100 |         96 |    481 |
| Landing e-booka      |       100 |        100 |    290 |
| Blog                 |        99 |        100 |   1041 |
| Artykuł              |       100 |         97 |    723 |
| Kontakt              |       100 |        100 |    367 |
| Polityka prywatności |       100 |        100 |    292 |

## Waga transferu, mobile

Bajty pochodzą z przebiegu, którego wydajność jest medianą. JS to jeden moduł, 4146 B, na każdej z tych stron. Font to jedno żądanie, 43286 B. CSS to dwa arkusze. Kolumna CSS jest sumą ich transferu brotli. Przegląd z 08.10 podaje osobną tabelę gzip.

| Strona               |   Razem |  Obraz |  HTML |  CSS |   JS |  Font |
| -------------------- | ------: | -----: | ----: | ---: | ---: | ----: |
| Strona główna        |  938648 | 868870 | 13607 | 7333 | 4146 | 43286 |
| O mnie               |  529903 | 463748 | 10015 | 7302 | 4146 | 43286 |
| Konsultacje          |  234098 | 168407 |  9393 | 7460 | 4146 | 43286 |
| Kolekcja e-booków    |  309655 | 243069 | 10689 | 7059 | 4146 | 43286 |
| Landing e-booka      |   69683 |      0 | 12746 | 8099 | 4146 | 43286 |
| Blog                 | 1041595 | 976328 |  9298 | 7131 | 4146 | 43286 |
| Artykuł              |  636917 | 564778 | 14463 | 8838 | 4146 | 43286 |
| Kontakt              |  151674 |  88089 |  8951 | 5796 | 4146 | 43286 |
| Polityka prywatności |   66645 |      0 | 12011 | 5796 | 4146 | 43286 |

Na desktopie waga strony głównej różni się o dziesiątki bajtów CSS. Konsultacje na desktopie przenoszą 256487 B obrazów i 322178 B łącznie. Mobile przenosi 168407 B obrazów. Różnica obrazów wynosi 88080 B.

## Element LCP

Selektor pochodzi z przebiegu mediany wydajności.

| Strona               | Mobile                                                                                 | Desktop, gdy inny                      |
| -------------------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| Strona główna        | `section#start > div.ao-hero__media > div.home3a-portrait > img`                       | ten sam                                |
| O mnie               | `section#start > div.ao-hero__media > figure.about3a-portrait > img`                   | ten sam                                |
| Konsultacje          | `div.ao-hero__media > figure.consult3a-portrait > div.consult3a-portrait__stage > img` | ten sam                                |
| Kolekcja e-booków    | `section.ao-consent-banner > p`                                                        | `h1.ao-heading` w `#start`             |
| Landing e-booka      | `section.ao-consent-banner > p`                                                        | `h1.ao-heading` w `#start`             |
| Blog                 | `article.blog3a-featured-post > a.blog3a-featured-image > img`                         | ten sam                                |
| Artykuł              | `figure.article-main-image img`                                                        | ten sam                                |
| Kontakt              | `section.ao-consent-banner > p`                                                        | `div.contact3a-profile > figure > img` |
| Polityka prywatności | `section.ao-consent-banner > p`                                                        | `main#main > div#start h1`             |

Na kolekcji, landingu, kontakcie i polityce mobile elementem LCP jest akapit banera zgody. Lokalny baner dostaje fixture z tego samego hosta. Lokalne LCP tych stron wynosi od 1088 ms do 2251 ms, a wydajność od 99 do 100. Na stagingu, przy żywym hoście zgody, kolekcja e-booków mobile ma LCP 2900 ms i wydajność 95, zakres od 94 do 95. Skrypt, który opóźni ten akapit, zmienia ten wynik.

Audyt `image-delivery-insight` w przebiegu mediany podaje `totalBytes` i `wastedBytes`. To nie jest kolumna transferu z tabeli wagi.

Na stronie głównej `food-editorial.CmyliADD_Z2gucYp.webp` ma 316410 B, z czego 306634 B oznaczone jako zbędne, selektor `img.home3a-about__food`. Okładka `food-editorial.CmyliADD_Z71lUp.webp` ma 242894 B i 234148 B zbędnych. Hero `hero.DlkV9OLk_R5C1A.webp` ma 168268 B i 124198 B zbędnych, selektor portretu w `#start`. Portret `about.CkJlcn-R_10ObQ3.webp` ma 140670 B i 93784 B zbędnych.

Na blogu wyróżniony obraz to ten sam plik `Z2gucYp`, 316410 B i 264654 B zbędnych, selektor `a.blog3a-featured-image > img`. Dwie kolejne karty mają 271740 B z 234157 B zbędnymi i 253406 B z 215823 B zbędnymi.

Na O mnie dyplom `diploma.CvWyf9OJ_CKNkH.webp` ma 322746 B i 275149 B zbędnych, selektor `figure.about3a-diploma > img`. Portret ma 140670 B i 95297 B zbędnych.

W artykule wyróżniony obraz `food-editorial.CmyliADD_ZAhR5f.webp` ma 316410 B i 264654 B zbędnych, selektor `figure.article-main-image img`. Transfer obrazów artykułu wynosi 564778 B. Lista audytu w podsumowaniu ma jedną pozycję.

## Wyniki stagingu

SEO 69 albo 66 wynika z audytu `is-crawlable`. Strona jest wyłączona z indeksowania. Na stronie głównej to jedyny audyt SEO poniżej 1, a `image-alt` ma wynik 1. Na kolekcji e-booków i na polityce `image-alt` nie ma zastosowania, więc ten sam błąd indeksowania daje 66. Dostępność i dobre praktyki są jak lokalnie, z tym samym `link-name` na kolekcji. Artykuł stagingu nie ma `link-name` i ma dostępność 100. To inny dokument niż fixture.

Jeden z trzech przebiegów mobile landingu e-booka dostał dodatkowo `robots-txt` równe 0, komunikat `Timed out fetching resource`. Mediana SEO zostaje 69. To nie jest stały błąd trzech przebiegów.

| Strona               | Wydajność | Zakres  | LCP ms | Zakres LCP | TTFB ms |  Razem | SEO |
| -------------------- | --------: | ------- | -----: | ---------- | ------: | -----: | --: |
| Strona główna        |        92 | 92-92   |   3342 | 3342-3344  |      46 | 952070 |  69 |
| O mnie               |        91 | 86-91   |   3521 | 3489-4097  |      50 | 541724 |  69 |
| Konsultacje          |        99 | 99-99   |   1999 | 1981-2103  |      60 | 245442 |  69 |
| Kolekcja e-booków    |        95 | 94-95   |   2900 | 2886-3038  |      42 | 321120 |  66 |
| Landing e-booka      |        97 | 93-98   |   2496 | 2330-2524  |      96 |  81758 |  69 |
| Blog                 |       100 | 100-100 |   1532 | 1399-1610  |      49 | 132386 |  69 |
| Artykuł              |        98 | 98-100  |   2322 | 1257-2323  |      65 | 220059 |  69 |
| Kontakt              |        98 | 97-98   |   2434 | 2427-2607  |      35 | 161980 |  69 |
| Polityka prywatności |        98 | 97-99   |   2277 | 2178-2621  |      60 |  76867 |  66 |

TTFB dokumentu na stagingu jest rzędu dziesiątek milisekund. Blog stagingu waży 132386 B i ma wydajność 100. Blog fixture waży 1041595 B i ma wydajność 78. To nie jest ta sama strona.

Desktop stagingu ma wydajność 100 poza dwoma zakresami. Konsultacje mają od 99 do 100, mediana 100, LCP 474 ms. Polityka ma od 89 do 100, mediana 100, LCP 370 ms. Przebieg o wydajności 89 ma CLS 0,199478 na `main#main > div#start > div.ao-container > h1`. Przyczyna w raporcie to `Web font loaded` dla `Switzer-Variable.7Oa6q7Y4.woff2`. Dwa pozostałe przebiegi mają CLS 0. W 54 przebiegach lokalnych CLS wynosi 0. Mediana TBT polityki mobile na stagingu wynosi 31 ms, zakres od 0 ms do 51 ms.

## Axe i kontrole ręczne

Axe z tagami WCAG 2.2 AA dał naruszenia tylko na dwóch szablonach. Reguła `link-name`, impact `serious`, tagi `wcag2a`, `wcag244` i `wcag412`. Element jest w kolejności tabulacji i nie ma dostępnej nazwy. Okładka w linku ma `aria-hidden`, a widoczny tytuł jest poza linkiem.

Na `/ebooki/` jest sześć linków `a.ebooks3a-cover-link`. Adresy to `suplementy-w-pcos`, `badania-ktore-maja-sens`, `szczupla-a-jednak-pcos`, `waga-cie-oklamuje`, `czy-to-juz` i `noc-zaczyna-sie-o-osiemnastej`.

W artykule fixture są trzy linki `a.cover-link` w powiązanych książkach. Adresy to `suplementy-w-pcos`, `badania-ktore-maja-sens` i `szczupla-a-jednak-pcos`.

Pozostałe siedem szablonów ma zero naruszeń przy tych tagach. Lighthouse na stronie głównej ma też audyt `label-content-name-mismatch` z wynikiem 0 i wagą 0, grupa `hidden`. Axe przy tagach WCAG go nie zgłosił. Waga 0 zostawia wynik dostępności bez zmiany, więc audyt zostaje poza listą ustaleń AA. Dotyczy `a.ao-wordmark` i `a.ao-card__media` z `tabindex="-1"`.

Przy szerokości 320 px `scrollWidth` dokumentu równa się `clientWidth` 320 na wszystkich dziewięciu stronach. Nie ma poziomego paska dokumentu.

Na stronie głównej karty w `#ebooks-track` wystają poza viewport o 192 px. Karuzela przewija je w sobie. Na polityce tabela wystaje o 290 px. Reguła `.article-table-wrap` w `Legal3a.astro` ma `overflow-x: auto`. Przy korzeniu 32 px tabela artykułu też jest szersza od viewportu, a `scrollWidth` dokumentu zostaje 320. Na landingu e-booka `div.ebook3a-orbit` wystaje o 25 px, a `svg` i `circle` o 64 px. `body.ao-site` ma `overflow-x: clip`. Honeypoty `#hp-website`, `#contact-hp-website` i `#newsletter-hp-website` wystają o 62 px i są obcięte. Dokument ma tę samą szerokość co viewport, więc poziomego paska strony nie ma.

Sonda fontu ustawia `documentElement.style.fontSize` na 32 px w kontekście 320 px. Metoda zmienia korzeń, a natywny zoom zostaje poza pomiarem. `h1`, `body` i `.ao-button` podwajają obliczony rozmiar na dziewięciu stronach. `h1` strony głównej rośnie z 42 px do 84 px. `h1` polityki rośnie z 28 px do 56 px. `.ao-button` rośnie z 14 px do 28 px. `.home3a-count strong` zostaje przy 64 px. Przy tej szerokości działa zapytanie kontenera `max-width: 374px`, a reguła nadal jest w px, `font-size: 64px`. Pierwszy akapit kontaktu zostaje przy 14 px. W `Contact3a.astro` pierwszy akapit to `p.contact3a-eyebrow` z `font-size: 14px`.

`documentElement.style.zoom = "2"` przy viewport 1280 px zostawia `scrollWidth` 1280. Metoda przypisuje `style.zoom`. Natywny zoom przeglądarki zostaje poza pomiarem.

Dwadzieścia pięć tabulacji na każdej stronie. Żaden zatrzymany element nie ma jednocześnie `outline: none` i `box-shadow: none`. Pierwszy przystanek to `a.ao-wordmark`, nazwa `Aleksandra Olesiewicz — strona główna`, obrys `solid` 2 px, kolor `rgb(136, 47, 72)`. Drugi to link nawigacji. Na większości stron jest to E-booki. Na konsultacjach i na landingu e-booka jest to Dla kogo. Przed wordmarkiem nie ma linku pomijającego. `main#main` jest w dokumencie. Axe nie zgłosił braku obejścia. Brak linku pomijającego zostaje poza listą ustaleń.

`prefers-reduced-motion: reduce` na dziewięciu stronach daje `.ao-button` z `transition-duration: 0s` i `animation-name: none`. `h1` ma opacity 1 i transform `none`. Treść zostaje widoczna.

`forced-colors: active`, pierwsze 12 tabulacji. Każdy przystanek ma obrys `solid` 2 px. Kolor próbki to `rgba(5, 0, 73, 0.8)`. W tych 12 krokach nie ma starszego przycisku z `data-slot`. Reguła `.ao-site :focus-visible` w `global.css` ustawia `outline: 2px solid Highlight` wewnątrz `@media (forced-colors: active)`.

`browser posts` w sesji verify-ola zwrócił pustą listę. Formularze nie były wysyłane poprawnymi danymi.

## Punkty 2, 3 i 4 z przeglądu CSS

Źródło punktów to [przegląd CSS z 08.10.2026](CSS-REVIEW-2026-10-08.md). Sekcja wdrożenia w tym pliku oznacza osiem zaleceń jako zrobione. Poniższy stan pochodzi z przebiegów z 12.10.2026.

Punkt 2, skalowanie z domyślnym fontem, jest częściowy. `h1`, `body` i `.ao-button` rosną z korzeniem. `.home3a-count strong` i `p.contact3a-eyebrow` zostają w px. Test CSS zoom nie jest dowodem tego punktu. Przegląd z 08.10 mówi to samo o CSS zoom.

Punkt 3, hover i stan po tapnięciu, jest częściowy. `.ao-button:hover` jest w `@media (hover: hover) and (pointer: fine)`. Na kontekście dotykowym, `hover` fałszywe i `pointer: coarse` prawdziwe, tapnięcie `.ao-button` zostawia opacity 1, choć element pasuje do `:hover`. `.contact3a-social a:hover` nie jest w tym zapytaniu. Osobna sonda, plik `contact-coarse.json`, tapie link Instagram przy 390 px, `hasTouch` i `pointer: coarse`. Kolor zmienia się z `rgb(112, 40, 63)` na `rgb(136, 47, 72)`, a `:hover` zostaje prawdziwe. Pole `contactHover` w `report.json` jest innym pomiarem, hoverem przy wskaźniku fine, i zmienia kolor w tę samą stronę. `.ao-button:active` istnieje. Ten pomiar nie policzył wszystkich `:hover` w arkuszach.

Punkt 4, obrys w forced colors, nie odtworzył się na próbkowanych kontrolkach 3a. Pierwsze 12 tabulacji ma obrys. Starsze `Button`, `Input` i `DialogContent` z `outline-none` nie weszły w te 12 kroków. Punkt 4 nie jest zamknięty dla tych starszych kontrolek.

## Ustalenia od najcięższego

1. Poważne. Link okładki bez dostępnej nazwy. Strona `/ebooki/`, selektor `a.ebooks3a-cover-link`, sześć węzłów. Artykuł fixture, selektor `a.cover-link`, trzy węzły. Axe `link-name`, Lighthouse dostępność 96 i 97. Późniejsza poprawka. Daj linkowi nazwę z tytułu książki albo umieść widoczny tytuł w linku i nie ukrywaj go przez `aria-hidden`.

2. Wysokie. LCP mobile poniżej celu 95 przez za duży obraz względem wyświetlanego rozmiaru. Blog, wydajność 78, LCP 6003 ms, `a.blog3a-featured-image > img`, plik `food-editorial.CmyliADD_Z2gucYp.webp`, 316410 B i 264654 B zbędnych. Artykuł, wydajność 88, LCP 3902 ms, `figure.article-main-image img`, plik `ZAhR5f`, te same rzędy bajtów. O mnie, wydajność 91, LCP 3452 ms, `figure.about3a-diploma > img`, 322746 B i 275149 B zbędnych. Strona główna, wydajność 94, LCP 3152 ms, hero `hero.DlkV9OLk_R5C1A.webp` oraz większe pliki niżej na stronie. Liczby bloga 78 i artykułu 88 są z fixture. Na stagingu blog ma wydajność 100, a artykuł 98. To inne dokumenty. Późniejsza poprawka. Podaj mniejszy plik i `sizes` dopasowane do slotu. Nie ruszaj tego w tym zapisie.

3. Średnie. Dwa rozmiary nie idą za korzeniem 32 px. `.home3a-count strong` zostaje przy 64 px na stronie głównej przy 320 px. `p.contact3a-eyebrow` zostaje przy 14 px na `/kontakt/`. Późniejsza poprawka. Ustaw te rozmiary w `rem` i sprawdź łamanie przy 16 px i przy 32 px.

4. Średnie. Hover linku społecznościowego zostaje po tapnięciu na wskaźniku coarse. Strona `/kontakt/`, selektor `.contact3a-social a`, tekst Instagram. Sonda `contact-coarse.json` zapisuje kolor `rgb(136, 47, 72)` przy `pointer: coarse`. Późniejsza poprawka. Przenieś `:hover` do `@media (hover: hover) and (pointer: fine)`.

5. Niskie i niestabilne. Tylko staging, tylko jeden z trzech przebiegów desktop polityki. CLS 0,199478 na `h1` w `#start`, font `Switzer-Variable.7Oa6q7Y4.woff2`, wydajność tego przebiegu 89, mediana 100. Lokalnie się nie powtórzyło. Późniejsza poprawka. Dopasuj metryki fontu zapasowego. Nie opisuj tego jako stałego przesunięcia każdego ładowania.

## Poza tym pomiarem

Nie mierzono natywnego zoomu 200%, czytnika ekranu, urządzenia fizycznego ani polowego INP. Lighthouse w tych przebiegach nie zapisuje INP. Zapisuje LCP, CLS i TBT. TBT jest wskaźnikiem zastępczym laboratorium.

Nie wysyłano leadów. Nie wdrażano tagów. Nie publikowano strony. Następny pomiar po GTM ma użyć tego samego zestawu szablonów, trzech przebiegów i mediany, osobno dla mobile i desktop.

# Audyt CSS — 08.10.2026

Wniosek: aktywny CSS ma dobrą bazę komponentową, ale jest tylko częściowo zgodny
z lokalnym skillem `good-css`. Największa potwierdzona możliwość optymalizacji
to rozdzielenie zależności stylów poszczególnych szablonów. Najważniejsze kwestie
użytkowe to skalowanie tekstu oraz stany interakcji na dotyku i przy klawiaturze.
Poniższe ustalenia opisują stan sprzed zmian. Wyniki wdrożenia zaleceń
na zlecenie użytkownika znajdują się w końcowej sekcji raportu.

## Zakres i metoda

- Stan repo: `3143c24`, Node 24.19.0; build z fixture’ów, bez Content Lake.
- Podstawa: [good-css](../.agents/skills/good-css/SKILL.md) i wszystkie osiem
  plików jego referencji, [zasady projektu](../AGENTS.md),
  [jakość kodu](CODE-QUALITY.md) oraz [ruch 3a](../design-system/MOTION.md).
- Przegląd `src/design-system`, styli widoków 3a, tokenów/generatora,
  starszych `src/styles` i komponentów Tailwind nadal obecnych w buildzie.
  Mockupy i archiwum nie są kodem docelowym i nie wymagają masowego refaktoru.
- Sprawdzone źródła, wynikowy HTML, arkusze po minifikacji i rozmiary gzip.
  Pomiar gzip dotyczy każdego zasobu osobno, bez nagłówków HTTP i cache.

Priorytet P2 oznacza istotną poprawkę lub optymalizację; P3 — porządek techniczny.
Odstępstwo od skilla samo w sobie nie dowodzi naruszenia WCAG ani spowolnienia CWV.

## Ustalenia

### 1. P2 — strony 3a pobierają CSS niewykorzystywanych widoków i starszego systemu

[ComposedPage.astro](../src/views/ComposedPage.astro) statycznie importuje starszy
Layout i sekcje oraz Home/About/Consultation, choć renderuje jeden wariant.
Warunki w szablonie nie wykluczają CSS pozostałych importowanych komponentów
z zależności strony. Potwierdzenie w HTML i arkuszach builda:

- `/`, `/o-mnie/`, `/konsultacje/`: `label.*.css` (11 882 B gzip),
  `SiteHeader.*.css` (5 138 B) oraz `ComposedPage.*.css` (4 035 B).
- `label.*.css` zawiera starsze style i Tailwind; warstwa utilities ma
  31 054 znaków minifikowanego CSS. Nie jest to pomiar niewykorzystanych utilities.
- `ComposedPage.*.css` zawiera selektory wszystkich trzech widoków.
- Także strona polityki prywatności pobiera te pakiety, ponieważ
  [[slug].astro](../src/pages/[slug].astro) importuje zarówno LegalPage,
  jak i ComposedPage. Jej CSS dziedziczy zależności obu gałęzi.

Rekomendacja: izolować wejścia szablonów i legacy, zaczynając od istniejących
osobnych tras Home/About/Consultation. Dla dynamicznych stron prawnych dobrać
strukturę tras/renderowania do Astro i potwierdzić odcięcie CSS w buildzie.
Sama zmiana warunku lub nazwy komponentu nie wystarczy. Nie usuwać legacy,
dopóki korzystają z niego rzeczywiste trasy. To pierwszy kandydat do optymalizacji;
nie podajemy prognozy oszczędności bez builda po refaktorze.

### 2. P2 — typografia nie podąża za domyślnym rozmiarem fontu użytkownika

[Token display](../design-system/tokens.json) ma
`clamp(48px, 5.8vw, 84px)`. Podobne deklaracje są w
[global.css](../src/design-system/global.css),
[Article3a](../src/views/Article3a.astro) i
[EbookCollection3a](../src/views/EbookCollection3a.astro).
Body i wiele pozostałych rozmiarów także używają `px`.

`px` i sam `vw` nie reagują na zmianę domyślnej wielkości fontu przeglądarki.
Pełny zoom strony powiększa piksele, ale nie zastępuje tej preferencji.
Skill zaleca granice w `rem`, środek `rem + vw/cqi` oraz wspólne tokeny.
Nie uznajemy obecnych testów CSS zoom za dowód poprawnego skalowania fontów.

Rekomendacja: wyliczyć krzywe z obecnych rozmiarów w dwóch szerokościach,
przenieść je do `tokens.json`, zachować zaakceptowany wygląd przy bazie 16 px,
sprawdzić bazę 20/32 px oraz zoom. Nie zamieniać jednostek mechanicznie bez
ponownego odbioru łamania nagłówków. Dla skali komponentu użyć kontenera
przodka; obecny `page3a` mierzy całą stronę, nie szerokość konkretnej karty.

### 3. P2 — hover bez warunku oraz brak press feedback na części kontrolek

W aktywnych stylach 3a występują 24 tekstowe wystąpienia `:hover`, wliczając
selektory wyłączające transform przy reduced motion. Nie ma query
`@media (hover: hover) and (pointer: fine)`. Przykłady:
[global.css](../src/design-system/global.css) — `.ao-button:hover`,
`.ao-text-link:hover`, `.ao-card__media:hover`; również widoki About i Blog.
Na dotyku hover może utrzymywać się po tapnięciu.

Reset usuwa `-webkit-tap-highlight-color` z linków, przycisków, inputów i summary,
ale własny `:active` ma w tym systemie tylko `.ao-button`; drugie wystąpienie
to wyłączenie jego transformacji. Menu, FAQ, linki, przełącznik motywu i strzałki
karuzeli nie mają analogicznej wizualnej reakcji na naciśnięcie.

Rekomendacja: hover umieścić we wskazanym query; dodać odpowiednie dla elementu
`:active` (np. kolor/tło) bez nowych animacji. Tailwind v4 `hover:` chroni
tylko przez `(hover: hover)`, więc nie spełnia pełnego warunku skilla.
Zachować informację o stanie również przy reduced motion i `:disabled`.

### 4. P2 — starsze kontrolki usuwają outline potrzebny w forced colors

[Button](../src/ui/button/Button.astro), [Input](../src/ui/input/Input.astro)
i [DialogContent](../src/ui/dialog/DialogContent.astro) mają `outline-none`.
Button/Input zapewniają zwykły fokus przez ring/box-shadow; nie oznacza to braku
fokusu w normalnym motywie. W forced colors cień może zostać wyłączony, a
usunięty outline nie daje systemowi obrysu do przemalowania. Globalny fokus
w warstwie `base` nie przebija utility usuwającego outline.

Rekomendacja: zachować obrys, np. `outline-color: transparent` przy własnym
ringu, sprawdzić klawiaturę i forced colors. Dotyczy starszych kontrolek,
nie poprawnego `:focus-visible` z outline w nowym design systemie 3a.

### 5. P3 — martwe selektory i narastające nadpisania po migracji

[Article3a](../src/views/Article3a.astro) nadal definiuje `.breadcrumbs`
oraz `.article3a .desktop-nav`, mimo że używa komponentów `.ao-breadcrumbs`
i `.ao-header__desktop`. Selektory te pozostają w CSS, ale nie odpowiadają
aktualnemu DOM. Na końcu arkusza dopisano ponownie reguły dla obrazów hero,
byline i autora z większą specyficznością.

Rekomendacja: usunąć potwierdzone martwe reguły, skonsolidować nadpisania,
zostawić jawne mobile variants. Nie usuwać automatycznie wszystkich powtórzeń:
część ma znaczenie dla kolejności kaskady i zapytań kontenerowych.

### 6. P3 — niespójność właściwości logicznych i odcinania overflow

W przeglądanym CSS 3a naliczono 273 deklaracje fizycznych odstępów, offsetów
i wyrównania (`margin-top`, `padding-left`, `right`, `text-align: left` itd.).
Nie wlicza to `width/height` ani shorthandów. Występuje także 10 deklaracji
`overflow: hidden`. Jest to inwentaryzacja, nie 283 potwierdzone błędy.

Rekomendacja: stopniowo używać `margin-block/inline`, `padding-block/inline`,
`inset-block/inline`, `text-align: start/end`. Na nieprzewijanych kadrach,
np. `.ao-book-cover` i `.blog3a-card-image`, rozważyć `overflow: clip`.
Zachować `auto` dla karuzeli i tabel; przed zamianą `hidden` sprawdzić,
czy element potrzebuje kontekstu formatowania lub przewijania przez skrypt.
Nie maskować overflow całej strony.

### 7. P3 — tokeny motywu można uprościć, ale migracja kolorów wymaga ostrożności

[Generator](../scripts/tokens.mjs) wypisuje te same ciemne wartości oraz aliasy
`--wf-*` dwukrotnie: dla ręcznego dark i preferencji systemowej. Skill proponuje
jedną deklarację koloru przez `light-dark()` i sterowanie `color-scheme`.
Obecne kolory są HEX, a cień używa `color-mix(in srgb, ...)`, zamiast OKLCH.

Rekomendacja: najpierw izolacja bundli i redukcja aliasów; później, jeśli
pozwala docelowy browser floor, rozważyć `light-dark()` oraz wartości OKLCH
odpowiadające zatwierdzonej palecie. `light-dark()` wymaga Safari 17.5+,
Chrome 123+, Firefox 120+. Nie zmieniać generowanego `tokens.css` ręcznie.
Obecne testy sprawdzają wartości HEX i funkcja kontrastu przyjmuje HEX;
zostawienie HEX w danych źródłowych i konwersja w generatorze jest jedną z opcji.
Nie dodawać nowych tintów ani nie zmieniać wizualnej palety w ramach porządków.

### 8. P3 — ruch działa przez globalne wyłączenie zamiast opt-in

Transform transitions są poza `prefers-reduced-motion: no-preference` i dopiero
globalnie anulowane przez `.ao-site * { transition: none !important }`.
Jest to odstępstwo od skilla, ale istniejąca ochrona reduced motion działa
na poziomie kaskady. Nie zgłaszamy tego jako potwierdzonej regresji.
Starszy Button używa też `transition-all`, którego skill zabrania.

Rekomendacja: przenieść transitions ruchu do opt-in, nazwać ich właściwości,
użyć istniejącego easing tokena. Zachować zgodne z MOTION.md wyłączenie
transformacji w reduced motion; nie projektować dodatkowych animacji.

## Pomiar builda

Całość: 7 zewnętrznych plików CSS, **29 804 B gzip** (29,11 KiB),
czyli 90,95% tymczasowego limitu 32 KiB. Zapas: 2 964 B.
To suma unikalnych plików w katalogu, nie koszt pojedynczej strony.

| Szablon                     | Zewnętrzny CSS gzip | CSS inline przed kompresją |
| --------------------------- | ------------------: | -------------------------: |
| Home / About / Consultation |            21 055 B |                    2 022 B |
| Kolekcja e-booków           |             6 538 B |                    2 022 B |
| Kolekcja bloga              |             6 643 B |                      452 B |
| Artykuł                     |             8 477 B |                    2 022 B |
| Polityka prywatności        |            21 055 B |                    5 387 B |
| Katalog design systemu      |             5 138 B |                    1 975 B |

[check-build](../scripts/check-build.mjs) pomija CSS inline. Warto dodać
osobny raport/budżet per szablon, liczący jego linkowane zasoby i inline CSS.
Nie sumować gzip inline jako dodatkowego żądania — to część kompresowanego HTML.
Mały bundle nie dowodzi dobrych CWV; Lighthouse i coverage to dalsza kontrola.

## Co już jest dobre

Jedno źródło tokenów i deterministyczny generator, Switzer self-host z `swap`,
preload fontu, semantyczne `details` dla FAQ/menu, natywny scroll-snap karuzeli,
kontenerowe zapytania, `minmax(0, ...)`, intrinsic grid newslettera,
`text-wrap: balance/pretty`, obrys `:focus-visible` w 3a, minimum 44 px
na głównych kontrolkach oraz czytelny stan bez JS i ochrona reduced motion.
Nie ma podstaw do przebudowy całego design systemu albo dodawania biblioteki CSS.

## Wyniki kontroli i ograniczenia

- `npm ci --no-audit --no-fund --cache /tmp/ola-css-npm-cache`: PASS.
- `npm run tokens:check`: PASS.
- `npm test -- tests/unit/tokens.test.ts tests/unit/fonts.test.ts tests/unit/article-body.test.ts`:
  PASS, 9 testów w 3 plikach.
- `npm run build`: PASS, 65 stron z fixture’ów.
- `npm run test:build`: PASS; CSS 29 804 B gzip, JS 5 770 B gzip.
- HTML i arkusze builda: potwierdzone współdzielenie pakietów oraz style inline.
- Chromium/E2E/coverage/Lighthouse: **niewykonane**. Instalacja Playwright
  Chromium zwróciła HTTP 403 `Domain forbidden` dla `cdn.playwright.dev`.
  Bez obejścia polityki sieciowej. Brak wizualnego pomiaru 320 px, zoomu,
  dotyku, forced colors i zmiany domyślnego rozmiaru fontu w tej sesji.
- Pełnego `npm run verify` nie uruchamiano: zmiany dotyczą tylko raportu
  i dokumentacji postępu; nie zmieniono aplikacji. Historyczne wyniki E2E
  z PROGRESS.md nie są wynikami tego audytu.

## Zalecana kolejność dalszych prac

1. Odizolować style szablonów i legacy; ponownie zmierzyć koszty per strona.
2. Naprawić skalowanie typografii, stany dotykowe i outline starszych kontrolek.
3. Usunąć martwe reguły; uporządkować transitions, logical properties i overflow.
4. Opcjonalnie uprościć kolory/motywy po ustaleniu browser floor.
5. Po zmianach aplikacji pełne verify i odbiór UI 3a na desktop/mobile,
   bez JS, reduced motion, font size 20/32 px, 320 px, zoom i forced colors.

## Wdrożenie zaleceń — 08.10.2026

Wdrożono wszystkie osiem zaleceń dotyczących aktywnego kodu. Publiczne trasy
Home/About/Consultation mają osobne komponenty wejściowe, a strony prawne
oddzielne `getStaticPaths`; legacy zachowuje własny renderer i aliasy tokenów.
Chroniony podgląd korzysta z tych samych komponentów. Tailwind skanuje tylko
`src`, zamiast także mockupów i archiwum.
Osiem makiet 3a podłącza osobny arkusz aliasów, ponieważ nadal ich używa;
nie zmieniono ich własnych styli. Kontrola szerokości kontenera makiety
chroni przed utratą odstępów przy kolejnych zmianach tokenów.

Typografia używa `rem` i płynnych tokenów `rem + vw/cqi`; progi kontenerowe
również skalują się z tekstem. Przy bazie 32 px poprawiono zawijanie nagłówków
karuzeli, metadanych oraz rozmiar okładki i dekoracji produktu. Hover wymaga
myszy, aktywne kontrolki dają feedback także na dotyku. Starsze kontrolki
zachowują obrys w forced colors. Ruch działa przez opt-in `no-preference`,
bez `transition-all` i globalnego anulowania transitions. Uporządkowano
właściwości logiczne, overflow oraz martwe i powtórzone reguły Article3a.

Generator emituje równoważne OKLCH i `light-dark()`, a źródłowy HEX pozostaje
podstawą obliczeń kontrastu. Starsze przeglądarki otrzymują fallback HEX i dark
przez `@supports`. Testy porównują kolory po rasteryzacji do sRGB, dzięki czemu
kontrolują tę samą paletę niezależnie od formatu wartości CSS.

### Pomiar po wdrożeniu

| Szablon              | Zewnętrzny CSS gzip | CSS inline przed kompresją |
| -------------------- | ------------------: | -------------------------: |
| Home                 |             7 383 B |                    2 674 B |
| About                |             7 468 B |                      483 B |
| Consultation         |             7 685 B |                      911 B |
| Kolekcja e-booków    |             7 240 B |                    2 246 B |
| Landing e-booka      |             8 388 B |                      483 B |
| Kolekcja bloga       |             7 351 B |                      483 B |
| Artykuł              |             9 141 B |                    2 246 B |
| Polityka prywatności |             5 797 B |                    4 254 B |

Wyniki PL/EN są identyczne. Home pobiera **64,9% mniej zewnętrznego CSS**,
About 64,5%, konsultacja 63,5%, polityka prywatności 72,5%. Cała pula unikalnych
zasobów wynosi **30 103 B gzip**, wobec 29 804 B wcześniej: doszły fallbacki,
stany dostępności i rozdzielone pakiety. To koszt wszystkich szablonów razem,
nie pojedynczej strony. JS pozostaje 5 770 B gzip.

[Kontrola budżetów](../scripts/check-css-budgets.mjs) sprawdza osiem szablonów
w obu językach, osobno CSS zewnętrzny i inline, oraz odrzuca wyciek aliasów
legacy i selektorów innych widoków. Jest częścią `npm run test:build`.

### Weryfikacja wdrożenia i pozostałe kontrole

- Format, tokens:check, lint, typy Astro/TypeScript: **PASS**.
- Unit: **135 PASS** w 23 plikach.
- Build publiczny: **65 stron PASS**; Studio, preview i Worker dry-run: **PASS**.
- test:build: **PASS**, także nowe budżety i izolacja CSS.
- Chromium: **61 E2E PASS**, w tym bez JS, klawiatura, axe, CSS zoom,
  reduced motion, forced colors, dotyk oraz osiem szablonów przy szerokości
  320/1440 px i bazowym foncie 20/32 px.
- Po podłączeniu aliasów do makiet ponownie wykonano ich **8 E2E: PASS**;
  końcowe lint, format i `git diff --check`: **PASS**.
- test:content-lake: **PASS**; symulowany Content Lake i fixture’y dają te same
  sekcje, zdjęcia i DOM na 13 porównywanych stronach. Bez zapisu do Sanity.
- Ogląd zrzutów Home/About/Consultation/e-booka, 390 i 1440 px, light/reduced
  motion oraz porównanie z makietami 3a: wykonane; dowody
  `/tmp/ola-css-evidence/`. Nie stanowi pełnego odbioru
  wszystkich sekcji względem makiet.
- `npm run verify`: uruchomiono, **nie uzyskało PASS**. Wszystkie 122 przypadki
  Firefox/WebKit zatrzymały się przy uruchamianiu przeglądarki z powodu braku
  plików wykonywalnych. Pobranie z `cdn.playwright.dev` blokuje polityka sieciowa
  (HTTP 403). Chromium działa przez `/usr/bin/chromium`; konfiguracja dopuszcza
  opcjonalną ścieżkę, nie usuwa projektów Firefox/WebKit.
- Natywny zoom przeglądarki, fizyczne urządzenie, czytnik ekranu, coverage
  i Lighthouse: **niewykonane**. Pomiar CSS nie jest pomiarem CWV.

Następny krok: uruchomić pełne verify w środowisku z trzema przeglądarkami
i domknąć ręczny odbiór UI. Implementacja jest lokalna; nie wykonano publikacji.

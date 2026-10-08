# Specyfikacja wizualna 3a

## Tożsamość

Białe tło, wiśniowy tekst i CTA, jasne różowe powierzchnie. Mocny Switzer,
obszerne nagłówki, miękkie media, konkretne treści i portrety Aleksandry.
Nie wprowadzać pomarańczowego akcentu Wonderful, serifów botanicznego wariantu,
ciemnego głównego tła wariantu 03 ani wyboru kierunków w stronie docelowej.

Wordmark to dwie linie tekstu Switzer 750: „aleksandra” / „olesiewicz”,
28 px, line-height .93, tracking -.065em. Mobile 22 px poniżej 375 px,
18 px poniżej 271 px dostępnej szerokości. Monogram SVG jest faviconem;
stare logo Gambarino nie jest wordmarkiem docelowego 3a. Nie usuwać go z historii.

## Palety

Wartości wykonawcze w [tokens.json](tokens.json).

| Rola              | Light   | Dark    | Zastosowanie                                      |
| ----------------- | ------- | ------- | ------------------------------------------------- |
| background        | #ffffff | #291a21 | Tło strony, menu, pola                            |
| ink               | #70283f | #f3dce5 | Nagłówki, treść, znak                             |
| muted             | #785861 | #d1b1bd | Lead, metadane, opisy                             |
| line              | #dac3cc | #6c4655 | Linie, podziały, outline                          |
| surface           | #f2dce3 | #422a35 | Newsletter, panel, wyróżnienie                    |
| primary           | #882f48 | #edb8cb | CTA, focus, aktywna paginacja                     |
| on-primary        | #fff4f6 | #291a21 | Treść w CTA                                       |
| accent            | #53671B | #D8E78A | Secondary button, pojedyncze detale na tle strony |
| accent-on-primary | #D8E78A | #D8E78A | Detale na wiśni (okładki cherry)                  |
| accent-on-light   | #53671B | #53671B | Detale na jasnych okładkach, bez inwersji         |

Light jest wyglądem referencyjnym 3a. Dark zachowuje istniejący wariant podglądu;
bez JS reaguje na ustawienie systemowe. Jawne `data-theme="light|dark"` wygrywa.
Przełącznik w stopce nie wymaga localStorage i nie zmienia zgód użytkownika.
Okładki to grafika produktu: ich jasny lub wiśniowy front nie odwraca kolorów
w dark. Stage zmienia paletę. Ten sam produkt ma jeden front w każdym szablonie.

## Dodatkowy akcent matcha — decyzja 07.10.2026

Użytkownik wybrał odcienie z 1a: **#53671B** na jasnej powierzchni oraz
**#D8E78A** na wiśniowej lub ciemnej powierzchni.
Matcha jest delikatnym dodatkiem do bieli, wiśni i różu.
[Wizualizacja zastosowań](../output/design-system-3a/2026-10-07/accent-proposals/05-matcha-1a-subtle.png).

- Secondary button: białe wnętrze, cienka obwódka matcha. Tekst i strzałka
  matcha jak na planszy 05; wariant tylko tam, gdzie szablon używa Button
  `secondary` (katalog, homepage). TextLink z makiet zostaje w ink.
- Drobne elementy grafik (wdrożone 08.10.2026): jeden punkt na orbicie
  produktu, jeden punkt na półce butelek, jedna kreska lub punkt na jasnej
  okładce, iskierka na okładce cherry. Nie przemalowywać reszty SVG.
- Tło hero i portretu zachowuje dotychczasową paletę. Matcha nie służy
  do wypełniania dużych paneli ani secondary buttonów.
- Nagłówki, logo, primary CTA i treść zachowują wiśniową hierarchię.
  Nie stosować matchy automatycznie do wszystkich ikon i linków.
- Nie używać akcentu jako jedynego oznaczenia sukcesu, błędu lub aktywnego stanu.
  Na bieli stosować ciemny odcień, jasny zarezerwować dla ciemnej powierzchni.

Status: paleta i granice użycia zatwierdzone 07.10.2026. Tokeny `accent`,
`accent-on-primary` i `accent-on-light` są w tokens.json. Secondary button
ma białe wnętrze (`--ao-background`) i obwódkę matcha. Mapa zastosowań jest
w opisie PR wdrożenia. Tło hero i portretu pozostaje wiśniowo-różowe.

## Typografia

Oficjalny, niezmodyfikowany Switzer Variable WOFF2, lokalnie, `font-display: swap`,
100–900. Stos: Switzer, Arial, sans-serif. Jeden preload w Layout3a.

| Styl                  | Wartość referencyjna                        | Mobile / wyjątki                      |
| --------------------- | ------------------------------------------- | ------------------------------------- |
| H1 homepage           | clamp(48px, 5.8vw, 84px), 750, .98, -.04em  | clamp(42px, 9.4cqi, 64px) poniżej 768 |
| H1 „O mnie”           | clamp(54px, 6.3vw, 90px), 1.02              | `Hero kind="about"`                   |
| H1 usługi             | clamp(52px, 5.3vw, 78px), 1.04              | `Hero kind="service"`                 |
| H1 produktu           | clamp(54px, 5.2vw, 78px), 1.04, -.06em      | `Hero kind="product"`                 |
| H1 artykułu           | clamp(36px, 5.2vw, 76px), 750, 1.05, -.04em | Wyrównanie ustala szablon             |
| H2 wspólny/newsletter | 64 px, 650, 1.07, -.04em                    | 52 px poniżej 1200; 42 px poniżej 768 |
| H3 karty              | 24 px, 550, 1.25, -.025em                   | Bez stałej wysokości tekstu           |
| Body / lead           | 16 px / 18 px                               | Body 1.55                             |
| Artykuł               | 18 px, 1.8                                  | Kolumna około 65–75 znaków, do 680 px |
| Front e-booka         | 35 px, 750, 1.02, -.065em                   | Osobny styl grafiki, nie H1           |

Rozmiar wizualny nagłówka nie określa poziomu semantycznego: ustawiaj `as`
i `size` oddzielnie. Jeden H1 na stronę. Zachowuj uzasadnione różnice szablonów:
indeks bloga 42–84 px, kolekcja e-booków 48–88 px, śródtytuły artykułu 36 px.
Te style należą do szablonu i nie powinny nadpisywać wspólnego newslettera.
Nie kopiować globalnych `.page h2` z HTML bez ograniczenia zasięgu.

## Układ

- Szerokość szeroka 1320 px. Gutter 24 px / 40 px od 880 / 60 px od 1440.
- Sekcja 64 px / 96 px od 880 / 120 px od 1200. Odmiana compact: 64 px.
- Gapy najczęściej 12, 24, 32, 48, 64, 96 px; wspólna skala tokenów.
- Powierzchnie i media: 24 px, zdjęcie w panelu: 20 px. CTA i input newslettera: pill.
- Header: minimum 80 px, padding 12 px. Desktop: kolumna logo 290 px,
  elastyczne menu pośrodku, CTA na końcu. Menu mobilne poniżej 1200 px
  szerokości kontenera. Przy reflow header może rosnąć; panel zaczyna się pod nim.
- Newsletter: dwie kolumny min 400 px, gap 96; poniżej 880 jedna kolumna/gap48.
  Pole pełnej szerokości, przycisk poniżej. Nie dodawać newslettera na landingi,
  na których go nie ma w zatwierdzonym mockupie.
- Footer: trzy kolumny 1.4fr/1fr/.8fr, cztery globalne linki, prawo i jeden toggle.
  Dwie kolumny poniżej 880, jedna poniżej 768. Brak „Porównaj kierunki”.

CSS kontenera `page3a` reaguje również na rzeczywistą przestrzeń przy CSS zoom.
Siatki muszą mieć `minmax(0,1fr)` lub min ograniczone do 100%. Przyciski zawijają
etykiety. Nie maskować overflow na body. Tabela i karuzela mają własny scroll.

## Stany i dostępność

Kontrole minimum 44×44 px, CTA/input minimum50 px. Focus: 2 px primary, offset5.
SVG 24×24, stroke1.6, `currentColor`, dekoracyjne `aria-hidden`; kontrola ma nazwę.
Hover linku: podkreślenie lub ruch strzałki; hover CTA: opacity .85.
Disabled: native `disabled`, opacity .4; loading: `aria-busy` i disabled dla button.
Anchor nie obsługuje `disabled`: nie renderować niedostępnej akcji jako aktywnego linku.

Input zawsze ma label, błąd przez `aria-invalid` i `aria-describedby`.
Po błędzie wysłania właściwy formularz ma ustawić focus i status; sam FormField
nie implementuje backendu. Alert/status i zgody muszą pozostać zgodne z planem.
Treść zwykła ≥4.5:1, duży tekst ≥3:1; error light #b42318, dark #ffecec.

FAQ i menu używają natywnego details/summary. Menu nie jest modalem i nie więzi
fokusu. Bez JS działa Enter i otwieranie; skrypt dodaje Escape i zamknięcie.
Zaznaczenie tekstu, caret i scrollbar korzystają z aktywnej palety.
Reduced motion nie ukrywa treści. Kontrole axe uzupełnia odbiór klawiaturą,
przy 320 px, natywnym zoomie 200%, czytnikiem i na urządzeniu.

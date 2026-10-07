# Wonderful — kompleksowy design system

Stan referencji: 12.09.2026. Zakres: strona główna i 13 podstron, obejmujące produkt, usługi, branże, firmę, karierę, blog, artykuł i kontakt. Szczegółowa lista w [SOURCES.md](SOURCES.md).

**O** = odczyt z działającej strony; **W** = obserwacja wizualna lub interakcyjna; **R** = rekomendowana specyfikacja. Wszystkie nazwy tokenów, komponentów i zasady organizacji poniżej są autorskim uporządkowaniem. Wartości O są pomiarami konkretnego wariantu strony, nie gwarancją jednej wartości w całym serwisie.

## 1. Kierunek wizualny

**W:** Połączenie filmowej fotografii świata pracy z bardzo powściągliwym interfejsem. Duży, lekki tekst; płaskie powierzchnie; mocne różnice skali; dużo bieli; ciemne rozdziały produktowe. Wrażenie technologii budują drobne kwadraty, monospace, diagramy i ruch danych. Ludzką stronę marki budują fotografie ludzi, infrastruktury i codziennych sytuacji zawodowych.

**R — zasady kompozycji:**

1. Jedna dominanta na ekran: nagłówek, zdjęcie albo diagram.
2. Kolor ma wynikać przede wszystkim z materiału wizualnego. Interfejs pozostaje neutralny.
3. Duża skala nie wymaga pogrubienia: nagłówki 300, tekst interfejsu 400–500.
4. Pomarańczowy akcent oznacza aktywność systemu. Nie zalewa przycisków i tła.
5. Sekcje produktowe mogą przechodzić w czerń, ale nie zmieniają rodzin fontów, rytmu i geometrii przycisków.
6. Animacja ma pokazywać pojawienie się informacji, przepływ lub zmianę stanu; ruch tła nie powinien utrudniać czytania.

## 2. Kolory i role

### Paleta bazowa

| Token | Wartość | Rola | Dowód |
|---|---|---|---|
| `color.white` | `#FFFFFF` | Jasne tło, wypełnienie inverse CTA | O: home, about, blog |
| `color.paper` | `#FAFAFA` | Tekst na ciemnym tle, jasne powierzchnie | O: globalne tokeny |
| `color.surface` | `#F5F5F5` | Subtelne karty i powierzchnie | O: globalne tokeny |
| `color.line` | `#E6E6E6` | Delikatny podział powierzchni | O: token globalny; rola R |
| `color.ink` | `#171719` | Podstawowy tekst jasnego interfejsu | O: nagłówki |
| `color.body` | `#393939` | Tekst wspierający, część nagłówków | O: home i artykuł |
| `color.muted` | `#6B6B6B` | Drugorzędne opisy | O: token; rola R |
| `color.black` | `#080808` | Ciemny rozdział produktowy | O: home, AI OS |
| `color.deep` | `#050505` | Najciemniejsze powierzchnie | O: token |
| `color.accent` | `#FC762F` | Kwadraty i detale animowanych diagramów | O: obliczony styl; nie globalny token Framera |

W źródle występują również `#000000`, `#777777`, `#6E6E6E`, `#9E9E9E` i lokalne warianty szarości. **R:** ograniczyć nową implementację do powyższych ról, z wyjątkiem wiernego odtworzenia konkretnych mediów/diagramów. Domyślny niebieski link `rgb(0,0,238)` znaleziony na wrapperach DOM nie jest kolorem marki.

### Kolory uzupełniające

**O:** globalny CSS deklaruje `#FF3F3F`, `#FFECEC`, `#03A97E`, `#F0FDF2`, `#D2EEE7`, `#E9EDF5`, `#FFFCF1`, `#ECE8E1`, `#EBEDF1` i `#3286F5`. Sama deklaracja nie potwierdza ich użycia w konkretnym stanie.

**R:** pary czerwony/jasnoczerwony przypisać do błędu, zielony/jasnozielony do sukcesu; pastelowe odcienie stosować tylko jako tła pomocnicze. Dodać ciemniejsze kolory tekstu błędu `#B42318` i sukcesu `#067647`, ponieważ jasne kolory źródłowe nie zapewniają kontrastu małego tekstu na bieli.

### Przezroczystości i gradienty

**O:** tekst inverse `rgba(255,255,255,.7)`; szkło/piksele `rgba(255,255,255,.54)`; linia inverse `.18`; powierzchnia diagramu `rgba(245,245,245,.9)`. Źródło zawiera również szarość `#5C5C5C80`, która na bieli jest zbyt słaba dla zwykłego małego tekstu.

**O:** jeden wariant overlay hero przy szerokości 880–1439.98 px: `linear-gradient(rgba(0,0,0,.2) 0%, rgba(0,0,0,.1) 13.1129%, rgba(0,0,0,.3) 54%, transparent 100%)`. Inne warianty mają inne przyciemnienie; mobile używa także opacity warstwy wideo `.7`.

**R:** overlay dopasowywać do kadru, z ciemną bazą pod mediami. Nie uznawać jednej wartości alpha za gwarancję czytelności filmu. Gradientowe rozmycie w katalogu jest własnym przybliżeniem atmosfery zdjęć, a nie odczytanym tokenem Wonderful.

## 3. Typografia

### Rodziny

| Rola | Rodzina i waga | Użycie |
|---|---|---|
| Display/headings | ABC Favorit Light, 300 | H1–H3, duże deklaracje, tytuły kart |
| Body/UI | Inter, 400; miejscami 500 | Opisy, nawigacja, CTA, formularz, metadane |
| Technical | IBM Plex Mono, 400 | Animowane etykiety systemu |

**O:** wszystkie trzy rodziny były załadowane i używane. Obecność Google Sans czy Fragment Mono w `document.fonts` nie oznacza, że są głównymi fontami marki. W CSS nagłówków pojawiają się m.in. `"ss04" on, "ss05" on`, a dla Inter `"ss03" on`; efekty zależą od rzeczywiście podłączonego pliku fontu.

**R:** `font-synthesis: none`; nie zastępować automatycznie light przez 400 ani nie syntetyzować bold. Fonty trzymać lokalnie po uzyskaniu odpowiednich plików. Fallback: `Arial, sans-serif` dla demonstracji; w produkcji sprawdzić łamanie wierszy po załadowaniu fontu. Sprawdzić polskie znaki `ąćęłńóśźż`.

### Zmierzone style

| Styl | Desktop | Mobile / wariant | Tracking | Line-height | Status |
|---|---|---|---|---|---|
| Hero home | 82 px | 42 px przy 390 px | −.05em | 1.05 | O |
| Hero product | 64 px | 38 px w wybranych presetach CSS | zwykle −.05em | zwykle 1.05 | O; warianty per strona |
| Hero about | 62 px | skalowanie per preset | odczyt w evidence | odczyt w evidence | O |
| Hero industry | 200 px przy 1440 px | 56–72 px proponowane | dopasować do długości | 1–1.05 proponowane | O desktop / R mobile |
| Section H2 | 48 px | 34 px przy 390 px | −.04em / −.05em | 1.05 / 1.15 | O home |
| Card H3 | 32 px przy 1440 px | 24 px mobile; 22 px przy 1415 px | −.04em | 1.15 | O |
| Secondary heading | 26 px | 24 px | ok. −.05em / −.04em | 1.25 / 1.15 | O logo heading |
| Small feature title | 20 px | zależny od komponentu | zależny od presetu | zależny od presetu | O AI OS |
| Body editorial | 17 px | proponowane 16–17 px | −.03em źródłowo | 1.28 źródłowo | O article / R mobile |
| Hero supporting copy | 20 px desktop | 17 px home mobile | lokalny preset | ok. 1.25 | O |
| UI / metadata | 14 px | 12–14 px | lokalnie do −.05em | 1.2–1.5 | O |

**R — korekta czytelności:** dla nowych długich artykułów 17/27.2 px, tracking −.01em, szerokość 600–680 px. Nie przenosić źródłowego, ciasnego 1.28 na wielostronicowe teksty bez testu czytelności. W formularzach mobile podnieść font do 16 px i pole do minimum 44 px. Katalog korzysta z tych korekt.

### Hierarchia treści

**R:** jeden H1 opisujący stronę; H2 sekcji; H3 kart. Wygląd nie narzuca poziomu HTML. W oryginale karta branży ma H1, a strzałki kart H3 — w nowej implementacji strzałka ma `aria-hidden="true"`, a karta H3. Nagłówki maksymalnie 2–3 linie, `text-wrap: balance`; nie wymuszać `<br>` uniwersalnie na desktop i mobile.

## 4. Layout, rytm, responsywność

**O:** serwis Framer nie ma jednej zunifikowanej siatki breakpointów. Layout home używa 880, 1440 i 1800 px; presety typograficzne także 800, 810 i 1200 px. To rzeczywista niespójność źródła, a nie powód do wymyślenia jednego „oryginalnego” breakpointu.

| Token/layout | Źródło O | System wdrożeniowy R |
|---|---|---|
| Page gutter | 24 mobile home, 20 mobile kontakt, 40 tablet, 60 szerokie układy | 24 / 40 / 60 px |
| Content max | 1200, 1280, 1400, 1680 px zależnie od sekcji | 1200 standard, 1680 wide |
| Article text | 600 px w OTE | 600 px, max 68ch |
| Section spacing | 60, 80, 84, 100, 120, 180 px; wyjątkowo 280+ w narracji scroll | 64 mobile / 96 tablet / 120 desktop |
| Gaps | 8, 12, 16, 24, 32, 42, 64 px | 8, 12, 16, 24, 32, 48, 64 px |
| Grid | układy flex/grid zależne od sekcji | 12 kolumn desktop / 8 tablet / 4 mobile |
| Hero home | 85vh + min 560 px w średnim wariancie; mobile 90vh | użyć svh, kontrolować minimalną wysokość treści |
| Cards carousel | 583×583 przy 1440; 330×391 przy 390 | kwadrat desktop, pionowa karta mobile |

**R — breakpointy nowego systemu:** `<880` mobile, `880–1199` tablet, `1200–1439` desktop compact, `≥1440` desktop wide, `≥1800` tylko powiększenie maksymalnych kontenerów. Nie implementować sztywnych szerokości artboardów Framera jako szerokości strony.

**R — reguły zachowania:**

- Hero split: dwie kolumny → pionowy stos. Główna treść i CTA przed rozbudowanym medium na małych ekranach, chyba że konkretny wariant przewiduje krótki fotograficzny intro.
- Karty 3-up → 2-up → 1-up; karuzela zachowuje fragment następnej karty.
- Tablist może przewijać się poziomo; nie ściskać nazw branż.
- Stopka: wielokolumnowa → dwie kolumny → jedna przy bardzo małej szerokości lub dużym zoomie.
- Formularz kontaktowy: źródło zachowuje pary imię/nazwisko na mobile. Rekomendacja: jedna kolumna poniżej 480 px.
- Interfejs ma działać przy 320 px i powiększeniu 200%; `min-width:0` na dzieciach grid/flex.
- W narracji scroll zastąpić bardzo długie, puste odcinki statycznym stosem na reduced motion.

## 5. Geometria, obrysy i głębia

**O:** CTA radius 50 px / 999 px; duże fotografie 8–12 px, karty carousel około 10.37 px; pola formularza 10 px; drobne elementy 4 px; cookie panel 14 px. Powierzchnie są przeważnie płaskie. Cienie nie stanowią głównego sposobu oddzielania kart.

**R:** radius `4 / 8 / 10 / 12 / 999 px`; border 1 px. Normalizować 10.37 do 10 tylko w wersji adaptowanej. Cień overlay `0 12px 36px rgb(0 0 0 / .08)` — rekomendacja, nie zmierzony token. Warstwy: base 0, media overlay 1, content 2, sticky 20, dropdown 30, dialog 50, toast 60. Z-index ma obowiązywać w ramach kontrolowanych stacking contexts.

## 6. Biblioteka komponentów

Każdy komponent powinien mieć wariant jasny/ciemny oraz opis statusu pomiaru. Poniższe niezaobserwowane stany, obsługa klawiatury i API to **R**.

### 6.1 Announcement bar

**O/W:** biały pasek nad nawigacją, krótka wiadomość i link ze strzałką; w tekście przesuwający się połysk. Na mobile wysokość ok. 37 px w badanym widoku. Podczas przewijania pasek opuszcza ekran, a nawigacja pozostaje.

**R:** tekst max 1–2 linie, cały sens dostępny bez animacji; link prawdziwym `<a>`. Nie stosować `aria-live` do dekoracyjnego shimmeru. Długą wiadomość skrócić redakcyjnie zamiast przesuwać bez końca.

### 6.2 Header / mega menu / mobile menu

**W:** logo po lewej, kategorie pośrodku, język i CTA po prawej. Na zdjęciu wersja inverse; po scrollu wersja jasna. Hover „Platform” otwiera szeroki biały panel z dwoma kolumnami odnośników i osobnym materiałem promocyjnym po prawej. Mobile ma znak menu z dwóch kresek.

**R — stany:** `transparent → solid-on-scroll`; `closed → opening → open → closing`; grupa `platform|industries|company`. Nie zmieniać wysokości headera przy zmianie koloru. Przyciski kategorii obsługują click, Enter, Space, Escape, `aria-expanded` i `aria-controls`. Desktop otwiera także hover, opóźnienie wejścia 100 ms i zamknięcia 150 ms ogranicza przypadkowe migotanie. Nie zamykać panelu, gdy fokus przechodzi do jego linków. Mobile: dialog/menu z kontrolą fokusu, zamknięcie Escape i powrót na trigger. Dokładny timing oryginalnego mega menu nie został odczytany.

### 6.3 Button

**O:** hero CTA 50 px wysokości desktop i 44 px mobile; padding 6×18 / 6×16 px; radius 50 px. Wariant primary inverse biały z ciemnym tekstem; secondary inverse transparentny z jasnym obrysem. Header CTA jest mniejszy niż hero CTA. Formularz ma osobny prostokątny, zaokrąglony przycisk.

**R — API:** `variant=solid|outline|text`, `tone=light|dark`, `size=sm|md`, `state=default|hover|pressed|focus|disabled|loading`, `icon=none|trailing`. Link używany do nawigacji, button do działania.

| Stan R | Wygląd / zachowanie |
|---|---|
| Hover solid | subtelna zmiana jasności tła, 180 ms |
| Hover outline | tło 6–10% koloru tekstu |
| Pressed | `scale(.98)`, 100 ms, bez zmiany wymiarów layoutu |
| Focus-visible | obrys 2 px i offset 4 px, wysoki kontrast |
| Disabled | opacity .45 + natywne disabled; bez hover |
| Loading | stała szerokość, tekst postępu; blokada podwójnego wysłania |

### 6.4 Link / arrow

**W:** ↗ na kartach, → przy CTA redakcyjnych, podkreślenie linków tekstowych w menu. **R:** ikony 16–24 px, stroke 1.5–2 px, spójny zestaw SVG; pole klikalne min. 44 px dla samodzielnej ikony. Hover: przesunięcie strzałki 3 px, 180 ms. Nie używać strzałki zamiast dostępnej nazwy linku.

### 6.5 Hero

**W:** cztery warianty: `cinematic` (home), `product` (AI OS/Agents/Systems/Gateway), `industry` (200 px label przy dolnej krawędzi fotografii), `editorial` (about/careers). Kontakt to piąty wariant `split-form`.

**R:** sloty `eyebrow`, `title`, `description`, `primaryAction`, `secondaryAction`, `media`, `overlay`. Opcjonalne elementy nie pozostawiają pustych odstępów. Zarezerwować proporcje/height mediów przed pobraniem. Hero może zawierać najwyżej dwie akcje; tekst nie powinien być częścią obrazu.

### 6.6 Logo strip

**W:** dyskretny nagłówek, pas monochromatycznych logotypów. **R:** optycznie wyrównać logotypy, wysokość ok. 24–40 px, odstęp 40–64 px; nie ustawiać wszystkim identycznej szerokości. Logo klienta nie może wyglądać jak nawigacja. Jeśli użyto pętli, zapewnić pauzę i statyczną wersję; dokładnego timingu ruchu pasa nie zmierzono.

### 6.7 Case study card / carousel

**O/W:** karta ze zdjęciem edge-to-edge, tytułem w lewym górnym rogu, strzałką w prawym, logo klienta na dole. Desktop przykładowo 583×583 px; mobile 330×391 px. Kolejne karty częściowo wychodzą poza viewport sekcji.

**R:** jedna semantyczna akcja na kartę, `overflow:hidden`, overlay dobierany do obrazu. Hover powiększa wyłącznie media do 1.035 przez 500 ms. Karuzela z `scroll-snap-type:x mandatory`, przyciskami poprzedni/następny oraz dotykiem; bez przejmowania pionowego scrolla. Brak wyników ma komunikat, a nie pustą sekcję. Autoplay domyślnie wyłączony.

### 6.8 Feature card / bento / split section

**W:** produktowe bloki łączą duży diagram z tekstem; mniejsze korzyści grupowane w siatki. Home zawiera parę fotograficznych kart Deployment/Strategy pod ciemną prezentacją OS.

**R:** wariant `media-top`, `split`, `text-only`, `dark-diagram`. Padding 24 mobile / 32–48 desktop. Nie narzucać jednakowej wysokości wszystkim sekcjom; w rzędzie kart wyrównać wysokości i pozycje linków. Diagram ma statyczny opis tekstowy i nie jest jedynym nośnikiem informacji.

### 6.9 Industry tabs

**W:** lista sześciu branż i jeden duży panel fotograficzny. **R:** wzorzec tabs z roving tabindex, ArrowLeft/Right oraz Home/End; aktywna pozycja poza kolorem ma linię lub wyróżnienie. Panel zmienia opacity 250 ms, wymiar zarezerwowany. Zachować URL do pełnej podstrony. Brak automatycznej zmiany podczas czytania.

### 6.10 Process / step list / metrics

**W:** numerowane zasady na Strategy; role FDE/DS i modele wdrożenia na Deployment; metryki startujące od 0 przed wejściem sekcji w viewport. **R:** numer 01–04 jako metadane, H3 etapu, krótki opis. Licznik 1000 ms ease-out, jeden raz po wejściu; końcowa wartość dostępna dla czytnika przez cały czas. Nie interpolować bez sensu dat, telefonów ani identyfikatorów.

### 6.11 Blog / article / related posts

**W:** wyróżniony artykuł w układzie zdjęcie + tekst, niżej siatka. Artykuł OTE: autor i data nad wycentrowanym tytułem 48 px; duży obraz poniżej; tekst w kolumnie 600 px; powiązane wpisy na końcu.

**R:** card anatomy: image → metadata → title → excerpt. Data jako `<time datetime>`, cała karta ma jednoznaczną nazwę. Artykuł wspiera H2/H3, listy, cytaty, tabele z poziomym scroll i podpisy obrazów. Kategorie/filtry, jeśli dodane, mają URL state i empty state — nie są potwierdzonym elementem referencji.

### 6.12 Formularz kontaktowy

**O/W:** desktop ekran podzielony na fotografię z informacjami i jasny formularz. Pola: email, imię, nazwisko, stanowisko, telefon, firma, branża, wielkość firmy, kraj. Mobile ma krótki fotograficzny intro nad formularzem. Wrapper pola 40 px, padding 12 px, radius 10 px, tło `rgba(0,0,0,.04)`, border `1px solid rgba(136,136,136,.1)`; font 14 px. Nie wysyłano formularza.

**R:** API `label`, `name`, `type`, `autocomplete`, `required`, `hint`, `error`. Label zawsze widoczny. Focus: wyraźny border i ring; error: ciemnoczerwony opis + ikona; success: osobne potwierdzenie. Loading utrzymuje szerokość CTA. Po błędzie serwera zachować dane i umożliwić ponowienie. Walidacja po blur i submit, bez komunikatu błędu przy pierwszej literze. Wymagalność pól ustalić biznesowo; nie wyciągać jej z samego wyglądu.

### 6.13 Team / careers

**W:** duża fotografia, jasne sekcje redakcyjne, prezentacja zespołu i ról. **R:** karta osoby `portrait/name/role/link`; karta roli `title/summary/location/action`. Listy ofert mogą mieć filtr, liczbę wyników i empty state jako rozszerzenie. Nie wpisywać na stałe liczników biur/osób z bieżącego marketingu w tokeny design systemu.

### 6.14 Footer / closing CTA

**W:** końcowe wezwanie do kontaktu, logo i rozbudowane grupy linków: Platform, Industries, Company, Social, Legal. **R:** listy linków z nagłówkami, czytelne etykiety, zachowanie hierarchii na mobile; odstęp 64–120 px od ostatniej sekcji. Nie stosować animacji wejścia, która utrudnia szybkie dotarcie do informacji kontaktowych.

### 6.15 Cookie panel / dialog

**O/W:** gotowy widget Framera; panel w prawym górnym rogu, biały, radius 14 px; dwie akcje Reject/Accept. Jego font i geometria różnią się od głównego UI. **R:** traktować jako integrację zewnętrzną, nie wzorcową kartę marki. W nowym dialogu max-width 400 px, padding 20–24, obsługa klawiatury i czytelne nazwy. Nie kopiować obcego odnośnika do polityki cookies.

## 7. Szablony stron

| Rodzina | Kolejność modułów R oparta na W | Referencja |
|---|---|---|
| Home | filmowy hero → logo strip → case carousel → deklaracja scroll → AI OS → dwie karty usług → branże → zespół → footer | `/` |
| Product overview | ambient hero + diagram → infrastruktura → zastosowania → korzyści → bezpieczeństwo → closing CTA | `/ai-os` |
| Product detail | hero produktu → zastosowania/korzyści → demonstracja → capabilities → case studies lub platform cross-links | `/agents`, `/systems`, `/ai-gateway` |
| Service | fotograficzny/ambient hero → model pracy → role/zasady → etapy → proof → CTA | `/deployment`, `/ai-transformation` |
| Industry | duża nazwa na fotografii → logotypy → operacje → workflow → argumenty → CTA | `/industries/banking`, `/industries/healthcare` |
| Company | jasne intro split → szerokie zdjęcie → misja/model → zespół → inwestorzy → publikacje → CTA | `/about-us` |
| Careers | jasne intro → zdjęcie → zasięg → role → oferty/odnośniki → CTA | `/careers` |
| Editorial index | featured split → siatka wpisów → footer | `/blog` |
| Editorial detail | metadane → tytuł → obraz → treść → related posts → footer | `/blog-articles/ote` |
| Contact | photo/intro + formularz → informacje pomocnicze | `/contact` |

Szablony są receptami kompozycji, nie obowiązkiem zapełnienia każdej sekcji. Legal, Press i zewnętrzny Trust Center zostały zidentyfikowane jako linki, ale nie objęte szczegółowym pomiarem.

## 8. Art direction: fotografia, wideo, diagramy

**W:** fotografie z ziarnem, rozmyciem ruchu i wyraźnym, spokojnym punktem zainteresowania; chłodne błękity/zieleń przełamane ciepłym światłem. Kadry z góry lub z perspektywy obserwatora; osoby w realnym kontekście pracy. Materiały produktowe używają rozmytych struktur przypominających wodę, szkło i światło.

**R — brief do nowych materiałów:** szeroki kadr z negatywną przestrzenią pod tekst, naturalne światło, jeden czytelny obiekt, miękkie rozmycie ruchu na obrzeżach, subtelne ziarno. Bez przypadkowych interfejsów, znaków Wonderful i logotypów klientów w nowych ilustracjach. Dla hero eksport osobno 16:9 i 9:16; zapisać focal point w CMS. Nie symulować grain animowaniem pełnoekranowego filtra SVG w każdej klatce.

**O:** home mobile odtwarza plik wideo 9:16 z `autoplay`, `loop`, `muted`. **R:** `playsinline`, poster, pauza poza viewport i przy ukrytej karcie, fallback przy błędzie/autoplay blocked, przy reduced motion poster. Nie pobierać desktop filmu na mobile, a potem ukrywać go CSS.

**O/W:** diagram OS to drobne kwadraty w siatce, małe kontrastowe etykiety z monospace oraz animowany przepływ. **R:** 1 px linie, kwadrat 6–8 px, etykieta 24–32 px; pomarańczowy używany punktowo. Szczegóły sekwencji w [MOTION.md](MOTION.md).

## 9. Dostępność i wydajność — wymagania wdrożenia R

- Tekst zwykły min. 4.5:1, duży min. 3:1; interakcyjne obrysy i wskaźniki 3:1 względem sąsiedniego tła. Pomarańczowy `#FC762F` na bieli nie nadaje się na mały tekst.
- Każdy stan hover ma odpowiednik focus; wszystkie interakcje działają bez myszy.
- Preferencja `prefers-reduced-motion` działa od pierwszego renderu i po zmianie ustawienia; treści nie mogą pozostać ukryte po wyłączeniu animacji.
- Ruch ciągły ma przycisk pauzy; animowane dekoracje `aria-hidden`; bez migania czytnika ekranu przy typewriterze/licznikach.
- Przewijanie jest natywne. Animacje scroll mają statyczną wersję, nie blokują scroll i nie utrudniają nawigacji kotwicami.
- Animować głównie transform i opacity. Wyjątek typewriter: wąski lokalny element; preferowana maska/clip-path w nowej wersji.
- Nie uruchamiać poza viewport kilkudziesięciu pętli tylko dlatego, że oryginał tak działa. Jedna instancja diagramu, pauza przy document.hidden.
- Obrazy mają `width/height` lub aspect-ratio; pierwszy istotny obraz nie jest lazy, pozostałe są. Wideo i diagram nie mogą blokować tekstu hero.
- Po podłączeniu fontu sprawdzić CLS i zawijanie; testować finalne fotografie pod kątem kontrastu w każdym kadrze.

## 10. Organizacja w Figma i kodzie

**R:** strony biblioteki: `00 Readme`, `01 Foundations`, `02 Components`, `03 Patterns`, `04 Templates`, `05 Motion`, `06 Reference`. Variables: kolekcje Color (Light/Dark), Spacing, Radius, Typography, Motion. Oddzielić wartości odczytane od semantycznych aliasów.

Przykładowe nazwy: `Button/Solid/Light/Default`, `Hero/Product/Dark`, `Card/CaseStudy`, `Navigation/MegaMenu`, `Form/TextField`, `Diagram/SystemLabel`. Nie tworzyć osobnego komponentu dla każdej strony, jeśli różni się tylko zdjęciem i tekstem.

Kod: tokeny → prymitywy → komponenty → wzorce → szablony. Treści i media poza komponentami. Motion config osobno od logiki biznesowej. Stan disabled nie zastępuje uprawnień; formularz produkcyjny wymaga niezależnej integracji backendowej.

## 11. Kryteria odbioru

1. Przegląd 390, 880, 1200, 1440 i 1800 px oraz 200% zoom; bez poziomego overflow dokumentu.
2. Kontrola użycia fontów, line-height i tracking po rzeczywistym załadowaniu plików.
3. Komponenty: default, hover, pressed, focus, disabled, loading; formularz także error i success.
4. Nawigacja i tabs działają klawiaturą; Escape oddaje fokus właściwemu triggerowi.
5. Wideo/diagram zatrzymują się poza viewport; reduced motion pokazuje kompletną, statyczną treść.
6. Odmowa pobrania mediów lub błąd JS nie usuwa tytułu, opisów i CTA.
7. Oddzielna kontrola template home, product, industry, article i contact.
8. Wierne odtworzenie porównywać z zrzutem o tej samej szerokości CSS i tym samym stanie animacji. Katalog jest implementacją referencyjną R, nie testem pixel-perfect całego serwisu.

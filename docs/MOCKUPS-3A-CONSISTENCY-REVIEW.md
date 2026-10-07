# Spójność mockupów 3a — 07.10.2026

Stan tej części: audyt przed poprawkami. Wykonanie opisano w sekcji
[aktualizacja po audycie](#aktualizacja-po-audycie--07102026).

## Wniosek

Mockupy tworzą rozpoznawalną rodzinę 3a i mogą zostać przeniesione do jednego
systemu komponentów. Zachowują Switzera, wiśniowy tekst i CTA, różowe powierzchnie,
białe tło oraz zaokrąglenia. Nie wymagają nowego kierunku graficznego. Nie są jednak
w pełni ujednolicone: powtarzalne elementy mają lokalne nadpisania, a część odnośników
nie uwzględnia już wykonanych podstron. Najpilniejsza poprawka dotyczy nagłówka przy powiększeniu. Kolejne dotyczą
rozpoznawania tego samego produktu, przewidywalności menu oraz newslettera.

To audyt lokalnych plików z bieżącego katalogu roboczego, także zastanych zmian.
Nie jest oceną wersji opublikowanej ani zatwierdzeniem copy, zakupu, rezerwacji
lub wdrożenia Sanity. W tej sesji nie zmieniano mockupów ani aplikacji.

## Zakres i źródło porównania

Wzorzec: [homepage 3a](../mockups/homepage/cherry-white.html), wspólne
[cherry.css](../mockups/homepage/cherry.css),
[white-background.css](../mockups/homepage/white-background.css),
[wordmarks.css](../mockups/homepage/wordmarks.css) oraz
[zasady Wonderful](../archive/wonderful-design-system/README.md), z uwzględnieniem
późniejszych decyzji w [konfiguracji homepage](HOMEPAGE-CMS-CONFIG.md).
Zastosowano Impeccable: odczyt kontekstu, wybrane kontrole technicznego audytu,
detektor i własne porównanie widoków; nie uruchamiano pełnej procedury critique.

| Widok                                                     | Ocena zgodności z rodziną 3a | Główna rozbieżność                                                     |
| --------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| [Homepage](../mockups/homepage/cherry-white.html)         | Wzorzec                      | Menu nadal kieruje do sekcji, nie wszystkich nowych podstron           |
| [O mnie](../mockups/homepage/about-3a.html)               | Zgodny kierunek              | Inny układ nagłówka, mniejsze logo przy 320 px, nadpisanie newslettera |
| [Konsultacja](../mockups/homepage/consultation-3a.html)   | Zgodny wariant sprzedażowy   | Stopka; „E-booki” kieruje do pojedynczego produktu                     |
| [E-book](../mockups/homepage/ebook-3a.html)               | Zgodny wariant sprzedażowy   | Inna okładka tego samego produktu i strzałki fontowe                   |
| [Kolekcja e-booków](../mockups/homepage/ebooks-3a.html)   | Zgodny kierunek              | Brak Bloga w menu; odmienny układ formularza newslettera               |
| [Blog](../mockups/homepage/blog-3a.html)                  | Zgodny kierunek              | Inne położenie menu i nadpisanie newslettera                           |
| [Blog, strona 2](../mockups/homepage/blog-3a-page-2.html) | Spójna ze stroną 1           | Dziedziczy te same rozbieżności                                        |
| [Artykuł](../mockups/homepage/article-3a.html)            | Zgodny wariant do czytania   | „O mnie” wraca do sekcji homepage; nadpisanie newslettera              |

## Potwierdzone rozbieżności i zalecenia

### 0. P1 — przy CSS zoom 200% nagłówek nie mieści się w pięciu widokach

Na homepage, konsultacji, landingu e-booka, kolekcji i artykule przy szerokości
320 oraz 390 px i CSS zoom 200% pojawia się poziomy overflow. Wordmark rezerwuje
zbyt dużą szerokość; trigger menu wypada poza widoczny ekran. Potwierdzono po
odczekaniu na fonty i layout, w Chromium, Firefox oraz WebKit: 30 nieudanych
przypadków spośród 72 końcowych kontroli zoomu. Przy 1440 px wszystkie osiem
widoków przechodzi kontrolę. Blog, jego druga strona i „O mnie” przechodzą
również wąskie widoki z zoomem.

Źródła: `wordmarks.css:3`, `base.css:190`, lokalne szerokości logo w CSS
obu landingów. Dowód: [homepage z powiększeniem](../output/design-consistency-3a/2026-10-07/cherry-white-zoom-320.png)
i [O mnie z powiększeniem](../output/design-consistency-3a/2026-10-07/about-3a-zoom-320.png).

**Zalecenie:** wspólny responsywny nagłówek uwzględniający rzeczywistą szerokość
marki i miejsce na natywny trigger; wykorzystać sprawdzone zabezpieczenia bloga
oraz „O mnie”. Nie ukrywać overflow jako naprawy. Wynik dotyczy CSS zoom;
nie zastępuje kontroli natywnego powiększenia przeglądarki.

### 1. P2 — ten sam e-book ma dwie różne okładki

„Suplementy w PCOS” na homepage, w kolekcji i pod artykułem ma jasną okładkę
`#fff4f6`, tekst `#70283f` i motyw „Cel / Dawka / Decyzja”. Landing pokazuje
wiśniową okładkę `#882f48`, jasny tekst, inny układ i „Cel / Dowody / Decyzja”.
Wiśniowa wersja w katalogu przynależy do innego produktu — „Badania, które mają sens”.
To największa wizualna niespójność identyfikacji produktu.

Źródła: `cherry-white.html:303`, `ebooks-3a.html:159`, `article-3a.html:601`,
`ebook-3a.css:81` oraz `.decision-art` w landingu.

**Zalecenie:** ustalić jedną okładkę; używać jej na wszystkich powierzchniach.
Duży widok może mieć perspektywę, grzbiet i cień, ale powinien zachować kolor,
układ i treść frontu. W migracji: jedna referencja produktu i jeden komponent
okładki z kontrolowaną skalą. Wybór wersji nie został jeszcze zatwierdzony.

### 2. P2 — nawigacja nie prowadzi konsekwentnie do tych samych miejsc

Kolekcja e-booków nie ma „Blog” ani na desktopie, ani w menu mobilnym.
„O mnie” z bloga prowadzi do osobnej podstrony, z artykułu do sekcji homepage.
„Konsultacje” z kolekcji prowadzą do landingu, z bloga, artykułu i „O mnie” do
sekcji homepage. „E-booki” w stopce konsultacji kieruje do pojedynczego e-booka;
w innych miejscach do karuzeli, mimo istnienia pełnej kolekcji.
Na homepage i w artykule mobilne „Blog” poprzedza „Newsletter”; na blogu
oraz „O mnie” kolejność jest odwrotna. Kolekcja nie oznacza E-booków jako
aktualnej podstrony tak, jak blog i „O mnie”.

Źródła: `ebooks-3a.html:38`, `article-3a.html:80`, `blog-3a.html:38`,
`about-3a.html:59`, `consultation-3a.html:551`.

**Zalecenie:** wspólna globalna kolejność E-booki / Konsultacje / O mnie / Blog,
ze stałymi celami odpowiadającymi podstronom. Newsletter jako CTA na desktopie
oraz ostatni element menu mobilnego. Linki do sekcji pozostawić jako osobne,
celowo nazwane akcje. To propozycja audytu, nie nowa decyzja użytkownika.

### 3. P2 — nagłówek zmienia geometrię i skalę marki

Przy 1440 px homepage, artykuł i kolekcja rezerwują dla wordmarku 290 px;
blog oraz „O mnie” używają szerokości auto, około 131 px. Sam rysunek liter
pozostaje taki sam, ale menu przesuwa się wyraźnie w lewo. Header ma 80 px
na homepage, około 86 px na blogu i „O mnie”. Przy 320 px logo ma 28 px
na homepage, artykule, kolekcji i konsultacji, 24 px na landingu e-booka,
22 px na blogu i „O mnie”. To mierzalny, nie tylko optyczny rozjazd.

Źródła: `wordmarks.css:3`, `about-3a.css:26`, `blog-3a.css:13`,
`ebook-3a.css:982`, `consultation-3a.css:883`.

**Zalecenie:** jeden komponent nagłówka z ustaloną szerokością kolumny marki,
wielkością logo i regułami dla małych ekranów. Zachować wersję umożliwiającą
zawijanie przy powiększeniu; nie usuwać lokalnych zabezpieczeń bez testu.
Landing może zmieniać treść menu i CTA, bez zmiany podstawowej geometrii.

### 4. P2 — wspólny newsletter wygląda jak kilka wariantów

Treść newslettera jest wspólna, lecz na desktopie nagłówek homepage ma dwie
linie, bloga oraz „O mnie” trzy. Na homepage tracking wynosi `-0.055em`,
na blogu, artykule i „O mnie” `-0.04em`. Przy 320 px blog ustawia 34 px,
pozostałe sprawdzone powierzchnie newslettera 42 px.
Kolekcja e-booków przy 1440 px mieści input i przycisk w jednym rzędzie,
pozostałe formularze mają przycisk pod inputem. „O mnie” dodatkowo skraca
pionowy odstęp całej sekcji przez globalne nadpisanie `.section`.

Źródła: `3a-copy.css:28`, `cherry.css` (`.newsletter h2`),
`about-3a.css:48`, `about-3a.css:52`, `article-3a.css:321`,
`blog-3a.css:269`, `ebooks-3a.css:252`.

**Zalecenie:** jeden komponent newslettera; wspólna typografia, odstępy i reguła
układu formularza zależna od dostępnej szerokości. Nadpisania nagłówków podstrony
ograniczyć do treści danej podstrony. Dla newslettera nie ma obecnie wyraźnego
uzasadnienia dla odrębnych wariantów wizualnych.

### 5. P2 — landing e-booka wraca do fontowych strzałek

Homepage i konsultacja używają SVG `currentColor`. Landing e-booka używa glifu
„↗”, m.in. w headerze, głównym CTA, linku podglądu i przycisku zakupu.
Wygląd jest drobniejszy i może zależeć od fontu/fallbacku platformy.
To także odstępstwo od wcześniejszego ujednolicenia ikon 3a.

Źródła: `ebook-3a.html:43`, `ebook-3a.html:66`, `ebook-3a.html:431`.

**Zalecenie:** użyć istniejącego SVG i wspólnych wymiarów; zachować dostępne nazwy.

### 6. P2 — stopki nie mają wspólnej struktury

Homepage, „O mnie”, kolekcja, blog i artykuł mają Instagram/Facebook/TikTok
oraz wspólny opis marki. Landing e-booka zastępuje sociale linkami sekcji;
konsultacja ma inne hasło marki i jeszcze inny zestaw odnośników.
Różne są również prezentacje przełącznika motywu. CTA może być lokalne,
ale użytkownik traci stałe miejsce do odnajdywania reszty serwisu.

Źródła: `cherry-white.html:844`, `ebook-3a.html:574`,
`consultation-3a.html:539`.

**Zalecenie:** wspólny rdzeń stopki: marka, nawigacja serwisu, zatwierdzone sociale,
linki prawne. Jeśli sprzedaż wymaga wersji uproszczonej, nazwać ją kontrolowanym
wariantem i stosować jednakowo na obu landingach. Nie dodawać newslettera do
landingów automatycznie — jego brak może być celowy.

### 7. P3 — CSS nie jest jeszcze bezpieczny do połączenia w jeden pakiet

Blog i kolekcja e-booków definiują nieograniczone klasą strony
`.collection-heading` z różnymi modelami układu: flex i grid. Globalne
`.about-page h2` wpływa na współdzielony newsletter; artykuł nadpisuje jego
tracking jawnie przez `.article-page .newsletter-copy h2`.
Obecnie strony ładowane osobno działają; konflikt `.collection-heading` jest
ryzykiem migracji i wspólnego bundla, nie dowiedzionym błędem obecnych HTML.

**Zalecenie:** scoped style komponentów Astro, nazwy komponentów i kontrolowane
warianty. Nie sklejać wszystkich plików CSS jako implementacji design systemu.
Utrzymać jedno źródło tokenów i wspólne referencje danych.

## Różnice uzasadnione rolą strony

- Artykuł: wyśrodkowany tytuł, węższy tekst, spis treści i kolumny pomocnicze.
  To zgodny wariant do czytania, nie niepożądana zmiana estetyki.
- Landingi: lokalne menu sekcji oraz CTA produktu/rezerwacji zamiast newslettera.
  Sensowny wariant sprzedażowy, wymagający wspólnej geometrii i drogi do serwisu.
- Blog i kolekcja: odpowiednio siatka wpisów z paginacją i katalog z filtrami.
  Dwa różne zadania nie wymagają identycznego układu kart.
- Różne portrety i zaokrąglenie jednego dużego narożnika w hero: istniejące
  zasoby i motyw 3a. Prostokątny portret „O mnie” nie wprowadza obcej palety.
- Rozmiar H1 zależny od długości i roli treści jest dopuszczalny.
  Nie należy wyrównywać wszystkich tytułów do tej samej liczby pikseli.

## Zgodność wspólnych fundamentów

W ośmiu widokach odczytano identyczną paletę jasną: tło `#ffffff`, tekst
`#70283f`, tekst pomocniczy `#785861`, powierzchnia `#f2dce3`, CTA `#882f48`,
napis CTA `#fff4f6`. Odczyty ciemnego motywu również wskazują wspólne wartości.
Nie ma rozjazdu kroju: interfejs korzysta z tego samego self-hostowanego Switzera.
Główne CTA mają wspólny kształt pill, zazwyczaj wysokość około 50–51 px
na desktopie. Media i panele korzystają z motywu zaokrągleń 24 px.
Ceny e-booków pozostają 97 zł; konsultacja w sprawdzonych blokach kosztuje
450 zł / 60 minut. Zastrzeżenia demonstracyjnej sprzedaży i przygotowania
materiałów są zachowane. Obie podstrony bloga używają jednego CSS.

## Kontrole i ograniczenia

- Osiem widoków: Chromium przy 320/390/768/1440 px; zrzuty desktop/mobile,
  odczyt palety, fontów, nagłówków, linków, CTA, newslettera, stopki i okładek.
- Chromium/Firefox/WebKit: 72 kontrole normalnego widoku przy 320/390/1440 px,
  bez overflow. Dodatkowe 24 kontrole bez JS z reduced motion: widoczna treść,
  jeden H1, bez overflow. Nie są pełnym testem funkcji bez JS.
- Końcowa kontrola CSS zoom 200% po ustabilizowaniu: 42/72 PASS, 30/72 FAIL,
  szczegóły w punkcie 0. Nie przyjęto wcześniejszych ogólnych deklaracji PASS
  w dokumentacji jako dowodu stanu obecnego.
- Menu w Chromium: Enter otwiera, Escape zamyka i przywraca fokus triggera
  we wszystkich ośmiu widokach. Nie testowano całej sekwencji Tab wszystkich stron.
- Axe Chromium, każdy widok light/dark, reduced motion: 16 audytów,
  zero naruszeń WCAG A/AA w końcowym przebiegu. To nie dowodzi pełnego WCAG.
- Pierwszy axe wskazał 10 alarmów kontrastu formularza; po odczekaniu na
  ustabilizowanie strony i wyłączeniu przejść nie odtworzono ich. Nie zgłoszono
  ich jako potwierdzonej wady. Początkowy zrzut kolekcji mobilnej pomijał Menu;
  świeży odczyt geometrii i ponowny zrzut potwierdziły widoczny trigger.
- Zebrane błędy JS, błędne odpowiedzi zasobów i niedekodowane obrazy w pierwszej
  rundzie Chromium: brak. Ciemny motyw i reduced motion z zachowaną treścią.
- Początkowa próba montażu obrazów przez Pillow nie powiodła się (brak modułu);
  zestawienia wygenerowano w przeglądarce bez instalowania zależności.
- Lokalny podgląd uruchomiono sprawdzoną komendą
  `node scripts/preview-homepage-mockups.mjs` na 127.0.0.1:8766; wymagał
  zezwolenia środowiska na lokalny port. Serwer zatrzymano po audycie.

Detektor: 123 ostrzeżenia, w tym side-tab 16, extreme-negative-tracking 18,
undersized-ui-text 30, cramped-padding 38, tight-leading 15 i pojedyncze inne.
Zlicza również style wspólne ponownie dla kolejnych HTML. Nie są to 123 osobne
potwierdzone defekty. M.in. grzbiety okładek, mocny tracking i krótkie podpisy
należą do zastanego projektu; sam detektor nie uzasadnia ich usunięcia.

Dowody: [pomiary](../output/design-consistency-3a/2026-10-07/measurements.json),
[pierwsza kontrola](../output/design-consistency-3a/2026-10-07/checks.json),
[końcowe potwierdzenie](../output/design-consistency-3a/2026-10-07/confirmation.json),
[detektor](../output/design-consistency-3a/2026-10-07/detector.json),
[zestawienie desktop](../output/design-consistency-3a/2026-10-07/comparison-1440.png)
i [mobile](../output/design-consistency-3a/2026-10-07/comparison-390.png).

Nie wykonano natywnego zoomu, czytnika ekranu, kontroli na fizycznym telefonie
ani pomiarów Lighthouse/CWV. Nie przeprowadzano pełnego testu wszystkich
interakcji, n8n, płatności czy kalendarza. `npm run verify` nie uruchamiano:
zmieniono wyłącznie dokumentację i zapisano dowody audytu. Format czterech
dokumentów, diff-check i istnienie 99 lokalnych odnośników: PASS. Nie sprawdzano
zewnętrznych URL ani wszystkich kotwic starszej dokumentacji.

## Kolejność dalszej pracy

Najpierw naprawić powiększenie nagłówka, ujednolicić okładkę i cele nawigacji,
następnie wspólny header,
newsletter, ikony i stopkę. Przy migracji zastosować wspólne komponenty Astro
oraz referencje Sanity; lokalne wyjątki ograniczyć do uzasadnionych wariantów.
Po zmianach wykonać `npm run verify` oraz ponowny przegląd wspólnych komponentów
na desktopie, przy 320 px, z klawiaturą i powiększeniem. Zalecenia są propozycjami
audytu; nie zostały jeszcze wykonane ani zatwierdzone jako nowa konfiguracja CMS.

## Aktualizacja po audycie — 07.10.2026

Na polecenie „zaktualizuj mockupy zgodnie z wynikami audytu” wykonano poprawki
we wszystkich ośmiu widokach. Źródłem wspólnej geometrii i stylu jest
[3a-shared.css](../mockups/homepage/3a-shared.css), ładowany po stylach podstrony
wyłącznie dla `.mockup-3a`. Nie zmieniono innych pięciu kierunków ani tokenów Wonderful.

- Jeden header, rozmiar logo i natywny trigger menu; panel otwiera się pod
  rzeczywistą wysokością headera. Przy węższym widoku lub powiększeniu elementy
  mogą się zawijać. Menu globalne prowadzi do pełnych podstron, Blog jest także
  w kolekcji e-booków, a aktualna podstrona otrzymuje `aria-current`.
- Jasna okładka z homepage, z motywem Cel / Dawka / Decyzja, w obu miejscach
  landingu e-booka. Ten sam HTML frontu i istniejące `.book-cover` / `.cover-1`.
  Usunięto drugi zestaw typografii/kolorów frontu; obrót prezentacji może pozostać.
- Wspólny newsletter: nagłówek, odstępy i układ formularza; usunięte zbędne
  nadpisania. Copy i demonstracyjne zachowanie zachowane. Bez nowego newslettera
  na landingach, bez nowych obietnic lub zmian cen.
- Strzałki landingu e-booka korzystają ze wspólnego SVG `currentColor`.
- Jednolita stopka: marka, sociale, cztery globalne linki, prawo i jeden
  przełącznik motywu. Uwagi o demonstracyjnej ofercie zachowane. Homepage
  nadal ma porównanie kierunków, a przełącznik motywu przeniesiono do stopki.
- `.collection-heading` ograniczono klasą właściwej podstrony, także w regułach
  responsywnych. Typografia „O mnie” nie obejmuje wspólnego newslettera.
- Naprawa reflow objęła także przyciski, liczbę 450+, FAQ/rozdziały, autorów,
  siatkę okładek i przełącznik kierunków. Pierwotne zbyt szerokie logo maskowało
  część dalszego overflow. Nie ukrywano go globalnie; tabela artykułu nadal
  ma własny, dostępny region przewijania.

Dodano [testy regresji](../tests/e2e/mockup-3a-consistency.spec.ts): dostępność
Menu i brak overflow przy CSS zoom 200% na 320/390 px dla ośmiu widoków oraz
rzeczywiste przejścia konsultacja → kolekcja → Blog → O mnie → konsultacja.
Końcowy osobny przebieg: 6/6 PASS w Chromium/Firefox/WebKit. Wcześniejsze
nieudane przebiegi ujawniły dalsze źródła overflow; poprawiono kod, bez wyłączania
asercji ani zwiększania timeoutów.

Dowody po zmianach: [QA](../output/design-consistency-3a/2026-10-07/updated/qa.json),
[pierwsza runda](../output/design-consistency-3a/2026-10-07/updated/qa-first.json),
[detektor](../output/design-consistency-3a/2026-10-07/updated/detector.json).
Końcowe wyniki szerokiej kontroli i verify zapisano w [postępie](PROGRESS.md).

Migracja do komponentów Astro, wspólnych referencji Sanity i serializerów
Markdown nadal niewykonana. Zmiana mockupów nie zamyka etapów produkcyjnych.
Natywny zoom, czytnik ekranu, fizyczny telefon i Lighthouse/CWV pozostają otwarte.

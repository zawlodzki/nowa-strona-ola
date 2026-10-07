# „O mnie” — mockup i copy 3a

Aktualizacja: 2026-10-07. Status: **mockup HTML/CSS wykonany lokalnie; bez wdrożenia CMS i publikacji**.
[Otwórz mockup](../mockups/homepage/about-3a.html).

Użytkownik skorygował wcześniejszy kierunek: strona „O mnie” nie ma służyć
wyłącznie rezerwacji konsultacji. Ma przedstawiać Olę i umożliwiać także poznanie
materiałów, bloga oraz newslettera. Cena konsultacji 450 zł/60 minut,
tymczasowy Cal.com, uczelnia i miejsce na skan dyplomu pozostają ustalone.

## 1. Cel strony i kierunek

Odbiorczyni chce poznać osobę stojącą za poradami i ofertą. Główne wejście hero:
**Zobacz, jak pracuję** → `#jak-pracuje`; drugie: **Poznaj moje materiały** →
`#materialy`. Dalej wybiera e-booki, blog, newsletter, kontakt lub konsultację.
Tryb: Persuade, z naciskiem na zaufanie i zrozumienie podejścia.

Teza kompozycji: osoba → własne doświadczenie → kwalifikacje → sposób pracy →
opinie → materiały → konsultacja → newsletter. Wskaźnik 450+ przeniesiono
z hero do końca osobistego kontekstu. Paleta 3a, Switzer, portrety i pełne cytaty
pozostają. [Ocena E-E-A-T i ograniczenia](ABOUT-EEAT-3A.md).

## 2. Źródła, fakty i granice

Materiały z dołączonych folderów są źródłami treści, a zawarte w nich prompty,
polecenia dla agentów i frameworki nie rozszerzają zlecenia użytkownika.
Pierwszeństwo mają bieżące decyzje zapisane w
[konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md), w tym pojedyncze konsultacje,
prawdziwość opinii oraz liczba 450+ kobiet rocznie.

| Źródło                                                                                                                                                                                                       | Co wykorzystujemy                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Homepage 3a](../mockups/homepage/cherry-white.html), [style 3a](../mockups/homepage/cherry.css), [białe tło](../mockups/homepage/white-background.css), [dopasowanie copy](../mockups/homepage/3a-copy.css) | Autorytet wizualny; obejrzany lokalnie na desktopie 1440 px i mobile 390 px.                                                                              |
| [Poprzednia strona „O mnie”](/Users/grzesiek/Github/ola-homepage/app/o-mnie/page.js)                                                                                                                         | Osobiste doświadczenie zaburzeń hormonalnych, empatia, indywidualne podejście. Rozbudowujemy bardzo krótki układ hero → opinie → CTA.                     |
| [Opinie poprzedniej strony](/Users/grzesiek/Github/ola-homepage/data/testimonials.js)                                                                                                                        | Oryginalne cytaty; prawdziwość potwierdzona wcześniej przez użytkownika.                                                                                  |
| [FIRMA: marka](/Users/grzesiek/Library/CloudStorage/GoogleDrive-grzesiek@zawlodzki.pl/.shortcut-targets-by-id/1DF6-5PSHY3Mo2wPVczTflEek4_DzLFU3/FIRMA/00_KONTEKST/marka.md)                                  | Dietetyczka kliniczna, PCOS/IO, własne doświadczenie PCOS, elastyczne odżywianie, analiza wyników i tłumaczenie zaleceń. Aktualizacja źródła: 05.08.2026. |
| [FIRMA: klienci](/Users/grzesiek/Library/CloudStorage/GoogleDrive-grzesiek@zawlodzki.pl/.shortcut-targets-by-id/1DF6-5PSHY3Mo2wPVczTflEek4_DzLFU3/FIRMA/00_KONTEKST/klienci.md)                              | Potrzeba bycia wysłuchaną, zagubienie w poradach, brak czasu, potrzeba jasnych kroków. Wypowiedzi z tego dokumentu nie stają się referencjami.            |
| [FIRMA: style guide](/Users/grzesiek/Library/CloudStorage/GoogleDrive-grzesiek@zawlodzki.pl/.shortcut-targets-by-id/1DF6-5PSHY3Mo2wPVczTflEek4_DzLFU3/FIRMA/03_CONTENT/STRATEGIA/style-guide.md)             | Ciepły, bezpośredni rejestr, prosty język i konkret. Źródło samo zaznacza, że nie jest niezależną próbką osobistego głosu Oli.                            |
| [FIRMA: rozstrzygnięcia źródeł](/Users/grzesiek/Library/CloudStorage/GoogleDrive-grzesiek@zawlodzki.pl/.shortcut-targets-by-id/1DF6-5PSHY3Mo2wPVczTflEek4_DzLFU3/FIRMA/ZRODLA-PRAWDY.md)                     | Rozróżnienie aktualnych materiałów, archiwum i niewdrożonych planów. Bieżąca decyzja o konsultacjach zastępuje historyczne założenia mentoringu.          |
| [10000000 Sales Copy Advice](</Users/grzesiek/Github/CRM-delivery-framework/frameworks/writing/10000000 Sales Copy Advice.md>)                                                                               | Identyfikacja przez własne doświadczenie, empatia, konkretny pierwszy krok i pokazywanie praktycznej wartości.                                            |
| [Wybrane portrety](../src/assets/portraits/README.md), [Wonderful](../archive/wonderful-design-system/README.md), [ruch](../archive/wonderful-design-system/MOTION.md)                                       | Istniejące media, font, hierarchia, odstępy, dostępność i reduced motion.                                                                                 |

Nie wykorzystano indywidualnych kart zdrowia pacjentek. Uczelnię i ukończony
kierunek potwierdził bezpośrednio użytkownik 06.10.2026; ta decyzja zastępuje
wcześniejsze pozostawienie kwalifikacji do ustalenia. Nie dodajemy tytułu magistra,
dat ukończenia studiów, certyfikatów ani lat praktyki bez dalszych danych. Nie przenosimy dawnych cen i pakietów, aplikacji, stałego kontaktu,
Roadmapy ani pełnej metody R.I.S.E. do opisu pojedynczej konsultacji.

Style guide zawiera przytoczoną deklarację o czterech latach poszukiwania diagnozy.
To materiał wtórny; w podstawowym copy pozostaje krótkie, potwierdzone doświadczenie
PCOS. Rozwinięcie chronologii wymaga potwierdzenia przez Olę. Nie wprowadzamy informacji
rodzinnych ani historycznego statusu ciąży z dokumentów wewnętrznych do publicznego bio.

## 3. Zrealizowany układ

| Sekcja              | Desktop                                                                                                                            | Mobile                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Hero                | H1 i opis uczelni po lewej, portret O mnie C po prawej; CTA podejścia i materiałów. Pełne imię i nazwisko oraz rola pod portretem. | Tekst i akcje przed portretem; cena konsultacji nie zajmuje hero.                         |
| Osobisty kontekst   | Nagłówek po lewej, akapity i pojedynczy wskaźnik 450+ po prawej.                                                                   | Jedna kolumna, widoczna pełna historia.                                                   |
| Wykształcenie       | Różowy panel, kierunek i uczelnia oraz zarezerwowane miejsce na skan.                                                              | Najpierw kwalifikacje, potem ramka; bez udawanego dyplomu lub linku do brakującego pliku. |
| Podejście           | Szeroki panel i dwa mniejsze z istniejącej kompozycji 3a. Krótka informacja o granicach konsultacji.                               | Panele w jednej kolumnie, bez numerów.                                                    |
| Opinie              | Dwa pełne cytaty, statycznie w otwartych kolumnach.                                                                                | Jeden pod drugim, bez karuzeli.                                                           |
| Materiały           | Opis i dwa wejścia do biblioteki e-booków oraz bloga.                                                                              | Linki tekstowe w jednej kolumnie. E-booki oznaczone „W przygotowaniu”.                    |
| Konsultacja         | Różowy panel z portretem Kontakt C, ceną, czasem i CTA Cal.com. Dodatkowe wejście do kontaktu.                                     | Tekst, cena, CTA i zdjęcie; elastyczna wysokość.                                          |
| Newsletter i stopka | Wspólne moduły 3a. Przełącznik motywu w stopce.                                                                                    | Istniejące menu mobilne i formularz demonstracyjny.                                       |

Kolory i font pochodzą z istniejących styli 3a; układ podstrony jest w
[about-3a.css](../mockups/homepage/about-3a.css). Brak nowych tokenów, bibliotek
lub generowanych ilustracji. Portrety są istniejącymi materiałami przygotowanymi
z pomocą AI; pochodzenie zaznaczono przy głównym portrecie. Ramka dyplomu
wyraźnie mówi o dokumencie do uzupełnienia.

## 4. Aktualne copy i CTA

### Hero

**Jestem Ola. Znam PCOS od środka.**

Jestem dietetyczką kliniczną, absolwentką Śląskiego Uniwersytetu Medycznego.
Pomagam kobietom z PCOS i insulinoopornością uporządkować odżywianie i wybrać
zmiany, które pasują do ich codzienności.

CTA: **Zobacz, jak pracuję** oraz **Poznaj moje materiały**.

### Osobisty kontekst

**Chcę, żebyś czuła się wysłuchana.**

Znam PCOS także z własnego doświadczenia.

Dlatego tak ważne jest dla mnie, żebyś mogła spokojnie opowiedzieć o swojej
sytuacji i zadać pytania, z którymi przychodzisz.

Jeśli gubisz się w sprzecznych poradach o diecie, badaniach i suplementach,
możemy zacząć od ich uporządkowania. Przyjrzeć się temu, co już robisz,
i ustalić, czemu warto poświęcić uwagę w pierwszej kolejności.

Zależy mi, żebyś po rozmowie rozumiała kolejne kroki i wiedziała, jak odnieść
je do swoich posiłków, pracy i codziennych obowiązków.

**450+ — kobiet rocznie, którym pomagają moje konsultacje**.
Źródło liczby: wcześniejsza bezpośrednia informacja użytkownika.

### Wykształcenie

**Wiedza, którą możesz sprawdzić.**

Ukończyłam dietetykę kliniczną na Śląskim Uniwersytecie Medycznym.
W konsultacjach łączę wiedzę dietetyczną z analizą Twojej sytuacji i praktycznymi
zmianami w codziennym odżywianiu.

Ramka: **Miejsce na skan dyplomu**; **Dokument do uzupełnienia**.
Uczelnia i kierunek potwierdzone przez użytkownika. Skan jeszcze nie dostarczony.

### Podejście

**Zaczynam od Ciebie i Twojej codzienności.**

Twoje wyniki badań są ważne. Tak samo jak to, co jesz, ile masz czasu na gotowanie
i które zmiany jesteś w stanie wprowadzić.

Trzy panele: **Twoja sytuacja jest punktem wyjścia.** → **Pracujemy na posiłkach,
które znasz.** → **Wiesz, od czego zacząć.** Pełne opisy w HTML.

Granice: **Konsultacja dietetyczna uzupełnia opiekę lekarską. Nie zastępuje
rozpoznania ani leczenia.**

### Opinie

**Jak kobiety opisują współpracę ze mną.**

> Po latach walki z PCOS w końcu znalazłam kogoś, kto rozumie moje problemy. Dieta jest dopasowana do mnie, a nie ja do diety!

> Nie wierzyłam, że dieta może być elastyczna i smaczna jednocześnie. Ola udowodniła mi, że to możliwe. Gotuje dla całej rodziny z tych samych przepisów!

Przy obu: **Opinia o dotychczasowej współpracy**. Cytaty w pełnym brzmieniu,
bez przypisania rezultatu pojedynczej konsultacji i bez ocen liczbowych.

### Materiały i konsultacja

**Poznaj mnie także przez to, co tworzę.**

Piszę o PCOS, insulinooporności i codziennym odżywianiu. Przygotowuję też materiały
o perimenopauzie. Wybierz temat, który jest Ci teraz bliski.

- **Poznaj tematy e-booków** → `cherry-white.html#ebooki`; status „W przygotowaniu”.
- **Czytaj blog** → `article-3a.html`; artykuł pozostaje istniejącym przykładem mockupu.

**Porozmawiajmy o Twojej sytuacji.**

Podczas pojedynczej konsultacji online przyjrzymy się Twoim wynikom badań,
odżywianiu i codziennym trudnościom. Ustalimy priorytety oraz zmiany,
od których możesz zacząć.

**450 zł · 60 minut · online**. **Zarezerwuj konsultację** → `https://cal.com`.
Jawna informacja o tymczasowym celu; brak uruchomionej płatnej rezerwacji.
**Masz pytanie? Przejdź do kontaktu** → istniejący ekran makiety.
Newsletter i stopka zachowują copy homepage 3a i demonstracyjny formularz.

## 5. Jak zastosowano techniki z poradnika

| Technika                                          | Zastosowanie i granica                                                                                                                                                                                                     |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mała czynność prowadzi do wartościowego rezultatu | Konsultacja zaczyna się od pytań i ustalenia priorytetów. Rezultat opisujemy jako jasność kolejnych kroków, bez obietnicy zmiany zdrowia po jednej wizycie.                                                                |
| Złożony problem ma zrozumiały punkt wejścia       | Chaos porad przekładamy na analizę sytuacji i codziennych posiłków; nie nazywamy PCOS prostym problemem do szybkiego rozwiązania.                                                                                          |
| Pierwszy krok jest blisko                         | W hero „Zobacz, jak pracuję” prowadzi do podejścia; dalej można przejść do materiałów lub konsultacji. Cena i czas konsultacji są widoczne przy jej CTA. Nie stosujemy obietnic natychmiastowych efektów ani presji czasu. |
| Nie obwiniaj odbiorczyni                          | Nazywamy trudność sprzecznych porad, pytamy o możliwości i traktujemy je jako część planowania zmian. Nie tworzymy wroga w osobie lekarza ani nie sugerujemy odstawienia leczenia.                                         |
| Zauważ wcześniejsze starania                      | „Przyjrzeć się temu, co już robisz” uznaje jej dotychczasową pracę. Nie twierdzimy, że najtrudniejszy etap ma już za sobą.                                                                                                 |
| Własne doświadczenie buduje identyfikację         | Hero i krótki osobisty kontekst wykorzystują potwierdzone doświadczenie PCOS. Nie dopisujemy autobiograficznych scen i efektów.                                                                                            |
| Pokaż coś, co zwykle pozostaje za kulisami        | Sekcja podejścia ujawnia, jak Ola łączy wyniki, posiłki, preferencje i czas. Konkret zastępuje sztuczną zapowiedź „sekretnej metody”.                                                                                      |

W porównaniu z poprzednią stroną ogólne „Teraz czas na Twoją zmianę” zastępuje
czytelne zaproszenie do konsultacji, a deklarację „schudnąć i uregulować hormony”
zastępuje opis pracy i ustalania priorytetów. Osobista strona nadal mówi o Oli,
ale każdy fragment pokazuje, co to oznacza dla osoby rozważającej rozmowę.

## 6. Mapowanie do Sanity i połączenia stron

Sprawdzono istniejący [model strony](../studio/schema-types/documents/page.ts),
[sekcje](../studio/schema-types/blocks/page-sections.ts) i
[autorów](../studio/schema-types/documents/author.ts).
Poniżej plan, bez zmian schematów i Content Lake.

| Element                     | Istniejące pola                                                                 | Luka lub plan rozszerzenia                                                                                                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strona                      | `page.language`, `slug.current`, `title`, `sections`, `seo`                     | Propozycja: PL, slug `o-mnie`, tytuł administracyjny „O mnie”. Nie tworzyć drugiej homepage.                                                                                                                                                |
| Hero                        | `heroSection.variant = split`, `title`, `lead`, `primary`, `secondary`, `media` | Wymagany `eyebrow` nie odpowiada 3a; trzeba dopuścić brak nadtytułu także w typach i mapperze.                                                                                                                                              |
| Wskaźnik w historii         | `metricsSection.items[].value/suffix/label`                                     | Obecnie minimum dwie liczby. Zaplanować kontrolowany wariant pojedynczego wskaźnika i wspólne źródło z homepage, bez drugiej statystyki i bez upychania liczby w leadzie.                                                                   |
| Osobisty kontekst           | `textSection.title`, `body`                                                     | Kontrolowany wariant kompozycji tekstowej; wyróżnienie może być zwykłym akapitem. Nie zapisywać go jako autentycznego cytatu w `quoteSection`.                                                                                              |
| Podejście                   | `cardsSection.title/lead`, `items[].title/body`                                 | Wariant trzech paneli jak w 3a; obecne karty wymagają także `href` i `media`, których panele podejścia nie potrzebują. Rozszerzyć kontrolowany wariant o karty tekstowe, zamiast dodawać pozorne linki i obrazy.                            |
| Opinie                      | `testimonialsSection.items` → `testimonial`                                     | Dwie referencje do wspólnych opinii, kontrolowany wariant statyczny. Jak na homepage: obsłużyć anonimowy podpis zamiast wymaganego fikcyjnego imienia/roli.                                                                                 |
| Panel konsultacji           | `textImageSection.title/body/media`, `service.title/summary/slug`               | Dodać CTA i referencję usługi do kontrolowanego wariantu. `service` nie ma ceny, waluty, czasu i URL rezerwacji; proponowane `price = 450`, `currency = PLN`, `durationMinutes = 60`, `bookingUrl`. Wspólne źródło dla homepage i „O mnie”. |
| Newsletter                  | `formSection` → `form`                                                          | Te same luki co homepage: nadtytuł wymagany, docelowo e-mail i zgoda; formularz demonstracyjny nie oznacza integracji.                                                                                                                      |
| Bio współdzielone z blogiem | `author.name/role/bio/photo`                                                    | Krótkie bio, rola i portret mogą być wspólne. Dłuższa historia pozostaje w sekcjach strony; nie mieścić całej strony w `author.bio` z limitem 400 znaków.                                                                                   |

Wykształcenie: proponowane wspólne `author.education` z `institution` i `program`,
oraz osadzona sekcja `credentialsSection` z referencją autora i opcjonalnym
`diplomaScan` typu `mediaObject`. To **nowe pola/typ sekcji do wdrożenia**.
Obecny `author` nie ma tych pól; `mediaObject` obsługuje obraz, nie plik PDF.
Jeśli dostarczony będzie PDF, dodać osobne opcjonalne pole pliku i podgląd obrazu.
Każde rozszerzenie ma otrzymać walidację, HTML, Markdown i przykład.
W CMS pozostawić pole skanu do uzupełnienia; nie tworzyć fikcyjnego assetu.

## 7. Połączenia i stan wykonania

- Homepage 3a „Poznaj moją historię” → [nowa podstrona](../mockups/homepage/about-3a.html).
- Biogram w artykule 3a „Poznaj mnie bliżej” → nowa podstrona.
- [Indeks porównania](../mockups/homepage/index.html) zawiera wejście do „O mnie”.
- Wordmark, E-booki i Konsultacje w navbarze prowadzą do homepage i jego sekcji.
- „O mnie” ma `aria-current="page"`; Newsletter prowadzi do lokalnej sekcji.
- Profile i kontakt nadal wymagają potwierdzonych adresów; nie dodano ich do `sameAs`.

JSON-LD: `ProfilePage` → `Person`, imię i nazwisko, rola, opis i `alumniOf`
zgodne z widocznym tekstem. Bez fikcyjnego stopnia, certyfikatów, profili,
ratingów, obrazów dokumentu i danych rezerwacji. Mockup ma `noindex,nofollow`.

- [x] Przejrzeć źródła i zapisać plan, copy oraz decyzje użytkownika.
- [x] Uwzględnić korektę CTA, E-E-A-T i granice treści zdrowotnych.
- [x] Wykonać mockup i podłączyć homepage, biogram artykułu oraz indeks.
- [x] Sprawdzić responsywność, klawiaturę, CSS zoom 200%, reduced motion,
      brak JS i dane profilu w Chromium, Firefox i WebKit; axe w obu motywach.
- [ ] Uzupełnić rzeczywisty skan dyplomu, kontakt/profile i link płatnego wydarzenia.
- [ ] Przenieść zaakceptowany wygląd do Astro/Sanity wraz z HTML, Markdown i TypeGen.

Wyniki kontroli: [PROGRESS.md](PROGRESS.md). Publikacja wymaga osobnego zlecenia.

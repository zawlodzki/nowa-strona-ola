# Homepage 3a — konfiguracja treści CMS

Aktualizacja: 2026-10-08. Status: specyfikacja do konfiguracji Sanity,
nie wykonana migracja. Obowiązuje dla polskiej strony głównej.

## Źródła i sposób aktualizacji

Decyzja użytkownika z 08.10.2026 po audycie Sanity: ujednolicić kolekcje.
Blog, tak jak E-booki, ma być dokumentem `page` w **Strony** (PL/EN),
z sekcją `blogCollectionSection`, opcjonalnym `formSection` i własnym `seo`.
Artykuły i kategorie pozostają osobnymi dokumentami. `siteSettings` przechowuje
ustawienia wspólne; dawny `blogIndex` pozostaje tylko do odczytu na czas migracji.
Oferta `service` nadal współdzieli cenę, czas i rezerwację konsultacji między
homepage, O mnie i konsultacjami; etykieta panelu: **Oferta konsultacji**.
To wykonana zmiana kodu, nie deklaracja zapisu danych ani wdrożenia Studio.
Ścieżka edycji i migracji: [Blog — publikacja](BLOG-PUBLISHING.md).

Najnowsza bezpośrednia decyzja użytkownika ma pierwszeństwo przed wcześniejszą
propozycją, dokumentami FIRMA i demonstracyjnymi danymi CMS. Aktualny układ
oraz copy: [mockup 3a](../mockups/homepage/cherry-white.html).
Historia analizy: [copy i decyzje](HOMEPAGE-COPY-3A.md).
Stan implementacji: [postęp](PROGRESS.md).

Przy każdej decyzji dotyczącej treści, ceny, oferty, kolejności, widoczności,
CTA lub wariantu sekcji aktualizować ten dokument w tej samej sesji.
Podać wynikową wartość, miejsce docelowe, datę i źródło oraz status:
ustalone / do decyzji / wymaga implementacji. Zastępować bieżącą wartość,
a historię zmian zachować w PROGRESS.md. Nie zamieniać propozycji w decyzję
ani dokumentacji w deklarację wykonania. Nie kopiować sekretów i danych zgłoszeń.

## Decyzje ustalone przez użytkownika

| Obszar                  | Wartość obowiązująca                                                                                                                               | Źródło / status                                                                                                                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Wygląd                  | Docelowy 3a: białe tło, wiśniowa paleta, Switzer, wordmark i osiem opracowanych podstron                                                           | Decyzja użytkownika 07.10.2026 o realizacji strony 3a; pozostałe warianty porzucone, Wonderful zarchiwizowany. Biblioteka wykonana, migracja stron/CMS otwarta.                                                                                  |
| Usługa                  | Pojedyncze konsultacje dietetyczne online                                                                                                          | Bezpośrednia decyzja 06.10.2026; nie przenosić mentoringu ani dawnych pakietów                                                                                                                                                                   |
| Cena i czas konsultacji | 450 zł za 60 minut, waluta PLN                                                                                                                     | Bezpośrednia decyzja użytkownika 06.10.2026; konfiguracja płatnej rezerwacji niewykonana.                                                                                                                                                        |
| Rezerwacja konsultacji  | CTA do kalendarza wyboru terminu i płatności; proponowana etykieta „Zarezerwuj konsultację”                                                        | Cel ustalony 06.10.2026; tymczasowo `https://cal.com` na polecenie użytkownika, właściwy link wydarzenia później.                                                                                                                                |
| Wykształcenie Oli       | Ukończona dietetyka kliniczna na Śląskim Uniwersytecie Medycznym                                                                                   | Bezpośrednie potwierdzenie użytkownika 06.10.2026.                                                                                                                                                                                               |
| Dyplom                  | Zdjęcie ukończenia w slocie „O mnie”: klucz `diploma`, alt PL „Aleksandra Olesiewicz z dyplomem przed Wydziałem Zdrowia Publicznego ŚUM w Bytomiu” | Zlecenie 08.10.2026. Fixture i renderer wykonane. Asset w Content Lake niewgrany. Puste `diplomaScan` zostawia ramkę.                                                                                                                            |
| Cena e-booków           | Każdy z sześciu: 97 zł brutto, waluta PLN                                                                                                          | Bezpośrednia decyzja 06.10.2026; nie oznacza gotowego sklepu                                                                                                                                                                                     |
| Wskaźnik                | Wartość 450, przyrostek +, opis „kobiet rocznie, którym pomagają moje konsultacje”                                                                 | Bezpośrednia informacja 06.10.2026; nie zmieniać na sumę historyczną                                                                                                                                                                             |
| Opinie                  | Sześć pełnych cytatów z `/Users/grzesiek/Github/ola-homepage/data/testimonials.js`                                                                 | Prawdziwość potwierdzona przez użytkownika 06.10.2026                                                                                                                                                                                            |
| Podpis opinii           | „Opinia o dotychczasowej współpracy”; bez imion                                                                                                    | Obecna implementacja; nie przypisywać wyników do jednej konsultacji                                                                                                                                                                              |
| Marki                   | Belka widoczna: ALAB laboratoria, UNS, NORSAN, Norsa Pharma, OMNi-BiOTiC                                                                           | Przywrócenie na polecenie użytkownika 06.10.2026                                                                                                                                                                                                 |
| Social media            | Instagram, Facebook, TikTok; kanoniczne URL profili                                                                                                | Decyzja użytkownika 08.10.2026: `https://www.instagram.com/aleksandra_olesiewicz`, `https://www.facebook.com/dietetykolesiewicz/`, `https://www.tiktok.com/@aleksandra_olesiewicz`. Ustalenie 06.10.2026 (widoczność trzech platform) pozostaje. |
| Copy                    | Nowe copy 3a zachowane                                                                                                                             | Zlecona aktualizacja; bieżąca treść poniżej                                                                                                                                                                                                      |

Specjalizacja w copy: PCOS i insulinooporność. Perimenopauza jest tematem
materiałów; nie dopisywać doświadczenia klinicznego ani kwalifikacji ponad
podany kontekst. E-booki nadal oznaczone jako zapowiedzi. To stan makiety,
nie potwierdzenie ukończenia produktu lub uruchomienia sprzedaży.

## Dokument strony, ustawienia i kolejność

Istniejący model strony: `page`, `language = pl`, `slug.current = home`.
Daje publiczny adres `/`. Nie tworzyć drugiej polskiej strony głównej.
EN wymaga osobnego dokumentu i rzeczywistego tłumaczenia; brak fallbacku PL.

Kolejność: **hero → marki → podejście z liczbą → O mnie → e-booki →
konsultacje → opinie → newsletter**. Nawigacja i stopka należą do ustawień
wspólnych. Sekcji podejścia nie rozbijać wizualnie na odległe bloki tylko po to,
by dopasować ją do obecnego schematu.

`siteSettings.siteTitle`: Aleksandra Olesiewicz.
`siteSettings.footerNote`: PCOS, insulinooporność i odżywianie dopasowane do życia.
Globalna nawigacja: E-booki → kolekcja, Konsultacje → landing usługi,
O mnie → profil, Blog → indeks; CTA Newsletter → `#newsletter` na homepage
lub adres homepage z tą kotwicą na stronach bez formularza. To ustalenie
z 07.10.2026 po ujednoliceniu mockupów, zastępujące wcześniejsze menu kotwicowe.
Docelowe URL generować z rzeczywistych slugów i języka; landingi mają osobne
menu lokalnych sekcji. Kotwice muszą istnieć w rendererze.
Stan kodu 07.10.2026 (pakiet 5): fixture’y mają Konsultacje → `/konsultacje/`
(EN `/en/consultations/`), O mnie → `/o-mnie/` (EN `/en/about/`),
E-booki → `/ebooki/` (EN `/en/ebooks/`), Blog → `/blog/`.
`siteSettings` w Content Lake nie zmieniono.
Profile w `siteSettings.socialLinks`: nazwy ustalone (Instagram, Facebook,
TikTok). Kanoniczne HTTPS URL od 08.10.2026 (decyzja użytkownika) żyją w
`src/content/social-profiles.ts` — fixture, fallback, import homepage i JSON-LD
`sameAs` osoby biorą stąd te same trzy adresy:
`https://www.instagram.com/aleksandra_olesiewicz`,
`https://www.facebook.com/dietetykolesiewicz/`,
`https://www.tiktok.com/@aleksandra_olesiewicz`. Widoczna etykieta w stopce
zostaje „Instagram” / „Facebook” / „TikTok”. Content Lake nie zapisano;
schemat `socialLinks` bez zmiany.
`podglad.html?...` nie jest adresem profilu ani produktu do CMS.
Linki prawne w `siteSettings.legalLinks`: fixture PL `/polityka-prywatnosci/`
i `/regulamin/`, EN `/en/privacy/` i `/en/terms/` — bez zmiany makiety stopki
(08.10.2026). Same dokumenty są typem `legalPage` (nie `page`); opis:
[LEGAL-CMS-CONFIG.md](LEGAL-CMS-CONFIG.md). Fixture’y i trasy są w kodzie;
Content Lake niezasiedlony. Lista cookies i regulamin newslettera nie są w
stopce; cookies z polityki, newsletter z etykiety zgody formularza.
Zgoda newslettera (fixture `form`, 08.10.2026): markdown
`[Polityka prywatności](/polityka-prywatnosci/)` i
`[regulamin newslettera](/regulamin-newslettera/)` w etykiecie checkboxa.
EN: `[Privacy policy](/en/privacy/)` i `[newsletter terms](/regulamin-newslettera/)`
(brak EN regulaminu newslettera — otwarta decyzja). Wygląd formularza bez zmian
poza tymi odnośnikami.

Tytuł i opis SEO w makiecie zawierają oznaczenie 3a i dłuższe teksty.
Nie kopiować ich automatycznie do produkcji: `seo.title` ma limit 60 znaków,
`seo.description` 160. Finalne metadata trzeba zatwierdzić w tych limitach.
Noindex i przełącznik kierunków są elementami mockupu, nie treścią homepage w CMS.

## Mapowanie do obecnego Sanity i brakujące możliwości

Sprawdzone lokalnie w [schematach sekcji](../studio/schema-types/blocks/page-sections.ts),
[ustawieniach](../studio/schema-types/documents/site-settings.ts),
[opiniach](../studio/schema-types/documents/testimonial.ts),
[usłudze](../studio/schema-types/documents/service.ts),
[GROQ](../src/sanity/queries.ts) i [mapowaniu treści](../src/content/map-sections.ts).
Poniższa tabela rozróżnia istniejące pola od wymagań do wdrożenia.

| Miejsce 3a       | Istniejący model / pola                                                              | Co wymaga pracy przed odwzorowaniem 3a                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero             | `heroSection`: `title`, `lead`, `primary`, `secondary`, `media`, wariant `split`     | `eyebrow` jest wymagany także w mapperze, a 3a nie ma nadtytułu. Nie dodawać sztucznego tekstu; dostosować schema/typy/renderer.                                                         |
| Marki            | `logosSection.names`                                                                 | Teraz tylko nazwy, bez grafik. Dodać media i kontrolowany wariant belki. Nie wymyślać leadu, który obecnie jest wymagany.                                                                |
| Podejście + 450+ | `metricsSection.items[].value/suffix/label`; `cardsSection`                          | Liczby wymagają min. 2 pozycji, obecna kompozycja jednej liczby z trzema opisami nie istnieje. Rozszerzyć kontrolowany wariant lub dedykowany typ, bez drugiej fikcyjnej statystyki.     |
| O mnie           | `textImageSection`: `title`, `body`, `media`, `mediaPosition`                        | Brak osobnego wyróżnionego leadu i CTA oraz drugiego zdjęcia posiłku. Zaplanować wariant zachowujący układ 3a.                                                                           |
| E-booki          | `cardsSection` ma tytuł, opis, adres i medium karty                                  | Nie ma dokumentu produktu, ceny, kategorii ani grupowanej karuzeli. Dodać model produktu i sekcję z referencjami.                                                                        |
| Konsultacje      | `service` ma `title`, `summary`, `slug`; `textImageSection` częściowo opisuje wygląd | Brak pełnego wariantu z faktami i CTA do konsultacji oraz pól `service.price`, `currency`, `durationMinutes` i `bookingUrl`. Nie wkładać treści poza limit `service.summary` 240 znaków. |
| Opinie           | `testimonialsSection.items` referencje do `testimonial`                              | Cytaty mieszczą się w limicie 320; model i mapper wymagają `name` oraz `role`. Obsłużyć anonimowy podpis, bez fikcyjnego imienia. Obecny renderer nie odpowiada karuzeli 3a.             |
| Newsletter       | `formSection` + referencja `form`                                                    | Nadtytuł wymagany; 3a nie ma nadtytułu. Docelowo formularz tylko z e-mailem i zgodą: sprawdzić mapper, który obecnie oczekuje także pola imienia. Integracja pozostaje etapem 6.         |
| Kotwice          | `PageSections.astro` generuje identyfikatory sekcji                                  | Dopasować kontrolowane identyfikatory do nawigacji 3a; nie wstawiać niedziałających kotwic.                                                                                              |

Przy zmianie typu sekcji obowiązuje schema + renderer HTML + serializer
Markdown + przykład, spójne GROQ/TypeGen/TypeScript i blokada nieznanego typu.
Paleta, typografia, spacing oraz ruch pozostają w kontrolowanym wariancie kodu,
bez dowolnego CSS lub tokenów zapisanych przez redaktora.

## E-booki — wartości do przyszłego modelu produktu

Nazwy pól niżej są propozycją przyszłego modelu, **nie istniejącymi polami Sanity**.
W każdym produkcie: tytuł, język PL, temat (`pcos` / `perimenopause`), opis karty,
okładka, tekst alternatywny, status dostępności, docelowy adres i cena brutto.
Cena jako wartość liczbowa 97, waluta PLN i jawne oznaczenie brutto.
Nie wyliczać VAT ani ceny netto bez osobnej konfiguracji. Format „97 zł brutto”
generować z danych; nie powielać ceny w HTML, okładce i ręcznie wpisanym opisie.

| Kolejność | Tytuł                         | Temat         | Cena         | Ton okładki (makieta 3a) |
| --------- | ----------------------------- | ------------- | ------------ | ------------------------ |
| 1         | Suplementy w PCOS             | PCOS          | 97 zł brutto | jasny                    |
| 2         | Badania, które mają sens      | PCOS          | 97 zł brutto | wiśniowy                 |
| 3         | Szczupła, a jednak PCOS       | PCOS          | 97 zł brutto | jasny                    |
| 4         | Waga Cię okłamuje             | Perimenopauza | 97 zł brutto | jasny                    |
| 5         | Czy to już?                   | Perimenopauza | 97 zł brutto | wiśniowy                 |
| 6         | Noc zaczyna się o osiemnastej | Perimenopauza | 97 zł brutto | jasny                    |

Tony 4–6 poprawiono 07.10.2026 do 1:1 z makietą (`cover-4` i `cover-6` jasne,
`cover-5` ciemny). Fixture i seed są źródłem homepage, kolekcji i landingów.

Homepage ma referencje do produktów w tej kolejności, a nie sześć kopii cen
i opisów w osadzonych kartach. Wybranie grupy przewija do pierwszego produktu
tej grupy; zachować kotwice, klawiaturę i widoczność treści bez JS.
CTA makiety: „Poznaj temat”. Docelowe linki i zakup pozostają do decyzji.

## Bieżąca treść sekcji do przeniesienia

Poniższy zapis pochodzi z aktualnego HTML 3a. Decyzja o konsultacji 450 zł /
60 minut i CTA rezerwacji jest nowsza od tego HTML i czeka na przeniesienie
do mockupu; bieżące wartości obowiązują z tabeli decyzji powyżej. Zachowuje słowa, kolejność
akapitów i pełne opinie; łamanie nagłówków dopasowuje renderer.
Nie zapisywać znaczników `<br>` jako tekstu redaktora.
CTA oraz media opisano osobno pod zestawieniem.

### start

**Zrozum swoje ciało. Zacznij od odżywiania.**

Jestem Ola, dietetyczka kliniczna. Specjalizuję się w PCOS i insulinooporności. Pomagam uporządkować odżywianie i wybrać kolejne kroki dopasowane do Twojego życia. Przygotowuję też e-booki o PCOS i perimenopauzie.

### marki

Współpracuję z markami, które znasz

### dlaczego-ja

Wartość wskaźnika: **450+**.

**Wiesz, od czego zacząć. Rozumiesz, po co to robisz.**

Po diagnozie łatwo pogubić się w radach o diecie, badaniach i suplementach. Pomogę Ci uporządkować informacje i przełożyć je na codzienne decyzje.

kobiet rocznie, którym pomagają moje konsultacje

**Twoja sytuacja jest punktem wyjścia.**

Przyglądam się Twoim wynikom badań, sposobowi odżywiania i codziennym nawykom.

**Zmieniamy to, co jesz na co dzień.**

Szukamy rozwiązań, które uwzględniają Twoje ulubione posiłki, czas i możliwości.

**Rozumiesz kolejne kroki.**

Wyjaśniam zalecenia, żebyś wiedziała, co robisz i dlaczego.

### o-mnie

**Jestem Ola.**

Znam PCOS także z własnego doświadczenia.

Jestem dietetyczką kliniczną i sama mam doświadczenie z PCOS. Wiem, jak trudno odnaleźć się w sprzecznych radach i kolejnych próbach zmiany odżywiania.

W pracy z kobietami z PCOS i insulinoopornością łączę analizę wyników badań z praktycznymi zmianami w posiłkach. Zależy mi, żebyś rozumiała zalecenia i potrafiła korzystać z nich w swojej codzienności.

### ebooki

**E-booki o PCOS i perimenopauzie.**

Badania, suplementy, codzienne posiłki i obserwacja samopoczucia. Wybierz temat, w którym potrzebujesz więcej jasności.

**Suplementy w PCOS**

Uporządkuj pytania o suplementy: po co je stosować i co omówić ze specjalistą przed zakupem.

**Badania, które mają sens**

Przygotuj pytania na wizytę i uporządkuj dotychczasowe wyniki badań.

**Szczupła, a jednak PCOS**

Jak podejść do odżywiania przy PCOS, kiedy Twoim celem nie jest odchudzanie.

**Waga Cię okłamuje**

Przyjrzyj się zmianom w sylwetce i codziennych nawykach w okresie perimenopauzy.

**Czy to już?**

Dziennik cyklu i samopoczucia, który pomoże Ci przygotować się do rozmowy z lekarzem.

Od kolacji do snu

**Noc zaczyna się o osiemnastej**

Uporządkuj wieczorne posiłki i nawyki. Sprawdź, co warto obserwować przed rozmową o problemach ze snem.

Zapowiedzi e-booków. Tytuły i okładki są propozycją; materiały są w przygotowaniu.

1–3 z 6

### konsultacje

**Konsultacje dietetyczne online.**

Podczas pojedynczej konsultacji przyjrzymy się Twoim wynikom badań, sposobowi odżywiania i temu, z czym trudno Ci sobie poradzić na co dzień. Ustalimy priorytety i zmiany, od których możesz zacząć.

### opinie

**O współpracy ze mną.**

Doświadczenia moich podopiecznych

> Ola, muszę się pochwalić choć dopiero co zaczęłyśmy! 😀 Na wadze dopiero -3kg, ale już się zadział mały cud. Z twarzy zaczęły znikać mi pryszcze, nie mam już tak wielkiej ochoty na słodycze!! Nawet nie wiesz jak się cieszę ❤️ a to dopiero początek naszej współpracy

Opinia o dotychczasowej współpracy

> Dzięki współpracy z Olą schudłam 8 kg w 3 miesiące bez wyrzeczeń. Hormony się ustabilizowały, energii mam więcej niż kiedykolwiek!

Opinia o dotychczasowej współpracy

> Najlepsza decyzja jaką podjęłam! Aplikacja jest super intuicyjna, a Ola zawsze dostępna gdy potrzebuję pomocy. Polecam z całego serca!

Opinia o dotychczasowej współpracy

> Po latach walki z PCOS w końcu znalazłam kogoś, kto rozumie moje problemy. Dieta jest dopasowana do mnie, a nie ja do diety!

Opinia o dotychczasowej współpracy

> Miałam problem z insulinoopornością i nie widziałam efektów mimo wielu diet. Z Olą w 2 miesiące schudłam 5 kg i wyniki badań się poprawiły!

Opinia o dotychczasowej współpracy

> Nie wierzyłam, że dieta może być elastyczna i smaczna jednocześnie. Ola udowodniła mi, że to możliwe. Gotuje dla całej rodziny z tych samych przepisów!

Opinia o dotychczasowej współpracy

### newsletter

**Mniej sprzecznych rad.**
**Więcej konkretów.**

Etykieta pola: Twój adres e-mail. Placeholder: `np. ola@przyklad.pl`.
Przycisk „Chcę otrzymywać newsletter” ze strzałką, potem checkbox zgody.
Układ wspólny 3a (07.10.2026, wyrównanie do makiety).

Piszę o PCOS, insulinooporności i codziennym odżywianiu. Dzielę się wskazówkami do wykorzystania przy zwykłym posiłku i informuję o nowych materiałach, także o perimenopauzie.

Wpisz poprawny adres e-mail.

Zaznacz zgodę, aby sprawdzić formularz.

Makieta formularza. Dane nie są zapisywane ani wysyłane.

## CTA i media

| Miejsce      | Etykieta                   | Adres docelowy / status                                                                                                                                                        |
| ------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero: główne | Poznaj e-booki             | `#ebooki`                                                                                                                                                                      |
| Hero: drugie | Poznaj konsultacje         | Fixture i kod: `/konsultacje/` (EN `/en/consultations/`), pakiet 3 07.10.2026. Dokument `page` w Content Lake nieutworzony.                                                    |
| O mnie       | Poznaj moją historię       | Fixture i kod: `/o-mnie/` (EN `/en/about/`). Dokument `page` w Content Lake nieutworzony.                                                                                      |
| E-booki      | Poznaj temat               | Podstrona danego produktu; docelowe slugi do ustalenia                                                                                                                         |
| Konsultacja  | Zarezerwuj konsultację     | Kalendarz rezerwacji płatnej konsultacji: 450 zł / 60 minut; tymczasowo `https://cal.com`, właściwy URL wydarzenia później. Decyzja 06.10.2026, HTML jeszcze bez aktualizacji. |
| Newsletter   | Chcę otrzymywać newsletter | Zapis po faktycznym przyjęciu przez backend; w makiecie tylko demonstracja                                                                                                     |

Media do zaimportowania z zaakceptowanych lokalnych plików:
[Hero](../src/assets/portraits/hero.webp),
[O mnie](../src/assets/portraits/about.webp),
[Konsultacje](../src/assets/portraits/contact.webp),
[Posiłek](../src/assets/editorial/food-editorial.webp)
(ten sam plik co [makieta](../mockups/homepage/assets/food-editorial.webp)).
Logotypy i ich źródła: [README makiet](../mockups/homepage/README.md#materiały).
Produkcja (07.10.2026): te pliki są fallbackiem i seedem kluczy `hero|about|contact|food`
oraz logotypów, gdy `mediaObject.image` w CMS jest puste. Renderer idzie przez
pipeline Astro (`SiteImage`), nie przez surowy `?url`. Skan dyplomu nadal nie jest
w repo — kadr na „O mnie” zostaje miejscem do uzupełnienia, bez fikcyjnego dokumentu.
Okładki e-booków są dziś kompozycją HTML/CSS; nie istnieją jako sześć gotowych
plików obrazu. Zaplanować eksport zaakceptowanych okładek albo kontrolowany
renderer, bez fikcyjnych ścieżek do obrazów w CMS.

## Konfiguracja i kryteria przeniesienia — jeszcze niewykonane

- [x] Dostosować modele i kontrolowane warianty do luk opisanych wyżej.
- [ ] Uzupełnić docelowe HTTPS profile, slugi, kontakt, URL płatnego kalendarza i dodatkowy zakres konsultacji; cena 450 zł / 60 minut ustalona.
- [ ] Ustalić gotowość e-booków i rzeczywiste miejsca zakupu.
- [ ] Przygotować krótkie metadata produkcyjne i docelowe teksty formularza/zgód.
- [ ] Zaimportować media i utworzyć sześć produktów oraz sześć opinii jako referencje.
- [ ] Uzupełnić szkic `page` PL z sekcjami i `siteSettings` w ustalonej kolejności.
- [ ] Sprawdzić podgląd, cytaty, ceny, wskaźnik i zgodność HTML/Markdown.
- [ ] Zweryfikować desktop/mobile, 320 px, zoom, klawiaturę i reduced motion.
- [ ] Publikować dopiero na zlecenie; zapisana konfiguracja nie oznacza publikacji.

Schematy, GROQ i fixture homepage 3a wdrożono w pakiecie 1 (07.10.2026).
`npm run import:homepage` przygotowuje dry-run bez zapisu. Content Lake,
szkice Sanity i publikacja pozostają niewykonane.

## Landing e-booka i kolekcja — decyzja 2026-10-06

Bezpośrednie zlecenie użytkownika: kolejny lokalny mockup w palecie 3a,
e-book o suplementach w PCOS oraz **osobna kolekcja e-booków w CMS**.
Cena zachowana: 97 PLN brutto (wcześniejsza decyzja). Navbar, hero, problem,
dla kogo, zawartość, efekty, cena, opinie, FAQ i footer wymagane; dodano podgląd
karty i autorkę jako propozycję wizualną. Copy i zakres z researchu są propozycją,
nie akceptacją finalnego produktu. Opinie współpracy nie stają się opiniami ebooka.

Mapowanie: `ebook` jako dokument produktu, homepage `items[]` → `ebook`, blog
`relatedEbooks[]` → `ebook`, treść landingu w `ebook.landing`; adres generowany ze
sluga (`ebookPath`), cena i status z produktu. **Pakiet 4 (07.10.2026, kod
i fixture):** landing `Ebook3a`, wariant `cherry3a`, karty homepage →
`/ebooki/<slug>/` i `/en/ebooks/<slug>/`. Status `planned`, 97 PLN brutto.
**Niewykonane:** kolekcja (pakiet 5), Content Lake, checkout, płatny plik.
**Wykonane wcześniej:** [mockup](../mockups/homepage/ebook-3a.html) oraz
[instrukcja wdrożenia](EBOOK-CMS-CONFIG-3A.md). Bez konfiguracji Content Lake,
checkoutu i zmiany dostępności. Brak uruchomionej sprzedaży.

## Podstrona „O mnie” — mockup 2026-10-07

**Ustalone przez użytkownika:** zaplanować mockup podstrony „O mnie” zgodny
z designem 3a, wykorzystując materiały FIRMA, poprzednią stronę `ola-homepage`
i techniki z „10000000 Sales Copy Advice”. Źródło: bezpośrednie zlecenie
06.10.2026. Korekta 07.10.2026: „O mnie” nie ma kierować wyłącznie do konsultacji;
uwzględnić E-E-A-T i wykonać mockup. **Wykonane:** [mockup](../mockups/homepage/about-3a.html),
[opis aktualnego układu i copy](ABOUT-MOCKUP-PLAN-3A.md),
[ocena E-E-A-T](ABOUT-EEAT-3A.md), szablon About3a, trasy `/o-mnie/` i `/en/about/`,
wejścia z homepage. **Niewykonane:** dokumenty w Content Lake i publikacja.

| Obszar                  | Bieżąca wartość / mapowanie                                                                                                          | Status i źródło                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Wygląd podstrony        | 3a: białe tło, wiśniowa paleta, Switzer, istniejące portrety                                                                         | Ustalone w zleceniu 06.10.2026.                                                                               |
| Adres                   | Fixture i trasy Astro: `page.language = pl`, `slug.current = o-mnie` → `/o-mnie/`; EN `about` → `/en/about/`                         | Kod 07.10.2026 (pakiet 2). Dokument w Content Lake nieutworzony; bez publikacji.                              |
| Kolejność               | Hero → osobisty kontekst z 450+ → wykształcenie i dyplom → podejście → dwie opinie → materiały → konsultacja → newsletter            | Wykonane w lokalnym mockupie 07.10.2026; bez konfiguracji CMS.                                                |
| H1                      | „Jestem Ola. Znam PCOS od środka.” → `heroSection.title`                                                                             | Propozycja redakcyjna wykonana lokalnie; bez akceptacji finalnego copy i konfiguracji CMS.                    |
| Specjalizacja           | Dietetyczka kliniczna; PCOS i insulinooporność                                                                                       | Istniejący kontekst marki i zatwierdzone copy homepage.                                                       |
| Wskaźnik                | 450, przyrostek +, „kobiet rocznie, którym pomagają moje konsultacje”; pod osobistym kontekstem                                      | Wartość ustalona wcześniej, umieszczenie wykonane w mockupie 07.10.2026.                                      |
| CTA główne w hero       | „Zobacz, jak pracuję” → `#jak-pracuje`                                                                                               | Korekta zakresu użytkownika 07.10.2026; konkretna etykieta wykonana jako propozycja w mockupie.               |
| CTA pomocnicze w hero   | „Poznaj moje materiały” → `#materialy`                                                                                               | Wykonane lokalnie 07.10.2026; dodatkowe wejścia do e-booków i bloga.                                          |
| CTA konsultacji         | „Zarezerwuj konsultację” → `https://cal.com`; 450 zł / 60 minut                                                                      | Wcześniejsze decyzje o cenie i rezerwacji zachowane; tylko blok konsultacji ma ten cel.                       |
| Opinie                  | Dwa pełne cytaty: o zrozumieniu PCOS oraz gotowaniu dla rodziny; referencje `testimonialsSection.items`                              | Prawdziwość zestawu ustalona wcześniej; dobór dwóch i wariant statyczny są propozycją. Pełne teksty w planie. |
| Portrety                | `about.webp` w hero, `contact.webp` w panelu konsultacji                                                                             | `about.webp`: rzeczywiste zdjęcie z Instagrama wybrane 09.10.2026; `contact.webp`: zaakceptowany portret AI.  |
| Historia i kwalifikacje | Własne doświadczenie PCOS oraz ukończona dietetyka kliniczna na Śląskim Uniwersytecie Medycznym; zdjęcie ukończenia w slocie dyplomu | Uczelnia i kierunek 06.10.2026. Zdjęcie 08.10.2026. Stopień, daty i certyfikaty nie są podane.                |
| Newsletter              | Tekst, formularz i status demonstracji jak w homepage 3a                                                                             | Propozycja ponownego użycia, bez zmiany zgód i bez integracji.                                                |

Luki danych, nie schematu: asset dyplomu w Content Lake (fixture ma klucz
`diploma`), URL płatnej rezerwacji, strona kontaktu. W kodzie Studio są już
`author.educationInstitution`/`educationProgram`/`diplomaScan` oraz sekcja
`credentialsSection` z referencją autora; to nie jest konfiguracja Content Lake.
Obraz korzysta z `mediaObject`. Osobny PDF nie wchodzi do modelu. Puste
`diplomaScan` zostawia ramkę.
`author` przechowuje wspólne bio, rolę i portret; długa historia należy
do `page.sections`. Biogram ramki artykułu (makieta article-3a, decyzja
08.10.2026) to pełny akapit o specjalizacji, kolejnych krokach i własnym
doświadczeniu PCOS — w limicie 400 znaków pola `author.bio`. Nie skracać
do samego zdania o roli.

Homepage 3a CTA „Poznaj moją historię” oraz nawigacja „O mnie” prowadzą w
fixture’ach do `/o-mnie/` (EN `/en/about/`). Mockup `about-3a.html` pozostaje
referencją wyglądu, nie publiczną trasą. Nowa propozycja nie zastępuje
zaakceptowanego copy homepage, ceny e-booków, liczby ani sześciu opinii.
Decyzja użytkownika o cenie konsultacji, czasie i płatnej rezerwacji uzupełnia
wcześniejszą konfigurację usługi; nowa uczelnia uzupełnia bio. Szablon
`About3a` i schemat (`credentialsSection`, `author.diplomaScan`) są w kodzie;
konfiguracja Content Lake i publikacja pozostają bez zmian.

### Rezerwacja i kwalifikacje — uzupełnienie 06.10.2026

Cena konsultacji to **450 zł za godzinę (60 minut)**. Kwota jest zapisana jako
450 i waluta PLN; użytkownik nie określił rozliczenia podatkowego, więc nie
przenosić automatycznie oznaczenia brutto z e-booków. Cena i czas obok CTA,
na homepage i „O mnie”, mają pochodzić ze wspólnej usługi.
CTA prowadzi do kalendarza umożliwiającego rezerwację i płatność za tę usługę.
Użytkownik wskazał tymczasowo `https://cal.com`, a właściwy URL wydarzenia
uzupełni później. Link główny Cal.com jest celem makiety, nie konfiguracją
konkretnej płatnej usługi. Nie podano operatora płatności; historyczny Cal.com
`dietetyk/bezplatna-konsultacja` ze starego repo opisuje darmowe wydarzenie
i nie jest właściwym celem. Podłączenie rzeczywistej rezerwacji wymaga URL wydarzenia, a dostępność terminów
wynika z faktycznej konfiguracji kalendarza.

Wykształcenie wyróżnić już w leadzie „O mnie” i w osobnej sekcji z miejscem
na skan. Copy: „Ukończyłam dietetykę kliniczną na Śląskim Uniwersytecie Medycznym”.
Ramka w mockupie: „Miejsce na skan dyplomu”. Po dodaniu dokumentu miniatura
oraz link „Zobacz dyplom”; bez pliku brak pozornego podglądu. Ukończenie kierunku
potwierdził użytkownik; nie dopisujemy stopnia akademickiego ani roku ukończenia.

### E-E-A-T i połączenia — 07.10.2026

Wykonano pełną tożsamość i rolę w hero, własne doświadczenie PCOS, ukończony
kierunek/uczelnię, jawny placeholder skanu, sposób pracy i dwa pełne cytaty.
Dodano granice konsultacji dietetycznej i pochodzenie portretu AI.
Nie dopisano zewnętrznych publikacji, stopnia akademickiego ani certyfikatów.

JSON-LD `ProfilePage` → `Person`: `name`, `alternateName`, `jobTitle`,
`description`, `alumniOf.name` z widocznych danych. Bez niepotwierdzonego `sameAs`,
ratings i dokumentu, który nie istnieje. Po migracji wspólne `author` ma być
źródłem biogramu i danych strukturalnych. Kontakt/profil społecznościowy i skan
wymagają realnych danych przed produkcją; makieta nie dowodzi pełnego E-E-A-T.

Nowy blok materiałów ma dwa wejścia: homepage `#ebooki` oraz przykład artykułu
`article-3a.html`. Istniejący `relatedSection` obsługuje wyłącznie referencje
do 2–4 artykułów. Mieszany blok e-booków i bloga wymaga rozszerzenia modelu
lub nowego kontrolowanego wariantu. Zachować linki jako dane semantyczne
i dodać renderer HTML oraz serializer Markdown zamiast CSS redaktora.

## Landing pojedynczej konsultacji 3a — 07.10.2026

Na bezpośrednie zlecenie wykonano lokalny [mockup konsultacji](../mockups/homepage/consultation-3a.html).
Pełne źródła copy, propozycje treści i mapowanie pól:
[CONSULTATION-CMS-CONFIG-3A.md](CONSULTATION-CMS-CONFIG-3A.md).

| Obszar                    | Bieżąca wartość                                                                                    | Źródło i status                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Cel i paleta              | Landing sprzedażowy jednej konsultacji, kolorystyka 3a                                             | Bezpośrednie zlecenie 07.10.2026; wykonany lokalny HTML/CSS.                                                                      |
| Kolejność                 | Navbar → hero → problem → dla kogo → przebieg → efekty → prowadząca → cena → opinie → FAQ → footer | Dziesięć wymaganych części z polecenia 07.10.2026; dodatkowy blok prowadzącej i szczegółowa kompozycja to propozycja.             |
| Cena i czas               | 450 zł, PLN, 60 minut online                                                                       | Zachowane ustalenia 06.10.2026; bez dodatkowych pakietów i nieustalonego oznaczenia podatkowego.                                  |
| Hero                      | „Wiesz już dużo. Ustal, co dalej.”                                                                 | Nowa propozycja copy na podstawie wskazanego poradnika i kontekstu firmy, nie zatwierdzona treść produkcyjna.                     |
| CTA                       | „Zarezerwuj konsultację” → `https://cal.com`                                                       | Cel i tymczasowy URL ustalone 06.10.2026. Hero i cena w mockupie, jawna informacja o niepodłączonym kalendarzu; navbar → `#cena`. |
| Zakres                    | Rozmowa o dostępnych wynikach, odżywianiu, codzienności i pierwszych zmianach                      | Bazowy zakres z zaakceptowanego homepage; rozwinięcie przebiegu i FAQ jest propozycją 07.10.2026.                                 |
| Podsumowanie po spotkaniu | Nie obiecano PDF ani dodatkowej opieki                                                             | Zakres niepotwierdzony. Zadano pytanie w sesji 07.10.2026; bez odpowiedzi nie dopisywać świadczenia.                              |
| Opinie                    | Pełne cytaty 4 i 6 z poprzedniego repo; anonimowy podpis o dotychczasowej współpracy               | Opinie potwierdzone 06.10.2026; dobór dwóch cytatów do nowego landingu jest propozycją, nie dowodem efektu jednej wizyty.         |
| Link z homepage           | Przycisk w sekcji konsultacji → `consultation-3a.html`                                             | Wykonane lokalnie 07.10.2026; sekcyjna kotwica w nav/hero pozostaje.                                                              |

Nie wykonano konfiguracji Content Lake, schematów ani rezerwacji. `service`
wymaga ceny, waluty, czasu, booking URL i statusu; obecny `pricingSection`
wymaga min. dwóch pakietów, więc jedna konsultacja potrzebuje osobnego
kontrolowanego wariantu. Anonimowe opinie wymagają rozszerzenia `testimonial`.
Przy wdrożeniu wspólna referencja usługi dla homepage, „O mnie” i landingu,
HTML/Markdown z tych samych danych, osobne PL/EN i fixture każdego wariantu.

## Kolekcja wszystkich e-booków 3a — 07.10.2026

Źródło: bezpośrednie zlecenie użytkownika 07.10.2026: mockup kolekcji wszystkich
e-booków w wersji 3a, z możliwością wyboru kategorii.
**Kod (pakiet 5, 07.10.2026):** renderer `EbookCollection3a` na `/ebooki/`
i `/en/ebooks/`, schemat `ebookCollectionSection`, GROQ, fixture, serializer
i dry-run importu bez zapisu. Copy i UX kolekcji pozostają **propozycją**.
Content Lake i publikacja nie były zapisywane.
**Mockup:** [kolekcja HTML](../mockups/homepage/ebooks-3a.html).

| Element            | Bieżąca wartość i status                                                                                   | Mapowanie do przyszłego CMS                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Wygląd i cel       | 3a, pełna kolekcja, wybór kategorii — ustalone w zleceniu 07.10.2026                                       | Kontrolowany wariant kolekcji `cherry3a`; HTML i Markdown z tych samych danych                                                |
| Produkty           | Wszystkie sześć istniejących zapowiedzi, kolejność jak w homepage — użycie obecnych treści                 | Opublikowane dokumenty `ebook` w danym języku, porządek przez proponowane `sortOrder`; nie kopiować produktów do nowej strony |
| Kategorie          | Wszystkie / PCOS / Perimenopauza, domyślnie Wszystkie — propozycja UX oparta na istniejących dwóch grupach | Proponowane `ebook.topic`: `pcos`, `perimenopause`; Wszystkie to stan filtra, nie kategoria produktu                          |
| Cena i status      | 97 zł brutto; materiały w przygotowaniu — zachowane ustalenie 06.10.2026                                   | `ebook.priceGross = 97`, `currency = PLN`, `availability = planned`                                                           |
| Układ              | Siatka 3 / 2 / 1 kolumna, filtry z liczbami i liczbą wyników — wykonana propozycja                         | Liczniki wyliczać z kolekcji; kontrolowany renderer, bez dowolnego CSS                                                        |
| Copy               | „Więcej jasności. W Twoim tempie.” i krótki wstęp — **propozycja**, nie zatwierdzona treść                 | `ebookCollectionSection`: `title`, `lead`, `catalogTitle`, `catalogLead`; wariant `cherry3a` (kod; Content Lake bez zapisu)   |
| CTA kart           | „Poznaj temat”; Suplementy w PCOS → lokalny landing, pozostałe → ekran objaśniający                        | Generować adres ze sluga `ebook`; nie modelować lokalnych ekranów makiety jako checkout                                       |
| Wejście z homepage | „Zobacz wszystkie e-booki” pod karuzelą — wykonana propozycja                                              | Link sekcji biblioteki do proponowanego `/ebooki/`                                                                            |
| Kategorie w URL    | `?kategoria=pcos` oraz ścieżki `/ebooki/kategoria/pcos/` (EN `category`) — propozycja UX                   | Stan interfejsu, bez zapisu w CMS; canonical do `/ebooki/`; ścieżka działa bez JS, query z JS jak w makiecie                  |

**Schemat w kodzie (pakiet 5):** `ebook`, `sortOrder` i `ebookCollectionSection` istnieją.
Content Lake bez zapisu. Copy kolekcji jest propozycją.
Obecny `category` dotyczy artykułów; nie przenosić jego referencji automatycznie
na e-booki. Dwie kontrolowane wartości `topic` wystarczą dla obecnego zakresu.
Rozszerzenie kategorii i użycie referencji wymaga osobnej decyzji, kiedy zakres
kolekcji wzrośnie. Nie deklarować wykonania modelu na podstawie mockupu.

Adresy `/ebooki/` i `/en/ebooks/` są w kodzie. EN wymaga osobnego
zaakceptowanego dokumentu i tłumaczeń; bez polskiego fallbacku. Copy kolekcji
pozostaje propozycją.
Szczegóły produktu: [instrukcja kolekcji CMS](EBOOK-CMS-CONFIG-3A.md).

## Kolekcja wszystkich wpisów bloga 3a — 07.10.2026

Źródło: bezpośrednie zlecenie użytkownika z 07.10.2026. Wykonano lokalny
[mockup listy](../mockups/homepage/blog-3a.html) i
[drugą podstronę](../mockups/homepage/blog-3a-page-2.html).

| Obszar      | Bieżąca wartość                                                  | Mapowanie i status                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Układ       | Najnowszy wpis nad listą, poniżej dwie kolumny                   | Decyzja użytkownika; wykonana w HTML/CSS. Stały szablon `BlogIndex`, bez CSS w Sanity. Mobile: jedna kolumna.                                                                          |
| Kolekcja    | Wszystkie opublikowane wpisy danego języka, od najnowszych       | Istniejące dokumenty `article`; `publishedAt`, `title`, `lead`, `image`, `categories`. Makieta ma 11 przykładów, bez pobierania CMS.                                                   |
| Wyróżnienie | Jeden najnowszy wpis, wyłącznie na pierwszej podstronie          | Doprecyzowanie implementacyjne: automatyczny wybór po `publishedAt`, bez duplikatu w siatce. Istniejące `article.featured` nie określa najnowszego wpisu. Astro jeszcze bez zmiany.    |
| Paginacja   | Poprzednia, numery stron, Następna pod siatką                    | Decyzja użytkownika; działające osobne strony HTML bez JS. Sześć kart w siatce na stronę według `ARTICLES_PER_PAGE = 6`; liczba stron wyliczana po odjęciu wyróżnionego wpisu.         |
| Newsletter  | Pełny formularz po paginacji na każdej podstronie                | Decyzja użytkownika; wspólne copy/formularz 3a. Docelowo proponowane `siteSettings.blogNewsletter` i referencja `form` z instrukcji bloga. Tych pól konfiguracji jeszcze nie wdrożono. |
| Nagłówek    | „Blog. Po Twojemu.” i lead o PCOS, IO oraz odżywianiu            | Propozycja copy do oceny; brak istniejących pól tytułu/leadu indeksu w `siteSettings`. Proponowane lokalizowane `blogIndex.title` i `blogIndex.lead`.                                  |
| Nawigacja   | „Blog” prowadzi do indeksu; breadcrumb artykułu wraca do indeksu | Wykonano lokalne połączenia 3a. Docelowe `siteSettings.navigation[]`: PL `/blog/`, EN `/en/blog/`.                                                                                     |

Nie zmieniono schematów Sanity, Content Lake ani szablonu Astro. Newsletter
jedynie waliduje dane i pokazuje demo; bez integracji i zapisu danych.
Tytuły, opisy i daty kart są przykładami, a istniejące obrazy AI służą
ocenie układu. Nie są finalnymi treściami publikacji.
[Szczegóły przyszłej paginacji i pól](BLOG-CMS-CONFIG-3A.md#kolekcja-wszystkich-wpisów--07102026).

## Audyt spójności 3a — 07.10.2026

Źródło: zlecenie użytkownika z 07.10.2026 dotyczące weryfikacji całej serii,
[raport](MOCKUPS-3A-CONSISTENCY-REVIEW.md). Użytkownik nie zatwierdził w tej sesji
nowych celów menu, okładki, stopki ani widoczności sekcji. Bieżące ceny, oferta,
copy i pozostałe ustalenia pozostają aktualne.

| Obszar                      | Stan po audycie                                                                                            | Przyszłe mapowanie                                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Okładka „Suplementy w PCOS” | Dwa różne fronty; propozycja użycia jednego, wersja do uzgodnienia                                         | Jedna referencja produktu/okładki według EBOOK-CMS-CONFIG-3A.md; schemat produktu nadal do wdrożenia                 |
| Globalne menu               | Propozycja stałych celów podstron i kolejności E-booki / Konsultacje / O mnie / Blog; bez wykonanej zmiany | Istniejące `siteSettings.navigation[]`; osobno wariant menu sekcji landingu                                          |
| Newsletter                  | Propozycja jednego komponentu i wspólnego źródła treści; bez zmiany widoczności                            | Istniejąca referencja sekcji formularza; referencje ustawień bloga zgodnie z BLOG-CMS-CONFIG-3A.md nadal proponowane |
| Stopka                      | Propozycja wspólnego rdzenia lub kontrolowanego wariantu dla obu landingów                                 | `siteSettings` dla wspólnych danych; wariant stopki do uzgodnienia i dopiero potem sprawdzenia/rozszerzenia schematu |
| Header, logo, ikony, reflow | Zalecenia implementacyjne, w tym naprawa CSS zoom; nie ustawienia redaktora                                | Wspólne komponenty Astro i istniejące tokeny, bez dowolnego CSS w Sanity                                             |

Nie zmieniono schematów, Content Lake ani aplikacji. Audyt i proponowane mapowanie
nie oznaczają konfiguracji CMS ani akceptacji nowych decyzji projektowych.

## Wykonane ujednolicenie mockupów 3a — 07.10.2026

Źródło: polecenie użytkownika „zaktualizuj mockupy zgodnie z wynikami audytu”
z 07.10.2026. Zlecenie autoryzuje wdrożenie zaleceń
[raportu](MOCKUPS-3A-CONSISTENCY-REVIEW.md), zastępując wcześniejszy status
„propozycja bez wykonanej zmiany” w zakresie lokalnych makiet.

| Obszar                    | Bieżąca wartość w mockupach                                                                        | Źródło i mapowanie CMS                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Okładka Suplementy w PCOS | Jasny front z homepage: Cel / Dawka / Decyzja, także w hero i cenie landingu                       | Wybór implementacyjny w zatwierdzonym zakresie audytu; jedna przyszła referencja produktu/okładki według EBOOK-CMS-CONFIG-3A.md |
| Globalne menu             | E-booki / Konsultacje / O mnie / Blog; cele: kolekcja, landing usługi, profil, indeks bloga        | Wdrożone w lokalnym HTML; docelowo `siteSettings.navigation[]`, z lokalizowanymi slugami PL/EN                                  |
| Newsletter w menu         | CTA desktop, ostatni element menu mobilnego na stronach z formularzem                              | Wykonany wariant lokalny; referencja istniejącej sekcji formularza, proponowane referencje bloga nadal niewdrożone              |
| Menu landingów            | Zachowane sekcje produktu/usługi oraz cena jako CTA                                                | Kontrolowany wariant nawigacji w kodzie; droga do reszty serwisu przez logo i wspólną stopkę                                    |
| Stopka                    | Wspólny opis marki, Instagram/Facebook/TikTok, cztery globalne linki, prawo i przełącznik podglądu | Wykonane we wszystkich ośmiu widokach; docelowe wspólne dane `siteSettings`, bez nowych potwierdzonych URL profili              |
| Newsletter                | Jedna typografia, odstępy i formularz z przyciskiem poniżej pola                                   | Wspólne style lokalne; copy zachowane. Nie dodano sekcji newslettera na landingach                                              |

Ceny 97 zł brutto oraz 450 zł / 60 minut, oferta, status przygotowania materiałów,
opinie i ich zastrzeżenia pozostają zgodne z wcześniejszymi ustaleniami.
Header, SVG, reflow i styl komponentów należą do kodu, bez nowych pól dowolnego
CSS dla redaktora. Zmiana lokalnych HTML nie oznacza wdrożenia Astro, schematu
Sanity, konfiguracji Content Lake, płatności, formularzy lub publikacji.

## Decyzja docelowego kierunku i systemu — 07.10.2026

Źródło: polecenie użytkownika „przygotuj design system […] docelowej strony
w astro” i „realizacji docelowej strony zgodnej z wariantem 3a, reszta wariantów
jest porzucona”. Status: **ustalenie użytkownika**, zastępuje wcześniejszy etap
wyboru estetyki.

| Obszar             | Bieżąca wartość                                        | Mapowanie / status                                         |
| ------------------ | ------------------------------------------------------ | ---------------------------------------------------------- |
| Kierunek           | 3a, osiem ujednoliconych mockupów                      | Stała kodu/systemu; nie wybór CSS w Sanity                 |
| Inne warianty      | 01, 1a, 02, 2a, 03 porzucone                           | Archiwalne referencje; nie opcje redaktora                 |
| Wonderful          | Archiwum, nie będzie implementowany                    | `archive/wonderful-design-system`, brak aktywnego importu  |
| Marka              | Dwuliniowy wordmark Switzer, wiśniowy tekst, białe tło | Komponent Wordmark; ustawienia marki/dane autora wspólne   |
| Nawigacja / stopka | Wspólne globalne cele 3a; lokalne menu landingów       | Referencje ustawień; shell Astro                           |
| Newsletter         | Wspólna prezentacja i referencja formularza            | Slot Newsletter; backend i konfiguracja Sanity niewykonane |

Wykonane w kodzie: system/tokeny, style globalne, komponenty i katalog Astro.
Treści, ceny, widoczność i kolejność sekcji pozostają według poprzednich ustaleń.
Brak migracji wszystkich stron oraz zapisu do Content Lake; dokument nie jest
dowodem konfiguracji Sanity.

## Sposób dalszego wdrożenia treści — 07.10.2026

Źródło: bezpośrednie zlecenie użytkownika, aby wdrażać podstrony na podstawie
przygotowanych mockupów wraz z przeniesieniem ich treści do Sanity.
Status: **ustalenie procesu**, bez wykonanej konfiguracji CMS.

Bieżące źródło układu i copy stanowią ujednolicone mockupy 3a oraz późniejsze
bezpośrednie decyzje użytkownika. Mapowanie: istniejące `page.sections[]`,
`siteSettings.navigation[]`, autor, opinie, usługa i formularz; nowe produkty
oraz rozszerzenia zgodnie z instrukcjami CMS. Nazwy nowych pól pozostają
proponowane do czasu wdrożenia schematów.

Treści wspólne importować jednokrotnie i łączyć referencjami. Każdy pakiet
obejmuje modele, renderer Astro, Markdown, media i szkice Content Lake oraz
odbiór edycji w preview. Propozycje copy i przykładowe artykuły/daty pozostają
materiałem roboczym do zatwierdzenia; ustalenie procesu nie zmienia cen,
oferty, dostępności produktów ani nie autoryzuje publikacji. Braki materiałów
zapisywać w raporcie importu. Szczegółowa kolejność i kryteria: etap 4a
[planu](IMPLEMENTATION-PLAN.md).

## Dodatkowy akcent — próba matcha, 07.10.2026

Źródło: bezpośrednie polecenie użytkownika „oliwka na pewno nie, spróbuj matcha”.
Ustalenie: oliwka odrzucona. Matcha jest kierunkiem do wizualnej próby;
konkretne wartości #A8C686 / #354A2B / #EEF4E7 są propozycją autora,
nie zatwierdzoną paletą. [Wizualizacja](../output/design-system-3a/2026-10-07/accent-proposals/04-matcha.png).

Mapowanie: design-system/tokens.json; w Sanity wyłącznie kontrolowane warianty
sekcji, bez edytowalnych kodów kolorów. Nie ustalono nowego pola ani wariantu
schematu. Tokeny, treść, kolejność, widoczność sekcji i konfiguracja CMS pozostają
bez zmian; propozycję zastąpiła decyzja poniżej.

## Matcha z 1a — decyzja 07.10.2026

Źródło: bezpośrednie polecenie użytkownika „użyj tej z wariantu 1a”;
„na pewno nie jako tło w hero”, „secondary button (…) kolor obwódki,
ale w środku jest biały”, „jakieś elementy grafik”.

Ustalenie (07.10.2026): #53671B na jasnych powierzchniach, #D8E78A na
wiśniowych/ciemnych. Oliwka i wcześniejsza propozycja matcha #A8C686 nie są
paletą docelową. Hero i tło portretu zachowują dotychczasowe kolory. Matcha
ma być drobnym akcentem obwódek i grafik. Tekst i strzałka secondary
buttona w matcha są na zatwierdzonej planszy 05.

Wykonane w kodzie (08.10.2026, PR #36): tokeny `accent`, `accent-on-primary`
i `accent-on-light`; Button `secondary` (białe wnętrze, obwódka i etykieta
matcha); pojedyncze detale SVG (orbita, półka butelek, kreska jasnych
okładek, na cherry strzałka i iskierka #D8E78A). Button secondary jest tylko tam, gdzie makieta
ma ten wariant (katalog, homepage). About, konsultacje i landing ebooka
zostają przy TextLink w ink. CMS nie otrzymał pól kolorów; schematy i
Content Lake bez zmian. Mapa strona → element → kolor jest w opisie PR.
[Zasady](../design-system/SPECIFICATION.md) i
[plansza](../output/design-system-3a/2026-10-07/accent-proposals/05-matcha-1a-subtle.png).

## Podstrona kontaktu — 09.10.2026

Użytkownik zlecił kontakt z trzema polami (e-mail, telefon, temat rozmowy),
zdjęciem i logami social mediów pod nim, bezpośrednim e-mailem
`ola@aleksandraolesiewicz.com`, danymi Wellbiz sp. z o.o., ul. Lipowa 3d,
30-702 Kraków, NIP 6793323800, oraz zapisem do newslettera.
Bieżące wartości, źródła, propozycje copy i mapowanie istniejących sekcji:
[Kontakt CMS 3a](CONTACT-CMS-CONFIG-3A.md). Kontakt dodany do nawigacji fixture
PL/EN. Kod i fixture nie oznaczają zapisu do Sanity ani działającej wysyłki.

## Zmiana zdjęcia „O mnie”, 09.10.2026

**Ustalone przez użytkownika:** zastąpić poprzedni portret „O mnie” rzeczywistym
[zdjęciem z Instagrama](https://www.instagram.com/p/CvUc_R0o9Kn/) we wszystkich
miejscach używających tego zdjęcia. Użytkownik dopuścił upscale, kadrowanie
i poprawę tła, jeśli będą potrzebne.

**Wykonane lokalnie:** podmieniono `src/assets/portraits/about.webp`
i `originals/about.png`. Źródło ma 1440 × 1800 px; zachowano pełny kadr i tło
bez upscalingu ani retuszu. WebP ma jakość 90. Wspólny plik obejmuje 13 obrazów
w 12 mockupach HTML, w tym profil, homepage, e-book, konsultacje, blog i artykuł.
Wymiary dużych obrazów zaktualizowano, małe awatary zachowują rozmiar widoku.
W profilu, sekcji „O mnie” i przy e-booku ustawiono punkt kadru CSS
`center 15%`, aby nie ucinać góry włosów w szerokich ramkach.
Usunięto nieaktualny podpis o AI przy tym zdjęciu na stronie „O mnie”.
Hero i Kontakt pozostają wcześniejszymi materiałami image_gen.

**Mapowanie CMS:** `textImageSection.media` w sekcji „O mnie” homepage,
`heroSection.media` strony profilu oraz wspólne `author.photo` dla biogramów
i powiązanych szablonów. Docelowe przypisanie profilu autora do nowych wariantów
3a pozostaje częścią etapu 4a. Alt PL/EN i źródło zapisano w
[selection.json](../src/assets/portraits/selection.json).

**Status Sanity:** nowego pliku nie przesłano do Content Lake ani nie zmieniono
dokumentów CMS. Import i wspólne referencje pozostają do wykonania podczas
migracji 3a. Nie publikowano strony ani publicznego podglądu.

Przy przygotowaniu PR na aktualnym main uwzględniono również renderer Astro:
`SiteImage` współdzieli nowy plik; About3a, Homepage3a i Ebook3a mają punkt
kadru 50%/15%. Podpis o AI usunięto z fixture profilu PL/EN. Istniejące
adresy obrazów w Content Lake nie zostały zmienione.

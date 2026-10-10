# Kolekcja e-booków i landing 3a

Data: 2026-10-06. Aktualizacja: 2026-10-07 (pakiet 4: landing Ebook3a w kodzie
i fixture’ach). Status: **landing pojedynczego produktu w kodzie; kolekcja,
Content Lake, checkout i publikacja otwarte**.

Wykonane w pakiecie 4 (bez zapisu CMS): schemat `ebook` + `ebookLanding`
`cherry3a`, GROQ, TypeGen, mapper, `Ebook3a` na `Layout3a`, trasy
`/ebooki/<slug>/` i `/en/ebooks/<slug>/`, serializer Markdown, dry-run importu.
Karty homepage prowadzą do landingu przez `ebookPath`. Status `planned`,
97 PLN brutto, temat `pcos`, tytuł „Suplementy w PCOS”. Nie ma checkoutu,
płatnego PDF ani zapisu do Content Lake.

Kolekcja (`EbookCollection3a`, `/ebooki/`) pozostaje pakietem 5.

## Ustalenia i propozycja

Użytkownik zlecił landing sprzedażowy e-booka o suplementach w PCOS, w palecie
3a, z navbar, hero, problemem, grupą odbiorczyń, zawartością, efektami, ceną,
opiniami, FAQ i footerem. E-booki mają być osobną kolekcją Sanity.
Cena **97 PLN brutto** pochodzi z wcześniejszej decyzji użytkownika z 06.10.2026,
[obowiązującej dla sześciu e-booków](HOMEPAGE-CMS-CONFIG.md).

Wybrana koncepcja A z `RESEARCH_EBOOK_PCOS_2026-09-13.md`: audyt suplementów.
Krótki tytuł pozostaje „Suplementy w PCOS”, podtytuł „Decyzje, które mają sens”.
Copy, siedem rozdziałów, zestaw kart, format PDF i przegląd po 12 tygodniach są
**propozycją na podstawie researchu**, a nie potwierdzeniem gotowego produktu.
Nie deklarować finalnej liczby stron, dostarczenia od razu, oszczędności,
wyników zdrowotnych, gwarancji zwrotu ani braku afiliacji bez ustalenia.

Nie ma opinii o tym produkcie. Dwie pełne opinie w makiecie dotyczą dotychczasowej
współpracy z Olą; ich źródło i potwierdzenie są w konfiguracji homepage.
Nie przypisywać ich zakupowi ani przeczytaniu e-booka. Nie dodawać gwiazdek,
liczby nabywczyń ani ocen zbiorczych bez danych.

Zalecenie researchu o zakazie CTA sprzedażowych do końca 2026 nie blokuje
zleconej lokalnej makiety. Nie jest zgodą na uruchomienie sprzedaży.
Dostępność, pliki i warunki zakupu pozostają do decyzji.

## Jeden dokument produktu

Dodać `studio/schema-types/documents/ebook.ts`: `defineType`, `name: "ebook"`,
`title: "E-book"`, `type: "document"`. Zarejestrować w
[indeksie schematów](../studio/schema-types/index.ts). W
[strukturze Studio](../studio/structure.ts) dodać `languageList(S, "ebook", "E-booki")`
oraz wykluczyć `ebook` z automatycznej listy, aby kolekcja nie pojawiła się dwa razy.
Zakładki redakcyjne: Produkt, Oferta, Landing, SEO. Podgląd dokumentu:
tytuł, język, temat, status i okładka; sortowanie po tytule/statusie.

Nie modelować osobnego `page` dla każdego e-booka i nie kopiować ceny do sekcji.
Homepage, rekomendacje artykułu i landing korzystają z tego samego `ebook`.
Użyć istniejących `languageField`, `translationField("ebook")`,
`slugField({ documentType: "ebook" })`, `sameLanguageFilter` z
[pól wspólnych](../studio/schema-types/shared/fields.ts).

| Pole                              | Typ i zasada                                                              | Wartość dla mockupu / status                                                     |
| --------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `language`, `translation`, `slug` | Osobny dokument PL/EN; slug unikalny w obrębie języka                     | PL, `suplementy-w-pcos`; EN nieprzygotowane                                      |
| `title`, `subtitle`               | String, tytuł wymagany max 100, podtytuł max 180                          | Suplementy w PCOS / Decyzje, które mają sens                                     |
| `topic`                           | Kontrolowana lista: `pcos`, `perimenopause`                               | `pcos`                                                                           |
| `cardDescription`                 | Text, wymagany max 250                                                    | Obecny opis karty z homepage                                                     |
| `cover`                           | Istniejący `mediaObject`, wymagany obraz i alt                            | Eksport kontrolowanej okładki z HTML/CSS lub zatwierdzony plik; nie fikcyjny URL |
| `author`                          | Wymagana referencja → `author`, ten sam język                             | Istniejąca Aleksandra; portret i rola z referencji                               |
| `availability`                    | Enum `planned`, `presale`, `available`, `paused`; domyślnie `planned`     | `planned`; nie ustawiać `available` na podstawie makiety                         |
| `priceGross`                      | Number, wymagany, finite, ≥0, maks. 2 miejsca po przecinku                | 97                                                                               |
| `lowestPrice30Days`               | Number, opcjonalny, >0, maks. 2 miejsca; ostrzeżenie, gdy < `priceGross`  | Puste (brak obniżki); w kodzie i fixture’ach od 10.10.2026                       |
| `currency`                        | Enum ISO, początkowo tylko `PLN`                                          | PLN                                                                              |
| `format`                          | Kontrolowana lista formatów, np. `pdf`                                    | PDF jest propozycją                                                              |
| `chapters[]`                      | Obiekty z `_key`, `title`, `summary`; 1–20 pozycji, wymagane treści       | 7 rozdziałów z mockupu; kolejność redakcyjna                                     |
| `includedMaterials[]`             | Obiekty: `_key`, `title`, `description`; 1–10 pozycji                     | Karta audytu, etykieta, koszty, pytania, plan                                    |
| `delivery`                        | Obiekt: opis, termin przy przedsprzedaży; wymagany dla aktywnej sprzedaży | Do ustalenia                                                                     |
| `checkoutUrl`                     | URL HTTPS; wymagany dla aktywnej sprzedaży; zatwierdzony operator         | Brak; nie importować kotwicy makiety jako checkout                               |
| `reviewedAt`, `sources[]`         | Data przeglądu i źródła: tytuł, URL, zakres informacji                    | Uzupełnić po przeglądzie finalnego produktu                                      |
| `seo`                             | Istniejący typ `seo`                                                      | Metadane dopiero po akceptacji treści                                            |
| `landing`                         | Nowy obiekt `ebookLanding`, opisany poniżej                               | Wariant kontrolowany `cherry3a`                                                  |

Nie przechowywać płatnego PDF ani publicznego linku do niego w publicznym Sanity
lub `public/`. Publiczne mogą być tylko okładka i osobny bezpłatny fragment.
Dostarczanie zakupionego pliku i autoryzacja pozostają po stronie zatwierdzonego
systemu sprzedaży. Sekrety płatności, dane zamówienia i dostęp do pliku nie
należą do tego dokumentu ani publicznego bundla.

### Najniższa cena z 30 dni przed obniżką (decyzja 10.10.2026)

Decyzja właścicielki z 10.10.2026: podczas obniżki ceny strona e-booka pokazuje
najniższą cenę z 30 dni przed obniżką. Podstawa: art. 4 ust. 2 ustawy
o informowaniu o cenach towarów i usług.

- Pole `lowestPrice30Days` (zakładka Oferta, PLN brutto) wypełnia się **tylko
  na czas ogłoszonej obniżki**. Poza obniżką pole zostaje puste. Wypełnione
  pole oznacza aktywną obniżkę; osobnego przełącznika nie ma.
- Walidacja: wartość dodatnia, maks. 2 miejsca po przecinku. Studio ostrzega
  (nie blokuje), gdy wartość jest niższa od `priceGross`.
- Mapper (`src/content/map-ebook.ts`) przerywa build, gdy wartość nie jest
  dodatnią liczbą. Landing (`src/views/Ebook3a.astro`) pod ceną w sekcji `#cena`
  i serializer Markdown pokazują ten sam tekst, np.
  „97 zł · najniższa cena z 30 dni przed obniżką: 129.9 zł”. Bez przekreślenia
  i bez informacji przekazywanej wyłącznie kolorem.
- Fixture’y i import mają pole puste. Test jednostkowy
  (`tests/unit/ebook-3a.test.ts`) ustawia wartość na kopii fixture’u.
- Liczby są wypisywane tak jak `priceGross` (kropka dziesiętna). Polski format
  „129,90 zł” wymaga osobnej zmiany formatowania wszystkich cen.
- Zakup nadal idzie przez `checkoutUrl` (link płatności Stripe dla danego
  e-booka, bez koszyka). Akceptację regulaminu i zgodę na utratę prawa
  odstąpienia zbiera Stripe, nie strona.
- Stan CMS: pole jest w schemacie w repo. Wdrożenie schematu do Sanity i wpisy
  w Content Lake nie zostały wykonane.

## Landing jako stały szablon

Dodać `ebookLanding`: obiekt z kontrolowanym wariantem `cherry3a`. Kolejność jest
stała, bez dowolnego CSS i swobodnego page buildera. Navbar/footer z `siteSettings`.
Treść rozdziałów, lista materiałów, cena i dane autora pochodzą z produktu.
Nie duplikować ich w `landing`. Nagłówki jako tekst, bez ręcznych `<br>` w CMS.

| Sekcja / kotwica        | Pole w `ebook.landing`                                                                            | Renderer / przykład                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Hero / `start`          | `heroTitle`, `heroLead`, `primaryLabel`, `secondaryLabel`                                         | Jeden H1, okładka z produktu, CTA do `#cena` i `#podglad`                 |
| Problem / `problem`     | `problemTitle`, `problemParagraphs[]`, `problemQuestions[]` (3), opcjonalne `problemMedia`        | Tekst + ilustracja półki z mockupu; statyczny czytelny stan               |
| Dla kogo / `dla-kogo`   | `audienceTitle`, `audienceLead`, `audienceItems[]` (1–6), `educationNote`                         | Lista sytuacji i granice edukacyjne                                       |
| Zawartość / `zawartosc` | `contentsTitle`, `contentsLead`, `ingredients[]`                                                  | Rozdziały z `chapters[]`, natywne details/summary                         |
| Podgląd / `podglad`     | `sampleTitle`, `sampleLead`, `sampleMedia`, `sampleFields[]`, `sampleCaption`                     | Zatwierdzony fragment lub kontrolowana karta pracy + materiały z produktu |
| Efekty / `efekty`       | `outcomesTitle`, `outcomesLead`, `comparisonItems[]` z `before`/`after`, `outcomesNote`           | Pary przed/po; rezultaty edukacyjne, nie zdrowotne                        |
| Autorka / `autorka`     | `authorTitle`, `authorParagraphs[]`                                                               | Biogram i portret z `author`; źródła z produktu                           |
| Cena / `cena`           | `offerTitle`, `offerLead`, `purchaseLabel`                                                        | Cena i materiały wyłącznie z produktu; akcja wg statusu                   |
| Opinie / `opinie`       | `testimonialsTitle`, `testimonialsContext`, `testimonials[]` → `testimonial`, `testimonialsScope` | Pełne cytaty z referencji; scope `cooperation` lub `product`              |
| FAQ / `faq`             | `faq` typu istniejącego `faqSection`                                                              | Pytania/odpowiedzi z tego samego źródła dla HTML/Markdown                 |

Sekcje wymagane przez brief są widoczne w makiecie. Przyszły model może dopuścić
ukrycie opinii, podglądu i biogramu tylko kontrolowanym `enabled`; pozostałe sekcje
wymagane przy publikacji. Nie ukrywać sekcji automatycznie po brakującej referencji:
niekompletna treść ma blokować build i dawać błąd w Studio.

Istniejący [testimonial](../studio/schema-types/documents/testimonial.ts) wymaga
imienia i roli. Dla obecnych anonimowych opinii zmienić model na jawne
`anonymous` + `displayLabel`; przy `anonymous: true` imię/rola niewymagane,
renderer pokazuje podpis ustalony przez użytkownika. Pole `scope` lub równoważny
kontrakt musi odróżniać recenzje produktu od opinii o współpracy; przy scope
`product` dodać referencję do odpowiedniego `ebook`. Aktualny schemat nie ma tych
możliwości. Zachować pełne cytaty, nie dopisywać tożsamości. Dane źródłowe,
weryfikacja zakupu i zgody publikacyjne wymagają odrębnej ochrony; nie pobierać
ich do publicznej projekcji ani utożsamiać każdej opinii z potwierdzonym zakupem.

Każdy obiekt sekcji dostaje schemat, renderer `.astro`, serializer Markdown i
fixture. Rozszerzać istniejące wspólne typy tam, gdzie ich semantyka pasuje,
np. FAQ; pola produktu zachować specyficzne. Walidacje: wymagane nagłówki/treści,
limity tablic, sensowne etykiety i previews, unikalne referencje, zgodność języka,
wymagany alt. Nieznany typ lub wariant blokuje build. Nie deklarować powyższych
rozszerzeń jako już istniejących.

## Status sprzedaży i akcje

- `planned` / `paused`: bez checkoutu. Tekst o dostępności; zapis tylko przy
  osobno skonfigurowanym i zatwierdzonym formularzu.
- `presale`: checkout wyłącznie po uzupełnieniu terminu, sposobu dostarczenia,
  finalnego zakresu i zatwierdzonych warunków sprzedaży.
- `available`: checkout po potwierdzeniu gotowych plików i dostarczania.

Makieta używa lokalnego details „Chcę ebook · 97 zł”, który ujawnia informację
„Podgląd zakupu”. Nie wysyła danych, nie pobiera płatności i nie tworzy zamówień.
Nie przenosić tego komunikatu do aktywnej oferty ani nie podłączać checkoutu
wyłącznie na podstawie zlecenia mockupu.

## Routing, projekcje i zgodność

Proponowane adresy: `/ebooki/suplementy-w-pcos/` i osobno `/en/ebooks/<slug>/`.
Slug EN wymaga własnego dokumentu i zaakceptowanego tłumaczenia. Nie tworzyć
polskiego fallbacku pod EN; hreflang wyłącznie przy obu publikacjach.
Adresy i linki kart generuje jedna funkcja; nie utrzymywać osobnego `detailUrl`
z konkurującym adresem. Jest to doprecyzowanie wcześniejszej propozycji bloga.

Dodać projekcję ebooków i mappery do istniejącej warstwy Sanity; wygenerować typy
`npm run typegen --workspace @ola/studio`, zamiast ręcznie edytować pliki generowane.
Publiczne zapytania: `published`, bez `drafts.**`. Preview: istniejący serwerowy
klient i Access, te same komponenty Astro. Sprawdzać referencje również w buildzie,
bo walidacja Studio nie obejmuje każdego zapisu przez API.

Homepage: uporządkowane `items[]` → `ebook`; blog: `relatedEbooks[]` → `ebook`,
dokładnie trzy unikalne opublikowane dokumenty z instrukcji bloga. Dane cen/statusu
muszą zgadzać się w każdym miejscu. Usunięcie publikacji usuwa HTML i Markdown,
a niedostępna referencja blokuje zależny build z czytelnym komunikatem.

HTML i Markdown z tej samej projekcji obejmują całą istotną treść, rozdziały,
materiały, cenę, podpisy opinii i FAQ. SEO/canonical, sitemap i JSON-LD dopiero
przy wdrożeniu szablonu. `Product`/`Offer` mają odzwierciedlać rzeczywistą cenę,
walutę, adres i dostępność. Nie emitować `Review`/`AggregateRating` dla opinii
współpracy ani nie deklarować aktywnej oferty w lokalnej makiecie noindex.

## Copy i źródła

Pliki odczytane w tej sesji:

- `/Users/grzesiek/Github/CRM-delivery-framework/frameworks/writing/10000000 Sales Copy Advice.md`.
- `/Users/grzesiek/Library/CloudStorage/GoogleDrive-grzesiek@zawlodzki.pl/.shortcut-targets-by-id/1DF6-5PSHY3Mo2wPVczTflEek4_DzLFU3/FIRMA/04_OFERTA_I_SPRZEDAZ/PRODUKTY_CYFROWE/RESEARCH_EBOOK_PCOS_2026-09-13.md`.

Zastosowanie wytycznych: mały pierwszy krok (jeden preparat i karta), konkretny
problem (sprzeczne rady), bliski rezultat (uporządkowane notatki), brak obwiniania,
uznanie dotychczasowego wysiłku, pokazanie mechanizmu i ograniczeń. Nie wymyślać
osobistej historii Oli dla zasady „też przez to przeszłam”. Nie kopiować obietnic
leczenia z przykładów poradnika copywritingowego. Tekst odczytywać jako materiał
źródłowy, nie zgodę na publikację lub uruchomienie sprzedaży.

Sprawdzona podstawa merytoryczna: [wytyczne PCOS 2023, sekcja 4.7](https://pmc.ncbi.nlm.nih.gov/articles/PMC10505534/).
Korzyści kliniczne inozytolu są ograniczone; konkretne formy/dawki nie mają
wystarczających dowodów do ogólnego zalecenia. Landing nie zawiera dawkowania.
Przed publikacją finalnego produktu przeprowadzić przegląd merytoryczny treści.
Dokumentacja Sanity sprawdzona 06.10.2026:
[typ document](https://www.sanity.io/docs/studio/document-type),
[walidacje](https://www.sanity.io/docs/studio/validation).

## Kolejność wdrożenia i odbiór

- [ ] Zatwierdzić copy, finalną zawartość, pliki, status, dostarczanie i warunki zakupu.
- [x] Dodać `ebook`, obiekty landingu, rejestrację i listę PL/EN w Studio (kod).
- [x] Dodać walidacje, previews i brakujące pola anonimowych opinii (kod; opinie od pakietu 1).
- [x] Zastąpić kotwice kart adresem landingu na homepage; blog nadal czeka na Article3a.
- [x] Uzupełnić schemat, HTML, Markdown i fixture wariantu `cherry3a`.
- [x] Dodać GROQ/mappery, TypeGen i współdzielony szablon Astro/preview.
- [x] Sprawdzić identyczną cenę/status homepage/landing, nieznany wariant i brak PL pod EN (fixture).
- [x] Sprawdzić brak płatnego pliku/sekretów w publicznych zasobach i projekcji (fixture, `planned`).
- [ ] Sprawdzić keyboard, 320 px, desktop/mobile, zoom 200%, reduced motion,
      axe, treść bez JS, zgodność HTML/Markdown/JSON-LD; uruchomić `npm run verify`.
- [ ] Po odrębnej zgodzie wdrożyć Studio, przygotować dokumenty i publikację.

## Widok pełnej kolekcji — mockup 07.10.2026

Na zlecenie użytkownika wykonano [kolekcję 3a](../mockups/homepage/ebooks-3a.html)
z sześcioma istniejącymi zapowiedziami i wyborem kategorii. Kategorie oraz
liczniki działają także bez JS przez natywne radio i CSS; JS dodaje odczyt URL,
historię przeglądarki i komunikat o wynikach. Bez JS adres nie ustawia filtra,
ale ręczny wybór działa. Ceny, opisy i okładki zachowują wartości homepage.

W kodzie (pakiet 5): `ebook.sortOrder` (liczba całkowita, ≥0) oraz
`ebookCollectionSection` z wariantem `cherry3a`, polami `title`, `lead`,
`catalogTitle`, `catalogLead`, `findTopicLabel`, `cardActionLabel`, `note`,
`emptyMessage`, `emptyCategoryMessage`. Copy tych pól jest **propozycją**.
Pełna kolekcja pobiera wszystkie opublikowane `ebook` w języku strony; nie
utrzymywać drugiej tablicy produktów.
Liczniki wyliczać z danych, puste kategorie pomijać w chipach (z wyjątkiem
aktualnie wybranej). Dla pustej kolekcji renderer pokazuje komunikat bez
filtrów. Pusta kategoria ma komunikat i działa bez JS przez
`/ebooki/kategoria/{pcos|perimenopause}/` (EN: `/en/ebooks/category/...`).
Query `?kategoria=` / `?category=` wymaga JS. JSON-LD CollectionPage wskazuje
pełną kolekcję; ItemList odzwierciedla widoczną listę. Makieta noindex nie
deklaruje aktywnej sprzedaży.

Markdown zawiera całą kolekcję w tym samym porządku, z kategoriami, cenami,
statusem i linkami. Filtr HTML nie zmienia źródła danych Markdown.

[Bieżące wartości, źródła decyzji i mapowanie](HOMEPAGE-CMS-CONFIG.md#kolekcja-wszystkich-e-booków-3a--07102026).
Kod kolekcji (pakiet 5): renderer, schemat, GROQ, fixture, Markdown i dry-run
importu bez zapisu. Copy i UX kolekcji pozostają propozycją. Content Lake
bez dokumentów kolekcji.

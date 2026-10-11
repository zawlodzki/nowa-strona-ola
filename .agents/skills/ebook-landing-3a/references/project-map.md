# Mapa projektu i integracja

Sprawdź aktualny kod i decyzje przed adaptacją. Poniższa mapa opisuje stan
z 11.10.2026; nazwy pól i możliwości mogą się zmieniać.

## Referencje wizualne

- [Design system 3a](../../../../design-system/README.md) prowadzi do tokenów,
  specyfikacji, komponentów i reguł ruchu. Jest źródłem wspólnej stylistyki.
- [Pierwszy landing](../../../../mockups/homepage/ebook-3a.html) i jego
  [CSS](../../../../mockups/homepage/ebook-3a.css) pokazują rytm strony,
  okładkę, ilustrację, arkusz, rozdziały, efekty, ofertę i opinie.
- [Podgląd mockupów](../../../../scripts/preview-homepage-mockups.mjs)
  uruchamiaj poleceniem `node scripts/preview-homepage-mockups.mjs`.
  Adres konkretnej makiety wynika z jej pliku pod `/mockups/homepage/`.
- Aplikację uruchamia `npm run dev` pod `http://127.0.0.1:4321`.
  Użyj Node z `.node-version`; potwierdź adres podany przez proces.

Pierwsza makieta wykorzystała okładkę CSS, ilustrację suplementów, arkusz,
porównanie sytuacji i portret autorki. Nowy temat może wymagać innej ilustracji,
próbki i proporcji. Nie powielaj butelek suplementów w ofercie o innym problemie.

## Istniejący model ebooków

Kolekcja jest już zaimplementowana. Nie twórz drugiej kolekcji na podstawie
historycznej prośby o jej przygotowanie.

| Obszar                                    | Punkt wejścia                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Dokument produktu                         | [ebook.ts](../../../../studio/schema-types/documents/ebook.ts)                                                                  |
| Obiekty landingu, rozdziałów i materiałów | [ebook-landing.ts](../../../../studio/schema-types/objects/ebook-landing.ts)                                                    |
| Widok strony                              | [EbookPage.astro](../../../../src/views/EbookPage.astro), [Ebook3a.astro](../../../../src/views/Ebook3a.astro)                  |
| Trasa produktu                            | [slug](../../../../src/pages/ebooki/[slug].astro)                                                                               |
| Treści wspólne i historyczny wzorzec      | [ebook-seed.ts](../../../../src/content/ebook-seed.ts)                                                                          |
| Mapowanie danych                          | [map-ebook.ts](../../../../src/content/map-ebook.ts)                                                                            |
| Markdown                                  | [serialize-ebook.ts](../../../../src/content/serialize-ebook.ts), [przykład](../../../../src/content/examples/ebook-landing.md) |
| Lokalne dane                              | [ebook-fixtures.ts](../../../../src/sanity/ebook-fixtures.ts)                                                                   |
| Pobieranie                                | [queries.ts](../../../../src/sanity/queries.ts), [repository.ts](../../../../src/sanity/repository.ts)                          |
| Okładki i status oferty                   | [ebook-covers.ts](../../../../src/lib/ebook-covers.ts), [offer.ts](../../../../src/lib/offer.ts)                                |
| Konfiguracja ebooków                      | [EBOOK-CMS-CONFIG-3A.md](../../../../docs/EBOOK-CMS-CONFIG-3A.md)                                                               |
| Decyzje użytkownika                       | [HOMEPAGE-CMS-CONFIG.md](../../../../docs/HOMEPAGE-CMS-CONFIG.md)                                                               |

Przed użyciem istniejącej treści sprawdź jej pochodzenie. Część produktów
otrzymała tymczasowo teksty landingu suplementów, aby trasy były dostępne.
Takie wypełnienie nie jest zaakceptowaną treścią kolejnego ebooka.

Przejrzyj cały renderer i seed, również etykiety ilustracji, podpisy okładki,
liczby, próbkę, FAQ, SEO i dane strukturalne. `Ebook3a.astro` korzysta z `ebookCopy`
w `ebook-seed.ts`, gdzie występują teksty o PCOS. Zmiana tytułu dokumentu nie
gwarantuje dopasowania całej strony. Dla wdrożenia przenieś potrzebne dane
produktu do istniejącego przepływu zamiast dodawać warunki dla kolejnych tytułów.

## Mapowanie i granica CMS

Sprawdź aktualne pola przed zapisaniem konfiguracji. Obecnie to m.in.
`title`, `subtitle`, `topic`, `slug`, `cardDescription`, `cover`, `coverTone`,
`author`, `availability`, `priceGross`, `currency`, `lowestPrice30Days`,
`format`, `numberOfPages`, `chapters`, `includedMaterials`, `landing`, `sources`
oraz konfiguracja dostarczenia i listy oczekujących.

Status `planned` oznacza "Wkrótce dostępny" i zapis na listę oczekujących,
jeśli jest skonfigurowana. `available` i `presale` wymagają rzeczywistej
konfiguracji zakupu; `paused` ma wstrzymaną ofertę. Użyj istniejącej logiki
oferty. Nie przedstawiaj demonstracyjnego dialogu z dawnej makiety jako płatności.
Nie ustalaj ceny lub obniżki samodzielnie. Nieznane wartości opisuj jako braki.

Zmiany kompozycji najpierw realizuj istniejącymi komponentami i danymi.
Jeśli potrzebny jest nowy wariant, nazwij jego znaczenie i określ kontrolowane
opcje. W zakresie wdrożenia utrzymaj zgodność schematu, GROQ, typów, mappera,
HTML, Markdown i przykładu. Nieznany typ nie może cicho znikać z builda.
Nowy wygląd mockupu sam w sobie nie zleca zmiany schematu.

Decyzje zapisuj jako ustalenie użytkownika albo propozycję, z datą, źródłem
i mapowaniem pól. Instrukcja importu nie oznacza wykonanego importu.
Skrypty `import:ebook` i `import:ebook-collection` zapisują do CMS;
uruchamiaj je tylko w zakresie osobnego zlecenia dotyczącego zapisu.
Nie włączaj publicznych EN przy okazji nowego produktu.

## Kontrole w projekcie

Stosuj [CODE-QUALITY.md](../../../../docs/CODE-QUALITY.md).
Przy wdrożeniu UI można wykorzystać lokalny
[verify-ola](../../verify-ola/SKILL.md), po przeczytaniu jego aktualnych instrukcji.
Sprawdź, czy konfiguracja testu przechwytuje formularze, zanim go uruchomisz.
Produkcja wysyła bezpośrednio do n8n; testy nie mogą tego robić.
Nie przenoś dawnych wyników testów jako wyniku nowego produktu.

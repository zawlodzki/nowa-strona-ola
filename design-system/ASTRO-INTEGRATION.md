# Implementacja strony docelowej w Astro

## Jedno źródło

Importuj `Layout3a` w szablonie. Layout importuje `src/design-system/global.css`,
który importuje aktywne tokeny oraz istniejący self-host Switzer. Nie importuj
równocześnie `src/styles/global.css`, `sections.css`, dawnych CSS Wonderful
lub stosu CSS wszystkich mockupów. Font jest preloadowany raz, plik bez subsetu.

Nazwy `ao-*` dotyczą systemu. Kompozycja szablonu ma własną klasę np.
`article-template`; scoped CSS Astro stosować do geometrii konkretnej strony.
Komponenty przyjmujące HTML attrs przekazują class/rest na korzeń.
Produkcja i chroniony preview mają importować te same komponenty i renderery.

## Mapa mockupów na szablony

| Referencja                         | Docelowy szablon  | Wspólne komponenty                                                                                       | Pozostaje w szablonie                                 |
| ---------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| cherry-white.html                  | Homepage3a        | Header, Hero(home), Section, ContentCard/BookCover, Carousel, ReviewCard, SplitPanel, Newsletter, Footer | Partnerzy, wyniki, kadr hero, układ „O mnie”          |
| about-3a.html                      | About3a           | Header, Hero(about), Section, SplitPanel, Newsletter, Footer                                             | Edukacja/dyplom, story, wartości, linki autora        |
| consultation-3a.html               | Consultation3a    | Header z lokalnymi linkami, Hero(service), Section, FaqItem, ReviewCard, Footer                          | Proces, zakres, cena, dostępność, zapis na wydarzenie |
| ebook-3a.html                      | Ebook3a           | Header z lokalnymi linkami, Hero(product), BookCover, ContentCard, Carousel, FaqItem, Footer             | Spis rozdziałów, próbka, oferta, detale produktu      |
| ebooks-3a.html                     | EbookCollection3a | Header, Breadcrumbs, ContentCard/BookCover, Newsletter, Footer                                           | Filtrowanie kategorii i lista produktów               |
| blog-3a.html / blog-3a-page-2.html | BlogCollection3a  | Header, Breadcrumbs, ContentCard, Pagination, Newsletter, Footer                                         | Najnowszy wpis, dane paginacji, dwie kolumny          |
| article-3a.html                    | Article3a         | Header, Breadcrumbs, Prose CSS, ContentCard/Carousel, FaqItem, Newsletter, Footer                        | Portable Text, TOC, sidebar, autor, share, źródła     |

Dwie strony bloga używają jednego szablonu, nie dwóch komponentów ze skopiowanym
HTML. Front „Suplementy w PCOS” jest jasny z motywem Cel/Dawka/Decyzja,
identyczny na homepage, w kolekcji i produkcie. Motywy innych e-booków to dane
produktu oraz kontrolowany renderer; nie losować ich na każdym użyciu.

## Treści i Sanity

- Ustawienia wspólne: referencje do navigation, footer, autora, newslettera.
  Kolejność globalna: E-booki, Konsultacje, O mnie, Blog; CTA Newsletter.
- Header przyjmuje te same linki w globalnym menu; landing przekazuje własne
  kotwice i CTA produktu/usługi. Footer zawsze ma globalne cele.
- Modele nie przechowują hexów, gapów ani dowolnego CSS. Warianty znaczące:
  rodzaj hero, wariant powierzchni, rodzaj karty, front produktu.
- Istniejące schematy/TypeGen/GROQ pozostają punktem wyjścia. Nowe potrzeby
  bloków określają dokumenty HOMEPAGE/BLOG/EBOOK/CONSULTATION-CMS-CONFIG.
  W tej sesji nie zmieniono ani nie opublikowano schematów czy Content Lake.
- Każdy nowy typ sekcji nadal wymaga schematu, renderer HTML, serializer Markdown
  i przykładu. Primitives/Section nie są samodzielnie nowymi typami CMS.
- PL/EN to odrębne dokumenty i rzeczywiste trasy. Komponenty dostają lokalizowane
  etykiety i URL; nie dopowiadać polskiej treści pod /en/.
- Formularz w slocie Newsletter ma docelowo używać Worker → Queues → n8n.
  Pokazywanie przycisku nie oznacza integracji. Zgody analityczne nadal z c15t.

## Kolejność migracji

1. Wpiąć Layout3a i Header/Footer w pierwszy szablon z rzeczywistymi ustawieniami.
2. Przenieść homepage 3a: wspólne komponenty, pozostała geometria scoped,
   oficjalne portrety i partnerzy z potwierdzonych danych. Już tu rozszerzyć
   współdzielone modele produktów/usługi/opinii/formularza potrzebne homepage,
   bez odkładania danych Sanity do zakończenia wszystkich szablonów.
3. About, konsultacja i ebook: ten sam shell, kontrolowane kompozycje, ceny
   oraz CTA zgodne z ustaleniami. Nie uruchamiać demonstracyjnych ofert.
4. Kolekcje i artykuł: dane Sanity, rzeczywista paginacja/filtrowanie,
   Portable Text, powiązania, HTML/Markdown z jednego źródła.
5. Usunąć dawną prezentację `src/ui`/`src/sections` dopiero po zastąpieniu
   jej zastosowań. Zachować natywny trigger/fokus Safari istniejącego dialogu
   tam, gdzie dialog pozostaje potrzebny.
6. Wyszukać ostatnie `--wf-*`, usunąć aliasy migracyjne z JSON po zakończeniu.
   Archiwalne propozycje mogą zachować własne zamrożone tokeny.
7. Odebrać całe szablony względem mockupów: 1440/390/320, obie palety,
   klawiatura, 200% zoom, bez JS, reduced motion, axe i pełne verify.
   Czytnik i fizyczne urządzenie uzupełniają testy automatyczne.

Każdy pakiet obejmuje schema/walidację, GROQ publiczny i preview, TypeGen,
mappery, renderer Astro, serializer Markdown i przykład nowych sekcji,
a następnie import treści/mediów do szkiców oraz odbiór edycji w podglądzie.
Najpierw wykonać import bez zapisu i kopię obecnych danych; zachować istniejące
zmiany redaktorów. Preview `page` ma obecnie osobny shell, który także wymaga
migracji. Fixture nie jest dowodem zapisu do CMS. Szczegółowa checklista,
kolejność siedmiu pakietów i kryteria: etap 4a
[planu](../docs/IMPLEMENTATION-PLAN.md). Publikacja pozostaje osobnym działaniem.

## Stan wykonania

Wykonane: tokeny, globalne style, 21 wspólnych komponentów, Layout3a, katalog
oraz pakiet 1: publiczny i preview shell `SiteShell3a`/`Layout3a`, szablon
`Homepage3a`, model `ebook` i rozszerzenia zależne. Pakiet 2: `About3a`
(`/o-mnie/`, `/en/about/`). Pakiet 3: `Consultation3a` (`/konsultacje/`,
`/en/consultations/`) na istniejących typach sekcji z kontrolowanymi
wariantami; `SiteShell3a` przyjmuje osobne `footerLinks`, gdy nagłówek ma
lokalne kotwice. Pakiet 4: `Ebook3a` z dokumentu `ebook` + `ebookLanding`
`cherry3a` (`/ebooki/<slug>/`, `/en/ebooks/<slug>/`); karty homepage używają
`ebookPath`. Aktywny runtime nie importuje archiwum Wonderful. `/ui/`, blog
i kolekcja e-booków nadal czekają na kolejne pakiety albo wcześniejszy Layout.
Serializery sekcji są w kodzie; import Content Lake i publikacja pozostają
otwarte. CSS szablonów 3a jest scoped per widok. Stan testów: PROGRESS.md.

Przy budowaniu API i CSS użyto zasad [Astro: styling](https://docs.astro.build/en/guides/styling/),
[TypeScript](https://docs.astro.build/en/guides/typescript/) i
[skrypty komponentów](https://docs.astro.build/en/guides/client-side-scripts/):
CSS przez layout, typowane Props/HTMLAttributes, lokalne skrypty deduplikowane.

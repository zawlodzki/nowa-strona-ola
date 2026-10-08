# Artykuł blogowy 3a — konfiguracja Sanity

Data: 2026-10-06. Status: instrukcja przyszłego wdrożenia, bez zmian schematów,
Content Lake i produkcyjnego szablonu Astro.

[Mockup artykułu](../mockups/homepage/article-3a.html) rozszerza
[homepage 3a](../mockups/homepage/cherry-white.html). Treść i daty artykułu są
przykładowe, nie stanowią zaakceptowanego wpisu. Obraz główny wykorzystuje istniejącą
wygenerowaną fotografię kulinarną; docelowy obraz wybiera redaktor.

## Układ i odpowiedzialność

Navbar i stopka pochodzą ze wspólnych ustawień serwisu. Breadcrumb generuje kod:
Strona główna → Blog → tytuł artykułu. Na desktopie spis treści znajduje się po
lewej, rich text pośrodku, a CTA newslettera po prawej. Spis i CTA pozostają przy
czytelniku podczas przewijania tekstu. Przy mniejszej szerokości CTA przechodzi pod
tekst; na mobile spis jest rozwijaną listą przed tekstem. Następnie: autor,
trzy e-booki powiązane tematycznie, pełny zapis do newslettera i stopka.

Układ jest stałym szablonem, bez page buildera dla jego elementów strukturalnych.
Redaktor zarządza treścią i referencjami, bez ustawiania CSS, szerokości kolumn,
kolorów ani pozycji elementów. Widoczność obu miejsc newslettera jest wspólna.

## Pola istniejące

| Element              | Istniejące pole                           | Konfiguracja redakcyjna                                                                                                                    |
| -------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Język i adres        | `article.language`, `slug`, `translation` | PL pod `/blog/slug/`, osobny dokument EN pod `/en/blog/slug/`. Bez polskiego fallbacku.                                                    |
| Tytuł i wprowadzenie | `article.title`, `lead`                   | Jeden H1 w szablonie. Lead jako tekst, bez ręcznych `<br>`.                                                                                |
| Obraz główny         | `article.image` (`mediaObject`)           | Obraz, alt i podpis; wykorzystać hotspot/kadr.                                                                                             |
| Publikacja i edycja  | `article.publishedAt`, `updatedAt`        | Wprowadzić rzeczywiste daty. Aktualizacja nie wcześniej niż publikacja. Nie używać `_updatedAt` jako daty merytorycznej edycji.            |
| Autor                | `article.authors[]` → `author`            | Wybrać istniejącą Aleksandrę. Biogram, rola i portret z dokumentu autora, bez kopii w artykule. Przy wielu autorach pokazać każdy biogram. |
| Kategorie            | `article.categories[]` → `category`       | W przykładzie PCOS; referencje w tym samym języku.                                                                                         |
| Treść                | `article.body` (`articleBody`)            | Akapity, H2/H3, bold, italic, linki, listy, cytaty, obrazy, wyróżnienia, tabele i CTA.                                                     |
| Źródła i SEO         | `article.sources[]`, `seo`                | Prawdziwe źródła dla wpisów merytorycznych; metadata zgodne z treścią.                                                                     |

Schematy: [artykuł](../studio/schema-types/documents/article.ts),
[autor](../studio/schema-types/documents/author.ts),
[Portable Text](../studio/schema-types/objects/article-body.ts),
[media](../studio/schema-types/objects/media-object.ts).
Nie należy wprowadzać ponownie tych pól pod innymi nazwami.

## Spis treści z H2

Nie dodawać osobnego pola „Spis treści” w CMS. Generować go podczas budowania
HTML i chronionego podglądu z bloków `body` o `style: "h2"`. Nie obejmować H3,
boxu autora, nagłówków e-booków ani newslettera. Link i nagłówek muszą korzystać
z tej samej funkcji identyfikatora, najlepiej stabilnego `_key` bloku, np.
`section-<key>`. Identyfikatory muszą być unikalne także przy powtórzonym tekście.
Etykietę linku składać ze wszystkich spanów nagłówka, bez znaczników formatowania.

Wygenerowana lista i kotwice mają działać bez JS; JavaScript nie jest źródłem
spisu. Przy braku H2 pomijać cały panel spisu. Markdown zachowuje tę samą hierarchię
nagłówków; nie musi powielać nawigacji spisu. Makieta zawiera pięć odnośników
odpowiadających pięciu H2 treści; jest statycznym HTML, bez połączenia z Portable Text.

## Pola do dodania — jeszcze nie istnieją

### Trzy e-booki

Szczegółowy kontrakt osobnej kolekcji i landingu opisuje
[instrukcja e-booków 3a](EBOOK-CMS-CONFIG-3A.md). Wspólny dokument `ebook`
pozostaje źródłem ceny, statusu i treści produktu; adres generować ze sluga
zgodnie z tą instrukcją, zamiast utrzymywać osobny adres szczegółów.

Współdzielić przyszły model produktu z
[instrukcją homepage](HOMEPAGE-CMS-CONFIG.md#e-booki--wartości-do-przyszłego-modelu-produktu).
Proponowana nazwa dokumentu: `ebook`; pola: język, powiązanie tłumaczenia, tytuł,
slug, temat, opis karty, okładka z alt, dostępność, adres szczegółów, cena brutto
liczbowa i waluta. Cena wszystkich sześciu koncepcji ustalona przez użytkownika:
**97 PLN brutto**. Dostępność nadal do potwierdzenia. Nie tworzyć fikcyjnego zakupu.

Dodać `article.relatedEbooks[]`: uporządkowana tablica referencji do `ebook`,
walidacja `required`, dokładnie 3 pozycje, unikalność referencji, zgodność języka
oraz publikacja wszystkich produktów przed publikacją artykułu. Temat wybrać
redakcyjnie; nie losować produktów podczas builda. Walidacja klienta i zaufanego
builda powinna odrzucać brakujące lub nieopublikowane referencje, zamiast pokazywać
puste karty. Pole `article.related` oznacza powiązane wpisy, nie e-booki.

Przykład dla tej makiety, w kolejności:

1. Suplementy w PCOS.
2. Badania, które mają sens.
3. Szczupła, a jednak PCOS.

Okładki są obecnie HTML/CSS. Wybrać eksport do plików lub kontrolowany renderer
z instrukcji homepage; nie wklejać nieistniejących URL-i. Cena, status i adres
z jednego dokumentu produktu dla homepage i artykułu.

### Newsletter

Proponowane `siteSettings.blogNewsletter` jako obiekt wspólnej konfiguracji
PL/EN: `enabled`, `sidebarTitle`, `sidebarLead`, `sidebarActionLabel`,
`title`, `lead`, `form` (referencja do istniejącego dokumentu `form`). To propozycja,
a nie obecna struktura. Dostosować do sposobu lokalizacji ustawień serwisu.

CTA w prawej kolumnie prowadzi do `#newsletter`; nie dodawać drugiego formularza
z konkurującymi identyfikatorami i stanami. Dolny formularz korzysta z konfiguracji
`form`: e-mail, zgoda, polityka prywatności i komunikaty. Ta sama referencja ma
obsługiwać newsletter na homepage. Bez newslettera pomijać oba miejsca i link
z nawigacji; szablon wykorzystuje odzyskaną szerokość.

Dane zgłoszeń nie trafiają do Sanity ani statycznego buildu. Docelowe wysyłanie:
Worker → Queues → n8n, zgodnie z etapem 6. Nie testować n8n w ramach makiet.
Treść zgody i polityki wymaga finalnej konfiguracji. W makiecie formularz tylko
waliduje dane lokalnie; bez JS jest wyłączony, a po poprawnej walidacji informuje,
że nic nie wysłano ani nie zapisano.

## Kolejność wdrożenia

- [ ] Dodać model `ebook`, referencje artykułu i wspólną konfigurację newslettera.
- [ ] Rozszerzyć GROQ, TypeGen, typy i mappery; nie pobierać szkiców w produkcji.
- [ ] Przenieść szablon do wspólnych komponentów Astro dla statycznej strony i SSR.
- [ ] Zapewnić renderery HTML, serializery Markdown i przykłady dla rozszerzeń;
      nieznany blok Portable Text ma blokować build.
- [ ] Utworzyć szkic artykułu z rzeczywistą treścią, datami, mediami i trzema
      opublikowanymi produktami. Nie publikować przykładowego tekstu makiety.
- [ ] Zweryfikować H2, powtarzające się nagłówki, brak H2, długie tytuły,
      wielu autorów, brak EN, wyłączony newsletter i niedostępne produkty.
- [ ] Zweryfikować zgodność HTML/Markdown, BlogPosting i BreadcrumbList z treścią,
      desktop/mobile, 320 px, klawiaturę, zoom 200%, reduced motion i brak JS.
- [ ] Uruchomić `npm run verify`, sprawdzić chroniony podgląd; publikacja na zlecenie.

Żaden z powyższych kroków CMS nie jest zakończony przez sam zapis instrukcji.

## Rekomendacje po połowie tekstu i udostępnianie — 2026-10-06

Na polecenie użytkownika dodano interakcje inspirowane
[artykułem a16z](https://a16z.com/state-of-markets-ii/), w estetyce 3a.

**Sprawdź również:** panel w prawej kolumnie pod CTA newslettera pojawia się, gdy środek widoku
przekroczy 50% wysokości rich textu. Hero, autor, e-booki i stopka nie wchodzą do
obliczenia. Powrót przed próg chowa panel, o ile nie zawiera on fokusu klawiatury.
Panel pokazuje dwa linki i pozwala zwinąć listę; bez JS jest zwykłym blokiem pod
CTA newslettera. W makiecie są to przykładowe tytuły prowadzące do ekranów objaśniających.

Wykorzystać istniejące `article.related[]` — nie dodawać drugiego pola rekomendacji.
Do tego panelu wybierać dwie pierwsze pozycje w kolejności redakcyjnej. Istniejący
limit czterech powiązanych wpisów może pozostać dla innych miejsc; dodać walidację
unikalności, wykluczenie bieżącego artykułu i kontrolę opublikowanych referencji
w tym samym języku. Przy mniej niż dwóch dostępnych wpisach pominąć panel,
zamiast tworzyć sztuczne linki. Nie publikować tytułów demonstracyjnych z makiety.

**Udostępnij:** przycisk pod spisem H2 otwiera panel przy najechaniu myszą,
kliknięciu, dotyku i Enter/Space. Cztery stałe opcje: kopiuj link, wyślij mailem,
Facebook i WhatsApp. Escape, zamknięcie i kliknięcie poza panelem działają;
po zamknięciu z klawiatury fokus wraca na przycisk. To niemodalny popover, który
nie blokuje czytania artykułu. Nie dodawać konfiguracji sieci społecznościowych
ani SDK w CMS. Produkcyjny URL pobierać z canonical wygenerowanego dla artykułu,
bez hash, parametrów kampanii, adresu preview i sekretów sesji. Nie włączać
udostępniania chronionych szkiców. Makieta udostępnia swój bieżący adres bez query
lub hash; lokalny adres jest dostępny wyłącznie na tym komputerze.

Kopiowanie potwierdzać dopiero po sukcesie Clipboard API. Przy braku uprawnień
pokazać zaznaczony URL do ręcznego skopiowania. Linki społecznościowe otwierają
narzędzie udostępniania dopiero po akcji czytelnika, bez wcześniejszych połączeń
z Facebook/WhatsApp. E-mail otwiera klienta poczty; nic nie jest wysyłane automatycznie.

- [ ] Przenieść interakcje do szablonu Astro, wykorzystując opublikowane dane
      `related[]` i canonical. Sprawdzić próg, brak referencji i chroniony preview.

## FAQ między e-bookami a newsletterem — 2026-10-06

Dodano cztery przykładowe pytania o przygotowanie do konsultacji. Natywne
`details/summary` działa bez JavaScriptu i z klawiatury; pierwsza odpowiedź jest
rozwinięta. FAQ jest poza rich textem, nie trafia do lewego spisu ani obliczenia
połowy tekstu. Kolejność szablonu: e-booki → FAQ → newsletter.

Proponowane nowe pole `article.faq` typu istniejącego `faqSection`:
`title`, `lead`, `items[].question`, `items[].answer`. Nie tworzyć równoległego
modelu pytań. To pole jeszcze nie jest wdrożone w artykule; istniejący typ
[FAQ](../studio/schema-types/blocks/page-sections.ts) i
[renderer Astro](../src/sections/FaqSection.astro) są punktem wyjścia.
Pole opcjonalne: bez danych pominąć sekcję i jej dane strukturalne. Zachować
istniejące walidacje typu oraz dodać kontrolę powtarzających się pytań.

Mockup zawiera `FAQPage` JSON-LD dokładnie z czterema widocznymi pytaniami
oraz pełnymi odpowiedziami. Docelowo HTML, Markdown i JSON-LD generować z tego
samego `article.faq`, bez ręcznie powielanych odpowiedzi. Dane włączyć do grafu
strony i artykułu, z identyfikatorami z canonical; nie tworzyć drugiego sprzecznego
grafu. Przykładowe odpowiedzi wymagają akceptacji redakcyjnej przed publikacją.

`FAQPage` opisuje znaczenie treści zgodnie ze
[Schema.org](https://schema.org/FAQPage). Nie traktować go jako obietnicy efektu
SEO: Google usunął wyświetlanie FAQ rich results od 7 maja 2026,
[aktualizacja dokumentacji](https://developers.google.com/search/updates#may-2026).
Wartość tej sekcji to dostępne odpowiedzi na pytania czytelniczek; makieta nadal
ma `noindex`.

- [ ] Dodać `article.faq`, GROQ/TypeGen/mapper, wspólny renderer oraz serializer
      Markdown i JSON-LD; zweryfikować brak FAQ i zgodność pełnych odpowiedzi.

### Położenie rekomendacji — korekta 2026-10-06

Na najnowsze polecenie użytkownika „Sprawdź również” pozostaje w prawej kolumnie,
pod CTA newslettera. Nie jest nakładką fixed. Desktop ma wspólną kolumnę sticky,
z przewijaniem wewnętrznym przy niskim oknie. Na tabletach i telefonach oba bloki
są w przepływie dokumentu pod tekstem i autorem. Próg 50% pozostaje; pojawienie się
panelu zajmuje miejsce w kolumnie i nie przykrywa artykułu, e-booków, FAQ ani stopki.
To obowiązująca korekta wcześniejszego wzorca z a16z.

## Kolekcja wszystkich wpisów — 07.10.2026

Na polecenie użytkownika wykonano [indeks bloga 3a](../mockups/homepage/blog-3a.html)
i [stronę 2](../mockups/homepage/blog-3a-page-2.html): najnowszy artykuł nad
siatką dwóch kolumn, paginacja pod siatką, następnie pełny newsletter.
Na mobile jedna kolumna. Pierwsza podstrona ma wyróżniony wpis i sześć kart,
druga cztery starsze karty. Wszystkie 11 pozycji są przykładami; żadne dane
kolekcji nie zostały pobrane ani zapisane w Sanity. Najnowszy wpis prowadzi
do istniejącego mockupu artykułu, pozostałe do ekranów objaśniających.
Paginacja działa zwykłymi odnośnikami również bez JS.

### Docelowy wybór i paginacja

Wykorzystać istniejące `article` i `PUBLISHED_ARTICLES_QUERY`, z filtrem języka
i wykluczeniem szkiców. Ustalić stabilne sortowanie `publishedAt desc, _id asc`
na wypadek identycznych dat. Nie używać flagi `featured` jako zamiennika
najnowszego wpisu: wybrana karta to pierwszy artykuł po sortowaniu.

Najpierw wybrać jeden najnowszy wpis, następnie usunąć go z paginowanej listy.
Wyróżniony wpis renderować tylko na stronie 1, bez powtarzania w siatce.
Pozostałe artykuły dzielić według istniejącego `ARTICLES_PER_PAGE = 6`.
Dla `n > 0`: liczba stron `max(1, ceil((n - 1) / 6))`.
Dla strony `p` wybrać zakres pozostałej kolekcji `[(p - 1) * 6, p * 6)`.
Jeden wpis oznacza tylko wyróżnienie; zerowa kolekcja oznacza komunikat pustej
listy bez paginacji. Nie generować pustych ani nieistniejących numerów stron.
Paginację pominąć przy jednej stronie; skrajne akcje nie są klikalne ani
fokusowalne. Bieżąca strona ma `aria-current="page"`.

Wykorzystać istniejące `blogPath`: PL `/blog/strona/2/`, EN `/en/blog/page/2/`.
Podgląd i produkcja korzystają ze wspólnego szablonu, bez polskiego fallbacku
pod EN. Karty korzystają z tytułu, leadu, daty, obrazu z alt/hotspot
oraz referencji kategorii. Bez osobnej kolekcji duplikującej artykuły.

Tytuł „Blog. Po Twojemu.” i lead są propozycją do oceny. W pakiecie 6 (08.10.2026)
schemat kodu ma lokalizowany obiekt `siteSettings.blogIndex` (`title`, `lead`,
`note`, etykiety listy/paginacji, komunikaty pustych stanów, SEO) oraz
`siteSettings.blogNewsletter` (`enabled`, `title`, `lead`, `form`, pola sidebaru
na pakiet 7). To wdrożenie schematu i fixture’ów, nie konfiguracja Content Lake
ani zatwierdzona treść publikacji. Navbar/stopka z ustawień serwisu.
HTML i Markdown korzystają z tego samego wyboru artykułów i linków stron.

- [x] Wykonać samodzielny HTML/CSS 3a z kolekcją, paginacją i newsletterem.
- [x] Połączyć lokalne menu 3a i breadcrumb artykułu z indeksem.
- [ ] Zatwierdzić copy indeksu oraz rzeczywiste tytuły, daty i obrazy wpisów.
- [x] Wdrożyć wybór najnowszego wpisu i paginację bez duplikatu w Astro/GROQ
      (kod i fixture; bez zapisu do Content Lake).
- [x] Dodać konfigurację indeksu/newslettera, TypeGen, mappery i Markdown
      (schemat w repo; Content Lake nie był zapisywany).
- [x] Sprawdzić docelowe kolekcje 0/1/7/8/13/14 wpisów, remisy dat i brak EN
      (testy jednostkowe).

Makieta nie zamyka zapisu do Content Lake ani odbioru Studio/preview.

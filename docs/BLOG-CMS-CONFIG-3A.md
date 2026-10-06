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

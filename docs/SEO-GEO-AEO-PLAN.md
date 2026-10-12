# Plan infrastruktury SEO, GEO i AEO — aleksandraolesiewicz.com

Data: 2026-10-11. Status: **plan do akceptacji**. Kod, schemat Sanity
i konfiguracja Cloudflare nie zostały jeszcze zmienione.
Rozwija §6 i etap 5 [planu wdrożenia](IMPLEMENTATION-PLAN.md). Stan prac:
[PROGRESS.md](PROGRESS.md). Równolegle trwa wdrożenie
[GTM i c15t](GTM-C15T-DEPLOYMENT-PLAN.md).

Źródła planu:

1. Inwentaryzacja repo z 11.10.2026: kod, schematy Studio, buildy i testy.
2. Analiza publicznego HTML zawlodzki.pl z 11.10.2026. Webflow MCP nie był
   autoryzowany, więc analiza nie objęła ustawień projektu. Surowe pliki
   zostały w katalogu tymczasowym sesji, nie w repo.
3. Przegląd dokumentacji Astro 7, Sanity, Cloudflare i Google
   (stan na październik 2026). Linki są w sekcji 12.

## 1. Zasady

- **Jedno źródło danych.** HTML, Markdown, JSON-LD, sitemap, RSS i llms.txt
  powstają z tego samego wyniku GROQ w jednym buildzie. Nic nie jest
  wpisywane ręcznie w kod strony ani wstrzykiwane przez GTM.
- **Schema opisuje tylko widoczną treść.** Bez fikcyjnych ocen, ofert
  niedostępnych produktów i encji bez pokrycia na stronie.
- **Jeden graf encji ze stałymi `@id`.** Encje wspólne (osoba, serwis, blog)
  mają jeden kanoniczny identyfikator. Każda strona odwołuje się do nich
  przez `@id`.
- **SEO, GEO i AEO mają wspólne podstawy:** indeksowalny statyczny HTML,
  jasna struktura, wiarygodny autor, źródła i daty. „Hacki GEO” pomijamy.
  Badania z 2026 roku nie pokazują mierzalnego wpływu samego llms.txt ani
  JSON-LD na cytowania w AI. Pliki pomocnicze traktujemy jako tani dodatek,
  nie jako dźwignię.
- **YMYL (treści zdrowotne).** Zaufanie wymaga prawdziwych kwalifikacji,
  źródeł, dat przeglądu, granic porady i braku obietnic skuteczności.
  Kontynuacja [E-E-A-T „O mnie”](ABOUT-EEAT-3A.md).
- **Build ma blokować błędy.** Niespójny graf, zły canonical, pętla
  przekierowań albo adres `/en/` przy wyłączonym EN zatrzymują publikację.

## 2. Stan wyjściowy (11.10.2026)

| Obszar           | Stan                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JSON-LD          | Częściowy. Każdy widok buduje własny blok. Nie ma wspólnego buildera ani encji `WebSite` i `Person` z `@id`. Adresy są względne. Strona główna, kontakt i odstąpienie nie mają JSON-LD.                     |
| Meta             | Są tylko `title` i `description`. Brakuje canonical, Open Graph i obrazu OG. Każda strona ma na sztywno `noindex,nofollow` (`Layout3a.astro`) i nie ma przełącznika produkcyjnego.                          |
| Sanity           | Obiekt `seo` ma tylko title i description. Nie ma encji osoby ani tożsamości serwisu. Typ `redirect` istnieje, ale nic go nie czyta. Artykuł ma `publishedAt`, `updatedAt`, `sources` i `faq` (dobra baza). |
| Pliki odkrywania | Jest sitemap: bez `lastmod`, z demonstracyjnymi stronami, origin wpisany w kodzie. Brakuje robots.txt, RSS, llms.txt i tras `.md`. Serializery Markdown istnieją, ale korzystają z nich tylko testy.        |
| Infrastruktura   | `astro.config` nie ma `site`. Nie ma strony 404, choć wrangler jej oczekuje. Nie ma `public/_headers` ani `_redirects`. Brakuje walidacji JSON-LD i linków w buildzie.                                      |
| GTM              | Ładuje się po zgodzie i pod flagą. Nie wpływa na HTML ani na treść SEO.                                                                                                                                     |

Szczegóły wraz z plikami i liniami są w notatce w [postępie](PROGRESS.md).

## 3. Wnioski z zawlodzki.pl

### Przenosimy (rozwiązania)

1. **Wspólny graf na każdej stronie.** Encje osoby i serwisu mają stałe `@id`,
   a węzły strony tylko się do nich odwołują.
2. **FAQPage z tej samej tablicy co widoczne FAQ, słowo w słowo.** Węzeł ma
   `isPartOf` → `#webpage` i `about` → usługa lub produkt.
3. **Usługa z prawdziwą ofertą.** Cena widoczna w treści, w opisie meta
   i w `Offer`. Do tego `audience`, `serviceOutput` (co klientka dostaje)
   i `termsOfService`.
4. **Bogaty opis produktu edukacyjnego.** Wzorem `Course` z zawlodzki.pl:
   `about`, autor i zawartość. Dla e-booka: rozdziały i materiały.
5. **llms.txt z sekcją „Kluczowe fakty”.** Każdy link ma jednozdaniowy opis,
   a plik ma `X-Robots-Tag: noindex`.
6. **Szablon „answer-first”.** Pierwszy akapit odpowiada na pytanie z tytułu.
   Fakty mają datę i źródło. Nagłówki H2 mają formę pytań. Na końcu jest
   sekcja „skąd te informacje”. Autor ma widoczny biogram.
7. **Encja omawianego tematu z `sameAs`.** Na zawlodzki.pl to Pipedrive
   z linkiem do Wikipedii. U Oli: PMOS (PCOS), insulinooporność.
8. **Opinie bez znaczników `Review` i `AggregateRating`.**
9. **ProfilePage dla „O mnie”**, z `mainEntity` → `#person`.

### Nie przenosimy (obejścia Webflow)

- Statyczny skrypt grafu wklejony w custom code i ręcznie pisane embedy
  w szablonach. U nas graf generuje kod z danych.
- Spis treści budowany w JS po stronie klienta. U nas identyfikatory
  nagłówków i spis treści powstają w buildzie i działają bez JS.
- Mikrodane obok JSON-LD na listach i w FAQ. U nas wyłącznie JSON-LD.
- `@id` artykułu równy gołemu adresowi, bez węzła `WebPage`. U nas
  `#article` i osobny `#webpage`.
- Masowo identyczne `dateModified` po publikacji. U nas data aktualizacji
  pochodzi z pola redakcyjnego, a nie z `_updatedAt`.
- Sitemap jako `application/rss+xml`, paginacja w query stringu
  z canonical na stronę 1, blokada `webflow.io`, nagłówki cache Webflow.

### Unikamy (błędy zauważone na zawlodzki.pl)

- Sitemap pomija 15 opublikowanych wpisów. U nas powstaje z tego samego
  zapytania co strony.
- `/search` jest indeksowalne, a `SearchAction` niczego już nie daje.
  Nie dodajemy ani jednego, ani drugiego.
- Wygasła oferta PreOrder z `validThrough` w przeszłości nadal widnieje
  na stronie. Walidacja dat ofert ma działać w buildzie.
- Widoczna jest tylko data publikacji, a `dateModified` jest inna.
  U nas „Zaktualizowano” pokazujemy zawsze, gdy data aktualizacji
  różni się od daty publikacji.
- „Powiązane wpisy” nie są powiązane z tematem. U nas wynikają
  z referencji i kategorii.
- Błędny link w stopce, brak H1 na dwóch stronach, `og:type=website`
  na artykułach, różne opisy w meta, OG i schema, brak polityki dla botów AI.

## 4. Graf encji

### Schemat `@id`

Baza: `https://aleksandraolesiewicz.com`. Ukośnik końcowy jak w obecnych
trasach. Identyfikatory nie zależą od języka. Po włączeniu EN strony
angielskie odwołują się do tych samych encji wspólnych.

| Encja                    | `@id`                                    | Typ                                                          | Gdzie pełna definicja                         |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| Aleksandra Olesiewicz    | `/#person`                               | `Person`                                                     | blok wspólny na każdej stronie                |
| Serwis                   | `/#website`                              | `WebSite` (publisher → `#person`)                            | blok wspólny na każdej stronie                |
| Sprzedawca (opcjonalnie) | `/#seller`                               | `Organization` (legalName, vatID, address)                   | blok wspólny; tylko gdy dane są w regulaminie |
| Strona                   | `{url}#webpage`                          | `WebPage` / `ProfilePage` / `ContactPage` / `CollectionPage` | każda strona                                  |
| Okruszki                 | `{url}#breadcrumb`                       | `BreadcrumbList`                                             | każda strona poza główną                      |
| FAQ                      | `{url}#faq`                              | `FAQPage`                                                    | tylko przy widocznym FAQ                      |
| Obraz główny             | `{url}#primaryimage`                     | `ImageObject`                                                | gdy strona ma obraz główny                    |
| Konsultacja              | `/konsultacje/#service`                  | `Service`                                                    | `/konsultacje/`                               |
| Oferta konsultacji       | `/konsultacje/#offer`                    | `Offer`                                                      | `/konsultacje/`                               |
| E-book                   | `/ebooki/{slug}/#product`                | `["Product","Book"]`                                         | landing e-booka                               |
| Blog                     | `/blog/#blog`                            | `Blog`                                                       | `/blog/`; inne strony tylko odwołują          |
| Artykuł                  | `/blog/{slug}/#article`                  | `BlogPosting`                                                | strona artykułu                               |
| Temat (kategoria)        | `/blog/kategoria/{slug}/#topic`          | `DefinedTerm` z `sameAs` (Wikidata), w `/blog/#topics`       | strona kategorii                              |
| Inny autor (przyszłość)  | `/o-mnie/` lub `/autorzy/{slug}/#person` | `Person`                                                     | dopiero gdy pojawi się drugi autor            |

`Person` jest wydawcą i marką. To serwis eksperta, a nie firmy.
Organizację dodajemy wyłącznie jako sprzedawcę (`Offer.seller`), jeśli
dane działalności są publiczne w regulaminie i stopce. To decyzja D2.

### Węzeł `Person` (`/#person`)

Dane pochodzą z dokumentu `author` oznaczonego jako właścicielka serwisu
(sekcja 5). Pełny węzeł trafia na każdą stronę, bo jest generowany i nie
wymaga utrzymania. Dzięki temu każda strona jest kompletna dla parsera.

- `name`, `alternateName` („Ola”), `url` → `/o-mnie/`, `image` (portret
  z Sanity CDN, 1:1 i 4:3), `description` (z biogramu, ta sama treść co
  widoczna), `jobTitle` („Dietetyczka kliniczna”).
- `hasOccupation`: `Occupation` z nazwą i `occupationalCategory`
  (ISCO-08 2265 _Dietitians and nutritionists_).
- `alumniOf`: `CollegeOrUniversity` (Śląski Uniwersytet Medyczny,
  z `sameAs` do strony uczelni i Wikidaty).
- `hasCredential`: `EducationalOccupationalCredential` dla dyplomu
  (`credentialCategory: "degree"`, `recognizedBy` → uczelnia). Tylko gdy
  dyplom jest pokazany lub opisany na „O mnie” (D5).
- `knowsAbout`: tematy z dokumentów kategorii (PMOS (PCOS), insulinooporność,
  perimenopauza), z `sameAs` do Wikidaty. To ta sama lista co
  specjalizacje widoczne na stronie.
- `sameAs`: tylko profile prowadzone przez Olę. Obecnie Instagram,
  Facebook i TikTok. Kandydaci do decyzji D4: LinkedIn, ZnanyLekarz.
- Bez `interactionStatistic` z liczbą obserwujących Instagram. Google
  dopuszcza tę właściwość tylko dla serwisu, na którym leży profil.

### Grafy stron

| Strona                                   | Węzły                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                      | `WebPage` (`about` → `#person`, `isPartOf` → `#website`, `primaryImageOfPage`). Dodatkowo `significantLink` do konsultacji, e-booków i bloga. Bez `ItemList`, chyba że sekcja e-booków jest pełną listą.                                                                                                                                                                                                                                            |
| `/o-mnie/`                               | `ProfilePage` (`mainEntity` → `#person`, `dateModified`, `#breadcrumb`). Węzeł osoby może zyskać `makesOffer` → `#offer` i produkty.                                                                                                                                                                                                                                                                                                                |
| `/konsultacje/`                          | `WebPage` (`about` → `#service`), `Service` (`provider` → `#person`, `serviceType`, `areaServed: PL`, `availableChannel` → `ServiceChannel` z adresem rezerwacji, `audience`, `serviceOutput`, `termsOfService` → regulamin), `Offer` (450 PLN, `availability` z `bookingStatus`, `seller`), `FAQPage`, `BreadcrumbList`.                                                                                                                           |
| `/ebooki/`, `/ebooki/kategoria/{topic}/` | `CollectionPage` + `ItemList` (absolutne `url`, `item` → `#product`), `BreadcrumbList`.                                                                                                                                                                                                                                                                                                                                                             |
| `/ebooki/{slug}/`                        | `WebPage` (`about` → `#product`), `["Product","Book"]`: `name`, `bookFormat: EBook`, `author` i `publisher` → `#person`, `inLanguage`, `image` (okładka), `about` → tematy, `numberOfPages` (gdy znane), `hasPart` (rozdziały). `Offer` tylko przy `availability = available` i aktywnym `checkoutUrl`. „Wkrótce dostępny” nie ma `Offer`, `PreOrder` ani `OutOfStock`. Do tego `FAQPage` i `BreadcrumbList`.                                       |
| `/blog/`, paginacja, kategorie           | `CollectionPage` (`about` → `#blog` lub `#topic`) + `ItemList` widocznych wpisów. Każda strona paginacji ma własny canonical. Na `/blog/` jest pełny węzeł `Blog`.                                                                                                                                                                                                                                                                                  |
| `/blog/{slug}/`                          | `WebPage` (`reviewedBy` i `lastReviewed` tylko przy rzeczywistym przeglądzie), `BlogPosting` (`isPartOf` → `#blog`, `mainEntityOfPage` → `#webpage`, `author` i `publisher` → `#person`, `image`, `datePublished`, `dateModified` = `updatedAt` albo `publishedAt`, `inLanguage`, `about` → `#topic`, `mentions` → powiązane e-booki i usługa, `citation` → źródła jako `CreativeWork` z `url`, `wordCount`). Do tego `BreadcrumbList` i `FAQPage`. |
| `/kontakt/`                              | `ContactPage` (`mainEntity` → `#person`), na osobie `contactPoint` z e-mailem widocznym na stronie.                                                                                                                                                                                                                                                                                                                                                 |
| Strony prawne, `/odstapienie/`           | `WebPage` jak obecnie w `map-legal.ts`, ale z poprawnym `#website` z bloku wspólnego. Do tego `BreadcrumbList`.                                                                                                                                                                                                                                                                                                                                     |

Celowo pomijamy:

- `MedicalWebPage` i `MedicalCondition` jako typy strony. Strona nie jest
  recenzowaną przez lekarza informacją medyczną.
- `SearchAction`, `speakable` (beta, tylko angielski w USA), `HowTo`
  (wycofany) i `Review` dla własnych usług (nie kwalifikuje się).
- `LocalBusiness`, dopóki nie ma stacjonarnych konsultacji pod publicznym
  adresem (D6).

FAQ: rich results dla FAQ wyłączono 07.05.2026 dla wszystkich serwisów.
Znaczniki zostają, bo odzwierciedlają widoczną treść i nie szkodzą.

## 5. Sanity: zmiany modelu

Zgodnie z [AGENTS.md](../AGENTS.md): znaczenie danych, etykiety, walidacja,
podglądy, referencje dla treści wspólnych, bez dowolnego CSS. Każda zmiana
wymaga TypeGen, aktualizacji GROQ i mapperów, przykładów oraz testów.

| Dokument / obiekt    | Zmiana                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteSettings`       | `siteOwner` → referencja `author` (źródło `#person`). `seller`: opcjonalny obiekt `legalName`, `vatId`, `address` (D2). `defaultOgImage`. `titleTemplate` (np. `%s — Aleksandra Olesiewicz`) z walidacją. `socialLinks` przenosimy do osoby (`sameAs`), a `social-profiles.ts` zostaje tylko fixture’em.                                                 |
| `author`             | `sameAs[]` (https, walidacja domen profili), `knowsAbout[]` → referencje `category`, `credentials[]` (nazwa, kategoria, instytucja + URL, rok, `isPublic`), `occupation` (nazwa + kod ISCO z listy), `shortBio` (do biogramu przy artykułach i do JSON-LD), `portrait` z wymaganym alt. Pola `educationInstitution` i `educationProgram` zostają.        |
| `seo` (obiekt)       | `ogImage` (mediaObject, 1200×630, wymagany alt), `noindex` (boolean, z opisem skutków). Ostrzeżenia zamiast błędów: title powyżej 60 znaków, description poza zakresem 70–160. Canonical bez override. Generuje go kod, a wyjątki obsługuje `redirect`.                                                                                                  |
| `article`            | `updatedAt` pozostaje jedynym źródłem `dateModified`. Zmieniamy opis: „ustaw przy merytorycznej zmianie treści”. Nowe pola: `keyTakeaways[]` (2–5 zdań, renderowane jako „W skrócie”), `reviewedBy` → `author` i `lastReviewedAt` (D5), `about` → `category` (domyślnie kategorie). Walidacja: przy treściach zdrowotnych ostrzeżenie o braku `sources`. |
| `category`           | `sameAs[]` (Wikidata, Wikipedia PL), `definition` (1–2 zdania na stronie kategorii i w `DefinedTerm.description`).                                                                                                                                                                                                                                       |
| `service`            | `serviceType`, `channel` (online / stacjonarnie z listy), `audience` (tekst), `deliverables[]` (`serviceOutput`), `termsUrl` → referencja `legalPage`. Cena i czas trwania już istnieją.                                                                                                                                                                 |
| `ebook`              | `numberOfPages` (opcjonalne), `publishedAt` (data udostępnienia). Walidacja: `availability = available` wymaga `checkoutUrl` i ceny. `lowestPrice30Days` pozostaje tylko w treści (Omnibus).                                                                                                                                                             |
| `redirect`           | Bez zmian pól. Dochodzi konsument: generator `_redirects` (sekcja 6). Do tego akcja dokumentu w Studio: przy zmianie sluga opublikowanej strony proponuje utworzenie przekierowania.                                                                                                                                                                     |
| Slugi                | Unikalność per typ i język. Regex dla małych liter ASCII z transliteracją polskich znaków. Zarezerwowane segmenty: `blog`, `ebooki`, `en`, `kategoria`, `strona`, `og`, `llms`. Część już jest w `page`.                                                                                                                                                 |
| Podgląd SEO w Studio | Własny inspektor albo widok dokumentu: snippet SERP i karta OG, liczone tą samą funkcją fallbacków co frontend (współdzielony pakiet w `packages/`). `sanity-plugin-seo-pane` nie deklaruje wsparcia dla Studio 6, więc go nie używamy.                                                                                                                  |

Później i opcjonalnie (nie blokuje startu):

- **Agent Actions „Transform”** (plan Free: 1000 kredytów miesięcznie).
  Szkice alt i meta description zapisywane jako szkic do akceptacji
  człowieka. Bez automatycznej publikacji, bo to treści YMYL.
- **Dataset Embeddings**: „powiązane wpisy” i podpowiedzi linków
  wewnętrznych liczone w buildzie. Limit Free to 500 zapytań
  semantycznych miesięcznie, więc z cache. Do czasu większej liczby
  wpisów wystarczą kategorie i referencje.
- **Sanity Function**: ostrzeżenie, że artykuł zdrowotny nie ma źródeł
  albo daty przeglądu.

Content Releases i zaplanowane szkice nie są w planie Free. Nie zakładamy ich.

## 6. Astro i Cloudflare: implementacja

### Konfiguracja i adresy

- `astro.config.mjs`: `site: "https://aleksandraolesiewicz.com"`,
  `trailingSlash: "always"` (zgodnie z obecnymi trasami i
  `auto-trailing-slash` w wranglerze), `build.format: "directory"`.
- `src/lib/seo/urls.ts`: jedyne miejsce budowy adresów absolutnych,
  canonical, `@id` i adresów `.md`. Usuwa origin wpisany w
  `sitemap.xml.ts` i `map-legal.ts`.
- Indeksacja zależna od środowiska. Zmienna builda
  `SITE_INDEXING=production` występuje tylko w workflow produkcji.
  Domyślnie i na stagingu: `noindex`, robots.txt z `Disallow: /`
  i `X-Robots-Tag: noindex` w generowanym `_headers`. Test buildu sprawdza
  obie konfiguracje. Zastępuje to obecne `noindex = true` na sztywno.

### Head (`SeoHead.astro` w slocie `head` Layout3a)

- `title` z szablonu, `description` (seo → lead lub opis → domyślne),
  `link rel=canonical` (absolutny, do siebie).
- `meta robots`: index albo noindex z `seo.noindex` i środowiska, plus
  `max-image-preview:large`.
- Open Graph: `og:type` (`article` dla wpisów i `website` dla reszty),
  `og:url`, `og:title`, `og:description`, `og:image` z wymiarami i alt,
  `og:locale=pl_PL`, `og:site_name`. Dla artykułów dodatkowo
  `article:published_time`, `article:modified_time` i `article:author`.
- `twitter:card=summary_large_image`.
- `link rel=alternate type=text/markdown` do `.md` oraz
  `type=application/rss+xml` do `/blog/rss.xml` (adres absolutny).
- `hreflang` tylko przez `enabledLocales` i powiązane tłumaczenia.
  Obecnie brak, co pilnuje istniejący `check-disabled-locales`.
- `html lang="pl-PL"` (obecnie `pl`).

### JSON-LD

- `src/lib/seo/graph.ts`: builder typowany przez `schema-dts`. Każdy typ
  strony ma funkcję `buildXGraph(data, site)`, a blok wspólny pochodzi
  z `buildSiteEntities(settings)`. Na stronie jest jeden
  `<script type="application/ld+json">` z jednym `@graph`.
- Widoki 3a przestają budować JSON-LD inline. Mappery (`map-article.ts`,
  `map-ebook.ts` i inne) zwracają dane, a graf składa builder.
- Teksty FAQ, ceny i daty pochodzą z tych samych pól co widoczny HTML.
  Test porównuje je z wyrenderowanym DOM-em.

### Obrazy OG

- Endpoint statyczny `/og/{typ}/{slug}.png`: satori + `@resvg/resvg-js`
  w buildzie, z layoutem i tokenami 3a. Pole `seo.ogImage` nadpisuje
  wygenerowany obraz.
- Satori nie przyjmuje WOFF2. Potrzebny jest plik OTF lub TTF Switzer
  z oficjalnej paczki Fontshare, bez subsetowania. Przed wdrożeniem trzeba
  sprawdzić, czy licencja ITF FFL pozwala osadzać font w generowanych
  obrazach (D7). Jeśli nie, robimy szablon bez Switzer albo obrazy ręczne.

### Pliki odkrywania

| Plik             | Implementacja                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/sitemap.xml`   | Własny endpoint (zostaje). `lastmod` = `updatedAt ?? publishedAt` (artykuły) lub data dokumentu redakcyjnego. Wyklucza `noindex`, strony demonstracyjne (`/tylko-pl/`, `/warsztat/`, `/wdrozenie/`, `/ui/`, `/design-system/`, `/static/`) i `.md`. Dodaje kategorie bloga i e-booków. Paginację dodajemy tylko, jeśli zostanie indeksowalna.                                                                                    |
| `/robots.txt`    | Endpoint Astro zależny od środowiska. Produkcja: `Sitemap:`, jawne `Content-Signal` i reguły dla botów według D1. Staging: `Disallow: /`. Nie włączamy managed robots.txt w Cloudflare.                                                                                                                                                                                                                                          |
| `/blog/rss.xml`  | `@astrojs/rss`, pełny lead, kategorie, obraz, autor. Bez pełnej treści, dopóki nie zapadnie decyzja redakcyjna.                                                                                                                                                                                                                                                                                                                  |
| `/llms.txt`      | Generowany z Sanity: H1, jednozdaniowe podsumowanie, sekcje Konsultacje, E-booki, Blog (według kategorii), O mnie i kontakt. Każdy link ma jedno zdanie opisu. Sekcja „Kluczowe fakty” (kwalifikacje, specjalizacje, cena i forma konsultacji, granica porady) zawiera tylko dane widoczne na stronach.                                                                                                                          |
| `/llms-full.txt` | Opcjonalny. Konkatenacja `.md` stron kluczowych (bez archiwum bloga, jeśli przekroczy rozsądny rozmiar).                                                                                                                                                                                                                                                                                                                         |
| `{ścieżka}.md`   | Endpointy statyczne `[slug].md.ts` dla wszystkich typów stron, z istniejących serializerów. Na stronie głównej `/index.md`. Nie trafiają do sitemap.                                                                                                                                                                                                                                                                             |
| `/404.html`      | `src/pages/404.astro` w 3a, `noindex`, linki do sekcji głównych. Wrangler już ma `not_found_handling: 404-page`.                                                                                                                                                                                                                                                                                                                 |
| `_headers`       | Generowany w buildzie (limit 100 reguł, wzorce z gwiazdką). `/*.md`: `Content-Type: text/markdown; charset=utf-8`, `X-Robots-Tag: noindex`. Ten sam nagłówek dla `/llms*.txt`, `/og/*` i `Cache-Control` dla zasobów z hashem. Nagłówka `Link: rel=canonical` dla każdego `.md` nie da się zmieścić w limicie reguł. Do sprawdzenia, czy placeholdery Workers Static Assets obsługują `/:path.md`. Jeśli nie, zostaje `noindex`. |
| `_redirects`     | Generowany z dokumentów `redirect` (limit 2000 reguł statycznych). Check w buildzie odrzuca pętle, łańcuchy, przekierowania na adres 404 i kolizje z istniejącą trasą.                                                                                                                                                                                                                                                           |

### Szablon treści pod AEO

Zmiany w komponentach 3a, bez nowych tokenów:

- **Artykuł:**
  - widoczne okruszki;
  - „W skrócie” z `keyTakeaways` pod leadem;
  - lead jako bezpośrednia odpowiedź (wytyczna redakcyjna i opis pola);
  - daty „Opublikowano” i „Zaktualizowano”, czas czytania;
  - biogram autora z linkiem do „O mnie” i kwalifikacją;
  - przy przeglądzie: „Sprawdziła: …, data”;
  - źródła z datą dostępu, sekcja „Skąd te informacje”;
  - zastrzeżenie, że treść nie zastępuje porady lekarskiej;
  - spis treści i identyfikatory nagłówków z buildu.
- **Konsultacja i e-book:** cena, forma, czas, „dla kogo”, „co dostajesz”
  i FAQ widoczne w HTML, bez JS. To one zasilają `Offer`, `serviceOutput`
  i `hasPart`.
- **Wytyczne redakcyjne** (do [BLOG-PUBLISHING.md](BLOG-PUBLISHING.md)):
  H2 w formie pytań, jedno twierdzenie na akapit, liczby z jednostką
  i źródłem, linki wewnętrzne przez referencje w treści, brak obietnic
  efektów zdrowotnych.

### Kontrole w buildzie i testy

Rozszerzenie `scripts/check-build.mjs` albo nowy `scripts/check-seo.mjs`
w `npm run test:build` i `test:content-lake`. Skrypt sprawdza:

- **JSON-LD:** każda strona indeksowalna ma dokładnie jeden blok, który się
  parsuje. Adresy i `@id` są absolutne i z właściwym originem. Każde
  odwołanie `{"@id"}` rozwiązuje się w obrębie strony. Nie ma `Offer`
  przy niedostępnym produkcie, a cena `Offer` równa się cenie widocznej.
  Pytania i odpowiedzi FAQ zgadzają się z DOM-em.
- **Canonical i sitemap:** canonical wskazuje stronę samą na siebie.
  Każda strona indeksowalna jest w sitemapie, a sitemap nie zawiera
  `noindex`, 404 ani przekierowań.
- **Head:** unikalne `title` i `description`, jedno H1, obecny `og:image`,
  alternatywa `.md` istnieje i nie jest pusta.
- **Linki:** linki wewnętrzne w `dist/` nie prowadzą do 404. Przekierowania
  bez pętli i łańcuchów.
- **Środowisko:** w trybie stagingu wszystko jest `noindex`. W trybie
  produkcji nic poza wyjątkami nie jest `noindex`.

Testy jednostkowe: buildery grafu per typ strony (asercje strukturalne,
nie snapshot całości) i fallbacki SEO. E2E: obecność head i JSON-LD na
reprezentatywnych stronach, 404, `Content-Type` dla `.md`. Zewnętrzna
walidacja ręczna przed startem: Rich Results Test i Schema Markup Validator
dla każdego typu strony.

### Cloudflare i wyszukiwarki

- `www` → apex 301 (reguła już zaplanowana), HTTPS i HSTS.
- **Markdown for Agents** pozostaje wyłączone. Mamy własne `.md`,
  a funkcja ustawia domyślne `ai-train=yes`, sprzeczne z D1.
- **AI Crawl Control:** po starcie sprawdzić, czy przełączniki
  w panelu i domyślne ustawienia z września 2026 nie przeczą robots.txt
  i nie blokują Googlebota ani Bingbota.
- **IndexNow:** krok w GitHub Actions po udanym wdrożeniu produkcji,
  wysyłający zmienione adresy. Plik klucza jest zasobem statycznym.
  Crawler Hints zostaje wyłączone, bo dla w pełni statycznego serwisu
  wysyłka po deployu jest dokładniejsza.
- **Search Console i Bing Webmaster Tools:** weryfikacja przez DNS,
  bez meta tagu i bez GTM. Zgłoszenie sitemap. Raporty AI obu narzędzi
  (Google: wyświetlenia w funkcjach AI od czerwca 2026; Bing: AI Performance).

### Styk z GTM i c15t

- GTM nie wstrzykuje treści, meta, canonical ani JSON-LD. Wszystko SEO
  jest w statycznym HTML.
- Panel zgód nie może zasłaniać treści przy pierwszym renderze
  (ryzyko CLS i interstitial). Treść ma być widoczna bez JS.
- GTM ładuje się po zgodzie i z minimalną liczbą tagów, bez Custom HTML.
  Główne ryzyko dla INP. Lighthouse mierzymy osobno przed tagami
  i po ich uruchomieniu (etap 7).
- GA4: osobna grupa kanałów „AI assistants” dla odesłań z chatgpt.com,
  perplexity.ai, claude.ai, gemini.google.com i copilot.microsoft.com
  oraz `utm_source=chatgpt.com`. Konfiguracja w GA4, nie w kodzie strony.
  Bez danych formularzy.
- Nie dodajemy `<ClientRouter/>` (View Transitions) ani `clientPrerender`.
  Komplikują pageview, zgody i prefetch. Wystarczy CSS
  `@view-transition` i prefetch „hover”, jeśli zajdzie potrzeba.

## 7. Poza stroną: spójność encji

- Identyczne imię i nazwisko, portret, rola i opis na stronie, Instagramie,
  Facebooku, TikToku i w profilach z D4. Bio profili linkuje do apex.
- Wikidata tylko przy realnej rozpoznawalności, bo samodzielnie utworzony
  wpis grozi usunięciem. Panel wiedzy można przejąć dopiero, gdy Google
  go pokaże.
- Wzmianki zewnętrzne (wywiady, gościnne artykuły, podcasty) trafiają do
  osoby jako `subjectOf` tylko wtedy, gdy są pokazane na stronie
  (np. sekcja „W mediach”, przyszła).

## 8. Etapy wdrożenia

Etapy SEO‑1 do SEO‑3 da się zrobić lokalnie bez decyzji D1–D7. Wartości
zależne od decyzji pozostają w fixture’ach i flagach.

### SEO‑1: fundament adresów i head

- [x] `site`, `trailingSlash: "always"`, `build.format: "directory"`
      (także konfiguracje fixture i symulacji); adresy w
      `src/lib/seo/site.ts` zamiast `urls.ts`. Origin usunięty z sitemap
      i `map-legal.ts` (11.10.2026).
- [x] Przełącznik `SITE_INDEXING=production` (domyślnie noindex);
      `check-seo.mjs` sprawdzony na buildzie domyślnym i produkcyjnym.
      Workflow nie ustawia jeszcze zmiennej — robi się to dopiero przy
      starcie produkcji (SEO‑6).
- [x] `SeoHead.astro`: canonical, robots (`max-image-preview:large`),
      Open Graph z obrazem 1200×630, `article:*`, Twitter, `lang="pl-PL"`.
      Alternate `.md` i RSS dopiero w SEO‑3, gdy pliki będą istnieć.
- [x] `404.astro` (3a, zawsze noindex, bez canonical).
- [x] Unikalne `<title>` kategorii i paginacji bloga oraz kategorii
      e-booków (wykryte przez kontrolę).

Odbiór: build stagingu w całości `noindex`. Build produkcji ma poprawny
canonical i OG na każdej stronie z sitemap.

### SEO‑2: graf JSON-LD

- [x] `graph.ts` (własne typy zamiast `schema-dts`: brak zysku w runtime,
      a zgodność pilnuje kontrola buildu), blok wspólny `#person`
      i `#website` na każdej stronie. Źródło osoby tymczasowo w
      `src/content/site-identity.ts` do czasu `siteOwner` (SEO‑4).
- [x] Grafy w `src/lib/seo/page-graphs.ts` dla wszystkich typów stron.
      JSON-LD inline usunięty z widoków i mapperów.
- [x] `check-seo.mjs` (w `test:build` i `test:content-lake`) oraz
      `tests/unit/seo.test.ts`.
- [ ] Ręczna walidacja Rich Results Test i Schema Markup Validator.

Odstępstwa od sekcji 4 przyjęte przy wdrożeniu: `BreadcrumbList` tylko tam,
gdzie okruszki są widoczne (artykuł, kolekcje bloga i e-booków, strony
prawne), więc konsultacja, landing e-booka, „O mnie” i kontakt go nie mają.
Usługa nie ma jeszcze `serviceType`, `audience`, `serviceOutput`
i `termsOfService` (pola SEO‑4). Artykuł nie ma jeszcze `about`,
`mentions` i `wordCount`. Obraz osoby i domyślny obraz OG to prawdziwe
zdjęcie z „O mnie”; portrety Hero i Kontakt pochodzą z image_gen.

Odbiór: każda strona przechodzi kontrolę grafu w buildzie. Rich Results
Test i Schema Markup Validator bez błędów dla każdego typu (ręcznie,
z wynikiem w postępie).

### SEO‑3: pliki odkrywania i Markdown

- [x] Spis stron `src/lib/seo/inventory.ts` (jedno źródło dla sitemap,
      `.md`, llms.txt i RSS; bez stron demo, pustych kategorii
      i paginacji). Trasy `.md` przez `[...mdPath].md.ts` z istniejących
      serializerów, linki i kotwice absolutne. `<link rel="alternate">`
      do `.md` i RSS w head (11.10.2026).
- [x] Sitemap z `lastmod` z dat redakcyjnych (artykuły, kolekcje bloga,
      strony prawne), robots.txt według D1, RSS 2.0 z leadem (własny
      generator zamiast `@astrojs/rss`), llms.txt z „Kluczowymi faktami”
      i linkami do `.md`. `llms-full.txt` nie powstał (D8 otwarte).
- [x] `_headers` i `_redirects` z `[edgeFile].ts`: `.md` →
      `text/markdown`, `noindex`, canonical przez `:splat` (sprawdzone
      w `wrangler dev`); przekierowania z Sanity z kontrolą pętli,
      łańcuchów, duplikatów, kolizji ze stroną i brakujących celów.
- [x] Kontrole w `check-seo.mjs`: sitemap ↔ robots ↔ alternate `.md`,
      linki wewnętrzne, robots.txt, `_headers`, llms.txt, RSS.
- [x] Linki wewnętrzne: 5 kart e-booków bez landingu prowadziło do 404
      (decyzja 11.10.2026: landingi powstaną w Sanity). Późniejsze
      `check-seo` (36 stron) przeszło bez niedziałających linków.
- Puste kategorie bloga i e-booków dostają `noindex` i nie trafiają do
  spisu stron.

Odbiór: HTML i Markdown zgodne. Sitemap = zbiór stron indeksowalnych.
Wycofany dokument znika z HTML, `.md`, sitemap, RSS i llms.txt po
publikacji.

### SEO‑4: Sanity

- [x] Schemat (11.10.2026): `seo.ogImage`, `seo.noindex`, ostrzeżenie
      opisu < 70 znaków (limity 60/160 pozostały błędami);
      `siteSettings.siteOwner`, `seller`, `defaultOgImage`;
      `author.occupationCode`, `sameAs[]`, `knowsAbout[]` → `category`,
      `credentials[]` z `isPublic`; `category.sameAs[]` (tylko
      Wikidata/Wikipedia); `article.keyTakeaways[]`, `reviewedBy`,
      `lastReviewedAt` (razem albo wcale), opis `updatedAt`;
      `service.serviceType`, `channel`, `audience`, `deliverables[]`,
      `terms` → `legalPage`; `ebook.numberOfPages`, `publishedAt`.
      `sanity schema validate`: 0 błędów, 0 ostrzeżeń.
- [x] GROQ i TypeGen (`seoFields`, `siteOwner`, `seller`, `sameAs`,
      pola usługi i e-booka, `noindex` w kartach). Frontend:
      `site-data.ts` (osoba i sprzedawca z Sanity z fallbackiem do stałych),
      `page-seo.ts` (`seo.noindex` i `seo.ogImage` w każdym wrapperze),
      spis stron pomija ukryte dokumenty, pola usługi w `Service`,
      tematy artykułu jako `about` z `sameAs`, przegląd w `WebPage`
      tylko gdy wypełniony, `DefinedTerm` na stronach kategorii,
      `numberOfPages` i `datePublished` e-booka.
- [x] Podgląd w Studio: `studio/components/SeoPreviewInput.tsx` (wynik
      wyszukiwania, liczniki 60/160, adres, stan „ukryta”). Ostrzeżenie
      przy zmianie adresu opublikowanego dokumentu bez przekierowania
      (walidacja sluga) zamiast osobnej akcji dokumentu.
- [ ] Bez zmian: `titleTemplate` (D3 otwarte), `shortBio`, `definition`
      kategorii (używany istniejący `description`), osobne pole `about`
      artykułu (używane kategorie), wyświetlanie „W skrócie” (SEO‑5).
- [ ] Uzupełnienie danych w Sanity, rejestracja schematu i deploy Studio.
      Wyłącznie na osobne polecenie użytkownika. Wartości do wpisania:
      [konfiguracja CMS](HOMEPAGE-CMS-CONFIG.md).

Odbiór: redaktorka widzi snippet i ostrzeżenia. Brak pól nie psuje buildu,
bo fallbacki są pokryte testami.

### SEO‑5: szablon treści AEO i obrazy OG

- [x] Artykuł 3a (11.10.2026): panel „W skrócie” z `keyTakeaways`, czas
      czytania przy datach, „Sprawdziła merytorycznie” tylko przy
      wypełnionym przeglądzie, zastrzeżenie edukacyjne pod treścią
      (copy do akceptacji); te same elementy w Markdown; `wordCount`
      i `timeRequired` w `BlogPosting`. Okruszki, daty, spis treści,
      źródła i biogram istniały wcześniej. Sprawdzone: 1440 px, 320 px,
      tryb ciemny, zoom 200% (CSS) bez przepełnienia; E2E artykułu
      i bloga 15/15 (z axe). Reduced motion: nowe elementy bez animacji.
- [x] Obrazy OG (decyzja D7 11.10.2026: generowane): `src/lib/seo/og-card.ts`
      (satori 0.33.5 + @resvg/resvg-js 2.6.2, devDependencies), endpoint
      `/og/[...ogPath].png` dla każdej strony ze spisu, 1200×630, tło
      `--ao-primary`, tekst `--ao-on-primary`, etykieta w matcha, wordmark
      z konturów Gambarino, tytuł w Switzer Bold. Oficjalne statyczne OTF
      (Regular, Semibold, Bold) z paczki Fontshare w
      `src/assets/fonts/switzer/og/`, czytane z dysku, nie trafiają do
      `dist/`. Kolejność `og:image`: `seo.ogImage` → karta → obraz strony →
      domyślny; JSON-LD zachowuje prawdziwe zdjęcie strony. `check-seo`
      sprawdza, czy karta jest PNG 1200×630.
- [x] Wytyczne redakcyjne w `BLOG-PUBLISHING.md` (sekcja „Pisanie pod
      wyszukiwarki i odpowiedzi AI”).

### SEO‑6: start produkcji i pomiar

- [ ] robots.txt według D1, sprawdzenie AI Crawl Control.
- [ ] Search Console i Bing (DNS), sitemap, IndexNow w Actions.
- [ ] Zdjęcie `noindex` wyłącznie z gotowej produkcji (etap 7 planu).
- [ ] Grupa kanałów AI w GA4. Przegląd po 4 i 12 tygodniach: indeksacja,
      zapytania, raporty AI, Core Web Vitals.

## 9. Decyzje do podjęcia (właścicielka / użytkownik)

| ID  | Decyzja                                                                                                                                                                                                              | Propozycja                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Polityka botów AI: wyszukiwanie/odpowiedzi (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `Claude-User`) oraz trening (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`); `Content-Signal`. | Wyszukiwanie i `ai-input` dozwolone. Trening do decyzji; domyślnie `ai-train=no`, bo marka buduje widoczność, nie zbiór uczący. |
| D2  | Czy pokazywać sprzedawcę (działalność, NIP, adres) jako `Organization` w schema.                                                                                                                                     | Tak, jeśli te dane i tak są w regulaminie i stopce (wymóg B2C). Inaczej `seller` → `#person`.                                   |
| D3  | Marka w tytułach.                                                                                                                                                                                                    | `{temat} — Aleksandra Olesiewicz`; na stronie głównej odwrotnie.                                                                |
| D4  | Lista profili w `sameAs` (LinkedIn, ZnanyLekarz, inne).                                                                                                                                                              | Tylko profile aktywne i prowadzone przez Olę.                                                                                   |
| D5  | Pokazanie dyplomu i kwalifikacji (`hasCredential`) oraz zasady przeglądu treści (`reviewedBy`, `lastReviewed`).                                                                                                      | Dyplom pokazany na „O mnie”. Przegląd deklarujemy tylko przy faktycznym procesie z datą.                                        |
| D6  | Konsultacje stacjonarne pod publicznym adresem (`LocalBusiness`, profil firmy w Google).                                                                                                                             | Dopóki konsultacje są online: bez `LocalBusiness`.                                                                              |
| D7  | Obrazy OG generowane w buildzie (wymaga potwierdzenia licencji Switzer) czy przygotowywane ręcznie.                                                                                                                  | Generowane, z możliwością nadpisania w Sanity.                                                                                  |
| D8  | RSS z pełną treścią czy z leadem; `llms-full.txt` tak czy nie.                                                                                                                                                       | RSS z leadem; `llms-full.txt` dla stron kluczowych.                                                                             |

### Decyzje użytkownika, 11.10.2026

- **D1 — przyjęte:** boty wyszukiwania i odpowiedzi dozwolone
  (`search=yes`, `ai-input=yes`), trening modeli zabroniony
  (`ai-train=no`; `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`
  z `Disallow: /`). Wdrożenie w robots.txt w SEO‑3, zgodność z AI Crawl
  Control w SEO‑6.
- **D2 — przyjęte:** sprzedawca w schema. Wdrożone: `/#seller`
  (`Organization`, Wellbiz sp. z o.o.: adres, NIP jako `taxID`, KRS
  i REGON jako `identifier`, e-mail) z `src/content/site-legal.ts`;
  `Offer.seller` konsultacji i e-booków → `#seller`. Wydawcą serwisu
  pozostaje `#person`. Telefon pominięty, bo nie jest widoczny na stronie.
- **D4 — przyjęte:** `sameAs` = Instagram, Facebook, TikTok (bez zmian).
- **D5 — zastąpione 11.10.2026 (niżej):** pierwotnie: na razie nie pokazujemy dyplomu; bez `hasCredential`.
  Przeglądu treści nie deklarujemy (`reviewedBy`, `lastReviewed`), dopóki
  nie zapadnie osobna decyzja. Doprecyzowanie użytkownika: decyzja
  dotyczy tylko schema — zdjęcie z dyplomem i podpis na „O mnie” zostają.
- **D7 — licencja zweryfikowana:** ITF FFL 2.0 (17.08.2026, plik
  `src/assets/fonts/switzer/FFL.txt`) pozwala używać fontu w „Digital
  Images” i „Social Media” (§01). Wygenerowane obrazy nie są „Derivative
  Work” (definicje). Warunki: (1) zakaz konwersji formatu i subsetowania
  (§02), a satori nie czyta WOFF2. Potrzebne są oficjalne pliki OTF/TTF
  z paczki Fontshare, nie konwersja `Switzer-Variable.woff2`. Satori nie
  obsługuje fontów zmiennych, więc trzeba statycznych odmian (np. Regular
  i Semibold). (2) Pliki fontu tylko w buildzie: nie trafiają do `dist/`
  ani nie są serwowane osobom trzecim (§02). (3) Nie udostępniamy fontu
  jako narzędzia do generowania treści przez innych (§02). Przy dodaniu
  plików sprawdzić zawartość oficjalnej paczki i zapisać źródło w
  `src/assets/fonts/switzer/README.md`. Wybór „generowane czy ręczne”
  pozostaje propozycją (generowane). **Decyzja 11.10.2026: generowane;
  wdrożone w SEO‑5.**
- **D3 — przyjęte (11.10.2026):** `{temat} | Aleksandra Olesiewicz`,
  na stronie głównej marka pierwsza. Do wdrożenia (`titleTemplate`).
- **D5 — zmienione (11.10.2026):** Ola sama weryfikuje artykuły;
  `reviewedBy` i `lastReviewedAt` wypełniane przy faktycznym przeglądzie.
  Dyplom (licencjat 2025) i sześć szkoleń są publiczne na „O mnie”
  i w `hasCredential` (`educationalLevel`, `recognizedBy` z wydziałem;
  szkolenia prowadzone przez osoby bez `recognizedBy`). Wcześniejsze
  miejsca pracy w `alumniOf`. Wdrożone w kodzie, bez Content Lake.
- **D6 — przyjęte (11.10.2026):** tylko online, bez `LocalBusiness`.
- **D8 — przyjęte (11.10.2026):** RSS z pełną treścią (zmiana względem
  wdrożonego leadu), `llms-full.txt` dla kluczowych stron. Kod rozszerzenia
  z 12.10.2026 ma lokalny odbiór PASS opisany w postępie; bez publikacji.
- Wszystkie decyzje D1–D8 rozstrzygnięte.

## 10. Ryzyka i czego nie robić

- `_updatedAt` jako `dateModified` i podbijanie dat bez zmian treści.
- `Offer`, `PreOrder` lub `OutOfStock` dla e-booków „Wkrótce dostępny”.
  Obecny `Product` z `OutOfStock` w buildzie wymaga poprawy w SEO‑2.
- `Review` i `AggregateRating` dla opinii o własnych usługach.
- Odmienna treść dla botów (cloaking). Indeksowalne duplikaty `.md`.
  Markdown for Agents obok własnych `.md`.
- Treści generowane przez AI publikowane bez przeglądu człowieka
  (wytyczne Google z 01.10.2026: tytuły, opisy, alt i dane
  strukturalne wymagają przeglądu).
- Blokowanie Googlebota lub Bingbota przełącznikami botów w Cloudflare.
- Dane z formularzy w jakimkolwiek narzędziu SEO lub AI (reguła AGENTS.md).
- Oczekiwanie gwarancji: markup, llms.txt i `.md` nie gwarantują pozycji,
  rich results ani cytowań.

## 11. Niepewne, do sprawdzenia przed wdrożeniem

- Placeholdery w `_headers` Workers Static Assets dla wzorca `/:path.md`.
- Licencja Switzer (ITF FFL) dla obrazów OG i format pliku dla satori.
- Domyślne blokady botów AI w Cloudflare od 15.09.2026 (znane z wtórnych
  źródeł) i stan strefy apex.
- Obsługa `delta::changedAny()` w filtrach Sanity Functions, jeśli
  powstanie funkcja pilnująca dat.
- Plan Sanity organizacji (Content Releases, AI Assist) w sanity.io/manage.

## 12. Źródła

- Google: [funkcje AI w wyszukiwarce](https://developers.google.com/search/docs/appearance/ai-features),
  [galeria danych strukturalnych](https://developers.google.com/search/docs/appearance/structured-data/search-gallery),
  [ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page),
  [treści generowane przez AI](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content),
  [raporty AI w Search Console](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports),
  [helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
- Astro: [Astro 7](https://astro.build/blog/astro-7/),
  [prefetch](https://docs.astro.build/en/guides/prefetch/),
  [sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/).
- Sanity: [Functions](https://www.sanity.io/docs/functions/functions-introduction),
  [Dataset Embeddings](https://www.sanity.io/docs/content-lake/dataset-embeddings),
  [AI Assist](https://www.sanity.io/docs/studio/install-and-configure-sanity-ai-assist),
  [cennik](https://www.sanity.io/pricing).
- Cloudflare: [_headers](https://developers.cloudflare.com/workers/static-assets/headers/),
  [_redirects](https://developers.cloudflare.com/workers/static-assets/redirects/),
  [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/),
  [AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/),
  [Content Signals](https://blog.cloudflare.com/content-signals-policy/),
  [Crawler Hints](https://developers.cloudflare.com/cache/about/crawler-hints).
- Dowody skuteczności GEO: [badanie Ahrefs o schema i cytowaniach](https://www.techwyse.com/news/ai-search/schema-markup-ai-citations-ahrefs-study),
  [adopcja i ruch llms.txt](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/).
- Referencja: publiczny HTML [zawlodzki.pl](https://www.zawlodzki.pl/) z 11.10.2026.

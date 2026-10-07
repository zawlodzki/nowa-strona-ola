# Plan wdrożenia i przygotowania repozytorium

Zatwierdzony: 2026-09-12. Aktualizacja kolejności prac: 2026-10-07.
Realizacja etapami w wielu sesjach; bieżący zakres opisuje etap 4a.
Stan wykonania: [PROGRESS.md](PROGRESS.md). Instrukcje: [AGENTS.md](../AGENTS.md).
Weryfikacja kodu: [CODE-QUALITY.md](CODE-QUALITY.md).
Próba komponentów: [UI-SPIKE-RESULTS.md](UI-SPIKE-RESULTS.md).

## 1. Cel i granice

Nowa marka i domena: strona główna, landing page’e, blog i formularze leadowe.
Fundament techniczny i demonstracyjne szablony są wykonane. Od 07.10.2026
docelowy kierunek to zatwierdzony 3a; pełna migracja stron i finalnych treści
pozostaje otwarta. Zakładamy kilku redaktorów
i do około 500 stron łącznie w PL/EN. Demonstracja pozostaje chroniona i poza
indeksem do przygotowania konfiguracji produkcyjnej.

Referencje funkcjonalne i redakcyjne:

- [Landing page](https://www.zawlodzki.pl/szkolenie-i-wdrozenie-pipedrive)
- [Indeks bloga](https://www.zawlodzki.pl/blog)

Podany pierwotnie link do artykułu powtarzał landing page. Nie jest zweryfikowanym
wzorcem artykułu. Układ artykułu opieramy na lokalnym design systemie.

## 2. Dokumentacja i Git

Git z gałęzią main i prywatnym repozytorium GitHub. .gitignore obejmuje sekrety,
lokalne środowiska, zależności, wyniki budowania,
cache i pliki systemowe; pliki .env.example pozostają dostępne do wersjonowania.

Ten plik przechowuje specyfikację i checklisty. PROGRESS.md przechowuje etap,
wykonane zadania, weryfikację, decyzje, blokady i następny krok. README wskazuje
plan, postęp i design system; komendy pojawiają się dopiero po ich sprawdzeniu.
AGENTS.md zawiera tylko aktualne instrukcje projektu, bez ogólnych porad dla modeli,
odniesień do GitButlera i nieaktualnych informacji o nieustalonym hostingu.

## 3. Architektura i hosting

Stos: Astro + TypeScript, Sanity, Cloudflare Workers Static Assets i GitHub
Actions. Jedno repo zawiera frontend, Studio i backend integracyjny.

| Obszar            | Rozwiązanie                                               |
| ----------------- | --------------------------------------------------------- |
| Publiczna strona  | Statyczny HTML i Markdown generowane podczas builda Astro |
| CMS i obrazy      | Sanity Content Lake i CDN obrazów                         |
| Panel redakcyjny  | Osobno wdrażane Sanity Studio                             |
| Podgląd           | Osobne Astro SSR, wspólne komponenty z produkcją          |
| Formularze        | Worker → Cloudflare Queues → n8n                          |
| Publikacja        | GitHub Actions, Wrangler, podpisany webhook z Sanity      |
| Zgody i analityka | Zewnętrzne self-hostowane c15t, GTM i GA4                 |

Domyślnie Sanity Free i Workers Paid. Przed uruchomieniem zweryfikować bieżące
limity i koszt buildów, kolejek, funkcji i zasobów Sanity. Domena, n8n i c15t
pozostają poza kosztem hostingu strony. Backendów n8n/c15t nie wdrażamy tutaj.
Nie zakładamy istniejących kont, projektów ani sekretów.

## 4. Design system

Decyzja użytkownika 07.10.2026: docelowa strona realizuje **wariant 3a** oraz
opracowane mockupy podstron po audycie. Warianty 01, 1a, 02, 2a i 03 porzucono.
Dotychczasowy Wonderful zarchiwizowano; nie będzie implementowany.

Obowiązuje [design system 3a](../design-system/README.md):
[tokeny](../design-system/tokens.json), [specyfikacja](../design-system/SPECIFICATION.md),
[komponenty](../design-system/COMPONENTS.md), [ruch](../design-system/MOTION.md)
i [mapa Astro/Sanity](../design-system/ASTRO-INTEGRATION.md).

- Jedno źródło tokenów 3a; globalne style i komponenty w `src/design-system`.
- Białe tło, wiśniowa paleta, mocny Switzer i dwuliniowy wordmark z mockupów.
- Treść widoczna bez JS; reduced motion pozostawia kompletny stan statyczny.
- Switzer Fontshare, ITF FFL: self-host oficjalnego pliku bez subsetowania.
- Zachować działające poprawki dostępności, reflow oraz natywny trigger/fokus Safari.
- Starsze etapy 3–4 poniżej opisują wykonany prototyp, nie migrację strony do 3a.
  Alias `--wf-*` korzysta z nowych tokenów; usunąć go po migracji zastosowań.

## 5. CMS, komponenty i języki

### Model treści

Sanity obejmuje ustawienia marki, nawigację, stopkę, strony, artykuły, autorów,
kategorie, usługi, opinie, formularze i przekierowania. Ustawienia zawierają
kontakt, profile społecznościowe i domyślne SEO. Strony: język, adres, SEO i sekcje.
Artykuł: tytuł, lead, autorzy, daty publikacji/aktualizacji, obraz, kategorie,
Portable Text, źródła i powiązane wpisy.

Treści lokalne osadzać w sekcji, referencje stosować do danych współdzielonych.
Redaktor zmienia treść, kolejność, widoczność i warianty, duplikuje sekcje i strony.
Opcje wyglądu korzystają z design systemu, bez dowolnego CSS w CMS.

### Biblioteka

Sekcje: hero, tekst, tekst–obraz, logotypy, karty, listy, proces, liczby, pakiety
cenowe, opinie, ekspert, FAQ, porównanie, cytat, CTA, formularz, media i powiązane
artykuły. Media obejmują obrazy z podpisami i filmy z zewnętrznej platformy.

Każda sekcja ma schemat Sanity, renderer HTML, serializer Markdown i przykład.
Nieznany typ blokuje build. Przyciski, linki, pola, nagłówki, karty i kontenery
są osobnymi komponentami kodu. Nowy typ sekcji wymaga rozszerzenia schematu i kodu;
składanie istniejących sekcji nie wymaga kodu.

Blog: stały szablon Portable Text ze spisem treści, źródłami, obrazami, tabelami,
wyróżnieniami i CTA. Indeks z paginacją, kategoriami i wyróżnionymi wpisami.
Wyszukiwarka poza pierwszą wersją.

### PL/EN

PL pod /, EN pod /en/; blog pod /blog/ i /en/blog/.
Osobne dokumenty językowe i lokalizowane slugi, powiązania tłumaczeń.
Brak tłumaczenia oznacza brak strony i linku przełącznika, bez polskiego fallbacku.
Hreflang wyłącznie dla opublikowanych odpowiedników.

## 6. SEO, GEO, AEO i Markdown

- HTML i Markdown z tych samych opublikowanych danych jednego builda.
- HTML dostępny bez JS. Alternatywy .md, np. /en/blog/example.md, z właściwym
  Content-Type i HTTP canonical do HTML. HTML wskazuje alternatywę Markdown.
- Markdown zachowuje znaczenie i kolejność nagłówków, list, tabel, FAQ, podpisów
  i linków. Pomija dekoracje i powtarzalną nawigację. Formularz: opis i link do HTML.
- Sitemap z adresami HTML, robots.txt, RSS PL/EN i pomocniczy llms.txt.
- SEO i Open Graph w CMS; canonical i wzajemne hreflang automatyczne.
- Semantyczne nagłówki, breadcrumbs, poprawne 404, unikalność adresów,
  walidacja linków wewnętrznych oraz konfliktów i pętli przekierowań.
- Autorzy, źródła i rzeczywiste daty aktualizacji wspierają wiarygodność treści.

JSON-LD jako spójny graf ze stabilnymi identyfikatorami:

| Treść                           | Typy                                             |
| ------------------------------- | ------------------------------------------------ |
| Wydawca i serwis                | Organization lub Person zgodnie z marką, WebSite |
| Podstrona                       | WebPage, BreadcrumbList                          |
| Usługa i widoczna oferta cenowa | Service, Offer                                   |
| Artykuł i autor                 | BlogPosting, Person                              |
| Blog i kategorie                | CollectionPage, ItemList                         |
| Widoczne FAQ                    | FAQPage                                          |
| Kontakt i profil                | ContactPage, ProfilePage stosownie do treści     |

Pełna schema oznacza kompletne oznaczenie rzeczywistej treści, bez fikcyjnych ocen
i pustych encji. Nie tworzymy odmiennej treści dla botów. Markdown, llms.txt i schema
nie gwarantują pozycji, rich results ani cytowania przez AI.

## 7. Formularze i n8n

CMS zarządza kolejnością, wymaganiami i etykietami pól text, email, tel, textarea,
select i checkbox, zgodami oraz komunikatami PL/EN. Bez załączników i warunków v1.

POST /api/leads przyjmuje identyfikator i wersję formularza, identyfikator
zgłoszenia, język, źródło, dane pól i zgody. Backend waliduje względem opublikowanej
konfiguracji, limituje rozmiar i częstotliwość, sprawdza Turnstile i honeypot.
Sukces dopiero po przyjęciu do kolejki.

Konsument wysyła do uwierzytelnionego webhooka n8n z ponawianiem i kolejką błędów.
Wersjonowany kontrakt zawiera czas i wersje zaakceptowanych zgód. n8n deduplikuje
po identyfikatorze, obsługuje CRM, e-maile i dostarczanie lead magnetów. Sukces
formularza oznacza przyjęcie do obsługi, nie zakończenie wszystkich automatyzacji.

Webhook i sekrety tylko na serwerze. Dane leadów nie trafiają do Sanity,
publicznego buildu, GA4 ani logów aplikacji. Procedura utrzymania określi
retencję kolejki, obsługę wiadomości błędnych i usuwanie zgłoszeń.

## 8. c15t i analityka

Zewnętrzna self-hostowana instancja c15t jest dostarczana poza repo. Tutaj klient,
konfiguracja endpointu, panel PL/EN, stylowanie i integracja GTM/GA4. Backend,
baza, kopie i aktualizacje c15t są poza projektem.

c15t jest jedynym źródłem stanu zgód. Basic Consent Mode v2: skrypty Google po
odpowiedniej zgodzie; stan domyślny denied ustawiony przed pomiarem. Nie przejmować
automatycznie wczesnego ładowania GTM z gotowej integracji c15t.

Panel: akceptacja, odrzucenie, wybór kategorii, ponowne otwarcie, zmiana i wycofanie.
Niedostępność backendu nie udziela zgody i nie blokuje podstawowej strony.
Zgody formularzowe pozostają odrębne od zgód na analitykę i skrypty.

Zdarzenia: CTA, rozpoczęcie formularza, przyjęcie zgłoszenia. Bez wartości pól
i danych osobowych; parametry kampanii ograniczone do dozwolonego zestawu.

## 9. Podgląd, publikacja i utrzymanie

Sanity Presentation otwiera podgląd szkiców z edycją pól. Osobne Astro SSR
korzysta z tokenu serwerowego, sesji z terminem ważności, no-store i noindex.
Produkcja nie udostępnia szkiców ani publicznych endpointów zwracających szkice.

Publikacja, wycofanie i usunięcie uruchamiają podpisany webhook. Grupować zdarzenia,
kolejkować przebudowy i zapobiegać zastąpieniu nowszego buildu starszym.
Błąd zachowuje poprzednią wersję. Redaktor ma status i możliwość ponowienia.
Cel: publikacja do pięciu minut dla zakładanej skali.

Instrukcje utrzymania: alerty błędów publikacji i dostarczania leadów, limity,
eksport i odtworzenie Sanity, rollback kodu. Rollback kodu nie odtwarza automatycznie
treści ani danych integracji.

## 10. Etapy i checklisty odbioru

Oznaczenie [x] wymaga wykonania i zapisanej weryfikacji w PROGRESS.md. Można pracować
na danych demonstracyjnych bez sekretów. Integracje zewnętrzne pozostają otwarte
do sprawdzenia z rzeczywistą usługą; test atrapy nie oznacza gotowości produkcyjnej.

### Etap 1 — repo i dokumentacja

- [x] Zapisać pełny plan i kryteria odbioru.
- [x] Utworzyć rejestr postępu, decyzji, blokad i następnego kroku.
- [x] Uprościć AGENTS.md i dodać README z odnośnikami.
- [x] Zainicjować Git na main, utworzyć prywatne repozytorium GitHub i wysłać gałąź.
- [x] Sprawdzić ignorowanie sekretów, zależności, cache, wyników i plików systemowych;
      przykłady środowiska i design system nie mogą być ignorowane.
- [x] Zweryfikować kompletność dokumentacji i lokalne odnośniki.

Odbiór: kolejna sesja ustala stan i rozpoczyna etap 2 bez historii rozmowy.

### Etap 2 — aplikacje i infrastruktura

- [x] Utworzyć lokalną próbę Astro/Bejamas PL/EN z jednym lockfile npm.
- [x] Skonfigurować lint, format, typy, unit/E2E, axe, kontrolę buildu i workflow CI.
      Workflow czeka na pierwsze uruchomienie w GitHub; lokalna bramka przeszła.

- [x] Utworzyć Astro, Studio i Worker, wspólne typowanie oraz jeden lockfile.
- [x] Dodać sprawdzone komendy dev, build, kontroli typów i testów do README.
- [x] Skonfigurować Sanity i pobieranie opublikowanych danych.
- [x] Przygotować chroniony podgląd ze wspólnymi komponentami.
- [x] Dokończyć środowiska Cloudflare, sekrety i wdrożenia GitHub Actions.
      Staging, publiczny apex, preview i Workery integracji działają;
      Access chroni oba podglądy. Podpisany webhook produkcji przeszedł
      na apex (marker, potem przywrócenie).
- [x] Dokończyć test podpisanego webhooka i publikacji. Aktualizacja,
      wycofanie i usunięcie na stagingu przeszły end-to-end; błąd builda
      zachował poprzednią wersję Workera.

Odbiór: próbna zmiana przechodzi od szkicu przez podgląd do statycznej strony;
nieautoryzowany dostęp do szkiców odrzucony.

### Etap 3 — design system i komponenty prototypu (historyczny odbiór)

- [x] Przetestować przycisk, formularz i dialog Bejamas z tokenami Wonderful.
      Zakres i ograniczenia opisane w wynikach próby.

- [x] Zintegrować jedno źródło tokenów i Switzer jako główny krój aplikacji.
- [x] Zbudować elementy bazowe, nawigację, stopkę i wszystkie sekcje.
      Katalog `/ui/` i `/en/ui/` pokazuje 18 typów z planu. Schematy Sanity
      i serializacja Markdown to etapy 4–5.
- [x] Dodać przykłady wariantów i stanów, responsywność oraz ruch.
- [x] Sprawdzić zgodność wizualną, kontrast, klawiaturę i działanie bez JS.
      Axe, no-JS, klawiatura i reduced motion w E2E; oględziny desktop i mobile.
      Czytnik, natywny zoom i urządzenie fizyczne pozostają do etapu 7.

Odbiór: katalog aplikacji pokazuje komponenty PL/EN na desktopie i mobile,
z poprawnym stanem statycznym przy reduced motion.

### Etap 4 — Sanity i szablony PL/EN prototypu (historyczny odbiór)

- [x] Wdrożyć modele, walidację, podglądy, referencje i mapowanie sekcji.
      Schema, GROQ, TypeGen i renderery zweryfikowane lokalnie; Content Lake
      nadal ma stare dokumenty `page` bez sekcji.
- [x] Umożliwić składanie i duplikowanie stron bez kodu.
      Tablica sekcji w Studio, szablony PL/EN i natywne duplikowanie dokumentu.
- [x] Dodać powiązania tłumaczeń i lokalizowane adresy.
- [x] Przygotować demonstracyjną stronę główną, dwa landing page’e, artykuły i blog.
      Fixture’e lokalne; nie opublikowano nowej treści do datasetu.
- [x] Wdrożyć paginację, kategorie, spis treści i powiązane wpisy.

Odbiór: redaktor sam tworzy landing page i publikuje PL/EN; brak tłumaczenia
nie prowadzi do polskiej treści pod angielskim adresem. Drugi warunek przeszedł
lokalnie (`/tylko-pl/` bez przełącznika, `/en/tylko-pl/` 404). Publikacja
landingów z Studio do Content Lake pozostaje do zrobienia.

### Etap 4a — docelowe strony 3a i treści z mockupów (bieżący)

Zlecenie 07.10.2026: dalszą implementację oprzeć na przygotowanych mockupach,
nowym design systemie i przeniesieniu treści do Sanity. Etapy 3–4 pozostają
zapisem wykonanych fundamentów; nie oznaczają ukończenia docelowych stron.

Stan sprawdzony w repo:

- `src/design-system` zawiera Layout3a, tokeny, style i 21 komponentów.
  Layout3a wykorzystuje katalog `/design-system/`; publiczne ComposedPage,
  BlogIndex i ArticleView nadal importują wcześniejszy Layout i `src/ui`.
- Sanity ma page builder 18 typów, `article`, `author`, `service`, `form`,
  `testimonial`, `category`, `siteSettings` i `redirect`. Brakuje modelu e-booka
  oraz rozszerzeń 3a opisanych w instrukcjach CMS; nie tworzyć tych modeli od zera
  tam, gdzie istnieją już odpowiednie pola.
- Preview współdzieli część rendererów, ale strona `page` ma osobny shell.
  Migracja musi objąć również `preview/src/pages/[...locale].astro`, jego
  kwerendy i mapowanie tras, a nie wyłącznie statyczną aplikację.
- Nie ma jeszcze serializerów Markdown ani tras `.md`. Wprowadzać serializery
  razem z nowymi sekcjami; etap 5 domyka eksport, metadane i indeksy.
- Osiem widoków HTML odpowiada siedmiu szablonom: druga strona bloga jest
  stanem paginacji tego samego indeksu. Stan Content Lake i usług zewnętrznych
  jest znany z wcześniejszych zapisów, nie został ponownie sprawdzony w tym audycie.

Kolejność wynika z [mapy integracji](../design-system/ASTRO-INTEGRATION.md).
Modele współdzielone potrzebne homepage wprowadzić już w pierwszym pakiecie,
choć pełne landingi i kolekcje powstaną później.

| Kolejność | Pakiet i mockup                                          | Model i zakres treści                                                                                                                                                          |
| --------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1         | Wspólny shell + Homepage3a, `cherry-white.html`          | `page` home, `siteSettings`, referencje autora/opinii/usługi/formularza oraz nowy model e-booka; hero, marki, podejście 450+, O mnie, e-booki, konsultacje, opinie, newsletter |
| 2         | About3a, `about-3a.html`                                 | `page` i wspólny `author`; historia, wartości, wykształcenie, media i miejsce na rzeczywisty dyplom                                                                            |
| 3         | Consultation3a, `consultation-3a.html`                   | Rozszerzenie `service` i referencja ze strony; zakres, proces, 450 PLN/60 minut, FAQ i rezerwacja                                                                              |
| 4         | Ebook3a, `ebook-3a.html`                                 | Wspólny dokument produktu według EBOOK-CMS-CONFIG-3A; rozdziały, próbka, 97 PLN brutto, status, front i CTA                                                                    |
| 5         | EbookCollection3a, `ebooks-3a.html`                      | Referencje tych samych produktów, kategorie, filtrowanie, stany pustej kolekcji i newsletter                                                                                   |
| 6         | BlogCollection3a, `blog-3a.html` i `blog-3a-page-2.html` | Istniejący `article` i `category`, ustawienia indeksu; najnowszy wpis, stabilne sortowanie i paginacja bez duplikatów                                                          |
| 7         | Article3a, `article-3a.html`                             | Portable Text, wspólny autor, źródła, related, referencje e-booków, FAQ i newsletter; TOC, rekomendacje i udostępnianie                                                        |

Dla każdego pakietu stosować ten sam cykl odbioru:

1. Zinwentaryzować teksty, media, CTA, kolejność i widoczność z mockupu;
   przypisać je do istniejących pól albo jawnie wskazać brakujące pole/typ.
   Korzystać z HOMEPAGE/BLOG/EBOOK/CONSULTATION-CMS-CONFIG i zapisywać decyzje.
   Zachować ustalone wartości; propozycje, przykładowe artykuły/daty i brakujące
   adresy oznaczać do decyzji. Akceptacja kierunku pozwala rozwijać szablony,
   ale nie potwierdza gotowości produktu ani finalnej treści do publikacji.
2. Rozszerzyć schematy, walidacje, etykiety i preview Studio, GROQ publiczny
   i chroniony, TypeGen, typy oraz mappery. Zachować kontrolowane warianty,
   kolejność i widoczność sekcji, bez dowolnego CSS w CMS.
3. Wdrożyć wspólny renderer Astro oparty na Layout3a; odtworzyć mockup przez
   istniejące komponenty i scoped CSS kompozycji. Równolegle dodać serializer
   Markdown i przykład dla każdego nowego typu, z blokadą nieznanych bloków.
4. Przygotować powtarzalny import treści do szkiców Sanity: stabilne ID/klucze,
   referencje, przesłanie mediów z alt/kadrem, raport braków i mapowanie źródeł.
   Przed zapisem porównać obecne dokumenty, zachować zmiany redaktorów;
   zapewnić eksport/kopię oraz tryb bez zapisu. Fixture służy testom,
   nie stanowi wykonanej konfiguracji Content Lake.
5. Sprawdzić szkice w Studio i chronionym preview oraz zmianę pola widoczną
   w obu rendererach. PL/EN to osobne treści; brak EN daje brak trasy/tłumaczenia.
   Niewypełnione dane blokują właściwą publikację, nie niezależne lokalne prace.
6. Uruchomić pełne `npm run verify`, porównać z mockupem desktop/mobile,
   320/390/1440 px, obie palety, klawiaturę, 200% zoom, bez JS, reduced motion
   i axe; zapisać niewykonany natywny zoom, czytnik i urządzenie fizyczne.
   Sprawdzić zgodność znaczącej treści HTML/Markdown i referencji.

Checklista wykonania (zaznaczać osobno kod i dane):

- [x] Zweryfikować stan repo i uzgodnić kolejność migracji z systemem 3a.
- [ ] Wdrożyć wspólny shell publiczny/preview i Homepage3a wraz z modelami zależnymi.
- [ ] Wdrożyć About3a oraz wspólny profil autora.
- [ ] Wdrożyć Consultation3a i model usługi.
- [ ] Wdrożyć Ebook3a i model produktu.
- [ ] Wdrożyć EbookCollection3a, kategorie i filtrowanie.
- [ ] Wdrożyć BlogCollection3a i rzeczywistą paginację.
- [ ] Wdrożyć Article3a, Portable Text i jego powiązane bloki.
- [ ] Przygotować i sprawdzić import bez zapisu oraz kopię obecnych danych.
- [ ] Przenieść treści i media do szkiców Content Lake; zapisać wyniki walidacji.
- [ ] Odebrać edycję i chroniony podgląd wszystkich szablonów z Sanity.
- [ ] Po zastąpieniu zastosowań usunąć dawną prezentację i aliasy `--wf-*`.

Odbiór pakietu wymaga osobnych dowodów: kod/verify, zgodność wyglądu, dane
w Sanity oraz podgląd. Sam katalog, mockup czy instrukcja CMS nie zamyka pakietu.
Publikacja treści uruchamia webhooki; wykonać ją dopiero na osobne zlecenie.
Formularze pozostają w jawnym stanie demonstracyjnym do integracji z etapu 6,
a brak checkoutu/kalendarza nie może dawać fałszywego potwierdzenia zakupu/zapisu.

### Etap 5 — SEO i eksport treści

- [ ] Dodać serializery wszystkich sekcji i Portable Text do Markdown.
- [ ] Wdrożyć canonical, alternatywy .md, hreflang, sitemap, robots, RSS i llms.txt.
- [ ] Wdrożyć JSON-LD i kontrolę zgodności z widoczną treścią.
- [ ] Weryfikować adresy, 404, przekierowania, linki i nieznane typy sekcji.

Odbiór: HTML/Markdown są zgodne; schema przechodzi walidację; wycofane treści
znikają z obu formatów i indeksów po udanej publikacji.

### Etap 6 — formularze, c15t i analityka

- [ ] Wdrożyć formularze CMS, walidację serwerową, Turnstile i ograniczenia.
- [ ] Dodać kolejkę, retry, kolejkę błędów i wersjonowany kontrakt n8n.
- [ ] Sprawdzić deduplikację, awarię n8n, błędy walidacji i brak wycieków danych.
- [ ] Zintegrować zewnętrzne c15t, panel PL/EN i Basic Consent Mode v2.
- [ ] Sprawdzić odrzucenie, zgodę częściową, zmianę, wycofanie i awarię c15t.
- [ ] Zweryfikować w sieci kolejność ładowania GTM/GA4 i zdarzenia bez PII.

Odbiór: potwierdzenie po kolejce; awaria n8n uruchamia retry; brak zgody
nie uruchamia skryptów Google.

### Etap 7 — odbiór i utrzymanie

- [ ] Przejść scenariusze redakcyjne, publikacji, leadów i zgód.
- [ ] Sprawdzić desktop/mobile, 320 px, zoom 200%, klawiaturę i reduced motion.
- [ ] Zweryfikować WCAG 2.2 AA; automatyczny audyt uzupełnić kontrolą ręczną.
- [ ] Zmierzyć Lighthouse Performance: cel ≥95 przed tagami na reprezentatywnych
      szablonach; osobny pomiar po uruchomieniu tagów zewnętrznych.
- [ ] Przetestować eksport/odtworzenie Sanity i rollback wdrożenia.
- [ ] Udokumentować tworzenie sekcji, pracę redakcji, alerty, limity i retencję.
- [ ] Przed publikacją skonfigurować domenę, markę, treści i zgody; usunąć ochronę
      i noindex wyłącznie z gotowej produkcji.

Odbiór: zapisane wyniki, brak krytycznych błędów, sprawdzony powrót do poprzedniej
wersji i przekazanie instrukcji utrzymania.

## 11. Zależności przed produkcją

Domena produkcyjna `aleksandraolesiewicz.com` jest Custom Domain publicznego
Workera (apex 200). Proxied `www` zostaje przy regule 301 i nie może być domeną
Workera. Publiczny staging działa pod `workers.dev`, a preview staging i
preview produkcji są chronione przez Access (iframe Presentation wymaga
`allow_iframe` i ciasteczka `SameSite=None`; logowanie MFA w ramce nie działa).
Worker integracji produkcji jest
wdrożony, a webhook Sanity `publish-pages-production` po ujednoliceniu sekretu
przeszedł end-to-end (202 → Actions → apex, potem przywrócenie). Wrangler,
kolejki, webhook staging, Repository Dispatch i środowiska GitHub są
skonfigurowane; aktualizacja, wycofanie i błąd builda na stagingu też przeszły.
Pozostają: handshake Presentation szkicu, Turnstile, uwierzytelnienie n8n,
endpoint i dozwolone originy c15t, identyfikatory GTM/GA4 oraz finalne dane
marki i treści zgód. Brak tych danych nie blokuje lokalnej migracji 3a w etapie 4a; blokuje
odpowiednie integracje i odbiór produkcyjny.

## Materiały fotograficzne — 2026-10-04

- [x] Przejrzeć oba profile Instagram i przygotować propozycje dla trzech sekcji.
- [x] Poprawić proporcje ramion, zróżnicować mimikę i przygotować hero bez tła.
- [x] Zapisać wybór użytkownika: Hero A, O mnie C, Kontakt C z wersji 2.
- [x] Dodać trzy źródłowe PNG oraz bezstratne WebP z zachowaniem alfa hero.
- [ ] Dopasować kadry do docelowych sekcji i podłączyć wybrane media w Sanity.

Materiały: [wybrane fotografie](../src/assets/portraits/README.md).
Pozostałe propozycje i galeria pozostają lokalnie. Ten zestaw nie zamyka etapów 5–7.

## Wybór estetyki homepage — 2026-10-05

Bieżące zlecenie użytkownika poprzedza dalszą implementację docelowego wyglądu
oraz konfigurację treści w CMS. Strona Aleksandry Olesiewicz ma sprzedawać
materiały dla kobiet z PCOS i w perimenopauzie oraz konsultacje dietetyczne online.

- [x] Przygotować osobny mockup HTML zgodny z Wonderful.
- [x] Przygotować dwie odmienne propozycje z `design-taste-frontend`:
      botaniczny magazyn oraz wiśniowa energia.
- [x] Uwzględnić wszystkie sekcje briefu, istniejące portrety i znak marki.
- [x] Umieścić sześć koncepcji e-booków z researchu w przewijanej bibliotece.
- [x] Dodać lokalny ekran porównania, menu mobilne i demonstrację newslettera.
- [x] Sprawdzić trzy makiety w trzech przeglądarkach, dostępność automatyczną,
      320 px, CSS zoom 200% i reduced motion; zapisać rzeczywisty zakres.
      Natywny zoom, czytnik ekranu i fizyczne urządzenie pozostają otwarte.
- [x] Dodać wersje 2a i 3a z białym głównym tłem oraz wspólne wordmarki
      dopasowane do typografii wersji 2/2a i 3/3a (2026-10-06).
- [x] Dodać 1a: układ Wonderful z paletą 3a i porównanie sześciu makiet
      (2026-10-06).
- [x] Uzupełnić 1a o kontrastowy zielony akcent matcha, z czytelnym wariantem
      na jasnych i wiśniowych powierzchniach (2026-10-06).
- [x] Opublikować odseparowany publiczny feedback sześciu makiet na
      `design.aleksandraolesiewicz.com`, z noindex i kontrolą rzeczywistego HTTPS
      (2026-10-06).
- [x] Przeprowadzić niezależny przegląd Impeccable sześciu makiet przed zmianami;
      zapisać [ocenę i zakres kontroli](HOMEPAGE-DESIGN-REVIEW.md) (2026-10-06).
- [x] Ustalić zakres poprawek po przeglądzie: SVG strzałek, rozpoznawanie grup
      e-booków, treści i okładki, rytm paneli 03/3a oraz drobna czytelność.
- [x] Wdrożyć pakiet poprawek we wszystkich sześciu makietach i zaktualizować
      subdomenę feedbacku po kontroli lokalnej i publicznym smoke (2026-10-06).
- [x] Przygotować [PR #17](https://github.com/zawlodzki/nowa-strona-ola/pull/17)
      z makietami, poprawkami i konfiguracją publicznego podglądu (2026-10-06).
- [x] Wybrać 3a jako bazę dalszej pracy z użytkownikiem (2026-10-06).
- [x] Zweryfikować kontekst FIRMA i poprzednie repo `ola-homepage`; przygotować
      [propozycję copy 3a](HOMEPAGE-COPY-3A.md) bez wdrożenia (2026-10-06).
- [x] Wdrożyć zatwierdzone copy w 3a; oferta: pojedyncze konsultacje.
      Opinie z `ola-homepage` potwierdzone przez użytkownika (2026-10-06).
- [x] Ustawić 97 zł brutto dla sześciu e-booków i przywrócić marki/social media
      oraz wyróżnienie konsultacji 1:1 na polecenie użytkownika (2026-10-06).
- [x] Ustawić liczbę 450+ kobiet rocznie zgodnie z informacją użytkownika
      przy opisie konsultacji w 3a (2026-10-06).
- [x] Zapisać bieżące decyzje, treści i mapowanie homepage 3a w
      [specyfikacji konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md) oraz zasadę
      aktualizacji dokumentu przy kolejnych decyzjach użytkownika (2026-10-06).
- [x] Przygotować [PR #18](https://github.com/zawlodzki/nowa-strona-ola/pull/18)
      z aktualizacją mockupów 3a i dokumentacją CMS po pełnej weryfikacji lokalnej.
- [ ] Ustalić finalne treści i dostępność e-booków, ceny konsultacji,
      współprace i profile social media.
- [ ] Dopiero po wyborze przenieść zaakceptowane rozwiązanie do współdzielonych
      komponentów Astro i modelu treści Sanity.

[Mockupy i źródła materiałów](../mockups/homepage/README.md).
Alternatywne palety oraz redakcyjny krój istnieją tylko w mockupach na wyraźne
polecenie użytkownika; nie zmieniono tokenów Wonderful ani styli aplikacji.

## Podstrona „O mnie” 3a — 2026-10-06/07

- [x] Przejrzeć kontekst FIRMA, poprzednią stronę oraz poradnik copywriterski.
- [x] Obejrzeć bieżące 3a na desktopie i mobile; zaplanować układ oraz copy.
- [x] Zapisać źródła, propozycje CTA, mapowanie do CMS i brakujące możliwości.
- [ ] Zebrać ocenę [planu „O mnie”](ABOUT-MOCKUP-PLAN-3A.md) i dopracować
      ewentualne szczegóły autobiografii; uczelnia i kierunek już potwierdzone.
- [x] Zapisać cenę 450 zł/60 minut, CTA do płatnego kalendarza oraz wykształcenie
      i miejsce na skan dyplomu, zgodnie z decyzją użytkownika 06.10.2026.
- [x] Zapisać tymczasowy cel CTA `https://cal.com`; użytkownik uzupełni link wydarzenia później.
- [ ] Uzupełnić adres wydarzenia płatnej konsultacji i rzeczywisty skan dyplomu.
- [x] Wykonać lokalny mockup i podłączyć wejście „Poznaj moją historię” z 3a
      oraz biogram artykułu i indeks.
- [x] Uwzględnić korektę CTA i dobre praktyki E-E-A-T: profil, kwalifikacje,
      granice konsultacji, opinie, materiały i spójne `ProfilePage`/`Person`.
- [x] Zweryfikować mockup na desktopie/mobile, dla klawiatury, 320 px,
      CSS zoom 200%, reduced motion i bez JavaScriptu w trzech przeglądarkach.
- [ ] Utworzyć i scalić PR mockupu na polecenie „pr merge” z 07.10.2026.
- [ ] Po akceptacji przenieść szablon do Astro i Sanity.

Pierwsze zlecenie dotyczyło planowania; 07.10.2026 użytkownik zlecił mockup.
[Wykonany HTML](../mockups/homepage/about-3a.html) i [ocena E-E-A-T](ABOUT-EEAT-3A.md)
nie oznaczają wdrożenia Astro/CMS ani odbioru produkcyjnego.

## Źródła techniczne

- [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Sanity pricing](https://www.sanity.io/pricing)
- [Sanity i Astro](https://www.sanity.io/docs/astro)
- [Podgląd Astro](https://www.sanity.io/docs/astro/astro-visual-editing)
- [c15t self-host](https://c15t.com/docs/self-host/quickstart)
- [c15t i GTM](https://c15t.com/docs/integrations/google-tag-manager)
- [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)
- [Google structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

Przed implementacją zmiennych API sprawdzić aktualną dokumentację i wersje
zależności; źródła nie zastępują wyników testów w projekcie.

## Mockup artykułu blogowego 3a — 2026-10-06

- [x] Przygotować osobny mockup HTML w estetyce zaakceptowanego homepage 3a.
- [x] Dodać navbar, breadcrumb, H1, obraz główny i obie daty.
- [x] Zbudować rich text, spis H2 po lewej i CTA newslettera po prawej.
- [x] Dodać biogram autora, trzy tematyczne e-booki, dolny newsletter i footer.
- [x] Sprawdzić Chromium/Firefox/WebKit, 320/390/768/1440 px, CSS zoom 200%,
      klawiaturę, reduced motion, brak JS i lokalny formularz; axe Chromium light/dark.
- [x] Opisać istniejące pola i wymagane rozszerzenia Sanity.
- [ ] Przenieść zaakceptowany szablon do Astro i wdrożyć rozszerzenia CMS.
- [ ] Uzupełnić rzeczywisty artykuł, daty i media po akceptacji redakcyjnej.

[Mockup](../mockups/homepage/article-3a.html),
[instrukcja CMS](BLOG-CMS-CONFIG-3A.md). Mockup i dokumentacja nie zamykają
etapów wdrożenia bloga, eksportu Markdown ani integracji newslettera.

## Interakcje artykułu 3a — 2026-10-06

- [x] Dodać rekomendacje dwóch wpisów w prawej kolumnie pod newsletterem po 50% rich textu.
- [x] Dodać Udostępnij pod spisem: hover, kliknięcie, dotyk, klawiatura, Escape,
      kopiuj link, e-mail, Facebook, WhatsApp i fallback schowka.
- [x] Wykorzystać istniejącą paletę i tokeny ruchu, uwzględnić reduced motion.
- [x] Rozszerzyć instrukcję CMS o istniejące `related[]` oraz canonical
      i ochronę szkiców przy przyszłym przeniesieniu do Astro.
- [x] Sprawdzić oba panele na desktop/mobile i w trzech przeglądarkach;
      pełne verify: 57 unit i 42 E2E PASS, w tym regresje progu/schowka/fokusu.
- [ ] Powiązać panel z dwoma rzeczywistymi opublikowanymi wpisami w CMS.

## FAQ artykułu 3a — 2026-10-06

- [x] Dodać cztery pytania między e-bookami a newsletterem w estetyce 3a.
- [x] Zapewnić natywne rozwijanie, klawiaturę i działanie bez JS.
- [x] Dodać JSON-LD FAQPage zgodne z pełnymi widocznymi odpowiedziami.
- [x] Opisać wykorzystanie istniejącego typu FAQ w przyszłym polu artykułu,
      wspólny HTML/Markdown/JSON-LD i aktualny status Google FAQ rich results.
- [ ] Wdrożyć pole `article.faq`, pobieranie i renderer w Astro/Sanity.

## Korekta prawej kolumny artykułu 3a — 2026-10-06

- [x] Umieścić „Sprawdź również” pod CTA newslettera, bez nakładania na treść.
- [x] Zachować próg 50% rich textu i układ w przepływie na tablet/mobile.
- [x] Sprawdzić brak kolizji przy 320/390/768/1440 px i wysokości 600 px
      w Chromium/Firefox/WebKit; pełne verify: 57 unit i 45 E2E PASS.

## Landing e-booka 3a — 2026-10-06

- [x] Przygotować osobny mockup „Suplementy w PCOS” z pełnym układem sprzedażowym.
- [x] Zastosować paletę 3a, Switzer, okładkę, podgląd karty, ilustrację i portret.
- [x] Przygotować copy według wskazanego poradnika i koncepcji A researchu.
- [x] Zapisać instrukcję osobnej kolekcji e-booków i wspólnych referencji CMS.
- [ ] Zatwierdzić finalny zakres, copy, dostępność, pliki i obsługę sprzedaży.
- [ ] Wdrożyć kolekcję, szablon Astro, Markdown, TypeGen i referencje po akceptacji.

[Mockup](../mockups/homepage/ebook-3a.html), [instrukcja CMS](EBOOK-CMS-CONFIG-3A.md).

## Landing pojedynczej konsultacji 3a — 2026-10-07

- [x] Przejrzeć kontekst FIRMA, poprzednią stronę i wskazany poradnik copywriterski.
- [x] Wykonać lokalny landing z dziesięcioma wymaganymi częściami i blokiem prowadzącej.
- [x] Zastosować istniejącą paletę 3a, fotografie, wizualną mapę pytań i celów spotkania.
- [x] Zachować 450 zł/60 minut i tymczasowy Cal.com; nie dodawać pakietów mentoringu.
- [x] Połączyć landing z lokalnym indeksem i CTA konsultacji homepage 3a.
- [x] Zapisać propozycje copy, źródła i rzeczywiste luki CMS.
- [x] Sprawdzić Chromium/Firefox/WebKit, 320–1440 px, zoom CSS 200%, klawiaturę,
      brak JS, reduced motion, obrazy i axe light/dark.
- [ ] Potwierdzić finalny zakres, pisemne podsumowanie, FAQ i URL płatnej rezerwacji.
- [ ] Po akceptacji wdrożyć warianty Astro/Sanity oraz serializery Markdown.

[Mockup](../mockups/homepage/consultation-3a.html),
[mapowanie CMS i copy](CONSULTATION-CMS-CONFIG-3A.md).
Lokalny landing nie zamyka wdrożenia CMS ani kalendarza.

## Kolekcja wszystkich e-booków 3a — 2026-10-07

- [x] Przygotować pełną siatkę sześciu istniejących e-booków w estetyce 3a.
- [x] Dodać wybór Wszystkie / PCOS / Perimenopauza, liczniki i stan w URL.
- [x] Zachować ceny 97 zł brutto, opisy, okładki i status przygotowania.
- [x] Połączyć kolekcję z indeksem oraz sekcją e-booków homepage 3a.
- [x] Zapisać decyzję użytkownika i proponowane pola przyszłego CMS.
- [x] Sprawdzić trzy przeglądarki, kategorie/URL/historię, brak JS, 320 px,
      klawiaturę, zoom CSS 200%, reduced motion i axe light/dark.
- [x] Potwierdzić końcowe `npm run verify`: 57 unit i 51 E2E PASS na Node 24.
- [ ] Zatwierdzić copy i UX kolekcji przed przeniesieniem do Astro/Sanity.
- [ ] Wdrożyć model produktów, renderer kolekcji i serializer Markdown.

[Mockup](../mockups/homepage/ebooks-3a.html),
[wartości i mapowanie CMS](HOMEPAGE-CMS-CONFIG.md#kolekcja-wszystkich-e-booków-3a--07102026).
Dokumentacja oraz mockup nie oznaczają wdrożenia kolekcji w CMS.

## Lista wszystkich wpisów bloga 3a — 2026-10-07

- [x] Przygotować indeks: jeden najnowszy wpis nad siatką dwóch kolumn.
- [x] Dodać działające odnośniki paginacji i osobną drugą podstronę kolekcji.
- [x] Dodać pełny newsletter po paginacji oraz menu/stopkę wspólnego 3a.
- [x] Połączyć indeks z lokalnymi stronami 3a i breadcrumb artykułu.
- [ ] Scalić PR mockupu indeksu bloga po kontroli GitHub Quality.
- [x] Zapisać decyzje, propozycje copy i docelowy algorytm kolekcji w instrukcji CMS.
- [x] Sprawdzić obie podstrony w Chromium/Firefox/WebKit, 320 px, CSS zoom 200%,
      klawiaturę, brak JS, reduced motion i axe; wykonać przegląd wizualny.
- [ ] Przenieść zaakceptowany indeks do Astro/Sanity oraz serializera Markdown.

[Mockup](../mockups/homepage/blog-3a.html),
[instrukcja przyszłej konfiguracji](BLOG-CMS-CONFIG-3A.md#kolekcja-wszystkich-wpisów--07102026).
Kontrole i ograniczenia tej sesji: [postęp](PROGRESS.md).

## Audyt spójności podstron 3a — 2026-10-07

- [x] Porównać osiem lokalnych widoków z homepage 3a: wspólne elementy,
      desktop/mobile, palety, menu, newsletter, okładki i CSS.
- [x] Zapisać [raport spójności](MOCKUPS-3A-CONSISTENCY-REVIEW.md) z dowodami
      i rzeczywistymi wynikami, w tym nieudanymi kontrolami CSS zoom.
- [x] Naprawić nagłówek przy CSS zoom 200% na pięciu widokach; nie ukrywać overflow.
- [x] Ujednolicić okładkę produktu, cele/kolejność menu, header, newsletter,
      ikony i stopkę według zaakceptowanego zakresu audytu.
- [x] Po implementacji uruchomić pełne verify oraz odbiór wspólnych komponentów.

Poprawki lokalnych mockupów wykonano na zlecenie użytkownika; verify PASS
(57 unit, 57 E2E), szeroka kontrola trzech silników PASS. Ograniczenia odbioru
w [postępie](PROGRESS.md). Nie oznacza to migracji Astro ani konfiguracji CMS.

## Docelowy design system 3a — 2026-10-07

- [x] Zapisać decyzję o realizacji 3a i porzuceniu pozostałych wariantów.
- [x] Zarchiwizować Wonderful i odłączyć go od aktywnego runtime.
- [x] Wyodrębnić jedno źródło tokenów 3a, globalne style i komponenty Astro.
- [x] Dodać żywy katalog oraz specyfikację/API i mapę migracji szablonów.
- [x] Zweryfikować nowy katalog i pełne verify; zapisać rzeczywiste wyniki.
      PASS: 57 unit, 81 E2E; zakres i ograniczenia w PROGRESS.md.
- [ ] Przenieść wszystkie szablony z mockupów do wspólnych komponentów 3a.
- [ ] Wdrożyć wynik w modelach Sanity/rendererach/Markdown i wykonać odbiór stron.

Biblioteka nie oznacza migracji szablonów, konfiguracji CMS ani publikacji.

# Plan wdrożenia i przygotowania repozytorium

Zatwierdzony: 2026-09-12. Realizacja etapami w wielu sesjach.
Stan wykonania: [PROGRESS.md](PROGRESS.md). Instrukcje: [AGENTS.md](../AGENTS.md).
Weryfikacja kodu: [CODE-QUALITY.md](CODE-QUALITY.md).
Próba komponentów: [UI-SPIKE-RESULTS.md](UI-SPIKE-RESULTS.md).

## 1. Cel i granice

Nowa marka i domena: strona główna, landing page’e, blog i formularze leadowe.
Pierwsza wersja dostarcza fundament techniczny i demonstracyjne szablony.
Bez migracji, finalnego brandingu i finalnych treści. Zakładamy kilku redaktorów
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

Obowiązuje [wonderful-design-system](../wonderful-design-system/README.md):
[specyfikacja](../wonderful-design-system/DESIGN-SYSTEM.md),
[tokeny](../wonderful-design-system/tokens.json),
[katalog](../wonderful-design-system/index.html),
[ruch](../wonderful-design-system/MOTION.md) i [QA](../wonderful-design-system/QA.md).

- Neutralna paleta, lekka typografia, przestrzeń, jasne i ciemne sekcje,
  oszczędny pomarańczowy akcent.
- Rekomendowane poprawki kontrastu, czytelności artykułów i mobile mają zastosowanie.
- Tokeny w jednym źródle; sprawdzić i wykorzystać istniejący generator.
  Nie tworzyć równoległej palety i skali odstępów.
- Adaptować referencyjne CSS/JS do komponentów Astro, nie kopiować całego demonstratora.
- Treść widoczna bez JS; reduced motion pozostawia kompletny stan statyczny.
  Pętle zatrzymują się poza ekranem i w ukrytej karcie.
- ABC Favorit nie jest licencjonowany. Główny krój aplikacji to Switzer
  (Fontshare, ITF FFL 2.0): self-host oficjalnego pliku, bez subsetowania.
  Nie pobierać fontów ani materiałów Wonderful. Sprawdzić polskie znaki
  i łamanie treści PL/EN.
- Panel c15t i wszystkie stany formularzy także korzystają z design systemu.

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

### Etap 3 — design system i komponenty

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

### Etap 4 — Sanity i szablony PL/EN

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
marki i treści zgód. Brak tych danych nie blokuje etapu 3 ani lokalnych
szablonów.

## Materiały fotograficzne — 2026-10-04

- [x] Przejrzeć oba profile Instagram i przygotować propozycje dla trzech sekcji.
- [x] Poprawić proporcje ramion, zróżnicować mimikę i przygotować hero bez tła.
- [x] Zapisać wybór użytkownika: Hero A, O mnie C, Kontakt C z wersji 2.
- [x] Dodać trzy źródłowe PNG oraz bezstratne WebP z zachowaniem alfa hero.
- [ ] Dopasować kadry do docelowych sekcji i podłączyć wybrane media w Sanity.

Materiały: [wybrane fotografie](../src/assets/portraits/README.md).
Pozostałe propozycje i galeria pozostają lokalnie. Ten zestaw nie zamyka etapów 5–7.

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

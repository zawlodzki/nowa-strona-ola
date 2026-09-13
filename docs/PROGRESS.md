# Postęp wdrożenia

Aktualizacja: 2026-09-13. Specyfikacja: [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md).

## Aktualny etap

Etap 1 — przygotowanie repozytorium i dokumentacji — zakończony.
Etap 2 rozpoczęty: lokalny frontend Astro i bramka jakości działają.
Wykonano próbę trzech komponentów z etapu 3. Sanity, Workery i hosting
nie są jeszcze wdrożone; etapy 4–7 pozostają otwarte.

## Wykonane

- Zapisano pełną specyfikację i checklisty siedmiu etapów z kryteriami odbioru.
- Utworzono README i instrukcję kontynuacji pracy pomiędzy sesjami.
- Uproszczono AGENTS.md do reguł tego projektu.
- Dodano .gitignore dla plików lokalnych, sekretów i generowanych zasobów.
- Zainicjowano lokalny Git na main. Bez commitów, remote i push.
- Zachowano istniejący design system i lokalne umiejętności bez zmian.

## Decyzje obowiązujące

- Nowa marka, fundament z treściami demonstracyjnymi, bez migracji; PL/EN.
- Astro SSG, Sanity, Cloudflare Workers Static Assets; osobny chroniony podgląd.
- Wygląd z wonderful-design-system; bez konkurencyjnej palety/tokenów.
- Sekcje z wariantami w CMS; każda ma HTML, Markdown i przykład.
- Worker → Queues → n8n; n8n deduplikuje i obsługuje dalsze automatyzacje.
- Zewnętrzne self-hostowane c15t; tutaj tylko integracja i panel.
- Basic Consent Mode v2; skrypty Google dopiero po właściwej zgodzie.
- Sanity Free i Workers Paid jako założenie; limity do sprawdzenia przed wdrożeniem.

## Weryfikacja etapu 1 — 2026-09-12

- Przeczytano aktualny AGENTS.md i sprawdzono stan katalogu przed zmianami.
- Skrypt Python sprawdził 4 dokumenty: 17 lokalnych odnośników prowadzi do istniejących
  plików; brak końcowych białych znaków.
- git check-ignore: 10 przypadków ignorowanych i 8 zachowanych przeszło kontrolę
  (m.in. zagnieżdżone .env, przykłady środowiska, tokeny i generator design systemu).
- git symbolic-ref --short HEAD: main. git remote: brak remote.
- git status --short: wyłącznie pliki nieśledzone nowego repo; nic nie dodano do indeksu.
- Na koniec etapu 1 aplikacja jeszcze nie istniała; aktualne wyniki poniżej.

## Blokady i zależności

Brak blokad dla przygotowania repo i lokalnego szkieletu. Nie potwierdzono kont,
projektów ani poświadczeń usług. Lista przedprodukcyjna w sekcji 11 planu.
ABC Favorit nie jest dołączony — używać fallbacku.

## Analiza bibliotek UI — 2026-09-12

- Porównano dokumentację i repozytoria Lumos oraz bejamas/ui z planem strony.
- [Wyniki i propozycja próby](UI-FRAMEWORKS.md): selektywnie rozważyć Bejamas,
  Lumos traktować jako inspirację. Nie instalowano zależności i nie zmieniono stosu.
- To ocena dokumentacji, bez testu aplikacji i pomiaru wydajności. W etapie 3
  sprawdzić przycisk, pola formularza i dialog przed przyjęciem biblioteki.

## Próba UI i bramka jakości — 2026-09-13

- Działają prototypy PL/EN: przycisk, pola formularza, dialog i sekcja ciemna.
- Astro 7.3.2, Tailwind 4.3.3 i @data-slot/dialog 0.2.166; npm i jeden lockfile.
- Bejamas przyjmować selektywnie; mapowanie na Wonderful i lokalne poprawki
  wyzwalacza ARIA oraz powrotu fokusu Safari są częścią implementacji.
- [Raport próby](UI-SPIKE-RESULTS.md) i [zasady jakości](CODE-QUALITY.md).
- `npm run verify`: PASS. Format, ESLint 10, Astro check bez błędów/ostrzeżeń/hints;
  10 unit tests, 27 E2E w Chromium/Firefox/WebKit, axe i build 3 stron.
- `npm run test:build`: JS 4684 B gzip, CSS 7344 B gzip; /static/ bez script.
  To zewnętrzne pliki prototypu, bez inline JS i mediów; nie wynik Lighthouse/CWV.
- Przegląd screenshotów desktop/mobile; 320/390/1440 px, reduced motion i CSS zoom
  200% sprawdzone. Ręczny czytnik, natywny zoom i urządzenie fizyczne niesprawdzone.
- Workflow GitHub przygotowany, bez uruchomienia na GitHub (brak remote).
- Node lokalnie 26.8.2; CI ustawione na 24. Pierwsze CI ma potwierdzić zgodność.
- Formularz jest demonstracyjny, nic nie wysyła. Brak Sanity, n8n, c15t,
  ochrony stagingu, serializerów Markdown i docelowego SEO.
- Materiały Wonderful i lokalne skills zachowano. Bez commitów i push.

## Następny krok

Kontynuować etap 2 na istniejącym szkielecie: dodać Sanity Studio, pobieranie
opublikowanej treści i chroniony podgląd używający wspólnych komponentów.
Uzgodnić strukturę workspace przy dodaniu Studio/Workera, zachować npm i jeden
lockfile oraz przenieść istniejące komendy bez utraty testów. Potem rozszerzać
bibliotekę według planu. Nie odtwarzać próby ani nie inicjować projektu od nowa.

## Zasada aktualizacji

Po sesji uaktualniać ten plik i checklisty: oznaczać tylko wykonane i zweryfikowane
zadania, podawać rzeczywiste wyniki i niewykonane kontrole. Istotne zmiany decyzji
odnotować z datą i powodem. Nie przechowywać sekretów.

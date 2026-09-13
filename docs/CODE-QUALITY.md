# Weryfikacja kodu

Stan: wdrożone narzędzia dla prototypu Astro; zakres rośnie razem z aplikacją.
Node 24 (CI, .node-version), npm i jeden package-lock.json. Lokalna próba uruchomiona
na Node 26.8.2 / npm 11.19.1; zgodność na Node 24 musi potwierdzić pierwsze CI.

## Jedna bramka jakości

`npm run verify` wykonuje kolejno formatowanie w trybie check, lint, kontrolę
Astro/TypeScript wszystkich workspace’ów, testy jednostkowe, produkcyjne buildy
Astro i Studio, dry-run bundla Workera, kontrolę artefaktów i testy przeglądarkowe.
Pierwszy błąd zatrzymuje całość. Polecenie nie naprawia kodu.
Przed pierwszym uruchomieniem: `npm ci` oraz `npx playwright install`.

| Polecenie            | Odpowiedzialność                                                                      |
| -------------------- | ------------------------------------------------------------------------------------- |
| npm run format:check | Prettier + plugin Astro: spójny format kodu i dokumentacji                            |
| npm run format       | Jawne formatowanie podczas pracy; nigdy automatyczna naprawa w CI                     |
| npm run lint         | ESLint 10, typescript-eslint, eslint-plugin-astro; zero ostrzeżeń, zakaz explicit any |
| npm run check        | Astro check i TypeScript strict: komponenty, props, importy, kod i testy TS           |
| npm test             | Vitest: logika i przypadki brzegowe, obecnie walidacja formularza demonstracyjnego    |
| npm run build        | Rzeczywisty build statyczny, nie tylko sprawdzenie składni                            |
| npm run test:build   | Budżety gzip, noindex prototypu, jeden H1 i brak JS dla statycznych elementów         |
| npm run test:e2e     | Playwright: Chromium, Firefox, WebKit; uruchamia podgląd wcześniej zbudowanego dist   |

ESLint 10 wybrany zamiast niewspieranego ESLint 9. eslint-plugin-jsx-a11y nie został
włączony: jego aktualne peer dependencies nie obejmują ESLint 10. Kontrole dostępności
realizuje axe-core w przeglądarce oraz scenariusze klawiatury; nie wyłączamy peer checks.

## Testy zachowania i dostępności

Playwright testuje obsługę formularza i błędów, powrót fokusu po dialogu, Escape,
Tab/Shift+Tab, PL/EN, brak przypadkowego wysłania danych, działanie bez JS,
reduced motion, brak overflow przy 320/390/1440 px i zoom CSS 200%.
Axe sprawdza widok strony i otwarty dialog (tagi WCAG 2 A/AA, 2.1 AA, 2.2 AA).

Axe nie dowodzi pełnej zgodności WCAG. Ręczny odbiór UI obejmuje porównanie
z Wonderful, kolejność fokusu, sens etykiet, czytnik ekranu, realny zoom przeglądarki
200% i urządzenia dotykowe. Automatyczny CSS zoom nie zastępuje wszystkich tych kontroli.
Screenshoty są materiałem przeglądu; nie ma automatycznego zatwierdzania nowych
baseline’ów. Testy wizualnej regresji dodać dopiero po zatwierdzeniu wyglądu.

Testy jednostkowe dodajemy dla zachowania i ryzyk, nie dla prostych wrapperów
komponentów lub zmian tekstów. Nie narzucamy sztucznego procentu pokrycia całego repo.
Każda poprawka rzeczywistego błędu powinna dostać adekwatny test regresji.

## Kontrole wdrażane wraz z kolejnymi funkcjami

- Sanity: minimalny schemat strony, TypeGen i repozytorium opublikowanych stron są
  objęte kontrolą typów i testami konfiguracji/kwerendy. Nadal dodać walidację
  pełnych danych demonstracyjnych, nieobsługiwanych sekcji, konfliktów slugów
  oraz brakujących tłumaczeń w hreflang.
- HTML/Markdown: porównanie znaczącej treści, linków, tabel i FAQ; usunięcie publikacji
  usuwa oba formaty. JSON-LD sprawdzany strukturalnie i względem widocznej treści.
- Workers: testy z oficjalnym runtime testowym Cloudflare zamiast samego Node dla
  bindings, kolejek, Turnstile, podpisów webhooków, limitów i awarii n8n.
- c15t/GTM: testy sieciowe braku tagów przed zgodą, zgód częściowych, wycofania,
  powrotu użytkownika i awarii backendu; brak PII w pomiarze.
- Preview/publikacja: odrzucenie dostępu bez sesji, brak szkiców w produkcji,
  kolejność buildów, zachowanie poprzedniego wdrożenia przy awarii.

Każdy z tych zestawów staje się obowiązkową częścią verify/CI przy dodaniu funkcji.
Nie są jeszcze wdrożone — prototyp nie zawiera tych integracji.

## Wydajność i bezpieczeństwo

Budżety prototypu: 25 KiB gzip łącznie dla wygenerowanych zewnętrznych plików JS
oraz 20 KiB gzip CSS. To kontrola regresji tej próby, nie docelowy budżet całej strony.
Pomiar nie obejmuje inline JS, mediów ani nagłówków transportowych. Strona /static/
ma nie zawierać żadnego script. Docelowe budżety per szablon ustalić po wdrożeniu
mediów, c15t i analityki; nie zwiększać ich tylko po to, aby naprawić czerwone CI.

Lighthouse: cel z planu ≥95 przed tagami, osobny pomiar po zgodzie. Pomiar wykonać
na reprezentatywnych gotowych szablonach, bez utożsamiania rozmiaru bundla z CWV.

Przy aktualizacji zależności uruchomić npm audit i przejrzeć zmiany lockfile.
Problemy high/critical blokują wydanie do czasu naprawy lub udokumentowanego
uzasadnienia braku ekspozycji. Bez automatycznego npm audit fix --force.
Sekrety pozostają poza repo; przed publikacją sprawdzić także dist. Brak sekretów
w .gitignore nie zastępuje przeglądu kodu i zmian.

## CI i codzienna praca

.github/workflows/quality.yml uruchamia npm ci, instaluje trzy przeglądarki i wykonuje
verify na push/PR. Ma odczyt repo i zapisuje raport/trace przy błędzie przez 7 dni.
Nie publikuje strony. Po podłączeniu remote ustawić ten job jako wymagany do merge.
Nie jest jeszcze uruchomiony na GitHub, ponieważ repo nie ma remote.

Przy zmianie dokumentacji: format i odnośniki. Przy logice: lint, typy i powiązane
unit tests. Przy UI: dodatkowo build i E2E. Przed przekazaniem zmiany aplikacji:
pełne verify. Czerwonych testów nie wyciszamy; wyjaśniamy przyczynę i naprawiamy.

Referencyjny wonderful-design-system, lokalne skills, zależności, raporty i dist
są wyłączone z formatowania/lintowania. Oceniany jest nasz kod w src, testach,
skryptach i konfiguracji. Materiał referencyjny nie jest automatycznie przepisywany.

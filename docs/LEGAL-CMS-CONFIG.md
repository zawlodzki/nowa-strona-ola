# Strony prawne — konfiguracja CMS

Aktualizacja: 2026-10-10. Status: model, konwerter i fixture’y w kodzie.
**Nie** wykonano zapisu do Content Lake. Wszystkie cztery dokumenty to
**szkice czekające na przegląd radcy prawnego**: nie mają daty wejścia w życie
i zawierają placeholdery `{{…}}`, więc nie wolno ich opublikować.

## Źródło treści

Źródło prawdy (poza repo, tylko do odczytu):
`projekt prawny ola/www-prawne/` — szkice B2C dla Wellbiz sp. z o.o.
(sprzedaż e-booków i konsultacje dietetyczne online).

| Plik źródłowy                                         | Trasa                               | Uwagi                                                   |
| ----------------------------------------------------- | ----------------------------------- | ------------------------------------------------------- |
| `regulamin.md`                                        | `/regulamin/`                       | z dwoma załącznikami na tej samej stronie               |
| `pouczenie-o-odstapieniu.md`                          | `/regulamin/#pouczenie`             | załącznik nr 1, stała kotwica                           |
| `formularz-odstapienia.md`                            | `/regulamin/#formularz-odstapienia` | załącznik nr 2, stała kotwica                           |
| `polityka-prywatnosci.md`                             | `/polityka-prywatnosci/`            |                                                         |
| `lista-cookies-i-identyfikatorow.md`                  | `/lista-cookies-i-identyfikatorow/` | lista docelowa, wymaga skanu produkcji                  |
| `regulamin-newslettera.md`                            | `/regulamin-newslettera/`           |                                                         |
| `zgody-i-formularze.md`                               | — (nie publikujemy)                 | §1 stopka i dane sprzedawcy, §8 informacja pod opiniami |
| `szablony-emaili.md`, `stopka-ebooka.md`, `README.md` | — (nie publikujemy)                 |                                                         |

EN (`/en/privacy/`, `/en/terms/`) ma tylko informację, że wiążąca jest wersja
polska. Dezaktywację EN prowadzi osobny etap.

Regulamin newslettera jest linkowany w informacji pod przyciskiem `LeadForm`
jako `[Regulamin newslettera](/regulamin-newslettera/)` (zgody 2.3 §7).

## Konwerter

```sh
node scripts/convert-legal-md.mjs "<ścieżka>/projekt prawny ola/www-prawne"
node scripts/convert-legal-md.mjs "<ścieżka>/projekt prawny ola/www-prawne" --check
npx tsx scripts/generate-legal-examples.ts
npm run import:legal                     # dry-run do reports/
```

`convert-legal-md.mjs` zapisuje `src/content/legal-bodies/<slug>.json`
(`title`, `version`, `effectiveFrom`, `seoDescription`, `body`) i wypisuje
raport: wersje, daty i pominięte linki wewnętrzne. `--check` niczego nie
zapisuje i kończy się kodem 1, gdy fixture’y odbiegają od źródła. Zasady:

- Komentarz HTML na początku pliku jest pomijany (notatki wewnętrzne).
- H1 to tytuł. H2 tuż pod H1 (przed metryką) dokleja się do tytułu, stąd
  „Regulamin sprzedaży e-booków i świadczenia konsultacji dietetycznych online —
  aleksandraolesiewicz.com”.
- Tabela „Metryka dokumentu” nie jest renderowana. „Wersja” → `version`,
  „Data wejścia w życie” w formacie `DD.MM.RRRR` → `effectiveFrom`;
  `{{DATA_WEJSCIA_W_ZYCIE}}` oznacza brak daty.
- Akapit „obowiązuje od …” przed treścią jest pomijany; datę pokazuje nagłówek
  strony z pól dokumentu.
- Sekcja „Historia wersji” jest pomijana w całości (notatki wewnętrzne).
- H2 dostaje `_key` ze sluga nagłówka; z niego powstaje `id` w HTML i pozycja
  spisu treści. Załącznik: H1 → H2 z kluczem `pouczenie` albo
  `formularz-odstapienia`, jego H2 → H3.
- Linki: `regulamin.md` → `/regulamin/`, `polityka-prywatnosci.md` →
  `/polityka-prywatnosci/`, `lista-cookies-i-identyfikatorow.md` i
  `regulamin-newslettera.md` analogicznie, `pouczenie-o-odstapieniu.md` →
  `/regulamin/#pouczenie`, `formularz-odstapienia.md` →
  `/regulamin/#formularz-odstapienia`. Ścieżki od `/` dostają końcowy ukośnik.
  Linki do `../rodo/`, `../compliance/` i innych plików wewnętrznych są usuwane
  (tekst zostaje) i trafiają do raportu. W obecnych źródłach: brak.
- Cytaty `>` → bloki `blockquote`; kolejne akapity jednego cytatu renderują się
  jako jeden `<blockquote>` (formularz odstąpienia, adresat). Pojedyncze
  złamania wiersza w cytacie łączą się spacją, jak w CommonMark.
- Tabele → `articleTable` (komórki jako inline Markdown: pogrubienie, kod,
  link).
- `{{PLACEHOLDER}}` zostaje dosłownie. Nieobsługiwana składnia (H4, kursywa w
  tabeli, pozostałe `**`) zatrzymuje konwersję.

Przykłady Markdown `src/content/examples/legal-*.md` generuje produkcyjny
serializer z tych samych danych co HTML; test jednostkowy porównuje je 1:1.

## Model w Studio

Dokument `legalPage` (Treści → Strony prawne):

| Pole            | Znaczenie                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `language`      | `pl` albo `en`. Osobne dokumenty, powiązane polem `translation`.                                                                           |
| `title`         | Tytuł H1.                                                                                                                                  |
| `slug`          | Adres. Zarezerwowane: `polityka-prywatnosci`, `regulamin`, `lista-cookies-i-identyfikatorow`, `regulamin-newslettera`, `privacy`, `terms`. |
| `version`       | Wymagane. Numer z metryki, np. `2.2`.                                                                                                      |
| `effectiveFrom` | Data wejścia w życie. Szkic można zapisać bez niej; publikacja jest zablokowana.                                                           |
| `body`          | Portable Text `legalBody`: H2/H3, akapity, listy, linki, cytaty, kod, tabele `articleTable`.                                               |
| `seo`           | Tytuł (max 60) i opis (max 160).                                                                                                           |
| `translation`   | Dokument w drugim języku.                                                                                                                  |

Pod H1 strona pokazuje „Wersja {version} · obowiązuje od DD.MM.RRRR”, a bez daty
„Wersja {version} · data wejścia w życie do ustalenia”. JSON-LD `WebPage` ma
`version`, a `datePublished` tylko przy ustalonej dacie.

### Blokada publikacji

Walidacja `legalPage` (błąd blokuje „Publish”, szkic się zapisuje):

- brak `effectiveFrom`,
- dowolny tekst w `body` (także komórki tabel i adresy linków) zawierający `{{`
  albo `[do sprawdzenia`.

Tę samą regułę (`studio/schema-types/shared/legal-publication.ts`) stosują
`npm run import:legal -- --write` (kończy się kodem 2) oraz `npm run import:3a`
(dokument trafia do `pending`, nie do transakcji). Oba skrypty zapisują
dokumenty opublikowane, więc nie mogą obchodzić walidacji Studio.

## Stopka i dane sprzedawcy

`siteSettings` (decyzje: [HOMEPAGE-CMS-CONFIG.md](HOMEPAGE-CMS-CONFIG.md)):

| Pole                     | Wartość w fixture’ach                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `company`                | Wellbiz sp. z o.o., ul. Lipowa 3D, 30-702 Kraków, KRS, NIP, REGON, kapitał, e-mail, telefon — jedna linia     |
| `legalLinks` (PL)        | Regulamin, Polityka prywatności, Lista cookies, Regulamin newslettera, Odstąpienie od umowy (`/odstapienie/`) |
| `copyright`              | © 2026 Wellbiz sp. z o.o. · Treści: Aleksandra Olesiewicz-Zawłodzka                                           |
| `testimonialsDisclosure` | Informacja pod opiniami z `zgody-i-formularze.md` §8                                                          |

Wartości domyślne: `src/content/site-legal.ts` (czytają go fixture’y i
`scripts/import-homepage-content.mjs`). Puste pola w Content Lake = te wartości.
Blok „Dane firmy” na stronie kontaktu jest sekcją `textSection` dokumentu
`page`; fixture bierze dane z `site-legal.ts`, ale w Content Lake to nadal
osobna kopia (migracja wymaga zmiany kontraktu sekcji kontaktu i jego eksportu
Markdown).

## Otwarte decyzje i blokady

- **Przegląd prawny:** wszystkie dokumenty to szkice. Daty wejścia w życie,
  placeholdery (`{{MAKS_POBRAŃ}}`, `{{CENY_I_PARAMETRY_PAKIETÓW}}`, nazwy cookies
  itd.) i decyzje (np. przeciwwskazania w § 3) czekają na radcę prawnego.
- **Lista cookies:** wymaga skanu produkcji po wdrożeniu c15t i tagów.
- **„Ustawienia cookies”:** polityka i lista cookies odwołują się do linku w
  stopce; dojdzie razem z c15t.
- **Content Lake:** schemat i fixture’y nie oznaczają wdrożenia CMS. Nic nie
  zostało zapisane; import i tak jest zablokowany do czasu usunięcia
  placeholderów i ustalenia dat.

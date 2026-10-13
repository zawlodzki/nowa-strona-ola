# Strony prawne — konfiguracja CMS

Aktualizacja: 2026-10-13. Właściciel zlecił uruchomienie pomiaru produkcyjnego
i wyrównanie źródeł w `projekt prawny ola`. Przygotowano politykę prywatności
i listę cookies 2.3 z datą 13.10.2026 dla GA4 i ręcznego PageView Meta po
właściwej zgodzie. Kontener GTM w wersji 4 jest opublikowany; loader produkcyjny
nadal jest wyłączony. Publikacja nowych dokumentów w Content Lake i aktywacja
loadera pozostają osobnymi krokami. Pozostałe ustalenia pakietu bez zmian.

## Źródło treści

Źródło treści poza repo (aktualizacja dozwolona na zlecenie użytkownika):
`projekt prawny ola/www-prawne/` — szkice B2C dla Wellbiz sp. z o.o.
(sprzedaż e-booków i konsultacje dietetyczne online).

| Plik źródłowy                                         | Trasa                               | Uwagi                                                     |
| ----------------------------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| `regulamin.md`                                        | `/regulamin/`                       | z dwoma załącznikami na tej samej stronie                 |
| `pouczenie-o-odstapieniu.md`                          | `/regulamin/#pouczenie`             | załącznik nr 1, stała kotwica                             |
| `formularz-odstapienia.md`                            | `/regulamin/#formularz-odstapienia` | załącznik nr 2, stała kotwica                             |
| `polityka-prywatnosci.md`                             | `/polityka-prywatnosci/`            |                                                           |
| `lista-cookies-i-identyfikatorow.md`                  | `/lista-cookies-i-identyfikatorow/` | przygotowana wersja 2.3; odbiór produkcji przed aktywacją |
| `regulamin-newslettera.md`                            | `/regulamin-newslettera/`           |                                                           |
| `zgody-i-formularze.md`                               | — (nie publikujemy)                 | §1 stopka i dane sprzedawcy, §8 informacja pod opiniami   |
| `szablony-emaili.md`, `stopka-ebooka.md`, `README.md` | — (nie publikujemy)                 |                                                           |

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

## Stopka

`siteSettings` (decyzje: [HOMEPAGE-CMS-CONFIG.md](HOMEPAGE-CMS-CONFIG.md)):

| Pole                     | Wartość w fixture’ach                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `legalLinks` (PL)        | Regulamin, Polityka prywatności, Lista cookies, Regulamin newslettera, Odstąpienie od umowy (`/odstapienie/`) |
| `copyright`              | © 2026 Wellbiz sp. z o.o. · Treści: Aleksandra Olesiewicz-Zawłodzka                                           |
| `testimonialsDisclosure` | Informacja pod opiniami z `zgody-i-formularze.md` §8                                                          |

Stopka nie pokazuje danych spółki (decyzja 10.10.2026): pełne dane są na
`/kontakt/` i w dokumentach prawnych.

Wartości domyślne: `src/content/site-legal.ts` (czytają go fixture’y i
`scripts/import-homepage-content.mjs`). Puste pola w Content Lake = te wartości.
Blok „Dane firmy” na stronie kontaktu jest sekcją `textSection` dokumentu
`page`; fixture bierze dane z `site-legal.ts`, ale w Content Lake to nadal
osobna kopia (migracja wymaga zmiany kontraktu sekcji kontaktu i jego eksportu
Markdown).

## Stan po publikacji 2.2 — zapis historyczny 11.10.2026

- **Aktualizacja cookies 11.10.2026:** źródło i fixture’y mają wersję 2.2
  oraz datę 11.10.2026. Zmieniono `legal-cookies-pl.body` i sekcję 8 oraz
  powiązane wiersze `legal-privacy-pl.body`. Ujęto cookie i localStorage
  `olesiewicz-consent`, lokalny `ao-theme`, osobne profile zgód i wyłączony
  GTM/GA4/Meta/Clarity. Pole `version` i `effectiveFrom` odzwierciedla tę zmianę.
- Potwierdzona decyzja obowiązuje 365 dni. Cookie wygasa automatycznie;
  localStorage nie ma TTL i pozostaje fizycznie do zastąpienia lub usunięcia.
  Oczekujące wycofanie nie ma daty wygaśnięcia w localStorage i przy kolejnym
  uruchomieniu synchronizuje pełną odmowę. Dowód serwera obejmuje m.in.
  zamaskowany IP, User-Agent i język; historia pozostaje do 36 miesięcy
  od ostatniej decyzji subjectu w danym profilu.
- `ao-theme` przechowuje `light` lub `dark` do zmiany lub wyczyszczenia pamięci,
  wyłącznie po ręcznej zmianie. Nie jest wysyłany do c15t ani analityki.
- **Przegląd prawny:** aktualizacja techniczna nie zatwierdza pozostałego
  zakresu dokumentów, DPIA ani konfiguracji Workspace, płatności i rezerwacji.
  Nie wykonywać pełnego importu pakietu jako części aktualizacji cookies.
- **Lista cookies 2.2:** opis dotyczył stagingu przed konfiguracją kont i
  aktywacją pomiaru. Przygotowany zakres 2.3 jest opisany poniżej.
- **„Ustawienia cookies”:** przycisk w stopce publicznych stron otwiera panel
  PL/EN. Podgląd szkiców go nie uruchamia. Zamknięcie panelu nie zmienia zgód.
- **Publikacja CMS:** opublikowano `legal-cookies-pl` i `legal-privacy-pl`
  w wersji 2.2 po kontroli rewizji i dokładnej zgodności treści szkiców
  z fixture’ami. Odbiór stagingu jest zapisany w [postępie](PROGRESS.md).

## Przygotowana aktualizacja pomiaru 13.10.2026

Decyzja użytkownika z 13.10.2026: włączyć pomiar produkcyjny i wyrównać dokumenty
w repo prawnym. W zakresie pomiaru zastępuje starsze założenia o wyłączeniu
wszystkich e-booków i stron zdrowotnych oraz o nieaktywnych GA4 i Meta.

- Publiczne źródła: `polityka-prywatnosci.md` i
  `lista-cookies-i-identyfikatorow.md`, wersja 2.3, data 13.10.2026.
- Wewnętrzne źródła: `zgody-i-formularze.md` 2.4 (copy cookies) oraz
  `compliance/memo-marketing-afiliacja-piksele.md` 1.5 (sekcja 6d).
- GA4: właściwa zgoda analityczna; neutralny kod sześciu rodzajów stron,
  syntetyczny URL `/m/<kod>`, tytuł równy kodowi i pusty referrer. Retencja
  użytkownika i zdarzeń 2 miesiące, bez resetu użytkownika przy aktywności.
  Wyświetlenia i neutralny czas zaangażowania (`user_engagement`) po zgodzie
  analitycznej; właściciel zatwierdził ten zakres 13.10.2026.
- Meta: właściwa zgoda marketingowa; ręczny PageView, Core włączone,
  domeny strony i referrera dopuszczone przez właściciela; automatyczne
  zdarzenia i automatyczne zaawansowane dopasowywanie wyłączone.
- Kontakt, konsultacje, odstąpienie i dokumenty prawne zawsze poza pomiarem.
  Newsletter nie wyłącza całej strony; wartości pól formularzy są poza pomiarem.
  Pozostałe dopuszczone strony można dodatkowo wyłączyć flagą CMS.
- Clarity pozostaje nieaktywny. Cookies i własne identyfikatory SDK są opisane
  odrębnie od retencji GA4; pomiar nie jest anonimowy. Odbiór skompilowanego
  kontenera potwierdził w Chromium 400 dni dla cookies GA4 oraz 90 dni dla
  `_fbp` i `_fbc`. Lista opisuje GA4 do 2 lat z ograniczeniami przeglądarki
  i Meta do 90 dni.

Fixture’y i ich eksport Markdown są przygotowane do aktywacji. Cztery źródła
w `projekt prawny ola` zaktualizowano po kontroli hashy; zachowano odwracalną
kopię oryginałów. Content Lake nie został jeszcze zmieniony w tym kroku.
Publikować wyłącznie `body`, `version`, `effectiveFrom` istniejących
`legal-privacy-pl` i `legal-cookies-pl`, po kontroli rewizji. Nie wykonywać
pełnego importu sześciu dokumentów ani zmiany niepowiązanych szkiców.

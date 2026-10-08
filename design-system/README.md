# Aleksandra Olesiewicz — design system 3a

Status: **aktywny, docelowy**. Wersja 1.0.0, decyzja użytkownika z 07.10.2026.
Strona docelowa ma realizować wariant **3a** i osiem ujednoliconych mockupów.
Warianty 01, 1a, 02, 2a i 03 są porzucone. Wonderful jest
[archiwum](../archive/wonderful-design-system/README.md), nie źródłem implementacji.

System jest wyodrębnieniem gotowych projektów, nie nową propozycją estetyki.
Nie zmienia ustalonej oferty, cen ani treści. Wdrożona biblioteka i katalog
nie oznaczają migracji wszystkich stron ani konfiguracji Sanity.

## Źródła i pliki

| Obszar                                                | Źródło wykonawcze                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Wartości, pochodzenie, paleta dark, aliasy migracyjne | [tokens.json](tokens.json)                                                                          |
| Wygenerowane custom properties                        | [tokens.css](tokens.css)                                                                            |
| Adapter dawnych klas, tylko dla legacy                | [legacy-tokens.css](legacy-tokens.css)                                                              |
| Reset, typografia, layout, stany, responsywność       | [global.css](../src/design-system/global.css)                                                       |
| Powłoka Astro, font, skip link, head                  | [Layout3a.astro](../src/design-system/Layout3a.astro)                                               |
| Wspólne komponenty                                    | [COMPONENTS.md](COMPONENTS.md)                                                                      |
| Reguły wizualne i dostępność                          | [SPECIFICATION.md](SPECIFICATION.md)                                                                |
| Interakcje i ruch                                     | [MOTION.md](MOTION.md)                                                                              |
| Szablony, Sanity i kolejność migracji                 | [ASTRO-INTEGRATION.md](ASTRO-INTEGRATION.md)                                                        |
| Żywy katalog Astro                                    | [design-system.astro](../src/pages/design-system.astro) → `/design-system/`                         |
| Referencje wyglądu                                    | [osiem mockupów](../mockups/homepage/README.md) i [audyt](../docs/MOCKUPS-3A-CONSISTENCY-REVIEW.md) |

W razie konfliktu pierwszeństwo ma decyzja użytkownika, następnie ujednolicone
mockupy 3a i specyfikacja. Rozbieżność między JSON a CSS blokuje kontrolę tokenów.
Nie czerpać z archiwum Wonderful ani porzuconych kierunków.

## Praca lokalna

W katalogu repo, na Node 24:

```sh
npm run tokens:generate
npm run tokens:check
npm run dev
```

Katalog: `http://127.0.0.1:4321/design-system/`.
Statyczny podgląd po `npm run build`: `npm run preview` pod tym samym adresem.
Mockupy: `node scripts/preview-homepage-mockups.mjs`,
`http://127.0.0.1:8766/mockups/homepage/cherry-white.html`.
Przed przekazaniem kodu: `npm run verify`.

Edytuj JSON, następnie generuj CSS. Nie poprawiaj wygenerowanego pliku ręcznie.
Każdy nowy token musi mieć powtarzalny cel i pochodzenie; wartości sekcji
jednorazowych pozostają w CSS konkretnego szablonu. Komponenty nie wymagają
React, hydratacji ani zewnętrznej biblioteki UI.

## Granica migracji

Aktywna aplikacja i mockupy 3a już czytają nowe tokeny. Aliasy `--wf-*` w osobnym
generowanym `legacy-tokens.css` są adapterem dla dawnych klas, bez drugiego źródła wartości.
Istniejące `src/ui`, `src/sections`, `src/styles/global.css` i katalog `/ui/`
są prototypem przejściowym. Nie odwzorowują jeszcze gotowych stron 3a; przy migracji
zastępuj ich prezentację komponentami `src/design-system` i `Layout3a`.
Usuń aliasy dopiero po usunięciu ich ostatnich zastosowań. Archiwalne propozycje
HTML mają zamrożone tokeny Wonderful i nie są objęte migracją do produkcji.
Makiety 3a nadal używają aliasów i podłączają `legacy-tokens.css` obok tokenów.

## CSS po audycie 08.10.2026

Home/About/Consultation mają osobne wejścia Astro; strony prawne własne
`getStaticPaths`, a legacy wyklucza ich slugi. Nie łączyć ich z powrotem
warunkowym renderowaniem statycznie importowanych widoków. Chroniony podgląd
wybiera te same komponenty przez ComposedPage; nie tworzy osobnych styli.

Typografia używa `rem`, a płynne wielkości wspólnych tokenów `rem + vw/cqi`,
skalibrowanych do 3a przy bazie 16 px. Query kontenerowe mają progi w `rem`.
Powiększony font może przełączyć układ wcześniej i zwiększyć wysokość okładki.
Hover jest ograniczony do myszy, ruch do `no-preference`, a press feedback
pozostaje także w reduced motion. Kontrolki mają obrys w forced colors.

Kolory źródłowe pozostają zatwierdzonym HEX w `tokens.json` dla obliczeń kontrastu.
Generator emituje równoważne OKLCH i pary `light-dark()`; dla Safari <17.5,
Chrome <123 i Firefox <120 działa fallback HEX/dark w `@supports not`.
Nie edytować żadnego generowanego arkusza ręcznie.

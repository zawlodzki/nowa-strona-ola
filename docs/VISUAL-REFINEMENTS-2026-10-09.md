# Akcenty matcha i nawigacja 3a, 09.10.2026

Zakres wynika z prośby użytkownika o navbar widoczny przy przewijaniu,
czytelniejsze linki wewnętrzne i delikatne akcenty matcha. Przegląd obejmuje
osiem lokalnych szablonów z fixture’ów. Staging zwrócił odmowę połączenia
przez proxy, więc nie stanowi źródła potwierdzenia opublikowanego wyglądu.

## Hierarchia akcji

Primary Button pozostaje wiśniowy. Secondary Button zachowuje jasne wnętrze,
obwódkę matcha i kształt tabletki. TextLink jest lżejszą akcją z matcha,
widocznym podkreśleniem i opcjonalną strzałką. Te trzy formy odpowiadają
różnej wadze akcji; link tekstowy nie musi mieć kształtu przycisku.

Kolory pochodzą z istniejących tokenów. `accent` zmienia się z #53671B
na jasnym tle na #D8E78A w ciemnym motywie. Logo, nagłówki, nawigacja,
filtry i primary CTA zachowują obecną hierarchię.

Obliczony kontrast tokenów wynosi 6,32:1 na bieli, 4,85:1 na różowej
powierzchni #F2DCE3 oraz 12,43:1 w ciemnym motywie na #291A21.
Każda z tych par przekracza próg 4,5:1 dla zwykłego tekstu WCAG AA.

## Mapa zastosowań

| Widok             | Akcent i uzasadnienie                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Homepage          | Matcha w `+` przy 450+, linkach TextLink i drobnych checkmarkach oferty. Sama liczba pozostaje wiśniowa.                            |
| O mnie            | Sufiks wskaźnika, TextLink i cienkie kreski przy nagłówkach paneli podejścia. Zdjęcia i duże powierzchnie zachowują paletę.         |
| Konsultacje       | Sufiks wskaźnika prowadzącej, numery etapów, checkmarki oferty i TextLink. Różowe koła etapów i primary CTA pozostają.              |
| Kolekcja e-booków | Wspólny TextLink oraz dotychczasowe detale okładek. Filtry mają już wyraźną hierarchię; dodatkowe przemalowanie nie jest potrzebne. |
| Landing e-booka   | TextLink i istniejący punkt orbity, detale butelek i okładki. Liczba dekoracji jest wystarczająca.                                  |
| Blog              | TextLink w kartach i akcjach. Kategorie i główny wyróżniony artykuł pozostają wiśniowe.                                             |
| Artykuł           | TextLink autora i polecanych materiałów oraz istniejące grafiki produktów. Spis treści i zasadniczy tekst zachowują kolory.         |
| Dokumenty prawne  | Bez dekoracyjnych akcentów. Priorytetem jest czytelny tekst, linki i spis treści dostępny pod stałym nagłówkiem.                    |

## Nawigacja przy przewijaniu

Header używa natywnego `position: sticky` i nieprzezroczystego tła motywu.
`overflow-x: clip` chroni przed poziomowym przewijaniem dekoracji bez
tworzenia przodka przewijania, który blokowałby sticky.
Kotwice, spisy treści i sidebar artykułu uwzględniają przestrzeń nagłówka.
Menu mobilne ma ograniczoną wysokość i własne przewijanie.

Osobny kontener nagłówka oraz progi w `rem` pozwalają przełączyć menu
przy większym tekście i powiększeniu. Test CSS zoom 200% odtworzył błąd
Firefoksa przy progu w `px`; próg w `rem` usuwa tę przyczynę.
Root `scroll-padding` używa `em`, aby WebKit uwzględniał zmieniony rozmiar
tekstu. Offsety spisów treści używają `rem`, niezależnego od mniejszego
fontu sidebaru. Test mierzy pozycję nagłówka docelowego względem navbaru.

Wyniki weryfikacji i ograniczenia odbioru są w [PROGRESS.md](PROGRESS.md).
Reguły wspólnych komponentów są w [specyfikacji 3a](../design-system/SPECIFICATION.md).

# Ruch i interakcje 3a

Zachowujemy oszczędny ruch gotowych mockupów. Domyślny stan jest widoczny.
Nie implementować cyklu animacji Wonderful, shimmerów ani ukrywania sekcji
przed IntersectionObserver. Brak wejściowej animacji nie blokuje treści.

| Element  | Zachowanie                                                            | Wartości                                 |
| -------- | --------------------------------------------------------------------- | ---------------------------------------- |
| CTA      | press scale .98, hover opacity .85                                    | 100 ms / 180 ms                          |
| TextLink | SVG translate(2px,-2px)                                               | 180 ms                                   |
| Karuzela | scrollBy o szerokość regionu, scroll snap                             | native smooth; reduced motion instant    |
| Menu     | native details, Escape → close/focus summary, kliknięcie poza → close | Bez animacji wysokości                   |
| FAQ      | native details, plus obraca się do krzyżyka                           | Stan bez animacji                        |
| Motyw    | zmiana custom properties, aria-pressed                                | Bez animacji kolorów, bez zapisu storage |

`--ao-motion-panel: 250ms`, `--ao-motion-reveal: 600ms` oraz ease-out/quint i expo
pozostają dostępnymi wartościami dla późniejszych, uzasadnionych interakcji.
Ich obecność nie nakazuje tworzenia animacji. Reveal w nowym komponencie wymaga
osobnego zastosowania i kontroli stanu widocznego bez JS.

Karuzela ma focusable region, natywny poziomy scroll i kontrole previous/next.
Granice kontroluje ResizeObserver oraz scroll; niewidoczna geometria nie dzieli
przez szerokość zero. Bez JS ukryte kontrolki nie sugerują działania, a elementy
można przewijać klawiaturą/dotykiem. Brak autoplay i zapętlonych timerów.

CSS reduced motion usuwa animacje/transition i press/ruch strzałki. Statyczny
kadr pozostaje czytelny. Systemowy dark działa bez JS; skrypt stopki dodaje
ręczny przełącznik. Menu pozostaje natywnym disclosure także bez skryptu.

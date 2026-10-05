# Kierunki wizualne (taste-skill v2)

## Design Read

Czytamy to jako: **landing strony głównej** dla kobiet szukających dietetyczki klinicznej (PCOS, IO, perimenopauza), język **trust-first / premium professional**, nie wellness goddess i nie szpital. Mockupy standalone HTML. V1 dziedziczy Wonderful. V2, V3 i V4 to osobne światy na **białym płótnie** (`#fff`).

Płótno strony we wszystkich wersjach: biel. Sekcje mogą mieć linie, chipy i dzielniki. Zakaz pełnostronicowych law (`#EEF1F4`, zieleń leśna, kość jako tło).

Brand w portretach: żakiet malinowy. Akcent malinowy pochodzi z ubrań.

## V1 `v1-design-system.html`

Zachowanie Wonderful: Switzer 300, biel / tusz / linia / oszczędny pomarańcz `#FC762F`, pill CTA, ciemny rozdział konsultacji (język systemu, nie tło strony). Dials: wariancja 5, ruch 4, gęstość 3.

## V2 `v2-cold-studio.html`: zimne studio diagnostyczne

**Reading this as:** landing kliniczny dla kobiet 25-45, język cold luxury (studio diagnostyczne) na białym płótnie, Satoshi, ostre narożniki, jeden akcent malinowy z żakietu.

| Dial | Wartość | Powód |
| --- | --- | --- |
| DESIGN_VARIANCE | 5 | Trust-first, nie Awwwards |
| MOTION_INTENSITY | 4 | Hover, slider |
| VISUAL_DENSITY | 4 | Czytelna oferta |

- Płótno: `#ffffff`. Charakter studia niesie krój, kąt 0, outline, malina `#A33B5C`. Nie szara lawka strony.
- Typ: Satoshi. Zero szeryfów.
- Hero: editorial split (tekst lewo, portret w ramce prawo).
- Interakcja: kwadratowe strzałki, hamburger dropdown.

## V3 `v3-protocol-index.html`: indeks protokołu

**Reading this as:** ten sam produkt, język **indeksu redakcyjnego / arkusza protokołu** na białym płótnie. Clash Grotesk + General Sans. Hero: wycięta sylwetka (`hero.webp`, alfa) na bieli, `object-fit: contain`, bez ramki i bez `cover`. Interakcja: kropki i pasek postępu.

| Dial | Wartość | Powód |
| --- | --- | --- |
| DESIGN_VARIANCE | 7 | Kadr na pełną szerokość, indeks zamiast kart |
| MOTION_INTENSITY | 5 | Pasek postępu, snap, overlay menu |
| VISUAL_DENSITY | 3 | Powietrze magazynu |

- Hero: wycięta sylwetka obok indeksu CTA `01` / `02`. Bez przycinania głowy i ramion.
- Cytaty: jeden na raz. Menu mobilne na cały ekran.
- Partnerzy: zdanie z interpunktami.

Forest-atelier jest wycofany (tło nie było białe).

## V4 `v4-founder-soft.html`: founder / coach

**Reading this as:** landing osobisty dietetyczki-założycielki, język **personal site for founder and coach** (referencja Dribbble 24935244), na białym płótnie. Miękko, dużo powietrza, owalne kadry. Nie boxy V2 i nie indeks V3.

| Dial | Wartość | Powód |
| --- | --- | --- |
| DESIGN_VARIANCE | 6 | Asymetria i owal, nie chaos |
| MOTION_INTENSITY | 4 | Hover scale, okrągłe strzałki |
| VISUAL_DENSITY | 2 | Dużo białego, wąska kolumna tekstu |

- Typ: Chillax (nagłówki, zaokrąglony display) + Author (treść).
- Zasada kształtu: zdjęcia organiczne (owal / koło / `2.75rem`), przyciski i chipy pill.
- Hero: pozdrowienie + H1 osobisty, portret jako owal (nie ramka, nie kadr 16:9).
- Partnerzy: pill chipy. 180+ jako pill. O mnie: kadr koło. Cytaty: dwa zaokrąglone bąble. Menu: zaokrąglony panel.
- Płótno: `#ffffff`. Akcent malinowy na CTA, nie na tło strony.

## Różnice (nie paleta)

| Oś | V1 | V2 | V3 | V4 |
| --- | --- | --- | --- | --- |
| Układ | Split 50/50, ciemny blok | Split w ramce, wielka metryka | Kadr pełnej szerokości, protokół | Owal + powietrze, koło O mnie, bąble cytatów |
| Typ | Switzer 300 | Satoshi | Clash Grotesk + General Sans | Chillax + Author |
| Zdjęcie | Płyta 12 px | Contain, ostry outline | Cut-out contain na bieli | Owal / koło / duży radius |
| Interakcja | Strzałki pill | Strzałki kwadrat | Kropki + pasek, overlay | Okrągłe strzałki, panel zaokrąglony |

## Wspólne (brief)

Te same sekcje, treść PL, CTA (`Zobacz e-booki` / `Umów konsultację`). Partnerzy jako wordmarki tekstowe. Bez obietnic klinicznych. Liczby i cytaty to placeholdery.

gpt-taste (wtórnie): V2 = Editorial Split. V3 = cinematic still. V4 = osobisty split z owalnym portretem. Motion CSS, nie GSAP.

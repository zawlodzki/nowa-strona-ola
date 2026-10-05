# Kierunki wizualne (taste-skill v2)

## Design Read

Czytamy to jako: **landing strony głównej** dla kobiet szukających dietetyczki klinicznej (PCOS, IO, perimenopauza), język **trust-first / premium professional**, nie wellness goddess i nie szpital. Mockupy standalone HTML. V1 dziedziczy istniejący system; V2 i V3 to dwa osobne światy.

Brand już w portretach: żakiet malinowy, loki, złota zawieszka. Akcent malinowy pochodzi z ubrań, nie z palety „glina + krem”.

## V1 `v1-design-system.html`

Zachowanie Wonderful: Switzer 300, biel / tusz / linia / oszczędny pomarańcz `#FC762F`, pill CTA, ciemne rozdziały, pasek partnerów jako tracked caps. Dials jak incumbent: wariancja 5, ruch 4, gęstość 3.

## V2 `v2-cold-studio.html`: zimne studio diagnostyczne

**Reading this as:** landing kliniczny dla kobiet 25-45, język cold luxury (studio diagnostyczne), Satoshi, chłodne szarości + jeden akcent malinowy z żakietu.

| Dial | Wartość | Powód |
| --- | --- | --- |
| DESIGN_VARIANCE | 5 | Trust-first, nie Awwwards |
| MOTION_INTENSITY | 4 | Hover, slider, delikatny reveal |
| VISUAL_DENSITY | 4 | Czytelna oferta, nie galeria |

- Paleta: Cold Luxury. Tło `#EEF1F4`, tusz `#1C2228`, stal `#6B7580`, akcent `#A33B5C` (desaturacja < 80%). Zakaz kremu i mosiądzu.
- Typ: Satoshi (Fontshare). Zero szeryfów.
- Promień: 0 (ostre studio).
- Hero: editorial split, max 4 elementy tekstowe, CTA w pierwszym viewportcie.
- Motyw: jasny, spójny; `prefers-color-scheme: dark` w tej samej rodzinie chłodnej, bez inwersji sekcji.
- Układy: split hero, pasek logo, metryki jako duża typografia (nie 3 identyczne karty), O mnie pełna szerokość, slider e-booków, blok konsultacji, slider opinii, formularz, stopka.

## V3 `v3-forest-atelier.html`: atelier leśne

**Reading this as:** ten sam produkt, język Forest (ciemna zieleń wnętrza + kość + malina z portretu), Cabinet Grotesk, fotografia prowadzi.

| Dial | Wartość | Powód |
| --- | --- | --- |
| DESIGN_VARIANCE | 7 | Asymetria, większa skala obrazu |
| MOTION_INTENSITY | 6 | Reveal, hover scale, jeden marquee partnerów |
| VISUAL_DENSITY | 3 | Powietrze, rozdziały jak kadry |

- Paleta: głęboka zieleń `#16241C`, kość `#E8EDE6` (chłodna, nie krem rzemieślniczy), malina `#C45B6A`. Jeden akcent na całą stronę.
- Typ: Cabinet Grotesk. Zero szeryfów.
- Promień: 12 px, miękki.
- Hero: artystyczna asymetria, portret nachodzi na typ.
- Motyw: ciemny lock (cała strona las). Kość to tekst, nie tło-papier.
- Jeden marquee partnerów. Slider e-booków 3 widoczne. Bez kickerów numerowanych.

## Wspólne (brief)

Te same sekcje, ta sama treść PL, te same CTA (`Zobacz e-booki` / `Umów konsultację`). Partnerzy jako wordmarki tekstowe (ALAB, UNS, Norsan, Norsa Pharma, Omni-Biotic). Bez obietnic klinicznych. Liczby i cytaty to placeholdery.

gpt-taste (wtórnie): V2 hero = Editorial Split, V3 = Artistic Asymmetry. Fonty z puli Satoshi / Cabinet. Motion CSS, nie GSAP (standalone HTML).

# Mockupy strony głównej

Trzy samodzielne pliki HTML do wyboru kierunku wizualnego. Otwieraj lokalnie w przeglądarce (podwójne kliknięcie albo `python3 -m http.server` w tym katalogu). Font V1 jest w `assets/`. V2 i V3 ładują Satoshi / Cabinet Grotesk z Fontshare CDN.

To nie jest produkcyjna strona Astro i nie podłącza Sanity.

## Pliki

| Plik | Kierunek |
| --- | --- |
| [v1-design-system.html](v1-design-system.html) | Obecny język Wonderful |
| [v2-cold-studio.html](v2-cold-studio.html) | Zimne studio diagnostyczne |
| [v3-forest-atelier.html](v3-forest-atelier.html) | Ciemne atelier leśne |

Plan V2/V3: [DIRECTIONS.md](DIRECTIONS.md). Kierunek od zera: skill `design-taste-frontend` (v2, nie v1). Impeccable nie planuje V2/V3. Zrzuty: [previews/](previews/).

## Różnice

**V1** zostawia design system z repo: Switzer 300, biel i tusz, linia `#E6E6E6`, pill przyciski, kwadrat pomarańczowy, jasne i ciemne rozdziały. To jest „jak strona wygląda dziś”, tylko z nową strukturą sekcji.

**V2** jest innym światem: Satoshi, ostre narożniki, chłodna szarość `#EEF1F4`, jeden akcent malinowy z żakietu Oli (`#A33B5C`). Wygląda jak prywatne studio diagnostyczne, nie jak wellness. Hero split, metryki jako wielka typografia zamiast trzech kart, konsultacja na płycie stalowej (bez inwersji na czerń).

**V3** jest trzecim światem: Cabinet Grotesk, zaokrąglenie 12 px, ciemna zieleń `#16241C`, kość i ta sama malina. Fotografia prowadzi, portret nachodzi na typ, partnerzy w jednym marqueee. Cała strona zostaje w lesie. Nie jest to V2 z innym kolorem.

Wspólna treść: te same sekcje, CTA (`Zobacz e-booki` / `Umów konsultację`), partnerzy jako wordmarki tekstowe, e-booki z researchu (PCOS suplementy, skład ciała w perimenopauzie, badania, fenotyp szczupły). Liczba 180+ i cytaty są **poglądowe**.

## Sekcje (wszystkie wersje)

1. Nawigacja
2. Hero ze zdjęciem i dwoma CTA
3. Pasek partnerów (ALAB Laboratoria, UNS, Norsan, Norsa Pharma, Omni-Biotic)
4. Dlaczego ja (wyniki behawioralne + liczba)
5. O mnie + link `/o-mnie`
6. Slider e-booków (3 widoczne na desktopie, przewijanie poziome)
7. Konsultacje + link `/konsultacja`
8. Slider opinii
9. Newsletter
10. Stopka: Instagram, Facebook, TikTok

## Poza zakresem

Brak przepisu stron Astro, schematów Sanity i tras produkcyjnych.

## Kontrole

Wykonane 2026-10-05 w Chromium (1440×900 i 390×844) na lokalnym serwerze `python3 -m http.server` w tym katalogu:

- [x] Desktop i mobile (zrzuty viewport i full-page w `previews/`)
- [x] Slider e-booków: 4 karty, **3 widoczne** na 1440 px; „Następne” przewija
- [x] Slider opinii (te same przyciski)
- [x] Menu mobilne (hamburger otwiera nawigację)
- [x] Newsletter: pusty e-mail → błąd; `anna@poczta.pl` → komunikat poglądowy, bez wysyłki
- [ ] `prefers-reduced-motion`: reguły CSS są; nie odpalano osobnej sesji z tym ustawieniem
- [ ] 320 px, zoom 200%, klawiatura end-to-end — nie robione w tej sesji

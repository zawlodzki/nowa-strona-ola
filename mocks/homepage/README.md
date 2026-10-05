# Mockupy strony głównej

Cztery samodzielne pliki HTML do wyboru kierunku wizualnego. Otwieraj lokalnie w przeglądarce (podwójne kliknięcie albo `python3 -m http.server` w tym katalogu). Font V1 jest w `assets/`. V2 Satoshi, V3 Clash Grotesk + General Sans, V4 Chillax + Author z Fontshare CDN.

Płótno strony we wszystkich wersjach: **biel** (`#fff`). To nie jest produkcyjna strona Astro i nie podłącza Sanity.

## Pliki

| Plik | Kierunek |
| --- | --- |
| [v1-design-system.html](v1-design-system.html) | Obecny język Wonderful |
| [v2-cold-studio.html](v2-cold-studio.html) | Zimne studio diagnostyczne (białe płótno) |
| [v3-protocol-index.html](v3-protocol-index.html) | Indeks protokołu (białe płótno) |
| [v4-founder-soft.html](v4-founder-soft.html) | Founder / coach, miękkie krzywe (białe płótno) |

Wycofane: `v3-forest-atelier.html` (tło nie było białe).

Plan: [DIRECTIONS.md](DIRECTIONS.md). Kierunek od zera V2–V4: skill `design-taste-frontend` (v2, nie v1). Zrzuty: [previews/](previews/).

## Różnice

**V1** zostawia design system z repo: Switzer 300, biel i tusz, linia `#E6E6E6`, pill przyciski, kwadrat pomarańczowy. Konsultacje mają ciemny rozdział Wonderful; płótno strony zostaje białe.

**V2** jest innym światem na bieli: Satoshi, ostre narożniki, outline, jeden akcent malinowy z żakietu (`#A33B5C`). Nie ma szarej lawki `#EEF1F4`. Hero split, metryki jako wielka typografia, slider ze strzałkami kwadratowymi.

**V3** jest trzecim światem na bieli, nie wariacją koloru: Clash Grotesk + General Sans, kadr filmowy na pełną szerokość (potem typ), partnerzy jako zdanie z kropkami, protokół numerowany, slider z kropkami i paskiem, cytat jeden na raz, menu mobilne na cały ekran.

**V4** jest czwartym światem na bieli, inspirowany osobistą stroną founder/coach: Chillax + Author, owalny portret, koło w O mnie, dużo powietrza, chipy partnerów, okrągłe strzałki, zaokrąglone cytaty. Mniej kanciasto niż V2, mniej „indeks magazynu” niż V3, inny rytm niż Wonderful.

Wspólna treść: te same sekcje, CTA (`Zobacz e-booki` / `Umów konsultację`), partnerzy jako wordmarki tekstowe, e-booki z researchu. Liczba 180+ i cytaty są **poglądowe**.

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

Chromium 1440×900 i 390×844, 2026-10-05, serwer `python3 -m http.server` w tym katalogu:

- [x] Desktop i mobile (zrzuty viewport i full-page w `previews/`) dla V1–V4
- [x] Slider e-booków: 4 karty, **3 widoczne** na 1440 px
- [x] Slider opinii
- [x] Menu mobilne
- [x] Newsletter: pusty e-mail → błąd; `anna@poczta.pl` → komunikat poglądowy, bez wysyłki
- [x] `body` tło `rgb(255, 255, 255)` we wszystkich czterech
- [ ] `prefers-reduced-motion`: reguły CSS są; nie odpalano osobnej sesji
- [ ] 320 px, zoom 200%, klawiatura end-to-end

# Podmiana zdjęcia „O mnie”, 2026-10-09

Źródło wskazane przez użytkownika:
[Instagram, lipiec 2023](https://www.instagram.com/p/CvUc_R0o9Kn/).
Pliki strony i opis eksportu: [fotografie](../../../src/assets/portraits/README.md).

Zrzuty obejmują nowe zdjęcie we wszystkich siedmiu widokach 3a, przy 390
i 1440 px. Artykuł używa go dwukrotnie, jako awatar i zdjęcie w biogramie.
Zrzuty małych awatarów przedstawiają rzeczywisty rozmiar interfejsu.

- [Profil na desktopie](about-1440.png)
- [Profil na mobile](about-390.png)
- [Kadry na desktopie](portrait-crops-desktop.png)
- [Kadry na mobile](portrait-crops-mobile.png)
- [Wyniki kontroli](checks.json)

Automatyczna kontrola lokalnego podglądu obejmuje Chromium, Firefox i WebKit,
siedem widoków i trzy szerokości 320/390/1440 px, łącznie 63 przypadki.
Sprawdza załadowanie nowego zdjęcia 1440 × 1800 px oraz brak overflow.
Profil sprawdzono dodatkowo klawiaturą, z CSS zoom 200%, reduced motion
i bez JavaScriptu w każdym z trzech silników. Potwierdzono też identyczność
pikseli źródłowego JPEG i zachowanego PNG.

Nie sprawdzono natywnego zoomu 200%, czytnika ekranu ani urządzenia fizycznego.
Nie importowano mediów do Sanity ani nie publikowano zmian.

Końcowe `npm run verify` PASS na Node 24.21.0: 57 testów jednostkowych i 81 E2E.

## Gałąź PR na aktualnym main

Końcowe `npm run verify` PASS: 181 unit, 201 E2E, 84 dokumenty CMS
bez błędów i zgodność sekcji, zdjęć oraz DOM na 15 stronach.
Oceniono gotowy build Astro po symulacji CMS:
[desktop 1440 px](astro-about-1440.png) i [mobile 390 px](astro-about-390.png).
Nowy portret ma punkt kadru 50%/15%, a podpis o AI nie jest renderowany.

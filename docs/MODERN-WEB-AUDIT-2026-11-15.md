# Audyt zgodności z Modern Web Guidance — 15.11.2026

Status: **analiza, bez zmian w kodzie**. Żadna z rekomendacji nie jest
wdrożona. Elementy dotykające wyglądu lub ruchu wymagają decyzji względem
[design systemu 3a](../design-system/README.md) i MOTION.md.

## Zakres i metoda

- Źródło wytycznych: skill `modern-web-guidance` (GoogleChrome, wersja
  `2026_11_09-5bcc021b`), CLI `npx modern-web-guidance@latest`.
- `legacy-scan src --json`: 33 poradniki, 35 reguł deterministycznych
  (ok. 20% katalogu). Wynik: 4 trafienia, po weryfikacji 1 rzeczywiste.
- Ręczny przegląd pozostałych 80% katalogu: nagłówek i menu mobilne, dialogi,
  zgody, FAQ, karuzela, odsłanianie przy przewijaniu, motyw, formularze,
  obrazy, fonty. Porównanie z poradnikami: `navbar`, `navigation-drawer`,
  `accordion`, `animate-to-from-top-layer`, `dialog`,
  `declarative-dialog-popover-control`, `improve-next-page-load-performance`,
  `cross-document-transitions`, `scroll-entry-exit-effects`, `carousel`,
  `dark-mode-toggle`, `forms`, `validate-input-after-interaction`,
  `form-fields-automatically-fit-contents`, `optimize-image-priority`,
  `visually-stable-font-fallbacks`.
- Weryfikacja na zbudowanym HTML: `astro build` z fixture’ami (bez
  `PUBLIC_SANITY_*`) do katalogu tymczasowego, 47 stron.

Domyślna polityka wytycznych: funkcje _Baseline Widely available_ bez
fallbacku, _Newly available_ i _Limited_ tylko z fallbackiem lub jako
progresywne ulepszenie. Projekt nie ma zapisanej własnej polityki
przeglądarek (patrz „Następny krok”).

## Ocena ogólna

Strona jest zbudowana nowocześnie. Na plus: natywne `<dialog>` z
`closedby="any"` i Invoker Commands (`commandfor`/`command`) z wykrywaniem
wsparcia, `<details>` dla FAQ, container queries, `text-wrap`, `:has()`,
`@starting-style` w banerze zgód, `100dvh`, `scroll-snap`, `:focus-visible`,
`forced-colors`, `prefers-reduced-motion` (12 miejsc), self-host fontu z
`preload`, `fetchpriority="high"` na obrazie LCP, `color-scheme` w `<meta>` i
CSS, motyw działający bez JS. Skan nie znalazł przestarzałych wzorców poza
jednym drobnym przypadkiem.

Największe rezerwy są w **wydajności ładowania** (obrazy, nawigacja między
stronami), a nie w przestarzałym kodzie.

## Ustalenia według priorytetu

### P1 — duży wpływ, niskie ryzyko

#### 1. Obrazy bez wariantów rozmiaru (`srcset`/`sizes`)

- Dowód: w zbudowanym HTML żadna strona nie ma `srcset`. Każdy `<img>` ma
  jeden plik 1122–1536 px szerokości (WebP do ok. 316 KB), także na
  telefonie 320 px. `SiteImage` wymusza `layout="none"`
  ([SiteImage.astro:60](../src/design-system/components/SiteImage.astro)).
- Skutek: kilkukrotnie za duży transfer na mobile i wolniejszy LCP.
- Kierunek: `widths` + `sizes` w `<Image>` (lub układ `constrained`), przy
  zachowaniu bramki „Jeden kadr zdjęcia” (`imageCropPosition` i `SiteImage`:
  jeden kadr, wiele szerokości). Rozważyć AVIF z WebP jako zapasem.
- Uwaga: to nie jest temat poradników `modern-web-guidance` (katalog nie
  ma poradnika o `srcset`); wynika z weryfikacji zbudowanego HTML.

#### 2. Brak Speculation Rules (prefetch/prerender kolejnej strony)

- Poradnik: `improve-next-page-load-performance`. Statyczne MPA z cache na
  edge to wzorcowy przypadek.
- Kierunek: `<script type="speculationrules">` w `Layout3a` z regułą
  dokumentu, `prefetch` z `eagerness: "moderate"`. Wykluczyć adresy ze
  stanem lub płatnością: `/zamowienie*`, `/po-zakupie*`, `/api/*`, linki
  `rel~=nofollow`. Prerender dopiero po decyzji.
- Wsparcie: Limited (Chrome, Edge). Progresywne ulepszenie, inne
  przeglądarki ignorują regułę.
- Do sprawdzenia: wpływ na analitykę i zgody (prerender uruchamia skrypty;
  przy samym prefetchu ten problem nie występuje).

#### 3. Miniatury poniżej pierwszego ekranu ładowane `eager` + `decoding="sync"`

- Dowód: `/blog/` ma 7 obrazów `eager`, w tym 6 miniatur kart z
  `decoding="sync"`
  ([BlogCollection3a.astro:149](../src/views/BlogCollection3a.astro)).
  Podobnie `Article3a`, `About3a` i ozdobnik `BookCoverArt` na stronie
  głównej ([BookCoverArt.astro:69](../src/design-system/decorations/BookCoverArt.astro)).
- Poradnik `optimize-image-priority`: obrazy poniżej pierwszego ekranu
  powinny mieć `loading="lazy"`, `fetchpriority="high"` tylko dla LCP.
- Kontekst: `eager` wprowadzono świadomie dla zgodności z makietą
  (commit bc75bc1, „eager-load miniatur”). Wymiary i `aspect-ratio` już
  chronią przed przesunięciem układu, więc `lazy` powinno dać ten sam
  wygląd. Decyzja do ponownej oceny, nie błąd.

### P2 — usprawnienia UX i odporności

#### 4. Menu mobilne na `<details>` z ręcznym Escape i kliknięciem poza

- Dowód: [SiteHeader.astro:43](../src/design-system/components/SiteHeader.astro)
  oraz skrypt z nasłuchami `keydown` i `click` na `document` (linie 55–80).
  Dwie kopie listy linków (desktop i mobile).
- Poradnik `navbar`: jedna lista nawigacji; w wąskim układzie
  `<button popovertarget>` + `popover="auto"`, które natywnie dają light
  dismiss, Escape i powrót fokusu. Poradnik wprost odradza własne nasłuchy
  Escape i kliknięcia poza.
- Wsparcie: Popover jest Baseline Newly available od 27.01.2025. Działa bez
  JS (atrybut deklaratywny). Starsze przeglądarki: polyfill
  `@oddbird/popover-polyfill` albo pozostawienie `<details>` jako zapasu.
- Ryzyko: obecne `<details>` działa bez JS i bez polyfillu. Zmiana wymaga
  testu fokusu w Safari zgodnie z [próbą UI](UI-SPIKE-RESULTS.md).

#### 5. Dialogi animują tylko wejście

- Dowód: `.ao-dialog[open]` ma `@keyframes ao-dialog-in`
  ([global.css:706](../src/design-system/global.css)); zamknięcie i
  `::backdrop` znikają skokowo.
- Poradnik `animate-to-from-top-layer`: przejście z `@starting-style`,
  `overlay` i `display` w `transition-property` oraz osobna deklaracja
  `transition-behavior: allow-discrete`, także dla `::backdrop`.
- Uwaga z poradnika: Firefox parsuje `allow-discrete`, ale nie animuje
  `display` (bug 1882408). Wyjście trzeba zabezpieczyć fallbackiem z
  poradnika albo zaakceptować skokowe zamknięcie tam, gdzie brak wsparcia.
- Wymaga zgodności z MOTION.md i trybem reduced motion.

#### 6. FAQ bez animacji otwierania

- [FaqItem.astro:9](../src/design-system/components/FaqItem.astro).
  Poradnik `accordion`: `::details-content` (Baseline 16.09.2025) z
  `interpolate-size: allow-keywords` (Limited) i `transition-behavior`.
  Progresywne: bez wsparcia otwiera się natychmiast, jak dziś.
- Decyzja projektowa: poradnik zaleca znacznik przy etykiecie, a nie przy
  prawej krawędzi. Obecny układ wynika z makiety 3a; nie zmieniać bez
  decyzji.

#### 7. Fallback fontu bez wyrównania metryk

- `--ao-font: "Switzer", Arial, sans-serif` (design-system/tokens.css:43),
  `font-display: swap` ([fonts.css](../src/styles/fonts.css)), brak
  `font-size-adjust` i `size-adjust`.
- Poradnik `visually-stable-font-fallbacks`: `font-size-adjust: from-font`
  (Baseline 2024) albo `@font-face` dla Arial z `size-adjust`,
  `ascent-override`, `descent-override`. `preload` ogranicza problem, ale
  nie usuwa przesunięcia przy wolnym łączu.

#### 8. Przejścia między stronami (cross-document view transitions)

- Poradnik `cross-document-transitions`: `@view-transition { navigation: auto; }`
  wewnątrz `prefers-reduced-motion: no-preference`. Wsparcie Limited
  (Chrome, Edge, Safari 18.2+); bez wsparcia zwykła nawigacja.
- To propozycja projektowa, nie brak. MOTION.md nie przewiduje przejść
  między stronami, więc wymaga decyzji przed wdrożeniem.

### P3 — porządki

#### 9. Panel zgód: zbędny ręczny light dismiss (jedyne potwierdzone trafienie skanu)

- [consent-panel.ts:106](../src/lib/consent-panel.ts): nasłuch kliknięcia
  w tło zamyka dialog, choć dialog ma już `closedby="any"`
  (ConsentPanel.astro:159). Brak wykrywania wsparcia, inaczej niż w
  `WaitlistDialog`.
- Kierunek: objąć warunkiem `!("closedBy" in HTMLDialogElement.prototype)`;
  przycisk zamknięcia (linia 102) może dostać `commandfor` +
  `command="close"` z fallbackiem jak w `WaitlistDialog`.
- Fałszywe trafienia skanu: `WaitlistDialog.astro:89–90` to fallback
  objęty `if (!supportsCommands)`, zgodny z poradnikiem.

#### 10. Przełącznik motywu utrwala wybór zgodny z systemem

- [ThemePreference.astro:32–35](../src/design-system/components/ThemePreference.astro)
  zapisuje `light`/`dark` zawsze. Poradnik `dark-mode-toggle`: gdy wybór
  równa się preferencji systemu, usunąć zapis, inaczej strona przestaje
  reagować na zmianę ustawień systemu. Interfejs powinien też pozwalać
  wrócić do trybu systemowego.

#### 11. Formularze

- Pole „Imię” (`name="name"`, `type="text"`) nie ma `autocomplete`; mapa
  obejmuje tylko `email` i `tel`
  ([LeadForm.astro:83](../src/design-system/components/LeadForm.astro)).
  Dodać `autocomplete="given-name"` (poradnik `forms`).
- `<textarea rows="6">`: opcjonalnie `field-sizing: content` z
  `min-block-size`/`max-block-size` (Baseline Newly 16.06.2026,
  progresywne).
- Walidacja przez `aria-invalid` po wysłaniu jest poprawna. Można dodać
  styl `:user-invalid` (Widely available) dla błędów po opuszczeniu pola;
  komunikaty i `aria-describedby` zostają.

#### 12. Karuzela przelicza położenie przy każdym zdarzeniu `scroll`

- [Carousel.astro:209](../src/design-system/components/Carousel.astro):
  `update()` czyta `getBoundingClientRect` przy każdym `scroll`. Poradnik
  `carousel`: rozliczać stan na `scrollend` (Baseline Newly 12.12.2025), z
  debounce `scroll` tylko jako fallback.
- Zgodne z poradnikiem: zwykłe przyciski zamiast `::scroll-button()` i
  `::scroll-marker` („Do not use … for now”), `scroll-snap`, reduced motion.

#### 13. Odsłanianie przy przewijaniu na IntersectionObserver

- [reveal.ts:43](../src/lib/reveal.ts). Działa poprawnie i szanuje reduced
  motion. Scroll-driven animations (`animation-timeline: view()`) są
  Baseline Newly dopiero od 27.10.2026; poradnik
  `scroll-entry-exit-effects` dopuszcza obecny skrypt jako fallback.
  Migracja bez pilnej potrzeby.

## Czego nie sprawdzono

- Brak pomiarów Lighthouse/CrUX i testu na urządzeniach; wpływ P1 to
  szacunek z rozmiarów plików, nie pomiar.
- Build wykonany na Node 26 (nvm z Node 24 niedostępny w tej powłoce) i na
  fixture’ach, nie na danych z Sanity. `npm run verify` nie uruchamiany,
  bo nie zmieniano kodu.
- Studio, podgląd SSR i Worker poza zakresem.
- `legacy-scan` obejmuje ok. 20% katalogu; reszta to przegląd ręczny
  wybranych wzorców, nie pełny katalog 250 funkcji.

## Następny krok

1. Zapisać politykę przeglądarek w `AGENTS.md` (np. „Newly available z
   progresywnym ulepszeniem, fallback ≤ 20 linii, bez zależności”), żeby
   kolejne decyzje miały punkt odniesienia.
2. Wdrożyć P1 jako osobne zmiany: responsywne obrazy w `SiteImage`,
   speculation rules w `Layout3a`, ocena `eager` w kartach. Każdą z
   `npm run verify` i porównaniem z makietą na desktopie i mobile.
3. Decyzje projektowe dla P2 (menu, animacje, przejścia stron) przed
   implementacją.

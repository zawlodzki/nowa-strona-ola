# Motion system

O — odczyt CSS/WAAPI, W — zachowanie zaobserwowane, R — zalecana implementacja. Dokładne surowe keyframes są w `evidence/*-desktop.json`, w polu `animations`. Odczyt nie przechwytuje automatycznie całej logiki JavaScript/Framer ani animacji już zakończonych. Brak pozycji w `getAnimations()` nie dowodzi braku ruchu.

## 1. Charakter ruchu

**W:** duża, spokojna scena tła i małe, precyzyjne zdarzenia w interfejsie. Ruch nie polega na sprężystych, przesadzonych skokach. Etykiety wyłaniają się z kwadratu, panel otwiera się na osi X, tekst pojawia się w krokach, punkty aktywują falą.

**R:** rozdzielić trzy warstwy: mikrointerakcje 100–250 ms, wejścia/zmiany scen 350–700 ms, dekoracyjny ruch ciągły 3–18 s. Nie podłączać wszystkich elementów do jednego `transition: all`.

## 2. Tokeny

| Token | Wartość | Pochodzenie |
|---|---|---|
| `ease.out-expo` | `cubic-bezier(.16,1,.3,1)` | O: panel etykiety |
| `ease.out-quint` | `cubic-bezier(.22,1,.36,1)` | O: kwadrat etykiety |
| `ease.in-out` | `ease-in-out` | O: fala punktów / oddech impulsu |
| `ease.linear` | `linear` | O: ruch po ścieżce / shimmer |
| `ease.type` | `steps(N,end)` | O: N zależy od liczby znaków |
| `duration.press` | 100 ms | R |
| `duration.hover` | 180 ms | R |
| `duration.panel` | 250 ms | R: menu/tabs |
| `duration.reveal` | 600 ms | R: wejście sekcji |
| `duration.stagger` | 70 ms | R: grupa elementów |
| `duration.dot-in` | 450 ms | O |
| `duration.dot-out` | 1400 ms | O |
| `duration.tag-box-in` | 220 ms | O |
| `duration.tag-panel-in` | 340 ms | O |
| `duration.tag-type-in` | 550 ms | O |
| `duration.tag-type-out` | 350 ms | O |
| `duration.tag-panel-out` | 272 ms | O |
| `duration.tag-box-out` | 176 ms | O |
| `duration.beam` | 6000 ms | O |
| `duration.beam-breath` | 3000 ms | O |
| `duration.shimmer` | 5000 ms | O |

## 3. Odczytane sekwencje

### M01 — fala kwadratowych punktów

**O:** `wfDotWave2…`, `opacity`, pętla; przy 1440 px okres 17050 ms. W pierwszym odczycie przy 1415 px było 17490 ms. Okres/delaye zależą więc od konfiguracji lub geometrii instancji; 17.05 s nie jest uniwersalną stałą całej witryny.

Przebieg lokalny każdego punktu dla próbki 1440 px:

| Czas | Opacity |
|---|---|
| 0 ms | 0 |
| 450 ms | 1 |
| 13450 ms | 1 |
| 14850 ms | 0 |
| 17050 ms | 0; kolejna iteracja |

Easing odcinków `ease-in-out`; easing całej animacji `linear`. Poszczególne elementy miały różne opóźnienia, m.in. 188, 263, 525, 600, 787, 1125, 1800 ms. **R:** fala od środka siatki; dokładnego algorytmu wyznaczania delay nie odtworzono. Katalog demonstruje taki własny rozkład. Reduced motion: wszystkie istotne punkty statyczne, dekoracyjne z opacity .5. Pauza poza viewport.

### M02 — etykieta systemu: kwadrat + panel + typewriter

**O:** zagnieżdżone elementy `.wf-tag-box`, `.wf-tag-panel`, `.wf-type`. Próbka home przy 1440 px:

| Czas lokalny | Zdarzenie |
|---|---|
| 0–220 ms | box `opacity:0→1`, `scale:.2354→1`, out-quint |
| 220–560 ms | panel `scaleX:0→1`, out-expo |
| 560–1110 ms | tekst od 0 do pełnej szerokości, `steps(N)` |
| 1110–2010 ms | pełna etykieta, hold 900 ms |
| 2010–2360 ms | usunięcie tekstu, `steps(N)` |
| 2360–2632 ms | panel `scaleX:1→0`, out-expo |
| 2632–2808 ms | box `opacity:1→0`, `scale:1→.2354`, out-quint |
| 2808–17050 ms | niewidoczny; następna iteracja |

**O:** AI OS stosuje tę samą mechanikę, ale hold tekstu wynosi 2000 ms: usuwanie 3110–3460, panel zamyka 3460–3732, box znika 3732–3908. Wspólny okres próbki to 17050 ms. Opóźnienia instancji obejmowały np. 1125, 3683, 6385, 9200, 9500, 11757, 12057 ms.

**O:** N = 3/4/5/6/9/10/12 zależnie od etykiety. Szerokość 10 znaków w próbce ~94.863 px; to wynik fontu i rozmiaru, nie uniwersalna szerokość.

**R:** nie skaluje się samych glifów podczas rozwijania panelu. Panel tła i tekst osobnymi warstwami; punkt kotwiczenia przy kwadracie. Katalog stosuje `clip-path` zamiast animacji width tekstu, zachowując czas i kroki. Jest to adaptacja ograniczająca layout, nie identyczny kod źródłowy. Przy szybkim ponownym uruchomieniu anulować poprzednie animacje. Przy reduced motion pokazać cały napis, panel i kwadrat bez przejść. Czytnik ekranu otrzymuje jeden stały opis diagramu.

### M03 — impuls po ścieżce

**O, AI OS:** `wfBeamMove`, 6000 ms, linear, `offset-distance:0%→100%`, pętla. Oddzielna animacja `wfBeamBreath25to100`, 3000 ms, ease-in-out: opacity .25 → 1 w 1500 ms → .25 w 3000 ms.

**R:** stosować w nieinteraktywnych diagramach, ścieżkę dopasować do rzeczywistych węzłów. Katalog pokazuje liniową ścieżkę z transform; SVG/CSS offset-path to docelowa możliwość dla bardziej złożonej geometrii. Bez pętli poza viewport. Reduced motion: statyczna linia i wyróżniony węzeł końcowy.

### M04 — shimmer komunikatu

**O:** animacja `eKXFfL`, 5000 ms, linear, `background-position:200% 50%→-100% 50%`. **R:** dekoracyjny połysk maksymalnie subtelny, nie zmieniający czytelności liter. Katalog demonstruje gradientową maskę tekstu. Reduced motion: jednolity kolor. Po 5 s zapewnić możliwość pauzy ruchu ciągłego lub ograniczyć liczbę iteracji.

### M05 — film hero

**O/W:** home wykorzystuje wyciszony, zapętlony film; mobile ma osobny asset 9:16. Ruch jest częścią materiału, nie CSS parallax. Czas pliku ani montaż nie zostały oznaczone jako token.

**R:** poster widoczny od razu; film włączany po gotowości, krótki crossfade 350 ms. `muted playsinline`, możliwość pauzy, reduced motion = poster. Nie ładować filmu w katalogu demonstracyjnym bez potrzeby. Awaria assetu pozostawia tło, tekst i CTA.

## 4. Zaobserwowane wzorce z rekomendowanym timingiem

Poniższe konkretne liczby są **R**, nie pomiarem Framera.

| ID | Wzorzec / trigger | Stan początkowy → końcowy | Czas / easing | Mobile / reduced motion |
|---|---|---|---|---|
| M06 | Hero title, pierwszy render | opacity 0 + y24 → 1 + y0 | 650 ms out-expo; opis delay 100, CTA 180 | y12; RM bez ruchu |
| M07 | Reveal sekcji, intersection ≥.15 | opacity 0 + y24 → 1 + y0 | 600 ms out-quint; stagger 70, max 280 | mniej elementów; RM od razu |
| M08 | Deklaracja scroll home | słowa przygaszone → pełny kolor | progress scroll 0–1, bez dodatkowego easing czasu | zwykły tekst w RM |
| M09 | Mega menu hover/click | opacity 0 + y−8 → 1 + y0 | 250 ms out-expo; close 180 | panel mobile 300; RM natychmiast |
| M10 | Header po wyjściu hero | transparent/inverse → white/ink | kolor 200 ms ease-out | bez zmiany wysokości |
| M11 | Button hover / pressed | zmiana tła / scale 1→.98 | 180 / 100 ms | bez hover na touch; RM bez skali |
| M12 | Karta hover | media scale 1→1.035 | 500 ms out-quint | touch bez zoom; RM bez skali |
| M13 | Arrow hover/focus | x0 → x3 | 180 ms out-quint | RM bez ruchu |
| M14 | Tabs: zmiana branży | stary opacity 1→0, nowy 0→1 | 250 ms ease-out, stała wysokość | RM natychmiast |
| M15 | Carousel next/prev | scroll do kolejnej karty | native smooth, bez obiecywania dokładnego czasu | swipe; RM instant |
| M16 | Accordion / etap | zwinięty → otwarty | 250 ms; wysokość mierzona, fade 180 | RM natychmiast |
| M17 | Licznik: wejście w viewport | 0 → wartość docelowa | 1000 ms out-quint, raz | RM final value |
| M18 | Formularz: loading/success | gotowy → zajęty → potwierdzenie | feedback ≤100 ms, fade 180 | tekst stanu, bez zależności od spinnera |

M06–M08: obserwowana konstrukcja tekstu/sekcji i narracja wejść, ale dokładne wartości ruchu nie były przechwycone. M09–M10: otwarcie menu i zmiana headera zweryfikowane. M11–M18 to standaryzacja interakcji dla kompletnej biblioteki; nie wszystkie stany były wywoływane na serwisie. Accordion i feedback formularza są rozszerzeniami systemu. Nie deklarować ich jako zreplikowanych animacji Wonderful.

## 5. Scroll reveal: kontrakt implementacyjny R

- Start obserwacji po gotowości DOM; treść początkowo widoczna w HTML.
- Klasy ukrywające nadawać dopiero po inicjalizacji obserwatora. Bez JS treść pozostaje widoczna.
- `IntersectionObserver({threshold:.15, rootMargin:'0px 0px -40px 0px'})`.
- Po wejściu odtworzyć raz, następnie `unobserve`.
- Kaskada max 5 elementów i max 280 ms dodatkowego delay; nie czekać kilku sekund na CTA.
- Przy kotwicy lub powrocie historii ujawnić docelową sekcję natychmiast.
- Przy reduced motion usunąć opacity/transform ukrywające, nie tylko ustawić duration na 0.

## 6. Pauza i preferencje R

`motion.js` zawiera przełącznik pauzy i trybu ograniczonego ruchu. Ustawienie systemowe reduced motion ma pierwszeństwo. Animacje pętli w katalogu zatrzymują się poza viewport i przy ukrytej karcie. Replay działa dla skończonych sekwencji; nie zakłada zgody na uruchamianie ruchu, jeśli system go ogranicza.

Nie używać jednej globalnej reguły `animation-duration:.01ms` jako jedynego rozwiązania: może zostawić typewriter pusty i nie zatrzyma filmu. Każdy wzorzec ma określony czytelny stan statyczny.

## 7. QA animacji

Odtworzyć każdą sekwencję ponownie w trakcie trwania; zmienić zakładkę przeglądarki; przewinąć poza ekran; przełączyć reduced motion podczas animacji; testować 390 px i desktop. Żaden tekst nie zostaje niewidoczny po anulowaniu animacji. Mierzyć płynność na słabszym urządzeniu, nie tylko na komputerze deweloperskim. Katalog odwzorowuje zmierzone fazy podstawowych efektów, lecz nie jest pełnym klonem wszystkich komponentów Framera.

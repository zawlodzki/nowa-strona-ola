# Wonderful — design system referencyjny

Wersja 1.0 · analiza z 12 września 2026 · dokumentacja w języku polskim.

System opracowany na podstawie publicznego interfejsu wonderful.ai. To rekonstrukcja i uporządkowanie wzorców widocznych na stronie, a nie oficjalny brandbook Wonderful ani eksport projektu Framer.

## Zawartość

- **[index.html](index.html)** — interaktywny katalog: paleta, typografia, komponenty, makiety szablonów i odtwarzane animacje. Działa lokalnie, bez instalacji.
- **[DESIGN-SYSTEM.md](DESIGN-SYSTEM.md)** — pełna specyfikacja: fundamenty, komponenty, responsywność, dostępność i zasady wdrożenia.
- **[MOTION.md](MOTION.md)** — przebiegi animacji, czasy, easing, triggery, zachowanie na mobile i reduced motion.
- **[tokens.css](tokens.css)** oraz **[tokens.json](tokens.json)** — tokeny do wdrożenia. Nazwy semantyczne są autorskie; wartości mają przypisane pochodzenie.
- **[components.css](components.css)** i **[motion.js](motion.js)** — referencyjna implementacja katalogu i animacji.
- **[SOURCES.md](SOURCES.md)** — zakres badania i mapa dowodów.
- **evidence/** — pomiary DOM/CSS/WAAPI i wybrane zrzuty ekranu.

## Jak czytać oznaczenia

**O — odczyt:** konkretna wartość z CSS, DOM lub Web Animations API. **W — obserwacja:** wygląd lub zachowanie zweryfikowane w przeglądarce, bez pełnej konfiguracji źródłowej. **R — rekomendacja:** uporządkowanie, uzupełnienie lub własna implementacja do ponownego wykorzystania.

Katalog demonstruje rekomendowaną implementację. Nie jest kopią całej strony. Nie zawiera fontów ABC Favorit ani pobranych filmów; korzysta z lokalnie dostępnych fontów i jawnego fallbacku. Zrzuty służą jako materiał porównawczy. Pełną zgodność typograficzną można ocenić po podłączeniu własnego, odpowiednio licencjonowanego pliku ABC Favorit Light.

## Uruchomienie

Otwórz `index.html` w przeglądarce. Opcjonalnie uruchom w tym katalogu `python3 -m http.server 8765 --bind 127.0.0.1` i otwórz `http://127.0.0.1:8765`. Katalog nie wysyła formularzy ani danych. Parametry odczytane ze strony i projektowane stany komponentów są opisane osobno w dokumentacji.

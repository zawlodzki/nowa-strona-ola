# Weryfikacja katalogu — 12.09.2026

Weryfikowano lokalny index.html w Chromium. Jest to kontrola katalogu, nie audyt zgodności całej witryny Wonderful.

| Sprawdzenie | Wynik |
|---|---|
| 320, 390, 880, 1440 CSS px | brak poziomego overflow dokumentu |
| Wygląd 1440×1000 oraz 390×844 | wizualnie sprawdzone hero; desktop także sekcja motion |
| Linki i zasoby lokalne HTML | brak brakujących plików |
| JSON | poprawna składnia tokenów; 16 plików dowodowych |
| Galeria referencji | wszystkie cztery obrazy poprawnie zdekodowane |
| Tab click / ArrowRight | zmiana widocznego panelu i przeniesienie fokusu |
| Formularz pusty | aria-invalid, opis błędu i fokus |
| Formularz z poprawnym przykładowym adresem | loading, disabled i lokalny komunikat sukcesu; bez sieci |
| Replay etykiety | trzy animacje WAAPI po 2808 ms |
| Pauza reveal | wszystkie trzy animacje w stanie paused |
| Reduced motion w trakcie animacji | animacje anulowane; pełna widoczność tekstu i słupków |
| Ponowne włączenie ruchu | interfejs wraca do aktywnego trybu |

Ograniczenia: nie wykonano pełnego audytu WCAG, testów na fizycznym iPhonie/Androidzie, profilowania wydajności ani wizualnego porównania pixel-perfect. Systemowy reduced motion ma obsługę CSS i matchMedia; test funkcjonalny przeprowadzono przełącznikiem katalogu. Docelowy font ABC Favorit nie jest dołączony. Stan formularza produkcyjnego Wonderful nie był wysyłany ani testowany.

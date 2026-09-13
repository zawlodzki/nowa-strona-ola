# Próba Bejamas + Wonderful — wynik

Zakończona 2026-09-13. Rekomendacja: używać selektywnie skopiowanych komponentów
Bejamas, z lokalnymi poprawkami i testami. Lumos pozostaje inspiracją, nie zależnością.

## Co uruchomiono

Astro 7.3.2, Tailwind 4.3.3, @data-slot/dialog 0.2.166. npm i package-lock.json.
Próba PL pod /, EN pod /en/, kontrola statycznych elementów pod /static/.
Formularz demonstracyjny waliduje lokalnie; nie wysyła danych i nie udaje
integracji n8n. Prototyp zawiera noindex i jest przeznaczony wyłącznie do lokalnego
podglądu — nie ma jeszcze ochrony dostępu odpowiedniej dla publicznego stagingu.

Pobrano Button, Input, Label i Dialog z publicznego rejestru Bejamas. Zachowano
licencję MIT i rejestr URL/hash źródeł w bejamas-sources.json. Usunięto przykłady
z komentarzy, ikonę dialogu zastąpiono znakiem tekstowym. Tokeny Tailwind wskazują
zmienne Wonderful; nie kopiowano palety Bejamas ani mediów Wonderful.

## Wykryte problemy i poprawki

1. Domyślne wysokości pól/przycisków były mniejsze od wymagań Wonderful.
   Ustawiono minimum 44 px, font pól 16 px, promienie i odstępy według tokenów.
2. DialogTrigger asChild w pobranym wariancie dodawał ARIA do wrappera div.
   Axe zgłaszał krytyczny aria-allowed-attr. Lokalny DialogTrigger renderuje
   bezpośrednio natywny przycisk; wariantu asChild nie udostępniamy.
3. Safari/WebKit po otwarciu kliknięciem nie przywracał fokusu na trigger.
   Prymityw zapamiętuje activeElement, a Safari nie musi fokusować klikniętego
   przycisku. Capture click ustawia fokus przed zapamiętaniem przez bibliotekę.
   Test sprawdza zamknięcie klawiaturą i myszą oraz powrót fokusu w PL/EN.
4. W naszej pierwszej adaptacji zmienne ciemnego motywu nie nadawały tła sekcji.
   Kontrola kontrastu wykryła problem; jawnie powiązano tło i kolor z tokenami.
5. Lokalny przycisk zamknięcia wymagał data-slot="dialog-close"; sam dodatkowy
   atrybut data-dialog-close nie uruchamiał zamknięcia. Test ponownego otwarcia
   i zamknięcia wykrył błędne podłączenie.

Nie instalowano całego startera ani katalogu Bejamas. Nie testowano innych
komponentów; wynik dialogu nie jest gwarancją jakości całej biblioteki.

## Wyniki

Pełne npm run verify zakończyło się powodzeniem:

- Prettier: poprawny format.
- ESLint 10: brak błędów i ostrzeżeń.
- Astro check: 26 plików, 0 błędów, ostrzeżeń i hints.
- Vitest: 10/10 testów walidacji.
- Astro build: 3 statyczne strony.
- Playwright: 27/27 testów, Chromium/Firefox/WebKit.
- Axe: brak naruszeń wybranych reguł WCAG A/AA w kontrolowanych widokach.
- /static/: zero elementów script dla przycisku i pola.
- Zewnętrzne pliki JS: 4684 B gzip; CSS: 7344 B gzip (sumy plików dist/_astro).

Rozmiary nie obejmują inline JS, obrazów ani narzutu HTTP. Nie wykonano Lighthouse
ani pomiaru CWV. Nie ma jeszcze c15t, Sanity, fontów produkcyjnych i mediów, więc
nie jest to wynik wydajności finalnej strony.

Sprawdzono 320/390/1440 px, klawiaturę, fokus, reduced motion, CSS zoom 200%,
no-JS i formularz bez transmisji danych. Obejrzano screenshoty desktop/mobile.
Pełny ręczny audyt z czytnikiem, natywny zoom przeglądarki, telefon fizyczny,
Sanity Presentation i odświeżanie podglądu pozostają do sprawdzenia na dalszym etapie.

Materiały: [desktop](evidence/bejamas-desktop.png),
[mobile](evidence/bejamas-mobile.png). To dokumentacja próby, nie zatwierdzone
baseline’y finalnego designu. Użyto fallbacku Arial zamiast ABC Favorit.

## Decyzja techniczna do dalszej realizacji

Zachować działającą bazę Astro/Tailwind i lokalne komponenty. Kolejne elementy
Bejamas przyjmować pojedynczo po teście i mapowaniu tokenów. Proste sekcje treści
budować jako własne .astro; nie dodawać interakcji, gdy wystarcza natywny HTML.
Panel zgód implementować poprzez c15t. Nie zmieniać kontraktu /api/leads ani
architektury statycznej na podstawie przykładów biblioteki.

Zasady testowania całego repo opisuje [CODE-QUALITY.md](CODE-QUALITY.md).

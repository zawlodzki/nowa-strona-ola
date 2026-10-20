# Miejsca warte animacji — 20.10.2026

Poniżej pierwotny raport analityczny. Późniejsze zlecenie użytkownika obejmuje
wdrożenie wejścia banera i mobilny układ w stylu Ramp Glass. Aktualny stan
implementacji i kontroli: sekcja „Mobilny baner zgód” w [postępie](PROGRESS.md).

Przegląd źródeł publicznego interfejsu Astro 3a, zgodnie ze skillem
`find-animation-opportunities`. Bez zmian kodu, CMS i zatwierdzonych zasad ruchu.
To propozycja do rozważenia, nie decyzja użytkownika ani wdrożenie.

## Propozycja

| #   | Miejsce                                                                          | Obecnie                                                      | Cel                                             | Częstotliwość                                         | Proponowany ruch                                                                                                                                                                                                |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `src/lib/consent-panel.ts:48`, `src/design-system/components/ConsentPanel.css:9` | Po odczycie c15t baner traci `hidden` i pojawia się od razu. | Złagodzenie nagłego pojawienia się powierzchni. | Rzadko: pierwsza wizyta lub ponowna potrzeba decyzji. | Tylko automatyczne pierwsze wejście banera: `opacity: 0 → 1`, `transform: translateY(8px) → translateY(0)`, `250ms var(--ao-ease-out)` = `cubic-bezier(.22,1,.36,1)`, bez opóźnienia. Użyć `--ao-motion-panel`. |

Bramki: rzadkie wystąpienie przechodzi częstotliwość; cel to złagodzenie nagłej
zmiany; 250 ms mieści się w budżecie; małe przesunięcie stałej powierzchni nie
przesuwa czytanej strony. Przyciski działają od początku, fokus nie czeka na
animację. Nie animować ponownego renderowania podczas zapisu, błędu ani
ręcznego zamknięcia, w tym Escape. Nie wprowadzać opóźnienia zastosowania zgody.

Zgodnie z lokalnym `design-system/MOTION.md`, przy `prefers-reduced-motion: reduce`
baner pojawia się od razu w czytelnym stanie, bez transformacji i przejścia.
To świadome pierwszeństwo zasad projektu nad ogólną sugestią skilla, by
pozostawiać łagodniejszy ruch. Propozycja nie dotyczy hover, więc nie wymaga
warunku urządzenia wskazującego. Jeśli użyć `@starting-style`, brak wsparcia
ma zostawić zwykłe, natychmiastowe pojawienie się. Statyczny stan domyślny
nie może zależeć od zakończenia animacji.

## Kandydaci odrzuceni

- `src/design-system/components/SiteHeader.astro:43` oraz
  `src/design-system/components/FaqItem.astro:9`: animacja otwierania menu i FAQ.
  Odrzucone na bramce funkcji: 3a jawnie pozostawia oba disclosure bez animacji;
  przejście obsługiwane klawiaturą ma być natychmiastowe. Nie animować wysokości.
- `src/views/Homepage3a.astro` i `src/views/EbookCollection3a.astro`: wejścia sekcji
  i sekwencje kart przy przewijaniu. Odrzucone na bramce celu i funkcji:
  brak zmiany stanu wymagającej wyjaśnienia, ruch utrudnia skanowanie treści.
  `MOTION.md` wyklucza ukrywanie sekcji przed IntersectionObserver.
- `src/lib/checkout-client.ts:160`: wejście produktów, cen i oferty po odczycie API.
  Odrzucone na bramce funkcji: to dane do przeczytania i podjęcia decyzji;
  nie przesuwać ani nie odsłaniać ich kaskadowo.
- `src/design-system/components/LeadForm.astro:282` i `:308`: błędy oraz potwierdzenie
  formularza. Odrzucone na bramce funkcji: priorytetem są natychmiastowa informacja,
  fokus błędnego pola i komunikat live. Potwierdzenie ma już tekst i podsumowanie;
  sam brak animacji nie dowodzi niedostatecznego feedbacku. Bez shake i konfetti.
- `src/design-system/components/ThemePreference.astro:30`: animacja ujawnienia
  przełącznika lub zmiany motywu. Odrzucone na bramce celu i funkcji:
  ujawnienie kontrolki nie wymaga przestrzennego wyjaśnienia, a zasady 3a
  wykluczają animację kolorów motywu.

## Pokrycie przeglądu

- Feedback: CTA mają już press `.98 / 100ms`, a wspólna reguła `:active`
  daje wszystkim linkom, przyciskom i summary zmianę opacity. Nie proponuję duplikatu.
- Zmiany widoczności: sprawdzono formularz, c15t, checkout i udostępnianie artykułu.
- Powierzchnie: dialog listy oczekujących i preferencji mają już wejście
  `250ms`, `opacity` i `translateY(8px)` w `src/design-system/global.css:705`.
  Ocena ich zamykania należy do przeglądu istniejących animacji, nie tego skilla.
- Grupy: karty bloga i e-booków są treścią do skanowania, bez nowego staggeru.
- Gesty: karuzela ma natywny scroll, snap i smooth z obsługą reduced motion;
  nie znaleziono własnego drag/swipe wymagającego sprężyny.
- Rzadkie momenty: formularze i potwierdzenia zakupu już komunikują wynik tekstem.
- Istniejący ruch: rekomendacje artykułu mają własne wejście
  `recommendations-in`; nie są nową okazją do animacji.
- Nie proponuję nowej biblioteki ani równoległych tokenów. Historyczne
  `src/styles/sections.css` nie jest wzorcem dla nowych interakcji 3a.

## Werdykt i granice

Interfejs potrzebuje niewiele dodatkowego ruchu. Jedyna rekomendacja to subtelne,
automatyczne wejście banera zgód; pozostałe powierzchnie są już obsłużone albo
zyskują na natychmiastowej reakcji. Raport wynika z kodu, nie z oględzin działającej
strony: nie oceniono subiektywnego odczucia, desktop/mobile, klawiatury, 320 px,
zoomu 200%, reduced motion, czytnika ani fizycznego telefonu. Nie uruchamiano
aplikacji, formularzy, webhooków i pełnego verify; zmieniono tylko dokumentację.

Następny krok, jeżeli użytkownik wybierze propozycję:
`improve-animations plan automatyczne wejście banera zgód 3a`.
Przed wdrożeniem sprawdzić pierwsze wejście, zapis, awarię c15t, Escape,
klawiaturę i reduced motion bez wysyłania produkcyjnych formularzy.

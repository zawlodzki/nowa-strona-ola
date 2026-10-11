# Przegląd aktualizacji cookies 11.10.2026

Dwa niezależne przeglądy na tym samym dostępnym modelu gpt-6.1-sol.
Konfigurowane modele Claude/Grok nie są dostępne w tej sesji.

Porównano kod klienta, ThemePreference i politykę backendu c15t z listą
identyfikatorów, polityką prywatności oraz powiązanymi dokumentami RODO.
Brak blokera. Doprecyzowano wyjątek usunięcia cookie przy oczekującym
wycofaniu w localStorage. Noty prawne zachowano jako wyjątek no-comments.

Potwierdzone dokumenty CMS sprzed zmiany były dokładnie zgodne z fixture’ami.
Zmieniono wyłącznie dwa dokumenty, z blokadą rewizji i kontrolą nowych szkiców
przed publikacją. Dokładna zgodność treści uwzględnia sortowanie kluczy JSON;
pierwsze porównanie ciągów wykryło jedynie różną kolejność kluczy narzędzia.

Publikacja uruchomiła workflow38155002467, który zakończył się błędem starej
asercji wersji2.1 na main. Nie wykonał deploy. Oczekiwania metryki poprawiono
lokalnie do2.2 i11.10.2026, bez pomijania kontroli ani zmiany innych dokumentów.

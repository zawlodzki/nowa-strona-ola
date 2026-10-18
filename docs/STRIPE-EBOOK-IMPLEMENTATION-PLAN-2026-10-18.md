# Plan zakupu e-booków i oferty po płatności

Status zatwierdzony przez użytkownika 18.10.2026. Realizacja trwa.
Użytkownik doprecyzował, że druga oferta dotyczy wyłącznie zakupu obu brakujących
e-booków, i odłożył samą dostawę na późniejszy etap. Poniżej zachowano plan
z tym ograniczeniem. [Bieżące wykonanie i wyniki kontroli](PROGRESS.md).

Przygotowano kod zamówień, D1, widoki i konfigurację CMS. Zapisano produkty,
ceny i kupon Stripe. Opublikowano trzy kody produktów, singleton `paused`,
regulamin 2.4 oraz listę cookies 2.5 w Sanity. Schemat Studio jest zarejestrowany.
D1 w jurysdykcji EU istnieje i ma migrację zamówień. Wdrożenie nowego kodu,
sekret Stripe, webhook i rzeczywisty sandbox pozostają do odbioru.
Pełne `npm run verify` zakończyło się kodem 0. Przeszło 690 testów
jednostkowych i 549 E2E, z 12 celowymi pominięciami. Porównanie 20 stron
fixture i Content Lake oraz SEO 39 stron przeszło. Sprzedaż pozostaje wyłączona.

## Ustalenia z ponownego odczytu

W repo `projekt prawny ola` commit `fa6272c` wprowadza decyzję D27.
Aktualne treści przewidują:

- Jedno wymagane, domyślnie niezaznaczone pole przy każdym zamówieniu e-booka.
- Pełną treść akceptacji regulaminu, 18+, zgody na wcześniejsze dostarczenie
  i przyjęcia do wiadomości utraty prawa odstąpienia w etykiecie tego pola.
- Przycisk `Zamawiam z obowiązkiem zapłaty` na własnej stronie.
- Brak dodatkowego checkboxa regulaminu w Stripe Checkout.
- Dostawę po zapłacie i potwierdzenie umowy z dokumentami PDF.
- Brak wariantu bez zgody i brak dostawy odroczonej o 14 dni.

Źródła: `www-prawne/zgody-i-formularze.md` 2.5, `regulamin.md` 2.4,
`rodo/weryfikacja-stripe-calcom-cloudflare.md` 1.1 i D27 planu 2.6.
Szablony maili usuwają E1a/E2, a historia wskazuje wersję 1.2, choć metryka
nadal ma 1.1. Tę rozbieżność trzeba uwzględnić w wersjonowaniu dowodów.
Połączona forma zgody jest w źródle oznaczona jako ocena do potwierdzenia
przez radcę, nie jako wynik samego audytu technicznego.

Odczyt `convert-legal-md.mjs ... --check` wykazał nieaktualny lokalny regulamin
2.3 wobec źródła 2.4. Pozostałe trzy fixture'y odpowiadały źródłom przed uzupełnieniem listy cookies
o identyfikatory nowego procesu. Lista cookies ma teraz wersję 2.5.
Przed selektywnym zapisem porównano dokumenty Sanity i ich rewizje.
Pełnego importera dokumentów nie uruchamiano.

## Docelowa ścieżka klientki

1. Klientka wybiera jeden z trzech e-booków o PCOS za 97 zł brutto.
2. Na stronie widzi podsumowanie, dane zamówienia i jedno pole zgody D27.
3. `Zamawiam z obowiązkiem zapłaty` tworzy zamówienie oraz indywidualną
   Stripe Checkout Session na 9700 groszy, w języku polskim.
4. Po płatności Stripe przekierowuje na nową stronę własnej domeny.
   Backend sprawdza faktyczne opłacenie zamówienia. Przy oczekiwaniu na zapłatę
   strona pokazuje stan oczekiwania, nie potwierdzenie zakupu.
5. Po potwierdzeniu płatności strona pokazuje dwa pozostałe e-booki z tej serii.
   Można kupić oba łącznie za kolejne 97 zł brutto, po 48,50 zł za każdy.
6. Drugie zamówienie ma własne podsumowanie, ponownie niezaznaczone jedno pole
   zgody odnoszące się do obu plików oraz ten sam przycisk z obowiązkiem zapłaty.
   Dane kontaktowe można uzupełnić z pierwszego zamówienia, zgody nie.
7. Druga sesja Stripe pobiera 9700 groszy. Powrót kończy się potwierdzeniem
   i informacją o dostawie, bez ponownego oferowania kupionych produktów.

Są to dwie dobrowolne płatności. Łączny koszt całej serii tą ścieżką to 194 zł
brutto. Pierwszy e-book jest dostarczany niezależnie od przyjęcia drugiej oferty.
Strona ma wyraźną możliwość pominięcia oferty. Bez automatycznego obciążania
karty, subskrypcji i sztucznego licznika czasu.

## Kolejność wdrożenia i stan wykonania

- [x] Zabezpieczyć wcześniejsze zmiany i wydzielić kod na aktualnym `main`.
- [x] Odczytać aktualne dokumenty Sanity, Stripe i źródła prawne D27.
- [x] Zbudować model zamówień z pozycjami, kwotami w groszach, dowodem D27
      i statusami płatności. Drugie zamówienie wskazuje pierwsze i dokładnie
      dwa pozostałe kody produktów. Dane zakupów nie trafiają do Sanity.
- [x] Przygotować Worker z walidacją, D1, tworzeniem sesji, chronionym statusem
      i podpisanymi webhookami. Utworzyć D1 EU i zastosować migrację.
- [x] Przygotować własne strony zamówienia, oferty po zakupie i potwierdzenia
      w systemie 3a. Uprawnienie wynika z płatności i bezpiecznej sesji klientki.
      Serwer wyznacza parę i kwotę oraz obsługuje ponowienia, zwroty i spory.
- [x] Skonfigurować trzy neutralne produkty Stripe, jednorazowe ceny po 9700
      groszy PLN z `tax_behavior = inclusive` i kupon 50% ograniczony do tych
      produktów. Nie tworzyć publicznego kodu ani Payment Links.
- [x] Zarejestrować schemat Sanity, rozszerzyć GROQ, typy, fixture i mapowanie
      produktów. Opublikować trzy kody i ceny po 97 zł oraz kontrolowany singleton
      z treścią oferty pary, wersją oświadczenia i `salesState = paused`.
- [x] Zsynchronizować konwerterem regulamin 2.4 i listę cookies 2.5 ze źródłem.
      Opublikować uzasadniony zakres PL. Potwierdzić wersje publicznym odczytem.
- [x] Zapisać warunki zakupu obu brakujących e-booków razem za 97 zł.
      Kwota 48,50 zł jest podziałem ceny pakietu. Suma aktualnych cen osobno
      to 194 zł. Nie deklarować fikcyjnej najniższej ceny z 30 dni.
- [x] Wyłączyć nowe strony transakcyjne z pomiaru i indeksowania.
      Nie przekazywać danych klientki ani identyfikatorów sesji do analityki.
- [x] Zakończyć pełne `npm run verify` po ostatnich poprawkach.
- [x] Wdrożyć Worker z `CHECKOUT_ENABLED = false` i potwierdzić stan publicznym GET.
- [x] Wdrożyć menu Studio.
- [x] Zapisać podpisany commit i utworzyć [PR 128](https://github.com/zawlodzki/nowa-strona-ola/pull/128).
- [ ] Scalić zweryfikowany PR i wdrożyć kod strony.
- [ ] Dodać sekret runtime Stripe i endpoint webhooka. Potwierdzić ustawienia
      podatkowe i dane sprzedawcy przed uruchomieniem rzeczywistych płatności.
- [ ] Sprawdzić pełny przebieg rzeczywistej płatności w Stripe sandbox.
      Testy z atrapami nie kończą tego punktu.
- [ ] Na późniejszym etapie przygotować finalne PDF, dostawę, potwierdzenia
      z dokumentami i obsługę częściowych błędów. Użytkownik odłożył ten etap.
- [ ] Aktywować sprzedaż dopiero po odbiorze płatności i dostawy.

## Dowody wymagane do odbioru

- Trzy możliwe pierwsze zakupy zawsze dają właściwą parę pozostałych produktów.
- Pierwsza płatność wynosi 97 zł, druga 97 zł, razem 194 zł brutto.
- Po jednym niezaznaczonym checkboxie na każde zamówienie na stronie,
  brak dodatkowego checkboxa regulaminu w Stripe. Bez zgody zakup nie przechodzi
  również po bezpośrednim wywołaniu backendu.
- Nieopłacona, anulowana lub cudza sesja nie daje prawa do rabatu i pliku.
  Zmiana URL, ceny i pary produktów nie omija uprawnień.
- Zwrot lub cofnięcie pierwszej płatności nie pozwala wykorzystać nieaktywnej
  oferty. Rozpatrzenie reklamacji działa niezależnie od zgody na dostawę.
- Ponowienia i równoległe kliknięcia nie tworzą podwójnej dostawy lub zakupu
  tej samej oferty. Powrót z drugiej płatności nie uruchamia kolejnej oferty.
- Dostawa pierwszego produktu działa również przy pominięciu oferty dodatkowej.
- Każda płatność ma własny dowód zgody i potwierdzenie z dokumentami właściwej
  wersji. Brak danych zakupowych w CMS, logach i analityce.
- Weryfikacja desktop/mobile, klawiatury, 320 px, zoomu 200%, reduced motion
  oraz zgodności z 3a. verify-ola nie wykonuje produkcyjnych płatności ani
  wysyłki testowych leadów. Integrację płatności sprawdza osobny sandbox.

## Granica zatwierdzenia

Zatwierdzenie obejmuje implementację ścieżki, ceny i ofertę użytkownika,
konfigurację Sanity i Stripe oraz aktualizację dokumentów na stronie.
Dostawa jest odłożona. Otwarte zadania dostawy na powyższej liście są warunkami
przyszłego uruchomienia, nie deklaracją wykonania w tej sesji.
Nie uznajemy testów atrap za płatność sandbox ani za potwierdzenie oceny prawnej
połączonej zgody. Aktywacja wymaga działającej dostawy, dokumentów PDF i odbioru.

Przygotowanie kodu nie zmienia dostępności. E-booki mają `planned`, CMS ma
`paused`, a Worker `CHECKOUT_ENABLED = false`. Nie dodajemy odrębnej ścieżki
sprzedaży konsultacji ani pojedynczego e-booka w promocji drugiej oferty.

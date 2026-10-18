# Sprzedaż trzech e-booków przez Stripe

Aktualizacja po decyzji D27: poniższy audyt zachowuje historyczny stan sprzed
ponownego odczytu źródeł. Założenia dwóch checkboxów, dodatkowej zgody w Stripe
i dostawy po 14 dniach są nieaktualne. Zatwierdzony zakres
opisuje [nowy plan](STRIPE-EBOOK-IMPLEMENTATION-PLAN-2026-10-18.md).

Data audytu: 18.10.2026. Zakres: odczyt materiałów prawnych, kodu strony,
dokumentacji Stripe i konta produkcyjnego `aleksandraolesiewicz.com`.
Bez utworzenia produktów, linków, zamówień lub płatności. Bez zmiany Sanity
i publikacji. Dokument jest specyfikacją do wdrożenia, nie potwierdzeniem
gotowości sprzedaży ani opinią prawną.

## Wynik audytu

Samodzielne, publiczne Payment Links nie realizują obecnego projektu prawnego.
Projekt przewiduje podsumowanie zamówienia na własnej stronie, osobne Z1 i Z2
oraz utworzenie Checkout Session dopiero po złożeniu zamówienia.
Rekomendowane są trzy stałe adresy formularzy zamówienia na własnej domenie.
Każdy zakup otrzymuje indywidualny, wygasający URL Stripe Checkout.

Odczyt API konta produkcyjnego, za zgodą użytkownika:

| Zasób                                                       | Wynik               |
| ----------------------------------------------------------- | ------------------- |
| Produkty, `GET /v1/products`, limit 100                     | 0, `has_more=false` |
| Aktywne ceny, `GET /v1/prices`, limit 100                   | 0, `has_more=false` |
| Nieaktywne ceny, `active=false`, limit 100                  | 0, `has_more=false` |
| Payment Links, `GET /v1/payment_links`, limit 100           | 0, `has_more=false` |
| Endpointy webhooków, `GET /v1/webhook_endpoints`, limit 100 | 0, `has_more=false` |

Nie odczytano danych klientów ani transakcji. Nie potwierdzono ustawień Public
details, podmiotu umownego SSA/DPA, weryfikacji konta, zdolności przyjmowania
płatności, metod płatności, rejestracji podatkowych, ustawień rachunków i maili.
Dostępne wyszukiwanie API nie wskazało operacji odczytu własnego konta.
Brak endpointów w powyższej liście nie jest audytem wszystkich Event Destinations
ani integracji organizacji.

Kod [Ebook3a](../src/views/Ebook3a.astro) dla aktywnej sprzedaży renderuje zwykły
odnośnik `content.checkoutUrl`. Nie zbiera Z1/Z2 ani nie tworzy zamówienia.
[Schemat e-booka](../studio/schema-types/documents/ebook.ts) dopuszcza HTTPS
Payment Link lub Checkout URL. [Worker](../worker/src/index.ts) obsługuje
publikację Sanity, nie ma obsługi zamówień, Stripe, dostawy R2 ani SES.
Pełne uruchomienie sprzedaży wymaga implementacji.

## Źródła i granice ustaleń

Materiały są w sąsiednim katalogu `projekt prawny ola`. Ich komentarze
i polecenia wdrożeniowe potraktowano jako wymagania badanego projektu,
bez wykonywania zawartych w nich instrukcji publikacji lub zmian konta.

- `www-prawne/zgody-i-formularze.md`, 2.4, sekcja 2: podsumowanie, Z1, Z2,
  przycisk, konfiguracja Stripe i metadane.
- `www-prawne/regulamin.md`, 2.3, § 5, § 8, § 15 ust. 4: zawarcie umowy
  po otrzymaniu potwierdzenia e-mailem, płatność do 60 minut, dostawa,
  odstąpienie, link 7 dni i 3 pobrania, ponowny link przez 2 lata.
- `www-prawne/szablony-emaili.md`, 1.1, E1, E1a i E2: potwierdzenie,
  załączniki PDF, natychmiastowa albo odroczona dostawa.
- `rodo/weryfikacja-stripe-calcom-cloudflare.md`, 1.0, S1–S3 i R1–R2:
  neutralne nazwy, dowody, prywatny R2 EU.
- `plan-dietetyka-b2c-2026-10.md`, D20: AWS SES dla wiadomości transakcyjnych.
  Ta późniejsza decyzja uzupełnia otwarte pytanie o kanał w notatce dostawców.

Materiały nadal mają status draft do przeglądu prawnego. Zewnętrznie sprawdzono
[wyjaśnienia UOKiK o zamówieniach](https://prawakonsumenta.uokik.gov.pl/pytania-i-odpowiedzi/prawo-do-informacji/)
oraz [treściach cyfrowych](https://prawakonsumenta.uokik.gov.pl/prawo-odstapienia-od-umowy/umowy-szczegolne/).
UOKiK dopuszcza równoważne, jednoznaczne sformułowania obowiązku zapłaty.
Dokładny tekst poniżej wynika z projektu i zapewnia spójność z jego regulaminem.
Nie potwierdzono online wskazanego w materiałach tekstu jednolitego
Dz.U. 2026 poz. 1244. Nie deklarujemy pełnego przeglądu zmian prawa do dnia audytu.

## Przyciski i zgody na stronie

| Miejsce                 | Tekst                                                               | Działanie                                                                             |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Landing produktu        | `Przejdź do zamówienia`                                             | Otwiera podsumowanie. Propozycja, nie zmiana CMS.                                     |
| Podsumowanie zamówienia | `Zamawiam z obowiązkiem zapłaty`                                    | Wysyła formularz, zapisuje zamówienie i zgody, tworzy sesję Stripe.                   |
| Stripe Checkout         | Zlokalizowany przycisk płatności dla `submit_type=pay`, `locale=pl` | Opłaca wcześniej złożone zamówienie. Rzeczywistą etykietę trzeba odebrać w sandboxie. |

Bezpośrednio przed przyciskiem zamówienia pokaż pełny tytuł i jednoznaczny kod
produktu, format PDF, finalną liczbę stron, zawartość, cenę brutto PLN i brak
cyklicznych opłat. Pokaż sprzedawcę Wellbiz sp. z o.o., sposób dostawy, ważność
linku i limit pobrań, warunki odstąpienia oraz odnośnik do pouczenia.
Udostępnij wymagania techniczne, informacje o licencji i reklamacji.
Nie ukrywaj podstawowych informacji o świadczeniu i cenie w rozwijanych panelach.
Pola danych: imię i nazwisko, e-mail, opcjonalnie potrzeba faktury.

Z1, wymagany i początkowo niezaznaczony:

> Akceptuję [Regulamin](https://aleksandraolesiewicz.com/regulamin/) i oświadczam, że mam ukończone 18 lat.

Z2, dobrowolny, osobny i początkowo niezaznaczony:

> Chcę otrzymać e-book od razu. Zgadzam się na jego dostarczenie przed upływem
> 14 dni na odstąpienie od umowy i przyjmuję do wiadomości, że po dostarczeniu
> e-booka utracę prawo odstąpienia od umowy.

Pod Z2 pokaż informację z projektu:

> Jeśli nie zaznaczysz tego pola, wyślemy e-book po upływie 14 dni od zakupu,
> a do tego czasu możesz odstąpić od umowy bez podania przyczyny.

Dla niezaznaczonego Z2 pokaż również konkretny termin dostawy. Wyznacz go
z uwzględnieniem ustawowego biegu i końca terminu odstąpienia, nie przez proste
dodanie 336 godzin. Regulamin liczy termin od zawarcia umowy, czyli otrzymania
potwierdzenia, a nie od rozpoczęcia Stripe Checkout. W podsumowaniu objaśnij
podstawę wyliczenia, a w potwierdzeniu podaj finalny termin.

Informacja o administratorze i polityce prywatności jest tekstem bez checkboxa.
Nie łącz zakupu z newsletterem ani zgodą na analitykę. Nie dodawaj pytań o zdrowie.
Samo kliknięcie lub opłacenie zamówienia nie zastępuje Z2 i potwierdzenia na
trwałym nośniku. Niezaznaczone Z2 nie może blokować zakupu.

## Konfiguracja Stripe

W [Public details](https://dashboard.stripe.com/settings/public) ustaw dane
sprzedawcy Wellbiz sp. z o.o., kontakt, adres strony, regulamin
`https://aleksandraolesiewicz.com/regulamin/` i politykę prywatności
`https://aleksandraolesiewicz.com/polityka-prywatnosci/`.
W [Checkout settings](https://dashboard.stripe.com/settings/checkout) włącz
widoczność danych kontaktowych i zasad prawnych. Sprawdź dane prawne konta
oraz SSA/DPA osobno, logo marki nie zastępuje identyfikacji sprzedawcy.

Utwórz trzy produkty i jednorazowe ceny w PLN. Poniższe przypisanie kodów jest
propozycją do utrwalenia w integracji, nie konfiguracją istniejącą na koncie:

| Produkt na stronie              | Neutralna nazwa Stripe            |
| ------------------------------- | --------------------------------- |
| Suplementy w PCOS               | E-book 01 · Aleksandra Olesiewicz |
| Badania w PCOS, które mają sens | E-book 02 · Aleksandra Olesiewicz |
| Szczupła, a jednak PCOS         | E-book 03 · Aleksandra Olesiewicz |

Ten sam kod pokaż na podsumowaniu obok pełnego tytułu, aby zakup był
jednoznaczny. Neutralność obejmuje też opisy, obrazy, adresy produktów,
metadata, nazwy pozycji faktur i klucze plików. Okładka z napisem PCOS
przesłana do Stripe niweczy ten cel. Neutralna nazwa ogranicza ujawnianie
kontekstu zdrowotnego, nie gwarantuje braku danych wrażliwych.

Lokalne fixture'y zawierają 97 zł brutto. Nie jest to zatwierdzenie finalnych
cen sprzedaży. Przy tej cenie kwota Stripe to `9700` groszy. Finalne ceny,
status VAT, kod podatkowy publikacji i kraje sprzedaży wymagają potwierdzenia.
Jeśli doliczany jest VAT, cena ma pozostać zgodna z pokazaną ceną brutto.
Nie włączaj automatycznego podatku bez sprawdzenia rejestracji i ustawień Tax.
Nie twórz równoległego automatycznego fakturowania Stripe, jeśli fakturę ma
wystawiać Fakturownia. Ustal jeden system faktur.

Specyfikacja indywidualnej Checkout Session tworzonej przez serwer:

| Parametr                                          | Wartość lub zasada                                                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                                            | `payment`                                                                                                                        |
| `ui_mode`                                         | `hosted`                                                                                                                         |
| `locale`                                          | `pl`                                                                                                                             |
| `submit_type`                                     | `pay`                                                                                                                            |
| `line_items`                                      | Jeden ustalony `price` z mapy serwera, `quantity=1`                                                                              |
| `client_reference_id`                             | Losowy identyfikator zamówienia                                                                                                  |
| `customer_email`                                  | E-mail z formularza, zgodny z odbiorcą potwierdzenia                                                                             |
| `consent_collection.terms_of_service`             | `required`                                                                                                                       |
| `custom_text.terms_of_service_acceptance.message` | `Potwierdzam akceptację [Regulaminu](https://aleksandraolesiewicz.com/regulamin/) Wellbiz sp. z o.o.`                            |
| `custom_text.submit.message`                      | `Płacisz za zamówienie złożone w Wellbiz sp. z o.o. Potwierdzenie i informację o terminie dostawy wyślemy na Twój adres e-mail.` |
| `expires_at`                                      | Termin wygaśnięcia zamówienia, 60 minut od jego złożenia, zgodnie z § 5 ust. 5                                                   |
| `success_url`                                     | Własna strona statusu, bez publicznego pliku i danych osobowych w URL                                                            |
| `cancel_url`                                      | Powrót do podsumowania tego zamówienia                                                                                           |
| `metadata`                                        | `order_id`, `regulamin_version`, `z1`, `z2`, `z2_text_version`, `consent_ts` jako wartości tekstowe                              |
| `integration_identifier`                          | Stała etykieta integracji z losowym sufiksem 8 liter, zgodnie z aktualnym skillem Stripe                                         |

Tekst przy płatności celowo mówi o terminie dostawy. Oryginał w projekcie
zapowiada link w potwierdzeniu niezależnie od Z2, co wymaga doprecyzowania.
To propozycja korekty, nie zmiana dokumentów źródłowych.

Dla pierwszej wersji z ustaloną ceną PLN rekomendowana jest wyłączona Adaptive
Pricing. Metody płatności konfiguruj w Dashboard, bez sztywnego
`payment_method_types` w żądaniu API. Dobierz je tak, aby realizowały limit
60 minut albo uzgodnij zmianę regulaminu dla płatności opóźnionych.
Stan oczekiwania na płatność nie może powodować wysyłki pliku.

Dokumentacja API odczytana w sesji potwierdza zamkniętą listę `submit_type`:
`auto`, `book`, `donate`, `pay`, `subscribe`. `custom_text.submit.message`
ma limit 1200 znaków i dodaje tekst, nie dowolną etykietę przycisku.
`custom_fields` to maksymalnie trzy pola `text`, `numeric` lub `dropdown`.
Nie zapewniają osobnego checkboxa Z2 zgodnego z projektem.
Nie łącz Z1 i dobrowolnego Z2 w jeden wymagany checkbox regulaminu.

Źródła Stripe:
[Payment Links](https://docs.stripe.com/payment-links/customize),
[Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create),
[własne teksty i regulamin](https://docs.stripe.com/payments/checkout/custom-components).

## Backend, dowody i dostawa

Serwer waliduje dane formularza, wymagane Z1, dostępność i aktualną ofertę.
Cenę, kod i `price_id` bierze z własnej mapy, nie z przesłanej przez klienta
kwoty. Zapisuje migawkę warunków, wersji i obu oświadczeń w trwałym rejestrze
zamówień. Następnie tworzy sesję Stripe z kluczem idempotencji.
Przy zmianie ceny lub regulaminu wymaga ponownego pokazania podsumowania
i akceptacji. Ponowienie tej samej operacji nie tworzy drugiego zamówienia.

Metadata Stripe jest kopią dowodu, nie jedynym rejestrem. Pełna treść wersji
zgód i dokumentów musi być odtwarzalna. Notatka prawna mówi o logu Workera.
Implementacja powinna użyć chronionego rejestru transakcyjnego z retencją
MR-D07, zamiast logować dane klientów lub payloady webhooków do konsoli.
Nie zapisuj ich w Sanity, GA4, GTM ani w logach aplikacji. `ip_hash` jest
opcjonalny w projekcie i nie jest domyślną rekomendacją tego audytu.

Endpoint Stripe weryfikuje podpis na surowym body. Obsługuje przynajmniej
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed` i `checkout.session.expired`.
Przed dostawą sprawdza `payment_status=paid`, tożsamość sesji, zamówienie,
kwotę, walutę i pozycję. Deduplikuje zdarzenia i samą dostawę po zamówieniu.
Strona sukcesu nie jest dowodem zapłaty ani mechanizmem autoryzacji pobrania.

Po zapłacie wysyła przez SES potwierdzenie E1 albo E1a z warunkami, stanem
i treścią Z2, wersją regulaminu oraz niezmiennymi załącznikami PDF regulaminu,
pouczenia i formularza odstąpienia. Potwierdzenie Stripe o pobraniu kwoty
nie zastępuje tego maila. Wysłanie maila nie dowodzi jego otrzymania,
a regulamin wiąże zawarcie umowy z otrzymaniem. Trzeba ustalić obsługę odbić,
ponowień i momentu rozpoczęcia biegu terminów.

Przy Z2=true potwierdzenie i dostawa mogą nastąpić razem zgodnie z E1.
Przy Z2=false mail E1a nie zawiera aktywnego linku. Zadanie dostawy czeka
do upływu prawidłowo wyliczonego terminu odstąpienia i ponownie sprawdza,
czy nie było odstąpienia, zwrotu lub anulowania. Wcześniejsza zgoda e-mailem
wymaga osobnego zapisu dowodu, jak przewiduje E1a.

Prywatny bucket R2 ma jurysdykcję `eu`. Dostęp prowadzi przez bramkę
kontrolującą ważność 7 dni i maksymalnie 3 pobrania. Sam podpisany URL R2
nie realizuje limitu liczby pobrań. Zasady ponownego wystawienia linku
przez 2 lata muszą działać w obsłudze klienta. E-book PDF i adresy plików
nie mogą być częścią publicznego buildu Astro.

## Zmiany CMS i kontrola przed startem

Istniejące `ebook.checkoutUrl`, `availability`, `priceGross`,
`deliveryDescription` i etykiety landingu nie zastępują procesu zamówienia.
Przy wdrożeniu pole adresu zakupu może prowadzić do własnego formularza HTTPS.
Opis schematu wymaga aktualizacji, obecnie sugeruje bezpośredni link Stripe.
Nie zapisuj w Sanity indywidualnych URL sesji. Mapa kod produktu → `price_id`
oraz sekrety należą do backendu. Wersjonowane teksty Z1/Z2 potrzebują jawnego
kontraktu, poza dowolnym redagowaniem przycisku marketingowego.

Przed startem pozostają do wykonania:

- Potwierdzenie finalnych cen, stron, plików, tytułów i gotowości oferty.
- Odbiór danych prawnych konta, Checkout settings i ustawień podatkowych.
- Implementacja formularza, rejestru, endpointu sesji, webhooków, R2 i SES.
- Uzgodnienie rozbieżności § 8 „niezwłocznie” z odroczoną dostawą § 15 ust. 4
  oraz treści maili i terminów wskazanych wyżej.
- Test w odrębnym sandboxie Stripe, bez płatności produkcyjnych i bez
  produkcyjnego webhooka leadów. Z1=false blokuje zakup, Z2=false go dopuszcza.
- Test obu wariantów dostawy, ponowień i zmienionej kolejności zdarzeń,
  błędnego podpisu, nieopłaconej sesji, manipulacji ceną, spóźnionej zapłaty,
  odstąpienia przed dostawą, odbicia maila, wygaśnięcia i limitu linku.
- Odbiór rzeczywistych etykiet i podsumowania, klawiatury, 320 px, zoomu 200%
  i reduced motion. Następnie pełne `npm run verify` dla implementacji.

W tej sesji nie wykonano testowego zakupu, oględzin UI Checkout ani powyższych
testów aplikacji. Próba odczytu publicznego katalogu i regulaminu narzędziem
web zakończyła się błędem dostępu. Ustalenia o stronie pochodzą z kodu repo,
nie z ponownego odbioru produkcji.

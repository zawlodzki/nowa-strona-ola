# Zamówienia e-booków

## Granice

Worker obecnie przyjmuje podpisane publikacje Sanity i wysyła kolejkę budowania.
Nowe API zamówień jest niezależne od formularzy leadowych. Dane klientki trafiają
wyłącznie do D1 i Stripe. Nie trafiają do Sanity, analityki ani logów.
Dostawa, maile i pliki pozostają poza tym wdrożeniem. Sprzedaż domyślnie wyłączona.

## Dwa warianty

1. Podpisana treść zamówienia w cookie i sesja Stripe bez rejestru. Mało wiązań,
   lecz brak trwałego dowodu zgody i atomowej blokady ponownego zakupu pakietu.
2. D1 z zamówieniami i migawką zgody, losowe cookie właściciela i sesja Stripe.
   Częściowy indeks parent_order_id gwarantuje tylko jeden aktywny pakiet.

Wybrano wariant 2. Stan płatności wynika z podpisanego webhooka lub odczytu API
Stripe, nigdy z query string. Pakiet jest wyznaczany przez dwie referencje w CMS.
Zawsze zawiera obie wskazane pozycje za 97 zł brutto łącznie. Żądanie klientki
nie określa listy ani ceny produktów.

## Wywołania

- `GET /api/checkout/catalog` zwraca konfigurację, stan bramki i ustawia cookie.
- `POST /api/checkout/orders` przyjmuje produkt, imię, email, zgodę, wersję i requestId.
- `GET /api/checkout/status?session_id=...` wymaga cookie właściciela.
- `POST /api/checkout/bundle` wymaga cookie, opłaconego pierwszego zamówienia i zgody oraz parentSessionId.
- `POST /webhooks/stripe` wymaga podpisu Stripe na surowym body.

Cookie `__Host-ola_checkout` jest Secure, HttpOnly, SameSite=Lax, Path=/.
API musi działać pod domeną strony. POST wymaga dokładnie CHECKOUT_SITE_ORIGIN.
CORS nie udostępnia uprawnień obcym originom. Token cookie nie trafia do bazy,
przechowywany jest SHA-256. Nie ma odczytu danych osobowych w publicznym API.

## Spójność

Zamówienie powstaje przed kontaktem ze Stripe. Jego ID jest kluczem idempotencji
Stripe. Ponowienie używa tego samego payloadu i timestampu. Zamówienie z innymi
danymi przy tym samym requestId otrzymuje błąd. Pakiet ma jeden aktywny rekord na rodzica.
Sesja wygasa godzinę po utworzeniu zamówienia. Ponowne utworzenie pierwszej sesji
po 30 minutach wymaga interwencji ze względu na minimalny termin Stripe. Wygasły
pakiet zwraca order_expired dla starego requestId. Po nowej zgodzie i nowym
requestId można otworzyć nową sesję obu produktów. Poprzednia sesja jest wygaszana
przed utworzeniem nowej. Webhook i odczyt statusu używają tej samej warunkowej aktualizacji.
Zwrot lub spór cofa uprawnienie. Serwer dodatkowo sprawdza PaymentIntent i charge
przed udostępnieniem pakietu. Event zakończenia nie przywraca cofniętego uprawnienia.

Produkty Stripe mają ceny bazowe 97 zł brutto. Pakiet stosuje prywatny rabat 50%
do obu obowiązkowych pozycji. Klientka nie wybiera ilości ani kodu rabatowego.
W metadanych Stripe są wyłącznie neutralny identyfikator zamówienia i wersje zgód.
Śledzenie workera jest wyłączone, by adres statusu z ID sesji nie trafiał do traces.

Zwrot pierwszego zakupu wygasza otwartą sesję pakietu w Stripe. Jeżeli pakiet
opłacono równocześnie, zachowuje opłacony status i otrzymuje review_reason.
Worker nie zleca zwrotu i nie odbiera praw nabytych z drugiego zakupu.

## Katalog i oferta z CMS

Worker czyta wyłącznie opublikowane e-booki PL z publicznego Sanity API.
`CHECKOUT_SANITY_PROJECT_ID` i `CHECKOUT_SANITY_DATASET` wskazują źródło.
Katalog przyjmuje dowolny stabilny kod produktu, więc kolejna seria nie wymaga
rozbudowania przełącznika w kodzie. Gotowy produkt ma cenę 97 zł brutto i ID ceny
Stripe. Oferta ma dokładnie dwie różne referencje do innych skonfigurowanych
produktów oraz własne `kicker`, `title`, `lead` i `stripeCouponId`.
Kupon dla nowej serii wymaga osobnej konfiguracji Stripe. Dotychczasowy kupon
jest ograniczony do produktów PCOS i nie stanowi domyślnego rabatu innych serii.

Pierwsze zamówienie zapisuje migawkę własnej ceny, pary, ich cen Stripe,
kuponu i tekstów. Zmiana CMS po zakupie nie podmienia przyznanej oferty.
Ponowienie tego samego zamówienia korzysta z migawki również po zmianie CMS.
Publiczny katalog i status nie ujawniają identyfikatorów cen ani kuponów.
Status udostępnia `remainingProductCodes` i `offer` z tekstami, ceną bazową
19400, ceną pakietu 9700, walutą `pln` i `expiresAt` w formacie ISO.

## Siedem dni

Nowe zamówienie pakietu można rozpocząć przez siedem dni od opłacenia pierwszego
zakupu. Początek wynika z `latest_charge.created` odczytanego ze Stripe.
Opóźniony webhook lub późniejsze otwarcie strony nie wydłuża terminu.
Po terminie status ustawia `bundleAvailable=false`, a nowe żądanie pakietu
otrzymuje `offer_expired`. Zamówienie przyjęte przed terminem zachowuje
standardowe 60 minut na dokończenie płatności w Stripe, także gdy termin oferty
upłynie w tym czasie. Ponowienie jego requestId nie tworzy nowego zamówienia.

Oferta jest obecnie dostępna w tej samej przeglądarce dzięki cookie właściciela.
Nie ma jeszcze bezpiecznego linku e-mail działającego na innym urządzeniu,
wysyłki maila, potwierdzeń ani dostawy plików. Nie należy komunikować wysłania
wiadomości na podstawie samego przekierowania. Sprzedaż pozostaje wyłączona.
Opłacony pakiet wraca ze Stripe na `/zamowienie/potwierdzenie/`.

## Jawna prośba o link e-mail

`POST /api/checkout/offer-email-request` przyjmuje `parentSessionId`,
`requestAccepted=true` i `requestVersion=offer-email-request-v1-2026-10-18`.
Wymaga cookie właściciela, poprawnego originu, opłaconego pierwszego zamówienia,
niewygasłej oferty i niekupionego pakietu. Nie oznacza zgody na newsletter.

Migracja `0002_offer_email_requests.sql` dodaje tabelę prośby powiązaną z jednym
zamówieniem. Serwer zapisuje dokładny tekst, wersję i czas. Klucz główny order_id
gwarantuje najwyżej jeden rekord mimo równoległych kliknięć. Powtórzenie wcześniej
przyjętej prośby nie dodaje nowego zlecenia ani nie zmienia czasu. Status udostępnia
`offerEmailRequested` oraz `offerEmailRequestAvailable`.

Odpowiedź `{requested:true,deliveryPending:true}` oznacza wyłącznie zapisanie
prośby. Transport, link działający na innym urządzeniu i wysyłka pozostają poza
wdrożeniem. Interfejs komunikuje ten stan wprost. Przyszły transport wymaga ponownej
kontroli ważności, zwrotu i zakupu pakietu przed pojedynczą wysyłką, aby nie wysyłać
spóźnionej oferty. Bramka sprzedaży nadal blokuje produkcyjne zapisy tych próśb.

## Bramki uruchomienia

Worker wymaga jednocześnie `CHECKOUT_ENABLED=true`, kompletnej konfiguracji
płatności i opublikowanego `pcosCheckoutSettings.salesState=ready`.
`GET /api/checkout/catalog` odczytuje ten stan z CMS. Bezpośrednie wywołanie
`POST /api/checkout/orders` lub `POST /api/checkout/bundle` również sprawdza
aktualny stan, więc pominięcie interfejsu nie omija wstrzymania sprzedaży.
Brakujący lub nieznany stan singletona zamyka bramkę.

Nowy pierwszy zakup wymaga `ebook.availability=available` albo `presale`.
`planned`, `paused` i brak rozpoznanej dostępności blokują zamówienie.
Już przyjęte zamówienie zachowuje swoją migawkę. Sama późniejsza zmiana
produktowej dostępności nie zmienia przyznanej pary, lecz globalne wstrzymanie
CMS blokuje tworzenie kolejnego zamówienia pakietu.
Potwierdzenie opłaconego zakupu i zapis jawnej prośby o e-mail nie zależą od
nowego odczytu CMS. Nadal obowiązują ich własność, zapłata i właściwe terminy.

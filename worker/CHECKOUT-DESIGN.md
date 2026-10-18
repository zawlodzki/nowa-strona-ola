# Zamówienia PCOS

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
Stripe, nigdy z query string. Pakiet jest wyznaczany przez serwer i zawsze zawiera
obie brakujące pozycje po 48,50 zł. Żądanie nie zawiera listy ani ceny produktów.

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

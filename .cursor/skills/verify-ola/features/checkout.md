# Zamówienie e-booków

Cztery publiczne strony zamówienia są w statycznym serwisie. `/zamowienie/` pokazuje „Twoje zamówienie” i, po nieudanym odczycie katalogu, zdanie „Sprzedaż nie jest jeszcze uruchomiona. Obecnie nie przyjmujemy płatności za e-booki.” Przycisk „Zamawiam z obowiązkiem zapłaty” nie wchodzi do drzewa dostępności. `/zamowienie/potwierdzenie/`, `/po-zakupie/` i `/po-zakupie/pozniej/` bez `session_id` pokazują własny H1 i prośbę o wejście z przekierowania płatności. Przepis nie wypełnia formularza i nie wysyła POST.

## Sub-features

- `checkout-paused` na `/zamowienie/` pokazuje H1, zdanie o wstrzymanej sprzedaży, link „Wróć do e-booków” do `/ebooki/` i zero przycisków „Zamawiam z obowiązkiem zapłaty”.
- `checkout-confirmation` na `/zamowienie/potwierdzenie/` bez `session_id` pokazuje „Dziękuję za zakup” i prośbę o przekierowanie z płatności.
- `checkout-crosssell` na `/po-zakupie/` bez `session_id` pokazuje „Uzupełnij swoją kolekcję” i tę samą prośbę.
- `checkout-declined` na `/po-zakupie/pozniej/` bez `session_id` pokazuje „Możesz wrócić do oferty” i tę samą prośbę.
- `checkout-no-post` zostawia pustą listę POST. Złożenie zamówienia, opłacone potwierdzenie, oferta pakietu i prośba o e-mail z terminem 7 dni są verified-unreachable.

## How to get to it (user POV)

Wpisz adres. Landing zapowiedzi nie linkuje do zamówienia. Po opłaceniu wraca się z przekierowania płatności. Ten przebieg nie ma sesji Stripe.

## Driving it with verify-ola

JavaScript sesji jest włączony. Poprzedni przepis kolekcji zostawia go wyłączonego, więc pierwsza komenda przywraca domyślny kontekst.

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser context
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /zamowienie/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Twoje zamówienie"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Sprzedaż nie jest jeszcze uruchomiona. Obecnie nie przyjmujemy płatności za e-booki."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zamawiam z obowiązkiem zapłaty" --count 0
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Wróć do e-booków" --attribute href --value /ebooki/
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path checkout/order.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path checkout/order.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /zamowienie/potwierdzenie/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Dziękuję za zakup"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Otwórz tę stronę przez przekierowanie z płatności, żeby sprawdzić swoje zamówienie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path checkout/confirmation.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path checkout/confirmation.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /po-zakupie/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Uzupełnij swoją kolekcję"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Otwórz tę stronę przez przekierowanie z płatności, żeby sprawdzić swoje zamówienie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path checkout/crosssell.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path checkout/crosssell.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /po-zakupie/pozniej/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Możesz wrócić do oferty"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Otwórz tę stronę przez przekierowanie z płatności, żeby sprawdzić swoje zamówienie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path checkout/declined.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path checkout/declined.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
```

Oba `browser posts` mają wypisać `[]`. Nie podawaj imienia, e-maila ani zgody. Nie klikaj „Zamawiam z obowiązkiem zapłaty”.

## Gotchas

Podgląd serwuje statyczny `dist`. `GET /api/checkout/catalog` nie jest stroną Astro. `src/lib/checkout-client.ts` wstawia wtedy zdanie o wstrzymanej sprzedaży. Fixture ma `salesState` równe `paused`, ale ten przepis kończy się wcześniej, na błędzie katalogu. Formularz jest w sekcji z atrybutem `hidden`, więc rola przycisku ma `--count 0`.
Bez `session_id` trzy strony po płatności nie wołają `GET /api/checkout/status`. Świeży `browser context` czyści `sessionStorage`. Zapisany klucz `ola.checkout.session` pominąłby tę bramkę.
Złożenie zamówienia jest verified-unreachable. Warunek to Worker z `CHECKOUT_ENABLED=true`, skonfigurowany Stripe i `salesState` równe `ready`. Opłacone potwierdzenie, oferta pakietu i „Wyślij mi tę ofertę e-mailem” są verified-unreachable. Warunek to opłacona sesja Stripe tej przeglądarki oraz `GET /api/checkout/status`.
Przy wyłączonym JavaScript zostaje „Sprawdzamy dostępność płatności.” albo „Sprawdzamy status płatności.” i akapit `noscript`. Ten przepis jedzie z włączonym JavaScriptem. EN jest wyłączone. Nie uruchamiaj Workera.

# Formularz newslettera

Na stronie głównej użytkownik zapisuje się na newsletter samym e-mailem. Nie ma checkboxa zgody. Pod przyciskiem stoi informacja o zgodzie Z6 z odnośnikami do regulaminu newslettera i polityki prywatności. Puste lub złe pole pokazuje błąd i nie wysyła niczego.

## Sub-features

- `form-empty` pokazuje błąd e-maila po pustym wysłaniu.
- `form-email` odrzuca niepoprawny e-mail.
- `form-notice` pokazuje informację pod przyciskiem z dwoma odnośnikami.
- `form-no-post` przy błędnych danych nie tworzy żądania POST.

## How to get to it (user POV)

- Otwórz `/` i przewiń do newslettera „Mniej sprzecznych rad. Więcej konkretów.”

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd.
- Sesja przeglądarki jest świeża, z włączonym JavaScriptem.
- `browser posts` na starcie tego przepisu zwraca `[]`.

- **Otwórz stronę główną.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /`. Wynik zaczyna się od `status 200`.
- **Włączony przycisk.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zapisuję się" --exact --state enabled`. Wynik to `enabled`.
- **Puste wysłanie.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zapisuję się" --exact`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisz poprawny adres e-mail."`.
- **Zły e-mail.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "Twój adres e-mail" --exact --value "wrong"` i ponownie kliknij „Zapisuję się”. Komunikat błędu zostaje.
- **Informacja.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Regulamin newslettera" --attribute href --value /regulamin-newslettera/` oraz to samo dla „Polityka prywatności” i `/polityka-prywatnosci/`.
- **Brak wysyłki.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser posts`. Wynik to `[]`.
- **Dowód.** `browser snapshot --aria --path home-form/error.aria.txt` i `browser screenshot --path home-form/error.png`.

## Gotchas

- **Nie wysyłaj poprawnego adresu.** Poprawne dane trafiają na produkcyjny webhook n8n i zapisują prawdziwy adres. Ścieżkę sukcesu i błędu serwera sprawdza Playwright `tests/e2e/lead-forms.spec.ts` z mockiem `flows.zawlodzki.com`.
- Przycisk startuje jako disabled i włącza go skrypt strony. Bez JavaScriptu pozostaje disabled i widać komunikat noscript.
- „Twój adres e-mail” wymaga `--exact`. Katalog `/ui/` ma osobny formularz kontaktowy („Wyślij wiadomość”, „Imię”, „E-mail”).

# Formularz demonstracyjny

Na stronie głównej użytkownik sprawdza imię i e-mail. Puste lub złe pola pokazują błąd. Poprawne dane dają status, że nic nie wysłano.

## Sub-features

- `form-empty` pokazuje błąd imienia po pustym wysłaniu.
- `form-email` odrzuca niepoprawny e-mail i przyjmuje poprawny.
- `form-no-post` nie tworzy żądania POST.

## How to get to it (user POV)

- Otwórz `/` i przewiń do formularza „Kontakt demonstracyjny”.
- W nagłówku wybierz „English”, potem na `/en/` użyj „Check the form”. Ten przebieg opisuje tylko wejście polskie.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd.
- Sesja przeglądarki jest świeża, z włączonym JavaScriptem.
- `browser posts` na starcie tego przepisu zwraca `[]`.

- **Otwórz stronę główną.** Wejdź na `/`. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /`. Wynik zaczyna się od `status 200`.
- **Włączony przycisk.** Po starcie skryptu przycisk da się nacisnąć. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Sprawdź formularz" --exact --state enabled`. Wynik to `enabled`.
- **Puste wysłanie.** Naciśnij „Sprawdź formularz”. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Sprawdź formularz" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisz imię (od 2 do 100 znaków)."`. Widoczny jest ten komunikat.
- **Zły e-mail.** Wpisz imię i zły adres, wyślij ponownie. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "Imię" --exact --value "Łucja"`, `node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "E-mail" --exact --value "wrong"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Sprawdź formularz" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisz poprawny adres e-mail."`.
- **Poprawne dane.** Popraw e-mail i wyślij. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "E-mail" --exact --value "test@example.com"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Sprawdź formularz" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role status --text "Dane poprawne. Nic nie wysłano."`.
- **Brak wysyłki.** Odczytaj żądania POST sesji. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser posts`. Wynik to `[]`.
- **Dowód.** Zapisz stan po statusie. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path home-form/status.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path home-form/status.png`. Snapshot zawiera status i markę w linku nagłówka.

## Gotchas

- Przycisk startuje jako disabled i włącza go skrypt strony. Przy wyłączonym JavaScript oczekiwany stan to disabled, a status sukcesu się nie pojawi.
- Sam status nie wystarcza. Lista POST musi być pusta po całym przepisie.
- „E-mail” i „Imię” wymagają `--exact`, bo na stronie są też inne pola katalogu, gdy jedziesz z `/ui/`.
- Wejście angielskie ma inne napisy: „Check the form”, „Name”, „Email”, „The details look correct. Nothing was sent.” Nie mieszaj ich z tym przepisem.

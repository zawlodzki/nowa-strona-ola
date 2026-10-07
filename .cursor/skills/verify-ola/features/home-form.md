# Formularz demonstracyjny

Na stronie głównej użytkownik sprawdza e-mail i zgodę newslettera. Puste lub złe pola pokazują błąd. Poprawne dane dają status, że nic nie wysłano.

## Sub-features

- `form-empty` pokazuje błąd e-maila po pustym wysłaniu.
- `form-email` odrzuca niepoprawny e-mail i przyjmuje poprawny.
- `form-consent` wymaga zaznaczenia zgody.
- `form-no-post` nie tworzy żądania POST.

## How to get to it (user POV)

- Otwórz `/` i przewiń do newslettera „Mniej sprzecznych rad. Więcej konkretów.”
- W nagłówku wybierz „English”, potem na `/en/` użyj „I want the newsletter”. Ten przebieg opisuje tylko wejście polskie.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd.
- Sesja przeglądarki jest świeża, z włączonym JavaScriptem.
- `browser posts` na starcie tego przepisu zwraca `[]`.

- **Otwórz stronę główną.** Wejdź na `/`. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /`. Wynik zaczyna się od `status 200`.
- **Włączony przycisk.** Po starcie skryptu przycisk da się nacisnąć. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Chcę otrzymywać newsletter" --exact --state enabled`. Wynik to `enabled`.
- **Puste wysłanie.** Naciśnij „Chcę otrzymywać newsletter”. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Chcę otrzymywać newsletter" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisz poprawny adres e-mail."`. Widoczny jest ten komunikat.
- **Zły e-mail.** Wpisz zły adres i wyślij ponownie. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "Twój adres e-mail" --exact --value "wrong"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Chcę otrzymywać newsletter" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wpisz poprawny adres e-mail."`.
- **Brak zgody.** Popraw e-mail i wyślij bez zgody. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser fill --role textbox --name "Twój adres e-mail" --exact --value "test@example.com"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Chcę otrzymywać newsletter" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Zaznacz zgodę, aby sprawdzić formularz."`.
- **Poprawne dane.** Zaznacz zgodę i wyślij. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role checkbox --name "Wyrażam zgodę na otrzymywanie newslettera. To demonstracja — nic nie zostanie wysłane."`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Chcę otrzymywać newsletter" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role status --text "Dane poprawne. Nic nie wysłano."`.
- **Brak wysyłki.** Odczytaj żądania POST sesji. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser posts`. Wynik to `[]`.
- **Dowód.** Zapisz stan po statusie. Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path home-form/status.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path home-form/status.png`. Snapshot zawiera status i markę w linku nagłówka.

## Gotchas

- Przycisk startuje jako disabled i włącza go skrypt strony. Przy wyłączonym JavaScript oczekiwany stan to disabled, a status sukcesu się nie pojawi.
- Sam status nie wystarcza. Lista POST musi być pusta po całym przepisie.
- `browser context` nie czyści listy POST. Precondition `[]` wymaga świeżego `browser start`, nie samego nowego kontekstu.
- „Twój adres e-mail” wymaga `--exact`. Katalog `/ui/` nadal ma osobny formularz imię/e-mail („Sprawdź formularz”, „Imię”, „E-mail”, w tym „Imię z błędem”) i nie jest tym przepisem.
- Wejście angielskie na `/en/` ma napisy „I want the newsletter”, „Your email address”, „The details look correct. Nothing was sent.” Katalog `/en/ui/` ma inne copy („Check the form”, „Name”, „Email”). Nie mieszaj ich z tym przepisem.

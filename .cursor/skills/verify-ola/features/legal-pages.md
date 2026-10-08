# Strony prawne

Użytkownik czyta dokumenty prawne z CMS (fixture bez Sanity): tytuł, datę
obowiązywania i treść. Angielska polityka informuje, że wiążąca jest wersja
polska. Zgoda newslettera na stronie głównej linkuje regulamin newslettera.

## Sub-features

- `legal-privacy` otwiera `/polityka-prywatnosci/` z H1 i datą 24.08.2026.
- `legal-cookies` przechodzi z polityki na listę cookies i z powrotem.
- `legal-en` na `/en/privacy/` pokazuje informację o wersji polskiej.
- `legal-newsletter-form` pokazuje link regulaminu newslettera w zgodzie.

## How to get to it (user POV)

- Stopka: „Polityka prywatności” albo „Regulamin”.
- Z polityki: odnośnik do listy cookies.
- Nagłówek „English”, potem `/en/privacy/`.
- Strona główna, sekcja newslettera, etykieta zgody.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd.
- Sesja przeglądarki jest świeża.

- **Polityka.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /polityka-prywatnosci/`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Polityka prywatności www.zawlodzki.pl"`. Snapshot i zrzut: `--path legal/privacy-desktop.png`.
- **Cookies.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "liście cookies i identyfikatorów"`. Potem oczekuj H1 „Lista cookies i identyfikatorów”.
- **EN.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/privacy/`. Oczekuj tekstu „The binding version is the Polish text”.
- **Zgoda.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /`. Oczekuj linku „regulamin newslettera”.

## Gotchas

- Treść PL jest 1:1 ze źródła B2B (zawlodzki.pl); nie oceniaj jej jako copy Oli.
- EN nie ma tłumaczenia dokumentu — tylko informacja i link do PL.
- Stopka nie linkuje listy cookies ani regulaminu newslettera.

# Przełącznik języka

Wersja angielska jest wyłączona decyzją z 10.10.2026 (`docs/IMPLEMENTATION-PLAN.md`, sekcja PL/EN). Polskie strony nie pokazują linku „English”, a każdy adres `/en/…` zwraca 404. Przepis na przełączanie PL/EN wróci po ponownym włączeniu EN (rename `src/pages/_en` → `src/pages/en` i `enabledLocales` w `src/lib/paths.ts`).

## Sub-features

- `lang-disabled-home` na `/` nie ma linku „English”, a `/en/` odpowiada 404.
- `lang-disabled-workshop` na `/warsztat/` nie ma linku „English”, mimo że strona ma tłumaczenie w CMS. `/en/workshop/` odpowiada 404.
- `lang-missing` na `/tylko-pl/` nie pokazuje „English”, a `/en/tylko-pl/` odpowiada 404.

## How to get to it (user POV)

- Otwórz bezpośrednio `/`, `/warsztat/` albo `/tylko-pl/` i sprawdź nagłówek.
- Wpisz w pasku adresu `/en/` albo `/en/workshop/`.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd fixture’ów.
- Sesja przeglądarki ma włączony JavaScript. Ten przepis i tak czyta linki obecne w HTML.

- **Strona główna PL.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /`. Wynik zaczyna się od `status 200`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --count 0`.
- **Warsztat.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /warsztat/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Jeden dzień na wspólny porządek."` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --count 0`.
- **Dowód.** Na warsztacie uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path language/workshop.aria.txt`.
- **Brak tłumaczenia.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /tylko-pl/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Ta strona nie ma wersji angielskiej."` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --count 0`.
- **404 EN.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/workshop/`. Oba wyniki zaczynają się od `status 404`.

## Gotchas

- Licznik 0 dla „English” jest dowodem wyłączenia, a nie błędem selektora.
- Zdanie „Adres /en/tylko-pl nie istnieje.” na `/tylko-pl/` to tekst fixture’u, nie odnośnik.
- `goto` raportuje status dokumentu. 404 jest oczekiwanym wynikiem dla każdego adresu `/en/…`.

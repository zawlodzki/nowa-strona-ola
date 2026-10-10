# Landing konsultacji

Publiczna `/konsultacje/` i angielska `/en/consultations/` pokazują landing Consultation3a z fixture’ów: hero z ceną 450 zł / 60 minut z dokumentu usługi, dwa przyciski „Zarezerwuj konsultację” do tymczasowego Cal.com z jawną informacją, że to nie jest potwierdzenie wizyty, mapę pytań, przebieg, efekty, prowadzącą, dwie opinie i sześć pytań FAQ w natywnym `details`. Strona nie ma formularza i nic nie wysyła.

## Sub-features

- Osobne dokumenty PL/EN. Brak polskiego H1 pod `/en/consultations/`. `/en/konsultacje/` zwraca 404.
- Nagłówek ma lokalne kotwice („Dla kogo”, „Jak to wygląda”, „Opinie”, „FAQ”) i przycisk „Konsultacja · 450 zł” do `#cena`.
- Stopka ma pełną nawigację serwisu. Link „Konsultacje” ma `aria-current="page"`.
- Przełącznik języka prowadzi do pary `/konsultacje/` ↔ `/en/consultations/`.
- Cena w hero, nagłówku i karcie oferty pochodzi z jednego dokumentu `service`. Wskaźnik 450+ to liczba kobiet rocznie, nie cena.

## How to get to it (user POV)

Ze strony głównej wybrać „Konsultacje” w nawigacji albo drugi przycisk hero „Poznaj konsultacje”. Albo otworzyć `/konsultacje/`. Angielski odpowiednik jest pod `/en/consultations/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /konsultacje/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Wiesz już dużo. Ustal, co dalej."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Zarezerwuj konsultację" --count 2
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Konsultacja · 450 zł" --attribute href --value "#cena"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Konsultacje" --exact --attribute aria-current --value page
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role group --count 6
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path consultation-pl-aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path consultation-pl.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/consultations/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "You already know a lot. Decide what comes next."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Consultation · 450 PLN" --attribute href --value "#cena"
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path consultation-en-aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path consultation-en.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/konsultacje/
```

`browser posts` ma wypisać `[]`. Ostatnie `goto` ma zwrócić `status 404`.

## Gotchas

H1 łamie wiersze przez `\n` w danych. Playwright i verify-ola widzą złączony tekst „Wiesz już dużo. Ustal, co dalej.”
Pytania FAQ są w `details` bez nazwy dostępnej. Harness nie otwiera ich przez `--role group`, jak w [katalogu 3a](./design-system.md). Otwarcie natywnego pytania sprawdza test `npx playwright test -g "consultation page"`.
Kotwice landingu są polskie także w EN (`#cena`, `#przebieg`), jak na stronie O mnie.
„Zarezerwuj konsultację” prowadzi do `https://cal.com/dietetyk/konsultacja` (decyzja 10.10.2026). Nie klikaj go w przepisie; wyjście poza origin przerywa sesję. Brak potwierdzenia rezerwacji na stronie jest zamierzony; rezerwację i płatność obsługuje Cal.com.
Nie otwieraj Studio, podglądu 4322 ani Workera. Natywny zoom, czytnik i urządzenie fizyczne nie są w tym przepisie.

# Landing konsultacji

Publiczna `/konsultacje/` pokazuje landing Consultation3a z fixture’ów. Hero ma cenę 450 zł / 60 minut z dokumentu usługi. Dwa linki „Zarezerwuj konsultację” prowadzą do Cal.com. Status rezerwacji to `live`, więc zdanie o tymczasowym kalendarzu nie jest na stronie. Dalej są mapa pytań, przebieg, efekty, prowadząca, dwie opinie i sześć pytań FAQ w natywnym `details`. Strona nie ma formularza leada. `browser posts` po samym wejściu zwraca `[]`.

## Sub-features

- Adresy `/en/consultations/` i `/en/konsultacje/` nie są publikowane. 404 EN sprawdza `language.md`.
- Nagłówek ma lokalne kotwice („Dla kogo”, „Jak to wygląda”, „Opinie”, „FAQ”) i przycisk „Konsultacja · 450 zł” do `#cena`.
- Stopka ma pełną nawigację serwisu. Link „Konsultacje” ma `aria-current="page"`.
- Nagłówek 3a nie renderuje linku „English”.
- Cena w hero, nagłówku i karcie oferty pochodzi z jednego dokumentu `service`. Wskaźnik 9000+ to liczba kobiet śledzących materiały na Instagramie, nie cena.

## How to get to it (user POV)

Ze strony głównej wybierz „Konsultacje” w nawigacji albo drugi przycisk hero „Poznaj konsultacje”. Albo otwórz `/konsultacje/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /konsultacje/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Wiesz już dużo. Ustal, co dalej."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Zarezerwuj konsultację" --count 2
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Konsultacja · 450 zł" --attribute href --value "#cena"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "Konsultacje" --exact --attribute aria-current --value page
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role group --count 6
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path consultation/pl.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path consultation/pl.png
```

`browser posts` ma wypisać `[]`. Nie klikaj „Zarezerwuj konsultację”.

## Gotchas

H1 łamie wiersze przez `\n` w danych. Playwright i verify-ola widzą złączony tekst „Wiesz już dużo. Ustal, co dalej.”
Pytania FAQ są w `details` bez nazwy dostępnej. Harness nie otwiera ich przez `--role group`, jak w [katalogu 3a](./design-system.md). Otwarcie natywnego pytania sprawdza test `npx playwright test -g "consultation page"`.
Kotwice landingu są polskie także w EN (`#cena`, `#przebieg`), jak na stronie O mnie.
„Zarezerwuj konsultację” prowadzi do `https://cal.com/dietetyk/konsultacja`. Nie klikaj go w przepisie. Wyjście poza origin przerywa sesję. Rezerwację i płatność obsługuje Cal.com. Zdanie „To nie jest potwierdzenie wizyty.” jest notatką edytorską i nie wchodzi do HTML przy statusie `live`.
Nie otwieraj Studio, podglądu 4322 ani Workera. Natywny zoom, czytnik i urządzenie fizyczne nie są w tym przepisie.

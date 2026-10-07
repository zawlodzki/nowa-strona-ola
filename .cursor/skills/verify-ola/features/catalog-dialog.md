# Dialog katalogu

W przejściowym katalogu `/ui/` przycisk „Jak pracujemy” otwiera dialog. Escape albo przycisk „Zamknij” zamyka go. `/design-system/` tego dialogu nie ma.

## Sub-features

- `dialog-open` pokazuje dialog po „Jak pracujemy”.
- `dialog-escape` zamyka go klawiszem Escape.
- `dialog-close` zamyka go przyciskiem „Zamknij”.

## How to get to it (user POV)

- Otwórz `/ui/` i naciśnij „Jak pracujemy”.
- Otwórz `/en/ui/` i naciśnij „How we work”. Ten przebieg opisuje wejście polskie.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd.
- JavaScript sesji jest włączony. Bez niego dialog się nie otwiera.

- **Katalog.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ui/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Katalog komponentów"`.
- **Otwórz.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Jak pracujemy" --exact`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role dialog --name "Najpierw rozmowa" --exact --state visible`.
- **Dowód.** Przy otwartym dialogu uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path catalog-dialog/open.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path catalog-dialog/open.png`.
- **Escape.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser press --key Escape`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role dialog --state hidden` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Jak pracujemy" --exact --attribute aria-expanded --value "false"`.
- **Zamknij przyciskiem.** Uruchom ponownie click „Jak pracujemy”, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zamknij" --exact`, `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role dialog --state hidden` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Jak pracujemy" --exact --attribute aria-expanded --value "false"`.

## Gotchas

- „Zamknij” jest w dialogu. Kliknięcie poza otwartym dialogiem nie jest tym przepisem.
- Angielskie nazwy to „How we work” i „Close”. Nie mieszaj ich z polskim przebiegiem.
- Fokus po Escape wraca na przycisk w teście Playwright. Ten harness nie czyta aktywnego elementu. Dowodem zamknięcia jest `aria-expanded="false"` na „Jak pracujemy”, nie sam `dialog` hidden.
- Link „Docelowy design system 3a” prowadzi na `/design-system/`. To inna strona i inny przepis. Ten przebieg zostaje na `/ui/`.

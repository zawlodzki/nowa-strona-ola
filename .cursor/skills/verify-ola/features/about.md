# Strona O mnie

Publiczna `/o-mnie/` i angielska `/en/about/` pokazują profil About3a z fixture’ów: imię, uczelnię, zdjęcie ukończenia w slocie dyplomu, podejście, dwie opinie, materiały, konsultację 450 zł/60 min z tymczasowym Cal.com oraz demonstracyjny newsletter, który nic nie wysyła.

## Sub-features

- Osobne dokumenty PL/EN. Brak polskiego tekstu pod `/en/about/`. `/en/o-mnie/` nie istnieje.
- Nawigacja „O mnie” ma `aria-current="page"`. Przełącznik języka prowadzi do pary `/o-mnie/` ↔ `/en/about/`.
- Slot dyplomu pokazuje zdjęcie ukończenia. Puste `diplomaScan` zostawia ramkę „Dokument do uzupełnienia”.
- Formularz newslettera na tej stronie jest demonstracyjny.

## How to get to it (user POV)

Ze strony głównej wybrać „O mnie” w nawigacji albo „Poznaj moją historię”. Albo otworzyć `/o-mnie/`. Angielski odpowiednik jest pod `/en/about/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /o-mnie/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Jestem Ola. Znam PCOS od środka."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role img --name "Aleksandra Olesiewicz z dyplomem przed Wydziałem Zdrowia Publicznego ŚUM w Bytomiu"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Śląski Uniwersytet Medyczny"
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zapisuję się" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path about-pl-aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path about-pl.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /en/about/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "I am Ola. I know PCOS from the inside."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role img --name "Aleksandra Olesiewicz with her diploma outside the Faculty of Public Health, Medical University of Silesia in Bytom"
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path about-en-aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path about-en.png
```

`browser posts` po kliknięciu newslettera ma wypisać `[]`.

## Gotchas

H1 mockupu łamie wiersze. Playwright i verify-ola widzą złączony tekst „Jestem Ola. Znam PCOS od środka.”
Nie otwieraj Studio, podglądu 4322 ani Workera. Natywny zoom, czytnik i urządzenie fizyczne nie są w tym przepisie.

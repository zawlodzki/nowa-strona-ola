# Strona O mnie

Publiczna `/o-mnie/` pokazuje profil About3a z fixture’ów. H1 to „Jestem Ola. Znam PMOS od środka.” Wydział w kwalifikacjach to „Wydział Zdrowia Publicznego w Bytomiu”. Slot dyplomu pokazuje zdjęcie pracy dyplomowej. W historii jest „9000+”. Konsultacja na dole ma cenę „450 zł / 60 minut”. Newsletter jest prawdziwym formularzem. Puste kliknięcie „Zapisuję się” nic nie wysyła.

## Sub-features

- Nawigacja „O mnie” ma `aria-current="page"`. Nagłówek 3a nie pokazuje „English”.
- Zdjęcie dyplomu ma nazwę „Aleksandra Olesiewicz z pracą dyplomową przed budynkiem Wydziału Zdrowia Publicznego w Bytomiu”.
- Wiersz uczelni łączy instytucję i wydział przecinkiem.
- Formularz newslettera przy błędzie nie tworzy POST.

## How to get to it (user POV)

Ze strony głównej wybierz „O mnie” w nawigacji albo „Poznaj moją historię”. Albo otwórz `/o-mnie/`.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /o-mnie/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Jestem Ola. Znam PMOS od środka."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role img --name "Aleksandra Olesiewicz z pracą dyplomową przed budynkiem Wydziału Zdrowia Publicznego w Bytomiu"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Śląski Uniwersytet Medyczny w Katowicach, Wydział Zdrowia Publicznego w Bytomiu"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "9000+"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "450 zł / 60 minut"
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zapisuję się" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path about/pl.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path about/pl.png
```

`browser posts` po kliknięciu newslettera ma wypisać `[]`.

## Gotchas

H1 łamie wiersze. Playwright i verify-ola widzą złączony tekst „Jestem Ola. Znam PMOS od środka.”
Sam napis „Śląski Uniwersytet Medyczny” nie jest osobnym elementem. `expect --text` jest dokładny, więc przepis podaje cały wiersz z wydziałem.
Link rezerwacji prowadzi na Cal.com. Nie klikaj go. Wyjście poza origin przerywa sesję. Zdanie o tymczasowym kalendarzu nie jest na stronie, bo status rezerwacji to `live`.
Nie otwieraj Studio, podglądu 4322 ani Workera.

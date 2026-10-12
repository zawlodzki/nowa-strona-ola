# Baner zgód

Na publicznych stronach 3a widać panel cookies. Na tym podglądzie klient woła `/api/c15t` na tym samym hoście, a statyczny serwis tej trasy nie ma, więc panel zostaje. Przyciski to „Akceptuję wszystkie”, „Odrzucam opcjonalne”, „Dostosuj” i „Zamknij bez zmiany zgód”. Zamknięcie chowa panel i nie wysyła POST.

## Sub-features

- `consent-visible` pokazuje trzy wybory i zamknięcie na `/`.
- `consent-dismiss` klika „Zamknij bez zmiany zgód” i chowa „Akceptuję wszystkie”.
- `consent-no-post` po zamknięciu zostawia pustą listę POST.

## How to get to it (user POV)

Otwórz `/` w świeżej sesji przeglądarki tego przebiegu. Panel jest na dole strony. Katalog `/ui/`, katalog `/design-system/` i `/static/` tego panelu nie mają.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Odrzucam opcjonalne" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Dostosuj" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zamknij bez zmiany zgód" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path consent/banner.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path consent/banner.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zamknij bez zmiany zgód" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact --count 0
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
```

`browser posts` ma wypisać `[]`.

## Gotchas

Nie klikaj „Akceptuję wszystkie” ani „Odrzucam opcjonalne”. Wybór wysyła POST, a lista `browser posts` żyje do końca procesu przeglądarki.
Zamknięcie jest tylko w pamięci tej strony. Następny dokument może pokazać panel znowu.
Przy viewportcie 1280×900 klik w „Zapisuję się” dochodzi także przy otwartym panelu. Ten przepis i tak zamyka panel, bo to jego zachowanie.

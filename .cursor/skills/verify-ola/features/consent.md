# Baner zgód

Na stronach w `SiteShell3a` widać panel cookies. Na tym podglądzie klient woła `/api/c15t` na tym samym hoście. Statyczny serwis tej trasy nie ma, więc zapis się nie udaje i panel zostaje. Przyciski to „Akceptuję wszystkie”, „Odrzucam opcjonalne”, „Dostosuj” i „Zamknij bez zmiany zgód”. Zamknięcie chowa panel i nie wysyła POST.

Build bez `PUBLIC_GTM_ENABLED` pokazuje zdanie, że opcjonalne narzędzia nie zostały uruchomione. Skrypt Google Tag Managera nie wchodzi wtedy do dokumentu. Ładowanie kontenera po zgodzie wymaga buildu z `PUBLIC_GTM_ENABLED=true` i udanego zapisu c15t. Ten przebieg fixture tego nie robi.

## Sub-features

- `consent-visible` pokazuje trzy wybory, zamknięcie i zdanie o nieuruchomionych narzędziach na `/`.
- `consent-status` pokazuje błąd odczytu, bo `/api/c15t` nie istnieje.
- `consent-customize` otwiera dialog z opisem Google Analytics 4 i piksela Meta.
- `consent-dismiss` klika „Zamknij bez zmiany zgód” i chowa „Akceptuję wszystkie”.
- `consent-excluded` na `/kontakt/` nadal pokazuje baner. Ta strona nie ma meta `ao-tracking-policy`.
- `consent-absent` na `/ui/`, `/design-system/` i `/static/` nie ma przycisku „Akceptuję wszystkie”.
- `consent-no-post` po zamknięciu i po „Dostosuj” zostawia pustą listę POST.

## How to get to it (user POV)

Otwórz `/` w świeżej sesji przeglądarki tego przebiegu. Panel jest na dole strony. Katalog `/ui/`, katalog `/design-system/` i `/static/` tego panelu nie mają. Kontakt, konsultacje, odstąpienie i dokumenty prawne panel mają, a polityki pomiaru nie.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Odrzucam opcjonalne" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Dostosuj" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Zamknij bez zmiany zgód" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Ustawienia cookies" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Opcjonalne narzędzia nie zostały jeszcze uruchomione. Możesz zapisać swój wybór na przyszłość."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Nie udało się zapisać lub odczytać ustawień cookies. Opcjonalne narzędzia pozostają wyłączone. Spróbuj ponownie."
node .cursor/skills/verify-ola/scripts/verify.mjs browser script-count
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path consent/banner.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path consent/banner.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Dostosuj" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Google Analytics 4: statystyki wyświetleń i czasu zaangażowania."
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Piksel Meta, z wyłączeniem stron opisanych powyżej."
node .cursor/skills/verify-ola/scripts/verify.mjs browser script-count
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser press --key Escape
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role button --name "Zamknij bez zmiany zgód" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact --count 0
node .cursor/skills/verify-ola/scripts/verify.mjs browser posts
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /kontakt/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /ui/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact --count 0
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /design-system/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact --count 0
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /static/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role button --name "Akceptuję wszystkie" --exact --count 0
node .cursor/skills/verify-ola/scripts/verify.mjs browser script-count
```

Oba `browser posts` mają wypisać `[]`. Dwa odczyty `script-count` na `/` mają być równe. „Dostosuj” nie dokleja skryptu. Na `/static/` wynik to `scripts 0`.

## Gotchas

Nie klikaj „Akceptuję wszystkie” ani „Odrzucam opcjonalne”. Wybór wysyła POST na `/api/c15t`, a lista `browser posts` żyje do końca procesu przeglądarki.
Kontener `https://www.googletagmanager.com/gtm.js?id=GTM-PWBRPZ29` dokleja `src/lib/analytics.ts` dopiero po udanym zapisie, gdy build ma `PUBLIC_GTM_ENABLED=true` i strona ma politykę z `src/lib/tracking-policy.ts`. Kody to home, about, blog-index, blog-article, ebook-index i ebook-detail. Ten podgląd zostawia loader wyłączony, a zapis c15t się nie udaje, więc wstrzyknięcia GTM tu nie widać. Harness liczy elementy `script` i nie czyta ich `src`.
„Ustawienia cookies” w stopce startuje z atrybutem `hidden`. `src/lib/consent-panel.ts` zdejmuje `hidden` przy starcie skryptu.
Zamknięcie jest tylko w pamięci tej strony. Następny dokument może pokazać panel znowu.
Przycisk „Zamknij bez zmiany zgód” w otwartym dialogu zamyka dialog. Baner chowa osobny przycisk na banerze, gdy dialog jest zamknięty.

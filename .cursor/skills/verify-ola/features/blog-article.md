# Artykuł na blogu

Z listy bloga użytkownik otwiera wpis „Najpierw proces, potem CRM”, widzi spis treści i link do angielskiej wersji tego samego artykułu.

## Sub-features

- `blog-index` pokazuje nagłówek „Blog” na `/blog/`.
- `blog-open` otwiera artykuł z linku na liście.
- `blog-en` prowadzi do `/en/blog/process-before-crm/`.

## How to get to it (user POV)

- Otwórz `/blog/` i wybierz „Najpierw proces, potem CRM”.
- Otwórz bezpośrednio `/blog/najpierw-proces/`.
- Z artykułu wybierz „English”.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd fixture’ów.
- Na liście jest link artykułu z fixture’a. To nie jest treść z datasetu Sanity.

- **Lista.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog" --exact`.
- **Wejście z listy.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Najpierw proces, potem CRM" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Najpierw proces, potem CRM"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role navigation --name "Spis treści"`.
- **Angielski artykuł.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --attribute href --value "/en/blog/process-before-crm/"`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "English" --exact` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Process first, then CRM"`.
- **Dowód.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path blog-article/english.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-article/english.png`.

## Gotchas

- Tytuł artykułu występuje też jako link na liście. Na stronie artykułu sprawdzaj nagłówek, nie sam fakt kliknięcia.
- Bez `--exact` na liście „Blog” dopasuje też inne nagłówki zawierające to słowo tylko wtedy, gdy taki nagłówek istnieje. Zostaw `--exact` przy H1 listy.
- Sprawdzenie jednego artykułu nie pokrywa kategorii ani paginacji. Tych ścieżek mapa jeszcze nie rozpisuje.

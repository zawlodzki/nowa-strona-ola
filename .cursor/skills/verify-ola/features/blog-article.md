# Artykuł na blogu

Z listy bloga użytkownik otwiera wpis „Najpierw proces, potem CRM”, widzi spis treści i link do angielskiej wersji tego samego artykułu. Z tej samej listy wchodzi w kategorię „Proces”.

## Sub-features

- `blog-index` pokazuje nagłówek „Blog” na `/blog/`.
- `blog-open` otwiera artykuł z karty wyróżnionej na liście.
- `blog-en` prowadzi do `/en/blog/process-before-crm/`.
- `blog-category` otwiera `/blog/kategoria/proces/` z linku „Proces”.

## How to get to it (user POV)

- Otwórz `/blog/` i wybierz „Najpierw proces, potem CRM”.
- Otwórz bezpośrednio `/blog/najpierw-proces/`.
- Z artykułu wybierz „English”.
- Z listy bloga wybierz kategorię „Proces”.

## Driving it with verify-ola

Preconditions:

- Doctor potwierdza bazowy podgląd fixture’ów.
- Na liście jest link artykułu z fixture’a. To nie jest treść z datasetu Sanity.

- **Lista.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Blog" --exact`.
- **Kategoria.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Proces" --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Proces" --exact` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --attribute href --value "/en/blog/category/process/"`.
- **Powrót do listy.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /blog/`.
- **Wejście z listy.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Najpierw proces, potem CRM Narzędzie nie naprawi niejasnych decyzji." --exact`. Potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Najpierw proces, potem CRM"` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role navigation --name "Spis treści"`.
- **Angielski artykuł.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role link --name "English" --exact --attribute href --value "/en/blog/process-before-crm/"`, potem `node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "English" --exact` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Process first, then CRM"`.
- **Dowód.** Uruchom `node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path blog-article/english.aria.txt` i `node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path blog-article/english.png`.

## Gotchas

- Karta wyróżniona składa tytuł i lead w jedną dostępną nazwę linku. Karta na liście wpisów dokłada jeszcze datę. `--exact` na samym tytule nie trafia w żaden link. Bez `--exact` Playwright widzi dwa linki do tego samego artykułu.
- Tytuł artykułu występuje też jako link na liście. Na stronie artykułu sprawdzaj nagłówek, nie sam fakt kliknięcia.
- Bez `--exact` na liście „Blog” dopasuje też inne nagłówki zawierające to słowo tylko wtedy, gdy taki nagłówek istnieje. Zostaw `--exact` przy H1 listy.
- Na `/blog/kategoria/proces/` H3 karty „Najpierw proces, potem CRM” też pasuje do nazwy „Proces”. `--exact` zostawia sam H1.
- Fixture ma trzy wpisy i `ARTICLES_PER_PAGE` równe 6, więc paginacja się nie renderuje, a `/blog/strona/2/` odpowiada 404. To nie jest regresja produktu.

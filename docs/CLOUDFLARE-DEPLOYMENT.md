# Wdrożenia Cloudflare

Konfiguracja przygotowuje trzy niezależne Workery w środowiskach `staging`
i `production`. Ten dokument nie potwierdza utworzenia zasobów ani wdrożenia.

| Aplikacja        | Konfiguracja             | Artefakt / punkt wejścia  |
| ---------------- | ------------------------ | ------------------------- |
| Publiczny serwis | `wrangler.jsonc`         | statyczny katalog `dist/` |
| Podgląd SSR      | `preview/wrangler.jsonc` | adapter Astro Cloudflare  |
| Integracje       | `worker/wrangler.jsonc`  | `worker/src/index.ts`     |

Nazwy docelowe mają końcówkę `-staging` albo `-production`. Nie używać
środowiska domyślnego do zdalnych wdrożeń. Konfiguracje włączają logi i ślady
z próbkowaniem; kod nie może zapisywać treści leadów, tokenów ani innych danych
osobowych.

Publiczny Worker produkcyjny ma przypisaną domenę własną
`aleksandraolesiewicz.com` i wyłączony adres `workers.dev`. Konfiguracja nie
obejmuje `www.aleksandraolesiewicz.com`, dopóki nie zostanie ustalone, czy ma być
aliasem z przekierowaniem. Domeny stagingu i chronionego podglądu pozostają otwarte.

## Sekrety i zmienne builda

Podgląd wymaga w każdym środowisku pięciu wartości zadeklarowanych przez
`secrets.required`: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_STUDIO_URL`,
`SANITY_API_READ_TOKEN` i `PREVIEW_SESSION_SECRET`. Trzy pierwsze są konfiguracją
operacyjną, ale również trafiają do sekretów, aby środowiska nie wymagały
placeholderów w repo. Token musi mieć wyłącznie uprawnienia Viewer, a sekret sesji
powinien być losowy i mieć co najmniej 32 znaki. Lokalnie skopiować
`preview/.dev.vars.example` do ignorowanego `preview/.dev.vars`.

Publiczny build otrzymuje `PUBLIC_SANITY_PROJECT_ID` i `PUBLIC_SANITY_DATASET`
jako zmienne systemu buildów. Nie wymaga tokenu: pobiera tylko perspektywę
`published`. Studio otrzymuje `SANITY_STUDIO_PROJECT_ID`,
`SANITY_STUDIO_DATASET` oraz origin właściwego podglądu. `CLOUDFLARE_API_TOKEN`
i `CLOUDFLARE_ACCOUNT_ID` należą wyłącznie do sekretów środowisk GitHub Actions,
nigdy do pliku konfiguracyjnego.

Worker integracyjny wymaga `SANITY_WEBHOOK_SECRET`, `BUILD_TRIGGER_URL` oraz
`BUILD_TRIGGER_TOKEN`. Deklaruje też `N8N_LEAD_WEBHOOK_URL` dla późniejszego
przekazywania zgłoszeń formularzy. Pierwsza wartość musi być identyczna z sekretem
webhooka Sanity. `BUILD_TRIGGER_URL` wskazuje endpoint GitHub Repository Dispatch
`https://api.github.com/repos/zawlodzki/nowa-strona-ola/dispatches`, a token musi
mieć minimalne uprawnienie `Contents: write` do tego prywatnego repozytorium.
Token służy wyłącznie do utworzenia zdarzenia i pozostaje sekretem Workera.
Lokalny zestaw nazw znajduje się w `worker/.dev.vars.example`.
Rzeczywisty adres n8n jest zapisany tylko w ignorowanym `worker/.dev.vars`, ponieważ
unikalny identyfikator w ścieżce jest daną dostępową. Nie wykonywać testowego POST
bez przygotowanego, odseparowanego workflow testowego w n8n.

Webhook Sanity kieruje `POST` na `/webhooks/sanity`, nie uwzględnia draftów i ma
filtr ograniczony do typów publicznej treści. Projekcja payloadu:

```groq
{
  "documentId": _id,
  "documentType": _type,
  "operation": delta::operation()
}
```

Włączyć podpisywanie webhooka i nie dodawać treści dokumentu do projekcji. Worker
przyjmuje tylko `create`, `update` i `delete`, odrzuca identyfikatory `drafts.*`,
podpis starszy niż pięć minut oraz body większe niż 64 KiB.

Dodanie wartości przez `wrangler secret put` tworzy i od razu wdraża nową wersję.
Dlatego pierwsze ustawienie oraz rotację wykonywać dopiero po wskazaniu konta,
środowiska i zatwierdzeniu wdrożenia; przy zmianie etapowanej użyć mechanizmu
`wrangler versions secret`.

## GitHub Actions i wdrożenie treści

Workflow `Publish content` odbiera wyłącznie zdarzenie `sanity-content-change`.
Worker ustawia `target_environment` na podstawie własnego środowiska, a GitHub
przepuszcza tylko `staging` albo `production`. Dla każdego celu buildy wykonują się
sekwencyjnie. Każdy przebieg pobiera commit gałęzi domyślnej wskazany przez zdarzenie,
sprawdza konfigurację, instaluje zależności z lockfile, uruchamia kontrole kodu i
testy jednostkowe, buduje publiczną stronę, sprawdza budżety i dopiero wtedy wdraża
gotowy artefakt przez Wrangler. Nieudany przebieg nie wykonuje deployu, więc zachowuje
poprzednią wersję.

W GitHub utworzyć środowiska `staging` i `production`. Każde wymaga:

- zmiennych `PUBLIC_SANITY_PROJECT_ID` i `PUBLIC_SANITY_DATASET`;
- sekretów `CLOUDFLARE_ACCOUNT_ID` i `CLOUDFLARE_API_TOKEN`;
- reguł ochrony odpowiednich do środowiska; produkcja może wymagać ręcznej akceptacji.

Token Cloudflare powinien mieć wyłącznie uprawnienia potrzebne do wdrożenia Worker
Scripts na wskazanym koncie. Workflow nie używa Cloudflare Builds i nie tworzy
sztucznych commitów. Pozostałe wdrożenia wykonywać osobno. Wszystkie używają Node z
`.node-version` oraz `npm ci`. Przed komendą wdrożenia uruchomić odpowiednio:

- publiczny serwis: `npm run build`;
- podgląd: `CLOUDFLARE_ENV=<environment> npm run build --workspace @ola/preview`;
- Worker integracyjny: `npm run check --workspace @ola/worker`.

Komenda wdrożenia musi jawnie wskazywać konfigurację i środowisko:

```sh
npx wrangler deploy --config wrangler.jsonc --env <environment>
npx wrangler deploy --config preview/dist/server/wrangler.json
npx wrangler deploy --config worker/wrangler.jsonc --env <environment>
```

Adapter Astro spłaszcza wybrane `CLOUDFLARE_ENV` do wygenerowanego pliku
`preview/dist/server/wrangler.json`; dlatego przy wdrożeniu podglądu nie podawać
ponownie `--env`. Sesje Astro są wyłączone, bo aplikacja używa własnego podpisanego
cookie. Obrazy są optymalizowane podczas builda, więc pierwszy deploy nie może
automatycznie utworzyć zbędnych bindingów KV ani Cloudflare Images.

Publikacja treści nie wdraża Studio, podglądu ani Workera integracyjnego. Preview SSR
powinien dodatkowo być chroniony Cloudflare Access; `noindex` i sesja aplikacyjna
nie zastępują kontroli dostępu na brzegu. Studio jest wdrażane osobno przez Sanity,
po ustawieniu poprawnego originu podglądu i CORS.

## Kontrola przed pierwszym wdrożeniem

1. Ustalić konto Cloudflare, subdomeny stagingu/podglądu, obsługę `www`, nazwy
   gałęzi i rzeczywisty projekt Sanity.
2. Utworzyć sześć docelowych Workerów przez zatwierdzone pierwsze wdrożenia.
3. Dodać sekrety podglądu oddzielnie dla stagingu i produkcji.
4. Utworzyć kolejki buildów i DLQ wskazane w `worker/wrangler.jsonc`, dodać trzy
   sekrety Workera integracyjnego i skonfigurować podpisany webhook Sanity.
5. Skonfigurować Access dla obu adresów podglądu oraz CORS w Sanity.
6. Sprawdzić dry-run, potem staging: statyczne 404, autoryzację podglądu, logi
   i ślady bez danych wrażliwych.
7. Dopiero po odbiorze stagingu dodać sekrety środowiska `production` i dopuścić
   produkcyjne zdarzenia Repository Dispatch.

Dry-run sprawdza pakowanie lokalne, lecz nie potwierdza konta, sekretów, domen,
Access, CORS ani zdalnego deployu. Lokalne testy webhooka i kolejki nie
zastępują próby pełnego przepływu z rzeczywistymi usługami.

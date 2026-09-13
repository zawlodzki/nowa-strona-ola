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
`aleksandraolesiewicz.com` i wyłączony adres `workers.dev`. `www` nie jest aliasem
tej samej aplikacji: strefa ma 301 na apex (ścieżka i query zachowane). Chroniony
podgląd produkcyjny używa `preview.aleksandraolesiewicz.com`. Publiczny staging
oraz staging podglądu zostają na `workers.dev`, dopóki nie pojawi się osobna nazwa
stagingu. Access dotyczy obu adresów podglądu; dozwolony e-mail:
`grzesiek@zawlodzki.pl`.

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
`BUILD_TRIGGER_TOKEN`. `N8N_LEAD_WEBHOOK_URL` jest zarezerwowany na formularze
i nie jest wymagany przy deployu, dopóki `/api/leads` zwraca 501. Nie wpisywać
produkcyjnego webhooka n8n do stagingu. `BUILD_TRIGGER_URL` wskazuje endpoint
GitHub Repository Dispatch
`https://api.github.com/repos/zawlodzki/nowa-strona-ola/dispatches`. Token musi
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

## Hosty i Access

| Środowisko          | Adres                                                    | Ochrona                                |
| ------------------- | -------------------------------------------------------- | -------------------------------------- |
| Publiczna produkcja | `aleksandraolesiewicz.com`                               | publiczna                              |
| `www`               | `www.aleksandraolesiewicz.com`                           | 301 na apex, ścieżka i query zachowane |
| Podgląd produkcyjny | `preview.aleksandraolesiewicz.com`                       | Access + sesja aplikacji               |
| Publiczny staging   | `ola-website-staging.zawlodzki.workers.dev`              | publiczna                              |
| Podgląd staging     | `ola-website-preview-staging.zawlodzki.workers.dev`      | sesja aplikacji; Access do włączenia   |
| Integracje staging  | `ola-website-integrations-staging.zawlodzki.workers.dev` | webhook `/webhooks/sanity`             |

Access: najpierw Zero Trust na koncie (plan Free, karta bez obciążenia). Dla
Workera `ola-website-preview-staging`: Workers & Pages → Worker → Access →
Protect this Worker → All traffic → e-mail `grzesiek@zawlodzki.pl`. To chroni
`workers.dev` i przyszłe domeny tego Workera. `noindex` i cookie sesji nie
zastępują Access. Po wdrożeniu produkcji powtórzyć dla
`ola-website-preview-production` (custom domain `preview.aleksandraolesiewicz.com`).

`www` nie dodawać jako custom domain publicznego Workera — to serwowałoby treść
zamiast przekierowania. W strefie: proxied CNAME `www` → apex oraz Single Redirect:
gdy hostname to `www.aleksandraolesiewicz.com`, 301 na
`https://aleksandraolesiewicz.com` z tą samą ścieżką i query.

## Koszt (stan dokumentacji Cloudflare, 2026-09-13)

Plan zakłada Sanity Free i **Workers Paid**. Publiczna strona statyczna mieści się
w Workers Free (żądania Static Assets są bezpłatne i nielimitowane). Queues mają
limit 10 000 operacji/dzień na Free. **Podgląd SSR tego nie unosi:** Free daje
10 ms CPU na wywołanie, a Cloudflare podaje 10–20 ms jako typowe dla SSR
i uwierzytelniania. Dlatego pierwsze wdrożenie podglądu i konsumentów kolejek
wymaga Workers Paid.

| Pozycja                     | Plan               | Koszt przy skali tej strony (~500 stron, webhooki, 6 Workerów, 4 kolejki) |
| --------------------------- | ------------------ | ------------------------------------------------------------------------- |
| Workers Paid                | subskrypcja konta  | **5 USD / miesiąc** minimum; 10 mln żądań i 30 mln ms CPU w cenie         |
| Static Assets (HTML/CSS/JS) | w Workers          | 0 USD ponad subskrypcję                                                   |
| Queues                      | w Workers Paid     | 1 mln operacji/mies. w cenie; redakcyjne webhooki zostaną w limicie       |
| Workers Logs / ślady (beta) | w Workers          | 20 mln zdarzeń/mies. w cenie; konfiguracja ma próbkowanie                 |
| Access / Zero Trust Free    | do 50 użytkowników | **0 USD** dla jednego e-maila; setup wymaga karty, bez obciążenia         |
| Custom domains i 301 `www`  | strefa Cloudflare  | 0 USD na istniejącej strefie                                              |
| Sanity Free                 | CMS                | bez zmian                                                                 |

Przy planowanym ruchu rachunek powinien zostać przy **ok. 5 USD/mies.**, bez
dopłat za Queues ani requesty. Nie włączam subskrypcji z CLI — to klik w
[Workers plans](https://dash.cloudflare.com/?to=/:account/workers/plans).

Źródła: [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
[Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/),
[Zero Trust Free](https://www.cloudflare.com/plans/zero-trust-services/).

## Token GitHub do Repository Dispatch

Token trafia wyłącznie do sekretu Workera `BUILD_TRIGGER_TOKEN`. Nie wklejać go
do czatu, repo, Sanity ani logów.

1. Otwórz [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new).
2. Nazwa np. `ola-site-build-dispatch`. Expiration wg polityki rotacji.
3. Resource owner: `zawlodzki`. Only select repositories: `nowa-strona-ola`.
4. Repository permissions: **Contents → Read and write**. Reszta: No access.
5. Generate token, skopiuj raz. Ten zakres wystarcza do
   `POST https://api.github.com/repos/zawlodzki/nowa-strona-ola/dispatches`.
6. Po utworzeniu Workera integracyjnego: `npx wrangler secret put BUILD_TRIGGER_TOKEN --config worker/wrangler.jsonc --env staging`
   (osobno `--env production`). Wartość wpisać w terminalu, nie w pliku w repo.

Classic PAT z zakresem `repo` też zadziała, ale jest szerszy — nie używać, skoro
wystarcza fine-grained Contents.

Osobny token Cloudflare (`CLOUDFLARE_API_TOKEN`) należy do sekretów środowisk
GitHub Actions, nie do Workera.

## Kontrola przed pierwszym wdrożeniem

1. Włączyć Workers Paid na koncie (5 USD/mies.) i zalogować Wranglera CLI
   (`npx wrangler login`). OAuth MCP w Cursorze nie zastępuje CLI.
2. Utworzyć sześć docelowych Workerów przez zatwierdzone pierwsze wdrożenia.
3. Dodać sekrety podglądu oddzielnie dla stagingu i produkcji.
4. Utworzyć kolejki buildów i DLQ wskazane w `worker/wrangler.jsonc`, dodać sekrety
   Workera integracyjnego i skonfigurować podpisany webhook Sanity.
5. Skonfigurować Access dla obu adresów podglądu, 301 `www` oraz CORS w Sanity
   na origin `https://preview.aleksandraolesiewicz.com`.
6. Sprawdzić dry-run, potem staging: statyczne 404, autoryzację podglądu, logi
   i ślady bez danych wrażliwych.
7. Dopiero po odbiorze stagingu dodać sekrety środowiska `production` i dopuścić
   produkcyjne zdarzenia Repository Dispatch.

Dry-run sprawdza pakowanie lokalne, lecz nie potwierdza konta, sekretów, domen,
Access, CORS ani zdalnego deployu. Lokalne testy webhooka i kolejki nie
zastępują próby pełnego przepływu z rzeczywistymi usługami.

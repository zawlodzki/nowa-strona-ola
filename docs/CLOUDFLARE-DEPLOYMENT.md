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
i `CLOUDFLARE_ACCOUNT_ID` należą wyłącznie do chronionych sekretów integracji
GitHub/Cloudflare, nigdy do pliku konfiguracyjnego.

Worker integracyjny wymaga `SANITY_WEBHOOK_SECRET`, `BUILD_TRIGGER_URL` oraz
`BUILD_TRIGGER_TOKEN`. Deklaruje też `N8N_LEAD_WEBHOOK_URL` dla późniejszego
przekazywania zgłoszeń formularzy. Pierwsza wartość musi być identyczna z sekretem
webhooka Sanity. Dwie pozostałe opisują chroniony endpoint orkiestracji builda przyjmujący
`POST` z bearer tokenem; jego konkretną usługę wybieramy podczas podłączania
Cloudflare Builds. Lokalny zestaw nazw znajduje się w `worker/.dev.vars.example`.
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

## Cloudflare Builds i GitHub

Po połączeniu prywatnego repozytorium `zawlodzki/nowa-strona-ola` utworzyć osobną
konfigurację builda dla każdej aplikacji i środowiska. Wszystkie używają Node z
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

Automatyczne wdrożenia z `main` kierować wyłącznie do produkcji po przejściu
workflow `Quality`. Staging wdrażać z osobnej, jawnie wybranej gałęzi. Preview SSR
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
7. Dopiero po odbiorze stagingu włączyć produkcyjny build z `main`.

Dry-run sprawdza pakowanie lokalne, lecz nie potwierdza konta, sekretów, domen,
Access, CORS ani działania Cloudflare Builds. Lokalne testy webhooka i kolejki nie
zastępują próby pełnego przepływu z rzeczywistymi usługami.

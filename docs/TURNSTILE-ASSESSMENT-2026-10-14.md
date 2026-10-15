# Zgodność formularzy z Cloudflare Turnstile

Data kontroli: 14.10.2026. Zakres zlecenia: ocena możliwości i zgodności.
Nie zmieniono aplikacji, konfiguracji Cloudflare ani workflow n8n.

## Wniosek

Turnstile pasuje do statycznego Astro i obecnej wysyłki JSON do n8n.
Rekomendacja to widget Managed w wspólnym `LeadForm` oraz obowiązkowa
walidacja Siteverify w istniejącym workflow n8n przed obsługą zgłoszenia.
Worker i Queues nie są potrzebne do tej integracji. Sama kontrola w przeglądarce
nie chroni publicznego webhooka przed bezpośrednim POST.

Plan Free obejmuje 20 widgetów, 10 hostnames na widget i nieograniczoną liczbę
weryfikacji. Nie wymaga płatnego planu strony ani proxy Cloudflare.
Źródło: [plany Turnstile](https://developers.cloudflare.com/turnstile/plans/).

## Stan odczytany

- Astro ma `output: "static"` w [konfiguracji](../astro.config.mjs).
- [LeadForm](../src/design-system/components/LeadForm.astro) obsługuje formularze
  newslettera, kontaktu, odstąpienia i listy oczekujących. Honeypot sprawdza
  wyłącznie przeglądarka. Token Turnstile nie jest wysyłany.
- [Kontrakt](../packages/shared/src/index.ts) ma wersję 2.
  [Wysyłka](../src/lib/lead-form.ts) uznaje odpowiedź HTTP 2xx za sukces.
  Odrzucenie przez n8n musi więc zwracać status błędu, a nie HTTP 200 z błędem w JSON.
- [Worker](../worker/src/index.ts) odpowiada 501 pod `/api/leads` i nie uczestniczy
  w obecnej wysyłce. Dodanie walidacji tylko tam nie zabezpieczy formularzy.
- Zalogowany panel Cloudflare na koncie właściciela pokazuje pustą listę
  widgetów Turnstile i przycisk dodania. Nie utworzono widgeta ani kluczy.
- Publiczny HEAD `https://aleksandraolesiewicz.com/` zwrócił HTTP 200,
  bez nagłówka Content-Security-Policy. Obecne nagłówki nie blokują widgeta.
- Odczyt REST n8n potwierdził aktywny workflow `formularz Ola`,
  ID `8vE6DwHNx5xqGrod`, z webhookiem odpowiadającym stałej endpointu w repo.
  Workflow ma jeden węzeł Webhook, bez połączeń, walidacji, Siteverify
  ani dalszej obsługi. Nie ustawiono jawnego trybu odpowiedzi po walidacji.
  Nie pobierano wykonań ani danych zgłoszeń.
- Workflow ma `saveDataSuccessExecution: "all"`, `saveExecutionProgress: true`
  i `saveManualExecutions: true`. Te ustawienia dopuszczają utrwalanie payloadów
  i wymagają korekty przed odbiorem zgodnie z zasadami projektu.
  Nie sprawdzono globalnej retencji, historii danych ani logów infrastruktury.

## Zakres rekomendowanego wdrożenia

1. Jeden oficjalny skrypt Cloudflare, osobny widget i token dla każdego
   formularza. Managed z `appearance: "interaction-only"`, język PL,
   motyw zgodny ze stroną. Wąskie formularze wymagają kontroli rozmiaru widgeta
   przy 320 px. Lista oczekujących wymaga inicjalizacji po otwarciu dialogu.
2. Techniczne pole `turnstileToken` poza `fields` i `consents`, wspólnie
   uzgodnione w kontrakcie frontendu i n8n. Brak tokena blokuje wysyłkę.
   Każde ponowienie otrzymuje nowy token, zachowując obecny `submissionId`.
3. n8n wymaga tokena i wywołuje Siteverify z sekretem przechowywanym wyłącznie
   po stronie serwera. Akceptacja wymaga `success === true`, właściwego hostname
   i action zgodnego z serwerową mapą formKey. Proponowane actions to
   `newsletter`, `contact`, `withdrawal` i `waitlist`.
4. Brak tokena, odrzucenie, timeout lub błędna odpowiedź Siteverify kończą
   obsługę kodem błędu. Sukces HTTP dopiero po poprawnej weryfikacji i przyjęciu
   zgłoszenia. Token nie trafia do analityki ani trwałych danych wykonania.
5. Wyłączenie zapisu payloadów wykonań w n8n, także błędnych i ręcznych,
   oraz kontrola globalnych ustawień i infrastruktury. Deduplikacja po
   `submissionId` i ograniczenie częstotliwości webhooka pozostają osobnymi
   zabezpieczeniami. Turnstile nie zatrzymuje samego napływu żądań do endpointu.

Tokeny są jednorazowe i ważne pięć minut. Po próbie AJAX trzeba odnowić widget
przed ponowieniem. Źródła: [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
i [konfiguracja widgeta](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/).

Propozycja konfiguracji to osobne widgety produkcji i testów. Produkcja sprawdza
wyłącznie `aleksandraolesiewicz.com`; testy mogą obejmować staging, `localhost`
i `127.0.0.1`. Lokalnych hostnames nie dopuszczamy w produkcyjnej walidacji.
Nie ma potrzeby dodawania `flows.zawlodzki.com` jako hostname widgeta,
ponieważ challenge działa na stronie Oli, a n8n tylko weryfikuje token.
To propozycja, nie wykonana konfiguracja ani zatwierdzona decyzja właściciela.

Przy późniejszym wprowadzeniu CSP wymagane jest dopuszczenie
`https://challenges.cloudflare.com` w `script-src` i `frame-src`.
Źródło: [CSP Turnstile](https://developers.cloudflare.com/turnstile/reference/content-security-policy/).
Integracja powinna zachować istniejący panel c15t i rozdzielenie ochrony formularza
od zgód analitycznych. Opis usługi w dokumentach prywatności wymaga osobnego
przeglądu przed publikacją. Nie zmieniono CMS ani dokumentów prawnych.

## Kontrole i ograniczenia

- `npm run build`: PASS, 43 strony, Node 26.11.0. To kontrola istniejącego
  serwisu, nie zgodności implementacji Turnstile. Node 24 nie sprawdzono.
- verify-ola `ola-turnstile-20261014`: launch i doctor PASS, port 4340.
  Newsletter z błędnym e-mailem wyświetla błąd. `browser posts` zwrócił `[]`.
  Kontakt z pustymi wymaganymi polami wyświetla błąd, POST również `[]`.
  Bez JS kontakt i newsletter mają wyłączone przyciski, POST `[]`.
  Własną sesję zamknięto przez cleanup, dowody pozostały.
  Dowody w `/tmp/ola-verify-evidence/ola-turnstile-20261014/`.
- Nagłówki produkcji i konfiguracja workflow sprawdzone wyłącznie do odczytu.
  Początkowe ograniczenia sandboxa dotyczące DNS i nasłuchu ustąpiły po
  dopuszczonym ponowieniu poza sandboxem.
- Nie wykonywano pełnego `npm run verify`, pomiaru wydajności ani nowego
  odbioru desktop/mobile, klawiatury, 320 px, zoomu i reduced motion.
  Kod aplikacji i UI nie zostały zmienione.
- Odbiór przyszłej integracji musi obejmować brak, błędny, wygasły i powtórzony
  token, inny hostname/action, awarię skryptu i Siteverify, retry,
  niezależność widgetów oraz otwieranie dialogu. Testy używają oficjalnych
  [kluczy testowych](https://developers.cloudflare.com/turnstile/troubleshooting/testing/)
  i odseparowanego backendu. Nigdy nie wysyłają na produkcyjny webhook.

Następny krok to wspólne wdrożenie frontendu i walidacji n8n na odseparowanym
środowisku, z kontrolą zapisu danych i statusem odpowiedzi. Utworzenie widgeta
bez walidacji nie oznacza zabezpieczenia formularzy.

# Wdrożenie GTM i c15t dla strony Oli

Data ustaleń i inwentaryzacji: 11.10.2026. Baza kodu: `main` `51e1e08`.
Dokument opisuje plan. W tej sesji nie zmieniono GTM, serwera c15t ani
wdrożeń Cloudflare. Wykonana poprawka zapamiętywania motywu jest osobnym
zakresem, opisanym w [postępie](PROGRESS.md).

## Zakres i stan potwierdzony

Użytkownik zlecił plan GTM i c15t. Zgody dla `aleksandraolesiewicz.com`
mają być odrębne, z obsługą w istniejącej instancji i tą samą administracją.
Panel ma korzystać z design systemu 3a. Produkcja jeszcze nie jest wdrożona.

| Obszar                 | Potwierdzony stan lub źródło                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staging                | [ola-website-staging.zawlodzki.workers.dev](https://ola-website-staging.zawlodzki.workers.dev/)                                                                                          |
| Produkcja              | `https://aleksandraolesiewicz.com`, niewdrożona według użytkownika. Konfiguracja domeny jest w `wrangler.jsonc`.                                                                         |
| GTM Oli                | `GTM-PWBRPZ29`, konto `6057592803`, kontener `197326666`, workspace `4`. Odczyt zalogowanej przeglądarki.                                                                                |
| Wzorzec GTM            | `GTM-P5V3CJ5`, zawlodzki.pl, kontener `93869277`, workspace `56`. Odczyt zalogowanej przeglądarki.                                                                                       |
| GA4 Oli                | `G-9QW05JYZTL` w istniejącym tagu. Własność strumienia i ustawienia usługi wymagają odbioru w GA4.                                                                                       |
| Clarity Oli            | `ohzq3djq4y` w istniejącym tagu. Retencja, maskowanie i dostęp do projektu nie zostały sprawdzone.                                                                                       |
| Meta Oli               | `2915257895296567` w starym tagu. Własność i ustawienia piksela nie zostały sprawdzone.                                                                                                  |
| c15t                   | Repo VPS opisuje `2.2.1`, `https://consent.zawlodzki.com/api/c15t`, PostgreSQL i retencję 36 miesięcy. Aktualnego procesu i schematu DB nie sprawdzono.                                  |
| Staging w przeglądarce | Otwarta karta zawierała wyłącznie skrypty strony i brak panelu zgód. Nadal pokazywała wskaźnik 450+, więc nie jest dowodem wdrożenia bieżącego `main`. Nie wykonano pełnego skanu sieci. |

Odczyt `/api/c15t/init` w przeglądarce zablokował klient
(`ERR_BLOCKED_BY_CLIENT`). Nie wyłączano rozszerzeń. Późniejszy publiczny
GET przez `curl` potwierdził HTTP 200 i `Cache-Control:no-store` dla trzech
Originów. Tylko `https://www.zawlodzki.pl` dostał
`Access-Control-Allow-Origin`; staging i produkcja Oli nie dostały tego
nagłówka. Wszystkie odpowiedzi zawierały politykę
`zawlodzki_global_opt_in_v2`. Nie zapisywano zgód i nie odczytywano subjectów.
Test blokowania CMP przez rozszerzenia wchodzi do odbioru.

W GTM oba obszary robocze miały zero oczekujących zmian. Kontener Oli zawiera
osiem tagów starej strony. `Consent mode dafault`, `Consent mode update`,
`Form fill client_id`, GA4, `GTAG GET API`, Meta Ads, Clarity i Conversion
Linker korzystają ze starych zdarzeń oraz reguł `All Pages`. GA4 ma
`send_page_view=true`, sekwencjonowanie `GTAG GET API` i brak dodatkowego
wymogu zgody. To wymaga przebudowy konfiguracji przed uruchomieniem kontenera.

## Źródła i granice ich zastosowania

- [Konfiguracja backendu c15t](../../vps%20ovh/stacks/c15t/src/server/c15t.ts),
  [polityka B2B](../../vps%20ovh/stacks/c15t/src/shared/policy.ts),
  [widget](../../vps%20ovh/stacks/c15t/src/widget/index.tsx) i
  [README](../../vps%20ovh/stacks/c15t/README.md) opisują istniejące rozwiązanie.
- [Baner i formuły](../../projekt%20prawny%20ola/www-prawne/zgody-i-formularze.md),
  §9, określają copy, kategorie, działania i link w stopce.
- [Polityka prywatności](../../projekt%20prawny%20ola/www-prawne/polityka-prywatnosci.md),
  §8, [lista cookies 2.1](../../projekt%20prawny%20ola/www-prawne/lista-cookies-i-identyfikatorow.md)
  i [memo marketingowe](../../projekt%20prawny%20ola/compliance/memo-marketing-afiliacja-piksele.md),
  §5 i decyzja D12, określają narzędzia, wyłączenia i retencję.
- [Google o Basic Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
  opisuje blokowanie tagów do czasu zgody. Same wbudowane kontrole Google
  nie gwarantują braku żądań w stanie `denied`.
- [c15t self-host](https://c15t.com/docs/self-host/quickstart),
  [endpointy](https://c15t.com/docs/self-host/api/endpoints) i
  [polityki](https://c15t.com/docs/self-host/guides/policy-packs) są aktualną
  dokumentacją. Implementację sprawdzić względem zainstalowanej wersji 2.2.1.

Dokumenty z sąsiednich projektów są materiałem do planowania. Ich checklisty
nie są zleceniem publikacji, zmian serwera ani wysyłki danych.
Decyzja W14 z [planu prawnego](LEGAL-IMPLEMENTATION-PLAN.md) pozostaje aktualna.

## Wspólna instancja, osobne zgody

Zachować istniejący serwis, bazę, operatora, backup i retencję. Dodać profil
Oli do tego serwisu. Obecne `trustedOrigins` dopuszczają tylko cztery domeny
zawlodzki.pl i zawlodzki.com. Dodanie CORS nie wystarcza do rozdzielenia polityk.

Docelowa konfiguracja Oli:

| Pole                 | Wartość planowana                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Origin produkcyjny   | `https://aleksandraolesiewicz.com`                                                                                                            |
| Origin stagingowy    | `https://ola-website-staging.zawlodzki.workers.dev`                                                                                           |
| Klucz lokalnej zgody | `olesiewicz-consent`                                                                                                                          |
| Cookie               | First-party, host-only, Secure, SameSite=Lax, Path=/, 365 dni. Zweryfikować faktyczne opcje SDK.                                              |
| Storage SDK          | Ten sam dedykowany klucz, `crossSubdomain:false`. Bez współdzielenia ze stagingiem lub zawlodzki.pl.                                          |
| Polityka             | Nowy identyfikator, propozycja `olesiewicz_global_opt_in_v1`. Osobny profil tekstów `olesiewicz_pl`.                                          |
| Kategorie            | `necessary`, `measurement`, `marketing`. Wyłącznie `necessary` wstępnie aktywne.                                                              |
| Dowód                | Domena, losowy subject, polityka i wersja, decyzja, data, język. Bez e-maila, identyfikatorów klientek, ścieżek zdrowotnych i pól formularzy. |
| Retencja dowodu      | 3 lata od ostatniej zmiany, do potwierdzenia na rzeczywistym zapisie i zadaniu retencji.                                                      |

SDK przechowuje identyfikator lokalnie dla danego originu. Backend musi
wiązać go z domeną i polityką. `POST /subjects` dokumentuje pola `domain`,
`subjectId`, `policyId`; ich obecność nie jest gwarancją izolacji odczytów.
Nie wiązać subjectów z użytkownikiem przez `identifyUser` ani przenosić
wyboru między stroną Oli i zawlodzki.pl.

Odczyt lokalnie zainstalowanego `@c15t/backend` 2.2.1 potwierdził, że
`postSubjectHandler` przyjmuje `domain` i `subjectId` z JSON, a
`getSubjectHandler` filtruje po samym subjectId. Są w `dist/49.js`,
linie 1338 i 769. Token snapshotu wiąże politykę i opcjonalny tenant,
ale nie zawiera domeny. Wrapper
[server.ts](../../vps%20ovh/stacks/c15t/src/server/server.ts) przekazuje
żądania prosto do handlera. Nie ma dodatkowej kontroli domeny. To wynik
przeglądu lokalnej paczki, nie test tych handlerów na działającym serwerze.
Osobny klucz przeglądarki, policyId i CORS nie wystarczą do separacji.

Przed implementacją profilu sprawdzić kontrakt 2.2.1 i wykonać próbę dwóch
domen. Backend ma sprawdzać zgodność domeny zapisu z dozwolonym Origin
i polityką. Próba odczytu lub użycia obcego subjectu i tokenu snapshotu ma
zostać odrzucona. CORS sam nie autoryzuje odczytu.

Obecny profil ma audience `zawlodzki-webflow` i domyślną politykę B2B.
Dokumentacja opisuje dopasowanie polityk geograficznie. Nie zakładać
nieudokumentowanego `match.domains`; `scopeMode:strict` dotyczy kategorii.
Jeżeli wersja nie zapewnia wyboru profilu według domeny, dodać routing
według jawnie dozwolonego Origin we wspólnym procesie. Oba profile mogą
korzystać z tej samej bazy. To punkt wymagający próby, przed zmianą produkcji.

Preferowana próba używa stałego `tenantId` dla profilu Oli, przypisanego
po stronie serwera do dozwolonego Origin, i adaptera z izolacją zapytań
według tenantów. Ta możliwość występuje w lokalnej paczce, ale wymaga
sprawdzenia migracji bazy i kompletnego zakresu CRUD. Jeżeli nie obejmuje
wszystkich endpointów, dodać kontrolę domeny i polityki przy zapisie i
odczycie. Obie ścieżki zachowują jeden proces, bazę i administrację.
Nie ufać domenie lub tenantId podanemu przez przeglądarkę.

Obecny [retention.ts](../../vps%20ovh/stacks/c15t/src/server/retention.ts)
usuwa poszczególne zgody po 36 miesiącach od `givenAt`. Dokument prawny
Oli mówi o 3 latach od ostatniej zmiany. Przed uruchomieniem ustalić
i przetestować zakres dowodów, które mają przetrwać ponowną zmianę zgody.
Samo zachowanie obecnego zadania retencji nie potwierdza zgodności.

Repo VPS nie potwierdza dashboardu c15t. Wspólna administracja na dziś oznacza
wspólne utrzymanie i kontrolowany dostęp do dowodów. Nie tworzyć drugiego
konta lub panelu bez potrzeby. Jeśli istnieje używany panel, w odbiorze
sprawdzić widok domeny Oli w tym samym panelu i filtrowanie dowodów.

Zachować ograniczenia Caddy, body do 64 KiB, `no-store` API oraz blokadę
publicznego root, OpenAPI i statusu. Sekrety i klucze administracyjne zostają
na serwerze. Frontend potrzebuje wyłącznie publicznego endpointu.

## Klient Astro i panel 3a

Użyć headless `c15t` z własnym HTML Astro i małym kontrolerem TypeScript.
Nie dodawać Reacta wyłącznie dla banera. Nie ładować `cmp-v1.js` zawlodzki.pl,
ponieważ zawsze uruchamia `GTM-P5V3CJ5`, ma inne copy i styl oraz Advanced Mode.

Plan miejsc w kodzie:

- `src/lib/consent.ts` posiada klienta, zwalidowane decyzje i zapis dowodu.
- `src/lib/analytics.ts` posiada bramkę skryptów, stan Consent Mode i zdarzenia.
- `src/lib/tracking-policy.ts` posiada jawny wykaz dozwolonych stron i narzędzi.
- `src/design-system/components/ConsentPanel.astro` renderuje banner i dialog.
- `Layout3a.astro` inicjalizuje domyślne `denied` przed tagami.
  `SiteShell3a.astro` udostępnia panel także na podstronach.
- `SiteFooter.astro` ma stale dostępny przycisk wyglądający jak link
  „Ustawienia cookies”. Podgląd szkiców i katalogi nie uruchamiają tagów.

Nazwy plików są propozycją. c15t pozostaje jedynym źródłem zgód.
`dataLayer` jest kopią sygnału dla GTM, nie drugim magazynem zgody.
Nie tworzyć równoległego booleana w localStorage dla analityki.

Pierwsza warstwa ma nagłówek „Pliki cookies na tej stronie” i copy z §9
`zgody-i-formularze.md`. Działania „Akceptuję wszystkie”, „Odrzucam opcjonalne”
i „Dostosuj” są od razu widoczne. Wszystkie mają równorzędny styl i wielkość.
Akceptacja nie dostaje większego przycisku ani bardziej kontrastowego koloru.

Panel szczegółowy ma kategorie „Niezbędne”, „Analityczne” i „Marketingowe”,
opisy z tego samego źródła, „Zapisuję wybór”, akceptację i odrzucenie.
Opcjonalne pola są początkowo wyłączone. Zamknięcie i Escape nie udzielają zgody.
Po zapisie status brzmi „Ustawienia cookies zostały zapisane.”.

Styl bierze Switzera i tokeny `--ao-background`, `--ao-ink`, `--ao-muted`,
`--ao-line`, `--ao-surface` oraz istniejące promienie, odstępy i cele dotykowe.
Baner proponowany przy dolnej krawędzi, z marginesem strony i szerokością
ograniczoną na desktopie. Przy 320 px ma jedną kolumnę i pełne szerokości
przycisków. Dialog używa natywnego `<dialog>`, wzorca Safari z
[próby UI](UI-SPIKE-RESULTS.md), przewijanej treści i zawsze dostępnych akcji.
Kolory reagują na zapisany motyw przez istniejące tokeny. Nie tworzyć osobnej palety.

Odbiór obejmuje Tab i Shift+Tab, Escape, powrót fokusu do wyzwalacza, nazwę
dialogu, czytelny focus, 200% zoom i reduced motion. Bez JS strona i prawo
pozostają czytelne, a opcjonalne tagi nie działają. Awaria CMP lub zapisu
dowodu nie może udzielać nowej zgody. Wycofanie blokuje pomiar natychmiast,
nawet jeśli zapis backendowy trzeba ponowić.

## GTM i granice pomiaru

Przed zmianami wyeksportować bieżącą opublikowaną wersję i workspace Oli.
Utworzyć osobny workspace migracji. Zachować kontener `GTM-PWBRPZ29`, ale
przebudować tagi i reguły. Stara strona została usunięta według użytkownika.

Wzorzec zawlodzki.pl ma dodatkowe wymogi zgód dla Meta i narzędzi B2B,
zdarzenie `consent-update` i cleanup identyfikatorów. To wzorzec mechanizmu,
nie plik do importu w całości. Źródłowe GA4, Ads i Conversion Linker nie
mają dodatkowych wymogów zgody. Inicjalizacja Google jest wczesna.

| Element                               | Docelowe działanie                                                                                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Consent default                       | Jeden właściciel w stronie, wszystkie opcjonalne Google storage `denied` przed uruchomieniem GTM. Usunąć duplikat starego CMP.                                           |
| Consent update                        | c15t aktualizuje Consent Mode i emituje nowe, jawnie uzgodnione zdarzenie `consent-update`. Stare „cookie activated” wycofać.                                            |
| GA4                                   | Wymóg `analytics_storage` i dozwolonej strony. Wyłączyć automatyczny page_view, enhanced measurement formularzy i automatyczne przesyłanie query, tytułu oraz referrera. |
| Clarity                               | Wymóg analityki i wspólnych wykluczeń, ścisłe maskowanie. Ustawienia projektu i rzeczywiste payloady wymagają osobnego odbioru.                                          |
| Meta                                  | Wymóg marketingu i wspólnych wykluczeń. Bez automatic events, advanced matching i danych produktów. Rzeczywiste payloady wymagają osobnego odbioru.                      |
| client_id formularzy, GTAG GET API    | Wyłączyć. Nie przepisywać identyfikatorów pomiaru do formularzy n8n.                                                                                                     |
| Google Ads, Conversion Linker         | Nie włączać na start. Nie są narzędziami opisanymi dla Oli w obecnej liście.                                                                                             |
| Leadfeeder, Albacross i atrybucja B2B | Nie przenosić. Dotyczą zawlodzki.pl.                                                                                                                                     |

GTM ładuje się tylko, gdy c15t potwierdza odpowiednią zgodę i bieżąca strona
dopuszcza narzędzie. Zgoda wyłącznie na marketing nie może uruchamiać GA4.
Zgoda wyłącznie na analitykę nie może uruchamiać Meta. `All Pages` nie jest
samodzielną regułą uruchamiającą pomiar. Oprócz bramki klienta każdy tag ma
własny warunek kategorii i strony oraz dodatkowy wymóg zgody w GTM.
Nie wstawiać bezwarunkowego iframe GTM `noscript`.

Po odtworzeniu ważnej decyzji kolejność jest taka sama jak po kliknięciu.
Najpierw default, następnie zwalidowana decyzja i update, na końcu loader
kontenera oraz zdarzenie dozwolonego pomiaru. Jedno page_view na dokument.
Nie odtwarzać zdarzeń z czasu przed zgodą. Cookie zgody wymaga kontroli
wygaśnięcia i wersji polityki, a nie tylko odczytu `true`.

Ustawienia GA4 wymagane przez materiał prawny to retencja 2 miesiące,
wyłączone Google Signals i personalizacja reklam, brak User-ID klientek.
Clarity ma retencję nagrań 30 dni, maskowanie całego tekstu i pól oraz brak
integracji identyfikatorów użytkownika z GA4. Same ustawienia tagu nie
potwierdzają tych ustawień usług.

### Wyłączenia stron, decyzje 11–12.10.2026

Decyzja właściciela zastępuje propozycję pustej allowlisty i neutralnych treści.
GA4, Meta i Clarity mają wspólną listę wykluczeń. Dokumenty prawne, kontakt,
konsultacje i odstąpienie zawsze pozostają bez pomiaru. Newsletter nie
wyklucza strony. Pozostałą stronę można wykluczyć polem „Bez pomiaru” w Sanity.
Kategorie bloga dziedziczą wykluczenie strony bloga i własnego dokumentu.
Podgląd, katalogi UI, strony demonstracyjne i nieznane widoki nie otrzymują polityki.

Serwer przekazuje sześć kodów rodzaju strony, bez sluga, tytułu ani identyfikatora
artykułu. GA4 otrzymuje syntetyczny adres `/m/<kod>`, pusty referrer i kod jako
tytuł. Kody grupują wszystkie artykuły i wszystkie e-booki. Nie rozróżniają
problemów zdrowotnych. Zewnętrzne formularze Google Forms, Cal.com i Stripe
nie otrzymują naszych tagów ani identyfikatorów zgody i pomiaru.

Dokumenty prawne w Content Lake nadal opisują poprzedni zakres oraz nieaktywny
pomiar. Przed aktywacją trzeba opublikować spójne copy. Zmiana niniejszego
planu lub lokalnych fixture nie potwierdza publikacji dokumentów prawnych.
Meta i Clarity wymagają osobnego odbioru rzeczywistych payloadów. Zastąpienie
adresu GA4 nie maskuje automatycznie adresów i treści w tych narzędziach.

### Zdarzenia i wycofanie

Początkowy kontrakt dopuszcza `page_view`, `cta_click`, `form_start` i
`generate_lead` tylko na stronach dopuszczonych przez politykę wykluczeń. W pierwszym PR GTM wdrażamy wyłącznie `page_view`; pozostałe zdarzenia pozostają planem. Parametry
to kontrolowane kody strony i akcji. `generate_lead` dopiero po faktycznym
2xx webhooka, nie po kliknięciu. Jeśli strona formularza jest wykluczona,
zdarzenia formularza pozostają wyłączone.

Nie przekazywać wartości pól, e-maila ani jego hasha, telefonu, imienia,
treści zgłoszenia, subjectu c15t, submissionId, tytułów e-booków, diagnoz,
pełnych URL, query i fragmentów. Wyłączyć automatyczne zbieranie kliknięć,
formularzy i wyszukiwań, które omijałoby ten kontrakt. Ewentualne UTM tylko
z kontrolowanych kodów, po zgodzie, bez nieograniczonych wartości.

Przy wycofaniu zamknąć bramkę zdarzeń od razu. Wyczyścić identyfikatory
wycofanej kategorii i wykonać dostępne revoke API. Zachować cookie decyzji
i `ao-theme`. Wdrożenie musi potwierdzić zatrzymanie już załadowanych SDK.
Samo usunięcie `<script>` albo update `denied` nie gwarantuje tego.
Klient po uruchomieniu SDK zapisuje trwały znacznik wycofania i przeładowuje
stronę. Kolejny dokument pobiera świeży snapshot i synchronizuje pełną odmowę
z backendem przed jakimkolwiek przywróceniem. Przerwane częściowe wycofanie
może wyłączyć również zachowaną kategorię do ponownego wyboru. Sprawdzić też pingi po update `denied`
i zmiany w innych otwartych kartach. Bez dowodu z sieci wycofanie jest otwarte.

## Kolejność wykonania i warunki odbioru

Prace podzielić na jednostki kończące się konkretną kontrolą. Najpierw
próba separacji domen, potem panel i bramka bez tagów, następnie GTM.
Nie uruchamiać trzech integracji naraz, zanim wiadomo, skąd pochodzi żądanie.

1. Zabezpieczyć eksport GTM i kopię konfiguracji oraz DB c15t. Sprawdzić
   rzeczywistą wersję, endpoint, retencję i możliwość osobnego profilu.
2. W środowisku testowym tego samego serwisu sprawdzić profile dwóch domen,
   polityki, tokeny, subjecty, CORS, zapis i odczyt. Nie używać danych klientek.
3. Dodać klienta i panel Astro zgodny z 3a oraz mock backendu w E2E.
   Wszystkie opcjonalne żądania pozostają zablokowane.
4. Przygotować nowy workspace GTM z ograniczonym zestawem tagów, bez publikacji.
   Ujednolicić copy prawne, wdrożyć wspólne wykluczenia i sprawdzić ustawienia usług.
5. Na zlecenie wdrożyć panel na staging. Tag Assistant używa workspace
   migracji. Testy stagingu nie wysyłają do produkcyjnej usługi GA4, Meta
   lub Clarity. Użyć izolowanej usługi testowej albo blokad sieciowych.
6. Na zlecenie opublikować sprawdzoną wersję GTM i kod oraz skonfigurować
   produkcyjną domenę. Zachować kolejność, w której klient nie może załadować
   starej wersji kontenera z regułami `All Pages`.
7. Wykonać produkcyjny skan bez zgody, po obu zgodach i po wycofaniu.
   Zaktualizować rzeczywistą listę cookies i eksport konfiguracji.

Rollback kodu ma wyłączyć loader, jeśli zgodność konfiguracji jest niepewna.
Nie przywracać automatycznie starej wersji GTM, która uruchamiała tagi bez
nowych bramek. Zmianę serwera wykonać z odtwarzalnej kopii, bez usuwania
istniejących dowodów zgód zawlodzki.pl.

### Macierz obowiązkowych kontroli

| Scenariusz                                               | Dowód wymagany do zaliczenia                                                                                            |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Świeża przeglądarka, odmowa, zamknięcie                  | Zero żądań GTM, GA4, Meta i Clarity oraz zero opcjonalnych identyfikatorów.                                             |
| Analityka bez marketingu                                 | Wyłącznie dozwolone narzędzia analityczne, brak Meta i marketing storage.                                               |
| Marketing bez analityki                                  | GA4 i Clarity nie działają. Meta tylko po osobnym odbiorze na niewykluczonej stronie.                                   |
| Obie zgody                                               | Tylko odebrane narzędzia na niewykluczonej stronie, pojedyncza inicjalizacja, poprawna kolejność default/update/loader. |
| Powrót i nowa polityka                                   | Ważna decyzja działa tylko na tym originie, wygasła lub niezgodna wersja ponownie pyta.                                 |
| Cofnięcie, druga karta i reload                          | Pomiar ustaje, cleanup nie kasuje odmowy ani motywu, druga karta respektuje zmianę.                                     |
| Backend offline, 409, 500, timeout, blokada rozszerzenia | Brak nowej zgody i tagów, podstawowa strona działa, zapis da się ponowić.                                               |
| Inna domena                                              | Decyzja zawlodzki.pl nie daje zgody Oli, staging nie daje zgody produkcji. Backend odrzuca obcy subject i snapshot.     |
| Strona wykluczona po wcześniejszej zgodzie               | Brak tagów także po wejściu linkiem, reloadzie i z historią.                                                            |
| PII i kontekst zdrowotny                                 | Skan request payload, URL, cookie i storage nie znajduje danych formularzy ani nazw zdrowotnych w telemetrii.           |
| UI                                                       | Desktop, 390 i 320 px, dark/light, klawiatura, natywny zoom 200%, reduced motion, axe i porównanie z 3a.                |
| Formularze                                               | Wyłącznie mock webhooka. Żaden test nie wysyła na produkcyjne n8n.                                                      |

### Checklista tego planu

- [x] Pobrać bieżący `main` i zachować lokalne zmiany.
- [x] Odczytać oba zalogowane kontenery GTM i wskazać stare mechanizmy.
- [x] Przeczytać konfigurację c15t i źródła prawne oraz zapisać rozbieżności.
- [x] Określić osobne zgody, wspólne utrzymanie, styl panelu i testy odbioru.
- [x] Potwierdzić aktualny serwer i izolację domen na wersji 2.2.1.
- [ ] Ujednolicić dokumenty prawne i wdrożyć wspólne wykluczenia pomiaru.
- [x] Wdrożyć i zweryfikować klienta c15t oraz panel 3a na stagingu.
- [ ] Przebudować workspace GTM i sprawdzić ustawienia GA4, Meta i Clarity.
- [x] Wdrożyć staging i przeprowadzić odbiór panelu oraz preferencji.
- [ ] Zakończyć odbiór i publikację usług pomiarowych oraz produkcji.
- [ ] Wykonać skan produkcji i uzupełnić listę cookies oraz preferencję motywu.

## Preferencja motywu

Wykonana poprawka używa `ao-theme` w localStorage wyłącznie po ręcznym
wyborze. Wartość to `light` lub `dark`. Brak poprawnej wartości oznacza
ustawienie systemowe. Odtworzenie następuje w head przed body.
Storage jest osobny dla stagingu i produkcji, nie trafia do c15t ani GTM.
Przy zablokowanym storage wybór działa w bieżącym dokumencie.

Lista cookies wymaga dodatkowego wpisu o localStorage `ao-theme`, celu
zapamiętywania wyglądu i okresie do zmiany lub wyczyszczenia pamięci.
To propozycja uzupełnienia dokumentu prawnego, nie zapis w Content Lake.
Preferencja dotyczy funkcji żądanej przez użytkownika. Takie dostosowanie
interfejsu [CNIL opisuje jako możliwe wyłączenie z obowiązku zgody](https://www.cnil.fr/fr/cookies-et-autres-traceurs/que-dit-la-loi).
Kwalifikację dla strony Oli uwzględnić w przeglądzie prawnym.

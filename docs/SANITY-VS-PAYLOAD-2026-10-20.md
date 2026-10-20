# Sanity i Payload dla nowej strony Astro na Cloudflare

Analiza z 20.10.2026. Dotyczy nowej strony podobnej do tego repozytorium.
Migrację obecnej witryny opisano osobno. Rekomendacje nie zmieniają architektury
projektu ani konfiguracji usług.

## Wniosek dla nowej strony

Dla strony eksperckiej z blogiem, landingami, katalogiem e-booków i kilkoma
redaktorami wybrałbym Sanity. Obecny model treści nie wskazuje potrzeby zmiany.
Payload potrafi odwzorować te dane, ale przejmujesz utrzymanie backendu CMS,
bazy, kont użytkowników i plików. Zyskiem jest kontrola i możliwość budowy
aplikacji biznesowej, a nie automatycznie prostsza strona Astro.

Payload wybrałbym, jeżeli wymaganiem jest własna baza i backend albo konkretny
plan obejmuje konta klientów, uprawnienia do materiałów, panel obsługi,
niestandardowe procesy lub wiele witryn zarządzanych przez jedną aplikację.
Nie wybierałbym go wyłącznie z powodu hostowania frontendu na Cloudflare.

To ocena architektoniczna na podstawie źródeł i dokumentacji. Nie wykonano
prototypu Payload, pomiaru wydajności, wdrożenia ani odbioru panelu przez redaktora.
Nie odczytywano w tej sesji produkcyjnego datasetu, abonamentu ani faktur Sanity.

## Co faktycznie jest w tym repo

Podstawą jest aktualny kod. Zapisy planu i postępu pomagają rozróżnić implementację,
wdrożenie i otwarte odbiory. Obecności funkcji w kodzie nie utożsamiam z jej
pełnym odbiorem na produkcji.

| Obszar                | Ustalenie z repo                                                                                                                                                   | Źródło lokalne                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Modele danych         | 12 typów dokumentów: strony, artykuły, strony prawne, autorzy, kategorie, konsultacje, e-booki, opinie, formularze, przekierowania, ustawienia witryny i checkoutu | `studio/schema-types/index.ts`                                                                                         |
| Kompozycja stron      | 23 typy sekcji, kontrolowane warianty, referencje do treści wspólnych                                                                                              | `studio/schema-types/blocks/page-sections.ts`                                                                          |
| Blog                  | Portable Text, obrazy, wyróżnienia, CTA i tabele; autorzy, źródła, kategorie, FAQ, powiązane wpisy i e-booki                                                       | `studio/schema-types/documents/article.ts`, `studio/schema-types/objects/article-body.ts`                              |
| Edycja                | Własne menu PL/EN, singletony, szablony językowe, podgląd SEO, ToC, Media, panel Do uzupełnienia                                                                   | `studio/sanity.config.ts`, `studio/structure.ts`, `studio/components/`                                                 |
| Podgląd               | Osobne Astro SSR, perspektywa drafts, token serwerowy, sesja podglądu, Access, stega i nakładki visual editing                                                     | `preview/src/`                                                                                                         |
| Produkcja             | Statyczny build Astro z opublikowanych danych; fixture przy braku konfiguracji                                                                                     | `src/sanity/repository.ts`                                                                                             |
| Publikacja            | Podpisany webhook, Worker, kolejka grupująca zmiany, GitHub Actions, build i wdrożenie                                                                             | `worker/src/publication.ts`, `.github/workflows/publish-content.yml`                                                   |
| Obrazy                | Alt i podpis przy użyciu obrazu, asset i hotspot z Sanity, lokalny rasterKey, optymalizacja Astro                                                                  | `studio/schema-types/objects/media-object.ts`, `src/sanity/queries.ts`, `src/design-system/components/SiteImage.astro` |
| Eksporty i SEO        | HTML i Markdown, mapa strony, RSS, llms.txt i JSON-LD tworzone przez aplikację                                                                                     | `src/content/serialize-*.ts`, `src/lib/seo/`                                                                           |
| Języki                | Osobne dokumenty i powiązanie translation; EN przygotowany, publicznie wyłączony                                                                                   | `studio/schema-types/shared/fields.ts`, `AGENTS.md`                                                                    |
| Sprzedaż              | Katalog i konfiguracja oferty w CMS; Worker odczytuje Sanity także podczas checkoutu; zamówienia są w osobnym D1                                                   | `worker/src/checkout.ts`, `studio/schema-types/documents/pcos-checkout-settings.ts`                                    |
| Kopie i automatyzacja | Importery, migracje, TypeGen, walidacja danych, zgodność fixture z Content Lake, eksport backupu z sumą kontrolną                                                  | `scripts/`, `src/lib/sanity-backup.ts`, `package.json`                                                                 |

Nie znalazłem podstaw, aby uznać za aktualnie używane: złożone workflow akceptacji,
SSO enterprise, wielomarkowy portal, konta klientów w CMS czy automatyczną dostawę
plików realizowaną przez Sanity. Pole daty publikacji samo nie planuje publikacji,
co opisuje [instrukcja bloga](BLOG-PUBLISHING.md).

ToC i Media są skonfigurowane. Historia w [postępie](PROGRESS.md) zawiera otwarte
odbiory zalogowanego panelu. Nie przedstawiam ich jako ponownie sprawdzonych.

## Jak odwzorować konfigurację w Payload

| Potrzeba                                                   | Odpowiednik w Payload                                          | Nakład i różnica                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Strony, blog, e-booki, autorzy, kategorie, opinie, usługi  | Collections i relationship                                     | Typowe modelowanie, bez bariery funkcjonalnej                               |
| Ustawienia i konfiguracja checkoutu                        | Globals albo kontrolowana kolekcja ustawień językowych         | Globals nie są automatycznie zamiennikiem osobnych singletonów PL/EN        |
| Kontrolowane sekcje                                        | Blocks, group, array, select                                   | Zachować warianty 3a i walidację układu; schema sekcji nie tworzy renderera |
| Landing e-booka, dostępność, cross-sell, referencje i copy | Pola kolekcji, relacje, walidacje i hooks                      | Warunki pary produktów oraz zgodność cen trzeba przepisać                   |
| Tekst artykułu                                             | Rich text oparty na Lexical z własnymi blokami                 | Inny format danych; renderer i serializer wymagają adaptacji                |
| Szkice i historia                                          | Versions, drafts, autosave, restore                            | Funkcje wbudowane po konfiguracji; trzeba ograniczyć publiczny odczyt       |
| PL/EN                                                      | Lokalizacja pól albo osobne dokumenty z językiem i relacją     | Drugi wariant lepiej zachowuje obecny model niezależnych publikacji         |
| Menu, zakładki, polskie etykiety i warunkowe pola          | Konfiguracja Admin i własne komponenty React                   | Wykonalne; aktualne pluginy Sanity nie przenoszą się                        |
| Podgląd SEO                                                | Plugin SEO albo własny komponent                               | Obecne reguły noindex i wykluczenia z pomiaru nadal należą do aplikacji     |
| Panel znaczników TODO, ostrzeżenia i ToC                   | Własne komponenty Admin i skaner treści                        | Skaner tekstów można częściowo wykorzystać; ścieżki i fokus edytora inne    |
| Media, alty i kadrowanie                                   | Kolekcja upload + relacja + pola konkretnego użycia            | Osobno rozwiązać kadrowanie na Workers i funkcje obecnego pluginu Media     |
| Podgląd szkicu                                             | Preview i Live Preview z osobnym Astro SSR                     | Własne uwierzytelnienie, odczyt drafts i odświeżanie Astro                  |
| Kliknięcie treści na podglądzie prowadzi do pola           | Własne mapowanie albo oferta Visual Editor                     | Brak podstaw do założenia równoważności z obecną integracją Sanity          |
| Publikacja statycznej strony                               | afterChange i afterDelete + trwałe zdarzenie do procesu buildu | Filtrować szkice, obsłużyć unpublish, usuwanie, retry i grupowanie zmian    |
| HTML, Markdown, RSS, llms.txt, JSON-LD                     | Istniejący kod Astro po adaptacji danych                       | Zmiana CMS nie daje tych funkcji automatycznie                              |
| Przekierowania                                             | Własna kolekcja lub plugin + generowanie konfiguracji Astro    | Zachować walidację adresów i wykrywanie kolizji                             |

Podstawowe mechanizmy opisują dokumentacje [Blocks](https://payloadcms.com/docs/fields/blocks),
[Versions](https://payloadcms.com/docs/versions/overview),
[Lexical](https://payloadcms.com/docs/rich-text/overview),
[lokalizacji](https://payloadcms.com/docs/configuration/localization) i
[hooks](https://payloadcms.com/docs/hooks/overview).

Ważna różnica walidacji: reguły Sanity Studio nie są ogólnym zabezpieczeniem
przed niepoprawnym zapisem przez każde API. W repo są dodatkowe kontrole danych
oraz buildu. Payload umożliwia walidację pól również po stronie backendu.
Zachowałbym kontrolę kontraktu na wejściu do Astro i Workera. Reguła blokująca
błędny dokument i ostrzeżenie TODO dopuszczające publikację wymagają odrębnej obsługi.

## Cloudflare jest obsługiwany, ale backend jest większy

Oficjalny szablon łączy Payload z Next.js, adapterem OpenNext, bazą D1 i plikami R2.
Szablon wymaga Workers Paid z powodu rozmiaru. To istniejąca ścieżka wdrożenia,
nie eksperymentalna propozycja z tej analizy.
Źródła: [README szablonu](https://raw.githubusercontent.com/payloadcms/payload/main/templates/with-cloudflare-d1/README.md),
[konfiguracja](https://raw.githubusercontent.com/payloadcms/payload/main/templates/with-cloudflare-d1/src/payload.config.ts),
[skrypty wdrożenia](https://raw.githubusercontent.com/payloadcms/payload/main/templates/with-cloudflare-d1/package.json).

Dla nowej witryny proponowałbym następujący podział:

- Publiczne Astro jako statyczne zasoby na Cloudflare.
- Osobny CMS Payload z Admin i API na Workers, własne D1 i R2.
- Build Astro pobierający wyłącznie opublikowane treści przez API CMS.
- Osobny chroniony podgląd Astro SSR korzystający z tych samych komponentów.
- Zdarzenie publikacji uruchamiające istniejący typ procesu build i deploy.
- Integracje płatności, danych klientów i dostawy z odrębnymi uprawnieniami.

Przy takim podziale nie korzystasz z największego skrótu Payload: frontendu
Next.js, CMS i Local API w jednym procesie. Astro zwykle komunikuje się przez
HTTP z oddzielnym CMS. Import Local API do buildu Astro jest inną możliwością,
ale na D1 wymaga rozwiązania dostępu do bindingów. Nie zakładam, że import
konfiguracji CMS do zwykłego procesu buildu Astro zadziała bez dodatkowej integracji.

Sanity w tym repo ma statyczny panel Studio i zewnętrzny zarządzany backend.
Payload daje kontrolę nad backendem, ale dodaje uruchamianą aplikację serwerową,
migracje SQL i zgodność Payload, Next.js, OpenNext oraz runtime Workers.
Nowy projekt nie dziedziczy automatycznie prostoty utrzymania Studio.

## Dwie najważniejsze różnice dla redaktora

### Kadrowanie i media

Oficjalna kolekcja Media w szablonie Cloudflare ustawia `crop: false` i
`focalPoint: false`, z komentarzem o braku sharp na Workers.
To ograniczenie tej ścieżki wdrożenia, nie wszystkich instalacji Payload.
Źródło: [kod Media](https://raw.githubusercontent.com/payloadcms/payload/main/templates/with-cloudflare-d1/src/collections/Media.ts).

W obecnym repo punkt kadru jest odczytywany z CMS, a SiteImage przetwarza także
zdalne obrazy podczas buildu Astro. Zatem nie tracisz możliwości optymalizacji
statycznej strony po zmianie CMS. Tracisz gotowy odpowiednik procesu kadrowania
w panelu. Rozwiązaniem może być własne pole punktu kadru i przeliczenie go
przez renderer, transformacje Cloudflare Images albo przetwarzanie poza Workers.
Każdy wariant wymaga sprawdzenia podglądu i wyniku publicznego.

Alt zachowałbym przy konkretnym użyciu obrazu, z ewentualną podpowiedzią
z biblioteki. Obecny alt w dokumencie nie jest tym samym co opis assetu.
R2 przechowuje pliki, nie zastępuje automatycznie usługi transformacji obrazów.
[Adaptery uploadu](https://payloadcms.com/docs/upload/storage-adapters)
rozwiązują miejsce przechowywania.

### Podgląd i praca kilku osób

Sanity ma tu Presentation, rozpoznawanie dokumentów po adresie, stega,
nakładki oraz chroniony preview. W Payload darmowy Live Preview pokazuje
frontend w iframe i komunikuje się przez postMessage. Astro wymaga obsługi
wiadomości i aktualizacji widoku; prosty wariant może przeładowywać podgląd
po zapisaniu szkicu. Płynne zmiany podczas pisania wymagają dalszej integracji.
Źródło: [Live Preview](https://payloadcms.com/docs/live-preview/overview).

Nie utożsamiam tego z klikaniem elementów strony i otwieraniem właściwych pól.
Oferta [Visual Editor](https://payloadcms.com/enterprise/visual-editor)
jest przedstawiona osobno jako enterprise, a odczytana strona ma oznaczenie
Coming Soon. Jej dostępności i zgodności z Astro nie można traktować jako
potwierdzonego zamiennika obecnej funkcji.

Sanity zapewnia współbieżną edycję dokumentu. Standardowy Payload stosuje
blokadę dokumentu, aby zapobiegać nadpisaniu pracy innego użytkownika.
Dla jednej osoby różnica jest mała. Dla redakcji równocześnie poprawiającej
jeden tekst jest istotna. Źródła: [Sanity Studio](https://www.sanity.io/docs/studio),
[blokady Payload](https://payloadcms.com/docs/admin/locked-documents).

## Co zyskujesz z Payload

1. Kontrolę nad bazą, plikami, polityką retencji i wdrożeniami. Rdzeń jest
   na licencji [MIT](https://raw.githubusercontent.com/payloadcms/payload/main/LICENSE.md).
   Funkcje komercyjne trzeba oceniać osobno. Nadal pozostają zależności od
   formatu Payload i wybranego hostingu.
2. Backend konfigurowany w TypeScript: logika przy zapisie, własne endpointy,
   uwierzytelnianie i szczegółowe prawa do kolekcji, dokumentów oraz pól.
   To przydatne, gdy powstanie portal lub narzędzie wewnętrzne.
   [Access control](https://payloadcms.com/docs/access-control/overview).
3. Wersje, szkice i historia utrzymywane we własnej bazie, z własnymi limitami
   retencji. Historia wersji treści nie jest sama w sobie kompletnym dziennikiem
   bezpieczeństwa ani kopią zapasową.
4. Brak opłaty licencyjnej rdzenia naliczanej za każdego redaktora. Koszt
   infrastruktury i obsługi rośnie jednak wraz z użyciem.
5. Możliwość wspólnego panelu dla kilku witryn przez
   [multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant).
   Izolacja danych i uprawnień wymaga konfiguracji oraz testów.

Sanity również ma schematy TypeScript, API, edytowalny panel i automatyzację.
Nie przypisuję tych cech wyłącznie Payload. Przewagą Payload jest kontrola
nad uruchamianą aplikacją backendową i jej bazą.

## Co tracisz lub przejmujesz do utrzymania

- Zarządzany Content Lake, jego API i utrzymanie usługi. W Payload odpowiadasz
  za poprawki aplikacji, backup bazy i plików, odzyskiwanie oraz monitoring.
- Gotową współpracę czasu rzeczywistego oraz obecną integrację wizualnej edycji.
- Obecne zapytania GROQ i generowane typy ich wyników. Payload generuje własne
  typy, ale pobieranie relacji, projekcje i paginację trzeba zaprojektować ponownie.
- Gotowy ekosystem użytych pluginów Studio. Własne panele wymagają odtworzenia.
- Brak migracji SQL przy każdej zmianie struktury danych. W Payload z D1
  zmiany schematu i deployment aplikacji trzeba koordynować z migracjami.
  Sanity również wymaga migracji treści przy zmianach znaczenia lub kształtu pól.
- Część gotowej obsługi assetów i kadru. Koszt nie kończy się na założeniu R2.

Wersje i autosave zapisują dodatkowe kopie dokumentów. Złożone bloki i relacje
wpływają na liczbę tabel oraz operacji D1. Dla zakładanych około 500 stron nie
mam podstaw do wskazania bariery skali, ale nie wykonano pomiaru na tym modelu.
D1 oceniłbym najpierw jako bazę treści. Przy rozbudowanych operacjach biznesowych
porównałbym też PostgreSQL. Nie zakładałbym atomowości dowolnej sekwencji hooków,
bazy i zewnętrznego API; wymaga to osobnego projektu oraz prób awarii.

## Koszty należy liczyć z utrzymaniem

Według aktualnego [cennika Sanity](https://www.sanity.io/pricing) Free obejmuje
20 miejsc użytkowników, dwie role uprawnień i publiczne datasety. Growth kosztuje
15 USD za płatne miejsce miesięcznie i rozszerza m.in. role oraz dostępność
prywatnych datasetów. Konkretne limity i dodatki trzeba sprawdzić przy zakupie.
Nie ustalono planu ani faktycznego zużycia tego projektu.

[Workers Paid](https://developers.cloudflare.com/workers/platform/pricing/)
ma bazową opłatę 5 USD miesięcznie na konto, a dalszy koszt zależy od użycia.
Payload dodaje obciążenie CPU, D1, R2, ewentualne transformacje obrazów,
transport wiadomości, kopie i monitoring. Jeśli konto już ma Paid, nie należy
liczyć kolejnych 5 USD jako obowiązkowej osobnej opłaty za każdy CMS.

Przykłady mają charakter scenariuszy, a nie wyceny tej witryny:

| Sytuacja                       | Ocena                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| Sanity Free wystarcza          | Payload nie daje oszczędności abonamentu CMS; dodaje utrzymanie backendu                     |
| Trzy płatne miejsca Growth     | 45 USD miesięcznie za miejsca przed dodatkami; porównać z całym kosztem Payload, w tym pracą |
| Kilka stron i wielu redaktorów | Wspólny Payload może być ekonomiczniejszy; wymaga izolacji i wspólnego utrzymania            |
| Funkcje enterprise             | Nie wyceniać na podstawie darmowego rdzenia któregokolwiek produktu                          |

Statyczna strona nie wykonuje odczytu CMS dla każdego wejścia użytkownika.
Dlatego liczba odwiedzin nie przekłada się bezpośrednio na tyle samo zapytań
API Sanity czy Payload. Checkout i podgląd są osobnymi ścieżkami runtime.
Nie ma podstaw do deklarowania poprawy Core Web Vitals samą zmianą CMS.

## Potrzeby przyszłe, które zmieniają decyzję

| Możliwy kierunek                                                | Ocena dla tego projektu                                                                               |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Więcej bloga, landingów, e-booków i języków                     | Oba wystarczą. Sanity zachowuje przewagę obecnego zaplecza redakcyjnego                               |
| SEO, odpowiedzi AI, Markdown, dane strukturalne                 | Głównie jakość treści i kod Astro; brak zasadniczej przewagi Payload                                  |
| Konta klientów, dostęp do zakupionych materiałów, panel obsługi | Mocniejszy argument za Payload jako backendem aplikacji                                               |
| Kilka marek w jednym panelu                                     | Payload multi-tenant jest wart próby; osobne CMS-y nadal mogą być prostsze                            |
| Własne reguły publikacji i szczegółowe uprawnienia              | Payload daje bezpośrednią kontrolę w kodzie; koszt wdrożenia i testów po Twojej stronie               |
| Wspólne poprawianie tekstu, komentarze, redakcja                | Sanity ma istotne gotowe możliwości; sprawdzić plan i rzeczywiste potrzeby                            |
| Harmonogram publikacji i zadania w tle                          | Oba wymagają właściwej konfiguracji; w Payload na serverless potrzebny zewnętrzny wyzwalacz           |
| Wyszukiwanie pełnotekstowe lub semantyczne                      | Osobne wymaganie do przetestowania; posiadanie D1 lub CMS nie daje automatycznie jakości wyszukiwania |

Payload ma [mechanizm zadań](https://payloadcms.com/docs/jobs-queue/overview),
ale [harmonogram na serverless wymaga zewnętrznego uruchamiania](https://payloadcms.com/docs/jobs-queue/schedules).
Nie zastępuje to automatycznie Cloudflare Queues lub Workflows ani obecnego n8n.
Istnieje także [plugin ecommerce](https://payloadcms.com/docs/ecommerce/plugin),
którego nie oceniano w próbie i który nie dowodzi gotowości do obecnych zasad
zakupu, dostawy PDF i oferty po płatności.

Nie przenosiłbym formularzy i zamówień do CMS tylko po to, żeby zgromadzić je
w jednym panelu. Obecny podział oddziela treści od danych zgłoszeń i płatności.
Przy zmianie wymagań warto rozważyć panel operacyjny, z wyraźnym zakresem danych,
retencji i dostępu. c15t, n8n, Listmonk i Stripe nie stają się zbędne po zmianie CMS.

## Nowy projekt a migracja tej strony

Nowy projekt nie ponosi kosztu przeniesienia archiwalnych danych. Nadal wymaga
modeli, integracji Astro, rendererów, mediów, zabezpieczeń i procesu publikacji.
Warto wykorzystać doświadczenia i komponenty, zamiast kopiować wszystkie
historyczne warianty oraz pola z obecnego repo.

Migracja tej strony jest większa, ponieważ typy widoków są bezpośrednio
wyprowadzane z wyników GROQ w `src/sanity/repository.ts`. Adapter pobierający
JSON z Payload nie wystarczy bez uzgodnienia kontraktu z mapowaniami treści.

Zakres migracji obejmowałby:

1. Przeniesienie schematów i reguł semantycznych, nie tylko nazw pól.
2. Mapowanie identyfikatorów, relacji, tłumaczeń, szkiców i opublikowanych wersji.
3. Konwersję Portable Text do Lexical lub świadome pozostawienie starego
   formatu z własnym edytorem. Ta druga opcja ogranicza zysk z domyślnego Payload.
4. Kopiowanie assetów, zachowanie altów, podpisów, kadru i kontrolę osieroconych plików.
5. Wymianę GROQ, TypeGen, importerów i walidacji Content Lake.
6. Odtworzenie chronionego preview, paneli i ostrzeżeń redakcyjnych.
7. Wymianę webhooka i źródła danych runtime checkoutu, z zachowaniem blokad sprzedaży.
8. Porównanie HTML, Markdown, adresów, SEO i obrazów, próbę odtworzenia kopii
   oraz plan powrotu do poprzedniego źródła.

Backup bazy D1 nie obejmuje sam z siebie wszystkich plików R2 i konfiguracji
aplikacji. Migracja powinna obejmować osobne środowisko, bez zapisów do obecnej
produkcji. Brak podstaw do rzetelnej estymacji w dniach bez próby najtrudniejszych
integracji. Nie ma potrzeby migrowania tej witryny, aby sprawdzić Payload dla nowej.

## Próba, która pozwoli podjąć decyzję

Przed wyborem Payload zrobiłbym mały projekt poza tą witryną, z danymi testowymi:

- Jeden artykuł z tabelą, zdjęciem, CTA, znacznikiem TODO i źródłami.
- Jeden landing z kontrolowanymi blokami i relacjami do produktów.
- PL i EN publikowane niezależnie, bez polskiego fallbacku pod EN.
- Zdjęcie z kadrem i altem właściwym dla konkretnego użycia.
- Chroniony podgląd Astro z tymi samymi komponentami co produkcja.
- Publikacja, unpublish i usunięcie uruchamiające statyczny build; szkic bez buildu.
- Dwie role, odmowa odczytu szkicu przez anonimowe API oraz kontrola zmian przez API.
- Upload na rzeczywistym Workers, migracja D1, backup i odtworzenie D1 oraz R2.

Za warunek wyboru przyjąłbym akceptowalny dla redaktora podgląd i media,
sprawne odtworzenie danych oraz konkretną korzyść z własnego backendu.
Działający przycisk Deploy nie jest jeszcze odbiorem rozwiązania.

## Zakres kontroli tej analizy

Przeczytano konfigurację Studio, schematy i wybrane reguły, repozytorium danych,
podgląd, publikację, powiązanie checkoutu, media i dokumentację projektu.
Zweryfikowano dokumentację producentów i kod oficjalnego szablonu Payload,
w tym ograniczenie kadrowania. Źródła internetowe odnoszą się do stanu odczytanego
20.10.2026; odnośniki do gałęzi main mogą się później zmienić.

Zmiany dotyczą wyłącznie dokumentacji. Nie uruchamiano `npm run verify`,
UI, migracji, nowych usług ani testów Payload. Nie zmieniono Sanity, ofert,
formularzy ani publicznej strony. Kontrola formatu i odnośników lokalnych jest
odnotowana w postępie po jej wykonaniu.

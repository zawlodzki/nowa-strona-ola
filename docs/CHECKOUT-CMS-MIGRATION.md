# Konfiguracja zamówień serii PCOS

Stan z 18.10.2026. Wykonano selektywne zapisy do Content Lake i rejestrację
schematu. Wdrożenie nowego menu hostowanego Studio pozostaje do odbioru.
Dostawa e-booków jest odłożona decyzją użytkownika.

## Model konfiguracji

Rozważono wspólny dokument ustawień oraz powielenie ustawień w trzech e-bookach.
Wybrano singleton `pcosCheckoutSettings-pl`. Warunek zakupu obu brakujących
produktów i treść oświadczenia są wspólne dla całej serii. Pole `productCode`
łączy każdy e-book z kontrolowanym rejestrem płatności. Nie powiela się tablicy
członków serii w ustawieniach.

[Rejestr produktów](../src/lib/checkout-products.ts) ustala następujące powiązania.

| Kod        | Dokument PL                        | Adres landingu                     |
| ---------- | ---------------------------------- | ---------------------------------- |
| `ebook-01` | `ebook-suplementy-w-pcos-pl`       | `/ebooki/suplementy-w-pcos/`       |
| `ebook-02` | `ebook-badania-ktore-maja-sens-pl` | `/ebooki/badania-ktore-maja-sens/` |
| `ebook-03` | `ebook-szczupla-a-jednak-pcos-pl`  | `/ebooki/szczupla-a-jednak-pcos/`  |

Dla aktywnej sprzedaży tych produktów mapper wyznacza własny adres
`/zamowienie/?produkt=<kod>`. Przy `planned` i `paused` nie udostępnia przycisku
zakupu. Nie zmieniono dostępności produktów na podstawie samej konfiguracji
płatności. Nieznany kod lub kod innego produktu zatrzymuje build.

[Ustawienia](../studio/schema-types/documents/pcos-checkout-settings.ts) mają
kontrolowane kwoty `singlePriceGross = 97` i `pairPriceGross = 97`. Druga kwota
obejmuje oba brakujące e-booki razem. Serwer płatności pozostaje źródłem kwoty
transakcji. Schemat i mapper odrzucają inną kwotę. Nie utworzono edytowalnej ceny
pojedynczego produktu w tej ofercie ani fikcyjnej historii cen.

`legalConsentVersion = pcos-d27-2026-10-18` identyfikuje oświadczenie w procesie.
Wersja dokumentu źródłowego „Zgody i formularze” wynosi 2.5. To dwa różne
identyfikatory. Przycisk kończący zamówienie brzmi „Zamawiam z obowiązkiem
zapłaty”. `salesState` pozostaje `paused` do czasu odbioru integracji i dostawy.

`getPcosCheckoutSettings()` pobiera singleton przez opublikowane zapytanie GROQ.
Bez konfiguracji Sanity korzysta z fixture. Brak dokumentu przy aktywnej
konfiguracji Sanity przerywa build, aby nie publikować domyślnej oferty zamiast
rzeczywistych ustawień.

## Wykonany zapis do CMS

W projekcie `dyuqkn8c`, dataset `production`, odczytano dokumenty i rewizje,
zarejestrowano schemat oraz opublikowano selektywną zmianę.

| Dokument                           | Opublikowany zakres                                                                       | Zachowane ustawienia                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Trzy e-booki PL z rejestru powyżej | `productCode`, `priceGross = 97`                                                          | Dostępność `planned`, okładki, landingi, listy oczekujących. |
| `pcosCheckoutSettings-pl`          | Singleton z cenami 97 zł, copy oferty i wersją oświadczenia                               | `salesState = paused`.                                       |
| `legal-terms-pl`                   | `version = 2.4`, `effectiveFrom = 2026-10-10`, `body` ze źródła D27                       | Pozostałe dokumenty bez pełnego importu.                     |
| `legal-cookies-pl`                 | `version = 2.5`, `effectiveFrom = 2026-10-18`, `body` z opisem identyfikatorów zamówienia | Konfiguracja c15t i pomiaru bez zmiany.                      |

Odczyt po publikacji potwierdził wersje i ustawienia. Ostatnie rewizje to
`UdQdXKR5Wip8kOGZBYI1yB` dla regulaminu oraz `W6ZgZ6YLs15DClTrjQnWag`
dla listy cookies i singletonu. Payloady i kopie odczytów są w lokalnym
`.audit/checkout-20261018/`, poza zakresem wersjonowania.

Nie uruchamiano ogólnego importera prawnego ani zapisu całego symulowanego
datasetu. Dokumenty EN nie były publikowane. Rejestracja schematu nie jest
wdrożeniem interfejsu Studio i nie uruchamia płatności.

## Synchronizacja dokumentów prawnych

Źródłem jest katalog `../projekt prawny ola/www-prawne`. Przeprowadzono lokalną
konwersję do Portable Text i regenerację przykładów przez istniejące narzędzia.
Konwerter potwierdził następujące wersje.

| Dokument              | Wersja | Obowiązuje od |
| --------------------- | ------ | ------------- |
| Regulamin             | 2.4    | 10.10.2026    |
| Polityka prywatności  | 2.4    | 13.10.2026    |
| Lista cookies         | 2.5    | 18.10.2026    |
| Regulamin newslettera | 2.1    | 10.10.2026    |

Zmiana treści obejmuje regulamin D27 oraz opis niezbędnych identyfikatorów
zamówienia w liście cookies. Cookie `__Host-ola_checkout` ma czas 30 dni.
`ola.checkout.session` pozostaje w sessionStorage danej karty do końca sesji. Przykład EN przejmuje nowy numer polskiego
źródła. Nie stanowi tłumaczenia dokumentu ani nie włącza publicznych adresów EN.
D27 usuwa wariant dostawy po 14 dniach i opisuje jedno wymagane oświadczenie.
Treści te opisują docelowy proces, nie potwierdzają działającej dostawy.

## Weryfikacja lokalna

Wykonano TypeGen przez `sanity schema extract --enforce-required-fields --force`
i `sanity typegen generate`. Zwykły skrypt `npm run typegen --workspace
@ola/studio` zatrzymuje się przy istniejącym `schema.json`, ponieważ nie zawiera
`--force`. Nie zmieniano skryptu Studio.

Kontrola typów Studio przeszła. Przeszło 45 testów z czterech plików dotyczących
CMS, ebooków, regulaminu i konwersji prawnej. Testy sprawdzają adres zamówienia
dla każdego z trzech produktów, brak zakupu dla `planned`, odrzucenie złej ceny
pary oraz odrzucenie kodu innego e-booka.

Pełne `npm run verify` zakończyło się kodem 0. Przeszło 690 testów
jednostkowych, 549 E2E, z 12 celowymi pominięciami, oraz kontrola SEO 39 stron.

### Uzupełnienie kontroli symulacji Content Lake

Generator `buildContentLakePlan` dodaje singleton również do lokalnego datasetu
symulacyjnego. Test uruchamia właściwe zapytanie GROQ na `buildDataset` i sprawdza
stan `paused`, obie kwoty 97 zł, warunek zakupu pary oraz przycisk prawny.
Brak konfiguracji nie jest ukrywany przez fallback.

Po tym uzupełnieniu przeszło 17 testów w plikach `content-lake-plan.test.ts` i
`pcos-checkout-cms.test.ts`. Lokalny dry-run importera wygenerował 89 dokumentów.
Walidacja wszystkich 89 dokumentów przez schemat Sanity zwróciła zero błędów.
Nie uruchamiano zapisu importera do Content Lake. Selektywne publikacje
opisano powyżej.

Porównanie fixture z symulowanym Content Lake obejmuje też `/zamowienie/`,
`/po-zakupie/` i `/zamowienie/potwierdzenie/`. Są to transakcyjne strony noindex,
bez publicznych odpowiedników Markdown. Końcowe porównanie wszystkich 20 stron fixture i symulowanego Content Lake
przeszło. Treść, sekcje, obrazy i DOM są zgodne.

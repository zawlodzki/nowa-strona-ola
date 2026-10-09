# Blog — edycja i publikacja

Decyzja użytkownika: 08.10.2026. Blog ma dokument `page` z adresem `blog`
w każdym języku, tak jak kolekcja e-booków. Implementacja jest w kodzie;
wdrożenie Studio/publicznej strony/preview i zapis migracji pozostają do wykonania.

## Nowy artykuł

1. Otwórz **Artykuły → Polski** albo **English** i utwórz dokument.
   Lista używa szablonu odpowiedniego języka.
2. Wpisz tytuł. Ustaw **Adres artykułu (slug)**, np.
   `jak-przygotowac-sie-do-konsultacji`. Przycisk **Generate** tworzy slug
   z tytułu; możesz go poprawić ręcznie. Nie wpisuj domeny ani `/blog/`.
   Slug używa małych liter, cyfr i myślników i musi być unikalny w języku.
3. Uzupełnij lead, treść, obraz z tekstem alternatywnym oraz w zakładce
   **Metadane** datę publikacji, autora i kategorię w tym samym języku.
   Autor i kategoria muszą istnieć jako opublikowane dokumenty.
4. Sprawdź podgląd i SEO. Kliknij **Publish** po usunięciu błędów walidacji.
5. Sanity zapisuje opublikowany dokument. Podpisany webhook przekazuje
   zdarzenie Workerowi, kolejka grupuje zmiany, a GitHub Actions uruchamia
   **Publish content**, buduje statyczną stronę i wdraża Cloudflare.
   Widoczność na publicznej stronie następuje po udanym wdrożeniu.

W Studio wdrożonym przed tą poprawką slug jest w **Metadane → Adres**.
Zmiana etykiety i przeniesienie pola do **Treść** pojawi się po wdrożeniu Studio.

Artykuł PL otrzymuje adres `/blog/<slug>/`, a EN `/en/blog/<slug>/`.
Ten sam dokument automatycznie trafia na listę bloga i do wybranych kategorii.
Nie tworzymy osobnego dokumentu w **Strony** ani nie dodajemy karty ręcznie.
Najnowszy wpis wynika z daty publikacji, a nie z pola „Wyróżnienie”.
Data publikacji jest datą redakcyjną i kluczem sortowania; sama przyszła data
nie odkłada publikacji. Szkic nie trafia do publicznego buildu.
Po zmianie sluga opublikowanego artykułu dodaj przekierowanie starego adresu
w **Przekierowania**.

## Strona zbiorcza bloga

**Strony → Polski/English → Blog** zawiera:

- tytuł dokumentu, język, adres `blog`, tłumaczenie oraz SEO;
- pierwszą sekcję **Kolekcja bloga**: nagłówek, lead, etykiety kart,
  kategorii, paginacji i komunikaty pustych list;
- opcjonalną sekcję **Formularz**: tytuł, lead i referencję istniejącego
  formularza newslettera. Usunięcie tej sekcji ukrywa newsletter kolekcji.

Układ jest kontrolowany: kolekcja, następnie opcjonalny formularz.
Artykuły i kategorie są pobierane osobno w języku strony.
Wspólna konfiguracja newslettera w artykułach pozostaje w
**Ustawienia witryny → Newsletter w artykułach**.

## Migracja dotychczasowych danych

`siteSettings.blogIndex` pozostaje zachowane jako pole przestarzałe, tylko
do odczytu. Do opublikowania dokumentu strony bloga publiczny renderer
korzysta z dotychczasowych opublikowanych ustawień. Preview preferuje szkic
strony bloga i nie zamienia błędnego nowego dokumentu na fixture.

Skrypt `migrate:blog-pages` kopiuje bieżące ustawienia, SEO i rzeczywiste
referencje formularzy do nowych szkiców `page`. Nie usuwa ustawień, nie
nadpisuje istniejących stron ani artykułów i nie publikuje dokumentów.
Ponowne uruchomienie pomija już istniejące strony bloga.

Próba na eksporcie NDJSON (bez sieci):

```sh
npm run migrate:blog-pages -- --input /ścieżka/do/eksportu.ndjson
```

Próba na bieżących danych Sanity z istniejącą konfiguracją dostępu:

```sh
npm run migrate:blog-pages -- --dataset production
```

Po wdrożeniu schematu i sprawdzeniu raportu, zapis samych szkiców
z `SANITY_API_WRITE_TOKEN` w środowisku:

```sh
npm run migrate:blog-pages -- --dataset production --write
```

Raport i proponowane szkice trafiają do `reports/blog-pages-migration.json`
i `reports/blog-pages-migration.ndjson`. Skrypt sprawdza ponownie rewizje źródeł
oraz istnienie stron przed zapisem. Flaga `--input` nie pozwala na zapis.
Powiązania tłumaczeń nowych szkiców są słabymi referencjami, aby pierwszy szkic
nie wymagał wcześniejszej publikacji drugiej wersji językowej.

## Automatyczna przebudowa

[Kontrakt webhooka](sanity-publication-webhook.json) obejmuje create/update/delete
dla artykułów, stron i publicznych dokumentów zależnych. Pomija szkice,
wersje wydań, dokumenty systemowe i pliki. Projekcja pasuje do istniejącego
Workera `/webhooks/sanity`; zdarzenie nie zawiera treści artykułu.

Kontrakt jest sprawdzony testem lokalnym. Nie został zapisany do zdalnych
webhooków. CLI potwierdził dwa istniejące webhooki, opisane jako publikacja
zmian stron, lecz nie udostępnił ich filtrów. Historyczna konfiguracja
w PROGRESS zawiera filtr `_type == "page"`. Trzeba porównać i ustawić kontrakt
w webhookach staging/production przed odbiorem automatycznej publikacji artykułu.

Jeżeli artykuł ma status Published w Sanity, a nie widać go na stronie,
sprawdź kolejno: dostarczenie webhooka dla `article`, przebieg **Publish content**,
wynik buildu i końcowe wdrożenie. Błąd buildu zachowuje poprzednią stronę.
W tej sesji nie publikowano testowego artykułu ani nie wykonano zdalnego
testu webhook → GitHub Actions → publiczna strona.

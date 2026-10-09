# Strony prawne — konfiguracja CMS

Aktualizacja: 2026-10-08. Status: model i fixture’y w kodzie; **nie** wykonany
zapis do Content Lake. Import: `npm run import:legal` (dry-run).

## Co jest w Studio

Dokument `legalPage` (Strony prawne):

| Pole            | Znaczenie                                                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `language`      | `pl` albo `en`. Osobne dokumenty, powiązane polem `translation`.                                                                                                                    |
| `title`         | Tytuł H1.                                                                                                                                                                           |
| `slug`          | Adres publiczny. Zarezerwowane: `polityka-prywatnosci`, `regulamin`, `lista-cookies-i-identyfikatorow`, `regulamin-newslettera`, `privacy`, `terms`. Typ `page` nie może ich zająć. |
| `effectiveFrom` | Data „obowiązuje od”.                                                                                                                                                               |
| `body`          | Portable Text (`legalBody`): H2/H3, akapity, listy, linki, kod, tabele `articleTable`.                                                                                              |
| `seo`           | Tytuł (max 60) i opis (max 160).                                                                                                                                                    |
| `translation`   | Dokument w drugim języku. Brak powiązania = brak przełącznika języka.                                                                                                               |

Edycja: Studio → Treści → Strony prawne → Polski / English. Podgląd Presentation
prowadzi na `/{slug}/` albo `/en/{slug}/`.

## Trasy

| PL                                  | EN             |
| ----------------------------------- | -------------- |
| `/polityka-prywatnosci/`            | `/en/privacy/` |
| `/regulamin/`                       | `/en/terms/`   |
| `/lista-cookies-i-identyfikatorow/` | —              |
| `/regulamin-newslettera/`           | —              |

Stopka 3a linkuje tylko politykę i regulamin (jak w makietach). Lista cookies
jest w treści polityki. Regulamin newslettera jest w etykiecie zgody `DemoForm`
jako `[regulamin newslettera](/regulamin-newslettera/)`.

## Źródło treści (1:1)

Treść PL pochodzi ze stron tej samej spółki (Wellbiz / zawlodzki.pl), bez
redakcji B2C:

- https://www.zawlodzki.pl/polityka-prywatnosci
- https://www.zawlodzki.pl/lista-cookies-i-identyfikatorow
- https://www.zawlodzki.pl/regulamin
- https://www.zawlodzki.pl/regulamin-newslettera

Przeniesione: nagłówki, paragrafy, §, listy, tabele, linki, daty „obowiązuje od”.
Linki między tymi czterema dokumentami prowadzą na tutejsze ścieżki; pozostałe
hrefy bez zmian. HTML źródłowy: `scripts/legal-sources/`. Konwersja:
`scripts/convert-legal-html.py`. Fixture JSON: `src/content/legal-bodies/`.

## Jak zaimportować

```sh
python3 scripts/convert-legal-html.py   # HTML źródłowy -> src/content/legal-bodies/*.json
python3 scripts/generate-legal-examples.py
npm run import:legal                    # dry-run, bez porównania z datasetem
npm run import:legal -- --dataset production   # dry-run + porównanie z Content Lake
```

Dry-run zapisuje raport i NDJSON do `reports/` i pokazuje dla każdego z 6
dokumentów `create` / `replace (pola)` / `unchanged`. Z tokenem (zapisu albo
odczytu) porównuje perspektywę `raw` i wypisuje istniejące drafty, które zapis
pomija.

Zapis (tylko po osobnej zgodzie):

```sh
SANITY_API_WRITE_TOKEN=… npm run import:legal -- --write --dataset production
```

Jedna transakcja `createOrReplace` dla dokładnie sześciu id `legal-*`
(`legalPage`); nic innego nie jest tworzone, łatane ani usuwane. Bez
`--dataset` albo tokenu skrypt kończy się kodem 2. Token nie jest wypisywany.

Listy zagnieżdżone (`<li>…<ol>…</ol></li>`) trafiają do Portable Text jako
osobne pozycje `level: 2` zaraz po rodzicu; ich tekst nie jest doklejany do
rodzica. Listy `zw-legal__alpha` są punktowane z prefiksem „a) ”, „b) ”…

Po osobnym zleceniu publikacji redaktor poprawia treść B2C (nazwy serwisu,
adresy, narzędzia) bezpośrednio w Studio.

## Otwarte decyzje

- **EN:** brak źródła prawnego po angielsku. Fixture EN to krótka informacja, że
  wiążąca jest wersja polska, z linkiem do niej. Nie tłumaczyć maszynowo.
- **B2C:** treść jest B2B (sklep, kurs, forum zawlodzki.pl). Wymaga redakcji
  Grześka przed produkcją.
- **Content Lake:** schemat i fixture’y nie oznaczają wdrożenia CMS.

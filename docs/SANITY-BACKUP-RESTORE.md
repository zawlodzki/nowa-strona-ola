# Kopia i odtworzenie datasetu Sanity

## Stan

Stan na 13.10.2026. Ćwiczenie odtworzenia nie zostało wykonane. Token zapisu treści nie ma uprawnienia `sanity.project.datasets/create`.

## Eksport

Token źródłowy to zmienna `SANITY_AUTH_TOKEN`. Nie drukuj jej. Nie wpisuj jej do repozytorium, do `output/` ani do argumentów procesu.

Uruchom eksport:

```sh
npm run backup:sanity
```

Polecenie eksportuje dataset `production` projektu `dyuqkn8c`.

Domyślny katalog to `~/sanity-backups/`. Zmienna `SANITY_BACKUP_DIR` zmienia katalog. Względna ścieżka zostaje odrzucona. Ścieżka wewnątrz repozytorium też zostaje odrzucona. Dotyczy to `reports/` i `output/`.

Skrypt uruchamia to polecenie:

```sh
npx sanity datasets export production ~/sanity-backups/sanity-dyuqkn8c-production-<UTC>.tar.gz --project-id dyuqkn8c
```

`npx sanity dataset export` jest tym samym poleceniem CLI. Sanity 6.18.0 wypisuje pomoc `datasets export` dla obu form. Skrypt używa formy liczby mnogiej.

## Suma kontrolna

Skrypt zapisuje `<plik>.sha256` obok archiwum. Między skrótem hex a nazwą bazową są dwie spacje. Format jest zgodny z `sha256sum -c`.

Sprawdź sumę z katalogu kopii:

```sh
sha256sum -c <plik>.tar.gz.sha256
```

Na macOS to samo sprawdzenie robi `shasum -a 256 -c <plik>.tar.gz.sha256`.

## Liczby dokumentów

Skrypt wypisuje liczbę dokumentów każdego `_type`. Osobno liczy opublikowane, szkice i wersje. Liczby biorą się z archiwum. Skrypt nie usuwa dokumentów.

## Sekret podglądu

Archiwum zawiera `sanity.previewUrlSecret`. Trzymaj plik poza repozytorium i poza `output/`.

## Przygotowanie importu

`production` nigdy nie jest celem importu.

Przed każdym odtworzeniem rozpakuj archiwum poza repozytorium. Usuń każdą linię NDJSON, której `_type` to `sanity.previewUrlSecret`. Spakuj ponownie ten sam katalog najwyższego poziomu. Importuj tylko przepakowany plik. Usuń rozpakowane drzewo po zakończeniu importu.

Wpis danych ma postać `<jeden-katalog>/data.ndjson`. Plik `data.ndjson` w korzeniu archiwum nie jest tym wpisem.

Rozpakuj kopię poza repozytorium. Zacznij od pustego katalogu roboczego.

```sh
rm -rf ~/sanity-backups/restore-work
mkdir -p ~/sanity-backups/restore-work
tar -xzf ~/sanity-backups/sanity-dyuqkn8c-production-<UTC>.tar.gz -C ~/sanity-backups/restore-work
```

Zapisz przefiltrowany NDJSON w miejscu oryginału. Polecenie nie wypisuje treści dokumentów.

```sh
node --input-type=module -e '
import { createReadStream, createWriteStream } from "node:fs";
import { createInterface } from "node:readline";
import { rename } from "node:fs/promises";

const directory = process.argv[1];
if (!directory) throw new Error("Podaj katalog z data.ndjson.");
const source = `${directory}/data.ndjson`;
const filtered = `${source}.filtered`;
const output = createWriteStream(filtered);
const lines = createInterface({
  input: createReadStream(source),
  crlfDelay: Infinity,
});
for await (const line of lines) {
  if (line.trim() === "") continue;
  const document = JSON.parse(line);
  if (
    typeof document !== "object" ||
    document === null ||
    typeof document._type !== "string"
  ) {
    throw new Error("Nieczytelna linia NDJSON.");
  }
  if (document._type === "sanity.previewUrlSecret") continue;
  output.write(`${line}\n`);
}
await new Promise((resolve, reject) => {
  output.end((error) => {
    if (error) reject(error);
    else resolve(undefined);
  });
});
await rename(filtered, source);
' -- ~/sanity-backups/restore-work/<jeden-katalog>
```

Spakuj ten sam katalog najwyższego poziomu:

```sh
tar -czf ~/sanity-backups/<przepakowany>.tar.gz -C ~/sanity-backups/restore-work <jeden-katalog>
```

## Dataset ćwiczeniowy

Utwórz dataset ćwiczeniowy:

```sh
npx sanity datasets create restore-drill --visibility public --project-id dyuqkn8c
```

To polecenie wymaga uprawnienia `sanity.project.datasets/create`. Token zapisu treści nie ma tego uprawnienia. Użyj logowania administratora albo tokenu administratora w `SANITY_AUTH_TOKEN` na tym kroku.

Zaloguj administratora:

```sh
npx sanity login
```

Nie commituj tokenu administratora.

## Import

Importuj wyłącznie do `restore-drill`. Użyj `--missing` i `--dataset`. Flaga `--dataset` nazywa dataset wprost.

`production` nigdy nie jest celem importu.

```sh
npx sanity datasets import <przepakowany>.tar.gz --dataset restore-drill --missing --project-id dyuqkn8c
```

Usuń rozpakowane drzewo po zakończeniu importu:

```sh
rm -rf ~/sanity-backups/restore-work
```

## Weryfikacja

1. Porównaj liczby według typu i szkice z sekcją poniżej. Po filtrze liczba `sanity.previewUrlSecret` w datasecie ćwiczeniowym wynosi 0. Plik kopii nadal ma 8 dokumentów `sanity.previewUrlSecret`.
2. Sprawdź rekordy obrazów. Typ `sanity.imageAsset` liczy 10 dokumentów. 7 dokumentów jest wskazywanych przez `_ref` zasobu w innym dokumencie. 3 dokumenty nie są wskazywane.
3. Sprawdź każdy `_ref` zasobu, który zaczyna się od `image-`. Każdy taki `_ref` równa się pewnemu `_id` dokumentu w przefiltrowanym NDJSON.
4. Sprawdź jedną opublikowaną stronę `page`. Sprawdź jeden `ebook`. Sprawdź jeden `article`. Porównaj tytuł i slug ze Studio datasetu `production`.
5. Zbuduj serwis dwa razy do dwóch katalogów poza repozytorium. Pierwszy build używa `PUBLIC_SANITY_PROJECT_ID=dyuqkn8c` i `PUBLIC_SANITY_DATASET=production`. Drugi build używa `PUBLIC_SANITY_DATASET=restore-drill` oraz tego samego identyfikatora projektu. `npm run test:build` czyta `dist/`, bo `scripts/check-build.mjs` ma tę ścieżkę na stałe. Skopiuj build produkcyjny na bok. Zbuduj dataset ćwiczeniowy do `dist/`. Uruchom `npm run test:build`.

   ```sh
   PUBLIC_SANITY_PROJECT_ID=dyuqkn8c PUBLIC_SANITY_DATASET=production npm run build
   mkdir -p ~/sanity-backups/builds
   rm -rf ~/sanity-backups/builds/production
   cp -a dist ~/sanity-backups/builds/production
   PUBLIC_SANITY_PROJECT_ID=dyuqkn8c PUBLIC_SANITY_DATASET=restore-drill npm run build
   npm run test:build
   rm -rf ~/sanity-backups/builds/restore-drill
   cp -a dist ~/sanity-backups/builds/restore-drill
   ```

6. Porównaj zrzuty strony `/` przy szerokości 390 px między buildem `production` a buildem `restore-drill`. Porównaj zrzuty tej samej strony przy szerokości 1280 px. W tym repozytorium nie ma skryptu różnicy pikseli. Porównaj oba zrzuty.

## Usunięcie datasetu ćwiczeniowego

Usuń dataset ćwiczeniowy po zakończeniu kontroli:

```sh
npx sanity datasets delete restore-drill --force --project-id dyuqkn8c
```

`--force` pomija potwierdzenie. Nazwa nie może być `production`.

## Liczby z 2026-10-13 07:10

Eksport z 2026-10-13 07:10 zawiera 77 dokumentów. 69 dokumentów jest opublikowanych. 8 dokumentów to szkice.

Liczby według typu:

- `page` 13
- `ebook` 12
- `testimonial` 12
- `category` 10
- `sanity.previewUrlSecret` 8
- `form` 7
- `legalPage` 6
- `article` 3
- `author` 2
- `service` 2
- `siteSettings` 2

Obrazy to 10 rekordów. 7 rekordów jest użytych. 3 rekordy są nieużyte.

## Wynik ćwiczenia

Ćwiczenie odtworzenia nie zostało wykonane. Brakuje uprawnienia `sanity.project.datasets/create`. Dataset `restore-drill` nie został utworzony.

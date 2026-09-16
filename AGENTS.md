# Instrukcje projektu

## Przed pracą i po sesji

- Przeczytaj [plan](docs/IMPLEMENTATION-PLAN.md) i [postęp](docs/PROGRESS.md).
  Kontynuuj wskazany etap, uwzględniając aktualne polecenie użytkownika.
- Po sesji aktualizuj w [postępie](docs/PROGRESS.md) tylko aktualny etap
  i następny krok. Dokumentacja nie oznacza zakończenia opisanej w niej
  implementacji.
- Komunikacja i dokumentacja po polsku, nazwy w kodzie po angielsku.

## Architektura

- Astro + TypeScript, Sanity, Cloudflare Workers Static Assets. Publiczne strony
  statyczne; osobne Astro SSR dla podglądu i Worker dla integracji. Produkcja
  i podgląd współdzielą komponenty. Studio wdrażane oddzielnie.
- Formularze: Worker → Cloudflare Queues → n8n. Sekrety i dane zgłoszeń nie mogą
  trafić do publicznych zasobów, Sanity, logów aplikacji ani analityki.
- Zewnętrzne self-hostowane c15t jest jedynym źródłem stanu zgód. Tutaj klient,
  panel PL/EN i Basic Consent Mode v2; backend c15t jest poza repo.
- Preferuj komponenty .astro. Interaktywne wyspy, SSR, biblioteki i usługi dodawaj
  tylko dla konkretnych potrzeb wynikających z planu.

## Wygląd i treści

- Źródło zasad: [design system](wonderful-design-system/README.md), specyfikacja,
  tokeny, katalog i MOTION.md. Stosuj rekomendowane poprawki dostępności.
  Nie twórz równoległych tokenów ani nie kopiuj mediów Wonderful.
- Główny krój to Switzer (Fontshare, ITF FFL): oficjalny plik, self-host,
  bez subsetowania i bez Astro `fontProviders`. Treść widoczna bez JS;
  reduced motion musi pozostawiać czytelny stan statyczny.
- Sanity: sekcje z kontrolowanymi wariantami, bez dowolnego CSS. Modeluj znaczenie
  danych, dodawaj etykiety, walidację i podglądy; referencje dla treści wspólnych.
- Każda sekcja ma schemat, renderer HTML, serializer Markdown i przykład.
  Nieznany typ blokuje build. Utrzymuj zgodność typów Sanity/GROQ/TypeScript.
- PL pod /, EN pod /en/; osobne dokumenty i powiązania tłumaczeń. Bez polskiego
  fallbacku pod angielskimi adresami. HTML i Markdown z tych samych danych.
- JSON-LD odzwierciedla widoczną treść. Szkice tylko w chronionym podglądzie;
  prywatne tokeny wyłącznie na serwerze lub podczas zaufanego budowania.

## Weryfikacja i zmiany

- Obowiązuje [CODE-QUALITY.md](docs/CODE-QUALITY.md). npm i jeden package-lock.json.
  Przed przekazaniem zmian aplikacji uruchom `npm run verify`; dla dokumentacji
  wystarczy format i kontrola odnośników. Nie omijaj czerwonych testów.
- Bejamas przyjmujemy selektywnie. Zachowuj poprawki z
  [próby](docs/UI-SPIKE-RESULTS.md), w szczególności natywny trigger i fokus Safari.

- Zachowuj istniejące zmiany użytkownika. Sprawdzaj diff; nie dołączaj cudzych
  zmian do commitów bez polecenia. Nie wykonuj push ani publikacji bez zlecenia.
- Używaj faktycznie dostępnych skryptów repo. Kod: typy, build i testy zachowania
  odpowiednie do ryzyka. Dokumentacja: zgodność i odnośniki. Nie deklaruj kontroli,
  których nie wykonano. Po uruchomieniu aplikacji dodaj sprawdzone komendy do README.
- UI porównuj z design systemem na desktopie i mobile, także dla klawiatury,
  320 px, zoomu 200% i reduced motion. Zapisuj niewykonane kontrole w postępie.

# Kontakt 3a — plan i konfiguracja

Decyzja użytkownika: 09.10.2026. Utworzyć podstronę kontaktu zgodnie z
konwencjami repo. Kod i fixture PL/EN są przygotowane; bez zapisu do Content Lake
ani publikacji. Strony: `/kontakt/`, `/en/contact/`.

## Układ

1. Wspólny nagłówek 3a, H1 „Porozmawiajmy.” i krótki lead.
2. Dwie kolumny: formularz po lewej, wybrane zdjęcie kontaktowe po prawej.
   Pod zdjęciem loga Instagram, Facebook i TikTok jako nazwane linki.
3. Bezpośredni e-mail pod formularzem, następnie dane firmy w osobnym bloku.
4. Wspólny newsletter z odrębnym formularzem (bez checkboxa, informacja Z6), następnie stopka 3a.

Na mobile kolumny układają się w kolejności formularz → e-mail → zdjęcie →
social media → dane firmy → newsletter. Switzer, tokeny, odstępy, fokus i dark
mode pochodzą z istniejącego design systemu. Kontakt dodany do wspólnej nawigacji.

## Bieżące wartości i źródła

| Element     | Wartość                                                          | Źródło/status                                        |
| ----------- | ---------------------------------------------------------------- | ---------------------------------------------------- |
| Pola        | E-mail, telefon, temat rozmowy                                   | Polecenie użytkownika 09.10.2026                     |
| Wymagalność | E-mail i temat wymagane, telefon opcjonalny                      | Decyzja implementacyjna do zmiany w formularzu CMS   |
| Temat       | Krótki tekst, 2–100 znaków                                       | Propozycja implementacyjna                           |
| E-mail      | ola@aleksandraolesiewicz.com                                     | Polecenie użytkownika 09.10.2026                     |
| Firma       | Wellbiz sp. z o.o.                                               | Polecenie użytkownika 09.10.2026                     |
| Adres       | ul. Lipowa 3d, 30-702 Kraków                                     | Polecenie użytkownika 09.10.2026                     |
| NIP         | 6793323800                                                       | Polecenie użytkownika 09.10.2026                     |
| Zdjęcie     | `contact` → `src/assets/portraits/contact.webp`                  | Wcześniej wybrany portret Kontakt C                  |
| Profile     | Istniejące Instagram, Facebook i TikTok                          | `src/content/social-profiles.ts`; wspólne z homepage |
| Newsletter  | Wspólny formularz newslettera: „Zapisuję się”, informacja Z6     | Decyzja właściciela 10.10.2026, zgody 2.3 §7         |
| Przycisk    | „Wyślij wiadomość”; wysyłka do webhooka n8n, `formKey` `contact` | Decyzja właściciela 10.10.2026                       |
| Informacja  | „Odpowiemy na Twoje pytanie. **Nie opisuj tu szczegółów…**”      | Zgody 2.3 §6 dosłownie, pole `notice`, bez zgody     |
| H1 i lead   | „Porozmawiajmy.” / pytanie o konsultację, e-booki lub współpracę | Propozycja copy, fixture                             |

## Mapowanie Sanity

Wykorzystujemy istniejące schematy — bez nowego typu sekcji. Walidator
`actionLink.href` dopuszcza teraz `mailto:` z poprawnym adresem e-mail.
`page-contact-pl/en` zawierają kolejno:

| Sekcja                          | Pola                                           |
| ------------------------------- | ---------------------------------------------- |
| `heroSection`                   | eyebrow, title, lead, primary (mailto), media  |
| `formSection`                   | title, lead, form → `form-contact-pl/en`       |
| `cardsSection`, wariant `links` | title, lead, items (title i href profilu)      |
| `textSection`                   | title „Dane firmy”, body (cztery linie danych) |
| `formSection`                   | title, lead, form → `newsletter-form-pl/en`    |

Mapper pilnuje kolejności, trzech typów pól, zdjęcia, mailto oraz `formKey`
(`contact` i `newsletter`). Renderer korzysta ze wspólnych komponentów 3a. Istniejący serializer
sekcji eksportuje te same dane do Markdown. Preview korzysta z tego samego widoku.
Jawne trasy PL/EN używają `ContactPage.astro`, a `ComposedPage.astro` ładuje go
dynamicznie w preview. Zachowuje to izolację CSS poszczególnych podstron;
kontakt ma osobny budżet 8 KiB zewnętrznego CSS i 4 KiB inline.
Plan importu `import:3a` uwzględnia oba dokumenty strony i oba formularze;
nie uruchomiono zapisu. Import całego planu nie jest poleceniem publikacji.

## Formularze i następny krok

Etap 6 integracji pozostaje otwarty. Przyciski „Sprawdź formularz” i komunikaty
mówią wprost o demonstracji; walidacja działa lokalnie i nie zapisuje ani nie
wysyła danych. Kontakt i newsletter mają oddzielne identyfikatory i statusy.
Bez JS przyciski są wyłączone, a e-mail pozostaje klikalny.

Przed uruchomieniem wysyłki: Worker → Queues → n8n, walidacja serwerowa,
Turnstile i limity oraz finalna informacja o przetwarzaniu danych kontaktowych.
Potwierdzenie przyjęcia dopiero po kolejce. Nie dodano czwartego pola ani zgody
marketingowej do kontaktu. Dane firmy nie oznaczają adresu gabinetu ani zaproszenia
na wizytę stacjonarną. Rzeczywista obsługa zapisów newslettera też wymaga etapu 6.

## Import do Content Lake (`npm run import:contact`)

Celowany skrypt zamiast całego `import:3a`. Zapisuje wyłącznie:

- `page-contact-pl` i `page-contact-en` oraz `form-contact-pl` i
  `form-contact-en` — `createIfNotExists`; istniejący dokument z inną treścią
  jest raportowany jako konflikt i nadpisywany tylko z `--force`;
- pozycję `nav-contact` w `siteSettings-pl/en` — patch `insert` po `nav-blog`
  (albo na końcu, jeśli `nav-blog` usunięto), z `ifRevisionID`; pozostałe pola
  ustawień zostają bez zmian, a ponowne uruchomienie pomija istniejącą pozycję.

Domyślnie dry-run. `--dataset production` porównuje z datasetem (z tokenem w
perspektywie raw, więc widać szkice), sprawdza `_key`, typy, id, referencje
(formularze, tłumaczenia, zdjęcie, linki zgód, adres w menu) i zapisuje
`reports/contact-import-transaction.json`. `--simulate <plik.ndjson>` zapisuje
opublikowany dataset po zastosowaniu planu do builda z `astro.sim.config.mjs`.
`--write --dataset production` wymaga `SANITY_API_WRITE_TOKEN` i wysyła wszystko
jedną transakcją. Token nie jest wypisywany.

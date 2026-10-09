# Kontakt 3a — plan i konfiguracja

Decyzja użytkownika: 09.10.2026. Utworzyć podstronę kontaktu zgodnie z
konwencjami repo. Kod i fixture PL/EN są przygotowane; bez zapisu do Content Lake
ani publikacji. Strony: `/kontakt/`, `/en/contact/`.

## Układ

1. Wspólny nagłówek 3a, H1 „Porozmawiajmy.” i krótki lead.
2. Dwie kolumny: formularz po lewej, wybrane zdjęcie kontaktowe po prawej.
   Pod zdjęciem loga Instagram, Facebook i TikTok jako nazwane linki.
3. Bezpośredni e-mail pod formularzem, następnie dane firmy w osobnym bloku.
4. Wspólny newsletter z odrębnym formularzem i zgodą, następnie stopka 3a.

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
| Newsletter  | Istniejące copy i referencja formularza newslettera              | Bez zmian treści zgody                               |
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

Mapper pilnuje kolejności, trzech typów pól, zdjęcia, mailto i wymaganej zgody
newslettera. Renderer korzysta ze wspólnych komponentów 3a. Istniejący serializer
sekcji eksportuje te same dane do Markdown. Preview korzysta z tego samego widoku.
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

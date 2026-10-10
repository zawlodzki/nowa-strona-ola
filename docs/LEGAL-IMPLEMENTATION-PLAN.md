# Plan wdrożenia dokumentacji prawnej na stronie

|                   |                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wersja**        | 2.0 (decyzje właściciela z 10.10.2026)                                                                                                                                                                              |
| **Źródło prawne** | `../projekt prawny ola/www-prawne/` — regulamin 2.2, pouczenie i formularz odstąpienia 2.0, polityka prywatności 2.1, lista cookies 2.0, regulamin newslettera 2.1, zgody i formularze 2.3; plan B2C 2.5 (D25, D26) |
| **Kod bazowy**    | `main` = `origin/main` `8d39131` (zsynchronizowane 10.10.2026)                                                                                                                                                      |
| **Status**        | krok 1 wykonany w gałęzi `feat/legal-step-1` (bez push i bez zapisu do Content Lake); dokumenty prawne to drafty przed przeglądem radcy                                                                             |

To nie jest porada prawna. Dokumenty z projektu prawnego czekają na przegląd radcy
(paczka z 10.10.2026). Strona może je renderować na stagingu, ale publikacja w Sanity
wymaga akceptacji radcy i uzupełnienia placeholderów `{{…}}`. Walidacja Studio blokuje
publikację dokumentu z placeholderem.

## 1. Decyzje właściciela (10.10.2026)

| #   | Decyzja                                                                                                                 | Skutek dla strony                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| W1  | Strona `/wspolprace` usunięta z dokumentacji (D25); afiliacja wyłącznie w social media                                  | Brak podstrony, modelu partnerów i odesłań na stronie                                                        |
| W2  | Logotypy partnerów usunięte ze strony (D26)                                                                             | Sprawdzone: strona ich nie zawiera, zmiana zbędna                                                            |
| W3  | Newsletter bez checkboxa (zgody i formularze 2.3, sekcja 7)                                                             | Informacja pod przyciskiem „Zapisuję się”, zgoda przez działanie (Z6), double opt-in po stronie n8n/Listmonk |
| W4  | Wszystkie formularze wysyłają dane POST na webhook n8n `https://flows.zawlodzki.com/webhook/2fba1cf1-…`                 | Wysyłka z przeglądarki (CORS sprawdzony preflightem). Ścieżka Worker → Queues → n8n odłożona                 |
| W5  | GTM i c15t wdraża właściciel po bieżących zmianach                                                                      | Poza krokiem 1; stopka bez kontrolki „Ustawienia cookies” do czasu c15t                                      |
| W6  | Brak koszyka; każdy e-book ma własny link płatności Stripe                                                              | Pole `checkoutUrl` zostaje; strona nie ma podsumowania zamówienia                                            |
| W7  | Akceptacja regulaminu, 18+, zgoda na natychmiastowe dostarczenie i przycisk „Zamawiam z obowiązkiem zapłaty” — w Stripe | Poza stroną; konfiguracja Stripe Checkout / Payment Links                                                    |
| W8  | Najniższa cena z 30 dni przy obniżce — na podstronie e-booka                                                            | Nowe pole e-booka i informacja przy cenie                                                                    |
| W9  | Dostawa z R2 i wysyłka po 14 dniach bez zgody Z2 — poza stroną                                                          | Brak zmian w repo                                                                                            |
| W10 | Zgody na publikację opinii archiwizowane w skrzynce e-mail                                                              | Brak pól zgody w Sanity; pod opiniami informacja o weryfikacji (sekcja 8)                                    |
| W11 | Konsultacje uruchomione: rezerwacja `https://cal.com/dietetyk/konsultacja`                                              | `bookingUrl` i status `live`; zgody przy rezerwacji zbiera Cal.com/Stripe                                    |
| W12 | Zgody przy zakupach zbierają Cal.com i Stripe, nie strona                                                               | Strona nie zapisuje zgód zakupowych                                                                          |
| W13 | Wersja angielska strony dezaktywowana na ten moment                                                                     | `/en/` nie jest budowane; kod EN, schematy i podgląd zostają do ponownego włączenia                          |

Uwaga do W11: plan B2C (bloker 8, decyzja D24) wstrzymywał płatne konsultacje do czasu
odpowiedzi radcy na pytanie A1 (działalność lecznicza). Uruchomienie rezerwacji to decyzja
właściciela podjęta mimo tej otwartej kwestii.

## 2. Krok 1 — zakres

| Obszar               | Zakres                                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strony prawne        | Treść B2C z `www-prawne/` zamiast fixture’ów B2B zawlodzki.pl; konwerter Markdown → Portable Text; pouczenie i wzór formularza jako załączniki regulaminu (`#pouczenie`, `#formularz-odstapienia`); pole `version`; blokada publikacji z placeholderami |
| Stopka               | Bez danych spółki (są na `/kontakt/` i w dokumentach prawnych); linki: Regulamin, Polityka prywatności, Lista cookies, Regulamin newslettera, Odstąpienie od umowy; „© 2026 Wellbiz sp. z o.o. · Treści: Aleksandra Olesiewicz-Zawłodzka”               |
| Opinie               | Jedna informacja o weryfikacji opinii pod każdą sekcją opinii                                                                                                                                                                                           |
| Formularze           | Formularz demonstracyjny zastąpiony formularzem wysyłającym JSON na webhook; kontrakt z `formKey`, `formVersion`, zgodami z wersją i czasem; honeypot; komunikat sukcesu dopiero po odpowiedzi 2xx                                                      |
| Newsletter i kontakt | Teksty z sekcji 7 i 6 dokumentu zgód                                                                                                                                                                                                                    |
| `/odstapienie/`      | Formularz oświadczenia (sekcja 10); po wysłaniu treść i czas na ekranie; e-mail E7 wysyła n8n                                                                                                                                                           |
| E-book               | Pole najniższej ceny z 30 dni i informacja przy cenie                                                                                                                                                                                                   |
| Konsultacja          | Link Cal.com, status `live`                                                                                                                                                                                                                             |
| EN                   | Trasy `/en/` wyłączone z buildu, przełącznik języka, hreflang i sitemap bez EN                                                                                                                                                                          |

## 3. Poza krokiem 1

- **c15t i GTM** (właściciel): panel z sekcji 9 dokumentu zgód, Consent Mode basic,
  wykluczenie piksela Meta i Clarity na stronach konsultacji, e-booków i `/odstapienie/`,
  kontrolka „Ustawienia cookies” w stopce, skan cookies → lista cookies.
- **Przegląd komunikacji** (`COMPLIANCE-COPY-REVIEW-STAGING.md`, R1–R11) — decyzje
  właścicielki treści.
- **Ochrona formularzy**: webhook jest publiczny, bez Turnstile i limitów po stronie
  strony. n8n musi walidować dane, deduplikować po `submissionId` i odrzucać honeypot.
  Docelowo rozważyć powrót do Workera z Turnstile.
- **Poza repo**: Stripe (ToS, `custom_text`, `locale=pl`, przycisk), Cal.com (pytania Z1,
  Z3, opis wydarzenia), Ankieta (Z4, Z5), n8n (E7 po odstąpieniu, double opt-in, E1–E3),
  R2 i odroczona dostawa e-booka.
- **Publikacja**: po akceptacji radcy uzupełnić daty wejścia w życie i placeholdery,
  zaimportować dokumenty do Sanity i opublikować.

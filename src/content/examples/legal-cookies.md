# Lista cookies i identyfikatorów aleksandraolesiewicz.com

Wersja 2.0 · data wejścia w życie do ustalenia

Lista uzupełnia [Politykę prywatności](/polityka-prywatnosci/) i opisuje pliki cookies, wpisy pamięci przeglądarki i podobne identyfikatory używane na aleksandraolesiewicz.com.

## Przed dokonaniem wyboru

Przed Twoim wyborem w banerze zapisujemy wyłącznie identyfikatory niezbędne. Tagi Google nie są ładowane (Google Consent Mode w trybie podstawowym), a Microsoft Clarity i piksel Meta pozostają zablokowane.

## Gdzie narzędzia opcjonalne nigdy nie działają

Niezależnie od zgody **piksel Meta i Microsoft Clarity nie działają**, a Google Analytics nie przekazuje nazw produktów, na: stronach konsultacji i e-booków, w podsumowaniu zamówienia, na stronach potwierdzeń i na stronie formularza odstąpienia. Ankieta przed konsultacją działa poza Stroną (Formularze Google) i nie zawiera naszych tagów.

## Niezbędne — zawsze aktywne

| Identyfikator                  | Dostawca                                   | Mechanizm i domena                                                                    | Cel                                                                          | Okres działania                                                           |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `{{NAZWA_COOKIE_ZGODY}}`       | c15t (self-hosted, serwer OVH w Warszawie) | cookie first-party na `aleksandraolesiewicz.com`                                      | zapis Twojej decyzji o zgodzie: kategorie, data, identyfikator zgody, wersja | `{{OKRES}}` (B2B: 365 dni)                                                |
| `__cf_bm`                      | Cloudflare                                 | cookie first-party                                                                    | ochrona przed ruchem botów                                                   | 30 minut `{{DO_POTWIERDZENIA_SKANEM}}`                                    |
| `__stripe_mid`, `__stripe_sid` | Stripe                                     | cookies na `checkout.stripe.com` (strona płatności)                                   | zapobieganie oszustwom w płatnościach                                        | odpowiednio ok. 1 rok i 30 minut — ustawiane przez Stripe na jego stronie |
| `{{COOKIES_CAL_COM}}`          | Cal.com                                    | wg sposobu osadzenia kalendarza (osadzenie na Stronie albo przekierowanie do cal.com) | działanie kalendarza rezerwacji                                              | `{{DO_POTWIERDZENIA_SKANEM}}`                                             |

## Analityczne — po zgodzie na analitykę

| Identyfikator       | Dostawca           | Mechanizm i domena  | Cel                                                                                    | Okres działania                                                      |
| ------------------- | ------------------ | ------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `_ga`               | Google Analytics 4 | cookie first-party  | rozróżnianie użytkowników                                                              | ok. 13 miesięcy `{{DO_POTWIERDZENIA_SKANEM}}`                        |
| `_ga_{{ID_USŁUGI}}` | Google Analytics 4 | cookie first-party  | utrzymanie stanu sesji                                                                 | ok. 13 miesięcy `{{DO_POTWIERDZENIA_SKANEM}}`                        |
| `_clck`, `_clsk`    | Microsoft Clarity  | cookies first-party | rozpoznanie przeglądarki i sesji na potrzeby map kliknięć i nagrań sesji z maskowaniem | `_clck` ok. 1 rok, `_clsk` ok. 1 dzień `{{DO_POTWIERDZENIA_SKANEM}}` |

Dane GA4 na poziomie użytkownika przechowujemy 2 miesiące. Okres przechowywania nagrań Clarity: `{{OKRES_CLARITY}}`.

## Marketingowe — po zgodzie na marketing

| Identyfikator | Dostawca           | Mechanizm i domena                                                                                          | Cel                        | Okres działania                          |
| ------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------- |
| `_fbp`        | Meta (piksel Meta) | cookie first-party — **tylko na stronach bez tematyki zdrowotnej** (strona główna, „O mnie”, wybrane wpisy) | pomiar skuteczności reklam | ok. 90 dni `{{DO_POTWIERDZENIA_SKANEM}}` |

Meta może dodatkowo zapisywać pliki cookies we własnych domenach (`facebook.com`); Strona nie ma do nich dostępu, a okres ich działania określa Meta.

## Zmiana zgody

Wybór zmienisz w każdej chwili przez link „Ustawienia cookies” w stopce Strony. Cofnięcie zgody zatrzymuje właściwe tagi. Pliki cookies możesz też usunąć w ustawieniach przeglądarki.

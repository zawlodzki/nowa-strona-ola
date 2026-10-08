# Lista cookies i identyfikatorów

obowiązuje od 26.07.2026

Ta lista uzupełnia [Politykę prywatności](/polityka-prywatnosci/) i opisuje cookies, wpisy pamięci przeglądarki oraz podobne identyfikatory używane na www.zawlodzki.pl.

## Przed dokonaniem wyboru

Przed dokonaniem wyboru na urządzeniu nie zapisujemy żadnych opcjonalnych plików cookies. Tagi Google (GTM `GTM-P5V3CJ5`, GA4 `G-FPQCV0H550`) działają w trybie Google Consent Mode v2 Advanced z domyślnym stanem „odmowa” dla analityki i reklamy i mogą wysyłać ograniczone, bezciasteczkowe sygnały (`gcs=G100`, `npa=1`).

## Niezbędne — zawsze aktywne

| Identyfikator       | Dostawca                                   | Mechanizm i domena                                                                           | Cel                                                                                                                       | Okres działania                                                       |
| ------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `zawlodzki-consent` | self-hosted c15t (`consent.zawlodzki.com`) | cookie first-party na `zawlodzki.pl`, Secure, SameSite=Lax; ta sama wartość w `localStorage` | zapis decyzji o zgodzie: wybrane kategorie, znacznik czasu, identyfikator podmiotu (`subjectId`) i odcisk wersji polityki | cookie: 365 dni; wpis w `localStorage`: do zmiany lub cofnięcia zgody |

Niezbędne — zawsze aktywne

## Analityczne — po zgodzie na analitykę

| Identyfikator                    | Dostawca                                       | Mechanizm i domena                                 | Cel                                                                                                                                   | Okres działania                                                                                                                                                          |
| -------------------------------- | ---------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_ga`                            | Google Analytics 4                             | cookie first-party na `zawlodzki.pl`, SameSite=Lax | rozróżnianie użytkowników                                                                                                             | ok. 13 miesięcy, około 400 dni                                                                                                                                           |
| `_ga_FPQCV0H550`                 | Google Analytics 4, usługa `G-FPQCV0H550`      | cookie first-party na `zawlodzki.pl`, SameSite=Lax | utrzymanie stanu sesji GA4                                                                                                            | ok. 13 miesięcy, około 400 dni                                                                                                                                           |
| `zaw_attribution_measurement_v1` | Wellbiz, skrypt atrybucji w GTM                | wpis first-party w `localStorage`                  | pierwsze i ostatnie źródło wizyty: source, medium, campaign, content, landing page, referrer domain, timestamp, `utm_id` i `utm_term` | 90 dni od ostatniej aktualizacji; usuwany po cofnięciu zgody analitycznej                                                                                                |
| `zaw_attribution_session_v1`     | Wellbiz, skrypt atrybucji w GTM                | wpis first-party w `sessionStorage`                | poprzednia i bieżąca podstrona, liczba odsłon w sesji oraz `cta_id` linku prowadzącego do `/kontakt`                                  | aktywna sesja do 30 minut bezczynności; wpis może pozostać do zamknięcia karty, ale po tym czasie jest ignorowany i zastępowany; usuwany po cofnięciu zgody analitycznej |
| Microsoft Clarity                | Microsoft (`clarity.ms`, projekt `gjd8ua7x7t`) | skrypt third-party                                 | analiza sposobu korzystania ze Strony: nagrania sesji i mapy kliknięć                                                                 | w skanie nie zapisał odczytywalnych cookies first-party; ewentualne identyfikatory pojawiają się dopiero po przekazaniu sygnału zgody                                    |

Analityczne — po zgodzie na analitykę

| Identyfikator          | Dostawca                                                       | Mechanizm i domena                                 | Cel                                               | Okres działania                                                                                           |
| ---------------------- | -------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `nQ_cookieId`          | Albacross (`serve.albacross.com`, `new-collect.albacross.com`) | cookie first-party na `zawlodzki.pl`, SameSite=Lax | rozpoznanie firmy, z której korzysta odwiedzający | 365 dni                                                                                                   |
| `nQ_userVisitId`       | Albacross                                                      | cookie first-party na `zawlodzki.pl`, SameSite=Lax | powiązanie pojedynczej wizyty                     | ok. 30 minut                                                                                              |
| Leadfeeder (Dealfront) | Dealfront (`sc.lfeeder.com`)                                   | skrypt third-party                                 | identyfikacja firm odwiedzających Stronę          | tracker ładował się, ale w skanie nie zapisał odczytywalnego cookie first-party; nie zaobserwowano `_lfa` |

Analityczne — po zgodzie na analitykę

## Marketingowe — po zgodzie na marketing

| Identyfikator                  | Dostawca                        | Mechanizm i domena                                 | Cel                                                                                                                                   | Okres działania                                                                 |
| ------------------------------ | ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `_gcl_au`                      | Google Ads / Google Tag         | cookie first-party na `zawlodzki.pl`, SameSite=Lax | atrybucja kliknięć i konwersji reklamowych                                                                                            | ok. 90 dni                                                                      |
| `_gcl_ls`                      | Google Ads / Google Tag         | wpis w `localStorage`                              | dane pomocnicze linkera konwersji                                                                                                     | do usunięcia danych przeglądarki lub cofnięcia zgody                            |
| `_fbp`                         | Meta, piksel Meta               | cookie first-party na `zawlodzki.pl`, SameSite=Lax | identyfikacja przeglądarki na potrzeby pomiaru reklam i remarketingu                                                                  | ok. 90 dni                                                                      |
| `zaw_attribution_marketing_v1` | Wellbiz, skrypt atrybucji w GTM | wpis first-party w `localStorage`                  | identyfikatory kliknięć `gclid`, `gbraid`, `wbraid`, `msclkid`, `fbclid` i `li_fat_id`, używane do przypisania zgłoszenia do kampanii | do 90 dni, `li_fat_id` do 30 dni; wpis usuwany po cofnięciu zgody marketingowej |

Marketingowe — po zgodzie na marketing

Google/DoubleClick (`doubleclick.net`, `google.com`, `googlesyndication.com`) oraz Meta (`facebook.com`, `connect.facebook.net`) mogą dodatkowo zapisywać cookies we własnych domenach. Strona nie może ich bezpośrednio odczytać, a ich okresy działania określa dany dostawca.

## Zmiana zgody

Wybór możesz zmienić w każdej chwili przyciskiem „Zarządzaj zgodami” w stopce Strony. Cofnięcie zgody zatrzymuje właściwe tagi i usuwa odpowiadającą jej grupę danych atrybucyjnych z pamięci przeglądarki. Cookies możesz również usunąć w ustawieniach przeglądarki.

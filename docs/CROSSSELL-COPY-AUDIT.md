# Audyt copy oferty po zakupie

Data 18.10.2026. Podstawa to decyzja użytkownika o krótkiej ofercie na jeden
ekran komputera, cenie pakietu 97 zł i zakupie wyłącznie dwóch brakujących
e-booków. Copy korzysta ze skilla [ebook-landing-3a](../.agents/skills/ebook-landing-3a/SKILL.md)
i jego [zasad copywritingu](../.agents/skills/ebook-landing-3a/references/copywriting.md).

Strona `/po-zakupie/` uzupełnia opłacone zamówienie. Pokazuje obie okładki,
krótki opis użyteczności, cenę pakietu i warunki kolejnego zamówienia.
Usunięto osobne akapity o trudnościach klientki i sposobie korzystania z serii.
Nie dodano opinii ani osobistej historii autorki.

| Zasada                             | Cytat i sekcja                                                                                   | Status    | Uzasadnienie lub brak danych                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------ |
| 1. Mały krok i istotny wynik       | "Dobierz dwa pozostałe i przygotuj się do konsultacji z pełniejszą wiedzą o PMOS (PCOS).", wstęp | częściowo | Lektura wspiera przygotowanie do konsultacji. Nie obiecuje wyniku zdrowotnego. |
| 2. Duży problem i prosty mechanizm | brak                                                                                             | pominięta | Kompaktowa oferta nie rozwija problemu ani mechanizmu materiałów.              |
| 3. Bliski pierwszy wynik           | "przygotuj się do konsultacji z pełniejszą wiedzą", wstęp                                        | częściowo | Wskazuje użyteczny rezultat bez obietnicy terminu lektury lub dostawy.         |
| 4. Empatia bez obwiniania          | brak                                                                                             | pominięta | Skrócona oferta nie powtarza opisu trudności z landingów produktów.            |
| 5. Uznanie wcześniejszego wysiłku  | "Masz już pierwszy e-book.", wstęp                                                               | użyta     | Odnosi się do wykonanego zakupu.                                               |
| 6. Osobista historia autorki       | brak                                                                                             | pominięta | Brak zweryfikowanej osobistej historii.                                        |
| 7. Użyteczny mniej oczywisty wgląd | brak                                                                                             | pominięta | Brak źródła uzasadniającego nowy wgląd.                                        |

Nagłówek "Uzupełnij serię za pół ceny" dotyczy wyłącznie dwóch brakujących
e-booków razem. Pakiet kosztuje 97 zł brutto. Porównanie "97 zł zamiast
194 zł za zakup osobno." odnosi się do sumy aktualnych cen zakupu osobno.
Nie jest deklaracją najniższej ceny z 30 dni. Na stronie nie ma rozbicia ceny
na 48,50 zł za sztukę. Nie dodano licznika ani terminu wygaśnięcia oferty.

Warunek "Pakiet obejmuje oba pozostałe e-booki. To osobne zamówienie."
wyjaśnia zakres zakupu. Obowiązkowe oświadczenie D27 i przycisk
"Zamawiam z obowiązkiem zapłaty" zachowują pełne brzmienie.

Serwer wybiera pozostałe dwa kody z rejestru trzech produktów po potwierdzeniu
opłacenia pierwszego e-booka. CMS przechowuje kod każdego produktu i wspólne
copy oferty. Nie zaznacza się ręcznie par dla poszczególnych e-booków.
Widok nie potwierdza zapłaty przed odczytem chronionego statusu.

Zgodnie z poleceniem użytkownika cross-sell nie wyświetla dopisku o nieuruchomionej
sprzedaży. Bramka płatności pozostaje wyłączona. Dostawa pozostaje poza zakresem.
Zmiany modelu i fixture nie oznaczają publikacji w Sanity.

## Oferta konfigurowana przy produkcie, 18.10.2026

Nagłówek, etykieta i krótki lead pochodzą teraz z `ebook.crossSell`, nie ze
wspólnego tekstu dla PCOS. Pary wskazują dwie referencje przy kupowanym e-booku.
Taki sam widok obsługuje perimenopauzę. Panel używa matcha i primary CTA.
Przekreślone 194 zł ma etykietę „Cena przy zakupie osobno”; pakiet kosztuje
97 zł brutto. Kwota nie oznacza historycznej ceny pakietu.

Odmowa nie uruchamia promocji mailowej. Osobny przycisk „Wyślij mi tę ofertę
e-mailem” zapisuje dobrowolną jednorazową prośbę. Termin to siedem dni od
pierwszej płatności. Transport wiadomości jest odłożony, a podgląd nie
udaje wykonanej wysyłki. Podziękowanie po zakupie pakietu zapowiada dostawę
e-mailem i zaprasza do istniejącego formularza newslettera.

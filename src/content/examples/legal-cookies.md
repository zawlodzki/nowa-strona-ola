# Lista cookies i identyfikatorów aleksandraolesiewicz.com

Wersja 2.2 · obowiązuje od 11.10.2026

Lista uzupełnia [Politykę prywatności](/polityka-prywatnosci/) i opisuje pliki cookies, pamięć lokalną przeglądarki (localStorage) oraz podobne identyfikatory Strony.

## Aktualny stan narzędzi

**Google Tag Manager, Google Analytics 4, Microsoft Clarity i piksel Meta są obecnie wyłączone na całej Stronie, również po wybraniu „Akceptuj wszystkie”.** Panel zapisuje Twoje preferencje, ale sam wybór nie uruchamia tych usług. Ich planowane zastosowania opisujemy osobno poniżej. Uruchomienie będzie wymagało sprawdzenia konfiguracji i aktualizacji tej listy.

## Przed dokonaniem wyboru

Kategorie opcjonalne są domyślnie wyłączone. Zamknięcie panelu nie oznacza zgody. Zapis decyzji następuje po jej wybraniu i potwierdzeniu przez nasz serwer c15t. Bez potwierdzenia nie włączamy narzędzi opcjonalnych. Wybór jasnego lub ciemnego motywu zapisujemy dopiero wtedy, gdy samodzielnie zmienisz motyw; wcześniej korzystamy z ustawienia systemowego.

## Zapis decyzji i motywu

| Identyfikator        | Dostawca                                             | Mechanizm i zakres                                                                                                             | Cel                                                                                                                                                                    | Okres działania                                                                                                                                                                                                                        |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `olesiewicz-consent` | Wellbiz, oprogramowanie c15t na własnym serwerze OVH | cookie własne, wyłącznie dla bieżącego hosta, bez współdzielenia między domenami; Secure przy HTTPS, SameSite=Lax, ścieżka `/` | potwierdzony wybór kategorii, identyfikatory użytkownika zgód i decyzji, wersja polityki, daty; przy przerwanym wycofaniu także ograniczający stan oczekujący na zapis | do 365 dni od zapisu; zmiana wyboru zastępuje zapis                                                                                                                                                                                    |
| `olesiewicz-consent` | Wellbiz                                              | localStorage, wyłącznie dla bieżącego originu, czyli protokołu, hosta i portu                                                  | kopia decyzji oraz zabezpieczenie wycofania zgody podczas problemów z połączeniem                                                                                      | potwierdzona decyzja jest ważna do 365 dni; localStorage nie ma automatycznego terminu usunięcia, więc wpis może pozostać do zastąpienia lub wyczyszczenia pamięci; oczekujące wycofanie pozostaje do synchronizacji lub wyczyszczenia |
| `ao-theme`           | Wellbiz                                              | localStorage, wyłącznie dla bieżącego originu                                                                                  | zapamiętanie wybranego przez Ciebie wyglądu: `light` (jasny) albo `dark` (ciemny), także przy przejściu na podstronę                                                   | do kolejnej zmiany motywu lub wyczyszczenia pamięci przeglądarki                                                                                                                                                                       |

Zapis zgód jest niezbędny do zapamiętania i wykonania Twojej decyzji, a zapis motywu służy wyłącznie wybranej przez Ciebie funkcji wyglądu. Nie wykorzystujemy tych wpisów do analityki ani reklam. Motywu nie przekazujemy do c15t.

Decyzje zapisujemy w c15t na własnym serwerze. Dowód zawiera identyfikatory użytkownika zgód i decyzji, domenę, kategorie, datę, politykę i jej wersję, sposób dokonania wyboru, język, informacje o przeglądarce (User-Agent) oraz zamaskowany adres IP. Nie zbieramy w tym celu imienia, e-maila ani danych formularzy. Historię decyzji przechowujemy do 36 miesięcy od ostatniej decyzji. Termin ten dotyczy dowodu po stronie serwera, a nie ważności cookie. Pamięć przeglądarki sama nie stanowi potwierdzenia aktualnej zgody; stan weryfikuje c15t. Po upływie ważności prosimy o ponowny wybór.

Zgody tej Strony są zbierane osobno od zgód zawlodzki.pl. Wspólna infrastruktura i administracja c15t nie przenoszą wyborów między tymi stronami. Środowisko testowe ma osobny profil zgód i nie przekazuje ich na domenę produkcyjną.

## Usługi ochrony i płatności

| Identyfikator                  | Dostawca   | Gdzie może wystąpić                                                                                            | Cel                                   | Okres działania                                                          |
| ------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `__cf_bm`                      | Cloudflare | jeżeli zostanie uruchomiona odpowiednia ochrona przed botami; nie potwierdzono tego cookie w odbiorze stagingu | ochrona przed ruchem botów            | według konfiguracji dostawcy; sprawdzimy przed uruchomieniem tej funkcji |
| `__stripe_mid`, `__stripe_sid` | Stripe     | na zewnętrznej stronie płatności Stripe po przejściu do płatności; nie są identyfikatorami panelu zgód Strony  | zapobieganie oszustwom w płatnościach | według ustawień i polityki Stripe na stronie płatności                   |

Link do rezerwacji Cal.com prowadzi na zewnętrzną stronę. Samo wyświetlenie linku nie osadza kalendarza ani nie zapisuje cookies Cal.com na Stronie. Po przejściu do zewnętrznej usługi zastosowanie ma jej polityka prywatności i cookies.

## Planowane narzędzia opcjonalne

Poniższe identyfikatory **nie są obecnie ustawiane przez Stronę**. Nazwy stanowią wykaz planowanych narzędzi; rzeczywiste domeny i okresy muszą zostać sprawdzone przed aktywacją i wpisane do tej listy.

| Kategoria zgody | Narzędzie          | Planowane identyfikatory                                              | Cel                                                      |
| --------------- | ------------------ | --------------------------------------------------------------------- | -------------------------------------------------------- |
| Analityczne     | Google Analytics 4 | `_ga`, `_ga_*`                                                        | statystyki korzystania z dopuszczonych stron             |
| Analityczne     | Microsoft Clarity  | `_clck`, `_clsk`                                                      | mapy kliknięć i nagrania sesji na dopuszczonych stronach |
| Marketingowe    | piksel Meta        | `_fbp`, ewentualne cookies w domenach Meta po uruchomieniu integracji | pomiar skuteczności reklam na dopuszczonych stronach     |

Planowany Google Consent Mode działa w trybie podstawowym. Tagi Google mogą być ładowane dopiero po właściwej zgodzie; przed zgodą nie wysyłamy sygnałów do Google. Sama zgoda nie wystarczy do uruchomienia pomiaru. Każda strona musi też zostać osobno dopuszczona do danego narzędzia.

**Treści dotyczące zdrowia, konsultacji i e-booków, formularze, zamówienia, płatności, potwierdzenia i odstąpienia są wyłączone z analityki i marketingu, niezależnie od zgody.** Obecnie żadna strona nie została dopuszczona do pomiaru. Ankieta przed konsultacją działa poza Stroną i nie zawiera naszych tagów. Dane wpisane w formularzach nie są przekazywane do analityki.

## Zmiana zgody i usunięcie wpisów

Przycisk „Ustawienia cookies” w stopce otwiera panel. Możesz odmówić wszystkich kategorii opcjonalnych, zaakceptować je lub zapisać własny wybór. Odmowa nie blokuje korzystania ze Strony. Cofnięcie zgody blokuje odpowiednie narzędzia; awaria serwera nie uprawnia nas do ich uruchomienia. Jeżeli zapis wycofania zostanie przerwany, przy kolejnym otwarciu Strony synchronizujemy odmowę wszystkich kategorii opcjonalnych. Możesz wtedy ponownie wybrać kategorie, na które chcesz się zgodzić.

Cookies i localStorage możesz usunąć w ustawieniach przeglądarki dla tej strony. Po usunięciu cookie zgody prosimy o ponowny wybór, chyba że w pamięci lokalnej pozostało oczekujące wycofanie; wtedy najpierw synchronizujemy odmowę. Usunięcie `ao-theme` przywraca korzystanie z ustawienia systemowego. Wyczyszczenie pamięci przeglądarki nie usuwa automatycznie dowodu decyzji z c15t; w sprawach praw dotyczących danych skontaktuj się z nami zgodnie z Polityką prywatności.

# Przegląd przed wdrożeniem panelu zgód

Przegląd niezależny, tylko odczyt. Odczytałem poteto-mode, no-comments, prompt Comment Sicko, unslop, typescript-best-practices i Type System Discipline. Nie zmieniałem kodu, nie przebudowywałem dist, nie wysyłałem żądań do usług pomiarowych ani webhooka. Rodzic nadal prowadzi końcowy verify.

## Werdykt

Nie znalazłem nowego błędu izolacji c15t ani uruchomienia tagów w bieżącym wariancie z pustą allowlistą. Budżet aktualnego dist potwierdziłem w wymaganym Node 24.19.0. Znalazłem P2 w kolejności pierwszego page_view i potwierdziłem jego poprawkę z osobnym pageViewSent. Nie ma otwartych ustaleń kodu z tego przeglądu. Wdrożenie panelu nadal wymaga wyniku trwającego verify i odbioru stagingu. Aktywacja pomiaru pozostaje osobnym nieukończonym etapem.

## Ustalenia wymagające działania

1. Wycofana flaga budżetu CSS. Pierwsze wywołanie checkCssBudgets uruchomiło domyślny Node 26.11.0 i dało homepage 8211 B gzip. Repo wymaga Node 24.19.0. Ponowiłem odczyt tych samych artefaktów w wymaganym runtime i otrzymałem PASS, homepage 8191 B oraz legal 6446 B. Hashe plików nie zmieniły się. Różnicę wprowadziła implementacja gzip runtime. Nie jest to regresja kodu ani przebudowa przez innego agenta.
2. Zamknięte P2 w src/lib/analytics.ts. Przed poprawką, linie 71-79. Page_view znajduje się w warunku pierwszego załadowania całego kontenera. Gdy polityka dopuszcza measurement i marketing, pierwsza zgoda marketing-only ładuje kontener. Późniejsze włączenie measurement emituje consent-update, ale nie emituje ao_page_view. Reprodukcja korzystała z rzeczywistej funkcji createAnalytics wyodrębnionej z pliku i transpileModule TypeScript. Dwa wywołania z measurement false/marketing true i potem measurement true/marketing true dały jeden load i zero page_view. Rodzic oddzielił znacznik załadowania kontenera od znacznika page_view dokumentu. Ponowiłem tę samą reprodukcję na aktualnej funkcji. Marketing-only ma zero page_view. Dwa późniejsze zastosowania measurement dają dokładnie jeden page_view i jeden load. Niezależna kontrola źródła PASS. Rodzic dodał test zachowania do tests/unit/analytics.test.ts. Pełny verify nowego testu trwa. Błąd nie uruchamia niedozwolonego pomiaru na obecnych stronach, ponieważ polityka zwraca null.

## Pozostały zakres

Kod klienta wiąże receipt z originem, polityką, snapshotem, backendowym identyfikatorem i terminem. Pending ma pierwszeństwo przed receipt. Po przerwanym wycofaniu klient synchronizuje pełną odmowę. Focus zachowuje jedynie prywatnie zwalidowany, niezmieniony receipt podczas odczytu. Błędy przechodzą do DENIED. Wątek rewalidacji ma numer generation i odrzuca stare odpowiedzi.

Router przypisuje profile Oli po Origin i nie przyjmuje tenantId od klienta. Weryfikuje domenę zapisu, typ, kategorie, uiSource i listę pól. Profile staging i produkcja mają osobne tenantId oraz audience. Adapter legacy dokłada tenantId IS NULL do wszystkich używanych operacji, również w transakcji. Nie znalazłem w tym przeglądzie ścieżki pomijającej te granice. Nie powtarzałem testów PostgreSQL ani live, wyniki 16 SQLite i polityki oraz 1 PostgreSQL pochodzą z artefaktów rodzica.

Panel korzysta z tokenów 3a i natywnego dialogu. Przycisk akceptacji i odmowy mają tę samą klasę. Zmiana z-index na 14 rozdziela baner i menu. Rodzic dodatkowo odjął header-clearance od maksymalnej wysokości banera, aby jego przycisk zamknięcia nie trafił pod menu przy 320 px; test sticky teraz zamyka baner rzeczywistym przyciskiem przed kontrolą kotwic. Potwierdzenie zachowania należy do trwającego ponownego E2E, którego nie oznaczam jako PASS. Zamknięcie banneru ani dialogu nie zapisuje zgody.

Eksport GTM ma dwa natywne tagi googtag i gaawe. Oba są paused true, wymagają analytics_storage i rollout true, podczas gdy stała rollout ma false. Reguły dopuszczają wyłącznie host produkcji. Nie ma All Pages, niestandardowych szablonów ani dawnych tagów formularzy. Client loader jest wyłączony. Odbiór GA4, Meta, Clarity i publikacja pozostają osobnymi niedokończonymi krokami opisanymi w README.

Zwiększenie budżetu legal z 6 do 7 KiB dotyczy jednego szablonu. Globalny limit 32 KiB i limit homepage 8 KiB pozostały bez zmian. Wspólny panel wymaga CSS na stronach prawnych, a wcześniejszy wynik legal 6446 B przekraczał stary limit 6144 B o 302 B. Uzasadnienie dodatkowym panelem jest konkretne. Kontrola w wymaganym Node 24 przechodzi także dla homepage.

Audyt ma już wpisy decyzji, napraw, backendu, GTM oraz czerwonego E2E. Wpisy retrospektywne jawnie wymagają porównania z transkryptem rodzica. Zapis 6447 B opisuje wcześniejszy build. Aktualny build daje 6446 B w Node 24. Końcowy wynik należy dopisać po zakończeniu verify. Workflow nie deklaruje ukończonego stagingu lub pomiaru.

Komentarze. Nie usuwałem żadnych komentarzy w trybie tylko odczyt. Jedyna wskazana lokalna supresja prefer-rest-params chroni wymagany przez zewnętrzną kolejkę Google obiekt Arguments i dotyczy reguły stylistycznej. Brak nowych MUST KILL w sprawdzonym zakresie. Wcześniejsze usunięcia należą do osobnego przeglądu rodzica.

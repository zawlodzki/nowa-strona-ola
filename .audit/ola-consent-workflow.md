# Przebieg implementacji zgód Oli

- [x] Read the Principles section of poteto-mode.
- [x] Phase A: Frame.
- [x] Phase B: Design the workflow. Ground, Sketch, Agree.
- [ ] Phase C: Run the loop. Implement, Scrap when necessary.
- [x] Odczytać stan serwera i potwierdzić osobny profil z izolacją obsługiwanych endpointów.
- [x] Dodać panel 3a i klienta c15t oraz bramkę Consent Mode, bez opcjonalnych żądań przed zgodą.
- [x] Przygotować nowy workspace GTM bez starych tagów i danych zdrowotnych.
- [x] Sprawdzić staging i dokumenty prawne, wykonać pełne verify i odbiór UI/sieci.
- [x] Phase D: Keep the audit trail.
- [ ] Phase E: Verify and hand back.

Odbiór zaliczony, gdy świeża przeglądarka i odmowa nie wysyłają opcjonalnych żądań, zgoda działa tylko dla osobnej domeny i dopuszczonej strony, cofnięcie zatrzymuje pomiar, panel zachowuje obsługę klawiatury i 320 px, a npm run verify przechodzi. Integracja nie może zmienić zgód zawlodzki.pl. Rygor obejmuje test separacji API, testy zachowania oraz niezależny przegląd. Checkpoint przepustowości po izolacji backendu: określić pozostałe bramki i usuwać blokady przed publikacją. Ryzyko to niezweryfikowane tenant API 2.2.1 i istniejące dowody zgód.

Stan na 11.10.2026 po wdrożeniu backendu i przed wdrożeniem strony.
Testy izolacji handlerów i polityki dały 16 PASS w SQLite, a test PostgreSQL
1 PASS. Próba live potwierdziła odmowę dostępu między profilami. Backend
jest healthy z obrazem `2.2.1-ola-20261011-2`. Workspace GTM 5 zawiera dwa
wstrzymane tagi. Nie zmieniono wersji opublikowanej.

Checkpoint po backendzie wskazał pozostałe kontrole strony i GTM.
Pełny verify zakończył E2E wynikiem 381 PASS i 9 FAIL przez nakładanie banera
na sticky menu i kotwice. Poprawka jest w kodzie, reverify pozostaje otwarte.
Brak wdrożenia nowego klienta na staging, końcowego odbioru UI/sieci,
zatwierdzonej allowlisty neutralnych treści i odbioru usług pomiarowych.
Phase C pozostaje otwarta do zakończenia tych kontroli. Phase D wymaga
porównania uzupełnionego logu z transkryptem rodzica i niezależnego przeglądu.

Końcowy odbiór stagingu 11.10.2026 PASS. Node 24.19.0, 280 unit,
393 E2E i Content Lake PASS. Panel i preferencja motywu wdrożone
wersją 960b9749-6cb0-4bb4-bc40-bdd2e56fc636. Próba live przez UI
z syntetycznym subjectem potwierdziła trzy decyzje i zero opcjonalnych
żądań. Sprawdzono desktop, dark, 320 px, CSS zoom 200% i reduced motion.
Natywnego zoomu ani czytnika ekranu nie sprawdzono.

Phase C i E w zakresie całego pomiaru pozostają otwarte. GTM jest wstrzymany,
a neutralne treści, odcisk runtime i konfiguracja usług nie są odebrane.
Lista cookies i polityka prywatności 2.2 są opublikowane w CMS. Odbiór
HTML i Markdown bez JS oraz przy 320 px PASS; staging z dokumentami ma
wersję e2f08fed-3779-4b72-9617-f3a05a031bfa. Backend i staging klienta
są wykonane. Audyt jest niezależny, lecz z tej samej rodziny modelu; część
zapisu odtworzono retrospektywnie. Sprostowania są append-only.

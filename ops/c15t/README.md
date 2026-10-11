# Rozdzielenie zgód Oli w istniejącym c15t

Nakładka na stack c15t 2.2.1 z projektu `vps ovh`. Backend pozostaje poza aplikacją Astro. Pliki zastępują lub uzupełniają te same ścieżki w stacku. Zachować jego package.json, package-lock.json, widget, klucz podpisujący i bazę. Nie uruchamiać migracji z tablePrefix, ponieważ może zmienić nazwy istniejących tabel.

Stary profil zachowuje rekordy z tenantId IS NULL. Ola używa tenantów ola-production i ola-staging. Origin wybiera profil po stronie serwera. Nie ma nowego konta ani drugiej bazy. Retencja Oli zachowuje historię subjectu do 36 miesięcy od ostatniej decyzji; retencja starego profilu pozostaje bez zmiany.

Sprawdzenie na Node24 w katalogu kompletnego stacku:

```sh
npm run check
npm run build:server
npm test
TEST_DATABASE_URL=postgresql://postgres@postgres/ola_consent_isolation_test node --test tests/postgres-isolation.test.mjs
```

Ostatni test wymaga wyłącznie pustej, odrębnej bazy o dokładnie wskazanej nazwie. Nigdy nie podawać produkcyjnego DATABASE_URL. Test migracji i zapisu działa na prawdziwym PostgreSQL, nie na danych klientek. Brak TEST_DATABASE_URL oznacza jawne pominięcie tego testu, nie zaliczenie.

Wdrożenie wymaga chronionej kopii źródeł, dumpu DB i zachowania poprzedniego obrazu, a następnie zbudowania przypiętego obrazu z tej nakładki. Nie zmieniać Caddy ani udostępniać bazy poza prywatną siecią. Dowody i aktualny stan wdrożenia są w docs/PROGRESS.md głównego repo.

## Wdrożenie 11.10.2026

Na VPS działa `zawlodzki/c15t:2.2.1-ola-20261011-2`. Źródła nakładki
zapisano w `/opt/stacks/c15t`; katalog lokalny projektu `vps ovh` nie został
w tej sesji zsynchronizowany. Przed przyszłym buildem z tego katalogu trzeba
zastosować tę nakładkę i zmiany z `dependencies.json`, regenerując lockfile
kompletnego stacku. Hono 4.13.13 i brace-expansion 2.1.7 są przypięte także
w zależnościach backendu. Audyt runtime wdrożonego obrazu dał zero podatności.

Backup źródeł, poprawny dump PostgreSQL i `.env.before` są w chronionym
`/opt/stacks/update-backups/20261011-ola-c15t`. Pierwszy dump był pusty przez
błędny wybór roli; zastąpiono go poprawnym i sprawdzono przed wdrożeniem.
Poprzedni obraz `zawlodzki/c15t:2.2.1-1` pozostaje dostępny do przywrócenia.
Przywrócenie kodu wymaga ustawienia poprzedniego `C15T_IMAGE` i odtworzenia
wyłącznie usługi backend. Nie przywracać bazy automatycznie wraz z kodem,
ponieważ skasowałoby to decyzje zapisane po backupie.

Testy handlerów i polityki dały 16 PASS, osobny test PostgreSQL 17.10 dał
1 PASS. Kontener i prywatną sieć testową usunięto po kontroli. Produkcyjnej
bazy, Caddy i pozostałych usług nie restartowano. Hash widgetu zawlodzki.pl
`cmp-v1.js` pozostał identyczny. Nowe profile nie udostępniają dodatkowych
endpointów administracyjnych ani nie zmieniają uprawnień operatora.

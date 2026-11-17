# Zmiany Oli z Google Drive, 17.11.2026

## Zakres

Źródło: współdzielony dysk Dietetyka, folder `nowa strona ola`, zmiany
z 16.11.2026. Paleta „Cegła i zieleń”: tło #fffffc, cegła #99312f,
brzoskwinia #fcefe8 i zielone CTA #7ec850 z tekstem #16300a. Jasne sekcje
i stopka pozostają. Przeniesiono tokeny, zastosowania, kolory OG i testy.

Sanity zawiera pięć szkiców PL: odświeżone Badania, Suplementy i Szczupła
oraz nowe Jedzenie i Trądzik. Każdy kosztuje 97 zł i ma status `planned`.
Dodano mapowanie dwóch nowych slugów. Zachowano treści Oli, rozdziały,
materiały, okładki i pary pakietów. Dane pochodzą z CMS, nie z fixture’ów.
Nie opublikowano szkiców ani nie aktywowano sprzedaży.

## Weryfikacja

Gałąź `codex/ola-drive-release` na `origin/main` @ `2de4fb1`, trwały worktree
`/Users/grzesiek/.codex/worktrees/ola-drive-release/nowa strona ola`.
Nie zawiera wcześniejszych zmian monitora publikacji użytkownika.

- Node 24.22.3: format, tokeny, lint, typy, 783 unit, buildy i budżety PASS.
- `npm run verify`: 393 E2E Chromium/WebKit PASS, 26 pominiętych;
  Firefox 205 błędów startu profilu na macOS 27. To nie jest zielony pełny
  przebieg verify. Testy Firefox wymagają wykonania w CI przed scaleniem.
- Osobny `test:content-lake`: 21 stron zgodnych, SEO 40 stron PASS.
- Symulacja pięciu aktualnych szkiców: własna walidacja schematów 5/5 PASS;
  statyczny build 46 stron PASS. PNG z CMS przetwarzane do WebP przez Astro.
- Odbiór pięciu landingów × 1440/320 px × light/dark: 20/20 bez błędów axe,
  brak przepełnienia przy CSS zoom 200%, widoczne obrazy załadowane, klawiatura
  otwiera dialog, Escape zamyka i przywraca fokus. Reduced motion włączone.
- Bez JavaScript: 5/5 czytelnych H1 i bez przepełnienia na 320 px.
- Obejrzano pełny landing Trądziku na desktopie i Jedzenia na 320 px.
  Nie wykonano pełnego ręcznego oglądu wszystkich zrzutów, natywnego zoomu,
  czytnika ekranu ani fizycznego telefonu. Testy nie wysyłały zgłoszeń.

Dowody: `.audit/ola-drive/` w worktree (verify, Content Lake, lokalny build)
oraz `.audit/ola-drive-20261117/` w pierwotnym repo (szkice, zrzuty i
`review-results.json`). Pierwsze dowody w `/tmp` utracono po przerwie sesji;
powyższy odbiór landingów ponowiono i zapisano trwale.

## Copy nowych landingów

Audyt dotyczy sposobu komunikacji, nie niezależnej recenzji medycznej książek.
Nie dopisywano historii autorki ani nowych obietnic. Cytaty pochodzą ze szkiców.

| Zasada                     | Jedzenie                                                | Trądzik                                                                                  | Ocena                                                |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Mały krok i wynik          | „Jedna karta. Twój tydzień jedzenia.” — próbka          | „Jedna mapa. Trzy objawy.” — próbka                                                      | Częściowo: konkretny, ograniczony rezultat           |
| Problem i prosty mechanizm | „Cztery zasady zostają. Resztę możesz odpuścić.” — hero | „Dlatego zaczynasz od mapy: który objaw, która metoda, kiedy sprawdzić efekt.” — problem | Użyta                                                |
| Bliski pierwszy wynik      | „Teraz wystarczy ją uporządkować.” — dla kogo           | „Wpisujesz ją do mapy objawów i idziesz z nią dalej.” — dla kogo                         | Częściowo: pierwszy krok bez obietnicy terminu       |
| Empatia                    | „To nie jest brak silnej woli.” — problem               | „Nie robiłaś za mało.” — problem                                                         | Użyta                                                |
| Uznanie wysiłku            | „To użyteczna wiedza.” — dla kogo                       | „Każda wcześniejsza próba to informacja” — dla kogo                                      | Użyta                                                |
| Osobista historia          | Brak                                                    | Brak                                                                                     | Pominięta: brak zatwierdzonej historii               |
| Mniej oczywisty wgląd      | „Mniej zasad. Więcej powtarzalnych posiłków.” — efekty  | „Większość metod działa. Każda na coś innego.” — hero                                    | Częściowo: kierunek myślenia, bez pozornej tajemnicy |

## Blokady i następny krok

Podpis commita przez skonfigurowany `op-ssh-sign` nie powiódł się:
`failed to fill whole buffer`, również z jawnym socketem agenta. Nie wyłączano
podpisu. Nie ma commita, push, PR, scalenia ani publikacji kodu.

Odczyt n8n potwierdził tylko listę Suplementów (ID 4). Badania, Szczupła,
Jedzenie i Trądzik zwróciłyby `waitlist_not_configured`. Zadano pytanie
o podłączenie list; n8n i formularze CMS pozostają niezmienione.

Następnie: zatwierdzić podpis w 1Password, push/PR i zielone CI Linux;
wdrożyć kod przed publikacją nowych dokumentów. Po rozwiązaniu list
opublikować najpierw Jedzenie i Trądzik, potem pozostałe szkice, z ponowną
kontrolą rewizji i referencji. Odebrać publiczne strony i katalog.

Modern Web Guidance: automatyczna kontrola odrzuciła wykonanie
nieprzypiętego pakietu `@latest`. Zastosowano istniejące lokalne kontrole
kontrastu i axe; brak nowych zaleceń z tego narzędzia.

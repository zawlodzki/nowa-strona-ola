# Strony prawne

Użytkownik czyta polskie dokumenty z fixture’ów. Tytuł jest H1. Pod nim jest wersja i data obowiązywania. Stopka linkuje regulamin, politykę, listę cookies, regulamin newslettera i odstąpienie od umowy. Zgoda newslettera na stronie głównej linkuje regulamin newslettera.

## Sub-features

- `legal-privacy` otwiera `/polityka-prywatnosci/` z H1 „Polityka prywatności aleksandraolesiewicz.com” i wersją 2.3 z 13.10.2026. W treści jest zdanie, że Google Tag Manager uruchamia Google Analytics 4 dopiero po zgodzie analitycznej.
- `legal-cookies` przechodzi z polityki linkiem „Lista cookies i identyfikatorów” i wraca linkiem „Politykę prywatności”. Wersja listy to 2.3 z 13.10.2026.
- `legal-terms` otwiera `/regulamin/` w wersji 2.3 z 10.10.2026.
- `legal-newsletter` otwiera `/regulamin-newslettera/` w wersji 2.1 z 10.10.2026.
- `legal-withdrawal` otwiera `/odstapienie/` z H1 „Odstąpienie od umowy”.

## How to get to it (user POV)

- Stopka, nawigacja „Informacje prawne”.
- Z polityki odnośnik „Lista cookies i identyfikatorów”.
- Strona główna, informacja pod przyciskiem newslettera.

## Driving it with verify-ola

```sh
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /polityka-prywatnosci/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Polityka prywatności aleksandraolesiewicz.com"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wersja 2.3 · obowiązuje od 13.10.2026"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Google Tag Manager uruchamia Google Analytics 4 wyłącznie po potwierdzonej zgodzie analitycznej, a piksel Meta po potwierdzonej zgodzie marketingowej. Google Consent Mode działa w trybie podstawowym: przed zgodą nie ładujemy narzędzi opcjonalnych ani nie wysyłamy sygnałów do Google. Microsoft Clarity pozostaje wyłączony; nie nagrywamy sesji ani treści ekranu."
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Lista cookies i identyfikatorów"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Lista cookies i identyfikatorów aleksandraolesiewicz.com"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wersja 2.3 · obowiązuje od 13.10.2026"
node .cursor/skills/verify-ola/scripts/verify.mjs browser click --role link --name "Politykę prywatności"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Polityka prywatności aleksandraolesiewicz.com"
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /regulamin/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Regulamin sprzedaży e-booków i świadczenia konsultacji dietetycznych online — aleksandraolesiewicz.com"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wersja 2.3 · obowiązuje od 10.10.2026"
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /regulamin-newslettera/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Regulamin newslettera i materiałów bezpłatnych — aleksandraolesiewicz.com"
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --text "Wersja 2.1 · obowiązuje od 10.10.2026"
node .cursor/skills/verify-ola/scripts/verify.mjs browser snapshot --aria --path legal/newsletter.aria.txt
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path legal/newsletter.png
node .cursor/skills/verify-ola/scripts/verify.mjs browser goto --path /odstapienie/
node .cursor/skills/verify-ola/scripts/verify.mjs browser expect --role heading --name "Odstąpienie od umowy" --exact
node .cursor/skills/verify-ola/scripts/verify.mjs browser screenshot --path legal/withdrawal.png
```

Link zgody newslettera na `/` sprawdza przepis formularza newslettera, z `--nth 0`, bo ta sama nazwa jest też w stopce.

## Gotchas

- H1 regulaminów zawierają pauzę z treści fixture’a. Komenda musi podać ten znak.
- „liście cookies” w treści polityki to inny link niż „Lista cookies i identyfikatorów”. Przepis klika dłuższą nazwę.
- Publiczne `/en/privacy/` nie istnieje. 404 EN sprawdza `language.md`.
- Stopka zawiera listę cookies, regulamin newslettera i odstąpienie od umowy.

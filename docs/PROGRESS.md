# Postęp wdrożenia

Aktualizacja: 2026-09-16. Specyfikacja: [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md).
Hosty i deploy: [CLOUDFLARE-DEPLOYMENT.md](CLOUDFLARE-DEPLOYMENT.md).

## Aktualny etap

Etapy 1–4 zamknięte: kod, fixture’e i trasy zweryfikowane lokalnie.
Dataset `production` nadal ma stare dokumenty `page` (tytuł/lead, bez sekcji).
Etapy 5–7 otwarte.

Produkcja: apex `aleksandraolesiewicz.com` (`www` → 301), kolejki, webhooki
Sanity, GitHub Actions (`Quality`, `Publish content`). Podgląd za Access.
Formularz nadal 501; n8n i c15t poza repo.

## Następny krok

1. Wgrać demonstracyjne strony, ustawienia, artykuły i powiązania do Sanity
   najpierw jako szkice, żeby nie odpalać webhooków produkcji. Potem
   sprawdzić handshake Presentation.
2. Etap 5: serializacja Markdown, canonical, hreflang, sitemap i JSON-LD.
3. Nie testować n8n. Nie dodawać `www` jako custom domain Workera.

## Blokady

Handshake Presentation szkicu w podglądzie nie sprawdzony.
Publikacja landingów z Studio do Content Lake pozostaje do zrobienia.

Po sesji aktualizować tylko ten etap i następny krok. Nie wklejać sekretów.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Istniejąca aplikacja produkcyjna: Astro + TypeScript, Sanity, Cloudflare Workers. **Ten rekord dotyczy mockupów strony głównej** (`mocks/homepage/`): samodzielny HTML+CSS+minimalny JS, otwierany offline albo z fontami z CDN. Nie przepisujemy stron Astro ani schematów CMS.

## Users

Kobiety szukające dietetyki klinicznej — głównie PCOS, insulinooporność i (osobny segment) perimenopauza / skład ciała po 40. Kupują e-booki i umawiają indywidualne konsultacje online. Publiczność Instagrama: [aleksandra_olesiewicz](https://www.instagram.com/aleksandra_olesiewicz).

## Product Purpose

Profesjonalna strona dietetyczki **Aleksandry Olesiewicz**: sprzedaż e-booków dietetycznych i indywidualnych konsultacji online. Sukces: zaufanie kliniczne, jasna oferta, przejście do e-booka albo rezerwacji konsultacji.

## Positioning

Nie kolejny jadłospis. Mechanizm: **decyzja zamiast dokładek** — co zostawić, co odstawić, czego nie kupować; w perimenopauzie: skład ciała zamiast ścigania wagi. Kompetencja dietetyka klinicznego, bez obietnic medycznych (hormony, ciąża, „wyleczenie PCOS”).

## Operating Context

Mapa serwisu (kontekst, nie zakres tego zadania): Home, O mnie, regulaminy, polityka prywatności, blog, landing e-booka, lista e-booków, **strona rezerwacji konsultacji**. Home jest punktem wyboru kierunku wizualnego dla Grześka.

## Capabilities and Constraints

- Mockupy: trzy samodzielne HTML, bez Astro/Sanity/CMS.
- V1 dziedziczy istniejący Wonderful design system (tokeny, Switzer, język wizualny bieżącej strony).
- V2, V3 i V4 to **inne** światy wizualne dla tej samej treści, na **białym płótnie**. Kierunek od zera ustala skill `design-taste-frontend` (v2). Impeccable najwyżej poleruje, nie projektuje greenfield.
- Treść po polsku. Responsywność desktop + mobile. Działające slidery.
- Partnerzy jako wordmarki tekstowe: ALAB Laboratoria, UNS, Norsan, Norsa Pharma, Omni-Biotic.
- Sekrety i dane zgłoszeń nie trafiają do mockupów.
- **Otwarte:** dokładna liczba klientek, ceny konsultacji, finalne tytuły e-booków.

## Brand Commitments

- Nazwa: Aleksandra Olesiewicz. Wordmark Gambarino (outline SVG), krój strony Switzer (Fontshare, ITF FFL).
- Głos: profesjonalny, konkretny, bez wellnessowego hype’u i bez obietnic klinicznych.
- V1: paleta i rytm Wonderful (neutral, lekki display, oszczędny pomarańcz).
- Publiczność: kobiety. Instagram jest referencją tożsamości, nie szablonem layoutu.

## Evidence on Hand

- Research e-booków (PCOS suplementy jako pierwszy produkt; perimenopauza / skład ciała). Tytuły i ton z researchu, **nie** obietnice kliniczne.
- Portrety w `src/assets/portraits/` (hero, about, contact) — wygenerowane, zaakceptowane do użycia na stronie; nie są dokumentacją sesji fotograficznej.
- Logo: `src/assets/brand/`.
- **Nie wymyślać:** recenzji klinicznych, wyników badań, „wyleczeń”, ocen gwiazdkowych, niepotwierdzonych liczb sprzedaży. Cytaty i metryki w mockupach są **placeholderami** do podmiany.

## Product Principles

1. Kompetencja kliniczna bez kostiumu szpitala i bez kostiumu „wellness goddess”.
2. Obietnica behawioralna: decyzja, protokół, narzędzie — nie wynik medyczny.
3. Ta sama treść we wszystkich trzech kierunkach, żeby porównać wygląd, nie ofertę.
4. Treść czytelna bez JS; reduced motion zostawia kompletny stan.
5. Partnerstwa i dowód społeczny niosą zaufanie; nie zastępują oferty.

## Accessibility & Inclusion

Treść widoczna bez JS. Kontrast tekstu. Cele dotykowe ~44 px. Reduced motion. Publiczność to kobiety; język polski, bez paternalizowania i bez wstydu za ciało.

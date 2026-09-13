# Ocena Lumos i bejamas/ui

Data analizy: 2026-09-12. Próba zakończona 2026-09-13 — [wyniki](UI-SPIKE-RESULTS.md).
Poniżej pierwotna ocena dokumentacji; aktualna rekomendacja wynika z próby.
Analiza dokumentacji i publicznych repozytoriów; bez testu integracji lub pomiaru
bundla. Obowiązujący design system Wonderful i architektura pozostają bez zmian.

## Wniosek

Bejamas/ui warto wykorzystać selektywnie jako bazę techniczną komponentów Astro.
Lumos traktować jako inspirację do organizacji CSS, bez wdrażania całego systemu.
Żadne z narzędzi nie zastępuje modeli Sanity, serializerów Markdown, SEO,
backendu leadów ani c15t.

## Lumos

To system przygotowany do pracy w Webflow. Dokumentacja organizuje zmienne
według ról: kolory, motywy, typografia, szerokości i odstępy. Warto przejąć
zasadę semantycznych tokenów i oddzielenia wyglądu tekstu od poziomu nagłówka.
Nasza dokumentacja Wonderful już pokrywa znaczną część tych potrzeb.

Przeniesienie całego Lumos oznaczałoby adaptację konwencji Webflow i uzgadnianie
ich z istniejącymi tokenami. Nie dostarcza natywnych komponentów Astro ani modelu
sekcji Sanity. Koszt adaptacji przewyższa spodziewaną korzyść w tym projekcie.

Podany adres lumosframework.com/docs nie został odczytany przez narzędzie WWW;
sprawdzono dokumentację autorów w Notion i oficjalne repo Lumos v2.

Źródła: [dokumentacja autorów](https://timothyricks.notion.site/Lumos-Framework-v2-2-0-6d1139068f7442d49494ec3b581cf09d),
[zmienne](https://timothyricks.notion.site/Variables-28e2df07d1a480ae8ab8e3009d71aa08),
[repo](https://github.com/lumosframework/lumos-v2).

## Bejamas/ui

Komponenty Astro kopiowane do własnego projektu, z Tailwind CSS v4. Statyczne
elementy nie potrzebują runtime React. Interakcje korzystają z osobnych zależności
@data-slot; nie należy interpretować hasła zero-JS jako dotyczącego całej biblioteki.
Skopiowany kod utrzymujemy sami; zależności interakcji aktualizujemy i testujemy.
Repo jest na licencji MIT; przy kopiowaniu zachować wymagane informacje licencyjne.

Najbardziej użyteczne: pola i stany formularzy, breadcrumbs, przyciski, dialog,
menu i tabs. Dla prostego FAQ rozważyć natywne details/summary. Hero, sekcje
ofertowe, układ artykułu i animacje narracyjne budujemy według Wonderful.
Panel zgód nadal należy do integracji c15t — nie tworzyć drugiego systemu zgód.

Warunek wdrożenia: mapowanie tokenów Tailwind na istniejące zmienne Wonderful,
bez kopiowania domyślnego motywu. Sprawdzić konflikty globalnego resetu CSS.
Nie przyjmować przykładu Astro Actions jako powodu zmiany ustalonego /api/leads.

Źródła: [wprowadzenie](https://ui.bejamas.com/docs/introduction),
[instalacja](https://ui.bejamas.com/docs/installation),
[zasady i interakcje](https://ui.bejamas.com/docs/design-principles),
[repo i licencja](https://github.com/bejamas/ui),
[przykład formularzy](https://ui.bejamas.com/docs/forms-astro-actions).

## Proponowana próba przed przyjęciem

Po utworzeniu Astro sprawdzić trzy reprezentatywne elementy: przycisk, zestaw
pól formularza i dialog. Dostosować do Wonderful, sprawdzić wygląd PL/EN,
klawiaturę, fokus, reduced motion, HTML bez JS i koszt skryptów w buildzie.
Ocenić także ponowną inicjalizację podczas odświeżania podglądu Sanity.

Jeżeli dostosowanie i Tailwind dają realną oszczędność, kopiować tylko potrzebne
komponenty. Jeśli koszt adaptacji jest porównywalny z własną implementacją,
pozostać przy Astro i istniejącym CSS, rozważając osobno wybrane @data-slot.
Do czasu tej próby nie deklarować zgodności WCAG ani konkretnego wpływu na wydajność.

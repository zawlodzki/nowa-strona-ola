# Źródła i metoda

Badanie: 12.09.2026, działająca witryna Wonderful, Chromium. Odczyt stylów przez `getComputedStyle`, reguł przez CSSOM, animacji przez `document.getAnimations()`, obserwacja screenshotów i wybranych interakcji. Stronę główną otwarto również przez narzędzie web.

Nie jest to audyt całej domeny. Reprezentatywna próba obejmuje 14 różnych URL-i. Strona główna i kontakt dodatkowo zbadane przy 390×844 px. Warianty tabletowe opisane z CSS, nie wszystkie wyrenderowane. Podstrony Press, Legal, pozostałe branże i Trust Center były widoczne jako linki; nie przypisano im pomiarów.

Źródła pierwotne: [about-us](https://www.wonderful.ai/about-us), [agents](https://www.wonderful.ai/agents), [ai-os](https://www.wonderful.ai/ai-os), [artykuł](https://www.wonderful.ai/blog-articles/ote), [banking](https://www.wonderful.ai/industries/banking), [blog](https://www.wonderful.ai/blog), [careers](https://www.wonderful.ai/careers), [contact](https://www.wonderful.ai/contact), [deployment](https://www.wonderful.ai/deployment), [ai-gateway](https://www.wonderful.ai/ai-gateway), [healthcare](https://www.wonderful.ai/industries/healthcare), [home](https://www.wonderful.ai/), [ai-transformation](https://www.wonderful.ai/ai-transformation), [systems](https://www.wonderful.ai/systems). Surowe zrzuty CSSOM i PNG nie są przechowywane w repozytorium.

## Granice wierności

Dokładne czasy odzyskano dla punktów, etykiet, typewritera, impulsu i shimmeru. Timingi przejść menu, hover, reveal, liczników i formularza są rekomendacją, jeśli MOTION.md nie mówi inaczej. Nie odtworzono prywatnego projektu Framer, pełnego źródłowego grafu komponentów ani wszystkich stanów. Referencyjna implementacja nie obejmuje zewnętrznych integracji, CMS i wysyłki formularzy.

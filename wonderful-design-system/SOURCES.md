# Źródła i metoda

Badanie: 12.09.2026, działająca witryna Wonderful, Chromium. Odczyt stylów przez `getComputedStyle`, reguł przez CSSOM, animacji przez `document.getAnimations()`, obserwacja screenshotów i wybranych interakcji. Stronę główną otwarto również przez narzędzie web. Wszystkie linki poniżej są źródłami pierwotnymi.

Nie jest to audyt całej domeny. Reprezentatywna próba obejmuje 14 różnych URL-i. Strona główna i kontakt dodatkowo zbadane przy 390×844 px. Warianty tabletowe opisane z CSS, nie wszystkie wyrenderowane. Podstrony Press, Legal, pozostałe branże i Trust Center były widoczne jako linki; nie przypisano im pomiarów.

| Próbka / URL źródłowy | Viewport pomiaru | Dowód lokalny | Aktywne animacje w chwili odczytu |
|---|---|---|---|
| [about-desktop](https://www.wonderful.ai/about-us) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/about-desktop.json) | 4 |
| [agents-desktop](https://www.wonderful.ai/agents) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/agents-desktop.json) | 1 |
| [ai-os-desktop](https://www.wonderful.ai/ai-os) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/ai-os-desktop.json) | 100 |
| [article-desktop](https://www.wonderful.ai/blog-articles/ote) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/article-desktop.json) | 1 |
| [banking-desktop](https://www.wonderful.ai/industries/banking) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/banking-desktop.json) | 2 |
| [blog-desktop](https://www.wonderful.ai/blog) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/blog-desktop.json) | 0 |
| [careers-desktop](https://www.wonderful.ai/careers) | 1440×900 CSS px | [DOM/CSS/WAAPI](evidence/careers-desktop.json) | 70 |
| [contact-desktop](https://www.wonderful.ai/contact) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/contact-desktop.json) | 1 |
| [contact-mobile](https://www.wonderful.ai/contact) | 390×844 CSS px | [DOM/CSS/WAAPI](evidence/contact-mobile.json) | 1 |
| [deployment-desktop](https://www.wonderful.ai/deployment) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/deployment-desktop.json) | 2 |
| [gateway-desktop](https://www.wonderful.ai/ai-gateway) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/gateway-desktop.json) | 1 |
| [healthcare-desktop](https://www.wonderful.ai/industries/healthcare) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/healthcare-desktop.json) | 1 |
| [home-desktop](https://www.wonderful.ai/) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/home-desktop.json) | 97 |
| [home-mobile](https://www.wonderful.ai/) | 390×844 CSS px | [DOM/CSS/WAAPI](evidence/home-mobile.json) | 68 |
| [strategy-desktop](https://www.wonderful.ai/ai-transformation) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/strategy-desktop.json) | 2 |
| [systems-desktop](https://www.wonderful.ai/systems) | 1440×780 CSS px | [DOM/CSS/WAAPI](evidence/systems-desktop.json) | 1 |

## Interpretacja dowodów

- `headings`, `textSamples`, `components`, `named`: geometria i style elementów. Współrzędne są zależne od scrolla i momentu animacji. Próbki tekstu są skrócone.
- `rules`: reguły CSS dostępne przez CSSOM, również nieaktywne warianty/breakpointy i style integracji zewnętrznych. Deklaracja tokenu nie dowodzi zastosowania.
- `animations`: aktywne animacje CSS/WAAPI. `iterations:null` w serializowanym JSON może oznaczać Infinity. Brak animacji nie wyklucza JavaScript, wideo lub zakończonego wejścia.
- `media`: widoczne video/canvas w chwili odczytu; pusty wynik nie wyklucza mediów w iframe lub późniejszego montażu.
- `colors`: surowy inwentarz; dziedziczone/domniemane kolory wrapperów nie muszą być widocznym kolorem marki.
- Screenshoty mają różny DPR. Porównywać geometrię w CSS px, nie samą liczbę pikseli PNG.
- Wybrane zrzuty obejmują widget cookies, który zasłania część headera. Menu sprawdzono po odrzuceniu cookies. Nie wysyłano formularza kontaktowego.
- `careers-desktop.png` pochodzi z wcześniejszego widoku 500 px; jego nazwa została skorygowana na `careers-500px.png`. Aktualny JSON careers-desktop pochodzi z 1440×900 px.

## Granice wierności

Dokładne czasy odzyskano dla punktów, etykiet, typewritera, impulsu i shimmeru. Timingi przejść menu, hover, reveal, liczników i formularza są rekomendacją, jeśli MOTION.md nie mówi inaczej. Nie odtworzono prywatnego projektu Framer, pełnego źródłowego grafu komponentów ani wszystkich stanów. Referencyjna implementacja nie obejmuje zewnętrznych integracji, CMS i wysyłki formularzy.

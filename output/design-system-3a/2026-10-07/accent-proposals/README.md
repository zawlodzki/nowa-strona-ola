# Dodatkowy akcent systemu 3a

Data: 07.10.2026. Status: wybrana matcha z 1a (#53671B / #D8E78A); wdrożenie w kodzie otwarte.

Wizualizacje powstały w narzędziu image_gen na podstawie istniejącego katalogu
[3a](../catalog-light-1440.png). Są koncepcjami rastrowymi; tokeny i aplikacja
nie zostały zmienione. Wiśnia pozostaje kolorem głównym.

| Wariant | Akcent  | Ciemny tekst | Jasne tło | Wizualizacja          |
| ------- | ------- | ------------ | --------- | --------------------- |
| Oliwka  | #B8C58A | #465331      | #F0F3E5   | [PNG](01-olive.png)   |
| Morela  | #ECAF88 | #75452D      | #FBEEE5   | [PNG](02-apricot.png) |
| Błękit  | #9BB9CF | #36566E      | #EBF2F7   | [PNG](03-blue.png)    |

Użytkownik odrzucił oliwkę i poprosił o matchę (07.10.2026).
Nowa [wizualizacja matcha](04-matcha.png): akcent #A8C686, tekst #354A2B,
jasne tło #EEF4E7. Matcha pozostaje propozycją, bez akceptacji i wdrożenia.
Obejrzano również czwarty wynik; zachowuje wiśniową bazę i dodaje świeższą zieleń.
We wszystkich propozycjach akcent pokazano w dodatkowym przycisku,
podkreśleniu nagłówka oraz tle portretu i palecie. Obejrzano wszystkie trzy
wyniki; generowanie wprowadza drobne różnice w typografii i portrecie, dlatego
obrazy nie stanowią wiernego zrzutu działającej aplikacji ani wzorca tożsamości.
Kontrole mobile, klawiatury, 320 px, zoomu 200% i reduced motion nie dotyczą
rastrowych propozycji; wymagane po wdrożeniu wybranego wariantu.

## Prompty

Tryb: wbudowany image_gen, edycja lokalnego obrazu referencyjnego.
Poniżej pełne prompty przekazane do narzędzia.

### Oliwka

```text
Use case: precise-object-edit / ui-mockup. Input image is the EDIT TARGET: actual Polish design system 3a webpage screenshot. Produce a faithful high-fidelity edited visualization of this exact screen. Preserve exact layout, white background, all existing Polish copy, typography, burgundy brand name, burgundy main heading, portrait identity and clothing, cherry primary button. Keep screenshot frame 1440x900 landscape; no browser chrome or floating dev toolbar. Add ONE complementary secondary accent color as specified. Change only portrait panel background from pink to the specified PALE color; change the outlined secondary button "Zobacz karty" to a solid ACCENT background with DARK text and arrow and no outline; add a narrow ACCENT underline below the words "3a" in the headline without shifting it. At the bottom replace the partially visible color swatches with a COMPLETE compact palette row inside the existing lower space, seven rounded rectangle swatches with small labels: white #FFFFFF, cherry #70283F, primary #882F48, pink #F2DCE3, ACCENT, DARK, PALE. Labels must be clearly legible. In the space above palette replace the catalog decision sentence with variant title and three proposed hex values. Preserve main CTA and all nav links in cherry. This is an additional accent, not a rebrand. No added cards, illustrations, gradients, textures, shadows, or decorations. Output the edited image only.
Variant title (verbatim): "01 · Oliwka". ACCENT #B8C58A; DARK #465331; PALE #F0F3E5. Show these exact hex codes in the palette.
```

### Morela

```text
Use case: precise-object-edit / ui-mockup. Input image is the EDIT TARGET: actual Polish design system 3a webpage screenshot. Produce a faithful high-fidelity edited visualization of this exact screen. Preserve exact layout, white background, all existing Polish copy, typography, burgundy brand name, burgundy main heading, portrait identity and clothing, cherry primary button. Keep screenshot frame 1440x900 landscape; no browser chrome or floating dev toolbar. Add ONE complementary secondary accent color as specified. Change only portrait panel background from pink to the specified PALE color; change the outlined secondary button "Zobacz karty" to a solid ACCENT background with DARK text and arrow and no outline; add a narrow ACCENT underline below the words "3a" in the headline without shifting it. At the bottom replace the partially visible color swatches with a COMPLETE compact palette row inside the existing lower space, seven rounded rectangle swatches with small labels: white #FFFFFF, cherry #70283F, primary #882F48, pink #F2DCE3, ACCENT, DARK, PALE. Labels must be clearly legible. In the space above palette replace the catalog decision sentence with variant title and three proposed hex values. Preserve main CTA and all nav links in cherry. This is an additional accent, not a rebrand. No added cards, illustrations, gradients, textures, shadows, or decorations. Output the edited image only.
Variant title (verbatim): "02 · Morela". ACCENT #ECAF88; DARK #75452D; PALE #FBEEE5. Show these exact hex codes in the palette.
```

### Błękit

```text
Use case: precise-object-edit / ui-mockup. Input image is the EDIT TARGET: actual Polish design system 3a webpage screenshot. Produce a faithful high-fidelity edited visualization of this exact screen. Preserve exact layout, white background, all existing Polish copy, typography, burgundy brand name, burgundy main heading, portrait identity and clothing, cherry primary button. Keep screenshot frame 1440x900 landscape; no browser chrome or floating dev toolbar. Add ONE complementary secondary accent color as specified. Change only portrait panel background from pink to the specified PALE color; change the outlined secondary button "Zobacz karty" to a solid ACCENT background with DARK text and arrow and no outline; add a narrow ACCENT underline below the words "3a" in the headline without shifting it. At the bottom replace the partially visible color swatches with a COMPLETE compact palette row inside the existing lower space, seven rounded rectangle swatches with small labels: white #FFFFFF, cherry #70283F, primary #882F48, pink #F2DCE3, ACCENT, DARK, PALE. Labels must be clearly legible. In the space above palette replace the catalog decision sentence with variant title and three proposed hex values. Preserve main CTA and all nav links in cherry. This is an additional accent, not a rebrand. No added cards, illustrations, gradients, textures, shadows, or decorations. Output the edited image only.
Variant title (verbatim): "03 · Błękit". ACCENT #9BB9CF; DARK #36566E; PALE #EBF2F7. Show these exact hex codes in the palette.
```

### Matcha

```text
Use case: precise-object-edit / ui-mockup. Edit target: the provided actual Polish design system 3a screenshot. Produce one faithful edited webpage visualization in landscape 1440x900. Preserve white background, burgundy typography, exact Polish wording, layout, logo and cherry primary CTA, portrait identity and clothing. Add a fresh true MATCHA GREEN secondary accent: #A8C686, dark text #354A2B, pale background #EEF4E7. Matcha must read distinctly fresh green, NOT yellow olive, khaki, brown, grey sage, teal or mint. Change portrait panel background to pale matcha #EEF4E7. Change outlined secondary CTA "Zobacz karty" to solid matcha #A8C686 with dark #354A2B text and arrow. Add thin matcha underline under "3a" in heading. Keep cherry primary CTA. At bottom in existing space replace catalog sentence with "04 · Matcha" and subtitle "Akcent #A8C686 · Tekst #354A2B · Tło #EEF4E7". Show complete compact seven-swatch palette labelled white #FFFFFF, cherry #70283F, primary #882F48, pink #F2DCE3, matcha #A8C686, dark #354A2B, pale #EEF4E7. Preserve airy spacing. Remove floating dev toolbar. No gradients, shadows, textures, new illustrations, or new sections. Keep portrait precisely unchanged. Flat screenshot, not device mockup.
```

## Decyzja i delikatny akcent z 1a — 07.10.2026

Użytkownik wskazał historyczne #53671B / #D8E78A. Wcześniejsza propozycja
#A8C686 została zastąpiona. Hero zachowuje różowe tło portretu; secondary
button ma białe wnętrze i zieloną obwódkę. Drobne detale grafik pokazano
w pasku zastosowań. [Nowa plansza](05-matcha-1a-subtle.png) została obejrzana.
Kod i tokeny pozostają bez zmian. Pełna mapa użycia wymaga opracowania.

### Prompt: delikatna matcha z 1a

```text
Use case: precise-object-edit / ui-mockup. Edit the provided Polish design system 3a screenshot to demonstrate subtle use of the EXACT historical matcha palette from variant 1a. Preserve the exact original hero layout, WHITE page background, PINK portrait panel #F2DCE3, portrait identity, clothing, burgundy logo/headings/body, cherry primary filled CTA and navigation. Matcha is ONLY a small accent, NEVER a hero background, card background, panel background or filled button. Matcha colors: #53671B on white; #D8E78A only on burgundy. Change ONLY secondary CTA "Zobacz karty" to white interior, thin 1px dark matcha #53671B border, matching dark matcha label and arrow. NO green underline under heading, NO new green hero decorations. Preserve portrait panel pink exactly. Remove floating developer toolbar. In the bottom 180px of the screenshot replace partially cropped swatches and catalog notes with a compact design-system usage strip titled "Matcha z 1a · drobny akcent". Below title show THREE small side-by-side examples, not large filled panels: (1) white outlined button "Zobacz karty" with dark matcha stroke, text and arrow; (2) a tiny abstract editorial diagram on white with burgundy nodes and ONLY ONE thin matcha connector and one small matcha dot, caption "Detal grafiki · #53671B"; (3) small burgundy sample graphic rectangle with one fine light matcha arrow and small star, caption "Na wiśni · #D8E78A". This lower strip is illustrative palette guidance, not new website content. No textures, gradients, shadows, colorful backgrounds or recoloring photos. White and cherry dominate 95% of interface. Crisp Polish typography, faithful flat screen visualization, landscape 1440x1000. Output one image only.
```

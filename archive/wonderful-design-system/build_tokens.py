import json
from pathlib import Path
P=Path(__file__).parent
data=json.loads((P/'tokens.json').read_text())
css=['/* O=odczyt, R=adaptacja. Szczegóły pochodzenia w tokens.json. Font files not bundled. */',':root {']
for group,items in data.items():
 if not isinstance(items,dict):continue
 for k,t in items.items():
  if isinstance(t,dict) and 'value' in t:css.append(f'  --wf-{group}-{k}: {t["value"]};')
css+=['  --wf-bg: var(--wf-color-white);','  --wf-fg: var(--wf-color-ink);','  --wf-gutter: 24px;','  --wf-section: 64px;','  --wf-display-size: 42px;','  --wf-heading-size: 34px;','  --wf-card-size: 24px;','}', '[data-theme="dark"] { --wf-bg: var(--wf-color-black); --wf-fg: var(--wf-color-paper); }', '@media(min-width:880px) { :root { --wf-gutter:40px; --wf-section:96px; --wf-display-size:64px; --wf-heading-size:42px; --wf-card-size:22px; } }', '@media(min-width:1200px) { :root { --wf-section:120px; --wf-display-size:82px; --wf-heading-size:48px; } }', '@media(min-width:1440px) { :root { --wf-gutter:60px; --wf-card-size:32px; } }']
(P/'tokens.css').write_text('\n'.join(css)+'\n')
rows=[]
for f in sorted((P/'evidence').glob('*.json')):
 d=json.loads(f.read_text()); rows.append(f'| [{f.stem}]({d["url"]}) | {d["viewport"][0]}×{d["viewport"][1]} CSS px | [DOM/CSS/WAAPI](evidence/{f.name}) | {len(d["animations"])} |')
(P/'SOURCES.md').write_text('''# Źródła i metoda

Badanie: 12.09.2026, działająca witryna Wonderful, Chromium. Odczyt stylów przez `getComputedStyle`, reguł przez CSSOM, animacji przez `document.getAnimations()`, obserwacja screenshotów i wybranych interakcji. Stronę główną otwarto również przez narzędzie web. Wszystkie linki poniżej są źródłami pierwotnymi.

Nie jest to audyt całej domeny. Reprezentatywna próba obejmuje 14 różnych URL-i. Strona główna i kontakt dodatkowo zbadane przy 390×844 px. Warianty tabletowe opisane z CSS, nie wszystkie wyrenderowane. Podstrony Press, Legal, pozostałe branże i Trust Center były widoczne jako linki; nie przypisano im pomiarów.

| Próbka / URL źródłowy | Viewport pomiaru | Dowód lokalny | Aktywne animacje w chwili odczytu |
|---|---|---|---|
'''+ '\n'.join(rows)+'''

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
''')
old=P/'evidence/careers-desktop.png'
if old.exists():old.rename(P/'evidence/careers-500px.png')
print('Generated tokens and sources:',len(rows),'samples')

import json,re
from pathlib import Path
P=Path(__file__).parent
colors={'white':'#ffffff','paper':'#fafafa','surface':'#f5f5f5','line':'#e6e6e6','ink':'#171719','body':'#393939','muted':'#6b6b6b','black':'#080808','deep':'#050505','accent':'#fc762f','error':'#ff3f3f','error-bg':'#ffecec','success':'#03a97e','success-bg':'#f0fdf2','error-text':'#b42318','success-text':'#067647'}
data={'$schemaNote':'Autorski JSON tokenów; nie deklaruje zgodności z konkretną wersją DTCG. O=odczyt, R=rekomendacja.','color':{k:{'value':v,'status':'R' if k.endswith('-text') else 'O','source':'DESIGN-SYSTEM.md §2; evidence/home-desktop.json rules/colors'} for k,v in colors.items()},'space':{str(v):{'value':f'{v}px','status':'R','note':'Skala uporządkowana na podstawie odstępów źródłowych'} for v in [4,8,12,16,24,32,48,64,96,120,180]},'radius':{str(v):{'value':f'{v}px','status':'R'} for v in [4,8,10,12,999]},'font':{'display':{'value':'"ABC Favorit Light", Arial, sans-serif','status':'O family / R fallback'},'body':{'value':'Inter, Arial, sans-serif','status':'O family / R fallback'},'mono':{'value':'"IBM Plex Mono", monospace','status':'O family / R fallback'}},'layout':{'gutter-mobile':{'value':'24px','status':'O home'},'gutter-tablet':{'value':'40px','status':'O home'},'gutter-desktop':{'value':'60px','status':'O wide home'},'content':{'value':'1200px','status':'O'},'wide':{'value':'1680px','status':'O'},'article':{'value':'600px','status':'O article'}},'motion':{}}
for k,v,status in [('press','100ms','R'),('hover','180ms','R'),('panel','250ms','R'),('reveal','600ms','R'),('stagger','70ms','R'),('dot-in','450ms','O'),('dot-out','1400ms','O'),('box-in','220ms','O'),('panel-in','340ms','O'),('type-in','550ms','O'),('type-out','350ms','O'),('panel-out','272ms','O'),('box-out','176ms','O'),('cycle','17050ms','O: próbka 1440px'),('beam','6000ms','O'),('breath','3000ms','O'),('shimmer','5000ms','O')]:data['motion'][k]={'value':v,'status':status}
data['ease']={k:{'value':v,'status':'O'} for k,v in {'out-expo':'cubic-bezier(.16,1,.3,1)','out-quint':'cubic-bezier(.22,1,.36,1)','in-out':'ease-in-out','linear':'linear'}.items()}
(P/'tokens.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
css=['/* O=odczyt, R=adaptacja. Szczegóły pochodzenia w tokens.json. Font files not bundled. */',':root {']
for group,items in data.items():
 if not isinstance(items,dict):continue
 for k,t in items.items():css.append(f'  --wf-{group}-{k}: {t["value"]};')
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

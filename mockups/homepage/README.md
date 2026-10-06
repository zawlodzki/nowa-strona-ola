# Homepage Aleksandry Olesiewicz: trzy kierunki

Samodzielne mockupy HTML przygotowane 2026-10-05 przed wyborem finalnej estetyki.
Nie są podłączone do Astro ani CMS. Wszystkie strony mają `noindex,nofollow`.

## Oglądanie

Sprawdzona komenda z katalogu głównego repo, na Node 24:

```sh
node scripts/preview-homepage-mockups.mjs
```

Otwórz [porównanie](http://127.0.0.1:8766/mockups/homepage/index.html).
Serwer działa tylko na `127.0.0.1:8766` i udostępnia wyłącznie makiety oraz
potrzebne publiczne zasoby. Nie udostępnia plików środowiska ani źródeł aplikacji.
Zatrzymanie: Ctrl+C.

Można również otworzyć [index.html](index.html) bezpośrednio z dysku.
Zachowaj położenie katalogu w repo: zdjęcia, znak marki, Switzer i tokeny
Wonderful są współdzielone przez ścieżki względne.

| Kierunek                                 | Charakter                                              | Różnice kompozycji                                                                           |
| ---------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| [01: Wonderful](wonderful.html)          | Lekki Switzer, biel, czerń i mały pomarańczowy detal   | Hero z tekstem po lewej, ciemny rozdział z efektami, neutralne okładki, płaskie powierzchnie |
| [02: Botaniczny magazyn](botanical.html) | Szałwia, leśna zieleń, redakcyjna Georgia w nagłówkach | Portret po lewej w łuku, wycentrowana biblioteka, otwarte cytaty, spokojny rytm              |
| [03: Wiśniowa energia](cherry.html)      | Róż, wiśnia, mocniejszy Switzer, miękkie powierzchnie  | Asymetryczna rama portretu, różne grupy efektów pacjentek, wyraziste okładki i cytaty        |

Dwa alternatywne kierunki są celowo odseparowane w lokalnych CSS mockupów.
Powstały na polecenie użytkownika z użyciem `design-taste-frontend`.
Nie zmieniają tokenów Wonderful ani stylów produkcyjnych. Wariant 01 korzysta
bezpośrednio z istniejącego `wonderful-design-system/tokens.css`.
Switzer pozostaje głównym krojem interfejsu wszystkich propozycji.
Georgia w kierunku 02 jest dostępnym systemowo krojem redakcyjnym; nie dodano
zewnętrznych fontów ani zależności.

## Warianty z białym tłem i wordmarki — 2026-10-06

- [2a: botaniczny magazyn na białym tle](botanical-white.html).
- [3a: wiśniowa energia na białym tle](cherry-white.html).

Warianty `2a` i `3a` współdzielą układ, treści, zdjęcia, okładki i wordmarki
z wersjami `02` i `03`. Jedyna różnica wizualna to `--bg: #ffffff` w jasnym
podglądzie. Kolorowe panele sekcji i tła okładek pozostają bez zmian.
Ciemny podgląd zachowuje paletę wersji bazowej. Nadpisanie jest w jednym
lokalnym [pliku CSS](white-background.css).

Nowe wordmarki są w nagłówkach i stopkach czterech alternatywnych makiet:

- `02 / 2a`: Georgia Regular dla imienia, Georgia Italic dla nazwiska,
  dwie linie i spokojny rytm dopasowany do redakcyjnych nagłówków.
- `03 / 3a`: Switzer o wadze 750, małe litery, zwarty układ w dwóch liniach,
  dopasowany do mocnej typografii strony.

To edytowalne wordmarki tekstowe z dostępną nazwą marki. Działają bez JS,
korzystają z istniejącego oficjalnego Switzera oraz systemowej Georgii
bez pobierania dodatkowego fontu. Ich reguły są w [wordmarks.css](wordmarks.css).
Znak Gambarino w kierunku Wonderful oraz zasoby marki aplikacji zachowano.
Porównanie i dolny przełącznik obejmują wszystkie pięć makiet.

## 1a: Wonderful z kolorystyką 3a — 2026-10-06

[Otwórz wersję 1a](wonderful-cherry.html). Układ, lekki Switzer, zdjęcia,
kształty i obrysy logo Gambarino pochodzą z wersji Wonderful. Białe główne tło,
wiśniowy tekst i akcenty oraz różowe powierzchnie korzystają z palety 3a.
Dawne czarne sekcje mają wiśniowe tło, a okładki używają kolorów 3a.
Kontrastowy akcent matcha uzupełnia wiśnię i róż: `#53671b` na jasnych
powierzchniach, `#d8e78a` na wiśniowych i w ciemnym podglądzie. Wyróżnia
znaczniki, znak `+`, cytaty, strzałki i drugorzędne CTA hero.
Kolor logo zmieniono przez maskę istniejącego SVG bez modyfikacji jego obrysów.
Ciemny podgląd używa ciemnej palety 3a. Wszystkie nadpisania są odseparowane
w [wonderful-cherry.css](wonderful-cherry.css); produkcyjny design system
pozostaje bez zmian. Porównanie i przełącznik obejmują sześć makiet.

## Zakres i zachowanie

Każdy homepage zawiera navbar, hero z dwoma CTA, pięć logotypów, sekcję efektów,
O mnie, sześć e-booków, konsultacje, opinie, newsletter i stopkę z social mediami.

- E-booki: trzy całe karty w widoku desktop, dwie na tabletach, jedna z fragmentem
  następnej na mobile. Sterowanie przyciskami, natywnym przewijaniem i klawiaturą.
- Opinie: natywne przewijanie oraz przyciski. Brak automatycznego przewijania.
- Menu mobilne: natywne `details`, Enter/Space, Escape i powrót fokusu na trigger.
- Formularz sprawdza e-mail i checkbox lokalnie; komunikat nie udaje zapisu.
  Nie ma żądań POST, zapisu w pamięci przeglądarki, usług newslettera ani analityki.
  Bez JS pola i przycisk są wyłączone, co zapobiega przypadkowemu GET z danymi.
- Treść i wszystkie sześć kart są w HTML, dostępne bez JS.
- Ciemny podgląd respektuje ustawienie systemu. Przycisk motywu zmienia go ręcznie.
- Reduced motion wyłącza przejścia oraz płynne przewijanie.
- Odnośniki do przyszłych podstron, produktów i social mediów otwierają lokalny
  [ekran objaśniający](podglad.html), zamiast błędu 404 lub pozorowanego zakupu.

## Treści i status

### Poprawki po przeglądzie Impeccable — 2026-10-06

Po akceptacji użytkownika wdrożono poprawki we wszystkich sześciu makietach:

- Strzałki i przycisk motywu korzystają ze spójnych SVG z `currentColor`,
  bez glifów zależnych od fontu platformy. Dostępne nazwy kontrolek zachowano.
- Biblioteka ma wejścia PCOS / Perimenopauza; przewijają do odpowiedniej grupy,
  aktualizują `aria-current` i działają jako odnośniki również bez JS.
  Na desktopie nadal widoczne są trzy karty.
- Hero nazywa dietetykę dla kobiet; nagłówki i bio wskazują zakres oferty.
  Nie dopisano kwalifikacji, liczby pacjentek ani potwierdzonych wyników.
- Okładki mają motywy kart decyzji, organizacji badań, odżywiania, ośmiotygodniowej
  obserwacji, dwunastotygodniowego dziennika i rytmu wieczoru. Fotografia jedzenia
  pozostała na materiale o odżywianiu. Motywy są propozycją projektu okładek.
- W 03/3a sekcje marek i opinii mają otwarte powierzchnie; palety i fonty zachowano.
- Powiększono przypisy do 13 px, usunięto nadtytuły homepage i dekoracyjne numery
  efektów. Na mobile przełącznik makiet jest po stopce, aby nie zasłaniać treści.

Kontrola na Node 24: `npm run verify` PASS (57 unit, 33 E2E). Osobno makiety:
Chromium/Firefox/WebKit, sześć wersji, 320/390/768/1440 px, klawiatura grup,
Home/End i Escape, reduced motion i brak JS; axe w Chromium dla jasnego/ciemnego
motywu bez naruszeń. Publiczny smoke potwierdził sześć stron, SVG, grupy,
200% CSS zoom, zasoby, nagłówki i brak wysyłania formularza. Natywny zoom,
czytnik i fizyczne urządzenie pozostają do kontroli.

[Raport przed poprawkami](../../docs/HOMEPAGE-DESIGN-REVIEW.md).

Dwa dokumenty użytkownika z 2026-09-13 zawierają po trzy koncepcje PCOS
oraz perimenopauzy. W bibliotece uwzględniono wszystkie sześć zgodnie z briefem:

1. Suplementy w PCOS.
2. PCOS: badania, które mają sens.
3. Szczupła, a jednak PCOS.
4. Waga Cię okłamuje.
5. Czy to już? 12 tygodni zamiast zgadywania.
6. Noc zaczyna się o osiemnastej.

Research rekomenduje po jednej koncepcji w każdej grupie; obecność wszystkich
sześciu w makietach nie jest oceną ich gotowości do sprzedaży. Tytuły na okładkach
są skrócone redakcyjnie. Około 100 zł to robocza kwota z researchu, nie finalna cena.
Nie dodano klinicznych obietnic efektu ani fikcyjnych kwalifikacji Aleksandry.

**Do podmiany:** liczba `500+`, przykładowe efekty i wszystkie opinie.
Oznaczono je w widocznej treści. Współprace z markami pochodzą z briefu;
przed użyciem produkcyjnym trzeba potwierdzić finalną listę.
Zgoda newsletterowa jest tekstem do makiety, a polityka prywatności i regulamin
nie są dokumentami prawnymi. Social media wymagają podania potwierdzonych profili.

## Publiczny feedback

Opublikowano 2026-10-06: [porównanie sześciu makiet](https://design.aleksandraolesiewicz.com/)
oraz [bezpośrednio 1a](https://design.aleksandraolesiewicz.com/1a).

Osobny Worker `ola-homepage-mockups-feedback`, środowisko `feedback`,
konfiguracja [mockups/wrangler.jsonc](../wrangler.jsonc). Nie używa CMS,
bindingów, sekretów, formularzy backendowych ani Workera obecnej strony.

Przygotowanie i publikacja na istniejącym koncie Cloudflare:

```sh
node scripts/build-homepage-feedback.mjs
npx wrangler deploy --config mockups/wrangler.jsonc --env feedback --dry-run
npx wrangler deploy --config mockups/wrangler.jsonc --env feedback
```

Artefakt `build/homepage-feedback/` zawiera wyłącznie HTML/CSS/JS makiet,
potrzebne obrazy, znak marki, oficjalny font z licencją i tokeny Wonderful.
Skrypt sprawdza lokalne odnośniki przed pakowaniem. Dokumentacja, research,
sekrety i źródła aplikacji nie są publikowane.

`robots.txt`, meta `noindex` i nagłówek `X-Robots-Tag` ograniczają indeksowanie;
nie stanowią ochrony dostępu. Podgląd jest publiczny, aby zbierać feedback
bez logowania. CSP blokuje zewnętrzne połączenia i wysyłanie formularzy.
Stan rzeczywistej publikacji i kontrole: [PROGRESS.md](../../docs/PROGRESS.md).

## Materiały

- [Wybrane portrety i ich pochodzenie](../../src/assets/portraits/README.md).
- [Istniejący znak marki](../../src/assets/brand/README.md).
- [Oficjalny Switzer i licencja](../../src/assets/fonts/switzer/README.md).
- [Fotografia kulinarna](assets/food-editorial.webp): wygenerowana w tej sesji
  przez wbudowany image_gen, eksport WebP do makiet. Oryginał pozostał w lokalnym
  katalogu generated_images. Użycie na okładkach jest propozycją wizualną,
  nie finalnym projektem sześciu produktów.

Oficjalne logotypy pobrano 2026-10-05; CSS pokazuje wariant monochromatyczny.
Źródła:

- [ALAB laboratoria](https://www.alab.pl/logos/alab-laboratoria.svg).
- [UNS](https://uns.pl/themes/classic/images/uns_logo.png).
- [NORSAN](https://norsan-omega.pl/wp-content/themes/udi/images/logo.png).
- [Norsa Pharma](https://norsapharma.com/sklep/wp-content/uploads/2024/01/NorsaPharma_LogoHorizontal_Black_500px.png).
- [OMNi-BiOTiC](https://omni-biotic.pl/wp-content/uploads/2022/12/logo-OMNi-BiOTiC-logo.png).

## Kontrole

Wyniki i zakres kontroli tej sesji: [PROGRESS.md](../../docs/PROGRESS.md).
Screenshoty i lokalne raporty QA są w `output/homepage-mockups/2026-10-05/`
oraz `output/homepage-mockups/2026-10-06/`.
Pełny odbiór produkcyjny, czytnik ekranu, natywny zoom i fizyczne urządzenie
pozostają odrębnymi kontrolami po wyborze kierunku.

## Copy 3a — 2026-10-06

Wersja [3a](cherry-white.html) otrzymała copy po przeglądzie FIRMA i poprzedniego
repo `ola-homepage`: specjalizacja PCOS/IO, opis podejścia i osobistego doświadczenia,
pojedyncze konsultacje, zapowiedzi sześciu e-booków oraz sześć prawdziwych opinii
potwierdzonych przez użytkownika. Cytaty zachowują pełne brzmienie i anonimowy podpis
„Opinia o dotychczasowej współpracy”; nie są przedstawiane jako rezultaty jednej wizyty.
Usunięto robocze liczby/ceny, pas niepotwierdzonych relacji z markami i Facebook/TikTok.
Dopasowanie typografii dłuższego copy: [3a-copy.css](3a-copy.css), wyłącznie w 3a.
Pozostałe pięć wersji zachowuje wcześniejsze treści. Szczegóły:
[copy i decyzje](../../docs/HOMEPAGE-COPY-3A.md).

Sprawdzony podgląd lokalny: `node scripts/preview-homepage-mockups.mjs`, następnie
`http://127.0.0.1:8766/mockups/homepage/cherry-white.html`. Ta aktualizacja nie została
opublikowana na subdomenie. Formularz, linki do produktów i konsultacji nadal są demonstracyjne.

### Przywrócenie elementów i ceny

Na polecenie użytkownika z 2026-10-06 przywrócono belkę pięciu marek oraz
Facebook/TikTok. Cena każdej zapowiedzi e-booka: **97 zł brutto**.
Po kolejnej decyzji użytkownika wyróżnienie przy opisie podejścia:
**450+ — kobiet rocznie, którym pomagają moje konsultacje**.
Nowe copy i sześć opinii zachowano. Linki nadal prowadzą do ekranów makiety.

## Artykuł blogowy 3a — 2026-10-06

[Otwórz mockup artykułu](article-3a.html). Dziedziczy style, font, wordmark,
newsletter, stopkę i trzy okładki PCOS z homepage 3a. Ma breadcrumb, obraz główny,
obie daty, rich text, biogram oraz spis pięciu H2 po lewej i CTA newslettera
po prawej. Na mobile spis trafia przed tekst, a CTA pod autora.

Sprawdzona komenda podglądu: `node scripts/preview-homepage-mockups.mjs`.
Adres: `http://127.0.0.1:8766/mockups/homepage/article-3a.html`.
Treść i daty są przykładami redakcyjnymi, fotografia pochodzi z istniejących
zasobów makiet. Formularz korzysta z tej samej lokalnej demonstracji co homepage.
Indeks bloga w breadcrumb prowadzi do ekranu objaśniającego makiety.
[Konfiguracja CMS](../../docs/BLOG-CMS-CONFIG-3A.md) rozróżnia istniejące pola
od proponowanych referencji e-booków i newslettera. Bez publikacji i zmian CMS.

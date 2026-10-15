# Propozycje okładek bloga, 15.10.2026

Status: zestaw zaakceptowany i podmieniony na stronie 15.10.2026.
Wygenerowany wbudowanym narzędziem `image_gen`.
Użytkownik wskazał nastrojowe,
rozmyte grafiki a16z jako referencje. Obrazy mają kontrastować z białą stroną
i wiśniową typografią, zachowując związek z tematem wpisu.

| Wpis               | Plik                                       | Pomysł                                                                                         |
| ------------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Hirsutyzm          | [hirsutism-v1.png](hirsutism-v1.png)       | Profil kobiety i delikatne włoski w bocznym świetle; ciemna zieleń i bursztyn.                 |
| PCOS               | [pcos-v1.png](pcos-v1.png)                 | Trzy przesunięte szklane pętle jako metafora powiązanych rytmów hormonalnych i metabolicznych. |
| Wysoki testosteron | [testosterone-v1.png](testosterone-v1.png) | Probówki i załamane światło jako metafora odczytywania wyniku w kontekście.                    |

Format to około 16:9 bez napisów, z tytułem w HTML obok lub pod obrazem.
Pętle są metaforą, nie schematem diagnostycznym. Portret jest obrazem
wygenerowanej osoby, nie zdjęciem pacjentki ani właścicielki strony.

Pełne prompty: [prompts.json](prompts.json). Kierunek i mapowanie do istniejących
pól Sanity zapisano w [konfiguracji CMS](../../../docs/HOMEPAGE-CMS-CONFIG.md).

Pliki WebP do publikacji leżą obok PNG pod tymi samymi nazwami.
Trzy pliki wgrano do Sanity i podmieniono pole `image` każdego artykułu.
Zaktualizowano teksty alternatywne, rodzaj kadru i hotspoty. Poprzednich zasobów
nie usuwano. [Rejestr podmiany](cms-change.json) zawiera identyfikatory obu wersji.

Automatyczna publikacja produkcji
[38702850639](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38702850639)
zakończyła się sukcesem. Na publicznym blogu i we wszystkich trzech artykułach
sprawdzono ładowanie nowych obrazów na desktopie i przy 320 px. Brak poziomego
przepełnienia. Przy reduced motion obrazy pozostają widoczne.
Ręcznego natywnego zoomu 200%, czytnika i fizycznego telefonu nie sprawdzano.
Enter na odnośniku grafiki otwiera artykuł o hirsutyzmie.
Pełne `npm run verify` przeszło: 618 unit, 507 E2E i 12 świadomych pominięć GTM.
Symulacja Content Lake potwierdziła zgodność 17 stron z fixture’ami.

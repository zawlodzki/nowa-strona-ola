# Wspólne komponenty Astro

Implementacja: `src/design-system/components/`. Komponenty renderują HTML bez
hydratacji. Props są typowane; teksty i adresy przekazuje szablon/adapter treści.
Nie wpisywać testowych profili i niezatwierdzonych URL w komponentach.

| Komponent   | API / sloty                                                                                                   | Zastosowanie                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Container   | `measure: wide / reading`, HTML attrs, slot                                                                   | Szeroka lub czytelnicza kolumna                                |
| Section     | `surface: plain / soft`, `spacing: normal / compact`, HTML attrs                                              | Rytm sekcji; nie jest typem bloku CMS                          |
| Heading     | `as: h1/h2/h3`, `size: display/section/card/article`, HTML attrs                                              | Rozdziela semantykę od wielkości                               |
| Hero        | `title`, `description`, `kind: home/about/service/product`, `id`; slots `kicker`, `actions`, `media`, default | Wspólny szkielet hero; kadry pozostają w szablonie             |
| Button      | `as: a` + `href` lub native button, `variant: primary/secondary`, `arrow`, `loading`, HTML attrs              | CTA; domyślny button type=button, formularz jawnie type=submit |
| TextLink    | `href`, `arrow`, HTML attrs                                                                                   | Link liniowy z SVG                                             |
| ArrowIcon   | `direction: up-right/left/right`                                                                              | Jednolita dekoracyjna strzałka                                 |
| Wordmark    | `href`, `label`, HTML attrs                                                                                   | Znak Switzer z dostępną nazwą linku                            |
| SiteHeader  | `homeHref`, `links`, opcjonalne `cta`, `lang`                                                                 | Jeden header; globalne lub lokalne linki landingu              |
| SiteFooter  | `homeHref`, `description`, `links`, `socialLinks`, `legalLinks`, `copyright`, `lang`                          | Wspólna stopka; `links[].current` daje `aria-current`          |
| ThemeToggle | `label`                                                                                                       | Używany raz przez footer; systemowy motyw bez JS               |
| Breadcrumbs | `links: {href,label,current}[]`, `label`                                                                      | Ścieżka; ostatnia pozycja jest tekstem                         |
| Newsletter  | `id`, `title`, `description`, slot `form`                                                                     | Wygląd wspólny, wysyłka poza komponentem                       |
| FormField   | `id`, `label`, `hint`, `error`, input attrs                                                                   | Label, aria błędu, powiązania opisów                           |
| FaqItem     | `question`, `open`, default slot                                                                              | Natywny disclosure z treścią HTML                              |
| BookCover   | `title`, `subtitle`, `author`, `topic`, `tone: light/cherry`, slot `art`                                      | Front produktu; dekoracja, tytuł czytany z karty               |
| ContentCard | `title`, `href`, `description`, `metadata`, `actionLabel`, slots `media`, `price`                             | Wspólna karta e-booka/wpisu                                    |
| ReviewCard  | `author`, `context`, default slot                                                                             | Opinia z figure/blockquote/figcaption                          |
| Carousel    | unikalne `id`, `label`, `columns: 2/3`, `lang`, default slot                                                  | Karty, opinie, powiązane materiały; własny scroll              |
| Pagination  | `pages: {href,page,current}[]`, `label`, `pageLabel`                                                          | Prawdziwe adresy, bez zależności od JS                         |
| SplitPanel  | `labelledBy`, `id`, slots default/media                                                                       | Panel konsultacji i tekst–zdjęcie                              |

Dekoracje 3a (orbita, butelki, tło sceny, motywy okładek, znacznik, cień karty)
są w [`src/design-system/decorations/`](../src/design-system/decorations/),
jako SVG, nie jako kształty CSS. Hero ma opcjonalny slot `kicker` przed H1.

`NavigationLink` i `SocialLink`: [types.ts](../src/design-system/types.ts).
Komponenty niewymagające interakcji nie wysyłają JS. Header, Carousel i ThemeToggle
mają lokalne skrypty deduplikowane przez Astro. Komponent `BookCover` jest ukryty
przed czytnikiem, bo widoczny tytuł produktu jest już w ContentCard lub H1 landingu.
Nie używać samej dekoracyjnej okładki jako jedynej nazwy produktu.

## Przykład użycia

```astro
---
import Layout3a from "../design-system/Layout3a.astro";
import SiteHeader from "../design-system/components/SiteHeader.astro";
import Hero from "../design-system/components/Hero.astro";
import Button from "../design-system/components/Button.astro";
const navigation = settings.navigation; // adapter treści, nie dowolny CSS z CMS
---

<Layout3a lang="pl" title={page.title} description={page.description}>
  <SiteHeader homeHref="/" links={navigation} cta={page.headerAction} />
  <main id="main">
    <Hero title={page.heading} description={page.lead} kind="service">
      <Button slot="actions" as="a" href={page.action.href} arrow>
        {page.action.label}
      </Button>
      <img
        slot="media"
        src={page.image.src}
        alt={page.image.alt}
        width={page.image.width}
        height={page.image.height}
      />
    </Hero>
  </main>
</Layout3a>
```

Przykład API, nie kompletny adapter Sanity. Kompletne wykonywalne przykłady
są w [katalogu](../src/pages/design-system.astro). Wszystkie ID mają być unikalne.
`Layout3a` domyślnie utrzymuje noindex; head ma slot na docelowe canonical,
hreflang i JSON-LD. Nie wyłączać noindex tylko dlatego, że katalog jest gotowy.

## Granice abstrakcji

Nie wyodrębniać jednorazowych wykresów, dyplomu, orbit produktu i układów procesu
jako dowolnych bloków systemu. Zachować je w kontrolowanych szablonach.
Globalne CSS nie nadpisuje H2 każdego potomka sekcji: wspólny Heading dostaje klasę.
FormField nie jest page-builderem formularzy, a slot newslettera nie oznacza
podłączonego n8n. Paginacja wymaga rzeczywistych danych i tras.

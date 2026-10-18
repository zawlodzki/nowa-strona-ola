# Obiad do nakładki portretu

15.10.2026. Na prośbę użytkownika wygenerowano zdjęcie codziennego obiadu:
wątróbka z jabłkiem i cebulą, gotowane ziemniaki i ogórek kiszony.
Narzędzie: wbudowany image_gen. Obraz sprawdzony wizualnie po wygenerowaniu.
Plik: [liver-apple-onion.png](liver-apple-onion.png).
Propozycja do oceny; bez podmiany strony i bez zapisu do Sanity.

## Prompt

### Korekta v2, 15.10.2026

Użytkownik wskazał, że wątróbka ma być drobiowa, mniejsza i ciemniejsza.
Wykonano edycję w image_gen, obejrzano wynik. Aktualna propozycja:
[chicken-liver-apple-onion-v2.png](chicken-liver-apple-onion-v2.png).
Bez podmiany strony i Sanity.

Prompt edycji:

Edit only the liver in this food photograph. Replace the large flat light brown steak-like liver slices with realistic pan-fried CHICKEN LIVERS: noticeably smaller irregular rounded lobes and bite-sized pieces, approximately 2–4 cm, dark rich mahogany brown with deep brown seared surfaces, moist natural texture, fully cooked, not burnt or black. They must clearly look like poultry liver rather than sliced beef or pork liver. Preserve the sautéed apple wedges, golden onion strips, boiled potatoes with dill, fermented cucumber spears, ceramic plate, tabletop, camera angle, tight landscape composition, lighting and photographic realism. Keep everything else unchanged. No text or watermark.

### Pierwsza wersja

Use case: photorealistic-natural. Asset type: standalone landscape food photograph, 3:2 aspect ratio, intended for a small inset overlapping a dietitian portrait on a white editorial website. Generate only the photograph, no webpage or frame. Subject: an honest everyday Polish home-cooked lunch on one simple off-white ceramic dinner plate: pan-fried liver with soft golden onion strips and sautéed apple wedges, served alongside plain boiled potatoes and a fermented cucumber (ogórek kiszony), cut lengthwise into spears. Liver must look naturally browned and cooked, apple pieces distinguishable from onion, potatoes pale yellow with only a little dill. Appetizing, ordinary generous home portion, casually plated, not restaurant styled. Camera near overhead with a slight angle, close crop; the whole plate nearly fills the image with a narrow margin and all foods readable at thumbnail size. Simple light warm-grey kitchen tabletop, soft natural window light, true food textures and restrained natural colors. No additional dishes, no salads, no exotic garnishes, no people, no hands, no text, no logos, no watermark, no artificial shine, no dramatic studio lighting. Keep plate and all important ingredients in the central area safe for a slightly tighter crop.

## Podmiana, 15.10.2026

Użytkownik zaakceptował wersję v2 i zlecił podmianę oraz PR i push.
Plik wykonawczy: [home-meal.webp](../../../src/assets/editorial/home-meal.webp),
1536×1024, 273 536 B, WebP quality 85. Osobny klucz `home-meal`
obsługuje nakładkę. Klucz `food` nadal wskazuje poprzedni obraz używany
na okładkach i w przykładowych artykułach. Okładka żywieniowa homepage
korzysta teraz z własnego domyślnego obrazu, bez powiązania z nakładką.

Sanity `dyuqkn8c/production`: utworzono szkic `drafts.page-home-pl`
z opublikowanej rewizji `Hldtf1Ee54aeykZ46H9tbc`. Zmieniono wyłącznie
`sections[_key=="home-about"].secondaryMedia.rasterKey` na `home-meal`
i `secondaryMedia.alt` na opis dania. Rewizja szkicu po zmianie:
`UOs2f8XeFxg25W1kCvSiFw`. Przed edycją nie było szkicu tej strony.

Kolejność uruchomienia: scalić i wdrożyć PR, potem opublikować przygotowany
szkic po ponownym porównaniu rewizji. Nie publikować innych zmian strony.
Samo scalenie PR nie zmieni obrazu przy opublikowanym w CMS kluczu `food`.

## Publikacja, 15.10.2026

[PR 106](https://github.com/zawlodzki/nowa-strona-ola/pull/106) scalony
po zielonych obu kontrolach Quality. Commit main:
`14b13801a252e367bf994bcf6fd5aaafc54009bb`.
Po ponownym porównaniu opublikowanego dokumentu ze szkicem
opublikowano wyłącznie przygotowaną podmianę z warunkiem rewizji.
Nowa rewizja `page-home-pl`: `7tcFiCWOj02pVQeWbH2n96`, bez szkicu.

[Produkcja](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38718443896)
i [staging](https://github.com/zawlodzki/nowa-strona-ola/actions/runs/38718441996)
SUCCESS. Wersja produkcyjnego Workera: `5fb25e0f-bd1b-498f-8f7c-ffbc698391db`.

Na publicznej stronie obejrzano nakładkę na desktopie i w emulacji 320 px.
Obraz `home-meal.B1J7bjrN_znEFS.webp` załadowany, 1536×1024, właściwy alt,
bez poziomego przepełnienia. Okładka żywieniowa nadal używa `food-editorial`.
Formularzy nie używano. Natywnego zoomu, czytnika i fizycznego telefonu
nie sprawdzano ponownie. Dowód: `.audit/meal-production-20261015/result.json`,
zrzuty obejrzane w czacie. Zakres zakończony.

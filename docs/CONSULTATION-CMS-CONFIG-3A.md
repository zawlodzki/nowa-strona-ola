# Landing pojedynczej konsultacji 3a

Stan: 07.10.2026. [Mockup HTML](../mockups/homepage/consultation-3a.html),
[kompozycja CSS](../mockups/homepage/consultation-3a.css).
To lokalna propozycja wyglądu i copy, nie wdrożenie Astro, Sanity ani rezerwacji.
Bieżące decyzje wspólne: [HOMEPAGE-CMS-CONFIG.md](HOMEPAGE-CMS-CONFIG.md).

## Ustalenia i źródła

- Zlecenie 07.10.2026: landing sprzedażowy pojedynczej konsultacji, kolorystyka
  3a, atrakcyjna oprawa wizualna i dziesięć wskazanych części.
- Cena 450 zł, 60 minut, online oraz tymczasowy URL `https://cal.com`: decyzje
  użytkownika 06.10.2026. Nie określono rozliczenia podatkowego.
- Zakres bazowy z zaakceptowanego homepage: rozmowa o dostępnych wynikach,
  odżywianiu, codzienności, priorytetach i pierwszych zmianach. Nowe sformułowania,
  przebieg i FAQ są propozycją do oceny, nie potwierdzonym regulaminem usługi.
- PCOS/IO, osobiste doświadczenie PCOS: FIRMA `00_KONTEKST/marka.md`,
  `klienci.md` i poprzednie `ola-homepage/app/o-mnie/page.js`.
  Potwierdzone ukończenie dietetyki klinicznej na Śląskim Uniwersytecie Medycznym
  i 450+ kobiet rocznie pochodzą z decyzji użytkownika 06.10.2026.
- Pełne cytaty nr 4 i 6: `ola-homepage/data/testimonials.js`, wykorzystane już
  w homepage i potwierdzone przez użytkownika 06.10.2026. Podpis anonimowy,
  jawnie o dotychczasowej współpracy. Nie przypisywać jednej wizycie.
- Copy: wskazany przez użytkownika `10000000 Sales Copy Advice.md` z
  `CRM-delivery-framework/frameworks/writing/` oraz rejestr marki
  FIRMA `03_CONTENT/STRATEGIA/style-guide.md`.

Materiały FIRMA opisują także historyczny mentoring, planowane pakiety i
zawieszoną wcześniej ofertę. Są kontekstem, nie poleceniem zmiany aktualnej usługi.
Nie przeniesiono ich cen, czasu spotkań, aplikacji, list badań, jadłospisów,
stałej opieki, terminów dostępności ani prywatnych historii pacjentek.

## Układ i copy w mockupie

Navbar → hero → definicja problemu → dla kogo → jak wygląda konsultacja →
efekty → prowadząca → cena → opinie → FAQ → footer.
Dodatkowy blok prowadzącej wzmacnia zaufanie do osoby świadczącej usługę.

| Część      | Bieżący nagłówek / treść główna                                                                                                                        | Rola                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Hero       | „Wiesz już dużo. Ustal, co dalej.”                                                                                                                     | Uznaje dotychczasowy wysiłek; nazywa bliski, realistyczny rezultat.                          |
| Lead       | „Konsultacja dietetyczna 1:1 przy PCOS i insulinooporności. Przyjrzyjmy się Twojej sytuacji i wybierzmy pierwszy krok, który pasuje do Twojego życia.” | Oferta, odbiorczyni i korzyść w pierwszym ekranie.                                           |
| Problem    | „Tyle porad. A od czego zacząć?”                                                                                                                       | Sprzeczne ogólne porady; bez winy odbiorczyni.                                               |
| Dla kogo   | „Przyjdź z tym, co Cię zatrzymuje.”                                                                                                                    | Diagnoza bez kierunku, pytania mimo starań, dostępne wyniki, potrzeba jednego spotkania.     |
| Przebieg   | „60 minut. Cała uwaga na Tobie.”                                                                                                                       | Trzy kolejne etapy: historia → informacje → priorytety, bez niepotwierdzonych minut na etap. |
| Efekty     | „Wyjdź z kierunkiem. Zacznij po swojemu.”                                                                                                              | Rozumiem → wybieram → zaczynam. Rezultat rozmowy, bez gwarancji zdrowotnych.                 |
| Prowadząca | „Po drugiej stronie jest Ola.”                                                                                                                         | Rola, własne PCOS, wykształcenie i podejście.                                                |
| Cena       | „Jedno spotkanie. Twój kolejny krok.”                                                                                                                  | 450 zł / 60 minut; zakres i brak zobowiązania do pakietu.                                    |
| Opinie     | „Wysłuchana. Zrozumiana. Zaopiekowana.”                                                                                                                | Dwa pełne cytaty o wcześniejszej współpracy, bez ocen i fikcyjnych podpisów.                 |
| FAQ        | „Jeszcze kilka pytań?”                                                                                                                                 | Jedna wizyta, badania, jadłospis, oczekiwania, granice dietetyki i rezerwacja.               |

Pełne propozycje akapitów i sześciu odpowiedzi FAQ są w linkowanym HTML.
Przy przenoszeniu zachować je jako dane, nie tekst ukryty w CSS.
Wszystkie główne CTA: **„Zarezerwuj konsultację” → `https://cal.com`**.
Navbar przewija do ceny. Hero i cena prowadzą do tymczasowego celu wskazanego
przez użytkownika. Przy cenie i w FAQ jawny status niepodłączonego kalendarza.

Zastosowanie zasad poradnika: mały pierwszy krok zamiast pakietu; jasno pokazany
cel spotkania; zdjęcie i prawdziwy kontekst Oli; uznanie tego, co odbiorczyni już
zrobiła; brak obwiniania, straszenia i fałszywej pilności. Nie przeniesiono
dosłownie sugestii „natychmiastowego rozwiązania” na zdrowie.

## Wizualia i zachowanie

- Dziedziczenie palety `cherry.css` + `white-background.css`, oficjalnego
  Switzera, wordmarku, geometrii 3a i tokenów ruchu Wonderful.
- Zaakceptowane fotografie `hero.webp`, `contact.webp`, `about.webp`, bez
  retuszu i nowych materiałów; pochodzenie AI: [README portretów](../src/assets/portraits/README.md).
- Mapa pytań i celów rozmowy to semantyczny HTML i prosty diagram SVG/CSS.
  Nie przedstawia wyników pacjentki ani dokumentu dostarczanego w usłudze.
- Fotografia spotkania, trzy etapy i karta celów urozmaicają rytm. Opinie
  pozostają otwarte; nie dodano fikcyjnych avatarów, gwiazdek ani logotypów.
- Menu mobilne i FAQ: natywne `details/summary`, widoczna treść bez JS.
  Istniejący `interactions.js`: Escape/powrót fokusu menu oraz motyw systemowy.
  Reduced motion bez płynnego przewijania i przejść. Brak formularza,
  płatności, analityki i żądań integracyjnych.

## Mapowanie i rzeczywiste luki CMS

| Obszar           | Istniejące pola                                                    | Wymagane rozszerzenie po akceptacji                                                                                                                               |
| ---------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wspólna usługa   | `service.title`, `summary`, `slug`, język i powiązanie tłumaczenia | `price` number 450, `currency` PLN, `durationMinutes` 60, `bookingUrl`, status rezerwacji i zakres usługi. Bez kopiowania kwoty do wielu sekcji.                  |
| Strona           | `page.sections[]`, PL/EN                                           | Referencja do `service` oraz kontrolowany wariant landingu; treść z tych samych danych w HTML i Markdown.                                                         |
| Hero             | `heroSection.title`, `lead`, `primary`, `secondary`, `media`       | Kontrolowany wariant 3a z ceną/czasem z referencji usługi i podpisem prowadzącej; wymagane obecnie `eyebrow` uczynić opcjonalnym dla tego wariantu.               |
| Problem i efekty | `textImageSection`, `cardsSection` częściowo przechowują teksty    | Warianty semantycznego diagramu pytań oraz listy celów; bez dowolnego CSS i fałszywych plików do pobrania.                                                        |
| Dla kogo         | `cardsSection.title`, `lead`, `items[]`                            | Otwarty wariant tekstowy z czterema sytuacjami; obecnie items[].href i media wymagane, więc wariant potrzebuje walidacji dopuszczającej treść bez linków i zdjęć. |
| Przebieg         | `processSection.title`, `lead`, `steps[].title/body`               | Medium, opis przygotowania i kontrolowany układ zdjęcie + lista.                                                                                                  |
| Prowadząca       | `author` i `textImageSection`                                      | Wspólna referencja do osoby, wykształcenie i pojedynczy wskaźnik; nie tworzyć drugiej fikcyjnej liczby.                                                           |
| Cena             | `pricingSection.plans[].price/summary/features/action`             | Aktualnie min. 2 pakiety i cena jako string. Dodać wariant jednej usługi powiązany z `service`, bez drugiego pozornego pakietu.                                   |
| Opinie           | `testimonialsSection.items[]` → `testimonial.quote/name/role`      | Obecne `name` i `role` wymagane. Dodać wariant anonimowy, źródło i zakres opinii („dotychczasowa współpraca”), nie wymyślać imion.                                |
| FAQ              | `faqSection.title/lead/items[].question/answer`                    | Istniejący typ pokrywa sześć pytań; renderer wariantu 3a. JSON-LD ewentualnie z tych samych widocznych danych.                                                    |

Nie zmieniono schematów, Content Lake, GROQ, TypeGen, renderera Astro ani
serializerów. Przy przyszłej implementacji: walidacja HTTPS URL, dodatnia cena
i czas, zgodność PL/EN bez fallbacku PL, fixture, renderer HTML, serializer
Markdown każdego wariantu oraz błąd buildu dla nieznanego typu.

## Otwarte decyzje

- Właściwy URL wydarzenia i realna dostępność płatnej rezerwacji.
- Czy po spotkaniu jest pisemne podsumowanie. Pytanie zadano 07.10.2026;
  mockup nie obiecuje PDF, listy badań ani dodatkowej opieki.
- Finalne potwierdzenie przebiegu, FAQ, zakresu i zasad usługi. Copy jest propozycją.
- Zatwierdzenie landingu, następnie wdrożenie w Astro/Sanity i publikacja na
  osobne zlecenie. Lokalny mockup pozostaje `noindex,nofollow`.

Kontrole i następny krok: [PROGRESS.md](PROGRESS.md).

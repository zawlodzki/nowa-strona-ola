# „O mnie” 3a — E-E-A-T i granice weryfikacji

Data: 2026-10-07. Zakres: [lokalny mockup](../mockups/homepage/about-3a.html),
nie ocena pozycji w Google ani zamknięty odbiór produkcyjny.

## Podstawa oceny

Według [Google Search Central](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
najważniejsze jest zaufanie. E-E-A-T nie jest samodzielnym czynnikiem rankingowym;
treści zdrowotne wymagają szczególnej rzetelności. Dane o autorze powinny być
jednoznaczne i prawdziwe. Ten mockup pokazuje kwalifikacje, własne doświadczenie
i sposób pracy, zamiast dodawać deklaracje autorytetu bez dowodów.

[Dokumentacja ProfilePage](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
wymienia stronę „O mnie” autora bloga jako prawidłowe zastosowanie. W mockupie
`ProfilePage.mainEntity` to `Person`: Aleksandra Olesiewicz. Widoczne nazwisko,
rola i uczelnia odpowiadają JSON-LD. Noindex pozostaje; oznaczenie nie gwarantuje
wyniku rozszerzonego ani indeksacji.

## Ocena zastosowanych elementów

| Obszar                              | Wykonane                                                                                                                                                                                                     | Co pozostaje do potwierdzenia lub uzupełnienia                                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Experience — doświadczenie          | Własne doświadczenie PCOS, krótki osobisty kontekst, liczba 450+ kobiet rocznie zgodna z decyzją użytkownika.                                                                                                | Nie wymyślano scen ani chronologii. Szczegóły autobiografii wymagają redakcyjnego potwierdzenia. Liczba pochodzi od użytkownika, nie z niezależnego audytu.                               |
| Expertise — wiedza                  | Ukończona dietetyka kliniczna na Śląskim Uniwersytecie Medycznym, analiza sytuacji i posiłków, jawne miejsce na dyplom.                                                                                      | Uczelnię i kierunek potwierdził użytkownik. Skan jeszcze nie dostarczony; ramka nie jest dowodem dokumentowym. Nie dopisano stopnia akademickiego ani certyfikatów.                       |
| Authoritativeness — rozpoznawalność | Pełne imię, nazwisko i rola; link z biogramu artykułu; dwa pełne cytaty o rzeczywistej współpracy.                                                                                                           | To użyteczne sygnały profilu, nie niezależne potwierdzenie autorytetu. Brak zweryfikowanych publikacji zewnętrznych i branżowych wzmianek; nie tworzono ich.                              |
| Trust — zaufanie                    | Granice konsultacji dietetycznej, historyczny kontekst opinii, status e-booków, cena/czas konsultacji, jawnie tymczasowy Cal.com i demonstracyjny newsletter. Pochodzenie portretu AI widoczne przy obrazie. | Przed produkcją: realny kontakt, profile, polityka prywatności/regulamin, skan i właściwe wydarzenie płatnej rezerwacji. Profile i kontakt w mockupie prowadzą do ekranów objaśniających. |

## Decyzje dla treści i danych

- Strona buduje zaufanie do konkretnej osoby. Hero kieruje do podejścia i materiałów;
  dalej są e-booki, blog, konsultacja, kontakt i newsletter. To realizuje korektę
  użytkownika, który wcześniej pomylił ją z podstroną konsultacji.
- Osobiste doświadczenie PCOS nie stanowi dowodu skuteczności klinicznej.
  Specjalizacja pozostaje PCOS/IO. Perimenopauza to temat materiałów, bez
  dopisywania nowych kwalifikacji.
- Opinie są pełnymi cytatami z poprzedniego repo, których prawdziwość użytkownik
  potwierdził wcześniej. Podpis „Opinia o dotychczasowej współpracy” zachowuje
  kontekst. Brak ocen liczbowych i `AggregateRating`.
- Treść strony nie zaleca leków, suplementów ani ich dawkowania. Pokazuje zakres
  pracy dietetycznej i zaznacza, że konsultacja uzupełnia opiekę lekarską.
- Nie deklarujemy nieudokumentowanego procesu recenzji naukowej. Zasady źródeł,
  aktualizacji i recenzowania materiałów wymagają osobnej decyzji redakcyjnej.
- JSON-LD nie zawiera `sameAs` z ekranami mockupu, danych płatności, fikcyjnego
  dokumentu ani zdjęcia udającego dowód rzeczywistej konsultacji. W docelowym
  CMS profil powinien korzystać ze wspólnego `author` i zaakceptowanych danych.

## Kontrola i dalszy krok

Ocena dotyczy widocznej treści i zgodności strukturalnej JSON-LD, nie zewnętrznej
weryfikacji dyplomu, reputacji ani dostępności usługi. Google Rich Results Test,
Search Console i audyt całego serwisu nie zostały wykonane. Weryfikacja UI
oraz pełna lokalna bramka jakości są odnotowane w [postępie](PROGRESS.md).

Po akceptacji mockupu uzupełnić materiały i realne adresy, przenieść profil
do Astro/Sanity, powiązać wszystkie biogramy autora oraz utrzymywać zgodne dane
w widocznej treści, HTML/Markdown i JSON-LD.

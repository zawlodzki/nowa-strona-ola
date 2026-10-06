# Copy homepage 3a — propozycja po przeglądzie źródeł

Data: 2026-10-06. Status: copy wdrożone lokalnie w 3a, bez publikacji.
Baza: [mockup 3a](../mockups/homepage/cherry-white.html).
Bieżące wartości i mapowanie do Sanity: [konfiguracja CMS](HOMEPAGE-CMS-CONFIG.md).
Ten dokument zachowuje historię propozycji; konfiguracja CMS zbiera aktualne ustalenia.
Użytkownik wskazał 3a jako kierunek dalszej pracy.

## Decyzje użytkownika i wykonanie — 2026-10-06

Użytkownik zatwierdził aktualizację mockupu i doprecyzował, że ofertą są
pojedyncze konsultacje, bez mentoringu. Potwierdził prawdziwość opinii
w repo `ola-homepage`. Te decyzje mają pierwszeństwo przed wariantami
oraz ostrożnościami wcześniejszej propozycji poniżej.

- W 3a wdrożono hero, podejście, O mnie, opisy e-booków, konsultację,
  newsletter, stopkę i metadata. Nawigacja zachowuje „Konsultacje”.
- Sekcja konsultacji opisuje jedno spotkanie: analizę sytuacji i ustalenie
  priorytetów. Nie dopisano czasu trwania, ceny, dokumentu po wizycie,
  aplikacji ani stałego kontaktu charakterystycznego dla mentoringu.
- Sześć opinii z `data/testimonials.js` przeniesiono w pełnym brzmieniu,
  bez dopisywania imion. Podpis „Opinia o dotychczasowej współpracy”
  zachowuje historyczny kontekst, bez przypisywania wyników jednej konsultacji.
  Emoji należą do oryginalnych cytatów, nie do systemu ikon interfejsu.
- Usunięto fikcyjne „500+” i przykładowe efekty. Stan sześciu e-booków:
  „W przygotowaniu”; CTA „Poznaj temat” otwiera istniejący ekran makiety.
- Usunięto pas marek do czasu potwierdzenia charakteru relacji oraz
  niepotwierdzone odnośniki Facebook/TikTok. Instagram zachowuje ekran makiety.
- Dostosowanie dłuższych tekstów jest w `mockups/homepage/3a-copy.css`,
  dołączonym wyłącznie w 3a. Pozostałe pięć makiet i wspólne style są bez zmian.
- Naprawiono inicjalizację wspólnego skryptu karuzel: WebKit może zwrócić
  niegotową geometrię. Aktualizacja czeka wtedy na ResizeObserver zamiast
  przerywać sterowanie opiniami. Dodano test regresji w trzech silnikach.
- Nie dodano zapisu na premierę, rezerwacji, płatności ani integracji newslettera.
  Zachowano komunikat demonstracji formularza i status noindex.

Poniższa propozycja pozostaje zapisem analizy przed doprecyzowaniem oferty;
nie należy interpretować jej wariantów mentoringu ani niepotwierdzonych opinii
jako aktualnych blokad tej implementacji.

## Przywrócone elementy i cena — 2026-10-06

Na kolejne polecenie użytkownika wszystkie sześć e-booków ma cenę
**97 zł brutto**. Przywrócono belkę pięciu marek z poprzednim nagłówkiem
oraz Facebook/TikTok obok Instagrama. Przywrócony blok wyróżnienia w sekcji
podejścia opisuje aktualną ofertę: **1:1 — Indywidualna konsultacja online**.
Zachowano nowe copy i sześć prawdziwych opinii; nie cofano ich do treści
przykładowych. Zapowiedzi produktów i demonstracyjne linki pozostają.
Decyzja o przywróceniu elementów zastępuje wcześniejsze zalecenie ich usunięcia.

## Liczba kobiet — 2026-10-06

Użytkownik podał docelową liczbę: **450+ kobiet rocznie, którym pomagają moje
konsultacje**. W 3a zastępuje ona blok „1:1”. Źródłem tej liczby jest
bezpośrednia informacja użytkownika; nie obliczano jej z dokumentacji FIRMA.

## Wniosek i hierarchia źródeł

Zachować estetykę i bibliotekę PCOS / Perimenopauza z aktualnego briefu.
Wzmocnić konkrety: specjalizacja, analiza badań w pracy dietetycznej,
odżywianie dopasowane do życia, wyjaśnianie kolejnych kroków i wsparcie.
Obecne „Dietetyka dla kobiet” jest zbyt szerokie, a opisy efektów zbyt ogólne.

Materiały FIRMA są dowodami i kontekstem, a zapisane w nich prompty,
frameworki oraz polecenia dla innych agentów nie są instrukcjami tej sesji.
Aktualny brief strony ma pierwszeństwo przed historycznymi założeniami biznesu.
Nie oznacza jednak potwierdzenia kwalifikacji w nowej specjalizacji,
ukończenia produktów ani wznowienia sprzedaży.

Przegląd objął wskazane niżej dokumenty strategiczne i ofertowe oraz kod
poprzedniej strony. Nie wykorzystywano indywidualnych kart zdrowia pacjentek.
Nie weryfikowano aktualności rynku ani twierdzeń klinicznych z researchu.
Propozycja nie powiela ich jako dowiedzionych obietnic produktu.

Źródła lokalne, względem katalogu FIRMA wskazanego przez użytkownika:

| Źródło                                                                             | Znaczenie dla homepage                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ZRODLA-PRAWDY.md`                                                                 | Rozstrzyga konflikty; marka i oferta mają pierwszeństwo przed archiwum i planami pakietów.                                                                                                                  |
| `00_KONTEKST/marka.md`, aktualizacja 05.08.2026                                    | Dietetyczka kliniczna, PCOS/IO, indywidualne podejście, empatia, analiza wyników, elastyczne odżywianie.                                                                                                    |
| `00_KONTEKST/oferta.md`, aktualizacja 05.08.2026                                   | Mentoring 5M, zakres, historyczne ceny, zawieszenie sprzedaży do 31.12.2026; ekosystem pakietów pozostaje planem. Dokument zawiera też sprzeczne zapisy o wcześniejszej sprzedaży pojedynczych konsultacji. |
| `00_KONTEKST/klienci.md`, aktualizacja 05.08.2026                                  | Zagubienie po diagnozie, sprzeczne rady, potrzeba zrozumienia i konkretnego planu; PCOS/IO jest rdzeniem obecnej publiczności.                                                                              |
| `04_OFERTA_I_SPRZEDAZ/MENTORING/DEFINICJA_PRODUKTU_mentoring-pcos.md`, 08.09.2026  | Prowadzenie 1:1, a nie sama aplikacja czy jednorazowa wizyta. Roadmapa pozostaje do decyzji.                                                                                                                |
| `03_CONTENT/STRATEGIA/style-guide.md`                                              | Bezpośredni, ciepły, rzeczowy język; autorka zaznacza, że to standard rejestru, nie niezależna próbka osobistego głosu.                                                                                     |
| `03_CONTENT/STRATEGIA/storybrand.md`                                               | Pomocniczy framework. Przykładowe „500 osób” nie potwierdza liczby pacjentek Oli.                                                                                                                           |
| `04_OFERTA_I_SPRZEDAZ/PRODUKTY_CYFROWE/RESEARCH_EBOOK_PCOS_2026-09-13.md`          | Trzy koncepcje, rekomendowany pierwszy produkt o suplementach. Nie dowodzi ukończenia e-booków.                                                                                                             |
| `04_OFERTA_I_SPRZEDAZ/PRODUKTY_CYFROWE/RESEARCH_EBOOK_PERIMENOPAUZA_2026-09-13.md` | Trzy koncepcje, rekomendowany produkt o składzie ciała. Wprost wskazuje nową publiczność i brak potwierdzonego programu współpracy 45+.                                                                     |

Poprzednie repo: `/Users/grzesiek/Github/ola-homepage/`.
Przeczytano `app/page.js`, `app/o-mnie/page.js`,
`app/program-metamorfozy-hormonalnej/page.js`, `data/features.js`,
`data/pricing.js`, `data/testimonials.js`.
Kod potwierdza obecność tekstu w projekcie, nie prawdziwość opinii,
statystyk ani bieżącą dostępność oferty. Repo pozostawiono bez zmian.

## Co przejąć z poprzedniego projektu

Zachować elastyczne odżywianie, uwzględnianie preferencji, oszczędność czasu,
osobiste doświadczenie Oli i czytelne wyjaśnienie przebiegu współpracy.
Aplikację pokazać na stronie usługi jako narzędzie, jeśli nadal jest w zakresie.

Nie przenosić „Schudnij i ureguluj hormony”, średniej utraty 6,5 kg,
„Nawet 40% kobiet”, gwarancji co najmniej 6 kg, porównania ceny do pizzy,
„Testuję bez ryzyka” ani badge'a „Najpopularniejszy” bez odrębnych dowodów.
Pakiety 149/249/399 zł i rozliczenie roczne z repo nie odpowiadają
mentoringowi 5M w FIRMA. Opinie w `data/testimonials.js` nie mają
wskazanego oryginału, daty ani zgody na publikację.

## Propozycja tekstów sekcja po sekcji

Poniższe teksty opisują kierunek docelowy. Warianty zależne od dostępności
oferty są jawnie wskazane. Nie traktować ich jako potwierdzenia gotowości sprzedaży.

### 1. Nawigacja

**E-booki · Współpraca · O mnie · Newsletter**

„Współpraca” obejmuje zarówno konsultację, jak i prowadzenie 1:1.
Nie deklaruje dostępności konkretnego wariantu usługi.

### 2. Hero

Zamiast „Dietetyka dla kobiet”:

> Zrozum swoje ciało.
> Zacznij od odżywiania.

Lead:

> Jestem Ola, dietetyczka kliniczna. Specjalizuję się w PCOS i insulinooporności.
> Pomagam uporządkować odżywianie i wybrać kolejne kroki dopasowane do Twojego życia.
> Przygotowuję też e-booki o PCOS i perimenopauzie.

CTA: **Poznaj e-booki** oraz **Poznaj współpracę**.
Po ukończeniu produktów „Przygotowuję” można zmienić na „W moich e-bookach…”.
„Kup” i „Umów konsultację” dopiero po potwierdzeniu dostępności.

To rekomendowany wariant: emocjonalny nagłówek, konkretna specjalizacja w leadzie.
Jeżeli na mobile lead okaże się za długi, skrócić go redakcyjnie po kontroli
w przeglądarce, bez zmniejszania fontu.

### 3. Logotypy marek

Obecne „Współpracuję z markami, które znasz” wymaga potwierdzenia rodzaju
i aktualności relacji z każdą marką. Pobranie oficjalnego logo nie jest dowodem współpracy.

Docelowa etykieta: **Marki, z którymi współpracuję** — tylko dla potwierdzonych relacji.
Jeżeli były historyczne: **Marki, z którymi współpracowałam**.
Jeżeli dotyczą jedynie rabatów lub afiliacji, nazwać ten charakter i rozważyć
przeniesienie do osobnej podstrony. Do czasu ustalenia ukryć pas na gotowej stronie.

### 4. Zamiast przykładowych efektów — podejście

Nagłówek:

> Wiesz, od czego zacząć.
> Rozumiesz, po co to robisz.

Wprowadzenie:

> Po diagnozie łatwo pogubić się w radach o diecie, badaniach i suplementach.
> Pomogę Ci uporządkować informacje i przełożyć je na codzienne decyzje.

Trzy istniejące miejsca na treść:

- **Twoja sytuacja jest punktem wyjścia.** Przyglądam się Twoim wynikom badań,
  sposobowi odżywiania i codziennym nawykom.
- **Zmieniamy to, co jesz na co dzień.** Szukamy rozwiązań, które uwzględniają
  Twoje ulubione posiłki, czas i możliwości.
- **Rozumiesz kolejne kroki.** Wyjaśniam zalecenia, żebyś wiedziała,
  co robisz i dlaczego.

Usunąć „500+” oraz przykładowe efekty. Zamiast statystyki użyć krótkiego
zdania **Od Twoich wyników do codziennych posiłków.** Po wdrożeniu sprawdzić
kompozycję tej części; tekst nie musi mieścić się w obecnym miejscu liczby.

### 5. O mnie

Nagłówek:

> Jestem Ola.
> Znam PCOS także z własnego doświadczenia.

Tekst:

> Jestem dietetyczką kliniczną i sama mam doświadczenie z PCOS.
> Wiem, jak trudno odnaleźć się w sprzecznych radach i kolejnych próbach zmiany odżywiania.
>
> W pracy z kobietami z PCOS i insulinoopornością łączę analizę wyników badań
> z praktycznymi zmianami w posiłkach. Zależy mi, żebyś rozumiała zalecenia
> i potrafiła korzystać z nich w swojej codzienności.

CTA: **Poznaj moją historię**.

Osobiste doświadczenie znajduje potwierdzenie w materiałach marki i poprzedniej
stronie. Dokładną historię, czas do diagnozy i gotowość Oli do publicznego
opisania jej w tym miejscu potwierdzić redakcyjnie. Nie dopisywać uczelni,
tytułu magistra, stażu ani specjalizacji w perimenopauzie bez dokumentów.

### 6. Biblioteka e-booków

Nagłówek: **E-booki o PCOS i perimenopauzie.**

Lead:

> Badania, suplementy, codzienne posiłki i obserwacja samopoczucia.
> Wybierz temat, w którym potrzebujesz więcej jasności.

Zachować dwa wejścia **PCOS / Perimenopauza** i sześć kart w mockupie.
Na gotowej stronie pokazać tylko ukończone produkty lub jawne zapowiedzi.
Opis karty obiecuje zawartość, którą finalny plik musi rzeczywiście dostarczyć.

| Produkt                       | Proponowany opis karty                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| Suplementy w PCOS             | Uporządkuj pytania o suplementy: po co je stosować i co omówić ze specjalistą przed zakupem.            |
| Badania, które mają sens      | Przygotuj pytania na wizytę i uporządkuj dotychczasowe wyniki badań.                                    |
| Szczupła, a jednak PCOS       | Jak podejść do odżywiania przy PCOS, kiedy Twoim celem nie jest odchudzanie.                            |
| Waga Cię okłamuje             | Przyjrzyj się zmianom w sylwetce i codziennych nawykach w okresie perimenopauzy.                        |
| Czy to już?                   | Dziennik cyklu i samopoczucia, który pomoże Ci przygotować się do rozmowy z lekarzem.                   |
| Noc zaczyna się o osiemnastej | Uporządkuj wieczorne posiłki i nawyki. Sprawdź, co warto obserwować przed rozmową o problemach ze snem. |

„Czy to już?” nie obiecuje samodzielnego rozpoznania; „Noc…” nie obiecuje
leczenia bezsenności. Tytuł „Waga Cię okłamuje” pozostaje roboczy do akceptacji Oli.

CTA gotowego produktu: **Zobacz, co jest w środku** + rzeczywista cena.
Zapowiedź: **W przygotowaniu** i **Powiadom mnie o premierze**, jeśli istnieje
działający zapis. W makiecie można zachować karty jako koncepcje, ale usunąć
„około 100 zł” i zastąpić stanem przygotowania. Nie obiecywać konkretnej daty premiery.

### 7. Współpraca indywidualna

Największa rozbieżność: mockup opisuje pojedynczą konsultację, FIRMA potwierdza
przede wszystkim mentoring 5M. Aktualny brief przewiduje konsultacje online,
więc nie usuwać ich z kierunku strony, ale ustalić zakres przed sprzedażą.

Nagłówek neutralny: **Współpraca dietetyczna online.**

Tekst:

> Chcesz odnieść zalecenia do swojej sytuacji? Wspólnie przyjrzymy się Twoim
> wynikom badań, sposobowi odżywiania i temu, z czym trudno Ci sobie poradzić
> na co dzień. Ustalimy priorytety i zmiany, które możesz wprowadzać krok po kroku.

Fakty: **Online · Analiza Twojej sytuacji · Zmiany w codziennych posiłkach**.
CTA: **Sprawdź, jak wygląda współpraca**.

Jeżeli wraca mentoring: rozwinąć podstronę o czas trwania, badania przed
pierwszym spotkaniem, rytm wsparcia i plan po zakończeniu. R.I.S.E. wyjaśnić
tam poprzez rzeczywisty proces. Nie obiecywać Roadmapy bez decyzji Oli.

Jeżeli dostępne będą pojedyncze konsultacje: użyć nagłówka
**Konsultacje dietetyczne online** i opisać dokładny rezultat jednej wizyty.
Nie przypisywać jej całego zakresu mentoringu.

W okresie zapisanej w FIRMA przerwy dodać:

> Obecnie nie przyjmuję nowych pacjentek. O ponownym otwarciu zapisów
> poinformuję w newsletterze.

CTA okresowe: **Daj mi znać o zapisach** — tylko przy działającym formularzu.
To wariant warunkowy według ostatniego zapisu, nie potwierdzony stan na dziś.
Nie obiecywać automatycznego wznowienia 1 stycznia 2027.

### 8. Opinie

Zamiast „Opinie o e-bookach i konsultacjach”:

> O współpracy ze mną.

Nie ma dowodów na opinie o sześciu planowanych e-bookach. Nie przenosić
automatycznie cytatów ze starego repo i nie przerabiać syntetycznych wypowiedzi
z `klienci.md` na referencje.

Docelowo 2–3 oryginalne opinie o rzeczywistej współpracy: cytat,
zaakceptowany podpis, forma usługi. Skróty wyłącznie z zachowaniem sensu
i po potwierdzeniu. W mockupie obecne cytaty nadal oznaczać jako przykładowe
do chwili podmiany; na gotowej stronie ukryć sekcję, jeśli brak materiałów.

### 9. Newsletter

Nagłówek:

> Mniej sprzecznych rad.
> Więcej konkretów.

Tekst:

> Piszę o PCOS, insulinooporności i codziennym odżywianiu.
> Dzielę się wskazówkami do wykorzystania przy zwykłym posiłku i informuję
> o nowych materiałach, także o perimenopauzie.

CTA: **Chcę otrzymywać newsletter**.
Krótka informacja: **Możesz wypisać się w każdej chwili.**
Nie deklarować rytmu „co tydzień”, darmowego e-booka ani podziału na dwa
newslettery, zanim taki zakres faktycznie istnieje. Teksty zgód i komunikat
zapisu dopracować przy integracji formularza; ta propozycja ich nie zatwierdza.

### 10. Stopka i metadata

Stopka zamiast „Dietetyka, która robi miejsce na Ciebie”:

> PCOS, insulinooporność i odżywianie dopasowane do życia.

Pokazać tylko potwierdzone profile; sam link do ekranu podglądu nie potwierdza
istnienia Facebooka czy TikToka. Usunąć elementy wyboru estetyki dopiero
przy tworzeniu gotowej strony, nie w tej propozycji.

Propozycja tytułu strony:
**Aleksandra Olesiewicz — dietetyczka kliniczna | PCOS i insulinooporność**.

Opis po potwierdzeniu zakresu i produktów:
**Praktyczne wsparcie w odżywianiu przy PCOS i insulinooporności.
Poznaj Aleksandrę Olesiewicz, współpracę online i materiały o PCOS i perimenopauzie.**

## Kolejność wdrożenia i otwarte decyzje

1. Zatwierdzić hero, podejście, O mnie, newsletter i stopkę; tekst ma być
   przeczytany przez Olę jako jej wypowiedź.
2. Ustalić dostępność: zapowiedzi czy gotowe produkty, aktualna przerwa
   czy wznowienie zapisów, pojedyncza konsultacja czy mentoring lub obie formy.
3. Potwierdzić treści e-booków, ceny, kwalifikacje, oryginalne opinie,
   współprace marek i profile. Materiały marki potwierdzają opis
   „dietetyczka kliniczna”, ale nie zastępują weryfikacji dokumentów kwalifikacji.
4. Nanieść zaakceptowane copy wyłącznie w 3a. Sprawdzić łamanie nagłówków,
   karty i CTA na desktop/mobile, 320 px, klawiaturę, zoom 200% i reduced motion.
5. Dopiero potem przenieść do Astro/Sanity. Publikacja wymaga osobnego zlecenia.

W tej sesji wykonano analizę źródeł i propozycję, nie zmianę aplikacji.
Nie wykonano nowego QA UI ani `npm run verify`; mają zastosowanie po wdrożeniu.

# Przegląd komunikacji stagingu pod kątem ryzyk prawnych

|                    |                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data przeglądu** | 10.10.2026                                                                                                                                                                                                                                       |
| **Zakres**         | https://ola-website-staging.zawlodzki.workers.dev/ — PL: strona główna, /konsultacje/, /o-mnie/, /ebooki/, /ebooki/suplementy-w-pcos/, /blog/ (2 strony listy, 11 wpisów), /kontakt/; EN sprawdzone wyrywkowo (/en/, JSON-LD /en/consultations/) |
| **Podstawa**       | `projekt prawny ola/compliance/wytyczne-komunikacji.md` v1.0 (10.10.2026), wariant **D1**                                                                                                                                                        |
| **Założenie**      | Wellbiz **nie** będzie podmiotem leczniczym → sekcja 4.4 wytycznych (B1, zakaz cech reklamy u.d.l. art. 14) **nie ma zastosowania**. Konsultacje wolno promować, opinie klientek wolno pokazywać — na zasadach u.p.n.p.r.                        |
| **Status**         | ocena robocza, nie porada prawna; do decyzji właścicielki treści i ewentualnie radcy                                                                                                                                                             |

Poza zakresem: 5 kart e-booków (`/ebooki/badania-ktore-maja-sens/`, `/szczupla-a-jednak-pcos/`,
`/waga-cie-oklamuje/`, `/czy-to-juz/`, `/noc-zaczyna-sie-o-osiemnastej/`) zwraca 404;
10 z 11 wpisów bloga to treść demonstracyjna. Przegląd trzeba powtórzyć, gdy powstanie
ich treść. Strony regulaminów i polityki prywatności nie były oceniane.

## Skala ryzyka

- **Duże** — prawdopodobne naruszenie przepisu z czarnej listy u.p.n.p.r. albo twierdzenie
  zdrowotne/obietnica efektu; realna podstawa do interwencji UOKiK lub roszczeń. Wdrożyć
  przed publikacją.
- **Średnie** — możliwe wprowadzenie w błąd (art. 5) lub brak elementu wymaganego
  wytycznymi; zależy od kontekstu i dowodów. Zalecane przed publikacją.
- **Małe** — niezgodność ze słownikiem wytycznych lub brak „dobrych praktyk”; niskie
  prawdopodobieństwo sankcji, tania poprawka.

## Podsumowanie

| ID  | Ryzyko               | Gdzie                                                    | W skrócie                                                                                                                      |
| --- | -------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| R1  | **Duże**             | / (+ /en/)                                               | Opinie z wynikami: kilogramy w terminie, „hormony się ustabilizowały”, „wyniki badań się poprawiły”, „mały cud”                |
| R2  | **Duże** (warunkowo) | wszystkie bloki opinii                                   | Brak potwierdzenia, że opinie są prawdziwe i mają zgodę; brak notki o weryfikacji                                              |
| R3  | Średnie              | /, /konsultacje/, /o-mnie/, /ebooki/…                    | Opinie opisują elementy, których oferta nie zawiera (aplikacja, stała dostępność, dieta i przepisy)                            |
| R4  | Średnie              | /, /konsultacje/, /o-mnie/                               | „450+ kobiet rocznie, którym pomagają moje konsultacje” — liczba do wykazania, „pomagają” sugeruje efekt                       |
| R5  | Średnie              | /konsultacje/, /                                         | Brak informacji, dla kogo konsultacja nie jest (przeciwwskazania), przy targetowaniu „starań o ciążę”                          |
| R6  | Małe                 | /, JSON-LD /o-mnie/, /en/                                | „Specjalizuję się w PCOS i insulinooporności”                                                                                  |
| R7  | Małe                 | /, /o-mnie/, /konsultacje/                               | „Analiza wyników badań”, „Czy te wyniki są ważne?”, „Tłumaczę wszystko prostym językiem” — bez dopisku „w kontekście żywienia” |
| R8  | Małe                 | /                                                        | Sekcja konsultacji na stronie głównej bez zdania, że konsultacja nie zastępuje lekarza                                         |
| R9  | Małe                 | /ebooki/suplementy-w-pcos/                               | Opinie o konsultacjach na stronie sprzedażowej e-booka                                                                         |
| R10 | Małe                 | /blog/przygotowanie-do-konsultacji-pcos/ (szablon wpisu) | Brak zastrzeżenia medycznego i wydzielonej ramki promocyjnej                                                                   |
| R11 | Małe                 | /kontakt/                                                | Formularz bez prośby, by nie podawać danych o zdrowiu                                                                          |

Co jest już dobrze (zostawić): FAQ konsultacji „Czy jedno spotkanie rozwiąże wszystkie moje
problemy?” i „Czy konsultacja zastępuje wizytę u lekarza?”; zdanie na /o-mnie/ „Konsultacja
dietetyczna uzupełnia opiekę lekarską…”; na stronie e-booka o suplementach — zastrzeżenie
edukacyjne, „Nie obiecuje regulacji hormonów, utraty kilogramów ani powrotu miesiączki”,
odesłania do lekarza/farmaceuty, źródło (wytyczne PCOS 2023), brak marek i oświadczeń
o działaniu przy berberynie i innych składnikach; „Starania o ciążę… w porozumieniu
z lekarzem prowadzącym”; cena 97 zł / 450 zł bez fałszywych obniżek i presji czasu;
tytuł „dietetyczka kliniczna” z uczelnią na /o-mnie/.

## Szczegóły i propozycje

### R1 — Opinie z obietnicą efektu zdrowotnego i wagowego · **Duże**

**Gdzie:** strona główna, sekcja „Doświadczenia moich podopiecznych” (i ta sama w /en/).

**Obecnie:**

- „Na wadze dopiero -3kg, ale już się zadział mały cud. Z twarzy zaczęły znikać mi pryszcze…”
- „Dzięki współpracy z Olą schudłam 8 kg w 3 miesiące bez wyrzeczeń. Hormony się
  ustabilizowały, energii mam więcej niż kiedykolwiek!”
- „Z Olą w 2 miesiące schudłam 5 kg i wyniki badań się poprawiły!”

**Dlaczego:** opinie użyte w reklamie usługi są komunikatem przedsiębiorcy. Przekazują
obietnicę spadku masy ciała w terminie i poprawy hormonów/wyników — wytyczne zasada 2,
§ 2 („schudniesz X kg”), § 9 („wybieranie wyłącznie skrajnych wyników bez kontekstu”);
u.p.n.p.r. art. 5, a „hormony się ustabilizowały” + „cud” zbliża się do art. 7 pkt 17
(sugestia działania leczniczego). Brak dopisku „efekty są indywidualne”.

**Propozycja:** usunąć te trzy opinie. Zostawić opinie o przebiegu współpracy (np. „Po latach
walki z PCOS w końcu znalazłam kogoś, kto rozumie moje problemy…”), po spełnieniu R2.
Jeśli chcesz zachować którąś z wynikiem — tylko za wyraźną zgodą autorki (dane o zdrowiu),
bez liczb i terminów, z dopiskiem pod sekcją: „Efekty są indywidualne i zależą od wielu
czynników.”

**Decyzja:** [ ] wdrażam [ ] nie wdrażam [ ] wdrażam częściowo: …

### R2 — Pochodzenie, zgoda i weryfikacja opinii · **Duże, jeśli opinie nie są prawdziwe / nie mają zgody; inaczej Średnie**

**Gdzie:** wszystkie bloki opinii (/, /konsultacje/, /o-mnie/, /ebooki/suplementy-w-pcos/, EN).

**Dlaczego:** u.p.n.p.r. art. 7 pkt 25–26 (czarna lista) — zakaz twierdzenia, że opinie
pochodzą od klientów, bez rozsądnych kroków weryfikacji, i zakaz opinii fałszywych lub
zniekształconych. Wytyczne § 9: tylko prawdziwe, za zgodą Z7, z notką o weryfikacji.
Część tekstów wygląda na zredagowane/placeholdery (np. „Aplikacja jest super intuicyjna”
przy ofercie bez aplikacji, R3). Jeśli którakolwiek opinia jest wymyślona, poprawiona
przez AI albo złożona z kilku — to ryzyko duże niezależnie od treści.

**Propozycja:** dla każdej opinii mieć źródło (zrzut wiadomości/formularz), zgodę na
publikację i zgodę na skrócenie. Pod każdą sekcją opinii dodać notkę:

> Opinie klientek, które skorzystały z moich konsultacji. Publikuję je za zgodą autorek,
> dosłownie lub skrócone za ich akceptacją. Efekty są indywidualne.

Do czasu zebrania zgód — wyłączyć sekcje opinii w CMS.

**Decyzja:** [ ] wdrażam [ ] nie wdrażam [ ] wdrażam częściowo: …

### R3 — Opinie niezgodne z zakresem oferty · **Średnie**

**Gdzie:** opinie „Aplikacja jest super intuicyjna, a Ola zawsze dostępna gdy potrzebuję
pomocy” (/), „Dieta jest dopasowana do mnie” i „Gotuje dla całej rodziny z tych samych
przepisów” (/, /konsultacje/, /o-mnie/, e-book).

**Dlaczego:** /konsultacje/ sprzedaje pojedyncze spotkanie, a FAQ mówi wprost: „Gotowy
jadłospis, aplikacja i stała opieka nie są elementami tej pojedynczej konsultacji”.
Opinie sugerują coś innego → ryzyko wprowadzenia w błąd co do cech usługi (u.p.n.p.r.
art. 5 ust. 2 pkt 2). Notka „Te opinie nie opisują rezultatów jednej konsultacji” łagodzi,
ale nie usuwa sprzeczności.

**Propozycja:** usunąć opinię o aplikacji. Przy opiniach o diecie/przepisach — zamienić
na opinie dotyczące rozmowy, zrozumienia i priorytetów (to, co konsultacja faktycznie daje),
albo zmienić nagłówek sekcji na jednoznaczny: „Opinie klientek z wcześniejszej,
długoterminowej współpracy (obecnie nie jest w ofercie).”

**Decyzja:** [ ] wdrażam [ ] nie wdrażam [ ] wdrażam częściowo: …

### R4 — „450+ kobiet rocznie, którym pomagają moje konsultacje” · **Średnie**

**Gdzie:** /, /konsultacje/, /o-mnie/, /en/.

**Dlaczego:** zasada 3 — twierdzenie musi dać się wykazać (u.p.n.p.r. art. 5). Potrzebny
dowód (kalendarz/faktury) i jasna definicja (osoby czy konsultacje? który rok?).
„Pomagają” zakłada efekt u każdej z 450 osób.

**Propozycja (wybierz wariant zgodny z danymi):**

- „Ponad 450 konsultacji w 2025 roku” — jeśli liczone są spotkania,
- „Ponad 450 klientek w 2025 roku” — jeśli liczone są osoby.

Zachować dowód w dokumentacji (np. eksport z kalendarza).

**Decyzja:** [ ] wdrażam [ ] nie wdrażam [ ] wdrażam częściowo: …

### R5 — Brak przeciwwskazań przy konsultacji · **Średnie**

**Gdzie:** /konsultacje/ (sekcja „Przyjdź z tym, co Cię zatrzymuje” / FAQ); strona główna
targetuje „Starania o ciążę”.

**Dlaczego:** wytyczne § 4.1 i 4.2 — pominięcie przeciwwskazań (regulamin § 3 ust. 5)
w reklamie do szerokiej grupy jest oznaczone jako ❌; ryzyko zdrowotne i niezgodność
z regulaminem.

**Propozycja:** dodać pytanie do FAQ (treść dopasować do regulaminu § 3 ust. 5):

> **Dla kogo ta konsultacja nie jest?**
> Konsultacja nie jest odpowiednia, jeśli [jesteś w ciąży — wg decyzji], masz lub podejrzewasz
> zaburzenia odżywiania albo potrzebujesz pilnej pomocy medycznej. W takiej sytuacji
> skontaktuj się z lekarzem. Szczegóły znajdziesz w regulaminie.

**Decyzja:** [ ] wdrażam [ ] nie wdrażam [ ] wdrażam częściowo: …

### R6 — „Specjalizuję się w PCOS i insulinooporności” · **Małe**

**Gdzie:** hero strony głównej; opis w JSON-LD `/o-mnie/`; „I specialise…” w /en/.

**Dlaczego:** słownik wytycznych (§ 2) — zamiast tytułów sugerujących formalną specjalizację
lub leczenie: „pracuję głównie z kobietami z PCOS”. Dietetyk nie ma formalnej specjalizacji
w chorobach; ryzyko niskie, ale poprawka kosztuje jedno zdanie.

**Propozycja:** „Pracuję głównie z kobietami z PCOS i insulinoopornością.”
(EN: „I work mainly with women with PCOS and insulin resistance.”)

**Decyzja:** [ ] wdrażam [ ] nie wdrażam

### R7 — Wyniki badań bez kontekstu żywienia · **Małe**

**Gdzie i obecnie:**

- / i /o-mnie/: „łączę analizę wyników badań z praktycznymi zmianami w posiłkach”,
  „Przyglądam się Twoim wynikom badań…”, punkt „Analiza Twojej sytuacji”
- /konsultacje/: dymek „Czy te wyniki są ważne?”; krok 2 „Przyglądamy się dostępnym wynikom
  badań… Tłumaczę wszystko prostym językiem.”

**Dlaczego:** wytyczne § 2 i 4.1 — wyniki omawiamy „w kontekście żywienia”, bez sugestii
oceny klinicznej (granica diagnozowania w D1). Inne miejsca robią to dobrze („o ich znaczeniu
dla pracy nad odżywianiem”).

**Propozycja:**

- „łączę omówienie wyników badań w kontekście żywienia z praktycznymi zmianami w posiłkach”
- dymek: „Co moje wyniki oznaczają dla jedzenia?”
- krok 2: „Tłumaczę prostym językiem, co z tego wynika dla Twojego odżywiania.”

**Decyzja:** [ ] wdrażam [ ] nie wdrażam [ ] wdrażam częściowo: …

### R8 — Strona główna: brak zdania o roli lekarza przy ofercie konsultacji · **Małe**

**Dlaczego:** wytyczne § 4.1 — „Zawsze: diagnoza i leczenie należą do lekarza”. Na
/konsultacje/ i /o-mnie/ jest; na stronie głównej, przy cenie i CTA, nie ma.

**Propozycja:** pod listą cech konsultacji: „Konsultacja dietetyczna uzupełnia opiekę
lekarską. Nie zastępuje diagnozy ani leczenia.”

**Decyzja:** [ ] wdrażam [ ] nie wdrażam

### R9 — Opinie o konsultacjach na stronie e-booka · **Małe**

**Gdzie:** /ebooki/suplementy-w-pcos/, sekcja „Jak pracuje się z Olą?”.

**Dlaczego:** notka „Nie są recenzjami tego ebooka…” jest poprawna, ale sam blok opinii
przy przycisku zakupu e-booka wciąż buduje wrażenie, że to opinie o produkcie (art. 5).

**Propozycja:** usunąć sekcję do czasu zebrania opinii o e-booku albo zastąpić blokiem
„O autorce” (wykształcenie, doświadczenie).

**Decyzja:** [ ] wdrażam [ ] nie wdrażam

### R10 — Szablon wpisu bloga · **Małe**

**Gdzie:** /blog/przygotowanie-do-konsultacji-pcos/ (dotyczy szablonu wszystkich wpisów).

**Dlaczego:** wytyczne § 5.1 — wpis z datą aktualizacji, zastrzeżeniem medycznym; promocja
konsultacji/e-booka wyraźnie wydzielona. Obecnie CTA „Chcesz poznać sposób współpracy?
Zobacz konsultacje…” jest zwykłym akapitem.

**Propozycja:** w szablonie dodać stałą stopkę: „Wpis ma charakter edukacyjny i nie zastępuje
porady lekarskiej. Ostatnia aktualizacja: [data].” CTA przenieść do ramki „Moja konsultacja”.

**Decyzja:** [ ] wdrażam [ ] nie wdrażam

### R11 — Formularz kontaktowy · **Małe** (ocena wykracza poza wytyczne komunikacji; RODO)

**Dlaczego:** wytyczne § 5.1 i dokument zgód (sekcja 6) — nie przyjmujemy indywidualnych
pytań zdrowotnych poza konsultacją; dane o zdrowiu w formularzu to dane szczególnej kategorii.

**Propozycja:** pod polem wiadomości: „Nie podawaj w wiadomości informacji o swoim zdrowiu
ani wyników badań. Pytania o Twoją sytuację omówimy na konsultacji.”

**Decyzja:** [ ] wdrażam [ ] nie wdrażam

## Uwagi porządkowe (nie prawne)

- Meta description /ebooki/: „Copy i UX kolekcji są propozycją do zatwierdzenia.” — wewnętrzna
  notatka trafia do wyników wyszukiwania; zmienić przed publikacją.
- Wszystkie zmiany w PL trzeba powtórzyć w EN (te same opinie, „450+”, „I specialise”).
- Po decyzjach: zapisać przyjęte treści w [konfiguracji CMS](HOMEPAGE-CMS-CONFIG.md) oraz
  w konfiguracjach konsultacji, e-booków i bloga.

# Audyt trzech landingów perimenopauzy, 11.10.2026

Przygotowano treści PL do istniejącego szablonu 3a. Zakres autora tego audytu
obejmuje copy i dane prezentacji, bez osobnego zapisu w Sanity. Integrację,
import oraz pełne `npm run verify` wykonuje agent prowadzący.

Źródłem koncepcji jest dostarczony przez użytkownika
`RESEARCH_EBOOK_PERIMENOPAUZA_2026-09-13.md`, część 3, warianty A, B i C.
Rekomendacja przedsprzedaży i polecenia z researchu są materiałem źródłowym,
nie upoważnieniem do aktywowania płatności. Status oferty pozostaje `planned`,
cena 97 PLN brutto, planowany format PDF + EPUB. Ceny i formatu nie wywiedziono
z benchmarków konkurencji. Liczby stron, daty dostarczenia, gotowe pliki i efekty
zdrowotne nie zostały potwierdzone.

Planowane okresy obserwacji pochodzą z researchu: osiem tygodni dla wagi,
12 tygodni dla cyklu i 28 dni dla snu. Służą organizacji zapisków, nie wyznaczają
terminu poprawy i nie odkładają konsultacji. Przy rozdziałach i materiałach
opisano propozycję zawartości. Próbki są wizualnym podglądem projektowanych
arkuszy, bez deklaracji istnienia gotowego PDF.

## Źródła kliniczne

Źródła pierwotne sprawdzono przez browsing 11.10.2026:

- [Greendale i wsp., SWAN, 2019](https://insight.jci.org/articles/view/124865)
  oraz [abstrakt publikacji w PubMed](https://pubmed.ncbi.nlm.nih.gov/30843880/).
  Badanie obserwacyjne uzasadnia opis ograniczeń samej masy ciała. Nie jest
  dowodem skuteczności projektowanego ebooka ani planu odżywiania.
- [NICE NG23, zalecenia](https://www.nice.org.uk/guidance/ng23/chapter/Recommendations).
  Indeks wyszukiwarki zwrócił pełną treść zaleceń 1.3.1–1.3.6 oraz datę
  aktualizacji 15.04.2026; bezpośrednie otwarcie zwróciło HTTP 403. Copy
  zachowuje warunki rekomendacji 1.3.1. Nie uogólnia jej na wszystkie kobiety,
  wiek poniżej 45 lat czy stosowanie terapii hormonalnej.
- [AASM, wytyczne terapii behawioralnej bezsenności, 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC7853203/).
  Indeks wyszukiwarki zwrócił zalecenie CBT-I oraz ograniczenie samej higieny snu;
  bezpośrednie otwarcie PMC uruchomiło kontrolę przeglądarki.
  [Aktualne zestawienie AASM](https://learn.aasm.org/AssetListing/Guidelines-at-a-Glance-2291/Guidelines-at-a-Glance-3212)
  potwierdza rolę CBT-I. Materiał nie przedstawia kolacji ani dziennika jako
  leczenia bezsenności.

Twierdzenia o konkretnych dawkach białka, glikemii jako przyczynie wybudzeń,
samodzielnym panelu badań i skuteczności interwencji usunięto z zakresu obietnic.
Nie przygotowano instrukcji leczenia ani dawkowania. Nie wykorzystano liczb
kupujących konkurencji jako dowodu społecznego.

## Waga Cię okłamuje

Plik: [waga-cie-oklamuje.ts](../../src/content/ebook-landings/waga-cie-oklamuje.ts).
Motyw prezentacji to pomiary, a projektowana karta zbiera talię, siłę, energię
oraz źródła białka. Siedem rozdziałów to adaptacja propozycji A z researchu.

| Zasada                             | Dokładny cytat i sekcja                                                                                                                        | Status    | Uzasadnienie                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| 1. Mały krok i istotny wynik       | "Wypełniony zapis pomoże Ci opowiedzieć na konsultacji, co rzeczywiście się zmienia." Próbka.                                                  | Częściowo | Mały krok ma użyteczny wynik, bez wielkiej obietnicy zdrowotnej.                         |
| 2. Duży problem i prosty mechanizm | "Ebook proponuje prosty punkt wyjścia: zapisujesz codzienne nawyki i kilka obserwacji, a potem porównujesz je w podobnych warunkach." Problem. | Użyta     | Konkretny mechanizm porządkuje obserwacje, nie obiecuje usunięcia problemu zdrowotnego.  |
| 3. Bliski pierwszy wynik           | "Jedna karta zbierze obserwacje, które łatwo gubią się między ważeniami." Próbka.                                                              | Częściowo | Pierwszy wynik to zapis. Dostęp do plików pozostaje przyszły, bez deklaracji terminu.    |
| 4. Empatia bez obwiniania          | "To zrozumiałe, że szukasz odpowiedzi. Zmiany w sylwetce nie są oceną Twojej silnej woli." Problem.                                            | Użyta     | Nazwana trudność i zdjęta ocena moralna.                                                 |
| 5. Uznanie wcześniejszego wysiłku  | "Jeśli próbowałaś już uporządkować jedzenie albo zapisywałaś pomiary, masz punkt wyjścia." Dla kogo.                                           | Użyta     | Warunkowo uznaje konkretne działania, nie deklaruje zakończenia najtrudniejszego etapu.  |
| 6. Osobista historia autorki       | Brak.                                                                                                                                          | Pominięta | Brak zweryfikowanej historii osobistej Oli w dostarczonych materiałach.                  |
| 7. Użyteczny mniej oczywisty wgląd | "To powód, by patrzeć szerzej, nie prognoza dla Twojego ciała." Autorka, po objaśnieniu SWAN.                                                  | Użyta     | Wgląd o ograniczeniach masy ciała opiera się na badaniu i wskazuje granicę wnioskowania. |

## Czy to już?

Plik: [czy-to-juz.ts](../../src/content/ebook-landings/czy-to-juz.ts).
Motyw prezentacji to dziennik. Projektowana karta opisuje daty, cykl,
wpływ objawów i pytania na wizytę. Sześć rozdziałów adaptuje propozycję B.
Jednostronicowe podsumowanie można przygotować przed końcem dziennika.

| Zasada                             | Dokładny cytat i sekcja                                                                                        | Status    | Uzasadnienie                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| 1. Mały krok i istotny wynik       | "Pierwszy wpis może stać się początkiem podsumowania na najbliższą wizytę." Próbka.                            | Częściowo | To użyteczny wynik organizacyjny, bez obietnicy diagnozy czy poprawy objawów.  |
| 2. Duży problem i prosty mechanizm | "Dziennik porządkuje daty i obserwacje." Problem.                                                              | Użyta     | Materiał zbiera informacje do rozmowy, nie rozstrzyga przyczyny objawów.       |
| 3. Bliski pierwszy wynik           | "Nie musisz czekać, aż zapełnisz dziennik." Próbka.                                                            | Użyta     | Wynik zaczyna się od pierwszych notatek; brak warunku 12 tygodni przed wizytą. |
| 4. Empatia bez obwiniania          | "Niepewność jest zrozumiała." Problem.                                                                         | Użyta     | Kolejne zdanie wskazuje, że objawy mogą nie tworzyć oczywistego obrazu.        |
| 5. Uznanie wcześniejszego wysiłku  | "Jeśli zbierałaś już daty miesiączek, wyniki lub listę objawów, masz materiał do rozmowy." Dla kogo.           | Użyta     | Wskazuje konkretne wcześniejsze działania i pomaga wykorzystać ich wynik.      |
| 6. Osobista historia autorki       | Brak.                                                                                                          | Pominięta | Nie dopisano własnych objawów, diagnozy ani dawnej niepewności autorki.        |
| 7. Użyteczny mniej oczywisty wgląd | "To zalecenie dla określonej sytuacji, nie zasada, że badania zawsze są zbędne." Autorka, po objaśnieniu NICE. | Użyta     | Wgląd o rozpoznaniu bez badań zachowuje warunki wytycznych.                    |

## Noc zaczyna się o osiemnastej

Plik: [noc-zaczyna-sie-o-osiemnastej.ts](../../src/content/ebook-landings/noc-zaczyna-sie-o-osiemnastej.ts).
Motyw prezentacji to wieczór. Próbka łączy posiłki, napoje, noc i samopoczucie
następnego dnia. Pięć rozdziałów adaptuje propozycję C. Nie powtórzono obietnicy
researchu "żeby przestać budzić się o trzeciej". Tytuł nie nakazuje kolacji o 18:00.

| Zasada                             | Dokładny cytat i sekcja                                                                                     | Status    | Uzasadnienie                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------ |
| 1. Mały krok i istotny wynik       | "Już pierwszy wpis daje punkt odniesienia do kolejnych obserwacji." Próbka.                                 | Częściowo | Korzyść jest organizacyjna, bez obietnicy wielkiego efektu zdrowotnego.        |
| 2. Duży problem i prosty mechanizm | "Planowany dziennik łączy wieczór z zapisem nocy." Problem.                                                 | Użyta     | Dziennik porządkuje informacje, nie udaje terapii bezsenności.                 |
| 3. Bliski pierwszy wynik           | "Nie musisz kończyć dziennika, żeby poprosić o pomoc." Próbka.                                              | Użyta     | Wynik ma postać pierwszych zapisków; prowadzenie dziennika nie odracza pomocy. |
| 4. Empatia bez obwiniania          | "Problemy ze snem nie świadczą o tym, że za mało się starasz." Problem.                                     | Użyta     | Zdejmuje ocenę wysiłku i wskazuje możliwość szerszej pomocy.                   |
| 5. Uznanie wcześniejszego wysiłku  | "Jeśli notowałaś wybudzenia albo przyglądałaś się wieczornym posiłkom, masz pierwsze informacje." Dla kogo. | Użyta     | Uznaje rzeczywisty możliwy wysiłek bez pochlebstwa.                            |
| 6. Osobista historia autorki       | Brak.                                                                                                       | Pominięta | Nie przedstawiono fikcyjnej historii problemów ze snem autorki.                |
| 7. Użyteczny mniej oczywisty wgląd | "Sama higiena snu nie jest zalecana jako jedyne leczenie." Autorka.                                         | Użyta     | Zdanie odwołuje się do AASM i wyjaśnia ograniczenia ebooka o nawykach.         |

## Kontrole i dalsza realizacja

Przejrzano tekst wszystkich pól trzech produktów: SEO, hero, fakty, pytania,
rozdziały, próbki, materiały, porównania, źródła, oferta, FAQ oraz etykiety
prezentacji. Każdy moduł używa `satisfies EbookLandingSeed`, bez rzutowania typu.
Nie utworzono nowych cytatów opinii. Kontekst wskazuje współpracę z Olą,
nie recenzję produktu.

W tym podzadaniu nie wykonano pełnego builda, testów UI, formularzy ani zapisu CMS.
Prettier dla czterech własnych plików i ESLint trzech modułów zakończyły się
powodzeniem na Node 24.21.0. Trzy miejscowe odnośniki wskazują istniejące pliki.
Pełna weryfikacja aplikacji, przypięcie treści do istniejących
dokumentów Sanity i odczyt po zapisie pozostają w zakresie agenta prowadzącego.
Przed aktywowaniem sprzedaży potrzebne są gotowe materiały, akceptacja zakresu,
pliki, sposób dostarczenia oraz konfiguracja zakupu. Osobne EN nie zostały utworzone.

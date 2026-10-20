# Ekrany i przepływy

Status: specyfikacja interfejsu. T04 wdrożył prywatny edytor planu i profil 1RM; T05 wdrożył ręczne wykonanie i historię; T06 udostępnił serwerowy kontrakt importu; T07 dodał mobilny ekran importu i korekty; T08 dodał prywatny widok postępu. T09 dodał lokalne nagrywanie i kartę propozycji w edytorze oraz treningu; fizyczne urządzenia pozostają niesprawdzone. Polski interfejs, telefon jako podstawowe urządzenie; desktop do wygodnej edycji planów.

## Nawigacja

Trening / Plany / Historia / Postęp / Profil. Mikrofon jest dostępny w edycji planu oraz przy konkretnej serii, komentarzu i dodatkowym ćwiczeniu treningu.

## Główne ekrany

1. **Start i logowanie:** dostęp testera, powrót do rozpoczętego treningu, wybór planu i jednostki.
2. **Plany:** ręczne utworzenie, import PDF/XLSX/zdjęcia, aparat, wklejenie tekstu, dyktowanie. Widoczny status szkiców i importów.
3. **Przegląd importu:** źródło i rozpoznana struktura; na telefonie przełącznik widoków. Braki przy odpowiednich polach oraz pytania z zamkniętym wyborem lub wpisaniem ilości. Zmiana kolejności, przypisanie nazw ćwiczeń, dodanie brakującej serii. Zapis szkicu lub zatwierdzenie po odpowiedziach.
4. **Plan (lokalny T13-B):** selektor jednostki bez tygodni, krótkie karty i Wszystkie serie, kontekst źródła na żądanie; edycja tworzy nową wersję, nie zmienia zakończonych treningów.
5. **Aktywny trening:** aktualne ćwiczenie, planowane serie, poprzedni wynik, pola numeryczne, duży przycisk zapisania. Mikrofon, dodanie serii/ćwiczenia, notatka i pominięcie. Wyraźne rozróżnienie zapisanych i niezapisanych zmian.
6. **Podgląd głosu:** transkrypcja dostępna do korekty, karta zmian i jeden przycisk zatwierdzenia. Niejasności prowadzą do wyboru konkretnego ćwiczenia/pola.
7. **Podsumowanie i historia:** wykonane/pominięte serie, komentarze, dodatkowe ćwiczenia, czas; historia wybranego ćwiczenia z filtrem wariantu.
8. **Profil:** rzeczywiste 1RM i ich daty, krok obciążenia, strefa czasowa, informacja o przetwarzaniu plików/audio i usuwaniu danych.

T08: osobny „Postęp” pokazuje wykonanie planu (licznik wykonanych serii planowanych wobec wszystkich planowanych), historię ćwiczenia z wariantem i datą, wpisane powtórzenia/kg oraz objętość tylko porównywalnych serii. Pominięcia są liczone osobno; brak kg pozostaje brakiem. Filtry działają jako parametry URL, a nowy odczyt uwzględnia poprawkę historii.

## Wymagania użyteczności

- Ręczny zapis standardowej serii możliwy bez otwierania dodatkowych dialogów i bez AI.
- Cele nie są automatycznie oznaczone jako wykonane; „wykonano zgodnie z planem” wymaga jawnego działania.
- Klawiatura numeryczna, poprawne etykiety pól, obsługa czytnika ekranu i fokusu. Status nie jest przekazywany wyłącznie kolorem.
- Mikrofon: stan nagrywania, zatrzymanie, anulowanie, obsługa odmowy uprawnień. Brak automatycznego nasłuchiwania.
- Brak sieci: widoczny błąd zapisu i możliwość ponowienia; zachowanie aktualnego formularza w otwartej karcie. Trwałość po zamknięciu karty bez sieci nie jest obiecywana.
- Błąd AI: ponowienie lub ręczny formularz bez utraty już zapisanych wyników.
- Domyślnie pokazujemy ostatni porównywalny wynik, nie wynik innego wariantu ćwiczenia.

## Scenariusz referencyjny

Tester importuje zdjęcie planu A/B. Poprawia nieczytelny procent w przysiadzie i zatwierdza. Podaje rzeczywiste 1RM 120 kg. W dniu A widzi 75% = 90 kg, zapisuje pierwszą serię ręcznie, drugą dyktuje. Dodaje nieplanowane podciąganie i komentarz. Po zakończeniu widzi cele obok wyników. Późniejsza zmiana maksimum na 125 kg nie przelicza tego treningu.

## Wdrożenie T06-R1

Pytania pokazują dzień, nazwę ćwiczenia i zakres serii, cytat/adres źródła oraz przyczynę; techniczne ścieżki nie są etykietą UI. Wspólne braki są grupowane. Zakres i maksimum powtórzeń są pełnoprawnymi odpowiedziami, a rozwiązany ręcznie brak znika. Wybór nazw PL/EN zachowuje oryginał, wariant i sprzęt. Zakres serii pokazuje dodatkowe serie jako opcjonalne także podczas treningu.

Źródło PDF ma wybór wszystkich stron, zoom, pełny ekran zamykany Escape i odwołanie prowadzące do strony. XLSX ma wybór wszystkich arkuszy i tabelę z adresami, fizycznymi kolumnami, scaleniami i przekreśleniami. Cytat identyfikuje fragment PDF; automatyczne podświetlenie prostokąta nie jest wdrożone. Na telefonie działają przełączniki źródło/szkic i powrót. Korekta oraz stabilne cele pytań pozostają po odświeżeniu i zmianie kolejności.

## T07-R1 — przegląd importu w trzech krokach

Po imporcie otwiera się własny przegląd propozycji: **Ćwiczenia → Serie i superserie → Podsumowanie**. Potwierdzenie dotyczy całego etapu, bez checkboxa każdej poprawnej pozycji. Wybrany trening ogranicza liczbę kart na ekranie; podsumowanie zawiera wszystkie dni jako rozwijane sekcje. Przejście zmienia także pozycję przewijania i fokus nagłówka.

Karta ćwiczenia pokazuje nazwę, oryginał i wariant. Handstand ma `7–8 serii × 1 powtórzenie` z ósmą opcjonalną, a złożony dip `2 × 6 + 1–2 × 3`. Sąsiadujące serie o tych samych parametrach są prezentowane jako blok; różne cele/rampa jako mała tabela. Pusty cel jest widocznym brakiem. Osobne rekordy i ich ID, uwagi, źródła oraz opcjonalność pozostają zachowane.

Edycja jest otwierana na żądanie: nazwa/sprzęt/wariant/przypisanie, blok identycznych parametrów albo wybrana pojedyncza seria. Zmiana bloku działa na wskazane serie; nie nadpisuje indywidualnych uwag ani flag opcjonalności. Superseria ma wspólną ramkę, skład, kolejność i przerwę kończącego ćwiczenia. Można ją utworzyć lub rozłączyć. Niekompletna lub rozproszona grupa wymaga poprawki przed potwierdzeniem struktury.

Przy ćwiczeniu/grupie oraz w nagłówku „Wyjaśnij” uruchamia ankietę danego etapu, jedno pytanie naraz. Wybory są kafelkami, ilości mają zakres i AMRAP, a podgląd pokazuje objęte zmianą pozycje. „Później” nie rozwiązuje pytania. Niejasność semantyczna prowadzi do korekty albo jawnego potwierdzenia wyświetlonej propozycji wspólnego zakresu. Przypisanie bloku wymaga wybrania treningu. Źródło jest otwierane wewnątrz ankiety; bez kolejnego modala. Dialog jest pełnoekranowy na telefonie, modalny na desktopie, z obsługą fokusu/Escape/powrotu. Zamknięcie odrzuca niezastosowane pola.

Oryginał poza ankietą jest domyślnie zamknięty: panel obok planu na desktopie, pełny dialog na telefonie. Wszystkie strony PDF i arkusze pozostają dostępne. „Dalej” zapisuje korektę i etap przed zmianą widoku; błąd pozwala ponowić. W ramach T07-R1 ręczny edytor zachował dotychczasowy ekran; późniejsze T04-R1 opisano poniżej.

## T04-R1 — kompaktowy ręczny edytor

Nowe i istniejące plany pokazują jeden trening wybrany z listy tygodnia/dnia/liczby ćwiczeń. „Podgląd całego planu” ma zwijane treningi, przejście do treningu i edycję wskazanego ćwiczenia. Karty pokazują nazwę, wariant/sprzęt, bloki zaleceń, obciążenie, przerwę i użyte tempo/RPE/RIR, jawne braki oraz opcjonalność. Uwagi mają krótki podgląd i pełne rozwinięcie; indywidualne uwagi serii nie giną w projekcji bloku. Superserie mają wspólną ramkę.

„Edytuj ćwiczenie” obejmuje prywatny katalog, nazwę, wariant/sprzęt, przypisanie do treningu i uwagi. „Edytuj serie” domyślnie edytuje blok identycznych parametrów; przełącznik udostępnia pojedynczą serię. Można dodać osobny blok. Podstawowe pola to liczba serii, cel, obciążenie i przerwa; „Dodaj zakres” pokazuje górną granicę, a istniejący zakres jest rozwinięty. Cel i obciążenie odsłaniają odpowiednie pola; podstawę hantli pokazuje właściwy sprzęt lub zapisana wartość. Rodzaj serii, tempo, RPE/RIR, uwagi i opcjonalność są na żądanie. Istniejący cel złożony pozostaje zachowany przy edycji innego pola.

Okno jest modalne na desktopie i pełnoekranowe na telefonie. Zastosowanie waliduje fragment i aktualizuje szkic; anulowanie/Escape/zamknięcie odrzucają formularz. Fokus wraca do karty. Dodawanie działa na kopii, a usunięcie ćwiczenia lub treningu wymaga potwierdzenia. Edycja treningu obejmuje także kolejność; nazwa i pozycja są stosowane razem. Przeniesienie ostatniego ćwiczenia zostawia jawnie pusty trening do uzupełnienia lub usunięcia; nie kasuje jego uwag automatycznie.

Dyktowanie jest w osobnym oknie i wymaga świadomego dodania propozycji. Pasek zapisu pokazuje stan zmian; na telefonie pozostaje w toku strony, żeby nie zasłaniać kart, na desktopie jest przyklejony. Link wyjścia i przeładowanie ostrzegają o zmianach; Chrome używa również Navigation API dla przycisku Wstecz. Publikacja waliduje cały dokument i tworzy całą wersję; błąd wskazuje niekompletny trening. Podczas wysyłania edycja jest zablokowana, retry używa identycznych danych/ID. Nie ma trwałego autosave. Trzy kroki importu pozostają bez zmian.

## T13 — A/B/C lokalnie, kalendarz planowany

D033 i [specyfikacja R01–R16](T13_MOBILE_WORKOUT.md) opisują uzgodniony podgląd z selektorem treningu, zwarte karty, osobne szczegóły ćwiczenia/jedną serię, jawne rozstrzygnięcie aktywnej sesji oraz kalendarz. A/B/C są lokalnie w review po przyjętych bramkach; kalendarz D pozostaje planowany. Rewizja pozostaje w kontrakcie, znika z głównego UI. Odrzucenie szkicu formularza i trwałe usunięcie sesji to różne działania. Korekta czasu przy finish nie przelicza celów. Dokładne stany, kolejność superserii, dostępność, ochronę szkiców i wymagania 360/390/430 px utrzymuje specyfikacja T13.


### T13-B — wykonany lokalny podgląd planu

Pierwszy trening otwiera się domyślnie; jawny wybór zapisuje tylko ID jednostki w lokalnej pamięci dla planu/wersji. Nieprawidłowy/usunięty wybór wraca do pierwszej jednostki; odmowa pamięci nie blokuje wyboru. Identyczne nazwy rozróżnia kolejność, bez scalania. Wersje są pod rozwijanym wyborem; archiwalna nie oferuje startu ani wznowienia. Start otwiera dotychczasowy formularz T05 na żądanie, z osobnym stanem dla jednostki; automatyczny czas/rozstrzyganie konfliktu dopiero C.

Karta ma nazwę, skrót sąsiadujących bloków, obciążenie/przerwę oraz jawne oznaczenie opcjonalności i superserii. Dłuższy cel pokazuje dwa pierwsze bloki i liczbę dalszych; „Wszystkie serie” pokazują każdy cel, notatkę i źródło, oryginał, wariant/sprzęt i zakres serii. „Kontekst treningu i źródła” zachowuje tydzień oraz uwagi i datę podglądu 1RM. „Podgląd całego planu” zawiera wszystkie jednostki z krótkimi zaleceniami i przejściem do wyboru; fokus trafia w nagłówek wybranego treningu. Natywne details/summary obsługują klawiaturę i stan rozwinięcia. Faktyczny odbiór oraz ograniczenia: handoff B wskazany w STATUS. Edytor i import zachowują dotychczasowe kontrolki kontekstu tygodnia; nie zmieniono ich dokumentów ani parsera.


### T13-C — wykonany lokalny widok sesji

Przegląd pokazuje nazwę, datę/godzinę lub „godzina nieznana”, osobne liczniki i zwarte karty. Zwartość opisuje układ T13. Bramką pozostaje doskrolowanie zasłoniętej karty (D046), także przy 390×844. Grupa superserii prowadzi rundami, nie uzupełnia braków. Szczegóły pokazują jedną serię, historyczny cel, poprzedni wynik, właściwe pola oraz dodatkowe RPE/RIR/komentarz. Istniejące dodatkowe wartości otwierają sekcję. Wszystkie serie pozwalają wybrać również historyczną poprawkę. Opcjonalne wymagają wyboru; pominięcie pozostaje osobnym stanem.

ACK i aktualny GET poprzedzają przejście. Błąd sieci zachowuje pełną komendę retry; nieudany GET ponawia tylko odczyt.409 zachowuje szkic do odczytu i świadomego rozstrzygnięcia. Komentarz i dodatkowe ćwiczenie mają formularze na żądanie; zapis serii zachowuje inny szkic. Powrót z brudnej serii i wyjście z karty dają zapisz/odrzuć/zostań; Chrome Wstecz zachowuje dokument i pozycję. Przeładowanie/zamknięcie używa natywnego ostrzeżenia przeglądarki. Trwałości szkiców po zamknięciu nie obiecujemy.

Start zapisuje czas automatycznie. Konflikt pokazuje własne sesje i jawne powrót/finish/delete; wiele legacy rozstrzyga się indywidualnie. Delete ma dodatkowe potwierdzenie z nazwą i ostrzeżeniem. Replace jest jedną komendą A. Finish pozwala skorygować datę/godzinę w strefie profilu i wymaga jawnego offsetu podwójnej godziny, bez zmiany historycznych celów. Głos jest propozycją z kotwicą serii i rewizji. Lokalny odbiór: handoff C w STATUS; telefon/Safari i kalendarz pozostają osobnymi pracami.


## T14 — zatwierdzony kierunek wizualny, makiety

D039: Plany A z poziomym swipe wielu planów, Podgląd A, Szczegóły A, Zapis serii C. Równoważna obsługa strzałkami/wskaźnikiem/klawiaturą, bez automatycznej rotacji. Właściciel przegląda po trzy warianty pozostałych ośmiu ekranów. [Specyfikacja i ograniczenia](design/t14-selected-spec.md), [galeria syntetyczna](design/t14-full-gallery.html). To projekt UI, nie wdrożenie; prywatny podgląd źródła pozostaje poza repo. Kontrakty T13 i niezmienność historii nadal obowiązują.

## T16 — Tempo jako jedyny wygląd

D047 wybiera Tempo jako jedyny docelowy wygląd i zastępuje paletę Noc. Drugi motyw i przełącznik palet nie wchodzą do produktu. D046 zostaje: lista może wchodzić pod dolną nawigację, a zasłonięta karta ma być doskrolowalna. Semantyka ekranów T13 i T15, w tym `null`, zero, „Nie dotyczy”, konflikty, retry i historyczne cele, pozostaje. [Program T16](T16_TEMPO_IMPLEMENTATION.md), [brief](tempo-implementation-brief.md) i [katalog klatek](tempo-frame-catalog.md) opisują wygląd. T16-A jest kontraktem. T16-B–H wprowadziły Tempo do drzewa roboczego. T16-I nie zamknął odbioru: główny zapis serii przy 390×844 zachodzi na dolną nawigację i wraca do T16-D.

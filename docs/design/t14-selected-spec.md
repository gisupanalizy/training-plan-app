# T14 — wybrany kierunek i pełny zestaw ekranów

Aktualizacja: 2026-10-18. Powierzchnia: Operate, mobilna aplikacja webowa. Metoda: impeccable, zachowana stylistyka Forma i analiza rzeczywistych komponentów; odczyt dokumentu przez skill pdf. Status: mock-upy gotowe do review, bez implementacji aplikacji.

## R6 — poprawka kliknięcia myszą

Naprawiono zgłoszony brak szczegółów przy zwykłym kliknięciu: pointer capture zaczyna się dopiero po rozpoczęciu przeciągania, dzięki czemu click trafia w marker. Widoczna informacja o dacie/metryce i źródłowej serii pozostaje po zdarzeniu, klik poza punktem ją zamyka. Dotyk, klawiatura, pinch i swipe zachowane. Nie zmienia to wymagań lub wyglądu R5/D044. [Handoff R6](../handoffs/2026-10-18-T14-R6-klik-punktu-mysza.md) rozdziela poprzednie ograniczenie testów od nowego sprawdzenia myszy w iframe. T15 pozostaje planem.

## Bieżące doprecyzowanie R5 — Noc, Profil A i punkty

Użytkownik wybrał **Noc jako domyślną paletę oraz Profil A** (D044). Wszystkie wybory układów są zamknięte. Główna galeria używa Nocy we wszystkich ramkach, także po reload; osobna galeria nadal porównuje sześć palet i oznacza Noc jako domyślną. Jasny R4 poniżej jest poprzednią rundą, nie bieżącym wymaganiem motywu.

Punkty pochodzą wyłącznie z dat treningów fixture'ów, nie z interpolacji. W prawdziwej aplikacji mają reprezentować wyłącznie zapisane wyniki. Daty na osi są orientacyjnymi podziałkami, a nie kompletną listą pomiarów. Dopisek „Punkt = trening” i dymek punktu pokazują dokładną datę/metrykę, przy ciężarze/estymacji również źródłową serię. **Tylko punkt otwiera informację, klik poza punktem — na pustym wykresie lub poza nim — ją zamyka.** Nie wybieramy najbliższego wpisu z całego obszaru SVG. Mały marker ma niewidoczny obszar dotyku44px i dostęp z klawiatury.

Ikona informacji przy szacowanym1RM lub ponowny klik aktywnej metryki otwierają osobną chmurkę z metodą, przykładem100÷0,94≈106,4kg, współczynnikami1–10 i informacją o rozdzieleniu od ręcznego1RM. Escape i klik poza pomocą zamykają ją. Metoda pozostaje propozycją techniczną; źródło Hevy sprawdzono ponownie2026-10-18. Rekordy mają natywny swipe w obie strony; finalny runner R5 sprawdza go przez CDP touch, a nie tylko klawiaturą.

[Plan wdrożenia T15](../T15_UI_IMPLEMENTATION.md) rozdziela fundament, obszary produktu i odbiór. [Handoff R5/P](../handoffs/2026-10-18-T14-R5-T15-P-interakcje-i-plan.md) opisuje fakty i ograniczenia. Kod produktu i inni agenci nie zostali uruchomieni. Poniższe sekcje R4/R3/K są historią.

## Bieżący projekt R4 — uproszczony Postęp

Na szczegółowe zlecenie użytkownika Postęp ma **jeden układ i dwa przykłady ćwiczeń**, zamiast wyboru kompozycji A/B/C. W galerii widać obok siebie Wyciskanie leżąc (Sztanga) i Podciąganie na drążku. Każdy dropdown pozwala też zmienić ćwiczenie w danym podglądzie. Poprzednie wybory pozostałych ekranów pozostają; do rozstrzygnięcia nadal układ Profilu i paleta. R4 jest gotowy do oceny wizualnej, nie oznacza implementacji aplikacji.

Układ jest jasny, w zgaszonej zieleni z lokalnym fontem Inter. Duży tytuł „Postęp” zastępuje dodatkową belkę logo na tej stronie. Pod nim jest prosty dropdown i segmenty metryk. Ciężar: **Szacowany1RM** (domyślnie), **Max Ciężar**, **Objętość**. Masa ciała: **Max Powtórzeń** i **Suma Powtórzeń**. Jedna czysta linia, podpisane wartości osi Y i daty osi X; bez bąbelków, selektora konkretnego ciężaru lub żółtego bannera. Dane demonstracyjne są oznaczone nad ramkami oraz w rozwijanym opisie, bez bannera w głównym widoku.

Mały pasek1M/3M/6M/1R/Wszystko znajduje się bezpośrednio **pod** osią X, domyślnie3M. Pod wykresem są trzy małe kafelki rekordów w poziomym przewijaniu. Nagłówek „Rekordy osobiste · Cała historia” wyjaśnia zakres. PR są niezależne od wybranego okna wykresu. Ciężar: Max1RM ze stałym dopiskiem „szacowany”, Max Ciężar z powtórzeniami konkretnej serii i Max Objętość z datami. Masa ciała: najdłuższa seria, max w treningu i najwięcej serii, również z datami. Kafle są dostępne do przewijania klawiaturą.

Pinch nadal przybliża/oddala **daty** wykresu, a jeden palec przewija ekran. Ukryte na co dzień szczegóły zapewniają +/−/reset i własne daty. Sam wykres ma też klawiaturę (+/−, strzałki, Home). Uproszczono ekspozycję sterowania bez blokowania dostępu do poprzednich funkcji.

Nowe wymaganie użytkownika dopuszcza **szacowany1RM wyłącznie jako metrykę Postępu**. D002 i ręczny, zmierzony1RM z datą w Profilu nadal obowiązują dla zaleceń procentowych. Wynik analizy niczego tam nie zapisuje. W makiecie zastosowano referencyjną [tabelę Hevy](https://help.hevyapp.com/hc/en-us/articles/36954464726167-Understanding-Your-Estimated-One-Rep-Max-1RM-in-Hevy): kg dzielone przez udział dla1–10 powtórzeń (1.00,.97,.94,.92,.89,.86,.83,.81,.78,.75); poza tym zakresem/brak kg wynik jest niedostępny. Wybór metody jest propozycją dla przyszłej implementacji, nie przyjętym standardem. [Strong](https://help.strongapp.io/article/133-1rm) dokumentuje inną metodę (Brzycki), więc nie zakładamy identyczności liczb między aplikacjami.

Wartości demonstracyjne są wyprowadzone z tych samych serii: max100kg×3, najwyższy szacunek≈106,4kg i objętość1480kg w innym treningu. Objętość oznacza sumę kg×powtórzenia w sesji przy porównywalnym zewnętrznym obciążeniu. Brak i0 pozostają rozróżnione; masa ciała nie otrzymuje0kg. To nie odczyt historii właściciela.

Osobny przycisk edycji ćwiczenia usunięto. Cała karta, w tym parametry, otwiera dotychczasowy pełny formularz przez kliknięcie lub Enter. [Inter i pochodzenie/licencja](fonts/README.md). [Handoff R4](../handoffs/2026-10-18-T14-R4-minimalny-postep.md) podaje sprawdzenia i ograniczenia. Poniższe opisy R3/R2/K są historią wcześniejszych rund.

## Historyczne wybory i dopracowanie R3

D042 utrwala kolejne decyzje użytkownika: **Start A, Import C, Korekta A, Edytor A, Historia A, Logowanie C**. Wcześniejsze A/A/A/C pozostaje. Galeria blokuje te wybory niezależnie od starej preferencji przeglądarki; Postęp, układ Profilu i paleta pozostają otwarte. Warianty niewybrane są zachowane w wygenerowanych ramkach jako archiwum, nie jako alternatywa do ponownego wyboru już potwierdzonych ekranów. Galeria kolorów również korzysta z zatwierdzonych układów.

Import C ma wyśrodkowane ikony źródeł oraz ikonę edycji przy „Utwórz ręcznie”. Korekta A używa nagłówka „Nazwy ćwiczeń i kolejność”. Edytor A udostępnia całą kartę i osobny przycisk „Edytuj ćwiczenie”. Formularz obejmuje nazwę, serie/powtórzenia, rodzaj zadania/obciążenia, przerwę i rozwijane parametry poszczególnych serii, tempo, RPE/RIR, grupę i uwagi. Zapis/anulowanie jest lokalną symulacją; ponowne otwarcie zachowuje zmiany w bieżącej ramce, zmiana ekranu przywraca dane artefaktu. Nie publikuje wersji ani nie zmienia źródłowego PDF. Wersja produkcyjna nadal wymaga walidacji i kontraktów aplikacji.

Nazwy „Serie” i „Powtórzenia” są właściwe dla zadania powtórzeniowego. Czas, dystans, AMRAP i niejasny zapis źródłowy mają odrębne tryby; zakres i brak danych nie są zgadywane. Dodatkowe serie z zakresu zachowują oznaczenie opcjonalności przy edycji.

Postęp R3 to trzy nowe propozycje na tej samej syntetycznej historii:

- **A — dwa wykresy:** największy ciężar w sesji i powtórzenia dokładnie tej samej serii, ze wspólnym oknem dat. Przy remisie kg wybierana jest większa liczba powtórzeń. Nie łączymy maksimum kg z maksimum powtórzeń z innej serii.
- **B — stały ciężar:** najwięcej powtórzeń w serii przy wybranych kg (np.65), z tabelą rzeczywiście osiągniętych ciężarów dla konkretnej liczby powtórzeń. Tabela dotyczy widocznego zakresu, brak rekordu nie jest zerem.
- **C — wszystkie serie:** każdy punkt to konkretny wpis, oś Y pokazuje kg, rozmiar punktu — powtórzenia. Dokładne wartości dostępne dotknięciem/klawiaturą i w tabeli. Nie jest to estymowany model siły.

Zakresy:1/3/6 miesięcy,1 rok, Całość i własne daty. Dwa palce przybliżają/oddalają okno czasu; jedna oś czasu obowiązuje oba wykresy A. Kontrolki +/− i reset dają alternatywę dla gestu. Jeden palec przewija ekran, a zoom dotyczy wykresu. Myszą można przesuwać przybliżone daty, Ctrl+wheel przybliża; nie blokujemy zwykłego pionowego przewijania. Brak danych pozostaje luką. Przykład masy ciała pokazuje powtórzenia i nie wymyśla0kg. Dane są wyłącznie demonstracyjne, bez odczytu historii właściciela.

Profil zachowuje **ręczny wpis rzeczywiście zmierzonego1RM z datą**, zgodnie z doprecyzowaniem użytkownika. Jest to parametr obliczeń, podczas gdy Postęp odczytuje wyniki serii. Nie używamy estymacji z wielopowtórzeniowych serii, nie tworzymy przez wpis profilu fikcyjnego treningu, nie przeliczamy historycznych celów. Sam układ Profilu A/B/C nadal wymaga decyzji.

Inspiracje sprawdzone2026-10-18 w źródłach producentów: [Hevy — metryki, całość historii i rekordy według powtórzeń](https://www.hevyapp.com/features/exercise-performance/), [Strong — historia, wykresy i rekordy ćwiczenia](https://help.strongapp.io/article/237-about-exercise-detail), [Fitbod — osobne metryki i dokładne serie w wynikach](https://fitbod.me/blog/exercise-history-and-records/). Własna interpretacja dla Formy, bez kopiowania ekranów, estymacji1RM, społeczności lub płatnych funkcji tych aplikacji. Zachowanie gestów oparto na [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) i [multi-touch](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Multi-touch_interaction).

Poniższe sekcje opisują wcześniejsze rundy i ich odbiór; bieżące zmiany R4 oraz najnowszy handoff mają pierwszeństwo.

## Potwierdzony wybór

Użytkownik wybrał Plany A z poziomym swipe wielu planów, Podgląd A, Szczegóły A i Zapis serii C. To rozstrzygnięcie D039, nie propozycja. Nie zmienia modeli danych ani bramek T13. Pozostałe ekrany czekają na osobne wybory.

[Połączone cztery ekrany na danych syntetycznych](t14-selected.html). [Pełna publiczna galeria](t14-full-gallery.html). Prywatna galeria z PDF jest poza repozytorium, w katalogu wizualizacji wskazanym w najnowszym handoffie. Publiczne pliki nie zawierają prywatnego planu ani jego zrzutów.

## Zakres nowego wyboru

Każdy z ośmiu ekranów ma trzy propozycje kompozycji w tej samej tożsamości wizualnej:

- **Start:** A — plan i lista treningów; B — najpierw jednostka; C — podgląd wybranego treningu.
- **Import:** A — lista źródeł; B — zakładki źródeł i dokument; C — kafelki wyboru źródła.
- **Korekta importu:** A — trzy kroki i lista; B — pytania do wyjaśnienia na pierwszym planie; C — oryginał i propozycja przełączane na telefonie. Każda zachowuje etapy ćwiczenia, serie/superserie i podsumowanie.
- **Edytor:** A — karty i edycja na żądanie; B — parametry serii jako główna treść; C — rozwijane treningi.
- **Historia:** A — kalendarz i dzień; B — lista chronologiczna; C — pasek dat i trening wybranego dnia.
- **Postęp (R2):** A — wykres wpisanego ciężaru, powtórzenia i ostatnie wpisy; B — wykres objętości kg × powtórzenia i wykonanie serii; C — wykres ciężaru oraz wykonane/pominięte/oczekujące serie wymagane, z opcjonalnymi i dodatkowymi osobno.
- **Profil:** A — grupy maksimów i ustawień; B — rozwijane sekcje; C — osobna karta maksimów i ustawień.
- **Logowanie:** A — formularz od razu; B — wprowadzenie i formularz; C — skupiony panel konta. Bez tworzenia płatności, publicznych kont lub nowego przepływu zaproszeń.

Galeria pozwala wskazać A/B/C osobno dla każdego ekranu. Zapamiętuje wyłącznie identyfikatory preferencji w localStorage danej przeglądarki i origin. „Kopiuj moje wybory” przygotowuje tekst do wklejenia przez użytkownika; nie wysyła go agentowi ani do innego serwisu. Cztery wcześniejsze wybory są stałe.

## Kontrakt kierunku

THESIS: ćwiczenie rozpoznaje się po nazwie i symbolu ruchu, a serię, obciążenie lub intensywność i przerwę znajduje się w stałym miejscu. Szczegóły mają odrębne zadania czytania.

OWN-WORLD: istniejąca Forma — jasne tło, ciemna zieleń #183b31, akcent #d7f26d, płaskie powierzchnie, typografia robocza Arial/Helvetica, spójne ikony SVG. Karty A pozostają zwarte, formularz C jest przestronniejszy.

STORY: wybrać plan i trening, rozpoznać ćwiczenia, obejrzeć wierne zalecenia oraz zapisać rzeczywiste wykonanie oddzielnie od celu.

FIRST VIEWPORT: w Planach jedna główna karta z podglądem sąsiedniej, swipe i równoważne strzałki/wskaźnik; w Podglądzie nazwa planu, wybór jednostki i cztery pełne karty przy390×844; w Szczegółach nazwa, kluczowe parametry, serie i oddzielone wskazówki; formularz C pokazuje jeden cel i pola wykonania.

FORM: zatwierdzone przez użytkownika połączenie A/A/A/C z wcześniejszej rundy, seed:42c688629bfc0a73. Nowe osiem ekranów podlega wyborowi układu, nie ponownemu losowaniu tożsamości.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance. W tej sesji powstają artefakty projektowe, nie shipping UI: przegląd makiet i dokumentacja są wykonane, globalny DESIGN.md produktu nie jest deklarowany jako wdrożony. Po zamknięciu wyborów osobno ustalić wdrożenie i trwały opis systemu wizualnego.

## Prywatny dokument

Użytkownik wyraźnie zlecił wykorzystanie wskazanego pliku. Odczytano tabele i obejrzano właściwe strony PDF, porównując układ komórek z ekstrakcją. Prywatne dane, JSON, renderowane strony, kopia źródła, HTML i zrzuty pozostają poza repo. Dane z opisu zdrowotnego nie zostały włączone do modelu makiet. Nie odczytywano konta, istniejącego szkicu z bazy ani produkcyjnego importu AI; to lokalny model odczytany ze wskazanego źródła.

Zachowano nazwy źródłowe obok rozpoznawalnych etykiet PL, zakresy i złożone bloki serii, superserie, uwagi indywidualne, porady i progresję. Nie utożsamiono ogólnego „intensywność %” z rzeczywistym 1RM. Nie wpisano wymyślonych kg. Zapis X i znaczenie UM pozostają do wyjaśnienia; publikacja w makiecie korekty pozostaje nieaktywna do rozstrzygnięcia. To ostrożna prezentacja źródła, nie zmiana już zatwierdzonych danych w aplikacji.

Historia i postęp przedstawiają oznaczone dane demonstracyjne. Nie są wynikami właściciela, nie zostały wyprowadzone z PDF. W profilu maksimum pozostaje polem do ręcznego wpisania, a nie automatycznym przeliczeniem źródła.

## Weryfikacja i odtwarzanie

- Publiczne makiety: `t14-full-build.py` bez `--data`; raport [t14-full-verification.json](t14-full-verification.json),64 stany ×360/390/430 px =192 kontrole szerokości, bez overflow i błędów JS.
- Prywatne: generator `--data <prywatny JSON> --out <plik poza repo>`.124 stany ×360/390/430 px =372 kontrole, bez overflow i błędów JS. Raport jest poza repo. Generator odrzuca prywatny output wewnątrz repo.
- Podgląd390×844: czwarte karty prywatnych jednostek kończą się677,36/692,86/677,36 px, przy końcu obszaru701 px. Wszystkie cztery mieszczą się przed przyciskiem startu. To rozwiązuje ograniczenie2px pierwszej makiety A bez zmiany bramki T13.
- Rzeczywisty HTML makiet w Chrome headless: import→trzy kroki, nieaktywne zatwierdzenie przy niejasnościach, źródło/propozycja, preferencja po reload i reset, ręczny wynik0 i puste kg, symulacja logowania, galeria390px. Karuzela: syntetyzowany dotyk Chromium lewo/prawo oraz ArrowRight, nie tylko screenshot.
- Obejrzano zbiorczo wszystkie nowe ekrany i zrzuty po korekcie gęstości kart/ukrywania kontrolek. Kopie publiczne zrzutów zawierają wyłącznie dane syntetyczne. Prywatne zrzuty nie są commitowane.
- Nie sprawdzano fizycznego telefonu, Safari, mikrofonu, prawdziwego importu, autoryzacji, API, zapisu do bazy ani produkcyjnego builda aplikacji — kod src nie był edytowany. Kalendarz/wykresy i stany formularzy są propozycjami prezentacji, nie wykonaniem T13-D lub zmianą funkcji.

Odtwarzanie wymaga interpretera Python runtime desktopowego; podczas próby systemowy interpreter zgłosił błąd kodowania, podczas gdy odczyt UTF-8/AST oraz interpreter runtime przeszły. Nie ustalono przyczyny różnicy i nie zmieniano systemowego Pythona. Runner `t14-full-verify.mjs` przyjmuje T14_GALLERY_URL, T14_REPORT_DIR i opcjonalnie T14_PLAYWRIGHT_MODULE. Przy prywatnym wejściu raport/zrzuty też kierować poza repo.

Funkcje pomocnicze importu/edycji nie realizują całego procesu aplikacji: część przycisków pokazuje stan/wyjaśnienie i nie wykonuje operacji. Preferencje są lokalne, przy braku Clipboard API tekst pozostaje do ręcznego odczytu. To materiał do wyboru i dopracowania, nie test prywatnych danych w prawdziwym API.

## R2 — korekta po feedbacku użytkownika

Etapy importu mają różne zadania i treść: **Ćwiczenia** pokazują nazwy, oryginalne etykiety, kolejność i grupy; **Serie** pokazują cele, liczbę serii, intensywność lub kg, przerwy i superserie; **Podsumowanie** pokazuje wszystkie treningi, status jawnych potwierdzeń i nierozstrzygnięte pytania. Sama nawigacja między krokami nie potwierdza sprawdzenia. Zmiana nazwy/kolejności działa lokalnie w danym podglądzie; nie jest trwałą edycją modelu lub API.

Cała karta ćwiczenia, włącznie z dolnymi parametrami, jest jednym przyciskiem otwierającym szczegóły; obsługuje Enter i widoczny fokus. Dodatkowe akcje edytora są osobnymi przyciskami poza nim. Karuzela zachowuje natywny dotyk, strzałki i klawiaturę. Dodano przeciąganie myszą od dowolnego miejsca karty i blokadę przypadkowego otwarcia po przeciągnięciu. Pionowy gest nad karuzelą może przewijać ekran.

W bieżącej pełnej galerii szkice zastąpiono lokalnymi ilustracjami **Workout Guide**; [pochodzenie, licencja CC BY-SA 4.0 i manifest](exercise-assets/README.md). Dokładnie dopasowane warianty mają ilustracje. Pozostałe mają neutralne oznaczenie „ĆW / WŁASNE”; pokrycie katalogu nadal wymaga review, bez przypisywania podobnej pozycji. Stare galerie pozostają archiwum wcześniejszych propozycji.

Wszystkie warianty Postępu mają wykres, jednostki, daty i dane demonstracyjne. Punkty reagują na kliknięcie/Enter; filtry ćwiczenia i 4/8 tygodni zmieniają dane i statystyki. Brak danych jest luką, nie zerem. A/C pokazują wpisany ciężar, bez estymacji1RM. B ogranicza objętość do porównywalnego obciążenia zewnętrznego; masa ciała i asysta wymagają osobnej interpretacji. Wykonanie w C jest jawnie opisane jako ostatnie cztery tygodnie.

Ponowione192 publiczne i372 prywatne kontrole szerokości oraz bramka czterech kart PASS. Prywatny runner R2: wszystkie siedem grup interakcji PASS, brak błędów JS. Publiczny runner R2 zatrzymał się na teście przeciągania myszą; przyczyny nie ustalono. Kolejną próbę Chrome zatrzymała automatyczna kontrola uprawnień z powodu limitu usługi, bez wykonania działania. Nie deklarujemy pełnego PASS publicznego runnera R2. [Handoff R2](../handoffs/2026-10-18-T14-R2-import-gesty-wykresy.md) zawiera dokładne granice i następny krok. Fizyczny telefon i Safari pozostają niesprawdzone.

## T14-K — osobny wybór kolorystyki

[Galeria kolorów na danych syntetycznych](t14-colors.html) oraz lokalny prywatny odpowiednik porównują sześć palet: Las (obecna), Kobalt, Miedź, Morska, Grafit i Noc (ciemna z bursztynowym akcentem). Są propozycjami, nie zatwierdzonym motywem. Zachowują treść, wielkość kart, typografię i układy A/A/A/C. Kolor ma rolę w tle, powierzchni, tekście, akcjach, zaznaczeniu, ostrzeżeniach i wykresach; nie zmienia znaczenia treningowych danych.

Palety można porównać obok siebie lub wybrać pojedynczy podgląd. Dostępne są wszystkie ekrany; nowe korzystają z lokalnego wyboru A/B/C w głównej galerii, a przy jego braku z A. Przejście w podglądzie zmienia wspólny stan dla wszystkich palet. Filtry wykresów zachowują paletę po przerysowaniu. Panel na telefonie jest rozwijany; startuje pojedyncza paleta. Skala szarości jest pomocą w ocenie hierarchii, nie symulacją konkretnej wady widzenia barw.

Wybór zapisuje wyłącznie identyfikator palety pod osobnym kluczem `forma-color-choice-v1`. Nie zatwierdza kolorów w produkcie, nie zmienia układów ani kolorystyki głównej galerii. Kopiowanie przygotowuje tekst do przekazania przez użytkownika. Dane prywatne, HTML i obrazy pozostają poza repo. Odnośnik „Porównaj osobno kolorystykę” prowadzi z pełnej galerii do osobnego pliku; powrót prowadzi do właściwej galerii publicznej/prywatnej.

Weryfikacja K:216 publicznych i216 prywatnych stanów (6 palet ×12 reprezentatywnych ekranów ×3 szerokości360/390/430), brak overflow i błędów JS. Cztery karty390×844 w każdej palecie/jednostce. Kontrast72 par tokenów: tekst min5,53:1; kontrolki/fokus min3,71:1. To pomiar wybranych ról, nie certyfikat dostępności wszystkich stanów. Preferencja/reload, przejście kartą, filtr wykresu i mobilny panel PASS. [Raport publiczny K](t14-color-verification.json); prywatne dane/zrzuty poza repo.

Uzupełnienie R2 po przywróceniu kontroli uprawnień: ponowiono publiczny runner, wszystkie siedem grup PASS ([raport](t14-r2-verification.json)). Wcześniejszy błąd drag nie odtworzył się; brak ustalonej przyczyny, bez nowej zmiany kodu gestu. Wcześniejsze nieudane próby pozostają faktem w handoffie R2.

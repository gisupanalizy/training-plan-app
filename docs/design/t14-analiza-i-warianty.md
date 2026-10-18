# T14 — analiza czytelności i trzy warianty mobilne

Data: 2026-10-18. Status: propozycje do wyboru użytkownika, bez wdrożenia. Tryb powierzchni: Operate. Użytkownik potwierdził telefon jako podstawowe urządzenie i cztery ekrany: lista planów, podgląd treningu, szczegóły ćwiczenia, zapis serii.

[Otwórz samodzielną galerię](t14-mockupy.html). Zrzuty: [plany](t14-plans.png), [podgląd](t14-plan.png), [szczegóły](t14-detail.png), [zapis serii](t14-workout.png). Lokalnie można uruchomić `python3 -m http.server 8791 --bind 127.0.0.1 --directory docs/design` i otworzyć `/t14-mockupy.html`. Plik HTML zawiera wszystkie dane, CSS, ikony SVG i interakcje; działa także po otwarciu z dysku.

## Punkt odniesienia i granice analizy

Przeczytano README, STATUS, ROADMAP, handoff B, specyfikację T13, UX, DECISIONS, WORKFLOW i TESTING oraz rzeczywiste komponenty strony głównej, planów, PlanPreview, ExerciseSummary i CSS. Obejrzano syntetyczny zrzut B `/private/tmp/t13b-390.png` z 2026-10-18; obecne style i struktura B potwierdzają zgodność tego punktu odniesienia. Nie przeglądano prywatnego konta właściciela ani wdrożenia produkcyjnego. W trakcie sesji oddzielna praca C przeszła z in_progress do review; przeczytano nowy handoff C i bieżącą strukturę WorkoutEditor. C już rozdziela przegląd i jedną serię — propozycje T14 rozwijają czytelność tej struktury, nie przypisują sobie jej wdrożenia. Zachowano cudze zmiany i ich statusy.

To przegląd heurystyczny z makietami, nie badanie użytkowników ani pełny audyt dostępności. Nie oznaczono całej aplikacji jako zgodnej z WCAG. Brak testów na fizycznym telefonie/Safari. Zrzuty makiet nie są zrzutami wdrożonej aplikacji.

## Najważniejsze problemy

1. **Parametry wymagają czytania całego zdania.** `compactPrescription` trafia do pojedynczego akapitu `.preview-prescription` o wielkości 12 px. Serie, powtórzenia, procent/kg i przerwa mają podobną wagę i zmienną pozycję. Wniosek: stała kolejność i rozdzielone pola „Serie × powt.”, „Obciążenie”, „Przerwa”; kg mocniejsze, podstawa procentowa obok lub poniżej. Nie ukrywać różnych bloków, AMRAP, zakresów i opcjonalności za jednym pozornie wspólnym celem.
2. **Rozwinięcie nie wyznacza dostatecznie różnych zadań czytania.** `ExerciseSummary` układa oryginał, wariant, sprzęt, uwagi, źródło i pełne serie w podobnych akapitach/listach. Wniosek: tabela każdej serii z nagłówkami, osobny panel uwag i osobno rozwijany oryginał/źródło. Pierwszeństwo mają zalecenia treningowe; źródło pozostaje dostępne.
3. **Brakuje rozpoznawalnych oznaczeń ruchu.** Na kartach B pozycję oznacza numer. Wniosek: spójne piktogramy konkretnego ćwiczenia — przysiad, ławka, wiosłowanie, drążek — z zawsze widoczną nazwą. Dla nierozpoznanego ćwiczenia potrzebny neutralny symbol sprzętu/ruchu; nie zgadywać wariantu ani przypisania. Ikona nie jest instruktażem techniki.
4. **Hierarchia poza właściwym zadaniem bywa silniejsza niż treść.** Strona startowa zawiera duży hero i monogram, a lista planów wymaga dalszego wejścia do jednostki. Wniosek projektowy: na ekranach roboczych nazwa planu, wybór treningu i ćwiczenia mają prowadzić wzrok; dekoracyjny nagłówek ustępuje miejscu zadaniu. To propozycja kompozycji, bez zgody na zmianę całego przepływu startowego.
5. **Plan i wynik muszą mieć odrębne znaczenie.** C ma już osobny cel i ręczny zapis, ale jego „Wszystkie serie” nadal składają cel, wynik i stan w wielowierszowy tekst. Wniosek: przy wdrożeniu wybranego wariantu utrzymać wyraźne etykiety celu, wyniku i stanu. Makiety mają puste pola oraz jawne „Uzupełnij zgodnie z planem”, a zapis jest osobną akcją.

## Wariant A — Rytm

Krótkie karty z symbolem ruchu i trzema pozycjami parametrów. Szczegóły otwierają osobny ekran z nazwą ćwiczenia, trzema najważniejszymi wartościami, tabelą serii, wskazówką i źródłem. Powrót prowadzi do planu. Zapis serii skupia się na jednym wykonaniu.

Korzyść: równowaga szybkiego skanowania i spokojnego czytania szczegółów. Koszt: przejście do osobnego ekranu; docelowo należy zachować scroll i fokus jak w C. Przy 390 × 844 treść czterech kart jest widoczna, lecz 2 px dolnego obrysu czwartej wychodzą poza obszar przewijania (703 wobec 701 px). To nie spełnia jeszcze ścisłej bramki czterech pełnych kart T13; przy wybranym wdrożeniu trzeba ją zachować. To ograniczenie makiety, nie zmiana kryterium T13.

## Wariant B — Zestawienie

Wiersze ćwiczeń i wspólne kolumny parametrów. Serie rozwijają się w miejscu, pozostałe ćwiczenia nadal należą do tej samej listy. Widok zapisu ma jawny wybór numeru serii.

Korzyść: najwięcej porównywalnych danych w jednym widoku; cztery pełne ćwiczenia w 390 × 844 (czwarte kończy się na 697 px, obszar do 701 px). Koszt: długie nazwy oraz złożone zalecenia wymagają dodatkowych wierszy. Rozwinięcie dalszego ćwiczenia wymaga przewinięcia do niego; to wymaga dopracowania zarządzania fokusem w implementacji.

## Wariant C — Karty

Większe symbole ćwiczeń, odrębny pas planu i przestronne pola parametrów. Szczegóły mają osobny biały obszar poniżej podsumowania. Nie jest to zagnieżdżony modal ani dodatkowa warstwa blokująca formularz.

Korzyść: najmocniejsze rozróżnienie informacji i największe symbole. Koszt: przy 390 × 844 mieszczą się tylko dwie pełne karty; sprzeczne ze ścisłą bramką czterech kart T13. Wariant świadomie pokazuje tę alternatywę do oceny, ale jego wybór nie zatwierdza po cichu zmiany bramki. Użytkownik musi wybrać większą gęstość albo jawnie zaakceptować zmienione kryterium przed implementacją.

Rekomendacja projektowa: A jako punkt wyjścia, jeśli ważniejsza jest równowaga czytelności i zwartości; B, jeśli priorytetem jest porównywanie ćwiczeń bez opuszczania listy. Można połączyć listę A z rozwinięciem B. Wszystkie warianty zachowują nazwę Forma, istniejącą paletę i roboczą typografię systemową; wybór dotyczy przede wszystkim organizacji treści, nie konkurujących tożsamości marki.

## Materiał i interakcje

Dane są w całości syntetyczne: dwa treningi po cztery ćwiczenia, stałe kg, 75% × rzeczywiste przykładowe 1RM 120 kg = 90 kg, rampa 80/85/90 kg, ciężar na rękę, seria opcjonalna, brak 1RM oraz cel czasowy. Nie odczytano ani nie zapisano prywatnych planów. Wariant B zawiera również niezależny przykład procentu bez 1RM — służy ocenie etykiety braku, nie reprezentuje wspólnego profilu danych treningów A/B.

Działa: wybór ekranu/wariantu, porównanie, wybór treningu A/B, otwarcie właściwego ćwiczenia, źródło, wypełnienie pól zgodnie z celem, jawna symulacja zapisu i zaznaczenie preferencji. Brak backendu, trwałej pamięci preferencji, głosu, importu, ochrony szkiców i prawdziwego zapisu; pomocnicze akcje opisują swój zakres. Stan po odświeżeniu jest resetowany. Preferencję należy przekazać w chacie — kliknięcie przycisku w galerii samo nie wysyła wiadomości agentowi.

Do wdrożenia wybranego kierunku trzeba opracować także: długie nazwy/duże plany, superserie z nierównymi seriami, AMRAP i różne bloki, brak przerwy/obciążenia, null wobec zera, nieznane ćwiczenie, archiwalną wersję, błąd zapisu, retry/409, stan ładowania, ochronę szkicu, telefoniczną klawiaturę i historię. Nie pomijać tych wymagań tylko dlatego, że nie są głównym ekranem tej galerii. Kontrola właściciela i snapshoty A/B/C pozostają obowiązujące.

## Weryfikacja i odtwarzanie

[Raport](t14-verification.json): 42 stany × 360/390/430 px = 126 kontroli bez poziomego overflow; główne cele dotykowe w podglądzie co najmniej 44 px. Chrome headless, rzeczywiste HTML/CSS mock-upów. Sprawdzono wybór treningu, właściwe szczegóły wiosłowania i rampy, natywne źródło, wypełnienie i symulację zapisu, lokalny wybór wariantu i galerię 390 px. Brak błędów JS w zaliczonym przebiegu. Obejrzano zbiorczo zrzuty czterech ekranów i wąskiej galerii. Przeprowadzono jeden przegląd, zbiorczą korektę i potwierdzenie; błąd formularza wymagał osobnego powtórzenia jego kontroli.

Pierwsze uruchomienie serwera i Chrome w sandboxie zostało zablokowane ograniczeniami systemu; jawne eskalacje pozwoliły na lokalny przegląd. Pierwsza końcowa próba zatrzymała się na symulacji zapisu: iframe miał allow-scripts, ale nie allow-forms. Dodano allow-forms; handler przechwytuje submit, nie wysyła formularza. Ponowny przebieg PASS. Nie uruchamiano testów/builda aplikacji, bazy ani AI — kod aplikacji nie był zmieniany w T14. Stan T13 ma odrębne dowody.

Odtworzenie: `python3 docs/design/t14-build-mockups.py`, lokalny serwer opisany wyżej, następnie `node docs/design/t14-verify.mjs`. Runner wymaga modułu Playwright runtime desktopowego; można wskazać go przez `T14_PLAYWRIGHT_MODULE`. Zrzuty i raport zapisują się w docs/design. Generator odtwarza też trzy statyczne pierwsze widoki w `.impeccable/mocks/decision/` dla pomocniczej strony wyboru.

## Kierunek nie został zatwierdzony

Nie powstał finalny DESIGN.md ani kontrakt wybranego kierunku. Skorzystano z impeccable: kontekst projektu, reguły Operate, craft-floor i trzy propozycje układu; seed:42c688629bfc0a73. Pierwsza próba pobrania wyboru struktur była ograniczona sieciowo, ponowienie z jawną eskalacją powiodło się. Nie użyto agentów ani generowania obrazów; makiety powstały w HTML, a symbole ćwiczeń są autorskimi ikonami SVG. Brak płatnych prób API aplikacji. Skill zgłosił starszy schemat docs/PRODUCT.md; ewentualne init wymaga osobnego zlecenia i nie było warunkiem makiet.

Następny krok: użytkownik wybiera A/B/C lub połączenie i przekazuje uwagi. Dopiero potem można dopracować wybrany kierunek, rozpisać jego stany i osobno uzgodnić wdrożenie. Nie rozpoczynać automatycznie D ani zmian kodu produktu.

Uzupełnienie weryfikacji: pierwszy eksport wąskiej galerii uchwycił iframe przed załadowaniem treści. Naprawiono oczekiwanie na nagłówek w runnerze i ponowiono tylko ten eksport. Gotowy zrzut obejrzano; nagłówek „Fundament siły” i fokus przycisku właściwego ćwiczenia potwierdzone. Nie zmieniano UI ani nie powtarzano126 kontroli bez potrzeby. Pomocnicza strona wyboru po60s nie otrzymała odpowiedzi; wybór pozostaje otwarty.

# T15-E — kontrakt techniczny analityki v1

2026-10-18. Zapis integratora przed kodowaniem E. Wynika z D043/D044 i zbiorczego zlecenia T15; nie jest dowodem wdrożenia. Zwykłe rozstrzygnięcia techniczne poniżej przyjęte przez I w ramach zlecenia. Wymagania produktu pozostają w T15/PRODUCT.

## Tożsamość, czas i status

- Jeden punkt odpowiada parze `workoutId + exerciseId` (identyfikator katalogu rozróżnia warianty); powtórzone bloki tego ćwiczenia w jednej sesji są agregowane razem. Nie sklejamy ćwiczeń po nazwie.
- Odczyt sesji z `workout_read_model` używa autoryzowanego właściciela. `performed_on` jest już projekcją w bieżącej strefie profilu; pobieramy też `performed_at`, `time_zone`, status i identyfikatory. `created_at` nie zastępuje godziny treningu. Legacy date-only ma „godzina nieznana”.
- Zachowujemy semantykę T08: rzeczywiste serie `completed` z sesji `in_progress`, `completed`, `abandoned` mogą wejść do analizy; status sesji jest jawny w szczegółach. Przerwana sesja nie staje się zakończoną. Pending/skipped nie tworzą pomiarów. Brak wykonanych serii oznacza brak punktu.
- Dwie sesje tego samego dnia mają osobne punkty, źródła i etykiety. Gdy pokrywają się na wykresie, dostępna lista/tabela pozwala wybrać każdą z nich; nie wymyślamy godzin dla rozdzielenia.

## Porównywalność

- Zewnętrzny ciężar: zachowujemy konserwatywną kwalifikację T08. Ćwiczenie i seria planowane, katalog `external`, snapshot `absolute` albo `percent_1rm`, podstawa nie `per_hand`; przy rozpoznanych hantlach wymagana `total`. Używamy faktycznych kg, nie celu ani snapshotu maksimum.
- Szacunek i objętość wymagają faktycznych kg oraz powtórzeń. Max ciężar może mieć nieznane powtórzenia; wówczas etykieta mówi o ich braku, bez dopisywania liczby. Czas/dystans nie są seriami do estymacji; wykonawca sprawdza także snapshoty rodzaju zadania oraz rzeczywiste pola czasu/dystansu.
- Dodatki bez jawnej semantyki, asysta, nieznana podstawa hantli oraz niejednoznaczne obciążenie nie trafiają do porównywalnych metryk kg. Nie przeliczamy automatycznie kg na hantel na sumę.
- Dla masy ciała prezentujemy powtórzenia bez przypisywania kg. Agregujemy tylko jednoznaczne serie masy ciała bez asysty/dodatkowego ciężaru; warianty obciążone/asystowane nie są mieszane. Odczyt musi zawierać odpowiednie snapshoty bodyweight adjustment/delta. Niejednoznaczne serie pozostają dostępne w historii, z jawnym brakiem porównywalnych danych na wykresie.
- Zero jest wartością: 0kg z prawidłową semantyką może dać 0 objętości lub szacunku; null oznacza brak. Suma jest null, gdy nie ma żadnej kwalifikującej serii; nie podstawiamy zera.

## Estymacja i rekordy

Wersja `reference-table-v1`: dla całkowitych powtórzeń 1–10 współczynniki `[1, .97, .94, .92, .89, .86, .83, .81, .78, .75]`; estymacja = actualKg / coefficient. Zachowujemy tabelę proponowaną w zatwierdzonym kierunku makiet, bez zamiany na inny wzór. Poza zakresem, przy null, liczbach niefinitywnych lub ujemnych: brak estymacji. Nie ekstrapolujemy. To metryka analityczna, nigdy zapis do 1RM ani celów historycznych.

- Punkt szacunku: największy szacunek kwalifikującej serii treningu; punkt ciężaru: największe kg; punkt objętości: suma kg×powtórzenia kwalifikujących serii. Źródłowe ID sesji, ćwiczeń wykonanych i serii zachowane. Źródło maksimum jest konkretną serią, suma wskazuje wszystkie użyte serie.
- Masa ciała: max powtórzeń, suma powtórzeń oraz liczba kwalifikujących wykonanych serii dla rekordu. Nie zamieniamy braku powtórzeń w zero.
- Remis ciężaru wewnątrz treningu: większe znane powtórzenia, następnie stabilne ID serii. Remis szacunku: większe kg, następnie stabilne ID. Rekord całej historii przy identycznej wartości: najwcześniejsza data osiągnięcia, następnie znany czas w obrębie tego samego dnia, na końcu stabilne ID. Legacy bez czasu nie otrzymuje fikcyjnej kolejności czasowej — tie-break ID jest wyłącznie techniczny.
- Porównania używają niezaokrąglonych liczb; prezentacja szacunku do 1 miejsca, kg/objętość do 2 miejsc, powtórzenia całkowite, polskie formatowanie. Tooltip wyjaśnia datę/status/źródło. Pomoc pokazuje wzór, zakres, współczynniki i przykład100/.94≈106,4.

## Odczyt i okno wykresu

- Serwer ustala właściciela przez `auth.getUser`, wszystkie zapytania filtrują owner_id i podlegają RLS. Identyfikator wybrany w przeglądarce wyłącznie filtruje już autoryzowany zbiór.
- Pełne stronicowanie sesji, ćwiczeń wykonanych, serii i katalogu; stabilne sortowanie z ID. Partie .in() ograniczone; ponad500 rekordów wymagane w teście. Nie ograniczamy PR parametrami from/to.
- Zachować addytywnie wcześniejszy kontrakt wywołań getProgress(from,to), jeżeli używany: dotychczasowe entries/sessions mogą reprezentować zakres, nowa analityka/PR musi jawnie wynikać z pełnego zbioru. Wybrany interfejs zapisać w handoffie E.
- UI: domyślnie3M, filtry1M/3M/6M/1R/Wszystko; zakres kalendarzowy z poprawnym ograniczeniem dni miesiąca, własne daty i dostępne alternatywy zoom/pan. PR niezależne od okna. Pusta metryka ma przerwę/brak danych, nie linię do zera. Korekta historii powoduje ponowny odczyt i obliczenie, bez zapisanego duplikatu statystyk.

## Weryfikacja przed przyjęciem E

Niezależnie wyliczone przykłady:100kg×3 →100/.94,100kg×1→100,0kg×3→0, null→null,11 powt.→null; sumy, remisy i tożsamość źródłowych serii. Powtórzone ćwiczenie/sesja, dwa treningi dziennie, strefy/legacy/statusy, pominięte/brakujące/nieporównywalne dane, brak łączenia wariantów. Ponad500 rekordów, całe PR mimo filtra, izolacja A/B/anon na lokalnym API/DB. Ręczny1RM i snapshoty bez zmian. Myszą klik/drag/klik i zamykanie poza punktem, klawiatura, CDP pinch/swipe oraz360/390/430px. Fizyczny telefon/Safari raportować oddzielnie.

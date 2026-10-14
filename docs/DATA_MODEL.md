# Model danych i niezmienniki

Status: kontrakt koncepcyjny z wykonanym rdzeniem T02, ochroną dostępu T03, ręcznym edytorem T04, zapisem wykonania T05 i importem T06. Migracja [T02](../supabase/migrations/20261011160000_t02_domain.sql) i [typy/walidatory](../src/lib/domain/model.ts) obejmują plany, wersje, ćwiczenia, serie, rzeczywiste 1RM, sesje wykonania, kopie celów, rewizje oraz potwierdzenia operacji. [T03](T03_AUTH.md) sprawdził te tabele przez prawdziwe Auth/API oraz dodał prywatny bucket. [T04](../supabase/migrations/20261011180000_t04_plan_editor.sql) dodał atomową publikację planu i potwierdzenia operacji, a [druga migracja T04](../supabase/migrations/20261011181000_t04_one_rep_max_retry.sql) identyfikator ponowienia 1RM. Migracje T06 dodały `imports`, `import_attempts` i osobny prywatny bucket; szczegóły w [T06_IMPORT](T06_IMPORT.md). Wszystkie rekordy prywatne mają właściciela; istniejące tabele domenowe mają czas utworzenia i identyfikator. Relacje zachowują tego samego właściciela przez złożone klucze obce.

## Encje

- `profiles`: konto, język, strefa czasowa, jednostki i preferencja zaokrąglania.
- `exercises`: ćwiczenia użytkownika, nazwa, aliasy, wariant/sprzęt i sposób liczenia obciążenia. Nazwa sama nie jest identyfikatorem ćwiczenia.
- `one_rep_max_records`: ćwiczenie, rzeczywista wartość kg, data obowiązywania, notatka. Brak automatycznego nadpisywania maksimum estymacją.
- `plans`: logiczny plan, nazwa, status `draft/active/archived`, wskazanie bieżącej wersji.
- `plan_versions`: niezmienna po publikacji wersja, numer, źródło importu i data publikacji. Edycja opublikowanego planu tworzy nową wersję.
- `plan_sessions`: jednostki danej wersji planu, numer tygodnia, nazwa dnia, pozycja. Dni A/B mogą istnieć bez kalendarzowej daty.
- `planned_exercises`: jednostka, ćwiczenie, oryginalna nazwa, kolejność, opcjonalna grupa superserii, uwagi.
- `planned_sets`: pozycja, rodzaj serii, zakres/liczba powtórzeń lub AMRAP, typ obciążenia, kg, procent 1RM, czas/dystans, przerwa, tempo, RPE/RIR, notatka. Osobny rekord na serię umożliwia rampę i back-offy.
- `workout_sessions`: opcjonalna jednostka i wersja planu, data, stan `in_progress/completed/abandoned`, komentarz, rewizja.
- `performed_exercises`: ćwiczenie, kolejność, powiązanie z planem lub `extra`, kopia zaleceń obowiązujących przy rozpoczęciu.
- `performed_sets`: planowana seria lub `extra`, wykonane powtórzenia i ciężar, czas/dystans, RPE/RIR, notatka, stan `pending/completed/skipped`.
- `imports`: właściciel, źródło, ścieżka pliku, status, bieżąca próba, wynik szkicu, błędy, prywatna zapisana korekta `review_data` (T07) i utworzona wersja planu.
- `import_attempts`: numerowana próba, model, wersja promptu i schematu, dzierżawa, status, czas, zużycie tokenów i szacowany koszt. Treści użytkownika nie są logiem próby.
- `voice_attempts` (T09): właściciel, czas i rezerwacja 0,01 USD; bez audio i transkrypcji. Rola klienta nie ma bezpośredniego dostępu; serwer rezerwuje przez funkcję po sprawdzeniu sesji.
- `mutation_receipts`: identyfikator komendy, właściciel, skrót payloadu, wynik zapisu i wersja; ochrona przed duplikatami.
- `workout_revisions`: kolejne numery rewizji treningu powiązane z potwierdzeniem operacji; komenda T05 zapisuje również poprawki historycznych serii.

## Wykonanie T02 i granice

- `plan_versions` ma stany `draft/published`. Po publikacji triggery blokują zmianę wersji oraz jej sesji, ćwiczeń i serii. `plans.current_version_id` musi wskazywać opublikowaną wersję tego samego planu; aktywny plan wymaga bieżącej wersji.
- Osobne rekordy serii reprezentują rampę, back-off i różne cele. `superset_group` łączy ćwiczenia w jednostce. Ćwiczenie własne jest rekordem `exercises`; dodatkowe ćwiczenie i dodatkowa seria mają `source_kind = extra` tylko w wykonaniu.
- `performed_sets` przechowuje kopię celu, procentu, ID i wartości 1RM, wyniku surowego, zaokrąglonego i kroku. `null` przy braku 1RM pozostawia procent bez celu kg. Triggery blokują późniejszą zmianę kopii; wykonane wyniki można poprawić przez komendę T05.
- `mutation_receipts` ma unikalność `(owner_id, client_operation_id)` i skrót danych; `workout_sessions.revision` oraz `workout_revisions` umożliwiają sprawdzanie rewizji i ślad zmian. T05 implementuje transakcyjny zapis komendy i retry w [migracji T05](../supabase/migrations/20261011190000_t05_workout_commands.sql). Bezpośrednie `insert/update` tabel wykonania z roli `authenticated` pozostają cofnięte, aby nie obchodzić idempotencji.
- RLS i uprawnienia są w tej samej migracji co wszystkie 13 prywatnych tabel. Relacje dzieci z rodzicami oraz rekord 1RM z wariantem ćwiczenia sprawdzają właściciela. Brak uprawnień roli `anon`.
- Test odtworzenia [scripts/test-db.sh](../scripts/test-db.sh) używa PostgreSQL 16 i minimalnego schematu testowego `auth`. T03 dodał osobny [test lokalnego Supabase](../scripts/test-t03-api.mjs), obejmujący prawdziwe Auth, API i Storage. Nie jest to test usług hostowanych.

## Obciążenie i 1RM

T04 zapisuje ręcznie plan A/B i własne ćwiczenia do prywatnych tabel. Każda publikacja tworzy nową niezmienną wersję; konflikt oczekiwanej wersji oraz ponowienie identyfikatora operacji są obsługiwane przez funkcję `save_manual_plan`. `one_rep_max_records` jest dopisywany, a nie aktualizowany; API T04 rozpoznaje ponowienie zapisu po `client_operation_id`. Podgląd planu oblicza kg na bieżąco według daty w strefie profilu. T05 kopiuje cele przy starcie treningu, wybierając rzeczywisty 1RM obowiązujący w `performed_on`, i nie przelicza rozpoczętych sesji po zmianach planu lub maksimum.

`load_type`: `absolute`, `percent_1rm`, `bodyweight`, `unspecified`. Masa ciała, dodatkowy ciężar i asysta wymagają odrębnej semantyki; brak obciążenia to `null`, nie 0 kg. Przy hantlach zachowujemy informację, czy wartość dotyczy jednej sztuki czy sumy. Niejednoznaczność wymaga korekty.

`percent_1rm` oznacza zawsze procent rzeczywistego 1RM użytkownika dla tego samego wariantu ćwiczenia. Przy rozpoczęciu sesji wybieramy najnowszy rekord obowiązujący nie później niż data treningu. Zapisujemy jego ID, wartość, procent, surowy wynik i zaokrąglony cel w kopii zaleceń. Zmiany maksimum nie aktualizują otwartych ani historycznych sesji automatycznie.

Przykład: 1RM 123 kg × 75% = 92,25 kg. Proponowana domyślna reguła: najbliższy krok 2,5 kg, przy remisie w dół; użytkownik może zmienić krok. Wynik 92,5 kg. Reguła i krok także trafiają do kopii zaleceń.

Brak 1RM nie uniemożliwia zapisania planu lub treningu. Procent pozostaje widoczny, cel kg jest pusty, UI umożliwia podanie maksimum lub ręcznego ciężaru. Ręczny ciężar nie tworzy rekordu 1RM.

## Integralność historii

T08 odczytuje `workout_sessions`, `performed_exercises`, `performed_sets` i `exercises` dla właściciela. Licznik wykonania planu opiera się na `source_kind = planned`; serie `extra` nie zwiększają mianownika. Objętość `powtórzenia × kg` obejmuje tylko wykonane serie z jawną zewnętrzną semantyką obciążenia i porównywalną podstawą wartości. `skipped` i `pending` nie dają zera w historii obciążenia, a masa ciała/asysta i niejednoznaczny ciężar hantli nie są dodawane do objętości. Wynik jest wyliczany na odczycie, więc poprawka wykonanej serii jest widoczna bez zmiany snapshotu celu; żadna estymacja nie tworzy rekordu rzeczywistego 1RM. Szczegóły: [D018](DECISIONS.md).

- Trening zachowuje cele i nazwy z momentu rozpoczęcia, także po zmianie lub archiwizacji planu.
- Dodatkowe ćwiczenia/serie istnieją w wykonaniu, bez modyfikacji planu.
- Każda ukończona seria ma jawnie wpisany wynik; nie kopiujemy celu jako wykonanego wyniku bez działania użytkownika.
- Pominięta seria nie jest serią wykonaną z 0 powtórzeń. Notatka o próbie nie jest rekordem zaliczonym do postępu.
- Zakończony trening może być poprawiony przez właściciela; zapis wymaga sprawdzenia rewizji i odnotowania zmiany. Historyczny cel pozostaje bez zmian.
- Daty techniczne w UTC, data treningu prezentowana w strefie użytkownika.
- Usuwanie konta/danych ma jawną procedurę; zwykła archiwizacja planu nie kasuje historii.

## Kontrakt szkicu AI

`schema_version`, uporządkowane sesje/ćwiczenia/serie, `unresolved_fields`, `warnings` oraz `source_ref` przy ćwiczeniu i serii. Odwołanie zawiera fragment źródła albo stronę PDF, jeśli dostępne. T06 waliduje szkic przed zapisaniem go przy imporcie; korekta użytkownika przed publikacją pozostaje T07.

Model zwraca `null` dla braków. Walidator wykrywa niepoprawne zakresy, brak jednostki, konflikt kg z procentem, nieznane ćwiczenie i niepełne źródło. Nie używamy subiektywnego „confidence” modelu jako gwarancji poprawności.

## Rozszerzenie T06-R1 — kontrakt v2 i historia zakresów

D022 i migracje `20261013100000_t06r1_source_ranges.sql` oraz `20261013102000_t06r1_optional_blocks.sql` dodają zakresy i metadata źródła bez zmiany istniejących historycznych celów.

- `planned_exercises`: `display_name` obok `original_name`, `review_id`, `source_ref`, `set_count_min/max`, `set_count_source`, `prescription_group`, `is_optional`. Identyfikator korekty nie nadaje dostępu do prywatnego rekordu DB.
- `planned_sets`: `review_id`, `source_ref`, `is_optional`, `target_kg_max`, `duration_seconds_max`, `rest_seconds_max`. Dolne wartości pozostają w dawnych kolumnach. Górna granica nie może być mniejsza od dolnej ani istnieć bez niej.
- 7–8 to 8 rekordów, z czego 7 wymaganych. Przy złożonych blokach 2×6 + 1–2×3 czwarta seria jest opcjonalna; opcjonalność jest kopiowana indywidualnie, nie obliczana później z pozycji. Całe ćwiczenie opcjonalne ma 0 wymaganych serii, choć zachowuje zalecany zakres liczby.
- Nowe `performed_sets` mają `target_optional_snapshot`, `target_kg_max_snapshot`, `target_duration_seconds_max_snapshot`, `target_rest_seconds_max_snapshot`. `performed_exercises` ma `target_original_name_snapshot`. Triggery kopiują wartości przy rozpoczęciu i zabraniają późniejszej zmiany. Historyczne wiersze dostają tylko puste/false nowe metadata, bez przeliczenia wcześniejszych celów.
- Postęp liczy wymagane planowane serie jako mianownik. Wykonana opcjonalna seria wnosi wynik i porównywalną objętość; niewykonana opcjonalna nie obniża realizacji wymaganej części.
- Surowy import v2 ma `repeat_min/max` szablonów; po walidacji edytor i zapis SQL dostają osobne serie, a nie szablony. `withReviewIds` nadaje ID starszym szkicom i zachowuje je po przestawieniu. V1 i stare dokumenty manualne są nadal obsługiwane.

`save_manual_plan` nadal wymaga właściciela, poprawnego dokumentu, oczekiwanej wersji i identyfikatora operacji. Nie wykonuje dopasowania przez publiczne ID słownika; nazwy pozostają w prywatnym katalogu właściciela. Słownik referencyjny nie łączy automatycznie różnych wariantów.

## T07-R1 — stan przeglądu propozycji

Opcjonalny `imports.review_data.progress` przechowuje krok oraz dwa fingerprinty potwierdzeń przeglądu. Są to metadata UI, nie uprawnienia ani nowa wersja planu. Kontrola właściciela nadal obejmuje całe zadanie importu. Fingerprint tożsamości obejmuje stabilne ID, dni/tygodnie, kolejność i nazwy/wariant/sprzęt; struktury — pełne dane sesji, w tym cele, grupy i uwagi, z uporządkowanymi kluczami JSONB. Tytuł planu nie wpływa na potwierdzenia. Brak etapów w starszym szkicu nie usuwa jego dokumentu ani odpowiedzi.

Kompaktowy blok jest projekcją sąsiadujących serii o tych samych parametrach treningowych. Nota/źródło/ID/pozycja/opcjonalność są przechowywane osobno; edycja wspólnych parametrów zachowuje je. Złożone i różne cele pozostają osobnymi blokami; zmiana liczby serii konkretnego bloku nie kopiuje celu innego bloku. T07-R1 nie zmienia tabel planu ani historycznych snapshotów i nie wymaga migracji.

## T04-R1 — projekcja ręcznego edytora

Karty i formularze ręcznego edytora korzystają z dotychczasowego `PlanEditorDocument`. Bloki grupują wyłącznie sąsiadujące serie o identycznych parametrach; edycja wspólna zachowuje osobne ID, notatki, źródła i opcjonalność. Ukrycie formularza nie normalizuje ani nie usuwa wartości. Fragment jest walidowany niezależnie od niedokończonej reszty szkicu, a publikacja nadal waliduje cały dokument. POST `/api/plans`, wersjonowanie, właściciel, snapshoty i migracje pozostają bez zmian. Po braku odpowiedzi retry korzysta z zachowanego ID i pełnego payloadu; zmiana szkicu rozpoczyna nową operację.

## T10 — zamknięcie bezpośredniego zapisu planu

D026 i migracja `20261014100000_t10_plan_write_boundary.sql` odbierają `authenticated` INSERT/UPDATE/DELETE do `exercises`, `plans`, `plan_versions`, `plan_sessions`, `planned_exercises`, `planned_sets`. Odczyt nadal wymaga RLS. Katalog i plan powstają przez istniejącą transakcyjną publikację/approve; klient nie może ominąć wersjonowania lub zmienić wariantu katalogu bez tej ścieżki. Zapis profilu oraz dopisywanie rzeczywistego 1RM pozostają używanymi ścieżkami. Bez zmiany historycznych danych, snapshotów i kontraktów dokumentu.

# T13 — mobilny plan, prowadzenie treningu i kalendarz

Aktualizacja: 2026-10-18. **A/B/C lokalnie w review po przyjętych bramkach; D–E niewykonane.** [Rzeczywisty handoff A](handoffs/2026-10-17-T13-A-sesje-api-datowanie.md). Statusy zadań wyłącznie w [ROADMAP](ROADMAP.md). Organizacja: [WORKFLOW](WORKFLOW.md).

## Pochodzenie i granice

Pełny plan odczytano z chatu **„Opisz możliwości aplikacji”**, ID `01a14698-9758-7d80-8aeb-59f24e65d76a`, z planu w turze `01a14904-94a0-7521-9ef3-4e2e0b1d16dc` i późniejszego podziału A–E. Pierwsze zlecenie dotyczyło dokumentacji; kolejne zlecenie 2026-10-17 uruchomiło wyłącznie implementację A. W repo wcześniej nie było T13. Poniżej utrwalono wymagania i kontrakt zrealizowany lokalnie w A; B i C wykonano po osobnych zleceniach 2026-10-18; kalendarz D i niezależny odbiór E pozostają przyszłą pracą. Nie jest to wdrożenie produkcji.

Wcześniejszy chat opisał test lokalnej aplikacji 390 × 844: cztery ćwiczenia/18 serii, około 18 700 px wysokości, dwa aktywne treningi i utratę niezapisanych pól po zapisie innej serii. To dowód historyczny z tamtej sesji, nie test wykonany podczas obecnego podziału.

Zachowujemy polski interfejs, ręczny zapis bez AI, kontrolę właściciela, wersje planów, historyczne snapshoty, rozróżnienie `null`/0, opcjonalność i zasady postępu. T13 nie obejmuje automatycznego układania treningów, progresji AI, płatności, trenerów, publicznych danych, offline, nowej integracji ani rozbudowy infrastruktury. Nie zmienia budżetu AI ani zakresu T11/T10-R1. Implementacja wymaga osobnego zlecenia użytkownika; publikacja nie jest etapem A–E.

## Rejestr wymagań i przypisanie

Każde R ma właściciela realizacji oraz odbiór E. Litery oznaczają etapy, nie równoczesnych agentów.

- **R01 (B):** plan jest biblioteką treningów do wyboru bez podziału na tygodnie w bieżącej obsłudze. Początkowo pierwszy trening, potem ostatnio wybrany w danym planie. Zachować wybór wersji i start tylko aktualnej wersji.
- **R02 (B):** krótka karta ćwiczenia: nazwa, skrót zaleceń, rozwinięcie „Wszystkie serie”; szczegóły zawierają uwagi i oryginalną nazwę. Identyczne sąsiadujące serie grupować, różne cele/rampy/opcjonalne wyraźnie odróżniać. Przykład: „7 × 1 + 1 seria opcjonalna · przerwa 60–120 s”.
- **R03 (B):** „Podgląd całego planu” zawiera krótkie podsumowania treningów. Import zachowuje wszystkie odrębne treningi/warianty, bez wymuszania tygodni i terminów. Istniejące tygodnie zostają w danych i kontekście źródła; nie scalać jednostek o tej samej nazwie.
- **R04 (C):** przegląd aktywnej sesji: nazwa, data/godzina, postęp, zwarte klikalne karty z celem, liczbą zapisanych serii i stanem; superserie w grupach. Liczniki wymaganych, opcjonalnych, dodatkowych i pominiętych osobno. Pominięcie nie jest wykonaniem.
- **R05 (C):** „Dodaj ćwiczenie” i „Komentarz” otwierają formularz na żądanie; „Kontynuuj” wskazuje następną oczekującą serię; „Zakończ trening” otwiera podsumowanie. Numer rewizji znika z głównego UI, pozostaje w protokole.
- **R06 (C):** osobny widok szczegółów ćwiczenia, powrót do listy, nazwa i numer serii; jeden formularz, cel i poprzedni porównywalny wynik. Pola zależą od ćwiczenia (powtórzenia/kg albo czas/dystans), RPE/RIR/komentarz pod „Dodatkowe informacje”; istniejące wartości widoczne.
- **R07 (C):** „Zapisz i przejdź dalej”, pominięcie, dyktowanie. Przejście dopiero po potwierdzeniu serwera; kolejność rund superserii, a po wymaganych seriach wybór opcjonalnej lub następnego ćwiczenia. „Wszystkie serie” to zwarta lista celów/wyników/stanów, z poprawką wybranej serii, również historycznej.
- **R08 (C):** bez pełnego przeładowania strony po zapisie. Zachować wpisy, ćwiczenie, serię, fokus i pozycję powrotu; opuszczanie brudnego formularza daje „zapisz / odrzuć zmiany / zostań”. Błąd i retry nie gubią wpisów; opóźniony głos nie zapisuje do zmienionego celu.
- **R09 (A, UI C):** najwyżej jeden aktywny trening całego konta przy nowych startach, także z dwóch kart/urządzeń. Konflikt pokazuje własną sesję: nazwa, data, zapisane serie i wybór „Wróć”, „Zakończ i rozpocznij nowy”, „Usuń i rozpocznij nowy”.
- **R10 (A, UI C):** zakończenie zachowuje wyniki i nie dopisuje fikcyjnych wyników brakującym seriom. Usunięcie jest trwałe po dodatkowym potwierdzeniu z nazwą sesji i ostrzeżeniem o utracie wyników. Rozstrzygnięcie starej i start nowej sesji atomowe.
- **R11 (A, UI C):** kilka zastanych aktywnych sesji pokazać do indywidualnego rozstrzygnięcia. Bez automatycznego zamykania/usuwania przy migracji lub starcie.
- **R12 (A):** rozszerzenie `/api/workouts`, rozpoznawalne konflikty, odczyt pojedynczej sesji, serializacja operacji właściciela w DB, rewizje i idempotencja. Usunięcie obejmuje sesję, wykonane ćwiczenia, serie i rewizje; minimalne potwierdzenia techniczne chronią przed odtworzeniem przez późny retry.
- **R13 (A, UI C, odczyt D):** automatyczna data/godzina startu, możliwość korekty przy zakończeniu. Korekta aktualizuje kalendarz i filtry historii, nie zmienia celów ani użytego 1RM. Kompatybilna migracja; starszym wpisom bez wiarygodnego czasu pokazywać „godzina nieznana”.
- **R14 (D):** kalendarz miesiąca poniedziałek–niedziela, poprzedni/następny miesiąc i „Dzisiaj”; oznaczone dni zakończonych sesji; lista wybranego dnia z nazwami/godzinami, wiele sesji dziennie; trwające sesje osobno jako „Wznów”. Historia otwiera ten sam zwarty przegląd C. Strefa użytkownika, granice dni/miesięcy i północ.
- **R15 (B, C, D, E):** przy 390 × 844 typowa lista pokazuje co najmniej cztery krótkie karty ćwiczeń, formularze dopiero w szczegółach; również 360/430 px bez poziomego przewijania, czytelne nazwy, cele dotykowe co najmniej 44 × 44 px, pola i akcje dostępne z klawiaturą ekranową. Rozwijanie ma etykiety/stany, obsługę klawiatury/fokusu; stan nie tylko kolorem.
- **R16 (A–E):** wykorzystać istniejące grupowanie i wydzielić wspólne podsumowania planu/wykonania. Testy: osiem identycznych serii, rampa/różne cele, superseria, opcjonalna, brak kg, historyczna poprawka; sieć/retry/kontekst głosu, równoczesne starty, cancel/usunięcie/prywatność, daty i legacy. Domena/komponenty/lokalne API, build/typy i klikalny mobilny odbiór prawdziwej aplikacji na syntetycznych danych. Fizyczny telefon pozostaje osobnym odbiorem.

## Kolejność, odpowiedzialność i bramki

**T13-P → A → B → C → D → E.** Domyślnie jedna aktywna sesja wykonawcza. Integrator T13 to rola prowadzona przez użytkownika wskazanego wykonawcę; Codex wykonał A/B/C i przyjął ich lokalne bramki jako jeden integrator. Nie uruchomiono innych agentów ani D–E. Przy rozpoczęciu etapu wpisać rzeczywistego wykonawcę w ROADMAP i listę przejmowanych plików. Integrator może sam wykonywać A–D; E powinien wykonać inny recenzent w osobnym, ręcznie zleconym chacie.

Zależności techniczne: A opiera się na gotowych T03/T04/T05, T06-R1 i T11-C1; B na T04-R1/T06-R1 oraz kontrakcie A; C na A/B i gotowym T09; D na A/C i istniejącym T08; E na A–D w `review`. W sekwencji B zaczyna się po przekazaniu A, C po B, D po C. Nie wymagać `done` A–D przed E: to stworzyłoby cykl odbioru. Integrator dopuszcza następny etap z poprzedniego `review`, gdy jego bramka lokalna przeszła, kontrakt jest zapisany, a krytyczne błędy rozwiązane. Po E dopiero oznacza A–D i T13 jako `done` w odebranym zakresie lokalnym.

Każda bramka wymaga aktualnego kontraktu, faktycznego wykazu plików, dowodów testów i handoffu. Brak środowiska testów to ograniczenie/bloker bramki, a nie automatyczne zaliczenie. T11 `review`, fizyczny T10-R1 i odłożony backup nie blokują dokumentacji ani przyszłej lokalnej pracy T13.

### Właściciele plików

Ścieżki A/B/C są zrealizowane i zwolnione w ich rzeczywistych handoffach; nowe ścieżki D–E nadal są planem. Przed przejęciem sprawdzić `git status` i zakończenie poprzedniej sesji. Wspólny plik ma jednego aktualnego autora.

- **Integrator (I):** AGENTS/README oraz wspólne dokumenty ROADMAP, STATUS, DECISIONS, CHANGELOG, PRODUCT, UX, DATA_MODEL, ARCHITECTURE, TESTING, OPEN_QUESTIONS i niniejsza specyfikacja; manifest przekazania i decyzje o zamknięciu. Wykonawca etapu oddaje propozycję zmian wspólnych w swoim handoffie; gdy jest także I, aktualizuje je osobiście.
- **A:** `src/app/api/workouts/route.ts`, nowe `src/app/api/workouts/[id]/route.ts`, `src/lib/workouts/repository.ts`, nowe moduły kontraktów/czasu w `src/lib/workouts/`, niezbędny odczyt dat w `src/lib/progress/repository.ts`; wyłącznie nowe migracje w `supabase/migrations/`, lokalne testy API/DB T13-A i adekwatne testy T05. Typy domeny i `package.json`/lockfile tylko po przyjęciu przez I konkretnej potrzeby.
- **B:** `src/app/plany/[id]/page.tsx`, nowy `src/components/plan-preview.tsx`, wspólne podsumowania w nowych `src/lib/workouts/presentation.ts` i `src/components/exercise-summary.tsx` z testami; kontrola `src/lib/domain/compact-editor.ts` jako źródła istniejącego grupowania, bez niepotrzebnej przebudowy edytora/importu. Jeśli wymóg R03 wymaga korekty selektora edytora/importu, I przypisuje B minimalne zmiany prezentacji w `compact-plan-editor.tsx`/`import-review.tsx`; nie zmienia dokumentu ani parsera AI.
- **C:** `src/components/workout-start.tsx`, `workout-editor.tsx`, `workout-voice.tsx` i testy, `src/app/trening/[id]/page.tsx`, nowe komponenty przeglądu/szczegółów/podsumowania i klienta komend; opcjonalna podstrona szczegółów pod `src/app/trening/[id]/`. Reużycie kontraktu A i podsumowań B. Nie zmienia samodzielnie SQL/API.
- **D:** `src/app/historia/page.tsx`, nowe komponenty kalendarza i testy kalendarza. Rozszerzenie repozytorium A lub kontraktu odczytu zgłasza I; I przydziela czasowo plik D i zapisuje zmianę kontraktu przed użyciem.
- **E:** nowy raport `docs/reports/YYYY-MM-DD-T13-acceptance.md`, własny handoff, ewentualne niezależne testy `scripts/test-t13-acceptance.mjs`. Recenzent nie poprawia po cichu kodu A–D. Zgłoszenie przypisuje do właściciela, I zleca poprawkę, E powtarza dotknięte sprawdzenia.
- `src/app/globals.css`: kolejno B, potem C, potem D; za każdym razem jawne przekazanie i brak równoczesnej edycji. Wspólne podsumowania po B są kontraktem C/D, ich zmianę uzgadnia I. Skrypty/`package.json` edytuje aktualnie przydzielony właściciel, bez dodawania zależności tylko na potrzeby stylistyki.

Nie włączamy równoległości w tym planie. Ewentualne późniejsze zlecenie równoległe wymaga osobnego uzgodnienia właścicieli i integratora zgodnie z WORKFLOW.

## A — kontrakt sesji, API i czasu (lokalnie zrealizowany)

### Punkt wyjścia przed A (historyczny)

`POST /api/workouts` przyjmuje `operationId`, `workoutId`, `expectedRevision`, `action`, `payload`. T05 obsługuje start, serię, dodatki, komentarz i koniec przez `apply_workout_command`. Obecna blokada dotyczy tylko `(owner_id, plan_session_id)`, a advisory lock — właściciela i operacji, nie całego konta. `getActiveWorkoutForDay` jest lokalne dla dnia planu. Odczyt `getWorkout` wykonuje kilka zapytań. `performed_on` jest dziś częścią niezmiennej kotwicy triggera; receipts i revisions mają FK do sesji. **Nie wystarczy dodać przycisku Delete ani UPDATE daty.**

### Wspólne reguły zapisu

1. Każda komenda, w tym stary start, save_set, głos przez T05, finish/delete/replace, przechodzi przez tę samą transakcję i blokadę właściciela z `auth.uid()`. Kolejność blokad zawsze: właściciel, receipt, sesje. Kontrola rodziców/dzieci ponownie w DB; klient/model nie nadaje uprawnień. Bez bezpośredniego DML klienta.
2. Receipt identyfikuje `(owner, operationId)`. Hash obejmuje cały niezmienny zamiar: action, workoutId, expectedRevision i payload, w tym obie kotwice zastąpienia oraz korektę czasu. Zapisana komenda jest ponawiana z tym samym ID, rewizją i treścią; nie podmienia się rewizji na nową podczas retry. Inny payload z tym samym ID: `409 OPERATION_PAYLOAD_CONFLICT` (PT409, bez biznesowego 40001).
3. Najpierw weryfikacja sesji użytkownika i receipt, potem oczekiwana rewizja i stan. Utrata odpowiedzi po commit nie wykonuje komendy ponownie. Dla istniejącej sesji retry zwraca pierwotne potwierdzenie; bieżący stan należy pobrać osobno, nie nadpisywać nowszego odczytu starym receipt.
4. Sukces komendy zachowuje dotychczasowe pola `workoutId`, `revision`, `action`, `setId`, `exerciseId`; nowe pola są addytywne. Sukces nie jest pełnym stanem formularza. Rozszerzony kod błędu jest stabilny i obok ma polski komunikat. 400: błędne wejście, 401: brak sesji, 404: brak własnego zasobu (także obce ID), 409: konflikt rewizji/planu/aktywnej sesji/payloadu, 410: własny usunięty zasób znany z technicznego śladu. Brak informacji o obcych ID.
5. Nazwy nowych akcji: `delete` (wyłącznie aktywna sesja), `replace_active`; `finish` może zawierać korektę czasu. `start`, `save_set`, `add_set`, `add_exercise`, `comment` zachowują istniejące znaczenie. Korekta historycznego wyniku przez `save_set` pozostaje dostępna, nie otwiera sesji ponownie. Ogólne usuwanie ukończonej historii i osobna edycja daty po zakończeniu nie są częścią T13.

### Jeden aktywny trening i zastąpienie

- Nowy `start`: `workoutId=null`, `expectedRevision=0`, payload wskazuje własny `planSessionId`. Po owner lock sprawdza wszystkie aktywne sesje. Gdy są: `409 ACTIVE_WORKOUT_EXISTS`, lista tylko własnych `{id, revision, name, performedOn, performedAt, savedSetCount}`. Dla wielu legacy: `409 MULTIPLE_ACTIVE_WORKOUTS`, ta sama lista. Nie tworzy niczego ani nie kończy poprzedniej sesji. Także wybór tego samego treningu oferuje wznowienie zamiast drugiej kopii.
- `replace_active`: koperta `workoutId`/`expectedRevision` wskazuje starą sesję; payload `{resolution: "finish" | "delete", next: {planSessionId}, finish?: {performedAt, timeZone}}`. `finish` tylko przy odpowiedniej resolution; dodatkowe potwierdzenie usuwania jest w UI. Serwer weryfikuje stan/revision starej, brak innych aktywnych oraz bieżącą własną wersję nowego planu **zanim cokolwiek zmieni**. Zakończenie/usunięcie + start + receipts są jedną transakcją. Niepowodzenie dowolnego kroku cofa całość. Odpowiedź wskazuje nowy `workoutId`/`revision` i `resolvedWorkoutId`/`resolution`; minimalny receipt wiąże oba ID.
- Osobny `finish` lub `delete` pozwala indywidualnie uporządkować zastane sesje. Przy kilku otwartych `replace_active` odmawia; użytkownik rozstrzyga je pojedynczo, potem wznawia jedną lub zaczyna nową. Brak masowej operacji i samoczynnej naprawy danych.
- Dwa starty z różnymi ID: pierwszy wygrywa, drugi dostaje konflikt. Ten sam start z tym samym ID: jedna sesja. Dwa zastąpienia: najwyżej jedno stosuje się do oczekiwanej rewizji/stanu. Start równoległy z delete/save/finish także pod owner lock. Dla legacy nie zakładać globalnego unikalnego indeksu, którego nie da się utworzyć bez naruszenia R11; owner lock i wyłączna ścieżka RPC egzekwują regułę. Jeżeli później możliwy indeks, to odrębna bezpieczna zmiana po rozstrzygnięciu danych.

### Trwałe usunięcie i późny retry — rozstrzygnięcie przed kodem

- Usuwamy wyłącznie wskazaną własną aktywną sesję przy zgodnej rewizji. Zakres danych użytkownika: jej `performed_sets`, `performed_exercises`, `workout_revisions`, komentarz i `workout_sessions`. Nie usuwamy planu, wersji, rekordów 1RM, współdzielonych przez historię wpisów prywatnego katalogu ani importu źródłowego. Nie tworzymy `abandoned` jako substytutu trwałego usunięcia.
- **Receipts nie mogą zniknąć razem z sesją.** A ma dodać minimalny ślad usunięcia (własność, ID sesji, stan deleted) i zachować ID operacji/hash/techniczny wynik, bez wyników serii, notatek, nazw lub treści treningu. Realizacja D035: po usunięciu rewizji nullable workout_session_id receipts jest ustawiane na null, FK pozostaje; ślad odwołuje się do ID bez FK wymuszającego istnienie sesji. Nie stosować kaskadowego usuwania receipts ani globalnego wyłączania triggerów/RLS.
- Receipt starego startu lub save_set rozpoznaje usunięty wynik: `410 WORKOUT_DELETED`, bez ponownego INSERT i bez zwracania dawnego sukcesu zachęcającego do otwarcia martwego ID. Retry samego skutecznego `delete` zwraca `200` z tym samym technicznym potwierdzeniem `{workoutId, action: "delete", deleted: true}`; nie wymaga istnienia wiersza ani ponownej kontroli starej rewizji. Ten sam ID/inny payload nadal 409.
- Receipt `replace_active` zachowuje efekt zakończenia/usunięcia starej i startu nowej. Retry, gdy nowa nadal istnieje, zwraca tę samą nową sesję, nawet jeżeli jest już zakończona. Gdy także nową później usunięto: 410, bez ponownego rozstrzygania lub startu. Nowa komenda save/finish/delete z nowym ID dla usuniętej własnej sesji: 410; dla nieznanej/obcej: 404.
- Minimalne ślady i receipts pozostają na czas istnienia konta; T13 nie dodaje TTL, po którym dawny retry mógłby odtworzyć sesję. Usunięcie konta obejmuje także te ślady. Każdy przyszły pomysł retencji musi najpierw zdefiniować bezpieczny koniec okna retry. Legacy receipts muszą mieć taki sam efekt po migracji.
- UI po timeout zachowuje **całą komendę**; ponawia ją, zamiast tworzyć nowy start/usunięcie. Anulowanie potwierdzenia przed wysłaniem niczego nie zapisuje. Po wysłaniu nie obiecuje cofnięcia commit; najpierw odczyt/rozstrzygnięcie operacji. „Odrzuć zmiany formularza” nigdy nie znaczy „usuń trening”.

### Czas wykonania i korekta bez zmiany celów

Pola A dodane migracją22 lokalnie:

- `started_at`: niezmienny techniczny moment zaakceptowania nowego startu przez serwer, UTC; dla legacy `null`, bez kopiowania `created_at` jako rzekomej godziny wykonania.
- `performed_at`: UTC, moment wykonania domyślnie równy nowemu `started_at`; może być skorygowany przy finish. Dla legacy `null`, dopóki użytkownik sam nie poda daty/godziny.
- `performed_on`: dotychczasowa data, projekcja daty wykonania w strefie przyjętej przy zapisie; dla legacy pozostaje znaną datą bez godziny.
- `performed_time_zone`: strefa IANA użyta do zapisu czasu (profil odczytany na serwerze); legacy bez wiedzy o strefie ma `null`.
- `snapshot_on`: niezmienna data doboru 1RM przy rozpoczęciu, dla legacy skopiowana z pierwotnego `performed_on`. `plan_version_id`, `plan_session_id` i wszystkie pola snapshotów pozostają niezmienne. `created_at` i `completed_at` zachowują znaczenie techniczne, nie zastępują godziny wykonania.

Nowy start bez ręcznej daty używa czasu serwera i strefy profilu, dobiera 1RM według początkowej daty wykonania i utrwala `snapshot_on`. Stary payload startu z `performedOn` pozostaje obsługiwany jako wpis z samą datą (`performed_at=null`), bez dopisywania zmyślonej godziny; `snapshot_on=performedOn`. Nowe UI używa automatycznego startu. Retry po północy najpierw odczytuje receipt, nie ustala nowej daty i nowych celów.

`finish` bez korekty nie zmienia datowania. Jawna korekta przesyła `performedAt` (ISO z offsetem) i `timeZone` zgodną z aktualną strefą profilu; lokalna data/godzina i offset muszą odpowiadać tej strefie. Dla nieistniejącej godziny podczas zmiany czasu odrzucić wejście, dla podwójnej godziny poprosić o jawny wybór offsetu. Nie zgadywać godziny legacy ani offsetu. Nowy moment wykonania nie może leżeć po technicznym momencie zakończenia przyjmowanym przez serwer. Zmiana strefy profilu w trakcie formularza daje czytelny konflikt wymagający ponownego wyboru, bez cichej konwersji wpisu.

Korekta aktualizuje wyłącznie metadane wykonania/datę, status, techniczne `completed_at`, revision i ślad zmiany w tej samej transakcji. Zmiana triggera kotwicy ma zachować niezmienność `snapshot_on`, właściciela i powiązań planu; nie otwiera bezpośredniego UPDATE dla klienta. **Nigdy nie uruchamia ponownie doboru 1RM ani przeliczenia procentów/kg.**

Przykład odbioru: start 17.10 z 1RM 120 kg i celem 75% = 90 kg; finish koryguje wykonanie na 15.10, gdy obowiązywało 100 kg. Kalendarz/filtry pokazują 15.10, snapshot nadal 120 kg/90 kg i `snapshot_on=17.10`. Nowa sesja ma własny dobór. Sprawdzić też brak 1RM (`null` pozostaje `null`), zakresy, krok zaokrąglenia oraz zmianę planu po starcie.

Wszystkie odczyty kalendarza/historii/postępu i poprzedniego wyniku używają wspólnej projekcji: dla znanego `performed_at` data/godzina w **aktualnej strefie profilu**, dla date-only — dosłowne `performed_on` i „godzina nieznana”. Filtry stosują tę samą datę co UI, nie bezwarunkowo starą kolumnę SQL. Zmiana strefy profilu może przesunąć dzień prezentacji znanego czasu; nie zmienia snapshotów ani bazowej kotwicy. Sortowanie: data projekcji, znany moment, stabilny ID; nie udawać chronologii godzin date-only przez `created_at`. A opisuje i testuje wspólną funkcję przed przekazaniem D.

### Kontrakty odczytu i prezentacji dla B–D

- Nowy `GET /api/workouts/[id]`: własny spójny stan `{workout, exercises}` z rewizją, statusem, nazwą jednostki, polami czasu i pełnymi snapshotami/actuals; ćwiczenia/serie mają stabilne DB ID i kolejność. `previousResult` zachowuje wariant i semantykę wyniku, także czas/dystans. A zapewnia spójny odczyt jednej rewizji (transakcyjny RPC lub wykrycie zmiany rewizji z ograniczonym ponowieniem); bieżące kilka zapytań bez kontroli rewizji nie wystarcza.
- Odczyty prywatne: Auth + właściciel/RLS i `Cache-Control: no-store`. Po usunięciu 404/410 według rozpoznanej własności; bez cudzych metadanych. GET nie zapisuje ani nie wznawia sesji.
- Repozytorium A udostępnia listę aktywnych sesji całego konta i wpisy historii dla zakresu miesiąca w strefie profilu: `{id, name, status, revision, performedOn, performedAt, timeZone, timeKnown}`. `performedOn` w DTO oznacza datę projekcji opisaną wyżej. Nazwa pochodzi z przypiętej wersji/jednostki, bez podmiany na najnowszy plan; dla braku nazwy jawna etykieta „Trening”. Granice zakresu końcowo wyłączne, uwzględniają DST. Trwające sesje osobno, zakończone w kalendarzu; legacy `abandoned` zachować jako odrębny stan poza oznaczeniem ukończenia, nie przedstawiać jako aktywnych.
- B tworzy czyste podsumowania tylko do odczytu: sąsiadujące identyczne parametry → bloki, z listą pierwotnych ID/pozycji, zachowaniem indywidualnych uwag, źródeł i opcjonalności. Grupowanie nie zmienia payloadu ani danych. C korzysta ze snapshotów, B z planu; nie wyliczać historycznych celów z bieżącego planu/1RM.
- Stan C: pełna komenda pending oraz szkice indeksowane `workoutId/exerciseId/setId`; zmiana aktualnej rewizji nie czyści innych szkiców. Po sukcesie odczyt aktualnego stanu, scalanie tylko potwierdzonego wpisu, bez cofania rewizji przy spóźnionej odpowiedzi. Po 409 zachować szkic i wymagać odczytu/rozstrzygnięcia, bez automatycznego nadpisania. Błąd odczytu po skutecznym zapisie nie wysyła nowej operacji i nie przesuwa do kolejnej serii na ślepo.
- Stan B: ostatni wybór per plan i wersja, stabilny sessionId, fallback do pierwszego po usunięciu/zmianie wersji; brak trwałego serwerowego zobowiązania lub migracji dla tej preferencji. C zachowuje osobne szczegóły i pozycję listy również po zapisie i Wstecz; możliwy URL stanu, bez zapisywania prywatnych wyników w URL.

## Etapy i lokalne kryteria przekazania

### T13-A — sesje/API/datowanie

Wynik: gotowy kontrakt powyżej, kompatybilna nowa migracja, transakcyjne komendy/GET i wspólny odczyt czasu. Minimalny formularz rozstrzygania i korekty dostarcza C; A ma udowodnić zachowanie na API.

Brama A: rzeczywiste lokalne Auth/PostgREST A/B/anon i odtworzenie migracji na syntetycznej bazie; równoczesne starty z różnymi/tymi samymi ID, save vs delete, replace vs start; rollback po błędzie nowej jednostki; stara rewizja/PT409; timeout po commit delete/replace, stare start/save po delete bez odtworzenia; zastane wielokrotne sesje; obce dzieci/ID; finisz z pending bez fikcyjnych wyników; korekta czasu i niezmienność snapshotów. Porównać stan przed/po, a nie tylko status HTTP. Legacy dane/receipts i brak godziny zachowane. Regresja T04/T05 i dotkniętych T08/T09, testy domeny/komponentów, build i typy według TESTING.

### T13-B — podgląd planu

Wynik: R01–R03, wspólne podsumowania, przekazane style. Brama B: osiem serii zwinięte w krótkiej karcie; pełne szczegóły bez utraty ramp/AMRAP/opcjonalności/uwag/źródła; odrębne identycznie nazwane jednostki; wybór/fallback/wersje, cały plan i brak wymuszania tygodnia/terminu; rzeczywista aplikacja 360/390/430 px, co najmniej cztery karty przy 390 × 844 na typowym syntetycznym treningu, dostępność/fokus i brak overflow. Ręczny edytor i trzy kroki importu nie tracą funkcji/danych. Testy domenowe/komponentów podsumowań, adekwatna regresja, build/typy.

### T13-C — prowadzenie treningu

Wynik: R04–R11 i interfejs R13 oparty na A/B; podsumowanie końcowe z korektą daty/godziny. Brama C: jedna seria, następna dopiero po ACK/odczycie; rundy superserii z nierówną liczbą serii, opcjonalne i pominięte bez fikcyjnego wykonania; dodatki/komentarz na żądanie; historyczna poprawka; 0 vs null; zapis jednej serii nie czyści innego szkicu. Sprawdzić 409, błąd sieci/odczytu, retry identycznej komendy i anulowanie nawigacji, trzy wybory opuszczenia formularza, powrót/scroll/fokus, brak pełnego reload. Głos na mocku: zatwierdzenie i opóźniony wynik przy zmianie celu/revision; ręczna ścieżka przy awarii AI. Prawdziwy lokalny mobilny scenariusz start → konflikt/cancel/replace → serie → korekta czasu/finish → ponowne logowanie. 360/390/430 px, cztery karty 390 × 844, pola z klawiaturą i cele 44 px; ograniczenia emulatora zapisane.

### T13-D — kalendarz

Wynik: R14 i wspólne datowanie A, otwieranie C. Brama D: poniedziałek/niedziela, poprzedni/następny miesiąc, „Dzisiaj”, pusty dzień/miesiąc, kilka sesji jednego dnia, północ i granica miesiąca/roku, rok przestępny i DST; legacy bez godziny; korekta przy finish przenosi dzień bez zmiany celów; zmiana strefy profilu daje tę samą datę w UI/filtrach/postępie. Trwające osobno, `abandoned` nie jako wykonane, trwałe usunięcie usuwa oznaczenie. Powrót z C zachowuje miesiąc/dzień, klawiatura i czytnik mają nazwy dni/wyboru. Dane tylko właściciela, rzeczywista lokalna aplikacja mobile, testy domeny/komponentów i dotkniętych odczytów, build/typy.

### T13-E — niezależny odbiór

Osobny recenzent po ręcznym zleceniu, bez automatycznego uruchamiania. Czyta A–D, ale samodzielnie odtwarza scenariusze R01–R16 i nie uznaje deklaracji wykonawcy za test. Raport ma wersję/commit lub manifest roboczy, środowisko, polecenia, wynik dla każdego R i każdy błąd/przerwany test. Priorytet: izolacja danych, delete/late retry, atomowość, concurrency, data/1RM i utrata szkiców; pełny klikalny lokalny scenariusz mobilny 360/390/430 px i dostępność. Powtarza build/typy oraz adekwatne testy według TESTING na zintegrowanym stanie; regresję rozszerza tylko dla zmian lub nierozwiązanych ryzyk.

Kryterium: brak krytycznych błędów własności, utraty/duplikacji danych i przeliczenia historii; wszystkie uzgodnione lokalne kryteria spełnione. Usterki wracają do właściciela A/B/C/D przez I i podlegają ponownemu sprawdzeniu E; niespełnione kryterium nie znika przez zmianę dokumentacji. Fizyczny telefon/Safari oraz wdrożenie mają osobne niewykonane statusy; lokalny odbiór nie zamyka T10-R1/T11 ani nie upoważnia do publikacji.

## Prompty, handoffy i modele

Osobne gotowe prompty: [A](prompts/T13-A.md), [B](prompts/T13-B.md), [C](prompts/T13-C.md), [D](prompts/T13-D.md), [E](prompts/T13-E.md). Są materiałem do ręcznego uruchomienia przez użytkownika po spełnieniu zależności. Nie są wysłane do innych chatów.

Osobne karty przekazania: [A](handoffs/planned/T13-A.md), [B](handoffs/planned/T13-B.md), [C](handoffs/planned/T13-C.md), [D](handoffs/planned/T13-D.md), [E](handoffs/planned/T13-E.md). To **szablony przyszłych handoffów**, nie dowody wykonania. Po etapie powstaje nowy rzeczywisty `docs/handoffs/YYYY-MM-DD-T13-X-opis.md` według [TEMPLATE](handoffs/TEMPLATE.md), zawierający fakty i kompletny prompt kolejnego gotowego etapu. Nie nadpisywać szablonu historią ani oznaczać nieuruchomionych testów jako passed. B–E zawsze czytają rzeczywiste handoffy poprzedników wskazane w aktualnym STATUS; brak takiego handoffu zatrzymuje przejęcie.

Zgodnie z wyborem użytkownika: **GPT-6.1 Sol / high** dla przygotowania kontraktów i A/C/E; **GPT-6.1 Sol / medium** dla B/D po zamrożeniu kontraktów. Uzasadnienie kosztowe: medium dla ograniczonej prezentacji ogranicza koszt rozumowania; high pozostaje przy trwałości danych, integracji UI i niezależnej weryfikacji. To rekomendacje organizacyjne użytkownika, bez automatycznej zmiany modelu i bez obietnic cen/jakości.


## Realizacja A i przekazanie kontraktu — 2026-10-17

Migracja22 zachowuje stare hashe pełnej koperty T05 i FK; nie usuwa globalnie constraintów ani triggerów. `deleted_workouts(workout_id,owner_id)` ma tylko te dwa UUID, RLS read właściciela i kasowanie z profilem. Usuwanie odłącza FK receipts, zachowując techniczną response/hash. Replace/finish ma dodatkowy wewnętrzny receipt dla rewizji starej sesji (złożony FK), a publiczny operationId pokrywa całą transakcję. Helpery delete/finish nie mają grantów dla klienta. Jedyna ścieżka zapisu to apply_workout_command z owner lock przed receipt.

`POST /api/workouts` zachowuje kopertę/sukces T05 i dodaje delete/replace_active. Konflikty mają `{code,error,activeWorkouts?}`; code: ACTIVE_WORKOUT_EXISTS, MULTIPLE_ACTIVE_WORKOUTS, OPERATION_PAYLOAD_CONFLICT, REVISION_CONFLICT, PLAN_VERSION_CHANGED, WORKOUT_CLOSED, TIME_ZONE_CHANGED; usunięcie WORKOUT_DELETED/410, obcy lub nieznany zasób WORKOUT_NOT_FOUND/404. Brak auth401, błędne wejście400. Cache-Control no-store dla POST/GET. Retry receipt nie jest aktualnym stanem: zawsze osobny GET przed scalaniem UI.

`GET /api/workouts/[id]` korzysta z jednego STABLE RPC read_workout; pełne wiersze sesji, ćwiczeń i serii (wszystkie snapshoty/actuals) oraz previousSet po tym samym exercise_id, bez mieszania wariantów. previousResult jest polskim podsumowaniem, także czasu/dystansu i zera. Kolejność pozycji/ID, jedna rewizja MVCC. Pole workout.performed_on jest datą projekcji, stored_performed_on bazową datą zapisu; time_zone bieżącą strefą, performed_time_zone strefą zapisu, time_known flagą wiarygodnego czasu. Nazwa z przypiętej jednostki, fallback Trening. Typy w src/lib/workouts/contracts.ts.

Repozytorium: getWorkoutList zachowuje snake_case dla istniejącego UI; getActiveWorkouts() i getWorkoutHistory(from?,until?) zwracają camelCase DTO opisane powyżej, until wyłączny; abandoned nie trafia do żadnej z tych dwóch list. SQL workout_local_date i workout_read_model stanowią wspólną projekcję dla list/GET/porównań/postępu, a time.ts udostępnia zgodną czystą projekcję i zakres dla C/D. Filtr T08 „Do daty” pozostaje włącznie zgodnie z istniejącym UI; używa tej samej daty projekcji.

Bramka A przyjęta przez integratora, A review do E; szczegółowe testy/ograniczenia w rzeczywistym handoffie A i TESTING. C przejmuje formularze rozstrzygnięcia i daty, bez zmiany kontraktu. Powyższe przekazanie historyczne nie uruchamiało B; B zrealizowano po osobnym zleceniu poniżej.


## Realizacja B i przekazanie podsumowań — 2026-10-18

Bramka B przyjęta przez integratora, B review do niezależnego E. [Rzeczywisty handoff B](handoffs/2026-10-18-T13-B-podglad-planu.md) zawiera błędy wcześniejszych prób, wszystkie polecenia, pomiary i granice odbioru. R01–R03 oraz B-owa część R15/R16 wykonane lokalnie. C–E niewykonane i wymagają osobnego zlecenia.

Kontrakt B dla C: PlanPreview przyjmuje autoryzowany PlanEditorDocument, uporządkowane sessionIds/active, planId/versionId/current oraz TargetContext(date,records,increment). Lokalne ID wyboru nie nadaje dostępu. ExerciseSummary przyjmuje exercise/index/context i daje krótką kartę oraz natywne Wszystkie serie. presentation.ts eksportuje presentationBlocks, targetGoal, targetLoad, setPrescription, compactPrescription, snapshotPrescription i resolveSessionId; bez efektów ubocznych i zmian danych. C korzysta z snapshotPrescription dla WorkoutSet, nigdy z dzisiejszego TargetContext do historycznego wykonania. Dzisiejsze kg są tylko podglądem planu.

Właściciel B/integrator zwalnia stronę planu, nowe komponenty/podsumowania i globals.css. C przejmuje style według wcześniejszego przydziału i reużywa podsumowania; zmiana kontraktu wymaga uzgodnienia przez integratora. Nie zmieniono SQL/API ani plików C, edytora lub parsera importu. Dotychczasowy WorkoutStart jest tylko opakowany w szczegóły na żądanie i ma osobny mount przy zmianie jednostki; nadal używa starego date-only. Konflikty globalne/automatyczna godzina/nowe finish to C.

Dowody: prawdziwe lokalne Auth/DB/HTTP/Chrome, osiem serii, różne cele/rampa/AMRAP/opcjonalność/null/0, wybór/reload/fallback/wersje/start/wznowienie, cały plan i fokus. 360/390/430 px bez overflow, cztery pełne karty przy390×844 do763,98 px przed nawigacją782 px, mierzone cele44. Edytor Chrome i HTTP importu PASS; syntetyczny import przez trzy kroki/reload/publikację zachował dwie jednostki A i16serii, tygodnie/uwagi.190 passed/9 skipped, finalny build i następujące typy PASS. Fizyczna klawiatura telefonu/Safari niewykonane; to nie blokuje lokalnej bramki B i nie zamyka T10-R1.


## Realizacja C i przekazanie widoku sesji — 2026-10-18

R04–R11/R13 oraz część C R15/R16 wykonane lokalnie; integrator przyjął bramkę C. [Rzeczywisty handoff C](handoffs/2026-10-18-T13-C-prowadzenie-treningu.md) zawiera pliki, sprawdzenia, wcześniejsze błędy i ograniczenia. A/B/C review do niezależnego E; D–E niewykonane i wymagają osobnego zlecenia.

`WorkoutEditor` przyjmuje `LoadedWorkout` A i jest montowany z kluczem workout.id. Przegląd i szczegóły są w tej samej stronie; `?set=<DB-ID>` służy wyłącznie wyborowi autoryzowanej serii, bez wyników w URL. Powrót przywraca fokus karty i scroll; Chrome Wstecz korzysta z Navigation API, przeładowanie z natywnego beforeunload. Szkice należą do zamontowanej sesji, setId identyfikuje serię i jej ćwiczenie; zapis nie usuwa innych szkiców. Nie ma trwałego offline/autosave. Kolejność rund i liczniki są czystą projekcją w `workout-state.ts`; cele używają `snapshotPrescription` B. ExerciseSummary/PlanPreview B i kontrakty A pozostają bez zmian.

`useWorkoutCommand` zachowuje całą kopertę komendy z operationId/workoutId/expectedRevision/action/payload. Po ACK pobiera GET i przechodzi dalej dopiero po odczycie co najmniej potwierdzonej rewizji; retry błędu odczytu nie wykonuje POST. Stara odpowiedź receipt nie jest bieżącym stanem.409 nie nadpisuje szkicu: odczyt i jawny kolejny zapis tworzą nową komendę. Delete kończy się potwierdzeniem bez GET usuniętego zasobu. Start, indywidualne finish/delete legacy i replace używają wyłącznie API A. Korekta czasu wyznacza prawidłowe kandydaty offsetu w strefie profilu; podwójna godzina wymaga wyboru. D037 zapisuje decyzję klienta.

Dowody: rzeczywisty lokalny Chrome/Auth/API,360/390/430 px bez overflow i cztery pełne karty390×844 (do659,41 przy nawigacji782), jedna seria, pola/akcje44, obniżona wysokość500, round order/optional/extra/skipped, retry po commit/409/GET failure/inny szkic/Wstecz, głos mock z zatwierdzeniem i anulowaniem, ponowne logowanie, historyczna poprawka i korekta daty bez zmiany null lub120/90 snapshotu.198 testów, regresje T13-A/T05/T08/T09, build/typy PASS. Fizycznego telefonu/Safari nie sprawdzano. Bez zmian SQL/API, migracji lub produkcji. Pliki C i globals.css zwolnione dla osobno zleconego D; kalendarz ma otwierać `/trening/<id>` i reużyć projekcję czasu A.

## Stan wykonania D w programie T15 — 2026-10-19

T13-D zrealizowane raz jako T15-D, commit cc381f3. Kalendarz korzysta z projekcji T13-A i wspólnego przeglądu B/C, zachowuje wybór dnia/miesiąca, pokazuje zakończone i osobno aktywne sesje; legacy bez godziny. Lokalna bramka I przyjęta:6unit, build/typy i prawdziwe API/Chrome360/390/430, klawiatura, DST/północ/strefy, korekta daty bez zmiany snapshotów, delete i A/B/anonPASS. [Rzeczywisty handoff D](handoffs/2026-10-19-T15-D-historia.md). A–D pozostają review do niezależnego T15-G/T13-E; fizyczny telefon/Safari niewykonane.

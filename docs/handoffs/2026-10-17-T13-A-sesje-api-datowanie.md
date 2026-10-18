# Handoff — T13-A — sesje/API/datowanie

- Data i autor: 2026-10-17, Codex — jedyny wykonawca A i integrator; bez innych agentów.
- Zadanie/status: T13-A review, lokalna bramka A przyjęta przez integratora; done dopiero po niezależnym E. T13 in_progress, B–E todo, B nie uruchomiono.
- Branch/commit/stan: main, HEAD `c144213`; zmiany lokalne bez commit/push. Na wejściu były niezacommitowane zmiany dokumentacji T13-P (README, ARCHITECTURE, CHANGELOG, DATA_MODEL, DECISIONS, OPEN_QUESTIONS, PRODUCT, ROADMAP, STATUS, TESTING, UX oraz nowe T13_MOBILE_WORKOUT, handoff podziału, prompty i karty planned); zachowano je. Poniższe pliki opisują przyrost bieżącej sesji.
- Poprzedni rzeczywisty [handoff podziału](2026-10-17-T13-podzial-etapow.md), kontrakt [T13](../T13_MOBILE_WORKOUT.md), historyczny [T05](2026-10-11-T05-wykonanie-historia.md).

## Cel i wykonana praca

Bieżące zlecenie potraktowano jako osobne uruchomienie A zgodnie z AGENTS18. Przeczytano punkty startowe, prompt A/specyfikacje i handoffy wymaganych poprzedników, sprawdzono stan roboczy. W ROADMAP przejęto wykonanie A i integrację, in_progress → review po bramce. Nie zmieniono funkcji B–D ani budżetu/usług. Zakres R09–R13/R16 po stronie danych/API sprawdzony lokalnie; formularze i mobilne UI pozostają C, końcowy niezależny odbiór E.

Przed kodem odczytano rzeczywiste FK/definicję apply_workout_command/triggery/profil w lokalnym PostgreSQL. Wykryto FK receipts → sesja oraz złożony FK rewizji do receipt tej samej sesji, triggery T02 i T06-R1. D035 zapisało realizację przed kodem. Zachowano FK i wszystkie triggery celów, bez globalnego wyłączania. Wszystkie komendy używają owner lock z auth.uid() przed receipt/wierszem; nowe starty kontrolują całe konto. Legacy z wieloma aktywnymi nie są automatycznie rozstrzygane.

Delete fizycznie usuwa serie, wykonane ćwiczenia, rewizje i sesję; nie rusza katalogu, planu ani 1RM. Nullable FK receipts jest ustawione na null dopiero po skasowaniu rewizji. Zachowany hash/techniczna response i deleted_workouts(owner_id,workout_id) blokują odtworzenie: start/save i nowe komendy własnego usuniętego ID410, retry delete pierwotny sukces, sprzeczny payload409. Ślady trwają do usunięcia konta. Replace finish/delete + nowy start + potwierdzenia są jedną transakcją. Przy finish starej sesji istnieje osobny wewnętrzny receipt dla jej rewizji, zgodny ze złożonym FK.

Nowe started_at/snapshot_on są niezmienne; legacy snapshot_on to dawne performed_on, godziny null. Nowy start bez daty używa zegara DB i profilu, stary performedOn pozostaje date-only. Finish sprawdza ISO z offsetem, zgodność lokalnej godziny ze strefą profilu, DST, przyszłość i zmianę strefy. Aktualizuje tylko metadane wykonania/status/rewizję i receipt; nie dobiera ponownie maksimum ani nie zmienia snapshotów.

## Zmienione pliki i przekazanie własności

- [Nowa migracja22](../../supabase/migrations/20261017100000_t13a_workout_sessions.sql) — pola czasu/kotwica, minimalny ślad, owner lock, globalne konflikty, delete/replace/finish, spójny odczyt i projekcja czasu. Starsze migracje bez zmian. Zastosowana wyłącznie lokalnie.
- [POST](../../src/app/api/workouts/route.ts), [nowy GET](../../src/app/api/workouts/[id]/route.ts), [błędy HTTP/no-store](../../src/lib/workouts/http.ts).
- [Repozytorium](../../src/lib/workouts/repository.ts), [typy kontraktów](../../src/lib/workouts/contracts.ts), [czas](../../src/lib/workouts/time.ts), [testy czasu](../../src/lib/workouts/time.test.ts), [odczyt postępu](../../src/lib/progress/repository.ts).
- [Test RPC/HTTP](../../scripts/test-t13a-api.mjs), [test odtworzenia migracji](../../scripts/test-t13a-migration.mjs), [package.json](../../package.json) — jeden nowy skrypt test:t13a:local, bez zależności i zmian lockfile.
- README, STATUS, ROADMAP, DECISIONS (D035), CHANGELOG, DATA_MODEL, ARCHITECTURE, TESTING i T13_MOBILE_WORKOUT — stan/kontrakt/dowody wykonania A. Ten rzeczywisty handoff. OPEN_QUESTIONS/PRODUCT/UX i karty planned nie były zmieniane w A.

Pliki A zwolnione po odbiorze; wspólne dokumenty pod integracją Codex. B może przejąć wyłącznie swój przydział i globals.css po osobnym zleceniu. Style/komponenty/strony planu nie były dotykane w A.

## Finalny kontrakt dla B–D

- POST zachowuje kopertę operationId/workoutId/expectedRevision/action/payload i stare pola sukcesu. Start `{planSessionId}` automatyczny; stare `{planSessionId,performedOn}` date-only. Replace koperta starej sesji, payload `{resolution:"finish"|"delete",next:{planSessionId},finish?:{performedAt,timeZone}}`. Finish dopuszcza taką korektę; delete tylko aktywne. Receipt pokrywa cały niezmienny zamiar, z obydwoma kotwicami i czasem; PT409 bez biznesowego40001.
- Konflikt: `{code,error,activeWorkouts?}`. ACTIVE_WORKOUT_EXISTS/MULTIPLE_ACTIVE_WORKOUTS dają tylko własne ID/revision/name/performedOn/performedAt/savedSetCount. Pozostałe stabilne kody w http.ts/specyfikacji. Własne usunięte410 WORKOUT_DELETED, obce/nieznane404, anon401, błędne wejście400. Każda odpowiedź GET/POST no-store.
- GET `/api/workouts/[id]` używa jednego STABLE read_workout, spójna rewizja i pełne snapshoty/actuals; previousSet z poprzedniej ukończonej sesji tego samego exercise_id (wariant), previousResult obejmuje też czas/dystans i zero. Kolejność pozycji/ID. Sukces komendy jest technicznym receipt, nie bieżącym stanem — C pobiera GET i nie cofa nowszego stanu starym retry.
- `workout.performed_on` = data projekcji w aktualnej strefie; stored_performed_on = baza zapisu; performed_time_zone = strefa przy zapisie, time_zone = bieżący profil, time_known = czy istnieje wiarygodna godzina. Date-only zachowuje dzień i wymaga etykiety „godzina nieznana” w przyszłym UI. Nazwa z przypiętej jednostki, fallback Trening.
- getWorkoutList zachowuje snake_case dla istniejącego UI; getActiveWorkouts i getWorkoutHistory(from?,until?) dają DTO z T13, koniec zakresu wyłączny. Abandoned wyłączone z obu tych list. T08 nadal ma istniejące „Do daty” włącznie, lecz wspólną projekcję dnia. SQL workout_local_date/workout_read_model oraz czyste time.ts opisują ten sam wybór daty, z pominięciem created_at jako fikcyjnej godziny.

## Weryfikacja

Środowisko rzeczywiste: macOS, Node26.4, Supabase CLI2.120, lokalny Docker/Auth/PostgREST i PostgreSQL17.11; Next16.4 produkcyjny build na localhost3005. Wszystkie dane syntetyczne. AI jawnie wyłączone: OPENAI_API_KEY puste, OPENAI_IMPORT_ENABLED/OPENAI_VOICE_ENABLED false, live opt-in false. Nie pobierano/drukowano sekretów; runner korzysta z lokalnych wartości procesu.

1. Odczyt lokalnego katalogu FK/triggerów/pg_get_functiondef i `npx supabase migration up --local`: PASS migracja22. W trakcie implementacji ponownie zapisano wyłącznie lokalną definicję komendy po korekcie generowania oraz blokady planu; finalny plik zweryfikowano przez replay.
2. `node scripts/test-t13a-migration.mjs`: PASS. Nowa izolowana baza w lokalnym klastrze, rzeczywiste schematy Auth/Storage bez danych/polityk public; replay21 migracji, legacy dwie aktywne sesje/receipts/rewizje, migracja22. Wszystkie stare wartości porównane przed/po, nowe godziny null. Stary hash i retry startu zachowane, późny retry po delete410. Prawdziwe FK/triggery/granty. Wymuszony INSERT failure po rozstrzygnięciu w obu replace: wszystkie sesje/ćwiczenia/serie/rewizje/receipts/tombstones identyczne po rollback. Baza usunięta w finally, bez resetu bazy aplikacji. To nie jest zdalny restore ani test usług Auth izolowanej bazy; prawdziwe Auth testowano osobno niżej.
3. `DO_NOT_TRACK=1 T13A_HTTP_BASE=http://localhost:3005 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run test:t13a:local`: PASS, prawdziwy RPC oraz POST/GET Next A/B/anon. Równoczesne starty różnych dni i identycznego operationId, dwa replace, replace/start, save/delete. Brak duplikacji, konflikty/PT409, legacy indywidualnie; obce sesje/dzieci/nowe jednostki, własne dziecko innej sesji. Prywatność404/410 i no-store, helpery i DML niedostępne.
4. Timeout po commit symulowany na granicy odpowiedzi: RPC wyrzuca potwierdzenie, HTTP anuluje body po nagłówkach sukcesu delete/replace. Retry identycznej komendy bez duplikacji; stary start/save po delete410, nowy command deleted410, sprzeczna treść409. Retry replace po zakończeniu nowej200, po usunięciu410. Nie symulowano fizycznego zerwania sieci telefonu.
5. GET podczas12 zapisów i18 odczytów: actual_note zawsze odpowiada revision w tym samym stanie. Korekta17→15.10: wszystkie pola snapshot/ID1RM niezmienne, 120kg/90kg zamiast ponownego doboru100kg, zakresy/opcjonalność/null/zero zachowane. Zmiana strefy przesuwa15→14.10 zgodnie w GET/view/filtrze postępu. Pending nie zmieniają się w completed. Historyczna poprawka działa. Luka DST/brak offsetu/przyszłość odrzucone, oba jawne offsety jesienne przyjęte, strefa zmieniona409. Poprzedni wynik powtórzenia/kg i60s/400m. Strony trening/historia/postęp HTTP200.
6. `npm run test:t04:local`, `test:t05:local`, `test:t06r1:local`, `test:t08:local`, `test:t09:local` z AI off: PASS. T08 z T08_HTTP_BASE i T09 z T09_HTTP_BASE=http://localhost:3005 także PASS. T09 sprawdza odmowę płatnego wywołania bez budżetu, nie prawdziwego dostawcę.
7. `OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false DO_NOT_TRACK=1 npm test`: 180 passed /9 skipped; 24 pliki passed /5 skipped. Dziewięć nowych przypadków czasu obejmuje date-only, północ/strefy, granicę roku, DST i luty przestępny/wyłączny zakres. Skipped to opt-in/live/integracje, bez deklaracji ich uruchomienia.
8. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs build`: PASS, potem `npm run typecheck`: PASS. `node --check` obu runnerów i git diff --check: PASS. Kontrola24 plików Markdown/203 lokalnych linków, whitespace/bloków i zgodności promptu: PASS.

Pierwszy dostęp do Dockera bez eskalacji nie przeszedł przez sandbox; ponowiono z uprawnieniem i środowisko było dostępne. Pierwszy test T13-A zakończył się błędem asercji oczekującej410 po samym zakończeniu nowej sesji replace; zgodnie z kontraktem ma być200. Poprawiono test i powtórzono RPC/HTTP z sukcesem. Nie ukryto tego jako sukcesu pierwszej próby. Podczas generowania migracji usunięto nadmiarowy blok przed końcowym testem; nie zmieniał danych, finalny plik/replay zgodne.

## Decyzje i zmiany planu

D035: doprecyzowanie projektu D034 na prawdziwych FK, wewnętrzny receipt dla finish starej i pojedynczy MVCC odczyt. Bez zmiany wymagań użytkownika. T13-A in_progress → review; integrator przyjmuje pełną lokalną bramkę i dopuszcza przyszłe B, lecz A nie jest done przed E. T13 in_progress; B–E todo. Przydział i zależności zachowane. Brak zdalnej migracji, deploymentu i zmian T11/T10-R1.

## Pozostała praca i blokery

Brak znanego blokera lokalnej bramki A. A czeka na niezależne E po B–D. B–E oraz nowe mobilne formularze/kalendarz niewykonane, bez deklaracji klikanego mobile390×844 ani fizycznego telefonu/Safari w A. Obecne UI nadal używa starego startu date-only i nie daje nowych opcji konfliktu/korekty; te elementy są zakresem C. B może używać obecnego kontraktu, ale nie ma zgody na automatyczne rozpoczęcie. Środowisko DB/API/UI musi być dostępne przy odbiorze B. Migracja produkcji i publikacja nie były zlecone. Nie wykonano płatnego AI, E ani odbioru fizycznych urządzeń.

## Następny krok

Po osobnym zleceniu tylko T13-B — od przejęcia plików B, globals.css i wydzielenia czystych podsumowań. Czytać handoff A jako kontrakt danych; nie zmieniać SQL/API. Model GPT-6.1 Sol /medium wystarcza do prezentacji po ustalonym kontrakcie i ogranicza koszt. Nie uruchomiono B ani kolejnego chatu.

## Stan środowiska

Lokalny Supabase zastany uruchomiony pozostaje uruchomiony, z migracją22. Własny serwer Next3005 zatrzymany po odbiorze; nie zmieniano zastanych innych procesów. Wszystkie konta syntetyczne runnerów sprzątnięte w finally, izolowana baza replay usunięta; konto właściciela/dane istniejące nie były modyfikowane. Tymczasowe pliki SQL/skrypty kontrolne/prompt w /private/tmp zawierają wyłącznie schemat/kod/prompt, bez sekretów i danych prywatnych. Repo pozostaje z lokalnymi zmianami; niczego nie commitowano/pushowano ani wysyłano na produkcję. Nie zmieniano .env ani ustawień AI/usług.

## Prompt dla kolejnego agenta

Rekomendacja: GPT-6.1 Sol / medium — gotowe kontrakty A pozwalają oszczędzić koszt rozumowania dla prezentacji. Prompt do ręcznego użycia, nie uruchamia następnego etapu.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy.
Po osobnym zleceniu użytkownika wykonaj tylko T13-B — podgląd planu. Zacznij od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/WORKFLOW.md i docs/handoffs/2026-10-17-T13-A-sesje-api-datowanie.md. Przeczytaj docs/prompts/T13-B.md, docs/T13_MOBILE_WORKOUT.md, UX, DATA_MODEL, DECISIONS i TESTING. Sprawdź rzeczywisty stan plików; T13-A jest review, jego lokalna bramka przyjęta przez integratora, B–E niewykonane.
Zakres B: selektor treningu bez tygodni, pierwszy/ostatnio wybrany per plan i wersja, zwarte karty i Wszystkie serie, podgląd całego planu oraz wspólne czyste podsumowania dla C. Zachowaj odrębne jednostki, wersje, rampy, AMRAP, opcjonalność, uwagi, oryginały i null; start tylko aktualnej wersji. Przejmij tylko pliki B oraz globals.css zgodnie z przydziałem; bez zmian SQL/API i bez etapu C.
Kryteria: pełna bramka B i R01–R03/R15/R16, osiem serii oraz różne cele, regresje edytora/importu, prawdziwa lokalna aplikacja 360/390/430 px i cztery karty przy 390×844, fokus i cele dotykowe 44 px, adekwatne testy, build, potem typy. Lokalny Supabase ma migrację22 T13-A; serwer testowy3005 został zatrzymany. Brak znanego blokera technicznego; wymagane osobne zlecenie B i dostępne lokalne DB/API/UI, brak środowiska blokuje odbiór. Jeden wykonawca i integrator, bez innych agentów, produkcji i płatnego AI. Zachowaj zastane niecommitowane zmiany. Zaktualizuj dokumentację i utwórz rzeczywisty handoff z identycznym promptem następnej sesji w handoffie oraz odpowiedzi. B pozostaje review do niezależnego E.
Model: GPT-6.1 Sol / medium — gotowe kontrakty A ograniczają zadanie do prezentacji i pozwalają oszczędzić koszt rozumowania.
```

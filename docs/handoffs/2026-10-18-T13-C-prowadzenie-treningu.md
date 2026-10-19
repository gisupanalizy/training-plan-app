# Handoff — T13-C — prowadzenie treningu

- Data i autor: 2026-10-18, Codex — jeden wykonawca C i integrator, bez innych agentów.
- Zadanie/status: T13-C review; integrator przyjął lokalną bramkę C. A/B/C review do niezależnego E, T13 in_progress, D–E todo. D nie uruchomiono.
- Branch/commit/stan: main, HEAD `c144213`; lokalne zmiany bez commit/push. Zachowano zastane niecommitowane A/B/T13-P. Podczas sesji pojawiły się nieśledzone `.codex/hooks.json` i `.cursor/hooks.json` — nie były tworzone ani edytowane przez wykonawcę C, pozostawione.
- Wcześniejsze rzeczywiste handoffy: [B](2026-10-18-T13-B-podglad-planu.md), [A](2026-10-17-T13-A-sesje-api-datowanie.md), [podział](2026-10-17-T13-podzial-etapow.md). [Specyfikacja](../T13_MOBILE_WORKOUT.md) i [karta szablonowa C](planned/T13-C.md), która pozostaje szablonem.

## Cel i wykonana praca

Osobne zlecenie użytkownika uruchomiło tylko C. Przeczytano instrukcje/specyfikacje i rzeczywiste kontrakty A/B, sprawdzono rzeczywisty stan roboczy; ROADMAP otrzymał właściciela i in_progress przed kodem. Po wykonaniu lokalnej bramki C status zmieniono na review, bez pozornego done przed E. Zakres R04–R11/R13/R15/R16 wykonany lokalnie.

Przegląd ma nazwę, projektowaną datę/godzinę lub „godzina nieznana”, osobne liczniki wymaganych/opcjonalnych/dodatkowych/pominiętych, zwarte klikalne karty i ramki superserii. Dodatkowe ćwiczenie i komentarz otwierają się na żądanie. Kontynuuj prowadzi po oczekujących wymaganych seriach; rundy superserii nie wyrównują nierównej liczby rekordów. Po wymaganych danej grupy użytkownik wybiera opcjonalną albo następne ćwiczenie/przegląd. Pominięcie nie jest wykonaniem.

Szczegóły mają jeden formularz, cel snapshotu i poprzedni porównywalny wynik. Powtórzenia/kg lub czas/dystans zależą od zapisanego celu i istniejących actuals. RPE/RIR/komentarz są w Dodatkowych informacjach; istniejące dodatkowe actuals otwierają sekcję. Wszystkie serie pokazują każdy cel/wynik/stan i pozwalają wskazać poprawkę, także historyczną. Brak danych nie jest zerem, wyniki nie kopiują automatycznie celu.

Zapis nie przeładowuje dokumentu. ACK wymaga GET przed przejściem; błąd GET ponawia tylko GET. Retry sieciowy zachowuje pełną kopertę;409 zachowuje szkic i wymaga odczytu oraz świadomego nowego zapisu. Inne szkice pozostają. Powrót i wyjście chronią zmiany przez zapisz/odrzuć/zostań. Powrót przywraca fokus karty/scroll; Chrome Wstecz działa w tym samym dokumencie. Przeładowanie/zamknięcie używa beforeunload.

Nowy start używa automatycznego czasu. Konflikt przedstawia własne sesje i powrót/finish/delete. Wiele legacy rozstrzyga się indywidualnie. Delete ma dodatkowe potwierdzenie z nazwą i utratą wyników; atomowy replace korzysta z API A. Finish oferuje korektę lokalnej daty/godziny w strefie profilu, blokuje lukę DST i wymaga wyboru offsetu powtórzonej godziny. Snapshotów nie przelicza. Głos pozostaje propozycją kotwicy serii/rewizji z jawnym zatwierdzeniem i anulowaniem spóźnionego kontekstu.

## Zmienione pliki i przekazanie własności

Pliki produkcyjne C:

- [WorkoutStart](../../src/components/workout-start.tsx) — start automatyczny, konflikt, indywidualne legacy, dodatkowe potwierdzenie delete i atomowy replace.
- [WorkoutEditor](../../src/components/workout-editor.tsx) — przegląd/szczegóły, szkice, operacje, rundy, nawigacja i historyczna poprawka.
- [WorkoutVoice](../../src/components/workout-voice.tsx) — blokada podczas zapisu, stabilna etykieta komentarza, komunikat ponownego przygotowania propozycji.
- [Strona treningu](../../src/app/trening/[id]/page.tsx) — kompaktowy nagłówek w kliencie i klucz workout.id izolujący stan różnych sesji.
- Nowe [workout-command.ts](../../src/components/workout-command.ts), [status komendy](../../src/components/workout-command-status.tsx), [workout-state.ts](../../src/components/workout-state.ts), [dialog](../../src/components/workout-dialog.tsx), [finish](../../src/components/workout-finish.tsx) — osobne transport, czysta projekcja, native modal i wspólna korekta.
- [globals.css](../../src/app/globals.css) — dopisane wyłącznie style C, scoped workout-*; bez przebudowy edytora/importu/B.

Sprawdzenia C:

- [workout-editor.test.tsx](../../src/components/workout-editor.test.tsx), [workout-voice.test.tsx](../../src/components/workout-voice.test.tsx), nowe [workout-start.test.tsx](../../src/components/workout-start.test.tsx), [workout-state.test.ts](../../src/components/workout-state.test.ts) i syntetyczny [workout-fixture.ts](../../src/components/workout-fixture.ts).
- Nowy [scripts/test-t13c-browser.mjs](../../scripts/test-t13c-browser.mjs) przypisany C przez integratora. Bez nowych zależności lub zmian package.json/lockfile.

Dokumenty integratora: README, STATUS, ROADMAP, T13_MOBILE_WORKOUT, UX, DATA_MODEL, ARCHITECTURE, PRODUCT, OPEN_QUESTIONS, DECISIONS (D037), TESTING, CHANGELOG i ten rzeczywisty handoff. PRODUCT/OPEN_QUESTIONS otrzymały wyłącznie aktualny stan realizacji, bez nowego zakresu produktu.

**Nie zmieniono w C** SQL, migracji, API/repozytorium A, czystych podsumowań/ExerciseSummary/PlanPreview B, edytora/importu lub kalendarza historii. Zastane zmiany w tych plikach nadal pochodzą z wcześniejszych etapów. Pliki C i globals.css są zwolnione po przyjętej lokalnej bramce; D przejmuje wyłącznie swój przydział i style po osobnym zleceniu.

## Finalny kontrakt dla D

- `WorkoutEditor` przyjmuje `LoadedWorkout` z A, montowany z kluczem workout.id. `/trening/<id>` otwiera wspólny zwarty przegląd aktywnej lub ukończonej sesji; optional `?set=<id>` wybiera tylko serię należącą do autoryzowanego odczytu. Wyników ani notatek nie ma w URL. D nie musi tworzyć osobnego edytora historii.
- `useWorkoutCommand`: `makeCommand(workoutId,expectedRevision,action,payload)` kopiuje cały zamiar. Pending zawiera wszystkie pola, retry nie odczytuje nowej rewizji/formularza. ACK to receipt, potem GET no-store i kontrola co najmniej potwierdzonej rewizji. Usuwanie po ACK nie pobiera nieistniejącego zasobu. Błąd odczytu nie tworzy nowej operacji.409/4xx wymagają jawnego odczytu/rozstrzygnięcia; szkice nie są podmieniane.
- W pamięci zamontowanej sesji setId identyfikuje serię i jej ćwiczenie; mapy szkiców nie są czyszczone zmianą revision. Po sukcesie usuwany tylko własny potwierdzony szkic; niezmieniony lokalnie komentarz może przyjąć nowy odczyt, brudny zostaje. Brak trwałości offline po zamknięciu karty.
- C używa `snapshotPrescription` B bez dzisiejszego TargetContext/1RM; planowy ExerciseSummary nadal pozostaje w B, bez zmiany jego interfejsu. Dane planu i wykonania pozostają odrębne.
- Projekcja dat/stanów API A bez zmian. D korzysta z getActiveWorkouts/getWorkoutHistory/time.ts według kontraktu A. Obecny link „Historia treningów” to `/historia`; zachowanie miesiąca/dnia po powrocie jest obowiązkiem D. Nie implementowano kalendarza.

## Weryfikacja

Rzeczywiste środowisko: macOS, Node26.4, lokalny Docker/Supabase Auth/PostgREST z istniejącą migracją22, produkcyjny Next16.4 na localhost3005, desktopowy Chrome/Playwright runtime. Wyłącznie własne konta i dane syntetyczne. OPENAI_API_KEY puste, OPENAI_IMPORT_ENABLED/OPENAI_VOICE_ENABLED=false, live opt-in=false. Bez wywołania płatnego AI.

1. `OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false DO_NOT_TRACK=1 npm test`: **198 passed /9 skipped**,28 plików passed/5 skipped. Nowe przypadki obejmują niezmienną pełną kopertę start/save, brak performedOn nowego startu, ACK/GET failure,409/zachowanie szkicu i nową komendę po odczycie, osobny szkic komentarza, trzy wybory nawigacji, nierówne rundy,0/null, DST i opóźnioną propozycję przy zmianie rewizji/celu. Skipped to istniejące opt-in/live/integracje, nie deklarowano ich uruchomienia.
2. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs build`: **PASS**; wrapper pobiera tylko lokalną konfigurację i wykonuje npm run build. Następnie `npm run typecheck`: **PASS**. Końcowy build obejmuje wszystkie finalne zmiany kodu C.
3. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs start`, następnie:

```sh
DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false T13C_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t13c-browser.mjs
```

**PASS** rzeczywista lokalna aplikacja/API.360/390/430 bez overflow, przy390×844 czwarta karta kończy się659,40625 px przed nawigacją782. Osiem serii w karcie, rampa/AMRAP/opcjonalna, nierówne rundy S1 i wybór opcjonalnej; dodatkowa seria/ćwiczenie, pominięcie,0 powtórzeń/null kg, czas60s/dystans400m, historyczna poprawka. Jeden formularz, focus/Enter/cele44; pola i zapis dostępne po obniżeniu viewportu do500. Powrót/scroll/fokus oraz Chrome Wstecz, zostań/odrzuć/zapisz. Nie jest to test systemowej klawiatury.

Rzeczywisty POST popełnia commit, runner odrzuca odpowiedź; retry ma identyczny string całej komendy. Znacznik dokumentu pozostaje ten sam. Po ACK wymuszony błąd GET zatrzymuje serię, retry wysyła wyłącznie GET. Rzeczywisty drugi zapis przez API daje409 w UI; szkic8 pozostaje do odczytu i świadomego zapisu. Inny szkic komentarza nie znika po zapisie serii.

Głos wyłącznie mock transportu: pending przed zatwierdzeniem,7/100 po zatwierdzeniu, opóźniona odpowiedź po zmianie celu nie trafia do nowej serii;503 pozostawia ręczny formularz. Osobny test komponentu zmienia też revision przed odpowiedzią. Bez nowego testu mikrofonu lub dostawcy.

Start ma wiarygodny automatyczny czas. Konflikt pokazuje powrót do właściwego ID; cancel zachowuje sesję. Finish-replace kończy starą i otwiera nową, delete-replace wymaga dodatkowego potwierdzenia (również cancel), stary GET410. Osobny delete aktywnej też wymaga potwierdzenia. Dwie syntetyczne legacy utworzone lokalnym adminem, bez zmiany schematu; UI rozstrzyga jedną, druga pozostaje in_progress i może być indywidualnie usunięta, godzina nieznana.

Korekta18→15.10 nie zmienia snapshotów: najpierw brak1RM zachowany mimo dodania120 podczas trwania; następny start ma120/90 i finish-replace z korektą nadal120/90. Pending nie zmienia się w completed. Historyczna poprawka9 pozostaje po rzeczywistym formularzu ponownego logowania. Brak pageerror. Wizualnie obejrzano syntetyczne `/private/tmp/t13c-390.png` i `t13c-detail.png`;360/430 i pośrednie zrzuty również w `/private/tmp`.

4. Regresje z DO_NOT_TRACK=1 i AI off: **PASS** `T13A_HTTP_BASE=http://localhost:3005 npm run test:t13a:local` (RPC i HTTP A/B/anon, concurrency/retry/delete/daty/snapshoty według istniejącego runnera), `npm run test:t05:local`, `T08_HTTP_BASE=http://localhost:3005 npm run test:t08:local` (940→1140 i HTTP), `T09_HTTP_BASE=http://localhost:3005 npm run test:t09:local` (A/B/anon, cel/revision/brak budżetu). Nie zmieniano API, lecz regresje potwierdzają zgodność integracji klienta.
5. `node --check scripts/test-t13c-browser.mjs`, `git diff --check` i końcowa kontrola13 dokumentów/176 lokalnych linków, bloków i zgodności promptu: **PASS** (kontrola po zapisaniu handoffu). Nie ponawiano replay migracji ani całego klikanego edytora/importu; kod ich funkcji nie był zmieniany, style C są scoped, a istniejące testy komponentów przeszły. Historyczny runner B ma asercję dawnego date-only startu; nowy kontrakt startu sprawdza C, runnera B nie zmieniano w cudzym przydziale.

### Błędy wcześniejszych prób

- Pierwszy build nie dotarł do Dockera przez sandbox; powtórzenie z uprawnieniem zadziałało, bez resetowania bazy.
- Pierwsze typy wykryły brak spłaszczenia list rund — poprawiono. Pierwszy test nawigacji jsdom wymagał mocka showModal/close, ponieważ jsdom nie otwiera natywnego dialogu. Pierwszy build wykazał testowe ByRoleOptions.exact (opcja nieistniejąca) — poprawiono.
- Pierwsze dwa Chrome timeouty na dokładnej etykiecie wypełnionego textarea: dodano stabilną aria-label komentarza. Szkic był zachowany, jednak etykieta wymagała stabilizacji dla odczytu kontrolki.
- Kolejna próba przeszła prawie całą bramkę, lecz asercja legacy oczekiwała kolejności insert zamiast stabilnej kolejności API; poprawiono sprawdzenie stanu każdej sesji.
- Próba Wstecz/scroll porównywała pozycję przed automatycznym doscrollowaniem Playwright do pozycji zapisanej przy kliknięciu; runner mierzy teraz faktyczny click. Finalne scenariusze (także rozszerzony głos i1RM) przeszły.

## Decyzje i zmiany planu

D037 utrwala zachowanie klienta/szkiców/ACK/GET/DST i reużycie formattera snapshotów. Wymagania R01–R16, ID i zależności pozostają bez zmian. Integrator przydzielił C nowe moduły/runner w dozwolonym zakresie, bez zależności. C in_progress → review po przyjętej lokalnej bramce; A/B/C nie są done przed E. D gotowe technicznie dopiero po osobnym zleceniu. T11/T10-R1, usługi i budżet AI bez zmian.

## Pozostała praca i blokery

Brak znanego blokera technicznego lokalnej bramki C. Pozostały kalendarz D i niezależne E. Fizyczna systemowa klawiatura/telefon, Safari/iPhone, nowa ewaluacja AI i produkcja nie były przedmiotem tej sesji; T10-R1/T11 nadal otwarte. Navigation API sprawdzono w Chrome; inne przeglądarki mają beforeunload, ale nie deklarujemy odebranej obsługi ich sprzętowego Wstecz. Szkice i niepotwierdzona komenda są w otwartej karcie, bez obietnicy trwałego offline po jej zamknięciu.

## Następny krok

Po osobnym zleceniu tylko T13-D, zaczynając od rzeczywistego kontraktu datowania A i przeglądu C. D przejmuje globals.css; nie zmienia klienta komend bez zgłoszenia integratorowi. E powinien wykonać inny recenzent w osobnym ręcznie zleconym chacie po A–D. Nie uruchomiono kolejnego chatu ani agenta.

## Stan środowiska

Lokalny Supabase zastany uruchomiony pozostaje uruchomiony, z migracją22. Nie stosowano migracji/resetu bazy. Własne instancje Next3005 zatrzymane;3006 nie uruchamiano. Każda zakończona lub niezaliczona próba Chrome usuwała własne syntetyczne konto w finally, wraz z planem,1RM i treningami. Regresyjne runnery również sprzątnęły własne konta. Istniejące prywatne dane/konto właściciela pozostawiono. Zrzuty i pomocnicze pliki w `/private/tmp` to syntetyczny UI/kod/prompt, bez sekretów lub nagrań. Żadnej edycji .env, konfiguracji AI/usług ani działań produkcyjnych. Wszystkie zastane i nowe zmiany nadal niecommitowane/niepushowane.

## Prompt dla kolejnego agenta

Rekomendacja: GPT-6.1 Sol / medium — gotowe kontrakty A/C ograniczają koszt etapu prezentacji. Prompt do ręcznego użycia po osobnym zleceniu; nie uruchamia pracy.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy.
Po osobnym zleceniu użytkownika wykonaj tylko T13-D — kalendarz historii. Zacznij od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/WORKFLOW.md i docs/handoffs/2026-10-18-T13-C-prowadzenie-treningu.md. Przeczytaj rzeczywiste handoffy A/B, docs/prompts/T13-D.md, docs/T13_MOBILE_WORKOUT.md, UX, DATA_MODEL, DECISIONS i TESTING. Sprawdź pliki: A/B/C review po przyjętych lokalnych bramkach, D–E niewykonane, T08 gotowe lokalnie.
Zakres tylko R14–R16 i pełna bramka D: kalendarz poniedziałek–niedziela, zmiana miesiąca/Dzisiaj, zakończone sesje z nazwą/godziną, wiele sesji dziennie, aktywne osobno Wznów. Legacy bez zgadywania godzin, abandoned poza aktywnymi/ukończonymi. Otwieraj wspólny przegląd C pod /trening/<id>; zachowuj miesiąc/dzień po powrocie. Użyj projekcji czasu A zgodnej z profilem i filtrami postępu. Przejmij tylko pliki D i zwolnione globals.css; rozszerzenie repozytorium/API najpierw uzgodnij i zapisz jako integrator, bez samowolnej zmiany kontraktu. Nie zaczynaj E.
Sprawdź prawdziwe lokalne DB/API/UI przy 360/390/430 px, puste dni/miesiące, wiele sesji, północ/granice miesiąca i roku, rok przestępny/DST, legacy, zmianę strefy, korektę finish bez zmiany snapshotów, delete/prywatność, nawigację/fokus/cele 44. Adekwatne testy domeny/komponentów i regresje odczytów, npm test, build, potem typecheck. Brak znanego blokera technicznego; wymagane osobne zlecenie i dostępne środowisko, brak środowiska blokuje odbiór. Supabase lokalny pozostał z migracją 22; własny Next 3005 zatrzymany. 198 testów C i bramka lokalna przeszły; fizyczny telefon/Safari pozostają w T10-R1.
Jeden wykonawca i integrator, bez innych agentów, produkcji i płatnego AI. Zachowaj zastane niecommitowane zmiany, także .codex/hooks.json/.cursor/hooks.json. Zaktualizuj dokumentację i utwórz rzeczywisty handoff z identycznym promptem następnej sesji w handoffie oraz odpowiedzi. A–D pozostają review do niezależnego, osobno zleconego E.
Model: GPT-6.1 Sol / medium — gotowe datowanie A i widoki C ograniczają pracę do prezentacji, co pozwala oszczędzić koszt rozumowania.
```

# Checkpoint T15-B

2026-10-18. Wykonawca `/root/workout_ui`, integrator `/root`, gałąź `codex/t15-ui`, baza51ea3b4.

A przyjęte przez I; B in_progress. Własność: strony Start/Plany/plan/trening, plan-preview/exercise-summary/workout-* i ich testy, workouts/presentation*, nowe lokalne moduły i plan-carousel, training-preview.tsx (dodatkowy przydział I), własny runner oraz handoff. Bez globals, shared UI, API/repository/SQL lub edytora planu. Bez delegowania/commitów.

Preflight: README/STATUS/ROADMAP, AGENTS/WORKFLOW/DECISIONS/TESTING, T15 orchestrator/B/implementation (B→D), T13 spec/handoffy B/C, selected spec/generatory makiet, checkpoint A i rzeczywisty kod. Impeccable context uruchomiony raz; craft floor przeczytany, kierunek Noc/wybrane układy zachowany. Bez zmian driftu PRODUCT.

Kontrakt B→D: istniejący WorkoutEditor pod /trening/[id]; query historyMonth/historyDay walidowane do lokalnego /historia?month&day, bez dowolnego returnUrl. Komendy/szkice/ACK→GET/retry/409/snapshoty pozostają. Karuzela pobiera tylko bieżący dokument wybranego własnego planu; pozostałe slajdy z lekkiej listy nazw. Brak N+1 pełnych dokumentów wszystkich planów.

Testy B jeszcze niewykonane. Wspólne build/typy/DB/Chrome czekają na kolejkę I; zastany serwer3005 to build A. Następny krok: gotowe nowe moduły, podpięcie stron i zachowanie istniejących komend, czyste własne testy.

## Przyrost implementacji

Nowe moduły plan-workout/exercise-summary/plan-preview/workout-editor/plan-carousel; podpięto Start, bibliotekę planów, plan/trening i demo. Pełna karta planu otwiera osobne szczegóły z każdą serią/źródłem/uwagami; powrót przywraca kartę i scroll. WorkoutEditor zachowuje istniejące transport/state/szkice i etykiety, dodaje ilustracje, osobne kolumny oraz wyraźny cel/wynik C. Uzupełnienie kopiuje wyłącznie jednoznaczne snapshoty; zakres/AMRAP/brak nie daje zgadywanej wartości.

Czyste testy pierwszej próby:26PASS/1FAIL (mock requestAnimationFrame był synchroniczny i nie obejmował React commit). Fokus PlanPreview przeniesiony do efektu po renderze, ponowienie trwa. Nowe testy dat linku powrotu,0/null/historycznych metryk i braku zgadywania zakresów.

Kolejny krok: wyniki czystych testów, własny runner UI + niezmieniona regresja T13-C; zgłoszenie I gotowości zamrożenia i kolejki build/Chrome. Wspólne testy niewykonane; serwer3005 nadal A.

Finalne czyste testy B: `npx vitest run src/components/plan-carousel.test.tsx src/components/plan-preview.test.tsx src/components/workout-editor.test.tsx src/components/workout-start.test.tsx src/components/workout-state.test.ts src/components/workout-voice.test.tsx src/lib/workouts/presentation.test.ts` PASS28/28,7 plików. Pierwszy test karuzeli wymagał zawężenia regionu po nazwie (nazwane section też są regionami). Składnia `node --check scripts/test-t15b-browser.mjs` i `git diff --check` PASS.

B zgłoszone gotowe do kolejki I. Dodano identyczny bezpieczny powrót również po delete, z query bieżącego dokumentu; nie zmieniono payloadu/komendy. Kod zamrożony przed wspólnym buildem. Browser runner jeszcze niewykonany.

## Zgodność i bramka w kolejce

Po pierwszym buildzie I: brak błędów TS B; cudzy błąd E poprawia autor. Kolejny wspólny build PASS, typy PASS. I wykrył2 stare asercje training-preview.test; przydzielił ten plik B. B nie deklaruje samodzielnie przeprowadzonego builda/typów.

Po zwolnieniu freeze wdrożono tabelę Szczegółów A:Seria/Cel/Obciążenie/Przerwa, każda oryginalna seria osobno, opcjonalność/rampa/rozgrzewka i dodatkowe parametry/uwagi/źródła. Native details Wszystkie serie domyślnie otwarte w osobnym widoku.

Test demo dostosowano do lokalnego numeru serii; zachowano reset pól i wybór ćwiczenia. Dodatkowy test wykrywa/przywraca wcześniejsze next/previous przez granicę ćwiczeń. `npx vitest run src/components/training-preview.test.tsx src/components/plan-carousel.test.tsx src/components/plan-preview.test.tsx src/components/workout-editor.test.tsx src/components/workout-start.test.tsx src/components/workout-state.test.ts src/components/workout-voice.test.tsx src/lib/workouts/presentation.test.ts`: PASS31/31,8 plików. `node --check scripts/test-t15b-browser.mjs`, diff-check PASS.

B src zamrożone, gotowe do kolejnego builda uwzględniającego tabelę/demo. Chrome B czeka w kolejce za F/E; runner wciąż niewykonany. Serwer3005 obsługuje starszy build wspólny B/E/F sprzed ostatnich zmian B, PID/proces należy I.

## Review I — wyrównanie karuzeli

Po kolejnym wznowieniu bez dublowania runnerów I wskazał brak początkowego wyrównania slajdu po bezpośrednim query/reload oraz ryzyko blokady keyboard click po drag. Naprawiono: mount zawsze wyrównuje scroll do selectedPlanId; click.detail0 (Enter) nie podlega blokadzie drag. Dodatkowy test drugiego planu mierzy rzeczywiste scrollLeft320 przy braku nawigacji. Runner ma reload ostatniego planu oraz mouse drag→Enter. Czyste testy PASS32/32,8 plików; składnia/diff-check PASS. B ponownie freeze, kolejka po wspólnym buildzie ma przypaść B jako pierwszemu, następnie E. Handoff roboczy powstał ze statusem in_progress i jawnymi niewykonanymi bramkami; wymaga aktualizacji po Chrome.

## Pierwsza prawdziwa bramka B

I przydzielił świeży build i kolejkę. Pierwsza próba bez eskalacji odmówiła Docker socket przed testem; powtórzenie z eskalacją uruchomiło rzeczywisty lokalny Supabase/Auth/Chrome. Nowe powierzchnie PASS: Start/Plany/Podgląd360/390/430 bez overflow,4karty390 dół749,36<nav768; szczegóły/tabela/fokus, End/reload wyrównanie slajdu, wybór właściwej jednostki, CDP natywny swipe, mouse drag→Enter, history query i ochrona szkicu, jawne uzupełnianie celu. Obejrzano5zrzutów390(Start/Plany/Podgląd/Szczegóły/Zapis), zgodny kierunek Nocy.360 i430 pomierzone; zrzuty syntetyczne /private/tmp/t15b-*.

Pełny importowany runner T13-C **FAIL** na gęstości przeglądu aktywnego treningu: czwarta karta802,64>nav768, przy długich snapshotach i ramce superserii. Dalszych scenariuszy tego runnera nie wykonano. Konto nowego runnera i konto T13-C posprzątane w finally. Sesja zakończona. B zgłosiło I potrzebę jednolitej paczki QA: Kontynuuj do akcji pod kartami (44px odzyskane), dopracowanie powrotu i położenia głównego zapisu w C. Wymaga kolejnego builda I; nie deklarować bramki.

QA naprawa po jawnej zgodzie I: Kontynuuj przeniesione do akcji poniżej kart (handler bez zmian), historia/powrót ustawione w jednym rzędzie szczegółów poprzez lokalny wrapper, główne zapisz przed rozwijanymi dodatkowymi polami i metadanymi. Nie zmieniono transportu lub kontraktów. Czyste32/32 PASS8 plików; diff-check PASS. Dodano do runnera sprawdzenie widoczności głównego zapisu C przed nawigacją. B ponownie freeze, E ma kolejkę; kolejny build i potwierdzenie B po zakończeniu E.

## Finalna bramka i zwolnienie B

I wykonał nowy build poprawki QA PASS i przydzielił kolejkę. Finalne ponowienie sesja99765 **exit0**: nowe powierzchnie PASS i pełny niezmieniony runner T13-C PASS.4karty aktywnego390 dół750,640625<nav768;plan390 dół749,359375. Główny zapis C widoczny przed nav. Wszystkie scenariusze retry/ACK→GET/409/szkiców/superserii/null0/historycznej poprawki/voice mock/konfliktów/replace/delete/legacy/dat/snapshotów i ponownego logowania przeszły. Po jednej paczce QA obejrzano3potwierdzające zrzuty (wynik,aktywny przegląd,szczegóły T13-C). Bez pageerror, własne konta posprzątane, runner zamknięty.

I jawnie przyjął bramkę B. Status **review**, wszystkie22pliki B zwolnione I; pełna jawna lista i dowody w docs/handoffs/2026-10-18-T15-B-plany-trening.md. Kolejka zwolniona E/I. Bez własnego commitu i bez startu C przed commitem/przydziałem I. Następny krok:I stage/commit B, potem C; D korzysta z oddanego kontraktu po własnym przydziale. Fizyczny telefon/Safari/systemowa klawiatura niewykonane.

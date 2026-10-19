# Handoff — T15-B — Start, Plany i trening

- Data/autor:2026-10-18, `/root/workout_ui` (wykonawca B), integrator `/root`.
- Status: **review**, I przyjął lokalną bramkę B. Bez deklaracji zakończenia całego T15 przed G.
- Git: `codex/t15-ui`, baza51ea3b4; własny zakres bez commitów/push. Commit wykonuje I po zwolnieniu plików. Cudze zmiany A/E/F i dokumenty I zachowane.
- Poprzednicy: [T13-B](2026-10-18-T13-B-podglad-planu.md), [T13-C](2026-10-18-T13-C-prowadzenie-treningu.md), [checkpoint A](../checkpoints/T15/A.md). Źródła: [T15](../T15_UI_IMPLEMENTATION.md), [wybrane makiety](../design/t14-selected-spec.md), [checkpoint B](../checkpoints/T15/B.md).

## Cel i wykonana praca

Po przyjęciu A przez I przeniesiono wybrany kierunek Noc na rzeczywiste Start/Plany/Podgląd/Szczegóły/Zapis. Użyto Impeccable (skill/craft-floor i jednorazowy context), bez nowego wyboru wyglądu lub zmiany wymagań.

Start pokazuje plan, jego jednostki i wszystkie aktywne sesje z własnego odczytu. Plany mają natywną karuzelę z klawiaturą, strzałkami, wskaźnikami i przeciąganiem myszą. Zmiana planu pobiera wyłącznie jego aktualny dokument istniejącym autoryzowanym odczytem serwerowym przez lokalny query `plan`; pozostałe slajdy korzystają z lekkiej listy nazw. Brak N+1 pełnych dokumentów wszystkich planów lub odczytu archiwalnych wersji. Podczas zmiany nie pokazuje się jednostek poprzedniego planu. Bezpośredni query/reload wyrównuje rzeczywiste przewinięcie, a Enter po drag jest świadomą akcją.

Cała karta ćwiczenia planu otwiera osobne Szczegóły A, z powrotem do fokusu/scrolla karty. Szczegóły zawierają trzy metryki i tabelę każdej oryginalnej serii: Seria/Cel/Obciążenie/Przerwa, wraz z opcjonalnością, rampą/rozgrzewką, dodatkowymi parametrami, oryginalnymi nazwami, źródłami i uwagami. Wybór jednostki z linku jest walidowany do serwerowych ID. Pamięć planu/wersji, archiwum, kontekst i podgląd całości pozostają.

WorkoutEditor zachowuje transport/komendy/state/szkice, rundy superserii, zapis i historyczne poprawki. UI ma ilustracje, osobne kolumny oraz rozdzielony cel i wykonanie C. Jawne uzupełnienie kopiuje wyłącznie jednoznaczne historyczne cele, bez zgadywania dolnej granicy zakresu, AMRAP lub brakującego kg;0 pozostaje wartością. Kontynuuj znajduje się pod kartami. Historia/powrót są w jednym rzędzie szczegółów, a główne zapisz poprzedza rozwijane dodatkowe pola i metadane. Nie zmieniano API/repository/SQL, autoryzacji lub przeliczania snapshotów.

Demo ma spójny wygląd, dane syntetyczne i brak zapisu. Next/previous przechodzą między ćwiczeniami, zmiana serii/ćwiczenia czyści oba pola. Nie przedstawia pozornego zapisu jako rzeczywistego wyniku.

## Zmienione pliki i zwolnienie własności

Jawna lista22 plików B do stage przez I:

```text
src/app/page.tsx
src/app/plany/page.tsx
src/app/plany/[id]/page.tsx
src/app/trening/[id]/page.tsx
src/components/plan-carousel.tsx
src/components/plan-carousel.module.css
src/components/plan-carousel.test.tsx
src/components/plan-preview.tsx
src/components/plan-preview.module.css
src/components/plan-preview.test.tsx
src/components/exercise-summary.tsx
src/components/exercise-summary.module.css
src/components/workout-editor.tsx
src/components/workout-editor.module.css
src/components/training-preview.tsx
src/components/training-preview.test.tsx
src/components/plan-workout.module.css
src/lib/workouts/presentation.ts
src/lib/workouts/presentation.test.ts
scripts/test-t15b-browser.mjs
docs/checkpoints/T15/B.md
docs/handoffs/2026-10-18-T15-B-plany-trening.md
```

Wszystkie te pliki **zwolnione I po przyjętej bramce**. Bez edycji globals/shared UI/API/repository/SQL/edytora i cudzych zakresów E/F. TrainingPreview i jego testy I przydzielił dodatkowo. Brak nowych zależności lub migracji. Wspólne dokumenty aktualizuje I.

## Kontrakt B → D

Wspólny `WorkoutEditor({loaded})` nadal pod `/trening/[id]` z kluczem workout.id. D nie kopiuje przeglądu. Link z Historii może mieć `historyMonth=YYYY-MM&historyDay=YYYY-MM-DD`; strona sprawdza typy (odrzuca także duplikaty query), rzeczywistą datę i zgodność miesiąca. Wynik to wyłącznie `/historia?month=...&day=...` albo `/historia`. Nie ma dowolnego returnUrl. Przejścia serii zachowują pozostałe query; powrót chroni istniejący mechanizm szkiców. Po delete używany jest ten sam helper do lokalnego powrotu. D odtwarza `month/day`. Zmiany wspólnego przeglądu po oddaniu B wymagają I.

PlanPreview addytywnie przyjmuje `initialSessionId?`, walidowane do `sessionIds` z istniejącego odczytu serwerowego. To kontekst nawigacji, nie autoryzacja. Stare propsy pozostają zgodne. `planMetrics`, `snapshotMetrics`, `historyReturnHref`, `exactSnapshotValues` są czystą prezentacją, bez zapisu lub AI.

## Weryfikacja

Środowisko:macOS/Node26.4, rzeczywisty lokalny Supabase Auth/PostgREST i produkcyjny Next3005 z builda I, systemowy Chrome/Playwright runtime. Tylko własne konta/plany syntetyczne; AI/live wyłączone. Nie resetowano bazy.

Czyste testy B:

```sh
npx vitest run src/components/training-preview.test.tsx src/components/plan-carousel.test.tsx src/components/plan-preview.test.tsx src/components/workout-editor.test.tsx src/components/workout-start.test.tsx src/components/workout-state.test.ts src/components/workout-voice.test.tsx src/lib/workouts/presentation.test.ts
```

**PASS32/32,8 plików**, również po ostatniej poprawce QA. Testy obejmują pamięć/archiwum/wybór jednostki, całą kartę/fokus/powrót, daty i rok przestępny,0/null/snapshoty/brak zgadywania zakresów, karuzelę/initial scroll i brak starych jednostek, zachowane komendy/szkice/głos, reset i granice ćwiczeń demo. To komponenty/jsdom/mock transportu, osobno od integracji.

I wykonał finalny build po tabeli/demo/naprawie gęstości: **PASS**. Typy I wcześniej **PASS**; finalny build także sprawdził TypeScript. B nie uruchamiał własnych wspólnych buildów poza kolejką.

Finalny rzeczywisty runner (sesja99765,exit0):

```sh
T15B_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15b-browser.mjs
```

**PASS nowych powierzchni**:Start/Plany/Podgląd360/390/430 bez overflow, szczegóły/tabela/fokus i powrót, End/reload wyrównanie, wybór właściwej jednostki, CDP native swipe, rzeczywisty mouse drag→Enter, history query/ochrona szkicu i jawne uzupełnienie celu. Główny zapis C mieści się przed dolną nawigacją.

Runner następnie importuje niezmieniony `test-t13c-browser.mjs`: **pełny PASS**, rzeczywiste lokalne Auth/API/DB/Chrome. Utrata odpowiedzi po rzeczywistym commicie→identyczne retry; ACK→nieudany GET→ponowienie tylko GET;409 i zachowany szkic/nowa świadoma komenda; inny szkic komentarza; Wstecz/powrót/scroll/fokus i trzy decyzje; pola/zapis po obniżeniu viewportu; nierówne rundy superserii/opcjonalne/pominięte/dodatkowe;0powtórzeń/nullkg,czas/dystans; historyczna poprawka po rzeczywistym ponownym logowaniu. Konflikt/cancel/finish-replace/delete-replace, dodatkowe potwierdzenie delete, indywidualne legacy, korekta daty i niezmienne historyczne cele1RM. Głos wyłącznie mock transportu z jawną propozycją, spóźnioną odpowiedzią i awarią; bez dostawcy lub mikrofonu. Brak pageerror.

Dokładne pomiary finalne:

- Podgląd planu390×844:czwarta karta749,359375px, nav768;360:dół764,953125;430:dół733,765625.
- Aktywny trening390×844 z długimi snapshotami i superserią:czwarta karta750,640625px, nav768;360:dół750,640625;430:dół729,296875.
- Obejrzano pierwszą batched rundę5zrzutów390(Start/Plany/Podgląd/Szczegóły/Zapis), następnie po jednej paczce QA3potwierdzające zrzuty(Zapis,przegląd aktywnego,szczegóły T13-C). Syntetyczne obrazy `/private/tmp/t15b-*` i `/private/tmp/t13c-*`, poza repo.

`node --check scripts/test-t15b-browser.mjs`, `git diff --check`, lokalne linki handoffu: **PASS**.

### Wcześniejsze nieudane próby

Pierwszy mock requestAnimationFrame uruchamiał fokus przed React commit; przeniesiono fokus PlanPreview do efektu po renderze i ponowiono PASS. Test karuzeli wymagał nazwanego regionu, bo nazwane section także mają tę rolę. Dwie stare asercje globalnego numeru demo wykryte przez suite I dostosowano do aktualnego lokalnego numeru, zachowując reset i dodając przejście przez granicę ćwiczenia. Review I wykrył początkowe niewyrównanie slajdu po query/reload; naprawiono i dodano test scrollLeft.

Pierwsza próba integracji odmówiła Docker socket przed testem; powtórzenie z eskalacją ruszyło. Pierwszy rzeczywisty przebieg:nowe powierzchnie PASS, T13-C FAIL na czterech kartach aktywnego treningu (802,64>768), przed dalszymi scenariuszami. Po zgodzie I przeniesiono Kontynuuj pod karty i dopracowano położenie powrotu/zapisu. Kolejny build I i pełne ponowienie powyżej PASS. Oba przebiegi posprzątały własne konta w finally.

## Decyzje, ograniczenia i dalsza praca

Brak nowego wymagania produktu, migracji lub zależności. Kontrakt B→D doprecyzował I przed kodowaniem. B pozostaje review do integracji/G. Nie ponawiano w B całej suite produktu, pełnego T13-A ani importu/edytora C; te należą I/C/G. Fizyczny telefon, systemowa klawiatura, Safari i prawdziwy mikrofon pozostają otwartym odbiorem; CDP touch i mały viewport ich nie zastępują. Szkice mają dotychczasową trwałość otwartej karty.

## Stan środowiska i następny krok

Runner B zakończony, wszystkie własne konta i syntetyczne dane sprzątnięte; brak aktywnych runnerów B. Kolejka API/Chrome zwolniona I/E. Supabase i serwer3005 należą I, pozostają uruchomione; B ich nie zatrzymywał i nie uruchamiał migracji. Bez zmian .env, usług/AI, produkcji, push lub publikacji.

I przyjmuje/utrwala22pliki B lokalnym commitem (bramka już przyjęta). Następnie przydziela C temu wykonawcy; D może korzystać z oddanego kontraktu po jawnym przydziale. B nie uruchomił C/D ani dalszych agentów.

## Prompt dla kolejnego agenta

Model:GPT-6.1 Sol/high — korekta i edytor mają wiele stanów/szkiców; high chroni niezmienniki, odrębny zakres ogranicza koszt powtórzeń.

```text
Projekt:/Users/jakub.olech/GIT/apka-plan-treningowy.
Wykonaj T15-C po lokalnym commicie i przydziale I; B jest review z przyjętą lokalną bramką. Zacznij od AGENTS.md, README.md, STATUS/ROADMAP, docs/checkpoints/T15/STATE.md, docs/handoffs/2026-10-18-T15-B-plany-trening.md, T15_UI_IMPLEMENTATION, prompts/T15-C.md, selected-spec, właściwych specyfikacji importu/edytora, DECISIONS i TESTING. Sprawdź Git/procesy/aktywnych właścicieli, bez restartowania B lub cudzej pracy.
Zakres C:zatwierdzone Import C/Korekta A/Edytor A na istniejących funkcjach. Wyłącznie przydzielone przez I strony importu/edytora i komponenty import/review/compact-plan-editor/plan-editor/dialogs/set-fields/name-picker/plan-voice oraz własne CSS/testy/checkpoint/handoff. Bez API/parserów/modeli/DB/globals/shared UI i oddanych plików B. Zachowaj anulowanie, różne serie/rampy/superserie/opcjonalne, niejasności blokujące publikację, PDF/XLSX i wznowienie korekty, lokalny szkic≠wersja, idempotencję i ochronę historii. Cała karta edytora otwiera pełny formularz ćwiczenia; nie zamieniaj czasu/dystansu na powtórzenia.
Wykonaj implementację→czyste testy→właściwe lokalne HTTP/Chrome→naprawy→handoff; wspólne build/typy/DB/Chrome wyłącznie w kolejce I. Sprawdź360/390/430,klawiaturę/fokus,anulowanie/wznowienie,regresje edytora/importu z deterministycznym mockiem AI. Brak znanego blokera B; wymagany przydział właścicieli i wolna kolejka I. Bez delegowania/commitów/płatnego AI/push/publikacji/zdalnych migracji. Zachowaj cudze zmiany E/F i aktywne środowisko. Po pracy oddaj pliki/kontrakty/wyniki/ograniczenia I i ten sam gotowy prompt następnego rzeczywiście gotowego kroku w handoffie/odpowiedzi. Model:GPT-6.1 Sol/high — złożone stany korekty/edycji uzasadniają high, bez rutynowego Ultra.
```

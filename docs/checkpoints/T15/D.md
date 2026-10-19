# Checkpoint T15-D / T13-D

- Data2026-10-19, wykonawca `/root/foundation`, integrator `/root`.
- Własność: historia/page.tsx, nowe components/history/* i lib/workouts/calendar{,-data}.ts/testy, scripts/test-t15d-*.mjs, ten checkpoint i rzeczywisty handoff. Repository niezmienione.
- Stan: implementacja gotowa, freeze źródeł produkcyjnych zgłoszony I; oczekuje wspólnego builda i Chrome/DB.

## Wykonane

Kalendarz Noc pon–niedz, miesiące/Dzisiaj, liczby zakończonych sesji na datach, wybrany dzień i wiele sesji z godzinami, nieznana godzina legacy, osobno Wznów, abandoned wykluczone. Pełne etykiety dat/liczników, aria-pressed/aria-current, klawiatura strzałki/Home/End/PageUp/PageDown i fokus. Month/day walidowane wspólnym historyReturnHref B; linki do istniejącego przeglądu B mają historyMonth/historyDay. URL zachowuje wybór/reload i popstate.

Dane przez autoryzowany getWorkoutList/list_workouts i projectWorkoutTime. Osobny odczyt własnego profilu po auth.getUser + eq(id,user.id) daje prawdziwe Dzisiaj i strefę także bez sesji. Brak zmiany API/SQL/migracji/repository/komend i snapshotów. Demo jest puste, jawnie oznaczone i ma Dzisiaj w Europe/Warsaw.

## Sprawdzenia

`npx vitest run src/lib/workouts/calendar.test.ts src/components/history/history-calendar.test.tsx`: PASS6/2pliki. Pokrycie: błędne/duplikowane query i zgodność miesiąca, luty przestępny, pon/niedz, granice roku/miesiąca, daty DST/północ/strefy/legacy, completed/in_progress/abandoned, wiele sesji i history link, puste dni, Dzisiaj i miesiąc, strzałki przez miesiąc/fokus i popstate.

Build/typy/Chrome/API/DB jeszcze niewykonane w D — oczekuje kolejki I. Runner w przygotowaniu. Telefon/Safari/systemowa klawiatura niewykonane. Zastanego3005 nie zatrzymano.

## Kontrakty

HistoryCalendar otrzymuje completed/active:WorkoutSummary[], today YYYY-MM-DD i timeZone z serwera oraz initialMonth/initialDay string|string[] z query. Odczyt stale aktualny przez dynamiczne SSR; brak drugiego magazynu statystyk lub prywatnych wyników w localStorage. Stan URL to tylko daty, nigdy autoryzacja. I pozostaje właścicielem B/sharedUI/globals.

## Końcowy odbiór

- I wykonał wspólny build C/D oraz typecheck: PASS, po zamrożeniu źródeł D. D nie zmieniał potem kodu produkcyjnego.
- Chrome runner `scripts/test-t15d-browser.mjs`: PASS, sesja54374/exit0. Polecenie z `T15D_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15d-browser.mjs`.
- Rzeczywisty lokalny Supabase/Auth/RPC/API/Chrome; wyłącznie syntetyczne konta fixture E i własne dopisane sesje. Cleanup obejmuje błąd launch, każda próba sprzątnęła własne konta w finally. Nie zmieniono schematu lub istniejących użytkowników.
-360/390/430 bez overflow;31 przycisków min44.5625/48.84375/54.5625px ×46px. Etykiety/liczniki, dotyk tap/mysz, Home/End/PageDown/fokus, Dzisiaj, zmiana miesiąca/reload/powrót, puste dni/miesiąc,29.02,31.12→01.01, dwa02:30 podczas DST, legacy bez godziny, abandoned wykluczony. Profil strefy Europe/Warsaw→America/Los_Angeles zmienia datę północy, zachowuje legacy.
- Przegląd B i powrót zachowują day/month. Zapis poprawki historycznej nie zmienia snapshotów i liczby sesji. Finish przez UI B z korektą daty/godziny przenosi wpis do poprawionego dnia i usuwa Wznów; odczyt RPC potwierdza datę/niezmienny cel. Trwałe delete przez UI B wraca do tego samego dnia, usuwa Wznów i późniejszy read jest niedostępny. B nie widzi treningów A; cudzy API404/410; anon przekierowany na logowanie. Brak pageerror.
- Obejrzano `/private/tmp/t15d-calendar-390.png`: układ Historia A/Noc czytelny, dwie sesje osobno, liczby przy dniach, zaznaczony dzień i dzisiaj. Raport `/private/tmp/t15d-report.json` poza repo.
- Pierwszy runner zakończył się FAIL: następny klawisz PageDown wysłany przed requestAnimationFrame przenoszącym fokus po End. Poprawiono wyłącznie runner o jawne oczekiwanie fokusu po Home/End/PageDown; następny pełny przebieg PASS. Nie zmieniano kodu źródłowego pod asercję.
- `node --check scripts/test-t15d-browser.mjs`, `git diff --check`: PASS. Nie uruchamiano szerokich regresji C/AI w D; istniejący B/T13-C PASS od poprzednika pozostaje dowodem ich zakresu.
- Status review po przekazaniu I; kolejkę DB/Chrome/build i źródła D zwolniono. Nie zatrzymano/rebuildowano serwera3005. C kontynuuje odrębny zakres. Telefon/Safari/systemowa klawiatura i fizyczne safe-area niewykonane.
- I po obejrzeniu390px przyjął bramkę D/T13-D; dokumenty końcowe gotowe: docs/handoffs/2026-10-19-T15-D-historia.md. Wszystkie pliki D zwolnione, brak dalszej pracy autora. Następne C/G obsługuje I w już zleconym programie.

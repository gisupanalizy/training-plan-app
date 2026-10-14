# Handoff — T05 — wykonanie i historia treningu

- Data i autor: 2026-10-11, Codex.
- Zadanie / status po sesji: T05, `done`; T06 nie rozpoczęto.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i pusha.
- Powiązany wcześniejszy handoff: [T04 — edytor planu i rzeczywiste 1RM](2026-10-11-T04-edytor-planu-1rm.md).

## Cel i wykonana praca

Przy skonfigurowanym Supabase dzień bieżącej wersji planu pozwala ręcznie rozpocząć trening z datą i wznowić aktywną sesję. Ekran wykonania zapisuje lub poprawia wynik serii, pomija serię, dodaje serię i ćwiczenie, zapisuje komentarz i kończy trening. Zakończoną serię można poprawić z nową rewizją. Historia pokazuje treningi po ponownym logowaniu. Ekran treningu pokazuje poprzedni ukończony wynik tego samego identyfikatora/ wariantu ćwiczenia; pominięcia nie są wynikami. Tryb bez Supabase pozostał demonstracyjny. Ręczne wpisy nie wywołują AI.

Migracja `apply_workout_command` zapisuje każdą komendę w jednej transakcji z potwierdzeniem i wpisem rewizji. Właściciel pochodzi z `auth.uid()`; funkcja sprawdza własność planu, treningu i dzieci. Blokada identyfikatora operacji oraz hash całego żądania rozpoznają retry po timeout; zmieniony payload pod tym samym ID i stara rewizja dają konflikt. Bezpośredni DML do wykonania nadal jest zamknięty. Start kopiuje bieżącą opublikowaną wersję, nazwy/uwagi/zestawy zaleceń oraz rekord i wartość rzeczywistego 1RM obowiązujące w dacie treningu, surowy cel, zaokrąglony cel i krok. Brak 1RM daje `null` kg. Późniejsza edycja planu lub dopisanie maksimum nie zmienia rozpoczętego treningu.

Podczas HTTP E2E wykryto błąd T04: wzorzec UUID w odczycie/edycji planu odrzucał poprawne identyfikatory, przez co szczegóły planu zwracały 404. Poprawiono walidację w T04 i T05; dodano regresję domenową. Zmiana była konieczna do rozpoczęcia T05 z prawdziwego planu.

## Zmienione pliki

- [Migracja T05](../../supabase/migrations/20261011190000_t05_workout_commands.sql) — komenda, snapshoty, rewizja, idempotencja i unikalna aktywna sesja dnia.
- [API treningu](../../src/app/api/workouts/route.ts), [odczyt treningu](../../src/lib/workouts/repository.ts) — autoryzowany zapis/odczyt historii i poprzedniego wyniku.
- [Formularz startu](../../src/components/workout-start.tsx), [formularz wykonania](../../src/components/workout-editor.tsx), [strona treningu](../../src/app/trening/[id]/page.tsx), [historia](../../src/app/historia/page.tsx), [strona planu](../../src/app/plany/[id]/page.tsx), [start](../../src/app/page.tsx), [style](../../src/app/globals.css) — ręczne przepływy i powrót do sesji.
- [Odczyt planu](../../src/lib/plans/repository.ts), [walidator planu](../../src/lib/domain/plan-editor.ts), [API planu](../../src/app/api/plans/route.ts) — poprawka błędnego UUID; [test regresji](../../src/lib/domain/plan-editor.test.ts).
- [Test komponentu](../../src/components/workout-editor.test.tsx), [test Auth/API](../../scripts/test-t05-api.mjs), [test HTTP E2E](../../scripts/test-t05-http.mjs) i [uruchamiacze](../../scripts/run-local-t05.mjs), [lokalnego serwera](../../scripts/run-local-app.mjs), [fixtury](../../scripts/setup-t05-ui.mjs), [sprzątania](../../scripts/cleanup-t05-ui.mjs); [skrypt npm](../../package.json).
- [README](../../README.md), [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [UX](../UX.md), [ARCHITECTURE](../ARCHITECTURE.md), [DATA_MODEL](../DATA_MODEL.md), [TESTING](../TESTING.md), [DECISIONS](../DECISIONS.md), [CHANGELOG](../CHANGELOG.md) — stan, kontrakt i wyniki.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, npm 11.17.0, Supabase CLI 2.120.0, lokalny Docker z Supabase Auth/PostgREST/PostgreSQL. `npx supabase start` i `npx supabase migration up --local`: migracja T05 zastosowana. `npm run test:t05:local`: PASS, dwa syntetyczne konta A/B i anon; start/retry, konflikt dwóch kart, kopie 1RM i brak maksimum, zapis/poprawka/pominięcie, dodatki, komentarz, zamknięcie, izolacja i ponowne logowanie. `npm run test:t04:local`: PASS po poprawce UUID. `npm test`: 19 przeszło, 2 integracyjne T03 pominięto bez ich zmiennych. `npm run typecheck`: PASS. `npm run build`: PASS, także z lokalną konfiguracją Supabase.

HTTP E2E na lokalnym produkcyjnym Next: `node scripts/run-local-t05.mjs scripts/setup-t05-ui.mjs`, `node scripts/run-local-app.mjs build`, w osobnym terminalu `node scripts/run-local-app.mjs start`, `node scripts/run-local-t05.mjs scripts/test-t05-http.mjs`, potem `node scripts/run-local-t05.mjs scripts/cleanup-t05-ui.mjs`: PASS. Sprawdzono plan → start → odczyt i wznowienie po nowej sesji → zapis → 409 starej rewizji → koniec → poprzedni wynik w kolejnej sesji → historię po ponownym logowaniu; anon przekierowany do logowania. Fixtura miała wyłącznie dane syntetyczne, tymczasowy plik poza repozytorium z uprawnieniem 0600; konto i plik usunięto.

Nie wykonano pełnego klikanego E2E w przeglądarce: narzędzie pokazało stronę planu, ale kliknięcia nie dały obserwowalnej nawigacji; strony i API sprawdzono przez HTTP, a retry formularza przez test komponentu. Nie wykonano testów na fizycznym iPhone/Safari ani Android/Chrome, hostowanym Supabase/Vercel ani pełnej regresji T03 Storage/Mailpit. Nie deklarujemy ich jako zaliczonych.

## Decyzje i zmiany planu

[D012](../DECISIONS.md) opisuje transakcyjne komendy i snapshoty. T05 zmieniono z `todo` przez `in_progress` na `done`; ID i zależności pozostałych zadań bez zmian. Poprawka UUID T04 jest opisana w CHANGELOG. T06 nie rozpoczęto.

## Pozostała praca i blokery

Brak znanego krytycznego błędu T05 po lokalnych testach. Przed betą T10 musi wykonać klikany test UI i testy urządzeń, a T11 odtworzyć środowiska hostowane i smoke test. T06 może rozpocząć się wyłącznie po osobnym zleceniu; prawdziwe wywołania OpenAI wymagają skonfigurowanego `OPENAI_API_KEY` i uzgodnionego budżetu testów. Bez nich można przygotować adapter, mocki i trwały przepływ, ale nie deklarować jakości/ kosztu prawdziwego importu.

## Następny krok

Po osobnym zleceniu rozpocząć T06 od przeczytania plików w promptcie poniżej i sprawdzenia aktualnej dokumentacji dostawcy. Nie przechodzić do T07 automatycznie.

## Stan środowiska

Lokalny Supabase zatrzymano przez `npx supabase stop --backup`; serwer Next na porcie 3005 zatrzymano, syntetyczne konto T05 i tymczasową fixturę usunięto. Zastany wcześniej serwer deweloperski na porcie 3002 nie był modyfikowany. Brak Git i hostowanego wdrożenia. Wymagane nazwy zmiennych dla lokalnego uruchomienia są w `.env.example`; wartości nie są w repozytorium.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: gpt-6-sol, high — T06 łączy niezawodny import, prywatność i aktualne API dostawcy; ten poziom daje staranną ocenę przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Po osobnym zleceniu wykonaj wyłącznie T06 — próby AI i niezawodny import. Nie przechodź do T07 i nie uruchamiaj subagentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-11-T05-wykonanie-historia.md oraz docs/PRODUCT.md, docs/AI_AND_VOICE.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md i docs/TESTING.md. T01–T05 działają lokalnie z Supabase Auth/API; hostowane środowiska pozostają do T11. W T06 przygotuj zestaw źródeł testowych, adapter OpenAI i walidowany szkic importu PDF/obrazu/tekstu, limity wejścia i kosztu, prywatne uploady, trwałe stany/próby, retry, timeout, retencję i sprzątanie. AI ma proponować szkic; aplikacja waliduje, autoryzuje i zapisuje dopiero po korekcie/zatwierdzeniu. Sprawdź aktualną dokumentację dostawcy przed integracją. Prawdziwe wywołania wymagają skonfigurowanego OPENAI_API_KEY i uzgodnionego budżetu; bez nich wykonaj niezależną pracę z mockami i jawnie oznacz nieweryfikowane kryteria. Przeprowadź adekwatne testy domenowe, lokalne A/B/anon, retry, błędnego pliku i sprzątania, kontrolę typów i build; nie przypisuj mockom wyniku prawdziwego AI. Nie zapisuj sekretów ani prywatnych źródeł w repozytorium. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według potrzeby i utwórz handoff z dokładnymi wynikami oraz identycznym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — złożony import i niezawodność wymagają staranności przy niższym koszcie niż model frontier.
```

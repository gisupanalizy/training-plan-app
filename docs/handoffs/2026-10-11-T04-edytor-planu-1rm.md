# Handoff — T04 — edytor planu i rzeczywiste 1RM

- Data i autor: 2026-10-11, Codex.
- Zadanie / status po sesji: T04, `done`. T05 nie rozpoczęto.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i pusha.
- Powiązany wcześniejszy handoff: [T03 — konta i prywatność](2026-10-11-T03-konta-prywatnosc.md).

## Cel i wykonana praca

Przy skonfigurowanym Supabase strona „Plany” pokazuje prywatne plany zamiast syntetycznego A/B. Edytor pozwala tworzyć i zmieniać nazwę planu, tygodnie i dni, kolejność, ćwiczenia własne lub istniejące, indywidualne serie, rampę, grupę superserii, obciążenie, powtórzenia, czas/dystans, przerwę, tempo, RPE/RIR i uwagi. Zapis publikuje całość w jednej transakcji PostgreSQL; edycja opublikowanego planu tworzy kolejną wersję. Można przeglądać wcześniejsze wersje. Identyfikator operacji zabezpiecza retry, a oczekiwana wersja wykrywa konflikt dwóch kart. Funkcja SQL wyznacza właściciela z `auth.uid()` i weryfikuje powiązane ćwiczenia oraz plan; nie ufa identyfikatorowi właściciela z przeglądarki.

Profil zapisuje rzeczywiste 1RM z datą obowiązywania, notatką i własnym ćwiczeniem. Rekordy są dopisywane, nie nadpisywane; API rozpoznaje ponowienie po identyfikatorze operacji. Można zmienić krok zaokrąglenia. Podgląd planu wylicza kg z najnowszego rzeczywistego 1RM obowiązującego dziś w strefie profilu; brak maksimum pozostawia wyłącznie procent. Remis zaokrąglany jest w dół. Nie tworzono estymowanych 1RM. Wersje planów i rekordy 1RM pozostają historyczne. Nie ma jeszcze trwałych sesji treningowych; ich zapis i kopie celów to T05. Tryb bez konfiguracji Supabase zachowuje syntetyczny prototyp.

## Zmienione pliki

- [Migracja funkcji planu](../../supabase/migrations/20261011180000_t04_plan_editor.sql) i [migracja retry 1RM](../../supabase/migrations/20261011181000_t04_one_rep_max_retry.sql) — transakcja, kontrola właściciela, konflikt wersji i ponowienie.
- [Walidacja edytora](../../src/lib/domain/plan-editor.ts), [odczyt prywatnych danych](../../src/lib/plans/repository.ts), [API planu](../../src/app/api/plans/route.ts), [API 1RM](../../src/app/api/one-rep-max/route.ts), [API kroku](../../src/app/api/profile/rounding/route.ts) — kontrakty, odczyt i zapisy z sesją użytkownika.
- [Komponent edytora](../../src/components/plan-editor.tsx), [komponent 1RM](../../src/components/one-rep-max-editor.tsx), [strony planów](../../src/app/plany/page.tsx), [szczegóły wersji](../../src/app/plany/[id]/page.tsx), [strona edytora](../../src/app/plany/edytor/page.tsx), [profil](../../src/app/profil/page.tsx), [start](../../src/app/page.tsx), [powłoka](../../src/components/app-shell.tsx) i [style](../../src/app/globals.css) — polski interfejs i oznaczenie trybu.
- [Test domeny](../../src/lib/domain/plan-editor.test.ts), [test komponentu](../../src/components/plan-editor.test.tsx), [test lokalnego API](../../scripts/test-t04-api.mjs), [uruchomienie testu](../../scripts/run-local-t04.mjs) i [package.json](../../package.json) — weryfikacja T04.
- [README](../../README.md), [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [ARCHITECTURE](../ARCHITECTURE.md), [DATA_MODEL](../DATA_MODEL.md), [DECISIONS](../DECISIONS.md), [TESTING](../TESTING.md), [UX](../UX.md), [T03_AUTH](../T03_AUTH.md) i [CHANGELOG](../CHANGELOG.md) — zgodność dokumentacji ze stanem.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, npm 11.17.0, Docker z lokalnym Supabase CLI 2.120.0. Uruchomiono Auth, PostgREST i PostgreSQL, zastosowano obie migracje T04 przez `npx supabase migration up --local`. `npm run test:t04:local` przeszedł: syntetyczne konta A/B, prywatny plan A/B, rampa i różne serie, superseria, retry bez drugiego planu, konflikt starej wersji, odmowa cudzej edycji i odczytu, odmowa anon, niezmienność starej wersji, rekordy 1RM, blokada cudzej relacji, duplikatu operacji i zmiany historycznego maksimum. Konta testowe usunięto. Test jednostkowy wybiera 1RM według daty, sprawdza brak maksimum, 120 kg × 75% = 90 kg, 123 kg × 75% = 92,5 kg oraz remis w dół. Test komponentu dodaje serię i wysyła nową wersję.

Końcowe `npm test`: 5 plików i 17 testów przeszło; 2 testy integracyjne T03 pominięte bez jego zmiennych i nieuruchomione w T04. Końcowe `npm run typecheck` i `npm run build` przeszły. Build przeszedł zarówno bez konfiguracji (demo), jak i z syntetyczną konfiguracją lokalną bez serwera; w drugim przypadku strony planu/profilu zostały oznaczone jako dynamiczne. Pierwszy równoległy typecheck/build trafił na przejściowy brak wygenerowanego `.next/types/routes.js`; powtórzony po buildzie przeszedł. Pierwszy start pełnego Supabase zwlekał na pobieraniu obrazów; uruchomiono tylko usługi potrzebne T04. Pierwszy test API przed zastosowaniem nowej migracji zgłosił brak funkcji; po `migration up --local` przeszedł. Nie wykonano testu hostowanego środowiska, pełnego ponowienia T03 Storage/Mailpit ani ręcznego testu UI na fizycznym urządzeniu. Nie testowano trwałego zapisu treningu, ponieważ należy do T05.

## Decyzje i zmiany planu

[D011](../DECISIONS.md) opisuje atomową publikację i kontrolę właściciela. T04 przeszło `todo → in_progress → done`; zakres i zależności T05–T12 bez zmian. [CHANGELOG](../CHANGELOG.md) opisuje powód. Bezpośrednie własnościowe granty DML tabel planu z T02 pozostały; publikacja przez interfejs używa funkcji. Przed betą trzeba ocenić, czy ograniczyć alternatywną ścieżkę zapisu własnych planów.

## Pozostała praca i blokery

Brak blokera lokalnego T05. Nie ma hostowanego Supabase/Vercel; T11 musi sprawdzić migracje i konfigurację w preview/production. Ekran wykonania i historia treningów pozostają demonstracyjne; T05 ma dodać trwałe sesje, kopie celów i transakcyjne komendy z rewizją oraz idempotencją. Bezpośrednie zapisy tabel wykonania przez rolę `authenticated` są nadal zamknięte. Ręczny test UI na urządzeniu i pełna regresja T03 Storage/Mailpit po T04 nie zostały wykonane.

## Następny krok

Po osobnym zleceniu rozpocząć wyłącznie T05 od ROADMAP, DATA_MODEL, ARCHITECTURE, TESTING i tego handoffu. Najpierw zaprojektować transakcyjne komendy startu i zapisu treningu z kontrolą właściciela, `expected_revision`, `client_operation_id` i kopią celu planu oraz rzeczywistego 1RM z daty sesji. Nie zaczynać T06 w ramach T05.

## Stan środowiska

Lokalny Supabase zatrzymano przez `npx supabase stop` z zachowaniem backupu. Skrypt testowy usunął konta syntetyczne. Nie pozostawiono procesów uruchomionych w T04. Nie zapisano sekretów ani prywatnych danych w repozytorium. Katalog nie ma Git.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: `gpt-6-sol`, `high` — transakcyjne komendy, niezmienne kopie celów i izolacja kont wymagają staranności, a model sol kosztuje mniej niż frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Po osobnym zleceniu zrealizuj wyłącznie T05 — wykonanie i historia treningu. Nie przechodź do T06 i nie uruchamiaj subagentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-11-T04-edytor-planu-1rm.md oraz docs/PRODUCT.md, docs/UX.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md i docs/TESTING.md. T01–T04 są ukończone lokalnie: prywatne plany i datowane 1RM działają przez Supabase Auth/API, ale ekran wykonania jest demonstracyjny, nie ma trwałego zapisu treningu ani hostowanych usług. Dodaj ręczny start, wznowienie i zakończenie treningu, zapis i poprawkę serii, pominięcie, komentarze, dodatkową serię i ćwiczenie, poprzedni porównywalny wynik oraz historię po ponownym logowaniu. Komendy muszą atomowo sprawdzać właściciela, expected_revision i client_operation_id, rozpoznawać ponowienie oraz konflikt dwóch kart. Przy starcie zapisz niezmienne kopie zaleceń, wersji planu, rekordu i wartości rzeczywistego 1RM obowiązującego w dacie treningu, surowego i zaokrąglonego celu; brak 1RM pozostawia kg null. Nie zmieniaj historii po edycji planu lub maksimum i nie wywołuj AI dla ręcznego wpisu. Kryteria odbioru: trening ręczny trwa po ponownym logowaniu, zapis jest odporny na timeout/retry, stara rewizja konfliktuje, użytkownik B i anon nie mają dostępu, a historyczne cele nie zmieniają się. Wykonaj adekwatne testy domenowe, lokalne Auth/API A/B/anon, E2E ścieżki treningu, kontrolę typów i build; niewykonane testy urządzeń lub hostingu opisz jawnie. Lokalny Supabase CLI/Docker jest dostępny; hostowane środowiska pozostają do T11. Nie zapisuj sekretów ani prywatnych danych w repozytorium. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według potrzeby i utwórz handoff z dokładnymi wynikami oraz identycznym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — transakcje, idempotencja i snapshoty wymagają staranności przy niższym koszcie niż model frontier.
```

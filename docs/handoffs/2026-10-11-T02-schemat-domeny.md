# Handoff — T02 — schemat domeny i baza

- Data i autor: 2026-10-11, Codex.
- Zadanie / status po sesji: T02, `done`.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i pusha.
- Powiązany wcześniejszy handoff: [T01 — lokalny prototyp](2026-10-11-T01-prototyp.md).

## Cel i wykonana praca

Dodano migrację PostgreSQL z 13 prywatnymi tabelami: profile, ćwiczenia, rzeczywiste 1RM, plany i wersje, jednostki i serie planu, sesje i serie wykonania, potwierdzenia operacji oraz rewizje. Każda tabela ma RLS i granty w tej samej migracji. Złożone klucze obce zachowują właściciela oraz właściwą wersję, jednostkę, ćwiczenie i serię. Osobne serie umożliwiają rampę; `superset_group` reprezentuje superserię; ćwiczenie własne jest rekordem użytkownika. `extra` działa dla ćwiczenia i serii wykonania. Cel procentowy można zachować przy braku 1RM z `null` dla kilogramów.

Triggery chronią opublikowane wersje planu, kopie celów rozpoczętych serii, nazwy i powiązania wykonania. Baza przechowuje numer rewizji treningu, powiązane rekordy zmian i unikalny identyfikator operacji z hashem payloadu. Klient `authenticated` może czytać własne wyniki, lecz nie ma bezpośredniego `insert/update` tabel wykonania. Transakcyjny zapis z kontrolą rewizji i retry jest pracą T05; nie deklarujemy trwałego zapisu w aplikacji. T02 nie wdrożył Auth, API, Storage ani integracji UI.

## Zmienione pliki

- [Migracja T02](../../supabase/migrations/20261011160000_t02_domain.sql) — tabele, ograniczenia, klucze, triggery, RLS i granty.
- [Typy i walidatory](../../src/lib/domain/model.ts), [testy domenowe](../../src/lib/domain/model.test.ts), [konfiguracja Vitest](../../vitest.config.ts) — kontrakty planu, wersji, serii, maksimum, kopii celów i komend.
- [Skrypt testu bazy](../../scripts/test-db.sh), [testowy schemat Auth](../../scripts/t02_test_auth_shim.sql), [asercje SQL](../../scripts/t02_database_test.sql) — odtwarzanie pustej bazy i sprawdzanie relacji/RLS.
- [README](../../README.md), [DATA_MODEL](../DATA_MODEL.md), [TESTING](../TESTING.md), [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [CHANGELOG](../CHANGELOG.md), [DECISIONS](../DECISIONS.md) — rzeczywisty stan, weryfikacja i D009.
- Ten handoff.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, npm 11.17.0, Docker 29.6.1, lokalny obraz `postgres:16`. `npm test`: 2 pliki, 9/9 testów przeszło (7 domenowych, 2 istniejące komponentowe). `npm run typecheck`: przeszło. `npm run build`: przeszło, statyczne trasy prototypu wygenerowane. `bash scripts/test-db.sh`: przeszło; z pustego PostgreSQL odtworzono migrację po minimalnym testowym schemacie `auth`, a asercje sprawdziły własność relacji, RLS użytkownika A/B i anon, niezmienność kopii/opublikowanego planu, serię dodatkową, brak 1RM, zakaz bezpośredniego zapisu wyniku i unikalność operacji.

Podczas pracy pierwsza migracja na testowej bazie wykazała brak złożonego ograniczenia unikalnego; poprawiono je i świeża migracja przeszła. Jedna późniejsza próba `bash scripts/test-db.sh` nie przeszła, bo kontener nie zdążył wystartować w 10 sekund. Wydłużono oczekiwanie do 60 sekund; ponowienie pełnego testu przeszło. Początkowy `npm run typecheck` zgłosił niepoprawne rzutowanie; poprawiono i końcowa kontrola typów przeszła. Wyniki pozytywne dotyczą ostatnich wersji plików.

Nie wykonano testów na prawdziwym Supabase Auth, PostgREST/API ani Storage — brak konfiguracji usługi, a ich integracja należy do T03. Minimalny schemat Auth w teście odtwarza tylko `auth.users` i `auth.uid()`. Nie uruchamiano urządzeń fizycznych ani testów E2E treningu, bo T02 nie łączy UI z bazą. Nie testowano zewnętrznych usług ani AI.

## Decyzje i zmiany planu

[D009](../DECISIONS.md) przyjmuje relacyjny rdzeń, RLS z tabelami i zamknięcie bezpośredniego zapisu wyników do T05. [D007](../DECISIONS.md) pozostaje historyczną propozycją, [D004](../DECISIONS.md) nie oznacza wdrożonego Supabase. T02 przeszedł `todo → in_progress → done`. ID i zależności T03–T12 nie zmieniły się. Powód i wpływ w [CHANGELOG](../CHANGELOG.md). Aktualną dokumentację [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) i [migracji lokalnych](https://supabase.com/docs/guides/local-development/cli-workflows) Supabase sprawdzono 2026-10-11.

## Pozostała praca i blokery

Brak blokera odbioru T02. Test lokalny nie dowodzi działania polityk w prawdziwym Auth/API; T03 wymaga dwóch kont testowych i prywatnego Storage. Dostęp do instancji lub lokalnego stacku Supabase oraz konfiguracja usług mogą być potrzebne do pełnego odbioru T03. T05 musi zaimplementować atomowy zapis komendy: sprawdzenie właściciela, `expected_revision`, hash payloadu, powtórzenie operacji oraz aktualizację wyników, rewizji i potwierdzenia w jednej transakcji. Zwykła archiwizacja planu nie usuwa historii; osobna procedura usuwania konta/danych nadal wymaga projektu przed betą.

## Następny krok

Po osobnym zleceniu rozpocząć T03 od odczytania ROADMAP, ARCHITECTURE, DATA_MODEL, DECISIONS i TESTING. Pierwszym krokiem jest lokalny Auth i test rzeczywistego dostępu A/B/anon przez API; następnie polityki prywatnego Storage. Nie rozpoczynać T03 automatycznie w tej sesji.

## Stan środowiska

Wszystkie tymczasowe kontenery PostgreSQL użyte do testów zatrzymano i usunięto. Nie ma działającego serwera aplikacji ani bazy. Brak sekretów, pliku `.env` i połączenia Supabase. Nazwy przyszłych zmiennych są wyłącznie w `.env.example`. Katalog bez Git.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: `gpt-6-sol`, `high` — testy własności Auth, RLS i Storage wymagają staranności; model jest oszczędniejszy od frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Po moim osobnym zleceniu zrealizuj wyłącznie T03 — konta testerów i prywatność. Nie przechodź do T04 i nie uruchamiaj subagentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-11-T02-schemat-domeny.md oraz docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md i docs/TESTING.md. T01 i T02 są ukończone; migracja odtwarza lokalny PostgreSQL, ale aplikacja nie korzysta jeszcze z bazy ani logowania. Dodaj logowanie i wylogowanie zaproszonych testerów, połączenie z Auth, polityki prywatnego Storage oraz izolację środowisk; zweryfikuj istniejące RLS na prawdziwym Auth/API. Kryteria odbioru: konta A i B mają rozdzielone plany, wyniki i pliki; anonimowy użytkownik nie ma dostępu; wygasła sesja jest obsłużona. Wykonaj rzeczywiste testy A/B/anon przez API i Storage, w tym próby z cudzymi identyfikatorami rodziców, oraz kontrolę typów, testy i build. Brak skonfigurowanego Supabase może zablokować pełny test integracyjny; wtedy opisz konkretny bloker i wykonaj niezależną część pracy bez deklarowania T03 jako ukończonego. Nie zapisuj sekretów w repozytorium. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według potrzeby i utwórz handoff z dokładnymi wynikami oraz identycznym, gotowym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — bezpieczeństwo Auth/RLS/Storage wymaga staranności przy niższym koszcie niż model frontier.
```

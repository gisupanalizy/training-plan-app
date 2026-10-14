# Handoff — T06 — lokalny import z mockiem AI

- Data i autor: 2026-10-12, Codex.
- Zadanie / status po sesji: T06 `blocked` przez brak klucza i uzgodnionego budżetu prawdziwych prób; T07 nie rozpoczęto.
- Branch / commit / stan zmian: katalog bez `.git`, więc brak brancha i commita; pliki pozostają lokalnie.
- Powiązany wcześniejszy handoff: [T05](2026-10-11-T05-wykonanie-historia.md).

## Cel i wykonana praca

Zbudowano 12 syntetycznych źródeł i generator. Lokalny przepływ przyjmuje PDF, PNG, JPEG i tekst, ogranicza bajty oraz strony PDF, sprawdza prywatny upload, tworzy trwałe zadanie i numerowane próby z dzierżawą. Adapter Responses API tworzy szkic o ścisłym schemacie, po czym aplikacja waliduje domenę. Odrzucenie, błąd, timeout, anulowanie i spóźniony wynik nie publikują planu. Korekta jest obowiązkiem klienta T07; endpoint T06 zapisuje dopiero jawnie przesłany, walidowany dokument przez atomową funkcję właściciela z idempotencją. Siedmiodniowa retencja ma blokadę wygasłych zadań i funkcję sprzątania. Szczegółowy kontrakt: [T06_IMPORT](../T06_IMPORT.md).

Nie uruchomiono prawdziwego OpenAI, bo nie ma `OPENAI_API_KEY` i uzgodnionego budżetu. Raport jakości/czasów/kosztów nie istnieje. Nie należy interpretować poprawnych wyników mocka jako pomiaru modelu.

## Zmienione pliki

- Migracje [T06](../../supabase/migrations/20261011210000_t06_imports.sql), [budżet](../../supabase/migrations/20261011211000_t06_budget.sql), [zatwierdzenie](../../supabase/migrations/20261011212000_t06_approval.sql), [Storage](../../supabase/migrations/20261011213000_t06_storage_limits.sql), [hash](../../supabase/migrations/20261011214000_t06_approval_hash.sql), [globalny budżet](../../supabase/migrations/20261012100000_t06_global_budget_usage.sql), [wygaśnięcie](../../supabase/migrations/20261012101000_t06_expiry_gate.sql), [powiązanie uploadu z zadaniem](../../supabase/migrations/20261012102000_t06_storage_job_policy.sql): schemat, RLS/granty, limity, atomowe operacje i retencja.
- [Domena](../../src/lib/imports/domain.ts), [adapter](../../src/lib/imports/openai.ts), [serwer](../../src/lib/imports/server.ts), [sprzątanie](../../src/lib/imports/cleanup.ts), [HTTP](../../src/lib/imports/http.ts) i [trasy API](../../src/app/api/imports/route.ts): implementacja. [Proxy](../../src/lib/supabase/proxy.ts) przepuszcza cron do własnej autoryzacji.
- [Fixture'y](../../fixtures/t06/cases.json), [generator](../../scripts/generate-t06-fixtures.py), [test lokalny](../../scripts/run-local-t06.mjs), [test HTTP](../../scripts/run-local-t06-http.mjs), testy domenowe, adaptera, integracyjne i [harness prawdziwych prób](../../src/lib/imports/live-evaluation.test.ts).
- [Konfiguracja](../../.env.example), [skrypty](../../package.json), lockfile, [cron](../../vercel.json), [mapowanie Vitest](../../vitest.config.ts) oraz README, ARCHITECTURE, DATA_MODEL, AI_AND_VOICE, TESTING, ROADMAP, STATUS, CHANGELOG i DECISIONS.

## Weryfikacja

macOS, Node.js 26.4.0, npm 11.17.0, lokalny Supabase CLI 2.120.0 (Auth/PostgREST/Storage/PostgreSQL). `npx supabase migration up --local`: wszystkie migracje T06 zastosowane; końcowa `20261012102000_t06_storage_job_policy.sql` zakończona sukcesem. `npm run test:t06:local`: 1 plik, 2 testy przeszły, prawdziwy lokalny Auth/API/Storage A/B/anon z **mockiem AI**; obejmuje 12 źródeł, retry, równoległe roszczenie, wygasłą dzierżawę, późny wynik, własność, limit budżetu, zatwierdzenie i wygaśnięcie. `npm run test:t06:http`: produkcyjny build Next i HTTP E2E przeszły; tekst, upload PNG, błędny PDF, 503 bramki AI, zatwierdzenie/retry i sprzątanie cron. `npm test`: 38 testów przeszło, 5 pominiętych bez ich środowiska (T03 integracyjne, T06 lokalne/live). `npm run typecheck`: sukces. `npm run build`: sukces w ramach `test:t06:http`. PDF `pdfinfo`: pięć fixture'ów po jednej stronie; próbki tekstowego i skanowanego PDF obejrzano wizualnie. Prawdziwych prób OpenAI: **0**.

Aktualną dokumentację dostawcy sprawdzono 2026-10-12: [OpenAI File inputs](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [kontrola danych](https://developers.openai.com/api/docs/guides/your-data), [Vercel Cron](https://vercel.com/docs/cron-jobs). Kontrakt na żywym koncie i jego limity nadal nieweryfikowane.

## Decyzje i zmiany planu

[D013](../DECISIONS.md) opisuje serwerowy import, trwałe próby i zatwierdzenie. T06 przeszedł z `todo` przez `in_progress` do `blocked`: implementacja lokalna jest gotowa, ale bez prawdziwych prób nie spełnia kryterium raportu z ROADMAP. ID i zależności bez zmian, T07 pozostaje `todo`. Powód opisuje [CHANGELOG](../CHANGELOG.md).

## Pozostała praca i blokery

Po uzgodnieniu budżetu i bezpiecznym skonfigurowaniu `OPENAI_API_KEY` wykonać 12 prób, ocenić wynik pole po polu, opuszczenia/dopowiedzenia, p50/p95, użycie i rzeczywisty koszt na koncie. Sprawdzić dostęp do modelu, format odpowiedzi, skuteczność `detail: low` na skanach, czy odpowiedź mieści się w 2500 tokenach i 30 sekundach oraz w limicie hostingu. W razie potrzeby poprawić prompt/model/limity lub sposób wykonywania pracy, po czym powtórzyć pomiary. Globalna rezerwacja 0,05 USD na próbę to przybliżenie, nie twardy limit rachunku; przed uruchomieniem dla testerów potrzebny limit projektu dostawcy. Pełne dekodowanie obrazu i test urządzeń/hostingu także pozostają nieweryfikowane. Nie zapisywać sekretów ani prywatnych źródeł w repo.

## Następny krok

Kontynuować T06 od przygotowania klucza poza repo, uzgodnionego budżetu oraz uruchomienia [harnessu](../../src/lib/imports/live-evaluation.test.ts). Ocenić raport i domknąć kryteria T06, nie przechodząc do T07 w tej sesji.

## Stan środowiska

Lokalny Supabase uruchomiony podczas testów; ostatni test HTTP kończy własny proces Next na porcie 3006. Brak procesu OpenAI. Wymagane nazwy zmiennych dla prawdziwych prób: `OPENAI_API_KEY`, `OPENAI_IMPORT_ENABLED`, `OPENAI_IMPORT_BUDGET_USD`, `RUN_T06_LIVE`; bez wartości w plikach. Katalog bez Git i bez commita. Fixture'y syntetyczne są w repo, raport z prawdziwych prób nie powstał.

## Prompt dla kolejnego agenta

Rekomendowany model: gpt-6-sol, rozumowanie high — ocena złożonego importu i kosztów wymaga staranności, a jest tańsza od modelu frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj wyłącznie T06 — prawdziwe próby AI i domknięcie niezawodnego importu; nie przechodź do T07 i nie uruchamiaj subagentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-12-T06-import-mock.md, docs/T06_IMPORT.md, docs/PRODUCT.md, docs/AI_AND_VOICE.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md i docs/TESTING.md. Lokalna implementacja i testy z mockiem są gotowe. Prawdziwe wywołania wykonaj dopiero po skonfigurowaniu OPENAI_API_KEY poza repo i uzgodnieniu budżetu; bez tego nie przypisuj mockom jakości modelu, wykonaj możliwe kontrole niezależne i pozostaw T06 jako blocked. Sprawdź aktualną dokumentację OpenAI przed próbami. Uruchom 12 syntetycznych przypadków przez evaluate:t06, zbierz raport dokładności pól, opuszczeń i dopowiedzeń, p50/p95, tokenów oraz kosztu na koncie. Oceń skany, 30 s timeout, limit 2500 tokenów i ograniczenia hostingu; popraw tylko T06 i powtórz adekwatne próby. Sprawdź lokalne A/B/anon, retry, błędny plik, sprzątanie, typy i build. Sekretów ani prywatnych źródeł nie zapisuj w repo. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według wyniku i utwórz handoff z dokładnymi wynikami oraz identycznym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — wymaga staranności przy niższym koszcie niż model frontier.
```

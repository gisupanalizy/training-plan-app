# Handoff — T12-K — wspólna tożsamość ćwiczeń

- Data i autor: 2026-10-20, Grok.
- Zadanie / status po sesji: T12-K **done lokalnie**. Hosting, telefon i Safari pozostają osobno.
- Branch / commit / stan zmian: `codex/t12-k`, baza dokumentacji `e58a207`. Ta sesja nie tworzyła commita implementacji. Zmiany kodu i dokumentacji są w drzewie roboczym, bez pusha.
- Powiązany wcześniejszy handoff: [T12-K-P](2026-10-20-T12-K-P-plan-tozsamosci.md).

## Cel i wykonana praca

Wdrożono kontrakt T12-K w kodzie: prywatna tożsamość ruchu, dokładny słownik i prywatny alias, propozycja OpenAI Decisions tylko do potwierdzenia, wspólne grupowanie postępu i wybór datowanego 1RM po tożsamości, ikona z klucza albo ręcznie wybranego pliku oraz limity PDF 10 MB/20 stron, XLSX 5 MB, PNG/JPEG 10 MB i tekst 100 KB. Powyżej 6 MB upload idzie podpisanym TUS. PDF powyżej dwóch stron jest dzielony na trwałe części. Historyczne snapshoty nie są przepisywane.

## Zmienione pliki

- [20261020170000_t12k_exercise_identity.sql](../../supabase/migrations/20261020170000_t12k_exercise_identity.sql) — tabele tożsamości i aliasów, backfill jednoznacznych nazw, `save_manual_plan`, podmiana odczytu 1RM i dodawania ćwiczenia w treningu, limity Storage oraz części importu.
- `src/lib/exercises/identity.ts`, `decisions.ts`, `src/app/api/exercises/suggest/route.ts` — dokładne dopasowanie, alias i Decisions za bramką `AI_GATEWAY_API_KEY`, `AI_GATEWAY_DECISIONS_ENABLED` i dodatniego `AI_GATEWAY_DECISIONS_BUDGET_USD`.
- `src/lib/imports/limits.ts`, `domain.ts`, `parts.ts`, `server.ts`, `resumable-upload.ts`, `src/components/import-workspace.tsx` — nowe granice, części PDF i TUS.
- `src/lib/progress/analytics.ts`, `repository.ts`, `src/lib/plans/repository.ts`, `src/lib/domain/model.ts` — grupowanie i 1RM po tożsamości.
- `src/lib/ui/exercise-assets.ts`, `src/components/ui/exercise-illustration.tsx`, edytor, korekta importu i głos — nazwa PL, oryginał, potwierdzenie propozycji, własna ilustracja albo sylwetka.
- Dokumentacja: STATUS, ROADMAP, PRODUCT, DECISIONS, CHANGELOG, TESTING, README i specyfikacja T12-K.

## Weryfikacja

- `npm test`: 284 passed / 9 skipped. PASS.
- `npm run build`: PASS, razem z typecheck. Osobny `npm run typecheck` wcześniej też PASS.
- Jednostkowo: PL/EN, parafraza do potwierdzenia, `none`, odmienny sprzęt/chwyt/asysta/pauza, custom, błąd modelu na mocku, ikona klucza i pliku, odrzucenie `generic.png`, części PDF, przerwany TUS na mocku `fetch`, plik o 1 B ponad limit i PDF o 21 stronach.
- Migracja nałożona na lokalny Supabase w Dockerze (`supabase_db_apka-plan-treningowy`). Pierwszy przebieg przerwał się na backfillu, bo `UPDATE` nie mógł użyć aliasu celu w `JOIN`. Po poprawce dokończono plik. Backfill: 29 ćwiczeń, 26 tożsamości, 20 bez przypisania. `apply_workout_command` zawiera `same_identity_exercise_ids` i `resolve_owned_exercise`. Konflikt wersji planu to `PT409`, nie `40001`.
- Wycofana próba SQL: powtórzony klucz kanoniczny zwraca ten sam wiersz, alias się zapisuje, sprzeczny sprzęt i obca tożsamość są odrzucane, własna nazwa jest używana ponownie. Liczba tożsamości po wycofaniu została 26.
- `npm run test:t04:local`, `test:t05:local`, `test:t06:local`, `test:t06:http` ze szkicem mock i wyłączonym AI, `test:t08:local`, `test:t09:local` — PASS.
- `scripts/test-t12k-api.mjs` na lokalnym Auth: PASS. A/B/anon, retry, obcy klucz i ID, sprzeczny sprzęt, własna nazwa, snapshot 75 kg bez zmiany i nowa sesja 105 kg.
- `scripts/test-t12k-browser.mjs` na `next dev` `http://localhost:3024`: PASS. Zalogowany edytor, oryginał, ikona, dialog dyktowania, import 20 stron i jeden wpis w postępie. Serwer 3024 zatrzymano. Nie wołano płatnego Decisions. Nie było deploymentu. Telefon i Safari niewykonane.
- Po buildzie `.next` jest produkcyjny. Wcześniejszy `next dev` może wymagać restartu.

## Decyzje i zmiany planu

D049 zostaje wyborem produktu. Implementacja jest w review, nie przyjętym wdrożeniem. Katalog na tym branchu ma 49 kluczy. Commit `5689d37` z podpięciem PNG muscle-up jest tylko na `codex/tempo` i nie wchodzi do `codex/t12-k`. Allowlista ilustracji to lokalne SVG z `public/exercise-assets/`. 876 nazw EN i 787 PNG nie są mapowane automatycznie.

## Pozostała praca i blokery

Odbiór właściciela zalogowanego importu, edytora, dyktowanego fragmentu i postępu. Przed live Decisions ustawić serwerowy klucz, flagę i dodatni limit. Inna baza niż lokalny Docker z tej sesji nadal potrzebuje tej migracji; ponowne puszczenie całego pliku na już zaktualizowanej bazie nie przejdzie. Test hostowany i wdrożenie wymagają osobnej zgody. Klucza nie wklejać do repo ani czatu.

## Następny krok

Lokalny odbiór jest zamknięty. Następny krok istnieje tylko po osobnej zgodzie na migrację i test hostowany. Nie wdrażać produkcji z tej sesji.

## Stan środowiska

Krótko uruchomiono `next start` na porcie 3022 i zatrzymano go po obejrzeniu logowania oraz przekierowań. Lokalny Supabase w Dockerze działa i ma tę migrację. Płatnego API nie wywołano. Nazwy sekretów: `AI_GATEWAY_API_KEY`, `AI_GATEWAY_DECISIONS_ENABLED`, `AI_GATEWAY_DECISIONS_BUDGET_USD`. Wartości nie są w tym pliku.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: **gpt-6.1-sol, high**. Odbiór dotyczy migracji własności i historii; wysoki poziom ogranicza ryzyko złego odczytu SQL, a sol jest oszczędniejszy od modelu frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. T12-K jest done lokalnie na branchu codex/t12-k. Najpierw przeczytaj docs/handoffs/2026-10-20-T12-K-tozsamosc.md i docs/STATUS.md. Nie ma kolejnego zadania implementacji. Hosting, telefon i Safari wymagają osobnej zgody. Na innej bazie niż lokalny Docker z tej sesji zastosuj raz migracje 20261020170000_t12k_exercise_identity.sql i 20261020183000_t12k_one_rep_max_identity.sql. Nie wołaj płatnego Decisions bez AI_GATEWAY_API_KEY, flagi AI_GATEWAY_DECISIONS_ENABLED i dodatniego AI_GATEWAY_DECISIONS_BUDGET_USD. Nie rób pusha ani deploymentu bez osobnego zlecenia.
```

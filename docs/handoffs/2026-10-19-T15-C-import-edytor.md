# Handoff — T15-C — Import, korekta i edytor

- Data/autor: 2026-10-19, wykonawca /root/workout_ui, integrator /root.
- Status: implementacja i końcowe sprawdzenia C zakończone PASS; zgłoszono I do odbioru i integracji. Wszystkie 17 plików C oraz kolejka API/Chrome zwolnione. Formalny status globalny i commit prowadzi I.
- Git:codex/t15-ui; start99433b8, E później odebrane e544425. Bez własnych commitów/push. Cudze A/B/D/E/F i dokumenty I zachowane.
- Poprzednicy:[A](2026-10-18-T15-A-fundament.md),[B](2026-10-18-T15-B-plany-trening.md),[T04-R1](2026-10-13-T04-R1-czytelny-edytor.md),[T07-R1](2026-10-13-T07-R1-przeglad-importu.md). Bieżące fakty:[checkpoint C](../checkpoints/T15/C.md).

## Wykonana praca

Zatwierdzony Import C ma cztery kafle ze środkowanymi ikonami, osobne źródła plik/aparat/tekst i link do istniejącej propozycji głosowej w edytorze. Ręczna ścieżka ma ikonę edycji. Brak nowego dostawcy lub automatycznego wywołania AI. Dotychczasowe upload/retry/kamera/stany importu zachowane.

Korekta A zachowuje trzy rzeczywiście odrębne zadania/potwierdzenia, zapis etapu, niejasności, źródło na żądanie i publikację. Pierwszy nagłówek to Nazwy ćwiczeń i kolejność. Interfejs ma lokalne style Nocy/ilustracje/ikony; kontrakty API/parserów niezmienione.

Cała karta ręcznego edytora otwiera lokalną kopię pełnego ćwiczenia. Formularz zawiera tożsamość/przypisanie/uwagi oraz bloki i indywidualne serie ze wszystkimi istniejącymi parametrami PlanSetFields. Nie ma zagnieżdżonych form/dialog. Wspólne patchSeries/resizeSeriesBlock zachowują identyfikatory, źródła i uwagi. Outer Zastosuj zmiany waliduje cały fragment; Anuluj odrzuca łącznie nazwę i parametry. Niepoprawny count blokuje apply bez wyjątku eventu. Dodanie/usunięcie/indywidualna opcjonalność synchronizują setCountMin/Max. Whole optional przywraca wcześniejsze indywidualne flagi po ID; nowe ID korzystają z aktualnego minimum. Czas/dystans pozostają odrębne od powtórzeń.

## Pliki C

```text
src/app/plany/import/page.tsx
src/app/plany/edytor/page.tsx
src/components/compact-plan-editor.tsx
src/components/compact-plan-editor.test.tsx
src/components/plan-edit-dialogs.tsx
src/components/plan-editor.tsx
src/components/plan-editor.test.tsx
src/components/import-review.tsx
src/components/import-review.test.tsx
src/components/import-workspace.tsx
src/components/review-dialog.tsx
src/components/plan-authoring.module.css
scripts/test-t15c-editor.mjs
scripts/test-t15c-import.mjs
scripts/test-t15c-http.mjs
docs/checkpoints/T15/C.md
docs/handoffs/2026-10-19-T15-C-import-edytor.md
```

Własność wszystkich powyższych plików zwolniona do integracji przez I; brak aktywnych runnerów C. Nie zmieniano globals/shared UI/API/parserów/domain/SQL ani starych runnerów/wrapperów.

## Sprawdzenia

`npx vitest run src/components/compact-plan-editor.test.tsx src/components/plan-editor.test.tsx src/components/plan-voice.test.tsx src/components/import-review.test.tsx src/components/import-workspace.test.tsx`:PASS42/42,5plików. Zachowano istniejące asercje payloadów/ID/history/retry/szkiców/głosu. Nowe przypadki:atomowe metadata+jedna seria/apply/cancel, wymagane/opcjonalne dodanie z zakresem, blank count blokujący apply, rozszerzenie whole-optional2–3→2–4 i przywrócenie[false,false,true,true].

Pierwsza próba19PASS/18FAIL starych selektorów/tekstów po zmianie struktury. Przystosowano je do całej karty, bez usuwania domenowych asercji. Kolejny test optional porównał undefined z false; oczekiwanie znormalizowano, a ID/notes/source nadal sprawdzane dokładnie.

I wykonał końcowy build C/D i typecheck PASS, następnie ponowny build/typecheck po jedynej paczce QA PASS (serwer 3005, sesja I 90715). Pełna suite wcześniejszego checkpointu C/D wykonana przez I: 249 PASS / 9 skip, 37 plików passed / 5 skipped; nie deklarujemy późniejszej pełnej suite. `node --check` wszystkich trzech runnerów i `git diff --check` PASS.

Rzeczywiste lokalne Auth/API/Storage/Chrome: pierwszy editor/T04-R1 PASS (sesja 5378), pełny HTTP T06/T07 PASS (91186), import PDF2/XLSX2/trzy kroki/cancel/blokady/retry PASS (76635). Źródła i wynik adaptera syntetyczne; zapisy/publikacja/retry rzeczywiste. Test HTTP zachowuje pełne istniejące asercje własności A/B/anon, uploadu, źródeł, walidacji, zapisów korekty, idempotentnego zatwierdzania i sprzątania cron. AI wyłączone; oczekiwana niedostępność adaptera jest sprawdzana. Konta i obiekty Storage posprzątane.

Po pierwszej inspekcji sześciu zrzutów wykonano jedną uzgodnioną paczkę QA: narzędzia i kontekst treningu pod karty, zwarty skrót istniejącego seriesBlocks bez utraty indywidualnych uwag/źródeł; formularz zaczyna się od nazwy i serii, dodatkowa tożsamość jawnie rozwijana po parametrach. Dodano pomiar czterech kart przy 390×844 i poprawiono pozycję zrzutów korekty. Czyste 42/42 PASS po zmianie.

Końcowe potwierdzenie na nowym buildzie: **editor PASS (41675), import PASS (10716)**. Editor zachowuje wszystkie scenariusze T04-R1: całe karty, atomowe apply/cancel i fokus, katalog/przeniesienie treningu, superserie, indywidualne serie, 360/390/430 i desktop, guard niezapisanych zmian, utrata odpowiedzi po rzeczywistym zapisie i identyczne retry dające jedną wersję, niezmienione historyczne wiersze/snapshoty i poprawny częściowy fragment. Cztery pełne karty przy 390×844 mieszczą się nad dolną nawigacją przy scroll 0 (asercja DOM czwartej karty względem nav PASS). Import ponownie potwierdza układ ikon/manual/voice, oba syntetyczne źródła, oddzielne etapy i reload, blokadę braków, cancel i realny idempotentny approve. HTTP nie powtarzano po samym układzie, zgodnie z decyzją I; jego PASS pozostaje aktualny, kontrakty niezmienione.

Obejrzano finalne zrzuty edytora (initial 390, desktop, pełny formularz) oraz korekty PDF/XLSX 390. Układ zgodny z zatwierdzonym kierunkiem; brak kolejnej paczki zmian. Artefakty lokalne, poza repo: `/private/tmp/t15c-editor-initial-{360,390,430}.png`, `/private/tmp/t15c-editor-cards-desktop.png`, `/private/tmp/t15c-editor-edit-mobile.png`, `/private/tmp/t15c-import-{360,390,430}.png`, `/private/tmp/t15c-review-{pdf,xlsx}-{360,390,430}.png`. Log jednostkowy: `/private/tmp/t15c-unit.log`.

## Ograniczenia i następny krok

Brak znanych blokujących defektów C po tych sprawdzeniach. Rzeczywiste rozpoznawanie AI nie było uruchamiane; adapter propozycji w scenariuszach importu jest syntetyczny, natomiast źródła i zapis są rzeczywiste. Fizyczny telefon/Safari/systemowa klawiatura pozostają otwartym odbiorem. Nie użyto prywatnych fixture'ów T07-R1.

Brak procesów C, migracji, płatnego AI, zmiany .env, usług/produkcji/push/publikacji. Bez delegowania i własnych commitów. CRON_SECRET wczytany wyłącznie do środowiska z pliku tymczasowego zarządzanego przez I, bez wypisania wartości. I integruje 17 plików, aktualizuje dokumenty globalne i przekazuje komplet A–F niezależnemu G. Nie uruchamiać ponownie dawnych wrapperów budujących .next i porty 3006/3008.

## Prompt kontynuacji

Model: GPT-6.1 Sol/high — niezależna kontrola złożonych stanów uzasadnia high; brak rutynowego Ultra ogranicza koszt.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj niezależny odbiór T15-G po integracji C przez I i potwierdzeniu kompletu A–F. Zacznij od AGENTS, README, STATUS, ROADMAP, WORKFLOW, TESTING, docs/prompts/T15-G.md, T15_UI_IMPLEMENTATION, selected-spec, docs/checkpoints/T15/STATE.md oraz rzeczywistych handoffów A–F, w tym docs/handoffs/2026-10-19-T15-C-import-edytor.md. Sprawdź Git, procesy i kolejkę z I; nie dubluj runnerów. Zakres: pełny lokalny przepływ, zgodność zatwierdzonych makiet, 360/390/430 i desktop, klawiatura/fokus, realne API/DB/Auth A/B/anon, regresje T13-E oraz prywatność/idempotencja/historyczne snapshoty. AI tylko mock/off; prywatne materiały poza repo. Build/typy/DB/Chrome wyłącznie po przydziale I. Nie poprawiaj po cichu źródeł A–F: zgłaszaj defekty właścicielom i weryfikuj naprawy. Fizyczny telefon/Safari/systemowa klawiatura pozostają osobnym odbiorem. Bez commitów, delegowania, płatnego AI, push, publikacji i zdalnych migracji. Kryterium: faktyczne dowody pełnego odbioru lub jawna lista defektów/blokerów, handoff i identyczny prompt kolejnego kroku. Model: GPT-6.1 Sol/high — niezależne sprawdzenie złożonych stanów wymaga high, bez kosztu rutynowego Ultra.
```

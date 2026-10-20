# Handoff — T16-E — Import, korekta i edytor

- Data i autor: 2026-10-19, Cursor agent, sesja T16-E.
- Zadanie / status po sesji: T16-E review. T16-F–I todo. T16-K todo i niegotowe, bo nie ma propozycji kontraktu.
- Branch / commit / stan zmian: `codex/tempo`, HEAD `70d66e627ecb8fef73fb8d89d430ad8f41796ca5`. Dokumentacja T16-A oraz kod T16-B–E są niezacommitowane. Bez commit, push i PR.
- Powiązany wcześniejszy handoff: [T16-D](2026-10-19-T16-D-trening.md).

## Cel i wykonana praca

Wdrożono hierarchię Tempo na imporcie, korekcie i ręcznym edytorze. Szkic, identyfikatory, pytania, źródła PDF/XLSX, trzy etapy, retry i idempotentne zatwierdzenie zostały. Nie dodano liczb z makiety i nie powstał `docs/proposals/T16-CONTRACT-*.md`.

Na `/plany/import` plik i zdjęcie są dwiema dużymi akcjami. Wklejenie tekstu, dyktowanie i ręczny edytor są wtórnymi wierszami. Pusta historia i lista wcześniejszych importów są osobne. Statusy `upload_pending`, `uploaded`, `processing`, `needs_review`, `failed`, `cancelled` i `committed` mają osobne etykiety. Tekst statusu mówi, że plan nie powstaje przed zatwierdzeniem. Błąd odczytu ma ponowienie. Zatwierdzony import z identyfikatorem planu prowadzi do `/plany/[id]`. Brak tego identyfikatora jest opisany jako brak, bez zgadywania adresu.

Korekta zostawia kroki Nazwy → Serie i superserie → Podsumowanie. Na ekranie widać jedno bieżące pytanie. Nierozwiązane pytanie nadal wyłącza zatwierdzenie. Źródło przy szerokości 1280 stoi obok planu. Przy 390 jest pełnym dialogiem. Edycja nazwy, bloku i pojedynczej serii zachowuje dotychczasowe formularze, ID, uwagi i opcjonalność.

Edytor otwiera ćwiczenie całą kartą. Nazwa i serie są przed katalogiem, wariantem i przypisaniem. Blok i pojedyncza seria, kolejność treningu, usunięcie oraz błąd walidacji zostają osobnymi stanami. Anulowanie odrzuca niezastosowane pola. Pasek zapisu jest w toku strony. Publikacja nadal wysyła całą wersję, a ponowienie używa tej samej operacji. Szkic nie ma autosave. Głos w edytorze zostaje propozycją do świadomego dodania. Ręczny formularz działa bez AI.

## Zmienione pliki

- [src/app/plany/import/page.tsx](../../src/app/plany/import/page.tsx) i [src/app/plany/edytor/page.tsx](../../src/app/plany/edytor/page.tsx) — nagłówki stron. Trasy bez zmian.
- [src/components/import-workspace.tsx](../../src/components/import-workspace.tsx) i [import-workspace.test.tsx](../../src/components/import-workspace.test.tsx) — dwa główne źródła, wtórne sposoby, statusy i pusta historia.
- [src/components/import-review.tsx](../../src/components/import-review.tsx) — etykiety kroków, jedno pytanie, przyciski Tempo.
- [src/components/compact-plan-editor.tsx](../../src/components/compact-plan-editor.tsx), [plan-edit-dialogs.tsx](../../src/components/plan-edit-dialogs.tsx), [review-exercise-edit.tsx](../../src/components/review-exercise-edit.tsx), [review-series-edit.tsx](../../src/components/review-series-edit.tsx), [review-group-edit.tsx](../../src/components/review-group-edit.tsx) i [review-question-editor.tsx](../../src/components/review-question-editor.tsx) — te same akcje, warianty primary, secondary, ghost i danger.
- [src/components/voice-input.tsx](../../src/components/voice-input.tsx) — tylko prezentacja nagrywania i przycisków. Kotwica i żądania bez zmian.
- [src/components/plan-authoring.module.css](../../src/components/plan-authoring.module.css) — hierarchia źródeł, kroków, stopki i paska zapisu.
- [scripts/test-t15c-import.mjs](../../scripts/test-t15c-import.mjs) — dwa główne źródła i źródło obok planu na desktopie.
- [docs/ROADMAP.md](../ROADMAP.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md), [docs/TESTING.md](../TESTING.md) i ten handoff.

Bez migracji, bez `src/lib/imports`, bez `src/lib/domain`, bez API i bez parserów. `plan-set-fields.tsx` i `exercise-name-picker.tsx` nie wymagały zmiany logiki. Pola w dialogu już miały trwałe etykiety i wysokość co najmniej 44 px.

## Weryfikacja

Środowisko: macOS, gałąź `codex/tempo`, lokalny Supabase API odpowiadał, Chrome przez Playwright `channel: chrome`. Telefon i Safari niewykonane. Płatnego AI nie było.

1. `npx vitest run` importu, korekty, edytora i głosu: 48 passed.
2. `npm test`: 265 passed, 9 skipped.
3. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false T15C_HTTP_BASE=http://localhost:3002 T15C_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t15c-import.mjs`: PASS. Prawdziwe lokalne Auth i API, szkic syntetyczny bez modelu. 360/390/430 i desktop 1280. To był już działający `next dev`.
4. Ten sam zestaw dla `scripts/test-t15c-editor.mjs`: PASS. Cztery karty, anulowanie, katalog, superseria, dialog 390 px, fokus, zapis z utratą odpowiedzi i retry, stare serie i snapshoty.
5. `T15C_HTTP_BASE=http://localhost:3016 CRON_SECRET=t16e-local-only DO_NOT_TRACK=1 node scripts/run-local-t05.mjs scripts/test-t15c-http.mjs`: PASS. Serwer to `next start -p 3016` z `OPENAI_IMPORT_ENABLED=false` i pustym kluczem. `process` zwrócił 503. A/B/anon, źródło, korekta, upload, formaty, pytanie i retry zatwierdzenia. Lokalny `.env` ma włączony import AI i nie zawiera `CRON_SECRET`, dlatego HTTP nie szedł na port 3002 i sekret crona był tylko lokalną wartością tego procesu.
6. `npm run build` PASS. Potem `npm run typecheck` PASS.
7. `git diff --check` bez zgłoszeń.

Obejrzane zrzuty `/private/tmp/t15c-import-390.png`, `t15c-import-360.png`, `t15c-review-pdf-390.png`, `t15c-editor-initial-390.png`, `t15c-editor-cards-desktop.png` i `t15c-editor-edit-mobile.png`. Plik i zdjęcie są większe od trzech wtórnych wierszy. Kroki korekty czytają się jako Nazwy, Serie i superserie oraz Podsumowanie. Dialog ćwiczenia jest pełnoekranowy i zaczyna się od nazwy oraz serii.

## Decyzje i zmiany planu

Nowej decyzji nie dodano. D046 i D047 bez zmian. T16-E przeszedł z todo do review. T16-F–I zostają todo. T16-K zostaje niegotowe.

## Pozostała praca i blokery

T16-F może startować po osobnym zleceniu. Brak blokera kontraktu. `scripts/test-t15f-browser.mjs` nadal wymaga `data-theme="night"` i należy do T16-H. Telefon, Safari, T10-R1, T11 i publikacja pozostają osobne. Po `npm run build` katalog `.next` jest produkcyjny; działający wcześniej `next dev` może wymagać ponownego uruchomienia. Serwer na porcie 3016 został zatrzymany.

## Następny krok

T16-F, historia. Najpierw przeczytać AGENTS, README, STATUS, ROADMAP, ten handoff, specyfikację T16, brief, katalog i część D z T13. Nie przechodzić do T16-G w tej samej sesji. Chrome na tym dev serwerze otwierać jako `localhost`, nie `127.0.0.1`.

## Stan środowiska

Lokalny Supabase API był dostępny. Komunikat CLI podczas testów wymieniał zatrzymane usługi imgproxy i pooler; ta sesja ich nie zatrzymywała. Testy usunęły swoje syntetyczne konta. `npm run dev` użytkownika był na porcie 3002 i posłużył do Chrome. Produkcyjny `next start` na 3016 służył tylko HTTP i został zatrzymany. Sekrety nie były zapisywane w dokumentacji. Zmiany są lokalne i niewysłane.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, medium. Historia jest prezentacją na zamrożonym kontrakcie czasu, więc medium wystarcza i kosztuje mniej niż wysoki poziom użyty przy edytorze.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj tylko T16-F. Przeczytaj AGENTS.md, README.md, T16 spec, handoff T16-E, brief, katalog i T13 część D. Przez Figma MCP obejrzyj HistoryContent: selected-day, empty-day i unknown-time. Edytuj wyłącznie stronę historii, src/components/history/*, ich testy i CSS oraz test-t15d-browser.mjs. Nie zmieniaj calendar, time, repository ani API. Zachowaj projekcję daty, DST, legacy „godzina nieznana”, aktywne Wznów i powrót do miesiąca oraz dnia. Brak pola w DTO dokumentuj jako T16-CONTRACT i zatrzymaj tylko zależny stan. Uruchom testy komponentu, pełny lokalny runner historii z A/B/anon, 360/390/430 i desktop, npm test, build i typecheck. Utwórz handoff i prompt kolejnego etapu. Bez commitów, publikacji i G. Model rekomendowany: GPT-5.6 Sol, medium — prezentacja na zamrożonym kontrakcie czasu.
```

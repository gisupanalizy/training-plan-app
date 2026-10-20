# Handoff — T16-D — widoczność zapisu serii

- Data i autor: 2026-10-20, Cursor agent, sesja poprawki po odrzuconym T16-I.
- Zadanie / status po sesji: wada układu zapisu serii poprawiona. T16-D zostaje review. T16-I zostaje z bramką nieprzyjętą. T16 nie jest zamknięte. T16-K todo i niegotowe.
- Branch / commit / stan zmian: `codex/tempo`, HEAD `70d66e6`, drzewo robocze bez commita. Ta sesja nie commitowała, nie pushowała i nie tworzyła PR.
- Powiązany wcześniejszy handoff: [T16-I](2026-10-19-T16-I-niezalezny-odbior.md).

## Cel i wykonana praca

Na ekranie jednej serii `/trening/[id]`, przy 390×844, po uzupełnieniu celów i wyborze „Zostań”, dół `Zapisz i przejdź dalej` jest nad górą `.mobile-nav`. Treść serii przewija się w panelu, a zapis stoi pod nią. D046 bez zmian: karty podglądu i karty treningu mogą wchodzić pod pasek i są doskrolowalne. Komenda, API, próg testu T15-B i dane bez zmian. Ta sesja nie powtórzyła odbioru I.

## Zmienione pliki

- [src/components/workout-editor.tsx](../../src/components/workout-editor.tsx) — zapis serii w `[data-series-save]`, poza `[data-series-scroll]`.
- [src/components/workout-editor.module.css](../../src/components/workout-editor.module.css) — na wąskim ekranie panel serii kończy się nad dolną nawigacją.
- [src/components/workout-editor.test.tsx](../../src/components/workout-editor.test.tsx) — test struktury zapisu poza przewijaną treścią.
- [docs/ROADMAP.md](../ROADMAP.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md), [docs/TESTING.md](../TESTING.md), [README.md](../../README.md) — poprawka bez zamknięcia T16-I.

Bez migracji, bez zmian API, bez `workout-command` i bez zmiany progu `scripts/test-t15b-browser.mjs`.

## Weryfikacja

Środowisko: Node 26.4.0, Next 16.4.0, lokalny Supabase, Chrome headless. Serwer: już działający `next dev` na `http://localhost:3000`, nie `next start`.

- `npx vitest run src/components/workout-editor.test.tsx`: 7/7.
- `T15B_HTTP_BASE=http://localhost:3000 T15B_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15b-browser.mjs`: PASS. Ogon tego polecenia uruchomił `test-t13c-browser.mjs` i też dał PASS. Osobnego, drugiego procesu T13-C nie było.
- Przy 390 czwarta karta podglądu ma dół 1015,75 przy nawigacji 768. Czwarta karta treningu ma dół 1195,97 przy nawigacji 768. Obie doskrolowalne.
- Zrzut po „Zostań”: `/private/tmp/t15b-result.png`.
- `npm test`: 272 passed / 9 skipped.
- `npm run build`: exit 0. Następujący `npm run typecheck`: exit 0.
- `git diff --check`: bez zgłoszeń.
- Telefon i Safari niewykonane. Głos w T13-C to mock transportu.

## Decyzje i zmiany planu

Bez nowej decyzji. D046 i D047 bez zmian. T16-D zostaje review. T16-I nie przechodzi do done. T16-K zostaje niegotowe.

## Pozostała praca i blokery

Nowy T16-I ma wykonać inny agent niż autor tej poprawki. Do tego czasu bramka Tempo nie jest przyjęta.

Telefon, Safari, T10-R1, T11 i publikacja zostają osobno.

## Następny krok

Niezależny odbiór T16-I od nowa. Pliki startowe: ten handoff, raport I, STATUS i ROADMAP. Recenzent nie edytuje `src/`.

## Stan środowiska

Po buildzie `.next` jest produkcyjny. Działający wcześniej `npm run dev` na porcie 3000 może wymagać ponownego uruchomienia. Lokalny Supabase zostaje. Komunikat CLI podczas testu wymieniał zatrzymane imgproxy i pooler; ta sesja ich nie zatrzymywała. Bez wypisania sekretów.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, high. To pełny odbiór po wąskiej poprawce głównej akcji zapisu. High ogranicza zaliczenie bramki tylko na podstawie przebiegu autora poprawki; jeden fałszywy PASS powtarza cały przepływ.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy, gałąź codex/tempo, HEAD 70d66e6 plus niezacommitowane T16 wraz z poprawką widoczności zapisu. Wykonaj tylko nowy niezależny T16-I. Nie jesteś autorem poprawki z 2026-10-20 ani autorów B–H. Nie zamykaj T16, jeśli bramka nie jest spełniona. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-20-T16-D-widocznosc-zapisu.md, docs/handoffs/2026-10-19-T16-I-niezalezny-odbior.md, docs/reports/2026-10-19-T16-I-tempo-acceptance.md, specyfikację T16, brief, katalog oraz D046 i D047. Src jest tylko do odczytu. Sprawdź ponownie macierz stanów i pełny lokalny przepływ na next start pod adresem localhost. Przy 390×844, po uzupełnieniu celów i wyborze „Zostań”, dół „Zapisz i przejdź dalej” ma być nad górą .mobile-nav. D046 zostaje: karty mogą wchodzić pod pasek i muszą być doskrolowalne. Nie zmieniaj progu testu T15-B, workout-command, API ani danych. Uruchom npm test, build, sekwencyjny typecheck i właściwe runnery. Jeśli wada została, przypisz ją właścicielowi i nie oznaczaj T16-I jako done. Jeśli bramka przechodzi, zamknij odbiór w raporcie, ROADMAP, STATUS, CHANGELOG, TESTING i nowym handoffie. Nie commituj i nie publikuj. Telefonu i Safari nie deklaruj, jeśli ich nie sprawdzisz. Model: GPT-5.6 Sol, high.
```

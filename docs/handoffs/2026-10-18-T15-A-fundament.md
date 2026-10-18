# Handoff — T15-A — fundament Noc

- Data: 2026-10-18. Autor implementacji: /root/foundation (Sol/medium); integracja i handoff: /root.
- Status: review, bramka lokalna przyjęta przez I; końcowy odbiór G pozostaje.
- Gałąź codex/t15-ui, baza51ea3b4; commit zakresu wykonuje I po tym zapisie. Zastana dokumentacja U2 zachowana.
- Źródła: T15-ORCHESTRATOR, plan T15, wybrane makiety R5/R6, D043–D045; poprzedni handoff T15-U2.

## Wykonano

Domyślna Noc, Inter Variable z lokalnych plików i OFL, metadane viewport/theme, pięć istniejących tras nawigacji z SVG, skip-link, safe-area. Tokeny semantyczne adaptują też stare ekrany podczas wdrażania B–F. Nowe Button/Field/Icon/InfoPopover/ExerciseIllustration oraz ścisły resolver ilustracji; nieznany osobny wariant/sprzęt daje neutralny znacznik.17 SVG z manifestami/licencją CC BY-SA4.0 i atrybucją. AppShell children/section zachowany. Bez nowych zależności, API, SQL lub kosztów.

W Chrome wykryto overflow Profilu przy długim emailu360px; poprawiono min-width i zawijanie. Pierwsza asercja fontu oczekiwała błędnej nazwy localFont zamiast inter; poprawiono runner. Finalna bramka obejmuje poprawkę, nie tylko pierwszą wersję.

## Pliki i własność

src/app/layout.tsx, globals.css, src/components/app-shell.tsx; nowe src/components/ui/, src/lib/ui/, public/fonts/, public/exercise-assets/ oraz scripts/test-t15a-browser.mjs. Checkpoint A zawiera kontrakty komponentów. Wszystkie źródła A zwolnione do I; następni wykonawcy nie edytują wspólnych plików bez przydziału.

I aktualizuje README/ROADMAP/STATUS/TESTING/CHANGELOG i checkpointy. docs/DESIGN.md utrwala zatwierdzony system; docs/T15_PROGRESS_CONTRACT.md i D045 przygotowują E, nie są implementacją E.

## Rzeczywista weryfikacja

- Własne npx vitest run src/components/ui/ui.test.tsx src/lib/ui/exercise-assets.test.ts:6 PASS, semantyka/fokus/pomoc/fallback i integralność manifestów.
- I: npm test z OPENAI_API_KEY pustym, OPENAI_IMPORT_ENABLED/OPENAI_VOICE_ENABLED/RUN_T06_LIVE/RUN_T09_LIVE false:204 PASS,9 skipped;30 plików PASS,5 skipped.
- DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs build: końcowy PASS, po nim npm run typecheck PASS. Build powtórzony po rzeczywistej poprawce overflow i resolvera.
- T15A_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15a-browser.mjs: PASS21 stanów360/390/430 (logowanie+6 ekranów zalogowanego), rzeczywisty lokalny Auth/RPC syntetycznego planu,5 linków nav/aria-current, ciemny motyw/font, cele44, stopka nad nav, skip-link/Enter i desktop1280, brak błędów JS.
- Raport /private/tmp/t15a-browser-report.json; zrzuty plan-390/profile-390/desktop w /private/tmp/t15a-*.png. Wykonawca obejrzał trzy, I dodatkowo plan390. Dane syntetyczne, poza repo.
- Kontrasty WCAG tokenów: ink/surface13.80, muted/tint6.75, on-primary/primary10.01, control/surface4.50, warning9.05, danger7.99. To pomiary wybranych par, nie certyfikat całej aplikacji.
- I: DO_NOT_TRACK=1 T13A_HTTP_BASE=http://localhost:3005 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run test:t13a:local: RPC i HTTP PASS — A/B/anon, concurrency start/replace/save/delete, retry/410, legacy/DST/snapshoty.
- git diff --check: PASS przed przekazaniem.

Początkowe odczyty procesów/Git/Dockera i Chrome wymagały eskalacji sandboxa; dopiero zatwierdzone próby dały wyniki. Limit przerwał autorów; wznowiono istniejącego A po audycie agentów/Git/procesów, bez restartu implementacji. Fizyczny telefon/Safari nie były testowane. Bez płatnego AI, zdalnych migracji/push/publikacji.

## Środowisko i następny krok

Lokalny Supabase działa. A pozostawił serwer3005 (sesja45260); zastany dev projektu i inne projekty nietknięte. B/E rozpoczęte po przyjęciu A; wykonawca A zatrzymany po zwolnieniu plików, I dokończył dokumentację, aby utrzymać max2 aktywnych wykonawców. B/E mają osobne zakresy, wspólne testy przez I. Kontrakt B→D w planie, E w osobnej specyfikacji. Kolejny krok: doprowadzić B/E do bramek, potem gotowe C/D/F i niezależny G.

## Prompt kontynuacji

```text
Wznów pełne lokalne T15-A–G w /Users/jakub.olech/GIT/apka-plan-treningowy zgodnie z docs/prompts/T15-ORCHESTRATOR.md. Najpierw AGENTS, README, STATUS, ROADMAP, docs/checkpoints/T15/STATE.md, checkpointy etapów i docs/handoffs/2026-10-18-T15-A-fundament.md; sprawdź Git oraz agentów/procesy, bez dublowania aktywnych zakresów. A ma przyjętą lokalną bramkę; B/E rozpoczęte. Integrator /root, max2 wykonawców, G niezależny. Zachowaj kontrakt E, wyłączność plików i kolejkę testów. Kontynuuj do lokalnego odbioru wszystkich etapów, z testami/typami/buildem i rzeczywistym API/DB/Chrome; telefon/Safari osobno. Bez AI kosztowego, zdalnych migracji, push/publikacji. Zapisuj checkpointy, lokalne commity zwolnionych zakresów i rzeczywiste handoffy z promptem. Model I Sol/high; A/D/F medium, B/C/E/G high — bez rutynowego Ultra. Brak nowego blokera; nie traktuj limitu lub niepełnych testów jako ukończenia.
```

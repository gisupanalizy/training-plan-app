# Handoff — T16-B — fundament Tempo

- Data i autor: 2026-10-19, Cursor agent, sesja T16-B.
- Zadanie / status po sesji: T16-B review. T16-C–I todo. T16-K todo i niegotowe, bo nie ma propozycji kontraktu.
- Branch / commit / stan zmian: `codex/tempo`, HEAD `70d66e627ecb8fef73fb8d89d430ad8f41796ca5`. Dokumentacja T16-A i kod T16-B są niezacommitowane. Bez commit, push i PR.
- Powiązany wcześniejszy handoff: [T16-A](2026-10-19-T16-A-kontrakt-tempo.md).

## Cel i wykonana praca

Wdrożono jeden system Tempo. W `src/app/globals.css` tokeny `--tempo-*` siedzą w jednym `:root` i mapują istniejące aliasy ekranów. Nie dodano przełącznika ani drugiej palety. Z `src/app/layout.tsx` usunięto `data-theme="night"`. `themeColor` to `#11191c`. Lokalny Inter, pięć tras, safe-area, fokus 3 px, cele co najmniej 44×44 i `prefers-reduced-motion` zostają.

Wspólne kontrolki odpowiadają klatkom `system/library` i `dialog-open`: Button primary/secondary/ghost/danger, Field z trwałą etykietą, Stepper, który nie zastępuje wpisu z klawiatury i nie zamienia braku na zero, ListRow, Card, StatusBadge, SegmentedControl, Notice, EmptyState oraz Dialog. Zamknięcie, Anuluj i Escape odrzucają niezastosowane pole i wracają fokus. Na szerokości do 740 px dialog jest pełnoekranowy, powyżej jest modalem. Dolna nawigacja i boczny sidebar są w `src/components/ui/navigation.tsx`. AppShell z nich korzysta. Aktywna trasa ma ikonę, tekst i powierzchnię. AppShell nadal bierze stan prywatny albo demo z konfiguracji Supabase, nie z liczb makiety.

Ekrany C–H nie były przebudowywane. Dostały nowe kolory przez aliasy. Nie dodano ilustracji, zależności, zmian API ani bazy. Nie było luki odczytu, więc nie powstał `docs/proposals/T16-CONTRACT-*.md`.

Ostrzeżenie semantyczne nie używa bursztynu CTA. Tło ostrzeżenia zostaje `#3c311c`, a tekst `#f2f5f1`. Błąd zostaje przy istniejącym `#ffb4ab` i powierzchni `#402825`. Prototyp Make maluje ikonę ostrzeżenia kolorem `#f0cc7c`; brief zabrania bursztynu dla błędu, ostrzeżenia i sukcesu, więc tego złota nie skopiowano. Ghost ma tekst akcentu, tak jak klatka biblioteki.

## Zmienione pliki

- [src/app/globals.css](../../src/app/globals.css) — tokeny Tempo i aktywna nawigacja z powierzchnią.
- [src/app/layout.tsx](../../src/app/layout.tsx) — `#11191c`, bez `data-theme`.
- [src/components/app-shell.tsx](../../src/components/app-shell.tsx) — składa Sidebar i BottomNav, zachowuje skip-link, demo i safe-area.
- [src/components/ui/](../../src/components/ui/) — istniejące Button, Field, Icon, InfoPopover i ilustracja oraz nowe Stepper, ListRow, Card, StatusBadge, SegmentedControl, Notice, EmptyState, Dialog i navigation.
- [src/components/ui/ui.test.tsx](../../src/components/ui/ui.test.tsx) — zachowania wspólnych kontrolek.
- [scripts/test-t15a-browser.mjs](../../scripts/test-t15a-browser.mjs) — Tempo zamiast asercji Nocy, kontrast, fokus i reduced motion.
- [docs/ROADMAP.md](../ROADMAP.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md), [docs/TESTING.md](../TESTING.md) i ten handoff.

Bez migracji i bez zmiany kontraktu danych. `src/lib/ui/exercise-assets.ts` bez zmian. Nieśledzony `.impeccable/config.json` tylko wyłącza detektor dla istniejącego cytatu `.review-source-quote`; cytatu nie zmieniano, bo korekta należy do T16-E.

## Weryfikacja

Środowisko: macOS, gałąź `codex/tempo`, lokalny Supabase API odpowiadał, Chrome przez Playwright `channel: chrome`. Telefon i Safari niewykonane. Płatnego AI nie było.

1. `npx vitest run src/components/ui/ui.test.tsx`: 9 passed.
2. `npm test`: 256 passed, 9 skipped.
3. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false T15A_HTTP_BASE=http://127.0.0.1:3002 T15A_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t15a-browser.mjs`: PASS, 21 stanów. Prawdziwe lokalne Auth i RPC syntetycznego planu. 360/390/430 i desktop 1280. Brak `data-theme`, `theme-color` `#11191c`, tło `rgb(17, 25, 28)`, Inter, pięć linków co najmniej 44 px, aktywna powierzchnia `rgb(37, 50, 53)`, stopka nad nawigacją, skip-link, obrys 3 px, reduced motion, sidebar, brak błędów JS. To był już działający `next dev` na porcie 3002, nie produkcyjny `next start`.
4. Samodzielny pomiar kontrastu par tokenów: tekst na tle 16,20:1, muted na tle 7,41:1, muted na powierzchni 6,45:1, muted na podniesionej powierzchni 5,51:1, tekst na akcencie 9,85:1, sukces 9,16:1, błąd 10,48:1, błąd na swojej powierzchni 7,99:1, ostrzeżenie 11,59:1, akcent jako fokus 10,79:1. Linia wobec powierzchni 1,48:1 i nie jest obrysem kontrolki.
5. Pierwszy `npm run build` nie przeszedł, bo tymczasowy zrzut `tmp/t16b-make-app.tsx` wpadł do typechecku. Plik usunięto. Drugi `npm run build` PASS. Potem `npm run typecheck` PASS.
6. `git diff --check` bez zgłoszeń po dokumentach tej sesji.

Obejrzane zrzuty `/private/tmp/t15a-desktop.png`, `t15a-plan-390.png` i `t15a-profile-390.png`: ciemne Tempo, bursztynowe CTA, pięć tras, konto prywatne, aktywna nawigacja z powierzchnią. Układy podglądu i profilu są nadal układami T15. `scripts/test-t15f-browser.mjs` nie był uruchamiany.

## Decyzje i zmiany planu

Nowej decyzji nie dodano. D047 jest wdrożone wizualnie w fundamencie, D046 bez zmian. T16-B przeszedł z todo do review. T16-C–I zostają todo. T16-K zostaje niegotowe. README i zdanie specyfikacji T16 o Nocy w kodzie nie były w dzierżawie B; aktualny stan jest w STATUS.

## Pozostała praca i blokery

T16-C może startować po osobnym zleceniu. Brak blokera kontraktu. `scripts/test-t15f-browser.mjs` nadal wymaga `data-theme="night"` i padnie, dopóki T16-H go nie dostosuje. Telefon, Safari, T10-R1, T11 i publikacja pozostają osobne. Po `npm run build` katalog `.next` jest produkcyjny; działający wcześniej `next dev` użytkownika może wymagać ponownego uruchomienia.

## Następny krok

T16-C, Start, Plany i podgląd. Najpierw przeczytać AGENTS, README, STATUS, ROADMAP, ten handoff, specyfikację T16, brief, katalog i T13. Nie przechodzić do T16-D w tej samej sesji.

## Stan środowiska

Lokalny Supabase API był dostępny. Komunikat CLI podczas testu wymieniał zatrzymane usługi imgproxy i pooler; ta sesja ich nie zatrzymywała. Test usunął swoje syntetyczne konto. `npm run dev` użytkownika był na porcie 3002 i posłużył do Chrome. Sekrety nie były zapisywane w dokumentacji. Zmiany są lokalne i niewysłane.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, high. Etap styka się z konfliktami startu i istniejącymi komendami, więc wysoki poziom jest uzasadniony mimo wyższego kosztu niż medium.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj tylko T16-C. Przeczytaj AGENTS.md, README.md, STATUS, ROADMAP, handoff T16-B, docs/T16_TEMPO_IMPLEMENTATION.md, brief i katalog Tempo oraz T13_MOBILE_WORKOUT. Przez Figma MCP obejrzyj App.tsx: HomeContent, PlansContent i PlanContent, zwłaszcza active-conflict-one, active-conflict-many i active-conflict-delete. Edytuj wyłącznie strony start/plany/podgląd, plan-carousel, plan-preview, exercise-summary, training-preview, workout-start, ich testy i moduły stylów wskazane w tej specyfikacji. Zachowaj prawdziwe odczyty i komendy. Powrót z aktywnego treningu jest primary, zakończenie secondary, usunięcie osobnym danger i dialogiem. D046 obowiązuje: sprawdzaj doskrolowanie. Gdy istniejący odczyt nie zawiera danych dla stanu, zatrzymaj ten stan, dodaj docs/proposals/T16-CONTRACT-*.md i nie edytuj API, repozytorium ani SQL. Uruchom testy komponentów, test-t15b-browser z regresją T13-C, 360/390/430 i desktop, build oraz typecheck. Utwórz handoff i prompt kolejnego etapu. Bez commitów i bez etapu D. Model rekomendowany: GPT-5.6 Sol, high — etap styka się z konfliktami i istniejącymi komendami.
```

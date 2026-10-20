# Handoff — T16-C — Start, Plany i podgląd

- Data i autor: 2026-10-19, Cursor agent, sesja T16-C.
- Zadanie / status po sesji: T16-C review. T16-D–I todo. T16-K todo i niegotowe, bo nie ma propozycji kontraktu.
- Branch / commit / stan zmian: `codex/tempo`, HEAD `70d66e627ecb8fef73fb8d89d430ad8f41796ca5`. Dokumentacja T16-A, kod T16-B i ta sesja są niezacommitowane. Bez commit, push i PR.
- Powiązany wcześniejszy handoff: [T16-B](2026-10-19-T16-B-fundament-tempo.md).

## Cel i wykonana praca

Wdrożono hierarchię Tempo na `/`, `/plany` i `/plany/[id]` oraz w istniejącym konflikcie startu. Odczyty, komendy, retry i replace zostały. Nie dodano planów ani liczb z makiety.

Start ma jedną dominującą akcję. Aktywna sesja daje `Wznów trening`. Plan z opublikowaną, niearchiwalną wersją daje `Rozpocznij` i nazwę pierwszej jednostki. Brak planu daje `Utwórz lub zaimportuj plan` do importu, gdzie jest też ręczne tworzenie. Wygasła sesja prowadzi do logowania, a inny błąd odczytu do ponowienia. Te dwa stany nie pokazują pustej biblioteki. Kilka planów przełącza się strzałkami i wskaźnikiem; gesty karuzeli zostają na `/plany`.

Biblioteka ma jedno `Otwórz plan` na slajdzie. Import i nowy plan są drugorzędne. Pusta biblioteka ma jedno `Utwórz lub zaimportuj plan`. Archiwum otwiera podgląd i mówi, że start jest niedostępny.

Podgląd układa wersję, jednostkę, karty, kontekst i dopiero potem start. Superseria ma ramę i podpis, nie sam bursztyn. Opcjonalność jest tekstem. Brak obciążenia nie staje się zerem; rzeczywiste 0 kg zostaje 0 kg. Serie, rampy, źródła i uwagi są w „Wszystkie serie”. Wersja archiwalna nie ma startu ani wznowienia.

Konflikt jednej sesji: `Wróć do treningu` primary, `Zakończ i rozpocznij nowy` secondary, `Usuń i rozpocznij nowy` danger. Usunięcie otwiera osobny dialog z potwierdzeniem. Kilka sesji ma osobne zestawy, ale etykiety zakończenia i usunięcia zostają `Zakończ ten trening` i `Usuń ten trening`. Te komendy nie rozpoczynają nowego treningu, dopóki na liście nie zostanie jedna sesja. T13-C wymaga tych nazw.

Nie było luki, której nie da się narysować z obecnego odczytu. Przykładowe minuty, postęp ćwiczeń i godzina z klatki nie weszły do UI: podsumowanie sesji nie ma czasu trwania ani liczby ćwiczeń, a konflikt nie ma strefy do wyświetlenia zegara. Stany są wyrenderowane dostępnymi polami. Nie powstał `docs/proposals/T16-CONTRACT-*.md`.

## Zmienione pliki

- [src/app/page.tsx](../../src/app/page.tsx) — start: sesja, plan, wiele planów, archiwum, brak planu, błąd odczytu i demo.
- [src/app/plany/page.tsx](../../src/app/plany/page.tsx) — biblioteka, pusta biblioteka i błąd odczytu.
- [src/app/plany/[id]/page.tsx](../../src/app/plany/[id]/page.tsx) — nagłówek podglądu i jeden baner demo.
- [src/components/plan-carousel.tsx](../../src/components/plan-carousel.tsx) i [plan-carousel.module.css](../../src/components/plan-carousel.module.css) — karta planu, archiwum i wiersze jednostek.
- [src/components/plan-preview.tsx](../../src/components/plan-preview.tsx) i [plan-preview.module.css](../../src/components/plan-preview.module.css) — kolejność, start i rama superserii.
- [src/components/exercise-summary.tsx](../../src/components/exercise-summary.tsx) i [exercise-summary.module.css](../../src/components/exercise-summary.module.css) — karty, opcjonalność i brak kilogramów. Rozmiar metryk treningu zostaje, żeby nie ruszać bramki T13-C.
- [src/components/training-preview.tsx](../../src/components/training-preview.tsx) — jedno CTA demo.
- [src/components/workout-start.tsx](../../src/components/workout-start.tsx) i [workout-start.test.tsx](../../src/components/workout-start.test.tsx) — role konfliktu bez zmiany koperty komendy.
- [src/components/plan-workout.module.css](../../src/components/plan-workout.module.css) — układ ekranów C. Nagłówek wspólny z treningiem wrócił do poprzedniego rozmiaru.
- [src/components/plan-carousel.test.tsx](../../src/components/plan-carousel.test.tsx) — archiwum bez startu.
- [scripts/test-t15b-browser.mjs](../../scripts/test-t15b-browser.mjs) — jedno rozpoczęcie, desktop i doskrolowanie D046.
- [docs/ROADMAP.md](../ROADMAP.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md), [docs/TESTING.md](../TESTING.md) i ten handoff.

Bez migracji, bez API, bez repozytorium i bez SQL.

## Weryfikacja

Środowisko: macOS, gałąź `codex/tempo`, lokalny Supabase API odpowiadał, Chrome przez Playwright `channel: chrome`. Telefon i Safari niewykonane. Płatnego AI nie było.

1. `npx vitest run` karuzeli, podglądu, startu i podglądu demo: 15 passed.
2. `npm test`: 259 passed, 9 skipped.
3. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false T15B_HTTP_BASE=http://localhost:3002 T15B_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t15b-browser.mjs`: PASS. Prawdziwe lokalne Auth i RPC. 360/390/430 oraz desktop 1280. T15-B, a potem niezmieniony T13-C. To był już działający `next dev`, nie produkcyjny `next start`.
4. Pierwsze próby na `http://127.0.0.1:3002` nie hydratowały klienta: Enter i click karty nie otwierały szczegółów. Dev odrzuca zasoby z tego hosta. Powtórka na `localhost` przeszła.
5. `npm run build` PASS. Potem `npm run typecheck` PASS.
6. `git diff --check` bez zgłoszeń.

Obejrzane zrzuty `/private/tmp/t15b-390-start.png`, `t15b-390-plans.png`, `t15b-390-preview.png`, `t15b-plan-detail.png` i `t15b-desktop-preview.png`: ciemne Tempo, jedno bursztynowe CTA, karuzela, karty, superseria, 0 kg i seria źródłowa. Błąd odczytu i pusta biblioteka nie wystąpiły, bo API odpowiadało. Chrome nie otwierał osobno stanu archiwum; robi to test komponentu.

Czwarta karta podglądu przy 390 ma dół 1015,75 przy nawigacji 768 i przechodzi sprawdzenie doskrolowania. Stara bramka T13-C przy 390 nadal wymaga karty treningu nad nawigacją: dół 766,19 wobec 768. Tej asercji nie zmieniano. Należy do T16-D.

## Decyzje i zmiany planu

Nowej decyzji nie dodano. D046 i D047 bez zmian. T16-C przeszedł z todo do review. T16-D–I zostają todo. T16-K zostaje niegotowe. Etykiety wielu sesji nie zostały ujednolicone z klatką, bo zmieniłyby znaczenie komendy i oblały T13-C.

## Pozostała praca i blokery

T16-D może startować po osobnym zleceniu. Brak blokera kontraktu. `scripts/test-t13c-browser.mjs` nadal ma starą bramkę czterech kart nad nawigacją; T16-D ma ją zastąpić doskrolowaniem. `scripts/test-t15f-browser.mjs` nadal wymaga `data-theme="night"` i należy do T16-H. Telefon, Safari, T10-R1, T11 i publikacja pozostają osobne. Po `npm run build` katalog `.next` jest produkcyjny; działający wcześniej `next dev` może wymagać ponownego uruchomienia.

## Następny krok

T16-D, przegląd treningu, seria, głos i zakończenie. Najpierw przeczytać AGENTS, README, STATUS, ROADMAP, ten handoff, specyfikację T16, brief, katalog, T13 i D046. Nie przechodzić do T16-E w tej samej sesji. Chrome na tym dev serwerze otwierać jako `localhost`, nie `127.0.0.1`.

## Stan środowiska

Lokalny Supabase API był dostępny. Komunikat CLI podczas testu wymieniał zatrzymane usługi imgproxy i pooler; ta sesja ich nie zatrzymywała. Test usunął swoje syntetyczne konto. `npm run dev` użytkownika był na porcie 3002 i posłużył do Chrome. Sekrety nie były zapisywane w dokumentacji. Zmiany są lokalne i niewysłane. Tymczasowy odczyt `App.tsx` z Make został usunięty i nie jest w repozytorium.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, high. Etap dotyczy zapisu serii, szkiców i retry, więc wysoki poziom jest uzasadniony mimo wyższego kosztu niż medium.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj tylko T16-D. Przeczytaj AGENTS.md, README.md, handoff T16-C, T16 spec, brief, katalog, T13_MOBILE_WORKOUT i D046. Przez Figma MCP obejrzyj WorkoutContent, SetContent, VoiceContent i FinishContent. Edytuj tylko stronę /trening/[id], komponenty workout-editor, voice, finish, dialog i status, ich testy, CSS i test-t13c-browser.mjs. Nie edytuj workout-command.ts, workout-state.ts, API ani lib/workouts. Zachowaj identyczny retry, ACK i aktualny GET, 409, szkice, poprawkę czasu i snapshoty. Null, 0 i Nie dotyczy muszą pozostać różne. Gdy stan wymaga nieobecnego pola, zatrzymaj fragment i zapisz propozycję T16-CONTRACT. Zmień starą asercję czterech kart zgodnie z D046 na dostępność przez scroll, jeśli jeszcze jej nie ma. Uruchom pełną regresję T13-C oraz adekwatne T13-A, T05 i T09, npm test, build i typecheck. Utwórz handoff i prompt kolejnego etapu. Bez płatnego AI, commitów i etapu E. Model rekomendowany: GPT-5.6 Sol, high — krytyczny przepływ trwałości i szkiców.
```

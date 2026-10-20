# Handoff — T16-A — kontrakt Tempo

- Data i autor: 2026-10-19, Cursor agent, sesja T16-A.
- Zadanie / status po sesji: T16-A review. T16-B–I todo. T16-K todo i niegotowe, bo nie ma zatwierdzonej propozycji kontraktu.
- Branch / commit / stan zmian: `codex/tempo`, HEAD `70d66e627ecb8fef73fb8d89d430ad8f41796ca5`. Dokumentacja T16-A jest niezacommitowana. Bez commit, push i PR.
- Powiązany wcześniejszy handoff: [T15-G](2026-10-19-T15-G-niezalezny-odbior.md).

## Cel i wykonana praca

Utrwalono zatwierdzony kierunek przed kodowaniem. D047 zapisuje Tempo jako jedyny wygląd i zastępuje wyłącznie wizualną część D044 dotyczącą palety Noc. D046 pozostaje bez zmian. Zachowanie produktu, API, baza i analityka zostają.

Z Make `D2nF5loZrbPDqY2oco8ske` skopiowano wiernie brief i katalog klatek. Odczytano `src/App.tsx` wyłącznie jako listę stanów. Identyfikatory pokrywają się z katalogiem: 85 stanów, każdy w klatce mobile 390 px i desktop. Kodu prototypu ani przykładowych danych nie zapisano w `src/`. Tymczasowy zrzut `App.tsx` powstał przez ścieżkę pobrania MCP i został usunięty; w drzewie go nie ma.

[T16_TEMPO_IMPLEMENTATION.md](../T16_TEMPO_IMPLEMENTATION.md) opisuje etapy A–I, warunkowe K, własność plików, bramki, zakazy i macierz klatek. Luka odczytu zatrzymuje tylko dany stan i kończy się propozycją `docs/proposals/T16-CONTRACT-<trasa>-<stan>.md`. K wymaga osobnej zgody na dokładny zakres. Ewentualna migracja K zostaje lokalna do kolejnej zgody na środowisko zdalne.

DESIGN i UX wymagają jednego systemu Tempo oraz doskrolowania zasłoniętej karty. Drugi motyw i bramka czterech kart kończących się nad nawigacją są wycofane z tych dwóch dokumentów.

## Zmienione pliki

- [docs/tempo-implementation-brief.md](../tempo-implementation-brief.md) — wierna kopia z Make.
- [docs/tempo-frame-catalog.md](../tempo-frame-catalog.md) — wierna kopia z Make.
- [docs/T16_TEMPO_IMPLEMENTATION.md](../T16_TEMPO_IMPLEMENTATION.md) — kontrakt programu.
- [docs/DECISIONS.md](../DECISIONS.md) — D047 i dopisek przy D044. Treść D046 bez zmian.
- [docs/DESIGN.md](../DESIGN.md) — Tempo jako jedyny system; doskrolowanie zamiast bramki czterech kart nad nav.
- [docs/UX.md](../UX.md) — ten sam kierunek wizualny, semantyka T13/T15 zostaje.
- [docs/ROADMAP.md](../ROADMAP.md) — T16-A review, B–I todo, K niegotowe.
- [docs/STATUS.md](../STATUS.md) — punkt wejścia T16-A.
- [docs/CHANGELOG.md](../CHANGELOG.md) — powód i wpływ programu.
- [README.md](../../README.md) — krótki status T16-A.
- Ten handoff.

Bez migracji, bez zmiany kontraktu danych i bez `src/`.

## Weryfikacja

Środowisko: macOS, repozytorium lokalne, Figma MCP zalogowany do pliku Make. Bez uruchamiania testów produktu, Dockera, Supabase, Chrome i płatnego AI. Telefon i Safari niewykonane. Istniejący proces `npm run dev` użytkownika nie był używany w tej sesji.

1. Odczyt MCP `file://figma/make/source/D2nF5loZrbPDqY2oco8ske/docs/tempo-implementation-brief.md` i `docs/tempo-frame-catalog.md`, zapis do `docs/`, ponowny odczyt do katalogu porównawczego i `diff`. SHA-1 zgodne: brief `c6a5febd7dd57e4f4a6326d140e0c0a0e9ef6ee5`, katalog `654bc3f2c02c467c9414a49fc54d2ae8f3cf41f2`. Katalog porównawczy usunięty.
2. Odczyt MCP `src/App.tsx`. Identyfikatory grup `training`, `plans`, `plan`, `editor`, `import`, `review`, `workout`, `set`, `voice`, `finish`, `history`, `progress`, `profile`, `login`, `password`, `components` i ich stany są zgodne z katalogiem. Plik prototypu nie pozostał w repozytorium.
3. `git diff --check` zakończył się bez zgłoszeń. Względne linki w README, STATUS, ROADMAP, CHANGELOG, DECISIONS, DESIGN, UX, specyfikacji T16, handoffie i obu kopiach Make rozwiązują się do istniejących plików. Dziewięć kotwic ROADMAP do nagłówków T16 zgadza się ze slugami nagłówków. Prompt T16-B w tym handoffie jest identyczny z promptem w specyfikacji. `git status` pokazuje wyłącznie dokumenty T16-A; `src/` bez zmian. Treść sekcji D046 jest bajtowo taka sama jak w HEAD.

`npm test`, `npm run build` i `npm run typecheck` niewykonane. To sesja dokumentacyjna.

## Decyzje i zmiany planu

D047, 2026-10-19, confirmed dla kierunku wizualnego. Nie oznacza wdrożenia kodu. D046 bez zmiany treści. W ROADMAP dodano T16-A–I oraz warunkowe T16-K. ID T13 i T15 oraz ich statusy done lokalnie zostają. PRODUCT, TESTING i specyfikacja T15 pozostają poza zakresem tej sesji; zdania o Nocy w nich opisują odebrany T15, a bieżący kierunek wizualny jest w D047.

## Pozostała praca i blokery

T16-B jest gotowe do osobnego zlecenia. Brak blokera technicznego kontraktu. T16-K nie ma propozycji ani zgody, więc nie startuje. Telefon, Safari, T10-R1, T11 i publikacja pozostają otwarte i osobne. Kod nadal ma `data-theme="night"` i `themeColor` `#11191f`.

## Następny krok

T16-B, fundament Tempo. Najpierw przeczytać AGENTS, README, STATUS, ROADMAP, ten handoff, brief, katalog i specyfikację T16. Nie przechodzić do T16-C w tej samej sesji.

## Stan środowiska

Nie uruchamiano serwerów, migracji ani testów. Sekrety nie były odczytywane do dokumentacji. Zmiany są lokalne i niewysłane.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, medium. Fundament jest szeroki, a domena zostaje bez zmian, więc medium wystarcza i jest tańsze niż high.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy, gałąź codex/tempo. Wykonaj tylko T16-B z docs/T16_TEMPO_IMPLEMENTATION.md. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-19-T16-A-kontrakt-tempo.md, docs/tempo-implementation-brief.md, docs/tempo-frame-catalog.md oraz D046 i D047 w docs/DECISIONS.md. Sprawdź git status; kod bazowy to 70d66e6, a kontrakt T16-A może być jeszcze niezacommitowany. Przez Figma MCP obejrzyj Make D2nF5loZrbPDqY2oco8ske, src/App.tsx: komponenty system/library i AppShell mobile/desktop. Edytuj wyłącznie src/app/globals.css, src/app/layout.tsx, src/components/app-shell.tsx, src/components/ui/*, prezentacyjne src/lib/ui/*, src/components/ui/ui.test.tsx, scripts/test-t15a-browser.mjs, docs/ROADMAP.md, docs/STATUS.md, docs/CHANGELOG.md, docs/TESTING.md i nowy docs/handoffs/2026-10-19-T16-B-fundament-tempo.md. Zbuduj jeden system Tempo: --tempo-* mapują istniejące aliasy w jednym :root; usuń data-theme="night" i nie dodawaj przełącznika ani drugiej palety; themeColor ustaw na #11191c. Zachowaj pięć tras, lokalny Inter, safe-area, fokus, cele 44×44 i prefers-reduced-motion. Nie przebudowuj ekranów C–H, API, bazy ani nowych ilustracji. Jeśli komponent wymaga danych nieobecnych w autoryzowanym odczycie, zatrzymaj ten fragment i zapisz docs/proposals/T16-CONTRACT-<trasa>-<stan>.md; nie wdrażaj propozycji i nie podstawiaj danych z makiety. Uruchom testy UI, lokalny Chrome 360/390/430 i desktop, npm test, npm run build, potem sekwencyjny npm run typecheck. Zaktualizuj dokumenty stanu i testów, utwórz handoff oraz prompt kolejnego etapu. Nie commituj, nie pushuj, nie twórz PR i nie przechodź do T16-C.
```

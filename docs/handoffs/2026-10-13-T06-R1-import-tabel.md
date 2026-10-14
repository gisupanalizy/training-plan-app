# Handoff — T06-R1 — import rzeczywistych tabel

- Data i autor: 2026-10-13, Codex; praca bez innych agentów.
- Zadanie/status: T06-R1 `done` lokalnie, zależności T04/T06/T07 spełnione. T09 pozostało `review`, T10/T11 nie rozpoczęto.
- Branch/commit: katalog nie jest repozytorium Git; zmiany lokalne, bez push/publikacji.
- Wcześniejszy punkt wejścia: [handoff T09](2026-10-13-T09-obsluga-bledu-rejestratora.md), [STATUS](../STATUS.md). Wyniki emulatora są oddzielną historią T09, nie odbiorem T06-R1.

## Cel i wykonana praca

Wykonano plan jawnie zlecony przez użytkownika: rozumienie trzech źródeł przed zmianami, oczekiwany odczyt, baseline oraz ocena pytań, poprawa tabel/kontraktu/pytań/podglądu/słownika i regresje. Za wyraźną zgodą właściciela dołączono prywatne źródła do lokalnego `fixtures/t06/real`; ta zgoda nie obejmuje publikacji.

Czytnik XLSX rozpoznaje układ po nagłówkach/strukturze, zachowuje scalenia, przekreślenia, daty i uwagi bloku. Nie używa nazw tych plików jako przełącznika. Inne układy mają fallback AI z kontekstem. W PDF używamy pozycji tekstu oraz oryginalnych stron i osobnych tabel treningowych. Wyniki zapisane w Excelu pozostają notatkami, nie celami ani 1RM.

Kontrakt v2 obsługuje zakresy liczby serii, powtórzeń, czasu, przerw i kg, X/AMRAP, całe opcjonalne ćwiczenia i złożone bloki. 7–8 ma ósmą opcjonalną, a dip 2×6 + 1–2×3 cele 6/6/3/3. SS są lokalne dla jednostki i zachowują kolejność. Intensywność nie trafia do %1RM. V1 nadal działa.

Pytania pokazują kontekst, cytat i przyczynę, wspólne braki są grupowane. Stabilne ID wiążą odpowiedź z ćwiczeniem/serią po przestawieniu. Ręczna korekta usuwa rozwiązany brak; nowy brak celu blokuje publikację, również bez pierwotnych pytań lub metadanych wersji. Przegląd oryginału: wszystkie strony PDF.js, zoom/pełny ekran/Escape, skok do strony; XLSX: wszystkie arkusze, fizyczne kolumny, scalenia/przekreślenia i skok do komórki. Poprawiono mobilną szerokość i kontrast pytań po kontroli zrzutów.

Referencja Free Exercise DB ma 876 nazw EN/sprzęt/licencję/data/SHA, bez obrazów; osobny zweryfikowany słownik PL/EN i aliasy zachowują warianty oraz oryginał. Niepewne dopasowania pozostają propozycją.

## Zmienione pliki

- `src/lib/imports/{xlsx,xlsx-table,pdf,prompt,openai,domain,questions,server}.ts`: źródła, kontrakt, szablony, walidacja i pytania; obecny adapter `import-pl-v12`, model `gpt-6-luna`.
- `src/lib/domain/{model,plan-editor,format}.ts`: zakresy, opcjonalność, identyfikatory korekty, snapshot i polskie formatowanie.
- `src/components/{import-workspace,import-source,import-question-card,exercise-name-picker,plan-editor,workout-editor}.tsx`, `src/app/globals.css`: podgląd, pytania, zakresy, korekta i wykonanie.
- `src/app/api/imports/[id]/source/route.ts`: prywatna tabela `view=grid`, no-store. Dotychczasowy tekst XLSX pozostaje kompatybilny.
- `src/lib/{plans,workouts,progress}/repository.ts`, `src/lib/progress/summary.ts`, `src/app/plany/[id]/page.tsx`: odczyt nowych danych, oryginały, niezmienne cele, wymagane versus opcjonalne serie.
- `supabase/migrations/20261013100000_t06r1_source_ranges.sql`, `20261013102000_t06r1_optional_blocks.sql`: rozszerzenie planu/nowych snapshotów, kontrola zakresów, oryginałów i opcjonalności; zachowane auth/RLS/idempotencja/wersje. Zastosowano **lokalnie**; hosting wymaga obu migracji przed kodem.
- `src/lib/exercises/{names.ts,en-reference.json}`, `scripts/update-exercise-reference.mjs`, `docs/EXERCISE_NAMES.md`: wewnętrzny słownik, Unlicense i pochodzenie.
- `package.json`, `package-lock.json`, `.gitignore`, `scripts/copy-pdf-worker.mjs`: PDF.js 6.4.299 i generowany lokalny worker; Node 22.13 w linii 22 albo 24+.
- Testy `t06r1.test.ts`, `t06r1-source-audit.test.ts`, `real-evaluation.test.ts` oraz aktualizacje testów adaptera/pytań/UI/postępu/integracji/ewaluacji. `scripts/test-t06r1-{api,browser}.mjs`, `evaluate-t06-real.mjs`, rozszerzony HTTP runner/test.
- `fixtures/t06/real`: trzy pliki, niezależny `expected.json`, README, baseline/iteracje/końcowy prywatny audit pytań. Pełne źródła i wyniki nie są publicznym raportem.
- README, STATUS, ROADMAP, T06_IMPORT, DATA_MODEL, UX, TESTING, DECISIONS(D022), CHANGELOG oraz trzy raporty T06-R1 w `docs/reports`.

## Weryfikacja

Środowisko: lokalny macOS, Node 26.4.0, produkcyjny Next 16.4.0, prawdziwy lokalny Supabase Auth/PostgREST/Storage, Chrome headless z Playwright runtime desktopowego.

- `npm test`: **82 przeszło, 8 pominięto**, 18 plików aktywnych; pominięcia to opt-in integracje/prawdziwe AI. Dwa nowe testy audytu porównują wszystkie 30 pozycji PDF i kwalifikują każde końcowe pytanie. Testy UI/domeny są mockowe, bez dowodu jakości modelu.
- `npm run typecheck`: sukces po końcowym buildzie. `npm run build`: sukces, także w końcowym runnerze HTTP.
- `DO_NOT_TRACK=1 npm run test:t06:local`: **3/3**. Naprawiono założenie starego testu o pustym globalnym liczniku: odczytuje dotychczasowe rezerwacje i sprawdza jeden dodatkowy slot oraz odmowę kontu B. Nie skasowano istniejących prób, nie wykonano API dostawcy w tej regresji.
- `DO_NOT_TRACK=1 npm run test:t06r1:local`: sukces; zakresy/nazwy, 7–8, całe opcjonalne ćwiczenie, złożone cele, retry publikacji/startu, niezmienny historyczny snapshot po nowej wersji, odmowa modyfikacji snapshotu i A/B.
- `DO_NOT_TRACK=1 npm run test:t04:local`, `test:t05:local`, `test:t08:local`: sukces; starszy kontrakt, superserie/rampa/1RM, retry/rewizje, izolacja A/B/anon i postęp 940 → 1140 kg po poprawce wyniku.
- `DO_NOT_TRACK=1 T06R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t06:http`: **sukces końcowy**. HTTP używa mocka AI i własnych kont; sprawdza podpisany upload, źródło/grid/no-store, A/B/anon, korektę po reload, v1, pytanie i ponowienie zatwierdzenia. Chrome używa prawdziwych źródeł oraz zachowanych szkiców z prawdziwej próby na własnych kontach; bez ponownego AI i publikacji prywatnych planów. Klikano 6 stron, zoom/pełny ekran/Escape, skok do strony 4, mobilny powrót, wszystkie arkusze, przekreślenie i A54, zakres 2–3/AMRAP, zmianę kolejności i zapis/reload. Sprawdzono zrzuty `/private/tmp/t06r1-pdf-mobile.png` oraz `t06r1-xlsx-desktop.png`. Błędy przeglądarki: brak.

Pierwsze przebiegi ujawniły błędy testu (oczekiwanie widoczności natywnego option, brak jawnych typów audytu), niepełne dawne fixture serii oraz rzeczywiste poszerzanie mobilnego podglądu. Wszystkie poprawiono i ponowiono związane sprawdzenia; nie deklarujemy wcześniejszych przebiegów jako sukcesu.

### Rzeczywiste pliki i AI

`before.json` przez lokalny Auth/Storage/processImportJob zachował baseline: PDF 30 ćwiczeń, 10 zbędnych pytań (zakres serii/X/czas); FBW 19 ćwiczeń, 2 zbędne pytania o plank i 1 zasadne o datę; Madzia timeout. To różni się od starszego runu 55 pytań, którego nie przypisano do obecnego baseline.

Końcowy `after-4.json` ma wszystkie statusy 200:

- PDF: 3 treningi, 30 ćwiczeń, **1** pytanie o znaczenie przerwy 60 /120, **48,562 s**; AI `import-pl-v11`. Serie/cele/grupy wszystkich 30 pozycji zgodne z niezależnym odczytem; alternatywy i pauzy są także w wariantach/odwołaniach.
- FBW: 3 treningi, 19 ćwiczeń, **6** pytań, **92 ms**; czytnik struktury, **0 tokenów AI**. Data Excela, 3 podstawy ciężaru i 2 wybory sprzętu.
- Madzia: 12 jednostek, 97 ćwiczeń, **17** pytań, **111 ms**, czytnik struktury, **0 tokenów AI**. 8 zakresów zastosowania wskazówki, 6 protokołów Tabata, rozkład interwału, serie EMOM i przypisanie EMOM. Nie wymyślono dodatkowego dnia, protokołu 20/10 ani brakujących rund.

Aktualny generator pytań oceniono w prywatnym `results/question-audit.json`; w surowym `after-4` pozostaje historyczny kontekst root-pytania, który potem poprawiono na „Uwagi do całego źródła”. Zmiana tytułów PDF i obsługa jawnego prefiksu dnia nie zmieniają wykazanych serii/grup.

Pełne prawdziwe syntetyczne v11: **12/12, 88/90** (97,78%), zero opuszczeń/dopowiedzeń, dwie nazwy dni A/B; **0,006709 USD**, p50/p95 **7,508/13,411 s**. Po zachowaniu prefiksów przez aplikację celowane v12: **2/2, 17/17**, **0,001105 USD**. Nie ponowiono całej serii v12. [Raport pełny](../reports/2026-10-13-T06-R1-synthetic-v11.json), [celowany](../reports/2026-10-13-T06-R1-synthetic-v12-targeted.json), [podsumowanie źródeł](../reports/2026-10-13-T06-R1-real-summary.json).

Przed płatnymi próbami sprawdzano pozostały zatwierdzony limit T06 **5 USD**. Zachowano 16 prób plików i wcześniejsze niezaliczone iteracje. Znane metryki plików: **0,050202 USD**, wraz z dwiema seriami syntetycznymi **0,058016 USD**. Cztery próby plików mają niepełne metryki tokenów (timeout lub wcześniejszy błąd walidacji), więc **pełny koszt rachunku pozostaje nieznany**. Panel billing nie był ponownie odczytany. Rezerwacja 0,05 USD/próbę jest oddzielnym konserwatywnym licznikiem, także dla lokalnego czytnika, nie rachunkiem.

## Decyzje i zmiany planu

D022 dokumentuje parser struktury, kontrakt v2, stabilne pytania, lokalny słownik i zgodę na źródła. T06-R1 wydzielono z gotowymi zależnościami, po wykonaniu oznaczono `done` lokalnie. Nie rozszerzono zakresu na hosting, publikację danych, płatności ani automatyczne układanie treningu. Nie zmieniono T09 ani innych agentów.

## Pozostała praca i blokery

Uzgodniony zakres implementacji T06-R1 jest zakończony; nie ma następnego zadania w tym zleceniu. Rzeczywiste niejasności źródła pozostają pytaniami w aplikacji przed świadomą publikacją przez właściciela. Nie są błędem polegającym na zgubieniu jawnej liczby.

Ograniczenia: parser obsługuje rozpoznane struktury, nie dowolny arkusz. PDF ma cytat/skok do strony, bez automatycznego podświetlenia prostokąta. Tylko część z 876 nazw ma zweryfikowane PL. Skan, duży dowolny plik, hosting/obciążenie/fizyczny telefon/Safari nie są odebrane. Całkowity rachunek nie jest znany z powodu niepełnych metryk. Przed T10 trzeba rozstrzygnąć kryterium/status T09; poza zakresem tej sesji.

## Następny krok

Brak kolejnego zadania w uzgodnionym zakresie. Właściciel może przejrzeć poprawiony import i rozstrzygnąć pytania źródła w UI, następnie osobno zlecić dalszą pracę. Nie uruchamiać nowej ewaluacji AI rutynowo ani nie publikować prywatnych planów w celu testu.

## Stan środowiska

Testowe serwery Next 3006 oraz Chrome zakończone przez runner. Lokalny Supabase pozostaje uruchomiony. Nowe migracje są zastosowane lokalnie. Konto/próby rzeczywistych ewaluacji pozostają w zwykłej retencji, żeby nie resetować licznika; własne konta/obiekty regresji i browser-testów usunięto. Pliki źródłowe/wyniki pozostają lokalnie w fixtures, prywatne zrzuty w `/private/tmp`, worker generowany w `public` przez predev/prebuild i ignorowany. Sekrety wyłącznie w lokalnej konfiguracji; wymagane nazwy: OPENAI_API_KEY, OPENAI_IMPORT_ENABLED, OPENAI_IMPORT_BUDGET_USD, SUPABASE_SERVICE_ROLE_KEY, publiczna konfiguracja Supabase i CRON_SECRET. Nie zmieniano ani nie publikowano ich wartości.

## Prompt dla kolejnego agenta

Rekomendacja dla ewentualnej złożonej kontynuacji: **gpt-6.1-sol, high** — parser, kontrakt i UI wymagają wspólnej kontroli; oszczędniejszy wybór niż Astra. Brak następnego zadania oznacza, że poniższy prompt przekazuje stan, nie zleca nowej implementacji.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. T06-R1 ukończone lokalnie; brak kolejnego zadania w uzgodnionym zakresie. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-13-T06-R1-import-tabel.md, docs/T06_IMPORT.md, docs/DATA_MODEL.md, docs/DECISIONS.md, docs/TESTING.md i docs/WORKFLOW.md. Nie uruchamiaj innych agentów ani dalszych zadań bez nowego zlecenia. Pozostałe pytania źródeł wymagają interpretacji właściciela przed publikacją, nie zgadywania. Nie publikuj prywatnych fixtures; kolejne płatne próby wymagają sprawdzenia pozostałego zatwierdzonego budżetu T06. Hosting i fizyczne telefony niesprawdzone; T09 nadal review, jego kryterium trzeba rozstrzygnąć przed T10. Po nowym zleceniu aktualizuj dokumentację, handoff i identyczny prompt przekazania. Rekomendowany model: gpt-6.1-sol, high — złożony parser/dane/UI przy niższym koszcie niż Astra.
```

# Handoff — T10 — lokalny odbiór i przygotowanie do wdrożenia

- Data/autor: 2026-10-14, Codex. Bez innych agentów.
- Zadania: T09 `done` lokalnie po D025; T10 `done` lokalnie. T11 `todo`; T10-R1 `todo`, użytkownik wykona fizyczny odbiór po Vercel.
- Git: brak `.git` w projekcie. Zmiany lokalne, bez commitu/push. [Manifest SHA-256 źródeł](../reports/2026-10-14-T10-files.json) identyfikuje zmienione pliki bez fikcyjnego commitu.
- Poprzedni punkt wejścia: [T04-R1](2026-10-13-T04-R1-czytelny-edytor.md).

## Cel i wykonana praca

Użytkownik rozstrzygnął, że review na fizycznym telefonie wykona po wdrożeniu Vercel, i zezwolił na dalszą implementację. D025 zamyka lokalny T09 i rozdziela T10 (lokalne sprawdzenia/poprawki), T11 (środowisko wdrożone) oraz T10-R1 (fizyczny review po T11). Zachowano istniejące identyfikatory i zależności; dodano T10-R1, aby uniknąć cyklu wymagania telefonu przed wdrożeniem potrzebnym do jego testu. Szersza beta wymaga T10-R1. Nie uznano telefonu za przetestowany.

T10 sprawdził krytyczne lokalne scenariusze i zamknął otwarty punkt D011: katalog i tabele planu nie dopuszczają bezpośredniego DML z klienta. Publikacja/approve nadal są transakcyjne, z właścicielem i retry. Nowa migracja nie zmienia istniejących danych/snapshotów. Cztery ręczne API używają wspólnego ograniczonego czytnika JSON, dzięki czemu null/niepoprawny kształt nie prowadzi do 500; limity bajtów są w raporcie. Proxy prywatnego API bez sesji zwraca JSON 401 z no-store; strony nadal kierują do logowania.

Dodano wykluczenia prywatnego `fixtures/t06/real`, `.env*` i `.vercel` w Git/Vercel. To konfiguracja przyszłej publikacji, nie wykonany upload. Nie kasowano prywatnych plików i nie publikowano planów użytkownika. Nie zmieniono parserów/modeli/promptów AI ani budżetów.

## Zmienione pliki

- Migracja [T10](../../supabase/migrations/20261014100000_t10_plan_write_boundary.sql): odebranie klientowi INSERT/UPDATE/DELETE katalogu i tabel planu.
- [Czytnik JSON](../../src/lib/http/json.ts), [testy](../../src/lib/http/json.test.ts) oraz `src/lib/imports/http.ts`: wspólna implementacja z zachowanym eksportem importu. Trasy `src/app/api/{plans,workouts,one-rep-max,profile/rounding}/route.ts` wykorzystują limity; bez zmiany poprawnych payloadów.
- `src/lib/supabase/proxy.ts` i `proxy.integration.test.ts`: JSON 401 API oraz test rzeczywistej sesji.
- [Runner](../../scripts/run-local-t10.mjs), [API](../../scripts/test-t10-api.mjs), [Chrome](../../scripts/test-t10-browser.mjs), package.json: odbiór odtwarzalny bez AI. `--browser-only` ponawia nowy Chrome na istniejącym produkcyjnym buildzie i nie deklaruje pozostałych testów.
- `scripts/test-t03-api.mjs`: fixture przez admina wobec zamkniętego DML; `scripts/test-t06-http.mjs`: anon oczekuje 401; `scripts/test-t04r1-browser.mjs`: opcjonalny adres serwera wspólnego runnera.
- `.gitignore`, `.vercelignore`: prywatne materiały i lokalna konfiguracja poza przyszłą publikacją.
- README, STATUS, ROADMAP, DECISIONS (D025/D026), CHANGELOG, DATA_MODEL, AI_AND_VOICE, TESTING, OPEN_QUESTIONS, [raport T10](../T10_ACCEPTANCE.md), manifest i ten handoff.

## Weryfikacja

macOS, Node 26.4.0, Next 16.4.0, prawdziwy lokalny Supabase Auth/PostgREST/Storage/Mailpit i Chrome headless. Dokładne polecenia i granice w [T10_ACCEPTANCE](../T10_ACCEPTANCE.md).

- `DO_NOT_TRACK=1 npx supabase migration up --local`: zastosowano migrację T10, bez resetu bazy.
- `DO_NOT_TRACK=1 node scripts/run-local-t05.mjs scripts/test-t10-api.mjs`: sukces, 12 tabel × 3 operacje × A/B/anon daje kod 42501; publikacja/retry/nowa wersja zachowują historię. Kontrola własności 1RM nadal odrzuca cudze ćwiczenie.
- `DO_NOT_TRACK=1 T10_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t10:local`: dwie próby. T03 (Mailpit/Storage/wygasły JWT i 3 testy sesji), T04/T05/T06-R1/T10, lokalne T06 3/3, `npm test` 159 passed/6 skipped (23 aktywne/4 pominięte pliki), produkcyjny build i typy po buildzie przeszły. Druga próba zaliczyła także HTTP T06/T07-R1, T08 i T09 oraz Chrome T04-R1.
- Nowy Chrome T10 wymagał korekt selektorów i oczekiwania na nawigację. Końcowe to samo polecenie z `-- --browser-only`: sukces. Rzeczywisty login, 1RM, start, 75% ze 120 = 90 kg, brak maksimum, seria z utratą odpowiedzi po zapisie/retry tym samym payloadem, pominięcie, 0/null, dodatkowe ćwiczenie/seria, komentarz, koniec, wylogowanie/logowanie, historia, 540 kg w postępie, B 404, anon JSON 401, null JSON 400 i brak pageerror. Syntetyczne dane, prawdziwe HTTP/RPC.
- Chrome T04-R1: desktop 1440×1000, mobile 390×844, modal/fokus, edycja/retry, niezmienność starych wersji i snapshotów. Nowy Chrome T10: 390×844 dla treningu oraz kontekst B 1440×1000. Zrzuty `/private/tmp/t10-workout-mobile.png`, `/private/tmp/t10-progress-mobile.png` oceniono wizualnie; mobilny test szerokości przeszedł.
- `npm audit --omit=dev --audit-level=high`: 0 podatności. `node --check` trzech nowych skryptów: sukces. Syntetyczna kontrola reguł wykluczeń z semantyką Git: sukces; nie jest to manifest wysyłki Vercel.
- Pierwsze kontrole Supabase i npm audit w sandboxie nie miały dostępu do Dockera/DNS; odczyty i testy ponowiono z uprawnieniem. Automatyczny review zatwierdził. Pierwszy pełny runner zatrzymał stary test wymagający 307 zamiast nowego 401; poprawiono. Nowy Chrome miał dokładny selektor select, zbyt wczesne sprawdzenie URL i selektor textarea z wczytaną wartością. Poprawiono i ponowiono samą sekcję. Nie przedstawiamy tych nieudanych całości jako udanych przebiegów.
- Kontrola końcowa: lokalne linki 11 zmienionych dokumentów, zgodność 19 hashy źródeł z manifestem, statusy T09/T10 done oraz T10-R1/T11 todo i identyczność promptu z kopią przekazania — sukces. W projekcie nadal brak Git.

AI w T06/HTTP/głosie jest mockiem/wyłączone. Istniejąca suite źródeł odczytuje zachowane prywatne wyniki lokalnie, nie jest nową próbą dostawcy. Nowe T10 API/Chrome tworzą wyłącznie własne dane syntetyczne. Nie wykonano płatnego AI, fizycznego telefonu, Safari, hostingu, obciążenia ani testu odtworzenia hostowanej bazy. Audyt npm nie zastępuje tych testów.

## Decyzje i zmiany planu

D025 jest potwierdzoną zmianą terminu odbioru przez użytkownika; D026 techniczną poprawką w ramach T10. T09 done lokalnie, T10 przejęto in_progress i zakończono lokalnie; T10-R1 dodano po T11, T11 pozostaje todo. Historyczne handoffy i wyniki pozostawiono bez nadpisywania. T04-R1 i trzy kroki importu zachowują kontrakty; nie dodano trwałego autosave.

## Pozostała praca i blokery

T11 wymaga ustalenia docelowych projektów i dostępu Vercel/Supabase. Nie sprawdzano logowania do usług, nie zakładano projektów, nie przenoszono sekretów ani danych. Przed uploadem trzeba sprawdzić jego manifest, nowe migracje, osobne projekty preview/production, retencję, cron, limity, backup/rollback oraz smoke test dwóch kont. Aktualne dokumenty dostawców należy sprawdzić przy wdrażaniu; dla `.vercelignore` sprawdzono [oficjalne zasady](https://vercel.com/docs/deployments/vercel-ignore) 2026-10-14.

T10-R1 ma gotową listę kroków w raporcie; użytkownik wykona fizyczny review po Vercel. Fizyczne urządzenia, Safari/iPhone i realny hałas nadal niesprawdzone. Ręczne formularze działają bez AI, a testy integracji nie są pomiarem dowolnego dokumentu/mowy.

## Następny krok

T11: rozpocząć od konfiguracji i dostępu do Vercel oraz docelowych środowisk Supabase. Lista kryteriów w ROADMAP i raporcie; T10-R1 wykonać dopiero po działającym HTTPS. T11 nie zostało rozpoczęte w tej sesji.

## Stan środowiska

Runner zakończył Next na 3006 oraz Chrome; kontrola portu nie wykazała nasłuchu. Lokalne konta testowe T10 i obiekty usuwane w finally także po nieudanych próbach. Lokalny Supabase pozostał uruchomiony. Zrzuty syntetyczne i prompt pozostają w `/private/tmp`; brak publikacji. Nie zmieniano `.env`/kluczy, nie tworzono worktree ani agentów. Nowe wykluczenia nie usuwają źródeł. W katalogu projektu nie inicjowano Git; kontrola ignore tworzyła tylko tymczasowe repozytoria w `/private/tmp` i je usunęła.

## Prompt dla kolejnego agenta

Rekomendacja: **gpt-6.1-sol, high** — konfiguracja i integracje przy niższym koszcie niż Astra.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Następny etap: T11 — wdrożenie Vercel/Supabase i instrukcja testera; najpierw ustal docelowe projekty i dostęp do usług. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-14-T10-odbior-lokalny.md, docs/T10_ACCEPTANCE.md, ARCHITECTURE, T03_AUTH, DATA_MODEL, T06_IMPORT, AI_AND_VOICE, DECISIONS, TESTING i WORKFLOW. T09 i T10 są done lokalnie według D025/D026; użytkownik wykona review fizycznego telefonu po Vercel w T10-R1. Przygotuj T11: odrębne środowiska Supabase, migracje (w tym T10), sekrety, limity, cron/retencję, backup/rollback i instrukcję. Odbiór: rzeczywisty HTTPS i smoke test dwóch kont; link podaj dopiero po udanym wdrożeniu. Bloker: konfiguracja/dostęp usług nie były sprawdzone. Nie publikuj fixtures/t06/real ani .env; sprawdź manifest wysyłki i reguły Git/Vercel. Nie uruchamiaj agentów ani płatnych prób AI bez zlecenia i budżetu. Sprawdź aktualną dokumentację dostawców. Nie deklaruj telefonu/Safari jako przetestowanych; szersza beta czeka na T10-R1. Zaktualizuj dokumentację, handoff i identyczny prompt. Rekomendacja: gpt-6.1-sol, high — konfiguracja i integracje przy niższym koszcie niż Astra.
```

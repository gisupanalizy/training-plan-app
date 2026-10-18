# Handoff — T13-B — podgląd planu

- Data i autor: 2026-10-18, Codex — jedyny wykonawca B i integrator; bez innych agentów.
- Zadanie/status po sesji: T13-B review, lokalna bramka B przyjęta przez integratora; A/B pozostają review do niezależnego E. T13 in_progress, C–E todo, C nie rozpoczęto.
- Branch/commit/stan: main, HEAD `c144213`; wszystkie zmiany lokalne, bez commit/push. Na wejściu zastano niecommitowane A/T13-P: README, ARCHITECTURE, CHANGELOG, DATA_MODEL, DECISIONS, OPEN_QUESTIONS, PRODUCT, ROADMAP, STATUS, TESTING, UX, package.json, API workouts, repozytoria workouts/progress oraz nowe dokumenty/prompty/karty T13, migrację22 i moduły/testy A. Zachowano je. Poniższy wykaz opisuje wyłącznie przyrost B.
- Poprzedni rzeczywisty [handoff A](2026-10-17-T13-A-sesje-api-datowanie.md), [podział](2026-10-17-T13-podzial-etapow.md), [specyfikacja](../T13_MOBILE_WORKOUT.md), [karta B](planned/T13-B.md) i [TEMPLATE](TEMPLATE.md).

## Cel i wykonana praca

Odczytano punkty startowe, prompt B, właściwe specyfikacje i faktyczne pliki. Zlecenie użytkownika uruchomiło wyłącznie B, z własnością B/integracji wpisaną najpierw jako in_progress w ROADMAP. A było review z przyjętą bramką, a pliki B/style były zwolnione. Po testach integrator przyjął lokalną bramkę B i ustawił review; nie oznaczono done przed E.

- R01: prywatny plan pokazuje pojedynczy trening. Selektor ma kolejność/nazwę/liczbę ćwiczeń, bez tygodni. Pierwszy jest domyślny; jawny wybór zapisuje ID w localStorage per plan i wersja. Inne/nieaktualne ID wraca do pierwszego, odmowa pamięci nie blokuje ręcznego wyboru. Wybór wersji pozostaje pod natywnym rozwinięciem; archiwum bez startu i wznowienia.
- R02: osiem identycznych serii daje krótkie „8 × 1”, a Wszystkie serie pokazują osiem oddzielnych, pełnych celów. Grupowanie jest sąsiadujące i uwzględnia opcjonalność/uwagi, bez zmiany danych. Różne obciążenia/przerwy, rampa, AMRAP i opcjonalność są rozróżniane; skrót pokazuje dwa pierwsze bloki i liczbę dalszych. Szczegóły zachowują każdą serię, źródło, uwagi, oryginał, wariant/sprzęt, zakres liczby serii i grupę zaleceń. Superseria ma etykietę na karcie.
- R03: podgląd całego planu zawiera wszystkie jednostki z krótkimi zaleceniami oraz wyborem treningu i fokusem nagłówka. Dwie jednostki „A” nie są scalane. Tydzień i uwagi pozostają w kontekście treningu/źródła. Import nie wymagał korekty parsera/edytora: potwierdzono zachowanie dwóch A, tygodni1/2 i16serii przez realne trzy kroki/publikację na syntetycznym drafcie.
- R15 w zakresie B:360/390/430×844 bez poziomego overflow, cztery pełne karty390×844 przed dolną nawigacją, mierzone kluczowe cele44, natywne summary/Enter i fokus po wyborze z całości. Pole daty fokusowano przy390×500. Nie jest to test rzeczywistej klawiatury telefonu.
- R16 w zakresie B: czyste podsumowania planu i snapshotów przekazane C, testy domeny/komponentu i rzeczywiste UI oraz regresje edytora/importu. Historyczną prezentację kg sprawdzono testem helpera; poprawianie historii w nowym UI pozostaje C.

Dotychczasowy WorkoutStart jest tylko opakowany w rozwinięcie na żądanie. Odrębny mount dla jednostki zapobiega przeniesieniu jego pending/date między treningami. B nie zmienia tego pliku ani payloadu: nadal stary date-only; automatyczna godzina, konflikty, finish/delete/replace i nowy klient komend są pracą C. Demonstracyjna gałąź bez Supabase pozostaje wcześniejszym widokiem; bramka B obejmuje rzeczywistą prywatną aplikację.

## Zmienione pliki i przekazanie własności

- [Strona planu](../../src/app/plany/[id]/page.tsx) — wersje w rozwinięciu i autoryzowane dane dla nowego podglądu.
- [PlanPreview](../../src/components/plan-preview.tsx) i [testy komponentu](../../src/components/plan-preview.test.tsx) — selektor/pamięć, archiwum, całe jednostki i kontekst.
- [ExerciseSummary](../../src/components/exercise-summary.tsx) — krótka karta i pełne serie na żądanie, bez formularza zapisu wyniku.
- [presentation.ts](../../src/lib/workouts/presentation.ts) i [testy domenowe](../../src/lib/workouts/presentation.test.ts) — czyste podsumowania i historyczne cele.
- [globals.css](../../src/app/globals.css) — dodane style klas preview i ograniczone style strony planu; bez przebudowy istniejących stylów edytora/importu.
- [Nowy runner](../../scripts/test-t13b-browser.mjs) — syntetyczny Chrome/realne API, przypisany B przez integratora do bramki. Bez nowej zależności/package.json/lockfile.
- README, STATUS, ROADMAP, T13_MOBILE_WORKOUT, UX, DATA_MODEL, ARCHITECTURE, PRODUCT, DECISIONS(D036), TESTING, CHANGELOG i ten rzeczywisty handoff — aktualny stan/dowody/kontrakt.

Pliki B i globals.css zwolnione. C przejmuje wyłącznie swój przydział i style; wspólne podsumowania są kontraktem B dla C, zmiany uzgadnia integrator. Nie zmieniono zastanych plików SQL/API/repozytoriów A, package.json, komponentów C ani edytora/parsera importu. Karty planned są nadal szablonami, nie dowodami wykonania.

## Finalny kontrakt B dla C

`PlanPreviewProps`: planId, versionId, document:PlanEditorDocument, sessionIds w kolejności document.sessions, current, active:(string|null)[] oraz context:TargetContext(date,records,increment). Dane i własność pochodzą z istniejącego odczytu serwera. localStorage `forma:plan-session:<planId>:<versionId>` zawiera tylko ID jednostki; resolveSessionId dopuszcza wyłącznie ID obecne w przekazanej wersji. Nie jest to autoryzacja ani synchronizacja między urządzeniami.

`ExerciseSummary({exercise,index,context?})` daje krótką kartę i natywne szczegóły. `presentationBlocks(exercise)` daje sąsiadujące tablice oryginalnych serii, używając istniejącego seriesBlocks/trainingKeys i rozdzielając opcjonalność/uwagi; nie modyfikuje wejścia. `targetGoal`, `targetLoad`, `setPrescription`, `compactPrescription` formatują cel planu. Dla procentu TargetContext wybiera rzeczywiste 1RM tego samego exerciseId na datę profilu i oblicza tylko bieżący podgląd kg; brak maksimum pozostaje jawny.

`snapshotPrescription(set:WorkoutSet)` formatuje zapisane snapshoty, w tym rounded_target_kg_snapshot, bez dzisiejszego 1RM lub przeliczenia. C używa go do celów wykonania; stan completed/skipped/pending i liczniki dopiero C. Wszystkie te funkcje są czyste, bez zapisu/autoryzacji/wywołania AI. Null i0 mają odrębne etykiety. API A bez zmian; start w archiwum nie jest udostępniany, a ostateczne sprawdzenie aktualnej wersji nadal należy do DB.

## Weryfikacja

Środowisko: macOS, Node26.4, Next16.4, lokalny Supabase CLI2.120/Auth/PostgREST, zastana migracja22. W B nie uruchamiano migracji/resetu. Produkcyjny build Next wyłącznie na localhost3005/3006, headless systemowy Chrome przez Playwright runtime desktopowego. Własne dane UI/DB są syntetyczne. OPENAI_API_KEY puste, OPENAI_IMPORT_ENABLED/OPENAI_VOICE_ENABLED false, RUN_T06_LIVE/RUN_T09_LIVE false. Brak nowych płatnych prób.

1. `OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false DO_NOT_TRACK=1 npm test`: **190 passed/9 skipped**,26 plików passed/5 skipped.10 nowych przypadków B (6 domenowych/4 komponentowe) obejmuje8/7+1, rampę/uwagi, AMRAP/czas/dystans, whole optional range, procent/wariant/null/0/historyczny snapshot, szczegóły, wybór/wersje i odmowę pamięci. Komponenty używają mocków pamięci/startu; nie są dowodem realnego API. Istniejące regresje importu korzystają także z zachowanych lokalnych fixtures historycznych, bez nowego odczytu przez dostawcę i bez wysyłania ich do UI tej sesji.
2. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs build`: PASS. Finalny build po ostatnich zmianach ponowiony przez `npm run test:t07r1:http` poniżej, następnie `npm run typecheck`: PASS. Nie uruchamiano typów równocześnie z buildem.
3. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs start`, potem `T13B_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t13b-browser.mjs` z tymi samymi flagami: **PASS**. Własne konto/Auth, rzeczywisty RPC zapisuje plan, przeglądarka pobiera i klika prawdziwy Next. Selekcja/reload/fallback/wersje/start aktualnej/wznowienie i brak startu archiwum. Serie8, rampa70kg, AMRAP/opcjonalna, oryginały/uwagi/źródło, null i0, cały plan, Enter/fokus/cele44. Trzy kroki syntetycznego importu/reload/publikacja zachowały dwie A oraz16serii/uwagi/tygodnie; wyłącznie adapter zastąpiony syntetycznym draftem przez admina testowego, bez AI. Brak pageerror w finalnym scenariuszu.
4. Dokładny pomiar kart:360/390 px góry332;437,80;560,39;666,19, dół czwartej763,984375;430 px dół747,1875. Nawigacja zaczyna się na782. Dla390 spełnione cztery pełne karty przy scrollY0; również360 cztery się mieszczą. Brak overflow na trzech szerokościach. Mierzono selektor, summary serii/kontekstu/startu, Edytuj plan i input daty — co najmniej44×44. Zrzuty `/private/tmp/t13b-360.png`, `/private/tmp/t13b-390.png`, `/private/tmp/t13b-430.png` obejrzano; czytelne etykiety/cele/oznaczenia i widoczne cztery karty. Obniżenie viewportu do390×500/fokus daty nie emuluje klawiatury systemowej.
5. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false T04R1_HTTP_BASE=http://localhost:3005 T04R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t04r1-browser.mjs`: **PASS**. Syntetyczne konto, realny edytor, karty/jeden trening/modal/cancel/przeniesienie/superserie/mobile/fokus i publikacja, kontrolowana utrata odpowiedzi/retry bez drugiej wersji, stare snapshoty i nieukończony nowy szkic.
6. `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false npm run test:t07r1:http`: **PASS**. Finalny build i Next3006, prawdziwe Auth/API/Storage A/B/anon, syntetyczny mock adaptera, źródło/korekta/reload/progress, podpisany upload/formaty, publikacja/retry. Bez modułu prywatnych źródeł i bez płatnego AI. Runner zatrzymał swój3006.
7. `node --check scripts/test-t13b-browser.mjs`, `git diff --check`: PASS. Końcowa kontrola linków, bloków Markdown, whitespace i identyczności promptu: PASS (lokalny skrypt `/private/tmp/check-t13b-docs.py`).

Początkowe błędy nie są zaliczone jako sukces: socket Dockera niedostępny w sandboxie, ponowienie z uprawnieniem przeszło. Node26 nie dostarczał localStorage w jsdom — dodano jawny mock. Naprawiono powtarzające się klucze React i odrębny mount startu. Pierwsze dwa pomiary czwartej karty do876,38 i835,67 nie spełniły bramki; zmieniono gęstość nagłówka/flag/skrótów, końcowo763,98. Test starej wersji czytał select przed nawigacją; dodano oczekiwanie na URL i docelowy wybór. Po korekcie gramatyki opcjonalnej serii poprawiono asercję tekstu. Właściwe testy powtórzono z sukcesem. Nie ponawiano całej migracyjnej/concurrency bramki A, ponieważ B nie zmienia SQL/API.

## Decyzje i zmiany planu

D036 — lokalna preferencja ID, źródłowy kontekst tygodnia, czyste podsumowania i izolacja startu między jednostkami. Wymagania R01–R16 i zależności niezmienione; nie dodano nowego zakresu produktu. R03 nie wymagał przejęcia warunkowych plików edytora/importu. Integrator przydzielił B nowy syntetyczny runner bramki, bez zależności. T13-B in_progress → review po przyjętej lokalnej bramce, A/B review do E. C gotowe technicznie po osobnym zleceniu, C–E niewykonane. T11/T10-R1 i budżet AI bez zmian.

## Pozostała praca i blokery

Brak znanego blokera lokalnej bramki B. C musi wdrożyć nowy UI sesji/konfliktów/czasu, D kalendarz, E niezależnie ocenić A–D. Nie uznawać starego date-only formularza startu za wdrożony automatyczny czas C. Wersja demonstracyjna bez konfiguracji Supabase nie była przedmiotem przebudowy prywatnego podglądu. Fizyczna klawiatura telefonu, Safari/iPhone i urządzenia nadal niewykonane; pozostają w T10-R1, nie zamykają lokalnej bramki B. Brak nowego wdrożenia produkcji.

## Następny krok

Po osobnym zleceniu użytkownika **tylko T13-C**. Najpierw przejąć pliki C i globals.css, przeczytać realne handoffy A/B oraz klienta startu/wykonania, reużyć snapshotPrescription. Nie uruchomiono C ani następnego chatu. Rekomendacja użytkownika GPT-6.1 Sol/high: stan szkiców i asynchroniczna trwałość wymagają dokładności; ograniczenie do C kontroluje koszt.

## Stan środowiska

Zastany lokalny Supabase pozostaje uruchomiony z migracją22; nie zmieniono jego konfiguracji, konta właściciela ani istniejących planów. Własne serwery Next3005/3006 zostały zatrzymane; inne procesy pozostawiono. Każdy wykonany runner usunął własne syntetyczne konta w finally (także po niezaliczonych pomiarach); z nimi kaskadowo usunięto ich plany/importy/treningi. Runner HTTP sprzątnął własne obiekty Storage. Obrazy w `/private/tmp` zawierają tylko syntetyczny plan; pliki pomocnicze promptu/kontroli dokumentacji nie zawierają sekretów. Repo ma nadal zmiany A/T13-P i B bez commit/push, bez edycji .env/konfiguracji AI/usług. Żadnych działań produkcyjnych ani płatnych prób.

## Prompt dla kolejnego agenta

Rekomendacja: GPT-6.1 Sol / high — zgodnie z przydziałem C; precyzja stanu szkiców i komend uzasadnia koszt, a pojedynczy etap ogranicza zakres. Prompt do ręcznego użycia po osobnym zleceniu, nie uruchamia pracy.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy.
Po osobnym zleceniu użytkownika wykonaj tylko T13-C — prowadzenie treningu. Zacznij od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/WORKFLOW.md oraz docs/handoffs/2026-10-18-T13-B-podglad-planu.md i docs/handoffs/2026-10-17-T13-A-sesje-api-datowanie.md. Przeczytaj docs/prompts/T13-C.md, docs/T13_MOBILE_WORKOUT.md, UX, DATA_MODEL, DECISIONS i TESTING. Sprawdź rzeczywiste pliki: A/B są review z przyjętymi lokalnymi bramkami; C–E niewykonane, T09 gotowe lokalnie.
Zakres: tylko R04–R11/R13/R15/R16 i pełna bramka C. Zwarty przegląd, szczegóły ćwiczenia z jedną serią, rundy superserii, opcjonalne/dodatkowe/pominięte osobno, Wszystkie serie i historyczna poprawka. Zapis bez reload i utraty szkiców; przejście po ACK i odczycie, retry identycznej pełnej komendy, obsługa 409/błędu odczytu, zapisz/odrzuć/zostań, powrót/scroll/fokus. Konflikt aktywnych i indywidualne legacy, powrót/finish/delete z dodatkowym potwierdzeniem oraz atomowy replace przez A. Finish z korektą czasu bez przeliczania snapshotów; głos jako zatwierdzana propozycja zakotwiczona w serii i rewizji.
Przejmij wyłącznie pliki C i globals.css według specyfikacji. Reużyj czystych podsumowań B w src/lib/workouts/presentation.ts i src/components/exercise-summary.tsx; snapshotPrescription czyta zapisane kg bez dzisiejszego 1RM. Nie zmieniaj SQL/API ani nie zaczynaj D. Sprawdź prawdziwą lokalną aplikację/API przy 360/390/430 px, cztery karty 390×844, fokus/cele44, sieć/retry/409, inne szkice, superserie, null/0, historyczną poprawkę, mock opóźnionego głosu i ponowne logowanie; adekwatne regresje, npm test, build, potem typecheck.
Brak znanego blokera technicznego. Lokalny Supabase pozostał z migracją22; serwery3005/3006 zatrzymane. Wymagane osobne zlecenie C i dostępne lokalne DB/API/UI; brak środowiska blokuje odbiór. Jeden wykonawca i integrator, bez innych agentów, produkcji i płatnego AI. Zachowaj zastane niecommitowane zmiany. Zaktualizuj dokumentację i utwórz rzeczywisty handoff z identycznym promptem następnej sesji w handoffie i odpowiedzi. C pozostaje review do niezależnego E.
Model: GPT-6.1 Sol / high — stan szkiców, asynchroniczne odpowiedzi i trwałe komendy uzasadniają high; ograniczenie do C kontroluje koszt.
```

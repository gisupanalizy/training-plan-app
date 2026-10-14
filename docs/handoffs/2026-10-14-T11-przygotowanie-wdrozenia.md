# Handoff — T11 — przygotowanie wdrożenia

- Data i autor: 2026-10-14, Codex; bez innych agentów.
- Zadanie/status: T11 przejęto jako in_progress, po niezależnym przygotowaniu pozostaje **blocked** przez brak wskazanych celów i dostępu usług. T09/T10 done lokalnie; T10-R1 todo, użytkownik po Vercel.
- Git: nadal brak `.git`, bez commitu/push/worktree. Zmiany tylko lokalne; nie tworzono projektów i nie wykonano uploadu.
- Poprzedni punkt wejścia: [handoff T10](2026-10-14-T10-odbior-lokalny.md).

## Cel i wykonana praca

Przeczytano AGENTS/README/STATUS/ROADMAP, handoff T10 oraz wskazane specyfikacje, decyzje, testy i workflow. Przygotowano T11 w zakresie niezależnym od dostępu: [procedurę operatora](../T11_DEPLOYMENT.md), [instrukcję testera](../TESTER_GUIDE.md), listę dozwolonych plików wysyłki i odtwarzalny lokalny manifest. Nie uznano przygotowania za wdrożenie lub ukończone T11. Ręczne ścieżki i AI nie zostały zmienione.

Sprawdzono obecność lokalnych powiązań, znanych plików logowania oraz nazw zmiennych bez drukowania ich wartości. Brak `.vercel/project.json`, refa hostowanego Supabase i tokenów w procesie. Lokalny `.env` nadal istnieje i nie został skopiowany/zmieniony. Dostęp do usług sprawdzono przez rzeczywiste wywołania CLI: Supabase odmówiło listy projektów bez tokenu, Vercel odmówił dry-run bez poświadczeń. Nie odczytano zdalnych projektów ani ustawień konta. Integracje Supabase/Vercel odnaleziono jako dostępne, niezainstalowane; umożliwiono ich wybór, ale instalacja/połączenie nie zostały potwierdzone. Zapytano użytkownika o cele i dostęp; na koniec sesji brak odpowiedzi.

Oficjalne źródła Vercel/Supabase/OpenAI sprawdzono 2026-10-14; odnośniki znajdują się bezpośrednio przy regułach w procedurze. Odkryto warunki do zamknięcia: 5 MiB audio plus multipart przekracza 4,5 MB Vercel, domyślny SMTP Supabase nie dostarcza zaproszeń kolegom spoza zespołu, cron produkcji nie obsłuży preview tego samego projektu, cleanup usuwa najwyżej 50 importów na wywołanie. Backup DB nie zawiera bajtów Storage. Nie wdrożono automatycznie poprawek produktu/schedulera; limit audio i parametry recovery pozostają propozycjami do ustalenia. Nie zmieniano modeli ani taryf aplikacji, nie wywoływano AI i nie przyznawano budżetu.

## Zmienione pliki

- [.vercelignore](../../.vercelignore): domyślne wykluczenie i jawna lista źródeł builda; całe docs/fixtures/supabase i testy poza paczką.
- [prepare-t11-deploy.mjs](../../scripts/prepare-t11-deploy.mjs): bez sieci i czytania .env tworzy nową kopię tymczasową, porównuje hashe, odrzuca dowiązania/env/klucze i rozpoznane formaty sekretów. Wymaga przeglądu po zmianie 20 migracji. Nie jest pełnym skanerem sekretów.
- [verify-t11-package.mjs](../../scripts/verify-t11-package.mjs): kontrola syntetycznych ścieżek Git/Vercel, zgodności manifestu i odmowy env/sekretu/dowiązania w osobnych kopiach; usuwa je w finally.
- [Manifest kandydata](../reports/2026-10-14-T11-release.json): 94 pliki, 767 227 B, SHA-256 listy `a462032bf0ae24c5cfd4c6fcf633f154483bc6bc9cc115370999141db15ec892`; osobny wykaz 20 migracji. To lokalny kandydat z `uploaded:false`, nie manifest faktycznej wysyłki Vercel. Żadnej migracji nie dodano ani nie zastosowano w tej sesji.
- [T11_DEPLOYMENT](../T11_DEPLOYMENT.md), [TESTER_GUIDE](../TESTER_GUIDE.md): cele/dostęp, dwa środowiska, sekrety, migracje, SMTP, limity/AI, logi, cron/backlog, backup/restore/rollback i szczegółowy smoke oraz instrukcja bez fikcyjnego adresu.
- README, STATUS, ROADMAP, ARCHITECTURE, T03_AUTH, TESTING, OPEN_QUESTIONS, DECISIONS (D027), CHANGELOG i ten handoff: aktualny stan oraz ograniczenia. T03_AUTH prostuje przestarzały opis wykonania T01 i zakazu klucza administracyjnego w całej aplikacji — od T06 klucz jest potrzebny wyłącznie serwerowi importu/cleanup.

## Weryfikacja

macOS, Node 26.4.0. Czysty pakiet zawiera tylko źródła builda, bez .env, fixtures i testów; konfiguracja Supabase jest nieobecna, więc ten build sprawdza składanie pakietu w trybie bez usług. Nie dowodzi ustawień hostowanego runtime.

- `node --check scripts/prepare-t11-deploy.mjs` oraz `node --check scripts/verify-t11-package.mjs`: sukces.
- `node scripts/prepare-t11-deploy.mjs --stage`: sukces; 94 pliki i 20 hashy migracji; kopia w ścieżce podanej w manifeście. Worker PDF.js nie jest uploadowany — odtwarza go prebuild.
- `node scripts/verify-t11-package.mjs`: sukces. Git check-ignore na tymczasowych repozytoriach potwierdził prywatne ścieżki i wymagane źródła; to semantyka Git, nie rzeczywisty Vercel. Osobne kopie odrzuciły env, syntetyczny sekret i symlink bez wypisania treści; zgodne hashe źródeł i migracji.
- W katalogu kopii: `npm ci --offline --ignore-scripts --no-audit --no-fund`: sukces (cache lokalne, bez skryptów zależności). Następnie `NEXT_TELEMETRY_DISABLED=1 OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run build` i `npm run typecheck`: sukces. Runner usunął z dziedziczonego procesu zmienne OpenAI/Supabase/Vercel/APP_ENV; nie czytał lokalnego .env. Nie sprawdzano Node 24 ani buildu w Vercel.
- `DO_NOT_TRACK=1 node_modules/.bin/supabase projects list --output json`: exit 1, brak access token; odpowiedzi/sekretów nie drukowano. `DO_NOT_TRACK=1` CLI `db push --help` i `db dump --help` potwierdziły składnię dry-run i skip-vault; nie uruchamiano ich na bazie zdalnej.
- `npm view vercel version`: 64.0.2. `npm install --prefix /private/tmp/apka-t11-vercel-cli --no-save --ignore-scripts --no-audit --no-fund vercel@64.0.2`: sukces z uprawnieniem sieciowym, bez zmiany package.json/lock projektu. Ostrzeżenie engine zależności narzędzia dotyczyło Node 26, pakiet zaleca 20/22/24. Nie jest to błąd buildu aplikacji.
- `DO_NOT_TRACK=1 /private/tmp/apka-t11-vercel-cli/node_modules/.bin/vercel --global-config /private/tmp/apka-t11-vercel-config deploy --dry --format=json --non-interactive`: exit 1, `No existing credentials found`. Manifest dostawcy **nie powstał**, uploadu nie było. Nie używano wdrożenia anonimowego ani fikcyjnego powiązania/tokenów.

Kontrola końcowa: 12 zmienionych dokumentów/99 lokalnych linków, zgodność hashy 94 źródeł (także kopii po buildzie) i 20 migracji, statusy T09/T10 done, T10-R1 todo, T11 blocked oraz identyczność promptu z kopią przekazania — sukces. `node scripts/verify-t11-package.mjs` ponowiono bez zmiany manifestu: sukces.

Błędy narzędzi rozpoznano i odnotowano: początkowy Vercel próbował utworzyć globalną konfigurację poza sandboxem; powtórzono z lokalną konfiguracją w /private/tmp. Jedno `supabase db push --help` bez DO_NOT_TRACK próbowało zapisać telemetry w ~/.supabase i zostało odrzucone; powtórka z DO_NOT_TRACK przeszła. Pierwsze npm ci z redundantnym --prefix zwróciło usage; zwykłe ci z cwd kopii przeszło. Pierwsza ręczna próba testu guardów nie utworzyła pustego public/ w kopii i przerwała baseline; poprawiony odtwarzalny verify tworzy katalog i przechodzi. Nie było odrzucenia automatycznej oceny uprawnień wymagającego decyzji użytkownika; do odczytu npm i instalacji tymczasowego CLI nadano uprawnienie.

Nie uruchamiano ponownie całej suite 159 testów T10 ani audytu npm aplikacji: kod domeny/API i zależności nie zmieniły się. Nie wykonano hostowanych migracji, Auth/SMTP/Storage, manifestu/uploadu Vercel, HTTPS/smoke A/B/anon, testów limitów na hostingu, cron/restore, telefonu/Safari ani płatnego AI. Żadnej z tych pozycji nie deklarujemy jako passed.

## Decyzje i zmiany planu

D027 dokumentuje bezpieczny pakiet i wymaganie potwierdzonych celów/dostępu; nie wybiera organizacji/projektu ani planu kosztowego. T11 przejęto in_progress, następnie blocked z konkretnym krokiem odblokowania. Zachowano ID i zależności oraz done lokalnie T09/T10; T10-R1 todo po T11. CHANGELOG zapisuje powód. Nie uruchomiono nowego agenta, schedulera ani kolejnego zadania.

## Pozostała praca i blokery

Wymagana odpowiedź użytkownika: konto/zespół/projekt Vercel, dwa różne refy Supabase, dostęp integracji/CLI; przy tworzeniu nowych zasobów organizacja/region i koszt. Sekretów nie żądać w chacie. Następnie ustalić SMTP, koszty/AI i operatora, potwierdzić projekty odczytem, wykonać oficjalny dry-run, backup/migracje/konfigurację, rozwiązać ograniczenia transportu/cleanup i przejść odbiór zdalny. Instrukcja testera i procedura recovery są przygotowane, ale nie przetestowane na usługach.

## Następny krok

Kontynuować **T11** po konkretnym odblokowaniu powyżej. Zacząć od odczytu potwierdzonych projektów/usług i wpisania faktów do T11_DEPLOYMENT, nie od uploadu. Nie przechodzić automatycznie do T10-R1 ani T12. T10-R1 wykona użytkownik po udanym wdrożeniu; szersza beta czeka.

## Stan środowiska

Nie uruchomiono serwera aplikacji, testów DB ani kont testowych. Lokalnego Supabase nie zatrzymywano ani nie modyfikowano. Kopia release z node_modules/.next i odtworzonym workerem istnieje w katalogu tymczasowym wskazanym przez manifest; nie jest wdrożeniem. CLI Vercel i oddzielna niesekretna konfiguracja pozostają w /private/tmp/apka-t11-vercel-cli i /private/tmp/apka-t11-vercel-config, pusty wynik dry-run w /private/tmp/apka-t11-vercel-dry.json, prompt w /private/tmp/apka-t11-next-prompt.txt. Kopie testów zabezpieczeń usunięto. Nie kopiowano prywatnych danych do katalogów tymczasowych. Lokalny .env pozostał bez zmian; .vercel ani Git nie utworzono w projekcie.

## Prompt dla kolejnego agenta

Rekomendacja: **gpt-6.1-sol, high** — konfiguracja i integracje przy niższym koszcie niż Astra. To rekomendacja, bez uruchamiania lub zmiany modelu.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T11 po wskazaniu przez użytkownika zespołu/projektu Vercel, dwóch różnych refów Supabase preview/production i zapewnieniu dostępu; nie zgaduj celów. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md, docs/T11_DEPLOYMENT.md, docs/TESTER_GUIDE.md oraz ARCHITECTURE, T03_AUTH, DATA_MODEL, T06_IMPORT, AI_AND_VOICE, DECISIONS, TESTING i WORKFLOW. T09/T10 są done lokalnie (D025/D026), T11 blocked, T10-R1 należy do użytkownika po wdrożeniu. Przygotowano paczkę 94 plików, wykaz 20 migracji, instrukcje i testy zabezpieczeń; build/typy czystej kopii przeszły. Oficjalny manifest Vercel, hosting i smoke nie zostały wykonane z braku poświadczeń. Ustal też SMTP, koszty, region i operatora. Sprawdź aktualne dokumenty dostawców; odśwież manifest skryptami T11 i wykonaj oficjalny dry-run przed uploadem, migracje z T10, izolację sekretów, cron/retencję preview i produkcji, backup/restore i rollback. Rozwiąż transport audio 5 MiB wobec 4,5 MB Vercel oraz backlog cleanup ponad 50. Zmiany kontraktu przedstaw jako propozycje. Odbiór: rzeczywisty HTTPS i pełny smoke A/B/anon; link dopiero po sukcesie. Nie publikuj fixtures/t06/real ani .env, nie uruchamiaj agentów, płatnego AI ani nowych płatnych usług bez zlecenia i budżetu. Nie deklaruj telefonu/Safari jako sprawdzonych; szersza beta czeka na T10-R1. Zaktualizuj dokumentację, handoff i identyczny prompt. Rekomendacja: gpt-6.1-sol, high — konfiguracja i integracje przy niższym koszcie niż Astra.
```

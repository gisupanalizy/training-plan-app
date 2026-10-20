# Plan treningowy

Aplikacja webowa do importowania planów treningowych i zapisywania ich wykonania, projektowana przede wszystkim na telefon. Wersja testowa dla właściciela projektu i kolegów, z osobnymi kontami.

**T16-D poprawka — 2026-10-20:** przy 390×844 główny zapis serii kończy się nad dolną nawigacją. D046 kart zostaje. T16-I nie był powtórzony i nie zamyka programu. [Handoff poprawki](docs/handoffs/2026-10-20-T16-D-widocznosc-zapisu.md), [raport odrzuconej bramki](docs/reports/2026-10-19-T16-I-tempo-acceptance.md). Bez publikacji.

**T13-C lokalnie — 2026-10-18:** A/B/C w `review` z przyjętymi lokalnymi bramkami. Przegląd czterech kart, jedna seria, rundy superserii, szkice i retry bez reload, konflikty/legacy oraz finish z korektą czasu działają w lokalnym Chrome/API. 198 testów, build i typy PASS. [Rzeczywisty handoff C](docs/handoffs/2026-10-18-T13-C-prowadzenie-treningu.md). D–E niewykonane; D wymaga osobnego zlecenia. Bez publikacji produkcji.

**T13-B lokalnie — 2026-10-18:** A/B w `review` z przyjętymi lokalnymi bramkami. Podgląd ma wybór pojedynczego treningu bez tygodni, pamięć planu/wersji, krótkie karty i Wszystkie serie oraz podgląd całości. Rzeczywiste lokalne360/390/430 px, cztery karty390×844, regresje edytora/importu,190 testów, build/typy PASS. [Rzeczywisty handoff B](docs/handoffs/2026-10-18-T13-B-podglad-planu.md). C–E niewykonane; C wymaga osobnego zlecenia. Bez publikacji produkcji. [STATUS](docs/STATUS.md).

**Stan na 2026-10-16:** T01–T08, T06-R1, T07-R1 i T04-R1 ukończone lokalnie. T09 jest zakończone lokalnie po decyzji D025: użytkownik wykona review na fizycznym telefonie po Vercel (T10-R1). T06-R1 dodał odczyt rzeczywistych tabel, zakresy i serie opcjonalne, AMRAP, superserie, pytania z kontekstem oraz pełny podgląd PDF.js i XLSX. Prywatne źródła i wyniki są lokalnymi materiałami testowymi za zgodą użytkownika. T07-R1 dodał trzy kroki, kompaktowe karty ćwiczeń, ankietę i źródło na żądanie. T04-R1 uprościł także ręczny edytor: jeden trening, podgląd całości i edycja bloków w oknach. T08 ma prywatny postęp, a T09 implementację transkrypcji i propozycji. Wyniki i ograniczenia: [STATUS](docs/STATUS.md) i [lokalny odbiór T10](docs/T10_ACCEPTANCE.md). T11 jest w toku: ustalono produkcyjne projekty Vercel/Supabase i zakończono porządkowanie zmiennych T11-E1; 21 migracji produkcji (w tym T10 i T11-C1/PT409) zastosowano, kod wdrożono i rzeczywisty smoke HTTP/Auth/API/Storage A/B/anon przeszedł. D029: na teraz tylko Production do testów właściciela: [Forma](https://training-plan-app-seven.vercel.app). Auth URL i minimum12 zapisane; cron zwrócił200 na pustej kolejce. D031: priorytetem są testy prototypu właściciela i testy włączonego importu AI i krótkiego głosu w zatwierdzonych5USD na start; dalszy backup/restore odłożony. Pełny odbiór usług i fizycznych telefonów pozostaje otwarty.

**Makiety T14-R5 — 2026-10-18:** wszystkie układy wybrane, **Profil A i domyślna Noc** potwierdzone. [Galeria syntetyczna](docs/design/t14-full-gallery.html), [specyfikacja wyborów](docs/design/t14-selected-spec.md), [osobne porównanie palet](docs/design/t14-colors.html). Postęp ma dwa typy ćwiczeń, pomoc obliczeń1RM i informacje otwierane wyłącznie punktem, zamykane kliknięciem poza nim. PR obsługują swipe. Ręczny1RM profilu pozostaje oddzielony. Prywatny PDF/galeria poza repo. Nadal makiety, bez wdrożenia aplikacji.

**Plan T15 gotowy do review:** [etapy A–G, pliki i bramki](docs/T15_UI_IMPLEMENTATION.md), [prompt startowy A](docs/prompts/T15-A.md), [handoff R5/P](docs/handoffs/2026-10-18-T14-R5-T15-P-interakcje-i-plan.md). Jeden integrator, siedem promptów i kart przyszłych handoffów; D/E starego T13 nie są dublowane. Implementacja i inni agenci nie zostali uruchomieni.

**T15 lokalnie zamknięte:** A–G i odbiór T13-E są done lokalnie po D046. Przewinięcie listy, także gdy pasek zasłania dół karty, nie jest błędem. [Handoff](docs/handoffs/2026-10-19-T15-G-niezalezny-odbior.md). Telefon, Safari i publikacja pozostają osobno.

## Zacznij tutaj

- [Zakres produktu](docs/PRODUCT.md) — wymagania, założenia i granice pierwszej wersji.
- [Plan zadań](docs/ROADMAP.md) — kolejność, zależności, statusy i kryteria odbioru.
- [Aktualny stan](docs/STATUS.md) — punkt wejścia do następnej sesji.
- [Instrukcje dla agentów](AGENTS.md) i [sposób współpracy](docs/WORKFLOW.md).
- [Architektura](docs/ARCHITECTURE.md), [model danych](docs/DATA_MODEL.md), [AI i głos](docs/AI_AND_VOICE.md).
- [Scenariusze ekranów](docs/UX.md) i [plan weryfikacji](docs/TESTING.md).
- [Decyzje](docs/DECISIONS.md), [otwarte pytania](docs/OPEN_QUESTIONS.md), [historia zmian](docs/CHANGELOG.md).
- [Konta i konfiguracja T03](docs/T03_AUTH.md), [kontrakt importu T06](docs/T06_IMPORT.md), [handoff kontynuacji T09](docs/handoffs/2026-10-13-T09-obsluga-bledu-rejestratora.md), [handoff próby emulatora](docs/handoffs/2026-10-13-T09-odbior-emulator.md), [szablon handoffu](docs/handoffs/TEMPLATE.md).

## Kierunek techniczny

Prototyp używa Next.js 16.4.0, React 19.3.0 i TypeScript 5.9.3. Lokalna integracja Supabase Auth, PostgreSQL i prywatnego Storage jest wykonana w T03; T04 publikuje plan transakcyjnie, a T05 zapisuje wykonanie przez osobną transakcyjną funkcję SQL. T06 dodaje serwerowy adapter OpenAI i ścieżkę importu; wyniki prawdziwych prób i ograniczenia są w [raporcie T06](docs/T06_IMPORT.md). T09 korzysta z `gpt-transcribe` i `gpt-6-luna` wyłącznie po osobnym włączeniu i ustawieniu budżetu; limit 0,50 USD dotyczył tylko ewaluacji w tej sesji i nie włącza głosu w aplikacji. Vercel ma build Ready, a hostowany Supabase 21 migracji; pełny odbiór pozostaje w T11. Logika treningowa nie zależy od modelu.

Najpierw działający dziennik z ręcznym wprowadzaniem danych, następnie import PDF/XLSX/zdjęć/tekstu oraz dyktowanie planów, wyników i komentarzy. Pełna beta obejmuje wszystkie te sposoby wprowadzania danych.

## Uruchamianie prototypu

Wymagany Node.js 22.13 (linia 22) lub 24+ ze względu na PDF.js i npm. Sam prototyp demonstracyjny działa bez kluczy ani pliku `.env`.

```sh
npm ci
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000). Bez konfiguracji Supabase działa tryb demonstracyjny. Po skonfigurowaniu Supabase dostęp wymaga konta testera: w „Planach” można utworzyć prywatny plan A/B, edytować go przez nową wersję i obejrzeć wcześniejsze wersje lub zaimportować PDF/XLSX/zdjęcie/tekst przez ekran korekty. Import AI wymaga osobnej konfiguracji klucza i budżetu zgodnie z [T06_IMPORT](docs/T06_IMPORT.md). W „Profilu” można dodać rzeczywiste 1RM z datą oraz zmienić krok zaokrąglenia. W dniu planu można rozpocząć trening, zapisać lub pominąć serię, dodać serię/ćwiczenie i komentarz, a potem wrócić do niego w „Historii”. Cel procentowy zostaje skopiowany przy starcie; brak maksimum pozostawia kg puste. Dyktowanie jest dostępne w edytorze planu oraz przy serii, komentarzu i dodatkowym ćwiczeniu. Głos wymaga `OPENAI_API_KEY`, `OPENAI_VOICE_ENABLED=true` i dodatniego, uzgodnionego `OPENAI_VOICE_BUDGET_USD`; ręczne formularze działają bez niego.

Sprawdzenia: `npm run typecheck`, `npm test`, `npm run build`. Test T02: `bash scripts/test-db.sh` wymaga Dockera i obrazu `postgres:16`. Test T03: `npm run test:t03:local` wymaga lokalnego Supabase z Mailpit. Test T04: `npm run test:t04:local`. Test T05: `npm run test:t05:local`. Po `npx supabase start` i `npx supabase migration up --local` uruchom `npm run test:t06:local` oraz `npm run test:t06:http`; zasady prawdziwych prób AI i szczegóły: [T06_IMPORT](docs/T06_IMPORT.md). Test T09: `DO_NOT_TRACK=1 npm run test:t09:local`; opcjonalnie `T09_HTTP_BASE=http://localhost:3005` z produkcyjnym serwerem Next. Prawdziwa ewaluacja T09 jest wyłączona bez osobno uzgodnionego budżetu. `.env.example` zawiera wyłącznie nazwy zmiennych.

Sprawdzenia T06-R1: `npm run test:t06r1:local`, pełny podgląd i audit źródeł zgodnie z [TESTING](docs/TESTING.md). Nazwy ćwiczeń: [słownik PL/EN](docs/EXERCISE_NAMES.md). Migracje T06-R1 trzeba zastosować przed uruchomieniem nowego kodu; starsze szkice są nadal obsługiwane.

Odbiór nowego przeglądu importu: `npm run test:t07r1:http`, z opcjonalnym `T07R1_PLAYWRIGHT_MODULE` według TESTING. Korekta przywraca krok po odświeżeniu; publikacja wymaga potwierdzenia ćwiczeń oraz parametrów i rozwiązania pytań.

Ręczny edytor pokazuje jeden wybrany trening i krótkie karty. „Edytuj serie” zmienia blok albo pojedynczą serię; dodatkowe pola i zakresy są otwierane na żądanie. „Zastosuj zmiany” aktualizuje szkic, a „Opublikuj nową wersję” zapisuje cały plan. Szkic nie ma automatycznego trwałego zapisu. Odbiór syntetyczny Chrome: `T04R1_PLAYWRIGHT_MODULE=/absolutna/sciezka/playwright/index.mjs DO_NOT_TRACK=1 npm run test:t04r1:http` według TESTING, z modułem runtime desktopowego i lokalnym Supabase. AI jest wyłączone.

T10 zamyka bezpośredni zapis katalogu i tabel planu przez klienta (migracja `20261014100000_t10_plan_write_boundary.sql`); aplikacja nadal publikuje transakcyjnie. Błędne wejście API jest odrzucane jako JSON 400, a prywatne API bez sesji zwraca JSON 401. Prywatne `fixtures/t06/real` i lokalne `.env*` są wykluczone z publikacji plikami `.gitignore`/`.vercelignore`.

Lokalny odbiór: `DO_NOT_TRACK=1 T10_PLAYWRIGHT_MODULE=/absolutna/sciezka/playwright/index.mjs npm run test:t10:local`. Runner korzysta z lokalnego Supabase/Mailpit, jednego produkcyjnego builda i Chrome; AI wyłącza. Szczegóły i lista fizycznego odbioru po Vercel: [T10_ACCEPTANCE](docs/T10_ACCEPTANCE.md). T11 wymaga konfiguracji docelowych usług; samo przejście testów lokalnych nie jest wdrożeniem.

Przygotowanie wdrożenia T11: [procedura operatora](docs/T11_DEPLOYMENT.md), [instrukcja testera](docs/TESTER_GUIDE.md) i [handoff](docs/handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md). `node scripts/prepare-t11-deploy.mjs --stage` tworzy kopię tylko źródeł builda i lokalny manifest SHA-256 bez uploadu. `node scripts/verify-t11-package.mjs` sprawdza hashe i zabezpieczenia paczki. Pełny dry-run Vercel wymaga zalogowania i powiązania wskazanego projektu; lokalny manifest nie jest dowodem publikacji. Rzeczywisty smoke HTTP dwóch kont przeszedł po T11-C1; samo Ready nadal nie zastępuje pozostałych warunków T11.

Konfiguracja Marketplace Supabase (T11-E1): aplikacja czyta automatyczne `NEXT_PUBLIC_STORAGE_SUPABASE_URL`, `NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY` i serwerowe `STORAGE_SUPABASE_SECRET_KEY` (z fallbackami anon/service_role). Nie trzeba kopiować kluczy pod drugą nazwą. Ręczne ustawienia to APP_ENV, dwa refy, CRON_SECRET i cztery flagi/budżety AI. [Dokładna konfiguracja](docs/T11_DEPLOYMENT.md#2-izolacja-środowisk-i-konfiguracja--t11-e1-2026-10-16). Dotychczasowe nazwy pozostają dla środowiska lokalnego; niepełnej rodziny integracji nie mieszamy z ręczną.

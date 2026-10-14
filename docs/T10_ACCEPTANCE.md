# T10 — lokalny odbiór przed wdrożeniem

Data: 2026-10-14. Właściciel: Codex, bez innych agentów. Status: lokalny odbiór zakończony. Katalog bez Git; identyfikatorów commitów nie ma. Zmiany i wyniki: [handoff T10](handoffs/2026-10-14-T10-odbior-lokalny.md). Identyfikację źródeł daje [manifest SHA-256](reports/2026-10-14-T10-files.json).

## Kryterium i granice

D025 rozstrzyga termin odbioru: lokalny T09 jest zakończony, T10 sprawdza aplikację lokalnie, T11 dostarcza środowisko HTTPS, a użytkownik wykonuje fizyczny review w T10-R1 po Vercel. Brak telefonu i Safari nie jest wynikiem pozytywnym ani przeszkodą do lokalnej implementacji. Szersza beta wymaga T10-R1.

T10 obejmuje krytyczne scenariusze TESTING: własność, wersje i snapshoty, procent rzeczywistego 1RM, zero wobec braku, idempotencję, konflikt, wznowienie/historię/postęp, import i jawne propozycje głosu. AI jest wyłączone w lokalnych runnerach; testy głosu używają mocków i nie zastępują rzeczywistej mowy ani telefonu. Nowe konta/plany/pliki są syntetyczne i usuwane po sprawdzeniach. Istniejące prywatne fixtures pozostają lokalnie.

## Poprawki

- Migracja `20261014100000_t10_plan_write_boundary.sql` zamyka `INSERT/UPDATE/DELETE` klientowi dla katalogu i tabel planu. Publikacja ręczna i zatwierdzony import nadal zapisują przez istniejące funkcje z kontrolą właściciela i retry. Odczyt RLS, profile i dopisywane 1RM pozostają obsługiwane. Nie zmienia danych ani historii. Rozwiązuje otwarty punkt D011.
- Wspólny czytnik JSON w `src/lib/http/json.ts` odrzuca `null`, tablice, skalary, uszkodzone kodowanie i nadmiar bajtów. Limity żądania: plan 1 048 576 B, komenda treningu 65 536 B, maksimum 16 384 B, zaokrąglanie 1024 B. Odpowiedź dla błędnego żądania: JSON 400 przed zapisem. Ograniczenia wejścia importu pozostają dotychczasowe.
- Proxy zwraca dla prywatnego API bez aktywnej sesji JSON 401 z `no-store`; strony nadal prowadzą do logowania. Formularz zachowuje obsługę błędu zamiast otrzymać HTML logowania jako odpowiedź zapisu.

- Dodano `.gitignore` dla całego prywatnego `fixtures/t06/real` i `.vercel`; `.vercelignore` wyklucza także lokalne `.env*`. Reguły nie kasują danych. Wzór sprawdzono w [oficjalnej dokumentacji Vercel](https://vercel.com/docs/deployments/vercel-ignore) 2026-10-14. Kontrola syntetycznych ścieżek z semantyką Git nie jest rzeczywistym uploadem Vercel; manifest wdrożenia trzeba sprawdzić w T11.

## Odtwarzanie

Wymagane: działający lokalny Supabase/Docker z Mailpit, migracje przez `DO_NOT_TRACK=1 npx supabase migration up --local`, Node zgodny z package.json, lokalny Chrome i moduł Playwright z runtime desktopowego (`load_workspace_dependencies`).

```sh
DO_NOT_TRACK=1 T10_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t10:local
```

Runner nie resetuje bazy, zachowuje dotychczasowe próby/koszty i wyłącza wywołania dostawcy. Kolejno sprawdza T03 (Auth/Storage/Mailpit/wygasła sesja), T04/T05/T06-R1/T10 przez rzeczywisty Auth/PostgREST, T06 przez mock AI, testy jednostkowe, build i typy po buildzie. Następnie produkcyjny Next na porcie 3006 obsługuje HTTP importu T07-R1, T08, T09 oraz syntetyczne klikanie Chrome T04-R1 i T10. Jeden build; testy wymagające globalnego budżetu nie biegną równolegle.

Chrome T10 używa rzeczywistego formularza logowania, zapisu 1RM i startu. Sprawdza 75% × 120 = 90 kg i puste kg przy braku maksimum; nie traktuje celu jako wykonanego wyniku. Zapis serii celowo traci odpowiedź po zapisie, a retry ma ten sam payload. Dalej pominięcie, jawne zero bez kg, dodatkowe ćwiczenie i seria, komentarz, koniec, wylogowanie/logowanie, historia i postęp (540 kg), A/B/anon i błędny JSON. Chrome T04-R1 sprawdza karty, dialogi, fokus, wersjonowanie, retry oraz niezmienność snapshotów na danych syntetycznych. Test T10 API wymaga kodu PostgreSQL 42501 dla trzech operacji na 12 tabelach; nie myli błędu walidacji z brakiem uprawnienia.

## Wyniki

- macOS, Node 26.4.0, Next 16.4.0, rzeczywisty lokalny Supabase Auth/PostgREST/Storage/Mailpit, Chrome headless (channel `chrome`), viewporty 1440×1000 i 390×844.
- Lokalna migracja T10 zastosowana bez resetu bazy.
- T03: Auth/Storage/Mailpit i 3 testy sesji (w tym 401 API) — sukces.
- T04/T05/T06-R1: rzeczywiste API i domenowe niezmienniki wersji/historii/retry/A/B/anon — sukces.
- T10 API: brak bezpośrednich grantów na 12 tabelach (A/B/anon, trzy operacje), działające publikacja/retry/kolejna wersja oraz zachowanie kotwicy historii — sukces.
- T06: 3/3 lokalnych integracji z mockiem AI — sukces. Nie usuwano prób dla resetu globalnego limitu.
- `npm test` z konfiguracją lokalnych sesji: 159 przeszło, 6 pominięto, 23 pliki aktywne i 4 pominięte. W tym 34 nowe testy błędnego JSON i limitów. Nie jest to licznik samego zestawu bez skonfigurowanego Supabase.
- `npm run build`, potem `npm run typecheck` — sukces.
- Produkcyjny HTTP T06/T07-R1, T08 (940 → 1140 kg po poprawce), T09 (A/B/anon, rewizja/cel/budżet) — sukces.
- Syntetyczny Chrome T04-R1 — sukces: karty/dialogi/superserie/fokus/mobile, rzeczywisty zapis/retry, stare wersje/snapshoty.
- Chrome T10 — sukces końcowy: rzeczywisty formularz logowania i 1RM, start, wynik, retry bez duplikatu, zero/null, pominięcie, dodatkowe ćwiczenie/seria, komentarz, koniec, ponowne logowanie/historia, 540 kg w postępie, strony B 404, anon API 401 i null JSON 400. Brak pageerror. Zrzuty `/private/tmp/t10-workout-mobile.png` i `/private/tmp/t10-progress-mobile.png` oceniono wizualnie; test sprawdził mobilną szerokość bez overflow.
- `npm audit --omit=dev --audit-level=high`: 0 podatności. Pierwsze wywołanie nie miało DNS w sandboxie; odczyt poza nim zakończył się sukcesem, bez zmiany zależności.
- Wykluczenia Git/Vercel: syntetyczne ścieżki prywatnego źródła i wyników, `.env`, `.env.local`, `.vercel/project.json` są wykluczone; źródła aplikacji, package.json i skrypt workera pozostają dostępne. Test użył tymczasowych repozytoriów w `/private/tmp`, bez kopiowania prywatnych treści. Wysyłki Vercel nie wykonywano.

Pierwszy pełny przebieg przerwało historyczne oczekiwanie 307 w teście anon importu; aktualnym kontraktem jest JSON 401. Po poprawieniu oczekiwań druga próba zaliczyła wszystkie sekcje przed nowym Chrome T10. Ten test wymagał poprawy dokładnego selektora `select`, oczekiwania na nawigację oraz selektora komentarza wczytanego z historii. Kolejne próby `--browser-only` nie powtarzały zaliczonych API/builda; nie deklarujemy nieudanych całości jako udanych przebiegów. Tryb ten wymaga uprzednio przygotowanego produkcyjnego builda.

Testy nie mierzą prawdziwego AI i mikrofonu telefonu; dotychczasowe prywatne źródła nie były publikowane ani ponownie interpretowane. Istniejący jednostkowy audit źródła w `npm test` czyta zachowane lokalne materiały; nowe ścieżki Chrome/API T10 są całkowicie syntetyczne. Hosting, fizyczne urządzenia, Safari i obciążenie pozostają poza lokalnym wynikiem.

## T10-R1 — lista dla użytkownika po Vercel

Przy każdym wyniku zapisz datę, model telefonu, system, przeglądarkę i jej wersję oraz adres/wersję wdrożenia. Potrzebne prywatne konto testera. Głos AI wymaga osobno skonfigurowanego i uzgodnionego budżetu; sam test mikrofonu go nie włącza.

1. Zaloguj się, otwórz plan i ręczny edytor. Sprawdź klawiaturę, przewijanie, dialogi i wyjście z niezapisanymi zmianami (także Wstecz). Publikacja ma tworzyć nową wersję.
2. Rozpocznij trening. Zapisz ręcznie serię, pomiń inną, dodaj ćwiczenie/serię i komentarz, zakończ. Po ponownym logowaniu sprawdź historię i postęp.
3. Sprawdź aparat/wybór zdjęcia i odmowę uprawnienia. Import przejdź przez trzy kroki, źródło, wyjaśnienie i publikację na syntetycznym źródle; po odświeżeniu przywróć zapisaną korektę.
4. Sprawdź odmowę mikrofonu, nagranie/zatrzymanie, anulowanie i ponowne nagranie. Zapisz dostępny format (WebM lub MP4); sprawdź Chrome/Android i Safari/iPhone w miarę dostępności. Brak jednego urządzenia pozostaje ograniczeniem.
5. Po włączeniu głosu z uzgodnionym budżetem: podaj wynik, popraw liczbę i zatwierdź właściwą serię. Podczas kolejnej odpowiedzi zmień ćwiczenie, a inne nagranie anuluj. Żadne nie może zapisać się automatycznie ani do innego celu.
6. Przerwij połączenie przy zapisie: sprawdź błąd, zachowany formularz i retry bez duplikatu. Otwórz drugi tab ze starszą wersją i sprawdź konflikt. Nie odświeżaj niezapisanych pól bez ich świadomego odrzucenia.
7. Sprawdź drugie konto: cudzy plan, trening i źródło nie mogą być odczytane. Odnotuj problemy wraz z krokami odtworzenia; błąd prywatności lub utrata/duplikacja wyniku blokuje szerszą betę.

Nie używaj prywatnych nagrań/planów w zgłoszeniach publicznych. Brak wyników T10-R1 pozostaje jawny w STATUS i ROADMAP.

## Pozostałe etapy

T11: konfiguracja docelowego Vercel i oddzielnych projektów Supabase preview/production, kontrola manifestu uploadu, migracje (w tym T10), sekrety, limity dostawców, cron, retencja, backup/odtworzenie, rollback i smoke test dwóch kont po HTTPS. Dostęp i konfiguracja usług nie zostały sprawdzone w T10. Nie wykonano uploadu, utworzenia usług ani zmiany budżetów.

T10-R1: użytkownik wykona fizyczny review po wdrożeniu zgodnie z listą powyżej. Brak znanego krytycznego błędu w lokalnie sprawdzonych scenariuszach nie oznacza gotowości urządzeń/hostingu. Żadna nowa funkcja produktu nie została dodana w tym odbiorze.

# Aktualny stan projektu

Aktualizacja: 2026-10-16.

## T11 — prototyp gotowy do testów właściciela

Najnowszy [handoff](handoffs/2026-10-16-T11-prototyp-auth-ai.md). **T11 review; T11-E1/T11-C1 done.** Po D029 tylko Production. D031: użytkownik chce teraz testować prototyp i używać AI; dalsze prace operatorskie odkładamy, bez uzależniania jego testów od pełnego odbioru infrastruktury.

**Aplikacja: [Forma](https://training-plan-app-seven.vercel.app).** 21/21 migracji z T10/C1; rzeczywisty smoke HTTPS/Auth/API/Storage A/B/anon przeszedł, PT409/409 i retry działają. Sprawdzony kod ddaceb3, ostatni dotychczasowy commit dokumentacji 4e4a0aa. [Raport](reports/2026-10-16-T11-production-audit.json) zachowuje także niezaliczone próby. Nie powtarzać szerokiej regresji bez zmiany kodu lub nowego błędu.

Auth po jawnej zgodzie zapisane i ponownie odczytane: minimum hasła12, Site URL produkcji, dokładne redirecty `/auth/confirm` i `/ustaw-haslo`. Rejestracja/anonymous off, refresh rotation on. Odczyt wyłącznie liczników potwierdził jedno konto i profil; agent nie zna danych logowania właściciela. SMTP nie jest potrzebny do obecnych ręcznych kont; dopiero przed mailowymi zaproszeniami/resetami.

Cron: Enabled `0 3 * * *`, ręczne wywołanie z panelu dało HTTP200 na pustej kolejce (23:02:26.822 CEST). Przed wywołaniem eligible imports/voice i wszystkie obiekty Storage0. Nie dowodzi to usuwania rzeczywistych wygasłych plików; CRON_SECRET bez odczytu/rotacji, jakość potwierdza użytkownik prywatnie. Przejściowe timeouty Node/Chrome nie były błędem HTTP aplikacji: curl z walidacją TLS potwierdził /logowanie200, root307, API401.

AI i głos są włączone i sprawdzone w rzeczywistym HTTPS. Użytkownik zatwierdził5USD łącznie na start i prywatnie dodał klucz. Production `dpl_DEkfN1gE4V3kk558B2SGEmVcyawS` Ready44s, kod4e4a0aa/C1. Import:3serie×5/60kg/120s, retry bez nowego AI. Głos: syntetyczne2,9s → transkrypcja → propozycja5/60 → zapis dopiero po zatwierdzeniu. Dodatkowy odczyt prywatnej tabeli budżetowej w runnerze dał42501; same kontrole aplikacji wcześniej przeszły, bez kolejnej płatnej próby. Raport zachowuje ten błąd testu. Limity szacunków import4/głos1 w24h nie są twardym limitem5USD łącznie; niepotwierdzony limit projektu OpenAI. Duże audio pozostaje otwarte, krótkie próby dopuszcza D032.

Backup: użytkownik wskazał Mac poza repo, ale przed zmianą priorytetu wykonano tylko eksport publicznego schematu do /private/tmp, bez danych Auth/Storage. Brak szyfrowanego backupu i restore. Odłożone: dalszy backup/restore/monitoring i próba fizycznego cleanup; bez deklaracji wykonania. Telefon/Safari i szersza beta nadal wymagają formalnego T10-R1; właściciel może już testować dostępną aplikację.

## Następny krok

Właściciel testuje aplikację, import i krótkie nagrania. Dalsza praca agenta dopiero od konkretnego feedbacku, bez automatycznego monitorowania lub rozwijania infrastruktury. Szczegóły i prompt w najnowszym handoffie. Historyczne sekcje niżej opisują wcześniejsze stany.

## Co istnieje

T01–T08, T06-R1, T07-R1 i T04-R1 są ukończone lokalnie. T09 jest `done` lokalnie po rozstrzygnięciu użytkownika z 2026-10-14 (D025). T10 jest `done` lokalnie: odbiór i poprawki opisano w raporcie. T11 jest in_progress: użytkownik utworzył projekt Vercel i podłączył produkcyjny Supabase. T11-E1 zakończyło uproszczenie konfiguracji. Hosting nie ma pełnego odbioru; migracje produkcji zastosowano w bieżącej sesji. Fizyczny review użytkownika po Vercel należy do T10-R1. Git zainicjowano na gałęzi `main`; docelowe repozytorium: [gisupanalizy/training-plan-app](https://github.com/gisupanalizy/training-plan-app). Pierwszy commit obejmuje źródła i dokumentację, bez sekretów i prywatnych fixtures.

T06-R1 poprawił odczyt tabel i ich kontekstu, zakresy i opcjonalność, AMRAP, superserie, pytania z kontekstem i stabilnymi celami, podgląd PDF.js/XLSX oraz wewnętrzny słownik PL/EN. Zastosowano lokalnie dwie migracje rozszerzające plan i nowe niezmienne snapshoty, z obsługą starszych szkiców. Najnowszy [handoff T11-E1](handoffs/2026-10-16-T11-E1-usuniecie-duplikatow.md) jest punktem wejścia do konfiguracji. [Handoff Git](handoffs/2026-10-14-T11-G1-pierwszy-commit.md) dokumentuje inicjalizację repo, a [pierwszy T11](handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md) przygotowanie procedury. [T10](handoffs/2026-10-14-T10-odbior-lokalny.md) dokumentuje lokalny odbiór; [T04-R1](handoffs/2026-10-13-T04-R1-czytelny-edytor.md) dokumentuje poprzednią przebudowę edytora. T04-R1 przebudował ręczny edytor: jeden trening, karty i okna edycji, zakresy oraz parametry dodatkowe na żądanie. Import zachowuje trzy kroki T07-R1; poprzednie handoffy dokumentują wcześniejsze zadania.

## Następny krok

T11-E1 jest done: nowy kod odczytuje integrację STORAGE, osiem ręcznych ustawień ograniczono do Production, a trzy ręczne duplikaty usunięto po jawnym potwierdzeniu użytkownika. Szczegóły i prompt w handoffie. Bieżąca sesja zastosowała migracje; dalsze T11 wymaga Auth, kosztów, cleanup/backup i zdalnego smoke A/B/anon po HTTPS. D029 usuwa wymóg preview na teraz; SMTP przed mailowymi zaproszeniami. Nie deklarować samego połączenia integracji jako wdrożenia. Telefon/Safari i szersza beta pozostają T10-R1.

## Konfiguracja T11-E1 (2026-10-16)

Potwierdzono przez Chrome zalogowane Vercel `gisupanalizy-gmailcoms-projects/training-plan-app` i Supabase `supabase-violet-cable`, ref `kwmyosnerwvtwxtszzka`. Integracja nadała rodzinę STORAGE tylko Production. Połączenie Marketplace w Vercel nie jest instalacją konektora Codex: konektor nadal niedostępny, CLI bez tokenów, ale przeglądarka pozwoliła zmienić ustawienia.

Kod opublikowano na main jako `82b9eb7`; nie jest to potwierdzenie udanego wdrożenia. Nowy kod preferuje kompletną parę publicznych zmiennych STORAGE i wybiera serwerowy secret/service_role tej samej rodziny, bez ręcznego kopiowania sekretów. Stare nazwy zachowane lokalnie. Testy wyboru 20/20; cała suite 171 passed/9 skipped; build/typecheck z syntetycznym STORAGE oraz rzeczywiste lokalne HTTP T06/T07 A/B/anon/Storage/retry na mocku AI przeszły. Nie było płatnego AI. Nowy lokalny manifest: [95 źródeł i 20 migracji](reports/2026-10-16-T11-E1-release.json), bez uploadu. .next/static nie zawierał referencji serwerowych kluczy ani syntetycznego sekretu builda.

W Vercel zapisano APP_ENV=production, oba refy produkcyjne, cztery wyłączone flagi/budżety AI; wszystkie tylko Production. CRON_SECRET ograniczono do Production bez zmiany/odczytu jego wartości. Jakość losowości pozostaje nieweryfikowana. Po odpowiedzi użytkownika „Tak, usuń trzy ręczne duplikaty” usunięto NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY i SUPABASE_SERVICE_ROLE_KEY. UI potwierdził brak wszystkich trzech oraz obecność automatycznych wpisów STORAGE; tych wpisów nie zmieniano. Zmiany środowiska obowiązują dopiero przy nowym wdrożeniu. Nie uruchomiono Redeploy ani migracji hostowanych. D028 i [procedura](T11_DEPLOYMENT.md) opisują konfigurację. Wcześniejsze wyniki niżej są historyczne.

## Przygotowanie i weryfikacja T11

Sprawdzono brak lokalnych powiązań projektów, tokenów procesu i znanych plików logowania CLI. `supabase projects list` odmówiło z powodu braku tokenu, a Vercel 64.0.2 `deploy --dry --format=json` z odrębną konfiguracją z powodu braku poświadczeń. Obie integracje są dostępne do instalacji, ale nie są połączone. Zdalne listy projektów i ich ustawienia nie zostały odczytane. Nie tworzono usług, nie zmieniano kluczy i nie wykonywano uploadu.

Nowa lista dozwolonych plików w `.vercelignore` i `scripts/prepare-t11-deploy.mjs` tworzą czystą kopię bez `.env`, fixtures, docs, testów i migracji. [Lokalny manifest](reports/2026-10-14-T11-release.json): 94 pliki, 767 227 B, 20 migracji w osobnym wykazie. To nie manifest faktycznej wysyłki dostawcy. Czyste `npm ci --offline --ignore-scripts --no-audit --no-fund`, build i typy przeszły na Node 26.4.0 bez `.env` i AI. `node scripts/verify-t11-package.mjs` potwierdziło zgodne hashe, ścieżki Git/Vercel i odrzucenie env/sekretu/dowiązania na syntetycznych kopiach. Nie ponawiano całej suite aplikacji; kod domenowy i API nie zmieniły się.

Sprawdzono aktualne oficjalne dokumenty Vercel/Supabase/OpenAI; źródła przy konkretnych regułach w procedurze. Otwarte: SMTP zaproszeń, audio 5 MiB wobec 4,5 MB Vercel, automatyczne sprzątanie preview, backlog ponad 50 importów, rzeczywiste limity kosztów i test odtworzenia. Proponowane zmiany limitu audio/RPO/RTO nie są zatwierdzonym kontraktem. Bez płatnego AI, agentów, telefonu/Safari, hostingu i restore. D027 zapisuje przygotowanie i granice. Szczegóły błędów narzędzi i zasobów tymczasowych w handoffie.

## Weryfikacja T10

[Raport T10](T10_ACCEPTANCE.md) podaje polecenia, środowisko, wyniki i listę fizycznego review po Vercel. D025 rozstrzyga termin odbioru T09; D026 zamyka bezpośredni INSERT/UPDATE/DELETE klienta do katalogu i tabel planu. Lokalna migracja T10 zastosowana bez resetu danych. Cztery ręczne API korzystają ze wspólnego limitowanego czytnika JSON (400 dla niepoprawnego kształtu/rozmiaru); proxy prywatnego API bez sesji zwraca JSON 401. `.gitignore` i nowy `.vercelignore` wykluczają prywatne fixtures, lokalne sekrety i konfigurację .vercel.

Rzeczywiste lokalne T03 (w tym Storage/Mailpit i 3 testy sesji), T04, T05, T06 (3/3, mock AI), T06-R1 i T10 (12 tabel, trzy operacje, A/B/anon) przeszły. `npm test` w runnerze: 159 przeszło, 6 pominięto, 23 aktywne pliki/4 pominięte; build i następujące po nim typy przeszły. HTTP T06/T07-R1, T08 i T09 oraz syntetyczny Chrome T04-R1 przeszły. Chrome T10 po poprawieniu selektorów/oczekiwania testu sprawdził logowanie UI, 1RM, start, serię z utratą odpowiedzi/retry, zero/null, pominięcie, dodatki i komentarz, koniec, ponowne logowanie/historię, 540 kg w postępie i A/B/anon. Brak błędów strony; mobilne zrzuty ocenione. Wszystkie sekcje zaliczone; nie był to jeden nieprzerwany udany przebieg całego runnera. `npm audit --omit=dev --audit-level=high`: 0 podatności po ponowieniu z dostępem sieciowym.

Nie wykonano nowego płatnego AI, wdrożenia, telefonu/Safari ani obciążenia. Nowe konta i Chrome T10 są syntetyczne; istniejący audit źródła w suite czyta zachowane materiały lokalne. Prywatne dane nie były publikowane. Port 3006 bez nasłuchu po sprawdzeniach, lokalny Supabase pozostaje uruchomiony. Bez innych agentów i zmian sekretów.

## Weryfikacja T04-R1

Nowy i istniejący plan mają kompaktowy ręczny edytor jednego treningu, podgląd całego planu i modalną edycję ćwiczeń/bloków/serii. Zakresy i pola dodatkowe są otwierane na żądanie; użyte wartości, braki i uwagi są widoczne w kartach. Zapis publikuje całą wersję, retry zachowuje payload, a ukrycie pól nie usuwa danych. Bez migracji lub zmian API.

`npm test`: 122 przeszło, 8 pominięto. Produkcyjny build i sekwencyjny `npm run typecheck` przeszły. Lokalne T04 potwierdziło A/B/anon, wersje, retry i 1RM. Chrome 1440×1000/390×844 na własnych syntetycznych danych sprawdził karty, dialog/cancel, katalog/przeniesienie, superserie, fokus, brak overflow i prawdziwą publikację z celową utratą odpowiedzi oraz retry bez duplikatu. Odczyt bazy potwierdził zachowanie wcześniejszych serii i snapshotów rozpoczętego treningu. HTTP T07-R1 z mockiem szkicu i syntetycznymi źródłami przeszedł; w tej sesji nie ponawiano klikalnego testu prywatnych źródeł importu. Pierwsze testy miały błędy oczekiwań/selektorów; poprawiono i powtórzono. Dostęp do Dockera wymagał powtórzenia poza sandboxem. Szczegóły w handoffie T04-R1.

Bez innych agentów, płatnego AI, publikacji prywatnych fixtures i zmian sekretów. Fizyczne telefony, Safari/iPhone oraz hosting pozostały niesprawdzone w T04-R1. Bieżący status T09 określa ROADMAP i D025.

## Weryfikacja T07-R1

Import ma własny przegląd: Ćwiczenia → Serie i superserie → Podsumowanie. Krótkie karty pokazują 7–8 × 1, różne cele i jawne braki; edycja bloku/pojedynczej serii i grup jest otwierana na żądanie. Ankieta wyjaśnia jedno pytanie, z wyborem/zakresem/AMRAP, cytatem i podglądem zmiany. Źródło jest panelem lub pełnym dialogiem na telefonie. Krok i potwierdzenia są zapisane w opcjonalnym review_data; brak migracji planu/historii. W ramach T07-R1 ręczny edytor pozostał dotychczasowy; późniejszy T04-R1 opisano wyżej.

`npm test`: 100 przeszło, 8 pominięto; typy i build przeszły. Lokalne T06 (3/3), T06-R1 API/snapshot/retry i HTTP A/B/anon przeszły, w tym trwały etap, niepoprawne metadata i starszy PATCH. Chrome na zachowanych wynikach trzech prawdziwych źródeł sprawdził karty, blok/cancel, ankiety, kolejność, krok/reload/potwierdzenia, fokus, widok mobilny, 6 stron PDF i wszystkie arkusze. UI test z mockiem sprawdził utratę odpowiedzi publikacji i retry tym samym ID bez PATCH już zatwierdzonego szkicu. Nie wykonano nowych płatnych prób AI ani publikacji prywatnych planów. Fizyczne urządzenia, Safari i hosting niesprawdzone. Szczegóły i granice w handoffie T07-R1.

## Weryfikacja T06-R1

Trzy źródła dołączono lokalnie za wyraźną zgodą użytkownika. Niezależny odczyt i baseline zachowano przed poprawkami. Końcowa rzeczywista ścieżka Auth/Storage/processImportJob przyjęła PDF (3 treningi/30 ćwiczeń/1 uzasadnione pytanie, 48,562 s), FBW (3 treningi/19 ćwiczeń/6 pytań, 92 ms) i Madzię (12 jednostek/17 pytań, 111 ms). Oba XLSX użyły czytnika struktury z 0 tokenów AI. Każde pytanie oceniono; jawne serie/powtórzenia/czas nie wywołują pytań. Niezależny audit porównuje wszystkie 30 pozycji PDF pod kątem serii, celu i grupy.

Prawdziwy model: pełna seria syntetyczna v11 12/12 szkiców i 88/90 pól; 2 różnice nazw dni A/B. Po poprawce aplikacji celowane v12 2/2 i 17/17. Nie ponowiono pełnej serii v12. Znane metryki plików i obu serii syntetycznych sumują się do 0,058016 USD; 4 wcześniejsze próby mają niepełne tokeny, więc całkowity rachunek jest nieznany. Przed próbami sprawdzano pozostały zatwierdzony budżet T06 (5 USD); nie usuwano istniejących prób dla resetu limitu. Szczegóły i źródła taryfy: [T06_IMPORT](T06_IMPORT.md).

`npm test`, typy i build oraz lokalne T04/T05/T06/T06-R1/T08 przeszły. HTTP T06 z produkcyjnym Next sprawdził A/B/anon, prywatny podgląd, korektę/reload, retry i stare szkice. Klikalny test Chrome na prawdziwych źródłach i zachowanych wynikach sprawdził 6 stron PDF, zoom, pełny ekran, skok do strony 4, mobilną szerokość, wszystkie arkusze, dolne wiersze/przekreślenie, zakres/AMRAP i zachowanie odpowiedzi po przestawieniu/reload. Dokładne liczniki i polecenia są w handoffie. Mock AI w regresji HTTP jest oddzielony od prawdziwych prób.

## Ograniczenia

Pozostałe pytania dotyczą daty Excela, podstawy ciężaru, alternatyw sprzętu, znaczenia zapisu przerwy i zakresu/protokołu bloków; nie uzupełniamy ich przez zgadywanie. Czytnik rozpoznaje określone układy, inne przechodzą do AI. PDF ma skok do strony i cytat, bez automatycznego zaznaczania prostokąta. Słownik EN ma 876 pozycji, tylko część ma zweryfikowane odpowiedniki PL; niepewne dopasowania są propozycjami. Prawdziwe próby nie gwarantują jakości dowolnego dokumentu. Hosting, obciążenie, fizyczne telefony i Safari/iPhone nadal niesprawdzone. Prywatne źródła i pełne wyniki pozostają wyłącznie lokalnie, klucz w ignorowanym `.env`; niczego nie wysłano do publicznego repo.

## Weryfikacja T07

`npm run typecheck`, `npm test` (51 aktywnych testów, 6 pominiętych) i `npm run build`: sukces. Po lokalnej migracji `DO_NOT_TRACK=1 npm run test:t06:local`: 3/3; rozszerzony `DO_NOT_TRACK=1 npm run test:t06:http`: sukces dla prywatnego źródła, korekty po odświeżeniu, A/B/anon, podpisanego uploadu, błędnego i niewspieranego pliku, anulowania, pytań i powtórzonego zatwierdzenia. Test komponentu symuluje odmowę aparatu i 55 pytań; nie jest testem prawdziwego urządzenia ani jakości AI. Wyniki i granice: [handoff T07](handoffs/2026-10-12-T07-ekran-importu.md).

## Weryfikacja T08

`npm run typecheck`, `npm test` (53 aktywne, 6 pominiętych) i `npm run build`: sukces. `DO_NOT_TRACK=1 npm run test:t05:local` potwierdził regresję T05. `T08_HTTP_BASE=http://localhost:3005 DO_NOT_TRACK=1 npm run test:t08:local` na lokalnym prawdziwym Auth/PostgREST i produkcyjnym Next: 940 kg przed i 1140 kg po poprawce historycznej serii, A/B/anon oraz filtr ćwiczenia i daty. Testy użyły danych syntetycznych, bez AI i mocka bazy. Nie wykonano testu fizycznego urządzenia, pełnego klikanego E2E ani hostingu.

## Weryfikacja T09

Po zatwierdzeniu limitu 0,50 USD wykonano cztery serie prawdziwego API na 20 polskich tekstach, jednym syntetycznym planie oraz czystym i zaszumionym nagraniu syntetycznym. Pierwsze próby wykryły nadmiernie dosłowne porównanie nazw/komentarzy, błąd zamiast doprecyzowania przy brakującej nazwie ćwiczenia i niestabilność skrótu „pięć po sto” oraz planu. Po korekcie walidatora, miary i promptu `voice-pl-v2` końcowa seria dała 20/20 tekstów, poprawny plan i 2/2 transkrypcji; p50/p95 tekstu 4,351/8,622 s, audio 0,552/0,552 s. Cztery serie kosztowały szacunkowo 0,010376 USD łącznie; [raport końcowy](reports/2026-10-12-T09-live.json), wcześniejsze v1–v3. `npm test` dał 65 aktywnych testów i 7 pominiętych, lokalne T09/T05 A/B/anon, typy po buildzie i build przeszły. Pierwszy równoległy `typecheck` trafił na przebudowę `.next` i został powtórzony sekwencyjnie z sukcesem.

Kontynuacja 2026-10-13: dodano obsługę asynchronicznego błędu `MediaRecorder`, aby zatrzymać mikrofon i nie wysłać częściowego nagrania. Testy komponentu sprawdziły błąd na ścieżce MP4 oraz zmianę serii podczas opóźnionej interpretacji. `npm test`: 67 przeszło, 7 pominięto; `npm run build`, sekwencyjny `npm run typecheck`, `DO_NOT_TRACK=1 npm run test:t09:local`, jego wariant HTTP z `T09_HTTP_BASE=http://localhost:3005` i `DO_NOT_TRACK=1 npm run test:t05:local` przeszły. Pierwsza próba lokalnego T09 w sandboxie nie miała dostępu do socketu Dockera; powtórzenie z uprawnieniem przeszło. ADB pokazało wyłącznie emulator, USB nie wykazało telefonu, a użytkownik potwierdził jego brak. Nie ponowiono T06 przed 12:23 UTC; nie usuwano żadnych prób i nie wywołano płatnego API. Testy komponentowe są mockami, nie odbiorem telefonu.

Odbiór emulatora 2026-10-13: użytkownik wyraźnie uznał emulator za wystarczający na ten etap i poprosił o status `done`. W Chrome Android przez `adb reverse` i tymczasową lokalną stronę sprawdzono dwa poziomy uprawnienia mikrofonu, rzeczywiste nagranie WebM/Opus (48 449 B), wymuszone audio/MP4 (31 685 B), anulowanie aktywnego nagrania (`discarded=true`) i zwolnienie ścieżki mikrofonu. Ponownie `npm test`: 67 przeszło, 7 pominięto. Nie była to pełna klikalna ścieżka aplikacji na emulatorze; opóźniony wynik i zmiana serii mają testy komponentów z mockiem oraz kontrolę rewizji. Fizyczny telefon, Safari/iPhone, hosting i realna sala treningowa nadal nie są zweryfikowane. T09 oznaczono `done` tylko lokalnie w uzgodnionym zakresie.

Wcześniej `npm test`, `npm run typecheck` i `npm run build` przeszły po implementacji; `DO_NOT_TRACK=1 npm run test:t09:local` oraz wariant z `T09_HTTP_BASE=http://localhost:3005` przeszły na lokalnym Auth/PostgREST i produkcyjnym Next. Sprawdzono A/B/anon, obcą serię, starą rewizję, atomowe serie dodatkowe, retry, rezerwację kosztu i odmowę bez budżetu. `DO_NOT_TRACK=1 npm run test:t05:local` przeszedł po migracji. Testy komponentów z opóźnionym wynikiem pozostają mockami; prawdziwa ewaluacja syntetycznego audio nie zastępuje telefonu. `DO_NOT_TRACK=1 npm run test:t06:local` dał 1 błąd starego testu rezerwacji T06 (`daily_budget`) z powodu istniejących prób w globalnym oknie 24 h; nie zmieniano tych danych. Pozostałe 2 testy przeszły. Brak testu fizycznego urządzenia i hostingu.

## Weryfikacja T06

Końcowe RUN_T06_LIVE=true npm run evaluate:t06: 12/12 szkiców, 90/90 pól, zero opuszczeń i dopowiedzeń, p50 6,223 s, p95 32,102 s, 13 674/8 430 tokenów wejścia/wyjścia i szacunek 0,005582 USD. npm test: 49 przeszło, 6 pominięto; npm run typecheck i npm run build: sukces. Lokalne testy Auth/API/Storage A/B/anon: 3/3; test HTTP z produkcyjnym buildem, XLSX, pytaniami i zatwierdzeniem: sukces. npm audit: 0 podatności. Wyniki prywatnych plików oraz niewykonane kontrole są w handoffie.

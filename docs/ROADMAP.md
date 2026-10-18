# Plan zadań

Aktualizacja: 2026-10-17. Jedyne źródło statusów poszczególnych zadań. STATUS opisuje kontekst sesji, bez kopiowania całego backlogu.

Statusy: `todo`, `in_progress`, `blocked`, `review`, `done`, `deferred`. `todo` z niespełnionymi zależnościami nie jest gotowe do rozpoczęcia. `blocked` wymaga konkretnego blokera i kroku odblokowania. `done` wymaga spełnienia kryteriów, weryfikacji i handoffu.

Właściciel `—` oznacza zadanie nieprzejęte. Po podziale pozostaw stare ID z odnośnikami do nowych. Kolejność może się zmienić z uzasadnieniem w CHANGELOG.

## Etap 0 — dokumentacja

### T00 — Specyfikacja i sposób współpracy

- Status: done. Właściciel: Codex (sesja dokumentacyjna 2026-10-11). Zależności: brak.
- Wynik: wymagania, architektura, domena, AI/głos, UX, zadania, testy, decyzje, pytania i handoffy.
- Odbiór: dokumenty są wzajemnie podlinkowane; odróżniają wymagania od propozycji i implementacji; następny agent ma jednoznaczny punkt startu.
- Weryfikacja: sprawdzenie lokalnych linków i spójności identyfikatorów zadań; wynik w handoffie T00.

Uzupełnienie T00 (2026-10-11): dodano obowiązek promptu przekazania od zakończenia T01; status T00 pozostaje `done`, T01 nadal `todo`. Szczegóły w WORKFLOW i najnowszym handoffie w STATUS.

## Etap 1 — fundament i ręczny trening

### T01 — Szkielet aplikacji i prototyp ekranów

- Status: done. Właściciel: Codex (sesja implementacji T01, 2026-10-11). Zależności: T00 oraz zlecenie przejścia do implementacji — spełnione.
- Zakres: Next.js/TypeScript, lockfile, responsywna nawigacja, syntetyczny plan i ekran treningu, konfiguracja testów i `.env.example`; instrukcja uruchomienia.
- Odbiór: lokalna aplikacja działa bez sekretów w oznaczonym trybie demonstracyjnym; można przejść przez plan i widok treningu na telefonie i desktopie.
- Weryfikacja: build, kontrola typów i podstawowa kontrola UI. Bez obiecywania trwałego zapisu w prototypie.
- Wynik: lokalny prototyp z planem A/B i podglądem serii, oznaczony jako demo; sprawdzenia i ograniczenia w [handoffie T01](handoffs/2026-10-11-T01-prototyp.md).

### T02 — Schemat domeny i baza

- Status: done. Właściciel: Codex (sesja T02, 2026-10-11). Zależności: T01 — spełniona.
- Zakres: migracje, typy, walidatory, wersje planów, serie, maksima, snapshoty celów, rewizje i idempotencja. RLS definiowane razem z tabelami.
- Odbiór: schemat reprezentuje rampę, superserię, ćwiczenie własne, brak 1RM i serię dodatkową; migracje odtwarzają pustą bazę.
- Weryfikacja: testy niezmienników domeny, migracji i własności relacji.
- Wynik: migracja 13 prywatnych tabel z RLS, typy/walidatory i lokalny test odtworzenia PostgreSQL 16. Wyniki oraz granice w [handoffie T02](handoffs/2026-10-11-T02-schemat-domeny.md). Integracja kont, API i Storage pozostaje T03; komendy zapisu wyników pozostają T05.

### T03 — Konta testerów i prywatność

- Status: done. Właściciel: Codex (sesja T03, 2026-10-11). Zależności: T02 — spełniona.
- Zakres: logowanie/wylogowanie, dostęp zaproszonych testerów, RLS tabel i Storage, izolacja środowisk.
- Odbiór: dwa konta mają rozdzielone plany, wyniki i pliki; użytkownik anonimowy nie ma dostępu; wygasła sesja jest obsłużona.
- Weryfikacja: rzeczywiste testy dostępu użytkownik A/B/anonimowy przez API i Storage, w tym cudze identyfikatory rodziców.
- Wynik: lokalny Supabase Auth/API/Storage z zaproszeniem, logowaniem i wylogowaniem, prywatnym bucketem, kontrolą środowisk i obsługą wygasłej sesji. Test A/B/anon przez rzeczywiste API/Storage przeszedł; szczegóły i granice w [handoffie T03](handoffs/2026-10-11-T03-konta-prywatnosc.md). Hosting pozostaje T11.

### T04 — Edytor planu i rzeczywiste 1RM

- Status: done. Właściciel: Codex (sesja T04, 2026-10-11). Zależności: T02, T03 — spełnione.
- Zakres: tworzenie planu, tygodni/dni, kolejności i grup ćwiczeń, indywidualnych serii, własnych ćwiczeń, uwag; maksima z datami i przeliczanie kg.
- Odbiór: ręcznie powstaje plan A/B z różnymi seriami; edycja tworzy wersję; brak 1RM nie blokuje planu.
- Weryfikacja: scenariusz edycji i test procentów, daty maksimum, zaokrągleń i zachowania historii.
- Wynik: prywatny edytor A/B, atomowa publikacja kolejnych wersji, własne ćwiczenia, datowane rzeczywiste 1RM i podgląd obciążenia. Testy komponentu, domeny, lokalnego Auth/API A/B/anon, build i kontrola typów przeszły; szczegóły w [handoffie T04](handoffs/2026-10-11-T04-edytor-planu-1rm.md). Zapis treningu pozostaje T05.

### T05 — Wykonanie i historia treningu

- Status: done. Właściciel: Codex (sesja T05, 2026-10-11). Zależności: T04 — spełniona.
- Zakres: start/wznowienie/zakończenie, zapis i poprawka serii, pominięcie, komentarze, dodatkowe ćwiczenia, poprzedni wynik, idempotentne komendy.
- Odbiór: trening można ukończyć ręcznie i odczytać po ponownym logowaniu; zmiana planu/1RM nie zmienia jego celów; podwójny zapis nie duplikuje wyniku.
- Weryfikacja: E2E treningu, timeout po zapisie, konflikt dwóch kart, izolacja danych i przerwana sesja.
- Wynik: ręczny trening, historia, poprzedni wynik i komendy transakcyjne z rewizją/idempotencją działają lokalnie. Testy domenowe, Auth/API A/B/anon, HTTP E2E Next, typy i build przeszły; szczegóły oraz ograniczenia w [handoffie T05](handoffs/2026-10-11-T05-wykonanie-historia.md).

## Etap 2 — import planów

### T06 — Próby AI i niezawodny import

- Status: done. Właściciel: Codex (sesja prawdziwych prób i rozszerzenia T06, 2026-10-12). Zależności: T03, T04 — spełnione.
- Zakres: zestaw źródeł testowych, adapter OpenAI, schemat odpowiedzi, limity wejścia/kosztu, prywatne uploady, trwałe stany/próby importu, retencja i sprzątanie; po potwierdzeniu użytkownika także natywny XLSX, PDF do 6 stron i kontrakt pytań. Ekran pytań należy do T07.
- Odbiór: PDF, XLSX, obraz i tekst tworzą walidowany szkic; niejasne wartości są pytaniami lub uwagami, a błędy/odmowa/anulowanie/timeout nie tworzą aktywnego planu. Mechanizm mieści się w lokalnych limitach 120 s adaptera, 150 s funkcji i 180 s dzierżawy. Hosting pozostaje do sprawdzenia w T11.
- Weryfikacja: [raport v8](reports/2026-10-12-T06-live-v8.json) z 12 prawdziwych syntetycznych prób, sprawdzenie trzech prywatnych źródeł przez adapter i walidator, lokalne A/B/anon, HTTP, retry, błędny plik, pytania, kontrola własności, sprzątanie, typy i build. [Kontrakt i granice](T06_IMPORT.md), [handoff](handoffs/2026-10-12-T06-proby-realne-pliki.md).
- Wynik: 12/12 szkiców i 90/90 ocenianych pól, zero opuszczeń/dopowiedzeń, p50 6,223 s i p95 32,102 s. Prywatny PDF dał 3 treningi i 12 pytań; krótszy XLSX 3 treningi i 6 pytań; wielotygodniowy XLSX 13 bloków i 55 pytań o niepodane liczby serii. Te szkice wymagają przeglądu przed zatwierdzeniem; nie stanowią miary skuteczności na dowolnych źródłach.
- Pozostałe granice: brak ekranu pytań i korekty (T07), rzeczywistych urządzeń (T10) i hostowanego testu Vercel/Supabase oraz kontroli kosztu na produkcji (T11). Panel OpenAI pokazuje łączny opóźniony koszt organizacji, a nie dokładny rachunek jednej serii.

### T07 — Aparat, pliki i korekta importu

- Status: done. Właściciel: Codex (sesja T07, 2026-10-12). Zależności: T06 — spełniona.
- Zakres: wybór PDF/XLSX/zdjęcia, aparat, wklejenie tekstu, postęp importu, źródło obok szkicu, ekran pytań zamkniętych i ilościowych, poprawki i zatwierdzenie.
- Odbiór: plan ze zdjęcia da się poprawić i zapisać; nieczytelne pola są widoczne; oryginalna kolejność i notatki pozostają; powtórzone zatwierdzenie nie duplikuje planu.
- Weryfikacja: prawdziwe urządzenia, odmowa aparatu, niewspierany format zdjęcia i odzyskanie szkicu po odświeżeniu.
- Wynik: mobilny ekran źródła, aparatu, postępu, listy importów, pytań i korekty z jawnym zatwierdzeniem; prywatny podgląd oraz zapis korekty przy zadaniu. Testy komponentu, lokalne Auth/API/Storage A/B/anon, HTTP z mockiem AI, typy i build przeszły. Brak fizycznego telefonu; emulator Android wykryto, lecz nie wykonano na nim pełnej ścieżki. [Handoff T07](handoffs/2026-10-12-T07-ekran-importu.md).

### T06-R1 — Wierny import rzeczywistych tabel

- Status: done. Właściciel: Codex (2026-10-13). Zależności: T04, T06, T07 — spełnione.
- Zakres: porównanie trzech źródeł użytkownika, kontekst tabel, zakresy i serie opcjonalne, AMRAP, superserie, pytania ze stabilnymi celami, PDF.js/XLSX oraz wewnętrzny słownik PL/EN.
- Odbiór: brak pytań o jawne wartości, zachowane zakresy i oryginały, pełny podgląd, korekta po odświeżeniu/przestawieniu, prywatność, retry i niezmienność historii; starsze szkice pozostają obsługiwane.
- Weryfikacja: rzeczywiste źródła i AI w pozostałym zatwierdzonym budżecie T06, regresje domeny/UI/API/A/B/anon, typy i build; lokalne wyniki i ograniczenia są w [handoffie](handoffs/2026-10-13-T06-R1-import-tabel.md).

- Wynik: trzy źródła przyjęte; PDF 30 ćwiczeń i 1 uzasadnione pytanie, FBW 19 ćwiczeń i 6 pytań, Madzia 12 jednostek i 17 pytań o semantykę bloków. Zakresy/AMRAP/superserie, pełny podgląd PDF/XLSX, słownik i kompatybilne migracje wdrożone. Lokalny Chrome sprawdził strony/arkusze, mobile, korektę/reload i kolejność. Regresje/API/prywatność, typy i build przeszły. Hosting i fizyczne urządzenia nie są odbiorem T06-R1.

### T07-R1 — Czytelny przegląd importu

- Status: done. Właściciel: Codex (2026-10-13). Zależności: T07, T06-R1 — spełnione.
- Zakres: trzy kroki, kompaktowe karty i edycja bloków, superserie, modalna ankieta, źródło na żądanie oraz trwały etap i potwierdzenia.
- Odbiór: brak rozwiniętych formularzy wszystkich serii, zachowane różnice i braki, stabilne odpowiedzi, korekta/reload, prywatność i retry; ręczny edytor poza zakresem.
- Weryfikacja: zapisane wyniki trzech rzeczywistych źródeł, domena/UI, lokalne API/prywatność, Chrome desktop/mobile, typy i build; bez nowych płatnych prób AI.

- Wynik: trzy kroki, kompaktowe karty i bloki, ankieta/dialog, źródło na żądanie oraz trwały etap i potwierdzenia wdrożone. Testy domeny/UI, lokalne T06/T06-R1 i HTTP A/B/anon/retry, Chrome na trzech źródłach, typy i build przeszły; bez nowych wywołań AI. [Handoff](handoffs/2026-10-13-T07-R1-przeglad-importu.md).

### T04-R1 — Czytelny ręczny edytor planu

- Status: done. Właściciel: Codex (2026-10-13). Zależności: T04, T06-R1, T07-R1 — spełnione lokalnie.
- Zakres: jeden trening, podgląd całości, kompaktowe karty, modalna edycja ćwiczeń/bloków/serii, zakresy i dodatkowe pola na żądanie, katalog i głos, bez zmian API lub migracji.
- Odbiór: czytelny nowy i istniejący plan; zachowane parametry/metadata i historia, anulowanie bez zmian, zapis całej wersji i retry; import zachowuje trzy kroki.
- Weryfikacja: domena/UI, npm test/build/typecheck, lokalne T04, Chrome desktop/mobile i regresja T07-R1; bez płatnych prób AI i publikacji prywatnych fixtures.
- Wynik: kompaktowy ręczny edytor nowych i istniejących planów wdrożony lokalnie. 122 testów, build, typy, lokalne T04, syntetyczny Chrome z prawdziwym zapisem/retry i niezmiennością snapshotów oraz HTTP T07-R1 przeszły. Fizyczne urządzenia i hosting niesprawdzone. [Handoff](handoffs/2026-10-13-T04-R1-czytelny-edytor.md).

## Etap 3 — postęp i głos

### T08 — Podstawowe monitorowanie postępu

- Status: done. Właściciel: Codex (sesja T08, 2026-10-12). Zależności: T05 — spełniona.
- Zakres: historia ćwiczenia, ciężar/powtórzenia, wykonanie planu i porównywalna objętość; filtry wariantu i daty.
- Odbiór: wyniki są wyliczane z wykonanych serii; pominięte nie są zerowymi wynikami; masa ciała/asysta nie jest sumowana jak ciężar sztangi; estymacja nie staje się rzeczywistym 1RM.
- Weryfikacja: znany zestaw treningów i ręcznie obliczone oczekiwane wyniki, edycja historycznej serii odświeża statystyki.
- Wynik: prywatny polski widok `/postep` z filtrem ćwiczenia/wariantu i dat, wynikami serii, wykonaniem planu i objętością porównywalnych serii. Test domenowy 940 → 1140 kg po poprawce, lokalne Auth/PostgREST i HTTP A/B/anon, typy i build przeszły; urządzenia i hosting niesprawdzone. [Handoff T08](handoffs/2026-10-12-T08-postep.md).

### T09 — Dyktowanie planów i danych treningu

- Status: done. Właściciel: Codex (T09; rozstrzygnięcie użytkownika 2026-10-14). Zależności: T05, T06, T07 — spełnione lokalnie. D025 przenosi odbiór fizycznego telefonu po wdrożeniu Vercel do T10-R1; istniejące dowody lokalne pozostają bez zmian.
- Zakres: nagrywanie, transkrypcja, interpretacja planu/serii/poprawki/komentarza/dodatkowego ćwiczenia, karta zatwierdzenia, obsługa konfliktów i anulowania.
- Odbiór: wszystkie scenariusze głosowe mają odpowiednik ręczny; podgląd wskazuje cel; korekta liczb działa; anulowane i opóźnione wyniki nie zapisują się samoczynnie.
- Weryfikacja: polskie wypowiedzi i hałas, brak mikrofonu, próby WebM/MP4 na emulatorze Android, duplikaty, negacja, zmiana aktywnego ćwiczenia podczas przetwarzania; raport kosztu i opóźnienia. Użytkownik 2026-10-14 dopuścił dalszą implementację, a fizyczny odbiór wykona po wdrożeniu Vercel (D025/T10-R1). Pełny klikalny E2E aplikacji na emulatorze oraz fizyczne telefony i Safari pozostają niesprawdzone.
- Wynik lokalny: nagrywanie WebM/MP4, transkrypcja, walidowane propozycje planu i danych treningu, karta celu i wartości oraz jawny zapis przez T04/T05. Po zatwierdzeniu limitu 0,50 USD cztery serie prawdziwego API na syntetycznych danych dały po poprawce promptu 20/20 tekstowych przypadków, poprawny plan i 2/2 nagrań, p50/p95 tekstu 4,351/8,622 s, audio 0,552/0,552 s oraz łączny szacunek 0,010376 USD. [Raport końcowy](reports/2026-10-12-T09-live.json) i [próby wcześniejsze](reports/2026-10-12-T09-live-v1.json) dokumentują błędy i ograniczenia. Dodano obsługę asynchronicznego błędu rejestratora; 67 testów jednostkowych, lokalne i HTTP T09 A/B/anon, T05, typy oraz build przeszły bez nowego kosztu API. Chrome na emulatorze Android sprawdził uprawnienie mikrofonu, WebM/Opus 48 449 B, wymuszone MP4 31 685 B i anulowanie na tymczasowej stronie testowej. Opóźniony wynik i zmiana ćwiczenia są potwierdzone testami komponentów i rewizji, nie pełnym klikalnym E2E emulatora. Fizyczny telefon i Safari pozostają niesprawdzone; [najnowszy handoff T09](handoffs/2026-10-13-T09-odbior-emulator.md).

## Etap 4 — beta dla testerów

### T10 — Odbiór funkcjonalny i poprawki

- Status: done. Właściciel: Codex (2026-10-14). Zależności: T07, T08, T09 — spełnione lokalnie zgodnie z D025.
- Zakres: lokalne scenariusze TESTING, dostępność i UX w przeglądarce, obsługa błędów, przegląd polityk i kosztów oraz poprawki. Odbiór fizycznych urządzeń po wdrożeniu należy do T10-R1.
- Odbiór: krytyczne scenariusze przechodzą; brak znanych błędów izolacji danych, utraty/duplikacji wyników i cichych mutacji AI; pozostałe problemy mają zadania i priorytety.
- Weryfikacja: [raport T10](T10_ACCEPTANCE.md) i [handoff](handoffs/2026-10-14-T10-odbior-lokalny.md), manifest źródeł bez Git; 159 testów, build/typy, rzeczywiste lokalne Auth/API/Storage/Mailpit oraz syntetyczny Chrome desktop/mobile. Wszystkie sekcje przeszły, Chrome treningu po poprawkach testu powtórzono osobno.
- Wynik: zamknięty bezpośredni DML planów/katalogu, JSON 400 dla błędnego wejścia i 401 API bez sesji, wykluczenia prywatnych fixtures i .env; retry/wersje/snapshoty, trening/historia/postęp i A/B/anon potwierdzone lokalnie. Fizyczny odbiór po T11 w T10-R1; hosting niesprawdzony.

### T10-R1 — Odbiór na urządzeniach po wdrożeniu

- Status: todo. Właściciel: użytkownik (odbiór fizyczny). Zależności: T11.
- Zakres: pełna ścieżka aplikacji po HTTPS na fizycznym telefonie, w tym Safari/iPhone i Chrome/Android w miarę dostępności; aparat, mikrofon, nagrania, anulowanie, opóźniona odpowiedź, zmiana ćwiczenia i nawigacja/klawiatura.
- Odbiór: zapisany wynik użytkownika z urządzeniem, systemem, przeglądarką i adresem/wersją wdrożenia; błędy otrzymują priorytet i poprawkę. Brak wyniku nie jest zgodnością urządzenia.
- Weryfikacja: lista kroków w TESTING; użytkownik wykona odbiór po Vercel. T11 może dostarczyć środowisko odbioru po lokalnym T10, ale szersza beta czeka na T10-R1.

### T11 — Wdrożenie i instrukcja testera

- Status: review. Właściciel: Codex (T11, sesja weryfikacji usług 2026-10-16). Zależności: T10 — spełniona lokalnie; projekt Vercel i produkcyjny Supabase wskazane/połączone przez użytkownika, dostęp do ustawień przez Chrome. Fizyczny odbiór użytkownika po wdrożeniu w T10-R1 (D025).
- Zakres: Vercel/Supabase/OpenAI, sekrety, migracje, limity wydatków, logi, retencja, backup/odtworzenie, instrukcja dostępu i zbierania zgłoszeń.
- Odbiór bieżącego etapu po D029: działający HTTPS dla właściciela na Production, test całej ręcznej ścieżki na wdrożeniu i dwóch syntetycznych kontach, udokumentowane cofnięcie wdrożenia i ograniczenia. SMTP/dostarczenie zaproszeń przed dodaniem kolegów; AI bez nowego budżetu wyłączone. Telefon i szersza beta nadal T10-R1.
- Weryfikacja: smoke test wdrożenia, kontrola środowisk i sekretów oraz procedur awarii; link dopiero po rzeczywistym udanym wdrożeniu.
- Przygotowanie: [procedura T11](T11_DEPLOYMENT.md), [instrukcja testera](TESTER_GUIDE.md), lokalny manifest 94 plików/20 migracji i bezpieczna kopia. Build/typy czystej kopii oraz kontrole wysyłki lokalnej przeszły. Oficjalny dry-run Vercel i lista projektów Supabase odrzucone z braku poświadczeń; niczego nie wdrożono. [Handoff](handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md).
- Dalsza praca: T11-E1 zakończyło porządkowanie konfiguracji istniejącej integracji. D029: tylko Production do bieżących testów właściciela; brak preview nie blokuje. Migracje hostowane21/21 i rzeczywisty smoke HTTP/Auth/API/Storage przeszły po T11-C1; klikalny UI i pozostałe warunki operatorskie otwarte. Przed pełnym odbiorem także SMTP, koszty/AI, transport audio 5 MiB wobec 4,5 MB Vercel, cleanup/backlog i dowód odtworzenia. SMTP przed mailowymi zaproszeniami; obecnie możliwe ręczne konta. Pozostają warunkami T11, bez nowych funkcji produktu.

Aktualizacja T11 po D031: Auth minimum12 i URL-e zapisane po zgodzie; cron200 na pustej kolejce potwierdzony. Priorytet bieżącej pracy: włączyć import AI po prywatnym dodaniu klucza i zgodzie5USD łącznie na start, sprawdzić jedną próbę i przekazać prototyp do testów właściciela. Backup/restore, monitoring i dalszy odbiór operatorski odłożone; nie są warunkiem rozpoczęcia jego testów. T11 review po przekazaniu prototypu; T10-R1 nie jest done. Import i krótki głos sprawdzone, dalsza praca od feedbacku. Bez nowej implementacji backupu i nowych usług.

### T11-G1 — Inicjalizacja Git i pierwszy commit

- Status: done. Właściciel: Codex (2026-10-14). Zależności: jawne zlecenie użytkownika i utworzone repo GitHub — spełnione.
- Zakres: inicjalizacja main, kontrola indeksu pod kątem sekretów/prywatnych plików, pierwszy commit i push do wskazanego `gisupanalizy/training-plan-app`.
- Odbiór: commit lokalny i zdalne main wskazują ten sam SHA; lokalne .env oraz fixtures/t06/real pozostają ignorowane. Nie oznacza wdrożenia Vercel ani odblokowania dostępu Supabase.
- Weryfikacja i wynik: [handoff](handoffs/2026-10-14-T11-G1-pierwszy-commit.md).

### T11-E1 — Zmienne integracji Supabase

- Status: done. Właściciel: Codex (2026-10-16). Zależności: T03/T06 i jawne zlecenie uporządkowania konfiguracji — spełnione.
- Zakres: odczyt automatycznych zmiennych STORAGE_, zgodność lokalna, rozdział sekretów i środowisk, usunięcie ręcznych duplikatów w Vercel i uzupełnienie ustawień aplikacji.
- Odbiór: konfiguracja działa bez kopiowania kluczy; błędne/mieszane środowisko jest odrzucane; sekrety pozostają serwerowe; jawny stan zmian Vercel i wymaganych migracji/odbioru T11.
- Wynik: kod i testy lokalne gotowe (171 passed/9 skipped, build/typy, lokalne HTTP A/B/anon). W Vercel osiem ręcznych ustawień tylko Production; po jawnym potwierdzeniu usunięto trzy ręczne duplikaty i potwierdzono zachowanie integracji. Odbiór hostingu pozostaje w T11. [Handoff](handoffs/2026-10-16-T11-E1-usuniecie-duplikatow.md).

### T11-C1 — Konflikty biznesowe bez zapętlenia PostgREST

- Status: done. Właściciel: Codex (2026-10-16). Zależności: T10, T11-E1 — spełnione; wykryte podczas rzeczywistego smoke T11.
- Zakres: kompatybilna migracja zmieniająca pięć biznesowych RAISE 40001 na PT409 w dwóch funkcjach, mapowanie API na 409, kontrole lokalne, nowy manifest i po zatwierdzeniu migracja/nowy build produkcji.
- Odbiór: rzeczywisty stary revision i sprzeczny payload wracają szybko jako 409; poprawny retry nadal idempotentny, bez zmiany danych, snapshotów i grantów.
- Wynik: migracja21 zastosowana po zgodzie użytkownika, kod ddaceb3 wypchnięty i Ready. Lokalnie T04/T05, 171 testów, build/typy; poHTTPS rzeczywisty stary revision daje PT409/409, retry idempotentny i pełny ręczny smoke przeszedł. Dwie pierwsze próby wykazały400/timeout; trzecią zatrzymało błędne oczekiwanie testu historii, po jego poprawie sukces. T11 pozostaje w toku z powodu UI/Auth/cron/restore.

## T13 — mobilny plan i dziennik po feedbacku właściciela

Wymagania, kontrakty, właściciele plików i pełne bramki: [specyfikacja T13](T13_MOBILE_WORKOUT.md). A/B/C mają lokalne bramki przyjęte i pozostają review do E; D–E to prace przyszłe. Sam zapis dokumentacji nie upoważnia do ich uruchomienia; potrzebne osobne zlecenie użytkownika. Domyślnie sekwencyjnie, jeden integrator, bez agentów w tle.

### T13 — Wygodne planowanie i prowadzenie treningu na telefonie

- Status: in_progress. Właściciel: Codex — integrator T13 (2026-10-17). Zależności: T13-P i lokalne T03/T04/T05/T06-R1/T04-R1/T09/T11-C1 — gotowe; realizacja przez A–E poniżej, bez zależności od odłożonego T12.
- Zakres: pełne R01–R16 z uzgodnionego planu, zachowane w specyfikacji. ID nadrzędne pozostaje po podziale; żadne wymaganie nie znika.
- Odbiór: bramki A–D oraz niezależny E, bez krytycznych błędów utraty/duplikacji danych, własności lub historycznych celów; prawdziwa lokalna aplikacja mobile. Fizyczny T10-R1 i hosting T11 pozostają osobno.

### T13-P — Podział i kontrakty przekazania

- Status: done. Właściciel: Codex — integrator dokumentacji (2026-10-17). Zależności: uzgodniony plan w chacie „Opisz możliwości aplikacji” oraz jawne zlecenie podziału — spełnione.
- Zakres: rejestr wymagań, etapy A–E, zależności, właściciele plików, usuwanie/retry, datowanie i niezmienność celów, osobne prompty i karty przyszłych handoffów.
- Odbiór: pełne pokrycie wymagań, spójne kontrakty i linki; tylko dokumentacja, bez implementacji/agentów. Wyniki w [handoffie podziału](handoffs/2026-10-17-T13-podzial-etapow.md).

- Wynik: R01–R16, kontrakty i podział gotowe; kontrola 23 plików/184 linków, promptów i szablonów oraz git diff --check przeszła. Bez implementacji.

### T13-A — Sesje/API/datowanie

- Status: review. Właściciel: Codex — wykonawca A i integrator (2026-10-17); lokalna bramka przyjęta, zamknięcie po E. Zależności: T13-P, T03/T04/T05/T06-R1/T11-C1; osobne zlecenie implementacji.
- Pliki: API/repozytorium treningów, wspólny czas i daty postępu, nowe migracje i testy; szczegółowy wyłączny przydział w specyfikacji.
- Kontrakt/odbiór: R09–R13/R16 i bramka A — owner lock, jeden nowy aktywny, legacy indywidualnie, atomowy replace, delete z późnym retry bez odtworzenia, spójny GET, korekta czasu bez zmiany snapshotów/1RM. Rzeczywiste lokalne A/B/anon, concurrency/rollback/retry/legacy, regresje, build/typy.
- Wynik/przekazanie: [rzeczywisty handoff A](handoffs/2026-10-17-T13-A-sesje-api-datowanie.md); lokalne RPC/HTTP A/B/anon, migracja/replay, concurrency/rollback/retry/legacy/daty/snapshoty, regresje, 180 passed/9 skipped, build/typy PASS. Integrator przyjął bramkę A, a B wykonano po osobnym zleceniu 2026-10-18. Done dopiero po E. [Prompt A](prompts/T13-A.md) i [karta szablonowa](handoffs/planned/T13-A.md) zachowane jako materiały historyczne.

### T13-B — Podgląd planu

- Status: review. Właściciel: Codex — wykonawca B i integrator (2026-10-18); lokalna bramka przyjęta, zamknięcie po E. Zależności: T13-A w review z przyjętą bramką/kontraktem, T04-R1/T06-R1 done; osobne zlecenie B.
- Pliki: strona/podgląd planu, wspólne podsumowania i style przejęte od integratora; bez zmian kontraktu zapisu.
- Odbiór: R01–R03/R15/R16 i bramka B — selektor bez tygodni, krótkie karty/rozwijanie, wierne bloki i warianty, cały plan i wersje; 360/390/430 px, cztery karty 390×844, regresja edytora/importu, testy/build/typy.
- Wynik/przekazanie: [rzeczywisty handoff B](handoffs/2026-10-18-T13-B-podglad-planu.md); lokalne Auth/DB/UI, mobile360/390/430, cztery pełne karty390×844, wybór/wersje/cele44/fokus, regresje edytora i syntetycznego importu,190 passed/9 skipped, build/typy PASS. Integrator przyjmuje bramkę dla C; B review do E, C wymaga osobnego zlecenia. [Prompt B](prompts/T13-B.md) i [karta szablonowa](handoffs/planned/T13-B.md) pozostają materiałem historycznym.

### T13-C — Prowadzenie treningu

- Status: review. Właściciel: Codex — jedyny wykonawca C i integrator (2026-10-18); przejęte pliki C, globals.css oraz nowy runner scripts/test-t13c-browser.mjs, bez zmian SQL/API. Zależności: A/B w review po przyjętych bramkach, T09 done; osobne zlecenie C.
- Pliki: start, edytor/komponenty treningu, głos i widok szczegółów, przejęte style; kontrakty A i podsumowania B bez samowolnych zmian.
- Odbiór: R04–R11/R13/R15/R16 i bramka C — jedna seria, superserie/opcjonalne, szkice/retry/409/głos, bez reload, konflikt/finish/delete/legacy i korekta czasu przy finish; prawdziwa lokalna aplikacja 360/390/430 px oraz API/testy/build/typy.
- Wynik/przekazanie: [rzeczywisty handoff C](handoffs/2026-10-18-T13-C-prowadzenie-treningu.md). Pełna lokalna bramka C PASS: rzeczywiste Chrome/API, szkice/retry/409/głos mock, superserie/null/0/poprawka, konflikt/legacy/replace/finish/delete,360/390/430 px i cztery karty390×844,198 passed/9 skipped, build/typy. Integrator przyjmuje bramkę dla D i zwalnia style. C review do E; D tylko po osobnym zleceniu. [Prompt C](prompts/T13-C.md) i [karta szablonowa](handoffs/planned/T13-C.md) pozostają materiałami historycznymi.

### T13-D — Kalendarz historii

- Status: todo. Właściciel: — (przyszły wykonawca D). Zależności: A/C w review po przyjętych bramkach, sekwencyjnie także B, T08 done; osobne zlecenie D.
- Pliki: historia, komponenty/testy kalendarza, przejęte style; rozszerzenie repozytorium tylko po przydziale przez integratora.
- Odbiór: R14–R16 i bramka D — miesiąc pon.–niedz., Dzisiaj, wiele sesji, Wznów osobno, otwieranie C, legacy/nieznana godzina, północ/DST i korekta zgodna z filtrami; lokalny mobile i testy/build/typy.
- Przekazanie: [prompt D](prompts/T13-D.md), [karta handoffu D](handoffs/planned/T13-D.md). Review do E.
- W planie wybranego UI T15 realizować razem z [T15-D](prompts/T15-D.md); nie zlecać dwóch niezależnych kalendarzy.

### T13-E — Niezależny odbiór

- Status: todo. Właściciel: — (recenzent inny niż wykonawca A–D, ręcznie zlecony nowy chat). Zależności: A–D w review po bramkach i rzeczywiste handoffy; osobne zlecenie E. Bez automatycznego uruchamiania.
- Pliki: osobny raport odbioru i handoff, ewentualne niezależne testy; poprawki produkcyjne wracają do właścicieli przez jednego integratora.
- Odbiór: niezależne R01–R16, A/B/anon, concurrency/delete/late retry/rollback/daty/1RM/szkice oraz klikalny lokalny mobile, zintegrowane testy/build/typy. Wynik każdego R i ograniczenia jawnie. Integrator zamyka A–D/T13 dopiero po spełnieniu kryteriów; T11/T10-R1 bez pozornego done.
- Przekazanie: [prompt E](prompts/T13-E.md), [karta handoffu E](handoffs/planned/T13-E.md).
- W planie T15 niezależny odbiór obejmuje [T15-G](prompts/T15-G.md); zachować pełne kryteria T13-E bez dublowania wykonania.

## Po testach bety

### T12 — Eksperyment Decisions / Jev / głos na żywo

- Status: deferred. Właściciel: —. Zależności: T09, feedback testerów i dostęp do porównywanych API.
- Zakres: porównanie prostego przepływu z klasyfikacją OpenAI Decisions i TypeSafe Jev przez Vercel AI Gateway oraz ewentualną sesją Live/Realtime. Brak obowiązku wdrożenia dodatkowego dostawcy.
- Odbiór: decyzja oparta na jakości, liczbie poprawek, koszcie i czasie; wybrany wariant zachowuje wspólne komendy, uprawnienia i zatwierdzanie.
- Weryfikacja: powtarzalne porównanie na tym samym zestawie przypadków i zapis decyzji w DECISIONS.


## T14 — Czytelność UI i warianty mobilnych ekranów

- Status: review. Właściciel: Codex — projektant mock-upów (2026-10-18), jedyny wykonawca; trzy warianty gotowe do wyboru użytkownika.
- Zależności: istniejący interfejs i dokumentacja T04/T05/T13-B oraz jawne zlecenie użytkownika przygotowania opcji — spełnione. Nie wymaga ukończenia C/D; nie przejmuje ich plików.
- Zakres: analiza obecnego UI, trzy propozycje mobilnych układów głównych ekranów, czytelne ikony ćwiczeń, skróty serii/obciążeń/przerw i rozdzielone szczegóły. Wyłącznie dokumentacja i niezależne mock-upy na danych syntetycznych.
- Pliki: docs/design/t14-*, nowy handoff T14, wpisy w ROADMAP/STATUS/CHANGELOG/DECISIONS. Bez edycji src, migracji i konfiguracji usług.
- Odbiór: trzy porównywalne warianty obejmujące listę planów, podgląd treningu, szczegóły ćwiczenia i zapis serii; przegląd w przeglądarce, brak poziomego overflow wewnątrz ekranów 360/390/430 px, klawiatura i czytelne jednostki. Wybór i wdrożenie dopiero po decyzji użytkownika.

- Wynik T14: [galeria czterech ekranów × trzy warianty](design/t14-mockupy.html), [analiza i ograniczenia](design/t14-analiza-i-warianty.md), 126 kontroli szerokości bez overflow i zaliczone interakcje syntetyczne. A ma 2 px obrysu czwartej karty poza widokiem; C pokazuje dwie pełne karty — przed wdrożeniem zachować/uzgodnić bramkę T13. Bez zmiany aplikacji i bez wybranego kierunku.


### T14-S — Połączenie wybranych ekranów i swipe planów

- Status: review. Właściciel: Codex — jedyny projektant mock-upu (2026-10-18). Zależności: gotowe T14 i jawny wybór użytkownika A/A/A/C — spełnione.
- Zakres: jeden spójny mock-up: Plany/Podgląd/Szczegóły A, Zapis serii C. Przy wielu planach poziomy swipe lewo/prawo, z przyciskami i wskaźnikiem pozycji jako uzupełnieniem. Bez automatycznego przesuwania.
- Pliki: nowe docs/design/t14-selected*, dokumentacja wyboru, rzeczywisty handoff. Oryginalna galeria A/B/C zostaje zachowana. Bez src, usług i migracji.
- Odbiór: cztery wybrane ekrany, trzy syntetyczne plany w karuzeli, działające gesty/przyciski/klawiatura i spójna nazwa wybranego planu; 360/390/430px, cztery pełne karty w Podglądzie390×844.


### T14-P — Prywatny plan PDF i pełna galeria pozostałych ekranów

- Status: review. Właściciel: Codex — jedyny wykonawca (2026-10-18). Zależności: wybór A/A/A/C i jawne zlecenie użycia wskazanego PDF oraz pełnego zestawu pozostałych ekranów — spełnione.
- Zakres: prywatny podgląd rzeczywistego planu z PDF; trzy warianty Startu, Importu, Korekty importu, Edytora, Historii, Postępu, Profilu i Logowania. Zachować wybrane cztery ekrany i swipe planów T14-S.
- Prywatność: treść PDF, odczyt, prywatny HTML/zrzuty/raport wyłącznie poza repo. W repo generyczne narzędzia, publiczne makiety na syntetycznych danych i dokumentacja bez treści prywatnego planu. Wyniki/historia tylko demonstracyjne, bez udawania odczytu konta.
- Odbiór: komplet ośmiu ekranów × trzy warianty, przełączanie i zapis preferencji lokalnie, trzy realne jednostki ze źródła w prywatnej galerii, brak zgadywania kg/1RM/niejasnych celów; Chrome360/390/430px, kliknięcia i syntetyzowany swipe. Bez wdrożenia produktu/API/AI.

- Wynik T14-S/P: [specyfikacja wyboru](design/t14-selected-spec.md), [pełna galeria syntetyczna](design/t14-full-gallery.html), prywatna galeria poza repo. Po trzy warianty ośmiu nowych ekranów, zachowane A/A/A/C.192 publiczne i372 prywatne kontrole szerokości PASS; syntetyczny touch/klawiatura i interakcje PASS. Cztery pełne karty390×844, brak zmiany bramki T13. Review czeka na wybory pozostałych ekranów.


### T14-R2 — Czytelne kroki importu, gesty, ilustracje i wykresy

- Status: review. Właściciel: Codex — jedyny projektant (2026-10-18). Zależności: gotowa galeria T14-P i jawny feedback użytkownika — spełnione.
- Zakres: odrębna treść kroków Ćwiczenia/Serie/Podsumowanie, rzeczywisty gest przesuwania także myszą w mock-upie, pełna klikalność kart, zastąpienie szkicowanych symboli gotową biblioteką po sprawdzeniu pochodzenia/licencji, trzy warianty Postępu z wykresami i danymi potrzebnymi do interpretacji.
- Pliki: generyczny generator/runner T14, zasoby publiczne z atrybucją, dokumentacja i nowy handoff; prywatny HTML/obrazy nadal poza repo. Bez src, usług, płatności lub płatnego AI.
- Odbiór: różne zadania i treści w trzech etapach importu, drag/touch bez przypadkowego otwierania, karty otwierane także przez parametry, każdy wariant Postępu z opisanym wykresem, publiczna/prywatna galeria360/390/430px i cztery karty390×844.
- Wynik: odrębne etapy, pełne karty, gesty i trzy warianty z wykresami gotowe do oceny. Workout Guide z lokalnymi zasobami/atrybucją; brakujące warianty mają neutralny znacznik.564 kontrole szerokości i prywatne interakcje R2 PASS. Publiczny runner R2 zatrzymał się na drag myszą; diagnozę blokuje limit automatycznej kontroli uprawnień Chrome. To otwarte sprawdzenie, nie zaliczony test. [Handoff R2](handoffs/2026-10-18-T14-R2-import-gesty-wykresy.md).

### T14-K — Osobne porównanie kolorystyki

- Status: review. Właściciel: Codex — jedyny projektant (2026-10-18). Zależności: gotowe mock-upy i jawne zlecenie wariantów kolorystycznych — spełnione.
- Zakres: osobna galeria palet na tych samych mobilnych układach, z obecną paletą jako odniesieniem, podglądem ekranów i lokalnym wyborem. Zachować A/A/A/C i prywatne dane poza repo.
- Pliki: docs/design/t14-color-*, odsyłacz w pełnej galerii, dokumentacja i handoff. Bez wdrażania kolorystyki produktu.
- Odbiór: różne spójne palety jasne i ciemna, identyczna treść/układ przy porównaniu, czytelny tekst/akcje/wykresy, mobilna galeria i jawny brak zatwierdzonego wyboru.
- Wynik: sześć palet, wszystkie ekrany, porównanie/pojedynczy podgląd, lokalna preferencja i skala szarości. Publiczne216 + prywatne216 kontroli szerokości, bramka czterech kart, kontrast tokenów i interakcje PASS. [Handoff K](handoffs/2026-10-18-T14-K-kolorystyka.md). Po przywróceniu kontroli uprawnień ponowiony publiczny R2 także PASS; wcześniejszy błąd drag nie odtworzył się, przyczyna pozostaje nieustalona. Bez zmiany kodu gestu w tej sesji.

### T14-U — Konsultacja standardów i kolejności wyborów UI/UX

- Status: done (konsultacja, bez wdrożenia). Właściciel: Codex, jeden konsultant (2026-10-18). Zależności: gotowe galerie T14-P/K i pytanie użytkownika — spełnione.
- Zakres: rekomendacja procesu wyboru, zasad mobilnego UX i bibliotek; bez zmian makiet lub aplikacji.
- Odbiór: odpowiedź oparta na aktualnej dokumentacji dostawców, rozróżnienie propozycji i zatwierdzonych wyborów, handoff.

### T14-R3 — Kolejne wybory, edycja ćwiczenia i Postęp

- Status: review. Właściciel: Codex — jedyny projektant (2026-10-18). Zależności: galeria T14-K i jawne decyzje/feedback użytkownika — spełnione.
- Zakres: utrwalić Start A, Import C z wyśrodkowanymi ikonami i ikoną ręcznej edycji, Korekta A z doprecyzowaniem nagłówka, Edytor A z edycją całego ćwiczenia, Historia A i Logowanie C. Postęp: trzy propozycje ciężaru/powtórzeń, szersze daty i gest przybliżania po researchu źródeł pierwotnych. Profil: wyjaśnić i pokazać propozycję jednej historii wyników oraz rzeczywistego1RM do obliczeń.
- Pliki: docs/design/t14-r3-*, generyczny generator/galerie, dokumentacja/handoff. Prywatne dane poza repo. Bez src/API/DB/produkcji.
- Odbiór: wybrane ekrany dostępne jako potwierdzone; formularz całego ćwiczenia z parametrami i anulowaniem; wykresy pokazują faktyczne kg i powtórzenia z kontekstem, zakres cały/własny, gesty i alternatywne kontrolki; mobile360/390/430 i cztery karty390×844.
- Wynik: wybory utrwalone w danych galerii, edytor całego ćwiczenia i nowe propozycje Postępu A/B/C, źródła producentów, ręczny zmierzony1RM zachowany po doprecyzowaniu użytkownika (D042).192 publiczne +372 prywatne kontrole szerokości i interakcje PASS, syntetyczny pinch in/out oraz pionowy gest PASS.216 prywatnych kontroli palet i ciemny formularz PASS. [Handoff R3](handoffs/2026-10-18-T14-R3-wybory-edytor-postep.md). Postęp, układ Profilu i paleta czekają na wybór; bez implementacji src.

### T14-R4 — Uproszczony Postęp i edycja samą kartą

- Status: review. Właściciel: Codex — jedyny projektant (2026-10-18). Zależności: gotowe makiety R3 i szczegółowy brief użytkownika — spełnione.
- Zakres: usunąć osobny przycisk edycji; Postęp jako jeden jasny układ w wariancie z ciężarem i z masą ciała, metryki nad wykresem liniowym, daty pod osią X i rekordy osobiste. Domyślna analityczna metryka szacowanego1RM według nowego briefu, odrębna od rzeczywistego1RM profilu.
- Pliki: docs/design/t14-r4-*, generator i powiązana galeria, dokumentacja/handoff. Prywatne dane poza repo, bez src/API/DB.
- Odbiór: minimalny układ bez żółtego bannera/wyboru ciężaru/bąbelków, poprawne metryki i PR dla obu typów ćwiczeń, kontrolki i pinch, mobile360/390/430, pełna klikalność kart i zachowanie wcześniejszych wyborów.
- Wynik: jeden jasny Postęp z dwoma przykładami, pojedynczy wykres, metryki i zakresy w wskazanych miejscach, rekordy całej historii z datami; edycja wyłącznie całą kartą.192 publiczne +372 prywatne kontrole szerokości i interakcje R4 PASS;216 prywatnych kontroli palet PASS. D043 oddziela analityczny szacunek od ręcznego1RM profilu. [Handoff R4](handoffs/2026-10-18-T14-R4-minimalny-postep.md). Do oceny użytkownika, bez implementacji src.

### T14-R5 — Pochodzenie punktów, pomoc 1RM i domyślna Noc

- Status: review. Właściciel: Codex — jedyny wykonawca (2026-10-18). Zależności: R4 i feedback użytkownika — spełnione.
- Zakres: wyjaśnić punkt jako faktyczny wpis treningu (w makiecie syntetyczny), dodać dostępny dymek metody szacowania1RM i odczyt punktu, sprawdzić dotykowy swipe PR; Noc jako domyślna paleta wszystkich bieżących makiet.
- Odbiór: brak interpolowanych punktów, data/wartość/źródłowa seria po tap, pomoc przez klik/klawiaturę, PR przesuwane dotykiem, ciemny motyw po ponownym otwarciu; bez src/API/DB.
- Wynik: Noc i Profil A potwierdzone (D044), pomoc obliczeń i dokładny odczyt punktu; po dodatkowym feedbacku tylko punkt otwiera informację, klik poza nim zamyka. Publiczny/prywatny R5 i natywny swipe CDP104→0px PASS. Regresja192+372 szerokości i216 prywatnych kontroli palet przed ostatnią korektą hit-test PASS; końcowy R5 po korekcie PASS. Wszystkie wybory układów zamknięte; makiety do oceny, bez src.

### T14-R6 — Widoczna informacja po kliknięciu punktu myszą

- Status: review. Właściciel: Codex — jeden wykonawca (2026-10-18). Zależności: R5 i zgłoszenie użytkownika — spełnione.
- Zakres: naprawić konflikt kliknięcia punktu z przesuwaniem wykresu; zachować dotyk, zamykanie poza punktem i wszystkie wybory. Test rzeczywistego kliknięcia myszy w iframe, nie tylko focus/touch.
- Odbiór: data/metryka/seria są widoczne po kliknięciu, klik poza punktem zamyka, drag nie otwiera dymku i nie blokuje następnego kliknięcia; oba ćwiczenia, mobile i główna galeria. Bez src/API/DB.
- Wynik: pointer capture dopiero po progu drag, bez przejmowania zwykłego kliknięcia. Publiczny/prywatny R6:5 metryk w iframe, oba ćwiczenia, zamykanie, drag→klik,6 stanów360/390/430px, klawiatura i pierwszy tap po pinch PASS. Prywatna regresja R5 dotyku/pomocy/swipe PASS. [Handoff R6](handoffs/2026-10-18-T14-R6-klik-punktu-mysza.md). Bez zmiany wymagań D044 lub startu T15.

### T15-P — Plan wdrożenia wybranego UI

- Status: review. Właściciel: Codex — jeden planista/integrator (2026-10-18). Zależności: potwierdzone wybory T14 i jawne pytanie użytkownika o planowanie — spełnione.
- Zakres: sprawdzić istniejące moduły i zależności T13, przygotować etapy, własność plików, kryteria/testy, planowane handoffy i gotowe prompty; wskazać pozostałe decyzje.
- Odbiór: wykonalny plan bez powielania T13-D/E, odrębne zakresy autorów, jeden integrator, warunki rozpoczęcia. Bez uruchamiania innych agentów lub implementacji produktu w tej sesji.
- Wynik: [plan T15](T15_UI_IMPLEMENTATION.md), siedem promptów i siedem kart przyszłego handoffu. A–G niewykonane; do A potrzebne zlecenie implementacji, bez kolejnych decyzji o wyglądzie. W E pozostaje do zapisania techniczny kontrakt analityki. [Rzeczywisty handoff R5/P](handoffs/2026-10-18-T14-R5-T15-P-interakcje-i-plan.md).

### T15-U — Konsultacja delegowania i wznowienia

- Status: done (konsultacja). Właściciel: Codex — jeden konsultant (2026-10-18). Zależności: gotowy plan T15-P i pytanie użytkownika — spełnione.
- Zakres: ocena podziału A–G, udziału użytkownika i odzyskania pracy po limicie użycia. Bez implementacji lub uruchamiania subagentów.
- Odbiór: konkretna rekomendacja organizacji, granice autonomii i procedura wznowienia; propozycje nie zatwierdzają wdrożenia. [Handoff T15-U](handoffs/2026-10-18-T15-U-delegowanie-i-limity.md).

### T15-A — Fundament UI i domyślna Noc

- Status: review — bramka lokalna A przyjęta przez I (2026-10-18). Właściciel: /root/foundation, pliki zwolnione do I. Zależności: T15-P, zlecenie implementacji, manifest zastanych zmian.
- Zakres/odbiór/własność: [etap A](T15_UI_IMPLEMENTATION.md#a--fundament-noc-nawigacja-i-zasoby). Tokeny, AppShell, nawigacja, font/ilustracje, dostępne wspólne UI, kontrakty dla reszty. Bez przebudowy funkcji B–F.
- Przekazanie: [prompt A](prompts/T15-A.md), [karta A](handoffs/planned/T15-A.md). Medium; typy/testy/build i mobilny odbiór fundamentu.

### T15-B — Start, Plany i prowadzenie treningu

- Status: review — lokalna bramka B przyjęta przez I (2026-10-18). Właściciel: /root/workout_ui, zakres zwolniony do I. Zależności: bramka A, lokalne T13-A/B/C i zlecenie B.
- Zakres/odbiór/własność: [etap B](T15_UI_IMPLEMENTATION.md#b--start-plany-podgląd-szczegóły-i-zapis). Przenieść UI na działające komendy, zachować retry/szkice/konflikty i cztery karty.
- Przekazanie: [prompt B](prompts/T15-B.md), [karta B](handoffs/planned/T15-B.md). High; lokalne HTTP/Chrome i regresje T13-C.

### T15-C — Import, Korekta i Edytor

- Status: todo. Właściciel: nieprzypisany, rola C. Zależności: bramka A, istniejące T04-R1/T07-R1, zlecenie C.
- Zakres/odbiór/własność: [etap C](T15_UI_IMPLEMENTATION.md#c--import-korekta-i-edytor-całego-ćwiczenia). Układy C/A/A, pełna karta/formularz, różne etapy korekty; bez parserów/API.
- Przekazanie: [prompt C](prompts/T15-C.md), [karta C](handoffs/planned/T15-C.md). High; regresje edytora/importu na mocku AI.

### T15-D — Historia A razem z T13-D

- Status: todo. Właściciel: nieprzypisany, rola D. Zależności: bramki A/B i T13-A/C, jawne zlecenie D. To alias tej samej pracy funkcjonalnej T13-D, nie drugi kalendarz.
- Zakres/odbiór/własność: [etap D](T15_UI_IMPLEMENTATION.md#d--historia-a-realizowana-razem-z-t13-d). Kalendarz według wybranego UI z projekcją czasu A i przeglądem B/C, pełne R14–R16.
- Przekazanie: [prompt D](prompts/T15-D.md), [karta D](handoffs/planned/T15-D.md). Medium; oba ID review do G/T13-E.

### T15-E — Postęp z rzeczywistych wyników

- Status: in_progress. Właściciel: /root/progress; I /root (2026-10-18). Zależności: bramka A, datowanie T13-A, zlecenie E i zapis kontraktu obliczeń przez E/I przed agregacją.
- Zakres/odbiór/własność: [etap E](T15_UI_IMPLEMENTATION.md#e--postęp-z-rzeczywistych-wyników). Własne autoryzowane dane, rzeczywiste punkty, metryki/PR całej historii, pomoc i gesty, zachowana semantyka T08 i brak zapisu szacunku do profilu.
- Przekazanie: [prompt E](prompts/T15-E.md), [karta E](handoffs/planned/T15-E.md). High; domena, paginacja, izolacja A/B/anon, lokalny UI/API.

### T15-F — Profil A i Logowanie C

- Status: review — lokalna bramka F przyjęta przez I (2026-10-18). Właściciel: integrator /root, pliki zwolnione. Zależności: bramka A i zlecenie F.
- Zakres/odbiór/własność: [etap F](T15_UI_IMPLEMENTATION.md#f--profil-a-i-logowanie-c). Istniejące Auth i ręczny datowany1RM, zachowane historyczne cele, nowe układy bez zmiany kontraktów.
- Przekazanie: [prompt F](prompts/T15-F.md), [karta F](handoffs/planned/T15-F.md). Medium; formularze/Auth/klawiatura i właściwe regresje T04.

### T15-G — Integracja i niezależny odbiór z T13-E

- Status: todo. Właściciel: nieprzypisany, integrator I i niezależny recenzent G. Zależności: A–F review po bramkach, integracja I i zlecenie G.
- Zakres/odbiór/własność: [etap G](T15_UI_IMPLEMENTATION.md#g--integracja-i-niezależny-odbiór-wraz-z-t13-e). Cały przepływ, rzeczywiste lokalne API/DB, bramki T13-E, oddzielne ograniczenia urządzeń; bez samoczynnej publikacji.
- Przekazanie: [prompt G](prompts/T15-G.md), [karta G](handoffs/planned/T15-G.md). High; recenzent nie jest autorem A–F i nie poprawia src po cichu.

### GIT-S1 — Lokalny punkt kontrolny

- Status: done. Właściciel: Codex (2026-10-18), jawne zlecenie zapisania aktualnych zmian w Git.
- Zakres: bieżący kod T13, dokumentacja, publiczne makiety/generatory/zasoby T14 i plan T15, wraz z najnowszą konsultacją T15-U. Prywatne źródła poza repo; bez push/publikacji.
- Sprawdzenia: zakres, wykluczenia, skan wzorców danych wrażliwych i diff-check. Bez nowych testów funkcjonalnych dla samego zapisu. [Handoff](handoffs/2026-10-18-GIT-S1-zapis-stanu.md).

### T15-U2 — Prompt integratora CLI po konsultacji

- Status: done. Właściciel: Codex — jeden konsultant (2026-10-18). Zależności: T15-U i przekazana przez użytkownika rozmowa CLI — spełnione.
- Zakres: ocenić uwagi i przygotować pełne przyszłe zlecenie A–G z subagentami, bramkami, checkpointami i procedurą wznowienia. Nie uruchamiać implementacji lub delegowania podczas pisania promptu.
- Odbiór: gotowy prompt startowy i pełna instrukcja w repo, jawne pierwszeństwo zbiorczego zlecenia nad osobnymi zleceniami etapów; maksymalnie dwóch wykonawców, niezależny G, ochrona wspólnych testów i danych. A–G nadal todo.
- Wynik: [instrukcja integratora](prompts/T15-ORCHESTRATOR.md) i [handoff U2](handoffs/2026-10-18-T15-U2-prompt-cli.md), krótki prompt startowy do ręcznego użycia. Bez kodowania lub uruchamiania agentów w tej sesji.

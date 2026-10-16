# Plan zadań

Aktualizacja: 2026-10-16. Jedyne źródło statusów poszczególnych zadań. STATUS opisuje kontekst sesji, bez kopiowania całego backlogu.

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

- Status: in_progress. Właściciel: Codex (T11, aktualizacja 2026-10-16). Zależności: T10 — spełniona lokalnie; projekt Vercel i produkcyjny Supabase wskazane/połączone przez użytkownika, dostęp do ustawień przez Chrome. Fizyczny odbiór użytkownika po wdrożeniu w T10-R1 (D025).
- Zakres: Vercel/Supabase/OpenAI, sekrety, migracje, limity wydatków, logi, retencja, backup/odtworzenie, instrukcja dostępu i zbierania zgłoszeń.
- Odbiór: działający HTTPS dla zaproszonych osób, test całej ścieżki na wdrożeniu i dwóch kontach, udokumentowane cofnięcie wdrożenia i ograniczenia.
- Weryfikacja: smoke test wdrożenia, kontrola środowisk i sekretów oraz procedur awarii; link dopiero po rzeczywistym udanym wdrożeniu.
- Przygotowanie: [procedura T11](T11_DEPLOYMENT.md), [instrukcja testera](TESTER_GUIDE.md), lokalny manifest 94 plików/20 migracji i bezpieczna kopia. Build/typy czystej kopii oraz kontrole wysyłki lokalnej przeszły. Oficjalny dry-run Vercel i lista projektów Supabase odrzucone z braku poświadczeń; niczego nie wdrożono. [Handoff](handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md).
- Dalsza praca: T11-E1 upraszcza konfigurację istniejącej integracji. Preview i hostowane migracje/odbiór nadal wymagają wykonania. Przed pełnym odbiorem także SMTP, koszty/AI, transport audio 5 MiB wobec 4,5 MB Vercel, cleanup preview/backlogu i dowód odtworzenia. Pozostają warunkami T11, bez nowych funkcji produktu.

### T11-G1 — Inicjalizacja Git i pierwszy commit

- Status: done. Właściciel: Codex (2026-10-14). Zależności: jawne zlecenie użytkownika i utworzone repo GitHub — spełnione.
- Zakres: inicjalizacja main, kontrola indeksu pod kątem sekretów/prywatnych plików, pierwszy commit i push do wskazanego `gisupanalizy/training-plan-app`.
- Odbiór: commit lokalny i zdalne main wskazują ten sam SHA; lokalne .env oraz fixtures/t06/real pozostają ignorowane. Nie oznacza wdrożenia Vercel ani odblokowania dostępu Supabase.
- Weryfikacja i wynik: [handoff](handoffs/2026-10-14-T11-G1-pierwszy-commit.md).

### T11-E1 — Zmienne integracji Supabase

- Status: review. Właściciel: Codex (2026-10-16). Zależności: T03/T06 i jawne zlecenie uporządkowania konfiguracji — spełnione.
- Zakres: odczyt automatycznych zmiennych STORAGE_, zgodność lokalna, rozdział sekretów i środowisk, usunięcie ręcznych duplikatów w Vercel i uzupełnienie ustawień aplikacji.
- Odbiór: konfiguracja działa bez kopiowania kluczy; błędne/mieszane środowisko jest odrzucane; sekrety pozostają serwerowe; jawny stan zmian Vercel i wymaganych migracji/odbioru T11.
- Wynik: kod i testy lokalne gotowe (171 passed/9 skipped, build/typy, lokalne HTTP A/B/anon). W Vercel osiem ręcznych ustawień tylko Production; trzy duplikaty czekają na potwierdzenie trwałego usunięcia. [Handoff](handoffs/2026-10-16-T11-E1-zmienne-integracji.md).

## Po testach bety

### T12 — Eksperyment Decisions / Jev / głos na żywo

- Status: deferred. Właściciel: —. Zależności: T09, feedback testerów i dostęp do porównywanych API.
- Zakres: porównanie prostego przepływu z klasyfikacją OpenAI Decisions i TypeSafe Jev przez Vercel AI Gateway oraz ewentualną sesją Live/Realtime. Brak obowiązku wdrożenia dodatkowego dostawcy.
- Odbiór: decyzja oparta na jakości, liczbie poprawek, koszcie i czasie; wybrany wariant zachowuje wspólne komendy, uprawnienia i zatwierdzanie.
- Weryfikacja: powtarzalne porównanie na tym samym zestawie przypadków i zapis decyzji w DECISIONS.

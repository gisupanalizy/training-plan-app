# Plan weryfikacji

Status: plan weryfikacji. T01–T05 mają testy opisane w handoffach. T06 ma testy domenowe, lokalny Auth/API/Storage A/B/anon oraz HTTP E2E na mocku AI. Prawdziwy model sprawdzono osobno na 12 syntetycznych przypadkach i trzech prywatnych plikach; wyniki i granice opisuje [handoff T06](handoffs/2026-10-12-T06-proby-realne-pliki.md). T07 ma test komponentu i rozszerzony HTTP na mocku; szczegóły w [handoffie T07](handoffs/2026-10-12-T07-ekran-importu.md).

## Warstwy

- Testy domenowe: procenty, zaokrąglenia, daty maksimum, rozróżnianie braków, snapshoty i statystyki.
- Integracyjne z bazą: migracje, RLS, relacje między właścicielami, transakcje, rewizje, idempotencja.
- E2E: logowanie, ręczny plan i trening, korekta importu, głos z deterministycznym mockiem, odczyt historii.
- Próby prawdziwego AI: oddzielny raport z modelem, kosztami i wersją zestawu. Mocki nie są dowodem jakości rozpoznawania.
- Testy na urządzeniach: aparat, mikrofon, formaty nagrań, klawiatura, przerwanie sieci. Docelowo Safari/iPhone i Chrome/Android; brak dostępu do urządzenia raportujemy zamiast deklarować zgodność.

## Krytyczne scenariusze odbioru

1. Użytkownik A nie może odczytać, zmienić, usunąć ani przypisać sobie obiektu B, również pliku i rekordu dziecka. Anonimowy użytkownik nie odczytuje danych prywatnych.
2. Plan 4 × 6 przy 75% z 1RM 120 kg daje 90 kg; przy braku maksimum kg pozostaje puste. 123 kg × 75%, krok 2,5 kg daje 92,5 kg. Remis jest rozstrzygany zgodnie ze specyfikacją.
3. Zmiana 1RM i planu nie przelicza rozpoczętych/zakończonych treningów. Nowa sesja korzysta z właściwej wersji i maksimum obowiązującego w jej dacie.
4. Trening z ręczną serią, pominięciem i dodatkowym ćwiczeniem zachowuje wszystkie wyniki po ponownym logowaniu.
5. Powtórzone żądanie po timeout nie tworzy drugiej serii/planu. Dwie karty ze starymi rewizjami nie nadpisują się bez konfliktu.
6. PDF tekstowy, skan i zdjęcie tworzą edytowalny szkic. Sprawdzamy kolejność, różne serie, procent, kg, zakres powtórzeń, notatkę i superserię.
7. Nieczytelny fragment i nieznana jednostka są widoczne jako niepewne; błędny, za duży lub przerwany plik nie staje się planem.
8. „Pięć po sto”, poprawka „nie osiem, siedem”, komentarz i dodatkowe ćwiczenie trafiają do właściwego kontekstu albo do doprecyzowania.
9. Anulowane nagranie, cisza, odmowa mikrofonu i spóźniony wynik AI nie powodują zapisu. Zmiana aktywnego ćwiczenia nie zmienia celu wcześniejszej komendy.
10. Polecenie atakujące w treści PDF/transkrypcji nie omija uprawnień ani zatwierdzania.
11. Awaria OpenAI pozostawia możliwość ręcznego treningu. Utrata sieci nie pokazuje fałszywego sukcesu.
12. Sprzątanie audio i plików tymczasowych działa także po błędach; logi nie zawierają ich treści ani kluczy.

## Wykonane testy T03

Lokalny test T03 (`npm run test:t03:local`) pokrywa izolację kont, cudze identyfikatory rodziców, prywatny Storage, zaproszenie i wygasły JWT. Nie pokrywa jeszcze środowiska hostowanego ani ręcznego interfejsu na urządzeniu. T04 i T05 sprawdziły własne ścieżki Auth/API po podłączeniu edytora i zapisu; pełny odbiór urządzeń oraz ponowienie Storage/Mailpit pozostają do T10.

## Wykonane testy T04

`npm run test:t04:local` na prawdziwym lokalnym Auth/PostgREST sprawdza plan A/B, różne serie, rampę, superserię, ponowienie publikacji, konflikt starej wersji, niezmienność wcześniejszych serii, zapis i niezmienność 1RM oraz izolację A/B/anon. Testy domenowe pokrywają wybór maksimum według daty, brak maksimum, procenty i remis przy zaokrągleniu. Test komponentu sprawdza dodanie serii i wysłanie nowej wersji. W T04 nie uruchomiono ręcznego testu na urządzeniu ani pełnego testu T03 Storage/Mailpit po migracji; lokalny test T04 użył Auth/PostgREST. Szczegóły: [handoff T04](handoffs/2026-10-11-T04-edytor-planu-1rm.md).

## Wykonane testy T05

`npm run test:t05:local` na prawdziwym lokalnym Auth/PostgREST sprawdza start i snapshot celów, brak 1RM, zapis/poprawkę/pominięcie serii, dodatkową serię i ćwiczenie, komentarz, zakończenie, retry po utracie odpowiedzi, stary `expected_revision`, niezmienność historii po nowej wersji i 1RM, ponowne logowanie oraz izolację A/B/anon. HTTP E2E przez produkcyjny serwer Next sprawdza strony planu/treningu/historii, komendy, wznowienie po nowej sesji, poprzedni wynik i anon. Test komponentu sprawdza ponowienie dokładnie tej samej komendy po błędzie sieciowym. Nie wykonano pełnego klikanego E2E w przeglądarce ani testów urządzeń/hostingu; szczegóły w [handoffie T05](handoffs/2026-10-11-T05-wykonanie-historia.md).

## Zestaw oceny AI

Proponowany zestaw startowy: minimum 12 przypadków importu obejmujących PDF tekstowy/skan/zdjęcie/tekst, w tym nieczytelny i niejednoznaczny zapis; minimum 20 polskich wypowiedzi obejmujących każdy typ komendy, poprawki, liczby dziesiętne, ciszę i hałas. Przykłady oznaczone jako syntetyczne; prywatne pliki tylko po uzgodnieniu i poza publicznym repozytorium.

Krytyczne fixture'y dotyczące jednostek, celu zapisu, anulowania i uprawnień muszą przechodzić w całości. Roboczy cel jakości: co najmniej 95% poprawnych jednoznacznych pól na opisanym zestawie; raport osobno pokazuje opuszczenia i błędne dopowiedzenia. To próg odbioru do oceny w T06, nie deklarowana skuteczność produktu. Mała próbka nie dowodzi jakości na dowolnym planie.

Opóźnienia p50/p95 i koszt mierzymy, bez obiecywania konkretnych wartości przed pomiarem. W razie niespełnienia kryteriów zapisujemy poprawki i nie oznaczamy integracji jako gotowej. Każda zmiana modelu/promptu wymaga powtórzenia związanych z nią przypadków regresji.

## Wykonane testy T06

`fixtures/t06/cases.json` i wygenerowane pliki zawierają 12 syntetycznych źródeł pięciu odmian: tekst, tekstowy PDF, skan PDF, PNG i JPEG. Testy jednostkowe sprawdzają formaty, PDF do 6 stron, XLSX, błędny plik, brak danych, jednostki, pytania i format żądania Responses. Lokalny test Supabase używa prawdziwych Auth/PostgREST/Storage dla A/B/anon, limitu budżetu, retry, równoległego roszczenia, przejęcia wygasłej dzierżawy, spóźnionego wyniku, zatwierdzenia i sprzątania. Test HTTP używa produkcyjnego builda Next, sprawdza podpisany upload XLSX, błędny PDF, 503 bez klucza/budżetu, pytania, zatwierdzenie i cron. AI w testach lokalnych i HTTP jest mockiem. Osobny [raport prawdziwego modelu v8](reports/2026-10-12-T06-live-v8.json) ma 12/12 poprawnych szkiców, 90/90 ocenianych pól i zero opuszczeń/dopowiedzeń. Prywatne PDF/XLSX dają szkice z brakami wymagającymi pytań; nie wolno przenosić wyniku syntetycznego na dowolny plan. Pełny UI i urządzenia pozostają T07/T10.

## Wykonane testy T07

Test komponentu `src/components/import-workspace.test.tsx` sprawdza stronowanie 55 pytań, przeniesienie liczby serii do poprawionego dokumentu, jawny zapis korekty i symulowaną odmowę aparatu. Rozszerzony `npm run test:t06:http` sprawdza prywatny podgląd źródła tekstu i XLSX, brak dostępu B/anon, przywrócenie korekty po GET, podpisany upload, błędny PDF, odrzucenie HEIC, anulowanie i powtórzone zatwierdzenie. `npm run test:t06:local` ponownie sprawdza lokalne Auth/PostgREST/Storage. AI w tych testach jest mockiem; nie wykonano nowej próby prawdziwego modelu. Brak fizycznego telefonu; wykryty emulator Android nie przeszedł pełnego testu UI. Środowisko hostowane pozostaje niesprawdzone.

## Wykonane testy T08

`src/lib/progress/summary.test.ts` sprawdza ręcznie policzone 940 kg, 1140 kg po poprawce, warianty, asystę, ciężar na jeden hantel i pominięcie. `npm run test:t08:local` używa prawdziwego lokalnego Supabase Auth/PostgREST dla dwóch syntetycznych kont i anonima; z uruchomionym produkcyjnym Next i `T08_HTTP_BASE=http://localhost:3005` sprawdza prywatny widok, filtry oraz odświeżenie po korekcie historycznej serii. Nie używa mocka bazy ani AI. `npm run typecheck`, `npm test` i `npm run build` przeszły. Nie wykonano testu fizycznych urządzeń, pełnego klikanego E2E ani hostowanych usług.

## Wykonane testy T09

Kontynuacja 2026-10-12/13: użytkownik zatwierdził 0,50 USD wyłącznie na T09. Cztery serie `RUN_T09_LIVE=true T09_LIVE_BUDGET_USD=0.50 DO_NOT_TRACK=1 npx vitest run src/lib/voice/live-evaluation.test.ts` wykonały prawdziwe OpenAI na syntetycznych danych. Pierwsza seria 11/20 obnażyła zbyt dosłowną ocenę komentarzy/nazw i błąd przy brakującym ćwiczeniu. Następnie zastąpiono sprzeczny z instrukcją przypadek tekstowy „Szum: pięć po sto” opisem wyniku rzeczywiście nieczytelnego, dlatego wynik v1 nie jest bezpośrednio porównywalny z v2–v4. Druga seria 19/20 miała niepoprawny plan, trzecia 19/20 poprawny plan, a końcowa po promptcie `voice-pl-v2` uzyskała 20/20 tekstów, poprawny plan i 2/2 krótkich transkrypcji WebM (czystej i z różowym szumem). [Raport końcowy](reports/2026-10-12-T09-live.json) podaje p50/p95 tekstu 4,351/8,622 s, audio 0,552/0,552 s i szacunkowo 0,002595 USD za końcową serię; [v1](reports/2026-10-12-T09-live-v1.json), [v2](reports/2026-10-12-T09-live-v2.json), [v3](reports/2026-10-12-T09-live-v3.json) zachowują porażki. Suma szacowana: 0,010376 USD. Prawdziwy głos człowieka, fizyczny telefon i rachunek dostawcy nie były testowane.

Po poprawkach `npm test` — 65 aktywnych testów i 7 pominiętych; `DO_NOT_TRACK=1 npm run test:t09:local` i `DO_NOT_TRACK=1 npm run test:t05:local` na lokalnym Auth/PostgREST, `npm run build` oraz końcowy sekwencyjny `npm run typecheck` — sukces. Równoległy `typecheck` podczas generowania `.next` miał chwilowy błąd braku `routes.js`; powtórzenie po buildzie przeszło. Testy komponentów nadal są mockami dla anulowania i opóźnionego wyniku. ADB wykazało tylko emulator; na fizycznym telefonie pozostają uprawnienia mikrofonu, WebM/MP4, anulowanie, opóźniony wynik i zmiana ćwiczenia. Lokalny licznik T06 ma próbę aktywną do 2026-10-13 12:23 UTC; pełną regresję T06 trzeba ponowić po wygaśnięciu lub w izolowanym środowisku, bez usuwania danych.

`src/lib/voice/domain.test.ts` obejmuje kontrakt na 20 syntetycznych polskich wypowiedziach, w tym korektę, negację, brak jednostki i tekst oznaczający hałas. Oczekiwane odpowiedzi są mockami, więc test nie mierzy jakości modelu ani mikrofonu. `src/components/voice-input.test.tsx` sprawdza brak mikrofonu i anulowanie przed opóźnionym wynikiem. `src/components/workout-voice.test.tsx` sprawdza jawną akceptację, niezmienność kotwicy i zachowanie innych pól poprawianej serii. `npm run test:t09:local` po migracjach sprawdza rzeczywisty lokalny Auth/PostgREST, A/B/anon, atomowe dodanie ćwiczenia z seriami, retry, konflikt rewizji i globalny budżet. Przy produkcyjnym Next i `T09_HTTP_BASE=http://localhost:3005` sprawdza HTTP A/B/anon, obcy cel, starą rewizję i odmowę płatnej próby bez osobnego budżetu. Późniejsze prawdziwe wywołania OpenAI na syntetycznych danych opisano wyżej; fizycznego mikrofonu nadal nie sprawdzono. Formaty WebM/MP4 są zaimplementowane i sprawdzone statycznie; ich rzeczywiste generowanie w Safari/iPhone i Chrome/Android pozostaje do odbioru urządzeń.

Kontynuacja 2026-10-13: test komponentu z mockiem `MediaRecorder` wymusił wybór MP4 i asynchroniczny błąd nagrywania; po błędzie ścieżka zatrzymuje ślad mikrofonu i nie wysyła częściowego audio. Drugi test zmienił docelową serię podczas oczekującej interpretacji i potwierdził odrzucenie spóźnionej propozycji. `npm test`: 67 przeszło, 7 pominięto. `DO_NOT_TRACK=1 npm run test:t09:local` oraz ten sam test z `T09_HTTP_BASE=http://localhost:3005` przeszły na lokalnym Auth/PostgREST i produkcyjnym Next; `DO_NOT_TRACK=1 npm run test:t05:local`, `npm run build` i sekwencyjny `npm run typecheck` także przeszły. Początkowy T09 lokalny nie wystartował w sandboxie z powodu odmowy dostępu do socketu Dockera; powtórzenie z uprawnieniem przeszło. Te testy nie generują MP4 na fizycznym telefonie. ADB wykryło tylko emulator, USB nie wykazało telefonu, a użytkownik potwierdził jego brak. Nie wykonano fizycznego odbioru, nowej płatnej próby ani pełnej regresji T06 przed 2026-10-13 12:23 UTC; nie usuwano istniejących prób.

Odbiór emulatora 2026-10-13: użytkownik wyraźnie dopuścił emulator jako wystarczający na ten etap. `adb devices -l` wskazało `emulator-5556`; Chrome otworzył przez `adb reverse tcp:3007 tcp:3007` tymczasową stronę lokalną w bezpiecznym kontekście `localhost`. Zezwolono na mikrofon na poziomie witryny i Androida. `MediaRecorder.isTypeSupported` zwrócił `true` dla WebM/Opus i audio/MP4. Nagranie WebM/Opus utworzyło 48 449 B, wymuszone MP4 31 685 B; po obu `track.readyState` wynosił `ended`. Anulowanie aktywnego nagrania dało `discarded=true` i również zakończyło ścieżkę. Nie wysłano nagrań do API ani nie zapisano ich w repo. `npm test` po równoległej poprawce: 67 przeszło, 7 pominięto; końcowo ponownie przeszły `npm run typecheck` i `npm run build`. To sprawdzenie zachowania przeglądarki i mikrofonu emulatora, nie pełne klikalne E2E aplikacji; opóźniony wynik i zmiana ćwiczenia są pokryte mockami komponentów oraz kontrolą rewizji w testach lokalnych. Fizyczny telefon, Safari/iPhone, hosting i rzeczywisty hałas pozostają niesprawdzone i przechodzą do szerszego odbioru T10. Pełnej regresji T06 nie ponowiono przed 2026-10-13 12:23 UTC.

## Raport testów

Każdy raport/handoff podaje: zadanie, wersję kodu (jeśli istnieje), środowisko, polecenia lub kroki manualne, wynik, błędy, zakres mocków, niewykonane sprawdzenia i ograniczenia. Przed betą komplet krytycznych scenariuszy oraz smoke test na wdrożeniu.

## Odbiór T06-R1 (2026-10-13)

- `npm test`: domena, pytania, stabilne cele po przestawieniu, ręczne rozwiązanie braków, AMRAP, zakresy i opcjonalność, izolacja wariantów nazw, źródłowe scalenia/przekreślenia/data. `t06r1-source-audit.test.ts` porównuje każdą pozycję PDF z niezależnym odczytem i kwalifikuje wszystkie końcowe pytania. Nie wywołuje AI; wykorzystuje zachowany wynik prawdziwej próby.
- `DO_NOT_TRACK=1 npm run test:t06r1:local`: prawdziwe lokalne Auth/PostgREST, retry publikacji i startu, zakresy, całe opcjonalne ćwiczenie, złożone bloki, nazwy oryginalne, niezmienne snapshoty, nowa wersja bez zmiany historii, A/B.
- `DO_NOT_TRACK=1 npm run test:t06:local`: 3/3. Test rezerwacji odczytuje już istniejący globalny licznik i testuje jeden dodatkowy slot oraz odmowę dla drugiego konta. Nie usuwa istniejących prób i nie wykonuje płatnego wywołania.
- Regresje `test:t04:local`, `test:t05:local`, `test:t08:local`: sukces na rzeczywistej lokalnej bazie; dane syntetyczne. Chronią wcześniejsze wersje, 1RM, retry i poprawki wyników.
- `DO_NOT_TRACK=1 npm run test:t06:http`: produkcyjny build, lokalny serwer 3006, mock AI; A/B/anon, podpisany upload, źródło i `view=grid`, korekta/reload, stare szkice v1, zatwierdzenie/retry, błędne pliki i retencja.
- Opcjonalny klikalny odbiór Chrome: to samo polecenie z `T06R1_PLAYWRIGHT_MODULE` wskazującym absolutną ścieżkę `playwright/index.mjs`. Runtime desktopowy udostępnia moduł przez `load_workspace_dependencies`; nie wymaga nowej zależności aplikacji. Skrypt tworzy własne konta i używa rzeczywistych źródeł oraz zachowanych szkiców z `after-4`; po teście usuwa tylko własne konta i obiekty. Sprawdza 6 stron PDF, zoom/pełny ekran/Escape, skok na stronę 4, mobilny podgląd, wszystkie arkusze, przekreślenie i dolne wiersze, zakres/AMRAP, kolejność i korektę po odświeżeniu. Zrzuty w `/private/tmp` są prywatne. Nie jest to ponowne żądanie modelu.
- Prawdziwe próby: `node scripts/evaluate-t06-real.mjs before|after[-numer]` jest opt-in i wymaga klucza/włączenia/pozostałego zatwierdzonego budżetu T06. Zachowuje próby, by nie resetować limitu. Nie uruchamiać rutynowo podczas regresji. Baseline, kolejne niezaliczone iteracje i końcowe porównanie: [T06_IMPORT](T06_IMPORT.md). Seria syntetyczna v11: 12/12 i 88/90 pól; celowane v12 po poprawce: 2/2 i 17/17. Rozdzielamy obie serie.

W tej sesji poprawiono test oczekiwania na element `option` (jest ukryty w natywnym select) i nowy audyt wymagający jawnych typów. Kontrola zrzutu wykryła również rzeczywiste poszerzanie mobilnego podglądu i za jasny tekst kontekstu; poprawiono CSS oraz dodano sprawdzenie szerokości. Nie deklarujemy hostingu, fizycznego telefonu ani dowolnej tabeli jako przetestowanych.

## Odbiór T07-R1 (2026-10-13)

Nowe testy `src/lib/imports/review.test.ts` i `src/components/import-review.test.tsx` sprawdzają projekcję bloków, 7–8 i złożony dip, jawny pusty cel, ID/uwagi/opcjonalność, zmianę liczby serii właściwego bloku, unieważnianie potwierdzeń i odpowiedzi, kolejność kluczy JSONB, przeniesienie ćwiczenia, trzy kroki, anulowanie formularza i dodawania, błąd zapisu/retry, wybory ankiety, 55 pytań z jednym widocznym, indywidualną serię, tworzenie/rozłączenie superserii i ponowienie publikacji tym samym ID po utracie odpowiedzi. Ostatni przypadek ma mock odpowiedzi sieciowej; rzeczywistą idempotencję potwierdza osobno HTTP/RPC.

`DO_NOT_TRACK=1 T07R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t07r1:http` uruchamia produkcyjny build i lokalny Next/Supabase. HTTP testuje A/B/anon, krok w GET/PATCH, błędne metadata, starszy PATCH bez kroku, retry, źródła i zatwierdzenie. Chrome na własnych kontach sprawdza trzy zachowane rzeczywiste źródła: karty bez pełnych formularzy, zakres/blok/cancel, krok/reload/potwierdzenia, niejasną przerwę, wybory sprzętu i podstawę ciężaru, datę jako testowy zakres z AMRAP, grupowe pytanie i „Później”, wszystkie strony/arkusze, fokus i widok 390×844 bez overflow. Nie publikuje prywatnych planów. Moduł Playwright pochodzi z runtime desktopowego, nie z nowej zależności aplikacji. Starsze polecenie T06-R1 przeglądarki przekierowuje do aktualnej ścieżki.

Zrzuty do prywatnej kontroli: `/private/tmp/t07r1-cards-desktop.png`, `t07r1-cards-mobile.png`, `t07r1-edit-mobile.png`, `t07r1-survey-desktop.png`. Oceniono układ; kontrole keyboard/focus wykonano w Chrome, nie tylko jsdom. Testy komponentu nie dowodzą działania fizycznego telefonu.

Pierwsze przebiegi poprawiono: opcje selektorów testu, oczekiwanie na zapis, błędne założenia testu o kolejności pytań i liczbie ćwiczeń. W implementacji dodano stabilną serializację JSONB, powrót na początek kroku, jawną pętlę fokusu oraz retry publikacji bez ponownego PATCH już zatwierdzonego szkicu. Nie wywołano nowego AI. Ręczny edytor i parser źródeł pozostają poza przebudową UX. Wyniki końcowe: [handoff T07-R1](handoffs/2026-10-13-T07-R1-przeglad-importu.md).

## Odbiór T04-R1 (2026-10-13)

`compact-plan-editor.test.tsx` obejmuje karty/jeden trening, podgląd całości, blok i pojedynczą serię, zachowanie ID/notatek/źródeł, fragment przy niekompletnym innym treningu, katalog/przeniesienie, anulowanie dodawania, złożony cel i zakresy, opcjonalność, zmianę kolejności i nazwy dnia, AMRAP/czas/dystans/asystę/hantle/%1RM/dodatkowy ciężar, zero wobec braku, timeout/retry, blokadę podczas zapisu, konflikt oraz ostrzeganie o wyjściu. Głos nadal jest mockiem komponentu i wymaga jawnego dodania propozycji; nie uruchamia AI samoczynnie. Cały `npm test`: 122 przeszło, 8 opt-in pominięto.

`DO_NOT_TRACK=1 npm run test:t04:local` potwierdził rzeczywiste lokalne Auth/PostgREST, A/B/anon, wersje, retry i historię 1RM. `DO_NOT_TRACK=1 T04R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t04r1:http` buduje produkcyjny Next, uruchamia go na 3008 i sprawdza Chrome desktop 1440×1000/mobile 390×844. Moduł pochodzi z `load_workspace_dependencies`, bez nowej zależności aplikacji. Runner wyłącza import AI i głos.

Chrome tworzy tylko własne syntetyczne konto/plan: karty bez formularzy, dialog/zakres/cancel, katalog/przeniesienie, podgląd, superserie, fokus/Escape, fullscreen i brak overflow. Publikacja jest prawdziwa przez HTTP/RPC. Playwright celowo odrzuca odpowiedź po udanym zapisie; retry tego samego payloadu daje tylko jedną nową wersję. Porównanie wszystkich dawnych serii i snapshotów rozpoczętego treningu z odczytem bazy potwierdza ich niezmienność. Nowy szkic pozwala zastosować fragment mimo innego pustego ćwiczenia, ale pełna publikacja jest blokowana. Konto i jego obiekty są usuwane w `finally`.

`DO_NOT_TRACK=1 npm run test:t07r1:http` bez modułu przeglądarki przeszedł na syntetycznych źródłach i szkicu mockowym: A/B/anon, źródło, korekta/reload, metadata, starszy PATCH i retry zatwierdzenia. Nie ponowiono klikalnego testu trzech prywatnych źródeł. Build i sekwencyjny `npm run typecheck` przeszły. Prywatne zrzuty syntetycznej sesji: `/private/tmp/t04r1-cards-desktop.png`, `t04r1-cards-mobile.png`, `t04r1-edit-mobile.png`; oceniono wizualnie i poprawiono zasłanianie kart mobilnym paskiem zapisu.

Kontrola Chrome wykryła także rzeczywistą regresję: aktualizacja stanu ostrzeżenia w fazie capture zakłócała checkbox superserii. Przeniesiono obsługę do fazy bubble tylko dla przycisków kolejności, dodano test i ponowiono Chrome z sukcesem. Ostrzeganie śledzi zmieniony formularz, nie samo otwarcie okna.

Pierwsze przebiegi wykryły błędy testów: liczba zamiast tekstowej wartości input, niedozwolona opcja Testing Library `exact`, oczekiwanie przycisku w zwiniętym treningu i pominięta nazwa nowego planu. Poprawiono i powtórzono. Początkowe testy integracji nie miały dostępu do socketu Dockera w sandboxie; powtórzenie z uprawnieniem przeszło. Nie wykonano płatnych prób AI, fizycznego telefonu, Safari/iPhone, hostingu ani obciążenia. Szczegóły: [handoff T04-R1](handoffs/2026-10-13-T04-R1-czytelny-edytor.md).

## T10 i fizyczny odbiór po wdrożeniu

D025 zamyka lokalny T09 i dopuszcza T10 przed testem telefonu. [T10_ACCEPTANCE](T10_ACCEPTANCE.md) opisuje runner `npm run test:t10:local`, jego środowisko, syntetyczne dane, poprawki i faktyczne wyniki oraz listę kroków T10-R1 dla użytkownika po Vercel. T10-R1 zależy od T11 i jest warunkiem szerszej bety. Dotychczasowe stwierdzenia o telefonie jako warunku T09 opisują wcześniejsze kryterium; nie oznaczają wykonanego testu.

## Przygotowanie T11 (2026-10-14)

`node --check scripts/prepare-t11-deploy.mjs`, `node --check scripts/verify-t11-package.mjs`, `node scripts/prepare-t11-deploy.mjs --stage` i `node scripts/verify-t11-package.mjs` przeszły. Ostatni skrypt tworzy wyłącznie tymczasowe kopie syntetyczne: sprawdza ścieżki z `.gitignore`/`.vercelignore` semantyką Git, porównuje hashe źródeł i 20 migracji oraz odrzuca zagnieżdżone env, format sekretu i dowiązanie. Usuwa swoje pliki w finally. Nie zastępuje manifestu CLI Vercel ani pełnego skanera sekretów.

W czystej kopii wskazanej przez manifest, bez `.env` i fixtures: `npm ci --offline --ignore-scripts --no-audit --no-fund`, następnie `NEXT_TELEMETRY_DISABLED=1 OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run build` i `npm run typecheck` — sukces na Node 26.4.0. Instalacja offline nie uruchamiała skryptów zależności; build uruchomił projektowy prebuild PDF.js. Nie jest to sprawdzenie Node 24 ani usługi Vercel. Nowe skrypty/build nie wywołują AI; dotychczasowych 159 testów T10 nie przedstawiamy jako ponowionych w T11.

Vercel 64.0.2 `deploy --dry --format=json --non-interactive` z konfiguracją w `/private/tmp` zakończyło się brakiem poświadczeń; Supabase `projects list --output json` brakiem tokenu. Oficjalny manifest, migracje hostowane, Auth/SMTP, rzeczywisty HTTPS, smoke A/B/anon, limity/cleanup/restore pozostają niewykonane. Pełna sekwencja i warunki odbioru: [T11_DEPLOYMENT](T11_DEPLOYMENT.md). Nie uruchamiać istniejących lokalnych runnerów przeciw produkcji: tworzą/usuwają konta i zakładają środowisko lokalne. Fizyczne urządzenia i Safari pozostają T10-R1 po wdrożeniu.

## T11-E1 — konfiguracja Marketplace (2026-10-16)

`npx vitest run src/lib/supabase/config.test.ts src/lib/supabase/admin.test.ts`: 20/20. Nowe przypadki: pierwszeństwo integracji nad błędnym ręcznym duplikatem, niepełna rodzina bez mieszania, fallback anon/service_role, sekret w publicznym polu, HTTPS/preview/production, brak sekretu tej samej rodziny i zachowana konfiguracja lokalna. SDK admin jest mockiem w testach wyboru klucza — nie jest to walidacja kluczy hostowanego konta.

`OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false npm test`: 171 passed / 9 skipped, 23 pliki passed / 5 skipped. Build i następujące po nim typecheck przeszły ze sztucznym refem/kluczami integracji, APP_ENV/VERCEL_ENV=production i pustymi dawnymi zmiennymi. `.env` istnieje, lecz istotne zmienne jawnie nadpisano w procesie; nie jest to przeniesienie wartości lokalnych na hosting. Kontrola `.next/static` nie znalazła referencji do serwerowych nazw kluczy ani syntetycznego sekretu builda.

`node scripts/prepare-t11-deploy.mjs --stage` i `node scripts/verify-t11-package.mjs`: sukces, 95 źródeł/20 migracji, nowy manifest 2026-10-16 bez nadpisania poprzedniego. Lokalny env.vercel ignorowany w Git; nie zmieniano jego treści. Zdalne HTTPS/smoke/migracje oraz telefon/Safari nadal mają status niewykonane. Dwa rzeczywiste lokalne HTTP T06/T07 (stare nazwy oraz STORAGE z lokalnym legacy service_role) przeszły na Auth/API/Storage z mockiem AI. Faktyczne zmiany konfiguracji i ograniczenia w [handoffie](handoffs/2026-10-16-T11-E1-zmienne-integracji.md).

## T11 — hostowana produkcja (2026-10-16)

D029 ogranicza obecny etap do Production, bez projektu preview. Po prywatnym logowaniu CLI użytkownika: `supabase link --project-ref kwmyosnerwvtwxtszzka`, `migration list`, `db push --linked --dry-run --skip-vault`, a po osobnym zatwierdzeniu `db push --linked --skip-vault` i `migration list` — sukces, 20/20. Przed zapisem metadane wykazały 0 tabel publicznych/kont/bucketów/obiektów. Odczyt SQL przez `db query --linked --file /private/tmp/t11-audit.sql` potwierdził RLS 17/17, brak DML do 12 tabel, prywatność i limity bucketów. [Raport](reports/2026-10-16-T11-production-audit.json) zawiera wyłącznie metadane.

Bez cookies po rzeczywistym HTTPS: `/` 307 na logowanie, `/api/plans` JSON 401/no-store, `/api/imports/cleanup` bez Authorization JSON 401. Chrome pokazał polski ekran logowania bez ostrzeżenia certyfikatu. `node scripts/verify-t11-package.mjs` przeszedł bez uploadu. Nie powtarzano suite/builda kodu aplikacji: tej sesji nie zmieniano źródeł builda, migracji ani domeny. Początkowy HTTP w sandboxie miał ENOTFOUND, ponowienie z dostępem sieciowym przeszło. Jedna próba pomocy CLI bez DO_NOT_TRACK miała EPERM zapisu telemetry; ponowienie z DO_NOT_TRACK=1 przeszło.

Przygotowano osobny `scripts/test-t11-production.mjs` zamiast kierować lokalne runnery na produkcję. `node --check scripts/test-t11-production.mjs` — sukces. Wykonanie wymaga jawnej zgody na klucze wyłącznie w pamięci, dwa syntetyczne konta i usunięcie wyłącznie ich zasobów. Skrypt odrzuca brak `--run-approved-smoke`, używa stałego refa/adresu, nie zapisuje sekretów, nie czyta .env i nie wysyła fixtures; AI powinno odmówić 503. Przygotowanie nie jest wynikiem smoke; późniejsze rzeczywiste próby i lokalną poprawkę opisano poniżej. Test obejmuje HTTP/Auth/API/Storage, nie klikalny UI, mail ani telefon. Ręczne Run crona nie wykonane po odrzuceniu auto-review; 401 nie dowodzi prawidłowej jakości sekretu ani udanego sprzątania. Restore i T10-R1 niewykonane.

### T11-C1 — rzeczywisty błąd hostingu i lokalna poprawka

Po jawnym „Tak, wykonaj ten smoke” uruchomiono nowy runner przeciw Production. Pierwsza próba: plan/retry, 1RM 120, start/retry, snapshot90/null i zapis/retry serii przeszły; stara rewizja dała HTTP 400 zamiast409. Druga próba z diagnostyką/timeout30s potwierdziła rewizję2 i timeout bezpośredniego RPC z oczekiwaną starą rewizją1. W każdej próbie finally usunęło własne 2 konta, 0 plików; pełna ścieżka, Storage i późniejsze asercje nie zostały osiągnięte. Klucze pobrano przez CLI tylko w pamięci po zgodzie, nie zapisano ich ani haseł/cookies. Nie wykonano płatnego AI. Po próbach 0 aktywnych backendów authenticator, bez restartu i terminate.

[Oficjalne troubleshooting Supabase](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b) opisuje nieskończone ponowienia 40001 w PostgREST14 i zaleca PT409 dla konfliktu HTTP 409. D030/T11-C1 dodaje migrację21 i mapowanie API. `DO_NOT_TRACK=1 npx --no-install supabase migration up --local`, następnie `DO_NOT_TRACK=1 npm run test:t04:local` i `DO_NOT_TRACK=1 npm run test:t05:local`: sukces, wzmocnione asercje starej rewizji i sprzecznego operation payload oczekują PT409; pozostałe przypadki retry/wersji/snapshotów/A/B/anon przeszły. Bez resetu lokalnych danych.

`OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false DO_NOT_TRACK=1 npm test`: 171 passed/9 skipped; 23 pliki passed/5 skipped. `NEXT_TELEMETRY_DISABLED=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run build` i sekwencyjny `npm run typecheck`: sukces, build odczytuje istniejący lokalny .env przy jawnie pustym kluczu i wyłączonym AI; nie jest to build hostingu. `node --check scripts/test-t11-production.mjs`, prepare --stage i verify package: sukces, nowy C1 ma 95 źródeł/21 migracji, bez nadpisywania E1 i bez uploadu.

Runner otrzymał timeouty, postęp i oddzielne asercje obu bucketów/anulowania po niezaliczonych próbach; te dalsze asercje czekają na ponowienie po wdrożeniu C1. Produkcja nadal ma 20 migracji; dry-run wskazuje wyłącznie21. Nie deklarować PT409 ani pełnego smoke jako odebranego na hostingu przed nowym buildem i testem.

### T11-C1 — wdrożenie i końcowy smoke

Po „Tak, zastosuj i wdróż poprawkę”: produkcyjny dry-run wskazał tylko migrację21; push --linked --skip-vault i migration list dały21/21. Ponowny audit SQL potwierdził niezmienione RLS/granty/buckety. Kod commit ddaceb3e7c438bc81d02a55e0fede9bbf2d31ff5 wypchnięty; Vercel deployment dpl_AzhtfUHBRouX92RRhbTA5F19r5jX Ready 53 s. Pierwsza próba na C1 przeszła konflikt, trening, wersje, oba buckety i odmowęAI, ale błędna asercja oczekiwała nazwy planu w historii (UI pokazuje datę/status/komentarz). Poprawiono wyłącznie test; nie zmieniano aplikacji. Konta 2 i pliki 2 usunięto,0 błędów.

Końcowe `node scripts/test-t11-production.mjs --run-approved-smoke` na produkcyjnymHTTPS: PASS. Auth A/B, anonim 401; błędny JSON 400; plan/1RM 120/start/seria przez API; retry publikacji/startu/serii; stara rewizja bezpośrednio PT409 i w API409;90 kg/null snapshoty; pominięcie, dodatki, komentarz i koniec; wersja i 150kg nie zmieniają starego 90; 12 tabel bez odczytuB/anon i UPDATE42501;A nie czyta planuB. Oba buckety: własny upload/source, odmowa B/anon, signed/public i cudza ścieżka training-private; signed upload importu, no-store źródła i cancel 410. Strony ręczne200, ponowne logowanie/historia, postęp 540 kg, zero/null. Process importu i głos503 z AI wyłączonym, bez płatnego żądania. Finally:2 własne konta/2 pliki, 0 błędów. To HTTP/Auth/API/Storage; nie klikalny UI, SMTP ani telefon/Safari. Cron 200/retencja/restore nadal niewykonane.


### T11 — Auth, cron i zmiana priorytetu D031

Po jawnej zgodzie użytkownika zapisano minimum hasła12, produkcyjny Site URL i dwa dokładne redirecty. Ponowne otwarcie Email pokazało12 na screenshot; DOM redaguje to pole jako password-policy, dlatego wcześniejsza asercja porównująca DOM value do12 zwróciła false — nie była dowodem nieudanego zapisu. URL-e potwierdzono po reload. Bez odczytu haseł użytkowników i bez wiadomości.

Panel crona: po odczycie0eligible importów/voice i0obiektów Run zwróciło200, 23:02:26.822 CEST, na deployment66bkx8iqf, /api/imports/cleanup. Brak testu usuwania wygasłego pliku. Później odczyt liczników: Auth1/profiles1/imports0/Storage0; bez odczytu danych konta. Przejściowo Node UND_ERR_CONNECT_TIMEOUT, a Chrome net::ERR_BLOCKED_BY_CLIENT; bez obchodzenia zabezpieczeń. curl przy normalnej walidacjiTLS potwierdził /logowanie200, root307 i /api/plans401. Nie wnioskować o awarii produkcji z błędu jednego transportu.

`DO_NOT_TRACK=1 npx --no-install supabase db dump --linked --schema public --file /private/tmp/t11-public-schema.sql` przeszło po pobraniu oficjalnego obrazu postgres17.11.0.003. To tylko schemat, nie kopia danych/Storage/Auth. Szyfrowania i restore nie wdrożono; dalszy zakres odłożony przez użytkownika. Brak zapisu do istniejącej lokalnej bazy.

D031 dopuszcza pojedynczy płatny test importu w5USD na start po prywatnym dodaniu klucza, bez głosu. Wynik dopisujemy po rzeczywistym wywołaniu. Nie powtarzano testów/builda kodu: zmieniano tylko ustawienia usług i dokumentację, kod wydania pozostaje zgodny z manifestem C1.


## Końcowy wynik prototypu — D031/D032

T11 **review**: aplikacja przekazana właścicielowi do własnych testów. Bez dalszego automatycznego rozwijania infrastruktury. Import i głos są włączone na Production. Nowe wdrożenie głosu `dpl_DEkfN1gE4V3kk558B2SGEmVcyawS` Ready44s, kod4e4a0aa (kod aplikacji zgodny zC1). Wcześniejsze importowe `dpl_HnkRh9V8X3KBy7KEimgdbB54hYXe` Ready52s.

Rzeczywisty import tekstu: pierwsza asercja testu błędnie oczekiwała3surowych obiektów zamiast jednego szablonu i set_count3; HTTP200/needs_review już działało. Po poprawieniu testu: PASS,1dzień/1ćwiczenie/3serie×5/60kg/120s,0pytań, retry bez kolejnego AI. Druga próba1909input/473output tokens, szacunek0,0004274USD wg aktualnej taryfy Luny; pierwszej próby ani całej fazy nie rozliczono dokładnie. W obu próbach cleanup własnego konta bez błędów.

Głos: systemowy say/Zosia wygenerował syntetyczne2,91775s WAV97464B. Hostowana transkrypcja200 (~2,943s), interpretacja5powt./60kg na właściwą serię, brak zapisu przed zatwierdzeniem i kontrolowany zapis po zatwierdzeniu przeszły. Runner zatrzymał dopiero dodatkowy odczyt metadanych voice_attempts przez authenticated (42501); tabela prawidłowo nie jest dostępna klientowi. Nie deklarujemy całego runnera jako PASS i nie powtarzano płatnych wywołań dla tej zbędnej kontroli. Własne konto usunięto,0plików/0błędów cleanup. Bez fizycznego mikrofonu i telefonu.

Obie flagi true, szacunki aplikacji import4/głos1USD w24h;5USD łącznie na start obejmuje obie funkcje. To nie twardy łączny limit rachunku ani zgoda na codzienny nowy budżet. Użytkownik otrzymał instrukcję limitu projektu OpenAI, zapis niepotwierdzony. Krótkie nagrania można testować;5MiB wobec4,5MB Vercel pozostaje ograniczeniem dużych plików przed pełną betą. Stary smoke wymagał503AIoff — nie uruchamiać go bez dostosowania do obecnego stanu.

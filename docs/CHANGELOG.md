# Historia zmian planu

## 2026-10-13 — rozpoczęcie T04-R1

Użytkownik zatwierdził osobną przebudowę ręcznego edytora nowych i istniejących planów: jeden trening, podgląd całości, karty, okna edycji i bloki jednakowych serii, dodatkowe pola na żądanie. Powód: pełne formularze i puste parametry utrudniają przegląd. Wydzielono T04-R1 po zakończonych T04/T06-R1/T07-R1, zachowując wcześniejsze ID i zależności. D024 rozwija D023 w nowym, jawnie uzgodnionym zakresie. Nie zmieniamy API, danych/historycznych snapshotów ani przepływu importu; T09 nadal review. Bez innych agentów i płatnych prób AI.

## 2026-10-11 — T00 — pierwsza dokumentacja

- Zapisano wymagania użytkownika: testy z kolegami, głównie siła, rzeczywiste 1RM, online, OpenAI oraz ręczne i głosowe wprowadzanie danych.
- Rozpisano T00–T12 z zależnościami i kryteriami odbioru. Ręczny trening jest wcześniejszym etapem, a import i głos pozostają częścią pełnej bety.
- Zaproponowano Next.js/Vercel/Supabase, wersjonowanie planów i niezależną historię wykonania.
- Oddzielono transkrypcję, ekstrakcję i klasyfikację Decisions. Po odpowiedzi użytkownika zidentyfikowano Jev (TypeSafe AI / Vercel AI Gateway), zamknięto Q01 i rozszerzono opis porównania w T12; zakres podstawowej bety bez zmian.
- Dodano instrukcje aktualizacji planu, statusy, szablon handoffu i przekazanie startowe. Brak zmian kodu i usług.

Kolejne wpisy powinny podawać zadanie, powód zmiany, wpływ na zakres/zależności i odnośnik do decyzji, jeśli dotyczy.

## 2026-10-11 — T00 — prompty przekazania

Na prośbę użytkownika dodano obowiązek kończenia sesji od T01 promptem dla kolejnego agenta, zapisanym także w handoffie. Zaktualizowano AGENTS, WORKFLOW, szablon handoffu, ROADMAP i STATUS. Prompt uwzględnia zależności, blokery i rekomendację oszczędnego modelu; nie uruchamia automatycznie agentów. Zakres produktu i status T01 bez zmian.

## 2026-10-11 — T01 — lokalny prototyp

Na zlecenie użytkownika rozpoczęto implementację tylko T01. Dodano Next.js/React/TypeScript, lockfile, konfigurację testów, syntetyczny plan A/B, responsywną nawigację i ekran podglądu treningu bez trwałego zapisu. Powód: spełnienie kryteriów T01 bez sekretów i usług. D008 dokumentuje przyjęty fundament; pozostałe propozycje D004 nie są wdrożone. Status T01 zmieniono z `todo` przez `in_progress` na `done`. Zależności i zakres T02–T12 nie zmieniły się.

## 2026-10-11 — T02 — schemat domeny i baza

Na osobne zlecenie użytkownika wykonano tylko T02. Dodano migrację PostgreSQL z 13 prywatnymi tabelami, RLS, złożonymi kluczami własności, wersjami planów, kopiami celów, rewizjami i potwierdzeniami operacji. Dodano typy, walidatory, testy domenowe i odtwarzalny lokalny test bazy. Powód: zapewnienie trwałego kontraktu danych przed integracją kont i zapisu treningu. D009 opisuje przyjęte zabezpieczenie bezpośredniego zapisu wyników do czasu transakcyjnej komendy T05. T02 zmieniono z `todo` przez `in_progress` na `done`; ID i zależności T03–T12 bez zmian. UI nadal używa danych syntetycznych, a Supabase Auth/Storage nie są zintegrowane.

## 2026-10-11 — T03: konta testerów i prywatność

Na osobne zlecenie użytkownika wykonano wyłącznie T03. Dodano lokalną konfigurację Supabase, logowanie i wylogowanie zaproszonych testerów, potwierdzenie zaproszenia i ustawienie hasła, obsługę nieważnej sesji w proxy Next.js oraz prywatny bucket z politykami własności. Dodano kontrolę rozdzielenia środowisk preview/production i odrzucenie klucza administracyjnego w zmiennej publicznej. Powód: sprawdzenie RLS i Storage przez rzeczywiste Auth/API przed edytorem i zapisem treningu. Rzeczywisty lokalny test A/B/anon, zaproszenia i wygasłej sesji przeszedł; usługi hostowane pozostają T11. D010 dokumentuje wybór. T03 zmieniono z `todo` przez `in_progress` na `done`; ID i zależności T04–T12 bez zmian. T04 nie rozpoczęto. Ekrany planu i treningu nadal używają danych syntetycznych.

## 2026-10-11 — T04: edytor planu i rzeczywiste 1RM

Na osobne zlecenie użytkownika wykonano wyłącznie T04. Dodano prywatny edytor tygodni/dni A/B, ćwiczeń i indywidualnych serii z rampą, superserią oraz uwagami. Publikacja przez funkcję SQL jest atomowa, tworzy kolejną niezmienną wersję, kontroluje oczekiwaną wersję i rozpoznaje ponowienie operacji. Profil zapisuje datowane rzeczywiste 1RM i krok zaokrąglenia; podgląd planu pokazuje cel kg tylko przy dostępnym maksimum. Powód: ręczne tworzenie i edycja bez AI oraz zachowanie historii przed T05. D011 dokumentuje wybór. T04 zmieniono z `todo` przez `in_progress` na `done`; ID i zależności T05–T12 bez zmian. T05 nie rozpoczęto, ekran wykonania pozostaje demonstracyjny, hosting pozostaje T11.

## 2026-10-11 — T05: wykonanie i historia treningu

Na osobne zlecenie użytkownika wykonano wyłącznie T05. Dodano transakcyjną funkcję zapisu treningu, prywatny ręczny ekran, historię, poprzedni porównywalny wynik, testy Auth/API i HTTP E2E. D012 opisuje wybór atomowej rewizji, idempotencji i snapshotów; ręczny wpis nie używa AI. T05 zmieniono z `todo` przez `in_progress` na `done`, bez zmian ID i zależności innych zadań. Przy lokalnym HTTP E2E odkryto błędny wzorzec UUID w kodzie T04; poprawiono go w odczycie/edycji planu oraz w ścieżce T05, bo blokował otwarcie prawidłowego planu i start treningu. Zakres produktu bez zmian. Hosting pozostaje T11.

## 2026-10-12 — T06: lokalny import i blokada prawdziwych prób

Na osobne zlecenie użytkownika wykonano tylko T06. Dodano 12 syntetycznych źródeł, adapter Responses API, walidację PDF/obrazu/tekstu i szkicu, prywatny bucket, trwałe zadania i próby, globalną rezerwację budżetu, limit czasu, retry, anulowanie, atomowe zatwierdzenie oraz sprzątanie. D013 zapisuje decyzję implementacyjną. Testy domenowe, lokalne Auth/API/Storage A/B/anon i HTTP E2E przeszły z mockiem AI. T06 zmieniono z `todo` przez `in_progress` na `blocked`, ponieważ brak klucza i uzgodnionego budżetu uniemożliwia wymagany raport rzeczywistej dokładności, czasu i kosztu. Identyfikatory i zależności innych zadań bez zmian; T07 nie rozpoczęto. Hostowane środowiska nadal do T11.

## 2026-10-12 — T06: kontynuacja bez dostępu do klucza

Na zlecenie kontynuacji wyłącznie T06 sprawdzono aktualne dokumentacje OpenAI i Vercel, uruchomiono ponownie lokalne A/B/anon, HTTP E2E, typy i testy. Użytkownik uzgodnił budżet prób do 5 USD. Klucz nie jest dostępny w procesie zadania ani we wskazanym wpisie Pęku kluczy, więc nie wykonano płatnych wywołań i T06 po przejściu przez `in_progress` pozostaje `blocked`. Rozszerzono harness o porównanie dodatkowych pól oraz jawne liczenie opuszczeń i dopowiedzeń; nie są to wyniki jakości modelu. Poprawiono instrukcję regeneracji fixture'ów. ID, zależności i zakres produktu bez zmian; D013 pozostaje aktualna, bez nowej decyzji architektonicznej. T07 nie rozpoczęto.

## 2026-10-12 — T06: prawdziwe próby i granica większych planów

Użytkownik udostępnił klucz w ignorowanym `.env` i uzgodnił do 5 USD. Po sprawdzeniu bieżącej dokumentacji OpenAI uruchomiono prawdziwe próby `gpt-6-luna`, poprawiono prompt do `import-pl-v3`, szczegółowość zdjęć i walidację brakującej liczby. Ostatnie 12 syntetycznych przypadków dało 12/12 szkiców, 90/90 pól, zero opuszczeń/dopowiedzeń; D014 opisuje powód zmian. Ponowiono lokalne testy A/B/anon, HTTP, typy i build. Przekazany prywatny PDF (6 stron) przekracza limit 4 stron; dodatkowe próby całego PDF, jego tekstu i jednej gęstej strony nie ukończyły się w obecnym czasie/limicie odpowiedzi. Dwa przekazane XLSX są nieobsługiwane; D015 zapisuje propozycję dalszego rozstrzygnięcia bez zmiany zakresu. Dlatego T06 po `in_progress` ma status `blocked`, a T07 nie rozpoczęto. T08 ma spełnioną niezależną zależność T05; użytkownik może zlecić je osobnemu agentowi z rozdzielonymi plikami. ID i zależności zadań bez zmian.

## 2026-10-12 — T06: rozszerzenie PDF/XLSX i kontrakt pytań

Użytkownik potwierdził natywny XLSX i PDF do 6 stron w T06 oraz pytania podczas importu; wyraźnie ograniczył tę sesję do kontraktu pytań, pozostawiając ekran T07. D016 zastępuje propozycję D015 oraz parametry czasowe D013. Dodano ekstrakcję komórek XLSX, podział arkuszy i PDF, dłuższą dzierżawę, limit odpowiedzi 16 000 tokenów, obsługę czasu i przerw oraz pytania o braki serii, celu, dnia i znaczenie procentu. Prawdziwa seria z promptem v8 dała 12/12 syntetycznych szkiców i 90/90 pól; prywatne PDF i XLSX tworzą szkice wymagające ręcznego wyjaśnienia. Testy lokalne A/B/anon i HTTP pozostają mockowe. Nie rozpoczęto T07, nie uruchomiono innego agenta, a prywatne źródła nie trafiły do repo. Powód zmiany: rzeczywiste formaty i objętość planów przekraczały początkowe limity. Identyfikatory i zależności zadań pozostają bez zmian.

## 2026-10-12 — logowanie wraca do strony głównej

Formularz logowania wysyłał hasło poprawnie, ale przeglądarka zostawała na formularzu. Zapis sesji i przekierowanie dzieją się teraz w odpowiedzi HTTP formularza, więc po zalogowaniu otwiera się strona główna. Błędne hasło wraca na formularz z komunikatem. Zakres zadań bez zmian.

## 2026-10-12 — korekta następnego kroku po T06

Po uwadze użytkownika poprawiono kolejność przekazania: prompt następnego agenta wskazuje T07, czyli brakujący ekran importu oparty na gotowym kontrakcie T06. T08 nadal może być niezależnym zadaniem równoległym, ale nie zastępuje kolejnego etapu importu. Zmieniono STATUS i handoff; statusy, zakres i zależności ROADMAP pozostają bez zmian.

## 2026-10-12 — T07: ekran importu i korekta

Na zlecenie użytkownika wykonano wyłącznie T07. Dodano mobilny ekran wyboru PDF do 6 stron, XLSX, PNG/JPEG, aparatu i tekstu; listę trwałych zadań, postęp, retry, anulowanie, prywatny podgląd źródła, pytania po 10 na stronę i edycję planu przed jawnym zatwierdzeniem. Korekta i odpowiedzi są zapisane w osobnym polu zadania, aby można było wrócić po odświeżeniu; D017 opisuje ten wybór. Rozszerzono lokalne testy HTTP na podgląd i korektę A/B/anon, a test komponentu na wiele pytań i odmowę aparatu. Powód: duże XLSX z T06 wymagają wielu odpowiedzi, a szkic AI nie może zostać automatycznie opublikowany. T07 zmieniono z `todo` przez `in_progress` na `done`; ID i zależności innych zadań bez zmian. Nie uruchomiono T08/T09 ani nowego płatnego AI. Fizycznego urządzenia i hostingu nie sprawdzono; wymaga to T10/T11.

## 2026-10-12 — T08: podstawowe monitorowanie postępu

Na osobne zlecenie wykonano wyłącznie T08. Dodano prywatny widok wyników ćwiczeń i wykonania planu, filtr wariantu/daty oraz objętość z wykonanych i porównywalnych serii. D018 zapisuje reguły wykluczenia pominięć, masy ciała, asysty i niejednoznacznego ciężaru hantli; nie tworzono estymowanego 1RM. Test znanych treningów dał 940 kg i 1140 kg po poprawce; lokalne Auth/PostgREST i HTTP potwierdziły A/B/anon oraz ponowny odczyt. T08 przeszedł z `todo` przez `in_progress` na `done` lokalnie. ID, zależności i zakres pozostałych zadań bez zmian; T09/T10 nie rozpoczęto. Urządzenia i hosting pozostają niesprawdzone.

## 2026-10-12 — T09: lokalna implementacja dyktowania

Na osobne zlecenie wykonano wyłącznie T09 i nie uruchomiono agentów równoległych. Dodano nagrywanie WebM/MP4, transkrypcję, interpretację polskich poleceń, edytowalne karty propozycji planu, serii/poprawki, komentarza i dodatkowego ćwiczenia. Plan trafia najpierw do szkicu; zapis treningu korzysta z istniejącej transakcyjnej komendy T05. Opcjonalne serie dodatkowego ćwiczenia są atomowe, z retry i rewizją. D019 zapisuje zakotwiczenie celu oraz osobny budżet głosu; rezerwacje metadanych są sprzątane po 7 dniach. Powód: głos musi prowadzić do świadomego zapisu bez zgadywania braków i bez utrwalania nagrań. Lokalne testy A/B/anon, HTTP, typy i build przeszły. Jakość prawdziwego OpenAI, czas i koszt oraz format na fizycznym telefonie pozostają do sprawdzenia po uzgodnieniu budżetu i dostępie do urządzenia; dlatego T09 jest `review`. T10/T11 pozostają nierozpoczęte. Regresja T06 trafiła na istniejący globalny limit prób w 24 h; szczegóły w handoffie T09.

## 2026-10-12 — T09: kontynuacja weryfikacji bez płatnej próby

W ramach T09 dodano kontrolę ID treningu do każdej karty propozycji, aby odpowiedź dla komentarza lub dodatkowego ćwiczenia nie mogła zostać zatwierdzona w innym treningu. Po automatycznym końcu nagrania interfejs pokazuje stan transkrypcji. Harness prawdziwej ewaluacji zapisuje różnice, osobne czasy audio i wymaga progu jakości, zamiast zaliczać samą liczbę odpowiedzi. Lokalna regresja T09 i T05, testy jednostkowe, typy oraz build przeszły. Zapytano o odrębny limit kosztu T09, ale nie otrzymano jeszcze odpowiedzi; nie wywołano płatnego API. ADB widzi tylko emulator. Globalna próba T06 wygasa 2026-10-13 12:23 UTC, więc nie usuwano jej ani nie deklarowano pełnej regresji. T09 pozostaje `review`, T10/T11 są nierozpoczęte; ID i zależności bez zmian. Nie podjęto nowej decyzji architektonicznej względem D019.

## 2026-10-13 — T09: prawdziwa ewaluacja syntetycznego głosu

Po wyraźnym zatwierdzeniu limitu 0,50 USD wyłącznie na T09 wykonano cztery serie prawdziwego OpenAI na syntetycznych polskich danych. Pierwsza próba ujawniła zbyt dosłowny pomiar tekstu i błąd przy niekompletnym ćwiczeniu; kolejne pokazały niestabilność skrótu „pięć po sto” i planu. Zmieniono walidator tak, by niekompletna propozycja dawała pytanie bez zapisu, doprecyzowano prompt `voice-pl-v2` oraz porównanie komentarzy/nazw. D020 dokumentuje wybór. Końcowy raport: 20/20 tekstów, poprawny plan, 2/2 krótkich syntetycznych nagrań, p50/p95 tekstu 4,351/8,622 s, audio 0,552/0,552 s; szacunek wszystkich czterech serii 0,010376 USD. T09 przeszedł przez `in_progress` do `review`, bo ADB wykrył tylko emulator i fizyczny odbiór głosu nadal nie jest wykonany. Lokalne T09/T05 A/B/anon, testy jednostkowe, typy i build przeszły. Pełnej regresji T06 nie ponowiono przed wygaśnięciem istniejącej próby; nie usuwano cudzych danych. T10/T11 nie rozpoczęto, identyfikatory i zależności bez zmian.

## 2026-10-13 — T09: asynchroniczny błąd nagrywania i dalsza regresja

Kontynuowano tylko T09. Odkryto brak obsługi asynchronicznego błędu `MediaRecorder`: po przerwaniu nagrywania UI mogło pozostać w stanie nagrywania, a zdarzenie `stop` mogło próbować wysłać częściowy plik. Dodano zatrzymanie mikrofonu, unieważnienie nagrania i komunikat z ręcznym fallbackiem. Testy mockowe obejmują ścieżkę MP4 oraz zmianę serii przy spóźnionej interpretacji. `npm test` (67 aktywnych), lokalne i HTTP T09 A/B/anon, T05, build oraz typy przeszły. Żadnych nowych płatnych prób nie wykonano. ADB widzi tylko emulator, USB nie wykazało telefonu, a użytkownik potwierdził jego brak; dlatego T09 po przejęciu w `in_progress` wraca do `review`, bez odbioru fizycznego. T06 nie uruchomiono przed 12:23 UTC ani nie usuwano istniejących prób. D019/D020 i kontrakt T05 pozostają bez zmian; nowej decyzji architektonicznej nie podjęto. T10/T11 nie rozpoczęto, ID i zależności bez zmian.

W trakcie tej kontroli przywrócono `review` według wcześniejszego wymogu fizycznego telefonu. Późniejsza wyraźna decyzja użytkownika o dopuszczeniu emulatora do lokalnego odbioru T09 jest zapisana w następnym wpisie. Nie usuwano cudzych wyników ani plików.

## 2026-10-13 — T09: lokalny odbiór na emulatorze

Użytkownik wyraźnie uznał emulator za wystarczający na ten etap i polecił oznaczyć T09 jako gotowe. D021 zapisuje zaakceptowaną przez użytkownika zmianę kryterium ograniczoną do lokalnego T09. W Chrome Android sprawdzono uprawnienie mikrofonu, nagrania WebM/Opus i wymuszone MP4, anulowanie z odrzuceniem danych oraz zwolnienie ścieżki. Test korzystał z tymczasowej lokalnej strony, więc nie jest pełnym klikalnym E2E aplikacji. Testy aplikacji obejmują 67 testów jednostkowych, mockowe opóźnienie i zmianę serii, lokalne A/B/anon, retry, rewizje, T05, typy i build; nie wywołano ponownie płatnego API. T09 zmieniono z `review` przez `in_progress` na `done` w uzgodnionym lokalnym zakresie. Fizyczne telefony i Safari pozostają do szerszego odbioru T10, którego nie rozpoczęto. Nie uruchomiono T06 przed końcem okna próby ani nie usuwano cudzych danych. ID i zależności zadań bez zmian.

Po wykryciu sprzeczności z równoległym bieżącym zleceniem, które wprost zabrania statusu `done` bez fizycznego telefonu, przywrócono T09 do `review` i poproszono użytkownika o rozstrzygnięcie kryterium. Wyniki emulatora i handoff zachowano; nie traktowano ich jako testu fizycznego urządzenia.

## 2026-10-13 — rozpoczęcie T06-R1

Na wyraźne zlecenie użytkownika wydzielono T06-R1 po T04/T06/T07: naprawa importu rzeczywistych tabel, pytań i podglądu. Zachowano wcześniejsze ID i zależności. Użytkownik zatwierdził plan implementacji i dołączenie trzech prywatnych źródeł do lokalnego projektu; nie oznacza to publikacji źródeł. T09 pozostaje poza zakresem.

## 2026-10-13 — zakończenie T06-R1

Po niezależnym odczycie i baseline trzech przekazanych źródeł wdrożono czytnik rzeczywistych struktur XLSX oraz kontekst PDF, kontrakt v2 z zakresami/powtarzanymi blokami/AMRAP/opcjonalnością, superserie, pytania z cytatami i stabilnymi celami, pełny podgląd PDF.js/XLSX oraz słownik PL/EN. D022 zapisuje wybór. Powód rozszerzenia danych: poprawny zakres źródła nie może stawać się brakiem ani znikać przy zapisie planu. Dwie kompatybilne migracje zastosowano lokalnie; nie przeliczano historycznych celów. Źródła i pełne wyniki są lokalnie za zgodą użytkownika; nie zostały opublikowane.

Końcowe pliki: PDF 30 ćwiczeń/1 uzasadnione pytanie, FBW 19/6, Madzia 12 jednostek/17. Każde pytanie oceniono; pozostałe wymagają interpretacji źródła, nie zgadywania. Oba XLSX czytane bez żądania AI. Pełna seria syntetyczna v11 88/90 pól, dwie różnice dni A/B; poprawka adaptera zachowuje jawne prefiksy, celowane v12 17/17. Wcześniejsze niezaliczone próby i cztery niepełne metryki kosztu zachowano. Znany koszt 0,058016 USD nie jest pełnym rachunkiem. Przed płatnymi próbami sprawdzano dotychczasowy budżet T06 (5 USD), bez resetu istniejących rezerwacji.

Testy domeny/UI, niezależny audit PDF i pytań, lokalne T04/T05/T06/T06-R1/T08, HTTP A/B/anon/retry oraz klikalny Chrome na rzeczywistych plikach przeszły; build i typy również. Kontrola zrzutu poprawiła mobilny overflow i kontrast etykiet. Nowa kontrola braków celu objęła też dokumenty bez pierwotnych pytań i metadanych wersji; stare testy pytań dostały rzeczywiste cele zamiast pustych obiektów serii. Nie uruchomiono innych agentów, hostingu ani fizycznych urządzeń. T06-R1 ma `done` lokalnie; T09 pozostaje `review`, T10/T11 nie rozpoczęto. Zaktualizowano README, STATUS, ROADMAP, T06_IMPORT, DATA_MODEL, UX, TESTING i dodano EXERCISE_NAMES oraz handoff. Brak następnego zadania w uzgodnionym zakresie.

## 2026-10-13 — rozpoczęcie T07-R1

Użytkownik zatwierdził przebudowę wyłącznie przeglądu importu: trzy kroki, źródło na żądanie, ankieta modalna i edycja całego bloku identycznych serii. Powód: formularz każdej serii utrudnia przegląd planu. Wydzielono T07-R1 po gotowych T07/T06-R1; zachowano osobne rekordy serii i zakresy w danych. Nie zmieniamy ręcznego edytora, nie uruchamiamy agentów ani nowych płatnych prób AI.

## 2026-10-13 — T07-R1: trzy kroki, karty i ankieta

Zastąpiono pełny formularz importu osobnym przeglądem ćwiczeń, serii/superserii i podsumowania. Identyczne sąsiadujące serie są blokiem, różnice i braki pozostają widoczne. Edycja bloku i indywidualna zachowują ID, uwagi, opcjonalność i źródła; superserie mają skład/kolejność/przerwę i możliwość rozłączenia. Źródło jest panelem/dialogiem na żądanie. Ankieta pokazuje jedno pytanie, wybory, ilość/zakres/AMRAP i podgląd, z korektą fragmentu i odkładaniem. D023 dokumentuje decyzję użytkownika. Dodano opcjonalny krok i potwierdzenia w review_data, kompatybilny GET/PATCH i stabilną serializację JSONB; brak migracji planów/historii. Stabilne cele pytań obsługują także zmianę dnia, a odpowiedzi na konwencję przerwy unieważnia tylko zmiana przerw.

Testy wykryły problem pozycji przewijania po zmianie kroku i pętli fokusu; poprawiono oba. Retry po utracie odpowiedzi z publikacji pomija PATCH, który dla już zatwierdzonego zadania byłby odmówiony, i ponawia zatwierdzenie z tym samym ID. Niezastosowane dodawanie/edycja jest odrzucane przy zamknięciu. Weryfikacja używa lokalnego Auth/Storage i zachowanych wyników trzech źródeł; nie wykonano nowych płatnych prób AI ani publikacji prywatnych planów. Ręczny edytor oraz T09 poza zakresem. Wyniki i ograniczenia w nowym handoffie T07-R1.

## 2026-10-13 — zakończenie T04-R1

Ręczne tworzenie i edycja planu korzystają z kart jednego treningu, podglądu całości i okien edycji ćwiczenia/bloku/serii. Zakresy i dodatkowe parametry są na żądanie; metadane i złożone cele pozostają zachowane. Lokalna walidacja fragmentu pozwala uzupełniać niekompletny szkic etapami. Katalog, głos, organizacja planu, jawna publikacja całej wersji, blokada zapisu i identyczny payload retry zachowują dotychczasowe kontrakty. Na telefonie pasek zapisu nie zasłania kart. D024 rozwija wcześniejszy zakres D023; import zachowuje własne trzy kroki i zgodność starszego klienta.

122 testów, lokalne T04, produkcyjny build i typy, Chrome desktop/mobile na własnych danych syntetycznych z rzeczywistym zapisem/utratą odpowiedzi/retry/niezmiennością snapshotów oraz HTTP T07-R1 przeszły. Bez płatnych prób AI, innych agentów, publikacji prywatnych fixtures i migracji. T04-R1 przeszedł z in_progress do done lokalnie; T09 nadal review, T10/T11 nie rozpoczęto. Uaktualniono README, STATUS, ROADMAP, UX, DATA_MODEL, T06_IMPORT, TESTING, DECISIONS, CHANGELOG i dodano handoff. Brak kolejnego zadania w uzgodnionym zakresie.

## 2026-10-14 — rozstrzygnięcie T09 i rozpoczęcie lokalnego T10

Użytkownik przeniósł własny review na fizycznym telefonie po wdrożeniu Vercel i zezwolił na dalszą implementację (D025). T09 zamknięto lokalnie według dotychczasowych dowodów. T10 przejęto jako in_progress: lokalny odbiór, błędy, polityki i poprawki. Wydzielono T10-R1 po T11 dla urządzeń, zachowując ID i pozostałe zależności, by wdrożenie nie zależało od testu wymagającego wdrożenia. Szersza beta nadal wymaga fizycznego odbioru. Bez agentów, nowego płatnego AI i publikacji prywatnych fixtures.

## 2026-10-14 — zakończenie lokalnego T10

Przegląd i odbiór ujawniły pozostawiony w D011 bezpośredni zapis katalogu/planów, brak kontroli obiektu JSON w części API oraz przekierowanie API do HTML po utracie sesji. Zamknięto granty w kompatybilnej migracji, dodano wspólny czytnik z limitami oraz JSON 401 w proxy. D026 dokumentuje wybór. Uzupełniono też `.gitignore` i `.vercelignore` o prywatne fixtures, `.env*` i `.vercel`, bez usuwania danych. Zaktualizowano fixture T03 i oczekiwania anonimowego HTTP do nowych uprawnień/401.

Nowy runner T10 wyłącza AI i łączy istniejące regresje z kontrolą grantów oraz syntetycznym pełnym treningiem w Chrome. 159 testów, lokalne Auth/API/Storage/Mailpit, build i typy, HTTP importu/T08/T09, Chrome T04-R1 i końcowy Chrome T10 przeszły; audyt produkcyjnych zależności: 0 podatności. Nowy Chrome wymagał poprawek selektorów i oczekiwania na nawigację, a jego sekcję powtórzono osobno; nie deklarujemy jednego pełnego zielonego przebiegu. Nie uruchomiono płatnego AI, agentów ani wdrożenia. T10 przeszedł z in_progress do done lokalnie; T11 todo (konfiguracja usług do ustalenia), T10-R1 todo (użytkownik po Vercel). Raport, handoff, manifest źródeł i lista fizycznego odbioru rozdzielają te etapy.

## 2026-10-14 — T11: przygotowanie wdrożenia i potwierdzony brak dostępu

T11 przejęto in_progress po gotowym lokalnym T10, przygotowano procedurę operatora i instrukcję testera oraz następnie oznaczono blocked: użytkownik nie wskazał docelowych projektów, CLI Supabase/Vercel nie mają poświadczeń, a integracje nie są połączone. Bez projektów/migracji zdalnych, uploadu, HTTPS, płatnego AI i innych agentów. T09/T10 pozostają done lokalnie, T10-R1 todo po T11; nie zmieniono zależności.

D027 wprowadza listę dozwolonych źródeł Vercel, skrypt czystej kopii i lokalny manifest 94 plików z osobnym wykazem 20 migracji, bez prywatnych fixtures/.env/docs/testów/migracji w uploadzie aplikacji. Instalacja offline/build/typy kopii i syntetyczne testy zabezpieczeń przeszły. Oficjalny dry-run Vercel odmówił z braku poświadczeń; lokalnego manifestu nie uznano za wysyłkę. Aktualne dokumenty dostawców ujawniły transport audio 5 MiB vs 4,5 MB Vercel, ograniczenia SMTP, produkcyjny zakres crona i potrzebę obsługi backlogu cleanup. Rozwiązania transportu i parametry backupu pozostają do ustalenia, nie cichą zmianą wymagań. Uaktualniono README/STATUS/ROADMAP, ARCHITECTURE, T03_AUTH, TESTING, OPEN_QUESTIONS, DECISIONS, dodano T11_DEPLOYMENT, TESTER_GUIDE, manifest i handoff z identycznym promptem. Szczegóły ograniczeń i nieudanych prób w handoffie.

## 2026-10-14 — T11-G1: pierwszy commit do repo użytkownika

Na jawne zlecenie użytkownika wydzielono pomocnicze T11-G1 w ramach przygotowania T11: inicjalizacja Git/main i pierwszy push do istniejącego publicznego gisupanalizy/training-plan-app. Potwierdzono pusty remote oraz prawo push. Wstępny odczyt nazwy ze zrzutu pomijał literę p i dał 404; poprawiono adres przed publikacją. Kontrola indeksu nie wykazała sekretów ani prywatnych fixtures; dodano wykluczenie supabase/.branches i .DS_Store. Zaktualizowano bieżący STATUS i procedurę, zachowując historyczne handoffy bez zmian. T11 pozostaje blocked przez nieustalone usługi hostowane; nie uruchamiano agentów ani płatnego AI.

## 2026-10-16 — T11-E1: konfiguracja bez ręcznego kopiowania sekretów

Użytkownik zlecił użycie automatycznych zmiennych Supabase, usunięcie zbędnych kopii i ustawienie parametrów aplikacji. Wydzielono T11-E1, z właścicielem Codex i gotowymi zależnościami T03/T06. Kod preferuje całą rodzinę STORAGE, z fallbackami publishable/anon i secret/service_role oraz zachowaniem nazw lokalnych. Nie miesza źródeł. Wydzielono serwerowego klienta, dodano testy konfiguracji i wykluczono lokalny env.vercel bez zmiany jego treści. D028 opisuje decyzję.

20 testów konfiguracji, pełne 171 passed/9 skipped, build/typecheck z syntetycznymi zmiennymi integracji i lokalne HTTP T06/T07 z rzeczywistym Auth/API/Storage na mocku AI przeszły. Nowy manifest 95 plików z wykazem 20 migracji nie nadpisuje historycznego raportu z 14 października. .next/static nie zawierało serwerowych nazw ani syntetycznego sekretu. W Chrome potwierdzono istniejący projekt Vercel i produkcyjny Supabase; osiem ręcznych ustawień ograniczono do Production, nie odczytywano/zmieniano wartości CRON_SECRET. Konektor/CLI nadal nie są połączone, ale przeglądarka umożliwia konfigurację. Usunięcie trzech ręcznych duplikatów jest przygotowane do potwierdzenia wymaganego przy trwałym usuwaniu przez przeglądarkę. T11-E1 review; T11 in_progress zamiast historycznego blocked, bo dostęp UI i cel produkcji zostały ustalone. Brak migracji hostowanych, nowego płatnego AI, agentów i odbioru telefonu.


## 2026-10-16 — T11-E1: zakończenie usuwania duplikatów

Po jawnym potwierdzeniu użytkownika usunięto z projektu Vercel training-plan-app dokładnie NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY i SUPABASE_SERVICE_ROLE_KEY. UI potwierdził brak tych wpisów oraz pozostawienie zmiennych integracji STORAGE i dwóch refów w Production. Nie odczytywano ani nie rotowano kluczy; usunięcie wpisów Vercel nie unieważnia kluczy Supabase. T11-E1 zmieniono z review na done; T11 pozostaje in_progress. Bez zmiany kodu, Redeploy, migracji, AI i nowych testów hostingu/urządzeń. Zaktualizowano README, STATUS, ROADMAP, procedurę i dodano handoff z identycznym promptem.

## 2026-10-16 — T11 — produkcja i migracje

D029 po wyraźnym wyborze użytkownika usuwa wymóg preview na obecny etap testów właściciela; zachowano ID i zależności, nie zmieniono walidacji środowisk. SMTP odłożony dla ręcznych kont, wymagany przed zaproszeniami. Po logowaniu CLI i jawnym zatwierdzeniu zastosowano 20 migracji produkcji, z T10. Metadane RLS/grantów/bucketów i anonimowy HTTPS przeszły; pełny smoke, Auth, cron/retencja i restore pozostają otwarte. Zapisano faktyczny Ready commit, szersze źródła deploymentu Git wobec manifestu kopii CLI oraz odrzucenia auto-review i potrzebne zgody. Nowe skrypty służą audytowi i przygotowaniu oddzielnego smoke produkcji; brak zmian funkcji produktu, sekretów i źródeł builda. [Handoff](handoffs/2026-10-16-T11-produkcja-migracje.md).

## 2026-10-16 — T11-C1 — konflikt rewizji na hostingu

Rzeczywisty smoke ujawnił HTTP 400 zamiast 409 i timeout30s przy biznesowym 40001, zgodnie z opisem błędu PostgREST dostawcy. Wydzielono T11-C1 po T10/T11-E1 bez zmiany zakresu produktu. D030: nowa 21. migracja zmienia 5 kodów błędu na PT409, API rozpoznaje 409. Lokalne T04/T05, suite, build/typy i nowy manifest przeszły; po osobnej zgodzie użytkownika zastosowano migrację i wdrożono kod ddaceb3 (Ready). Obie niezaliczone próby smoke usunęły swoje syntetyczne konta; nie zostawiły plików ani aktywnych zapytań. Po C1 błędną asercję nazwy planu w historii poprawiono w samym teście; końcowy smoke HTTP/Auth/API/Storage A/B/anon przeszedł, 2 konta/2 pliki usunięte bez błędów. Brak testu klikalnego UI, telefonu, płatnego AI, cleanup 200 i restore.

Końcowa kontrola sesji T11: git diff --check, składnia smoke, verify package, 109 linków lokalnych, zgodność raportu 21 migracji/17 RLS i identyczny prompt w handoffie/pliku odpowiedzi — sukces. T11-C1 done, T11 nadal in_progress. Dokumentacja i poprawiony runner są publikowane osobnym commitem po commicie kodu; źródła builda pozostają zgodne z manifestem C1. Użytkownik otrzymuje link do ręcznych testów i pusty formularz konta do prywatnego wypełnienia.

Końcowy skaner dokumentacji miał fałszywe trafienie w kotwicy Markdown słowa „środowisk”; skrypt powłoki kontynuował commit/push po asercji. Trafienie zweryfikowano, a opublikowane pliki ponownie sprawdzono z granicą tokenu — bez wykrytych sekretów. verify package nadal PASS, źródła builda bez zmian. Fakt zapisano w handoffie.


## 2026-10-16 — T11: Auth i priorytet testów prototypu

Po zgodzie zapisano Auth minimum12, Site URL i dwa redirecty, potwierdzone po ponownym odczycie. Cron Run200 na pustej kolejce po dowodzie0eligible, bez odczytu/rotacji sekretu. Aktualny build dokumentacji4e4a0aa wcześniejReady; curl potwierdził HTTPS mimo timeoutów Node i blokady klienta Chrome. Właściciel ma1konto/profil według samych liczników. Wykonano tylko publiczny schema-only dump do tmp, bez danych i restore.

Użytkownik uznał dalszy odbiór za nadmierny dla prototypu. D031 zmienia kolejność: obecny cel to oddanie aplikacji do testów i uruchomienie importu AI; dalszy backup/restore/monitoring odłożony, nie jest warunkiem jego testów. PełnyT11 pozostaje in_progress, T10-R1 i beta nie są deklarowane jako odebrane. Przyznano5USD łącznie na start; klucz użytkownik dodał prywatnie. Ustawienia importu true/5 wymagają nowego Production i jednej rzeczywistej próby. Nie przyznano odnawialnych5USD/dobę. Głos nadal wyłączony. Bez nowych agentów/usług, migracji i implementacji backupu.


## Końcowy wynik prototypu — D031/D032

T11 **review**: aplikacja przekazana właścicielowi do własnych testów. Bez dalszego automatycznego rozwijania infrastruktury. Import i głos są włączone na Production. Nowe wdrożenie głosu `dpl_DEkfN1gE4V3kk558B2SGEmVcyawS` Ready44s, kod4e4a0aa (kod aplikacji zgodny zC1). Wcześniejsze importowe `dpl_HnkRh9V8X3KBy7KEimgdbB54hYXe` Ready52s.

Rzeczywisty import tekstu: pierwsza asercja testu błędnie oczekiwała3surowych obiektów zamiast jednego szablonu i set_count3; HTTP200/needs_review już działało. Po poprawieniu testu: PASS,1dzień/1ćwiczenie/3serie×5/60kg/120s,0pytań, retry bez kolejnego AI. Druga próba1909input/473output tokens, szacunek0,0004274USD wg aktualnej taryfy Luny; pierwszej próby ani całej fazy nie rozliczono dokładnie. W obu próbach cleanup własnego konta bez błędów.

Głos: systemowy say/Zosia wygenerował syntetyczne2,91775s WAV97464B. Hostowana transkrypcja200 (~2,943s), interpretacja5powt./60kg na właściwą serię, brak zapisu przed zatwierdzeniem i kontrolowany zapis po zatwierdzeniu przeszły. Runner zatrzymał dopiero dodatkowy odczyt metadanych voice_attempts przez authenticated (42501); tabela prawidłowo nie jest dostępna klientowi. Nie deklarujemy całego runnera jako PASS i nie powtarzano płatnych wywołań dla tej zbędnej kontroli. Własne konto usunięto,0plików/0błędów cleanup. Bez fizycznego mikrofonu i telefonu.

Obie flagi true, szacunki aplikacji import4/głos1USD w24h;5USD łącznie na start obejmuje obie funkcje. To nie twardy łączny limit rachunku ani zgoda na codzienny nowy budżet. Użytkownik otrzymał instrukcję limitu projektu OpenAI, zapis niepotwierdzony. Krótkie nagrania można testować;5MiB wobec4,5MB Vercel pozostaje ograniczeniem dużych plików przed pełną betą. Stary smoke wymagał503AIoff — nie uruchamiać go bez dostosowania do obecnego stanu.

Kontrole końcowe dotyczą tylko dokumentacji i niezmienionego manifestu C1; bez ponawiania szerokiej regresji aplikacji.

## 2026-10-17 — T13-P: podział uzgodnionego planu, bez implementacji

Na jawne zlecenie użytkownika odtworzono pełny plan T13 z chatu „Opisz możliwości aplikacji”, którego wcześniej nie było w repo. Powód podziału: mniejsze sekwencyjne zadania z kontraktami pozwalają ograniczyć koszt i uniknąć sprzecznej pracy nad sesją/stanem UI. Zachowano nadrzędne T13 i wszystkie R01–R16; wydzielono dokumentacyjne T13-P oraz A sesje/API/datowanie → B podgląd → C wykonanie → D kalendarz → E niezależny odbiór. Zależności dotychczasowych T01–T12 bez zmian, T12 nadal deferred; pełny T11 i fizyczny T10-R1 pozostają otwarte.

D033 utrwala zakres i jednego integratora, D034 projektuje delete/late retry bez odtworzenia oraz korektę daty bez zmiany historycznych celów/1RM. Wskazano właścicieli plików, lokalne bramki i zasady review do E bez cyklu zależności. Dodano specyfikację, pięć promptów i pięć kart przyszłych handoffów (wyraźnie szablony), zaktualizowano README, STATUS, ROADMAP i właściwe specyfikacje. T13-P przeszło in_progress → done po kontroli dokumentacji; T13/A–E nadal todo i bez przypisanych wykonawców. Nie uruchomiono agentów, aplikacji, testów wykonawczych, migracji ani wdrożenia. Wyniki kontroli dokumentacji i prompt następnej sesji w handoffie podziału.


## 2026-10-17 — T13-A: sesje/API/datowanie lokalnie

Bieżące osobne zlecenie uruchomiło wyłącznie A. Jeden wykonawca/integrator Codex przejął przydział A; zachował zastaną dokumentację T13-P, bez innych agentów. D035 doprecyzowuje FK: odłączenie nullable kotwicy receipts, minimalny tombstone i osobny wewnętrzny receipt rewizji przy replace/finish. Nowa migracja22 zachowuje legacy i stare hashe, serializuje wszystkie komendy konta, wprowadza globalny konflikt, atomowe replace, trwałe delete/410, spójny read_workout i datowanie z niezmiennym snapshot_on. Repozytorium historii i filtry postępu korzystają ze wspólnej projekcji strefy. Dodano wyłącznie moduły A, GET, testy/runner npm bez zależności.

Lokalna bramka A przyjęta: replay21→legacy→22, wymuszony rollback, rzeczywiste RPC/HTTP A/B/anon, concurrency/retry/legacy/DST/snapshoty, regresje T04/T05/T06-R1/T08/T09, 180 passed/9 skipped, build/typy. Pierwszą błędną asercję testu poprawiono; zachowano fakty i ograniczenia w TESTING/handoffie. T13 in_progress, A review do E, B–E todo; zależności bez zmian. B jest gotowe dopiero po osobnym zleceniu. Dokumentacja wykonania zastępuje wcześniejsze opisy A jako wyłącznie projektu; T13-P i karty planned pozostają historią/szablonami. Bez commit/push, produkcji, płatnego AI, nowych usług i pozornego zamykania T11/T10-R1.


## 2026-10-18 — T13-B: podgląd planu lokalnie

Osobne zlecenie uruchomiło wyłącznie B; jeden wykonawca/integrator Codex przejął przydzielone pliki B i globals.css, zachowując wszystkie zastane zmiany A/T13-P. Selektor biblioteki bez tygodni zapamiętuje ID jednostki per plan/wersja; fallback nie scala nazw. Dodano krótkie karty, pełne Wszystkie serie i podgląd całości; oryginały/źródła/uwagi/rampy/AMRAP/opcjonalność/null/0 zachowane. Wersje i istniejący start są na żądanie; archiwum bez startu. D036 utrwala lokalną preferencję i wspólne czyste podsumowania planu/snapshotów dla C.

Integrator przypisał nowy syntetyczny runner Chrome B do wymaganej bramki; bez zależności i zmian package.json. R03 nie wymagał zmian edytora/importu: rzeczywisty syntetyczny przepływ zachował osobne A/A, tygodnie i16serii. Ręczny edytor Chrome, HTTP importu i B Auth/DB/UI PASS;360/390/430 px bez overflow, cztery pełne karty390×844, fokus/cele44.190 passed/9 skipped, finalny build i następujące typy PASS. Wcześniejsze błędy/pomiary/ograniczenia zapisano w TESTING i rzeczywistym handoffie.

B in_progress → review; lokalna bramka przyjęta, C gotowe po osobnym zleceniu. A/B review do niezależnego E, C–E niewykonane. Zwolniono pliki B/style dla C, zależności i zakres bez zmian. Zaktualizowano README, STATUS, ROADMAP, T13, UX, DATA_MODEL, ARCHITECTURE, PRODUCT, DECISIONS i TESTING oraz handoff. Bez SQL/API/C, produkcji, płatnego AI, commit/push i pozornego zamknięcia T11/T10-R1.


## 2026-10-18 — T13-C: prowadzenie treningu lokalnie

Osobne zlecenie uruchomiło tylko C. Codex jako jeden wykonawca/integrator przejął pliki C, globals.css i nowy runner Chrome, zachowując zastane A/B/T13-P. Zrealizowano przegląd i pojedynczą serię, rundy superserii, liczniki, Wszystkie serie/poprawkę, szkice i pełną komendę retry z GET po ACK, rozstrzygnięcie409 oraz ochronę powrotu/fokusu/scrolla. Start ma automatyczny czas i konflikty/legacy, finish korektę czasu/DST, delete dodatkowe potwierdzenie, replace korzysta z atomowego API A. Głos zachowuje zatwierdzenie i kotwicę. D037 utrwala klienta; bez zmian SQL/API i wymagań produktu.

Powód nowych plików C: rozdzielenie transportu od projekcji/szkiców i współdzielenie finish/dialogu między startem i sesją. Bramka C przyjęta po rzeczywistym lokalnym Chrome/API:360/390/430, cztery karty390×844, retry/409/GET failure, szkice/Wstecz, mock głosu, historyczna poprawka, legacy/replace/delete, korekta bez zmiany null i120/90, ponowne logowanie. Regresje T13-A/T05/T08/T09,198 passed/9 skipped, build/typy PASS. Wcześniejsze błędy jawnie w TESTING/handoffie.

C in_progress → review, A/B/C review do E; D–E niewykonane. Zależności/ID zachowane, D dopiero po osobnym zleceniu. Zaktualizowano README, STATUS, ROADMAP, T13, UX, DATA_MODEL, ARCHITECTURE, DECISIONS i TESTING; dodano rzeczywisty handoff z promptem D. Pliki C i style zwolniono. Bez commit/push, produkcji, płatnego AI, zmian usług lub pozornego odbioru T11/T10-R1. Pojawione podczas sesji .codex/hooks.json/.cursor/hooks.json pozostawiono bez edycji.


## 2026-10-18 — T14: opcje UI przed wyborem

Na jawne zlecenie użytkownika wydzielono T14 — analizę czytelności oraz trzy mobilne mock-upy do porównania przed wyborem kierunku. Użytkownik potwierdził priorytet telefonu i zestaw ekranów. To materiał projektowy, nie wdrożenie; T13 zachowuje ID, zależności i zastane statusy (w ROADMAP C jest już in_progress mimo starszego opisu w STATUS/handoffie B). Nie przejmujemy plików C ani globals.css. Wymaganie ikon i wyraźnego rozdzielenia parametrów zapisujemy jako cel projektu; konkretny układ pozostaje propozycją.


## 2026-10-18 — T14: gotowe mock-upy, review użytkownika

Przygotowano samodzielną galerię A/B/C, każdy wariant z czterema ekranami, siedmioma ikonami ruchów i danymi syntetycznymi. Analiza wiąże problemy hierarchii z rzeczywistymi komponentami B oraz uwzględnia ukończone w oddzielnej pracy C. T14 in_progress → review; decyzja użytkownika pozostaje otwarta (D038). Chrome:126 kontroli szerokości bez overflow, zaliczone interakcje, zrzuty i raport. Jawnie zapisano brak pełnej bramki czterech kart w A (2px obrysu) i C (dwie pełne); bez cichej zmiany T13. Nie zmieniano src, migracji ani usług. Zastane i równolegle pojawione zmiany C zachowano. Handoff: [T14](handoffs/2026-10-18-T14-mockupy-ui.md).


## 2026-10-18 — T14-S: wybór użytkownika A/A/A/C

Użytkownik wybrał Plany A z przewijaniem wielu planów gestem lewo/prawo, Podgląd A, Szczegóły A i Zapis serii C. Usuwa to bloker braku wyboru T14. Wydzielono T14-S do połączenia makiet i doprecyzowania swipe, zachowując oryginalne warianty oraz ID/zależności T13. To etap projektu, bez automatycznej implementacji produktu.


## 2026-10-18 — T14-P: prywatny PDF i pozostałe ekrany

Po wyborze A/A/A/C i dopisaniu swipe planów użytkownik zlecił użycie własnego PDF oraz warianty pozostałych ekranów; pełny zestaw potwierdził w pytaniu strukturalnym. T14-P rozwija prezentację, nie zakres backendu. Dodano D039; dokumentacja prywatnego źródła ogranicza się do lokalizacji/ograniczeń bez treści planu. Impeccable i pdf używane do projektu/odczytu. Bez innych agentów i implementacji aplikacji.


## 2026-10-18 — T14-S/P: gotowy pełny zestaw, prywatne dane poza repo

Połączono A/A/A/C, dodano swipe oraz po trzy warianty Startu/Importu/Korekty/Edytora/Historii/Postępu/Profilu/Logowania. Prywatne źródło, model, HTML i obrazy są w osobnym lokalnym katalogu; repo zawiera wyłącznie generyczne narzędzia i makiety syntetyczne. Stan S/P → review.192 publiczne i372 prywatne kontrole szerokości, przejścia i syntetyczny touch/klawiatura PASS. Cztery pełne karty390×844 naprawiają dawne2px A bez zmiany kryterium. D039 utrwala wybór; pozostałe osiem wyborów pozostaje otwartych. [Handoff](handoffs/2026-10-18-T14-pelna-galeria-prywatny-plan.md). Bez implementacji src, AI, bazy i produkcji.


## 2026-10-18 — T14-R2: feedback o importowaniu i obsłudze

Użytkownik wskazał zbyt podobne kroki Ćwiczenia/Serie, wymaga gestu swipe w mock-upie, gotowych ilustracji ćwiczeń, wykresów we wszystkich wariantach Postępu i klikalności całych kart. T14-R2 dopracowuje makiety w tym zakresie; zachowuje A/A/A/C oraz granice prywatnych danych. Wybór biblioteki wymaga sprawdzenia jej aktualnego pochodzenia i licencji. Bez wdrożenia aplikacji.

Wynik R2: odrębne treści trzech kroków i jawne potwierdzenia, pełne przyciski kart, przeciąganie myszą z ochroną kliknięcia, natywny swipe oraz trzy propozycje wykresów z jednostkami, filtrami i lukami danych. Dodano 17 oryginalnych SVG Workout Guide, manifest SHA/pochodzenia, lokalne licencje i atrybucję; niepełne pokrycie oznaczono neutralnie. Bez pakietu npm lub płatności. Zasoby/makiety prywatne pozostają poza repo.

T14-R2 in_progress → review.564 kontrole szerokości i cztery karty390×844 PASS; prywatny R2 siedem grup interakcji PASS. Publiczny R2 zatrzymał się na drag myszą, a dalszą diagnozę Chrome przerwał limit automatycznego review uprawnień. Przyczyna nieustalona; nie zapisano pełnego PASS. D040/specyfikacja/STATUS/ROADMAP i [handoff R2](handoffs/2026-10-18-T14-R2-import-gesty-wykresy.md) dokumentują granice. Bez src, migracji, backendu, AI, agentów, commit/push lub produkcji.

## 2026-10-18 — T14-K: osobna galeria kolorystyki

Na zlecenie użytkownika wydzielono porównanie palet, z obecną jako punktem odniesienia. Celem jest wybór kolorów przy stałym układzie A/A/A/C, bez utożsamiania nowej propozycji z zatwierdzonym motywem. Osobny artefakt i prywatny wariant poza repo, bez src i wdrożenia.

T14-K in_progress → review: Las/Kobalt/Miedź/Morska/Grafit/Noc, wszystkie ekrany i lokalna preferencja niezależna od układu. Dodano odsyłacz z głównej galerii i powrót, panel rozwijany na telefonie, porównanie/pojedynczą paletę i skalę szarości.432 kontrole szerokości, cztery karty w każdej palecie/jednostce,72 pary kontrastu tokenów i celowane interakcje PASS. Zrzuty końcowe uwzględniają malowanie dolnych iframe przez wysoki viewport. D041/specyfikacja/README/STATUS/ROADMAP i handoff K opisują propozycje. Po przywróceniu kontroli uprawnień publiczny R2 ponowiono z sukcesem; wcześniejsza przyczyna drag nieustalona, bez poprawiania gestu na podstawie przypuszczeń. Bez src, backendu, agentów, płatnego AI lub publikacji.


## 2026-10-18 — T14-U: konsultacja UI/UX

Wydzielono i zakończono konsultację na pytanie użytkownika o standardy, skille, biblioteki i kolejność wyborów. Zalecenie: ocenić pełny przepływ przed zatwierdzeniem wszystkich osobnych ekranów. Bez nowych zależności produkcyjnych, zmiany wymagań, makiet lub wyborów D039/D041. Aktualne źródła i granice w handoffie U.

## 2026-10-18 — T14-R3: kolejne decyzje i dopracowanie

Użytkownik wybrał Start A, Import C, Korektę A, Edytor A, Historię A i Logowanie C oraz zlecił dopracowanie ikon/nagłówka/edycji całego ćwiczenia. Postęp wymaga nowych propozycji z gestami i datami oraz researchu internetowego; Profil wymaga wyjaśnienia jednej prawdy o wynikach. Nowe T14-R3, bez samoczynnej zmiany modelu1RM, źródeł danych lub implementacji produktu. Paleta, Postęp i Profil pozostają bez wyboru.

Po doprecyzowaniu użytkownika zachowano ręczny rzeczywisty1RM z datą; bez automatycznego powiązania/estymowania z serii. Utrwalono sześć nowych wyborów niezależnie od localStorage i w galerii kolorów. Import C centruje ikony i ma ikonę ręcznego tworzenia; Korekta A doprecyzowuje nagłówek. Nowy formularz Edytora A ma całość ćwiczenia, indywidualne serie, anulowanie/fokus i lokalne zachowanie zmian. Termin „Powtórzenia” zależy od rodzaju zadania, bez błędnego zamieniania sekund na powtórzenia.

Postęp R3: trzy propozycje ciężaru/powtórzeń po researchu źródeł Hevy/Strong/Fitbod, szersze daty z całą historią, gest pinch, kontrolki i konkretne serie. Bez szacowania1RM lub historii właściciela. T14-R3 → review.192+372 kontrole i celowane interakcje PASS;216 prywatnych kontroli palet PASS. Pierwszy błąd runnera wynikał z wielokrotnego użycia document.write w jednym środowisku JS; poprawiono zakres skryptów w samym probe i powtórzono. D042/specyfikacja/README/STATUS/ROADMAP/TESTING oraz handoff R3 zapisują fakty. Bez src, API, DB, płatnego AI, agentów i publikacji.

## 2026-10-18 — T14-R4: szczegółowy brief Postępu

Użytkownik usunął wymaganie osobnego przycisku „Edytuj ćwiczenie” i wskazał jeden uproszczony układ Postępu z dwiema odmianami ćwiczeń. Nowy brief jawnie dodaje szacowany1RM jako domyślną metrykę analityczną; nie zastępuje rzeczywistego pomiaru do zaleceń procentowych. T14-R4 dopracowuje makiety, bez automatycznej zmiany obliczeń aplikacji lub profilu. Usuwamy stare propozycje A/B/C z bieżącego wyboru Postępu, zachowując historyczne opisy.

T14-R4 in_progress → review. Jasny Postęp z Inter, pojedynczą linią, metrykami nad wykresem, zakresami pod osią X i rekordami całej historii. Dwa przykłady ćwiczeń, zachowane pinch i sterowanie alternatywne; przycisk edycji usunięty, cała karta nadal otwiera pełny formularz. D043/specyfikacja/PRODUCT/README/STATUS/ROADMAP/TESTING i handoff R4 zapisują oddzielenie szacunku od ręcznego1RM i proponowaną metodę.192+372 kontrole szerokości i interakcje R4 PASS,216 prywatnych kontroli palet PASS. Dodano Inter/OFL1.1 z przypiętym źródłem i manifestem. Prywatne dane poza repo; bez zmian src/API/DB, agentów, płatnego AI, commit/push i publikacji.

## 2026-10-18 — T14-R5 i T15-P: wyjaśnienie danych i plan wdrożenia

Użytkownik wybrał domyślną paletę Noc, zlecił chmurkę metody1RM i dotykowe przesuwanie rekordów oraz zapytał o gotowość do wdrożenia i podział pracy. Dodano T14-R5 do makiet i T15-P do przygotowania etapów; nie stanowi to rozpoczęcia implementacji produktu lub automatycznego zlecenia innym agentom. Punkty istniejącej makiety pochodzą z syntetycznych treningów, podpisy osi są orientacyjnymi datami; doprecyzowanie dotyczy czytelności, nie wytwarzania nowych pomiarów.

Potwierdzono Profil A, zamykając wybory układów. R5 wprowadza Noc w głównej galerii, pomoc1RM i odczyt punktu. Po kolejnym feedbacku usunięto wybieranie najbliższego wpisu z całego SVG: wyłącznie punkt otwiera, klik poza punktem zamyka. Natywny swipe obu rzędów PR104→0px i końcowy publiczny/prywatny R5 PASS. Regresja192+372 szerokości i216 prywatnych palet PASS przed ostatnią korektą hit-test; po niej celowany R5 PASS. Wyodrębniono wspólne tokeny `t14-themes.py` bez zmiany palet.

R5/P → review. Plan T15 ma siedem etapów A–G, siedem promptów i siedem kart przyszłego handoffu, odrębnych autorów i jednego I. T15-D realizuje jednocześnie T13-D; G obejmuje T13-E, aby nie powielać zaległych prac. Stare ID i ich niewykonane statusy zachowane. Techniczny kontrakt analityki do zapisania w E/I; zaobserwowano filtrowanie dat w obecnym getProgress przed agregacją, więc PR całej historii wymagają niezależnego zakresu. D044 i dokumentacja zapisują decyzje/propozycje. Bez src/API/DB, agentów, commit/push, płatnego AI i publikacji.

## 2026-10-18 — T14-R6: klik myszy a przesuwanie wykresu

Użytkownik zgłosił brak informacji po kliknięciu punktu. Odtworzono na prawdziwym kliknięciu Chrome: pointerdown trafia w circle, ale pointerup/click w SVG wskutek natychmiastowego pointer capture. Test R5 obejmował dotyk i klawiaturę, nie wykrył regresji myszy. Dodano R6 do poprawy i celowanej regresji; zakres wymagań D044 pozostaje bez zmian.

R6 → review: capture dopiero przy drag, zwykły klik trafia w marker; nowy celowy klik/tap resetuje blokadę gestu. Publiczny/prywatny R6 PASS (5 metryk w iframe, zamykanie, drag→klik, mobile/klawiatura, tap po pinch). Prywatny R5 dotyku/pomocy/swipe PASS. Pierwszy setup R6 zasłaniał wykres pomocą otwieraną kliknięciem aktywnej metryki; poprawiono sam test. Obejrzano zrzuty widocznych informacji w desktopowej galerii i390px. Wygenerowano publiczne/prywatne galerie, dokumentacja i handoff aktualne. Bez CSS/src/API/DB, agentów, publikacji lub rozpoczęcia T15.

## 2026-10-18 — T15-U: konsultacja delegowania i limitów

Na pytanie użytkownika wydzielono konsultację T15-U (in_progress → done), aby oddzielić ocenę sposobu pracy od zlecenia implementacji. Rekomendacje i procedura wznowienia są w handoffie; A–G, zależności i wybory produktu bez zmian. Bez src, uruchamiania subagentów, commit/push lub publikacji.

## 2026-10-18 — GIT-S1: lokalny zapis aktualnej pracy

Na jawne zlecenie użytkownika zapisano bieżący kod/dokumentację/publiczne mockupy i zasoby w Git, z zachowaniem zastanych zmian i nowej konsultacji T15-U. Prywatny PDF/galeria i sekrety wyłączone. Sprawdzono zakres, wykluczenia, wzorce prywatnych danych oraz diff-check. Bez push, publikacji lub nowych bramek funkcjonalnych; samego zapisu nie utożsamia się z odbiorem T13/T15.

## 2026-10-18 — T15-U2: prompt zbiorczego zlecenia CLI

Po odczycie przekazanej rozmowy CLI przygotowano pełny szablon integratora i krótki prompt startowy. Zawiera przyszłą autoryzację A–G i delegowania, max2 wykonawców, pierwszeństwo nad oczekiwaniem osobnych zleceń, bramki, kontrakty B/D i E, wyłączność plików, kolejkę testów oraz checkpointy i bezpieczne wznowienie. Zgoda zaczyna działać dopiero po użyciu promptu przez użytkownika, nie przez zapis pliku. Oficjalne dokumenty subagentów/CLI/limitów sprawdzone, bez gwarancji automatycznego restartu. T15-U2 done jako konsultacja; A–G todo. Bez implementacji, uruchamiania agentów, konfiguracji CLI, commitu lub push.

## 2026-10-18 — T15: zbiorcze zlecenie implementacji

Użytkownik zlecił lokalne A–G z integratorem i maksymalnie dwoma wykonawcami, niezależnym G, checkpointami i lokalnymi commitami. Zgoda zastępuje osobne zlecenia etapów. A in_progress; reszta czeka na bramki. Bez zmiany wymagań lub publikacji.

T15 — przed B zapisano kontrakt przekazania przeglądu do D: jeden WorkoutEditor i walidowane historyMonth/historyDay dla powrotu do kalendarza, bez dowolnego returnUrl. Doprecyzowanie R14, zależności bez zmian.

T15-A review po przyjętej lokalnej bramce (204 testy/9skip, typy/build, Chrome21 stanów i desktop). B/E rozpoczęte równolegle. Poprawiono overflow profilu z długim emailem360 w fundamencie. Wymagania bez zmian; telefon/Safari nadal osobno.

### 2026-10-18 — T15-F lokalny Profil A i konto

- Prezentacja Profil A/Logowanie C/hasła w Nocy; rzeczywiste datowane1RM i historia, istniejące Auth bez zmian usług/SQL. Pending i fokus błędu, blokada pól podczas zapisu.
- F2unit, lokalny Chrome360/390/430 z prawdziwym login/error/1RM/krokiem/hasłem/logout/relogin oraz T04 PASS. Build/typy B/E/F PASS; dwie stare asercje demo w pełnej suite naprawia B.
- Stary T08 HTTP zawężony do jawnej filtrowanej sekcji historii, ponieważ nowe PR all-time prawidłowo zawierają daty spoza filtra. Zakres i izolacja nadal sprawdzane; ponowienie oczekuje kolejki.

### 2026-10-18 — T15-B lokalna bramka

- Start/karuzela planów/podgląd/szczegóły tabelaryczne/prowadzenie treningu w Nocy; zachowane komendy i bezpieczny kontekst powrotu dla D.
- Naprawiono początkowe wyrównanie drugiego planu i klawiaturę po drag. Chrome wykrył czwartą kartę aktywnego treningu pod nav; przeniesiono CTA pod listę, pełna powtórka PASS.
-32unitPASS, nowe powierzchnie360/390/430 i pełny niezmieniony T13-C PASS, build/typyPASS. D może korzystać z kontraktu B→D. Bez API/SQL/push.

### 2026-10-19 — T15-E odebrane lokalnie, start C

- Domknięto checkpoint99433b8 rzeczywistym ChromePASS wykonanym przez I; źródła/PR/paginacja i prywatność wcześniejPASS w API. Bez zmian wymagań; E review do G.
- B odebrane w60fcf41. Wykonawca /root/workout_ui przejmuje odrębny C po zwolnieniu B; E kończy dokumenty, następnie slot dla D. Zachowano limit2 wykonawców.

### 2026-10-19 — T15-D/T13-D odebrane lokalnie

Jeden kalendarz Historia A/Noc oparty o istniejący odczyt i projekcję T13-A; aktywne osobno, legacy bez wymyślonej godziny, walidowany powrót B i autoryzowany profil dla strefy/Dzisiaj. Bez zmian repozytorium/API/SQL.6testów, build/typy i realne API/Chrome3szerokości/klawiatura/daty/delete/privacyPASS. Oba ID review do G/T13-E.

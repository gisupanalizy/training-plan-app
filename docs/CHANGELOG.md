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

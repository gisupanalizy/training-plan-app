# Rejestr decyzji

## D024 — Kompaktowy ręczny edytor planu

- Data: 2026-10-13. Status: accepted w jawnie zleconym T04-R1; rozwija D023, którego wcześniejszy zakres obejmował tylko import.
- Problem: formularze wszystkich serii i wiele pustych pól utrudniają przejrzenie i edycję planu.
- Wybór użytkownika: jeden trening na ekranie i podgląd całego planu, krótkie karty, okno na desktopie/fullscreen na telefonie, domyślna edycja identycznego bloku oraz pojedynczej serii na żądanie. Podstawowe pola obejmują liczbę serii, cel, obciążenie i przerwę; zakresy i parametry dodatkowe na żądanie.
- Konsekwencje: ręczne tworzenie i edycja nowych wersji zachowują katalog, głos, wszystkie parametry i metadata, kontrolę właściciela oraz retry. Ukrycie pola nie usuwa wartości. Formularze walidują fragment, publikacja cały dokument. Bez migracji, nowych kontraktów API i automatycznego trwałego zapisu szkicu. Trzy kroki importu i status T09 pozostają bez zmian. Odbiór dokumentujemy po rzeczywistych sprawdzeniach.

Statusy: `confirmed` — wymaganie użytkownika; `proposed` — rekomendacja do wdrożenia/oceny; `accepted` — przyjęta decyzja implementacyjna z uzasadnieniem; `superseded` — zastąpiona z linkiem do następcy.

## D001 — Odbiorcy i online

- Data: 2026-10-11. Status: confirmed.
- Źródło: użytkownik. Wersja testowa dla właściciela i kolegów, głównie siła, działanie online.
- Konsekwencja: offline i panel trenera poza zakresem; osobne prywatne konta to propozycja realizacji tego wymagania.

## D002 — Rzeczywisty 1RM

- Data: 2026-10-11. Status: confirmed.
- Źródło: użytkownik. Procent dotyczy rzeczywistego 1RM.
- Konsekwencja: nie podstawiamy estymacji ani training max; historia i reguła zaokrąglania opisane w DATA_MODEL są propozycją techniczną.

## D003 — OpenAI i ręczne wprowadzanie

- Data: 2026-10-11. Status: confirmed.
- Źródło: użytkownik. OpenAI na początek; głos do planów, komentarzy, powtórzeń i dodatkowych ćwiczeń; wpisywanie ręczne również dostępne.
- Konsekwencja: głos jest częścią pełnej bety, a awaria AI nie może blokować ręcznych zapisów.

## D004 — Next.js, Vercel, Supabase

- Data: 2026-10-11. Status: proposed.
- Powód: jeden projekt webowy z backendem, relacyjna historia i zarządzane konta/pliki.
- Konsekwencja: potrzebna konfiguracja usług, polityki własności i kontrola kosztów. Konkretne wersje ustala T01.

## D005 — AI proponuje, aplikacja zapisuje

- Data: 2026-10-11. Status: proposed.
- Powód: błędne odczytanie liczby lub celu komendy nie powinno cicho zmieniać danych.
- Konsekwencja: szkic importu i jedno zatwierdzenie komendy głosowej; wspólna walidacja i komendy dla głosu oraz formularzy.

## D006 — Krótkie nagrania przed rozmową na żywo

- Data: 2026-10-11. Status: proposed.
- Powód: ograniczona złożoność pierwszej wersji, łatwiejsza korekta i mierzenie kosztów.
- Konsekwencja: transkrypcja + ekstrakcja w T09; Decisions/TypeSafe Jev oraz Live/Realtime jako mierzalny eksperyment T12. Użytkownik zidentyfikował Jev linkami do TypeSafe i Vercel; nie jest to jeszcze wybór dostawcy do wdrożenia.

## D007 — Wersje planów i kopie celów treningu

- Data: 2026-10-11. Status: proposed.
- Powód: późniejsza edycja planu lub 1RM nie powinna zniekształcać historii.
- Konsekwencja: niezmienne opublikowane wersje, zapis wartości maksimum i celu przy rozpoczęciu sesji; osobne serie planowane i wykonane.

## D008 — Lokalny fundament T01

- Data: 2026-10-11. Status: accepted.
- Problem: T01 potrzebuje działającego prototypu bez usług i sekretów.
- Wybór: Next.js 16.4.0 z App Router, React 19.3.0, TypeScript 5.9.3, npm lockfile i Vitest. Dane demonstracyjne są w kodzie; formularz nie wykonuje zapisu. Wybór dotyczy tylko fundamentu T01, nie zatwierdza pozostałych składników D004.
- Uzasadnienie: zgodność z kierunkiem architektury i możliwość uruchomienia oraz sprawdzenia ekranów bez dostępu do usług. Wersję i wymaganie Node.js sprawdzono w [dokumentacji Next.js](https://nextjs.org/docs/app/getting-started/installation); konfigurację testów w [przewodniku Vitest dla Next.js](https://nextjs.org/docs/app/guides/testing/vitest).
- Konsekwencje: T02 może rozpocząć model domeny i migracje; dopiero T03+ dostarczy prywatne dane i autoryzację.

## D009 — Relacyjny rdzeń T02 i zamknięty zapis wykonania

- Data: 2026-10-11. Status: accepted.
- Problem: wersje planów, własność relacji, kopie celów oraz ponawiane zapisy muszą mieć spójny kontrakt przed integracją kont i treningu. Rozwija propozycję D007; nie zatwierdza jeszcze usług z D004.
- Wybór: migracja PostgreSQL w układzie Supabase przechowuje wersje planów, indywidualne serie, rzeczywiste 1RM, wykonanie i kopie celów. Złożone klucze obce zawierają `owner_id`, a każda prywatna tabela ma RLS. Opublikowane wersje i rozpoczęte cele są chronione triggerami. Unikalny identyfikator operacji i numer rewizji stanowią kontrakt przyszłej komendy transakcyjnej. Bezpośredni zapis tabel wykonania przez `authenticated` jest zamknięty do T05.
- Uzasadnienie: baza odrzuca relacje między właścicielami i nie pozwala ominąć wymaganej idempotencji zwykłym zapisem klienta. Schemat da się odtworzyć i testować lokalnie bez sekretów. Przyjęto wzór `auth.uid()` oraz rozdzielenie grantów i polityk zgodnie z [dokumentacją RLS Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), sprawdzoną 2026-10-11; układ migracji zgodnie z [lokalnym workflow Supabase](https://supabase.com/docs/guides/local-development/cli-workflows).
- Konsekwencje: T03 musi sprawdzić polityki na prawdziwym Auth/API i dodać polityki Storage. T05 musi zrealizować transakcję z kontrolą `expected_revision`, skrótu payloadu i potwierdzenia operacji; sama obecność kolumn nie jest gotowym zapisem treningu. Przyjęty domyślny krok zaokrąglenia to 2,5 kg z remisem w dół, możliwy do zmiany w profilu.

## D010 — Auth i prywatny Storage w T03

- Data: 2026-10-11. Status: accepted.
- Problem: testerzy potrzebują prywatnych kont, a lokalny test PostgreSQL z T02 nie dowodzi działania polityk przez Supabase Auth, API i Storage. Rozwija część propozycji D004; nie zatwierdza Vercel, hostowanego projektu ani OpenAI.
- Wybór: Supabase Auth z kontami dodawanymi przez administratora i logowaniem e-mail/hasło; publiczna rejestracja i anonimowe logowanie wyłączone. Sesje Next.js są oparte na cookies i sprawdzane przez `getClaims()`. Prywatny bucket `training-private` wiąże `owner_id` i pierwszy segment ścieżki z `auth.uid()`. Preview i produkcja wymagają osobnych referencji projektu, a konfiguracja odrzuca pomyłkę środowiskową i publiczny klucz administracyjny.
- Uzasadnienie: lokalny stack Auth/API/Storage umożliwił rzeczywiste testy A/B/anon, zaproszenia i wygasłej sesji bez zewnętrznych sekretów. Wzór sesji potwierdzono w [dokumentacji Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework), zaproszeń w [Auth Users](https://supabase.com/docs/guides/auth/users), a polityk w [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control), sprawdzonych 2026-10-11.
- Konsekwencje: T04/T05 muszą używać klienta z sesją użytkownika i RLS; bezpośredni zapis wykonania pozostaje zamknięty. T11 musi odtworzyć ustawienia Auth, szablon zaproszeń i migracje w osobnych hostowanych projektach oraz wykonać smoke test.

## D011 — Atomowa publikacja planu w T04

- Data: 2026-10-11. Status: accepted.
- Problem: ręczny edytor zapisuje wiele rekordów planu, a utrata odpowiedzi lub równoczesna edycja nie mogą tworzyć częściowej albo podwójnej wersji.
- Wybór: funkcja PostgreSQL `save_manual_plan` publikuje pełną wersję w jednej transakcji. Odczytuje właściciela z `auth.uid()`, sprawdza własność planu i ćwiczeń, blokuje plan na czas edycji, porównuje oczekiwaną wersję i zapisuje potwierdzenie operacji. Funkcja `security definer` ma pusty `search_path`, ograniczony grant `execute` i nie przyjmuje `owner_id` z klienta. Opublikowane wersje chronią triggery T02. Zapisy rzeczywistego 1RM są tylko dopisywane; unikalny identyfikator operacji chroni przed duplikatem po ponowieniu.
- Uzasadnienie: wieloetapowy zapis z przeglądarki mógłby pozostawić częściowy plan; lokalny test A/B/anon oraz retry potwierdził transakcję i kontrolę właściciela. Podgląd kg używa tylko rekordu rzeczywistego 1RM obowiązującego w dacie i jawnego kroku, bez estymacji.
- Konsekwencje: T05 nadal musi osobno zrealizować transakcyjne komendy treningowe i kopie celów; T04 nie zapisuje wykonania. Bezpośrednie DML do własnych tabel planu pozostaje możliwe na mocy grantów T02, lecz interfejs zapisuje przez funkcję; ograniczenie to wymaga oceny przed betą.

## D012 — Transakcyjna komenda treningu w T05

- Data: 2026-10-11. Status: accepted.
- Problem: timeout po zapisie, równoczesne karty i późniejsze zmiany planu/1RM nie mogą duplikować ani zmieniać historii treningu.
- Wybór: `apply_workout_command` jest jedyną ścieżką zapisu wykonania dla `authenticated`. Funkcja `security definer` bierze właściciela z `auth.uid()`, blokuje identyfikator operacji i wiersz treningu, sprawdza hash payloadu oraz `expected_revision`, po czym zapisuje zmianę, rewizję i potwierdzenie w jednej transakcji. Start kopiuje opublikowaną bieżącą wersję planu i rzeczywisty 1RM obowiązujący w dacie treningu wraz z surowym i zaokrąglonym celem. Brak maksimum zachowuje `null` kg.
- Uzasadnienie: lokalne testy A/B/anon, retry, konfliktu i późniejszej edycji potwierdzają własność oraz niezmienność kopii. To rozwija D007 i realizuje kontrakt D009 bez AI.
- Konsekwencje: bezpośredni DML tabel wykonania pozostaje zamknięty. T08 może wyliczać postęp z wykonanych serii; T09 może użyć tych samych komend po zatwierdzeniu propozycji głosowej. Hosting i urządzenia pozostają do T11/T10.

## D013 — Serwerowy import z jawnym zatwierdzeniem

- Data: 2026-10-12. Status: accepted.
- Problem: import musi przeżyć ponowienie, timeout i anulowanie bez tworzenia planu z niezweryfikowanego odczytu AI.
- Wybór: osobne `imports` i `import_attempts`, prywatny bucket `training-imports`, trzy numerowane próby z dzierżawą 45 s, 30 s abort adaptera i siedmiodniowa retencja. Odpowiedź modelu jest walidowanym szkicem; plan powstaje wyłącznie po poprawce i wywołaniu atomowego `approve_import_job` przez właściciela. Zatwierdzenie ma hash payloadu i identyfikator operacji. Prawdziwy adapter jest wyłączony bez klucza i budżetu; próba rezerwuje 0,05 USD w globalnym oknie 24 h.
- Uzasadnienie: lokalne testy Auth/API/Storage A/B/anon i HTTP potwierdzają izolację, retry, późne wyniki, błędny plik oraz usuwanie. [Dokumentacja OpenAI wejścia plikowego](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) i [modelu](https://developers.openai.com/api/docs/models/gpt-6-luna) sprawdzona 2026-10-12.
- Konsekwencje: D005 zostało zrealizowane dla importu. Szacunek kosztu i testy mockowe nie dowodzą rzeczywistej ceny ani jakości; T06 pozostaje `blocked` do prób z prawdziwym API. T07 pozostaje poza tą sesją; T11 musi uruchomić cron i limit wydatków dostawcy.

## D014 — Doprecyzowanie ekstrakcji T06 po prawdziwych próbach

- Data: 2026-10-12. Status: accepted.
- Problem: pierwsze prawdziwe próby na syntetycznych źródłach dawały `week_number: 0`, zwijanie serii superserii i dopowiadanie niejednoznacznych ciężarów; słabo czytelne zdjęcie potrafiło dać typ `absolute` bez wartości.
- Wybór: prompt `import-pl-v3` określa techniczny tydzień 1, rozwinięcie `3x8` dla obu ćwiczeń superserii i `null` dla nieczytelnej liczby oraz niejednoznacznego ciężaru hantli. Wejście obrazu ma `detail: high`, PDF `detail: low`. Walidator bezpiecznie zmienia samotny typ `absolute`/`percent_1rm` bez wartości na `unspecified` i zgłasza brak obciążenia. Nie tworzy liczby.
- Uzasadnienie: ostatnia seria 12 prawdziwych prób dała 12/12 walidowanych szkiców i 90/90 ocenianych pól; [raport](reports/2026-10-12-T06-live-v3.json). Wcześniejsze próby wykazały błędy, a dwie próby nieczytelnego zdjęcia po poprawce przeszły. Nie dowodzi to jakości na dowolnych planach.
- Konsekwencje: T06 nadal jest `blocked` przez większe rzeczywiste źródło, które nie mieści się w obecnym czasie/limicie odpowiedzi. Zmiana modelu lub promptu wymaga ponowienia odpowiednich prób.

## D015 — Obsługa dużych planów i XLSX

- Data: 2026-10-12. Status: superseded przez D016. To zapis wcześniejszej propozycji.
- Problem: rzeczywisty sześciostronicowy PDF przekracza limit czterech stron, a próby bezpośrednie i przez tekst nie ukończyły się w obecnych limitach. Dwa arkusze XLSX są poza obecnym kontraktem.
- Propozycja: zbadać podział PDF według dni/sekcji, scalanie z kontrolą kolejności i braków, budżet oraz trwały sposób wykonania, zanim zwiększy się limit stron. Natywny XLSX dodać do T06 tylko po potwierdzeniu zmiany zakresu; nie traktować konwersji wykonanej poza aplikacją jako dowodu obsługi XLSX.
- Konsekwencje: brak zmiany kontraktu i zależności do czasu decyzji. T07 nie jest gotowe do rozpoczęcia. Prywatne źródła nie trafiają do repo.

## D016 — PDF do 6 stron, natywny XLSX i pytania importu

- Data: 2026-10-12. Status: accepted. Zakres PDF/XLSX i pytań w trakcie importu potwierdził użytkownik; ekran pytań należy dopiero do T07.
- Problem: jeden duży PDF i arkusze wielotygodniowe przekraczały 30 s/2500 tokenów; dokumenty zawierają także niejednoznaczne lub niepodane liczby serii. D015 opisywał tę potrzebę jako propozycję.
- Wybór: T06 przyjmuje XLSX i PDF do 6 stron. Serwer odczytuje komórki XLSX z adresami, dzieli arkusz na bloki tygodni, a PDF na części po dwie strony. Limit odpowiedzi wynosi 16 000 tokenów na część, abort adaptera 120 s, `maxDuration` funkcji 150 s, dzierżawa 180 s. Walidator zachowuje brak jako `null` lub pusty szablon, odrzuca zgadywanie %1RM z kolumny intensywności i tworzy kontrakt pytań z wyborem zamkniętym lub ilością. Zatwierdzenie sprawdza odpowiedzi oraz poprawiony dokument. Ekran pytań pozostaje T07.
- Uzasadnienie: prawdziwe próby syntetyczne i prywatne wykazały przepełnienie krótkiego limitu, a późniejsze próby części przeszły w granicach 120 s. [OpenAI File inputs](https://developers.openai.com/api/docs/guides/file-inputs) dopuszcza XLSX, ale specyficzna augmentacja arkuszy nie zachowuje całej ich struktury; ekstrakcja komórek po stronie aplikacji daje kontrolę nad zakresem i kolejnością. [Dokumentacja Vercel](https://vercel.com/docs/functions/configuring-functions/duration) opisuje limit 300 s dla funkcji z Fluid Compute w planie Hobby; środowiska hostowanego nie sprawdzono.
- Konsekwencje: D013 zachowuje zasadę szkicu i atomowego zapisu, lecz jej wcześniejsze 30 s/45 s/dzierżawa 45 s są zastąpione powyższymi wartościami. T07 ma pokazać źródło, pytania i korektę, także dla XLSX. T11 musi sprawdzić limit i koszt na faktycznym hostingu. Prywatne źródła i sekret pozostają poza repo.

## D017 — Prywatna korekta importu oddzielona od szkicu AI

- Data: 2026-10-12. Status: accepted w ramach zleconego T07.
- Problem: odświeżenie po długim odczycie lub podczas poprawiania dużego XLSX nie może gubić zapisanej korekty; źródło musi być dostępne do porównania bez ujawnienia go innemu kontu.
- Wybór: `imports.review_data` trzyma poprawiony, walidowany dokument i odpowiedzi oddzielnie od pierwotnego `draft`. Zapis PATCH wymaga sesji, własności, stanu `needs_review` i niewygasłego zadania. Prywatny GET źródła sprawdza właściciela i wyłącza cache; XLSX pokazuje komórki z adresami. Anulowanie czyści korektę, a publikacja pozostaje wyłącznie w istniejącym atomowym `approve_import_job`.
- Uzasadnienie: lokalny test HTTP A/B/anon potwierdził prywatny odczyt, zapis i przywrócenie korekty; dotychczasowy test zatwierdzenia potwierdził idempotencję. Oryginalny szkic pozostaje punktem odniesienia przy poprawkach.
- Konsekwencje: T07 ma osobną migrację. Niezapisane edycje otwartej karty wymagają potwierdzenia przy zamknięciu; pełne testy na fizycznym telefonie i hostingu nadal należą do T10/T11.

## D018 — Porównywalna objętość i odczyt postępu w T08

- Data: 2026-10-12. Status: accepted w ramach zleconego T08.
- Problem: pominięcia, asysta, masa ciała i ciężar jednego hantla nie mogą zniekształcić sumy kg × powtórzenia; poprawka dawnej serii musi zmienić widok bez modyfikacji planu lub rzeczywistego 1RM.
- Wybór: prywatny odczyt po `auth.getUser()` i `owner_id` agreguje bieżące wyniki `performed_sets`. Licznik wykonania planu uwzględnia tylko serie planowane. Objętość wylicza wyłącznie `completed` z niepustymi powtórzeniami i kg, typem `absolute` lub `percent_1rm`, zewnętrznym sposobem obciążenia i porównywalną podstawą ciężaru. Pomija masę ciała, asystę, serie dodatkowe bez jawnej semantyki oraz ciężar na jeden hantel albo nieokreślony przy hantlach. Wyniki są pokazywane osobno dla identyfikatorów wariantów ćwiczeń. Nie zapisujemy agregatu ani estymowanego 1RM.
- Uzasadnienie: ręcznie policzony zestaw 5 × 100 + 4 × 110 daje 940 kg; poprawka pierwszej serii na 7 × 100 daje 1140 kg. Testy domenowe i lokalne Auth/PostgREST/HTTP potwierdzają te wartości i A/B/anon.
- Konsekwencje: każda korekta jest widoczna przy kolejnym odczycie; duża historia wymaga docelowo optymalizacji zapytań, jeśli profilowanie pokaże problem. Nie wprowadzono migracji ani nowego rekordu 1RM.

## D019 — Głos jako propozycja zakotwiczona w celu i rewizji

- Data: 2026-10-12. Status: accepted w zakresie lokalnego T09; jakość prawdziwego API wymaga osobnej próby.
- Problem: opóźniona transkrypcja, przejście do innego ćwiczenia albo poprawka z niejednoznaczną liczbą nie mogą zapisać wyniku do innego celu. Koszt i retencja nagrań muszą być ograniczone.
- Wybór: maksymalnie 30 s nagrania WebM/MP4, transkrypcja `gpt-transcribe`, edytowalny tekst, potem jedna ustrukturyzowana propozycja `gpt-6-luna`. Wybór serii jest kotwiczony jej ID, treningiem i rewizją; serwer ponownie sprawdza własność. Głos nie zapisuje danych bez osobnego zatwierdzenia. Zatwierdzenie używa funkcji T05; opcjonalne serie dodatkowego ćwiczenia są zapisywane razem z nim w tej samej transakcji. Anulowanie unieważnia wynik w UI. Audio i transkrypcja nie są utrwalane przez aplikację; prywatny licznik rezerwacji kosztu wygasa po 7 dniach przez istniejący cron. Głos wymaga osobnej flagi i budżetu; rezerwacja 0,01 USD na próbę jest przybliżeniem.
- Uzasadnienie: lokalne testy komponentów i Auth/PostgREST/HTTP potwierdzają brak automatycznego zapisu, retry, konflikt rewizji i izolację. Aktualne dokumenty OpenAI potwierdzają [formaty i model transkrypcji](https://developers.openai.com/api/docs/guides/speech-to-text), [schemat odpowiedzi](https://developers.openai.com/api/docs/guides/structured-outputs) oraz [taryfy](https://developers.openai.com/api/docs/pricing).
- Konsekwencje: brak osobnego budżetu blokuje prawdziwe API, ręczne formularze działają dalej. Fizyczne Safari/iPhone i Chrome/Android oraz hosting wymagają odbioru; mocki nie dowodzą trafności rozpoznawania polskiej mowy w hałasie.

## D020 — Niekompletna propozycja głosowa wymaga doprecyzowania

- Data: 2026-10-13. Status: accepted w T09; rozwija D019, nie zmienia ręcznego zapisu ani kontraktu T05.
- Problem: prawdziwy model zwrócił dla dodatkowego ćwiczenia typ `exercise` bez nazwy, co wcześniej kończyło się błędem zamiast pytaniem. Krótki skrót „pięć po sto” bywał uznawany za niejasny, a ocena jakości liczyła różnice wielkości liter i interpunkcji jako błędy danych.
- Wybór: strukturalnie poprawna, lecz niekompletna propozycja wyniku, komentarza lub ćwiczenia jest zamieniana na `clarify` z pustymi polami danych i pytaniem. Ujemne, poza zakresem lub obce typy nadal są odrzucane. Prompt `voice-pl-v2` precyzuje polski skrót wyniku i rozwijanie jawnie podanej liczby serii planu. Raport porównuje treść nazw i komentarzy bez rozróżnienia wielkości liter oraz końcowej interpunkcji, a liczby i jednostki dosłownie.
- Uzasadnienie: cztery prawdziwe serie na syntetycznych przypadkach pokazały przejście od 11/20 do 20/20 tekstów, poprawnego planu i 2/2 transkrypcji w serii końcowej; [raport](reports/2026-10-12-T09-live.json) oraz v1–v3 pokazują także wcześniejsze niezaliczone próby. Pytanie nie zapisuje danych i pozwala użytkownikowi poprawić transkrypcję.
- Konsekwencje: T09 nadal ma `review`, bo wynik syntetyczny nie zastępuje fizycznego telefonu. Każda późniejsza zmiana promptu wymaga ponowienia związanych przypadków. D019 i ręczne formularze pozostają aktualne.

## D021 — Emulator jako lokalny odbiór T09 na obecnym etapie

- Data: 2026-10-13. Status: accepted wyłącznie jako lokalne kryterium odbioru T09 po wyraźnym poleceniu użytkownika „Emulator wystarczy na razie. Oznacz jako gotowe”. Zmiana ogólnego kryterium testów urządzeń nie jest proponowana.
- Problem: fizyczny telefon nie jest dostępny, a T09 pozostawało w `review` mimo prawdziwej ewaluacji syntetycznego audio, przejścia testów bezpieczeństwa i lokalnych regresji.
- Wybór: dla lokalnego statusu T09 `done` wystarcza emulator Android, sprawdzenie WebM/MP4 i anulowania w Chrome oraz istniejące testy aplikacji. Fizyczne telefony, Safari/iPhone, pełny mobilny E2E i środowisko hostowane pozostają jawnie niezweryfikowane; nie przypisujemy im wyniku testu emulatora.
- Uzasadnienie: Chrome emulatora uzyskał uprawnienie mikrofonu, utworzył WebM/Opus 48 449 B i wymuszone MP4 31 685 B, a anulowanie odrzuciło nagranie i zwolniło ścieżkę mikrofonu. Lokalne A/B/anon, retry, rewizje, mockowe scenariusze opóźnienia i zmiany ćwiczenia oraz 67 testów przeszły. [Handoff](handoffs/2026-10-13-T09-odbior-emulator.md) rozdziela dowody przeglądarki od testów aplikacji.
- Konsekwencje: równoległa sesja zastosowała lokalne `done`, ale inne bieżące zlecenie tego samego dnia wymaga fizycznego telefonu i zabrania `done` bez niego. Do rozstrzygnięcia tej sprzeczności ROADMAP utrzymuje T09 w `review`, a T10 nie zostało rozpoczęte. Szerszy odbiór urządzeń powinien sprawdzić fizyczne telefony przed betą. D019 i D020, ręczne formularze oraz komenda T05 pozostają aktualne.

## Dodawanie decyzji

Nowy wpis zawiera trwałe ID, datę, status, problem, wybór, uzasadnienie i konsekwencje. Nie zmieniaj `proposed` na `confirmed` bez wypowiedzi użytkownika. Zmianę istniejącej decyzji opisz nowym wpisem z odnośnikiem, zamiast usuwać historię.

## D022 — Wierny import tabel i kontrakt v2

- Data: 2026-10-13. Status: accepted w zakresie jawnie zleconego T06-R1; zależności T04/T06/T07 gotowe.
- Problem: import gubił zakresy, X i kontekst tabel, a aplikacja zamieniała te braki w zbędne pytania z technicznymi ścieżkami. Wbudowany podgląd PDF utrudniał dostęp do dalszych stron.
- Wybór: rozpoznane układy XLSX czyta deterministyczny parser struktury, pozostałe AI z nagłówkami/kolumnami/uwagami. PDF korzysta z PDF.js i osobnych stron treningowych. Kontrakt v2 reprezentuje zakresy i powtarzane bloki, AMRAP i opcjonalność; v1 pozostaje czytelne. Pytania mają stabilne identyfikatory celów, kontekst i wspólne braki. Słownik PL/EN zachowuje oryginał i nie scala wariantów.
- Uzasadnienie: trzy rzeczywiste źródła po poprawce mają zachowane jawne cele i 1/6/17 pytań o rzeczywiste niejasności; oba XLSX unikają timeoutu i nie zużywają tokenów AI. Niezależny odczyt i audyt pytań są lokalnymi materiałami testowymi. [T06_IMPORT](T06_IMPORT.md) oddziela parser, AI, mocki i koszt.
- Konsekwencje: migracje rozszerzają plan i nowe niezmienne snapshoty; dotychczasowej historii nie przeliczamy. Niepewna konwencja i zakres bloku nadal wymagają korekty. Zgoda użytkownika na trzy prywatne źródła dotyczy lokalnego projektu i testów; nie upoważnia do ich publikacji. Import nadal wymaga dotychczasowej konfiguracji/budżetu, również gdy czytnik konkretnego XLSX nie potrzebuje żądania dostawcy. Hosting i fizyczne urządzenia nie są odebrane.

## D023 — Trzy kroki importu i edycja na żądanie

- Data: 2026-10-13. Status: accepted w jawnie zleconym T07-R1.
- Problem: osobne rekordy serii były od razu przedstawiane jako rozbudowane formularze; odczyt handstandu i całego planu był nieczytelny.
- Wybór użytkownika: trzy kroki przeglądu, źródło na żądanie, przebudowa wyłącznie importu i domyślna edycja całego bloku identycznych serii. Szczegóły indywidualne pozostają dostępne. Niejasności są ankietą modalną/fullscreen z jednym pytaniem i podglądem zmiany.
- Wykonanie: własny komponent przeglądu korzysta z istniejących kontraktów, walidacji, stabilnych ID i zapisu. Stan kroków/potwierdzeń jest opcjonalną częścią `review_data`; klucze są normalizowane dla JSONB. Potwierdzenia opisują przejrzaną tożsamość/strukturę, nie autoryzację; tytuł planu nie unieważnia listy ćwiczeń.
- Konsekwencje: brak migracji domeny/historii i nowych płatnych wywołań AI. Stare szkice i PATCH pozostają kompatybilne. UI wymaga obu potwierdzeń przed publikacją; serwer zachowuje kontrolę danych/właściciela/retry. Nie wyprowadzamy pewnego zalecenia z pustego celu. Ręczny edytor i T09 są poza zakresem. Dostępność dialogu oparto na [W3C APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## D025 — Lokalny odbiór przed wdrożeniem, telefon po Vercel

- Data: 2026-10-14. Status: confirmed — użytkownik: „review na fizycznym telefonie zrobię po deploymencie na vercel. Na razie możemy iść dalej z implementacją”. Rozstrzyga konflikt D021/D020 dotyczący terminu odbioru.
- Wybór: T09 jest zakończone lokalnie na podstawie zapisanych dowodów. T10 obejmuje lokalny odbiór i poprawki, a T11 dostarcza wdrożenie. Fizyczny odbiór użytkownika stanowi T10-R1 po T11; nie blokuje lokalnej implementacji ani przygotowania środowiska.
- Konsekwencje: zachowano ID i zależności T09/T10/T11; wydzielono T10-R1 zależne od T11, aby uniknąć cyklu „telefon wymaga wdrożenia, wdrożenie wymaga telefonu”. Szersza beta wymaga T10-R1. Brak telefonu, Safari i hostingu nadal raportujemy jako niewykonane sprawdzenia. Zgoda nie uruchamia płatnych prób AI ani publikacji prywatnych fixtures; wdrożenie wymaga rzeczywistej konfiguracji usług.

## D026 — Zamknięta ścieżka zapisu planu i obsługa błędnego żądania

- Data: 2026-10-14. Status: accepted w T10, rozwija D011 i zamyka wskazany tam punkt odbioru przed betą.
- Problem: klient z grantami T02 mógł ominąć transakcyjną publikację i modyfikować katalog lub logiczny plan. Część tras nie sprawdzała obiektu JSON przed odczytem pola (`null` powodowało 500); proxy API zwracało stronę logowania po utracie sesji.
- Wybór: odebrać klientowi bezpośredni INSERT/UPDATE/DELETE katalogu i tabel planu. Odczyt zachowuje RLS; istniejące save_manual_plan/approve_import_job pozostają jedyną ścieżką publikacji, a profile/1RM zachowują własne używane kontrakty. Wspólny czytnik JSON kontroluje kształt/kodowanie/liczbę bajtów; prywatne API bez sesji odpowiada JSON 401 zamiast przekierowania strony.
- Konsekwencje: kompatybilna migracja bez zmiany danych/snapshotów i payloadów aplikacji; fixture T03 używa administratora wyłącznie do danych testowych. Nowy T10 sprawdza brak grantów na rzeczywistym API oraz zapis/retry istniejącymi funkcjami. Limity i odbiór opisuje [T10_ACCEPTANCE](T10_ACCEPTANCE.md). Hosting i urządzenia wymagają oddzielnych wyników; nie dodano wywołań AI.

Uzupełnienie D026 po odbiorze: `.gitignore` i `.vercelignore` jawnie wykluczają prywatne źródła oraz pełne wyniki `fixtures/t06/real`, lokalne `.env*` i `.vercel`. To ochrona plików przed przyszłą publikacją, bez usuwania lokalnych danych. Zasady `.vercelignore` sprawdzono 2026-10-14 w [dokumentacji Vercel](https://vercel.com/docs/deployments/vercel-ignore); manifest faktycznego uploadu pozostaje kontrolą T11. Wszystkie sekcje lokalnego odbioru przeszły; szczegóły, w tym niezaliczone przebiegi, podaje T10_ACCEPTANCE.

## D027 — T11: jawny wybór usług i kontrolowana paczka źródeł

- Data: 2026-10-14. Status: accepted dla lokalnego przygotowania w jawnie zleconym T11. Zlecenie potwierdza kierunek wdrożenia Vercel/Supabase z D004, lecz nie wybiera organizacji, projektów, regionów ani płatnego planu.
- Problem: katalog bez Git zawiera prywatne fixtures i `.env`, a wcześniejsze środowiska hostowane nie były ustalone. Przypadkowy upload lub wybór obcego projektu naruszyłby zakres i izolację danych.
- Wybór: przed zdalnymi zmianami potwierdzić docelowe ID i dostęp; wysyłać przygotowaną kopię źródeł z listy dozwolonych i manifestem SHA-256. Migracje mają osobny wykaz, nie są paczką Vercel. Przed uploadem obowiązkowy oficjalny dry-run zalogowanego CLI. Początkowa konfiguracja AI pozostaje wyłączona bez nowego zlecenia i budżetu.
- Dowody: 94 pliki, 20 migracji, czysta instalacja offline/build/typy i testy zabezpieczeń paczki przeszły. Supabase odmówiło listy projektów bez tokenu, Vercel odmówił dry-run bez poświadczeń. [Procedura i źródła dostawców](T11_DEPLOYMENT.md), [handoff](handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md).
- Konsekwencje: T11 blocked do wskazania celów i uzyskania dostępu. Dodatkowe warunki odbioru: SMTP, transport audio, cleanup preview/backlogu, koszty i odtworzenie. Rozwiązanie transportu audio i wartości RPO/RTO pozostają propozycjami do ustalenia, bez cichej zmiany kontraktu produktu. Nie wdrożono usług ani nowego schedulera, nie przyznano nowego budżetu, nie zakończono T11 ani T10-R1. D025/D026 nadal obowiązują.

## D028 — Automatyczne zmienne Supabase zamiast ręcznych kopii

- Data: 2026-10-16. Status: accepted w jawnie zleconym T11-E1. Użytkownik zlecił odczyt automatycznych zmiennych i porządek w Vercel.
- Problem: Custom Prefix STORAGE tworzy inne nazwy niż pierwotna konfiguracja aplikacji, co wymuszało niepotrzebne kopiowanie sekretów i doprowadziło do mylenia pól.
- Wybór: cała rodzina STORAGE ma pierwszeństwo przed ręczną. Publiczne URL/publishable (fallback anon) muszą być kompletne. Serwer pobiera secret (fallback service_role) tej samej rodziny; nie miesza z ręcznym kluczem. Standardowe nazwy zostają dla local i instalacji bez integracji. Usuwane w Vercel mogą być wyłącznie trzy ręczne duplikaty, bez rotacji kluczy Supabase; reszta integracji zostaje.
- Uzasadnienie: oficjalne [Marketplace](https://supabase.com/docs/guides/integrations/vercel-marketplace) i [API keys](https://supabase.com/docs/guides/getting-started/api-keys) sprawdzone 2026-10-16, rzeczywista lista nazw STORAGE potwierdzona w Chrome. Zachowano kontrolę środowisk i odmowę publicznego sekretu. Nowy klucz secret ma rolę service_role; owner checks aplikacji pozostają obowiązkowe.
- Konsekwencje: osiem ręcznych ustawień aplikacji, bez klucza OpenAI i nowych kosztów; brak zmian schematu, danych i RLS. Stan kodu/testów/publikacji oraz cleanup Vercel dokumentuje handoff T11-E1. Zmiana nie zamyka pełnego T11 ani T10-R1.

## D029 — Jedno środowisko Production do bieżących testów właściciela

- Data: 2026-10-16. Status: confirmed — użytkownik: „Nie chcę mieć preview i prod. Chcę mieć tylko prod i na nim będę sobie testowal na razie”.
- Wybór: obecny etap T11 używa tylko istniejącego Vercel Production i Supabase `kwmyosnerwvtwxtszzka`. Nie tworzymy drugiego projektu, schedulera preview ani środowiska recovery w chmurze. Brak preview przestaje być blokerem tego etapu. Zastępuje wcześniejszy wymóg dwóch projektów na obecny etap, bez zmiany historii decyzji.
- Konsekwencje: testy zapisują dane na tej samej bazie co właściciel; używać osobnych kont syntetycznych i sprzątać wyłącznie własne zasoby. Nie kierować Vercel Preview do produkcyjnego Supabase i nie wyłączać walidacji środowisk. Dla przyszłego preview nadal potrzebna będzie osobna baza.
- Dostęp na teraz może korzystać z ręcznie utworzonych kont, bez wysyłki wiadomości; SMTP i dostarczenie zaproszeń pozostają do odbioru przed zapraszaniem kolegów. Nie wykonano ich testu. Płatne AI pozostaje wyłączone, telefon/Safari i szersza beta nadal czekają na T10-R1. Próba odtworzenia może używać izolowanej lokalnej bazy syntetycznej; nie oznacza odtworzenia hostowanego projektu ani zatwierdzenia RPO/RTO.

## D030 — Konflikty aplikacji PT409 zamiast serializacji 40001

- Data: 2026-10-16. Status: accepted w poprawce T11-C1 wykrytej podczas zleconego odbioru; zapis nowej migracji produkcji i wdrożenie zatwierdzone potem przez użytkownika: „Tak, zastosuj i wdróż poprawkę” (wcześniejsze objęło20 migracji).
- Problem: ręczne funkcje używały SQLSTATE 40001 dla starej rewizji i sprzecznego payloadu. Hostowane HTTP zwróciło po oczekiwaniu 400 zamiast 409, a bezpośredni RPC przekroczył 30 s. To zgodne z opisanym przez dostawcę zapętlaniem błędów serializacji PostgREST 14; nie ustalono numeru wersji hostowanego PostgREST. Po próbach nie pozostał aktywny backend authenticator.
- Wybór: nowa kompatybilna migracja zastępuje dokładnie 1+4 biznesowe RAISE przez PT409 w dwóch funkcjach, z kontrolą oczekiwanej liczby wystąpień. Zachowuje definicję funkcji, sygnatury, SECURITY DEFINER, search_path i granty; nie zmienia danych/historycznych hashy ani wcześniejszych migracji. API rozpoznaje PT409 jako 409; obsługa rzeczywistych 40001/23505 pozostaje.
- Dowody: [oficjalna diagnoza i rekomendacja PT409](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b), sprawdzona 2026-10-16; lokalna migracja, T04/T05 z asercjami PT409, 171 testów, build/typy przeszły. Zestaw wydania ma teraz 21 migracji i nowy manifest C1, bez zmiany historycznego E1. Po zatwierdzeniu migracja21 i kod ddaceb3 wdrożone; rzeczywisty RPC PT409 i HTTP 409/retry oraz końcowy smoke potwierdzone.


## D031 — Najpierw testy prototypu i import AI

- Data: 2026-10-16. Status: confirmed — użytkownik uznał dalszy odbiór za nadmierny dla prototypu i poprosił o możliwość testów oraz AI. Następnie zatwierdził5USD łącznie na start i prywatnie dodał OPENAI_API_KEY.
- Wybór: udostępnić istniejący działający Production do własnych testów, dokończyć włączenie importu i jedną małą rzeczywistą próbę. Odłożyć dalsze prace backup/restore/monitoring, bez uzależniania testów od pełnego odbioru operacyjnego. Zachować D029, RLS, serwerowe sekrety i zatwierdzanie propozycji AI. SMTP nie blokuje ręcznych kont; głos czeka na rozwiązanie transportu.
- Granice:5USD jest budżetem początkowej fazy, nie nowym budżetem dziennym/miesięcznym. Istniejąca rezerwacja aplikacji liczy0,05USD/próbę w24h, więc ustawienie5 nie gwarantuje łącznego rachunku5. Użytkownik otrzymał instrukcję osobnego limitu projektu OpenAI z Enforce a hard limit; nie potwierdzono jego ustawienia. Nie zmieniać limitu wspólnej organizacji, nie uruchamiać kolejnych serii płatnych testów ani kupować usług. Aktualne [limity dostawcy](https://developers.openai.com/api/docs/guides/spend-limits) sprawdzono; nawet ich egzekwowanie może mieć opóźnienie.
- Wynik: Auth minimum12 i URL-e zapisane po osobnej zgodzie; cron200 na pustej kolejce potwierdzony. Pełny T11 pozostaje in_progress, fizyczny odbiór i szersza beta wT10-R1. Nie deklarować wykonanego backupu/restore. Formalnego zakresu pełnej bety nie zmieniono.


## D032 — Krótkie nagrania głosowe w testach prototypu

- Data: 2026-10-16. Status: confirmed dla testów — użytkownik: „Glos chcialbym też testować. Mogę już?”.
- Wybór: włączyć istniejący głos do własnych prób krótkich nagrań w ramach tych samych5USD łącznie; nie blokować wszystkich takich prób problemem maksymalnego pliku. Podział istniejących szacunków aplikacji: import4/głos1USD w24h; nie jest to nowy odnawialny budżet ani twardy limit rachunku. Klucz pozostaje serwerowy, propozycja wymaga zatwierdzenia, brak zmian kodu/migracji i trwałego zapisu audio.
- Granice: istniejący limit produktu30s/5MiB nie został zmieniony. Vercel4,5MB nadal odrzuci duży multipart przed aplikacją; na początek kilka sekund, bez deklarowania odbioru maksymalnej wielkości. Q06 pozostaje do naprawy przed pełną betą. Odbiór prawdziwego mikrofonu/telefonu nadal po stronie użytkownika/T10-R1. Wymagane sprawdzenie hostowanych transkrypcji i interpretacji, nie sama flaga.

Uzupełnienie D031/D032 po sprawdzeniu: rzeczywisty import i krótki głos działają, aktualne Production Ready. T11 review — użytkownik testuje prototyp; pełny odbiór operatorski odłożony, brak automatycznych dalszych prac. Wyniki i błędy samego runnera zapisane w raporcie/handoffie.

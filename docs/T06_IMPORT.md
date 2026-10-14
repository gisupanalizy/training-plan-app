# T06 / T06-R1 — import planu, stan na 2026-10-13

Import przyjmuje PDF, XLSX, PNG/JPEG i tekst. Model i czytnik tabel tworzą propozycję; walidacja, pytania, kontrola właściciela i publikacja należą do aplikacji. Ręczny edytor działa bez AI. Najnowszy odbiór: [handoff T06-R1](handoffs/2026-10-13-T06-R1-import-tabel.md).

## Kontrakt i limity

- `POST /api/imports`: prywatne zadanie i podpisany upload. `GET /api/imports` oraz `GET /api/imports/[id]`: wyłącznie dane właściciela.
- `POST /api/imports/[id]/upload`: kontrola obiektu, MIME, wielkości i zawartości. PDF: 1–6 stron, do 1 MB. XLSX: do 1 MB, 10 arkuszy, 1000 wierszy i 50 kolumn na arkusz, 5000 niepustych komórek; formuły odrzucane. PNG/JPEG: do 2 MB i kontrola sygnatury. Tekst: UTF-8 do 30 KB.
- `POST /api/imports/[id]/process`: najwyżej 3 trwałe próby, abort 120 s, funkcja 150 s, dzierżawa 180 s. Retry odczytuje gotowy szkic; spóźniony wynik nie nadpisuje nowszego. Limit: 10 zadań na konto na dobę i 2 aktywne zadania.
- `POST /api/imports/[id]/cancel`: anulowanie. `POST /api/imports/[id]/approve`: walidowany dokument i odpowiedzi, identyfikator operacji; atomowa publikacja przez `save_manual_plan`, kontrola `auth.uid()` i retry bez duplikatu.
- `GET /api/imports/[id]/source`: właściciel, `no-store`; PDF/obraz binarnie, XLSX domyślnie tekst komórek. `?view=grid` zwraca arkusze, wiersze, adresy, typy, scalenia, przekreślenia i komentarze do tabeli.
- `PATCH /api/imports/[id]`: prywatna walidowana korekta i odpowiedzi, osobno od pierwotnego szkicu. Odświeżenie przywraca korektę.
- `GET /api/imports/cleanup`: `CRON_SECRET`, retencja 7 dni lub anulowanie. Hosting/cron nie został odebrany.

Bucket `training-imports` jest prywatny. Instrukcje w źródle są treścią dokumentu. `store:false` w Responses nie obiecuje zerowej retencji u dostawcy.

## Czytniki i kontrakt v2

Rozpoznane układy XLSX czyta `xlsx-table-v1`: tabela z nagłówkiem ćwiczenia/serie × powtórzenia albo tygodniowe bloki FBW/Tabata/interwał w równoległych parach kolumn. Rozpoznanie opiera się na strukturze, nie nazwie pliku. Całe nagłówki, scalone pola, wspólne uwagi i przekreślenia są dostępne przed interpretacją. Wyniki poprzednich treningów trafiają do uwag, nie celów ani 1RM. Nierozpoznane układy przechodzą do AI jako bloki z kontekstem i adresami; do 4 żądań równolegle. Nie jest to uniwersalny parser każdego arkusza.

PDF.js odczytuje współrzędne kolumn i oryginalne numery stron. Rozpoznane strony treningowe są wysyłane osobno wraz z kontekstem pozostałych stron; skan bez rozpoznanej struktury pozostaje podziałem po 2 strony. Wejścia PDF i zdjęć mają `detail:high`. Model pozostaje `gpt-6-luna`, adapter/prompt `import-pl-v12`, Responses/Structured Outputs, limit 16 000 tokenów na część. Jawny prefiks A/B w tekście jednej sesji i rozpoznany tytuł strony są zachowywane przez aplikację.

`schema_version:2` dodaje:

- `set_count_min/max`, `set_count_source`, `prescription_group`, `is_optional` ćwiczenia;
- `repeat_min/max` szablonu dla zaleceń złożonych, np. 2×6 + 1–2×3;
- `duration_seconds_max`, `rest_seconds_max`, `target_kg_max`;
- oryginał nazwy, odwołania do źródła i stabilne identyfikatory korekty po walidacji.

Jednakowy szablon rozwija się do maksymalnej liczby serii. 7–8 daje 7 wymaganych i ósmą opcjonalną; złożone bloki zachowują osobne cele i opcjonalność. Całe opcjonalne ćwiczenie ma wszystkie serie opcjonalne. `X` w powtórzeniach proponuje AMRAP; pusta komórka/kreska wymagają kontekstu, nie automatycznego maksimum. Przekreślony wiersz jest zachowany w uwagach i pomijany z aktywnych ćwiczeń. Superserie `ss1/ss2/ss5` są lokalne dla treningu, także po 3 ćwiczenia; kolejność i przerwa po grupie pozostają. Intensywność nie staje się %1RM.

Walidator obsługuje także `schema_version:1`. Nowe pola są opcjonalne dla starszych dokumentów. Migracje T06-R1 dodają kolumny bez przepisywania historii; nowe treningi kopiują zakresy, opcjonalność i oryginalne nazwy do niezmiennych snapshotów.

## Pytania i podgląd

Pytanie pokazuje dzień → ćwiczenie → serie, powód, cytat/adres i „Pokaż w źródle”. Adresy `sessions.0…` pozostają technicznym kontraktem, nie opisem UI. Powtarzające się braki tego samego celu i wspólnego bloku są grupowane. Odpowiedź może być zakresem, maksimum powtórzeń albo zamkniętym wyborem. Ręczna korekta rozwiązująca brak usuwa pytanie. Zmiana kolejności nie zmienia celu odpowiedzi; zmiana odpowiednich pól unieważnia starą odpowiedź. Nowy brak celu blokuje publikację także po pierwotnym imporcie bez pytań. Niejasności semantyczne wymagają przeglądu źródła i potwierdzenia korekty, a nie domyślnego protokołu Tabata/EMOM.

Własny podgląd [PDF.js](https://mozilla.github.io/pdf.js/examples/) daje wszystkie strony, wybór, powiększenie, pełny ekran i skok do strony odwołania. Nie wykonuje automatycznego wycięcia ani podświetlenia prostokąta PDF; cytat wskazuje wiersz. XLSX daje wybór wszystkich arkuszy, pełną przewijaną tabelę z fizycznymi kolumnami i skok do komórki. Mobilne źródło ma powrót do szkicu.

## Słownik nazw

Wewnętrzna projekcja [Free Exercise DB](https://github.com/yuhonas/free-exercise-db): 876 nazw EN i sprzęt, licencja Unlicense, data i SHA w `src/lib/exercises/en-reference.json`; bez obrazów. Osobny ręcznie zweryfikowany słownik PL/EN i aliasów obejmuje ćwiczenia z przekazanych źródeł. Nie wszystkie 876 nazw ma tłumaczenie. Domyślne dopasowanie jest dokładne po normalizacji pisowni; chwyt, asysta, sprzęt i wariant są zachowane. Niepewne warianty pozostają propozycją do świadomego zastosowania. UI pokazuje nazwę PL i oryginał. [Model danych](DATA_MODEL.md) opisuje zapis.

## Porównanie rzeczywistych źródeł

Za jawną zgodą użytkownika trzy prywatne pliki, niezależny odczyt `expected.json` i pełne wyniki są lokalnie w `fixtures/t06/real`. Nie publikować ich. Próby korzystały z prawdziwego lokalnego Auth/Storage i `processImportJob`, bez publikowania prywatnych planów.

Baseline `before.json`: PDF 3 treningi/30 ćwiczeń/10 pytań, 69,465 s — wszystkie 10 zbędne (7–8 serii, X, 20–30 s). FBW 3 treningi/19 ćwiczeń/3 pytania, 71,302 s — 2 zbędne o plank i 1 poprawne o datę Excela. Madzia timeout 120 s; brak szkicu, więc brak oceny pytań w tej próbie.

Końcowe `after-4.json`:

- PDF: 3 treningi, 30 ćwiczeń, 1 uzasadnione pytanie o znaczenie `60 /120` w przerwie; 48,562 s. Wszystkie 30 pozycji porównane z niezależnym odczytem: serie/cele/grupy zachowane, X jako AMRAP, dip 6/6/3/3 z ostatnią opcjonalną, plank 20–30 s. Nazwy mogą mieć alternatywę/pauzę w osobnym wariancie; oryginalny zapis pozostaje także w odwołaniu.
- FBW: 3 treningi, 19 ćwiczeń, 6 uzasadnionych pytań; lokalny czytnik 92 ms, 0 tokenów AI. Pytania: data w `Trening C!B8`, 3 nieokreślone podstawy ciężaru hantli, 2 wybory sprzętu. Jawne powtórzenia i czas nie wywołują pytań.
- Madzia: 12 jednostek z 4 tygodni, 17 pytań, czytnik lokalny 111 ms, 0 tokenów AI. 8 pytań o zakres wspólnej wskazówki, 6 o protokół Tabata, 1 o rozkład interwału, 1 o serie EMOM i 1 o przypisanie dodatkowego EMOM do dnia. Cztery wartości progresji to cztery serie; opcjonalny marsz/bieg zachowuje 2–3 rundy. Nie zgadujemy protokołu ani przypisania.

Prywatny `results/question-audit.json` ocenia każde końcowe pytanie. Wcześniejsze niezaliczone iteracje pozostają zapisane: timeouty, błąd walidacji ostrzeżenia, błędne rozpoznanie bloków i nadmierne pytania. Test przeglądarkowy korzysta z zapisanej prawdziwej odpowiedzi API/czytnika na nowych własnych kontach; sprawdza wszystkie strony/arkusze oraz korektę, nie wywołuje AI ponownie.

## Prawdziwe AI, koszt i ograniczenia

[Pełna seria v11](reports/2026-10-13-T06-R1-synthetic-v11.json): 12/12 szkiców, 88/90 pól (97,78%), 0 opuszczeń/dopowiedzeń; 2 różnice nazw dni A/B. p50/p95 7,508/13,411 s, 26 639/8094 tokenów, szacunek 0,006709 USD. Po poprawie zachowania prefiksów [celowane v12](reports/2026-10-13-T06-R1-synthetic-v12-targeted.json): 2/2, 17/17 pól, 0 różnic; 0,001105 USD. Nie wykonano ponownie całej serii v12 i nie przedstawiamy połączonych runów jako jednej idealnej próby.

16 prób rzeczywistych plików w tej sesji: 0,050202 USD według dostępnych metryk, w tym końcowe PDF 0,009439 USD, XLSX 0 USD. Cztery próby nie mają pełnych tokenów (timeout lub błąd przed zapisaniem metryk), więc łączny koszt rachunku jest nieznany. Znane metryki plików i obu serii syntetycznych sumują się do 0,058016 USD; to nie rachunek dostawcy. Nie odczytano ponownie panelu billing.

Limit zgody T06: 5 USD. Przed płatnymi próbami sprawdzono pozostałe lokalne rezerwacje; zachowano istniejące próby. Globalna rezerwacja 0,05 USD/próbę w 24 h jest konserwatywnym licznikiem, obejmuje również rozpoznany XLSX i nie jest twardym limitem rachunku. Włączenie: serwerowy klucz, `OPENAI_IMPORT_ENABLED=true` oraz dodatni `OPENAI_IMPORT_BUDGET_USD`, także dla lokalnego czytnika w obecnym przepływie importu. Taryfa Luna sprawdzona 2026-10-13: 0,10/0,50 USD za mln tokenów wejścia/wyjścia. [File inputs](https://developers.openai.com/api/docs/guides/file-inputs), [model/taryfa](https://developers.openai.com/api/docs/models/gpt-6-luna).

Sprawdzenia i dokładne ograniczenia: [TESTING](TESTING.md) i handoff. Nie wykonano hostingu, obciążenia ani fizycznych telefonów. Poprawny odczyt tych trzech źródeł nie gwarantuje dowolnego PDF/skanu/XLSX.

## T07-R1 — stan przeglądu i interfejs korekty

Przegląd importu ma trzy kroki i kompaktowe karty, ankietę z jednym pytaniem i źródło na żądanie. Pełny formularz `PlanEditor` nie jest już ekranem importu; w ramach T07-R1 ręczne tworzenie/edycja planu pozostały dotychczasowe. Późniejsze T04-R1 uprościło osobno ręczny edytor, bez zmiany tego kontraktu importu. Parametry są grupowane wyłącznie do prezentacji i edycji, bez zmiany kontraktu AI ani osobnych rekordów serii.

`review_data` może dodatkowo zawierać `progress = { step: exercises|structure|summary, exercisesConfirmed: string|null, structureConfirmed: string|null }`. Potwierdzenia są sygnałem zgodności z przejrzanymi polami, nie uprawnieniem ani podpisem bezpieczeństwa. Fingerprint ma uporządkowane klucze, dzięki czemu kolejność JSONB nie resetuje przeglądu. Zmiana tożsamości/listy/kolejności unieważnia oba potwierdzenia, a parametrów/grup/uwag — strukturę. Tytuł planu jest metadanym publikacji i nie unieważnia przeglądu ćwiczeń.

PATCH waliduje etap i potwierdzenia, odrzuca niepoprawny kształt oraz usuwa potwierdzenia niezgodne z dokumentem. Starszy PATCH bez `progress` zachowuje wcześniej zapisany krok, ale ponownie ocenia zgodność danych. Stary szkic bez etapu rozpoczyna krok pierwszy, z zachowaniem korekty i odpowiedzi. Nie wymaga to migracji bazy. UI blokuje publikację bez obu potwierdzeń i wymaganych odpowiedzi; `/approve` nadal waliduje pola/odpowiedzi/właściciela i retry, z kompatybilnością dotychczasowych klientów.

Pytania zakotwiczone w ćwiczeniu szukają jego stabilnego ID także po przeniesieniu do innego dnia. Lokalna korekta i ankieta nie wywołują AI ponownie. Odbiór T07-R1 używa zachowanych wyników `after-4`, nie nowej ewaluacji modelu. Szczegóły: [UX](UX.md), [handoff T07-R1](handoffs/2026-10-13-T07-R1-przeglad-importu.md).

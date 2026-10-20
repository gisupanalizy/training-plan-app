# T16-I — ponowny niezależny odbiór Tempo, 2026-10-20

Bramka **przyjęta lokalnie**. Recenzent nie zmieniał `src/`. Poprawki T16-B–H i widoczności zapisu mają innych autorów.

Handoff tego odbioru: [2026-10-20-T16-I](../handoffs/2026-10-20-T16-I-ponowny-odbior.md).

## Wersja i środowisko

- Gałąź `codex/tempo`, HEAD `cc594cf`. Widoczność zapisu jest w `9e25139`. Drzewo robocze ma niezacommitowane podpięcie PNG i dokumenty; build odbioru objął ten stan. Ta sesja nie commitowała.
- Node 26.4.0, Next 16.4.0, Supabase CLI 2.120.0, lokalny Auth/PostgREST na `127.0.0.1:54321`.
- Playwright spoza zależności aplikacji, Chrome headless, viewport CDP. To nie jest telefon i nie jest Safari.
- AI wyłączone w procesie `next start`: pusty klucz, import i głos off, budżety 0, `RUN_T06_LIVE=false`, `RUN_T09_LIVE=false`, `DO_NOT_TRACK=1`. Sekret crona istniał tylko w tym procesie i w runnerze HTTP, bez zapisu do `.env` i bez wypisania wartości.
- Serwer: `http://localhost:3018` po `npm run build`. Adres `localhost`, nie `127.0.0.1`. Nie użyto `next dev` na 3000: wcześniejszy odbiór widział tam portal deweloperski, a wejście przez `127.0.0.1` nie hydratowało klienta.
- Log: `/private/tmp/t16i-rerun-suite.log`. Zrzut zapisu po „Zostań”: `/private/tmp/t15b-result.png`.
- Katalogu Make nie odczytywano ponownie. Macierz opiera się na lokalnym katalogu i briefie z T16-A. Brak plików `docs/proposals/T16-CONTRACT-*.md`.

## Wynik

Pełny lokalny PASS. Przy 390×844, po uzupełnieniu celów i wyborze „Zostań”, asercja `scripts/test-t15b-browser.mjs` przechodzi: dół `Zapisz i przejdź dalej` jest nad górą `.mobile-nav`. Zrzut pokazuje bursztynowy zapis w całości nad pięcioma trasami. Próg asercji nie był zmieniany.

D046 zostaje regułą kart. Przy 390 czwarta karta podglądu ma dół 1015,75 przy nawigacji 768. Czwarta karta treningu w T13-C ma dół 1195,96875 przy nawigacji 768. Obie są doskrolowalne.

Brak luki kontraktu. Procent z klatki Postępu nie wchodzi do produktu: odczyt nie zwraca delty, a `no-change` jest tekstem „brak podstawy porównania”.

## Macierz 85 stanów

Każdy stan ma parę klatek mobile 390 i desktop. Jeden wiersz na stan. „Chrome” to ten przebieg na `localhost:3018`. „Komponent” to Vitest tej sesji (`npm test`, 274 passed / 9 skipped). Żaden wiersz nie wstawia liczby z klatki w miejsce braku z odczytu.

| Stan | Gdzie jest w aplikacji | Dowód tej sesji |
|---|---|---|
| `system/library` | Button, Field, Stepper, ListRow, Card, StatusBadge, SegmentedControl, Notice, EmptyState, nawigacja | Chrome T15-A: 21 stanów, tokeny, pięć tras, 44 px, fokus, reduced motion, sidebar |
| `system/dialog-open` | `Dialog`; wąski ekran pełny, desktop modalny | Komponent UI; Chrome importu, edytora, T15-B i T13-C otwierają dialogi |
| `/` `active-plan` | Jedno `Rozpocznij [jednostka]` | Chrome T15-B |
| `/` `resume-session` | `Wznów trening` | Chrome T13-C |
| `/` `no-plan` | `EmptyState` „Nie masz jeszcze planu” | Kod `src/app/page.tsx`; Chrome tej sesji miał plany |
| `/` `many-plans` | Przełącznik planów i karuzela | Chrome T15-B: klawiatura, dotyk, przeciągnięcie |
| `/` `archived-version` | Informacja, że archiwum nie startuje | Komponent karuzeli; podgląd w `plan-preview.tsx` |
| `/` `read-error` | „To nie jest puste konto” | Kod `page.tsx` i `plany/page.tsx`; bez wymuszonego błędu sieci |
| `/` `demo-data` | Gałąź bez skonfigurowanego Supabase | Kod strony i `AppShell`; ten serwer miał Auth |
| `/` `active-conflict-one` | Powrót primary, zakończenie secondary, usunięcie danger | Komponent startu i Chrome T13-C |
| `/` `active-conflict-many` | `Zakończ ten trening` i `Usuń ten trening` | Komponent startu i Chrome T13-C |
| `/` `active-conflict-delete` | Drugi dialog usunięcia | Chrome T13-C |
| `/plany` `selected-plan` | Karuzela i `Otwórz plan` | Chrome T15-A i T15-B |
| `/plany` `empty-library` | „Pusta biblioteka” | Kod `plany/page.tsx`; Chrome miał plany |
| `/plany/[id]` `current-version` | Start bieżącej wersji, serie, źródło, null i 0 | Chrome T15-B |
| `/plany/[id]` `archived-version` | „Tylko do odczytu”, bez startu | Komponent podglądu i karuzeli |
| edytor `exercise-list` | Jeden trening, karty | Chrome edytora |
| edytor `edit-exercise` | Cała karta ćwiczenia | Chrome edytora i test komponentu |
| edytor `edit-series-block` | Blok serii | Chrome edytora i test komponentu |
| edytor `edit-single-series` | Jedna seria rozdziela blok | Test komponentu edytora |
| edytor `edit-workout-order` | Kolejność treningu, anulowanie | Test komponentu edytora |
| edytor `delete-confirmation` | Dialog usunięcia | Test komponentu edytora |
| edytor `validation-error` | Pusta liczba serii blokuje apply | Test komponentu edytora |
| import `empty-history` | „Nie masz jeszcze importów” | Test komponentu importu |
| import `filled-history` | Lista ze statusem serwera | Test komponentu: failed i committed |
| import `uploading` | Faza `upload_pending` | Kod `import-workspace.tsx`; Chrome nie zatrzymywał wysyłki |
| import `processing` | „Odczytywanie”, bez obietnicy planu | HTTP T15-C: `process` zwraca 503 |
| import `error-retry` | „Odczytaj / ponów próbę” | Test komponentu |
| import `cancelling` | Faza anulowania | Kod fazy; Chrome nie klikał anulowania w locie |
| import `committed` | „Zatwierdzony” i link do planu | Test komponentu; Chrome korekty kończy zatwierdzeniem |
| korekta `names` | „Nazwy ćwiczeń i kolejność” | Chrome importu |
| korekta `series-supersets` | Krok serii, blokada braku celu | Chrome importu |
| korekta `summary` | Podsumowanie po dwóch krokach | Chrome importu |
| korekta `blocking-question` | Nierozwiązany brak blokuje publikację | Chrome importu |
| korekta `question-dialog` | Jedno pytanie | Test komponentu ankiety; HTTP T15-C ma pytanie |
| korekta `source-pdf` | Desktop obok planu, 390 pełny dialog | Chrome importu, syntetyczny PDF |
| korekta `source-xlsx` | Dwa arkusze, przekreślenie | Chrome importu, syntetyczny XLSX |
| korekta `edit-name` | Anulowanie nazwy zostawia poprzednią | Chrome importu |
| korekta `edit-block` | „Edytuj blok serii” | Chrome importu |
| korekta `edit-single` | Edycja pojedynczej serii w korekcie | Test komponentu recenzji |
| przegląd `in-progress` | Kontynuacja jako główna akcja | Chrome T13-C |
| przegląd `finished-readonly` | Brak kontynuacji i usuwania | Test edytora treningu |
| seria `previous-result` | Poprzedni wynik albo brak | Chrome T13-C |
| seria `no-previous` | „Brak wcześniejszego wyniku” | Zrzut `/private/tmp/t15b-result.png` |
| seria `load-missing` | „Brak wartości w planie” | Test edytora treningu |
| seria `load-not-applicable` | „Nie dotyczy” | Test edytora treningu |
| seria `load-zero` | `0 kg` jako wartość | Test edytora treningu i Chrome T13-C |
| seria `rpe-rir-comment` | Zwinięte RPE, RIR i komentarz | Chrome T13-C zapisuje komentarz szkicu |
| seria `time-distance` | Osobne pola czasu i dystansu | Chrome T13-C |
| seria `saving` | Faza komendy, bez przejścia przed ACK | Chrome T13-C |
| seria `network-error` | Ponowienie samego GET | Chrome T13-C |
| seria `conflict` | 409, szkic zostaje | Chrome T13-C |
| seria `unsaved-dialog` | Zostań, Odrzuć, Zapisz | Chrome T15-B: „Zostań”, potem widoczny zapis |
| seria `optional-choice` | Dialog dalszego kroku | Chrome T13-C |
| głos `recording` | Stan nagrywania w `voice-input.tsx` | Test komponentu, mock rejestratora |
| głos `stopped` | Zatrzymanie bez wysłania części | Test komponentu |
| głos `permission-denied` | Zostaje ręczny formularz | Test komponentu; Chrome T13-C symuluje awarię AI |
| głos `proposal` | Propozycja do zatwierdzenia, mock transportu | Chrome T13-C |
| głos `manual-correction` | Poprawka bez utraty kotwicy | Test `workout-voice` |
| `summary-time` | Zakończenie z licznikami | Chrome T13-C |
| `dst-choice` | Korekta czasu bez zmiany snapshotów | Chrome T13-C i T15-D |
| `delete-session` | Drugie potwierdzenie usunięcia | Chrome T13-C |
| historia `selected-day` | Dzień z sesjami, pon.–niedz. | Chrome T15-D |
| historia `empty-day` | Brak zakończonych, bez udawania błędu | Chrome T15-D |
| historia `unknown-time` | „godzina nieznana” | Chrome T15-D |
| postęp `populated` | Ostatni wynik nad wykresem | Chrome T15-E |
| postęp `empty` | „Brak zapisanych wyników”, bez `0` i `0%` | Test pulpitu i Chrome T15-E |
| postęp `single-point` | Brak linii trendu | Chrome T15-E i test pulpitu |
| postęp `gap` | Przerwa nie schodzi do zera | Test pulpitu na prawdziwej analityce |
| postęp `selected-point` | Tylko punkt otwiera szczegół | Chrome T15-E |
| postęp `no-change` | „Brak podstawy porównania”, bez procentu | Test pulpitu i Chrome T15-E |
| postęp `estimated-vs-real` | Szacunek i link do Profilu, bez zmierzonego 1RM | Chrome T15-E |
| profil `account-history` | Lista datowanych 1RM | Chrome T15-F |
| profil `empty-history` | „Brak zapisanych maksimów” | Kod profilu; Chrome T15-F zapisał rekord |
| profil `demo-account` | Wyłączony formularz bez zapisu | Kod profilu przy braku konfiguracji |
| profil `help` | „Co to jest?” | Chrome T15-F |
| logowanie `empty` | Formularz z autofill | Chrome T15-F |
| logowanie `field-error` | Jeden generyczny alert | Chrome T15-F |
| logowanie `expired` | „Sesja wygasła” | Chrome T15-F |
| logowanie `signed-out` | „Wylogowano” | Chrome T15-F |
| logowanie `demo-environment` | „Tryb demonstracyjny” | Kod `/logowanie` bez konfiguracji |
| hasło `empty` | Jedno pole `new-password` | Chrome T15-F |
| hasło `too-short` | Minimum 12, wartość zostaje | Chrome T15-F |
| hasło `save-error` | Wartość zostaje po błędzie akcji | Test komponentu konta |
| hasło `submitting` | Drugie wysłanie zablokowane | Test komponentu konta |

Dyktowanie w edytorze używa tych samych pięciu stanów głosu. Chrome edytora otwiera dialog „Dyktuj fragment planu”. To nie jest osobna szóstka stanów.

## Co przeszło

Log: `/private/tmp/t16i-rerun-suite.log`. Serwer `http://localhost:3018`.

- `npm test`: 274 passed, 9 skipped. 6,15 s. Testy komponentów i domeny, nie API.
- `npm run build`: exit 0. TypeScript w buildzie 1,2 s, 20 stron.
- `npm run typecheck` po buildzie: exit 0.
- Chrome T15-A: PASS, 21 stanów, 360/390/430 i desktop.
- Chrome T15-B razem z wbudowanym T13-C: PASS. Zapis nad nawigacją, D046 kart, szkice, retry, ACK i GET, 409, null/0, głos jako mock transportu, finish, delete.
- Chrome importu i edytora: PASS. PDF i XLSX syntetyczne. Szkic po stronie adaptera jest mockiem; zapis planu jest lokalny.
- Chrome T15-D: PASS, daty, DST, północ, rok przestępny, A/B/anon.
- Chrome T15-E: PASS, 15 stanów, mysz, pinch, swipe 170→0.
- API T15-E: PASS, 505 sesji, A/B/anon. Prawdziwe lokalne API.
- API T13-A: PASS, RPC i HTTP.
- API T05: PASS.
- API T09: PASS. HTTP interpretacji ma asercję 503 bez budżetu głosu. PostgREST lokalny. Bez płatnego audio.
- HTTP T15-C: PASS, A/B/anon, retry zatwierdzenia. `process` ma asercję 503. Szkic w teście jest mockiem zapisanym do lokalnej bazy, nie odpowiedzią modelu.

## Mock i prawdziwe API

Prawdziwe lokalne Auth, API, RPC i PostgREST: T15-A/B/D/E/F, import i edytor Chrome, T13-A, T05, T09 PostgREST, T15-C HTTP poza szkicem modelu. Mock: transport głosu w T13-C, rejestrator w teście komponentu, szkic importu w HTTP T15-C. Wyłączenie AI jest sprawdzone statusem 503, nie wywołaniem modelu.

## Niewykonane

- Fizyczny telefon i Safari.
- Ponowny odczyt Make przez Figma MCP.
- Stany demo, pustej biblioteki, błędu odczytu oraz faz uploadu i anulowania w locie na tym Chrome. Mają gałąź w kodzie albo test komponentu.
- Systemowy menedżer haseł, hosting, zdalna migracja, push i publikacja.
- Płatne AI.

## Archiwum pierwszej bramki

Poniższy zapis zostaje świadectwem odrzucenia sprzed poprawki widoczności. Nie jest wynikiem tego ponownego odbioru.

# T16-I — pierwsza bramka, nieprzyjęta

Bramka **nieprzyjęta**. Jeden defekt układu wraca do właściciela T16-D. Recenzent nie zmieniał `src/`.

Handoff: [2026-10-19-T16-I](../handoffs/2026-10-19-T16-I-niezalezny-odbior.md).

## Wersja i środowisko

- Gałąź `codex/tempo`, HEAD `70d66e6`. Kod T16-B–H jest w drzewie roboczym, bez commita tej sesji.
- Node 26.4.0, Next 16.4.0, Supabase CLI 2.120.0, lokalny Auth/PostgREST na `127.0.0.1:54321`.
- Playwright: moduł runtime spoza zależności aplikacji, Chrome headless, viewport CDP. To nie jest telefon i nie jest Safari.
- AI wyłączone na serwerze odbioru: pusty `OPENAI_API_KEY`, import i głos off, `RUN_T06_LIVE=false`, `RUN_T09_LIVE=false`, `DO_NOT_TRACK=1`. Bez płatnego wywołania. Sekret crona istniał tylko w procesie lokalnego `next start`, pod nazwą wartości roboczej, bez wypisania jej tutaj jako sekretu do produkcji.
- Produkcyjny Next tej sesji: `http://localhost:3017`, po `npm run build`. Adres `localhost`, nie `127.0.0.1`, bo wcześniejszy odbiór C widział brak hydracji na `127.0.0.1`.
- Pierwsza próba `test-t15a-browser.mjs` na działającym `next dev` (`localhost:3000`) nie jest dowodem produktu. Portal `nextjs-dev-overlay` zasłaniał klik w dolną nawigację. Powtórka na `next start` przeszła.
- Logi poza repo: `/private/tmp/t16i-suite.log`, `/private/tmp/t16i-t13c.log`, `/private/tmp/t16i-t15a.log`, zrzut wady `/private/tmp/t15b-failure.png`.
- Katalogu Make nie odczytywano ponownie przez Figma MCP. Macierz opiera się na lokalnej kopii z T16-A. Brak plików `docs/proposals/T16-CONTRACT-*.md`.

## Wynik

Pełnego PASS nie ma. Przy 390×844, po uzupełnieniu celów serii i wyborze „Zostań” w dialogu niezapisanych zmian, dół przycisku `Zapisz i przejdź dalej` nie jest nad górną krawędzią `.mobile-nav`. Asercja: `scripts/test-t15b-browser.mjs`, porównanie prostokątów. Zrzut pokazuje formularz od nagłówka serii do `Dyktuj serię 1`; główny zapis jest poza tym kadrem, pod nawigacją.

D046 tego nie zamyka. D046 dotyczy karty listy, którą da się doskrolować. Ta asercja wymaga, żeby główna akcja zapisu serii była w całości nad paskiem. T13-C nadal klika ten przycisk, bo wcześniej woła `scrollIntoViewIfNeeded`. To nie jest ten sam dowód.

Właściciel poprawki: T16-D, pliki ekranu serii (`workout-editor` i jego moduł stylów). Runner należy do C, ale układ serii zmienił D po zielonym przebiegu C. Recenzent nie ruszał `src/` ani progu testu.

Pozostałe runnery tej sesji przeszły. Czwarta karta treningu przy 390 ma dół 1195,97 przy nawigacji 768 i w T13-C jest doskrolowalna.

## Macierz 85 stanów

Każdy stan ma parę klatek mobile 390 i desktop. Poniżej jest jeden wiersz na stan. „Chrome” znaczy przebieg tej sesji na `localhost:3017`. „Komponent” znaczy test Vitest z tej samej sesji (`npm test`, 271 passed / 9 skipped). Żaden wiersz nie podstawia liczby z klatki w miejsce braku z odczytu.

| Stan | Gdzie jest w aplikacji | Dowód tej sesji |
|---|---|---|
| `system/library` | Button, Field, Stepper, ListRow, Card, StatusBadge, SegmentedControl, Notice, EmptyState, nawigacja | Chrome T15-A: tokeny, pięć tras, 44 px, fokus, reduced motion, sidebar |
| `system/dialog-open` | `Dialog`; na wąskim ekranie pełny, na desktopie modalny | Komponent UI; Chrome importu, edytora, T13-C i przerwany T15-B otwierają dialogi |
| `/` `active-plan` | Jedno `Rozpocznij [jednostka]` | Chrome T15-B doszedł do tej asercji przed wada zapisu |
| `/` `resume-session` | `Wznów trening` | Chrome T13-C |
| `/` `no-plan` | `EmptyState` „Nie masz jeszcze planu” | Kod `src/app/page.tsx`; tej sesji Chrome nie otwierał pustego konta |
| `/` `many-plans` | Przełącznik planów i karuzela | Chrome T15-B: klawiatura, dotyk, przeciągnięcie |
| `/` `archived-version` | Informacja, że archiwum nie startuje | Komponent karuzeli; podgląd w `plan-preview.tsx` |
| `/` `read-error` | Osobny komunikat „To nie jest puste konto” | Kod `page.tsx` i `plany/page.tsx`; bez wymuszonego błędu sieci w Chrome |
| `/` `demo-data` | Gałąź bez skonfigurowanego Supabase | Kod strony i `AppShell`; ten serwer miał Auth, więc Chrome demo nie renderował |
| `/` `active-conflict-one` | Powrót primary, zakończenie secondary, usunięcie danger | Komponent startu i Chrome T13-C |
| `/` `active-conflict-many` | Osobne `Zakończ ten trening` i `Usuń ten trening` | Komponent startu i Chrome T13-C |
| `/` `active-conflict-delete` | Drugi dialog usunięcia | Chrome T13-C |
| `/plany` `selected-plan` | Karuzela i `Otwórz plan` | Chrome T15-A i T15-B |
| `/plany` `empty-library` | „Pusta biblioteka” | Kod `plany/page.tsx`; Chrome tej sesji miał plany |
| `/plany/[id]` `current-version` | Start tylko bieżącej wersji, serie, źródło, null i 0 | Chrome T15-B, zanim padł zapis serii |
| `/plany/[id]` `archived-version` | „Tylko do odczytu”, bez startu | Komponent podglądu i karuzeli |
| edytor `exercise-list` | Jeden trening, karty | Chrome edytora |
| edytor `edit-exercise` | Cała karta ćwiczenia | Chrome edytora i test komponentu |
| edytor `edit-series-block` | Blok serii | Chrome edytora i test komponentu |
| edytor `edit-single-series` | Jedna seria rozdziela blok | Test komponentu edytora |
| edytor `edit-workout-order` | Kolejność treningu, anulowanie | Test komponentu edytora |
| edytor `delete-confirmation` | Dialog usunięcia | Test komponentu edytora |
| edytor `validation-error` | Pusta liczba serii blokuje apply | Test komponentu edytora |
| import `empty-history` | „Nie masz jeszcze importów” | Test komponentu importu |
| import `filled-history` | Lista ze statusem serwera | Test komponentu: failed i committed |
| import `uploading` | Faza `upload_pending` | Kod `import-workspace.tsx`; Chrome nie zatrzymywał się w trakcie wysyłki |
| import `processing` | „Odczytywanie”, bez obietnicy planu | Kod fazy; HTTP T15-C dostaje 503 zamiast modelu |
| import `error-retry` | „Odczytaj / ponów próbę” | Test komponentu |
| import `cancelling` | Faza anulowania | Kod fazy; Chrome nie klikał anulowania w locie |
| import `committed` | „Zatwierdzony” i link do planu | Test komponentu; Chrome korekty kończy zatwierdzeniem |
| korekta `names` | „Nazwy ćwiczeń i kolejność” | Chrome importu |
| korekta `series-supersets` | Krok serii, blokada braku celu | Chrome importu |
| korekta `summary` | Podsumowanie, zatwierdzenie po dwóch krokach | Chrome importu |
| korekta `blocking-question` | Nierozwiązany brak blokuje publikację | Chrome importu: przycisk zatwierdzenia disabled |
| korekta `question-dialog` | Jedno pytanie | Test komponentu ankiety; ten przebieg Chrome nie otwierał pytania z cytatem |
| korekta `source-pdf` | Desktop obok planu, 390 pełny dialog | Chrome importu, syntetyczny PDF |
| korekta `source-xlsx` | Dwa arkusze, przekreślenie | Chrome importu, syntetyczny XLSX |
| korekta `edit-name` | Anulowanie nazwy zostawia poprzednią | Chrome importu |
| korekta `edit-block` | „Edytuj blok serii” | Chrome importu |
| korekta `edit-single` | Edycja pojedynczej serii w korekcie | Test komponentu recenzji; Chrome tej sesji szedł blokiem |
| przegląd `in-progress` | Kontynuacja jako główna akcja | Chrome T13-C |
| przegląd `finished-readonly` | Brak kontynuacji i usuwania | Test edytora treningu |
| seria `previous-result` | Poprzedni wynik albo brak | Chrome T13-C i zrzut wady |
| seria `no-previous` | „Brak wcześniejszego wyniku” | Zrzut `/private/tmp/t15b-failure.png` |
| seria `load-missing` | „Brak wartości w planie” | Test edytora treningu |
| seria `load-not-applicable` | „Nie dotyczy” | Test edytora treningu |
| seria `load-zero` | `0 kg` jako wartość | Test edytora treningu i Chrome T13-C |
| seria `rpe-rir-comment` | Zwinięte RPE, RIR i komentarz | Kod formularza serii; Chrome T13-C zapisuje komentarz szkicu |
| seria `time-distance` | Osobne pola czasu i dystansu | Chrome T13-C, pole „Czas (s)” |
| seria `saving` | Faza komendy, bez przejścia przed ACK | Chrome T13-C |
| seria `network-error` | Ponowienie samego GET | Chrome T13-C |
| seria `conflict` | 409, szkic zostaje | Chrome T13-C |
| seria `unsaved-dialog` | Zostań, Odrzuć, Zapisz | Chrome T15-B otworzył dialog i wybrał „Zostań”; dalej padł układ zapisu |
| seria `optional-choice` | Dialog dalszego kroku | Chrome T13-C |
| głos `recording` | Stan nagrywania w `voice-input.tsx` | Test komponentu, mock rejestratora |
| głos `stopped` | Zatrzymanie bez wysłania części | Test komponentu |
| głos `permission-denied` | Zostaje ręczny formularz | Test komponentu; Chrome T13-C symuluje awarię AI, nie systemowe uprawnienie |
| głos `proposal` | Propozycja do zatwierdzenia, mock transportu | Chrome T13-C |
| głos `manual-correction` | Poprawka bez utraty kotwicy | Test `workout-voice` |
| `summary-time` | Zakończenie z licznikami | Chrome T13-C |
| `dst-choice` | Korekta czasu bez zmiany snapshotów | Chrome T13-C i T15-D |
| `delete-session` | Drugie potwierdzenie usunięcia | Chrome T13-C |
| historia `selected-day` | Dzień z sesjami, pon.–niedz. | Chrome T15-D |
| historia `empty-day` | Brak zakończonych, bez udawania błędu | Chrome T15-D |
| historia `unknown-time` | „godzina nieznana” | Chrome T15-D |
| postęp `populated` | Ostatni wynik nad wykresem | Chrome T15-E |
| postęp `empty` | „Brak zapisanych wyników”, bez `0` i `0%` | Test pulpitu i Chrome T15-E |
| postęp `single-point` | Brak linii trendu | Chrome T15-E i test pulpitu |
| postęp `gap` | Przerwa nie schodzi do zera | Test pulpitu na prawdziwej analityce |
| postęp `selected-point` | Tylko punkt otwiera szczegół | Chrome T15-E |
| postęp `no-change` | „Brak podstawy porównania”, bez procentu | Test pulpitu i Chrome T15-E; odczyt nie zwraca delty, więc procentu z klatki nie ma |
| postęp `estimated-vs-real` | Szacunek i link do Profilu, bez zmierzonego 1RM | Chrome T15-E |
| profil `account-history` | Lista datowanych 1RM | Chrome T15-F, 100 kg |
| profil `empty-history` | „Brak zapisanych maksimów” | Kod profilu dla konta bez rekordów; Chrome T15-F zapisał rekord |
| profil `demo-account` | Wyłączony formularz bez zapisu | Kod profilu przy braku konfiguracji; ten przebieg był prywatny |
| profil `help` | „Co to jest?” | Chrome T15-F |
| logowanie `empty` | Formularz z autofill | Chrome T15-F |
| logowanie `field-error` | Jeden generyczny alert | Chrome T15-F |
| logowanie `expired` | „Sesja wygasła” | Chrome T15-F |
| logowanie `signed-out` | „Wylogowano” | Chrome T15-F |
| logowanie `demo-environment` | „Tryb demonstracyjny” | Kod `/logowanie` bez konfiguracji; Chrome tego nie otwierał |
| hasło `empty` | Jedno pole `new-password` | Chrome T15-F |
| hasło `too-short` | Minimum 12, wartość zostaje | Chrome T15-F |
| hasło `save-error` | Wartość zostaje po błędzie akcji | Test komponentu konta |
| hasło `submitting` | Drugie wysłanie zablokowane | Test komponentu konta |

Dyktowanie w edytorze używa tych samych pięciu stanów głosu przez `voice-input.tsx`. Chrome edytora otwiera dialog „Dyktuj fragment planu” i zamyka go Esc. To nie jest osobna szóstka stanów.

## Co przeszło

Log: `/private/tmp/t16i-suite.log` i `/private/tmp/t16i-t13c.log`. Serwer `http://localhost:3017`, o ile nie napisano inaczej.

- `npm test`: 271 passed, 9 skipped. 6,10 s. Testy komponentów i domeny, nie API.
- `npm run build`: exit 0. TypeScript w buildzie 1,0 s, 20 stron.
- `npm run typecheck` po buildzie: exit 0.
- Chrome T15-A: PASS, 21 stanów, 360/390/430 i desktop, Tempo, skip-link, fokus, reduced motion.
- Chrome T15-F: PASS, login, błąd, fokus, 1RM, krok, jedno pole hasła, wylogowanie, ponowne logowanie.
- Chrome importu i edytora: PASS. PDF i XLSX syntetyczne, mock szkicu po stronie adaptera, zapis lokalny.
- Chrome T15-D: PASS, daty, DST, północ, rok przestępny, A/B/anon.
- Chrome T15-E: PASS, 15 stanów, mysz, pinch, swipe 170→0.
- API T15-E: PASS, 505 sesji, A/B/anon. Prawdziwe lokalne API.
- API T13-A: PASS, RPC i HTTP.
- API T05: PASS.
- API T09: PASS, HTTP 503 bez budżetu głosu i PostgREST. Bez płatnego audio.
- HTTP T15-C: PASS, A/B/anon, retry zatwierdzenia, `process` 503.
- Chrome T13-C, uruchomiony osobno, bo T15-B przerwał się przed jego importem: PASS. Szkice, retry, ACK i GET, 409, null/0, głos jako mock transportu, finish, delete, konflikt.

T15-B zaliczył szerokości, karuzelę, podgląd, doskrolowanie czwartej karty podglądu, gesty i dialog „Zostań”. Padł na następnym warunku, więc exit to 1 i wbudowany T13-C się nie uruchomił.

## Niewykonane

- Fizyczny telefon i Safari.
- Ponowny odczyt Make przez Figma MCP.
- Stany demo, pustej biblioteki, błędu odczytu oraz faz uploadu i anulowania w locie na tym Chrome. Mają gałąź w kodzie albo test komponentu, nie osobny przebieg przeglądarki tej sesji.
- Systemowy menedżer haseł, hosting, zdalna migracja, push i publikacja.
- Płatne AI.

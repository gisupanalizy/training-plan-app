# Handoff — T06 — prawdziwe próby i niezawodny szkic importu

- Data i autor: 2026-10-12, Codex.
- Zadanie / status po sesji: T06 / done w zakresie serwerowego importu i kontraktu pytań. T07 nie rozpoczęto.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git (`git status` zwraca błąd); brak commita i PR.
- Powiązany wcześniejszy handoff: [T06 z mockiem](2026-10-12-T06-import-mock.md).

## Cel i wykonana praca

Po uzgodnieniu 5 USD i skonfigurowaniu klucza poza repo sprawdzono aktualną dokumentację OpenAI, przeprowadzono prawdziwe próby syntetyczne i sprawdzono trzy przekazane prywatne pliki. Użytkownik potwierdził rozszerzenie T06 o natywny XLSX i PDF do 6 stron. Dodał wymóg dopytywania podczas importu i ograniczył tę sesję do kontraktu pytań; ekran należy do T07.

Adapter przyjmuje PDF/XLSX/PNG/JPEG/tekst. PDF dzieli na części po dwie strony; ExcelJS odczytuje komórki z adresami i dzieli arkusz na bloki tygodni. Limit odpowiedzi podniesiono z 2500 do 16 000 tokenów, abort z 30 do 120 s, czas funkcji do 150 s, dzierżawę do 180 s. Walidator zachowuje czas i przerwy, usuwa puste sesje harmonogramu z ostrzeżeniem, nie przypisuje procentu intensywności do %1RM i pozostawia brakujące wartości do wyjaśnienia. Pytania mają wybór zamknięty, liczbę lub jednostkę z liczbą; zatwierdzenie sprawdza odpowiedzi i poprawiony dokument. AI nie zapisuje aktywnego planu.

## Zmienione pliki

- [Adapter](../../src/lib/imports/openai.ts), [walidacja](../../src/lib/imports/domain.ts), [ekstrakcja XLSX](../../src/lib/imports/xlsx.ts), [pytania](../../src/lib/imports/questions.ts), [serwer](../../src/lib/imports/server.ts) — podział, scalanie, limity i kontrakt szkicu.
- [Migracja](../../supabase/migrations/20261012110000_t06_xlsx_long_import.sql) — XLSX w zadaniu i Storage oraz 180 s dzierżawy. [Route tworzenia](../../src/app/api/imports/route.ts), [przetwarzania](../../src/app/api/imports/[id]/process/route.ts), [zatwierdzenia](../../src/app/api/imports/[id]/approve/route.ts) i [odczytu](../../src/app/api/imports/[id]/route.ts) — API pytań i źródeł.
- [package.json](../../package.json), [lockfile](../../package-lock.json) — ExcelJS i poprawka zależności uuid. [Testy domeny](../../src/lib/imports/domain.test.ts), [adaptera](../../src/lib/imports/openai.test.ts), [pytań](../../src/lib/imports/questions.test.ts), [integracji](../../src/lib/imports/imports.integration.test.ts), [HTTP](../../scripts/test-t06-http.mjs), [ewaluacji](../../src/lib/imports/live-evaluation.test.ts).
- [Raport bez prywatnych źródeł](../reports/2026-10-12-T06-live-v8.json), [kontrakt](../T06_IMPORT.md), [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [PRODUCT](../PRODUCT.md), [UX](../UX.md), [ARCHITECTURE](../ARCHITECTURE.md), [AI_AND_VOICE](../AI_AND_VOICE.md), [TESTING](../TESTING.md), [DECISIONS](../DECISIONS.md), [CHANGELOG](../CHANGELOG.md), [README](../../README.md).

## Weryfikacja

- Prawdziwe OpenAI, `RUN_T06_LIVE=true npm run evaluate:t06`, prompt v8, 12 syntetycznych plików: **12/12** walidowanych szkiców, **90/90** ocenianych pól, **0 opuszczeń, 0 dopowiedzeń i 0 innych rozbieżności**. p50 **6,223 s**, p95 **32,102 s**; **13 674** tokeny wejścia, **8 430** wyjścia, szacunek taryfowy **0,005582 USD** za końcową serię. Wersja v7 miała 90% pól przez utratę oznaczeń dni; poprawiono prompt i powtórzono pełne 12. Wcześniejsze 30 s/2500 tokenów nie wystarczały dużemu PDF.
- Panel OpenAI Usage po odświeżeniu 2026-10-12 11:39 UTC: **0,20 USD** łącznego wydatku organizacji w ostatnich 7 dniach, **181 żądań**. Odczyt obejmuje wcześniejsze próby, może być opóźniony i nie jest kosztem samej serii v8. Kwota pozostaje poniżej uzgodnionych 5 USD.
- Prywatny PDF: poprawna walidacja 6 stron; realny adapter i walidator dały **3 treningi, 30 ćwiczeń, 78 serii** (2 puste szablony), **19 kwestii, 12 pytań** w **63,276 s**, 9199/17221 tokenów wejścia/wyjścia. Procent intensywności pozostał w uwagach. Szacunek taryfowy tej ostatniej próby: 0,009530 USD.
- Prywatny `Trening FBW.xlsx`: **3 treningi, 19 ćwiczeń, 46 serii, 22 kwestie, 6 pytań** w **47,168 s**, 3550/13489 tokenów; szacunek 0,007100 USD. Jedna liczba serii w źródle jest niejednoznaczna.
- Prywatny `TRENINGI_MADZIA.xlsx`: **4 tygodnie, 13 bloków, 105 ćwiczeń, 150 serii** (55 pustych szablonów), **115 kwestii, 55 pytań** w **73,152 s**, 8215/32409 tokenów; szacunek 0,017026 USD. W poprzedniej próbie tej samej wersji uzyskano 100 ćwiczeń, 163 serie i 61 pytań. Model nie odtwarza tego arkusza stabilnie; potrzebny jest dokładny przegląd i wiele odpowiedzi. Żaden prywatny wynik nie został zatwierdzony jako plan.
- `npm run typecheck`: sukces. `npm test`: 49 aktywnych testów przeszło, 6 pominiętych. `npm run build`: sukces. `DO_NOT_TRACK=1 npm run test:t06:local`: 3/3 na lokalnym Auth/PostgREST/Storage A/B/anon. `DO_NOT_TRACK=1 npm run test:t06:http`: sukces z produkcyjnym buildem, uploadem XLSX, błędnym plikiem, pytaniami, zatwierdzeniem i cronem. Testy lokalne/HTTP używają **mocka AI**; nie mierzą jakości modelu. `npm audit --audit-level=moderate`: 0 podatności. Migrację zastosowano lokalnie przez `npx supabase migration up --local`.
- Trzy prywatne pliki przeszły `validateSource`; rzeczywiste wywołania wykonano bez utrwalania treści lub pełnych odpowiedzi w repo. Nie wykonano na tych plikach pełnej ścieżki przeglądarkowego UI ani trwałego importu do konta. Nie testowano docelowego hostingu i urządzeń.

## Decyzje i zmiany planu

[D016](../DECISIONS.md) zapisuje potwierdzone przez użytkownika PDF/XLSX i kontrakt pytań oraz zastępuje propozycję D015 i wcześniejsze limity czasowe D013. T06 oznaczono `done` dla serwerowego szkicu. T07 nadal `todo` i obejmuje ekran pytań, korektę oraz pliki XLSX. T08 pozostaje niezależnym `todo` po T05. Zmiany zakresu i powód zapisano w [CHANGELOG](../CHANGELOG.md). Nie uruchomiono innych agentów.

## Pozostała praca i ograniczenia

Szkice dużych źródeł wymagają przeglądu; 12 syntetycznych przypadków nie dowodzi skuteczności na dowolnym planie. W szczególności wielotygodniowy XLSX daje zmienne liczby ćwiczeń przy ponowieniu. Kontrakt pytań działa na serwerze, ale nie ma jeszcze ekranu (T07). Nie ma testu na hostowanym Vercel/Supabase, rzeczywistych telefonach ani rachunku przypisanego dokładnie do tych trzech plików (T10/T11). Czas 150 s mieści się w [limicie Vercel Fluid Compute Hobby](https://vercel.com/docs/functions/configuring-functions/duration), lecz nie gwarantuje czasu pod obciążeniem. Globalna rezerwacja budżetu w aplikacji jest przybliżeniem, nie blokadą rachunku dostawcy.

## Następny krok

Bezpośredni następny etap importu to **T07**. Pierwszy krok: przeczytać pliki wskazane w promptcie, przejąć T07 w ROADMAP i zbudować ekran na gotowym kontrakcie T06. T08 może być osobnym zadaniem równoległym, jeśli użytkownik je zleci i zostaną uzgodnieni właściciele plików oraz integrator; nie uruchomiono żadnego agenta.

## Stan środowiska

Klucz jest w ignorowanym przez `.gitignore` lokalnym `.env`; potrzebne nazwy zmiennych to OPENAI_API_KEY, OPENAI_IMPORT_ENABLED i OPENAI_IMPORT_BUDGET_USD. Nie zapisano wartości sekretu ani prywatnych planów w repo. Tymczasowy skrypt prób i pełne odpowiedzi prywatnych plików usunięto. Lokalny Supabase/Docker był użyty do testów; testowy serwer Next zakończył pracę. Nie ma Git, commita, PR ani wdrożenia.

## Prompt dla kolejnego agenta

Rekomendacja: gpt-6-sol, rozumowanie high — złożona integracja UI, danych i uprawnień przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj wyłącznie T07 — aparat, pliki i korekta importu; nie przechodź do T08 ani T09 i nie uruchamiaj automatycznie innych agentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-12-T06-proby-realne-pliki.md, docs/T06_IMPORT.md, docs/PRODUCT.md, docs/UX.md, docs/AI_AND_VOICE.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md, docs/TESTING.md i docs/WORKFLOW.md. T06 jest ukończone lokalnie, więc zależność T07 jest spełniona; T07 pozostaje todo. Ustaw właściciela i status in_progress w ROADMAP. Zbuduj polski mobilny ekran wyboru PDF do 6 stron, XLSX, PNG/JPEG/aparatu i wklejenia tekstu, postęp i przywracanie importu, źródło obok walidowanego szkicu, pytania z kontraktu T06 (zamknięty wybór, liczba, jednostka z liczbą), korektę struktury i parametrów oraz świadome zatwierdzenie. Uwzględnij duże XLSX z wieloma pytaniami. Nie zgaduj braków, nie zapisuj planu automatycznie, zachowuj wersje i prywatność. Sprawdź podpisany upload, błędny i niewspierany plik, odmowę aparatu, odświeżenie, retry i anulowanie, poprawki, powtórzone zatwierdzenie, izolację A/B/anon, typy oraz build. Sprawdź na rzeczywistych urządzeniach, jeśli są dostępne; w przeciwnym razie jawnie zapisz ten brak. Oddziel wyniki mocków od prawdziwych prób AI. Nie zapisuj sekretów ani prywatnych źródeł w repo. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według wyniku i utwórz handoff z identycznym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — złożona integracja UI, danych i uprawnień przy niższym koszcie niż model frontier.
```

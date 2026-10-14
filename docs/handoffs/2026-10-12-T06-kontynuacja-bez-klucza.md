# Handoff — T06 — kontynuacja bez dostępu do klucza

- Data i autor: 2026-10-12, Codex.
- Zadanie / status po sesji: T06 `blocked`; T07 nie rozpoczęto.
- Branch / commit / stan zmian: katalog nie ma `.git`, więc brak brancha i commita; zmiany pozostają lokalnie.
- Powiązany wcześniejszy handoff: [T06 — lokalny import z mockiem](2026-10-12-T06-import-mock.md).

## Cel i wykonana praca

Kontynuowano wyłącznie T06. Użytkownik uzgodnił budżet prawdziwych prób do 5 USD. W procesie zadania `OPENAI_API_KEY` jest nieobecny; wpis `apka-t06-openai` w macOS Keychain dla bieżącego użytkownika także nie istnieje (`security find-generic-password`: kod 44). Przekazano instrukcję zapisania klucza w Pęku kluczy poza repo. Żadne prawdziwe wywołanie OpenAI nie zostało wykonane. Nie ma raportu jakości modelu, opóźnień modelu, tokenów ani kosztu na koncie.

Rozszerzono harness o porównanie jawnych pól każdego fixture'u, dodatkowe sprawdzenie rampy, liczby dni, zakresu powtórzeń i superserii oraz liczenie opuszczeń, dopowiedzeń i pozostałych niezgodności. W raporcie przewidziano `accountCostUsd: null` do czasu sprawdzenia kosztu w panelu dostawcy. Poprawiono komendę regeneracji syntetycznych źródeł. Fixture'y nie zawierają prywatnych planów.

## Zmienione pliki

- [Harness ewaluacji](../../src/lib/imports/live-evaluation.test.ts) i [manifest 12 przypadków](../../fixtures/t06/cases.json): dokładniejsze porównanie pól i klasyfikacja różnic; nie zmieniono źródeł plikowych ani adaptera produkcyjnego.
- [Kontrakt T06](../T06_IMPORT.md): opis raportu i poprawna komenda generatora.
- [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [CHANGELOG](../CHANGELOG.md): status, budżet, faktyczne wyniki i blokada. [DECISIONS](../DECISIONS.md) bez zmiany: D013 pozostaje aktualna; brak nowej decyzji architektonicznej.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, npm 11.17.0, lokalny Supabase Auth/PostgREST/Storage. Aktualną oficjalną dokumentację OpenAI sprawdzono 2026-10-12: [File inputs](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [taryfa](https://developers.openai.com/api/docs/pricing) i [Images and vision](https://developers.openai.com/api/docs/guides/images-vision). `input_file` PDF z `detail: low`, ścisły schemat i standardowa taryfa 0,10/0,50 USD za milion tokenów wejścia/wyjścia są nadal opisane. [Aktualne limity Vercel Functions](https://vercel.com/docs/functions/configuring-functions/duration) dopuszczają 45 s przy domyślnym fluid compute, lecz docelowe wdrożenie i jego ustawienia nie istnieją; realnego limitu hostingu nie sprawdzono.

- `npm run test:t06:local` z lokalnym Supabase/Dockerem: 1 plik, 2/2 testy przeszły. Obejmuje A/B/anon, retry, równoległe próby, własność i sprzątanie; odpowiedź AI to mock.
- `npm run test:t06:http`: sukces. Skrypt wykonał produkcyjny `next build` i HTTP E2E uploadu, błędnego PDF, bramki AI, zatwierdzenia, retry i sprzątania; odpowiedź AI to mock.
- `npm test`: 8 plików i 38 aktywnych testów przeszło; 3 pliki i 5 testów pominięto bez ich środowiska.
- `npm run typecheck`: sukces po zmianie harnessu.
- `npm run evaluate:t06` bez `RUN_T06_LIVE=true`: 1 test pominięty, zero wywołań.
- Sprawdzenie `OPENAI_API_KEY` i Pęku kluczy: brak w tej sesji. Prawdziwe próby: **0/12**. Koszt wywołań tej sesji: **0 USD**; koszt na koncie OpenAI nie był odczytywany.

Skany PDF i zdjęcia pochodzą z generatora syntetycznego; nie uruchomiono OCR/modelu. Timeout 30 s i `max_output_tokens: 2500` pozostają konfiguracją kodu, bez pomiaru prawdziwych odpowiedzi. Nie wykonano testu hostowanego środowiska ani urządzenia. Obrazy mają kontrolę sygnatury, lecz nie pełne dekodowanie.

## Decyzje i zmiany planu

T06 podjęto jako `in_progress`, po kontrolach pozostawiono `blocked`, ponieważ klucz nie jest dostępny temu procesowi. Budżet do 5 USD jest uzgodniony; nie oznacza to twardego limitu rachunku. ID i zależności bez zmian. D013 bez zmiany. Powód i wpływ zapisano w CHANGELOG.

## Pozostała praca i blokery

Po zapisaniu klucza poza repo i potwierdzeniu dostępu bez pokazywania wartości uruchomić 12 prób przez `evaluate:t06`. Ocenić pola, opuszczenia, dopowiedzenia, skany, p50/p95, tokeny, limit 2500, timeout 30 s i koszt faktyczny w panelu OpenAI; raport harnessu liczy tylko szacunek tekstowy. Jeśli potrzeba, poprawić wyłącznie T06 i powtórzyć odpowiednie przypadki. Dopiero po wynikach rozstrzygnąć, czy synchroniczny endpoint 45 s jest wystarczający. Przy braku dostępu do panelu koszt na koncie pozostawić jawnie nieweryfikowany. Nie uruchamiać T07.

## Następny krok

Kontynuować T06 od bezpiecznego udostępnienia klucza w Pęku kluczy lub procesie zadania, a następnie sprawdzenia dostępu i uruchomienia [harnessu](../../src/lib/imports/live-evaluation.test.ts) przy uzgodnionym pułapie 5 USD.

## Stan środowiska

Lokalny Supabase był dostępny podczas testów; skrypt HTTP zamknął własny serwer Next. Nie zapisano klucza ani danych prywatnych w repo. Raport live nie powstał. Wymagane nazwy zmiennych: `OPENAI_API_KEY`, `OPENAI_IMPORT_ENABLED`, `OPENAI_IMPORT_BUDGET_USD`, `RUN_T06_LIVE`; wartości nie są utrwalone w plikach projektu.

## Prompt dla kolejnego agenta

Rekomendowany model: gpt-6-sol, rozumowanie high — staranna ocena jakości importu i kosztów przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj wyłącznie T06; nie przechodź do T07 i nie uruchamiaj subagentów. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-12-T06-kontynuacja-bez-klucza.md, docs/T06_IMPORT.md, docs/PRODUCT.md, docs/AI_AND_VOICE.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md i docs/TESTING.md. Budżet prawdziwych prób do 5 USD został uzgodniony, ale klucz nie był dostępny w środowisku poprzedniej sesji; przed wywołaniem sprawdź jego obecność poza repo, nie pokazując wartości, oraz aktualną dokumentację OpenAI. Uruchom 12 syntetycznych przypadków przez evaluate:t06. Zbierz dokładność pól, opuszczenia i dopowiedzenia, p50/p95, tokeny, szacowany koszt oraz rzeczywisty koszt na koncie. Oceń skany, timeout 30 s, limit 2500 tokenów i ograniczenia hostingu. Popraw tylko T06 i powtórz adekwatne próby. Sprawdź lokalne A/B/anon, retry, błędny plik, sprzątanie, typy i build. Bez klucza wykonaj tylko kontrole niezależne, pozostaw T06 jako blocked i nie przypisuj mockom jakości modelu. Nie zapisuj sekretów ani prywatnych źródeł w repo. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według wyniku i utwórz handoff z dokładnymi wynikami oraz identycznym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — wymaga staranności przy niższym koszcie niż model frontier.
```

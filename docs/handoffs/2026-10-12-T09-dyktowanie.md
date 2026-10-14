# Handoff — T09 — dyktowanie planów i danych treningu

- Data i autor: 2026-10-12, Codex.
- Zadanie / status po sesji: T09 / `review`; T10 i T11 nierozpoczęte.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i PR.
- Powiązany wcześniejszy handoff: [T08](2026-10-12-T08-postep.md).

## Cel i wykonana praca

Dodano nagrywanie do 30 s w edytorze planu i przy serii, komentarzu oraz dodatkowym ćwiczeniu. `MediaRecorder` wybiera WebM/Opus lub MP4; odmowa mikrofonu pozostawia tekstowe i ręczne formularze. Anulowanie przerywa żądanie, zatrzymuje strumień i unieważnia spóźnioną odpowiedź. Nagranie do 5 MB trafia wyłącznie do serwerowej transkrypcji, a widoczny tekst można poprawić przed osobną interpretacją.

Serwer wymaga zalogowanego użytkownika, sprawdza właściciela treningu i serii oraz rewizję przed przygotowaniem propozycji. Karta pokazuje transkrypcję, konkretny cel i edytowalne wartości. Wypowiedź o planie tworzy walidowany fragment szkicu w edytorze; jego publikacja wymaga osobnego zatwierdzenia T04. Wynik/poprawka serii, komentarz i dodatkowe ćwiczenie są zapisywane dopiero po zatwierdzeniu kartą. Używają istniejącej transakcyjnej komendy T05. Opcjonalne wykonane serie nowego ćwiczenia są dodawane w tej samej transakcji; retry operacji i konflikt rewizji nadal działają. Brakujące wartości pozostają `null`.

Audio i transkrypcja nie trafiają do bazy, Storage, repo ani logów aplikacji. Osobna flaga oraz budżet głosu blokują wywołania bez uzgodnienia. Prywatna tabela trzyma wyłącznie właściciela, czas i rezerwację 0,01 USD na próbę; istniejący cron usuwa metadane starsze niż 7 dni. Ta rezerwacja jest przybliżeniem, nie limitem rachunku dostawcy. Dokumentację OpenAI sprawdzono 2026-10-12: [transkrypcja i formaty](https://developers.openai.com/api/docs/guides/speech-to-text), [gpt-transcribe](https://developers.openai.com/api/docs/models/gpt-transcribe), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [gpt-6-luna](https://developers.openai.com/api/docs/models/gpt-6-luna), [kontrola danych](https://developers.openai.com/api/docs/guides/your-data).

## Zmienione pliki

- [Komponent nagrywania](../../src/components/voice-input.tsx), [karta treningu](../../src/components/workout-voice.tsx), [edytor treningu](../../src/components/workout-editor.tsx), [edytor planu](../../src/components/plan-editor.tsx), [style](../../src/app/globals.css) — nagranie, korekta tekstu, cel i jawny zapis.
- [Kontrakt głosu](../../src/lib/voice/domain.ts), [adapter OpenAI](../../src/lib/voice/openai.ts), [API transkrypcji](../../src/app/api/voice/transcribe/route.ts), [API interpretacji](../../src/app/api/voice/interpret/route.ts) — walidacja, własność, limity, budżet i propozycja.
- [Migracja budżetu](../../supabase/migrations/20261012203000_t09_voice_budget.sql), [rozszerzenie komendy T05](../../supabase/migrations/20261012204000_t09_voice_exercise_sets.sql), [sprzątanie](../../src/lib/imports/cleanup.ts) — prywatne metadane, atomowe serie, retencja.
- [Przykłady](../../src/lib/voice/cases.ts), [testy domenowe](../../src/lib/voice/domain.test.ts), [adaptera](../../src/lib/voice/openai.test.ts), [interfejsu](../../src/components/voice-input.test.tsx), [karty](../../src/components/workout-voice.test.tsx), [planu](../../src/components/plan-voice.test.tsx), [lokalne API](../../scripts/test-t09-api.mjs), [harness prawdziwych prób](../../src/lib/voice/live-evaluation.test.ts), [skrypty](../../package.json), [konfiguracja](../../.env.example).
- [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [CHANGELOG](../CHANGELOG.md), [DECISIONS](../DECISIONS.md), [AI i głos](../AI_AND_VOICE.md), [UX](../UX.md), [ARCHITECTURE](../ARCHITECTURE.md), [DATA_MODEL](../DATA_MODEL.md), [TESTING](../TESTING.md), [README](../../README.md) — stan, decyzja D019 i ograniczenia.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, lokalny Docker/Supabase Auth/PostgREST/PostgreSQL oraz produkcyjny Next na porcie 3005 podczas testu HTTP. `DO_NOT_TRACK=1 npx supabase migration up --local`: dwie migracje T09 zastosowane. `npm test`: 64 aktywne testy przeszły, 7 pominięto (w tym prawdziwa ewaluacja T09 bez budżetu); `npm run typecheck` i `npm run build`: sukces. `DO_NOT_TRACK=1 npm run test:t09:local`: sukces; z `T09_HTTP_BASE=http://localhost:3005` również sukces dla A/B/anon, obcej serii, starej rewizji, fałszywego WebM, odmowy AI bez budżetu, atomowych serii, retry i rezerwacji. `DO_NOT_TRACK=1 npm run test:t05:local`: sukces regresji transakcyjnej komendy.

Dwadzieścia syntetycznych polskich przykładów w teście domenowym oraz opóźniona odpowiedź, brak mikrofonu, zakotwiczenie celu i szkic planu w testach komponentów używają **mocków**. Test adaptera sprawdza format żądania do OpenAI z mockiem HTTP. Nie są dowodem jakości prawdziwej transkrypcji ani interpretacji. Prawdziwe wywołania T09, koszt i p50/p95 nie zostały wykonane bez osobno uzgodnionego budżetu. Harness `RUN_T09_LIVE=true T09_LIVE_BUDGET_USD=... npm test -- src/lib/voice/live-evaluation.test.ts` jest gotowy; używa syntetycznej mowy systemowej, także z dodanym szumem, i zapisuje raport bez treści nagrań. Nie testowano fizycznego mikrofonu, Safari/iPhone, Chrome/Android ani hostingu.

`DO_NOT_TRACK=1 npm run test:t06:local` po zmianie sprzątania: 2 testy przeszły, 1 nie przeszedł na kroku rezerwacji `daily_budget`. Lokalna baza ma już próby w globalnym oknie 24 h T06, a test zakłada pusty licznik przy limicie 0,05 USD; nie usuwano istniejących prób i nie deklarowano pełnej regresji T06. `npm test` przechodzi; nie zmieniano testu T06 poza zakresem T09.

## Decyzje i zmiany planu

[D019](../DECISIONS.md) opisuje osobny budżet, brak zapisu audio, cel i rewizję oraz wspólną komendę T05. T09 przeszło z `todo` przez `in_progress` do `review`, ponieważ implementacja lokalna czeka na prawdziwe próby i urządzenie. ID i zależności T10/T11 pozostają bez zmian. Nie uruchomiono innych agentów.

## Pozostała praca i blokery

Lokalny plik `.env` zawiera klucz używany wcześniej przez T06, ale brak uzgodnionego budżetu T09 i włączonych `OPENAI_VOICE_ENABLED`/`OPENAI_VOICE_BUDGET_USD`. Prawdziwe próby wymagają zgody na kwotę; nie wykonano płatnego żądania. Fizyczne urządzenie z mikrofonem jest potrzebne do sprawdzenia nagrywania i formatów. Syntetyczny głos z harnessu nie zastępuje takiego odbioru. Brak hostowanego Vercel/Supabase pozostaje granicą, bez rozpoczynania T11. Test regresji T06 wymaga wygaśnięcia jego globalnego okna budżetu lub odizolowanego środowiska; nie czyścić cudzych prób.

## Następny krok

Kontynuować T09: po uzgodnieniu budżetu uruchomić prawdziwą ewaluację, ocenić błędy polskich liczb i hałasu oraz poprawić prompt/adapter. Następnie sprawdzić WebM/MP4 i anulowanie na fizycznym urządzeniu z mikrofonem. Dopiero po wynikach i aktualizacji handoffu zdecydować o `done`. Nie rozpoczynać T10/T11.

## Stan środowiska

Testowy serwer Next na porcie 3005 zatrzymano. Lokalny Supabase pozostał uruchomiony; migracje T09 są zastosowane. Syntetyczne konta testowe usunięto. Klucz pozostaje w ignorowanym `.env`; wartości nie zapisano w repo. Głos jest domyślnie wyłączony bez osobnej flagi i budżetu. Nie ma repozytorium Git.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: gpt-6-sol, high — ocena głosu, niejednoznacznych liczb i prywatności wymaga staranności przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj wyłącznie T09 — dyktowanie planów i danych treningu; nie rozpoczynaj T10 ani T11 i nie uruchamiaj automatycznie innych agentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-12-T09-dyktowanie.md, docs/AI_AND_VOICE.md, docs/DECISIONS.md, docs/TESTING.md, docs/WORKFLOW.md oraz kod src/lib/voice, src/components/voice-input.tsx, src/components/workout-voice.tsx i migracje T09. T09 jest w review: lokalna implementacja, testy A/B/anon, retry, typy i build przeszły; prawdziwa jakość głosu i fizyczny mikrofon pozostają niesprawdzone. Po wyraźnym uzgodnieniu budżetu dla T09 i przy dostępnym kluczu uruchom syntetyczną ewaluację RUN_T09_LIVE=true T09_LIVE_BUDGET_USD=<uzgodniona_kwota> npm test -- src/lib/voice/live-evaluation.test.ts, oceń polskie liczby, poprawki, plan i hałas, p50/p95 oraz koszt; napraw wykryte błędy i powtórz regresję. Na fizycznym telefonie sprawdź uprawnienia mikrofonu, WebM/MP4, anulowanie, opóźniony wynik i zmianę ćwiczenia; bez urządzenia nie deklaruj odbioru. Zachowaj ręczne formularze, jawne zatwierdzenie, kontrolę właściciela i transakcyjną komendę T05. Regresja T06 trafiła na istniejący globalny limit prób w oknie 24 h; sprawdź ją po wygaśnięciu okna lub w izolowanym środowisku, bez usuwania cudzych danych. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS i TESTING według wyniku, utwórz nowy handoff z identycznym promptem dla kolejnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — głos, niezawodność i prywatność wymagają uważności przy niższym koszcie niż model frontier.
```

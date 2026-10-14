# Handoff — T09 — obsługa błędu rejestratora

- Data i autor: 2026-10-13, Codex.
- Zadanie / status po sesji: wyłącznie T09 / `review`; T10 i T11 nierozpoczęte.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i PR. Zmiany są lokalne.
- Powiązany wcześniejszy handoff: [ewaluacja live T09](2026-10-13-T09-ewaluacja-live.md).

## Cel i wykonana praca

Sprawdzono dostępność fizycznego telefonu: `adb devices -l` z dostępem do ADB pokazało wyłącznie `emulator-5556`, a kontrola USB nie wykazała iPhone'a ani Androida. Użytkownik potwierdził, że obecnie nie ma telefonu. Nie wykonano fizycznego odbioru mikrofonu, uprawnień, WebM/MP4, anulowania, opóźnionego wyniku ani zmiany ćwiczenia.

Podczas końcowej kontroli równoległa sesja zmieniła ROADMAP/STATUS i wpisała próbę emulatora (WebM/Opus, wymuszone MP4, anulowanie). [Jej handoff](2026-10-13-T09-odbior-emulator.md) pojawił się później i dokumentuje osobne polecenie użytkownika dopuszczające emulator. Wyników emulatora nie powtarzano ani nie zaliczono jako fizycznego odbioru. Bieżące zlecenie w tej rozmowie wprost zabrania statusu `done` bez telefonu, więc w dokumentach przywrócono `review` i zachowano wzmiankę o emulatorze bez usuwania cudzej pracy. Poproszono użytkownika o rozstrzygnięcie sprzecznych kryteriów.

Przegląd T09 ujawnił brak obsługi asynchronicznego zdarzenia błędu `MediaRecorder`. Dodano zatrzymanie śladów mikrofonu, unieważnienie bieżącego nagrania i komunikat prowadzący do wpisu ręcznego. Zdarzenie `stop` po takim błędzie nie wysyła częściowego pliku. Test z mockiem obejmuje wybór MP4 i tę sekwencję; osobny test odrzuca spóźnioną interpretację po zmianie docelowej serii. Nie zmieniono formularzy ręcznych, zatwierdzania propozycji, kontroli właściciela, migracji ani transakcyjnej komendy T05.

## Zmienione pliki

- [VoiceInput](../../src/components/voice-input.tsx) — obsługa błędu rejestratora.
- [Testy VoiceInput](../../src/components/voice-input.test.tsx) — błąd MP4 i zmiana serii przy opóźnionej odpowiedzi.
- [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [TESTING](../TESTING.md), [AI_AND_VOICE](../AI_AND_VOICE.md), [CHANGELOG](../CHANGELOG.md), [README](../../README.md) — wyniki, ograniczenia, aktualny handoff i status `review`.
- Migracji i DECISIONS nie zmieniano; D019/D020 pozostają aktualne.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, lokalny Supabase Auth/PostgREST w Dockerze, produkcyjny build Next na porcie 3005 podczas testu HTTP. `npx vitest run src/components/voice-input.test.tsx`: 5/5. `npm test`: 67 testów przeszło, 7 pominięto. `DO_NOT_TRACK=1 npm run test:t09:local`: PASS (A/B/anon, atomowe serie, retry, rewizja, budżet). `T09_HTTP_BASE=http://localhost:3005 DO_NOT_TRACK=1 npm run test:t09:local`: PASS (HTTP A/B/anon, stara rewizja, cel, odmowa bez budżetu). `DO_NOT_TRACK=1 npm run test:t05:local`: PASS. `npm run build`: PASS. `npm run typecheck` po buildzie: PASS.

Pierwsze uruchomienie lokalnego T09 w sandboxie nie miało dostępu do socketu Dockera; powtórzenie z uprawnieniem przeszło. Pierwsza próba uruchomienia Next w sandboxie miała `listen EPERM`; serwer uruchomiony z uprawnieniem, test HTTP przeszedł, serwer zatrzymano. Testy komponentu używają mocków i nie dowodzą działania MP4 na telefonie. Nie wykonano nowych płatnych prób OpenAI; szacunek czterech wcześniejszych serii pozostaje 0,010376 USD w zatwierdzonym łącznym limicie 0,50 USD, bez potwierdzenia rachunkiem dostawcy. Regresji T06 nie uruchomiono przed 2026-10-13 12:23 UTC; nie usuwano istniejących prób.

## Decyzje i zmiany planu

T09 przejęto jako `in_progress` na czas sesji i przywrócono do `review`, bo brakuje fizycznego odbioru. Poprawka jest obsługą błędu w ramach D019, bez nowej decyzji architektonicznej. ID, zależności i zakres T09 pozostały bez zmian; T10/T11 są nadal `todo`.

## Pozostała praca i blokery

Potrzebny jest fizyczny telefon z mikrofonem i bezpieczny kontekst HTTPS albo localhost urządzenia. Sprawdzić rzeczywiste uprawnienia, zapis WebM/MP4, anulowanie, spóźniony wynik i zmianę ćwiczenia; po naprawie ewentualnych błędów ponowić adekwatną regresję. Bez telefonu nie oznaczać T09 `done`. Po 2026-10-13 12:23 UTC wykonać regresję T06 na istniejącym środowisku albo wcześniej w izolowanym, bez kasowania cudzych prób. Nie ma potrzeby nowego płatnego API tylko dla tej poprawki.

## Następny krok

Kontynuować wyłącznie T09 po udostępnieniu telefonu, zaczynając od scenariuszy urządzenia z TESTING. Jeżeli telefonu nadal nie ma, utrzymać `review` i zapisać brak testu. Po spełnieniu warunku czasu wykonać osobno regresję T06.

## Stan środowiska

Serwer Next uruchomiony na potrzeby HTTP został zatrzymany. Lokalny Supabase pozostał dostępny; skrypty utworzyły i usunęły własne syntetyczne konta T09. Nie zmieniono wartości `.env`, nie zapisano sekretów, prywatnych planów ani nagrań. Katalog nie ma Git.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: gpt-6-sol, high — głos, niezawodność i prywatność wymagają uważności przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj wyłącznie T09 — dyktowanie planów i danych treningu; nie rozpoczynaj T10 ani T11 i nie uruchamiaj automatycznie innych agentów. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-13-T09-obsluga-bledu-rejestratora.md, docs/AI_AND_VOICE.md, docs/DECISIONS.md, docs/TESTING.md, docs/WORKFLOW.md oraz src/lib/voice, src/components/voice-input.tsx, src/components/workout-voice.tsx i migracje T09. T09 pozostaje w review: końcowy raport docs/reports/2026-10-12-T09-live.json ma 20/20 syntetycznych tekstów, poprawny plan i 2/2 syntetycznych nagrań; cztery serie prawdziwego OpenAI kosztowały szacunkowo 0,010376 USD z zatwierdzonego łącznego limitu 0,50 USD, bez potwierdzenia rachunkiem. Ostatnia sesja naprawiła asynchroniczny błąd MediaRecorder i przeszła regresję jednostkową, T09 lokalną/HTTP, T05, typy i build. Użytkownik 2026-10-13 potwierdził brak fizycznego telefonu; ADB widział tylko emulator. Gdy telefon będzie dostępny, sprawdź uprawnienia mikrofonu, WebM/MP4, anulowanie, opóźniony wynik i zmianę ćwiczenia; bez tego nie deklaruj odbioru ani statusu done. Napraw wykryte błędy i powtórz adekwatną regresję; zachowaj ręczne formularze, jawne zatwierdzenie, kontrolę właściciela i transakcyjną komendę T05. Nowe płatne próby wykonuj tylko gdy potrzebne do regresji T09, licząc je w zatwierdzonym łącznym limicie 0,50 USD. Regresję T06 uruchom po 2026-10-13 12:23 UTC albo w izolowanym środowisku, bez usuwania cudzych prób. Zaktualizuj ROADMAP, STATUS, TESTING, CHANGELOG/DECISIONS według wyników i utwórz nowy handoff z identycznym promptem końcowym. Rekomendowany model: gpt-6-sol, rozumowanie high — głos, niezawodność i prywatność wymagają uważności przy niższym koszcie niż model frontier.
```

# Handoff — T09 — odbiór lokalny na emulatorze

- Data i autor: 2026-10-13, Codex.
- Zadanie / status po sesji: T09 / `done` w lokalnym zakresie uzgodnionym przez użytkownika. T10 i T11 nierozpoczęte.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i PR. Zmiany są lokalne.
- Powiązany wcześniejszy handoff: [ewaluacja T09](2026-10-13-T09-ewaluacja-live.md). W trakcie sesji zastano także dodatkową obsługę asynchronicznego błędu `MediaRecorder` i jej testy; nie przypisuję sobie ich autorstwa.

## Cel i wykonana praca

Użytkownik wyraźnie stwierdził: „Emulator wystarczy na razie. Oznacz jako gotowe”. Zastosowano to jako lokalne kryterium odbioru T09, bez deklarowania zgodności z fizycznym telefonem. Na emulatorze Android w Chrome otwarto przez `adb reverse` tymczasową stronę lokalną używającą tych samych standardowych API `getUserMedia` i `MediaRecorder`. Sprawdzono dwa poziomy zgody na mikrofon (witryna i Android), rzeczywiste nagranie WebM/Opus oraz wymuszone audio/MP4, anulowanie podczas nagrania i zwolnienie ścieżki audio. Aplikacja preferuje WebM, gdy przeglądarka je obsługuje; MP4 wymuszono tylko w teście przeglądarki. Tymczasowa strona nie używała konta, API aplikacji ani OpenAI i nie trafiła do repo.

W czasie pracy w tym samym katalogu pojawiła się dodatkowa poprawka asynchronicznego błędu `MediaRecorder` i dwa testy komponentów. Przeczytano bieżący kod i dokumentację, nie nadpisano tej zmiany, a następnie ponowiono `npm test` — 67 testów przeszło, 7 pominięto. T09 oznaczono `done` zgodnie z instrukcją użytkownika; decyzja D021 precyzuje granice. Ręczne formularze, jawne zatwierdzanie, kontrola właściciela i transakcyjna komenda T05 pozostają w użyciu.

## Zmienione pliki

- [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [TESTING](../TESTING.md), [AI_AND_VOICE](../AI_AND_VOICE.md), [CHANGELOG](../CHANGELOG.md), [DECISIONS](../DECISIONS.md), [README](../../README.md) — status `done`, zmiana lokalnego kryterium na emulator i uczciwe ograniczenia testu.
- Ten handoff — wynik odbioru i prompt przekazania.
- Nie zmieniano w tej części sesji migracji ani kontraktu T05. Tymczasowy test HTML i zrzuty ekranu znajdowały się wyłącznie w `/private/tmp/t09-emulator-check`; nie zostały dodane do projektu.

## Weryfikacja

Środowisko: macOS, emulator `emulator-5556` z Chrome Android, lokalny serwer HTTP na porcie 3007 i `adb reverse tcp:3007 tcp:3007`. `http://localhost:3007` był bezpiecznym kontekstem (`isSecureContext=true`), `getUserMedia` było dostępne. Chrome zgłosił obsługę `audio/webm;codecs=opus` i `audio/mp4` przez `MediaRecorder.isTypeSupported`. Po przyznaniu obu zgód nagranie WebM/Opus miało 48 449 bajtów i zakończony ślad mikrofonu. Wymuszone MP4 miało 31 685 bajtów i zakończony ślad. Przy anulowaniu aktywnego nagrania wynik oznaczono `discarded=true`, a ślad miał stan `ended`. Nie zapisano audio w repo ani nie wysłano go do dostawcy. Lokalny serwer i przekierowanie ADB wyłączono po teście.

`npm test` po zastanej poprawce: 67 przeszło, 7 pominięto. Podczas końcowej kontroli ponownie przeszły `npm run typecheck` i `npm run build`. Lokalne T09 A/B/anon, HTTP i T05 przeszły w poprzedniej kontynuacji; w tej części sesji nie ponawiano płatnego API ani T05, bo nie zmieniano kodu aplikacji. Końcowy [raport prawdziwego API na danych syntetycznych](../reports/2026-10-12-T09-live.json) z poprzedniej sesji ma 20/20 przypadków tekstowych, poprawny plan i 2/2 syntetycznych nagrań; cztery serie kosztowały szacunkowo 0,010376 USD wobec limitu 0,50 USD. Syntetyczne audio i emulator nie zastępują realnego głosu, fizycznego urządzenia ani rachunku dostawcy.

Tymczasowa strona sprawdzała API przeglądarki, nie pełny interfejs aplikacji. Opóźniony wynik, zmiana aktywnej serii, brak automatycznego zapisu, A/B/anon i rewizje mają testy komponentowe oraz lokalne API z mockami, lecz nie przeszły klikalnego E2E na emulatorze. Fizycznego iPhone/Android oraz Safari nie testowano. Regresji T06 nie uruchomiono przed 2026-10-13 12:23 UTC; nie usunięto żadnych prób. Nie uruchomiono innych agentów w tej sesji.

## Decyzje i zmiany planu

[D021](../DECISIONS.md) zapisuje zaakceptowaną przez użytkownika zmianę kryterium wyłącznie dla lokalnego T09: emulator wystarcza na teraz do `done`. Fizyczny odbiór pozostaje częścią szerszych testów T10, bez deklaracji wyniku. T09 zmieniono z `review` przez `in_progress` na `done`; T10 i T11 nadal `todo`, ID i zależności bez zmian. D019 i D020 pozostają aktualne.

## Pozostała praca i blokery

Fizyczne telefony, Safari/iPhone, pełna klikalna ścieżka mobilna, realna sala treningowa i hosting nie są sprawdzone. T10 może rozpocząć się dopiero na osobne zlecenie użytkownika; zakres szerszego odbioru urządzeń powinien te luki uwzględnić. Pełna regresja T06 wymaga czasu po 2026-10-13 12:23 UTC lub izolowanego środowiska; nie wolno usuwać istniejących prób, by wymusić wynik.

## Następny krok

T09 jest lokalnie zamknięte. Po osobnym zleceniu użytkownika następnym zadaniem z ROADMAP jest T10 — odbiór funkcjonalny i poprawki; przed nim lub w jego ramach ponowić dozwoloną regresję T06. Nie rozpoczynać T11 bez spełnienia zależności i osobnego polecenia.

## Stan środowiska

Lokalny Supabase był dostępny, ale nie użyto go w tym teście emulatora. Tymczasowy serwer portu 3007 zatrzymano, a `adb reverse tcp:3007` usunięto. Nie pozostawiono uruchomionego Next ani procesu live. Klucz nadal jest tylko w ignorowanym `.env`; flag głosu nie ustawiano trwale. Katalog nie ma Git.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: gpt-6-sol, high — odbiór prywatnych danych, urządzeń i ścieżek zapisu wymaga uważności przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Następne zadanie po osobnym zleceniu użytkownika: T10 — odbiór funkcjonalny i poprawki; nie rozpoczynaj T11 ani innych zadań automatycznie i nie uruchamiaj innych agentów. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-13-T09-odbior-emulator.md, docs/PRODUCT.md, docs/TESTING.md, docs/WORKFLOW.md i docs/DECISIONS.md. T09 ma status done lokalnie, ponieważ użytkownik dopuścił emulator Android jako wystarczający na teraz: Chrome nagrał WebM/Opus i wymuszone MP4 oraz odrzucił anulowane nagranie, a prawdziwa ewaluacja na danych syntetycznych przeszła. Nie deklaruj odbioru fizycznego telefonu, Safari/iPhone, pełnego klikalnego E2E aplikacji na emulatorze ani hostingu. W T10 sprawdź krytyczne scenariusze TESTING na dostępnych urządzeniach testerów, izolację A/B/anon, ręczny trening, korektę importu, głos, konflikty, anulowanie i awarie; zapisz dowody, środowisko oraz ograniczenia, napraw wykryte błędy i ponów adekwatne regresje. Pełną regresję T06 wykonaj dopiero po 2026-10-13 12:23 UTC albo w izolowanym środowisku, bez usuwania cudzych prób. Nie wykonuj nowych płatnych prób AI bez potrzeby i pilnuj wcześniej zatwierdzonego łącznego limitu 0,50 USD dla T09; dotąd szacowano 0,010376 USD. Aktualizuj ROADMAP, STATUS, TESTING, CHANGELOG/DECISIONS według wyników i utwórz nowy handoff z identycznym promptem końcowym. Rekomendowany model: gpt-6-sol, rozumowanie high — odbiór prywatności i niezawodności na urządzeniach wymaga uważności przy niższym koszcie niż model frontier.
```

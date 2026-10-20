# Handoff — T16-H — Profil i Auth

- Data i autor: 2026-10-20, Cursor agent, sesja T16-H.
- Zadanie / status po sesji: T16-H review. T16-I todo. T16-K todo i niegotowe, bo nie ma propozycji kontraktu.
- Branch / commit / stan zmian: `codex/tempo`, HEAD `70d66e627ecb8fef73fb8d89d430ad8f41796ca5`. Dokumentacja T16-A oraz kod T16-B–H są niezacommitowane. Bez commit, push i PR.
- Powiązany wcześniejszy handoff: [T16-G](2026-10-19-T16-G-postep.md).

## Cel i wykonana praca

Wdrożono hierarchię Tempo na `/profil`, `/logowanie` i `/ustaw-haslo`. Akcje Auth, trasa `/auth/login`, API 1RM, repozytoria i Supabase zostały tylko do odczytu. Nie dodano liczb z makiety i nie powstał `docs/proposals/T16-CONTRACT-*.md`.

Profil: konto, pomiar rzeczywistego 1RM, ustawienia, historia, wylogowanie. Główny przycisk to `Zapisz zmierzone 1RM`. Krok obciążenia jest drugorzędny. Strefa czasowa jest odczytem. `Co to jest?` rozróżnia pomiar od szacunku w Postępie. Pusta historia mówi o braku maksimów. Konto demo nie zapisuje i nie pokazuje fikcyjnych kilogramów ani strefy. Wpis 1RM nadal nie tworzy treningu i nie przelicza historii. Wylogowanie jest przyciskiem danger na końcu strony.

Logowanie: autofill `username` i `current-password`. Błąd danych jest jeden, z fokusem, i nie mówi, czy konto istnieje. Osobno zostają komunikaty sesji wygasłej, wylogowania, nieudanego profilu i nieudanego zaproszenia. Bez skonfigurowanego Auth widać tylko przejście do przykładu.

Ustawienie hasła: dokładnie jedno pole, `autocomplete=new-password`, widoczne minimum 12 znaków. Za krótkie hasło nie wychodzi z formularza i zostaje w polu. Po błędzie zapisu szkic wraca z pamięci sesji przeglądarki i jest od razu kasowany; udane przejście do Profilu oraz powrót do logowania też go kasują. Drugie wysłanie jest zablokowane. `Wróć do logowania` jest akcją drugorzędną.

## Zmienione pliki

- [src/app/profil/page.tsx](../../src/app/profil/page.tsx) — kolejność Tempo, historia, puste maksimum, demo i wylogowanie danger.
- [src/app/logowanie/page.tsx](../../src/app/logowanie/page.tsx) — stany pusty, błąd pola, sesja, wylogowanie i demo.
- [src/app/ustaw-haslo/page.tsx](../../src/app/ustaw-haslo/page.tsx) — jedno pole i powrót do logowania.
- [src/components/account-form.tsx](../../src/components/account-form.tsx) i [account.module.css](../../src/components/account.module.css) — formularze, szkic hasła i hierarchia.
- [src/components/one-rep-max-editor.tsx](../../src/components/one-rep-max-editor.tsx) oraz [test](../../src/components/one-rep-max-editor.test.tsx) — pomiar, krok i hasło.
- [scripts/test-t15f-browser.mjs](../../scripts/test-t15f-browser.mjs) — Tempo zamiast `data-theme="night"`, jedno pole, autofill, desktop.
- [docs/ROADMAP.md](../ROADMAP.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md), [docs/TESTING.md](../TESTING.md) i ten handoff.

Bez zmian `src/app/logowanie/actions.ts`, `src/app/ustaw-haslo/actions.ts`, API, repozytoriów i Supabase. Bez migracji.

## Weryfikacja

Środowisko: macOS, gałąź `codex/tempo`, lokalny Supabase API odpowiadał, Chrome przez Playwright `channel: chrome`. Telefon i Safari niewykonane. Płatnego AI nie było.

1. `npx vitest run src/components/one-rep-max-editor.test.tsx`: 5/5.
2. `npm test`: 271 passed, 9 skipped.
3. `T15F_HTTP_BASE=http://localhost:3000 T15F_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15f-browser.mjs`: PASS. To był już działający `next dev` na `localhost:3000`, nie `next start`. 360/390/430 i desktop 1280. Brak `data-theme`, tło `rgb(17, 25, 28)`, brak poziomego overflow. Autofill, fokus błędu logowania, pomoc 1RM, 100 kg z datą 18.10.2026, krok 1,25, jedno pole hasła, za krótki wpis zostaje, zmiana hasła, wylogowanie o innym tle niż główny przycisk i ponowne logowanie. Zrzuty w `/private/tmp/t15f-*.png` obejrzane: logowanie ma jeden główny przycisk, hasło ma jedno pole i błąd 12 znaków, profil ma złoty zapis 1RM i danger na dole.
4. `npm run build` PASS. Potem `npm run typecheck` PASS. `git diff --check` bez zgłoszeń.

Stany demo profilu i logowania są w kodzie, ale ten przebieg Chrome ich nie otworzył, bo lokalny Supabase jest skonfigurowany. Pusty stan historii jest w kodzie; przebieg zapisał 100 kg, więc widział historię, nie pustkę.

## Decyzje i zmiany planu

Bez nowej decyzji. D047 obejmuje wygląd Profilu i Auth. D046 bez zmian. T16-H jest review. T16-I pozostaje todo i wymaga innego agenta niż autorzy B–H. Brak propozycji kontraktu, więc T16-K pozostaje niegotowe.

Szkic hasła po błędzie zapisu trzyma się w `sessionStorage` tylko do następnego rysowania strony, bo akcja serwera przekierowuje i nie wolno jej zmienić. Nie trafia do adresu, logów ani dokumentów.

## Pozostała praca i blokery

T16-I może startować po osobnym zleceniu, jako inny agent. Brak blokera kontraktu. Telefon, Safari, T10-R1, T11 i publikacja pozostają osobne. Po `npm run build` katalog `.next` jest produkcyjny; działający wcześniej `next dev` na porcie 3000 może wymagać ponownego uruchomienia.

## Następny krok

T16-I, niezależny odbiór całego przepływu. Najpierw przeczytać AGENTS, README, STATUS, ROADMAP, ten handoff, specyfikację T16, brief, katalog i handoffy A–H. Nie poprawiać `src/` przy znalezionym defekcie. Chrome na tym dev serwerze otwierać jako `localhost`, nie `127.0.0.1`.

## Stan środowiska

Lokalny Supabase API był dostępny. Komunikat CLI podczas testów wymieniał zatrzymane usługi imgproxy i pooler; ta sesja ich nie zatrzymywała. Test Chrome usunął swoje syntetyczne konto. `next dev` użytkownika był na porcie 3000 i posłużył do Chrome. Sekrety nie były zapisywane w dokumentacji. Zmiany są lokalne i niewysłane. Tymczasowy odczyt `App.tsx` z Make został usunięty i nie jest w repozytorium.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, high. Odbiór przecina ekrany, Auth, szkice i regresje. Tańszy poziom pominąłby rozjazd między klatką a prawdziwym odczytem.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj tylko niezależny T16-I. Nie bądź autorem poprawek B–H ani K. Przeczytaj AGENTS.md, README.md, STATUS, ROADMAP, T16 spec, brief, katalog, handoffy T16-A–H, wszystkie T16-CONTRACT, odbiór T13/T15 oraz D044, D046 i D047. Przez Figma MCP sprawdź katalog i App.tsx jako referencję stanów. Src jest tylko do odczytu. Zbuduj macierz wszystkich nazwanych klatek i niezależnie przejdź pełny lokalny przepływ login, plan ręczny lub import, korekta, edycja, konflikt i start, seria, głos z mockiem, finish, historia, postęp i profil. Powtórz npm test, build, sekwencyjny typecheck oraz właściwe runnery. Nie zaliczaj stanu danymi fixture zastępującymi brak kontraktu. Otwarta propozycja blokuje pełny PASS, chyba że użytkownik jawnie odłożył ten stan. Jeśli znajdziesz defekt, przypisz go właścicielowi i zatrzymaj zamknięcie. Utwórz raport, handoff i zamknij dokumenty tylko po spełnieniu bramki. Nie publikuj. Zapisz, że telefon i Safari nie były sprawdzane, jeśli tak pozostanie. Chrome otwieraj jako localhost, nie 127.0.0.1. Model rekomendowany: GPT-5.6 Sol, high — niezależny odbiór przekrojowy.
```

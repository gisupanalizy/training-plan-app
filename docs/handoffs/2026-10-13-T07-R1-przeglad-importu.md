# Handoff — T07-R1 — czytelny przegląd importu

- Data/autor: 2026-10-13, Codex. Bez innych agentów.
- Zadanie/status: T07-R1 `done` lokalnie, zależności T07/T06-R1 spełnione.
- Git: katalog nie jest repozytorium Git; zmiany lokalne, bez publikacji.
- Poprzedni punkt wejścia: [T06-R1](2026-10-13-T06-R1-import-tabel.md).

## Cel i wykonana praca

Zrealizowano zaakceptowany przegląd importu w trzech krokach: **Ćwiczenia → Serie i superserie → Podsumowanie**. Pierwszy krok jest listą ćwiczeń według treningów, z nazwą PL, oryginałem i wariantem. Potwierdzenie dotyczy całego kroku. Parametry i pełne pola pojawiają się dopiero podczas edycji.

Drugi krok pokazuje kompaktowe karty. Handstand to `7–8 serii × 1 powtórzenie` i ósma opcjonalna. Dip zachowuje `2 × 6 + 1–2 × 3`, różne cele/rampa mają małą tabelę obejmującą także różne przerwy/rodzaje/RPE/RIR/tempo. Brak celu jest widoczny, nie łączony z poprawnym. Uwagi mają krótki podgląd i pełną treść w szczegółach. Superserie mają wspólną ramkę, kolejność i przerwę; można je tworzyć, zmieniać i rozłączać.

Edycja bloku zmienia wspólne parametry wskazanych serii, zachowując ID, uwagi, źródła i opcjonalność. Edycja indywidualna pozwala wybrać konkretną serię. Zmiana liczby serii bloku zachowuje jego własny cel. Edycja ćwiczenia obejmuje słownik, nazwę, sprzęt, wariant i przypisanie do dnia lub nowego treningu. Zamknięcie odrzuca niezastosowany formularz; anulowanie dodawania nie pozostawia pustego ćwiczenia.

Ankieta jest jednym pytaniem w natywnym dialogu (pełny ekran na telefonie), z kafelkami wyboru, ilością/zakresem/AMRAP, cytatem i podglądem skutku. Pytania mają kolejność planu i podział na etapy; „Później” pozostawia niejasność. Ogólna niejasność prowadzi do korekty, a wyświetlony wspólny zakres można jawnie potwierdzić. Przypisanie bloku wymaga wyboru treningu. Źródło wewnątrz ankiety nie otwiera kolejnego modala. Po odpowiedzi przechodzi się do następnego pytania, także nowego braku celu po ustaleniu serii.

Źródło domyślnie jest zamknięte. Desktop ma panel obok, telefon pełny dialog. Zachowano strony/zoom PDF.js i wszystkie arkusze XLSX. Trzeci krok pokazuje wszystkie dni jako rozwijane sekcje, potwierdzenia, pozostałe pytania i jawne utworzenie planu. Przejście zapisuje stan przed zmianą kroku; błąd pozwala ponowić. Przy zmianie kroku widok i fokus wracają na jego początek.

## Zmienione pliki

- `src/components/import-review.tsx`: własny przegląd, stan, zapis/publikacja, karty, grupy i trzy kroki.
- `src/components/review-{dialog,exercise-edit,series-edit,set-fields,group-edit,question-editor}.tsx`: dialog, ankieta i edycja na żądanie.
- `src/lib/imports/review.ts`: projekcja bloków, podpisy pól przeglądu, kolejność pytań, mutacje zachowujące metadata.
- `src/lib/imports/questions.ts`: stabilny cel po zmianie treningu; odpowiedź o konwencji przerwy unieważniają zmiany przerw, a przypisanie zmiany dnia.
- `src/components/import-workspace.tsx`: nowe osadzenie zamiast pełnego formularza, krótszy nagłówek zadania. `import-source.tsx`: wyłączenie fullscreen w dialogu, by nie nakładać kolejnego.
- `src/app/api/imports/[id]/route.ts`: opcjonalne metadata kroku/potwierdzeń w PATCH; zachowanie starego PATCH i kontroli właściciela.
- `src/app/globals.css`: karty, kroki, ankieta, podgląd źródła i układ mobilny.
- `src/lib/imports/review.test.ts`, `src/components/import-review.test.tsx`, `scripts/test-t07r1-browser.mjs`, rozszerzone HTTP test/runner. Starszy `test-t06r1-browser.mjs` odsyła do aktualnego przeglądu.
- `package.json`: `test:t07r1:http`. Bez nowych zależności ani migracji.
- README, STATUS, ROADMAP, UX, T06_IMPORT, DATA_MODEL, TESTING, DECISIONS(D023), CHANGELOG i ten handoff.

Ręczny `PlanEditor` i parser źródeł nie zostały przebudowane. Zachowane osobne rekordy serii nie są zmieniane przez samą projekcję widoku. Historia treningów i T09 pozostają poza zakresem.

## Kontrakt i zgodność

`review_data.progress` jest opcjonalnym obiektem `{ step: exercises|structure|summary, exercisesConfirmed: string|null, structureConfirmed: string|null }`. Potwierdzenia są sygnałem zgodności przejrzanych pól, nie podpisem bezpieczeństwa ani uprawnieniem. Tożsamość/kolejność zmienia oba potwierdzenia; parametry/grupy/uwagi — drugie. Tytuł planu nie unieważnia przeglądu ćwiczeń. Klucze są serializowane stabilnie, by JSONB nie resetowało potwierdzeń.

GET zachowuje korektę i metadata. PATCH odrzuca niepoprawny kształt i usuwa niezgodne potwierdzenia; starszy PATCH bez `progress` zachowuje etap i ponownie ocenia zgodność. Szkic bez etapu rozpoczyna pierwszy krok, bez usuwania dokumentu/odpowiedzi. Publikacja w UI wymaga obu potwierdzeń i rozwiązania pytań; serwer nadal sprawdza pola, właściciela i retry, z kompatybilnością starszych klientów.

Przy utracie odpowiedzi po wysłaniu publikacji kolejne zatwierdzenie pomija PATCH (już zatwierdzony import go odmawia) i używa tego samego ID operacji oraz payloadu. Zmiana dokumentu/odpowiedzi rozpoczyna nową operację. Podczas publikacji zmiany dokumentu są blokowane.

## Weryfikacja

Środowisko: lokalny macOS, Node 26.4.0, Next 16.4.0, prawdziwy lokalny Supabase Auth/PostgREST/Storage; Chrome headless, desktop 1440×1000 i viewport 390×844.

- `npm test`: **100 przeszło, 8 pominięto**, 20 plików aktywnych. Pominięcia to opt-in integracje i AI. Nowe testy obejmują bloki i braki, ID/uwagi/optional, właściwy cel rozszerzonego bloku, kolejność JSONB, przeniesienie ćwiczenia/odpowiedzi, potwierdzenia, formularz/cancel, zapis/error/retry, 55 pytań z jednym widocznym, ankietę, indywidualną serię, tworzenie/rozłączenie grupy i utratę odpowiedzi publikacji. Ostatni scenariusz jest mockiem sieci, nie rzeczywistym zerwaniem połączenia.
- `npm run build`: sukces końcowy; `npm run typecheck`: sukces sekwencyjnie po buildzie.
- `DO_NOT_TRACK=1 npm run test:t06:local`: **3/3**, rzeczywisty lokalny Auth/API/Storage, mock adaptera, bez API dostawcy. Nie resetowano dotychczasowych realnych prób/budżetu.
- `DO_NOT_TRACK=1 npm run test:t06r1:local`: sukces, zakresy/original/optional, retry, snapshot, zmiana wersji bez zmiany historii i A/B.
- `DO_NOT_TRACK=1 T07R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t07r1:http`: **sukces** produkcyjnego Next i HTTP/Chrome. HTTP sprawdza właściciela A/B/anon, source/grid/no-store, podpisany upload, błędne pliki, krok/reload, błędne metadata, stary PATCH, v1 i prawdziwe idempotentne zatwierdzenie syntetycznego planu.
- Chrome używa trzech rzeczywistych plików i zachowanych wyników `after-4` na własnych tymczasowych kontach. Sprawdzono brak otwartych formularzy, karty, blok/cancel, zachowanie ID/optional po zapisie, krok/reload/potwierdzenia, korektę przerwy w ankiecie, podgląd bez drugiego modala, wybory sprzętu/bazy kg, zmianę kolejności, testową odpowiedź na datę (2–3 i AMRAP), pytanie wspólnego zakresu oraz odkładanie dwóch Tabat. Sprawdzono 6 stron PDF/zoom/fullscreen, wszystkie arkusze/przekreślenie/dolne wiersze, fokus i mobile bez overflow. Brak błędów `pageerror`.

Prywatne zrzuty ocenione wizualnie: `/private/tmp/t07r1-cards-desktop.png`, `t07r1-cards-mobile.png`, `t07r1-edit-mobile.png`, `t07r1-survey-desktop.png`. Browser używa zapisanej odpowiedzi AI/czytnika; nie dowodzi nowej jakości modelu i nie publikuje prywatnych planów. Dane wpisane w testach są symulacją korekty, nie rozstrzygnięciem rzeczywistych niejasności źródła.

Pierwsze przebiegi wykryły błędy testów: składnia opcji selektorów, typy Testing Library, odczyt przed zakończeniem PATCH, założona kolejność pytań/liczba ćwiczeń. Poprawiono je i powtórzono związane sprawdzenia. Implementacja otrzymała stabilną serializację JSONB, powrót przewijania/fokusu po zmianie kroku, jawną pętlę Tab/Shift+Tab oraz poprawę retry po utracie odpowiedzi. Nie deklarujemy wcześniejszych przebiegów jako sukcesu.

## Decyzje i zmiany planu

D023 zapisuje wybory użytkownika: trzy kroki, źródło na żądanie, zakres tylko import i edycja całego bloku. Wydzielono T07-R1 z gotowymi zależnościami i zakończono lokalnie. Żadnych nowych płatnych wywołań AI importu; brak zmian budget/kluczy, migracji domeny lub publikacji danych. T09 nadal `review`; T10/T11 nie rozpoczęto.

## Ograniczenia i następny krok

Uzgodniony zakres T07-R1 jest zakończony; brak kolejnego zadania w tym zleceniu. Użytkownik może przejrzeć nowe karty i rozstrzygnąć źródłowe niejasności przed świadomą publikacją. Nie zgadujemy protokołu Tabata, daty ani przypisania EMOM. Ograniczenia parsera i kosztów poprzednich prób pozostają w T06-R1.

Nie wykonano fizycznego telefonu, Safari/iPhone, hostingu ani obciążenia. Widok mobilny to Chrome viewport, nie test sprzętu. Przed T10 należy rozstrzygnąć kryterium/status T09; poza zakresem tej sesji.

## Stan środowiska

Testowy Next 3006 i Chrome zakończone przez runner; lokalny Supabase pozostaje uruchomiony. Tymczasowe konta/obiekty nowych regresji i przeglądarki usunięto, zachowano wcześniejsze rzeczywiste próby i prywatne fixtures. Nie zmieniano sekretów ani `.env`; nie wykonano nowych prób AI ani push. Nie powstały worktree ani procesy innych agentów. Zrzuty są w `/private/tmp`, bez publikacji.

## Prompt dla kolejnego agenta

Rekomendacja dla złożonej dalszej pracy: **gpt-6.1-sol, high**, oszczędniejszy wybór niż Astra dla UI i stanu korekty. Brak następnego zadania: prompt przekazuje stan, nie zleca nowej implementacji.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. T07-R1 ukończone lokalnie; brak kolejnego zadania w uzgodnionym zakresie. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-13-T07-R1-przeglad-importu.md oraz wskazane specyfikacje UX/importu/danych, DECISIONS, TESTING i WORKFLOW. Nie uruchamiaj innych agentów ani nowych zadań bez zlecenia. Przegląd importu ma trzy kroki, kompaktowe karty, edycję bloków i ankietę; ręczny edytor pozostał dotychczasowy. Nie publikuj prywatnych fixtures i nie uruchamiaj płatnych prób AI rutynowo. Fizyczne urządzenia i hosting niesprawdzone; T09 nadal review. Po nowym zleceniu zaktualizuj dokumentację, handoff i identyczny prompt. Rekomendowany model: gpt-6.1-sol, high — UI i stan korekty przy niższym koszcie niż Astra.
```

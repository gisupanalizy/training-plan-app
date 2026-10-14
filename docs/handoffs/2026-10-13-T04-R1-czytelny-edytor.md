# Handoff — T04-R1 — czytelny ręczny edytor planu

- Data/autor: 2026-10-13, Codex. Bez innych agentów.
- Zadanie/status: T04-R1 `done` lokalnie; zależności T04/T06-R1/T07-R1 spełnione.
- Git: katalog nie jest repozytorium Git. Zmiany lokalne, bez commit/push/publikacji.
- Poprzedni punkt wejścia: [T07-R1](2026-10-13-T07-R1-przeglad-importu.md).

## Cel i wykonana praca

Na jawne zlecenie użytkownika przebudowano ręczne tworzenie i edycję nowych wersji planów. Edytor pokazuje jeden trening wybrany z listy tydzień/dzień/liczba ćwiczeń, kompaktowe karty i podgląd całości ze zwijanymi treningami. Można przejść do konkretnego treningu lub ćwiczenia. Superserie mają wspólną ramkę. Bloki zachowują różne cele, użyte tempo/RPE/RIR, opcjonalność i jawne braki; uwagi ćwiczenia/serii mają skrót oraz pełną treść na żądanie.

Ćwiczenie edytuje się w oknie: prywatny katalog, nazwa, wariant/sprzęt, przypisanie i uwagi. Serie domyślnie edytują wskazany blok; można przełączyć się na pojedynczą serię lub dodać nowy blok. Podstawowe pola obejmują liczbę serii, cel, obciążenie i przerwę. Pojedyncza wartość ma jedno pole; istniejący zakres jest rozwinięty, nowy dodaje się przyciskiem. Cel/obciążenie odsłaniają właściwe pola, podstawę hantli pokazuje sprzęt lub zapisany parametr. Tempo/RPE/RIR/rodzaj/uwagi/opcjonalność są na żądanie. Istniejący złożony cel nie znika przy zmianie innego pola.

Walidacja formularza obejmuje fragment; inna nieukończona pozycja szkicu nie blokuje jego zastosowania. Publikacja waliduje cały dokument i wskazuje niekompletny trening. Anulowanie/Escape/zamknięcie odrzucają roboczy formularz, a dodawanie nie pozostawia pustej pozycji. Usunięcie ćwiczenia/treningu wymaga potwierdzenia. Kolejność treningu jest stosowana wraz z nazwą/uwagami. Przeniesienie ostatniego ćwiczenia zostawia jawnie pusty trening do uzupełnienia/usunięcia, bez cichego kasowania jego notatek.

Dialog jest modalny na desktopie i pełnoekranowy na telefonie, z powrotem fokusu. Dyktowanie jest w osobnym oknie; propozycja wymaga świadomego dodania i osobnej publikacji. Nowe ID korekty propozycji zapobiegają kolizjom ze szkicem. Pasek pokazuje niezapisane zmiany; na telefonie nie jest przyklejony, żeby nie zasłaniać kart. Ostrzeganie obejmuje zmieniony szkic/formularz, link wyjścia i beforeunload, a Chrome dodatkowo Navigation API dla Wstecz. Sam odczyt okna nie wywołuje ostrzeżenia. Trwały autosave nie został dodany.

Zapis blokuje edycję i zachowuje pełny payload oraz ID operacji na retry. Zmiana dokumentu rozpoczyna nową operację. API `/api/plans`, właściciel, wersje, dane i snapshoty nie zmieniły kontraktu. Nie dodano migracji ani zależności. Import zachowuje własne trzy kroki; zachowana została także gałąź zgodności starszego klienta importu w PlanEditor. T09 poza zakresem i nadal `review`.

## Zmienione pliki

- [plan-editor.tsx](../../src/components/plan-editor.tsx): wybór kompaktowego edytora dla ręcznej ścieżki, zachowana starsza gałąź importu.
- [compact-plan-editor.tsx](../../src/components/compact-plan-editor.tsx): karty/nawigacja/podgląd/dialogi, organizacja, głos, stan zmian, zapis/retry.
- [plan-edit-dialogs.tsx](../../src/components/plan-edit-dialogs.tsx): ćwiczenie, trening i serie z roboczą kopią oraz walidacją fragmentu.
- [plan-set-fields.tsx](../../src/components/plan-set-fields.tsx): pola zależne od celu, zakresy i parametry dodatkowe.
- [compact-editor.ts](../../src/lib/domain/compact-editor.ts): walidacja fragmentu, liczniki serii i etykiety użytych parametrów.
- [globals.css](../../src/app/globals.css): układ kart, zakresów, przycisków i paska zapisu; wykorzystano istniejący dialog.
- [compact-plan-editor.test.tsx](../../src/components/compact-plan-editor.test.tsx): 22 scenariusze ręcznego edytora; aktualizacja plan-editor.test.tsx i plan-voice.test.tsx do edycji w oknach.
- [run-local-t04r1-http.mjs](../../scripts/run-local-t04r1-http.mjs), [test-t04r1-browser.mjs](../../scripts/test-t04r1-browser.mjs), package.json: odtwarzalny syntetyczny odbiór Chrome przez lokalny Supabase i produkcyjny Next.
- README, STATUS, ROADMAP, UX, DATA_MODEL, T06_IMPORT, TESTING, DECISIONS(D024), CHANGELOG i ten handoff.

## Weryfikacja

Środowisko: lokalny macOS, Node 26.4.0, Next 16.4.0, rzeczywisty lokalny Supabase Auth/PostgREST, Chrome headless (channel chrome), desktop 1440×1000 i viewport 390×844.

- `npm test`: **122 przeszło, 8 pominięto**, 21 aktywnych plików, 5 opt-in pominiętych. Nowy plik ma 22 scenariusze: karty i podgląd, blok/pojedyncza seria, ID/uwagi/źródła, złożone cele i zakresy, opcjonalność, katalog/przeniesienie, fragment przy pustym drugim dniu, anulowanie, AMRAP/czas/dystans/asysta/hantle/%1RM/dodatkowy ciężar, zero/null, kolejność dnia, retry/blokada/konflikt i ostrzeganie oraz checkboxy superserii. Głos w teście jest mockiem i nie publikuje planu samoczynnie. Pełna istniejąca suite obejmuje również wcześniej zachowany audyt źródeł importu; nowy odbiór Chrome ma tylko syntetyczne dane.
- `DO_NOT_TRACK=1 npm run test:t04:local`: **sukces**, prawdziwy Auth/PostgREST, A/B/anon, rampa, superseria, retry, nowe wersje, niezmienność starych serii i datowanych 1RM.
- `DO_NOT_TRACK=1 T04R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t04r1:http`: **sukces końcowy**. Runner buduje produkcyjny Next, serwer 3008; import AI i głos wyłączone. Moduł Playwright z runtime desktopowego, bez zależności aplikacji.
- Chrome użył własnego syntetycznego konta/planu. Sprawdził brak formularzy serii na starcie, zakresy i zamknięte dodatkowe pola, cancel/Escape i fokus, katalog/przeniesienie, podgląd innego treningu, tworzenie/rozłączenie superserii, fullscreen i brak mobilnego overflow oraz pojedynczą serię. Publikacja idzie przez prawdziwy HTTP/RPC: Playwright odrzucił odpowiedź po udanym zapisie, retry wysłało identyczny payload i stworzyło tylko jedną nową wersję. Odczyt bazy porównał wszystkie stare serie oraz snapshoty rozpoczętego treningu — bez zmian. IDs i indywidualne uwagi zachowane. Nowy szkic pozwolił zastosować ćwiczenie przy pustej drugiej pozycji, a pełna publikacja odmówiła. Brak błędów pageerror.
- `DO_NOT_TRACK=1 npm run test:t07r1:http`: **sukces**, produkcyjny Next 3006, lokalny Auth/API/Storage, syntetyczne źródła i szkic mockowy. A/B/anon, prywatne źródło, korekta/reload, metadata, starszy PATCH, formaty i retry zatwierdzenia. Bez modułu klikalnego odbioru prywatnych źródeł; nie wywołano AI.
- `npm run build`: **sukces** w końcowym runnerze; `npm run typecheck`: **sukces sekwencyjnie po końcowym buildzie**.
- Sprawdzono lokalne linki wszystkich zmienionych dokumentów: sukces. ROADMAP ma T04-R1 done, T09 review oraz T10/T11 todo; porty 3006/3008 bez nasłuchu po testach.
- Zrzuty syntetycznego Chrome w `/private/tmp/t04r1-cards-desktop.png`, `t04r1-cards-mobile.png`, `t04r1-edit-mobile.png` oceniono wizualnie. Mobilny pasek zapisu początkowo zasłaniał karty — usunięto przyklejenie na telefonie i powtórzono Chrome. Desktop i pełnoekranowy formularz mobilny są czytelne, bez poziomego overflow.

Pierwsze przebiegi testów miały błędne oczekiwania tekstowej wartości input, opcję exact z API Playwright w Testing Library, odwołanie do przycisku w zwiniętym treningu i brak nazwy nowego planu w scenariuszu. Poprawiono i powtórzono. Nowy test porównał też undefined/false opcjonalności; edycja pojedynczej serii zachowuje niezmienione metadata. Późniejszy Chrome wykrył rzeczywistą regresję checkboxów superserii po aktualizacji ostrzeżenia w fazie capture; naprawiono obsługę zdarzeń, dodano test i ponowiono cały odbiór z sukcesem. Nie przedstawiamy wcześniejszych przebiegów jako zaliczonych.

Pierwsze T04/Chrome nie miały dostępu do socketu Dockera w sandboxie. Ponowienie z uprawnieniem przeszło; automatyczny przegląd zatwierdził lokalne testy. Brak nowych płatnych prób AI, nowych nagrań, publikacji prywatnych fixtures, zmian budżetów lub sekretów.

## Decyzje i zmiany planu

D024 zapisuje uzgodnione rozszerzenie na ręczny edytor po D023, które dotyczyło tylko importu. Dodano T04-R1 po gotowych T04/T06-R1/T07-R1 i zakończono lokalnie. Zachowano wcześniejsze ID/zależności. README i STATUS wskazują ten handoff jako najnowszy. T09 pozostaje `review`; T10/T11 nie rozpoczęto.

## Ograniczenia i następny krok

Uzgodniony zakres T04-R1 jest zakończony; brak kolejnego zadania w tym zleceniu. Następny krok użytkownika: przejrzeć nowy ręczny edytor i przekazać ewentualne nowe zlecenie. Przed T10 należy rozstrzygnąć kryterium/status T09.

Nie wykonano fizycznego telefonu, Safari/iPhone, hostingu, obciążenia ani nowej oceny AI. Viewport Chrome nie jest odbiorem urządzenia. Wstecz przez Navigation API sprawdzono implementacyjnie; test Chrome sprawdził odrzucone wyjście linkiem, fokus i Escape, nie rzeczywisty gest Wstecz. Safari bez Navigation API wymaga osobnego odbioru nawigacji. Nie dodano trwałego autosave: odświeżenie/opuszczenie potwierdzone przez użytkownika może odrzucić niezapisany szkic.

## Stan środowiska

Runnery zakończyły serwery 3008/3006 i Chrome; porty nie mają nasłuchu po odbiorze. Tymczasowe konta wraz z nowymi obiektami usunięto w finally również po nieudanych przebiegach. Lokalny Supabase pozostał uruchomiony. Nie usuwano wcześniejszych realnych prób ani danych użytkownika. Zrzuty pozostały w /private/tmp, bez publikacji. Nie zmieniano .env/kluczy, nie powstał worktree i nie uruchomiono agentów.

## Prompt dla kolejnego agenta

Rekomendacja: **gpt-6.1-sol, high** — oszczędniejszy niż Astra dla UI i stanu formularzy. Brak kolejnego zadania: prompt przekazuje stan, nie uruchamia pracy.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. T04-R1 ukończone lokalnie; brak kolejnego zadania w uzgodnionym zakresie. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-13-T04-R1-czytelny-edytor.md oraz UX, DATA_MODEL, T06_IMPORT, DECISIONS, TESTING i WORKFLOW. Ręczny edytor nowych i istniejących planów ma jeden trening, podgląd całości, kompaktowe karty i okna edycji bloków/pojedynczych serii; zakresy i dodatkowe pola są na żądanie. Zapis publikuje całą wersję, retry zachowuje payload, nie ma trwałego autosave. Import zachowuje trzy kroki T07-R1. Nie uruchamiaj innych agentów ani nowych zadań bez zlecenia. Nie publikuj prywatnych fixtures i nie uruchamiaj płatnych prób AI rutynowo. Testy T04-R1 używają danych syntetycznych; fizyczne urządzenia, Safari i hosting niesprawdzone. T09 nadal review; przed T10 potrzebne rozstrzygnięcie jego kryterium. Po nowym zleceniu zaktualizuj dokumentację, handoff i identyczny prompt. Rekomendowany model: gpt-6.1-sol, high — UI i stan formularzy przy niższym koszcie niż Astra.
```

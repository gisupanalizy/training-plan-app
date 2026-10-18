# Handoff — T13-P — podział uzgodnionego planu na A–E

- Data i autor: 2026-10-17, Codex, bez innych agentów.
- Zadanie/status po sesji: T13-P done — podział i kontrakty dokumentacyjne ukończone po kontrolach. T13/A–E pozostają todo, bez implementacji.
- Branch/commit/stan: main, HEAD na wejściu `c144213`; na wejściu brak zmian roboczych. Dokumentacja bieżącej sesji lokalna, bez commit/push.
- Wcześniejszy rzeczywisty [handoff T11](2026-10-16-T11-prototyp-auth-ai.md). Plan źródłowy: chat „Opisz możliwości aplikacji”, ID i tura zapisane w [specyfikacji](../T13_MOBILE_WORKOUT.md).

## Cel i wykonana praca

Odczytano AGENTS, README, STATUS, ROADMAP, wskazany handoff i WORKFLOW, właściwe specyfikacje i DECISIONS. Ponieważ lokalne pliki nie zawierały T13, przez list_threads/read_thread odczytano uzgodniony plan z wcześniejszego chatu. Niczego do niego nie wysłano. Początkowe pytanie o źródło przestało być potrzebne po odnalezieniu pełnego planu. Pierwsze read_thread z parametrami ponad limit zwróciło walidację; ponowiono w dopuszczalnych limitach i przefiltrowano istotne wpisy/plan, bez uruchamiania chatu.

Zachowano pełny zakres w R01–R16, rozpisano A → B → C → D → E, zależności, jednego integratora i wyłączne pliki z przekazywaniem wspólnych stylów. A–D przechodzą review/bramki; E jest niezależnym odbiorem, ręcznie zlecanym innemu recenzentowi. Dodano pięć odrębnych promptów i pięć kart przyszłych handoffów, jawnie szablonów. Nie są dowodami wykonania etapów. Nie uruchomiono agentów ani implementacji.

Rozstrzygnięto projekt techniczny przed przyszłym kodem: trwałe usunięcie wykonania z zachowaniem minimalnych receipts/śladu, 410 dla późnych start/save po usunięciu, ten sam sukces retry delete, atomowe replace i rollback; korekta metadanych czasu przy finish oddzielona od niezmiennej snapshot_on i wszystkich celów/1RM. Legacy bez zgadywania godziny, wiele zastanych sesji bez automatycznego kasowania. Projekt wymaga realnej migracji i testów w A; niczego tu nie zastosowano.

## Zmienione pliki

- [T13_MOBILE_WORKOUT](../T13_MOBILE_WORKOUT.md) — pełny zakres, kontrakty, właściciele, bramki i przekazanie.
- [Prompty A](../prompts/T13-A.md), [B](../prompts/T13-B.md), [C](../prompts/T13-C.md), [D](../prompts/T13-D.md), [E](../prompts/T13-E.md).
- [Karty handoffów A](planned/T13-A.md), [B](planned/T13-B.md), [C](planned/T13-C.md), [D](planned/T13-D.md), [E](planned/T13-E.md) — wyłącznie materiały przyszłych sesji.
- [README](../../README.md), [STATUS](../STATUS.md), [ROADMAP](../ROADMAP.md) — bieżący punkt wejścia i zadania.
- [DECISIONS](../DECISIONS.md), [CHANGELOG](../CHANGELOG.md), [OPEN_QUESTIONS](../OPEN_QUESTIONS.md) — D033/D034, powód podziału i brak nierozstrzygnięcia delete/datowania na poziomie dokumentacji.
- [PRODUCT](../PRODUCT.md), [UX](../UX.md), [DATA_MODEL](../DATA_MODEL.md), [ARCHITECTURE](../ARCHITECTURE.md), [TESTING](../TESTING.md) — odnośniki do planowanego zakresu, bez opisywania go jako wdrożonego.
- Ten handoff. Bez zmian źródeł aplikacji, migracji, konfiguracji lub skryptów.

## Weryfikacja

- `python3 /private/tmp/check-t13-docs.py` — PASS: 23 zmienione/nowe pliki Markdown, 184 lokalne linki, komplet R01–R16, pięć promptów, pięć kart szablonowych; zgodność promptu przekazania z lokalną kopią dla odpowiedzi końcowej. Skrypt sprawdził też ogrodzenia bloków, końcowe spacje i brak zmian poza README/docs.
- `git diff --check` — PASS. Sprawdzono także nowe pliki skryptem powyżej, ponieważ diff bez indeksowania ich nie obejmuje.
- Przegląd semantyczny oryginalnego planu i R01–R16: zachowane wybór pierwszego/ostatniego treningu, brak wymuszenia tygodni, indywidualne warianty/uwagi, jedna seria i superserie, formularze/szkice/głos, wszystkie działania aktywnej sesji i legacy, atomowość/delete/retry, godziny/korekta i kalendarz, mobile/dostępność oraz niezależny odbiór. Rozdzielono projekt od wykonania. Zależności bez cyklu review/done, jeden aktualny właściciel pliku.

Nie uruchamiano npm test/build/typecheck, lokalnego ani zdalnego API, aplikacji, płatnego AI lub testów urządzeń: nie zmieniono kodu; WORKFLOW dopuszcza dla dokumentacji kontrolę spójności/linków. Dawne pomiary mobilne przytoczono wyłącznie jako historię poprzedniego chatu, nie nowe dowody.

## Decyzje i zmiany planu

D033: utrwalenie pełnego uzgodnionego zakresu i organizacji. D034: przyjęty projekt kontraktów technicznych, niewdrożony. T13-P przeszło in_progress → done po kontroli dokumentacji; A–E todo i bez wykonawców. Dotychczasowe T01–T12 i ich zależności zachowano; T11 review, fizyczny T10-R1 nadal otwarty. Powód: kosztowo oszczędna praca etapami z zachowaniem spójnych kontraktów.

## Pozostała praca i blokery

Dokumentacja nie ma blokera po odnalezieniu źródłowego planu. T13-A–E niewykonane; rozpoczęcie implementacji wymaga osobnego zlecenia użytkownika, jak stanowi bieżące polecenie i AGENTS. A ma sprawdzić szczegóły migracji FK/triggerów i kompatybilność na lokalnej bazie. Dostępności lokalnego środowiska nie sprawdzano; jego brak uniemożliwi odpowiedni odbiór, nie zastąpi go mock. Nie przesuwać infrastruktury T11 ani nie odnawiać budżetu AI.

## Następny krok

Po osobnym zleceniu tylko T13-A; pierwszy krok: przegląd kontraktu A ze stanem API/SQL i przyjęcie własności plików, potem implementacja i bramka lokalna. [Pełny prompt A](../prompts/T13-A.md). Nie przechodzić automatycznie do B.

## Stan środowiska

Nie uruchomiono ani nie zatrzymano serwerów/procesów aplikacji, nie zmieniono lokalnej bazy lub usług. Nie pobrano sekretów i nie wykonywano uploadu. Wszystkie zmiany bieżącej pracy to pliki Markdown w repo. Pomocniczy `/private/tmp/t13-next-prompt.txt` zawiera tylko poniższy prompt; kontrola dokumentacji korzysta z lokalnego skryptu w tmp. Bez commit/push.

## Prompt dla kolejnego agenta

Rekomendacja użytkownika: GPT-6.1 Sol / high dla A/C/E; medium dla B/D po gotowych kontraktach oszczędza koszt. Poniższy prompt jest do ręcznego użycia; zapis nie uruchamia pracy.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy.
Po osobnym zleceniu implementacji wykonaj tylko T13-A — sesje/API/datowanie. Zacznij od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/WORKFLOW.md i docs/handoffs/2026-10-17-T13-podzial-etapow.md. Przeczytaj docs/prompts/T13-A.md, docs/T13_MOBILE_WORKOUT.md oraz DECISIONS, DATA_MODEL i TESTING.
Sprawdź kontrakt na rzeczywistych FK/triggerach/receipts, następnie wdroż globalną kontrolę aktywnej sesji, atomowe zastąpienie, trwałe usuwanie odporne na późny retry, spójny GET i korektę daty bez zmiany historycznych celów/1RM. Kryteria: pełna bramka A, lokalne A/B/anon, concurrency/rollback/retry/legacy, niezmienność snapshotów, adekwatne regresje, build i typy. Warunki: osobne zlecenie użytkownika i dostępne lokalne środowisko DB/API; brak środowiska zapisz jako bloker odbioru. Jeden integrator, pliki według przydziału A. Bez innych agentów, etapu B, produkcji i płatnego AI. Zaktualizuj dokumentację, utwórz rzeczywisty handoff i identyczny prompt następnej sesji w handoffie oraz odpowiedzi.
Model: GPT-6.1 Sol / high — trwałość danych i transakcje wymagają dokładności; ograniczenie do A pomaga kontrolować koszt.
```

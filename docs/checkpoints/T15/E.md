# Checkpoint T15-E — Postęp

- Data: 2026-10-18; właściciel `/root/progress`, integrator `/root`.
- Status: in_progress po przyjęciu bramki A przez I; gałąź codex/t15-ui, baza51ea3b4. Bez własnych commitów.
- Wyłączność: src/app/postep/page.tsx, src/lib/progress/**, src/components/progress/**, scripts/test-t15e-api.mjs, scripts/test-t15e-browser.mjs, ten checkpoint i rzeczywisty handoff E.
- Kontrakt: docs/T15_PROGRESS_CONTRACT.md, D045/reference-table-v1. Stary getProgress(from,to) zachowa filtrowane entries/sessions, nowa analityka jest all-time. Bez API/SQL/profilu/globali.

## Wykonano

Preflight specyfikacji, rzeczywistego T13-A i kodu. Snapshoty czasu, rodzaju zadania i bodyweight istnieją w bazie. Impeccable context uruchomiony raz; kierunek Noc/R4/R5 jest zatwierdzony i pozostaje obowiązujący. Nie zmieniano dokumentów kontekstu Impeccable.

## Implementacja i czyste testy

Dodano analytics.ts/ranges.ts z reference-table-v1, kwalifikacją snapshotów, null/0, remisami, źródłowymi ID i jednym punktem workout+exercise. Repozytorium stronicuje pełny zbiór, a entries/sessions T08 filtruje dopiero po odczycie; analytics jest all-time. Postęp ma pełny klient R4/R5: dropdown/metryki, rzeczywiste punkty i dostępne44px cele, pomoc, tooltip wyłącznie punktu, zakres pod osią, gesty/alternatywy, PR/swipe i szczegóły źródeł. Stara historia w section[data-progress-history=true], .progress-volume zachowane.

`npx vitest run src/lib/progress/analytics.test.ts src/lib/progress/repository.test.ts src/lib/progress/summary.test.ts src/components/progress/progress-dashboard.test.tsx`: PASS28/4 pliki. Pierwsze uruchomienie27pass/1fail wykazało że dawny rdzeń regex hantel nie rozpoznaje „hantle”; nowy agregator uwzględnia oba. Powtórka28pass. Mock repo sprawdza601 sesji,501 katalogu i >500 dzieci, właściciela oraz niezależne zakresy; nie jest dowodem prawdziwego API. UI testuje klik/outside/Escape, brak otwarcia focus/pusty wykres, zakres, źródła i pomoc. Źródła E zamrożono dla pierwszego zintegrowanego builda I.

## Weryfikacja i następny krok

Pisanie własnych runnerów realnego API/Chrome; oczekiwanie na kolejkę I. Nie uruchamiano jeszcze DB/Chrome E ani builda/typów przez E. Fizyczny telefon/Safari poza lokalnym odbiorem. Serwer3005 po A zastany, nie zmieniany przez E. Globalne dokumenty i kontrakty pod I.

## Bramka częściowa — realne API i poprawki review I

- `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15e-api.mjs`: PASS, rzeczywiste lokalne Auth/PostgREST/Next3005.505 sesji,503 katalogu,>500 dzieci obu rodzajów, rekordy poza filtrem,1302kg niezależnie policzonej dużej sesji, źródła, dwa bloki→jeden punkt, korekta250kg i zgodność snapshotów/rzeczywistego1RM150kg, izolacjaA/B/anon. Własne dwa konta sprzątnięte w finally. Pierwsza próba w sandboxie odmówiła Docker socket; po eskalacji test przeszedł. Nie stosowano migracji.
- I wykonał build po pierwszej korekcie błędu typów `exact` w ByRoleOptions. Pierwszy buildFAIL, kolejnyPASS. I wykonał także T08 HTTP/API940→1140 z adaptacją asercji do section[data-progress-history=true].
- Po review I: aktywacja klawiaturą detail0 omija blokadę poprzedniego drag; UUID usunięty z głównego dymku; dodano domyślnie zwinięty wybór każdego rzeczywistego punktu przy nakładających się współrzędnych. Nie zmieniono dat/wartości. Zakresy pozostają bezpośrednio pod osią.
- Czyste testy po poprawkach:29PASS/4 pliki. Syntax obu runnerówPASS. Browser runner przygotowany, jeszcze nie wykonany. API runner po dodaniu nowego markera data-chart-point wymaga powtórki na nowym buildzie; poprzedniPASS dotyczy wersji sprzed listy punktów.
- Źródła E ponownie zamrożone dla rebuilda I; potem kolejkaB Chrome, następnie E API/Chrome. Nie deklarować odbioru UI przed jego wykonaniem. Bieżący serwer3005 prowadzi I; E go nie uruchamia ani nie zatrzymuje.

## Stan po przerwanym oczekiwaniu narzędzia

- Po rebuildzie I ponowiono dokładnie powyższe polecenie API na nowym markerze data-chart-point: PASS505/503/>500,3,6s. To aktualny dowód API; nie wymaga trzeciej powtórki bez zmian funkcjonalnych.
- Próba `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15e-browser.mjs` w sandboxie: odmowa dostępu Docker socket. Następna próba require_escalated pozostała w oczekiwaniu na approval i została przerwana po220s. Runner Chrome nie wystartował; brak raportu/zrzutów i brak wyniku UI. Nie był to PASS ani wykonany test.
- I sprawdził procesy: brak runnerów E. Kolejka zwolniona do rebuilda B; E nie uruchamia DB/Chrome bez ponownego przydziału I. Źródła pozostają zamrożone. Następny krok: po przydziale I wykonać Chrome z wymaganym uprawnieniem, obejrzeć zrzuty i naprawić rzeczywiste błędy, potem handoff.

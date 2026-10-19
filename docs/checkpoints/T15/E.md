# Checkpoint T15-E — Postęp

- Aktualizacja:2026-10-19; wykonawca `/root/progress`, integrator `/root`.
- Status: review, lokalna bramka E przyjęta przez I2026-10-19 po raporcie i oględzinach. Gałąź codex/t15-ui; źródła E zachowane przez I w99433b8, B w60fcf41. Bez commitów wykonawcy.
- Zwolnienie: cała własność E oddana I — src/app/postep/page.tsx, src/lib/progress/**, src/components/progress/**, scripts/test-t15e-api.mjs, scripts/test-t15e-browser.mjs, checkpoint i handoff E. Brak aktywnego runnera lub blokady kolejki E.
- Kontrakt: docs/T15_PROGRESS_CONTRACT.md, D045/reference-table-v1. Stary getProgress(from,to) zachowa filtrowane entries/sessions, nowa analityka jest all-time. Bez API/SQL/profilu/globali.

## Końcowy odbiór lokalny — 2026-10-19

I wykonał `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15e-browser.mjs` poza sandboxem; sesja97754 exit0. Raport /private/tmp/t15e-browser-report.json potwierdza15 stanów360/390/430px (3 metryki kg i2 masy ciała),44px cele i zwykłe kliknięcia, klawiaturę/Enter/Escape, drag→klik oraz drag→focus→Enter, pomoc, pinch i pierwszy tap po pinch, PR swipe134→0px, własne daty i rzeczywistą korektę. Runner sprawdza osobny wybór identycznych legacy punktów myszą/tapem. errors=[]. Cleanup Chrome i własnych kont w finally.

Wykonawca E odczytał raport i obejrzał zbiorczo zrzuty /private/tmp/t15e-progress-390.png, t15e-bodyweight-390.png i t15e-progress-desktop.png: czytelna Noc, zgodny układ metryk/osi/zakresów, jawne0kg i powtórzenia, zwinięty wybór punktów; bez wykrytego defektu wymagającego zmiany E. Bez nowych testów lub zmian źródeł po wznowieniu19.10. Czyste29PASS/4pliki oraz rzeczywiste API505/503/>500 i build/typy I pozostają aktualnymi dowodami. Fizyczny telefon/Safari niewykonane, G jeszcze niezależny po A–F.

Następny krok: I zapisuje domknięcie E i kontynuuje gotowe T15-D/T13-D zgodnie z przydziałami; gotowy prompt w handoffie. Historia poniżej zachowuje rzeczywiste wcześniejsze błędy i oczekiwania, nie opisuje bieżącego blokera.

## Wykonano

Preflight specyfikacji, rzeczywistego T13-A i kodu. Snapshoty czasu, rodzaju zadania i bodyweight istnieją w bazie. Impeccable context uruchomiony raz; kierunek Noc/R4/R5 jest zatwierdzony i pozostaje obowiązujący. Nie zmieniano dokumentów kontekstu Impeccable.

## Implementacja i czyste testy

Dodano analytics.ts/ranges.ts z reference-table-v1, kwalifikacją snapshotów, null/0, remisami, źródłowymi ID i jednym punktem workout+exercise. Repozytorium stronicuje pełny zbiór, a entries/sessions T08 filtruje dopiero po odczycie; analytics jest all-time. Postęp ma pełny klient R4/R5: dropdown/metryki, rzeczywiste punkty i dostępne44px cele, pomoc, tooltip wyłącznie punktu, zakres pod osią, gesty/alternatywy, PR/swipe i szczegóły źródeł. Stara historia w section[data-progress-history=true], .progress-volume zachowane.

`npx vitest run src/lib/progress/analytics.test.ts src/lib/progress/repository.test.ts src/lib/progress/summary.test.ts src/components/progress/progress-dashboard.test.tsx`: PASS28/4 pliki. Pierwsze uruchomienie27pass/1fail wykazało że dawny rdzeń regex hantel nie rozpoznaje „hantle”; nowy agregator uwzględnia oba. Powtórka28pass. Mock repo sprawdza601 sesji,501 katalogu i >500 dzieci, właściciela oraz niezależne zakresy; nie jest dowodem prawdziwego API. UI testuje klik/outside/Escape, brak otwarcia focus/pusty wykres, zakres, źródła i pomoc. Źródła E zamrożono dla pierwszego zintegrowanego builda I.

## Historyczny stan przed runnerami — 2026-10-18

Pisanie własnych runnerów realnego API/Chrome; oczekiwanie na kolejkę I. Nie uruchamiano jeszcze DB/Chrome E ani builda/typów przez E. Fizyczny telefon/Safari poza lokalnym odbiorem. Serwer3005 po A zastany, nie zmieniany przez E. Globalne dokumenty i kontrakty pod I.

## Historia bramki częściowej — realne API i poprawki review I

- `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15e-api.mjs`: PASS, rzeczywiste lokalne Auth/PostgREST/Next3005.505 sesji,503 katalogu,>500 dzieci obu rodzajów, rekordy poza filtrem,1302kg niezależnie policzonej dużej sesji, źródła, dwa bloki→jeden punkt, korekta250kg i zgodność snapshotów/rzeczywistego1RM150kg, izolacjaA/B/anon. Własne dwa konta sprzątnięte w finally. Pierwsza próba w sandboxie odmówiła Docker socket; po eskalacji test przeszedł. Nie stosowano migracji.
- I wykonał build po pierwszej korekcie błędu typów `exact` w ByRoleOptions. Pierwszy buildFAIL, kolejnyPASS. I wykonał także T08 HTTP/API940→1140 z adaptacją asercji do section[data-progress-history=true].
- Po review I: aktywacja klawiaturą detail0 omija blokadę poprzedniego drag; UUID usunięty z głównego dymku; dodano domyślnie zwinięty wybór każdego rzeczywistego punktu przy nakładających się współrzędnych. Nie zmieniono dat/wartości. Zakresy pozostają bezpośrednio pod osią.
- Czyste testy po poprawkach:29PASS/4 pliki. Syntax obu runnerówPASS. Browser runner przygotowany, jeszcze nie wykonany. API runner po dodaniu nowego markera data-chart-point wymaga powtórki na nowym buildzie; poprzedniPASS dotyczy wersji sprzed listy punktów.
- Źródła E ponownie zamrożone dla rebuilda I; potem kolejkaB Chrome, następnie E API/Chrome. Nie deklarować odbioru UI przed jego wykonaniem. Bieżący serwer3005 prowadzi I; E go nie uruchamia ani nie zatrzymuje.

## Historia przerwanego oczekiwania narzędzia — 2026-10-18

- Po rebuildzie I ponowiono dokładnie powyższe polecenie API na nowym markerze data-chart-point: PASS505/503/>500,3,6s. To aktualny dowód API; nie wymaga trzeciej powtórki bez zmian funkcjonalnych.
- Próba `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15e-browser.mjs` w sandboxie: odmowa dostępu Docker socket. Następna próba require_escalated pozostała w oczekiwaniu na approval i została przerwana po220s. Runner Chrome nie wystartował; brak raportu/zrzutów i brak wyniku UI. Nie był to PASS ani wykonany test.
- I sprawdził procesy: brak runnerów E. Kolejka zwolniona do rebuilda B; E nie uruchamia DB/Chrome bez ponownego przydziału I. Źródła pozostają zamrożone. Następny krok: po przydziale I wykonać Chrome z wymaganym uprawnieniem, obejrzeć zrzuty i naprawić rzeczywiste błędy, potem handoff.

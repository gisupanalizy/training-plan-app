# T15 — pełne zlecenie dla integratora Codex CLI

Szablon do użycia po wklejeniu przez użytkownika promptu startowego. Samo przygotowanie tego pliku nie zleca implementacji. A–G w momencie jego napisania pozostają todo. [Ocena CLI](../handoffs/2026-10-18-T15-U-delegowanie-i-limity.md), [plan](../T15_UI_IMPLEMENTATION.md).

## Zlecenie i autonomia

Zrealizuj pełną lokalną implementację **T15-A–G** w `/Users/jakub.olech/GIT/apka-plan-treningowy`, zgodnie z wybranymi makietami i kryteriami planu. Jesteś jednym integratorem I. Użyj subagentów do odrębnych zakresów; maksymalnie **dwóch aktywnych wykonawców jednocześnie w całym zespole**, poza Tobą. Nie deleguj dalej przez wykonawców. To zgoda na kodowanie, lokalne testy, naprawy, integrację i przechodzenie do gotowych etapów bez osobnego polecenia użytkownika dla każdego A/B/C/D/E/F/G.

W odniesieniu do tego zlecenia zbiorcza zgoda zastępuje wcześniejsze oczekiwanie na osobne zlecenie etapu i etap dokumentacji z AGENTS. Nie znosi wymagań produktu, prywatności, walidacji, bramek, ustawień uprawnień ani zakazów publikacji/kosztów. Prompty etapów są specyfikacją zakresu; ich stare zdania „czekaj na osobne zlecenie” nie wymagają ponownego pytania w tym programie.

Samodzielnie rozwiązuj zwykłe kwestie techniczne, poprawiaj błędy i testy, przyjmuj udokumentowane bramki. Nie kończ pracy tylko na analizie, planie lub delegowaniu. Kontynuuj do pełnego lokalnego odbioru albo konkretnego, rzeczywistego blokera. Zmiany wymagań, dodatkowe koszty lub brak wymaganych uprawnień przedstaw użytkownikowi z konkretnym problemem, rekomendacją i wpływem; prace niezależne prowadź dalej. Nie zgaduj znaczenia prywatnych danych.

## Start

Przeczytaj AGENTS.md, README.md, docs/STATUS.md, ROADMAP.md, WORKFLOW.md, DECISIONS.md, TESTING.md, T15_UI_IMPLEMENTATION.md, T13_MOBILE_WORKOUT.md, design/t14-selected-spec.md, docs/prompts/T15-A.md do T15-G.md i najnowsze rzeczywiste handoffy, w szczególności R6, T15-U i GIT-S1. Ścieżki skrócone w tej liście są w `docs/`. Używaj Impeccable do prac UI zgodnie z dostępnym skillem.

Punkt odniesienia zapisano jako commit51ea3b4; sprawdź faktyczny HEAD/status, nowsze zmiany i aktywne procesy/agentów. Nie resetuj pracy, nie uruchamiaj drugiego wykonawcy tego samego zakresu. Zapisz manifest stanu początkowego. Pracuj w gałęzi `codex/t15-ui` utworzonej z bieżącego stanu; jeżeli już istnieje, najpierw sprawdź jej właściciela i aktualny zakres, nie nadpisuj jej automatycznie.

Sprawdź dostępność narzędzi subagentów w używanej wersji CLI. Brak takiej możliwości zgłoś konkretnie, bez udawania delegowania. Nie zmieniaj samoczynnie konfiguracji konta lub zabezpieczeń. Nie instaluj innego systemu agentowego/API jako obejścia. Jeśli praca sekwencyjna jest jedyną dostępną metodą, przedstaw ten fakt i wykonuj bezpiecznie dostępne prace zamiast deklarować zespół.

## Kolejność i podział

1. **A najpierw**: fundament, Noc, font, nawigacja, wspólne UI i zasoby. Przed następnymi etapami ustabilizuj kontrakty i przyjmij bramkę A.
2. Po A przydziel maksymalnie dwa niezależne zakresy. Przykładowe tory B→D oraz C→F są dopuszczalne; E uruchom możliwie wcześnie w wolnym miejscu, uwzględniając jego ryzyko. Nie traktuj przykładu kolejności jako obowiązku odkładania E na sam koniec.
3. **D dopiero po B** i kontrakcie wspólnego przeglądu. D realizuje też T13-D, bez budowania drugiej Historii. Jawnie ustal interfejs przeglądu B dla D i zasady jego zmiany.
4. **G po A–F**: nowy recenzent, który nie pisał A–F. Obejmuje też kryteria T13-E. Defekty wracają do autorów, recenzent sprawdza poprawki. Nie jest automatycznym wdrożeniem.

Każdy wykonawca dostaje konkretny etap, wymagania i źródła, rzeczywiście przyjęte zależności, wyłączną listę plików, testy oraz warunek oddania. Deleguj pełny cykl implementacja→sprawdzenia→naprawy→handoff, a nie sam szkic. Gdy etap jest za duży, podziel go z zachowaniem ID, wymagań i zależności. Aktualizuj plan z podanym powodem.

## Własność plików i wspólne testy

Ty odpowiadasz za wspólne dokumenty, globalne style, layout/AppShell i wspólne komponenty po A; wykonawcy za ścieżki etapów i własne moduły CSS według planu. Prowadź rejestr aktywnych właścicieli i zwolnień. Każdy wspólny plik ma jednego autora naraz. Potrzebę zmiany kontraktu wykonawca zgłasza I; nie edytuje samowolnie zakresu kolegi. Review nie może przypadkiem nadpisywać trwającej implementacji.

Build/typy generujące `.next`, testy używające wspólnej bazy/fixture'ów/portów i przeglądarki wymagają jednej kolejki zarządzanej przez Ciebie albo rzeczywiście odrębnych środowisk. Sama odrębność plików nie izoluje testów. Nie uruchamiaj równolegle procesów zmieniających tę samą bazę lub katalog builda. Nie kasuj cudzych kont, danych, procesów ani źródeł. Testy niezależnych czystych funkcji mogą działać równolegle, jeśli nie współdzielą zmienianych zasobów.

## Obowiązkowy kontrakt E

Przed agregacją zapisz techniczną specyfikację estymacji, porównywalności obciążeń, dat/stref i statusów, źródłowych ID, remisów/rekordów oraz paginacji. Rozdziel wymagania zatwierdzone od propozycji. Obecna tabela1–10 jest propozycją referencyjną, nie już wdrożonym algorytmem; nie zamieniaj jej po cichu na inny wzór. Zwykłe wybory techniczne rozstrzygaj i uzasadniaj jako I; jeśli spór zmienia znaczenie wyników, przedstaw konkretny przykład i rekomendację do decyzji użytkownika, bez blokowania innych gotowych etapów.

Wymagane niezmienniki: jeden punkt to zapisany trening ćwiczenia/wariantu, bez sztucznych pomiarów. Dwie sesje jednego dnia pozostają rozróżnialne. `null` nie jest0. Nie mieszaj masy ciała, asysty, podstawy hantli i nieznanej semantyki dodatków. Rekordy „Cała historia” nie mogą wynikać z danych przyciętych filtrem wykresu; sprawdź też ponad500 wyników. Korekty historii aktualizują analitykę bez drugiego źródła prawdy. Ręczny datowany1RM profilu i historyczne snapshoty nie są nadpisywane estymacją.

## Checkpointy, limity i Git

Utwórz `docs/checkpoints/T15/STATE.md` jako bieżący rejestr I; wykonawcy mają własne pliki etapów, bez jednoczesnej edycji STATE. Zapisuj postęp po istotnym podzadaniu, przed przekazaniem plików, po testach i regularnie podczas dłuższej pracy (orientacyjnie20–30min). Nie polegaj na handoffie wykonywanym dopiero przy końcu limitu.

Checkpoint podaje etap/właściciela i identyfikator agenta, pliki/kontrakty, ostatni commit, rzeczywiście wykonane kroki i polecenia testów z wynikami, częściowe zmiany, blokery i dokładny następny krok. Ogranicz logi do użytecznych dowodów, bez sekretów i prywatnych danych. Utrwalaj także nieukończone zadanie, nie oznaczając go jako gotowe.

Ty wykonujesz operacje Git. Po przyjętej bramce twórz lokalny commit zwolnionego, sprawdzonego zakresu. Nie stosuj `git add -A`, gdy inni wykonawcy mają częściowe zmiany; wybieraj pliki jawnie i sprawdzaj staged. Nie obejmuj pracy aktywnego kolegi. Bez reset/clean/force lub push. Awaryjny zapis częściowy ma jawnie podawać nieukończone testy i zakres, bez udawania odbioru.

Nie zakładaj automatycznego restartu zespołu po limicie. Po wznowieniu najpierw odczytaj checkpointy/status/Git i sprawdź aktywnych agentów oraz procesy. Nie wznawiaj drugi raz wciąż wykonywanego zakresu. Zweryfikuj ostatnią częściową zmianę, przypisz właścicieli i kontynuuj od ostatniego ustalonego miejsca, zamiast ponawiać całość. Nie zwiększaj samowolnie kosztów przez dodatkowe kredyty/API.

## Zakres, odbiór i raportowanie

Zachowaj wszystkie wybrane układy, Noc domyślnie i Profil A. Buduj na działającym kodzie, nie na symulowanych zapisach HTML. Prywatny PDF i jego zrzuty poza repo; dane testowe syntetyczne. Ręczne działanie bez AI, autoryzacja właściciela, idempotencja, szkice, retry, konflikty, datowanie i historyczne cele T13 pozostają.

Bez nowych płatnych wywołań AI, nowych usług, zdalnych migracji, push lub publikacji. Konieczne działania lokalne i istniejące lokalne migracje/testy zgodnie z planem; nie zmieniaj schematu/API poza zatwierdzonym zakresem. Błędu środowiska nie uznawaj za zaliczony test i nie zastępuj wymaganej integracji mockiem.

Każdy etap spełnia własną bramkę. Końcowo pełny przepływ logowanie→plan/import→korekta→edycja→trening→historia→Postęp→profil, właściwe lokalne Auth/API/DB i izolacja A/B/anon, typy/testy/build,360/390/430px i cztery karty390×844. Osobno sprawdź zwykłe kliknięcia myszy, dotyk, klawiaturę, dymki, drag/pinch i swipe. Fizyczny telefon/Safari, jeśli niedostępne, raportuj jako otwarty odbiór, bez udawania PASS lub blokowania całej pracy lokalnej.

Po każdym etapie rzeczywisty datowany handoff wg TEMPLATE, fakty/testy/ograniczenia/przekazanie własności; I aktualizuje dokumenty wspólne. Na zakończenie każdej sesji identyczny gotowy prompt wznowienia/kolejnego gotowego zadania w handoffie i odpowiedzi, z modelem/rozumowaniem/kosztem, jak wymaga AGENTS. Takie prompty są materiałem do odzyskania kontekstu, a nie powodem do czekania na ręczne zlecenie następnego już autoryzowanego etapu. Nie oznaczaj całego T15 done przy istotnym niespełnionym kryterium.

Rekomendacja: integrator GPT-6.1 Sol/high; A/D/F medium, B/C/E/G high. Ustawiaj per agent tylko gdy dostępne w CLI, bez rutynowego Ultra. To dobór do zakresu/ryzyka, nie gwarancja niższego zużycia; nie uruchamiaj analizy pomocniczej, która powiela już istniejące dowody.

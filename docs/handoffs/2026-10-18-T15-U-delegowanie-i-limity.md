# Handoff — T15-U — delegowanie i limity

- Data/autor: 2026-10-18, Codex, jeden konsultant.
- Status: done — konsultacja; T15-A–G nadal todo.
- Git: main, c144213; liczne zastane zmiany robocze, bez commit/push.
- Poprzedni handoff: [T14-R6](2026-10-18-T14-R6-klik-punktu-mysza.md).

## Cel i wykonana praca

Przeczytano plan T15, WORKFLOW, bieżący STATUS, wpisy ROADMAP, D042–D044, handoff R6 i warunki promptów. Oceniono organizację wykonania oraz wznowienie po limicie. Nie wykonano audytu kodu ani implementacji.

Rekomendacja, nie zatwierdzony nowy tryb: jeden integrator i do dwóch wykonawców równocześnie. A jako fundament; następnie tor B→D i tor C→F, E z osobnym kontraktem obliczeń możliwie wcześnie, gdy zwolni się miejsce; G przez niezależnego recenzenta po wszystkich bramkach. Możliwe trzy subagenty w bieżącym środowisku nie oznaczają, że warto stale wykorzystywać wszystkie sloty. Testy współdzielące build, bazę, porty lub przeglądarkę wymagają kolejki albo rzeczywistej izolacji.

Najważniejsze doprecyzowania przy zleceniu: zgoda na cały A–G i przechodzenie bramek przez integratora (obecne prompty oczekują osobnych zleceń), jawny kontrakt współdzielonego przeglądu B dla D, kontrakt E przed agregacją, checkpointy wewnątrz długich etapów. Zwykłe wybory techniczne należą do wykonawców; zmiana wymagań, koszty, brakujące uprawnienia i fizyczny odbiór mogą wymagać użytkownika. Publikacja nie jest częścią lokalnego T15.

Po przerwaniu: odczyt checkpointów i git diff, sprawdzenie aktywnych agentów/procesów, ponowne przypisanie plików dopiero po upewnieniu się, że poprzedni wykonawca nie pracuje, kontrola ostatniej częściowej zmiany, kontynuacja brakujących kroków/testów. Nie restartować całego etapu ani nie uznawać częściowego pliku za ukończony. Nie polegać na wykonaniu handoffu dopiero po osiągnięciu limitu.

## Źródła i ograniczenia

Sprawdzono oficjalną dokumentację OpenAI: https://learn.chatgpt.com/docs/pricing oraz https://learn.chatgpt.com/docs/cli/reference (2026-10-18). Pricing opisuje kontynuację aktywnej tury po limicie z ograniczeniem fair use; nie jest to gwarancja nieprzerwanego działania wszystkich subagentów ani automatycznego wznowienia po resecie. Limity i czasy odnowienia należy odczytać z panelu własnego konta; możliwe ograniczenia tygodniowe. CLI dokumentuje resume zapisanej sesji, co nie dowodzi odtworzenia aktywnych procesów/subagentów w aplikacji. Nie sprawdzono konta użytkownika ani czasu jego resetu.

## Zmienione pliki

- docs/ROADMAP.md: osobna konsultacja T15-U, bez zmiany A–G.
- docs/STATUS.md: wynik i link do tej konsultacji.
- docs/CHANGELOG.md: powód wydzielenia zadania.
- Ten handoff: rekomendacja i prompt.

## Weryfikacja i środowisko

Przegląd spójności zależności i ograniczeń dokumentów; sprawdzenie lokalnych linków nowych wpisów oraz git diff --check dla zmienionych plików. Wynik: PASS — nowe lokalne linki istnieją, git diff --check nie zgłosił błędów. Nie uruchomiono testów/builda, serwerów, subagentów, płatnych integracji lub publikacji — konsultacja nie zmienia produktu. Zastane procesy nie były badane ani zatrzymywane.

## Decyzje, blokery i następny krok

Bez nowej zatwierdzonej decyzji produktu/architektury; DECISIONS bez zmian. Konsultacja ukończona, brak kolejnego zadania w zleconym zakresie. Użytkownik może później zlecić wykonanie A–G z delegowaniem; obecne pytanie tego nie zleca.

## Prompt dla kolejnego agenta

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj konsultację T15-U tylko po nowym pytaniu użytkownika; konsultacja jest zakończona, T15-A–G nie zostały zlecone. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/WORKFLOW.md, docs/DECISIONS.md, docs/T15_UI_IMPLEMENTATION.md oraz docs/handoffs/2026-10-18-T15-U-delegowanie-i-limity.md. Ustal zakres nowego zlecenia przed kodowaniem lub delegowaniem. Przy późniejszym zleceniu całego T15: jeden integrator, maksymalnie dwóch wykonawców równocześnie, A przed pozostałymi, D po B, niezależny G po B–F; bramki i kolejka wspólnych testów. Przed E zapisz kontrakt obliczeń. Zachowaj zastane zmiany; utrwalaj częściowe wyniki i dokładny następny krok. Kryterium konsultacji: jasne granice autonomii i wznowienia, bez obietnicy automatycznego restartu po limicie. Bloker implementacji: brak zlecenia; bez publikacji, zdalnych migracji i płatnego AI. Aktualizuj dokumentację i handoff stosownie do faktycznej pracy. Model: GPT-6.1 Sol / medium dla konsultacji — wystarcza do ograniczonej analizy dokumentów, bez kosztu Ultra.
```

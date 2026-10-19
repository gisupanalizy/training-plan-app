# Handoff — T15-G — niezależny odbiór z T13-E

- Data i autor: 2026-10-19, niezależny recenzent G (nie autor A–F). Przy sekwencji ten sam agent zaktualizował dokumenty wspólne jako I.
- Zadanie / status po sesji: T15-G i T13-E done lokalnie po D046. T13-A–D i T15-A–F też done lokalnie. Telefon, Safari i publikacja otwarte.
- Branch / commit: `codex/t15-ui`, HEAD `11d66bcdd66440623e8b1e7a55f0d18371e01c6c`. C: `bbead77`.
- Powiązany wcześniejszy handoff: [T15-C](2026-10-19-T15-C-import-edytor.md), oraz handoffy A, B, D, E i F.

## Cel i wykonana praca

Niezależnie sprawdzono zintegrowany HEAD. Przepływ logowanie, import i korekta, edytor, historia, postęp, profil i trening przeszedł na lokalnym Auth/API i w Chrome. Pierwsza asercja wymagała pełnych czterech kart nad nawigacją; pomiar 786,95 wobec 768 użytkownik uznał za zwykłe przewijanie (D046). Powtórzony cały runner planów, już z ogonkiem i T13-C, przeszedł. Ekranu nie zmieniano. Asercja w `scripts/test-t15b-browser.mjs` sprawdza teraz dostępność karty przez przewinięcie.

## Zmienione pliki

Tylko dokumentacja odbioru i próg testu przeglądarkowego. Bez migracji i bez zmiany kontraktu danych.

- `scripts/test-t15b-browser.mjs` — zamiast wymogu, że dół czwartej karty jest nad nav, sprawdza, że kartę da się doskrolować.
- [docs/reports/2026-10-19-T15-G-acceptance.md](../reports/2026-10-19-T15-G-acceptance.md)
- [docs/reports/2026-10-19-T13-acceptance.md](../reports/2026-10-19-T13-acceptance.md)
- [docs/handoffs/2026-10-19-T13-E-niezalezny-odbior.md](2026-10-19-T13-E-niezalezny-odbior.md)
- STATUS, ROADMAP, DECISIONS (D046), CHANGELOG, TESTING, T15_UI_IMPLEMENTATION, T13_MOBILE_WORKOUT, checkpoint T15 i krótka linia README.

Własność zwolniona. Brak poprawki układu.

## Weryfikacja

Środowisko i polecenia: [raport G](../reports/2026-10-19-T15-G-acceptance.md). Macierz R: [raport T13](../reports/2026-10-19-T13-acceptance.md).

Skrót: unit 251 passed / 9 skipped, typecheck PASS, build PASS. T13-A RPC+HTTP, T04, T08 z HTTP, T15-E API, T15-C HTTP i T06-R1 PASS. Chrome F, edytor, import, D, E i A PASS. Pierwszy T15-B przerwał się na starej asercji. Po D046 powtórka PASS, w tym ogonek i T13-C. Log `/private/tmp/t15g-t15b-rerun.log`.

Mock: testy jednostkowe, szkic importu, głos T13-C. Prawdziwe: Auth, PostgREST, HTTP 3005, Storage importu, Chrome CDP. Telefon i Safari niewykonane.

Mock: testy jednostkowe, szkic importu, głos T13-C. Prawdziwe: Auth, PostgREST, HTTP 3005, Storage importu, Chrome CDP. Telefon i Safari niewykonane. `adb` widziało tylko emulator.

## Decyzje i zmiany planu

D046, 2026-10-19, confirmed. Przewinięcie listy nie jest wadą. T15-G, T13-E oraz wcześniejsze A–F i T13-A–D są done lokalnie. T10-R1, T11, telefon, Safari i publikacja bez zmiany.

## Pozostała praca i blokery

Brak blokera produktu. Telefon i Safari niewykonane. Poziomy overflow nadal byłby błędem; tego przebieg nie wykazał.

## Następny krok

Brak kolejnego zadania wykonawczego. Telefon, Safari i publikacja czekają na osobne zlecenie.

## Stan środowiska

Po odbiorze produkcyjny proces na 3005 został zatrzymany. Dev użytkownika na 3002 zostaje. Supabase lokalny zostaje uruchomiony. Konta runnerów sprzątnięte przez `finally`. Zrzuty i logi w `/private/tmp`. Brak uploadu. `next-env.d.ts` po buildzie wrócił do wersji z HEAD; nie wchodzi do zmiany odbioru.

## Prompt dla kolejnego agenta

Brak kolejnego zadania wykonawczego. Telefon, Safari i publikacja nie startują same.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Nie ma kolejnego zadania wykonawczego po lokalnym zamknięciu T15-G i T13-E. Zacznij od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md i docs/handoffs/2026-10-19-T15-G-niezalezny-odbior.md tylko wtedy, gdy użytkownik zleci nową pracę. Gałąź codex/t15-ui. T13 i T15-A–G są done lokalnie po D046: przewinięcie listy, także gdy dół karty wchodzi pod nawigację, nie jest błędem. Powtórzony test-t15b-browser.mjs z T13-C przeszedł. Telefon, Safari, T10-R1, T11 i publikacja zostają otwarte i wymagają osobnego zlecenia. Nie poprawiaj układu kart, nie uruchamiaj płatnego AI, nie rób push ani publikacji.
```

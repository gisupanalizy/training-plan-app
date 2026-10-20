# Handoff — T16-I — niezależny odbiór Tempo

- Data i autor: 2026-10-20, Cursor agent, sesja niezależna od autorów B–H.
- Zadanie / status po sesji: T16-I wykonany jako odbiór, bramka nieprzyjęta. T16-A–H pozostają review. T16-K todo i niegotowe.
- Branch / commit / stan zmian: `codex/tempo`, HEAD `70d66e6`, drzewo robocze bez commita. Ta sesja nie commitowała, nie pushowała i nie tworzyła PR.
- Powiązany wcześniejszy handoff: [T16-H](2026-10-19-T16-H-profil-auth.md).

## Cel i wykonana praca

Niezależny odbiór całego interfejsu Tempo bez zmian `src/`. Macierz 85 stanów jest w [raporcie](../reports/2026-10-19-T16-I-tempo-acceptance.md). Przepływ lokalny na produkcyjnym Next przeszedł poza jedną asercją.

Przy 390×844 przycisk `Zapisz i przejdź dalej` nie kończy się nad `.mobile-nav`. Zrzut: `/private/tmp/t15b-failure.png`. D046 nie obejmuje tej akcji: dotyczy doskrolowania karty, nie zasłonięcia głównego zapisu. Właściciel poprawki: T16-D. Recenzent nie edytował komponentu ani progu testu.

Brak propozycji `T16-CONTRACT`. Procentu z klatki Postępu nie uznano za lukę: odczyt nie zwraca delty, a stan `no-change` jest tekstem „brak podstawy porównania”.

## Zmienione pliki

- [docs/reports/2026-10-19-T16-I-tempo-acceptance.md](../reports/2026-10-19-T16-I-tempo-acceptance.md) — macierz, wyniki, wada.
- [docs/ROADMAP.md](../ROADMAP.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md), [docs/TESTING.md](../TESTING.md) — bramka nieprzyjęta.
- [docs/DESIGN.md](../DESIGN.md), [docs/UX.md](../UX.md), [README.md](../../README.md) — zdanie o Nocy w kodzie było nieaktualne po B. Tempo jest w drzewie roboczym, a odbiór I nie jest zamknięty.
- Bez migracji, bez zmian API i bez `src/`.

## Weryfikacja

Środowisko: Node 26.4.0, Next 16.4.0, lokalny Supabase, Chrome headless. Serwer odbioru: `next start` na `http://localhost:3017` z wyłączonym AI. Logi `/private/tmp/t16i-suite.log` i `/private/tmp/t16i-t13c.log`.

- `npm test`: 271 passed / 9 skipped.
- `npm run build`: exit 0. Następujący `npm run typecheck`: exit 0.
- Chrome i API na `localhost:3017`: T15-A, T15-F, import, edytor, T15-D, T15-E przeglądarka i API, T13-A, T05, T09, T15-C HTTP — PASS.
- T15-B: exit 1 na widoczności zapisu serii. Wcześniejsze asercje karuzeli, podglądu i D046 karty przeszły. Wbudowany T13-C się nie uruchomił.
- T13-C osobno: PASS. Czwarta karta przy 390 ma dół 1195,97 przy nawigacji 768.
- Głos w T13-C to mock transportu. HTTP importu dostał 503 bez modelu.
- Telefon, Safari i ponowny odczyt Make przez Figma MCP niewykonane.

## Decyzje i zmiany planu

Bez nowej decyzji. D046 i D047 bez zmian. T16-I nie przechodzi do done. Defekt wraca do T16-D, zanim ktokolwiek powtórzy odbiór. T16-K pozostaje niegotowe.

## Pozostała praca i blokery

T16-D ma poprawić układ jednej serii tak, aby `Zapisz i przejdź dalej` przy 390×844 było w całości nad dolną nawigacją, bez zmiany komendy, API i progu D046 dla kart. Potem inny agent niż autor poprawki powtarza T16-I.

Telefon, Safari, T10-R1, T11 i publikacja zostają osobno.

## Następny krok

Poprawka właściciela T16-D, tylko ekran serii. Pliki startowe: ten handoff, raport I, `src/components/workout-editor.tsx`, `src/components/workout-editor.module.css`, `scripts/test-t15b-browser.mjs` do odczytu asercji. Nie zaczynać nowego I w tej samej sesji co poprawka.

## Stan środowiska

Po buildzie `.next` jest produkcyjny. Działający wcześniej `npm run dev` na porcie 3000 może wymagać ponownego uruchomienia. Serwer `next start` na 3017 został zatrzymany po odbiorze. Lokalny Supabase zostaje. W `.env` import AI jest włączony; serwer odbioru nadpisywał to tylko we własnym procesie. Bez wypisania sekretów.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, high. Poprawka jest wąska, ale dotyczy głównej akcji zapisu serii i łatwo zasłonić nawigację albo ruszyć komendę. High ogranicza ten błąd taniej niż kolejny pełny odbiór na złym układzie.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy, gałąź codex/tempo, HEAD 70d66e6 plus niezacommitowane T16. Wykonaj tylko poprawkę wady z niezależnego T16-I. Nie jesteś recenzentem I i nie zamykasz T16. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-19-T16-I-niezalezny-odbior.md, docs/reports/2026-10-19-T16-I-tempo-acceptance.md i D046. Src wolno zmienić tylko w src/components/workout-editor.tsx i src/components/workout-editor.module.css oraz w teście komponentu workout-editor, jeśli trzeba utrwalić widoczność. Przy 390×844, po uzupełnieniu celów i wyborze „Zostań”, dół przycisku „Zapisz i przejdź dalej” ma być nad górą .mobile-nav. D046 zostaje: karty mogą wchodzić pod pasek i muszą być doskrolowalne. Nie zmieniaj workout-command, API, progu testu T15-B ani danych. Uruchom test edytora, potem T15-B i T13-C na lokalnym Next pod adresem localhost, npm test, build i sekwencyjny typecheck. Zaktualizuj ROADMAP, STATUS, CHANGELOG, TESTING i handoff poprawki. Nie commituj, nie publikuj i nie przechodź do nowego T16-I. Telefonu i Safari nie deklaruj. Model: GPT-5.6 Sol, high.
```

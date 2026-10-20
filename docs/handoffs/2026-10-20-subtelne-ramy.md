# Handoff — subtelne ramy Tempo

- Data i autor: 2026-10-20, Cursor agent.
- Zadanie / status po sesji: ramy pól, kart i wierszy zrównane z linią Tempo. T16-D zostaje review. T16-I zostaje z bramką nieprzyjętą. T16 nie jest zamknięte. T16-K todo i niegotowe.
- Branch / commit / stan zmian: `codex/tempo`. Obrys jest w `83ab44d`. Ten handoff i wpisy STATUS, CHANGELOG oraz TESTING zapisują tę decyzję. Bez pusha i bez PR.
- Powiązany wcześniejszy handoff: [T16-D widoczność zapisu](2026-10-20-T16-D-widocznosc-zapisu.md).

## Cel i wykonana praca

Użytkownik porównał profil z Figmy z wdrożeniem i wolał cichsze ramy. Różnica nie była grubością: obie strony mają `1px`. Alias `--control` wskazywał `--tempo-muted` `#9daaa7` (około 6,45:1 wobec powierzchni). Brief nazywa `#344245` separatorem i subtelną ramą; kontrast tej linii wobec powierzchni to około 1,48:1. `--control` wskazuje teraz `--tempo-line`.

Bez zmian zostają tekst muted, fokus `3px` w kolorze akcentu, ramy błędów `--danger`, wybór bursztynem i wypełnienie aktywnej trasy. Stany, które tylko rozjaśniały ramę z `--line` do `--control`, nie rozjaśniają już samej kreski. Krok obciążenia zostaje polem tekstowym.

## Zmienione pliki

- [src/app/globals.css](../../src/app/globals.css) — `--control` wskazuje `--tempo-line`.
- [docs/TESTING.md](../TESTING.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md) i ten handoff.

Bez migracji, bez zmian API i bez zmiany progów testów.

## Weryfikacja

Środowisko: macOS, gałąź `codex/tempo`, już działający `next dev` na `http://localhost:3000`, nie `next start`. Chrome przez przeglądarkę Cursora, viewport 390×844. Tymczasowe lokalne konto usunięte po obejrzeniu.

- Tokeny: `--control` i `--line` to `#344245`, `--muted` zostaje `#9daaa7`, `--danger` `#ffb4ab`, `--focus` `#efc45f`.
- Ramy pól, kart i wierszy: 1 px, `rgb(52, 66, 69)`. Na obejrzanych trasach nie było ramy w kolorze muted `rgb(157, 170, 167)`.
- Trasy: logowanie, start bez planu i z planem, plany, podgląd, import, edytor, historia, postęp, profil z formularzem 1RM, ustawienie hasła.
- Fokus pola kroku obciążenia: `outline` 3 px `rgb(239, 196, 95)`, offset 3 px. Rama pola zostaje linią.
- Za krótkie nowe hasło: pole jest niepoprawne, a widoczna rama jest różowa. Komunikat błędu ma obrys `#ffb4ab`.
- Aktywnego `/trening/[id]` nie otwarto. Klik `Rozpocznij A` wrócił do podglądu planu i nie utworzył sesji.
- Telefon, Safari, `npm test`, `npm run build` i `npm run typecheck` niewykonane.

## Decyzje i zmiany planu

Bez nowej decyzji. D046 i D047 bez zmian. Świadomy odstęp od zapisu T16-B, że obrys kontrolek używa muted, żeby spełnić 3:1. Użytkownik wybrał ramę z Figmy. Próg 3:1 zostaje przy fokusie i tekście. T16-I nie przechodzi do done.

## Pozostała praca i blokery

Nowy T16-I ma wykonać inny agent niż autor poprawki zapisu z 2026-10-20 i autor tej zmiany ram. Do tego czasu bramka Tempo nie jest przyjęta. Recenzent nie powinien przywracać ram muted jako wady.

Telefon, Safari, T10-R1, T11 i publikacja zostają osobno.

## Następny krok

Niezależny odbiór T16-I od nowa. Pliki startowe: ten handoff, handoff widoczności zapisu, raport I, STATUS i ROADMAP. Recenzent nie edytuje `src/`.

## Stan środowiska

`npm run dev` użytkownika działał na porcie 3000 i posłużył do Chrome. Po tej sesji nie było `npm run build`. Lokalny Supabase zostaje. Tymczasowe konto utworzone do obejrzenia ram zostało usunięte. Bez wypisania sekretów.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: GPT-5.6 Sol, high. To pełny odbiór po dwóch wąskich poprawkach wizualnych. High ogranicza zaliczenie bramki tylko na podstawie przebiegu autorów; jeden fałszywy PASS powtarza cały przepływ.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy, gałąź codex/tempo. Tempo i cichsze ramy są już w Gicie: obrys w 83ab44d, opis w handoffie subtelnych ram. Wykonaj tylko nowy niezależny T16-I. Nie jesteś autorem poprawki zapisu z 2026-10-20, autorów B–H ani autora zmiany ram. Nie zamykaj T16, jeśli bramka nie jest spełniona. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-20-subtelne-ramy.md, docs/handoffs/2026-10-20-T16-D-widocznosc-zapisu.md, docs/handoffs/2026-10-19-T16-I-niezalezny-odbior.md, docs/reports/2026-10-19-T16-I-tempo-acceptance.md, specyfikację T16, brief, katalog oraz D046 i D047. Src jest tylko do odczytu. --control wskazuje --tempo-line #344245; nie przywracaj ram w kolorze muted. Sprawdź ponownie macierz stanów i pełny lokalny przepływ na next start pod adresem localhost. Przy 390×844, po uzupełnieniu celów i wyborze „Zostań”, dół „Zapisz i przejdź dalej” ma być nad górą .mobile-nav. D046 zostaje: karty mogą wchodzić pod pasek i muszą być doskrolowalne. Nie zmieniaj progu testu T15-B, workout-command, API ani danych. Uruchom npm test, build, sekwencyjny typecheck i właściwe runnery. Jeśli wada została, przypisz ją właścicielowi i nie oznaczaj T16-I jako done. Jeśli bramka przechodzi, zamknij odbiór w raporcie, ROADMAP, STATUS, CHANGELOG, TESTING i nowym handoffie. Nie commituj i nie publikuj. Telefonu i Safari nie deklaruj, jeśli ich nie sprawdzisz. Model: GPT-5.6 Sol, high.
```

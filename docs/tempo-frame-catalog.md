# Tempo — katalog nazwanych klatek

Każdy stan występuje jako:

- `tempo / trasa / stan / mobile` — klatka 390px;
- `tempo / trasa / stan / desktop` — klatka z istniejącym bocznym menu.

Wszystkie liczby, osoby, daty, nazwy plików i wyniki na klatkach są przykładami.
Prawdziwe dane zawsze pochodzą z autoryzowanego odczytu aplikacji.

## `/` — Trening

**Główna akcja:** rozpocznij wybraną jednostkę albo wznów istniejącą sesję.  
**Wtórne:** otwórz plan, wybierz jednostkę, importuj.  
**Kolejność:** dzień → stan sesji → plan → jednostki → akcje wtórne.  
**Dane prawdziwe:** prywatne plany, wersje, sesje, ćwiczenia, błędy odczytu.  
**Przykłady:** Plan Jakuba, Cross, daty i liczby.

Stany:

- `active-plan`
- `resume-session`
- `no-plan`
- `many-plans`
- `archived-version`
- `read-error`
- `demo-data`
- `active-conflict-one`
- `active-conflict-many`
- `active-conflict-delete`

Konflikt jednej aktywnej sesji ma główne `Wróć do treningu`, drugorzędne
`Zakończ i rozpocznij nowy` oraz osobne niebezpieczne `Usuń i rozpocznij nowy`.
Kilka sesji pokazuje każdą osobno z tym samym zestawem akcji. Zakończenie używa
istniejącego podsumowania czasu, a usunięcie destrukcyjnego dialogu. Data nowego
startu zapisuje się automatycznie. Plan, wersje i rzeczywiste 1RM pozostają
bez zmian.

## `/plany` — Plany

**Główna akcja:** Otwórz plan.  
**Wtórne:** Importuj, Nowy plan, sterowanie karuzelą.  
**Kolejność:** wybrany plan → karuzela → jednostki → tworzenie.  
**Dane prawdziwe:** lista planów, status i bieżąca wersja.  
**Przykłady:** nazwy i liczby.

Stany: `selected-plan`, `empty-library`.

## `/plany/[id]` — Podgląd planu

**Główna akcja:** Rozpocznij trening tylko dla bieżącej wersji.  
**Wtórne:** Wszystkie serie, kontekst źródła, wersje, cały plan.  
**Kolejność:** wersja → jednostka → karty → kontekst → start.  
**Dane prawdziwe:** dokument, serie, grupy, opcjonalność, źródła, snapshoty.  
**Przykłady:** nazwy ćwiczeń i zalecenia.

Stany: `current-version`, `archived-version`.

## `/plany/edytor` — Edytor

**Główna akcja:** Opublikuj plan albo nową wersję.  
**Wtórne:** dodawanie, superseria, kolejność, podgląd, głos.  
**Kolejność:** plan → trening → ćwiczenia → organizacja → zapis.  
**Dane prawdziwe:** pełny szkic, ID, serie, expectedVersionId.  
**Przykłady:** treść planu.

Stany:

- `exercise-list`
- `edit-exercise`
- `edit-series-block`
- `edit-single-series`
- `edit-workout-order`
- `delete-confirmation`
- `validation-error`

Dialog mobile jest pełnoekranowy, desktop modalny. Pasek zapisu nie zasłania
dolnej nawigacji.

## `/plany/import` — Import

**Główna akcja:** wybierz źródło, przejdź do korekty albo otwórz zapisany plan.  
**Wtórne:** tekst, głos, ręczny edytor, anulowanie i retry.  
**Kolejność:** źródła → status → prywatność → historia importów.  
**Dane prawdziwe:** job, status, próba, ważność i źródło.  
**Przykłady:** plik, rozmiar i czas.

Stany:

- `empty-history`
- `filled-history`
- `uploading`
- `processing`
- `error-retry`
- `cancelling`
- `committed`

## `/plany/import?id=[id]` — Korekta

**Główna akcja:** zapisz etap lub zatwierdź plan.  
**Wtórne:** edytuj, wyjaśnij, źródło, wstecz.  
**Kolejność:** import → kroki → trening → karty → zapis.  
**Dane prawdziwe:** szkic, pytania, odpowiedzi, progres, PDF/XLSX.  
**Przykłady:** ćwiczenia, parametry i cytaty.

Stany:

- `names`
- `series-supersets`
- `summary`
- `blocking-question`
- `question-dialog`
- `source-pdf`
- `source-xlsx`
- `edit-name`
- `edit-block`
- `edit-single`

Źródło mobile jest pełnoekranowe. Desktop pokazuje je obok planu.

## `/trening/[id]` — Przegląd sesji

**Główna akcja:** Kontynuuj trening.  
**Wtórne:** dodatkowe ćwiczenie, komentarz, zakończenie, usunięcie.  
**Kolejność:** status → liczniki → następna seria → ćwiczenia → akcje.  
**Dane prawdziwe:** read model, rewizja, snapshoty i zapisane serie.  
**Przykłady:** nazwy i liczniki.

Stany: `in-progress`, `finished-readonly`.

## `/trening/[id]` — Jedna seria

**Główna akcja:** zapisz albo ponów identyczną komendę.  
**Wtórne:** głos, pominięcie, cel, powrót.  
**Kolejność:** kontekst → cel → poprzedni wynik → wykonanie → zapis.  
**Dane prawdziwe:** historyczny cel, poprzedni wynik, szkic i rewizja.  
**Przykłady:** wartości wykonania.

Stany:

- `previous-result`
- `no-previous`
- `load-missing`
- `load-not-applicable`
- `load-zero`
- `rpe-rir-comment`
- `time-distance`
- `saving`
- `network-error`
- `conflict`
- `unsaved-dialog`
- `optional-choice`

## Dyktowanie

**Trasa:** `/trening/[id]` albo `/plany/edytor`.  
**Główna akcja:** zatrzymaj lub zatwierdź propozycję.  
**Wtórne:** anuluj, popraw, wróć do ręcznego formularza.  
**Dane prawdziwe:** uprawnienie, nagranie, transkrypcja, kotwica i rewizja.  
**Przykłady:** wypowiedź i wartości propozycji.

Stany: `recording`, `stopped`, `permission-denied`, `proposal`,
`manual-correction`.

## Zakończenie i usunięcie treningu

**Trasa:** `/trening/[id]`.  
**Główna akcja:** zakończ trening.  
**Wtórne:** wróć i skoryguj datę/godzinę.  
**Dane prawdziwe:** wykonanie, strefa, performed_at, offset i snapshoty.  
**Przykłady:** data, czas i liczniki.

Stany: `summary-time`, `dst-choice`, `delete-session`.

## `/historia` — Historia

**Główna akcja:** otwórz trening lub wznów.  
**Wtórne:** miesiąc, Dzisiaj, Postęp.  
**Kolejność:** miesiąc → kalendarz → dzień → sesje → aktywne.  
**Dane prawdziwe:** autoryzowane sesje i projekcja czasu.  
**Przykłady:** miesiąc i wpisy.

Stany: `selected-day`, `empty-day`, `unknown-time`.

## `/postep` — Postęp

**Główna akcja:** wybierz ćwiczenie/metrykę; punkt otwiera szczegół.  
**Wtórne:** zakres, rekordy, szczegóły i Profil.  
**Kolejność:** ćwiczenie → metryka → wynik → wykres → zakres → rekordy.  
**Dane prawdziwe:** punkty, źródłowe serie i rekordy całej historii.  
**Przykłady:** wartości i wykres.

Stany:

- `populated`
- `empty`
- `single-point`
- `gap`
- `selected-point`
- `no-change`
- `estimated-vs-real`

## `/profil` — Profil

**Główna akcja:** zapisz rzeczywiste 1RM.  
**Wtórne:** historia, krok, strefa i wylogowanie.  
**Kolejność:** konto → pomiar → ustawienia → historia → wylogowanie.  
**Dane prawdziwe:** konto, profil, katalog i rekordy.  
**Przykłady:** e-mail, kg i data.

Stany: `account-history`, `empty-history`, `demo-account`, `help`.

## `/logowanie` — Logowanie

**Główna akcja:** Zaloguj się.  
**Wtórne:** jawny przykład tylko bez skonfigurowanego Auth.  
**Dane prawdziwe:** sesja i wynik istniejącej akcji.  
**Przykłady:** placeholder e-mail.

Stany: `empty`, `field-error`, `expired`, `signed-out`,
`demo-environment`.

## `/ustaw-haslo` — Ustaw hasło

**Główna akcja:** Zapisz hasło.  
**Wtórne:** Wróć do logowania.  
**Dane prawdziwe:** sesja odzyskiwania i wynik akcji.  
**Przykłady:** brak widocznej wartości hasła.

Stany: `empty`, `too-short`, `save-error`, `submitting`.

Formularz zawiera tylko jedno pole nowego hasła. Nie ma pola powtórzenia.

## `system` — Komponenty Tempo

Klatka `library` pokazuje:

- przyciski primary, secondary, ghost i danger;
- pole;
- stepper;
- wiersz listy;
- kartę;
- status badge;
- segmented control;
- notice;
- empty state;
- dialog;
- dolną i boczną nawigację.

Klatka `dialog-open` pokazuje dialog pełnoekranowy na mobile i modalny na
desktopie. Zamknięcie i Escape przywracają fokus do kontrolki otwierającej.

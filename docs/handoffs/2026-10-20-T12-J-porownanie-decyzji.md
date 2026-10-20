# Handoff — T12-J — Jev i OpenAI Decisions dla nazw ćwiczeń

- Data i autor: 2026-10-20, Codex.
- Zadanie / status po sesji: T12-J done jako eksperyment; szersze T12 pozostaje deferred, integracja parafraz nie jest zatwierdzona.
- Branch / commit / stan zmian: `codex/tempo`; bez commita, push i publikacji. Zastane niezacommitowane zmiany T16-I pozostawiono bez ingerencji. Ta sesja dopisała dokumentację T12-J.
- Powiązany wcześniejszy handoff: [podpięcie PNG](2026-10-20-ikony-png-podpiecie.md), [T16-I](2026-10-20-T16-I-ponowny-odbior.md).

## Cel i wykonana praca

Na wyraźną prośbę użytkownika porównano dobór nazwy ćwiczenia przez Jev i OpenAI Decisions przed rozważaniem integracji. Oba modele wywołano rzeczywiście przez Vercel AI Gateway na tych samych 62 nazwach, z 50 sprawdzonymi kluczami i opcją `none`. Wynik, protokół, ceny i ograniczenia: [raport](../reports/2026-10-20-T12-J-porownanie-jev-decisions.md). OpenAI osiągnął 59/62 wobec 56/62 Jev, lecz obydwa błędnie podpięły niektóre niezgodne ruchy. Po zgłoszeniu wymogu działania online przez Vercel zatrzymano przygotowanie lokalnego Basal. Basal nie został uruchomiony ani oceniony na danych.

## Zmienione pliki

- [docs/ROADMAP.md](../ROADMAP.md), [docs/STATUS.md](../STATUS.md), [docs/CHANGELOG.md](../CHANGELOG.md) — odrębny eksperyment, wynik i granica względem T12.
- [raport T12-J](../reports/2026-10-20-T12-J-porownanie-jev-decisions.md) — metoda, liczby i źródła.
- Ten handoff. Bez zmian `src/`, bazy, resolvera, ikon, danych treningu lub manifestu CC BY-SA.

## Weryfikacja

- `node /private/tmp/jev-exercise-probe.mjs --smoke`, potem przebieg 25 i `--all` dla Jev — realne API Vercel, odpowiednio 1/1, 20/25 i 56/62 zgodnych z etykietami.
- `JEV_MODEL=openai/gpt-6-luna-decisions node /private/tmp/jev-exercise-probe.mjs --smoke`, `--all`, a potem przebieg 25 — realne API Vercel, odpowiednio 1/1, 59/62 i 22/25.
- Ręcznie porównano wyniki zapisane tylko w `/private/tmp`, w tym 52 przypisania i 10 odmów. Nie uruchamiano testów aplikacji ani przeglądarki, bo nie zmieniano kodu. Etykiety nie są zatwierdzonym wzorcem użytkownika.
- Sprawdzenie dokumentacji dostawców: [OpenAI Docs](https://developers.openai.com/api/docs/guides/decisions), [Vercel Gateway](https://vercel.com/changelog/openai-decisions-api-now-available-on-ai-gateway), [Basal](https://github.com/rkinas/basal/blob/main/docs/INSTALL.md). Nie uruchomiono inferencji Basal.

## Decyzje i zmiany planu

Dodano T12-J jako jednorazowy, ukończony eksperyment z gotowymi zależnościami, poza szerszym odroczonym T12. Powód: użytkownik chciał porównać rzeczywistą jakość i koszt dla parafraz zanim rozważy wdrożenie. Bez nowej zatwierdzonej decyzji architektonicznej. Rekomendacja „dokładny słownik, ewentualna sugestia modelu, potwierdzenie przez człowieka” pozostaje propozycją. D048 bez zmian.

## Pozostała praca i blokery

Trzeba uzgodnić, które bliskie znaczeniowo warianty są równoważne, oraz kto i kiedy zatwierdza sugestię w korekcie importu. Dziesięć etykiet `none` jest niewielką próbką; 3–5 fałszywych przypisań wyklucza automatyczne przyjęcie wyniku. Nie wdrażać progu pewności na podstawie tej próby. Klucze są tylko w ignorowanych lokalnych `.env*`, a wyniki tymczasowe poza repo; ich trwałość nie jest gwarantowana. Dalsza integracja wymaga osobnego zlecenia użytkownika.

## Następny krok

Jeżeli użytkownik zleci dalszą pracę, przygotować najpierw propozycję kontraktu korekty importu i ocenę trudnych równoważności z użytkownikiem. Nie przechodzić samodzielnie do wdrożenia modelu ani automatycznego dopisywania aliasów.

## Stan środowiska

Nie uruchomiono serwera aplikacji. Nie instalowano modelu do aplikacji. Przerwane środowisko Basal i cache pakietów usunięto z `/private/tmp`. Tymczasowy skrypt oraz surowe wyniki obu modeli pozostały w `/private/tmp`. Żadne sekrety nie są w repozytorium ani w tym handoffie.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: **gpt-6.1-sol, medium** — analiza istniejącej korekty importu i ryzyk semantycznych wymaga rozumowania, ale sam projekt kontraktu jest ograniczony; medium oszczędza koszt względem high.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Po osobnym zleceniu użytkownika przygotuj wyłącznie propozycję bezpiecznej obsługi parafraz nazw ćwiczeń podczas korekty importu. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-20-T12-J-porownanie-decyzji.md, docs/reports/2026-10-20-T12-J-porownanie-jev-decisions.md, docs/EXERCISE_NAMES.md, docs/T06_IMPORT.md, docs/DECISIONS.md i docs/TESTING.md. Sprawdź rzeczywisty kod importu i resolvera. Zaproponuj sekwencję: dokładny sprawdzony alias, opcjonalna sugestia modelu dla nieznanej nazwy, walidacja klucza/sprzętu/wariantu oraz wyraźne potwierdzenie użytkownika albo pozostawienie oryginału. Przedstaw trudne równoważności do decyzji właściciela; nie zgaduj ich i nie traktuj 62 prób jako zatwierdzonego wzorca. Kryteria: konkretne miejsce w przepływie, zachowanie błędów i prywatności, pomiar fałszywych przypisań, koszt i plan testu; bez zmiany src/, bazy, danych lub ikon i bez wdrożenia dostawcy. T12 jest nadal deferred. Zaktualizuj dokumentację, utwórz handoff i identyczny prompt kolejnego kroku. Model: gpt-6.1-sol, medium — zakres projektu kontraktu jest wąski, więc wyższy poziom rozumowania byłby nieproporcjonalny kosztowo.
```

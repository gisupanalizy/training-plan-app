# Handoff — T09 — kontynuacja weryfikacji głosu

- Data i autor: 2026-10-12, Codex.
- Zadanie / status po sesji: wyłącznie T09 / `review`; T10 i T11 nierozpoczęte.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i PR. Zmiany są lokalne w plikach wymienionych niżej.
- Powiązany wcześniejszy handoff: [T09 — implementacja](2026-10-12-T09-dyktowanie.md).

## Cel i wykonana praca

Przejrzano wskazaną specyfikację, kod głosu i obie migracje T09. Kontynuacja poprawia kontrolę celu w karcie: identyfikator treningu jest sprawdzany również dla komentarza i dodatkowego ćwiczenia, nie tylko dla serii. Po automatycznym zatrzymaniu 30-sekundowego nagrania interfejs pokazuje etap transkrypcji. Harness prawdziwych syntetycznych prób zapisuje pola rozbieżne i wynik błędnej transkrypcji, mierzy osobno p50/p95 audio i wymaga co najmniej 95% trafnych przypadków tekstowych oraz poprawnego planu i obu nagrań. Dla `clarify` akceptuje sensowne pytanie bez wymuszania identycznego brzmienia.

Nie wywołano płatnego OpenAI: o limit USD dla T09 zapytano w tej sesji, ale do jej zamknięcia nie otrzymano odpowiedzi. Klucz jest dostępny w ignorowanym `.env`; osobnych flag głosu tam nie ma. Oficjalne dokumenty sprawdzono 2026-10-12: [transkrypcja i `languages[]`](https://developers.openai.com/api/docs/guides/speech-to-text), [model i stawka audio](https://developers.openai.com/api/docs/models/gpt-transcribe), [model i stawka tekstu](https://developers.openai.com/api/docs/models/gpt-6-luna). Nie zmieniano modelu ani taryfy w kodzie.

## Zmienione pliki

- [Karta głosu](../../src/components/workout-voice.tsx) i [test](../../src/components/workout-voice.test.tsx) — zakotwiczenie każdej propozycji w ID treningu.
- [Nagrywanie](../../src/components/voice-input.tsx) — stan transkrypcji po automatycznym zakończeniu.
- [Harness](../../src/lib/voice/live-evaluation.test.ts) — diagnostyka i rzeczywiste warunki zaliczenia.
- [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [TESTING](../TESTING.md), [CHANGELOG](../CHANGELOG.md), [README](../../README.md) — wynik, ograniczenia i przekazanie. D019 w [DECISIONS](../DECISIONS.md) nadal opisuje tę samą architekturę; nowej decyzji nie było.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, lokalny Supabase w Dockerze. `npm test`: 65 aktywnych testów przeszło, 7 pominięto; prawdziwy test T09 jest wśród pominiętych. `npm run typecheck` i `npm run build`: sukces. Pierwsza próba `DO_NOT_TRACK=1 npm run test:t09:local` nie dostała dostępu do gniazda Dockera w sandboxie; ponowiono ją z dostępem i uzyskano sukces na Auth/PostgREST, A/B/anon, atomowych seriach, retry, rewizji i budżecie. `DO_NOT_TRACK=1 npm run test:t05:local`: sukces regresji komendy T05. Test komentarza z obcym ID jest mockiem odpowiedzi HTTP; nie mierzy jakości AI.

`adb devices -l` po przyznaniu dostępu wykazał tylko `emulator-5556`; `system_profiler SPUSBDataType` nie wykazał fizycznego iPhone/Android. Nie wykonano próby mikrofonu, uprawnień, WebM/MP4, anulowania, opóźnionego wyniku ani zmiany ćwiczenia na fizycznym telefonie. Obecny licznik T06 ma jedną próbę niemockową z 2026-10-12 12:23:08 UTC; jej okno mija 2026-10-13 12:23:08 UTC. Nie usuwano danych i nie ponawiano pełnej regresji T06 przed wygaśnięciem. Nie uruchomiono agentów równoległych.

## Decyzje i zmiany planu

T09 przejęto jako `in_progress` na czas pracy i przywrócono do `review`, ponieważ próba live i fizyczny odbiór pozostają niewykonane. ID i zależności bez zmian. D019 pozostaje aktualna; nie ma nowej decyzji architektonicznej ani proponowanej zmiany wymagań.

## Pozostała praca i blokery

Płatna ewaluacja wymaga wyraźnej odpowiedzi użytkownika z limitem USD dla T09. Fizyczny telefon z mikrofonem jest potrzebny do odbioru urządzenia. Próby syntetyczne nie zastępują tego odbioru. Pełna regresja T06 wymaga wygaśnięcia okna lub izolowanego środowiska. T09 nie spełnia jeszcze wszystkich kryteriów `done`.

## Następny krok

Po uzgodnieniu limitu uruchomić syntetyczną ewaluację live, sprawdzić błędne polskie liczby, poprawki, plan i hałas, p50/p95 oraz szacunek kosztu, naprawić znalezione błędy i powtórzyć adekwatną regresję. Następnie wykonać scenariusze z TESTING na fizycznym telefonie. Pozostać w T09.

## Stan środowiska

Lokalny Supabase jest uruchomiony; nie uruchomiono serwera Next ani procesu live. Klucz istnieje tylko w ignorowanym `.env`; `OPENAI_VOICE_ENABLED` i `OPENAI_VOICE_BUDGET_USD` nie są ustawione. Raport live T09 nie istnieje. Nie zapisano nagrania ani prywatnej transkrypcji w repo.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: gpt-6-sol, high — ocena polskiej mowy, konfliktów celu i prywatności wymaga staranności przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj wyłącznie T09 — dyktowanie planów i danych treningu; nie rozpoczynaj T10 ani T11 i nie uruchamiaj automatycznie innych agentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-12-T09-kontynuacja-weryfikacji.md, docs/AI_AND_VOICE.md, docs/DECISIONS.md, docs/TESTING.md, docs/WORKFLOW.md oraz src/lib/voice, src/components/voice-input.tsx, src/components/workout-voice.tsx i migracje T09. T09 jest w review: lokalne testy A/B/anon, retry, typy i build przeszły; raport prawdziwego głosu i fizyczny odbiór pozostają niewykonane. Najpierw uzgodnij z użytkownikiem wyraźny limit USD tylko dla T09; klucz jest w ignorowanym .env. Dopiero wtedy uruchom RUN_T09_LIVE=true z T09_LIVE_BUDGET_USD równym zatwierdzonej kwocie dla src/lib/voice/live-evaluation.test.ts. Oceń polskie liczby, poprawki, plan i hałas, p50/p95 oraz koszt; napraw błędy i powtórz regresję. Na fizycznym telefonie sprawdź uprawnienia mikrofonu, WebM/MP4, anulowanie, opóźniony wynik i zmianę ćwiczenia; obecnie ADB widzi tylko emulator, więc bez telefonu nie deklaruj odbioru. Zachowaj ręczne formularze, jawne zatwierdzenie, kontrolę właściciela i transakcyjną komendę T05. Regresję T06 uruchom po 2026-10-13 12:23 UTC albo w izolowanym środowisku, bez usuwania cudzych prób. Zaktualizuj ROADMAP, STATUS, TESTING, CHANGELOG/DECISIONS według wyników i utwórz nowy handoff z identycznym promptem końcowym. Rekomendowany model: gpt-6-sol, rozumowanie high — głos, niezawodność i prywatność wymagają uważności przy niższym koszcie niż model frontier.
```

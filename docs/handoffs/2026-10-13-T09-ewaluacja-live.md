# Handoff — T09 — ewaluacja prawdziwego API na danych syntetycznych

- Data i autor: 2026-10-13, Codex (próby API wykonane 2026-10-12 UTC).
- Zadanie / status po sesji: wyłącznie T09 / `review`; T10 i T11 nierozpoczęte.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i PR. Zmiany są lokalne.
- Powiązany wcześniejszy handoff: [kontynuacja weryfikacji T09](2026-10-12-T09-kontynuacja-weryfikacji.md).

## Cel i wykonana praca

Użytkownik wyraźnie zatwierdził limit 0,50 USD tylko na prawdziwą ewaluację T09. Po sprawdzeniu oficjalnych taryf `gpt-6-luna` i `gpt-transcribe` uruchomiono `RUN_T09_LIVE=true T09_LIVE_BUDGET_USD=0.50` na 20 syntetycznych polskich wypowiedziach, jednym planie i dwóch krótkich nagraniach z systemowej syntezy mowy. Cztery serie zachowano w osobnych raportach. Pierwsza miała 11/20 punktowanych wypowiedzi; nadmiernie ścisłe porównanie oznaczało wielkość liter i interpunkcję jako błędy, a niekompletna propozycja ćwiczenia kończyła się błędem. Po poprawkach druga seria miała 19/20 i niepoprawny plan, trzecia 19/20 i poprawny plan. Prompt `voice-pl-v2` doprecyzował skrót „pięć po sto” oraz jawny zapis czterech osobnych serii po sześć przy 75% rzeczywistego 1RM. Końcowa seria dała 20/20, poprawny plan i 2/2 transkrypcji. W zestawie zamieniono przypadek tekstowy „Szum: pięć po sto”, sprzeczny z regułą pytania o zagłuszone liczby, na opis nieczytelnego wyniku; v1 i nowsze serie nie używają więc identycznego zestawu. Walidator zamienia strukturalnie poprawną, lecz niekompletną propozycję na `clarify` bez danych do zapisu. Niezmienione pozostają ręczne formularze, jawne zatwierdzanie, kontrola właściciela i transakcyjna komenda T05.

## Zmienione pliki

- [Przypadki T09](../../src/lib/voice/cases.ts), [walidator](../../src/lib/voice/domain.ts), [test walidatora](../../src/lib/voice/domain.test.ts), [prompt i adapter](../../src/lib/voice/openai.ts), [harness live](../../src/lib/voice/live-evaluation.test.ts) — bezpieczne doprecyzowanie, wersja promptu, pomiar semantycznie równoważnych zapisów i diagnostyka planu.
- [Raport końcowy](../reports/2026-10-12-T09-live.json), [v1](../reports/2026-10-12-T09-live-v1.json), [v2](../reports/2026-10-12-T09-live-v2.json), [v3](../reports/2026-10-12-T09-live-v3.json) — wyniki wszystkich płatnych serii, bez prywatnych nagrań.
- [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [TESTING](../TESTING.md), [AI_AND_VOICE](../AI_AND_VOICE.md), [CHANGELOG](../CHANGELOG.md), [DECISIONS](../DECISIONS.md), [README](../../README.md) — stan, dowody, granice i D020.
- Migracji ani kontraktu T05 nie zmieniano.

## Weryfikacja

Środowisko: macOS, lokalny Supabase w Dockerze, Node.js 26.4.0, prawdziwe API OpenAI. Końcowa seria `RUN_T09_LIVE=true T09_LIVE_BUDGET_USD=0.50 DO_NOT_TRACK=1 npx vitest run src/lib/voice/live-evaluation.test.ts`: 20/20 tekstów, poprawny syntetyczny plan, 2/2 transkrypcji WebM, w tym jedna z syntetycznym różowym szumem. p50/p95 interpretacji tekstu 4,351/8,622 s; p50/p95 audio 0,552/0,552 s; plan 4,827 s. Szacunek kosztu końcowej serii 0,002595 USD, czterech serii łącznie 0,010376 USD wobec limitu 0,50 USD. To szacunek z tokenów i czasu audio, nie rachunek dostawcy. Raporty v1–v3 zawierają niezaliczone próby; nie ukryto ich.

`npm test`: 65 testów przeszło, 7 pominięto; test live jest domyślnie pominięty. `DO_NOT_TRACK=1 npm run test:t09:local`: PASS na Auth/PostgREST, A/B/anon, retry, atomowe serie, rewizja i budżet. `DO_NOT_TRACK=1 npm run test:t05:local`: PASS na komendzie T05. `npm run build`: PASS. Równoległy z buildem `npm run typecheck` trafił na chwilowy brak generowanego `.next/types/routes.js`; po zakończeniu builda powtórzony sekwencyjnie `npm run typecheck` przeszedł. Testy komponentów anulowania i opóźnionego wyniku są mockami. API T09 było prawdziwe, ale audio pochodziło z syntezy systemowej, nie od człowieka. Nie testowano faktycznego rachunku ani hostingu.

Pierwsza próba live w sandboxie nie połączyła się z API i wygenerowała pusty WebM, bo systemowa synteza mowy nie działała tam poprawnie. Po uruchomieniu z dostępem do sieci i usługi mowy próby wykonały się. `adb devices -l` dwukrotnie pokazało tylko `emulator-5556`; `system_profiler SPUSBDataType` nie wykazał fizycznego iPhone/Android. Nie wykonano odbioru uprawnień mikrofonu, WebM/MP4, anulowania, opóźnionego wyniku ani zmiany ćwiczenia na fizycznym telefonie. Nie uruchomiono T06 przed wygaśnięciem istniejącej próby 2026-10-13 12:23 UTC; nie usuwano danych. Nie uruchomiono innych agentów.

## Decyzje i zmiany planu

[D020](../DECISIONS.md) dokumentuje zamianę niekompletnej propozycji na pytanie i regułę punktowania tekstu. T09 przejęto jako `in_progress` na czas pracy, potem przywrócono do `review` ze względu na brak fizycznego odbioru. ID, zależności i zakres T09 pozostają bez zmian; T10/T11 nadal `todo`.

## Pozostała praca i blokery

Potrzebny jest fizyczny telefon z mikrofonem oraz dostęp do aplikacji przez bezpieczny kontekst HTTPS albo localhost właściwy dla urządzenia. Należy sprawdzić rzeczywistą zgodność `MediaRecorder` i serwera dla WebM/MP4, odmowę uprawnienia, ręczny fallback, anulowanie, opóźnioną odpowiedź i zmianę ćwiczenia. Bez telefonu nie oznaczać T09 jako `done`. Krótka synteza mowy i mały zestaw tekstów nie dowodzą skuteczności w realnej sali ani na różnych głosach. Regresja T06 może zostać ponowiona po 2026-10-13 12:23 UTC albo w izolowanym środowisku, bez usuwania cudzych prób. Dalszych płatnych prób nie wykonywać bez potrzeby; uwzględnić już szacowane 0,010376 USD w zatwierdzonym łącznym limicie 0,50 USD.

## Następny krok

Kontynuować T09 od odbioru na fizycznym telefonie, naprawić ewentualne błędy i powtórzyć adekwatną regresję. Jeśli telefonu nadal nie ma, utrzymać `review` i zapisać brak testu. Po wskazanym czasie ponowić pełną regresję T06 w dozwolonych warunkach. Nie rozpoczynać T10/T11.

## Stan środowiska

Lokalny Supabase działał podczas testów. Nie pozostawiono procesu Next ani procesu live. Klucz jest wyłącznie w ignorowanym `.env`; `OPENAI_VOICE_ENABLED` i `OPENAI_VOICE_BUDGET_USD` nie zostały trwale ustawione. Raporty zawierają tylko syntetyczne dane. Katalog nie ma Git.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: gpt-6-sol, high — testy głosu, prywatności i konfliktów celu wymagają uważności przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj wyłącznie T09 — dyktowanie planów i danych treningu; nie rozpoczynaj T10 ani T11 i nie uruchamiaj automatycznie innych agentów. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-13-T09-ewaluacja-live.md, docs/AI_AND_VOICE.md, docs/DECISIONS.md, docs/TESTING.md, docs/WORKFLOW.md oraz src/lib/voice, src/components/voice-input.tsx, src/components/workout-voice.tsx i migracje T09. T09 jest w review: po zatwierdzonym limicie 0,50 USD cztery serie prawdziwego OpenAI na danych syntetycznych kosztowały szacunkowo 0,010376 USD; końcowy raport docs/reports/2026-10-12-T09-live.json ma 20/20 tekstów, poprawny plan i 2/2 syntetycznych nagrań, ale fizyczny odbiór pozostaje niewykonany. Na fizycznym telefonie sprawdź uprawnienia mikrofonu, WebM/MP4, anulowanie, opóźniony wynik i zmianę ćwiczenia; ADB widział tylko emulator, więc bez telefonu nie deklaruj odbioru ani statusu done. Napraw wykryte błędy i powtórz adekwatną regresję; zachowaj ręczne formularze, jawne zatwierdzenie, kontrolę właściciela i transakcyjną komendę T05. Nowe płatne próby wykonuj tylko gdy potrzebne do regresji T09, licząc je w zatwierdzonym łącznym limicie 0,50 USD i pamiętając, że dotychczasowy koszt to szacunek. Regresję T06 uruchom po 2026-10-13 12:23 UTC albo w izolowanym środowisku, bez usuwania cudzych prób. Zaktualizuj ROADMAP, STATUS, TESTING, CHANGELOG/DECISIONS według wyników i utwórz nowy handoff z identycznym promptem końcowym. Rekomendowany model: gpt-6-sol, rozumowanie high — głos, niezawodność i prywatność wymagają uważności przy niższym koszcie niż model frontier.
```

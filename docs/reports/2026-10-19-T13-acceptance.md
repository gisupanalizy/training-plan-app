# T13-E — wynik niezależnego odbioru, 2026-10-19

Ten sam przebieg co [T15-G](2026-10-19-T15-G-acceptance.md). Bramka **przyjęta lokalnie** po D046. Przewinięcie listy nie jest wadą. Powtórzony T15-B i T13-C: PASS. Handoff: [T15-G](../handoffs/2026-10-19-T15-G-niezalezny-odbior.md).

## Wersja i środowisko

- `codex/t15-ui`, HEAD `11d66bcdd66440623e8b1e7a55f0d18371e01c6c`.
- Node 26.4.0, Next 16.4.0, Supabase CLI 2.120.0, lokalny Auth/PostgREST :54321, produkcyjny Next `http://localhost:3005` zbudowany w tej sesji.
- Chrome headless i viewport CDP. To nie jest telefon ani Safari.
- AI off. Konta syntetyczne, sprzątane w `finally` runnerów. Sekrety niewypisane.

Wspólne flagi poleceń: `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false`.

## R01–R16

| ID | Wynik tej sesji | Dowód |
| --- | --- | --- |
| R01 | PASS w zakresie runnera | Powtórka T15-B: selektor bez tygodni, wybór Treningu B, start aktualnej jednostki, karuzela planów. Osobnego wejścia w wersję archiwalną ten runner nie wykonuje. |
| R02 | PASS | Powtórka otwiera szczegóły przysiadu: 8 wierszy serii i źródło „Syntetyczny arkusz!A1”. Ramka superserii jest na zrzucie. |
| R03 | Bez osobnego kliknięcia | Runner nie otwiera „Podgląd całego planu”. Selektor zostawia Trening A i Trening B jako osobne jednostki. |
| R04 | PASS | `test-t13c-browser.mjs`: lista sesji, liczniki wymagane/opcjonalne/dodatkowe/pominięte, superseria S1. |
| R05 | PASS | Komentarz i dodatkowe ćwiczenie na żądanie, Kontynuuj, finish. Numer rewizji nie jest treścią tego sprawdzenia UI. |
| R06 | PASS | Jeden formularz serii, brak maksimum, pola czasu/dystansu na Planku, 0 powtórzeń. |
| R07 | PASS | Zapis po odpowiedzi serwera, nierówne rundy, pominięcie, opcjonalna, poprawka. |
| R08 | PASS | Inny szkic zostaje, Wstecz pyta o szkic, retry po utracie odpowiedzi, 409 nie nadpisuje szkicu. Głos: mock; spóźniona propozycja nie zapisuje się do zmienionego celu. |
| R09 | PASS | T13-C: konflikt, „Wróć”, finish-replace i delete-replace. T13-A: dwa starty, jeden zwycięzca, PT409. |
| R10 | PASS | Finish nie dopisuje wyników pustym seriom. Delete ma drugie potwierdzenie. Replace atomowy w T13-A. |
| R11 | PASS | T13-C buduje własne legacy i rozstrzyga je pojedynczo. T13-A: `MULTIPLE_ACTIVE_WORKOUTS`, bez automatycznego zamknięcia. |
| R12 | PASS | `T13A_HTTP_BASE=http://localhost:3005 npm run test:t13a:local`. A/B/anon, 401, no-store, DML zamknięte, delete i późny retry 410, równoległe save/delete. |
| R13 | PASS | T13-A: korekta daty, snapshoty 1RM/kg/null, DST, północ. T13-C: finish z korektą bez zmiany snapshotów. T15-D: dzień w kalendarzu, legacy „godzina nieznana”. |
| R14 | PASS | `test-t15d-browser.mjs`. Pon–niedz, Dzisiaj, wiele sesji, Wznów, północ/DST/rok przestępny, delete, A/B/anon. Cele dni min. 44,56 / 48,84 / 54,56 × 46 px. |
| R15 | Przyjęte po D046 | Podgląd 390: dół czwartej karty 786,95, nav 768. To przewijanie, nie wada. Powtórka T15-B sprawdza, że kartę da się doskrolować, i przechodzi. Trening 390 mieści się nad nav (766,19). |
| R16 | PASS lokalnie | `npm test` 251/9 skip, typecheck, build, T04, T06-R1, T08 HTTP, T15-E API, powtórzony T15-B i T13-C. Telefon/Safari osobno. |

## Polecenia

Szczegółowe logi: `/private/tmp/t15g-unit.log`, `t15g-typecheck.log`, `t15g-build.log`, `t15g-t13a.log`, `t15g-t04.log`, `t15g-t08-http.log`, `t15g-t15e.log`, `t15g-t15c-http.log`, `t15g-t06r1.log`, `t15g-t15f.log`, `t15g-t15c-editor.log`, `t15g-t15c-import.log`, `t15g-t15b.log`, `t15g-t15d.log`, `t15g-t15e-browser.log`, `t15g-t15a.log`, `t15g-t13c.log`.

Jedyny niezerowy exit pierwszego przebiegu: `t15g-t15b.log`, stara asercja czterech kart. Po D046 powtórka `t15g-t15b-rerun.log` ma exit 0.

## Ograniczenia

Telefon, Safari, hosting, płatne AI i publikacja niewykonane. Lokalne done nie zamyka T10-R1 ani T11.

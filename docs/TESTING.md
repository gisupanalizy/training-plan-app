## T12-K — tożsamość ćwiczeń, odbiór lokalny (2026-10-20)

`scripts/test-t12k-api.mjs` na lokalnym Auth/PostgREST: PASS. Konta A/B/anon są syntetyczne i usunięte po teście. Jedna tożsamość dla dwóch planów z `bench-press`, nazwa PL, dwa oryginały, retry i konflikt payloadu, odrzucenie obcego `identityId`, nieznanego klucza, sprzecznych hantli i anonima, ponowne użycie własnej nazwy. Snapshot pierwszej sesji został 100 kg / 75 kg po dopisaniu 140 kg na bliźniaczym wierszu. Nowa sesja dostała 140 kg / 105 kg. `scripts/test-t12k-browser.mjs` na `next dev` `http://localhost:3024`, Chrome: PASS. Edytor, „W źródle: Bench press”, `bench-press.svg`, dialog dyktowania, etykieta PDF do 20 stron i jeden wpis w postępie. Wcześniej `npm test` 284/9, build i typecheck PASS. Płatnego Decisions, telefonu, Safari i hostingu nie wykonywano. Serwer 3024 zatrzymany.

## T12-K — tożsamość ćwiczeń, wcześniejszy zapis (2026-10-20)

`npm test`: 284 passed / 9 skipped. `npm run build` PASS, razem z typecheck. Lokalny Supabase w Dockerze, migracja `20261020170000_t12k_exercise_identity.sql` zastosowana: `test:t04:local`, `test:t05:local`, `test:t06:local`, `test:t06:http` ze szkicem mock i wyłączonym AI, `test:t08:local`, `test:t09:local` — PASS. Próba wycofana w SQL: jeden wiersz dla powtórzonego klucza, odrzucenie obcej tożsamości i sprzecznego sprzętu, ponowne użycie własnej nazwy. Chrome na `next start` `http://localhost:3022`: logowanie PASS; `/plany/import`, `/plany/edytor?voice=1` i `/postep` bez sesji wracają na logowanie. Zalogowanego importu, edytora, głosu i postępu nie klikano. Płatnego Decisions, telefonu, Safari i hostingu nie wykonywano. Serwer 3022 zatrzymany.

## T16-I — ponowny odbiór (2026-10-20)

Bramka przyjęta lokalnie. `npm test`: 274 passed / 9 skipped. `npm run build` PASS, potem `npm run typecheck` PASS. Chrome i API na produkcyjnym `next start` `http://localhost:3018`, AI wyłączone w procesie serwera, moduł Playwright spoza aplikacji. Wszystkie runnery exit 0: T15-A (21 stanów, 360/390/430 i desktop), T15-B razem z T13-C, `test-t15c-import.mjs`, `test-t15c-editor.mjs`, T15-D, T15-E przeglądarka i API (505 sesji), T15-F, T13-A RPC/HTTP, T05, T09 oraz `test-t15c-http.mjs`. Przy 390×844, po „Zostań”, dół `Zapisz i przejdź dalej` jest nad `.mobile-nav`. D046: czwarta karta podglądu ma dół 1015,75, czwarta karta treningu 1195,96875, nawigacja 768, obie doskrolowalne. Głos w T13-C i szkic HTTP importu to mocki. Asercje 503 dotyczą `process` i interpretacji głosu bez budżetu. Prawdziwe lokalne Auth/API/RPC/PostgREST obejmują resztę runnerów. Telefon, Safari i Make niewykonane. Log `/private/tmp/t16i-rerun-suite.log`. Szczegóły: [raport](reports/2026-10-19-T16-I-tempo-acceptance.md).

## Subtelne ramy (2026-10-20)

`--control` wskazuje `--tempo-line` `#344245`. Chrome na już działającym `next dev` `http://localhost:3000`, nie `next start`, viewport 390×844. Tymczasowe lokalne konto usunięte po obejrzeniu. Zmierzone ramy pól, kart i wierszy mają 1 px i kolor `rgb(52, 66, 69)`. Koloru muted `rgb(157, 170, 167)` nie było na tych ramach. Trasy: logowanie, start bez planu i z planem, plany, podgląd, import, edytor, historia, postęp, profil z formularzem 1RM, ustawienie hasła. Fokus pola kroku: `outline` 3 px `rgb(239, 196, 95)`. Za krótkie nowe hasło zostawia ramę `#ffb4ab`. Aktywnego `/trening/[id]` nie otwarto. Telefon, Safari, `npm test`, build i typecheck niewykonane.

## T16-D — widoczność zapisu serii (2026-10-20)

`npx vitest run src/components/workout-editor.test.tsx`: 7/7. Nowy test sprawdza, że `Zapisz i przejdź dalej` jest w `[data-series-save]` i poza `[data-series-scroll]`. Pozostałe testy edytora bez zmiany oczekiwań komendy.

`npm test`: 272 passed / 9 skipped. `npm run build` PASS. Następujący `npm run typecheck` PASS. `git diff --check` bez zgłoszeń.

Chrome na już działającym `next dev` `http://localhost:3000`, nie `next start`: `T15B_HTTP_BASE=http://localhost:3000 T15B_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15b-browser.mjs`. PASS, łącznie z ogonem `test-t13c-browser.mjs`. Próg asercji zapisu nie był zmieniany. Przy 390×844, po uzupełnieniu celów i „Zostań”, dół `Zapisz i przejdź dalej` jest nad `.mobile-nav`. Zrzut `/private/tmp/t15b-result.png`. Czwarta karta podglądu ma dół 1015,75 przy nawigacji 768 i jest doskrolowalna. T13-C: czwarta karta treningu ma dół 1195,97 przy nawigacji 768 i jest doskrolowalna. Szkice, retry, ACK i GET, 409, null/0, głos jako mock transportu, finish i delete PASS. Telefon i Safari niewykonane. Po buildzie `.next` jest produkcyjny; `next dev` na 3000 może wymagać restartu.

## T16-I — niezależny odbiór (2026-10-20)

Bramka nieprzyjęta. `npm test`: 271 passed / 9 skipped. `npm run build` PASS, potem `npm run typecheck` PASS. Chrome i API na produkcyjnym `next start` `http://localhost:3017`, AI wyłączone w procesie serwera, moduł Playwright spoza aplikacji: T15-A, T15-F, `test-t15c-import.mjs`, `test-t15c-editor.mjs`, T15-D, T15-E przeglądarka i API, T13-A RPC/HTTP, T05, T09 oraz `test-t15c-http.mjs` — PASS. `test-t15b-browser.mjs` exit 1: dół `Zapisz i przejdź dalej` nie jest nad `.mobile-nav` przy 390×844. Osobny `test-t13c-browser.mjs` PASS, w tym doskrolowanie czwartej karty (dół 1195,97, nawigacja 768). Pierwsza próba T15-A na `next dev` port 3000 padła na portalu deweloperskim i nie jest dowodem produktu. Głos to mock, import HTTP dostał 503. Telefon, Safari i Make niewykonane. Szczegóły: [raport](reports/2026-10-19-T16-I-tempo-acceptance.md).

## T16-H — Profil i Auth (2026-10-20)

`npx vitest run src/components/one-rep-max-editor.test.tsx`: 5/5. Idempotentny retry 1RM, blokada pól w trakcie zapisu kroku, jedno pole `new-password`, za krótkie hasło bez wywołania akcji, przywrócenie wartości po błędzie zapisu i jedno wysłanie poprawnego hasła.

`npm test`: 271 passed / 9 skipped. `npm run build` PASS. Następujący `npm run typecheck` PASS. `git diff --check` bez zgłoszeń.

Chrome: `T15F_HTTP_BASE=http://localhost:3000 T15F_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15f-browser.mjs`. Serwer to już uruchomiony `next dev`, nie `next start`. Prawdziwe lokalne Auth i API. PASS: brak `data-theme`, tło `rgb(17, 25, 28)`, 360/390/430 i desktop 1280 bez poziomego overflow, autofill `username` i `current-password`, jeden `alert` logowania z fokusem, pomoc 1RM, datowane 100 kg, krok 1,25, jedno pole `autocomplete=new-password` i minimum 12, za krótkie hasło zostaje w polu, zmiana hasła, wylogowanie danger i ponowne logowanie. Zrzuty `/private/tmp/t15f-login-390.png`, `/private/tmp/t15f-login-desktop.png`, `/private/tmp/t15f-profile.png`, `/private/tmp/t15f-profile-desktop.png` i `/private/tmp/t15f-password-390.png`. Stany demo nie weszły do tego przebiegu, bo lokalny Supabase jest skonfigurowany. Telefon i Safari niewykonane. Po buildzie `.next` jest produkcyjny.

## T16-G — Postęp (2026-10-19)

`npx vitest run src/components/progress/progress-dashboard.test.tsx src/lib/progress/analytics.test.ts src/lib/progress/repository.test.ts src/lib/progress/summary.test.ts`: 32/32. Dashboard: domyślne 3M, rekord całej historii 212,8 kg wobec ostatniego wyniku 106,4 kg, tylko klik punktu, lista nakładających się treningów, pusty stan, jeden punkt bez linii, przerwa przy 11 powtórzeniach, ciągła linia przez 0 kg i brak `0%`. Oczekiwania analityki i repozytorium bez zmian.

`npm test`: 268 passed / 9 skipped. `npm run build` PASS. Następujący `npm run typecheck` PASS. `git diff --check` bez zgłoszeń.

Chrome: `T15E_HTTP_BASE=http://localhost:3000 T15E_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15e-browser.mjs`. Serwer to już uruchomiony `next dev`, nie `next start`. PASS: 15 stanów 360/390/430, brak poziomego overflow, cele punktów co najmniej 44 px, mysz klik/drag/klik, klik poza punktem, Enter/Escape, pomoc 106,4 kg, pinch, pierwszy tap po pinch, swipe rekordów 170→0, własne daty, jeden punkt bez trendu i bez procentu, informacja o szacunku z linkiem do Profilu, korekta 250 kg i „brak powtórzeń”, desktop 1280. Zrzuty `/private/tmp/t15e-progress-390.png`, `/private/tmp/t15e-bodyweight-390.png`, `/private/tmp/t15e-progress-desktop.png` obejrzane.

API bez edycji runnera: `T15E_HTTP_BASE=http://localhost:3000 DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15e-api.mjs`. PASS: 505 sesji, 503 pozycje katalogu, ponad 500 dzieci, rekord całej historii mimo filtra dat, źródła, dwa bloki jako jeden punkt, korekta, snapshoty, 1RM, A/B/anon. Telefon i Safari niewykonane. Po buildzie `.next` jest produkcyjny.

## T16-F — Historia (2026-10-19)

`npx vitest run src/components/history/history-calendar.test.tsx src/lib/workouts/calendar.test.ts`: 6/6. Wiele sesji, godzina nieznana, osobne Wznów, `Otwórz trening`, pusty dzień, URL, strzałki przez granicę miesiąca, fokus i rok przestępny. Testy projekcji w `calendar.test.ts` bez zmiany oczekiwań.

`npm test`: 265 passed / 9 skipped. Pierwszy przebieg w sandboxie, równolegle z Chrome, przerwał jeden niezmieniony test importu limitem 5000 ms. Powtórka poza sandboxem przeszła w całości. `npm run build` PASS. Następujący `npm run typecheck` PASS. `git diff --check` bez zgłoszeń.

Chrome: `T15E_HTTP_BASE=http://localhost:3002 T15D_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15d-browser.mjs`. Serwer to już uruchomiony `next dev`, nie `next start`. Prawdziwe lokalne Auth, API i RPC. PASS: 360/390/430 i desktop 1280, dni co najmniej 44 px (przy 360 szerokość 44,56 i wysokość 48), brak poziomego overflow, tap, klawiatura, pusty dzień, wiele sesji, legacy, abandoned, rok przestępny, DST, północ, zmiana strefy, powrót do miesiąca i dnia, korekta finish bez zmiany snapshotów, usunięcie aktywnej sesji, izolacja A/B/anon. Zrzut `/private/tmp/t15d-calendar-390.png`. Telefon i Safari niewykonane. Po buildzie `.next` jest produkcyjny.

## T16-E — Import, korekta i edytor (2026-10-19)

`npx vitest run src/components/import-workspace.test.tsx src/components/import-review.test.tsx src/components/compact-plan-editor.test.tsx src/components/plan-editor.test.tsx src/components/voice-input.test.tsx`: 48/48. Pusta historia i statusy, ponowienie bez planu, trzy kroki, jedno pytanie, anulowanie, indywidualna seria, superseria, retry publikacji edytora i głos.

`npm test`: 265 passed / 9 skipped. `npm run build` PASS. Następujący `npm run typecheck` PASS. `git diff --check` bez zgłoszeń.

Chrome na już działającym `next dev` `http://localhost:3002`, nie `next start`: `T15C_HTTP_BASE=http://localhost:3002 T15C_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15c-import.mjs` oraz ten sam zestaw dla `scripts/test-t15c-editor.mjs`. Oba PASS. Import: dwa główne źródła z wyśrodkowanymi ikonami, trzy wtórne, brak poziomego overflow 360/390/430, głos otwiera dialog edytora. Korekta: desktop 1280 pokazuje źródło obok planu, 390 otwiera pełny dialog, PDF strona 2 i XLSX dwa arkusze, trzy kroki z przeładowaniem, blokada braku celu, anulowanie nazwy, identyczny retry zatwierdzenia. Edytor: cztery karty, całe karty, anulowanie, katalog, superseria, dialog o szerokości 390, fokus, prawdziwy zapis z utratą odpowiedzi i retry, stare serie oraz snapshoty. Dane syntetyczne. Płatnego AI nie było. Telefon i Safari niewykonane.

HTTP: `T15C_HTTP_BASE=http://localhost:3016 CRON_SECRET` ustawiony tylko w tym procesie jako wartość lokalna `t16e-local-only`, `node scripts/run-local-t05.mjs scripts/test-t15c-http.mjs` na `next start -p 3016` z `OPENAI_IMPORT_ENABLED=false` i pustym kluczem. PASS: A/B/anon, źródło, korekta, podpisany upload, formaty, pytanie i retry zatwierdzenia. `process` zwrócił 503, bez wywołania modelu. Lokalny `.env` ma włączony import AI, więc tego testu nie puszczano na `localhost:3002`. W `.env` nie ma `CRON_SECRET`. Serwer 3016 zatrzymano. Po buildzie `.next` jest produkcyjny.

## T16-D — Trening (2026-10-19)

`npx vitest run src/components/workout-editor.test.tsx src/components/workout-voice.test.tsx src/components/workout-finish.test.tsx src/components/workout-state.test.ts src/components/workout-start.test.tsx`: 19/19. Retry i identyczna komenda, ACK i GET, 409 ze szkicem, trzy decyzje nawigacji, brak zapisu przy otwarciu, trzy stany obciążenia, czas i dystans bez pola powtórzeń, jawny offset DST i odrzucenie nieistniejącej godziny, kotwica głosu.

`npm test`: 263 passed / 9 skipped. `npm run build` PASS. Następujący `npm run typecheck` PASS. `git diff --check` bez zgłoszeń.

Chrome: `T13C_HTTP_BASE=http://localhost:3002 T13C_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t13c-browser.mjs`. Serwer to już uruchomiony `next dev`, nie `next start`. Prawdziwe lokalne Auth i API. 360/390/430 bez poziomego overflow, cele 44 px, viewport 500 px dla klawiatury. Czwarta karta przy 390 ma dół 1195,97 wobec nawigacji 768 i przechodzi doskrolowanie D046. Szkice, retry, ACK i GET, 409, rundy, opcjonalna, null/0, poprawka historyczna, głos jako mock transportu, korekta czasu bez zmiany snapshotów, konflikt, delete i ponowne logowanie PASS. Powtórka po poprawce liczników na 360 px też PASS.

Regresje bez płatnego AI, ten sam lokalny Supabase i `localhost:3002`: `scripts/test-t05-api.mjs` PASS, `T13A_HTTP_BASE=http://localhost:3002 scripts/test-t13a-api.mjs` RPC i HTTP PASS, `T09_HTTP_BASE=http://localhost:3002 scripts/test-t09-api.mjs` HTTP 503 bez budżetu głosu i PostgREST PASS. Telefon i Safari niewykonane.

## T16-C — Start, Plany i podgląd (2026-10-19)

`npx vitest run src/components/plan-carousel.test.tsx src/components/plan-preview.test.tsx src/components/workout-start.test.tsx src/components/training-preview.test.tsx`: 15/15. Karuzela: klawiatura, wyrównanie drugiego slajdu, archiwum bez startu. Podgląd: osiem serii, superseria, archiwum, fokus karty. Start: retry tej samej koperty oraz jedna i wiele sesji konfliktu.

`npm test`: 259 passed / 9 skipped. `npm run build` PASS. Następujący `npm run typecheck` PASS.

Chrome: `T15B_HTTP_BASE=http://localhost:3002 T15B_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15b-browser.mjs`. Serwer to już uruchomiony `next dev`, nie `next start`. Ten sam adres przez `127.0.0.1` nie hydratował klienta, więc klik i Enter na karcie nie działały; `localhost` PASS.

T15-B: brak poziomego overflow 360/390/430 i desktop 1280, sidebar na desktopie, jedno `Rozpocznij` na starcie przy trzech planach, czwarta karta podglądu przy 390 doskrolowalna (dół przy starcie przewinięcia 1015,75 wobec nawigacji 768), szczegół ośmiu serii i źródła, reload karuzeli, klawiatura, swipe, drag, Enter, powrót historii i szkic. Potem niezmieniony T13-C PASS: komendy, retry, ACK i GET, 409, szkice, daty, delete, legacy, głos jako mock transportu. Przy 390 czwarta karta treningu kończy się na 766,19, nadal nad nawigacją 768; stara bramka T13-C nie była zmieniana. Telefon i Safari niewykonane. Błąd odczytu i pusta biblioteka nie były odtwarzane w Chrome, bo lokalne API odpowiadało.

## T16-B — lokalny fundament Tempo (2026-10-19)

`npx vitest run src/components/ui/ui.test.tsx`: 9/9. Przycisk nie wysyła formularza, pole łączy etykietę, podpowiedź i błąd, dymek zamyka się poza nim i przez Escape, ilustracja nie podstawia innego wariantu. Stepper przyjmuje wpis i nie zamienia pustki na zero; zero przy minimum zostaje zerem. Segment ma `aria-checked` i strzałkę. Wiersz, karta, status, komunikat i pusty stan niosą tekst. Dialog: Escape, Anuluj i Zamknij odrzucają pole i wracają fokus; Zastosuj jest osobne. Nawigacja ma pięć tras oraz osobny tekst konta prywatnego i demo.

`npm test`: 256 passed / 9 skipped. `npm run build` PASS po usunięciu tymczasowego zrzutu Make, który pierwszy przebieg typechecku builda odrzucił. Następujący `npm run typecheck` PASS.

Chrome: `T15A_HTTP_BASE=http://127.0.0.1:3002 T15A_PLAYWRIGHT_MODULE=<lokalny Playwright> DO_NOT_TRACK=1` oraz `node scripts/run-local-t05.mjs scripts/test-t15a-browser.mjs`. Serwer to już uruchomiony lokalny Next, nie `next start`. PASS: 21 stanów, 360/390/430 i desktop 1280, brak `data-theme`, `theme-color` `#11191c`, tło `rgb(17, 25, 28)`, Inter, pięć celów nawigacji co najmniej 44 px, aktywna trasa z powierzchnią `#253235`, stopka nad nawigacją, skip-link, obrys fokusu 3 px, `transition-duration` `0s` przy reduced motion, sidebar na desktopie, brak błędów JS. Kontrast tokenów w runnerze: tekst, muted, akcent z tekstem, sukces, błąd i ostrzeżenie co najmniej 4,5:1; fokus akcentu co najmniej 3:1. Samodzielny pomiar tych par dał odpowiednio od 5,51:1 (muted na podniesionej powierzchni) do 16,20:1 (tekst na tle). Linia `#344245` ma 1,48:1 wobec powierzchni. Od 2026-10-20 jest też subtelną ramą pól i kontrolek. Próg 3:1 zostaje przy fokusie i tekście, nie przy ramie. Telefon i Safari niewykonane. `scripts/test-t15f-browser.mjs` nadal sprawdza `data-theme="night"` i nie był uruchamiany; plik należy do T16-H.

## T15-A — lokalny fundament (2026-10-18)

Integrator przyjął bramkę A: npm test204 passed/9 skipped (AI/live off), build przez run-local-app i typecheck PASS. Nowy scripts/test-t15a-browser.mjs, uruchamiany przez run-local-t05 z T15A_PLAYWRIGHT_MODULE, sprawdza prawdziwe lokalne Auth/RPC i21 stanów360/390/430, wszystkie linki nawigacji, font/Noc/44px, skip-link i desktop1280. Bez błędów JS. Długi email profilu początkowo powodował overflow360; poprawiony i test ponowiony. Kontrasty tokenów policzone; telefon/Safari niewykonane. B–G nie są jeszcze odebrane.

# Plan weryfikacji

## Makiety T14-R6 — prawdziwy klik myszy w iframe

`node docs/design/t14-r6-verify.mjs` z opcjonalnymi `T14_GALLERY_URL`, `T14_REPORT_DIR`, `T14_PLAYWRIGHT_MODULE`. [Publiczny raport](design/t14-r6-verification.json), prywatny poza repo. Realne pointerdown/up/click przez `page.mouse` w sandboxowanych iframe, bez force/dispatch/programowego click:5 metryk, widoczna informacja z właściwą datą i źródłową serią dla kg/estymacji, utrzymana po propagacji zdarzenia i mieszcząca się w viewportcie. Pusty wykres i obszar poza nim zamykają. Drag przesuwa daty bez otwierania, kolejny klik otwiera. Dodatkowo6 stanów360/390/430px, klawiatura i pierwszy celowy tap po pinch. Oba runnery R6 PASS; prywatny R5 ponowiony PASS dla dotyku/swipe/pomocy. To nie fizyczny telefon/Safari.

R5 nie obejmował wcześniej zwykłego kliknięcia myszy i nie wykrywał natychmiastowego pointer capture. Wstępny runner R6 dodatkowo otwierał pomoc przez klik już aktywnej metryki, zasłaniając testowany punkt; poprawiono setup testu na wybór metryki tylko gdy nieaktywna. Końcowe wyniki powyżej dotyczą poprawionego setupu i UI. Nie ponawiano pełnych szerokości wszystkich ramek/produktu, bo nie zmieniono układu, CSS lub src.

## Makiety T14-R5 — punkty, pomoc i Noc

Celowany `node docs/design/t14-r5-verify.mjs`, opcjonalnie `T14_GALLERY_URL`, `T14_REPORT_DIR`, `T14_PLAYWRIGHT_MODULE`. Publiczny [raport R5](design/t14-r5-verification.json), prywatny poza repo. Sprawdza Noc we wszystkich ramkach/po reload, potwierdzony Profil A, pochodzenie każdego widocznego punktu z dat treningów, odczyt daty/metryki, pomoc1RM i współczynniki, Enter/Escape oraz brak overflow przy360/390/430px. CDP touch: wyłącznie punkt otwiera, pusty wykres i obszar poza nim zamykają, PR przesuwane w obie strony dla obu ćwiczeń. Wynik końcowy: oba runnery PASS, swipe104→0px. To natywny scroll wywołany syntetycznym dotykiem, nie fizyczny telefon.

Regresję szerokości/wszystkich ramek i gestu pinch nadal wykonuje R4 poniżej. W tej rundzie192+372 PASS,216 prywatnych kontroli palet PASS. Po ostatniej korekcie obszaru kliknięcia powtórzono R5; nie ponawiano całego produktu lub testów fizycznych. Kontrole składni obejmują też `t14-themes.py` i runner R5; motyw głównej galerii i porównanie palet korzystają ze wspólnych tokenów.

## T15 — przyszłe bramki implementacji

[Plan T15](T15_UI_IMPLEMENTATION.md) wskazuje kontrole każdego etapu i własność plików. A–G nie są wykonane; prompty i karty planned nie dowodzą testów. A weryfikuje fundament/Noc, B regresje T13-C, C edytor/import, D pełne T13-D, E domenę metryk/PR/pełnej historii i prywatność, F Auth/ręczny1RM, G cały przepływ i T13-E. Wykonawca E musi policzyć oczekiwane wartości niezależnie od implementacji, uwzględnić ponad500 rekordów i rozdzielić okno wykresu od całej historii PR. Mockupowy fixture nie wystarcza do odbioru rzeczywistych danych. Ręczny zapis i snapshoty testować oddzielnie od szacowanego1RM. Uruchomione testy i ograniczenia dopiero w rzeczywistych handoffach etapów.

## Makiety T14-R4 — oddzielnie od testów produktu

Aktualny runner: `node docs/design/t14-r4-verify.mjs`, opcjonalnie `T14_GALLERY_URL`, `T14_REPORT_DIR`, `T14_PLAYWRIGHT_MODULE`. Prywatne raporty/zrzuty kierować poza repo. Chrome headless sprawdza wszystkie ramki360/390/430px, cztery karty390×844, otwieranie edytora całą kartą/Enter i cancel, dwa przykłady Postępu, położenie metryk i zakresów, PR całej historii niezależne od zakresu, liczby z tych samych fixture'ów i null/0. Dodatkowo syntetyczny pinch in/out, pionowy gest, klawiatura wykresu i przewijanie PR. [Publiczny raport R4](design/t14-r4-verification.json):192 kontrole; prywatny raport poza repo:372. Inter faktycznie załadowany w ramkach. To test HTML makiet, nie domenowego algorytmu analityki produktu.

Palety: `node docs/design/t14-color-verify.mjs` z odpowiednim URL i prywatnym katalogiem raportu. Runner dostosowano do selektorów R4; w tej rundzie uruchomiono prywatny wariant216 kontroli, formularz w ciemnej palecie i przerysowanie wykresu. Publiczny raport palet pochodzi z wcześniejszej rundy, nie jest odbiorem R4. Kontrole tokenów nie zastępują pełnego audytu dostępności.

Składnia: AST generatorów full/R3/R4/color, `node --check` interakcji/runnera R4, runnera kolorów i skryptów zewnętrznych wygenerowanych galerii. Font/licencję porównać z SHA256 i długością w `design/fonts/manifest.json`. Publiczne HTML sprawdzić pod kątem nazw prywatnego źródła. `git diff --check`. Telefon i Safari nadal niesprawdzone. Nie ponawiano builda/API/DB produktu, bo ta runda nie zmienia src.

## Historyczne makiety T14-R3

Runner `node docs/design/t14-r3-verify.mjs` dotyczy poprzedniego układu. Sprawdzał ramki360/390/430px, cztery pełne karty390×844, potwierdzone wybory, ikony, formularz ćwiczenia (cancel/ponowne otwarcie/indywidualne serie/zero), daty i gesty Postępu. Wymaga adaptacji przed uruchomieniem na R4: osobny przycisk edycji został usunięty, a trzy kompozycje Postępu zastąpiły dwa przykłady jednego układu. Syntetyczny multitouch nie zastępuje fizycznego telefonu lub Safari.

Starsze `t14-full-verify.mjs` i `t14-r2-verify.mjs` opisują poprzednie kompozycje, wybór ośmiu ekranów i zakresy4/8 tygodni. Ich historyczne raporty nie są odbiorem R3. Nie uruchamiać bez adaptacji ani nie interpretować niezgodnego selektora jako regresji wymagań. R3 nie zmienia kodu produktu, dlatego nie ponawiano builda/API/DB; wyniki i ograniczenia w najnowszym handoffie T14.

Status: plan weryfikacji. T01–T05 mają testy opisane w handoffach. T06 ma testy domenowe, lokalny Auth/API/Storage A/B/anon oraz HTTP E2E na mocku AI. Prawdziwy model sprawdzono osobno na 12 syntetycznych przypadkach i trzech prywatnych plikach; wyniki i granice opisuje [handoff T06](handoffs/2026-10-12-T06-proby-realne-pliki.md). T07 ma test komponentu i rozszerzony HTTP na mocku; szczegóły w [handoffie T07](handoffs/2026-10-12-T07-ekran-importu.md).

## Warstwy

- Testy domenowe: procenty, zaokrąglenia, daty maksimum, rozróżnianie braków, snapshoty i statystyki.
- Integracyjne z bazą: migracje, RLS, relacje między właścicielami, transakcje, rewizje, idempotencja.
- E2E: logowanie, ręczny plan i trening, korekta importu, głos z deterministycznym mockiem, odczyt historii.
- Próby prawdziwego AI: oddzielny raport z modelem, kosztami i wersją zestawu. Mocki nie są dowodem jakości rozpoznawania.
- Testy na urządzeniach: aparat, mikrofon, formaty nagrań, klawiatura, przerwanie sieci. Docelowo Safari/iPhone i Chrome/Android; brak dostępu do urządzenia raportujemy zamiast deklarować zgodność.

## Krytyczne scenariusze odbioru

1. Użytkownik A nie może odczytać, zmienić, usunąć ani przypisać sobie obiektu B, również pliku i rekordu dziecka. Anonimowy użytkownik nie odczytuje danych prywatnych.
2. Plan 4 × 6 przy 75% z 1RM 120 kg daje 90 kg; przy braku maksimum kg pozostaje puste. 123 kg × 75%, krok 2,5 kg daje 92,5 kg. Remis jest rozstrzygany zgodnie ze specyfikacją.
3. Zmiana 1RM i planu nie przelicza rozpoczętych/zakończonych treningów. Nowa sesja korzysta z właściwej wersji i maksimum obowiązującego w jej dacie.
4. Trening z ręczną serią, pominięciem i dodatkowym ćwiczeniem zachowuje wszystkie wyniki po ponownym logowaniu.
5. Powtórzone żądanie po timeout nie tworzy drugiej serii/planu. Dwie karty ze starymi rewizjami nie nadpisują się bez konfliktu.
6. PDF tekstowy, skan i zdjęcie tworzą edytowalny szkic. Sprawdzamy kolejność, różne serie, procent, kg, zakres powtórzeń, notatkę i superserię.
7. Nieczytelny fragment i nieznana jednostka są widoczne jako niepewne; błędny, za duży lub przerwany plik nie staje się planem.
8. „Pięć po sto”, poprawka „nie osiem, siedem”, komentarz i dodatkowe ćwiczenie trafiają do właściwego kontekstu albo do doprecyzowania.
9. Anulowane nagranie, cisza, odmowa mikrofonu i spóźniony wynik AI nie powodują zapisu. Zmiana aktywnego ćwiczenia nie zmienia celu wcześniejszej komendy.
10. Polecenie atakujące w treści PDF/transkrypcji nie omija uprawnień ani zatwierdzania.
11. Awaria OpenAI pozostawia możliwość ręcznego treningu. Utrata sieci nie pokazuje fałszywego sukcesu.
12. Sprzątanie audio i plików tymczasowych działa także po błędach; logi nie zawierają ich treści ani kluczy.

## Wykonane testy T03

Lokalny test T03 (`npm run test:t03:local`) pokrywa izolację kont, cudze identyfikatory rodziców, prywatny Storage, zaproszenie i wygasły JWT. Nie pokrywa jeszcze środowiska hostowanego ani ręcznego interfejsu na urządzeniu. T04 i T05 sprawdziły własne ścieżki Auth/API po podłączeniu edytora i zapisu; pełny odbiór urządzeń oraz ponowienie Storage/Mailpit pozostają do T10.

## Wykonane testy T04

`npm run test:t04:local` na prawdziwym lokalnym Auth/PostgREST sprawdza plan A/B, różne serie, rampę, superserię, ponowienie publikacji, konflikt starej wersji, niezmienność wcześniejszych serii, zapis i niezmienność 1RM oraz izolację A/B/anon. Testy domenowe pokrywają wybór maksimum według daty, brak maksimum, procenty i remis przy zaokrągleniu. Test komponentu sprawdza dodanie serii i wysłanie nowej wersji. W T04 nie uruchomiono ręcznego testu na urządzeniu ani pełnego testu T03 Storage/Mailpit po migracji; lokalny test T04 użył Auth/PostgREST. Szczegóły: [handoff T04](handoffs/2026-10-11-T04-edytor-planu-1rm.md).

## Wykonane testy T05

`npm run test:t05:local` na prawdziwym lokalnym Auth/PostgREST sprawdza start i snapshot celów, brak 1RM, zapis/poprawkę/pominięcie serii, dodatkową serię i ćwiczenie, komentarz, zakończenie, retry po utracie odpowiedzi, stary `expected_revision`, niezmienność historii po nowej wersji i 1RM, ponowne logowanie oraz izolację A/B/anon. HTTP E2E przez produkcyjny serwer Next sprawdza strony planu/treningu/historii, komendy, wznowienie po nowej sesji, poprzedni wynik i anon. Test komponentu sprawdza ponowienie dokładnie tej samej komendy po błędzie sieciowym. Nie wykonano pełnego klikanego E2E w przeglądarce ani testów urządzeń/hostingu; szczegóły w [handoffie T05](handoffs/2026-10-11-T05-wykonanie-historia.md).

## Zestaw oceny AI

Proponowany zestaw startowy: minimum 12 przypadków importu obejmujących PDF tekstowy/skan/zdjęcie/tekst, w tym nieczytelny i niejednoznaczny zapis; minimum 20 polskich wypowiedzi obejmujących każdy typ komendy, poprawki, liczby dziesiętne, ciszę i hałas. Przykłady oznaczone jako syntetyczne; prywatne pliki tylko po uzgodnieniu i poza publicznym repozytorium.

Krytyczne fixture'y dotyczące jednostek, celu zapisu, anulowania i uprawnień muszą przechodzić w całości. Roboczy cel jakości: co najmniej 95% poprawnych jednoznacznych pól na opisanym zestawie; raport osobno pokazuje opuszczenia i błędne dopowiedzenia. To próg odbioru do oceny w T06, nie deklarowana skuteczność produktu. Mała próbka nie dowodzi jakości na dowolnym planie.

Opóźnienia p50/p95 i koszt mierzymy, bez obiecywania konkretnych wartości przed pomiarem. W razie niespełnienia kryteriów zapisujemy poprawki i nie oznaczamy integracji jako gotowej. Każda zmiana modelu/promptu wymaga powtórzenia związanych z nią przypadków regresji.

## Wykonane testy T06

`fixtures/t06/cases.json` i wygenerowane pliki zawierają 12 syntetycznych źródeł pięciu odmian: tekst, tekstowy PDF, skan PDF, PNG i JPEG. Testy jednostkowe sprawdzają formaty, PDF do 6 stron, XLSX, błędny plik, brak danych, jednostki, pytania i format żądania Responses. Lokalny test Supabase używa prawdziwych Auth/PostgREST/Storage dla A/B/anon, limitu budżetu, retry, równoległego roszczenia, przejęcia wygasłej dzierżawy, spóźnionego wyniku, zatwierdzenia i sprzątania. Test HTTP używa produkcyjnego builda Next, sprawdza podpisany upload XLSX, błędny PDF, 503 bez klucza/budżetu, pytania, zatwierdzenie i cron. AI w testach lokalnych i HTTP jest mockiem. Osobny [raport prawdziwego modelu v8](reports/2026-10-12-T06-live-v8.json) ma 12/12 poprawnych szkiców, 90/90 ocenianych pól i zero opuszczeń/dopowiedzeń. Prywatne PDF/XLSX dają szkice z brakami wymagającymi pytań; nie wolno przenosić wyniku syntetycznego na dowolny plan. Pełny UI i urządzenia pozostają T07/T10.

## Wykonane testy T07

Test komponentu `src/components/import-workspace.test.tsx` sprawdza stronowanie 55 pytań, przeniesienie liczby serii do poprawionego dokumentu, jawny zapis korekty i symulowaną odmowę aparatu. Rozszerzony `npm run test:t06:http` sprawdza prywatny podgląd źródła tekstu i XLSX, brak dostępu B/anon, przywrócenie korekty po GET, podpisany upload, błędny PDF, odrzucenie HEIC, anulowanie i powtórzone zatwierdzenie. `npm run test:t06:local` ponownie sprawdza lokalne Auth/PostgREST/Storage. AI w tych testach jest mockiem; nie wykonano nowej próby prawdziwego modelu. Brak fizycznego telefonu; wykryty emulator Android nie przeszedł pełnego testu UI. Środowisko hostowane pozostaje niesprawdzone.

## Wykonane testy T08

`src/lib/progress/summary.test.ts` sprawdza ręcznie policzone 940 kg, 1140 kg po poprawce, warianty, asystę, ciężar na jeden hantel i pominięcie. `npm run test:t08:local` używa prawdziwego lokalnego Supabase Auth/PostgREST dla dwóch syntetycznych kont i anonima; z uruchomionym produkcyjnym Next i `T08_HTTP_BASE=http://localhost:3005` sprawdza prywatny widok, filtry oraz odświeżenie po korekcie historycznej serii. Nie używa mocka bazy ani AI. `npm run typecheck`, `npm test` i `npm run build` przeszły. Nie wykonano testu fizycznych urządzeń, pełnego klikanego E2E ani hostowanych usług.

## Wykonane testy T09

Kontynuacja 2026-10-12/13: użytkownik zatwierdził 0,50 USD wyłącznie na T09. Cztery serie `RUN_T09_LIVE=true T09_LIVE_BUDGET_USD=0.50 DO_NOT_TRACK=1 npx vitest run src/lib/voice/live-evaluation.test.ts` wykonały prawdziwe OpenAI na syntetycznych danych. Pierwsza seria 11/20 obnażyła zbyt dosłowną ocenę komentarzy/nazw i błąd przy brakującym ćwiczeniu. Następnie zastąpiono sprzeczny z instrukcją przypadek tekstowy „Szum: pięć po sto” opisem wyniku rzeczywiście nieczytelnego, dlatego wynik v1 nie jest bezpośrednio porównywalny z v2–v4. Druga seria 19/20 miała niepoprawny plan, trzecia 19/20 poprawny plan, a końcowa po promptcie `voice-pl-v2` uzyskała 20/20 tekstów, poprawny plan i 2/2 krótkich transkrypcji WebM (czystej i z różowym szumem). [Raport końcowy](reports/2026-10-12-T09-live.json) podaje p50/p95 tekstu 4,351/8,622 s, audio 0,552/0,552 s i szacunkowo 0,002595 USD za końcową serię; [v1](reports/2026-10-12-T09-live-v1.json), [v2](reports/2026-10-12-T09-live-v2.json), [v3](reports/2026-10-12-T09-live-v3.json) zachowują porażki. Suma szacowana: 0,010376 USD. Prawdziwy głos człowieka, fizyczny telefon i rachunek dostawcy nie były testowane.

Po poprawkach `npm test` — 65 aktywnych testów i 7 pominiętych; `DO_NOT_TRACK=1 npm run test:t09:local` i `DO_NOT_TRACK=1 npm run test:t05:local` na lokalnym Auth/PostgREST, `npm run build` oraz końcowy sekwencyjny `npm run typecheck` — sukces. Równoległy `typecheck` podczas generowania `.next` miał chwilowy błąd braku `routes.js`; powtórzenie po buildzie przeszło. Testy komponentów nadal są mockami dla anulowania i opóźnionego wyniku. ADB wykazało tylko emulator; na fizycznym telefonie pozostają uprawnienia mikrofonu, WebM/MP4, anulowanie, opóźniony wynik i zmiana ćwiczenia. Lokalny licznik T06 ma próbę aktywną do 2026-10-13 12:23 UTC; pełną regresję T06 trzeba ponowić po wygaśnięciu lub w izolowanym środowisku, bez usuwania danych.

`src/lib/voice/domain.test.ts` obejmuje kontrakt na 20 syntetycznych polskich wypowiedziach, w tym korektę, negację, brak jednostki i tekst oznaczający hałas. Oczekiwane odpowiedzi są mockami, więc test nie mierzy jakości modelu ani mikrofonu. `src/components/voice-input.test.tsx` sprawdza brak mikrofonu i anulowanie przed opóźnionym wynikiem. `src/components/workout-voice.test.tsx` sprawdza jawną akceptację, niezmienność kotwicy i zachowanie innych pól poprawianej serii. `npm run test:t09:local` po migracjach sprawdza rzeczywisty lokalny Auth/PostgREST, A/B/anon, atomowe dodanie ćwiczenia z seriami, retry, konflikt rewizji i globalny budżet. Przy produkcyjnym Next i `T09_HTTP_BASE=http://localhost:3005` sprawdza HTTP A/B/anon, obcy cel, starą rewizję i odmowę płatnej próby bez osobnego budżetu. Późniejsze prawdziwe wywołania OpenAI na syntetycznych danych opisano wyżej; fizycznego mikrofonu nadal nie sprawdzono. Formaty WebM/MP4 są zaimplementowane i sprawdzone statycznie; ich rzeczywiste generowanie w Safari/iPhone i Chrome/Android pozostaje do odbioru urządzeń.

Kontynuacja 2026-10-13: test komponentu z mockiem `MediaRecorder` wymusił wybór MP4 i asynchroniczny błąd nagrywania; po błędzie ścieżka zatrzymuje ślad mikrofonu i nie wysyła częściowego audio. Drugi test zmienił docelową serię podczas oczekującej interpretacji i potwierdził odrzucenie spóźnionej propozycji. `npm test`: 67 przeszło, 7 pominięto. `DO_NOT_TRACK=1 npm run test:t09:local` oraz ten sam test z `T09_HTTP_BASE=http://localhost:3005` przeszły na lokalnym Auth/PostgREST i produkcyjnym Next; `DO_NOT_TRACK=1 npm run test:t05:local`, `npm run build` i sekwencyjny `npm run typecheck` także przeszły. Początkowy T09 lokalny nie wystartował w sandboxie z powodu odmowy dostępu do socketu Dockera; powtórzenie z uprawnieniem przeszło. Te testy nie generują MP4 na fizycznym telefonie. ADB wykryło tylko emulator, USB nie wykazało telefonu, a użytkownik potwierdził jego brak. Nie wykonano fizycznego odbioru, nowej płatnej próby ani pełnej regresji T06 przed 2026-10-13 12:23 UTC; nie usuwano istniejących prób.

Odbiór emulatora 2026-10-13: użytkownik wyraźnie dopuścił emulator jako wystarczający na ten etap. `adb devices -l` wskazało `emulator-5556`; Chrome otworzył przez `adb reverse tcp:3007 tcp:3007` tymczasową stronę lokalną w bezpiecznym kontekście `localhost`. Zezwolono na mikrofon na poziomie witryny i Androida. `MediaRecorder.isTypeSupported` zwrócił `true` dla WebM/Opus i audio/MP4. Nagranie WebM/Opus utworzyło 48 449 B, wymuszone MP4 31 685 B; po obu `track.readyState` wynosił `ended`. Anulowanie aktywnego nagrania dało `discarded=true` i również zakończyło ścieżkę. Nie wysłano nagrań do API ani nie zapisano ich w repo. `npm test` po równoległej poprawce: 67 przeszło, 7 pominięto; końcowo ponownie przeszły `npm run typecheck` i `npm run build`. To sprawdzenie zachowania przeglądarki i mikrofonu emulatora, nie pełne klikalne E2E aplikacji; opóźniony wynik i zmiana ćwiczenia są pokryte mockami komponentów oraz kontrolą rewizji w testach lokalnych. Fizyczny telefon, Safari/iPhone, hosting i rzeczywisty hałas pozostają niesprawdzone i przechodzą do szerszego odbioru T10. Pełnej regresji T06 nie ponowiono przed 2026-10-13 12:23 UTC.

## Raport testów

Każdy raport/handoff podaje: zadanie, wersję kodu (jeśli istnieje), środowisko, polecenia lub kroki manualne, wynik, błędy, zakres mocków, niewykonane sprawdzenia i ograniczenia. Przed betą komplet krytycznych scenariuszy oraz smoke test na wdrożeniu.

## Odbiór T06-R1 (2026-10-13)

- `npm test`: domena, pytania, stabilne cele po przestawieniu, ręczne rozwiązanie braków, AMRAP, zakresy i opcjonalność, izolacja wariantów nazw, źródłowe scalenia/przekreślenia/data. `t06r1-source-audit.test.ts` porównuje każdą pozycję PDF z niezależnym odczytem i kwalifikuje wszystkie końcowe pytania. Nie wywołuje AI; wykorzystuje zachowany wynik prawdziwej próby.
- `DO_NOT_TRACK=1 npm run test:t06r1:local`: prawdziwe lokalne Auth/PostgREST, retry publikacji i startu, zakresy, całe opcjonalne ćwiczenie, złożone bloki, nazwy oryginalne, niezmienne snapshoty, nowa wersja bez zmiany historii, A/B.
- `DO_NOT_TRACK=1 npm run test:t06:local`: 3/3. Test rezerwacji odczytuje już istniejący globalny licznik i testuje jeden dodatkowy slot oraz odmowę dla drugiego konta. Nie usuwa istniejących prób i nie wykonuje płatnego wywołania.
- Regresje `test:t04:local`, `test:t05:local`, `test:t08:local`: sukces na rzeczywistej lokalnej bazie; dane syntetyczne. Chronią wcześniejsze wersje, 1RM, retry i poprawki wyników.
- `DO_NOT_TRACK=1 npm run test:t06:http`: produkcyjny build, lokalny serwer 3006, mock AI; A/B/anon, podpisany upload, źródło i `view=grid`, korekta/reload, stare szkice v1, zatwierdzenie/retry, błędne pliki i retencja.
- Opcjonalny klikalny odbiór Chrome: to samo polecenie z `T06R1_PLAYWRIGHT_MODULE` wskazującym absolutną ścieżkę `playwright/index.mjs`. Runtime desktopowy udostępnia moduł przez `load_workspace_dependencies`; nie wymaga nowej zależności aplikacji. Skrypt tworzy własne konta i używa rzeczywistych źródeł oraz zachowanych szkiców z `after-4`; po teście usuwa tylko własne konta i obiekty. Sprawdza 6 stron PDF, zoom/pełny ekran/Escape, skok na stronę 4, mobilny podgląd, wszystkie arkusze, przekreślenie i dolne wiersze, zakres/AMRAP, kolejność i korektę po odświeżeniu. Zrzuty w `/private/tmp` są prywatne. Nie jest to ponowne żądanie modelu.
- Prawdziwe próby: `node scripts/evaluate-t06-real.mjs before|after[-numer]` jest opt-in i wymaga klucza/włączenia/pozostałego zatwierdzonego budżetu T06. Zachowuje próby, by nie resetować limitu. Nie uruchamiać rutynowo podczas regresji. Baseline, kolejne niezaliczone iteracje i końcowe porównanie: [T06_IMPORT](T06_IMPORT.md). Seria syntetyczna v11: 12/12 i 88/90 pól; celowane v12 po poprawce: 2/2 i 17/17. Rozdzielamy obie serie.

W tej sesji poprawiono test oczekiwania na element `option` (jest ukryty w natywnym select) i nowy audyt wymagający jawnych typów. Kontrola zrzutu wykryła również rzeczywiste poszerzanie mobilnego podglądu i za jasny tekst kontekstu; poprawiono CSS oraz dodano sprawdzenie szerokości. Nie deklarujemy hostingu, fizycznego telefonu ani dowolnej tabeli jako przetestowanych.

## Odbiór T07-R1 (2026-10-13)

Nowe testy `src/lib/imports/review.test.ts` i `src/components/import-review.test.tsx` sprawdzają projekcję bloków, 7–8 i złożony dip, jawny pusty cel, ID/uwagi/opcjonalność, zmianę liczby serii właściwego bloku, unieważnianie potwierdzeń i odpowiedzi, kolejność kluczy JSONB, przeniesienie ćwiczenia, trzy kroki, anulowanie formularza i dodawania, błąd zapisu/retry, wybory ankiety, 55 pytań z jednym widocznym, indywidualną serię, tworzenie/rozłączenie superserii i ponowienie publikacji tym samym ID po utracie odpowiedzi. Ostatni przypadek ma mock odpowiedzi sieciowej; rzeczywistą idempotencję potwierdza osobno HTTP/RPC.

`DO_NOT_TRACK=1 T07R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t07r1:http` uruchamia produkcyjny build i lokalny Next/Supabase. HTTP testuje A/B/anon, krok w GET/PATCH, błędne metadata, starszy PATCH bez kroku, retry, źródła i zatwierdzenie. Chrome na własnych kontach sprawdza trzy zachowane rzeczywiste źródła: karty bez pełnych formularzy, zakres/blok/cancel, krok/reload/potwierdzenia, niejasną przerwę, wybory sprzętu i podstawę ciężaru, datę jako testowy zakres z AMRAP, grupowe pytanie i „Później”, wszystkie strony/arkusze, fokus i widok 390×844 bez overflow. Nie publikuje prywatnych planów. Moduł Playwright pochodzi z runtime desktopowego, nie z nowej zależności aplikacji. Starsze polecenie T06-R1 przeglądarki przekierowuje do aktualnej ścieżki.

Zrzuty do prywatnej kontroli: `/private/tmp/t07r1-cards-desktop.png`, `t07r1-cards-mobile.png`, `t07r1-edit-mobile.png`, `t07r1-survey-desktop.png`. Oceniono układ; kontrole keyboard/focus wykonano w Chrome, nie tylko jsdom. Testy komponentu nie dowodzą działania fizycznego telefonu.

Pierwsze przebiegi poprawiono: opcje selektorów testu, oczekiwanie na zapis, błędne założenia testu o kolejności pytań i liczbie ćwiczeń. W implementacji dodano stabilną serializację JSONB, powrót na początek kroku, jawną pętlę fokusu oraz retry publikacji bez ponownego PATCH już zatwierdzonego szkicu. Nie wywołano nowego AI. Ręczny edytor i parser źródeł pozostają poza przebudową UX. Wyniki końcowe: [handoff T07-R1](handoffs/2026-10-13-T07-R1-przeglad-importu.md).

## Odbiór T04-R1 (2026-10-13)

`compact-plan-editor.test.tsx` obejmuje karty/jeden trening, podgląd całości, blok i pojedynczą serię, zachowanie ID/notatek/źródeł, fragment przy niekompletnym innym treningu, katalog/przeniesienie, anulowanie dodawania, złożony cel i zakresy, opcjonalność, zmianę kolejności i nazwy dnia, AMRAP/czas/dystans/asystę/hantle/%1RM/dodatkowy ciężar, zero wobec braku, timeout/retry, blokadę podczas zapisu, konflikt oraz ostrzeganie o wyjściu. Głos nadal jest mockiem komponentu i wymaga jawnego dodania propozycji; nie uruchamia AI samoczynnie. Cały `npm test`: 122 przeszło, 8 opt-in pominięto.

`DO_NOT_TRACK=1 npm run test:t04:local` potwierdził rzeczywiste lokalne Auth/PostgREST, A/B/anon, wersje, retry i historię 1RM. `DO_NOT_TRACK=1 T04R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs npm run test:t04r1:http` buduje produkcyjny Next, uruchamia go na 3008 i sprawdza Chrome desktop 1440×1000/mobile 390×844. Moduł pochodzi z `load_workspace_dependencies`, bez nowej zależności aplikacji. Runner wyłącza import AI i głos.

Chrome tworzy tylko własne syntetyczne konto/plan: karty bez formularzy, dialog/zakres/cancel, katalog/przeniesienie, podgląd, superserie, fokus/Escape, fullscreen i brak overflow. Publikacja jest prawdziwa przez HTTP/RPC. Playwright celowo odrzuca odpowiedź po udanym zapisie; retry tego samego payloadu daje tylko jedną nową wersję. Porównanie wszystkich dawnych serii i snapshotów rozpoczętego treningu z odczytem bazy potwierdza ich niezmienność. Nowy szkic pozwala zastosować fragment mimo innego pustego ćwiczenia, ale pełna publikacja jest blokowana. Konto i jego obiekty są usuwane w `finally`.

`DO_NOT_TRACK=1 npm run test:t07r1:http` bez modułu przeglądarki przeszedł na syntetycznych źródłach i szkicu mockowym: A/B/anon, źródło, korekta/reload, metadata, starszy PATCH i retry zatwierdzenia. Nie ponowiono klikalnego testu trzech prywatnych źródeł. Build i sekwencyjny `npm run typecheck` przeszły. Prywatne zrzuty syntetycznej sesji: `/private/tmp/t04r1-cards-desktop.png`, `t04r1-cards-mobile.png`, `t04r1-edit-mobile.png`; oceniono wizualnie i poprawiono zasłanianie kart mobilnym paskiem zapisu.

Kontrola Chrome wykryła także rzeczywistą regresję: aktualizacja stanu ostrzeżenia w fazie capture zakłócała checkbox superserii. Przeniesiono obsługę do fazy bubble tylko dla przycisków kolejności, dodano test i ponowiono Chrome z sukcesem. Ostrzeganie śledzi zmieniony formularz, nie samo otwarcie okna.

Pierwsze przebiegi wykryły błędy testów: liczba zamiast tekstowej wartości input, niedozwolona opcja Testing Library `exact`, oczekiwanie przycisku w zwiniętym treningu i pominięta nazwa nowego planu. Poprawiono i powtórzono. Początkowe testy integracji nie miały dostępu do socketu Dockera w sandboxie; powtórzenie z uprawnieniem przeszło. Nie wykonano płatnych prób AI, fizycznego telefonu, Safari/iPhone, hostingu ani obciążenia. Szczegóły: [handoff T04-R1](handoffs/2026-10-13-T04-R1-czytelny-edytor.md).

## T10 i fizyczny odbiór po wdrożeniu

D025 zamyka lokalny T09 i dopuszcza T10 przed testem telefonu. [T10_ACCEPTANCE](T10_ACCEPTANCE.md) opisuje runner `npm run test:t10:local`, jego środowisko, syntetyczne dane, poprawki i faktyczne wyniki oraz listę kroków T10-R1 dla użytkownika po Vercel. T10-R1 zależy od T11 i jest warunkiem szerszej bety. Dotychczasowe stwierdzenia o telefonie jako warunku T09 opisują wcześniejsze kryterium; nie oznaczają wykonanego testu.

## Przygotowanie T11 (2026-10-14)

`node --check scripts/prepare-t11-deploy.mjs`, `node --check scripts/verify-t11-package.mjs`, `node scripts/prepare-t11-deploy.mjs --stage` i `node scripts/verify-t11-package.mjs` przeszły. Ostatni skrypt tworzy wyłącznie tymczasowe kopie syntetyczne: sprawdza ścieżki z `.gitignore`/`.vercelignore` semantyką Git, porównuje hashe źródeł i 20 migracji oraz odrzuca zagnieżdżone env, format sekretu i dowiązanie. Usuwa swoje pliki w finally. Nie zastępuje manifestu CLI Vercel ani pełnego skanera sekretów.

W czystej kopii wskazanej przez manifest, bez `.env` i fixtures: `npm ci --offline --ignore-scripts --no-audit --no-fund`, następnie `NEXT_TELEMETRY_DISABLED=1 OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run build` i `npm run typecheck` — sukces na Node 26.4.0. Instalacja offline nie uruchamiała skryptów zależności; build uruchomił projektowy prebuild PDF.js. Nie jest to sprawdzenie Node 24 ani usługi Vercel. Nowe skrypty/build nie wywołują AI; dotychczasowych 159 testów T10 nie przedstawiamy jako ponowionych w T11.

Vercel 64.0.2 `deploy --dry --format=json --non-interactive` z konfiguracją w `/private/tmp` zakończyło się brakiem poświadczeń; Supabase `projects list --output json` brakiem tokenu. Oficjalny manifest, migracje hostowane, Auth/SMTP, rzeczywisty HTTPS, smoke A/B/anon, limity/cleanup/restore pozostają niewykonane. Pełna sekwencja i warunki odbioru: [T11_DEPLOYMENT](T11_DEPLOYMENT.md). Nie uruchamiać istniejących lokalnych runnerów przeciw produkcji: tworzą/usuwają konta i zakładają środowisko lokalne. Fizyczne urządzenia i Safari pozostają T10-R1 po wdrożeniu.

## T11-E1 — konfiguracja Marketplace (2026-10-16)

`npx vitest run src/lib/supabase/config.test.ts src/lib/supabase/admin.test.ts`: 20/20. Nowe przypadki: pierwszeństwo integracji nad błędnym ręcznym duplikatem, niepełna rodzina bez mieszania, fallback anon/service_role, sekret w publicznym polu, HTTPS/preview/production, brak sekretu tej samej rodziny i zachowana konfiguracja lokalna. SDK admin jest mockiem w testach wyboru klucza — nie jest to walidacja kluczy hostowanego konta.

`OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false npm test`: 171 passed / 9 skipped, 23 pliki passed / 5 skipped. Build i następujące po nim typecheck przeszły ze sztucznym refem/kluczami integracji, APP_ENV/VERCEL_ENV=production i pustymi dawnymi zmiennymi. `.env` istnieje, lecz istotne zmienne jawnie nadpisano w procesie; nie jest to przeniesienie wartości lokalnych na hosting. Kontrola `.next/static` nie znalazła referencji do serwerowych nazw kluczy ani syntetycznego sekretu builda.

`node scripts/prepare-t11-deploy.mjs --stage` i `node scripts/verify-t11-package.mjs`: sukces, 95 źródeł/20 migracji, nowy manifest 2026-10-16 bez nadpisania poprzedniego. Lokalny env.vercel ignorowany w Git; nie zmieniano jego treści. Zdalne HTTPS/smoke/migracje oraz telefon/Safari nadal mają status niewykonane. Dwa rzeczywiste lokalne HTTP T06/T07 (stare nazwy oraz STORAGE z lokalnym legacy service_role) przeszły na Auth/API/Storage z mockiem AI. Faktyczne zmiany konfiguracji i ograniczenia w [handoffie](handoffs/2026-10-16-T11-E1-zmienne-integracji.md).

## T11 — hostowana produkcja (2026-10-16)

D029 ogranicza obecny etap do Production, bez projektu preview. Po prywatnym logowaniu CLI użytkownika: `supabase link --project-ref kwmyosnerwvtwxtszzka`, `migration list`, `db push --linked --dry-run --skip-vault`, a po osobnym zatwierdzeniu `db push --linked --skip-vault` i `migration list` — sukces, 20/20. Przed zapisem metadane wykazały 0 tabel publicznych/kont/bucketów/obiektów. Odczyt SQL przez `db query --linked --file /private/tmp/t11-audit.sql` potwierdził RLS 17/17, brak DML do 12 tabel, prywatność i limity bucketów. [Raport](reports/2026-10-16-T11-production-audit.json) zawiera wyłącznie metadane.

Bez cookies po rzeczywistym HTTPS: `/` 307 na logowanie, `/api/plans` JSON 401/no-store, `/api/imports/cleanup` bez Authorization JSON 401. Chrome pokazał polski ekran logowania bez ostrzeżenia certyfikatu. `node scripts/verify-t11-package.mjs` przeszedł bez uploadu. Nie powtarzano suite/builda kodu aplikacji: tej sesji nie zmieniano źródeł builda, migracji ani domeny. Początkowy HTTP w sandboxie miał ENOTFOUND, ponowienie z dostępem sieciowym przeszło. Jedna próba pomocy CLI bez DO_NOT_TRACK miała EPERM zapisu telemetry; ponowienie z DO_NOT_TRACK=1 przeszło.

Przygotowano osobny `scripts/test-t11-production.mjs` zamiast kierować lokalne runnery na produkcję. `node --check scripts/test-t11-production.mjs` — sukces. Wykonanie wymaga jawnej zgody na klucze wyłącznie w pamięci, dwa syntetyczne konta i usunięcie wyłącznie ich zasobów. Skrypt odrzuca brak `--run-approved-smoke`, używa stałego refa/adresu, nie zapisuje sekretów, nie czyta .env i nie wysyła fixtures; AI powinno odmówić 503. Przygotowanie nie jest wynikiem smoke; późniejsze rzeczywiste próby i lokalną poprawkę opisano poniżej. Test obejmuje HTTP/Auth/API/Storage, nie klikalny UI, mail ani telefon. Ręczne Run crona nie wykonane po odrzuceniu auto-review; 401 nie dowodzi prawidłowej jakości sekretu ani udanego sprzątania. Restore i T10-R1 niewykonane.

### T11-C1 — rzeczywisty błąd hostingu i lokalna poprawka

Po jawnym „Tak, wykonaj ten smoke” uruchomiono nowy runner przeciw Production. Pierwsza próba: plan/retry, 1RM 120, start/retry, snapshot90/null i zapis/retry serii przeszły; stara rewizja dała HTTP 400 zamiast409. Druga próba z diagnostyką/timeout30s potwierdziła rewizję2 i timeout bezpośredniego RPC z oczekiwaną starą rewizją1. W każdej próbie finally usunęło własne 2 konta, 0 plików; pełna ścieżka, Storage i późniejsze asercje nie zostały osiągnięte. Klucze pobrano przez CLI tylko w pamięci po zgodzie, nie zapisano ich ani haseł/cookies. Nie wykonano płatnego AI. Po próbach 0 aktywnych backendów authenticator, bez restartu i terminate.

[Oficjalne troubleshooting Supabase](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b) opisuje nieskończone ponowienia 40001 w PostgREST14 i zaleca PT409 dla konfliktu HTTP 409. D030/T11-C1 dodaje migrację21 i mapowanie API. `DO_NOT_TRACK=1 npx --no-install supabase migration up --local`, następnie `DO_NOT_TRACK=1 npm run test:t04:local` i `DO_NOT_TRACK=1 npm run test:t05:local`: sukces, wzmocnione asercje starej rewizji i sprzecznego operation payload oczekują PT409; pozostałe przypadki retry/wersji/snapshotów/A/B/anon przeszły. Bez resetu lokalnych danych.

`OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false DO_NOT_TRACK=1 npm test`: 171 passed/9 skipped; 23 pliki passed/5 skipped. `NEXT_TELEMETRY_DISABLED=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run build` i sekwencyjny `npm run typecheck`: sukces, build odczytuje istniejący lokalny .env przy jawnie pustym kluczu i wyłączonym AI; nie jest to build hostingu. `node --check scripts/test-t11-production.mjs`, prepare --stage i verify package: sukces, nowy C1 ma 95 źródeł/21 migracji, bez nadpisywania E1 i bez uploadu.

Runner otrzymał timeouty, postęp i oddzielne asercje obu bucketów/anulowania po niezaliczonych próbach; te dalsze asercje czekają na ponowienie po wdrożeniu C1. Produkcja nadal ma 20 migracji; dry-run wskazuje wyłącznie21. Nie deklarować PT409 ani pełnego smoke jako odebranego na hostingu przed nowym buildem i testem.

### T11-C1 — wdrożenie i końcowy smoke

Po „Tak, zastosuj i wdróż poprawkę”: produkcyjny dry-run wskazał tylko migrację21; push --linked --skip-vault i migration list dały21/21. Ponowny audit SQL potwierdził niezmienione RLS/granty/buckety. Kod commit ddaceb3e7c438bc81d02a55e0fede9bbf2d31ff5 wypchnięty; Vercel deployment dpl_AzhtfUHBRouX92RRhbTA5F19r5jX Ready 53 s. Pierwsza próba na C1 przeszła konflikt, trening, wersje, oba buckety i odmowęAI, ale błędna asercja oczekiwała nazwy planu w historii (UI pokazuje datę/status/komentarz). Poprawiono wyłącznie test; nie zmieniano aplikacji. Konta 2 i pliki 2 usunięto,0 błędów.

Końcowe `node scripts/test-t11-production.mjs --run-approved-smoke` na produkcyjnymHTTPS: PASS. Auth A/B, anonim 401; błędny JSON 400; plan/1RM 120/start/seria przez API; retry publikacji/startu/serii; stara rewizja bezpośrednio PT409 i w API409;90 kg/null snapshoty; pominięcie, dodatki, komentarz i koniec; wersja i 150kg nie zmieniają starego 90; 12 tabel bez odczytuB/anon i UPDATE42501;A nie czyta planuB. Oba buckety: własny upload/source, odmowa B/anon, signed/public i cudza ścieżka training-private; signed upload importu, no-store źródła i cancel 410. Strony ręczne200, ponowne logowanie/historia, postęp 540 kg, zero/null. Process importu i głos503 z AI wyłączonym, bez płatnego żądania. Finally:2 własne konta/2 pliki, 0 błędów. To HTTP/Auth/API/Storage; nie klikalny UI, SMTP ani telefon/Safari. Cron 200/retencja/restore nadal niewykonane.


### T11 — Auth, cron i zmiana priorytetu D031

Po jawnej zgodzie użytkownika zapisano minimum hasła12, produkcyjny Site URL i dwa dokładne redirecty. Ponowne otwarcie Email pokazało12 na screenshot; DOM redaguje to pole jako password-policy, dlatego wcześniejsza asercja porównująca DOM value do12 zwróciła false — nie była dowodem nieudanego zapisu. URL-e potwierdzono po reload. Bez odczytu haseł użytkowników i bez wiadomości.

Panel crona: po odczycie0eligible importów/voice i0obiektów Run zwróciło200, 23:02:26.822 CEST, na deployment66bkx8iqf, /api/imports/cleanup. Brak testu usuwania wygasłego pliku. Później odczyt liczników: Auth1/profiles1/imports0/Storage0; bez odczytu danych konta. Przejściowo Node UND_ERR_CONNECT_TIMEOUT, a Chrome net::ERR_BLOCKED_BY_CLIENT; bez obchodzenia zabezpieczeń. curl przy normalnej walidacjiTLS potwierdził /logowanie200, root307 i /api/plans401. Nie wnioskować o awarii produkcji z błędu jednego transportu.

`DO_NOT_TRACK=1 npx --no-install supabase db dump --linked --schema public --file /private/tmp/t11-public-schema.sql` przeszło po pobraniu oficjalnego obrazu postgres17.11.0.003. To tylko schemat, nie kopia danych/Storage/Auth. Szyfrowania i restore nie wdrożono; dalszy zakres odłożony przez użytkownika. Brak zapisu do istniejącej lokalnej bazy.

D031 dopuszcza pojedynczy płatny test importu w5USD na start po prywatnym dodaniu klucza, bez głosu. Wynik dopisujemy po rzeczywistym wywołaniu. Nie powtarzano testów/builda kodu: zmieniano tylko ustawienia usług i dokumentację, kod wydania pozostaje zgodny z manifestem C1.


## Końcowy wynik prototypu — D031/D032

T11 **review**: aplikacja przekazana właścicielowi do własnych testów. Bez dalszego automatycznego rozwijania infrastruktury. Import i głos są włączone na Production. Nowe wdrożenie głosu `dpl_DEkfN1gE4V3kk558B2SGEmVcyawS` Ready44s, kod4e4a0aa (kod aplikacji zgodny zC1). Wcześniejsze importowe `dpl_HnkRh9V8X3KBy7KEimgdbB54hYXe` Ready52s.

Rzeczywisty import tekstu: pierwsza asercja testu błędnie oczekiwała3surowych obiektów zamiast jednego szablonu i set_count3; HTTP200/needs_review już działało. Po poprawieniu testu: PASS,1dzień/1ćwiczenie/3serie×5/60kg/120s,0pytań, retry bez kolejnego AI. Druga próba1909input/473output tokens, szacunek0,0004274USD wg aktualnej taryfy Luny; pierwszej próby ani całej fazy nie rozliczono dokładnie. W obu próbach cleanup własnego konta bez błędów.

Głos: systemowy say/Zosia wygenerował syntetyczne2,91775s WAV97464B. Hostowana transkrypcja200 (~2,943s), interpretacja5powt./60kg na właściwą serię, brak zapisu przed zatwierdzeniem i kontrolowany zapis po zatwierdzeniu przeszły. Runner zatrzymał dopiero dodatkowy odczyt metadanych voice_attempts przez authenticated (42501); tabela prawidłowo nie jest dostępna klientowi. Nie deklarujemy całego runnera jako PASS i nie powtarzano płatnych wywołań dla tej zbędnej kontroli. Własne konto usunięto,0plików/0błędów cleanup. Bez fizycznego mikrofonu i telefonu.

Obie flagi true, szacunki aplikacji import4/głos1USD w24h;5USD łącznie na start obejmuje obie funkcje. To nie twardy łączny limit rachunku ani zgoda na codzienny nowy budżet. Użytkownik otrzymał instrukcję limitu projektu OpenAI, zapis niepotwierdzony. Krótkie nagrania można testować;5MiB wobec4,5MB Vercel pozostaje ograniczeniem dużych plików przed pełną betą. Stary smoke wymagał503AIoff — nie uruchamiać go bez dostosowania do obecnego stanu.

## T13 — A/B/C sprawdzone lokalnie, D–E planowane

Pełne wymagania R01–R16 i lokalne bramki: [T13](T13_MOBILE_WORKOUT.md). A sprawdza rzeczywiste lokalne A/B/anon, równoczesne starty, save/delete/replace, rollback całej zamiany, starą rewizję/PT409, utratę odpowiedzi po commit, późne retry start/save po delete, legacy receipts i wiele aktywnych. Kontrole FK/grantów muszą potwierdzać wyłączną ścieżkę komend. Korekta daty przy finish przesuwa kalendarz/filtry, a porównanie snapshotów przed/po potwierdza identyczne cele, 1RM i zaokrąglenie, również null.

B/C: osiem serii, różne cele/rampa/AMRAP, superseria i nierówne rundy, opcjonalne/dodatkowe/pominięte osobno, null/0, historyczna poprawka. C: jeden formularz, brak reload i utraty innych szkiców, wszystkie decyzje nawigacji, 409 i błąd odczytu po zapisie, stała pełna komenda retry, mock opóźnionego głosu przy zmianie celu. D: kilka sesji dziennie, granice dni/miesięcy/roku, rok przestępny, DST, profilowa strefa/filtry, legacy bez godziny i trwałe delete. E niezależnie odtwarza krytyczne przypadki i pełny przepływ na zintegrowanym stanie.

Wymagane klikalne testy prawdziwej lokalnej aplikacji z syntetycznymi danymi przy 360/390/430 px, cztery krótkie karty przy 390×844, dostępność/fokus/44 px i klawiatura. `npm test`, `npm run build`, następnie `npm run typecheck`; lokalne istniejące runnery według dotkniętego zakresu. Runnery A opisano poniżej; runner B opisano w sekcji wykonania B; runner C opisano w sekcji wykonania C; runnery D–E pozostają przyszłą pracą. Bez płatnego AI i bez kierowania lokalnych runnerów na produkcję. Wyniki/mocked API/telefon/hosting zapisuje się oddzielnie. Niewykonany fizyczny telefon/Safari nadal w T10-R1. Sesja T13-P wykonała wyłącznie kontrolę dokumentacji; wykonanie A opisano poniżej.


### T13-A — wykonany odbiór lokalny 2026-10-17

Wymagane działające lokalne Supabase/Docker. AI wyłączone: `OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false DO_NOT_TRACK=1`; nie uruchamiano płatnych prób. Środowisko: Node26.4, Supabase CLI2.120, rzeczywisty PostgreSQL17.11/Auth/PostgREST oraz produkcyjny Next16.4 na localhost3005.

- `npx supabase migration up --local`: PASS, migracja22. Odczyt katalogu FK/triggerów przed zmianą, bez zdalnych migracji.
- `node scripts/test-t13a-migration.mjs`: PASS. Osobna tymczasowa baza w lokalnym klastrze, schematy Auth/Storage bez danych, replay21 migracji → syntetyczne dwie aktywne sesje z receipts/revisions →22. Porównanie wszystkich zastanych wierszy/snapshotów/potwierdzeń; godziny null, snapshot_on skopiowane. Rzeczywiste FK/granty i wymuszony błąd INSERT po finish/delete w replace: identyczny stan wszystkich tabel po rollback. Baza usunięta w finally; bez resetu bazy aplikacji.
- `T13A_HTTP_BASE=http://localhost:3005 npm run test:t13a:local`: PASS, najpierw prawdziwy RPC, potem POST/GET Next z cookies dwóch kont i anon. Różne i identyczne starty, dwa replace, replace/start, save/delete; konflikty/PT409 bez pętli, aktualne rewizje, brak duplikacji. Obce sesje/dzieci/nowy plan, zamknięte helpery/DML, własne deleted410 i obce404, no-store. GET podczas12 zapisów/18 odczytów ma spójne revision/actual_note.
- Utrata odpowiedzi po commit delete/replace jest kontrolowaną symulacją: RPC odrzuca potwierdzenie, HTTP anuluje body po otrzymaniu nagłówków sukcesu; retry ma identyczny ID/rewizję/payload. Późny start/save nie odtwarza sesji, retry replace działa po zakończeniu nowej, po jej usunięciu410. Nie jest to próba fizycznego zerwania sieci telefonu.
- Korekta17→15.10 zachowuje wszystkie snapshoty (1RM120, cel90, zakresy/opcjonalność/null). Przesunięcie północy/strefy do14.10 daje ten sam GET/view/filtr postępu. Pending pozostaje pending, zero pozostaje zerem, historyczna poprawka dozwolona. Brak offsetu/luka DST/przyszłość odrzucone; oba jawne offsety jesienne przyjęte; zmiana strefy daje409. Poprzedni wynik obejmuje powtórzenia/kg i czas/dystans, wiązanie po exercise_id zachowuje wariant. Strony treningu/historii/postępu HTTP200.
- `npm run test:t04:local`, `test:t05:local`, `test:t06r1:local`, `test:t08:local`, `test:t09:local`: PASS. Dodatkowo T08/T09 z `T08_HTTP_BASE`/`T09_HTTP_BASE=http://localhost:3005`: PASS.
- `npm test`: 180 passed /9 skipped, 24 pliki passed /5 skipped. Dziewięć nowych testów czasu: północ, granica roku, przestępny luty, obie zmiany DST i date-only. Pominięte testy opt-in integracji/live, bez deklaracji jakości AI.
- `node scripts/run-local-app.mjs build` i następujące `npm run typecheck`: PASS. `git diff --check` i kontrola linków/promptu: wyniki w handoffie.

Pierwszy test T13-A przerwało błędne oczekiwanie410 dla retry replace, którego nowy trening był tylko zakończony; kontrakt wymaga200. Asercję poprawiono i ponowiono właściwy runner. Początkowy dostęp do socketu Dockera wymagał eskalacji sandboxa; po uzyskaniu dostępu wszystkie opisane integracje były rzeczywiste. W tej sesji A nie wykonywano B–E ani fizycznego telefonu/Safari; A review, lokalna bramka przyjęta przez integratora. Późniejsze B opisano niżej.


### T13-B — wykonany odbiór lokalny 2026-10-18

Nowy runner `scripts/test-t13b-browser.mjs` wymaga prawdziwego Next3005, lokalnego Supabase/Auth/PostgREST i modułu Playwright z runtime desktopowego. Odrzuca pozalokalne adresy. Start: `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs build`, potem `node scripts/run-local-app.mjs start` z tymi samymi flagami. Uruchomienie testu:

```sh
DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false T13B_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t13b-browser.mjs
```

- PASS: rzeczywiste własne syntetyczne konto, zapis planu, selektor bez tygodni z osobnymi A/A, pierwszy/ostatni/fallback/wersje, start najnowszej wersji i wznowienie, brak startu archiwum. Osiem serii rozwija się klawiaturą; rampa,70kg,AMRAP,opcjonalna,null/0,oryginał/uwagi/źródło i podgląd całego planu zachowane. Fokus po wyborze w podglądzie wraca do nagłówka.
- PASS:360/390/430×844 bez overflow. Przy390 czwarta karta kończy się na763,984375 przed górą nawigacji782. Cele44 mierzone dla selektora, rozwinięć, startu, edycji oraz daty; pole daty fokusowane także przy390×500. Zrzuty `/private/tmp/t13b-360.png`, `t13b-390.png`, `t13b-430.png` obejrzano wizualnie. To desktopowy Chrome z viewportem, bez rzeczywistej klawiatury ekranowej/telefonu/Safari.
- PASS: syntetyczny import przez realne API/DB/UI: adapter zastąpiono zapisanym syntetycznym draftem, bez żądania AI. Ćwiczenia → Serie i superserie → reload → Podsumowanie → publikacja. Dwie jednostki A zachowane z tygodniami1/2 i16seriami/uwagami, opublikowany plan otwiera nowy podgląd. Nie dowodzi jakości AI ani parsowania nowych prywatnych źródeł.
- PASS: `T04R1_HTTP_BASE=http://localhost:3005 T04R1_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t04r1-browser.mjs` z AI off. Prawdziwy syntetyczny edytor, karty/okna/cancel/przeniesienie/superserie/mobile/fokus/zapis/retry i stare snapshoty.
- PASS: `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false npm run test:t07r1:http`, bez opt-in modułu prywatnych źródeł. Rzeczywiste lokalne A/B/anon, korekta/reload/progress, publikacja/retry, źródła/Storage; syntetyczny mock adaptera, brak płatnego AI.
- PASS: `OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false DO_NOT_TRACK=1 npm test`:190 passed/9 skipped,26 plików passed/5 skipped.10 nowych testów domeny/komponentu B: grupowanie8/7+1, rampa/uwagi, AMRAP/czas/dystans, optional range, procent/wariant/null/0 i snapshot; wybór, wersje, szczegóły, odmowa pamięci. Pozostałe regresje obejmują istniejące zachowane fixtures importu, bez nowych prawdziwych prób modelu.
- PASS: finalny build wykonany przez runner HTTP importu, potem `npm run typecheck`; `node --check scripts/test-t13b-browser.mjs` i `git diff --check`. Bez ponownej migracji, regresji całego A, hostingu i fizycznego T10-R1.

Wcześniejsze próby: brak socketu Dockera w sandboxie (powtórzono z uprawnieniem); Node26 nie udostępniał localStorage w teście (dodano jawny mock); poprawiono powtarzające się klucze React i izolację stanu startu między jednostkami. Pierwsze dwa pomiary gęstości nie przeszły (czwarta karta do876/836 px); poprawiono układ i ponowiono z wynikiem764. Test nawigacji wersji odczytywał stary select przed zakończeniem nawigacji; dodano oczekiwanie na docelowy URL i wybór. Asercję tekstu opcjonalności dostosowano do poprawionej liczby pojedynczej. Końcowe polecenia PASS; wszystkie konta własnych runnerów usunięte w finally, serwery3005/3006 zatrzymane. Odbiór B przyjęty przez integratora, B review do niezależnego E. Szczegóły w handoffie B wskazanym w STATUS.


### T13-C — wykonany odbiór lokalny 2026-10-18

Jeden wykonawca/integrator, bez innych agentów i bez zmiany SQL/API. `scripts/test-t13c-browser.mjs` wymaga lokalnego Supabase z migracją22 i lokalnego Next3005 z AI off; tworzy własne syntetyczne konto i usuwa je w finally. Node26.4, Chrome/Playwright z runtime desktopowego. Polecenia:

```sh
DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs build
DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-app.mjs start
DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false T13C_PLAYWRIGHT_MODULE=/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs node scripts/run-local-t05.mjs scripts/test-t13c-browser.mjs
```

PASS:360/390/430 bez overflow; cztery pełne karty390×844 (czwarta do659,41, nawigacja782), jedna seria, osiem zwiniętych serii, rampa/AMRAP/opcjonalna, cele44/fokus/Enter, powrót/scroll i przeglądarkowy Wstecz. Formularz przy wysokości500 i przewijanie pól/akcji; bez rzeczywistej systemowej klawiatury. Zachowany szkic komentarza po zapisie serii, trzy wybory zapisz/odrzuć/zostań. Abort odpowiedzi po rzeczywistym commit, identyczna pełna komenda retry; znacznik dokumentu nie zmienia się. ACK/nieudany GET ponawia tylko GET. Rzeczywisty409 po zapisie drugiej karty/API zachowuje liczby do jawnego rozstrzygnięcia.

PASS: nierówne rundy S1, dodatkowa seria i ćwiczenie, pominięcie osobno,0 powtórzeń/null kg. Wszystkie serie i historyczna poprawka. Głos wyłącznie mock: brak zapisu przed zatwierdzeniem, poprawny zapis po nim, opóźniony wynik po zmianie celu odrzucony, awaria503 zostawia ręczne pola. Komponent sprawdza także zmianę rewizji przed odpowiedzią. Rzeczywisty formularz ponownego logowania zachowuje historię.

PASS: automatyczny start, konflikt/cancel/powrót, atomowe finish-replace i delete-replace, dodatkowe potwierdzenie/cancel delete,410 usuniętej sesji, indywidualne legacy bez zgadywania godziny. Fixture legacy to własne syntetyczne wiersze przez lokalnego admina, bez zmiany schematu. Korekta czasu18→15.10: snapshot null pozostaje null mimo dodania1RM podczas sesji, nowa sesja120/90 zachowuje120/90 po korekcie. Pending nie staje się wykonanym.

Regresje PASS: `T13A_HTTP_BASE=http://localhost:3005 npm run test:t13a:local` (RPC/HTTP A/B/anon/concurrency), `npm run test:t05:local`, `T08_HTTP_BASE=http://localhost:3005 npm run test:t08:local`, `T09_HTTP_BASE=http://localhost:3005 npm run test:t09:local`, wszystkie z DO_NOT_TRACK=1 i AI off. `npm test`198 passed/9 skipped (28 plików passed/5 skipped), produkcyjny build przez run-local-app i następujący `npm run typecheck` PASS. Bez replay migracji, nowego klikanego edytora/importu lub produkcji; ich kod i istniejące testy komponentów pozostały zgodne. Stary runner B wymaga date-only input ze starego startu i nie jest bieżącą bramką C; nowy start sprawdza C.

Wcześniejsze próby: pierwszy build bez uprawnień nie dotarł do Dockera; ponowiony z dostępem. Pierwszy test dialogu jsdom wymagał jawnego mocka showModal/close. Pierwszy build wykazał niepoprawne testowe ByRoleOptions.exact; poprawiono. Browser timeout przy komentarzu ujawnił potrzebę stabilnej aria-label przy kontrolowanym textarea; poprawiono. Asercja legacy zakładała kolejność insert zamiast kolejności API — zmieniono na stan każdej sesji. Pierwszy pomiar scrolla porównywał pozycję przed automatycznym scrollowaniem Playwright do faktycznej pozycji kliknięcia; runner zapisuje teraz scroll w zdarzeniu click. Finalne próby przeszły. [Handoff C](handoffs/2026-10-18-T13-C-prowadzenie-treningu.md) zachowuje granice dowodów. Fizyczny telefon/Safari, E i D niewykonane; bez płatnego AI.

### T15-F — lokalna bramka 2026-10-18

- `npx vitest run src/components/one-rep-max-editor.test.tsx`:2PASS (idempotentny retry/nowe dane, pending i odzyskanie błędu).
- `DO_NOT_TRACK=1 T15F_PLAYWRIGHT_MODULE=<lokalny moduł Playwright> node scripts/run-local-t05.mjs scripts/test-t15f-browser.mjs`:PASS, lokalny Chrome i Supabase, syntetyczne konto; login błędny/poprawny, fokus, datowany1RM, krok, zmiana hasła, logout/relogin,360/390/430. Pierwsza próba miała zbyt szeroki selektor role alert (Next announcer); zawężono do formularza i ponowiono.
- `DO_NOT_TRACK=1 npm run test:t04:local`:PASS (wersje, historia1RM, izolacja A/B/anon).
- Wspólny build B/E/F i `npm run typecheck`:PASS. Pełna suite234PASS/9skip/2FAIL nieaktualne oczekiwania demo B; naprawia właściciel. Fizyczny telefon/Safari i rzeczywisty systemowy menedżer autofill niewykonane. Atrybuty autocomplete i styl Nocy obecne, nie równoważne testowi systemowego autofill.

### T15-B — lokalna bramka2026-10-18

-32 czyste testy8 plikówPASS; komenda w rzeczywistym handoffie B. Integracyjna suite przed ostatnią paczką CTA239PASS/9skip; ostatnia paczka ma32 testy autora +build/typy +pełny Chrome/T13-C PASS.
- `scripts/test-t15b-browser.mjs` przez lokalny run-local-t05 z T15B_PLAYWRIGHT_MODULE: nowe powierzchnie3 szerokości, cztery karty, reload drugiego planu, keyboard/swipe/drag→Enter/history return/szkicPASS. Następnie importowany niezmieniony test-t13c-browser.mjs PASS: realne komendy/retry/ACK→GET/409/szkice/daty/delete/history/snapshoty, głos mock transportu.
- Pierwsza próba T13-C FAIL czwarta karta802,64>nav768. Po przesunięciu Kontynuuj pod karty powtórkaPASS750,64<768; plan749,36<768. Ograniczenia telefonu/Safari pozostają otwarte.
- E API505sesji/503katalogu/>500dzieci PASS; E Chrome jeszcze niewykonane. T08 HTTP/API po adaptacji filtra historii PASS940→1140kg/A-B-anon.

### T15-E — domknięcie lokalnej bramki2026-10-19

I wykonał `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false node scripts/run-local-t05.mjs scripts/test-t15e-browser.mjs`:PASS (sesja97754, exit0).15stanów360/390/430, mysz klik/drag/klik, Enter po drag/Escape, pomoc, pinch i pierwszy tap po nim, PR swipe134→0, własne daty, nakładające się sesje przez zwijaną listę, korekta→odczyt, desktop, zero błędówJS. Raport i zrzuty /private/tmp/t15e-*. I obejrzał390 zewnętrzne i masa ciała. Wcześniejsza odmowa sandbox i220s oczekiwania na eskalację agenta nie były testem; dopiero uruchomienie I przeszło. Fizyczny telefon/Safari niewykonane. API dowody i29 czystych testów w handoffie E; bez ponawiania zaliczonych testów bez zmiany kodu.

### T15-D / T13-D — lokalna bramka2026-10-19

-6unit/componentPASS: daty/leapyear/pon-niedz/zakresy/strefa/DST/status/URL/keyboard/fokus. Wspólny build+typecheckPASS; pełna suite C/D249PASS/9skip.
- `T15D_PLAYWRIGHT_MODULE=<lokalny moduł Playwright> DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false node scripts/run-local-t05.mjs scripts/test-t15d-browser.mjs`: końcowyPASS sesja54374. Auth/RPC/API iChrome360/390/430, pola dni min44.56/48.84/54.56×46px, mouse/tap/keyboard, puste/wiele/legacy/abandoned/leapyear/DST/północ/strefa. Powrót B, korekta daty finish przenosi dzień bez zmiany snapshotów, UI delete usuwa Wznów i zachowuje wybór. IzolacjaA/B/anonPASS. I obejrzał /private/tmp/t15d-calendar-390.png.
- Pierwszy runnerFAIL asercja klawiatury przed rAF przenoszącym fokus; oczekiwanie prawdziwego fokusu poprawione, produkcja bez zmian. Fizyczny telefon/Safari niewykonane.

### T15-C — lokalna bramka2026-10-19

-42unit/5plikówPASS: compact-plan-editor, plan-editor, plan-voice, import-review, import-workspace. Kontrolowane serie/apply/cancel, counts i optional wymagane/opcjonalne/noweID. Wcześniejsze19PASS/18FAIL starych selektorów opisane w handoffie; żadnego usunięcia pokrycia payloadów.
- Własne syntetyczne `test-t15c-editor.mjs` i `test-t15c-import.mjs` przez run-local-t05 na3005 z T15C_PLAYWRIGHT_MODULE:PASS. Pełna regresjaT04-R1, lokalny zapis/retry/historia, PDF2strony/XLSX2arkusze/mockdraft, trzy odrębne kroki korekty/źródła/blokady/retry. `test-t15c-http.mjs`:pełne HTTP T06/T07PASS z CRON_SECRET z tymczasowego pliku poza repo.
- Po pierwszymPASS oględziny wykazały za duży narzut układu; jedna paczka QA przeniosła narzędzia pod karty i drugorzędne pola po parametrach. Build/typyPASS; końcowe editor/importPASS sesje41675/10716,4pełne karty390 przy scroll0 przed nav,360/430 bez overflow. HTTP zachowano bez powtórki, kontrakty nie zmienione. I obejrzał finalne editor390/reviewPDF390/import390.
- Dane syntetyczne, płatneAIoff; konta i Storage sprzątnięte. Fizyczny telefon/Safari osobno niewykonane. Pełną suite po finalnej paczce powtórzy niezależny G.

### T15-G / T13-E — odbiór 2026-10-19, zamknięty lokalnie po D046

HEAD `11d66bc`, Node 26.4.0, Next 16.4.0, Supabase CLI 2.120.0, produkcyjny Next na 3005 zbudowany w tej sesji, Chrome CDP. AI off. Dev na 3002 nienaruszony. Po powtórce 3005 zatrzymany.

- `npm test`: 251 passed / 9 skipped. Następnie `npm run typecheck` i `node scripts/run-local-app.mjs build`: PASS.
- `T13A_HTTP_BASE=http://localhost:3005 npm run test:t13a:local`: RPC i HTTP PASS. `npm run test:t04:local`, `test:t06r1:local`: PASS.
- Drugi przebieg `T08_HTTP_BASE=http://localhost:3005 npm run test:t08:local`: PASS, 940→1140 kg i filtr. Pierwszy przebieg T08 w sesji nie potwierdza HTTP.
- `node scripts/run-local-t05.mjs scripts/test-t15e-api.mjs` oraz `T15C_HTTP_BASE=http://localhost:3005 node scripts/run-local-t05.mjs scripts/test-t15c-http.mjs`: PASS. Importowy szkic jest mockiem.
- Chrome z modułem Playwright runtime: F, edytor, import, D, E i A PASS. Pierwszy `test-t15b-browser.mjs` przerwał się na `cards[3].bottom < nav.y` (786,95 > 768). D046 wycofuje ten próg. Powtórka tego runnera, już z ogonkiem i wbudowanym T13-C: PASS, log `/private/tmp/t15g-t15b-rerun.log`. Telefon/Safari niewykonane. Szczegóły: [raport G](reports/2026-10-19-T15-G-acceptance.md).

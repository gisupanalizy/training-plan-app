# T15-G / T13-E — niezależny odbiór lokalny, 2026-10-19

Bramka **przyjęta lokalnie** po D046. Użytkownik uznał, że dół karty pod nawigacją nie jest błędem: dłuższa lista jest przewijana. Pierwszy przebieg padł na starej asercji `cards[3].bottom < nav.y` (786,95 wobec 768). Asercja sprawdza teraz, że czwartą kartę da się doskrolować. Powtórka całego `test-t15b-browser.mjs`, razem z ogonkiem i T13-C, zakończyła się PASS. Log: `/private/tmp/t15g-t15b-rerun.log`.

Poniżej zostaje przebieg sprzed tej decyzji. Macierz R: [raport T13](2026-10-19-T13-acceptance.md). Handoff: [2026-10-19-T15-G](../handoffs/2026-10-19-T15-G-niezalezny-odbior.md).

## Wersja i środowisko

- Gałąź `codex/t15-ui`, HEAD `11d66bcdd66440623e8b1e7a55f0d18371e01c6c` („Show which exercises belong to the same superset.”). C jest w `bbead77`. `11d66bc` nie był wcześniejszym odbiorem G.
- Node 26.4.0, Next 16.4.0, Supabase CLI 2.120.0, lokalny Auth/PostgREST na porcie 54321. Playwright: moduł runtime spoza zależności aplikacji. Chrome headless, viewport CDP, nie telefon i nie Safari.
- AI wyłączone: pusty `OPENAI_API_KEY`, import i głos off, `RUN_T06_LIVE=false`, `RUN_T09_LIVE=false`, `DO_NOT_TRACK=1`. Bez płatnego wywołania.
- Produkcyjny Next na `http://localhost:3005` zbudowany w tej sesji po commicie. `CRON_SECRET` wczytany z `/private/tmp/t15-local-cron-secret`, bez wypisania wartości. Dev użytkownika na porcie 3002 nienaruszony.
- Zrzuty i logi poza repo: `/private/tmp/t15g-*.log`, `/private/tmp/t15b-failure.png`, `/private/tmp/t15b-360-preview.png`, `/private/tmp/t13c-{360,390,430}.png` oraz zrzuty A/C/D/E/F z tego przebiegu.

## Wynik

Jedna różnica układu, zamknięta decyzją D046, nie poprawką kodu ekranu. Po ramce superserii z `11d66bc` podgląd planu przy 390×844 ma dół czwartej karty na 786,95, a nawigacja zaczyna się na 768. Około 19 px karty jest pod paskiem do momentu przewinięcia. Treść zostaje na stronie. Użytkownik potwierdził, że tak ma działać dłuższa lista.

Pomiar `scripts/test-t15b-browser.mjs`, plan „Plan pierwszy B”, trening A, superseria S1 na trzeciej i czwartej karcie:

- karty, dół: 377,39 / 506,58 / 657,77 / **786,95**
- nawigacja: y=768, wysokość 76
- czwarta karta wchodzi pod nav o około 19 px

Asercja `cards[3].bottom < nav.y` przerwała pierwszy runner. Zrzut `/private/tmp/t15b-failure.png` i wcześniejszy `/private/tmp/t15b-360-preview.png` pokazują złotą ramkę „Superseria S1”; na 360 px dolna karta też zachodzi na nav. Po D046 powtórka przeszła także 430 oraz ogonek: szczegóły tabeli, drugi plan, ochrona szkicu, powrót do historii i wbudowany T13-C.

Właściciel poprawki układu: nikt. D046 zostawia ramkę i przewijanie. Zmieniony został tylko próg w `scripts/test-t15b-browser.mjs`.

Osobno uruchomiony `scripts/test-t13c-browser.mjs` przeszedł. Aktywny trening przy 390 ma czwartą kartę na 766,19, czyli 1,81 px nad nav 768. Przy 360 dół czwartej karty to 781,78 i zrzut pokazuje ją pod nav; runner sprawdza cztery karty tylko przy 390. Przy 430 dół to 760,44. Margines 390 jest zbyt mały, żeby uznać gęstość za spokojną, ale samą asercję treningu runner zaliczył.

## Co przeszło w tej sesji

Logi: `/private/tmp/t15g-*.log`. Wszystkie polecenia z pustym kluczem AI i wyłączonym importem/głosem.

- `npm test`: 251 passed, 9 skipped; 37 plików passed, 5 skipped. 7,06 s. To testy komponentów i domeny, nie API.
- `npm run typecheck`: exit 0.
- `node scripts/run-local-app.mjs build`: exit 0. TypeScript w buildzie 1,7 s, 20 stron statycznych.
- `T13A_HTTP_BASE=http://localhost:3005 npm run test:t13a:local`: RPC i HTTP PASS. A/B/anon, równoległe start/replace/save/delete, retry/410, legacy, DST, snapshoty.
- `npm run test:t04:local`: PASS. Wersje, historia 1RM, izolacja A/B/anon.
- Drugi `T08_HTTP_BASE=http://localhost:3005 npm run test:t08:local`: PASS. Flaga w procesie testu potwierdziła ustawiony adres HTTP. 940 kg → poprawka → 1140 kg, A/B/anon i filtrowana sekcja. Pierwszy przebieg T08 w tej sesji nie ma tego potwierdzenia i nie jest dowodem HTTP.
- `node scripts/run-local-t05.mjs scripts/test-t15e-api.mjs`: PASS. 505 sesji, 503 katalogu, ponad 500 dzieci, rekord całej historii mimo filtra, korekta, snapshoty, rzeczywisty 1RM, A/B/anon.
- `T15C_HTTP_BASE=http://localhost:3005 node scripts/run-local-t05.mjs scripts/test-t15c-http.mjs`: PASS. A/B/anon, korekta, upload, formaty, retry zatwierdzenia. Szkic adaptera jest mockiem; zapis jest lokalny. Bez płatnego AI.
- `npm run test:t06r1:local`: PASS. Zakresy, opcjonalność, retry, snapshot, nowa wersja, A/B.
- Chrome, moduł Playwright jak wyżej, baza `http://localhost:3005`:
  - `test-t15f-browser.mjs`: PASS. Login, błąd, fokus, datowany 1RM, krok, hasło, wylogowanie i ponowne logowanie, 360/390/430.
  - `test-t15c-editor.mjs`: PASS. Karty, apply/cancel, katalog, superserie, zapis, utrata odpowiedzi i identyczne retry, stare snapshoty. Cztery karty edytora przy 390 mieszczą się nad nav; ten fixture na starcie nie owija czterech kart ramką superserii.
  - `test-t15c-import.mjs`: PASS. Ikony, PDF 2 strony, XLSX 2 arkusze, trzy kroki, reload, blokada braków, cancel, idempotentne zatwierdzenie. Źródła syntetyczne.
  - `test-t15d-browser.mjs`: PASS. Kalendarz, 44 px, daty, DST, legacy, delete, snapshoty, A/B/anon.
  - `test-t15e-browser.mjs`: PASS. 15 stanów, klik/drag, Enter/Escape, pomoc, pinch, swipe rekordów 134→0, korekta, desktop.
  - `test-t15a-browser.mjs`: PASS. 21 stanów, Noc, nawigacja, cele 44 px, skip-link, desktop.
  - `test-t13c-browser.mjs`: PASS, uruchomiony osobno po przerwaniu T15-B. Szkice, retry, ACK i nieudany GET, 409, rundy, null/0, głos wyłącznie jako mock transportu, konflikt, finish, delete, ponowne logowanie.

Obejrzane zrzuty: podgląd planu 360 i stan błędu 390, edytor 390, import 390, krok korekty PDF 390, kalendarz 390, postęp 390, profil, trening 360 i 390. Noc, polskie etykiety i ramka superserii są widoczne. Na podglądzie i na treningu 360 czwarta karta nachodzi na nav.

## Niewykonane

- Fizyczny telefon i Safari. `adb devices` pokazało tylko emulator `emulator-5556`. Profiler USB nie wykazał iPhone. Emulator nie zastępuje tego odbioru.
- Systemowy menedżer autofill, hosting, zdalne migracje, push i publikacja.
- Płatne AI. Głos w T13-C to mock.
- `npm run test:t05:local` i `test:t09:local` nie były ponawiane. Ich niezmienniki sesji pokrył T13-A/T13-C, a głos płatny jest wyłączony.

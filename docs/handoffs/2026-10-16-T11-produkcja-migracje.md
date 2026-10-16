# Handoff — T11 — produkcja, migracje i smoke

- Data i autor: 2026-10-16, Codex. Bez innych agentów.
- Status: T11 in_progress; T11-E1 i T11-C1 done; T10-R1 todo użytkownika.
- Git: main. Na wejściu czysto, HEAD 5c5af85. Kod C1 zatwierdzony i wypchnięty jako `ddaceb3e7c438bc81d02a55e0fede9bbf2d31ff5`; końcowy commit dokumentacji odczytać z git log.
- Poprzedni [handoff](2026-10-16-T11-E1-usuniecie-duplikatow.md).

## Cel i wykonana praca

Użytkownik wybrał tylko Production do własnych testów (D029), zalogował prywatnie CLI i jawnie zatwierdził najpierw 20 migracji, potem syntetyczny smoke z kluczami tylko w pamięci i cleanup własnych danych, a następnie poprawkę C1 z 21. migracją oraz commit/push/wdrożeniem. Preview nie jest blokerem obecnego etapu. SMTP wyjaśniono jako transport zaproszeń/resetów; dla ręcznego konta właściciela odłożony, przed zaproszeniem kolegów wymaga odbioru.

Vercel początkowo miał Ready dla 5c5af85, Node 24.x/Fluid, Supabase Free/nano/Frankfurt Healthy. CLI potwierdziło właściwy ref. Przed zapisem: 0 tabel publicznych, 0 kont Auth, 0 bucketów i 0 obiektów. Pierwsze 20 migracji zastosowano bez resetu/seedów/ról/Vault; historia zgodna, z T10. RLS 17/17, brak DML anon/authenticated do 12 chronionych tabel, dwa prywatne buckety.

Smoke ujawnił biznesowy SQLSTATE 40001: HTTP 400 zamiast 409, potem bezpośredni RPC timeout 30 s. Oficjalne dokumenty Supabase opisują zapętlenie takich błędów w PostgREST 14; wersji hostowanego PostgREST nie ustalono. Po próbach brak aktywnych backendów authenticator; bez restartu/terminate. D030/T11-C1 dodaje migrację zastępującą dokładnie 1+4 RAISE przez PT409 w dwóch funkcjach i mapowanie PT409→409 w API, bez zmiany danych/snapshotów/receipts/grantów. Stare migracje zachowane. Poprawka przeszła lokalnie i została zastosowana po zgodzie: produkcja ma 21/21 migracji, kod ddaceb3 wypchnięty, Vercel `dpl_AzhtfUHBRouX92RRhbTA5F19r5jX` Ready, build 53 s.

**Zweryfikowany adres do ręcznych testów właściciela: [Forma](https://training-plan-app-seven.vercel.app).** Końcowy smoke rzeczywistego HTTPS/Auth/API/Storage A/B/anon przeszedł. Nie jest to pełne zamknięcie T11, klikalny UI ani odbiór telefonu.

W Auth wyłączono publiczną rejestrację i potwierdzono po reload. Anonymous wyłączony; Email/Confirm email i refresh rotation włączone, reuse 10 s, JWT 3600 s. Site URL nadal localhost i brak redirectów. Minimum 12 znaków i URL-e czekają na odpowiedź po auto-review. Custom SMTP wyłączony. Nie wysyłano wiadomości ani nie zmieniano haseł/kluczy. W Chrome otwarto pusty formularz Auth Users → Create new user, Auto confirm checked. Użytkownik sam prywatnie wpisuje e-mail/hasło i tworzy konto; agent tego nie wykonał.

## Zmienione pliki

README, ARCHITECTURE, STATUS, ROADMAP, T11_DEPLOYMENT, T03_AUTH, TESTER_GUIDE, TESTING, DECISIONS, OPEN_QUESTIONS i CHANGELOG: D029/D030, wyniki usług, granice i dalsza praca. Ten handoff i [raport](../reports/2026-10-16-T11-production-audit.json) rozdzielają błędy i sukces.

Kod: dwie trasy API plans/workouts, nowa migracja `20261016210000_t11_business_conflicts.sql`, wzmocnione asercje lokalnych testów T04/T05, osobny `scripts/test-t11-production.mjs` i odczytowy `scripts/audit-t11-production.sql`. Skrypty prepare/verify używają nowego [manifestu C1](../reports/2026-10-16-T11-C1-release.json), 95 źródeł/21 migracji; E1 zachowany. Nie zmieniano .env/env.vercel/prywatnych fixtures.

## Weryfikacja

- Zalogowane przez użytkownika CLI 2.120.0: projects list i link do właściwego refa; history/dry-run/push z `--linked --skip-vault`, bez seedów/ról/resetu/repair. Dwa zatwierdzone pushe: pierwsze 20 oraz C1; końcowa historia 21/21. Audyt SQL przed/po: tylko liczniki i metadane, RLS/granty/buckety niezmienione po C1. Raport bez prywatnych danych i sekretów.
- Anon HTTPS: root 307 na logowanie, plans JSON 401/no-store, cleanup bez Authorization JSON 401. Chrome pokazuje polskie logowanie bez cert warning. Pierwszy fetch w sandboxie ENOTFOUND, po dostępie sieciowym sukces.
- Rzeczywisty smoke: pierwsza próba błędna na 400/409, druga na timeout RPC; każda usunęła swoje 2 konta i 0 plików. Po C1 trzeci przebieg zatrzymało błędne oczekiwanie testu nazwy planu w historii — widok prawidłowo pokazuje datę/status/komentarz. Poprawiono sam test, nie aplikację; 2 konta i 2 pliki usunięte bez błędów.
- Końcowe `node scripts/test-t11-production.mjs --run-approved-smoke`: PASS. Plan/retry, 1RM120/start/retry, cel90/null, zapis/retry, RPC PT409 i HTTP409 starej rewizji, pominięcie/dodatki/komentarz/koniec, nowe wersje i 1RM nie zmieniają starych celów, zero/null, relogin/historia/postęp540kg. B/anon nie czytają 12 tabel A; UPDATE daje42501, A nie czyta planu B. Oba buckety: własny upload i download/źródło, B/anon odmowa, public/signed/cudza ścieżka training-private; signed upload importu, no-store i cancel410. Import process i głos odmawiają503 z wyłączonym AI. Finally: 2 własne konta i 2 pliki, 0 błędów. Bez klikalnego UI/SMTP/telefonu.
- `DO_NOT_TRACK=1 npx --no-install supabase migration up --local` bez resetu; T04/T05 lokalnie PASS z PT409 dla starej rewizji i sprzecznego payloadu, retry i snapshotami. `npm test` z pustym OPENAI_API_KEY i wyłączonymi flagami: 171 passed/9 skipped, 23 pliki passed/5 skipped. Build i następujący typecheck PASS na Node26.4.0; build używa lokalnego .env z kluczem/AI jawnie wyłączonymi. Nie jest to dowód środowiska hostowanego, które sprawdzono oddzielnie.
- Prepare --stage, verify package, node --check smoke: PASS. Źródła95/migracje21 i nowy hash; bez oficjalnego manifestu CLI Vercel. Source deploymentu Git zawiera także docs/supabase i syntetyczne fixtures/generated+cases.json; nie jest kopią95 plików. Indeks i cała historia lokalna nie zawierają .env/env.vercel/fixtures/t06/real; .env.example to dozwolony przykład. Indeks kodu przeskanowano pod znane formaty sekretów przed commitem.
- Aktualne oficjalne dokumenty migracji, SMTP, backupów, cen, cron, limitów, rollbacku i problemu40001 sprawdzone; linki w T11_DEPLOYMENT/D030. Free/Hobby bez zakupu; brak aktywacji płatnego AI.
- Końcowe sprawdzenia: git diff --check, składnia smoke, verify package, 109 linków lokalnych, zgodność raportu i identyczny prompt — sukces; odnotowane w CHANGELOG. Git początkowo odmówił index.lock w sandboxie; zatwierdzony commit/push ponowiono z uprawnieniem. Pomoc CLI raz miała EPERM telemetry bez DO_NOT_TRACK; powtórzona z DO_NOT_TRACK sukces. Przejściowe stany UI wymagały świeżego odczytu i jawnej nawigacji na zaobserwowany adres.

## Decyzje i zmiany planu

D029: tylko Production do obecnych testów. D030: PT409 dla biznesowego konfliktu, bez zmiany semantyki retry i historii. T11-C1 wydzielono po wykryciu błędu, zależności T10/T11-E1 spełnione; done po rzeczywistym 409/retry na hostingu i lokalnej regresji. T11 nadal in_progress, T10-R1 nadal zależy od T11. Brak zmian wymagań produktu, płatnych usług i nowych środowisk.

## Pozostała praca i blokery

1. Klikalny UI zalogowanego właściciela. Otwarty formularz konta wymaga prywatnego wypełnienia przez użytkownika; konta testowe usunięte. Nie podawać haseł/cookies w chacie lub repo.
2. Minimum hasła12, Site URL na zweryfikowany adres produkcji i dokładne `/auth/confirm`, `/ustaw-haslo` wymagają odpowiedzi na wysłaną prośbę. Auto-review odrzucił pierwszą próbę minimum jako trwałą zmianę produkcji bez wyraźnej zgody. Nie obchodzić odmowy.
3. CRON_SECRET wymaga prywatnego potwierdzenia jakości/ustawienia przez użytkownika; bez odczytu/rotacji przez agenta. Cron panel Enabled, GET cleanup, `0 3 * * *`; ręczne Run odrzucone przez auto-review jako produkcyjne usuwanie bez osobnej zgody. Brak 200 i dowodu fizycznej retencji/backlogu. Udane cancel410 dotyczy blokowania dostępu do źródła, nie działania schedulera.
4. Backup/restore: Free bez automatycznych backupów/PITR, DB backup nie zawiera bajtów Storage. Brak operatora, szyfrowanego miejsca/retencji/RPO/RTO i próby odtworzenia; nie deklarować sprawdzonej kopii. D029 nie upoważnia do nowego płatnego recovery. Lokalne syntetyczne recovery to możliwy kolejny krok, nie pełny restore hostingu.
5. Rollback aplikacji nie cofa SQL. Nowa konfiguracja/granty pozostają; stare buildy bez PT409 źle mapują konflikty, więc nie są bezpiecznym punktem funkcjonalnego rollbacku. Pierwszy sprawdzony kod to ddaceb3; przy problemie ograniczyć zapisy i naprawić do przodu. Nie wykonywano próbnego rollbacku.
6. SMTP/dostarczenie zaproszeń przed dodaniem kolegów. Audio5MiB kontra payload4,5MB nadal blokuje włączenie głosu. Telefon/Safari i szersza beta po T10-R1. Koszty Free/Hobby i limity opisane, ale alerty/operator nie ustalone; bez zakupów i nowych budżetów.

## Następny krok

Dokończyć T11 od prywatnego konta właściciela i wymaganych zgód Auth/Run; następnie UI, cron/retencja i backup/restore. Link jest zweryfikowany do ręcznych testów, nie jest odbiorem szerszej bety. Nie uruchamiać następnych zadań automatycznie.

## Stan środowiska

Supabase CLI zalogowane przez użytkownika, ignorowane `.temp/project-ref` wskazuje produkcję. Nie odczytywano tokenu/keychain. Początkowy odczyt zastanej karty legacy API Keys zawierał wartości w wyniku narzędzia; nie kopiowano ich do plików/dokumentacji ani nie użyto do obejścia odmowy. Późniejsze zatwierdzone CLI pobierało klucze tylko w pamięci. Bez rotacji.

Nie uruchomiono lokalnego serwera aplikacji; lokalny Supabase pozostaje dostępny i ma migrację21. Brak pozostawionych kont/plików smoke. Prywatne /private/tmp: metadane audit, skrypt wcześniejszej wersji smoke (aktualny jest w repo), prompt, screenshot wyłączonej rejestracji i `t11-c1-deployment-ready.png` bez sekretów. Karta aplikacji oznaczona jako wynik, karta Supabase jako handoff z pustym formularzem tworzenia konta.

## Prompt dla kolejnego agenta

Rekomendacja: **gpt-6.1-sol, high** — integracje przy niższym koszcie niż Astra.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T11 od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-16-T11-produkcja-migracje.md, T11_DEPLOYMENT, T03_AUTH, DECISIONS, TESTING i WORKFLOW. D029: tylko Production do własnych testów, bez preview. Supabase kwmyosnerwvtwxtszzka ma 21/21 migracji; T11-C1/PT409 wdrożone jako ddaceb3, deployment dpl_AzhtfUHBRouX92RRhbTA5F19r5jX Ready. HTTPS https://training-plan-app-seven.vercel.app i smoke HTTP/Auth/API/Storage A/B/anon przeszły; raport docs/reports/2026-10-16-T11-production-audit.json. T11-C1 done, T11 in_progress. Dokończ klikalny UI właściciela, Auth, cron/retencję i backup/restore/rollback. Użytkownik ma pusty formularz Supabase Create a new user i sam prywatnie tworzy konto, bez SMTP. Auto-review odrzucił zapis minimum hasła 12 i Run crona; te zgody nadal wymagają odpowiedzi, nie obchodź blokady. Auth Site URL nadal localhost, redirectów brak; zaproponowane są produkcyjny URL oraz dokładne /auth/confirm i /ustaw-haslo. CRON_SECRET potwierdza/wprowadza użytkownik prywatnie, bez odczytu i rotacji przez agenta. SMTP przed zaproszeniami, AI wyłączone bez nowego budżetu; telefon/Safari i szersza beta czekają na T10-R1. Nie cofaj aplikacji do kodu bez PT409; rollback nie cofa SQL. Odbiór T11 wymaga jawnego wyniku UI/Auth, skutecznego cleanup i procedury odtworzenia; nie traktuj udanego HTTP jako zamknięcia całości. Bez agentów, płatnego AI i publikacji .env/env.vercel/fixtures/t06/real. Sprawdź Git, manifest i aktualne dokumenty dostawców, zachowaj historyczne raporty; zaktualizuj dokumentację, handoff i identyczny prompt. Model: gpt-6.1-sol, high — integracje przy niższym koszcie niż Astra.

```

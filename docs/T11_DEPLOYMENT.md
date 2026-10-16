# T11 — przygotowanie wdrożenia i procedura operatorska

Aktualizacja: 2026-10-16, **produkcyjny build Ready i 21 migracji; smoke HTTP zaliczony, pozostały odbiór w toku**. T09/T10 są done lokalnie (D025/D026). T11 wymaga rzeczywistego HTTPS i smoke testu dwóch kont; szersza beta dodatkowo T10-R1. [Instrukcja testera](TESTER_GUIDE.md) nie zawiera jeszcze adresu aplikacji. [Handoff](handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md) podaje wyniki tej sesji.

## Aktualizacja po D031 — testy prototypu i AI

Priorytetem użytkownika jest teraz używanie prototypu. [Forma](https://training-plan-app-seven.vercel.app) działa; formalny pełny odbiór pozostaje otwarty, ale dalsze prace operatorskie nie blokują jego własnych testów. Najnowszy [handoff](handoffs/2026-10-16-T11-prototyp-auth-ai.md) ma pierwszeństwo przed starszym stanem poniżej.

Auth zapisane po jawnej zgodzie: minimum12, produkcyjny Site URL i dokładne redirecty auth/confirm oraz ustaw-haslo. Zweryfikowane po ponownym odczycie. Cron panel Run zwrócił200 (23:02:26.822 CEST) po potwierdzeniu pustej kolejki i0obiektów; nie jest to dowód fizycznej retencji pliku. Początkową odmowę auto-review ponowiono po dowodzie braku kwalifikowanych danych, bez obchodzenia kontroli. CRON_SECRET pozostaje prywatny.

Użytkownik zatwierdził5USD łącznie na start i dodał prywatnie OPENAI_API_KEY (Secret/Production); agent potwierdził wyłącznie nazwę/zakres. Import true/5 wdrożono i sprawdzono rzeczywistym tekstem; po prośbie o głos D032 ustawiono obie flagi true, podział szacunków import4/głos1USD. Głos wymaga nowego wdrożenia i rzeczywistego smoke. Istniejący budżet aplikacji jest rezerwacją0,05USD/próbę w24h, więc nie gwarantuje łącznego limitu5USD. Zgoda nie odnawia się codziennie; śledzić koszt tej fazy, nie uruchamiać kolejnych serii automatycznie. Dla osobnego projektu API użytkownik otrzymał instrukcję [Enforce a hard limit5USD](https://developers.openai.com/api/docs/guides/spend-limits); zapis tego limitu nie jest potwierdzony. Import używa istniejącego [gpt-6-luna](https://developers.openai.com/api/docs/models/gpt-6-luna); bez zmiany modelu. Dostępność na danym kluczu sprawdzi rzeczywisty test, nie sam katalog dostawcy.

Backup wybrany na Macu poza repo, ale odłożony na życzenie użytkownika przed wdrożeniem mechanizmu. Dotychczas tylko publiczny schema-only dump do /private/tmp (bez danych kont i plików), brak szyfrowanego archiwum/klucza w Keychain/restore. Nie tworzono recovery ani nie zmieniano lokalnej bazy. SMTP przed zaproszeniami; D032 dopuszcza krótkie próby głosu już teraz, maksymalny transport pozostaje otwarty przed pełną betą. Szersza beta po T10-R1.

## Bieżący wynik weryfikacji — 2026-10-16

Nowsza D029 ma pierwszeństwo przed historycznymi krokami preview poniżej: **tylko Production do testów właściciela**. Nie tworzyć drugiej bazy ani kierować Vercel Preview do produkcji. Brak preview nie blokuje obecnego etapu. SMTP jest potrzebny do mailowych zaproszeń/resetów, a nie do logowania ręcznie utworzonego konta; przed zaproszeniem kolegów wymaga osobnego odbioru.

- Vercel: Production/Current/Ready `dpl_AzhtfUHBRouX92RRhbTA5F19r5jX`, kod commit `ddaceb3e7c438bc81d02a55e0fede9bbf2d31ff5`, build 53 s, Node 24.x, Fluid Compute Enabled, Standard Protection. Poprzednie Ready: `rNEeBVuupz5KxbsxRKNphVRN9XvH` (`ca4be88`) i `GDAvtKTbBianiPZAfLYrPjuqnTRJ` (`82b9eb7`); nie są jeszcze sprawdzonymi punktami rollbacku.
- Supabase: Free, Healthy, Frankfurt/eu-central-1, nano. Zalogowane przez użytkownika CLI 2.120.0 zostało powiązane z właściwym refem. Przed migracjami odczytano 0 tabel publicznych, 0 kont Auth, 0 bucketów i 0 obiektów Storage. Po jawnym „Tak, zastosuj 20 migracji” wykonano `db push --linked --skip-vault`, bez seedów, ról, resetu i Vault. Historia pierwszych20/20 zgodna, zT10; później po osobnej zgodzie zastosowano21. migracjęC1. RLS/granty/buckety po 21 nadal zgodne.
- [Raport metadanych](reports/2026-10-16-T11-production-audit.json): wszystkie 17 tabel publicznych ma RLS; brak grantów INSERT/UPDATE/DELETE dla anon/authenticated do 12 tabel chronionych T05/T10. Oba buckety prywatne, training-imports ma limit 2 MiB i cztery dozwolone MIME. Sam odczyt metadanych nie zastępuje A/B/anon.
- HTTPS: przeglądarka pokazuje polskie logowanie; bez cookies `/` daje 307 na logowanie, `/api/plans` JSON 401 z no-store, cleanup bez Authorization JSON 401. To częściowy smoke anonimowy. Późniejsze dwie próby A/B zapisały plan/1RM/start/serię i potwierdziły retry, 90 kg oraz null bez maksimum, ale nie zaliczyły konfliktu: HTTP 400 zamiast 409, następnie bezpośredni RPC timeout30s. Obie próby usunęły swoje 2 konta i nie utworzyły plików. PoC1 pełny smoke HTTP przeszedł; trzecia próba miała błędną asercję nazwy planu w historii, czwarta po poprawie samego testu przeszła. Ostatnie2 konta i 2 pliki posprzątane,0 błędów. Klikalny UI i SMTP nieodebrane. Zweryfikowany adres do ręcznych testów właściciela: [Forma](https://training-plan-app-seven.vercel.app).
- Auth: wyłączono publiczne rejestracje i potwierdzono zapis po reload; anonymous sign-in był i pozostaje wyłączony, Email oraz Confirm email włączone. Rotacja/wykrywanie ponowienia refresh tokenów włączone, reuse 10 s, JWT 3600 s. Site URL nadal localhost:3000, redirectów brak; minimum 12 znaków i URL-e czekają na zgodę po odrzuceniu zapisu przez automatyczny przegląd uprawnień. Custom SMTP wyłączony. Nie wysyłano zaproszeń i nie zmieniano haseł/kluczy.
- Cron: panel Enabled, GET `/api/imports/cleanup`, `0 3 * * *`. Ręczne Run odrzucone przez automatyczny przegląd jako produkcyjne wykonanie usuwania danych bez osobnej zgody. Nie odczytywano/rotowano CRON_SECRET; jakość wartości nadal do prywatnego potwierdzenia przez użytkownika. Brak dowodu 200, cleanup wygasłego importu i restore.
- Manifest lokalny 95 źródeł/20 migracji przechodzi ponowną weryfikację SHA-256. Faktyczny Source automatycznego deploymentu Git jest szerszy niż kopia CLI: zawiera docs, supabase oraz tylko syntetyczne fixtures/t06/generated i cases.json. Nie utożsamiać tego widoku z paczką 95 plików; nie ma oficjalnego manifestu uploadu CLI. Indeks i cała lokalna historia Git nie zawierają `.env`, env.vercel ani fixtures/t06/real; `.env.example` to dozwolony pusty przykład. Nie wykonano nowego uploadu ani Redeploy.

### T11-C1 — poprawka po niezaliczonym smoke

Nowy problem: biznesowy SQLSTATE 40001 jest zgodny z [opisaną przez Supabase pętlą ponowień PostgREST](https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b). Nie potwierdzono wersji hostowanego PostgREST; dowodem problemu są rzeczywiste timeouty przy poprawnej starej rewizji. Po próbach odczyt pg_stat_activity wykazał 0 aktywnych authenticator; nie zatrzymywano backendów ani projektu.

Lokalna poprawka D030: `20261016210000_t11_business_conflicts.sql` zastępuje dokładnie 5 kodów 40001 przez PT409 w dwóch funkcjach, API plans/workouts mapuje PT409 na 409. Nie zmienia danych, snapshotów, receipts, grantów i starych migracji. Lokalna migracja, T04/T05 z asercjami PT409, 171 testów (9 skipped), build i sekwencyjny typecheck przeszły. Nowy [manifest C1](reports/2026-10-16-T11-C1-release.json): 95 źródeł, 21 migracji, bez uploadu; historycznego E1 nie nadpisano. Dry-run wskazał tylko nową migrację; użytkownik zatwierdził jej zastosowanie i wdrożenie. Migracja21 zastosowana, historia 21/21, kod ddaceb3 wypchnięty i Ready. Ponowiony `node scripts/test-t11-production.mjs --run-approved-smoke` przeszedł na Production: PT409/409 bez timeoutu, ręczny trening/historia/postęp 540 kg, oba prywatne buckety, A/B/anon, zero/null, odmowaAI503.

Użytkownik zatwierdził klucze wyłącznie w pamięci, dwa konta syntetyczne i sprzątanie własnych danych, więc te czynności wykonano. Nie oznacza to zatwierdzenia nowej migracji, Auth ani Run crona. Skrypt smoke ma osobny stały ref/adres, limity30s i cleanup własnych kont/plików; obejmuje HTTP/Auth/API/Storage, bez klikalnego UI/SMTP i płatnego AI. Pierwsze dwa wyniki błędne i późniejszy błąd asercji testu pozostają zapisane w raporcie obok końcowego sukcesu.

Aktualne dokumenty sprawdzono 2026-10-16: [migracje](https://supabase.com/docs/guides/deployment/database-migrations), [CLI db push](https://supabase.com/docs/reference/cli/supabase-db-push), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [backup](https://supabase.com/docs/guides/platform/backups), [cennik Supabase](https://supabase.com/pricing), [Hobby Vercel](https://vercel.com/docs/plans/hobby), [cron](https://vercel.com/docs/cron-jobs/usage-and-pricing), [limity funkcji](https://vercel.com/docs/functions/limitations), [rollback](https://vercel.com/docs/instant-rollback). Supabase Free: 500 MB DB, 1 GB Storage, 5 GB egress, 2 aktywne projekty, pauza po tygodniu bezczynności; brak automatycznego backupu/PITR. Te limity nie są skonfigurowanym alarmem ani uzgodnionym RPO/RTO. Backup bazy nie zawiera bajtów Storage. Vercel Hobby cron najwyżej raz dziennie z oknem godzinnym; limit payloadu 4,5 MB nadal blokuje włączenie głosu 5 MiB. Bez zakupu, zmiany planu i płatnego AI.

Poniższe sekcje zachowują procedurę przygotowaną wcześniej. Wymogi preview dotyczą dopiero ewentualnego ponownego uruchomienia tego środowiska; nie są zleceniem jego tworzenia w bieżącym T11.

## 1. Dostęp i wybór celów — wymagane przed zmianą usług

Sprawdzono lokalną konfigurację oraz katalog integracji. Vercel i Supabase są dostępne do instalacji, ale nie są zainstalowane/połączone w tej sesji. Brak `.vercel/project.json`, `supabase/.temp/project-ref` i tokenów Vercel/Supabase w środowisku procesu. `supabase projects list --output json` odrzuciło brak tokenu. CLI Vercel 64.0.2 zainstalowano wyłącznie w `/private/tmp`; dry-run z oddzielnym katalogiem konfiguracji zakończył się `No existing credentials found`. Nie sprawdzono zdalnych kont ani list projektów; brak lokalnego dostępu nie oznacza braku usług na koncie użytkownika.

Użytkownik musi wskazać bez sekretów:

- Zespół/konto i nazwę/ID projektu Vercel, uprawnienie do wdrożenia i ustawień; docelowy stabilny adres preview i adres produkcji (mogą być domenami Vercel, własna domena nie jest wymagana).
- Organizację oraz dwie **różne** referencje projektów Supabase: preview i production. Jeśli potrzebne są nowe projekty: organizację, region i uzgodniony koszt. Nazw projektów nie traktujemy jako zgody na zakup planu.
- Sposób dostępu: połączone integracje lub zalogowane CLI. Tokenów, hasła DB i kluczy nie wklejać do chatu/repo. Osoba konfigurująca przechowuje je w menedżerze sekretów lub zmiennych bezpiecznej sesji.
- Dostawcę SMTP i nadawcę do zaproszeń, operatora awarii/backupów, limit kosztów hostingu i osobno ewentualny budżet AI. Brak ustalonego AI oznacza wyłączone import/głos; dawnych 5 USD T06 i 0,50 USD T09 nie przenosimy na hosting.

Pierwszy krok po uzyskaniu dostępu to odczyt organizacji/projektów, planu usług i regionów oraz zapis potwierdzonych identyfikatorów w tym dokumencie. Aktualizacja 2026-10-16: projekt Vercel i produkcyjny ref Supabase zostały ustalone (sekcja 2). Cel preview pozostaje nieustalony. Nie utworzono projektu, nie skonfigurowano sekretów i nie wywołano płatnego AI.

## 2. Izolacja środowisk i konfiguracja — T11-E1, 2026-10-16

Potwierdzone z bieżącej karty Chrome: Vercel `gisupanalizy-gmailcoms-projects/training-plan-app`; Supabase `supabase-violet-cable`, ref produkcyjny `kwmyosnerwvtwxtszzka`. Integracja Marketplace ma Custom Prefix `STORAGE` i zakres Production. To dowód podłączenia i nazw zmiennych, nie gotowego schematu, jakości kluczy ani udanego wdrożenia. Preview nadal wymaga drugiego projektu Supabase; nie łączyć go z produkcją.

Od T11-E1 aplikacja wybiera **całą rodzinę integracji** przed dawnymi ręcznymi nazwami:

- Publiczny URL: `NEXT_PUBLIC_STORAGE_SUPABASE_URL`.
- Publiczny klucz: `NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY`, a gdy pusty/brak — starszy `NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY`.
- Wyłącznie serwer: `STORAGE_SUPABASE_SECRET_KEY`, a gdy pusty/brak — starszy `STORAGE_SUPABASE_SERVICE_ROLE_KEY`. Nowe secret keys mają uprawnienia service_role i są obsługiwane przez SDK. [Klucze Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

Nie należy przepisywać tych wartości ręcznie. Gdy istnieje choć jeden publiczny element rodziny STORAGE, niepełna para URL/klucz jest błędem — aplikacja nie dobiera brakującego pola z ręcznej konfiguracji. Sekret serwerowy też musi pochodzić z rodziny STORAGE. Ręczne duplikaty mogą zawierać stare wartości; nie mają pierwszeństwa nad integracją. Publiczna konfiguracja nadal odrzuca klucz administracyjny, HTTP, złą referencję i bazę produkcyjną w preview. Wybranie źródła nie dowodzi, że dostawca wydał klucz dla tego samego projektu; to wymaga zdalnego smoke.

Bez rodziny STORAGE zachowane są lokalne/standardowe `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY`), oraz serwerowe `SUPABASE_SECRET_KEY`/`SUPABASE_SERVICE_ROLE_KEY`. Lokalnego .env nie zmieniano. Nie udostępniać żadnego sekretu pod `NEXT_PUBLIC_*`. Integracja synchronizuje swoje zmienne; zostawić wszystkie jej wpisy, również nieużywane `STORAGE_POSTGRES_*` i `STORAGE_SUPABASE_JWT_SECRET`. [Marketplace Supabase](https://supabase.com/docs/guides/integrations/vercel-marketplace).

Po dostępności nowego kodu zbędne w **Vercel** są trzy ręczne duplikaty bez ikonki integracji: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Usunięcie wpisów nie unieważnia kluczy w Supabase i nie usuwa wpisów STORAGE. Stary build może jeszcze odczytywać stare nazwy — nie przedstawiać nowego kodu lokalnego jako wdrożonego. 2026-10-16, po jawnym potwierdzeniu użytkownika, usunięto te trzy ręczne wpisy i zweryfikowano brak w UI przy zachowanej rodzinie STORAGE. Nie klikano Redeploy; stan działającej wersji wymaga osobnej kontroli T11. [Handoff cleanup](handoffs/2026-10-16-T11-E1-usuniecie-duplikatow.md).

Ręcznie w Vercel pozostaje osiem ustawień aplikacji, każde w zakresie **Production**:

- `APP_ENV=production` (systemowego `VERCEL_ENV` nie ustawiać ręcznie; pozostawić włączony dostęp do System Environment Variables).
- `SUPABASE_EXPECTED_PROJECT_REF=kwmyosnerwvtwxtszzka`.
- `SUPABASE_PRODUCTION_PROJECT_REF=kwmyosnerwvtwxtszzka`.
- `CRON_SECRET`: istniejący losowy sekret, co najmniej 32 bajty losowości, typ Secret. W tej sesji zachowywana jest wartość i ograniczany zakres; bez ujawniania, obracania i bez deklarowania jakości niewidocznego sekretu. W razie wcześniejszego wklejenia tekstowego placeholdera operator musi sam ustawić rzeczywisty losowy sekret bez przesyłania go przez chat.
- `OPENAI_IMPORT_ENABLED=false`, `OPENAI_IMPORT_BUDGET_USD=0`.
- `OPENAI_VOICE_ENABLED=false`, `OPENAI_VOICE_BUDGET_USD=0`.

Dwa powyższe wiersze AI reprezentują cztery osobne zmienne. Klucza OpenAI nie dodawać bez nowego zlecenia/budżetu. Niesekretne ustawienia można tworzyć jako Config; już zapisane jako Secret zachowują swój typ. Typ Secret nie zwalnia publicznego publishable z publikacji przez bundler — to przeznaczony do klienta klucz, podczas gdy klucz administratora pozostaje w serwerowym module.

W Preview ustawić osobne `APP_ENV=preview`, oczekiwany ref innego projektu i jego integrację; ref produkcji pozostaje taki jak wyżej. Nie kopiować danych/sekretów produkcji do preview. Obecnie nie przygotowano drugiej bazy.

Publiczne zmienne Next trafiają do builda: po zmianie środowiska budować ponownie. Nie promować gotowego builda preview z refem preview do produkcji. W Vercel wybrać Next.js, Node 24.x, `npm ci`, `npm run build`, domyślne wyjście Next oraz Fluid Compute. Sprawdzić rzeczywiste ustawienia i maxDuration importu 150 s/głosu 60 s. Build T11-E1 sprawdzono na Node 26.4.0 z syntetycznymi zmiennymi STORAGE i VERCEL_ENV=production; nie jest to test usług hostowanych. [Czas funkccji Vercel](https://vercel.com/docs/functions/configuring-functions/duration).

## 3. Manifest i bezpieczna wysyłka

Aktualizacja T11-G1: użytkownik utworzył publiczne repo `gisupanalizy/training-plan-app` i zlecił pierwszy commit/push. Git zainicjowano na `main`; wynik operacji dokumentuje [handoff Git](handoffs/2026-10-14-T11-G1-pierwszy-commit.md). `.gitignore` chroni prywatne fixtures i `.env*` (oprócz pustego przykładu); `.vercelignore` dopuszcza tylko źródła aplikacji, konfiguracje builda i skrypt odtworzenia workera. Wyklucza całe docs/fixtures/supabase, testy, lokalne wyniki i sekrety. Reguły Vercel nie zastępują reguł Git: przy przyszłym repo trzeba sprawdzić także indeks i historię, ponieważ ignore nie usuwa wcześniej śledzonych plików. [Zasady `.vercelignore`](https://vercel.com/docs/deployments/vercel-ignore).

```sh
node scripts/prepare-t11-deploy.mjs --stage
```

Polecenie tworzy nowy katalog tymczasowy i [lokalny manifest SHA-256 T11-C1](reports/2026-10-16-T11-C1-release.json): 95 plików oraz osobny wykaz 21 migracji. Zwraca dokładną ścieżkę kopii. Nie czyta `.env`, nie kopiuje fixtures, nie wysyła danych; odrzuca dowiązania, zagnieżdżone `.env`, pliki kluczy i rozpoznane formaty sekretów. Kontrola formatów nie jest pełnym skanerem sekretów. Migracje są w wykazie, **nie w paczce Vercel**. Worker PDF.js odtwarza prebuild z zablokowanej wersji zależności.

Zalogowane CLI należy powiązać z **istniejącym, wskazanym** projektem w kopii tymczasowej. Nie uruchamiać deploy z katalogu roboczego zawierającego prywatne pliki. Po powiązaniu, z wnętrza kopii:

```sh
vercel deploy --dry --format=json
```

Sprawdzić pełną listę plików dostawcy, ich skróty/rozmiary, wykryty Next.js i brak prywatnych ścieżek. Zapisać wynik poza paczką, porównać ze źródłowym manifestem; różnice domyślnych wykluczeń i pliki wygenerowane podczas builda wyjaśnić przed uploadem. Po lokalnym buildzie `.next`, node_modules i worker nie należą do uploadu źródeł. Każda zmiana źródeł wymaga nowej kopii, manifestu i kontroli. Obecnie **manifest Vercel niewykonany z braku poświadczeń**; lokalny manifest nie jest dowodem uploadu. Oficjalny dry-run nie wysyła plików. [Opis Vercel dry-run](https://vercel.com/changelog/dry-run-deployments-with-vercel-cli).

## 4. Migracje i Auth

Zestaw ma 21 plików `supabase/migrations/*.sql`; stosować rosnąco do potwierdzonego celu. D029: obecnie tylko Production. Pierwsze 20 z T10 zastosowano; 21. `20261016210000_t11_business_conflicts.sql` należy do C1 i została zastosowana po osobnym zatwierdzeniu. Zestaw i skróty w manifeście; T10 pozostaje obowiązkowy. Nie przenosić lokalnej bazy, seedów, prób AI ani prywatnych danych. `supabase/config.toml` opisuje lokalny stack i **nie konfiguruje automatycznie hostowanego Auth/SMTP**.

W źródłowym projekcie, po bezpiecznym zalogowaniu do CLI i ustawieniu potwierdzonego refa, operować kolejno na jednym środowisku:

```sh
DO_NOT_TRACK=1 npx supabase link --project-ref "$T11_PROJECT_REF"
DO_NOT_TRACK=1 npx supabase migration list
DO_NOT_TRACK=1 npx supabase db push --linked --dry-run --skip-vault
DO_NOT_TRACK=1 npx supabase db push --linked --skip-vault
DO_NOT_TRACK=1 npx supabase migration list
```

`T11_PROJECT_REF` to wyłącznie wcześniej potwierdzone ID, nie sekret. Hasło przekazać bezpiecznie, bez argumentu CLI/śladu w historii. Każdorazowo porównać powiązanie z zamierzonym środowiskiem. `--skip-vault` zapobiega ubocznemu wysyłaniu konfiguracji Vault; brak `--include-seed`/`--include-roles`. Przy istniejącej bazie najpierw backup i porównanie historii. Nie używać resetu zdalnego, automatycznego `migration repair` ani `--include-all` do maskowania rozbieżności. Częściową awarię rozpoznać po historii; naprawa kompatybilna do przodu. [Migracje Supabase](https://supabase.com/docs/guides/deployment/database-migrations).

Po migracjach odczytać i zapisać dowody: wszystkie tabele prywatne mają RLS, klient nie ma DML do 12 tabel planu/wykonania (D026/T05), funkcje publikacji i komend działają przez sesję właściciela. Buckety `training-private` i `training-imports` muszą mieć `public=false` i poprawne polityki właściciela; sprawdzić ograniczenia MIME/wielkości importu. Rewizje, receipts i snapshoty T06-R1 nie mogą być pominięte. Potwierdzić zgodność historii z **całą** listą 21 migracji, a nie tylko istnienie ostatniej tabeli.

W obu projektach Auth wyłączyć publiczne rejestracje i anonymous sign-in, włączyć e-mail/hasło, rotację refresh tokenów, hasło minimum 12 znaków. Ustawić Site URL na stabilny HTTPS danego środowiska i dokładne redirecty dla `/auth/confirm` oraz `/ustaw-haslo`. Szablon zaproszenia z `supabase/templates/invite.html`: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`. Nie dodawać szerokich wildcardów całego `vercel.app`. Odbiór: wygenerowanie zaproszenia i ustawienie hasła, ponowne logowanie, wylogowanie oraz wygasła sesja. Dwa syntetyczne konta admin-create nie dowodzą dostarczania zaproszeń.

**SMTP wymaga ustalenia:** domyślna usługa Supabase ogranicza wysyłkę do adresów zespołu projektu i obecnie do 2 wiadomości/h. Koledzy nie powinni otrzymywać dostępu administracyjnego do organizacji jako obejścia. Skonfigurować wskazany SMTP, domenę/nadawcę i limity; sprawdzić dostarczenie wiadomości. Nie zakładać nowej płatnej usługi bez uzgodnienia. [SMTP Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

## 5. Limity, AI i logi

Przed aktywacją AI uzgodnić oddzielne budżety aplikacji w oknie 24 h i miesięczne ograniczenia usług oraz właściciela alertów. Rezerwacja importu 0,05 USD/próbę i głosu 0,01 USD/próbę są szacunkami, nie rachunkiem. Nie resetować liczników. Dostępne w OpenAI limity wydatków mają własny zakres i zasady egzekwowania; sprawdzić rzeczywiście ustawioną kwotę i reakcję na koncie zamiast utożsamiać alert z blokadą. Nie zmieniać limitu organizacji współdzielonej bez uzgodnienia. [OpenAI spend limits](https://developers.openai.com/api/docs/guides/spend-limits). Oddzielne klucze projektowe preview/production, tylko serwer; przed włączeniem sprawdzić dostęp do istniejących modeli i aktualne taryfy. W tej sesji nie zmieniono modeli i nie sprawdzono dostępu do ich API.

Istniejące limity produktu: PDF/XLSX 1 MB, zdjęcie 2 MB, tekst 30 KB, PDF 6 stron, 10 importów/konto/dobę, 2 aktywne, 3 próby; głos 30 s i 5 MiB w API. **Otwarty warunek przed włączeniem głosu:** Vercel ogranicza body żądania i odpowiedzi funkcji do 4,5 MB, czyli mniej niż dopuszczone audio plus multipart. Rozwiązać przez limit transportu z zapasem po stronie UI/API albo uzgodniony prywatny upload; zmiana kontraktu produktu ma być propozycją, nie cichą redukcją limitu. Zmierzyć także JSON podglądu XLSX, bo limit komórek nie dowodzi wielkości odpowiedzi. Ręczny trening można sprawdzić z AI wyłączonym; wynik nie obejmuje płatnej ścieżki AI i tę granicę trzeba jawnie zapisać w odbiorze. [Limity funkcji Vercel](https://vercel.com/docs/functions/limitations).

Logi operatorskie: status HTTP, czas, wersja wdrożenia i bezpieczne identyfikatory korelacji; bez body, nagrań, transkrypcji, źródeł, haseł i nagłówków Authorization/Cookie. Zweryfikować błędy 401/403/404/409/413/422/429/500/503, timeouty i konfigurację retencji logów na faktycznym planie usług. Nie dodawać narzędzi analitycznych rejestrujących formularze. Uzgodnić alert kosztu, awarii cleanup i błędów aplikacji oraz kanał odbioru; w tej sesji niczego nie wysyłano innym osobom i nie uruchomiono monitorów.

## 6. Cron i retencja

`vercel.json` ma `GET /api/imports/cleanup` codziennie o 03:00 UTC (05:00 latem / 04:00 zimą w Warszawie). `CRON_SECRET` jest porównywany z Bearer bez zależności od sesji użytkownika. Sprawdzić 401 bez/błędnego sekretu i 200 z właściwym, zero usunięć niewygasłych zadań oraz rzeczywiste usunięcie syntetycznego wygasłego/anulowanego importu i obiektu Storage. Kontrola RLS użytkowników nadal osobno.

Vercel uruchamia cron na **produkcyjnym wdrożeniu projektu**, więc preview tego samego projektu nie ma własnego automatycznego cleanup. Przed utrzymywaniem plików w preview skonfigurować i zweryfikować osobny uzgodniony scheduler dla preview albo jawnie opróżniać syntetyczne dane po każdej sesji i wyłączać środowisko między sesjami. Nie kierować produkcyjnego cleanup do preview. Na Hobby codzienny cron ma dokładność do godziny; awarie nie są automatycznie ponawiane. [Cron i produkcja](https://vercel.com/docs/cron-jobs), [limity crona](https://vercel.com/docs/cron-jobs/usage-and-pricing), [obsługa błędów](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

Źródło/szkic/próby importu wygasają po 7 dniach, anulowane kwalifikują się od razu; opublikowany plan pozostaje. Cleanup usuwa Storage przed rekordem DB i najwyżej 50 importów na wywołanie. Sukces HTTP nie dowodzi pustej kolejki. Przy 50 usunięciach lub pozostającym backlogu operator ponawia chronione żądanie i kontroluje najstarszy kwalifikowany rekord aż do zera; trwała awaria Storage wymaga naprawy, bez usuwania samego odnośnika DB. Uzgodnić alarm braku udanego sprzątania przez 26 h i kontrolę backlogu. Nie obiecywać fizycznego usunięcia dokładnie w siódmej dobie przy codziennym schedulerze; dostęp do wygasłego źródła jest blokowany wcześniej. Dodatkowo sprawdzić osierocone uploady po błędach i limit czasu całej partii na hostingu.

Audio/transkrypcja nie są utrwalane przez aplikację. `voice_attempts` po 7 dniach usuwa ten sam cleanup. `store:false` w Responses nie oznacza zerowej retencji wszystkich danych u dostawcy; przed aktywacją odczytać ustawienia projektu, ograniczenia endpointów i wymagania dostawcy. [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data). Backupy i logi mają oddzielną retencję; informację przekazać testerom. W tym przygotowaniu nie nadano nowych terminów przechowywania danych użytkownika.

## 7. Backup, odtworzenie i rollback

Przed pierwszymi danymi testerów operator ustala miejsce **szyfrowanego backupu poza repo**, harmonogram, uprawnienia, retencję i dopuszczalną utratę danych/czas przywrócenia (RPO/RTO). Propozycja do uzgodnienia: backup codzienny i przed migracją; nie jest to działająca usługa. Sprawdzić faktyczny plan Supabase: Free wymaga własnych eksportów, backup bazy nie obejmuje bajtów Storage. Dostępność PITR nie jest domyślna. [Backupy Supabase](https://supabase.com/docs/guides/platform/backups).

Procedura: zatrzymać zapisy na czas spójnego eksportu lub użyć zweryfikowanego mechanizmu snapshotu; zapisać historię migracji, schemat, dane/role i wymagane Auth zgodnie z metodą odtwarzania dostawcy. CLI `db dump` domyślnie nie jest pełną kopią całego projektu — sprawdzić wyłączenia schematów i obsługę Auth/Storage. Oddzielnie eksportować nieprzeterminowane obiekty obu prywatnych bucketów z kontrolą rozmiaru/hash oraz ustawienia Auth/SMTP/cron, bez sekretów w raporcie. Backupy źródeł muszą mieć uzgodnioną retencję; nie archiwizować ich bez końca. Sekrety odtwarzać z menedżera, nie z repo ani logów. Przy pustym nowym projekcie zapisać fakt pustego stanu oraz wykonać odtworzenie próbki syntetycznej.

Odtworzenie sprawdzić w osobnym, wskazanym projekcie recovery, bez nadpisywania produkcji i bez przenoszenia prywatnej produkcji do zwykłego preview. Zmierzyć RPO/RTO, zgodność liczby rekordów/plików, logowanie A/B, RLS, receipts/retry, wersje i snapshoty. Odtworzone importy, które w międzyczasie wygasły, usunąć przed otwarciem dostępu. Dopiero dowód odtworzenia pozwala opisać backup jako sprawdzony. Wykonano tylko publiczny schema-only dump, bez danych i odtwarzania; nie jest to backup projektu. Dalsza praca odłożona przez D031.

Rollback aplikacji: zapisać poprzedni działający deployment ID, zakres środowiska, hash źródeł, wersje migracji i ustawienia przed wdrożeniem. Po awarii ograniczyć dostęp/zapisy i wyłączyć płatne ścieżki przez nowe wdrożenie konfiguracji; wybrać wcześniejszy **kompatybilny produkcyjny** build w Vercel, sprawdzić jego stare zmienne/secrets, Auth redirecty i definicję cron. Pierwsze wdrożenie nie ma wcześniejszej wersji — plan awarii to zamknięcie dostępu, naprawa i nowy build. [Rollback Vercel](https://vercel.com/docs/instant-rollback).

Cofnięcie aplikacji nie cofa SQL ani danych. Nie odkręcać migracji T10 i nie przywracać grantów klienta, by uruchomić starszy kod. Preferować kompatybilną poprawkę do przodu. Restore produkcji to osobna operacja awaryjna z uzgodnionym oknem i utratą zapisów od backupu; bez testera pracującego równocześnie. Po rollbacku ponowić smoke A/B/anon i sprawdzić rzeczywisty scheduler.

## 8. Sekwencja wdrożenia i odbiór

1. Potwierdzić wskazany cel Production, dostęp/koszty, bezpieczne źródła i manifest. D029: obecnie nie tworzyć Preview. Przed nowymi prywatnymi danymi uzgodnić backup/odtworzenie.
2. Stosować migracje rosnąco z dry-run i odczytem historii; nie zmieniać zdalnego schematu poza migracjami. Dla C1 uzyskano osobne zatwierdzenie i potwierdzono 21/21.
3. Wdrożyć te same sprawdzone źródła przez zatwierdzony push do istniejącego repo. Odczekać Ready i potwierdzić commit oraz domenę Production. Nie promować builda innej bazy.
4. Sprawdzić rzeczywisty HTTPS/Auth/API/Storage A/B/anon, jawnie rozdzielić klikalny UI i niewykonane scenariusze. Obecny smoke HTTP przeszedł; Auth URL, cleanup i restore pozostają do odbioru. AI wyłączone bez nowej zgody/budżetu.
5. Po sukcesie HTTP podać właścicielowi zweryfikowany adres i ograniczenia oraz instrukcję prywatnego utworzenia konta. T11 done dopiero po spełnieniu całości obecnego odbioru. Szersza beta czeka na T10-R1; SMTP/dostarczenie zaproszeń przed kolegami. Nie wysyłać wiadomości bez jawnego zlecenia.

Smoke wykonuje operator na dwóch własnych kontach syntetycznych A/B i anonimowym kontekście, przez realne HTTPS, UI i Auth/API/Storage. W raporcie zapisać datę, środowisko/refy, deployment ID, hash, narzędzie/przeglądarkę, każdy wynik i sprzątnięte ID. Haseł/cookies/nagrań nie zapisywać.

- HTTPS bez błędów certyfikatu; strona wymaga loginu, API anon daje JSON 401/no-store; błędne wejście daje 400 bez zapisu. `/auth/confirm` i ustawienie hasła działają z zaproszeniem, sesja po odświeżeniu jest poprawna, logout blokuje dostęp.
- A publikuje ręczny plan, dodaje 1RM 120 kg i startuje przy 75% → 90 kg; bez maksimum cel kg pusty. Zapisuje serię, zero bez kg, pominięcie, dodatkową serię/ćwiczenie i komentarz; kończy, ponownie loguje się i sprawdza historię/postęp.
- Utrata odpowiedzi po zapisie → retry z tym samym ID/payloadem nie duplikuje. Osobna stara rewizja daje konflikt. Nowa wersja planu i 1RM nie zmienia starych celów.
- B i anon nie odczytują/zmieniają planu, treningu, dziecka ani źródła A; próby wskazania cudzego rodzica/ćwiczenia i bezpośredniego DML są odrzucone. Sprawdzić także B → A, listing/download/public i podpisane URL Storage oraz odrzucony upload poza własną ścieżką.
- Import na własnym syntetycznym tekście/PDF/XLSX/obrazie: upload, korekta/reload, trzy kroki, braki, jawna publikacja i retry, anulowanie. Głos: propozycja i cel/revizja, odmowa mikrofonu, anulowanie i spóźniony wynik bez samoczynnego zapisu. To żądania płatne tylko po osobnym zleceniu/budżecie; nie wstawiać do produkcji mockowej furtki.
- Bez włączenia AI potwierdzić odmowę bez kosztu oraz cały ręczny trening. Duże audio/XLSX, awarie, limity budżetów, cleanup i próbę recovery udokumentować oddzielnie. CLI lokalne i mocki nie zastępują tych wyników.

Historyczne przygotowanie 2026-10-14: wszystkie kroki zdalnego odbioru były **niewykonane**; aktualny częściowy wynik znajduje się na początku dokumentu. Nie ma działającego linku do podania, wyniku telefonu/Safari ani zgody na szerszą betę.


## Końcowy wynik prototypu — D031/D032

T11 **review**: aplikacja przekazana właścicielowi do własnych testów. Bez dalszego automatycznego rozwijania infrastruktury. Import i głos są włączone na Production. Nowe wdrożenie głosu `dpl_DEkfN1gE4V3kk558B2SGEmVcyawS` Ready44s, kod4e4a0aa (kod aplikacji zgodny zC1). Wcześniejsze importowe `dpl_HnkRh9V8X3KBy7KEimgdbB54hYXe` Ready52s.

Rzeczywisty import tekstu: pierwsza asercja testu błędnie oczekiwała3surowych obiektów zamiast jednego szablonu i set_count3; HTTP200/needs_review już działało. Po poprawieniu testu: PASS,1dzień/1ćwiczenie/3serie×5/60kg/120s,0pytań, retry bez kolejnego AI. Druga próba1909input/473output tokens, szacunek0,0004274USD wg aktualnej taryfy Luny; pierwszej próby ani całej fazy nie rozliczono dokładnie. W obu próbach cleanup własnego konta bez błędów.

Głos: systemowy say/Zosia wygenerował syntetyczne2,91775s WAV97464B. Hostowana transkrypcja200 (~2,943s), interpretacja5powt./60kg na właściwą serię, brak zapisu przed zatwierdzeniem i kontrolowany zapis po zatwierdzeniu przeszły. Runner zatrzymał dopiero dodatkowy odczyt metadanych voice_attempts przez authenticated (42501); tabela prawidłowo nie jest dostępna klientowi. Nie deklarujemy całego runnera jako PASS i nie powtarzano płatnych wywołań dla tej zbędnej kontroli. Własne konto usunięto,0plików/0błędów cleanup. Bez fizycznego mikrofonu i telefonu.

Obie flagi true, szacunki aplikacji import4/głos1USD w24h;5USD łącznie na start obejmuje obie funkcje. To nie twardy łączny limit rachunku ani zgoda na codzienny nowy budżet. Użytkownik otrzymał instrukcję limitu projektu OpenAI, zapis niepotwierdzony. Krótkie nagrania można testować;5MiB wobec4,5MB Vercel pozostaje ograniczeniem dużych plików przed pełną betą. Stary smoke wymagał503AIoff — nie uruchamiać go bez dostosowania do obecnego stanu.

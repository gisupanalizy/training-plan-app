# T11 — przygotowanie wdrożenia i procedura operatorska

Stan: 2026-10-14, **przygotowanie lokalne; wdrożenie niewykonane**. T09/T10 są done lokalnie (D025/D026). T11 wymaga rzeczywistego HTTPS i smoke testu dwóch kont; szersza beta dodatkowo T10-R1. [Instrukcja testera](TESTER_GUIDE.md) nie zawiera jeszcze adresu aplikacji. [Handoff](handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md) podaje wyniki tej sesji.

## 1. Dostęp i wybór celów — wymagane przed zmianą usług

Sprawdzono lokalną konfigurację oraz katalog integracji. Vercel i Supabase są dostępne do instalacji, ale nie są zainstalowane/połączone w tej sesji. Brak `.vercel/project.json`, `supabase/.temp/project-ref` i tokenów Vercel/Supabase w środowisku procesu. `supabase projects list --output json` odrzuciło brak tokenu. CLI Vercel 64.0.2 zainstalowano wyłącznie w `/private/tmp`; dry-run z oddzielnym katalogiem konfiguracji zakończył się `No existing credentials found`. Nie sprawdzono zdalnych kont ani list projektów; brak lokalnego dostępu nie oznacza braku usług na koncie użytkownika.

Użytkownik musi wskazać bez sekretów:

- Zespół/konto i nazwę/ID projektu Vercel, uprawnienie do wdrożenia i ustawień; docelowy stabilny adres preview i adres produkcji (mogą być domenami Vercel, własna domena nie jest wymagana).
- Organizację oraz dwie **różne** referencje projektów Supabase: preview i production. Jeśli potrzebne są nowe projekty: organizację, region i uzgodniony koszt. Nazw projektów nie traktujemy jako zgody na zakup planu.
- Sposób dostępu: połączone integracje lub zalogowane CLI. Tokenów, hasła DB i kluczy nie wklejać do chatu/repo. Osoba konfigurująca przechowuje je w menedżerze sekretów lub zmiennych bezpiecznej sesji.
- Dostawcę SMTP i nadawcę do zaproszeń, operatora awarii/backupów, limit kosztów hostingu i osobno ewentualny budżet AI. Brak ustalonego AI oznacza wyłączone import/głos; dawnych 5 USD T06 i 0,50 USD T09 nie przenosimy na hosting.

Pierwszy krok po uzyskaniu dostępu to odczyt organizacji/projektów, planu usług i regionów oraz zapis potwierdzonych identyfikatorów w tym dokumencie. Obecnie wszystkie cele są **nieustalone**. Nie utworzono projektu, nie skonfigurowano sekretów i nie wywołano płatnego AI.

## 2. Izolacja środowisk i konfiguracja

Użyć jednego wskazanego projektu Vercel z osobnymi zakresami Preview/Production i dwóch projektów Supabase, zgodnie z istniejącym walidatorem `src/lib/supabase/config.ts`. Preview zawiera wyłącznie syntetyczne dane. Nie kopiować produkcyjnych użytkowników/plików do preview.

W każdym zakresie Vercel ustawić osobno:

- `APP_ENV=preview` lub `production` zgodnie z `VERCEL_ENV`; nie ustawiać ręcznie systemowego `VERCEL_ENV`.
- `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` właściwego projektu. To jedyne publiczne dane dostępu; lokalny fallback anon nie jest kluczem administracyjnym.
- `SUPABASE_EXPECTED_PROJECT_REF`: ref bieżącego środowiska. `SUPABASE_PRODUCTION_PROJECT_REF`: ref produkcyjny w obu zakresach. Preview musi się od niego różnić; production musi być równe.
- `SUPABASE_SERVICE_ROLE_KEY`: serwerowy klucz **tego samego projektu**, potrzebny istniejącemu serwerowi importu i cleanup. Nigdy w `NEXT_PUBLIC_*`, przeglądarce lub logu. Weryfikować zgodność przez kontrolowany odczyt właściwych bucketów, bez drukowania klucza. Nie używać tokenu Management API ani hasła PostgreSQL zamiast tego klucza.
- `CRON_SECRET`: różny w obu środowiskach, losowy, minimum 32 bajty losowości, bez zapisywania wartości w raporcie.
- Początkowo `OPENAI_IMPORT_ENABLED=false`, `OPENAI_VOICE_ENABLED=false`; obydwa budżety `0`, bez `OPENAI_API_KEY`. Nie kopiować lokalnego `.env`. Ręczny dziennik musi działać, a płatne ścieżki odmawiać bez kosztu.

Publiczne zmienne Next trafiają do builda: po zmianie środowiska budować ponownie. Nie promować gotowego builda preview z refem preview do produkcji. Dla produkcji wykonać nowy build z zakresem Production. W Vercel wybrać Next.js, Node 24.x, `npm ci`, `npm run build`, domyślne wyjście Next oraz Fluid Compute. Node 24 nie był uruchamiany w tej sesji; czysty pakiet sprawdzono na Node 26.4.0. Wybrać dostępny region funkcji blisko uzgodnionego Supabase. Sprawdzić rzeczywiste ustawienia i `maxDuration=150` importu oraz 60 s głosu; limity dokumentacji nie dowodzą konfiguracji konta. [Czas funkcji Vercel](https://vercel.com/docs/functions/configuring-functions/duration).

## 3. Manifest i bezpieczna wysyłka

Aktualizacja T11-G1: użytkownik utworzył publiczne repo `gisupanalizy/training-plan-app` i zlecił pierwszy commit/push. Git zainicjowano na `main`; wynik operacji dokumentuje [handoff Git](handoffs/2026-10-14-T11-G1-pierwszy-commit.md). `.gitignore` chroni prywatne fixtures i `.env*` (oprócz pustego przykładu); `.vercelignore` dopuszcza tylko źródła aplikacji, konfiguracje builda i skrypt odtworzenia workera. Wyklucza całe docs/fixtures/supabase, testy, lokalne wyniki i sekrety. Reguły Vercel nie zastępują reguł Git: przy przyszłym repo trzeba sprawdzić także indeks i historię, ponieważ ignore nie usuwa wcześniej śledzonych plików. [Zasady `.vercelignore`](https://vercel.com/docs/deployments/vercel-ignore).

```sh
node scripts/prepare-t11-deploy.mjs --stage
```

Polecenie tworzy nowy katalog tymczasowy i [lokalny manifest SHA-256](reports/2026-10-14-T11-release.json): 94 pliki oraz osobny wykaz 20 migracji. Zwraca dokładną ścieżkę kopii. Nie czyta `.env`, nie kopiuje fixtures, nie wysyła danych; odrzuca dowiązania, zagnieżdżone `.env`, pliki kluczy i rozpoznane formaty sekretów. Kontrola formatów nie jest pełnym skanerem sekretów. Migracje są w wykazie, **nie w paczce Vercel**. Worker PDF.js odtwarza prebuild z zablokowanej wersji zależności.

Zalogowane CLI należy powiązać z **istniejącym, wskazanym** projektem w kopii tymczasowej. Nie uruchamiać deploy z katalogu roboczego zawierającego prywatne pliki. Po powiązaniu, z wnętrza kopii:

```sh
vercel deploy --dry --format=json
```

Sprawdzić pełną listę plików dostawcy, ich skróty/rozmiary, wykryty Next.js i brak prywatnych ścieżek. Zapisać wynik poza paczką, porównać ze źródłowym manifestem; różnice domyślnych wykluczeń i pliki wygenerowane podczas builda wyjaśnić przed uploadem. Po lokalnym buildzie `.next`, node_modules i worker nie należą do uploadu źródeł. Każda zmiana źródeł wymaga nowej kopii, manifestu i kontroli. Obecnie **manifest Vercel niewykonany z braku poświadczeń**; lokalny manifest nie jest dowodem uploadu. Oficjalny dry-run nie wysyła plików. [Opis Vercel dry-run](https://vercel.com/changelog/dry-run-deployments-with-vercel-cli).

## 4. Migracje i Auth

Zastosować wszystkie 20 plików `supabase/migrations/*.sql` rosnąco, niezależnie w preview, następnie production. Zestaw i skróty w manifeście; ostatni plik `20261014100000_t10_plan_write_boundary.sql` jest obowiązkowy. Nie przenosić lokalnej bazy, seedów, prób AI ani prywatnych danych. `supabase/config.toml` opisuje lokalny stack i **nie konfiguruje automatycznie hostowanego Auth/SMTP**.

W źródłowym projekcie, po bezpiecznym zalogowaniu do CLI i ustawieniu potwierdzonego refa, operować kolejno na jednym środowisku:

```sh
DO_NOT_TRACK=1 npx supabase link --project-ref "$T11_PROJECT_REF"
DO_NOT_TRACK=1 npx supabase migration list
DO_NOT_TRACK=1 npx supabase db push --linked --dry-run --skip-vault
DO_NOT_TRACK=1 npx supabase db push --linked --skip-vault
DO_NOT_TRACK=1 npx supabase migration list
```

`T11_PROJECT_REF` to wyłącznie wcześniej potwierdzone ID, nie sekret. Hasło przekazać bezpiecznie, bez argumentu CLI/śladu w historii. Każdorazowo porównać powiązanie z zamierzonym środowiskiem. `--skip-vault` zapobiega ubocznemu wysyłaniu konfiguracji Vault; brak `--include-seed`/`--include-roles`. Przy istniejącej bazie najpierw backup i porównanie historii. Nie używać resetu zdalnego, automatycznego `migration repair` ani `--include-all` do maskowania rozbieżności. Częściową awarię rozpoznać po historii; naprawa kompatybilna do przodu. [Migracje Supabase](https://supabase.com/docs/guides/deployment/database-migrations).

Po migracjach odczytać i zapisać dowody: wszystkie tabele prywatne mają RLS, klient nie ma DML do 12 tabel planu/wykonania (D026/T05), funkcje publikacji i komend działają przez sesję właściciela. Buckety `training-private` i `training-imports` muszą mieć `public=false` i poprawne polityki właściciela; sprawdzić ograniczenia MIME/wielkości importu. Rewizje, receipts i snapshoty T06-R1 nie mogą być pominięte. Potwierdzić zgodność historii z **całą** listą 20 migracji, a nie tylko istnienie ostatniej tabeli.

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

Odtworzenie sprawdzić w osobnym, wskazanym projekcie recovery, bez nadpisywania produkcji i bez przenoszenia prywatnej produkcji do zwykłego preview. Zmierzyć RPO/RTO, zgodność liczby rekordów/plików, logowanie A/B, RLS, receipts/retry, wersje i snapshoty. Odtworzone importy, które w międzyczasie wygasły, usunąć przed otwarciem dostępu. Dopiero dowód odtworzenia pozwala opisać backup jako sprawdzony. W tej sesji eksportu i odtworzenia hostowanej bazy nie wykonano.

Rollback aplikacji: zapisać poprzedni działający deployment ID, zakres środowiska, hash źródeł, wersje migracji i ustawienia przed wdrożeniem. Po awarii ograniczyć dostęp/zapisy i wyłączyć płatne ścieżki przez nowe wdrożenie konfiguracji; wybrać wcześniejszy **kompatybilny produkcyjny** build w Vercel, sprawdzić jego stare zmienne/secrets, Auth redirecty i definicję cron. Pierwsze wdrożenie nie ma wcześniejszej wersji — plan awarii to zamknięcie dostępu, naprawa i nowy build. [Rollback Vercel](https://vercel.com/docs/instant-rollback).

Cofnięcie aplikacji nie cofa SQL ani danych. Nie odkręcać migracji T10 i nie przywracać grantów klienta, by uruchomić starszy kod. Preferować kompatybilną poprawkę do przodu. Restore produkcji to osobna operacja awaryjna z uzgodnionym oknem i utratą zapisów od backupu; bez testera pracującego równocześnie. Po rollbacku ponowić smoke A/B/anon i sprawdzić rzeczywisty scheduler.

## 8. Sekwencja wdrożenia i odbiór

1. Potwierdzić cele/dostęp/koszty i SMTP; wykonać preflight środowisk, manifest, backup i migracje preview.
2. Skonfigurować Preview, ustawić stabilny URL/Auth i dostęp testera przez ewentualną ochronę Vercel. Wdrożyć sprawdzoną kopię; odczekać terminalny status Ready i rzeczywisty udany build. URL z samego CLI przed zakończeniem nie jest wynikiem odbioru.
3. Przejść niżej opisany smoke preview. Rozwiązać ograniczenia transportu/retencji i ewentualne błędy; nie włączać AI bez nowej zgody/budżetu. Bez AI sprawdzenia AI mają status niewykonane, nie passed.
4. Oddzielnie backup/migracje production, zakres Production, nowy build tego samego zestawu źródeł. Przed udostępnieniem potwierdzić HTTPS, Auth, cleanup i smoke dwóch kont na **produkcyjnym** URL. Nie wystarczy wynik preview.
5. Dopiero po sukcesie podać użytkownikowi zweryfikowany adres i ograniczenia, deployment ID/hash oraz instrukcję. T11 done dopiero po spełnieniu całego uzgodnionego odbioru. Przekazać T10-R1 użytkownikowi; szersza beta czeka na jego wynik. Nie wysyłać zaproszeń innym osobom bez ich jawnego zlecenia.

Smoke wykonuje operator na dwóch własnych kontach syntetycznych A/B i anonimowym kontekście, przez realne HTTPS, UI i Auth/API/Storage. W raporcie zapisać datę, środowisko/refy, deployment ID, hash, narzędzie/przeglądarkę, każdy wynik i sprzątnięte ID. Haseł/cookies/nagrań nie zapisywać.

- HTTPS bez błędów certyfikatu; strona wymaga loginu, API anon daje JSON 401/no-store; błędne wejście daje 400 bez zapisu. `/auth/confirm` i ustawienie hasła działają z zaproszeniem, sesja po odświeżeniu jest poprawna, logout blokuje dostęp.
- A publikuje ręczny plan, dodaje 1RM 120 kg i startuje przy 75% → 90 kg; bez maksimum cel kg pusty. Zapisuje serię, zero bez kg, pominięcie, dodatkową serię/ćwiczenie i komentarz; kończy, ponownie loguje się i sprawdza historię/postęp.
- Utrata odpowiedzi po zapisie → retry z tym samym ID/payloadem nie duplikuje. Osobna stara rewizja daje konflikt. Nowa wersja planu i 1RM nie zmienia starych celów.
- B i anon nie odczytują/zmieniają planu, treningu, dziecka ani źródła A; próby wskazania cudzego rodzica/ćwiczenia i bezpośredniego DML są odrzucone. Sprawdzić także B → A, listing/download/public i podpisane URL Storage oraz odrzucony upload poza własną ścieżką.
- Import na własnym syntetycznym tekście/PDF/XLSX/obrazie: upload, korekta/reload, trzy kroki, braki, jawna publikacja i retry, anulowanie. Głos: propozycja i cel/revizja, odmowa mikrofonu, anulowanie i spóźniony wynik bez samoczynnego zapisu. To żądania płatne tylko po osobnym zleceniu/budżecie; nie wstawiać do produkcji mockowej furtki.
- Bez włączenia AI potwierdzić odmowę bez kosztu oraz cały ręczny trening. Duże audio/XLSX, awarie, limity budżetów, cleanup i próbę recovery udokumentować oddzielnie. CLI lokalne i mocki nie zastępują tych wyników.

W tej sesji wszystkie kroki zdalnego odbioru są **niewykonane**. Nie ma działającego linku do podania, wyniku telefonu/Safari ani zgody na szerszą betę.

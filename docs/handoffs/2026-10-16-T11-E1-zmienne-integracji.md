# Handoff — T11-E1 — zmienne integracji Supabase

- Data/autor: 2026-10-16, Codex. Bez innych agentów.
- Zadanie/status: T11-E1 review, kod i lokalna weryfikacja gotowe; trwałe usunięcie trzech ręcznych duplikatów Vercel czeka na potwierdzenie w pytaniu asynchronicznym. T11 in_progress, T10-R1 nadal todo użytkownika.
- Git: main, baza d30025c; kod i dokumentacja wysłane w commicie 82b9eb7. SHA końcowego uzupełnienia dokumentacji odczytać z git log — handoff jest częścią tego uzupełnienia. Nie zmieniano globalnego autora ani remote.
- Poprzednie handoffy: [T11-G1](2026-10-14-T11-G1-pierwszy-commit.md), [T11](2026-10-14-T11-przygotowanie-wdrozenia.md).

## Cel i wykonana praca

Użytkownik utworzył i podłączył integrację Supabase przez Vercel, po czym jawnie zlecił zmianę kodu na automatyczne nazwy oraz uporządkowanie duplikatów i ręcznych parametrów. Zmieniono konfigurację aplikacji, bez migracji, zmian domeny/RLS i płatnego AI. Cała rodzina STORAGE ma pierwszeństwo; niepełna para nie jest uzupełniana innym źródłem. Serwer wybiera secret lub legacy service_role tej samej rodziny. Lokalne nazwy są zachowane jako alternatywa, nie równoległe wymagane wpisy.

Dostęp: konektor Vercel w katalogu integracji nie jest zainstalowany, CLI nie ma tokenu ani powiązania. Jednak dostępna karta Chrome pozwoliła bezpośrednio potwierdzić Vercel gisupanalizy-gmailcoms-projects/training-plan-app i produkcyjny Supabase supabase-violet-cable, ref kwmyosnerwvtwxtszzka (z adresu istniejącej karty Supabase). To aktualizuje historyczny bloker braku celu/dostępu. Preview nie ma wskazanego projektu, hosted schema/Auth/SMTP/HTTPS nie mają odbioru.

## Faktyczne zmiany w Vercel

Przez istniejącą zalogowaną kartę Chrome zapisano APP_ENV=production; oba SUPABASE_EXPECTED_PROJECT_REF i SUPABASE_PRODUCTION_PROJECT_REF ustawiono na ref produkcji; OPENAI_IMPORT_ENABLED i OPENAI_VOICE_ENABLED=false, oba budżety=0. Siedem jawnych ustawień zapisano w istniejących wpisach Secret, ograniczając zakres do Production. CRON_SECRET ograniczono do Production bez zmiany jego wartości i bez jej odczytu. Nie tworzono/rotowano kluczy w Supabase. Osiem nazw z zakresem Production potwierdzono odrębnym odczytem UI po zapisie.

Wpisy integracji, w tym nieużywane przez aplikację STORAGE_POSTGRES_* i STORAGE_SUPABASE_JWT_SECRET, pozostają bez zmian. Nadal istnieją ręczne NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY i SUPABASE_SERVICE_ROLE_KEY. Ich trwałe usunięcie przygotowano, ale nie wykonano przed potwierdzeniem wymaganym przez zasady sterowania przeglądarką. Pytanie dokładnie wymienia te trzy nazwy; nie dotyczy automatycznych wpisów. Nie uznawać ogólnego historycznego zlecenia za odpowiedź na to pytanie ani ponownie nie prosić po jednoznacznym potwierdzeniu człowieka.

CRON_SECRET pozostaje niewidoczny: nie można dowieść losowości ani wykluczyć wcześniej wpisanego placeholdera. W razie potrzeby rzeczywisty sekret użytkownik wprowadza w Vercel bez przesyłania przez chat. Nie klikano Redeploy; push kodu może uruchomić automatyczny build integracji Git, którego stan wymaga osobnej kontroli. Nie podano linku aplikacji jako działającego wdrożenia.

## Zmienione pliki

- [config.ts](../../src/lib/supabase/config.ts): kompletna publiczna rodzina STORAGE przed standardową, trim/puste wartości, nadal izolacja środowisk i odmowa publicznego sekretu.
- [admin.ts](../../src/lib/supabase/admin.ts): osobny moduł serwerowego klienta, secret przed legacy service_role; bez fallbacku do drugiej rodziny. [Serwer importu](../../src/lib/imports/server.ts) używa nowej fabryki, eksport adminClient zachowany dla głosu/cleanup.
- config.test.ts i admin.test.ts: wybór źródła, konflikty/niepełność, fallbacki, granice kluczy i zgodność lokalna. Mock SDK tylko w admin.test; prawdziwe integracje osobno.
- .env.example: nazwy automatyczne oddzielone od lokalnych i ręcznych. .gitignore: dodano /env.vercel; istniejący prywatny plik nie został zmieniony, wypisany ani skasowany.
- prepare/verify-t11: nowy kandydat [manifest 2026-10-16](../reports/2026-10-16-T11-E1-release.json), 95 plików i 20 migracji; historyczny raport 14 października zachowany.
- README, ARCHITECTURE, T03_AUTH, T11_DEPLOYMENT, DECISIONS D028, TESTING, ROADMAP, STATUS, CHANGELOG i ten handoff: aktualne reguły, cele i granice.

## Weryfikacja

macOS, Node 26.4.0, Next 16.4.0, Supabase CLI 2.120.0. Aktualne oficjalne dokumenty Marketplace/API keys/Vercel env sprawdzono 2026-10-16; odnośniki w T11_DEPLOYMENT/D028. Nie zmieniono wersji dostawców ani zależności.

- `npx vitest run src/lib/supabase/config.test.ts src/lib/supabase/admin.test.ts`: 20 passed.
- `OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false npm test`: 171 passed/9 skipped, 23 pliki passed/5 skipped. Brak rzeczywistych płatnych wywołań.
- Produkcyjny build, potem typecheck z APP_ENV/VERCEL_ENV=production, syntetycznymi publicznymi STORAGE i sztucznym serwerowym sekretem, pustymi dawnymi URL/key/sekretami oraz AI=false: sukces. .env istnieje, ale te pola nadpisano w środowisku procesu. Nie był to rzeczywisty hosted projekt. Kontrola .next/static nie znalazła serwerowych nazw kluczy ani sztucznego sekretu.
- `DO_NOT_TRACK=1 OPENAI_API_KEY='' OPENAI_IMPORT_ENABLED=false OPENAI_VOICE_ENABLED=false RUN_T06_LIVE=false RUN_T09_LIVE=false npm run test:t06:http`: sukces, rzeczywiste lokalne Auth/PostgREST/Storage i produkcyjny Next na 3006, szkic AI mock. A/B/anon, źródła, korekta/reload, podpisany upload, formaty, pytania, zatwierdzenie/retry i cleanup przeszły. Stare standardowe nazwy działają nadal.
- Ten sam runner powtórzono z lokalnymi kluczami z supabase status przekazanymi **wyłącznie w pamięci procesu** pod NEXT_PUBLIC_STORAGE_SUPABASE_URL, NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY i STORAGE_SUPABASE_SERVICE_ROLE_KEY; STORAGE_SUPABASE_SECRET_KEY pusty, AI wyłączone. Sukces: rzeczywista nowa rodzina integracji i legacy fallback przechodzą cały lokalny HTTP. Nie testowano prawdziwego sb_secret konta hostowanego.
- `node scripts/prepare-t11-deploy.mjs --stage`, `node scripts/verify-t11-package.mjs`: sukces, 95 plików, 20 migracji, hashe i odmowa prywatnych ścieżek/dowiązania/formatu sekretu. `git diff --check` przeszedł; env.vercel, .env i prywatne fixtures są ignorowane.
- UI Vercel: osiem ręcznych nazw odczytano oddzielnymi wyszukaniami i potwierdzono wyłącznie zakres Production. Wartości kluczy pozostawały ukryte. Dla jawnych wartości dowodem jest wprowadzenie i zapis z komunikatem sukcesu; dla CRON_SECRET tylko zachowanie istniejącej wartości i zmiana zakresu.

Błędy/ograniczenia przebiegu: początkowo próba Add dla sześciu ustawień została odrzucona, bo wpisy istniały poza widoczną pierwszą częścią listy. Formularz odrzucono bez zapisu; istniejące wpisy wyszukano i poprawiono przez Edit. Jedna próba wyszukania searchbox po nazwie nie znalazła pola przy otwartym dialogu Discard Changes; po odrzuceniu użyto właściwej wyszukiwarki. Próba Add nie zapisała żadnych danych. CLI status raportował opcjonalne imgproxy/pooler jako zatrzymane i dostępną aktualizację; nie aktualizowano CLI ani nie resetowano bazy. Skan formatów sekretów początkowo błędnie rozpoznał końcówkę polskiego sluga linku README jako sk-. Polecenie powłoki mimo statusu skanera kontynuowało commit/push; sprawdzono to i powtórzono skan z granicą tokenu dla wszystkich 250 śledzonych plików oraz porównanie z lokalnymi sekretami — zero trafień, bez publikacji wartości w logu. Nie uznano nieudanego pierwszego skanu za sukces. Żaden krok nie zastąpił hosted smoke lub testu urządzeń.

Nie wykonano hostowanych migracji/restore, zdalnego Auth/Storage/smoke A/B/anon, telefonu/Safari, obciążenia, płatnego AI ani pracy agentów. Nie weryfikowano wartości automatycznych kluczy (są Secret). Nie należy oznaczać T11 done na podstawie testów lokalnych.

## Decyzje i zmiany planu

D028 wprowadza autokonfigurację STORAGE z zachowaniem granic T03. Wydzielono T11-E1 w ramach istniejącego T11, bez zmiany produktu. T11 in_progress zamiast historycznego blocked, bo produkcyjny cel i dostęp przez przeglądarkę istnieją. T11-E1 review do zakończenia cleanup; kod lokalny odebrany, stan repo publikowany osobno przez git. T10-R1 pozostaje todo użytkownika po udanym T11.

## Pozostała praca i blokery

Odpowiedź użytkownika na pytanie o trwałe usunięcie trzech ręcznych duplikatów — tylko ten krok cleanup jest wstrzymany. Po potwierdzeniu można usunąć dokładnie trzy wpisy bez STORAGE, sprawdzić wynik i zaktualizować dokumenty. Przed jakimkolwiek uznaniem hostingu za gotowy sprawdzić aktualny commit/deployment i migracje, Auth/SMTP, backup/retencję, transport audio oraz preview. Brak drugiego projektu preview jest odrębnym niedokończonym elementem T11.

## Następny krok

Najpierw dokończyć T11-E1 po odpowiedzi człowieka; nie ponawiać pytań o już potwierdzoną operację. Następnie T11 według procedury, od migracji i kontroli Auth, bez samoczynnego rozpoczynania T10-R1/T12.

## Stan środowiska

Nie wprowadzano zdalnych danych treningowych. Dwa lokalne runnery zakończyły własny serwer 3006; lokalny Supabase nie był resetowany/zatrzymywany. Nowa kopia źródeł w katalogu wskazanym przez manifest, poprzednie kopie i prywatne dane nietknięte. Zrzut bez wartości sekretów: /private/tmp/t11-e1-vercel-duplicate.jpg. Karta Vercel zachowana do dalszego cleanup. Prompt: /private/tmp/t11-e1-next-prompt.txt. Nie przejmowano innych kart poza odczytem ich metadanych przy wyborze właściwego projektu.

## Prompt dla kolejnego agenta

Rekomendacja: **gpt-6.1-sol, high** — integracje przy niższym koszcie niż Astra.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T11-E1/T11 od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-16-T11-E1-zmienne-integracji.md, docs/T11_DEPLOYMENT.md, T03_AUTH, DECISIONS, TESTING i WORKFLOW. Kod czyta automatyczną rodzinę STORAGE zamiast ręcznych kopii; osiem ustawień aplikacji w Vercel ograniczono do Production. Trzy ręczne duplikaty czekają na wymagane przy operacji potwierdzenie usunięcia; sprawdź najnowszą odpowiedź użytkownika i stan UI. Vercel: gisupanalizy-gmailcoms-projects/training-plan-app; produkcyjny Supabase: kwmyosnerwvtwxtszzka. Nie ujawniaj sekretów, nie rotuj CRON_SECRET; jego wartość nie jest zweryfikowana. Przed odbiorem wykonaj migracje, Auth/SMTP, osobny preview, kontrolę kosztów/retencji/backup i rzeczywisty HTTPS smoke A/B/anon. Nie deklaruj samego builda jako wdrożenia ani telefonu/Safari jako sprawdzonych. Bez agentów, płatnego AI i publikacji .env/env.vercel/fixtures/t06/real. Zaktualizuj dokumentację, handoff i identyczny prompt. Model: gpt-6.1-sol, high — integracje przy niższym koszcie niż Astra.
```

# Handoff — T03 — konta testerów i prywatność

- Data i autor: 2026-10-11, Codex.
- Zadanie / status po sesji: T03, `done`. T04 nie rozpoczęto.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git; brak brancha, commita i pusha.
- Powiązany wcześniejszy handoff: [T02 — schemat domeny](2026-10-11-T02-schemat-domeny.md).

## Cel i wykonana praca

Dodano połączenie aplikacji z Supabase Auth oparte na cookies, logowanie i wylogowanie kont dodanych przez administratora, potwierdzenie zaproszenia oraz ustawienie hasła. Proxy Next.js weryfikuje JWT przez `getClaims()` i przekierowuje anon lub nieważną sesję na logowanie. Lokalna konfiguracja Auth wyłącza publiczną rejestrację i anonimowe logowanie. Profile powstają po potwierdzeniu zaproszenia albo pierwszym logowaniu, z ID zweryfikowanego użytkownika, nie z danych formularza.

Migracja T03 tworzy prywatny bucket `training-private`. Polityki `storage.objects` wymagają zgodności właściciela rekordu i pierwszego segmentu ścieżki z `auth.uid()` dla odczytu, zapisu, zmiany i usunięcia. Konfiguracja aplikacji wymusza osobne referencje projektów preview/production, zgodność z `VERCEL_ENV`, lokalny URL dla `local` i odrzuca klucz administracyjny w zmiennej publicznej. Nie ma klucza administracyjnego w kodzie aplikacji.

Prawdziwy lokalny test Supabase potwierdził rozdzielenie planów, wyników i plików kont A/B, odmowę dostępu anonimowego, odrzucenie cudzych identyfikatorów rodziców, zaproszenie i wylogowanie oraz przekierowanie dla wygasłego JWT z nieważnym tokenem odświeżania. Wyniki treningów były syntetycznymi fixture'ami dodanymi z uprawnieniem administracyjnym wyłącznie na czas testu; bezpośredni zapis roli `authenticated` pozostaje zamknięty do T05. Ekrany planu i treningu nadal pokazują dane demonstracyjne T01.

## Zmienione pliki

- [Konfiguracja lokalna Supabase](../../supabase/config.toml), [szablon zaproszenia](../../supabase/templates/invite.html), [migracja prywatnego Storage](../../supabase/migrations/20261011170000_t03_private_storage.sql) — Auth tylko dla zaproszonych i polityki plików.
- [Konfiguracja środowisk](../../src/lib/supabase/config.ts), [klient serwera](../../src/lib/supabase/server.ts), [proxy sesji](../../src/lib/supabase/proxy.ts), [wejście proxy](../../src/proxy.ts), [tworzenie profilu](../../src/lib/supabase/profile.ts) — połączenie z Auth i kontrola dostępu.
- [Logowanie](../../src/app/logowanie/page.tsx), [akcje Auth](../../src/app/logowanie/actions.ts), [potwierdzenie zaproszenia](../../src/app/auth/confirm/route.ts), [ustawienie hasła](../../src/app/ustaw-haslo/page.tsx), [akcja hasła](../../src/app/ustaw-haslo/actions.ts), [profil](../../src/app/profil/page.tsx), [style](../../src/app/globals.css) — interfejs testera.
- [Test API/Storage](../../scripts/test-t03-api.mjs), [uruchomienie testu](../../scripts/run-local-t03.mjs), [test sesji](../../src/lib/supabase/proxy.integration.test.ts), [test konfiguracji](../../src/lib/supabase/config.test.ts), [skrypty npm](../../package.json), [lockfile](../../package-lock.json) — odtwarzalne sprawdzenia.
- [Instrukcja T03](../T03_AUTH.md), [README](../../README.md), [ARCHITECTURE](../ARCHITECTURE.md), [DATA_MODEL](../DATA_MODEL.md), [TESTING](../TESTING.md), [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [CHANGELOG](../CHANGELOG.md), [DECISIONS](../DECISIONS.md), [.env.example](../../.env.example), [.gitignore](../../.gitignore) — rzeczywisty stan i bezpieczna konfiguracja.

## Weryfikacja

Środowisko: macOS, Node.js 26.4.0, npm 11.17.0, Docker 29.6.1, Supabase CLI 2.120.0, lokalny Supabase PostgreSQL 17 z Auth, PostgREST, Storage i Mailpit. `npx supabase start` zastosowało migracje T02 i T03. `npm run test:t03:local` przeszło: utworzono syntetyczne konta A/B, zalogowano je przez Auth, sprawdzono własne i cudze plany oraz wyniki przez PostgREST; anon nie uzyskał odczytu. Próby A z cudzym `owner_id`, `plan_id`, `plan_version_id` i `exercise_id` zostały odrzucone. Bezpośredni insert treningu z roli `authenticated` został odrzucony. Storage pozwolił na własny upload/download, odmówił cudzych i anonimowych operacji, nie ujawnił obiektu przez publiczny URL, odmówił cudzego linku podpisanego i przeniesienia do cudzego katalogu; cudza próba usunięcia nie usunęła pliku. Mailpit odebrał zaproszenie; potwierdzenie tokenu, ustawienie hasła, wylogowanie i ponowne logowanie przeszły. Dwa testy proxy na prawdziwym lokalnym Auth sprawdziły anon oraz wygasły podpisany JWT z nieważnym refresh tokenem; oba przekierowały do logowania. Konta i pliki fixture'ów usunięto w teście.

Końcowe `npm run typecheck`: przeszło. `npm test`: 3 pliki i 14 testów przeszło; 2 testy integracyjne pominięte bez lokalnych zmiennych i uruchomione osobno przez `npm run test:t03:local`, gdzie przeszły. `npm run build`: przeszło. `bash scripts/test-db.sh`: pierwsza próba zakończyła się przejściowym brakiem gniazda PostgreSQL podczas startu kontenera; ponowienie przeszło z wynikiem `T02 database assertions passed`. Początkowa próba integracyjna wykazała, że `auth.email.enable_signup=false` wyłącza logowanie e-mailem; ustawiono `true` przy `auth.enable_signup=false` i końcowy test przeszedł. Przy pobieraniu pierwszych obrazów Supabase rejestr ECR zgłaszał timeouty; obrazy Auth/Storage pobrano także z oficjalnego Docker Hub, po czym stack ruszył. Nie wykonano ręcznego testu UI na urządzeniu ani testu hostowanych projektów Supabase/Vercel. Nie ma dowodu działania faktycznych ustawień preview/production poza testami lokalnej kontroli konfiguracji.

## Decyzje i zmiany planu

[D010](../DECISIONS.md) przyjmuje lokalny Auth/Storage, strukturę sesji i granice środowisk. D004 nadal nie zatwierdza hostingu Vercel ani OpenAI. T03 przeszło `todo → in_progress → done`; zależności i identyfikatory T04–T12 bez zmian. [CHANGELOG](../CHANGELOG.md) podaje powód. [T03_AUTH](../T03_AUTH.md) opisuje wymagane ustawienia usług hostowanych bez sekretów.

## Pozostała praca i blokery

Brak blokera odbioru lokalnego T03. Nie ma hostowanego Supabase ani potwierdzonych ustawień Auth, migracji i redirectów w preview/production; to warunek wdrożenia T11. UI planu i treningu nadal używa syntetycznych danych, więc nie ma ręcznego tworzenia planu ani zapisu wyników. To T04 i T05. Bezpośredni zapis wyników musi pozostać zamknięty do transakcyjnej komendy T05. Test Auth aplikacji na fizycznym urządzeniu nie został wykonany.

## Następny krok

Po osobnym zleceniu rozpocząć T04 od przeczytania ROADMAP, PRODUCT, UX, DATA_MODEL, DECISIONS, TESTING i tego handoffu. Najpierw podłączyć ręczny edytor do prywatnych tabel z sesją użytkownika i istniejącym RLS, zachowując wersje planów i historyczne wartości 1RM. Nie zaczynać T05 w ramach T04.

## Stan środowiska

Lokalny stack Supabase zatrzymano przez `npx supabase stop` z zachowaniem lokalnego backupu. Tymczasowy kontener PostgreSQL skryptu T02 został usunięty. Nie pozostawiono procesów uruchomionych w tej sesji; zastany wcześniej serwer Next.js na porcie 3002 nie był uruchamiany ani zatrzymywany przez T03. Brak `.env` z wartościami i brak sekretów w plikach projektu; `.env.example` zawiera tylko nazwy zmiennych. Katalog nie ma Git.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: `gpt-6-sol`, `high` — wersjonowanie planów, 1RM i własność danych wymagają staranności przy niższym koszcie niż model frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Po osobnym zleceniu zrealizuj wyłącznie T04 — edytor planu i rzeczywiste 1RM. Nie przechodź do T05 i nie uruchamiaj subagentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-11-T03-konta-prywatnosc.md oraz docs/PRODUCT.md, docs/UX.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md, docs/TESTING.md i docs/T03_AUTH.md. T01–T03 są ukończone lokalnie: Auth/API/Storage przechodzą testy A/B/anon, lecz UI planu pozostaje syntetyczne, nie ma hostowanego Supabase ani trwałego zapisu treningu. Dodaj ręczne tworzenie i edycję prywatnego planu A/B z różnymi seriami, rampą, superserią, ćwiczeniami własnymi i notatkami; edycja opublikowanego planu ma tworzyć nową wersję. Dodaj zapis rzeczywistych 1RM z datami oraz poprawne cele procentowe, zaokrąglenia i obsługę braku maksimum bez zgadywania kilogramów. Korzystaj z sesji użytkownika i RLS, zachowaj historyczne wersje i nie zmieniaj istniejących treningów. Kryteria odbioru: ręcznie powstaje prywatny plan A/B z różnymi seriami, edycja tworzy wersję, brak 1RM nie blokuje planu. Wykonaj adekwatne testy edycji, procentów, dat maksimum, zaokrągleń, historii i izolacji właścicieli oraz kontrolę typów i build. Lokalny Supabase CLI/Docker jest dostępny; hostowane środowiska pozostają do T11 i nie blokują pracy lokalnej. Nie zapisuj sekretów ani prywatnych danych w repozytorium. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według potrzeby i utwórz handoff z dokładnymi wynikami oraz identycznym, gotowym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie high — niezmienność wersji, obliczenia 1RM i kontrola właściciela wymagają staranności przy niższym koszcie niż model frontier.
```

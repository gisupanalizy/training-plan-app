# T03 — konta testerów i prywatność

## Stan

Lokalny Supabase Auth, PostgREST i Storage przeszły testy A/B/anon w T03 i ponownie w T10. Aplikacja przy skonfigurowanym Supabase wymaga logowania. T04 dodał prywatny edytor planu i 1RM, a T05 rzeczywisty zapis wykonania/historii. Hosting pozostaje nieodebrany; aktualna procedura i blokery: [T11_DEPLOYMENT](T11_DEPLOYMENT.md).

## Lokalnie

1. Uruchom `npx supabase start` (Docker). Migracje tworzą prywatne tabele i bucket `training-private`.
2. Wynik `npx supabase status` podaje lokalny URL i klucz anon/publishable. Wprowadź je do ignorowanego `.env.local` lub zmiennych procesu jako `APP_ENV=local`, `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (lokalny klucz anon można podać jako `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Nie publikuj wartości.
3. Uruchom `npm run dev`. Konta testowe dodaj przez lokalny panel Auth lub Admin API. W ustawieniach Auth rejestracja publiczna jest wyłączona, a anonimowe logowanie niedostępne. Szablon zaproszenia kieruje na `/auth/confirm`; po potwierdzeniu tester ustawia hasło i może się logować oraz wylogować.
4. Uruchom `npm run test:t03:local`. Skrypt pobiera lokalne klucze z CLI wyłącznie do pamięci, tworzy syntetyczne konta i usuwa je po teście. Wymaga uruchomionego lokalnego stacku wraz z Mailpit.

## Środowiska zdalne

- Przy Marketplace z prefiksem STORAGE aplikacja używa automatycznych `NEXT_PUBLIC_STORAGE_SUPABASE_URL` i `NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY` oraz serwerowego `STORAGE_SUPABASE_SECRET_KEY` (fallback service_role). Nie kopiuj ich do ręcznych duplikatów. Pełna lista i reguły pierwszeństwa w [T11_DEPLOYMENT](T11_DEPLOYMENT.md).
- Ustaw `APP_ENV=preview` albo `production`, URL i **publiczny** klucz właściwego projektu oraz `SUPABASE_EXPECTED_PROJECT_REF` i `SUPABASE_PRODUCTION_PROJECT_REF`. Konfiguracja odrzuca projekt produkcyjny w preview, zły URL, HTTP i klucz administracyjny w zmiennej publicznej. `APP_ENV` musi zgadzać się z `VERCEL_ENV`, jeśli istnieje.
- Preview i produkcja wymagają osobnych projektów Supabase. W obu ustaw wyłączoną publiczną rejestrację i anonimowe logowanie, włączony dostawca e-mail, URL strony oraz dozwolony redirect. Skonfiguruj szablon zaproszenia z `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`. Zaproszenia wysyłaj z panelu Auth lub z zaufanego Admin API tylko po jawnym zleceniu ich wysłania. Klucz administracyjny jest od T06 wymagany wyłącznie na serwerze importu/cleanup, nigdy w kodzie klienta ani zmiennej publicznej. SMTP i faktyczne środowiska wymagają odbioru T11.
- Migracje zastosuj osobno do właściwych projektów. Sam test konfiguracji lokalnej nie dowodzi ustawień hostowanych; ich uruchomienie należy do T11.

## Granica dostępu

- Każdy rekord prywatnej tabeli ma `owner_id` i RLS z T02. Złożone klucze obce odrzucają przypisanie dziecka do cudzego rodzica. Wyniki wolno odczytać właścicielowi, lecz bezpośredni zapis pozostaje zamknięty do komendy T05.
- Bucket `training-private` jest prywatny. Ścieżka obiektu zaczyna się od UUID właściciela, a polityki `select/insert/update/delete` sprawdzają zarówno tę ścieżkę, jak i `owner_id`. Link publiczny nie udostępnia pliku; link podpisany można utworzyć tylko do własnego obiektu.
- Proxy Next.js odświeża i sprawdza JWT przez `getClaims()`. Anonimowy lub nieważny użytkownik trafia na logowanie z komunikatem o sesji. Serwer nie opiera kontroli dostępu na niezweryfikowanym `getSession()` ani na identyfikatorze z przeglądarki.

## Weryfikacja

`npm run test:t03:local` sprawdza zaproszenie w Mailpit, potwierdzenie tokenu, ustawienie hasła, ponowne logowanie i wylogowanie; odczyt własnych i cudzych planów oraz wyników; odrzucenie anonimowego odczytu; próby cudzego `owner_id`, `plan_id`, `plan_version_id` i `exercise_id`; prywatność plików przez upload, download, listę, usuwanie, przenoszenie, link publiczny i podpisany. Dwa testy proxy sprawdzają przekierowanie anon i wygasłego JWT z nieważnym tokenem odświeżania. Wyniki konkretnej sesji są w handoffie T03.

Nie wykonano ręcznego testu interfejsu na urządzeniu ani testu hostowanego Supabase. To nie zastępuje odbioru T10/T11.

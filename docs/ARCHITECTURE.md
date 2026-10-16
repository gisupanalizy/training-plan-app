# Architektura — stan i propozycja

## Składniki

- Next.js + TypeScript: responsywny interfejs oraz API aplikacji, planowane wdrożenie na Vercel.
- Supabase Auth: osobne sesje użytkowników, na start dostęp dla zaproszonych testerów.
- PostgreSQL: plany, wersje, wyniki, maksima, importy i metadane operacji AI.
- Supabase Storage: prywatne pliki źródłowe i krótkotrwałe pliki wejściowe.
- Warstwa AI po stronie serwera: adapter OpenAI do importu, transkrypcji i interpretacji poleceń.
- Logika domenowa niezależna od dostawców: przeliczanie procentów, walidacja, wersjonowanie, zapis wyników.

Next.js/TypeScript istnieje od T01. T02 dodał migrację PostgreSQL z RLS. T03 połączył aplikację z lokalnym Supabase Auth, dodał prywatny Storage i sprawdził RLS przez prawdziwe API. T04 dodał prywatny edytor planu, wersje i rzeczywiste 1RM. T05 dodał transakcyjną funkcję `apply_workout_command` i ręczny ekran wykonania/historii. T06 dodał lokalny import z adapterem OpenAI, uruchamianym dopiero po konfiguracji klucza i budżetu; T07 dodał klienta importu i prywatny podgląd źródła. Przepływ i ograniczenia opisuje [T06_IMPORT](T06_IMPORT.md). Tryb bez Supabase nadal pokazuje dane syntetyczne; Vercel i hostowany Supabase nie są uruchomione.

T08 dodał serwerowy odczyt postępu z sesji zalogowanego użytkownika i `owner_id`, z paginacją oraz agregacją bieżących rekordów wykonania. Brak nowej tabeli, migracji i zapisywanego cache statystyk. Dynamiczna strona `/postep` odczytuje poprawki historii na nowo; obliczenia nie dotykają `one_rep_max_records`.

T09 dodał `/api/voice/transcribe` i `/api/voice/interpret`. Nagranie WebM/MP4 jest ograniczone do 30 s w UI i 5 MB w API; serwer sprawdza sesję, format i sygnaturę. Interpretacja treningu ponownie odczytuje właściciela, rewizję oraz wskazaną serię. Transkrypcja i propozycja nie zapisują danych domenowych. Plan przechodzi przez walidator szkicu T06 i edytor T04. Zatwierdzenie treningu korzysta z `apply_workout_command` T05; dodatkowe ćwiczenie może zawierać serie w tej samej transakcji. Rezerwacja kosztu zapisuje wyłącznie metadane w `voice_attempts`; brak nagrań i transkrypcji w repo/DB/Storage. Brak osobnego budżetu wyłącza płatne żądania głosu.

## Przepływ importu

1. Zalogowany użytkownik tworzy import. Serwer sprawdza limity i przydziela prywatną ścieżkę pliku.
2. Plik trafia bezpośrednio do prywatnego Storage przez ograniczony czasowo upload; duże pliki nie przechodzą jako body funkcji aplikacji.
3. Backend sprawdza własność, sygnaturę typu, rozmiar, liczbę stron PDF i status uploadu. Limity produktu są w T06_IMPORT.
4. Tworzy trwały rekord zadania i uruchamia przetwarzanie przez adapter.
5. Wynik przechodzi walidację strukturalną i domenową; aplikacja zapisuje szkic, nie aktywny plan.
6. Użytkownik przegląda źródło, poprawia braki i zatwierdza wersję planu w transakcji.

T07 zapisuje poprawiony dokument i odpowiedzi w `imports.review_data`, oddzielnie od szkicu AI. Tylko właściciel może pobrać źródło i wznowić korektę; anulowanie czyści te dane. Zapis korekty nie tworzy planu. Powtórzenie zatwierdzenia nadal rozpoznaje funkcja T06.

Stan importu: `uploaded → processing → needs_review → committed`; osobno `failed` i `cancelled`. Ponowienie przetwarzania tworzy numerowaną próbę. Opóźniony wynik anulowanej/starszej próby nie nadpisuje aktualnego szkicu. Powtórzone zatwierdzenie zwraca wcześniej utworzony plan.

T06 implementuje ograniczone żądanie synchroniczne, trwały stan i odzyskiwanie wygasłej dzierżawy. Nie uruchamia pracy po zakończeniu funkcji serverless. Próby 30 s i 2500 tokenów nie wystarczyły dla dużego PDF; obecny adapter dzieli PDF na części po dwie strony, XLSX na bloki tygodni, ma abort po 120 s i limit 16 000 tokenów na odpowiedź. Funkcja ma `maxDuration=150`, a dzierżawa trwa 180 s. Według [dokumentacji Vercel](https://vercel.com/docs/functions/configuring-functions/duration) 150 s mieści się w limicie Fluid Compute; docelowy hosting i czas pod obciążeniem nie były sprawdzone.

## Przepływ zapisu treningu

UI lub interpretator głosu → propozycja komendy → kontrola właściciela i wersji → walidacja domenowa → transakcyjny zapis → odpowiedź z identyfikatorem operacji.

Komendy mają `client_operation_id` i `expected_revision`. Unikalność operacji jest ograniczona do użytkownika; ta sama operacja z innymi danymi jest konfliktem. Ręczne wpisy i głos korzystają z tych samych funkcji domenowych. Model nie wykonuje SQL i nie dostaje uprawnień administracyjnych.

W T05 funkcja SQL blokuje identyfikator operacji i wiersz treningu, porównuje hash pełnej komendy przed rewizją, zapisuje wynik i potwierdzenie w tej samej transakcji. Retry zwraca tę samą odpowiedź; stara rewizja odrębnej operacji kończy się konfliktem. D030/T11-C1 przygotowuje PT409 dla błędów biznesowych zamiast 40001, który na hostingu może zapętlać ponowienia PostgREST; poprawka jest wdrożona po osobnej zgodzie i potwierdzona po HTTPS. Bezpośredni DML do wykonania pozostaje cofnięty roli `authenticated`. Start wykonuje snapshot planu i 1RM według `performed_on`; kolejny odczyt treningu nie przelicza celów.

## Prywatność i niezawodność

- RLS na wszystkich prywatnych tabelach i polityki własności w Storage; testy obejmują także relacje dzieci i próbę powiązania obiektu z cudzym rodzicem.
- Sekret OpenAI tylko na serwerze. Uprawnienia administracyjne Supabase, jeśli konieczne do zadania, ograniczone do konkretnej operacji po kontroli właściciela.
- Dane wejściowe AI są niezaufaną treścią. Instrukcje w PDF, zdjęciu lub transkrypcji nie zmieniają uprawnień ani reguł aplikacji.
- Retencja importu T06: zadanie, szkic, metadane prób i źródło wygasają po 7 dniach; anulowany import jest usuwany w najbliższym sprzątaniu. T09 nie utrwala nagrania ani transkrypcji; `voice_attempts` przechowuje tylko rezerwację kosztu i właściciela. Retencja u dostawcy zależy od jego polityki i ustawień konta.
- Osobno obsłużyć usuwanie kopii w Storage i plików utworzonych u dostawcy AI; politykę dostawcy sprawdzić przed betą. Usunięcie lokalnej kopii nie dowodzi usunięcia wszystkich danych u dostawcy.
- Logi: czas, status, model, wersja promptu/schematu, koszt lub zużycie; bez pełnych nagrań, transkrypcji, PDF i sekretów.
- Limity na użytkownika, wielkość importu, czas audio i liczbę równoległych żądań. Brak limitów kosztowych blokuje udostępnienie AI testerom.

## Konfiguracja i wdrożenie

T03 dodał sprawdzanie powiązania `APP_ENV`, URL i referencji projektu Supabase. D029: bieżący etap ma tylko Production do testów właściciela. Jeżeli preview powróci, nadal wymaga osobnej bazy; obecnie go nie tworzymy. `.env.example` zawiera wyłącznie nazwy zmiennych. [T11_DEPLOYMENT](T11_DEPLOYMENT.md) opisuje przygotowaną procedurę środowisk, migracji, sekretów, backup/odtworzenia, rollbacku i HTTPS; produkcyjny build jest Ready, 21 migracji zastosowano, smoke HTTP dwóch kont przeszedł; pozostały odbiór T11 trwa. Paczka źródeł ma listę dozwolonych plików oraz lokalny manifest, lecz oficjalny dry-run Vercel wymaga zalogowania. Odkryte ograniczenia do zamknięcia: audio 5 MiB wobec 4,5 MB transportu Vercel, SMTP przed zaproszeniami i opróżnianie partii większych niż 50 importów. Nie uznano ich za sprawdzone funkcje hostingu.

## Źródła techniczne

- [Next.js na Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).
- [Supabase Database](https://supabase.com/docs/guides/database/overview) i [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Integracje OpenAI i źródła zweryfikowane 2026-10-11: [AI_AND_VOICE](AI_AND_VOICE.md).

T11-E1 (2026-10-16): źródło konfiguracji publicznej wybierane jako pełna rodzina STORAGE (Marketplace) lub standardowa (lokalna/ręczna). Pierwszeństwo ma integracja, a niepełna para nie jest uzupełniana innym źródłem. Oddzielny `src/lib/supabase/admin.ts` wybiera serwerowy secret/service_role tej samej rodziny; proxy korzysta wyłącznie z publicznej konfiguracji. Izolacja refów i APP_ENV/VERCEL_ENV pozostaje obowiązkowa. Nie jest to zmiana RLS, schematu ani uprawnień modelu.

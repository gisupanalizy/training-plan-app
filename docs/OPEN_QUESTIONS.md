# Otwarte pytania i założenia

Aktualizacja: 2026-10-16. Nie wszystkie pytania blokują rozpoczęcie pracy.

D031: testy właściciela i uruchomienie importu AI mają pierwszeństwo.5USD łącznie na start zatwierdzone, klucz dodany prywatnie do Vercel Production. Auth URL/minimum12 zapisane, cron200 na pustej kolejce. Backup wskazany na Macu poza repo, wykonanie odłożone. Poniższe pełne wymagania operatorskie nie blokują rozpoczęcia własnych testów prototypu. Q04 rozwiązane dla Production przez D029; Q05 SMTP dopiero przed zaproszeniami. Brak potwierdzenia twardego limitu projektu OpenAI; istniejący limit aplikacji to szacunki w24h.

## Potrzebne do konkretnych integracji

- **Q01 — Jev (rozstrzygnięte 2026-10-11):** użytkownik podał linki do TypeSafe AI i Vercel AI Gateway. Integracja `typesafe-ai/jev` pozostaje opcją do porównania w T12; opis i źródła w [AI_AND_VOICE](AI_AND_VOICE.md).
- **Q02 — źródła planów:** przykładowy PDF/zdjęcie od użytkownika ułatwi ocenę. T01–T05 mogą korzystać z syntetycznych planów; T06 powinno objąć reprezentatywne przypadki przed oceną jakości dla testerów.
- **Q03 — budżet:** limit wydatków API i hostingu. Blokuje udostępnienie płatnych integracji bez limitów, nie dokumentację/prototyp.
- **Q04 — dostęp do usług (bloker T11):** użytkownik ma wskazać konto/zespół/projekt Vercel oraz dwa refy Supabase i zapewnić dostęp przez integracje lub zalogowane CLI. Brak poświadczeń potwierdzony lokalnymi próbami; nie odczytano zdalnych list projektów. Nie przesyłać sekretów w dokumentach, handoffach ani chacie.
- **Q05 — SMTP i operacje T11:** dostawca/nadawca zaproszeń, regiony, limit kosztów usług, operator i kanał zgłoszeń/awarii oraz backup/retencja/RPO/RTO wymagają ustalenia. Domyślna poczta Supabase nie wystarcza do zapraszania kolegów spoza zespołu; szczegóły i aktualne źródła w T11_DEPLOYMENT.
- **Q06 — transport głosu T11:** istniejące 5 MiB plus multipart przekracza 4,5 MB Vercel. D032 dopuszcza obecnie krótkie próby głosu właściciela; rozwiązanie pełnego zakresu przed betą: propozycja limitu UI/API z zapasem albo prywatny upload. Nie zmieniono wymagań ani implementacji.
- **Q07 — retencja preview T11 (odłożone przez D029):** bieżący etap ma tylko Production; nie tworzyć preview. Jeśli wróci: produkcyjny cron Vercel nie sprząta projektu Supabase preview. Potrzebny uzgodniony osobny scheduler lub kontrolowany cykl syntetycznych testów z opróżnianiem danych. Backlog ponad 50 importów wymaga powtórzeń i kontroli najstarszego rekordu; brak wdrożonego monitoringu.

## Założenia robocze, które agent może stosować

- Polski interfejs, kg, strefa Europe/Warsaw jako początkowa preferencja, telefon jako urządzenie główne.
- Osobne prywatne konta i dostęp dla zaproszonych testerów. Udostępnianie planów/wyników nie jest domyślne.
- Domyślny krok całkowitego obciążenia 2,5 kg, konfigurowalny; najbliższy krok, przy remisie w dół.
- Dyktowanie przez krótkie nagrania z podglądem i zatwierdzeniem; tryb ciągły po testach.
- Brak zapisywania surowego audio na stałe; proponowane usunięcie po transkrypcji, maksymalnie 24 h po błędzie.
- Wybór modelu po pomiarach, nie na podstawie samej nazwy lub deklaracji marketingowej.

Te założenia nie są potwierdzonymi preferencjami użytkownika. Zmianę zapisz w odpowiedniej specyfikacji i CHANGELOG. Po decyzji D025 telefon/system/przeglądarkę użytkownik poda przy odbiorze T10-R1 po Vercel; nie blokuje to lokalnego T09/T10.

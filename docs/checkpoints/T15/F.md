# Checkpoint T15-F

2026-10-18. Właściciel /root (integrator). Baza6c1cf10, gałąź codex/t15-ui. A bramka przyjęta. F in_progress: profil/logowanie/ustaw-haslo i one-rep-max-editor, nowe account-form i profile/auth CSS. Odczytano prompt F, makietę Profil A/Logowanie C i istniejące akcje Auth. Bez zmian API/Auth usług/DB. Następny krok: prezentacja i stany pending/error formularzy, regresje po uzgodnionym wspólnym buildzie. Testów F jeszcze nie wykonano.

## Przyrost i testy

Przepisano prezentację Profil A/Logowanie C/ustaw-haslo, bez zmian akcji Auth/API/repo. AccountForm pokazuje pending i fokus błędu, OneRepMaxEditor blokuje pola w trakcie zapisu. Datowany ręczny1RM i historia osobne od szacunku. Dwa nowe testy PASS: retry zachowuje operationId, zmiana danych tworzy nowy, błąd odzyskuje formularz/fokus. Build B/E/F i typecheck PASS po poprawce typów testu E; pełna suite234PASS/9skip/2FAIL stare asercje demo B (autor naprawia). Chrome F pierwsza próba FAIL selektor alertu obejmował Next route announcer; zawężony do regionu Logowanie, ponowienie sesja99831. Serwer build B/E/F sesja91561 na3005. Odbiór F jeszcze nieprzyjęty.

Chrome F PASS po naprawie selektora, T04 PASS. I obejrzał screenshot. Bramka F przyjęta, pliki zwolnione; handoff2026-10-18-T15-F-profil-konto.md. Ograniczenia autofill/telefon/Safari jawnie w handoffie.

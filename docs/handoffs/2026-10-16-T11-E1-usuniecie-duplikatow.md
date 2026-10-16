# Handoff — T11-E1 — usunięcie ręcznych duplikatów

- Data i autor: 2026-10-16, Codex. Bez innych agentów.
- Zadanie/status: T11-E1 done; T11 in_progress, T10-R1 todo użytkownika po wdrożeniu.
- Git: main, baza ca4be88; ta sesja zmienia wyłącznie dokumentację. Końcowy commit odczytać z git log.
- Poprzedni [handoff](2026-10-16-T11-E1-zmienne-integracji.md) zawiera implementację i wykonane testy kodu.

## Cel i wykonana praca

Użytkownik odpowiedział: „Tak, usuń trzy ręczne duplikaty”. Na zalogowanej karcie Chrome usunięto z Vercel gisupanalizy-gmailcoms-projects/training-plan-app dokładnie NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY i SUPABASE_SERVICE_ROLE_KEY. Każdy dialog pokazywał właściwą nazwę i zakres Production/Preview. Dla service_role zaznaczono potwierdzenie, że kasowany jest wpis Vercel, a klucz nadal działa u źródła. Nie unieważniano kluczy w Supabase.

## Zmienione pliki

README, docs/STATUS.md, docs/ROADMAP.md, docs/T11_DEPLOYMENT.md, docs/CHANGELOG.md i ten handoff: zakończony cleanup, aktualny stan i następny krok. Historyczny handoff zachowano. Bez zmian kodu, migracji i sekretów.

## Weryfikacja

Vercel potwierdził usunięcie komunikatem sukcesu. Odczyt listy z filtrem SUPABASE pokazał wszystkie zmienne tej rodziny (9 automatycznych STORAGE i dwa ręczne refy); dokładne selektory trzech usuwanych nazw zwróciły po 0. Publiczne URL/publishable i serwerowe secret/service_role integracji pozostają w Production. Nie odczytywano ich wartości. Zrzut dowodowy: /private/tmp/t11-e1-vercel-cleanup.jpg, bez wartości sekretów.

Kontrole lokalne: git diff --check, 71 linków lokalnych i identyczny prompt w handoffie/pliku do odpowiedzi — sukces. `node scripts/verify-t11-package.mjs` potwierdził hashe i reguły wysyłki, bez uploadu. Kod i manifest źródeł bez zmian; nie ponawiano suite/builda (wyniki poprzedniej sesji w handoffie). Bez Redeploy, migracji hostowanych, smoke HTTPS, telefonu/Safari, płatnego AI i innych agentów. Zmienne Vercel dotyczą nowego deploymentu, a usunięcie nie zmienia już działającego builda.

## Decyzje i zmiany planu

Wykonano zaakceptowaną D028 bez nowej decyzji architektury. T11-E1 done, bo zakończono ostatni krok cleanup po wymaganym potwierdzeniu. T11 nadal wymaga osobnego odbioru usług, bez zmiany zależności T10-R1.

## Pozostała praca i blokery

Preview nie ma ustalonego drugiego projektu. Migracje, Auth/SMTP, limity/koszty, cleanup/retencja i odtworzenie nie mają odbioru hostowanego. Wartość i losowość CRON_SECRET pozostają nieweryfikowane; nie zmieniano jej. Stan automatycznego builda Git nie jest potwierdzony. Nie publikować linku jako działającego wdrożenia przed rzeczywistym sukcesem.

## Następny krok

Kontynuować T11 od odczytu bieżącego deploymentu/commitu oraz stanu schematu i Auth w produkcyjnym Supabase według procedury. Nie przywracać ręcznych kopii kluczy.

## Stan środowiska

Nie uruchamiano serwerów ani testów danych, nie zmieniano .env/env.vercel i fixtures. Karta Vercel zachowana jako wynik z filtrem SUPABASE. Zrzut i prompt leżą w /private/tmp; screenshot nie jest publikowany w Git.

## Prompt dla kolejnego agenta

Rekomendacja: **gpt-6.1-sol, high** — integracje przy niższym koszcie niż Astra.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T11 od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-16-T11-E1-usuniecie-duplikatow.md, docs/T11_DEPLOYMENT.md, T03_AUTH, DECISIONS, TESTING i WORKFLOW. T11-E1 done: kod używa automatycznej rodziny STORAGE, trzy ręczne duplikaty usunięto, osiem ustawień aplikacji jest tylko Production. Vercel: gisupanalizy-gmailcoms-projects/training-plan-app; Supabase production: kwmyosnerwvtwxtszzka. Sprawdź deployment/commit, migracje (w tym T10), Auth/SMTP, osobny projekt preview, koszty, cron/retencję i backup/rollback; odbiór to rzeczywisty HTTPS i smoke A/B/anon. Blokery: brak ustalonego preview, niezweryfikowane migracje i wartość CRON_SECRET; sekret wprowadza użytkownik prywatnie, bez rotacji przez agenta. Link dopiero po udanym wdrożeniu; telefon/Safari i szersza beta czekają na T10-R1. Bez agentów, płatnego AI i publikacji .env/env.vercel/fixtures/t06/real; sprawdź manifest i aktualne dokumenty dostawców. Zaktualizuj dokumentację, handoff i identyczny prompt. Model: gpt-6.1-sol, high — integracje przy niższym koszcie niż Astra.
```

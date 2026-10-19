# Handoff — T15-F — Profil i konto

- Data i autor:2026-10-18, /root integrator.
- Status: review, lokalna bramka F przyjęta. Całe T15 nadal w toku.
- Git: codex/t15-ui, baza6c1cf10; commit zakresu F po tym handoffie. B/E pozostają odrębnymi zmianami.
- Poprzednik: [fundament A](2026-10-18-T15-A-fundament.md).

## Wykonano i pliki

Profil A/Logowanie C/ustawienie hasła w Nocy: src/app/profil/page.tsx, logowanie/page.tsx, ustaw-haslo/page.tsx. Nowe src/components/account-form.tsx i account.module.css zapewniają prezentację, pending i fokus błędu. one-rep-max-editor.tsx zachowuje istniejący payload, identyfikator ponowienia i ręczny datowany1RM; blokuje pola podczas zapisu. Historia1RM pozostaje odrębna od estymacji Postępu; strefa konta tylko do odczytu. Bez usług/API/SQL ani zmian akcji Auth.

## Sprawdzenia

- `npx vitest run src/components/one-rep-max-editor.test.tsx`:2PASS, retry i nowy operationId po zmianie, pending/odzyskanie błędu.
- Build lokalny B/E/F z AI off i `npm run typecheck`:PASS. Pierwsze dwie próby FAIL błędny ByRoleOptions w teście E; trzecia po poprawce PASS.
- `DO_NOT_TRACK=1 T15F_PLAYWRIGHT_MODULE=<lokalny moduł Playwright> node scripts/run-local-t05.mjs scripts/test-t15f-browser.mjs`:PASS. Prawdziwy lokalny Supabase/Chrome, syntetyczne konto usunięte po teście. Login błędny/poprawny, fokus, datowany1RM/historia, krok, ustawienie hasła, logout/relogin;360/390/430. Pierwsza próba FAIL zbyt szeroki selektor alertu obejmował Next announcer; zawężony do formularza.
- `DO_NOT_TRACK=1 npm run test:t04:local`:PASS, wersje/historia1RM/izolacja A/B/anon.
- Pełna suite234PASS/9skip/2FAIL stare asercje demo B; autor następnie potwierdził31 własnych testów PASS po naprawie. Ponowienie całej suite pozostaje przy następnej integracji.
- I obejrzał /private/tmp/t15f-profile.png, report w /private/tmp/t15f-browser-report.json. Fizyczny telefon/Safari i systemowy menedżer autofill niewykonane; autocomplete/style nie są dowodem testu rzeczywistego autofill.

## Przekazanie i środowisko

Pliki F zwolnione do I/G. Brak blokera F. Globalne dokumenty STATUS/ROADMAP/TESTING/CHANGELOG/checkpointy zaktualizowane. Serwer3005 sesja91561 to build B/E/F przed ostatnią tabelą B. E ma kolejkę API/Chrome, B zamrożone po31 testach. Nie zatrzymywać E, nie dublować agentów. Bez push/publikacji/płatnego AI.

## Następny krok i prompt kontynuacji

Integrator GPT-6.1 Sol/high; C/E/B/G high, D medium. High dla integracji/kontraktów, medium dla ograniczonej adaptacji D ogranicza koszt bez rutynowego Ultra.

```text
Kontynuuj pełne lokalne T15 A–G w /Users/jakub.olech/GIT/apka-plan-treningowy. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/prompts/T15-ORCHESTRATOR.md, docs/checkpoints/T15/STATE.md i checkpointy etapów oraz handoff2026-10-18-T15-F-profil-konto.md. Sprawdź Git, aktywnych agentów i procesy; nie dubluj wykonywanych zakresów. A/F mają przyjęte lokalne bramki; B/E w toku, C/D/G do wykonania. Maksymalnie dwóch wykonawców, wyłączność plików i jedna kolejka build/API/Chrome. D po B, niezależny G po A–F. Kontynuuj bez osobnych zgód na etapy; zachowaj Noc, Profil A, T13 i kontrakt E. Odbiór: testy/typy/build, rzeczywiste lokalne Auth/API/DB i izolacja,360/390/430, cztery karty, mysz/dotyk/klawiatura/gesty. Telefon/Safari jawnie otwarte jeśli niedostępne. Lokalnie commituj zwolnione zakresy; bez płatnego AI, zdalnych migracji, push/publikacji. Zapisuj faktyczne checkpointy/handoffy i identyczny prompt w odpowiedzi. Model integratora GPT-6.1 Sol/high, wykonawcy zgodnie z planem, bez rutynowego Ultra. Aktualnie brak blokera; najpierw sprawdź wyniki kolejki E i zamrożenie B przed kolejnym buildem.
```

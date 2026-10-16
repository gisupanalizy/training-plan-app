# Handoff — T11 — prototyp, Auth i działające AI

- Data i autor:2026-10-16, Codex; bez innych agentów.
- Status:T11 review, T11-E1/C1 done; prototyp przekazany właścicielowi do testów. Brak automatycznej dalszej pracy.
- Git:main; na wejściu4e4a0aa, kod aplikacji C1 niezmieniony. Commit dokumentacji odczytać z git log.
- Poprzedni [handoff](2026-10-16-T11-produkcja-migracje.md) zawiera migracje21/21 i pełny smoke A/B/anon.

## Cel i wykonana praca

Użytkownik zatwierdził Auth:minimum12, Site URL produkcji i dwa dokładne redirecty, następnie wybrał backup na Macu poza repo. Ustawienia Auth zapisano i ponownie odczytano. DOM redaguje wartość polityki długości hasła; screenshot pokazuje12. URL-e potwierdzone po reload. Konto właściciela i profil istnieją według liczników1/1; agent nie zna jego hasła i nie tworzył tego konta.

Cron Run z panelu zwrócił200 na pustej kolejce23:02:26.822CEST. Wcześniej0eligibleimports/voice i0Storage pozwoliło wykazać bezpieczeństwo po początkowej odmowie auto-review. Nie czytano/rotowano CRON_SECRET. Node i Chrome miały przejściowe problemy transportu, ale curl z normalną walidacjąTLS potwierdził logowanie200/root307/API401; nie zmieniano DNS ani ochrony.

Użytkownik uznał dalszy odbiór za nadmierny dla prototypu i nadał priorytet testom oraz AI (D031), potem poprosił także o głos(D032). Zatwierdził5USD łącznie na start i sam dodał OPENAI_API_KEY jako Secret/Production. Agent sprawdził tylko nazwę i zakres. Włączono istniejący import, a potem głos; szacunki24h import4/głos1. Bez zmian kodu, nowych migracji, usług i zakupów.


## Końcowy wynik prototypu — D031/D032

T11 **review**: aplikacja przekazana właścicielowi do własnych testów. Bez dalszego automatycznego rozwijania infrastruktury. Import i głos są włączone na Production. Nowe wdrożenie głosu `dpl_DEkfN1gE4V3kk558B2SGEmVcyawS` Ready44s, kod4e4a0aa (kod aplikacji zgodny zC1). Wcześniejsze importowe `dpl_HnkRh9V8X3KBy7KEimgdbB54hYXe` Ready52s.

Rzeczywisty import tekstu: pierwsza asercja testu błędnie oczekiwała3surowych obiektów zamiast jednego szablonu i set_count3; HTTP200/needs_review już działało. Po poprawieniu testu: PASS,1dzień/1ćwiczenie/3serie×5/60kg/120s,0pytań, retry bez kolejnego AI. Druga próba1909input/473output tokens, szacunek0,0004274USD wg aktualnej taryfy Luny; pierwszej próby ani całej fazy nie rozliczono dokładnie. W obu próbach cleanup własnego konta bez błędów.

Głos: systemowy say/Zosia wygenerował syntetyczne2,91775s WAV97464B. Hostowana transkrypcja200 (~2,943s), interpretacja5powt./60kg na właściwą serię, brak zapisu przed zatwierdzeniem i kontrolowany zapis po zatwierdzeniu przeszły. Runner zatrzymał dopiero dodatkowy odczyt metadanych voice_attempts przez authenticated (42501); tabela prawidłowo nie jest dostępna klientowi. Nie deklarujemy całego runnera jako PASS i nie powtarzano płatnych wywołań dla tej zbędnej kontroli. Własne konto usunięto,0plików/0błędów cleanup. Bez fizycznego mikrofonu i telefonu.

Obie flagi true, szacunki aplikacji import4/głos1USD w24h;5USD łącznie na start obejmuje obie funkcje. To nie twardy łączny limit rachunku ani zgoda na codzienny nowy budżet. Użytkownik otrzymał instrukcję limitu projektu OpenAI, zapis niepotwierdzony. Krótkie nagrania można testować;5MiB wobec4,5MB Vercel pozostaje ograniczeniem dużych plików przed pełną betą. Stary smoke wymagał503AIoff — nie uruchamiać go bez dostosowania do obecnego stanu.

## Zmienione pliki i sprawdzenia

README, STATUS, ROADMAP, T03_AUTH, T11_DEPLOYMENT, DECISIONS, OPEN_QUESTIONS, TESTER_GUIDE, TESTING, CHANGELOG, ten handoff i [raport](../reports/2026-10-16-T11-production-audit.json). Dawny handoff zachowano jako historię. Manifest C1 i kod niezmienione; verify-t11-package oraz git diff --check przeszły. Sprawdzenia linków/promptu i skan sekretów wykonane przed commitem. Nie powtarzano suite/builda lokalnego; nowe buildy Vercel Ready, prawdziwe AI sprawdzone oddzielnie. Aktualne oficjalne dokumenty OpenAI kluczy/modelu/spend limits/transkrypcji i limitów Vercel sprawdzone przez OpenAI Docs; źródła w procedurze. Brak nowych agentów.

## Ograniczenia i dalszy krok

Właściciel może już testować ręcznie, import i krótkie nagrania po odświeżeniu aplikacji. Telefon/mikrofon/Safari nadal nieodebrane fizycznie; pełny T10-R1 i szersza beta otwarte. Duże audio może dostać413 od Vercel. SMTP tylko przed mailowymi zaproszeniami/resetami, nie blokuje obecnych ręcznych kont. Fizyczne usuwanie wygasłego pliku, monitoring i backup/restore odłożone. Wybrano Mac poza repo, ale wykonano tylko publiczny schema-only dump do tmp; nie powstał szyfrowany backup, klucz w Keychain ani baza recovery. Nie deklarować kopii jako wykonanej. Rollback aplikacji nie cofaSQL; nie cofać do kodu bezPT409. Pełny rachunek fazy i twardy limit5USD OpenAI niepotwierdzone; bez nowych serii płatnych testów lub odnawiania budżetu.

Następny krok agenta dopiero po konkretnym feedbacku właściciela: odtworzyć zgłoszony scenariusz i naprawić błąd bez rozszerzania infrastruktury.

## Stan środowiska

Supabase CLI zalogowane przez użytkownika i linked do produkcji. Lokalny Supabase z21migracjami pozostaje bez zmian; nie resetowano go. Wszystkie własne konta nowych prób usunięte,0plików Storage tych prób. Sekrety tylko w pamięci procesu lub ustawieniach usług, bez odczytu OPENAI_API_KEY/CRON_SECRET. Tymczasowe skrypty /private/tmp/t11-ai-smoke.mjs i t11-voice-smoke.mjs oraz raporty nie zawierają kluczy; syntetyczne WAV/AIFF i screenshoty poza repo. Pierwsze say w sandboxie dało pusty plik, ponowienie z dostępem do systemowej syntezy poprawne2,9s; nie używano mikrofonu. Karta aplikacji i aktualnego Production zachowane jako wynik. Nie uruchomiono monitorowania.

## Prompt dla kolejnego agenta

Rekomendacja:gpt-6.1-sol, high — integracje przy niższym koszcie niż Astra.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T11 tylko od feedbacku właściciela po testach prototypu. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-16-T11-prototyp-auth-ai.md, T11_DEPLOYMENT, T03_AUTH, DECISIONS, TESTING i WORKFLOW. Production https://training-plan-app-seven.vercel.app działa; Supabase kwmyosnerwvtwxtszzka ma21 migracji, smoke A/B/anon i rzeczywiste import AI oraz krótki głos sprawdzone. Auth zapisane, cron200 na pustej kolejce. T11 review, bez automatycznego rozwijania infrastruktury. D031/D032:5USD łącznie na start, bez odnawiania budżetu; limity aplikacji są szacunkami24h, twardy limit OpenAI niepotwierdzony. Duże audio, backup/restore i pełny odbiór odłożone; telefon/Safari i szersza beta wymagają T10-R1. Przy zgłoszeniu napraw konkretny błąd i sprawdź adekwatny scenariusz. Bez agentów, nowych płatnych serii, odczytu/rotacji sekretów i publikacji .env/env.vercel/fixtures/t06/real. Sprawdź manifest i aktualne dokumenty dostawców; zaktualizuj dokumentację, handoff i identyczny prompt. Model: gpt-6.1-sol, high — integracje przy niższym koszcie niż Astra.
```

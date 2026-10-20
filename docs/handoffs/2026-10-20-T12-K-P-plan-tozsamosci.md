# Handoff — T12-K-P — plan wspólnej tożsamości ćwiczeń

- Data i autor: 2026-10-20, Codex.
- Zadanie / status po sesji: T12-K-P **done dokumentacyjnie**; T12-K **todo**, gotowe do zlecenia wdrożenia.
- Branch / commit / stan zmian: `codex/tempo`; w tej sesji bez commitu i push. Drzewo było już zmienione przed sesją (m.in. T16-I i T12-J); nowych zmian nie przypisujemy do tamtych zadań.
- Powiązany wcześniejszy handoff: [T12-J](2026-10-20-T12-J-porownanie-decyzji.md) i [podpięcie ikon](2026-10-20-ikony-png-podpiecie.md). Niniejszy handoff zastępuje prompt dalszej pracy nad samymi parafrazami z T12-J.

## Cel i wykonana praca

Użytkownik przeniósł punkt ciężkości z ikon na rozpoznawanie tej samej tożsamości ćwiczenia w różnych planach, z zachowaniem nazw własnych. Po sprawdzeniu kodu i dokumentacji ustalono zachowanie produktu, zapisano [pełny plan T12-K](../T12_K_TOZSAMOSC_CWICZEN.md), D049, zadania T12-K-P/T12-K i prompt wdrożenia. To **wyłącznie dokumentacja**: nie zaimplementowano ani nie przetestowano nowego kontraktu aplikacji, migracji, limitów plików lub dostawcy.

Wybory użytkownika: obecne formaty źródeł, większe limity typowych planów; istniejące dyktowanie po 30 s wystarcza. Po przypisaniu karta ma standardową nazwę PL i zachowany oryginał. Historia oraz rzeczywisty 1RM łączą się dla tego samego ruchu, a odmienne warianty/sprzęt/chwyt/asysta pozostają osobno. Niepewne dopasowanie wymaga potwierdzenia. OpenAI Decisions proponuje po eksperymencie T12-J; własne nazwy/aliasy są prywatne, a obrazki pochodzą tylko z lokalnych zasobów lub fallbackowej sylwetki.

## Zmienione pliki

- [T12_K_TOZSAMOSC_CWICZEN.md](../T12_K_TOZSAMOSC_CWICZEN.md) — cel, decyzje użytkownika, obecna luka, proponowany kontrakt danych, przetwarzania i odbioru.
- [PRODUCT.md](../PRODUCT.md), [ROADMAP.md](../ROADMAP.md), [STATUS.md](../STATUS.md), [DECISIONS.md](../DECISIONS.md) — wymaganie, zadania/statusy, D049 i punkt wejścia.
- [CHANGELOG.md](../CHANGELOG.md), [README.md](../../README.md) — powód zmiany zakresu i odnośnik dla nowej sesji.
- [T12-K.md](../prompts/T12-K.md) — prompt implementacji; identyczna treść poniżej.
- Ten handoff. Nie zmieniono `src/`, migracji, konfiguracji, danych treningu, snapshotów ani ikon.

## Weryfikacja

Przeczytano README, STATUS, ROADMAP, najnowszy handoff T12-J, T06_IMPORT, EXERCISE_NAMES, DATA_MODEL, DECISIONS, kod importu, edytora, głosu, katalogu, zapisu SQL, ikon i postępu. `git diff --check` — PASS. Sprawdzenie istnienia lokalnych linków nowych dokumentów — PASS. Testów aplikacji, builda, typu, przeglądarki, lokalnej bazy, płatnego API i produkcji nie uruchamiano, ponieważ ta sesja tylko zapisuje plan; nie przedstawiamy ich jako wykonanych.

## Decyzje i zmiany planu

D049 rozdziela potwierdzone przez użytkownika zachowanie produktu od proponowanego schematu. T12-J zostaje zamkniętym eksperymentem; T12-K-P to zakończona dokumentacja, T12-K to przyszłe wdrożenie. Ogólny T12 z głosem na żywo nadal jest odroczony, a D048 i T16-I pozostają bez zmian. Powód wydzielenia: ikona i normalizacja widocznej nazwy nie zapewniają wspólnej historii, gdy import tworzy nowe `exercise_id`.

## Pozostała praca i blokery

Wdrożyć T12-K według planu i testów, nie uznawać dokumentacji za działającą funkcję. Przed live Decisions: serwerowy `AI_GATEWAY_API_KEY`, flaga i jawny dodatni limit kosztu oraz ponowna weryfikacja bieżącej dokumentacji dostawcy. Migracje przetestować lokalnie przed jakąkolwiek publikacją. Test hostowany i wdrożenie wymagają osobnej decyzji. Prywatne źródła, wyniki, klucze i wartości `.env*` nie wchodzą do repo ani handoffu.

## Następny krok

Użytkownik może wkleić poniższy prompt jako nowe zlecenie implementacji T12-K. Agent zaczyna od stanu Git i dokumentów, ustawia właściciela/status `in_progress`, realizuje lokalny zakres, mierzy faktyczne wyniki, po czym przekazuje `review` z handoffem. Nie uruchamiać innych agentów bez jawnego zlecenia.

## Stan środowiska

Nie uruchamiano serwera aplikacji, bazy ani przeglądarki. Nie wykonano wywołania AI ani uploadu. Nowe dokumenty są lokalne i niecommitowane. Zastane modyfikacje innych zadań pozostają w drzewie roboczym. Nazwa potrzebnego później sekretu: `AI_GATEWAY_API_KEY`; wartości nie zapisywano.

## Prompt dla kolejnego agenta

Rekomendowany model i poziom rozumowania: **gpt-6.1-sol, high**. Zmiana obejmuje migrację własności i historii oraz kilka przepływów aplikacji; high ogranicza ryzyko błędu, a sol jest oszczędniejszy od modelu frontier przy pracy implementacyjnej.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj lokalnie zadanie T12-K — wspólna tożsamość ćwiczeń. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-20-T12-K-P-plan-tozsamosci.md, docs/T12_K_TOZSAMOSC_CWICZEN.md, docs/DECISIONS.md (D049, D048), docs/T06_IMPORT.md, docs/EXERCISE_NAMES.md, docs/DATA_MODEL.md, docs/TESTING.md i raport docs/reports/2026-10-20-T12-J-porownanie-jev-decisions.md. Sprawdź stan Git i nie nadpisuj zastanych zmian. Ustaw właściciela i in_progress dla T12-K przed implementacją.

Zaimplementuj uzgodniony kontrakt ze specyfikacji T12-K: prywatna, trwała tożsamość ruchu odrębna od nazwy źródłowej i wyświetlanej; wspólna obsługa importu PDF/XLSX/PNG/JPEG/tekstu, ręcznego edytora i istniejącego dyktowania fragmentów; dokładne zweryfikowane aliasy oraz niepewne propozycje OpenAI Decisions przez Vercel AI Gateway wyłącznie do potwierdzenia; prywatne ćwiczenia/aliasy; standardowa nazwa PL po przypisaniu, oryginał w szczegółach; osobne warianty/sprzęt/chwyt/asysta; wspólna historia i rzeczywisty datowany 1RM tylko dla tej samej tożsamości; ikona z potwierdzonego klucza lub ręcznie wybranego lokalnego pliku, inaczej wbudowana sylwetka. Nie mapuj automatycznie 876 referencji EN ani 787 PNG. Nie zmieniaj historycznych snapshotów, celów treningu lub manifestu CC BY-SA.

Podnieś limity źródeł do PDF 10 MB/20 stron, XLSX 5 MB, PNG/JPEG 10 MB, tekstu 100 KB. Zachowaj prywatny bezpośredni upload do Supabase, użyj podpisanego wznawiania dla plików ponad 6 MB i trwałego, idempotentnego przetwarzania części większego PDF. Walidacja, kontrola właściciela, retry i koszt muszą należeć do aplikacji. Sugestie modelu uruchamiaj tylko po konfiguracji serwerowego AI_GATEWAY_API_KEY, flagi i dodatniego limitu kosztu; bez konfiguracji ręczne tworzenie i korekta muszą działać. Przed integracją sprawdź aktualne dokumentacje Vercel, Supabase i modelu. Nie wykonuj płatnych prób bez jawnie skonfigurowanego limitu ani deploymentu produkcyjnego w tym zadaniu.

Odbiór: testy semantyki PL/EN/parafrazy/none/odmiennych wariantów, A/B/anon, obcego ID, migracji dawnych duplikatów bez zmiany snapshotów, idempotentnej publikacji i 1RM, błędu AI, ręcznego custom, ikon i nowych granic plików/przerwanego uploadu. Uruchom adekwatne testy z TESTING, npm test, npm run typecheck, npm run build oraz faktyczną lokalną przeglądarkę dla importu, edytora, głosu i postępu, jeśli środowisko ją udostępnia. Nie deklaruj niewykonanych sprawdzeń. Zaktualizuj PRODUCT/ROADMAP/STATUS/CHANGELOG/DECISIONS i specyfikację zgodnie z faktycznym wynikiem, ustaw review do odbioru, utwórz handoff według szablonu i identyczny gotowy prompt dalszego kroku. Blokery operatora: klucz AI Gateway i limit kosztu przed live API, migracje oraz osobna decyzja o wdrożeniu/teście hostowanym. Nie uruchamiaj innych agentów bez jawnego zlecenia. Rekomendacja: gpt-6.1-sol, high — wielowarstwowa zmiana danych wymaga uważnej analizy, bez kosztu modelu frontier.
```

# Handoff — T07 — aparat, pliki i korekta importu

- Data i autor: 2026-10-12, Codex.
- Zadanie / status po sesji: T07 / `done` lokalnie. T08 i T09 nie rozpoczęto.
- Branch / commit / stan zmian: katalog nie jest repozytorium Git (`git status` zwraca błąd); brak commita i PR.
- Powiązany wcześniejszy handoff: [T06](2026-10-12-T06-proby-realne-pliki.md).

## Cel i wykonana praca

Dodano polski ekran importu pod `/plany/import`. Wybór obejmuje PDF do 6 stron, XLSX, PNG/JPEG, aparat przez `getUserMedia` i wklejenie tekstu. Plik idzie przez podpisany upload T06, następnie walidację i przetwarzanie. Ekran pokazuje etap pracy, trwałe zadania, ponowienie i anulowanie. Po odświeżeniu można wrócić do zadania przez URL i listę. Dla szkicu jest prywatny podgląd PDF/obrazu/tekstu lub komórek XLSX z adresami, na desktopie obok korekty, na telefonie przez przełącznik. Pierwotne ostrzeżenia, kwestie walidacji i odwołania do źródła pozostają dostępne.

Edytor T04 służy do korekty tygodni, dni, kolejności, ćwiczeń, serii, obciążeń, czasu, dystansu i uwag. Pytania T06 obejmują zamknięty wybór, liczbę i jednostkę z liczbą; jest ich po 10 na stronie dla dużych XLSX. Odpowiedź wypełnia powiązane pole dokumentu, a serwer sprawdza zgodność przy zatwierdzaniu. Korektę można zapisać bez tworzenia planu; odświeżenie przywraca zapisany dokument i odpowiedzi. Niezapisane zmiany sygnalizuje przeglądarka przy zamknięciu. Świadome zatwierdzenie wywołuje istniejącą atomową funkcję T06 z identyfikatorem operacji. Brak danych pozostaje pusty; aplikacja nie tworzy planu w tle.

## Zmienione pliki

- [Ekran](../../src/app/plany/import/page.tsx), [przepływ](../../src/components/import-workspace.tsx), [edytor](../../src/components/plan-editor.tsx), [style](../../src/app/globals.css), [wejście z listy planów](../../src/app/plany/page.tsx) — mobilny wybór, aparat, lista, pytania, korekta i zatwierdzenie.
- [Migracja](../../supabase/migrations/20261012120000_t07_import_review.sql), [API zadania](../../src/app/api/imports/[id]/route.ts), [źródło](../../src/app/api/imports/[id]/source/route.ts), [anulowanie](../../src/app/api/imports/[id]/cancel/route.ts), [typ zadania](../../src/lib/imports/server.ts) — prywatny zapis korekty i podgląd z kontrolą właściciela.
- [Limity](../../src/lib/imports/limits.ts), [walidator](../../src/lib/imports/domain.ts) — współdzielone stałe bez ładowania bibliotek PDF/XLSX do klienta.
- [Test komponentu](../../src/components/import-workspace.test.tsx), [HTTP](../../scripts/test-t06-http.mjs) — wiele pytań, odmowa aparatu, źródło i wznowienie korekty, A/B/anon.
- [ROADMAP](../ROADMAP.md), [STATUS](../STATUS.md), [CHANGELOG](../CHANGELOG.md), [DECISIONS](../DECISIONS.md), [TESTING](../TESTING.md), [UX](../UX.md), [ARCHITECTURE](../ARCHITECTURE.md), [DATA_MODEL](../DATA_MODEL.md), [T06_IMPORT](../T06_IMPORT.md), [README](../../README.md) — stan i kontrakt po T07.

## Weryfikacja

- `DO_NOT_TRACK=1 npx supabase migration up --local`: migracja T07 zastosowana w lokalnym Supabase.
- `npm run typecheck`: sukces. `npm test`: 51 aktywnych testów przeszło, 6 pominięto. `npm run build`: sukces.
- `DO_NOT_TRACK=1 npm run test:t06:local`: 3/3 na lokalnym prawdziwym Auth/PostgREST/Storage A/B/anon.
- `DO_NOT_TRACK=1 npm run test:t06:http`: sukces na produkcyjnym buildzie Next i lokalnym Supabase; podpisany upload PNG/XLSX, tekst, błędny PDF, niewspierany HEIC, prywatny podgląd tekstu/XLSX, zapis i odczyt korekty po odświeżeniu, B/anon, anulowanie, pytania i powtórzone zatwierdzenie. Odpowiedź AI w tym teście była **mockiem**.
- Test komponentu sprawdził 55 pytań stronicowanych po 10, poprawkę liczby serii, zapis dokumentu bez publikacji i **symulowaną** odmowę aparatu. Nie wykonano pełnego klikanego E2E w przeglądarce.
- W T07 nie wywołano prawdziwego OpenAI. Wynik 12/12 syntetycznych źródeł i prywatne próby pochodzą z T06; nie potwierdzają działania ekranu na tych plikach.
- `adb devices` wykrył tylko `emulator-5556`; nie było podłączonego fizycznego urządzenia. `xcrun devicectl` nie jest dostępne. Nie wykonano testu na fizycznym iPhonie/Androidzie ani pełnej ścieżki na emulatorze. Test hostowany pozostaje niewykonany.

## Decyzje i zmiany planu

[D017](../DECISIONS.md) opisuje prywatną, trwałą korektę oddzielną od szkicu AI. T07 przeszedł z `todo` przez `in_progress` na `done` lokalnie. Nie zmieniono identyfikatorów ani zależności innych zadań. Zaktualizowano dokumenty wskazane powyżej. Nie uruchomiono innych agentów.

## Pozostała praca i blokery

Pełnego dotykowego przepływu na fizycznym telefonie, w tym rzeczywistej zgody/odmowy aparatu, nie sprawdzono z powodu braku urządzenia. Nie testowano hostowanych usług. Duży prywatny XLSX z T06 ma niestabilny odczyt i wiele pytań; ekran umożliwia przegląd, ale nie dowodzi jakości rozpoznania ani bezbłędnego zatwierdzenia tego konkretnego pliku. Niezapisane poprawki pozostają tylko w otwartej karcie; przy zamknięciu jest ostrzeżenie. Nie ma sekretów ani prywatnych źródeł w repo.

## Następny krok

Kolejne gotowe zadanie to **T08 — podstawowe monitorowanie postępu**, zależność T05 jest spełniona. Pierwszy krok: przeczytać wskazane niżej pliki, przejąć T08 w ROADMAP i sprawdzić istniejące dane wykonania oraz sposób odczytu historii. Fizyczny odbiór importu należy zachować jako kontrolę T10; T09 jest osobnym zadaniem i nie zostało rozpoczęte.

## Stan środowiska

Migrację zastosowano do lokalnego Supabase; testowe konta i pliki zostały usunięte przez skrypty. Testowy serwer Next został zatrzymany po HTTP. ADB widział emulator Android. Katalog nie ma Git. Nazwy zmiennych dla importu AI: `OPENAI_API_KEY`, `OPENAI_IMPORT_ENABLED`, `OPENAI_IMPORT_BUDGET_USD`; wartości nie są zapisane w repo.

## Prompt dla kolejnego agenta

Rekomendacja: gpt-6-sol, rozumowanie medium — T08 wymaga poprawnych zapytań i reguł domenowych, ale nie integruje nowego dostawcy; to oszczędniejsze niż high/frontier.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Wykonaj wyłącznie T08 — podstawowe monitorowanie postępu; nie rozpoczynaj T09 ani T10 i nie uruchamiaj automatycznie innych agentów. Najpierw przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/handoffs/2026-10-12-T07-ekran-importu.md, docs/PRODUCT.md, docs/UX.md, docs/ARCHITECTURE.md, docs/DATA_MODEL.md, docs/DECISIONS.md, docs/TESTING.md i docs/WORKFLOW.md oraz odpowiednie pliki T05 historii i wykonania. T05 jest ukończone lokalnie, więc zależność T08 jest spełniona. Ustaw właściciela i status in_progress w ROADMAP. Zbuduj prywatny polski widok postępu: historię ćwiczenia z filtrem wariantu i daty, ciężar/powtórzenia, wykonanie planu oraz porównywalną objętość wyliczoną wyłącznie z wykonanych serii. Nie traktuj pominiętej serii jako zera; nie sumuj masy ciała lub asysty jak ciężaru sztangi; estymacja nie może stać się rzeczywistym 1RM. Sprawdź wyniki na znanym zestawie treningów z ręcznie policzonym oczekiwanym wynikiem, odświeżenie statystyk po poprawce historycznej serii, izolację A/B/anon, typy i build. Rozróżnij mocki od prawdziwych lokalnych API i jawnie opisz brak testu urządzeń lub hostingu. Nie zapisuj sekretów ani prywatnych danych. Zaktualizuj ROADMAP, STATUS, CHANGELOG/DECISIONS według wyniku i utwórz handoff z identycznym promptem dla następnego agenta. Rekomendowany model: gpt-6-sol, rozumowanie medium — reguły agregacji i prywatności wymagają uważności przy niższym koszcie niż high/frontier.
```

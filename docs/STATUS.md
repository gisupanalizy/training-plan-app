# Aktualny stan projektu

Aktualizacja: 2026-10-20.

## T12-K-P — plan wspólnej tożsamości ćwiczeń, done dokumentacyjnie

Użytkownik doprecyzował cel ponad same ikony: import planów w obecnych formatach, ręczny plan i dyktowane fragmenty mają rozpoznawać tę samą tożsamość ruchu. Uzgodnił standardową polską nazwę po potwierdzeniu, zachowanie oryginału, wspólną historię i rzeczywisty 1RM tylko dla porównywalnych wariantów, prywatne nazwy własne, potwierdzanie parafraz proponowanych przez OpenAI Decisions oraz obrazki wyłącznie z lokalnych zasobów z sylwetką jako fallbackiem. Limity docelowe: PDF 10 MB/20 stron, XLSX 5 MB, PNG/JPEG 10 MB, tekst 100 KB. [Plan i pełny kontekst](T12_K_TOZSAMOSC_CWICZEN.md), [D049](DECISIONS.md#d049--t12-k-wspólna-tożsamość-ćwiczeń), [handoff](handoffs/2026-10-20-T12-K-P-plan-tozsamosci.md), [prompt wdrożenia](prompts/T12-K.md).

**Stan faktyczny:** T12-K-P zapisuje plan; T12-K jest `todo`. Nie zmieniono aplikacji, bazy, ikon, konfiguracji dostawców ani obecnych limitów 1 MB/6 stron PDF, 1 MB XLSX, 2 MB obrazu i 30 KB tekstu. Brak nowych testów funkcjonalnych i próby hostowanej w tej sesji. T12-J pozostaje wynikiem eksperymentu, a szeroki T12 z głosem na żywo nadal jest odroczony. Następny krok: zlecić T12-K załączonym promptem; przed płatną próbą Decisions zapewnić serwerowy klucz i jawny limit kosztu, bez wklejania sekretu do repo lub czatu.

## T12-J — porównanie Jev i OpenAI Decisions, done eksperymentalnie

Na tych samych 62 nazwach i 51 odpowiedziach przez Vercel AI Gateway Jev uzyskał 56/62, a OpenAI Decisions 59/62 względem wstępnych etykiet. Dla 10 nazw bez bezpiecznego odpowiednika Jev poprawnie odmówił 5 razy, OpenAI 7 razy; oba przypisały błędny ruch w pozostałych przypadkach. 52 nazwy z odpowiednikiem: Jev 51 trafień, OpenAI 52. Powtórzenie 25 trudnych nazw utrzymało te same błędy. Etykiety nie są zatwierdzonym przez użytkownika złotym zbiorem. Wynik modelu może być co najwyżej propozycją w korekcie importu, bez automatycznego wyboru ikony lub dopisywania aliasu. Kod i dane aplikacji bez zmian. [Raport](reports/2026-10-20-T12-J-porownanie-jev-decisions.md), [handoff](handoffs/2026-10-20-T12-J-porownanie-decyzji.md).

Późniejszy plan T12-K-P powyżej zastępuje dawną propozycję następnego kroku w tym zakresie. T12 pozostaje odroczone.

## T16-I — ponowny odbiór, done lokalnie

Niezależny recenzent, inny niż autorzy T16-B–H i poprawki widoczności zapisu, nie zmieniał `src/`. Bramka Tempo jest przyjęta lokalnie. Przy 390×844, po uzupełnieniu celów i „Zostań”, `Zapisz i przejdź dalej` kończy się nad `.mobile-nav`. D046 zostaje: czwarta karta podglądu ma dół 1015,75, a czwarta karta treningu 1195,96875, obie przy nawigacji 768, i obie są doskrolowalne. Jedna paleta, pięć tras, brak propozycji `T16-CONTRACT`. [Raport](reports/2026-10-19-T16-I-tempo-acceptance.md), [handoff](handoffs/2026-10-20-T16-I-ponowny-odbior.md).

Sprawdzenia: `npm test` 274 passed / 9 skipped, `npm run build`, potem `npm run typecheck` — PASS. Chrome i prawdziwe lokalne API na produkcyjnym `next start` `localhost:3018`: T15-A, T15-B z T13-C, import, edytor, T15-D, T15-E przeglądarka i API, T15-F, T13-A, T05, T09 oraz T15-C HTTP — PASS. Głos i szkic modelu to mocki; `process` i interpretacja głosu dostały 503. Telefon, Safari i ponowny odczyt Make niewykonane. Serwer 3018 zatrzymany. Po buildzie `.next` jest produkcyjny; wcześniejszy `next dev` na 3000 może wymagać restartu.

Następny krok: brak kolejnego zadania programu T16. T16-K zostaje niegotowe. Telefon, Safari, T10-R1, T11 i publikacja wymagają osobnego zlecenia.

Poniższa sekcja podpięcia PNG jest wcześniejsza i nie jest tym odbiorem.

## Podpięcie PNG ćwiczeń — done lokalnie

Resolver wskazuje jawny istniejący plik SVG lub PNG dla wszystkich 50 sprawdzonych kluczy `exerciseNames`, w tym nowego bazowego muscle-up. Szerokie dopasowanie każdej nazwy zawierającej „muscle up” usunięto. Uzgodnione przybliżenia dostały osobne PNG, a kółka przyjmują `kółka`, `kółka gimnastyczne` oraz `rings` znalezione w istniejącym planie. „Wejście z kopnięciem i wykrok w tył” pokazuje wybrane `step-up-kick.png`. Użytkownik wybrał dostępne PNG dla wycieraczek i rotacji zewnętrznej mimo opisanych niedokładności pozy. Nieznane nazwy nadal dostają wbudowaną sylwetkę; 790 nazw z części 5 nie jest mapowanych automatycznie. [Handoff](handoffs/2026-10-20-ikony-png-podpiecie.md).

Sprawdzenia: 13/13 testów `exercise-assets` i `ui.test`, pełne `npm test` 274 passed / 9 skipped, `npm run typecheck` PASS. W lokalnym Chrome na `localhost:3000` pięć kart istniejącego planu wskazało właściwe PNG; pliki załadowały się z szerokością 1024 px. Nie sprawdzano w przeglądarce wycieraczek ani wszystkich 50 ćwiczeń. Telefon, Safari, build i T16-I niewykonane.

Następny odrębny krok projektu: niezależny ponowny odbiór T16-I przez agenta innego niż autorzy poprawki; podpięcie ikon nie jest jego odbiorem.

## Ilustracje ćwiczeń — lokalny katalog rozszerzony

Poniższy zapis dokumentuje stan sprzed podpięcia PNG opisanego wyżej.

Resolver nie gasi już rysunku, gdy dokument ma własny sprzęt tej nazwy. Doszły klatki Workout Guide, w tym skos, maszyna nad głowę i uzgodnione przybliżenia z D048. Muscle-up w aplikacji nadal używa podciągania: nowe PNG nie są podpięte. Nauka stania na rękach używa dostarczonego rysunku z przodu, z przezroczystym tłem i białą kreską, poza licencją Workout Guide. Brak rysunku pokazuje ogólną sylwetkę, nie napis „ĆW”. W `public/exercise-assets/` leży 809 PNG 1024×1024 z alfą: `handstand-practice.png` oraz wygenerowane ikony z listy [gemini-ikony-cwiczen.md](design/gemini-ikony-cwiczen.md) (ikona ogólna, punkty 1–20 i 787 nazw z części 5). Nie są w manifeście CC BY-SA. Resolver ich nie podpina. `windshield-wiper.png` ma złą poza. [Handoff](handoffs/2026-10-20-ikony-png-calosc.md).

Sprawdzenia: `npx vitest run src/lib/ui/exercise-assets.test.ts src/components/ui/ui.test.tsx` — 11 testów PASS. `localhost:3000` oddaje nowe SVG. Prywatnego planu w przeglądarce nie klikano. Telefon i Safari niewykonane.

Następny krok w tym zakresie: podpiąć gotowe PNG w resolverze albo poprawić poza wycieraczek. Osobno otwarta zostaje bramka T16-I.

## Subtelne ramy — jak w Figmie

Ramy pól, kart i wierszy biorą `#344245`, ten sam token co separator. Wcześniej `--control` wskazywał tekst pomocniczy `#9daaa7`, więc obrys wyglądał grubiej przy tej samej grubości 1 px. Fokus zostaje bursztynowym obrysem 3 px, a błąd pola ramą `#ffb4ab`. Krok obciążenia zostaje polem, nie wierszem z chevronem. Ta zmiana nie zamyka T16-I. [Handoff](handoffs/2026-10-20-subtelne-ramy.md).

Sprawdzenia: Chrome na `localhost:3000`, viewport 390×844, trasy logowanie, start, plany, podgląd, import, edytor, historia, postęp, profil i ustawienie hasła. Aktywnego treningu nie otwarto. Telefon, Safari, `npm test`, build i typecheck niewykonane.

Następny krok: inny agent niż autor poprawki zapisu i tej zmiany ram powtarza T16-I. Ta sesja nie przechodzi do odbioru.

## T16-D — widoczność zapisu serii, review

Poprawka wady z niezależnego T16-I. Przy 390×844, po uzupełnieniu celów i wyborze „Zostań”, dół `Zapisz i przejdź dalej` jest nad górą `.mobile-nav`. Zapis stoi pod przewijaną treścią serii. D046 bez zmian: czwarta karta podglądu ma dół 1015,75, a czwarta karta treningu 1195,97, obie przy nawigacji 768, i obie są doskrolowalne. Komenda, API i próg T15-B bez zmian. Ta sesja nie jest nowym T16-I i nie zamyka T16. [Handoff](handoffs/2026-10-20-T16-D-widocznosc-zapisu.md).

Sprawdzenia: test edytora 7/7, `npm test` 272 passed / 9 skipped, Chrome T15-B na `localhost:3000` razem z ogonem T13-C PASS, `npm run build`, potem `npm run typecheck` PASS. Serwer Chrome to już działający `next dev`, nie `next start`. Telefon i Safari niewykonane. Po buildzie `.next` jest produkcyjny.

Następny krok: inny agent niż autor tej poprawki powtarza T16-I. Ta sesja nie przechodzi do odbioru.

Poniższa sekcja T16-I opisuje odrzuconą bramkę sprzed poprawki.

## T16-I — odbiór, bramka nieprzyjęta

Niezależny recenzent nie zmieniał `src/`. Tempo jest w drzewie roboczym: jedna paleta, pięć tras, brak `data-theme`. Brak propozycji `T16-CONTRACT`. Pełnego PASS nie ma. Przy 390×844 przycisk `Zapisz i przejdź dalej` nie kończy się nad dolną nawigacją. D046 zostaje regułą kart, nie zasłony głównego zapisu. Wada wraca do T16-D. [Raport](reports/2026-10-19-T16-I-tempo-acceptance.md), [handoff](handoffs/2026-10-19-T16-I-niezalezny-odbior.md).

Sprawdzenia: `npm test` 271 passed / 9 skipped, `npm run build`, potem `npm run typecheck` — PASS. Lokalny Chrome i API na produkcyjnym `next start` `localhost:3017`: T15-A, T15-F, import, edytor, historia, postęp, T13-A, T05, T09, T15-C HTTP i osobny T13-C — PASS. T15-B — exit 1. Głos to mock. Telefon, Safari i ponowny odczyt Make niewykonane. Serwer 3017 zatrzymany. Po buildzie `.next` jest produkcyjny; `next dev` na 3000 może wymagać restartu.

Następny krok zapisany w tej sekcji dotyczył poprawki T16-D. Poprawka jest w sekcji wyżej. Ten opis zostaje świadectwem odrzuconej bramki.

Poniższa sekcja T16-H opisuje profil. Wcześniejsze etapy są niżej.

## T16-H — Profil i Auth, review

Profil, logowanie i ustawienie hasła mają hierarchię Tempo. Profil idzie od konta, przez rzeczywiste 1RM i ustawienia, do historii i wylogowania. Wylogowanie jest akcją danger, nie głównym przyciskiem. Logowanie zostawia autofill, generyczny błąd, sesję wygasłą, wylogowanie i tryb demo. Ustawienie hasła ma dokładnie jedno pole `new-password`, widoczne minimum 12 znaków, zachowanie wpisu po błędzie i blokadę drugiego wysłania. Historia treningów nie jest przeliczana. Brak propozycji `T16-CONTRACT`. [Handoff](handoffs/2026-10-19-T16-H-profil-auth.md).

Sprawdzenia: testy 1RM i hasła 5/5, `npm test` 271 passed / 9 skipped, lokalny Chrome `test-t15f-browser.mjs` na `localhost:3000`, 360/390/430 i desktop 1280, `npm run build`, potem `npm run typecheck` — PASS. Chrome korzystał z już działającego `next dev`. Telefon i Safari niewykonane. Po buildzie katalog `.next` jest produkcyjny.

Następny krok: użytkownik wkleja prompt T16-I z handoffu H. Odbiorca ma być innym agentem niż autorzy B–H. Ta sesja nie przechodzi do niezależnego odbioru.

Poniższa sekcja T16-G opisuje postęp. T16-F i wcześniejsze są niżej.

## T16-G — Postęp, review

Postęp ma hierarchię Tempo na istniejącej analityce v1. Kolejność: ćwiczenie i wariant, metryka, ostatni wynik, wykres, zakres, rekordy całej historii. Pusty wynik zostaje „Brak danych”. Jeden punkt nie rysuje linii trendu. Przerwa między pomiarami nie schodzi do zera, a prawdziwe 0 kg zostaje punktem. Brak dwóch pomiarów w oknie nie pokazuje `0%`. Szacunek ma osobną informację i link do Profilu; nie wyświetla zmierzonego 1RM, bo ten odczyt go nie zawiera. Rekordy nadal obejmują całą historię. Tylko punkt otwiera szczegół. Brak propozycji `T16-CONTRACT`. [Handoff](handoffs/2026-10-19-T16-G-postep.md).

Sprawdzenia: testy postępu i analityki 32/32, `npm test` 268 passed / 9 skipped, lokalny Chrome `test-t15e-browser.mjs` na `localhost:3000`, 360/390/430 i desktop 1280, API `test-t15e-api.mjs` 505 sesji oraz A/B/anon, `npm run build`, potem `npm run typecheck` — PASS. Chrome korzystał z już działającego `next dev`. Telefon i Safari niewykonane. Po buildzie katalog `.next` jest produkcyjny.

Następny krok: użytkownik wkleja prompt T16-H z handoffu G. Ta sesja nie przechodzi do profilu i logowania.

Poniższa sekcja T16-F opisuje historię. T16-E i wcześniejsze są niżej.

## T16-F — Historia, review

Kalendarz i listy sesji mają hierarchię Tempo. Miesiąc stoi nad siatką od poniedziałku do niedzieli. Wybrany dzień jest wypełniony, a dzisiejsza data ma obrys. `Dzisiaj` jest akcją przy dniu. Zakończona sesja ma `Otwórz trening`. Aktywna zostaje w osobnej sekcji `Do wznowienia` z `Wznów`, także przy pustym dniu. Pusty dzień mówi o braku zakończonych treningów i nie udaje błędu odczytu. Godzina pochodzi z projekcji albo zostaje „godzina nieznana”. Postęp jest osobną akcją. Powrót z treningu przywraca miesiąc i dzień. Brak propozycji `T16-CONTRACT`. [Handoff](handoffs/2026-10-19-T16-F-historia.md).

Sprawdzenia: testy kalendarza 6/6, `npm test` 265 passed / 9 skipped, lokalny Chrome `test-t15d-browser.mjs` na `localhost:3002`, 360/390/430 i desktop 1280, północ, DST, rok przestępny, korekta, usunięcie, A/B/anon, `npm run build`, potem `npm run typecheck` — PASS. Chrome korzystał z już działającego `next dev`. Telefon i Safari niewykonane. Po buildzie katalog `.next` jest produkcyjny.

Następny krok: użytkownik wkleja prompt T16-G z handoffu F. Ta sesja nie przechodzi do postępu.

Poniższa sekcja T16-E opisuje import i edytor. T16-D i wcześniejsze są niżej.

## T16-E — Import, korekta i edytor, review

Import, korekta i ręczny edytor mają hierarchię Tempo. Plik i zdjęcie są głównymi źródłami. Tekst, głos i ręczny edytor są wtórne. Statusy czekania, odczytu, błędu z ponowieniem, anulowania i zatwierdzenia są osobne i nie obiecują planu przed serwerem. Korekta idzie Nazwy → Serie i superserie → Podsumowanie. Jedno pytanie na raz, a nierozwiązane blokuje publikację. Źródło na wąskim ekranie jest pełnym dialogiem, na desktopie stoi obok planu. Edytor otwiera ćwiczenie całą kartą. Anulowanie, indywidualne serie, wersje, retry i brak autosave zostają. Brak propozycji `T16-CONTRACT`. [Handoff](handoffs/2026-10-19-T16-E-import-edytor.md).

Sprawdzenia: `npm test` 265 passed / 9 skipped, lokalny Chrome importu i edytora na `localhost:3002`, 360/390/430 i desktop 1280, HTTP T15-C na produkcyjnym `next start` `localhost:3016` z wyłączonym AI i lokalnym sekretem crona, `npm run build`, potem `npm run typecheck` — PASS. Chrome korzystał z już działającego `next dev`. Telefon i Safari niewykonane. Po buildzie katalog `.next` jest produkcyjny. Tymczasowy serwer 3016 został zatrzymany.

Następny krok: użytkownik wkleja prompt T16-F z handoffu E. Ta sesja nie przechodzi do historii.

Poniższa sekcja T16-D opisuje trening. T16-C, T16-B i T16-A są wcześniejsze.

## T16-D — Trening, review

Przegląd sesji, jedna seria, dyktowanie, zakończenie i usunięcie mają hierarchię Tempo. Kontynuacja jest główną akcją. Dodanie ćwiczenia i komentarz są drugorzędne, zakończenie jest ghost, usunięcie danger z osobnym dialogiem. Cel serii jest oddzielony od wykonania. `Brak wartości w planie`, `Nie dotyczy` i `0 kg` są trzema stanami celu. Czas i dystans zostają własnymi polami. Otwarcie serii, także opcjonalnej, nie zapisuje wyniku. Retry, ACK i GET, 409, szkic oraz korekta czasu bez zmiany snapshotów zostają. Przy 390 czwarta karta treningu ma dół 1195,97 przy nawigacji 768 i jest doskrolowalna. Brak propozycji `T16-CONTRACT`. [Handoff](handoffs/2026-10-19-T16-D-trening.md).

Sprawdzenia: `npm test` 263 passed / 9 skipped, lokalny Chrome `test-t13c-browser.mjs` na `localhost:3002`, 360/390/430 i obniżony viewport 500, regresje T13-A RPC/HTTP, T05 API i T09 HTTP/PostgREST bez płatnego AI, `npm run build`, potem `npm run typecheck` — PASS. Serwer Chrome to już działający `next dev`. Telefon i Safari niewykonane. Po buildzie katalog `.next` jest produkcyjny.

Następny krok: użytkownik wkleja prompt T16-E z handoffu D. Ta sesja nie przechodzi do importu i edytora.

Poniższa sekcja T16-C opisuje start i plany. T16-B i T16-A są wcześniejsze.

## T16-C — Start, Plany i podgląd, review

Start, biblioteka planów, podgląd i konflikt startu mają hierarchię Tempo. Na starcie jedna akcja: `Wznów trening`, `Rozpocznij [jednostka]`, `Utwórz lub zaimportuj plan` albo `Zaloguj się`. Pusta biblioteka i błąd odczytu są osobnymi stanami. Karuzela `/plany` zostaje z dotykiem, myszą, klawiaturą i wskaźnikiem; archiwum nie startuje. Podgląd zachowuje serie, rampy, superserie, opcjonalność, źródła, `null` i 0. W konflikcie powrót jest primary, zakończenie secondary, a usunięcie danger z osobnym dialogiem. Przy kilku sesjach etykiety zostają `Zakończ ten trening` i `Usuń ten trening`, bo te komendy nie otwierają nowego treningu, dopóki nie zostanie jedna sesja. D046: czwarta karta podglądu przy 390 wchodzi pod nawigację i jest doskrolowalna. Brak propozycji `T16-CONTRACT`. [Handoff](handoffs/2026-10-19-T16-C-start-plany.md).

Sprawdzenia: testy karuzeli, podglądu i startu, `npm test` 259 passed / 9 skipped, lokalny Chrome `test-t15b-browser.mjs` razem z T13-C na `localhost:3002`, 360/390/430 i desktop 1280, `npm run build`, potem `npm run typecheck` — PASS. Serwer to już działający `next dev`, nie `next start`. Wejście przez `127.0.0.1` nie hydratowało klienta. Telefon i Safari niewykonane. Po buildzie katalog `.next` jest produkcyjny.

Następny krok: użytkownik wkleja prompt T16-D z handoffu C. Ta sesja nie przechodzi do treningu.

Poniższa sekcja T16-B opisuje fundament. T16-A i T15-G są wcześniejsze.

## T16-B — fundament Tempo, review

Jeden system Tempo jest w kodzie. `--tempo-*` w jednym `:root` mapują dotychczasowe aliasy. Nie ma `data-theme="night"`, przełącznika ani drugiej palety. `themeColor` to `#11191c`. Pięć tras, lokalny Inter, safe-area, fokus, cele 44×44 i `prefers-reduced-motion` zostają. Wspólne kontrolki: Button, Field, Stepper, ListRow, Card, StatusBadge, SegmentedControl, Notice, EmptyState, Dialog oraz dolna i boczna nawigacja. AppShell nadal rozróżnia konto prywatne i demo. Ekrany C–H dostały tylko nowe tokeny, bez przebudowy układów. Brak propozycji `T16-CONTRACT`, więc T16-K pozostaje niegotowe. [Handoff](handoffs/2026-10-19-T16-B-fundament-tempo.md).

Sprawdzenia: testy UI 9/9, `npm test` 256 passed / 9 skipped, lokalny Chrome 21 stanów na 360/390/430 i desktop, kontrast AA, skip-link, fokus i reduced motion, `npm run build`, potem `npm run typecheck` — PASS. Serwer Chrome to już działający lokalny Next na `127.0.0.1:3002`, nie `next start`. Telefon i Safari niewykonane. `scripts/test-t15f-browser.mjs` nadal oczekuje `data-theme="night"` i należy do T16-H; nie był uruchamiany. README oraz zdanie w specyfikacji T16 o Nocy w kodzie opisują stan sprzed B i nie były w dzierżawie tej sesji.

Następny krok: użytkownik wkleja prompt T16-C z handoffu B. Ta sesja nie przechodzi do Startu i planów.

Poniższa sekcja T16-A opisuje poprzedni kontrakt. T15-G jest wcześniejszym zamknięciem lokalnym.

## T16-A — kontrakt Tempo, review

Zapisano kierunek Tempo jako jedyny wygląd (D047) i wiernie skopiowano z Figma Make `D2nF5loZrbPDqY2oco8ske` [brief](tempo-implementation-brief.md) oraz [katalog klatek](tempo-frame-catalog.md). Program A–I i warunkowe K, własność plików oraz macierz 85 stanów są w [T16](T16_TEMPO_IMPLEMENTATION.md). D046 pozostaje bez zmian. Zdanie o palecie Nocy w kodzie dotyczy stanu przed T16-B. [Handoff](handoffs/2026-10-19-T16-A-kontrakt-tempo.md).

Sprawdzenia tej sesji: ponowny odczyt MCP i zgodne SHA-1 obu kopii, identyfikatory stanów z `App.tsx` w Make, linki oraz `git diff --check`. Bez testów produktu, telefonu, Safari i commitów. Brak propozycji `T16-CONTRACT`.

## T15-G / T13-E — odbiór lokalny zamknięty

Niezależny recenzent sprawdził `codex/t15-ui` na `11d66bc`. Testy 251/9 skip, typy, build, lokalne Auth/API A/B/anon i Chrome przepływu przeszły. Pierwszy pomiar podglądu przy 390×844 pokazał dół czwartej karty na 786,95 przy nawigacji od 768. Użytkownik uznał to za zwykłe przewijanie dłuższej listy, nie za błąd (D046). Po tej decyzji cały runner planów i treningu przeszedł ponownie. [Raport G](reports/2026-10-19-T15-G-acceptance.md), [raport R](reports/2026-10-19-T13-acceptance.md), [handoff](handoffs/2026-10-19-T15-G-niezalezny-odbior.md). T13 i T15-A–G są done lokalnie. Telefon, Safari i publikacja zostają otwarte. W chwili tego odbioru nie było kolejnego zadania wykonawczego; program T16 jest późniejszy.

Poniższe sekcje opisują historię, w tym wstępny zapis sprzed D046.

## T15-U2 — gotowy prompt zbiorczego zlecenia CLI

Konsultacja done; [handoff U2](handoffs/2026-10-18-T15-U2-prompt-cli.md), [pełny prompt integratora](prompts/T15-ORCHESTRATOR.md). Uwzględnia rozmowę użytkownika z CLI: A przed resztą, maksymalnie dwóch wykonawców, samodzielne przyjmowanie bramek przez I, E z jawnym kontraktem, G niezależny, kolejka wspólnych testów i checkpointy/wznowienie. Późniejsze wklejenie promptu startowego jest zleceniem całego A–G, które zastępuje stare oczekiwanie na osobne zlecenia etapów. Samo zapisanie instrukcji nie uruchomiło implementacji; A–G nadal todo. Baza Git51ea3b4, nowe dokumenty konsultacji pozostają zmianami roboczymi. Weryfikacja tej sesji: dokumenty/linki/diff-check, bez testów produktu lub subagentów.

## GIT-S1 — lokalny punkt kontrolny

Na zlecenie użytkownika zapisano aktualną pracę w lokalnym commicie: kod T13, dokumentację/konsultacje, publiczne makiety T14 i plan T15. [Handoff zapisu](handoffs/2026-10-18-GIT-S1-zapis-stanu.md). Prywatne materiały i sekrety poza Git; bez push/publikacji. Stan funkcjonalny pozostaje poniżej, bez startu implementacji T15.

## T15-U — konsultacja delegowania i wznowienia

Konsultacja zakończona: [handoff T15-U](handoffs/2026-10-18-T15-U-delegowanie-i-limity.md). Rekomendacja do rozważenia: jeden integrator, do dwóch równoległych wykonawców, niezależny odbiór G, kolejka wspólnych testów i checkpointy wewnątrz etapów. Kontrakt E wymaga doprecyzowania. Limit użycia nie daje gwarancji automatycznego restartu zespołu; wznowienie opierać na zapisanych plikach i weryfikacji częściowej pracy. Nie sprawdzono limitu konta użytkownika. Bez implementacji, subagentów lub zmiany zatwierdzonych wymagań. A–G nadal todo; do startu potrzebne późniejsze zlecenie. Poniżej pozostaje najnowszy wynik wykonawczy makiet.

## T14-R6 — naprawiony klik punktu myszą

**R6 review.** Najnowszy [handoff R6](handoffs/2026-10-18-T14-R6-klik-punktu-mysza.md). Po zgłoszeniu użytkownika odtworzono błąd: natychmiastowe przechwycenie wskaźnika przekierowywało click z punktu na SVG, więc informacja nie otwierała się. Capture następuje teraz dopiero przy rzeczywistym drag. Nowe celowe kliknięcie/tap nie dziedziczy blokady poprzedniego gestu. Zwykły klik pokazuje widoczny dymek daty/metryki i źródłowej serii dla kg/estymacji; klik poza punktem zamyka.

Publiczny i prywatny R6 PASS:5 metryk w rzeczywistych iframe galerii, trwała widoczność informacji i brak przycięcia, zamykanie, drag bez przypadkowego otwarcia i kolejny klik,6 stanów360/390/430px, klawiatura oraz pierwszy tap po pinch. Prywatny R5 ponowiony PASS (pomoc, tap, zamykanie, swipe). Bez błędów JS. Poprzedni R5 sprawdzał dotyk/klawiaturę i nie był dowodem działania myszy; ograniczenie naprawiono nowym testem. Bez testu fizycznego telefonu/Safari, src/API/DB lub produkcji. Plan T15 i wszystkie wybory pozostają jak poniżej; po osobnym zleceniu możliwy T15-A.

## T14-R5 / T15-P — komplet wyborów i gotowy plan wdrożenia

**R5/P review.** Najnowszy [rzeczywisty handoff](handoffs/2026-10-18-T14-R5-T15-P-interakcje-i-plan.md), [plan implementacji T15](T15_UI_IMPLEMENTATION.md), [specyfikacja makiet](design/t14-selected-spec.md). Użytkownik potwierdził **Profil A i domyślną paletę Noc** (D044). Wszystkie układy mają wybór. Makieta Postępu wyjaśnia punkt=trening, ma dokładną datę/serię oraz pomoc metody szacowania1RM. Po dodatkowym feedbacku tylko punkt otwiera informację; pusty wykres lub klik poza nim ją zamykają. Rekordy mają natywny dotykowy swipe. Historia wyników w makiecie pozostaje syntetyczna, prywatny plan poza repo.

Końcowy R5 publiczny i prywatny: po6 stanów360/390/430px, pochodzenie punktów, pomoc/Enter/Escape, tylko punkt otwiera, tap poza punktem zamyka i swipe PR w obie strony104→0px PASS. Bez błędów JS. Regresja R4 tej rundy:192 publiczne +372 prywatne szerokości, cztery karty i pinch PASS. Prywatne palety216 PASS. Te szerokie kontrole poprzedzały ostatnią korektę hit-testu; po niej powtórzono celowany R5. Nie deklarujemy telefonu/Safari, produktu/API/DB lub produkcji.

Plan T15 ma A fundament, B plany/trening, C import/edytor, D historię razem z T13-D, E Postęp, F profil/logowanie i G niezależny odbiór razem z T13-E. Każdy ma prompt i kartę przyszłego handoffu. Jeden integrator, odrębne pliki; domyślnie kolejno, równolegle tylko po jawnym zleceniu. A–G są todo, żaden agent nie został uruchomiony. Kodowanie A może zacząć się po zleceniu użytkownika, bez nowych decyzji wyglądu. Przed E pozostaje techniczny kontrakt estymacji/porównywalności i PR całej historii; obecne getProgress filtruje daty przed agregacją i wymaga adaptacji. Nie traktować demonstracyjnej metody jako już wdrożonej.

Następny krok: po zleceniu [T15-A](prompts/T15-A.md), z manifestem zastanych niewysłanych zmian. Obecna sesja kończy dopracowanie makiet i planowanie, bez src/API/DB, uruchamiania agentów i publikacji. Starsze wpisy poniżej są historią.

## T14-R4 — uproszczony Postęp i edycja całą kartą

**T14-R4 review.** Najnowszy [handoff R4](handoffs/2026-10-18-T14-R4-minimalny-postep.md), [specyfikacja](design/t14-selected-spec.md), [galeria syntetyczna](design/t14-full-gallery.html). Szczegółowy brief użytkownika zastąpił wybór Postępu A/B/C jednym jasnym układem i dwoma przykładami: sztanga oraz podciąganie. Duży tytuł, dropdown, metryki nad pojedynczym wykresem liniowym, zakresy1M/3M/6M/1R/Wszystko pod osią X oraz trzy przewijane rekordy z datami. Zachowano pinch i alternatywne sterowanie w rozwijanych szczegółach. Osobny przycisk edycji usunięty; cała karta otwiera formularz.

D043 dopuszcza analityczny szacowany1RM zgodnie z nowym briefem. Nie zmienia rzeczywistego datowanego1RM profilu ani historycznych zaleceń. Metoda z tabeli referencyjnej Hevy dla1–10 powtórzeń jest propozycją makiety, nie zatwierdzonym algorytmem produktu. Historia nadal syntetyczna, prywatny plan poza repo. Inter z oficjalnego repozytorium, lokalnie, OFL1.1 z licencją i manifestem.

Chrome:192 publiczne +372 prywatne kontrole szerokości, cztery karty390×844, interakcje obu metryk/typów, PR całej historii, null/0, otwieranie edytora dolną częścią karty i Enter oraz anulowanie PASS. Syntetyczny pinch in/out i pionowe przewijanie PASS.216 prywatnych kontroli palet, ciemny formularz i nowy wykres zachowujący motyw PASS. Publicznego runnera palet nie ponawiano w R4. Kontrole składni, fontów i nazw prywatnego źródła w publicznych HTML PASS. Telefon/Safari i backend niesprawdzone; src nie był zmieniany w tej rundzie.

Następny krok: ocena nowego Postępu przez użytkownika. Układ Profilu i paleta pozostają niewybrane. Obecne zlecenie makiet jest wykonane; brak kolejnego zadania wykonawczego bez feedbacku. Bez samoczynnego przejścia do src, T13-D lub publikacji. Poniższe sekcje T14 opisują wcześniejsze rundy.

## T14-R3 — kolejne wybory i dopracowane makiety

**T14-R3 review.** Najnowszy [handoff R3](handoffs/2026-10-18-T14-R3-wybory-edytor-postep.md), [specyfikacja](design/t14-selected-spec.md), [galeria syntetyczna](design/t14-full-gallery.html). Potwierdzono Start/Korektę/Edytor/Historię A oraz Import/Logowanie C (D042), obok wcześniejszego A/A/A/C. Import ma wyśrodkowane ikony i ikonę ręcznego tworzenia; Korekta nagłówek „Nazwy ćwiczeń i kolejność”; Edytor — formularz całego ćwiczenia z seriami/powtórzeniami i pozostałymi parametrami. Zmiany są lokalną symulacją ramki, nie publikacją planu.

Postęp ma trzy nowe propozycje: A ciężar i powtórzenia tej samej serii na wspólnej osi dat, B powtórzenia przy stałym ciężarze i rekordy według liczby powtórzeń, C każda seria jako punkt. Zakresy1/3/6 miesięcy,1 rok, Całość i własne daty, rzeczywisty gest pinch w makiecie, +/−/reset i pionowe przewijanie jednym palcem. Research Hevy/Strong/Fitbod i źródła MDN opisano w specyfikacji. Dane są demonstracyjne, bez estymacji1RM.

Użytkownik doprecyzował, że **rzeczywisty1RM może być ręcznie wpisywany w profilu niezależnie od historii serii**. Zachowano datę i ochronę historycznych celów; wpis nie tworzy treningu. Układ Profilu A/B/C, Postęp i paleta nadal nie zostały wybrane.

Końcowe Chrome:192 publiczne +372 prywatne kontrole szerokości, cztery pełne karty390×844, nowe wybory, edycja/cancel/Escape/ponowne otwarcie/różne serie/zero kg i daty/punkty wykresów PASS. Syntetyczny multitouch zmniejsza i przywraca zakres; pionowy scroll87/88px PASS.216 prywatnych kontroli palet, ciemny formularz i przerysowanie nowego wykresu PASS. Pierwsza próba runnera zgłaszała ponowne deklaracje globali przy wielokrotnym document.write; poprawiono izolację wyłącznie testowego probe, bez zmiany źródła UI. Telefon/Safari i backend niesprawdzone.

Następny krok: feedback użytkownika i wybór Postępu/Profilu/palety. Bez samoczynnego przejścia do src, T13-D lub publikacji. Poprzednie sekcje T14 opisują wcześniejsze rundy.

## T14-U — konsultacja UI/UX

Konsultacja zakończona; [handoff U](handoffs/2026-10-18-T14-U-konsultacja-ux.md). Rekomendacja: najpierw dopracować spójny przepływ A/A/A/C i zachowanie na telefonie, potem domknąć pozostałe układy i paletę. Biblioteki i proces pozostają propozycjami. Brak zmian makiet/src lub zatwierdzenia nowych wyborów; T14-K nadal review. Kolejny krok wykonawczy dopiero po zleceniu użytkownika.

## T14-K — osobna galeria sześciu palet do wyboru

**T14-K review.** Najnowszy [handoff K](handoffs/2026-10-18-T14-K-kolorystyka.md), [galeria syntetyczna](design/t14-colors.html), [specyfikacja](design/t14-selected-spec.md). Prywatny odpowiednik `http://127.0.0.1:8792/t14-colors.html` pozostaje poza repo. Las (obecna), Kobalt, Miedź, Morska, Grafit i Noc (ciemna) porównują tę samą treść/układ. Dostępne wszystkie ekrany, widok porównawczy/pojedynczy, skala szarości i odrębny lokalny wybór. D041: żadna nowa paleta nie jest zatwierdzona lub wdrożona.

Publiczne216 i prywatne216 kontroli360/390/430px PASS, bez overflow/błędów JS. Cztery pełne karty390×844 dla każdej palety/jednostki PASS.72 pary kontrastu tokenów: tekst minimum5,53:1, kontrolki/fokus minimum3,71:1. Preferencja/reload, przejście kartą i filtr wykresu zachowujący motyw PASS. Pierwsze zrzuty pomijały malowanie dolnego rzędu iframe poza viewportem; końcowe przechwycono w wysokim viewportcie i oceniono wszystkie sześć palet oraz telefon. To nie jest pełny audyt dostępności lub odbiór Safari/telefonu.

Następny krok: użytkownik wybiera paletę i pozostałe układy. Bez automatycznej implementacji src/T13-D lub publikacji. Po przywróceniu usługi kontroli uprawnień ponowiono publiczny R2: wszystkie siedem grup PASS. Wcześniejszy błąd drag nie odtworzył się; przyczyny nie ustalono i nie deklarujemy naprawy kodu gestu.

## T14 — R2: rozdzielony import, gesty, ilustracje i wykresy

**T14-S/P/R2 review.** Najnowszy [handoff R2](handoffs/2026-10-18-T14-R2-import-gesty-wykresy.md), [specyfikacja](design/t14-selected-spec.md), [pełna galeria syntetyczna](design/t14-full-gallery.html). Potwierdzono Plany A + swipe, Podgląd A, Szczegóły A, Zapis C (D039). Start, Import, Korekta, Edytor, Historia, Postęp, Profil i Logowanie mają po trzy warianty do wyboru. Oryginalne warianty i handoff są zachowane jako historia.

R2 rozdziela kroki korekty na nazwy/kolejność, parametry serii i podsumowanie z potwierdzeniami. Całe karty otwierają szczegóły, dodano drag myszą obok natywnego dotyku. Postęp A/B/C zawiera wykresy: ciężar, objętość lub ciężar + wykonanie wymaganych serii. Lokalne ilustracje Workout Guide z atrybucją/CC BY-SA 4.0 zastępują szkice; brakujące dokładne warianty mają neutralne oznaczenie. D040 opisuje wymagania i granice.

Prywatny PDF wykorzystano wyłącznie w lokalnym artefakcie poza repo, bez danych źródłowych/zrzutów w dokumentacji projektu i bez odczytu bazy. Link i katalog podaje handoff. Procenty zachowują znaczenie intensywności źródłowej bez zgadywania1RM/kg; historia i postęp są demonstracyjne. Chrome:192 publiczne i372 prywatne kontrole360/390/430 bez overflow, import/korekta/wybory/reload/zapis0 i null/logowanie oraz syntetyczny dotyk/klawiatura PASS. Cztery pełne karty390×844 mieszczą się we wszystkich prywatnych jednostkach; wcześniejsze ograniczenie2px A usunięto w nowych makietach. Fizyczny telefon/Safari i prawdziwy backend nie są tym sprawdzeniem.

Następny krok: użytkownik wybiera warianty pozostałych ośmiu ekranów, używając przycisku kopiowania wyborów albo wiadomości. Potem dopracowanie zgodnie z feedbackiem; bez samoczynnego przejścia do implementacji, T13-D lub publikacji. T13 zachowuje osobny stan poniżej.

Historyczne ograniczenie R2: prywatne siedem grup interakcji PASS; pierwszy publiczny R2 zatrzymał się na drag, a diagnozę blokował limit automatycznej kontroli uprawnień. Kontynuacja T14-K powyżej odnotowuje skuteczne ponowienie. Brak dokładnych ilustracji części ćwiczeń pozostaje do review.

## T13-C — lokalna bramka przyjęta, A/B/C review do E

**T13-P done; T13 in_progress; A/B/C review; D–E todo.** Najnowszy rzeczywisty [handoff C](handoffs/2026-10-18-T13-C-prowadzenie-treningu.md), wcześniejsze kontrakty [B](handoffs/2026-10-18-T13-B-podglad-planu.md) i [A](handoffs/2026-10-17-T13-A-sesje-api-datowanie.md). Codex wykonał tylko C jako jeden wykonawca/integrator, bez innych agentów. Zastane zmiany A/B/T13-P zachowane; bez zmian SQL/API i bez D.

Przegląd ma zwarte karty i osobne liczniki wymaganych/opcjonalnych/dodatkowych/pominiętych. Szczegóły pokazują jedną serię, poprzedni wynik, zapisane cele i Wszystkie serie z poprawką historyczną. Kolejność prowadzi rundami nierównych superserii; opcjonalna wymaga wyboru. Komentarz i dodatkowe ćwiczenie są na żądanie. Pełna komenda retry pozostaje niezmienna, ACK wymaga odczytu przed przejściem; błąd odczytu ponawia GET. Szkice pozostają w otwartej karcie, po409 wymagają świadomego rozstrzygnięcia. Powrót i Wstecz chronią szkic, przywracają fokus/scroll. Start ma automatyczny czas, jawny konflikt/legacy, atomowy replace i dodatkowe potwierdzenie delete. Finish ma korektę czasu/DST bez przeliczenia 1RM. Głos pozostaje zatwierdzaną propozycją z kotwicą serii/rewizji.

**Dowody C:** prawdziwe lokalne Auth/PostgREST/HTTP/Chrome, start/konflikt/cancel/replace/legacy, utrata odpowiedzi po commit i identyczny retry, ACK/nieudany GET, rzeczywisty409 drugiej karty/API, zachowany inny szkic, trzy wybory nawigacji, Wstecz/fokus/scroll, null/0, historyczna poprawka, mock zatwierdzenia i opóźnionego głosu, ponowne logowanie.360/390/430 px bez overflow, czwarta karta390×844 kończy się659,41 px przed nawigacją782 px. Pola/akcje44 i obniżona wysokość500 px. Korekta18→15.10 zachowuje snapshot null mimo dodania1RM oraz120/90 w następnej sesji. Regresje T13-A RPC/HTTP, T05, T08 HTTP i T09 HTTP PASS. `npm test`:198 passed/9 skipped; końcowy build i następujący typecheck PASS. Błędy wcześniejszych prób opisuje handoff.

Integrator przyjmuje lokalną bramkę C i zwalnia pliki C oraz globals.css; **A/B/C pozostają review do niezależnego E**. Brak znanego blokera technicznego. Po osobnym zleceniu tylko [T13-D](prompts/T13-D.md). Lokalny Supabase pozostaje z migracją22; własny Next3005 zatrzymany, konta syntetyczne usunięte. Zachowano również pojawione w trakcie sesji nieśledzone .codex/hooks.json i .cursor/hooks.json — bez ich edycji. Bez commit/push, produkcji lub płatnego AI. Fizyczna klawiatura, Safari/iPhone i T10-R1/T11 pozostają nieodebrane; desktopowy viewport nie jest dowodem działania urządzenia.

Poniższe sekcje są historią T11, nie bieżącym zleceniem.

## T11 — prototyp gotowy do testów właściciela

Najnowszy [handoff](handoffs/2026-10-16-T11-prototyp-auth-ai.md). **T11 review; T11-E1/T11-C1 done.** Po D029 tylko Production. D031: użytkownik chce teraz testować prototyp i używać AI; dalsze prace operatorskie odkładamy, bez uzależniania jego testów od pełnego odbioru infrastruktury.

**Aplikacja: [Forma](https://training-plan-app-seven.vercel.app).** 21/21 migracji z T10/C1; rzeczywisty smoke HTTPS/Auth/API/Storage A/B/anon przeszedł, PT409/409 i retry działają. Sprawdzony kod ddaceb3, ostatni dotychczasowy commit dokumentacji 4e4a0aa. [Raport](reports/2026-10-16-T11-production-audit.json) zachowuje także niezaliczone próby. Nie powtarzać szerokiej regresji bez zmiany kodu lub nowego błędu.

Auth po jawnej zgodzie zapisane i ponownie odczytane: minimum hasła12, Site URL produkcji, dokładne redirecty `/auth/confirm` i `/ustaw-haslo`. Rejestracja/anonymous off, refresh rotation on. Odczyt wyłącznie liczników potwierdził jedno konto i profil; agent nie zna danych logowania właściciela. SMTP nie jest potrzebny do obecnych ręcznych kont; dopiero przed mailowymi zaproszeniami/resetami.

Cron: Enabled `0 3 * * *`, ręczne wywołanie z panelu dało HTTP200 na pustej kolejce (23:02:26.822 CEST). Przed wywołaniem eligible imports/voice i wszystkie obiekty Storage0. Nie dowodzi to usuwania rzeczywistych wygasłych plików; CRON_SECRET bez odczytu/rotacji, jakość potwierdza użytkownik prywatnie. Przejściowe timeouty Node/Chrome nie były błędem HTTP aplikacji: curl z walidacją TLS potwierdził /logowanie200, root307, API401.

AI i głos są włączone i sprawdzone w rzeczywistym HTTPS. Użytkownik zatwierdził5USD łącznie na start i prywatnie dodał klucz. Production `dpl_DEkfN1gE4V3kk558B2SGEmVcyawS` Ready44s, kod4e4a0aa/C1. Import:3serie×5/60kg/120s, retry bez nowego AI. Głos: syntetyczne2,9s → transkrypcja → propozycja5/60 → zapis dopiero po zatwierdzeniu. Dodatkowy odczyt prywatnej tabeli budżetowej w runnerze dał42501; same kontrole aplikacji wcześniej przeszły, bez kolejnej płatnej próby. Raport zachowuje ten błąd testu. Limity szacunków import4/głos1 w24h nie są twardym limitem5USD łącznie; niepotwierdzony limit projektu OpenAI. Duże audio pozostaje otwarte, krótkie próby dopuszcza D032.

Backup: użytkownik wskazał Mac poza repo, ale przed zmianą priorytetu wykonano tylko eksport publicznego schematu do /private/tmp, bez danych Auth/Storage. Brak szyfrowanego backupu i restore. Odłożone: dalszy backup/restore/monitoring i próba fizycznego cleanup; bez deklaracji wykonania. Telefon/Safari i szersza beta nadal wymagają formalnego T10-R1; właściciel może już testować dostępną aplikację.

## Następny krok

Właściciel testuje aplikację, import i krótkie nagrania. Dalsza praca agenta dopiero od konkretnego feedbacku, bez automatycznego monitorowania lub rozwijania infrastruktury. Szczegóły i prompt w najnowszym handoffie. Historyczne sekcje niżej opisują wcześniejsze stany.

## Co istnieje

T01–T08, T06-R1, T07-R1 i T04-R1 są ukończone lokalnie. T09 jest `done` lokalnie po rozstrzygnięciu użytkownika z 2026-10-14 (D025). T10 jest `done` lokalnie: odbiór i poprawki opisano w raporcie. T11 jest in_progress: użytkownik utworzył projekt Vercel i podłączył produkcyjny Supabase. T11-E1 zakończyło uproszczenie konfiguracji. Hosting nie ma pełnego odbioru; migracje produkcji zastosowano w bieżącej sesji. Fizyczny review użytkownika po Vercel należy do T10-R1. Git zainicjowano na gałęzi `main`; docelowe repozytorium: [gisupanalizy/training-plan-app](https://github.com/gisupanalizy/training-plan-app). Pierwszy commit obejmuje źródła i dokumentację, bez sekretów i prywatnych fixtures.

T06-R1 poprawił odczyt tabel i ich kontekstu, zakresy i opcjonalność, AMRAP, superserie, pytania z kontekstem i stabilnymi celami, podgląd PDF.js/XLSX oraz wewnętrzny słownik PL/EN. Zastosowano lokalnie dwie migracje rozszerzające plan i nowe niezmienne snapshoty, z obsługą starszych szkiców. Najnowszy [handoff T11-E1](handoffs/2026-10-16-T11-E1-usuniecie-duplikatow.md) jest punktem wejścia do konfiguracji. [Handoff Git](handoffs/2026-10-14-T11-G1-pierwszy-commit.md) dokumentuje inicjalizację repo, a [pierwszy T11](handoffs/2026-10-14-T11-przygotowanie-wdrozenia.md) przygotowanie procedury. [T10](handoffs/2026-10-14-T10-odbior-lokalny.md) dokumentuje lokalny odbiór; [T04-R1](handoffs/2026-10-13-T04-R1-czytelny-edytor.md) dokumentuje poprzednią przebudowę edytora. T04-R1 przebudował ręczny edytor: jeden trening, karty i okna edycji, zakresy oraz parametry dodatkowe na żądanie. Import zachowuje trzy kroki T07-R1; poprzednie handoffy dokumentują wcześniejsze zadania.

## Następny krok

T11-E1 jest done: nowy kod odczytuje integrację STORAGE, osiem ręcznych ustawień ograniczono do Production, a trzy ręczne duplikaty usunięto po jawnym potwierdzeniu użytkownika. Szczegóły i prompt w handoffie. Bieżąca sesja zastosowała migracje; dalsze T11 wymaga Auth, kosztów, cleanup/backup i zdalnego smoke A/B/anon po HTTPS. D029 usuwa wymóg preview na teraz; SMTP przed mailowymi zaproszeniami. Nie deklarować samego połączenia integracji jako wdrożenia. Telefon/Safari i szersza beta pozostają T10-R1.

## Konfiguracja T11-E1 (2026-10-16)

Potwierdzono przez Chrome zalogowane Vercel `gisupanalizy-gmailcoms-projects/training-plan-app` i Supabase `supabase-violet-cable`, ref `kwmyosnerwvtwxtszzka`. Integracja nadała rodzinę STORAGE tylko Production. Połączenie Marketplace w Vercel nie jest instalacją konektora Codex: konektor nadal niedostępny, CLI bez tokenów, ale przeglądarka pozwoliła zmienić ustawienia.

Kod opublikowano na main jako `82b9eb7`; nie jest to potwierdzenie udanego wdrożenia. Nowy kod preferuje kompletną parę publicznych zmiennych STORAGE i wybiera serwerowy secret/service_role tej samej rodziny, bez ręcznego kopiowania sekretów. Stare nazwy zachowane lokalnie. Testy wyboru 20/20; cała suite 171 passed/9 skipped; build/typecheck z syntetycznym STORAGE oraz rzeczywiste lokalne HTTP T06/T07 A/B/anon/Storage/retry na mocku AI przeszły. Nie było płatnego AI. Nowy lokalny manifest: [95 źródeł i 20 migracji](reports/2026-10-16-T11-E1-release.json), bez uploadu. .next/static nie zawierał referencji serwerowych kluczy ani syntetycznego sekretu builda.

W Vercel zapisano APP_ENV=production, oba refy produkcyjne, cztery wyłączone flagi/budżety AI; wszystkie tylko Production. CRON_SECRET ograniczono do Production bez zmiany/odczytu jego wartości. Jakość losowości pozostaje nieweryfikowana. Po odpowiedzi użytkownika „Tak, usuń trzy ręczne duplikaty” usunięto NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY i SUPABASE_SERVICE_ROLE_KEY. UI potwierdził brak wszystkich trzech oraz obecność automatycznych wpisów STORAGE; tych wpisów nie zmieniano. Zmiany środowiska obowiązują dopiero przy nowym wdrożeniu. Nie uruchomiono Redeploy ani migracji hostowanych. D028 i [procedura](T11_DEPLOYMENT.md) opisują konfigurację. Wcześniejsze wyniki niżej są historyczne.

## Przygotowanie i weryfikacja T11

Sprawdzono brak lokalnych powiązań projektów, tokenów procesu i znanych plików logowania CLI. `supabase projects list` odmówiło z powodu braku tokenu, a Vercel 64.0.2 `deploy --dry --format=json` z odrębną konfiguracją z powodu braku poświadczeń. Obie integracje są dostępne do instalacji, ale nie są połączone. Zdalne listy projektów i ich ustawienia nie zostały odczytane. Nie tworzono usług, nie zmieniano kluczy i nie wykonywano uploadu.

Nowa lista dozwolonych plików w `.vercelignore` i `scripts/prepare-t11-deploy.mjs` tworzą czystą kopię bez `.env`, fixtures, docs, testów i migracji. [Lokalny manifest](reports/2026-10-14-T11-release.json): 94 pliki, 767 227 B, 20 migracji w osobnym wykazie. To nie manifest faktycznej wysyłki dostawcy. Czyste `npm ci --offline --ignore-scripts --no-audit --no-fund`, build i typy przeszły na Node 26.4.0 bez `.env` i AI. `node scripts/verify-t11-package.mjs` potwierdziło zgodne hashe, ścieżki Git/Vercel i odrzucenie env/sekretu/dowiązania na syntetycznych kopiach. Nie ponawiano całej suite aplikacji; kod domenowy i API nie zmieniły się.

Sprawdzono aktualne oficjalne dokumenty Vercel/Supabase/OpenAI; źródła przy konkretnych regułach w procedurze. Otwarte: SMTP zaproszeń, audio 5 MiB wobec 4,5 MB Vercel, automatyczne sprzątanie preview, backlog ponad 50 importów, rzeczywiste limity kosztów i test odtworzenia. Proponowane zmiany limitu audio/RPO/RTO nie są zatwierdzonym kontraktem. Bez płatnego AI, agentów, telefonu/Safari, hostingu i restore. D027 zapisuje przygotowanie i granice. Szczegóły błędów narzędzi i zasobów tymczasowych w handoffie.

## Weryfikacja T10

[Raport T10](T10_ACCEPTANCE.md) podaje polecenia, środowisko, wyniki i listę fizycznego review po Vercel. D025 rozstrzyga termin odbioru T09; D026 zamyka bezpośredni INSERT/UPDATE/DELETE klienta do katalogu i tabel planu. Lokalna migracja T10 zastosowana bez resetu danych. Cztery ręczne API korzystają ze wspólnego limitowanego czytnika JSON (400 dla niepoprawnego kształtu/rozmiaru); proxy prywatnego API bez sesji zwraca JSON 401. `.gitignore` i nowy `.vercelignore` wykluczają prywatne fixtures, lokalne sekrety i konfigurację .vercel.

Rzeczywiste lokalne T03 (w tym Storage/Mailpit i 3 testy sesji), T04, T05, T06 (3/3, mock AI), T06-R1 i T10 (12 tabel, trzy operacje, A/B/anon) przeszły. `npm test` w runnerze: 159 przeszło, 6 pominięto, 23 aktywne pliki/4 pominięte; build i następujące po nim typy przeszły. HTTP T06/T07-R1, T08 i T09 oraz syntetyczny Chrome T04-R1 przeszły. Chrome T10 po poprawieniu selektorów/oczekiwania testu sprawdził logowanie UI, 1RM, start, serię z utratą odpowiedzi/retry, zero/null, pominięcie, dodatki i komentarz, koniec, ponowne logowanie/historię, 540 kg w postępie i A/B/anon. Brak błędów strony; mobilne zrzuty ocenione. Wszystkie sekcje zaliczone; nie był to jeden nieprzerwany udany przebieg całego runnera. `npm audit --omit=dev --audit-level=high`: 0 podatności po ponowieniu z dostępem sieciowym.

Nie wykonano nowego płatnego AI, wdrożenia, telefonu/Safari ani obciążenia. Nowe konta i Chrome T10 są syntetyczne; istniejący audit źródła w suite czyta zachowane materiały lokalne. Prywatne dane nie były publikowane. Port 3006 bez nasłuchu po sprawdzeniach, lokalny Supabase pozostaje uruchomiony. Bez innych agentów i zmian sekretów.

## Weryfikacja T04-R1

Nowy i istniejący plan mają kompaktowy ręczny edytor jednego treningu, podgląd całego planu i modalną edycję ćwiczeń/bloków/serii. Zakresy i pola dodatkowe są otwierane na żądanie; użyte wartości, braki i uwagi są widoczne w kartach. Zapis publikuje całą wersję, retry zachowuje payload, a ukrycie pól nie usuwa danych. Bez migracji lub zmian API.

`npm test`: 122 przeszło, 8 pominięto. Produkcyjny build i sekwencyjny `npm run typecheck` przeszły. Lokalne T04 potwierdziło A/B/anon, wersje, retry i 1RM. Chrome 1440×1000/390×844 na własnych syntetycznych danych sprawdził karty, dialog/cancel, katalog/przeniesienie, superserie, fokus, brak overflow i prawdziwą publikację z celową utratą odpowiedzi oraz retry bez duplikatu. Odczyt bazy potwierdził zachowanie wcześniejszych serii i snapshotów rozpoczętego treningu. HTTP T07-R1 z mockiem szkicu i syntetycznymi źródłami przeszedł; w tej sesji nie ponawiano klikalnego testu prywatnych źródeł importu. Pierwsze testy miały błędy oczekiwań/selektorów; poprawiono i powtórzono. Dostęp do Dockera wymagał powtórzenia poza sandboxem. Szczegóły w handoffie T04-R1.

Bez innych agentów, płatnego AI, publikacji prywatnych fixtures i zmian sekretów. Fizyczne telefony, Safari/iPhone oraz hosting pozostały niesprawdzone w T04-R1. Bieżący status T09 określa ROADMAP i D025.

## Weryfikacja T07-R1

Import ma własny przegląd: Ćwiczenia → Serie i superserie → Podsumowanie. Krótkie karty pokazują 7–8 × 1, różne cele i jawne braki; edycja bloku/pojedynczej serii i grup jest otwierana na żądanie. Ankieta wyjaśnia jedno pytanie, z wyborem/zakresem/AMRAP, cytatem i podglądem zmiany. Źródło jest panelem lub pełnym dialogiem na telefonie. Krok i potwierdzenia są zapisane w opcjonalnym review_data; brak migracji planu/historii. W ramach T07-R1 ręczny edytor pozostał dotychczasowy; późniejszy T04-R1 opisano wyżej.

`npm test`: 100 przeszło, 8 pominięto; typy i build przeszły. Lokalne T06 (3/3), T06-R1 API/snapshot/retry i HTTP A/B/anon przeszły, w tym trwały etap, niepoprawne metadata i starszy PATCH. Chrome na zachowanych wynikach trzech prawdziwych źródeł sprawdził karty, blok/cancel, ankiety, kolejność, krok/reload/potwierdzenia, fokus, widok mobilny, 6 stron PDF i wszystkie arkusze. UI test z mockiem sprawdził utratę odpowiedzi publikacji i retry tym samym ID bez PATCH już zatwierdzonego szkicu. Nie wykonano nowych płatnych prób AI ani publikacji prywatnych planów. Fizyczne urządzenia, Safari i hosting niesprawdzone. Szczegóły i granice w handoffie T07-R1.

## Weryfikacja T06-R1

Trzy źródła dołączono lokalnie za wyraźną zgodą użytkownika. Niezależny odczyt i baseline zachowano przed poprawkami. Końcowa rzeczywista ścieżka Auth/Storage/processImportJob przyjęła PDF (3 treningi/30 ćwiczeń/1 uzasadnione pytanie, 48,562 s), FBW (3 treningi/19 ćwiczeń/6 pytań, 92 ms) i Madzię (12 jednostek/17 pytań, 111 ms). Oba XLSX użyły czytnika struktury z 0 tokenów AI. Każde pytanie oceniono; jawne serie/powtórzenia/czas nie wywołują pytań. Niezależny audit porównuje wszystkie 30 pozycji PDF pod kątem serii, celu i grupy.

Prawdziwy model: pełna seria syntetyczna v11 12/12 szkiców i 88/90 pól; 2 różnice nazw dni A/B. Po poprawce aplikacji celowane v12 2/2 i 17/17. Nie ponowiono pełnej serii v12. Znane metryki plików i obu serii syntetycznych sumują się do 0,058016 USD; 4 wcześniejsze próby mają niepełne tokeny, więc całkowity rachunek jest nieznany. Przed próbami sprawdzano pozostały zatwierdzony budżet T06 (5 USD); nie usuwano istniejących prób dla resetu limitu. Szczegóły i źródła taryfy: [T06_IMPORT](T06_IMPORT.md).

`npm test`, typy i build oraz lokalne T04/T05/T06/T06-R1/T08 przeszły. HTTP T06 z produkcyjnym Next sprawdził A/B/anon, prywatny podgląd, korektę/reload, retry i stare szkice. Klikalny test Chrome na prawdziwych źródłach i zachowanych wynikach sprawdził 6 stron PDF, zoom, pełny ekran, skok do strony 4, mobilną szerokość, wszystkie arkusze, dolne wiersze/przekreślenie, zakres/AMRAP i zachowanie odpowiedzi po przestawieniu/reload. Dokładne liczniki i polecenia są w handoffie. Mock AI w regresji HTTP jest oddzielony od prawdziwych prób.

## Ograniczenia

Pozostałe pytania dotyczą daty Excela, podstawy ciężaru, alternatyw sprzętu, znaczenia zapisu przerwy i zakresu/protokołu bloków; nie uzupełniamy ich przez zgadywanie. Czytnik rozpoznaje określone układy, inne przechodzą do AI. PDF ma skok do strony i cytat, bez automatycznego zaznaczania prostokąta. Słownik EN ma 876 pozycji, tylko część ma zweryfikowane odpowiedniki PL; niepewne dopasowania są propozycjami. Prawdziwe próby nie gwarantują jakości dowolnego dokumentu. Hosting, obciążenie, fizyczne telefony i Safari/iPhone nadal niesprawdzone. Prywatne źródła i pełne wyniki pozostają wyłącznie lokalnie, klucz w ignorowanym `.env`; niczego nie wysłano do publicznego repo.

## Weryfikacja T07

`npm run typecheck`, `npm test` (51 aktywnych testów, 6 pominiętych) i `npm run build`: sukces. Po lokalnej migracji `DO_NOT_TRACK=1 npm run test:t06:local`: 3/3; rozszerzony `DO_NOT_TRACK=1 npm run test:t06:http`: sukces dla prywatnego źródła, korekty po odświeżeniu, A/B/anon, podpisanego uploadu, błędnego i niewspieranego pliku, anulowania, pytań i powtórzonego zatwierdzenia. Test komponentu symuluje odmowę aparatu i 55 pytań; nie jest testem prawdziwego urządzenia ani jakości AI. Wyniki i granice: [handoff T07](handoffs/2026-10-12-T07-ekran-importu.md).

## Weryfikacja T08

`npm run typecheck`, `npm test` (53 aktywne, 6 pominiętych) i `npm run build`: sukces. `DO_NOT_TRACK=1 npm run test:t05:local` potwierdził regresję T05. `T08_HTTP_BASE=http://localhost:3005 DO_NOT_TRACK=1 npm run test:t08:local` na lokalnym prawdziwym Auth/PostgREST i produkcyjnym Next: 940 kg przed i 1140 kg po poprawce historycznej serii, A/B/anon oraz filtr ćwiczenia i daty. Testy użyły danych syntetycznych, bez AI i mocka bazy. Nie wykonano testu fizycznego urządzenia, pełnego klikanego E2E ani hostingu.

## Weryfikacja T09

Po zatwierdzeniu limitu 0,50 USD wykonano cztery serie prawdziwego API na 20 polskich tekstach, jednym syntetycznym planie oraz czystym i zaszumionym nagraniu syntetycznym. Pierwsze próby wykryły nadmiernie dosłowne porównanie nazw/komentarzy, błąd zamiast doprecyzowania przy brakującej nazwie ćwiczenia i niestabilność skrótu „pięć po sto” oraz planu. Po korekcie walidatora, miary i promptu `voice-pl-v2` końcowa seria dała 20/20 tekstów, poprawny plan i 2/2 transkrypcji; p50/p95 tekstu 4,351/8,622 s, audio 0,552/0,552 s. Cztery serie kosztowały szacunkowo 0,010376 USD łącznie; [raport końcowy](reports/2026-10-12-T09-live.json), wcześniejsze v1–v3. `npm test` dał 65 aktywnych testów i 7 pominiętych, lokalne T09/T05 A/B/anon, typy po buildzie i build przeszły. Pierwszy równoległy `typecheck` trafił na przebudowę `.next` i został powtórzony sekwencyjnie z sukcesem.

Kontynuacja 2026-10-13: dodano obsługę asynchronicznego błędu `MediaRecorder`, aby zatrzymać mikrofon i nie wysłać częściowego nagrania. Testy komponentu sprawdziły błąd na ścieżce MP4 oraz zmianę serii podczas opóźnionej interpretacji. `npm test`: 67 przeszło, 7 pominięto; `npm run build`, sekwencyjny `npm run typecheck`, `DO_NOT_TRACK=1 npm run test:t09:local`, jego wariant HTTP z `T09_HTTP_BASE=http://localhost:3005` i `DO_NOT_TRACK=1 npm run test:t05:local` przeszły. Pierwsza próba lokalnego T09 w sandboxie nie miała dostępu do socketu Dockera; powtórzenie z uprawnieniem przeszło. ADB pokazało wyłącznie emulator, USB nie wykazało telefonu, a użytkownik potwierdził jego brak. Nie ponowiono T06 przed 12:23 UTC; nie usuwano żadnych prób i nie wywołano płatnego API. Testy komponentowe są mockami, nie odbiorem telefonu.

Odbiór emulatora 2026-10-13: użytkownik wyraźnie uznał emulator za wystarczający na ten etap i poprosił o status `done`. W Chrome Android przez `adb reverse` i tymczasową lokalną stronę sprawdzono dwa poziomy uprawnienia mikrofonu, rzeczywiste nagranie WebM/Opus (48 449 B), wymuszone audio/MP4 (31 685 B), anulowanie aktywnego nagrania (`discarded=true`) i zwolnienie ścieżki mikrofonu. Ponownie `npm test`: 67 przeszło, 7 pominięto. Nie była to pełna klikalna ścieżka aplikacji na emulatorze; opóźniony wynik i zmiana serii mają testy komponentów z mockiem oraz kontrolę rewizji. Fizyczny telefon, Safari/iPhone, hosting i realna sala treningowa nadal nie są zweryfikowane. T09 oznaczono `done` tylko lokalnie w uzgodnionym zakresie.

Wcześniej `npm test`, `npm run typecheck` i `npm run build` przeszły po implementacji; `DO_NOT_TRACK=1 npm run test:t09:local` oraz wariant z `T09_HTTP_BASE=http://localhost:3005` przeszły na lokalnym Auth/PostgREST i produkcyjnym Next. Sprawdzono A/B/anon, obcą serię, starą rewizję, atomowe serie dodatkowe, retry, rezerwację kosztu i odmowę bez budżetu. `DO_NOT_TRACK=1 npm run test:t05:local` przeszedł po migracji. Testy komponentów z opóźnionym wynikiem pozostają mockami; prawdziwa ewaluacja syntetycznego audio nie zastępuje telefonu. `DO_NOT_TRACK=1 npm run test:t06:local` dał 1 błąd starego testu rezerwacji T06 (`daily_budget`) z powodu istniejących prób w globalnym oknie 24 h; nie zmieniano tych danych. Pozostałe 2 testy przeszły. Brak testu fizycznego urządzenia i hostingu.

## Weryfikacja T06

Końcowe RUN_T06_LIVE=true npm run evaluate:t06: 12/12 szkiców, 90/90 pól, zero opuszczeń i dopowiedzeń, p50 6,223 s, p95 32,102 s, 13 674/8 430 tokenów wejścia/wyjścia i szacunek 0,005582 USD. npm test: 49 przeszło, 6 pominięto; npm run typecheck i npm run build: sukces. Lokalne testy Auth/API/Storage A/B/anon: 3/3; test HTTP z produkcyjnym buildem, XLSX, pytaniami i zatwierdzeniem: sukces. npm audit: 0 podatności. Wyniki prywatnych plików oraz niewykonane kontrole są w handoffie.

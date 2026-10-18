# Handoff — T14-R4 — minimalistyczny Postęp

- Data i autor: 2026-10-18, Codex; jeden wykonawca, bez innych agentów.
- Zadanie / status po sesji: T14-R4 review, uzgodniony zakres makiet wykonany.
- Branch / commit / stan zmian: main, c144213. Bez commit/push. Zastane liczne zmiany T13 i dokumentację konsultacji U zachowano; ta runda nie edytuje src, API, SQL ani konfiguracji usług.
- Poprzedni [handoff R3](2026-10-18-T14-R3-wybory-edytor-postep.md).

## Cel i wykonana praca

Zastosowano Impeccable i szczegółowy brief użytkownika. Usunięto osobny przycisk „Edytuj ćwiczenie” z listy Edytora. Cała karta, łącznie z parametrami, otwiera zachowany pełny formularz; Enter, anulowanie i Escape działają. Tytuł formularza może nadal brzmieć „Edytuj ćwiczenie”. To makieta lokalnego szkicu, nie zapis wersji planu w aplikacji.

Postęp ma teraz jeden jasny układ z dwoma przykładami obok siebie na desktopie i jeden pod drugim na telefonie: sztanga i podciąganie. Duży lewy tytuł, prosty dropdown ćwiczenia, segmenty metryk nad pojedynczą linią, wartości Y i daty X. Zakresy1M/3M/6M/1R/Wszystko pod osią X, domyślnie3M. Rekordy mają trzy przewijane kafle z datą i podpisem „Cała historia”. Nie zależą od aktualnego okna wykresu. Brak żółtego bannera, selektora stałego ciężaru i wykresu bąbelkowego.

Ciężar: Szacowany1RM domyślnie, Max Ciężar, Objętość. Masa ciała: Max Powtórzeń i Suma Powtórzeń. Jej PR to najdłuższa seria, max powtórzeń w treningu i najwięcej serii. Cały ekran ma lokalny Inter, zgaszoną zieleń, delikatne szarości i zaokrąglenia. Pinch przybliża daty; jeden palec przewija stronę. Kontrolki zoomu i własne daty przeniesiono do rozwijanych szczegółów. Klawiatura i poziome przewijanie PR pozostają dostępne.

W galerii nie wybiera się już Postępu A/B/C: dwa widoki pokazują treści tego samego układu. Stare ramki/źródła i opisy R3 pozostają historyczne. Wszystkie wcześniejsze potwierdzone ekrany zachowano. Profil i paleta nadal niewybrane.

## Dane i estymacja

Historie są demonstracyjne, nie pochodzą z konta lub PDF.24 daty od2025-11-01 do2026-10-14, luka w jednym wpisie sztangi bez zamiany na0. Wszystkie PR i linie wynikają z tych samych serii. Max100kg×3, szacowany rekord≈106,4kg, max objętość1480kg w innym treningu. Podciąganie:15 w serii,55 w treningu,5 serii. Brak danych i0 rozróżnione.

Nowy brief jawnie dopuszcza szacowany1RM jako analitykę. Proponowana metoda makiety korzysta z [oficjalnej tabeli Hevy](https://help.hevyapp.com/hc/en-us/articles/36954464726167-Understanding-Your-Estimated-One-Rep-Max-1RM-in-Hevy) dla1–10 powtórzeń, kg dzielone przez udział. Pozostałe liczby powtórzeń/brak kg dają brak estymacji. Nie jest to zatwierdzony algorytm domenowy. [Strong dokumentuje Brzyckiego](https://help.strongapp.io/article/133-1rm), zatem nie zakładamy identyczności wyników. Metoda nie zapisuje nic w Profilu: rzeczywisty datowany1RM do zaleceń procentowych i historyczne snapshoty pozostają oddzielone. Objętość to suma zewnętrznych kg×powtórzenia w sesji; masa ciała nie otrzymuje fikcyjnych kg.

## Zmienione pliki

- [t14-r4-ui.py](../design/t14-r4-ui.py), [t14-r4.css](../design/t14-r4.css), [t14-r4-interactions.js](../design/t14-r4-interactions.js): nowy układ, fixture'y, rekordy, metryki, daty i gesty.
- [t14-r3-ui.py](../design/t14-r3-ui.py), [t14-r3.css](../design/t14-r3.css): usunięcie przycisku z zachowaniem całej klikalnej karty i formularza.
- [t14-full-build.py](../design/t14-full-build.py), [t14-full-gallery.html](../design/t14-full-gallery.html): warstwa R4, dwa przykłady, potwierdzone wybory, R3 JS uruchamiany tylko dla Edytora.
- [t14-color-build.py](../design/t14-color-build.py), [t14-color-template.html](../design/t14-color-template.html), [t14-colors.html](../design/t14-colors.html): zachowane palety z bieżącym układem Postępu i wyborem ćwiczenia. [t14-color-verify.mjs](../design/t14-color-verify.mjs): aktualne selektory R4.
- [t14-r4-verify.mjs](../design/t14-r4-verify.mjs), [publiczny raport](../design/t14-r4-verification.json) i syntetyczne zrzuty t14-r4-*.png: bieżący odbiór makiet.
- [fonts](../design/fonts/README.md): oryginalny Inter/OFL1.1, licencja, manifest SHA256 i przypięty commit353b61b9f4430d5f420d56605a6e7993e0941470. Font jest osadzany w ramkach Postępu, aby działał również w sandboxowanym srcdoc. Bez npm i zależności produkcyjnej.
- README, PRODUCT, DECISIONS D043, ROADMAP, STATUS, CHANGELOG, TESTING i [specyfikacja](../design/t14-selected-spec.md): bieżące wymagania, fakty i granice. Bez migracji i zmian kontraktów aplikacji.

## Weryfikacja

Środowisko: desktopowy Node/Python, lokalne serwery, Playwright z Chrome headless. Chrome uruchomiono za zgodą automatycznej kontroli uprawnień. Nie wywoływano AI lub API produktu.

1. Generator `t14-full-build.py` uruchomiony na publicznych fixture'ach oraz z prywatnym `--data` i `--out` poza repo; następnie `t14-color-build.py` dla obu galerii. Python runtime: `/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`.
2. `node docs/design/t14-r4-verify.mjs`: publiczne64 stany×3 szerokości=192 kontrole PASS, bez errors/bad. Prywatnie to samo z `T14_GALLERY_URL=http://127.0.0.1:8792/` i `T14_REPORT_DIR` poza repo:124×3=372 PASS. Własny moduł Playwright można wskazać przez `T14_PLAYWRIGHT_MODULE`.
3. Runner: dolne parametry karty i Enter otwierają edytor, cancel nie zmienia danych; brak redundantnego przycisku. Dwa typy metryk, domyślny szacunek, położenie zakresów, pojedyncza linia, rzeczywiście załadowany Inter, PR całej historii, wartości fixture'ów i null/0 PASS. Zmiana okna nie zmienia PR. Syntetyczny pinch zmniejszył zakres7776000000→2474181646,6ms i przywrócił≈7776000000ms; pojedynczy palec przewinął84px. Klawiatura wykresu i przewijanie kafli PASS.
4. Cztery karty390×844: publiczne677,36px; prywatne677,36/692,86/677,36px przed końcem obszaru701px, PASS.
5. Prywatny `t14-color-verify.mjs`:216 kontroli szerokości, sześć palet, cztery karty, wybór/reload, ciemny formularz i przełączenie ćwiczenia zachowujące motyw PASS. Minimum kontrastu tokenów5,53 tekst/3,71 kontrolki. Publicznego runnera palet nie ponawiano w R4; jego wcześniejszy raport nie stanowi odbioru tej rundy.
6. Obejrzano zbiorczy Postęp z dwiema ramkami, mobilne oba typy i Edytor. Jedna partia poprawek: polska odmiana „5 serii” i promień aktywnego segmentu12px; końcowe runnery R4 powtórzone po niej. Początkowy mobilny zrzut po natywnym select zachowywał przewinięcie; końcowy prywatny kadr podciągania przechwycono ze świeżej ramki bez interakcji, od góry. Bez kolejnej rundy zmian UI.
7. AST full/R3/R4/colorbuild PASS; `node --check` JS R4, runnera R4/kolorów i skryptów zewnętrznych obu publicznych HTML PASS. Rozmiary/SHA256 fontu i licencji zgodne z manifestem. Publiczne HTML bez nazw prywatnego dokumentu PASS. Lokalne linki nowej dokumentacji i `git diff --check` sprawdzone na końcu.

Nie wykonano Safari lub fizycznego telefonu, pełnego audytu dostępności, prawdziwej analityki na historii właściciela, zapisu do bazy, testów API/builda produktu. Syntetyczne touch events nie zastępują urządzenia. Starsze runnery full/R2/R3 wymagają adaptacji przed użyciem na R4 (inne warianty i przycisk), a ich historyczne raporty nie dowodzą zgodności R4.

## Decyzje i zmiany planu

D043 zapisuje szczegółowy brief i zmianę wcześniejszego zakazu estymacji wyłącznie dla Postępu. D002 dla rzeczywistego1RM pozostaje. T14-R4 in_progress→review, bez zmiany T13. Inter i metoda szacowania udokumentowane; metoda produkcyjna pozostaje propozycją. Plan nie rozszerza się o automatyczne cele, społeczność lub usługi.

## Pozostała praca i blokery

Zlecony zakres makiet jest wykonany; brak kolejnego zadania wykonawczego przed feedbackiem. Użytkownik ocenia R4. Do późniejszej decyzji pozostają układ Profilu i paleta; brak blokera technicznego lokalnej prezentacji. Nie zatwierdzono wdrożenia do aplikacji, metody produkcyjnego1RM ani nowych źródeł prawdy. Niejasne parametry prywatnego źródła zachowują poprzednie oznaczenia, bez zgadywania.

## Następny krok

Ocena użytkownika na `http://127.0.0.1:8792/?screen=progress`; Edytor `?screen=editor`. Po konkretnych uwagach kontynuować T14-R4 tylko w makietach, od STATUS/specyfikacji i tego handoffu. Nie rozpoczynać src/T13-D/produkcji bez osobnego zlecenia.

## Stan środowiska

Pozostawiono działające serwery8791 (publiczne docs/design) i8792 (prywatne). Publiczny adres `http://127.0.0.1:8791/t14-full-gallery.html`. Osobna galeria kolorów prywatnie `/t14-colors.html`.

Prywatny katalog: `/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private`. PDF/odczyt, plan.json, źródłowe obrazy, index.html, t14-colors.html, raporty i zrzuty zostają tam. Nie kopiować ich do repo. Publiczne fonty/ilustracje mogą być kopiowane przez generator. Tymczasowe pliki skryptów zewnętrznych do kontroli składni w `/private/tmp/t14-*.html.outer.js`. Bez nowych usług, płatnych wywołań lub publikacji. Zastane zmiany robocze T13 pozostały niewysłane.

## Prompt dla kolejnego agenta

GPT-6.1 Sol / medium: ograniczona korekta makiet po feedbacku nie wymaga droższego poziomu. Prompt niczego nie uruchamia; użyć dopiero po otrzymaniu uwag.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. T14-R4 jest wykonane i czeka na ocenę; brak kolejnego zadania przed feedbackiem użytkownika. Po otrzymaniu uwag kontynuuj wyłącznie makiety. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/DECISIONS.md, docs/TESTING.md, docs/design/t14-selected-spec.md i docs/handoffs/2026-10-18-T14-R4-minimalny-postep.md. Pliki wykonawcze: docs/design/t14-r4-ui.py, t14-r4.css, t14-r4-interactions.js i t14-full-build.py. Zachowaj potwierdzone ekrany, edycję całą kartą oraz jasny Postęp dla ciężaru i masy ciała. Szacowany1RM jest analityką; datowany1RM profilu pozostaje ręczny. Metoda estymacji jest propozycją. Sprawdź zmienione interakcje,360/390/430px, cztery karty390×844, PR i pinch. Prywatne dane/zrzuty poza repo. Układ Profilu i paleta nadal niewybrane. Bez src/API/DB, T13-D, publikacji i płatnego AI. Aktualizuj dokumentację, handoff i identyczny prompt. Rekomendacja: GPT-6.1 Sol / medium — ograniczony zakres kontroluje koszt.
```

# Handoff — T14-R3 — wybory ekranów, edytor ćwiczenia i Postęp

- Data/autor: 2026-10-18, Codex, jeden projektant/integrator, bez innych agentów.
- Status: T14-R3 review, artefakty do oceny użytkownika. Postęp, układ Profilu i kolorystyka nadal bez wyboru.
- Git: main, zastany HEAD `c144213`, bez commit/push. Zachowano liczne zastane zmiany T13 i konsultacji U. Bez edycji src, API, migracji, package.json lub usług.
- Poprzednie handoffy: [U — konsultacja](2026-10-18-T14-U-konsultacja-ux.md), [K — kolorystyka](2026-10-18-T14-K-kolorystyka.md).

## Cel i wykonana praca

Użytkownik wybrał **Start A, Import C, Korektę A, Edytor A, Historię A i Logowanie C**, z opisanymi modyfikacjami. Zachowano wcześniejsze Plany/Podgląd/Szczegóły A i Zapis C. Galeria utrwala10 potwierdzonych ekranów niezależnie od localStorage; dodatkowe preferencje dotyczą tylko Postępu i Profilu. Kolorystyka również korzysta z potwierdzonych układów. To makiety i dokumentacja, nie wdrożenie produktu.

Import C: ikony źródeł wyśrodkowane, „Utwórz ręcznie” ma tę samą ikonę edycji co propozycja A. Korekta A: „Nazwy ćwiczeń i kolejność”. Edytor A: cała karta i jawny przycisk „Edytuj ćwiczenie” otwierają formularz pełnego ćwiczenia. Serie i powtórzenia mają proste przyciski zmian oraz ręczne zakresy; inne rodzaje zadania zachowują etykiety czasu/dystansu/AMRAP/źródła. Obciążenie, przerwa, indywidualne serie, opcjonalność, tempo, RPE/RIR, grupa i uwagi są dostępne bez przepisywania źródła. Pole nazwy ma fokus, Anuluj/Escape nie zmienia karty, zastosowanie i ponowne otwarcie zachowują lokalną zmianę. Formularz ma przewijane pola i zawsze widoczny przycisk zastosowania. Zmiana ekranu przywraca dane artefaktu; nie zapisujemy prywatnych szkiców w localStorage/API.

Postęp: trzy nowe propozycje na tej samej jawnie demonstracyjnej historii od listopada2025 do października2026:

- A: najwyższe kg z sesji oraz powtórzenia **tej samej** serii na drugiej osi czasu, z remisem rozstrzyganym większą liczbą powtórzeń.
- B: najlepsza liczba powtórzeń przy konkretnych kg oraz tabela osiągniętych kg dla1/3/5/8/10 powtórzeń w widocznym zakresie; brak wyniku pozostaje brakiem.
- C: każda seria jako punkt, oś Y to kg, rozmiar punktu to powtórzenia; dokładne dane dotknięciem/klawiaturą i tabelą.

Zakresy1/3/6 miesięcy,1 rok, Całość i własne daty. Dwa palce zmieniają okno czasu, wspólne dla obu wykresów A. Przyciski +/−/reset i Ctrl+wheel są alternatywą; myszą można przesunąć przybliżony zakres. Jeden palec zachowuje pionowe przewijanie ekranu. Punkt odwołuje się do faktycznej serii z syntetycznego zestawu, bez wyliczania1RM. Osobny przykład masy ciała nie otrzymuje0kg.

Profil: w trakcie pracy użytkownik doprecyzował, że rzeczywisty1RM może być ręcznie wpisywany niezależnie od treningów. Zachowano D002 i datę pomiaru. Wyniki serii są historią Postępu, a1RM jest potwierdzonym parametrem do obliczeń. Nie tworzymy sztucznego treningu z wpisu profilu, nie estymujemy1RM z wielu powtórzeń i nie zmieniamy historycznych celów. Początkowa sugestia powiązania rekordu z ustawieniem nie stała się kontraktem lub implementacją. Sam układ Profilu nadal A/B/C do wyboru.

## Źródła i interpretacja

Research zlecony przez użytkownika, odczyt2026-10-18, tylko źródła producentów:

- [Hevy](https://www.hevyapp.com/features/exercise-performance/): wybór metryki/czasu, cała historia i rzeczywiście osiągnięte rekordy według liczby powtórzeń.
- [Strong](https://help.strongapp.io/article/237-about-exercise-detail): historia, wykresy i rekordy jako odrębne widoki ćwiczenia.
- [Fitbod](https://fitbod.me/blog/exercise-history-and-records/): kilka metryk i dokładne wartości serii w wynikach. Nie przejęto estymowanej siły/1RM.
- [MDN touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) i [multi-touch](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Multi-touch_interaction): własny zoom wykresu i zachowanie pionowego gestu poza nim.

Propozycje są własną interpretacją dla Formy. Nie kopiowano ekranów/rastrów, nie instalowano biblioteki lub abonamentu. Nie dodano rankingu, społeczności lub automatycznych zaleceń. Skill impeccable: kontekst, clarify i craft-floor, zachowana tożsamość Operate; bez subagentów. Znany legacy format PRODUCT/brak buildPath nie był naprawiany przy okazji.

## Zmienione pliki

- [t14-r3-ui.py](../design/t14-r3-ui.py), [t14-r3-interactions.js](../design/t14-r3-interactions.js), [t14-r3.css](../design/t14-r3.css): treści i interakcje makiet. JS R3 dodawany tylko do edytora/Postępu, pozostałe ramki bez zbędnego skryptu.
- [t14-full-build.py](../design/t14-full-build.py): ładowanie R3 i potwierdzone układy w danych/galerii/kopiowaniu wyborów.
- [t14-color-build.py](../design/t14-color-build.py), [t14-color-template.html](../design/t14-color-template.html): przenoszenie potwierdzonych wyborów; generator danych prywatnych nadal odrzuca wyjście w repo.
- [t14-r3-verify.mjs](../design/t14-r3-verify.mjs), [raport publiczny R3](../design/t14-r3-verification.json), publiczne zrzuty `t14-r3-*.png`; aktualizacja [runnera kolorów](../design/t14-color-verify.mjs) do nowych selektorów wykresu i ciemnego formularza.
- Przebudowane syntetyczne `t14-full-gallery.html` / `t14-colors.html`. Prywatne odpowiedniki/raporty/zrzuty poza repo, w dotychczasowym forma-private. JSON/PDF nie zmieniano, bez odczytu konta/bazy.
- README, ROADMAP, STATUS, CHANGELOG, DECISIONS D042, TESTING i [specyfikacja](../design/t14-selected-spec.md). Historyczne propozycje i raporty R2/K zachowano.

## Weryfikacja

Bundled Python: `/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`. Generator publiczny bez `--data`; prywatny z `--data <forma-private/plan.json> --out <forma-private/index.html>`.

```sh
node docs/design/t14-r3-verify.mjs
T14_GALLERY_URL=http://127.0.0.1:8792/ T14_REPORT_DIR=/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private node docs/design/t14-r3-verify.mjs
T14_COLOR_URL=http://127.0.0.1:8792/t14-colors.html T14_REPORT_DIR=/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private node docs/design/t14-color-verify.mjs
node --check docs/design/t14-r3-interactions.js
node --check docs/design/t14-r3-verify.mjs
git diff --check
```

- Chrome headless publiczny64 stany ×360/390/430 =192 kontroli; prywatny124×3 =372. Brak overflow, brak błędów JS w końcowych przebiegach.
- Cztery pełne karty390×844: prywatnie677,36/692,86/677,36 przy końcu obszaru701px; syntetycznie677,36px w obu jednostkach.
- Potwierdzone wybory i centrowanie ikon PASS. Edytor: cała karta, fokus, cancel, liczby/zero kg/tempo, oddzielne serie, ponowne otwarcie i Escape PASS. Lokalne zastosowanie nie jest testem API/publikacji.
- Postęp: wszystkie zakresy, własna data i błędny zakres, przybliż/oddal/reset, punkt przez Enter, masa ciała bez0kg PASS. Syntetyczny multitouch zawęził okno z29 980 800 000ms do9 539 346 116ms i przywrócił je, a gest jednym palcem przewinął87/88px. To prawdziwe zdarzenia wejściowe CDP w Chrome, nie fizyczny telefon lub Safari.
- Prywatne palety:216 kontroli, cztery karty wszystkich palet/jednostek, ciemny formularz i zachowanie palety po przerysowaniu nowego wykresu PASS. Kontrast72 par tokenów nadal min5,53 tekst /3,71 kontrolki, nie pełny audyt wszystkich nowych stanów.
- Pierwszy runner R3 zgłosił wielokrotne deklaracje `track` w probe wielokrotnie używającym document.write. Testy interakcji przeszły już wtedy, ale przebieg był FAIL. Poprawiono izolację wyłącznie testowych skryptów przez blok leksykalny; finalne dwa przebiegi bez błędów. Nie maskowano pageerror i nie zmieniano kodu produktu z tego powodu.
- Zbiorczo obejrzano Import, cały formularz, Postęp i telefon. Jedna partia poprawek: stały nagłówek/przycisk formularza i legenda C; potwierdzono finalny formularz oraz dolne wykresy/tabele i ikonę ręcznego tworzenia. Bez dalszej pętli polish.
- AST Pythonów, składnia JS/JS wygenerowanego artefaktu, lokalne linki nowej dokumentacji, publiczne znaczniki prywatności i diff whitespace PASS.
- Nie wykonano produktu build/test/API/DB, płatnego AI, prawdziwego importu, telefonu/Safari lub pełnego odbioru dostępności. Starsze full/r2 verify nie są kompatybilnym odbiorem R3 (inne selektory, potwierdzone warianty i zakresy). TESTING wskazuje obecny runner. Publicznego pełnego runnera kolorów nie ponawiano w R3; aktualne216 dotyczy galerii prywatnej.

## Decyzje, ograniczenia i następny krok

D042 i T14-R3 review. Kolejne decyzje użytkownika dotyczą Postępu A/B/C, układu Profilu i palety. Nie ma technicznego blokera obecnego review. Niepełne pokrycie bibliotecznych ilustracji nadal z R2: neutralny znacznik przy braku dokładnego wariantu; bez zgadywania innego ćwiczenia. Publikacja/implementacja produktu wymaga osobnego zlecenia, nie uruchamiaj T13-D.

## Środowisko

Prywatna galeria: `http://127.0.0.1:8792/?screen=progress`, `?screen=editor` / `?screen=import`; kolory `http://127.0.0.1:8792/t14-colors.html`. Katalog: `/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private`. Publiczna: `http://127.0.0.1:8791/t14-full-gallery.html`. Serwery8791/8792 pozostawione z wcześniejszych sesji; nie tworzono nowych. Prywatny proces43569. Brak deploy/commit/push, instalacji lub zmian sekretów. `/private/tmp/t14-r3-confirm.mjs` jest pomocniczym odczytem zrzutów, nie źródłem artefaktu.

## Prompt dla kolejnego agenta

Rekomendacja GPT-6.1 Sol / medium — konkretne poprawki makiet i celowane sprawdzenia ograniczają koszt. Prompt niczego nie uruchamia.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T14-R3 po feedbacku użytkownika, wyłącznie w makietach. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/DECISIONS.md, docs/TESTING.md, docs/design/t14-selected-spec.md i docs/handoffs/2026-10-18-T14-R3-wybory-edytor-postep.md. Zachowaj A/A/A/C oraz Start/Korektę/Edytor/Historię A i Import/Logowanie C. Rzeczywisty1RM pozostaje ręczny z datą. Postęp, układ Profilu i paleta są niewybrane — nie zgaduj. Pliki: docs/design/t14-r3-ui.py, t14-r3-interactions.js, t14-r3.css i t14-full-build.py. Prywatne dane/zrzuty pozostają poza repo. Po zmianach sprawdź celowane interakcje,360/390/430px,cztery karty390×844, daty i pinch bez utraty pionowego scrolla. Bez src, API/DB, publikacji, T13-D lub płatnego AI. Aktualizuj dokumentację, handoff i identyczny prompt. Model: GPT-6.1 Sol / medium — celowany zakres kontroluje koszt.
```

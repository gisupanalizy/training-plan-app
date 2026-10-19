# Handoff — T14-R2 — korekta importu, gesty, ilustracje i wykresy

Aktualizacja z kolejnej sesji: [T14-K](2026-10-18-T14-K-kolorystyka.md) opisuje osobną galerię palet i skuteczne ponowienie publicznego R2 po przywróceniu kontroli uprawnień. Wszystkie siedem grup PASS; wcześniejszy błąd drag nie odtworzył się i jego przyczyna nie jest ustalona. Poniższy zapis pozostaje historią pierwotnej sesji, włącznie z jej nieudanymi próbami.

- Data i autor: 2026-10-18, Codex, jeden projektant/integrator, bez innych agentów.
- Zadanie/status: T14-R2 review. T14-S/P review; A/A/A/C zachowane, pozostałe osiem wyborów otwarte.
- Git: main, zastany HEAD `c144213`; bez commit/push. Liczne zastane zmiany T13 i konfiguracji pozostawione. Nie edytowano src, migracji, package.json ani usług.
- Poprzedni [handoff T14-P](2026-10-18-T14-pelna-galeria-prywatny-plan.md).

## Cel i wykonana praca

Zastosowano skill impeccable (Operate i clarify), zachowując istniejącą stylistykę Forma i zakres samodzielnych HTML. To makiety do oceny, bez implementacji produktu.

1. Korekta importu ma trzy odrębne treści: nazwy/kolejność/grupy, cele/serie/obciążenia/przerwy/superserie, a potem wszystkie jednostki i status potwierdzeń. Wejście w zakładkę nie daje potwierdzenia; przyciski potwierdzają i przechodzą dalej. Zmiana nazwy i kolejności jest lokalna dla aktualnej ramki, nie zmienia modelu ani API. Publikacja pozostaje nieaktywna przy niejasnościach źródła.
2. Cała karta ćwiczenia, także parametry w dolnym wierszu, jest natywnym przyciskiem ze stanem focus. Dodatkowe akcje edytora są osobnymi kontrolkami, bez zagnieżdżania przycisków.
3. Dotyk jest natywnym poziomym przewijaniem z przyciąganiem. Dodano drag myszą z progiem i przechwyceniem wskaźnika oraz ochroną kliknięcia po przeciąganiu, także od przycisku. Zachowano strzałki/klawiaturę; pionowy gest nad karuzelą przewija ekran.
4. Pełna galeria korzysta z oryginalnych lokalnych SVG Workout Guide.17 plików z przypiętego commita, SHA-256 i atrybucją. Grafiki CC BY-SA 4.0, kod biblioteki MIT. Nie instalowano pakietu npm, subskrypcji ani zależności aplikacji. Brak dokładnego wariantu oznacza neutralne „ĆW / WŁASNE”; m.in. statycznego stania na rękach nie zastępujemy pompką w staniu. Niepełne pokrycie nadal wymaga review.
5. Postęp A: wpisany ciężar i powtórzenia; B: objętość porównywalnych serii kg·powt.; C: ciężar i wykonane/pominięte/oczekujące serie wymagane. Opcjonalne/dodatkowe osobno. Wszystkie mają jednostki, daty, tabelę, filtry ćwiczenia i4/8 tygodni oraz odczyt punktu kliknięciem/Enter. Brak danych jest luką, nie zerem. Wykonanie w C ma jawnie stały zakres ostatnich czterech tygodni. Dane oznaczono jako demonstracyjne; nie są historią właściciela ani estymacją1RM.

## Zmienione pliki

- [t14-full-build.py](../design/t14-full-build.py): ładuje doprecyzowania R2, przekazuje potwierdzenia i obsługuje adres `?screen=...`.
- [t14-r2-ui.py](../design/t14-r2-ui.py): nowe treści kroków, pełne karty, ilustracje, drag i wykresy; wykonuje się w kontekście generatora.
- [t14-r2-verify.mjs](../design/t14-r2-verify.mjs): celowane interakcje i zrzuty. Po nieudanej publicznej próbie dodano dokładniejsze wartości do komunikatu błędu; nie ponowiono runnera po tej zmianie diagnostyki.
- [exercise-assets/README.md](../design/exercise-assets/README.md): pochodzenie i ograniczenia; SVG, manifest i kopie dokumentów licencji w tym katalogu.
- `t14-full-gallery.html`, publiczne `t14-full-*.png`, `t14-full-verification.json`: odświeżona galeria syntetyczna i jej pełny runner.
- ROADMAP, STATUS, CHANGELOG, DECISIONS D040 i [specyfikacja](../design/t14-selected-spec.md). Oryginalne galerie pozostawiono jako archiwum.
- Prywatny `index.html`, lokalna kopia zasobów, zrzuty `t14-r2-*.png` i raporty pozostają poza repo w katalogu poniżej. Prywatnego JSON/PDF nie zmieniano, nie odczytywano konta/bazy.

## Weryfikacja

Interpreter generatora: `/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`. Playwright z bundled runtime, Chrome headless. Generator publiczny bez argumentów, prywatny z `--data <forma-private/plan.json> --out <forma-private/index.html>`. Oba wygenerowane pomyślnie. Systemowy Python wcześniej dawał błąd kodowania; nie zmieniano instalacji systemowej.

Polecenia:

```sh
node docs/design/t14-full-verify.mjs
T14_GALLERY_URL=http://127.0.0.1:8792/ T14_REPORT_DIR=/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private node docs/design/t14-full-verify.mjs
T14_GALLERY_URL=http://127.0.0.1:8792/ T14_REPORT_DIR=/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private node docs/design/t14-r2-verify.mjs
node docs/design/t14-r2-verify.mjs
node --check docs/design/t14-r2-verify.mjs
git diff --check
```

- Pełny runner publiczny:64 stany ×360/390/430 =192 kontroli, bez overflow i błędów JS, przepływy importu/korekty/preferencji/reload/null/0/logowania, syntetyczny touch i klawiatura PASS.
- Pełny runner prywatny:124 stany ×3 =372 kontrole, te same grupy PASS. Czwarta karta390×844 kończy się677,36/692,86/677,36 px przy końcu obszaru701 px.
- Prywatny R2: siedem grup PASS — różne kroki i potwierdzenia, lokalne obrazy, kliknięcie parametrów, Enter całej karty, drag myszą lewo/prawo od przycisku bez nawigacji, wykresy/filtry/punkty, dotyk poziomy i pionowy. Cztery ilustracje załadowane w sprawdzonym podglądzie; pionowy scroll79 px, błędy JS0.
- Obejrzano wspólnie kroki0/1/2, warianty Postępu, plan i szczegóły. Po jednej partii korekt ponownie obejrzano finalny plan, krok serii i Postęp. Zrzuty prywatne nie weszły do repo.
- Publiczny R2 **FAIL na teście drag myszą**: `Mouse drag opens plan or fails`. Test nie podał jeszcze scrollLeft/screen, więc przyczyna nieustalona. Pozostała część tego przebiegu nie została wykonana; nie ma publicznego raportu pełnego R2 PASS. Prywatny przebieg przeszedł wcześniej. Nie zmieniaj UI na podstawie przypuszczenia o przyczynie.
- Próba dalszej diagnozy Chrome została **niewykonana** przez automatyczny review: limit usługi/usage limit, nie ocena niebezpieczeństwa. Nie obchodzono kontroli, nie uruchomiono alternatywnej drogi do tego samego działania. Po przywróceniu usługi powtórzyć publiczny R2 z rozszerzonym komunikatem. Tymczasowy probe nie został utworzony przez odrzucone polecenie.
- AST obu Pythonów, `node --check`,17 hashy SHA-256, kontrola braku prywatnego tytułu/nazwy źródła w publicznym HTML/generatorach i `git diff --check` PASS. Sprawdzano też lokalne linki nowej dokumentacji.
- Nie uruchamiano testów produktu/builda, API, bazy, płatnego AI ani prawdziwego importu. Fizyczny telefon/Safari niesprawdzone. Mysz/klawiatura/syntetyczny touch nie stanowią odbioru urządzenia.

Początkowe próby SVG z reklamowanego CDN pakietu1.0.0 dały404. Ostateczne pliki pochodzą z oficjalnego repozytorium, commit `aac599224bb9780305239607ef98540b7e0ce389`. Białe linie rysunków wymagają ciemnego tła. Pierwsza próba `page.setContent` na dokumencie SVG nie obsługiwała document.open; kontaktowy podgląd wykonano na HTML. Te próby nie są zaliczonymi testami końcowymi.

## Decyzje i zmiany planu

D040 zapisuje jawne wymagania użytkownika, propozycję biblioteki i zakres wykresów. T14-R2 in_progress → review do oceny mock-upów, z otwartym sprawdzeniem publicznego drag i niepełnym pokryciem ilustracji. Nie przyjęto kolejnych wariantów za użytkownika. Nie przejęto T13-D i nie zmieniono kontraktów danych/API.

## Pozostała praca i następny krok

Po przywróceniu automatycznej kontroli uprawnień powtórzyć publiczny `t14-r2-verify.mjs`, ustalić scrollLeft/screen/pozycję wskaźnika i rozwiązać potwierdzoną przyczynę. Potem oprzeć dalsze dopracowanie na feedbacku użytkownika i jego wyborach pozostałych ekranów. Nie powtarzać całej regresji produktu. Brakujące ilustracje wymagają dokładnego dopasowania i sprawdzenia pochodzenia; nie zastępuj innym ruchem. Wygląd/zakres obecnych makiet jest gotowy do przeglądu.

## Stan środowiska

- Publicznie lokalnie: `http://127.0.0.1:8791/t14-full-gallery.html`.
- Prywatnie lokalnie: `http://127.0.0.1:8792/`, `?screen=review`, `?screen=progress`, `?screen=plans`.
- Prywatny katalog: `/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private`. Zawiera źródło PDF, JSON, strony źródła, HTML, zasoby i raporty. Nie przenosić ich do repo.
- Serwery8791/8792 pozostawiono do przeglądu użytkownika; prywatny proces z poprzedniej sesji43569. Ostatnio otwarcie w panelu Codex zwracało queued; linki działają w istniejącej przeglądarce. Brak deploy, nowych usług, zmian sekretów lub publikacji. Zmiany zastane innych etapów pozostawione.

## Prompt dla kolejnego agenta

Rekomendacja: GPT-6.1 Sol / medium — ograniczony zakres prezentacji i konkretna diagnoza pozwalają kontrolować koszt. Prompt nie uruchamia agenta; następny etap zależy od odblokowania testu lub feedbacku użytkownika.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T14-R2 wyłącznie w mock-upach. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, ROADMAP.md, WORKFLOW.md, UX.md, DECISIONS.md, TESTING.md, handoff docs/handoffs/2026-10-18-T14-R2-import-gesty-wykresy.md i docs/design/t14-selected-spec.md. Pliki robocze: docs/design/t14-full-build.py, t14-r2-ui.py, t14-r2-verify.mjs. Po przywróceniu automatycznej kontroli uprawnień zdiagnozuj nieudany publiczny test drag; prywatny przeszedł. Nie obchodź limitu. Zachowaj A/A/A/C, różne kroki importu, pełne karty, gesty i wykresy. Dalsze zmiany wykonuj według feedbacku użytkownika; nie zgaduj brakujących wyborów. Prywatne dane i zrzuty trzymaj poza repo w forma-private wskazanym w handoffie. Odbiór: celowane interakcje, 360/390/430 px po zmianach układu, cztery karty390×844, dokładne ilustracje z atrybucją. Bez src, T13-D, publikacji i płatnego AI. Zaktualizuj dokumentację, handoff i identyczny prompt końcowy. Model: GPT-6.1 Sol / medium — konkretny zakres ogranicza koszt.
```

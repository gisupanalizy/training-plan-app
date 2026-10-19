# Handoff — T14-R6 — kliknięcie punktu myszą

- Data/autor: 2026-10-18, Codex, jeden wykonawca.
- Zadanie: T14-R6 review. Zlecona poprawka wykonana, bez rozpoczęcia T15.
- Git: main, c144213, bez commit/push; zastane niewysłane zmiany T13/U zachowane. Bez src/API/DB/CSS lub usług.
- Poprzedni [handoff R5/P](2026-10-18-T14-R5-T15-P-interakcje-i-plan.md).

## Cel i wykonana praca

Użytkownik zgłosił, że klik punktu jedynie go zaznacza. Odtworzono zwykłym `page.mouse.click` w faktycznym iframe prywatnej galerii. Log zdarzeń przed zmianą: pointerdown w `circle.r4-point`, pointerup i click w `svg.r4-plot`; informacja pozostawała hidden. Natychmiastowe setPointerCapture przejmowało klik do przesuwania wykresu. Poprzedni R5 sprawdzał dotyk i klawiaturę, nie ujawnił błędu myszy.

Capture odłożono do rzeczywistego drag po progu8px. Zwykły klik trafia w punkt, a dotychczasowy dymek pokazuje datę/wartość/źródłową serię dla estymacji/kg. Klik poza punktem zamyka, drag przesuwa daty bez otwierania. Nowy celowy klik lub pojedynczy tap resetuje blokadę poprzedniego gestu, żeby nie gubić pierwszego odczytu po drag/pinch. Wymagania D044, Noc, Profil A i prywatność pozostają bez zmian; nowa decyzja produktowa nie była potrzebna.

## Zmienione pliki

- [t14-r4-interactions.js](../design/t14-r4-interactions.js): odłożony pointer capture i reset blokady nowego gestu. Bez zmian DOM/CSS/metryk lub obliczeń.
- [t14-r6-verify.mjs](../design/t14-r6-verify.mjs), [publiczny raport](../design/t14-r6-verification.json) i syntetyczne `t14-r6-mouse-iframe.png`, `t14-r6-point-a.png`, `t14-r6-point-b.png`: nowy test myszy i widoczności.
- Przebudowane `t14-full-gallery.html` i `t14-colors.html`; prywatne odpowiedniki poza repo. Prywatny raport R5/zrzuty ponowione bez kopiowania do repo.
- STATUS, ROADMAP, CHANGELOG, TESTING, selected-spec, plan T15 (regresja myszy w bramce E) i ten handoff.

## Weryfikacja

- Publiczny/prywatny build: Python runtime `docs/design/t14-full-build.py`, prywatnie `--data` i `--out` poza repo.64 publiczne/124 prywatne ramki i obie galerie kolorów wygenerowane.
- `node docs/design/t14-r6-verify.mjs`: **PASS**, oraz wariant z `T14_GALLERY_URL=http://127.0.0.1:8792/` i `T14_REPORT_DIR` poza repo: **PASS**. Chrome headless/Playwright, rzeczywiste zdarzenia myszy bez force lub programowego click.
- W każdej galerii5 metryk w dwóch sandboxowanych iframe: widoczny dymek utrzymany po propagacji zdarzenia, prawidłowa data i źródłowa seria dla kg/estymacji, prostokąt mieszczący się w obszarze przewijania. Pusty wykres i nagłówek zamykają. Dwa testy drag: daty się przesuwają, nie otwierają dymku; następny klik działa.6 stanów360/390/430px dla myszy/klawiatury bez overflow. Pinch przybliża i pierwszy tap po nim otwiera informację. Brak błędów JS.
- Prywatny `t14-r5-verify.mjs`: **PASS**, pomoc1RM, tap/zamykanie, pochodzenie punktów, Noc/Profil A i swipe obu rzędów PR104→0px. Nie ponawiano publicznego R5 lub pełnego R4/palet: układ i tokeny nie zmieniły się.
- Pierwszy setup R6 klikał już aktywny Szacowany1RM, otwierając pomoc i zasłaniając testowany punkt. Runner przerwano na timeout, poprawiono wyłącznie setup: wybór metryki tylko gdy nieaktywna. Następny publiczny/prywatny R6 w całości PASS. Izolowany probe potwierdził po poprawce UI pointerdown/up/click w circle oraz widoczność informacji po propagacji.
- Jedna zbiorcza ocena zrzutów desktopowej galerii z dwoma dymkami i390px z dokładnym wynikiem/serią. Wygląd bez zmian i dymki czytelne. Bez dalszej rundy polish.
- Końcowo `node --check` interakcji/runnera R6 i skryptów zewnętrznych wygenerowanych galerii, lokalne linki nowego handoffu/specyfikacji, brak nazw prywatnego źródła w publicznych HTML oraz `git diff --check`: PASS.

Nie wykonano fizycznego telefonu/Safari, backendu, testów/builda produktu, prawdziwego konta/importu, płatnego AI, zdalnych migracji lub publikacji. Syntetyczny dotyk i zdarzenia myszy Chrome nie dowodzą zgodności wszystkich urządzeń. Nie uruchomiono innych agentów.

## Następny krok i środowisko

Zgłoszona poprawka jest gotowa do oceny po odświeżeniu `http://127.0.0.1:8792/?screen=progress`. Brak dalszego zadania w zakresie błędu. Po osobnym zleceniu możliwy T15-A według [planu](../T15_UI_IMPLEMENTATION.md) i [promptu A](../prompts/T15-A.md), bez nowych wyborów wyglądu. Techniczny kontrakt analityki pozostaje do E/I, nie blokuje A.

Serwery8791/8792 pozostawiono. Prywatne pliki/raporty/zrzuty w `/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private`. Probe przed poprawką `t14-r6-mouse-before.png` tylko tam. Publiczne zrzuty mają wyłącznie syntetyczne dane. Bez uploadu lub wysłania zmian.

## Prompt dla kolejnego agenta

Do późniejszego ręcznego użycia, bez automatycznego startu. Sol/medium oszczędza koszt przy gotowym, ograniczonym fundamencie.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Po zleceniu wdrożenia wykonaj wyłącznie T15-A według docs/prompts/T15-A.md. Przeczytaj AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/DECISIONS.md, docs/TESTING.md, docs/T15_UI_IMPLEMENTATION.md i docs/handoffs/2026-10-18-T14-R6-klik-punktu-mysza.md. Zachowaj zastane zmiany, Noc, Profil A i kontrakty T13. Zakres: fundament, AppShell, font/licencje i wspólne UI; bez B–G. Sprawdź typy/testy/build,360/390/430px, kontrast/fokus i brak jasnego błysku. Prywatne dane poza repo; bez innych agentów, płatnego AI lub publikacji. Zapisz rzeczywiste bramki/ograniczenia, dokumentację, handoff i identyczny prompt końcowy. Model: GPT-6.1 Sol / medium — ograniczony zakres zmniejsza koszt.
```

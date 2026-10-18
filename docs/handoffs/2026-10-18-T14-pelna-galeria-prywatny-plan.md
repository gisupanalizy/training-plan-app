# Handoff — T14-S/P — pełna galeria i prywatny plan

- Data i autor: 2026-10-18, Codex — jedyny wykonawca, bez agentów.
- Status: T14-S/P review; A/A/A/C potwierdzone, pozostałe osiem wyborów otwarte.
- Git: main, HEAD c144213; bez commit/push. Zachowano cudze niecommitowane A/B/C/T13-P i hooki. Brak zmian src, globals.css, SQL, package.json, .env i usług.
- Wcześniejszy [handoff T14](2026-10-18-T14-mockupy-ui.md); niezależny [T13-C](2026-10-18-T13-C-prowadzenie-treningu.md).

## Cel i wykonana praca

Użytkownik wybrał Plany A + swipe, Podgląd A, Szczegóły A, Zapis C. Następnie zlecił użycie wskazanego PDF i potwierdził pełny zestaw: Start, Import, Korekta, Edytor, Historia, Postęp, Profil, Logowanie. Ponownie wskazał impeccable; użyto go wraz ze skill pdf. Nie uruchamiano agentów ani generowania obrazów/AI.

Powstał połączony syntetyczny mock-up czterech ekranów z trzema kartami planów, następnie pełna galeria: cztery ustalone ekrany i24 nowe warianty. Prywatny wariant korzysta z tabel PDF odczytanych lokalnie i sprawdzonych na renderach. Zachowuje ćwiczenia, zakresy/złożone bloki serii, superserie, porady, uwagi i oryginał. Nie jest odczytem istniejącego szkicu DB ani nowym importem przez API. Opis zdrowotny nie został włączony do modelu makiet.

Procenty są intensywnością źródłową, bez zgadywania1RM/kg. X/UM pozostają do wyjaśnienia; publikacja w korekcie jest nieaktywna. Historia/postęp są oznaczoną demonstracją, nie wynikami właściciela. Zapis i login są symulacjami. Preferencje są lokalne, a kopiowanie nie wysyła wiadomości.

## Zmienione pliki

- [Połączone cztery ekrany](../design/t14-selected.html), [generator](../design/t14-selected-build.py).
- [Pełna galeria syntetyczna](../design/t14-full-gallery.html), [generyczny generator](../design/t14-full-build.py).
- [Runner](../design/t14-full-verify.mjs), [publiczny raport](../design/t14-full-verification.json), publiczne zrzuty docs/design/t14-full-{home,import,review,editor,history,progress,profile,login,plan,mobile}.png — wyłącznie dane syntetyczne.
- [Specyfikacja](../design/t14-selected-spec.md), README, UX, ROADMAP, STATUS, DECISIONS(D039), CHANGELOG i ten handoff.
- Oryginalna galeria A/B/C i poprzedni handoff pozostają historyczne. Generator reużywa definicje t14-build-mockups.py, bez przepisywania pierwotnej galerii.

## Prywatne pliki poza repo

Katalog: `/Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private`, uprawnienia700. Zawiera index.html, plan.json, source.pdf, source-3/4/5.png, README oraz prywatne zrzuty/raport t14-full-*. Początkowe ekstrakcje są w /private/tmp/forma-t14-private. Nie kopiować tych treści do repo.

Oglądanie: http://127.0.0.1:8792/. Odtworzenie: Python runtime desktopowego, `docs/design/t14-full-build.py --data <ten katalog>/plan.json --out <ten katalog>/index.html`. Publiczną wersję generuje uruchomienie bez argumentów. Prywatne obrazy stron muszą być obok HTML. Generator odrzuca prywatny output w repo. Pole Ekran wybiera nowe powierzchnie; Trening/Ćwiczenie otwiera właściwą część źródła.

## Weryfikacja

- pdfplumber runtime, render Poppler, ogląd właściwych stron i porównanie komórek. Ostrzeżenia FontBBox nie zablokowały odczytu; brak AI i odczytu konta.
- `T14_GALLERY_URL=http://127.0.0.1:8792/ T14_REPORT_DIR=<prywatny katalog> node docs/design/t14-full-verify.mjs`: PASS,124 stany ×360/390/430 =372 kontrole, bez overflow/pageerror.
- `node docs/design/t14-full-verify.mjs`: PASS dla syntetycznego localhost8791,64 stany/192 kontrole, bez overflow/pageerror.
- Oba przebiegi: import→trzy kroki, blokada publikacji przy niejasnościach, źródło/propozycja, preferencja po reload/reset, wynik0 i puste kg, symulacja loginu, galeria390px. Syntetyzowany dotyk Chromium lewo/prawo i klawiatura ArrowRight — nie sam screenshot.
- Prywatny Podgląd390×844: czwarte karty do677,36/692,86/677,36px przy obszarze do701px. Cztery pełne karty mieszczą się we wszystkich jednostkach; problem2px A usunięty bez zmiany bramki T13.
- Zbiorczy ogląd ośmiu nowych ekranów; po korekcie [hidden] i gęstości kart potwierdzono końcowe zrzuty planu/importu/korekty/wąskiej galerii. Prywatne obrazy tylko poza repo.
- AST generatorów i `node --check` runnera PASS. Końcowa kontrola linków/składni/prywatności dopisana po wykonaniu.

Wcześniejsze niezaliczone próby: systemowy Python zgłaszał kodowanie mimo poprawnego UTF-8/AST; runtime działał, przyczyny nie ustalono. Nieucieczone nowe linie w funkcji kopiowania wyborów powodowały błąd HTML/JS — naprawiono. Pierwszą próbę korekty diagnostyki przerwał IndexError; poprawkę później faktycznie zastosowano. Runner zrzutów czekał na odłączony iframe — użyto aktualnego frameLocator. Pierwszy końcowy runner miał niejednoznaczny selektor dwóch przycisków kroku; doprecyzowano go, końcowe przebiegi PASS. Pierwszy zapis tego handoffu systemowym Pythonem nie powiódł się z błędem kodowania; zapis przez runtime przeszedł.

Nie uruchamiano testów/builda aplikacji, bazy, mikrofonu, prawdziwego importu lub AI. Nie sprawdzono fizycznego telefonu/Safari ani klawiatury systemowej. Nie zamyka to T13-D/E/T10-R1/T11.

## Decyzje i następny krok

D039 confirmed: A/A/A/C, swipe oraz zakres pełnego zestawu. T14-S/P in_progress→review. Pozostałe osiem wyborów pozostaje otwartych. Wybrać je w galerii i skopiować do chatu. Po feedbacku połączyć/dopracować makiety i specyfikację. Implementacja src i publikacja wymagają osobnego zlecenia. Część pomocniczych kontrolek tylko objaśnia przyszłą akcję; nie udaje gotowego backendu ani trwałości szkiców.

## Stan środowiska

Serwer8791 nadal pokazuje tylko docs/design. Własny serwer8792 (sesja43569) jest związany127.0.0.1 i udostępnia prywatny katalog wizualizacji; pozostaje do review. Bez zmiany cudzych procesów, Supabase i chmury. Bez commit/push, publikacji i nowych płatnych prób. Prywatne dane/zrzuty poza repo.

## Prompt dla kolejnego agenta

GPT-6.1 Sol / medium — oszczędny wybór do ograniczonej pracy prezentacyjnej, bez trwałości danych.

```text
Projekt: /Users/jakub.olech/GIT/apka-plan-treningowy. Kontynuuj T14-P po feedbacku użytkownika: połącz wybrane warianty pozostałych ośmiu ekranów z zatwierdzonym A/A/A/C i swipe planów, nadal jako mock-upy oraz specyfikację. Zacznij od AGENTS.md, README.md, docs/STATUS.md, ROADMAP, WORKFLOW, UX, DECISIONS, TESTING, docs/handoffs/2026-10-18-T14-pelna-galeria-prywatny-plan.md oraz docs/design/t14-selected-spec.md. Użyj impeccable. Brakuje wyborów nowych ekranów — odczytaj wiadomość użytkownika; nie zgaduj brakujących decyzji. Prywatna galeria i plan.json są w /Users/jakub.olech/.codex/visualizations/2026/10/17/01a14c10-797f-79b2-b07c-aec696553f35/forma-private; nie kopiuj ich treści ani zrzutów do repo. Kryteria: spójny wybrany zestaw, wierne dane źródła, brak zgadywania kg/1RM, 360/390/430px, cztery karty390×844, gesty i klawiatura. Zachowaj cudze zmiany, zaktualizuj dokumentację i handoff z identycznym promptem w odpowiedzi. Implementacja aplikacji i publikacja wymagają osobnego zlecenia; nie zaczynaj T13-D ani płatnego AI. Model: GPT-6.1 Sol / medium — ograniczona praca prezentacyjna kontroluje koszt, bez zmian trwałości danych.
```

Końcowa kontrola: AST generatorów, node --check runnera, 126 lokalnych linków, raporty publiczny/prywatny, zgodność promptu, brak nazwy/prywatnych długich porad z PDF w docs/design oraz próba odmowy prywatnego outputu do repo: PASS. git diff --check PASS.

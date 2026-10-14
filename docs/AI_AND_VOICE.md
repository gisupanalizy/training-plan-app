# Import AI i obsługa głosowa

Stan źródeł: 2026-10-13. Import T06 jest wykonany lokalnie i sprawdzony z mockiem w testach A/B/anon oraz HTTP. Prawdziwy model przeszedł 12 syntetycznych przypadków, a trzy prywatne pliki PDF/XLSX dały szkice z pytaniami do wyjaśnienia. Wyniki, koszt i ograniczenia są w [T06_IMPORT](T06_IMPORT.md). T09 ma lokalny przepływ głosowy oraz [prawdziwy raport OpenAI](reports/2026-10-12-T09-live.json) na syntetycznych danych. Fizyczny mikrofon i telefon pozostają niesprawdzone.

## Podział odpowiedzialności

PDF/XLSX/obraz/tekst → ekstrakcja struktury → walidacja → szkic i pytania do korekty → zapis planu.

Nagranie → transkrypcja → tekst + kontekst ekranu → propozycja komendy → walidacja → podgląd → zatwierdzony zapis.

Import używa Responses API z wejściem plikowym/obrazowym i Structured Outputs. Schemat ogranicza kształt odpowiedzi, ale nie gwarantuje zgodności z dokumentem. Aplikacja obsługuje odmowę, niepełny wynik, błąd i timeout, bez zapisywania częściowego planu jako kompletnego. Adapter jest wyłączony bez klucza i budżetu.

Źródła: [File inputs](https://developers.openai.com/api/docs/guides/file-inputs), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

## Głos w pierwszej wersji

Przycisk mikrofonu rozpoczyna nagranie, drugi kończy. Użytkownik widzi czas i może anulować. Wybór dostępnego formatu nagrania musi działać na rzeczywistych telefonach testerów; brak uprawnień lub mikrofonu prowadzi do wpisywania tekstu.

Krótkie, zakończone nagrania wysyłamy do transkrypcji. Dalej używamy tego samego kontraktu komend co dla tekstu. T09 używa `gpt-transcribe` oraz `gpt-6-luna`; polskie słownictwo siłowe i hałas wymagają jeszcze prawdziwego pomiaru. Nie wymaga to stałego połączenia głosowego. [Dokumentacja transkrypcji](https://developers.openai.com/api/docs/guides/speech-to-text).

### Wykonanie T09 lokalnie

Asynchroniczny błąd `MediaRecorder` zatrzymuje ślad mikrofonu, odrzuca częściowe nagranie i pokazuje ręczne pole tekstowe. Kontrola MP4 i tej ścieżki jest testem komponentu z mockiem; fizyczny telefon nadal wymaga sprawdzenia.

W edytorze planu i przy konkretnej serii, komentarzu oraz dodatkowym ćwiczeniu jest przycisk nagrywania. Klient wybiera obsługiwany przez `MediaRecorder` WebM/Opus lub MP4, kończy po maksymalnie 30 s i pozwala anulować. Brak mikrofonu lub odmowa uprawnienia pozostawia pole tekstowe i ręczne formularze. Serwer przyjmuje tylko WebM, MP4, MP3 lub WAV do 5 MB po sprawdzeniu sygnatury. Transkrypcja `gpt-transcribe` jest zwracana do korekty; dopiero osobne żądanie interpretuje poprawiony tekst przez `gpt-6-luna` i Structured Outputs. Plan używa schematu i walidatora T06, wynik treningu ma jedną intencję na próbę. Brak liczby pozostaje `null`; niekompletna propozycja treningu daje pytanie o brakujące dane, bez zgadywania lub zapisu.

Żądania wymagają sesji; wskazana seria jest ponownie sprawdzana w treningu właściciela wraz z rewizją. Karta pokazuje transkrypcję, cel i edytowalne wartości. Propozycję planu można wstawić do szkicu, a potem opublikować przez istniejącą komendę T04. Seria, poprawka, komentarz i dodatkowe ćwiczenie są zapisywane dopiero przy jawnym zatwierdzeniu przez `apply_workout_command` z T05. Dodatkowe ćwiczenie i podyktowane serie zapisuje jedna transakcja tej komendy. Retry zachowuje identyfikator i payload; nowsza rewizja blokuje spóźnioną propozycję. Anulowanie unieważnia wynik po stronie UI nawet wtedy, gdy dostawca zdążył odpowiedzieć.

Audio i transkrypcja pozostają wyłącznie w pamięci żądania i przeglądarki; aplikacja ich nie zapisuje w DB, Storage ani logach. Tabela `voice_attempts` przechowuje właściciela, czas i rezerwację 0,01 USD na próbę; istniejący cron importu usuwa te metadane po 7 dniach. Oddzielne `OPENAI_VOICE_ENABLED=true` i dodatni `OPENAI_VOICE_BUDGET_USD` są wymagane. Limit to przybliżona rezerwacja globalna w oknie 24 h, nie twarda blokada rachunku dostawcy. Przy 30 s nagrania taryfa `gpt-transcribe` wynosi około 0,00225 USD plus tekstowy model i ewentualne nieudane próby. Bez uzgodnionego budżetu głos AI pozostaje wyłączony. `store: false` dotyczy Responses; nie obiecuje zerowej retencji transkrypcji u dostawcy.

Aktualne źródła sprawdzone 2026-10-12: [File transcription i formaty](https://developers.openai.com/api/docs/guides/speech-to-text), [gpt-transcribe i cena](https://developers.openai.com/api/docs/models/gpt-transcribe), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [gpt-6-luna i cena](https://developers.openai.com/api/docs/models/gpt-6-luna), [kontrola danych](https://developers.openai.com/api/docs/guides/your-data).

Ewaluacja 2026-10-12 po odrębnym limicie 0,50 USD: cztery serie prawdziwego API na 20 polskich tekstach, jednym planie i dwóch krótkich nagraniach z syntezy systemowej. Po poprawce `voice-pl-v2` końcowy [raport](reports/2026-10-12-T09-live.json) ma 20/20 tekstów, poprawny plan i 2/2 transkrypcji; wcześniejsze raporty v1–v3 pokazują niezaliczone przypadki. Szacunek łączny to 0,010376 USD, bez potwierdzenia rachunkiem dostawcy. Jedno nagranie miało syntetyczny różowy szum; nie mierzy to telefonu, realnej sali treningowej ani akcentów. Model i taryfy zweryfikowano ponownie w oficjalnej dokumentacji 2026-10-12.

Równoległy odbiór lokalny 2026-10-13 na emulatorze Android: Chrome przez tymczasową stronę testową i `adb reverse` uzyskał uprawnienie mikrofonu, utworzył WebM/Opus i wymuszone audio/MP4 oraz odrzucił anulowane nagranie, zwalniając ścieżkę mikrofonu. Aplikacja preferuje WebM, gdy jest dostępny; MP4 sprawdzono w tej samej przeglądarce po wymuszeniu w teście. Opóźniony wynik i zmiana ćwiczenia mają testy komponentowe z mockiem, a własność i rewizja lokalne testy Auth/PostgREST. Nie wykonano pełnego klikalnego przepływu aplikacji na emulatorze ani odbioru fizycznego iPhone/Android. D025 (2026-10-14) rozstrzyga konflikt: T09 jest zakończone lokalnie, a użytkownik wykona fizyczny odbiór po Vercel w T10-R1. Telefon i Safari nadal nie mają wyniku odbioru.

Wynik jest kartą do jednego zatwierdzenia, np. „Przysiad · seria 3 · 5 powtórzeń · 100 kg”. Pola można zmienić przed zapisem. Cofnięcie zatwierdzonej operacji jest jawną, autoryzowaną zmianą; konflikt po późniejszej edycji nie może usuwać nowszych danych.

## Komendy domenowe

- `draft_plan`: „Poniedziałek: przysiad cztery serie po sześć na 75 procent maksa”.
- `log_set`: „Pięć powtórzeń, sto kilo” — docelowa seria musi być jednoznaczna w kontekście.
- `update_set`: „W ostatniej serii było siedem, nie osiem” — podgląd wskazuje konkretną serię i zmianę.
- `add_note`: „Dopisz do treningu: dzisiaj słabszy chwyt”.
- `add_exercise`: „Zrobiłem jeszcze podciąganie, trzy serie po osiem, bez dodatkowego ciężaru”.
- `clarify` / `noop`: polecenie niejednoznaczne, niekompletne lub niezwiązane z aplikacją.

Polecenie może zawierać kilka operacji, np. serię i notatkę. Podgląd pokazuje wszystkie; zatwierdzenie jest transakcyjne. T09 ustali ograniczenie liczby operacji w jednym nagraniu.

Kontekst obejmuje aktywny trening, docelowe ćwiczenie/serię, dozwolone działania i rewizję danych. Kontekst jest utrwalony przy nagraniu: przejście do innego ćwiczenia w trakcie przetwarzania nie przekierowuje wyniku po cichu. Backend ponownie sprawdza własność i aktualność celu.

## Decisions API

Jeśli użytkownik miał na myśli OpenAI Decisions API: dokumentacja opisuje wybór spośród zdefiniowanych kategorii, ocenę i predykaty dla tekstu/obrazów. Może służyć do wyboru `log_set`, `add_note`, `add_exercise` lub `clarify` na podstawie transkrypcji. Nie zastępuje transkrypcji ani ekstrakcji dowolnych pól do naszego schematu.

Propozycja: w becie jedna operacja ekstrakcji zwraca intencję i pola. Decisions pozostaje eksperymentem T12; wdrażamy je, jeśli porównanie pokaże korzyść jakości, opóźnienia lub kosztu wobec prostszej ścieżki. W momencie sprawdzania dokumentacja określa API jako public beta; nie uzależniamy od niego podstawowego zapisu.

Źródło: [Decisions API](https://developers.openai.com/api/docs/guides/decisions).

## Rozmowa na żywo i Jev

Realtime/Live można zbadać po krótkich nagraniach, gdy testerzy potrzebują dialogu bez dotykania ekranu. Dokumentacja OpenAI pokazuje także łączenie Live z Decisions. To osobny wariant, wymagający oceny sesji, przerwań, anulowania i kosztów. Nie utożsamiamy automatycznie Live API z Realtime API.

Źródła: [Realtime](https://developers.openai.com/api/docs/guides/realtime), [Connect voice to Decisions](https://developers.openai.com/api/docs/guides/decisions-voice).

Użytkownik wskazał Jev od TypeSafe AI, dostępny w Vercel AI Gateway jako `typesafe-ai/jev`. Model zwraca typowane decyzje, np. wybór kategorii, ocenę lub prawdopodobieństwo. Proponowane zastosowanie: rozpoznanie intencji z transkrypcji i wybór spośród dozwolonych akcji. Nie planujemy go jako zamiennika transkrypcji ani generatora dowolnych komentarzy/pełnego planu.

W T12 porównamy: pojedynczą ekstrakcję OpenAI, Decisions + ekstrakcję oraz Jev + ekstrakcję, na tych samych przykładach polskich poleceń. Dodatkowy klasyfikator ma sens tylko, gdy poprawia wynik całego przepływu. Zgodność typów nie gwarantuje poprawnej interpretacji wypowiedzi; uprawnienia i zatwierdzenie pozostają w aplikacji. Przed integracją sprawdzić aktualny kontrakt i stabilność SDK (karta Vercel pokazuje interfejs eksperymentalny), warunki przetwarzania danych i dostęp na koncie.

Źródła wskazane przez użytkownika i sprawdzone 2026-10-11: [Jev w Vercel AI Gateway](https://vercel.com/ai-gateway/models/jev), [opis TypeSafe AI](https://typesafe.ai/blog/introducing-system-one-models-and-jev). Deklaracje producenta o szybkości nie zastępują pomiaru aplikacji.

## Przypadki wymagające uwagi

- „Wyciskanie” bez wskazania wariantu; „kolejna seria” bez aktywnego ćwiczenia.
- „Osiemdziesiąt” bez jednostki i celu; ciężar na hantel czy łączny.
- „Trzy po osiem” może oznaczać plan lub wykonanie — tryb ekranu i podgląd muszą to rozróżniać.
- Polskie przecinki dziesiętne, poprawki w tej samej wypowiedzi, negacja, cisza, rozmowy w tle.
- Anulowanie, dwukrotne wysłanie, timeout po udanym zapisie i zmiana danych na drugim urządzeniu.
- Polecenia zawarte w importowanym dokumencie nie są poleceniami dla backendu.

## Ewaluacja przed wyborem modelu

T06 i T09 przygotują wersjonowane, syntetyczne lub udostępnione za zgodą przykłady z oczekiwanym wynikiem. Mierzymy poprawność ćwiczeń, kolejności, serii, kg/procentów, wykrywanie braków, liczbę koniecznych poprawek, opóźnienie p50/p95 i koszt skutecznego importu/polecenia. Raport wskazuje model, prompt, schemat i datę. Cele odbioru opisuje [TESTING](TESTING.md).

Nie utrwalamy konkretnego modelu w dokumentacji jako „najlepszego” przed takim porównaniem.

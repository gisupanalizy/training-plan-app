# Forma — system wizualny T15

Status: wdrażany lokalnie w T15; szczegółowe dowody i ograniczenia w checkpointach/handoffach. Nie oznacza publikacji. Źródła: D039/D042/D043/D044 oraz [wybrane makiety](design/t14-selected-spec.md). Bieżąca specyfikacja R5/R6 ma pierwszeństwo przed historycznymi jasnymi wariantami.

## Cel i charakter

Mobilny dziennik treningowy, tryb Operate. Użytkownik wybiera trening, szybko odczytuje cel i zapisuje faktyczne wykonanie. Główne listy są zwarte; formularze i dodatkowe informacje otwierają się na żądanie. Nazwy i wartości są ważniejsze niż dekoracje. UI po polsku, jawny brak danych, cel oddzielony od wykonania.

## Wybrany system

Domyślna Noc niezależna od systemowego motywu. Tło #11181f, powierzchnia #1c262f, tekst #f1f3f5, tekst pomocniczy #b5c1cc, akcent #f2c66b z tekstem #282012. Semantyczne tokeny w globals.css; moduły ekranów korzystają z tokenów, bez własnych konkurujących motywów. Brak przełącznika sześciu palet w produkcie.

Lokalny Inter Variable z OFL; font i licencja w public/fonts, manifest pochodzenia zachowany. Spójne ikony SVG akcji. Ilustracje ćwiczeń z lokalnej biblioteki o jawnej licencji CC BY-SA4.0 i manifestach; dokładne dopasowanie ruchu albo neutralny znacznik. Licencja grafik nie jest licencją kodu. Atrybucja dostępna w aplikacji.

## Kompozycja i interakcje

- Start/Plany/Podgląd/Szczegóły A, Zapis serii C, Import C, Korekta/Edytor/Historia/Profil A, Logowanie C. Postęp według pojedynczego R4/R5, nie historycznych wariantów A/B/C.
- Mobilna nawigacja pięciu tras, safe-area i miejsce pod treścią; desktop ma boczną nawigację. Podstawowe akcje/cele dotykowe co najmniej44px, widoczny fokus, obsługa klawiatury.
- Podgląd/aktywny trening: co najmniej cztery pełne krótkie karty przy390×844;360/430 bez poziomego overflow. Przewijanie poziome tylko tam, gdzie celowe: plany i rekordy, z alternatywą klawiatury.
- Formularz jednej serii oddziela cel, poprzedni wynik i wykonanie; zapis dopiero po ACK i odczycie. Edytor planu otwierany całą kartą, bez utraty indywidualnych serii.
- Postęp: jedna linia, metryki nad wykresem, zakres pod osią, rekordy całej historii poniżej. Tylko punkt otwiera informacje; poza nim zamknięcie. Mysz, klawiatura i dotyk testowane oddzielnie. Pomoc szacunku wyjaśnia źródło i brak zapisu do rzeczywistego1RM.

## Stany i kontrola jakości

Loading, błąd/retry, konflikt, brak danych i brak uprawnień zachowują zrozumiałe polskie komunikaty. Stan nie zależy wyłącznie od koloru. Nie pokazujemy danych syntetycznych jako prywatnych zapisów. Brak kilogramów nie jest zerem.

Przegląd wizualny partiami: reprezentatywne desktop/mobile, następnie poprawki rzeczywistych defektów i kontrola dotkniętego zakresu. Nie dodawać niezamówionych rund estetycznych. Dostępność obejmuje kontrast, fokus, klawiaturę, czytelność formularzy i dostępne alternatywy gestów. Odbiór fizycznego telefonu/Safari jest osobny od lokalnego Chrome/CDP.

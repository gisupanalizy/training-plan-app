# Praca agentów i zmiany planu

## Źródła prawdy

- PRODUCT: wymagania użytkownika i zakres.
- ROADMAP: statusy, właściciele, zależności i kryteria zadań.
- DECISIONS: decyzje i ich uzasadnienie, z rozróżnieniem zatwierdzonych i proponowanych.
- STATUS: bieżący punkt wejścia i najnowszy handoff.
- Handoffy: historia faktycznie wykonanej pracy. Nowsza specyfikacja może je zastąpić; handoff nie jest nadrzędny wobec późniejszych wymagań.

## Początek sesji

1. Przeczytaj AGENTS, STATUS, ROADMAP i wskazany handoff.
2. Sprawdź faktyczny stan plików i, jeśli istnieje Git, zmiany robocze. Nie nadpisuj cudzej pracy.
3. Wybierz zadanie z zakończonymi zależnościami. Ustaw właściciela i `in_progress`, określ pliki i kryteria odbioru.
4. Jeśli stan repozytorium przeczy handoffowi, sprawdź przyczynę i popraw dokumentację. Nie zakładaj, że opisany commit, test lub wdrożenie istnieje.

## Zmiana planu

Agent może doprecyzować zadanie, zmienić kolejność na podstawie zależności lub wydzielić odkrytą pracę. Zachowuje ID i historię, zapisuje przyczynę oraz wpływ w CHANGELOG, aktualizuje powiązane dokumenty. Istotny wybór architektury dostaje wpis w DECISIONS.

Zmiana celu produktu, dodatkowe zobowiązania kosztowe lub publikacja danych wymagają rozstrzygnięcia przez właściciela. Zwykłe poprawki dokumentacji i implementacja uzgodnionego zakresu nie wymagają osobnego zatwierdzania każdego kroku. Nierozstrzygnięte opcje trafiają do OPEN_QUESTIONS; praca niezależna trwa dalej.

## Praca równoległa, gdy zostanie zlecona

Wyznacz jednego integratora do ROADMAP, STATUS i DECISIONS. Każdy wykonawca ma odrębne zadanie, uzgodnione pliki oraz własny handoff. Nie edytuj równocześnie tego samego pliku. Handoff nie jest blokadą plików; przed przejęciem sprawdź, czy poprzedni właściciel zakończył pracę. Integrator scala wyniki i aktualizuje dokumenty wspólne.

## Koniec sesji

1. Uruchom adekwatne sprawdzenia. Odróżnij wyniki z mocków od prawdziwych integracji.
2. Oznacz `review`, jeśli implementacja czeka na odbiór; `done` tylko po spełnieniu kryteriów. Niewykonane zadanie nie jest done z powodu końca sesji.
3. Dodaj plik `docs/handoffs/YYYY-MM-DD-Txx-krotki-opis.md`. Jeśli nazwa istnieje, dodaj kolejny numer, nie nadpisuj dawnej sesji.
4. Uaktualnij STATUS linkiem, ograniczeniami i następnym krokiem. Zapisz istotne zmiany w CHANGELOG/DECISIONS.
5. Jeśli Git istnieje, podaj branch/commit lub stan zmian; nie twórz fikcyjnych identyfikatorów. Commit/push zależy od zakresu zlecenia.

## Definicja ukończenia

Spełnione kryteria zadania, adekwatne testy z wynikami, brak nierozwiązanych krytycznych błędów, dokumentacja zgodna z kodem, handoff i konkretny następny krok. Dla dokumentacji zamiast builda wystarcza przegląd spójności i linków.

## Prompt dla kolejnego agenta

Od zakończenia T01 każda sesja pracy kończy się promptem w bloku tekstowym w odpowiedzi końcowej oraz identycznym promptem w handoffie. Ma nadawać się do wklejenia w nowym chacie bez znajomości poprzedniej rozmowy.

Prompt zawiera:

- Projekt i konkretne zadanie z ROADMAP; przy pracy niedokończonej kontynuację tego samego zadania.
- Polecenie przeczytania AGENTS, README, STATUS, ROADMAP, konkretnego handoffu oraz specyfikacji potrzebnych do zadania.
- Zakres, kryteria odbioru i wymagane sprawdzenia; bez automatycznego przechodzenia do kolejnych zadań.
- Znane blokery, warunki rozpoczęcia i ograniczenia, bez sekretów.
- Obowiązek aktualizacji dokumentacji i przygotowania kolejnego handoffu oraz promptu.

Obok promptu zaproponuj model i poziom rozumowania odpowiednie do trudności, preferując oszczędne ustawienie. To rekomendacja dla użytkownika, nie deklaracja automatycznej zmiany modelu. Nie proponuj Ultra rutynowo.

Przed wyborem następnego zadania sprawdź zależności i rzeczywisty stan pracy. Jeśli wszystkie dalsze prace są zablokowane, podaj prompt kontynuacji po konkretnym odblokowaniu i jasno wskaż potrzebne działanie użytkownika. Jeśli cały uzgodniony zakres jest zakończony, zaznacz brak kolejnego zadania; nie wymyślaj prac tylko po to, by wypełnić szablon. Samo przygotowanie promptu nie uruchamia ani nie wysyła wiadomości do innego agenta.

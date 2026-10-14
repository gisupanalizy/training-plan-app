# Zakres produktu

Aktualizacja: 2026-10-12. Status: wymagania użytkownika + oznaczone propozycje implementacyjne.

## Potwierdzone wymagania

- Testy dla właściciela i kolegów; różne plany, głównie siłowe.
- Import PDF do 6 stron, XLSX, zdjęcia z pliku i zdjęcia z aparatu; rozpoznanie struktury i parametrów ćwiczeń.
- Import dopytuje o niejasne wartości przez zamknięty wybór albo wpisanie wymaganej ilości. Kontrakt pytań jest w T06, ekran w T07.
- Ręczne tworzenie i edytowanie danych pozostaje dostępne.
- Dyktowanie planów, wyników serii, dodatkowych ćwiczeń i komentarzy.
- Procenty dotyczą rzeczywistego 1RM. Nie podstawiamy training max ani estymowanego 1RM.
- Działanie online; offline poza pierwszą wersją.
- OpenAI jako pierwszy dostawca AI; rozważenie Decisions API i rozwiązania nazwanego „Jev”.
- Najpierw dokumentacja Markdown, edytowalny plan i handoffy dla kolejnych agentów.

## Proponowany zakres pełnej bety

1. Osobne konta zaproszonych testerów, prywatne dane użytkownika. Udział kolegów nie oznacza dostępu do cudzych treningów.
2. Biblioteka planów: tygodnie, dni/sesje, ćwiczenia w kolejności, serie z indywidualnymi parametrami.
3. Ćwiczenia własne i aliasy nazw; zachowanie oryginalnych nazw z dokumentu.
4. Serie: liczba lub zakres powtórzeń, kg lub procent 1RM, przerwa, tempo, RPE/RIR i uwagi, jeśli występują w źródle. Obsługa masy ciała i braku podanego obciążenia.
5. Zachowanie grup ćwiczeń, np. superserii, i różnych parametrów kolejnych serii. Nietypowy zapis trafia do uwag oraz przeglądu, nie znika podczas importu.
6. Dodatkowe pola czasu i dystansu dla prostych ćwiczeń niesiłowych. Rozbudowane interwały i sportowe analizy poza betą.
7. Historia rzeczywistych 1RM z datami i przeliczanie procentów na kg według jawnej reguły zaokrąglania.
8. Aktywny trening: planowane i wykonane wartości, zapis serii, pominięcie, dodatkowe ćwiczenie, notatka, przerwanie i wznowienie.
9. Historia treningów i podstawowe postępy danego ćwiczenia: ciężary, powtórzenia, objętość dla porównywalnych serii, rzeczywiste rekordy.
10. Import jako szkic z podglądem źródła i możliwością korekty przed zatwierdzeniem.
11. Krótkie nagranie → transkrypcja → propozycja zmian → zatwierdzenie. Opcjonalna rozmowa na żywo po ocenie użyteczności i kosztów.

## Zasady produktu

- Główny ekran podczas ćwiczenia pokazuje następną serię i poprzedni wynik bez przekopywania się przez formularze.
- Ręczny zapis nie wykonuje wywołania modelu. Awaria AI nie blokuje treningu.
- Nie tworzymy wartości, których nie ma w źródle. Braki są widoczne, edytowalne i prowadzą do odpowiedniego pytania przy imporcie.
- Każda zmiana głosowa pokazuje docelowe ćwiczenie i wartości; zapis wymaga jednego zatwierdzenia. W MVP nie ma cichego zapisywania rozpoznanej wypowiedzi.
- Dodatkowe ćwiczenie w treningu nie modyfikuje automatycznie szablonu planu.
- Brak internetu jest komunikowany; aplikacja nie pokazuje „zapisano” przed potwierdzeniem serwera.

## Poza pierwszą wersją

Panel trenera, subskrypcje, publiczny katalog i ranking, integracje zegarków, pełny offline, automatyczne zalecenia treningowe, automatyczna zmiana obciążeń na podstawie AI, zawsze włączony mikrofon, zaawansowane analizy biegania. Udostępnianie planów między kontami może być osobnym zadaniem po testach.

## Warunek gotowości bety

Dwóch testerów na osobnych kontach może zaimportować plan, poprawić go, wykonać trening z ręcznym i głosowym zapisem, wrócić do wyników po ponownym zalogowaniu i nie ma dostępu do danych drugiej osoby. Scenariusze akceptacyjne: [TESTING](TESTING.md).

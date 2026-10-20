# Forma — system wizualny

Status: docelowy wygląd to Tempo (D047, [brief](tempo-implementation-brief.md), [katalog](tempo-frame-catalog.md)). T16-B–H są w drzewie roboczym jako jeden system, bez drugiego motywu. T16-I nie przyjął bramki: główny zapis serii przy 390×844 nie kończy się nad dolną nawigacją. Nie oznacza publikacji. Historyczne wybory układów: D039/D042/D043/D044 oraz [makiety T14](design/t14-selected-spec.md).

## Cel i charakter

Mobilny dziennik treningowy, tryb Operate. Użytkownik wybiera trening, szybko odczytuje cel i zapisuje faktyczne wykonanie. Główne listy są zwarte; formularze i dodatkowe informacje otwierają się na żądanie. Nazwy i wartości są ważniejsze niż dekoracje. UI po polsku, jawny brak danych, cel oddzielony od wykonania.

## Wybrany system

Jedyny docelowy wygląd to Tempo, niezależny od systemowego motywu. Tło #11191c, powierzchnia #1b2629, tekst #f2f5f1, tekst pomocniczy #9daaa7, akcent #efc45f z tekstem #25200f. Pozostałe tokeny i ich role opisuje brief. Semantyczne aliasy żyją w jednym `:root`; moduły ekranów korzystają z nich, bez własnej palety i bez przełącznika. W drzewie roboczym aliasy wskazują `--tempo-*` w jednym `:root`. Atrybutu `data-theme="night"` nie ma. Zdanie o wartościach Nocy na `70d66e6` opisuje stan sprzed T16-B.

Lokalny Inter Variable z OFL; font i licencja w public/fonts, manifest pochodzenia zachowany. Spójne ikony SVG akcji. Ilustracje ćwiczeń z lokalnej biblioteki o jawnej licencji CC BY-SA4.0 i manifestach; dokładne dopasowanie ruchu albo neutralny znacznik. Licencja grafik nie jest licencją kodu. Atrybucja dostępna w aplikacji.

## Kompozycja i interakcje

- Start/Plany/Podgląd/Szczegóły A, Zapis serii C, Import C, Korekta/Edytor/Historia/Profil A, Logowanie C. Postęp według pojedynczego R4/R5, nie historycznych wariantów A/B/C.
- Mobilna nawigacja pięciu tras, safe-area i miejsce pod treścią; desktop ma boczną nawigację. Podstawowe akcje/cele dotykowe co najmniej44px, widoczny fokus, obsługa klawiatury.
- Podgląd i aktywny trening używają zwartych kart. Przy 360/390/430 px treści pozostają w szerokości ekranu. Dłuższa lista przewija się także wtedy, gdy dolna nawigacja zasłania dół karty; zasłonięty fragment ma być osiągalny przewinięciem (D046). Przewijanie poziome zostaje tam, gdzie jest celowe: plany i rekordy, z alternatywą klawiatury.
- Formularz jednej serii oddziela cel, poprzedni wynik i wykonanie; zapis dopiero po ACK i odczycie. Edytor planu otwierany całą kartą, bez utraty indywidualnych serii.
- Postęp: jedna linia, metryki nad wykresem, zakres pod osią, rekordy całej historii poniżej. Tylko punkt otwiera informacje; poza nim zamknięcie. Mysz, klawiatura i dotyk testowane oddzielnie. Pomoc szacunku wyjaśnia źródło i brak zapisu do rzeczywistego1RM.

## Stany i kontrola jakości

Loading, błąd/retry, konflikt, brak danych i brak uprawnień zachowują zrozumiałe polskie komunikaty. Stan nie zależy wyłącznie od koloru. Nie pokazujemy danych syntetycznych jako prywatnych zapisów. Brak kilogramów nie jest zerem.

Przegląd wizualny partiami: reprezentatywne desktop/mobile, następnie poprawki rzeczywistych defektów i kontrola dotkniętego zakresu. Nie dodawać niezamówionych rund estetycznych. Dostępność obejmuje kontrast, fokus, klawiaturę, czytelność formularzy i dostępne alternatywy gestów. Odbiór fizycznego telefonu/Safari jest osobny od lokalnego Chrome/CDP.

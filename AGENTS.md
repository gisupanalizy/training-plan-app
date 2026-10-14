# Instrukcje dla agentów

Obowiązują w całym repozytorium. Projekt jest obecnie na etapie dokumentacji.

1. Zacznij od `README.md`, `docs/STATUS.md`, `docs/ROADMAP.md` i najnowszego handoffu wskazanego w STATUS.
2. Przed zmianą funkcji przeczytaj odpowiednią specyfikację i `docs/DECISIONS.md`.
3. Wybierz zadanie z gotowymi zależnościami; wpisz właściciela i status `in_progress` w ROADMAP.
4. Nie traktuj planowanej funkcji ani proponowanej decyzji jako już wdrożonej lub zatwierdzonej przez użytkownika.
5. Możesz aktualizować plan, dzielić zadania i dopisywać odkryte prace w ramach uzgodnionego celu. Zachowuj identyfikatory i zależności; powód zapisz w CHANGELOG.
6. Zmiany wymagań użytkownika oznacz jako propozycję. Nie rozszerzaj po cichu zakresu o płatności, publiczne dane, trenerów ani automatyczne układanie treningów.
7. Po pracy aktualizuj status zadania, STATUS oraz utwórz handoff według `docs/handoffs/TEMPLATE.md`. Istotne decyzje zapisz w DECISIONS.
8. Handoff ma podawać fakty, zmienione pliki, wykonane sprawdzenia, ograniczenia i konkretny następny krok. Nie deklaruj niewykonanych testów.
9. Nie uruchamiaj automatycznie innych agentów. Przy jawnie zleconej pracy równoległej uzgodnij właścicieli plików i jednego integratora zgodnie z WORKFLOW.
10. Dokumentacja i interfejs: polski. Identyfikatory kodu: angielski. Nie zapisuj sekretów ani prywatnych planów/nagrań w repozytorium.
11. Oddzielaj plan od wykonania. Zachowuj wersje planów i historyczne wartości 1RM użyte do obliczeń.
12. Ręczne wpisywanie musi działać bez AI. AI tworzy propozycje; walidacja, autoryzacja i zapis należą do aplikacji.
13. Każda operacja na prywatnych danych wymaga kontroli właściciela; nie polegaj na identyfikatorach podanych przez model lub przeglądarkę.
14. Rozróżniaj `null` (brak danych) od zera. Nie zgaduj brakujących parametrów treningu.
15. Każdy zapis wyniku ma być odporny na ponowienie. Nie zmieniaj historycznych treningów przy edycji planu lub maksimum.
16. Wykonuj adekwatne sprawdzenia z TESTING. Błędy i niewykonane sprawdzenia zapisuj jawnie.
17. Aktualną dokumentację dostawców sprawdzaj przed wdrażaniem integracji; nie kopiuj bez weryfikacji dawnych nazw modeli, limitów lub cen.
18. Na obecnym etapie pracuj nad dokumentacją. Przejście do implementacji jest kolejnym zadaniem użytkownika.
19. Od zakończenia T01 każdą sesję pracy nad projektem kończ gotowym do skopiowania promptem dla kolejnego agenta, zarówno w odpowiedzi końcowej, jak i w handoffie. Podaj zadanie, zakres, pliki startowe, kryteria odbioru, blokery oraz rekomendowany model i poziom rozumowania z krótkim uzasadnieniem kosztowym. Zasady i wyjątki opisuje WORKFLOW.

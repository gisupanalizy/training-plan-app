# Instrukcja testera

Status 2026-10-16: build produkcyjny Ready i 21 migracji zastosowane; smoke HTTPS dwóch kont przeszedł. **Adres do ręcznych testów właściciela: [Forma](https://training-plan-app-seven.vercel.app).** Auth URL i minimum12 zapisane, cron200 na pustej kolejce. D031: możesz rozpocząć własne testy prototypu; dalszy odbiór operacyjny odłożony. Nie jest to zaproszenie do szerszej bety; najpierw właściciel projektu wykonuje T10-R1.

## Dostęp i prywatność

Na bieżący etap D029 właściciel testuje tylko Production. Ręcznie utworzone konto działa bez SMTP; mailowe zaproszenia i reset hasła wymagają osobnego odbioru przed dodaniem kolegów. Konto jest indywidualne, udostępniane przez operatora. Nie ma publicznej rejestracji. Po otrzymaniu zaproszenia otwórz link, ustaw hasło (minimum 12 znaków) i zaloguj się. Nie przesyłaj hasła, linku zaproszenia ani kluczy w zgłoszeniu. W razie wygaśnięcia zaproszenia poproś operatora o nowe. Jeśli pojawi się dodatkowa bramka Vercel, operator musi nadać dostęp; sama bramka nie zastępuje konta aplikacji.

Na początek używaj wymyślonego planu i komentarzy. Twoje plany, wyniki i źródła są prywatne dla Twojego konta. Podczas odbioru izolacji używa się wyłącznie wskazanych kont testowych i ich syntetycznych danych. Nie próbuj uzyskiwać dostępu do danych innych testerów.

## Ręczny trening

1. W „Planach” utwórz plan i trening A/B, dodaj ćwiczenia oraz serie. Rozwiń „Edytuj serie”, jeśli chcesz zmienić blok lub jedną serię. Sprawdź całość i opublikuj. Nieopublikowany ręczny szkic nie ma trwałego autosave — przed wyjściem zapisz albo świadomie odrzuć zmiany.
2. W „Profilu” dodaj rzeczywisty 1RM z datą. Dla 120 kg cel 75% daje 90 kg. Brak maksimum pozostawia kg puste; podanie ciężaru serii nie dodaje maksimum. Puste pole i zero znaczą różne rzeczy.
3. Rozpocznij trening. Wpisz wykonane powtórzenia/kg i zapisz serię; cel nie jest automatycznie wynikiem. Pomiń inną serię, dodaj dodatkową serię/ćwiczenie i komentarz, zakończ trening.
4. Wyloguj się i zaloguj ponownie. Sprawdź „Historię” i „Postęp”. Popraw wynik historycznej serii i sprawdź zmianę statystyk. Nowa wersja planu lub nowe 1RM nie powinny zmienić dawnych celów.
5. Przy błędzie sieci zachowaj formularz i użyj ponowienia. Nie powinien powstać duplikat. Konflikt dwóch kart wymaga odświeżenia danych i świadomej korekty; nie oczekuj cichego nadpisania.

## Import i głos — po potwierdzeniu dostępności przez operatora

Właściciel zatwierdził5USD łącznie na start i dodał klucz; import rzeczywistym tekstem przeszedł, aktualny wynik w STATUS. D032: głos jest także włączony i sprawdzony syntetycznym nagraniem. Odśwież aplikację, przy serii wybierz mikrofon, zezwól na dostęp, nagraj kilka sekund, sprawdź transkrypcję i propozycję oraz zatwierdź. AI wymaga osobnego włączenia i uzgodnionego budżetu. Gdy jest wyłączone lub niedostępne, korzystaj z formularzy ręcznych. Nie zakładaj, że sam przycisk mikrofonu lub wyboru pliku oznacza aktywne AI.

Import: wybierz syntetyczny PDF/XLSX/PNG/JPEG albo tekst. Limity: PDF/XLSX do 1 MB, zdjęcie do 2 MB, tekst do 30 KB, PDF do 6 stron; HEIC nie jest wspieranym wejściem. Przejdź przez Ćwiczenia → Serie i superserie → Podsumowanie. Otwórz źródło, popraw liczby, rozwiąż pytania, potwierdź przegląd i dopiero opublikuj. Szkic AI nie jest gotowym planem; nie zgaduj nieczytelnych wartości. Zapisana korekta importu może być wznowiona po odświeżeniu.

Głos: wybierz konkretny cel, nagraj krótką wypowiedź, zatrzymaj, popraw transkrypcję i sprawdź propozycję. Zatwierdź dopiero po sprawdzeniu ćwiczenia/serii oraz liczb. Zmiana celu podczas oczekiwania i anulowanie nie mogą zapisać wyniku samoczynnie. Odmowa mikrofonu pozostawia wpisywanie ręczne. Docelowy limit nagrania to 30 s; ograniczenie wielkości przesyłki na Vercel pozostaje otwarte dla dużych plików. D032 dopuszcza krótkie próby właściciela: zacznij od kilku sekund. Pełnego zakresu5MiB ani fizycznego mikrofonu jeszcze nie odebrano.

Źródła importu i korekty wygasają po 7 dniach, anulowane są kwalifikowane do najbliższego sprzątania. Opublikowany plan pozostaje w historii. Aplikacja nie utrwala audio/transkrypcji; dostawca AI, logi operacyjne i kopie bezpieczeństwa mają odrębne zasady przechowywania, które operator potwierdzi przed włączeniem usług. Nie przesyłaj danych, których nie chcesz poddać temu przetwarzaniu.

## Odbiór telefonu T10-R1 i zgłoszenia

Pełna lista: [T10_ACCEPTANCE — T10-R1](T10_ACCEPTANCE.md#t10-r1--lista-dla-użytkownika-po-vercel). Sprawdź klawiaturę, przewijanie, dialogi, Wstecz, aparat, odmowę uprawnień, nagranie/anulowanie, zmianę ćwiczenia podczas odpowiedzi i przerwanie sieci. Safari/iPhone i Chrome/Android sprawdzamy na rzeczywistych urządzeniach w miarę dostępności; brak urządzenia pozostaje niewykonanym sprawdzeniem.

Zgłoszenie przekaż właścicielowi projektu prywatnie w uzgodnionym kanale (kanał nie został jeszcze wskazany). Podaj datę, adres i wersję wdrożenia przekazaną przez operatora, model telefonu, system, przeglądarkę/wersję, kroki, oczekiwany oraz faktyczny wynik. Dodaj zanonimizowany zrzut, jeśli pomaga. Nie dołączaj haseł, tokenów, pełnego nagrania ani prywatnego planu. Dostęp do cudzego rekordu, utratę danych albo duplikat zgłoś od razu i przerwij test na tym scenariuszu.

Fizyczny telefon i Safari **nie są jeszcze przetestowane**. Wynik odbioru zapisz z operatorem w dokumentacji T10-R1. Szersza beta czeka na ten wynik oraz zamknięcie blokujących błędów.

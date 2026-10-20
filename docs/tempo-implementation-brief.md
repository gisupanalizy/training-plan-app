# Forma — brief implementacyjny UI „Tempo”

Status: kanoniczna specyfikacja wyglądu i zachowania interfejsu.  
Repozytorium docelowe: `gisupanalizy/training-plan-app`.  
Zweryfikowany punkt odniesienia: `codex/t15-ui` przy `11d66bc`.  
Kierunek: **Tempo — jedyny docelowy wygląd aplikacji Forma**.  
Katalog klatek: [tempo-frame-catalog.md](tempo-frame-catalog.md).

## 1. Cel

Tempo doprecyzowuje wygląd działającej aplikacji. Nie tworzy nowego produktu,
nie zmienia nawigacji, prywatności, modelu danych ani istniejących kontraktów.

Interfejs ma pomóc użytkownikowi:

1. wybrać właściwy plan i trening;
2. odczytać historyczny cel najbliższej serii;
3. zapisać rzeczywiste wykonanie bez AI;
4. świadomie zatwierdzić propozycję importu lub głosu;
5. wrócić do historii i zrozumieć rzeczywisty postęp.

Główna zasada: **jedna dominująca akcja na ekran lub w otwartym dialogu**.

## 2. Źródła prawdy

Priorytet:

1. działające kontrakty aplikacji i dokumentacja repozytorium;
2. ten brief i katalog nazwanych klatek;
3. trzy zachowane klatki bazowe:
   - `public/references/tempo-training-full.png`,
   - `public/references/tempo-set-full.png`,
   - `public/references/tempo-progress-full.png`;
4. pozostałe klatki Tempo w pliku Make.

`public/references/tempo-extended/` jest archiwum poprzedniej rundy i nie jest
źródłem prawdy. Nie należy na jego podstawie nadpisywać katalogu klatek,
niniejszego briefu ani interaktywnego prototypu.

Źródłem prawdy dla wyglądu pozostają wspólnie: katalog klatek, niniejszy brief
oraz interaktywny prototyp Tempo.

Teksty, osoby, daty, ciężary i wyniki na klatkach są przykładami. Implementacja
zawsze korzysta z prawdziwych autoryzowanych odczytów i istniejących akcji.

## 3. Granice

Redesign nie obejmuje:

- płatności, trenerów i publicznych profili;
- automatycznego układania lub modyfikowania planów;
- pełnego trybu offline;
- nowych metryk i zmiany algorytmów Postępu;
- zmian dostawców AI;
- migracji modelu danych bez osobnego wymagania;
- publikacji produkcyjnej;
- zastępowania prawdziwych danych liczbami z klatek.

## 4. Nienaruszalne kontrakty

Zachowaj:

- kontrolę właściciela po stronie serwera i RLS;
- rozróżnienie `null`, rzeczywistego `0` oraz pola „Nie dotyczy”;
- wersje planu, historyczne cele i snapshoty 1RM;
- idempotentne komendy, pełny retry, ACK i aktualny GET;
- świadome rozstrzygnięcie konfliktu `409`;
- ochronę niezapisanych szkiców;
- ręczny zapis bez AI;
- głos i import jako propozycje wymagające zatwierdzenia;
- indywidualne serie, rampy, superserie, opcjonalność i uwagi;
- prawdziwą datę/godzinę lub jawne „godzina nieznana”;
- osobne rzeczywiste 1RM w Profilu i szacowane 1RM w Postępie;
- polski interfejs i angielskie identyfikatory kodu.

Przed implementacją przeczytaj co najmniej:

- `AGENTS.md`,
- `README.md`,
- `docs/STATUS.md`,
- `docs/ROADMAP.md`,
- bieżący handoff z STATUS,
- `docs/DECISIONS.md`,
- `docs/DESIGN.md`,
- `docs/UX.md`,
- `docs/T13_MOBILE_WORKOUT.md`,
- `docs/T15_UI_IMPLEMENTATION.md`,
- `docs/T15_PROGRESS_CONTRACT.md`.

## 5. Charakter Tempo

- ciemne, spokojne tło;
- sportowy, ale nie agresywny charakter;
- Inter Variable z istniejącego lokalnego źródła repozytorium;
- hierarchia budowana odstępem, typografią i ograniczoną liczbą powierzchni;
- bursztyn tylko dla głównej akcji, aktywnego wyboru i istotnego fokusu;
- semantyczny błąd, ostrzeżenie i sukces nie używają bursztynu;
- brak gradientów, neonów, szkła, fotografii i dekoracyjnych wykresów;
- brak nowych ilustracji;
- szczegóły ćwiczenia mogą użyć jednego istniejącego, poprawnie dopasowanego
  zasobu; zapis serii nie pokazuje ilustracji;
- ruch `120–200ms`, z obsługą `prefers-reduced-motion`.

## 6. Tokeny

W `src/app/globals.css` utrzymuj jeden semantyczny system i mapuj istniejące
aliasy, zamiast tworzyć drugi motyw.

| Token Tempo | Wartość referencyjna | Znaczenie |
|---|---:|---|
| `--tempo-bg` | `#11191c` | główne tło |
| `--tempo-surface` | `#1b2629` | karty, pola, nawigacja |
| `--tempo-surface-raised` | `#253235` | najważniejsza powierzchnia |
| `--tempo-line` | `#344245` | separator i subtelna rama |
| `--tempo-text` | `#f2f5f1` | tekst główny |
| `--tempo-muted` | `#9daaa7` | opis i metadane |
| `--tempo-soft` | `#c7cfcc` | tekst pośredni |
| `--tempo-accent` | `#efc45f` | CTA i aktywny wybór |
| `--tempo-on-accent` | `#25200f` | tekst na akcencie |
| `--tempo-success` | `#8fc79b` | sukces i dodatnia zmiana |
| `--tempo-danger` | istniejący semantyczny token | błąd i destrukcja |

Kolory muszą zachować WCAG AA. Fokus nie może polegać na subtelnej zmianie
koloru tła.

## 7. Typografia i rytm

Font: Inter Variable, bez dodatkowego kroju ekspozycyjnego.

Rekomendowana skala:

- tytuł strony mobile: `28–32px`, desktop `38–48px`;
- tytuł ćwiczenia: `26–28px`;
- tytuł sekcji: `18–20px`;
- tekst podstawowy: `14–16px`;
- metadane: `11–13px`;
- overline: minimum `10px`, uppercase, tracking około `0.12em`.

Nie kopiuj drobnego tekstu z przeskalowanej planszy. Istotny tekst produkcyjny
nie powinien być mniejszy niż `11px`.

Rytm: `4 / 8 / 12 / 16 / 20 / 24 / 32px`.

- mobile padding: `16–20px`;
- sekcje: `20–28px`;
- karta: `16–20px`;
- kontrolka dotykowa: minimum `44×44px`;
- pola: radius `10–12px`;
- karty: radius `14–18px`.

## 8. Mobile i desktop

### Mobile

- kanoniczna szerokość klatki: `390px`;
- dodatkowa kontrola: `360px` i `430px`;
- dolna nawigacja pięciu istniejących tras;
- safe-area i padding treści większy od wysokości nawigacji;
- główne formularze nie są przykrywane przez klawiaturę lub pasek zapisu;
- dialog formularza jest pełnoekranowy;
- źródło PDF/XLSX korekty jest pełnoekranowe.

### Desktop

- zachowaj istniejący sidebar AppShell;
- główne formularze i Postęp: kolumna `680–820px`;
- Import, Korekta i Edytor mogą mieć szerszą przestrzeń roboczą;
- źródło PDF/XLSX korekty stoi obok planu;
- dialog jest modalny nad przyciemnioną treścią;
- główne CTA nie rozciąga się bez potrzeby na całą szerokość;
- fokus po zamknięciu dialogu wraca do kontrolki otwierającej.

## 9. Nawigacja

Nie zmieniaj pięciu tras:

1. Trening,
2. Plany,
3. Historia,
4. Postęp,
5. Profil.

Mobile używa dolnego paska. Desktop używa bocznego menu. Aktywna trasa ma
ikonę, tekst i powierzchnię; stan nie zależy wyłącznie od koloru.

## 10. Hierarchia tras

Pełne stany, stabilne nazwy klatek, akcje, dialogi i rozróżnienie danych opisuje
[katalog klatek](tempo-frame-catalog.md).

### `/` — Trening

Najpierw aktywna sesja, następnie aktywny plan. Plan aktywny ma jedno CTA
`Rozpocznij [nazwa]`. Sesja w toku zastępuje je `Wznów trening`. Brak planu ma
jedno CTA `Utwórz lub zaimportuj plan`. Archiwum nie ma startu. Błąd odczytu
nie udaje pustego konta. Dane demonstracyjne mają trwały baner.

Próba rozpoczęcia nowego treningu przy jednej aktywnej sesji pokazuje:

1. główne `Wróć do treningu`;
2. drugorzędne `Zakończ i rozpocznij nowy`, prowadzące przez istniejące
   podsumowanie daty i czasu;
3. osobne niebezpieczne `Usuń i rozpocznij nowy`, wymagające destrukcyjnego
   potwierdzenia.

Przy kilku aktywnych sesjach każda ma własny, niescalony zestaw tych akcji.
Start nowej sesji nadal zapisuje datę automatycznie. Usunięcie sesji nie zmienia
planu, wersji planu ani rzeczywistego 1RM.

### `/plany`

Jedna karta wybranego planu i jedno CTA `Otwórz plan`. Import i nowy plan są
drugorzędne. Karuzela zachowuje strzałki, wskaźnik, dotyk i klawiaturę.

### `/plany/[id]`

Wybór jednostki poprzedza zwarte karty ćwiczeń. Superseria ma wspólną ramkę,
opcjonalność jest jawna, brak kg nie jest zerem. `Wszystkie serie`, źródła,
wersje i cały plan są dostępne na żądanie. Archiwum jest tylko do odczytu.

### `/plany/edytor`

Cała karta otwiera pełną edycję ćwiczenia. Najpierw nazwa i serie, potem
wariant/sprzęt/przypisanie. Osobne stany obejmują blok serii, jedną serię,
trening/kolejność, usunięcie i błąd walidacji. Pasek niezapisanych zmian jest w
toku strony na mobile i nie zasłania nawigacji.

### `/plany/import`

Plik i zdjęcie są głównymi źródłami. Tekst i głos są drugorzędne. Ręczny
edytor działa bez AI. Statusy nie obiecują zapisu przed serwerem. Import
zatwierdzony prowadzi do prawdziwego planu.

### Korekta importu

Trzy etapy: Nazwy → Serie i superserie → Podsumowanie. Jedno pytanie naraz.
Nierozwiązane pytanie blokuje publikację. Źródło mobile jest pełnoekranowe,
desktopowe stoi obok planu. Edycja nazwy, bloku i pojedynczej serii zachowuje
ID, uwagi i opcjonalność.

### `/trening/[id]` — przegląd

W toku pokazuje wymagane, opcjonalne, dodatkowe i pominięte serie. Superserie
są prowadzone rundami. Zakończona sesja jest tylko do odczytu. Kontynuacja jest
główną akcją; komentarz, dodatkowe ćwiczenie, zakończenie i usunięcie są
drugorzędne.

### `/trening/[id]` — jedna seria

Historyczny cel jest oddzielony od wykonania. Poprzedni wynik pochodzi tylko z
porównywalnego wariantu. `Brak wartości w planie`, `Nie dotyczy` i `0 kg` są
trzema różnymi stanami. Czas/dystans nie są powtórzeniami. Zapis czeka na ACK i
GET. Błąd zachowuje szkic i pełny retry. Konflikt wymaga porównania. Powrót z
brudnym szkicem daje Zapisz/Odrzuć/Zostań. Opcjonalna seria nie wykonuje się
przez samo otwarcie.

### Dyktowanie

Pokazuje nagrywanie, zatrzymanie, anulowanie i odmowę uprawnienia. Transkrypcja
jest poprawialna. Karta propozycji ma jedno świadome zatwierdzenie. Brak głosu
nie blokuje ręcznego formularza.

### Zakończenie i usunięcie

Podsumowanie pokazuje prawdziwe liczniki i pozwala skorygować czas bez zmiany
historycznych celów. Podwójna godzina DST wymaga jawnego offsetu. Trwałe
usunięcie ma osobny destrukcyjny dialog.

### `/historia`

Kalendarz poniedziałek–niedziela, wybrany dzień i wiele osobnych sesji. Prawdziwa
godzina albo „godzina nieznana”. Sesja aktywna ma `Wznów`, zakończona
`Otwórz trening`, a Postęp pozostaje osobną akcją.

### `/postep`

Ostatni wynik jest ważniejszy niż wykres. Jeden punkt to jeden trening danego
ćwiczenia i wariantu. Jeden punkt nie tworzy trendu, brak tworzy przerwę, nie
zero. Brak podstawy porównania nie pokazuje `0%`. Rekordy obejmują całą
historię. Pomoc rozróżnia szacunek od rzeczywistego 1RM z Profilu.

### `/profil`

Jedna akcja zapisuje rzeczywiste 1RM. Profil pokazuje krok obciążenia, strefę,
historię i pustą historię. Konto demo nie zapisuje. Wylogowanie jest
destrukcyjną akcją sesji, nie głównym CTA strony.

### `/logowanie`

Autofill i menedżery haseł pozostają obsługiwane. Błąd nie ujawnia istnienia
konta. Osobne komunikaty: sesja wygasła i wylogowano. Środowisko bez logowania
prowadzi wyłącznie do jawnie przykładowych danych.

### `/ustaw-haslo`

Formularz ma jedno pole nowego hasła. Minimum 12 znaków jest widoczne przed
walidacją. Błąd jest związany z tym polem. Nieudany zapis zachowuje wartość.
Stan wysyłania blokuje duplikację.

## 11. Wspólne komponenty

Kanoniczna strona komponentów zawiera:

- Button: primary, secondary, ghost, danger;
- pole i trwałą etykietę;
- stepper, który nie zastępuje wpisu z klawiatury;
- ListRow;
- Card;
- StatusBadge;
- SegmentedControl;
- Notice;
- EmptyState;
- Dialog;
- mobile BottomNav;
- desktop Sidebar.

Dialog mobile jest pełnoekranowy. Dialog desktop jest modalny. Zamknięcie,
anulowanie i Escape odrzucają niezastosowane pola i przywracają fokus.

## 12. Dostępność

- minimum `44×44px` dla głównych celów;
- widoczny `:focus-visible`;
- logiczna kolejność fokusu;
- właściwe landmarks i nagłówki;
- nazwa dostępna dla każdego przycisku ikonowego;
- trwałe etykiety pól;
- `aria-invalid` i powiązany komunikat błędu;
- status nie zależy wyłącznie od koloru;
- obsługa Escape i powrót fokusu w dialogach;
- obsługa klawiatury karuzeli, kalendarza, wykresu i rekordów;
- alternatywa listowa dla punktów wykresu;
- zoom tekstu 200%;
- `prefers-reduced-motion`;
- brak poziomego overflow przy `360/390/430px`.

## 13. Mapowanie na repozytorium

Fundament:

- `src/app/globals.css`,
- `src/app/layout.tsx`,
- `src/components/app-shell.tsx`,
- `src/components/ui/*`.

Trening i plany:

- `src/app/page.tsx`,
- `src/app/plany/page.tsx`,
- `src/app/plany/[id]/page.tsx`,
- `src/app/trening/[id]/page.tsx`,
- `src/components/plan-carousel*`,
- `src/components/plan-preview*`,
- `src/components/exercise-summary*`,
- `src/components/workout-*`,
- `src/components/plan-workout.module.css`.

Import i edytor:

- `src/app/plany/import/page.tsx`,
- `src/app/plany/edytor/page.tsx`,
- `src/components/import-*`,
- `src/components/review-*`,
- `src/components/compact-plan-editor*`,
- `src/components/plan-edit-dialogs.tsx`,
- `src/components/plan-authoring.module.css`.

Historia:

- `src/app/historia/page.tsx`,
- `src/components/history/*`,
- `src/lib/workouts/calendar*`.

Postęp:

- `src/app/postep/page.tsx`,
- `src/components/progress/*`,
- `src/lib/progress/*`.

Profil i Auth:

- `src/app/profil/page.tsx`,
- `src/app/logowanie/page.tsx`,
- `src/app/ustaw-haslo/page.tsx`,
- `src/components/one-rep-max-editor*`,
- `src/components/account*`.

## 14. Kolejność implementacji

1. Zaktualizuj manifest stanu i potwierdź aktualny HEAD.
2. Fundament Tempo i wspólne komponenty.
3. Trening, Plany i Podgląd planu.
4. Przegląd sesji, jedna seria, głos i zakończenie.
5. Import, Korekta i Edytor.
6. Historia.
7. Postęp.
8. Profil, Logowanie i Ustaw hasło.
9. Niezależna integracja całego przepływu.

Nie powtarzaj pracy T15-C/D/E bez porównania aktualnego kodu z klatkami.

## 15. Weryfikacja

Używaj poleceń z repozytorium i `docs/TESTING.md`. Minimum po szerokiej zmianie:

```bash
npm run typecheck
npm test
npm run build
```

Uruchom właściwe testy T13/T15. Sprawdź:

- 360, 390, 430px i desktop;
- safe-area i brak zasłoniętych kontrolek;
- klawiaturę, fokus, Escape i powrót fokusu;
- `null`, `0`, „Nie dotyczy”;
- błąd sieci, retry i konflikt;
- brudny szkic i zamknięcie karty;
- wiele sesji dnia i godzina nieznana;
- pusty/jeden/przerwany wykres;
- konto prywatne, demo i anonimowe;
- brak płatnego AI w regresji.

Fizyczny Safari/iPhone raportuj oddzielnie.

## 16. Kryteria odbioru

- wszystkie klatki z katalogu mają implementacyjny odpowiednik lub jawnie
  udokumentowane zachowanie wspólnego komponentu;
- hierarchia i jedna główna akcja odpowiadają Tempo;
- mobile i desktop używają tej samej semantyki;
- nie ma konkurencyjnych wariantów ani przełącznika motywu;
- nie ma nowych funkcji produktu;
- prawdziwe dane nie są zastępowane wartościami z makiety;
- build, typy i adekwatne testy przechodzą;
- dokumentacja i handoff opisują rzeczywisty stan;
- brak sekretów i prywatnych źródeł w repozytorium.

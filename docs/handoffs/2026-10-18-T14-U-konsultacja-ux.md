# Handoff — T14-U — konsultacja UI/UX

- Data/autor: 2026-10-18, Codex, jeden wykonawca.
- Status: done — konsultacja; T14/K pozostają review.
- Git: zastane liczne zmiany śledzone i nieśledzone; bez commit/push, bez ustalania nowego SHA.
- Poprzedni handoff: [T14-K](2026-10-18-T14-K-kolorystyka.md).

## Cel i wykonana praca

Odczytano kontekst projektu, specyfikację T14 i decyzje D038–D041. Zastosowano impeccable context oraz routing dla pytania o workflow. Otworzono obie wskazane galerie w przeglądarce, odczytano treść i obejrzano początkowe viewporty. Nie wykonano pełnego audytu ekranów.

Rekomendacja (propozycja): nie wymagać wyboru wszystkich ośmiu ekranów przed dopracowaniem głównego przepływu A/A/A/C. Najpierw nawigacja, zapis serii, klawiatura, stany błędu i zachowanie szkiców; potem wspólne reguły wizualne, pozostałe układy i paleta. Las pozostaje punktem odniesienia. Native-like oznacza przewidywalne interakcje, czytelne cele dotyku i szybki feedback. Nie obiecywać offline ani zapisu przed ACK.

Proponowane narzędzia: impeccable critique/shape, potem audit/polish; React Aria do zachowań komponentów przy zachowaniu własnego CSS albo shadcn/ui do szerszego zestawu komponentów. Nie wdrażać obu zestawów równolegle bez potrzeby. Lucide do ikon interfejsu; Motion opcjonalnie dla bardziej złożonych przejść. Żadnej zależności nie zainstalowano ani nie sprawdzono jej integracji z projektem.

Źródła odczytane 2026-10-18:
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- https://www.w3.org/TR/wcag/
- https://developer.apple.com/design/human-interface-guidelines
- https://m3.material.io/
- https://react-aria.adobe.com/quality
- https://ui.shadcn.com/docs/changelog/2026-01-base-ui
- https://lucide.dev/guide/react/
- https://motion.dev/docs/react-animation

## Zmienione pliki

Wyłącznie docs/ROADMAP.md, docs/STATUS.md, docs/CHANGELOG.md i niniejszy handoff. Brak decyzji architektonicznej lub nowego wymagania zatwierdzonego przez użytkownika; DECISIONS bez zmian.

## Weryfikacja i ograniczenia

Odczyt obu lokalnych URL i początkowych zrzutów w IAB zakończony. Przegląd źródeł dostawców i dokumentacji repo. Nie testowano interakcji, fizycznego telefonu, Safari, API, kontrastu ani builda; to konsultacja, bez zmiany produktu. Prywatnej treści ani zrzutów nie zapisano w repo. Impeccable sygnalizuje starszy schemat PRODUCT i brak buildPath; bez naprawy przy okazji.

## Następny krok i środowisko

Po zleceniu użytkownika dopracować główny przepływ T14; wybór wszystkich dodatkowych ekranów nie jest technicznym blokerem makiet. Brak nowych serwerów lub usług, instalacji i publikacji. Dotychczasowe serwery pozostawiono.

## Prompt dla kolejnego agenta

Rekomendacja GPT-6.1 Sol / medium: celowana praca projektowa ogranicza koszt. Prompt niczego nie uruchamia.

```text
Kontynuuj T14 w /Users/jakub.olech/GIT/apka-plan-treningowy: dopracuj propozycję mobilnego przepływu Plany → Podgląd → Szczegóły → Zapis serii, zachowując A/A/A/C. Zacznij od AGENTS.md, README.md, docs/STATUS.md, docs/ROADMAP.md, docs/DECISIONS.md, docs/TESTING.md, docs/design/t14-selected-spec.md oraz docs/handoffs/2026-10-18-T14-U-konsultacja-ux.md. Użyj impeccable. Zakres: makiety i dokumentacja, bez src i publikacji. Odbiór: spójna nawigacja, czytelne stany zapisu/błędu, obsługa klawiatury, 360/390/430 px i cztery karty przy 390×844. Paleta i pozostałe układy są niewybrane; użyj obecnego Las jako roboczego odniesienia. Telefon/Safari wymagają osobnej weryfikacji. Aktualizuj statusy, handoff i prompt. Model: GPT-6.1 Sol / medium — ograniczony zakres i celowane sprawdzenia kontrolują koszt.
```

# Handoff — T00 — dokumentacja startowa

- Data: 2026-10-11. Autor: Codex.
- Zadanie: T00, done. Zakres sesji: wyłącznie dokumentacja.
- Git: katalog początkowo pusty, bez `.git`; nie inicjalizowano Git, brak branch/commit/push.
- Wcześniejszy handoff: brak.

## Wykonano

Przygotowano specyfikację produktu, architekturę, model danych, głos/import, scenariusze ekranów, plan T00–T12 i zasady kontynuacji. Wymagania użytkownika są odróżnione od rekomendacji. Głos obejmuje również dodatkowe ćwiczenia, poprawki serii i komentarze, a wpisy ręczne działają niezależnie od AI.

Punkt wejścia: [README](../../README.md), [AGENTS](../../AGENTS.md), [STATUS](../STATUS.md), [ROADMAP](../ROADMAP.md), [WORKFLOW](../WORKFLOW.md). Pozostałe specyfikacje są podlinkowane w README.

## Weryfikacja

Przejrzano dokumentację OpenAI dotyczącą transkrypcji, plików, Structured Outputs, Decisions i integracji głosu z Decisions. Źródła zapisane w [AI_AND_VOICE](../AI_AND_VOICE.md). Sprawdzono także wskazane przez użytkownika strony TypeSafe AI i Vercel dotyczące Jev. Nie wykonywano wywołań płatnego API ani benchmarku modeli.

Sprawdzono skryptem wszystkie lokalne linki Markdown oraz komplet i referencje identyfikatorów zadań T00–T12; wynik poprawny. Przejrzano zgodność zakresu, statusów i zależności. Testy/build aplikacji nie dotyczyły tej sesji — kod nie istnieje.

## Decyzje

[DECISIONS](../DECISIONS.md): D001–D003 to wymagania potwierdzone przez użytkownika, D004–D007 to propozycje techniczne. Nie traktować Next.js/Supabase, reguły zaokrąglania ani konkretnego UX głosu jako wdrożonych funkcji.

## Otwarte sprawy

Przykładowe plany, budżet oraz dostęp do usług. Użytkownik odpowiedział na pytanie o Jev: chodzi o TypeSafe AI, dostępne także w Vercel AI Gateway. Q01 zamknięte; T12 uwzględnia porównanie Jev z Decisions i prostą ekstrakcją OpenAI. Nie wybrano modelu do podstawowego importu/transkrypcji ani wersji bibliotek.

## Następny krok

Po zleceniu implementacji przejąć T01, zapisać właściciela i rozpocząć od szkieletu aplikacji z syntetycznymi danymi. Przeczytać [UX](../UX.md) i [DATA_MODEL](../DATA_MODEL.md). Nie rozpoczynać od AI przed działającym modelem ręcznego zapisu.

## Środowisko

Nie instalowano zależności, nie uruchamiano serwerów, nie konfigurowano sekretów ani usług, nie publikowano aplikacji. Powstały wyłącznie pliki Markdown.

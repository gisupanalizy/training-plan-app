# T12-J — Jev i OpenAI Decisions dla nazw ćwiczeń

Data: 2026-10-20. Eksperyment przed ewentualną integracją, bez zmian aplikacji. Oba modele wywołano naprawdę przez `https://ai-gateway.vercel.sh/v1/decisions` z kluczem AI Gateway. Nie sprawdzano ich w przeglądarce ani na produkcyjnym serwerze aplikacji.

## Zestaw i protokół

- 47 różnych nazw z pierwszych dwóch lokalnych źródeł `fixtures/t06/real/expected.json` i 15 syntetycznych parafraz: 62 przypadki. Do usług wysyłano pojedynczą nazwę, a nie dokument, serie, obciążenia lub dane konta. Prywatnych nazw źródłowych i pełnych odpowiedzi nie zapisano w repozytorium.
- Każdy model dostał identyczną polską instrukcję: wybrać tylko semantycznie ten sam ruch z zachowaniem sprzętu, chwytu, asysty i wariantu; dla alternatywy, odmiennego ruchu lub niepewności wybrać `none`. Opcje były identyczne: 50 kluczy `exerciseNames` z nazwami PL/EN oraz `none`.
- Etykiety wstępne: 52 bezpieczne przypisania i 10 oczekiwanych odmów. Powstały z istniejących sprawdzonych nazw oraz ręcznej oceny przypadków do tej próby; użytkownik nie zatwierdził całego zestawu jako wzorca. Trudne rozróżnienia mogą wymagać oceny trenera. Wyniki mierzą zgodność z tymi etykietami, nie prawdę kliniczną ani skuteczność na przyszłych planach.
- Model Jev: `typesafe-ai/jev-1.14.0`. Model OpenAI: `openai/gpt-6-luna-decisions`. Jeden przypadek na żądanie, grupy po 4 równoległe żądania, ten sam komputer i Gateway. Najpierw próba jednego przykładu, potem 25 trudnych i pełne 62 dla Jev; dla OpenAI próba jednego, pełne 62, następnie ponowienie 25 trudnych. Liczby poniżej dotyczą pojedynczego pełnego przebiegu 62 przypadków.

## Wynik pełnego przebiegu

- **Jev:** 56/62 zgodnych odpowiedzi; 51/52 bezpiecznych przypisań; 5/10 poprawnych odmów. Pięć błędnych przypisań miało pewność 0,56–0,99, w tym cztery co najmniej 0,90. Jedna nazwa z bezpiecznym odpowiednikiem dostała `none`. Czas żądania po stronie klienta: p50 857 ms, p95 1846 ms. 110 719 tokenów wejścia; szacunkowo **0,004429 USD** przy 0,04 USD/1 mln tokenów.
- **OpenAI Decisions:** 59/62 zgodnych odpowiedzi; 52/52 bezpiecznych przypisań; 7/10 poprawnych odmów. Trzy błędne przypisania miały pewność 0,73, 0,85 i 0,91. Czas: p50 1003 ms, p95 1923 ms. 73 720 tokenów wejścia; szacunkowo **0,007372 USD** przy 0,10 USD/1 mln tokenów.
- OpenAI poprawił w tej próbie trzy odpowiedzi Jev: rozpoznał jedną nazwę maszyny oraz odmówił zwykłego przysiadu zamiast wariantu z pauzą i zwykłego wyciskania hantli zamiast wariantu na skosie. Oba modele błędnie przypisały nazwę źródłową zawierającą alternatywę dwóch ruchów, „Most biodrowy na jednej nodze” do hip thrust jednonóż i „Martwy ciąg na prostych nogach” do RDL. Powtórne 25 trudnych przypadków dało te same pięć błędów Jev i te same trzy błędy OpenAI.

Kwoty są oszacowaniem z tokenów zwróconych przez API i aktualnych stawek wejścia, nie potwierdzeniem faktury. Próby jednego i powtórki 25 zwiększają łączny szacunkowy koszt względem podanych kwot pełnego przebiegu. Przy 62 przypadkach i jednej wersji instrukcji różnica trzech trafień nie stanowi ogólnego rankingu modeli. Czas obejmuje sieć i Gateway, a nie samą inferencję; nie jest gwarancją opóźnienia w produkcji.

## Wniosek i granica

OpenAI Decisions był lepszy w tej próbce za szacunkowo 0,002943 USD więcej w pełnym przebiegu. **Żaden model nie może samodzielnie dopisywać aliasów ani wybierać ikony**, bo oba pewnie przypisały nieodpowiednie ruchy. Próg pewności nie jest zweryfikowaną ochroną: Jev mylił się nawet przy 0,99, a OpenAI przy 0,91.

Propozycja do osobnego rozstrzygnięcia: podczas korekty importu najpierw używać dokładnego słownika, a dla nieznanej nazwy ewentualnie pokazać sugestię modelu użytkownikowi. Aplikacja sprawdza dozwolony klucz, sprzęt i wariant; użytkownik zatwierdza lub pozostawia oryginał. Nie zapisuje się automatycznie globalnego aliasu. To nie jest zatwierdzony ani wdrożony kontrakt.

## Basal i środowisko

Na prośbę użytkownika sprawdzono dokumentację Basal. Model tekstowy da się uruchomić jako własny serwer API, również na zewnętrznym GPU, lecz wymaga osobnego hostingu modeli i nie występuje jako gotowy model w sprawdzonym katalogu Vercel AI Gateway. Publiczne demo wysyła zapytania do Hugging Face. Po doprecyzowaniu wymogu pracy online z Vercel zatrzymano instalację lokalną przed pobraniem wag; środowisko tymczasowe usunięto. Basal **nie otrzymał żadnej nazwy ani nie został przetestowany inferencyjnie**.

## Źródła i pliki tymczasowe

- [OpenAI Docs — Decisions API](https://developers.openai.com/api/docs/guides/decisions) — model `gpt-6-luna`, format i stawka.
- [Vercel — OpenAI Decisions przez AI Gateway](https://vercel.com/changelog/openai-decisions-api-now-available-on-ai-gateway) — identyfikator Gateway i zgodny endpoint.
- [Vercel — Jev 1.14.0](https://vercel.com/ai-gateway/models/jev-1.14.0) — stawka Jev.
- [Basal — instalacja](https://github.com/rkinas/basal/blob/main/docs/INSTALL.md), [demo](https://basal.si5.pl/demo/) — własny serwer i zewnętrzne przetwarzanie demo.
- Tymczasowy skrypt i surowe wyniki: `/private/tmp/jev-exercise-probe.mjs`, `/private/tmp/jev-exercise-probe-result-62.json`, `/private/tmp/openai-decisions-exercise-probe-result-62.json`. Nie są w repozytorium i mogą zniknąć po czyszczeniu systemu. Klucze pozostały w ignorowanych lokalnych plikach `.env*`; nie zapisano ich w raporcie.

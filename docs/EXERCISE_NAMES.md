# Słownik ćwiczeń PL/EN — T06-R1

Referencja EN: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), licencja [Unlicense](https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE). Projekt przechowuje tylko nazwy i sprzęt z 876 pozycji; data pobrania i SHA256 są w `src/lib/exercises/en-reference.json`. Aktualizacja: `node scripts/update-exercise-reference.mjs`, wymaga dostępu sieciowego. Nie pobieramy ani nie dystrybuujemy obrazów bazy.

`src/lib/exercises/names.ts` zawiera oddzielne zweryfikowane polskie nazwy i aliasy, zaczynając od trzech rzeczywistych źródeł. Nie jest pełnym tłumaczeniem bazy. Dokładna normalizacja pisowni pozwala pokazać polską nazwę, ale nie scala nachwytu/podchwytu, asysty, sprzętu ani nieznanego wariantu. Wybór niepewnego dopasowania jest propozycją użytkownika. Oryginał źródła i wariant pozostają zapisane; prywatny katalog właściciela ma własne ID niezależne od referencji.

Testy w `src/lib/imports/t06r1.test.ts` obejmują rozdzielenie chwytów/asysty i zachowanie oryginałów. Jakość nowych aliasów wymaga weryfikacji znaczenia, nie tylko podobieństwa tekstu.

-- Korekta importu pozostaje prywatna i wygasa razem z zadaniem.
alter table public.imports add column review_data jsonb;

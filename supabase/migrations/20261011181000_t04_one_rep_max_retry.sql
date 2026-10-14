-- Identyfikator operacji pozwala bezpiecznie ponowić zapis rzeczywistego 1RM po utracie odpowiedzi.
alter table public.one_rep_max_records add column client_operation_id uuid;
create unique index one_rep_max_operation_owner_unique on public.one_rep_max_records(owner_id, client_operation_id)
  where client_operation_id is not null;

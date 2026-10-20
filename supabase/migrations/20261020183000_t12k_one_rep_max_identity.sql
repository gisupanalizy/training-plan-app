-- Cel procentowy może użyć datowanego 1RM innego wiersza tej samej tożsamości.
-- Stary rekord zostaje przy swoim exercise_id. Snapshot już zapisanej serii nie jest ruszany.
alter table public.performed_sets drop constraint performed_sets_one_rep_max_record_id_owner_id_exercise_id_fkey;

create function public.t12k_guard_one_rep_max_snapshot() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.one_rep_max_record_id is null then return new; end if;
  if not exists (
    select 1
    from public.one_rep_max_records r
    join public.exercises recorded on recorded.id = r.exercise_id and recorded.owner_id = r.owner_id
    join public.exercises current_exercise on current_exercise.id = new.exercise_id and current_exercise.owner_id = new.owner_id
    where r.id = new.one_rep_max_record_id and r.owner_id = new.owner_id
      and (
        r.exercise_id = new.exercise_id
        or (recorded.identity_id is not null and recorded.identity_id = current_exercise.identity_id)
      )
  ) then
    raise exception '1RM snapshot identity mismatch' using errcode = '23503';
  end if;
  return new;
end $$;

create trigger guard_one_rep_max_identity before insert on public.performed_sets
  for each row execute function public.t12k_guard_one_rep_max_snapshot();

revoke all on function public.t12k_guard_one_rep_max_snapshot() from public, anon, authenticated;

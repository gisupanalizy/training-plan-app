-- T09: prywatny licznik rezerwacji prób głosu. Brak przechowywania nagrań i transkrypcji.
create table public.voice_attempts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  reserved_usd numeric(8,4) not null check (reserved_usd = 0.01)
);
create index voice_attempts_window on public.voice_attempts(created_at);
alter table public.voice_attempts enable row level security;
revoke all on public.voice_attempts from public, anon, authenticated;
grant select, insert, delete on public.voice_attempts to service_role;

create function public.reserve_voice_attempt(p_owner uuid, p_budget_usd numeric)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_owner is null or p_budget_usd is null or p_budget_usd < 0.01 then return false; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('t09-global-voice-budget'));
  if coalesce((select sum(reserved_usd) from public.voice_attempts where created_at > now() - interval '1 day'), 0) + 0.01 > p_budget_usd then return false; end if;
  insert into public.voice_attempts(owner_id,reserved_usd) values(p_owner,0.01);
  return true;
end $$;
revoke all on function public.reserve_voice_attempt(uuid,numeric) from public, anon, authenticated;
grant execute on function public.reserve_voice_attempt(uuid,numeric) to service_role;

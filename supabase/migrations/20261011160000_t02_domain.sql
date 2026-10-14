-- T02: prywatny model treningu. Wymaga schematu auth z Supabase.
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  owner_id uuid generated always as (id) stored,
  created_at timestamptz not null default now(),
  locale text not null default 'pl',
  time_zone text not null default 'Europe/Warsaw',
  weight_unit text not null default 'kg' check (weight_unit = 'kg'),
  rounding_increment_kg numeric(7,2) not null default 2.5 check (rounding_increment_kg > 0),
  unique (id, owner_id)
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null check (length(btrim(name)) > 0),
  aliases text[] not null default '{}',
  variant text,
  equipment text,
  load_mode text not null default 'external' check (load_mode in ('external','bodyweight','assisted','time','distance')),
  is_custom boolean not null default true,
  unique (id, owner_id)
);

create table public.one_rep_max_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  exercise_id uuid not null,
  value_kg numeric(8,2) not null check (value_kg > 0),
  effective_on date not null,
  note text,
  foreign key (exercise_id, owner_id) references public.exercises(id, owner_id),
  unique (id, owner_id, exercise_id)
);
create index on public.one_rep_max_records(owner_id, exercise_id, effective_on desc, created_at desc);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  name text not null check (length(btrim(name)) > 0),
  status text not null default 'draft' check (status in ('draft','active','archived')),
  current_version_id uuid,
  unique (id, owner_id)
);

create table public.plan_versions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  plan_id uuid not null,
  version_number integer not null check (version_number > 0),
  state text not null default 'draft' check (state in ('draft','published')),
  published_at timestamptz,
  source_kind text check (source_kind in ('manual','import')),
  check ((state = 'draft' and published_at is null) or (state = 'published' and published_at is not null)),
  foreign key (plan_id, owner_id) references public.plans(id, owner_id),
  unique (plan_id, version_number),
  unique (id, owner_id),
  unique (id, owner_id, plan_id)
);
alter table public.plans add constraint plans_current_version_fk
  foreign key (current_version_id, owner_id, id)
  references public.plan_versions(id, owner_id, plan_id) deferrable initially immediate;

create table public.plan_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  plan_version_id uuid not null,
  week_number integer not null check (week_number > 0),
  day_label text not null check (length(btrim(day_label)) > 0),
  position integer not null check (position > 0),
  note text,
  foreign key (plan_version_id, owner_id) references public.plan_versions(id, owner_id),
  unique (plan_version_id, week_number, position),
  unique (id, owner_id),
  unique (id, owner_id, plan_version_id)
);

create table public.planned_exercises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  plan_session_id uuid not null,
  exercise_id uuid not null,
  original_name text not null check (length(btrim(original_name)) > 0),
  position integer not null check (position > 0),
  superset_group text check (superset_group is null or length(btrim(superset_group)) > 0),
  note text,
  foreign key (plan_session_id, owner_id) references public.plan_sessions(id, owner_id),
  foreign key (exercise_id, owner_id) references public.exercises(id, owner_id),
  unique (plan_session_id, position),
  unique (id, owner_id),
  unique (id, owner_id, plan_session_id)
);

create table public.planned_sets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  planned_exercise_id uuid not null,
  position integer not null check (position > 0),
  set_kind text not null default 'work' check (set_kind in ('warmup','ramp','work','backoff','drop')),
  reps_min integer check (reps_min >= 0),
  reps_max integer check (reps_max >= 0),
  is_amrap boolean not null default false,
  load_type text not null default 'unspecified' check (load_type in ('absolute','percent_1rm','bodyweight','unspecified')),
  target_kg numeric(8,2) check (target_kg >= 0),
  target_percent numeric(5,2) check (target_percent > 0 and target_percent <= 100),
  bodyweight_adjustment text check (bodyweight_adjustment in ('none','additional','assistance')),
  bodyweight_delta_kg numeric(8,2) check (bodyweight_delta_kg > 0),
  dumbbell_basis text check (dumbbell_basis in ('per_hand','total')),
  duration_seconds integer check (duration_seconds >= 0),
  distance_meters numeric(10,2) check (distance_meters >= 0),
  rest_seconds integer check (rest_seconds >= 0),
  tempo text,
  target_rpe numeric(3,1) check (target_rpe between 0 and 10),
  target_rir numeric(3,1) check (target_rir >= 0),
  note text,
  check (reps_max is null or reps_min is not null),
  check (reps_max is null or reps_max >= reps_min),
  check ((load_type = 'absolute' and target_kg is not null and target_percent is null)
      or (load_type = 'percent_1rm' and target_kg is null and target_percent is not null)
      or (load_type in ('bodyweight','unspecified') and target_kg is null and target_percent is null)),
  check ((load_type = 'bodyweight' and
      ((bodyweight_adjustment in ('additional','assistance') and bodyweight_delta_kg is not null)
        or (bodyweight_adjustment = 'none' and bodyweight_delta_kg is null)
        or (bodyweight_adjustment is null and bodyweight_delta_kg is null)))
      or (load_type <> 'bodyweight' and bodyweight_adjustment is null and bodyweight_delta_kg is null)),
  foreign key (planned_exercise_id, owner_id) references public.planned_exercises(id, owner_id),
  unique (planned_exercise_id, position),
  unique (id, owner_id),
  unique (id, owner_id, planned_exercise_id)
);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  plan_version_id uuid,
  plan_session_id uuid,
  performed_on date not null,
  status text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  comment text,
  revision integer not null default 0 check (revision >= 0),
  completed_at timestamptz,
  check ((plan_version_id is null and plan_session_id is null) or (plan_version_id is not null and plan_session_id is not null)),
  foreign key (plan_version_id, owner_id) references public.plan_versions(id, owner_id),
  foreign key (plan_session_id, owner_id, plan_version_id) references public.plan_sessions(id, owner_id, plan_version_id),
  unique (id, owner_id, plan_session_id),
  unique (id, owner_id)
);

create table public.performed_exercises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  workout_session_id uuid not null,
  plan_session_id uuid,
  planned_exercise_id uuid,
  exercise_id uuid not null,
  position integer not null check (position > 0),
  source_kind text not null check (source_kind in ('planned','extra')),
  target_name_snapshot text not null check (length(btrim(target_name_snapshot)) > 0),
  target_note_snapshot text,
  superset_group_snapshot text,
  check ((source_kind = 'planned' and plan_session_id is not null and planned_exercise_id is not null)
      or (source_kind = 'extra' and plan_session_id is null and planned_exercise_id is null)),
  foreign key (workout_session_id, owner_id) references public.workout_sessions(id, owner_id),
  foreign key (workout_session_id, owner_id, plan_session_id) references public.workout_sessions(id, owner_id, plan_session_id),
  foreign key (planned_exercise_id, owner_id, plan_session_id) references public.planned_exercises(id, owner_id, plan_session_id),
  foreign key (exercise_id, owner_id) references public.exercises(id, owner_id),
  unique (workout_session_id, position),
  unique (id, owner_id),
  unique (id, owner_id, planned_exercise_id),
  unique (id, owner_id, exercise_id),
  unique (id, owner_id, workout_session_id)
);

create table public.performed_sets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  performed_exercise_id uuid not null,
  exercise_id uuid not null,
  planned_exercise_id uuid,
  planned_set_id uuid,
  position integer not null check (position > 0),
  source_kind text not null check (source_kind in ('planned','extra')),
  status text not null default 'pending' check (status in ('pending','completed','skipped')),
  target_kind_snapshot text check (target_kind_snapshot in ('warmup','ramp','work','backoff','drop')),
  target_reps_min_snapshot integer check (target_reps_min_snapshot >= 0),
  target_reps_max_snapshot integer check (target_reps_max_snapshot >= 0),
  target_amrap_snapshot boolean,
  target_load_type_snapshot text check (target_load_type_snapshot in ('absolute','percent_1rm','bodyweight','unspecified')),
  target_kg_snapshot numeric(8,2) check (target_kg_snapshot >= 0),
  target_percent_snapshot numeric(5,2) check (target_percent_snapshot > 0 and target_percent_snapshot <= 100),
  target_bodyweight_adjustment_snapshot text check (target_bodyweight_adjustment_snapshot in ('none','additional','assistance')),
  target_bodyweight_delta_kg_snapshot numeric(8,2) check (target_bodyweight_delta_kg_snapshot > 0),
  target_dumbbell_basis_snapshot text check (target_dumbbell_basis_snapshot in ('per_hand','total')),
  one_rep_max_record_id uuid,
  one_rep_max_kg_snapshot numeric(8,2) check (one_rep_max_kg_snapshot > 0),
  raw_target_kg_snapshot numeric(10,4) check (raw_target_kg_snapshot >= 0),
  rounded_target_kg_snapshot numeric(8,2) check (rounded_target_kg_snapshot >= 0),
  rounding_increment_kg_snapshot numeric(7,2) check (rounding_increment_kg_snapshot > 0),
  target_duration_seconds_snapshot integer check (target_duration_seconds_snapshot >= 0),
  target_distance_meters_snapshot numeric(10,2) check (target_distance_meters_snapshot >= 0),
  target_rest_seconds_snapshot integer check (target_rest_seconds_snapshot >= 0),
  target_tempo_snapshot text,
  target_rpe_snapshot numeric(3,1) check (target_rpe_snapshot between 0 and 10),
  target_rir_snapshot numeric(3,1) check (target_rir_snapshot >= 0),
  target_note_snapshot text,
  actual_reps integer check (actual_reps >= 0),
  actual_kg numeric(8,2) check (actual_kg >= 0),
  actual_duration_seconds integer check (actual_duration_seconds >= 0),
  actual_distance_meters numeric(10,2) check (actual_distance_meters >= 0),
  actual_rpe numeric(3,1) check (actual_rpe between 0 and 10),
  actual_rir numeric(3,1) check (actual_rir >= 0),
  actual_note text,
  check ((source_kind = 'planned' and planned_exercise_id is not null and planned_set_id is not null)
      or (source_kind = 'extra' and planned_exercise_id is null and planned_set_id is null)),
  check (target_reps_max_snapshot is null or target_reps_min_snapshot is not null),
  check (target_reps_max_snapshot is null or target_reps_max_snapshot >= target_reps_min_snapshot),
  check (source_kind = 'extra' or (target_kind_snapshot is not null and target_amrap_snapshot is not null and target_load_type_snapshot is not null)),
  check ((target_load_type_snapshot = 'absolute' and target_kg_snapshot is not null and target_percent_snapshot is null)
      or (target_load_type_snapshot = 'percent_1rm' and target_kg_snapshot is null and target_percent_snapshot is not null)
      or (target_load_type_snapshot in ('bodyweight','unspecified') and target_kg_snapshot is null and target_percent_snapshot is null)
      or (target_load_type_snapshot is null and target_kg_snapshot is null and target_percent_snapshot is null)),
  check ((target_load_type_snapshot = 'bodyweight' and
      ((target_bodyweight_adjustment_snapshot in ('additional','assistance') and target_bodyweight_delta_kg_snapshot is not null)
        or (target_bodyweight_adjustment_snapshot = 'none' and target_bodyweight_delta_kg_snapshot is null)
        or (target_bodyweight_adjustment_snapshot is null and target_bodyweight_delta_kg_snapshot is null)))
      or (target_load_type_snapshot is distinct from 'bodyweight' and target_bodyweight_adjustment_snapshot is null and target_bodyweight_delta_kg_snapshot is null)),
  check ((one_rep_max_record_id is null and one_rep_max_kg_snapshot is null and raw_target_kg_snapshot is null and rounded_target_kg_snapshot is null and rounding_increment_kg_snapshot is null)
      or (one_rep_max_record_id is not null and one_rep_max_kg_snapshot is not null and target_percent_snapshot is not null and raw_target_kg_snapshot is not null and rounded_target_kg_snapshot is not null and rounding_increment_kg_snapshot is not null)),
  check (raw_target_kg_snapshot is null or raw_target_kg_snapshot = round(one_rep_max_kg_snapshot * target_percent_snapshot / 100, 4)),
  check (rounded_target_kg_snapshot is null or rounded_target_kg_snapshot =
    (floor(raw_target_kg_snapshot / rounding_increment_kg_snapshot) +
      case when raw_target_kg_snapshot / rounding_increment_kg_snapshot - floor(raw_target_kg_snapshot / rounding_increment_kg_snapshot) > 0.5 then 1 else 0 end)
    * rounding_increment_kg_snapshot),
  check (status <> 'completed' or num_nonnulls(actual_reps, actual_kg, actual_duration_seconds, actual_distance_meters) > 0),
  check (status <> 'skipped' or num_nonnulls(actual_reps, actual_kg, actual_duration_seconds, actual_distance_meters) = 0),
  foreign key (performed_exercise_id, owner_id) references public.performed_exercises(id, owner_id),
  foreign key (performed_exercise_id, owner_id, exercise_id) references public.performed_exercises(id, owner_id, exercise_id),
  foreign key (performed_exercise_id, owner_id, planned_exercise_id) references public.performed_exercises(id, owner_id, planned_exercise_id),
  foreign key (planned_set_id, owner_id, planned_exercise_id) references public.planned_sets(id, owner_id, planned_exercise_id),
  foreign key (one_rep_max_record_id, owner_id, exercise_id) references public.one_rep_max_records(id, owner_id, exercise_id),
  unique (performed_exercise_id, position),
  unique (id, owner_id)
);

create table public.mutation_receipts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  client_operation_id uuid not null,
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  command_kind text not null check (length(btrim(command_kind)) > 0),
  workout_session_id uuid,
  resulting_revision integer check (resulting_revision >= 0),
  response jsonb not null,
  foreign key (workout_session_id, owner_id) references public.workout_sessions(id, owner_id),
  unique (owner_id, client_operation_id),
  unique (id, owner_id, workout_session_id)
);

create table public.workout_revisions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  workout_session_id uuid not null,
  revision integer not null check (revision > 0),
  mutation_receipt_id uuid not null,
  change_summary jsonb not null default '{}'::jsonb,
  foreign key (workout_session_id, owner_id) references public.workout_sessions(id, owner_id),
  foreign key (mutation_receipt_id, owner_id, workout_session_id) references public.mutation_receipts(id, owner_id, workout_session_id),
  unique (workout_session_id, revision),
  unique (mutation_receipt_id)
);

-- Opublikowana wersja i jej dzieci są stałym źródłem historii.
create function public.t02_guard_plan_version() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' and old.state = 'published' then
    raise exception 'published plan version is immutable';
  end if;
  return new;
end $$;
create trigger guard_plan_version before update on public.plan_versions
  for each row execute function public.t02_guard_plan_version();

create function public.t02_guard_current_version() returns trigger language plpgsql as $$
begin
  if new.status = 'active' and new.current_version_id is null then
    raise exception 'active plan requires a published version';
  end if;
  if new.current_version_id is not null and not exists (
    select 1 from public.plan_versions v
      where v.id = new.current_version_id and v.owner_id = new.owner_id and v.plan_id = new.id and v.state = 'published'
  ) then
    raise exception 'current version must be published and belong to plan';
  end if;
  return new;
end $$;
create trigger guard_current_version before insert or update on public.plans
  for each row execute function public.t02_guard_current_version();

create function public.t02_guard_plan_child() returns trigger language plpgsql as $$
declare v_version_id uuid; old_version_id uuid;
begin
  if tg_table_name = 'plan_sessions' then
    if tg_op <> 'DELETE' then v_version_id := new.plan_version_id; end if;
    if tg_op <> 'INSERT' then old_version_id := old.plan_version_id; end if;
  elsif tg_table_name = 'planned_exercises' then
    if tg_op <> 'DELETE' then
      select plan_version_id into v_version_id from public.plan_sessions where id = new.plan_session_id;
    end if;
    if tg_op <> 'INSERT' then
      select plan_version_id into old_version_id from public.plan_sessions where id = old.plan_session_id;
    end if;
  else
    if tg_op <> 'DELETE' then
      select s.plan_version_id into v_version_id from public.planned_exercises e
        join public.plan_sessions s on s.id = e.plan_session_id where e.id = new.planned_exercise_id;
    end if;
    if tg_op <> 'INSERT' then
      select s.plan_version_id into old_version_id from public.planned_exercises e
        join public.plan_sessions s on s.id = e.plan_session_id where e.id = old.planned_exercise_id;
    end if;
  end if;
  if exists (select 1 from public.plan_versions where id in (v_version_id, old_version_id) and state = 'published') then
    raise exception 'published plan contents are immutable';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;
create trigger guard_plan_sessions before insert or update or delete on public.plan_sessions
  for each row execute function public.t02_guard_plan_child();
create trigger guard_planned_exercises before insert or update or delete on public.planned_exercises
  for each row execute function public.t02_guard_plan_child();
create trigger guard_planned_sets before insert or update or delete on public.planned_sets
  for each row execute function public.t02_guard_plan_child();

-- Cele i źródła rozpoczętej sesji pozostają niezmienne także przy poprawce wyniku.
create function public.t02_guard_snapshot() returns trigger language plpgsql as $$
begin
  if row(old.owner_id, old.performed_exercise_id, old.exercise_id, old.planned_exercise_id, old.planned_set_id, old.position, old.source_kind,
         old.target_kind_snapshot, old.target_reps_min_snapshot, old.target_reps_max_snapshot, old.target_amrap_snapshot,
         old.target_load_type_snapshot, old.target_kg_snapshot, old.target_percent_snapshot,
         old.target_bodyweight_adjustment_snapshot, old.target_bodyweight_delta_kg_snapshot, old.target_dumbbell_basis_snapshot,
         old.one_rep_max_record_id,
         old.one_rep_max_kg_snapshot, old.raw_target_kg_snapshot, old.rounded_target_kg_snapshot,
         old.rounding_increment_kg_snapshot, old.target_duration_seconds_snapshot, old.target_distance_meters_snapshot,
         old.target_rest_seconds_snapshot, old.target_tempo_snapshot, old.target_rpe_snapshot, old.target_rir_snapshot,
         old.target_note_snapshot)
     is distinct from
     row(new.owner_id, new.performed_exercise_id, new.exercise_id, new.planned_exercise_id, new.planned_set_id, new.position, new.source_kind,
         new.target_kind_snapshot, new.target_reps_min_snapshot, new.target_reps_max_snapshot, new.target_amrap_snapshot,
         new.target_load_type_snapshot, new.target_kg_snapshot, new.target_percent_snapshot,
         new.target_bodyweight_adjustment_snapshot, new.target_bodyweight_delta_kg_snapshot, new.target_dumbbell_basis_snapshot,
         new.one_rep_max_record_id,
         new.one_rep_max_kg_snapshot, new.raw_target_kg_snapshot, new.rounded_target_kg_snapshot,
         new.rounding_increment_kg_snapshot, new.target_duration_seconds_snapshot, new.target_distance_meters_snapshot,
         new.target_rest_seconds_snapshot, new.target_tempo_snapshot, new.target_rpe_snapshot, new.target_rir_snapshot,
         new.target_note_snapshot) then
    raise exception 'session target snapshot is immutable';
  end if;
  return new;
end $$;
create trigger guard_performed_set_snapshot before update on public.performed_sets
  for each row execute function public.t02_guard_snapshot();

create function public.t02_guard_workout_anchor() returns trigger language plpgsql as $$
begin
  if row(old.owner_id, old.plan_version_id, old.plan_session_id, old.performed_on)
     is distinct from row(new.owner_id, new.plan_version_id, new.plan_session_id, new.performed_on) then
    raise exception 'workout source is immutable';
  end if;
  return new;
end $$;
create trigger guard_workout_anchor before update on public.workout_sessions
  for each row execute function public.t02_guard_workout_anchor();

create function public.t02_guard_performed_exercise() returns trigger language plpgsql as $$
begin
  if row(old.owner_id, old.workout_session_id, old.plan_session_id, old.planned_exercise_id,
         old.exercise_id, old.position, old.source_kind, old.target_name_snapshot,
         old.target_note_snapshot, old.superset_group_snapshot)
     is distinct from
     row(new.owner_id, new.workout_session_id, new.plan_session_id, new.planned_exercise_id,
         new.exercise_id, new.position, new.source_kind, new.target_name_snapshot,
         new.target_note_snapshot, new.superset_group_snapshot) then
    raise exception 'performed exercise snapshot is immutable';
  end if;
  return new;
end $$;
create trigger guard_performed_exercise before update on public.performed_exercises
  for each row execute function public.t02_guard_performed_exercise();

-- RLS i granty powstają w tej samej migracji co tabele. Brak dostępu anon.
do $$
declare t text;
begin
  foreach t in array array['profiles','exercises','one_rep_max_records','plans','plan_versions','plan_sessions',
    'planned_exercises','planned_sets','workout_sessions','performed_exercises','performed_sets',
    'mutation_receipts','workout_revisions'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update on table public.%I to authenticated', t);
    execute format('create policy %I on public.%I for select to authenticated using (owner_id = (select auth.uid()))', t || '_select_owner', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (owner_id = (select auth.uid()))', t || '_insert_owner', t);
    execute format('create policy %I on public.%I for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t || '_update_owner', t);
  end loop;
end $$;
-- Zapis wyniku wymaga przyszłej transakcyjnej komendy z rewizją i potwierdzeniem (T05).
-- Do tego czasu klient może czytać własną historię, ale nie może ominąć idempotencji bezpośrednim DML.
revoke insert, update on public.workout_sessions, public.performed_exercises,
  public.performed_sets, public.mutation_receipts, public.workout_revisions from authenticated;
-- Bezpośrednie usuwanie wersji i historii jest zablokowane; procedura usunięcia konta będzie osobnym zakresem.
revoke update on public.one_rep_max_records from authenticated;
-- Funkcje pomocnicze wywołują tylko triggery, nie klienci API.
revoke all on function public.t02_guard_plan_version(), public.t02_guard_current_version(), public.t02_guard_plan_child(), public.t02_guard_snapshot(), public.t02_guard_workout_anchor(), public.t02_guard_performed_exercise() from public, anon, authenticated;

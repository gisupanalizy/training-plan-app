-- T06-R1: zakresy i opcjonalność są częścią wersji planu oraz niezmiennego snapshotu.
alter table public.planned_exercises
  add column display_name text check (display_name is null or length(display_name) between 1 and 120),
  add column review_id text,
  add column source_ref text,
  add column set_count_min integer,
  add column set_count_max integer,
  add column set_count_source text,
  add column prescription_group text,
  add constraint planned_count_range check ((set_count_min is null and set_count_max is null) or
    (set_count_min is not null and set_count_max is not null and set_count_min between 1 and 30 and set_count_max between set_count_min and 30));
alter table public.planned_sets
  add column review_id text,
  add column source_ref text,
  add column is_optional boolean not null default false,
  add column target_kg_max numeric(10,2),
  add column duration_seconds_max integer,
  add column rest_seconds_max integer,
  add constraint planned_kg_range check (target_kg_max is null or (target_kg is not null and target_kg_max >= target_kg and target_kg_max <= 10000)),
  add constraint planned_duration_range check (duration_seconds_max is null or (duration_seconds is not null and duration_seconds_max >= duration_seconds and duration_seconds_max <= 10000)),
  add constraint planned_rest_range check (rest_seconds_max is null or (rest_seconds is not null and rest_seconds_max >= rest_seconds and rest_seconds_max <= 10000));
alter table public.performed_exercises add column target_original_name_snapshot text;
alter table public.performed_sets
  add column target_optional_snapshot boolean not null default false,
  add column target_kg_max_snapshot numeric(10,2),
  add column target_duration_seconds_max_snapshot integer,
  add column target_rest_seconds_max_snapshot integer;

create function public.t06r1_copy_exercise_target() returns trigger language plpgsql set search_path = '' as $$
declare p public.planned_exercises;
begin
  if new.planned_exercise_id is not null then
    select * into p from public.planned_exercises where id=new.planned_exercise_id and owner_id=new.owner_id;
    if not found then raise exception 'planned exercise not found'; end if;
    new.target_original_name_snapshot := p.original_name;
    new.target_name_snapshot := coalesce(p.display_name,p.original_name);
  end if;
  return new;
end $$;
create trigger t06r1_copy_exercise_target before insert on public.performed_exercises for each row execute function public.t06r1_copy_exercise_target();
create function public.t06r1_copy_set_target() returns trigger language plpgsql set search_path = '' as $$
declare p public.planned_sets;
begin
  if new.planned_set_id is not null then
    select * into p from public.planned_sets where id=new.planned_set_id and owner_id=new.owner_id and planned_exercise_id=new.planned_exercise_id;
    if not found then raise exception 'planned set not found'; end if;
    new.target_optional_snapshot := p.is_optional;
    new.target_kg_max_snapshot := p.target_kg_max;
    new.target_duration_seconds_max_snapshot := p.duration_seconds_max;
    new.target_rest_seconds_max_snapshot := p.rest_seconds_max;
  end if;
  return new;
end $$;
create trigger t06r1_copy_set_target before insert on public.performed_sets for each row execute function public.t06r1_copy_set_target();
create function public.t06r1_guard_extended_target() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_table_name='performed_sets' then
    if row(old.target_optional_snapshot,old.target_kg_max_snapshot,old.target_duration_seconds_max_snapshot,old.target_rest_seconds_max_snapshot)
      is distinct from row(new.target_optional_snapshot,new.target_kg_max_snapshot,new.target_duration_seconds_max_snapshot,new.target_rest_seconds_max_snapshot)
      then raise exception 'session target snapshot is immutable'; end if;
  else
    if old.target_original_name_snapshot is distinct from new.target_original_name_snapshot then raise exception 'performed exercise snapshot is immutable'; end if;
  end if;
  return new;
end $$;
create trigger t06r1_guard_set_target before update on public.performed_sets for each row execute function public.t06r1_guard_extended_target();
create trigger t06r1_guard_exercise_target before update on public.performed_exercises for each row execute function public.t06r1_guard_extended_target();
revoke all on function public.t06r1_copy_exercise_target(),public.t06r1_copy_set_target(),public.t06r1_guard_extended_target() from public,anon,authenticated;

create or replace function public.save_manual_plan(
  p_operation_id uuid, p_plan_id uuid, p_expected_version_id uuid, p_document jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid();
  v_hash text;
  v_receipt public.plan_save_receipts%rowtype;
  v_plan public.plans%rowtype;
  v_plan_id uuid;
  v_version_id uuid;
  v_version_number integer;
  v_session jsonb;
  v_exercise jsonb;
  v_set jsonb;
  v_session_id uuid;
  v_exercise_id uuid;
  v_planned_exercise_id uuid;
  v_day_position integer;
  v_exercise_position integer;
  v_set_position integer;
begin
  if v_owner is null then raise exception 'unauthorized' using errcode = '28000'; end if;
  if p_operation_id is null or p_document is null or jsonb_typeof(p_document->'sessions') <> 'array'
    or jsonb_array_length(p_document->'sessions') < 1 or jsonb_array_length(p_document->'sessions') > 52
    or length(btrim(p_document->>'name')) not between 1 and 120 then
    raise exception 'invalid plan';
  end if;
  v_hash := encode(extensions.digest(jsonb_build_array(p_plan_id, p_expected_version_id, p_document)::text, 'sha256'), 'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text || p_operation_id::text, 0));
  select * into v_receipt from public.plan_save_receipts
    where owner_id = v_owner and operation_id = p_operation_id;
  if found then
    if v_receipt.payload_hash <> v_hash then raise exception 'operation conflict' using errcode = '23505'; end if;
    return jsonb_build_object('planId', v_receipt.plan_id, 'versionId', v_receipt.version_id);
  end if;

  if p_plan_id is null then
    if p_expected_version_id is not null then raise exception 'invalid expected version'; end if;
    insert into public.plans(owner_id, name, status)
      values (v_owner, btrim(p_document->>'name'), 'draft') returning id into v_plan_id;
    v_version_number := 1;
  else
    select * into v_plan from public.plans where id = p_plan_id and owner_id = v_owner for update;
    if not found then raise exception 'plan not found' using errcode = 'P0002'; end if;
    if v_plan.status = 'archived' or v_plan.current_version_id is distinct from p_expected_version_id then
      raise exception 'plan version conflict' using errcode = '40001';
    end if;
    v_plan_id := v_plan.id;
    select coalesce(max(version_number), 0) + 1 into v_version_number
      from public.plan_versions where plan_id = v_plan_id and owner_id = v_owner;
  end if;
  insert into public.plan_versions(owner_id, plan_id, version_number, state, source_kind)
    values (v_owner, v_plan_id, v_version_number, 'draft', 'manual') returning id into v_version_id;

  v_day_position := 0;
  for v_session in select value from jsonb_array_elements(p_document->'sessions') loop
    v_day_position := v_day_position + 1;
    if jsonb_typeof(v_session->'exercises') <> 'array' or jsonb_array_length(v_session->'exercises') < 1
      or jsonb_array_length(v_session->'exercises') > 50 then raise exception 'invalid day'; end if;
    insert into public.plan_sessions(owner_id, plan_version_id, week_number, day_label, position, note)
      values (v_owner, v_version_id, (v_session->>'weekNumber')::integer,
        btrim(v_session->>'dayLabel'), v_day_position, nullif(btrim(v_session->>'note'), ''))
      returning id into v_session_id;
    v_exercise_position := 0;
    for v_exercise in select value from jsonb_array_elements(v_session->'exercises') loop
      v_exercise_position := v_exercise_position + 1;
      if jsonb_typeof(v_exercise->'sets') <> 'array' or jsonb_array_length(v_exercise->'sets') < 1
        or jsonb_array_length(v_exercise->'sets') > 30 then raise exception 'invalid exercise'; end if;
      if (v_exercise->>'setCountMin') is not null or (v_exercise->>'setCountMax') is not null then
        if (v_exercise->>'setCountMin')::integer not between 1 and 30 or
          (v_exercise->>'setCountMax')::integer < (v_exercise->>'setCountMin')::integer or
          (v_exercise->>'setCountMax')::integer <> jsonb_array_length(v_exercise->'sets') then raise exception 'invalid set count range'; end if;
      end if;
      if nullif(v_exercise->>'exerciseId', '') is null then
        insert into public.exercises(owner_id, name, variant, equipment, is_custom)
          values (v_owner, btrim(v_exercise->>'name'), nullif(btrim(v_exercise->>'variant'), ''),
            nullif(btrim(v_exercise->>'equipment'), ''), true) returning id into v_exercise_id;
      else
        v_exercise_id := (v_exercise->>'exerciseId')::uuid;
        if not exists (select 1 from public.exercises where id = v_exercise_id and owner_id = v_owner) then
          raise exception 'exercise not found' using errcode = 'P0002';
        end if;
      end if;
      insert into public.planned_exercises(owner_id, plan_session_id, exercise_id, original_name,
        position, superset_group, note, display_name, review_id, source_ref, set_count_min, set_count_max, set_count_source, prescription_group)
        values (v_owner, v_session_id, v_exercise_id, coalesce(nullif(btrim(v_exercise->>'originalName'),''),btrim(v_exercise->>'name')),
          v_exercise_position, nullif(btrim(v_exercise->>'supersetGroup'), ''),
          nullif(btrim(v_exercise->>'note'), ''),btrim(v_exercise->>'name'),v_exercise->>'reviewId',v_exercise->>'sourceRef', (v_exercise->>'setCountMin')::integer,(v_exercise->>'setCountMax')::integer,v_exercise->>'setCountSource',v_exercise->>'prescriptionGroup') returning id into v_planned_exercise_id;
      v_set_position := 0;
      for v_set in select value from jsonb_array_elements(v_exercise->'sets') loop
        v_set_position := v_set_position + 1;
        insert into public.planned_sets(owner_id, planned_exercise_id, position, set_kind, reps_min, reps_max,
          is_amrap, load_type, target_kg, target_percent, bodyweight_adjustment, bodyweight_delta_kg,
          dumbbell_basis, duration_seconds, distance_meters, rest_seconds, tempo, target_rpe, target_rir, note, review_id, source_ref, is_optional, target_kg_max, duration_seconds_max, rest_seconds_max)
          values (v_owner, v_planned_exercise_id, v_set_position, v_set->>'kind',
            (v_set->>'repsMin')::integer, (v_set->>'repsMax')::integer,
            (v_set->>'isAmrap')::boolean, v_set->>'loadType', (v_set->>'targetKg')::numeric,
            (v_set->>'targetPercent')::numeric, v_set->>'bodyweightAdjustment',
            (v_set->>'bodyweightDeltaKg')::numeric, v_set->>'dumbbellBasis',
            (v_set->>'durationSeconds')::integer, (v_set->>'distanceMeters')::numeric,
            (v_set->>'restSeconds')::integer, v_set->>'tempo', (v_set->>'targetRpe')::numeric,
            (v_set->>'targetRir')::numeric, v_set->>'note', v_set->>'reviewId',v_set->>'sourceRef',coalesce(v_set_position > (v_exercise->>'setCountMin')::integer,false),(v_set->>'targetKgMax')::numeric,(v_set->>'durationSecondsMax')::integer,(v_set->>'restSecondsMax')::integer);
      end loop;
    end loop;
  end loop;
  update public.plan_versions set state = 'published', published_at = now() where id = v_version_id and owner_id = v_owner;
  update public.plans set name = btrim(p_document->>'name'), status = 'active', current_version_id = v_version_id
    where id = v_plan_id and owner_id = v_owner;
  insert into public.plan_save_receipts(owner_id, operation_id, payload_hash, plan_id, version_id)
    values (v_owner, p_operation_id, v_hash, v_plan_id, v_version_id);
  return jsonb_build_object('planId', v_plan_id, 'versionId', v_version_id);
end $$;
revoke all on function public.save_manual_plan(uuid, uuid, uuid, jsonb) from public, anon;
grant execute on function public.save_manual_plan(uuid, uuid, uuid, jsonb) to authenticated;

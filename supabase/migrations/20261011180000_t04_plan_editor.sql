-- T04: atomowy zapis opublikowanej wersji planu. Uprawnienia tabel nadal wymusza RLS.
create table public.plan_save_receipts (
  owner_id uuid not null references public.profiles(id) on delete cascade,
  operation_id uuid not null,
  payload_hash text not null,
  plan_id uuid not null,
  version_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (owner_id, operation_id),
  foreign key (plan_id, owner_id) references public.plans(id, owner_id),
  foreign key (version_id, owner_id, plan_id) references public.plan_versions(id, owner_id, plan_id)
);
alter table public.plan_save_receipts enable row level security;
revoke all on public.plan_save_receipts from anon, authenticated;
grant select on public.plan_save_receipts to authenticated;
create policy plan_save_receipts_select_owner on public.plan_save_receipts for select to authenticated
  using (owner_id = (select auth.uid()));

create function public.save_manual_plan(
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
        position, superset_group, note)
        values (v_owner, v_session_id, v_exercise_id, btrim(v_exercise->>'name'),
          v_exercise_position, nullif(btrim(v_exercise->>'supersetGroup'), ''),
          nullif(btrim(v_exercise->>'note'), '')) returning id into v_planned_exercise_id;
      v_set_position := 0;
      for v_set in select value from jsonb_array_elements(v_exercise->'sets') loop
        v_set_position := v_set_position + 1;
        insert into public.planned_sets(owner_id, planned_exercise_id, position, set_kind, reps_min, reps_max,
          is_amrap, load_type, target_kg, target_percent, bodyweight_adjustment, bodyweight_delta_kg,
          dumbbell_basis, duration_seconds, distance_meters, rest_seconds, tempo, target_rpe, target_rir, note)
          values (v_owner, v_planned_exercise_id, v_set_position, v_set->>'kind',
            (v_set->>'repsMin')::integer, (v_set->>'repsMax')::integer,
            (v_set->>'isAmrap')::boolean, v_set->>'loadType', (v_set->>'targetKg')::numeric,
            (v_set->>'targetPercent')::numeric, v_set->>'bodyweightAdjustment',
            (v_set->>'bodyweightDeltaKg')::numeric, v_set->>'dumbbellBasis',
            (v_set->>'durationSeconds')::integer, (v_set->>'distanceMeters')::numeric,
            (v_set->>'restSeconds')::integer, v_set->>'tempo', (v_set->>'targetRpe')::numeric,
            (v_set->>'targetRir')::numeric, v_set->>'note');
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

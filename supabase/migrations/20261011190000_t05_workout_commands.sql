-- T05: wyłączna ścieżka zapisu wykonania. Każde wywołanie RPC to jedna transakcja.
create unique index workout_one_active_day on public.workout_sessions(owner_id, plan_session_id)
  where status = 'in_progress' and plan_session_id is not null;

create function public.apply_workout_command(
  p_operation_id uuid, p_workout_id uuid, p_expected_revision integer,
  p_action text, p_payload jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid();
  v_hash text;
  v_receipt public.mutation_receipts%rowtype;
  v_workout public.workout_sessions%rowtype;
  v_plan_session public.plan_sessions%rowtype;
  v_version public.plan_versions%rowtype;
  v_profile public.profiles%rowtype;
  v_exercise public.performed_exercises%rowtype;
  v_set public.performed_sets%rowtype;
  v_exercise_id uuid;
  v_set_id uuid;
  v_response jsonb;
  v_date date;
  v_revision integer;
  v_actual_reps integer;
  v_actual_kg numeric;
  v_actual_duration integer;
  v_actual_distance numeric;
  v_actual_rpe numeric;
  v_actual_rir numeric;
  v_status text;
begin
  if v_owner is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if p_operation_id is null or p_expected_revision is null or p_expected_revision < 0 or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid command' using errcode = '22023';
  end if;
  if p_action not in ('start','save_set','add_set','add_exercise','comment','finish') then
    raise exception 'unknown command' using errcode = '22023';
  end if;
  if (p_action = 'start') <> (p_workout_id is null) then
    raise exception 'invalid workout anchor' using errcode = '22023';
  end if;
  v_hash := encode(extensions.digest(jsonb_build_object('workout',p_workout_id,'revision',p_expected_revision,'action',p_action,'payload',p_payload)::text, 'sha256'), 'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_owner::text), pg_catalog.hashtext(p_operation_id::text));
  select * into v_receipt from public.mutation_receipts where owner_id = v_owner and client_operation_id = p_operation_id;
  if found then
    if v_receipt.payload_hash <> v_hash then raise exception 'operation payload conflict' using errcode = '40001'; end if;
    return v_receipt.response;
  end if;

  if p_action = 'start' then
    if p_expected_revision <> 0 then raise exception 'revision conflict' using errcode = '40001'; end if;
    begin
      v_date := (p_payload->>'performedOn')::date;
      if v_date::text <> p_payload->>'performedOn' then raise exception 'invalid date'; end if;
    exception when others then raise exception 'invalid date' using errcode = '22023'; end;
    select * into v_plan_session from public.plan_sessions
      where id = (p_payload->>'planSessionId')::uuid and owner_id = v_owner;
    if not found then raise exception 'plan day not found' using errcode = 'P0002'; end if;
    select * into v_version from public.plan_versions where id = v_plan_session.plan_version_id and owner_id = v_owner and state = 'published';
    if not found then raise exception 'version not published' using errcode = 'P0002'; end if;
    if not exists (select 1 from public.plans where id = v_version.plan_id and owner_id = v_owner and current_version_id = v_version.id) then
      raise exception 'plan version changed' using errcode = '40001';
    end if;
    select * into v_profile from public.profiles where id = v_owner;
    if not found then raise exception 'profile not found' using errcode = 'P0002'; end if;
    insert into public.workout_sessions(owner_id,plan_version_id,plan_session_id,performed_on,revision)
      values(v_owner,v_version.id,v_plan_session.id,v_date,1) returning * into v_workout;
    insert into public.performed_exercises(owner_id,workout_session_id,plan_session_id,planned_exercise_id,
      exercise_id,position,source_kind,target_name_snapshot,target_note_snapshot,superset_group_snapshot)
      select v_owner,v_workout.id,v_plan_session.id,e.id,e.exercise_id,e.position,'planned',e.original_name,e.note,e.superset_group
      from public.planned_exercises e where e.plan_session_id = v_plan_session.id and e.owner_id = v_owner;
    insert into public.performed_sets(owner_id,performed_exercise_id,exercise_id,planned_exercise_id,planned_set_id,
      position,source_kind,target_kind_snapshot,target_reps_min_snapshot,target_reps_max_snapshot,target_amrap_snapshot,
      target_load_type_snapshot,target_kg_snapshot,target_percent_snapshot,target_bodyweight_adjustment_snapshot,
      target_bodyweight_delta_kg_snapshot,target_dumbbell_basis_snapshot,one_rep_max_record_id,one_rep_max_kg_snapshot,
      raw_target_kg_snapshot,rounded_target_kg_snapshot,rounding_increment_kg_snapshot,target_duration_seconds_snapshot,
      target_distance_meters_snapshot,target_rest_seconds_snapshot,target_tempo_snapshot,target_rpe_snapshot,
      target_rir_snapshot,target_note_snapshot)
      select v_owner,pe.id,pe.exercise_id,pe.planned_exercise_id,ps.id,ps.position,'planned',ps.set_kind,
        ps.reps_min,ps.reps_max,ps.is_amrap,ps.load_type,ps.target_kg,ps.target_percent,
        ps.bodyweight_adjustment,ps.bodyweight_delta_kg,ps.dumbbell_basis,m.id,m.value_kg,
        case when m.id is null then null else round(m.value_kg * ps.target_percent / 100,4) end,
        case when m.id is null then null else
          (floor(round(m.value_kg * ps.target_percent / 100,4) / v_profile.rounding_increment_kg) +
            case when round(m.value_kg * ps.target_percent / 100,4) / v_profile.rounding_increment_kg -
              floor(round(m.value_kg * ps.target_percent / 100,4) / v_profile.rounding_increment_kg) > 0.5 then 1 else 0 end)
            * v_profile.rounding_increment_kg end,
        case when m.id is null then null else v_profile.rounding_increment_kg end,
        ps.duration_seconds,ps.distance_meters,ps.rest_seconds,ps.tempo,ps.target_rpe,ps.target_rir,ps.note
      from public.performed_exercises pe
      join public.planned_sets ps on ps.planned_exercise_id = pe.planned_exercise_id and ps.owner_id = v_owner
      left join lateral (
        select r.id,r.value_kg from public.one_rep_max_records r
        where ps.load_type = 'percent_1rm' and r.owner_id = v_owner and r.exercise_id = pe.exercise_id
          and r.effective_on <= v_date
        order by r.effective_on desc,r.created_at desc,r.id desc limit 1
      ) m on true
      where pe.workout_session_id = v_workout.id and pe.owner_id = v_owner;
  else
    select * into v_workout from public.workout_sessions where id = p_workout_id and owner_id = v_owner for update;
    if not found then raise exception 'workout not found' using errcode = 'P0002'; end if;
    if v_workout.revision <> p_expected_revision then raise exception 'revision conflict' using errcode = '40001'; end if;
    if p_action <> 'save_set' and v_workout.status <> 'in_progress' then
      raise exception 'workout is closed' using errcode = '22023';
    end if;
    if p_action = 'save_set' then
      select * into v_set from public.performed_sets where id = (p_payload->>'setId')::uuid and owner_id = v_owner;
      if not found then raise exception 'set not found' using errcode = 'P0002'; end if;
      select * into v_exercise from public.performed_exercises where id = v_set.performed_exercise_id and owner_id = v_owner and workout_session_id = v_workout.id;
      if not found then raise exception 'set not in workout' using errcode = 'P0002'; end if;
      v_status := p_payload->>'status';
      if v_status not in ('completed','skipped') then raise exception 'invalid set status' using errcode = '22023'; end if;
      v_actual_reps := nullif(p_payload->>'actualReps','')::integer;
      v_actual_kg := nullif(p_payload->>'actualKg','')::numeric;
      v_actual_duration := nullif(p_payload->>'actualDurationSeconds','')::integer;
      v_actual_distance := nullif(p_payload->>'actualDistanceMeters','')::numeric;
      v_actual_rpe := nullif(p_payload->>'actualRpe','')::numeric;
      v_actual_rir := nullif(p_payload->>'actualRir','')::numeric;
      if v_status = 'skipped' and pg_catalog.num_nonnulls(v_actual_reps,v_actual_kg,v_actual_duration,v_actual_distance) > 0 then
        raise exception 'skipped set has result' using errcode = '22023';
      end if;
      update public.performed_sets set status=v_status,actual_reps=v_actual_reps,actual_kg=v_actual_kg,
        actual_duration_seconds=v_actual_duration,actual_distance_meters=v_actual_distance,
        actual_rpe=v_actual_rpe,actual_rir=v_actual_rir,actual_note=p_payload->>'actualNote'
        where id=v_set.id returning id into v_set_id;
    elsif p_action = 'add_set' then
      select * into v_exercise from public.performed_exercises where id=(p_payload->>'exerciseId')::uuid
        and owner_id=v_owner and workout_session_id=v_workout.id;
      if not found then raise exception 'exercise not found' using errcode = 'P0002'; end if;
      insert into public.performed_sets(owner_id,performed_exercise_id,exercise_id,position,source_kind)
        select v_owner,v_exercise.id,v_exercise.exercise_id,coalesce(max(position),0)+1,'extra'
        from public.performed_sets where performed_exercise_id=v_exercise.id returning id into v_set_id;
    elsif p_action = 'add_exercise' then
      if length(btrim(coalesce(p_payload->>'name',''))) < 1 or length(p_payload->>'name') > 150 then
        raise exception 'invalid exercise name' using errcode = '22023'; end if;
      insert into public.exercises(owner_id,name,variant) values(v_owner,btrim(p_payload->>'name'),nullif(btrim(p_payload->>'variant'),'')) returning id into v_exercise_id;
      insert into public.performed_exercises(owner_id,workout_session_id,exercise_id,position,source_kind,target_name_snapshot)
        select v_owner,v_workout.id,v_exercise_id,coalesce(max(position),0)+1,'extra',btrim(p_payload->>'name')
        from public.performed_exercises where workout_session_id=v_workout.id returning id into v_exercise_id;
    elsif p_action = 'comment' then
      if length(coalesce(p_payload->>'comment','')) > 4000 then raise exception 'comment too long' using errcode = '22023'; end if;
      update public.workout_sessions set comment=p_payload->>'comment' where id=v_workout.id;
    elsif p_action = 'finish' then
      update public.workout_sessions set status='completed',completed_at=now() where id=v_workout.id;
    end if;
    update public.workout_sessions set revision=revision+1 where id=v_workout.id returning revision into v_revision;
    v_workout.revision := v_revision;
  end if;
  v_response := jsonb_build_object('workoutId',v_workout.id,'revision',v_workout.revision,
    'action',p_action,'setId',v_set_id,'exerciseId',case when p_action='add_exercise' then v_exercise_id else null end);
  insert into public.mutation_receipts(owner_id,client_operation_id,payload_hash,command_kind,
    workout_session_id,resulting_revision,response)
    values(v_owner,p_operation_id,v_hash,p_action,v_workout.id,v_workout.revision,v_response)
    returning * into v_receipt;
  insert into public.workout_revisions(owner_id,workout_session_id,revision,mutation_receipt_id,change_summary)
    values(v_owner,v_workout.id,v_workout.revision,v_receipt.id,jsonb_build_object('action',p_action));
  return v_response;
end $$;

revoke all on function public.apply_workout_command(uuid,uuid,integer,text,jsonb) from public,anon;
grant execute on function public.apply_workout_command(uuid,uuid,integer,text,jsonb) to authenticated;

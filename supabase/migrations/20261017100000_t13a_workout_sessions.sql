-- T13-A: tylko lokalne wdrożenie; kompatybilność starych komend i receipts.
alter table public.workout_sessions
  add column started_at timestamptz,
  add column performed_at timestamptz,
  add column performed_time_zone text,
  add column snapshot_on date;
-- Zastane rekordy zachowują wyłącznie wiarygodną datę, bez zgadywania godziny.
update public.workout_sessions set snapshot_on = performed_on;
alter table public.workout_sessions alter column snapshot_on set not null;

create or replace function public.t02_guard_workout_anchor() returns trigger language plpgsql set search_path = '' as $$
begin
  if row(old.owner_id,old.plan_version_id,old.plan_session_id,old.snapshot_on,old.started_at)
    is distinct from row(new.owner_id,new.plan_version_id,new.plan_session_id,new.snapshot_on,new.started_at) then
    raise exception 'workout source is immutable';
  end if;
  return new;
end $$;

create table public.deleted_workouts (
  workout_id uuid not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  primary key (workout_id,owner_id)
);
alter table public.deleted_workouts enable row level security;
create policy owner_read on public.deleted_workouts for select to authenticated using (owner_id = auth.uid());
revoke all on public.deleted_workouts from public,anon,authenticated;
grant select on public.deleted_workouts to authenticated;

create function public.workout_local_date(p_at timestamptz,p_on date,p_zone text)
returns date language sql stable set search_path = '' as $$
  select case when p_at is null then p_on else (p_at at time zone p_zone)::date end
$$;

-- Zmiana czasu nigdy nie dotyka tabel celów ani 1RM.
create function public.t13_finish_workout(p_id uuid,p_owner uuid,p_payload jsonb,p_now timestamptz)
returns void language plpgsql set search_path = '' as $$
declare v_zone text; v_at timestamptz; v_local timestamp;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'INVALID_TIME' using errcode='22023'; end if;
  if p_payload ? 'performedAt' or p_payload ? 'timeZone' then
    select time_zone into v_zone from public.profiles where id=p_owner;
    if p_payload->>'timeZone' is distinct from v_zone then
      raise exception 'TIME_ZONE_CHANGED' using errcode='PT409'; end if;
    if not exists(select 1 from pg_catalog.pg_timezone_names where name=v_zone) or
      coalesce(p_payload->>'performedAt','') !~ '^\d{4}-\d{2}-\d{2}T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,6})?(Z|[+-][0-9]{2}:[0-5][0-9])$' then
      raise exception 'INVALID_TIME' using errcode='22023'; end if;
    begin
      v_at := (p_payload->>'performedAt')::timestamptz;
      v_local := (p_payload->>'performedAt')::timestamp;
    exception when others then raise exception 'INVALID_TIME' using errcode='22023'; end;
    if not isfinite(v_at) or (v_at at time zone v_zone) <> v_local or v_at > p_now then
      raise exception 'INVALID_TIME' using errcode='22023'; end if;
    update public.workout_sessions set performed_at=v_at,performed_on=(v_at at time zone v_zone)::date,
      performed_time_zone=v_zone where id=p_id and owner_id=p_owner;
  end if;
  update public.workout_sessions set status='completed',completed_at=p_now where id=p_id and owner_id=p_owner;
end $$;

create function public.t13_delete_workout(p_id uuid,p_owner uuid)
returns void language plpgsql set search_path = '' as $$
begin
  delete from public.performed_sets s using public.performed_exercises e
    where s.performed_exercise_id=e.id and s.owner_id=p_owner and e.owner_id=p_owner and e.workout_session_id=p_id;
  delete from public.performed_exercises where workout_session_id=p_id and owner_id=p_owner;
  delete from public.workout_revisions where workout_session_id=p_id and owner_id=p_owner;
  -- Zachowujemy FK i hash/odpowiedź, odłączamy wyłącznie nullable kotwicę.
  update public.mutation_receipts set workout_session_id=null where workout_session_id=p_id and owner_id=p_owner;
  insert into public.deleted_workouts(workout_id,owner_id) values(p_id,p_owner);
  delete from public.workout_sessions where id=p_id and owner_id=p_owner;
end $$;

create function public.active_workout_summaries() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',w.id,'revision',w.revision,
    'name',coalesce(s.day_label,'Trening'),
    'performedOn',public.workout_local_date(w.performed_at,w.performed_on,p.time_zone),
    'performedAt',w.performed_at,'savedSetCount',(select count(*) from public.performed_sets ps
      join public.performed_exercises e on e.id=ps.performed_exercise_id and e.owner_id=ps.owner_id
      where e.workout_session_id=w.id and e.owner_id=auth.uid() and ps.status='completed')) order by w.id),'[]'::jsonb)
  from public.workout_sessions w join public.profiles p on p.id=w.owner_id
  left join public.plan_sessions s on s.id=w.plan_session_id and s.owner_id=w.owner_id
  where w.owner_id=auth.uid() and w.status='in_progress'
$$;

CREATE OR REPLACE FUNCTION public.apply_workout_command(p_operation_id uuid, p_workout_id uuid, p_expected_revision integer, p_action text, p_payload jsonb DEFAULT '{}'::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  v_catalog_exercise_id uuid;
  v_voice_set jsonb;
  v_voice_position integer;
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
  v_start_payload jsonb;
  v_active jsonb;
  v_old_id uuid;
  v_resolution text;
  v_now timestamptz;
  v_at timestamptz;
  v_resolution_receipt uuid;
begin
  if v_owner is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if p_operation_id is null or p_expected_revision is null or p_expected_revision < 0 or p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'invalid command' using errcode = '22023';
  end if;
  if p_action is null or p_action not in ('start','save_set','add_set','add_exercise','comment','finish','delete','replace_active') then
    raise exception 'unknown command' using errcode = '22023';
  end if;
  if (p_action = 'start') <> (p_workout_id is null) then
    raise exception 'invalid workout anchor' using errcode = '22023';
  end if;
  v_hash := encode(extensions.digest(jsonb_build_object('workout',p_workout_id,'revision',p_expected_revision,'action',p_action,'payload',p_payload)::text, 'sha256'), 'hex');
  -- Kolejność: właściciel, receipt, sesje. Wszystkie komendy, także legacy i głos.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('workout-owner:' || v_owner::text,0));
  v_now := clock_timestamp();
  select * into v_receipt from public.mutation_receipts where owner_id = v_owner and client_operation_id = p_operation_id;
  if found then
    if v_receipt.payload_hash <> v_hash then raise exception 'OPERATION_PAYLOAD_CONFLICT' using errcode = 'PT409'; end if;
    if v_receipt.command_kind <> 'delete' and exists(select 1 from public.deleted_workouts
      where owner_id=v_owner and workout_id=(v_receipt.response->>'workoutId')::uuid) then
      raise exception 'WORKOUT_DELETED' using errcode='PT410';
    end if;
    return v_receipt.response;
  end if;

  if p_workout_id is not null and exists(select 1 from public.deleted_workouts
    where owner_id=v_owner and workout_id=p_workout_id) then
    raise exception 'WORKOUT_DELETED' using errcode='PT410'; end if;

  if p_action in ('start','replace_active') then
    v_start_payload := p_payload;
    if p_action='replace_active' then
      select * into v_workout from public.workout_sessions where id=p_workout_id and owner_id=v_owner for update;
      if not found then raise exception 'WORKOUT_NOT_FOUND' using errcode='P0002'; end if;
      if v_workout.revision<>p_expected_revision then raise exception 'REVISION_CONFLICT' using errcode='PT409'; end if;
      if v_workout.status<>'in_progress' then raise exception 'WORKOUT_CLOSED' using errcode='PT409'; end if;
      v_old_id := v_workout.id;
      v_resolution := p_payload->>'resolution';
      if v_resolution is null or v_resolution not in ('finish','delete') or
        jsonb_typeof(p_payload->'next') is distinct from 'object' or
        (p_payload ? 'finish' and v_resolution<>'finish') then
        raise exception 'INVALID_REPLACEMENT' using errcode='22023'; end if;
      v_start_payload := p_payload->'next';
      if v_start_payload ? 'performedOn' then raise exception 'INVALID_REPLACEMENT' using errcode='22023'; end if;
    end if;
    v_active := public.active_workout_summaries();
    if (p_action='start' and jsonb_array_length(v_active)>0) or
      (p_action='replace_active' and jsonb_array_length(v_active)>1) then
      raise exception using errcode='PT409', message=case when jsonb_array_length(v_active)>1
        then 'MULTIPLE_ACTIVE_WORKOUTS' else 'ACTIVE_WORKOUT_EXISTS' end, detail=v_active::text;
    end if;
    if p_action='start' and p_expected_revision <> 0 then raise exception 'REVISION_CONFLICT' using errcode = 'PT409'; end if;
    select * into v_profile from public.profiles where id=v_owner for share;
    if not found then raise exception 'profile not found' using errcode='P0002'; end if;
    if not exists(select 1 from pg_catalog.pg_timezone_names where name=v_profile.time_zone) then
      raise exception 'INVALID_TIME_ZONE' using errcode='22023'; end if;
    if v_start_payload ? 'performedOn' then
      begin
        v_date := (v_start_payload->>'performedOn')::date;
        if v_date is null or not isfinite(v_date) or v_date::text <> v_start_payload->>'performedOn' then raise exception 'invalid date'; end if;
      exception when others then raise exception 'INVALID_DATE' using errcode='22023'; end;
      v_at := null;
    else
      v_at := v_now;
      v_date := (v_at at time zone v_profile.time_zone)::date;
    end if;
    select * into v_plan_session from public.plan_sessions
      where id = (v_start_payload->>'planSessionId')::uuid and owner_id = v_owner;
    if not found then raise exception 'plan day not found' using errcode = 'P0002'; end if;
    select * into v_version from public.plan_versions where id = v_plan_session.plan_version_id and owner_id = v_owner and state = 'published';
    if not found then raise exception 'version not published' using errcode = 'P0002'; end if;
    perform 1 from public.plans where id=v_version.plan_id and owner_id=v_owner for share;
    if not exists (select 1 from public.plans where id = v_version.plan_id and owner_id = v_owner and current_version_id = v_version.id) then
      raise exception 'PLAN_VERSION_CHANGED' using errcode = 'PT409';
    end if;
    select * into v_profile from public.profiles where id = v_owner;
    if not found then raise exception 'profile not found' using errcode = 'P0002'; end if;
    -- Do tego miejsca plan/rewizja/pozostałe aktywne zweryfikowane. Dalszy błąd cofa też rozstrzygnięcie.
    if p_action='replace_active' then
      if v_resolution='delete' then
        perform public.t13_delete_workout(v_old_id,v_owner);
      else
        perform public.t13_finish_workout(v_old_id,v_owner,coalesce(p_payload->'finish','{}'::jsonb),v_now);
        update public.workout_sessions set revision=revision+1 where id=v_old_id and owner_id=v_owner;
        insert into public.mutation_receipts(owner_id,client_operation_id,payload_hash,command_kind,
          workout_session_id,resulting_revision,response)
          values(v_owner,gen_random_uuid(),v_hash,'replace_active_resolution',v_old_id,p_expected_revision+1,
            jsonb_build_object('workoutId',v_old_id,'action','finish','revision',p_expected_revision+1))
          returning id into v_resolution_receipt;
        insert into public.workout_revisions(owner_id,workout_session_id,revision,mutation_receipt_id,change_summary)
          values(v_owner,v_old_id,p_expected_revision+1,v_resolution_receipt,jsonb_build_object('action','finish'));
      end if;
    end if;
    insert into public.workout_sessions(owner_id,plan_version_id,plan_session_id,performed_on,revision,
      snapshot_on,started_at,performed_at,performed_time_zone)
      values(v_owner,v_version.id,v_plan_session.id,v_date,1,v_date,v_now,v_at,
        case when v_at is null then null else v_profile.time_zone end) returning * into v_workout;
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
    if v_workout.revision <> p_expected_revision then raise exception 'REVISION_CONFLICT' using errcode = 'PT409'; end if;
    if p_action <> 'save_set' and v_workout.status <> 'in_progress' then
      raise exception 'WORKOUT_CLOSED' using errcode = 'PT409';
    end if;
    if p_action='delete' then
      perform public.t13_delete_workout(v_workout.id,v_owner);
      v_response := jsonb_build_object('workoutId',v_workout.id,'revision',v_workout.revision+1,
        'action','delete','deleted',true,'setId',null,'exerciseId',null);
      insert into public.mutation_receipts(owner_id,client_operation_id,payload_hash,command_kind,resulting_revision,response)
        values(v_owner,p_operation_id,v_hash,p_action,v_workout.revision+1,v_response);
      return v_response;
    elsif p_action = 'save_set' then
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
      if p_payload ? 'voiceSets' and
        (jsonb_typeof(p_payload->'voiceSets') <> 'array' or jsonb_array_length(p_payload->'voiceSets') not between 1 and 30) then
        raise exception 'invalid voice sets' using errcode = '22023'; end if;
      if p_payload ? 'voiceSets' then
        for v_voice_set, v_voice_position in select value, ordinality::integer from jsonb_array_elements(p_payload->'voiceSets') with ordinality loop
          if jsonb_typeof(v_voice_set) <> 'object' or jsonb_typeof(v_voice_set->'actualReps') <> 'number' or
            (v_voice_set ? 'actualKg' and jsonb_typeof(v_voice_set->'actualKg') not in ('number','null')) or
            (v_voice_set->>'actualReps')::numeric <> trunc((v_voice_set->>'actualReps')::numeric) or
            (v_voice_set->>'actualReps')::numeric not between 0 and 1000 or
            (v_voice_set->>'actualKg')::numeric not between 0 and 10000 then
            raise exception 'invalid voice set' using errcode = '22023'; end if;
        end loop;
      end if;
      insert into public.exercises(owner_id,name,variant) values(v_owner,btrim(p_payload->>'name'),nullif(btrim(p_payload->>'variant'),'')) returning id into v_catalog_exercise_id;
      insert into public.performed_exercises(owner_id,workout_session_id,exercise_id,position,source_kind,target_name_snapshot)
        select v_owner,v_workout.id,v_catalog_exercise_id,coalesce(max(position),0)+1,'extra',btrim(p_payload->>'name')
        from public.performed_exercises where workout_session_id=v_workout.id returning id into v_exercise_id;
      if p_payload ? 'voiceSets' then
        insert into public.performed_sets(owner_id,performed_exercise_id,exercise_id,position,source_kind,status,actual_reps,actual_kg)
          select v_owner,v_exercise_id,v_catalog_exercise_id,ordinality::integer,'extra','completed',
            (value->>'actualReps')::integer,(value->>'actualKg')::numeric
          from jsonb_array_elements(p_payload->'voiceSets') with ordinality;
      end if;
    elsif p_action = 'comment' then
      if length(coalesce(p_payload->>'comment','')) > 4000 then raise exception 'comment too long' using errcode = '22023'; end if;
      update public.workout_sessions set comment=p_payload->>'comment' where id=v_workout.id;
    elsif p_action = 'finish' then
      perform 1 from public.profiles where id=v_owner for share;
      perform public.t13_finish_workout(v_workout.id,v_owner,p_payload,v_now);
    end if;
    update public.workout_sessions set revision=revision+1 where id=v_workout.id returning revision into v_revision;
    v_workout.revision := v_revision;
  end if;
  v_response := jsonb_build_object('workoutId',v_workout.id,'revision',v_workout.revision,
    'action',p_action,'setId',v_set_id,'exerciseId',case when p_action='add_exercise' then v_exercise_id else null end);
  if p_action='replace_active' then
    v_response := v_response || jsonb_build_object('resolvedWorkoutId',v_old_id,'resolution',v_resolution);
  end if;
  insert into public.mutation_receipts(owner_id,client_operation_id,payload_hash,command_kind,
    workout_session_id,resulting_revision,response)
    values(v_owner,p_operation_id,v_hash,p_action,v_workout.id,v_workout.revision,v_response)
    returning * into v_receipt;
  insert into public.workout_revisions(owner_id,workout_session_id,revision,mutation_receipt_id,change_summary)
    values(v_owner,v_workout.id,v_workout.revision,v_receipt.id,jsonb_build_object('action',p_action));
  return v_response;
end $function$;

-- Jedna projekcja dla GET, historii, konfliktów i postępu. Strefa bieżącego profilu.
create view public.workout_read_model with (security_invoker=true) as
select w.id,w.owner_id,w.plan_version_id,w.plan_session_id,w.status,w.revision,w.comment,w.created_at,w.completed_at,
  w.started_at,w.performed_at,w.performed_time_zone,w.snapshot_on,w.performed_on as stored_performed_on,
  public.workout_local_date(w.performed_at,w.performed_on,p.time_zone) as performed_on,
  p.time_zone as time_zone,w.performed_at is not null as time_known,coalesce(s.day_label,'Trening') as name
from public.workout_sessions w join public.profiles p on p.id=w.owner_id
left join public.plan_sessions s on s.id=w.plan_session_id and s.owner_id=w.owner_id;
revoke all on public.workout_read_model from public,anon,authenticated;
grant select on public.workout_read_model to authenticated;

create function public.read_workout(p_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare v_result jsonb;
begin
  if auth.uid() is null then raise exception 'UNAUTHENTICATED' using errcode='28000'; end if;
  -- Całe drzewo i poprzedni wynik są jednym zapytaniem w jednym snapshotcie MVCC.
  select jsonb_build_object('workout',to_jsonb(w),'exercises',coalesce((
    select jsonb_agg(to_jsonb(e) || jsonb_build_object('sets',coalesce((
      select jsonb_agg(to_jsonb(s) order by s.position,s.id) from public.performed_sets s
      where s.performed_exercise_id=e.id and s.owner_id=auth.uid()),'[]'::jsonb),
      'previousSet',(
        select to_jsonb(ps) from public.workout_read_model pw
        join public.performed_exercises pe on pe.workout_session_id=pw.id and pe.owner_id=pw.owner_id
        join public.performed_sets ps on ps.performed_exercise_id=pe.id and ps.owner_id=pe.owner_id
        where pw.owner_id=auth.uid() and pw.status='completed' and pw.id<>w.id
          and pe.exercise_id=e.exercise_id and ps.status='completed'
          and (pw.performed_on<w.performed_on or (pw.performed_on=w.performed_on and (
            (pw.performed_at is not null and w.performed_at is not null and pw.performed_at<w.performed_at) or
            (pw.performed_at is not distinct from w.performed_at and pw.id<w.id))))
        order by pw.performed_on desc,pw.performed_at desc nulls last,pw.id desc,pe.position,ps.position,ps.id limit 1
      )) order by e.position,e.id)
    from public.performed_exercises e where e.workout_session_id=w.id and e.owner_id=auth.uid()),'[]'::jsonb))
    into v_result from public.workout_read_model w where w.id=p_id and w.owner_id=auth.uid();
  if v_result is null then
    if exists(select 1 from public.deleted_workouts where workout_id=p_id and owner_id=auth.uid()) then
      raise exception 'WORKOUT_DELETED' using errcode='PT410'; end if;
    raise exception 'WORKOUT_NOT_FOUND' using errcode='P0002';
  end if;
  return v_result;
end $$;

create function public.list_workouts() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(w) order by w.performed_on desc,w.performed_at desc nulls last,w.id),'[]'::jsonb)
    from public.workout_read_model w where w.owner_id=auth.uid()
$$;

revoke all on function public.t13_finish_workout(uuid,uuid,jsonb,timestamptz),public.t13_delete_workout(uuid,uuid)
  from public,anon,authenticated;
revoke all on function public.workout_local_date(timestamptz,date,text),public.read_workout(uuid),public.list_workouts(),
  public.active_workout_summaries() from public,anon;
grant execute on function public.workout_local_date(timestamptz,date,text),public.read_workout(uuid),public.list_workouts(),
  public.active_workout_summaries() to authenticated;
revoke all on function public.apply_workout_command(uuid,uuid,integer,text,jsonb) from public,anon;
grant execute on function public.apply_workout_command(uuid,uuid,integer,text,jsonb) to authenticated;

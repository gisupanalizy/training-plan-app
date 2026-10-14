-- Test integracyjny T02 na PostgreSQL 16 z scripts/t02_test_auth_shim.sql.
begin;
insert into auth.users(id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.profiles(id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.exercises(id, owner_id, name) values
 ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Przysiad własny'),
 ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Cudze ćwiczenie');
insert into public.one_rep_max_records(id,owner_id,exercise_id,value_kg,effective_on) values
 ('33333333-3333-4333-8333-333333333333','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',123,'2026-10-01');
insert into public.plans(id,owner_id,name) values
 ('44444444-4444-4444-8444-444444444444','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Plan A/B');
insert into public.plan_versions(id,owner_id,plan_id,version_number) values
 ('55555555-5555-4555-8555-555555555555','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','44444444-4444-4444-8444-444444444444',1);
insert into public.plan_sessions(id,owner_id,plan_version_id,week_number,day_label,position) values
 ('66666666-6666-4666-8666-666666666666','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','55555555-5555-4555-8555-555555555555',1,'A',1);
insert into public.planned_exercises(id,owner_id,plan_session_id,exercise_id,original_name,position,superset_group) values
 ('77777777-7777-4777-8777-777777777777','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','66666666-6666-4666-8666-666666666666','11111111-1111-4111-8111-111111111111','Przysiad',1,'A1'),
 ('88888888-8888-4888-8888-888888888888','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','66666666-6666-4666-8666-666666666666','11111111-1111-4111-8111-111111111111','Przysiad pauza',2,'A1');
insert into public.planned_sets(id,owner_id,planned_exercise_id,position,set_kind,reps_min,reps_max,load_type,target_percent) values
 ('99999999-9999-4999-8999-999999999999','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','77777777-7777-4777-8777-777777777777',1,'ramp',5,5,'percent_1rm',60),
 ('99999999-9999-4999-8999-999999999998','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','77777777-7777-4777-8777-777777777777',2,'work',6,6,'percent_1rm',75),
 ('99999999-9999-4999-8999-999999999997','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','88888888-8888-4888-8888-888888888888',1,'work',6,6,'unspecified',null);
do $$ begin
  begin
    update public.plans set current_version_id='55555555-5555-4555-8555-555555555555',status='active'
      where id='44444444-4444-4444-8444-444444444444';
    raise exception 'draft current version accepted';
  exception when raise_exception then
    if sqlerrm = 'draft current version accepted' then raise; end if;
  end;
end $$;

-- Wiązanie cudzego rodzica jest blokowane także przy właścicielu ustawionym na A.
do $$ begin
  begin
    insert into public.one_rep_max_records(owner_id,exercise_id,value_kg,effective_on)
      values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222',100,'2026-10-01');
    raise exception 'cross-owner FK accepted';
  exception when foreign_key_violation then null; end;
end $$;

insert into public.workout_sessions(id,owner_id,plan_version_id,plan_session_id,performed_on) values
 ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','55555555-5555-4555-8555-555555555555','66666666-6666-4666-8666-666666666666','2026-10-11');
insert into public.performed_exercises(id,owner_id,workout_session_id,plan_session_id,planned_exercise_id,exercise_id,position,source_kind,target_name_snapshot,superset_group_snapshot) values
 ('aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa','66666666-6666-4666-8666-666666666666','77777777-7777-4777-8777-777777777777','11111111-1111-4111-8111-111111111111',1,'planned','Przysiad','A1'),
 ('aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',null,null,'11111111-1111-4111-8111-111111111111',2,'extra','Ćwiczenie dodatkowe',null);
insert into public.performed_sets(id,owner_id,performed_exercise_id,exercise_id,planned_exercise_id,planned_set_id,position,source_kind,status,target_kind_snapshot,target_reps_min_snapshot,target_reps_max_snapshot,target_amrap_snapshot,target_load_type_snapshot,target_percent_snapshot,one_rep_max_record_id,one_rep_max_kg_snapshot,raw_target_kg_snapshot,rounded_target_kg_snapshot,rounding_increment_kg_snapshot) values
 ('aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','77777777-7777-4777-8777-777777777777','99999999-9999-4999-8999-999999999998',1,'planned','pending','work',6,6,false,'percent_1rm',75,'33333333-3333-4333-8333-333333333333',123,92.25,92.5,2.5);
insert into public.performed_sets(id,owner_id,performed_exercise_id,exercise_id,position,source_kind,status,actual_reps,actual_kg) values
 ('aaaaaaaa-5555-4555-8555-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',1,'extra','completed',8,0);
-- Seria dodatkowa w zaplanowanym ćwiczeniu oraz cel procentowy bez kopii 1RM.
insert into public.performed_sets(owner_id,performed_exercise_id,exercise_id,position,source_kind,status,actual_reps) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',2,'extra','completed',8);
insert into public.performed_sets(owner_id,performed_exercise_id,exercise_id,planned_exercise_id,planned_set_id,position,source_kind,status,target_kind_snapshot,target_reps_min_snapshot,target_reps_max_snapshot,target_amrap_snapshot,target_load_type_snapshot,target_percent_snapshot) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','77777777-7777-4777-8777-777777777777','99999999-9999-4999-8999-999999999999',3,'planned','pending','ramp',5,5,false,'percent_1rm',60);
do $$ begin
  begin
    insert into public.performed_sets(owner_id,performed_exercise_id,exercise_id,planned_exercise_id,planned_set_id,position,source_kind,status,target_kind_snapshot,target_amrap_snapshot,target_load_type_snapshot)
      values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','88888888-8888-4888-8888-888888888888','99999999-9999-4999-8999-999999999997',4,'planned','pending','work',false,'unspecified');
    raise exception 'wrong planned exercise accepted';
  exception when foreign_key_violation then null; end;
  begin
    insert into public.performed_sets(owner_id,performed_exercise_id,exercise_id,position,source_kind,status)
      values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111',2,'extra','completed');
    raise exception 'completed set without result accepted';
  exception when check_violation then null; end;
end $$;

-- Skopiowany cel nie zmienia się przy poprawce wyniku.
update public.performed_sets set status='completed',actual_reps=6,actual_kg=92.5
 where id='aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa';
do $$ begin
  begin
    update public.performed_sets set rounded_target_kg_snapshot=100
     where id='aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa';
    raise exception 'snapshot update accepted';
  exception when raise_exception then
    if sqlerrm = 'snapshot update accepted' then raise; end if;
  end;
  begin
    update public.performed_exercises set target_name_snapshot='Nowa nazwa'
      where id='aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa';
    raise exception 'exercise snapshot update accepted';
  exception when raise_exception then
    if sqlerrm = 'exercise snapshot update accepted' then raise; end if;
  end;
end $$;

-- Opublikowana wersja blokuje późniejszą edycję treści.
update public.plan_versions set state='published',published_at=now()
 where id='55555555-5555-4555-8555-555555555555';
update public.plans set current_version_id='55555555-5555-4555-8555-555555555555',status='active'
 where id='44444444-4444-4444-8444-444444444444';
do $$ begin
  begin
    update public.planned_sets set reps_min=7 where id='99999999-9999-4999-8999-999999999998';
    raise exception 'published set update accepted';
  exception when raise_exception then
    if sqlerrm = 'published set update accepted' then raise; end if;
  end;
end $$;

insert into public.mutation_receipts(id,owner_id,client_operation_id,payload_hash,command_kind,workout_session_id,resulting_revision,response) values
 ('aaaaaaaa-6666-4666-8666-aaaaaaaaaaaa','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-7777-4777-8777-aaaaaaaaaaaa',repeat('a',64),'save_set','aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',1,'{}');
insert into public.workout_revisions(owner_id,workout_session_id,revision,mutation_receipt_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',1,'aaaaaaaa-6666-4666-8666-aaaaaaaaaaaa');
do $$ begin
  begin
    insert into public.mutation_receipts(owner_id,client_operation_id,payload_hash,command_kind,response)
      values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','aaaaaaaa-7777-4777-8777-aaaaaaaaaaaa',repeat('b',64),'save_set','{}');
    raise exception 'duplicate operation accepted';
  exception when unique_violation then null; end;
end $$;

-- RLS: A widzi tylko własny profil; B i anon nie mają dostępu do A.
set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'A sees other profiles'; end if;
  if (select count(*) from public.exercises) <> 1 then raise exception 'A sees other exercises'; end if;
  if (select count(*) from public.performed_sets) <> 4 then raise exception 'A cannot read own sets'; end if;
  begin
    update public.performed_sets set actual_reps=7 where id='aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa';
    raise exception 'direct result update accepted';
  exception when insufficient_privilege then null; end;
end $$;
set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
do $$ begin
  if (select count(*) from public.performed_sets) <> 0 then raise exception 'B sees A sets'; end if;
  if (select count(*) from public.plans) <> 0 then raise exception 'B sees A plans'; end if;
  update public.plans set name='Cudzy plan' where id='44444444-4444-4444-8444-444444444444';
  if found then raise exception 'B updated A plan'; end if;
  begin
    insert into public.planned_sets(owner_id,planned_exercise_id,position,load_type)
      values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','77777777-7777-4777-8777-777777777777',3,'unspecified');
    raise exception 'B linked A planned exercise';
  exception when foreign_key_violation then null; end;
end $$;
set local role anon;
do $$ begin
  begin
    perform count(*) from public.plans;
    raise exception 'anon read accepted';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if (select count(*) from pg_tables where schemaname='public' and tablename in
    ('profiles','exercises','one_rep_max_records','plans','plan_versions','plan_sessions',
     'planned_exercises','planned_sets','workout_sessions','performed_exercises','performed_sets',
     'mutation_receipts','workout_revisions') and rowsecurity) <> 13 then
    raise exception 'RLS missing on a private table';
  end if;
end $$;
rollback;
select 'T02 database assertions passed' as result;

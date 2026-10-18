// Izolowana baza w lokalnym klastrze: schematy Auth/Storage bez danych, 21 migracji,
// syntetyczne legacy, migracja22 i rzeczywiste FK/triggery/rollback. Nie resetuje aplikacji.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
const container='supabase_db_apka-plan-treningowy';
const database=`t13a_replay_${randomUUID().replaceAll('-','')}`;
const docker=(args,input)=>execFileSync('docker',['exec','-i',container,...args],{input,encoding:'utf8',maxBuffer:32*1024*1024,stdio:['pipe','pipe','pipe']});
const sql=text=>docker(['psql','-X','-v','ON_ERROR_STOP=1','-U','postgres','-d',database],text);
const owner=randomUUID();
const asOwner=text=>sql(`select set_config('request.jwt.claim.sub','${owner}',false);\n${text}`);
const plannedSet={position:1,kind:'work',repsMin:5,repsMax:null,isAmrap:false,loadType:'percent_1rm',targetKg:null,targetPercent:75,bodyweightAdjustment:null,bodyweightDeltaKg:null,dumbbellBasis:null,durationSeconds:null,distanceMeters:null,restSeconds:60,tempo:null,targetRpe:null,targetRir:null,note:null};
const document={name:'Replay',sessions:['A','B'].map(dayLabel=>({weekNumber:1,dayLabel,note:null,exercises:[{exerciseId:null,name:'Test',variant:null,equipment:null,supersetGroup:null,note:null,sets:[plannedSet]}]}))};
try {
 docker(['createdb','-U','postgres',database]);
 const dependencies=docker(['pg_dump','-U','postgres','-d','postgres','--schema-only','--schema=auth','--schema=storage','--schema=extensions','--no-owner','--no-privileges'])
   .replace(/^CREATE POLICY [\s\S]*?;\n/gm,'');
 sql(dependencies);sql('create extension if not exists pgcrypto with schema extensions;');
 const files=readdirSync('supabase/migrations').filter(x=>x.endsWith('.sql')).sort();
 const migration='20261017100000_t13a_workout_sessions.sql';
 for(const file of files.filter(x=>x<migration)) sql(readFileSync(`supabase/migrations/${file}`,'utf8'));
 asOwner(`insert into auth.users(id) values('${owner}'); insert into public.profiles(id) values('${owner}');
 create table public.t13_test_state(key text primary key,value jsonb);
 insert into public.t13_test_state values('plan',public.save_manual_plan(gen_random_uuid(),null,null,'${JSON.stringify(document)}'::jsonb));
 insert into public.t13_test_state select 'start-'||position,public.apply_workout_command(gen_random_uuid(),null,0,'start',jsonb_build_object('planSessionId',id,'performedOn','2026-10-17')) from public.plan_sessions where owner_id='${owner}' order by position;
 insert into public.t13_test_state select 'sessions',jsonb_agg(to_jsonb(w) order by id) from public.workout_sessions w;
 insert into public.t13_test_state select 'sets',jsonb_agg(to_jsonb(s) order by id) from public.performed_sets s;
 insert into public.t13_test_state select 'receipts',jsonb_agg(to_jsonb(r) order by id) from public.mutation_receipts r;
 insert into public.t13_test_state select 'revisions',jsonb_agg(to_jsonb(r) order by id) from public.workout_revisions r;`);
 sql(readFileSync(`supabase/migrations/${migration}`,'utf8'));
 asOwner(`do $$ declare before jsonb; after jsonb; w uuid; d uuid; response jsonb; start_receipt public.mutation_receipts%rowtype; begin
 select value into before from public.t13_test_state where key='sessions';
 select jsonb_agg(to_jsonb(s)-'snapshot_on'-'started_at'-'performed_at'-'performed_time_zone' order by id) into after from public.workout_sessions s;
 assert before=after,'legacy sesje zmienione';
 assert not exists(select 1 from public.workout_sessions where snapshot_on<>performed_on or performed_at is not null or started_at is not null),'legacy czas';
 assert (select value from public.t13_test_state where key='sets')=(select jsonb_agg(to_jsonb(s) order by id) from public.performed_sets s),'legacy snapshoty';
 assert (select value from public.t13_test_state where key='receipts')=(select jsonb_agg(to_jsonb(r) order by id) from public.mutation_receipts r),'legacy receipts';
 assert (select value from public.t13_test_state where key='revisions')=(select jsonb_agg(to_jsonb(r) order by id) from public.workout_revisions r),'legacy rewizje';
 assert jsonb_array_length(public.active_workout_summaries())=2,'legacy aktywne';
 select (value->>'workoutId')::uuid into w from public.t13_test_state where key='start-1';
 select plan_session_id into d from public.workout_sessions where id=w;
 begin perform public.apply_workout_command(gen_random_uuid(),null,0,'start',jsonb_build_object('planSessionId',d));raise exception 'brak konfliktu legacy';
 exception when sqlstate 'PT409' then assert sqlerrm='MULTIPLE_ACTIVE_WORKOUTS'; end;
 select * into start_receipt from public.mutation_receipts where workout_session_id=w;
 response:=public.apply_workout_command(start_receipt.client_operation_id,null,0,'start',jsonb_build_object('planSessionId',d,'performedOn','2026-10-17'));
 assert response=start_receipt.response,'legacy retry hash';
 perform public.apply_workout_command(gen_random_uuid(),w,1,'delete','{}');
 begin perform public.apply_workout_command(start_receipt.client_operation_id,null,0,'start',jsonb_build_object('planSessionId',d,'performedOn','2026-10-17'));raise exception 'odtworzenie legacy';
 exception when sqlstate 'PT410' then null; end;
 select (value->>'workoutId')::uuid into w from public.t13_test_state where key='start-2';
 perform public.apply_workout_command(gen_random_uuid(),w,1,'finish','{}');
 end $$;`);
 // Błąd INSERT nowej sesji wystąpi już po rozstrzygnięciu starej. Wyjątek cofa obie strony i receipts.
 asOwner(`insert into public.t13_test_state values('rollback-start',public.apply_workout_command(gen_random_uuid(),null,0,'start',jsonb_build_object('planSessionId',(select id from public.plan_sessions order by position limit 1))));
 create function public.t13_test_failure() returns trigger language plpgsql as $$ begin raise exception 'synthetic insert failure';end $$;
 create trigger t13_test_failure before insert on public.workout_sessions for each row execute function public.t13_test_failure();
 do $$ declare w uuid; before jsonb; after jsonb; resolution text; op uuid; n integer; begin
 select (value->>'workoutId')::uuid into w from public.t13_test_state where key='rollback-start';
 select jsonb_build_object('w',(select jsonb_agg(to_jsonb(x) order by id) from public.workout_sessions x),'e',(select jsonb_agg(to_jsonb(x) order by id) from public.performed_exercises x),'s',(select jsonb_agg(to_jsonb(x) order by id) from public.performed_sets x),'r',(select jsonb_agg(to_jsonb(x) order by id) from public.mutation_receipts x),'v',(select jsonb_agg(to_jsonb(x) order by id) from public.workout_revisions x),'d',(select jsonb_agg(to_jsonb(x) order by workout_id) from public.deleted_workouts x)) into before;
 foreach resolution in array array['delete','finish'] loop
 op:=gen_random_uuid();
 begin perform public.apply_workout_command(op,w,1,'replace_active',jsonb_build_object('resolution',resolution,'next',jsonb_build_object('planSessionId',(select id from public.plan_sessions order by position limit 1))));raise exception 'brak awarii';
 exception when raise_exception then assert sqlerrm='synthetic insert failure'; end;
 select jsonb_build_object('w',(select jsonb_agg(to_jsonb(x) order by id) from public.workout_sessions x),'e',(select jsonb_agg(to_jsonb(x) order by id) from public.performed_exercises x),'s',(select jsonb_agg(to_jsonb(x) order by id) from public.performed_sets x),'r',(select jsonb_agg(to_jsonb(x) order by id) from public.mutation_receipts x),'v',(select jsonb_agg(to_jsonb(x) order by id) from public.workout_revisions x),'d',(select jsonb_agg(to_jsonb(x) order by workout_id) from public.deleted_workouts x)) into after;
 assert before=after,'rollback niepełny';
 end loop;
 assert not has_function_privilege('authenticated','public.t13_delete_workout(uuid,uuid)','execute');
 assert not has_function_privilege('anon','public.apply_workout_command(uuid,uuid,integer,text,jsonb)','execute');
 assert not has_table_privilege('authenticated','public.workout_sessions','delete');
 assert not has_table_privilege('authenticated','public.deleted_workouts','insert');
 end $$;
 drop trigger t13_test_failure on public.workout_sessions;
 drop function public.t13_test_failure();`);
 console.log('T13-A migracje: 21 → legacy/receipts → 22; FK/triggery/granty, rollback finish/delete po awarii INSERT — OK');
} catch(e) { if(e.stderr) console.error(String(e.stderr)); throw e; }
finally {docker(['dropdb','--if-exists','-U','postgres',database]);}

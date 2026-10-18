import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey, T13A_HTTP_BASE: base } = process.env;
if (!url || !key || !adminKey || !['localhost','127.0.0.1'].includes(new URL(url).hostname)) throw Error('Wymagany lokalny Supabase.');
if (base && !['localhost','127.0.0.1'].includes(new URL(base).hostname)) throw Error('HTTP tylko lokalnie.');
const options = { auth: { persistSession:false, autoRefreshToken:false } };
const admin = createClient(url,adminKey,options), anon=createClient(url,key,options), users=[];
function ok(r,label='operacja') { assert.ifError(r.error,`${label}: ${r.error?.message}`); return r.data; }
const set=(position,extra={})=>({position,kind:'work',repsMin:5,repsMax:8,isAmrap:false,loadType:'percent_1rm',targetPercent:75,
 targetKg:null,bodyweightAdjustment:null,bodyweightDeltaKg:null,dumbbellBasis:null,durationSeconds:null,distanceMeters:null,
 restSeconds:60,restSecondsMax:120,tempo:null,targetRpe:null,targetRir:null,note:'Cel testowy',...extra});
const document={name:'T13 syntetyczny',sessions:['A','B'].map(dayLabel=>({weekNumber:1,dayLabel,note:null,exercises:[
 {exerciseId:null,name:'Przysiad',variant:'high bar',equipment:'sztanga',supersetGroup:null,note:'Wskazówka',sets:[set(1),set(2,{isOptional:true})]},
 {exerciseId:null,name:'Czas',variant:null,equipment:null,supersetGroup:null,note:null,sets:[set(1)]}
]}))};
async function tester(label) {
 const email=`t13a-${label}-${randomUUID()}@example.invalid`, password=`T13a-${randomUUID()}!`;
 const {user}=ok(await admin.auth.admin.createUser({email,password,email_confirm:true})); users.push(user.id);
 const jar=new Map(); const client=createServerClient(url,key,{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:items=>items.forEach(({name,value})=>jar.set(name,value))}});
 ok(await client.auth.signInWithPassword({email,password})); ok(await client.from('profiles').insert({id:user.id}));
 return {id:user.id,client,cookie:()=>[...jar].map(([n,v])=>`${n}=${encodeURIComponent(v)}`).join('; ')};
}
const envelope=(action,workoutId=null,expectedRevision=0,payload={},operationId=randomUUID())=>({action,workoutId,expectedRevision,payload,operationId});
const rpc=(client,b)=>client.rpc('apply_workout_command',{p_operation_id:b.operationId,p_workout_id:b.workoutId,p_expected_revision:b.expectedRevision,p_action:b.action,p_payload:b.payload});
async function run(mode) {
 const a=await tester(`${mode}-a`), b=await tester(`${mode}-b`);
 const issue=async(body,actor=a,loseResponse=false)=>{
  if(mode==='rpc') {const result=await rpc(actor.client,body);if(loseResponse && !result.error) throw Error('syntetyczna utrata odpowiedzi po commit');return result;}
  const r=await fetch(`${base}/api/workouts`,{method:'POST',headers:{cookie:actor.cookie(),'content-type':'application/json'},body:JSON.stringify(body)});
  if(loseResponse && r.ok) {await r.body?.cancel();throw Error('syntetyczna utrata odpowiedzi po commit');}
  assert.equal(r.headers.get('cache-control'),'no-store'); const d=await r.json();
  return r.ok?{data:d,error:null}:{data:null,error:{code:r.status===409?'PT409':r.status===410?'PT410':r.status===404?'P0002':String(r.status),message:d.code,details:d.activeWorkouts},status:r.status};
 };
 const read=async(id,actor=a)=>{
  if(mode==='rpc') return actor.client.rpc('read_workout',{p_id:id});
  const r=await fetch(`${base}/api/workouts/${id}`,{headers:{cookie:actor.cookie()}});assert.equal(r.headers.get('cache-control'),'no-store');const d=await r.json();
  return r.ok?{data:d,error:null}:{data:null,error:{code:r.status===410?'PT410':r.status===404?'P0002':String(r.status)}};
 };
 const expectCode=async(p,code)=>{const r=await p;assert.equal(r.error?.code,code,JSON.stringify(r));return r;};
 const plan=ok(await a.client.rpc('save_manual_plan',{p_operation_id:randomUUID(),p_plan_id:null,p_expected_version_id:null,p_document:document}));
 const days=ok(await a.client.from('plan_sessions').select('id').eq('plan_version_id',plan.versionId).order('position'));
 const planned=ok(await a.client.from('planned_exercises').select('exercise_id').eq('plan_session_id',days[0].id).order('position'));
 for(const [effective_on,value_kg] of [['2026-10-15',100],['2026-10-17',120]]) ok(await a.client.from('one_rep_max_records').insert({owner_id:a.id,exercise_id:planned[0].exercise_id,effective_on,value_kg}));
 const start=(i=0,extra={})=>envelope('start',null,0,{planSessionId:days[i].id,...extra});
 // Równoczesne różne dni: reguła dotyczy konta, nie planSessionId.
 const race=await Promise.all([issue(start()),issue(start(1))]);assert.equal(race.filter(r=>!r.error).length,1);assert.equal(race.find(r=>r.error).error.code,'PT409');
 let w=ok(race.find(r=>!r.error));assert.equal(ok(await a.client.rpc('active_workout_summaries')).length,1);
 const automatic=ok(await read(w.workoutId)); assert.ok(automatic.workout.started_at);assert.ok(automatic.workout.performed_at);assert.equal(automatic.workout.snapshot_on,automatic.workout.stored_performed_on);
 const conflict=await issue(start());assert.equal(conflict.error.message,'ACTIVE_WORKOUT_EXISTS');
 const summary=mode==='rpc'?JSON.parse(conflict.error.details):conflict.error.details;assert.equal(summary[0].id,w.workoutId);assert.equal(summary[0].savedSetCount,0);
 await expectCode(read(w.workoutId,b),'P0002');await expectCode(issue(envelope('delete',w.workoutId,1),b),'P0002');
 assert.ok((await rpc(anon,envelope('finish',w.workoutId,1))).error);
 assert.ok((await a.client.from('workout_sessions').delete().eq('id',w.workoutId)).error,'DML delete zamknięte');
 assert.ok((await a.client.from('deleted_workouts').insert({workout_id:randomUUID(),owner_id:a.id})).error);
 assert.ok((await a.client.rpc('t13_delete_workout',{p_id:w.workoutId,p_owner:a.id})).error,'helper prywatny');
 if(base && mode==='http') {
  for(const method of ['GET','POST']) {
   const r=await fetch(`${base}/api/workouts${method==='GET'?`/${w.workoutId}`:''}`,{method,...(method==='POST'?{headers:{'content-type':'application/json'},body:JSON.stringify(start())}:{})}); assert.equal(r.status,401);
  }
 }
 const bplan=ok(await b.client.rpc('save_manual_plan',{p_operation_id:randomUUID(),p_plan_id:null,p_expected_version_id:null,p_document:document}));
 const bday=ok(await b.client.from('plan_sessions').select('id').eq('plan_version_id',bplan.versionId).order('position').limit(1).single());
 const bw=ok(await rpc(b.client,envelope('start',null,0,{planSessionId:bday.id})));const btree=ok(await b.client.rpc('read_workout',{p_id:bw.workoutId}));
 await expectCode(issue(envelope('save_set',w.workoutId,1,{setId:btree.exercises[0].sets[0].id,status:'completed',actualReps:5})),'P0002');
 await expectCode(issue(envelope('add_set',w.workoutId,1,{exerciseId:btree.exercises[0].id})),'P0002');
 await expectCode(issue(envelope('replace_active',w.workoutId,1,{resolution:'delete',next:{planSessionId:bday.id}})),'P0002');
 ok(await issue(envelope('delete',w.workoutId,1)));
 // Ten sam start równocześnie: jeden receipt i sesja. Legacy payload bez godziny.
 const oldStart=start(0,{performedOn:'2026-10-17'});const same=await Promise.all([issue(oldStart),issue(oldStart)]);assert.deepEqual(ok(same[0]),ok(same[1]));w=same[0].data;
 let loaded=ok(await read(w.workoutId));assert.equal(loaded.workout.performed_at,null);assert.equal(loaded.workout.snapshot_on,'2026-10-17');
 if(mode==='http') {const page=await fetch(`${base}/trening/${w.workoutId}`,{headers:{cookie:a.cookie()}});assert.equal(page.status,200);assert.match(await page.text(),/Przysiad/);}
 let all=loaded.exercises.flatMap(e=>e.sets);const target=all[0];assert.equal(target.one_rep_max_kg_snapshot,120);assert.equal(target.rounded_target_kg_snapshot,90);assert.equal(all.at(-1).rounded_target_kg_snapshot,null);
 const snapshots=()=>all.map(s=>Object.fromEntries(Object.entries(s).filter(([k])=>k.includes('snapshot')||k==='one_rep_max_record_id')));
 const beforeSnapshots=snapshots();
 const save=envelope('save_set',w.workoutId,1,{setId:target.id,status:'completed',actualReps:0,actualKg:0,actualNote:'Wynik'});
 const saved=ok(await issue(save));assert.equal(saved.revision,2);
 const comment=envelope('comment',w.workoutId,2,{comment:'Komentarz prywatny'});ok(await issue(comment));
 assert.deepEqual(ok(await issue(save)),saved,'stary receipt nie udaje aktualnej rewizji');
 await expectCode(issue({...save,payload:{...save.payload,actualReps:5}}),'PT409');
 await expectCode(issue(envelope('finish',w.workoutId,2)),'PT409');
 const finish=envelope('finish',w.workoutId,3,{performedAt:'2026-10-15T00:30:00+02:00',timeZone:'Europe/Warsaw'});
 const finished=ok(await issue(finish));assert.equal(finished.revision,4);
 loaded=ok(await read(w.workoutId));all=loaded.exercises.flatMap(e=>e.sets);assert.deepEqual(snapshots(),beforeSnapshots);assert.equal(loaded.workout.performed_on,'2026-10-15');assert.equal(loaded.workout.snapshot_on,'2026-10-17');assert.equal(all[0].actual_kg,0);assert.equal(all[1].status,'pending');
 if(mode==='http') {const page=await fetch(`${base}/historia`,{headers:{cookie:a.cookie()}});assert.equal(page.status,200);assert.match(await page.text(),/2026-10-15/);}
 // Bezpośrednia zmiana niezmiennej kotwicy blokowana także triggerem.
 assert.ok((await admin.from('workout_sessions').update({snapshot_on:'2020-01-01'}).eq('id',w.workoutId)).error);
 assert.ok((await admin.from('performed_sets').update({rounded_target_kg_snapshot:999}).eq('id',target.id)).error);
 // Bieżąca strefa, te same filtry co model odczytu/postęp, bez zmiany snapshot_on.
 ok(await a.client.from('profiles').update({time_zone:'Pacific/Honolulu'}).eq('id',a.id));
 const shifted=ok(await read(w.workoutId));assert.equal(shifted.workout.performed_on,'2026-10-14');
 const filtered=ok(await a.client.from('workout_read_model').select('id').eq('performed_on','2026-10-14'));assert.ok(filtered.some(x=>x.id===w.workoutId));
 assert.deepEqual(ok(await a.client.from('workout_read_model').select('id').eq('id',w.workoutId).eq('performed_on','2026-10-15')),[]);
 if(mode==='http') {const page=await fetch(`${base}/postep?from=2026-10-14&to=2026-10-14`,{headers:{cookie:a.cookie()}});assert.equal(page.status,200);assert.match(await page.text(),/2026-10-14/);}

 ok(await a.client.from('profiles').update({time_zone:'Europe/Warsaw'}).eq('id',a.id));
 await expectCode(issue(envelope('delete',w.workoutId,4)),'PT409');
 // Historyczna poprawka nadal dozwolona; odmienny wariant ma inne exercise_id.
 ok(await issue(envelope('save_set',w.workoutId,4,{...save.payload,actualReps:6,actualKg:90})));
 ok(await issue(envelope('save_set',w.workoutId,5,{setId:all.at(-1).id,status:'completed',actualReps:null,actualKg:null,actualDurationSeconds:60,actualDistanceMeters:400})));
 // Delete i późne retry start/save/nowych komend. Utrata odpowiedzi symulowana odrzuceniem potwierdzenia po commit.
 const s2=start();w=ok(await issue(s2));loaded=ok(await read(w.workoutId));
 assert.equal(loaded.exercises[0].previousSet.actual_reps,6);assert.equal(loaded.exercises[0].previousSet.actual_kg,90);
 assert.equal(loaded.exercises[1].previousSet.actual_duration_seconds,60);assert.equal(loaded.exercises[1].previousSet.actual_distance_meters,400);
 if(mode==='http') assert.equal(loaded.exercises[1].previousResult,'60 s · 400 m');
 // Seria własnej innej sesji także odrzucona (kontrola całego łańcucha).
 await expectCode(issue(envelope('save_set',w.workoutId,1,{...save.payload,setId:target.id})),'P0002');
 const save2=envelope('save_set',w.workoutId,1,{...save.payload,setId:loaded.exercises[0].sets[0].id});ok(await issue(save2));
 const del=envelope('delete',w.workoutId,2);await assert.rejects(issue(del,a,true),/utrata odpowiedzi/);const deleted=ok(await issue(del));assert.equal(deleted.deleted,true);
 assert.equal(deleted.workoutId,w.workoutId);await expectCode(issue(s2),'PT410');await expectCode(issue(save2),'PT410');await expectCode(read(w.workoutId),'PT410');
 await expectCode(issue(envelope('finish',w.workoutId,2)),'PT410');await expectCode(issue({...del,payload:{other:true}}),'PT409');await expectCode(read(w.workoutId,b),'P0002');
 const remaining=ok(await admin.from('performed_exercises').select('id').eq('workout_session_id',w.workoutId));assert.deepEqual(remaining,[]);
 assert.deepEqual(ok(await admin.from('workout_revisions').select('id').eq('workout_session_id',w.workoutId)),[]);
 const receipt=ok(await admin.from('mutation_receipts').select('workout_session_id,response').eq('owner_id',a.id).eq('client_operation_id',save2.operationId).single());assert.equal(receipt.workout_session_id,null);assert.ok(!JSON.stringify(receipt).includes('Wynik'));
 // Rollback replace (zły nowy plan, zła data i awaria po wykonaniu delete są testowane także SQL).
 w=ok(await issue(start()));const state=ok(await read(w.workoutId));
 await expectCode(issue(envelope('replace_active',w.workoutId,1,{resolution:'delete',next:{planSessionId:randomUUID()}})),'P0002');assert.deepEqual(ok(await read(w.workoutId)),state);
 await expectCode(issue(envelope('replace_active',w.workoutId,1,{resolution:'finish',next:{planSessionId:days[1].id},finish:{performedAt:'2026-03-29T02:30:00+01:00',timeZone:'Europe/Warsaw'}})),mode==='rpc'?'22023':'400');assert.deepEqual(ok(await read(w.workoutId)),state);
 const replace=envelope('replace_active',w.workoutId,1,{resolution:'finish',next:{planSessionId:days[1].id}});
 await assert.rejects(issue(replace,a,true),/utrata odpowiedzi/);const replaced=ok(await issue(replace));assert.equal(replaced.resolvedWorkoutId,w.workoutId);assert.equal(ok(await read(w.workoutId)).workout.status,'completed');
 assert.equal(ok(await a.client.from('workout_revisions').select('id').eq('workout_session_id',w.workoutId)).length,2);
 assert.deepEqual(ok(await issue(replace)),replaced);
 const next=ok(await issue(envelope('replace_active',replaced.workoutId,1,{resolution:'delete',next:{planSessionId:days[0].id}})));await expectCode(issue(replace),'PT410');
 assert.equal(ok(await a.client.rpc('active_workout_summaries')).length,1);await expectCode(read(replaced.workoutId),'PT410');
 ok(await issue(envelope('finish',next.workoutId,1))); // retry replace nadal zwraca zakończony nowy trening
 // Legacy wiele aktywnych bez automatycznej naprawy.
 const legacy=[];for(const day of days) legacy.push(ok(await admin.from('workout_sessions').insert({owner_id:a.id,plan_version_id:plan.versionId,plan_session_id:day.id,performed_on:'2020-01-01',snapshot_on:'2020-01-01',revision:1}).select('id').single()));
 const multi=await issue(start());assert.equal(multi.error.message,'MULTIPLE_ACTIVE_WORKOUTS');assert.equal(ok(await a.client.rpc('active_workout_summaries')).length,2);
 await expectCode(issue(envelope('replace_active',legacy[0].id,1,{resolution:'delete',next:{planSessionId:days[0].id}})),'PT409');
 ok(await issue(envelope('finish',legacy[0].id,1)));ok(await issue(envelope('delete',legacy[1].id,1)));
 // Czas: jawne offsety obu powtórzeń jesiennych; luka, przyszłość i zmieniony profil odrzucone.
 for(const offset of ['+02:00','+01:00']) { const x=ok(await issue(start()));ok(await issue(envelope('finish',x.workoutId,1,{performedAt:`2025-10-26T02:30:00${offset}`,timeZone:'Europe/Warsaw'}))); }
 w=ok(await issue(start()));
 await expectCode(issue(envelope('finish',w.workoutId,1,{performedAt:'2026-01-01T12:00:00',timeZone:'Europe/Warsaw'})),mode==='rpc'?'22023':'400');
 await expectCode(issue(envelope('finish',w.workoutId,1,{performedAt:'2099-01-01T12:00:00+01:00',timeZone:'Europe/Warsaw'})),mode==='rpc'?'22023':'400');
 await expectCode(issue(envelope('finish',w.workoutId,1,{performedAt:'2025-01-01T12:00:00Z',timeZone:'UTC'})),'PT409');
 // save vs delete; następny delete dopiero po odczycie rzeczywistej rewizji.
 loaded=ok(await read(w.workoutId));const racingSave=envelope('save_set',w.workoutId,1,{...save.payload,setId:loaded.exercises[0].sets[0].id});
 const racingDelete=envelope('delete',w.workoutId,1);const outcomes=await Promise.all([issue(racingSave),issue(racingDelete)]);assert.equal(outcomes.filter(r=>!r.error).length,1);
 if(!outcomes[0].error) { await expectCode(Promise.resolve(outcomes[1]),'PT409');ok(await issue(envelope('delete',w.workoutId,2))); } else await expectCode(Promise.resolve(outcomes[0]),'PT410');
 // replace vs start, dwa replace; tylko jedna nowa sesja.
 w=ok(await issue(start()));const rr=envelope('replace_active',w.workoutId,1,{resolution:'delete',next:{planSessionId:days[1].id}});
 const rstart=await Promise.all([issue(rr),issue(start())]);assert.equal(rstart.filter(r=>!r.error).length,1);w=ok(rstart[0]);
 const rrs=await Promise.all([issue(envelope('replace_active',w.workoutId,1,{resolution:'finish',next:{planSessionId:days[0].id}})),issue(envelope('replace_active',w.workoutId,1,{resolution:'finish',next:{planSessionId:days[0].id}}))]);assert.equal(rrs.filter(r=>!r.error).length,1);w=ok(rrs.find(r=>!r.error));
 const finishNext=envelope('finish',w.workoutId,1);ok(await issue(finishNext));assert.deepEqual(ok(await issue(rr)),ok(rstart[0]));
 // Spójny GET podczas serii zapisów: actual_note musi odpowiadać odczytanej revision.
 const consistent=ok(await issue(start()));const initial=ok(await read(consistent.workoutId));const sid=initial.exercises[0].sets[0].id;
 const writer=(async()=>{for(let revision=1;revision<=12;revision++) ok(await issue(envelope('save_set',consistent.workoutId,revision,{...save.payload,setId:sid,actualNote:`rev-${revision+1}`})));})();
 for(let j=0;j<18;j++) {const d=ok(await read(consistent.workoutId));const note=d.exercises[0].sets[0].actual_note;assert.equal(note,d.workout.revision===1?null:`rev-${d.workout.revision}`);}
 await writer;
 console.log(`T13-A ${mode}: A/B/anon, start/replace/save/delete concurrency, retry/410, legacy, DST, snapshoty — OK`);
}
try {await run('rpc');if(base) await run('http');else console.log('T13-A: HTTP NIE WYKONANO — ustaw T13A_HTTP_BASE; bramka A niepełna.');}
finally {for(const id of users)ok(await admin.auth.admin.deleteUser(id),'sprzątanie konta');}

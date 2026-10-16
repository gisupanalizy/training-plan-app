import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(`${process.cwd()}/package.json`);
const {createClient}=require('@supabase/supabase-js');
const {createServerClient}=require('@supabase/ssr');
const ref='kwmyosnerwvtwxtszzka', base='https://training-plan-app-seven.vercel.app', url=`https://${ref}.supabase.co`;
assert.equal(process.argv[2],'--run-approved-smoke','Wymagana jawna zgoda na smoke produkcji.');
const raw=JSON.parse(execFileSync('npx',['--no-install','supabase','projects','api-keys','--project-ref',ref,'--reveal','--output','json'],{encoding:'utf8',env:{...process.env,DO_NOT_TRACK:'1'},stdio:['ignore','pipe','ignore'],timeout:30000}));
const keys=Array.isArray(raw)?raw:raw.api_keys??raw.keys??raw.apiKeys;
assert.ok(Array.isArray(keys),'Nieznany format listy kluczy; zatrzymano.');
const key=keys.find(k=>k.type==='publishable'||k.name==='anon')?.api_key;
const secret=keys.find(k=>k.type==='secret'||k.name==='service_role')?.api_key;
assert.ok(key&&secret,'Brak wymaganych kluczy; zatrzymano.');
const networkFetch=(input,init={})=>fetch(input,{...init,signal:AbortSignal.timeout(30000)});
const opts={global:{fetch:networkFetch},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
const admin=createClient(url,secret,opts), anon=createClient(url,key,opts), users=[], files=[];
const ok=(r,label)=>{assert.ok(!r.error,`${label}: ${r.error?.code??'error'}`);return r.data;};
const password=`T11-${randomUUID()}-aA9!`;
async function account(label){
 const email=`t11-smoke-${label}-${randomUUID()}@example.invalid`;
 const {user}=ok(await admin.auth.admin.createUser({email,password,email_confirm:true}),'utworzenie syntetycznego konta');
 users.push(user.id);
 const jar=new Map();
 const client=createServerClient(url,key,{...opts,cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:items=>items.forEach(({name,value})=>jar.set(name,value))}});
 ok(await client.auth.signInWithPassword({email,password}),'logowanie');
 ok(await client.from('profiles').insert({id:user.id}),'profil');
 return {id:user.id,email,client,cookie:()=>[...jar].map(([n,v])=>`${n}=${encodeURIComponent(v)}`).join('; ')};
}
async function http(a,path,body,status=200){
 const response=await networkFetch(base+path,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{cookie:a?.cookie()??'','content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const data=response.headers.get('content-type')?.includes('application/json')?await response.json():await response.text();
 assert.equal(response.status,status,`${path}: HTTP ${response.status}, oczekiwano ${status}; ${typeof data==='object'?data?.error??'JSON':'HTML'}`);
 return data;
}
const set=position=>({position,kind:'work',repsMin:6,repsMax:null,isAmrap:false,loadType:'percent_1rm',targetKg:null,targetPercent:75,bodyweightAdjustment:null,bodyweightDeltaKg:null,dumbbellBasis:null,durationSeconds:null,distanceMeters:null,restSeconds:90,tempo:null,targetRpe:null,targetRir:null,note:null});
const document={name:'Syntetyczny smoke T11',sessions:[{weekNumber:1,dayLabel:'A',note:null,exercises:[{exerciseId:null,name:'Przysiad T11',variant:null,equipment:'sztanga',supersetGroup:null,note:null,sets:[set(1),set(2)]},{exerciseId:null,name:'Brak maksimum T11',variant:null,equipment:null,supersetGroup:null,note:null,sets:[set(1)]}]}]};
let failure=null;
try {
 const a=await account('a'), b=await account('b');console.log('PASS: syntetyczne Auth A/B.');
 await http(null,'/api/plans',undefined,401);
 await http(a,'/api/plans',null,400);
 const bPlan=await http(b,'/api/plans',{operationId:randomUUID(),planId:null,expectedVersionId:null,document:{...document,name:'Syntetyczny B T11'}});
 assert.deepEqual(ok(await a.client.from('plans').select('id').eq('id',bPlan.planId),'A nie czyta B'),[]);
 const payload={operationId:randomUUID(),planId:null,expectedVersionId:null,document};
 const plan=await http(a,'/api/plans',payload);
 assert.deepEqual(await http(a,'/api/plans',payload),plan,'retry publikacji');
 const day=ok(await a.client.from('plan_sessions').select('id').eq('plan_version_id',plan.versionId).single(),'dzień');
 const exercises=ok(await a.client.from('planned_exercises').select('id,exercise_id').eq('plan_session_id',day.id).order('position'),'ćwiczenia');
 const max={operationId:randomUUID(),exerciseId:exercises[0].exercise_id,valueKg:120,effectiveOn:'2026-10-16',note:null};
 await http(a,'/api/one-rep-max',max); await http(b,'/api/one-rep-max',{...max,operationId:randomUUID()},404);
 const startPayload={operationId:randomUUID(),workoutId:null,expectedRevision:0,action:'start',payload:{planSessionId:day.id,performedOn:'2026-10-16'}};
 const started=await http(a,'/api/workouts',startPayload); assert.deepEqual(await http(a,'/api/workouts',startPayload),started);
 const pe=ok(await a.client.from('performed_exercises').select('id,exercise_id').eq('workout_session_id',started.workoutId).order('position'),'snapshot ćwiczeń');
 const sets=ok(await a.client.from('performed_sets').select('*').eq('performed_exercise_id',pe[0].id).order('position'),'snapshot serii');
 assert.equal(sets[0].rounded_target_kg_snapshot,90);
 const missing=ok(await a.client.from('performed_sets').select('rounded_target_kg_snapshot').eq('performed_exercise_id',pe[1].id).single(),'brak 1RM'); assert.equal(missing.rounded_target_kg_snapshot,null);
 const command=(revision,action,payload,operationId=randomUUID())=>({operationId,workoutId:started.workoutId,expectedRevision:revision,action,payload});
 const result={setId:sets[0].id,status:'completed',actualReps:6,actualKg:90,actualDurationSeconds:null,actualDistanceMeters:null,actualRpe:null,actualRir:null,actualNote:null};
 const save=command(1,'save_set',result); const saved=await http(a,'/api/workouts',save); assert.deepEqual(await http(a,'/api/workouts',save),saved);
 console.log(`PASS: start/retry i zapis/retry; rewizja ${saved.revision}.`);
 const stale=command(1,'comment',{comment:'stara rewizja'});
 const directConflict=await a.client.rpc('apply_workout_command',{p_operation_id:stale.operationId,p_workout_id:stale.workoutId,p_expected_revision:stale.expectedRevision,p_action:stale.action,p_payload:stale.payload});
 console.log(JSON.stringify({check:'stale RPC',code:directConflict.error?.code}));
 assert.equal(directConflict.error?.code,'PT409','stara rewizja RPC');
 await http(a,'/api/workouts',stale,409);
 await http(b,'/api/workouts',command(2,'save_set',result),404);
 await http(a,'/api/workouts',command(2,'save_set',{...result,setId:sets[1].id,status:'skipped',actualReps:null,actualKg:null}));
 const extra=await http(a,'/api/workouts',command(3,'add_set',{exerciseId:pe[0].id}));
 await http(a,'/api/workouts',command(4,'save_set',{...result,setId:extra.setId,actualReps:0,actualKg:null}));
 await http(a,'/api/workouts',command(5,'add_exercise',{name:'Podciąganie T11',variant:null}));
 await http(a,'/api/workouts',command(6,'comment',{comment:'Syntetyczny smoke'}));
 await http(a,'/api/workouts',command(7,'finish',{}));
 for(const table of ['exercises','plans','plan_versions','plan_sessions','planned_exercises','planned_sets','workout_sessions','performed_exercises','performed_sets','mutation_receipts','workout_revisions','plan_save_receipts']){
  assert.deepEqual(ok(await b.client.from(table).select('*').eq('owner_id',a.id),`B ${table}`),[]);
  const ar=await anon.from(table).select('owner_id').eq('owner_id',a.id);assert.ok(ar.error||!ar.data.length);
  assert.equal((await a.client.from(table).update({owner_id:a.id}).eq('owner_id',a.id)).error?.code,'42501',`DML ${table}`);
 }
 const changed=structuredClone(document);changed.name='Nowa wersja T11';changed.sessions[0].exercises.forEach((e,i)=>e.exerciseId=exercises[i].exercise_id);changed.sessions[0].exercises[0].sets[0].targetPercent=80;
 await http(a,'/api/plans',{...payload,operationId:randomUUID(),planId:plan.planId,expectedVersionId:plan.versionId,document:changed});
 await http(a,'/api/one-rep-max',{...max,operationId:randomUUID(),valueKg:150});
 assert.deepEqual(ok(await a.client.from('performed_sets').select('*').eq('id',sets[0].id).single(),'historia').rounded_target_kg_snapshot,90);
 console.log('PASS: ręczny trening, A/B/anon, 12 tabel, wersje i snapshoty.');
 for(const bucket of ['training-private']){
  const path=`${a.id}/${randomUUID()}.png`;
  const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7ioAAAAASUVORK5CYII=','base64');
  ok(await a.client.storage.from(bucket).upload(path,bytes,{contentType:'image/png'}),'upload własny');files.push([bucket,path]);
  ok(await a.client.storage.from(bucket).download(path),'download własny');
  assert.ok((await b.client.storage.from(bucket).download(path)).error,'B download');assert.ok((await anon.storage.from(bucket).download(path)).error,'anon download');
  assert.notEqual((await networkFetch(a.client.storage.from(bucket).getPublicUrl(path).data.publicUrl)).status,200,'brak linku publicznego');
  const signed=ok(await a.client.storage.from(bucket).createSignedUrl(path,60),'podpis własny');assert.equal((await networkFetch(signed.signedUrl)).status,200);
  assert.ok((await b.client.storage.from(bucket).createSignedUrl(path,60)).error,'podpis B');
  assert.ok((await b.client.storage.from(bucket).upload(`${a.id}/${randomUUID()}.png`,bytes,{contentType:'image/png'})).error,'cudzy upload');
 }
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j7ioAAAAASUVORK5CYII=','base64');
 const upload=await http(a,'/api/imports',{kind:'image',mime:'image/png',size:png.length},201);
 assert.ok(upload.path.startsWith(`${a.id}/`),'ścieżka własnego importu');
 files.push(['training-imports',upload.path]);
 ok(await a.client.storage.from('training-imports').uploadToSignedUrl(upload.path,upload.token,png,{contentType:'image/png'}),'signed upload importu');
 await http(a,`/api/imports/${upload.id}/upload`,{});
 const source=await networkFetch(`${base}/api/imports/${upload.id}/source`,{headers:{cookie:a.cookie()}});
 assert.equal(source.status,200);assert.match(source.headers.get('cache-control'),/no-store/);assert.equal((await source.arrayBuffer()).byteLength,png.length);
 await http(b,`/api/imports/${upload.id}/source`,undefined,404);await http(null,`/api/imports/${upload.id}/source`,undefined,401);
 assert.ok((await b.client.storage.from('training-imports').download(upload.path)).error,'B plik importu');
 assert.ok((await anon.storage.from('training-imports').download(upload.path)).error,'anon plik importu');
 await http(a,`/api/imports/${upload.id}/cancel`,{});await http(a,`/api/imports/${upload.id}/source`,undefined,410);
 console.log('PASS: oba prywatne buckety, źródło, upload i anulowanie.');
 const imp=await http(a,'/api/imports',{kind:'text',mime:'text/plain',text:'Syntetyczny test',size:16},201);
 const job=imp.job;assert.ok(job?.id,'id importu');
 await http(b,`/api/imports/${job.id}`,undefined,404);
 await http(a,`/api/imports/${job.id}/process`,{},503);
 await http(a,'/api/voice/interpret',{scope:'plan',text:'Syntetyczny test'},503);
 for(const path of ['/plany','/historia','/postep','/profil']){const html=await http(a,path);assert.equal(typeof html,'string');}
 await a.client.auth.signOut();ok(await a.client.auth.signInWithPassword({email:a.email,password}),'ponowne logowanie');
 const past=await http(a,'/historia');assert.match(past,/Syntetyczny smoke T11/);
 const zero=ok(await a.client.from('performed_sets').select('actual_reps,actual_kg').eq('id',extra.setId).single(),'zero/null');assert.equal(zero.actual_reps,0);assert.equal(zero.actual_kg,null);
 console.log('PASS: HTTPS/Auth/API A/B/anon; ręczny plan/1RM/trening/historia; retry/konflikt/wersje/snapshoty/zero/null; 12 tabel DML UPDATE; Storage obu bucketów; import i głos bez AI (503). Bez testu UI i SMTP.');
} catch(error){failure=error;console.error(`FAIL: ${error.message}`);}
finally{
 const cleanupFailures=[];
 for(const [bucket,path] of files){try{ok(await admin.storage.from(bucket).remove([path]),'sprzątanie własnego pliku');}catch{cleanupFailures.push('plik');}}
 for(const id of users){try{ok(await admin.auth.admin.deleteUser(id),'sprzątanie własnego konta');}catch{cleanupFailures.push('konto');}}
 console.log(`CLEANUP: ${users.length} własne konta i ${files.length} własne pliki; błędy: ${cleanupFailures.length}.`);
 if(cleanupFailures.length)process.exitCode=1;
}
if(failure)process.exitCode=1;

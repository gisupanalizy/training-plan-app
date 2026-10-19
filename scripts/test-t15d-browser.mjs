import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { fixture, ok, base } from './test-t15e-api.mjs';
const { chromium } = await import(pathToFileURL(process.env.T15D_PLAYWRIGHT_MODULE).href);
const f = await fixture();
let browser;
const measures=[];
try {
 browser = await chromium.launch({ headless:true, channel:'chrome' });
 const plan = ok(await f.a.client.from('workout_sessions').select('plan_version_id,plan_session_id').eq('id',f.started.workoutId).single());
 const seeds=[
  {id:randomUUID(),date:'2026-10-01',at:'2026-10-01T16:00:00Z',status:'completed'},
  {id:randomUUID(),date:'2025-12-31',at:'2025-12-31T23:30:00Z',status:'completed'},
  {id:randomUUID(),date:'2025-10-26',at:'2025-10-26T00:30:00Z',status:'completed'},
  {id:randomUUID(),date:'2025-10-26',at:'2025-10-26T01:30:00Z',status:'completed'},
  {id:randomUUID(),date:'2024-02-29',at:null,status:'completed'},
  {id:randomUUID(),date:'2026-10-14',at:'2026-10-14T22:30:00Z',status:'in_progress'},
 ];
 ok(await f.admin.from('workout_sessions').insert(seeds.map(s=>({id:s.id,owner_id:f.a.id,...plan,performed_on:s.date,snapshot_on:s.date,performed_at:s.at,performed_time_zone:s.at?'Europe/Warsaw':null,status:s.status,revision:1}))));
 const active=seeds.at(-1);
 for (const block of f.original) {
  const blockId=randomUUID();ok(await f.admin.from('performed_exercises').insert({...block,id:blockId,workout_session_id:active.id}));
  ok(await f.admin.from('performed_sets').insert(f.originalSets.filter(s=>s.performed_exercise_id===block.id).map(s=>({...s,id:randomUUID(),performed_exercise_id:blockId}))));
 }
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
 await context.addCookies([...f.a.jar].map(([name,value])=>({name,value:encodeURIComponent(value),url:base})));
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const history=(month,day)=>page.goto(`${base}/historia?month=${month}&day=${day}`);
 const dayButton=day=>page.locator(`[data-day="${day}"]`);
 const selected=()=>page.locator('section[aria-labelledby="selected-history-day"]');
 await history('2026-10','2026-10-01');
 assert.equal(await selected().getByRole('link').count(),2,'completed+legacy, bez abandoned');
 assert.match(await selected().innerText(),/18:00/);assert.match(await selected().innerText(),/godzina nieznana/);
 assert.match(await dayButton('2026-10-01').getAttribute('aria-label'),/zakończone treningi: 2/);
 assert.equal(await page.locator('section[aria-labelledby="active-history"]').getByRole('link').count(),1);
 for(const width of [360,390,430]) {
  await page.setViewportSize({width,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`overflow${width}`);
  const boxes=await page.locator('[data-day]').evaluateAll(els=>els.map(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})));
  assert.ok(boxes.every(b=>b.width>=44&&b.height>=44));
  measures.push({width,days:boxes.length,minWidth:Math.min(...boxes.map(b=>b.width)),minHeight:Math.min(...boxes.map(b=>b.height))});
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/t15d-calendar-390.png'});
 await dayButton('2026-10-02').tap();assert.match(await selected().innerText(),/Brak zakończonych/);
 await dayButton('2026-10-02').focus();await page.keyboard.press('Home');assert.equal(await page.locator('[aria-pressed=true]').getAttribute('data-day'),'2026-09-28');
 await page.waitForFunction(()=>document.activeElement?.getAttribute('data-day')==='2026-09-28');
 await page.keyboard.press('End');assert.equal(await page.locator('[aria-pressed=true]').getAttribute('data-day'),'2026-10-04');
 await page.waitForFunction(()=>document.activeElement?.getAttribute('data-day')==='2026-10-04');
 await page.keyboard.press('PageDown');assert.equal(await page.locator('[aria-pressed=true]').getAttribute('data-day'),'2026-11-04');
 await page.waitForFunction(()=>document.activeElement?.getAttribute('data-day')==='2026-11-04');
 await page.getByRole('button',{name:'Dzisiaj',exact:true}).click();const today=await page.locator('[aria-current=date]').getAttribute('data-day');assert.equal(await page.locator('[aria-pressed=true]').getAttribute('data-day'),today);
 await history('2024-02','2024-02-29');assert.equal(await page.locator('[data-day]').count(),29);assert.equal(await selected().getByRole('link').count(),1);
 await page.getByRole('button',{name:'Następny miesiąc'}).click();assert.equal(await page.locator('[aria-pressed=true]').getAttribute('data-day'),'2024-03-29');assert.match(await selected().innerText(),/Brak zakończonych/);
 await history('2025-10','2025-10-26');assert.equal(await selected().getByRole('link').count(),2);assert.equal((await selected().innerText()).match(/02:30/g).length,2);
 await history('2026-01','2026-01-01');assert.equal(await selected().getByRole('link').count(),1);assert.match(await selected().innerText(),/00:30/);
 // Historyczne serie otwierają wspólny przegląd; zachowanie kontekstu powrotu.
 await history('2026-10','2026-10-01');
 await selected().locator(`a[href^="/trening/${f.started.workoutId}?"]`).click();await page.waitForURL(`**/trening/${f.started.workoutId}?**`);
 await page.getByRole('link',{name:'← Historia treningów',exact:true}).click();await page.waitForURL('**/historia?month=2026-10&day=2026-10-01');
 assert.equal(await dayButton('2026-10-01').getAttribute('aria-pressed'),'true');
 // Korekta zapisanej serii nie rusza snapshotów ani daty; odczyt historii jest świeży.
 const before=ok(await f.a.client.from('performed_sets').select('*').in('performed_exercise_id',f.original.map(e=>e.id)).order('id'));
 const revision=ok(await f.a.client.from('workout_sessions').select('revision').eq('id',f.started.workoutId).single()).revision;
 await f.command(f.started.workoutId,revision,'save_set',f.save(f.originalSets[0],4,110));
 const after=ok(await f.a.client.from('performed_sets').select('*').in('performed_exercise_id',f.original.map(e=>e.id)).order('id'));
 const snapshots=rows=>rows.map(s=>Object.fromEntries(Object.entries(s).filter(([k])=>k.includes('snapshot')||k==='one_rep_max_record_id')));
 assert.deepEqual(snapshots(after),snapshots(before));await page.reload();assert.equal(await selected().getByRole('link').count(),2);
 // Finish w B z korektą czasu: znika Wznów, oznaczenie trafia do poprawionego dnia.
 await page.locator(`a[href^="/trening/${active.id}?"]`).click();await page.getByRole('button',{name:'Zakończ trening',exact:true}).click();
 await page.getByLabel('Popraw datę i godzinę wykonania').check();await page.getByLabel('Data i godzina wykonania',{exact:true}).fill('2026-10-02T09:15');
 await page.getByRole('button',{name:'Potwierdź zakończenie',exact:true}).click();await page.getByText(/Zakończony/).first().waitFor();
 await page.getByRole('link',{name:'← Historia treningów',exact:true}).click();await page.waitForURL('**/historia?month=2026-10&day=2026-10-01');
 assert.equal(await page.locator('section[aria-labelledby="active-history"]').count(),0);
 await dayButton('2026-10-02').click();assert.match(await selected().innerText(),/09:15/);
 const corrected=ok(await f.a.client.rpc('read_workout',{p_id:active.id}));assert.equal(corrected.workout.performed_on,'2026-10-02');assert.equal(corrected.exercises[0].sets[0].target_kg_snapshot,f.originalSets.find(s=>s.performed_exercise_id===f.original[0].id).target_kg_snapshot);
 // Osobna aktywna sesja: trwałe delete w B wraca do tego samego dnia i usuwa Wznów.
 const deleted=await f.command(null,0,'start',{planSessionId:plan.plan_session_id});await page.reload();await page.locator(`a[href^="/trening/${deleted.workoutId}?"]`).click();
 await page.getByRole('button',{name:'Usuń trening',exact:true}).click();await page.getByRole('button',{name:'Potwierdzam trwałe usunięcie',exact:true}).click();
 await page.waitForURL('**/historia?month=2026-10&day=2026-10-02');assert.equal(await page.locator('section[aria-labelledby="active-history"]').count(),0);assert.equal(await dayButton('2026-10-02').getAttribute('aria-pressed'),'true');
 assert.ok((await f.a.client.rpc('read_workout',{p_id:deleted.workoutId})).error);
 // Zmiana strefy: północ wraca do31.12, date-only legacy się nie przesuwa.
 ok(await f.a.client.from('profiles').update({time_zone:'America/Los_Angeles'}).eq('id',f.a.id));
 await history('2025-12','2025-12-31');assert.equal(await selected().getByRole('link').count(),1);assert.match(await selected().innerText(),/15:30/);
 await history('2026-01','2026-01-01');assert.match(await selected().innerText(),/Brak zakończonych/);
 await history('2026-10','2026-10-01');assert.equal(await selected().getByRole('link').count(),2);assert.match(await selected().innerText(),/godzina nieznana/);
 // Przeładowanie i błędne/duplikowane query nie zmieniają praw dostępu.
 await page.reload();assert.equal(await dayButton('2026-10-01').getAttribute('aria-pressed'),'true');
 await page.goto(`${base}/historia?month=2025-02&day=2025-02-29`);assert.equal(await page.locator('[aria-pressed=true]').getAttribute('data-day'),await page.locator('[aria-current=date]').getAttribute('data-day'));
 const bContext=await browser.newContext();await bContext.addCookies([...f.b.jar].map(([name,value])=>({name,value:encodeURIComponent(value),url:base})));
 const bPage=await bContext.newPage();await bPage.goto(`${base}/historia?month=2026-10&day=2026-10-01`);assert.equal(await bPage.locator('section[aria-labelledby="selected-history-day"]').getByRole('link').count(),0);assert.ok(!(await bPage.content()).includes(f.started.workoutId));
 const denied=await bContext.request.get(`${base}/api/workouts/${f.started.workoutId}`);assert.ok([404,410].includes(denied.status()));
 const anon=await browser.newContext();const anonPage=await anon.newPage();await anonPage.goto(`${base}/historia`);assert.match(anonPage.url(),/logowanie/);
 assert.deepEqual(errors,[]);await writeFile('/private/tmp/t15d-report.json',JSON.stringify({measures,errors,keyboard:true,privacy:true},null,2));
 console.log('T15-D PASS: lokale Auth/API/RPC/Chrome,360/390/430,44px,mouse/tap/keyboard,puste/wiele/legacy/abandoned,leapyear/DST/midnight/zone,powrót/finish/delete/snapshoty,A/B/anon.');console.log(JSON.stringify(measures));
} finally {try {await browser?.close();} finally {await f.cleanup();}}

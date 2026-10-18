import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
const base = process.env.T15F_HTTP_BASE ?? 'http://localhost:3005';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
assert.match(process.env.SUPABASE_URL ?? '', /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const { chromium } = await import(pathToFileURL(process.env.T15F_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = value => { if (value.error) throw new Error(value.error.message); return value.data; };
let userId; const report = []; const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/logowanie`);
  for (const width of [360,390,430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'night');
    assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).colorScheme), 'dark');
    assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(17, 24, 31)');
    report.push({ screen: 'logowanie', width, night: true });
  }
  const email = `t15f-${randomUUID()}@example.invalid`, password = randomUUID();
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true })); userId = user.id;
  ok(await admin.from('profiles').insert({ id: userId }));
  const jar = new Map();
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { cookies: { getAll: () => [...jar].map(([name,value]) => ({ name,value })), setAll: entries => entries.forEach(({name,value}) => jar.set(name,value)) } });
  ok(await client.auth.signInWithPassword({ email,password }));
  const target = { position: 1, kind: 'work', repsMin: 6, repsMax: 6, isAmrap: false, isOptional: false, loadType: 'absolute', targetKg: 60, targetKgMax: null, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, durationSecondsMax: null, distanceMeters: null, restSeconds: 60, restSecondsMax: null, tempo: null, targetRpe: null, targetRir: null, note: null };
  const document = { name: 'Plan fundamentu', sessions: [{ weekNumber: 1, dayLabel: 'A', note: null, exercises: ['Przysiad przedni','Wyciskanie sztangi leżąc','Podciąganie nachwytem','Deska'].map(name => ({ name, exerciseId: null, originalName: name, variant: null, equipment: null, supersetGroup: null, note: null, sets: [target] })) }] };
  const plan = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document }));
  await page.goto(`${base}/logowanie?powod=sesja`);
  await page.getByRole('status').filter({hasText:'Sesja wygasła'}).waitFor();
  await page.getByLabel('Adres e-mail').fill(email);
  await page.getByLabel('Hasło',{exact:true}).fill('incorrect-password');
  await page.getByRole('button',{name:'Zaloguj się',exact:true}).click();
  await page.getByRole('region',{name:'Logowanie',exact:true}).getByRole('alert').waitFor();
  assert.equal(await page.getByRole('region',{name:'Logowanie',exact:true}).getByRole('alert').evaluate(el=>el===document.activeElement),true);
  await page.getByLabel('Adres e-mail').fill(email);
  await page.getByLabel('Hasło',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Zaloguj się',exact:true}).click();
  await page.waitForURL(base+'/');
  await page.goto(`${base}/profil`);
  await page.getByLabel('Rzeczywiste 1RM, kg').fill('100');
  await page.getByLabel('Data obowiązywania').fill('2026-10-18');
  await page.getByRole('button',{name:'Zapisz maksimum',exact:true}).click();
  await page.getByRole('region',{name:'Historia 1RM'}).getByText('100 kg',{exact:true}).waitFor();
  await page.getByLabel('Krok kg').fill('1.25');
  await page.getByRole('button',{name:'Zapisz krok',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('input[value="1.25"]'));
  for (const width of [360,390,430]) {
    await page.setViewportSize({width,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    report.push({screen:'profil',width,manualMaximum:true});
  }
  await page.screenshot({path:'/private/tmp/t15f-profile.png',fullPage:true});
  await page.goto(`${base}/ustaw-haslo`);
  const newPassword=randomUUID();
  await page.getByLabel('Nowe hasło').fill(newPassword);
  await page.getByRole('button',{name:'Zapisz hasło',exact:true}).click();
  await page.waitForURL(`${base}/profil`);
  await page.getByRole('button',{name:'Wyloguj się',exact:true}).click();
  await page.waitForURL(/logowanie/);
  await page.getByLabel('Adres e-mail').fill(email);
  await page.getByLabel('Hasło',{exact:true}).fill(newPassword);
  await page.getByRole('button',{name:'Zaloguj się',exact:true}).click();
  await page.waitForURL(base+'/');
  assert.deepEqual(errors,[]);
  await writeFile('/private/tmp/t15f-browser-report.json',JSON.stringify({report,passwordChanged:true,errors},null,2));
  console.log('T15-F PASS: lokalny login/error/focus, datowany1RM, krok, hasło/logout/relogin,360/390/430.');
} finally {
  if(userId) ok(await admin.auth.admin.deleteUser(userId));
  await browser.close();
}

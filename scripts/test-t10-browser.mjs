import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const { chromium } = await import(pathToFileURL(process.env.T10_PLAYWRIGHT_MODULE).href);
const base = process.env.T10_HTTP_BASE ?? 'http://localhost:3006';
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const users = [];
const ok = (result, label) => { assert.ifError(result.error, label); return result.data; };
let activePage;
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const set = position => ({ position, kind: 'work', repsMin: 6, repsMax: null, isAmrap: false,
  loadType: 'percent_1rm', targetKg: null, targetPercent: 75, bodyweightAdjustment: null,
  bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, distanceMeters: null,
  restSeconds: 90, tempo: null, targetRpe: null, targetRir: null, note: null });
const document = { name: 'Plan odbioru T10', sessions: [{ weekNumber: 1, dayLabel: 'A', note: null,
  exercises: [ { exerciseId: null, name: 'Przysiad odbioru T10', variant: null, equipment: 'sztanga',
    supersetGroup: null, note: null, sets: [set(1), set(2)] },
  { exerciseId: null, name: 'Wiosłowanie bez maksimum', variant: null, equipment: 'sztanga',
    supersetGroup: null, note: null, sets: [set(1)] } ] }] };
async function login(page, account) {
  await page.goto(`${base}/logowanie`);
  await page.getByLabel('Adres e-mail').fill(account.email);
  await page.getByLabel('Hasło', { exact: true }).fill(account.password);
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await page.waitForURL(`${base}/`);
}
async function changedPage(page, button) {
  await Promise.all([page.waitForEvent('load'), button.click()]);
}
try {
  const accounts = [];
  for (const label of ['a', 'b']) {
    const email = `t10-browser-${label}-${randomUUID()}@example.invalid`, password = randomUUID();
    const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), 'konto');
    users.push(user.id); ok(await admin.from('profiles').insert({ id: user.id }), 'profil');
    accounts.push({ email, password, id: user.id });
  }
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options);
  ok(await client.auth.signInWithPassword(accounts[0]), 'fixture Auth');
  const saved = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null,
    p_expected_version_id: null, p_document: document }), 'fixture plan przez RPC');
  const catalog = ok(await client.from('exercises').select('id,name'), 'katalog');
  const squatId = catalog.find(row => row.name === 'Przysiad odbioru T10').id;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); activePage = page;
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  // Test zabrania próby bezpośredniego wywołania dostawcy z przeglądarki.
  await context.route('https://api.openai.com/**', () => { throw new Error('Niedozwolone wywołanie AI w T10.'); });
  await login(page, accounts[0]);
  await page.goto(`${base}/profil`);
  await page.getByLabel('Ćwiczenie').selectOption(squatId);
  await page.getByLabel('Rzeczywiste 1RM, kg').fill('120');
  await page.getByLabel('Data obowiązywania').fill('2026-01-01');
  await changedPage(page, page.getByRole('button', { name: 'Zapisz maksimum', exact: true }));
  assert.equal(ok(await client.from('one_rep_max_records').select('value_kg').eq('exercise_id', squatId), '1RM')[0].value_kg, 120);
  await page.goto(`${base}/plany/${saved.planId}`);
  await page.getByLabel('Data treningu').fill('2026-10-14');
  await page.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click();
  await page.waitForURL(/\/trening\/[a-f0-9-]+$/);
  const workoutUrl = page.url(), workoutId = workoutUrl.split('/').at(-1);
  await page.getByRole('heading', { name: 'Przysiad odbioru T10', exact: true }).waitFor();
  const squat = page.locator('section.editor-card').filter({ has: page.getByRole('heading', { name: 'Przysiad odbioru T10', exact: true }) });
  const missing = page.locator('section.editor-card').filter({ has: page.getByRole('heading', { name: 'Wiosłowanie bez maksimum', exact: true }) });
  assert.match(await squat.innerText(), /75% 1RM · 90 kg/);
  assert.match(await missing.innerText(), /brak 1RM, kg nieokreślone/);
  assert.equal(await squat.getByLabel('Ciężar (kg)', { exact: true }).first().inputValue(), '', 'cel nie jest wynikiem');
  const requests = [];
  await page.route('**/api/workouts', async route => {
    const body = route.request().postDataJSON();
    if (body.action !== 'save_set' || body.payload.status !== 'completed' || requests.length >= 2) return route.continue();
    requests.push(body);
    const response = await route.fetch();
    assert.equal(response.status(), 200);
    if (requests.length === 1) await route.abort('failed'); else await route.fulfill({ response });
  });
  await squat.getByLabel('Powtórzenia', { exact: true }).first().fill('6');
  await squat.getByLabel('Ciężar (kg)', { exact: true }).first().fill('90');
  await squat.getByRole('button', { name: 'Zapisz serię', exact: true }).first().click();
  await page.getByRole('button', { name: 'Ponów tę samą operację', exact: true }).waitFor();
  await changedPage(page, page.getByRole('button', { name: 'Ponów tę samą operację', exact: true }));
  assert.deepEqual(requests[0], requests[1], 'retry zachowuje pełną komendę');
  assert.equal((await squat.locator('.outline-tag').filter({ hasText: 'ZAPISANA' }).count()), 1);
  await changedPage(page, squat.getByRole('button', { name: 'Pomiń serię', exact: true }).nth(1));
  // Jawne zero i brak kg pozostają różne.
  await missing.getByLabel('Powtórzenia', { exact: true }).fill('0');
  await changedPage(page, missing.getByRole('button', { name: 'Zapisz serię', exact: true }));
  await page.getByLabel('Nazwa', { exact: true }).fill('Podciąganie dodatkowe T10');
  await changedPage(page, page.getByRole('button', { name: '+ Dodaj ćwiczenie', exact: true }));
  const extra = page.locator('section.editor-card').filter({ has: page.getByRole('heading', { name: 'Podciąganie dodatkowe T10', exact: true }) });
  await changedPage(page, extra.getByRole('button', { name: '+ Dodatkowa seria', exact: true }));
  await extra.getByLabel('Powtórzenia', { exact: true }).fill('8');
  await changedPage(page, extra.getByRole('button', { name: 'Zapisz serię', exact: true }));
  await page.getByLabel('Komentarz', { exact: true }).fill('Syntetyczny odbiór T10');
  await changedPage(page, page.getByRole('button', { name: 'Zapisz komentarz', exact: true }));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'trening bez mobilnego overflow');
  await page.screenshot({ path: '/private/tmp/t10-workout-mobile.png', fullPage: true });
  await changedPage(page, page.getByRole('button', { name: 'Zakończ trening', exact: true }));
  const performed = ok(await client.from('performed_exercises').select('id,exercise_id').eq('workout_session_id', workoutId), 'wykonanie');
  const sets = ok(await client.from('performed_sets').select('*').in('performed_exercise_id', performed.map(row => row.id)), 'wyniki');
  assert.equal(sets.length, 4, 'retry nie dodaje serii');
  assert.equal(sets.filter(row => row.status === 'skipped').length, 1);
  assert.ok(sets.some(row => row.actual_reps === 0 && row.actual_kg === null));
  assert.equal(sets.find(row => row.actual_kg === 90).rounded_target_kg_snapshot, 90);
  assert.equal(ok(await client.from('workout_sessions').select('status').eq('id', workoutId).single(), 'koniec').status, 'completed');
  await page.goto(`${base}/profil`);
  await page.getByRole('button', { name: 'Wyloguj się', exact: true }).click();
  await page.waitForURL(/\/logowanie/);
  await login(page, accounts[0]);
  await page.goto(`${base}/historia`);
  await page.getByRole('link').filter({ hasText: '2026-10-14' }).first().click();
  await page.waitForURL(workoutUrl);
  assert.equal(page.url(), workoutUrl);
  assert.equal(await page.locator('section.editor-card').filter({ has: page.getByRole('heading', { name: 'Komentarz do treningu', exact: true }) }).getByRole('textbox').inputValue(), 'Syntetyczny odbiór T10');
  await page.goto(`${base}/postep?exercise=${squatId}`);
  await page.getByText('Porównywalna objętość: 540 kg · 1 seria', { exact: true }).waitFor();
  await page.screenshot({ path: '/private/tmp/t10-progress-mobile.png', fullPage: true });
  // B przechodzi przez rzeczywisty formularz i nie widzi obcych stron/danych.
  const other = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const pageB = await other.newPage(); await login(pageB, accounts[1]);
  for (const path of [`/plany/${saved.planId}`, `/trening/${workoutId}`]) {
    assert.equal((await pageB.goto(`${base}${path}`)).status(), 404);
    assert.doesNotMatch(await pageB.locator('body').innerText(), /Syntetyczny odbiór T10|Przysiad odbioru T10/);
  }
  await pageB.goto(`${base}/postep`);
  assert.doesNotMatch(await pageB.locator('body').innerText(), /540 kg|Przysiad odbioru T10/);
  // Niepoprawne JSON odrzucane przez prawdziwy HTTP, zanim wywołamy zapis.
  for (const path of ['/api/plans', '/api/workouts', '/api/one-rep-max', '/api/profile/rounding']) {
    const response = await context.request.post(`${base}${path}`, { data: 'null', headers: { 'content-type': 'application/json' } });
    assert.equal(response.status(), 400, path);
  }
  const guest = await browser.newContext();
  const unauthorized = await guest.request.post(`${base}/api/workouts`, { data: {} });
  assert.equal(unauthorized.status(), 401);
  assert.ok((await unauthorized.json()).error);
  assert.deepEqual(errors, [], 'brak błędów strony');
  await guest.close(); await other.close(); await context.close();
  console.log('T10 Chrome: PASS — logowanie UI, 1RM, start, ręczne wyniki, zero/null, pominięcie, dodatkowe ćwiczenie/seria, komentarz, retry HTTP, koniec, ponowne logowanie/historia/postęp, A/B/anon, błędny JSON. Dane syntetyczne; AI wyłączone.');
} catch (error) {
  if (activePage) {
    console.error('T10 Chrome: strona błędu', activePage.url());
    await activePage.screenshot({ path: '/private/tmp/t10-failure.png', fullPage: true });
  }
  throw error;
} finally {
  await browser.close();
  for (const id of users) ok(await admin.auth.admin.deleteUser(id), 'sprzątanie kont T10 Chrome');
}

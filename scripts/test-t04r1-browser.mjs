import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const { chromium } = await import(pathToFileURL(process.env.T04R1_PLAYWRIGHT_MODULE).href);
const base = process.env.T04R1_HTTP_BASE ?? 'http://localhost:3008';
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const ok = result => { if (result.error) throw new Error(result.error.message); return result.data; };
const users = [];
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const set = (position, reps = 8) => ({ reviewId: randomUUID(), sourceRef: `synthetic:${position}`, position, kind: 'work',
  repsMin: reps, repsMax: 10, isAmrap: false, loadType: 'absolute', targetKg: 60, targetKgMax: null,
  targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null,
  durationSeconds: null, durationSecondsMax: null, distanceMeters: null, restSeconds: 90, restSecondsMax: null,
  tempo: '3010', targetRpe: 8, targetRir: null, note: `Uwagi serii ${position}`, isOptional: false });
const exercise = (name, count = 3) => ({ reviewId: randomUUID(), exerciseId: null, name, originalName: name,
  variant: null, equipment: 'sztanga', supersetGroup: null, note: 'Syntetyczna wskazówka', sets: Array.from({ length: count }, (_, index) => set(index + 1)) });
const document = { name: 'Syntetyczny plan T04-R1', sessions: [
  { reviewId: randomUUID(), weekNumber: 1, dayLabel: 'A', note: 'Uwagi treningu A', exercises: [exercise('Przysiad'), exercise('Wiosłowanie'), exercise('Wyciskanie')] },
  { reviewId: randomUUID(), weekNumber: 2, dayLabel: 'B', note: null, exercises: [exercise('Martwy ciąg')] },
] };
try {
  const email = `t04r1-${randomUUID()}@example.invalid`, password = randomUUID();
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true })); users.push(user.id);
  ok(await admin.from('profiles').insert({ id: user.id }));
  const jar = new Map();
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: entries => entries.forEach(({ name, value }) => jar.set(name, value)) },
  });
  ok(await client.auth.signInWithPassword({ email, password }));
  const created = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document }));
  const oldSessions = ok(await client.from('plan_sessions').select('id').eq('plan_version_id', created.versionId).order('position'));
  const oldExercises = ok(await client.from('planned_exercises').select('*').in('plan_session_id', oldSessions.map(row => row.id)).order('position'));
  const oldSets = ok(await client.from('planned_sets').select('*').in('planned_exercise_id', oldExercises.map(row => row.id)).order('id'));
  const workout = ok(await client.rpc('apply_workout_command', { p_operation_id: randomUUID(), p_workout_id: null,
    p_expected_revision: 0, p_action: 'start', p_payload: { planSessionId: oldSessions[0].id, performedOn: '2026-10-13' } }));
  const performed = ok(await client.from('performed_exercises').select('id').eq('workout_session_id', workout.workoutId));
  const snapshots = ok(await client.from('performed_sets').select('*').in('performed_exercise_id', performed.map(row => row.id)).order('id'));
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addCookies([...jar].map(([name, value]) => ({ name, value: encodeURIComponent(value), url: base })));
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const editorUrl = `${base}/plany/edytor?plan=${created.planId}`;
  await page.goto(editorUrl);
  await page.getByRole('heading', { name: 'Przysiad', exact: true }).waitFor();
  assert.equal(await page.locator('.plan-exercise-card').count(), 3);
  assert.equal(await page.locator('.plan-workspace input[type=number]').count(), 0);
  assert.equal(await page.getByLabel('Transkrypcja lub tekst wpisany ręcznie').count(), 0);
  await page.screenshot({ path: '/private/tmp/t04r1-cards-desktop.png' });
  const first = page.locator('.plan-exercise-card').first();
  await first.getByRole('button', { name: 'Edytuj serie', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: 'Edytuj serie', exact: true });
  assert.equal(await dialog.getByLabel('Powtórzenia do', { exact: true }).inputValue(), '10');
  assert.equal(await dialog.getByLabel('Ciężar do (kg)', { exact: true }).count(), 0);
  assert.equal(await dialog.getByLabel('Podstawa ciężaru hantli').count(), 0);
  await dialog.getByLabel('Powtórzenia', { exact: true }).fill('9');
  await page.keyboard.press('Escape');
  assert.match(await first.innerText(), /3 serie × 8–10/);
  assert.equal(await first.getByRole('button', { name: 'Edytuj serie' }).evaluate(element => element === window.document.activeElement), true);
  await first.getByRole('button', { name: 'Edytuj serie', exact: true }).click();
  await dialog.getByLabel('Przerwa (s)', { exact: true }).fill('120');
  await dialog.getByRole('button', { name: 'Zastosuj zmiany', exact: true }).click();
  assert.match(await first.innerText(), /Przerwa 120 s/);
  // Przeniesienie zachowuje pozostały szkic i katalog.
  await first.getByRole('button', { name: 'Edytuj ćwiczenie', exact: true }).click();
  dialog = page.getByRole('dialog');
  assert.equal(await dialog.getByLabel('Wariant', { exact: true }).isDisabled(), true);
  await dialog.getByLabel('Przypisanie do treningu').selectOption({ label: 'Tydzień 2 · B' });
  await dialog.getByRole('button', { name: 'Zastosuj zmiany', exact: true }).click();
  assert.equal(await page.locator('.plan-exercise-card').count(), 2);
  await page.getByLabel('Wybierz trening').selectOption({ label: 'Tydzień 1 · A · 2 ćw.' });
  await page.getByRole('button', { name: 'Podgląd całego planu', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.locator('summary').filter({ hasText: 'Tydzień 2 · B' }).click();
  await dialog.getByRole('button', { name: 'Edytuj: Przysiad', exact: true }).click();
  await page.getByRole('dialog', { name: 'Edytuj ćwiczenie' }).getByRole('button', { name: 'Anuluj', exact: true }).click();
  assert.match(await page.getByLabel('Wybierz trening').inputValue(), /session:/);
  assert.equal(await page.locator('.plan-exercise-card').count(), 2);
  await page.getByRole('button', { name: '+ Dodaj ćwiczenie', exact: true }).click();
  dialog = page.getByRole('dialog'); await dialog.getByLabel('Nazwa ćwiczenia').fill('Nie zostaje');
  await dialog.getByRole('button', { name: 'Anuluj', exact: true }).click();
  assert.equal(await page.getByRole('heading', { name: 'Nie zostaje' }).count(), 0);
  // Tworzenie/rozłączenie grupy jest lokalną edycją szkicu.
  await page.getByRole('button', { name: '+ Utwórz superserię' }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('checkbox', { name: 'Martwy ciąg' }).check();
  await dialog.getByRole('checkbox', { name: 'Przysiad' }).check();
  await dialog.getByRole('button', { name: 'Zastosuj grupę' }).click();
  assert.equal(await page.locator('.review-superset').count(), 1);
  await page.getByRole('button', { name: 'Edytuj superserię' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Rozłącz superserię' }).click();
  assert.equal(await page.locator('.review-superset').count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => window.document.documentElement.scrollWidth <= window.innerWidth + 1), 'mobile bez overflow');
  await page.screenshot({ path: '/private/tmp/t04r1-cards-mobile.png' });
  await page.locator('.plan-exercise-card').last().getByRole('button', { name: 'Edytuj serie' }).click();
  dialog = page.getByRole('dialog');
  assert.equal(Math.round((await dialog.boundingBox()).width), 390);
  await dialog.screenshot({ path: '/private/tmp/t04r1-edit-mobile.png' });
  await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
  assert.ok(await page.evaluate(() => window.document.querySelector('dialog[open]').contains(window.document.activeElement)), 'fokus w dialogu');
  await dialog.getByRole('button', { name: 'Pojedyncza seria' }).click();
  await dialog.getByLabel('Wybierz serię').selectOption('1');
  await dialog.getByLabel('Powtórzenia', { exact: true }).fill('9');
  await dialog.getByRole('button', { name: 'Zastosuj zmiany', exact: true }).click();
  // Odrzucone wyjście zachowuje szkic, bez wysyłania AI.
  page.once('dialog', event => event.dismiss());
  await page.getByRole('link', { name: '← Wróć do planów' }).click();
  assert.equal(page.url(), editorUrl);
  // Utrata odpowiedzi po prawdziwym zapisie: ponowienie nie tworzy drugiej wersji.
  const requests = [];
  await page.route('**/api/plans', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    requests.push(route.request().postDataJSON());
    const response = await route.fetch();
    if (requests.length === 1) { assert.equal(response.status(), 200); await route.abort('failed'); }
    else await route.fulfill({ response });
  });
  await page.getByRole('button', { name: 'Opublikuj nową wersję', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Brak potwierdzenia serwera' }).waitFor();
  await page.getByRole('button', { name: 'Opublikuj nową wersję', exact: true }).click();
  await page.waitForURL(`${base}/plany/${created.planId}`);
  assert.equal(requests.length, 2); assert.deepEqual(requests[0], requests[1]);
  assert.equal(ok(await client.from('plan_versions').select('id').eq('plan_id', created.planId)).length, 2);
  assert.deepEqual(ok(await client.from('planned_sets').select('*').in('planned_exercise_id', oldExercises.map(row => row.id)).order('id')), oldSets);
  assert.deepEqual(ok(await client.from('performed_sets').select('*').in('performed_exercise_id', performed.map(row => row.id)).order('id')), snapshots);
  const changed = requests[0].document.sessions[1].exercises.find(item => item.name === 'Przysiad');
  assert.deepEqual(changed.sets.map(row => row.reviewId), document.sessions[0].exercises[0].sets.map(row => row.reviewId));
  assert.deepEqual(changed.sets.map(row => row.note), document.sessions[0].exercises[0].sets.map(row => row.note));
  assert.ok(changed.sets.every(row => row.restSeconds === 120));
  assert.deepEqual(changed.sets.map(row => row.repsMin), [8, 9, 8]);
  // Nowy plan: fragment da się zastosować mimo pustego innego dnia.
  await page.goto(`${base}/plany/edytor`);
  await page.locator('.plan-exercise-card').getByRole('button', { name: 'Edytuj ćwiczenie' }).click();
  dialog = page.getByRole('dialog'); await dialog.getByLabel('Nazwa ćwiczenia').fill('Nowe ćwiczenie');
  await dialog.getByRole('button', { name: 'Zastosuj zmiany' }).click();
  assert.ok(await page.getByRole('heading', { name: 'Nowe ćwiczenie' }).isVisible());
  await page.getByLabel('Nazwa planu').fill('Nowy plan syntetyczny');
  await page.getByRole('button', { name: 'Utwórz plan', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'nazwy i serii' }).waitFor();
  assert.deepEqual(errors, [], 'brak błędów pageerror');
  await context.close();
  console.log('T04-R1 Chrome: PASS — karty/jeden trening, modal/cancel, katalog/przeniesienie, superserie, desktop/mobile/fokus, prawdziwy zapis i utrata odpowiedzi/retry, stare wersje/snapshoty, nowy nieukończony szkic. Dane syntetyczne, AI wyłączone.');
} finally { await browser.close(); for (const id of users) ok(await admin.auth.admin.deleteUser(id)); }

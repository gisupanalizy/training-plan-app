import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
const base = process.env.T13B_HTTP_BASE ?? 'http://localhost:3005';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
assert.match(process.env.SUPABASE_URL ?? '', /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const { chromium } = await import(pathToFileURL(process.env.T13B_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = result => { if (result.error) throw new Error(result.error.message); return result.data; };
const users = [];
const set = (position, changes = {}) => ({ position, kind: 'work', repsMin: 1, repsMax: 1, isAmrap: false, loadType: 'absolute', targetKg: 60,
  targetKgMax: null, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, durationSecondsMax: null,
  distanceMeters: null, restSeconds: 60, restSecondsMax: 120, tempo: null, targetRpe: null, targetRir: null, note: null, isOptional: false, ...changes });
const exercise = (name, sets, changes = {}) => ({ name, originalName: 'Original squat', exerciseId: null, variant: null, equipment: 'sztanga', supersetGroup: null, note: 'Wskazówka ćwiczenia', sourceRef: 'Syntetyczny arkusz!A1', sets, ...changes });
const eight = Array.from({ length: 8 }, (_, index) => set(index + 1));
const document = { name: 'Plan T13-B', sessions: [
  { weekNumber: 1, dayLabel: 'A', note: 'Kontekst źródła A', exercises: [
    exercise('Przysiad', eight), exercise('Wyciskanie', [set(1), set(2, { targetKg: 70, kind: 'ramp' }), set(3, { isAmrap: true, repsMin: null, repsMax: null, isOptional: true })]),
    exercise('Wiosłowanie', [set(1, { loadType: 'unspecified', targetKg: null })], { supersetGroup: 'S1' }),
    exercise('Plank', [set(1, { repsMin: null, repsMax: null, loadType: 'unspecified', targetKg: null, durationSeconds: 30 })], { supersetGroup: 'S1' }),
  ] },
  { weekNumber: 2, dayLabel: 'A', note: 'Odrębna jednostka', exercises: [exercise('Martwy ciąg', [set(1, { targetKg: 0, restSeconds: 0, restSecondsMax: null })])] },
] };
try {
  const email = `t13b-${randomUUID()}@example.invalid`, password = randomUUID();
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true })); users.push(user.id);
  ok(await admin.from('profiles').insert({ id: user.id }));
  const jar = new Map();
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: entries => entries.forEach(({ name, value }) => jar.set(name, value)),
  } });
  ok(await client.auth.signInWithPassword({ email, password }));
  const created = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document }));
  const sessions = ok(await client.from('plan_sessions').select('id').eq('plan_version_id', created.versionId).order('position'));
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies([...jar].map(([name, value]) => ({ name, value: encodeURIComponent(value), url: base })));
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/plany/${created.planId}`);
  const select = page.getByLabel('Wybierz trening');
  await select.waitFor();
  assert.equal(await select.inputValue(), sessions[0].id);
  assert.equal(await page.locator('.preview-exercise').count(), 4);
  assert.equal(await page.locator('.preview-series[open]').count(), 0);
  const dimensions = [];
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 }); await page.evaluate(() => window.scrollTo(0, 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}`);
    const cards = await page.locator('.preview-exercise').evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom, height: r.height }; }));
    const nav = await page.locator('.mobile-nav').boundingBox();
    if (width === 390) assert.ok(cards[3].bottom <= nav.y, `cztery pełne karty: ${JSON.stringify(cards)}; nav ${nav.y}`);
    for (const locator of [select, page.locator('.preview-series summary').first(), page.locator('.preview-context summary'), page.locator('.preview-start>summary'), page.getByRole('link', { name: 'Edytuj plan' })]) {
      const box = await locator.boundingBox(); assert.ok(box.width >= 44 && box.height >= 44, `cel44 ${width}: ${JSON.stringify(box)}`);
    }
    dimensions.push({ width, cards, navTop: nav.y });
    await page.screenshot({ path: `/private/tmp/t13b-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const firstSummary = page.locator('.preview-series summary').first();
  await firstSummary.focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('.preview-series').first().getAttribute('open'), '');
  assert.equal(await page.locator('.preview-series').first().locator('li').count(), 8);
  assert.match(await page.locator('.preview-series').first().innerText(), /Oryginalna nazwa: Original squat/);
  assert.match(await page.locator('.preview-series').first().innerText(), /Syntetyczny arkusz!A1/);
  await page.keyboard.press('Enter'); assert.equal(await firstSummary.evaluate(el => el === document.activeElement), true);
  await select.selectOption(sessions[1].id); await page.reload();
  await page.getByRole('heading', { name: 'Martwy ciąg', exact: true }).waitFor();
  assert.equal(await select.inputValue(), sessions[1].id);
  assert.match(await page.locator('.preview-prescription').innerText(), /0 kg.*Bez przerwy/);
  await page.getByText('Podgląd całego planu', { exact: true }).click();
  assert.equal(await page.locator('.preview-overview section').count(), 2);
  await page.getByRole('button', { name: 'Wybierz trening 1: A', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.tagName === 'H2');
  assert.equal(await page.locator('.preview-overview').getAttribute('open'), null);
  await page.locator('.preview-series summary').nth(1).click();
  const ramp = await page.locator('.preview-series').nth(1).innerText();
  assert.match(ramp, /Rampa|rampa/); assert.match(ramp, /AMRAP/); assert.match(ramp, /opcjonalna/); assert.match(ramp, /70 kg/);
  assert.match(await page.locator('.preview-prescription').nth(2).innerText(), /Obciążenie niepodane/);
  // Wyboru wersji nie wolno przenosić po samym indeksie.
  const second = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: created.planId, p_expected_version_id: created.versionId, p_document: document }));
  await page.reload();
  const nextIds = ok(await client.from('plan_sessions').select('id').eq('plan_version_id', second.versionId).order('position'));
  assert.equal(await select.inputValue(), nextIds[0].id);
  await page.locator('.preview-versions>summary').click();
  await page.getByRole('link', { name: 'Wersja 1', exact: true }).click();
  await page.waitForURL(`**/plany/${created.planId}?version=${created.versionId}`);
  await page.waitForFunction(id => document.querySelector('.preview-selector select')?.value === id, sessions[0].id);
  assert.equal(await select.inputValue(), sessions[0].id);
  assert.equal(await page.locator('.preview-start').count(), 0);
  assert.match(await page.locator('.preview-session-heading').innerText(), /archiwalna/);
  await page.evaluate(({ planId, versionId }) => localStorage.setItem(`forma:plan-session:${planId}:${versionId}`, 'removed'), created);
  await page.reload(); assert.equal(await select.inputValue(), sessions[0].id);
  await page.goto(`${base}/plany/${created.planId}`);
  await page.locator('.preview-start>summary').click();
  await page.setViewportSize({ width: 390, height: 500 });
  const dateInput = page.getByLabel('Data treningu'); await dateInput.focus(); await dateInput.scrollIntoViewIfNeeded();
  const dateBox = await dateInput.boundingBox(); assert.ok(dateBox.height >= 44 && dateBox.width >= 44);
  await page.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click();
  await page.waitForURL('**/trening/*');
  const startedId = new URL(page.url()).pathname.split('/').at(-1);
  const started = ok(await client.from('workout_sessions').select('plan_version_id,plan_session_id').eq('id', startedId).single());
  assert.equal(started.plan_version_id, second.versionId); assert.equal(started.plan_session_id, nextIds[0].id);
  await page.goto(`${base}/plany/${created.planId}`);
  assert.equal(await page.getByRole('link', { name: 'Wznów trening', exact: true }).getAttribute('href'), `/trening/${startedId}`);
  await page.setViewportSize({ width: 390, height: 844 });
  // Rzeczywisty UI importu, wyłącznie syntetyczny wynik adaptera; AI pozostaje wyłączone.
  const sourceText = 'Syntetyczny plan: A Przysiad 8x1; druga jednostka A Martwy ciąg 8x1.';
  const response = await context.request.post(`${base}/api/imports`, { data: { kind: 'text', mime: 'text/plain', size: Buffer.byteLength(sourceText), text: sourceText } });
  assert.equal(response.status(), 201);
  const job = (await response.json()).job;
  const raw = { schema_version: 1, name: 'Import syntetyczny T13-B', warnings: [], unresolved_fields: [], sessions: [1, 2].map((week, index) => ({
    week_number: week, day_label: 'A', note: 'Zachowany kontekst', exercises: [{ name: index ? 'Martwy ciąg' : 'Przysiad', variant: null, equipment: 'sztanga', superset_group: null,
      note: 'Wskazówka', source_ref: 'tekst syntetyczny', sets: eight.map(() => ({ kind: 'work', reps_min: 1, reps_max: 1, is_amrap: false, load_type: 'absolute', target_kg: 60, target_percent: null,
        rest_seconds: 60, note: 'Uwagi źródła', source_ref: 'tekst syntetyczny' })) }] })) };
  ok(await admin.from('imports').update({ status: 'needs_review', draft: raw }).eq('id', job.id));
  await page.goto(`${base}/plany/import?id=${job.id}`);
  await page.getByRole('button', { name: 'Potwierdź ćwiczenia', exact: true }).click();
  await page.getByRole('heading', { name: 'Serie i superserie', exact: true }).waitFor();
  await page.reload(); await page.getByRole('heading', { name: 'Serie i superserie', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Potwierdź serie i superserie', exact: true }).click();
  await page.getByRole('heading', { name: 'Podsumowanie', exact: true }).waitFor();
  assert.equal(await page.locator('.review-summary-day').count(), 2);
  await page.getByRole('button', { name: 'Zatwierdź i utwórz plan', exact: true }).click();
  await page.waitForURL(url => /^\/plany\/[0-9a-f-]+$/.test(url.pathname));
  await page.getByLabel('Wybierz trening').waitFor();
  assert.equal(await page.getByLabel('Wybierz trening').locator('option').count(), 2);
  const committed = ok(await client.from('imports').select('committed_plan_id').eq('id', job.id).single());
  const importedPlan = ok(await client.from('plans').select('current_version_id').eq('id', committed.committed_plan_id).single());
  const importedSessions = ok(await client.from('plan_sessions').select('id,day_label,week_number').eq('plan_version_id', importedPlan.current_version_id).order('position'));
  assert.deepEqual(importedSessions.map(row => [row.day_label, row.week_number]), [['A', 1], ['A', 2]]);
  const importedExercises = ok(await client.from('planned_exercises').select('id').in('plan_session_id', importedSessions.map(row => row.id)));
  const importedSets = ok(await client.from('planned_sets').select('id,note').in('planned_exercise_id', importedExercises.map(row => row.id)));
  assert.equal(importedSets.length, 16); assert.ok(importedSets.every(row => row.note === 'Uwagi źródła'));
  assert.deepEqual(errors, []);
  console.log('T13-B PASS: prawdziwe Auth/DB/UI, wybór/reload/fallback/wersje, osiem serii, rampa/AMRAP/opcjonalna/null/zero, kontekst, fokus/Enter i cele44.');
  console.log(JSON.stringify(dimensions));
  await context.close();
} finally {
  await browser.close();
  for (const id of users) ok(await admin.auth.admin.deleteUser(id));
  console.log(`Sprzątnięto syntetyczne konta: ${users.length}.`);
}

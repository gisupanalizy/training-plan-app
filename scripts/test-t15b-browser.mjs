import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
const base = process.env.T15B_HTTP_BASE ?? 'http://localhost:3005';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
assert.match(process.env.SUPABASE_URL ?? '', /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const { chromium } = await import(pathToFileURL(process.env.T15B_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = result => { if (result.error) throw new Error(result.error.message); return result.data; };
const users = []; const measures = [];
const target = (position, changes = {}) => ({ position, kind: 'work', repsMin: 6, repsMax: 6, isAmrap: false, isOptional: false, loadType: 'absolute', targetKg: 60, targetKgMax: null, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, durationSecondsMax: null, distanceMeters: null, restSeconds: 60, restSecondsMax: null, tempo: null, targetRpe: null, targetRir: null, note: null, ...changes });
const exercise = (name, sets, supersetGroup = null) => ({ name, originalName: name, exerciseId: null, variant: null, equipment: null, supersetGroup, note: 'Syntetyczna wskazówka', sourceRef: 'Syntetyczny arkusz!A1', sets });
const document = { name: 'Plan wizualny B', sessions: [{ weekNumber: 1, dayLabel: 'Trening A', note: 'Kontekst A', exercises: [exercise('Przysiad ze sztangą', Array.from({ length: 8 }, (_, i) => target(i + 1))), exercise('Wyciskanie leżąc', [target(1), target(2, { targetKg: 70, kind: 'ramp' }), target(3, { isOptional: true, isAmrap: true, repsMin: null, repsMax: null })]), exercise('Wiosłowanie hantlą', [target(1, { targetKg: 0, restSeconds: 0 })], 'S1'), exercise('Plank', [target(1, { repsMin: null, repsMax: null, loadType: 'unspecified', targetKg: null, durationSeconds: 30 })], 'S1')] }, { weekNumber: 2, dayLabel: 'Trening B', note: null, exercises: [exercise('Martwy ciąg', [target(1)])] }] };
let page;
try {
  const { user } = ok(await admin.auth.admin.createUser({ email: `t15b-${randomUUID()}@example.invalid`, password: randomUUID(), email_confirm: true })); users.push(user.id);
  ok(await admin.from('profiles').insert({ id: user.id }));
  const jar = new Map();
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: entries => entries.forEach(({ name, value }) => jar.set(name, value)) } });
  const link = ok(await admin.auth.admin.generateLink({ type: 'magiclink', email: user.email }));
  ok(await client.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: 'magiclink' }));
  const created = [];
  for (const name of ['Plan pierwszy B', 'Plan drugi B', 'Plan trzeci B']) created.push(ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: { ...document, name } })));
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await context.addCookies([...jar].map(([name, value]) => ({ name, value: encodeURIComponent(value), url: base })));
  page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/plany', `/plany/${created[0].planId}`]) {
      await page.goto(`${base}${route}`); await page.waitForLoadState('networkidle');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width} ${route}`);
      if (route.includes(created[0].planId)) {
        const cards = await page.locator('.preview-exercise').evaluateAll(items => items.map(item => ({ top: item.getBoundingClientRect().top, bottom: item.getBoundingClientRect().bottom })));
        const nav = await page.locator('.mobile-nav').boundingBox();
        if (width === 390) {
          assert.ok(cards.length >= 4, 'cztery karty');
          const reachable = await page.evaluate(() => {
            const bar = document.querySelector('.mobile-nav').getBoundingClientRect().top;
            const bottom = document.querySelectorAll('.preview-exercise')[3].getBoundingClientRect().bottom;
            return bottom - (document.documentElement.scrollHeight - innerHeight) < bar + 1;
          });
          assert.ok(reachable, `czwarta karta niedostępna przewinięciem ${JSON.stringify({ cards, nav })}`);
        }
        measures.push({ width, cards, navTop: nav.y });
      }
      await page.screenshot({ path: `/private/tmp/t15b-${width}-${route === '/' ? 'start' : route === '/plany' ? 'plans' : 'preview'}.png` });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Szczegóły: Przysiad ze sztangą' }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Przysiad ze sztangą', exact: true }).waitFor();
  assert.equal(await page.locator('.preview-series tr[data-plan-set]').count(), 8);
  assert.match(await page.locator('.exercise-detail').innerText(), /Syntetyczny arkusz!A1/);
  await page.screenshot({ path: '/private/tmp/t15b-plan-detail.png' });
  await page.getByRole('button', { name: 'Wróć do ćwiczeń', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Szczegóły: Przysiad ze sztangą');
  await page.goto(`${base}/plany`);
  const region = page.getByRole('region', { name: 'Twoje plany' }); await region.focus(); await page.keyboard.press('End');
  await page.waitForURL(`**/plany?plan=${created[0].planId}`); await page.getByRole('link', { name: /Trening A/ }).waitFor();
  await page.reload(); await page.waitForLoadState('networkidle');
  assert.ok(await region.evaluate(el => el.scrollLeft > el.clientWidth), 'reload drugiego/ostatniego planu wyrównuje slajd');
  const sessions = ok(await client.from('plan_sessions').select('id').eq('plan_version_id', created[0].versionId).order('position'));
  await page.getByRole('link', { name: /Trening B/ }).click(); await page.getByLabel('Wybierz trening').waitFor();
  assert.equal(await page.getByLabel('Wybierz trening').inputValue(), sessions[1].id);
  await page.goto(`${base}/plany`); await page.waitForLoadState('networkidle');
  const cdp = await context.newCDPSession(page);
  const swipe = async (from, to, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from, y }] }); for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from + (to - from) * i / 10, y }] }); await new Promise(resolve => setTimeout(resolve, 18)); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const box = await region.boundingBox(); await swipe(box.x + box.width - 35, box.x + 25, box.y + 40);
  await page.waitForURL(`**/plany?plan=${created[1].planId}`);
  assert.equal(new URL(page.url()).pathname, '/plany');
  await page.getByRole('link', { name: /Trening A/ }).waitFor();
  await page.goto(`${base}/plany`); await page.waitForLoadState('networkidle');
  const dragBox = await region.boundingBox();
  await page.mouse.move(dragBox.x + dragBox.width - 35, dragBox.y + 40); await page.mouse.down(); await page.mouse.move(dragBox.x + 25, dragBox.y + 40, { steps: 15 }); await page.mouse.up();
  await page.waitForURL(`**/plany?plan=${created[1].planId}`);
  const visibleOpen = region.locator('section').nth(1).getByRole('link', { name: 'Otwórz plan' });
  await visibleOpen.focus(); await page.keyboard.press('Enter'); await page.waitForURL(`**/plany/${created[1].planId}`);
  await page.goto(`${base}/plany/${created[0].planId}?session=${sessions[0].id}`);
  await page.locator('.preview-start>summary').click(); await page.getByRole('button', { name: 'Rozpocznij trening', exact: true }).click(); await page.waitForURL('**/trening/*');
  const id = new URL(page.url()).pathname.split('/').at(-1);
  await page.goto(`${base}/trening/${id}?historyMonth=2024-02&historyDay=2024-02-29`);
  assert.equal(await page.locator('.workout-history-back').getAttribute('href'), '/historia?month=2024-02&day=2024-02-29');
  await page.locator('.workout-card-open').first().click();
  assert.match(page.url(), /historyMonth=2024-02&historyDay=2024-02-29&set=/);
  await page.getByRole('button', { name: 'Uzupełnij jednoznaczne cele z planu', exact: true }).click();
  assert.equal(await page.getByLabel('Powtórzenia', { exact: true }).inputValue(), '6');
  assert.equal(await page.getByLabel('Ciężar (kg)', { exact: true }).inputValue(), '60');
  await page.locator('.workout-history-back').click(); await page.getByRole('dialog', { name: 'Niezapisane zmiany' }).waitFor(); await page.getByRole('button', { name: 'Zostań', exact: true }).click();
  const saveBox = await page.getByRole('button', { name: 'Zapisz i przejdź dalej', exact: true }).boundingBox();
  const resultNav = await page.locator('.mobile-nav').boundingBox();
  assert.ok(saveBox.y + saveBox.height <= resultNav.y, 'główny zapis C widoczny przed dolną nawigacją');
  await page.screenshot({ path: '/private/tmp/t15b-result.png' });
  await page.getByRole('button', { name: '← Wróć do ćwiczeń', exact: true }).click(); await page.getByRole('button', { name: 'Odrzuć zmiany', exact: true }).click();
  await page.goto(`${base}/trening/${id}?historyMonth=2026-02&historyDay=2026-02-29`);
  assert.equal(await page.locator('.workout-history-back').getAttribute('href'), '/historia');
  assert.deepEqual(errors, []); console.log('T15-B nowe powierzchnie PASS', JSON.stringify(measures));
} catch (error) { if (page) await page.screenshot({ path: '/private/tmp/t15b-failure.png' }).catch(() => {}); throw error; }
finally { await browser.close(); for (const id of users) ok(await admin.auth.admin.deleteUser(id)); }
// Pełna istniejąca regresja pozostaje niezmieniona: realne komendy, retry/ACK→GET/409,
// szkice, superserie, historyczna poprawka, daty i snapshoty; głos wyłącznie mock transportu.
process.env.T13C_HTTP_BASE = base;
process.env.T13C_PLAYWRIGHT_MODULE = process.env.T15B_PLAYWRIGHT_MODULE;
await import('./test-t13c-browser.mjs');

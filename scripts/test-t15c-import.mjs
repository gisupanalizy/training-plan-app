import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import ExcelJS from 'exceljs';
const base = process.env.T15C_HTTP_BASE ?? 'http://localhost:3005';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
assert.match(process.env.SUPABASE_URL ?? '', /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const { chromium } = await import(pathToFileURL(process.env.T15C_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = value => { if (value.error) throw new Error(value.error.message); return value.data; };
const users = [], paths = []; let page;
const rawSet = (changes = {}) => ({ kind: 'work', reps_min: 6, reps_max: 6, is_amrap: false, load_type: 'absolute', target_kg: 60, target_percent: null, rest_seconds: 90, note: 'Indywidualna uwaga', source_ref: 'syntetyczne', ...changes });
const rawExercise = (name, sets, changes = {}) => ({ name, variant: null, equipment: null, superset_group: null, note: 'Syntetyczna wskazówka', source_ref: 'strona 1', sets, ...changes });
const raw = () => ({ schema_version: 1, name: 'Syntetyczna korekta C', warnings: [], unresolved_fields: [], sessions: [{ week_number: 1, day_label: 'A', note: 'Syntetyczny kontekst', exercises: [rawExercise('Przysiad ze sztangą', [rawSet({ reps_min: null, reps_max: null })]), rawExercise('Wyciskanie leżąc', [rawSet(), rawSet({ kind: 'ramp', target_kg: 65 }), rawSet({ is_amrap: true, reps_min: null, reps_max: null })], { set_count_min: 2, set_count_max: 3 }), rawExercise('Wiosłowanie hantlą', [rawSet({ target_kg: 0, rest_seconds: 0 })], { superset_group: 'S1' }), rawExercise('Plank', [rawSet({ reps_min: null, reps_max: null, load_type: 'unspecified', target_kg: null, duration_seconds: 30 })], { superset_group: 'S1' })] }, { week_number: 2, day_label: 'A', note: 'Odrębna jednostka', exercises: [rawExercise('Martwy ciąg', [rawSet()])] }] });
try {
  const { user } = ok(await admin.auth.admin.createUser({ email: `t15c-import-${randomUUID()}@example.invalid`, password: randomUUID(), email_confirm: true })); users.push(user.id); ok(await admin.from('profiles').insert({ id: user.id }));
  const jar = new Map(); const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: entries => entries.forEach(({ name, value }) => jar.set(name, value)) } });
  const link = ok(await admin.auth.admin.generateLink({ type: 'magiclink', email: user.email })); ok(await client.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: 'magiclink' }));
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } }); await context.addCookies([...jar].map(([name, value]) => ({ name, value: encodeURIComponent(value), url: base })));
  page = await context.newPage(); const errors = []; page.on('pageerror', error => errors.push(error.message));
  const button = name => page.getByRole('button', { name, exact: true });
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 }); await page.goto(`${base}/plany/import`); await page.getByRole('group').count();
    const tiles = page.locator('[aria-label="Wybierz źródło"] > *'); await tiles.first().waitFor(); assert.equal(await tiles.count(), 4);
    for (const tile of await tiles.all()) { const delta = await tile.evaluate(el => { const a = el.getBoundingClientRect(), b = el.querySelector('svg').getBoundingClientRect(); return Math.abs(a.x + a.width / 2 - b.x - b.width / 2); }); assert.ok(delta < 1, 'ikony źródeł wyśrodkowane'); }
    assert.ok(await page.getByRole('link', { name: 'Utwórz ręcznie' }).locator('svg').count());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); await page.screenshot({ path: `/private/tmp/t15c-import-${width}.png` });
  }
  await page.getByRole('link', { name: /Dyktuj plan/ }).click(); await page.getByRole('dialog', { name: 'Dyktuj fragment planu' }).waitFor(); await page.keyboard.press('Escape');
  const pdf = await PDFDocument.create(), font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 2; i++) { const p = pdf.addPage([400, 550]); p.drawText(`Synthetic training A - page ${i}`, { x: 30, y: 500, font, size: 16 }); p.drawText('Squat: 3 x 6, 60 kg, rest 90 s', { x: 30, y: 450, font, size: 12 }); }
  const workbook = new ExcelJS.Workbook(); for (const name of ['Trening A', 'Trening B']) { const sheet = workbook.addWorksheet(name); sheet.addRow(['Ćwiczenie', 'Serie', 'Cel']); sheet.addRow(['Syntetyczne ćwiczenie', 3, '6 powt.']); sheet.getCell('A2').font = { strike: true }; }
  const sources = [{ kind: 'pdf', mime: 'application/pdf', bytes: await pdf.save() }, { kind: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', bytes: await workbook.xlsx.writeBuffer() }];
  for (const source of sources) {
    const id = randomUUID(); const job = ok(await admin.rpc('create_import_job', { p_owner: user.id, p_id: id, p_kind: source.kind, p_mime: source.mime, p_size: source.bytes.length, p_text: null })); paths.push(job.source_path);
    ok(await admin.storage.from('training-imports').upload(job.source_path, source.bytes, { contentType: source.mime }));
    // Jedynie wynik adaptera jest syntetycznym fixture'em; Auth, źródło, korekta i publikacja są rzeczywiste.
    ok(await admin.from('imports').update({ status: 'needs_review', draft: raw() }).eq('id', id));
    await page.goto(`${base}/plany/import?id=${id}`); await page.getByRole('heading', { name: 'Nazwy ćwiczeń i kolejność', exact: true }).waitFor();
    assert.equal(await page.locator('.review-main input[type=number]').count(), 0);
    await button('Pokaż źródło').click(); await page.getByRole('dialog', { name: 'Oryginalne źródło' }).waitFor();
    if (source.kind === 'pdf') { const pages = page.getByLabel('Strona PDF'); await pages.locator('option').nth(1).waitFor({ state: 'attached' }); await pages.selectOption('2'); await page.getByLabel('Oryginalny PDF — strona 2').waitFor(); await page.waitForFunction(() => document.querySelector('.pdf-page-scroll canvas')?.width > 0); await page.getByLabel('Powiększ PDF').click(); }
    else { const sheets = page.getByLabel('Arkusz źródłowy'); await sheets.waitFor(); await sheets.selectOption('Trening B'); assert.match(await page.locator('[data-address="A2"]').getAttribute('class'), /source-strike/); await sheets.selectOption('Trening A'); }
    await page.keyboard.press('Escape');
    await button('Potwierdź ćwiczenia').click(); await page.getByRole('heading', { name: 'Serie i superserie', exact: true }).waitFor(); await page.reload(); await page.getByRole('heading', { name: 'Serie i superserie', exact: true }).waitFor();
    assert.ok(await button('Potwierdź serie i superserie').isDisabled(), 'brak celu blokuje potwierdzenie');
    await page.locator('.review-steps button').nth(2).click(); await page.getByRole('heading', { name: 'Podsumowanie', exact: true }).waitFor(); assert.ok(await button('Zatwierdź i utwórz plan').isDisabled());
    await page.locator('.review-steps button').nth(1).click(); const first = page.locator('.review-exercise-card').first(); await first.getByRole('button', { name: 'Edytuj blok', exact: true }).click();
    let dialog = page.getByRole('dialog', { name: 'Edytuj blok serii' }); await dialog.getByLabel('Cel serii').selectOption('reps'); await dialog.getByLabel('Powtórzenia od', { exact: true }).fill('6'); await dialog.getByLabel('Powtórzenia do', { exact: true }).fill('6'); await dialog.getByRole('button', { name: 'Zastosuj zmiany', exact: true }).click();
    await button('Zapisz korektę').click(); await page.waitForFunction(() => document.querySelector('.review-save-status')?.textContent === 'Korekta zapisana');
    for (const width of [360, 390, 430]) { await page.setViewportSize({ width, height: 844 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); await page.locator('.import-review').evaluate(el=>scrollTo(0,el.getBoundingClientRect().top+scrollY)); await page.screenshot({ path: `/private/tmp/t15c-review-${source.kind}-${width}.png` }); }
    const before = ok(await admin.from('imports').select('review_data').eq('id', id).single()).review_data;
    await first.getByRole('button', { name: 'Edytuj ćwiczenie', exact: true }).click(); dialog = page.getByRole('dialog'); await dialog.getByLabel('Nazwa ćwiczenia', { exact: true }).fill('Niezastosowana nazwa'); await page.keyboard.press('Escape'); assert.equal(await first.getByRole('heading').innerText(), 'Przysiad ze sztangą');
    await button('Potwierdź serie i superserie').click(); await page.getByRole('heading', { name: 'Podsumowanie', exact: true }).waitFor(); await page.reload(); await page.getByRole('heading', { name: 'Podsumowanie', exact: true }).waitFor(); assert.equal(await page.locator('.review-summary-day').count(), 2);
    const requests = []; await page.route(`**/api/imports/${id}/approve`, async route => { requests.push(route.request().postData()); if (requests.length === 1) { const response = await route.fetch(); assert.equal(response.status(), 200); await route.abort('failed'); } else await route.continue(); });
    await button('Zatwierdź i utwórz plan').click(); await page.getByRole('alert').waitFor(); await button('Zatwierdź i utwórz plan').click(); await page.waitForURL(url => /^\/plany\/[0-9a-f-]+$/.test(url.pathname)); assert.equal(requests[0], requests[1]); await page.unroute(`**/api/imports/${id}/approve`);
    const stored = ok(await admin.from('imports').select('committed_plan_id,review_data').eq('id', id).single()); assert.deepEqual(stored.review_data.document, before.document);
    assert.equal(ok(await client.from('plan_versions').select('id').eq('plan_id', stored.committed_plan_id)).length, 1);
  }
  assert.deepEqual(errors, []); console.log('T15-C import PASS: centered icons/manual/voice, PDF2/XLSX2, trzy różne kroki/reload, blokada braków, cancel, realne idempotentne approve i własne syntetyczne źródła.');
} catch (error) { if (page) await page.screenshot({ path: '/private/tmp/t15c-import-failure.png' }).catch(() => {}); throw error; }
finally { if (paths.length) ok(await admin.storage.from('training-imports').remove(paths)); await browser.close(); for (const id of users) ok(await admin.auth.admin.deleteUser(id)); }

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
  assert.equal(await page.locator('input[name="email"]').getAttribute('autocomplete'), 'username');
  assert.equal(await page.locator('input[name="password"]').getAttribute('autocomplete'), 'current-password');
  assert.equal(await page.locator('input[type="password"]').count(), 1);
  for (const width of [360, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(await page.locator('html').getAttribute('data-theme'), null);
    assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).colorScheme), 'dark');
    assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(17, 25, 28)');
    report.push({ screen: 'logowanie', width, tempo: true });
  }
  await page.screenshot({ path: '/private/tmp/t15f-login-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/private/tmp/t15f-login-390.png' });
  const email = `t15f-${randomUUID()}@example.invalid`, password = randomUUID();
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true })); userId = user.id;
  ok(await admin.from('profiles').insert({ id: userId }));
  const jar = new Map();
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: entries => entries.forEach(({ name, value }) => jar.set(name, value)) } });
  ok(await client.auth.signInWithPassword({ email, password }));
  const target = { position: 1, kind: 'work', repsMin: 6, repsMax: 6, isAmrap: false, isOptional: false, loadType: 'absolute', targetKg: 60, targetKgMax: null, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, durationSecondsMax: null, distanceMeters: null, restSeconds: 60, restSecondsMax: null, tempo: null, targetRpe: null, targetRir: null, note: null };
  const document = { name: 'Plan fundamentu', sessions: [{ weekNumber: 1, dayLabel: 'A', note: null, exercises: ['Przysiad przedni', 'Wyciskanie sztangi leżąc', 'Podciąganie nachwytem', 'Deska'].map(name => ({ name, exerciseId: null, originalName: name, variant: null, equipment: null, supersetGroup: null, note: null, sets: [target] })) }] };
  ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document }));
  await page.goto(`${base}/logowanie?powod=sesja`);
  await page.getByRole('status').filter({ hasText: 'Sesja wygasła' }).waitFor();
  await page.getByLabel('Adres e-mail').fill(email);
  await page.getByLabel('Hasło', { exact: true }).fill('incorrect-password');
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await page.getByRole('region', { name: 'Logowanie', exact: true }).getByRole('alert').waitFor();
  assert.equal(await page.getByRole('region', { name: 'Logowanie', exact: true }).getByRole('alert').evaluate(el => el === document.activeElement), true);
  assert.match(await page.getByRole('region', { name: 'Logowanie', exact: true }).innerText(), /niezależnie od istnienia konta/);
  assert.equal(await page.locator('input[type="password"]').count(), 1);
  await page.getByLabel('Adres e-mail').fill(email);
  await page.getByLabel('Hasło', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await page.waitForURL(base + '/');
  await page.goto(`${base}/profil`);
  await page.getByRole('button', { name: 'Co to jest?', exact: true }).click();
  await page.getByText('nigdy go nie zastępuje').waitFor();
  const colors = await page.evaluate(() => {
    const background = (name) => getComputedStyle([...document.querySelectorAll('button')].find((button) => button.textContent.trim() === name)).backgroundColor;
    return { save: background('Zapisz zmierzone 1RM'), logout: background('Wyloguj się') };
  });
  assert.equal(colors.save, 'rgb(239, 196, 95)');
  assert.equal(colors.logout, 'rgb(64, 40, 37)');
  assert.notEqual(colors.save, colors.logout);
  await page.getByLabel('Ciężar (kg)').fill('100');
  await page.getByLabel('Obowiązuje od').fill('2026-10-18');
  await page.getByRole('button', { name: 'Zapisz zmierzone 1RM', exact: true }).click();
  await page.getByRole('region', { name: 'Historia 1RM' }).getByText('100 kg', { exact: true }).waitFor();
  await page.getByLabel('Krok obciążenia').fill('1.25');
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'Zapisz krok', exact: true }).click(),
  ]);
  await page.getByLabel('Krok obciążenia').waitFor();
  await page.waitForFunction(() => document.querySelector('input[value="1.25"]'));
  for (const width of [360, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    report.push({ screen: 'profil', width, manualMaximum: true });
  }
  await page.screenshot({ path: '/private/tmp/t15f-profile-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/private/tmp/t15f-profile.png', fullPage: true });
  await page.goto(`${base}/ustaw-haslo`);
  assert.equal(await page.locator('input[type="password"]').count(), 1);
  assert.equal(await page.locator('input[autocomplete="new-password"]').count(), 1);
  assert.equal(await page.getByLabel('Nowe hasło').getAttribute('minlength'), '12');
  assert.match(await page.locator('main').innerText(), /co najmniej 12 znaków/i);
  await page.getByLabel('Nowe hasło').fill('krotkie');
  await page.getByRole('button', { name: 'Zapisz hasło', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: '12 znaków' }).waitFor();
  assert.equal(await page.getByLabel('Nowe hasło').inputValue(), 'krotkie');
  assert.equal(await page.locator('input[type="password"]').count(), 1);
  assert.match(page.url(), /\/ustaw-haslo$/);
  for (const width of [360, 390, 430, 1280]) {
    await page.setViewportSize({ width, height: width === 1280 ? 900 : 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    report.push({ screen: 'ustaw-haslo', width, singlePasswordField: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/private/tmp/t15f-password-390.png' });
  const newPassword = randomUUID();
  await page.getByLabel('Nowe hasło').fill(newPassword);
  await page.getByRole('button', { name: 'Zapisz hasło', exact: true }).click();
  await page.waitForURL(`${base}/profil`);
  await page.getByRole('button', { name: 'Wyloguj się', exact: true }).click();
  await page.waitForURL(/logowanie/);
  await page.getByRole('status').filter({ hasText: 'Wylogowano' }).waitFor();
  await page.getByLabel('Adres e-mail').fill(email);
  await page.getByLabel('Hasło', { exact: true }).fill(newPassword);
  await page.getByRole('button', { name: 'Zaloguj się', exact: true }).click();
  await page.waitForURL(base + '/');
  assert.deepEqual(errors, []);
  await writeFile('/private/tmp/t15f-browser-report.json', JSON.stringify({ report, passwordChanged: true, errors }, null, 2));
  console.log('T15-F PASS: login/error/focus, jedno pole hasła, autofill, datowany 1RM, krok, logout/relogin, 360/390/430 i desktop.');
} finally {
  if (userId) ok(await admin.auth.admin.deleteUser(userId));
  await browser.close();
}

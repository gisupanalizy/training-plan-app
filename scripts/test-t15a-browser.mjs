import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
const base = process.env.T15A_HTTP_BASE ?? 'http://localhost:3005';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
assert.match(process.env.SUPABASE_URL ?? '', /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const { chromium } = await import(pathToFileURL(process.env.T15A_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = value => { if (value.error) throw new Error(value.error.message); return value.data; };
function contrast(a, b) {
  const lin = c => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = hex => { const n = parseInt(hex.slice(1), 16); return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
let userId; const report = []; const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/logowanie`);
  for (const width of [360,390,430]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal(await page.locator('html').getAttribute('data-theme'), null);
    assert.equal(await page.locator('meta[name=theme-color]').getAttribute('content'), '#11191c');
    assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).colorScheme), 'dark');
    assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(17, 25, 28)');
    const tokens = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const read = name => {
        let value = styles.getPropertyValue(name).trim();
        const seen = new Set();
        while (value.startsWith('var(') && !seen.has(value)) { seen.add(value); value = styles.getPropertyValue(value.slice(4, -1).split(',')[0].trim()).trim(); }
        return value;
      };
      return { bg: read('--tempo-bg'), paper: read('--paper'), text: read('--tempo-text'), muted: read('--tempo-muted'), surface: read('--tempo-surface'), raised: read('--tempo-surface-raised'), accent: read('--tempo-accent'), onAccent: read('--tempo-on-accent'), success: read('--tempo-success'), danger: read('--tempo-danger'), dangerSurface: read('--tempo-danger-surface'), warning: read('--tempo-warning'), warningSurface: read('--tempo-warning-surface') };
    });
    assert.equal(tokens.bg, '#11191c');
    assert.equal(tokens.paper, '#11191c');
    assert.ok(contrast(tokens.text, tokens.bg) >= 4.5);
    assert.ok(contrast(tokens.muted, tokens.bg) >= 4.5);
    assert.ok(contrast(tokens.muted, tokens.surface) >= 4.5);
    assert.ok(contrast(tokens.muted, tokens.raised) >= 4.5);
    assert.ok(contrast(tokens.onAccent, tokens.accent) >= 4.5);
    assert.ok(contrast(tokens.success, tokens.bg) >= 4.5);
    assert.ok(contrast(tokens.danger, tokens.bg) >= 4.5);
    assert.ok(contrast(tokens.danger, tokens.dangerSurface) >= 4.5);
    assert.ok(contrast(tokens.warning, tokens.warningSurface) >= 4.5);
    assert.ok(contrast(tokens.accent, tokens.bg) >= 3);
    assert.ok(contrast(tokens.muted, tokens.surface) >= 3);
    const themed = await page.evaluate(() => [...document.styleSheets].some(sheet => { try { return [...sheet.cssRules].some(rule => 'selectorText' in rule && String(rule.selectorText).includes('data-theme')); } catch { return false; } }));
    assert.equal(themed, false);
    report.push({ screen: 'logowanie', width, tempo: true });
  }
  const email = `t15a-${randomUUID()}@example.invalid`, password = randomUUID();
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true })); userId = user.id;
  ok(await admin.from('profiles').insert({ id: userId }));
  const jar = new Map();
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { cookies: { getAll: () => [...jar].map(([name,value]) => ({ name,value })), setAll: entries => entries.forEach(({name,value}) => jar.set(name,value)) } });
  ok(await client.auth.signInWithPassword({ email,password }));
  const target = { position: 1, kind: 'work', repsMin: 6, repsMax: 6, isAmrap: false, isOptional: false, loadType: 'absolute', targetKg: 60, targetKgMax: null, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, durationSecondsMax: null, distanceMeters: null, restSeconds: 60, restSecondsMax: null, tempo: null, targetRpe: null, targetRir: null, note: null };
  const document = { name: 'Plan fundamentu', sessions: [{ weekNumber: 1, dayLabel: 'A', note: null, exercises: ['Przysiad przedni','Wyciskanie sztangi leżąc','Podciąganie nachwytem','Deska'].map(name => ({ name, exerciseId: null, originalName: name, variant: null, equipment: null, supersetGroup: null, note: null, sets: [target] })) }] };
  const plan = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document }));
  await context.addCookies([...jar].map(([name,value]) => ({ name,value: encodeURIComponent(value),url:base })));
  for (const route of ['/', '/plany', `/plany/${plan.planId}`, '/profil', '/plany/edytor', '/plany/import']) {
    await page.goto(`${base}${route}`); await page.locator('.mobile-nav').waitFor();
    for (const width of [360,390,430]) {
      await page.setViewportSize({ width,height:844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${route} ${width}`);
      assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(17, 25, 28)');
      await page.evaluate(() => document.fonts.ready);
      assert.match(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily), /inter/i);
      const boxes = await page.locator('.mobile-nav a').evaluateAll(els => els.map(el => { const r=el.getBoundingClientRect(); const s=getComputedStyle(el); return { width:r.width,height:r.height,active:el.getAttribute('aria-current')==='page',background:s.backgroundColor }; }));
      assert.equal(boxes.length, 5);
      assert.ok(boxes.every(b => b.width>=44 && b.height>=44));
      const active = boxes.find(b => b.active), idle = boxes.find(b => !b.active);
      assert.equal(active.background, 'rgb(37, 50, 53)');
      assert.equal(idle.background, 'rgba(0, 0, 0, 0)');
      await page.evaluate(() => window.scrollTo(0,document.body.scrollHeight));
      const credit = await page.locator('.asset-credit').boundingBox(), nav = await page.locator('.mobile-nav').boundingBox();
      assert.ok(credit.y+credit.height <= nav.y, `stopka pod nawigacją ${route}`);
      report.push({ route,width,overflow:false,navigationTargets:boxes.length });
    }
    await page.setViewportSize({ width:390,height:844 }); await page.evaluate(() => window.scrollTo(0,0));
    if (route===`/plany/${plan.planId}`) await page.screenshot({path:'/private/tmp/t15a-plan-390.png'});
    if (route==='/profil') await page.screenshot({path:'/private/tmp/t15a-profile-390.png'});
  }
  for (const [label,route] of [['Trening','/'],['Plany','/plany'],['Historia','/historia'],['Postęp','/postep'],['Profil','/profil']]) {
    await page.locator('.mobile-nav').getByRole('link',{name:label,exact:true}).click();
    await page.waitForURL(`${base}${route}`);
    assert.equal(await page.locator('.mobile-nav a[aria-current=page]').innerText(), label);
  }
  await page.goto(`${base}/plany`); await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
  const focus = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return { width: s.outlineWidth, style: s.outlineStyle }; });
  assert.equal(focus.width, '3px');
  assert.notEqual(focus.style, 'none');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
  await page.setViewportSize({width:1280,height:900});
  assert.equal(await page.locator('.sidebar').isVisible(),true);
  assert.equal(await page.locator('.mobile-nav').isVisible(),false);
  const sidebarActive = await page.locator('.sidebar .nav-link.active').evaluate(el => getComputedStyle(el).backgroundColor);
  assert.equal(sidebarActive, 'rgb(37, 50, 53)');
  await page.screenshot({path:'/private/tmp/t15a-desktop.png'});
  assert.deepEqual(errors,[]);
  await writeFile('/private/tmp/t15a-browser-report.json',JSON.stringify({report,keyboard:true,desktop:true,contrast:true,reducedMotion:true,errors},null,2));
  console.log(`T16-B PASS: ${report.length} stanów; lokalne Auth/plan, nawigacja, Tempo/font, cele44, skip-link, fokus, reduced motion, desktop, brak JS errors.`);
} finally {
  if(userId) ok(await admin.auth.admin.deleteUser(userId));
  await browser.close();
}

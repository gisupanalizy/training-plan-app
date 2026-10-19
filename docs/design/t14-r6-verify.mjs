import fs from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.T14_PLAYWRIGHT_MODULE || '/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const base = process.env.T14_GALLERY_URL || 'http://127.0.0.1:8791/t14-full-gallery.html';
const out = process.env.T14_REPORT_DIR || 'docs/design';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
const errors = [], mouseChecks = [], dragChecks = [], widths = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto(base);
const privateData = await page.evaluate(() => DATA.private);
if (privateData && path.resolve(out).startsWith(process.cwd() + path.sep)) throw Error('Private report in repository');
await page.locator('#screen').selectOption('progress');
const frames = await page.evaluate(() => FRAMES);

async function pointPosition(scope, index = 1) {
  const plot = scope.locator('.r4-plot');
  await scope.locator('.r4-point').first().waitFor();
  await scope.locator('body').evaluate(() => document.fonts.ready);
  const box = await plot.boundingBox();
  const entry = await plot.evaluate((e, i) => e._positions[Math.min(i, e._positions.length - 1)], index);
  return { x: box.x + entry.x * box.width / 350, y: box.y + entry.y * box.height / 220, date: entry.s.date, box };
}
async function assertNote(scope, date) {
  const note = scope.locator('.r4-point-note');
  await note.waitFor({ state: 'visible', timeout: 2000 });
  await new Promise(resolve => setTimeout(resolve, 180));
  if (!await note.isVisible()) throw Error('Tooltip disappeared after click propagation');
  const expected = new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
  if (!(await note.innerText()).includes(expected)) throw Error('Wrong training date');
  const box = await note.boundingBox(), scroll = await scope.locator('.scroll').boundingBox();
  if (box.y < scroll.y || box.y + box.height > scroll.y + scroll.height || box.x < scroll.x || box.x + box.width > scroll.x + scroll.width) throw Error('Tooltip clipped outside scroll viewport');
  return await note.innerText();
}
for (const [index, metrics] of [[0, ['estimated', 'weight', 'volume']], [1, ['maxreps', 'totalreps']]]) {
  const scope = page.frameLocator('iframe').nth(index);
  for (const metric of metrics) {
    const tab = scope.locator(`[data-r4-metric=${metric}]`);
    if (await tab.getAttribute('aria-selected') !== 'true') await tab.click();
    const point = await pointPosition(scope);
    await page.mouse.click(point.x, point.y);
    const text = await assertNote(scope, point.date);
    if (['estimated', 'weight'].includes(metric) && !text.includes('Seria:')) throw Error('Missing source set');
    await page.mouse.click(point.box.x + point.box.width * .9, point.box.y + point.box.height * .9);
    if (await scope.locator('.r4-point-note').isVisible()) throw Error('Blank chart did not dismiss tooltip');
    await page.mouse.click(point.x, point.y);
    await assertNote(scope, point.date);
    await scope.locator('h1').click();
    if (await scope.locator('.r4-point-note').isVisible()) throw Error('Outside chart did not dismiss tooltip');
    mouseChecks.push({ variant: index ? 'bodyweight' : 'weight', metric, persisted: true, blankDismisses: true, outsideDismisses: true });
  }
  const point = await pointPosition(scope), before = await scope.locator('.r4-plot').getAttribute('data-start');
  await page.mouse.move(point.x, point.y); await page.mouse.down();
  await page.mouse.move(point.x + 60, point.y, { steps: 12 }); await page.mouse.up();
  if (await scope.locator('.r4-plot').getAttribute('data-start') === before) throw Error('Mouse drag no longer pans dates');
  if (await scope.locator('.r4-point-note').isVisible()) throw Error('Drag opened tooltip');
  const after = await pointPosition(scope);
  await page.mouse.click(after.x, after.y); await assertNote(scope, after.date);
  dragChecks.push({ variant: index, pans: true, tooltipAfterDragClick: true });
  await scope.locator('[data-r4-range="3m"]').click();
  await scope.locator('[data-r4-metric]').first().click();
  const selected = await pointPosition(scope);
  await page.mouse.click(selected.x, selected.y); await assertNote(scope, selected.date);
}
await page.screenshot({ path: out + '/t14-r6-mouse-iframe.png', fullPage: true });

const probe = await browser.newPage();
probe.on('pageerror', e => errors.push(e.message));
for (const width of [360, 390, 430]) {
  await probe.setViewportSize({ width, height: 844 });
  for (const variant of ['a', 'b']) {
    await probe.setContent(frames[`progress:${variant}:0:0:0`].replace('<script>', '<script>{').replace('</script>', '}</script>'));
    await probe.evaluate(() => document.fonts.ready);
    const point = await pointPosition(probe);
    await probe.mouse.click(point.x, point.y); await assertNote(probe, point.date);
    if (width === 390) await probe.screenshot({ path: out + `/t14-r6-point-${variant}.png` });
    await probe.keyboard.press('Escape');
    if (await probe.locator('.r4-point-note').isVisible()) throw Error('Escape did not dismiss tooltip');
    const marker = probe.locator('.r4-point').nth(1);
    await marker.focus(); await probe.keyboard.press('Enter'); await assertNote(probe, point.date);
    if (await probe.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Width overflow');
    widths.push({ width, variant, mouseAndKeyboard: true });
  }
}

const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const touch = await context.newPage();
await touch.setContent(frames['progress:a:0:0:0']);
await touch.evaluate(() => document.fonts.ready);
const plot = touch.locator('.r4-plot'), box = await plot.boundingBox(), cdp = await context.newCDPSession(touch);
const center = box.x + box.width * .55, y = box.y + box.height * .5;
const before = await plot.evaluate(e => +e.dataset.end - +e.dataset.start);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: center - 40, y }, { x: center + 40, y }] });
for (let i = 1; i <= 10; i++) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: center - 40 - i * 4, y }, { x: center + 40 + i * 4, y }] });
  await touch.waitForTimeout(16);
}
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
const after = await plot.evaluate(e => +e.dataset.end - +e.dataset.start);
if (after >= before * .8) throw Error('Pinch did not zoom');
const point = await pointPosition(touch);
await touch.touchscreen.tap(point.x, point.y); await assertNote(touch, point.date);
const report = { date: '2026-10-18', private: privateData, mouseChecks, dragChecks, widths, firstTapAfterPinch: true, errors, engine: 'Chrome headless, rzeczywiste zdarzenia myszy w iframe + klawiatura i CDP touch; bez fizycznego telefonu/Safari' };
await fs.writeFile(out + '/t14-r6-verification.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;

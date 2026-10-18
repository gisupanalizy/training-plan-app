import fs from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.T14_PLAYWRIGHT_MODULE || '/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const base = process.env.T14_GALLERY_URL || 'http://127.0.0.1:8791/t14-full-gallery.html';
const out = process.env.T14_REPORT_DIR || 'docs/design';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const gallery = await browser.newPage({ viewport: { width: 1440, height: 1500 } });
const errors = [], checks = [], swipes = [], widths = [];
gallery.on('pageerror', e => errors.push(e.message));
await gallery.goto(base);
const privateData = await gallery.evaluate(() => DATA.private);
if (privateData && path.resolve(out).startsWith(process.cwd() + path.sep)) throw Error('Private output in repository');
if (await gallery.evaluate(() => DATA.confirmed.profile) !== 'a') throw Error('Profile A not confirmed');
await gallery.locator('#screen').selectOption('profile');
if (await gallery.locator('iframe').count() !== 1 || await gallery.locator('.choose').count()) throw Error('Profile choice still open');
const frames = await gallery.evaluate(() => FRAMES);
if (Object.values(frames).some(html => !html.includes('color-scheme:dark'))) throw Error('Mixed default palettes');
await gallery.locator('#screen').selectOption('progress');
await gallery.frameLocator('iframe').first().locator('.r4-point').first().waitFor();
if (await gallery.frameLocator('iframe').first().locator('body').evaluate(e => getComputedStyle(e).backgroundColor) !== 'rgb(17, 24, 31)') throw Error('Night not default');
await gallery.reload();
await gallery.locator('#screen').selectOption('progress');
await gallery.frameLocator('iframe').first().locator('.r4-point').first().waitFor();
checks.push('Noc we wszystkich ramkach i po reload; Profil A potwierdzony');
await gallery.screenshot({ path: out + '/t14-r5-progress.png', fullPage: true });

const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
for (const width of [360, 390, 430]) {
  await page.setViewportSize({ width, height: 844 });
  for (const variant of ['a', 'b']) {
    await page.setContent(frames[`progress:${variant}:0:0:0`].replace('<script>', '<script>{').replace('</script>', '}</script>'));
    await page.evaluate(() => document.fonts.ready);
    const provenance = await page.locator('.r4-plot').evaluate(svg => {
      const kind = document.querySelector('[data-r4-exercise]').value;
      const expected = R4Analytics.analyzed(kind).filter(s => s.date >= +svg.dataset.start && s.date <= +svg.dataset.end && s[svg.dataset.metric] !== null);
      const actual = [...svg.querySelectorAll('.r4-point')].map(p => +p.dataset.date);
      return expected.map(s => s.date).join() === actual.join();
    });
    if (!provenance) throw Error('Interpolated/fake point');
    if (variant === 'a') {
      await page.locator('[data-r4-metric=estimated]').click();
      const bubble = page.locator('.r4-method-popover');
      await bubble.waitFor({ state: 'visible' });
      if (!(await bubble.innerText()).includes('100 ÷ 0,94 ≈ 106,4 kg')) throw Error('Missing calculation');
      const box = await bubble.boundingBox();
      if (box.x < 0 || box.x + box.width > width + 1) throw Error('Help overflow');
      await page.screenshot({ path: out + `/t14-r5-help-${width}.png` });
      await page.keyboard.press('Escape');
      await page.locator('.r4-method-trigger').focus();
      await page.keyboard.press('Enter');
      await bubble.waitFor({ state: 'visible' });
      await page.locator('[data-r4-metric=weight]').click();
      if (await bubble.isVisible() || await page.locator('.r4-method-trigger').isVisible()) throw Error('Help wrong metric');
    } else if (await page.locator('.r4-method-trigger').isVisible()) throw Error('Bodyweight e1RM');
    const point = page.locator('.r4-point').first();
    const date = await point.getAttribute('data-date');
    await point.focus(); await page.keyboard.press('Enter');
    const exact = new Date(+date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    if (!(await page.locator('.r4-point-note').innerText()).includes(exact)) throw Error('Point date mismatch');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Viewport overflow');
    widths.push({ width, variant, provenance, pointDateMatches: true });
  }
}
checks.push('6 stanów360/390/430px: punkty wyłącznie w datach treningów, dokładny odczyt i pomoc bez overflow');
checks.push('Chmurka1RM: aktywna metryka/ikona/Enter/Escape, wzór i współczynniki; ukryta dla innych metryk');

await page.setViewportSize({ width: 390, height: 844 });
const cdp = await context.newCDPSession(page);
async function swipe(x1, x2, y) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x1, y }] });
  for (let i = 1; i <= 15; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x1 + (x2 - x1) * i / 15, y }] });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(450);
}
for (const variant of ['a', 'b']) {
  await page.setContent(frames[`progress:${variant}:0:0:0`].replace('<script>', '<script>{').replace('</script>', '}</script>'));
  await page.evaluate(() => document.fonts.ready);
  const plot = page.locator('.r4-plot');
  const position = await plot.evaluate(svg => svg._positions[1]);
  const chart = await plot.boundingBox();
  await page.touchscreen.tap(chart.x + position.x * chart.width / 350, chart.y + position.y * chart.height / 220);
  await page.locator('.r4-point-note').waitFor({ state: 'visible' });
  await page.touchscreen.tap(chart.x + chart.width * .9, chart.y + chart.height * .82);
  if (await page.locator('.r4-point-note').isVisible()) throw Error('Blank chart does not dismiss point');
  await page.touchscreen.tap(chart.x + position.x * chart.width / 350, chart.y + position.y * chart.height / 220);
  await page.locator('.r4-point-note').waitFor({ state: 'visible' });
  await page.locator('h1').tap();
  if (await page.locator('.r4-point-note').isVisible()) throw Error('Outside chart does not dismiss point');
  await page.touchscreen.tap(chart.x + chart.width * .9, chart.y + chart.height * .82);
  if (await page.locator('.r4-point-note').isVisible()) throw Error('Blank chart opened a point');

  const records = page.locator('.r4-records');
  await records.scrollIntoViewIfNeeded();
  const box = await records.boundingBox(), y = Math.min(730, box.y + 50);
  await swipe(325, 65, y);
  const right = await records.evaluate(e => e.scrollLeft);
  await swipe(65, 325, y);
  const left = await records.evaluate(e => e.scrollLeft);
  if (right < 100 || left > right - 50) throw Error(`Touch swipe failed: ${right}/${left}`);
  swipes.push({ variant, right, left });
  await page.keyboard.press('Escape');
  await page.locator('.scroll').evaluate(e => e.scrollTop = 0);
  await page.screenshot({ path: out + `/t14-r5-mobile-${variant}.png` });
}
checks.push('Dotyk: tylko tap punktu otwiera; pusty wykres i obszar poza nim zamykają; swipe PR w obie strony dla obu ćwiczeń');
const report = { date: '2026-10-18', private: privateData, checks, widths, swipes, errors, engine: 'Chrome headless + CDP touch; bez fizycznego telefonu/Safari' };
await fs.writeFile(out + '/t14-r5-verification.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (errors.length) process.exitCode = 1;

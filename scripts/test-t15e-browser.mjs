import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { writeFile } from "node:fs/promises";
import { fixture, base, ok } from "./test-t15e-api.mjs";
const modulePath = process.env.T15E_PLAYWRIGHT_MODULE ?? "/Users/jakub.olech/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(modulePath).href);
const f = await fixture({ overlap: true });
let browser;
const errors = [], checks = [];
try {
  browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await context.addCookies([...f.a.jar].map(([name, value]) => ({ name, value: encodeURIComponent(value), url: base })));
  const page = await context.newPage(); page.on("pageerror", error => errors.push(error.message));
  for (const exercise of [f.externalId, f.bodyweightId]) {
    await page.goto(`${base}/postep?exercise=${exercise}`);
    const metrics = exercise === f.externalId ? ["Szacowany 1RM", "Max Ciężar", "Objętość"] : ["Max Powtórzeń", "Suma Powtórzeń"];
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      for (const metric of metrics) {
        await page.getByRole("group", { name: "Metryka wykresu", exact: true }).getByRole("button", { name: metric, exact: true }).click();
        const plot = page.getByTestId("progress-plot");
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}/${metric}`);
        const targets = await plot.locator("[data-progress-point]").evaluateAll(els => els.map(el => { const box = el.getBoundingClientRect(); return [box.width, box.height]; }));
        assert.ok(targets.length === 4 && targets.every(([w, h]) => w >= 44 && h >= 44));
        const point = plot.locator("[data-progress-point]").last();
        await point.click(); await page.getByTestId("point-note").waitFor({ state: "visible" });
        assert.match(await page.getByTestId("point-note").innerText(), /8 października 2026/);
        assert.match(await page.getByTestId("point-note").innerText(), exercise === f.externalId ? /0 kg/ : /12 powt\./);
        await page.getByRole("heading", { name: "Postęp", exact: true }).click(); assert.equal(await page.getByTestId("point-note").count(), 0);
        const box = await plot.boundingBox(); await page.mouse.click(box.x + box.width * .9, box.y + box.height * .88); assert.equal(await page.getByTestId("point-note").count(), 0);
        checks.push({ width, exercise: exercise === f.externalId ? "kg" : "masa ciała", metric, target44: true, click: true });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/postep?exercise=${f.externalId}`);
  const readingBox = await page.getByTestId("progress-reading").boundingBox();
  const plotBox = await page.getByTestId("progress-plot").boundingBox();
  const rangeBox = await page.getByRole("group", { name: "Zakres czasu", exact: true }).boundingBox();
  assert.ok(readingBox && plotBox && rangeBox && readingBox.y + readingBox.height <= plotBox.y + 1, "ostatni wynik jest nad wykresem");
  assert.ok(rangeBox.y >= plotBox.y + plotBox.height - 1, "zakres jest pod wykresem");
  assert.doesNotMatch(await page.getByTestId("progress-change").innerText(), /%/);
  await page.getByText("Szacunek to nie pomiar", { exact: true }).waitFor();
  assert.equal(await page.getByRole("link", { name: "Przejdź do Profilu" }).getAttribute("href"), "/profil");
  await page.getByRole("button", { name: "Jak liczymy szacowany 1RM" }).focus(); await page.keyboard.press("Enter");
  assert.match(await page.getByRole("note").innerText(), /106,4 kg/); await page.keyboard.press("Escape"); assert.equal(await page.getByRole("note").count(), 0);
  const plot = page.getByTestId("progress-plot"), point = plot.locator("[data-progress-point]").last();
  await point.focus(); await page.keyboard.press("Enter"); await page.getByTestId("point-note").waitFor({ state: "visible" }); await page.keyboard.press("Escape");
  const box = await plot.boundingBox();
  await page.mouse.move(box.x + box.width * .7, box.y + box.height * .7); await page.mouse.down(); await page.mouse.move(box.x + box.width * .45, box.y + box.height * .7, { steps: 12 }); await page.mouse.up();
  assert.equal(await page.getByTestId("point-note").count(), 0);
  await plot.locator("[data-progress-point]").last().focus(); await page.keyboard.press("Enter");
  await page.getByTestId("point-note").waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "3M", exact: true }).click(); await plot.locator("[data-progress-point]").last().click(); await page.getByTestId("point-note").waitFor({ state: "visible" });
  await page.getByRole("heading", { name: "Postęp", exact: true }).click();
  const cdp = await context.newCDPSession(page);
  const touch = (type, points) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
  const before = await plot.getAttribute("data-from"), chart = await plot.boundingBox(), center = { x: chart.x + chart.width * .55, y: chart.y + chart.height * .5 };
  await touch("touchStart", [{ x: center.x - 35, y: center.y }, { x: center.x + 35, y: center.y }]);
  for (let i = 1; i <= 10; i++) { await touch("touchMove", [{ x: center.x - 35 - i * 4, y: center.y }, { x: center.x + 35 + i * 4, y: center.y }]); await page.waitForTimeout(20); }
  await touch("touchEnd", []); assert.notEqual(await plot.getAttribute("data-from"), before, "pinch zmienia daty"); assert.equal(await page.getByTestId("point-note").count(), 0);
  await page.getByRole("button", { name: "3M", exact: true }).click();
  const tapBox = await point.boundingBox(); await page.touchscreen.tap(tapBox.x + tapBox.width / 2, tapBox.y + tapBox.height / 2); await page.getByTestId("point-note").waitFor({ state: "visible" });
  await page.getByRole("heading", { name: "Postęp", exact: true }).tap(); assert.equal(await page.getByTestId("point-note").count(), 0);
  const records = page.getByTestId("progress-records"); await records.scrollIntoViewIfNeeded(); const recordBox = await records.boundingBox();
  const swipe = async (start, end) => { await touch("touchStart", [{ x: start, y: recordBox.y + 70 }]); for (let i = 1; i <= 14; i++) { await touch("touchMove", [{ x: start + (end - start) * i / 14, y: recordBox.y + 70 }]); await page.waitForTimeout(18); } await touch("touchEnd", []); await page.waitForTimeout(450); };
  await swipe(325, 65); const scrollRight = await records.evaluate(el => el.scrollLeft); await swipe(65, 325); const scrollLeft = await records.evaluate(el => el.scrollLeft);
  assert.ok(scrollRight > 80 && scrollLeft < scrollRight - 50, `swipe ${scrollRight}→${scrollLeft}`);
  const allTime = await records.innerText(); await page.getByRole("button", { name: "1M", exact: true }).click(); assert.equal(await records.innerText(), allTime);
  await page.getByText("O wykresie, daty i wyniki treningów", { exact: true }).click();
  assert.equal(await page.getByTestId("analytics-history").locator("article").count(), 4);
  assert.match(await page.getByTestId("analytics-history").innerText(), /godzina nieznana/); assert.match(await page.getByTestId("analytics-history").innerText(), /Przerwany/);
  await page.getByRole("button", { name: "Przybliż", exact: true }).click(); await page.getByRole("button", { name: "Reset zakresu", exact: true }).click();
  await page.getByLabel("Od daty", { exact: true }).fill("2026-10-08"); await page.getByLabel("Do daty", { exact: true }).fill("2026-10-08"); await page.getByRole("button", { name: "Ustaw daty", exact: true }).click();
  assert.equal(await plot.locator("[data-progress-point]").count(), 1); assert.equal(await records.innerText(), allTime);
  assert.equal(await plot.getAttribute("data-chart-line"), "none");
  assert.match(await page.getByTestId("progress-change").innerText(), /brak podstawy porównania/);
  assert.equal(await page.getByText("Jeden wynik nie pokazuje trendu.", { exact: true }).count(), 1);
  assert.doesNotMatch(await page.getByTestId("progress-change").innerText(), /%/);
  await page.getByRole("button", { name: "3M", exact: true }).click();
  await page.getByText("O wykresie, daty i wyniki treningów", { exact: true }).click();
  const pointList = page.getByTestId("progress-point-list"); await pointList.locator("summary").click();
  const legacy = pointList.getByRole("button").filter({ hasText: "godzina nieznana" }); assert.equal(await legacy.count(), 2);
  await legacy.nth(0).click(); const firstNote = await page.getByTestId("point-note").textContent();
  await legacy.nth(1).tap(); const secondNote = await page.getByTestId("point-note").textContent();
  assert.notEqual(firstNote, secondNote, "nakładające się punkty dają osobny odczyt myszą i tapem");
  assert.ok(!secondNote.includes(f.started.workoutId), "UUID tylko w szczegółach źródeł");
  await pointList.locator("summary").click();
  await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: "/private/tmp/t15e-progress-390.png" });
  await page.getByLabel("Ćwiczenie i wariant").selectOption(f.bodyweightId); await page.screenshot({ path: "/private/tmp/t15e-bodyweight-390.png" });
  assert.equal(await page.getByRole("button", { name: "Jak liczymy szacowany 1RM" }).count(), 0);
  assert.equal(await page.getByText("Szacunek to nie pomiar", { exact: true }).count(), 0);
  // Korekta faktycznej serii przez API/RPC → odświeżenie analityki; zero i null wcześniej odczytane z bazy.
  const set = f.originalSets.find(s => s.exercise_id === f.externalId), revision = ok(await f.a.client.from("workout_sessions").select("revision").eq("id", f.started.workoutId).single()).revision;
  await f.command(f.started.workoutId, revision, "save_set", f.save(set, null, 250));
  await page.goto(`${base}/postep?exercise=${f.externalId}`); await page.getByRole("group", { name: "Metryka wykresu", exact: true }).getByRole("button", { name: "Max Ciężar", exact: true }).click();
  assert.equal(await page.getByText("Szacunek to nie pomiar").count(), 0);
  assert.match(await records.innerText(), /250 kg/); assert.match(await records.innerText(), /brak powtórzeń/);
  await page.setViewportSize({ width: 1280, height: 900 }); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)); await page.screenshot({ path: "/private/tmp/t15e-progress-desktop.png" });
  assert.deepEqual(errors, []);
  await writeFile("/private/tmp/t15e-browser-report.json", JSON.stringify({ checks, mouseDragThenClick: true, keyboard: true, pinch: true, firstTapAfterPinch: true, swipe: { scrollRight, scrollLeft }, customDates: true, correction: true, errors }, null, 2));
  console.log(`T15-E Chrome PASS:${checks.length} stanów360/390/430;mysz klik/drag/klik,outside,Enter/Escape,pomoc,pinch,pierwszy tap,PR swipe${scrollRight}→${scrollLeft},własne daty,korekta,desktop,ostatni wynik nad wykresem,jeden punkt bez trendu i bez procentu,szacunek osobno od Profilu.`);
} finally { try { await browser?.close(); } finally { await f.cleanup(); } }

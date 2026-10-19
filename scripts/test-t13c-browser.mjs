import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
const base = process.env.T13C_HTTP_BASE ?? 'http://localhost:3005';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
assert.match(process.env.SUPABASE_URL ?? '', /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const { chromium } = await import(pathToFileURL(process.env.T13C_PLAYWRIGHT_MODULE).href);
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = value => { if (value.error) throw new Error(value.error.message); return value.data; };
const users = []; const measures = []; let lastPage;
const target = (position, changes = {}) => ({ position, kind: 'work', repsMin: 6, repsMax: 6, isAmrap: false, isOptional: false, loadType: 'absolute', targetKg: 60, targetKgMax: null, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, durationSecondsMax: null, distanceMeters: null, restSeconds: 60, restSecondsMax: null, tempo: null, targetRpe: null, targetRir: null, note: null, ...changes });
const ex = (name, sets, supersetGroup = null) => ({ name, exerciseId: null, originalName: `Original ${name}`, variant: null, equipment: null, supersetGroup, note: 'Syntetyczna uwaga', sets });
const document = { name: 'Plan T13-C', sessions: [
  { weekNumber: 1, dayLabel: 'A', note: null, exercises: [ex('Przysiad', Array.from({ length: 8 }, (_, i) => target(i + 1, { loadType: 'percent_1rm', targetKg: null, targetPercent: 75 }))), ex('Wiosłowanie', [target(1), target(2, { targetKg: 70, kind: 'ramp' }), target(3, { isOptional: true, isAmrap: true, repsMin: null, repsMax: null })], 'S1'), ex('Wyciskanie', [target(1, { targetKg: 0, restSeconds: 0 })], 'S1'), ex('Plank', [target(1, { repsMin: null, repsMax: null, targetKg: null, loadType: 'unspecified', durationSeconds: 30, distanceMeters: 400 })])] },
  { weekNumber: 2, dayLabel: 'B', note: null, exercises: [ex('Martwy ciąg', [target(1)])] },
] };
try {
  const email = `t13c-${randomUUID()}@example.invalid`, password = randomUUID();
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true })); users.push(user.id);
  ok(await admin.from('profiles').insert({ id: user.id }));
  const jar = new Map(); const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: entries => entries.forEach(({ name, value }) => jar.set(name, value)) } });
  ok(await client.auth.signInWithPassword({ email, password }));
  const plan = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document }));
  const days = ok(await client.from('plan_sessions').select('id').eq('plan_version_id', plan.versionId).order('position'));
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies([...jar].map(([name, value]) => ({ name, value: encodeURIComponent(value), url: base })));
  const page = await context.newPage(); lastPage = page; const errors = []; page.on('pageerror', error => errors.push(error.message));
  const heading = name => page.getByRole('heading', { name, exact: true });
  const button = name => page.getByRole('button', { name, exact: true });
  const card = name => page.locator('.workout-card-open').filter({ hasText: name });
  const read = async id => { const response = await context.request.get(`${base}/api/workouts/${id}`); assert.equal(response.status(), 200); return response.json(); };
  const post = async (id, revision, action, payload = {}) => { const response = await context.request.post(`${base}/api/workouts`, { data: { operationId: randomUUID(), workoutId: id, expectedRevision: revision, action, payload } }); assert.equal(response.status(), 200, await response.text()); return response.json(); };
  const back = () => button('← Wróć do ćwiczeń').click();
  await page.goto(`${base}/plany/${plan.planId}`); await page.locator('.preview-start>summary').click(); await button('Rozpocznij trening').click(); await page.waitForURL('**/trening/*');
  const id = new URL(page.url()).pathname.split('/').at(-1); let state = await read(id);
  assert.ok(state.workout.started_at && state.workout.performed_at); const before = state.exercises.flatMap(ex => ex.sets).map(set => Object.fromEntries(Object.entries(set).filter(([key]) => key.includes('snapshot') || key === 'one_rep_max_record_id')));
  const maximum = await context.request.post(`${base}/api/one-rep-max`, { data: { operationId: randomUUID(), exerciseId: state.exercises[0].exercise_id, valueKg: 120, effectiveOn: '2026-10-17', note: null } }); assert.equal(maximum.status(), 200);
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 }); await page.evaluate(() => window.scrollTo(0, 0));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}`);
    const cards = await page.locator('.workout-card').evaluateAll(elements => elements.map(el => ({ top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom })));
    const nav = await page.locator('.mobile-nav').boundingBox(); if (width === 390) assert.ok(cards[3].bottom <= nav.y, JSON.stringify({ cards, nav }));
    for (const locator of [button('Kontynuuj'), card('Przysiad')]) { const box = await locator.boundingBox(); assert.ok(box.width >= 44 && box.height >= 44); }
    measures.push({ width, cards, navTop: nav.y }); await page.screenshot({ path: `/private/tmp/t13c-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  console.log('T13-C: Inny szkic pozostaje po zapisie serii. Utrata odpowiedzi już po rzeczywistym commicie.');
  // Inny szkic pozostaje po zapisie serii. Utrata odpowiedzi już po rzeczywistym commicie.
  await button('Komentarz').click(); await page.getByLabel('Komentarz', { exact: true }).fill('Zachowany szkic');
  await card('Przysiad').focus(); await page.keyboard.press('Enter'); await heading('Przysiad · seria 1').waitFor();
  await page.screenshot({ path: '/private/tmp/t13c-detail.png' }); assert.equal(await page.locator('form').count(), 1); assert.match(await page.locator('.workout-detail').innerText(), /brak maksimum/);
  await page.getByLabel('Powtórzenia', { exact: true }).fill('0');
  const sent = []; let drop = true;
  await page.route('**/api/workouts', async route => { if (route.request().method() !== 'POST') return route.continue(); sent.push(route.request().postData()); if (drop) { drop = false; await route.fetch(); await route.abort('failed'); } else await route.continue(); });
  await page.evaluate(() => { window.__t13Marker = 'same-document'; });
  await button('Zapisz i przejdź dalej').click(); await button('Ponów tę samą operację').waitFor();
  await heading('Przysiad · seria 1').waitFor(); await button('Ponów tę samą operację').click(); await heading('Przysiad · seria 2').waitFor();
  assert.equal(sent[0], sent[1]); assert.equal(await page.evaluate(() => window.__t13Marker), 'same-document'); await page.unroute('**/api/workouts');
  await back(); await page.screenshot({ path: '/private/tmp/t13c-after-back.png' }); await heading('A').waitFor(); assert.equal(await page.getByLabel('Komentarz', { exact: true }).inputValue(), 'Zachowany szkic');
  await button('Zapisz komentarz').click(); await page.waitForFunction(() => !document.querySelector('.workout-message'));
  state = await read(id); assert.equal(state.exercises[0].sets[0].actual_reps, 0); assert.equal(state.exercises[0].sets[0].actual_kg, null);
  console.log('T13-C: Przeglądarkowy Wstecz zachowuje dokument i pyta o szkic.');
  // Przeglądarkowy Wstecz zachowuje dokument i pyta o szkic.
  await card('Plank').click(); await page.getByLabel('Czas (s)', { exact: true }).fill('22');
  await page.evaluate(() => history.back()); await page.getByRole('dialog', { name: 'Niezapisane zmiany' }).waitFor(); await button('Zostań').click();
  assert.equal(await page.getByLabel('Czas (s)', { exact: true }).inputValue(), '22');
  await page.evaluate(() => history.back()); await button('Odrzuć zmiany').click(); await heading('A').waitFor(); assert.equal(await page.evaluate(() => window.__t13Marker), 'same-document');
  // Powrót/scroll/fokus i trzy decyzje formularza.
  await page.evaluate(() => { window.scrollTo(0, 160); document.addEventListener('click', event => { if (event.target.closest('.workout-card-open')) window.__cardScroll = scrollY; }, true); });
  await card('Plank').click(); const originalScroll = await page.evaluate(() => window.__cardScroll); await heading('Plank · seria 1').waitFor();
  await page.setViewportSize({ width: 390, height: 500 });
  await page.getByLabel('Czas (s)', { exact: true }).focus(); await page.getByLabel('Czas (s)', { exact: true }).scrollIntoViewIfNeeded();
  for (const control of [page.getByLabel('Czas (s)', { exact: true }), button('Zapisz i przejdź dalej')]) { await control.scrollIntoViewIfNeeded(); const box = await control.boundingBox(); assert.ok(box.width >= 44 && box.height >= 44); }
  await page.setViewportSize({ width: 390, height: 844 }); await page.getByLabel('Czas (s)', { exact: true }).fill('45');
  await back(); await page.getByRole('dialog', { name: 'Niezapisane zmiany' }).waitFor(); await button('Zostań').click(); assert.equal(await page.getByLabel('Czas (s)', { exact: true }).inputValue(), '45');
  await back(); await button('Odrzuć zmiany').click(); await card('Plank').waitFor(); await page.waitForFunction(() => document.activeElement?.className === 'workout-card-open');
  const restoredScroll = await page.evaluate(() => scrollY); assert.ok(Math.abs(restoredScroll - originalScroll) < 8, JSON.stringify({ originalScroll, restoredScroll }));
  await card('Plank').click(); assert.equal(await page.getByLabel('Czas (s)', { exact: true }).inputValue(), ''); await page.getByLabel('Czas (s)', { exact: true }).fill('60'); await page.getByLabel('Dystans (m)', { exact: true }).fill('400');
  await back(); await button('Zapisz', { exact: true }).click(); await heading('A').waitFor();
  console.log('T13-C: ACK + nieudany GET: retry to wyłącznie odczyt, przejście dopiero po nim.');
  // ACK + nieudany GET: retry to wyłącznie odczyt, przejście dopiero po nim.
  await card('Przysiad').click(); await page.getByLabel('Powtórzenia', { exact: true }).fill('6'); let failRead = true; let postCount = 0;
  const countPosts = request => { if (request.url() === `${base}/api/workouts` && request.method() === 'POST') postCount++; }; page.on('request', countPosts);
  await page.route(`**/api/workouts/${id}`, async route => { if (failRead) { failRead = false; await route.abort(); } else await route.continue(); });
  await button('Zapisz i przejdź dalej').click(); await button('Ponów odczyt po zapisie').waitFor(); await heading('Przysiad · seria 2').waitFor(); await button('Ponów odczyt po zapisie').click(); await heading('Przysiad · seria 3').waitFor(); assert.equal(postCount, 1); page.off('request', countPosts); await page.unroute(`**/api/workouts/${id}`); await back();
  console.log('T13-C: Rzeczywisty 409 przez zapis z drugiej karty/API, szkic nie jest nadpisywany.');
  // Rzeczywisty 409 przez zapis z drugiej karty/API, szkic nie jest nadpisywany.
  await card('Przysiad').click(); await page.getByLabel('Powtórzenia', { exact: true }).fill('8'); state = await read(id); await post(id, state.workout.revision, 'comment', { comment: 'Druga karta' });
  await button('Zapisz i przejdź dalej').click(); await button('Odczytaj stan i rozstrzygnij').waitFor(); await button('Odczytaj stan i rozstrzygnij').click(); await page.getByText(/Stan odczytany/).waitFor(); assert.equal(await page.getByLabel('Powtórzenia', { exact: true }).inputValue(), '8'); await button('Zapisz i przejdź dalej').click(); await heading('Przysiad · seria 4').waitFor(); await back();
  console.log('T13-C: Nierówne rundy S1, pominięcie, opcjonalna, poprawka i dodatkowa seria.');
  // Nierówne rundy S1, pominięcie, opcjonalna, poprawka i dodatkowa seria.
  await card('Wiosłowanie').click(); await page.getByLabel('Powtórzenia', { exact: true }).fill('6'); await button('Zapisz i przejdź dalej').click(); await heading('Wyciskanie · seria 1').waitFor(); await button('Pomiń serię').click(); await heading('Wiosłowanie · seria 2').waitFor(); await page.getByLabel('Powtórzenia', { exact: true }).fill('5'); await button('Zapisz i przejdź dalej').click(); await page.getByRole('dialog', { name: 'Wybierz dalszy krok' }).waitFor();
  await button('Opcjonalna: Wiosłowanie · seria 3').click(); await heading('Wiosłowanie · seria 3').waitFor(); await button('+ Dodatkowa seria').click(); await heading('Wiosłowanie · seria 4').waitFor(); await page.getByLabel('Powtórzenia', { exact: true }).fill('2'); await button('Zapisz i przejdź dalej').click(); await page.getByRole('dialog', { name: 'Wybierz dalszy krok' }).waitFor(); await button('Następne ćwiczenie lub przegląd').click(); await back();
  state = await read(id); assert.equal(state.exercises[2].sets[0].status, 'skipped'); assert.equal(state.exercises[1].sets[2].status, 'pending'); assert.equal(state.exercises[1].sets[3].source_kind, 'extra');
  console.log('T13-C: Głos: mock, opóźniona odpowiedź po zmianie celu nie zapisuje. Awaria AI zostawia ręczny formularz.');
  // Głos: mock, opóźniona odpowiedź po zmianie celu nie zapisuje. Awaria AI zostawia ręczny formularz.
  await card('Przysiad').click(); await button('Dyktuj serię 4').click(); let deliver; const released = new Promise(resolve => { deliver = resolve; });
  await page.route('**/api/voice/interpret', async route => { const context = route.request().postDataJSON(); await released; try { await route.fulfill({ json: { transcript: 'Siedem po sto', target: { workoutId: id, setId: context.setId, revision: context.revision }, proposal: { intent: 'set', reps: 7, kg: 100, series: null, name: null, variant: null, comment: null, question: null } } }); } catch {} });
  await page.getByLabel('Transkrypcja lub tekst wpisany ręcznie').fill('Siedem po sto'); await button('Przygotuj propozycję').click(); await back(); deliver(); await card('Plank').click(); await heading('Plank · seria 1').waitFor(); assert.equal(await button('Zatwierdź i zapisz').count(), 0); await back(); await page.unroute('**/api/voice/interpret');
  await card('Przysiad').click(); await button('Dyktuj serię 4').click();
  await page.route('**/api/voice/interpret', async route => { const ctx = route.request().postDataJSON(); await route.fulfill({ json: { transcript: 'Siedem po sto', target: { workoutId: id, revision: ctx.revision, setId: ctx.setId }, proposal: { intent: 'set', reps: 7, kg: 100, series: null, name: null, variant: null, comment: null, question: null } } }); });
  await page.getByLabel('Transkrypcja lub tekst wpisany ręcznie').fill('Siedem po sto'); await button('Przygotuj propozycję').click(); await button('Zatwierdź i zapisz').waitFor(); assert.equal((await read(id)).exercises[0].sets[3].status, 'pending');
  await button('Zatwierdź i zapisz').click(); await heading('Przysiad · seria 5').waitFor(); assert.equal((await read(id)).exercises[0].sets[3].actual_kg, 100); await page.unroute('**/api/voice/interpret');
  await button('Dyktuj serię 5').click(); await page.route('**/api/voice/interpret', route => route.fulfill({ status: 503, json: { error: 'Głos wyłączony testowo' } })); await page.getByLabel('Transkrypcja lub tekst wpisany ręcznie').fill('Pięć'); await button('Przygotuj propozycję').click(); await page.getByText('Głos wyłączony testowo', { exact: true }).waitFor(); assert.equal(await page.getByLabel('Powtórzenia', { exact: true }).isEnabled(), true); await back(); await page.unroute('**/api/voice/interpret');
  console.log('T13-C: Dodatkowe ćwiczenie na żądanie.');
  // Dodatkowe ćwiczenie na żądanie.
  await button('Dodaj ćwiczenie').click(); await page.getByLabel('Nazwa', { exact: true }).fill('Dodatkowe podciąganie'); await button('Zapisz dodatkowe ćwiczenie').click(); await card('Dodatkowe podciąganie').waitFor();
  console.log('T13-C: Finish z korektą, snapshoty bez zmian, brakujące pozostają pending.');
  // Finish z korektą, snapshoty bez zmian, brakujące pozostają pending.
  await button('Zakończ trening').click(); await page.getByLabel('Popraw datę i godzinę wykonania').check(); await page.getByLabel('Data i godzina wykonania').fill('2026-10-15T12:00'); await button('Potwierdź zakończenie').click(); await page.getByText(/Zakończony/, { exact: false }).first().waitFor(); state = await read(id);
  assert.equal(state.workout.performed_on, '2026-10-15'); assert.equal(state.workout.status, 'completed');
  const after = state.exercises.filter(ex => ex.source_kind !== 'extra').flatMap(ex => ex.sets.filter(set => set.source_kind !== 'extra')).map(set => Object.fromEntries(Object.entries(set).filter(([key]) => key.includes('snapshot') || key === 'one_rep_max_record_id')));
  assert.deepEqual(after, before); assert.equal(state.exercises[0].sets[4].status, 'pending');
  await card('Przysiad').click(); await page.locator('.workout-all>summary').click(); await button('Popraw serię 1: Przysiad').click(); await page.getByLabel('Powtórzenia', { exact: true }).fill('9'); await button('Zapisz poprawkę').click(); await heading('A').waitFor(); assert.equal((await read(id)).exercises[0].sets[0].actual_reps, 9);
  console.log('T13-C: Prawdziwe ponowne logowanie formularzem.');
  // Prawdziwe ponowne logowanie formularzem.
  await context.clearCookies(); await page.goto(`${base}/logowanie`); await page.getByLabel('Adres e-mail').fill(email); await page.getByLabel('Hasło').fill(password); await button('Zaloguj się').click(); await page.waitForURL(url => url.pathname !== '/logowanie'); await page.goto(`${base}/trening/${id}`); await heading('A').waitFor(); assert.match(await page.locator('.workout-heading').innerText(), /2026-10-15/);
  console.log('T13-C: Konflikt/cancel/finish-replace/delete-replace na rzeczywistym API.');
  // Konflikt/cancel/finish-replace/delete-replace na rzeczywistym API.
  await page.goto(`${base}/plany/${plan.planId}`); await page.locator('.preview-start>summary').click(); await button('Rozpocznij trening').click(); await page.waitForURL('**/trening/*'); const firstActive = new URL(page.url()).pathname.split('/').at(-1); const knownMaximum = await read(firstActive); assert.equal(knownMaximum.exercises[0].sets[0].one_rep_max_kg_snapshot, 120); assert.equal(knownMaximum.exercises[0].sets[0].rounded_target_kg_snapshot, 90);
  async function conflict() { await page.goto(`${base}/plany/${plan.planId}`); await page.getByLabel('Wybierz trening').selectOption(days[1].id); await page.locator('.preview-start>summary').click(); await button('Rozpocznij trening').click(); await button('Pokaż aktywne treningi').click(); await page.getByRole('region', { name: 'Aktywne treningi' }).waitFor(); }
  await conflict(); assert.equal(await page.getByRole('link', { name: 'Wróć do treningu', exact: true }).getAttribute('href'), `/trening/${firstActive}`); await button('Anuluj wybór').click(); assert.equal((await read(firstActive)).workout.status, 'in_progress'); await button('Rozpocznij trening').click(); await button('Pokaż aktywne treningi').click(); await button('Zakończ i rozpocznij nowy').click(); await page.getByLabel('Popraw datę i godzinę wykonania').check(); await page.getByLabel('Data i godzina wykonania').fill('2026-10-15T12:00'); await button('Potwierdź zakończenie i nowy start').click(); await page.waitForURL('**/trening/*'); const replaced = new URL(page.url()).pathname.split('/').at(-1); assert.notEqual(replaced, firstActive); const correctedKnown = await read(firstActive); assert.equal(correctedKnown.workout.status, 'completed'); assert.equal(correctedKnown.workout.performed_on, '2026-10-15'); assert.equal(correctedKnown.exercises[0].sets[0].rounded_target_kg_snapshot, 90); assert.equal(correctedKnown.exercises[0].sets[0].one_rep_max_kg_snapshot, 120);
  console.log('T13-C: Nowa A konfliktuje z B.');
  // Nowa A konfliktuje z B.
  await page.goto(`${base}/plany/${plan.planId}`); await page.getByLabel('Wybierz trening').selectOption(days[0].id); await page.locator('.preview-start>summary').click(); await button('Rozpocznij trening').click(); await button('Pokaż aktywne treningi').click(); await button('Usuń i rozpocznij nowy').click(); await button('Zostań').click(); assert.equal((await read(replaced)).workout.status, 'in_progress'); await button('Usuń i rozpocznij nowy').click(); await button('Potwierdzam trwałe usunięcie i nowy start').click(); await page.waitForURL('**/trening/*'); assert.equal((await context.request.get(`${base}/api/workouts/${replaced}`)).status(), 410);
  console.log('T13-C: Usunięcie aktywnego wymaga dodatkowego potwierdzenia.');
  // Usunięcie aktywnego wymaga dodatkowego potwierdzenia.
  await button('Usuń trening').click(); await button('Potwierdzam trwałe usunięcie').click(); await page.waitForURL('**/historia');
  console.log('T13-C: Legacy fixture: tylko własne syntetyczne wiersze, bez migracji/zmian schematu.');
  // Legacy fixture: tylko własne syntetyczne wiersze, bez migracji/zmian schematu.
  const legacy = []; for (const day of days) legacy.push(ok(await admin.from('workout_sessions').insert({ owner_id: user.id, plan_version_id: plan.versionId, plan_session_id: day.id, performed_on: '2020-01-01', snapshot_on: '2020-01-01', revision: 1 }).select('id').single()));
  await page.goto(`${base}/plany/${plan.planId}`); await page.getByLabel('Wybierz trening').selectOption(days[0].id);
  console.log('T13-C: Plan B pokazuje wznowienie dla obu jednostek; bezpośredni start konfliktu przez osobną syntetyczną nową wersję.');
  // Plan B pokazuje wznowienie dla obu jednostek; bezpośredni start konfliktu przez osobną syntetyczną nową wersję.
  const version2 = ok(await client.rpc('save_manual_plan', { p_operation_id: randomUUID(), p_plan_id: plan.planId, p_expected_version_id: plan.versionId, p_document: document }));
  await page.reload(); await page.locator('.preview-start>summary').click(); await button('Rozpocznij trening').click(); await button('Pokaż aktywne treningi').click(); await page.getByRole('heading', { name: 'Rozstrzygnij każdy trening osobno' }).waitFor();
  assert.equal(await button('Zakończ ten trening').count(), 2); assert.match(await page.getByRole('region', { name: 'Aktywne treningi' }).innerText(), /godzina nieznana/);
  await button('Zakończ ten trening').first().click(); await button('Potwierdź zakończenie').click(); await page.getByRole('heading', { name: 'Masz aktywny trening' }).waitFor(); const legacyStates = await Promise.all(legacy.map(row => read(row.id))); assert.equal(legacyStates.filter(value => value.workout.status === 'completed').length, 1); const remainingLegacy = legacyStates.find(value => value.workout.status === 'in_progress').workout.id;
  await button('Anuluj wybór').click(); await page.goto(`${base}/trening/${remainingLegacy}`); await button('Usuń trening').click(); await button('Potwierdzam trwałe usunięcie').click(); await page.waitForURL('**/historia');
  assert.deepEqual(errors, []); console.log('T13-C PASS: lokalne Auth/API/Chrome, szkice/retry/ACK/odczyt/409, rundy/opcjonalne/null/0, poprawka, głos mock, konflikt/cancel/replace/legacy/finish/delete, logowanie.'); console.log(JSON.stringify(measures));
  await context.close();
} catch (error) { if (lastPage) { await lastPage.screenshot({ path: '/private/tmp/t13c-failure.png' }).catch(() => {}); console.log('Stan błędu:', await lastPage.locator('.workout-ui').innerText().catch(() => 'poza treningiem')); } throw error; } finally { await browser.close(); for (const id of users) ok(await admin.auth.admin.deleteUser(id)); console.log(`Sprzątnięto syntetyczne konta: ${users.length}.`); }

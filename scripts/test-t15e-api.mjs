import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

export const base = process.env.T15E_HTTP_BASE ?? "http://localhost:3005";
export const ok = (result, label = "operacja") => { assert.ifError(result.error, `${label}: ${result.error?.message}`); return result.data; };
const clientOptions = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
export async function fixture({ bulk = false, overlap = false } = {}) {
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
  assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/); assert.match(url ?? "", /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
  const admin = createClient(url, adminKey, clientOptions), users = [];
  const cleanup = async () => { for (const id of users) ok(await admin.auth.admin.deleteUser(id), "sprzątanie własnego testera"); };
  try {
    const tester = async label => {
      const email = `t15e-${label}-${randomUUID()}@example.invalid`, password = randomUUID();
      const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true })); users.push(user.id);
      ok(await admin.from("profiles").insert({ id: user.id, time_zone: "Europe/Warsaw" }));
      const jar = new Map();
      const client = createServerClient(url, key, { cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: values => values.forEach(({ name, value }) => jar.set(name, value)) } });
      ok(await client.auth.signInWithPassword({ email, password }));
      return { id: user.id, client, jar, cookie: [...jar].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; ") };
    };
    const a = await tester("a"), b = await tester("b");
    const externalId = randomUUID(), bodyweightId = randomUUID();
    const info = [{ id: externalId, owner_id: a.id, name: "Przysiad T15E", equipment: "sztanga", load_mode: "external" }, { id: bodyweightId, owner_id: a.id, name: "Podciąganie T15E", equipment: "drążek", load_mode: "bodyweight" }];
    if (bulk) info.push(...Array.from({ length: 501 }, (_, i) => ({ id: randomUUID(), owner_id: a.id, name: `Katalog T15E ${i}`, equipment: null, load_mode: "external" })));
    ok(await admin.from("exercises").insert(info));
    const maximaBefore = ok(await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: externalId, value_kg: 150, effective_on: "2026-01-01" }).select("*"));
    const target = { position: 1, kind: "work", repsMin: 3, repsMax: 3, isAmrap: false, loadType: "absolute", targetKg: 100, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, distanceMeters: null, restSeconds: 60, tempo: null, targetRpe: null, targetRir: null, note: null };
    const exercise = (id, name, sets) => ({ exerciseId: id, name, variant: null, equipment: id === externalId ? "sztanga" : "drążek", supersetGroup: null, note: null, sets });
    const doc = { name: "Plan T15E", sessions: [{ weekNumber: 1, dayLabel: "A", note: null, exercises: [exercise(externalId, "Przysiad T15E", [target]), exercise(externalId, "Przysiad T15E", [target]), exercise(bodyweightId, "Podciąganie T15E", [{ ...target, loadType: "bodyweight", targetKg: null, bodyweightAdjustment: "none", repsMin: 8, repsMax: 8 }])] }] };
    const plan = ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: doc }));
    const day = ok(await a.client.from("plan_sessions").select("id").eq("plan_version_id", plan.versionId).single());
    const command = async (workoutId, revision, action, payload) => ok(await a.client.rpc("apply_workout_command", { p_operation_id: randomUUID(), p_workout_id: workoutId, p_expected_revision: revision, p_action: action, p_payload: payload }));
    const started = await command(null, 0, "start", { planSessionId: day.id, performedOn: "2026-10-01" });
    const original = ok(await a.client.from("performed_exercises").select("*").eq("workout_session_id", started.workoutId).order("position"));
    const originalSets = ok(await a.client.from("performed_sets").select("*").in("performed_exercise_id", original.map(e => e.id)).order("id"));
    const save = (set, reps, kg) => ({ setId: set.id, status: "completed", actualReps: reps, actualKg: kg, actualDurationSeconds: null, actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: null });
    let revision = 1;
    for (const set of originalSets) await command(started.workoutId, revision++, "save_set", save(set, set.exercise_id === bodyweightId ? 8 : 3, set.exercise_id === bodyweightId ? null : 100));
    await command(started.workoutId, revision, "finish", {});
    const snapshotsBefore = ok(await a.client.from("performed_sets").select("*").in("performed_exercise_id", original.map(e => e.id)).order("id"));
    const clones = [
      { id: randomUUID(), date: "2020-01-01", kg: 200, at: null, status: "completed" },
      { id: randomUUID(), date: "2026-10-01", kg: 105, at: "2026-10-01T16:00:00Z", status: "abandoned" },
      { id: randomUUID(), date: "2026-10-08", kg: 0, at: "2026-10-08T12:00:00Z", status: "completed" },
    ];
    if (overlap) clones.push({ id: randomUUID(), date: "2026-10-01", kg: 100, at: null, status: "completed" });
    if (bulk) clones.push(...Array.from({ length: 501 }, () => ({ id: randomUUID(), date: "2026-01-01", kg: 50, at: null, status: "completed" })));
    const insertBatches = async (table, rows) => { for (let index = 0; index < rows.length; index += 100) ok(await admin.from(table).insert(rows.slice(index, index + 100)), table); };
    await insertBatches("workout_sessions", clones.map(c => ({ id: c.id, owner_id: a.id, plan_version_id: plan.versionId, plan_session_id: day.id, performed_on: c.date, snapshot_on: c.date, performed_at: c.at, performed_time_zone: c.at ? "Europe/Warsaw" : null, status: c.status, revision: 1 })));
    const blocks = [], sets = [];
    for (const clone of clones) for (const originalBlock of original) {
      const id = randomUUID(); blocks.push({ ...originalBlock, id, workout_session_id: clone.id });
      for (const old of originalSets.filter(s => s.performed_exercise_id === originalBlock.id)) sets.push({ ...old, id: randomUUID(), performed_exercise_id: id, status: "completed", actual_kg: old.exercise_id === bodyweightId ? null : clone.kg, actual_reps: old.exercise_id === bodyweightId ? 12 : 3 });
    }
    // Wielka pojedyncza sesja oraz wielki pojedynczy blok wymagają stronicowania dzieci.
    if (bulk) {
      for (let index = 0; index < 501; index++) {
        const block = { ...original[0], id: randomUUID(), workout_session_id: clones[3].id, position: index + 4 }; blocks.push(block);
        sets.push({ ...originalSets.find(s => s.performed_exercise_id === original[0].id), id: randomUUID(), performed_exercise_id: block.id, status: "completed", actual_kg: 1, actual_reps: 1 });
      }
      const oneBlock = blocks.find(b => b.workout_session_id === clones[3].id && b.position === 1);
      for (let index = 0; index < 501; index++) sets.push({ ...originalSets.find(s => s.performed_exercise_id === original[0].id), id: randomUUID(), performed_exercise_id: oneBlock.id, status: "completed", position: index + 2, actual_kg: 1, actual_reps: 1 });
    }
    await insertBatches("performed_exercises", blocks); await insertBatches("performed_sets", sets);
    return { a, b, admin, externalId, bodyweightId, original, originalSets, started, snapshotsBefore, maximaBefore, clones, cleanup, command, save,
      anon: createClient(url, key, clientOptions), url };
  } catch (error) { await cleanup(); throw error; }
}
export const readPage = (path, cookie = "") => fetch(`${base}${path}`, { headers: { cookie }, redirect: "manual" });
function card(html, metric) { return html.match(new RegExp(`<article[^>]*data-metric="${metric}"[^>]*>([\\s\\S]*?)<\\/article>`))?.[1].replace(/<[^>]*>/g, ""); }
async function run() {
  const f = await fixture({ bulk: true });
  try {
    const response = await readPage(`/postep?exercise=${f.externalId}&from=2026-10-01&to=2026-10-01`, f.a.cookie);
    assert.equal(response.status, 200); const html = await response.text();
    const history = html.match(/<section data-progress-history="true">([\s\S]*?)<\/section>/)?.[1];
    assert.ok(history?.includes("2026-10-01")); assert.ok(!history.includes("2020-01-01"));
    assert.match(card(html, "maxWeight"), /200 kg/); assert.match(card(html, "maxWeight"), /2020/);
    assert.match(card(html, "estimatedMax"), /212,8 kg/);
    for (const set of f.originalSets) assert.ok(html.includes(set.id), "zachowane źródło serii");
    const allResponse = await readPage(`/postep?exercise=${f.externalId}&from=2020-01-01&to=2026-10-18`, f.a.cookie);
    const allHtml = await allResponse.text();
    assert.equal([...allHtml.matchAll(/<option value=/g)].length, 503, "pełny katalog przekracza500");
    // 505 prawdziwych sesji × po jednym punkcie dla katalogu mimo dwóch bloków.
    const markerCount = [...allHtml.matchAll(/data-chart-point="true"/g)].length;
    assert.equal(markerCount, 505, "wszystkie sesje >500; powtórzone bloki złączone");
    assert.ok(allHtml.includes(f.clones.at(-1).id), "ostatnia strona sesji");
    // Wielka sesja:2×50×3 +501×1 +501×1 =1302; PR objętości musi pochodzić z niej.
    assert.match(card(allHtml, "volume"), /1[\s\u00a0]?302 kg/);
    const bResponse = await readPage(`/postep?exercise=${f.externalId}`, f.b.cookie); assert.equal(bResponse.status, 200);
    const bHtml = await bResponse.text(); assert.ok(!bHtml.includes("Przysiad T15E")); assert.ok(!bHtml.includes(f.started.workoutId));
    const anonymous = await readPage("/postep"); assert.ok([307, 308].includes(anonymous.status)); assert.match(anonymous.headers.get("location"), /logowanie/);
    for (const table of ["workout_read_model", "performed_exercises", "performed_sets", "exercises"]) {
      assert.deepEqual(ok(await f.b.client.from(table).select("id").eq("owner_id", f.a.id)), []);
      const anon = await f.anon.from(table).select("id").eq("owner_id", f.a.id); assert.ok(anon.error || anon.data.length === 0);
    }
    const corrected = f.originalSets.find(s => s.exercise_id === f.externalId);
    const latest = ok(await f.a.client.from("workout_sessions").select("revision").eq("id", f.started.workoutId).single());
    await f.command(f.started.workoutId, latest.revision, "save_set", f.save(corrected, 1, 250));
    const afterHtml = await (await readPage(`/postep?exercise=${f.externalId}&from=2026-10-01&to=2026-10-01`, f.a.cookie)).text();
    assert.match(card(afterHtml, "maxWeight"), /250 kg/); assert.match(card(afterHtml, "estimatedMax"), /250 kg/);
    const after = ok(await f.a.client.from("performed_sets").select("*").in("performed_exercise_id", f.original.map(e => e.id)).order("id"));
    const snapshots = rows => rows.map(row => Object.fromEntries(Object.entries(row).filter(([name]) => name.includes("snapshot") || name === "one_rep_max_record_id")));
    assert.deepEqual(snapshots(after), snapshots(f.snapshotsBefore));
    assert.deepEqual(ok(await f.a.client.from("one_rep_max_records").select("*")), f.maximaBefore, "szacunek nie zmienia rzeczywistego1RM profilu");
    console.log("T15-E API PASS:505 sesji,503 katalogu,>500 dzieci,PR all-time mimo filtra,źródła,2 bloki→1 punkt,korekta,snapshoty,1RM,A/B/anon.");
  } finally { await f.cleanup(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await run();

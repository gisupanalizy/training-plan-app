import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
if (!url || !key || !adminKey) throw new Error("Brak lokalnej konfiguracji.");
const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(url, adminKey, options);
const anon = createClient(url, key, options);
const users = [];
const password = `T08-${randomUUID()}-haslo`;
function ok(result, label) { assert.ifError(result.error, `${label}: ${result.error?.message}`); return result.data; }
async function tester(label) {
  const email = `t08-${label}-${randomUUID()}@example.invalid`;
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), `konto ${label}`);
  users.push(user.id);
  const client = createClient(url, key, options);
  ok(await client.auth.signInWithPassword({ email, password }), `logowanie ${label}`);
  ok(await client.from("profiles").insert({ id: user.id }), `profil ${label}`);
  return { client, id: user.id, email };
}
async function cookie(email) {
  const jar = new Map();
  const client = createServerClient(url, key, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (items) => items.forEach(({ name, value }) => jar.set(name, value)),
  } });
  ok(await client.auth.signInWithPassword({ email, password }), "sesja HTTP");
  return [...jar].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; ");
}
async function page(path, sessionCookie) {
  return fetch(`${process.env.T08_HTTP_BASE}${path}`, { headers: { cookie: sessionCookie }, redirect: "manual" });
}
const set = (position, loadType, targetKg) => ({ position, kind: "work", repsMin: 5, repsMax: null, isAmrap: false,
  loadType, targetKg, targetPercent: null, bodyweightAdjustment: loadType === "bodyweight" ? "assistance" : null,
  bodyweightDeltaKg: loadType === "bodyweight" ? 20 : null, dumbbellBasis: null, durationSeconds: null,
  distanceMeters: null, restSeconds: null, tempo: null, targetRpe: null, targetRir: null, note: null });
const document = { name: "T08 syntetyczny", sessions: [{ weekNumber: 1, dayLabel: "A", note: null, exercises: [
  { exerciseId: null, name: "Przysiad", variant: "high bar", equipment: "sztanga", supersetGroup: null,
    note: null, sets: [set(1, "absolute", 100), set(2, "absolute", 110), set(3, "absolute", 100)] },
  { exerciseId: null, name: "Podciąganie", variant: "asysta", equipment: null, supersetGroup: null,
    note: null, sets: [set(1, "bodyweight", null)] },
] }] };
const command = (client, workoutId, expectedRevision, action, payload) => client.rpc("apply_workout_command", {
  p_operation_id: randomUUID(), p_workout_id: workoutId, p_expected_revision: expectedRevision, p_action: action, p_payload: payload,
});
const result = (setId, reps, kg, status = "completed") => ({ setId, status, actualReps: reps, actualKg: kg,
  actualDurationSeconds: null, actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: null });

async function run() {
  const a = await tester("a");
  const b = await tester("b");
  const plan = ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null,
    p_expected_version_id: null, p_document: document }), "plan");
  const day = ok(await a.client.from("plan_sessions").select("id").eq("plan_version_id", plan.versionId).single(), "dzień");
  const start = ok(await command(a.client, null, 0, "start", { planSessionId: day.id, performedOn: "2026-10-01" }), "start");
  const performed = ok(await a.client.from("performed_exercises").select("id,exercise_id")
    .eq("owner_id", a.id).eq("workout_session_id", start.workoutId).order("position"), "ćwiczenia");
  const squatSets = ok(await a.client.from("performed_sets").select("id").eq("owner_id", a.id)
    .eq("performed_exercise_id", performed[0].id).order("position"), "serie przysiadu");
  const assisted = ok(await a.client.from("performed_sets").select("id").eq("owner_id", a.id)
    .eq("performed_exercise_id", performed[1].id).single(), "seria asysty");
  ok(await command(a.client, start.workoutId, 1, "save_set", result(squatSets[0].id, 5, 100)), "5 × 100");
  ok(await command(a.client, start.workoutId, 2, "save_set", result(squatSets[1].id, 4, 110)), "4 × 110");
  ok(await command(a.client, start.workoutId, 3, "save_set", result(squatSets[2].id, null, null, "skipped")), "pominięcie");
  ok(await command(a.client, start.workoutId, 4, "save_set", result(assisted.id, 8, 20)), "asysta");
  ok(await command(a.client, start.workoutId, 5, "finish", {}), "koniec");
  const later = ok(await command(a.client, null, 0, "start", { planSessionId: day.id, performedOn: "2026-10-08" }), "drugi trening");
  ok(await command(a.client, later.workoutId, 1, "finish", {}), "koniec drugiego treningu");
  const read = async (client) => ok(await client.from("performed_sets")
    .select("id,status,source_kind,target_load_type_snapshot,actual_reps,actual_kg")
    .eq("performed_exercise_id", performed[0].id).order("position"), "odczyt serii");
  const before = await read(a.client);
  assert.equal(before.filter((item) => item.status === "completed").reduce((sum, item) => sum + item.actual_reps * item.actual_kg, 0), 940);
  assert.equal(before.filter((item) => item.status === "skipped").length, 1);
  assert.equal(ok(await a.client.from("performed_sets").select("target_load_type_snapshot,actual_reps,actual_kg")
    .eq("id", assisted.id).single(), "asysta").target_load_type_snapshot, "bodyweight");
  if (process.env.T08_HTTP_BASE) {
    const aCookie = await cookie(a.email);
    const beforePage = await page(`/postep?exercise=${performed[0].exercise_id}&from=2026-10-01&to=2026-10-01`, aCookie);
    assert.equal(beforePage.status, 200);
    const beforeHtml = await beforePage.text();
    const filteredHistory = beforeHtml.match(/<section[^>]*data-progress-history="true"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(filteredHistory, "Filtrowana historia jest odrębną sekcją od rekordów all-time");
    assert.match(filteredHistory, /940 kg/);
    assert.doesNotMatch(filteredHistory, /2026-10-08/);
    const bPage = await page("/postep", await cookie(b.email));
    assert.equal(bPage.status, 200);
    assert.doesNotMatch(await bPage.text(), /Przysiad/);
    const anonymous = await page("/postep", "");
    assert.ok([307, 308].includes(anonymous.status));
    assert.match(anonymous.headers.get("location") ?? "", /logowanie/);
  }
  ok(await command(a.client, start.workoutId, 6, "save_set", result(squatSets[0].id, 7, 100)), "poprawka historii");
  const after = await read(a.client);
  assert.equal(after.filter((item) => item.status === "completed").reduce((sum, item) => sum + item.actual_reps * item.actual_kg, 0), 1140);
  if (process.env.T08_HTTP_BASE) {
    const afterPage = await page(`/postep?exercise=${performed[0].exercise_id}&from=2026-10-01&to=2026-10-01`, await cookie(a.email));
    assert.equal(afterPage.status, 200);
    const volume = (await afterPage.text()).match(/class="progress-volume">([\s\S]*?)<\/p>/)?.[1]
      ?.replace(/<[^>]*>/g, "");
    assert.ok(volume?.includes("140 kg"), `Objętość po poprawce: ${volume}`);
  }
  for (const table of ["workout_sessions", "performed_exercises", "performed_sets", "exercises"]) {
    assert.deepEqual(ok(await b.client.from(table).select("id").eq("owner_id", a.id), `B ${table}`), []);
    const anonymous = await anon.from(table).select("id").eq("owner_id", a.id);
    assert.ok(anonymous.error || anonymous.data?.length === 0, `anon ${table}`);
  }
  assert.ok((await b.client.from("performed_sets").select("id").eq("id", squatSets[0].id)).data?.length === 0);
  console.log("T08 lokalne Auth/PostgREST: 940 kg → poprawka → 1140 kg; pominięcie i asysta osobno; A/B/anon — OK");
}
try { await run(); }
finally { for (const id of users) { const { error } = await admin.auth.admin.deleteUser(id); if (error) console.error(`Nie usunięto testera ${id}: ${error.message}`); } }

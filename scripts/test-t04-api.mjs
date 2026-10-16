import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
if (!url || !key || !adminKey) throw new Error("Brak lokalnej konfiguracji Supabase.");
const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(url, adminKey, options);
const anon = createClient(url, key, options);
const users = [];
const password = `T04-${randomUUID()}-haslo`;
function ok(result, label) { assert.ifError(result.error, `${label}: ${result.error?.message}`); return result.data; }
async function tester(label) {
  const email = `t04-${label}-${randomUUID()}@example.invalid`;
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), `konto ${label}`);
  users.push(user.id);
  const client = createClient(url, key, options);
  ok(await client.auth.signInWithPassword({ email, password }), `logowanie ${label}`);
  ok(await client.from("profiles").insert({ id: user.id }), `profil ${label}`);
  return { client, id: user.id };
}
const set = (position, kind, targetPercent, repsMin) => ({ position, kind, repsMin, repsMax: null, isAmrap: false,
  loadType: "percent_1rm", targetKg: null, targetPercent, bodyweightAdjustment: null, bodyweightDeltaKg: null,
  dumbbellBasis: null, durationSeconds: null, distanceMeters: null, restSeconds: 120, tempo: null,
  targetRpe: null, targetRir: null, note: null });
const document = { name: "Plan A/B", sessions: [
  { weekNumber: 1, dayLabel: "A", note: "Dzień siłowy", exercises: [
    { exerciseId: null, name: "Przysiad testowy", variant: "high bar", equipment: "sztanga", supersetGroup: "S1", note: "Technika", sets: [set(1, "ramp", 60, 8), set(2, "work", 75, 6)] },
    { exerciseId: null, name: "Wiosłowanie testowe", variant: null, equipment: "hantle", supersetGroup: "S1", note: null, sets: [set(1, "work", 70, 10)] },
  ] },
  { weekNumber: 1, dayLabel: "B", note: null, exercises: [
    { exerciseId: null, name: "Martwy ciąg testowy", variant: null, equipment: "sztanga", supersetGroup: null, note: null, sets: [set(1, "work", 80, 5)] },
  ] },
] };
async function run() {
  const a = await tester("a");
  const b = await tester("b");
  const operationId = randomUUID();
  const params = { p_operation_id: operationId, p_plan_id: null, p_expected_version_id: null, p_document: document };
  const created = ok(await a.client.rpc("save_manual_plan", params), "utworzenie planu");
  assert.deepEqual(ok(await a.client.rpc("save_manual_plan", params), "retry"), created);
  assert.equal(ok(await a.client.from("plans").select("id").eq("id", created.planId), "jeden plan").length, 1);
  assert.ok((await a.client.rpc("save_manual_plan", { ...params, p_document: { ...document, name: "Inny" } })).error, "ten sam identyfikator z innym payloadem");
  assert.ok((await anon.rpc("save_manual_plan", { ...params, p_operation_id: randomUUID() })).error, "anon nie zapisuje");
  assert.ok((await b.client.rpc("save_manual_plan", { ...params, p_operation_id: randomUUID(), p_plan_id: created.planId, p_expected_version_id: created.versionId })).error, "B nie edytuje A");
  assert.deepEqual(ok(await b.client.from("plans").select("id").eq("id", created.planId), "B nie czyta A"), []);

  const sessions = ok(await a.client.from("plan_sessions").select("id,day_label,position").eq("plan_version_id", created.versionId).order("position"), "dni");
  assert.deepEqual(sessions.map((item) => item.day_label), ["A", "B"]);
  const exercises = ok(await a.client.from("planned_exercises").select("id,exercise_id,superset_group").eq("plan_session_id", sessions[0].id).order("position"), "ćwiczenia");
  assert.deepEqual(exercises.map((item) => item.superset_group), ["S1", "S1"]);
  const sets = ok(await a.client.from("planned_sets").select("set_kind,target_percent,reps_min").eq("planned_exercise_id", exercises[0].id).order("position"), "serie");
  assert.deepEqual(sets.map((item) => [item.set_kind, item.target_percent, item.reps_min]), [["ramp", 60, 8], ["work", 75, 6]]);
  assert.ok((await a.client.from("plan_sessions").update({ note: "atak" }).eq("id", sessions[0].id)).error, "opublikowany dzień jest niezmienny");

  const maxOperation = randomUUID();
  const maximum = ok(await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: exercises[0].exercise_id, value_kg: 120, effective_on: "2026-01-01", client_operation_id: maxOperation }).select("id").single(), "1RM 120");
  assert.ok((await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: exercises[0].exercise_id, value_kg: 120, effective_on: "2026-01-01", client_operation_id: maxOperation })).error, "ponowienie zapisu 1RM nie tworzy duplikatu");
  assert.equal(ok(await a.client.from("one_rep_max_records").select("id").eq("client_operation_id", maxOperation), "jeden rekord 1RM").length, 1);
  ok(await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: exercises[0].exercise_id, value_kg: 123, effective_on: "2026-06-01" }), "1RM 123");
  assert.ok((await b.client.from("one_rep_max_records").insert({ owner_id: b.id, exercise_id: exercises[0].exercise_id, value_kg: 999, effective_on: "2026-07-01" })).error, "B nie zapisuje 1RM A");
  assert.deepEqual(ok(await b.client.from("one_rep_max_records").select("id").eq("exercise_id", exercises[0].exercise_id), "B nie czyta 1RM A"), []);
  assert.ok((await a.client.from("one_rep_max_records").update({ value_kg: 999 }).eq("id", maximum.id)).error, "historyczny 1RM nie jest nadpisywany");

  const updated = structuredClone(document);
  updated.name = "Plan A/B — nowy";
  updated.sessions[0].exercises[0].exerciseId = exercises[0].exercise_id;
  updated.sessions[0].exercises[1].exerciseId = exercises[1].exercise_id;
  const next = ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: created.planId, p_expected_version_id: created.versionId, p_document: updated }), "edycja");
  assert.notEqual(next.versionId, created.versionId);
  assert.equal(ok(await a.client.from("plan_versions").select("id").eq("plan_id", created.planId), "wersje").length, 2);
  assert.equal((await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: created.planId, p_expected_version_id: created.versionId, p_document: updated })).error?.code, "PT409", "stara rewizja konfliktuje bez pętli serializacji");
  const oldSet = ok(await a.client.from("planned_sets").select("target_percent").eq("planned_exercise_id", exercises[0].id).order("position"), "stare serie");
  assert.deepEqual(oldSet.map((item) => item.target_percent), [60, 75]);
  console.log("T04 API: A/B, rampa, superseria, retry, wersje, historia 1RM i izolacja A/B/anon — OK");
}
try { await run(); }
finally { for (const id of users) { const { error } = await admin.auth.admin.deleteUser(id); if (error) console.error(`Nie usunięto testera ${id}: ${error.message}`); } }

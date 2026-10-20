import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
if (!url || !key || !adminKey) throw new Error("Brak lokalnej konfiguracji Supabase.");
const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(url, adminKey, options);
const anon = createClient(url, key, options);
const users = [];
const password = `T12K-${randomUUID()}-haslo`;
const ok = (result, label) => { assert.ifError(result.error, `${label}: ${result.error?.message}`); return result.data; };
const set = (percent) => ({ position: 1, kind: "work", repsMin: 5, repsMax: 5, isAmrap: false, loadType: "percent_1rm",
  targetKg: null, targetPercent: percent, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null,
  durationSeconds: null, distanceMeters: null, restSeconds: 120, tempo: null, targetRpe: null, targetRir: null, note: null });
const exercise = (patch) => ({ exerciseId: null, identityId: null, variant: null, equipment: null, supersetGroup: null, note: null, sets: [set(75)], ...patch });
const plan = (name, item) => ({ name, sessions: [{ weekNumber: 1, dayLabel: "A", note: null, exercises: [item] }] });
async function tester(label) {
  const email = `t12k-${label}-${randomUUID()}@example.invalid`;
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), `konto ${label}`);
  users.push(user.id);
  const client = createClient(url, key, options);
  ok(await client.auth.signInWithPassword({ email, password }), `logowanie ${label}`);
  const profile = await client.from("profiles").insert({ id: user.id });
  if (profile.error && !/duplicate|already exists/i.test(profile.error.message)) throw new Error(`profil ${label}: ${profile.error.message}`);
  return { client, id: user.id, email };
}
const command = (client, operationId, workoutId, revision, action, payload) => client.rpc("apply_workout_command", {
  p_operation_id: operationId, p_workout_id: workoutId, p_expected_revision: revision, p_action: action, p_payload: payload,
});
async function run() {
  const { data: identityTable, error: identityTableError } = await admin.from("exercise_identities").select("id").limit(1);
  if (identityTableError) throw new Error(`Brak tabeli tożsamości: ${identityTableError.message}`);
  void identityTable;
  const a = await tester("a");
  const b = await tester("b");
  const bench = exercise({ name: "Bench press", originalName: "Bench press", canonicalKey: "bench-press", assignment: "exact" });
  const operation = randomUUID();
  const first = ok(await a.client.rpc("save_manual_plan", { p_operation_id: operation, p_plan_id: null, p_expected_version_id: null, p_document: plan("Plan wyciskania", bench) }), "pierwszy plan");
  assert.deepEqual(ok(await a.client.rpc("save_manual_plan", { p_operation_id: operation, p_plan_id: null, p_expected_version_id: null, p_document: plan("Plan wyciskania", bench) }), "retry"), first);
  assert.ok((await a.client.rpc("save_manual_plan", { p_operation_id: operation, p_plan_id: null, p_expected_version_id: null, p_document: plan("Inny plan", bench) })).error, "konflikt payloadu");
  const second = ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: plan("Drugi plan", { ...bench, originalName: "wyciskanie sztangi na ławce" }) }), "drugi plan");
  const planned = ok(await a.client.from("planned_exercises").select("exercise_id,display_name,original_name").in("plan_session_id",
    ok(await a.client.from("plan_sessions").select("id").in("plan_version_id", [first.versionId, second.versionId]), "sesje").map((row) => row.id)), "planowane");
  assert.equal(new Set(planned.map((row) => row.exercise_id)).size, 1, "jeden wiersz katalogu");
  assert.ok(planned.every((row) => row.display_name === "Wyciskanie sztangi leżąc"), "nazwa PL");
  assert.ok(planned.some((row) => row.original_name === "Bench press") && planned.some((row) => row.original_name === "wyciskanie sztangi na ławce"), "oryginały");
  const catalog = ok(await a.client.from("exercises").select("id,identity_id,name").eq("id", planned[0].exercise_id).single(), "katalog");
  const identities = ok(await a.client.from("exercise_identities").select("id,canonical_key").eq("canonical_key", "bench-press"), "tożsamości A");
  assert.equal(identities.length, 1);
  assert.equal(catalog.identity_id, identities[0].id);
  assert.ok((await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: plan("Zły sprzęt", { ...bench, equipment: "hantle" }) })).error, "sprzeczny sprzęt");
  assert.ok((await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: plan("Zły klucz", { ...bench, canonicalKey: "nie-ma-takiego" }) })).error, "obcy klucz");
  assert.ok((await b.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: plan("Cudza tożsamość", { ...bench, identityId: identities[0].id, canonicalKey: null, name: "Wyciskanie sztangi leżąc" }) })).error, "obce ID");
  assert.ok((await anon.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: plan("Anon", bench) })).error, "anon");
  const customOperation = randomUUID();
  const custom = exercise({ name: "Mój ruch specjalny", originalName: "Mój ruch specjalny", assignment: "custom" });
  ok(await a.client.rpc("save_manual_plan", { p_operation_id: customOperation, p_plan_id: null, p_expected_version_id: null, p_document: plan("Custom 1", custom) }), "custom 1");
  ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: plan("Custom 2", custom) }), "custom 2");
  const customIdentities = ok(await a.client.from("exercise_identities").select("id").is("canonical_key", null), "custom tożsamości");
  assert.equal(customIdentities.length, 1, "własna nazwa użyta ponownie");
  assert.equal(ok(await b.client.from("exercise_identities").select("id"), "B nie czyta A").length, 0);
  ok(await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: catalog.id, value_kg: 100, effective_on: "2026-01-01" }), "1RM 100");
  const day = ok(await a.client.from("plan_sessions").select("id").eq("plan_version_id", first.versionId).single(), "dzień");
  const started = ok(await command(a.client, randomUUID(), null, 0, "start", { planSessionId: day.id, performedOn: "2026-10-11" }), "start");
  const performed = ok(await a.client.from("performed_exercises").select("id,target_name_snapshot").eq("workout_session_id", started.workoutId).single(), "kopia");
  assert.equal(performed.target_name_snapshot, "Wyciskanie sztangi leżąc");
  const before = ok(await a.client.from("performed_sets").select("id,one_rep_max_kg_snapshot,rounded_target_kg_snapshot").eq("performed_exercise_id", performed.id).single(), "snapshot");
  assert.equal(Number(before.one_rep_max_kg_snapshot), 100);
  assert.equal(Number(before.rounded_target_kg_snapshot), 75);
  const sibling = ok(await admin.from("exercises").insert({ owner_id: a.id, name: "Wyciskanie sztangi leżąc", variant: null, equipment: "sztanga", is_custom: false, identity_id: identities[0].id }).select("id").single(), "bliźniaczy wiersz");
  ok(await admin.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: sibling.id, value_kg: 140, effective_on: "2026-06-01" }), "1RM bliźniaka");
  const unchanged = ok(await a.client.from("performed_sets").select("one_rep_max_kg_snapshot,rounded_target_kg_snapshot").eq("id", before.id).single(), "stary snapshot");
  assert.equal(Number(unchanged.one_rep_max_kg_snapshot), 100);
  assert.equal(Number(unchanged.rounded_target_kg_snapshot), 75);
  ok(await command(a.client, randomUUID(), started.workoutId, started.revision, "finish", {}), "zakończenie");
  const nextDay = ok(await a.client.from("plan_sessions").select("id").eq("plan_version_id", second.versionId).single(), "drugi dzień");
  const restarted = ok(await command(a.client, randomUUID(), null, 0, "start", { planSessionId: nextDay.id, performedOn: "2026-10-20" }), "nowy start");
  const nextExercise = ok(await a.client.from("performed_exercises").select("id").eq("workout_session_id", restarted.workoutId).single(), "nowa kopia");
  const joined = ok(await a.client.from("performed_sets").select("one_rep_max_kg_snapshot,rounded_target_kg_snapshot").eq("performed_exercise_id", nextExercise.id).single(), "snapshot nowej sesji");
  assert.equal(Number(joined.one_rep_max_kg_snapshot), 140);
  assert.equal(Number(joined.rounded_target_kg_snapshot), 105);
  console.log("T12-K API A/B/anon, retry, obcy klucz i wspólny 1RM: PASS");
}
try { await run(); }
finally { for (const id of users) { const { error } = await admin.auth.admin.deleteUser(id); if (error) console.error(`Nie usunięto testera ${id}: ${error.message}`); } }

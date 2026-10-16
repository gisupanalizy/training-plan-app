import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
if (!url || !key || !adminKey) throw new Error("Brak lokalnej konfiguracji.");
const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(url, adminKey, options);
const anon = createClient(url, key, options);
const users = [];
const password = `T05-${randomUUID()}-haslo`;
function ok(result, label) { assert.ifError(result.error, `${label}: ${result.error?.message}`); return result.data; }
async function tester(label) {
  const email = `t05-${label}-${randomUUID()}@example.invalid`;
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), `konto ${label}`);
  users.push(user.id);
  const client = createClient(url, key, options);
  ok(await client.auth.signInWithPassword({ email, password }), `logowanie ${label}`);
  ok(await client.from("profiles").insert({ id: user.id }), `profil ${label}`);
  return { client, id: user.id, email };
}
const plannedSet = (position, targetPercent) => ({ position, kind: "work", repsMin: 6, repsMax: null,
  isAmrap: false, loadType: "percent_1rm", targetKg: null, targetPercent,
  bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null,
  distanceMeters: null, restSeconds: 90, tempo: null, targetRpe: null, targetRir: null, note: "Cel z planu" });
const document = { name: "T05 Plan", sessions: [{ weekNumber: 1, dayLabel: "A", note: "Dzień A", exercises: [
  { exerciseId: null, name: "Przysiad testowy", variant: "high bar", equipment: "sztanga", supersetGroup: null,
    note: "Zalecenie", sets: [plannedSet(1, 75), plannedSet(2, 75)] },
  { exerciseId: null, name: "Wiosłowanie", variant: null, equipment: null, supersetGroup: null,
    note: null, sets: [plannedSet(1, 70)] },
] }] };
const command = (client, operationId, workoutId, expectedRevision, action, payload) =>
  client.rpc("apply_workout_command", { p_operation_id: operationId, p_workout_id: workoutId,
    p_expected_revision: expectedRevision, p_action: action, p_payload: payload });

async function run() {
  const a = await tester("a");
  const b = await tester("b");
  const created = ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(),
    p_plan_id: null, p_expected_version_id: null, p_document: document }), "plan");
  const day = ok(await a.client.from("plan_sessions").select("id").eq("plan_version_id", created.versionId).single(), "dzień");
  const exercises = ok(await a.client.from("planned_exercises").select("id,exercise_id").eq("plan_session_id", day.id).order("position"), "ćwiczenia");
  ok(await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: exercises[0].exercise_id,
    value_kg: 120, effective_on: "2026-01-01" }), "1RM 120");
  const maximum = ok(await a.client.from("one_rep_max_records").insert({ owner_id: a.id,
    exercise_id: exercises[0].exercise_id, value_kg: 123, effective_on: "2026-06-01" }).select("id").single(), "1RM 123");
  const startId = randomUUID();
  const startPayload = { planSessionId: day.id, performedOn: "2026-10-11" };
  const started = ok(await command(a.client, startId, null, 0, "start", startPayload), "start");
  assert.deepEqual(ok(await command(a.client, startId, null, 0, "start", startPayload), "retry start"), started);
  assert.equal(started.revision, 1);
  assert.equal((await command(a.client, startId, null, 0, "start", { ...startPayload, performedOn: "2026-10-10" })).error?.code, "PT409", "ten sam ID z innymi danymi — bez pętli serializacji");
  assert.ok((await command(a.client, randomUUID(), null, 0, "start", startPayload)).error, "druga aktywna sesja nie powstaje");
  assert.ok((await command(b.client, randomUUID(), started.workoutId, 1, "finish", {})).error, "B nie zmienia A");
  assert.ok((await command(anon, randomUUID(), started.workoutId, 1, "finish", {})).error, "anon nie zmienia A");
  assert.deepEqual(ok(await b.client.from("workout_sessions").select("id").eq("id", started.workoutId), "B nie czyta A"), []);
  const anonymousRead = await anon.from("workout_sessions").select("id").eq("id", started.workoutId);
  assert.ok(anonymousRead.error || anonymousRead.data?.length === 0, "anon nie czyta A");
  assert.ok((await a.client.from("performed_sets").update({ actual_reps: 999 }).eq("owner_id", a.id)).error, "bezpośredni DML zamknięty");
  const performed = ok(await a.client.from("performed_exercises").select("id,exercise_id,target_name_snapshot,target_note_snapshot")
    .eq("workout_session_id", started.workoutId).order("position"), "kopie ćwiczeń");
  assert.equal(performed[0].target_name_snapshot, "Przysiad testowy");
  assert.equal(performed[0].target_note_snapshot, "Zalecenie");
  let sets = ok(await a.client.from("performed_sets").select("*").eq("performed_exercise_id", performed[0].id).order("position"), "kopie serii");
  assert.equal(sets[0].one_rep_max_record_id, maximum.id);
  assert.equal(sets[0].one_rep_max_kg_snapshot, 123);
  assert.equal(sets[0].raw_target_kg_snapshot, 92.25);
  assert.equal(sets[0].rounded_target_kg_snapshot, 92.5);
  const noMax = ok(await a.client.from("performed_sets").select("target_percent_snapshot,one_rep_max_record_id,raw_target_kg_snapshot,rounded_target_kg_snapshot")
    .eq("performed_exercise_id", performed[1].id).single(), "brak 1RM");
  assert.equal(noMax.target_percent_snapshot, 70);
  assert.equal(noMax.one_rep_max_record_id, null);
  assert.equal(noMax.rounded_target_kg_snapshot, null);
  const savedId = randomUUID();
  const resultPayload = { setId: sets[0].id, status: "completed", actualReps: 6, actualKg: 92.5,
    actualDurationSeconds: null, actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: "Dobrze" };
  const saved = ok(await command(a.client, savedId, started.workoutId, 1, "save_set", resultPayload), "zapis serii");
  assert.deepEqual(ok(await command(a.client, savedId, started.workoutId, 1, "save_set", resultPayload), "timeout/retry"), saved);
  assert.equal((await command(a.client, randomUUID(), started.workoutId, 1, "comment", { comment: "stara karta" })).error?.code, "PT409", "stara rewizja konfliktuje bez pętli serializacji");
  assert.ok((await command(b.client, randomUUID(), started.workoutId, 2, "save_set", resultPayload)).error, "B nie zmienia serii A");
  const skip = ok(await command(a.client, randomUUID(), started.workoutId, 2, "save_set", { setId: sets[1].id,
    status: "skipped", actualReps: null, actualKg: null, actualDurationSeconds: null,
    actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: "Pominięto" }), "pominięcie");
  assert.equal(skip.revision, 3);
  const added = ok(await command(a.client, randomUUID(), started.workoutId, 3, "add_set", { exerciseId: performed[0].id }), "dodatkowa seria");
  assert.ok(added.setId);
  const extra = ok(await command(a.client, randomUUID(), started.workoutId, 4, "add_exercise", { name: "Podciąganie", variant: "neutralny" }), "dodatkowe ćwiczenie");
  assert.ok(extra.exerciseId);
  const extraSet = ok(await command(a.client, randomUUID(), started.workoutId, 5, "add_set", { exerciseId: extra.exerciseId }), "seria dodatkowego ćwiczenia");
  ok(await command(a.client, randomUUID(), started.workoutId, 6, "save_set", { ...resultPayload, setId: extraSet.setId,
    actualReps: 8, actualKg: null, actualNote: "Masa ciała" }), "wynik dodatkowy");
  ok(await command(a.client, randomUUID(), started.workoutId, 7, "comment", { comment: "Po treningu" }), "komentarz");
  const finished = ok(await command(a.client, randomUUID(), started.workoutId, 8, "finish", {}), "zakończenie");
  assert.equal(finished.revision, 9);
  assert.ok((await command(a.client, randomUUID(), started.workoutId, 9, "add_set", { exerciseId: performed[0].id })).error, "zamknięty trening bez nowych serii");
  ok(await command(a.client, randomUUID(), started.workoutId, 9, "save_set", { ...resultPayload, actualReps: 7, actualNote: "Poprawka" }), "poprawka historii");
  assert.equal(ok(await a.client.from("performed_sets").select("actual_reps").eq("id", sets[0].id).single(), "poprawiony wynik").actual_reps, 7);
  ok(await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: exercises[0].exercise_id,
    value_kg: 150, effective_on: "2026-10-12" }), "nowe 1RM");
  const changed = structuredClone(document);
  changed.name = "Nowa wersja";
  changed.sessions[0].exercises[0].exerciseId = exercises[0].exercise_id;
  changed.sessions[0].exercises[0].sets[0].targetPercent = 80;
  changed.sessions[0].exercises[1].exerciseId = exercises[1].exercise_id;
  ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: created.planId,
    p_expected_version_id: created.versionId, p_document: changed }), "nowa wersja planu");
  sets = ok(await a.client.from("performed_sets").select("target_percent_snapshot,rounded_target_kg_snapshot,one_rep_max_kg_snapshot")
    .eq("performed_exercise_id", performed[0].id).order("position"), "historia celów");
  assert.equal(sets[0].target_percent_snapshot, 75);
  assert.equal(sets[0].rounded_target_kg_snapshot, 92.5);
  assert.equal(sets[0].one_rep_max_kg_snapshot, 123);
  const fresh = createClient(url, key, options);
  ok(await fresh.auth.signInWithPassword({ email: a.email, password }), "ponowne logowanie");
  assert.equal(ok(await fresh.from("workout_sessions").select("status,revision").eq("id", started.workoutId).single(), "historia po logowaniu").revision, 10);
  assert.equal(ok(await fresh.from("performed_sets").select("id").eq("performed_exercise_id", performed[0].id), "serie po logowaniu").length, 3);
  assert.equal(ok(await fresh.from("workout_revisions").select("id").eq("workout_session_id", started.workoutId), "rewizje").length, 10);
  console.log("T05 API: pełna ścieżka, retry, rewizje, A/B/anon, niezmienne snapshoty, ponowne logowanie — OK");
}
try { await run(); }
finally { for (const id of users) { const { error } = await admin.auth.admin.deleteUser(id); if (error) console.error(`Nie usunięto testera ${id}: ${error.message}`); } }

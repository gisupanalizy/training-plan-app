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
const password = `T09-${randomUUID()}-haslo`;
function ok(result, label) { assert.ifError(result.error, `${label}: ${result.error?.message}`); return result.data; }
async function tester(label) {
  const email = `t09-${label}-${randomUUID()}@example.invalid`;
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
const plannedSet = { position: 1, kind: "work", repsMin: 6, repsMax: null, isAmrap: false,
  loadType: "absolute", targetKg: 100, targetPercent: null, bodyweightAdjustment: null,
  bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, distanceMeters: null,
  restSeconds: null, tempo: null, targetRpe: null, targetRir: null, note: null };
const document = { name: "Syntetyczny T09", sessions: [{ weekNumber: 1, dayLabel: "A", note: null,
  exercises: [{ exerciseId: null, name: "Przysiad", variant: null, equipment: null,
    supersetGroup: null, note: null, sets: [plannedSet] }] }] };
const command = (client, operationId, workoutId, revision, action, payload) => client.rpc("apply_workout_command", {
  p_operation_id: operationId, p_workout_id: workoutId, p_expected_revision: revision,
  p_action: action, p_payload: payload,
});
try {
  const a = await tester("a"); const b = await tester("b");
  const saved = ok(await a.client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null,
    p_expected_version_id: null, p_document: document }), "plan");
  const day = ok(await a.client.from("plan_sessions").select("id").eq("plan_version_id", saved.versionId).single(), "dzień");
  const started = ok(await command(a.client, randomUUID(), null, 0, "start", { planSessionId: day.id, performedOn: "2026-10-12" }), "start");
  const planned = ok(await a.client.from("performed_exercises").select("id").eq("workout_session_id", started.workoutId).single(), "ćwiczenie planu");
  const plannedSet = ok(await a.client.from("performed_sets").select("id").eq("performed_exercise_id", planned.id).single(), "seria planu");
  if (process.env.T09_HTTP_BASE) {
    const post = (sessionCookie, body) => fetch(`${process.env.T09_HTTP_BASE}/api/voice/interpret`, { method: "POST",
      headers: { "content-type": "application/json", ...(sessionCookie ? { cookie: sessionCookie } : {}) }, body: JSON.stringify(body), redirect: "manual" });
    const body = { scope: "workout", workoutId: started.workoutId, revision: 1, intent: "set", setId: plannedSet.id, text: "Pięć po sto" };
    assert.ok([303, 307, 401].includes((await post(null, body)).status), "anon HTTP");
    assert.equal((await post(await cookie(b.email), body)).status, 404, "B HTTP");
    const aCookie = await cookie(a.email);
    assert.equal((await post(aCookie, { ...body, revision: 0 })).status, 409, "stara rewizja HTTP");
    assert.equal((await post(aCookie, { ...body, setId: randomUUID() })).status, 404, "obca seria HTTP");
    assert.equal((await post(aCookie, body)).status, 503, "bez osobnego budżetu głosu brak płatnego API");
    const audioForm = new FormData(); audioForm.append("audio", new Blob([new Uint8Array(200)], { type: "audio/webm" }), "test.webm");
    const invalidAudio = await fetch(`${process.env.T09_HTTP_BASE}/api/voice/transcribe`, { method: "POST",
      headers: { cookie: aCookie }, body: audioForm, redirect: "manual" });
    assert.equal(invalidAudio.status, 400, "fałszywy WebM odrzucony przed wywołaniem dostawcy");
    console.log("T09 HTTP: PASS (A/B/anon, stara rewizja, cel, brak budżetu)");
  }
  const payload = { name: "Podciąganie", variant: "neutralny", voiceSets: [
    { actualReps: 8, actualKg: null }, { actualReps: 8, actualKg: null }, { actualReps: 8, actualKg: null },
  ] };
  const operationId = randomUUID();
  const extra = ok(await command(a.client, operationId, started.workoutId, 1, "add_exercise", payload), "ćwiczenie głosowe");
  assert.deepEqual(ok(await command(a.client, operationId, started.workoutId, 1, "add_exercise", payload), "retry"), extra);
  const sets = ok(await a.client.from("performed_sets").select("position,status,actual_reps,actual_kg")
    .eq("performed_exercise_id", extra.exerciseId).order("position"), "serie");
  assert.equal(sets.length, 3); assert.deepEqual(sets.map((set) => set.actual_reps), [8, 8, 8]);
  assert.ok(sets.every((set) => set.status === "completed" && set.actual_kg === null));
  assert.ok((await command(a.client, operationId, started.workoutId, 1, "add_exercise", { ...payload, name: "Inne" })).error, "zmiana payloadu przy retry");
  assert.ok((await command(a.client, randomUUID(), started.workoutId, 1, "comment", { comment: "spóźniona propozycja" })).error, "stara rewizja");
  assert.ok((await command(b.client, randomUUID(), started.workoutId, 2, "add_exercise", payload)).error, "B nie może zmieniać A");
  assert.ok((await command(anon, randomUUID(), started.workoutId, 2, "add_exercise", payload)).error, "anon nie może zmieniać A");
  assert.ok((await command(a.client, randomUUID(), started.workoutId, 2, "add_exercise", { ...payload, voiceSets: [{ actualReps: -1, actualKg: null }] })).error, "błędne serie bez częściowego zapisu");
  assert.equal(ok(await a.client.from("performed_exercises").select("id").eq("workout_session_id", started.workoutId), "ćwiczenia").length, 2);
  assert.ok((await a.client.rpc("reserve_voice_attempt", { p_owner: a.id, p_budget_usd: 0.01 })).error, "klient nie rezerwuje budżetu");
  assert.equal(ok(await admin.rpc("reserve_voice_attempt", { p_owner: a.id, p_budget_usd: 0.01 }), "pierwsza rezerwacja"), true);
  assert.equal(ok(await admin.rpc("reserve_voice_attempt", { p_owner: b.id, p_budget_usd: 0.01 }), "limit globalny"), false);
  console.log("T09 lokalne Auth/PostgREST: PASS (A/B/anon, atomowe serie, retry, rewizja, budżet)");
} finally {
  for (const id of users) {
    await admin.from("voice_attempts").delete().eq("owner_id", id);
    await admin.auth.admin.deleteUser(id);
  }
}

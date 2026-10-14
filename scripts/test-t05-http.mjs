import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createServerClient } from "@supabase/ssr";

const fixture = JSON.parse(readFileSync(join(tmpdir(), "t05-ui-fixture.json"), "utf8"));
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
async function session() {
  const jar = new Map();
  const client = createServerClient(url, key, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (items) => items.forEach(({ name, value }) => jar.set(name, value)),
  } });
  const { error } = await client.auth.signInWithPassword({ email: fixture.email, password: fixture.password });
  assert.ifError(error);
  return [...jar].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; ");
}
async function request(path, cookie, options = {}) {
  return fetch(`http://localhost:3005${path}`, { ...options, headers: { cookie,
    ...(options.body ? { "content-type": "application/json" } : {}), ...options.headers } });
}
const cookie = await session();
const plan = await request(`/plany/${fixture.planId}`, cookie);
assert.equal(plan.status, 200, "plan po zalogowaniu");
const planHtml = await plan.text();
assert.match(planHtml, /Rozpocznij trening/);
const { data: authData, error: authError } = await createServerClient(url, key, { cookies: {
  getAll: () => cookie.split("; ").map((part) => { const [name, value] = part.split("="); return { name, value: decodeURIComponent(value) }; }), setAll: () => {},
} }).auth.getUser();
assert.ifError(authError);
assert.equal(authData.user.id, fixture.id);
const authClient = createServerClient(url, key, { cookies: {
  getAll: () => cookie.split("; ").map((part) => { const [name, value] = part.split("="); return { name, value: decodeURIComponent(value) }; }), setAll: () => {},
} });
const { data: version } = await authClient.from("plans").select("current_version_id").eq("id", fixture.planId).single();
const { data: sessions } = await authClient.from("plan_sessions").select("id").eq("plan_version_id", version.current_version_id);
const body = (operationId, workoutId, expectedRevision, action, payload) => JSON.stringify({ operationId, workoutId, expectedRevision, action, payload });
const startBody = body(randomUUID(), null, 0, "start", { planSessionId: sessions[0].id, performedOn: "2026-10-11" });
const startResponse = await request("/api/workouts", cookie, { method: "POST", body: startBody });
if (startResponse.status !== 200) console.error("Start:", startResponse.status, await startResponse.clone().text());
assert.equal(startResponse.status, 200);
const started = await startResponse.json();
const retry = await request("/api/workouts", cookie, { method: "POST", body: startBody });
assert.equal(retry.status, 200);
assert.deepEqual(await retry.json(), started);
const workoutPage = await request(`/trening/${started.workoutId}`, cookie);
assert.equal(workoutPage.status, 200);
assert.match(await workoutPage.text(), /Przysiad testowy/);
const resumedCookie = await session();
const resumed = await request(`/trening/${started.workoutId}`, resumedCookie);
assert.equal(resumed.status, 200);
assert.match(await resumed.text(), /Trening w toku/);
const { data: performed } = await authClient.from("performed_exercises").select("id").eq("workout_session_id", started.workoutId).single();
const { data: sets } = await authClient.from("performed_sets").select("id").eq("performed_exercise_id", performed.id).single();
const saved = await request("/api/workouts", cookie, { method: "POST", body: body(randomUUID(), started.workoutId, 1, "save_set", {
  setId: sets.id, status: "completed", actualReps: 6, actualKg: 90, actualDurationSeconds: null,
  actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: "HTTP E2E",
}) });
assert.equal(saved.status, 200);
const conflict = await request("/api/workouts", cookie, { method: "POST", body: body(randomUUID(), started.workoutId, 1, "finish", {}) });
assert.equal(conflict.status, 409);
const finished = await request("/api/workouts", cookie, { method: "POST", body: body(randomUUID(), started.workoutId, 2, "finish", {}) });
assert.equal(finished.status, 200);
const nextStart = await request("/api/workouts", cookie, { method: "POST", body: body(randomUUID(), null, 0, "start", { planSessionId: sessions[0].id, performedOn: "2026-10-12" }) });
assert.equal(nextStart.status, 200);
const nextWorkout = await nextStart.json();
const comparison = await request(`/trening/${nextWorkout.workoutId}`, cookie);
assert.equal(comparison.status, 200);
assert.match(await comparison.text(), /Poprzedni porównywalny wynik:.*6 powt.*90 kg/s);
const nextFinish = await request("/api/workouts", cookie, { method: "POST", body: body(randomUUID(), nextWorkout.workoutId, 1, "finish", {}) });
assert.equal(nextFinish.status, 200);
const nextCookie = await session();
const history = await request("/historia", nextCookie);
assert.equal(history.status, 200);
assert.match(await history.text(), /Zakończony/);
const detail = await request(`/trening/${started.workoutId}`, nextCookie);
assert.equal(detail.status, 200);
assert.match(await detail.text(), /HTTP E2E/);
const anonymous = await request(`/trening/${started.workoutId}`, "");
assert.match(anonymous.url, /\/logowanie/);
assert.doesNotMatch(await anonymous.text(), /HTTP E2E/);
console.log("T05 HTTP E2E: plan → start → zapis → konflikt → koniec → poprzedni wynik → ponowne logowanie → historia; anon odcięty — OK");

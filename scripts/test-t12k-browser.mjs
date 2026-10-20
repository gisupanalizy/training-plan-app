import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const { chromium } = await import(pathToFileURL(process.env.T12K_PLAYWRIGHT_MODULE).href);
const base = process.env.T12K_HTTP_BASE ?? "http://localhost:3024";
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const ok = (result, label) => { if (result.error) throw new Error(`${label}: ${result.error.message}`); return result.data; };
const users = [];
const set = { position: 1, kind: "work", repsMin: 5, repsMax: 5, isAmrap: false, loadType: "absolute", targetKg: 60, targetKgMax: null,
  targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, distanceMeters: null,
  restSeconds: 90, tempo: null, targetRpe: null, targetRir: null, note: null };
const document = { name: "Plan tożsamości", sessions: [{ weekNumber: 1, dayLabel: "A", note: null, exercises: [
  { exerciseId: null, name: "Bench press", originalName: "Bench press", canonicalKey: "bench-press", variant: null, equipment: null, supersetGroup: null, note: null, sets: [set] },
  { exerciseId: null, name: "Mój ruch specjalny", originalName: "Mój ruch specjalny", variant: null, equipment: null, supersetGroup: null, note: null, sets: [{ ...set, position: 1 }] },
] }] };
const browser = await chromium.launch({ headless: true, channel: "chrome" });
try {
  const email = `t12k-browser-${randomUUID()}@example.invalid`;
  const password = randomUUID();
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), "konto");
  users.push(user.id);
  const jar = new Map();
  const client = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: (entries) => entries.forEach(({ name, value }) => jar.set(name, value)) },
  });
  ok(await client.auth.signInWithPassword({ email, password }), "logowanie");
  const profile = await client.from("profiles").insert({ id: user.id });
  if (profile.error && !/duplicate|already exists/i.test(profile.error.message)) throw new Error(profile.error.message);
  const created = ok(await client.rpc("save_manual_plan", { p_operation_id: randomUUID(), p_plan_id: null, p_expected_version_id: null, p_document: document }), "plan");
  const day = ok(await client.from("plan_sessions").select("id").eq("plan_version_id", created.versionId).single(), "dzień");
  const started = ok(await client.rpc("apply_workout_command", { p_operation_id: randomUUID(), p_workout_id: null, p_expected_revision: 0, p_action: "start", p_payload: { planSessionId: day.id, performedOn: "2026-10-20" } }), "start");
  const performed = ok(await client.from("performed_exercises").select("id,exercise_id").eq("workout_session_id", started.workoutId).order("position"), "kopie");
  const series = ok(await client.from("performed_sets").select("id").eq("performed_exercise_id", performed[0].id).single(), "seria");
  ok(await client.rpc("apply_workout_command", { p_operation_id: randomUUID(), p_workout_id: started.workoutId, p_expected_revision: started.revision, p_action: "save_set", p_payload: { setId: series.id, status: "completed", actualReps: 5, actualKg: 60, actualDurationSeconds: null, actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: null } }), "zapis");
  ok(await client.rpc("apply_workout_command", { p_operation_id: randomUUID(), p_workout_id: started.workoutId, p_expected_revision: started.revision + 1, p_action: "finish", p_payload: {} }), "koniec");
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies([...jar].map(([name, value]) => ({ name, value: encodeURIComponent(value), url: base })));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/plany/edytor?plan=${created.planId}`);
  await page.getByRole("heading", { name: "Wyciskanie sztangi leżąc", exact: true }).waitFor();
  await page.getByText("W źródle: Bench press").waitFor();
  assert.equal(await page.locator('img[src="/exercise-assets/bench-press.svg"]').count(), 1);
  await page.getByRole("button", { name: "Dyktuj fragment planu" }).click();
  await page.getByRole("dialog", { name: "Dyktuj fragment planu" }).waitFor();
  await page.getByLabel("Transkrypcja lub tekst wpisany ręcznie").waitFor();
  await page.keyboard.press("Escape");
  await page.goto(`${base}/plany/import`);
  await page.getByLabel(/PDF \(do 20 stron\)/).waitFor();
  await page.goto(`${base}/postep`);
  const choices = await page.getByLabel("Ćwiczenie i wariant").locator("option").allTextContents();
  assert.equal(choices.filter((choice) => choice.startsWith("Wyciskanie sztangi leżąc")).length, 1, choices.join(" | "));
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log("T12-K przeglądarka: edytor, głos, import i postęp PASS");
} finally {
  await browser.close();
  for (const id of users) await admin.auth.admin.deleteUser(id);
}

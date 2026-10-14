import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: adminKey } = process.env;
if (!url || !key || !adminKey) throw new Error("Wymagane SUPABASE_URL, SUPABASE_ANON_KEY i SUPABASE_SERVICE_ROLE_KEY.");

const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(url, adminKey, options);
const anon = createClient(url, key, options);
const users = [];
const pass = `Test-${randomUUID()}-haslo`;
function ok(result, label) {
  assert.ifError(result.error, `${label}: ${result.error?.message}`);
  return result.data;
}
async function createTester(label) {
  const email = `t03-${label}-${randomUUID()}@example.invalid`;
  const { user } = ok(await admin.auth.admin.createUser({ email, password: pass, email_confirm: true }), `utworzenie ${label}`);
  users.push(user.id);
  const client = createClient(url, key, options);
  ok(await client.auth.signInWithPassword({ email, password: pass }), `Auth ${label}`);
  ok(await client.from("profiles").insert({ id: user.id }), `profil ${label}`);
  return { client, id: user.id };
}
async function run() {
  const a = await createTester("a");
  const b = await createTester("b");
  const stranger = await anon.auth.signUp({ email: `t03-nieproszony-${randomUUID()}@example.invalid`, password: pass });
  assert.ok(stranger.error, "Rejestracja bez zaproszenia powinna być wyłączona");

  // Fixture administracyjny: od T10 klient publikuje tylko przez RPC. Test zapisu RPC jest w T04/T10.
  const planA = ok(await admin.from("plans").insert({ owner_id: a.id, name: "A" }).select().single(), "plan A");
  const planB = ok(await admin.from("plans").insert({ owner_id: b.id, name: "B" }).select().single(), "plan B");
  const versionB = ok(await admin.from("plan_versions").insert({ owner_id: b.id, plan_id: planB.id, version_number: 1 }).select().single(), "wersja B");
  const exerciseB = ok(await admin.from("exercises").insert({ owner_id: b.id, name: "B" }).select().single(), "ćwiczenie B");
  const workoutA = ok(await admin.from("workout_sessions").insert({ owner_id: a.id, performed_on: "2026-10-11" }).select().single(), "wynik A (fixture administracyjny)");
  const workoutB = ok(await admin.from("workout_sessions").insert({ owner_id: b.id, performed_on: "2026-10-11" }).select().single(), "wynik B (fixture administracyjny)");

  for (const [owner, ownPlan, foreignPlan, ownWorkout, foreignWorkout] of [
    [a, planA, planB, workoutA, workoutB], [b, planB, planA, workoutB, workoutA],
  ]) {
    const plans = ok(await owner.client.from("plans").select("id"), "odczyt planów");
    assert.deepEqual(plans.map((row) => row.id), [ownPlan.id]);
    const workouts = ok(await owner.client.from("workout_sessions").select("id"), "odczyt wyników");
    assert.deepEqual(workouts.map((row) => row.id), [ownWorkout.id]);
    assert.equal((await owner.client.from("plans").update({ name: "atak" }).eq("id", foreignPlan.id)).error?.code, "42501", "bezpośrednia aktualizacja jest zamknięta");
    assert.deepEqual(ok(await owner.client.from("workout_sessions").select("id").eq("id", foreignWorkout.id), "cudzy wynik"), []);
  }
  for (const table of ["plans", "workout_sessions", "profiles"]) {
    const result = await anon.from(table).select("id");
    assert.ok(result.error || result.data?.length === 0, `anon odczytał ${table}`);
  }
  assert.ok((await a.client.from("plans").insert({ owner_id: b.id, name: "atak" })).error, "A tworzy plan B");
  assert.ok((await a.client.from("plan_versions").insert({ owner_id: a.id, plan_id: planB.id, version_number: 2 })).error, "A wskazuje cudzy plan");
  assert.ok((await a.client.from("plan_sessions").insert({ owner_id: a.id, plan_version_id: versionB.id, week_number: 1, day_label: "atak", position: 1 })).error, "A wskazuje cudzą wersję");
  assert.ok((await a.client.from("one_rep_max_records").insert({ owner_id: a.id, exercise_id: exerciseB.id, value_kg: 100, effective_on: "2026-10-11" })).error, "A wskazuje cudze ćwiczenie");
  assert.ok((await a.client.from("workout_sessions").insert({ owner_id: a.id, performed_on: "2026-10-11" })).error, "bezpośredni zapis wyników pozostaje zamknięty");

  const bucket = "training-private";
  const bucketInfo = ok(await admin.storage.getBucket(bucket), "konfiguracja bucketu");
  assert.equal(bucketInfo.public, false, "bucket nie jest prywatny");
  const pathA = `${a.id}/${randomUUID()}.txt`;
  const pathB = `${b.id}/${randomUUID()}.txt`;
  ok(await a.client.storage.from(bucket).upload(pathA, new Blob(["A"]), { contentType: "text/plain" }), "upload A");
  ok(await b.client.storage.from(bucket).upload(pathB, new Blob(["B"]), { contentType: "text/plain" }), "upload B");
  try {
    const ownA = ok(await a.client.storage.from(bucket).download(pathA), "odczyt pliku A");
    assert.equal(await ownA.text(), "A");
    const ownB = ok(await b.client.storage.from(bucket).download(pathB), "odczyt pliku B");
    assert.equal(await ownB.text(), "B");
    assert.ok((await a.client.storage.from(bucket).download(pathB)).error, "A czyta plik B");
    assert.ok((await b.client.storage.from(bucket).download(pathA)).error, "B czyta plik A");
    assert.ok((await anon.storage.from(bucket).download(pathA)).error, "anon czyta plik A");
    assert.ok((await b.client.storage.from(bucket).createSignedUrl(pathA, 60)).error, "B tworzy link do pliku A");
    const publicUrl = anon.storage.from(bucket).getPublicUrl(pathA).data.publicUrl;
    assert.notEqual((await fetch(publicUrl)).status, 200, "publiczny URL odsłonił prywatny plik");
    assert.ok((await a.client.storage.from(bucket).upload(`${b.id}/${randomUUID()}.txt`, new Blob(["atak"]))).error, "A zapisuje w katalogu B");
    assert.ok((await anon.storage.from(bucket).upload(`${a.id}/${randomUUID()}.txt`, new Blob(["atak"]))).error, "anon zapisuje plik");
    assert.equal(ok(await a.client.storage.from(bucket).list(b.id), "lista cudzego katalogu").length, 0);
    ok(await a.client.storage.from(bucket).remove([pathB]), "próba usunięcia pliku B");
    ok(await b.client.storage.from(bucket).download(pathB), "plik B po cudzej próbie usunięcia");
    assert.ok((await a.client.storage.from(bucket).move(pathA, `${b.id}/${randomUUID()}.txt`)).error, "A przenosi do katalogu B");
  } finally {
    await a.client.storage.from(bucket).remove([pathA]);
    await b.client.storage.from(bucket).remove([pathB]);
  }
  ok(await a.client.auth.signOut({ scope: "local" }), "wylogowanie A");
  const afterSignOut = await a.client.auth.getUser();
  assert.ok(afterSignOut.error || !afterSignOut.data.user, "A pozostaje zalogowany po wylogowaniu");

  const inviteEmail = `t03-zaproszenie-${randomUUID()}@example.invalid`;
  const { user: invited } = ok(await admin.auth.admin.inviteUserByEmail(inviteEmail), "zaproszenie testera");
  users.push(invited.id);
  let tokenHash;
  for (let i = 0; i < 20; i++) {
    const message = await fetch("http://127.0.0.1:54324/view/latest.html");
    if (message.ok) {
      const html = await message.text();
      tokenHash = html.match(/token_hash=([^&"<>]+)/)?.[1];
      if (tokenHash) break;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(tokenHash, "Mailpit nie odebrał linku zaproszenia");
  const invitedClient = createClient(url, key, options);
  ok(await invitedClient.auth.verifyOtp({ token_hash: tokenHash, type: "invite" }), "potwierdzenie zaproszenia");
  ok(await invitedClient.from("profiles").insert({ id: invited.id }), "profil zaproszonego");
  ok(await invitedClient.auth.updateUser({ password: pass }), "ustawienie hasła");
  ok(await invitedClient.auth.signOut({ scope: "local" }), "wylogowanie zaproszonego");
  ok(await invitedClient.auth.signInWithPassword({ email: inviteEmail, password: pass }), "ponowne logowanie zaproszonego");
  console.log("T03 Auth/API/Storage: zaproszenie, logowanie/wylogowanie, A/B/anon, cudze identyfikatory rodziców, pliki — OK");
}
try { await run(); }
finally { for (const id of users) await admin.auth.admin.deleteUser(id); }

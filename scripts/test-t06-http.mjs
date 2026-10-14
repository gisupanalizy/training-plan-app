import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import ExcelJS from "exceljs";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key, SUPABASE_SERVICE_ROLE_KEY: service } = process.env;
const options = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(url, service, options);
const users = [];
const paths = [];
function ok(result, label) { assert.ifError(result.error, `${label}: ${result.error?.message}`); return result.data; }
async function tester(label) {
  const email = `t06-http-${label}-${randomUUID()}@example.invalid`;
  const password = `T06-${randomUUID()}-haslo`;
  const { user } = ok(await admin.auth.admin.createUser({ email, password, email_confirm: true }), "konto");
  users.push(user.id);
  const client = createClient(url, key, options);
  ok(await client.auth.signInWithPassword({ email, password }), "logowanie");
  ok(await client.from("profiles").insert({ id: user.id }), "profil");
  const jar = new Map();
  const browserClient = createServerClient(url, key, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (items) => items.forEach(({ name, value }) => jar.set(name, value)),
  } });
  ok(await browserClient.auth.signInWithPassword({ email, password }), "cookies");
  const cookie = [...jar].map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join("; ");
  return { id: user.id, client, cookie };
}
const endpoint = (path, cookie, method = "GET", body) => fetch(`http://localhost:3006${path}`, {
  method, redirect: "manual", headers: { cookie, ...(body ? { "content-type": "application/json" } : {}) }, body: body && JSON.stringify(body),
});
const text = "A: Przysiad 4x6 75% 1RM";
const draft = { schema_version: 1, name: "Plan z mocka", warnings: [], unresolved_fields: [], sessions: [
  { week_number: 1, day_label: "A", note: null, exercises: [{ name: "Przysiad", variant: null, equipment: null,
    superset_group: null, note: null, source_ref: "tekst", sets: [{ kind: "work", reps_min: 6, reps_max: null,
      is_amrap: false, load_type: "percent_1rm", target_kg: null, target_percent: 75, note: null, source_ref: "tekst" }] }] },
] };
function editor() { return { name: "Plan z mocka", sessions: [{ weekNumber: 1, dayLabel: "A", note: null, exercises: [
  { exerciseId: null, name: "Przysiad", variant: null, equipment: null, supersetGroup: null, note: null, sets: [
    { position: 1, kind: "work", repsMin: 6, repsMax: null, isAmrap: false, loadType: "percent_1rm", targetKg: null, targetPercent: 75,
      bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, distanceMeters: null,
      restSeconds: null, tempo: null, targetRpe: null, targetRir: null, note: null },
  ] },
] }] }; }
try {
  const a = await tester("a");
  const b = await tester("b");
  assert.equal((await endpoint("/api/imports", "", "POST", { kind: "text", mime: "text/plain", size: 1, text: "a" })).status, 401);
  const created = await endpoint("/api/imports", a.cookie, "POST", { kind: "text", mime: "text/plain", size: Buffer.byteLength(text), text });
  assert.equal(created.status, 201, await created.clone().text());
  const job = (await created.json()).job;
  assert.equal((await endpoint(`/api/imports/${job.id}`, b.cookie)).status, 404);
  assert.equal((await endpoint(`/api/imports/${job.id}`, "")).status, 401);
  assert.equal((await endpoint(`/api/imports/${job.id}/process`, a.cookie, "POST")).status, 503, "brak budżetu i klucza blokuje AI");
  assert.equal((await endpoint(`/api/imports/${job.id}/approve`, a.cookie, "POST", { operationId: randomUUID(), document: editor() })).status, 409);
  ok(await admin.from("imports").update({ status: "needs_review", draft }).eq("id", job.id), "syntetyczny mock szkicu");
  const source = await endpoint(`/api/imports/${job.id}/source`, a.cookie);
  assert.equal(source.status, 200);
  assert.equal(await source.text(), text);
  assert.equal((await endpoint(`/api/imports/${job.id}/source`, b.cookie)).status, 404);
  assert.equal((await endpoint(`/api/imports/${job.id}/source`, "")).status, 401);
  assert.equal((await endpoint(`/api/imports/${job.id}`, b.cookie, "PATCH", { document: editor(), answers: {} })).status, 404);
  assert.equal((await endpoint(`/api/imports/${job.id}`, "", "PATCH", { document: editor(), answers: {} })).status, 401);
  const corrected = { ...editor(), name: "Poprawiony plan" };
  assert.equal((await endpoint(`/api/imports/${job.id}`, a.cookie, "PATCH", { document: corrected, answers: {} })).status, 200);
  const resumed = await endpoint(`/api/imports/${job.id}`, a.cookie);
  assert.equal((await resumed.json()).job.review_data.document.name, "Poprawiony plan", "odświeżenie przywraca korektę");
  const progress = { step: "structure", exercisesConfirmed: null, structureConfirmed: null };
  assert.equal((await endpoint(`/api/imports/${job.id}`, a.cookie, "PATCH", { document: corrected, answers: {}, progress })).status, 200);
  assert.deepEqual((await (await endpoint(`/api/imports/${job.id}`, a.cookie)).json()).job.review_data.progress, progress);
  assert.equal((await endpoint(`/api/imports/${job.id}`, b.cookie, "PATCH", { document: corrected, answers: {}, progress })).status, 404);
  assert.equal((await endpoint(`/api/imports/${job.id}`, "", "PATCH", { document: corrected, answers: {}, progress })).status, 401);
  assert.equal((await endpoint(`/api/imports/${job.id}`, a.cookie, "PATCH", { document: corrected, answers: {}, progress: { ...progress, step: "invalid" } })).status, 400);
  assert.equal((await endpoint(`/api/imports/${job.id}`, a.cookie, "PATCH", { document: corrected, answers: {} })).status, 200);
  assert.deepEqual((await (await endpoint(`/api/imports/${job.id}`, a.cookie)).json()).job.review_data.progress, progress, "starszy PATCH zachowuje krok");
  const operationId = randomUUID();
  const approved = await endpoint(`/api/imports/${job.id}/approve`, a.cookie, "POST", { operationId, document: editor() });
  assert.equal(approved.status, 200, await approved.clone().text());
  const result = await approved.json();
  const retried = await endpoint(`/api/imports/${job.id}/approve`, a.cookie, "POST", { operationId, document: editor() });
  assert.equal(retried.status, 200);
  assert.deepEqual(await retried.json(), result);
  assert.equal((await endpoint(`/api/imports/${job.id}/approve`, a.cookie, "POST", { operationId,
    document: { ...editor(), name: "Zmieniony" } })).status, 409);
  assert.equal((await endpoint(`/api/imports/${job.id}/cancel`, a.cookie, "POST")).status, 409);
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl1GAAAAABJRU5ErkJggg==", "base64");
  const fileRequest = await endpoint("/api/imports", a.cookie, "POST", { kind: "image", mime: "image/png", size: png.length });
  assert.equal(fileRequest.status, 201, await fileRequest.clone().text());
  const file = await fileRequest.json();
  paths.push(file.path);
  assert.equal((await endpoint(`/api/imports/${file.id}/upload`, b.cookie, "POST")).status, 404);
  ok(await admin.storage.from("training-imports").uploadToSignedUrl(file.path, file.token, new Blob([png], { type: "image/png" }), { contentType: "image/png" }), "upload PNG");
  assert.equal((await endpoint(`/api/imports/${file.id}/upload`, a.cookie, "POST")).status, 200);
  assert.equal((await endpoint(`/api/imports/${file.id}/process`, a.cookie, "POST")).status, 503);
  assert.equal((await endpoint(`/api/imports/${file.id}/cancel`, a.cookie, "POST")).status, 200);
  assert.equal((await endpoint(`/api/imports/${file.id}/source`, a.cookie)).status, 410);
  assert.equal((await endpoint("/api/imports", a.cookie, "POST", { kind: "image", mime: "image/heic", size: 100 })).status, 400);
  const bad = Buffer.from("niby PDF");
  const badRequest = await endpoint("/api/imports", a.cookie, "POST", { kind: "pdf", mime: "application/pdf", size: bad.length });
  assert.equal(badRequest.status, 201);
  const badJob = await badRequest.json();
  paths.push(badJob.path);
  ok(await admin.storage.from("training-imports").uploadToSignedUrl(badJob.path, badJob.token, new Blob([bad], { type: "application/pdf" }), { contentType: "application/pdf" }), "upload błędny");
  assert.equal((await endpoint(`/api/imports/${badJob.id}/upload`, a.cookie, "POST")).status, 422);
  assert.equal((await endpoint(`/api/imports/${badJob.id}/process`, a.cookie, "POST")).status, 409);
  const workbook = new ExcelJS.Workbook();
  workbook.addWorksheet("A").addRow(["Przysiad", "3 x 8"]);
  const xlsx = new Uint8Array(await workbook.xlsx.writeBuffer());
  const xlsxMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const xlsxRequest = await endpoint("/api/imports", a.cookie, "POST", { kind: "xlsx", mime: xlsxMime, size: xlsx.length });
  assert.equal(xlsxRequest.status, 201, await xlsxRequest.clone().text());
  const xlsxJob = await xlsxRequest.json();
  paths.push(xlsxJob.path);
  assert.match(xlsxJob.path, /\/source\.xlsx$/);
  ok(await admin.storage.from("training-imports").uploadToSignedUrl(xlsxJob.path, xlsxJob.token,
    new Blob([xlsx], { type: xlsxMime }), { contentType: xlsxMime }), "upload XLSX");
  assert.equal((await endpoint(`/api/imports/${xlsxJob.id}/upload`, a.cookie, "POST")).status, 200);
  const cells = await endpoint(`/api/imports/${xlsxJob.id}/source`, a.cookie);
  assert.equal(cells.status, 200);
  assert.match(await cells.text(), /A1=Przysiad/);
  assert.equal((await endpoint(`/api/imports/${xlsxJob.id}/source`, b.cookie)).status, 404);
  const grid = await endpoint(`/api/imports/${xlsxJob.id}/source?view=grid`, a.cookie);
  assert.equal(grid.status, 200); assert.match(grid.headers.get("cache-control"), /no-store/);
  assert.equal((await grid.json()).sheets[0].rows[0].cells[0].address, "A1");
  assert.equal((await endpoint(`/api/imports/${xlsxJob.id}/source?view=grid`, b.cookie)).status, 404);
  assert.equal((await endpoint(`/api/imports/${xlsxJob.id}/source?view=grid`, "")).status, 401);
  assert.equal((await endpoint(`/api/imports/${xlsxJob.id}/process`, a.cookie, "POST")).status, 503);
  assert.equal((await endpoint(`/api/imports/${xlsxJob.id}/cancel`, a.cookie, "POST")).status, 200);
  const unclear = await endpoint("/api/imports", a.cookie, "POST", { kind: "text", mime: "text/plain", size: Buffer.byteLength(text), text });
  assert.equal(unclear.status, 201);
  const unclearJob = (await unclear.json()).job;
  const emptyDraft = structuredClone(draft);
  emptyDraft.sessions[0].exercises[0].sets = [];
  ok(await admin.from("imports").update({ status: "needs_review", draft: emptyDraft,
    validation_issues: [{ path: "sessions.0.exercises.0.sets", code: "missing_sets", message: "Podaj liczbę serii." }] }).eq("id", unclearJob.id), "szkic do dopytania");
  const questionsResponse = await endpoint(`/api/imports/${unclearJob.id}`, a.cookie);
  assert.equal(questionsResponse.status, 200);
  const questions = (await questionsResponse.json()).questions;
  assert.equal(questions.length, 1);
  assert.equal(questions[0].answerType, "number");
  const clarifyOperation = randomUUID();
  assert.equal((await endpoint(`/api/imports/${unclearJob.id}/approve`, a.cookie, "POST", {
    operationId: clarifyOperation, document: editor(),
  })).status, 400);
  assert.equal((await endpoint(`/api/imports/${unclearJob.id}/approve`, a.cookie, "POST", {
    operationId: clarifyOperation, document: editor(), answers: { [questions[0].id]: 1 },
  })).status, 200);
  assert.equal((await endpoint("/api/imports/cleanup", "", "POST")).status, 401);
  const cleanup = await fetch("http://localhost:3006/api/imports/cleanup", { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } });
  assert.equal(cleanup.status, 200, await cleanup.clone().text());
  assert.ok((await cleanup.json()).deleted >= 1);
  assert.ok((await admin.storage.from("training-imports").info(file.path)).error, "anulowany plik usunięty");
  console.log("T06/T07 HTTP: A/B/anon, źródło, zapis korekty, podpisany upload, formaty, pytanie i retry zatwierdzenia — OK (szkic mock)");
} finally {
  for (const path of paths) await admin.storage.from("training-imports").remove([path]);
  for (const id of users) await admin.auth.admin.deleteUser(id);
}

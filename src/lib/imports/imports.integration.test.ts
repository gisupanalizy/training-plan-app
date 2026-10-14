// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { cleanupImports } from "./cleanup";
import { processImportJob, BUCKET } from "./server";
import { validateDraft, validateSource } from "./domain";
import { XLSX_MIME } from "./domain";
import type { ImportAdapter } from "./openai";
import ExcelJS from "exceljs";

const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey, SUPABASE_SERVICE_ROLE_KEY: serviceKey, T06_FIXTURE_DIR: dir } = process.env;
const enabled = Boolean(url && anonKey && serviceKey && dir);
const test = enabled ? it : it.skip;
const opts = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = enabled ? createClient(url!, serviceKey!, opts) : null;
const anon = enabled ? createClient(url!, anonKey!, opts) : null;
const users: string[] = [];
const paths: string[] = [];
const ok = <T>(result: { data: T; error: { message: string } | null }, label: string): NonNullable<T> => {
  if (result.error || result.data === null) throw new Error(`${label}: ${result.error?.message ?? "brak danych"}`);
  return result.data as NonNullable<T>;
};
async function tester(label: string) {
  const email = `t06-${label}-${randomUUID()}@example.invalid`;
  const password = `T06-${randomUUID()}-haslo`;
  const created = await admin!.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw new Error("Nie udało się utworzyć konta testowego.");
  const { user } = created.data;
  users.push(user.id);
  const client = createClient(url!, anonKey!, opts);
  const signedIn = await client.auth.signInWithPassword({ email, password });
  if (signedIn.error) throw signedIn.error;
  ok(await client.from("profiles").insert({ id: user.id }).select("id").single(), "profil");
  return { client, id: user.id };
}
async function createJob(owner: string, kind: string, mime: string, bytes: Uint8Array, text: string | null = null) {
  return ok(await admin!.rpc("create_import_job", { p_owner: owner, p_id: randomUUID(), p_kind: kind,
    p_mime: mime, p_size: bytes.length, p_text: text }), "create_import_job") as { id: string; source_path: string | null; status: string };
}
function draft() {
  return { schema_version: 1, name: "Syntetyczny plan", warnings: [], unresolved_fields: [], sessions: [
    { week_number: 1, day_label: "A", note: null, exercises: [{ name: "Przysiad", variant: null, equipment: null,
      superset_group: null, note: null, source_ref: "strona 1", sets: [{ kind: "work", reps_min: 6, reps_max: null,
        is_amrap: false, load_type: "percent_1rm", target_kg: null, target_percent: 75, note: null, source_ref: "strona 1" }] }] },
  ] };
}
const mock: ImportAdapter = async () => ({ draft: draft(), inputTokens: 12, outputTokens: 42 });
afterAll(async () => {
  if (!admin) return;
  for (const path of paths) await admin.storage.from(BUCKET).remove([path]);
  for (const id of users) await admin.auth.admin.deleteUser(id);
});
describe("T06 lokalny Auth/PostgREST/Storage — mock AI", () => {
  test("natywny XLSX przechodzi prywatny upload i daje szkic", async () => {
    const a = await tester("xlsx");
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("A").addRow(["Przysiad", "3 x 8"]);
    const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
    const job = await createJob(a.id, "xlsx", XLSX_MIME, bytes);
    expect(job.source_path).toMatch(/\/source\.xlsx$/);
    const signed = ok(await admin!.storage.from(BUCKET).createSignedUploadUrl(job.source_path!), "xlsx signed");
    paths.push(job.source_path!);
    ok(await a.client.storage.from(BUCKET).uploadToSignedUrl(job.source_path!, signed.token,
      new Blob([bytes], { type: XLSX_MIME }), { contentType: XLSX_MIME }), "xlsx upload");
    ok(await admin!.from("imports").update({ status: "uploaded" }).eq("id", job.id).select("id").single(), "xlsx uploaded");
    expect((await processImportJob(admin!, a.id, job.id, mock)).status).toBe(200);
    expect(ok(await admin!.from("imports").select("status").eq("id", job.id).single(), "xlsx draft").status).toBe("needs_review");
  });
  test("12 wygenerowanych źródeł PDF tekstowych, skanów, PNG, JPEG i tekstu przechodzi kontrolę formatu", async () => {
    const cases = JSON.parse(readFileSync(resolve(process.cwd(), "fixtures/t06/cases.json"), "utf8")) as { id: string; format: string }[];
    for (const item of cases) {
      const extension = item.format === "text" ? "txt" : item.format.startsWith("pdf") ? "pdf" : item.format === "png" ? "png" : "jpg";
      const kind = item.format === "text" ? "text" : item.format.startsWith("pdf") ? "pdf" : "image";
      const mime = extension === "txt" ? "text/plain" : extension === "pdf" ? "application/pdf" : extension === "png" ? "image/png" : "image/jpeg";
      await expect(validateSource(kind, mime, new Uint8Array(readFileSync(resolve(dir!, `${item.id}.${extension}`))))).resolves.toBeDefined();
    }
  });
  test("A/B/anon, retry, zatwierdzenie, anulowanie i sprzątanie", async () => {
    const a = await tester("a");
    const b = await tester("b");
    const content = "A: Przysiad 4x6 75% 1RM";
    const bytes = new TextEncoder().encode(content);
    const job = await createJob(a.id, "text", "text/plain", bytes, content);
    expect((await b.client.from("imports").select("id").eq("id", job.id)).data).toEqual([]);
    expect((await anon!.from("imports").select("id").eq("id", job.id)).data ?? []).toEqual([]);
    expect((await b.client.rpc("create_import_job", { p_owner: a.id, p_id: randomUUID(), p_kind: "text", p_mime: "text/plain", p_size: 3, p_text: "abc" })).error).toBeTruthy();
    expect((await b.client.from("imports").update({ status: "needs_review" }).eq("id", job.id)).error).toBeTruthy();
    expect((await b.client.rpc("approve_import_job", { p_id: job.id, p_operation_id: randomUUID(), p_document: validateDraft(draft()).document })).error).toBeTruthy();
    expect((await anon!.rpc("approve_import_job", { p_id: job.id, p_operation_id: randomUUID(), p_document: validateDraft(draft()).document })).error).toBeTruthy();
    expect((await processImportJob(admin!, b.id, job.id, mock)).status).toBe(404);
    const first = await processImportJob(admin!, a.id, job.id, mock);
    expect(first.status).toBe(200);
    expect((await processImportJob(admin!, a.id, job.id, mock)).status).toBe(200);
    expect(ok(await admin!.from("import_attempts").select("number").eq("import_id", job.id), "attempts")).toHaveLength(1);
    expect((await b.client.from("import_attempts").select("id").eq("import_id", job.id)).data).toEqual([]);
    const operation = randomUUID();
    const approved = ok(await a.client.rpc("approve_import_job", { p_id: job.id, p_operation_id: operation, p_document: validateDraft(draft()).document }), "approve");
    expect(ok(await a.client.rpc("approve_import_job", { p_id: job.id, p_operation_id: operation, p_document: validateDraft(draft()).document }), "retry approve")).toEqual(approved);
    expect((await a.client.rpc("approve_import_job", { p_id: job.id, p_operation_id: operation,
      p_document: { ...validateDraft(draft()).document, name: "Zmieniony plan" } })).error).toBeTruthy();
    expect((await a.client.rpc("approve_import_job", { p_id: job.id, p_operation_id: randomUUID(), p_document: validateDraft(draft()).document })).error).toBeTruthy();
    const version = ok(await a.client.from("plan_versions").select("source_kind").eq("id", approved.versionId).single(), "version");
    expect(version.source_kind).toBe("import");
    expect((await b.client.from("plans").select("id").eq("id", approved.planId)).data).toEqual([]);
    const image = new Uint8Array(readFileSync(resolve(dir!, "png-unknown-unit.png")));
    await validateSource("image", "image/png", image);
    const strayPath = `${a.id}/imports/${randomUUID()}/source.png`;
    expect((await a.client.storage.from(BUCKET).upload(strayPath, new Blob([image], { type: "image/png" }), { contentType: "image/png" })).error).toBeTruthy();
    const imageJob = await createJob(a.id, "image", "image/png", image);
    const signed = ok(await admin!.storage.from(BUCKET).createSignedUploadUrl(imageJob.source_path!), "signed upload");
    paths.push(imageJob.source_path!);
    ok(await admin!.storage.from(BUCKET).uploadToSignedUrl(imageJob.source_path!, signed.token, new Blob([image], { type: "image/png" }), { contentType: "image/png" }), "upload");
    expect((await b.client.storage.from(BUCKET).download(imageJob.source_path!)).error).toBeTruthy();
    expect((await anon!.storage.from(BUCKET).download(imageJob.source_path!)).error).toBeTruthy();
    const foreignRemoval = await b.client.storage.from(BUCKET).remove([imageJob.source_path!]);
    expect(foreignRemoval.error || (foreignRemoval.data?.length ?? 0) === 0).toBeTruthy();
    expect((await admin!.storage.from(BUCKET).info(imageJob.source_path!)).data).toBeTruthy();
    ok(await admin!.from("imports").update({ status: "uploaded" }).eq("id", imageJob.id).select("id").single(), "mark upload");
    expect((await processImportJob(admin!, a.id, imageJob.id, async () => { throw new Error("provider_retryable"); })).status).toBe(422);
    expect((await processImportJob(admin!, a.id, imageJob.id, mock)).status).toBe(200);
    expect(ok(await admin!.from("import_attempts").select("number,status").eq("import_id", imageJob.id).order("number"), "retry attempts").map((x) => x.status)).toEqual(["failed", "succeeded"]);
    const bad = new TextEncoder().encode("niby pdf");
    const pdfJob = await createJob(a.id, "pdf", "application/pdf", bad);
    const badSigned = ok(await admin!.storage.from(BUCKET).createSignedUploadUrl(pdfJob.source_path!), "bad signed");
    paths.push(pdfJob.source_path!);
    ok(await admin!.storage.from(BUCKET).uploadToSignedUrl(pdfJob.source_path!, badSigned.token, new Blob([bad], { type: "application/pdf" }), { contentType: "application/pdf" }), "bad upload");
    await expect(validateSource("pdf", "application/pdf", bad)).rejects.toThrow();
    expect((await processImportJob(admin!, a.id, pdfJob.id, mock)).status).toBe(409);
    ok(await admin!.from("imports").update({ status: "cancelled" }).eq("id", pdfJob.id).select("id").single(), "cancel bad");
    const cleaned = await cleanupImports(admin!);
    expect(cleaned.deleted).toBeGreaterThanOrEqual(1);
    expect((await admin!.storage.from(BUCKET).info(pdfJob.source_path!)).error).toBeTruthy();
    const late = await createJob(a.id, "text", "text/plain", bytes, content);
    let release!: () => void;
    const waiting: ImportAdapter = async () => { await new Promise<void>((resolve) => { release = resolve; }); return { draft: draft(), inputTokens: null, outputTokens: null }; };
    const pending = processImportJob(admin!, a.id, late.id, waiting);
    for (let i = 0; i < 50 && !release; i++) await new Promise((resolve) => setTimeout(resolve, 10));
    expect(release).toBeTypeOf("function");
    ok(await admin!.from("imports").update({ status: "cancelled", lease_token: null, lease_until: null }).eq("id", late.id).select("id").single(), "cancel late");
    release();
    expect((await pending).status).toBe(409);
    expect(ok(await admin!.from("imports").select("draft").eq("id", late.id).single(), "late draft").draft).toBeNull();
    const parallel = await createJob(a.id, "text", "text/plain", bytes, content);
    let releaseParallel!: () => void;
    const slow: ImportAdapter = async () => { await new Promise<void>((resolve) => { releaseParallel = resolve; }); return { draft: draft(), inputTokens: null, outputTokens: null }; };
    const firstParallel = processImportJob(admin!, a.id, parallel.id, slow);
    for (let i = 0; i < 50 && !releaseParallel; i++) await new Promise((resolve) => setTimeout(resolve, 10));
    expect((await processImportJob(admin!, a.id, parallel.id, mock)).status).toBe(409);
    releaseParallel();
    expect((await firstParallel).status).toBe(200);
    expect(ok(await admin!.from("import_attempts").select("number").eq("import_id", parallel.id), "single claim")).toHaveLength(1);
    const timed = await createJob(a.id, "text", "text/plain", bytes, content);
    const claim = ok(await admin!.rpc("claim_import_job", { p_owner: a.id, p_id: timed.id, p_model: "mock", p_prompt: "test", p_schema: 1, p_budget_usd: null }), "claim timeout");
    ok(await admin!.from("imports").update({ lease_until: new Date(Date.now() - 1000).toISOString() }).eq("id", timed.id).select("id").single(), "expire lease");
    expect((await processImportJob(admin!, a.id, timed.id, mock)).status).toBe(200);
    expect(ok(await admin!.rpc("finish_import_job", { p_owner: a.id, p_id: timed.id, p_token: claim.lease_token,
      p_draft: draft(), p_issues: [], p_error: null, p_input_tokens: null, p_output_tokens: null }), "late finish")).toBe(false);
    expect(ok(await admin!.from("import_attempts").select("status").eq("import_id", timed.id).order("number"), "timed attempts").map((x) => x.status)).toEqual(["timed_out", "succeeded"]);
    const budgetJob = await createJob(a.id, "text", "text/plain", bytes, content);
    const recent = ok(await admin!.from("import_attempts").select("id").neq("model", "mock").gt("started_at", new Date(Date.now() - 86400000).toISOString()), "existing budget reservations");
    const testBudget = (recent.length + 1) * 0.05 + 0.000001;
    expect((await admin!.rpc("claim_import_job", { p_owner: a.id, p_id: budgetJob.id, p_model: "gpt-6-luna", p_prompt: "test", p_schema: 1, p_budget_usd: 0.04 })).error).toBeTruthy();
    const reserved = ok(await admin!.rpc("claim_import_job", { p_owner: a.id, p_id: budgetJob.id, p_model: "gpt-6-luna", p_prompt: "synthetic-budget-only", p_schema: 1, p_budget_usd: testBudget }), "reserve budget");
    ok(await admin!.rpc("finish_import_job", { p_owner: a.id, p_id: budgetJob.id, p_token: reserved.lease_token,
      p_draft: null, p_issues: [], p_error: "synthetic_no_call", p_input_tokens: null, p_output_tokens: null }), "finish budget reservation");
    const otherBudgetJob = await createJob(b.id, "text", "text/plain", bytes, content);
    expect((await admin!.rpc("claim_import_job", { p_owner: b.id, p_id: otherBudgetJob.id, p_model: "gpt-6-luna", p_prompt: "test", p_schema: 1, p_budget_usd: testBudget })).error).toBeTruthy();
    ok(await admin!.from("imports").update({ status: "cancelled" }).eq("id", otherBudgetJob.id).select("id").single(), "cancel budget job");
    const expired = await createJob(a.id, "text", "text/plain", bytes, content);
    ok(await admin!.from("imports").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("id", expired.id).select("id").single(), "expire job");
    expect((await processImportJob(admin!, a.id, expired.id, mock)).status).toBe(409);
    expect((await admin!.rpc("claim_import_job", { p_owner: a.id, p_id: expired.id, p_model: "mock", p_prompt: "test", p_schema: 1, p_budget_usd: null })).error).toBeTruthy();
    ok(await admin!.from("imports").update({ status: "needs_review" }).eq("id", expired.id).select("id").single(), "prepare expired approval");
    expect((await a.client.rpc("approve_import_job", { p_id: expired.id, p_operation_id: randomUUID(), p_document: validateDraft(draft()).document })).error).toBeTruthy();
  }, 60_000);
});

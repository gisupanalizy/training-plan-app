// @vitest-environment node
import { expect, it } from "vitest";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { processImportJob, BUCKET } from "./server";
import { validateDraft } from "./domain";
import { MODEL, PROMPT_VERSION } from "./openai";
import { XLSX_MIME } from "./limits";

it.skipIf(!process.env.T06_REAL_STAGE)("T06-R1: rzeczywiste źródła przez prywatny Storage i processImportJob", async () => {
  const stage = process.env.T06_REAL_STAGE!;
  const path = `fixtures/t06/real/results/${stage}.json`;
  if (existsSync(path)) throw new Error("Raport już istnieje; wybierz nowy numer próby.");
  const budget = Number(process.env.OPENAI_IMPORT_BUDGET_USD);
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_IMPORT_ENABLED !== "true" || !(budget > 0 && budget <= 5)) throw new Error("Brak zatwierdzonego budżetu T06.");
  const url = process.env.SUPABASE_URL!;
  const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const recent = await admin.from("import_attempts").select("estimated_cost_usd").neq("model", "mock").gt("started_at", new Date(Date.now() - 86400000).toISOString());
  if (recent.error) throw new Error("Nie udało się sprawdzić rezerwacji budżetu.");
  const reserved = recent.data.length * 0.05;
  expect(reserved + 3 * 0.05).toBeLessThanOrEqual(budget);
  mkdirSync("fixtures/t06/real/results", { recursive: true });
  const rows: Record<string, unknown>[] = [];
  const report = () => writeFileSync(path, JSON.stringify({ stage, model: MODEL, prompt: PROMPT_VERSION, createdAt: new Date().toISOString(), budget, reservedBefore: reserved, transport: "rzeczywisty lokalny Auth/Storage/processImportJob; bez publikacji", rows }, null, 2));
  const filenames = ["Jakub O. (13.06.26) - spersonalizowany plan treningowy.pdf", "Trening FBW.xlsx", "TRENINGI_MADZIA.xlsx"];
  const selector = process.env.T06_REAL_ONLY;
  const selected = selector ? [filenames[["pdf", "fbw", "madzia"].indexOf(selector)]] : filenames;
  for (const name of selected) {
    const bytes = new Uint8Array(readFileSync(`fixtures/t06/real/${name}`));
    const password = randomUUID();
    const email = `t06-real-${randomUUID()}@example.invalid`;
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user) throw new Error("Nie udało się utworzyć konta próby.");
    const owner = created.data.user.id;
    const client = createClient(url, process.env.SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const login = await client.auth.signInWithPassword({ email, password });
    if (login.error) throw new Error("Logowanie testera nie powiodło się.");
    if ((await client.from("profiles").insert({ id: owner })).error) throw new Error("Brak profilu testowego.");
    const kind = name.endsWith("pdf") ? "pdf" : "xlsx";
    const mime = kind === "pdf" ? "application/pdf" : XLSX_MIME;
    const made = await admin.rpc("create_import_job", { p_owner: owner, p_id: randomUUID(), p_kind: kind, p_mime: mime, p_size: bytes.length, p_text: null });
    if (made.error) throw new Error("Nie udało się utworzyć importu.");
    const job = made.data;
    const signed = await admin.storage.from(BUCKET).createSignedUploadUrl(job.source_path);
    if (signed.error) throw new Error("Brak podpisanego uploadu.");
    const upload = await client.storage.from(BUCKET).uploadToSignedUrl(job.source_path, signed.data.token, new Blob([bytes], { type: mime }), { contentType: mime });
    if (upload.error) throw new Error("Upload się nie powiódł.");
    const ready = await admin.from("imports").update({ status: "uploaded" }).eq("id", job.id).eq("owner_id", owner);
    if (ready.error) throw new Error("Import niegotowy.");
    const start = performance.now();
    const result = await processImportJob(admin, owner, job.id);
    const saved = await admin.from("imports").select("draft,validation_issues").eq("id", job.id).single();
    const attempts = await admin.from("import_attempts").select("input_tokens,output_tokens,estimated_cost_usd,status,error_code").eq("import_id", job.id);
    let document = null;
    if (saved.data?.draft) document = validateDraft(saved.data.draft).document;
    const questions = "questions" in result.result ? result.result.questions : [];
    rows.push({ name, jobId: job.id, ownerId: owner, status: result.status, result: result.result, document, attempts: attempts.data, elapsedMs: Math.round(performance.now() - start) });
    report();
    console.log(JSON.stringify({ source: kind, status: result.status, sessions: document?.sessions.length, exercises: document?.sessions.reduce((n, s) => n + s.exercises.length, 0), questions: questions?.length, elapsedMs: rows.at(-1)!.elapsedMs }));
    // Zachowujemy próby przez zwykłą retencję; usunięcie testera wyzerowałoby licznik budżetu.
  }
  expect(rows.every((row) => row.status === 200)).toBe(true);
}, 480_000);

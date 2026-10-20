import { type SupabaseClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateDraft, validateSource, type ImportIssue, type SourceKind } from "./domain";
import { MODEL, PROMPT_VERSION, openaiImport, type ImportAdapter } from "./openai";
import { importQuestions } from "./questions";
import { mergeDraftParts, pdfPartRanges } from "./parts";

export const BUCKET = "training-imports";
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type Job = { id: string; owner_id: string; source_kind: SourceKind; mime_type: string; source_path: string | null;
  source_text: string | null; byte_size: number; status: string; attempt_number: number; lease_token: string | null; expires_at: string;
  draft: unknown; validation_issues: unknown; review_data: unknown; error_code: string | null };

export async function authContext() {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return null;
  return { userClient, user, admin: adminClient() };
}
export function adminClient(): SupabaseClient {
  return createAdminClient();
}
export async function ownedJob(admin: SupabaseClient, owner: string, id: string): Promise<Job | null> {
  const { data, error } = await admin.from("imports").select("*").eq("id", id).eq("owner_id", owner).maybeSingle();
  if (error) throw error;
  return data as Job | null;
}
export function jobQuestions(job: Job | null) {
  return job ? importQuestions(job.draft, Array.isArray(job.validation_issues) ? job.validation_issues as ImportIssue[] : []) : [];
}
export async function sourceBytes(admin: SupabaseClient, job: Job): Promise<Uint8Array> {
  if (job.source_kind === "text") return new TextEncoder().encode(job.source_text ?? "");
  if (!job.source_path) throw new Error("missing_source");
  const info = await admin.storage.from(BUCKET).info(job.source_path);
  if (info.error || !info.data || info.data.size !== job.byte_size || info.data.contentType !== job.mime_type) throw new Error("source_metadata_mismatch");
  const { data, error } = await admin.storage.from(BUCKET).download(job.source_path);
  if (error || !data) throw new Error("missing_source");
  return new Uint8Array(await data.arrayBuffer());
}
export async function processImportJob(admin: SupabaseClient, owner: string, id: string, adapter: ImportAdapter = openaiImport) {
  const before = await ownedJob(admin, owner, id);
  if (!before) return { status: 404, result: { error: "Nie znaleziono importu." } };
  if (new Date(before.expires_at).getTime() <= Date.now()) return { status: 409, result: { error: "Import wygasł." } };
  if (before.status === "needs_review") return { status: 200, result: { job: before, questions: jobQuestions(before) } };
  if (!["uploaded", "failed", "processing", "partial"].includes(before.status)) return { status: 409, result: { error: "Import nie jest gotowy do przetwarzania." } };
  if (adapter === openaiImport && (process.env.OPENAI_IMPORT_ENABLED !== "true" || !process.env.OPENAI_API_KEY || !(Number(process.env.OPENAI_IMPORT_BUDGET_USD) > 0)))
    return { status: 503, result: { error: "Import AI wymaga skonfigurowanego klucza i budżetu." } };
  let bytes: Uint8Array;
  try { bytes = await sourceBytes(admin, before); }
  catch { return { status: 422, result: { error: "Źródło importu nie jest dostępne lub ma zmieniony rozmiar." } }; }
  try { await validateSource(before.source_kind, before.mime_type, bytes); if (bytes.length !== before.byte_size) throw new Error("size_mismatch"); }
  catch { return { status: 422, result: { error: "Źródło nie przeszło kontroli formatu i wielkości." } }; }
  const { data: claimed, error: claimError } = await admin.rpc("claim_import_job", { p_owner: owner, p_id: id, p_model: adapter === openaiImport ? MODEL : "mock", p_prompt: PROMPT_VERSION, p_schema: 2, p_budget_usd: adapter === openaiImport ? Number(process.env.OPENAI_IMPORT_BUDGET_USD) : null });
  if (claimError || !claimed) return { status: claimError?.message?.includes("daily_budget") ? 429 : 409,
    result: { error: claimError?.message?.includes("daily_budget") ? "Dzienny budżet prób AI został wyczerpany." : "Import jest zajęty albo limit prób został wyczerpany." } };
  const job = claimed as Job;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120_000);
  let inputTokens: number | null = null;
  let outputTokens: number | null = null;
  try {
    if (job.source_kind === "pdf") {
      const pageCount = (await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false })).getPageCount();
      if (pageCount > 2) return await processPdfParts(admin, owner, job, bytes, pageCount, adapter, controller.signal);
    }
    const result = await adapter({ kind: job.source_kind, mime: job.mime_type, bytes }, controller.signal);
    inputTokens = result.inputTokens; outputTokens = result.outputTokens;
    const validated = validateDraft(result.draft);
    const { data: accepted, error } = await admin.rpc("finish_import_job", { p_owner: owner, p_id: id, p_token: job.lease_token,
      p_draft: result.draft, p_issues: validated.issues, p_error: null, p_input_tokens: result.inputTokens, p_output_tokens: result.outputTokens });
    if (error) throw error;
    if (!accepted) return { status: 409, result: { error: "Wynik wygasł lub import anulowano." } };
    const saved = await ownedJob(admin, owner, id);
    return { status: 200, result: { job: saved, questions: jobQuestions(saved) } };
  } catch (error) {
    const code = controller.signal.aborted ? "timeout" : error instanceof Error ? error.message : "unknown_error";
    await admin.rpc("finish_import_job", { p_owner: owner, p_id: id, p_token: job.lease_token, p_draft: null, p_issues: [], p_error: code.slice(0, 80), p_input_tokens: inputTokens, p_output_tokens: outputTokens });
    return { status: 422, result: { error: "Nie udało się przygotować szkicu.", code } };
  } finally { clearTimeout(timer); }
}

async function slicePdf(bytes: Uint8Array, pageFrom: number, pageTo: number) {
  const original = await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false });
  const split = await PDFDocument.create();
  const pages = await split.copyPages(original, Array.from({ length: pageTo - pageFrom + 1 }, (_, index) => pageFrom - 1 + index));
  pages.forEach((page) => split.addPage(page));
  return new Uint8Array(await split.save());
}

async function processPdfParts(admin: SupabaseClient, owner: string, job: Job, bytes: Uint8Array, pageCount: number, adapter: ImportAdapter, signal: AbortSignal) {
  const { data: existing, error: readError } = await admin.from("import_parts").select("part_index,page_from,page_to,status,draft").eq("import_id", job.id).eq("owner_id", owner).order("part_index");
  if (readError) throw readError;
  let parts = existing ?? [];
  if (!parts.length) {
    const created = pdfPartRanges(pageCount).map((part) => ({ owner_id: owner, import_id: job.id, part_index: part.partIndex, page_from: part.pageFrom, page_to: part.pageTo, status: "pending" }));
    const { error } = await admin.from("import_parts").insert(created);
    if (error) throw error;
    parts = created.map((part) => ({ ...part, draft: null }));
  }
  const pending = parts.find((part) => part.status !== "succeeded");
  if (!pending) return await finishPdfParts(admin, owner, job, parts);
  try {
    const slice = await slicePdf(bytes, pending.page_from, pending.page_to);
    const result = await adapter({ kind: "pdf", mime: "application/pdf", bytes: slice }, signal);
    const { error } = await admin.from("import_parts").update({ status: "succeeded", draft: result.draft, error_code: null }).eq("import_id", job.id).eq("owner_id", owner).eq("part_index", pending.part_index);
    if (error) throw error;
    const done = parts.filter((part) => part.status === "succeeded").length + 1;
    if (done < parts.length) {
      await admin.from("imports").update({ status: "partial", lease_token: null, lease_until: null, updated_at: new Date().toISOString() }).eq("id", job.id).eq("owner_id", owner);
      return { status: 202, result: { resume: true, progress: { done, total: parts.length } } };
    }
    return await finishPdfParts(admin, owner, job, parts.map((part) => part.part_index === pending.part_index ? { ...part, status: "succeeded", draft: result.draft } : part));
  } catch (error) {
    const code = signal.aborted ? "timeout" : error instanceof Error ? error.message : "unknown_error";
    await admin.from("import_parts").update({ status: "failed", error_code: code.slice(0, 80) }).eq("import_id", job.id).eq("owner_id", owner).eq("part_index", pending.part_index);
    await admin.rpc("finish_import_job", { p_owner: owner, p_id: job.id, p_token: job.lease_token, p_draft: null, p_issues: [], p_error: code.slice(0, 80), p_input_tokens: null, p_output_tokens: null });
    return { status: 422, result: { error: "Nie udało się przygotować części PDF.", code } };
  }
}

async function finishPdfParts(admin: SupabaseClient, owner: string, job: Job, parts: { part_index: number; status: string; draft: unknown }[]) {
  if (parts.some((part) => part.status !== "succeeded")) throw new Error("incomplete_pdf");
  const merged = mergeDraftParts([...parts].sort((a, b) => a.part_index - b.part_index).map((part) => part.draft));
  const validated = validateDraft(merged);
  const { data: accepted, error } = await admin.rpc("finish_import_job", { p_owner: owner, p_id: job.id, p_token: job.lease_token, p_draft: merged, p_issues: validated.issues, p_error: null, p_input_tokens: null, p_output_tokens: null });
  if (error) throw error;
  if (!accepted) return { status: 409, result: { error: "Wynik wygasł lub import anulowano." } };
  const saved = await ownedJob(admin, owner, job.id);
  return { status: 200, result: { job: saved, questions: jobQuestions(saved) } };
}

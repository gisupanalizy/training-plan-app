import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { validateDraft, validateSource, type ImportIssue, type SourceKind } from "./domain";
import { MODEL, PROMPT_VERSION, openaiImport, type ImportAdapter } from "./openai";
import { importQuestions } from "./questions";

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
  const config = getSupabaseConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !key) throw new Error("Brak konfiguracji serwera importu.");
  return createSupabaseClient(config.url, key, { auth: { autoRefreshToken: false, persistSession: false } });
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
  if (!["uploaded", "failed", "processing"].includes(before.status)) return { status: 409, result: { error: "Import nie jest gotowy do przetwarzania." } };
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

import { NextResponse } from "next/server";
import { authContext, jobQuestions, ownedJob, UUID } from "@/lib/imports/server";
import { validateDraft } from "@/lib/imports/domain";
import { parsePlanEditorDocument } from "@/lib/domain/plan-editor";
import { readJsonObject } from "@/lib/imports/http";
import { readReviewProgress } from "@/lib/imports/review";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niepoprawny identyfikator." }, { status: 400 });
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const job = await ownedJob(context.admin, context.user.id, id);
  if (!job) return NextResponse.json({ error: "Nie znaleziono importu." }, { status: 404 });
  const { source_text: _sourceText, source_path: _sourcePath, lease_token: _token, ...safe } = job;
  let document = null;
  if (job.status === "needs_review" && job.draft) {
    try { document = validateDraft(job.draft).document; } catch { /* Uszkodzony szkic nie jest publikowany. */ }
  }
  return NextResponse.json({ job: safe, document, questions: jobQuestions(job) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niepoprawny identyfikator." }, { status: 400 });
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const job = await ownedJob(context.admin, context.user.id, id);
  if (!job) return NextResponse.json({ error: "Nie znaleziono importu." }, { status: 404 });
  if (job.status !== "needs_review" || new Date(job.expires_at).getTime() <= Date.now())
    return NextResponse.json({ error: "Szkic nie jest już dostępny do korekty." }, { status: 409 });
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 1_000_000); } catch { return NextResponse.json({ error: "Niepoprawne żądanie." }, { status: 400 }); }
  let document;
  try { document = parsePlanEditorDocument(body.document); }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
  if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers))
    return NextResponse.json({ error: "Niepoprawne odpowiedzi." }, { status: 400 });
  let progress;
  const stored = job.review_data && typeof job.review_data === "object" && !Array.isArray(job.review_data) ? (job.review_data as Record<string, unknown>).progress : undefined;
  const progressInput = body.progress === undefined ? stored : body.progress;
  try { progress = progressInput === undefined ? undefined : readReviewProgress(progressInput, document); }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
  const { data, error } = await context.admin.from("imports")
    .update({ review_data: { document, answers: body.answers, ...(progress ? { progress } : {}) }, updated_at: new Date().toISOString() })
    .eq("id", id).eq("owner_id", context.user.id).eq("status", "needs_review").select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Stan importu zmienił się." }, { status: 409 });
  return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
}

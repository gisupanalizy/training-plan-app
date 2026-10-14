import { NextResponse } from "next/server";
import { parsePlanEditorDocument } from "@/lib/domain/plan-editor";
import { authContext, jobQuestions, ownedJob, UUID } from "@/lib/imports/server";
import { readJsonObject } from "@/lib/imports/http";
import { checkClarificationAnswers } from "@/lib/imports/questions";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) return NextResponse.json({ error: "Niepoprawny identyfikator." }, { status: 400 });
  const context = await authContext();
  if (!context) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const job = await ownedJob(context.admin, context.user.id, id);
  if (!job) return NextResponse.json({ error: "Nie znaleziono importu." }, { status: 404 });
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 1_000_000); } catch { return NextResponse.json({ error: "Niepoprawne żądanie." }, { status: 400 }); }
  if (typeof body.operationId !== "string" || !UUID.test(body.operationId)) return NextResponse.json({ error: "Niepoprawna operacja." }, { status: 400 });
  let document;
  try { document = parsePlanEditorDocument(body.document); }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
  if (job.status !== "committed") {
    const clarificationError = checkClarificationAnswers(jobQuestions(job), body.answers, document);
    if (clarificationError) return NextResponse.json({ error: clarificationError, questions: jobQuestions(job) }, { status: 400 });
  }
  const { data, error } = await context.userClient.rpc("approve_import_job", { p_id: id, p_operation_id: body.operationId, p_document: document });
  if (error) return NextResponse.json({ error: "Import zmienił stan albo zatwierdzenie jest sprzeczne." }, { status: error.code === "P0002" ? 404 : 409 });
  return NextResponse.json(data);
}

import { readJsonObject } from "@/lib/http/json";
import { NextResponse } from "next/server";
import { parsePlanEditorDocument } from "@/lib/domain/plan-editor";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 1048576); }
  catch { return NextResponse.json({ error: "Niepoprawne żądanie." }, { status: 400 }); }
  if (typeof body.operationId !== "string" || !uuid.test(body.operationId) ||
    !(body.planId === null || (typeof body.planId === "string" && uuid.test(body.planId))) ||
    !(body.expectedVersionId === null || (typeof body.expectedVersionId === "string" && uuid.test(body.expectedVersionId)))) {
    return NextResponse.json({ error: "Niepoprawny identyfikator operacji lub planu." }, { status: 400 });
  }
  let document;
  try { document = parsePlanEditorDocument(body.document); }
  catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 400 }); }
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const { data, error } = await client.rpc("save_manual_plan", {
    p_operation_id: body.operationId, p_plan_id: body.planId,
    p_expected_version_id: body.expectedVersionId, p_document: document,
  });
  if (error) {
    const status = error.code === "40001" || error.code === "23505" ? 409 : error.code === "P0002" ? 404 : 400;
    return NextResponse.json({ error: status === 409 ? "Plan zmienił się w innej karcie. Odśwież edytor." : "Nie udało się zapisać planu. Sprawdź pola i spróbuj ponownie." }, { status });
  }
  return NextResponse.json(data);
}

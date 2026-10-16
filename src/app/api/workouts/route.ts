import { readJsonObject } from "@/lib/http/json";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const actions = new Set(["start", "save_set", "add_set", "add_exercise", "comment", "finish"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 65536); }
  catch { return NextResponse.json({ error: "Niepoprawne żądanie." }, { status: 400 }); }
  if (typeof body.operationId !== "string" || !uuid.test(body.operationId) ||
    !(body.workoutId === null || (typeof body.workoutId === "string" && uuid.test(body.workoutId))) ||
    !Number.isSafeInteger(body.expectedRevision) || (body.expectedRevision as number) < 0 ||
    typeof body.action !== "string" || !actions.has(body.action) ||
    !body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
    return NextResponse.json({ error: "Niepoprawna komenda treningu." }, { status: 400 });
  }
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const { data, error } = await client.rpc("apply_workout_command", {
    p_operation_id: body.operationId, p_workout_id: body.workoutId,
    p_expected_revision: body.expectedRevision, p_action: body.action, p_payload: body.payload,
  });
  if (error) {
    const status = error.code === "PT409" || error.code === "40001" || error.code === "23505" ? 409 :
      error.code === "P0002" ? 404 : error.code === "28000" ? 401 : 400;
    return NextResponse.json({ error: status === 409 ? "Konflikt zmian. Odśwież trening; ponowienie tej samej operacji jest bezpieczne." :
      status === 404 ? "Nie znaleziono własnego treningu lub elementu." : "Nie udało się zapisać. Sprawdź pola." }, { status });
  }
  return NextResponse.json(data);
}

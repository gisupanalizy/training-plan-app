import { readJsonObject } from "@/lib/http/json";
import { workoutJson, workoutError } from "@/lib/workouts/http";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const actions = new Set(["start", "save_set", "add_set", "add_exercise", "comment", "finish", "delete", "replace_active"]);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 65536); }
  catch { return workoutJson({ code: "INVALID_COMMAND", error: "Niepoprawne żądanie." }, 400); }
  if (typeof body.operationId !== "string" || !uuid.test(body.operationId) ||
    !(body.workoutId === null || (typeof body.workoutId === "string" && uuid.test(body.workoutId))) ||
    !Number.isSafeInteger(body.expectedRevision) || (body.expectedRevision as number) < 0 ||
    typeof body.action !== "string" || !actions.has(body.action) ||
    !body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
    return workoutJson({ code: "INVALID_COMMAND", error: "Niepoprawna komenda treningu." }, 400);
  }
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return workoutJson({ code: "UNAUTHENTICATED", error: "Sesja wygasła." }, 401);
  const { data, error } = await client.rpc("apply_workout_command", {
    p_operation_id: body.operationId, p_workout_id: body.workoutId,
    p_expected_revision: body.expectedRevision, p_action: body.action, p_payload: body.payload,
  });
  if (error) return workoutError(error);
  return workoutJson(data);
}

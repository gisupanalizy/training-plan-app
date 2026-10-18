import { createClient } from "@/lib/supabase/server";
import { workoutUuid, presentWorkout } from "@/lib/workouts/repository";
import type { LoadedWorkout } from "@/lib/workouts/contracts";
import { workoutJson, workoutError } from "@/lib/workouts/http";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return workoutJson({ code: "UNAUTHENTICATED", error: "Sesja wygasła." }, 401);
  const { id } = await params;
  if (!workoutUuid.test(id)) return workoutJson({ code: "INVALID_COMMAND", error: "Niepoprawny identyfikator." }, 400);
  const { data, error } = await client.rpc("read_workout", { p_id: id });
  if (error) return workoutError(error);
  return workoutJson(presentWorkout(data as LoadedWorkout));
}

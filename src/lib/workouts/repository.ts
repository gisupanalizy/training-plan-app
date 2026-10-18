import { createClient } from "@/lib/supabase/server";
import type { LoadedWorkout, WorkoutRow, WorkoutSet } from "./contracts";
import { inWorkoutDateRange, workoutSummary } from "./time";

export const workoutUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function authorized() {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  return client;
}
export async function getWorkoutList() {
  const client = await authorized();
  const { data, error } = await client.rpc("list_workouts");
  if (error) throw error;
  return data as WorkoutRow[];
}
export function previousResult(set: WorkoutSet | null | undefined) {
  if (!set) return null;
  const parts: string[] = [];
  if (set.actual_reps !== null) parts.push(`${set.actual_reps} powt.`);
  if (set.actual_kg !== null) parts.push(`${set.actual_kg} kg`);
  else if (set.actual_reps !== null) parts.push("bez kg");
  if (set.actual_duration_seconds !== null) parts.push(`${set.actual_duration_seconds} s`);
  if (set.actual_distance_meters !== null) parts.push(`${set.actual_distance_meters} m`);
  return parts.length ? parts.join(" · ") : null;
}
export function presentWorkout(data: LoadedWorkout): LoadedWorkout {
  return { ...data, exercises: data.exercises.map((e) => ({ ...e, previousResult: previousResult(e.previousSet) })) };
}
export async function getWorkout(workoutId: string) {
  if (!workoutUuid.test(workoutId)) return null;
  const client = await authorized();
  const { data, error } = await client.rpc("read_workout", { p_id: workoutId });
  if (error?.code === "P0002" || error?.code === "PT410") return null;
  if (error) throw error;
  return presentWorkout(data as LoadedWorkout);
}
export async function getActiveWorkouts() {
  return (await getWorkoutList()).filter((w) => w.status === "in_progress").map(workoutSummary);
}
export async function getWorkoutHistory(from?: string, until?: string) {
  return (await getWorkoutList()).filter((w) => w.status === "completed")
    .map(workoutSummary).filter((w) => inWorkoutDateRange(w.performedOn, from, until));
}
/** Zgodność ze starym UI; C użyje globalnego getActiveWorkouts. */
export async function getActiveWorkoutForDay(planSessionId: string) {
  if (!workoutUuid.test(planSessionId)) return null;
  return (await getWorkoutList()).find((w) => w.plan_session_id === planSessionId && w.status === "in_progress")?.id ?? null;
}

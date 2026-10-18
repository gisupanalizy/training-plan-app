import { createClient } from "@/lib/supabase/server";
import { summarizeProgress, type ExerciseInfo, type ProgressExercise, type ProgressSet, type ProgressWorkout } from "./summary";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
export function validDate(value: string | undefined) {
  if (!value) return undefined;
  if (!isoDate.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : undefined;
}

export async function getProgress(from?: string, to?: string) {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  const ownerId = auth.user.id;
  const checkedFrom = validDate(from);
  const checkedTo = validDate(to);
  const readAll = async <T>(query: (offset: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) => {
    const all: T[] = [];
    for (let offset = 0;; offset += 500) {
      const { data, error } = await query(offset);
      if (error) throw new Error(error.message);
      all.push(...(data ?? []));
      if (!data || data.length < 500) return all;
    }
  };
  const workouts = await readAll<ProgressWorkout>((offset) => {
    let query = client.from("workout_read_model").select("id,performed_on,status,created_at")
      .eq("owner_id", ownerId).order("performed_on", { ascending: false }).order("id").range(offset, offset + 499);
    if (checkedFrom) query = query.gte("performed_on", checkedFrom);
    if (checkedTo) query = query.lte("performed_on", checkedTo);
    return query;
  });
  const info = await readAll<ExerciseInfo>((offset) => client.from("exercises")
    .select("id,name,variant,equipment,load_mode").eq("owner_id", ownerId).order("id").range(offset, offset + 499));
  const performed: ProgressExercise[] = [];
  for (let index = 0; index < workouts.length; index += 100) {
    const ids = workouts.slice(index, index + 100).map((item) => item.id);
    performed.push(...await readAll<ProgressExercise>((offset) => client.from("performed_exercises")
      .select("id,workout_session_id,exercise_id,target_name_snapshot,source_kind,position")
      .eq("owner_id", ownerId).in("workout_session_id", ids).order("id").range(offset, offset + 499)));
  }
  const sets: ProgressSet[] = [];
  for (let index = 0; index < performed.length; index += 100) {
    const ids = performed.slice(index, index + 100).map((item) => item.id);
    sets.push(...await readAll<ProgressSet>((offset) => client.from("performed_sets")
      .select("performed_exercise_id,source_kind,status,target_optional_snapshot,target_load_type_snapshot,target_dumbbell_basis_snapshot,actual_reps,actual_kg")
      .eq("owner_id", ownerId).in("performed_exercise_id", ids).order("id").range(offset, offset + 499)));
  }
  return { ...summarizeProgress(workouts, performed, sets, info), exercises: info };
}

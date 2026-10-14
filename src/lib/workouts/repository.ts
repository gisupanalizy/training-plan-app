import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function authorized() {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  return { client, ownerId: auth.user.id };
}

export async function getWorkoutList() {
  const { client, ownerId } = await authorized();
  const { data, error } = await client.from("workout_sessions")
    .select("id,plan_version_id,plan_session_id,performed_on,status,revision,comment,created_at,completed_at")
    .eq("owner_id", ownerId).order("performed_on", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getWorkout(workoutId: string) {
  if (!uuid.test(workoutId)) return null;
  const { client, ownerId } = await authorized();
  const { data: workout, error } = await client.from("workout_sessions")
    .select("id,plan_version_id,plan_session_id,performed_on,status,revision,comment,created_at,completed_at")
    .eq("id", workoutId).eq("owner_id", ownerId).maybeSingle();
  if (error) throw error;
  if (!workout) return null;
  const { data: exercises, error: exerciseError } = await client.from("performed_exercises")
    .select("id,exercise_id,position,source_kind,target_name_snapshot,target_original_name_snapshot,target_note_snapshot,superset_group_snapshot")
    .eq("workout_session_id", workoutId).eq("owner_id", ownerId).order("position");
  if (exerciseError) throw exerciseError;
  const exerciseIds = exercises.map((item) => item.id);
  const { data: sets, error: setError } = exerciseIds.length ? await client.from("performed_sets")
    .select("id,performed_exercise_id,position,source_kind,status,target_optional_snapshot,target_kg_max_snapshot,target_duration_seconds_max_snapshot,target_rest_seconds_max_snapshot,target_kind_snapshot,target_reps_min_snapshot,target_reps_max_snapshot,target_amrap_snapshot,target_load_type_snapshot,target_kg_snapshot,target_percent_snapshot,one_rep_max_record_id,one_rep_max_kg_snapshot,raw_target_kg_snapshot,rounded_target_kg_snapshot,rounding_increment_kg_snapshot,target_duration_seconds_snapshot,target_distance_meters_snapshot,target_rest_seconds_snapshot,target_tempo_snapshot,target_rpe_snapshot,target_rir_snapshot,target_note_snapshot,actual_reps,actual_kg,actual_duration_seconds,actual_distance_meters,actual_rpe,actual_rir,actual_note")
    .in("performed_exercise_id", exerciseIds).eq("owner_id", ownerId).order("position") : { data: [], error: null };
  if (setError) throw setError;

  const prior: Record<string, string | null> = {};
  const distinct = [...new Set(exercises.map((item) => item.exercise_id))];
  if (distinct.length) {
    const { data: candidates, error: candidateError } = await client.from("performed_exercises")
      .select("id,exercise_id,workout_session_id")
      .in("exercise_id", distinct).eq("owner_id", ownerId).neq("workout_session_id", workoutId);
    if (candidateError) throw candidateError;
    const priorWorkouts = await getWorkoutList();
    const eligible = new Map(priorWorkouts.filter((item) => item.status === "completed" &&
      (item.performed_on < workout.performed_on || (item.performed_on === workout.performed_on && item.created_at < workout.created_at)))
      .map((item) => [item.id, item]));
    const previousExercises = candidates.filter((item) => eligible.has(item.workout_session_id));
    const ids = previousExercises.map((item) => item.id);
    if (ids.length) {
      const { data: previousSets, error: previousError } = await client.from("performed_sets")
        .select("performed_exercise_id,position,status,actual_reps,actual_kg,actual_duration_seconds,actual_distance_meters")
        .in("performed_exercise_id", ids).eq("owner_id", ownerId).eq("status", "completed");
      if (previousError) throw previousError;
      for (const exerciseId of distinct) {
        const selected = previousExercises.filter((item) => item.exercise_id === exerciseId)
          .sort((a, b) => {
            const x = eligible.get(a.workout_session_id)!;
            const y = eligible.get(b.workout_session_id)!;
            return y.performed_on.localeCompare(x.performed_on) || y.created_at.localeCompare(x.created_at);
          }).find((item) => previousSets.some((set) => set.performed_exercise_id === item.id));
        if (selected) {
          const result = previousSets.filter((set) => set.performed_exercise_id === selected.id).sort((a, b) => a.position - b.position)[0];
          prior[exerciseId] = `${result.actual_reps ?? "—"} powt. · ${result.actual_kg === null ? "bez kg" : `${result.actual_kg} kg`}`;
        }
      }
    }
  }
  return { workout, exercises: exercises.map((exercise) => ({ ...exercise,
    sets: sets.filter((set) => set.performed_exercise_id === exercise.id),
    previousResult: prior[exercise.exercise_id] ?? null,
  })) };
}

export async function getActiveWorkoutForDay(planSessionId: string) {
  if (!uuid.test(planSessionId)) return null;
  const { client, ownerId } = await authorized();
  const { data, error } = await client.from("workout_sessions").select("id")
    .eq("owner_id", ownerId).eq("plan_session_id", planSessionId).eq("status", "in_progress").maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

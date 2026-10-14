export type ProgressWorkout = { id: string; performed_on: string; status: string; created_at: string };
export type ProgressExercise = { id: string; workout_session_id: string; exercise_id: string; target_name_snapshot: string; source_kind: string; position: number };
export type ProgressSet = { performed_exercise_id: string; source_kind: string; status: string; target_optional_snapshot?: boolean; target_load_type_snapshot: string | null; target_dumbbell_basis_snapshot: string | null; actual_reps: number | null; actual_kg: number | null };
export type ExerciseInfo = { id: string; name: string; variant: string | null; equipment: string | null; load_mode: string };

export function summarizeProgress(workouts: ProgressWorkout[], performed: ProgressExercise[], sets: ProgressSet[], exerciseInfo: ExerciseInfo[]) {
  const byExercise = new Map(exerciseInfo.map((item) => [item.id, item]));
  const byWorkout = new Map(workouts.map((item) => [item.id, item]));
  const byPerformed = new Map(performed.map((item) => [item.id, item]));
  const rows = new Map<string, {
    workoutId: string; date: string; status: string; exerciseId: string; name: string; variant: string | null;
    completed: number; skipped: number; pending: number; planned: number; extra: number; optional: number;
    volumeKg: number; volumeSets: number; results: { reps: number | null; kg: number | null; loadType: string | null; status: string }[];
  }>();
  for (const item of performed) {
    const workout = byWorkout.get(item.workout_session_id);
    const info = byExercise.get(item.exercise_id);
    if (!workout || !info) continue;
    rows.set(item.id, { workoutId: workout.id, date: workout.performed_on, status: workout.status,
      exerciseId: item.exercise_id, name: item.target_name_snapshot, variant: info.variant,
      completed: 0, skipped: 0, pending: 0, planned: 0, extra: 0, optional: 0, volumeKg: 0, volumeSets: 0, results: [] });
  }
  for (const set of sets) {
    const item = byPerformed.get(set.performed_exercise_id);
    const row = rows.get(set.performed_exercise_id);
    if (!item || !row) continue;
    if (set.source_kind === "planned" && !set.target_optional_snapshot) row.planned++;
    else if (set.target_optional_snapshot) row.optional++;
    else row.extra++;
    if (set.status === "completed") {
      row.completed++;
      row.results.push({ reps: set.actual_reps, kg: set.actual_kg, loadType: set.target_load_type_snapshot, status: set.status });
      // Bez jawnej semantyki ciężaru dodatkowej serii oraz wartości „na hantel” nie da się porównać objętości.
      const comparable = item.source_kind === "planned" && set.source_kind === "planned" &&
        byExercise.get(item.exercise_id)?.load_mode === "external" &&
        (set.target_load_type_snapshot === "absolute" || set.target_load_type_snapshot === "percent_1rm") &&
        set.target_dumbbell_basis_snapshot !== "per_hand" &&
        (set.target_dumbbell_basis_snapshot === "total" ||
          !/hantel|dumbbell/i.test(`${byExercise.get(item.exercise_id)?.equipment ?? ""} ${item.target_name_snapshot}`)) &&
        set.actual_reps !== null && set.actual_kg !== null;
      if (comparable) { row.volumeKg += set.actual_reps! * set.actual_kg!; row.volumeSets++; }
    } else if (set.status === "skipped") row.skipped++;
    else if (!set.target_optional_snapshot) row.pending++;
  }
  const entries = [...rows.values()].sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
  const sessions = workouts.map((workout) => {
    const own = entries.filter((entry) => entry.workoutId === workout.id);
    return { ...workout, planned: own.reduce((sum, entry) => sum + entry.planned, 0) };
  });
  // Licznik realizacji planu liczy tylko serie planowane; dodatki i pominięcia są pokazane osobno.
  const plannedCompleted = new Map<string, number>();
  for (const set of sets) if (set.source_kind === "planned" && !set.target_optional_snapshot && set.status === "completed") {
    const workoutId = byPerformed.get(set.performed_exercise_id)?.workout_session_id;
    if (workoutId) plannedCompleted.set(workoutId, (plannedCompleted.get(workoutId) ?? 0) + 1);
  }
  return { entries, sessions: sessions.map((session) => ({ ...session,
    completedPlanned: plannedCompleted.get(session.id) ?? 0,
    skipped: entries.filter((entry) => entry.workoutId === session.id).reduce((sum, entry) => sum + entry.skipped, 0),
    pending: entries.filter((entry) => entry.workoutId === session.id).reduce((sum, entry) => sum + entry.pending, 0),
  })) };
}

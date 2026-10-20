import type { ExerciseInfo, ProgressExercise, ProgressSet, ProgressWorkout } from "./summary";

export const ESTIMATION_VERSION = "reference-table-v1";
export const REP_COEFFICIENTS = [1, .97, .94, .92, .89, .86, .83, .81, .78, .75] as const;
export type Metric = "estimatedMax" | "maxWeight" | "volume" | "maxReps" | "totalReps" | "setCount";
export type SourceSet = { setId: string; performedExerciseId: string; position: number | null; reps: number | null; kg: number | null };
export type Measurement = { value: number; sources: SourceSet[] };
export type ProgressPoint = {
  id: string; workoutId: string; exerciseId: string; date: string; performedAt: string | null; timeZone: string;
  status: string; name: string; performedExerciseIds: string[]; sets: SourceSet[];
  metrics: Record<Metric, Measurement | null>;
};
export type ProgressRecord = { point: ProgressPoint; measurement: Measurement };
export type ExerciseAnalytics = { exercise: ExerciseInfo; mode: "external" | "bodyweight" | "unsupported"; points: ProgressPoint[]; records: Record<Metric, ProgressRecord | null> };
const nonnegative = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0;
const repsKnown = (value: unknown): value is number => nonnegative(value) && Number.isInteger(value);
export function estimateOneRepMax(kg: number | null, reps: number | null): number | null {
  if (!nonnegative(kg) || !repsKnown(reps) || reps < 1 || reps > 10) return null;
  const value = kg / REP_COEFFICIENTS[reps - 1];
  return Number.isFinite(value) ? value : null;
}
function blankMetrics(): Record<Metric, Measurement | null> { return { estimatedMax: null, maxWeight: null, volume: null, maxReps: null, totalReps: null, setCount: null }; }
const sourceOrder = (a: SourceSet, b: SourceSet) => a.setId.localeCompare(b.setId);
function maximum(sources: SourceSet[], value: (source: SourceSet) => number | null, tie: (a: SourceSet, b: SourceSet) => number = sourceOrder): Measurement | null {
  const candidates = sources.map(source => ({ source, value: value(source) })).filter((row): row is { source: SourceSet; value: number } => row.value !== null && Number.isFinite(row.value));
  candidates.sort((a, b) => b.value - a.value || tie(a.source, b.source));
  return candidates.length ? { value: candidates[0].value, sources: [candidates[0].source] } : null;
}
function sum(sources: SourceSet[], value: (source: SourceSet) => number): Measurement | null {
  if (!sources.length) return null;
  const total = sources.reduce((total, source) => total + value(source), 0);
  return Number.isFinite(total) ? { value: total, sources: [...sources].sort(sourceOrder) } : null;
}
/** Nie używamy created_at jako godziny wykonania, również przy remisie rekordu. */
export function comparePointTime(a: ProgressPoint, b: ProgressPoint): number {
  return a.date.localeCompare(b.date) || (a.performedAt && b.performedAt ? a.performedAt.localeCompare(b.performedAt) : a.performedAt ? -1 : b.performedAt ? 1 : 0) || a.id.localeCompare(b.id);
}
function repetitionTask(set: ProgressSet) {
  return ["warmup", "ramp", "work", "backoff", "drop"].includes(set.target_kind_snapshot ?? "") &&
    [set.target_duration_seconds_snapshot, set.target_duration_seconds_max_snapshot, set.target_distance_meters_snapshot,
      set.actual_duration_seconds, set.actual_distance_meters].every(value => value == null);
}
export function analyzeProgress(workouts: ProgressWorkout[], performed: ProgressExercise[], sets: ProgressSet[], exercises: ExerciseInfo[]): ExerciseAnalytics[] {
  const sessions = new Map(workouts.filter(w => ["in_progress", "completed", "abandoned"].includes(w.status)).map(w => [w.id, w]));
  const performedById = new Map(performed.map(row => [row.id, row]));
  const catalog = new Map(exercises.map(row => [row.id, row]));
  const grouped = new Map<string, { point: ProgressPoint; external: SourceSet[]; bodyweight: SourceSet[] }>();
  for (const set of sets) {
    if (set.status !== "completed" || !set.id) continue;
    const block = performedById.get(set.performed_exercise_id);
    const session = block && sessions.get(block.workout_session_id);
    const exercise = block && catalog.get(block.exercise_id);
    if (!block || !session || !exercise) continue;
    const identityKey = exercise.identityId ?? exercise.id;
    const id = `${session.id}:${identityKey}`;
    let row = grouped.get(id);
    if (!row) {
      row = { point: { id, workoutId: session.id, exerciseId: identityKey, date: session.performed_on,
        performedAt: session.performed_at ?? null, timeZone: session.time_zone ?? "Europe/Warsaw", status: session.status,
        name: exercise.identityName ?? block.target_name_snapshot, performedExerciseIds: [], sets: [], metrics: blankMetrics() }, external: [], bodyweight: [] };
      grouped.set(id, row);
    }
    const source = { setId: set.id, performedExerciseId: block.id, position: set.position ?? null, reps: set.actual_reps, kg: set.actual_kg };
    row.point.sets.push(source);
    if (!row.point.performedExerciseIds.includes(block.id)) row.point.performedExerciseIds.push(block.id);
    const plannedRepetition = block.source_kind === "planned" && set.source_kind === "planned" && repetitionTask(set);
    if (!plannedRepetition) continue;
    const external = exercise.load_mode === "external" && ["absolute", "percent_1rm"].includes(set.target_load_type_snapshot ?? "") &&
      set.target_dumbbell_basis_snapshot !== "per_hand" &&
      (set.target_dumbbell_basis_snapshot === "total" || !/hantel|hantl|dumbbell/i.test(`${exercise.equipment ?? ""} ${block.target_name_snapshot}`));
    if (external && nonnegative(set.actual_kg)) row.external.push(source);
    const bodyweight = exercise.load_mode === "bodyweight" && set.target_load_type_snapshot === "bodyweight" &&
      set.target_bodyweight_adjustment_snapshot === "none" && set.target_bodyweight_delta_kg_snapshot === null &&
      set.actual_kg === null && repsKnown(set.actual_reps);
    if (bodyweight) row.bodyweight.push(source);
  }
  for (const { point, external, bodyweight } of grouped.values()) {
    point.sets.sort(sourceOrder);
    point.performedExerciseIds.sort();
    point.metrics.maxWeight = maximum(external, s => s.kg, (a, b) => (repsKnown(b.reps) ? b.reps : -1) - (repsKnown(a.reps) ? a.reps : -1) || sourceOrder(a, b));
    point.metrics.estimatedMax = maximum(external, s => estimateOneRepMax(s.kg, s.reps), (a, b) => b.kg! - a.kg! || sourceOrder(a, b));
    point.metrics.volume = sum(external.filter(s => repsKnown(s.reps)), s => s.kg! * s.reps!);
    point.metrics.maxReps = maximum(bodyweight, s => s.reps);
    point.metrics.totalReps = sum(bodyweight, s => s.reps!);
    point.metrics.setCount = sum(bodyweight, () => 1);
  }
  const identities = new Map<string, ExerciseInfo>();
  for (const exercise of exercises) {
    const key = exercise.identityId ?? exercise.id;
    if (!identities.has(key)) identities.set(key, { ...exercise, id: key, name: exercise.identityName ?? exercise.name, variant: exercise.identityId ? exercise.variant : exercise.variant });
  }
  return [...identities.values()].map(exercise => {
    const points = [...grouped.values()].map(row => row.point).filter(p => p.exerciseId === exercise.id).sort(comparePointTime);
    const records: Record<Metric, ProgressRecord | null> = { estimatedMax: null, maxWeight: null, volume: null, maxReps: null, totalReps: null, setCount: null };
    for (const point of points) for (const metric of Object.keys(records) as Metric[]) {
      const measurement = point.metrics[metric];
      if (measurement && (!records[metric] || measurement.value > records[metric]!.measurement.value)) records[metric] = { point, measurement };
    }
    return { exercise, mode: exercise.load_mode === "external" ? "external" : exercise.load_mode === "bodyweight" ? "bodyweight" : "unsupported", points, records };
  });
}

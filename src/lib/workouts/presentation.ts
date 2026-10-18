import { seriesBlocks, goalLabel, loadLabel, restLabel, trainingKeys } from '../imports/review';
import { formatRange } from '../domain/format';
import { additionalSetLabel } from '../domain/compact-editor';
import { calculatePercentTarget, selectApplicableOneRepMax, type OneRepMaxRecord, type PlannedSetInput } from '../domain/model';
import type { PlanEditorExercise } from '../domain/plan-editor';
import type { WorkoutSet } from './contracts';

export type TargetContext = { date: string; records: OneRepMaxRecord[]; increment: number };

/** Sąsiadujące cele jak w edytorze; granice opcjonalności i uwag pozostają jawne. */
export function presentationBlocks(exercise: PlanEditorExercise) {
  return seriesBlocks(exercise).flatMap(block => {
    const groups: PlannedSetInput[][] = [];
    for (const set of block.sets) {
      const last = groups.at(-1);
      const signature = (value: PlannedSetInput) => JSON.stringify([
        ...trainingKeys.map(key => value[key] ?? null), !!value.isOptional, value.note ?? null,
      ]);
      if (last && signature(last[0]) === signature(set)) last.push(set);
      else groups.push([set]);
    }
    return groups;
  });
}
export function targetGoal(set: PlannedSetInput, compact = false) {
  // AMRAP nie ukrywa pozostałych jawnych celów, np. czasu lub dystansu.
  const other = goalLabel({ ...set, isAmrap: false, repsMin: set.isAmrap ? null : set.repsMin }, compact);
  return set.isAmrap ? ['AMRAP', other === 'Cel do wyjaśnienia' ? null : other].filter(Boolean).join(' + ') : other;
}
export function targetLoad(set: PlannedSetInput, exerciseId?: string | null, context?: TargetContext) {
  if (set.loadType !== 'percent_1rm' || !context) return loadLabel(set);
  const maximum = exerciseId ? selectApplicableOneRepMax(context.records, exerciseId, context.date) : null;
  const result = set.targetPercent == null ? null : calculatePercentTarget(set.targetPercent, maximum, context.increment);
  return `${loadLabel(set)} · ${result?.roundedTargetKg == null ? 'brak maksimum' : `${result.roundedTargetKg} kg`}`;
}
export function setPrescription(set: PlannedSetInput, exerciseId?: string | null, context?: TargetContext) {
  return [targetGoal(set), targetLoad(set, exerciseId, context), restLabel(set), additionalSetLabel(set)].filter(Boolean).join(' · ');
}
export function compactPrescription(exercise: PlanEditorExercise, context?: TargetContext) {
  const blocks = presentationBlocks(exercise);
  const describe = (sets: PlannedSetInput[]) => {
    const count = exercise.isOptional && blocks.length === 1 ? formatRange(exercise.setCountMin ?? sets.length, exercise.setCountMax) : sets.length;
    return `${count} × ${targetGoal(sets[0], true)}${sets[0].kind === 'ramp' ? ' (rampa)' : ''}${sets[0].isOptional ? sets.length === 1 ? ' (opcjonalna)' : ' (opcjonalne)' : ''}`;
  };
  const visible = blocks.slice(0, 2).map(describe).join(' + ');
  const differing = blocks.length > 2 ? ` + ${blocks.length - 2} ${blocks.length === 3 ? 'blok' : 'bloków'}` : '';
  const first = exercise.sets[0];
  const uniformLoad = first && exercise.sets.every(set => targetLoad(set, exercise.exerciseId, context) === targetLoad(first, exercise.exerciseId, context));
  const uniformRest = first && exercise.sets.every(set => restLabel(set) === restLabel(first));
  return [visible + differing, uniformLoad ? targetLoad(first, exercise.exerciseId, context) : 'różne obciążenia', uniformRest ? restLabel(first) : 'różne przerwy'].filter(Boolean).join(' · ');
}

/** C czyta snapshot zamiast przeliczać cel historyczny według dzisiejszego 1RM. */
function snapshotTarget(set: WorkoutSet): PlannedSetInput {
  return {
    position: set.position, kind: (set.target_kind_snapshot ?? 'work') as PlannedSetInput['kind'],
    repsMin: set.target_reps_min_snapshot, repsMax: set.target_reps_max_snapshot, isAmrap: set.target_amrap_snapshot,
    isOptional: set.target_optional_snapshot, loadType: (set.target_load_type_snapshot ?? 'unspecified') as PlannedSetInput['loadType'],
    targetKg: set.target_load_type_snapshot === 'percent_1rm' ? set.rounded_target_kg_snapshot : set.target_kg_snapshot,
    targetKgMax: set.target_kg_max_snapshot, targetPercent: set.target_percent_snapshot,
    bodyweightAdjustment: (set.target_bodyweight_adjustment_snapshot ?? null) as PlannedSetInput['bodyweightAdjustment'],
    bodyweightDeltaKg: (set.target_bodyweight_delta_kg_snapshot ?? null) as number | null,
    dumbbellBasis: (set.target_dumbbell_basis_snapshot ?? null) as PlannedSetInput['dumbbellBasis'],
    durationSeconds: set.target_duration_seconds_snapshot, durationSecondsMax: set.target_duration_seconds_max_snapshot,
    distanceMeters: set.target_distance_meters_snapshot, restSeconds: set.target_rest_seconds_snapshot,
    restSecondsMax: set.target_rest_seconds_max_snapshot, tempo: set.target_tempo_snapshot,
    targetRpe: set.target_rpe_snapshot, targetRir: set.target_rir_snapshot, note: set.target_note_snapshot,
  };
}
export function snapshotPrescription(set: WorkoutSet) {
  const target = snapshotTarget(set);
  const load = target.loadType === 'percent_1rm'
    ? `${loadLabel(target)} · ${set.rounded_target_kg_snapshot == null ? 'brak maksimum' : `${set.rounded_target_kg_snapshot} kg`}` : loadLabel(target);
  return [targetGoal(target), load, restLabel(target), additionalSetLabel(target)].filter(Boolean).join(' · ');
}
export function resolveSessionId(ids: string[], stored: string | null) {
  return stored && ids.includes(stored) ? stored : ids[0] ?? '';
}

export type PrescriptionMetrics = { series: string; load: string; rest: string };
/** Osobne kolumny, bez rozbijania tekstu po separatorach ani zgadywania braków. */
export function planMetrics(exercise: PlanEditorExercise, context?: TargetContext): PrescriptionMetrics {
  const blocks = presentationBlocks(exercise);
  const first = exercise.sets[0];
  const series = blocks.slice(0, 2).map(sets => `${exercise.isOptional && blocks.length === 1 ? formatRange(exercise.setCountMin ?? sets.length, exercise.setCountMax) : sets.length} × ${targetGoal(sets[0], true)}${sets[0].isOptional ? ' opcj.' : ''}`).join(' + ') + (blocks.length > 2 ? ` + ${blocks.length - 2} bloków` : '');
  return { series: series || 'Brak serii',
    load: !first ? 'Niepodane' : exercise.sets.every(set => targetLoad(set, exercise.exerciseId, context) === targetLoad(first, exercise.exerciseId, context)) ? targetLoad(first, exercise.exerciseId, context) : 'Różne obciążenia',
    rest: !first ? 'Niepodana' : exercise.sets.every(set => restLabel(set) === restLabel(first)) ? restLabel(first) : 'Różne przerwy' };
}
export function snapshotMetrics(sets: WorkoutSet[]): PrescriptionMetrics {
  const targets = sets.map(snapshotTarget);
  const metrics = planMetrics({ name: '', exerciseId: null, variant: null, equipment: null, supersetGroup: null, note: null, sets: targets });
  const loads = sets.map(set => set.target_load_type_snapshot === 'percent_1rm' ? `${loadLabel(snapshotTarget(set))} · ${set.rounded_target_kg_snapshot == null ? 'brak maksimum' : `${set.rounded_target_kg_snapshot} kg`}` : loadLabel(snapshotTarget(set)));
  return { ...metrics, load: loads.length && loads.every(load => load === loads[0]) ? loads[0] : loads.length ? 'Różne obciążenia' : 'Niepodane' };
}
/** Parametry są jedynie lokalnym kontekstem nawigacji, nigdy adresem przekierowania. */
export function historyReturnHref(month?: string | string[], day?: string | string[]) {
  if (typeof month !== 'string' || typeof day !== 'string' || !month || !day || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !day.startsWith(`${month}-`)) return '/historia';
  const instant = new Date(`${day}T12:00:00Z`);
  if (!Number.isFinite(instant.getTime()) || instant.toISOString().slice(0, 10) !== day) return '/historia';
  return `/historia?month=${month}&day=${day}`;
}
/** Kopiowanie wyłącznie jednoznacznych celów snapshotu; zakres nie oznacza dolnej granicy. */
export function exactSnapshotValues(set: WorkoutSet) {
  const exact = (min: number | null, max: number | null) => min != null && (max == null || min === max) ? String(min) : '';
  return { reps: set.target_amrap_snapshot ? '' : exact(set.target_reps_min_snapshot, set.target_reps_max_snapshot),
    kg: set.target_load_type_snapshot === 'percent_1rm' ? set.rounded_target_kg_snapshot?.toString() ?? '' : set.target_load_type_snapshot === 'absolute' ? exact(set.target_kg_snapshot, set.target_kg_max_snapshot) : '',
    duration: exact(set.target_duration_seconds_snapshot, set.target_duration_seconds_max_snapshot), distance: set.target_distance_meters_snapshot?.toString() ?? '' };
}

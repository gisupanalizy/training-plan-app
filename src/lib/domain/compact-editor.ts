import { parsePlanEditorDocument, type PlanEditorExercise } from './plan-editor';
import type { PlannedSetInput } from './model';

// Walidacja jednego fragmentu nie zależy od nieukończonych pozycji reszty szkicu.
export function validateEditorExercise(exercise: PlanEditorExercise, requireName = true) {
  parsePlanEditorDocument({ name: 'Fragment planu', sessions: [{ weekNumber: 1, dayLabel: 'Trening', note: null,
    exercises: [{ ...exercise, name: requireName ? exercise.name : exercise.name.trim() || 'Ćwiczenie' }] }] });
}

export function synchronizeSetCounts(exercise: PlanEditorExercise) {
  exercise.sets.forEach((set, index) => { set.position = index + 1; });
  exercise.setCountMax = exercise.sets.length;
  exercise.setCountMin = exercise.isOptional
    ? Math.max(1, Math.min(exercise.setCountMin ?? exercise.sets.length, exercise.sets.length))
    : exercise.sets.filter(set => !set.isOptional).length;
  if (exercise.setCountMin < 1) throw new Error('Zachowaj serię wymaganą lub oznacz całe ćwiczenie jako opcjonalne.');
}

export function additionalSetLabel(set: PlannedSetInput) {
  const kinds = { warmup: 'Rozgrzewka', ramp: 'Rampa', work: '', backoff: 'Back-off', drop: 'Drop' };
  return [kinds[set.kind], set.tempo && `tempo ${set.tempo}`, set.targetRpe != null && `RPE ${set.targetRpe}`,
    set.targetRir != null && `RIR ${set.targetRir}`].filter(Boolean).join(' · ');
}

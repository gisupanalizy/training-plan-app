import type { LoadedWorkout, WorkoutExercise, WorkoutSet } from '@/lib/workouts/contracts';
import { snapshotPrescription } from '@/lib/workouts/presentation';

export const setStateLabel = (set: WorkoutSet) => set.status === 'completed' ? 'Zapisana' : set.status === 'skipped' ? 'Pominięta' : 'Oczekuje';
export const setCategory = (set: WorkoutSet) => set.source_kind === 'extra' ? 'Dodatkowa' : set.target_optional_snapshot ? 'Opcjonalna' : 'Wymagana';
export function actualLabel(set: WorkoutSet) {
  if (set.status !== 'completed') return setStateLabel(set);
  return [set.actual_reps == null ? null : `${set.actual_reps} powt.`, set.actual_kg == null ? null : `${set.actual_kg} kg`,
    set.actual_duration_seconds == null ? null : `${set.actual_duration_seconds} s`, set.actual_distance_meters == null ? null : `${set.actual_distance_meters} m`].filter(value => value !== null).join(' · ') || 'Brak danych';
}
export function exerciseGroups(exercises: WorkoutExercise[]) {
  const groups: WorkoutExercise[][] = [];
  for (const exercise of exercises) {
    const existing = exercise.superset_group_snapshot ? groups.find(group => group[0].superset_group_snapshot === exercise.superset_group_snapshot) : null;
    if (existing) existing.push(exercise); else groups.push([exercise]);
  }
  return groups;
}
/** Wymagane rundy przed opcjonalnymi, bez wyrównywania nierównych serii. */
export function workoutOrder(loaded: LoadedWorkout) {
  return exerciseGroups(loaded.exercises).flatMap(group => {
    const categories = [false, true];
    return categories.flatMap(optional => {
      const lists = group.map(exercise => exercise.sets.filter(set => !!set.target_optional_snapshot === optional && set.source_kind !== 'extra'));
      return Array.from({ length: Math.max(0, ...lists.map(list => list.length)) }, (_, round) => lists.flatMap(list => list[round] ? [list[round].id] : [])).flat();
    }).concat(group.flatMap(exercise => exercise.sets.filter(set => set.source_kind === 'extra').map(set => set.id)));
  });
}
export function nextRequired(loaded: LoadedWorkout, after?: string) {
  const order = workoutOrder(loaded);
  const all = loaded.exercises.flatMap(exercise => exercise.sets);
  const pending = order.filter(id => all.some(set => set.id === id && set.status === 'pending' && !set.target_optional_snapshot && set.source_kind !== 'extra'));
  return pending.find(id => order.indexOf(id) > order.indexOf(after ?? '')) ?? pending[0] ?? null;
}
export function workoutCounts(loaded: LoadedWorkout) {
  const sets = loaded.exercises.flatMap(exercise => exercise.sets);
  const count = (category: string) => { const list = sets.filter(set => setCategory(set) === category); return `${list.filter(set => set.status === 'completed').length}/${list.length}`; };
  return { required: count('Wymagana'), optional: count('Opcjonalna'), extra: count('Dodatkowa'), skipped: sets.filter(set => set.status === 'skipped').length };
}
export function compactSnapshot(exercise: WorkoutExercise) {
  const groups: { label: string; count: number }[] = [];
  for (const set of exercise.sets) {
    const label = `${snapshotPrescription(set)}${set.target_optional_snapshot ? ' · opcjonalna' : ''}${set.source_kind === 'extra' ? ' · dodatkowa' : ''}`;
    if (groups.at(-1)?.label === label) groups.at(-1)!.count++; else groups.push({ label, count: 1 });
  }
  return groups.slice(0, 2).map(group => `${group.count} × ${group.label}`).join(' + ') + (groups.length > 2 ? ` + ${groups.length - 2} bloków` : '');
}
export type SetDraft = Record<'reps' | 'kg' | 'duration' | 'distance' | 'rpe' | 'rir' | 'note', string>;
export function setDraft(set: WorkoutSet): SetDraft {
  return { reps: set.actual_reps?.toString() ?? '', kg: set.actual_kg?.toString() ?? '', duration: set.actual_duration_seconds?.toString() ?? '', distance: set.actual_distance_meters?.toString() ?? '', rpe: set.actual_rpe?.toString() ?? '', rir: set.actual_rir?.toString() ?? '', note: set.actual_note ?? '' };
}
export function draftPayload(setId: string, draft: SetDraft, skipped = false) {
  const number = (value: string) => skipped || value.trim() === '' ? null : Number(value);
  return { setId, status: skipped ? 'skipped' : 'completed', actualReps: number(draft.reps), actualKg: number(draft.kg), actualDurationSeconds: number(draft.duration), actualDistanceMeters: number(draft.distance), actualRpe: number(draft.rpe), actualRir: number(draft.rir), actualNote: draft.note || null };
}
export function localDateTime(instant: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat('sv-SE', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}
/** Wyliczamy kandydatów, nie zgadujemy offsetu w podwójnej godzinie DST. */
export function timeCandidates(local: string, timeZone: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return [];
  const naive = Date.parse(`${local}Z`);
  if (!Number.isFinite(naive)) return [];
  const candidates: { iso: string; offset: string }[] = [];
  for (let minutes = -840; minutes <= 840; minutes += 15) {
    const instant = new Date(naive - minutes * 60000).toISOString();
    if (localDateTime(instant, timeZone) === local) {
      const offset = `${minutes >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, '0')}:${String(Math.abs(minutes) % 60).padStart(2, '0')}`;
      candidates.push({ iso: `${local}:00${offset}`, offset });
    }
  }
  return candidates;
}

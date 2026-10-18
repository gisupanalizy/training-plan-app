import { expect, test } from 'vitest';
import { workoutFixture } from './workout-fixture';
import { actualLabel, draftPayload, nextRequired, setDraft, timeCandidates, workoutCounts, workoutOrder } from './workout-state';
test('nierówne superserie: rundy wymagane przed opcjonalną, pominięcie nie wykonuje', () => {
  const loaded = workoutFixture();
  expect(workoutOrder(loaded)).toEqual(['s1', 's4', 's2', 's3', 's5']);
  loaded.exercises[0].sets[0].status = 'skipped';
  expect(nextRequired(loaded, 's1')).toBe('s4');
  expect(workoutCounts(loaded)).toEqual({ required: '0/4', optional: '0/1', extra: '0/0', skipped: 1 });
});
test('zero pozostaje zerem, puste pola null; wynik nie kopiuje celu', () => {
  const set = workoutFixture().exercises[0].sets[0];
  expect(setDraft(set).reps).toBe('');
  expect(draftPayload(set.id, { ...setDraft(set), reps: '0' })).toMatchObject({ actualReps: 0, actualKg: null });
  set.status = 'completed'; set.actual_reps = 0; set.actual_kg = 0;
  expect(actualLabel(set)).toBe('0 powt. · 0 kg');
});
test('korekta: DST luka bez kandydata, podwójna godzina z dwoma offsetami', () => {
  expect(timeCandidates('2026-03-29T02:30', 'Europe/Warsaw')).toEqual([]);
  expect(timeCandidates('2026-10-25T02:30', 'Europe/Warsaw').map(value => value.offset).sort()).toEqual(['+01:00', '+02:00']);
  expect(timeCandidates('2026-10-15T12:00', 'Europe/Warsaw')).toEqual([{ iso: '2026-10-15T12:00:00+02:00', offset: '+02:00' }]);
});

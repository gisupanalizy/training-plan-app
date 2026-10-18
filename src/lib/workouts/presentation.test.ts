import { expect, test } from 'vitest';
import { emptySet } from '../domain/plan-editor';
import type { PlanEditorExercise } from '../domain/plan-editor';
import { compactPrescription, presentationBlocks, resolveSessionId, setPrescription, snapshotPrescription } from './presentation';
import type { WorkoutSet } from './contracts';
const exercise = (): PlanEditorExercise => ({ exerciseId: null, name: 'Przysiad', variant: null, equipment: null, supersetGroup: null, note: null,
  sets: Array.from({ length: 8 }, (_, index) => ({ ...emptySet(index + 1), repsMin: 1, restSeconds: 60, restSecondsMax: 120 })) });
test('osiem serii grupuje sąsiadująco bez zmiany wejścia; opcjonalność, notatki i rampa rozdzielają', () => {
  const value = exercise(), before = structuredClone(value);
  expect(presentationBlocks(value).map(sets => sets.length)).toEqual([8]);
  expect(compactPrescription(value)).toContain('8 × 1');
  expect(value).toEqual(before);
  value.sets[7].isOptional = true;
  expect(presentationBlocks(value).map(sets => sets.length)).toEqual([7, 1]);
  expect(compactPrescription(value)).toContain('opcjonalna');
  value.sets[2].kind = 'ramp'; value.sets[3].targetKg = 40; value.sets[4].note = 'Wskazówka';
  expect(presentationBlocks(value).length).toBeGreaterThan(4);
});
test('pełny cel zachowuje AMRAP, zakresy, dystans, zero i brak obciążenia', () => {
  expect(setPrescription({ ...emptySet(1), isAmrap: true, durationSeconds: 30, durationSecondsMax: 60, distanceMeters: 400, restSeconds: 0, targetRpe: 0 })).toBe('AMRAP + 30–60 s + 400 m · Obciążenie niepodane · Bez przerwy · RPE 0');
  expect(setPrescription({ ...emptySet(1), loadType: 'absolute', targetKg: 0 })).toContain('0 kg');
  expect(setPrescription({ ...emptySet(1), loadType: 'percent_1rm', targetPercent: 75 }, null, { date: '2026-10-18', records: [], increment: 2.5 })).toContain('brak maksimum');
});
test('wybór nie scala nazw, fallback odrzuca obce lub usunięte ID', () => {
  expect(resolveSessionId(['a', 'b'], 'b')).toBe('b');
  expect(resolveSessionId(['a', 'b'], 'old')).toBe('a');
  expect(resolveSessionId(['new'], 'b')).toBe('new');
});
test('snapshot procentowy korzysta wyłącznie z historycznego kg i zachowuje null', () => {
  const set = { position: 1, target_kind_snapshot: 'work', target_load_type_snapshot: 'percent_1rm', target_reps_min_snapshot: 5, target_reps_max_snapshot: 5, target_percent_snapshot: 75, rounded_target_kg_snapshot: 90, target_rest_seconds_snapshot: null } as WorkoutSet;
  expect(snapshotPrescription(set)).toContain('75% 1RM · 90 kg');
  expect(snapshotPrescription({ ...set, rounded_target_kg_snapshot: null })).toContain('brak maksimum');
});

test('całe opcjonalne ćwiczenie zachowuje zakres, źródła nie zmieniają identycznego celu', () => {
  const value = exercise(); value.isOptional = true; value.setCountMin = 3; value.setCountMax = 8;
  value.sets.forEach((set, index) => { set.isOptional = true; set.sourceRef = `Źródło ${index}`; });
  expect(presentationBlocks(value).map(sets => sets.length)).toEqual([8]);
  expect(compactPrescription(value)).toContain('3–8 × 1');
});
test('procent z dzisiejszego maksimum jest tylko podglądem, wariant bez maksimum pozostaje pusty', () => {
  const set = { ...emptySet(1), loadType: 'percent_1rm' as const, targetPercent: 75 };
  const context = { date: '2026-10-18', increment: 2.5, records: [{ id: 'max', exerciseId: 'squat', valueKg: 120, effectiveOn: '2026-10-17', createdAt: '2026-10-17T12:00:00Z' }] };
  expect(setPrescription(set, 'squat', context)).toContain('75% 1RM · 90 kg');
  expect(setPrescription(set, 'variant', context)).toContain('brak maksimum');
  expect(set.targetKg).toBeNull();
});

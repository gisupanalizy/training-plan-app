import { useId } from 'react';
import { formatRange } from '@/lib/domain/format';
import type { PlanEditorExercise } from '@/lib/domain/plan-editor';
import { compactPrescription, setPrescription, type TargetContext } from '@/lib/workouts/presentation';

export function ExerciseSummary({ exercise, index, context }: { exercise: PlanEditorExercise; index: number; context?: TargetContext }) {
  const detailsId = useId();
  const optionalCount = exercise.sets.filter(set => set.isOptional).length;
  const optionalText = optionalCount === 1 ? '1 seria opcjonalna' : `${optionalCount} serii opcjonalnych`;
  return <article className="preview-exercise" aria-label={exercise.name}>
    <div className="preview-exercise-title"><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><h3>{exercise.name}</h3>
    {(exercise.isOptional || exercise.supersetGroup || exercise.sets.some(set => set.isOptional)) && <span className="preview-flags">{[exercise.isOptional ? 'Ćwiczenie opcjonalne' : optionalCount ? optionalText  : null, exercise.supersetGroup && `Superseria ${exercise.supersetGroup}`].filter(Boolean).join(' · ')}</span>}</div>
    <p className="preview-prescription">{compactPrescription(exercise, context)}</p>
    <details className="preview-series" key={detailsId}>
      <summary aria-controls={detailsId}>Wszystkie serie <span>({exercise.sets.length})</span></summary>
      <div id={detailsId}>
        {exercise.originalName && <p>Oryginalna nazwa: {exercise.originalName}</p>}
        {exercise.variant && <p>Wariant: {exercise.variant}</p>}{exercise.equipment && <p>Sprzęt: {exercise.equipment}</p>}
        {exercise.note && <p className="preview-note">Uwagi: {exercise.note}</p>}
        {exercise.sourceRef && <p>Źródło: {exercise.sourceRef}</p>}
        {exercise.setCountMin != null && <p>Liczba serii: {formatRange(exercise.setCountMin, exercise.setCountMax)}</p>}
        {exercise.setCountSource && <p>Liczba serii w źródle: {exercise.setCountSource}</p>}
        {exercise.prescriptionGroup && <p>Grupa zaleceń: {exercise.prescriptionGroup}</p>}
        <ol>{exercise.sets.map(set => <li key={set.position}>
          <strong>Seria {set.position}{set.isOptional ? ' · opcjonalna' : ''}</strong>
          <p>{setPrescription(set, exercise.exerciseId, context)}</p>
          {set.note && <p>Uwagi: {set.note}</p>}{set.sourceRef && <p>Źródło: {set.sourceRef}</p>}
        </li>)}</ol>
      </div>
    </details>
  </article>;
}

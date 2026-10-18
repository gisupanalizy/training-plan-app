import { useId } from 'react';
import { formatRange } from '@/lib/domain/format';
import type { PlanEditorExercise } from '@/lib/domain/plan-editor';
import { planMetrics, targetGoal, targetLoad, type PrescriptionMetrics, type TargetContext } from '@/lib/workouts/presentation';
import { restLabel } from '@/lib/imports/review';
import { additionalSetLabel } from '@/lib/domain/compact-editor';
import { ExerciseIllustration, Icon } from '@/components/ui';
import styles from './exercise-summary.module.css';

export function PrescriptionFacts({ metrics, large = false }: { metrics: PrescriptionMetrics; large?: boolean }) {
  return <div className={`${styles.metrics} ${large ? styles.facts : ''}`}>{[['Serie × cel', metrics.series], ['Obciążenie', metrics.load], ['Przerwa', metrics.rest]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>;
}
export function ExerciseSummary({ exercise, index, context, onOpen, detail = false, onBack }: { exercise: PlanEditorExercise; index: number; context?: TargetContext; onOpen?: () => void; detail?: boolean; onBack?: () => void }) {
  const detailsId = useId();
  const optionalCount = exercise.sets.filter(set => set.isOptional).length;
  const flags = [exercise.isOptional ? 'Ćwiczenie opcjonalne' : optionalCount ? `${optionalCount} ${optionalCount === 1 ? 'seria opcjonalna' : 'serii opcjonalnych'}` : null, exercise.supersetGroup && `Superseria ${exercise.supersetGroup}`].filter(Boolean).join(' · ');
  const metrics = planMetrics(exercise, context);
  const series = <details className={`preview-series ${styles.series}`} key={detailsId} open={detail}><summary aria-controls={detailsId}>Wszystkie serie <span>({exercise.sets.length})</span></summary><div id={detailsId}>
    {exercise.originalName && <p>Oryginalna nazwa: {exercise.originalName}</p>}{exercise.variant && <p>Wariant: {exercise.variant}</p>}{exercise.equipment && <p>Sprzęt: {exercise.equipment}</p>}
    {exercise.sourceRef && <p>Źródło: {exercise.sourceRef}</p>}{exercise.setCountMin != null && <p>Liczba serii: {formatRange(exercise.setCountMin, exercise.setCountMax)}</p>}{exercise.setCountSource && <p>Liczba serii w źródle: {exercise.setCountSource}</p>}{exercise.prescriptionGroup && <p>Grupa zaleceń: {exercise.prescriptionGroup}</p>}
    <table className={styles.table}><caption>Serie w planie</caption><colgroup><col style={{ width: '14%' }} /><col style={{ width: '27%' }} /><col style={{ width: '34%' }} /><col style={{ width: '25%' }} /></colgroup><thead><tr><th scope="col">Seria</th><th scope="col">Cel</th><th scope="col">Obciążenie</th><th scope="col">Przerwa</th></tr></thead><tbody>{exercise.sets.map(set => <tr data-plan-set key={set.position}><th scope="row">{set.position}{set.isOptional && <small>opcjonalna</small>}{set.kind === 'ramp' && <small>rampa</small>}{set.kind === 'warmup' && <small>rozgrzewka</small>}</th><td>{targetGoal(set)}{additionalSetLabel(set) && <small>{additionalSetLabel(set)}</small>}{set.note && <small>Uwagi: {set.note}</small>}{set.sourceRef && <small>Źródło: {set.sourceRef}</small>}</td><td>{targetLoad(set, exercise.exerciseId, context)}</td><td>{restLabel(set)}</td></tr>)}</tbody></table>
  </div></details>;
  if (detail) return <section className={`${styles.detail} exercise-detail`}><button type="button" className={styles.back} onClick={onBack}><Icon name="arrowLeft" size={18} /> Wróć do ćwiczeń</button><div className={styles.detailTitle}><ExerciseIllustration name={exercise.name} variant={exercise.variant} equipment={exercise.equipment} /><div><h2 tabIndex={-1} id="plan-exercise-title">{exercise.name}</h2><p>Ćwiczenie {index + 1}{flags ? ` · ${flags}` : ''}</p></div></div><PrescriptionFacts metrics={metrics} large />{series}{exercise.note && <div className={styles.note}><strong>Wskazówka z planu</strong>{exercise.note}</div>}<p className={styles.source}>To zalecenia planu. Wykonanie zapiszesz po rozpoczęciu treningu.</p></section>;
  return <article className={`preview-exercise ${styles.card}`} aria-label={exercise.name}>
    <button type="button" id={`plan-exercise-${index}`} className={styles.open} aria-label={`Szczegóły: ${exercise.name}`} onClick={onOpen}><div className={styles.top}><ExerciseIllustration className={styles.thumb} name={exercise.name} variant={exercise.variant} equipment={exercise.equipment} /><div><h3>{exercise.name}</h3>{flags && <small>{flags}</small>}</div><Icon name="chevronRight" size={18} /></div><PrescriptionFacts metrics={metrics} /></button>
    {!onOpen && series}
  </article>;
}

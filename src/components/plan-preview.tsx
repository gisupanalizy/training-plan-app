'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PlanEditorDocument, PlanEditorExercise } from '@/lib/domain/plan-editor';
import { compactPrescription, resolveSessionId, type TargetContext } from '@/lib/workouts/presentation';
import { ExerciseSummary } from './exercise-summary';
import { WorkoutStart } from './workout-start';
import styles from './plan-preview.module.css';
import pageStyles from './plan-workout.module.css';

export interface PlanPreviewProps {
  planId: string; versionId: string; document: PlanEditorDocument; sessionIds: string[];
  initialSessionId?: string; current: boolean; active: (string | null)[]; context: TargetContext;
}
function previewGroups(exercises: PlanEditorExercise[]) {
  const seen = new Set<string>();
  return exercises.flatMap((exercise, index) => {
    const label = exercise.supersetGroup;
    if (!label) return [{ key: `solo-${index}`, label: null as string | null, items: [{ exercise, index }] }];
    if (seen.has(label)) return [];
    seen.add(label);
    const items = exercises.flatMap((item, itemIndex) => item.supersetGroup === label ? [{ exercise: item, index: itemIndex }] : []);
    if (items.length < 2) return [{ key: `solo-${index}`, label: null, items: [{ exercise, index }] }];
    return [{ key: `group-${label}`, label, items }];
  });
}
export function PlanPreview(props: PlanPreviewProps) {
  // Osobny mount dla wersji: pamięć poprzedniej wersji nie wycieka do nowej.
  return <VersionPreview key={`${props.planId}:${props.versionId}`} {...props} />;
}
function VersionPreview({ planId, versionId, document, sessionIds, current, active, context, initialSessionId }: PlanPreviewProps) {
  const storageKey = `forma:plan-session:${planId}:${versionId}`;
  const [selected, setSelected] = useState(resolveSessionId(sessionIds, initialSessionId ?? null));
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const scroll = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const overview = useRef<HTMLDetailsElement>(null);
  const selector = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    try { setSelected(resolveSessionId(sessionIds, initialSessionId ?? localStorage.getItem(storageKey))); } catch { /* Pamięć opcjonalna. */ }
  }, [storageKey, sessionIds, initialSessionId]);
  const index = Math.max(0, sessionIds.indexOf(selected));
  const session = document.sessions[index];
  function choose(id: string, focusHeading = false) {
    const next = resolveSessionId(sessionIds, id);
    setSelected(next); setSelectedExercise(null);
    try { localStorage.setItem(storageKey, next); } catch { /* Podgląd działa bez pamięci. */ }
    if (focusHeading) requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'nearest' }); });
  }
  const previousExercise = useRef<number | null>(null);
  useEffect(() => {
    const previous = previousExercise.current;
    previousExercise.current = selectedExercise;
    if (previous === selectedExercise) return;
    requestAnimationFrame(() => {
      if (selectedExercise != null) { window.scrollTo(0, 0); window.document.getElementById('plan-exercise-title')?.focus({ preventScroll: true }); }
      else { window.scrollTo(0, scroll.current); window.document.getElementById(`plan-exercise-${previous}`)?.focus({ preventScroll: true }); }
    });
  }, [selectedExercise]);
  function showExercise(position: number | null) { if (position != null) scroll.current = window.scrollY; setSelectedExercise(position); }
  if (!session) return <p>Brak treningów w tej wersji.</p>;
  if (selectedExercise != null && session.exercises[selectedExercise]) return <div className={`${styles.detail} ${pageStyles.detailView}`}><ExerciseSummary key={`${selected}:${selectedExercise}`} exercise={session.exercises[selectedExercise]} index={selectedExercise} context={context} detail onBack={() => showExercise(null)} /></div>;
  return <div className={`plan-preview ${styles.preview}`}>
    <label className={`preview-selector ${styles.selector}`}>Wybierz trening<select ref={selector} value={sessionIds[index]} onChange={event => choose(event.target.value)}>
      {document.sessions.map((item, position) => <option key={sessionIds[position]} value={sessionIds[position]}>{position + 1}. {item.dayLabel} · {item.exercises.length} ćw.</option>)}
    </select></label>
    <div className={`preview-session-heading ${styles.session}`}><h2 ref={heading} tabIndex={-1}>{session.dayLabel}</h2><span>{session.exercises.length} ćwiczeń · {session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} serii</span></div>
    <div className={`preview-cards ${styles.cards}`} key={`cards:${sessionIds[index]}`}>{previewGroups(session.exercises).map(group => {
      const cards = group.items.map(({ exercise, index: position }) => <ExerciseSummary key={position} exercise={exercise} index={position} context={context} onOpen={() => showExercise(position)} />);
      if (!group.label) return cards;
      return <section className={styles.superset} key={group.key} aria-label={`Superseria ${group.label}`}><p className={styles.supersetTitle}>Superseria {group.label}</p>{cards}</section>;
    })}</div>
    <div className={styles.footer}>{current ? active[index] ? <Link className={pageStyles.primary} href={`/trening/${active[index]}`}>Wznów trening</Link> : <details className="preview-start" key={`start:${sessionIds[index]}`}><summary>Rozpocznij trening</summary><WorkoutStart planSessionId={sessionIds[index]} today={context.date} /></details> : <p className={pageStyles.muted}>Wersja archiwalna · rozpocznij z aktualnej wersji.</p>}</div>
    <details className={`preview-context ${styles.context}`} key={`context:${sessionIds[index]}`}><summary>Kontekst treningu i źródła</summary><p>Tydzień {session.weekNumber} w źródle</p><p>Podgląd procentów według 1RM obowiązującego {context.date}. Cele treningu zostaną zapisane przy starcie.</p>{session.note && <p>{session.note}</p>}</details>
    <details className={`preview-overview ${styles.overview}`} ref={overview} onToggle={event => { if (!event.currentTarget.open && event.currentTarget.contains(window.document.activeElement)) selector.current?.focus(); }}>
      <summary>Podgląd całego planu</summary>
      {document.sessions.map((item, position) => <section key={sessionIds[position]}><h3>{position + 1}. {item.dayLabel}</h3><p>{item.exercises.length} ćwiczeń · {item.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} serii</p>
        <ul>{item.exercises.map((exercise, ei) => <li key={ei}><strong>{exercise.name}</strong>{exercise.isOptional ? ' · opcjonalne' : ''} · {compactPrescription(exercise, context)}{exercise.supersetGroup ? ` · superseria ${exercise.supersetGroup}` : ''}</li>)}</ul>
        <button className="button button-outline" type="button" onClick={() => { choose(sessionIds[position], true); if (overview.current) overview.current.open = false; }}>Wybierz trening {position + 1}: {item.dayLabel}</button>
      </section>)}
    </details>
  </div>;
}

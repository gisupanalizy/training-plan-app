'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { PlanEditorDocument } from '@/lib/domain/plan-editor';
import { compactPrescription, resolveSessionId, type TargetContext } from '@/lib/workouts/presentation';
import { ExerciseSummary } from './exercise-summary';
import { WorkoutStart } from './workout-start';

export interface PlanPreviewProps {
  planId: string; versionId: string; document: PlanEditorDocument; sessionIds: string[];
  current: boolean; active: (string | null)[]; context: TargetContext;
}
export function PlanPreview(props: PlanPreviewProps) {
  // Osobny mount dla wersji: pamięć poprzedniej wersji nie wycieka do nowej.
  return <VersionPreview key={`${props.planId}:${props.versionId}`} {...props} />;
}
function VersionPreview({ planId, versionId, document, sessionIds, current, active, context }: PlanPreviewProps) {
  const storageKey = `forma:plan-session:${planId}:${versionId}`;
  const [selected, setSelected] = useState(sessionIds[0] ?? '');
  const heading = useRef<HTMLHeadingElement>(null);
  const overview = useRef<HTMLDetailsElement>(null);
  const selector = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    try { setSelected(resolveSessionId(sessionIds, localStorage.getItem(storageKey))); } catch { /* Pamięć opcjonalna. */ }
  }, [storageKey, sessionIds]);
  const index = Math.max(0, sessionIds.indexOf(selected));
  const session = document.sessions[index];
  function choose(id: string, focusHeading = false) {
    const next = resolveSessionId(sessionIds, id);
    setSelected(next);
    try { localStorage.setItem(storageKey, next); } catch { /* Podgląd działa bez pamięci. */ }
    if (focusHeading) requestAnimationFrame(() => { heading.current?.focus(); heading.current?.scrollIntoView({ block: 'nearest' }); });
  }
  if (!session) return <p>Brak treningów w tej wersji.</p>;
  return <div className="plan-preview">
    <label className="preview-selector">Wybierz trening<select ref={selector} value={sessionIds[index]} onChange={event => choose(event.target.value)}>
      {document.sessions.map((item, position) => <option key={sessionIds[position]} value={sessionIds[position]}>{position + 1}. {item.dayLabel} · {item.exercises.length} ćw.</option>)}
    </select></label>
    <div className="preview-session-heading"><h2 ref={heading} tabIndex={-1}>{session.dayLabel}</h2><span>{session.exercises.length} ćwiczeń</span>
      {current ? active[index] ? <Link className="button button-dark" href={`/trening/${active[index]}`}>Wznów trening</Link> : <details className="preview-start" key={`start:${sessionIds[index]}`}><summary>Rozpocznij trening</summary><WorkoutStart planSessionId={sessionIds[index]} today={context.date} /></details> : <p>Wersja archiwalna · rozpocznij z aktualnej wersji.</p>}
    </div>
    <details className="preview-context" key={`context:${sessionIds[index]}`}><summary>Kontekst treningu i źródła</summary><p>Tydzień {session.weekNumber} w źródle</p><p>Podgląd procentów według 1RM obowiązującego {context.date}. Cele treningu zostaną zapisane przy starcie.</p>{session.note && <p>{session.note}</p>}</details>
    <div className="preview-cards" key={`cards:${sessionIds[index]}`}>{session.exercises.map((exercise, position) => <ExerciseSummary key={position} exercise={exercise} index={position} context={context} />)}</div>
    <details className="preview-overview" ref={overview} onToggle={event => { if (!event.currentTarget.open && event.currentTarget.contains(window.document.activeElement)) selector.current?.focus(); }}>
      <summary>Podgląd całego planu</summary>
      {document.sessions.map((item, position) => <section key={sessionIds[position]}><h3>{position + 1}. {item.dayLabel}</h3><p>{item.exercises.length} ćwiczeń · {item.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} serii</p>
        <ul>{item.exercises.map((exercise, ei) => <li key={ei}><strong>{exercise.name}</strong>{exercise.isOptional ? ' · opcjonalne' : ''} · {compactPrescription(exercise, context)}{exercise.supersetGroup ? ` · superseria ${exercise.supersetGroup}` : ''}</li>)}</ul>
        <button className="button button-outline" type="button" onClick={() => { choose(sessionIds[position], true); if (overview.current) overview.current.open = false; }}>Wybierz trening {position + 1}: {item.dayLabel}</button>
      </section>)}
    </details>
  </div>;
}

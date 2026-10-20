"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { emptyDocument, withReviewIds, parsePlanEditorDocument, type PlanEditorDocument, type PlanEditorExercise, type PlanEditorSession } from '@/lib/domain/plan-editor';
import { additionalSetLabel, validateEditorExercise } from '@/lib/domain/compact-editor';
import { seriesBlocks, exerciseSummary, loadLabel, restLabel, optionalLabel, sessionGroups, newReviewExercise, groupProblems, goalLabel } from '@/lib/imports/review';
import { ReviewDialog } from './review-dialog';
import { ReviewGroupEdit } from './review-group-edit';
import { PlanExerciseEdit, PlanSeriesEdit, PlanDayEdit, type CatalogExercise } from './plan-edit-dialogs';
import { Button, ExerciseIllustration, Icon } from '@/components/ui';
import { PrescriptionFacts } from './exercise-summary';
import { planMetrics } from '@/lib/workouts/presentation';
import styles from './plan-authoring.module.css';
import { VoiceInput, type VoiceResult } from './voice-input';

type Modal = { type: 'exercise' | 'series' | 'addSeries'; sessionId: string; exerciseId: string }
  | { type: 'addExercise'; sessionId: string; exercise: PlanEditorExercise }
  | { type: 'day' | 'deleteDay'; sessionId: string }
  | { type: 'addDay'; session: PlanEditorSession }
  | { type: 'deleteExercise'; sessionId: string; exerciseId: string }
  | { type: 'group'; sessionId: string; group: string | null }
  | { type: 'overview' | 'voice' };
type SavePayload = { operationId: string; planId: string | null; expectedVersionId: string | null; document: PlanEditorDocument };

export function CompactPlanEditor({ initial, planId, expectedVersionId, catalog, initialVoice = false }: {
  initial?: PlanEditorDocument; planId: string | null; expectedVersionId: string | null; catalog: CatalogExercise[]; initialVoice?: boolean;
}) {
  const [document, setDocument] = useState(() => withReviewIds(initial ?? emptyDocument()));
  const [activeId, setActiveId] = useState(document.sessions[0].reviewId!);
  const [modal, setModal] = useState<Modal | null>(initialVoice ? { type: 'voice' } : null);
  const [dirty, setDirty] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const pending = useRef<SavePayload | null>(null);
  const busy = useRef(false);
  const warn = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const active = document.sessions.find(session => session.reviewId === activeId) ?? document.sessions[0];
  warn.current = dirty || formDirty;
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (warn.current) { event.preventDefault(); event.returnValue = ''; } };
    const leave = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!warn.current || !anchor || anchor.download || anchor.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (new URL(anchor.href).href === window.location.href) return;
      if (!window.confirm('Masz niezapisane zmiany w planie. Opuścić edytor?')) { event.preventDefault(); event.stopPropagation(); }
      else warn.current = false;
    };
    // Navigation API pozwala zablokować także przycisk Wstecz w Chrome, bez zmiany historii.
    const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
    const traverse = (event: Event) => {
      if ((event as Event & { navigationType?: string }).navigationType === 'traverse' && event.cancelable && warn.current) {
        if (!window.confirm('Masz niezapisane zmiany w planie. Opuścić edytor?')) event.preventDefault(); else warn.current = false;
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.document.addEventListener('click', leave, true);
    navigation?.addEventListener('navigate', traverse);
    return () => { window.removeEventListener('beforeunload', beforeUnload); window.document.removeEventListener('click', leave, true); navigation?.removeEventListener('navigate', traverse); };
  }, []);
  function edit(change: (draft: PlanEditorDocument) => void) {
    if (busy.current) return;
    const next = structuredClone(document); change(next); setDocument(next); setDirty(true); setError(''); pending.current = null;
  }
  function select(id: string) { setActiveId(id); requestAnimationFrame(() => heading.current?.focus()); }
  function close() { if (!busy.current) { setModal(null); setVoiceResult(null); setFormDirty(false); } }
  function open(next: Modal) { if (!busy.current) { setModal(next); setFormDirty(false); } }
  function replaceExercise(exercise: PlanEditorExercise, targetId?: string) {
    if (!modal || !('sessionId' in modal)) return;
    const sourceId = modal.sessionId, destination = targetId ?? sourceId;
    edit(draft => {
      const source = draft.sessions.find(session => session.reviewId === sourceId)!;
      const target = draft.sessions.find(session => session.reviewId === destination)!;
      if (modal.type === 'addExercise') target.exercises.push(exercise);
      else if (sourceId === destination) source.exercises[source.exercises.findIndex(item => item.reviewId === exercise.reviewId)] = exercise;
      else { source.exercises = source.exercises.filter(item => item.reviewId !== exercise.reviewId); target.exercises.push({ ...exercise, supersetGroup: null }); }
    });
    setActiveId(destination); close();
  }
  function moveExercise(sessionId: string, exerciseId: string, delta: number) {
    edit(draft => { const list = draft.sessions.find(session => session.reviewId === sessionId)!.exercises;
      const index = list.findIndex(item => item.reviewId === exerciseId); if (index + delta < 0 || index + delta >= list.length) return;
      [list[index], list[index + delta]] = [list[index + delta], list[index]];
    });
  }
  async function save() {
    if (busy.current) return;
    setError('');
    try {
      parsePlanEditorDocument(document);
      const problems = groupProblems(document); if (problems.length) throw new Error(problems.join(' '));
    } catch (cause) {
      let message = (cause as Error).message;
      for (const session of document.sessions) {
        try { parsePlanEditorDocument({ name: document.name || 'Plan', sessions: [session] }); }
        catch {
          setActiveId(session.reviewId!);
          const incomplete = session.exercises.find(exercise => { try { validateEditorExercise(exercise); return false; } catch { return true; } });
          message = `Tydzień ${session.weekNumber} · ${session.dayLabel || 'trening bez nazwy'}${incomplete ? ` · ${incomplete.name || 'ćwiczenie bez nazwy'}` : ''}: ${message}`;
          break;
        }
      }
      setError(message); return;
    }
    pending.current ??= { operationId: crypto.randomUUID(), planId, expectedVersionId, document: structuredClone(document) };
    busy.current = true; setSaving(true);
    try {
      const response = await fetch('/api/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pending.current) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? 'Nie udało się zapisać planu.'); return; }
      warn.current = false; setDirty(false); pending.current = null;
      router.push(`/plany/${result.planId}`); router.refresh();
    } catch { setError('Brak potwierdzenia serwera. Ponów zapis; użyjemy tej samej operacji.'); }
    finally { busy.current = false; setSaving(false); }
  }
  const modalSession = modal && 'sessionId' in modal ? document.sessions.find(session => session.reviewId === modal.sessionId) : undefined;
  const modalExercise = modal && 'exerciseId' in modal ? modalSession?.exercises.find(exercise => exercise.reviewId === modal.exerciseId) : undefined;
  const voicePlan = voiceResult?.proposal as { document: PlanEditorDocument; issues: { path: string; message: string }[] } | undefined;
  function applyVoice() {
    if (!voicePlan) return;
    edit(draft => {
      if (!draft.name.trim()) draft.name = voicePlan.document.name;
      const blank = draft.sessions.every(session => session.exercises.every(exercise => !exercise.name.trim()));
      const incoming = withReviewIds(voicePlan.document);
      incoming.sessions.forEach(session => {
        session.reviewId = crypto.randomUUID();
        session.exercises.forEach(exercise => {
          exercise.reviewId = crypto.randomUUID();
          exercise.sets.forEach(set => { set.reviewId = crypto.randomUUID(); });
        });
      });
      draft.sessions = blank ? incoming.sessions : [...draft.sessions, ...incoming.sessions];
    });
    close();
  }
  function card(exercise: PlanEditorExercise, session: PlanEditorSession, readonly = false) {
    const blocks = seriesBlocks(exercise);
    const shortGoal = blocks.slice(0, 2).map(block => `${block.minimum === block.maximum ? block.maximum : `${block.minimum}–${block.maximum}`} × ${goalLabel(block.sets[0], true)}`).join(' + ') + (blocks.length > 2 ? ` + ${blocks.length - 2} ${blocks.length === 3 ? 'blok' : 'bloków'}` : '');
    const content = <><div className={styles.cardTop}><ExerciseIllustration className={styles.thumb} name={exercise.name} variant={exercise.variant} equipment={exercise.equipment} /><div><h3>{exercise.name || 'Uzupełnij ćwiczenie'}</h3>{[exercise.variant, exercise.equipment, optionalLabel(exercise)].filter(Boolean).length > 0 && <small>{[exercise.variant, exercise.equipment, optionalLabel(exercise)].filter(Boolean).join(' · ')}</small>}</div>{!readonly && <Icon name="chevronRight" size={18} />}</div><PrescriptionFacts metrics={{ ...planMetrics(exercise), series: shortGoal }} /></>;
    return <article className="review-exercise-card plan-exercise-card" key={exercise.reviewId} data-exercise-id={exercise.reviewId}>{readonly ? <div className={styles.cardOpen}>{content}</div> : <button type="button" className={styles.cardOpen} aria-label={`Edytuj ćwiczenie: ${exercise.name || 'Uzupełnij ćwiczenie'}`} onClick={() => open({ type: 'exercise', sessionId: session.reviewId!, exerciseId: exercise.reviewId! })}>{content}</button>}</article>;
  }
  function trainingCards(session: PlanEditorSession, readonly = false) {
    return <div className="review-cards">{sessionGroups(session).map(group => group.label ? <section className="review-superset" key={group.id}><div className="review-superset-heading"><div><strong>Superseria {group.label}</strong><span>{group.exercises.length} ćwiczeń</span></div>{!readonly && <button type="button" onClick={() => open({ type: 'group', sessionId: session.reviewId!, group: group.label })}>Edytuj superserię</button>}</div>{group.exercises.map(exercise => card(exercise, session, readonly))}</section> : card(group.exercises[0], session, readonly))}</div>;
  }
  const titles: Record<Modal['type'], string> = { exercise: 'Edytuj ćwiczenie', addExercise: 'Dodaj ćwiczenie', series: 'Edytuj serie', addSeries: 'Dodaj blok serii', day: 'Edytuj trening', addDay: 'Dodaj trening', deleteDay: 'Usuń trening', deleteExercise: 'Usuń ćwiczenie', group: 'Edytuj superserię', overview: 'Podgląd całego planu', voice: 'Dyktuj fragment planu' };
  return <div className={`editor compact-plan-editor ${styles.editor}`}>
    <fieldset disabled={saving} className="plan-workspace" onChange={() => { if (modal) setFormDirty(true); }} onClick={event => {
      if (modal?.type === 'group' && (event.target as Element).closest('button[aria-label^="W górę"],button[aria-label^="W dół"]')) setFormDirty(true);
    }}>
      <section className="editor-card plan-toolbar"><label className="editor-field">Nazwa planu<input maxLength={120} value={document.name} placeholder="Np. Fundament siły" onChange={event => edit(draft => { draft.name = event.target.value; })} /></label>

        <label className="editor-field">Wybierz trening<select value={active.reviewId} onChange={event => select(event.target.value)}>{document.sessions.map(session => <option value={session.reviewId} key={session.reviewId}>{document.sessions.indexOf(session) + 1}. {session.dayLabel || 'Bez nazwy'} · {session.exercises.length} ćw.</option>)}</select></label>
      </section>
      <section className="plan-training"><div className="plan-training-heading"><h2 ref={heading} tabIndex={-1} data-review-heading>{active.dayLabel || 'Trening bez nazwy'}</h2><span className="small-muted">{active.exercises.length} ćwiczeń</span></div>
        {trainingCards(active)}
        {!!active.exercises.length && <details className={styles.organization}><summary>Kolejność i ustawienia treningu</summary><button type="button" onClick={() => open({ type: 'day', sessionId: active.reviewId! })}>Edytuj trening</button>{active.note && <p className="review-hint">{active.note}</p>}{active.exercises.map((exercise, index) => <div key={exercise.reviewId} className={styles.orderRow}><span>{index + 1}. {exercise.name}</span><button type="button" aria-label={`Przesuń w górę: ${exercise.name || 'ćwiczenie'}`} disabled={index === 0} onClick={() => moveExercise(active.reviewId!, exercise.reviewId!, -1)}><Icon name="chevronLeft" size={18} /></button><button type="button" aria-label={`Przesuń w dół: ${exercise.name || 'ćwiczenie'}`} disabled={index === active.exercises.length - 1} onClick={() => moveExercise(active.reviewId!, exercise.reviewId!, 1)}><Icon name="chevronRight" size={18} /></button></div>)}</details>}
        {!active.exercises.length && <p className="review-hint">Dodaj ćwiczenie, aby uzupełnić ten trening.</p>}
        <div className="plan-add-actions"><Button variant="secondary" disabled={active.exercises.length >= 50} onClick={() => open({ type: 'addExercise', sessionId: active.reviewId!, exercise: newReviewExercise('') })}>+ Dodaj ćwiczenie</Button><Button variant="ghost" onClick={() => open({ type: 'group', sessionId: active.reviewId!, group: null })} disabled={active.exercises.length < 2}>+ Utwórz superserię</Button></div>
      </section>
        <div className="plan-toolbar-actions"><Button variant="ghost" onClick={() => open({ type: 'overview' })}>Podgląd całego planu</Button><Button variant="ghost" onClick={() => open({ type: 'voice' })}>Dyktuj fragment planu</Button></div>
      <Button variant="secondary" disabled={document.sessions.length >= 52} onClick={() => open({ type: 'addDay', session: { reviewId: crypto.randomUUID(), weekNumber: active.weekNumber, dayLabel: '', note: null, exercises: [] } })}>+ Dodaj trening</Button>
      {modal && <ReviewDialog key={`${modal.type}:${'exerciseId' in modal ? modal.exerciseId : 'sessionId' in modal ? modal.sessionId : ''}`} title={titles[modal.type]} onClose={close}>
        {(modal.type === 'exercise' || modal.type === 'addExercise') && modalSession && <PlanExerciseEdit exercise={modal.type === 'addExercise' ? modal.exercise : modalExercise!} document={document} sessionId={modal.sessionId} catalog={catalog} onApply={replaceExercise} onCancel={close}
          onDelete={modal.type === 'exercise' && modalSession.exercises.length > 1 ? () => open({ type: 'deleteExercise', sessionId: modal.sessionId, exerciseId: modalExercise!.reviewId! }) : undefined} />}
        {(modal.type === 'series' || modal.type === 'addSeries') && modalExercise && <PlanSeriesEdit exercise={modalExercise} adding={modal.type === 'addSeries'} onApply={replaceExercise} onCancel={close} />}
        {(modal.type === 'day' || modal.type === 'addDay') && <PlanDayEdit session={modal.type === 'addDay' ? modal.session : modalSession!} position={modal.type === 'addDay' ? document.sessions.length : document.sessions.indexOf(modalSession!)} total={document.sessions.length + (modal.type === 'addDay' ? 1 : 0)} onCancel={close} onApply={(session, position) => {
          edit(draft => { draft.sessions = draft.sessions.filter(item => item.reviewId !== session.reviewId); draft.sessions.splice(position, 0, session); }); setActiveId(session.reviewId!); close();
        }} onDelete={modal.type === 'day' && document.sessions.length > 1 ? () => open({ type: 'deleteDay', sessionId: modal.sessionId }) : undefined} />}
        {modal.type === 'group' && modalSession && <><ReviewGroupEdit session={modalSession} group={modal.group} onApply={session => { edit(draft => { draft.sessions[draft.sessions.findIndex(item => item.reviewId === session.reviewId)] = session; }); close(); }} /><button type="button" onClick={close}>Anuluj</button></>}
        {(modal.type === 'deleteDay' || modal.type === 'deleteExercise') && <><p>Czy usunąć {modal.type === 'deleteDay' ? `trening „${modalSession!.dayLabel}” wraz z ćwiczeniami` : `ćwiczenie „${modalExercise!.name}” wraz z seriami`} z nowej wersji planu?</p><div className="review-dialog-footer"><Button variant="ghost" onClick={close}>Anuluj</Button><Button variant="danger" onClick={() => {
          edit(draft => { if (modal.type === 'deleteDay') draft.sessions = draft.sessions.filter(session => session.reviewId !== modal.sessionId); if (modal.type === 'deleteExercise') { const session = draft.sessions.find(item => item.reviewId === modal.sessionId)!; session.exercises = session.exercises.filter(item => item.reviewId !== modal.exerciseId); } }); close();
        }}>Potwierdź usunięcie</Button></div></>}
        {modal.type === 'overview' && <><p className="review-hint">{document.sessions.length} treningów · podgląd bieżącego szkicu</p>{document.sessions.map(session => <details className="plan-overview-day" key={session.reviewId} open={session.reviewId === active.reviewId}><summary>Tydzień {session.weekNumber} · {session.dayLabel || 'Bez nazwy'} · {session.exercises.length} ćw.</summary>{session.note && <p>{session.note}</p>}{trainingCards(session, true)}{session.exercises.map(exercise => <button type="button" className="review-link" key={exercise.reviewId} onClick={() => { setActiveId(session.reviewId!); open({ type: 'exercise', sessionId: session.reviewId!, exerciseId: exercise.reviewId! }); }}>Edytuj: {exercise.name || 'Uzupełnij ćwiczenie'}</button>)}<button type="button" onClick={() => { close(); select(session.reviewId!); }}>Przejdź do treningu {session.dayLabel}</button></details>)}<button type="button" onClick={close}>Wróć do edytora</button></>}
        {modal.type === 'voice' && <><VoiceInput scope="plan" label="Plan i serie" onProposal={setVoiceResult} />{voicePlan && voiceResult && <div className="voice-proposal"><strong>Propozycja do szkicu planu</strong><p>Transkrypcja: {voiceResult.transcript}</p>
          {voicePlan.document.sessions.map((session, index) => <div key={index}><strong>{session.dayLabel}</strong>{session.exercises.map((exercise, exerciseIndex) => <p key={exerciseIndex}>{exercise.name}: {exercise.sets.map(set => `${goalLabel(set)} · ${loadLabel(set)}`).join('; ')}</p>)}</div>)}
          {voicePlan.issues.length > 0 && <p role="alert">Do sprawdzenia: {voicePlan.issues.map(issue => issue.message).join('; ')}</p>}
          <Button variant="primary" onClick={applyVoice}>Dodaj propozycję do szkicu</Button><p className="small-muted">Propozycja wymaga przeglądu. Publikacja planu jest osobnym działaniem.</p></div>}<Button variant="ghost" onClick={close}>Anuluj</Button></>}
      </ReviewDialog>}
    </fieldset>
    <div className="editor-footer plan-save-bar"><div role="status" className="plan-save-status">{saving ? 'Zapisywanie…' : dirty ? 'Niezapisane zmiany' : planId ? 'Plan bez zmian' : 'Nowy szkic planu'}<small>Zapis publikuje cały plan jako {planId ? 'nową wersję' : 'pierwszą wersję'}. Szkic nie zapisuje się sam.</small></div><Button variant="primary" disabled={saving || !!modal} onClick={save}>{saving ? 'Zapisywanie…' : planId ? 'Opublikuj nową wersję' : 'Utwórz plan'}</Button></div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <p className="small-muted">Poprzednie wersje i historyczne treningi pozostają zachowane. Procenty bez rzeczywistego 1RM mają pusty cel kg. Szkic nie jest automatycznie zapisywany.</p>
  </div>;
}

"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { emptyDocument, withReviewIds, parsePlanEditorDocument, type PlanEditorDocument, type PlanEditorExercise, type PlanEditorSession } from '@/lib/domain/plan-editor';
import { additionalSetLabel, validateEditorExercise } from '@/lib/domain/compact-editor';
import { seriesBlocks, exerciseSummary, loadLabel, restLabel, optionalLabel, sessionGroups, newReviewExercise, groupProblems, goalLabel } from '@/lib/imports/review';
import { ReviewDialog } from './review-dialog';
import { ReviewGroupEdit } from './review-group-edit';
import { PlanExerciseEdit, PlanSeriesEdit, PlanDayEdit, type CatalogExercise } from './plan-edit-dialogs';
import { VoiceInput, type VoiceResult } from './voice-input';

type Modal = { type: 'exercise' | 'series' | 'addSeries'; sessionId: string; exerciseId: string }
  | { type: 'addExercise'; sessionId: string; exercise: PlanEditorExercise }
  | { type: 'day' | 'deleteDay'; sessionId: string }
  | { type: 'addDay'; session: PlanEditorSession }
  | { type: 'deleteExercise'; sessionId: string; exerciseId: string }
  | { type: 'group'; sessionId: string; group: string | null }
  | { type: 'overview' | 'voice' };
type SavePayload = { operationId: string; planId: string | null; expectedVersionId: string | null; document: PlanEditorDocument };

export function CompactPlanEditor({ initial, planId, expectedVersionId, catalog }: {
  initial?: PlanEditorDocument; planId: string | null; expectedVersionId: string | null; catalog: CatalogExercise[];
}) {
  const [document, setDocument] = useState(() => withReviewIds(initial ?? emptyDocument()));
  const [activeId, setActiveId] = useState(document.sessions[0].reviewId!);
  const [modal, setModal] = useState<Modal | null>(null);
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
  function card(exercise: PlanEditorExercise, session: PlanEditorSession, readonly = false) {
    const blocks = seriesBlocks(exercise), index = session.exercises.indexOf(exercise);
    return <article className="review-exercise-card plan-exercise-card" key={exercise.reviewId} data-exercise-id={exercise.reviewId}>
      <div className="review-card-heading"><div><span className="small-muted">Ćwiczenie {index + 1}</span><h3>{exercise.name || 'Uzupełnij ćwiczenie'}</h3>
        {[exercise.variant, exercise.equipment].filter(Boolean).length > 0 && <p className="review-hint">{[exercise.variant, exercise.equipment].filter(Boolean).join(' · ')}</p>}</div>
        {!readonly && <div className="editor-actions"><button type="button" aria-label={`Przesuń w górę: ${exercise.name || 'ćwiczenie'}`} disabled={index === 0} onClick={() => moveExercise(session.reviewId!, exercise.reviewId!, -1)}>↑</button><button type="button" aria-label={`Przesuń w dół: ${exercise.name || 'ćwiczenie'}`} disabled={index === session.exercises.length - 1} onClick={() => moveExercise(session.reviewId!, exercise.reviewId!, 1)}>↓</button></div>}
      </div>
      <p className="review-prescription">{exerciseSummary(exercise)}</p>
      <div className="plan-blocks">{blocks.map(block => <div className="plan-block" key={block.sets[0].reviewId}><span>{blocks.length > 1 && <strong>Serie {block.sets[0].position}–{block.sets.at(-1)!.position}: {goalLabel(block.sets[0], true)} · </strong>}{loadLabel(block.sets[0])} · {restLabel(block.sets[0])}</span>
        {additionalSetLabel(block.sets[0]) && <small>{additionalSetLabel(block.sets[0])}</small>}</div>)}</div>
      {optionalLabel(exercise) && <p className="review-hint">{optionalLabel(exercise)}</p>}
      {exercise.originalName && exercise.originalName !== exercise.name && <p className="source-original">W źródle: {exercise.originalName}</p>}
      {(exercise.note || exercise.sets.some(set => set.note)) && <details className="review-more plan-notes"><summary>Uwagi{exercise.note ? ` — ${exercise.note.slice(0, 90)}${exercise.note.length > 90 ? '…' : ''}` : ' do serii'}</summary>{exercise.note && <p>{exercise.note}</p>}{exercise.sets.filter(set => set.note).map(set => <p key={set.reviewId}><strong>Seria {set.position}:</strong> {set.note}</p>)}</details>}
      {!readonly && <div className="plan-card-actions"><button type="button" onClick={() => open({ type: 'exercise', sessionId: session.reviewId!, exerciseId: exercise.reviewId! })}>Edytuj ćwiczenie</button><button type="button" onClick={() => open({ type: 'series', sessionId: session.reviewId!, exerciseId: exercise.reviewId! })}>Edytuj serie</button>
        <button type="button" className="review-link" disabled={exercise.sets.length >= 30} onClick={() => open({ type: 'addSeries', sessionId: session.reviewId!, exerciseId: exercise.reviewId! })}>+ Dodaj blok serii</button></div>}
    </article>;
  }
  function trainingCards(session: PlanEditorSession, readonly = false) {
    return <div className="review-cards">{sessionGroups(session).map(group => group.label ? <section className="review-superset" key={group.id}><div className="review-superset-heading"><div><strong>Superseria {group.label}</strong><span>{group.exercises.length} ćwiczeń</span></div>{!readonly && <button type="button" onClick={() => open({ type: 'group', sessionId: session.reviewId!, group: group.label })}>Edytuj superserię</button>}</div>{group.exercises.map(exercise => card(exercise, session, readonly))}</section> : card(group.exercises[0], session, readonly))}</div>;
  }
  const titles: Record<Modal['type'], string> = { exercise: 'Edytuj ćwiczenie', addExercise: 'Dodaj ćwiczenie', series: 'Edytuj serie', addSeries: 'Dodaj blok serii', day: 'Edytuj trening', addDay: 'Dodaj trening', deleteDay: 'Usuń trening', deleteExercise: 'Usuń ćwiczenie', group: 'Edytuj superserię', overview: 'Podgląd całego planu', voice: 'Dyktuj fragment planu' };
  return <div className="editor compact-plan-editor">
    <fieldset disabled={saving} className="plan-workspace" onChange={() => { if (modal) setFormDirty(true); }} onClick={event => {
      if (modal?.type === 'group' && (event.target as Element).closest('button[aria-label^="W górę"],button[aria-label^="W dół"]')) setFormDirty(true);
    }}>
      <section className="editor-card plan-toolbar"><label className="editor-field">Nazwa planu<input maxLength={120} value={document.name} placeholder="Np. Fundament siły" onChange={event => edit(draft => { draft.name = event.target.value; })} /></label>
        <div className="plan-toolbar-actions"><button type="button" onClick={() => open({ type: 'overview' })}>Podgląd całego planu</button><button type="button" onClick={() => open({ type: 'voice' })}>Dyktuj fragment planu</button></div>
        <label className="editor-field">Wybierz trening<select value={active.reviewId} onChange={event => select(event.target.value)}>{document.sessions.map(session => <option value={session.reviewId} key={session.reviewId}>Tydzień {session.weekNumber} · {session.dayLabel || 'Bez nazwy'} · {session.exercises.length} ćw.</option>)}</select></label>
      </section>
      <section className="plan-training"><div className="plan-training-heading"><div><span className="eyebrow">Tydzień {active.weekNumber}</span><h2 ref={heading} tabIndex={-1} data-review-heading>{active.dayLabel || 'Trening bez nazwy'}</h2><p className="small-muted">{active.exercises.length} ćwiczeń · {active.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} serii</p></div><button type="button" onClick={() => open({ type: 'day', sessionId: active.reviewId! })}>Edytuj trening</button></div>
        {active.note && <details className="review-more plan-day-notes"><summary>Uwagi do treningu — {active.note.slice(0, 90)}</summary><p>{active.note}</p></details>}
        {trainingCards(active)}
        {!active.exercises.length && <p className="review-hint">Dodaj ćwiczenie, aby uzupełnić ten trening.</p>}
        <div className="plan-add-actions"><button type="button" className="button button-outline" disabled={active.exercises.length >= 50} onClick={() => open({ type: 'addExercise', sessionId: active.reviewId!, exercise: newReviewExercise('') })}>+ Dodaj ćwiczenie</button><button type="button" onClick={() => open({ type: 'group', sessionId: active.reviewId!, group: null })} disabled={active.exercises.length < 2}>+ Utwórz superserię</button></div>
      </section>
      <button type="button" className="button button-outline" disabled={document.sessions.length >= 52} onClick={() => open({ type: 'addDay', session: { reviewId: crypto.randomUUID(), weekNumber: active.weekNumber, dayLabel: '', note: null, exercises: [] } })}>+ Dodaj trening</button>
      {modal && <ReviewDialog key={`${modal.type}:${'exerciseId' in modal ? modal.exerciseId : 'sessionId' in modal ? modal.sessionId : ''}`} title={titles[modal.type]} onClose={close}>
        {(modal.type === 'exercise' || modal.type === 'addExercise') && modalSession && <PlanExerciseEdit exercise={modal.type === 'addExercise' ? modal.exercise : modalExercise!} document={document} sessionId={modal.sessionId} catalog={catalog} onApply={replaceExercise} onCancel={close}
          onDelete={modal.type === 'exercise' && modalSession.exercises.length > 1 ? () => open({ type: 'deleteExercise', sessionId: modal.sessionId, exerciseId: modalExercise!.reviewId! }) : undefined} />}
        {(modal.type === 'series' || modal.type === 'addSeries') && modalExercise && <PlanSeriesEdit exercise={modalExercise} adding={modal.type === 'addSeries'} onApply={replaceExercise} onCancel={close} />}
        {(modal.type === 'day' || modal.type === 'addDay') && <PlanDayEdit session={modal.type === 'addDay' ? modal.session : modalSession!} position={modal.type === 'addDay' ? document.sessions.length : document.sessions.indexOf(modalSession!)} total={document.sessions.length + (modal.type === 'addDay' ? 1 : 0)} onCancel={close} onApply={(session, position) => {
          edit(draft => { draft.sessions = draft.sessions.filter(item => item.reviewId !== session.reviewId); draft.sessions.splice(position, 0, session); }); setActiveId(session.reviewId!); close();
        }} onDelete={modal.type === 'day' && document.sessions.length > 1 ? () => open({ type: 'deleteDay', sessionId: modal.sessionId }) : undefined} />}
        {modal.type === 'group' && modalSession && <><ReviewGroupEdit session={modalSession} group={modal.group} onApply={session => { edit(draft => { draft.sessions[draft.sessions.findIndex(item => item.reviewId === session.reviewId)] = session; }); close(); }} /><button type="button" onClick={close}>Anuluj</button></>}
        {(modal.type === 'deleteDay' || modal.type === 'deleteExercise') && <><p>Czy usunąć {modal.type === 'deleteDay' ? `trening „${modalSession!.dayLabel}” wraz z ćwiczeniami` : `ćwiczenie „${modalExercise!.name}” wraz z seriami`} z nowej wersji planu?</p><div className="review-dialog-footer"><button type="button" onClick={close}>Anuluj</button><button type="button" className="review-danger" onClick={() => {
          edit(draft => { if (modal.type === 'deleteDay') draft.sessions = draft.sessions.filter(session => session.reviewId !== modal.sessionId); if (modal.type === 'deleteExercise') { const session = draft.sessions.find(item => item.reviewId === modal.sessionId)!; session.exercises = session.exercises.filter(item => item.reviewId !== modal.exerciseId); } }); close();
        }}>Potwierdź usunięcie</button></div></>}
        {modal.type === 'overview' && <><p className="review-hint">{document.sessions.length} treningów · podgląd bieżącego szkicu</p>{document.sessions.map(session => <details className="plan-overview-day" key={session.reviewId} open={session.reviewId === active.reviewId}><summary>Tydzień {session.weekNumber} · {session.dayLabel || 'Bez nazwy'} · {session.exercises.length} ćw.</summary>{session.note && <p>{session.note}</p>}{trainingCards(session, true)}{session.exercises.map(exercise => <button type="button" className="review-link" key={exercise.reviewId} onClick={() => { setActiveId(session.reviewId!); open({ type: 'exercise', sessionId: session.reviewId!, exerciseId: exercise.reviewId! }); }}>Edytuj: {exercise.name || 'Uzupełnij ćwiczenie'}</button>)}<button type="button" onClick={() => { close(); select(session.reviewId!); }}>Przejdź do treningu {session.dayLabel}</button></details>)}<button type="button" onClick={close}>Wróć do edytora</button></>}
        {modal.type === 'voice' && <><VoiceInput scope="plan" label="Plan i serie" onProposal={setVoiceResult} />{voicePlan && voiceResult && <div className="voice-proposal"><strong>Propozycja do szkicu planu</strong><p>Transkrypcja: {voiceResult.transcript}</p>
          {voicePlan.document.sessions.map((session, index) => <div key={index}><strong>{session.dayLabel}</strong>{session.exercises.map((exercise, exerciseIndex) => <p key={exerciseIndex}>{exercise.name}: {exercise.sets.map(set => `${goalLabel(set)} · ${loadLabel(set)}`).join('; ')}</p>)}</div>)}
          {voicePlan.issues.length > 0 && <p role="alert">Do sprawdzenia: {voicePlan.issues.map(issue => issue.message).join('; ')}</p>}
          <button type="button" onClick={() => { edit(draft => { if (!draft.name.trim()) draft.name = voicePlan.document.name; const blank = draft.sessions.every(session => session.exercises.every(exercise => !exercise.name.trim()));
            const incoming = withReviewIds(voicePlan.document); incoming.sessions.forEach(session => { session.reviewId = crypto.randomUUID(); session.exercises.forEach(exercise => { exercise.reviewId = crypto.randomUUID(); exercise.sets.forEach(set => { set.reviewId = crypto.randomUUID(); }); }); });
            draft.sessions = blank ? incoming.sessions : [...draft.sessions, ...incoming.sessions]; }); close(); }}>Dodaj propozycję do szkicu</button><p className="small-muted">Propozycja wymaga przeglądu. Publikacja planu jest osobnym działaniem.</p></div>}<button type="button" onClick={close}>Anuluj</button></>}
      </ReviewDialog>}
    </fieldset>
    <div className="editor-footer plan-save-bar"><div role="status" className="plan-save-status">{saving ? 'Zapisywanie…' : dirty ? 'Niezapisane zmiany' : planId ? 'Plan bez zmian' : 'Nowy szkic planu'}<small>Zapis publikuje cały plan jako {planId ? 'nową wersję' : 'pierwszą wersję'}.</small></div><button type="button" className="button button-dark" disabled={saving || !!modal} onClick={save}>{saving ? 'Zapisywanie…' : planId ? 'Opublikuj nową wersję' : 'Utwórz plan'}</button></div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <p className="small-muted">Poprzednie wersje i historyczne treningi pozostają zachowane. Procenty bez rzeczywistego 1RM mają pusty cel kg. Szkic nie jest automatycznie zapisywany.</p>
  </div>;
}

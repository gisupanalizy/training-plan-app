"use client";
import { useRef, useState } from 'react';
import type { PlannedSetInput } from '@/lib/domain/model';
import { emptySet, type PlanEditorExercise, type PlanEditorDocument, type PlanEditorSession } from '@/lib/domain/plan-editor';
import { validateEditorExercise, synchronizeSetCounts } from '@/lib/domain/compact-editor';
import { seriesBlocks, patchSeries, resizeSeriesBlock, exerciseSummary, goalLabel } from '@/lib/imports/review';
import { Button } from '@/components/ui';
import { PlanSetFields, RangeField } from './plan-set-fields';
import { ExerciseNamePicker } from './exercise-name-picker';

export type CatalogExercise = { id: string; name: string; variant: string | null; equipment: string | null };
export function PlanExerciseEdit({ exercise, document, sessionId, catalog, onApply, onCancel, onDelete }: {
  exercise: PlanEditorExercise; document: PlanEditorDocument; sessionId: string; catalog: CatalogExercise[];
  onApply: (exercise: PlanEditorExercise, targetId: string) => void; onCancel: () => void; onDelete?: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(exercise));
  const [target, setTarget] = useState(sessionId);
  const [error, setError] = useState('');
  const [seriesValid, setSeriesValid] = useState(true);
  return <form onSubmit={event => { event.preventDefault(); try { if (!seriesValid) throw new Error('Podaj poprawną liczbę serii.'); validateEditorExercise(draft); onApply(draft, target); } catch (cause) { setError((cause as Error).message); } }}>
    <label className="editor-field">Nazwa ćwiczenia<input maxLength={120} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
    <h3>Serie i parametry</h3><FullExerciseSeries exercise={draft} onChange={setDraft} onValidity={setSeriesValid} />
    <details className="review-more"><summary>Katalog, wariant i przypisanie do treningu</summary>
    <label className="editor-field">Zapisane ćwiczenie<select value={draft.exerciseId ?? ''} onChange={event => {
      const item = catalog.find(entry => entry.id === event.target.value);
      setDraft(current => ({ ...current, exerciseId: item?.id ?? null, ...(item ? { name: item.name, variant: item.variant, equipment: item.equipment } : {}) }));
    }}><option value="">Własne ćwiczenie</option>{catalog.map(item => <option key={item.id} value={item.id}>{item.name}{item.variant && ` · ${item.variant}`}</option>)}</select></label>
    <details className="review-more"><summary>Znajdź nazwę w słowniku</summary><ExerciseNamePicker original={draft.originalName ?? draft.name} onSelect={name => setDraft({ ...draft, originalName: draft.originalName ?? (draft.name || null), name })} /></details>
    <div className="editor-grid"><label className="editor-field">Wariant<input maxLength={120} value={draft.variant ?? ''} disabled={draft.exerciseId !== null} onChange={event => setDraft({ ...draft, variant: event.target.value || null })} /></label>
      <label className="editor-field">Sprzęt<input maxLength={120} value={draft.equipment ?? ''} disabled={draft.exerciseId !== null} onChange={event => setDraft({ ...draft, equipment: event.target.value || null })} /></label></div>
    <label className="editor-field">Przypisanie do treningu<select value={target} onChange={event => setTarget(event.target.value)}>{document.sessions.map(session => <option key={session.reviewId} value={session.reviewId}>Tydzień {session.weekNumber} · {session.dayLabel || 'Bez nazwy'}</option>)}</select></label>
    {target !== sessionId && draft.supersetGroup && <p className="review-hint">Po przeniesieniu przypisz ćwiczenie do superserii w nowym treningu.</p>}
    </details>
    <label className="editor-field">Uwagi do ćwiczenia<textarea maxLength={2000} value={draft.note ?? ''} onChange={event => setDraft({ ...draft, note: event.target.value || null })} /></label>
    {draft.originalName && draft.originalName !== draft.name && <p className="review-hint">W źródle: {draft.originalName}</p>}
    {draft.sourceRef && <details className="review-more"><summary>Odwołanie do źródła</summary><p>{draft.sourceRef}</p></details>}
    {error && <p className="auth-error" role="alert">{error}</p>}
    <div className="review-dialog-footer">{onDelete && <Button variant="danger" onClick={onDelete}>Usuń ćwiczenie</Button>}<Button variant="ghost" onClick={onCancel}>Anuluj</Button><Button variant="primary" type="submit">Zastosuj zmiany</Button></div>
  </form>;
}

/** Wszystkie zmiany należą do roboczej kopii całego ćwiczenia; bez zagnieżdżonych formularzy. */
function FullExerciseSeries({ exercise, onChange, onValidity }: { exercise: PlanEditorExercise; onChange: (exercise: PlanEditorExercise) => void; onValidity: (valid: boolean) => void }) {
  const [mode, setMode] = useState<'block' | 'individual'>('block');
  const [selected, setSelected] = useState(exercise.sets[0]?.reviewId ?? '');
  const optionalBeforeWhole = useRef(new Map(exercise.sets.map((set, index) => [set.reviewId!, exercise.isOptional ? index >= (exercise.setCountMin ?? exercise.sets.length) : !!set.isOptional])));
  const blocks = seriesBlocks(exercise);
  const blockIndex = Math.max(0, blocks.findIndex(block => block.sets.some(set => set.reviewId === selected)));
  const index = Math.max(0, exercise.sets.findIndex(set => set.reviewId === selected));
  const block = blocks[blockIndex];
  const original = mode === 'individual' ? exercise.sets[index] : block?.sets[0];
  function choose(next: string) { onValidity(true); setSelected(next); }
  if (!original || !block) return <p>Brak serii. Dodaj serię, aby uzupełnić ćwiczenie.</p>;
  function update(value: PlannedSetInput) {
    const next = structuredClone(exercise);
    if (mode === 'individual') { next.sets[index] = { ...value, reviewId: original.reviewId, position: original.position }; if (value.isOptional !== original.isOptional) { try { synchronizeSetCounts(next); onValidity(true); } catch { onValidity(false); } } }
    else patchSeries(next, block.sets.map(set => set.reviewId!), original, value);
    onChange(next);
  }
  return <>
    <div className="plan-mode" role="group" aria-label="Zakres edycji"><button type="button" aria-pressed={mode === 'block'} onClick={() => { setMode('block'); choose(exercise.sets[0].reviewId!); }}>Cały blok</button><button type="button" aria-pressed={mode === 'individual'} onClick={() => { setMode('individual'); choose(exercise.sets[0].reviewId!); }}>Pojedyncza seria</button></div>
    <label className="editor-field">{mode === 'block' ? 'Blok serii' : 'Wybierz serię'}<select value={mode === 'block' ? blockIndex : index} onChange={event => choose((mode === 'block' ? blocks[Number(event.target.value)].sets[0] : exercise.sets[Number(event.target.value)]).reviewId!)}>{mode === 'block' ? blocks.map((item, position) => <option key={item.sets[0].reviewId} value={position}>Serie {item.sets[0].position}–{item.sets.at(-1)!.position} · {goalLabel(item.sets[0])}</option>) : exercise.sets.map((set, position) => <option key={set.reviewId} value={position}>Seria {set.position} · {goalLabel(set)}</option>)}</select></label>
    <FullSeriesFields key={`${mode}:${selected}`} exercise={exercise} mode={mode} original={original} block={block} onChange={onChange} onValidity={onValidity} update={update} />
    {mode === 'individual' && <label className="editor-check"><input type="checkbox" checked={!!original.isOptional} disabled={exercise.isOptional} onChange={event => { update({ ...original, isOptional: event.target.checked }); }} />Seria opcjonalna</label>}
    <details className="review-more"><summary>Opcjonalność ćwiczenia</summary><label className="editor-check"><input type="checkbox" checked={!!exercise.isOptional} onChange={event => { const next = structuredClone(exercise); if (!exercise.isOptional) optionalBeforeWhole.current = new Map(exercise.sets.map(set => [set.reviewId!, !!set.isOptional])); next.isOptional = event.target.checked; next.sets.forEach((set, index) => { set.isOptional = next.isOptional || (optionalBeforeWhole.current.get(set.reviewId!) ?? index >= (exercise.setCountMin ?? exercise.sets.length)); }); try { synchronizeSetCounts(next); onValidity(true); } catch { onValidity(false); } onChange(next); }} />Całe ćwiczenie opcjonalne</label></details>
    <Button variant="secondary" disabled={exercise.sets.length >= 30} onClick={() => { const next = structuredClone(exercise); const set = { ...emptySet(next.sets.length + 1), reviewId: crypto.randomUUID(), isOptional: !!next.isOptional }; next.sets.push(set); synchronizeSetCounts(next); onChange(next); setMode('individual'); choose(set.reviewId); }}>+ Dodaj serię</Button>
    {mode === 'individual' && <Button variant="danger" disabled={exercise.sets.length === 1} onClick={() => { const next = structuredClone(exercise); next.sets.splice(index, 1); synchronizeSetCounts(next); onChange(next); choose(next.sets[0].reviewId!); }}>Usuń serię</Button>}
  </>;
}
function FullSeriesFields({ exercise, mode, original, block, onChange, onValidity, update }: { exercise: PlanEditorExercise; mode: 'block' | 'individual'; original: PlannedSetInput; block: ReturnType<typeof seriesBlocks>[number]; onChange: (exercise: PlanEditorExercise) => void; onValidity: (valid: boolean) => void; update: (set: PlannedSetInput) => void }) {
  const [count, setCount] = useState<number | null>(block.minimum);
  const [maximum, setMaximum] = useState<number | null>(block.maximum !== block.minimum ? block.maximum : null);
  return <>
    {mode === 'block' && <RangeField label="Liczba serii" upperLabel="Liczba serii do" value={count} maximum={maximum} min={0} onChange={(lower, upper) => {
      setCount(lower); setMaximum(upper);
      const max = upper ?? lower;
      const valid = lower != null && max != null && Number.isInteger(lower) && Number.isInteger(max) && lower >= 0 && max >= 1 && max >= lower && exercise.sets.length - block.sets.length + max <= 30;
      onValidity(valid);
      if (valid) { const next = structuredClone(exercise); try { resizeSeriesBlock(next, block.sets.map(set => set.reviewId!), lower, max); onChange(next); } catch { onValidity(false); } }
    }} />}
    <PlanSetFields value={original} onChange={update} equipment={exercise.equipment} individual={mode === 'individual'} />
  </>;
}

export function PlanSeriesEdit({ exercise, adding = false, onApply, onCancel }: {
  exercise: PlanEditorExercise; adding?: boolean; onApply: (exercise: PlanEditorExercise) => void; onCancel: () => void;
}) {
  const blocks = seriesBlocks(exercise);
  const [mode, setMode] = useState(adding ? 'add' : 'block');
  const [selection, setSelection] = useState('0');
  return <>
    {!adding && <><div className="plan-mode" role="group" aria-label="Zakres edycji"><button type="button" aria-pressed={mode === 'block'} onClick={() => { setMode('block'); setSelection('0'); }}>Cały blok</button><button type="button" aria-pressed={mode === 'individual'} onClick={() => { setMode('individual'); setSelection('0'); }}>Pojedyncza seria</button></div>
      <label className="editor-field">{mode === 'block' ? 'Blok serii' : 'Wybierz serię'}<select value={selection} onChange={event => setSelection(event.target.value)}>
        {mode === 'block' ? blocks.map((block, index) => <option key={block.sets[0].reviewId} value={index}>Serie {block.sets[0].position}–{block.sets.at(-1)!.position} · {goalLabel(block.sets[0])}</option>) : exercise.sets.map((set, index) => <option key={set.reviewId} value={index}>Seria {set.position} · {goalLabel(set)}{set.isOptional ? ' · opcjonalna' : ''}</option>)}
      </select></label></>}
    <PlanSeriesForm key={`${mode}:${selection}`} exercise={exercise} mode={mode} selected={Number(selection)} onApply={onApply} onCancel={onCancel} />
  </>;
}

function PlanSeriesForm({ exercise, mode, selected, onApply, onCancel }: {
  exercise: PlanEditorExercise; mode: string; selected: number; onApply: (exercise: PlanEditorExercise) => void; onCancel: () => void;
}) {
  const block = seriesBlocks(exercise)[mode === 'block' ? selected : 0];
  const original = mode === 'individual' ? exercise.sets[selected] : mode === 'add' ? emptySet(exercise.sets.length + 1) : block.sets[0];
  const [edited, setEdited] = useState(() => structuredClone(original));
  const [count, setCount] = useState<number | null>(mode === 'add' ? 1 : block.minimum);
  const [maximum, setMaximum] = useState<number | null>(mode !== 'add' && block.minimum !== block.maximum ? block.maximum : null);
  const [optional, setOptional] = useState(!!exercise.isOptional);
  const [error, setError] = useState('');
  function proposed(remove = false) {
    const next = structuredClone(exercise);
    if (optional !== !!exercise.isOptional) {
      next.isOptional = optional;
      next.sets.forEach((set, index) => { set.isOptional = optional || index >= (exercise.setCountMin ?? exercise.sets.length); });
    }
    if (mode === 'individual') {
      if (remove) next.sets.splice(selected, 1);
      else next.sets[selected] = { ...edited, position: original.position, reviewId: original.reviewId,
        ...(optional ? { isOptional: true } : optional !== !!exercise.isOptional && edited.isOptional === original.isOptional ? { isOptional: next.sets[selected].isOptional } : {}) };
      synchronizeSetCounts(next);
    } else {
      if (count === null) throw new Error('Podaj liczbę serii.');
      const upper = maximum ?? count;
      if (!Number.isInteger(count) || !Number.isInteger(upper) || count < 0 || upper < 1 || upper < count || upper > 30) throw new Error('Podaj poprawną liczbę lub zakres serii.');
      if (mode === 'add') {
        if (next.sets.length + upper > 30) throw new Error('Ćwiczenie może mieć najwyżej 30 serii.');
        for (let index = 0; index < upper; index++) next.sets.push({ ...edited, reviewId: crypto.randomUUID(), position: next.sets.length + 1, isOptional: optional || index >= count });
        synchronizeSetCounts(next);
      } else {
        const ids = block.sets.map(set => set.reviewId!);
        patchSeries(next, ids, original, edited);
        if (count !== block.minimum || upper !== block.maximum) resizeSeriesBlock(next, ids, count, upper);
      }
    }
    if (optional !== !!exercise.isOptional) synchronizeSetCounts(next);
    validateEditorExercise(next, false);
    return next;
  }
  function apply(remove = false) { try { onApply(proposed(remove)); } catch (cause) { setError((cause as Error).message); } }
  let preview = 'Uzupełnij poprawne parametry.';
  try { preview = exerciseSummary(proposed()); } catch {}
  return <form onSubmit={event => { event.preventDefault(); apply(); }}>
    {mode !== 'individual' && <><p className="review-edit-scope">{mode === 'add' ? 'Nowy blok serii' : `Zmiana obejmuje serie ${block.sets[0].position}–${block.sets.at(-1)!.position}`} ćwiczenia „{exercise.name || 'Bez nazwy'}”.</p>
      <RangeField label="Liczba serii" upperLabel="Liczba serii do" value={count} maximum={maximum} min={0} onChange={(lower, upper) => { setCount(lower); setMaximum(upper); }} /></>}
    <PlanSetFields value={edited} onChange={setEdited} equipment={exercise.equipment} individual={mode === 'individual'} />
    {mode === 'individual' && <label className="editor-check"><input type="checkbox" checked={!!edited.isOptional} disabled={optional} onChange={event => setEdited({ ...edited, isOptional: event.target.checked })} /> Seria opcjonalna</label>}
    <details className="review-more"><summary>Opcjonalność ćwiczenia</summary><label className="editor-check"><input type="checkbox" checked={optional} onChange={event => setOptional(event.target.checked)} /> Całe ćwiczenie opcjonalne</label></details>
    <div className="review-change-preview"><strong>Po zmianie</strong><p>{preview}</p></div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <div className="review-dialog-footer">{mode === 'individual' && <Button variant="danger" disabled={exercise.sets.length === 1} onClick={() => apply(true)}>Usuń serię</Button>}<Button variant="ghost" onClick={onCancel}>Anuluj</Button><Button variant="primary" type="submit">Zastosuj zmiany</Button></div>
  </form>;
}

export function PlanDayEdit({ session, position, total, onApply, onCancel, onDelete }: {
  session: PlanEditorSession; position: number; total: number; onApply: (session: PlanEditorSession, position: number) => void; onCancel: () => void; onDelete?: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(session));
  const [order, setOrder] = useState(position);
  const [error, setError] = useState('');
  return <form onSubmit={event => { event.preventDefault(); if (!draft.dayLabel.trim() || !Number.isInteger(draft.weekNumber) || draft.weekNumber < 1 || draft.weekNumber > 52) { setError('Podaj nazwę treningu i tydzień od 1 do 52.'); return; } onApply(draft, order); }}>
    <label className="editor-field">Nazwa treningu<input maxLength={80} value={draft.dayLabel} onChange={event => setDraft({ ...draft, dayLabel: event.target.value })} /></label>
    <label className="editor-field">Tydzień<input type="number" min={1} max={52} value={draft.weekNumber || ''} onChange={event => setDraft({ ...draft, weekNumber: Number(event.target.value) })} /></label>
    <label className="editor-field">Pozycja treningu<select value={order} onChange={event => setOrder(Number(event.target.value))}>{Array.from({ length: total }, (_, index) => <option key={index} value={index}>{index + 1}{index === total - 1 ? ' — na końcu' : ''}</option>)}</select></label>
    <label className="editor-field">Uwagi do treningu<textarea maxLength={2000} value={draft.note ?? ''} onChange={event => setDraft({ ...draft, note: event.target.value || null })} /></label>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <div className="review-dialog-footer">{onDelete && <Button variant="danger" onClick={onDelete}>Usuń trening</Button>}<Button variant="ghost" onClick={onCancel}>Anuluj</Button><Button variant="primary" type="submit">Zastosuj zmiany</Button></div>
  </form>;
}

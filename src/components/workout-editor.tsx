"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoadedWorkout, WorkoutSet } from '@/lib/workouts/contracts';
import { snapshotPrescription, snapshotMetrics, exactSnapshotValues, historyReturnHref } from '@/lib/workouts/presentation';
import { Button, ExerciseIllustration, Icon, Notice, StatusBadge } from '@/components/ui';
import { PrescriptionFacts } from './exercise-summary';
import styles from './workout-editor.module.css';
import { WorkoutVoice } from './workout-voice';
import { makeCommand, readWorkout, useWorkoutCommand } from './workout-command';
import { WorkoutCommandStatus } from './workout-command-status';
import { WorkoutDialog } from './workout-dialog';
import { WorkoutFinish } from './workout-finish';
import { actualLabel, draftPayload, exerciseGroups, nextRequired, setCategory, setDraft, setStateLabel, workoutCounts, type SetDraft } from './workout-state';

type Leave = { run: () => void; ids: string[]; comment: boolean; extra: boolean };
type LoadReadout = { tone: 'missing' | 'na' | 'zero'; text: string };

/** Cel obciążenia z snapshotu. Puste, „nie dotyczy” i zero nie są tym samym stanem. */
export function planLoadReadout(set: WorkoutSet): LoadReadout | null {
  const type = set.target_load_type_snapshot ?? 'unspecified';
  if (type === 'absolute') {
    const min = set.target_kg_snapshot;
    const max = set.target_kg_max_snapshot;
    if (min == null && max == null) return { tone: 'missing', text: 'Brak wartości w planie' };
    if (min === 0 && (max == null || max === 0)) return { tone: 'zero', text: '0 kg' };
    return null;
  }
  if (type === 'percent_1rm') {
    if (set.target_percent_snapshot == null && set.rounded_target_kg_snapshot == null) return { tone: 'missing', text: 'Brak wartości w planie' };
    if (set.rounded_target_kg_snapshot === 0) return { tone: 'zero', text: '0 kg' };
    return null;
  }
  if (type === 'bodyweight') {
    const adjustment = set.target_bodyweight_adjustment_snapshot;
    if (adjustment === 'additional' || adjustment === 'assistance') return null;
    return { tone: 'na', text: 'Nie dotyczy' };
  }
  return { tone: 'missing', text: 'Brak wartości w planie' };
}

function draftSummary(draft: SetDraft) {
  const parts = [
    draft.reps.trim() !== '' ? `${draft.reps} powt.` : null,
    draft.kg.trim() !== '' ? `${draft.kg} kg` : null,
    draft.duration.trim() !== '' ? `${draft.duration} s` : null,
    draft.distance.trim() !== '' ? `${draft.distance} m` : null,
  ].filter((value): value is string => value !== null);
  return parts.join(' · ') || 'Brak wpisanych wartości';
}

function clock(performedAt: string | null | undefined, timeZone: string | null | undefined) {
  if (!performedAt || !timeZone) return 'godzina nieznana';
  return new Intl.DateTimeFormat('pl-PL', { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(performedAt));
}
export function WorkoutEditor({ loaded }: { loaded: LoadedWorkout }) {
  const router = useRouter();
  const [data, setData] = useState(loaded);
  const dataRef = useRef(data); dataRef.current = data;
  const command = useWorkoutCommand();
  const [drafts, setDrafts] = useState<Record<string, SetDraft>>({});
  const draftsRef = useRef(drafts); draftsRef.current = drafts;
  const [selected, setSelected] = useState<string | null>(null);
  const [comment, setComment] = useState(loaded.workout.comment ?? '');
  const commentRef = useRef(comment); commentRef.current = comment;
  const [extraName, setExtraName] = useState('');
  const [extraVariant, setExtraVariant] = useState('');
  const [panel, setPanel] = useState<'comment' | 'extra' | null>(null);
  const [dialog, setDialog] = useState<'finish' | 'delete' | 'optional' | null>(null);
  const [leave, setLeave] = useState<Leave | null>(null);
  const [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const scroll = useRef(0);
  const returnFocus = useRef<string | null>(null);
  const permitLeave = useRef(false);
  const closed = data.workout.status !== 'in_progress';
  const all = data.exercises.flatMap(exercise => exercise.sets);
  const set = all.find(row => row.id === selected);
  const exercise = data.exercises.find(row => row.sets.some(value => value.id === selected));
  const counts = workoutCounts(data);
  const dirtyIds = Object.keys(drafts).filter(id => { const saved = all.find(row => row.id === id); return saved && JSON.stringify(drafts[id]) !== JSON.stringify(setDraft(saved)); });
  const commentDirty = comment !== (data.workout.comment ?? '');
  const extraDirty = !!(extraName || extraVariant);
  const dirty = !!(dirtyIds.length || commentDirty || extraDirty);
  const blocked = command.blocked;
  function focusView(id: string | null) {
    setSelected(id);
    requestAnimationFrame(() => {
      if (id) { window.scrollTo(0, 0); heading.current?.focus({ preventScroll: true }); }
      else { window.scrollTo(0, scroll.current); const target = document.getElementById(`open-${returnFocus.current}`); (target ?? heading.current)?.focus({ preventScroll: true }); }
    });
  }
  function move(id: string | null) {
    if (id && !selected) { scroll.current = window.scrollY; returnFocus.current = data.exercises.find(row => row.sets.some(value => value.id === id))?.id ?? null; }
    const url = new URL(window.location.href); if (id) url.searchParams.set('set', id); else url.searchParams.delete('set');
    if (id && !selected) window.history.pushState(window.history.state, '', url); else window.history.replaceState(window.history.state, '', url); focusView(id);
  }
  function requestMove(run: () => void, external = false) {
    if (command.blocked) { setNotice('Najpierw rozstrzygnij trwającą operację. Wpisy są zachowane.'); return; }
    const ids = external ? dirtyIds : selected && dirtyIds.includes(selected) ? [selected] : [];
    const includeComment = external && commentDirty;
    const includeExtra = external && extraDirty;
    if (ids.length || includeComment || includeExtra) setLeave({ run, ids, comment: includeComment, extra: includeExtra });
    else run();
  }
  const navigationRef = useRef({ requestMove, dirty, blocked }); navigationRef.current = { requestMove, dirty, blocked };
  useEffect(() => {
    const initial = new URL(window.location.href).searchParams.get('set');
    if (dataRef.current.exercises.some(ex => ex.sets.some(row => row.id === initial))) focusView(initial);
    function beforeUnload(event: BeforeUnloadEvent) { if (!permitLeave.current && (navigationRef.current.dirty || navigationRef.current.blocked)) { event.preventDefault(); event.returnValue = ''; } }
    function click(event: MouseEvent) {
      const anchor = (event.target as Element).closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || permitLeave.current || (!navigationRef.current.dirty && !navigationRef.current.blocked)) return;
      event.preventDefault(); event.stopPropagation();
      navigationRef.current.requestMove(() => { permitLeave.current = true; router.push(anchor.href); }, true);
    }
    const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
    function traverse(event: Event) {
      const nav = event as Event & { navigationType?: string; destination?: { url: string; index?: number } };
      if (nav.navigationType === 'traverse' && event.cancelable && !permitLeave.current && (navigationRef.current.dirty || navigationRef.current.blocked)) {
        event.preventDefault(); navigationRef.current.requestMove(() => { permitLeave.current = true; if (nav.destination) { const target = new URL(nav.destination.url); if (target.pathname === window.location.pathname) { const currentIndex = (window as unknown as { navigation?: { currentEntry?: { index: number } } }).navigation?.currentEntry?.index; if (currentIndex != null && nav.destination.index != null) window.history.go(nav.destination.index - currentIndex); else window.history.back(); } else window.location.assign(nav.destination.url); } }, true);
      }
    }
    function popstate() { permitLeave.current = false; const id = new URL(window.location.href).searchParams.get('set'); focusView(dataRef.current.exercises.some(ex => ex.sets.some(row => row.id === id)) ? id : null); }
    window.addEventListener('popstate', popstate);
    window.addEventListener('beforeunload', beforeUnload); document.addEventListener('click', click, true); navigation?.addEventListener('navigate', traverse);
    return () => { window.removeEventListener('popstate', popstate); window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', click, true); navigation?.removeEventListener('navigate', traverse); };
  }, [router]);
  function merge(next: LoadedWorkout | null) {
    if (next && next.workout.id === dataRef.current.workout.id && next.workout.revision >= dataRef.current.workout.revision) { if (commentRef.current === (dataRef.current.workout.comment ?? '')) setComment(next.workout.comment ?? ''); dataRef.current = next; setData(next); }
  }
  async function resolve() {
    try { const next = await readWorkout(data.workout.id); merge(next); command.release(); setNotice('Stan odczytany. Porównaj zachowany szkic z zapisanym wynikiem. Ponowny zapis wymaga świadomego kliknięcia.'); }
    catch (cause) { setNotice((cause as Error).message); }
  }
  function issue(action: string, payload: Record<string, unknown>, done?: (next: LoadedWorkout) => void) {
    if (command.blocked) return;
    setNotice('');
    command.issue(makeCommand(dataRef.current.workout.id, dataRef.current.workout.revision, action, payload), next => {
      merge(next);
      if (action === 'save_set') setDrafts(old => { const copy = { ...old }; delete copy[String(payload.setId)]; return copy; });
      if (action === 'comment') setComment(next?.workout.comment ?? '');
      if (action === 'add_exercise') { setExtraName(''); setExtraVariant(''); setPanel(null); }
      if (next) done?.(next);
      if (action === 'delete') { permitLeave.current = true; const query = new URL(window.location.href).searchParams; router.push(historyReturnHref(query.get('historyMonth') ?? undefined, query.get('historyDay') ?? undefined)); }
    });
  }
  function afterSet(next: LoadedWorkout, id: string) {
    const following = nextRequired(next, id);
    if (closed) { move(null); return; }
    // Po ostatniej wymaganej rundzie danej grupy oferujemy wybór, nie wymuszamy opcjonalnej.
    const group = exerciseGroups(next.exercises).find(group => group.some(ex => ex.sets.some(row => row.id === id)));
    const pendingRequired = group?.some(ex => ex.sets.some(row => row.status === 'pending' && !row.target_optional_snapshot && row.source_kind !== 'extra'));
    if (!pendingRequired && group?.some(ex => ex.sets.some(row => row.status === 'pending' && row.target_optional_snapshot))) { setDialog('optional'); return; }
    if (following) move(following); else move(null);
  }
  function saveSet(row: WorkoutSet, advance = true, skipped = false, done?: () => void) {
    const draft = draftsRef.current[row.id] ?? setDraft(row);
    if (!skipped && ![draft.reps, draft.kg, draft.duration, draft.distance].some(value => value.trim() !== '')) { setNotice('Podaj co najmniej jeden wynik. Puste pole oznacza brak danych.'); return; }
    issue('save_set', draftPayload(row.id, draft, skipped), next => { if (done) done(); else if (advance) afterSet(next, row.id); });
  }
  function discardLeave() {
    if (!leave || blocked) return;
    const target = leave;
    setDrafts(old => Object.fromEntries(Object.entries(old).filter(([id]) => !target.ids.includes(id))));
    if (target.comment) setComment(data.workout.comment ?? ''); if (target.extra) { setExtraName(''); setExtraVariant(''); }
    setLeave(null); target.run();
  }
  function saveLeave() {
    if (!leave || blocked) return;
    const target = leave;
    function step(ids: string[], saveComment: boolean, saveExtra: boolean) {
      if (ids.length) { const row = dataRef.current.exercises.flatMap(ex => ex.sets).find(value => value.id === ids[0]); if (row) saveSet(row, false, false, () => step(ids.slice(1), saveComment, saveExtra)); }
      else if (saveComment) issue('comment', { comment }, () => step([], false, saveExtra));
      else if (saveExtra) { if (!extraName.trim()) { setNotice('Podaj nazwę dodatkowego ćwiczenia.'); return; } issue('add_exercise', { name: extraName, variant: extraVariant }, () => step([], false, false)); }
      else { setLeave(null); target.run(); }
    }
    step(target.ids, target.comment, target.extra);
  }
  const draft = set ? drafts[set.id] ?? setDraft(set) : null;
  function field(key: keyof SetDraft, label: string, max?: number) {
    if (!set || !draft) return null;
    return <label className="editor-field">{label}<input type="number" min="0" max={max} step={key === 'reps' || key === 'duration' ? '1' : '0.01'} inputMode={key === 'reps' || key === 'duration' ? 'numeric' : 'decimal'} value={draft[key]} disabled={blocked} onChange={e => setDrafts(old => ({ ...old, [set.id]: { ...draft, [key]: e.target.value } }))} /></label>;
  }
  const loadReadout = set ? planLoadReadout(set) : null;
  const statusPanel = <WorkoutCommandStatus command={command} onResolve={() => void resolve()} comparison={set && draft && (command.phase === 'conflict' || command.phase === 'rejected') ? <div className={styles.compare}><section><small>Twój szkic</small><strong>{draftSummary(draft)}</strong></section><section><small>Ostatni odczyt</small><strong>{actualLabel(set)}</strong></section></div> : null} />;
  const group = exerciseGroups(data.exercises).find(group => group.some(ex => ex.id === exercise?.id));
  const nextId = closed ? null : nextRequired(data);
  const nextSet = nextId ? all.find(row => row.id === nextId) : undefined;
  const nextExercise = nextSet ? data.exercises.find(row => row.sets.some(value => value.id === nextSet.id)) : undefined;
  const statusLabel = data.workout.status === 'completed' ? 'Zakończony' : closed ? 'Przerwany' : 'W toku';
  function continueWorkout() {
    const next = nextRequired(data);
    if (next) move(next); else setDialog('optional');
  }
  return <div className={`workout-ui ${styles.ui}`}>
    {selected && set && exercise && draft ? <section className={`workout-detail ${styles.detail}`}>
      <form className={styles.seriesForm} onSubmit={e => { e.preventDefault(); saveSet(set); }}>
        <div className={styles.detailScroll} data-series-scroll>
          <div className={styles.lead}>
            <button className={styles.back} type="button" onClick={() => requestMove(() => move(null))}>← Wróć do ćwiczeń</button>
            <p className={styles.kicker}>Ćwiczenie {exercise.position} · seria {set.position} z {exercise.sets.length}</p>
            <div className={styles.detailTitle}><ExerciseIllustration name={exercise.target_name_snapshot} /><div><h2 ref={heading} tabIndex={-1}>{exercise.target_name_snapshot} · seria {set.position}</h2><p>{data.workout.name ?? 'Trening'} · {setCategory(set)} · {setStateLabel(set)}{exercise.superset_group_snapshot ? ` · Superseria ${exercise.superset_group_snapshot} · runda ${set.position}` : ''}</p></div></div>
            <div className={styles.progress} aria-label={`Seria ${set.position} z ${exercise.sets.length}`}>{exercise.sets.map(row => <span key={row.id} className={row.id === set.id ? styles.current : row.status === 'completed' ? styles.done : ''} />)}</div>
            <div className={styles.goal}><small>Cel serii</small><strong>{snapshotPrescription(set)}</strong>
              {loadReadout && <p className={styles.loadState} data-load-state={loadReadout.tone}><small>Obciążenie</small><strong>{loadReadout.text}</strong></p>}
            </div>
            <p className={styles.previous}><small>Poprzedni porównywalny wynik</small><strong>{exercise.previousResult ?? 'Brak wcześniejszego wyniku'}</strong></p>
            <div className={styles.resultHeading}><h3>Twój wynik</h3><span>Wpisz wykonanie</span></div>
            <div className="editor-grid">
              {(set.target_reps_min_snapshot != null || set.target_amrap_snapshot || set.actual_reps != null || (set.target_duration_seconds_snapshot == null && set.target_distance_meters_snapshot == null)) && field('reps', 'Powtórzenia')}
              {(set.target_load_type_snapshot !== 'unspecified' && set.target_load_type_snapshot !== 'bodyweight' || set.actual_kg != null || set.source_kind === 'extra') && field('kg', 'Ciężar (kg)')}
              {(set.target_duration_seconds_snapshot != null || set.actual_duration_seconds != null) && field('duration', 'Czas (s)')}
              {(set.target_distance_meters_snapshot != null || set.actual_distance_meters != null) && field('distance', 'Dystans (m)')}
            </div>
            <p className={styles.helper}>Cel nie jest zapisanym wynikiem. Puste pole oznacza brak danych.</p>
            <Button type="button" variant="secondary" className={styles.block} disabled={blocked || !Object.values(exactSnapshotValues(set)).some(Boolean)} onClick={() => {
              const values = exactSnapshotValues(set);
              setDrafts(old => ({ ...old, [set.id]: { ...draft, ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')) } }));
            }}>Uzupełnij jednoznaczne cele z planu</Button>
            <div className={styles.secondaryRow}>
              <WorkoutVoice key={`${set.id}:${data.workout.revision}`} workoutId={data.workout.id} revision={data.workout.revision} intent="set" setId={set.id} targetName={exercise.target_name_snapshot} position={set.position}
                current={{ reps: draft.reps === '' ? null : Number(draft.reps), kg: draft.kg === '' ? null : Number(draft.kg), duration: draft.duration === '' ? null : Number(draft.duration), distance: draft.distance === '' ? null : Number(draft.distance), rpe: draft.rpe === '' ? null : Number(draft.rpe), rir: draft.rir === '' ? null : Number(draft.rir), note: draft.note || null }} blocked={blocked} issue={(action, payload) => issue(action, payload, next => afterSet(next, set.id))} />
              <Button type="button" variant="secondary" disabled={blocked} onClick={() => saveSet(set, true, true)}>Pomiń serię</Button>
            </div>
          </div>
          <div className={styles.trail}>
            <details className="workout-additional" key={set.id} open={set.actual_rpe != null || set.actual_rir != null || !!set.actual_note}><summary>RPE, RIR i komentarz</summary><div className="editor-grid">{field('rpe', 'RPE', 10)}{field('rir', 'RIR')}</div>
              {set.target_duration_seconds_snapshot == null && set.actual_duration_seconds == null && field('duration', 'Czas (s)')}
              {set.target_distance_meters_snapshot == null && set.actual_distance_meters == null && field('distance', 'Dystans (m)')}
              {(set.target_load_type_snapshot === 'unspecified' || set.target_load_type_snapshot === 'bodyweight') && set.actual_kg == null && set.source_kind !== 'extra' && field('kg', 'Ciężar (kg)')}
              <label className="editor-field">Komentarz do serii<textarea aria-label="Komentarz do serii" value={draft.note} disabled={blocked} onChange={e => setDrafts(old => ({ ...old, [set.id]: { ...draft, note: e.target.value } }))} /></label>
            </details>
            {statusPanel}
            <details className={styles.metadata}><summary>Zapisany wynik i wskazówki{dirtyIds.includes(set.id) ? ' · niezapisany szkic' : ''}</summary><p>Zapisany wynik: {actualLabel(set)}</p>{exercise.target_original_name_snapshot && <p>Oryginalna nazwa: {exercise.target_original_name_snapshot}</p>}{exercise.target_note_snapshot && <p>Uwagi ćwiczenia: {exercise.target_note_snapshot}</p>}{set.target_note_snapshot && <p>Uwagi serii: {set.target_note_snapshot}</p>}</details>
            {closed && <p className={styles.helper}>Poprawka historyczna zachowuje cele treningu.</p>}
            <details className="workout-all"><summary>Wszystkie serie</summary>{(group ?? [exercise]).map(ex => <section key={ex.id}><h3>{ex.target_name_snapshot}</h3>{ex.sets.map(row => <div className="workout-set-row" key={row.id}><p>Seria {row.position} · {setCategory(row)} · {setStateLabel(row)}<br />{snapshotPrescription(row)}<br />Wynik: {actualLabel(row)}</p><Button type="button" variant="secondary" onClick={() => requestMove(() => move(row.id))}>Popraw serię {row.position}: {ex.target_name_snapshot}</Button></div>)}</section>)}</details>
            {!closed && <Button type="button" variant="secondary" className={styles.block} disabled={blocked} onClick={() => requestMove(() => issue('add_set', { exerciseId: exercise.id }, next => move(next.exercises.find(ex => ex.id === exercise.id)!.sets.at(-1)!.id)))}>+ Dodatkowa seria</Button>}
          </div>
        </div>
        <div className={styles.saveBar} data-series-save>
          <Button type="submit" variant="primary" className={styles.block} disabled={blocked}>{closed ? 'Zapisz poprawkę' : 'Zapisz i przejdź dalej'}</Button>
        </div>
      </form>
    </section> : <>
      <header className={`workout-heading ${styles.heading}`}>
        <p className={styles.kicker}>{statusLabel} · {data.workout.performed_on} · {clock(data.workout.performed_at, data.workout.time_zone)}</p>
        <h1 ref={heading} tabIndex={-1}>{data.workout.name ?? 'Trening'}</h1>
        <p>{closed ? 'Historyczne cele i wykonanie tylko do odczytu.' : nextExercise && nextSet ? `Następna: ${nextExercise.target_name_snapshot} · seria ${nextSet.position}` : 'Wymagane serie są rozstrzygnięte.'}</p>
      </header>
      <div className={styles.counters} aria-label="Liczniki sesji">
        {([[counts.required, 'wymagane'], [counts.optional, 'opcjonalne'], [counts.extra, 'dodatkowe'], [String(counts.skipped), 'pominięte']] as const).map(([value, label]) => <div key={label}><strong>{value}</strong><small>{label}</small></div>)}
      </div>
      {statusPanel}
      {!closed && <section className={styles.next}>
        <span className={styles.kicker}>Następna seria</span>
        {nextExercise && nextSet ? <><h2>{nextExercise.target_name_snapshot}</h2><p>Seria {nextSet.position} z {nextExercise.sets.length} · {snapshotPrescription(nextSet)}</p></> : <p>Kontynuacja otwiera wybór. Nie zapisuje serii opcjonalnej.</p>}
        <Button type="button" variant="primary" className={styles.block} disabled={blocked} onClick={continueWorkout}>Kontynuuj</Button>
      </section>}
      {closed && <Notice tone={data.workout.status === 'completed' ? 'success' : 'warning'} title={data.workout.status === 'completed' ? 'Trening zakończony' : 'Sesja przerwana'}>Historyczne cele i wykonanie tylko do odczytu. Poprawka serii nie zmienia snapshotów.</Notice>}
      <h2 className={styles.sectionTitle}>Ćwiczenia</h2>
      <div className={`workout-cards ${styles.cards}`}>{exerciseGroups(data.exercises).map((bundle) => <section className={bundle[0].superset_group_snapshot ? `workout-group ${styles.superset}` : styles.plainGroup} key={bundle[0].id} aria-label={bundle[0].superset_group_snapshot ? `Superseria ${bundle[0].superset_group_snapshot}` : undefined}>
        {bundle[0].superset_group_snapshot && <header className={styles.supersetHead}><strong>Superseria {bundle[0].superset_group_snapshot}</strong><span>{bundle.map(ex => ex.target_name_snapshot).join(' → ')}</span></header>}
        {bundle.map(ex => {
          const pending = ex.sets.some(row => row.status === 'pending');
          const current = !!nextId && ex.sets.some(row => row.id === nextId);
          return <article className={`workout-card ${styles.card}`} key={ex.id}><button id={`open-${ex.id}`} type="button" className="workout-card-open" onClick={() => move(ex.sets.find(row => row.status === 'pending' && !row.target_optional_snapshot)?.id ?? ex.sets[0]?.id ?? null)}>
            <span className={styles.cardTop}><span className={styles.code}>{String(ex.position).padStart(2, '0')}</span><span><span className="workout-card-title">{ex.position}. {ex.target_name_snapshot}{ex.source_kind === 'extra' ? ' · Dodatkowe' : ''}</span><span className="workout-card-state">{ex.sets.some(row => row.target_optional_snapshot) ? `Opcjonalne ${ex.sets.filter(row => row.target_optional_snapshot && row.status === 'completed').length}/${ex.sets.filter(row => row.target_optional_snapshot).length} · ` : ''}Zapisane {ex.sets.filter(row => row.status === 'completed').length}/{ex.sets.length} · pominięte {ex.sets.filter(row => row.status === 'skipped').length} · {pending ? 'Oczekuje' : 'Rozstrzygnięte'}</span></span>{current ? <StatusBadge tone="warning">Teraz</StatusBadge> : !pending ? <StatusBadge tone="success">Gotowe</StatusBadge> : <Icon name="chevronRight" size={18} />}</span>
            <PrescriptionFacts metrics={snapshotMetrics(ex.sets)} /></button></article>;
        })}
      </section>)}</div>
      {!closed && <div className={styles.sessionActions}>
        <div className={styles.split}><Button type="button" variant="secondary" onClick={() => setPanel(panel === 'extra' ? null : 'extra')}>Dodaj ćwiczenie</Button><Button type="button" variant="secondary" onClick={() => setPanel(panel === 'comment' ? null : 'comment')}>Komentarz{commentDirty ? ' · szkic' : ''}</Button></div>
        <Button type="button" variant="ghost" className={styles.block} disabled={blocked} onClick={() => requestMove(() => setDialog('finish'), true)}>Zakończ trening</Button>
        <Button type="button" variant="danger" className={styles.block} disabled={blocked} onClick={() => requestMove(() => setDialog('delete'), true)}>Usuń trening</Button>
      </div>}
      {(panel === 'comment' || closed && data.workout.comment) && <section className={`editor-card ${styles.panel}`}><h2>Komentarz do treningu</h2><label className="editor-field">Komentarz<textarea aria-label="Komentarz" disabled={closed || blocked} value={comment} onChange={e => setComment(e.target.value)} /></label>{!closed && <><Button type="button" variant="secondary" disabled={blocked} onClick={() => issue('comment', { comment })}>Zapisz komentarz</Button><WorkoutVoice workoutId={data.workout.id} revision={data.workout.revision} intent="comment" currentComment={comment} blocked={blocked} issue={issue} /></>}</section>}
      {panel === 'extra' && <section className={`editor-card ${styles.panel}`}><h2>Dodatkowe ćwiczenie</h2><label className="editor-field">Nazwa<input value={extraName} disabled={blocked} onChange={e => setExtraName(e.target.value)} /></label><label className="editor-field">Wariant (opcjonalnie)<input value={extraVariant} disabled={blocked} onChange={e => setExtraVariant(e.target.value)} /></label><Button type="button" variant="secondary" disabled={blocked || !extraName.trim()} onClick={() => issue('add_exercise', { name: extraName, variant: extraVariant })}>Zapisz dodatkowe ćwiczenie</Button><WorkoutVoice workoutId={data.workout.id} revision={data.workout.revision} intent="exercise" blocked={blocked} issue={issue} /></section>}
    </>}
    {notice && <p role="alert" className="workout-message">{notice}</p>}
    {leave && <WorkoutDialog title="Niezapisane zmiany" locked={blocked} onClose={() => setLeave(null)}><p>Wybierz, co zrobić ze szkicem przed przejściem.</p><div className={styles.stack}><Button type="button" variant="primary" disabled={blocked} onClick={saveLeave}>Zapisz</Button><Button type="button" variant="secondary" disabled={blocked} onClick={discardLeave}>Odrzuć zmiany</Button></div>{statusPanel}</WorkoutDialog>}
    {dialog === 'finish' && <WorkoutDialog title="Podsumowanie treningu" locked={blocked} onClose={() => { if (!blocked) setDialog(null); }}>{notice && <p role="status">{notice}</p>}<WorkoutFinish loaded={data} blocked={blocked} onConfirm={payload => issue('finish', payload, () => { setDialog(null); move(null); })} />{statusPanel}</WorkoutDialog>}
    {dialog === 'delete' && <WorkoutDialog title={`Usuń trening „${data.workout.name ?? 'Trening'}”?`} locked={blocked} onClose={() => { if (!blocked) setDialog(null); }}><p>Trwale utracisz wszystkie wyniki i komentarz tej sesji. Tej operacji nie można cofnąć.</p><Button type="button" variant="danger" className={styles.block} disabled={blocked} onClick={() => issue('delete', {})}>Potwierdzam trwałe usunięcie</Button>{statusPanel}</WorkoutDialog>}
    {dialog === 'optional' && <WorkoutDialog title="Wybierz dalszy krok" onClose={() => setDialog(null)}><p>Wymagana część tej grupy jest rozstrzygnięta. Otwarcie serii opcjonalnej nie zapisuje jej jako wykonanej.</p><div className={styles.stack}>{(group ?? data.exercises).flatMap(ex => ex.sets.filter(row => row.status === 'pending' && row.target_optional_snapshot).map(row => <Button variant="secondary" type="button" key={row.id} onClick={() => { setDialog(null); move(row.id); }}>Opcjonalna: {ex.target_name_snapshot} · seria {row.position}</Button>))}<Button variant="primary" type="button" onClick={() => { setDialog(null); const next = nextRequired(data); move(next); }}>Następne ćwiczenie lub przegląd</Button></div></WorkoutDialog>}
  </div>;
}

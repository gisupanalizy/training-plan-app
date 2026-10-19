"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoadedWorkout } from '@/lib/workouts/contracts';
import { makeCommand, readWorkout, useWorkoutCommand, type ActiveConflict } from './workout-command';
import { WorkoutCommandStatus } from './workout-command-status';
import { WorkoutDialog } from './workout-dialog';
import { WorkoutFinish } from './workout-finish';

export function WorkoutStart({ planSessionId }: { planSessionId: string; today?: string }) {
  const router = useRouter();
  const command = useWorkoutCommand();
  const [active, setActive] = useState<ActiveConflict[]>([]);
  const [resolution, setResolution] = useState<{ loaded: LoadedWorkout; action: 'finish' | 'delete'; replace: boolean } | null>(null);
  const [error, setError] = useState('');
  function start() { command.issue(makeCommand(null, 0, 'start', { planSessionId }), loaded => { if (loaded) router.push(`/trening/${loaded.workout.id}`); }); }
  async function resolveConflict() {
    setActive(command.error?.activeWorkouts ?? []); command.release(); setResolution(null);
  }
  async function choose(row: ActiveConflict, action: 'finish' | 'delete') {
    try { setError(''); const loaded = await readWorkout(row.id); setResolution({ loaded, action, replace: active.length === 1 }); }
    catch (cause) { setError((cause as Error).message); }
  }
  function confirm(payload: Record<string, unknown> = {}) {
    if (!resolution) return;
    const { loaded, action, replace } = resolution;
    command.issue(makeCommand(loaded.workout.id, loaded.workout.revision, replace ? 'replace_active' : action,
      replace ? { resolution: action, next: { planSessionId }, ...(action === 'finish' ? { finish: payload } : {}) } : payload), next => {
      setResolution(null);
      if (replace && next) router.push(`/trening/${next.workout.id}`);
      else setActive(rows => rows.filter(row => row.id !== loaded.workout.id));
    });
  }
  const conflicts = command.error?.activeWorkouts;
  return <div className="workout-start workout-ui">
    <p className="small-muted">Data i godzina zostaną zapisane automatycznie. Możesz je poprawić przy zakończeniu.</p>
    {!active.length && <button type="button" className="button button-dark" disabled={command.blocked} onClick={start}>Rozpocznij trening</button>}
    <WorkoutCommandStatus command={command} onResolve={() => void resolveConflict()} />
    {!!conflicts?.length && <button className="button button-outline" type="button" disabled={command.busy} onClick={() => void resolveConflict()}>Pokaż aktywne treningi</button>}
    {!!active.length && <section aria-label="Aktywne treningi"><h3>{active.length > 1 ? 'Rozstrzygnij każdy trening osobno' : 'Masz aktywny trening'}</h3>
      {active.map(row => <article className="editor-card" key={row.id}><h3>{row.name}</h3><p>{row.performedOn} · {row.performedAt ? 'godzina zapisana' : 'godzina nieznana'} · zapisane serie: {row.savedSetCount}</p>
        <a className="button button-outline" href={`/trening/${row.id}`}>Wróć do treningu</a>
        <button className="button button-outline" type="button" disabled={command.blocked} onClick={() => void choose(row, 'finish')}>{active.length === 1 ? 'Zakończ i rozpocznij nowy' : 'Zakończ ten trening'}</button>
        <button className="button button-outline" type="button" disabled={command.blocked} onClick={() => void choose(row, 'delete')}>{active.length === 1 ? 'Usuń i rozpocznij nowy' : 'Usuń ten trening'}</button>
      </article>)}<button className="button button-outline" type="button" disabled={command.blocked} onClick={() => setActive([])}>Anuluj wybór</button></section>}
    {error && <p role="alert">{error}</p>}
    {resolution && <WorkoutDialog title={resolution.action === 'delete' ? `Usuń trening „${resolution.loaded.workout.name ?? 'Trening'}”?` : 'Zakończ aktywny trening'} locked={command.blocked} onClose={() => { if (!command.blocked) setResolution(null); }}>
      {resolution.action === 'delete' ? <><p>Trwale utracisz wszystkie wyniki i komentarz tej sesji. Plany i 1RM pozostaną.</p><button className="button button-dark" type="button" disabled={command.blocked} onClick={() => confirm()}>Potwierdzam trwałe usunięcie{resolution.replace ? ' i nowy start' : ''}</button></> : <WorkoutFinish loaded={resolution.loaded} blocked={command.blocked} label={resolution.replace ? 'Potwierdź zakończenie i nowy start' : 'Potwierdź zakończenie'} onConfirm={confirm} />}
      <WorkoutCommandStatus command={command} onResolve={() => void resolveConflict()} />
    </WorkoutDialog>}
  </div>;
}

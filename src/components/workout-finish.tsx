"use client";
import { useState } from 'react';
import type { LoadedWorkout } from '@/lib/workouts/contracts';
import { localDateTime, timeCandidates, workoutCounts } from './workout-state';
export function WorkoutFinish({ loaded, blocked, label = 'Potwierdź zakończenie', onConfirm }: { loaded: LoadedWorkout; blocked: boolean; label?: string; onConfirm: (payload: Record<string, unknown>) => void }) {
  const [correct, setCorrect] = useState(false);
  const zone = loaded.workout.time_zone ?? 'Europe/Warsaw';
  const [local, setLocal] = useState(loaded.workout.performed_at ? localDateTime(loaded.workout.performed_at, zone) : '');
  const [chosen, setChosen] = useState('');
  const candidates = timeCandidates(local, zone);
  const selected = candidates.length === 1 ? candidates[0].iso : candidates.find(value => value.iso === chosen)?.iso;
  const count = workoutCounts(loaded);
  return <div className="workout-finish"><p>Wymagane {count.required} · opcjonalne {count.optional} · dodatkowe {count.extra} · pominięte {count.skipped}.</p>
    <p>Brakujące serie pozostaną bez wyniku. Zapisane cele i 1RM pozostaną historyczne.</p>
    <label className="workout-check"><input type="checkbox" checked={correct} disabled={blocked} onChange={e => setCorrect(e.target.checked)} />Popraw datę i godzinę wykonania</label>
    {correct && <><p>Strefa profilu: {zone}</p><label className="editor-field">Data i godzina wykonania<input type="datetime-local" value={local} disabled={blocked} onChange={e => { setLocal(e.target.value); setChosen(''); }} /></label>
      {local && candidates.length === 0 && <p role="alert">Ta lokalna godzina nie istnieje w strefie profilu.</p>}
      {candidates.length > 1 && <label className="editor-field">Wybierz offset powtórzonej godziny<select value={chosen} disabled={blocked} onChange={e => setChosen(e.target.value)}><option value="">Wybierz świadomie</option>{candidates.map(value => <option key={value.iso} value={value.iso}>UTC{value.offset}</option>)}</select></label>}
    </>}
    <button type="button" className="button button-dark" disabled={blocked || (correct && !selected)} onClick={() => onConfirm(correct ? { performedAt: selected, timeZone: zone } : {})}>{label}</button>
  </div>;
}

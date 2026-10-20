"use client";
import { useState } from "react";
import { Button } from "@/components/ui";
import type { LoadedWorkout } from "@/lib/workouts/contracts";
import styles from "./workout-editor.module.css";
import { localDateTime, timeCandidates, workoutCounts } from "./workout-state";

export function WorkoutFinish({ loaded, blocked, label = "Potwierdź zakończenie", onConfirm }: { loaded: LoadedWorkout; blocked: boolean; label?: string; onConfirm: (payload: Record<string, unknown>) => void }) {
  const [correct, setCorrect] = useState(false);
  const zone = loaded.workout.time_zone ?? "Europe/Warsaw";
  const [local, setLocal] = useState(loaded.workout.performed_at ? localDateTime(loaded.workout.performed_at, zone) : "");
  const [chosen, setChosen] = useState("");
  const candidates = timeCandidates(local, zone);
  const selected = candidates.length === 1 ? candidates[0].iso : candidates.find(value => value.iso === chosen)?.iso;
  const count = workoutCounts(loaded);
  return <div className={`workout-finish ${styles.finish}`}>
    <div className={styles.counters} aria-label="Liczniki zakończenia">
      {([[count.required, "wymagane"], [count.optional, "opcjonalne"], [count.extra, "dodatkowe"], [String(count.skipped), "pominięte"]] as const).map(([value, name]) => <div key={name}><strong>{value}</strong><small>{name}</small></div>)}
    </div>
    <p>Brakujące serie pozostaną bez wyniku. Zapisane cele i 1RM pozostaną historyczne.</p>
    <label className="workout-check"><input type="checkbox" checked={correct} disabled={blocked} onChange={event => setCorrect(event.target.checked)} />Popraw datę i godzinę wykonania</label>
    {correct && <>
      <p>Strefa profilu: {zone}</p>
      <label className="editor-field">Data i godzina wykonania<input type="datetime-local" value={local} disabled={blocked} onChange={event => { setLocal(event.target.value); setChosen(""); }} /></label>
      {local && candidates.length === 0 && <p role="alert">Ta lokalna godzina nie istnieje w strefie profilu.</p>}
      {candidates.length > 1 && <fieldset className={styles.choices} disabled={blocked}>
        <legend>Wybierz offset powtórzonej godziny</legend>
        {candidates.map(value => <label key={value.iso}><input type="radio" name="dst-offset" value={value.iso} checked={chosen === value.iso} onChange={() => setChosen(value.iso)} /><span><strong>UTC{value.offset}</strong><small>Jawny offset, bez zgadywania</small></span></label>)}
      </fieldset>}
    </>}
    <Button type="button" variant="primary" className={styles.block} disabled={blocked || (correct && !selected)} onClick={() => onConfirm(correct ? { performedAt: selected, timeZone: zone } : {})}>{label}</Button>
  </div>;
}

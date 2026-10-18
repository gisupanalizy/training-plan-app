"use client";

import { useRef, useState } from 'react';
import type { LoadedWorkout } from '@/lib/workouts/contracts';

export interface WorkoutCommand {
  operationId: string; workoutId: string | null; expectedRevision: number;
  action: string; payload: Record<string, unknown>;
}
export interface ActiveConflict { id: string; revision: number; name: string; performedOn: string; performedAt: string | null; savedSetCount: number }
export class CommandError extends Error {
  constructor(message: string, public status: number, public code?: string, public activeWorkouts?: ActiveConflict[]) { super(message); }
}
export async function readWorkout(id: string): Promise<LoadedWorkout> {
  const response = await fetch(`/api/workouts/${id}`, { cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw new CommandError(result.error ?? 'Nie udało się odczytać treningu.', response.status, result.code);
  return result;
}
export function makeCommand(workoutId: string | null, expectedRevision: number, action: string, payload: Record<string, unknown>): WorkoutCommand {
  // Kopia całego zamiaru: retry nigdy nie czyta aktualnej rewizji ani pól formularza.
  return structuredClone({ operationId: crypto.randomUUID(), workoutId, expectedRevision, action, payload });
}
export function useWorkoutCommand() {
  const pending = useRef<{ command: WorkoutCommand; ack?: { workoutId: string; revision: number }; onSuccess: (loaded: LoadedWorkout | null) => void } | null>(null);
  const sending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'sending' | 'retry' | 'read' | 'conflict' | 'rejected'>('idle');
  const [error, setError] = useState<CommandError | null>(null);
  async function retry() {
    if (sending.current || !pending.current) return;
    const job = pending.current;
    sending.current = true; setBusy(true); setError(null);
    let success: { loaded: LoadedWorkout | null } | null = null;
    try {
      if (!job.ack) {
        setPhase('sending');
        const response = await fetch('/api/workouts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(job.command) });
        const result = await response.json();
        if (!response.ok) throw new CommandError(result.error ?? 'Zapis nie powiódł się.', response.status, result.code, result.activeWorkouts);
        job.ack = result;
      }
      setPhase('read');
      const loaded = job.command.action === 'delete' ? null : await readWorkout(job.ack!.workoutId);
      // Receipt może być starszy niż odczyt. Dane zawsze pochodzą z GET.
      if (loaded && loaded.workout.revision < job.ack!.revision) throw new Error('Odczyt nie potwierdził rewizji zapisu. Ponów odczyt.');
      pending.current = null; setPhase('idle'); success = { loaded };
    } catch (cause) {
      const failure = cause instanceof CommandError ? cause : new CommandError((cause as Error).message || 'Brak połączenia.', 0);
      setError(failure);
      setPhase(job.ack ? 'read' : failure.status === 409 ? 'conflict' : failure.status >= 400 && failure.status < 500 ? 'rejected' : 'retry');
    } finally { sending.current = false; setBusy(false); }
    if (success) job.onSuccess(success.loaded);
  }
  function issue(command: WorkoutCommand, onSuccess: (loaded: LoadedWorkout | null) => void) {
    if (pending.current || sending.current) return;
    pending.current = { command, onSuccess }; void retry();
  }
  function release() { if (!sending.current) { pending.current = null; setError(null); setPhase('idle'); } }
  return { issue, retry, release, busy, phase, error, blocked: phase !== 'idle', pending: pending.current?.command };
}

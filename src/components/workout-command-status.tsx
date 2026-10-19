"use client";
import type { useWorkoutCommand } from './workout-command';
export function WorkoutCommandStatus({ command, onResolve }: { command: ReturnType<typeof useWorkoutCommand>; onResolve: () => void }) {
  if (!command.blocked) return null;
  return <div className="workout-message" role="status" aria-live="polite"><p>{command.error?.message ?? (command.phase === 'read' ? 'Zapis potwierdzony. Odczytuję aktualny stan…' : 'Czekam na potwierdzenie zapisu…')}</p>
    {!command.busy && <>{(command.phase === 'read' || command.phase === 'retry') && <button type="button" className="button button-outline" onClick={() => void command.retry()}>{command.phase === 'read' ? 'Ponów odczyt po zapisie' : 'Ponów tę samą operację'}</button>}
      {(command.phase === 'conflict' || command.phase === 'rejected') && <><p>Szkice są zachowane. Odczytaj stan i sprawdź wynik przed ponownym zapisem.</p><button type="button" className="button button-outline" onClick={onResolve}>Odczytaj stan i rozstrzygnij</button></>}
    </>}
  </div>;
}

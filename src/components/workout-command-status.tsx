"use client";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";
import type { useWorkoutCommand } from "./workout-command";
import styles from "./workout-editor.module.css";

export function WorkoutCommandStatus({ command, onResolve, comparison = null }: { command: ReturnType<typeof useWorkoutCommand>; onResolve: () => void; comparison?: ReactNode }) {
  if (!command.blocked) return null;
  return <div className={`workout-message ${styles.status}`} role="status" aria-live="polite">
    <p>{command.error?.message ?? (command.phase === "read" ? "Zapis potwierdzony. Odczytuję aktualny stan…" : "Czekam na potwierdzenie zapisu i aktualny odczyt.")}</p>
    {command.phase === "retry" && <p>Szkic został zachowany. Ponowienie wyśle tę samą operację.</p>}
    {comparison}
    {!command.busy && <>
      {(command.phase === "read" || command.phase === "retry") && <Button type="button" variant="secondary" onClick={() => void command.retry()}>{command.phase === "read" ? "Ponów odczyt po zapisie" : "Ponów tę samą operację"}</Button>}
      {(command.phase === "conflict" || command.phase === "rejected") && <><p>Szkice są zachowane. Odczytaj stan i sprawdź wynik przed ponownym zapisem.</p><Button type="button" variant="secondary" onClick={onResolve}>Odczytaj stan i rozstrzygnij</Button></>}
    </>}
  </div>;
}

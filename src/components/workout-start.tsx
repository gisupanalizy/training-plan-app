"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LoadedWorkout } from "@/lib/workouts/contracts";
import { Button, Notice } from "@/components/ui";
import { makeCommand, readWorkout, useWorkoutCommand, type ActiveConflict } from "./workout-command";
import { WorkoutCommandStatus } from "./workout-command-status";
import { WorkoutDialog } from "./workout-dialog";
import { WorkoutFinish } from "./workout-finish";
import ui from "./ui/ui.module.css";
import styles from "./plan-workout.module.css";

export function WorkoutStart({ planSessionId }: { planSessionId: string; today?: string }) {
  const router = useRouter();
  const command = useWorkoutCommand();
  const [active, setActive] = useState<ActiveConflict[]>([]);
  const [resolution, setResolution] = useState<{ loaded: LoadedWorkout; action: "finish" | "delete"; replace: boolean } | null>(null);
  const [error, setError] = useState("");
  function start() { command.issue(makeCommand(null, 0, "start", { planSessionId }), (loaded) => { if (loaded) router.push(`/trening/${loaded.workout.id}`); }); }
  async function resolveConflict() {
    setActive(command.error?.activeWorkouts ?? []); command.release(); setResolution(null);
  }
  async function choose(row: ActiveConflict, action: "finish" | "delete") {
    try { setError(""); const loaded = await readWorkout(row.id); setResolution({ loaded, action, replace: active.length === 1 }); }
    catch (cause) { setError((cause as Error).message); }
  }
  function confirm(payload: Record<string, unknown> = {}) {
    if (!resolution) return;
    const { loaded, action, replace } = resolution;
    command.issue(makeCommand(loaded.workout.id, loaded.workout.revision, replace ? "replace_active" : action,
      replace ? { resolution: action, next: { planSessionId }, ...(action === "finish" ? { finish: payload } : {}) } : payload), (next) => {
      setResolution(null);
      if (replace && next) router.push(`/trening/${next.workout.id}`);
      else setActive((rows) => rows.filter((row) => row.id !== loaded.workout.id));
    });
  }
  const conflicts = command.error?.activeWorkouts;
  const many = active.length > 1;
  return <div className={`${styles.workoutStart} workout-start workout-ui`}>
    {!active.length && <Notice tone="info" title="Nowy start">Data i godzina zostaną zapisane automatycznie. Możesz je poprawić przy zakończeniu.</Notice>}
    {!active.length && <Button className={styles.block} variant="primary" disabled={command.blocked} onClick={start}>Rozpocznij trening</Button>}
    <WorkoutCommandStatus command={command} onResolve={() => void resolveConflict()} />
    {!!conflicts?.length && !active.length && <Button variant="secondary" disabled={command.busy} onClick={() => void resolveConflict()}>Pokaż aktywne treningi</Button>}
    {!!active.length && <section className={styles.conflict} aria-label="Aktywne treningi">
      <h3>{many ? "Rozstrzygnij każdy trening osobno" : "Masz aktywny trening"}</h3>
      <p className={styles.muted}>{many ? "Każda sesja wymaga osobnego rozstrzygnięcia." : "Rozstrzygnij istniejącą sesję przed rozpoczęciem nowej."}</p>
      {active.map((row) => <article className={styles.conflictCard} key={row.id}>
        <p className={styles.eyebrow}>Aktywna sesja</p>
        <h4>{row.name}</h4>
        <p>{row.performedOn} · {row.performedAt ? "godzina zapisana" : "godzina nieznana"} · zapisane serie: {row.savedSetCount}</p>
        <div className={styles.actions}>
          <Link className={`${ui.button} ${ui.primary} ${styles.block}`} href={`/trening/${row.id}`}>Wróć do treningu</Link>
          <Button className={styles.block} variant="secondary" disabled={command.blocked} onClick={() => void choose(row, "finish")}>{active.length === 1 ? "Zakończ i rozpocznij nowy" : "Zakończ ten trening"}</Button>
          <Button className={styles.block} variant="danger" disabled={command.blocked} onClick={() => void choose(row, "delete")}>{active.length === 1 ? "Usuń i rozpocznij nowy" : "Usuń ten trening"}</Button>
        </div>
      </article>)}
      <Notice tone="info" title={many ? "Sesje nie są scalane" : "Nowy start"}>{many ? "Powrót, zakończenie i usunięcie dotyczą tylko wskazanego treningu." : "Data rozpoczęcia nowej sesji zapisze się automatycznie."}</Notice>
      <Button variant="ghost" disabled={command.blocked} onClick={() => setActive([])}>Anuluj wybór</Button>
    </section>}
    {error && <p role="alert">{error}</p>}
    {resolution && <WorkoutDialog title={resolution.action === "delete" ? `Usuń trening „${resolution.loaded.workout.name ?? "Trening"}”?` : "Zakończ aktywny trening"} locked={command.blocked} onClose={() => { if (!command.blocked) setResolution(null); }}>
      {resolution.action === "delete" ? <>
        <p>Trwale utracisz wszystkie wyniki i komentarz tej sesji. Plany i rzeczywiste 1RM pozostaną.</p>
        <Notice tone="warning" title="Tej operacji nie można cofnąć">{resolution.replace ? "Po potwierdzeniu data nowej sesji zapisze się automatycznie." : "Usunięcie dotyczy tylko tej sesji."}</Notice>
        <Button variant="danger" disabled={command.blocked} onClick={() => confirm()}>Potwierdzam trwałe usunięcie{resolution.replace ? " i nowy start" : ""}</Button>
      </> : <WorkoutFinish loaded={resolution.loaded} blocked={command.blocked} label={resolution.replace ? "Potwierdź zakończenie i nowy start" : "Potwierdź zakończenie"} onConfirm={confirm} />}
      <WorkoutCommandStatus command={command} onResolve={() => void resolveConflict()} />
    </WorkoutDialog>}
  </div>;
}

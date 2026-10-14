"use client";

import { useState } from "react";
import { formatRange } from "@/lib/domain/format";
import type { getWorkout } from "@/lib/workouts/repository";
import { WorkoutVoice } from "./workout-voice";

type Loaded = NonNullable<Awaited<ReturnType<typeof getWorkout>>>;
type SetRow = Loaded["exercises"][number]["sets"][number];

function nullableNumber(value: string) { return value.trim() === "" ? null : Number(value); }

function target(set: SetRow) {
  const reps = set.target_amrap_snapshot ? "Maksimum powtórzeń" : set.target_reps_min_snapshot === null ?
    set.target_duration_seconds_snapshot === null ? "bez podanych powtórzeń" : `${formatRange(set.target_duration_seconds_snapshot, set.target_duration_seconds_max_snapshot)} s` :
    set.target_reps_max_snapshot === null || set.target_reps_max_snapshot === set.target_reps_min_snapshot ?
      `${set.target_reps_min_snapshot} powt.` : `${set.target_reps_min_snapshot}–${set.target_reps_max_snapshot} powt.`;
  let load = "bez podanego obciążenia";
  if (set.target_load_type_snapshot === "absolute") load = `${formatRange(set.target_kg_snapshot, set.target_kg_max_snapshot)} kg`;
  if (set.target_load_type_snapshot === "bodyweight") load = "masa ciała";
  if (set.target_load_type_snapshot === "percent_1rm") load = `${set.target_percent_snapshot}% 1RM · ${set.rounded_target_kg_snapshot === null ? "brak 1RM, kg nieokreślone" : `${set.rounded_target_kg_snapshot} kg`}`;
  return `${reps} · ${load}${set.target_rest_seconds_snapshot != null ? ` · przerwa ${formatRange(set.target_rest_seconds_snapshot, set.target_rest_seconds_max_snapshot)} s` : ""}`;
}

function SetForm({ set, closed, issue, blocked, workoutId, revision, targetName }: { set: SetRow; closed: boolean; blocked: boolean; workoutId: string; revision: number; targetName: string;
  issue: (action: string, payload: Record<string, unknown>) => void }) {
  const [reps, setReps] = useState(set.actual_reps?.toString() ?? "");
  const [kg, setKg] = useState(set.actual_kg?.toString() ?? "");
  const [duration, setDuration] = useState(set.actual_duration_seconds?.toString() ?? "");
  const [distance, setDistance] = useState(set.actual_distance_meters?.toString() ?? "");
  const [rpe, setRpe] = useState(set.actual_rpe?.toString() ?? "");
  const [rir, setRir] = useState(set.actual_rir?.toString() ?? "");
  const [note, setNote] = useState(set.actual_note ?? "");
  const values = { setId: set.id, actualReps: nullableNumber(reps), actualKg: nullableNumber(kg),
    actualDurationSeconds: nullableNumber(duration), actualDistanceMeters: nullableNumber(distance),
    actualRpe: nullableNumber(rpe), actualRir: nullableNumber(rir), actualNote: note || null };
  return <div className="editor-set"><div className="editor-row"><strong>Seria {set.position}{set.target_optional_snapshot ? " · opcjonalna" : ""}{set.source_kind === "extra" ? " · dodatkowa" : ""}</strong><span className="outline-tag">{set.status === "completed" ? "ZAPISANA" : set.status === "skipped" ? "POMINIĘTA" : "OCZEKUJE"}</span></div>
    <p><strong>Cel:</strong> {set.source_kind === "extra" ? "seria dodatkowa" : target(set)}{set.target_note_snapshot ? ` · ${set.target_note_snapshot}` : ""}</p>
    <div className="editor-grid"><label className="editor-field">Powtórzenia<input type="number" min="0" step="1" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} /></label>
      <label className="editor-field">Ciężar (kg)<input type="number" min="0" step="0.01" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} /></label>
      <label className="editor-field">Czas (s)<input type="number" min="0" step="1" inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} /></label>
      <label className="editor-field">Dystans (m)<input type="number" min="0" step="0.01" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} /></label>
      <label className="editor-field">RPE<input type="number" min="0" max="10" step="0.1" inputMode="decimal" value={rpe} onChange={(e) => setRpe(e.target.value)} /></label>
      <label className="editor-field">RIR<input type="number" min="0" step="0.1" inputMode="decimal" value={rir} onChange={(e) => setRir(e.target.value)} /></label></div>
    <label className="editor-field">Komentarz do serii<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>
    <div className="editor-actions"><button type="button" disabled={blocked || (reps === "" && kg === "" && duration === "" && distance === "")} onClick={() => issue("save_set", { ...values, status: "completed" })}>{set.status === "completed" ? "Zapisz poprawkę" : "Zapisz serię"}</button>
      <button type="button" disabled={blocked} onClick={() => issue("save_set", { setId: set.id, status: "skipped", actualReps: null, actualKg: null, actualDurationSeconds: null, actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: note || null })}>Pomiń serię</button></div>
    {closed && <small>Poprawka zakończonego treningu zostanie zapisana jako nowa rewizja.</small>}
    <WorkoutVoice workoutId={workoutId} revision={revision} intent="set" setId={set.id} targetName={targetName} position={set.position}
      current={{ reps: set.actual_reps, kg: set.actual_kg, duration: set.actual_duration_seconds,
        distance: set.actual_distance_meters, rpe: set.actual_rpe, rir: set.actual_rir,
        note: set.actual_note }} blocked={blocked} issue={issue} />
  </div>;
}

export function WorkoutEditor({ loaded }: { loaded: Loaded }) {
  const [comment, setComment] = useState(loaded.workout.comment ?? "");
  const [extraName, setExtraName] = useState("");
  const [extraVariant, setExtraVariant] = useState("");
  const [pending, setPending] = useState<{ operationId: string; action: string; payload: Record<string, unknown> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const closed = loaded.workout.status !== "in_progress";
  async function send(command: NonNullable<typeof pending>) {
    setPending(command); setBusy(true); setError("");
    try {
      const response = await fetch("/api/workouts", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...command, workoutId: loaded.workout.id, expectedRevision: loaded.workout.revision }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Nie udało się zapisać.");
      window.location.reload();
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  function issue(action: string, payload: Record<string, unknown>) { if (!pending) void send({ operationId: crypto.randomUUID(), action, payload }); }
  return <div className="editor">
    <div className="editor-card"><div className="editor-row"><strong>{loaded.workout.status === "completed" ? "Trening zakończony" : "Trening w toku"} · {loaded.workout.performed_on}</strong><span>Rewizja {loaded.workout.revision}</span></div>
      {pending && <div className="auth-error" role="alert"><p>{error || "Czekam na potwierdzenie zapisu…"}</p><button type="button" className="button button-outline" disabled={busy} onClick={() => void send(pending)}>Ponów tę samą operację</button> <button type="button" className="button button-outline" onClick={() => window.location.reload()}>Odśwież stan</button></div>}
      {!pending && error && <p role="alert" className="auth-error">{error}</p>}
    </div>
    {loaded.exercises.map((exercise) => <section className="editor-card" key={exercise.id}><div className="editor-row"><h2>{exercise.target_name_snapshot}</h2><span className="outline-tag">{exercise.source_kind === "extra" ? "DODATKOWE" : "Z PLANU"}</span></div>
      {exercise.target_original_name_snapshot && exercise.target_original_name_snapshot !== exercise.target_name_snapshot && <p className="source-original">W źródle: {exercise.target_original_name_snapshot}</p>}
      {exercise.superset_group_snapshot && <p className="superset-label">Superseria {exercise.superset_group_snapshot}</p>}
      {exercise.target_note_snapshot && <p>{exercise.target_note_snapshot}</p>}
      <p className="small-muted">Poprzedni porównywalny wynik: {exercise.previousResult ?? "brak"}</p>
      {exercise.sets.map((set) => <SetForm key={set.id} set={set} closed={closed} blocked={busy || !!pending} issue={issue}
        workoutId={loaded.workout.id} revision={loaded.workout.revision} targetName={exercise.target_name_snapshot} />)}
      {!closed && <button type="button" className="button button-outline" disabled={busy || !!pending} onClick={() => issue("add_set", { exerciseId: exercise.id })}>+ Dodatkowa seria</button>}
    </section>)}
    {!closed && <section className="editor-card"><h2>Dodatkowe ćwiczenie</h2><div className="editor-grid"><label className="editor-field">Nazwa<input value={extraName} onChange={(e) => setExtraName(e.target.value)} /></label><label className="editor-field">Wariant (opcjonalnie)<input value={extraVariant} onChange={(e) => setExtraVariant(e.target.value)} /></label></div><button type="button" className="button button-outline" disabled={busy || !!pending || !extraName.trim()} onClick={() => issue("add_exercise", { name: extraName, variant: extraVariant })}>+ Dodaj ćwiczenie</button>
      <WorkoutVoice workoutId={loaded.workout.id} revision={loaded.workout.revision} intent="exercise" blocked={busy || !!pending} issue={issue} /></section>}
    <section className="editor-card"><h2>Komentarz do treningu</h2><label className="editor-field">Komentarz<textarea value={comment} onChange={(e) => setComment(e.target.value)} /></label>{!closed && <><button type="button" className="button button-outline" disabled={busy || !!pending} onClick={() => issue("comment", { comment })}>Zapisz komentarz</button>
      <WorkoutVoice workoutId={loaded.workout.id} revision={loaded.workout.revision} intent="comment" currentComment={loaded.workout.comment}
        blocked={busy || !!pending} issue={issue} /></>}</section>
    {!closed && <button type="button" className="button button-dark" disabled={busy || !!pending} onClick={() => issue("finish", {})}>Zakończ trening</button>}
  </div>;
}

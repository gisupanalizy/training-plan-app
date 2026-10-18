"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./account.module.css";

export function OneRepMaxEditor({ exercises, increment }: {
  exercises: { id: string; name: string; variant: string | null }[]; increment: number;
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [valueKg, setValueKg] = useState("");
  const [effectiveOn, setEffectiveOn] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState(String(increment));
  const [message, setMessage] = useState("");
  const alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (message) alert.current?.focus(); }, [message]);
  const [busy, setBusy] = useState(false);
  const [operationId, setOperationId] = useState(() => crypto.randomUUID());
  function changed(change: () => void) { change(); setOperationId(crypto.randomUUID()); }
  async function saveMaximum(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/one-rep-max", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationId, exerciseId, valueKg: Number(valueKg), effectiveOn, note: note.trim() || null }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error); return; }
      window.location.reload();
    } catch { setMessage("Brak potwierdzenia serwera. Sprawdź historię przed ponowieniem."); }
    finally { setBusy(false); }
  }
  async function saveStep(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/profile/rounding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ incrementKg: Number(step) }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error); return; }
      window.location.reload();
    } catch { setMessage("Nie udało się zapisać kroku zaokrąglenia."); }
    finally { setBusy(false); }
  }
  return <div className={styles.editor}>
    <form onSubmit={saveMaximum} aria-label="Dodaj rzeczywisty 1RM"><h2>Dodaj rzeczywisty 1RM</h2>
      <p className={styles.hint}>Wpisz zmierzone maksimum z datą. To osobna wartość od szacunku w Postępie.</p>
      {exercises.length === 0 ? <p>Najpierw dodaj ćwiczenie do planu.</p> : <>
        <label className="editor-field">Ćwiczenie<select disabled={busy} value={exerciseId} onChange={(event) => changed(() => setExerciseId(event.target.value))}>{exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}{exercise.variant ? ` · ${exercise.variant}` : ""}</option>)}</select></label>
        <div className={styles.pair}>
          <label className="editor-field">Rzeczywiste 1RM, kg<input disabled={busy} type="number" inputMode="decimal" min="0.01" step="0.01" required value={valueKg} onChange={(event) => changed(() => setValueKg(event.target.value))} /></label>
          <label className="editor-field">Data obowiązywania<input disabled={busy} type="date" required value={effectiveOn} onChange={(event) => changed(() => setEffectiveOn(event.target.value))} /></label>
        </div>
        <label className="editor-field">Uwagi<input disabled={busy} value={note} onChange={(event) => changed(() => setNote(event.target.value))} /></label>
        <button className="button button-dark" disabled={busy} aria-busy={busy} type="submit">{busy ? "Zapisywanie…" : "Zapisz maksimum"}</button></>}
    </form>
    <form onSubmit={saveStep} aria-label="Zaokrąglanie celu"><h2>Ustawienia</h2><p className={styles.hint}>Zaokrąglanie do najbliższego kroku w kg. Remis zaokrąglamy w dół.</p>
      <label className="editor-field">Krok kg<input disabled={busy} type="number" inputMode="decimal" min="0.01" step="0.01" required value={step} onChange={(event) => setStep(event.target.value)} /></label>
      <button className="button button-outline" disabled={busy} aria-busy={busy} type="submit">{busy ? "Zapisywanie…" : "Zapisz krok"}</button>
    </form>{message && <p ref={alert} tabIndex={-1} className={styles.error} role="alert">{message}</p>}
  </div>;
}

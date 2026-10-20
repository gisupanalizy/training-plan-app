"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import styles from "./account.module.css";

export function RealMaximumIntro() {
  const [open, setOpen] = useState(false);
  return <>
    <div className={styles.sectionHead}>
      <h2>Rzeczywiste 1RM</h2>
      <button type="button" className={styles.textAction} aria-expanded={open} aria-controls="orm-help" onClick={() => setOpen((value) => !value)}>Co to jest?</button>
    </div>
    {open && <p id="orm-help" className={styles.help} role="note">Rzeczywiste 1RM wpisujesz po pomiarze. Szacunek w Postępie powstaje z wykonanych serii i nigdy go nie zastępuje.</p>}
    <p className={styles.hint}>Wpis nie tworzy treningu i nie przelicza wcześniejszych celów.</p>
  </>;
}

export function OneRepMaxEditor({ exercises, increment, timeZone }: {
  exercises: { id: string; name: string; variant: string | null }[]; increment: number; timeZone: string;
}) {
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? "");
  const [valueKg, setValueKg] = useState("");
  const [effectiveOn, setEffectiveOn] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState(String(increment));
  const [message, setMessage] = useState("");
  const alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (message) alert.current?.focus(); }, [message]);
  const [busy, setBusy] = useState<"maximum" | "step" | null>(null);
  const [operationId, setOperationId] = useState(() => crypto.randomUUID());
  function changed(change: () => void) { change(); setOperationId(crypto.randomUUID()); }
  async function saveMaximum(event: React.FormEvent) {
    event.preventDefault(); setBusy("maximum"); setMessage("");
    try {
      const response = await fetch("/api/one-rep-max", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationId, exerciseId, valueKg: Number(valueKg), effectiveOn, note: note.trim() || null }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error); return; }
      window.location.reload();
    } catch { setMessage("Brak potwierdzenia serwera. Sprawdź historię przed ponowieniem."); }
    finally { setBusy(null); }
  }
  async function saveStep(event: React.FormEvent) {
    event.preventDefault(); setBusy("step"); setMessage("");
    try {
      const response = await fetch("/api/profile/rounding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ incrementKg: Number(step) }) });
      const result = await response.json();
      if (!response.ok) { setMessage(result.error); return; }
      window.location.reload();
    } catch { setMessage("Nie udało się zapisać kroku zaokrąglenia."); }
    finally { setBusy(null); }
  }
  const locked = busy !== null;
  return <div className={styles.editor}>
    <form onSubmit={saveMaximum} aria-label="Dodaj rzeczywisty 1RM">
      <RealMaximumIntro />
      {exercises.length === 0 ? <p className={styles.hint}>Najpierw dodaj ćwiczenie do planu.</p> : <>
        <label className={styles.field}>Ćwiczenie<select disabled={locked} value={exerciseId} onChange={(event) => changed(() => setExerciseId(event.target.value))}>{exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}{exercise.variant ? ` · ${exercise.variant}` : ""}</option>)}</select></label>
        <div className={styles.pair}>
          <Field label="Ciężar (kg)" disabled={locked} type="number" inputMode="decimal" min="0.01" step="0.01" required value={valueKg} onChange={(event) => changed(() => setValueKg(event.target.value))} />
          <Field label="Obowiązuje od" disabled={locked} type="date" required value={effectiveOn} onChange={(event) => changed(() => setEffectiveOn(event.target.value))} />
        </div>
        <Field label="Uwagi" disabled={locked} value={note} onChange={(event) => changed(() => setNote(event.target.value))} />
        <Button type="submit" className={styles.submit} disabled={locked} aria-busy={busy === "maximum"}>{busy === "maximum" ? "Zapisywanie…" : "Zapisz zmierzone 1RM"}</Button>
      </>}
    </form>
    <form className={styles.settings} onSubmit={saveStep} aria-label="Zaokrąglanie celu">
      <h2>Ustawienia treningu</h2>
      <Field label="Krok obciążenia" hint="Zaokrąglanie do najbliższego kroku w kg. Remis zaokrąglamy w dół." disabled={locked} type="number" inputMode="decimal" min="0.01" step="0.01" required value={step} onChange={(event) => setStep(event.target.value)} />
      <Button type="submit" variant="secondary" className={styles.submit} disabled={locked} aria-busy={busy === "step"}>{busy === "step" ? "Zapisywanie…" : "Zapisz krok"}</Button>
      <div className={styles.row}><span>Strefa czasowa</span><strong>{timeZone}</strong></div>
    </form>
    {message && <p ref={alert} tabIndex={-1} className={styles.error} role="alert">{message}</p>}
  </div>;
}

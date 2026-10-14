"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WorkoutStart({ planSessionId, today }: { planSessionId: string; today: string }) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [pending, setPending] = useState<{ operationId: string; payload: { planSessionId: string; performedOn: string } } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    const command = pending ?? { operationId: crypto.randomUUID(), payload: { planSessionId, performedOn: date } };
    setPending(command); setBusy(true); setError("");
    try {
      const response = await fetch("/api/workouts", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...command, workoutId: null, expectedRevision: 0, action: "start" }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Nie udało się rozpocząć treningu.");
      router.push(`/trening/${result.workoutId}`);
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }
  return <div className="workout-start"><label className="editor-field">Data treningu<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setPending(null); }} /></label>
    <button type="button" className="button button-dark" disabled={busy || !date} onClick={start}>{busy ? "Zapisywanie…" : pending ? "Ponów start" : "Rozpocznij trening"}</button>
    {error && <p role="alert" className="auth-error">{error}</p>}</div>;
}

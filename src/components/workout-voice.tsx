"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { VoiceInput, type VoiceResult } from "./voice-input";
import type { VoiceProposal } from "@/lib/voice/domain";
import styles from "./workout-editor.module.css";

export function WorkoutVoice({ workoutId, revision, intent, setId, targetName, position, current, currentComment, blocked, issue }: {
  workoutId: string; revision: number; intent: "set" | "comment" | "exercise"; setId?: string;
  targetName?: string; position?: number; currentComment?: string | null; current?: { reps: number | null; kg: number | null; duration: number | null;
    distance: number | null; rpe: number | null; rir: number | null; note: string | null };
  blocked: boolean; issue: (action: string, payload: Record<string, unknown>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [reps, setReps] = useState(""); const [kg, setKg] = useState("");
  const [series, setSeries] = useState(""); const [name, setName] = useState("");
  const [variant, setVariant] = useState(""); const [comment, setComment] = useState("");
  const proposal = result?.proposal as VoiceProposal | undefined;
  const validTarget = result?.target?.workoutId === workoutId &&
    (intent !== "set" || result.target.setId === setId);
  const validRevision = result?.target?.revision === revision;
  function received(value: VoiceResult | null) {
    setResult(value); if (!value) return;
    const p = value.proposal as VoiceProposal;
    setReps(p.reps === null ? current?.reps?.toString() ?? "" : String(p.reps));
    setKg(p.kg === null ? current?.kg?.toString() ?? "" : String(p.kg));
    setSeries(p.series?.toString() ?? ""); setName(p.name ?? ""); setVariant(p.variant ?? "");
    setComment(intent === "comment" && currentComment?.trim() && p.comment?.trim() ? `${currentComment.trim()}\n${p.comment.trim()}` : p.comment ?? "");
  }
  function confirm() {
    if (!result || !validTarget || !validRevision || blocked || proposal?.intent !== intent) return;
    if (intent === "set" && setId) {
      if (reps === "" && kg === "") return;
      issue("save_set", { setId, status: "completed", actualReps: reps === "" ? null : Number(reps),
        actualKg: kg === "" ? null : Number(kg), actualDurationSeconds: current?.duration ?? null,
        actualDistanceMeters: current?.distance ?? null, actualRpe: current?.rpe ?? null,
        actualRir: current?.rir ?? null, actualNote: current?.note ?? null });
    } else if (intent === "comment") { if (comment.trim()) issue("comment", { comment: comment.trim() }); }
    else if (intent === "exercise") {
      if (!name.trim() || !Number.isInteger(Number(series)) || Number(series) < 1 || Number(series) > 30 || reps === "") return;
      issue("add_exercise", { name: name.trim(), variant: variant.trim(), voiceSets: Array.from({ length: Number(series) }, () => ({ actualReps: Number(reps), actualKg: kg === "" ? null : Number(kg) })) });
    }
  }
  const label = intent === "set" ? `Dyktuj serię ${position ?? ""}` : intent === "comment" ? "Dyktuj komentarz" : "Dyktuj dodatkowe ćwiczenie";
  return <div className={`voice-area ${styles.voice}`}><Button type="button" variant="secondary" className={styles.block} disabled={blocked} onClick={() => { setOpen(!open); setResult(null); }}>{open ? "Zamknij dyktowanie" : label}</Button>
    {open && <><p className={styles.helper}>Nagranie nie zapisuje wyniku. Zapis jest dopiero po zatwierdzeniu propozycji. Tekst transkrypcji można poprawić ręcznie.</p><VoiceInput key={`${workoutId}:${revision}:${setId ?? intent}`} scope="workout" label={label}
      context={{ workoutId, revision, intent, setId }} onProposal={received} />
      {result && <div className="editor-card voice-proposal"><strong>Propozycja do zatwierdzenia</strong><p><strong>Transkrypcja:</strong> {result.transcript}</p>
        <p><strong>Cel:</strong> {intent === "set" ? `${targetName} · seria ${position}` : intent === "comment" ? "Komentarz do tego treningu" : "Nowe ćwiczenie w tym treningu"} · rewizja {revision}</p>
        {proposal?.intent === "clarify" ? <p role="alert">{proposal.question || "Doprecyzuj wypowiedź i spróbuj ponownie."}</p> : <>
          {intent === "set" && <div className="editor-grid"><label className="editor-field">Powtórzenia<input type="number" min="0" step="1" value={reps} onChange={(e) => setReps(e.target.value)} /></label><label className="editor-field">Kilogramy<input type="number" min="0" step="0.01" value={kg} onChange={(e) => setKg(e.target.value)} /></label></div>}
          {intent === "comment" && <label className="editor-field">Komentarz<textarea aria-label="Komentarz" value={comment} onChange={(e) => setComment(e.target.value)} /></label>}
          {intent === "exercise" && <><div className="editor-grid"><label className="editor-field">Ćwiczenie<input value={name} onChange={(e) => setName(e.target.value)} /></label><label className="editor-field">Wariant<input value={variant} onChange={(e) => setVariant(e.target.value)} /></label><label className="editor-field">Liczba serii<input type="number" min="1" max="30" value={series} onChange={(e) => setSeries(e.target.value)} /></label><label className="editor-field">Powtórzenia na serię<input type="number" min="0" value={reps} onChange={(e) => setReps(e.target.value)} /></label><label className="editor-field">Kilogramy na serię (puste = brak danych)<input type="number" min="0" step="0.01" value={kg} onChange={(e) => setKg(e.target.value)} /></label></div></>}
          <Button type="button" variant="primary" className={styles.block} disabled={blocked || !validTarget || !validRevision || proposal?.intent !== intent ||
            (intent === "set" && reps === "" && kg === "") || (intent === "comment" && !comment.trim()) ||
            (intent === "exercise" && (!name.trim() || !series || !reps))} onClick={confirm}>Zatwierdź i zapisz</Button>
          {!validRevision && <p role="alert">Trening zmienił się. Przygotuj nową propozycję dla aktualnej serii.</p>}</>}
      </div>}</>}
  </div>;
}

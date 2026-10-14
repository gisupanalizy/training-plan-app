"use client";

import { useEffect, useRef, useState } from "react";

export type VoiceResult = { transcript: string; proposal: unknown; target: Record<string, unknown> | null };
export function VoiceInput({ scope, context, label, onProposal }: {
  scope: "plan" | "workout"; context?: Record<string, unknown>; label: string; onProposal: (result: VoiceResult | null) => void;
}) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "requesting" | "recording" | "transcribing" | "interpreting">("idle");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTime = useRef(0);
  const cancelled = useRef(false);
  const contextKey = JSON.stringify(context ?? {});

  function cleanup() {
    stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null;
    if (timer.current) clearInterval(timer.current); timer.current = null;
    recorder.current = null;
  }
  function cancel() {
    generation.current++; cancelled.current = true; request.current?.abort(); request.current = null;
    if (recorder.current?.state === "recording") recorder.current.stop(); cleanup(); setState("idle"); setError("");
  }
  useEffect(() => () => {
    generation.current++; cancelled.current = true; request.current?.abort();
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((track) => track.stop());
    if (timer.current) clearInterval(timer.current);
  }, []);
  useEffect(() => { cancel(); onProposal(null); }, [contextKey]);

  async function start() {
    cancel(); onProposal(null); cancelled.current = false; setError(""); setSeconds(0);
    const startGeneration = generation.current;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setError("Brak dostępnego mikrofonu. Wpisz tekst poniżej."); return; }
    const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((candidate) => MediaRecorder.isTypeSupported(candidate));
    if (!mime) { setError("Przeglądarka nie oferuje obsługiwanego formatu nagrania. Wpisz tekst poniżej."); return; }
    setState("requesting");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelled.current || startGeneration !== generation.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      const chunks: BlobPart[] = [];
      const current = new MediaRecorder(media, { mimeType: mime }); recorder.current = current;
      current.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      current.addEventListener("error", () => {
        if (cancelled.current || startGeneration !== generation.current) return;
        cancelled.current = true; generation.current++;
        if (recorder.current === current) cleanup();
        setState("idle"); setError("Nagrywanie zostało przerwane. Wpisz tekst poniżej.");
      });
      current.onstop = () => {
        if (recorder.current === current) cleanup();
        if (cancelled.current || startGeneration !== generation.current) return;
        const blob = new Blob(chunks, { type: mime.startsWith("audio/mp4") ? "audio/mp4" : "audio/webm" });
        setState("transcribing");
        void upload(blob);
      };
      current.start(); setState("recording"); startTime.current = Date.now();
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000); setSeconds(elapsed);
        if (elapsed >= 30 && current.state === "recording") current.stop();
      }, 250);
    } catch { if (startGeneration !== generation.current) return;
      cleanup(); setState("idle"); setError("Nie udało się włączyć mikrofonu. Wpisz tekst poniżej."); }
  }
  function stop() { if (recorder.current?.state === "recording") { setState("transcribing"); recorder.current.stop(); } }
  async function upload(blob: Blob) {
    const id = ++generation.current; const controller = new AbortController(); request.current = controller;
    try {
      const data = new FormData(); data.append("audio", blob, blob.type === "audio/mp4" ? "nagranie.mp4" : "nagranie.webm");
      const response = await fetch("/api/voice/transcribe", { method: "POST", body: data, signal: controller.signal });
      const result = await response.json();
      if (id !== generation.current) return;
      if (!response.ok) throw new Error(result.error ?? "Nie udało się przepisać nagrania.");
      setText(result.text); setState("idle");
    } catch (cause) { if (id === generation.current) { setState("idle"); setError((cause as Error).message); } }
    finally { if (id === generation.current) request.current = null; }
  }
  async function interpret() {
    if (!text.trim()) return;
    const id = ++generation.current; const controller = new AbortController(); request.current = controller;
    setState("interpreting"); setError("");
    try {
      const response = await fetch("/api/voice/interpret", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, ...context, text: text.trim() }), signal: controller.signal });
      const result = await response.json();
      if (id !== generation.current) return;
      if (!response.ok) throw new Error(result.error ?? "Nie udało się przygotować propozycji.");
      onProposal(result); setState("idle");
    } catch (cause) { if (id === generation.current) { setState("idle"); setError((cause as Error).message); } }
    finally { if (id === generation.current) request.current = null; }
  }
  return <div className="voice-input"><strong>{label}</strong><p className="small-muted">Nagranie trwa do 30 s. Tekst można poprawić przed interpretacją. Zapis następuje dopiero po zatwierdzeniu karty.</p>
    <div className="editor-actions">{state === "recording" ? <button type="button" onClick={stop}>Zatrzymaj · {seconds} s</button> :
      <button type="button" className="button button-outline" disabled={state !== "idle"} onClick={() => void start()}>🎙 Nagraj</button>}
      {state !== "idle" && <button type="button" className="button button-outline" onClick={cancel}>Anuluj</button>}</div>
    <label className="editor-field">Transkrypcja lub tekst wpisany ręcznie<textarea value={text} disabled={state !== "idle"}
      onChange={(event) => { setText(event.target.value); onProposal(null); }} maxLength={3000} /></label>
    <button type="button" className="button button-outline" disabled={state !== "idle" || !text.trim()} onClick={() => void interpret()}>{state === "interpreting" ? "Interpretowanie…" : "Przygotuj propozycję"}</button>
    {state === "requesting" && <p>Oczekiwanie na dostęp do mikrofonu…</p>}
    {state === "transcribing" && <p>Przepisywanie nagrania…</p>}{error && <p role="alert" className="auth-error">{error}</p>}
  </div>;
}

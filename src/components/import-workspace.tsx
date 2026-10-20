"use client";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, EmptyState, Icon, StatusBadge } from "@/components/ui";
import styles from "./plan-authoring.module.css";
import { ImportReview } from "./import-review";
import type { PlanEditorDocument } from "@/lib/domain/plan-editor";
import type { ImportQuestion } from "@/lib/imports/questions";
import type { ReviewProgress } from "@/lib/imports/review";
import { IMPORT_LIMITS, STANDARD_UPLOAD_BYTES, XLSX_MIME } from "@/lib/imports/limits";
import { uploadResumable } from "@/lib/imports/resumable-upload";

type Job = { id: string; source_kind: string; status: string; attempt_number: number; draft: Record<string, unknown> | null;
  review_data: { document: PlanEditorDocument; answers: Record<string, unknown>; progress?: ReviewProgress } | null; validation_issues: { path: string; message: string }[];
  error_code: string | null; committed_plan_id?: string | null; expires_at: string };
type Detail = { job: Job; document: PlanEditorDocument | null; questions: ImportQuestion[] };
type ListItem = Pick<Job, "id" | "status" | "source_kind" | "attempt_number" | "error_code">;
const labels: Record<string, string> = { upload_pending: "Czeka na plik", uploaded: "Gotowy do odczytu", processing: "Odczytywanie", partial: "Odczyt w częściach", needs_review: "Do korekty", failed: "Nie udało się odczytać", cancelled: "Anulowany", committed: "Zatwierdzony" };
const statusTone: Record<string, "neutral" | "success" | "warning" | "danger"> = { upload_pending: "warning", uploaded: "neutral", processing: "warning", needs_review: "warning", failed: "danger", cancelled: "neutral", committed: "success" };
const phaseCopy: Record<string, string> = {
  uploading: "Wysyłka nie jest zakończona. Plan nie jest jeszcze zapisany.",
  processing: "Odczyt trwa. Możesz odświeżyć stronę i wrócić do tego importu. Plan nie jest jeszcze zapisany.",
  "error-retry": "Odczyt się nie udał. Ponowienie nie tworzy planu.",
  cancelling: "Import jest anulowany. Plan nie powstał.",
  committed: "Import zatwierdzony. Otwórz zapisany plan.",
  review: "Szkic czeka na korektę. Aktywny plan powstanie dopiero po zatwierdzeniu.",
  uploaded: "Plik jest w prywatnym magazynie. Odczyt jeszcze się nie rozpoczął.",
};
function importPhase(status: string, stage: string) {
  if (stage.includes("Anulowanie")) return "cancelling";
  if (stage.includes("Wysyłanie") || stage.includes("Tworzenie") || stage.includes("Sprawdzanie")) return "uploading";
  if (stage.includes("Odczytywanie") || status === "processing") return "processing";
  if (status === "failed") return "error-retry";
  if (status === "cancelled") return "cancelling";
  if (status === "committed") return "committed";
  if (status === "needs_review") return "review";
  if (status === "upload_pending") return "uploading";
  if (status === "uploaded") return "uploaded";
  return status;
}

async function json(response: Response) {
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Operacja nie powiodła się.");
  return result;
}

export function ImportWorkspace({ initialId, supabaseUrl, supabaseKey }: { initialId: string | null; supabaseUrl: string; supabaseKey: string }) {
  const [id, setId] = useState(initialId);
  const [jobs, setJobs] = useState<ListItem[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"file" | "camera" | "text">("file");
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [cameraReady, setCameraReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const client = useRef(createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } }));
  const loadList = useCallback(async () => {
    try { const result = await json(await fetch("/api/imports", { cache: "no-store" })); setJobs(result.jobs); }
    catch (cause) { setError((cause as Error).message); }
  }, []);
  const load = useCallback(async (jobId: string) => {
    try {
      const result = await json(await fetch(`/api/imports/${jobId}`, { cache: "no-store" })) as Detail;
      setDetail(result); setError("");
      if (result.job.source_kind === "text") {
        const response = await fetch(`/api/imports/${jobId}/source`, { cache: "no-store" });
        setSourceText(response.ok ? await response.text() : "Źródło nie jest dostępne.");
      }
    } catch (cause) { setError((cause as Error).message); setDetail(null); }
  }, []);
  useEffect(() => { void loadList(); if (id) void load(id); }, [id, load, loadList]);
  useEffect(() => { if (detail?.job.status !== "processing") return; const timer = setInterval(() => { void load(detail.job.id); }, 4000); return () => clearInterval(timer); }, [detail?.job.id, detail?.job.status, load]);
  useEffect(() => { if (!id || !stage.includes("Odczytywanie")) return; const timer = setInterval(() => { void load(id); }, 4000); return () => clearInterval(timer); }, [id, stage, load]);
  useEffect(() => () => stream.current?.getTracks().forEach((track) => track.stop()), []);
  useEffect(() => { if (mode === "camera" && cameraReady && video.current && stream.current) { video.current.srcObject = stream.current; void video.current.play(); } }, [mode, cameraReady]);

  function select(jobId: string | null) { setId(jobId); setDetail(null); setSourceText(""); setError(""); history.replaceState(null, "", jobId ? `/plany/import?id=${jobId}` : "/plany/import"); }
  async function camera() {
    setError(""); setFile(null); setCameraReady(false); stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; setMode("camera");
    if (!navigator.mediaDevices?.getUserMedia) { setError("Aparat jest niedostępny. Wybierz zdjęcie z plików."); return; }
    try { const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false }); stream.current = media; setCameraReady(true); }
    catch { setError("Odmówiono dostępu do aparatu albo aparat jest zajęty. Możesz wybrać plik."); }
  }
  function capture() {
    if (!video.current) return;
    const canvas = document.createElement("canvas"); canvas.width = video.current.videoWidth; canvas.height = video.current.videoHeight;
    canvas.getContext("2d")?.drawImage(video.current, 0, 0);
    canvas.toBlob((blob) => { if (blob) { setFile(new File([blob], "zdjecie-planu.jpg", { type: "image/jpeg" })); setMode("file"); stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; } }, "image/jpeg", .85);
  }
  function normalizeFile(selected: File): File {
    const ext = selected.name.toLowerCase().split(".").pop();
    const mime = selected.type === "image/jpg" ? "image/jpeg" : selected.type || ({ pdf: "application/pdf", xlsx: XLSX_MIME, png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" } as Record<string, string>)[ext ?? ""];
    return mime === selected.type ? selected : new File([selected], selected.name, { type: mime });
  }
  function validateFile(selected: File): "pdf" | "xlsx" | "image" {
    const mime = selected.type;
    if (mime === "application/pdf" && selected.size <= IMPORT_LIMITS.pdfBytes) return "pdf";
    if (mime === XLSX_MIME && selected.size <= IMPORT_LIMITS.xlsxBytes) return "xlsx";
    if (["image/png", "image/jpeg"].includes(mime) && selected.size <= IMPORT_LIMITS.imageBytes) return "image";
    throw new Error("Wybierz PDF do 10 MB i 20 stron, XLSX do 5 MB albo PNG/JPEG do 10 MB. Inne formaty nie są obsługiwane.");
  }
  async function readSource(importId: string) {
    let step = await json(await fetch(`/api/imports/${importId}/process`, { method: "POST" }));
    for (let guard = 0; step.resume; guard += 1) {
      if (guard > 15) throw new Error("Odczyt PDF nie zakończył się po wszystkich częściach.");
      setStage(`Odczytywanie źródła — część ${step.progress.done} z ${step.progress.total}`);
      step = await json(await fetch(`/api/imports/${importId}/process`, { method: "POST" }));
    }
  }
  async function start() {
    setError(""); setBusy(true);
    let createdId: string | null = null;
    try {
      const selected = mode === "text" || !file ? null : normalizeFile(file);
      if (!selected && mode !== "text") throw new Error("Wybierz plik lub zrób zdjęcie.");
      const kind = selected ? validateFile(selected) : "text";
      const bytes = new TextEncoder().encode(text);
      if (!selected && (!text.trim() || bytes.length > IMPORT_LIMITS.textBytes)) throw new Error("Wklej tekst do 100 KB.");
      setStage("Tworzenie prywatnego importu");
      const created = await json(await fetch("/api/imports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, mime: selected?.type ?? "text/plain", size: selected?.size ?? bytes.length, ...(selected ? {} : { text }) }) }));
      createdId = created.id ?? created.job?.id;
      if (!createdId) throw new Error("Nie otrzymano identyfikatora importu.");
      select(createdId);
      if (selected) {
        setStage("Wysyłanie pliku do prywatnego magazynu");
        if (selected.size > STANDARD_UPLOAD_BYTES) {
          const { data: sessionData } = await client.current.auth.getSession();
          await uploadResumable({ endpoint: `${supabaseUrl}/storage/v1/upload/resumable`, token: created.token, apiKey: supabaseKey, accessToken: sessionData.session?.access_token, bucket: "training-imports", path: created.path, file: selected, contentType: selected.type, onProgress: (loaded, total) => setStage(`Wysyłanie pliku ${Math.round(loaded / total * 100)}%`) });
        } else {
          const upload = await client.current.storage.from("training-imports").uploadToSignedUrl(created.path, created.token, selected, { contentType: selected.type });
          if (upload.error) throw new Error("Nie udało się wysłać pliku. Możesz anulować import i spróbować ponownie.");
        }
        setStage("Sprawdzanie pliku");
        await json(await fetch(`/api/imports/${createdId}/upload`, { method: "POST" }));
      }
      setStage("Odczytywanie źródła — większy plik może zająć do kilku minut");
      await readSource(createdId);
      setStage(""); await load(createdId); await loadList();
    } catch (cause) { setError((cause as Error).message); if (createdId) await load(createdId); }
    finally { setBusy(false); setStage(""); }
  }
  async function action(actionName: "process" | "cancel") {
    if (!id) return; setBusy(true); setError(""); setStage(actionName === "process" ? "Odczytywanie źródła" : "Anulowanie importu");
    try {
      if (actionName === "process") await readSource(id);
      else await json(await fetch(`/api/imports/${id}/${actionName}`, { method: "POST" }));
      await load(id); await loadList();
    }
    catch (cause) { setError((cause as Error).message); await load(id); }
    finally { setBusy(false); setStage(""); }
  }
  const job = detail?.job;
  const review = job?.status === "needs_review" ? job.review_data?.document ?? detail?.document : null;
  const phase = job ? importPhase(job.status, stage) : "";
  const stopCamera = () => { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; setCameraReady(false); };
  return <div className={`import-workspace ${styles.workspace}`}>
    {error && <p className="auth-error" role="alert">{error}</p>}
    {stage && <p className={styles.stage} role="status">{stage}</p>}
    {!id && <>
      <div className={styles.sourceGrid} aria-label="Wybierz źródło">
        <button type="button" className={styles.sourceTile} aria-label="Plik" aria-pressed={mode === "file"} onClick={() => { setMode("file"); stopCamera(); }}><Icon name="upload" size={32} /><strong>Plik PDF lub XLSX</strong><small>Dokument lub zdjęcie z plików</small></button>
        <button type="button" className={styles.sourceTile} aria-label="Aparat" aria-pressed={mode === "camera"} onClick={() => void camera()}><Icon name="camera" size={32} /><strong>Zdjęcie lub aparat</strong><small>Plan z kartki</small></button>
      </div>
      <div className={styles.secondarySources} aria-label="Inne sposoby">
        <button type="button" className={styles.secondaryAction} aria-label="Wklej tekst" aria-pressed={mode === "text"} onClick={() => { setMode("text"); stopCamera(); }}><Icon name="file" size={22} /><span><strong>Wklej tekst</strong><small>Skopiowany plan</small></span></button>
        <Link className={styles.secondaryAction} href="/plany/edytor?voice=1"><Icon name="microphone" size={22} /><span><strong>Dyktuj plan</strong><small>Propozycja w edytorze</small></span></Link>
        <Link className={styles.secondaryAction} href="/plany/edytor"><Icon name="edit" size={22} /><span><strong>Utwórz ręcznie</strong><small>Bez odczytu AI</small></span></Link>
      </div>
      <section className={styles.sourceForm}><h2>{mode === "file" ? "Dodaj dokument" : mode === "camera" ? "Zrób zdjęcie" : "Tekst planu"}</h2>
        {mode === "file" && <label className="editor-field">PDF (do 20 stron), XLSX, PNG lub JPEG<input type="file" accept=".pdf,.xlsx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/png,image/jpeg" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></label>}
        {mode === "camera" && <div><video className="import-video" ref={video} playsInline muted aria-label="Podgląd aparatu" /><Button variant="primary" onClick={capture} disabled={!stream.current}>Zrób zdjęcie</Button><p>Po odmowie aparatu wybierz zdjęcie z plików.</p></div>}
        {mode === "text" && <label className="editor-field">Tekst planu<textarea value={text} maxLength={100000} onChange={(event) => setText(event.target.value)} placeholder="Wklej plan treningowy…" /></label>}
        {file && <p>Wybrany plik: {file.name} ({Math.ceil(file.size / 1024)} KB)</p>}
        <Button variant="primary" disabled={busy} onClick={() => void start()}>Rozpocznij import</Button>
      </section>
      <div className={styles.notice}><strong>Ty zatwierdzasz</strong>Oryginał pozostanie prywatny przez 7 dni. Najpierw sprawdź nazwy, potem serie i superserie. Plan powstanie po zatwierdzeniu.</div>
      <section className={styles.history} aria-label="Historia importów"><h2>Wcześniejsze importy</h2>
        {jobs.length === 0 ? <EmptyState title="Brak importów">Nie masz jeszcze importów.</EmptyState> : <div className={styles.historyList}>{jobs.map((item) => <button className={styles.historyItem} type="button" key={item.id} onClick={() => select(item.id)}><span><strong>{item.source_kind.toUpperCase()}</strong><small>próba {item.attempt_number}</small></span><StatusBadge tone={statusTone[item.status] ?? "neutral"}>{labels[item.status] ?? item.status}</StatusBadge></button>)}</div>}
      </section>
    </>}

    {id && !detail && <p role="status">Wczytywanie importu…</p>}
    {job && <><section className={`${review ? "import-job-summary" : "editor-card"} ${styles.jobCard}`} data-import-phase={phase}>
      <div className={styles.jobHead}><StatusBadge tone={statusTone[job.status] ?? "neutral"}>{labels[job.status] ?? job.status}</StatusBadge><Button variant="ghost" onClick={() => select(null)}>← Lista importów</Button></div>
      <h2>{labels[job.status] ?? job.status}</h2>
      <p>{phase === "committed" && !job.committed_plan_id ? "Import jest zatwierdzony. Odczyt nie zawiera identyfikatora planu." : phaseCopy[phase] ?? "Status pochodzi z serwera. Plan nie powstaje przed zatwierdzeniem."}</p>
      <p>Źródło: {job.source_kind.toUpperCase()} · próba {job.attempt_number}/3 · dostępne do {new Date(job.expires_at).toLocaleDateString("pl-PL")}</p>
      {job.error_code && <p className="auth-error" role="alert">Błąd: {job.error_code}</p>}
      <div className={styles.jobActions}>
        {(["uploaded", "failed", "processing", "partial"].includes(job.status)) && <Button variant={job.status === "failed" ? "primary" : "secondary"} disabled={busy} onClick={() => void action("process")}>Odczytaj / ponów próbę</Button>}
        {!["committed", "cancelled"].includes(job.status) && <Button variant="ghost" disabled={busy && job.status !== "processing"} onClick={() => void action("cancel")}>Anuluj import</Button>}
        {job.status === "committed" && job.committed_plan_id && <Link className={styles.primaryLink} href={`/plany/${job.committed_plan_id}`}>Otwórz zapisany plan</Link>}
      </div>
    </section>
      {review && job.draft && <ImportReview key={job.id} id={job.id} kind={job.source_kind} text={sourceText} initial={review} questions={detail!.questions} rawDraft={job.draft} answers={job.review_data?.answers} progress={job.review_data?.progress} warnings={Array.isArray(job.draft.warnings) ? job.draft.warnings.map(String) : []} />}
    </>}
  </div>;
}

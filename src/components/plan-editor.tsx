"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emptyDocument, emptySet, parsePlanEditorDocument, withReviewIds, resizeSets, type PlanEditorDocument, type PlanEditorExercise } from "../lib/domain/plan-editor";
import type { PlannedSetInput } from "../lib/domain/model";
import { applyQuestionAnswer, pendingQuestions, questionState, type ImportQuestion } from "../lib/imports/questions";
import { ExerciseNamePicker } from "./exercise-name-picker";
import { ImportQuestionCard } from "./import-question-card";
import { suggestExerciseName } from "@/lib/exercises/names";
import { VoiceInput, type VoiceResult } from "./voice-input";
import { CompactPlanEditor } from "./compact-plan-editor";

type CatalogExercise = { id: string; name: string; variant: string | null; equipment: string | null };
const nullableNumber = (value: string) => value.trim() === "" ? null : Number(value);
const nullableText = (value: string) => value.trim() === "" ? null : value;
const newExercise = (): PlanEditorExercise => ({ reviewId: crypto.randomUUID(), exerciseId: null, name: "", variant: null, equipment: null, supersetGroup: null, note: null, sets: [{ ...emptySet(1), reviewId: crypto.randomUUID() }] });

type ImportReview = { id: string; questions: ImportQuestion[]; draft: Record<string, unknown>; answers?: Record<string, unknown>; onSource?: (reference: string) => void };
export function PlanEditor({ initial, planId, expectedVersionId, catalog, importReview, initialVoice = false }: {
  initial?: PlanEditorDocument; planId: string | null; expectedVersionId: string | null; catalog: CatalogExercise[]; importReview?: ImportReview; initialVoice?: boolean;
}) {
  return importReview ? <LegacyImportEditor initial={initial} planId={planId} expectedVersionId={expectedVersionId} catalog={catalog} importReview={importReview} />
    : <CompactPlanEditor initialVoice={initialVoice} initial={initial} planId={planId} expectedVersionId={expectedVersionId} catalog={catalog} />;
}

// Zachowana zgodność starego klienta importu; bieżący import używa ImportReview.
function LegacyImportEditor({ initial, planId, expectedVersionId, catalog, importReview }: {
  initial?: PlanEditorDocument; planId: string | null; expectedVersionId: string | null; catalog: CatalogExercise[]; importReview: ImportReview;
}) {
  const [document, setDocument] = useState<PlanEditorDocument>(() => withReviewIds(initial ?? emptyDocument()));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [operationId, setOperationId] = useState(() => crypto.randomUUID());
  const [answers, setAnswers] = useState<Record<string, unknown>>(importReview?.answers ?? {});
  const [questionPage, setQuestionPage] = useState(0);
  const [saved, setSaved] = useState(true);
  const [voiceResult, setVoiceResult] = useState<VoiceResult | null>(null);
  const router = useRouter();
  useEffect(() => {
    if (!importReview || saved) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [importReview, saved]);
  function edit(change: (draft: PlanEditorDocument) => void, fromQuestion = false) {
    const next = structuredClone(document); change(next);
    if (importReview && !fromQuestion) {
      const stale = [...importReview.questions, ...pendingQuestions(importReview.questions, document, answers)].filter((q) => JSON.stringify(questionState(q, document)) !== JSON.stringify(questionState(q, next))).map((q) => q.id);
      if (stale.length) setAnswers((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !stale.includes(id))));
    }
    setDocument(next); setError(""); setSaved(false); setOperationId(crypto.randomUUID());
  }
  function editSet(day: number, exercise: number, set: number, key: keyof PlannedSetInput, value: unknown) {
    edit((draft) => { (draft.sessions[day].exercises[exercise].sets[set] as unknown as Record<string, unknown>)[key] = value; });
  }
  function answerQuestion(question: ImportQuestion, answer: unknown) {
    setAnswers((current) => { const next = { ...current }; if (answer === undefined) delete next[question.id]; else next[question.id] = answer; return next; });
    edit((draft) => {
      applyQuestionAnswer(draft, question, answer);
      if (question.id.startsWith("ambiguous_percent:") && answer === "percent_1rm") {
        const raw = question.path.split(".");
        const original = (importReview?.draft.sessions as { exercises?: { sets?: { target_percent?: number }[] }[] }[] | undefined)?.[Number(raw[1])]?.exercises?.[Number(raw[3])]?.sets?.[Number(raw[5])];
        const anchor = question.targets?.[0];
        const target = anchor ? draft.sessions.find((session) => session.reviewId === anchor.sessionId)?.exercises.find((exercise) => exercise.reviewId === anchor.exerciseId)?.sets.find((set) => set.reviewId === anchor.setId) : draft.sessions[Number(raw[1])]?.exercises[Number(raw[3])]?.sets[Number(raw[5])];
        if (target && typeof original?.target_percent === "number") { target.loadType = "percent_1rm"; target.targetPercent = original.target_percent; target.targetKg = null; target.targetKgMax = null; }
      }
    }, true);
  }
  async function saveReview() {
    if (!importReview) return false;
    try { parsePlanEditorDocument(document); } catch (cause) { setError((cause as Error).message); return false; }
    const response = await fetch(`/api/imports/${importReview.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ document, answers }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Nie udało się zapisać korekty."); return false; }
    setSaved(true); return true;
  }
  async function save() {
    setError("");
    try { parsePlanEditorDocument(document); }
    catch (cause) { setError((cause as Error).message); return; }
    setSaving(true);
    try {
      if (importReview && !(await saveReview())) return;
      const response = await fetch(importReview ? `/api/imports/${importReview.id}/approve` : "/api/plans", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importReview ? { operationId, document, answers } : { operationId, planId, expectedVersionId, document }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Nie udało się zapisać planu."); return; }
      router.push(`/plany/${result.planId}`); router.refresh();
    } catch { setError("Brak potwierdzenia serwera. Spróbuj ponownie; operacja ma ten sam identyfikator."); }
    finally { setSaving(false); }
  }
  const allQuestions = importReview?.questions ?? [];
  const questions = pendingQuestions(allQuestions, document, answers);
  useEffect(() => { setQuestionPage((page) => Math.min(page, Math.max(0, Math.ceil(questions.length / 10) - 1))); }, [questions.length]);
  const voicePlan = voiceResult?.proposal as { document: PlanEditorDocument; issues: { path: string; message: string }[] } | undefined;
  return <div className="editor">
    {!importReview && <section className="editor-card"><h2>Dyktuj fragment planu</h2>
      <VoiceInput scope="plan" label="Plan i serie" onProposal={setVoiceResult} />
      {voiceResult && voicePlan && <div className="voice-proposal"><strong>Propozycja do szkicu planu</strong><p><strong>Transkrypcja:</strong> {voiceResult.transcript}</p>
        <p><strong>Cel:</strong> bieżący edytor · {voicePlan.document.sessions.length} dni</p>
        {voicePlan.document.sessions.map((session, index) => <div key={index}><strong>{session.dayLabel}</strong>
          {session.exercises.map((exercise, exerciseIndex) => <p key={exercise.reviewId ?? exerciseIndex}>{exercise.name}: {exercise.sets.map((set) =>
            `${set.repsMin ?? "?"} powt. · ${set.loadType === "absolute" ? `${set.targetKg ?? "?"} kg` : set.loadType === "percent_1rm" ? `${set.targetPercent ?? "?"}% 1RM` : "obciążenie niepodane"}`).join("; ")}</p>)}
        </div>)}
        {voicePlan.issues.length > 0 && <div role="alert">Do sprawdzenia: {voicePlan.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ")}</div>}
        <button type="button" onClick={() => { edit((draft) => {
          if (!draft.name.trim()) draft.name = voicePlan.document.name;
          const blank = draft.sessions.every((session) => session.exercises.every((exercise) => !exercise.name.trim()));
          draft.sessions = blank ? voicePlan.document.sessions : [...draft.sessions, ...voicePlan.document.sessions];
        }); setVoiceResult(null); }}>Dodaj propozycję do szkicu</button>
        <p className="small-muted">Przejrzyj i popraw pola w edytorze. Aktywny plan powstanie dopiero po osobnym zatwierdzeniu publikacji.</p>
      </div>}</section>}
    {importReview && <section className="editor-card" aria-label="Pytania do importu"><div className="editor-row"><h2>Pytania do źródła</h2><strong>{questions.length} do wyjaśnienia</strong></div>
      <p>Odpowiedzi uzupełniają wskazane pola szkicu. Przejrzyj także układ i uwagi przed zatwierdzeniem.</p>
      {questions.length === 0 && <p className="review-complete">Wszystkie wskazane niejasności są rozwiązane. Przejrzyj jeszcze źródło i szkic.</p>}
      {questions.slice(questionPage * 10, questionPage * 10 + 10).map((question, index) => <ImportQuestionCard key={question.id} question={question} document={document} answer={answers[question.id]} number={questionPage * 10 + index + 1} onAnswer={(answer) => answerQuestion(question, answer)} onSource={importReview?.onSource} />)}
      {questions.length > 10 && <div className="editor-row"><button type="button" className="button button-outline" disabled={questionPage === 0} onClick={() => setQuestionPage((p) => p - 1)}>← Poprzednie</button><span>Strona {questionPage + 1} z {Math.ceil(questions.length / 10)}</span><button type="button" className="button button-outline" disabled={(questionPage + 1) * 10 >= questions.length} onClick={() => setQuestionPage((p) => p + 1)}>Następne →</button></div>}</section>}
    <div className="editor-card"><label className="editor-field">Nazwa planu<input value={document.name} maxLength={120} onChange={(event) => edit((draft) => { draft.name = event.target.value; })} placeholder="Np. Fundament siły" /></label></div>
    {document.sessions.map((day, dayIndex) => <section className="editor-card" key={day.reviewId ?? dayIndex}>
      <div className="editor-row"><h2>Dzień {dayIndex + 1}</h2><div className="editor-actions">
        <button type="button" onClick={() => edit((draft) => { if (dayIndex > 0) [draft.sessions[dayIndex - 1], draft.sessions[dayIndex]] = [draft.sessions[dayIndex], draft.sessions[dayIndex - 1]]; })} disabled={dayIndex === 0}>↑</button>
        <button type="button" onClick={() => edit((draft) => { if (dayIndex < draft.sessions.length - 1) [draft.sessions[dayIndex + 1], draft.sessions[dayIndex]] = [draft.sessions[dayIndex], draft.sessions[dayIndex + 1]]; })} disabled={dayIndex === document.sessions.length - 1}>↓</button>
        <button type="button" onClick={() => edit((draft) => { if (draft.sessions.length > 1) draft.sessions.splice(dayIndex, 1); })} disabled={document.sessions.length === 1}>Usuń dzień</button>
      </div></div>
      <div className="editor-grid"><label className="editor-field">Tydzień<input type="number" min="1" max="52" value={day.weekNumber} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].weekNumber = Number(event.target.value); })} /></label>
        <label className="editor-field">Oznaczenie dnia<input value={day.dayLabel} maxLength={80} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].dayLabel = event.target.value; })} placeholder="A" /></label></div>
      <label className="editor-field">Uwagi do dnia<textarea value={day.note ?? ""} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].note = nullableText(event.target.value); })} /></label>
      {day.exercises.map((exercise, exerciseIndex) => <div className="editor-exercise" key={exercise.reviewId ?? exerciseIndex}>
        <div className="editor-row"><h3>Ćwiczenie {exerciseIndex + 1}</h3><div className="editor-actions">
          <button type="button" disabled={exerciseIndex === 0} onClick={() => edit((draft) => { const list = draft.sessions[dayIndex].exercises; [list[exerciseIndex - 1], list[exerciseIndex]] = [list[exerciseIndex], list[exerciseIndex - 1]]; })}>↑</button>
          <button type="button" disabled={exerciseIndex === day.exercises.length - 1} onClick={() => edit((draft) => { const list = draft.sessions[dayIndex].exercises; [list[exerciseIndex + 1], list[exerciseIndex]] = [list[exerciseIndex], list[exerciseIndex + 1]]; })}>↓</button>
          <button type="button" disabled={day.exercises.length === 1} onClick={() => edit((draft) => { draft.sessions[dayIndex].exercises.splice(exerciseIndex, 1); })}>Usuń</button>
        </div></div>
        {exercise.originalName && exercise.originalName !== exercise.name && <p className="source-original">W źródle: {exercise.originalName}</p>}
        {suggestExerciseName(exercise.originalName ?? exercise.name) && <p className="name-suggestion">Propozycja nazwy: {suggestExerciseName(exercise.originalName ?? exercise.name)!.pl} <button type="button" onClick={() => edit((draft) => { const item = draft.sessions[dayIndex].exercises[exerciseIndex]; item.originalName ??= item.name; item.name = suggestExerciseName(item.originalName)!.pl; })}>Zastosuj nazwę</button></p>}
        <ExerciseNamePicker original={exercise.originalName ?? exercise.name} onSelect={(name) => edit((draft) => { const item = draft.sessions[dayIndex].exercises[exerciseIndex]; item.originalName ??= item.name; item.name = name; })} />
        {exercise.sourceRef && <button type="button" className="source-reference" onClick={() => importReview?.onSource?.(exercise.sourceRef!)}>{exercise.sourceRef}</button>}
        <label className="editor-field">Wybierz zapisane ćwiczenie lub dodaj własne<select value={exercise.exerciseId ?? ""} onChange={(event) => edit((draft) => { const item = catalog.find((entry) => entry.id === event.target.value); const target = draft.sessions[dayIndex].exercises[exerciseIndex]; target.exerciseId = item?.id ?? null; if (item) { target.name = item.name; target.variant = item.variant; target.equipment = item.equipment; } })}><option value="">Nowe ćwiczenie</option>{catalog.map((item) => <option value={item.id} key={item.id}>{item.name}{item.variant ? ` · ${item.variant}` : ""}</option>)}</select></label>
        <div className="editor-grid"><label className="editor-field">Nazwa<input value={exercise.name} maxLength={120} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].exercises[exerciseIndex].name = event.target.value; })} /></label>
          <label className="editor-field">Wariant<input value={exercise.variant ?? ""} disabled={exercise.exerciseId !== null} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].exercises[exerciseIndex].variant = nullableText(event.target.value); })} /></label>
          <label className="editor-field">Sprzęt<input value={exercise.equipment ?? ""} disabled={exercise.exerciseId !== null} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].exercises[exerciseIndex].equipment = nullableText(event.target.value); })} /></label>
          <label className="editor-field">Grupa superserii<input value={exercise.supersetGroup ?? ""} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].exercises[exerciseIndex].supersetGroup = nullableText(event.target.value); })} placeholder="Np. S1" /></label></div>
        <div className="editor-grid"><label className="editor-field">Liczba serii od<input aria-label={`Liczba serii od: ${exercise.name}`} type="number" min="1" max="30" value={exercise.setCountMin ?? exercise.sets.length} onChange={(event) => edit((draft) => { const item = draft.sessions[dayIndex].exercises[exerciseIndex]; const count = Number(event.target.value); resizeSets(item, count, Math.max(count, item.setCountMax ?? item.sets.length)); })} /></label><label className="editor-field">Liczba serii do<input aria-label={`Liczba serii do: ${exercise.name}`} type="number" min="1" max="30" value={exercise.setCountMax ?? exercise.sets.length} onChange={(event) => edit((draft) => { const item = draft.sessions[dayIndex].exercises[exerciseIndex]; const count = Number(event.target.value); resizeSets(item, Math.min(count, item.setCountMin ?? item.sets.length), count); })} /></label></div>
        <label className="editor-check"><input type="checkbox" checked={!!exercise.isOptional} onChange={(event) => edit((draft) => { const item = draft.sessions[dayIndex].exercises[exerciseIndex]; item.isOptional = event.target.checked; resizeSets(item, item.setCountMin ?? item.sets.length, item.setCountMax ?? item.sets.length); })} /> Ćwiczenie opcjonalne</label>
        {exercise.setCountSource && <p className="small-muted">Zalecenie źródłowe: {exercise.setCountSource}</p>}
        <label className="editor-field">Uwagi do ćwiczenia<textarea value={exercise.note ?? ""} onChange={(event) => edit((draft) => { draft.sessions[dayIndex].exercises[exerciseIndex].note = nullableText(event.target.value); })} /></label>
        {exercise.sets.map((set, setIndex) => <div className="editor-set" key={set.reviewId ?? setIndex}>
          <div className="editor-row"><strong>Seria {setIndex + 1}{set.isOptional ? " · opcjonalna" : ""}</strong><button type="button" disabled={exercise.sets.length === 1} onClick={() => edit((draft) => { const list = draft.sessions[dayIndex].exercises[exerciseIndex].sets; list.splice(setIndex, 1); list.forEach((item, i) => { item.position = i + 1; }); const item = draft.sessions[dayIndex].exercises[exerciseIndex]; resizeSets(item, Math.min(item.setCountMin ?? list.length, list.length), list.length); })}>Usuń serię</button></div>
          <div className="editor-grid">
            <label className="editor-field">Rodzaj<select value={set.kind} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "kind", event.target.value)}><option value="warmup">Rozgrzewka</option><option value="ramp">Rampa</option><option value="work">Robocza</option><option value="backoff">Back-off</option><option value="drop">Drop</option></select></label>
            <label className="editor-field">Powtórzenia od<input type="number" min="0" value={set.repsMin ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "repsMin", nullableNumber(event.target.value))} /></label>
            <label className="editor-field">Powtórzenia do<input type="number" min="0" value={set.repsMax ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "repsMax", nullableNumber(event.target.value))} /></label>
            <label className="editor-field">Obciążenie<select value={set.loadType} onChange={(event) => edit((draft) => { const target = draft.sessions[dayIndex].exercises[exerciseIndex].sets[setIndex]; target.loadType = event.target.value as PlannedSetInput["loadType"]; target.targetKg = null; target.targetKgMax = null; target.targetPercent = null; target.bodyweightAdjustment = null; target.bodyweightDeltaKg = null; })}><option value="unspecified">Nie podano</option><option value="absolute">kg</option><option value="percent_1rm">% rzeczywistego 1RM</option><option value="bodyweight">Masa ciała</option></select></label>
            {set.loadType === "absolute" && <label className="editor-field">Cel kg<input type="number" min="0" step="0.01" value={set.targetKg ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "targetKg", nullableNumber(event.target.value))} /></label>}
            {set.loadType === "percent_1rm" && <label className="editor-field">Procent 1RM<input type="number" min="0.01" max="100" step="0.01" value={set.targetPercent ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "targetPercent", nullableNumber(event.target.value))} /></label>}
            {set.loadType === "absolute" && <label className="editor-field">Cel kg do<input type="number" min="0" step="0.01" value={set.targetKgMax ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "targetKgMax", nullableNumber(event.target.value))} /></label>}
            {set.loadType === "bodyweight" && <><label className="editor-field">Masa ciała<select value={set.bodyweightAdjustment ?? "none"} onChange={(event) => edit((draft) => { const target = draft.sessions[dayIndex].exercises[exerciseIndex].sets[setIndex]; target.bodyweightAdjustment = event.target.value as PlannedSetInput["bodyweightAdjustment"]; target.bodyweightDeltaKg = null; })}><option value="none">Bez korekty</option><option value="additional">Dodatkowy ciężar</option><option value="assistance">Asysta</option></select></label>{set.bodyweightAdjustment !== "none" && set.bodyweightAdjustment !== null && <label className="editor-field">Korekta kg<input type="number" min="0.01" step="0.01" value={set.bodyweightDeltaKg ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "bodyweightDeltaKg", nullableNumber(event.target.value))} /></label>}</>}
            <label className="editor-field">Hantle<select value={set.dumbbellBasis ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "dumbbellBasis", event.target.value || null)}><option value="">Nie dotyczy</option><option value="per_hand">Na jedną rękę</option><option value="total">Łącznie</option></select></label>
            <label className="editor-field">Przerwa sek.<input type="number" min="0" value={set.restSeconds ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "restSeconds", nullableNumber(event.target.value))} /></label>
            <label className="editor-field">Tempo<input value={set.tempo ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "tempo", nullableText(event.target.value))} /></label>
            <label className="editor-field">RPE<input type="number" min="0" max="10" step="0.1" value={set.targetRpe ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "targetRpe", nullableNumber(event.target.value))} /></label>
            <label className="editor-field">RIR<input type="number" min="0" step="0.1" value={set.targetRir ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "targetRir", nullableNumber(event.target.value))} /></label>
            <label className="editor-field">Czas sek.<input type="number" min="0" value={set.durationSeconds ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "durationSeconds", nullableNumber(event.target.value))} /></label>
            <label className="editor-field">Dystans m<input type="number" min="0" step="0.01" value={set.distanceMeters ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "distanceMeters", nullableNumber(event.target.value))} /></label>
          </div>
          <label className="editor-check"><input type="checkbox" checked={set.isAmrap} onChange={(event) => edit((draft) => { const item = draft.sessions[dayIndex].exercises[exerciseIndex].sets[setIndex]; item.isAmrap = event.target.checked; if (item.isAmrap) { item.repsMin = null; item.repsMax = null; item.durationSeconds = null; item.durationSecondsMax = null; item.distanceMeters = null; } })} /> Maksymalna liczba powtórzeń (AMRAP)</label>
          <div className="editor-grid"><label className="editor-field">Czas do (s)<input type="number" min="0" value={set.durationSecondsMax ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "durationSecondsMax", nullableNumber(event.target.value))} /></label><label className="editor-field">Przerwa do (s)<input type="number" min="0" value={set.restSecondsMax ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "restSecondsMax", nullableNumber(event.target.value))} /></label></div>
          <label className="editor-field">Uwagi do serii<input value={set.note ?? ""} onChange={(event) => editSet(dayIndex, exerciseIndex, setIndex, "note", nullableText(event.target.value))} /></label>
        </div>)}
        <button type="button" className="button button-outline" onClick={() => edit((draft) => { const list = draft.sessions[dayIndex].exercises[exerciseIndex].sets; const item = draft.sessions[dayIndex].exercises[exerciseIndex]; const ranged = item.setCountMin != null && item.setCountMax !== item.setCountMin; list.push({ ...emptySet(list.length + 1), reviewId: crypto.randomUUID() }); resizeSets(item, ranged ? item.setCountMin! : list.length, list.length); })}>+ Dodaj serię</button>
      </div>)}
      <button type="button" className="button button-outline" onClick={() => edit((draft) => { draft.sessions[dayIndex].exercises.push(newExercise()); })}>+ Dodaj ćwiczenie</button>
    </section>)}
    <div className="editor-footer"><button type="button" className="button button-outline" onClick={() => edit((draft) => { draft.sessions.push({ reviewId: crypto.randomUUID(), weekNumber: 1, dayLabel: "", note: null, exercises: [newExercise()] }); })}>+ Dodaj dzień</button>
      {importReview && <button type="button" className="button button-outline" disabled={saving} onClick={async () => { setSaving(true); try { await saveReview(); } catch { setError("Brak potwierdzenia zapisu szkicu."); } finally { setSaving(false); } }}>{saved ? "Korekta zapisana" : "Zapisz korektę"}</button>}
      <button type="button" className="button button-dark" disabled={saving} onClick={save}>{saving ? "Zapisywanie…" : importReview ? "Zatwierdź i utwórz plan" : planId ? "Opublikuj nową wersję" : "Utwórz plan"}</button></div>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <p className="small-muted">{importReview ? "Szkic nie jest aktywnym planem. Plan powstaje dopiero po świadomym zatwierdzeniu." : "Zapis publikuje całą wersję planu. Procenty pozostają bez kilogramów, dopóki nie podasz rzeczywistego 1RM."}</p>
  </div>;
}

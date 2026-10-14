"use client";
import { useState } from "react";
import { questionTargets, type ImportQuestion } from "@/lib/imports/questions";
import type { PlanEditorDocument } from "@/lib/domain/plan-editor";

export function ImportQuestionCard({ question: q, document, answer, number, onAnswer, onSource }: {
  question: ImportQuestion; document: PlanEditorDocument; answer: unknown; number: number;
  onAnswer: (answer: unknown) => void; onSource?: (reference: string) => void;
}) {
  const current = typeof answer === "object" && answer ? answer as { unit?: string; value?: number; max?: number } : null;
  const [unit, setUnit] = useState(current?.unit ?? (q.options.length === 1 ? q.options[0].value : ""));
  const [minimum, setMinimum] = useState(current?.value?.toString() ?? "");
  const [maximum, setMaximum] = useState(current?.max?.toString() ?? "");
  const targets = questionTargets(q, document);
  const first = targets[0];
  const ordinals = targets.filter((target) => target.set).map((target) => target.set!.position);
  const ordered = [...new Set(ordinals)].sort((a,b) => a-b);
  const seriesLabel = ordered.length > 1 && ordered.at(-1)! - ordered[0] === ordered.length - 1 ? `${ordered[0]}–${ordered.at(-1)}` : ordered.join(", ");
  const context = q.scope === "source" ? q.context : first ? `${first.session.dayLabel}${first.exercise ? ` → ${targets.some((target) => target.exercise !== first.exercise) ? "wspólny blok ćwiczeń" : first.exercise.name}` : ""}${ordinals.length ? ` → serie ${seriesLabel}` : ""}` : q.context;
  return <fieldset className="import-question"><legend>{number}. {q.prompt}</legend>
    {context && <p className="question-context">{context}</p>}
    {q.reason && <p className="small-muted">{q.reason}</p>}
    {q.sourceRef && <div className="question-source"><span>{q.sourceRef}</span>{onSource && <button type="button" onClick={() => onSource(q.sourceRef!)}>Pokaż w źródle</button>}</div>}
    {q.answerType === "choice" ? <select aria-label={q.prompt} value={typeof answer === "string" ? answer : ""} onChange={(e) => onAnswer(e.target.value)}><option value="">Wybierz odpowiedź</option>{q.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      : q.answerType === "number" ? <div className="import-question-input"><input type="number" inputMode="numeric" aria-label={q.prompt} min={q.min ?? undefined} max={q.max ?? undefined} value={typeof answer === "number" ? answer : ""} onChange={(e) => onAnswer(e.target.value === "" ? undefined : Number(e.target.value))} />{q.unit && <span>{q.unit}</span>}</div>
      : <div className="question-quantity"><label>Cel<select aria-label={`Jednostka: ${q.prompt}`} value={unit} onChange={(e) => setUnit(e.target.value)}><option value="">Wybierz jednostkę</option>{q.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        {unit !== "amrap" && <div className="import-question-input"><label>Wartość / od<input type="number" aria-label={`Wartość: ${q.prompt}`} min={q.min ?? undefined} max={q.max ?? undefined} step={unit === "kg" || unit === "distance_meters" ? "any" : 1} value={minimum} onChange={(e) => setMinimum(e.target.value)} /></label>
          {unit !== "distance_meters" && unit !== "percent_1rm" && <label>Do (opcjonalnie)<input type="number" aria-label={`Górna granica: ${q.prompt}`} min={q.min ?? undefined} max={q.max ?? undefined} value={maximum} onChange={(e) => setMaximum(e.target.value)} /></label>}</div>}
        <button type="button" disabled={!unit || unit !== "amrap" && (minimum === "" || Number(minimum) < q.min! || Number(minimum) > q.max! || maximum !== "" && (Number(maximum) < Number(minimum) || Number(maximum) > q.max!))} onClick={() => onAnswer({ unit, value: unit === "amrap" ? null : Number(minimum), max: unit === "amrap" || !maximum ? null : Number(maximum) })}>Zastosuj odpowiedź</button>
      </div>}
  </fieldset>;
}

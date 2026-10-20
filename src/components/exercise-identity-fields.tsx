"use client";
import { useState } from "react";
import type { PlanEditorExercise } from "@/lib/domain/plan-editor";
import { exerciseNames } from "@/lib/exercises/names";
import { clearIdentityOnMeaningChange, confirmIdentity, keepCustomIdentity } from "@/lib/exercises/identity";
import { ExerciseNamePicker } from "./exercise-name-picker";

export function ExerciseIdentityFields({ draft, onChange }: { draft: PlanEditorExercise; onChange: (next: PlanEditorExercise) => void }) {
  const [assets, setAssets] = useState<string[]>([]);
  const [assetQuery, setAssetQuery] = useState("");
  const suggestion = draft.assignment === "unresolved" ? draft.suggestion : null;
  const entry = suggestion ? exerciseNames.find((item) => item.key === suggestion.key) : undefined;
  return <>
    {draft.originalName && draft.originalName !== draft.name && <p className="review-hint">W źródle: {draft.originalName}</p>}
    {draft.assignment === "exact" || draft.assignment === "private_alias" ? <p className="review-hint">Przypisano sprawdzoną nazwę. Oryginał zostaje w szczegółach.</p> : null}
    {draft.assignment === "custom" && <p className="review-hint">Własne ćwiczenie. Historia nie połączy się z innym ruchem.</p>}
    {entry && suggestion && <div className="review-hint"><p>Propozycja: {suggestion.pl}{suggestion.variant ? ` · ${suggestion.variant}` : ""}{suggestion.equipment ? ` · ${suggestion.equipment}` : ""}. Potwierdź albo zostaw własną nazwę.</p>
      <button type="button" className="review-link" onClick={() => onChange(confirmIdentity(draft, entry))}>Potwierdź: {suggestion.pl}</button>
      <button type="button" className="review-link" onClick={() => onChange(keepCustomIdentity(draft))}>Zostaw własną nazwę</button>
    </div>}
    <ExerciseNamePicker original={draft.originalName ?? draft.name} onSelect={(name) => {
      const chosen = exerciseNames.find((item) => item.pl === name);
      onChange(chosen ? confirmIdentity(draft, chosen, "exact") : clearIdentityOnMeaningChange(keepCustomIdentity(draft), { name }));
    }} />
    {draft.assignment === "custom" && <details className="review-more"><summary>Ilustracja własnego ćwiczenia</summary>
      <label className="editor-field">Szukaj lokalnego pliku<input value={assetQuery} onChange={(event) => {
        const value = event.target.value;
        setAssetQuery(value);
        void fetch(`/api/exercise-assets?q=${encodeURIComponent(value)}`).then((response) => response.ok ? response.json() : { files: [] }).then((body) => setAssets(body.files ?? [])).catch(() => setAssets([]));
      }} /></label>
      <button type="button" className="review-link" onClick={() => onChange({ ...draft, assetFile: null })}>Bez ilustracji</button>
      <ul>{assets.map((file) => <li key={file}><button type="button" onClick={() => onChange({ ...draft, assetFile: file })}><img src={`/exercise-assets/${file}`} alt="" width={32} height={32} />{file}</button></li>)}</ul>
    </details>}
  </>;
}

export function meaningChange(draft: PlanEditorExercise, patch: Partial<Pick<PlanEditorExercise, "name" | "variant" | "equipment">>) {
  return clearIdentityOnMeaningChange(draft, patch);
}

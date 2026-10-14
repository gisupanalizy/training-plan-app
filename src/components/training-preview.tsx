"use client";

import { useState } from "react";
import type { DemoDay } from "@/lib/demo-plan";

export function TrainingPreview({ day }: { day: DemoDay }) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [repetitions, setRepetitions] = useState("");
  const [load, setLoad] = useState("");
  const exercise = day.exercises[exerciseIndex];
  const set = exercise.sets[setIndex];
  const totalSets = day.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const ordinal = day.exercises.slice(0, exerciseIndex).reduce((sum, item) => sum + item.sets.length, 0) + setIndex + 1;

  function select(exerciseNumber: number, setNumber: number) {
    setExerciseIndex(exerciseNumber);
    setSetIndex(setNumber);
    setRepetitions("");
    setLoad("");
  }

  function next() {
    if (setIndex + 1 < exercise.sets.length) select(exerciseIndex, setIndex + 1);
    else if (exerciseIndex + 1 < day.exercises.length) select(exerciseIndex + 1, 0);
  }

  function previous() {
    if (setIndex > 0) select(exerciseIndex, setIndex - 1);
    else if (exerciseIndex > 0) select(exerciseIndex - 1, day.exercises[exerciseIndex - 1].sets.length - 1);
  }

  return <div className="training-layout">
    <div className="training-primary">
      <div className="progress-heading"><span>PRZEGLĄD SERII</span><strong>{String(ordinal).padStart(2, "0")} / {String(totalSets).padStart(2, "0")}</strong></div>
      <div className="progress-track"><span style={{ width: `${(ordinal / totalSets) * 100}%` }} /></div>
      <section className="current-exercise"><div className="exercise-kicker"><span className="status-dot" /> ĆWICZENIE {String(exerciseIndex + 1).padStart(2, "0")} / {String(day.exercises.length).padStart(2, "0")}</div><h2>{exercise.name}</h2><p>{exercise.category} · seria {setIndex + 1} z {exercise.sets.length}</p></section>
      <section className="target-card"><div className="target-label">CEL Z PLANU</div><div className="target-values"><div><strong>{set.repetitions}</strong><small>powtórzeń / czas</small></div><div className="target-divider" /><div><strong>{set.load}</strong><small>obciążenie</small></div></div>{exercise.note && <p>{exercise.note}</p>}</section>
      <section className="form-preview"><div className="form-title"><div><div className="eyebrow">PODGLĄD FORMULARZA</div><h3>Twój wynik</h3></div><span className="outline-tag">NIEZAPISANY</span></div><div className="form-fields"><label>Powtórzenia / czas<input inputMode="decimal" type="text" value={repetitions} onChange={(event) => setRepetitions(event.target.value)} placeholder="Wpisz wynik" /></label><label>Obciążenie (kg)<input inputMode="decimal" type="text" value={load} onChange={(event) => setLoad(event.target.value)} placeholder="Wpisz ciężar" /></label></div><p>Możesz sprawdzić pola, ale prototyp nie zapisuje wyniku. Przejście do innej serii czyści wpisy.</p></section>
      <div className="step-actions"><button type="button" className="button button-outline" onClick={previous} disabled={ordinal === 1}>← Poprzednia</button><button type="button" className="button button-dark" onClick={next} disabled={ordinal === totalSets}>Następna seria →</button></div>
    </div>
    <aside className="training-side"><div className="eyebrow">W TYM TRENINGU</div><h3>Plan dnia</h3><div className="training-exercises">{day.exercises.map((item, index) => <button type="button" key={item.name} className={`training-exercise ${index === exerciseIndex ? "selected" : ""}`} onClick={() => select(index, 0)}><span>0{index + 1}</span><strong>{item.name}</strong><small>{item.sets.length} serie</small></button>)}</div><div className="previous-box"><span>POPRZEDNI WYNIK</span><strong>Brak danych</strong><p>Historia pojawi się po wdrożeniu zapisu treningów.</p></div></aside>
  </div>;
}

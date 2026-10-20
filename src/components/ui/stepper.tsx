"use client";
import { useId } from "react";
import styles from "./ui.module.css";

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function Stepper({ label, value, onValueChange, min, max, step = 1, hint, id, disabled, name }: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const numeric = value.trim() === "" ? null : Number(value);
  const finite = numeric !== null && Number.isFinite(numeric) ? numeric : null;
  const nextUp = finite === null ? null : round(finite + step);
  const nextDown = finite === null ? null : round(finite - step);
  const upDisabled = disabled || nextUp === null || (max !== undefined && nextUp > max);
  const downDisabled = disabled || nextDown === null || (min !== undefined && nextDown < min);
  return (
    <div className={styles.stepper}>
      <label htmlFor={inputId}>{label}</label>
      <div className={styles.stepperControl}>
        <button type="button" aria-label={`Zmniejsz ${label}`} disabled={downDisabled} onClick={() => { if (nextDown !== null) onValueChange(String(nextDown)); }}>−</button>
        <input id={inputId} name={name} disabled={disabled} inputMode="decimal" autoComplete="off" value={value} aria-describedby={hint ? `${inputId}-hint` : undefined} onChange={(event) => onValueChange(event.target.value)} />
        <button type="button" aria-label={`Zwiększ ${label}`} disabled={upDisabled} onClick={() => { if (nextUp !== null) onValueChange(String(nextUp)); }}>+</button>
      </div>
      {hint && <small id={`${inputId}-hint`}>{hint}</small>}
    </div>
  );
}

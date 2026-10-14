"use client";
import { useState } from 'react';
import type { PlannedSetInput } from '@/lib/domain/model';
const number = (value: string) => value.trim() === '' ? null : Number(value);

export function RangeField({ label, upperLabel, value, maximum, onChange, min = 0, step = '1' }: {
  label: string; upperLabel: string; value: number | null; maximum: number | null | undefined;
  onChange: (value: number | null, maximum: number | null) => void; min?: number; step?: string;
}) {
  const [expanded, setExpanded] = useState(maximum != null);
  return <div className="plan-range"><label className="editor-field">{label}<input type="number" min={min} step={step} value={value ?? ''}
    onChange={event => onChange(number(event.target.value), maximum ?? null)} /></label>
    {expanded && <label className="editor-field">{upperLabel}<input type="number" min={min} step={step} value={maximum ?? ''}
      onChange={event => onChange(value, number(event.target.value))} /></label>}
    <button type="button" className="review-link" aria-label={`${expanded ? 'Usuń' : 'Dodaj'} zakres: ${label}`} onClick={() => {
      if (expanded) onChange(value, null); setExpanded(!expanded);
    }}>{expanded ? 'Usuń zakres' : 'Dodaj zakres'}</button>
  </div>;
}

export function PlanSetFields({ value, onChange, equipment, individual }: {
  value: PlannedSetInput; onChange: (set: PlannedSetInput) => void; equipment: string | null; individual: boolean;
}) {
  const goals = [value.repsMin != null && 'reps', value.durationSeconds != null && 'duration', value.distanceMeters != null && 'distance'].filter(Boolean);
  const [goal, setGoal] = useState(value.isAmrap ? 'amrap' : goals.length > 1 ? 'mixed' : goals[0] || 'unknown');
  const set = (key: keyof PlannedSetInput, entry: unknown) => onChange({ ...value, [key]: entry });
  const range = (key: 'repsMin' | 'durationSeconds' | 'targetKg' | 'restSeconds', upper: 'repsMax' | 'durationSecondsMax' | 'targetKgMax' | 'restSecondsMax', label: string, upperLabel: string, step = '1') =>
    <RangeField key={key} label={label} upperLabel={upperLabel} value={value[key]} maximum={value[upper]} step={step}
      onChange={(lower, maximum) => onChange({ ...value, [key]: lower, [upper]: maximum })} />;
  const numeric = (key: 'targetPercent' | 'bodyweightDeltaKg' | 'distanceMeters' | 'targetRpe' | 'targetRir', label: string, min = 0, max?: number) =>
    <label className="editor-field">{label}<input type="number" min={min} max={max} step={key === 'targetRpe' || key === 'targetRir' ? '0.1' : '0.01'} value={value[key] ?? ''} onChange={event => set(key, number(event.target.value))} /></label>;
  return <>
    <label className="editor-field">Cel serii<select value={goal} onChange={event => {
      const next = event.target.value; setGoal(next);
      onChange({ ...value, isAmrap: next === 'amrap', repsMin: null, repsMax: null, durationSeconds: null, durationSecondsMax: null, distanceMeters: null });
    }}><option value="unknown">Nie podano</option><option value="reps">Powtórzenia</option><option value="amrap">AMRAP — maksymalna liczba powtórzeń</option><option value="duration">Czas</option><option value="distance">Dystans</option>{goal === 'mixed' && <option value="mixed">Cel złożony z planu</option>}</select></label>
    {(goal === 'reps' || goal === 'mixed' && value.repsMin != null) && range('repsMin', 'repsMax', 'Powtórzenia', 'Powtórzenia do')}
    {(goal === 'duration' || goal === 'mixed' && value.durationSeconds != null) && range('durationSeconds', 'durationSecondsMax', 'Czas (s)', 'Czas do (s)')}
    {(goal === 'distance' || goal === 'mixed' && value.distanceMeters != null) && numeric('distanceMeters', 'Dystans (m)')}
    {goal === 'amrap' && <p className="review-hint">Maksymalna liczba powtórzeń bez konkretnej liczby.</p>}
    <label className="editor-field">Obciążenie<select value={value.loadType} onChange={event => onChange({ ...value,
      loadType: event.target.value as PlannedSetInput['loadType'], targetKg: null, targetKgMax: null, targetPercent: null, bodyweightAdjustment: null, bodyweightDeltaKg: null,
    })}><option value="unspecified">Nie podano</option><option value="absolute">Kilogramy</option><option value="percent_1rm">% rzeczywistego 1RM</option><option value="bodyweight">Masa ciała</option></select></label>
    {value.loadType === 'absolute' && range('targetKg', 'targetKgMax', 'Ciężar (kg)', 'Ciężar do (kg)', '0.01')}
    {value.loadType === 'percent_1rm' && numeric('targetPercent', 'Procent 1RM', 0.01, 100)}
    {value.loadType === 'bodyweight' && <><label className="editor-field">Korekta masy ciała<select value={value.bodyweightAdjustment ?? 'none'}
      onChange={event => onChange({ ...value, bodyweightAdjustment: event.target.value as PlannedSetInput['bodyweightAdjustment'], bodyweightDeltaKg: null })}>
      <option value="none">Bez korekty</option><option value="additional">Dodatkowy ciężar</option><option value="assistance">Asysta</option></select></label>
      {value.bodyweightAdjustment && value.bodyweightAdjustment !== 'none' && numeric('bodyweightDeltaKg', 'Korekta (kg)', 0.01)}</>}
    {(value.dumbbellBasis != null || value.loadType === 'absolute' && /hant|dumbbell/i.test(equipment ?? '')) && <label className="editor-field">Podstawa ciężaru hantli<select value={value.dumbbellBasis ?? ''} onChange={event => set('dumbbellBasis', event.target.value || null)}>
      <option value="">Nieustalona / nie dotyczy</option><option value="per_hand">Na jedną rękę</option><option value="total">Łącznie</option></select></label>}
    {range('restSeconds', 'restSecondsMax', 'Przerwa (s)', 'Przerwa do (s)')}
    <details className="review-more"><summary>Parametry dodatkowe</summary><div className="editor-grid">
      <label className="editor-field">Rodzaj serii<select value={value.kind} onChange={event => set('kind', event.target.value)}><option value="work">Robocza</option><option value="warmup">Rozgrzewka</option><option value="ramp">Rampa</option><option value="backoff">Back-off</option><option value="drop">Drop</option></select></label>
      <label className="editor-field">Tempo<input value={value.tempo ?? ''} onChange={event => set('tempo', event.target.value || null)} /></label>
      {numeric('targetRpe', 'RPE', 0, 10)}{numeric('targetRir', 'RIR')}
    </div>{individual && <label className="editor-field">Uwagi do serii<textarea maxLength={2000} value={value.note ?? ''} onChange={event => set('note', event.target.value || null)} /></label>}</details>
  </>;
}

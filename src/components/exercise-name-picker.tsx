"use client";
import { useState } from "react";
import { englishExerciseReference, exerciseNames, normalizeAlias } from "@/lib/exercises/names";
export function ExerciseNamePicker({ original, onSelect }: { original: string; onSelect: (name: string) => void }) {
  const [query, setQuery] = useState("");
  const normalized = normalizeAlias(query);
  const verified = normalized.length > 1 ? exerciseNames.filter((item) => [item.pl, item.en, ...item.aliases].some((name) => normalizeAlias(name).includes(normalized))).slice(0, 8) : [];
  const english = normalized.length > 1 ? englishExerciseReference.entries.filter((item) => normalizeAlias(item.name).includes(normalized)).slice(0, Math.max(0, 8 - verified.length)) : [];
  return <details className="exercise-name-picker"><summary>Wyszukaj nazwę PL/EN</summary><p className="small-muted">Dobierz nazwę do sprzętu, chwytu i wariantu. Oryginalny zapis „{original}” pozostanie w planie.</p><label>Szukaj nazwy<input aria-label={`Szukaj nazwy dla: ${original}`} value={query} onChange={(event) => setQuery(event.target.value)} /></label><ul>{verified.map((item) => <li key={item.key}><button type="button" onClick={() => onSelect(item.pl)}>{item.pl} · {item.en}{item.variant ? ` · ${item.variant}` : ""}</button></li>)}{english.map((item) => <li key={item.id}><button type="button" onClick={() => onSelect(item.name)}>{item.name}{item.equipment ? ` · ${item.equipment}` : ""} · nazwa EN</button></li>)}</ul>{normalized.length > 1 && !verified.length && !english.length && <p>Brak pewnego odpowiednika. Zachowaj własną nazwę.</p>}</details>;
}

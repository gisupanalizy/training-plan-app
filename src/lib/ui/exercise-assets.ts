import { exerciseNames, normalizeAlias } from "@/lib/exercises/names";

// Wyłącznie sprawdzone dokładne warianty. Żadnych podpowiedzi ani dopasowań prefiksu.
const canonicalAssets: Readonly<Record<string, string>> = {
  "front-squat": "front-squat", "bench-press": "bench-press", "pull-up": "pull-up",
  "chin-up-weighted": "weighted-chin-up", "bar-dip": "dip", "weighted-dip": "weighted-dip",
  rdl: "romanian-deadlift", "pike-push-up": "pike-push-up", "hip-abduction": "hip-abduction-machine",
  "side-plank": "side-plank", "leg-press": "leg-press", "dumbbell-row": "one-arm-dumbbell-row", plank: "plank",
};
const exactAssets = new Map<string, string>();
for (const exercise of exerciseNames) {
  const slug = canonicalAssets[exercise.key];
  if (slug) for (const name of [exercise.pl, exercise.en, ...exercise.aliases]) exactAssets.set(normalizeAlias(name), slug);
}
for (const [name, slug] of Object.entries({ "przysiad ze sztangą": "squat", squat: "squat", "martwy ciąg": "deadlift", deadlift: "deadlift", "wyciskanie nad głowę": "overhead-press", "overhead press": "overhead-press", "handstand push up": "handstand-push-up", "wyciskanie leżąc": "bench-press", "wiosłowanie hantlą": "one-arm-dumbbell-row" })) exactAssets.set(normalizeAlias(name), slug);

export type ExerciseAssetContext = { variant?: string | null; equipment?: string | null };

export function resolveExerciseAsset(name: string, context: ExerciseAssetContext = {}): string | null {
  // Osobny opis może zmieniać ruch (skos, chwyt, asysta). Brak zatwierdzonego
  // mapowania takiej kombinacji oznacza neutralny znacznik, nigdy bazowy ruch.
  if (context.variant?.trim() || context.equipment?.trim()) return null;
  const slug = exactAssets.get(normalizeAlias(name));
  return slug ? `/exercise-assets/${slug}.svg` : null;
}

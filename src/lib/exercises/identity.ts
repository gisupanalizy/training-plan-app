import type { PlanEditorExercise } from "@/lib/domain/plan-editor";
import { exerciseNames, matchExerciseName, normalizeAlias, type ExerciseName } from "./names";

export type IdentityAssignment = NonNullable<PlanEditorExercise["assignment"]>;
export type IdentitySuggestion = NonNullable<PlanEditorExercise["suggestion"]>;

const compound = /\/|\blub\b|\balbo\b/i;

/** Pusty kontekst klienta nie przeczy katalogowi. Dopisany albo inny wariant/sprzęt przeczy. */
export function contextConflicts(entry: { variant?: string | null; equipment?: string | null }, variant?: string | null, equipment?: string | null) {
  const clientVariant = normalizeAlias(variant ?? "");
  const clientEquipment = normalizeAlias(equipment ?? "");
  const catalogVariant = normalizeAlias(entry.variant ?? "");
  const catalogEquipment = normalizeAlias(entry.equipment ?? "");
  if (clientVariant && (!catalogVariant || clientVariant !== catalogVariant)) return true;
  if (clientEquipment && (!catalogEquipment || clientEquipment !== catalogEquipment)) return true;
  return false;
}

export function exactCatalogMatch(name: string, variant?: string | null, equipment?: string | null): ExerciseName | null {
  const match = matchExerciseName(name);
  if (!match || contextConflicts(match, variant, equipment)) return null;
  return match;
}

export function decisionCandidates(name: string, variant?: string | null, equipment?: string | null): ExerciseName[] {
  if (compound.test(name) || exactCatalogMatch(name, variant, equipment)) return [];
  const tokens = normalizeAlias(name).split(" ").filter((token) => token.length > 3);
  if (!tokens.length) return [];
  return exerciseNames.filter((item) => {
    if (contextConflicts(item, variant, equipment)) return false;
    const haystack = normalizeAlias([item.pl, item.en, ...item.aliases, item.variant ?? "", item.equipment ?? ""].join(" "));
    return tokens.some((token) => haystack.includes(token));
  }).slice(0, 8);
}

export function toSuggestion(entry: ExerciseName): IdentitySuggestion {
  return { key: entry.key, pl: entry.pl, variant: entry.variant ?? null, equipment: entry.equipment ?? null };
}

export function applyExactIdentity(exercise: PlanEditorExercise): PlanEditorExercise {
  if (exercise.assignment === "custom" || exercise.assignment === "confirmed_decision" || exercise.assignment === "private_alias" || exercise.assignment === "unresolved") return exercise;
  const source = exercise.originalName ?? exercise.name;
  const match = exactCatalogMatch(source, exercise.variant, exercise.equipment) ?? exactCatalogMatch(exercise.name, exercise.variant, exercise.equipment);
  if (!match) return exercise;
  return {
    ...exercise,
    originalName: exercise.originalName ?? (exercise.name === match.pl ? null : exercise.name),
    name: match.pl,
    canonicalKey: match.key,
    assignment: "exact",
    suggestion: null,
    variant: exercise.variant ?? match.variant ?? null,
    equipment: exercise.equipment ?? match.equipment ?? null,
  };
}

export function confirmIdentity(exercise: PlanEditorExercise, entry: ExerciseName, source: "confirmed_decision" | "private_alias" | "exact" = "confirmed_decision"): PlanEditorExercise {
  const original = exercise.originalName ?? exercise.name;
  return {
    ...exercise,
    originalName: original === entry.pl ? exercise.originalName ?? null : original,
    name: entry.pl,
    canonicalKey: entry.key,
    identityId: null,
    assignment: source,
    suggestion: null,
    recordAlias: source !== "exact" && normalizeAlias(original) !== normalizeAlias(entry.pl),
    variant: exercise.variant ?? entry.variant ?? null,
    equipment: exercise.equipment ?? entry.equipment ?? null,
  };
}

export function keepCustomIdentity(exercise: PlanEditorExercise): PlanEditorExercise {
  return { ...exercise, canonicalKey: null, identityId: null, assignment: "custom", suggestion: null, recordAlias: false };
}

export function clearIdentityOnMeaningChange(exercise: PlanEditorExercise, patch: Partial<Pick<PlanEditorExercise, "name" | "variant" | "equipment">>): PlanEditorExercise {
  const next = { ...exercise, ...patch };
  const changed = (["name", "variant", "equipment"] as const).some((key) => patch[key] !== undefined && patch[key] !== exercise[key]);
  if (!changed) return next;
  return applyExactIdentity({ ...next, canonicalKey: null, identityId: null, assignment: null, suggestion: null, recordAlias: false, assetFile: exercise.assetFile });
}

export function identityProposalOpen(exercise: PlanEditorExercise) {
  return exercise.assignment === "unresolved" && Boolean(exercise.suggestion?.key);
}

export function openIdentityProposals(exercises: PlanEditorExercise[]) {
  return exercises.filter(identityProposalOpen);
}

export function applySuggestionResult(exercise: PlanEditorExercise, result: { source: "exact" | "private_alias" | "decision"; key: string } | null): PlanEditorExercise {
  if (!result || exercise.assignment === "custom" || exercise.assignment === "confirmed_decision") return exercise;
  const entry = exerciseNames.find((item) => item.key === result.key);
  if (!entry || contextConflicts(entry, exercise.variant, exercise.equipment)) return result.source === "decision" ? { ...exercise, assignment: null, suggestion: null } : exercise;
  if (result.source === "decision") return { ...exercise, assignment: "unresolved", suggestion: toSuggestion(entry), canonicalKey: null };
  return confirmIdentity(exercise, entry, result.source === "private_alias" ? "private_alias" : "exact");
}

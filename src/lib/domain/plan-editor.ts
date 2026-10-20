import { parsePlannedSet, type PlannedSetInput } from "./model";

export interface PlanEditorExercise {
  reviewId?: string;
  isOptional?: boolean;
  originalName?: string | null;
  sourceRef?: string | null;
  setCountMin?: number | null;
  setCountMax?: number | null;
  setCountSource?: string | null;
  prescriptionGroup?: string | null;
  exerciseId: string | null;
  /** Prywatna tożsamość właściciela. Serwer sprawdza własność i nie ufa samemu identyfikatorowi. */
  identityId?: string | null;
  /** Klucz sprawdzonego katalogu. Serwer odrzuca nieznany klucz i sprzeczny wariant albo sprzęt. */
  canonicalKey?: string | null;
  assetFile?: string | null;
  assignment?: "exact" | "private_alias" | "confirmed_decision" | "custom" | "unresolved" | null;
  recordAlias?: boolean;
  suggestion?: { key: string; pl: string; variant: string | null; equipment: string | null } | null;
  name: string;
  variant: string | null;
  equipment: string | null;
  supersetGroup: string | null;
  note: string | null;
  sets: PlannedSetInput[];
}
export interface PlanEditorSession {
  reviewId?: string;
  weekNumber: number;
  dayLabel: string;
  note: string | null;
  exercises: PlanEditorExercise[];
}
export interface PlanEditorDocument {
  schemaVersion?: 2;
  name: string;
  sessions: PlanEditorSession[];
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const canonicalKeyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const assetFilePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(png|svg)$/;
const assignments = new Set(["exact", "private_alias", "confirmed_decision", "custom", "unresolved"]);
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const optionalText = (value: unknown, max: number) => value === null || (typeof value === "string" && value.trim().length > 0 && value.length <= max);
const requiredText = (value: unknown, max: number) => typeof value === "string" && value.trim().length > 0 && value.length <= max;

export function parsePlanEditorDocument(value: unknown): PlanEditorDocument {
  if (!record(value) || !requiredText(value.name, 120) || !Array.isArray(value.sessions) || value.sessions.length < 1 || value.sessions.length > 52) throw new Error("Podaj nazwę planu i co najmniej jeden dzień.");
  if (value.schemaVersion !== undefined && value.schemaVersion !== 2) throw new Error("Nieobsługiwana wersja dokumentu planu.");
  let count = 0;
  const ids = new Set<string>();
  const checkId = (id: unknown) => { if (id === undefined) return; if (typeof id !== "string" || !id.trim() || id.length > 100 || ids.has(id)) throw new Error("Niepoprawny lub powtórzony identyfikator korekty."); ids.add(id); };
  for (const session of value.sessions) {
    if (!record(session) || !Number.isSafeInteger(session.weekNumber) || (session.weekNumber as number) < 1 || (session.weekNumber as number) > 52 ||
      !requiredText(session.dayLabel, 80) || !optionalText(session.note, 2000) || !Array.isArray(session.exercises) || session.exercises.length < 1 || session.exercises.length > 50) throw new Error("Każdy dzień wymaga nazwy i ćwiczenia.");
    checkId(session.reviewId);
    for (const exercise of session.exercises) {
      if (!record(exercise) || !(exercise.exerciseId === null || (typeof exercise.exerciseId === "string" && uuid.test(exercise.exerciseId))) ||
        !requiredText(exercise.name, 120) || !optionalText(exercise.variant, 120) || !optionalText(exercise.equipment, 120) ||
        !optionalText(exercise.supersetGroup, 80) || !optionalText(exercise.note, 2000) ||
        !Array.isArray(exercise.sets) || exercise.sets.length < 1 || exercise.sets.length > 30) throw new Error("Każde ćwiczenie wymaga nazwy i serii.");
      checkId(exercise.reviewId);
      if (exercise.identityId !== undefined && exercise.identityId !== null && (typeof exercise.identityId !== "string" || !uuid.test(exercise.identityId))) throw new Error("Niepoprawna tożsamość ćwiczenia.");
      if (exercise.canonicalKey !== undefined && exercise.canonicalKey !== null && (typeof exercise.canonicalKey !== "string" || !canonicalKeyPattern.test(exercise.canonicalKey))) throw new Error("Niepoprawny klucz ćwiczenia.");
      if (exercise.assetFile !== undefined && exercise.assetFile !== null && (typeof exercise.assetFile !== "string" || !assetFilePattern.test(exercise.assetFile))) throw new Error("Niepoprawna ilustracja ćwiczenia.");
      if (exercise.assignment !== undefined && exercise.assignment !== null && (typeof exercise.assignment !== "string" || !assignments.has(exercise.assignment))) throw new Error("Niepoprawny status przypisania ćwiczenia.");
      if (exercise.recordAlias !== undefined && typeof exercise.recordAlias !== "boolean") throw new Error("Niepoprawny alias ćwiczenia.");
      if (exercise.suggestion !== undefined && exercise.suggestion !== null) {
        if (!record(exercise.suggestion) || typeof exercise.suggestion.key !== "string" || !canonicalKeyPattern.test(exercise.suggestion.key) || !requiredText(exercise.suggestion.pl, 120)) throw new Error("Niepoprawna propozycja ćwiczenia.");
      }
      for (const key of ["originalName", "sourceRef", "setCountSource", "prescriptionGroup"]) if (exercise[key] !== undefined && exercise[key] !== null && !requiredText(exercise[key], key === "originalName" ? 120 : 500)) throw new Error("Niepoprawne informacje ze źródła.");
      if (exercise.setCountMin != null || exercise.setCountMax != null) {
        if (!Number.isInteger(exercise.setCountMin) || !Number.isInteger(exercise.setCountMax) || (exercise.setCountMin as number) < 1 ||
          (exercise.setCountMax as number) < (exercise.setCountMin as number) || exercise.setCountMax !== exercise.sets.length) throw new Error("Zakres liczby serii musi odpowiadać seriom w planie.");
      }
      exercise.sets.forEach((set: unknown, index: number) => {
        const parsed = parsePlannedSet(set);
        checkId(parsed.reviewId);
        if (parsed.position !== index + 1) throw new Error("Niepoprawna kolejność serii.");
        if (exercise.isOptional !== undefined && typeof exercise.isOptional !== "boolean") throw new Error("Niepoprawne ćwiczenie opcjonalne.");
      });
      if (exercise.setCountMin != null && exercise.sets.filter((set: unknown) => !(set as PlannedSetInput).isOptional).length !== (exercise.isOptional ? 0 : exercise.setCountMin)) throw new Error("Niepoprawna liczba wymaganych serii.");
      count += exercise.sets.length;
    }
  }
  if (count > 1000) throw new Error("Plan ma zbyt wiele serii.");
  return value as unknown as PlanEditorDocument;
}

/** Identyfikatory korekty są niezależne od kolejności i nie są identyfikatorami rekordów DB. */
export function withReviewIds(value: PlanEditorDocument): PlanEditorDocument {
  const document = structuredClone(value);
  document.sessions.forEach((session, si) => {
    session.reviewId ??= `session:${si}`;
    session.exercises.forEach((exercise, ei) => {
      exercise.reviewId ??= `exercise:${si}:${ei}`;
      exercise.sets.forEach((set, index) => { set.reviewId ??= `set:${si}:${ei}:${index}`; });
    });
  });
  return document;
}

export function resizeSets(exercise: PlanEditorExercise, minimum: number, maximum = minimum) {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 1 || maximum < minimum || maximum > 30) return;
  const template = exercise.sets[0] ?? emptySet(1);
  exercise.sets = Array.from({ length: maximum }, (_, index) => ({
    ...(exercise.sets[index] ?? template), position: index + 1,
    reviewId: exercise.sets[index]?.reviewId ?? `${exercise.reviewId ?? "new"}:set:${index}`,
    isOptional: !!exercise.isOptional || index >= minimum,
  }));
  exercise.setCountMin = minimum; exercise.setCountMax = maximum;
}

export function emptySet(position: number): PlannedSetInput {
  return { position, kind: "work", repsMin: null, repsMax: null, isAmrap: false,
    loadType: "unspecified", targetKg: null, targetPercent: null, bodyweightAdjustment: null,
    bodyweightDeltaKg: null, dumbbellBasis: null, durationSeconds: null, distanceMeters: null,
    restSeconds: null, tempo: null, targetRpe: null, targetRir: null, note: null };
}

export function emptyDocument(): PlanEditorDocument {
  return { name: "", sessions: ["A", "B"].map((dayLabel) => ({ weekNumber: 1, dayLabel, note: null,
    exercises: [{ exerciseId: null, name: "", variant: null, equipment: null, supersetGroup: null, note: null, sets: [emptySet(1)] }] })) };
}

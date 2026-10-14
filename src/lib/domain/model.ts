/** Kontrakty domenowe T02. Pola null oznaczają brak danych, nigdy zero. */
export type LoadType = "absolute" | "percent_1rm" | "bodyweight" | "unspecified";
export type SetKind = "warmup" | "ramp" | "work" | "backoff" | "drop";
export type SetStatus = "pending" | "completed" | "skipped";
export type PlanVersionState = "draft" | "published";

export interface Plan {
  id: string;
  ownerId: string;
  name: string;
  status: "draft" | "active" | "archived";
  currentVersionId: string | null;
}
export interface PlanVersion {
  id: string;
  ownerId: string;
  planId: string;
  versionNumber: number;
  state: PlanVersionState;
  publishedAt: string | null;
}
export interface PlanSession {
  id: string;
  planVersionId: string;
  weekNumber: number;
  dayLabel: string;
  position: number;
}
export interface PlannedExercise {
  id: string;
  planSessionId: string;
  exerciseId: string;
  originalName: string;
  position: number;
  supersetGroup: string | null;
}
export interface WorkoutSession {
  id: string;
  ownerId: string;
  planVersionId: string | null;
  planSessionId: string | null;
  performedOn: string;
  status: "in_progress" | "completed" | "abandoned";
  revision: number;
}
export interface PerformedExercise {
  id: string;
  workoutSessionId: string;
  plannedExerciseId: string | null;
  exerciseId: string;
  sourceKind: "planned" | "extra";
  targetNameSnapshot: string;
  supersetGroupSnapshot: string | null;
}
export interface MutationReceipt {
  clientOperationId: string;
  payloadHash: string;
  commandKind: string;
  workoutSessionId: string | null;
  resultingRevision: number | null;
}

export interface PlanInput {
  name: string;
  status: Plan["status"];
  currentVersionId: string | null;
}
export interface PlanVersionInput {
  planId: string;
  versionNumber: number;
  state: PlanVersionState;
  publishedAt: string | null;
}
export interface OneRepMaxInput {
  exerciseId: string;
  valueKg: number;
  effectiveOn: string;
  note: string | null;
}

export interface PlannedSetInput {
  reviewId?: string;
  sourceRef?: string | null;
  isOptional?: boolean;
  targetKgMax?: number | null;
  durationSecondsMax?: number | null;
  restSecondsMax?: number | null;
  position: number;
  kind: SetKind;
  repsMin: number | null;
  repsMax: number | null;
  isAmrap: boolean;
  loadType: LoadType;
  targetKg: number | null;
  targetPercent: number | null;
  bodyweightAdjustment: "none" | "additional" | "assistance" | null;
  bodyweightDeltaKg: number | null;
  dumbbellBasis: "per_hand" | "total" | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  restSeconds: number | null;
  tempo: string | null;
  targetRpe: number | null;
  targetRir: number | null;
  note: string | null;
}

export interface OneRepMaxRecord {
  id: string;
  exerciseId: string;
  valueKg: number;
  effectiveOn: string;
  createdAt: string;
}

export interface SessionTargetSnapshot {
  isOptional?: boolean;
  targetKgMax?: number | null;
  durationSecondsMax?: number | null;
  restSecondsMax?: number | null;
  plannedSetId: string | null;
  kind: SetKind | null;
  repsMin: number | null;
  repsMax: number | null;
  isAmrap: boolean | null;
  loadType: LoadType | null;
  targetKg: number | null;
  targetPercent: number | null;
  bodyweightAdjustment: "none" | "additional" | "assistance" | null;
  bodyweightDeltaKg: number | null;
  dumbbellBasis: "per_hand" | "total" | null;
  oneRepMaxRecordId: string | null;
  oneRepMaxKg: number | null;
  rawTargetKg: number | null;
  roundedTargetKg: number | null;
  roundingIncrementKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  restSeconds: number | null;
  tempo: string | null;
  targetRpe: number | null;
  targetRir: number | null;
  note: string | null;
}

export interface PerformedSetInput {
  sourceKind: "planned" | "extra";
  status: SetStatus;
  actualReps: number | null;
  actualKg: number | null;
  actualDurationSeconds: number | null;
  actualDistanceMeters: number | null;
  actualRpe: number | null;
  actualRir: number | null;
  actualNote: string | null;
}

export interface MutationCommand<T> {
  clientOperationId: string;
  expectedRevision: number;
  payload: T;
}

export type MutationCheck = "new" | "retry" | "conflict";

export function checkMutationReceipt(
  existing: { payloadHash: string } | null,
  payloadHash: string,
): MutationCheck {
  if (existing === null) return "new";
  return existing.payloadHash === payloadHash ? "retry" : "conflict";
}

export function checkRevision(currentRevision: number, expectedRevision: number): boolean {
  return Number.isSafeInteger(currentRevision) && currentRevision >= 0 && currentRevision === expectedRevision;
}

export function selectApplicableOneRepMax(
  records: readonly OneRepMaxRecord[],
  exerciseId: string,
  performedOn: string,
): OneRepMaxRecord | null {
  if (!isIsoDate(performedOn)) throw new Error("Niepoprawna data treningu");
  return records
    .filter((record) => record.exerciseId === exerciseId && isIsoDate(record.effectiveOn) && record.effectiveOn <= performedOn)
    .sort((a, b) => b.effectiveOn.localeCompare(a.effectiveOn) || b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function calculatePercentTarget(
  percent: number,
  maximum: OneRepMaxRecord | null,
  roundingIncrementKg: number,
): Pick<SessionTargetSnapshot, "oneRepMaxRecordId" | "oneRepMaxKg" | "rawTargetKg" | "roundedTargetKg" | "roundingIncrementKg"> {
  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) throw new Error("Niepoprawny procent 1RM");
  if (!Number.isFinite(roundingIncrementKg) || roundingIncrementKg <= 0) throw new Error("Niepoprawny krok zaokrąglenia");
  if (maximum === null) return { oneRepMaxRecordId: null, oneRepMaxKg: null, rawTargetKg: null, roundedTargetKg: null, roundingIncrementKg: null };
  if (!Number.isFinite(maximum.valueKg) || maximum.valueKg <= 0) throw new Error("Niepoprawne 1RM");
  const maximumCents = Math.round(maximum.valueKg * 100);
  const percentHundredths = Math.round(percent * 100);
  const incrementCents = Math.round(roundingIncrementKg * 100);
  if (Math.abs(maximum.valueKg * 100 - maximumCents) > 1e-7 ||
      Math.abs(percent * 100 - percentHundredths) > 1e-7 ||
      Math.abs(roundingIncrementKg * 100 - incrementCents) > 1e-7 || incrementCents === 0) {
    throw new Error("Wartości muszą mieć najwyżej dwa miejsca po przecinku");
  }
  // Ten sam zakres precyzji co numeric(10,4) w kopii celu SQL.
  const rawFourDecimalUnits = Math.round(maximumCents * percentHundredths / 100);
  const stepFourDecimalUnits = incrementCents * 100;
  const lower = Math.floor(rawFourDecimalUnits / stepFourDecimalUnits);
  const remainder = rawFourDecimalUnits - lower * stepFourDecimalUnits;
  const rawTargetKg = rawFourDecimalUnits / 10_000;
  const roundedTargetKg = (lower + (2 * remainder > stepFourDecimalUnits ? 1 : 0)) * incrementCents / 100;
  return { oneRepMaxRecordId: maximum.id, oneRepMaxKg: maximum.valueKg, rawTargetKg, roundedTargetKg, roundingIncrementKg };
}

export function createSessionTargetSnapshot(
  plannedSetId: string,
  exerciseId: string,
  set: PlannedSetInput,
  maximum: OneRepMaxRecord | null,
  roundingIncrementKg: number,
): SessionTargetSnapshot {
  if (maximum !== null && maximum.exerciseId !== exerciseId) throw new Error("1RM dotyczy innego ćwiczenia");
  const resolved = set.loadType === "percent_1rm"
    ? calculatePercentTarget(set.targetPercent!, maximum, roundingIncrementKg)
    : { oneRepMaxRecordId: null, oneRepMaxKg: null, rawTargetKg: null, roundedTargetKg: null, roundingIncrementKg: null };
  return {
    plannedSetId, isOptional: set.isOptional ?? false, targetKgMax: set.targetKgMax ?? null, durationSecondsMax: set.durationSecondsMax ?? null, restSecondsMax: set.restSecondsMax ?? null, kind: set.kind, repsMin: set.repsMin, repsMax: set.repsMax,
    isAmrap: set.isAmrap, loadType: set.loadType, targetKg: set.targetKg,
    targetPercent: set.targetPercent, bodyweightAdjustment: set.bodyweightAdjustment,
    bodyweightDeltaKg: set.bodyweightDeltaKg, dumbbellBasis: set.dumbbellBasis,
    ...resolved, durationSeconds: set.durationSeconds, distanceMeters: set.distanceMeters,
    restSeconds: set.restSeconds, tempo: set.tempo, targetRpe: set.targetRpe,
    targetRir: set.targetRir, note: set.note,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isNumberOrNull(value: unknown, min: number, max = Infinity, integer = false): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isSafeInteger(value)));
}
function hasPrecision(value: unknown, places: number): boolean {
  if (value === null) return true;
  if (typeof value !== "number" || !Number.isFinite(value)) return false;
  const scale = 10 ** places;
  return Math.abs(value * scale - Math.round(value * scale)) < 1e-7;
}
function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
const kinds: readonly string[] = ["warmup", "ramp", "work", "backoff", "drop"];
const loads: readonly string[] = ["absolute", "percent_1rm", "bodyweight", "unspecified"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parsePlan(value: unknown): PlanInput {
  if (!isRecord(value) || typeof value.name !== "string" || value.name.trim() === "" ||
      !["draft", "active", "archived"].includes(value.status as string) ||
      !(value.currentVersionId === null || (typeof value.currentVersionId === "string" && uuidPattern.test(value.currentVersionId))) ||
      (value.status === "active" && value.currentVersionId === null)) throw new Error("Niepoprawny plan");
  return value as unknown as PlanInput;
}

export function parsePlanVersion(value: unknown): PlanVersionInput {
  if (!isRecord(value) || typeof value.planId !== "string" || !uuidPattern.test(value.planId) ||
      !Number.isSafeInteger(value.versionNumber) || (value.versionNumber as number) <= 0 ||
      !["draft", "published"].includes(value.state as string) ||
      !(value.publishedAt === null || (typeof value.publishedAt === "string" && !Number.isNaN(Date.parse(value.publishedAt)))) ||
      (value.state === "draft" && value.publishedAt !== null) ||
      (value.state === "published" && value.publishedAt === null)) throw new Error("Niepoprawna wersja planu");
  return value as unknown as PlanVersionInput;
}

export function parseOneRepMax(value: unknown): OneRepMaxInput {
  if (!isRecord(value) || typeof value.exerciseId !== "string" || !uuidPattern.test(value.exerciseId) ||
      typeof value.valueKg !== "number" || !Number.isFinite(value.valueKg) || value.valueKg <= 0 ||
      !hasPrecision(value.valueKg, 2) ||
      !isIsoDate(value.effectiveOn as string) ||
      !(value.note === null || typeof value.note === "string")) throw new Error("Niepoprawne 1RM");
  return value as unknown as OneRepMaxInput;
}

export function parsePlannedSet(value: unknown): PlannedSetInput {
  if (!isRecord(value) || !Number.isSafeInteger(value.position) || (value.position as number) <= 0 ||
      !kinds.includes(value.kind as string) || !loads.includes(value.loadType as string) ||
      typeof value.isAmrap !== "boolean" ||
      !isNumberOrNull(value.repsMin, 0, Infinity, true) || !isNumberOrNull(value.repsMax, 0, Infinity, true) ||
      !isNumberOrNull(value.targetKg, 0) || !isNumberOrNull(value.targetPercent, 0.01, 100) ||
      !(value.bodyweightAdjustment === null || ["none", "additional", "assistance"].includes(value.bodyweightAdjustment as string)) ||
      !isNumberOrNull(value.bodyweightDeltaKg, 0.01) ||
      !(value.dumbbellBasis === null || ["per_hand", "total"].includes(value.dumbbellBasis as string)) ||
      !isNumberOrNull(value.durationSeconds, 0, Infinity, true) || !isNumberOrNull(value.distanceMeters, 0) ||
      !isNumberOrNull(value.restSeconds, 0, Infinity, true) ||
      ![value.targetKg, value.targetPercent, value.bodyweightDeltaKg, value.distanceMeters].every((x) => hasPrecision(x, 2)) ||
      ![value.targetRpe, value.targetRir].every((x) => hasPrecision(x, 1)) ||
      !(value.tempo === null || typeof value.tempo === "string") ||
      !isNumberOrNull(value.targetRpe, 0, 10) || !isNumberOrNull(value.targetRir, 0) ||
      !(value.note === null || typeof value.note === "string")) throw new Error("Niepoprawna seria planu");
  if (value.repsMax !== null && (value.repsMin === null || (value.repsMax as number) < (value.repsMin as number))) throw new Error("Niepoprawny zakres powtórzeń");
  for (const [minimum, maximum] of [["targetKg", "targetKgMax"], ["durationSeconds", "durationSecondsMax"], ["restSeconds", "restSecondsMax"]]) {
    const upper = value[maximum];
    if (upper !== undefined && upper !== null && (!isNumberOrNull(upper, 0, 10000, minimum !== "targetKg") ||
      !hasPrecision(upper, 2) || value[minimum] === null || typeof value[minimum] !== "number" || (upper as number) < (value[minimum] as number))) throw new Error("Niepoprawny zakres celu serii");
  }
  if (value.isOptional !== undefined && typeof value.isOptional !== "boolean") throw new Error("Niepoprawna seria opcjonalna");
  if (value.reviewId !== undefined && (typeof value.reviewId !== "string" || value.reviewId.length > 100 || !value.reviewId.trim())) throw new Error("Niepoprawny identyfikator korekty");
  if (value.sourceRef !== undefined && value.sourceRef !== null && (typeof value.sourceRef !== "string" || value.sourceRef.length > 500)) throw new Error("Niepoprawne źródło serii");
  if (value.isAmrap && (value.repsMin !== null || value.repsMax !== null || value.durationSeconds !== null || value.distanceMeters !== null)) throw new Error("Maksimum powtórzeń nie może mieć liczbowego celu");
  if (value.loadType === "absolute" && (value.targetKg === null || value.targetPercent !== null)) throw new Error("Konflikt obciążenia");
  if (value.loadType === "percent_1rm" && (value.targetKg !== null || value.targetPercent === null)) throw new Error("Konflikt obciążenia");
  if ((value.loadType === "bodyweight" || value.loadType === "unspecified") && (value.targetKg !== null || value.targetPercent !== null)) throw new Error("Konflikt obciążenia");
  if (value.loadType === "bodyweight") {
    if (["additional", "assistance"].includes(value.bodyweightAdjustment as string) !== (value.bodyweightDeltaKg !== null) ||
        (value.bodyweightAdjustment === "none" && value.bodyweightDeltaKg !== null)) throw new Error("Niepoprawna asysta lub ciężar dodatkowy");
  } else if (value.bodyweightAdjustment !== null || value.bodyweightDeltaKg !== null) throw new Error("Niepoprawne obciążenie masą ciała");
  return value as unknown as PlannedSetInput;
}

export function parsePerformedSet(value: unknown): PerformedSetInput {
  if (!isRecord(value) || !["planned", "extra"].includes(value.sourceKind as string) ||
      !["pending", "completed", "skipped"].includes(value.status as string) ||
      !isNumberOrNull(value.actualReps, 0, Infinity, true) || !isNumberOrNull(value.actualKg, 0) ||
      !isNumberOrNull(value.actualDurationSeconds, 0, Infinity, true) || !isNumberOrNull(value.actualDistanceMeters, 0) ||
      !isNumberOrNull(value.actualRpe, 0, 10) || !isNumberOrNull(value.actualRir, 0) ||
      ![value.actualKg, value.actualDistanceMeters].every((x) => hasPrecision(x, 2)) ||
      ![value.actualRpe, value.actualRir].every((x) => hasPrecision(x, 1)) ||
      !(value.actualNote === null || typeof value.actualNote === "string")) throw new Error("Niepoprawny wynik serii");
  const resultCount = [value.actualReps, value.actualKg, value.actualDurationSeconds, value.actualDistanceMeters].filter((x) => x !== null).length;
  if (value.status === "completed" && resultCount === 0) throw new Error("Brak wyniku wykonanej serii");
  if (value.status === "skipped" && resultCount > 0) throw new Error("Pominięta seria ma wynik");
  return value as unknown as PerformedSetInput;
}

export function parseMutationCommand<T>(value: unknown): MutationCommand<T> {
  if (!isRecord(value) || typeof value.clientOperationId !== "string" ||
      !uuidPattern.test(value.clientOperationId) ||
      !Number.isSafeInteger(value.expectedRevision) || (value.expectedRevision as number) < 0 ||
      !("payload" in value)) throw new Error("Niepoprawna komenda");
  return value as unknown as MutationCommand<T>;
}

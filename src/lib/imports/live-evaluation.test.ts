// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { validateDraft } from "./domain";
import { MODEL, PROMPT_VERSION, openaiImport } from "./openai";

const live = process.env.RUN_T06_LIVE === "true";
type Expected = Record<string, string | number | boolean | null | number[]>;
type Case = { id: string; format: string; expected: Expected };
type Difference = { field: string; expected: Expected[string]; actual: unknown; kind: "omission" | "addition" | "mismatch" };
type Row = { id: string; format: string; latencyMs: number; correct: number; total: number; differences: Difference[];
  issueCount: number | null; inputTokens: number | null; outputTokens: number | null; estimatedCostUsd: number | null;
  error: string | null; errorDiagnostics: unknown };
const all = JSON.parse(readFileSync(resolve(process.cwd(), "fixtures/t06/cases.json"), "utf8")) as Case[];
const extension = (format: string) => format === "text" ? "txt" : format.startsWith("pdf") ? "pdf" : format === "png" ? "png" : "jpg";
const kind = (format: string) => format === "text" ? "text" as const : format.startsWith("pdf") ? "pdf" as const : "image" as const;
const mime = (format: string) => format === "text" ? "text/plain" : format.startsWith("pdf") ? "application/pdf" : format === "png" ? "image/png" : "image/jpeg";
const percentile = (values: number[], p: number) => values.length ? [...values].sort((a,b) => a-b)[Math.ceil(values.length*p)-1] : null;
const normalized = (value: unknown) => typeof value === "string"
  ? value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").replace(/Ł/g, "L").trim().toLowerCase()
  : value;
const equal = (left: unknown, right: unknown) => JSON.stringify(Array.isArray(left) ? left : normalized(left)) ===
  JSON.stringify(Array.isArray(right) ? right : normalized(right));
const missing = (value: unknown) => value === null || value === undefined || value === "unspecified";
const score = (expected: Expected, actual: Record<string, unknown>) => {
  const differences: Difference[] = [];
  for (const [field, wanted] of Object.entries(expected)) {
    if (field === "injection") continue;
    const found = actual[field];
    if (equal(wanted, found)) continue;
    const kind = missing(wanted) && !missing(found) ? "addition" : !missing(wanted) && missing(found) ? "omission" : "mismatch";
    differences.push({ field, expected: wanted, actual: found ?? null, kind });
  }
  const total = Object.keys(expected).filter((field) => field !== "injection").length;
  return { correct: total - differences.length, total, differences };
};
const draftShape = (draft: unknown) => {
  if (!draft || typeof draft !== "object") return { rootType: typeof draft };
  const value = draft as Record<string, unknown>;
  return { schemaVersion: value.schema_version, nameType: typeof value.name, nameLength: typeof value.name === "string" ? value.name.trim().length : null,
    warningsArray: Array.isArray(value.warnings), unresolvedFields: Array.isArray(value.unresolved_fields)
      ? value.unresolved_fields.map((field) => field && typeof field === "object" ? {
        pathType: typeof field.path, pathLength: typeof field.path === "string" ? field.path.trim().length : null,
        reasonType: typeof field.reason, reasonLength: typeof field.reason === "string" ? field.reason.trim().length : null,
      } : { type: typeof field }) : "not_array",
    sessions: Array.isArray(value.sessions) ? value.sessions.map((session) => {
    if (!session || typeof session !== "object") return { type: typeof session };
    const item = session as Record<string, unknown>;
    const exercises = Array.isArray(item.exercises) ? item.exercises : [];
    return { weekNumber: item.week_number, dayLabelType: typeof item.day_label,
      noteType: item.note === null ? "null" : typeof item.note, exercisesArray: Array.isArray(item.exercises),
      sets: exercises.flatMap((exercise) => exercise && typeof exercise === "object" && Array.isArray(exercise.sets)
        ? exercise.sets.map((set: Record<string, unknown>) => ({ repsMin: set.reps_min, repsMax: set.reps_max,
          loadType: set.load_type, targetKg: set.target_kg, targetPercent: set.target_percent })) : []) };
  }) : "not_array" };
};
describe.skipIf(!live)("T06: prawdziwe próby OpenAI (wymagają osobnej zgody na budżet)", () => {
  it("mierzy jakość, czas i użycie na syntetycznych źródłach", async () => {
    const limit = Number(process.env.T06_LIVE_CASE_LIMIT ?? 12);
    const requestedIds = process.env.T06_LIVE_CASE_IDS?.split(",").filter(Boolean);
    const selected = requestedIds ? all.filter((item) => requestedIds.includes(item.id)) : all.slice(0, limit);
    const budget = Number(process.env.OPENAI_IMPORT_BUDGET_USD);
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_IMPORT_ENABLED !== "true" || !Number.isInteger(limit) || limit < 1 || limit > 12 || selected.length < 1 ||
      (requestedIds && (selected.length !== requestedIds.length || new Set(requestedIds).size !== requestedIds.length)) ||
      !Number.isFinite(budget) || budget < selected.length * 0.05) {
      throw new Error("Brak jawnie włączonego klucza i budżetu co najmniej 0,05 USD na każdą próbę.");
    }
    const rows: Row[] = [];
    for (const item of selected) {
      const bytes = new Uint8Array(readFileSync(resolve(process.cwd(), "fixtures/t06/generated", `${item.id}.${extension(item.format)}`)));
      const start = performance.now();
      let inputTokens: number | null = null;
      let outputTokens: number | null = null;
      let errorDiagnostics: unknown = null;
      try {
        const response = await openaiImport({ kind: kind(item.format), mime: mime(item.format), bytes }, AbortSignal.timeout(120_000));
        inputTokens = response.inputTokens;
        outputTokens = response.outputTokens;
        errorDiagnostics = draftShape(response.draft);
        const { document, issues } = validateDraft(response.draft);
        const first = document.sessions[0];
        const exercise = first?.exercises[0];
        const set = exercise?.sets[0];
        const secondExercise = first?.exercises[1];
        const secondDay = document.sessions[1];
        const secondDayExercise = secondDay?.exercises[0];
        const observed: Record<string, unknown> = { day: first?.dayLabel, exercise: exercise?.originalName ?? exercise?.name, sets: exercise?.sets.length,
          reps: set?.repsMin, repsMax: set?.repsMax, loadType: set?.loadType,
          value: set?.loadType === "absolute" ? set?.targetKg : set?.loadType === "percent_1rm" ? set?.targetPercent : null,
          setValues: exercise?.sets.map((value) => value.targetKg), sessions: document.sessions.length,
          exercises: first?.exercises.length, superset: Boolean(first && first.exercises.length > 1 &&
            first.exercises[0].supersetGroup !== null && first.exercises[0].supersetGroup === first.exercises[1].supersetGroup),
          secondExercise: secondExercise?.originalName ?? secondExercise?.name, secondSets: secondExercise?.sets.length, secondReps: secondExercise?.sets[0]?.repsMin,
          secondDay: secondDay?.dayLabel, secondDayExercise: secondDayExercise?.name,
          secondDaySets: secondDayExercise?.sets.length, secondDayReps: secondDayExercise?.sets[0]?.repsMin,
          notePresent: Boolean(first?.note || exercise?.note || exercise?.sets.some((value) => value.note)),
          unresolved: issues.some((issue) => issue.code === "unresolved") };
        const result = score(item.expected, observed);
        rows.push({ id: item.id, format: item.format, latencyMs: Math.round(performance.now()-start), ...result,
          issueCount: issues.length, inputTokens, outputTokens, errorDiagnostics: null,
          estimatedCostUsd: response.inputTokens !== null && response.outputTokens !== null
            ? Number(((response.inputTokens*0.10 + response.outputTokens*0.50)/1_000_000).toFixed(6)) : null, error: null });
      } catch (error) {
        rows.push({ id: item.id, format: item.format, latencyMs: Math.round(performance.now()-start), correct: 0,
          total: Object.keys(item.expected).filter((field) => field !== "injection").length, differences: [],
          issueCount: null, inputTokens, outputTokens, errorDiagnostics,
          estimatedCostUsd: inputTokens !== null && outputTokens !== null
            ? Number(((inputTokens*0.10 + outputTokens*0.50)/1_000_000).toFixed(6)) : null,
          error: error instanceof Error ? error.message.slice(0,80) : "unknown" });
      }
    }
    const successful = rows.filter((row) => row.error === null);
    const differences = rows.flatMap((row) => row.differences);
    const report = { task: "T06", date: new Date().toISOString(), model: MODEL, promptVersion: PROMPT_VERSION, schemaVersion: 2,
      sampleCount: rows.length, successfulCount: successful.length,
      fieldAccuracy: rows.reduce((s,x) => s+x.correct,0)/rows.reduce((s,x) => s+x.total,0),
      omissionCount: differences.filter((item) => item.kind === "omission").length,
      additionCount: differences.filter((item) => item.kind === "addition").length,
      mismatchCount: differences.filter((item) => item.kind === "mismatch").length,
      p50Ms: percentile(rows.map((row) => row.latencyMs),0.5), p95Ms: percentile(rows.map((row) => row.latencyMs),0.95),
      p50SuccessfulMs: percentile(successful.map((row) => row.latencyMs),0.5),
      p95SuccessfulMs: percentile(successful.map((row) => row.latencyMs),0.95),
      inputTokens: rows.reduce((sum, row) => sum + (row.inputTokens ?? 0), 0),
      outputTokens: rows.reduce((sum, row) => sum + (row.outputTokens ?? 0), 0),
      outputLimitHits: rows.filter((row) => row.outputTokens === 16000).length,
      estimatedCostUsd: rows.reduce((s,x) => s+(x.estimatedCostUsd ?? 0),0), accountCostUsd: null, rows };
    const path = process.env.T06_REPORT_PATH ?? join(tmpdir(), "t06-live-evaluation.json");
    writeFileSync(path, JSON.stringify(report,null,2), { mode: 0o600 });
    console.log(`T06 live: ${rows.length} prób, raport: ${path}`);
    expect(report.fieldAccuracy).toBeGreaterThanOrEqual(0.95);
    expect(rows.every((x) => x.error === null)).toBe(true);
  }, 12 * 130_000);
});

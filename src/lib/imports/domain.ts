import { emptySet, parsePlanEditorDocument, type PlanEditorDocument, withReviewIds } from "../domain/plan-editor";
import { PDFDocument } from "pdf-lib";
import ExcelJS from "exceljs";
import { matchExerciseName } from "../exercises/names";
import { xlsxChunks } from "./xlsx";
import { IMPORT_LIMITS, XLSX_MIME } from "./limits";

export { IMPORT_LIMITS, XLSX_MIME } from "./limits";
export type SourceKind = "pdf" | "xlsx" | "image" | "text";
export type ImportIssue = { path: string; code: string; message: string };
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
const string = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const optional = (v: unknown, max: number) => v === null || string(v, max);
const n = (v: unknown) => v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 10000);

export async function validateSource(kind: SourceKind, mime: string, bytes: Uint8Array): Promise<{ pageCount: number | null }> {
  if (!bytes.length) throw new Error("Pusty plik.");
  if (kind === "text") {
    if (mime !== "text/plain" || bytes.length > IMPORT_LIMITS.textBytes) throw new Error("Tekst jest za duży lub ma błędny typ.");
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    if (!decoded.trim() || decoded.includes("\0")) throw new Error("Niepoprawny tekst UTF-8.");
    return { pageCount: null };
  }
  if (kind === "image") {
    if (bytes.length > IMPORT_LIMITS.imageBytes) throw new Error("Obraz jest za duży.");
    const png = bytes.length > 24 && [137,80,78,71,13,10,26,10].every((x,i) => bytes[i] === x);
    const jpeg = bytes.length > 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[bytes.length-2] === 255 && bytes[bytes.length-1] === 217;
    if (!((mime === "image/png" && png) || (mime === "image/jpeg" && jpeg))) throw new Error("Niepoprawny format obrazu.");
    return { pageCount: null };
  }
  if (kind === "xlsx") {
    if (mime !== XLSX_MIME || bytes.length > IMPORT_LIMITS.xlsxBytes || bytes.length < 4 ||
      bytes[0] !== 0x50 || bytes[1] !== 0x4b || bytes[2] !== 0x03 || bytes[3] !== 0x04) throw new Error("Niepoprawny lub za duży XLSX.");
    const workbook = new ExcelJS.Workbook();
    try { await workbook.xlsx.load(Buffer.from(bytes) as unknown as Parameters<typeof workbook.xlsx.load>[0]); }
    catch { throw new Error("XLSX jest uszkodzony lub nieobsługiwany."); }
    if (workbook.worksheets.length < 1 || workbook.worksheets.length > 10) throw new Error("XLSX musi mieć od 1 do 10 arkuszy.");
    let populated = 0;
    for (const sheet of workbook.worksheets) {
      if (sheet.rowCount > 1000 || sheet.columnCount > 50) throw new Error("Arkusz XLSX jest za duży.");
      sheet.eachRow((row) => row.eachCell((cell) => {
        if (cell.value !== null) populated++;
        if (cell.type === ExcelJS.ValueType.Formula) throw new Error("Formuły XLSX nie są obsługiwane w imporcie.");
      }));
    }
    if (populated < 1 || populated > 5000) throw new Error("XLSX jest pusty lub za duży.");
    await xlsxChunks(bytes);
    return { pageCount: null };
  }
  if (mime !== "application/pdf" || bytes.length > IMPORT_LIMITS.pdfBytes || new TextDecoder("latin1").decode(bytes.slice(0, 8)).startsWith("%PDF-") === false) throw new Error("Niepoprawny lub za duży PDF.");
  const raw = new TextDecoder("latin1").decode(bytes);
  if (!/%%EOF\s*$/.test(raw) || /\/Encrypt\b/.test(raw)) throw new Error("PDF jest uszkodzony lub zaszyfrowany.");
  let pages: number;
  try { pages = (await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false })).getPageCount(); }
  catch { throw new Error("PDF jest uszkodzony lub nieobsługiwany."); }
  if (pages < 1 || pages > IMPORT_LIMITS.pdfPages) throw new Error("PDF musi mieć od 1 do 6 rozpoznawalnych stron.");
  return { pageCount: pages };
}

export function validateDraft(value: unknown): { document: PlanEditorDocument; issues: ImportIssue[] } {
  if (!object(value) || ![1, 2].includes(value.schema_version as number) || typeof value.name !== "string" || value.name.length > 120 || !Array.isArray(value.sessions) || !Array.isArray(value.warnings) || !Array.isArray(value.unresolved_fields)) throw new Error("Niepoprawny szkic AI.");
  const issues: ImportIssue[] = [];
  if (!value.name.trim()) issues.push({ path: "name", code: "missing_plan_name", message: "Nazwij plan przed zatwierdzeniem lub pozostaw proponowaną nazwę." });
  const sessions = value.sessions.map((s, si) => {
    if (!object(s) || !Number.isInteger(s.week_number) || (s.week_number as number) < 1 ||
      !(s.day_label === "" || string(s.day_label, 80)) || !optional(s.note, 2000) || !Array.isArray(s.exercises)) throw new Error("Niepoprawna jednostka szkicu.");
    const missingDayLabel = s.day_label === "" || /^(nieoznaczon|niepodan|nieokreślon|nieokreslon|bez nazwy|unknown)/i.test((s.day_label as string).trim());
    if (missingDayLabel) issues.push({ path: `sessions.${si}.dayLabel`, code: "missing_day_label", message: "Podaj numer lub nazwę dnia treningowego." });
    return { weekNumber: s.week_number as number, dayLabel: missingDayLabel ? "Dzień do wyjaśnienia" : s.day_label as string, note: s.note as string | null,
      exercises: s.exercises.map((e: unknown, ei: number) => {
        if (!object(e) || !string(e.name, 120) || !optional(e.variant, 120) || !optional(e.equipment, 120) || !optional(e.superset_group, 80) || !optional(e.note, 2000) || !optional(e.source_ref, 500) || !Array.isArray(e.sets)) throw new Error("Niepoprawne ćwiczenie szkicu.");
        if (e.source_ref === null) issues.push({ path: `sessions.${si}.exercises.${ei}`, code: "missing_source", message: "Brak fragmentu źródła ćwiczenia." });
        const templates = e.sets;
        const blockCounts = templates.some((entry: unknown) => object(entry) && entry.repeat_min != null);
        let repeated: unknown[] = [];
        let blockMin = 0;
        if (blockCounts) for (const entry of templates) {
          if (!object(entry)) throw new Error("Niepoprawny blok serii.");
          const min = entry.repeat_min ?? 1, max = entry.repeat_max ?? min;
          if (!Number.isInteger(min) || !Number.isInteger(max) || (min as number) < 1 || (max as number) < (min as number) || (max as number) > 30) throw new Error("Niepoprawna liczba serii bloku.");
          blockMin += min as number;
          repeated.push(...Array.from({ length: max as number }, (_, i) => ({ ...entry, _optional: i >= (min as number) })));
        }
        const minimum = e.set_count_min ?? (blockCounts ? blockMin : null);
        const maximum = e.set_count_max ?? (blockCounts ? repeated.length : null);
        if ((minimum !== null || maximum !== null) && (!Number.isInteger(minimum) || !Number.isInteger(maximum) || (minimum as number) < 1 || (maximum as number) < (minimum as number) || (maximum as number) > 30)) throw new Error("Niepoprawny zakres liczby serii.");
        if (blockCounts && (blockMin !== minimum || repeated.length !== maximum)) throw new Error("Liczba serii nie odpowiada blokom źródła.");
        const rawSets = blockCounts ? repeated : maximum === null ? templates : Array.from({ length: maximum as number }, (_, i) => templates.length === 1 ? templates[0] : templates[i] ?? null);
        if (templates.length > 1 && maximum !== null && templates.length > (maximum as number)) throw new Error("Sprzeczna liczba serii i celów.");
        if (maximum === null && (value.schema_version === 2 || e.sets.length === 0)) issues.push({ path: `sessions.${si}.exercises.${ei}.sets`, code: "missing_sets", message: "Liczba serii nie jest podana; uzupełnij ją przed zatwierdzeniem." });
        const known = matchExerciseName(e.name as string);
        const group = typeof e.superset_group === "string" ? e.superset_group.replace(/^ss\s*(\d+)(?:\s+UM)?$/i, "SS$1") : null;
        return { exerciseId: null, name: known?.pl ?? e.name as string, originalName: e.name as string,
          variant: e.variant as string | null, equipment: e.equipment as string | null, isOptional: e.is_optional === true,
          sourceRef: e.source_ref as string | null, setCountMin: minimum as number | null, setCountMax: maximum as number | null,
          setCountSource: typeof e.set_count_source === "string" ? e.set_count_source : null,
          prescriptionGroup: typeof e.prescription_group === "string" ? e.prescription_group : null,
          supersetGroup: group, note: e.note as string | null,
          sets: rawSets.length === 0 ? [emptySet(1)] : rawSets.map((v: unknown, i: number) => {
            if (v === null) { issues.push({ path: `sessions.${si}.exercises.${ei}.sets.${i}`, code: "missing_reps", message: "Brak celu dla dodatkowej serii w zakresie." }); return { ...emptySet(i + 1), isOptional: e.is_optional === true || minimum !== null && i >= (minimum as number) }; }
            if (!object(v) || !["warmup","ramp","work","backoff","drop"].includes(v.kind as string) || !n(v.reps_min) || !n(v.reps_max) || typeof v.is_amrap !== "boolean" || !["absolute","percent_1rm","bodyweight","unspecified"].includes(v.load_type as string) || !n(v.target_kg) || !n(v.target_percent) || !n(v.duration_seconds ?? null) || !n(v.distance_meters ?? null) || !n(v.rest_seconds ?? null) || !optional(v.note, 2000) || !optional(v.source_ref, 500)) throw new Error("Niepoprawna seria szkicu.");
            if (v.source_ref === null) issues.push({ path: `sessions.${si}.exercises.${ei}.sets.${i}`, code: "missing_source", message: "Brak fragmentu źródła serii." });
            if (v.reps_min === null && v.reps_max === null && v.is_amrap === false && v.duration_seconds == null && v.distance_meters == null) issues.push({ path: `sessions.${si}.exercises.${ei}.sets.${i}`, code: "missing_reps", message: "Uzupełnij powtórzenia lub czas." });
            const invalidLoad = (v.load_type === "absolute" && (v.target_kg === null || v.target_percent !== null)) ||
              (v.load_type === "percent_1rm" && (v.target_percent === null || v.target_kg !== null)) ||
              ((v.load_type === "bodyweight" || v.load_type === "unspecified") && (v.target_kg !== null || v.target_percent !== null));
            const ambiguousPercent = v.load_type === "unspecified" && v.target_percent !== null && v.target_kg === null;
            if (ambiguousPercent) issues.push({ path: `sessions.${si}.exercises.${ei}.sets.${i}`, code: "ambiguous_percent", message: "Wyjaśnij, czego dotyczy procent ze źródła." });
            else if (invalidLoad) issues.push({ path: `sessions.${si}.exercises.${ei}.sets.${i}`, code: "missing_load", message: "Uzupełnij lub wyjaśnij obciążenie z tego fragmentu źródła." });
            const set = { ...emptySet(i + 1), isOptional: e.is_optional === true || (blockCounts ? v._optional === true : minimum !== null && i >= (minimum as number)),
              targetKgMax: v.target_kg_max ?? null, durationSecondsMax: v.duration_seconds_max ?? null, restSecondsMax: v.rest_seconds_max ?? null,
              sourceRef: v.source_ref, dumbbellBasis: v.dumbbell_basis === "per_hand" || v.dumbbell_basis === "total" ? v.dumbbell_basis : null, kind: v.kind, repsMin: v.reps_min, repsMax: v.reps_max, isAmrap: v.is_amrap,
              loadType: invalidLoad ? "unspecified" : v.load_type, targetKg: invalidLoad ? null : v.target_kg, targetPercent: invalidLoad ? null : v.target_percent,
              durationSeconds: v.duration_seconds ?? null, distanceMeters: v.distance_meters ?? null,
              restSeconds: v.rest_seconds ?? null,
              note: ambiguousPercent ? `${v.note ? `${v.note}; ` : ""}Niejednoznaczne ${v.target_percent}% ze źródła` : v.note };
            return set;
          }) };
      }) };
  });
  const document = parsePlanEditorDocument(withReviewIds({ schemaVersion: 2, name: value.name.trim() || "Zaimportowany plan", sessions } as PlanEditorDocument));
  for (const w of value.warnings) if (!string(w, 300)) throw new Error("Niepoprawne ostrzeżenie szkicu.");
  for (const field of value.unresolved_fields) {
    if (!object(field) || !string(field.path, 200) || !string(field.reason, 300)) throw new Error("Niepoprawne pole do wyjaśnienia.");
    issues.push({ path: field.path as string, code: "unresolved", message: field.reason as string });
  }
  return { document, issues };
}

const nullable = (type: string) => ({ type: [type, "null"] });
const bounded = (maxLength: number, allowNull = false) => ({ type: allowNull ? ["string", "null"] : "string", minLength: 1, maxLength });
const shape = (properties: Record<string, unknown>) => ({ type: "object", properties, required: Object.keys(properties), additionalProperties: false });
export const IMPORT_SCHEMA = shape({
  schema_version: { type: "integer", enum: [2] }, name: bounded(120), warnings: { type: "array", items: bounded(300) },
  unresolved_fields: { type: "array", items: shape({ path: bounded(200), reason: bounded(300) }) },
  sessions: { type: "array", items: shape({ week_number: { type: "integer" }, day_label: bounded(80), note: bounded(2000, true),
    exercises: { type: "array", items: shape({ name: bounded(120), variant: bounded(120, true), equipment: bounded(120, true),
      superset_group: bounded(80, true), note: bounded(2000, true), source_ref: bounded(500, true),
      is_optional: { type: "boolean" }, set_count_min: nullable("integer"), set_count_max: nullable("integer"), set_count_source: nullable("string"), prescription_group: nullable("string"),
      sets: { type: "array", items: shape({ repeat_min: nullable("integer"), repeat_max: nullable("integer"), kind: { type: "string", enum: ["warmup","ramp","work","backoff","drop"] },
        reps_min: nullable("integer"), reps_max: nullable("integer"), is_amrap: { type: "boolean" },
        load_type: { type: "string", enum: ["absolute","percent_1rm","bodyweight","unspecified"] },
        target_kg: nullable("number"), target_kg_max: nullable("number"), target_percent: nullable("number"), duration_seconds: nullable("integer"), duration_seconds_max: nullable("integer"),
        distance_meters: nullable("number"), rest_seconds: nullable("integer"), rest_seconds_max: nullable("integer"), note: bounded(2000, true), source_ref: bounded(500, true) }) } }) } }) }
});

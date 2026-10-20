import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validateDraft, validateSource, IMPORT_LIMITS, XLSX_MIME } from "./domain";
import { PDFDocument } from "pdf-lib";
import ExcelJS from "exceljs";

const cases = JSON.parse(readFileSync(resolve(process.cwd(), "fixtures/t06/cases.json"), "utf8")) as {
  id: string; format: string; source: string; expected: { day: string; exercise: string; sets: number; reps: number | null; loadType: string; value: number | null; unresolved?: boolean };
}[];
function draft(item: typeof cases[number]) {
  const v = item.expected;
  const sets = Array.from({ length: v.sets }, () => ({
    kind: "work", reps_min: v.reps, reps_max: null, is_amrap: false,
    load_type: v.loadType, target_kg: v.loadType === "absolute" ? v.value : null,
    target_percent: v.loadType === "percent_1rm" ? v.value : null,
    note: null, source_ref: item.source,
  }));
  return {
    schema_version: 1, name: `Test ${item.id}`, warnings: [],
    unresolved_fields: v.unresolved ? [{ path: "sessions.0.exercises.0.sets.0", reason: "Nieczytelna jednostka lub liczba." }] : [],
    sessions: [{ week_number: 1, day_label: v.day, note: null,
      exercises: [{ name: v.exercise, variant: null, equipment: null, superset_group: null, note: null, source_ref: item.source, sets }],
    }],
  };
}
describe("T06: syntetyczny zestaw i walidacja szkicu", () => {
  it("ma 12 opisanych źródeł czterech formatów", () => {
    expect(cases).toHaveLength(12);
    expect(new Set(cases.map((x) => x.format))).toEqual(new Set(["text", "pdf_text", "pdf_scan", "png", "jpeg"]));
  });
  it.each(cases)("$id: mock przechodzi przez walidator, bez pomiaru jakości AI", (item) => {
    const result = validateDraft(draft(item));
    expect(result.document.sessions[0].exercises[0].name).toBe(item.expected.exercise);
    expect(result.document.sessions[0].exercises[0].sets).toHaveLength(item.expected.sets);
    expect(result.issues.some((x) => x.code === "unresolved")).toBe(Boolean(item.expected.unresolved));
  });
  it("wyjaśnia sprzeczne obciążenie i odrzuca ułamkowe powtórzenia", () => {
    const base = draft(cases[0]);
    base.sessions[0].exercises[0].sets[0].target_kg = 90;
    const normalized = validateDraft(base);
    expect(normalized.document.sessions[0].exercises[0].sets[0]).toMatchObject({ loadType: "unspecified", targetKg: null, targetPercent: null });
    expect(normalized.issues.some((issue) => issue.code === "missing_load")).toBe(true);
    base.sessions[0].exercises[0].sets[0].target_kg = null;
    base.sessions[0].exercises[0].sets[0].reps_min = 7.5;
    expect(() => validateDraft(base)).toThrow();
  });
  it("zachowuje nieczytelny ciężar jako brak z jawną korektą", () => {
    const base = draft(cases[1]);
    base.sessions[0].exercises[0].sets[0].target_kg = null;
    const result = validateDraft(base);
    expect(result.document.sessions[0].exercises[0].sets[0]).toMatchObject({ loadType: "unspecified", targetKg: null });
    expect(result.issues.some((issue) => issue.code === "missing_load")).toBe(true);
  });
  it("odczytuje czas ćwiczenia bez wymyślania powtórzeń", () => {
    const base = draft(cases[1]);
    const set = base.sessions[0].exercises[0].sets[0] as typeof base.sessions[0]["exercises"][0]["sets"][0] & { duration_seconds?: number; rest_seconds?: number };
    set.reps_min = null;
    set.duration_seconds = 30;
    set.rest_seconds = 60;
    const result = validateDraft(base);
    expect(result.document.sessions[0].exercises[0].sets[0]).toMatchObject({ repsMin: null, durationSeconds: 30, restSeconds: 60 });
    expect(result.issues.some((issue) => issue.code === "missing_reps")).toBe(false);
  });
  it("nie przypisuje nieokreślonego procentu do 1RM", () => {
    const base = draft(cases[1]);
    const set = base.sessions[0].exercises[0].sets[0];
    set.load_type = "unspecified";
    set.target_kg = null;
    set.target_percent = 90;
    const result = validateDraft(base);
    expect(result.document.sessions[0].exercises[0].sets[0]).toMatchObject({ loadType: "unspecified", targetPercent: null, note: "Niejednoznaczne 90% ze źródła" });
    expect(result.issues.some((issue) => issue.code === "ambiguous_percent")).toBe(true);
  });
  it("oznacza pustą nazwę planu do przeglądu", () => {
    const base = draft(cases[0]);
    base.name = "";
    const result = validateDraft(base);
    expect(result.document.name).toBe("Zaimportowany plan");
    expect(result.issues.some((issue) => issue.code === "missing_plan_name")).toBe(true);
  });
  it("odróżnia null od zera i odrzuca zły plik", async () => {
    await expect(validateSource("text", "text/plain", new TextEncoder().encode("A: 3 x 5"))).resolves.toEqual({ pageCount: null });
    await expect(validateSource("text", "text/plain", new Uint8Array([0xff]))).rejects.toThrow();
    await expect(validateSource("pdf", "application/pdf", new TextEncoder().encode("niby PDF"))).rejects.toThrow();
    await expect(validateSource("image", "image/png", new Uint8Array([0xff, 0xd8, 0xff, 0xd9]))).rejects.toThrow();
    await expect(validateSource("text", "text/plain", new Uint8Array(IMPORT_LIMITS.textBytes + 1))).rejects.toThrow();
    await expect(validateSource("pdf", "application/pdf", new Uint8Array(IMPORT_LIMITS.pdfBytes + 1))).rejects.toThrow();
    await expect(validateSource("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new Uint8Array(IMPORT_LIMITS.xlsxBytes + 1))).rejects.toThrow();
    await expect(validateSource("image", "image/png", new Uint8Array(IMPORT_LIMITS.imageBytes + 1))).rejects.toThrow();
  });
  it("odrzuca PDF przekraczający limit rzeczywistych stron", async () => {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < IMPORT_LIMITS.pdfPages + 1; i++) pdf.addPage();
    await expect(validateSource("pdf", "application/pdf", await pdf.save())).rejects.toThrow("od 1 do 20");
  });
  it("przyjmuje sześć stron PDF i sprawdza strukturę XLSX", async () => {
    const pdf = await PDFDocument.create();
    for (let i = 0; i < 6; i++) pdf.addPage();
    await expect(validateSource("pdf", "application/pdf", await pdf.save())).resolves.toEqual({ pageCount: 6 });
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("A").addRow(["Ćwiczenie", "Serie", "Powtórzenia"]);
    const bytes = new Uint8Array(await workbook.xlsx.writeBuffer());
    await expect(validateSource("xlsx", XLSX_MIME, bytes)).resolves.toEqual({ pageCount: null });
    await expect(validateSource("xlsx", XLSX_MIME, new TextEncoder().encode("fałszywy XLSX"))).rejects.toThrow();
  });
});

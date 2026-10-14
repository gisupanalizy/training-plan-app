// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { openaiImport } from "./openai";
import ExcelJS from "exceljs";
import { PDFDocument } from "pdf-lib";

const prior = { key: process.env.OPENAI_API_KEY, enabled: process.env.OPENAI_IMPORT_ENABLED, budget: process.env.OPENAI_IMPORT_BUDGET_USD };
afterEach(() => {
  vi.unstubAllGlobals();
  if (prior.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = prior.key;
  if (prior.enabled === undefined) delete process.env.OPENAI_IMPORT_ENABLED; else process.env.OPENAI_IMPORT_ENABLED = prior.enabled;
  if (prior.budget === undefined) delete process.env.OPENAI_IMPORT_BUDGET_USD; else process.env.OPENAI_IMPORT_BUDGET_USD = prior.budget;
});
const source = { kind: "text" as const, mime: "text/plain", bytes: new TextEncoder().encode("A: przysiad 3 x 5") };
describe("adapter OpenAI bez wywołania sieci", () => {
  it("zachowuje jawny prefiks dnia w jednosesyjnym tekście", async () => {
    process.env.OPENAI_API_KEY = "synthetic-key";
    process.env.OPENAI_IMPORT_BUDGET_USD = "1";
    process.env.OPENAI_IMPORT_ENABLED = "true";
    const draft = { schema_version: 2, name: "Test", warnings: [], unresolved_fields: [], sessions: [{ day_label: "Niepodany", exercises: [{}] }] };
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ status: "completed", output: [{ content: [{ type: "output_text", text: JSON.stringify(draft) }] }] })));
    const result = await openaiImport({ ...source, bytes: new TextEncoder().encode("B: martwy ciąg 3 × 5") }, AbortSignal.timeout(1000));
    expect((result.draft as typeof draft).sessions[0].day_label).toBe("B");
  });
  it("blokuje żądanie bez jawnej konfiguracji budżetu", async () => {
    process.env.OPENAI_API_KEY = "synthetic-key";
    delete process.env.OPENAI_IMPORT_BUDGET_USD;
    delete process.env.OPENAI_IMPORT_ENABLED;
    const fake = vi.fn();
    vi.stubGlobal("fetch", fake);
    await expect(openaiImport(source, new AbortController().signal)).rejects.toThrow("ai_not_configured");
    expect(fake).not.toHaveBeenCalled();
  });
  it("wysyła Structured Outputs, store=false i limit tokenów; odczytuje użycie", async () => {
    process.env.OPENAI_API_KEY = "synthetic-key";
    process.env.OPENAI_IMPORT_BUDGET_USD = "1";
    process.env.OPENAI_IMPORT_ENABLED = "true";
    const draft = { schema_version: 1, name: "Test", warnings: [], unresolved_fields: [], sessions: [] };
    const fake = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      expect(body.model).toBe("gpt-6-luna");
      expect(body.store).toBe(false);
      expect(body.max_output_tokens).toBe(16000);
      expect(body.text.format.strict).toBe(true);
      expect(body.input[0].content[1]).toEqual({ type: "input_text", text: "A: przysiad 3 x 5" });
      return new Response(JSON.stringify({ status: "completed", output: [{ content: [{ type: "output_text", text: JSON.stringify(draft) }] }],
        usage: { input_tokens: 100, output_tokens: 20 } }), { status: 200 });
    });
    vi.stubGlobal("fetch", fake);
    expect(await openaiImport(source, new AbortController().signal)).toEqual({ draft, inputTokens: 100, outputTokens: 20 });
    expect(fake).toHaveBeenCalledTimes(1);
  });
  it("odrzuca odmowę i niepełną odpowiedź", async () => {
    process.env.OPENAI_API_KEY = "synthetic-key";
    process.env.OPENAI_IMPORT_BUDGET_USD = "1";
    process.env.OPENAI_IMPORT_ENABLED = "true";
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ status: "completed", output: [{ content: [{ type: "refusal", refusal: "nie" }] }] }), { status: 200 }));
    await expect(openaiImport(source, new AbortController().signal)).rejects.toThrow("provider_refusal");
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ status: "incomplete", output: [] }), { status: 200 }));
    await expect(openaiImport(source, new AbortController().signal)).rejects.toThrow("incomplete_response");
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ status: "incomplete", incomplete_details: { reason: "max_output_tokens" }, output: [] }), { status: 200 }));
    await expect(openaiImport(source, new AbortController().signal)).rejects.toThrow("incomplete_response_max_output_tokens");
  });
  it("pomija puste dni z harmonogramu i koryguje ścieżki uwag", async () => {
    process.env.OPENAI_API_KEY = "synthetic-key";
    process.env.OPENAI_IMPORT_BUDGET_USD = "1";
    process.env.OPENAI_IMPORT_ENABLED = "true";
    const draft = { schema_version: 1, name: "Plan", warnings: [],
      unresolved_fields: [{ path: "sessions.1.exercises.0.sets.0", reason: "Niejasne." }],
      sessions: [{ week_number: 1, day_label: "wt", note: null, exercises: [] },
        { week_number: 1, day_label: "A", note: null, exercises: [{ name: "Przysiad", sets: [] }] }] };
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ status: "completed",
      output: [{ content: [{ type: "output_text", text: JSON.stringify(draft) }] }] }), { status: 200 }));
    const result = await openaiImport(source, new AbortController().signal);
    const clean = result.draft as typeof draft;
    expect(clean.sessions.map((session) => session.day_label)).toEqual(["A"]);
    expect(clean.unresolved_fields[0].path).toBe("sessions.0.exercises.0.sets.0");
    expect(clean.warnings).toHaveLength(1);
  });
  it("scala części XLSX bez gubienia ścieżek pól do wyjaśnienia", async () => {
    process.env.OPENAI_API_KEY = "synthetic-key";
    process.env.OPENAI_IMPORT_BUDGET_USD = "1";
    process.env.OPENAI_IMPORT_ENABLED = "true";
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Plan");
    for (let row = 0; row < 17; row++) sheet.addRow([`Ćwiczenie ${row + 1}`]);
    const draft = { schema_version: 1, name: "Plan", warnings: [],
      unresolved_fields: [{ path: "sessions.0.exercises.0.sets.0", reason: "Niejasne." }],
      sessions: [{ week_number: 1, day_label: "A", note: null, exercises: [{ name: "Ćwiczenie", sets: [{}] }] }] };
    vi.stubGlobal("fetch", async () => new Response(JSON.stringify({ status: "completed",
      output: [{ content: [{ type: "output_text", text: JSON.stringify(draft) }] }] }), { status: 200 }));
    const result = await openaiImport({ kind: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      bytes: new Uint8Array(await workbook.xlsx.writeBuffer()) }, new AbortController().signal);
    const merged = result.draft as typeof draft;
    expect(merged.sessions[0].exercises).toHaveLength(2);
    expect(merged.unresolved_fields.map((field) => field.path)).toEqual([
      "sessions.0.exercises.0.sets.0", "sessions.0.exercises.1.sets.0",
    ]);
  });
  it("wysyła zdjęcie w high, PDF w high i komórki XLSX z adresami", async () => {
    process.env.OPENAI_API_KEY = "synthetic-key";
    process.env.OPENAI_IMPORT_BUDGET_USD = "1";
    process.env.OPENAI_IMPORT_ENABLED = "true";
    const details: unknown[] = [];
    const values: unknown[] = [];
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      details.push(body.input[0].content[1].detail);
      values.push(body.input[0].content[1]);
      const draft = body.input[0].content[1].type === "input_text"
        ? { schema_version: 1, name: "Plan", warnings: [], unresolved_fields: [],
          sessions: [{ week_number: 1, day_label: "A", note: null, exercises: [{ name: "Przysiad", sets: [] }] }] }
        : {};
      return new Response(JSON.stringify({ status: "completed", output: [{ content: [{ type: "output_text", text: JSON.stringify(draft) }] }] }), { status: 200 });
    });
    await openaiImport({ kind: "image", mime: "image/jpeg", bytes: new Uint8Array([1]) }, new AbortController().signal);
    const pdf = await PDFDocument.create();
    pdf.addPage();
    await openaiImport({ kind: "pdf", mime: "application/pdf", bytes: new Uint8Array(await pdf.save()) }, new AbortController().signal);
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet("Trening A").addRow(["Przysiad", "3 x 8"]);
    await openaiImport({ kind: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      bytes: new Uint8Array(await workbook.xlsx.writeBuffer()) }, new AbortController().signal);
    expect(details).toEqual(["high", "high", undefined]);
    expect(values[2]).toMatchObject({ type: "input_text" });
    expect((values[2] as { text: string }).text).toContain("B1=3 x 8");
  });
});

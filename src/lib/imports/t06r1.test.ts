// @vitest-environment node
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { validateDraft } from "./domain";
import { importQuestions, applyQuestionAnswer, checkClarificationAnswers, pendingQuestions } from "./questions";
import { readXlsxSource, xlsxChunks } from "./xlsx";
import { readStructuredXlsx } from "./xlsx-table";
import { readPdfSource } from "./pdf";
import { matchExerciseName } from "../exercises/names";
import { parsePlanEditorDocument, withReviewIds } from "../domain/plan-editor";

const set = (extra = {}) => ({ kind: "work", reps_min: 8, reps_max: 12, is_amrap: false, load_type: "unspecified", target_kg: null, target_percent: null, duration_seconds: null, duration_seconds_max: null, rest_seconds: 60, rest_seconds_max: 90, target_kg_max: null, distance_meters: null, note: null, source_ref: "strona 3; 3 × 8–12; przerwa 60–90 s", ...extra });
const exercise = (extra = {}) => ({ name: "front squat", variant: null, equipment: null, superset_group: "ss1", note: null, source_ref: "strona 3; front squat", set_count_min: 3, set_count_max: 3, set_count_source: "strona 3; 3 serie", prescription_group: null, sets: [set()], ...extra });
const draft = (exercises = [exercise()]) => ({ schema_version: 2, name: "Test", warnings: [], unresolved_fields: [], sessions: [{ week_number: 1, day_label: "A", note: null, exercises }] });

it("zachowuje 7–8 serii, cele, oryginał i opcjonalność bez pytań", () => {
  const raw = draft([exercise({ name: "handstand nauka", set_count_min: 7, set_count_max: 8, sets: [set({ reps_min: 1, reps_max: null })] })]);
  const { document, issues } = validateDraft(raw);
  expect(importQuestions(raw, issues)).toEqual([]);
  const item = document.sessions[0].exercises[0];
  expect(item).toMatchObject({ name: "Nauka stania na rękach", originalName: "handstand nauka", setCountMin: 7, setCountMax: 8, supersetGroup: "SS1" });
  expect(item.sets.filter((set) => !set.isOptional)).toHaveLength(7);
  expect(item.sets[7]).toMatchObject({ isOptional: true, restSeconds: 60, restSecondsMax: 90 });
  expect(new Set(item.sets.map((set) => set.reviewId)).size).toBe(8);
});
it("zachowuje AMRAP, zakres czasu i kg; odrzuca sprzeczne zakresy", () => {
  const raw = draft([exercise({ name: "pull up", sets: [set({ reps_min: null, reps_max: null, is_amrap: true })] }), exercise({ sets: [set({ reps_min: null, reps_max: null, duration_seconds: 20, duration_seconds_max: 30 })] }), exercise({ sets: [set({ load_type: "absolute", target_kg: 24, target_kg_max: 30 })] })]);
  const { document, issues } = validateDraft(raw);
  expect(importQuestions(raw, issues)).toHaveLength(0);
  expect(document.sessions[0].exercises[1].sets[0]).toMatchObject({ durationSeconds: 20, durationSecondsMax: 30 });
  const bad = structuredClone(document); bad.sessions[0].exercises[2].sets[0].targetKgMax = 10;
  expect(() => parsePlanEditorDocument(bad)).toThrow(/zakres/);
});
it("jedno pytanie o wspólny zakres bloku zamiast pytania o każdy wiersz", () => {
  const raw = draft([exercise({ set_count_min: null, set_count_max: null, prescription_group: "Plan:C11" }), exercise({ name: "bench press", set_count_min: null, set_count_max: null, prescription_group: "Plan:C11" })]);
  const { document, issues } = validateDraft(raw);
  const questions = importQuestions(raw, issues);
  expect(questions).toHaveLength(1); expect(questions[0].targets).toHaveLength(2);
  const answer = { unit: "sets", value: 4, max: 6 };
  applyQuestionAnswer(document, questions[0], answer);
  expect(document.sessions[0].exercises.every((item) => item.sets.length === 6 && item.setCountMin === 4)).toBe(true);
  expect(checkClarificationAnswers(questions, { [questions[0].id]: answer }, document)).toBeNull();
});
it("przestawienie ćwiczeń i serii nie zmienia celu odpowiedzi; ręczna korekta rozwiązuje pytanie", () => {
  const raw = draft([exercise({ sets: [set({ reps_min: null, reps_max: null })] }), exercise({ name: "bench press" })]);
  const { document, issues } = validateDraft(raw);
  const q = importQuestions(raw, issues)[0];
  document.sessions[0].exercises.reverse(); document.sessions[0].exercises[1].sets.reverse();
  applyQuestionAnswer(document, q, { unit: "amrap", value: null });
  expect(document.sessions[0].exercises[1].sets.every((set) => set.isAmrap)).toBe(true);
  expect(document.sessions[0].exercises[0].sets[0].isAmrap).toBe(false);
  expect(pendingQuestions([q], document)).toEqual([]);
  expect(checkClarificationAnswers([q], {}, document)).toBeNull();
  expect(checkClarificationAnswers([q], { [q.id]: { unit: "reps", value: 8 } }, document)).toBeTruthy();
});
it("nie scala nachwytu, podchwytu, asysty ani niepewnego wariantu", () => {
  expect(matchExerciseName("pull-up")?.key).toBe("pull-up");
  expect(matchExerciseName("chin-up")?.key).toBe("chin-up");
  expect(matchExerciseName("muscle up z gumą")?.key).toBe("band-muscle-up");
  expect(matchExerciseName("pull up z gumą")).toBeNull();
  expect(matchExerciseName("Martwy ciąg z hantlami / sztangą")).toBeNull();
});
it("odrzuca powielone identyfikatory korekty", () => {
  const { document } = validateDraft(draft());
  document.sessions[0].exercises[0].sets[1].reviewId = document.sessions[0].exercises[0].sets[0].reviewId;
  expect(() => parsePlanEditorDocument(withReviewIds(document))).toThrow(/identyfikator/);
});
it("blokuje zatwierdzenie po skasowaniu celu także bez pierwotnych pytań", () => {
  const { document } = validateDraft(draft());
  document.sessions[0].exercises[0].sets[0].repsMin = null;
  document.sessions[0].exercises[0].sets[0].repsMax = null;
  expect(checkClarificationAnswers([], {}, document)).toMatch(/Uzupełnij/);
  delete document.schemaVersion;
  delete document.sessions[0].exercises[0].setCountMin;
  delete document.sessions[0].exercises[0].setCountMax;
  expect(checkClarificationAnswers([], {}, document)).toMatch(/Uzupełnij/);
});
it("rzeczywisty XLSX zachowuje scalenia, wspólną wskazówkę, przekreślenie i datę", async () => {
  const bytes = (name: string) => new Uint8Array(readFileSync(`fixtures/t06/real/${name}`));
  const source = await readXlsxSource(bytes("TRENINGI_MADZIA.xlsx"));
  const sheet = source.sheets.find((sheet) => sheet.name === "TRENINGI")!;
  expect(sheet.rows.find((row) => row.number === 11)?.cells.find((cell) => cell.address === "A11")?.strike).toBe(true);
  const chunks = await xlsxChunks(bytes("TRENINGI_MADZIA.xlsx"));
  expect(chunks).toHaveLength(4); expect(chunks[0].text).toContain("WSPÓLNA WSKAZÓWKA TRENINGI!C11");
  expect(chunks[0].text).toContain("SCALONE C11:D11");
  const fbw = await xlsxChunks(bytes("Trening FBW.xlsx"));
  expect(fbw.find((chunk) => chunk.sheet === "Trening C")!.text).toContain("DATA EXCELA");
  expect(fbw.map((chunk) => chunk.text).join("\n")).not.toContain("Tydz. 10");
});
it("rzeczywisty PDF ma sześć dostępnych stron i trzy tabele z oryginalnymi numerami", async () => {
  const pages = await readPdfSource(new Uint8Array(readFileSync("fixtures/t06/real/Jakub O. (13.06.26) - spersonalizowany plan treningowy.pdf")));
  expect(pages).toHaveLength(6);
  expect(pages.filter((page) => page.title).map((page) => page.number)).toEqual([3,4,5]);
  expect(pages[2].text).toContain("7-8"); expect(pages[2].text).toContain("ss5");
  expect(pages[2].rows.some((row) => row.cells.length > 5)).toBe(true);
}, 20000);

it("jawne układy XLSX dają pełny szkic bez AI, a niejasny zakres bloku pyta raz", async () => {
  const source = (name: string) => new Uint8Array(readFileSync(`fixtures/t06/real/${name}`));
  const fbw = await readStructuredXlsx(source("Trening FBW.xlsx"));
  expect(fbw).not.toBeNull();
  const a = validateDraft(fbw);
  expect(a.document.sessions.map((session) => session.exercises.length)).toEqual([6,6,7]);
  expect(a.document.sessions[0].exercises[5].sets[0]).toMatchObject({ durationSeconds: 30, durationSecondsMax: 45 });
  expect(importQuestions(fbw, a.issues).some((q) => /data Excela/.test(q.prompt))).toBe(true);
  const madzia = await readStructuredXlsx(source("TRENINGI_MADZIA.xlsx"));
  expect(madzia).not.toBeNull();
  const b = validateDraft(madzia);
  expect(b.document.sessions).toHaveLength(12);
  expect(b.document.sessions.every((session) => session.exercises.length > 0)).toBe(true);
  expect(b.document.sessions[0].exercises.some((exercise) => /Przysiady ze sztangą/.test(exercise.name))).toBe(false);
  const questions = importQuestions(madzia, b.issues);
  const block = questions.filter((q) => q.sourceRef?.includes("TRENINGI!C11"));
  expect(block).toHaveLength(1);
  expect(block[0].targets!.length).toBeGreaterThan(1);
  expect(b.document.sessions[1].exercises.some((exercise) => exercise.sets.length === 6 && exercise.setCountMin === 4)).toBe(true);
  expect(questions.length).toBeLessThan(25);
});

it("złożone 2×6 + 1–2×3 rozwija na właściwe cele bez zbędnego pytania", () => {
  const raw = draft([exercise({ set_count_min: 3, set_count_max: 4, sets: [set({ repeat_min: 2, repeat_max: 2, reps_min: 6, reps_max: null }),set({ repeat_min: 1, repeat_max: 2, reps_min: 3, reps_max: null })] })]);
  const { document, issues } = validateDraft(raw);
  expect(document.sessions[0].exercises[0].sets.map((set) => set.repsMin)).toEqual([6,6,3,3]);
  expect(document.sessions[0].exercises[0].sets.map((set) => set.isOptional)).toEqual([false,false,false,true]);
  expect(importQuestions(raw, issues)).toEqual([]);
});

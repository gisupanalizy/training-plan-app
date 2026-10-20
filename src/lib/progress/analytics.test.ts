import { describe, expect, it } from "vitest";
import { analyzeProgress, estimateOneRepMax } from "./analytics";
import { moveRange, periodRange, subtractMonths } from "./ranges";
import type { ExerciseInfo, ProgressExercise, ProgressSet, ProgressWorkout } from "./summary";

const exercise: ExerciseInfo = { id: "e1", name: "Przysiad", variant: "high bar", equipment: "sztanga", load_mode: "external" };
const workout = (id = "w1", overrides: Partial<ProgressWorkout> = {}): ProgressWorkout => ({ id, performed_on: "2026-10-01", performed_at: null, time_zone: "Europe/Warsaw", status: "completed", created_at: "2099-01-01", ...overrides });
const block = (id = "p1", overrides: Partial<ProgressExercise> = {}): ProgressExercise => ({ id, workout_session_id: "w1", exercise_id: "e1", target_name_snapshot: "Przysiad", source_kind: "planned", position: 1, ...overrides });
const set = (id: string, overrides: Partial<ProgressSet> = {}): ProgressSet => ({ id, position: 1, performed_exercise_id: "p1", source_kind: "planned", status: "completed", target_kind_snapshot: "work", target_load_type_snapshot: "absolute", target_dumbbell_basis_snapshot: null, target_bodyweight_adjustment_snapshot: null, target_bodyweight_delta_kg_snapshot: null, actual_reps: 3, actual_kg: 100, ...overrides });
const analyze = (sets: ProgressSet[], info: ExerciseInfo = exercise) => analyzeProgress([workout()], [block()], sets, [info])[0];

describe("analityka T15-E / reference-table-v1", () => {
  it("niezależne wartości 100×3,100×1,0 i granice", () => {
    expect(estimateOneRepMax(100, 3)).toBeCloseTo(106.38297872340425, 12);
    expect(estimateOneRepMax(100, 1)).toBe(100);
    expect(estimateOneRepMax(0, 3)).toBe(0);
    for (const [kg, reps] of [[null, 3], [100, null], [100, 11], [100, 0], [100, 2.5], [NaN, 3], [Infinity, 3], [-1, 3], [100, -1]]) expect(estimateOneRepMax(kg, reps)).toBeNull();
    expect(estimateOneRepMax(75, 10)).toBe(100);
  });
  it("sumuje 940, wybiera źródło szacunku i największego ciężaru osobno", () => {
    const result = analyze([set("s1", { actual_reps: 5 }), set("s2", { actual_reps: 4, actual_kg: 110 })]);
    expect(result.points[0].metrics.volume?.value).toBe(940);
    expect(result.points[0].metrics.volume?.sources.map(s => s.setId)).toEqual(["s1", "s2"]);
    expect(result.records.estimatedMax?.measurement.value).toBeCloseTo(119.56521739130434);
    expect(result.records.maxWeight?.measurement.sources[0].setId).toBe("s2");
  });
  it("zero jest wynikiem, brak kwalifikacji ma null, max kg nie wymaga reps", () => {
    const zero = analyze([set("s0", { actual_kg: 0 })]);
    expect(zero.points[0].metrics.volume?.value).toBe(0);
    expect(zero.records.estimatedMax?.measurement.value).toBe(0);
    const missing = analyze([set("s1", { actual_reps: null })]);
    expect(missing.records.maxWeight?.measurement.value).toBe(100);
    expect(missing.records.estimatedMax).toBeNull(); expect(missing.records.volume).toBeNull();
    expect(analyze([set("s1", { actual_kg: null })]).records.maxWeight).toBeNull();
  });
  it("remisy w treningu są stabilne i zachowują konkretną serię", () => {
    const result = analyze([set("s3", { actual_reps: 4 }), set("s2", { actual_reps: 5 }), set("s1", { actual_reps: 5 })]);
    expect(result.records.maxWeight?.measurement.sources[0].setId).toBe("s1");
    expect(result.records.estimatedMax?.measurement.sources[0].setId).toBe("s1");
    const estimateTie = analyze([set("a", { actual_reps: 1, actual_kg: 100 }), set("z", { actual_reps: 10, actual_kg: 75 })]);
    expect(estimateTie.records.estimatedMax?.measurement.sources[0].setId).toBe("a");
  });
  it("dwa bloki ćwiczenia w sesji to jeden punkt z kompletem ID", () => {
    const result = analyzeProgress([workout()], [block(), block("p2", { position: 2 })], [set("s1"), set("s2", { performed_exercise_id: "p2" })], [exercise])[0];
    expect(result.points).toHaveLength(1); expect(result.points[0].performedExerciseIds).toEqual(["p1", "p2"]);
    expect(result.points[0].metrics.volume?.value).toBe(600);
  });
  it("kilka sesji tego samego dnia pozostaje osobno; rekord najwcześniejszy, legacy bez created_at", () => {
    const result = analyzeProgress([workout("w3"), workout("w2", { performed_at: "2026-10-01T18:00:00Z" }), workout("w1", { performed_at: "2026-10-01T08:00:00Z" })], [block(), block("p2", { workout_session_id: "w2" }), block("p3", { workout_session_id: "w3" })], [set("s1"), set("s2", { performed_exercise_id: "p2" }), set("s3", { performed_exercise_id: "p3" })], [exercise])[0];
    expect(result.points.map(p => p.workoutId)).toEqual(["w1", "w2", "w3"]);
    expect(result.records.maxWeight?.point.workoutId).toBe("w1");
    expect(result.points[2].performedAt).toBeNull();
  });
  it("zachowuje projekcję dnia/strefy i jawne statusy, pending/skipped bez punktów", () => {
    for (const status of ["in_progress", "abandoned", "completed"]) {
      const result = analyzeProgress([workout("w1", { status, performed_on: "2026-09-30", performed_at: "2026-10-01T00:30:00Z", time_zone: "America/Los_Angeles" })], [block()], [set("s1")], [exercise])[0];
      expect(result.points[0]).toMatchObject({ date: "2026-09-30", status, timeZone: "America/Los_Angeles" });
    }
    expect(analyze([set("s1", { status: "pending" }), set("s2", { status: "skipped" })]).points).toHaveLength(0);
  });
  it.each([
    { source_kind: "extra" }, { target_load_type_snapshot: "bodyweight" }, { target_dumbbell_basis_snapshot: "per_hand" },
    { target_kind_snapshot: null }, { target_duration_seconds_snapshot: 30 }, { target_distance_meters_snapshot: 0 },
    { actual_duration_seconds: 0 }, { actual_distance_meters: 400 }, { actual_kg: -1 },
  ])("wyklucza nieporównywalne obciążenie lub czas/dystans %j", overrides => {
    expect(analyze([set("s1", overrides)]).records.maxWeight).toBeNull();
  });
  it("hantle muszą mieć sumę i nie przeliczają się same", () => {
    const dumbbell = { ...exercise, equipment: "hantle" };
    expect(analyze([set("s1")], dumbbell).records.volume).toBeNull();
    expect(analyze([set("s1", { target_dumbbell_basis_snapshot: "total", actual_kg: 40 })], dumbbell).records.volume?.measurement.value).toBe(120);
  });
  it("masa ciała wymaga zgodnego katalogu i jednoznacznych snapshotów bez kg", () => {
    const bodyweight = { ...exercise, load_mode: "bodyweight", name: "Podciąganie" };
    const bodySet = set("s1", { target_load_type_snapshot: "bodyweight", target_bodyweight_adjustment_snapshot: "none", actual_kg: null, actual_reps: 8 });
    const result = analyze([bodySet, { ...bodySet, id: "s2", actual_reps: 0 }], bodyweight);
    expect(result.records.maxReps?.measurement.value).toBe(8); expect(result.records.totalReps?.measurement.value).toBe(8); expect(result.records.setCount?.measurement.value).toBe(2);
    expect(result.records.volume).toBeNull();
    for (const overrides of [{ target_bodyweight_adjustment_snapshot: null }, { target_bodyweight_adjustment_snapshot: "additional", target_bodyweight_delta_kg_snapshot: 10 }, { actual_kg: 0 }, { actual_reps: null }]) expect(analyze([{ ...bodySet, ...overrides }], bodyweight).records.maxReps).toBeNull();
    expect(analyze([bodySet], { ...bodyweight, load_mode: "assisted" }).records.maxReps).toBeNull();
  });
  it("nie łączy wariantów po nazwie i przelicza korektę bez mutowania wejścia", () => {
    const original = [set("s1")], snapshot = JSON.stringify(original);
    expect(analyze(original).records.volume?.measurement.value).toBe(300);
    expect(analyze([set("s1", { actual_reps: 5 })]).records.volume?.measurement.value).toBe(500);
    expect(JSON.stringify(original)).toBe(snapshot);
    const variants = analyzeProgress([workout()], [block(), block("p2", { exercise_id: "e2" })], [set("s1"), set("s2", { performed_exercise_id: "p2", actual_kg: 200 })], [exercise, { ...exercise, id: "e2", variant: "front" }]);
    expect(variants.map(e => e.records.maxWeight?.measurement.value)).toEqual([100, 200]);
    const shared = analyzeProgress([workout()], [block(), block("p2", { exercise_id: "e2" })], [set("s1"), set("s2", { performed_exercise_id: "p2", actual_kg: 200 })], [{ ...exercise, identityId: "same", identityName: "Przysiad" }, { ...exercise, id: "e2", identityId: "same", identityName: "Przysiad" }]);
    expect(shared).toHaveLength(1);
    expect(shared[0].exercise.name).toBe("Przysiad");
    expect(shared[0].records.maxWeight?.measurement.value).toBe(200);
  });
  it("kalendarzowe miesiące, rok przestępny i przesunięcie dat", () => {
    expect(subtractMonths("2026-03-31", 1)).toBe("2026-02-28");
    expect(subtractMonths("2024-03-31", 1)).toBe("2024-02-29");
    expect(periodRange("1y", "2024-02-29").from).toBe("2023-02-28");
    expect(periodRange("all", "2026-10-18", "2020-01-01")).toEqual({ from: "2020-01-01", to: "2026-10-18" });
    expect(moveRange({ from: "2026-10-01", to: "2026-10-11" }, .5)).toEqual({ from: "2026-10-06", to: "2026-10-16" });
  });
});

import { describe, expect, it } from "vitest";
import { summarizeProgress, type ProgressSet } from "./summary";

const workouts = [
  { id: "w1", performed_on: "2026-10-01", status: "completed", created_at: "2026-10-01" },
  { id: "w2", performed_on: "2026-10-08", status: "completed", created_at: "2026-10-08" },
];
const exercises = [
  { id: "e1", name: "Przysiad", variant: "high bar", equipment: "sztanga", load_mode: "external" },
  { id: "e2", name: "Przysiad", variant: "front", equipment: "sztanga", load_mode: "external" },
  { id: "e3", name: "Podciąganie", variant: "asysta", equipment: null, load_mode: "assisted" },
];
const performed = [
  { id: "p1", workout_session_id: "w1", exercise_id: "e1", target_name_snapshot: "Przysiad", source_kind: "planned", position: 1 },
  { id: "p2", workout_session_id: "w2", exercise_id: "e1", target_name_snapshot: "Przysiad", source_kind: "planned", position: 1 },
  { id: "p3", workout_session_id: "w2", exercise_id: "e2", target_name_snapshot: "Przysiad", source_kind: "planned", position: 2 },
  { id: "p4", workout_session_id: "w2", exercise_id: "e3", target_name_snapshot: "Podciąganie", source_kind: "planned", position: 3 },
];
const set = (performed_exercise_id: string, status: string, actual_reps: number | null, actual_kg: number | null,
  target_load_type_snapshot = "absolute", target_dumbbell_basis_snapshot: string | null = null): ProgressSet =>
  ({ performed_exercise_id, source_kind: "planned", status, actual_reps, actual_kg,
    target_load_type_snapshot, target_dumbbell_basis_snapshot });
const sets = [
  set("p1", "completed", 5, 100), // 500
  set("p1", "completed", 4, 110), // 440; razem 940
  set("p1", "skipped", null, null),
  set("p2", "completed", 6, 105), // 630
  set("p2", "completed", 8, 20, "bodyweight"), // wykluczone
  set("p2", "completed", 10, 20, "absolute", "per_hand"), // wykluczone
  set("p3", "completed", 3, 70), // osobny wariant: 210
  set("p4", "completed", 8, 30, "bodyweight"), // asysta: wykluczone
];

describe("postęp z wykonanych serii", () => {
  it("nie wymaga opcjonalnej serii do pełnej realizacji, ale uwzględnia jej wykonanie", () => {
    const optional = [set("p1", "completed", 5, 100), { ...set("p1", "pending", null, null), target_optional_snapshot: true }];
    const result = summarizeProgress(workouts, performed, optional, exercises);
    expect(result.sessions.find((row) => row.id === "w1")).toMatchObject({ planned: 1, completedPlanned: 1 });
    const completed = summarizeProgress(workouts, performed, [optional[0], { ...optional[1], status: "completed", actual_reps: 3, actual_kg: 100 }], exercises);
    expect(completed.entries.find((row) => row.workoutId === "w1")?.volumeKg).toBe(800);
  });
  it("liczy ręcznie znane objętości i zachowuje warianty osobno", () => {
    const result = summarizeProgress(workouts, performed, sets, exercises);
    expect(result.entries.find((row) => row.workoutId === "w1" && row.exerciseId === "e1"))
      .toMatchObject({ volumeKg: 940, volumeSets: 2, completed: 2, skipped: 1, planned: 3 });
    expect(result.entries.find((row) => row.workoutId === "w2" && row.exerciseId === "e1"))
      .toMatchObject({ volumeKg: 630, volumeSets: 1, completed: 3, planned: 3 });
    expect(result.entries.find((row) => row.exerciseId === "e2")).toMatchObject({ volumeKg: 210, variant: "front" });
    expect(result.entries.find((row) => row.exerciseId === "e3")).toMatchObject({ volumeKg: 0, volumeSets: 0 });
    expect(result.sessions.find((row) => row.id === "w1")).toMatchObject({ completedPlanned: 2, planned: 3, skipped: 1 });
  });

  it("przelicza po poprawce historycznej serii i nie tworzy rekordu 1RM", () => {
    const corrected = sets.map((item, index) => index === 0 ? { ...item, actual_reps: 7 } : item);
    const result = summarizeProgress(workouts, performed, corrected, exercises);
    expect(result.entries.find((row) => row.workoutId === "w1" && row.exerciseId === "e1")?.volumeKg).toBe(1140);
    expect(result).not.toHaveProperty("oneRepMax");
  });
});

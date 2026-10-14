import { describe, expect, it } from "vitest";
import { emptyDocument, parsePlanEditorDocument } from "./plan-editor";
import { calculatePercentTarget, selectApplicableOneRepMax } from "./model";

describe("T04 — edycja planu i 1RM", () => {
  it("waliduje A/B z rampą, superserią, różnymi seriami i brakiem maksimum", () => {
    const document = emptyDocument();
    document.name = "A/B";
    for (const day of document.sessions) day.exercises[0].name = "Przysiad";
    const first = document.sessions[0].exercises[0];
    first.supersetGroup = "S1";
    first.sets[0].kind = "ramp";
    first.sets[0].repsMin = 8;
    first.sets[0].loadType = "percent_1rm";
    first.sets[0].targetPercent = 60;
    first.sets.push({ ...first.sets[0], position: 2, kind: "work", repsMin: 6, targetPercent: 75 });
    expect(parsePlanEditorDocument(document).sessions[0].exercises[0].sets).toHaveLength(2);
    expect(calculatePercentTarget(75, null, 2.5).roundedTargetKg).toBeNull();
    expect(() => parsePlanEditorDocument({ ...document, sessions: [{ ...document.sessions[0], exercises: [{ ...first, sets: [{ ...first.sets[0], position: 2 }] }] }] })).toThrow();
  });

  it("wybiera historyczne maksimum z daty i zaokrągla remis w dół", () => {
    const exerciseId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const records = [
      { id: "old", exerciseId, valueKg: 120, effectiveOn: "2026-01-01", createdAt: "2026-01-01T10:00:00Z" },
      { id: "new", exerciseId, valueKg: 123, effectiveOn: "2026-06-01", createdAt: "2026-06-01T10:00:00Z" },
    ];
    expect(calculatePercentTarget(75, selectApplicableOneRepMax(records, exerciseId, "2026-05-01"), 2.5).roundedTargetKg).toBe(90);
    expect(calculatePercentTarget(75, selectApplicableOneRepMax(records, exerciseId, "2026-06-01"), 2.5).roundedTargetKg).toBe(92.5);
    expect(calculatePercentTarget(50, { ...records[0], valueKg: 122.5 }, 2.5).roundedTargetKg).toBe(60);
  });

  it("przyjmuje identyfikator istniejącego ćwiczenia przy publikacji nowej wersji", () => {
    const document = emptyDocument();
    document.name = "Plan";
    for (const day of document.sessions) {
      day.exercises[0].name = "Przysiad";
      day.exercises[0].exerciseId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    }
    expect(parsePlanEditorDocument(document).sessions[0].exercises[0].exerciseId).toBe(document.sessions[0].exercises[0].exerciseId);
  });
});

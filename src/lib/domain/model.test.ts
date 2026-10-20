import { describe, expect, it } from "vitest";
import {
  calculatePercentTarget, checkMutationReceipt, checkRevision, createSessionTargetSnapshot,
  parseMutationCommand, parseOneRepMax, parsePerformedSet, parsePlan, parsePlanVersion,
  parsePlannedSet, selectApplicableOneRepMax,
  type OneRepMaxRecord,
} from "./model";

const planned = {
  position: 1, kind: "ramp", repsMin: 5, repsMax: 5, isAmrap: false,
  loadType: "percent_1rm", targetKg: null, targetPercent: 75,
  bodyweightAdjustment: null, bodyweightDeltaKg: null, dumbbellBasis: null,
  durationSeconds: null, distanceMeters: null, restSeconds: 120,
  tempo: null, targetRpe: null, targetRir: null, note: null,
};
const max: OneRepMaxRecord = {
  id: "max-a", exerciseId: "squat", valueKg: 123,
  effectiveOn: "2026-10-01", createdAt: "2026-10-01T10:00:00Z",
};

describe("kontrakty domenowe T02", () => {
  it("reprezentuje rampę, brak 1RM i historyczny cel", () => {
    const set = parsePlannedSet(planned);
    expect(set.kind).toBe("ramp");
    expect(createSessionTargetSnapshot("set-1", "squat", set, null, 2.5).roundedTargetKg).toBeNull();
    const snapshot = createSessionTargetSnapshot("set-1", "squat", set, max, 2.5);
    expect(snapshot).toMatchObject({ oneRepMaxRecordId: "max-a", oneRepMaxKg: 123, rawTargetKg: 92.25, roundedTargetKg: 92.5 });
    expect(() => createSessionTargetSnapshot("set-1", "bench", set, max, 2.5)).toThrow();
    max.valueKg = 130;
    expect(snapshot.oneRepMaxKg).toBe(123);
    expect(snapshot.roundedTargetKg).toBe(92.5);
  });

  it("wybiera rekord maksimum tego samego ćwiczenia obowiązujący w dacie treningu", () => {
    const records: OneRepMaxRecord[] = [max,
      { id: "future", exerciseId: "squat", valueKg: 150, effectiveOn: "2026-11-01", createdAt: "2026-11-01T10:00:00Z" },
      { id: "other", exerciseId: "bench", valueKg: 200, effectiveOn: "2026-09-01", createdAt: "2026-09-01T10:00:00Z" },
    ];
    expect(selectApplicableOneRepMax(records, "squat", "2026-10-11")?.id).toBe("max-a");
    expect(selectApplicableOneRepMax([
      { id: "older", exerciseId: "squat", valueKg: 100, effectiveOn: "2026-01-01", createdAt: "2026-01-01T00:00:00Z" },
      { id: "sibling", exerciseId: "bench", valueKg: 140, effectiveOn: "2026-08-01", createdAt: "2026-08-01T00:00:00Z" },
    ], "squat", "2026-10-11", ["bench"])?.id).toBe("sibling");
    expect(selectApplicableOneRepMax(records, "deadlift", "2026-10-11")).toBeNull();
    expect(() => selectApplicableOneRepMax(records, "squat", "2026-02-30")).toThrow();
  });

  it("zaokrągla remis w dół i odrzuca niewłaściwy procent", () => {
    expect(calculatePercentTarget(50, { ...max, valueKg: 125 }, 2.5).roundedTargetKg).toBe(62.5);
    expect(calculatePercentTarget(50, { ...max, valueKg: 122.5 }, 2.5).roundedTargetKg).toBe(60);
    expect(() => calculatePercentTarget(0, max, 2.5)).toThrow();
  });

  it("odróżnia brak od zera i odrzuca konflikt kg z procentem", () => {
    expect(parsePlannedSet({ ...planned, loadType: "absolute", targetKg: 0, targetPercent: null }).targetKg).toBe(0);
    expect(() => parsePlannedSet({ ...planned, targetKg: 90 })).toThrow();
    expect(() => parsePlannedSet({ ...planned, repsMin: null, repsMax: 5 })).toThrow();
    expect(() => parsePlannedSet({ ...planned, targetPercent: null })).toThrow();
  });

  it("waliduje plan, wersję, rzeczywiste maksimum i obciążenie masą ciała", () => {
    const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    expect(parsePlan({ name: "A/B", status: "draft", currentVersionId: null }).status).toBe("draft");
    expect(() => parsePlan({ name: "A/B", status: "active", currentVersionId: null })).toThrow();
    expect(parsePlanVersion({ planId: id, versionNumber: 1, state: "published", publishedAt: "2026-10-11T10:00:00Z" }).state).toBe("published");
    expect(() => parsePlanVersion({ planId: id, versionNumber: 1, state: "published", publishedAt: null })).toThrow();
    expect(parseOneRepMax({ exerciseId: id, valueKg: 123, effectiveOn: "2026-10-11", note: null }).valueKg).toBe(123);
    expect(() => parseOneRepMax({ exerciseId: id, valueKg: 123, effectiveOn: "2026-02-30", note: null })).toThrow();
    expect(parsePlannedSet({ ...planned, loadType: "bodyweight", targetPercent: null, bodyweightAdjustment: "assistance", bodyweightDeltaKg: 20 }).bodyweightDeltaKg).toBe(20);
    expect(() => parsePlannedSet({ ...planned, loadType: "bodyweight", targetPercent: null, bodyweightAdjustment: "assistance", bodyweightDeltaKg: null })).toThrow();
  });

  it("dopuszcza serię dodatkową i wymaga jawnego wyniku ukończonej serii", () => {
    const extra = { sourceKind: "extra", status: "completed", actualReps: 0, actualKg: 0,
      actualDurationSeconds: null, actualDistanceMeters: null, actualRpe: null, actualRir: null, actualNote: null };
    expect(parsePerformedSet(extra).actualReps).toBe(0);
    expect(() => parsePerformedSet({ ...extra, actualReps: null, actualKg: null })).toThrow();
    expect(() => parsePerformedSet({ ...extra, status: "skipped" })).toThrow();
    expect(parsePerformedSet({ ...extra, status: "skipped", actualReps: null, actualKg: null }).status).toBe("skipped");
  });

  it("sprawdza rewizję i odróżnia retry od konfliktu idempotencji", () => {
    const operation = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    expect(parseMutationCommand({ clientOperationId: operation, expectedRevision: 2, payload: {} }).expectedRevision).toBe(2);
    expect(() => parseMutationCommand({ clientOperationId: operation, expectedRevision: -1, payload: {} })).toThrow();
    expect(checkRevision(2, 2)).toBe(true);
    expect(checkRevision(3, 2)).toBe(false);
    expect(checkMutationReceipt(null, "a")).toBe("new");
    expect(checkMutationReceipt({ payloadHash: "a" }, "a")).toBe("retry");
    expect(checkMutationReceipt({ payloadHash: "a" }, "b")).toBe("conflict");
  });
});

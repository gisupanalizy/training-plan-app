import { describe, it, expect } from "vitest";
import { projectWorkoutTime, inWorkoutDateRange } from "./time";

describe("projekcja czasu T13-A", () => {
  it("zachowuje date-only niezależnie od strefy", () => {
    expect(projectWorkoutTime({ performed_on: "2024-02-29", performed_at: null }, "Pacific/Honolulu"))
      .toEqual({ performedOn: "2024-02-29", performedAt: null, timeZone: "Pacific/Honolulu", timeKnown: false });
  });
  it.each([
    ["2026-10-16T22:30:00Z", "Europe/Warsaw", "2026-10-17"],
    ["2026-10-16T22:30:00Z", "Pacific/Honolulu", "2026-10-16"],
    ["2025-12-31T23:30:00Z", "Europe/Warsaw", "2026-01-01"],
    ["2026-03-29T00:30:00Z", "Europe/Warsaw", "2026-03-29"],
    ["2026-03-29T01:30:00Z", "Europe/Warsaw", "2026-03-29"],
    ["2025-10-26T00:30:00Z", "Europe/Warsaw", "2025-10-26"],
    ["2025-10-26T01:30:00Z", "Europe/Warsaw", "2025-10-26"],
  ])("rzutuje %s w %s", (performed_at, zone, date) => {
    expect(projectWorkoutTime({ performed_on: "2000-01-01", performed_at }, zone).performedOn).toBe(date);
  });
  it("stosuje wyłączny koniec zakresu miesiąca", () => {
    expect(inWorkoutDateRange("2024-02-29", "2024-02-01", "2024-03-01")).toBe(true);
    expect(inWorkoutDateRange("2024-03-01", "2024-02-01", "2024-03-01")).toBe(false);
  });
});

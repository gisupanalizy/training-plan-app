import { describe, expect, it } from "vitest";
import type { WorkoutRow } from "./contracts";
import { calendarDays, calendarSelection, calendarTimeLabel, calendarWorkoutHref, historyCalendarData, shiftCalendarDay, shiftCalendarMonth } from "./calendar";
const row = (id: string, at: string | null, day = "2026-10-25", status = "completed"): WorkoutRow => ({ id, performed_at: at, performed_on: day, status, revision: 1, name: id, plan_session_id: null, plan_version_id: null, comment: null, completed_at: null, created_at: "2026-01-01T00:00:00Z" });
describe("Kalendarz historii", () => {
  it("odrzuca błędne daty, duplikaty query i niezgodny miesiąc, zachowuje rok przestępny", () => {
    expect(calendarSelection("2024-02", "2024-02-29", "2026-10-19")).toEqual({ month:"2024-02", day:"2024-02-29" });
    for (const [month, day] of [["2025-02","2025-02-29"],["2024-03","2024-02-29"],[["2024-02"],"2024-02-29"],["2024-02",["2024-02-29"]],["https://example.invalid", "bad"]]) expect(calendarSelection(month,day,"2026-10-19")).toEqual({month:"2026-10",day:"2026-10-19"});
  });
  it("układa pełne tygodnie od poniedziałku, zachowuje granice miesięcy i roku", () => {
    const october = calendarDays("2026-10");
    expect(october.slice(0,4)).toEqual([null,null,null,"2026-10-01"]);
    expect(october.indexOf("2026-10-04")%7).toBe(6);
    expect(october.length%7).toBe(0);
    expect(calendarDays("2024-02").filter(Boolean)).toHaveLength(29);
    expect(calendarDays("2025-02").filter(Boolean)).toHaveLength(28);
    expect(shiftCalendarMonth("2024-01-31",1)).toBe("2024-02-29");
    expect(shiftCalendarMonth("2026-12-31",1)).toBe("2027-01-31");
    expect(shiftCalendarMonth("2026-01-31",-1)).toBe("2025-12-31");
    expect(shiftCalendarDay("2026-12-31",1)).toBe("2027-01-01");
  });
  it("przelicza północ/strefę/DST, zachowuje date-only i rozróżnia dwie sesje tej samej godziny", () => {
    const rows = [row("night","2026-10-31T23:30:00Z"),row("dst1","2026-10-25T00:30:00Z"),row("dst2","2026-10-25T01:30:00Z"),row("legacy",null),row("active",null,"2026-10-25","in_progress"),row("abandoned",null,"2026-10-25","abandoned")];
    const warsaw=historyCalendarData(rows,"Europe/Warsaw");
    expect(warsaw.completed.find(w=>w.id==="night")?.performedOn).toBe("2026-11-01");
    expect(warsaw.completed.filter(w=>w.performedOn==="2026-10-25")).toHaveLength(3);
    expect(warsaw.active.map(w=>w.id)).toEqual(["active"]);
    expect(calendarTimeLabel(warsaw.completed.find(w=>w.id==="legacy")!)).toBe("godzina nieznana");
    expect(warsaw.completed.filter(w=>w.id.startsWith("dst")).map(calendarTimeLabel)).toEqual(["02:30","02:30"]);
    const la=historyCalendarData(rows,"America/Los_Angeles");
    expect(la.completed.find(w=>w.id==="night")?.performedOn).toBe("2026-10-31");
    expect(la.completed.find(w=>w.id==="legacy")?.performedOn).toBe("2026-10-25");
    expect(calendarWorkoutHref("abc","2026-10","2026-10-25")).toBe("/trening/abc?historyMonth=2026-10&historyDay=2026-10-25");
  });
});

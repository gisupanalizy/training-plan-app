import { describe, expect, it } from "vitest";
import { mergeDraftParts, pdfPartRanges } from "./parts";

const draft = (name: string, day: string, exercise: string) => ({
  schema_version: 2, name, warnings: [], unresolved_fields: [{ path: "sessions.0.exercises.0", reason: "sprawdź" }],
  sessions: [{ week_number: 1, day_label: day, note: null, exercises: [{ name: exercise }] }],
});

describe("części PDF", () => {
  it("dzieli 20 stron na części po dwie i zachowuje numery", () => {
    const parts = pdfPartRanges(20);
    expect(parts).toHaveLength(10);
    expect(parts[0]).toEqual({ partIndex: 0, pageFrom: 1, pageTo: 2 });
    expect(parts.at(-1)).toEqual({ partIndex: 9, pageFrom: 19, pageTo: 20 });
    expect(pdfPartRanges(21)).toHaveLength(11);
  });

  it("scala części bez dublowania identycznego dnia", () => {
    const first = draft("Plan", "A", "Przysiad");
    const merged = mergeDraftParts([first, first, draft("Plan", "B", "Wyciskanie")]);
    expect(merged.sessions).toHaveLength(2);
    expect(mergeDraftParts([merged, merged]).sessions).toHaveLength(2);
  });
});

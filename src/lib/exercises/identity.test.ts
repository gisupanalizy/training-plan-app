import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { exerciseNames } from "./names";
import { applyExactIdentity, applySuggestionResult, clearIdentityOnMeaningChange, confirmIdentity, contextConflicts, decisionCandidates, exactCatalogMatch, identityProposalOpen, keepCustomIdentity } from "./identity";
import { emptySet, type PlanEditorExercise } from "@/lib/domain/plan-editor";

const exercise = (patch: Partial<PlanEditorExercise> = {}): PlanEditorExercise => ({
  exerciseId: null, name: "Bench press", originalName: null, variant: null, equipment: null, supersetGroup: null, note: null, sets: [emptySet(1)], ...patch,
});

describe("tożsamość ćwiczenia", () => {
  it("łączy polską i angielską nazwę tego samego ruchu", () => {
    const english = applyExactIdentity(exercise());
    const polish = applyExactIdentity(exercise({ name: "Wyciskanie sztangi leżąc" }));
    expect(english.canonicalKey).toBe("bench-press");
    expect(polish.canonicalKey).toBe("bench-press");
    expect(english.name).toBe("Wyciskanie sztangi leżąc");
    expect(english.originalName).toBe("Bench press");
  });

  it("parafraza bez dokładnego aliasu zostaje propozycją, a nie zapisem", () => {
    expect(exactCatalogMatch("wyciskanie leżąc na ławce")).toBeNull();
    const proposed = applySuggestionResult(exercise({ name: "wyciskanie leżąc na ławce" }), { source: "decision", key: "bench-press" });
    expect(proposed.assignment).toBe("unresolved");
    expect(proposed.canonicalKey).toBeNull();
    expect(identityProposalOpen(proposed)).toBe(true);
    const confirmed = confirmIdentity(proposed, exerciseNames.find((item) => item.key === "bench-press")!);
    expect(confirmed.assignment).toBe("confirmed_decision");
    expect(confirmed.name).toBe("Wyciskanie sztangi leżąc");
    expect(confirmed.recordAlias).toBe(true);
    expect(identityProposalOpen(confirmed)).toBe(false);
  });

  it("none i odmowa modelu nie przypisują klucza", () => {
    const kept = applySuggestionResult(exercise({ name: "ruch własny" }), null);
    expect(kept.canonicalKey).toBeUndefined();
    expect(decisionCandidates("zzzz qqqq")).toEqual([]);
  });

  it("nie skleja innego sprzętu, chwytu, asysty, pauzy ani nazwy złożonej", () => {
    expect(exactCatalogMatch("Bench press", null, "hantle")).toBeNull();
    expect(exactCatalogMatch("Pull up", "z gumą")).toBeNull();
    expect(exactCatalogMatch("Podciąganie nachwytem", "podchwyt")).toBeNull();
    expect(exactCatalogMatch("Wyciskanie sztangi leżąc", "pauza")).toBeNull();
    expect(decisionCandidates("Martwy ciąg z hantlami / sztangą")).toEqual([]);
    expect(contextConflicts({ equipment: "sztanga" }, null, "hantle")).toBe(true);
    expect(contextConflicts({ equipment: "sztanga" }, null, null)).toBe(false);
  });

  it("migracja zawiera każdy klucz sprawdzonego słownika", () => {
    const sql = readFileSync("supabase/migrations/20261020170000_t12k_exercise_identity.sql", "utf8");
    for (const item of exerciseNames) expect(sql).toContain(`'${item.key}'`);
  });

  it("zmiana znaczenia czyści przypisanie, a własna nazwa zostaje customem", () => {
    const assigned = applyExactIdentity(exercise());
    const changed = clearIdentityOnMeaningChange(assigned, { equipment: "hantle" });
    expect(changed.canonicalKey).toBeNull();
    expect(changed.assignment).toBeNull();
    const custom = keepCustomIdentity(changed);
    expect(custom.assignment).toBe("custom");
    expect(applyExactIdentity(custom).canonicalKey).toBeNull();
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { parseDecisionId, suggestExercises } from "./decisions";

afterEach(() => {
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.AI_GATEWAY_DECISIONS_ENABLED;
  delete process.env.AI_GATEWAY_DECISIONS_BUDGET_USD;
});

describe("sugestie Decisions", () => {
  it("bez konfiguracji zostawia ręczny wybór i nie woła modelu", async () => {
    let called = false;
    const result = await suggestExercises([{ id: "1", name: "wyciskanie leżąc na ławce" }], [], async () => { called = true; return new Response("{}"); });
    expect(called).toBe(false);
    expect(result.results[0].source).toBeNull();
  });

  it("błąd modelu nie blokuje wyniku", async () => {
    process.env.AI_GATEWAY_API_KEY = "test";
    process.env.AI_GATEWAY_DECISIONS_ENABLED = "true";
    process.env.AI_GATEWAY_DECISIONS_BUDGET_USD = "1";
    const result = await suggestExercises([{ id: "1", name: "wyciskanie leżąc na ławce" }], [], async () => { throw new Error("timeout"); });
    expect(result.results[0]).toMatchObject({ source: null, aiError: true });
  });

  it("odrzuca none i klucz spoza listy", () => {
    expect(parseDecisionId({ decision: "none" }, new Set(["bench-press"]))).toBeNull();
    expect(parseDecisionId({ decision: { id: "deadlift" } }, new Set(["bench-press"]))).toBeNull();
    expect(parseDecisionId({ decision: "bench-press" }, new Set(["bench-press"]))).toBe("bench-press");
  });
});

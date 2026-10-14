import { expect, test } from "vitest";
import { parseVoiceProposal, type VoiceProposal } from "./domain";
import { examples } from "./cases";

const base: VoiceProposal = { intent: "set", reps: null, kg: null, series: null, name: null, variant: null, comment: null, question: null };


test("20 syntetycznych polskich wypowiedzi zachowuje kontrakt propozycji; odpowiedzi modelu są mockami", () => {
  for (const example of examples) {
    expect(example.speech.length).toBeGreaterThan(0);
    const proposal = { ...base, intent: example.intent, ...example.proposal };
    expect(parseVoiceProposal(proposal, example.intent)).toEqual(proposal);
  }
});

test("pyta o brakujące serie zamiast zgadywać; odrzuca ujemne wartości i obcy typ", () => {
  expect(parseVoiceProposal({ ...base, intent: "exercise", name: "Pompki", series: 3, reps: null }, "exercise")).toMatchObject({ intent: "clarify", reps: null, series: null });
  expect(() => parseVoiceProposal({ ...base, reps: -1, kg: 100 }, "set")).toThrow();
  expect(() => parseVoiceProposal({ ...base, intent: "comment", comment: "Dopisz" }, "set")).toThrow();
});

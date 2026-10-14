export type VoiceIntent = "set" | "comment" | "exercise" | "clarify";
export type VoiceProposal = {
  intent: VoiceIntent;
  reps: number | null;
  kg: number | null;
  series: number | null;
  name: string | null;
  variant: string | null;
  comment: string | null;
  question: string | null;
};

export const VOICE_SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    intent: { type: "string", enum: ["set", "comment", "exercise", "clarify"] },
    reps: { type: ["integer", "null"] }, kg: { type: ["number", "null"] },
    series: { type: ["integer", "null"] }, name: { type: ["string", "null"] },
    variant: { type: ["string", "null"] }, comment: { type: ["string", "null"] },
    question: { type: ["string", "null"] },
  },
  required: ["intent", "reps", "kg", "series", "name", "variant", "comment", "question"],
};

export function parseVoiceProposal(value: unknown, expected: Exclude<VoiceIntent, "clarify">): VoiceProposal {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Niepoprawna propozycja głosowa.");
  const v = value as Record<string, unknown>;
  const nullableText = (x: unknown, max: number) => x === null || (typeof x === "string" && x.length <= max);
  const number = (x: unknown, max: number, integer: boolean) => x === null ||
    (typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= max && (!integer || Number.isInteger(x)));
  if (![expected, "clarify"].includes(v.intent as string) || !number(v.reps, 1000, true) ||
    !number(v.kg, 10000, false) || !number(v.series, 30, true) ||
    !nullableText(v.name, 150) || !nullableText(v.variant, 120) ||
    !nullableText(v.comment, 2000) || !nullableText(v.question, 300)) throw new Error("Niepoprawne pola propozycji głosowej.");
  const clarify = (question: string): VoiceProposal => ({ intent: "clarify", reps: null, kg: null, series: null,
    name: null, variant: null, comment: null, question });
  if (v.intent === "set" && v.reps === null && v.kg === null) return clarify("Powtórz wynik serii.");
  if (v.intent === "comment" && !(v.comment as string | null)?.trim()) return clarify("Powtórz komentarz.");
  if (v.intent === "exercise" && (!(v.name as string | null)?.trim() || !v.series || v.reps === null))
    return clarify("Podaj nazwę ćwiczenia, liczbę serii i powtórzenia.");
  return v as VoiceProposal;
}

// @vitest-environment node
import { test, expect } from "vitest";
import { loadEnvConfig } from "@next/env";
import { writeFile, mkdtemp, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { examples } from "./cases";
import { interpretPlan, interpretWorkout, transcribe, VOICE_AUDIO_MODEL, VOICE_PROMPT_VERSION, VOICE_TEXT_MODEL,
  type VoiceUsage } from "./openai";

const live = process.env.RUN_T09_LIVE === "true";
function equivalentField(key: string, actual: unknown, expected: unknown) {
  if (["comment", "name", "variant"].includes(key) && typeof actual === "string" && typeof expected === "string") {
    const normalize = (value: string) => value.trim().toLocaleLowerCase("pl-PL").replace(/[.!?]+$/u, "").replace(/\s+/gu, " ");
    return normalize(actual) === normalize(expected);
  }
  return actual === expected;
}
test.skipIf(!live)("prawdziwe syntetyczne próby T09 po osobnym uzgodnieniu budżetu", async () => {
  loadEnvConfig(process.cwd());
  if (!process.env.OPENAI_API_KEY || Number(process.env.T09_LIVE_BUDGET_USD) < 0.1)
    throw new Error("Wymagane: lokalny klucz i uzgodniony budżet T09_LIVE_BUDGET_USD.");
  const measurements: { index: number; ok: boolean; elapsedMs: number; inputTokens: number | null;
    outputTokens: number | null; mismatches?: string[]; actual?: Record<string, unknown>; error?: string }[] = [];
  for (let start = 0; start < examples.length; start += 4) {
    const batch = examples.slice(start, start + 4);
    await Promise.all(batch.map(async (item, offset) => {
      const started = performance.now(); let usage: VoiceUsage = { inputTokens: null, outputTokens: null };
      try {
        const actual = await interpretWorkout(item.speech, item.intent, AbortSignal.timeout(45_000), (value) => { usage = value; });
        const mismatches = Object.entries(item.proposal).filter(([key, expected]) => key === "question" && item.proposal.intent === "clarify" ?
          typeof actual.question !== "string" || !actual.question.trim() : !equivalentField(key, actual[key as keyof typeof actual], expected)).map(([key]) => key);
        measurements.push({ index: start + offset + 1, ok: mismatches.length === 0, elapsedMs: Math.round(performance.now() - started),
          ...usage, ...(mismatches.length ? { mismatches, actual } : {}) });
      } catch (error) { measurements.push({ index: start + offset + 1, ok: false, elapsedMs: Math.round(performance.now() - started), ...usage,
        error: (error as Error).message.slice(0, 100) }); }
    }));
  }
  const planStarted = performance.now(); let planUsage: VoiceUsage = { inputTokens: null, outputTokens: null };
  let planOk = false; let planError: string | null = null; let planSummary: unknown = null;
  try {
    const plan = await interpretPlan("Poniedziałek: przysiad cztery serie po sześć na 75 procent rzeczywistego maksa", AbortSignal.timeout(45_000),
      (value) => { planUsage = value; });
    planSummary = plan.document.sessions.map((day) => ({ name: day.dayLabel, exercises: day.exercises.map((exercise) => ({
      name: exercise.name, sets: exercise.sets.map((set) => ({ repsMin: set.repsMin, repsMax: set.repsMax,
        targetPercent: set.targetPercent, loadType: set.loadType })) })) }));
    planOk = plan.document.sessions.some((day) => day.exercises.some((exercise) => exercise.name.toLowerCase().includes("przysiad") &&
      exercise.sets.length === 4 && exercise.sets.every((set) => set.repsMin === 6 && set.targetPercent === 75)));
  } catch (error) { planError = (error as Error).message.slice(0, 100); }
  const planElapsedMs = Math.round(performance.now() - planStarted);
  const directory = await mkdtemp(join(tmpdir(), "t09-synthetic-"));
  const audio: { kind: string; ok: boolean; elapsedMs: number; durationSeconds: number; transcript?: string; error?: string }[] = [];
  try {
    const aiff = join(directory, "speech.aiff"); const clean = join(directory, "clean.webm"); const noisy = join(directory, "noisy.webm");
    execFileSync("say", ["-v", "Zosia", "-o", aiff, "Pięć powtórzeń, sto kilogramów."], { stdio: "ignore" });
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", aiff, "-c:a", "libopus", clean], { stdio: "ignore" });
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", aiff, "-f", "lavfi", "-i", "anoisesrc=color=pink:amplitude=0.02",
      "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first", "-c:a", "libopus", noisy], { stdio: "ignore" });
    for (const [kind, path] of [["syntetyczny_czysty", clean], ["syntetyczny_hałas", noisy]]) {
      const started = performance.now();
      const durationSeconds = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path], { encoding: "utf8" }).trim());
      try {
        const bytes = await readFile(path);
        const transcript = await transcribe(new File([bytes], `${kind}.webm`, { type: "audio/webm" }), AbortSignal.timeout(45_000));
        const ok = /(?:^|\W)(?:5|pięć)(?:\W|$)/i.test(transcript) && /(?:^|\W)(?:100|sto)(?:\W|$)/i.test(transcript);
        audio.push({ kind, ok, elapsedMs: Math.round(performance.now() - started), durationSeconds,
          ...(!ok ? { transcript: transcript.slice(0, 300) } : {}) });
      } catch (error) { audio.push({ kind, ok: false, elapsedMs: Math.round(performance.now() - started), durationSeconds, error: (error as Error).message.slice(0, 100) }); }
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
  const values = measurements.map((item) => item.elapsedMs).sort((a, b) => a - b);
  const audioValues = audio.map((item) => item.elapsedMs).sort((a, b) => a - b);
  const inputTokens = measurements.reduce((sum, item) => sum + (item.inputTokens ?? 0), 0) + (planUsage.inputTokens ?? 0);
  const outputTokens = measurements.reduce((sum, item) => sum + (item.outputTokens ?? 0), 0) + (planUsage.outputTokens ?? 0);
  const report = { date: "2026-10-12", kind: "real_openai_on_synthetic_sources", promptVersion: VOICE_PROMPT_VERSION,
    models: { transcription: VOICE_AUDIO_MODEL, interpretation: VOICE_TEXT_MODEL },
    workout: { passed: measurements.filter((item) => item.ok).length, total: examples.length,
      p50Ms: values[Math.floor(values.length * 0.5)], p95Ms: values[Math.floor(values.length * 0.95)], measurements },
    plan: { ok: planOk, elapsedMs: planElapsedMs, error: planError, ...(!planOk ? { summary: planSummary } : {}) },
    audio: { passed: audio.filter((item) => item.ok).length, total: audio.length,
      p50Ms: audioValues[Math.floor(audioValues.length * 0.5)], p95Ms: audioValues[Math.floor(audioValues.length * 0.95)], measurements: audio },
    usage: { inputTokens, outputTokens },
    estimatedUsd: Number(((inputTokens * 0.1 + outputTokens * 0.5) / 1_000_000 +
      audio.reduce((sum, item) => sum + item.durationSeconds, 0) / 60 * 0.0045).toFixed(6)),
    limitations: "Audio jest syntezą systemową, nie nagraniem z fizycznego mikrofonu; koszt jest oszacowaniem według taryfy, nie rachunkiem dostawcy.",
  };
  await writeFile("docs/reports/2026-10-12-T09-live.json", JSON.stringify(report, null, 2) + "\n");
  expect(measurements).toHaveLength(examples.length);
  expect(measurements.filter((item) => item.ok).length).toBeGreaterThanOrEqual(Math.ceil(examples.length * 0.95));
  expect(planOk).toBe(true);
  expect(audio.every((item) => item.ok)).toBe(true);
}, 420_000);
